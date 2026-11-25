# goodmai/Wan2.2-T2V-A14B-PV-MACaQ-4bit-MXFP4-MLX

## Resumen

Wan2.2-T2V-A14B-PV-MACaQ-4bit-MXFP4-MLX es una version cuantizada a 4 bits del modelo de generacion de video texto-a-video Wan 2.2 T2V-A14B de Alibaba, empaquetada especificamente para su ejecucion en Apple Silicon mediante la libreria MLX. El trabajo lo publica el usuario goodmai dentro de su ecosistema Basalt, una herramienta nativa de macOS (Swift) para generar video sin depender de Python ni FFmpeg. El modelo base es un Diffusion Transformer (DiT) de tipo Mixture-of-Experts orientado a video, y esta variante aplica una tecnica propietaria de cuantizacion denominada PV-MACaQ en formato MXFP4 con refinamiento de escalas mediante PV-Tuning.

El problema que resuelve es el de hacer viable la inferencia de un modelo de video de gran tamano (los pesos originales del transformer ocupan 53,23 GB) en equipos de consumo con memoria unificada de 24 a 64 GB. La cuantizacion reduce la huella del transformer a 7,12 GB, lo que supone una compresion de 7,48x, manteniendo una calidad medida de 19,00 dB de SQNR sobre el conjunto de validacion. Es relevante ahora porque permite generar video cinematografico de alta motion en Macs sin GPU dedicada, un nicho hasta hace poco reservado a clusters con A100/H100.

El repositorio ocupa 8,2 GB y declara 2.262.644.800 parametros en los safetensors publicados, una cifra que corresponde a los pesos efectivamente empaquetados y no al total del modelo base. La licencia es Apache-2.0, heredada del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) de video con Mixture-of-Experts (moe_video_dit) y VAE causal 3D |
| Parametros totales | 2.262.644.800 (pesos empaquetados en safetensors); el modelo base A14B no declara el total en la informacion disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo de difusion, no de texto; opera sobre prompts y numero de frames) |
| Tipos de cuantizacion | PV-MACaQ 4-bit MXFP4 (B=32 Walsh-Hadamard + uint8 E8M0 + bfloat16 PV-tuned pre_scale) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato MLX), 12 shards |

## Arquitectura y entrenamiento

El modelo base Wan 2.2 T2V-A14B es un Diffusion Transformer para generacion de video texto-a-video con arquitectura Mixture-of-Experts, disenado para producir clips cinematograficos de alta motion. Esta variante no reentrena el modelo: parte del checkpoint Wan-AI/Wan2.2-T2V-A14B-Diffusers y le aplica cuantizacion post-entrenamiento. Concretamente, cuantiza 404 capas lineales 2D del DiT a 4 bits en formato MXFP4, usando una transformada Walsh-Hadamard de bloque B=32, escala compartida en uint8 con exponente E8M0 y un factor pre_scale en bfloat16 refinado mediante PV-Tuning. El refinamiento de escalas mejora el SQNR de 18,84 dB (RTN MXFP4) a 19,00 dB (PV-MACaQ MXFP4), una ganancia de +0,16 dB, y reduce el error cuadratico medio sobre validacion un 4,8 % respecto a la cuantizacion round-to-nearest.

La innovacion principal es el pipeline de cuantizacion PV-MACaQ combinado con PV-Tuning, que permite comprimir 53,23 GB de pesos a 7,12 GB sin colapso de calidad perceptible segun las metricas del autor. El modelo incorpora ademas un VAE causal 3D para la decodificacion de latentes a video, y el ecosistema Basalt anade opciones de VAE tiling y atencion dispersa (sta_sparse) para reducir picos de memoria. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF/DPO, ya que se trata de una cuantizacion y no de un entrenamiento desde cero.

## Capacidades

- Generacion de video texto-a-video a partir de prompts en lenguaje natural, con resolucion y duracion dependientes de la configuracion (el preset por defecto usa 81 frames a 24 fps).
- Generacion de video cinematografico de alta motion, orientada a escenas con movimiento complejo (olas, paisajes,动作 dinamica).
- Inferencia nativa en Apple Silicon mediante MLX, sin necesidad de CUDA.
- Integracion con el pipeline declarativo Basalt (basalt.yaml v2.2) para composicion de modelos director + cinema.
- Soporte de VAE tiling y atencion dispersa para gestionar memoria en GPUs integradas.
- Carga bajo demanda y descarga por inactividad (idle_unload) para convivir con otros modelos en memoria unificada.
- No se documentan capacidades de tool calling, agentes, vision de entrada, audio ni modo thinking; es un modelo puramente generativo de video.

## Casos de uso

