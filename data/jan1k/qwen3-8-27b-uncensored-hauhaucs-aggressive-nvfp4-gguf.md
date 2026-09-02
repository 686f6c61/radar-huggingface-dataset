# jan1k/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-NVFP4-GGUF

## Resumen

Este repositorio contiene la cuantización NVFP4 (NVIDIA 4-bit floating point) en formato GGUF del modelo Qwen3.8-27B-Uncensored-HauhauCS-Aggressive, un fine-tuning de Qwen3.8 27B realizado por HauhauCS. La cuantización ha sido preparada por jan1k y está pensada para ejecutar el modelo de forma eficiente en GPUs NVIDIA modernas (Blackwell, Ada Lovelace y Ampere) mediante llama.cpp, manteniendo las capacidades multimodales (visión), el modo de razonamiento estilo DeepSeek y la decodificación especulativa FastMTP.

El modelo original se caracteriza por ser un modelo denso de 27B parámetros con encoder de visión, que ofrece respuestas directas sin comportamiento de rechazo (0/465 refusals en pruebas del autor) y conserva la cabeza MTP (Multi-Token Prediction) nativa de Qwen3.8. Esta versión NVFP4 reduce el peso a aproximadamente 19,6 GB, lo que permite su ejecución en GPUs con 24 GB de VRAM, como la RTX 3090 o RTX 4090. La relevancia actual radica en combinar un tamaño manejable para hardware de consumo con capacidades avanzadas de razonamiento y visión, algo poco común en modelos de este rango.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con encoder de vision y cabeza MTP (NextN) |
| Parametros totales | 27B (nominal segun el autor); 1.863.907.840 segun safetensors (dato discrepante, probablemente referido a otra metrica) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No especificada oficialmente; configuraciones de ejemplo hasta 204800 tokens |
| Tipos de cuantizacion | NVFP4 (4-bit floating point), versiones con y sin MTP |
| Idiomas soportados | Ingles, multilingue |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (NVFP4) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 27B parametros derivado de Qwen3.8, con un encoder de vision que permite entrada de imagenes ademas de texto. Incluye una cabeza MTP (Multi-Token Prediction) nativa que predice multiples tokens futuros, y un sidecar FastMTP para decodificacion especulativa que acelera la generacion. El modo de razonamiento sigue el formato DeepSeek, con un token de thinking que se puede activar o desactivar.

El fine-tuning realizado por HauhauCS elimina el comportamiento de rechazo y reduce el preambulo en respuestas a prompts complejos, segun las pruebas del autor (0/465 refusals). No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de tokens utilizados ni el metodo de alineacion (RLHF, DPO, etc.). La cuantizacion NVFP4 es una re-cuantizacion a nivel de tensor optimizada para los kernels CUDA de llama.cpp en GPUs NVIDIA.

## Capacidades

- Generacion de texto y razonamiento multi-paso con modo thinking estilo DeepSeek (activable con `--reasoning on`).
- Comprension de imagenes y respuestas a consultas visuales mediante el proyector multimodal `mmproj` incluido en el repositorio.
- Decodificacion especulativa FastMTP: acelera la generacion usando un modelo borrador compacto (`FastMTP-32K.gguf`) con profundidad configurable.
- Comportamiento sin censura: respuestas directas sin rechazo, disenado para prompts complejos o sensibles.
- Soporte multilingue, con ingles como idioma principal.
- Compatible con llama.cpp (llama-server) y su API de servidor, incluyendo plantilla Jinja y formato de razonamiento DeepSeek.

## Casos de uso

