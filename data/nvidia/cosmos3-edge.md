# nvidia/Cosmos3-Edge

## Resumen

Cosmos3-Edge es un modelo fundacional "world model" omnimodal desarrollado por NVIDIA dentro de la familia Cosmos 3, orientada a aplicaciones de Physical AI (robotica, conduccion autonoma y entornos industriales). A diferencia de un LLM convencional, el modelo recibe combinaciones de texto, imagen y trayectorias de accion, y genera como salida texto, imagenes, video y comandos de accion, lo que lo convierte en una pieza de infraestructura para simulacion, prediccion de futuros y aprendizaje de politicas encarnadas.

La variante Edge es la mas pequena de la familia, con aproximadamente 3.860 millones de parametros (3,86 B) almacenados en safetensors y un repositorio de 36,3 GB. Su arquitectura es un Mixture-of-Transformers (MoT) que combina una torre autoregresiva para generacion de tokens discretos (texto) con una torre de difusion para generacion continua de imagen, video, audio y acciones. La longitud de contexto de texto esta limitada a 4096 tokens, y la generacion de video se restringe a resoluciones de 256p y 480p con 12-30 fps y 50-150 fotogramas.

Su relevancia actual radica en que es uno de los pocos modelos abiertos que unifica comprension y generacion multimodal con salidas de accion para una docena de "embodiments" roboticos (brazos Franka Panda, Agibot, UR, WidowX 250, UMI, vehiculos autonomos, movimiento egocentrico), lo que permite prototipar pipelines completos de robotica y simulacion sin depender de varios modelos especializados. Se distribuye bajo licencia OpenMDW 1.1 y NVIDIA lo declara apto para uso comercial y no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture-of-Transformers (MoT): torre autoregresiva + torre de difusion |
| Parametros totales | 3.858.999.728 (~3,86 B) |
| Parametros activos | no disponible (no es un MoE clasico; el MoT separa torres por modalidad) |
| Longitud de contexto | 4096 tokens (texto); accion con longitud de secuencia 16-400 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW 1.1 (openmdw1.1-license) |
| Formato de pesos | safetensors (libreria `cosmos`, integracion con `diffusers`) |
| Modalidades de entrada | texto, imagen (jpg, png, jpeg, webp; RGB 8 bits sRGB), trayectoria de accion (JSON, matriz T x D) |
| Modalidades de salida | texto (string), imagen (JPG), video (MP4), accion (JSON) |
| Resolucion de imagen/video | 256p y 480p; aspect ratios 16:9, 4:3, 1:1, 3:4, 9:16 |
| Video | 12-30 fps, 50-150 fotogramas |
| Embodiments de accion soportados | camara general (9D), vehiculo autonomo (9D), movimiento egocentrico (57D), Franka Panda simple (10D), Franka Panda dual (20D), Agibot (29D), UR (10D), Google robot (10D), WidowX 250 (10D), UMI (10D) |
| Tamano del repositorio | 36,3 GB |
| Fecha de publicacion | 20/07/2026 (actualizacion del checkpoint el 25/08/2026) |

## Arquitectura y entrenamiento

Cosmos3-Edge se construye sobre el framework Cosmos de NVIDIA y emplea una arquitectura Mixture-of-Transformers con dos torres complementarias: una torre transformer autoregresiva que genera tokens discretos mediante decodificacion next-token estandar (empleada para texto) y una torre de difusion que sintetiza modalidades continuas (imagen, video, audio y acciones) mediante denoising iterativo. Esta separacion permite modelar modalidades heterogeneas en un unico marco sin forzar un mismo mecanismo generativo para todas ellas: el texto se produce de forma secuencial y el resto de modalidades se genera por difusion, lo que es coherente con las caracteristicas de cada dominio.

El modelo se presenta como "omnimodal world model" y se entrena para comprender, simular e interactuar con el mundo fisico. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO; esa informacion no esta disponible en el material consultado. La entrada de acciones se define como una matriz (T, D) por fotograma con la dimensionalidad propia de cada embodiment, y la salida de video se parametriza por peticion mediante los campos `size`, `fps` y `num_frames`, lo que sugiere un pipeline de inferencia configurable por solicitud mas que un unico modo fijo.

## Capacidades

- Generacion de video a partir de texto, imagen o trayectorias de accion, con control de resolucion (256p/480p), fps (12-30) y numero de fotogramas (50-150).
- Generacion de imagen en formato JPG a partir de entradas multimodales.
- Generacion de texto autoregresiva (comprension y descripcion de escenas, razonamiento sobre entradas multimodales).
- Prediccion y generacion de trayectorias de accion para robots y agentes en multiples embodiments (brazos, vehiculos, movimiento egocentrico).
- Simulacion de futuros fisicos ("world simulation") y prediccion de evolucion de escenas.
- Razonamiento sobre acciones ("action reasoning") para planificacion encarnada.
- Soporte de entrada de imagen RGB de 8 bits por canal en espacio sRGB; no admite escala de grises.
- Capacidades multimodales de audio mencionadas a nivel de familia (generacion de audio), aunque la model card de esta variante solo detalla E/S de texto, imagen, video y accion.
- No se documenta soporte explicito de tool calling, function calling ni modo "thinking"; no disponible.

## Casos de uso

