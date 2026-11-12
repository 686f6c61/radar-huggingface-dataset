# intel-ai/Wan2.2-T2V-A14B-Diffusers-MXFP8-AutoRound

## Resumen

Wan2.2-T2V-A14B-Diffusers-MXFP8-AutoRound es una version cuantizada a MXFP8 (W8A8) del modelo de generacion de video texto-a-video Wan-AI/Wan2.2-T2V-A14B-Diffusers, publicada por Intel a traves de su herramienta AutoRound. El modelo original, desarrollado por Wan-AI, resuelve la sintesis de video de alta resolucion (hasta 1280x720) a partir de descripciones textuales, y esta cuantizacion busca reducir el coste de memoria y acelerar la inferencia en hardware moderno sin degradar perceptiblemente la calidad de salida.

La arquitectura subyacente es un diffusion transformer (DiT) con dos expertos ("transformer" y "transformer_2"), cada uno con 400 capas lineales, lo que suma aproximadamente 14.700 millones de parametros en total. La version de Intel mantiene intactos el text encoder UMT5, el VAE, los embeddings y las normas, y cuantiza unicamente las proyecciones lineales de los dos expertos a FP8 con escalado microscopico por grupos de 32 elementos, con cuantizacion dinamica de activaciones.

Su relevancia actual radica en que demuestra que la cuantizacion MXFP8 de extremo a extremo con kernels reales (FlashInfer CUTLASS MXFP8 GEMM y CuTe DSL para activaciones) preserva la calidad del modelo BF16 con una variacion media absoluta de solo el 0,12% en las metricas VBench evaluadas, lo que la convierte en una opcion atractiva para despliegue en produccion sobre GPUs Blackwell como la B200.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) con dos expertos de difusion (`transformer` y `transformer_2`), 400 capas lineales cada uno |
| Parametros totales | 14.727.582.784 (~14,7 mil millones) |
| Parametros activos | no disponible (no es MoE en el sentido clasico; son dos expertos de difusion secuenciales) |
| Longitud de contexto | no disponible (modelo texto-a-video; no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | MXFP8 W8A8 (OCP microscaling FP8, grupo de 32, cuantizacion dinamica de activaciones); text encoder, VAE, embeddings, normas y proyecciones excluidas permanecen sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 41,7 GB) |

## Arquitectura y entrenamiento

El modelo es una adaptacion del Wan2.2-T2V-A14B original, que emplea una arquitectura de diffusion transformer con dos expertos de difusion que operan de forma secuencial sobre el proceso de denoising. Cada experto contiene 400 capas lineales, y la cuantizacion MXFP8 se aplica exclusivamente a esas proyecciones lineales; el text encoder UMT5, el VAE, los embeddings, las capas de normalizacion y ciertas proyecciones excluidas se mantienen en su precision original para preservar la fidelidad de la condicion textual y de la decodificacion final.

La generacion de esta version se realizo con Intel AutoRound usando RTN (round-to-nearest) y un dataset de calibracion `opens2v` con 32 muestras, 0 iteraciones de ajuste y 8 pasos de inferencia de calibracion. El resultado son pesos y activaciones en FP8 con escalado microscopico por grupos de 32 elementos, con cuantizacion dinamica de activaciones. La inferencia evaluada utiliza el backend de atencion TRTLLM_ATTN, GEMMs MXFP8 de FlashInfer CUTLASS y un cuantizador de activaciones CuTe DSL, evitando la emulacion mediante quantize-dequantize. No se dispone de informacion sobre el volumen de tokens de entrenamiento del modelo base ni sobre si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generacion de video texto-a-video en resoluciones de hasta 1280x720 con 81 frames a 16 fps.
- Control fino de la generacion mediante prompts positivos y negativos, escalas de guidance (4.0/3.0), boundary ratio (0.875) y flow shift (5.0).
- Generacion determinista mediante semilla, util para reproducibilidad en pipelines de evaluacion.
- Dos expertos de difusion que permiten modelar la transicion entre distintas fases del proceso de denoising.
- Soporte de inferencia acelerada en FP8 con kernels nativos (FlashInfer CUTLASS MXFP8 GEMM, CuTe DSL).
- Integracion con el ecosistema diffusers (`WanPipeline`) y con vLLM-Omni para servir el modelo via API (`/v1/videos`).
- No se ha documentado soporte de tool calling, function calling, agentes ni capacidades multilingues explicitas en la informacion disponible.
- No se ha documentado modo thinking, vision ni audio como entradas.

## Casos de uso

- Generacion de video publicitario: el modelo puede producir clips de 720p a partir de descripciones textuales, adecuado para prototipado rapido de anuncios y storyboards con control de estilo mediante prompts negativos.
- Creacion de contenido para redes sociales: con 81 frames a 16 fps se obtienen clips de aproximadamente 5 segundos, utiles para piezas cortas verticales u horizontales generadas por lotes con semillas reproducibles.
- Previsualizacion de escenas en produccion audiovisual: los equipos pueden generar versiones preliminares de planos a partir de guiones textuales antes de rodar, reduciendo costes de preproduccion.
- Evaluacion de modelos generativos: la version MXFP8 permite ejecutar benchmarks como VBench con un coste de memoria menor que BF16, facilitando comparaciones a gran escala en clusters con GPUs Blackwell.
- Despliegue en produccion con vLLM-Omni: el endpoint `/v1/videos` permite integrar la generacion de video en servicios backend que ya utilizan vLLM para otros modelos, unificando la infraestructura.
- Investigacion en cuantizacion: sirve como referencia reproducible para estudiar el impacto de MXFP8 en modelos de difusion, con scripts de generacion via AutoRound y metricas VBench publicadas.
- Generacion de video educativo o divulgativo: la capacidad de fijar semilla y parametros de guidance facilita la produccion controlada de material visual para cursos y demostraciones tecnicas.

