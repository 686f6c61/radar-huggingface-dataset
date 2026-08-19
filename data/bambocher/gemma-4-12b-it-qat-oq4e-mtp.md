# bambocher/gemma-4-12B-it-qat-oQ4e-mtp

## Resumen

Este modelo es una cuantización de 4 bits del modelo multimodal Gemma 4 12B de Google, realizada con la herramienta oQ (oMLX) en formato MLX. La cuantización reduce el tamaño del modelo para facilitar su ejecución local en dispositivos con Apple Silicon, manteniendo las capacidades del modelo original. El modelo base, desarrollado por Google, es un VLM (vision-language model) encoder-free capaz de procesar texto, imagen, audio y vídeo de forma nativa, lo que lo convierte en una opción atractiva para aplicaciones de IA local. Esta versión cuantizada, publicada por el usuario bambocher, emplea cuantización mixta de precisión con 4 bits y group size 64, y está disponible en formato MLX safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma4_unified (transformer multimodal encoder-free) |
| Parametros totales | 12B (nominal, segun documentacion de Google) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ4e (4 bits, group size 64) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base Gemma 4 12B es un transformer multimodal encoder-free, lo que significa que no utiliza un codificador de visión separado, sino que procesa directamente las secuencias de texto, imagen, audio y vídeo. La arquitectura se denomina `gemma4_unified` en la model card de esta cuantización. No se dispone de detalles sobre el entrenamiento del modelo original (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO) en la información proporcionada. La cuantización se realizó con la herramienta oQ (oMLX v0.6.1) utilizando cuantización mixta de precisión, con 4 bits y group size 64. El repositorio reporta un número de parámetros de 2.396.544.308, que no coincide con la cifra nominal de 12B; esta discrepancia podría deberse a un error en la extracción de metadatos o a una particularidad del formato de cuantización, pero no se puede confirmar con la información disponible.

## Capacidades

- Generación de texto y razonamiento: el modelo base es capaz de mantener conversaciones, responder preguntas y realizar tareas de razonamiento complejo.
- Procesamiento multimodal: al ser un VLM encoder-free, puede ingerir y comprender imágenes, audio y vídeo de forma nativa, además de texto.
- Soporte de tool calling y function calling: no se especifica en la información disponible, pero es una capacidad habitual en los modelos instruct de Google.
- Capacidades multilingües: no se detallan los idiomas soportados en la información proporcionada.
- Ejecución local optimizada: gracias a la cuantización MLX, el modelo está diseñado para ejecutarse eficientemente en hardware Apple Silicon.

## Casos de uso

- Asistente personal local: el modelo puede ejecutarse en un Mac con Apple Silicon para ofrecer respuestas a preguntas, resúmenes y generación de texto sin conexión a internet, aprovechando su naturaleza multimodal para procesar fotos o vídeos del usuario.
- Análisis de vídeo y audio: gracias a su capacidad nativa de ingerir audio y vídeo, puede transcribir reuniones, extraer información de vídeos o generar subtítulos automáticamente en aplicaciones de productividad.
- Desarrollo de aplicaciones de IA en el dispositivo: los desarrolladores pueden integrar el modelo en apps de iOS o macOS mediante MLX, ofreciendo funciones de chat, análisis de imágenes o procesamiento de voz sin depender de servicios en la nube.
- Prototipado rápido de agentes conversacionales: al ser una versión cuantizada, permite iterar rápidamente en entornos de desarrollo local, probando flujos de conversación multi-turno y razonamiento sin necesidad de infraestructura GPU dedicada.
- Automatización de tareas de documentación: el modelo puede resumir documentos extensos, extraer datos de imágenes o generar informes a partir de contenido multimedia, integrándose en pipelines de procesamiento de información.
- Educación y demostraciones: al caber en un portátil con 16 GB de RAM (según la documentación de Google para el modelo base), es adecuado para talleres, clases o demostraciones de IA multimodal en entornos sin acceso a servidores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio tiene un tamaño de 8.0 GB, lo que sugiere que el modelo cuantizado puede cargarse en memoria con unos 8-10 GB de VRAM o RAM unificada.
- Está diseñado para MLX, por lo que se ejecuta de forma óptima en Mac con Apple Silicon (M1, M2, M3 o superiores).
- El modelo base de Google requiere al menos 16 GB de VRAM según su documentación, pero la cuantización a 4 bits reduce significativamente los requisitos de memoria.
- Opciones de despliegue: al ser formato MLX, se puede usar con librerías como `mlx-lm` o `oMLX`. No se menciona compatibilidad con vLLM, llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no se proporcionan datos específicos.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de la misma categoría. El modelo base Gemma 4 12B compite con otros VLM de tamaño medio como Llama 3.2 11B o Qwen2-VL 7B, pero no se han encontrado datos comparativos en la información proporcionada.

## Limitaciones y advertencias

- Al ser una cuantización de 4 bits, puede experimentarse una pérdida de precisión en tareas complejas de razonamiento o generación de código en comparación con el modelo original en punto flotante.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones idiomáticas específicas de esta versión cuantizada.
- La licencia del modelo no está especificada en la model card; se recomienda consultar la licencia del modelo base de Google (Gemma) para conocer las restricciones de uso comercial.
- El formato MLX limita el despliegue a entornos Apple Silicon; no es compatible directamente con GPUs NVIDIA o AMD sin conversión previa.
- La discrepancia en el número de parámetros reportado en el repositorio (2.396.544.308) frente a la cifra nominal de 12B podría indicar un error en los metadatos o una particularidad de la cuantización; se recomienda verificar antes de usar en producción.

## Enlaces

- [Modelo en Hugging Face: bambocher/gemma-4-12B-it-qat-oQ4e-mtp](https://huggingface.co/bambocher/gemma-4-12B-it-qat-oQ4e-mtp)
- [Modelo base: google/gemma-4-12B](https://huggingface.co/google/gemma-4-12B)
- [Modelo base cuantizado (qat): google/gemma-4-12B-it-qat-q4_0-unquantized](https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized)
- [Guía para desarrolladores de Gemma 4 12B (Google Developers Blog)](https://developers.googleblog.com/gemma-4-12b-the-developer-guide/)
- [Introducción a Gemma 4 12B (The Keyword)](https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/)
- [Repositorio de oQ (oMLX)](https://github.com/jundot/omlx)
