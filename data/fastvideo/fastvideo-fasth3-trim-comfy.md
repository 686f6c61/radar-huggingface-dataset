# FastVideo/FastVideo-FastH3-Trim-Comfy

## Resumen

FastVideo FastH3 Trim Comfy es un reempaquetado de los pesos del modelo FastH3 Trim, un modelo de difusion de texto a video (con generacion de audio asociada) derivado de MiniMax-H3 y destilado por el equipo de FastVideo. La version Trim es una variante experimental podada: conserva 42 bloques transformer en lugar de los 50 del modelo base y sustituye el acondicionamiento temporal por uno de rango 16, lo que reduce el tamano del modelo en un factor de 4,2 respecto a MiniMax-H3 base y lo hace mas rapido que FastH3 V2. La inferencia esta disenada para 8 pasos, con un sampler `res_multistep` y el nodo `MiniMaxH3SigmaShift` fijado en 10 para video y 3 para audio.

Este repositorio concreto no aporta entrenamiento ni arquitectura nueva: su funcion es servir los ficheros de difusion en formato single-file listos para cargar en ComfyUI (version 0.36.0 o superior) mediante la plantilla "FastVideo FastH3: Text to Video". Se distribuyen cuatro cuantizaciones del bloque de difusion (nvfp4, fp8, int8 con rotacion de convolucion y bf16), junto con el text encoder basado en Qwen3-VL de 32B y los VAE de video y audio de MiniMax-H3.

Es relevante porque permite ejecutar un modelo de generacion de video con audio en GPUs de consumo (la variante nvfp4 ocupa 11,9 GB) sin necesidad de infraestructura de datacenter, algo poco habitual en modelos de video de esta familia. El repo pesa 190,9 GB en total, aunque el usuario final solo descarga los ficheros de la cuantizacion que le interese.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) podado: 42 bloques transformer, acondicionamiento temporal de rango 16 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | nvfp4, fp8, int8 con rotacion de convolucion (convrot), bf16 |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | safetensors single-file (diffusion-single-file) |

Especificaciones adicionales de los ficheros:

| Componente | Fichero | Tamano |
|---|---|---:|
| Difusion | `fastvideo_fasth3_trim_8step_nvfp4.safetensors` | 11,9 GB |
| Difusion | `fastvideo_fasth3_trim_8step_int8_convrot.safetensors` | 18,9 GB |
| Difusion | `fastvideo_fasth3_trim_8step_fp8.safetensors` | 19,7 GB |
| Difusion | `fastvideo_fasth3_trim_8step_bf16.safetensors` | 37,5 GB |
| Text encoder | `qwen3vl_32b_minimax_h3_bf16.safetensors` | no disponible |
| Text encoder | `qwen3vl_32b_minimax_h3_int8_convrot.safetensors` | no disponible |
| Text encoder | `qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors` | no disponible |
| VAE video | `minimax_h3_video_vae_fp16.safetensors` / `_int8_convrot` | no disponible |
| VAE audio | `minimax_h3_audio_vae_fp32.safetensors` | no disponible |

## Arquitectura y entrenamiento

El modelo es un transformer de difusion (DiT) para generacion conjunta de video y audio, heredado de MiniMax-H3. La variante Trim reduce la profundidad de la red de 50 a 42 bloques y reemplaza el acondicionamiento de paso temporal por uno de rango 16, lo que rebaja el coste computacional y el tamano de los pesos a costa de capacidad de representacion. El muestreo esta configurado para 8 pasos mediante `res_multistep` con scheduler `simple`, y el desplazamiento de sigma se controla con el nodo `MiniMaxH3SigmaShift` (10 para video, 3 para audio).

El pipeline completo incluye un text encoder Qwen3-VL de 32B en versiones bf16, int8 convrot y nvfp4 AWQ, y dos VAE separados para video (fp16 o int8 convrot) y audio (fp32). La informacion disponible no detalla el numero de tokens de entrenamiento ni la composicion del dataset. La busqueda web asocia a la familia FastH3 una destilacion few-step DMD2 sin datos (data-free) aplicada sobre MiniMax-H3 FL2VA; el repositorio reempaquetado no incluye procedimiento de entrenamiento, solo pesos de inferencia. No se documentan en la informacion disponible fases de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de video a partir de texto (text-to-video), segun la plantilla oficial "FastVideo FastH3: Text to Video".
- Generacion de audio asociada al video, evidenciada por el VAE de audio `minimax_h3_audio_vae_fp32` y por el parametro de sigma shift especifico de audio.
- Inferencia few-step: el modelo esta calibrado para 8 pasos de muestreo.
- Comprension de prompts multimodales a traves del text encoder Qwen3-VL 32B, que aporta capacidad de codificacion de instrucciones e imagen.
- Ejecucion local en ComfyUI mediante nodo `UNETLoader` y carga de ficheros safetensors sueltos.
- Cuantizaciones especificas por arquitectura de GPU: nvfp4 para Blackwell, fp8 para Ada y posteriores, int8 convrot para GPUs NVIDIA recientes en general.
- No se documenta en la informacion disponible soporte de tool calling, function calling, modo agente ni razonamiento multi-paso.
- No se documenta en la informacion disponible cobertura multilingue concreta.

## Casos de uso

