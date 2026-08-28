# AMAImedia/NOESIS-MiniCPM-V-4.6-SigLIP2-BF16

## Resumen

NOESIS-MiniCPM-V-4.6-SigLIP2-BF16 es un extracto del codificador visual SigLIP2 (torre de visión) del modelo multimodal MiniCPM-V-4.6 de OpenBMB, publicado por AMAImedia como componente independiente dentro de su plataforma de doblaje automático NOESIS. Se trata de un modelo exclusivamente de visión, sin componente de lenguaje, que produce características visuales densas a nivel de parche `[B, num_patches, 1152]` para tareas de detección de hablante activo, refinamiento de alineación forzada y control de calidad de sincronización labial.

El modelo se distribuye en BF16 nativo, con 522,3 millones de parámetros y un tamaño de repositorio de 1,0 GB. Su licencia Apache 2.0 permite uso comercial sin restricciones, lo que lo hace atractivo para integraciones en pipelines de producción audiovisual. Su relevancia radica en que ofrece un encoder visual robusto, ajustado por MiniCPM-V-4.6 sobre datos multimodales densos, sin la carga de un modelo de lenguaje completo, ideal para tareas de visión específicas en flujos de doblaje y verificación de vídeo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SigLIP2 (vision transformer, extraído de MiniCPM-V-4.6) |
| Parametros totales | 522.299.312 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, sin contexto de texto) |
| Tipos de cuantizacion | BF16 nativo; se menciona posible cuantización INT8 (~0,49 GB) pero no se proporcionan archivos |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors) y PyTorch state_dict (siglip2_vision_encoder.pt) |

## Arquitectura y entrenamiento

El modelo es un vision transformer basado en SigLIP2, específicamente la variante `so400m-patch14-384` de Google, pero con modificaciones introducidas por OpenBMB en MiniCPM-V-4.6. La torre de visión fue extraída del checkpoint completo de MiniCPM-V-4.6 (prefijo `model.vision_tower.*`, 453 tensores) y reconstruida como un `SiglipVisionModel` independiente compatible con HuggingFace Transformers. La configuración incluye 27 capas ocultas, 16 cabezas de atención, tamaño oculto de 1152, tamaño intermedio de 4304, patch size de 14 y resolución de imagen de 980 píxeles (variante de alta resolución usada dentro de MiniCPM-V-4.6). La activación es `gelu_pytorch_tanh` y la normalización usa epsilon 1e-6.

El entrenamiento original de SigLIP2 se basó en datos de imagen-texto a gran escala, y MiniCPM-V-4.6 ajustó esta torre durante el entrenamiento del MLLM con datos multimodales que incluyen imágenes múltiples, capturas densas y vídeo. Este ajuste adicional proporciona al encoder capacidades de OCR, detección con anclaje y señales temporales que el SigLIP2 original no posee, lo que lo hace más robusto para tareas de movimiento labial y recortes de rostros en escenas de película. No se dispone de información detallada sobre el número exacto de tokens de entrenamiento ni sobre el proceso de ajuste específico de esta extracción.

## Capacidades

- Extracción de características visuales densas a nivel de parche (salida `[B, num_patches, 1152]`).
- Detección de hablante activo: complementa la diarización de audio resolviendo quién habla en pantalla cuando el audio es ambiguo (solapamiento, voces fuera de cámara, música de fondo).
- Refinamiento de alineación forzada: las señales de movimiento labial ayudan a ajustar los límites temporales de palabras, mejorando la precisión en primeros planos (típicamente ±10 ms).
- Control de calidad de sincronización labial: verifica que el audio doblado se alinea con el movimiento original de los labios en el vídeo de salida.
- Capacidades de OCR y detección con anclaje heredadas del ajuste de MiniCPM-V-4.6.
- Procesamiento de imágenes de alta resolución (980 píxeles) con parches de 14x14.
- Compatible con el ecosistema HuggingFace Transformers como `SiglipVisionModel`.

## Casos de uso

