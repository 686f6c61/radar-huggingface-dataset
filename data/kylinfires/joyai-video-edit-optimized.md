# kylinfires/JoyAI-Video-Edit-optimized

## Resumen

JoyAI-Video-Edit-optimized es un fork de despliegue del modelo JoyAI-Video-Edit, desarrollado originalmente por JD Open Source (jdopensource). El modelo base es un sistema de edición de vídeo en tiempo real guiado por instrucciones en lenguaje natural, capaz de procesar flujos de vídeo abiertos de forma causal: edita cada fotograma a medida que llega, sin esperar a tener la secuencia completa ni requerir una duración predefinida. Combina un codificador de condiciones basado en MLLM, un VAE de vídeo causal y un backbone de difusión multimodal (MMDiT) de 16.000 millones de parámetros.

Este fork, publicado por el usuario kylinfires, no modifica los pesos del modelo sino que añade herramientas de portabilidad y cuantización: equivalentes en PyTorch puro de los kernels CUDA propietarios (`joyomni_ops`), soporte de pesos int8 e int4, scripts de cuantización RTN y un cliente WebSocket sin interfaz gráfica. El objetivo es facilitar el despliegue en hardware no NVIDIA (ROCm, CPU) y reducir los requisitos de memoria, que en bf16 alcanzan los 31,8 GB solo para los pesos del DiT.

