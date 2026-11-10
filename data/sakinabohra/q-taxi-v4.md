# SakinaBohra/q-Taxi-v4

## Resumen

`SakinaBohra/q-Taxi-v4` no es un modelo de lenguaje, sino un agente de aprendizaje por refuerzo tabular que resuelve el entorno `Taxi-v4` de Gymnasium mediante Q-Learning clasico con exploracion epsilon-greedy. El repositorio contiene la tabla Q entrenada junto con los hiperparametros, las metricas de evaluacion y una grabacion GIF del agente en funcionamiento, pero no incluye pesos en formato de red neuronal ni un modelo generativo.

El agente se entrena durante 25.000 episodios con una tasa de aprendizaje de 0,7, un factor de descuento de 0,95 y una tasa de decaimiento de epsilon de 0,005. En la evaluacion con politica greedy sobre 100 episodios y semillas fijas alcanza una recompensa media de 7,56 (desviacion tipica de 2,71), una tasa de exito del 100 % y una media de 13,44 pasos por episodio.

Su relevancia es fundamentalmente didactica: sirve como referencia reproducible de un pipeline basico de RL tabular y como contraste con implementaciones sobre `Taxi-v3`, el entorno usado habitualmente en el curso de Hugging Face. No debe confundirse con un modelo de IA generativa ni utilizarse para tareas de procesamiento de lenguaje natural.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (tabla Q, no red neuronal) |
| Parametros totales | no disponible (tabla Q de estados-acciones; tamano no publicado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible |
| Formato de pesos | `.pkl` (pickle con tabla Q e hiperparametros), `results.json`, `replay.gif` |

## Arquitectura y entrenamiento

El agente implementa Q-Learning tabular, un algoritmo de diferencias temporales off-policy que actualiza directamente una tabla de valores Q indexada por pares estado-accion. La exploracion se realiza con una politica epsilon-greedy cuyo epsilon decae a un ritmo de 0,005 por episodio. El entorno es `Taxi-v4` de Gymnasium, una version del clasico problema del taxi con un espacio de estados discreto y un conjunto finito de acciones (mover en cuatro direcciones, recoger y dejar pasajero).

El entrenamiento consta de 25.000 episodios con tasa de aprendizaje 0,7 y factor de descuento 0,95. No se documenta el uso de redes neuronales, funcion de aproximacion, RLHF, DPO ni tecnicas de aprendizaje profundo. Tampoco se detalla la semilla de entrenamiento ni el numero exacto de estados y acciones del entorno en la informacion proporcionada. La evaluacion se realiza con politica greedy sobre 100 episodios con semillas fijas.

## Capacidades

- Resolucion del entorno `Taxi-v4` de Gymnasium con una tasa de exito del 100 % en evaluacion.
- Politica greedy determinista una vez finalizado el entrenamiento.
- Exploracion epsilon-greedy durante el entrenamiento con decaimiento configurable.
- Almacenamiento y reutilizacion de la tabla Q entrenada mediante serializacion en pickle.
- Reproducibilidad de la evaluacion gracias al uso de semillas fijas.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni capacidades multilingues.

## Casos de uso

- Docencia de aprendizaje por refuerzo: el repositorio sirve como ejemplo minimo y reproducible de Q-Learning tabular para explicar diferencias temporales, exploracion epsilon-greedy y evaluacion con politica greedy.
- Comparacion de entornos: permite contrastar el comportamiento del agente sobre `Taxi-v4` frente a implementaciones sobre `Taxi-v3`, como la del curso de Hugging Face, y observar diferencias de recompensa y pasos.
- Verificacion de hiperparametros: los valores publicados (learning rate 0,7, gamma 0,95, decaimiento 0,005, 25.000 episodios) permiten reproducir el experimento y estudiar la sensibilidad del agente a cada parametro.
- Base para extensiones: la tabla Q en pickle puede cargarse y reutilizarse como punto de partida para experimentar con variantes del entorno o con tecnicas como SARSA o Q-Learning con aproximacion funcional.
- Demostracion visual: el archivo `replay.gif` permite mostrar el comportamiento del agente en presentaciones o materiales formativos sin necesidad de ejecutar el entrenamiento.
- Referencia de evaluacion: las metricas en `results.json` (recompensa media, desviacion tipica, tasa de exito, pasos medios) sirven como linea base para comparar nuevos agentes sobre el mismo entorno.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Episodios de evaluacion | 100 |
| Recompensa media | 7,56 |
| Desviacion tipica de recompensa | 2,71 |
| Recompensa media menos desviacion tipica | 4,85 |
| Tasa de exito | 100,0 % |
| Pasos medios por episodio | 13,44 |
| Politica de evaluacion | Greedy, semillas fijas |

No se han publicado resultados comparativos frente a otros agentes sobre `Taxi-v4` en la informacion disponible.

## Requisitos de hardware

- No requiere GPU: la inferencia consiste en consultar una tabla Q en memoria y no implica calculo matricial intensivo.
- Ejecutable en CPU convencional, incluso en entornos con recursos muy limitados.
- No se dispone de estimaciones de VRAM porque el modelo no utiliza aceleracion por hardware.
- Despliegue mediante Python con Gymnasium y la libreria estandar de pickle; no aplican servidores de inferencia como vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput no publicados; en la practica, la consulta a la tabla Q es de orden constante por paso y el cuello de botella sera la simulacion del entorno.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Episodios | Recompensa media | Licencia |
|---|---|---|---|---|---|
| SakinaBohra/q-Taxi-v4 | Q-Learning tabular | Taxi-v4 | 25.000 | 7,56 | no disponible |
| Agente de referencia del curso de Hugging Face | Q-Learning tabular | Taxi-v3 | no disponible | no disponible | no disponible |
| Alternativas sobre Taxi-v3/v4 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para una comparativa cuantitativa con otros agentes publicados.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo generativo: no puede emplearse para texto, codigo, vision ni tareas de NLP.
- La tabla Q esta especializada exclusivamente en `Taxi-v4`; no generaliza a otros entornos sin reentrenamiento.
- El rendimiento se ha medido con semillas fijas y politica greedy; el comportamiento con otras semillas o con exploracion no esta documentado.
- La recompensa media de 7,56 con desviacion tipica de 2,71 indica variabilidad entre episodios pese a la tasa de exito del 100 %.
- La licencia no esta especificada, por lo que no se puede confirmar el uso comercial ni la redistribucion.
- El repositorio tiene 0 descargas y 0 likes, y un tamano de 0,0 GB, lo que sugiere que el contenido puede ser minimo o no estar completamente cargado.
- El uso de pickle para cargar la tabla Q implica riesgos de seguridad si el archivo procede de una fuente no confiable.
- No se documentan sesgos en el sentido de modelos de lenguaje, pero el agente hereda las limitaciones del diseno del entorno `Taxi-v4`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SakinaBohra/q-Taxi-v4
- Entorno Taxi-v4 en Gymnasium: no disponible en la informacion proporcionada
- Curso de Hugging Face sobre RL (referencia a Taxi-v3): no disponible en la informacion proporcionada
