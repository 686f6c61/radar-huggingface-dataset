# ChrisColeTech/LTX-2.3-uncensored-v1.4-FP8

## Resumen

LTX-2.3-uncensored-v1.4-FP8 es una compilación pre-fusionada del modelo de generación de vídeo LTX Video 2.3 de Lightricks, publicada por el usuario ChrisColeTech en Hugging Face. Se trata de un DiT (Diffusion Transformer) de 21.005.004.544 parámetros que incorpora tres ajustes finos fusionados directamente en los pesos: el LoRA NSFW Eros10, el LoRA destilado DMD y el ICLoRA Detailer oficial de LTXV. El resultado es un modelo "turbo" capaz de generar vídeo en tan solo 4 pasos de muestreo (8 pasos para resultados óptimos), con soporte para múltiples modalidades de entrada.

El modelo resuelve el problema de la generación de vídeo de alta calidad con requisitos de cómputo reducidos, gracias a la destilación DMD que acelera la inferencia, y añade capacidades multimodales que incluyen texto-a-vídeo, imagen-a-vídeo, vídeo-a-vídeo y audio-a-vídeo, con generación de audio sincronizado. Su relevancia actual radica en que combina la arquitectura LTX-2.3 con optimizaciones de inferencia (FP8, GGUF) que lo hacen viable en hardware de consumo, algo poco habitual en modelos de vídeo de esta escala.

La ficha se centra en la versión FP8 publicada, si bien el repositorio incluye también cuantizaciones GGUF. El modelo está etiquetado como "not-for-all-audiences" y su licencia figura como "unknown", lo que condiciona su uso comercial y su despliegue en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer), base Lightricks/LTX-2.3 |
| Parámetros totales | 21.005.004.544 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8, GGUF (repositorio etiquetado como gguf y quantized) |
| Idiomas soportados | no disponible |
| Licencia | unknown |
| Formato de pesos | safetensors (FP8), GGUF |
| Tamaño del repositorio | 296,0 GB |
| Modalidades de entrada | texto, imagen, vídeo, audio |
| Modalidades de salida | vídeo con audio |
| Pasos de muestreo | 4 (mínimo), 8 (óptimo), 9 (I2V) |
| Resolución de ejemplo | 1280 × 736 |
| Duración máxima documentada | 960 frames (~40 s) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura LTX-2.3 de Lightricks, un Diffusion Transformer (DiT) diseñado para generación de vídeo. Sobre los pesos base se han fusionado tres componentes: el LoRA Eros10 NSFW (fuerza 1.0), orientado a coherencia y contenido para adultos; el LoRA destilado DMD (fuerza 1.0), que reduce drásticamente el número de pasos de muestreo necesarios y mejora la preservación facial en image-to-video y el seguimiento de instrucciones; y el ICLoRA Detailer oficial de LTXV (fuerza 0.6), que mejora la adherencia a la imagen de referencia. La fusión se realizó antes de la cuantización a FP8 y GGUF.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base. La innovación técnica principal es la destilación DMD integrada, que permite generar vídeo en 4-8 pasos en lugar de las decenas habituales en modelos de difusión de vídeo, junto con la capacidad de generar audio sincronizado (modos T2VA, I2VA, FL2VA, REF2VA y audio-to-video). El modelo base LTX-2.3 de Lightricks es el componente fundacional sobre el que se aplican los ajustes; los LoRA Eros10 y DMD provienen de TenStrip.

## Capacidades

- Generación de vídeo a partir de texto (txt2video), con audio sincronizado en el modo T2VA.
- Generación de vídeo a partir de imagen (img2video / I2VA), preservando la identidad del sujeto de la imagen de referencia.
- Generación de vídeo a partir de vídeo (video-to-video) y de audio (audio-to-video).
- Generación de vídeo con primer y último fotograma especificados (FL2VA), útil para transiciones controladas.
- Generación de vídeo condicionada por imagen de referencia (REF2VA).
- Generación de audio integrada: el modelo produce pistas de audio junto con el vídeo, con mayor cantidad de audio y movimiento a mayor CFG.
- Generación de vídeo largo: hasta 960 frames (~40 s) documentados en los ejemplos.
- Generación rápida en 4 pasos (8 pasos para calidad óptima; 9 pasos en image-to-video).
- Control de estilo mediante CFG: valores bajos (1.0) para escenas íntimas y lentas, valores altos (3.5-3.8) para acción, cine y diálogo.
- Contenido NSFW integrado mediante el LoRA Eros10, con salvaguardas declaradas para impedir contenido ilegal.
- No se documentan capacidades de tool calling, function calling ni razonamiento multi-paso; no es un modelo de lenguaje.

## Casos de uso

