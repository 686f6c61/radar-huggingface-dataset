# nvidia/Cosmos3-Nano

## Resumen

Cosmos3-Nano es el modelo de menor tamano de la familia Cosmos 3, un conjunto de modelos del mundo (world models) omnimodales desarrollados por NVIDIA para acelerar el desarrollo de Physical AI: robotica, conduccion autonoma y entornos industriales. A diferencia de un LLM convencional, Cosmos3-Nano acepta combinaciones de texto, imagen, video, audio y trayectorias de accion, y genera texto, imagen, video, audio y comandos de accion coherentes. Segun la model card, esta pensado tanto para comprension multimodal como para simulacion del mundo, prediccion de futuros y razonamiento sobre acciones.

El modelo se construye sobre una arquitectura Mixture-of-Transformers (MoT) con dos torres complementarias: una torre transformer autoregresiva para generar tokens discretos (texto, decodificacion next-token) y una torre transformer de difusion para generar modalidades continuas (imagen, video, audio y acciones) mediante denoising iterativo. Esta separacion permite modelar modalidades heterogeneas en un unico framework preservando el mecanismo de generacion mas adecuado para cada una. Cuenta con aproximadamente 16B parametros entrenables (15.750.057.456 segun los pesos safetensors) y una ventana de texto de 4096 tokens.

Es relevante ahora porque NVIDIA lo publica bajo la licencia OpenMDW 1.1, que permite uso comercial y no comercial, e integra soporte para stacks de despliegue como vLLM (vllm-omni), SGLang (sglang-diffusion) y diffusers. El repositorio ocupa 177,8 GB y acumula mas de 2,3 millones de descargas en Hugging Face, lo que lo situa como una referencia practica para investigacion en robotica y simulacion con hardware NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer; Mixture-of-Transformers (MoT) con torre autoregresiva (tokens discretos) y torre de difusion (modalidades continuas) |
| Parametros totales | 15.750.057.456 (aprox. 16B) |
| Parametros activos | no disponible (no es MoE; MoT se refiere a mezcla de torres, no a expertos) |
| Longitud de contexto | 4096 tokens (texto); video: maximo 5 frames; audio: maximo 0,5 s; accion: 16-400 frames |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW 1.1 (openmdw1.1-license); uso comercial y no comercial permitido |
| Formato de pesos | safetensors (libreria `cosmos`; tambien compatible con diffusers) |

## Arquitectura y entrenamiento

Cosmos3-Nano emplea una arquitectura Mixture-of-Transformers (MoT) formada por dos torres: una transformer autoregresiva que genera texto mediante decodificacion next-token convencional y una transformer de difusion que sintetiza imagen, video, audio y acciones mediante denoising iterativo. La inferencia combina ambos mecanismos en un mismo framework, de modo que cada modalidad se genera con el paradigma mas apropiado (autoregresivo para discreto, difusion para continuo). El modelo se construye sobre Cosmos Framework y esta disenado como bloque fundamental para comprension del mundo, generacion, simulacion y aprendizaje de politicas embodied.

Los detalles de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO) no estan disponibles en la informacion proporcionada. La model card indica unicamente el numero de parametros entrenables (16B) y la arquitectura, sin desglosar corpus ni fases de alineacion. Las innovaciones tecnicas documentadas se limitan a la propia arquitectura MoT y al soporte nativo de multiples modalidades de entrada y salida (texto, imagen, video con o sin audio, y trayectorias de accion para embodiments concretos).

## Capacidades

