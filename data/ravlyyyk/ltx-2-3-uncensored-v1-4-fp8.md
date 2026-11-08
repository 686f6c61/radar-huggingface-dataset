# Ravlyyyk/LTX-2.3-uncensored-v1.4-FP8

## Resumen

LTX-2.3-uncensored-v1.4-FP8 es una compilación pre-fusionada del modelo de generación de vídeo LTX Video 2.3 de Lightricks, publicada por el usuario Ravlyyyk en Hugging Face. Se trata de un modelo de difusión de tipo DiT (Diffusion Transformer) que integra en sus pesos tres ajustes finos: la LoRA NSFW Eros10, la LoRA destilada DMD (que reduce el número de pasos de inferencia necesarios) y la ICLoRA Detailer oficial de LTX Video para mejorar la adherencia a la imagen de referencia. El resultado es un modelo "turbo" capaz de generar vídeo en tan solo 4 pasos, con 8 pasos recomendados para obtener la mejor calidad.

El modelo está pensado para generación de vídeo multimodal: acepta texto, imagen, audio y referencias combinadas como entrada (modos `txt2video`, `img2video`, `video2video`, `audio2video`, FL2VA, T2VA, I2VA y REF2VA). Su principal valor diferencial es la ausencia de censura en el contenido generado (etiqueta `not-for-all-audiences`), junto con la preservación de identidad en image-to-video y la capacidad de producir clips de hasta 960 fotogramas (unos 40 segundos).

El repositorio tiene un tamaño de 261,1 GB y contiene pesos en formato GGUF y FP8 mixto. El modelo base es Lightricks/LTX-2.3 (con 21.005.004.544 parámetros según los safetensors), y la licencia se declara como "unknown", lo que introduce incertidumbres importantes para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) de vídeo, basada en LTX Video 2.3 |
| Parametros totales | 21.005.004.544 (según safetensors del modelo base) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de difusión; no aplica ventana de contexto textual) |
| Tipos de cuantizacion | FP8 mixto y GGUF (quantized) |
| Idiomas soportados | no disponible |
| Licencia | unknown |
| Formato de pesos | safetensors (FP8 mixto) y GGUF |
| Pipeline | text-to-video (con soporte image-to-video, video-to-video y audio-to-video) |
| Resolución de ejemplo | 1280 × 736 |
| Longitud máxima de vídeo | 960 fotogramas (~40 s) |
| Pasos de inferencia | 4 (mínimo) / 8 (recomendado) |
| CFG de ejemplo | 1.0 a 3.8 según estilo |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura DiT de LTX Video 2.3 de Lightricks, un transformer de difusión diseñado específicamente para generación de vídeo. Sobre los pesos originales se han fusionado tres LoRAs: Eros10 NSFW (fuerza 1.0), orientada a coherencia y contenido para adultos; DMD Distilled LoRA (fuerza 1.0), que destila el proceso de difusión para permitir generaciones en 4-8 pasos con mejor preservación facial en image-to-video y mejor seguimiento de instrucciones; y LTX Video ICLoRA Detailer (fuerza 0.6), la LoRA oficial in-context de LTXV para mejorar la fidelidad a la imagen de referencia.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO, ya que se trata de una compilación de ajustes finos sobre un modelo base y la model card no detalla el proceso de entrenamiento de las LoRAs. La innovación técnica destacable es la destilación DMD, que reduce drásticamente los pasos de inferencia necesarios (de decenas a 4-8), y el soporte multimodal de entrada que combina audio, imagen y texto en un mismo pipeline de generación.

## Capacidades

- Generación de vídeo a partir de texto (`txt2video`) con control de estilo mediante CFG.
- Generación de vídeo a partir de imagen (`img2video`) con preservación de identidad del sujeto.
- Generación de vídeo a partir de vídeo (`video2video`).
- Generación de vídeo a partir de audio (`audio2video`), incluyendo audio ambiente y diálogo.
- Modos combinados FL2VA (primer y último fotograma + audio), T2VA, I2VA y REF2VA (referencia).
- Generación de clips largos de hasta 960 fotogramas (~40 s) en una sola pasada.
- Generación de audio sincronizado con el vídeo (el CFG más alto produce más movimiento y más audio).
- Contenido sin censura (NSFW), con guardarraíles declarados para contenido ilegal.
- Inferencia rápida en 4-8 pasos gracias a la destilación DMD.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).

## Casos de uso