La relevancia del fork radica en que documenta con métricas objetivas (PSNR, similitud de identidad) el impacto real de la cuantización sobre la calidad de edición, un dato poco habitual en forks de optimización. La licencia Apache-2.0 del modelo base se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión autorregresiva multimodal: codificador de condiciones MLLM + VAE de vídeo causal + backbone MMDiT (diffusion transformer) |
| Parametros totales | 16 000 millones (16B) en el sistema completo |
| Parametros activos | no disponible (no se describe como MoE) |
| Longitud de contexto | no disponible (flujo causal con estado KV acotado; sin cifra publicada) |
| Tipos de cuantizacion | bf16, int8 (per-channel, weight-only), int4 (group-wise, gs=64), mixta attention-int8 + MLP-int4 (gs=16) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pth` (checkpoint DiT original), shards bf16 e int4 cargados vía `JOYOMNI_DIT_SD_DIR` / `JOYOMNI_DIT_INT4_DIR`; integración con `diffusers` |

## Arquitectura y entrenamiento

El sistema es un editor de difusión autorregresiva diseñado para generación causal de baja latencia. El pipeline encadena tres componentes: un codificador de condiciones basado en MLLM que interpreta la instrucción de edición junto con la imagen o fotograma de referencia; un VAE de vídeo causal que comprime el flujo entrante; y un transformer de difusión multimodal (MMDiT) de 16B parámetros que genera los fotogramas editados por trozos (chunks). La inferencia opera con estado KV acotado, de modo que el coste computacional por trozo se mantiene estable a lo largo de un flujo indefinido, sin revisitar fotogramas futuros.

El entrenamiento parte de un modelo autorregresivo de difusión y se acelera mediante *aligned autoregressive distribution matching distillation* (destilación por coincidencia de distribuciones) y optimización de horizonte largo, técnicas orientadas a reducir el desajuste entre entrenamiento e inferencia y la deriva temporal acumulada en secuencias largas. El fork de optimización añade equivalentes en PyTorch puro de los kernels CUDA `joyomni_ops` (LayerNorm+modulate, QK-norm+3D RoPE, RMSNorm), verificados como bit-exactos frente a la ruta CUDA (99,997 % de valores idénticos, diferencia máxima de 1 ulp en bf16), con retroceso automático a la ruta torch cuando `joyomni_ops` no está disponible (ROCm, CPU u otros backends).

## Capacidades

- Edición de vídeo en tiempo real sobre flujos abiertos, procesando fotogramas de forma causal sin requerir la secuencia completa.
- Edición guiada por instrucciones en lenguaje natural: cambios de sujeto, ediciones locales, sustitución de fondo, transferencia de estilo y modificación de movimiento.
- Edición guiada por imagen de referencia (RV2V), con preservación de identidad y sujeto; el checkpoint de agosto de 2026 mejora esta capacidad.
- Procesamiento de vídeo subido o de cámara en directo vía WebSocket (cliente `tools/jve_client.py` con imagen de referencia, prompt y fotogramas).
- Soporte de cuantización int8 e int4 weight-only con cargadores de state-dict para ambos formatos.
- Ejecución en hardware no NVIDIA mediante la ruta torch de retroceso (ROCm, CPU).
- Idiomas de instrucción: inglés y chino.
- No se documentan en la información disponible capacidades de tool calling, agentes ni audio.

## Casos de uso

- Edición de vídeo en directo para creadores de contenido: el modelo procesa la señal de una webcam y aplica la instrucción de edición en streaming, alcanzando 840 × 480 a 24 FPS en una RTX 5090, lo que permite previsualizar el resultado mientras se graba.
- Sustitución de sujeto o identidad en producción audiovisual: con el checkpoint RV2V y una imagen de referencia, el modelo mantiene la identidad del sujeto a lo largo del flujo; conviene usar int8, ya que int4 rompe el intercambio de personas guiado por referencia.
- Transferencia de estilo en tiempo real para emisiones: la edición de estilo sobre flujo continuo encaja en retransmisiones donde se requiere transformar la imagen sin postproceso por lotes.
- Sustitución de fondos en videoconferencia o virtual production: las ediciones locales y de fondo permiten reemplazar el entorno de forma causal, sin necesidad de definir la duración de la sesión.
- Despliegue en infraestructura AMD o mixta: la ruta torch de retroceso permite ejecutar el pipeline en ROCm cuando los kernels CUDA no están disponibles, a costa del rendimiento que ofrezca esa ruta.
- Prototipado e investigación en edición de vídeo generativa: los scripts de entrenamiento publicados y el benchmark LongV2VBench permiten evaluar ediciones de formato largo y reproducir experimentos de cuantización con métricas objetivas.
- Servicio de edición por API sin interfaz: el cliente WebSocket headless facilita integrar el editor en un backend que reciba fotogramas y devuelva el vídeo editado.

## Benchmarks y rendimiento

Métricas de calidad del fork (840 × 480, mismos pesos, prompt y fotogramas):

| Precisión | Tamano de pesos | PSNR vs bf16 | Similitud de identidad |
|---|---:|---:|---:|
| bf16 | 31,8 GB | — | 0,314 |
| int8 | 15,2 GiB | 21,8 dB | 0,359 |
| int4 (gs=64) | 8,1 GiB | 19,0 dB | 0,103 |
| attn int8 + MLP int4 (gs=16) | 11,4 GiB | 19,2 dB | 0,199 |

El pipeline es determinista entre reinicios (dos procesos nuevos con los mismos pesos int4 dan PSNR de 138 dB), por lo que las diferencias son reales y no ruido de medición. El fork documenta que int4 rompe el intercambio de personas guiado por referencia y que la señal de identidad reside íntegramente en la ruta de atención: cuantizar solo la atención a int4 colapsa el intercambio incluso con todos los MLP en bf16.

Rendimiento de despliegue del modelo base (según la model card): 30 FPS de extremo a extremo a 720 × 1248; 840 × 480 a 24 FPS en una RTX 5090 (32 GB); 720p a 16 FPS en una RTX PRO 6000 (Blackwell). No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM para pesos en bf16: 31,8 GB solo para el DiT, más el VAE causal y el codificador MLLM; requiere GPU de 48 GB o superior para margen de activaciones.
- VRAM con int8: 15,2 GiB de pesos, lo que abre la puerta a GPU de 24-32 GB.
- VRAM con int4: 8,1 GiB de pesos; la configuración mixta attention-int8 + MLP-int4 ocupa 11,4 GiB.
- GPU verificadas: RTX 5090 (32 GB) a 840 × 480 y 24 FPS; RTX PRO 6000 (Blackwell) a 840 × 480 y 24 FPS o 720p y 16 FPS.
- Cabe en GPU de consumo con cuantización: una RTX 5090 ejecuta el flujo en tiempo real a resolución reducida; en int4 cabría en GPU de 16 GB, aunque con la pérdida de calidad documentada.
- Despliegue: código de despliegue propio del repositorio oficial (carpeta `deploy/xvideo`), integración con `diffusers`, cliente WebSocket headless; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no son aplicables a un pipeline de difusión de vídeo).
- Backends alternativos: ROCm y CPU mediante la ruta torch de retroceso, sin cifras de latencia publicadas para esos backends.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / flujo | Licencia | Enfoque |
|---|---|---|---|---|
| JoyAI-Video-Edit (base) | 16B | Causal, sin duración predefinida | Apache-2.0 | Edición de vídeo en streaming con kernels CUDA |
| JoyAI-Video-Edit-optimized (este fork) | 16B | Causal, sin duración predefinida | Apache-2.0 | Igual, con kernels portables, int8/int4 y métricas de calidad |
| Alternativas de edición de vídeo por difusión | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de información sobre modelos comparables de la misma categoría (edición de vídeo en streaming con difusión autorregresiva) en las fuentes consultadas.

## Limitaciones y advertencias

- La cuantización int4 degrada gravemente la preservación de identidad (similitud 0,103 frente a 0,314 en bf16) y rompe el intercambio de personas guiado por referencia; para edición RV2V debe usarse int8 o bf16.
- La cuantización de la atención a int4 colapsa la señal de identidad incluso manteniendo los MLP en bf16.
- Solo se documentan instrucciones en inglés y chino; el rendimiento en otros idiomas no está verificado.
- Riesgo de deriva temporal acumulada en flujos muy largos, mitigado pero no eliminado por las técnicas de horizonte largo del modelo base.
- Riesgo de alucinación visual: como modelo generativo, puede introducir artefactos o alteraciones no solicitadas en regiones no editadas; no se documentan tasas de error.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- La licencia Apache-2.0 permite uso comercial, pero el fork no ofrece garantías sobre la calidad de las rutas portables (ROCm, CPU) ni sobre el rendimiento en backends no verificados.
- El repositorio del fork aparece con 0 descargas y 0 likes y un tamaño de 0,0 GB, lo que sugiere que los pesos no están alojados en él; deben obtenerse del modelo base.
- La fecha de creación del repositorio (2026-11-08) y la referencia arXiv (2608.03974) deben contrastarse con las fuentes oficiales antes de usarlas en producción.

## Enlaces

- Hugging Face del fork: https://huggingface.co/kylinfires/JoyAI-Video-Edit-optimized
- Modelo base en Hugging Face: https://huggingface.co/jdopensource/JoyAI-Video-Edit
- Pesos DiT del modelo base: https://huggingface.co/jdopensource/JoyAI-Video-Edit/blob/main/dit/joyai_video_edit_dit_0811.pth
- Repositorio oficial en GitHub: https://github.com/jd-opensource/JoyAI-Video-Edit
- Mirror del fork en GitHub: https://github.com/q760440238/JoyAI-Video-Edit-optimized
- Paper técnico: https://arxiv.org/abs/2608.03974
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/wxDai/joyai-video-edit
- Benchmark LongV2VBench: https://huggingface.co/datasets/EasonXiao-888/LongV2VBench
- Guía de despliegue: DEPLOYMENT.md (en el repositorio oficial)
- Scripts de entrenamiento: training/README.md (en el repositorio oficial)