- Simulacion de entornos roboticos: dado un estado inicial en imagen y una trayectoria de accion (por ejemplo, 10D de un Franka Panda con pinza RobotiQ), el modelo genera video del resultado esperado, lo que permite validar politicas antes de ejecutarlas en hardware real.
- Generacion de datos sinteticos para entrenamiento de politicas: producir pares video-accion sinteticos para aumentar datasets de robotica y reducir el coste de teleoperacion, aprovechando los 10 embodiments soportados.
- Conduccion autonoma: usar la modalidad de accion de vehiculo autonomo (9D) para predecir escenarios de trafico y generar video contrafactual de maniobras, util para validacion de planificadores.
- Prototipado de interfaces de mundo para robótica de almacen: simular escenas industriales a 480p y 12-30 fps para evaluar percepcion y planificacion en entornos de fabrica.
- Investigacion en world models: banco de pruebas para estudiar la coherencia fisica de videos generados y la consistencia entre accion y resultado visual, con un modelo de ~3,86 B parametros manejable en laboratorio.
- Previsualizacion de escenas para diseno de producto o cinematografia tecnica: generar clips cortos (50-150 fotogramas) a partir de una imagen de referencia y una camara parametrizada (9D de movimiento de camara).
- Aumento de datasets de vision por computador: sintetizar imagenes y videos con condiciones controladas para tareas de deteccion o segmentacion en dominios con pocos datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que los resultados de benchmark se actualizaron el 25 de agosto de 2026, pero no incluye cifras concretas en el material consultado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de ~3,86 B parametros en precision de 16 bits requiere del orden de 8 GB solo para pesos, a lo que hay que sumar el coste del decodificador de difusion y de la generacion de video, que es sensiblemente mayor.
- GPU recomendadas: no especificadas en la model card. Por el perfil del modelo y su orientacion a video, se espera que NVIDIA recomiende GPUs de datacenter (A100, H100) o RTX de gama alta para generacion de video; no disponible de forma oficial.
- Encaje en GPU de consumo: probable en cuantizaciones agresivas para tareas de texto o imagen a baja resolucion; para video a 480p y 150 fotogramas se recomienda VRAM holgada. Sin datos oficiales.
- Opciones de despliegue: la libreria declarada es `cosmos` con integracion en `diffusers`; los tags incluyen `deploy:azure` y `deploy:sagemaker`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (orientados a LLM puros y no a un MoT con difusion).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Notas |
|---|---|---|---|---|---|
| Cosmos3-Edge (NVIDIA) | ~3,86 B | 4096 tokens (texto) | Texto, imagen, video, audio, accion | OpenMDW 1.1 | Variante Edge de Cosmos 3; salidas de accion para 10 embodiments |
| Cosmos 3 (familia, NVIDIA) | no disponible (variantes mayores) | no disponible | Texto, imagen, video, audio, accion | OpenMDW 1.1 | Misma arquitectura MoT; mayor capacidad a costa de mas computo |
| Generadores video texto-a-video abiertos (p. ej. familia open-source de difusion) | variable | no aplica | Texto, imagen, video | variable | No generan acciones ni soportan embodiments roboticos |
| LLM multimodales abiertos de ~3-8 B | 3-8 B | 32k-128k tokens | Texto, imagen | variable | Mucho mayor contexto de texto, pero sin generacion de video ni acciones |

La comparativa con alternativas directas es limitada: no se dispone de datos de rendimiento de Cosmos 3 ni de terceros en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas declaradas.

## Limitaciones y advertencias

- Contexto de texto limitado a 4096 tokens, muy inferior al de LLM multimodales contemporaneos, lo que restringe conversaciones largas o documentos extensos.
- Generacion de video acotada a 256p/480p, 12-30 fps y 50-150 fotogramas; no apta para produccion de video de alta resolucion o larga duracion.
- Entrada de imagen solo en RGB de 8 bits sRGB; no admite escala de grises.
- La salida de accion solo es valida para la lista cerrada de embodiments documentada; cualquier robot fuera de esa lista no esta soportado.
- Idiomas soportados no documentados; el comportamiento multilingue no esta garantizado.
- Riesgo de alucinacion y de incoherencia fisica inherente a los modelos generativos de video: las simulaciones no deben tratarse como ground truth sin validacion.
- Sesgos desconocidos: la model card no documenta evaluaciones de sesgo ni de seguridad.
- Licencia OpenMDW 1.1: aunque NVIDIA declara uso comercial permitido, es una licencia propia ("other") y debe revisarse el texto completo en openmdw.ai antes de desplegar en produccion.
- El checkpoint se actualizo el 25/08/2026; quienes usen `main` deben refrescar la copia local para garantizar reproducibilidad.
- No se documentan mecanismos de tool calling ni de agentes multi-paso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/Cosmos3-Edge
- Coleccion Cosmos3: https://huggingface.co/collections/nvidia/cosmos3
- Ejemplos Cosmos3: https://huggingface.co/collections/nvidia/cosmos3-examples
- Codigo: https://github.com/nvidia/cosmos
- Framework Cosmos: https://github.com/nvidia/cosmos-framework
- White paper / informe tecnico: https://research.nvidia.com/labs/cosmos-lab/cosmos3/technical-report.pdf
- Web oficial: https://research.nvidia.com/labs/cosmos-lab/cosmos3/
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Anuncio de actualizacion del checkpoint: https://huggingface.co/nvidia/Cosmos3-Edge/discussions/62