- Producción de vídeo publicitario: generación de clips cortos (5 s) a 1280 × 736 con 8 pasos y CFG 3.5 para escenas cinematográficas con movimiento de cámara, reflejos y audio ambiente, integrable en un flujo ComfyUI.
- Creación de contenido para redes sociales: clips verticales u horizontales de 4-8 pasos con estilos controlados por CFG (1.0 para ritmo lento e íntimo, 3.8 para acción y diálogo).
- Animación de retratos y personajes: el modo `img2video` preserva la identidad facial gracias a la LoRA DMD, útil para avatares, doblajes o contenido de creadores.
- Vídeo musical y audio reactivo: el modo `audio2video` permite generar imágenes que responden a una pista de audio, adecuado para visuales de conciertos o videoclips.
- Previsualización de storyboards: a partir de un primer y último fotograma (FL2VA) se generan transiciones de hasta 40 s para validar secuencias antes de producción real.
- Contenido para adultos: la fusión de la LoRA Eros10 permite generar material NSFW coherente, con la advertencia de que la licencia es desconocida y el contenido está restringido a audiencias adultas.
- Investigación en generación de vídeo: servir como referencia de modelos destilados de pocos pasos para estudiar el equilibrio entre calidad, velocidad y fidelidad de identidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta configuraciones de ejemplo (resolución 1280 × 736, 121 fotogramas, 8 pasos, CFG 3.5) y afirma mejoras cualitativas en preservación facial y seguimiento de instrucciones respecto a v1 y al LTXV23 original, pero sin métricas cuantitativas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el repositorio ocupa 261,1 GB, por lo que la inferencia en FP8 requiere previsiblemente varias GPU de alta gama o descarga por capas (offloading).
- GPU recomendadas: A100 (80 GB), H100 (80 GB) o configuraciones multi-GPU para los pesos FP8 completos; las variantes GGUF cuantizadas permiten ajustar el consumo.
- GPU de consumo: no disponible confirmación; con cuantizaciones GGUF agresivas podría ser viable en RTX 4090 (24 GB) con offloading a RAM, pero no está documentado.
- Opciones de despliegue: ComfyUI (se enlaza un workflow T2AV/NSFW en la model card), llama.cpp/GGUF para las variantes cuantizadas; vLLM y TGI no aplican a modelos de difusión de vídeo.
- Latencia y throughput: no disponibles; la destilación DMD promete generaciones en 4-8 pasos, lo que reduce el coste frente a modelos de decenas de pasos, pero no se publican tiempos medidos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / duración | Licencia | Disponibilidad |
|---|---|---|---|---|
| Ravlyyyk/LTX-2.3-uncensored-v1.4-FP8 | ~21,0 B | hasta 960 fotogramas (~40 s) | unknown | Hugging Face, GGUF y FP8 |
| ChrisColeTech/LTX-2.3-uncensored-v1.4-FP8 | ~21,0 B | hasta 960 fotogramas (~40 s) | unknown | Hugging Face, GGUF y FP8 (origen de los samples) |
| Lightricks/LTX-2.3 (base) | ~21,0 B | no disponible | no disponible en la información | Hugging Face |
| TenStrip/LTX2.3-10Eros | no disponible | no disponible | no disponible | Hugging Face (modelo base) |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Licencia "unknown": no se puede garantizar el uso comercial; es imprescindible verificar los términos del modelo base Lightricks/LTX-2.3 y de las LoRAs fusionadas antes de cualquier despliegue en producción.
- Contenido NSFW explícito: el modelo está etiquetado como `not-for-all-audiences` y genera material para adultos; requiere control de acceso y cumplimiento normativo.
- Riesgo de alucinación visual: como modelo de difusión, puede producir artefactos, inconsistencias temporales y fallos de anatomía, especialmente en clips largos.
- Guardarraíles declarados por el autor para contenido ilegal, pero sin especificación técnica de cómo se implementan ni de su eficacia.
- Idiomas soportados no documentados; el rendimiento multilingüe en prompts es incierto.
- Tamaño del repositorio muy elevado (261,1 GB), lo que dificulta su descarga y despliegue en entornos con almacenamiento limitado.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas.
- El modelo se publicó con 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.

## Enlaces

- Hugging Face (Ravlyyyk): https://huggingface.co/Ravlyyyk/LTX-2.3-uncensored-v1.4-FP8
- Hugging Face (ChrisColeTech, origen de samples y workflows): https://huggingface.co/ChrisColeTech/LTX-2.3-uncensored-v1.4-FP8
- Pesos FP8 mixtos: https://huggingface.co/ChrisColeTech/LTX-2.3-uncensored-v1.4-FP8/blob/main/split/diffusion_models/ltxv23_uncensored_v1.4_fp8mixed.safetensors
- Workflow de ejemplo T2AV NSFW: https://huggingface.co/ChrisColeTech/LTX-2.3-uncensored-fp8/resolve/main/workflow_examples/LTXV23_v1.4_T2AV_nsfw.json
- Modelo base: https://huggingface.co/Lightricks/LTX-2.3
- Modelo base de ajuste: https://huggingface.co/TenStrip/LTX2.3-10Eros
- LoRA DMD: https://huggingface.co/TenStrip/LTX2.3_DMD_Lora
