# nchapman/Qwen3.5-2B-GLiDE-LoRA

## Resumen

Qwen3.5-2B-GLiDE-LoRA es un adaptador PEFT de tipo LoRA, con rango 128, publicado por el usuario nchapman sobre el modelo base Qwen/Qwen3.5-2B. No se trata de un modelo entrenado desde cero, sino de una extracción de los pesos de otro adaptador (fastino/GLiDE-2B) llevada a cabo mediante una descomposición SVD conjunta (Joint-SVD) con plegado exacto de ratios de columna de GemmaRMSNorm. El resultado se distribuye como un adaptador LoRA estándar más un sidecar de decisión (`CodeReadout`) que permite servirlo junto al modelo base en el motor de inferencia warp-34.

Su propósito es doble: por un lado, servir chat y completado causal convencional (con `lora_id = -1`); por otro, habilitar endpoints de decisión de alta precisión (`/v1/systemone` y `/v1/decisions`) mediante atención no causal completa y una cabeza de 255 vías. Es relevante porque demuestra una técnica de extracción y reempaquetado de adaptadores que preserva el comportamiento del modelo original sin necesidad de mantener dos motores cargados en memoria.

El adaptador se publica bajo licencia Apache 2.0, pesa 243,1 MB en BF16 y está pensado exclusivamente para inglés según los metadatos de la model card. El repositorio completo ocupa 0,3 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.5; incluye atencion linear y self-attention en el modelo base |
| Parametros totales | no disponible (adaptador LoRA de rango 128; el modelo base Qwen3.5-2B tiene 2B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 para el adaptador; el modelo base referenciado incluye una variante W4A16-HGPTQ |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`, `readout.safetensors`) |
| Rango LoRA | 128 |
| Libreria | peft |
| Tamano del repo | 0,3 GB |
| Modelo base | Qwen/Qwen3.5-2B y nchapman/Qwen3.5-2B-W4A16-HGPTQ |
| Motor de inferencia objetivo | warp-34 |

## Arquitectura y entrenamiento

El adaptador aplica LoRA sobre todas las proyecciones lineales del decodificador: `self_attn.{q,k,v,o}_proj`, `linear_attn.{in_proj_qkv, in_proj_z, in_proj_b, in_proj_a, out_proj}` y `mlp.{gate,up,down}_proj`. La innovación principal es el layout de proyecciones fusionadas con matriz A compartida: dentro de cada capa, los pares y tríos `(q_proj, k_proj, v_proj)`, `(in_proj_qkv, in_proj_z)`, `(in_proj_b, in_proj_a)` y `(gate_proj, up_proj)` comparten tensores `lora_A.weight` bit a bit idénticos, derivados de una factorización SVD conjunta. Esto permite que motores con GEMMs fusionados ejecuten un único shrink de rango 128 por proyección fusionada en lugar de 2r o 3r.

Además, los ratios de escala de `input_layernorm` y `post_attention_layernorm` se pliegan directamente en las columnas de `lora_A` posteriores, de modo que los pesos RMSNorm del modelo base permanecen intactos en tiempo de ejecución. El sidecar `decision_config.json` y `readout.safetensors` aporta una cabeza `CodeReadout` de 255 vías y metadatos de atención no causal completa (`quick-empty-think-medium-v1`) para el perfil `DecisionModelProfile` de warp-34. No se dispone de información sobre el dataset de entrenamiento original de GLiDE-2B, el número de tokens ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto causal y chat multi-turno con el adaptador activo.
- Modo de decisión de alta precisión mediante `CodeReadout` y atención no causal completa en los endpoints `/v1/systemone` y `/v1/decisions`.
- Clasificación de 255 vías a través de la cabeza `CodeReadout`.
- Ejecución dual desde un único motor cargado: chat general y decisiones sin recargar el modelo base.
- Compatibilidad con motores que soportan proyecciones fusionadas y shrink LoRA compartido (warp-34).
- Soporte de cuantización del modelo base en W4A16-HGPTQ junto al adaptador.
- Capacidades multilingües limitadas al inglés según los metadatos.

## Casos de uso

- Enrutamiento de decisiones en producción: el adaptador permite clasificar peticiones en 255 categorías mediante `CodeReadout` sin necesidad de un segundo modelo, reduciendo el consumo de VRAM en el servidor.
- Chat de atención al cliente: con `lora_id = -1` el adaptador sirve conversaciones causales estándar sobre Qwen3.5-2B, adecuado para entornos con presupuesto de memoria ajustado.
- Sistemas de moderación o triaje: el endpoint `/v1/decisions` con atención no causal completa permite evaluar el contexto completo de una petición antes de emitir una decisión, útil en filtrado de contenidos.
- Investigación en extracción de adaptadores: sirve como referencia reproducible de la técnica Joint-SVD con plegado de ratios de normalización, útil para equipos que quieran portar adaptadores entre motores de inferencia.
- Despliegue en hardware de gama media: al ser un adaptador de 243 MB sobre un base de 2B, cabe en GPUs de consumo con cuantización W4A16, lo que facilita prototipos locales de decisión.
- Pipelines de evaluación comparativa: la configuración dual chat/decisión simplifica la ejecución de benchmarks como JevBench sobre una sola instancia del motor warp-34.

## Benchmarks y rendimiento

Evaluación pública en JevBench (231 casos: 48 Easy, 72 Original, 111 Hard) sobre el dataset `kshitijthakkar/nirnaya-jevbench-public-eval-v1`:

| Configuracion | Overall | Easy (48) | Original (72) | Hard (111) | Mean NLL | Mean Brier |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Qwen3.5-2B + Qwen3.5-2B-GLiDE-LoRA (CodeReadout + noncausal_full_attention) | 190/231 (82,25 %) | 48/48 | 69/72 | 73/111 | 0,3907 | 0,2213 |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el adaptador en BF16 ocupa 243,1 MB adicionales sobre el modelo base. Con el base Qwen3.5-2B en BF16 se estiman en torno a 4-5 GB; con la variante W4A16-HGPTQ el consumo baja aproximadamente a 1,5-2 GB más el adaptador.
- GPU recomendadas: A100, H100 o L40S para servir el motor warp-34 con proyecciones fusionadas y atención no causal completa.
- GPU de consumo: cabe en RTX 4090, RTX 3090 y probablemente en RTX 4070 Ti o superiores si se usa la variante W4A16; no se dispone de cifras oficiales de latencia.
- Opciones de despliegue: el adaptador está diseñado específicamente para el motor warp-34. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, aunque al ser un adaptador PEFT estándar podría cargarse en frameworks que soporten LoRA sobre Qwen3.5.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
| --- | --- | --- | --- | --- | --- |
| Qwen3.5-2B-GLiDE-LoRA (este) | 2B base + LoRA r=128 | no disponible | apache-2.0 | safetensors PEFT | Adaptador de decisión con CodeReadout 255 vías, motor warp-34 |
| fastino/GLiDE-2B | 2B | no disponible | no disponible | no disponible | Modelo original del que se extrae el adaptador |
| Qwen/Qwen3.5-2B | 2B | no disponible | no disponible | safetensors | Modelo base sin capacidades de decisión |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa más allá de la evaluación JevBench del adaptador.

## Limitaciones y advertencias

- El adaptador está entrenado y evaluado únicamente en inglés; su rendimiento en otros idiomas no está documentado.
- No se han publicado datos sobre sesgos del modelo base ni del adaptador.
- Riesgo de alucinación inherente a modelos de 2B parámetros; la cabeza `CodeReadout` mitiga parcialmente el problema en tareas de decisión, pero no lo elimina.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-2B y el modelo original fastino/GLiDE-2B pueden tener condiciones adicionales que deben verificarse por separado.
- Dependencia fuerte del motor warp-34: las optimizaciones de proyecciones fusionadas y el perfil `DecisionModelProfile` no se aprovechan en otros motores, lo que limita la portabilidad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación independiente.
- La longitud de contexto no está documentada, lo que impide planificar despliegues con ventanas largas sin verificación empírica.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/nchapman/Qwen3.5-2B-GLiDE-LoRA
- Modelo base Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Variante cuantizada W4A16-HGPTQ: https://huggingface.co/nchapman/Qwen3.5-2B-W4A16-HGPTQ
- Modelo original GLiDE-2B: https://huggingface.co/fastino/GLiDE-2B
- Dataset de evaluación JevBench: https://huggingface.co/datasets/kshitijthakkar/nirnaya-jevbench-public-eval-v1
