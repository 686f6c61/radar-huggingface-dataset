# mseo3/klear8b-planfmt-sftg-v3orth-revm2v2-b36-noctr-brewster-s300

## Resumen

Klear8b-planfmt-sftg-v3orth-revm2v2-b36-noctr-brewster-s300 es un ajuste fino supervisado (SFT) del modelo Klear-Reasoner-8B-SFT, desarrollado por el usuario mseo3 y publicado en Hugging Face. Se trata de un checkpoint intermedio (paso 300 de un total de 1500) de un experimento de investigación centrado en el formato de "planes" dentro del razonamiento del modelo: se han anadido dos tokens especiales, `<|plan|>` (ID 151669) y `<|/plan|>` (ID 151670), para delimitar bloques de planificacion en la salida.

El modelo parte de la familia Qwen3 (segun los tags del repositorio) con 8.190.735.360 parametros, lo que lo situa en la categoria de modelos de 8B. El entrenamiento se realizo sobre 4 GPU H200 con FlashAttention 3, con un batch global de 36, learning rate de 2e-5 con decaimiento coseno hasta 1e-5, warmup de 30 pasos y un total de 1500 pasos previstos.

Su relevancia es fundamentalmente experimental: forma parte de una comparativa A/B (la variante "b36") en la que se desactiva el termino de contraste de planes (`data.plan_contrast_margin=0`) respecto a otra ejecucion con el mismo dataset y semilla. No es un modelo pensado para produccion, sino un artefacto de investigacion sobre formatos de planificacion en modelos de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3, segun tags) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE segun los datos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bf16; repo de 16.4 GB) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (fusionados desde shards FSDP a bf16) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint Kwai-Klear/Klear-Reasoner-8B-SFT, que a su vez pertenece a la familia Qwen3 segun los tags del repositorio. La innovacion principal del ajuste es la incorporacion de dos tokens de planificacion (`<|plan|>` y `<|/plan|>`) anadidos como tokens no atados (untied), con las filas correspondientes de `lm_head` reinicializadas de forma ortogonal a sus piezas de texto. Esto sugiere un interes en separar la representacion de los delimitadores de plan de la de sus componentes textuales.

El entrenamiento se realizo sobre el dataset privado `mseo3/klear8b-planfmt-revmask-sft` (version `data/rev_m2_v2`, 27.773 filas revisadas), en el que los pasos fallidos se enmascaran de la loss. Se trata de una ejecucion A/B con respecto a otra variante ("b36") en la que el unico cambio es la desactivacion del termino de contraste de planes (`data.plan_contrast_margin=0`). La receta es `sft_recipe_v3orth`, ejecucion `sft_g_ptokc_orth_lr2e5_revm2v2_b36_noctr_s1500_brewster`, con batch global 36, lr 2e-5 coseno a 1e-5, warmup 30, inicio desde el modelo base y 1500 pasos totales (este checkpoint es el paso 300). Se uso FlashAttention 3 sobre 4 GPU H200. Los pesos se fusionaron desde los shards FSDP a bf16, y el optimizador solo se conserva en el guardado mas reciente (los shards obsoletos se podan antes de cada guardado con `SFT_PRUNE_OPT_BEFORE_SAVE=1`).

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base Klear-Reasoner-8B-SFT, orientado a tareas de razonamiento.
- Formato de planificacion: emite bloques delimitados por `<|plan|>` y `<|/plan|>` para estructurar la planificacion intermedia.
- Razonamiento multi-paso: el formato de plan esta disenado para descomponer problemas en pasos.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking explicito: no confirmado en la informacion proporcionada.
- Vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre formatos de planificacion: el modelo sirve para estudiar como la delimitacion explicita de bloques de plan afecta al razonamiento, comparando esta variante (sin termino de contraste) con la variante con contraste activo.
- Analisis de ablacion: al ser una ejecucion A/B con una unica variable cambiada (el margen de contraste de planes), permite aislar el efecto de ese termino en el aprendizaje del formato.
- Generacion de trazas de razonamiento estructuradas: el modelo puede producir planes delimitados que facilitan el parseo automatico de la cadena de razonamiento en pipelines de evaluacion.
- Fine-tuning posterior: al estar bajo licencia Apache 2.0 y en safetensors bf16, puede servir como punto de partida para nuevos ajustes sobre formatos de plan.
- Evaluacion de checkpoints intermedios: al ser el paso 300 de 1500, es util para estudiar la evolucion del aprendizaje del formato a lo largo del entrenamiento.
- Reproduccion de experimentos: la receta y los hiperparametros estan documentados en la model card, lo que facilita la replicacion en entornos con GPU H200.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16.4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 24 GB para contexto corto.
- Cuantizacion: no se proporcionan pesos cuantizados en el repositorio; seria necesario generarlos (por ejemplo, con llama.cpp o GPTQ/AWQ) a partir de los safetensors bf16.
- GPU recomendadas: el entrenamiento se realizo en 4x H200; para inferencia, una A100 40/80 GB, H100 o L40S son adecuadas. En consumer, una RTX 4090 (24 GB) puede alojar los pesos en bf16 con contexto limitado, o en cuantizacion 8-bit/4-bit para mayor margen.
- Despliegue: compatible con frameworks estandar para modelos Qwen3 (vLLM, TGI, llama.cpp tras conversion a GGUF, Ollama tras conversion). Requiere anadir los tokens especiales `<|plan|>` y `<|/plan|>` al tokenizer para un uso correcto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| klear8b-planfmt-sftg-v3orth-revm2v2-b36-noctr-brewster-s300 | 8.19B | no disponible | Apache 2.0 | Hugging Face (0 descargas) |
| Kwai-Klear/Klear-Reasoner-8B-SFT (modelo base) | ~8B | no disponible | no disponible en esta ficha | Hugging Face |
| Qwen3-8B (familia de referencia) | ~8B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Checkpoint intermedio: es el paso 300 de 1500, por lo que no representa el modelo final de la receta y su calidad puede ser inferior a la de checkpoints posteriores.
- Modelo de investigacion: 0 descargas y 0 likes; no hay evidencia de uso en produccion ni validacion externa.
- Dataset privado: el dataset de entrenamiento (`mseo3/klear8b-planfmt-revmask-sft`) es privado, lo que limita la reproducibilidad completa y la auditoria de sesgos.
- Riesgo de alucinacion: inherente a los modelos de razonamiento de 8B; no se han publicado evaluaciones que lo cuantifiquen.
- Idiomas: no se especifican los idiomas soportados; no asumir cobertura multilingue sin verificar.
- Tokens especiales: requiere configuracion explicita del tokenizer con `<|plan|>` (151669) y `<|/plan|>` (151670); sin ella, el formato de plan no funcionara correctamente.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de Klear-Reasoner-8B-SFT conviene verificar las condiciones del modelo base y de la familia Qwen3.
- Sin benchmarks: no hay datos publicados de MMLU, HumanEval, GSM8K ni similares para este checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/mseo3/klear8b-planfmt-sftg-v3orth-revm2v2-b36-noctr-brewster-s300
- Modelo base: https://huggingface.co/Kwai-Klear/Klear-Reasoner-8B-SFT
- Dataset de entrenamiento (privado): https://huggingface.co/datasets/mseo3/klear8b-planfmt-revmask-sft
