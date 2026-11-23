# Kling-Keye/Keye-VL-1_5-8B

## Resumen

Kwai Keye-VL-1.5 es un modelo de lenguaje multimodal (MLLM) desarrollado por el Kwai Keye Team de Kuaishou, disenado especificamente para abordar retos fundamentales en la comprension de video. El modelo combina percepción visual, comprensión de video y razonamiento en una unica arquitectura de aproximadamente 8.700 millones de parametros (8.696.835.648 segun los pesos en safetensors). Es la version 1.5 de la familia Keye-VL, publicada el 28 de agosto de 2025, y sucede al Keye-VL-8B-Preview.

La innovacion principal reside en su estrategia de codificacion de video Slow-Fast, una metodologia de preentrenamiento progresivo en cuatro etapas que extiende la longitud de contexto hasta 128.000 tokens, y un pipeline de postentrenamiento orientado a la mejora del razonamiento y la alineacion con preferencias humanas mediante RL. El modelo esta disponible bajo licencia Apache 2.0, lo que facilita su adopcion comercial y su integracion en pipelines de produccion.

El modelo resulta relevante porque cubre una carencia habitual en los MLLM abiertos: la comprension de video de larga duracion con contexto extendido. Ademas, incorpora modos de razonamiento explicitos (thinking, auto-thinking y no-thinking) que permiten al desarrollador elegir entre latencia baja o razonamiento profundo segun la tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (MLLM) con codificacion de video Slow-Fast; detalles internos no disponibles |
| Parametros totales | 8.696.835.648 (aprox. 8,7 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 128.000 tokens |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en safetensors; soporte de cuantizacion via vLLM no confirmado) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria transformers, requiere `trust_remote_code`) |

## Arquitectura y entrenamiento

Keye-VL-1.5 es un modelo multimodal que procesa texto, imagenes y video. Su rasgo arquitectonico mas destacado es la estrategia de codificacion de video Slow-Fast, que combina un muestreo denso de fotogramas (slow) con un procesamiento de menor frecuencia (fast) para capturar tanto detalles finos como dinamica temporal a lo largo de secuencias largas. El modelo emplea un procesador visual que permite ajustar el numero de tokens visuales por imagen en un rango de 4 a 20.480, lo que posibilita equilibrar coste y rendimiento mediante los parametros `min_pixels` y `max_pixels`.

El entrenamiento se estructura en cuatro etapas progresivas de preentrenamiento que extienden el contexto hasta 128K tokens. El postentrenamiento incorpora un pipeline de datos LongCoT (cadena de pensamiento larga) para el arranque en frio del razonamiento, seguido de estrategias avanzadas de aprendizaje por refuerzo (RL) y alineacion con preferencias humanas. El modelo soporta tres modos de inferencia controlados mediante marcadores en el prompt: `/no_think` (respuesta directa), sin marcador (auto-thinking) y `/think` (razonamiento explicito). El numero exacto de tokens de entrenamiento y la composicion del dataset no estan disponibles en la informacion proporcionada.

## Capacidades

- Comprension de video: analisis de secuencias de video con contexto de hasta 128K tokens, incluyendo contenido de larga duracion.
- Comprension de imagenes: descripcion, reconocimiento y razonamiento visual sobre imagenes individuales.
- Razonamiento multimodal: modos thinking, auto-thinking y no-thinking seleccionables por prompt.
- Generacion de texto: respuestas en lenguaje natural derivadas de entradas multimodales.
- Razonamiento de multiples pasos: soportado mediante el modo thinking y el pipeline LongCoT.
- Procesamiento de vision con resolucion adaptable: rango configurable de 4 a 20.480 tokens visuales por imagen.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente: no confirmadas en la informacion proporcionada.

## Casos de uso

