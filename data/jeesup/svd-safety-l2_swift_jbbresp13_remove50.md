# Jeesup/svd-safety-l2_swift_jbbresp13_remove50

## Resumen

`svd-safety-l2_swift_jbbresp13_remove50` es un checkpoint de investigación publicado por el usuario Jeesup en HuggingFace, derivado de `meta-llama/Llama-2-7b-chat-hf` mediante compresión Swift-SVD. El objetivo del trabajo es estudiar cómo la compresión por descomposición en valores singulares (SVD) afecta al equilibrio entre utilidad y seguridad en modelos conversacionales, eliminando aproximadamente el 50 % del presupuesto de parámetros factorizados.

El modelo se ha comprimido con una calibración mixta de 256 secuencias de WikiText más 13 secuencias de prompts dañinos y respuestas de rechazo del conjunto JBB (jailbreak bench), lo que permite preservar el comportamiento de rechazo del modelo original durante la compresión. La recuperación se ha realizado con LoRA secuencial sobre los factores U y V siguiendo el método SVD-LLM, con datos Alpaca-cleaned.

El resultado se ha plegado a pesos densos estándar de Transformers (por eso el repo pesa 13,5 GB y contiene 6.738.415.616 parámetros reales), de modo que la ratio de compresión describe el presupuesto factorizado de parámetros, no una reducción del tamaño de descarga. No es un modelo pensado para despliegue en producción, sino un artefacto experimental para medir seguridad y utilidad bajo compresión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder Llama-2, comprimido con Swift-SVD y plegado a pesos densos |
| Parametros totales | 6.738.415.616 (en el checkpoint plegado) |
| Parametros activos | no disponible (arquitectura densa, no MoE) |
| Longitud de contexto | no disponible (el modelo base Llama-2-7b-chat usa 4096 tokens, pero no consta en la model card) |
| Tipos de cuantizacion | no disponible (pesos en fp16/bf16, sin cuantizacion documentada) |
| Idiomas soportados | no disponible (heredado implicitamente del ingles de Llama-2 y los datos de calibracion) |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Llama-2-7b-chat, un transformer decoder autorregresivo de 7 mil millones de parametros afinado con RLHF para dialogo. La innovacion principal no esta en la arquitectura base sino en el proceso de compresion: Swift-SVD sustituye matrices de peso por factores de rango reducido, con asignacion dinamica de rango (alpha 0,6) donde la importancia por capa se calcula sobre WikiText. La calibracion incluye, ademas de 256 secuencias de WikiText de 2048 tokens, 13 secuencias de prompts harmful y respuestas de rechazo de JBB (26.624 tokens adicionales), empaquetadas con el tokenizador de Llama-2. Es una calibracion prompt-mas-respuesta, no solo de prompts.

La recuperacion de calidad sigue el esquema SVD-LLM: LoRA secuencial primero sobre los factores U y despues sobre los factores V, con datos Alpaca-cleaned y dos epocas por pasada de entrenamiento. El checkpoint final se pliega a pesos densos convencionales compatibles con la libreria `transformers`. Los detalles de recuento de parametros realizado y de recuperacion se registran en el archivo `compression.json` del repositorio.

## Capacidades

- Generacion de texto conversacional heredada de Llama-2-7b-chat, con degradacion medible por la compresion.
- Comportamiento de rechazo ante prompts dañinos, parcialmente preservado mediante calibracion con respuestas de rechazo de JBB (tasa de ataque del 2,69 % en AdvBench).
- Capacidades zero-shot estandar evaluadas en siete tareas: ARC-Easy/Challenge, HellaSwag, WinoGrande, OpenBookQA, PIQA y MathQA.
- No hay documentacion de soporte de tool calling, function calling, agentes, vision ni audio.
- No hay documentacion de capacidades multilingues.

## Casos de uso

- Investigacion en compresion de LLMs: sirve como referencia reproducible para estudiar como Swift-SVD con asignacion dinamica de rango afecta a la perplejidad y a las tareas zero-shot.
- Investigacion en seguridad de modelos comprimidos: permite analizar si la compresion degrada los mecanismos de rechazo, usando los registros por prompt incluidos en `safety/`.
- Estudio de sobre-rechazo (over-refusal): el checkpoint incluye evaluaciones con XSTest-safe y OR-Bench juzgadas por WildGuard, utiles para investigar rechazos excesivos tras la compresion.
- Evaluacion de robustez frente a jailbreaks: los conjuntos AdvBench y StrongREJECT con el juez HarmBench permiten medir la tasa de ataque en un modelo comprimido.
- Baseline para metodos de calibracion orientados a seguridad: la tecnica de calibracion prompt-mas-respuesta con corpus de rechazos puede compararse frente a calibraciones solo-prompt.
- Desarrollo de pipelines de evaluacion: los ficheros crudos de generaciones y juicios en `utility/` y `safety/` sirven de ejemplo para montar evaluaciones reproducibles con WildGuard y HarmBench.

