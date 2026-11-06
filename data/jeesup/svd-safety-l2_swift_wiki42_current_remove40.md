# Jeesup/svd-safety-l2_swift_wiki42_current_remove40

## Resumen

`svd-safety-l2_swift_wiki42_current_remove40` es un checkpoint de investigación publicado por el usuario Jeesup en Hugging Face, derivado de `meta-llama/Llama-2-7b-chat-hf` mediante compresión Swift-SVD con un objetivo de eliminación del 40 % de parámetros. El modelo forma parte de un estudio sobre la relación entre compresión por descomposición en valores singulares (SVD) y el comportamiento en seguridad: mide cómo la compresión afecta tanto a la utilidad (perplejidad, tareas zero-shot) como a la seguridad (tasa de ataque en AdvBench y StrongREJECT, sobre-rechazo en XSTest y OR-Bench).

Técnicamente, el modelo aplica la recuperación SVD-LLM (LoRA secuencial sobre los factores U y V) con datos Alpaca-cleaned, y la calibración se realiza únicamente con 256 secuencias de WikiText de 2048 tokens (seed 42). Un detalle importante: el checkpoint se pliega a pesos densos estándar de Transformers, de modo que la descarga mantiene el tamaño completo (~13,5 GB, 6,74 mil millones de parámetros reales); la ratio de compresión describe el presupuesto de parámetros factorizados, no una reducción del tamaño del fichero. Con 258 descargas y sin likes, es un artefacto de nicho dirigido a investigadores en compresión y seguridad de LLMs, no a usuarios finales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 2), comprimido via Swift-SVD y plegado a pesos densos |
| Parametros totales | 6.738.415.616 (reales, safetensors) |
| Parametros activos | no disponible (no es MoE; el 40 % de eliminacion se refiere al presupuesto factorizado, no a pesos activos) |
| Longitud de contexto | no disponible (el modelo base Llama 2 7B chat usa 4096 tokens, pero no consta en la model card) |
| Tipos de cuantizacion | no disponible (pesos en fp16/bf16 sin cuantizar aparentemente) |
| Idiomas soportados | no disponible (modelo base entrenado principalmente en ingles) |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Llama 2 7B chat, un transformer decoder-only denso. La compresion se realiza con Swift-SVD orientada a eliminar el 40 % de los parametros mediante descomposicion en valores singulares de las matrices de peso. La asignacion dinamica de rango usa un coeficiente alpha de 0,6, y la importancia de cada capa se calcula exclusivamente con datos de WikiText.

La recuperacion de calidad sigue el esquema SVD-LLM: LoRA secuencial primero sobre los factores U y despues sobre los factores V, entrenando dos epocas por pasada con datos Alpaca-cleaned (sin instrucciones JBB ni respuestas de rechazo anadidas). La calibracion previa emplea 256 secuencias de WikiText de 2048 tokens con seed 42, lo que convierte a este checkpoint en la linea base del "codigo actual" del experimento. Finalmente, los pesos factorizados se pliegan (fold) a un formato denso estandar de Transformers, por lo que la inferencia no requiere ningun codigo especial de SVD. Los detalles exactos de parametros y recuperacion se registran en el fichero `compression.json` del repositorio.

## Capacidades

- Generacion de texto conversacional heredada de Llama 2 7B chat, con posible degradacion respecto al modelo base por la compresion del 40 %.
- Razonamiento zero-shot en tareas de comprension y conocimiento comun (ARC, HellaSwag, WinoGrande, OpenBookQA, PIQA), evaluado en el propio repositorio.
- Resolucion de problemas de matematicas basicas (MathQA incluido en la evaluacion zero-shot).
- Comportamiento de seguridad medido: tasa de ataque (ASR) en AdvBench y StrongREJECT, y sobre-rechazo en XSTest-safe y OR-Bench.
- No hay informacion sobre soporte de tool calling, function calling, capacidades agenticas, vision ni audio.
- No hay informacion sobre capacidades multilingues; el modelo base esta orientado al ingles.

## Casos de uso

