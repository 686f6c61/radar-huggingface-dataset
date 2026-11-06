# RoboColosseum/droid-open-drawer-lingbot-vla-v2

## Resumen

LingBot-VLA v2 6B (variante DROID Open Drawer) es un modelo de vision-lenguaje-accion (VLA) para control robótico de manipuladores Franka, publicado por RoboColosseum como parte de su suite de referencia para el benchmark RoboColosseum. Se trata de un fine-tuning del checkpoint base `robbyant/lingbot-vla-v2-6b` sobre dos tareas del dataset DROID (MugOnCoaster y CloseLaptop), entrenado durante 10 epocas totales (5 iniciales mas 5 adicionales), con 6.375.907.511 parametros almacenados en safetensors y un tamano de repositorio de 25,5 GB.

El modelo resuelve el problema de mapear observaciones visuales multimodales (camaras exterior izquierda, exterior derecha y de muneca) e instrucciones en lenguaje natural a acciones de control de 8 dimensiones (7 articulaciones del brazo Franka mas pinza) en espacio de posiciones articulares absolutas. Su relevancia actual radica en que forma parte de una comparativa sistematica y reproducible de cinco familias de VLA (GR00T N1.7, pi0.5, G0.5, MolmoAct2 y LingBot-VLA v2) bajo recetas de entrenamiento identicas, lo que permite aislar el efecto de la arquitectura y del backbone preentrenado en el rendimiento de manipulacion.

La ficha se centra en la variante LingBot-VLA v2 del repositorio, que emplea el optimizador Muon, un learning rate constante de 1.25e-5, batch global de 32 (16x2 con acumulacion) y entrenamiento completo de todos los modulos. El modelo esta etiquetado como `robotics`, `vla`, `franka`, `droid` y `lerobot`, y se distribuye en formato safetensors compatible con la libreria LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA); backbone VLM + cabeza de accion (detalles internos no disponibles) |
| Parametros totales | 6.375.907.511 (~6,4 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en fp32 master con computo bf16 durante entrenamiento) |
| Idiomas soportados | no disponible (instrucciones de tarea en ingles: "mug on coaster", "close laptop") |
| Licencia | other (ver limitaciones) |
| Formato de pesos | safetensors (mas archivos de configuracion de LeRobot) |
| Libreria de carga | lerobot |
| Checkpoint base | robbyant/lingbot-vla-v2-6b |
| Tamano del repositorio | 25,5 GB |
| Tamano por carpeta de tarea | 12,8 GB |
| Tareas entrenadas | MugOnCoaster, CloseLaptop |
| Camaras de entrada | exterior izquierda, exterior derecha, muneca (360x640) |
| Dimension de estado/accion | 8-D posiciones articulares absolutas [brazo Franka 7, pinza 1] |

## Arquitectura y entrenamiento

LingBot-VLA v2 es un modelo de vision-lenguaje-accion que combina un backbone vision-lenguaje con una cabeza de accion que produce trayectorias de control continuas. La model card no detalla la arquitectura interna (tipo de transformer, atencion, mecanismo de difusion o flow matching de la cabeza de accion), por lo que estos aspectos quedan como no disponibles. El entrenamiento se realiza sobre el checkpoint base `robbyant/lingbot-vla-v2-6b` con ajuste completo de todos los parametros, usando el optimizador Muon, learning rate constante de 1.25e-5, batch global de 32 (micro-batch 16 con acumulacion x2 en una sola GPU) y precision fp32 para los pesos maestros con computo en bf16.

El fine-tuning se ejecuta en dos fases: 5 epocas iniciales (documentadas en el repositorio DROID-models) y 5 epocas adicionales en este repositorio, reiniciando el estado del optimizador y el scheduler desde cero. Las tareas son MugOnCoaster (100 episodios, 41.227 frames, instruccion "mug on coaster") y CloseLaptop (100 episodios, 27.649 frames, instruccion "close laptop"), ambas en formato LeRobot v3.0 a 30 fps. Los tiempos de entrenamiento reportados para las 5 epocas adicionales son de 5h22m (MugOnCoaster, 6.442 pasos) y 3h40m (CloseLaptop, 4.321 pasos) en una H200. Las perdidas finales (`VLA_Loss`) tras 10 epocas son 0,0262 (loss total 0,0298) en MugOnCoaster y 0,0265 (loss total 0,0303) en CloseLaptop.

