# abhijeetknayak/rl_course_vizdoom_health_gathering_supreme

## Resumen

Este modelo es un agente de aprendizaje por refuerzo (RL) entrenado con el algoritmo APPO (Asynchronous Proximal Policy Optimization) sobre el entorno `doom_health_gathering_supreme` de ViZDoom. Ha sido desarrollado por el usuario `abhijeetknayak` como parte de un curso de RL, utilizando la librería Sample-Factory 2.0. El objetivo del agente es maximizar la recompensa en un escenario donde debe recolectar paquetes de salud en un entorno 3D basado en el motor de Doom, aprendiendo directamente de píxeles de pantalla.

La relevancia de este modelo radica en que demuestra la aplicación práctica de algoritmos de RL distribuidos (APPO) sobre entornos parcialmente observables y de alta dimensionalidad visual. Aunque no es un modelo de lenguaje ni de propósito general, sirve como referencia para investigadores que trabajan en RL, control de agentes y evaluación de algoritmos de aprendizaje por refuerzo. El repositorio ocupa 0.1 GB e incluye los pesos del agente entrenado, listos para ser cargados y evaluados con Sample-Factory.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional (CNN) para procesamiento visual, con politica y valor compartidos (APPO) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (entorno episodico, sin contexto de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente checkpoint de PyTorch/Sample-Factory) |

## Arquitectura y entrenamiento

El modelo utiliza el algoritmo APPO (Asynchronous Proximal Policy Optimization), una variante asincrona de PPO implementada en Sample-Factory 2.0. APPO combina la estabilidad de PPO con la eficiencia de la ejecucion asincrona en multiples workers, permitiendo un alto throughput de muestras durante el entrenamiento. La red neuronal tipica para entornos ViZDoom consiste en una CNN que procesa los frames de pantalla (imagenes RGB) y produce tanto la politica (distribucion de acciones) como el valor de estado. No se dispone de detalles sobre el numero de capas, parametros o el dataset de entrenamiento mas alla de que se uso el entorno `doom_health_gathering_supreme`. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion, ya que es un agente de RL clasico.

## Capacidades

- Control de un agente en un entorno 3D parcialmente observable (ViZDoom) para recolectar paquetes de salud.
- Aprendizaje directo de píxeles de pantalla, sin ingenieria de caracteristicas manual.
- Toma de decisiones secuenciales con recompensa por supervivencia y recoleccion.
- Ejecucion en tiempo real o acelerada gracias a la naturaleza del entorno ViZDoom.
- No soporta generacion de texto, codigo, vision general, tool calling ni capacidades multilingues.

## Casos de uso

- Investigacion en aprendizaje por refuerzo: sirve como punto de partida para estudiar el comportamiento de APPO en entornos de navegacion y recoleccion de objetos, permitiendo comparar con otros algoritmos (PPO, DQN, etc.).
- Evaluacion de algoritmos de RL: al ser un agente entrenado en un escenario estandar de ViZDoom, puede usarse como baseline para medir el rendimiento de nuevas variantes de algoritmos.
- Educacion y cursos de RL: este modelo es parte de un curso de RL, por lo que es util para que estudiantes carguen el agente, lo ejecuten y observen su comportamiento, asi como para practicar tecnicas de continuacion de entrenamiento.
- Desarrollo de agentes para videojuegos: aunque el escenario es simple, el enfoque puede extenderse a otros entornos de ViZDoom o juegos similares, sirviendo como prototipo para agentes de juego.
- Benchmarking de infraestructura de entrenamiento: al ser un modelo pequeno (0.1 GB), es adecuado para probar pipelines de entrenamiento distribuido con Sample-Factory en GPUs modestas.
- Continuacion de entrenamiento: el checkpoint permite reanudar el entrenamiento con `--restart_behavior=resume`, lo que facilita experimentos de curriculum learning o ajuste fino en variantes del entorno.

## Benchmarks y rendimiento

El autor declara el siguiente resultado en la model card:

| Algoritmo | Entorno | Metrica | Valor |
|---|---|---|---|
| APPO | doom_health_gathering_supreme | mean_reward | 14.86 +/- 4.51 |

No se han publicado comparaciones con otros modelos o algoritmos en la informacion disponible. El valor de recompensa media es de 14.86 con una desviacion de 4.51, lo que indica una variabilidad considerable entre episodios.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 0.1 GB, la inferencia puede ejecutarse en GPU con 2-4 GB de VRAM, o incluso en CPU para evaluaciones lentas.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA (por ejemplo, GTX 1060, RTX 2060, RTX 4090) es suficiente. No requiere GPU de datacenter.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo actual.
- Opciones de despliegue: el modelo se carga y ejecuta mediante Sample-Factory, usando los scripts `enjoy` o `train`. No es compatible con vLLM, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se dispone de datos oficiales. En un entorno ViZDoom, la inferencia suele ser de milisegundos por frame en GPU, permitiendo ejecucion en tiempo real o acelerada.

## Comparativa con modelos similares

No se dispone de informacion sobre otros agentes entrenados en el mismo entorno con los que comparar directamente. Existen otros repositorios en Hugging Face con el mismo nombre (por ejemplo, `nomad-ai/rl_course_vizdoom_health_gathering_supreme` o `mnneely/rl_course_vizdoom_health_gathering_supreme`), pero no se han publicado sus resultados. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- El modelo esta especializado exclusivamente en el escenario `doom_health_gathering_supreme`; no generaliza a otros entornos o tareas.
- No es un modelo de lenguaje ni multimodal; no puede procesar texto, audio ni imagenes fuera del contexto de ViZDoom.
- La recompensa media tiene una desviacion alta (4.51), lo que sugiere que el comportamiento puede ser inconsistente entre episodios.
- No se ha publicado informacion sobre sesgos, alucinaciones o riesgos de seguridad, ya que no aplican a un agente de RL en un entorno cerrado.
- La licencia no esta especificada, por lo que se debe contactar al autor antes de un uso comercial o de redistribucion.
- El entrenamiento se realizo con una configuracion concreta de hiperparametros; reanudar el entrenamiento puede requerir ajustes en `--train_for_env_steps`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abhijeetknayak/rl_course_vizdoom_health_gathering_supreme
- Repositorio de Sample-Factory: https://github.com/alex-petrenko/sample-factory
- Documentacion de Sample-Factory: https://www.samplefactory.dev/
- Guia de uso de Hugging Face con Sample-Factory: https://www.samplefactory.dev/10-huggingface/huggingface/
- Notebook de la clase de RL (unidad 8) que usa ViZDoom: https://colab.research.google.com/github/huggingface/deep-rl-class/blob/master/notebooks/unit8/unit8_part2.ipynb
