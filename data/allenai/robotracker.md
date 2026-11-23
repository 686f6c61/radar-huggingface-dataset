# allenai/RoboTracker

## Resumen

RoboTracker es un modelo de seguimiento de puntos (point tracking) especializado en vídeo de manipulación robótica, desarrollado por el Allen Institute for AI (Ai2). Se trata de un fine-tuning de AllTracker sobre RoboTrack-15M, un conjunto de datos simulados de robots construido con MolmoSpaces y combinado al 50 % con Kubric. Dado un vídeo y un conjunto de píxeles de consulta, el modelo devuelve para cada fotograma la posición estimada de cada píxel y una probabilidad de visibilidad.

La relevancia del modelo radica en su aplicación directa a pipelines de robótica: sirve como modelo de correspondencia para tareas como servoing visual, evaluación de políticas de manipulación o seguimiento de objetos agarrados por pinzas. Mantiene la arquitectura y el formato de fichero de AllTracker (`Net(seqlen=16)`), por lo que es un reemplazo directo de `alltracker.pth` sin cambios en el código de inferencia.

El modelo se publica bajo licencia Apache 2.0 y está pensado para investigación y educación conforme a las guías de uso responsable de Ai2. Existe una variante adicional, RoboTracker-Warp, con mejores resultados pero licencia no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | AllTracker (red de seguimiento de puntos; `Net(seqlen=16)`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana temporal de 16 fotogramas por secuencia de inferencia) |
| Tipos de cuantizacion | no disponible (pesos en `robotracker.pth`, formato nativo PyTorch) |
| Idiomas soportados | no aplica (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pth` (state_dict de PyTorch con clave `"model"`) |

## Arquitectura y entrenamiento

RoboTracker hereda la arquitectura de AllTracker, una red neuronal para seguimiento denso de puntos en vídeo que opera sobre secuencias de 16 fotogramas y produce, para cada punto de consulta, una trayectoria a lo largo del tiempo junto con una probabilidad de visibilidad. El modelo no procesa texto: su entrada son fotogramas RGB (`[T, H, W, 3]` en uint8) y coordenadas de píxeles de consulta con sus índices de fotograma.

El entrenamiento parte de los pesos liberados de `alltracker.pth` y aplica un fine-tuning de 10.000 pasos con tasa de aprendizaje 1e-5, esquema one-cycle con 5 % de warm-up, sobre 8 GPUs. La mezcla de datos es 50 % Kubric (con la configuración de clips de AllTracker) y 50 % RoboTrack-15M, datos simulados de robots generados con MolmoSpaces que muestran un brazo Franka manipulando objetos en escenas domésticas. El checkpoint publicado corresponde al último paso; no se seleccionó ningún checkpoint por puntuación de benchmark.

## Capacidades

- Seguimiento de puntos arbitrarios ("track any point") a lo largo de secuencias de vídeo.
- Estimación de trayectorias por fotograma para cada píxel de consulta.
- Predicción de visibilidad por punto y fotograma (probabilidad de oclusión).
- Funcionamiento con cámaras en tercera persona fijas y con cámaras de muñeca.
- Seguimiento de brazos robóticos, pinzas y objetos manipulados.
- Evaluación estandarizada sobre RoboTrack-Bench mediante el script `robotrack.eval_alltracker`.
- Compatibilidad directa con el código de AllTracker (mismo formato de pesos y misma firma de inferencia).
- No soporta tool calling, agentes, ni capacidades de lenguaje, audio o razonamiento textual.

## Casos de uso

- Servoing visual en robótica: el modelo proporciona correspondencias punto a punto entre fotogramas que pueden alimentar un lazo de control para corregir la posición del efector final respecto a un objeto objetivo.
- Evaluación de políticas de manipulación: usar RoboTracker como modelo de correspondencia para medir si una política mueve los objetos según lo esperado, comparando trayectorias predichas con las reales.
- Seguimiento de objetos agarrados: al trackear puntos sobre el objeto y sobre la pinza, se puede verificar la sujeción y detectar deslizamientos durante el transporte.
- Benchmarking de modelos de tracking: RoboTrack-Bench incluye 307 clips de DROID Franka, MolmoAct2 YAM, MolmoAct2 SO-100, EgoVerse EVA, EgoVerse human y Ego-Exo4D human, lo que permite comparar variantes de forma reproducible.
- Punto de partida para fine-tuning: al conservar el formato de AllTracker, se puede reentrenar sobre datos propios de un robot concreto sin reescribir la infraestructura de inferencia.
- Análisis offline de grabaciones de manipulación: procesar vídeos de cámaras de muñeca para extraer trayectorias de píxeles y analizar la dinámica de la interacción objeto-pinza.
- Datos de entrenamiento sintéticos: combinado con RoboTrack-15M, sirve para generar pseudo-etiquetas de correspondencia en nuevos vídeos de robot.

## Benchmarks y rendimiento

Resultados publicados en la model card. Todas las columnas usan el protocolo TAP-Vid en modo "first" a 384×512 con la evaluación corregida del repositorio. AJ = average Jaccard; OA = occlusion accuracy. Mayor es mejor en todas las columnas.

| Modelo | RoboTrack-Bench AJ | RoboTrack-Bench OA | TAP-Vid DAVIS | RGB-Stacking | RoboTAP | Kinetics |
|---|---|---|---|---|---|---|
| AllTracker (`alltracker.pth`) | 62.56 | **86.87** | 64.26 | 81.44 | **68.48** | 56.27 |
| **RoboTracker** | **63.40** | 86.22 | **64.63** | **83.20** | 68.41 | **56.64** |

Desglose de AJ por fuente de vídeo en RoboTrack-Bench:

| Modelo | DROID Franka (167 clips) | MolmoAct2 YAM (24) | MolmoAct2 SO-100 (24) | EgoVerse EVA (25) | EgoVerse human (25) | Ego-Exo4D human (42) | Todos (307) |
|---|---|---|---|---|---|---|---|
| RoboTracker | 63.16 | 69.75 | 61.20 | 67.39 | 62.37 | 60.26 | 63.40 |
| RoboTracker-Warp | 66.82 | 71.25 | 64.20 | 69.37 | 62.41 | 60.75 | 65.98 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repositorio ocupa 0.1 GB, lo que sugiere un modelo de tamaño moderado, pero no se especifica el número de parámetros.
- GPU recomendadas: no disponible. El entrenamiento se realizó sobre 8 GPUs, sin especificar modelo.
- Compatibilidad con GPU de consumo: no confirmada explícitamente; el tamaño reducido del checkpoint (0.1 GB) es compatible con GPUs de consumo, pero no hay datos oficiales.
- Opciones de despliegue: inferencia nativa en PyTorch mediante el paquete `robotrack` (`pip install -e .`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplica a un modelo de visión).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | AJ RoboTrack-Bench | OA RoboTrack-Bench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RoboTracker | Fine-tune de AllTracker sobre RoboTrack-15M | 63.40 | 86.22 | Apache 2.0 | Hugging Face (allenai/RoboTracker) |
| AllTracker | Modelo base de tracking de puntos | 62.56 | 86.87 | no disponible en la información | Hugging Face / GitHub (aharley/alltracker) |
| RoboTracker-Warp | Variante de RoboTracker | 65.98 | no disponible | No comercial | Hugging Face (allenai/RoboTracker-Warp) |

No se dispone de datos de otros trackers de puntos comparables (por ejemplo, TAPIR o CoTracker) en la información proporcionada.

## Limitaciones y advertencias

- Errores de visibilidad: RoboTracker mejora la precisión de posición y el AJ respecto a AllTracker, pero su precisión de oclusión en RoboTrack-Bench es 0.65 puntos inferior; tiende a marcar como ocluidos puntos que son visibles, sobre todo en clips con poca oclusión.
- Sesgo de escena de entrenamiento: los datos simulados muestran un único robot (brazo Franka) recogiendo objetos en escenas domésticas. Las mejoras son mayores en vídeo de robot visto desde una cámara fija en tercera persona.
- Tracks incorrectos en oclusiones largas y superficies sin textura.
- Riesgo en control de robots: si los tracks se usan para accionar un robot, deben validarse antes de actuar, acotar el movimiento comandado y operar con supervisión y parada de emergencia.
- Licencia Apache 2.0, pero el uso previsto es investigación y educación conforme a las guías de uso responsable de Ai2; revisar condiciones para uso comercial.
- No procesa lenguaje ni texto: no es adecuado para tareas de NLP, tool calling o agentes conversacionales.
- No se han publicado datos de sesgos demográficos ni de robustez fuera de los dominios evaluados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/allenai/RoboTracker
- Variante RoboTracker-Warp: https://huggingface.co/allenai/RoboTracker-Warp
- Código: https://github.com/allenai/robotrack
- Dataset de evaluación RoboTrack-Bench: https://huggingface.co/datasets/allenai/RoboTrack-Bench
- Dataset de entrenamiento RoboTrack-15M: https://huggingface.co/datasets/allenai/RoboTrack-15M
- Página del proyecto: https://robotrack.allen.ai
- Paper: https://allenai.org/papers/robotrack
- Blog: https://allenai.org/blog/robotrack
- Modelo base AllTracker (código): https://github.com/aharley/alltracker
- Guías de uso responsable de Ai2: https://allenai.org/responsible-use