## Capacidades

- Control roboticode manipulacion: genera acciones de 8 dimensiones (7 articulaciones Franka + pinza) a partir de observaciones visuales e instrucciones en lenguaje natural.
- Percepcion multimodal: procesa tres camaras simultaneamente (exterior izquierda, exterior derecha y muneca) a resolucion 360x640.
- Seguimiento de instrucciones: ejecuta comandos cortos en ingles ("mug on coaster", "close laptop") mapeados a politicas de manipulacion.
- Politica de imitacion end-to-end: aprende directamente de demostraciones teleoperadas del dataset DROID.
- Integracion con LeRobot: carga y despliegue mediante la libreria LeRobot, compatible con el ecosistema Hugging Face.
- Soporte de tool calling / function calling: no disponible (modelo de robotica, no de texto).
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad generica; la ejecucion es de politica reactiva por paso.
- Capacidades multilingues: no disponible; las instrucciones de entrenamiento estan en ingles.
- Modo thinking, vision general, audio: no disponible (la vision se limita a las camaras de robot).

## Casos de uso

- Benchmarking de VLA en manipulacion Franka: usar el modelo como una de las cinco lineas base de RoboColosseum para comparar recetas de entrenamiento identicas entre arquitecturas (GR00T, pi0.5, G0.5, MolmoAct2, LingBot) sobre las mismas tareas DROID.
- Investigacion en imitacion end-to-end: reproducir el fine-tuning de 10 epocas sobre `robbyant/lingbot-vla-v2-6b` para estudiar el efecto del optimizador Muon y del LR constante frente a schedules cosine en tareas de manipulacion.
- Automatizacion de tareas de pick-and-place en laboratorio: desplegar la politica MugOnCoaster para colocar un objeto sobre un posavasos en un Franka real, usando las tres camaras como unica entrada sensorial.
- Manipulacion de objetos articulados: emplear la politica CloseLaptop para cerrar la tapa de un portatil, caso representativo de tareas con objetos rigidos articulados en entornos de escritorio.
- Generacion de datos sinteticos y evaluacion de robustez: ejecutar la politica en simulacion para medir sensibilidad a cambios de iluminacion, posicion de camara o posicion inicial del objeto antes de un despliegue real.
- Baseline para ablaciones de backbone: comparar el rendimiento de LingBot-VLA v2 con el de otros VLA del mismo repositorio para aislar la contribucion del backbone preentrenado en tareas de baja diversidad (100 episodios por tarea).
- Docencia y prototipado en robotica: punto de partida para cursos o proyectos que necesiten un VLA de ~6 B ya ajustado a tareas concretas, con recetas y curvas de perdida publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de exito de tarea en la informacion disponible. La model card solo reporta perdidas de entrenamiento, que no miden exito de tarea. Los valores disponibles son:

| Tarea | Metrica | Inicio +5 epocas | Fin 10 epocas |
|---|---|---|---|
| MugOnCoaster | VLA_Loss | 0,0394 | 0,0262 |
| MugOnCoaster | Loss total | 0,0435 | 0,0298 |
| CloseLaptop | VLA_Loss | 0,0409 | 0,0265 |
| CloseLaptop | Loss total | 0,0454 | 0,0303 |

No hay datos comparativos de exito con GR00T N1.7, pi0.5, G0.5 o MolmoAct2 en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con ~6,4 B parametros, en bf16 se requieren aproximadamente 12,8 GB solo para pesos; en fp32, unos 25,5 GB. La model card indica que los pesos se almacenan como fp32 master con computo bf16 durante el entrenamiento, lo que sugiere que la inferencia puede ejecutarse en bf16.
- GPU recomendadas: el entrenamiento se realizo en 1x H200 (y las 5 epocas previas en 2x H200 NVL). Para inferencia, una GPU con al menos 16-24 GB de VRAM es un punto de partida razonable, aunque no se especifica en la model card.
- Cabe en GPU consumer: no confirmado. Una RTX 4090 (24 GB) podria alojar los pesos en bf16, pero no se documenta soporte ni latencia.
- Opciones de despliegue: libreria LeRobot (formato nativo del repositorio). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un VLA de robotica.
- Latencia y throughput: no disponibles. El control se ejecuta a 30 fps en el dataset, pero no se reporta latencia de inferencia por paso.

