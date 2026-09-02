# fromR/Krea-2-Turbo-FP8_for_AmuseAI

## Resumen

Krea-2-Turbo es la variante destilada del modelo de difusión texto a imagen Krea 2, desarrollado por Krea AI y publicado originalmente en junio de 2026. Esta versión Turbo está optimizada para generar imágenes en pocos pasos de inferencia (típicamente 8), lo que la hace especialmente adecuada para flujos de trabajo en tiempo real y hardware de consumo. La distribución aquí descrita es un paquete no oficial preparado por el usuario `fromR` para su uso con AmuseAI, que incluye los pesos del modelo en cuantización FP8, el text encoder Krea2 Engineer V1, un pipeline personalizado y documentación de instalación.

La relevancia de este paquete radica en que la cuantización FP8 (float8_e4m3fn) reduce el tamaño del modelo de los 24,76 GiB originales en BF16 a aproximadamente 12,01 GiB, permitiendo su ejecución en GPUs de 16 GB y 24 GB sin pérdida significativa de calidad. Aunque se trata de una distribución comunitaria no oficial, ofrece una vía práctica para reproducir la configuración validada en AmuseAI y para integrar Krea-2-Turbo en entornos de producción locales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (texto a imagen) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | FP8 (float8_e4m3fn), weight-only |
| Idiomas soportados | no disponible (presumiblemente inglés, no confirmado) |
| Licencia | krea-2-community-license (requiere revisión del PDF adjunto) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Krea-2-Turbo es un modelo de difusión basado en arquitectura transformer, diseñado para generar imágenes a partir de descripciones en lenguaje natural. La versión Turbo es una destilación del modelo base Krea 2, que reduce el número de pasos de inferencia necesarios (de decenas a 8) manteniendo una calidad visual competitiva. El paquete FP8 que nos ocupa emplea una cuantización weight-only en formato float8_e4m3fn, lo que reduce el peso del modelo a aproximadamente la mitad sin modificar la arquitectura subyacente.

Los detalles específicos del entrenamiento (número de tokens, composición del dataset, uso de RLHF o técnicas de alineación) no están disponibles en la información proporcionada. No se mencionan innovaciones técnicas adicionales más allá de la destilación propia de la versión Turbo y la optimización FP8 para eficiencia de memoria.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con alta calidad estética.
- Inferencia en pocos pasos (8 pasos típicos), lo que permite tiempos de generación reducidos.
- Compatible con la librería `diffusers` de Hugging Face y con ComfyUI mediante nodos estándar.
- Integración específica con el backend PythonDiffusers de AmuseAI mediante el pipeline personalizado `Krea2Pipeline_for_AmuseAI.py`.
- Soporte de resolución hasta 1280×720 en GPUs de 24 GB (verificado en RTX 3090).
- No se han documentado capacidades adicionales como tool calling, agentes o procesamiento multimodal más allá de imagen.

## Casos de uso

- Generación de conceptos y exploración de diseño: el modelo permite iterar rápidamente sobre ideas visuales a partir de descripciones textuales, gracias a su baja latencia (8 pasos) y su capacidad para ejecutarse en hardware de consumo.
- Producción visual en flujos de trabajo locales: con la cuantización FP8, es viable desplegar Krea-2-Turbo en estaciones de trabajo con GPUs de 16 GB o 24 GB, integrándolo en pipelines de generación masiva de assets.
- Integración en aplicaciones creativas: al ser compatible con `diffusers`, puede incorporarse en herramientas de edición de imagen, generadores de variaciones o asistentes de diseño mediante una API Python.
- Prototipado rápido para estudios de diseño: la versión Turbo permite generar borradores visuales en tiempo real durante sesiones de lluvia de ideas, sin necesidad de infraestructura cloud.
- Investigación en generación de imágenes: el modelo sirve como base para experimentos de fine-tuning, control de condiciones o evaluación de técnicas de cuantización.
- Despliegue en entornos AmuseAI: el paquete está específicamente preparado para reproducir la configuración validada en AmuseAI, facilitando la adopción en entornos que ya usan este backend.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos comparativos de MMLU, HumanEval o métricas de generación de imágenes (FID, CLIP score, etc.) en las fuentes consultadas.

## Requisitos de hardware

- VRAM estimada: la cuantización FP8 reduce el modelo a ~12 GiB, por lo que se requiere al menos 16 GB de VRAM para inferencia cómoda. En una RTX 3090 (24 GB) se ha verificado la generación a 1280×720 con 8 pasos.
- GPUs recomendadas: RTX 3090, RTX 4090, A5000, A6000 u otras con 16 GB o más de VRAM. GPUs con 8 GB pueden ser insuficientes.
- Si cabe en GPU de consumo: sí, en tarjetas de 16 GB y 24 GB como las mencionadas.
- Opciones de despliegue: ComfyUI (nativo, sin nodos personalizados), Hugging Face `diffusers`, AmuseAI con el pipeline incluido, y potencialmente otros frameworks compatibles con safetensors.
- Latencia y throughput: no disponible, aunque el artículo de smeltcore.com indica tiempos razonables en RTX 3090 para 8 pasos a 1280×720.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos. No obstante, Krea-2-Turbo puede situarse en la categoría de modelos de difusión texto a imagen de pocos pasos, similar a SDXL Turbo o LCM-LoRA. La principal diferencia es su origen (Krea AI, entrenado desde cero) y su optimización FP8 para hardware de consumo. No se han encontrado comparativas cuantitativas con otros modelos en la información revisada.

## Limitaciones y advertencias

- Distribución no oficial: el paquete no es un lanzamiento oficial de Krea.ai ni de AmuseAI; puede contener parches o configuraciones no soportadas.
- Licencia comunitaria: la licencia `krea-2-community-license` debe revisarse detenidamente antes de uso comercial; puede imponer restricciones de atribución o de uso.
- Sesgos y alucinaciones: como todo modelo generativo, puede producir imágenes con contenido no deseado o inexacto, especialmente con prompts ambiguos.
- Limitaciones de idioma: no se han especificado los idiomas soportados; es probable que el text encoder esté optimizado para inglés.
- Requisitos de revisión: se recomienda verificar los checksums SHA256 y leer la documentación de parches incluida antes de integrar el modelo en producción.
- Sin garantías de soporte: al ser un paquete comunitario, no hay garantía de actualizaciones o corrección de errores.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/fromR/Krea-2-Turbo-FP8_for_AmuseAI
- Versión FP8 oficial de unsloth: https://huggingface.co/unsloth/Krea-2-Turbo-FP8
- Artículo de despliegue en RTX 3090: https://smeltcore.com/recipes/krea-2-rtx-3090/
- Página en Civitai (checkpoint): https://civitai.com/models/2723583/krea2-turbofp8
- Checkpoints oficiales de Comfy-Org en Civitai: https://civitai.com/models/2726029/krea-2-turbo-official-comfy-org-checkpoints-krea2
