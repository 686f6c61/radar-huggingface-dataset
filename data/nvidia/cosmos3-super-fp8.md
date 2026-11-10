# nvidia/Cosmos3-Super-FP8

## Resumen

Cosmos3-Super-FP8 es la variante cuantizada en FP8 del modelo base Cosmos3-Super, desarrollado por NVIDIA dentro de su plataforma Cosmos de world foundation models. Se trata de un modelo omni-modal de 64.615.003.632 parametros (64B) disenado para generar y comprender texto, imagenes, video, audio y comandos de accion a partir de combinaciones de entradas multimodales, con aplicaciones centradas en Physical AI: robotica, conduccion autonoma y entornos industriales.

La arquitectura es un Mixture-of-Transformers (MoT) con dos torres complementarias: una transformer autorregresiva para generacion de tokens discretos (texto) y una transformer de difusion para generacion continua multimodal (imagen, video, audio y acciones). Esta separacion permite aplicar el mecanismo de generacion mas adecuado a cada modalidad dentro de un unico marco.

Su relevancia actual radica en que unifica en un solo checkpoint tareas que tradicionalmente requerian modelos separados (world simulation, future prediction, action reasoning y generacion multimodal), y lo hace con una licencia OpenMDW 1.1 que permite uso comercial. La variante FP8 reduce el peso del repositorio a 70,3 GB, lo que facilita el despliegue en infraestructura con memoria limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture-of-Transformers (MoT): torre autorregresiva + torre de difusion |
| Parametros totales | 64.615.003.632 (64B) |
| Parametros activos | no disponible |
| Longitud de contexto | 4096 tokens (texto) |
| Tipos de cuantizacion | FP8 (cuantizacion aplicada a componentes seleccionados del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW 1.1 (openmdw1.1-license) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Cosmos3 se construye sobre una arquitectura Mixture-of-Transformers (MoT) con dos torres: una transformer autorregresiva que genera tokens discretos mediante decodificacion next-token estandar, y una transformer de difusion que sintetiza modalidades continuas (imagen, video, audio y acciones) mediante denoising iterativo. Esta combinacion permite modelar modalidades heterogeneas en un unico framework preservando el mecanismo de generacion optimo para cada una.

El modelo se desarrollo sobre el Cosmos Framework de NVIDIA. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La variante FP8 mantiene la arquitectura y las aplicaciones previstas del modelo base, con cuantizacion aplicada a componentes seleccionados. No se especifican innovaciones adicionales como decodificacion especulativa o attention linear en la informacion disponible.

## Capacidades

- Generacion de texto mediante decodificacion autorregresiva next-token.
- Generacion de imagenes en formato JPG a resoluciones de 256p, 480p y 720p.
- Generacion de video en formato MP4 a 256p, 480p y 720p, con un maximo de 5 frames por salida.
- Generacion de audio muxado como stream AAC dentro del MP4, con un maximo de 0,5 segundos.
- Generacion de comandos de accion como listas 1D en JSON, para trayectorias de 16 a 400 frames.
- Comprension y generacion multimodal a partir de entradas combinadas de texto, imagen, video (con o sin audio) y trayectorias de accion.
- Soporte de multiples embodiments roboticos: camara general (9D), vehiculo autonomo (9D), movimiento egocentrico (57D), brazo Franka Panda unico con gripper RobotiQ (10D), doble Franka Panda con RobotiQ (20D), Agibot (29D), UR (10D), Google robot (10D), WidowX 250 (10D) y UMI (9D).
- Razonamiento de acciones y prediccion de futuros para aplicaciones de Physical AI.
- World simulation y world understanding.
- Soporte de despliegue mediante vLLM (vllm-omni), SGLang (sglang-diffusion) y diffusers.

## Casos de uso

- Simulacion de entornos roboticos: el modelo puede generar video de futuros plausibles a partir de una trayectoria de accion y una imagen inicial, lo que permite validar politicas de control antes de desplegarlas en hardware real, gracias a su capacidad de prediccion de futuros con entradas de hasta 400 frames.
- Entrenamiento de politicas encarnadas (embodied policy learning): con soporte para 10 embodiments distintos (Franka Panda, Agibot, UR, WidowX 250, UMI, entre otros), se puede usar como generador de datos sinteticos o como modelo de mundo para aprendizaje por refuerzo en robotica.
- Conduccion autonoma: dado un clip de video de 720p y una trayectoria de vehiculo autonomo (9D), el modelo puede generar video predictivo y comandos de accion coherentes, util para escenarios de simulacion de trafico y validacion de planificadores.
- Generacion de video con audio para prototipado: a partir de texto e imagen, produce clips MP4 de hasta 5 frames con audio AAC muxado, adecuado para previsualizacion rapida de escenas en estudios de animacion o diseno de producto.
- Investigacion en world models: el checkpoint FP8 permite ejecutar experimentos de comprension y generacion del mundo fisico en infraestructura con menos memoria que la version completa, facilitando la reproducibilidad en laboratorios academicos.
- Automatizacion en entornos industriales y smart spaces: el modelo puede razonar sobre secuencias de video de camaras fijas y generar acciones o predicciones para sistemas de manipulacion en fabrica, aprovechando la entrada de video a 256p y 480p para procesamiento en tiempo casi real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 70,3 GB en FP8, por lo que se requiere al menos ~70 GB de VRAM para cargar los pesos completos sin overhead adicional. Con overhead de activaciones y KV cache, se recomienda un minimo de 80 GB.
- GPU recomendadas: NVIDIA H100 (80 GB) o A100 (80 GB) para carga completa en una sola GPU; configuraciones multi-GPU para mayor throughput.
- Cabe en consumer GPU: no en GPUs de consumo individuales (RTX 4090 con 24 GB no es suficiente para los 70,3 GB de pesos FP8). Requiere configuraciones multi-GPU o GPUs de datacenter.
- Opciones de despliegue: vLLM (vllm-omni), SGLang (sglang-diffusion), diffusers y la libreria cosmos.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cosmos3-Super-FP8 | 64B | 4096 tokens (texto) | Texto, imagen, video, audio, accion | OpenMDW 1.1 | Hugging Face |
| Cosmos3-Super (base) | 64B | 4096 tokens (texto) | Texto, imagen, video, audio, accion | OpenMDW 1.1 | Hugging Face |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos omni-modales de world simulation comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- La longitud de contexto de texto esta limitada a 4096 tokens.
- El video de salida esta limitado a un maximo de 5 frames, lo que restringe la generacion de secuencias largas.
- El audio de entrada esta limitado a 0,5 segundos como maximo.
- Solo se admiten entradas de imagen y video en color RGB de 8 bits (sRGB); no se soportan entradas en escala de grises.
- Las entradas de accion solo funcionan con los embodiments listados explicitamente; no hay soporte generico para configuraciones arbitrarias.
- No se especifican los idiomas soportados, por lo que no se puede garantizar cobertura multilingue.
- No se documentan sesgos conocidos ni tasas de alucinacion en la informacion disponible.
- La licencia OpenMDW 1.1 permite uso comercial segun la model card, pero se recomienda revisar los terminos completos en el enlace oficial antes de un despliegue en produccion.
- Al ser una variante cuantizada en FP8, puede existir una degradacion de calidad respecto al modelo base Cosmos3-Super, aunque la model card no cuantifica esta perdida.

## Enlaces

- Hugging Face: https://huggingface.co/nvidia/Cosmos3-Super-FP8
- Coleccion Cosmos3: https://huggingface.co/collections/nvidia/cosmos3
- Ejemplos Cosmos3: https://huggingface.co/collections/nvidia/cosmos3-examples
- Codigo: https://github.com/nvidia/cosmos
- White paper: https://research.nvidia.com/labs/cosmos-lab/cosmos3/technical-report.pdf
- Web oficial: https://research.nvidia.com/labs/cosmos-lab/cosmos3/
- Framework Cosmos: https://github.com/nvidia/cosmos-framework
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
