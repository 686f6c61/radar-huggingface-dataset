# netprojects/Cosmos3-Edge-Omni-mlx-bf16

## Resumen

Cosmos3-Edge-Omni-mlx-bf16 es una conversión a MLX del generador de vídeo Cosmos3-Edge de NVIDIA, publicada por NetProjects (Internet Projects Ltd) para su ejecución en Apple Silicon. El modelo original forma parte de la familia Cosmos 3 de NVIDIA, que incluye las variantes Cosmos3-Super (64B), Cosmos3-Nano (16B) y Cosmos3-Edge (4B), junto con variantes específicas de tarea como Text2Image e Image2Video. Esta conversión concreta mantiene los pesos bf16 originales de NVIDIA sin modificar (con el embedder de timesteps en fp32), buscando la máxima fidelidad respecto a la pipeline de referencia.

El modelo resuelve la generación de vídeo a partir de texto (text-to-video), de una imagen inicial (image-to-video) y de imagen única (text-to-image), todo con una única arquitectura transformer Omni de 28 capas. La relevancia de esta build radica en que permite ejecutar el generador en hardware Apple Silicon mediante MLX, algo que las pipelines basadas en CUDA de NVIDIA no permiten de forma nativa, con un tamaño de repositorio de 7,6 GB.

La conversión conserva la licencia OpenMDW-1.1 del modelo original y no está afiliada a NVIDIA. El autor reporta métricas de paridad frente a la pipeline de diffusers 0.42.1 en fp32, con un coseno latente de 0,9975 y un PSNR de vídeo de 30,7 dB (image-to-video) y 27,1 dB (text-to-video) en la configuración de prueba.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Cosmos3 Omni de 28 capas (hidden 2048, 16 cabezas query / 8 key-value, M-RoPE 3D intercalado) con VAE de vídeo Wan 2.2 |
| Parametros totales | no disponible (variante Edge de la familia Cosmos3, referida como 4B en la documentación de NVIDIA) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (pesos bf16, embedder de timesteps en fp32); existe una build alternativa de 8 bits |
| Idiomas soportados | no disponibles (modelo de generación de vídeo, no de texto) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors en layout MLX (repo de 7,6 GB) |

## Arquitectura y entrenamiento