- Doblaje de películas y series: el encoder se integra en la etapa 4 del pipeline NOESIS para detectar qué personaje está hablando en cada momento, incluso cuando el audio es confuso por solapamiento o música de fondo.
- Refinamiento de subtítulos y subtitulado automático: en la etapa 6, las señales de movimiento labial ajustan los timestamps de palabras generados por alineadores forzados basados solo en audio, mejorando la sincronización de subtítulos en escenas con primeros planos.
- Verificación de calidad de doblaje: en la etapa 16, tras renderizar el audio doblado, el modelo comprueba que el nuevo audio coincide con el movimiento labial original, actuando como control de calidad final antes de la entrega.
- Análisis de vídeo para producción audiovisual: extracción de características visuales de escenas para tareas de indexación, búsqueda y clasificación de contenido basado en presencia de hablantes.
- Sistemas de videovigilancia con detección de hablante: identificación de quién habla en grabaciones de cámaras de seguridad cuando hay múltiples personas en el encuadre.
- Investigación en visión por computador: como encoder visual preentrenado y ajustado, puede servir como base para experimentos de fine-tuning en tareas de análisis de movimiento facial y labial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no incluye métricas de rendimiento en tareas estándar como MMLU, HumanEval o GSM8K, ya que es un componente de visión puro y no un modelo de lenguaje. La única referencia de rendimiento es cualitativa: la model card indica que la torre ajustada por MiniCPM-V-4.6 supera al SigLIP2 original en tareas de movimiento labial y recortes de rostros, pero no se proporcionan cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: ~0,97 GB en BF16/FP16; ~0,49 GB en INT8 si se cuantiza (según la model card).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia en BF16. Modelos como NVIDIA GTX 1060 6GB, RTX 2060, RTX 3060, RTX 4090 o superiores funcionan sin problemas. También es viable en Apple Silicon con Metal.
- Cabe en GPUs de consumo: sí, incluso en las más modestas (por ejemplo, GTX 1650 con 4 GB).
- Opciones de despliegue: al ser un modelo `SiglipVisionModel` estándar, se puede cargar con HuggingFace Transformers en Python. También es compatible con entornos de inferencia como vLLM (si se integra como parte de un pipeline multimodal), aunque para uso aislado basta con PyTorch. No se menciona soporte para llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se proporcionan datos específicos. Dado el tamaño (522M parámetros) y la resolución de entrada (980x980), se espera una latencia de decenas de milisegundos por imagen en GPUs modernas, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución | Licencia | Uso principal |
|---|---|---|---|---|
| NOESIS-MiniCPM-V-4.6-SigLIP2-BF16 (este) | 522M | 980 | Apache 2.0 | Visión pura, extraído de MiniCPM-V-4.6 |
| Google SigLIP2-so400m-patch14-384 | ~400M | 384 | Apache 2.0 | Visión pura, base original sin ajuste de MiniCPM |
| MiniCPM-V-4.6 completo | 1.3B (total) | 980 | Apache 2.0 | MLLM completo (visión + lenguaje) |

La comparativa se basa en la información disponible. El modelo NOESIS es una extracción del vision tower de MiniCPM-V-4.6, por lo que comparte arquitectura con el SigLIP2 original pero con ajustes adicionales. El MiniCPM-V-4.6 completo incluye además un modelo de lenguaje (Qwen3.5-0.8B) y soporte multimodal, pero no es necesario para tareas de visión pura. No se dispone de datos de rendimiento cuantitativos para comparar directamente.

## Limitaciones y advertencias

- Es un modelo de visión únicamente: no procesa texto ni genera lenguaje. No debe usarse como MLLM.
- La resolución de entrada es fija (980x980) según la configuración; imágenes con otras dimensiones requieren preprocesamiento (resize/normalize) como se indica en `preprocessor_config.json`.
- No se han publicado evaluaciones de sesgos o alucinaciones visuales. Al ser un encoder, no genera contenido, pero las características extraídas pueden reflejar sesgos de los datos de entrenamiento de SigLIP2 y MiniCPM-V-4.6.
- La model card menciona que el modelo está pensado para el pipeline NOESIS; su uso fuera de ese contexto puede requerir adaptación.
- No se proporcionan garantías de rendimiento en tareas distintas a las descritas (detección de hablante, alineación labial, QC de lip-sync).
- Aunque la licencia es Apache 2.0 y permite uso comercial, el modelo deriva de MiniCPM-V-4.6 (Apache 2.0) y SigLIP2 (Apache 2.0), por lo que no hay restricciones adicionales conocidas.
- El repositorio no incluye documentación sobre el proceso de extracción más allá del manifiesto; se recomienda revisar `extraction_manifest.json` para detalles de procedencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AMAImedia/NOESIS-MiniCPM-V-4.6-SigLIP2-BF16
- Modelo base MiniCPM-V-4.6: https://huggingface.co/openbmb/MiniCPM-V-4.6
- Repositorio GitHub de MiniCPM-V: https://github.com/OpenBMB/MiniCPM-V
- Página de MiniCPM-V-4.6 en ModelScope: https://www.modelscope.cn/models/OpenBMB/MiniCPM-V-4.6
- Documentación de MiniCPM-V-4.6 en mlx-vlm: https://github.com/Blaizzy/mlx-vlm/blob/main/mlx_vlm/models/minicpmv4_6/README.md
- Artículo de SigLIP2 (referencia en tags): arxiv:2408.01800
- Artículo de NOESIS (referencia en tags): arxiv:2509.18154
