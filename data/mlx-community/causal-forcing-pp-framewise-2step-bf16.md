# mlx-community/Causal-Forcing-PP-framewise-2step-bf16

## Resumen

Causal-Forcing-PP-framewise-2step-bf16 es la conversion a MLX y bf16 del generador de video texto-a-video Causal Forcing++ (variante frame-wise de dos pasos) desarrollado por investigadores de la Universidad de Tsinghua, Shengshu y UT Austin, a partir del modelo base zhuhz22/Causal-Forcing. Se trata de un Diffusion Transformer (DiT) de Wan2.1-T2V-1.3B con causalidad temporal por fotograma: desruidifica un unico frame latente en cada paso atendiendo a una cache KV de los fotogramas anteriores, lo que permite generacion autoregresiva de video con solo dos pasos de muestreo por frame.

La relevancia de esta conversion es doble. Por un lado, es el DiT que Apple integra en su pipeline FastFrames-S (arXiv 2611.23226), por lo que funciona como pieza central de una cadena de generacion de video de alta velocidad. Por otro, el trabajo de conversion a safetensors bf16 lo hace directamente consumible desde Swift/MLX en Apple Silicon, con paridad numerica verificada frente al codigo original en PyTorch (componentes a 1-3e-6 en fp32; primeros tres frames con coseno >= 0.997 y PSNR >= 31.7 dB).

