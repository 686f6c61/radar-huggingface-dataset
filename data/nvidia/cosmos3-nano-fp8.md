# nvidia/Cosmos3-Nano-FP8

## Resumen

Cosmos3-Nano-FP8 es la variante cuantizada en FP8 del modelo base Cosmos3-Nano de NVIDIA, un modelo fundacional omnimodal orientado a Physical AI. Forma parte de la familia Cosmos 3, una plataforma de world models disenada para que sistemas roboticos, vehiculos autonomos y entornos industriales puedan comprender, simular e interactuar con el mundo fisico. El checkpoint conserva la arquitectura y las aplicaciones del modelo original, aplicando cuantizacion FP8 a componentes seleccionados para reducir el coste de inferencia.

El modelo emplea una arquitectura Mixture-of-Transformers (MoT) con dos torres complementarias: una transformer autorregresiva para generacion de tokens discretos y una transformer de difusion para generacion multimodal continua. Esto le permite aceptar combinaciones de texto, imagen, video, audio y trayectorias de accion, y producir texto, imagenes, video, audio y comandos de accion. Cuenta con aproximadamente 15.750 millones de parametros totales (16B segun la model card) y una ventana de contexto de 4096 tokens para entrada de texto.

Su relevancia actual radica en que unifica generacion y comprension multimodal en un unico marco para robótica y simulacion, con soporte explicito para mas de diez encarnaciones roboticas (Franka Panda, Agibot, UR, WidowX 250, UMI, entre otras). La licencia OpenMDW1.1 permite uso comercial y no comercial, lo que facilita su adopcion en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture-of-Transformers (MoT): torre autorregresiva + torre de difusion |
| Parametros totales | 15.750.057.456 (~16B) |
| Parametros activos | no disponible |
| Longitud de contexto | 4096 tokens (texto); video maximo 5 frames; audio maximo 0,5 s; accion 16-400 frames |
| Tipos de cuantizacion | FP8 (checkpoint cuantizado); no se detallan otros formatos |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW1.1 (openmdw1.1-license) |
| Formato de pesos | safetensors |
| Libreria | cosmos |
| Tamano del repositorio | 21,1 GB |
| Modalidades de entrada | texto, imagen, video (con o sin audio), trayectoria de accion |
| Modalidades de salida | texto, imagen (JPG), video (MP4), audio (AAC en MP4), accion (JSON) |
| Resoluciones de imagen/video | 256p, 480p, 720p; aspect ratios 16:9, 4:3, 1:1, 3:4, 9:16 |
| Formatos de entrada | texto (string), imagen (jpg, png, jpeg, webp), video (mp4), accion (json, lista 1D) |

## Arquitectura y entrenamiento

Cosmos3 se construye sobre una arquitectura Mixture-of-Transformers (MoT) que combina dos torres: una transformer autorregresiva que genera tokens discretos mediante decodificacion next-token estandar, y una transformer de difusion que sintetiza modalidades continuas (imagen, video, audio y acciones) mediante denoising iterativo. Esta separacion permite aplicar a cada modalidad el mecanismo de generacion mas adecuado sin renunciar a un marco unificado. El modelo deriva del Cosmos Framework de NVIDIA y el checkpoint FP8 mantiene la arquitectura del modelo base, cuantizando componentes seleccionados.

La model card no especifica el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se detallan innovaciones adicionales como decodificacion especulativa o atencion lineal. La informacion disponible se limita a la arquitectura, las especificaciones de entrada/salida y el soporte de encarnaciones roboticas, que incluye camara general (9D), vehiculo autonomo (9D), movimiento egocentrico (57D), brazo Franka Panda simple (10D), doble Franka Panda (20D), Agibot (29D), UR (10D), Google robot (10D), WidowX 250 (10D) y UMI (9D).

## Capacidades