## Benchmarks y rendimiento

Resultados publicados en la model card (limite de generacion de 512 tokens, sin limites de muestreo en smoke tests):

| Metric | Value |
|---|---:|
| WikiText-2 perplexity | 14,2221 |
| AdvBench ASR (HarmBench) | 0,0269231 |
| StrongREJECT ASR (HarmBench) | 0,0351438 |
| Macro over-refusal (WildGuard) | 0,536183 |

Los resultados de las siete tareas zero-shot (ARC-Easy/Challenge, HellaSwag, WinoGrande, OpenBookQA, PIQA, MathQA) se incluyen como ficheros crudos en el repositorio, pero no se resumen cifras agregadas en la model card. No hay comparacion numerica publicada frente al modelo base sin comprimir en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 13,5 GB en precision de pesos del checkpoint (fp16/bf16), mas overhead de activaciones y KV cache; aproximadamente 16-18 GB de VRAM para inferencia comoda.
- GPU recomendadas: una RTX 4090 (24 GB), RTX 3090 (24 GB) o equivalente es suficiente para inferencia; para entrenamiento de la recuperacion LoRA se recomiendan A100 o H100.
- Cabe en GPUs consumer de 24 GB en precision nativa; con cuantizacion no documentada, no disponible.
- Opciones de despliegue: al ser pesos densos compatibles con `transformers` en safetensors, funciona con `transformers` directamente, y en principio con vLLM, TGI, llama.cpp (previa conversion a GGUF) u Ollama (previa conversion), aunque el autor no documenta ningun stack de despliegue concreto.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Metodo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jeesup/svd-safety-l2_swift_jbbresp13_remove50 | 6,74 B (plegado, ~50 % presupuesto factorizado) | Swift-SVD + LoRA (SVD-LLM) | no disponible | Llama 2 | HuggingFace, checkpoint de investigacion |
| meta-llama/Llama-2-7b-chat-hf (base) | 6,74 B | sin comprimir | 4096 | Llama 2 | HuggingFace, uso general |
| SVD-LLM (metodo de referencia) | variable segun ratio | SVD + LoRA secuencial U/V | depende del base | codigo abierto (metodo) | repositorio de metodo, no checkpoint de chat |

Nota: la comparacion cuantitativa de rendimiento frente al modelo base no esta publicada en la informacion disponible; solo se ofrecen las metricas del checkpoint comprimido.

## Limitaciones y advertencias

- El propio autor advierte que se trata de un checkpoint de investigacion: las mediciones no establecen idoneidad para despliegue en produccion.
- Tasa de sobre-rechazo macro del 53,6 % segun WildGuard: el modelo rechaza mas de la mitad de las peticiones seguras evaluadas, un problema grave para uso conversacional real.
- La tasa de ataque del 2,69 % (AdvBench) y 3,51 % (StrongREJECT) indica que el modelo no es inmune a jailbreaks; StrongREJECT ademas usa el juez de HarmBench, no su scorer nativo, lo que puede afectar la comparabilidad.
- La calidad utilitaria esta degradada por la compresion del 50 %; la perplejidad de 14,22 en WikiText-2 debe contrastarse con la del modelo base para valorar la perdida.
- Sesgos: hereda los sesgos de Llama-2 y de los datos Alpaca-cleaned usados en la recuperacion; no hay auditoria de sesgos publicada.
- Idiomas: sin documentacion de soporte multilingue; el entrenamiento de calibracion y recuperacion es esencialmente en ingles.
- Licencia: la Llama 2 Community License impone restricciones (acceptance of the license, limite de 700 millones de usuarios mensuales activos para la licencia abierta, politica de uso aceptable); conviene revisarla antes de cualquier uso comercial.
- La compresion describe el presupuesto factorizado de parametros, no una reduccion del tamano de descarga: el checkpoint pesa tanto como el modelo original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_swift_jbbresp13_remove50
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- No se han encontrado enlaces adicionales (paper, blog o demo) en la informacion disponible.
