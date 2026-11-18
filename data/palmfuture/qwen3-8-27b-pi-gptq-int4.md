# palmfuture/Qwen3.8-27B-pi-GPTQ-Int4

## Resumen

Qwen3.8-27B-pi-GPTQ-Int4 es una cuantización de 4 bits del modelo Qwen/Qwen3.8-27B de Alibaba Qwen, publicada por el usuario palmfuture. El modelo incorpora fusionado (merge) el adaptador LoRA harness-hub/Qwen3.8-27B-pi-adapted, orientado a tareas de agente de programación, y posteriormente se cuantiza con GPTQ a Int4 con `group_size=32`. El resultado es un checkpoint de 27.781.427.952 parámetros (unos 27,8 mil millones) en formato safetensors, con pesos de 4 bits y un tamaño de repositorio de 21 GB.

La relevancia de esta ficha radica en que combina tres piezas poco habituales: un adaptador LoRA para agentes de código fusionado en los pesos (en lugar de cargado en tiempo de ejecución), cuantización GPTQ Int4 con calibración que incluye tailandés nativo, y la conservación de la cabeza de predicción multi-token (MTP) del modelo base para decodificación especulativa. El autor indica que cargar el LoRA en tiempo de ejecución en vLLM no era compatible con decodificación especulativa en su servidor y corría a un tercio de la velocidad, de ahí la decisión de fusionar antes de cuantizar.

El modelo base Qwen3.8-27B no está documentado en la información proporcionada más allá de su identificador, por lo que los detalles de arquitectura del transformer subyacente, el número de tokens de entrenamiento y el proceso de alineación (RLHF/DPO) no están disponibles. La model card sí describe la arquitectura interna en la medida necesaria para la cuantización: 64 capas, de las cuales 16 tienen atención completa y el resto atención lineal del tipo Gated DeltaNet, además de un codificador visual y una cabeza MTP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas de atención completa y capas de atención lineal (Gated DeltaNet); 64 capas, 16 de atención completa; incluye codificador visual y cabeza de predicción multi-token (MTP) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada; el comando de ejemplo de vLLM usa `--max-model-len 32768` |
| Tipos de cuantizacion | GPTQ Int4, `group_size=32`, simétrico, `desc_act=False`, `damp_percent=0.05`, `true_sequential=True`; componentes sensibles en bf16 |
| Idiomas soportados | inglés (en), tailandés (th), chino (zh) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con `mtp.safetensors` separado e indexado en `model.safetensors.index.json`) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida de 64 capas en la que 16 capas usan atención completa y el resto atención lineal basada en Gated DeltaNet. La cuantización respeta esta separación: se cuantizan a Int4 las proyecciones de autoatención (`q_proj`, `k_proj`, `v_proj`, `o_proj`), las proyecciones de la atención lineal (`in_proj_qkv`, `in_proj_z`, `out_proj`) y las proyecciones del MLP (`gate_proj`, `up_proj`, `down_proj`), mientras que se mantienen en bf16 las dinámicas de estado de la atención lineal (`A_log`, `conv1d`, `dt_bias`, `in_proj_b`, `in_proj_a`, `in_proj_ba`, `linear_attn.norm`), las normalizaciones (`q_norm`, `k_norm`, `input_layernorm`, `post_attention_layernorm`), la cabeza MTP (`mtp.*`, 15 tensores), el codificador visual (`model.visual.*`), los embeddings y `lm_head`.

El proceso de construcción tiene tres pasos documentados. Primero, la fusión del adaptador LoRA con `W += (alpha / r) · B·A`, con `r=32` y `alpha=64`, calculada en float32 y almacenada en bf16, sobre 256 pesos objetivo: `gate_proj`/`up_proj`/`down_proj` en las 64 capas y `q_proj`/`k_proj`/`v_proj`/`o_proj` en las 16 capas de atención completa. El adaptador no toca `mtp.*`, `lm_head`, los embeddings ni el codificador visual. Segundo, la cuantización con GPTQModel 7.0.0. Tercero, la reincorporación de `mtp.safetensors` (tomado sin cambios del modelo base) y sus 15 entradas en el índice, que GPTQModel `save()` omite.

