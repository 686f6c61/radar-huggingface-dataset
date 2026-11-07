# landtml/minimax-h3-worker-weights

## Resumen

MiniMax H3 es un modelo generativo omnicanal desarrollado por MiniMax, un laboratorio con sede en Shanghái conocido por sus modelos de texto y razonamiento de la serie M y por la aplicación de consumo Hailuo. H3, denominado en algunos listados regionales como Hailuo H3, se posiciona como un modelo de generación omnicanal de propósito general en lugar de un generador de vídeo estrecho, e incluye capacidades de generación de vídeo, audio y texto a partir de referencias multimodales.

El repositorio `landtml/minimax-h3-worker-weights` no es un modelo original, sino un espejo (mirror) no modificado de los pesos que carga un worker de referencia-a-vídeo de ComfyUI. Su propósito es permitir que un host serverless cachee únicamente los ficheros necesarios, con una estructura de carpetas que replica las rutas de modelos de ComfyUI y puede usarse como base de `extra_model_paths`. El autor declara explícitamente que no reclama autoría ni propiedad sobre los ficheros.

La relevancia de este repositorio es práctica: agrupa en un único lugar los componentes de inferencia de H3 (modelo de difusión en int8, codificador de texto Qwen3-VL 32B en NVFP4 AWQ, VAE de vídeo y audio, y varios LoRA turbo y de realismo) con un tamaño total de 563,6 GB. La licencia aplicable es la MiniMax H3 Community License Agreement, con restricciones territoriales y de uso recogidas en su Sección V y en el Anexo A.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusión para generación de vídeo con codificador de texto Qwen3-VL y VAEs separados de vídeo y audio) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (modelo de difusión y VAE de vídeo), NVFP4 AWQ (codificador de texto), fp32 (VAE de audio), bf16 (LoRA) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de MiniMax H3 más allá de su naturaleza de modelo de difusión para generación de vídeo condicionada por referencia (`ref2va`) y por primer/último fotograma (`fl2va`). El pipeline de inferencia que documenta este repositorio combina un modelo de difusión en int8 (`minimax_h3_ref2va_pruned_int8_convrot.safetensors`, 20,97 GB), un codificador de texto Qwen3-VL de 32B cuantizado en NVFP4 AWQ (15,69 GB), un VAE de vídeo int8 (2,81 GB) y un VAE de audio fp32 (0,61 GB). La presencia de un VAE de audio independiente indica que el modelo genera audio junto con el vídeo.

El repositorio incluye LoRA turbo de 8 pasos y 4 pasos para `ref2va` (1,96 GB cada uno, bf16, orientados a 768p) y un LoRA turbo de 4 pasos para `fl2va` (modelo no almacenado en este repositorio), además de un LoRA de realismo de personas para t2v/i2v/r2v (0,13 GB). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generación de vídeo condicionada por referencia (`ref2va`), según el nombre de los ficheros del repositorio.
- Generación de vídeo condicionada por primer y último fotograma (`fl2va`), referenciada por el LoRA incluido aunque el modelo base no se almacena aquí.
- Generación de audio asociada al vídeo, evidenciada por la presencia de un VAE de audio dedicado.
- Codificación de texto multimodal mediante Qwen3-VL 32B, lo que sugiere entrada de texto e imagen.
- Aceleración de inferencia mediante LoRA turbo de 4 y 8 pasos a 768p.
- Ajuste de realismo de personas mediante LoRA específico para text-a-vídeo, image-a-vídeo y reference-a-vídeo.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.

## Casos de uso