- Generacion de clips de video con audio para prototipado creativo: con la cuantizacion nvfp4 (11,9 GB) un creador con una RTX 50 puede generar secuencias en 8 pasos dentro de ComfyUI sin infraestructura externa.
- Iteracion rapida de storyboards: al reducir el numero de bloques a 42 y fijar el muestreo en 8 pasos, el ciclo prompt-resultado es mas corto que con MiniMax-H3 base, lo que encaja en flujos de previsualizacion donde se descartan muchas variantes.
- Integracion en pipelines de ComfyUI existentes: los pesos son single-file y se cargan con `UNETLoader` usando la plantilla oficial, por lo que se pueden insertar en workflows de postprocesado, upscaling o composicion ya montados.
- Investigacion sobre destilacion de modelos de difusion: al ser un derivado podado y destilado de MiniMax-H3, sirve como punto de comparacion para estudiar el impacto de recortar bloques y reducir el rango del acondicionamiento temporal.
- Desarrollo de LoRA y ajustes especificos: la existencia de guias publicas de entrenamiento de LoRA sobre la familia FastH3 8-Step V2 indica que el modelo se usa como base para adaptaciones personalizadas.
- Evaluacion comparativa de formatos de cuantizacion en hardware heterogeneo: el repositorio ofrece el mismo modelo en nvfp4, fp8, int8 convrot y bf16, lo que permite medir diferencias de calidad y velocidad entre formatos en distintas generaciones de GPU.
- Generacion de material audiovisual para demostraciones tecnicas: la salida conjunta de video y audio evita tener que sincronizar una pista de audio generada por un modelo aparte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el bloque de difusion, a partir del tamano de los ficheros y sin contar text encoder ni VAE: en torno a 12 GB para nvfp4, 19-20 GB para int8 convrot, 20-22 GB para fp8 y 38-40 GB para bf16.
- VRAM adicional necesaria para el text encoder Qwen3-VL 32B y los VAE; la informacion disponible no especifica el consumo exacto de estos componentes.
- GPU recomendadas segun el propio autor: NVIDIA Blackwell (RTX 50, RTX PRO 6000, DGX Spark) para nvfp4; NVIDIA Ada y posteriores (RTX 40) para fp8; cualquier GPU NVIDIA reciente para int8 convrot.
- Cabe en GPU de consumo: si, con la variante nvfp4 en tarjetas Blackwell con 12 GB o mas, y con int8 convrot o fp8 en GPUs de 20-24 GB como la RTX 4090.
- Opciones de despliegue: ComfyUI 0.36.0 o superior con la plantilla "FastVideo FastH3: Text to Video". La informacion disponible no menciona soporte para vLLM, llama.cpp, Ollama ni TGI, lo cual es coherente con un modelo de difusion.
- Configuracion de muestreo obligatoria: 8 pasos, `res_multistep`, scheduler `simple`, nodo `MiniMaxH3SigmaShift` a 10 para video y 3 para audio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Relacion | Bloques / pasos | Tamano de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FastVideo FastH3 Trim Comfy (este) | Reempaquetado para ComfyUI | 42 bloques, 8 pasos | 11,9-37,5 GB segun cuantizacion | minimax-h3-community-license-agreement | HuggingFace, uso via ComfyUI |
| FastVideo/FastVideo-FastH3-Trim-8-Step | Modelo original del que deriva este repo | 42 bloques, 8 pasos | no disponible | no disponible en la informacion | HuggingFace |
| MiniMaxAI/MiniMax-H3 | Modelo base | 50 bloques | 4,2x mayor que la version Trim | minimax-h3-community-license-agreement | HuggingFace |
| FastVideo/FastVideo-FastH3-Comfy | Reempaquetado de otra variante FastH3 | no disponible | no disponible | no disponible en la informacion | HuggingFace |

No se dispone de datos de rendimiento comparado (benchmarks) entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La poda de 50 a 42 bloques y la reduccion del acondicionamiento temporal a rango 16 implican una perdida de capacidad respecto a MiniMax-H3 base; el propio autor la describe como variante experimental.
- Los parametros de muestreo no son libres: usar un numero de pasos o un sigma shift distinto del indicado puede degradar notablemente la calidad de salida.
- Riesgo de alucinacion visual y de artefactos temporales inherente a los modelos de difusion de video; no hay metricas publicadas en la informacion disponible que cuantifiquen este extremo.
- La licencia es `minimax-h3-community-license-agreement`, no una licencia de codigo abierto estandar. Es imprescindible revisar el texto completo antes de cualquier uso comercial.
- No se especifican los idiomas soportados ni el comportamiento del modelo con prompts en castellano.
- El repositorio completo ocupa 190,9 GB, por lo que conviene descargar unicamente los ficheros necesarios.
- El modelo esta creado en fecha 2026-10-06 segun los metadatos de HuggingFace, con solo 33 descargas y 2 likes, lo que indica una adopcion muy temprana y una comunidad de validacion practicamente inexistente.
- No se documentan sesgos conocidos, limites de contexto ni requisitos de VRAM exactos para el conjunto text encoder + VAE + difusion.
- Requiere ComfyUI 0.36.0 o superior; versiones anteriores pueden no reconocer los nodos ni el formato de los ficheros.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/FastVideo/FastVideo-FastH3-Trim-Comfy
- Modelo del que deriva: https://huggingface.co/FastVideo/FastVideo-FastH3-Trim-8-Step
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Texto de la licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Guia de entrenamiento de LoRA FastH3 8-Step V2: https://www.runcomfy.com/trainer/ai-toolkit/fasth3-8-step-v2-lora-training-guide
- Lista awesome-minimax-H3 (incluye referencia a la destilacion DMD2 de FastH3): https://github.com/wildminder/awesome-minimax-H3/blob/main/README.md
- Lista awesome-minimax-h3-integration (integraciones, incluido Comfy-Org): https://github.com/MiniMax-AI/awesome-minimax-h3-integration
- Plantilla ComfyUI FastVideo FastH3: Image to Video: https://comfy.org/workflows/templates_liveportrat.app-b6c2a0bf375b/
- Workflow Product Scene Transformation (usa FastVideo FastH3): https://comfy.org/workflows/templates_product_scene_transformation-d686f64879fb/
