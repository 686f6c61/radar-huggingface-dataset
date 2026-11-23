# jtchen0528/diffusiongemma-26B-A4B-it-FP8

## Resumen

`diffusiongemma-26B-A4B-it-FP8` es una cuantización en FP8 del modelo multimodal `google/diffusiongemma-26B-A4B-it`, publicada por el usuario `jtchen0528`. Se trata de una conversión de precisión reducida (post-training quantization) generada con NVIDIA Model Optimizer (ModelOpt) que aplica FP8 E4M3 estático por tensor (W8A8) a las capas lineales de texto y mantiene en BF16 los componentes sensibles: `lm_head`, embeddings, router, `self_conditioning` y la torre de visión. El objetivo es reducir el peso en memoria y aumentar el rendimiento de inferencia sin reentrenar el modelo base.

El modelo base pertenece a la familia DiffusionGemma, una arquitectura de tipo `diffusion_gemma` con pipeline `image-text-to-text`, es decir, un modelo multimodal capaz de procesar imagen y texto. El nombre indica un total de 26B parámetros con 4B activos (A4B), lo que sugiere una arquitectura de mezcla de expertos (MoE) con enrutamiento disperso. Los pesos reales del repositorio suman 25.823.781.228 parámetros (unos 25,8B), coherente con la nomenclatura comercial de 26B.