El repositorio contiene unicamente los pesos del DiT (1.418.996.800 parametros en bf16, 2.8 GB); no incluye el codificador de texto umT5-XXL, la red de refinamiento KV ni el decodificador de pixeles de Apple, que deben obtenerse por separado y estan sujetos a la licencia de investigacion no comercial de Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) con atencion causal por frame, derivado de Wan2.1-T2V-1.3B |
| Parametros totales | 1.418.996.800 (825 tensores) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (unica incluida en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (base Wan2.1-T2V-1.3B tambien Apache-2.0; los componentes de Apple son de uso exclusivamente de investigacion) |
| Formato de pesos | safetensors (`dit.safetensors`, estado `generator_ema`) + `config.json` |
| Dimension de patch embedding | Conv3d `[1536, 16, 1, 2, 2]` |
| Pasos de desruido por frame | 2 (framewise-2step) |
| Repositorio | 2.8 GB |

## Arquitectura y entrenamiento

El modelo es un DiT con atención causal sobre el eje temporal: cada fotograma latente se desruidifica de forma independiente en dos pasos de muestreo, condicionado por una cache KV de todos los fotogramas precedentes. Esta formulacion autoregresiva permite generar video de forma streaming, frame a frame, manteniendo coherencia temporal sin recalcular el pasado. El checkpoint liberado por los autores de Causal Forcing es `causal-forcing++/framewise-2step.pt` (fp32, revision `2f8eb8bb6eeb1238da9d13e5420d342a74d634a6`); la conversion a MLX solo aplica redondeo a bf16 (round to nearest even), elimina los prefijos FSDP y `model.`, y conserva los nombres originales de Wan2.1/FastFrames (`blocks.N.self_attn.q.weight`, `patch_embedding.weight`, etc.).

No se detallan en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. El titulo del paper asociado, "Causal Forcing: Autoregressive Diffusion Distillation Done Right for High-Quality Real-Time Interactive Video Generation", indica que la destilacion autoregresiva es la innovacion central: convertir un modelo de difusion bidireccional en uno causal con muy pocos pasos por frame, habilitando generacion interactiva en tiempo real. La codificacion de prompts usa el encoder umT5-XXL de Wan2.1 (no incluido en el repo).

## Capacidades

- Generacion de video texto-a-video de forma autoregresiva, un fotograma latente por paso con dos pasos de desruido.
- Generacion streaming / frame-wise: la cache KV preserva el contexto de los fotogramas previos, permitiendo emitir video de forma incremental.
- Integracion en el pipeline FastFrames-S de Apple (con la red de refinamiento KV y el decodificador de pixeles de Apple, obtenidos aparte).
- Alta velocidad de inferencia en Apple Silicon: 81 frames a 832x480 en aproximadamente 11 s en un M5 Max con el pipeline completo.
- Condicionamiento por texto mediante el encoder umT5-XXL de Wan2.1.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no aplica (no es un modelo de lenguaje).
- Capacidades multilingues: no disponible (el condicionamiento depende del encoder umT5-XXL, que soporta multiples idiomas, pero el modelo card no lo especifica para este checkpoint).
- Capacidades especiales: no dispone de thinking mode, vision ni audio; es exclusivamente un generador de video.

## Casos de uso

- Generacion de video interactiva en tiempo real: gracias al esquema autoregresivo con dos pasos por frame y a los ~11 s para 81 frames en M5 Max, es adecuado para prototipos de experiencias interactivas donde el usuario modifica el prompt o el contexto entre frames.
- Previsualizacion rapida en macOS/Apple Silicon: al distribuirse como safetensors bf16 consumible por MLX, permite montar demos locales de texto-a-video sin GPU NVIDIA ni librerias CUDA.
- Investigacion en destilacion autoregresiva de difusion: sirve como referencia reproducible para estudiar la conversion de un DiT bidireccional en un generador causal con pocos pasos, con paridad numerica verificada frente al codigo PyTorch.
- Integracion en el pipeline FastFrames-S: combinado con los pesos de Apple (red de refinamiento KV y decodificador de pixeles), forma parte de una cadena completa de generacion de video de alta calidad y baja latencia.
- Generacion de clips cortos para videojuegos o prototipado de storyboards: el esquema frame-wise permite emitir contenido incremental mientras se mantiene el contexto temporal via cache KV.
- Benchmarking de portabilidad Swift/MLX: util para validar la fidelidad de una conversion de pesos PyTorch a MLX en un modelo de vision generativa, comparando cosenos y PSNR por frame.
- Educacion y analisis de arquitecturas DiT: repositorio pequeno (2.8 GB) y de estructura simple que facilita inspeccionar el estado `generator_ema` de un DiT de 1.3B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (FVD, CLIP score, etc.) en la informacion disponible. Los unicos datos numericos son de paridad de conversion y de velocidad:

| Metrica | Valor |
|---|---|
| Paridad de componentes (fp32, atencion en fp32) | 1-3e-6 |
| Coseno de los 3 primeros frames latentes (rollout bf16) | >= 0.997 |
| PSNR en pixeles de los 3 primeros frames | >= 31.7 dB |
| Velocidad pipeline completo FastFrames-S en M5 Max | 81 frames a 832x480 en ~11 s |

## Requisitos de hardware

- VRAM/unified memory estimada: el DiT pesa 2.8 GB en bf16; el pipeline completo requiere adicionalmente el encoder de texto umT5-XXL y los modulos de Apple (red de refinamiento KV y decodificador de pixeles), cuyo tamano no se detalla en la informacion disponible.
- GPU recomendadas: Apple Silicon (el repo es MLX, orientado a chips Apple). Se ha verificado funcionamiento en M5 Max; no se han publicado requisitos minimos en otros chips M.
- Compatibilidad con GPU consumer NVIDIA: no disponible; el formato es MLX/bf16 y la libreria declarada es `mlx`, por lo que no es directamente cargable con CUDA.
- Opciones de despliegue: MLXEngine, paquete `MLXFastFrames` del repositorio `xocialize/mlx-fastframes-swift`, y la herramienta `Tools/convert_dit.py` para conversiones.
- Latencia y throughput: ~11 s para 81 frames a 832x480 en M5 Max (pipeline completo).

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Formato | Licencia |
|---|---|---|---|---|
| Causal-Forcing-PP-framewise-2step-bf16 (este) | 1.418.996.800 | DiT causal autoregresivo, 2 pasos/frame, MLX bf16 | safetensors + MLX | Apache-2.0 (DiT); complementos de Apple solo investigacion |
| Causal-Forcing (zhuhz22) original | no disponible (checkpoint fp32) | DiT causal, pesos PyTorch | pickle `.pt` | Apache-2.0 |
| Wan2.1-T2V-1.3B | 1.3B (DiT base) | Difusion bidireccional estandar | safetensors / diffsynth | Apache-2.0 |
| FastFrames-S (apple) | DiT 1.3B + red KV + decodificador de pixeles | Pipeline completo con este DiT como componente | safetensors | MLR Model License (solo investigacion) para los modulos de Apple |

Las cifras de rendimiento de los modelos comparables no se detallan en la informacion disponible.

## Limitaciones y advertencias

- El repositorio contiene solo el DiT; sin la red de refinamiento KV ni el decodificador de pixeles de Apple no se puede completar la generacion de video. Esos pesos no se redistribuyen y estan bajo la Apple Machine Learning Research Model License (uso exclusivamente de investigacion y no comercial).
- La licencia Apache-2.0 solo cubre los pesos del DiT y su base Wan2.1; el uso comercial del pipeline completo queda limitado por los terminos de Apple.
- El modelo esta pensado para MLX/Apple Silicon; no hay garantia ni herramientas de despliegue para CUDA, ROCm ni CPU generica.
- El checkpoint original es fp32 y esta conversion usa bf16; aunque la paridad es alta (coseno >= 0.997 en los primeros frames), puede haber divergencias acumuladas en rollouts largos.
- No se especifican idiomas soportados, sesgos del dataset de entrenamiento, ni tasas de alucinacion visual o degradacion temporal; el autor no publica esas metricas.
- Es un modelo de generacion de video: no soporta texto, razonamiento, codigo ni tool calling, por lo que no debe emplearse como LLM.
- La resolucion y duracion practicas estan acotadas por los recursos de memoria unificada y por el pipeline FastFrames-S; no se documentan configuraciones fuera de 832x480 y 81 frames.
- El modelo no esta afiliado ni respaldado por Apple.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/mlx-community/Causal-Forcing-PP-framewise-2step-bf16
- Modelo base: https://huggingface.co/zhuhz22/Causal-Forcing
- Repositorio GitHub de los autores: https://github.com/thu-ml/Causal-Forcing
- Paper arXiv 2602.02214: https://arxiv.org/abs/2602.02214
- Pipeline FastFrames-S de Apple: https://huggingface.co/apple/FastFrames-S
- Port Swift/MLX: https://github.com/xocialize/mlx-fastframes-swift
- Script de conversion: https://github.com/xocialize/mlx-fastframes-swift/blob/v0.1.0/Tools/convert_dit.py
- Motor MLXEngine: https://github.com/xocialize/mlx-engine-swift
- arXiv 2611.23226 (FastFrames): https://arxiv.org/abs/2611.23226
