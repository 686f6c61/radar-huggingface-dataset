# litert-community/SmolVLM2-2.2B

## Resumen

SmolVLM2-2.2B es la variante más grande y capaz de la familia SmolVLM2 de Hugging Face, un modelo multimodal de visión-lenguaje (VLM) diseñado para ejecutarse en dispositivos con recursos limitados. Esta versión concreta, publicada por la comunidad `litert-community`, es una conversión del modelo original `HuggingFaceTB/SmolVLM2-2.2B-Instruct` al formato `.litertlm` de LiteRT-LM, el runtime de Google para inferencia on-device. El modelo combina un encoder de visión SigLIP con un decoder de lenguaje basado en SmolLM2-1.7B (arquitectura Llama), y está cuantizado a int4 e int8 para funcionar eficientemente en CPU y GPU de dispositivos móviles y de escritorio.

La relevancia de este modelo radica en que permite ejecutar tareas de respuesta a preguntas visuales (VQA) y descripción de imágenes completamente offline, sin conexión a servidores, con un consumo de memoria reducido (pico de 863 MB en un Samsung Galaxy S26). Está pensado para desarrolladores que necesitan integrar capacidades multimodales en aplicaciones de edge, asistentes personales o herramientas de accesibilidad, aprovechando la licencia Apache 2.0 que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SigLIP vision encoder (384x384, patch 14) + pixel-shuffle connector + SmolLM2-1.7B decoder (Llama, 24 capas, 2048 dim) |
| Parametros totales | 2.2B (vision + decoder) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 2048 tokens (KV cache) |
| Tipos de cuantizacion | int4 (decoder, blockwise-32 + OCTAV), int8 (vision encoder y embeddings) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | .litertlm (LiteRT-LM) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura multimodal clásica: un encoder de visión SigLIP procesa imágenes de 384x384 píxeles, dividiéndolas en parches de 14x14 (729 parches sin token CLS). Un conector pixel-shuffle (factor 3) reduce la dimensionalidad y un Linear proyecta las características a 81 tokens de imagen que se alimentan al decoder de lenguaje. El decoder es SmolLM2-1.7B, un transformer de arquitectura Llama con 24 capas y dimensión de 2048, que genera texto autoregresivamente.

No se dispone de información detallada sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO) en la documentación proporcionada. Esta versión concreta es una conversión del checkpoint `HuggingFaceTB/SmolVLM2-2.2B-Instruct` al formato LiteRT-LM, realizada por la comunidad, sin modificaciones en los pesos. La cuantización a int4 e int8 se aplicó durante la conversión para optimizar la inferencia en dispositivos de bajo consumo.

## Capacidades

- Respuesta a preguntas visuales (VQA) sobre una imagen, generando respuestas coherentes y ancladas al contenido visual.
- Descripción de imágenes (image captioning) en lenguaje natural.
- Chat multimodal interactivo: permite conversaciones de texto con una imagen adjunta.
- Soporte de múltiples imágenes en una misma conversación (aunque se recomienda una imagen por chat para resultados óptimos).
- Ejecución completamente offline, sin necesidad de conexión a internet.
- Compatible con backends de CPU y GPU en macOS, Linux, Windows y Android.
- Exposición como API local compatible con OpenAI mediante `litert-lm serve`.

## Casos de uso

- Asistente de accesibilidad para personas con discapacidad visual: el modelo puede describir el entorno capturado por la cámara del móvil en tiempo real, ayudando a identificar objetos, personas o texto.
- Atención al cliente automatizada con soporte visual: un chatbot puede recibir capturas de pantalla o fotos de productos y responder preguntas sobre ellos, gracias a su capacidad de VQA y su contexto de 2048 tokens.
- Etiquetado y organización de fotos en aplicaciones de galería: el modelo genera descripciones automáticas de imágenes para facilitar la búsqueda y clasificación sin enviar datos a la nube.
- Herramienta de documentación técnica: un desarrollador puede capturar una imagen de un diagrama o esquema y obtener una explicación textual, útil para generar documentación o notas de reunión.
- Asistente de compras en dispositivos móviles: el usuario fotografía un producto y el modelo identifica características visibles (color, forma, etiquetas) para ayudar en la decisión de compra.
- Aplicación educativa de ciencias naturales: los estudiantes pueden fotografiar plantas, animales u objetos y recibir descripciones y respuestas a preguntas sobre ellos, funcionando sin conexión en entornos rurales o sin cobertura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye mediciones de rendimiento de inferencia, no métricas de precisión (como MMLU, HumanEval o VQA). Los datos de velocidad proporcionados son:

| Dispositivo | Backend | Prefill (256 tokens) | Decode | TTFT |
|---|---|---|---|---|
| Apple M4 Max (macOS) | CPU | 119 tok/s | 33.6 tok/s | 2.34 s |
| Apple M4 Max (macOS) | GPU (Metal) | 1608 tok/s | 134.7 tok/s | 0.18 s |

Estas cifras cubren solo la ruta de texto; el encoder de visión se ejecuta una vez por imagen y no está incluido.

## Requisitos de hardware

- Memoria pico medida: 863 MB en un Samsung Galaxy S26 (SM-S942Q) con backend GPU, durante una ejecución de texto.
- Dispositivos probados: Apple M4 Max (CPU y GPU Metal), Samsung Galaxy S26 (GPU LiteRT), y cualquier sistema macOS, Linux o Windows compatible con LiteRT-LM.
- Compatible con GPU de consumo: sí, siempre que el runtime LiteRT-LM soporte el backend (Metal en macOS, GPU en Android, XNNPACK en CPU).
- Opciones de despliegue: CLI `litert-lm run` para chat interactivo, `litert-lm serve` para API local compatible con OpenAI, y la app Google AI Edge Gallery para Android (importación directa desde Hugging Face en v1.0.16+).
- Latencia y throughput: en Apple M4 Max, prefill de 1608 tok/s y decode de 134.7 tok/s con GPU Metal; en CPU, 119 tok/s y 33.6 tok/s respectivamente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| SmolVLM2-2.2B (litert-community) | 2.2B | 2048 | .litertlm | Apache 2.0 | Conversión on-device, cuantizado int4/int8 |
| SmolVLM2-500M (litert-community) | 0.5B | no disponible | .litertlm | Apache 2.0 | Versión más pequeña, menos capaz según la model card |
| HuggingFaceTB/SmolVLM2-2.2B-Instruct | 2.2B | no disponible | safetensors | Apache 2.0 | Modelo base original, sin cuantizar, requiere más recursos |

No se dispone de comparativas con otros VLM on-device (como Phi-3-vision o LLaVA) en la información proporcionada.

## Limitaciones y advertencias

- Diseñado para una imagen por conversación: la model card recomienda iniciar una nueva conversación para cada imagen, ya que el rendimiento con múltiples imágenes no está garantizado.
- Contexto limitado a 2048 tokens, lo que restringe la longitud de las conversaciones y la cantidad de texto que puede procesarse junto a la imagen.
- Idiomas soportados no especificados: no se indica qué idiomas maneja correctamente, por lo que el rendimiento en lenguas distintas del inglés puede ser variable.
- Riesgo de alucinación: como todo modelo generativo, puede producir descripciones o respuestas inventadas si la imagen es ambigua o de baja calidad.
- Sesgos potenciales: al ser una conversión de un modelo entrenado por Hugging Face, puede heredar sesgos presentes en los datos de entrenamiento originales, aunque no se documentan explícitamente.
- La cuantización int4 puede degradar ligeramente la precisión en comparación con el modelo original en precisión completa, aunque la model card indica una correlación cercana a 1.0 con el encoder de visión de referencia.
- Para uso en producción, se recomienda validar el comportamiento en el dispositivo objetivo, ya que el rendimiento varía significativamente entre backends (CPU vs GPU) y plataformas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/litert-community/SmolVLM2-2.2B
- Modelo base original: https://huggingface.co/HuggingFaceTB/SmolVLM2-2.2B-Instruct
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Repositorio de la familia SmolLM/SmolVLM: https://github.com/huggingface/smollm
- Ejemplo de conversión PyTorch con LiteRT: https://github.com/google-ai-edge/litert-torch/blob/main/litert_torch/generative/examples/smolvlm2/smolvlm2.py
- App Google AI Edge Gallery: https://github.com/google-ai-edge/gallery
- Guía de GPU para Android: https://github.com/john-rocky/hf-to-litertlm/blob/main/docs/android-gpu.md