- **Producción de vídeo publicitario de formato corto**: el modelo genera clips de ~5 s a 1280 × 736 en 8 pasos, adecuado para anuncios para redes sociales donde el coste por iteración es crítico. El modo FL2VA permite fijar el primer y último fotograma para respetar el storyboard.
- **Prototipado rápido de storyboards animados**: a partir de una imagen clave y un prompt, el modo I2VA genera una animación preservando la identidad del personaje, lo que acelera la previsualización de secuencias antes de la producción final.
- **Doblaje y sonorización automatizada**: los modos T2VA e I2VA generan audio sincronizado con la escena, lo que permite producir clips con diálogo y ambiente sin una fase separada de Foley.
- **Generación de vídeo largo para contenido editorial**: con hasta 960 frames (~40 s) documentados, es viable crear secuencias narrativas continuas para piezas de formato medio, como tráilers o vídeos explicativos.
- **Postproducción y retiming de metraje existente**: el modo video-to-video permite transformar estilo o contenido de un clip existente, útil para efectos de sustitución o restilización en pipelines de edición.
- **Creación de contenido para adultos con control de identidad**: el LoRA Eros10 y la preservación facial del DMD lo hacen adecuado para producción de contenido NSFW consistente entre tomas, siempre que se cumplan los requisitos legales y de consentimiento.
- **Investigación en modelos de difusión de vídeo**: la combinación de destilación DMD, cuantización FP8/GGUF y fusión de LoRA en un único checkpoint lo convierte en un caso de estudio para evaluar el impacto de estas técnicas en calidad y velocidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente documenta parámetros de muestreo y resoluciones de ejemplo (1280 × 736, 121 frames, 8 pasos, CFG 3.5), sin métricas cuantitativas de calidad (FVD, CLIP score, etc.) ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma explícita. Con 21.005 millones de parámetros, en FP8 los pesos ocupan aproximadamente 21 GB; en GGUF Q8 rondarían los 22 GB, en Q4 aproximadamente 11-12 GB. Estas cifras son estimaciones por tamaño de pesos y no incluyen activaciones ni el codificador de texto.
- **GPU recomendadas**: para FP8, GPU con al menos 24 GB de VRAM (RTX 4090, A100 40 GB, H100). Para GGUF Q4, GPU de consumo con 12-16 GB podrían ser suficientes, aunque no está confirmado por el autor.
- **Cabe en GPU de consumo**: previsiblemente sí en cuantizaciones GGUF bajas (Q4/Q5) sobre RTX 3090/4090 o equivalentes; el FP8 requiere 24 GB o más.
- **Opciones de despliegue**: ComfyUI (el autor publica workflows en formato JSON para ComfyUI), llama.cpp/GGUF para las variantes cuantizadas. No se documenta soporte de vLLM ni TGI, dado que no es un modelo de lenguaje.
- **Latencia y throughput**: no disponibles. El autor indica que 4 pasos producen resultados válidos y 8 pasos son óptimos, lo que reduce el coste frente a modelos de difusión de decenas de pasos, pero no se aportan tiempos por clip.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/duración | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| LTX-2.3-uncensored-v1.4-FP8 | 21.005 M | hasta 960 frames (~40 s) | unknown | Hugging Face (FP8, GGUF) | Destilado DMD, NSFW, audio integrado |
| Lightricks/LTX-2.3 (base) | no disponible | no disponible | no disponible | Hugging Face | Modelo fundacional sin ajustes NSFW ni destilación |
| TenStrip/LTX2.3-10Eros | no disponible | no disponible | no disponible | Hugging Face | Base del LoRA Eros10; sin fusión DMD |
| TenStrip/LTX2.3_DMD_Lora | no disponible | no disponible | no disponible | Hugging Face | LoRA destilado usado en la fusión |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a la procedencia y composición de los pesos.

## Limitaciones y advertencias

- **Licencia desconocida**: la licencia figura como "unknown", lo que impide determinar si el uso comercial está permitido. No debe desplegarse en producción sin aclarar la licencia con el autor y con Lightricks (modelo base).
- **Contenido NSFW integrado**: el modelo incorpora el LoRA Eros10 a fuerza 1.0 y está etiquetado como "not-for-all-audiences". Requiere verificación de edad, consentimiento y cumplimiento legal en la jurisdicción de uso.
- **Salvaguardas parciales**: el autor declara guardarraíles contra contenido ilegal, pero advierte que están orientados principalmente a NSFW; no garantizan la ausencia de contenido problemático.
- **Riesgo de alucinación visual**: como modelo generativo de difusión, puede producir artefactos, inconsistencias anatómicas o desviaciones del prompt, especialmente en secuencias largas.
- **Idiomas no documentados**: no se especifica qué idiomas soportan los prompts; el rendimiento multilingüe es incierto.
- **Contexto no disponible**: no se documenta la longitud de contexto del codificador de texto, lo que limita la planificación de prompts largos.
- **Tamaño del repositorio**: 296 GB, lo que exige almacenamiento considerable y descargas largas; conviene seleccionar solo la cuantización necesaria.
- **Sin benchmarks**: la ausencia de métricas publicadas impide comparar objetivamente la calidad frente a alternativas.
- **Dependencia de ComfyUI**: los workflows publicados son específicos de ComfyUI; otros entornos requerirán adaptación manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ChrisColeTech/LTX-2.3-uncensored-v1.4-FP8
- Modelo base Lightricks: https://huggingface.co/Lightricks/LTX-2.3
- LoRA Eros10 (TenStrip): https://huggingface.co/TenStrip/LTX2.3-10Eros
- LoRA DMD (TenStrip): https://huggingface.co/TenStrip/LTX2.3_DMD_Lora
- Workflow de ejemplo T2AV NSFW: https://huggingface.co/ChrisColeTech/LTX-2.3-uncensored-fp8/resolve/main/workflow_examples/LTXV23_v1.4_T2AV_nsfw.json
- Repositorio relacionado del autor (FP8): https://huggingface.co/ChrisColeTech/LTX-2.3-uncensored-fp8
