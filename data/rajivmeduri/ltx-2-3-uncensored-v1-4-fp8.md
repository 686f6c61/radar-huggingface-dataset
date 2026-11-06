# rajivmeduri/LTX-2.3-uncensored-v1.4-FP8

## Resumen

LTX-2.3-uncensored-v1.4-FP8 es una compilación de pesos del modelo de generación de vídeo LTX-2.3 de Lightricks, publicada por el usuario rajivmeduri en Hugging Face. Se trata de un modelo de difusión (DiT, Diffusion Transformer) especializado en síntesis de vídeo a partir de texto, imagen, vídeo o audio, con tres ajustes finos fusionados directamente en los pesos: un LoRA NSFW (Eros10), un LoRA destilado DMD para acelerar la generación y mejorar el seguimiento de instrucciones, y un ICLoRA oficial de detalle para mejorar la adherencia a la imagen de referencia. El resultado es un modelo "turbo" capaz de generar vídeo en tan solo 4 pasos de inferencia, con 8 pasos recomendados para máxima calidad.

El modelo base, Lightricks/LTX-2.3, es un transformer de difusión para vídeo con aproximadamente 21.000 millones de parámetros (según el dato de safetensors declarado), lo que lo sitúa en la gama alta de los modelos de vídeo open source. La versión aquí descrita incorpora una cuantización FP8 (y también se distribuyen variantes GGUF), lo que reduce los requisitos de memoria frente a los pesos en BF16 originales, aunque el repositorio completo ocupa 261,1 GB debido a la multiplicidad de formatos y variantes incluidas.

La relevancia de esta ficha radica en que combina varias tendencias actuales: modelos de vídeo de gran escala, destilación para inferencia rápida (DMD), cuantización para despliegue en hardware consumer y fine-tuning no filtrado para contenido para adultos. No obstante, la licencia es desconocida y el modelo está marcado como "not-for-all-audiences", lo que condiciona seriamente su uso en producción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) para vídeo, base Lightricks/LTX-2.3 |
| Parametros totales | 21.005.004.544 (~21,0 mil millones) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (modelo de difusión; ventana de frames: hasta 960 frames / ~40 s según la model card) |
| Tipos de cuantizacion | FP8 y GGUF (variantes cuantizadas); pesos base presumiblemente BF16 |
| Idiomas soportados | no disponible |
| Licencia | unknown (desconocida) |
| Formato de pesos | safetensors (FP8), GGUF |
| Pipeline | text-to-video (también image-to-video, video-to-video, audio-to-video) |
| Resolución de ejemplo | 1280 × 736 |
| Pasos de inferencia | 4 (mínimo) – 8 (recomendado) |
| CFG de ejemplo | 1.0 – 3.8 |
| Tamaño del repositorio | 261,1 GB |
| Modelos base | TenStrip/LTX2.3-10Eros, Lightricks/LTX-2.3, TenStrip/LTX2.3_DMD_Lora |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura DiT (Diffusion Transformer) de LTX-2.3 de Lightricks, un transformer de difusión diseñado para generar secuencias de vídeo a partir de condiciones multimodales (texto, imagen, audio). Sobre los pesos originales se han fusionado tres adaptadores: el LoRA Eros10 (especializado en contenido NSFW y coherencia, a fuerza 1.0), el LoRA DMD destilado (que acelera la generación, mejora la preservación facial en image-to-video y el seguimiento de instrucciones, a fuerza 1.0) y el ICLoRA oficial de detalle de LTXV (a fuerza 0.6, para mejor adherencia a la imagen de referencia). La fusión se realizó antes de la cuantización, de modo que los pesos FP8 y GGUF ya incorporan los tres ajustes.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO, ya que la model card no los detalla y la información proporcionada no los incluye. La innovación técnica destacable es la destilación DMD (Distribution Matching Distillation), que permite reducir el número de pasos de inferencia a 4–8 en lugar de las decenas habituales en modelos de difusión, y la incorporación de un modo de audio-to-video (AUDIO-TO-VIDEO / T2VA / I2VA / FL2VA / REF2VA), que sugiere generación conjunta o condicionada por audio.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con prompts descriptivos detallados.
- Generación de vídeo a partir de imagen (image-to-video), preservando la identidad del sujeto de la imagen de referencia.
- Generación de vídeo a partir de vídeo (video-to-video) y a partir de audio (audio-to-video).
- Modos de audio integrados: T2VA, I2VA, FL2VA y REF2VA (generación de vídeo con audio condicionado).
- Generación de vídeos largos: hasta 960 frames (~40 s) según la model card.
- Generación rápida en 4 pasos, con 8 pasos recomendados para máxima calidad.
- Control de movimiento y audio mediante CFG (valores más altos generan más movimiento y más audio).
- Contenido NSFW sin filtrado (el LoRA Eros10 está fusionado a fuerza 1.0).
- No se documentan capacidades de tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje, sino de difusión de vídeo).

## Casos de uso