La relevancia de esta ficha radica en que permite desplegar un modelo multimodal de gran tamaño en hardware más modesto gracias a la cuantización FP8, manteniendo la licencia Apache 2.0 del modelo base. No obstante, la información publicada por el autor es muy limitada: no hay datos de benchmarks, idiomas soportados ni detalles de entrenamiento, por lo que muchas especificaciones deben marcarse como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiffusionGemma (tipo `diffusion_gemma`), multimodal image-text-to-text; presumiblemente MoE con 4B activos según nomenclatura A4B |
| Parámetros totales | 25.823.781.228 (≈25,8B) |
| Parámetros activos | 4B (según nomenclatura A4B del nombre; no confirmado en la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8 E4M3 estático por tensor (W8A8) en capas lineales de texto; BF16 en `lm_head`, embeddings, router, `self_conditioning` y torre de visión; KV cache en FP8 (cast, scale 1.0) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo base es `google/diffusiongemma-26B-A4B-it`, de arquitectura DiffusionGemma, una variante multimodal que combina procesamiento de imagen y texto (pipeline `image-text-to-text`). La nomenclatura A4B indica 4B parámetros activos sobre 26B totales, lo que apunta a un diseño de mezcla de expertos (MoE) con enrutamiento disperso, aunque la información proporcionada no detalla la configuración exacta de expertos ni el mecanismo de enrutamiento. El nombre "diffusion" sugiere el uso de técnicas de difusión en el proceso generativo, pero no se dispone de documentación técnica del modelo base en la información consultada.

Esta versión concreta es una cuantización post-entrenamiento (PTQ) realizada con NVIDIA ModelOpt versión `0.48.1.dev0+ge2f328a19`. La receta aplica FP8 E4M3 estático por tensor con calibración `max` sobre las proyecciones de atención (`q/k/v/o_proj`), las capas MLP densas (`gate/up/down_proj`) y los expertos enrutados. Se mantienen en BF16 el `lm_head`, los embeddings, el router, el módulo `self_conditioning` y la torre de visión. La calibración se realizó con el dataset `nemotron-post-training-v3` (512 muestras de 512 tokens, batch de 4). El KV cache se cuantiza a FP8 en modo cast con escala 1.0. Tras la exportación, el autor restauró `config.json` y `generation_config.json` del checkpoint original para mantener compatibilidad con versiones antiguas de transformers y con vLLM, ya que las versiones recientes de transformers reescriben `text_config` de forma incompatible.

## Capacidades

- Generación de texto conversacional (tag `conversational`), orientada a diálogo multi-turno.
- Procesamiento multimodal imagen-texto: entrada de imágenes junto con texto (pipeline `image-text-to-text`).
- Presunta capacidad de razonamiento y generación de código, inherente a los modelos de gran tamaño, aunque no confirmada en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (no se especifican idiomas).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Asistentes conversacionales multimodales: el modelo puede gestionar diálogos donde el usuario adjunta imágenes (capturas, diagramas, fotografías) y espera respuestas en lenguaje natural, gracias a su pipeline `image-text-to-text`.
- Descripción y análisis de imágenes en producción: integrable en pipelines de transformers para generar descripciones automáticas o extraer información de documentos escaneados, con la ventaja de que la versión FP8 reduce el coste de memoria frente al modelo en BF16.
- Despliegue en infraestructura con GPUs de memoria limitada: al aplicar FP8 a las capas lineales de texto y al KV cache, el modelo puede servirse en GPUs que no admitirían la versión BF16 completa, siempre que soporten FP8 (por ejemplo, arquitecturas Hopper o Ada Lovelace).
- Servicio de inferencia con vLLM: el autor indica que restauró la configuración para compatibilidad con vLLM, por lo que es adecuado para servir el modelo mediante un endpoint compatible con OpenAI en entornos de producción.
- Prototipado e investigación sobre cuantización: sirve como referencia para estudiar el impacto de FP8 W8A8 con KV cache FP8 en un modelo multimodal MoE, comparándolo con el checkpoint original.
- Evaluación comparativa de precisión: útil para medir la degradación de calidad entre el modelo base BF16 y la versión FP8 en tareas de visión-lenguaje y conversación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Peso del repositorio: 27,2 GB, lo que da una idea del espacio en disco necesario para los safetensors cuantizados.
- VRAM estimada para inferencia: no disponible de forma explícita; con pesos FP8 de ~26B parámetros el peso ronda los 26 GB, a lo que hay que sumar KV cache, activaciones y componentes en BF16 (embeddings, torre de visión, router). Se estima un mínimo práctico por encima de 32 GB, aunque no hay dato oficial.
- GPU recomendadas: no disponible en la información proporcionada. Por el uso de FP8, se requieren GPUs con soporte nativo de FP8 (por ejemplo, familias Hopper o Ada Lovelace de NVIDIA) para aprovechar la cuantización.
- ¿Cabe en GPU consumer? No confirmado. Con 27,2 GB de pesos, no cabría en GPUs de 24 GB (RTX 4090) sin técnicas adicionales de offloading o cuantización más agresiva.
- Opciones de despliegue: transformers (librería indicada), vLLM (el autor menciona compatibilidad explícita). Otras opciones como llama.cpp, Ollama o TGI no están confirmadas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| diffusiongemma-26B-A4B-it-FP8 (este) | 25,8B totales / 4B activos (presunto) | no disponible | FP8 W8A8 + KV FP8 | Apache 2.0 | Hugging Face |
| google/diffusiongemma-26B-A4B-it (base) | 26B totales / 4B activos (presunto) | no disponible | BF16 | Apache 2.0 | Hugging Face |
| Otras alternativas multimodales de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar con modelos alternativos concretos de la misma categoría (multimodales MoE de ~26B) en términos de rendimiento o benchmarks.

## Limitaciones y advertencias

- La información publicada por el autor es mínima: no hay benchmarks, idiomas, contexto ni detalles de entrenamiento, lo que dificulta evaluar su calidad antes de desplegarlo.
- Al ser una cuantización FP8, puede existir una degradación de precisión respecto al modelo base BF16, especialmente en tareas sensibles a la cuantización (matemáticas, código, razonamiento fino). No se han publicado evaluaciones que cuantifiquen esta pérdida.
- La cuantización FP8 requiere hardware con soporte nativo; en GPUs sin FP8 el modelo podría no ejecutarse o degradarse a emulación con pérdida de rendimiento.
- Riesgo de alucinación inherente a los modelos generativos de gran tamaño; no hay datos específicos sobre la tasa de alucinación de este modelo.
- Sesgos conocidos: no disponible. Al no documentarse la composición del dataset de entrenamiento, no se pueden evaluar sesgos.
- Restricciones de licencia: Apache 2.0, pero el enlace de licencia apunta a la licencia de Gemma 4 de Google, por lo que conviene revisar los términos de uso del modelo base antes de un despliegue comercial.
- El autor advierte que versiones recientes de transformers reescriben `text_config` de forma incompatible con versiones antiguas y con vLLM; se debe usar la configuración restaurada incluida en el repositorio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jtchen0528/diffusiongemma-26B-A4B-it-FP8
- Modelo base: https://huggingface.co/google/diffusiongemma-26B-A4B-it
- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
