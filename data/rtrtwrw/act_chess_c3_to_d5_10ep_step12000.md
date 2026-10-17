# rtrtwrw/act_chess_c3_to_d5_10ep_step12000

## Resumen

`rtrtwrw/act_chess_c3_to_d5_10ep_step12000` es una política robótica basada en ACT (Action Chunking Transformer) entrenada desde cero con LeRobot 0.5.1 para un brazo seguidor SO-101. No es un modelo de lenguaje: es un modelo de control visuomotor que, a partir de tres cámaras a 480x640 y del estado de 6 articulaciones, predice acciones de 6 articulaciones. El modelo resuelve una tarea muy concreta de manipulación: mover una pieza de ajedrez desde la casilla c3 (a 6 cm) hasta la casilla d5 (a 10 cm).

Se trata de un checkpoint intermedio (paso 12.000 de 16.000) entrenado sobre los 10 episodios más cortos de un conjunto de demostraciones de ajedrez, lo que supone 3.422 fotogramas. Con 51.668.614 parámetros y un repositorio de 0,2 GB, es un modelo muy pequeño, pensado para inferencia en tiempo real sobre hardware modesto y para experimentación con el ecosistema LeRobot.

Su relevancia es acotada: no compite con modelos fundacionales de robótica, sino que sirve como referencia reproducible de un pipeline completo de imitación (grabación de demos con SO-101, entrenamiento ACT y despliegue con `lerobot-record`), útil para quien esté montando su propio flujo de aprendizaje por imitación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer); politica visuomotora con codificador de imagenes, estado de 6 articulaciones y prediccion de secuencias de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica: politica de robot, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en safetensors) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `lerobot`) |
| Entradas | 3 camaras a 480x640 + estado de 6 articulaciones |
| Salidas | acciones de 6 articulaciones |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ACT es una arquitectura de aprendizaje por imitacion que combina un codificador visual (normalmente una red tipo ResNet preentrenada) con un transformer que consume las observaciones y predice *chunks* de acciones futuras en lugar de una sola accion por paso. Esta prediccion por bloques reduce el error de acumulacion y suaviza el comportamiento en tareas de manipulacion de horizonte corto. En este caso el modelo tiene dos cabezas de salida sobre el estado de 6 articulaciones: estado observado y accion predicha, segun la model card.

El entrenamiento se hizo desde cero con LeRobot 0.5.1 sobre un brazo seguidor SO-101, con 3 camaras a 480x640, batch de 24 y un total de 16.000 pasos. El conjunto de datos es `niru-5/chess_dataset_c3_6cm_to_d5_10cm_20261017_145741`, y para este checkpoint se usaron los 10 episodios mas cortos (identificados como 19, 12, 14, 10, 18, 15, 20, 9, 16 y 28), lo que suma 3.422 fotogramas. No se indica en la informacion disponible si hubo aumentos de datos, normalizacion concreta ni fases de RLHF/DPO (no aplicables en este paradigma).

## Capacidades

- Control visuomotor de un brazo SO-101 con 6 articulaciones: genera comandos de accion a partir de imagenes y del estado articular.
- Ejecucion de una tarea de pick-and-place muy especifica: trasladar una pieza de ajedrez de c3 (6 cm) a d5 (10 cm).
- Percepcion multi-camara: consume tres flujos de imagen simultaneos a 480x640, lo que permite combinar vistas complementarias del tablero.
- Prediccion de secuencias de acciones (action chunking), que aporta movimientos mas estables que la prediccion paso a paso.
- Integracion directa con el ecosistema LeRobot mediante `--policy.path=rtrtwrw/act_chess_c3_to_d5_10ep_step12000`.
- No soporta tool calling, function calling, razonamiento multi-paso simbolico, comprension de lenguaje natural ni capacidades multimodales de tipo VLM. Dichas funciones no estan disponibles en esta politica.

## Casos de uso

