# ChrisColeTech/LTX-2.5-uncensored-v1.1-FP8

## Resumen

LTX-2.5-uncensored-v1.1-FP8 es una compilación pre-fusionada del modelo de generación de vídeo LTX Video 2.5 de Lightricks, publicada por el usuario ChrisColeTech en Hugging Face. Se trata de un derivado que integra en los pesos cinco ajustes finos distintos (LoRAs de contenido NSFW, destilación DMD, control in-context, detallado y adaptador imagen-a-vídeo), empaquetado en formato FP8 y GGUF para acelerar la inferencia. El resultado es un modelo de vídeo generativo "turbo" que promete generaciones en tan solo 4 pasos y soporte multimodal de entrada (texto, imagen, audio y referencia visual).

El modelo resuelve el problema de tener que cargar y combinar manualmente múltiples LoRAs sobre el modelo base, ofreciendo una única descarga con todo el pipeline pre-integrado. Incluye además un codificador de texto Gemma4 12B sin censura con las proyecciones de LTX ya incorporadas, eliminando la necesidad de ficheros adicionales. Con 21.004.025.600 parámetros totales y un repositorio de 226 GB, está claramente orientado a entornos de inferencia con GPU de gama alta.

Su relevancia actual radica en la combinación de destilación DMD (menos pasos de muestreo), soporte de audio nativo en la generación de vídeo y la posibilidad de control in-context mediante plantillas estructuradas. No obstante, la licencia es desconocida y el contenido está marcado como no apto para todas las audiencias, lo que limita su uso en producción comercial sin una revisión legal previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para vídeo (LTX Video 2.5) con codificador de texto Gemma4 12B; no se detalla la arquitectura interna exacta |
| Parametros totales | 21.004.025.600 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (fp8_scaled), GGUF, int8 para el codificador de texto |
| Idiomas soportados | no disponible |
| Licencia | unknown (desconocida) |
| Formato de pesos | safetensors (FP8), GGUF |
| Modos de generación | text-to-video, image-to-video, video-to-video, audio-to-video |
| Pasos de muestreo | 4 pasos (mínimo), 8 pasos (recomendado) |
| Tamaño del repositorio | 226,0 GB |

## Arquitectura y entrenamiento

El modelo se basa en LTX Video 2.5 de Lightricks, un modelo de difusión para generación de vídeo. Sobre esta base se han fusionado cinco LoRAs con distintas intensidades: Eros10 NSFW (0,7), DMD Distilled (1,0), LTX Video IC-LoRA (0,7), LTX Video IC-LoRA Detailer (0,45) e Img2Vid LoRA (0,45). La fusión pre-merged elimina la necesidad de cargar adaptadores por separado en tiempo de inferencia.

La innovación técnica principal es la destilación DMD (Distribution Matching Distillation), que reduce drásticamente el número de pasos de muestreo necesarios (4-8 en lugar de decenas), acelerando la generación y mejorando la preservación facial en image-to-video y el seguimiento de instrucciones. El codificador de texto es un Gemma4 12B sin censura con proyecciones LTX integradas, cuantizado a int8. El modelo soporta además plantillas de prompt estructuradas con etiquetas `[VISUAL]`, `[SPEECH]` y `[SOUNDS]` para control preciso de la salida audiovisual, incluyendo multi-shot y efectos de audio. No se dispone de información sobre el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con tan solo 4 pasos de muestreo.
- Generación de vídeo a partir de imagen (image-to-video) con preservación facial mejorada gracias a la destilación DMD.
- Generación de vídeo a partir de vídeo (video-to-video) mediante el adaptador IC-LoRA Detailer.
- Generación de vídeo a partir de audio (audio-to-video).
- Generación de audio sincronizado: diálogo hablado, efectos de sonido y bandas sonoras, controlables mediante las etiquetas `[SPEECH]` y `[SOUNDS]`.
- Soporte de multi-shot: transiciones entre planos dentro de una misma generación (por ejemplo, "primer plano frontal, luego corte a plano general trasero").
- Control in-context mediante plantillas estructuradas de prompt con precisión sobre lo visual, el habla y los sonidos.
- Contenido sin censura (NSFW) integrado mediante la LoRA Eros10.
- Seguimiento de instrucciones mejorado respecto a la versión stock y a la v1.
- No se documenta soporte de tool calling ni de agentes, al no ser un modelo de lenguaje conversacional.

## Casos de uso

