# gatilin/kanana-2-vision-encoder-medium

## Resumen

Kanana-2 Vision Encoder Medium es un codificador visual (vision encoder) independiente desarrollado por Kakao Corp., distribuido como espejo comunitario por el usuario `gatilin`. No se trata de un modelo multimodal completo, sino de un extractor de características visuales de 426 millones de parámetros que genera representaciones latentes de imágenes para su uso posterior en pipelines de visión-lenguaje. Forma parte de la serie Kanana-2, que incluye variantes medium (426M) y tiny (98M).

El modelo resuelve el problema de la extracción de features visuales de propósito general para comprensión de imágenes, documentos y razonamiento visual. Se distribuye con la librería Transformers bajo el pipeline `image-feature-extraction` y su función es servir como componente de codificación visual dentro de arquitecturas VLM más grandes, no como modelo autónomo de generación.

Es relevante ahora porque el espejo comunitario verifica que el archivo safetensors es byte-idéntico al original de Kakao (comprobado contra el SHA-256 de LFS), incluyendo configuración, processor e implementación sin modificar. El repositorio ocupa 0,9 GB y se publicó en noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision encoder (familia Kanana-2, implementación custom en `component.py`) |
| Parametros totales | 426.886.912 (~426M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de extracción de features, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantización documentada) |
| Idiomas soportados | no disponible |
| Licencia | kanana-open-license (Kanana Open License Agreement) |
| Formato de pesos | safetensors (verificado byte-idéntico al original vía SHA-256 LFS) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del codificador (si es ViT, SigLIP, CLIP u otra variante), ni el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Lo que sí se confirma es que se trata de un codificador visual autónomo orientado a la extracción de características (`last_hidden_state`) a partir de `pixel_values`, con un `processor` propio para el preprocesado de imágenes RGB.

El repositorio incluye la implementación original sin modificar y añade un cargador de conveniencia (`component.py`) con las funciones `load_model` y `load_processor`. La validación publicada (`validation.json`) corresponde a un smoke test en CPU con imagen real; no es una evaluación end-to-end de VLM ni una comprobación de paridad en GPU, según advierte el propio autor.

## Capacidades

- Extracción de características visuales: genera `last_hidden_state` a partir de imágenes RGB para su uso como embeddings visuales.
- Comprensión visual general: orientado a tareas de entendimiento de imágenes según la model card de Kakao.
- Comprensión de documentos: la serie Kanana-2 vision encoder está diseñada también para document understanding.
- Razonamiento visual: soporta tareas que requieren interpretación visual, según la descripción del modelo original.
- Integración como componente: pensado para acoplarse a un modelo de lenguaje en arquitecturas VLM, no para generar texto por sí solo.
- Procesamiento de imágenes: incluye `processor` para conversión a tensores (`pixel_values`).
- Tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes: no disponible (no es un modelo generativo).
- Capacidades multilingües: no disponible.
- Modo thinking, visión-audio: no disponible.

## Casos de uso

- Embeddings visuales para búsqueda semántica de imágenes: el modelo genera representaciones vectoriales que permiten indexar un catálogo de imágenes y recuperarlas por similitud, usando `last_hidden_state` como vector de características.
- Componente de codificación en un VLM propio: se integra como torre visual en una arquitectura visión-lenguaje, alimentando el proyector y el modelo de lenguaje con features de 426M parámetros.
- Procesamiento de documentos escaneados: al estar orientado a document understanding, puede extraer features de páginas escaneadas para tareas posteriores de OCR asistido o clasificación documental.
- Clasificación y etiquetado de imágenes: usando los embeddings como entrada a una cabeza de clasificación ligera entrenada sobre las features extraídas.
- Detección de similitud y deduplicación visual: comparar embeddings de imágenes para identificar duplicados o variantes en grandes repositorios.
- Preprocesado en pipelines de razonamiento visual: servir como primera etapa de un sistema que combina percepción visual y razonamiento, alimentando módulos posteriores con representaciones compactas.
- Fine-tuning de tareas visuales específicas: al ser un encoder base, puede ajustarse con datos propios para dominios concretos (médico, industrial, satelital) manteniendo un tamaño manejable de 426M.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de validación es un smoke test en CPU con imagen real (`validation.json`), que no constituye una evaluación de rendimiento ni de paridad en GPU.

## Requisitos de hardware

- VRAM estimada para inferencia: con 426M parámetros en fp32, el peso ronda ~1,7 GB; en fp16/bf16 ~0,9 GB. El repo ocupa 0,9 GB en safetensors.
- GPU recomendadas: cualquier GPU con al menos ~2 GB de VRAM libre para fp16; una RTX 4090, A100 o H100 ofrece margen sobrado para procesamiento por lotes.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060 o superiores con 4-8 GB de VRAM, incluso en fp32.
- Opciones de despliegue: Transformers con el cargador incluido (`component.py`); la librería es `transformers` con `custom_code`, por lo que vLLM, llama.cpp u Ollama no son aplicables directamente (no es un modelo generativo de texto ni GGUF).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|
| Kanana-2 Vision Encoder Medium (este) | ~426M | Vision encoder | kanana-open-license | Hugging Face (espejo comunitario) |
| Kanana-2 Vision Encoder Tiny | ~98M | Vision encoder | kanana-open-license | Hugging Face (Kakao) |
| Alternativas de codificador visual (CLIP, SigLIP, DINOv2) | variable | Vision encoder | varía (MIT, Apache, etc.) | Hugging Face |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparación se limita a tamaño, tipo y licencia.

## Limitaciones y advertencias

- No es un VLM completo: solo extrae features; no genera texto ni responde a prompts.
- Licencia restrictiva: la Kanana Open License Agreement incluye una política de usos prohibidos y condiciones de redistribución; ciertos servicios comerciales requieren licencia separada.
- Obligación de cumplimiento: el uso debe respetar las leyes aplicables y las Guidelines for Responsible AI de Kakao (sección 2.2 de la licencia).
- Aviso de copyright: el repositorio incluye el `NOTICE` con el aviso requerido; debe conservarse en la redistribución.
- Validación limitada: el smoke test publicado es en CPU con imagen real, no evalúa paridad en GPU ni rendimiento end-to-end.
- Sesgos: no disponibles; no se documentan sesgos conocidos en la información proporcionada.
- Riesgo de alucinación: no aplicable directamente (no genera texto), pero los features pueden heredar sesgos del dataset de entrenamiento no documentado.
- Idiomas y contexto: no disponibles; al ser un encoder visual no aplica ventana de contexto textual.
- Carga con `custom_code`: requiere insertar el directorio del repo en `sys.path` y usar `component.py`, lo que complica la integración estándar frente a un modelo Transformers convencional.

## Enlaces

- Espejo comunitario en Hugging Face: https://huggingface.co/gatilin/kanana-2-vision-encoder-medium
- Modelo original de Kakao: https://huggingface.co/kakaocorp/kanana-2-vision-encoder-medium
- Árbol de archivos del original: https://huggingface.co/kakaocorp/kanana-2-vision-encoder-medium/tree/main
- Licencia Kanana Open License Agreement: archivo `LICENSE` del repositorio
- Aviso de copyright: archivo `NOTICE` del repositorio
- Validación CPU: archivo `validation.json` del repositorio
