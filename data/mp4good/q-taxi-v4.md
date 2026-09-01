# MP4good/q-Taxi-v4

## Resumen

q-Taxi-v4 es un agente de aprendizaje por refuerzo entrenado con el algoritmo Q-learning clásico para resolver el entorno Taxi-v4 de Gymnasium. El modelo fue desarrollado por el usuario MP4good y publicado en Hugging Face, siguiendo la estructura típica de los agentes generados por el framework RL-Zoo. Su propósito es demostrar la aplicación de tablas Q en un problema de navegación discreta en un grid de 5x5, donde un taxi debe recoger a un pasajero y dejarlo en el destino correcto.

La relevancia de este modelo reside en su carácter didáctico: representa una implementación sencilla y reproducible de Q-learning tabular, un algoritmo fundamental en el campo del aprendizaje por refuerzo. A diferencia de los modelos de lenguaje de gran escala, este agente no contiene redes neuronales ni parámetros de red, sino una tabla de valores Q que mapea pares estado-acción a valores esperados. El repositorio tiene un tamaño de 0.0 GB, lo que confirma que se trata de un archivo de pesos extremadamente ligero.

El modelo reporta una recompensa media de 7.52 ± 2.67 en el entorno Taxi-v4, un resultado que refleja el rendimiento del agente tras su entrenamiento. No se especifican detalles sobre el número de episodios de entrenamiento, la tasa de aprendizaje ni la política de exploración utilizada, por lo que la reproducibilidad exacta del entrenamiento no está documentada en la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-learning tabular (tabla Q) |
| Parametros totales | no disponible (tabla Q de tamaño discreto, sin parametros de red) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (entorno de estado discreto, sin procesamiento de secuencias) |
| Tipos de cuantizacion | no disponible (almacenado como archivo pickle) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | pickle (.pkl) |

## Arquitectura y entrenamiento

El modelo implementa Q-learning tabular, un algoritmo de aprendizaje por refuerzo sin aproximación funcional. En este enfoque, el agente mantiene una tabla Q donde cada entrada representa el valor esperado de tomar una acción en un estado concreto. El entorno Taxi-v4 tiene un espacio de estados discreto de 500 estados (25 posiciones de grid × 5 combinaciones de pasajero y destino) y 6 acciones posibles, lo que da lugar a una tabla Q de 500 × 6 entradas.

El entrenamiento sigue el procedimiento estándar de Q-learning: el agente explora el entorno, recibe recompensas y actualiza iterativamente los valores Q mediante la ecuación de Bellman. No se dispone de información sobre el número de episodios, la tasa de aprendizaje (alpha), el factor de descuento (gamma) ni la política de exploración (epsilon-greedy u otra). El archivo de pesos se guarda en formato pickle, lo que permite cargar la tabla Q entrenada y evaluarla directamente en el entorno.

## Capacidades

- Navegacion en grid discreto: el agente es capaz de moverse por un grid de 5x5, recoger a un pasajero en una de cuatro ubicaciones fijas (R, G, Y, B) y dejarlo en el destino correcto.
- Aprendizaje por refuerzo: demuestra la aplicacion del algoritmo Q-learning para resolver un problema de decision secuencial con recompensas retardadas.
- Inferencia determinista: una vez entrenado, el agente puede seleccionar la accion con mayor valor Q en cada estado, lo que produce una politica determinista.
- No tiene capacidades de lenguaje, vision, tool calling ni razonamiento multi-paso fuera del entorno Taxi-v4.

## Casos de uso

