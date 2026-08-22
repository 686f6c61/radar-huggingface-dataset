# Azzam15/allam-7b-fp8-w8a16-mixed

## Resumen

Este repositorio contiene una cuantizacion post-entrenamiento del modelo `humain-ai/ALLaM-7B-Instruct-preview`, un modelo de lenguaje de 7.000 millones de parametros desarrollado por el Centro Nacional de Inteligencia Artificial (NCAI) de la Autoridad de Datos e Inteligencia Artificial de Arabia Saudita (SDAIA). El checkpoint `allam-7b-fp8-w8a16-mixed` aplica cuantizacion FP8 (E4M3) a los pesos, manteniendo las activaciones en FP16, mediante NVIDIA ModelOpt. La calibracion se realizo con un corpus mixto de 512 muestras, pero como los pesos se cuantizan de forma independiente de los datos de calibracion (escalas calculadas directamente de los pesos), el resultado es un modelo weight-only con perdida minima (MSE de 8.08e-08).

Este checkpoint es relevante para quienes buscan desplegar el modelo ALLaM en entornos de produccion con menor uso de memoria y mayor velocidad de inferencia, sin necesidad de recalibrar contra datos especificos. No es cargable con `transformers` estandar; requiere vLLM con soporte para `modelopt`. Su principal valor es servir como control para comparar con variantes AWQ o con cuantizaciones que si dependen de los datos de calibracion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (según tags; detalles no especificados) |
| Parametros totales | 7.000.559.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (E4M3, escala per-tensor) en pesos, activaciones FP16 (W8A16) |
| Idiomas soportados | no especificado (el modelo base es bilingue arabe/ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base `ALLaM-7B-Instruct-preview` es un transformer de 7B parametros, entrenado desde cero en dos etapas: primero con 4 billones de tokens en ingles y posteriormente con 1.2 billones de tokens mezclados de arabe e ingles. Este checkpoint concreto no modifica los pesos del modelo base, sino que aplica cuantizacion FP8 mediante NVIDIA ModelOpt con la configuracion `FP8_DEFAULT_CFG`. La calibracion se ejecutó con 512 muestras de texto variado (512 tokens cada una), pero al desactivar los cuantizadores de activaciones despues de la calibracion, el checkpoint final es weight-only: los pesos se almacenan en FP8 con escalas per-tensor calculadas directamente de los pesos, sin influencia de los datos de calibracion. Esto lo convierte en un control valido para medir el efecto de la calibracion en otras variantes cuantizadas.

La cuantizacion cubre 224 tensores de peso y logra un error cuadratico medio (MSE) de 8.08e-08 respecto a los pesos originales en FP16. El entorno de creacion fue torch 2.8.0+cu128, transformers 4.57.6 y modelopt 0.46.0. No se ha publicado informacion sobre datos de entrenamiento adicionales ni tecnicas como RLHF o DPO en este checkpoint.

## Capacidades

- Generacion de texto y seguimiento de instrucciones: al estar basado en el modelo instructivo ALLaM, puede responder a prompts y mantener conversaciones multi-turno.
- Razonamiento y comprension de texto en ingles y arabe (capacidades del modelo base, no verificadas en este checkpoint).
- Soporte de tool calling: no se ha confirmado en la informacion disponible.
- Soporte de agentes o multi-step reasoning: no se ha confirmado.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Despliegue de asistentes conversacionales en arabe e ingles con requisitos reducidos de memoria: al ser W8A16, el modelo reduce el espacio de pesos en un 50% respecto a FP16, lo que permite ejecutar el modelo en GPUs con menos VRAM.
- Servicio de inferencia de alto rendimiento con vLLM: el checkpoint esta preparado para cargarse con `--quantization modelopt`, ofreciendo una opcion de despliegue rapida y estandar en entornos de produccion.
- Base para experimentos de comparacion de cuantizacion: dado que es un checkpoint de control con pesos data-free, sirve para aislar el efecto de la calibracion en otras variantes FP8 o AWQ.
- Prototipado de aplicaciones de NLP en arabe: el modelo base es especificamente disenado para avanzar la tecnologia de lengua arabe, por lo que este checkpoint puede usarse en tareas de generacion de texto, resumen o clasificacion en ese idioma.
- Integracion en pipelines de RAG (Retrieval-Augmented Generation): al ser un modelo de instruccion, puede responder consultas basadas en documentos recuperados, con menor huella de memoria que el modelo FP16.
- Investigacion de tecnicas de cuantizacion: el codigo y la configuracion de calibracion estan documentados, lo que permite reproducir y estudiar el proceso de cuantizacion con ModelOpt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se aportan puntuaciones de MMLU, HumanEval, GSM8K ni otras evaluaciones para este checkpoint cuantizado.

## Requisitos de hardware

- VRAM estimada para inferencia: el tamaño del repositorio es de 7.5 GB, correspondiente a los pesos FP8. Con activaciones FP16 y la memoria necesaria para la cache KV, se estima que se necesitan entre 10 y 14 GB de VRAM para inferencia en batch pequeno.
- GPU recomendadas: tarjetas con al menos 12 GB de VRAM, como la RTX 4070 Ti, RTX 4080, RTX 4090, o GPUs de datacenter como A100, H100 o L4.
- Si cabe en consumer GPU: si, siempre que tenga al menos 12 GB de VRAM (ej. RTX 4070 Ti, RTX 4090).
- Opciones de despliegue: vLLM (con soporte para `modelopt`) es la opcion principal y la unica documentada. Tambien seria posible convertir el modelo a GGUF con herramientas externas y usar llama.cpp u Ollama, pero no se ha verificado la compatibilidad.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `humain-ai/ALLaM-7B-Instruct-preview` (base) | 7B | FP16 | no disponible | no disponible | HuggingFace |
| `NouraAlqasim/allam-7b-fp8-mixed` | 7B | FP8 (W8A16, con activaciones estaticas) | no disponible | no disponible | HuggingFace |
| `Azzam15/allam-7b-fp8-w8a16-mixed` (este) | 7B | FP8 (W8A16, peso-only) | no disponible | no disponible | HuggingFace |

El checkpoint de Azzam15 se diferencia de otros FP8 por no incluir escalas de activacion calibradas (solo las de peso). Esto lo hace mas sencillo de reproducir, pero puede perder algo de precision en comparacion con variantes que calibran tambien las activaciones. No se dispone de comparativas de rendimiento.

## Limitaciones y advertencias

- No es cargable con `transformers` estandar: el archivo `config.json` declara `quantization_type: modelopt`, por lo que solo puede usarse con vLLM o con el runtime de NVIDIA ModelOpt.
- La cuantizacion weight-only puede producir una degradacion de precision respecto al modelo FP16 original, aunque el MSE reportado es muy bajo (8e-08).
- No es comparable con cuantizaciones W4A4: el gap de rendimiento se debe tanto a la precision como al conjunto de tensores cuantizados.
- La licencia del modelo no esta especificada, lo que puede generar incertidumbre para uso comercial.
- No se dispone de informacion sobre sesgos o alucinaciones especificas de este checkpoint, pero al ser un modelo de 7B, puede presentar errores en tareas complejas o razonamiento largo.
- La longitud de contexto no se ha documentado en el repositorio, por lo que se desconoce su capacidad para textos largos.
- El modelo base fue entrenado principalmente para arabe e ingles; su rendimiento en otros idiomas no esta garantizado.

## Enlaces

- Modelo cuantizado: https://huggingface.co/Azzam15/allam-7b-fp8-w8a16-mixed
- Modelo base: https://huggingface.co/humain-ai/ALLaM-7B-Instruct-preview
- Articulo de referencia sobre ALLaM: https://www.saudicompute.com/articles/humain-ai-allam-7b-instruct-preview-hugging-face/
- Repositorio del modelo base en Socket: https://socket.dev/huggingface/package/humain-ai/allam-7b-instruct-preview
- Version en Ollama del modelo base: https://ollama.com/iKhalid/ALLaM:7b
