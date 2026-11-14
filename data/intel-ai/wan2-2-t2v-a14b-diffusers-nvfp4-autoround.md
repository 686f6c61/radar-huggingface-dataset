# intel-ai/Wan2.2-T2V-A14B-Diffusers-NVFP4-AutoRound

## Resumen

Wan2.2-T2V-A14B-Diffusers-NVFP4-AutoRound es una versión cuantizada a NVFP4 (W4A4) del modelo de generación de vídeo texto-a-vídeo Wan-AI/Wan2.2-T2V-A14B-Diffusers, publicada por el equipo de Intel AI mediante su herramienta AutoRound. El modelo original de Wan-AI es un pipeline de difusión con dos expertos transformer (arquitectura MoE de dos etapas) que genera vídeo a partir de descripciones textuales; esta variante reduce la precisión de pesos y activaciones a FP4 E2M1 para acelerar la inferencia en hardware Blackwell.

La cuantización afecta exclusivamente a los dos transformadores de difusión (`transformer` y `transformer_2`), con 400 capas lineales cuantizadas en cada uno. El text encoder, el VAE, los embeddings, las normas y las proyecciones excluidas permanecen en mayor precisión. El checkpoint tiene 8.141.215.584 parámetros y ocupa 28,5 GB en el repositorio, lo que supone una reducción sustancial frente a la versión BF16 del modelo base.

La relevancia de esta ficha radica en que demuestra la viabilidad de servir modelos de vídeo de gran tamaño en FP4 nativo (no emulado) sobre GPUs NVIDIA B200, con una degradación de calidad mínima según la evaluación VBench publicada por el autor. Es un caso práctico de cuantización de extremo a extremo para pipelines de difusión multimodales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline de difusión con dos expertos transformer (transformer y transformer_2), basado en Wan2.2-T2V-A14B |
| Parámetros totales | 8.141.215.584 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (modelo texto-a-vídeo, no LLM) |
| Tipos de cuantización | NVFP4 W4A4: pesos y activaciones FP4 E2M1, group size 16, escalas de bloque FP8 E4M3, escalas globales FP32 |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato AutoRound, compatible con diffusers y vLLM-Omni) |

## Arquitectura y entrenamiento

El modelo base Wan2.2-T2V-A14B es un pipeline de difusión texto-a-vídeo compuesto por dos transformadores especializados (expertos) que se aplican en distintas fases del proceso de denoising, controladas por el parámetro `boundary_ratio` (0,875 en la configuración de evaluación). La generación usa 40 pasos de inferencia, guidance scales de 4,0 y 3,0 (CFG de dos niveles), flow shift de 5,0 y produce vídeo a 1280×720, 81 fotogramas y 16 fps.

Esta variante no reentrena el modelo: aplica cuantización post-entrenamiento con AutoRound 0.17.0 usando el algoritmo RTN (round-to-nearest) sin optimización de redondeo (`--disable_opt_rtn`, `--iters 0`). El calibrado se realiza con el dataset OpenS2V (32 muestras, batch size 1, 8 pasos de inferencia de calibración) para obtener las escalas globales estáticas de activación; las escalas de bloque de activación son dinámicas. La inferencia emplea atención TRTLLM_ATTN y GEMMs CUTLASS NVFP4 de FlashInfer, es decir, cómputo FP4 nativo en lugar de una ruta de cuantización-descuantización emulada.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) a resolución 1280×720, 81 fotogramas y 16 fps.
- Control de generación mediante prompt positivo y prompt negativo (el autor proporciona un prompt negativo oficial en chino).
- Configuración ajustable de pasos de inferencia, guidance scale, guidance scale high, boundary ratio, flow shift y semilla.
- Soporte de dos expertos transformer con conmutación por boundary ratio para distintas fases del denoising.
- Compatibilidad con el pipeline `WanPipeline` de la librería diffusers.
- Servicio mediante vLLM-Omni con endpoint `/v1/videos` para generación de vídeo vía API.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking; es un modelo generativo de vídeo, no un LLM.

## Casos de uso

- Generación de vídeo publicitario a partir de briefs textuales: el modelo produce clips de 720p con 81 fotogramas y 16 fps, adecuados para prototipos de anuncios y moodboards, con control fino mediante prompt negativo y guidance scales.
- Creación de contenido para redes sociales: clips cortos de ~5 segundos a 16 fps generados por lotes vía el endpoint `/v1/videos` de vLLM-Omni, aprovechando la reducción de VRAM del formato FP4 para aumentar el throughput por GPU.
- Previsualización de storyboards en producción audiovisual: generación rápida de planos de referencia a partir de descripciones textuales antes de rodar, usando semilla fija para reproducibilidad.
- Investigación en cuantización de modelos de difusión: el checkpoint sirve como referencia reproducible para estudiar la degradación de calidad de NVFP4 frente a BF16 en tareas de vídeo, con métricas VBench publicadas.
- Despliegue en infraestructura Blackwell: servir el modelo en NVIDIA B200 con vLLM-Omni y FlashInfer para obtener cómputo FP4 nativo, reduciendo el coste por vídeo generado frente a la versión BF16.
- Generación de material sintético para entrenamiento o evaluación de otros sistemas de visión: clips controlados por prompt y semilla para construir datasets de vídeo con diversidad temática.
- Pruebas de integración en pipelines de difusión con diffusers: validar el comportamiento de `WanPipeline` con checkpoints cuantizados AutoRound en entornos de investigación.

## Benchmarks y rendimiento