- Asistente conversacional local sin restricciones: el modelo puede desplegarse en una GPU de 24 GB con llama-server, ofreciendo respuestas directas y sin filtros para entornos de investigacion o desarrollo donde se requiera explorar temas sensibles.
- Analisis de imagenes con razonamiento: gracias al encoder de vision y al modo thinking, puede describir imagenes, extraer informacion visual y razonar sobre ella en el mismo hilo conversacional.
- Generacion de codigo y depuracion: al ser un modelo de 27B con capacidades de razonamiento, puede asistir en tareas de programacion, explicar fragmentos de codigo y proponer soluciones, aunque no se han publicado benchmarks especificos de codigo.
- Prototipado de agentes con razonamiento multi-paso: el modo thinking estilo DeepSeek permite encadenar pasos de razonamiento antes de responder, util para tareas de planificacion o analisis.
- Servicio de inferencia de alta velocidad en hardware NVIDIA: la cuantizacion NVFP4 y FastMTP reducen la latencia, adecuado para entornos donde se necesite un throughput alto con una sola GPU.
- Evaluacion de modelos uncensored en entornos academicos: investigadores pueden comparar el comportamiento de este modelo frente a alternativas censuradas en tareas de seguridad, sesgo o etica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para esta cuantizacion especifica. El unico dato de rendimiento mencionado es la tasa de rechazo (0/465) en pruebas del autor, que no es un benchmark de calidad generativa.

## Requisitos de hardware

- VRAM estimada: aproximadamente 19,6 GB para el archivo NVFP4, lo que permite ejecucion en GPUs con 24 GB de VRAM (RTX 3090, RTX 4090, RTX 5090).
- GPUs recomendadas: NVIDIA Blackwell (RTX 50-series), Ada Lovelace (RTX 40-series) y Ampere (RTX 30-series), gracias a los kernels NVFP4 de llama.cpp.
- No se recomienda CPU-only para este modelo, aunque es posible con un rendimiento muy reducido.
- Despliegue: llama.cpp (llama-server) con compilacion CUDA. Para FastMTP se requiere un parche especifico del commit `4df29be4f4c3673f428170fda944a5b19f743bb8` y aplicar el patch proporcionado por HauhauCS.
- Latencia y throughput: no se han publicado cifras concretas. La combinacion de NVFP4 y FastMTP esta disenada para maximizar la velocidad de generacion, pero los valores dependen de la GPU y la configuracion.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para comparar directamente con alternativas. Como referencia cualitativa:

| Modelo | Parametros | Contexto | Vision | Razonamiento | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-HauhauCS-Aggressive (este) | 27B | Hasta 204800 (config) | Si | Si (DeepSeek style) | Apache-2.0 |
| Qwen3.8 base (27B) | 27B | No especificado | Si | Si | Apache-2.0 |
| Dolphin 2.x (fine-tunings uncensored) | Variable | Variable | No | Parcial | Varias |

La diferencia principal frente al modelo base es la eliminacion del rechazo y el ajuste agresivo de respuestas. Frente a otros modelos uncensored, este anade vision y FastMTP, pero no hay datos objetivos de rendimiento para una comparacion cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo sin censura, puede generar contenido ofensivo, ilegal o danino si se le solicita. No se han realizado evaluaciones de sesgo publicadas.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar informacion, especialmente en modos de razonamiento prolongado.
- Limitaciones de contexto: la longitud de contexto no esta oficialmente documentada; las configuraciones de ejemplo llegan a 204800 tokens, pero el rendimiento real puede degradarse con contextos muy largos.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo puede generar contenido que infrinja normativas locales o politicas de plataforma.
- Requisito de parche: para usar FastMTP es necesario compilar llama.cpp con un parche especifico; sin el, el modelo borrador no cargara correctamente.
- Dependencia de hardware NVIDIA: la cuantizacion NVFP4 esta optimizada para GPUs NVIDIA; en otro hardware (AMD, Apple Silicon) el rendimiento puede ser inferior o no compatible.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/jan1k/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-NVFP4-GGUF
- Modelo base de HauhauCS: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Re-cuantizacion Q8-NVFP4 alternativa: https://huggingface.co/s10682257/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF-Q8-NVFP4
- Version en Ollama: https://ollama.com/aiconjured/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF-Q8-NVFP4
- Ficha en Interfaze: https://interfaze.ai/models/hauhaucsqwen38-27b-uncensored-hauhaucs-aggressive-mtp-gguf