- Analisis de video de larga duracion: el modelo puede procesar videos extensos gracias a su contexto de 128K tokens y a la codificacion Slow-Fast, lo que permite resumir o responder preguntas sobre grabaciones completas sin truncar el contenido.
- Moderacion de contenido audiovisual: clasificacion y descripcion de escenas en plataformas de video, aprovechando la comprension temporal para detectar contenido inapropiado a lo largo de una secuencia.
- Accesibilidad y subtitulado descriptivo: generacion de descripciones detalladas de video para personas con discapacidad visual, usando el modo no-thinking para baja latencia en emision en directo.
- Analisis de vigilancia y monitorizacion: interpretacion de grabaciones de camaras de seguridad, con razonamiento explicito en modo thinking para justificar alertas sobre eventos detectados.
- Extraccion de informacion de documentos escaneados y capturas: procesamiento de imagenes de alta resolucion con el rango ampliado de tokens visuales para tareas de OCR y comprension de documentos.
- Investigacion en comprension de video: evaluacion y experimentacion academica sobre modelos multimodales de contexto largo, gracias a la licencia Apache 2.0 y a la disponibilidad de informe tecnico.
- Asistentes conversacionales con entrada visual: integracion en chatbots que reciben imagenes o clips y mantienen conversaciones multi-turno con contexto extendido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona mejoras significativas en tareas de comprension de video y un rendimiento competitivo en benchmarks multimodales generales, pero no incluye cifras concretas (MMLU, VideoMME, MVBench u otros) en el contenido proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8,7 B parametros en precision FP16/BF16, se requieren aproximadamente 17,4 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda un minimo de 24 GB de VRAM.
- GPU recomendadas: A100 (40/80 GB), H100 (80 GB) para despliegue en produccion; RTX 4090 (24 GB) para inferencia en FP16 con contexto limitado.
- GPU de consumo: cabe en RTX 4090 (24 GB) en BF16 para contextos moderados; en GPUs de 16 GB seria necesaria cuantizacion, cuyo soporte no esta confirmado en la informacion proporcionada.
- Opciones de despliegue: transformers con `trust_remote_code=True` y `flash_attention_2` recomendado; vLLM (soporte anunciado desde julio de 2025); ms-swift (ModelScope SWIFT). No se confirma soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada. El modo no-thinking reduce la latencia al omitir el razonamiento explicito.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Keye-VL-1.5-8B | 8,7 B | 128K | Video-texto, Slow-Fast, thinking modes | Apache 2.0 | Hugging Face, vLLM |
| Keye-VL-8B-Preview | Aprox. 8 B (no confirmado) | No disponible | Video-texto (version previa) | No confirmada | Hugging Face |
| Alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la informacion proporcionada de datos de rendimiento ni especificaciones de modelos competidores que permitan una comparativa cuantitativa fiable. La unica comparacion directa disponible es con la version previa Keye-VL-8B-Preview, de la que la model card indica que la 1.5 ofrece mejoras en comprension de video, imagenes y razonamiento, ademas de contexto ampliado a 128K.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados explicitamente en la informacion proporcionada; al entrenarse principalmente con datos en ingles, puede presentar sesgos culturales y linguisticos propios de ese corpus.
- Riesgo de alucinacion: presente como en cualquier MLLM; el modo thinking puede reducir errores en tareas de razonamiento, pero no los elimina.
- Limitaciones de idioma: la model card declara unicamente ingles (`en`); el rendimiento en castellano u otros idiomas no esta garantizado.
- Limitaciones de contexto: aunque el contexto es de 128K tokens, el coste computacional y la VRAM crecen de forma cuadratica con la longitud; en GPUs de consumo el contexto practico sera mucho menor.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, pero se recomienda revisar las condiciones de los pesos y del codigo remoto (`trust_remote_code`) antes de desplegar en produccion.
- Dependencia de codigo remoto: requiere `trust_remote_code=True` y el paquete `keye-vl-utils`, lo que introduce una dependencia adicional de mantenimiento y supervision.
- Advertencia de produccion: el modelo se publico recientemente y no cuenta con descargas ni validacion de la comunidad (0 descargas, 0 likes en el momento de la ficha); conviene validar su comportamiento en el dominio concreto antes de adoptarlo.

## Enlaces

- Hugging Face: https://huggingface.co/Kling-Keye/Keye-VL-1_5-8B
- Version previa: https://huggingface.co/Kwai-Keye/Keye-VL-8B-Preview
- Informe tecnico (arXiv 2509.01563): https://arxiv.org/abs/2509.01563
- Informe tecnico anterior (arXiv 2507.01949): https://arxiv.org/abs/2507.01949
- Repositorio GitHub: https://github.com/Kwai-Keye/Keye
- Pagina del proyecto: https://kwai-keye.github.io/
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/Kwai-Keye/Keye-VL-8B-Preview
- X (Twitter): https://x.com/KwaiKeye
- Discord: https://discord.gg/4Q6AmzxpEK
- vLLM: https://github.com/vllm-project/vllm
- ms-swift: https://github.com/modelscope/ms-swift