## Benchmarks y rendimiento

Evaluacion VBench 0.1.5 sobre 165 prompts (72 de `subject_consistency` y 93 de `overall_consistency`), un video por prompt, a 1280x720, 81 frames, 16 fps, 40 pasos de inferencia, CFG 4.0/3.0, seed 42, boundary ratio 0.875 y flow shift 5.0. Las puntuaciones son fracciones; mayor es mejor. La recuperacion es MXFP8 dividido por BF16.

| Metrica | BF16 | MXFP8 | Recuperacion |
|---|---:|---:|---:|
| imaging_quality | 0,721889 | 0,722244 | 100,05% |
| aesthetic_quality | 0,622004 | 0,621066 | 99,85% |
| motion_smoothness | 0,980194 | 0,980503 | 100,03% |
| overall_consistency | 0,237381 | 0,238093 | 100,30% |
| subject_consistency | 0,951550 | 0,952117 | 100,06% |

La variacion relativa media absoluta entre ambas versiones es del 0,12%. Se trata de una evaluacion con un video por prompt, no del protocolo completo de cinco muestras de VBench, y no se reporta puntuacion total de VBench. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de texto en la informacion disponible, ya que el modelo es de generacion de video.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repo pesa 41,7 GB en safetensors y la cuantizacion MXFP8 reduce el peso de los dos expertos frente a BF16, pero el VAE, el text encoder UMT5 y los embeddings permanecen en precision original.
- GPU recomendadas: la evaluacion oficial se realizo en NVIDIA B200 con CUDA 12.8.93, PyTorch 2.14.0, vLLM 0.33.0, FlashInfer 0.7.2.post1 y CUTLASS DSL 4.8.0; se requiere hardware compatible con MXFP8 y con los kernels FlashInfer CUTLASS.
- Cabe en GPU consumer: no disponible; no se ha documentado soporte en RTX 4090 u otras GPUs consumer, y los kernels MXFP8 evaluados estan orientados a arquitecturas Blackwell de centro de datos.
- Opciones de despliegue: vLLM-Omni (commit 7465c0f52) con `DIFFUSION_ATTENTION_BACKEND=TRTLLM_ATTN`, y diffusers mediante `WanPipeline`; no se ha documentado soporte en llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la evaluacion se ejecuto en modo eager, sin cache, sin CPU offload y sin VAE tiling/slicing, pero no se publican tiempos por video.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wan2.2-T2V-A14B-Diffusers-MXFP8-AutoRound (este) | ~14,7 mil millones | 1280x720, 81 frames, 16 fps | MXFP8 W8A8 | Apache 2.0 | Hugging Face (intel-ai) |
| Wan-AI/Wan2.2-T2V-A14B-Diffusers (base BF16) | ~14,7 mil millones | 1280x720, 81 frames, 16 fps | BF16 | Apache 2.0 | Hugging Face (Wan-AI) |
| intel-ai/Wan2.2-T2V-A14B-Diffusers-NVFP4-AutoRound | ~14,7 mil millones | 1280x720, 81 frames, 16 fps | NVFP4 | Apache 2.0 | Hugging Face (intel-ai) |

No se dispone de datos de benchmarks comparativos frente a otros modelos texto-a-video de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Hereda las capacidades y limitaciones del modelo base; los videos generados pueden contener artefactos, contenido inexacto o sesgos.
- Riesgo de alucinacion visual: el modelo puede generar elementos anatomicamente incorrectos, texto ilegible o incoherencias temporales, como se refleja en el prompt negativo oficial.
- La evaluacion VBench publicada es un subconjunto con un video por prompt, no el protocolo completo de cinco muestras, por lo que las metricas no son directamente comparables con las puntuaciones estandar de VBench.
- La cuantizacion MXFP8 requiere hardware y kernels especificos (B200, FlashInfer CUTLASS, CuTe DSL); no se garantiza su funcionamiento en GPUs consumer o arquitecturas anteriores.
- Es necesario mantener sin modificar los metadatos de cuantizacion exportados por AutoRound; alterarlos puede degradar la calidad o romper la inferencia.
- No se documentan los idiomas soportados por el text encoder UMT5 en esta ficha; el prompt negativo oficial esta en chino, lo que sugiere capacidades multilingues en el modelo base, pero no se confirma en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda realizar pruebas de calidad y seguridad antes de desplegar en produccion.
- El numero de descargas (85) y likes (0) es bajo, lo que indica una adopcion limitada y poca validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/intel-ai/Wan2.2-T2V-A14B-Diffusers-MXFP8-AutoRound
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-T2V-A14B-Diffusers
- Version NVFP4 del mismo modelo: https://huggingface.co/intel-ai/Wan2.2-T2V-A14B-Diffusers-NVFP4-AutoRound
- Repositorio AutoRound: https://github.com/intel/auto-round
- Commit de AutoRound usado para generar el modelo: https://github.com/intel/auto-round/tree/3ab65744a0013a90759bd21ee56a115c8605bd37
- vLLM-Omni (commit evaluado): https://github.com/vllm-project/vllm-omni/tree/7465c0f52bcb46a55f62c1b8613846cda30d0083
- Video de referencia BF16: https://huggingface.co/intel-ai/Wan2.2-T2V-A14B-Diffusers-MXFP8-AutoRound/resolve/main/assets/cat_boxing_bf16.mp4
- Video generado con MXFP8: https://huggingface.co/intel-ai/Wan2.2-T2V-A14B-Diffusers-MXFP8-AutoRound/resolve/main/assets/cat_boxing_mxfp8.mp4
- Paper de referencia AutoRound (arXiv:2309.05516): https://arxiv.org/abs/2309.05516
