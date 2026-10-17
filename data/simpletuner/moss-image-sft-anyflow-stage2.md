# SimpleTuner/moss-image-sft-anyflow-stage2

## Resumen

`SimpleTuner/moss-image-sft-anyflow-stage2` es un adaptador LoRA de rango 128 y precisión BF16 para el modelo de difusión texto-a-imagen `OpenMOSS-Team/MOSS-Image-SFT`, publicado por el equipo de SimpleTuner bajo licencia Apache 2.0. No es un modelo autónomo: se carga sobre el checkpoint SFT base mediante `load_lora_weights` de diffusers y su objetivo es habilitar inferencia en pocos pasos mediante destilación AnyFlow, que combina DMD on-policy con un modelo MeanFlow forward coentrenado.

El interés práctico está en reducir el coste de muestreo de un modelo de difusión: la validación del autor usa 4 pasos, CFG 1 y semilla 42 a 512 y 1024 px. Sin embargo, en el momento de redactar esta ficha el entrenamiento figura en estado `queued`, con 0 de 1.500 actualizaciones observadas y sin checkpoints publicados, por lo que el adaptador todavía no es utilizable.

La ficha se basa únicamente en la model card y los metadatos de HuggingFace; no hay información pública sobre la arquitectura interna del modelo base, el número de parámetros, los idiomas soportados ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA de rango 128 sobre un modelo de difusión texto-a-imagen MOSS-Image; arquitectura interna del modelo base no disponible |
| Parámetros totales | no disponible; el adaptador es un LoRA de rango 128 y el recuento del modelo base no se publica |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (texto-a-imagen); longitud del codificador de texto del modelo base no disponible |
| Tipos de cuantización | adaptador entrenado en BF16; no se documentan versiones GGUF, FP8 o INT8 del adaptador ni del modelo base |
| Idiomas soportados | no disponible; los subtítulos de entrenamiento están en inglés (CC12M y e621) |
| Licencia | Apache 2.0 para el adaptador; licencia del modelo base no indicada en la información |
| Formato de pesos | adaptador LoRA compatible con diffusers/PEFT (`load_lora_weights`); formato de fichero no confirmado en la model card |
| Modelo base | `OpenMOSS-Team/MOSS-Image-SFT`, revisión `fc5de0d56fc910cbca6f6625a70f5f582b26deb1` |
| Resolución de entrenamiento | área equivalente a 512 px, con recortes cuadrados aleatorios |
| Resoluciones de validación | 512 px y 1024 px |
| Pasos de inferencia en validación | 4 pasos, CFG 1, semilla 42 |
| Estado | `queued`; 0 de 1.500 actualizaciones observadas |

## Arquitectura y entrenamiento

El adaptador se entrena con la receta AnyFlow de SimpleTuner: DMD on-policy con una pérdida forward MeanFlow coentrenada, escala de fusión de guía 3 y guía de score real 3 en la etapa 2. La etapa 1 parte del checkpoint SFT y entrena 10.000 actualizaciones con learning rate 6e-5 y EMA por paso de 0,995; la etapa 2 reanuda desde el EMA final de la etapa 1 con optimizador y scheduler nuevos, 1.500 actualizaciones, learning rate 2e-6 y EMA de 0,99. El LoRA es de rango 128, BF16, sin dropout de LoRA ni de caption, con área equivalente a 512 px, ocho GPU H100, microbatch 2, acumulación de gradiente 1 y batch global 16. Se usa la rejilla de ruido nativa de MOSS sin desplazamiento.

Los datos son una mezcla 50/50 de CC12M con subtítulos largos estructurados y e621 con sus subtítulos originales, con un máximo de 65.536 imágenes por fuente, recortes cuadrados aleatorios y sin redistribución de los ficheros del dataset. CC12M usa explícitamente `long_caption` y conserva los párrafos; no sustituye por subtítulos cortos. La validación emplea 4 pasos, CFG 1, semilla 42, resoluciones de 512 y 1024 px, schedule de MOSS sin desplazamiento y ajuste a la rejilla nativa. No se detalla la arquitectura del denoiser del modelo base ni el volumen total de imágenes vistas más allá de los límites por fuente.