- Integración en ComfyUI: el repositorio replica la estructura de carpetas de modelos de ComfyUI, por lo que puede configurarse como base de `extra_model_paths` para cargar directamente el modelo de difusión, el codificador de texto, los VAEs y los LoRA sin reorganizar ficheros.
- Despliegue serverless con caché selectiva: un host serverless puede cachear únicamente los ficheros que carga el worker de referencia-a-vídeo, reduciendo el volumen descargado frente a un repositorio completo del modelo original.
- Generación de vídeo a partir de una imagen de referencia: usando el modelo `ref2va` junto con el codificador Qwen3-VL, se puede producir un vídeo coherente con la identidad o el estilo de la referencia proporcionada.
- Generación rápida de borradores de vídeo: los LoRA turbo de 4 y 8 pasos a 768p permiten reducir el número de pasos de muestreo, adecuado para iteración rápida en producción de contenido.
- Generación de vídeo con audio sincronizado: el VAE de audio permite producir pistas de audio junto con el vídeo en un mismo pipeline, útil para prototipos de anuncios o clips cortos.
- Interpolación entre fotogramas clave: el LoRA `fl2v_turbo_4step` está pensado para el modelo `fl2va`, que permite generar la transición entre un primer y un último fotograma (requiere obtener el modelo base `fl2va` por separado).
- Refinado de realismo en figuras humanas: el LoRA `h3-realism-people-t2v-i2v-r2v` puede aplicarse sobre los pipelines t2v, i2v y r2v para mejorar la calidad de representación de personas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio completo ocupa 563,6 GB; el subconjunto mínimo para `ref2va` (modelo de difusión int8, codificador de texto NVFP4 AWQ, VAE de vídeo, VAE de audio y un LoRA turbo) suma aproximadamente 42,0 GB en disco.
- El modelo de difusión en int8 ocupa 20,97 GB, por lo que la VRAM necesaria para cargarlo supera con holgura los 24 GB de una RTX 4090; se requiere una GPU de数据中心 con al menos 40-48 GB de VRAM para el modelo de difusión y el codificador de texto en memoria simultáneamente.
- El codificador de texto Qwen3-VL 32B en NVFP4 AWQ ocupa 15,69 GB y requiere soporte de NVFP4 (GPU Blackwell, como B200 o RTX 50) o una ruta de conversión alternativa.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, se sitúan en el rango de A100 80 GB, H100 80 GB o B200.
- No cabe en GPUs de consumo convencionales (RTX 4090 24 GB) sin offloading a RAM o cuantización adicional no documentada.
- Opciones de despliegue: ComfyUI (estructura de carpetas compatible con `extra_model_paths`); vLLM, llama.cpp, Ollama y TGI no están documentados para este modelo en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Capacidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax H3 (`ref2va` vía este mirror) | no disponible | no disponible | Vídeo reference-to-video con audio | MiniMax H3 Community License Agreement | Pesos en este repositorio (mirror) |
| MiniMax-M3 | ~428B totales / 23B activos (MoE) | 1M | Texto y razonamiento multimodal | no disponible | Open-weight (junio 2026) |
| Alternativas de vídeo open-weight | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con otros modelos de vídeo open-weight no está disponible en la información proporcionada. MiniMax-M3 pertenece a una categoría distinta (texto y razonamiento multimodal) y solo se incluye como referencia del mismo laboratorio.

## Limitaciones y advertencias

- Este repositorio es un espejo no modificado; el autor no ofrece soporte, actualizaciones ni garantías. Para nuevas versiones debe acudirse a las fuentes originales listadas en `CREDITS.md`.
- La licencia MiniMax H3 Community License Agreement impone restricciones territoriales y de uso recogidas en su Sección V y en el Anexo A (Acceptable Use Policy); es responsabilidad del usuario revisarlas antes de cualquier uso comercial.
- No se dispone de información sobre sesgos, tasa de alucinación o limitaciones idiomáticas del modelo.
- El repositorio no incluye el modelo base `fl2va`, por lo que el LoRA `fl2v_turbo` no es utilizable únicamente con los ficheros aquí presentes.
- El tamaño total de 563,6 GB y la necesidad de VRAM elevada limitan el despliegue a infraestructura con GPUs de数据中心.
- Algunos ficheros (codificador de texto en NVFP4) requieren hardware compatible con NVFP4 o procesos de conversión no documentados.
- No se han publicado benchmarks en la información disponible, por lo que no es posible evaluar el rendimiento relativo frente a alternativas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/landtml/minimax-h3-worker-weights
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Artículo sobre MiniMax H3: https://aitoolsreview.co.uk/insights/minimax-h3-video-model
- Artículo sobre MiniMax-M3: https://ai-tldr.dev/models/minimax-m3/
- Ficheros de créditos y licencia del repositorio: `CREDITS.md` y `LICENSE` dentro del propio repositorio.