## Comparativa con modelos similares

Comparativa dentro del mismo repositorio RoboColosseum (mismas tareas, misma receta, mismo hardware de referencia):

| Modelo | Parametros | Checkpoint base | Tamano por carpeta | Optimizador / LR | Licencia |
|---|---|---|---|---|---|
| LingBot-VLA v2 6B (este) | ~6,4 B | robbyant/lingbot-vla-v2-6b | 12,8 GB | Muon, 1.25e-5 constante | other |
| GR00T N1.7 | no disponible (3 B en el nombre del checkpoint) | nvidia/GR00T-N1.7-3B | 12,6 GB | no disponible, 1e-4 cosine | other |
| pi0.5 | no disponible | gs://openpi-assets/checkpoints/pi05_base | 12,4 GB | no disponible, 2.5e-5 cosine | other |
| G0.5 | no disponible | OpenGalaxea/G05 | 11,9 GB | no disponible, 4e-5 cosine | other |
| MolmoAct2 | no disponible | allenai/MolmoAct2 | 21,8 GB | no disponible, LR diferenciados | other |

No se dispone de tasas de exito comparativas entre estos modelos en la informacion proporcionada, por lo que la comparativa se limita a configuracion y recursos.

## Limitaciones y advertencias

- Especializacion extrema: solo se ha ajustado para dos tareas concretas (MugOnCoaster y CloseLaptop); no es un modelo generalista y no se espera que generalice a otras instrucciones sin reentrenamiento.
- Idiomas: las instrucciones de entrenamiento estan en ingles; no hay evidencia de soporte multilingue.
- Datos limitados: 100 episodios por tarea, lo que puede provocar sobreajuste al entorno, iluminacion y posiciones de camara del dataset DROID.
- Riesgo de alucinacion de acciones: como politica de imitacion, puede generar trayectorias plausibles pero incorrectas ante configuraciones fuera de distribucion; no hay metricas de exito publicadas que cuantifiquen este riesgo.
- Licencia "other": no se especifican terminos de uso comercial; es necesario revisar la licencia del checkpoint base `robbyant/lingbot-vla-v2-6b` y del dataset DROID antes de cualquier despliegue productivo.
- Perdidas de entrenamiento no equivalen a exito de tarea: la model card lo advierte explicitamente; no deben usarse como proxy de rendimiento.
- Requisitos de robot especificos: asume un Franka de 7 articulaciones con pinza y tres camaras en posiciones concretas; el cambio de hardware invalida la politica.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validacion externa.
- Sin informacion sobre cuantizacion ni despliegue en GPU consumer: la viabilidad en hardware de gama media no esta documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RoboColosseum/droid-open-drawer-lingbot-vla-v2
- Repositorio de modelos DROID (5 epocas): https://huggingface.co/RoboColosseum/DROID-models
- Repositorio BimanualYAM-models: https://huggingface.co/RoboColosseum/BimanualYAM-models
- Checkpoint base LingBot-VLA v2 6B: https://huggingface.co/robbyant/lingbot-vla-v2-6b
- Dataset MugOnCoaster: https://huggingface.co/datasets/aarontung/droid-mug-on-coaster
- Dataset CloseLaptop: https://huggingface.co/datasets/aarontung/droid-close-laptop
- Checkpoint GR00T N1.7: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Checkpoint MolmoAct2: https://huggingface.co/allenai/MolmoAct2
- Checkpoint G0.5: https://huggingface.co/OpenGalaxea/G05
- Proyecto W&B de entrenamiento: https://wandb.ai/shaileshxml-nus/RoboColosseum
