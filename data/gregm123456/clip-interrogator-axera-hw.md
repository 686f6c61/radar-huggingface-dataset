# gregm123456/clip-interrogator-axera-hw

## Resumen

Este repositorio contiene una compilación derivada de **CLIP ViT-B/32** (`openai/clip-vit-base-patch32`) optimizada para ejecución de alta velocidad en hardware Axera (AX650N / LLM8850, NPU3). El mantenedor, `gregm123456`, no es el creador original del modelo CLIP, sino que ha realizado la exportación, cuantización y compilación para la plataforma NPU de Axera. El resultado son dos archivos `.axmodel` (encoder de visión y encoder de texto) que permiten realizar clasificación de imágenes zero-shot y "interrogación" de imágenes (comparación forzada entre una imagen y un conjunto de etiquetas de texto) en dispositivos de bajo consumo como una Raspberry Pi 5 con acelerador M.2.

El modelo resuelve el problema de ejecutar CLIP en hardware de borde sin GPU, aprovechando la NPU de Axera para obtener latencias de 30-50 ms en el encoder de visión y menos de 5 ms en el de texto. Es relevante ahora porque democratiza el despliegue de modelos de visión-lenguaje en entornos embebidos, con un formato de pesos propietario (`.axmodel`) y una cuantización U16 que reduce el tamaño y acelera la inferencia. El repositorio incluye un vocabulario de 20.101 términos de ImageNet-21K y una caché de embeddings de texto precomputados para uso inmediato.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP ViT-B/32 (dos encoders: visión y texto, compilados por separado) |
| Parametros totales | no disponible (derivado de `openai/clip-vit-base-patch32`, ~86M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (CLIP usa 77 tokens de texto, pero no se especifica en la documentación) |
| Tipos de cuantizacion | U16 (uint16) vía Pulsar2 v5.1, calibración MinMax |
| Idiomas soportados | no disponibles (CLIP original está entrenado principalmente en inglés) |
| Licencia | MIT |
| Formato de pesos | `.axmodel` (compilado para Axera NPU; no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo es una compilación de CLIP ViT-B/32, que consta de un encoder de visión (ViT-B/32) y un encoder de texto (transformers), ambos exportados por separado a ONNX con `opset_version=14`, `attn_implementation="eager"` y batch estático de 1. La cuantización se realizó con Pulsar2 v5.1 usando calibración MinMax con ~50 imágenes de muestra (visión) y 50 secuencias de tokens aleatorios (texto), con precisión U16 en todas las capas. No se menciona ningún entrenamiento adicional; se trata de un modelo pre-entrenado de OpenAI compilado para NPU. Las proyecciones visuales y de texto (matrices de proyección) no están incluidas en los `.axmodel` y se aplican en CPU después de cada paso por la NPU.

## Capacidades

- Clasificación zero-shot de imágenes mediante comparación forzada entre la embedding de la imagen y un conjunto de embeddings de texto (no genera captions).
- Soporte de vocabularios personalizados: el script `clip_interrogate.py` puede precomputar embeddings para cualquier lista de etiquetas; la caché se invalida automáticamente según el hash de la lista y la plantilla de prompt.
- Clasificación estructurada por categorías con `classify_categories`, que permite clasificar múltiples campos (p. ej., género, color de pelo) en una sola pasada de imagen.
- Caché de embeddings de texto precomputados para el vocabulario de ImageNet-21K (20.101 términos), lo que evita esperas de 30-40 s en el primer uso.
- Capacidades multilingües: no disponibles (el modelo base CLIP está entrenado principalmente en inglés).
- Sin soporte de tool calling, agentes ni razonamiento multi-paso; es un modelo de clasificación puro.

## Casos de uso

- Clasificación de imágenes en dispositivos de borde: el modelo puede ejecutarse en una Raspberry Pi 5 con acelerador Axera M.2, clasificando imágenes en tiempo real (30-50 ms por imagen) para aplicaciones de visión industrial o domótica.
- Formularios demográficos estructurados: usando `classify_categories`, se puede extraer género, rango de edad o tipo de entorno de una sola imagen, con confianza por categoría, útil para encuestas o análisis de audiencia.
- Moderación de contenido: clasificar imágenes en categorías predefinidas (violencia, desnudez, etc.) con un vocabulario personalizado, aprovechando la caché de embeddings para respuestas rápidas.
- Etiquetado automático de fotos personales: generar etiquetas descriptivas (objetos, escenas, estilos) a partir de un vocabulario amplio como ImageNet-21K, sin necesidad de GPU.
- Búsqueda visual inversa: comparar una imagen de consulta contra un conjunto de etiquetas de producto o categoría para recomendaciones en comercio electrónico, con latencia de <1 ms por par imagen/etiqueta.
- Sistemas de asistencia para personas con discapacidad visual: clasificar el entorno (interior/exterior, día/noche, presencia de personas) en tiempo real en hardware de bajo consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo proporciona mediciones de latencia en hardware objetivo (Raspberry Pi 5 + Axera AX650N):

| Operacion | Hardware | Latencia |
|---|---|---|
| Vision Encoding | Axera NPU | ~30-50 ms (una vez por imagen) |
| Text Encoding | Axera NPU | <5 ms (una vez por etiqueta nueva, cacheado después) |
| Similarity Scoring | CPU | <1 ms (por par imagen/etiqueta) |

## Requisitos de hardware

- NPU objetivo: Axera AX650N / LLM8850 (NPU3), típicamente en un acelerador M.2 conectado a una Raspberry Pi 5.
- VRAM: no aplica (inferencia en NPU, no en GPU).
- GPU recomendadas: no aplica; el modelo no está diseñado para GPU.
- Compatibilidad con GPU de consumo: no, el formato `.axmodel` es específico de Axera.
- Opciones de despliegue: script Python `run_clip_interrogate.py` o API programática con `CLIPInterrogator`; requiere el paquete `axengine` y dependencias de Hugging Face (`transformers`, `torch`, `pillow`, `numpy`).
- Latencia y throughput: visión 30-50 ms por imagen, texto <5 ms por etiqueta nueva, similitud <1 ms por par; el throughput depende del número de etiquetas comparadas, pero la imagen solo requiere una pasada por la NPU.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la informacion proporcionada. El modelo es una compilación específica para hardware Axera de CLIP ViT-B/32, y no se ofrecen comparaciones con otras implementaciones de CLIP en NPU o edge.

## Limitaciones y advertencias

- No genera captions ni descripciones; solo realiza clasificación forzada entre la imagen y un conjunto de etiquetas. El autor lo indica explícitamente.
- Requiere descargar el modelo base `openai/clip-vit-base-patch32` (~1.2 GB) en el primer uso para obtener el tokenizador, el procesador de imágenes y las matrices de proyección, lo que necesita conexión a internet y puede fallar transitoriamente por límites de tasa de Hugging Face (recomienda usar `HF_TOKEN`).
- La cuantización U16 puede degradar la precisión respecto al modelo en punto flotante, aunque no se proporcionan métricas de degradación.
- El compilador de Axera no soporta batch dinámico; el modelo está fijado a batch estático de 1, lo que limita el procesamiento por lotes.
- Con vocabularios muy grandes (p. ej., 20k términos), pueden aparecer fallos conocidos en la clasificación forzada; el autor referencia `clip_constrained_output.md` para un análisis de estos modos de fallo.
- El repositorio tiene 0 descargas y 0 likes, y la fecha de creación es futura (2026-08-31), lo que sugiere que es un proyecto muy reciente o poco validado por la comunidad.
- La licencia MIT cubre el código y los archivos compilados, pero el modelo base CLIP de OpenAI tiene su propia licencia (MIT también, según la ficha de `openai/clip-vit-base-patch32`), aunque se debe verificar el cumplimiento de los términos de uso de OpenAI.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/gregm123456/clip-interrogator-axera-hw
- Modelo base: https://huggingface.co/openai/clip-vit-base-patch32
- Proyecto padre (AXERA-TECH): https://github.com/AXERA-TECH/sd1.5-lcm.axera
- Documento sobre modos de fallo en vocabularios grandes: https://github.com/AXERA-TECH/sd1.5-lcm.axera/blob/main/img2txt/clip_constrained_output.md
- CLIP Interrogator original (pharmapsychotic): https://github.com/pharmapsychotic/clip-interrogator
- Space de CLIP Interrogator en HuggingFace: https://huggingface.co/spaces/pharmapsychotic/CLIP-Interrogator