La calibración usó 220 muestras recortadas a 1.024 tokens: 50 de allenai/c4 (texto general en inglés), 60 de allenai/tulu-3-sft-mixture (seguimiento de instrucciones), 35 de codeparrot/codeparrot-clean-valid (código), 15 de HuggingFaceH4/MATH-500 (razonamiento matemático) y 60 de wikimedia/wikipedia `20231101.th` (tailandés nativo). El entrenamiento del modelo base, el número de tokens y el proceso de alineación no están disponibles en la información proporcionada. La innovación destacable es la conservación de la cabeza MTP para decodificación especulativa, con `num_speculative_tokens: 3` en el ejemplo de despliegue.

## Capacidades

- Generación de texto conversacional en inglés, tailandés y chino.
- Procesamiento de imagen y texto (`image-text-to-text`), con codificador visual conservado en bf16.
- Comportamiento de agente de programación gracias al adaptador pi fusionado, orientado a tareas de terminal y resolución de issues en repositorios.
- Decodificación especulativa mediante la cabeza MTP del modelo base.
- Razonamiento matemático y aritmético (con caveats de cuantización, ver más abajo).
- Seguimiento de instrucciones, según la mezcla de calibración empleada.
- Capacidad multilingüe limitada a los tres idiomas declarados.

## Casos de uso

- Agente de programación en terminal: el adaptador pi está entrenado para el agente de código pi (github.com/earendil-works/pi); el modelo puede ejecutar tareas multi-paso de edición y verificación de código en un entorno de terminal, aprovechando la decodificación especulativa MTP para reducir latencia.
- Resolución de issues en repositorios: el adaptador reporta mejoras en SWE-bench Pro hard-51 según sus autores (no reproducidas en esta cuantización), lo que lo hace candidato para pipelines de reparación automática de bugs, siempre validando con tests propios.
- Asistencia conversacional en tailandés e inglés: la calibración incluye 60 muestras de Wikipedia en tailandés, lo que reduce la pérdida de calidad en ese idioma respecto a una calibración solo en inglés; adecuado para atención al cliente bilingüe en esos idiomas.
- Procesamiento de documentos con imagen: al conservar el codificador visual en bf16, puede extraer información de capturas, diagramas o documentos escaneados y responder preguntas sobre ellos.
- Despliegue en servidores multi-GPU moderados: con unos 20 GB de VRAM para pesos antes del KV cache, encaja en configuraciones de 4 GPU consumer de 12 GB con tensor parallelism, útil para equipos con hardware limitado.
- Evaluación de adaptadores LoRA fusionados: sirve como referencia para comparar el comportamiento del adaptador pi en precisión completa frente a Int4, dado que el autor documenta pérdida de cuantización y NLL por idioma.

## Benchmarks y rendimiento

Los benchmarks de agente citados por los autores del adaptador (Terminal-Bench 2.1: 39,5% → 55,8%; SWE-bench Pro hard-51: 29,4% → 62,7%) corresponden al adaptador sin cuantizar y no han sido reproducidos en esta fusión cuantizada. Las métricas propias del autor de la cuantización son:

| Metrica | Este modelo | Qwen3.8-27B-GPTQ-Int4 |
|---|---|---|
| Modulos GPTQ cuantizados / fallback RTN | 400 / 0 | 400 / 0 |
| Perdida GPTQ, media | 1,52e-04 | 1,59e-04 |
| Perdida GPTQ, maxima | 8,86e-04 | 9,22e-04 |
| Texto tailandes, NLL medio por token (menor es mejor) | 1,535 | 1,575 |
| Texto ingles, NLL medio por token | 1,750 | 1,745 |
| QA factual/aritmetica corta (6 items) | 4/6 | 5/6 |

El autor advierte que la NLL se midió sobre conjuntos propios pequeños de tailandés e inglés y solo debe compararse entre las dos columnas, no con cifras de otros modelos. La diferencia en QA es un único ítem aritmético de seis, insuficiente para extraer conclusiones. La comprobación de agente del autor (seis tareas fáciles, 18/18 en ambos modelos) no discrimina.

## Requisitos de hardware