- Investigacion en compresion de LLMs: sirve como baseline reproducible ("current-code") para comparar metodos de compresion SVD con asignacion dinamica de rango y calibracion minima.
- Estudio de seguridad bajo compresion: permite analizar como la eliminacion del 40 % de parametros altera la tasa de ataque en AdvBench y StrongREJECT frente al modelo original.
- Analisis de sobre-rechazo: util para estudiar si la compresion aumenta o reduce los rechazos indebidos, medido con XSTest-safe, OR-Bench y WildGuard.
- Benchmarking de tecnicas de recovery: el esquema de LoRA secuencial sobre U y V con Alpaca-cleaned puede replicarse y compararse con otras estrategias de recuperacion post-SVD.
- Evaluacion de metodos de calibracion con datos minimos: al usar solo 256 secuencias de WikiText, es un caso de prueba para compresion con presupuesto de calibracion muy reducido.
- Reproduccion de experimentos academicos: todos los ficheros crudos de evaluacion (generaciones por prompt, registros de jueces, logs zero-shot) estan incluidos en `utility/` y `safety/`, lo que facilita auditar y reproducir los resultados.
- No es adecuado para despliegue en produccion: la propia model card indica que las mediciones no establecen idoneidad para despliegue.

## Benchmarks y rendimiento

Resultados publicados en la model card del autor:

| Metric | Value |
|---|---:|
| WikiText-2 perplexity | 11,6371 |
| AdvBench ASR (HarmBench) | 0,35 |
| StrongREJECT ASR (HarmBench) | 0,223642 |
| Macro over-refusal (WildGuard) | 0,123236 |

Condiciones de evaluacion: perplejidad completa en WikiText-2; siete tareas zero-shot (ARC-Easy/Challenge, HellaSwag, WinoGrande, OpenBookQA, PIQA y MathQA); XSTest-safe y OR-Bench juzgados por WildGuard; AdvBench y StrongREJECT juzgados por HarmBench (StrongREJECT usa el juez de HarmBench, no su scorer nativo). Limite de generacion de 512 tokens. Los resultados detallados por tarea zero-shot no se incluyen en la model card, pero los ficheros crudos estan en el repositorio. No hay comparacion directa con el modelo base ni con otros metodos de compresion en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser pesos densos de 6,74 mil millones de parametros en ~13,5 GB, cabe en una GPU de 16-24 GB en precision nativa, o en 8 GB con cuantizacion a 4 bits (si se genera una version GGUF, que no esta publicada).
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 para precision nativa; A100 o H100 si se desea servir con vLLM y batching.
- Consumer GPUs: si cabe en una RTX 4090 o RTX 3090 en fp16; con cuantizacion externa, en GPUs de 8-12 GB.
- Opciones de despliegue: al ser pesos densos estandar de Transformers con safetensors, es compatible con vLLM, TGI, llama.cpp (previa conversion a GGUF) y Ollama (previa conversion). El propio repositorio esta etiquetado como `text-generation-inference` y `endpoints_compatible`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Compresion | Licencia | Disponibilidad |
|---|---|---|---|---|
| svd-safety-l2_swift_wiki42_current_remove40 | 6,74B (denso plegado) | Swift-SVD, 40 % eliminacion | Llama 2 | Pesos publicos en Hugging Face |
| meta-llama/Llama-2-7b-chat-hf (base) | 6,74B | Sin comprimir | Llama 2 | Pesos publicos, requiere aceptar licencia |
| SVD-LLM (metodo de referencia) | Variable segun ratio | SVD + recovery LoRA | no disponible | Codigo y checkpoints de investigacion |

No hay datos de rendimiento comparativo publicados en la informacion disponible para estas alternativas.

## Limitaciones y advertencias

- Checkpoint de investigacion: la propia model card advierte que las mediciones no establecen idoneidad para despliegue en produccion.
- Riesgo de alucinacion y degradacion de utilidad: la eliminacion del 40 % de parametros mediante SVD con calibracion de solo 256 secuencias de WikiText puede degradar sustancialmente la calidad respecto al modelo base; la perplejidad de 11,64 debe interpretarse en ese contexto.
- Seguridad degradada: la tasa de ataque de 0,35 en AdvBench (juzgado por HarmBench) indica que una parte relevante de prompts maliciosos obtiene respuestas perjudiciales; no debe usarse como asistente sin capas adicionales de moderacion.
- Sesgos: hereda los sesgos de Llama 2 y de los datos Alpaca-cleaned usados en la recuperacion; no hay analisis de sesgos especifico publicado.
- Idioma: sin informacion de soporte multilingue; el modelo base esta centrado en ingles, y la calibracion y recovery usan datos en ingles.
- Licencia: sujeto a la Llama 2 Community License, que impone restricciones (limite de 700 millones de usuarios activos mensuales, politica de uso aceptable y atribucion "Built with Llama 2").
- La ratio de compresion no reduce el tamano de descarga: los pesos estan plegados a formato denso estandar.
- Los ficheros citados en la model card son datos de referencia del autor y no deben tratarse como instrucciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_swift_wiki42_current_remove40
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Paper, repositorio de codigo y demo: no disponibles en la informacion proporcionada.