## Capacidades

- Generación texto-a-imagen: produce imágenes a partir de prompts usando el checkpoint `MOSS-Image-SFT` más el adaptador LoRA.
- Inferencia few-step: la receta de validación usa 4 pasos y CFG 1, lo que reduce el número de evaluaciones del denoiser frente al muestreo completo; no hay datos públicos de calidad comparativa.
- Resoluciones documentadas: 512 px para entrenamiento y 512/1024 px para validación; no se documenta soporte nativo para otras resoluciones.
- Integración con diffusers y SimpleTuner: `MOSSImagePipeline`, `AnyFlowValidationScheduler`, `MOSSImageScheduler` y `load_lora_weights` con `flowmap_deltatime_type="r"` y `flowmap_gate_value=0.25`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso; es un modelo generativo visual, no un LLM.
- No incluye comprensión de imagen (visión) ni generación de audio o vídeo.
- Capacidad multilingüe no confirmada; el entrenamiento usa captions en inglés.
- El 50 % del dataset es e621, por lo que puede reproducir sesgos estilísticos y de contenido de esa fuente.

## Casos de uso

- Prototipado de pipelines texto-a-imagen con pocos pasos: cargar el adaptador sobre `MOSS-Image-SFT` para generar borradores a 512 px en 4 pasos, reduciendo el coste por imagen en fases de exploración.
- Generación de ilustraciones y arte conceptual: usar prompts descriptivos en inglés y salidas a 512 o 1024 px para iterar sobre variaciones de estilo y composición.
- Investigación en destilación de difusión: el adaptador sirve como referencia reproducible de AnyFlow (DMD on-policy más MeanFlow) sobre MOSS-Image, con hiperparámetros y receta publicados.
- Evaluación comparativa de métodos few-step: medir la calidad a 4 pasos frente al checkpoint base y frente a otras técnicas como LCM o DMD2 usando el mismo modelo y los mismos prompts.
- Generación por lotes en producción con baja latencia: si el adaptador se completa, 4 pasos y CFG 1 reducen el tiempo de muestreo; la viabilidad depende de que el modelo base quepa en la GPU objetivo.
- Creación de datasets sintéticos: generar imágenes de dominios concretos, como ilustración o arte digital, para aumentar datos de entrenamiento, revisando sesgos y licencias antes de su uso.
- Demostraciones educativas: mostrar en un cuaderno cómo se carga un LoRA de destilación con diffusers y cómo se sustituye el scheduler para inferencia few-step.
- Experimentación con LoRA sobre modelos de difusión: punto de partida para otros fine-tunings con SimpleTuner y para comparar recetas de destilación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo enlaza previsualizaciones cualitativas en `validation_images`, sin métricas como FID, CLIP score o comparaciones cuantitativas frente al modelo base.

## Requisitos de hardware