Evaluación VBench 0.1.5 sobre 165 prompts (72 de `subject_consistency` y 93 de `overall_consistency`), un vídeo por prompt, resolución 1280×720, 81 fotogramas, 40 pasos, seed 42, CFG 4,0/3,0, boundary ratio 0,875 y flow shift 5,0. Las puntuaciones son fracciones; mayor es mejor. La recuperación es NVFP4 dividido entre BF16.

| Métrica | BF16 | NVFP4 | Recuperación |
|---|---:|---:|---:|
| imaging_quality | 0,721889 | 0,719336 | 99,65% |
| aesthetic_quality | 0,622004 | 0,609699 | 98,02% |
| motion_smoothness | 0,980194 | 0,980903 | 100,07% |
| overall_consistency | 0,237381 | 0,238401 | 100,43% |
| subject_consistency | 0,951550 | 0,947457 | 99,57% |

El cambio relativo absoluto medio en estas cinco métricas es del 0,65%. El autor advierte que se trata de una evaluación de subconjunto con un vídeo por prompt, no del protocolo completo de cinco muestras de VBench, y que no se reporta puntuación total VBench. No se han publicado resultados de benchmarks adicionales (FVD, CLIP score, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint ocupa 28,5 GB en FP4, por lo que se requiere al menos una GPU con 32 GB o más para cargar pesos y buffers de activación. La configuración evaluada usó una NVIDIA B200.
- GPU recomendadas: NVIDIA B200 (plataforma de evaluación oficial); se requiere hardware con soporte nativo de NVFP4 (arquitectura Blackwell) para aprovechar el cómputo FP4 real. En GPUs sin soporte NVFP4 nativo, el modelo puede requerir rutas de emulación o no ser compatible.
- ¿Cabe en GPU de consumo? No se documenta compatibilidad con GPUs de consumo (RTX 4090, etc.); el formato NVFP4 y las dependencias (FlashInfer CUTLASS NVFP4 GEMMs, TRTLLM_ATTN) apuntan a hardware de centro de datos Blackwell.
- Opciones de despliegue: vLLM-Omni (commit 7465c0f52) con `DIFFUSION_ATTENTION_BACKEND=TRTLLM_ATTN`; también compatible con diffusers (`WanPipeline`). Entorno evaluado: Python 3.12.3, PyTorch 2.14.0, vLLM 0.33.0, FlashInfer 0.7.2.post1, CUDA 12.8.93.
- Latencia y throughput: no disponibles. La evaluación se ejecutó en modo eager, sin caché, sin CPU offload y sin VAE tiling/slicing.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wan2.2-T2V-A14B-Diffusers-NVFP4-AutoRound (este) | 8.141.215.584 | 1280×720, 81 frames, 16 fps | NVFP4 W4A4 | Apache 2.0 | Hugging Face (intel-ai) |
| Wan-AI/Wan2.2-T2V-A14B-Diffusers (base) | no disponible en la información | 1280×720, 81 frames, 16 fps | BF16 | Apache 2.0 | Hugging Face (Wan-AI) |
| Otros modelos texto-a-vídeo comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo permite comparar con el modelo base BF16, del que este checkpoint es una versión cuantizada. No se dispone de datos de benchmarks ni especificaciones de otros modelos texto-a-vídeo en la información disponible.

## Limitaciones y advertencias

- La cuantización NVFP4 introduce una degradación medible aunque pequeña: la métrica `aesthetic_quality` cae un 1,98% respecto a BF16, la mayor pérdida entre las cinco evaluadas.
- La evaluación VBench se realizó con un subconjunto de 165 prompts y un único vídeo por prompt, no con el protocolo completo de cinco muestras; los resultados no deben interpretarse como una validación general de calidad.
- Se usó una única semilla (42); pequeñas variaciones de puntuación no establecen una mejora o degradación general de calidad, según advierte el propio autor.
- Los vídeos generados pueden contener artefactos, contenido inexacto o sesgos heredados del modelo base; se recomienda realizar pruebas de calidad y seguridad antes de desplegar en producción.
- El modelo hereda las limitaciones del modelo base Wan2.2-T2V-A14B, incluidas las de idioma y sesgos del dataset de entrenamiento original (no documentadas en esta información).
- Requiere hardware con soporte NVFP4 nativo (Blackwell) y un entorno concreto (vLLM-Omni, FlashInfer, TRTLLM_ATTN); no se garantiza su funcionamiento en GPUs de generaciones anteriores.
- El calibrado de escalas globales de activación requiere el dataset OpenS2V; modificar los metadatos de cuantización exportados por AutoRound puede romper la inferencia.
- Licencia Apache 2.0 permite uso comercial, pero se debe respetar la licencia del modelo base original.
- Solo 17 descargas y 0 likes en el momento de la ficha: ecosistema de validación todavía muy reducido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/intel-ai/Wan2.2-T2V-A14B-Diffusers-NVFP4-AutoRound
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-T2V-A14B-Diffusers
- Repositorio AutoRound (Intel): https://github.com/intel/auto-round
- vLLM-Omni (commit evaluado): https://github.com/vllm-project/vllm-omni/tree/7465c0f52bcb46a55f62c1b8613846cda30d0083
- Vídeo de referencia BF16: https://huggingface.co/intel-ai/Wan2.2-T2V-A14B-Diffusers-NVFP4-AutoRound/resolve/main/assets/cat_boxing_bf16.mp4
- Vídeo generado NVFP4: https://huggingface.co/intel-ai/Wan2.2-T2V-A14B-Diffusers-NVFP4-AutoRound/resolve/main/assets/cat_boxing_nvfp4.mp4