- VRAM estimada: unos 20 GB para los pesos antes del KV cache, según la model card.
- GPU recomendadas: el autor usó 4× NVIDIA RTX 3060 12GB para el proceso de merge y cuantización, no para inferencia; el ejemplo de despliegue usa `--tensor-parallel-size 4`, ajustable según las GPU disponibles.
- Cabe en GPU consumer: sí, con tensor parallelism en varias GPU de 12 GB; en una sola GPU consumer de 24 GB (por ejemplo RTX 3090/4090) los pesos de 21 GB dejarían poco margen para KV cache, por lo que no se garantiza.
- Opciones de despliegue: vLLM con `--quantization gptq`, `--dtype float16` y `--speculative-config '{"method":"mtp","num_speculative_tokens":3}'`; el autor sirve con HyperQwen. No se documenta soporte de llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles; el autor solo menciona que cargar el LoRA en tiempo de ejecución en vLLM corría a un tercio de la velocidad que la versión fusionada con decodificación especulativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| palmfuture/Qwen3.8-27B-pi-GPTQ-Int4 | 27,78 B | no disponible | GPTQ Int4 g32 | apache-2.0 | Adaptador pi fusionado, MTP conservado |
| palmfuture/Qwen3.8-27B-GPTQ-Int4 | no disponible | no disponible | GPTQ Int4 g32 | apache-2.0 | Mismo esquema sin adaptador; referencia directa del autor |
| Qwen/Qwen3.8-27B | no disponible | no disponible | bf16 (base) | no disponible | Modelo base sin cuantizar |

No se dispone de datos de benchmarks comparativos entre estos tres checkpoints más allá de las métricas de pérdida y NLL de la tabla anterior. No se han identificado en la información proporcionada otras alternativas de la misma categoría con datos verificables.

## Limitaciones y advertencias

- Las mejoras del adaptador pi en Terminal-Bench 2.1 y SWE-bench Pro hard-51 no han sido reproducidas sobre esta fusión cuantizada; no deben asumirse en producción sin validación propia.
- La pérdida de cuantización es pequeña pero existe: la NLL en inglés es ligeramente peor que en el checkpoint sin adaptador (1,750 frente a 1,745) y el QA aritmético bajó de 5/6 a 4/6 en la muestra del autor.
- La decodificación especulativa depende de que `mtp.*` esté correctamente indexado en `model.safetensors.index.json`; si se recuantiza, es necesario volver a registrar esas 15 entradas o la decodificación especulativa se desactiva silenciosamente.
- El autor documenta inestabilidad de GPTQModel en su hardware (fallos de acceso a memoria CUDA en cinco de seis ejecuciones) resuelta con `auto_forward_data_parallel=False`; relevante para quien reproduzca la cuantización.
- Idiomas limitados a inglés, tailandés y chino; no se declara soporte de español ni de otros idiomas.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada, pero aplicables a cualquier modelo generativo de este tamaño.
- Licencia apache-2.0 permite uso comercial, pero las condiciones del adaptador original (harness-hub/Qwen3.8-27B-pi-adapted) y del modelo base deben verificarse por separado antes de un despliegue comercial.
- El comando de vLLM del ejemplo no ha sido ejecutado contra este repositorio tal como está subido, según el propio autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/palmfuture/Qwen3.8-27B-pi-GPTQ-Int4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Adaptador LoRA original: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Checkpoint hermano sin adaptador: https://huggingface.co/palmfuture/Qwen3.8-27B-GPTQ-Int4
- Agente pi: https://github.com/earendil-works/pi
- Dataset de calibración allenai/c4: https://huggingface.co/datasets/allenai/c4
- Dataset de calibración allenai/tulu-3-sft-mixture: https://huggingface.co/datasets/allenai/tulu-3-sft-mixture
- Dataset de calibración codeparrot/codeparrot-clean-valid: https://huggingface.co/datasets/codeparrot/codeparrot-clean-valid
- Dataset de calibración HuggingFaceH4/MATH-500: https://huggingface.co/datasets/HuggingFaceH4/MATH-500
- Dataset de calibración wikimedia/wikipedia (20231101.th): https://huggingface.co/datasets/wikimedia/wikipedia