- Material didactico para cursos de aprendizaje por refuerzo: el modelo sirve como ejemplo practico de Q-learning tabular, permitiendo a estudiantes comparar su propia implementacion con una ya entrenada.
- Benchmark de algoritmos RL: puede utilizarse como linea base para comparar el rendimiento de algoritmos mas avanzados (DQN, PPO, etc.) en el entorno Taxi-v4.
- Experimentacion con hiperparametros: los usuarios pueden cargar el agente y evaluar como diferentes configuraciones de entrenamiento afectan a la recompensa final.
- Demostracion de carga de modelos desde Hugging Face: el codigo de uso muestra como cargar un agente RL desde el hub mediante la funcion `load_from_hub`, util para quienes aprenden a distribuir y consumir modelos.
- Validacion de entornos Gymnasium: permite verificar que una instalacion de Taxi-v4 funciona correctamente ejecutando el agente y comprobando que obtiene recompensas positivas.
- Estudio de politicas optimas: analizando la tabla Q, se puede extraer la politica aprendida y estudiar que acciones prefiere el agente en cada estado.

## Benchmarks y rendimiento

El autor declara el siguiente resultado en la model card:

| Tarea | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| reinforcement-learning | Taxi-v4 | mean_reward | 7.52 ± 2.67 | No |

No se han publicado resultados comparativos con otros agentes en el mismo entorno. La recompensa media de 7.52 indica que el agente resuelve el episodio con una penalizacion media de aproximadamente 2.48 puntos (la recompensa por entrega exitosa es de +20, con penalizaciones de -1 por paso y -10 por acciones ilegales).

## Requisitos de hardware

- VRAM estimada: 0 MB. El modelo es una tabla Q de 500 × 6 valores numericos, almacenada en un archivo pickle de menos de 1 KB.
- GPU recomendada: ninguna. El modelo se ejecuta completamente en CPU.
- Compatibilidad con hardware de consumo: total. Cualquier ordenador, incluidos Raspberry Pi o sistemas embebidos, puede ejecutar este agente.
- Opciones de despliegue: el modelo se carga mediante Python con Gymnasium y la funcion `load_from_hub`. No requiere servidores de inferencia ni frameworks especializados.
- Latencia: inferior a 1 milisegundo por paso, ya que cada decision es una consulta directa a la tabla Q.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Recompensa media | Licencia |
|---|---|---|---|---|
| MP4good/q-Taxi-v4 | Q-learning tabular | Taxi-v4 | 7.52 ± 2.67 | no disponible |
| EverVissionAI/q-Taxi-v4 | Q-learning tabular | Taxi-v4 | no disponible | no disponible |
| hlm1234/q-Taxi-v4 | Q-learning tabular | Taxi-v4 | no disponible | no disponible |

Los tres modelos encontrados en la busqueda web son agentes Q-learning para el mismo entorno Taxi-v4, probablemente generados con el mismo framework de entrenamiento. No se dispone de datos comparativos de rendimiento para los otros dos modelos.

## Limitaciones y advertencias

- Alcance limitado: el agente solo funciona en el entorno Taxi-v4. No es transferible a otros problemas ni entornos.
- Sin generalizacion: al ser una tabla Q, el agente no puede manejar estados no vistos durante el entrenamiento.
- Resultados no verificados: la metrica de recompensa media no ha sido verificada de forma independiente.
- Informacion de entrenamiento incompleta: no se documentan los hiperparametros ni el numero de episodios, lo que dificulta la reproducibilidad.
- Licencia no especificada: no se indica bajo que licencia se distribuye el modelo, lo que genera incertidumbre sobre su uso comercial.
- Sin soporte de lenguaje natural: no es un modelo de lenguaje ni puede procesar texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MP4good/q-Taxi-v4
- Modelo similar (EverVissionAI): https://huggingface.co/EverVissionAI/q-Taxi-v4
- Modelo similar (hlm1234): https://huggingface.co/hlm1234/q-Taxi-v4
- Estudio reproducible de Q-learning en Taxi-v4 (Kaggle): https://www.kaggle.com/code/alexandriadrake/taxi-v4-reproducible-q-learning-study
- Implementacion de referencia en GitHub: https://github.com/janashams/Taxi-v4-OpenAI-Gymnasium/blob/main/q_learning.py