- Generacion de texto autoregresiva (decodificacion next-token) con ventana de 4096 tokens.
- Generacion de imagen en resoluciones 256p, 480p y 720p con relaciones de aspecto 16:9, 4:3, 1:1, 3:4 y 9:16; salida en JPG.
- Generacion de video en 256p, 480p y 720p con las mismas relaciones de aspecto; maximo de 5 frames por inferencia; salida MP4.
- Generacion de audio (stream AAC multiplexado en el MP4 de salida, estereo, 48 kHz); entrada de audio maximo 0,5 s.
- Generacion de comandos de accion (listas 1D en JSON) para embodiments compatibles: camara general (9D), vehiculo autonomo (9D), movimiento egocentrico (57D), Franka Panda con gripper RobotiQ simple (10D) y dual (20D), Agibot (29D), UR (10D), Google robot (10D), WidowX 250 (10D) y UMI (9D).
- Comprension multimodal: acepta texto (string), imagen (jpg/png/jpeg/webp), video (mp4, con o sin audio) y trayectorias de accion (json).
- Simulacion del mundo y prediccion de futuros: genera video/accion condicionado por estado previo y trayectoria.
- Razonamiento sobre acciones y aprendizaje de politicas embodied.
- Soporte de despliegue en vLLM (vllm-omni), SGLang (sglang-diffusion) y diffusers.
- Tool calling, function calling, modo thinking explicito y capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Simulacion de entornos robotizados: dado un frame inicial y una trayectoria de accion, el modelo genera video del resultado esperado, permitiendo validar politicas de control antes de desplegarlas en hardware real. Adecuado por su salida de video a 720p y su soporte de embodiments como Franka Panda o UR.
- Prediccion de futuros para conduccion autonoma: con entradas 9D de vehiculo autonomo y video de camara, genera la evolucion probable de la escena para entrenar o evaluar planificadores de movimiento.
- Aumento de datos para aprendizaje embodied: sintetizar pares video-accion a partir de trayectorias existentes para ampliar datasets de entrenamiento de politicas, aprovechando la generacion de video y acciones en un mismo framework.
- Prototipado de escenas industriales: generar imagenes y videos de smart spaces o lineas de fabrica a partir de descripciones textuales y referencias visuales, con resoluciones 256p-720p y relaciones de aspecto configurables.
- Generacion de clips con audio para revision de diseño: producir video MP4 con pista AAC estereo a 48 kHz a partir de texto o imagen, util para comunicar conceptos de producto o simulaciones antes de produccion.
- Investigacion en modelos del mundo: evaluar la coherencia entre modalidades (texto, imagen, video, audio, accion) en un unico modelo MoT, comparando torres autoregresiva y de difusion en tareas de comprension y generacion.
- Desarrollo de agentes embodied con bucle cerrado: usar la salida de accion JSON como comandos para un robot simulado, combinando comprension del estado (video) y planificacion de trayectoria (accion) dentro de un mismo pipeline con vLLM o SGLang.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Con 15,75B parametros, una estimacion orientativa en BF16 seria de aproximadamente 31,5 GB solo para pesos, mas memoria para activaciones y KV cache; en FP8/INT8 rondaria 16 GB y en INT4 unos 8 GB, pero estas cifras son calculadas, no publicadas por NVIDIA.
- GPU recomendadas: no disponibles de forma explicita. Dado el tamano y el origen NVIDIA, se espera despliegue en GPUs de datacenter (A100, H100, H200) y, potencialmente, en RTX 4090/RTX 6000 Ada con cuantizacion.
- Compatibilidad con GPU de consumo: no confirmada. Previsiblemente viable en RTX 4090 (24 GB) solo con cuantizacion agresiva, sujeto a validacion.
- Opciones de despliegue: vLLM con extension vllm-omni, SGLang con sglang-diffusion, diffusers (libreria `cosmos`), y despliegue gestionado en Azure y SageMaker segun los tags del repositorio. llama.cpp, Ollama y TGI: no disponibles.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|
| Cosmos3-Nano | 15,75B | Texto 4096 tokens; imagen, video (5 frames), audio (0,5 s), accion (16-400 frames) | OpenMDW 1.1 (comercial permitido) | Hugging Face, GitHub, vLLM, SGLang, diffusers |
| Cosmos3 (familia completa) | no disponible | Omnimodal, mismas modalidades | OpenMDW 1.1 | Coleccion Cosmos3 en Hugging Face |
| Alternativas de la misma categoria (world models omnimodales) | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado con modelos alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- Riesgo de alucinacion en texto y en simulacion: la generacion de video y acciones es probabilistica; las predicciones no garantizan fisica correcta y deben validarse en entornos reales antes de uso en robotica o conduccion.
- Sesgos conocidos: no documentados en la informacion proporcionada; al entrenarse presumiblemente con datos de robotica y conduccion, puede heredar sesgos de esos dominios.
- Limitaciones de contexto e idioma: ventana de texto de 4096 tokens; maximo 5 frames de video por inferencia; audio de entrada limitado a 0,5 s; idiomas soportados no especificados.
- Restricciones de entrada: imagenes y video deben ser RGB sRGB de 8 bits; no se admite escala de grises. El audio muxed debe ser estereo a 48 kHz. Las acciones solo se aceptan para embodiments compatibles (lista cerrada de 10 configuraciones).
- Restricciones de licencia: OpenMDW 1.1 permite uso comercial segun la model card, pero conviene revisar los terminos completos en openmdw.ai/license/1-1/ antes de produccion.
- Caveats de produccion: repositorio de 177,8 GB; no hay datos publicados de latencia, throughput ni cuantizacion oficial; el soporte de despliegue depende de extensiones especificas (vllm-omni, sglang-diffusion) que pueden tener madurez limitada.

## Enlaces

- Hugging Face: https://huggingface.co/nvidia/Cosmos3-Nano
- Coleccion Cosmos3: https://huggingface.co/collections/nvidia/cosmos3
- Ejemplos Cosmos3: https://huggingface.co/collections/nvidia/cosmos3-examples
- Codigo: https://github.com/nvidia/cosmos
- Cosmos Framework: https://github.com/nvidia/cosmos-framework
- White paper / technical report: https://research.nvidia.com/labs/cosmos-lab/cosmos3/technical-report.pdf
- Web oficial Cosmos3: https://research.nvidia.com/labs/cosmos-lab/cosmos3/
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- NVIDIA (sitio corporativo): https://www.nvidia.com/