- Replicacion de un pipeline de imitacion de referencia: sirve para validar de extremo a extremo el flujo de LeRobot (grabacion de demos con SO-101, conversion de dataset, entrenamiento ACT y evaluacion en el brazo real) antes de invertir en un dataset propio mayor.
- Punto de partida para ajuste fino: al ser un checkpoint intermedio con pesos disponibles en safetensors, se puede reanudar el entrenamiento o hacer fine-tuning sobre episodios adicionales del mismo dataset para mejorar la tasa de exito en la tarea c3-d5.
- Pruebas de integracion en laboratorio: permite comprobar el cableado de camaras, la calibracion articular y la latencia del bucle de control sin necesidad de entrenar desde cero.
- Docencia y divulgacion: ejemplo tangible de politica ACT con un dataset pequeno (3.422 fotogramas), adecuado para explicar action chunking y el coste real de un modelo de robotica ligero.
- Benchmark interno de infraestructura: con ~51,7 M de parametros permite medir throughput de inferencia y comportamiento del pipeline en GPU de gama baja o incluso en CPU antes de escalar a modelos mayores.
- Evaluacion comparativa de checkpoints: al existir un estado en el paso 12.000 de 16.000, se puede contrastar la evolucion entre checkpoints intermedios y finales sobre la misma tarea y el mismo conjunto de episodios.
- Prototipado de tareas de pick-and-place con piezas pequenas: la configuracion de tres camaras y estado de 6 articulaciones es reutilizable para otras tareas de alcance corto con el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasa de exito, error de posicion final, numero de evaluaciones ni comparaciones cuantitativas con otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia: calculo derivado del numero de parametros, en torno a 0,21 GB solo para los pesos en precision de 32 bits (51.668.614 x 4 bytes), mas activaciones de tres codificadores visuales a 480x640 y el transformer. En la practica, un presupuesto de 1-2 GB de VRAM con batch 1 es mas que suficiente; el dato exacto no esta disponible en la informacion proporcionada.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobradamente capaz. En entornos de laboratorio, A100 o H100 no aportan ventaja para inferencia de un modelo de este tamano; resultan utiles solo si se entrena en paralelo.
- Cabe en GPU consumer: si, con amplio margen, incluidas GPUs de portatil con 4-6 GB de VRAM. La inferencia en CPU es viable aunque con mayor latencia, no cuantificada en la informacion disponible.
- Opciones de despliegue: LeRobot 0.5.1 con el comando `lerobot-record` y `--policy.path`; PyTorch como runtime subyacente. vLLM, llama.cpp, Ollama y TGI estan orientados a modelos de lenguaje y no aplican a esta politica.
- Latencia y throughput: no disponibles. Dependen del tiempo de captura de las tres camaras, del hardware y del bucle de control del SO-101, no solo del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entradas | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rtrtwrw/act_chess_c3_to_d5_10ep_step12000` | 51.668.614 | 3 camaras 480x640 + estado de 6 articulaciones | no disponible | no disponible | HuggingFace, 0 descargas |
| ACT estandar (LeRobot, otras politicas de la comunidad) | no disponible en la informacion proporcionada | tipicamente menos camaras | no disponible | variable segun autor | HuggingFace Hub, tag `act` |
| Diffusion Policy (familia alternativa para imitacion) | no disponible en la informacion proporcionada | observaciones visuales + estado | no disponible | variable segun implementacion | implementaciones publicas en el ecosistema LeRobot |
| Modelos fundacionales VLA (p. ej. SmolVLA, pi-0) | no disponible en la informacion proporcionada | instrucciones en lenguaje + vision | no disponible | variable | HuggingFace Hub |

La diferencia cualitativa relevante es de alcance: este ACT esta especializado en una unica tarea y un unico montaje fisico, mientras que las alternativas fundacionales VLA aspiran a generalizar entre tareas e instrucciones a cambio de un tamano mucho mayor. No hay datos verificables en la informacion proporcionada para comparar tasas de exito.

## Limitaciones y advertencias

- Especializacion extrema: el modelo solo ha visto la transicion c3 (6 cm) a d5 (10 cm) con un SO-101 concreto; no generaliza a otras casillas, piezas, orientaciones ni brazos.
- Sesgo de dataset: entrenado con los 10 episodios mas cortos (3.422 fotogramas) de un unico operador, lo que reduce la variabilidad de trayectorias y aumenta el riesgo de sobreajuste a la iluminacion, posicion de camaras y velocidad de ejecucion de esas demos.
- Checkpoint intermedio: corresponde al paso 12.000 de 16.000, por lo que no representa el estado final del entrenamiento.
- Sin licencia declarada: la ausencia de licencia impide asumir permiso de uso comercial, redistribucion o modificacion; hay que contactar con el autor antes de cualquier uso en produccion.
- Riesgo de fallo silencioso: al no publicarse metricas de evaluacion, no hay evidencia cuantitativa de tasa de exito ni de robustez ante perturbaciones.
- Dependencia de hardware: la politica asume tres camaras a 480x640, estado de 6 articulaciones y la cinematica del SO-101; cualquier cambio de calibracion o de montaje invalida el modelo.
- Idiomas y texto: no soporta entrada o salida en lenguaje natural, por lo que no puede recibir instrucciones verbales ni justificar sus acciones.
- Fecha de publicacion inusual (2026-10-17) en los metadatos; conviene verificar la procedencia y la reproducibilidad del dataset enlazado.
- Cero descargas y cero likes: no hay senales de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rtrtwrw/act_chess_c3_to_d5_10ep_step12000
- Dataset de entrenamiento: https://huggingface.co/datasets/niru-5/chess_dataset_c3_6cm_to_d5_10cm_20261017_145741
- Repositorio de LeRobot: no disponible en la informacion proporcionada
- Paper de ACT (Action Chunking with Transformers): no disponible en la informacion proporcionada
- Blog o demo del autor: no disponible en la informacion proporcionada
- Nota: los resultados de busqueda web recibidos no contienen enlaces relacionados con este modelo (corresponden a Google Gemini) y se han descartado por no ser relevantes.