- Generacion de texto mediante decodificacion autorregresiva estandar.
- Generacion de imagenes en JPG a resoluciones de 256p, 480p y 720p con cinco aspect ratios.
- Generacion de video en MP4 (maximo 5 frames) con audio opcional muxado.
- Generacion de audio en stream AAC dentro del contenedor MP4 (hasta 0,5 s de entrada).
- Generacion de comandos de accion en JSON (lista 1D) para encarnaciones roboticas compatibles.
- Comprension multimodal conjunta de texto, imagen, video, audio y trayectorias de accion.
- Simulacion de mundo y prediccion de futuros fisicos para Physical AI.
- Razonamiento sobre acciones y planificacion motora en entornos embodied.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes multi-step: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Thinking mode explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Simulacion de entornos roboticos: el modelo genera video y acciones coherentes a partir de una trayectoria de entrada, lo que permite previsualizar el resultado de una politica antes de desplegarla en hardware real, reduciendo costes de prueba fisica.
- Entrenamiento de politicas embodied: al producir pares video-accion para encarnaciones como Franka Panda o Agibot, se puede aumentar el dataset de demostraciones para aprendizaje por imitacion.
- Prediccion de futuros en conduccion autonoma: con entradas de video a 720p y trayectorias de 9D para vehiculo autonomo, el modelo simula escenarios de trafico y valida decisiones de planificacion.
- Generacion de datos sinteticos multimodales: creacion de clips de video con audio sincronizado para aumentar datasets de percepcion en entornos industriales o de smart space.
- Prototipado de interfaces robotico-humano: generacion de video y audio condicionados por texto para disenar respuestas de un agente fisico antes de implementar el sistema completo.
- Investigacion en world models: el modelo sirve como banco de pruebas para estudiar la coherencia entre modalidades y la fidelidad de la simulacion fisica en un unico framework.
- Aumento de datos para vision por computador: imagenes y videos sinteticos a distintas resoluciones y aspect ratios para entrenar detectores y segmentadores en dominios con escasez de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~15,75B parametros en FP8, los pesos ocupan aproximadamente 15,75 GB; sumando activaciones, KV cache y buffers de difusion, se estima un minimo practico de 20-24 GB de VRAM, aunque no se dispone de cifras oficiales.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, GPUs de centro de datos como A100 40GB/80GB o H100 son las candidatas naturales, pero NVIDIA no lo especifica.
- Compatibilidad con GPU de consumo: no confirmada; una RTX 4090 (24 GB) podria ser justa para los pesos FP8, pero la generacion de video y difusion incrementa el uso de memoria y no hay datos oficiales.
- Opciones de despliegue: los tags del repositorio mencionan vLLM (vllm-omni), SGLang (sglang-diffusion) y diffusers; la libreria declarada es cosmos.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cosmos3-Nano-FP8 | ~15,75B | 4096 tokens (texto) | texto, imagen, video, audio, accion | OpenMDW1.1 | Hugging Face |
| Cosmos3-Nano (base) | ~16B | no disponible | texto, imagen, video, audio, accion | OpenMDW1.1 | Hugging Face (coleccion Cosmos3) |
| Alternativas de world models para Physical AI | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones de modelos competidores en la informacion proporcionada para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al ser un modelo entrenado para dominios fisicos, puede heredar sesgos de los datasets de robotica y conduccion empleados.
- Riesgo de alucinacion en la generacion de video y acciones: las trayectorias sinteticas pueden ser fisicamente invalidas y no deben ejecutarse en hardware real sin validacion previa.
- Ventana de contexto de texto limitada a 4096 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Restricciones de entrada severas: video de maximo 5 frames, audio de maximo 0,5 s y acciones entre 16 y 400 frames; esto limita la generacion de secuencias largas.
- Solo se admiten entradas RGB de 8 bits en sRGB; no se soportan imagenes en escala de grises.
- Las acciones solo son compatibles con las encarnaciones listadas; cualquier robot fuera de esa lista requiere adaptacion.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingue.
- Licencia OpenMDW1.1: aunque permite uso comercial segun la model card, conviene revisar los terminos completos antes de desplegar en produccion.
- El checkpoint FP8 puede presentar degradacion de calidad frente al modelo base en algunas modalidades; no se han publicado metricas comparativas.

## Enlaces

- Hugging Face: https://huggingface.co/nvidia/Cosmos3-Nano-FP8
- Coleccion Cosmos3: https://huggingface.co/collections/nvidia/cosmos3
- Ejemplos Cosmos3: https://huggingface.co/collections/nvidia/cosmos3-examples
- Codigo: https://github.com/nvidia/cosmos
- White Paper: https://research.nvidia.com/labs/cosmos-lab/cosmos3/technical-report.pdf
- Web oficial: https://research.nvidia.com/labs/cosmos-lab/cosmos3/
- Licencia OpenMDW1.1: https://openmdw.ai/license/1-1/
- Cosmos Framework: https://github.com/nvidia/cosmos-framework
