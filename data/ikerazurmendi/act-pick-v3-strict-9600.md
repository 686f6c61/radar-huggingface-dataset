# IkerAzurmendi/act-pick-v3-strict-9600

## Resumen

`act-pick-v3-strict-9600` es una política de imitación visomotora basada en ACT (Action Chunking Transformer) para el brazo robótico de bajo coste SO-101, publicada por el usuario IkerAzurmendi en HuggingFace bajo la librería LeRobot. Resuelve una única tarea: coger una pieza de una caja y sostenerla frente a la cámara. El modelo consume dos cámaras (frontal y de muñeca) más las seis posiciones articulares del robot, y devuelve un chunk de 90 objetivos articulares futuros a 30 fps, es decir, una ventana de predicción de 3 segundos que se recalcula cada 30 pasos (1 segundo).

Con 51.658.374 parámetros y un repo de 0,2 GB, es un modelo pequeño pensado para control en tiempo real en hardware modesto. Se entrenó con 205 episodios filtrados por calidad (duración 6-12 s, hueco inicial máximo de 5 grados, como mucho 1 s de inactividad en los extremos, al menos una apertura de pinza) mediante el `train()` de LeRobot, con batch 8, chunk 90 y semilla 1000.

Es relevante ahora por su valor como artefacto de investigación más que como producto: el autor publica una familia de checkpoints y runs comparables (v2, v3, variantes *super*, *strict*, *chunk60*, un solo objeto, solo sesiones recientes) con una evaluación offline homogénea sobre 16 episodios reservados. Aviso explícito del autor: este no es el mejor checkpoint de su run (lo es el de 2.400 pasos) y ninguno de los modelos se ha probado todavía sobre el robot real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer): política visomotora de imitación con encoder visual por cámara y decodificador transformer que emite chunks de acciones |
| Parametros totales | 51.658.374 (dato real de los safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: no es un modelo de lenguaje. Entrada de 2 imágenes (cámara frontal y de muñeca) + 6 posiciones articulares; salida de 90 acciones futuras |
| Tipos de cuantizacion | No disponible. Solo se publican pesos en safetensors; no se documentan variantes GGUF, INT8 ni fp16 |
| Idiomas soportados | No aplica (no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,2 GB, compatible con fp32 ≈ 207 MB solo de pesos) |

## Arquitectura y entrenamiento

ACT es una política de imitación de tipo CVAE con transformer: codifica las observaciones (imágenes de las dos cámaras y estado articular) y decodifica directamente una secuencia de acciones de longitud fija, en lugar de predecir una sola acción por paso. Ese *action chunking* es lo que mitiga el error de compounding de las políticas de imitación: el modelo predice 90 objetivos articulares de golpe a 30 fps (3 s de horizonte) y el bucle de control solo replanifica cada 30 pasos, ejecutando 1 s de acciones entre inferencias. La model card no detalla el número de capas ni el backbone visual concreto; se remite a la receta estándar de LeRobot.

El entrenamiento usó 205 episodios a 30 fps con un filtrado estricto (6-12 s de duración, desviación máxima de 5 grados entre la posición inicial y la de referencia, como mucho 1 s de reposo en los extremos, al menos una apertura de pinza, tomas defectuosas eliminadas) y los hiperparámetros: `train()` de LeRobot, batch 8, chunk 90, 30 pasos de acción por replanificación, aumento de imagen por defecto y semilla 1000. El run completo fue de 12.000 pasos y este checkpoint corresponde al paso 9.600. No hay RLHF, DPO ni ajuste por preferencias: es imitación supervisada pura sobre demostraciones de teleoperación.

## Capacidades

- Manipulación robótica por imitación: coger una pieza de la caja y sostenerla frente a la cámara, tarea única para la que fue entrenado.
- Fusión visomotora de dos vistas: cámara frontal (contexto global de la escena) y cámara de muñeca (vista cenital del agarre).
- Predicción de chunks de 90 acciones articulares a 30 fps con replanificación cada 30 pasos.
- Control en bucle cerrado con realimentación del estado articular de 6 ejes del SO-101.
- No soporta tool calling ni function calling: no hay interfaz de lenguaje ni de herramientas.
- No soporta razonamiento multi-paso simbólico ni planificación de tareas: ejecuta una política reactiva.
- No tiene capacidades multilingües, de visión general, audio ni modo *thinking*.
- No generaliza a otras tareas, objetos o morfologías de robot más allá de las condiciones de entrenamiento.

## Casos de uso

- **Automatización de pick-and-place en banco de pruebas con SO-101**: despliegue en bucle cerrado con las dos cámaras y lectura de encoders a 30 fps, emitiendo 1 s de acciones por inferencia. Adecuado porque el modelo está entrenado exactamente para esa morfología y esa distribución de escena.
- **Punto de partida para *fine-tuning* con datos propios**: al ser Apache 2.0 y estar en formato LeRobot, se puede recargar con `lerobot` y reentrenar con un dataset propio de otra pieza, otro recipiente o distinta iluminación. El propio autor publica variantes con 100, 292 y 331 episodios como evidencia de que ese reentrenamiento es viable con pocos datos.
- **Estudio de ablaciones sobre cantidad y filtrado de datos**: el checkpoint sirve para reproducir la comparación entre 205 episodios *strict* y 398 *super*, o entre chunk 90 y chunk 60. Útil en un artículo o TFG sobre sensibilidad al filtrado de demostraciones.
- **Docencia en aprendizaje por imitación**: ejemplo compacto (51,6 M de parámetros, 0,2 GB) para explicar *action chunking*, aumento de imagen y evaluación offline frente a una línea base de "quedarse quieto".
- **Evaluación de la métrica offline como proxy**: permite medir la discrepancia entre error articular medio y tasa de éxito real de agarre, una vez se validen los checkpoints en el robot.
- **Integración en un pipeline LeRobot de recogida y evaluación de episodios**: usar el policy server del framework para conectar el modelo al robot y registrar episodios nuevos que amplíen el dataset.
- **Prototipado de bajo coste en laboratorio o aula**: al requerir menos de 1 GB de VRAM, se puede ejecutar en una Jetson Orin o en un portátil con GPU de gama media junto al resto del *stack* de control.

## Benchmarks y rendimiento

El autor solo publica una métrica offline: error articular absoluto medio sobre el chunk predicho (menor es mejor) frente a una línea base de "mantener las posiciones articulares actuales", cuyo valor es 20,71. La evaluación usa 16 episodios reservados: 12 de `so101-pick-cube_20261024_181939` (una pieza) y 4 de `so101-pick-cube_20261024_144537` (dos piezas).

| Checkpoint de este run | Error | Mejora sobre línea base |
|---|---|---|
| 2.400 pasos | 15,14 | 27% |
| 4.800 pasos | 15,44 | 25% |
| 7.200 pasos | 15,52 | 25% |
| **9.600 pasos (este)** | **15,53** | 25% |
| 12.000 pasos | 15,96 | 23% |

Comparación con el mejor checkpoint de cada run de la misma ronda:

| Run | Episodios de entrenamiento | Mejor checkpoint | Error | Mejora sobre línea base |
|---|---|---|---|---|
| super (todo el dato que pasa calidad) | 398 | 6k | 15,16 | 27% |
| strict (6-12 s, calidad estricta) | 205 | 2,4k | 15,14 | 27% |
| receta v3 sobre episodios de 1-2 piezas | 331 | 18k | 15,35 | 26% |
| v2 (anterior) | 278 | 6k | 15,36 | 26% |
| chunk 60 (línea base propia 16,23) | 331 | 4,8k | 11,94 | 26% |
| solo una pieza | 292 | 9,6k | 15,47 | 25% |
| solo sesiones recientes | 100 | 12k | 16,87 | 19% |
| primer run | 165 | 6k | 16,87 | 19% |

No se han publicado tasas de éxito de agarre ni resultados de benchmarks estándar (MMLU, HumanEval, GSM8K y similares no aplican a este modelo). El propio autor advierte que el error offline no permite determinar qué modelo agarra mejor y que ninguno se ha probado sobre el robot.

## Requisitos de hardware

- **VRAM estimada para inferencia**: alrededor de 207 MB solo para los pesos en fp32 (51,66 M de parámetros × 4 bytes); con las activaciones y los dos flujos de cámara, el consumo cabe holgadamente por debajo de 1 GB. Cálculo derivado del recuento de parámetros, no medido por el autor.
- **GPU recomendadas**: cualquier GPU con 4 GB o más sirve para inferencia. Para entrenamiento, una RTX 3060/4060 de 8-12 GB es suficiente para batch 8 y un modelo de este tamaño; una RTX 4090 o A100 acorta los 12.000 pasos del run completo.
- **Cabe en GPU de consumo**: sí, sin problema. También en placas embebidas tipo Jetson Orin, lo habitual en robots SO-101.
- **Opciones de despliegue**: LeRobot (scripts de `record` y evaluación con el policy server), PyTorch nativo. vLLM, TGI, llama.cpp y Ollama no aplican: no es un modelo de lenguaje ni un transformer autoregresivo de tokens de texto.
- **Latencia y throughput**: no se han publicado medidas. Por la configuración (1 inferencia por segundo, ya que se ejecutan 30 acciones a 30 fps entre replanificaciones y el chunk es de 90), el requisito de latencia del bucle de control es de 1 Hz por forward pass, holgado para un modelo de 51,6 M de parámetros. La emisión de acciones intermedias es a 30 Hz desde el buffer del chunk.

## Comparativa con modelos similares

No se dispone de información sobre políticas comparables de otros autores. La comparación más fiable es interna, contra los checkpoints de la misma familia publicados por el mismo autor:

| Modelo | Parámetros | Episodios | Error offline | Licencia | Nota |
|---|---|---|---|---|---|
| act-pick-v3-strict-9600 (este) | 51,66 M | 205 | 15,53 | Apache 2.0 | Checkpoint intermedio, publicado por completitud |
| act-pick-v3-strict-2400 | 51,66 M | 205 | 15,14 | Apache 2.0 | Mejor checkpoint del run *strict* |
| act-pick-v3-6000 | 51,66 M | 398 | 15,16 | Apache 2.0 | Mejor del run *super*, con el doble de datos |
| act-pick-v3-chunk60-4800 | 51,66 M | 331 | 11,94 | Apache 2.0 | Chunk de 60 acciones; no es comparable directamente porque su línea base es 16,23 |
| act-pick-v2-6000 | 51,66 M | 278 | 15,36 | Apache 2.0 | Generación anterior |

Las diferencias entre los mejores checkpoints de los runs principales están dentro del ruido, según el autor. Los parámetros de los modelos hermanos se asumen idénticos por compartir receta y arquitectura, pero no se han verificado uno a uno.

## Limitaciones y advertencias

- **Tarea única y morfología única**: solo hace *pick* sobre SO-101 con dos cámaras en posiciones concretas. No hay evidencia de transferencia a otro robot, otra cámara u otra disposición de la caja.
- **No es el mejor checkpoint de su propio run**: el de 2.400 pasos obtiene 15,14 frente a 15,53 de este. Usarlo en producción sin motivo justificado supone una pérdida de rendimiento evitable.
- **Degradación tras una pasada por los datos**: el autor observa que todos los runs empeoran después de aproximadamente una época sobre el dataset, lo que apunta a sobreajuste. Este checkpoint (9.600 de 12.000 pasos) está en la zona ya degradada.
- **La métrica offline no mide éxito de la tarea**: el error articular medio no correlaciona necesariamente con la tasa de agarre. Ninguno de los modelos se ha validado sobre el robot real, por lo que no existe evidencia de funcionamiento físico.
- **Riesgo de deriva y error compuesto**: al ser una política reactiva sin verificación del resultado, un fallo de agarre no se detecta ni se corrige; el chunk de 90 acciones puede ejecutar 3 s de trayectoria incorrecta antes de replanificar.
- **Cobertura de datos estrecha**: episodios de 6-12 s, con una o dos piezas y sin oclusión ni escenas desordenadas. Fuera de esa distribución se espera un fallo silencioso.
- **Sesgo de operador y de montaje**: las demostraciones provienen de sesiones concretas (`so101-pick-cube_20261024_*`), de modo que el modelo puede haber aprendido correlatos de iluminación, fondo o estilo de teleoperación en lugar de la geometría del agarre.
- **Licencia**: Apache 2.0 permite uso comercial y modificación, pero no se especifica la procedencia ni la licencia de los datos de entrenamiento, y no hay garantía alguna por parte del autor.
- **Sin soporte de lenguaje**: no se le puede dar una instrucción en castellano ni encadenar subtareas; requiere un planificador externo si se quiere un comportamiento de más alto nivel.
- **Madurez**: 0 descargas y 0likes en el momento de la consulta, creado y actualizado el mismo día; sin issues ni validación de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IkerAzurmendi/act-pick-v3-strict-9600
- Checkpoint hermano mejor valorado del run *strict*: https://huggingface.co/IkerAzurmendi/act-pick-v3-strict-2400
- Run *super* con 398 episodios: https://huggingface.co/IkerAzurmendi/act-pick-v3-6000
- Run sobre episodios de una y dos piezas: https://huggingface.co/IkerAzurmendi/act-pick-v3-1-2-pieces-18000
- Run con chunk de 60 acciones: https://huggingface.co/IkerAzurmendi/act-pick-v3-chunk60-4800
- Run con una sola pieza: https://huggingface.co/IkerAzurmendi/act-pick-v3-1piece-9600
- Run con solo sesiones recientes: https://huggingface.co/IkerAzurmendi/act-pick-v3-recent-12000
- Generación anterior: https://huggingface.co/IkerAzurmendi/act-pick-v2-6000
- Librería LeRobot: https://github.com/huggingface/lerobot
- Paper del método ACT (Zhao et al., 2023): https://arxiv.org/abs/2304.13705
- Repositorio del brazo SO-101: https://github.com/TheRobotStudio/SO-ARM100
