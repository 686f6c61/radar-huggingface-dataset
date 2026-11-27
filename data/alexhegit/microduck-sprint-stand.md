# alexhegit/microduck-sprint-stand

## Resumen

microduck-sprint-stand es un controlador de locomocion para un robot caminante de tipo Microduck, publicado por el usuario alexhegit en Hugging Face. No es un modelo de lenguaje: es una politica de control entrenada con PPO (Proximal Policy Optimization) en el simulador MuJoCo, exportada en formato ONNX y destinada a ejecutarse como controlador de bajo nivel a 50 Hz. El modelo recibe 61 observaciones del estado del robot y emite 14 objetivos de posicion articular.

La politica implementa una habilidad concreta: mantenerse de pie, caminar a velocidades entre 0 y 1 m/s y girar, siguiendo comandos de locomocion. Forma parte de la categoria de modelos etiquetada como `microduck-policy` y se presento al evento `sprint-2m` de la Microduck Arena, un espacio de evaluacion de politicas de robots caminantes organizado por Pollen Robotics.

Su relevancia es acotada pero practica: sirve como ejemplo reproducible de entrenamiento de politicas de refuerzo para robotica de bajo coste, con la particularidad de haberse entrenado en una GPU AMD con ROCm, lo que lo convierte en una referencia util para flujos de trabajo de RL que no dependen de CUDA. El repositorio tiene un tamano de 0,0 GB, sin descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica de control entrenada con PPO (arquitectura de red no especificada en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (politica de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (controlador de robot, sin capacidades linguisticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Entradas | 61 observaciones |
| Salidas | 14 objetivos de posicion articular |
| Frecuencia de control | 50 Hz |
| Entorno de entrenamiento | MuJoCo (microduck_rl_unilab) |
| Hardware de entrenamiento | GPU AMD con ROCm |
| Checkpoint | sprint_stand/model_59000 |
| Pipeline declarado | robotics |

## Arquitectura y entrenamiento

La model card no detalla la topologia de la red neuronal de la politica; solo indica que se entrena con PPO sobre MuJoCo mediante el repositorio `microduck_rl_unilab`. El bucle de control mapea 61 observaciones a 14 objetivos de posicion articular a 50 Hz, lo que corresponde a un controlador de articulaciones de baja dimension para un robot cuadrupedo de tipo Microduck.

El entrenamiento se realizo en una GPU AMD con ROCm, un dato destacable porque la mayoria de flujos de RL para robotica asumen CUDA. No se especifican el numero de pasos de entrenamiento, la composicion de las recompensas, el curriculum de velocidades ni los detalles del dominio de aleatorizacion. El checkpoint publicado corresponde al paso 59000 (`model_59000`).

## Capacidades

- Locomocion cuadrupeda: mantenerse de pie y caminar a velocidades de 0 a 1 m/s.
- Giro y direccion: responde a comandos de steering ademas de la velocidad lineal.
- Seguimiento de comandos de locomocion de alto nivel (velocidad y direccion).
- Control a 50 Hz con 61 observaciones de entrada y 14 salidas de posicion articular.
- Exportacion a ONNX para inferencia fuera del simulador.
- No dispone de generacion de texto, razonamiento, codigo, vision, audio, tool calling ni capacidades multilingues.

## Casos de uso

- Control de locomocion en simulacion: ejecutar la politica en MuJoCo para reproducir el comportamiento de marcha y giro del checkpoint publicado, util como linea base en experimentos de RL.
- Despliegue en el robot fisico Microduck: cargar el modelo ONNX en el stack de control del robot para obtener marcha basica a velocidades de hasta 1 m/s, siempre que la interfaz de observaciones y acciones coincida con la del entrenamiento.
- Evaluacion comparativa en la Microduck Arena: participar en el evento `sprint-2m` y comparar la politica con otras del mismo benchmark.
- Referencia para entrenamiento con ROCm: reutilizar el flujo `microduck_rl_unilab` como plantilla para entrenar politicas PPO en GPUs AMD sin CUDA.
- Base para fine-tuning o destilacion: partir de este checkpoint para entrenar habilidades adicionales (subida de escaleras, terreno irregular) mediante curriculum o recompensas adicionales.
- Docencia e investigacion en robotica de bajo coste: usar un caso completo y reproducible de simulacion a despliegue con licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona la participacion en el evento `sprint-2m` de la Microduck Arena y el rango de velocidad de 0 a 1 m/s, sin metricas cuantitativas de recompensa, tasa de exito ni comparacion con otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamano del repositorio (0,0 GB) y el caracter de politica de control, se espera un modelo de muy pocos parametros que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no especificadas. Cualquier GPU con soporte ONNX Runtime o ROCm deberia ser suficiente para inferencia a 50 Hz.
- GPU consumer: previsiblemente si, dado el reducido tamano del modelo, aunque no se confirma en la model card.
- Opciones de despliegue: ONNX Runtime, ejecucion directa en el stack del robot Microduck; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; el unico dato es la frecuencia de control de 50 Hz (periodo de 20 ms).

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros modelos de la categoria `microduck-policy` con los que comparar parametros, contexto o rendimiento. La referencia mas cercana es el resto de participantes en la Microduck Arena, pero no se aportan sus especificaciones.

## Limitaciones y advertencias

- Habilidad limitada: solo cubre estar de pie, caminar entre 0 y 1 m/s y girar; no se documentan comportamientos ante obstaculos, terrenos irregulares o perturbaciones externas.
- Sin datos de sim-to-real: no se especifica si la politica se ha validado en el robot fisico, ni que tecnicas de aleatorizacion se aplicaron durante el entrenamiento.
- Acoplamiento a la interfaz: el modelo espera exactamente 61 observaciones y produce 14 objetivos articulares; cualquier cambio en la definicion de observaciones o en la cinematica del robot invalida la politica.
- Ausencia de documentacion tecnica: no se detalla la arquitectura de red, las recompensas ni el proceso de entrenamiento, lo que dificulta la reproducibilidad.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el autor no ofrece garantias sobre el comportamiento del controlador en produccion.
- Riesgo de fallo en hardware real: al ser una politica entrenada en simulacion, puede presentar comportamientos inestables fuera del dominio de entrenamiento.
- Sin soporte linguistico ni de otro tipo de tareas: no debe evaluarse como modelo de lenguaje ni de vision.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alexhegit/microduck-sprint-stand
- Microduck Arena (espacio de evaluacion): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Repositorio de entrenamiento: https://github.com/rocPAI-Forge/microduck_rl_unilab