- **Generación de vídeo publicitario de bajo coste computacional**: con 4-8 pasos de muestreo, el modelo permite iterar rápidamente sobre variaciones de un anuncio (text-to-video) sin incurrir en los tiempos de generación típicos de modelos de difusión de decenas de pasos.
- **Doblaje y sincronización de audio en vídeo**: la capacidad audio-to-video y la generación de habla sincronizada permiten crear vídeos con diálogo y efectos sonoros a partir de una pista de audio, útil para localización de contenido.
- **Prototipado de escenas para previsualización cinematográfica**: el soporte multi-shot y las plantillas `[VISUAL]`/`[SPEECH]`/`[SOUNDS]` permiten generar storyboards animados con cortes de cámara y audio descriptivo.
- **Animación de retratos o personajes a partir de una imagen**: el modo image-to-video con la LoRA Img2Vid y la preservación facial de DMD lo hacen adecuado para animar avatares o personajes estáticos manteniendo la coherencia de identidad.
- **Edición y retoque de vídeo existente**: el modo video-to-video con IC-LoRA Detailer permite aplicar transformaciones controladas sobre metraje ya grabado, como cambios de estilo o correcciones guiadas por prompt.
- **Creación de contenido para adultos con control de referencia visual**: la integración de la LoRA Eros10 y el IC-LoRA de referencia permiten generar contenido NSFW manteniendo la adherencia a una imagen de referencia, en entornos donde dicho contenido sea legal y esté permitido.
- **Generación de material B-roll sin música de fondo**: la instrucción "unscored" permite producir clips de recurso sin banda sonora, listos para montaje posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: con 21.004 millones de parámetros en FP8, el peso de los pesos ronda los 21 GB solo para el modelo de difusión, a lo que se suma el codificador de texto Gemma4 12B en int8 (aproximadamente 12 GB adicionales). Se estima un mínimo práctico de 40-48 GB de VRAM para inferencia completa, aunque no se dispone de cifras oficiales.
- **GPU recomendadas**: A100 80 GB, H100 80 GB, o configuraciones multi-GPU. Las RTX 4090 (24 GB) no pueden alojar el modelo completo en FP8 sin offloading a RAM del sistema.
- **GPU de consumo**: no cabe en GPUs de consumo de 24 GB o menos sin técnicas de offloading agresivo o cuantización GGUF adicional; el tamaño del repositorio (226 GB) sugiere que existen variantes GGUF de menor precisión que podrían ejecutarse con offloading, aunque no se detallan.
- **Opciones de despliegue**: ComfyUI (los ejemplos de la model card usan ficheros `ComfyUI_*.mp4`), llama.cpp/GGUF para las variantes cuantizadas, y potencialmente vLLM o TGI si se adaptan al pipeline de difusión (no confirmado).
- **Latencia y throughput**: no disponible; la model card solo indica que 4 pasos producen resultados aceptables y 8 pasos los mejores, sin cifras de tiempo por generación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / pasos | Licencia | Disponibilidad |
|---|---|---|---|---|
| LTX-2.5-uncensored-v1.1-FP8 | 21,0 B | 4-8 pasos de muestreo | unknown | Hugging Face (GGUF, FP8) |
| Lightricks/LTX-2.5 (base) | no disponible | no disponible | no disponible | Hugging Face |
| TenStrip/LTX2.3-10Eros | no disponible | no disponible | no disponible | Hugging Face |
| TenStrip/LTX2.3_DMD_Lora | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- **Licencia desconocida**: la licencia figura como "unknown", lo que impide determinar si el uso comercial está permitido. Es imprescindible contactar con el autor o con Lightricks antes de cualquier despliegue en producción.
- **Contenido NSFW integrado**: el modelo incorpora explícitamente la LoRA Eros10 y está etiquetado como "not-for-all-audiences". Su uso puede infringir las políticas de plataformas de distribución y las legislaciones locales sobre contenido para adultos.
- **Riesgo de alucinación visual**: como todo modelo generativo de vídeo, puede producir artefactos, incoherencias temporales o contenido no solicitado, especialmente en generaciones largas o con prompts ambiguos.
- **Idiomas no documentados**: no se especifican los idiomas soportados por el codificador de texto Gemma4 en esta configuración, por lo que el rendimiento multilingüe es incierto.
- **Requisitos de hardware elevados**: 21 B de parámetros en FP8 más un codificador de 12 B hacen que el modelo no sea apto para GPUs de consumo sin offloading, lo que limita su adopción en entornos pequeños.
- **Trazabilidad de la fusión**: al ser una fusión pre-merged de cinco LoRAs con intensidades fijas, no es posible ajustar la contribución de cada una en tiempo de inferencia sin recurrir al modelo base y las LoRAs por separado.
- **Origen comunitario**: el autor es un usuario individual (ChrisColeTech), no el desarrollador original (Lightricks), por lo que no hay garantías de soporte, mantenimiento ni auditoría de seguridad.
- **Tamaño del repositorio**: 226 GB de descarga suponen un coste de almacenamiento y ancho de banda considerable.

## Enlaces

- Hugging Face: https://huggingface.co/ChrisColeTech/LTX-2.5-uncensored-v1.1-FP8
- Modelo base Lightricks LTX-2.5: https://huggingface.co/Lightricks/LTX-2.5
- Modelo base TenStrip/LTX2.3-10Eros: https://huggingface.co/TenStrip/LTX2.3-10Eros
- LoRA TenStrip/LTX2.3_DMD_Lora: https://huggingface.co/TenStrip/LTX2.3_DMD_Lora
- Ejemplos de vídeo (samples): https://huggingface.co/ChrisColeTech/LTX-2.5-uncensored-v1.1-FP8/tree/main/samples