El modelo emplea un transformer Cosmos3 Omni de 28 capas con dimensión oculta 2048, 16 cabezas de query y 8 de key-value, y M-RoPE 3D intercalado. Cada capa contiene un stream de texto (con los pesos del reasoner) y un stream de generación con su propia atención y MLP; los tokens de vídeo atienden a todos los tokens de texto y entre sí, y las claves y valores de texto se calculan una sola vez por prompt y se reutilizan en cada paso de muestreo. El VAE es el Wan 2.2 (16× espacial, 4× temporal, 48 canales latentes), en bf16, que decodifica un frame latente cada vez. El sampler es UniPC (predicción de flow, orden 2) con el schedule nativo de NVIDIA y classifier-free guidance. En image-to-video, el primer frame se codifica con el VAE y se mantiene fijo como primer frame latente.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada. La model card de la conversión indica que los pesos son los propios de NVIDIA en el layout de MLX, con el `lm_head` del reasoner excluido, y que la build se valida contra la pipeline de referencia de diffusers mediante tests con modelos aleatorios pequeños (coincidencia de ~1e-5 en text-to-video, image-to-video y text-to-image).

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con control de frames, resolución, pasos, guidance, shift, seed y fps.
- Generación de vídeo a partir de una imagen inicial (image-to-video), manteniendo el primer frame fijo como latente.
- Generación de imagen única (text-to-image) escribiendo la salida como PNG cuando se solicita un solo frame.
- Soporte de prompts en JSON (formato de NVIDIA, como `example_i2v_prompt.json`) o en texto plano, con prompts negativos.
- Control de la resolución con múltiplos de 16 y del número de frames con la regla 4n+1.
- Ejecución en Apple Silicon mediante MLX, con límites de memoria configurables (`COSMOS_CACHE_LIMIT_GB`, `COSMOS_MEMORY_LIMIT_GB`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step, visión general, audio ni modo thinking en la información disponible.

## Casos de uso

- Generación de vídeo publicitario a partir de un prompt: el modelo produce clips de 121 frames a 24 fps y 832×480 con 20 pasos, adecuado para prototipos creativos en un MacBook Pro M5 Max.
- Animación de imágenes fijas: dado un primer frame (por ejemplo, una fotografía de producto), el modelo genera una secuencia coherente que arranca desde esa imagen, útil para demos de marketing.
- Creación de storyboards y previsualizaciones: la generación text-to-image con un solo frame permite iterar sobre composiciones antes de pasar a vídeo.
- Prototipado en local sin GPU NVIDIA: la build MLX permite ejecutar el generador en Apple Silicon, lo que facilita el trabajo de equipos con hardware de Apple.
- Investigación en generación de vídeo: la paridad medida frente a diffusers (coseno latente 0,9975) permite usar la build como referencia reproducible en estudios de drift de baja precisión.
- Generación de contenido para redes sociales: clips cortos de 61 frames con prompts negativos para controlar la calidad, ejecutables en un portátil con memoria unificada.
- Evaluación comparativa de cuantizaciones: la existencia de builds bf16 y de 8 bits con métricas de PSNR publicadas permite medir el impacto de la precisión en la calidad final.

## Benchmarks y rendimiento

La model card reporta métricas de paridad frente a la pipeline `Cosmos3OmniPipeline` de NVIDIA en diffusers 0.42.1 (fp32), medidas el 7 de noviembre de 2026 en un MacBook Pro M5 Max (128 GB), con la imagen y prompts de ejemplo de NVIDIA, 448×256, 17 frames, 20 pasos, guidance 6 y flow shift 12:

| Build | Tamano | Coseno latente (i2v / t2v) | PSNR de video (i2v / t2v) |
|---|---|---|---|
| 8 bits | 5,0 GB | 0,9960 / 0,9959 | 29,8 / 26,0 dB |
| bf16 | 7,6 GB | 0,9975 / 0,9975 | 30,7 / 27,1 dB |
| fp32 (referencia) | — | 0,9998 / 0,9995 | 41,9 / 35,2 dB |

Además, con la build de 8 bits, el ejemplo completo de image-to-video de NVIDIA (832×480, 121 frames, 24 fps, 20 pasos) tarda 113 s de extremo a extremo con un pico de 18,8 GB. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, lo cual es esperable al tratarse de un modelo generativo de vídeo.

## Requisitos de hardware

- VRAM/memoria: la build bf16 ocupa 7,6 GB en disco; el pico medido con la build de 8 bits en el ejemplo completo es de 18,8 GB. Para bf16 se debe esperar un pico superior, no especificado en la información disponible.
- GPU recomendadas: Apple Silicon; las métricas se midieron en un MacBook Pro M5 Max con 128 GB de memoria unificada.
- Compatibilidad con GPU consumer: el modelo está pensado para Apple Silicon vía MLX, no para GPU NVIDIA consumer en esta build; no se documenta soporte CUDA en esta conversión.
- Opciones de despliegue: MLX con el repositorio `internet-projects/cosmos3-edge-mlx` (CLI y API de Python); la referencia original se ejecuta con diffusers 0.42.1.
- Latencia y throughput: 113 s de extremo a extremo para 832×480, 121 frames, 24 fps y 20 pasos con la build de 8 bits en M5 Max; no se reporta throughput para la build bf16.
- Límites de memoria configurables: `COSMOS_CACHE_LIMIT_GB` (por defecto 2) y `COSMOS_MEMORY_LIMIT_GB` (por defecto 32).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Cosmos3-Edge-Omni-mlx-bf16 | no disponible (familia Edge referida como 4B) | no disponible | OpenMDW-1.1 | Hugging Face, MLX | Conversión bf16 para Apple Silicon |
| Cosmos3-Edge-Omni-mlx-8bit | no disponible | no disponible | OpenMDW-1.1 | Hugging Face, MLX | Build de 8 bits, 5,0 GB, menor PSNR |
| Cosmos3-Edge (NVIDIA) | no disponible (familia Edge referida como 4B) | no disponible | OpenMDW-1.1 | Hugging Face, diffusers | Modelo base original |
| Cosmos3-Nano | 16B | no disponible | no disponible | NVIDIA | Variante superior de la familia |
| Cosmos3-Super | 64B | no disponible | no disponible | NVIDIA | Variante tope de la familia |

No se dispone de datos de benchmarks comparativos con modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- La model card de NVIDIA pide a los usuarios añadir sus propias salvaguardas de seguridad para su caso de uso; esta conversión no incluye filtros adicionales.
- El drift de baja precisión se acumula a lo largo de los 20 pasos de muestreo: el PSNR baja de 41,9 dB (fp32) a 30,7 dB (bf16) en image-to-video y de 35,2 a 27,1 dB en text-to-video.
- La build bf16 no ha sido validada con pesos reales en los tests de paridad; estos usan modelos aleatorios pequeños.
- No se documentan sesgos conocidos específicos en la información disponible, aunque NVIDIA incluye documentos `BIAS.md`, `EXPLAINABILITY.md`, `PRIVACY.md` y `SAFETY.md` en el repositorio original.
- Riesgo de alucinación visual y de artefactos en la generación de vídeo, especialmente con prompts ambiguos o configuraciones de baja precisión.
- Restricciones de licencia: OpenMDW-1.1; se debe consultar el texto completo antes de uso comercial.
- El modelo no está afiliado a NVIDIA y es una conversión de terceros; la fidelidad depende de la revisión `344d602` del modelo base.
- No se dispone de información sobre idiomas soportados ni sobre el comportamiento multilingüe de los prompts.

## Enlaces

- Hugging Face: https://huggingface.co/netprojects/Cosmos3-Edge-Omni-mlx-bf16
- Build de 8 bits: https://huggingface.co/netprojects/Cosmos3-Edge-Omni-mlx-8bit
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Edge
- Repositorio del port: https://github.com/internet-projects/cosmos3-edge-mlx
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Referencia de modelos Cosmos: https://docs.nvidia.com/cosmos/latest/cosmos3/model_reference.html
- TensorRT Edge-LLM (Cosmos3-Edge): https://nvidia.github.io/TensorRT-Edge-LLM/developer_guide/models/cosmos3.html
- NetProjects: https://netprojects.com