- **Generación de vídeo publicitario y cinematográfico**: con resoluciones de 1280 × 736 y clips de ~5 s (121 frames) a 8 pasos, el modelo es adecuado para prototipos de anuncios, storyboards animados y secuencias de acción con diálogo y sonido usando CFG en torno a 3.5–3.8.
- **Animación de imágenes fijas (image-to-video)**: la model card indica que el modelo "excela" en image-to-video preservando la identidad original, lo que lo hace útil para animar retratos, productos o ilustraciones manteniendo la coherencia facial y de vestuario.
- **Vídeos largos de hasta 40 segundos**: con hasta 960 frames, se puede emplear para escenas narrativas continuas, demostraciones de producto o contenido para redes sociales que requieran duración extendida sin cortes.
- **Generación de vídeo con audio sincronizado**: los modos T2VA e I2VA permiten producir clips con ambiente sonoro y diálogo, útiles para doblaje preliminar, maquetas sonoras o contenido para podcast en vídeo.
- **Creación de contenido para adultos**: el modelo está explícitamente orientado a NSFW (etiqueta "not-for-all-audiences" y LoRA Eros10 fusionado), por lo que se usaría en plataformas de contenido para adultos con las salvaguardas legales correspondientes.
- **Investigación en modelos de difusión de vídeo**: al ser una compilación FP8/GGUF de un modelo de 21B con destilación DMD, sirve como banco de pruebas para estudiar el impacto de la cuantización y la fusión de LoRA en la calidad de generación de vídeo.
- **Prototipado rápido en ComfyUI**: la model card incluye un workflow de ejemplo (`LTXV23_v1.4_T2AV_nsfw.json`), lo que facilita su integración en pipelines de generación visual iterativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma oficial. Como referencia orientativa, un modelo DiT de ~21B parámetros en FP8 requiere del orden de 21 GB solo para los pesos, más memoria para activaciones y el VAE de vídeo; en la práctica se recomienda al menos 24–32 GB de VRAM para resoluciones moderadas y secuencias cortas.
- **GPU recomendadas**: no especificadas en la información disponible. Por tamaño, cabría esperar uso en A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) con cuantización agresiva.
- **¿Cabe en GPU consumer?**: no confirmado. La variante FP8 podría caber en una RTX 4090 de 24 GB para clips cortos, pero la información proporcionada no lo verifica.
- **Opciones de despliegue**: ComfyUI (workflow de ejemplo incluido), llama.cpp/GGUF (por la librería `gguf` declarada); vLLM y TGI no están indicados para modelos de difusión de vídeo.
- **Latencia y throughput**: no disponibles. La model card indica que el modelo genera en 4 pasos (8 recomendados), lo que sugiere latencias reducidas frente a modelos de difusión no destilados, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / duración | Licencia | Disponibilidad |
|---|---|---|---|---|
| LTX-2.3-uncensored-v1.4-FP8 | ~21,0 B | hasta 960 frames (~40 s) | unknown | Hugging Face (repo de 261,1 GB) |
| Lightricks/LTX-2.3 (base) | ~21,0 B (presumible) | no disponible | no disponible | Hugging Face |
| TenStrip/LTX2.3-10Eros | no disponible | no disponible | no disponible | Hugging Face |
| TenStrip/LTX2.3_DMD_Lora | no disponible (LoRA) | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estos modelos en la información proporcionada, por lo que la comparativa se limita a parámetros, disponibilidad y licencia.

## Limitaciones y advertencias

- **Licencia desconocida**: la licencia figura como "unknown", lo que impide determinar si el uso comercial está permitido; no debe usarse en producción sin aclarar este punto con el autor y con Lightricks (titular del modelo base).
- **Contenido NSFW explícito**: el modelo está etiquetado como "not-for-all-audiences" y lleva fusionado un LoRA NSFW a fuerza 1.0; su uso conlleva riesgos legales y de cumplimiento en muchas jurisdicciones.
- **Salvaguardas limitadas**: la model card menciona que existen "guardrails" para prevenir contenido ilegal, pero "principalmente NSFW", lo que implica que la moderación no es completa.
- **Riesgo de alucinación visual**: como todo modelo generativo de vídeo, puede producir artefactos, incoherencias temporales, deformaciones anatómicas y fallos de consistencia en secuencias largas.
- **Idiomas no documentados**: no se especifican los idiomas soportados en los prompts.
- **Tamaño del repositorio**: 261,1 GB dificulta la descarga y el despliegue; requiere almacenamiento y ancho de banda considerables.
- **Falta de benchmarks**: no hay métricas publicadas que permitan validar la calidad frente a alternativas.
- **Origen no oficial**: es una compilación de terceros (rajivmeduri) sobre pesos de Lightricks y LoRAs de TenStrip; no cuenta con el respaldo del desarrollador original.
- **Fecha de creación futura**: la fecha declarada (2026-11-02) es posterior a la actual, lo que puede indicar metadatos inconsistentes.

## Enlaces

- Hugging Face: https://huggingface.co/rajivmeduri/LTX-2.3-uncensored-v1.4-FP8
- Modelo base: https://huggingface.co/Lightricks/LTX-2.3
- LoRA NSFW base: https://huggingface.co/TenStrip/LTX2.3-10Eros
- LoRA DMD: https://huggingface.co/TenStrip/LTX2.3_DMD_Lora
- Workflow de ejemplo: https://huggingface.co/ChrisColeTech/LTX-2.3-uncensored-fp8/resolve/main/workflow_examples/LTXV23_v1.4_T2AV_nsfw.json
- Repositorio relacionado (FP8): https://huggingface.co/ChrisColeTech/LTX-2.3-uncensored-fp8
