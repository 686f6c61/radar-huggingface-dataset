# juanvezzosi/Cosmos3-Super

## Resumen

Cosmos3-Super es un modelo fundacional omnimodal desarrollado por NVIDIA dentro de la familia Cosmos 3, orientada a lo que la compania denomina Physical AI: robotica, conduccion autonoma y entornos industriales o de fabrica. El modelo es capaz de tomar combinaciones de texto, imagen, video, audio y trayectorias de accion como entrada, y generar texto, imagenes, video, audio y comandos de accion como salida, lo que lo convierte en un bloque de construccion para simulacion de mundo, prediccion de futuros y aprendizaje de politicas encarnadas.

Arquitectura y escala: se trata de un transformer de 64.615.003.632 parametros (unos 64B) construido sobre una arquitectura Mixture-of-Transformers (MoT) con dos torres complementarias: una torre autorregresiva para generacion de tokens discretos (texto) y una torre de difusion para generacion multimodal continua (imagen, video, audio y acciones). Esta separacion permite que cada modalidad use el mecanismo de generacion mas adecuado sin renunciar a un unico marco de modelado.

El modelo se publica bajo licencia OpenMDW 1.1, con pesos en safetensors y un repositorio de 132,7 GB. Su relevancia actual radica en que unifica comprension y generacion multimodal en un solo modelo con soporte explicito de acciones de robot, algo poco comun en modelos abiertos de este tamano, y en que esta pensado para integrarse en stacks de inferencia como vLLM, SGLang y diffusers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture-of-Transformers (MoT): torre autorregresiva + torre de difusion |
| Parametros totales | 64.615.003.632 (aprox. 64B) |
| Parametros activos | no disponible |
| Longitud de contexto | 4096 tokens (texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW 1.1 (openmdw1.1-license) |
| Formato de pesos | safetensors |

Especificaciones adicionales de entrada/salida segun la model card:

| Modalidad | Entrada | Salida |
|---|---|---|
| Texto | string, hasta 4096 tokens | string |
| Imagen | jpg, png, jpeg, webp; 256p, 480p o 720p; ratios 16:9, 4:3, 1:1, 3:4, 9:16 | JPG |
| Video | mp4; 256p, 480p o 720p; maximo 5 frames | MP4 |
| Audio | muxado en MP4, estereo 48 kHz, maximo 0,5 s | AAC estereo 48 kHz muxado en MP4 |
| Accion | JSON (lista 1D), 16–400 frames, dimensionalidad segun embodiment | JSON (lista 1D) |

Embodiments de accion soportados: camara general (9D), vehiculo autonomo (9D), movimiento egocentrico (57D), brazo Franka Panda simple con pinza RobotiQ (10D), doble Franka Panda (20D), Agibot (29D), UR (10D), Google robot (10D), WidowX 250 (10D) y UMI (9D).

## Arquitectura y entrenamiento

Cosmos3-Super se apoya en la arquitectura Mixture-of-Transformers (MoT), que combina dos torres de transformer con roles diferenciados. La torre autorregresiva genera tokens discretos mediante decodificacion next-token estandar, lo que cubre la salida de texto. La torre de difusion sintetiza las modalidades continuas (imagen, video, audio y acciones) mediante denoising iterativo. Esta division preserva los mecanismos de generacion mas adecuados para cada tipo de senal dentro de un unico framework, y es la base sobre la que el modelo modela modalidades heterogeneas de forma conjunta.

El modelo se construye sobre el Cosmos Framework de NVIDIA y forma parte de la coleccion Cosmos 3. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal. La informacion disponible se limita a la descripcion arquitectonica y a las especificaciones de entrada y salida.

## Capacidades

- Generacion de texto autorregresiva con ventana de contexto de 4096 tokens.
- Generacion de imagen a partir de texto, imagen u otras modalidades combinadas, en resoluciones 256p, 480p y 720p.
- Generacion de video de hasta 5 frames en 256p, 480p o 720p, con ratios de aspecto configurables.
- Generacion de audio estereo a 48 kHz, muxado en el MP4 de salida, con una duracion maxima de 0,5 segundos por generacion.
- Generacion y prediccion de trayectorias de accion para multiples embodiments roboticos (brazos Franka, Agibot, UR, Google robot, WidowX 250, UMI, vehiculo autonomo, camara general y movimiento egocentrico).
- Comprension multimodal conjunta: acepta texto, imagen, video con o sin audio y trayectorias de accion como entrada combinada.
- Simulacion de mundo y prediccion de futuros: dado un estado multimodal, generar la evolucion esperada en video, audio y acciones.
- Razonamiento sobre acciones (action reasoning) para aplicaciones de politica encarnada.
- Soporte de despliegue en stacks de inferencia dedicados: vLLM, vLLM-omni, SGLang, SGLang-diffusion y diffusers.

No se documenta en la informacion disponible soporte explicito de tool calling, function calling ni de agentes multi-paso. Tampoco se detallan capacidades multilingues concretas.

## Casos de uso

- Simulacion de mundo para robotica: dado un estado inicial en imagen o video y una trayectoria de accion, el modelo genera el video del resultado esperado, lo que permite validar politicas de control antes de ejecutarlas en hardware real y reducir el desgaste y el riesgo en robots fisicos.
- Prediccion de futuros en conduccion autonoma: con entradas de video y acciones de vehiculo en 9D, el modelo puede generar escenarios futuros de video para entrenamiento y evaluacion de planificadores de movimiento en entornos simulados.
- Generacion de datos sinteticos para entrenamiento de politicas: el modelo produce pares de video, audio y acciones coherentes que pueden aumentar datasets de robotica escasos, especialmente para embodiments como Franka Panda, UR o WidowX 250.
- Aprendizaje de politicas encarnadas (embodied policy learning): las trayectorias de accion generadas en dimensiones especificas por robot sirven como referencia o inicializacion para entrenar controladores en tareas de manipulacion.
- Prototipado de entornos smart space e industriales: generacion de video y audio de escenas de fabrica o espacio inteligente para estudiar interacciones y disenar layouts antes de la implementacion fisica.
- Investigacion en modelos omnimodales: el modelo permite estudiar la generacion conjunta de texto, imagen, video, audio y accion en un unico framework MoT, sirviendo como baseline para experimentos de alineamiento entre modalidades.
- Generacion de video con audio para demostraciones tecnicas: produccion de clips cortos (hasta 5 frames de video y 0,5 s de audio) con audio estereo muxado, utiles para material divulgativo o validacion de pipelines multimedia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Con 64,6B parametros, una estimacion orientativa en precision completa (FP16/BF16) requeriria del orden de 129 GB solo para pesos, mas overhead de activaciones y del proceso de difusion; en cuantizaciones de 8 bits rondaria los 65 GB y en 4 bits unos 33 GB, aunque estos valores son calculos teoricos y no datos confirmados por el autor.
- GPU recomendadas: no disponible. Por tamano, el modelo excede la memoria de cualquier GPU consumer individual en precision completa; serian necesarios aceleradores de datacenter tipo A100 (80 GB) o H100 (80 GB), potencialmente en configuracion multi-GPU.
- Compatibilidad con GPU consumer: no confirmada. En cuantizacion agresiva a 4 bits podria aproximarse a los 33 GB, lo que quedaria fuera de una RTX 4090 (24 GB) en una sola tarjeta; no hay datos del autor que confirmen despliegue en consumer.
- Opciones de despliegue: vLLM, vLLM-omni, SGLang, SGLang-diffusion y diffusers, segun los tags del repositorio y la model card.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones comparables en la informacion proporcionada para establecer una comparativa rigurosa con alternativas de la misma categoria. La model card no menciona modelos competidores ni resultados frente a ellos.

| Modelo | Parametros | Contexto | Modalidades | Licencia |
|---|---|---|---|---|
| Cosmos3-Super | 64,6B | 4096 tokens (texto) | texto, imagen, video, audio, accion | OpenMDW 1.1 |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al ser un modelo entrenado por NVIDIA para Physical AI, es previsible que herede sesgos de los datasets de robotica y conduccion empleados, pero no se detallan.
- Riesgo de alucinacion: no cuantificado. En generacion de video y acciones, el riesgo se traduce en predicciones fisicamente inconsistentes o trayectorias no ejecutables en el robot real.
- Limitaciones de contexto: la ventana de texto es de solo 4096 tokens, lo que restringe conversaciones largas o documentos extensos. El video de entrada admite un maximo de 5 frames y el audio de entrada un maximo de 0,5 segundos, lo que limita tareas que requieran secuencias largas.
- Limitaciones de idioma: no se especifican idiomas soportados; la model card no incluye lista de lenguas, por lo que el rendimiento multilingue es desconocido.
- Restricciones de licencia: OpenMDW 1.1. La model card indica que el modelo esta listo para uso comercial y no comercial, pero conviene revisar los terminos completos de la licencia antes de un despliegue en produccion.
- Entradas restringidas: solo se aceptan imagenes y video en RGB de 8 bits por canal en sRGB; no se soporta escala de grises. El audio de entrada debe ser estereo a 48 kHz.
- Acciones limitadas a embodiments concretos: fuera de la lista documentada (camara general, vehiculo autonomo, egocentrico, Franka Panda, Agibot, UR, Google robot, WidowX 250, UMI), no hay garantia de funcionamiento.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: se trata de una publicacion reciente (creada el 2026-11-16) y sin validacion de la comunidad, lo que anade riesgo si se adopta en produccion sin pruebas propias.
- Ausencia de benchmarks publicos en la informacion disponible: no es posible verificar el rendimiento real frente a alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/juanvezzosi/Cosmos3-Super
- Coleccion Cosmos3 en Hugging Face: https://huggingface.co/collections/nvidia/cosmos3
- Ejemplos Cosmos3: https://huggingface.co/collections/nvidia/cosmos3-examples
- Codigo en GitHub: https://github.com/nvidia/cosmos
- White Paper (technical report): https://research.nvidia.com/labs/cosmos-lab/cosmos3/technical-report.pdf
- Web oficial: https://research.nvidia.com/labs/cosmos-lab/cosmos3/
- Cosmos Framework: https://github.com/nvidia/cosmos-framework
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
