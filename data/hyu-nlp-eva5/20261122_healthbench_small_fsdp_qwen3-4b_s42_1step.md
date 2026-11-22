# hyu-nlp-eva5/20261122_healthbench_small_fsdp_qwen3-4b_s42_1step

## Resumen

Este repositorio contiene un checkpoint de Qwen3-4B-Instruct-2507 tras un unico paso de entrenamiento con aprendizaje por refuerzo basado en rubricas (rubric-based RL) sobre el conjunto de datos HealthBench. Lo publica el usuario hyu-nlp-eva5 como parte de una evaluacion interna (identificador de experimento `20261122_healthbench_small_fsdp_qwen3-4b_s42_1step`), no como un modelo destinado a produccion. El entrenamiento consistio exactamente en un paso: 32 prompts con 8 respuestas cada uno, dos actualizaciones del optimizador PPO y semilla 42.

El modelo base es Qwen3-4B-Instruct-2507, un transformer denso de 4.411.424.256 parametros (4,4 mil millones) con licencia Apache 2.0 en su version original. Este checkpoint hereda la arquitectura y capacidades del base, pero incorpora una actualizacion de politica marginal: al tratarse de un solo paso de RL sobre una muestra minima, las diferencias de comportamiento respecto al modelo original son practicamente inapreciables.

Su relevancia es metodologica, no funcional: sirve como artefacto reproducible de un pipeline FSDP (Fully Sharded Data Parallel) con PPO y un juez con tensor parallelism 2 para evaluar rubricas de HealthBench. No debe emplearse como modelo de dominio sanitario ni como sustituto del base en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), derivado de Qwen/Qwen3-4B-Instruct-2507 |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; el base admite cuantizaciones GGUF/AWQ de la comunidad) |
| Idiomas soportados | no disponible en la informacion proporcionada (heredados del base) |
| Licencia | no disponible en este repositorio (el modelo base Qwen3-4B-Instruct-2507 se distribuye bajo Apache 2.0) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen3-4B-Instruct-2507: un transformer denso decoder-only con atencion por causalidad estandar, sin mezcla de expertos. El checkpoint se exporto a BF16 desde un estado FSDP en FP32 tras la actualizacion. El proceso de entrenamiento uso dos GPU con `FULL_SHARD`, `deterministic=true` y PPO con dos actualizaciones del optimizador sobre 32 prompts y 8 respuestas por prompt (256 evaluaciones en total, realizadas por un juez con TP=2 en el job de Slurm 766).

El detalle tecnico mas relevante es la recuperacion tras un fallo de asignacion en AdamW con `foreach`: el job 767 restauro los shards FP32 y el estado RNG previos, reutilizo los tokens, log-probabilidades y ventajas guardados y completo ambas actualizaciones PPO con `foreach=false`. Los shards FP32 originales y los gradientes pre-clipping no se incluyen en el repositorio; permanecen en el servidor de entrenamiento. No se realizo validacion.

## Capacidades

- Generacion de texto conversacional, heredada de Qwen3-4B-Instruct-2507.
- Razonamiento y respuesta a instrucciones propias del modelo base.
- Generacion de codigo y matematicas basicas (capacidades del base, no verificadas en este checkpoint).
- Soporte de tool calling y function calling heredado del base (no re-verificado tras el paso de RL).
- Capacidades multilingues del base (no documentadas en este repositorio).
- Ajuste especifico, aunque minimo, hacia respuestas evaluadas con rubricas de HealthBench.
- No incluye vision ni audio.

## Casos de uso

- Reproduccion de experimentos de RL con rubricas: el checkpoint permite comparar el estado de la politica antes y despues de un unico paso PPO con semilla 42, util para depurar pipelines de entrenamiento.
- Validacion de infraestructura FSDP: sirve para comprobar que un flujo `FULL_SHARD` con dos GPU, exportacion a BF16 y recuperacion tras fallos de optimizador produce artefactos cargables con `transformers`.
- Pruebas de integracion con Text Generation Inference: al estar etiquetado como `text-generation-inference` y `endpoints_compatible`, puede usarse para verificar el despliegue de endpoints sobre checkpoints derivados de Qwen3.
- Estudio de estabilidad de PPO: al conservarse tokens, log-probabilidades y ventajas del paso original, permite analizar la magnitud del cambio de politica en un solo update.
- Docencia e investigacion sobre evaluacion con LLM-as-judge: el uso de un juez con TP=2 sobre 256 respuestas sirve como ejemplo de configuracion de evaluacion a pequena escala.
- Baseline de comparacion en experimentos de HealthBench: util como punto de partida (paso 1) frente a checkpoints con mas pasos de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 8,8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 10 y 12 GB para inferencia con contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: en torno a 4,5-5 GB; en 4 bits, en torno a 2,5-3 GB (cuantizaciones no publicadas en este repositorio, requieren conversion).
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue con TGI o vLLM; RTX 4090 (24 GB) y RTX 3090 (24 GB) suficientes en BF16.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 (16 GB) en BF16 con contexto limitado, y en GPUs de 8-12 GB con cuantizacion.
- Opciones de despliegue: `transformers`, Text Generation Inference (etiqueta del repo), vLLM, llama.cpp/Ollama previa conversion a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este checkpoint (Qwen3-4B + 1 paso RL) | 4,41 B | no disponible | no disponible | Artefacto de experimento, sin validacion |
| Qwen/Qwen3-4B-Instruct-2507 | 4,41 B | no disponible en la informacion | Apache 2.0 | Modelo base, entrenado y validado por el autor original |
| Otros Qwen3 de 4 B de la comunidad | ~4 B | variable | variable | Fine-tunes con licencia heredada; rendimiento no comparable sin benchmarks |

No se dispone de datos de rendimiento de este checkpoint que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Entrenamiento de un solo paso sobre 32 prompts: el efecto sobre el comportamiento es marginal y no esta validado (la validacion se omitio explicitamente).
- No apto para uso clinico ni sanitario: el ajuste con rubricas de HealthBench no garantiza correccion medica y el modelo puede alucinar.
- Sesgos heredados del modelo base Qwen3-4B-Instruct-2507, no evaluados en este checkpoint.
- Licencia no declarada en el repositorio; antes de un uso comercial debe verificarse la licencia del base (Apache 2.0) y la del artefacto derivado.
- Los shards FP32 y los gradientes originales no se publican, lo que limita la reproducibilidad exacta del paso de entrenamiento.
- Idiomas soportados no documentados en este repositorio.
- El identificador incluye una fecha futura (2026-11-22) y el repositorio no presenta descargas ni likes; tratarlo como artefacto de investigacion sin soporte.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hyu-nlp-eva5/20261122_healthbench_small_fsdp_qwen3-4b_s42_1step
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