- Generacion de clips cinematograficos en Mac: un estudio pequeno puede producir tomas de alta motion (por ejemplo, "Ocean swell crashing against hexagonal basalt cliffs at golden hour") directamente en un Mac Studio de 36-64 GB, sin GPU dedicada, usando el preset 36gb-video-wan22-a14b.
- Prototipado rapido de storyboards: guionistas y disenadores pueden iterar prompts y obtener clips de 81 frames a 24 fps para validar ideas antes de pasar a produccion con modelos mayores.
- Previsualizacion de VFX en postproduccion: el modelo permite generar planos de referencia con movimiento realista que sirven como base para composicion y rotoscopia.
- Generacion de contenido para redes sociales: clips cortos de alta calidad visual generados localmente, con la ventaja de no enviar prompts a servicios en la nube.
- Educacion y divulgacion: creacion de material audiovisual explicativo (fenomenos naturales, procesos fisicos) a partir de descripciones textuales.
- Investigacion en cuantizacion: el repo sirve como referencia reproducible para estudiar el impacto de PV-MACaQ MXFP4 frente a RTN en modelos de difusion de video, con metricas de SQNR y MSE publicadas.
- Automatizacion de pipelines creativos: mediante el CLI de Basalt (`basalt video generate`) se puede integrar la generacion en scripts de CI o flujos de produccion por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (VBench, FVD, CLIP score) en la informacion disponible. El autor solo reporta metricas de cuantizacion:

| Metrica | Valor |
|---|---|
| SQNR de salida en validacion (RTN MXFP4) | 18,84 dB |
| SQNR de salida en validacion (PV-MACaQ MXFP4) | 19,00 dB |
| Mejora de SQNR | +0,16 dB |
| Reduccion de MSE vs RTN | -4,8 % |
| Compresion de pesos del transformer | 7,48x (53,23 GB -> 7,12 GB) |
| Capas lineales cuantizadas | 404 en 12 shards |

## Requisitos de hardware

- VRAM/memoria unificada estimada: 24 GB con paginacion por fases y streaming desde SSD, o 36-64 GB de memoria unificada Apple Silicon para carga completa.
- GPU recomendadas: Apple Silicon de gama alta (M-series Pro, Max y Ultra). No es compatible con CUDA ni con GPUs NVIDIA/AMD.
- Cabe en consumer GPU: si, en equipos Apple con memoria unificada de 24 GB o superior; el preset incluido esta pensado para 36 GB y 48 GB.
- Opciones de despliegue: Basalt (app macOS 27+ y CLI, nativo Swift, sin Python ni FFmpeg), con soporte de MLX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que es un modelo de difusion de video y no un LLM.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / frames | Cuantizacion | Licencia | Plataforma |
|---|---|---|---|---|---|
| Wan2.2-T2V-A14B-PV-MACaQ-4bit-MXFP4-MLX (este) | 2.262.644.800 empaquetados | 81 frames @ 24 fps (preset) | 4-bit MXFP4 PV-MACaQ | Apache-2.0 | Apple Silicon (MLX) |
| Wan-AI/Wan2.2-T2V-A14B-Diffusers (base) | no disponible | no disponible | bf16/fp16 | Apache-2.0 | CUDA / difusion estandar |
| Alternativas de video open source de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento comparativo (VBench, FVD) frente a otros modelos de video, por lo que la comparativa se limita a plataforma, formato y licencia.

## Limitaciones y advertencias

- La cuantizacion a 4 bits introduce perdida de calidad respecto al modelo base; el autor reporta 19,00 dB de SQNR, lo que implica cierto ruido numerico aunque el MSE se reduzca un 4,8 % frente a RTN.
- Solo funciona en Apple Silicon con MLX; no hay soporte para CUDA, ROCm ni entornos Linux/Windows con GPU dedicada.
- Requiere macOS 27 o superior y el runtime Basalt; no es un modelo desplegable en frameworks de inferencia estandar como vLLM o TGI.
- Los idiomas soportados no estan documentados; el comportamiento multilingue de los prompts no esta garantizado.
- Riesgo de alucinacion visual y artefactos propios de los modelos de difusion de video (inconsistencia temporal, morphing, deformaciones en movimiento rapido), agravado por la cuantizacion.
- No se documentan sesgos conocidos ni evaluaciones de seguridad; al ser un derivado de Wan 2.2, hereda los sesgos del dataset original, no detallado.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Wan-AI/Wan2.2-T2V-A14B-Diffusers antes de desplegar en produccion.
- El numero de parametros publicado (2.262.644.800) corresponde a los pesos empaquetados y cuantizados, no al total del modelo A14B original; no debe usarse como referencia de tamano del modelo completo.
- Repositorio con muy baja adopcion (70 descargas, 0 likes) y creado recientemente; no hay validacion independiente de las metricas reportadas.

## Enlaces

- Hugging Face: https://huggingface.co/goodmai/Wan2.2-T2V-A14B-PV-MACaQ-4bit-MXFP4-MLX
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-T2V-A14B-Diffusers
- Repositorio Basalt en GitHub: https://github.com/goodmai/basalt
- Demo Basalt (Run with Basalt): https://goodmai-run-with-basalt.hf.space/?model=goodmai%2FWan2.2-T2V-A14B-PV-MACaQ-4bit-MXFP4-MLX&role=video&lang=en
