# Frosty40/h3-spark

## Resumen

El repositorio `Frosty40/h3-spark` no es un modelo de IA al uso, sino un paquete completo de *serving* para ejecutar MiniMax H3, un modelo de generación de vídeo, sobre una única NVIDIA DGX Spark (GB10, arquitectura Blackwell sm120). Incluye dos partes: un conjunto de pesos podados y cuantizados en NVFP4 (derivados modificados de MiniMax H3) y una configuración de *serving* validada para ComfyUI, con kernels nativos, fusión de operaciones y calibración de atención SageAttention 2++.

El objetivo es reducir el coste por paso de 12,1 s/step (configuración stock de ComfyUI con BF16) a 7,42-7,68 s/step, alcanzando tiempos de render de 170-180 segundos para una carga de trabajo fija de 20 pasos, 864×480, 124 fotogramas y seis referencias. La relevancia actual reside en que permite ejecutar generación de vídeo de alta calidad en un hardware de escritorio de gama alta (DGX Spark) a velocidad casi interactiva, algo que antes requería clústeres de GPUs.

El repositorio tiene 0 descargas y 0 *likes* en el momento de su publicación, y su licencia es `other` (MiniMax H3 Community License para los pesos, GPL-3.0 para las partes de ComfyUI, Apache-2.0 para comfy-kitchen y SageAttention). No se proporcionan datos sobre el número de parámetros, arquitectura interna, contexto o idiomas soportados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MiniMax H3 (modelo de generacion de video, arquitectura interna no especificada en la informacion) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE declarado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (dinamica y estatica con escalas promovidas) |
| Idiomas soportados | no disponible |
| Licencia | other (MiniMax H3 Community License para pesos; GPL-3.0 para codigo ComfyUI; Apache-2.0 para comfy-kitchen y SageAttention) |
| Formato de pesos | no especificado explicitamente; se menciona cuantizacion NVFP4 (probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo MiniMax H3 (no se indican detalles de atencion, mezcla de expertos, SSM ni hibridos). El repositorio se centra en el *serving* optimizado, no en el entrenamiento. Se mencionan optimizaciones especificas:

- Atencion SageAttention 2++ de calidad con calibracion de activaciones reales (`H3_ATTENTION=sage2-quality`).
- Fusion exacta de modulacion segmentada (`H3_MODULATION_FUSION=exact`).
- Empaquetado nativo NVFP4 para los lineales del Omni-Transformer (200 lineales NVFP4 por evaluacion).
- Fusion de RMSNorm Q promovida + RoPE rot96 a Sage Q-INT8 (`H3_Q_RMS_ROPE_INT8_FUSION=auto`).
- VAE con *fast path*: decode/encode por tiles de 256px, kernel nativo SwiGLU, transferencia fp16 a host, buffer de decode persistente y staging NHWC.
- Caches invariantes al paso: rope/cond/mask, filtro sinc de audio, grid de ViT3D; reutilizacion de encode/vision/pack de referencia identica.
- Escalas de activacion NVFP4 estaticas opcionales con promocion *fail-closed*.

No se proporcionan datos sobre el dataset de entrenamiento, numero de tokens, ni si se aplicaron tecnicas como RLHF o DPO.

## Capacidades

- Generacion de video a partir de texto e imagenes de referencia (se mencionan seis referencias en la carga de trabajo de prueba).
- Integracion con ComfyUI como backend de generacion.
- Ejecucion optimizada para hardware Blackwell (DGX Spark sm120, B200 en validacion).
- Cuantizacion NVFP4 con dos modos: dinamico (siempre valido) y estatico con escalas promovidas (sujeto a verificacion).
- Atencion SageAttention 2++ con calibracion de activaciones reales para mantener calidad.
- VAE acelerado con decode/encode por tiles y kernels nativos.
- Soporte de *serving* a velocidad de produccion (medido en s/step y tiempo total de render).
- No se mencionan capacidades de tool calling, agentes, razonamiento multi-paso ni soporte de audio/vision fuera del ambito de generacion de video.

## Casos de uso

- Generacion de video en produccion sobre DGX Spark: el paquete permite ejecutar renders de 20 pasos en menos de 3 minutos (170-180 s) para resoluciones 864×480 y 124 fotogramas, lo que habilita flujos de trabajo de postproduccion o previsualizacion en estudio.
- Prototipado rapido de contenidos audiovisuales: con seis imagenes de referencia y 24 fps, un creativo puede iterar sobre variaciones de video en una sola maquina de escritorio.
- Integracion en pipelines de ComfyUI: al ser un overlay sobre ComfyUI, se puede combinar con otros nodos de la plataforma para generar, editar y exportar video sin salir del ecosistema.
- Despliegue en entornos con restriccion de hardware: al caber en una sola DGX Spark, evita la necesidad de alquilar GPUs en la nube para pruebas de concepto.
- Validacion de configuraciones de cuantizacion: el modo estatico NVFP4 con promocion *fail-closed* permite experimentar con escalas fijas y verificar la calidad mediante el script `verify_promotion.py`.
- Investigacion sobre optimizacion de atencion y kernels nativos: el repositorio documenta fusiones especificas (SageAttention, NVFP4, Q-RMSNorm) que pueden servir de referencia para otros modelos de video.

## Benchmarks y rendimiento

Se han publicado resultados de rendimiento para una carga de trabajo fija (render de 20 pasos, 864×480, 124 fotogramas a 24 fps, seis referencias, S=20,423) en una DGX Spark (GB10, sm120) con boosting de SM:

| Configuracion | Sampler | s/step | Executor | Wall | SM |
|---|---:|---:|---:|---:|---|
| Stock ComfyUI (ops BF16) | 243 s | 12,1 | ~278 s | — | boosting |
| Config dinamica NVFP4 (2026-08-15) | 153,6 s | 7,68 | 171,7 s | 180,2 s | 2300-2330 MHz |
| Config estatica NVFP4 promovida (2026-08-15, 200/200 capas) | 148,4-149,4 s | 7,42-7,47 | 166,4-167,6 s | 170,0-170,1 s | 2242-2255 MHz |

El artefacto estatico paso la puerta de promocion *fail-closed* (`verify_promotion.py` exit 0): 200/200 capas estaticas, cero capas excluidas, ratio maximo hold-out de 0,9873. No se aportan resultados de benchmarks de calidad (MMLU, HumanEval, etc.) porque se trata de un modelo de generacion de video, no de texto o codigo.

## Requisitos de hardware

- GPU objetivo: NVIDIA DGX Spark (GB10, sm120) validada; B200 en proceso de validacion.
- VRAM estimada: no disponible en la informacion proporcionada.
- Software requerido: ComfyUI (GPL-3.0), comfy-kitchen >= 0.2.27 (Apache-2.0), SageAttention >= 2.2.0 (Apache-2.0), PyTorch 2.13.0+cu130, Triton 3.7.x, NVIDIA driver >= 580, CUDA 13.0.
- No cabe en GPUs de consumo (RTX 4090, etc.) segun lo declarado; esta pensado exclusivamente para hardware Blackwell con soporte NVFP4.
- Opciones de despliegue: ComfyUI con overlay de *serving*; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia medida: 7,42-7,68 s/step en la carga de trabajo de referencia, con tiempo total de render de 170-180 s.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (generacion de video optimizada para DGX Spark con cuantizacion NVFP4). No se puede establecer una comparativa fiable con alternativas como otros paquetes de *serving* de MiniMax H3 o modelos de video similares porque no hay datos publicos en la informacion proporcionada.

## Limitaciones y advertencias

- Los pesos son derivados modificados de MiniMax H3 y estan sujetos a la MiniMax H3 Community License Agreement, que incluye una definicion de "Applicable Territory" y restricciones en las secciones III y V. Es obligatorio leer el texto completo antes de cualquier uso o redistribucion.
- La licencia `other` no es permisiva de forma general; el uso comercial puede estar restringido segun los terminos de MiniMax H3 Community License.
- El paquete esta optimizado exclusivamente para hardware Blackwell (sm120); en otras arquitecturas puede no funcionar o degradar el rendimiento.
- No se proporcionan datos sobre sesgos, alucinaciones o limitaciones de idioma del modelo subyacente.
- La cuantizacion NVFP4 puede introducir perdidas de calidad respecto al modelo en BF16; el modo estatico requiere verificacion previa (`verify_promotion.py`) y no es valido para todas las cargas de trabajo (las escalas estan ligadas a la forma y a la carga).
- El repositorio tiene 0 descargas y 0 *likes*, lo que sugiere que no ha sido ampliamente probado por la comunidad; su fiabilidad en produccion no esta contrastada.
- El tamaño del repositorio es de 0.0 GB, lo que indica que los pesos no estan alojados aqui (se descargan de un repositorio companion), lo que anade un paso de instalacion adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Frosty40/h3-spark
- No se proporcionan enlaces a papers, blogs, demos o repositorios adicionales en la informacion disponible.
