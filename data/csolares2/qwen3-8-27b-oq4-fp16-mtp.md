# csolares2/Qwen3.8-27B-oQ4-fp16-mtp

## Resumen

Qwen3.8-27B-oQ4-fp16-mtp es una cuantizacion en 4 bits del modelo Qwen3.8-27B, realizada con la herramienta oQ (oMLX v0.6.0.dev1) en formato MLX safetensors. El modelo original, desarrollado por Alibaba, es un transformer denso de 27.000 millones de parametros con capacidades de vision y razonamiento, disenado para tareas de codificacion agente, trabajo profesional, investigacion y agentes de largo horizonte. Su ventana de contexto nativa alcanza los 262.000 tokens, lo que lo hace adecuado para procesar documentos extensos y conversaciones multi-turno.

Esta version cuantizada reduce el peso del modelo a aproximadamente 17,9 GB, permitiendo su ejecucion en equipos con 24 GB de VRAM o en hardware Apple Silicon mediante MLX. La cuantizacion mixta de precision (oQ) mantiene la calidad del modelo original a la vez que reduce los requisitos de memoria, lo que lo convierte en una opcion practica para despliegues locales en entornos de desarrollo e investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con encoder de vision (qwen3_5) |
| Parametros totales | 27.000.000.000 (original); 4.926.789.872 (en safetensors cuantizado) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.000 tokens |
| Tipos de cuantizacion | 4 bits, group size 64, mixed-precision oQ |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (segun fuentes web; no indicada en la model card) |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo original Qwen3.8-27B es un transformer denso de 27.000 millones de parametros con un encoder de vision integrado, lo que le permite procesar tanto texto como imagenes. Incluye un modo de razonamiento configurable (similar a un "thinking mode") que puede activarse o desactivarse segun la tarea. La ventana de contexto de 262.000 tokens es nativa, sin necesidad de tecnicas de extension como RoPE scaling. El entrenamiento se ha orientado a tareas ageneticas de largo horizonte, incluyendo uso de herramientas y razonamiento multi-paso, aunque no se han publicado detalles especificos sobre el dataset o el numero de tokens de entrenamiento en la informacion disponible.

La cuantizacion oQ aplicada en esta version utiliza una precision mixta de 4 bits con un group size de 64, lo que reduce el tamaño de los pesos manteniendo las capas criticas en mayor precision. El resultado es un archivo de 17,9 GB que conserva la funcionalidad completa del modelo original, incluida la vision y el razonamiento.

## Capacidades

- Generacion de texto y chat en lenguaje natural.
- Razonamiento multi-paso configurable (modo thinking activable/desactivable).
- Procesamiento de vision: entrada de imagenes y comprension visual (encoder de vision integrado).
- Codificacion de software: generacion, revision y depuracion de codigo.
- Tool calling y function calling para integracion con APIs y servicios externos.
- Capacidades ageneticas: planificacion y ejecucion de tareas de largo horizonte.
- Soporte de contexto largo (262K tokens) para documentos extensos y conversaciones prolongadas.
- Capacidades multilingues: no confirmadas en la informacion disponible, aunque los modelos Qwen suelen ser multilingues.

## Casos de uso

- Desarrollo de software asistido: el modelo puede generar codigo, explicar fragmentos, detectar errores y sugerir refactorizaciones, integrándose en entornos de desarrollo o pipelines de CI/CD mediante tool calling.
- Atencion al cliente automatizada: gracias a su ventana de 262K tokens, puede mantener conversaciones multi-turno con historial extenso y consultar bases de conocimiento internas a traves de funciones.
- Analisis de documentos con imagenes: su capacidad de vision permite extraer informacion de capturas, diagramas o formularios escaneados dentro de un mismo flujo de trabajo.
- Agentes autonomos de investigacion: puede planificar y ejecutar busquedas web, resumir articulos y compilar informes, utilizando tool calling para interactuar con navegadores o APIs.
- Asistente de productividad para oficina: redaccion de informes, resumen de reuniones, generacion de presentaciones a partir de notas y gestion de correos electronicos.
- Educacion y formacion tecnica: explicacion de conceptos complejos, generacion de ejercicios y correccion de tareas, con capacidad de razonamiento para adaptar las respuestas al nivel del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las fuentes web mencionan que el modelo original tiene benchmarks publicados, pero no se incluyen cifras concretas en los materiales proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 18-20 GB para cargar los pesos en 4 bits (17,9 GB de archivo), mas overhead de activaciones y cache. Con cuantizacion adicional o offloading, podria reducirse a ~16 GB.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB), A100 40GB, H100, o GPUs AMD con soporte ROCm. En Apple Silicon, se ejecuta nativamente via MLX con 32 GB o mas de memoria unificada.
- En consumer GPU: cabe en tarjetas con 24 GB de VRAM (RTX 3090, 4090, 5090). Con 16 GB podria ser ajustado usando offloading de capas.
- Opciones de despliegue: MLX (Apple Silicon), conversion a GGUF para llama.cpp/Ollama, o vLLM/SGLang para servidores con GPUs NVIDIA (requiere convertir los pesos a formato HuggingFace).
- Latencia y throughput: no disponibles; dependen del hardware y del backend utilizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | 262K | Si | Apache 2.0 | HF, GGUF, MLX |
| Qwen2.5-32B | 32B | 128K | No | Apache 2.0 | HF, GGUF |
| Llama 3.1 8B | 8B | 128K | No | Llama 3.1 | HF, GGUF |

La comparativa es orientativa: Qwen3.8-27B destaca por su vision y contexto largo, mientras que Qwen2.5-32B es un modelo de texto puro con mas parametros. Llama 3.1 8B es significativamente mas pequeño y rapido, pero con menos capacidades. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion en 4 bits puede producir una ligera degradacion en la precision de tareas complejas de razonamiento o generacion de codigo en comparacion con el modelo original en FP16.
- No se han documentado sesgos especificos, pero como modelo de lenguaje, puede reflejar sesgos presentes en sus datos de entrenamiento.
- Riesgo de alucinacion en contextos factuales o cuando se le pide informacion precisa sin acceso a fuentes externas.
- La licencia Apache 2.0 permite uso comercial y modificacion, pero el autor de la cuantizacion no ha indicado restricciones adicionales.
- El formato MLX safetensors es especifico de Apple Silicon; para otros entornos es necesario convertir a GGUF o al formato HuggingFace, lo que puede requerir herramientas adicionales.
- No se ha verificado el rendimiento en produccion; se recomienda realizar pruebas exhaustivas antes de desplegarlo en aplicaciones criticas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/csolares2/Qwen3.8-27B-oQ4-fp16-mtp
- Documentacion de Qwen3.8 en Unsloth: https://unsloth.ai/docs/models/qwen3.8
- Ficha en LM Studio: https://lmstudio.ai/models/qwen3.8
- Guia de ejecucion local (SWFTE): https://www.swfte.com/blog/qwen-3-8-27b-run-locally-self-host-guide-2026
- Blog de AMD sobre soporte: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Especificaciones y requisitos (Yottalabs): https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