- Adaptador: LoRA de rango 128 en BF16; no se publica el tamaño exacto del fichero, pero es mucho menor que el checkpoint base. Para inferir es obligatorio cargar `MOSS-Image-SFT` completo.
- VRAM de inferencia: no disponible; depende del denoiser y del codificador de texto de MOSS-Image-SFT, cuyas especificaciones no se incluyen.
- Entrenamiento: ocho GPU H100, microbatch 2, batch global 16 y área equivalente a 512 px; no se indica memoria por GPU.
- GPU de consumo: no confirmado; no hay datos de que el modelo base quepa en una RTX 4090, RTX 4080 o similares. El adaptador por sí solo no es suficiente para ejecutar el pipeline.
- Despliegue: `MOSSImagePipeline` de SimpleTuner sobre diffusers; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo de difusión en el contexto descrito.
- Latencia y throughput: no disponibles; la validación usa 4 pasos y CFG 1, lo que reduce el número de pasos frente al muestreo completo, pero no se publican tiempos ni imágenes por segundo.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Pasos de inferencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `SimpleTuner/moss-image-sft-anyflow-stage2` | LoRA de destilación few-step para MOSS-Image | no disponible (LoRA de rango 128) | no aplica | 4 (validación) | Apache 2.0 (adaptador); base no indicada | Publicado en HuggingFace; estado `queued`, sin checkpoints |
| `OpenMOSS-Team/MOSS-Image-SFT` | Modelo de difusión texto-a-imagen | no disponible | no aplica | no disponible (muestreo completo) | no disponible | Público en HuggingFace |
| Anima AnyFlow (`bghira/anima-anyflow-e621-stage1-v2` y `dmd-v5`) | Receta de destilación AnyFlow sobre otro modelo base | no disponible | no aplica | no disponible | no disponible | Público en HuggingFace; especificaciones no incluidas en la información |

No hay datos públicos que permitan comparar rendimiento, calidad o latencia entre estas opciones.

## Limitaciones y advertencias

- Estado `queued` con 0 de 1.500 actualizaciones: no hay checkpoints ni previsualizaciones publicadas; el adaptador no es utilizable todavía.
- No existen benchmarks ni evaluación cuantitativa de calidad (FID, CLIP score, fidelidad al prompt) en la información disponible.
- Depende del checkpoint base `MOSS-Image-SFT`; la licencia del modelo base no se indica, por lo que debe verificarse antes de un uso comercial.
- Idiomas no confirmados: los captions de entrenamiento están en inglés y no hay datos sobre el comportamiento con prompts en castellano u otros idiomas.
- Sesgos de datos: CC12M contiene sesgos propios de datos web y e621 introduce sesgos de arte furry y posible contenido adulto; es necesario aplicar filtros y políticas de contenido.
- Riesgo de artefactos y baja fidelidad al prompt en 4 pasos; la calidad few-step puede ser inferior a la del muestreo completo, aunque no se publican comparaciones.
- Entrenamiento a área equivalente a 512 px; la validación a 1024 px no garantiza la misma calidad ni coherencia a esa resolución.
- No se documentan filtros de seguridad, moderación de contenido ni marcas de agua en el pipeline.
- Al ser un LoRA, no incluye el modelo base; la reproducibilidad depende de la revisión `fc5de0d56fc910cbca6f6625a70f5f582b26deb1`.
- No hay garantía de que la receta funcione con otras revisiones o variantes de MOSS-Image.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/SimpleTuner/moss-image-sft-anyflow-stage2)
- [Modelo base OpenMOSS-Team/MOSS-Image-SFT](https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT)
- [Colección AnyFlow Anima v10](https://huggingface.co/collections/bghira/anyflow-anima-v10)
- [Configuración stage1-v2](https://huggingface.co/bghira/anima-anyflow-e621-stage1-v2)
- [Configuración dmd-v5](https://huggingface.co/bghira/anima-anyflow-e621-dmd-v5)
- [Dataset CC12M](https://huggingface.co/datasets/laion/conceptual-captions-12m-webdataset)
- [CC12M structured captions](https://huggingface.co/datasets/webshart/cc12m-structured-captions)
- [Dataset e621 2024](https://huggingface.co/datasets/NebulaeWis/e621-2024-webp-4Mpixel)
- [training_config.json](https://huggingface.co/SimpleTuner/moss-image-sft-anyflow-stage2/blob/main/training_config.json)
- [dataloader.json](https://huggingface.co/SimpleTuner/moss-image-sft-anyflow-stage2/blob/main/dataloader.json)
- [prompts.json](https://huggingface.co/SimpleTuner/moss-image-sft-anyflow-stage2/blob/main/prompts.json)
- [Previsualizaciones de validación](https://huggingface.co/SimpleTuner/moss-image-sft-anyflow-stage2/tree/main/validation_images)
