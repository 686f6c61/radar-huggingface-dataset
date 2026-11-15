# scott-ml/microduck-sprint-2m-run-1114-1703

## Resumen

`microduck-sprint-2m-run-1114-1703` es una política de control motriz entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto MicroDuck de Pollen Robotics. No es un modelo de lenguaje: es un controlador neuronal que recibe observaciones de 61 dimensiones del estado del robot y emite 14 acciones de control a 50 Hz, empaquetado en formato ONNX para su ejecución directa sobre el hardware. El autor es `scott-ml`, que publica esta política como parte de una serie de experimentos de locomoción sobre el simulador mjlab.

El objetivo declarado de esta política concreta es maximizar la velocidad de desplazamiento ("sprint"), sacrificando deliberadamente parte de la calidad de la marcha (menor énfasis en levantar los pies). Se trata de una política perpetua: una vez cargada en una ranura del demonio `robotctl`, el robot la ejecuta de forma continua hasta que se le indique lo contrario.

El modelo tiene relevancia para la comunidad de robótica de bajo coste porque demuestra un flujo de trabajo completo y reproducible (entrenamiento en GPU, exportación a ONNX, despliegue embebido) sobre una plataforma abierta de pequeño tamaño. Sin embargo, la información pública es muy escasa: el repositorio pesa 0,0 GB según Hugging Face, no se declara licencia, idiomas ni métricas de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política neuronal de RL, formato ONNX; arquitectura interna no documentada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; control reactivo por paso, 61-D de observación) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |

Otros datos operativos: frecuencia de control de 50 Hz, 14 acciones de salida, normalizador de observaciones embebido en el propio ONNX (se alimenta con observaciones en bruto).

## Arquitectura y entrenamiento

La arquitectura interna de la red no está documentada en la model card. Se sabe que es una política de aprendizaje por refuerzo entrenada en el simulador mjlab con el paquete `mjlab-microduck 0.1.0` (commit base `1efd853be`), dentro del repositorio `microduck-challenges` del autor `spowers42` (rama `main`, commit `4e24e999b`). El entrenamiento se realizó con 4096 entornos paralelos, un máximo de 3000 iteraciones del agente, semilla 1 y registros en TensorBoard, partiendo del checkpoint 750. La tarea se identifica como `Mjlab-Sprint2m-MicroDuck`.

El autor advierte explícitamente que el proceso no es reproducible bit a bit entre máquinas: repetir el entrenamiento con el mismo código, `uv.lock`, comando y semilla produce una política comparable pero no idéntica. El pipeline de exportación a ONNX incluye el normalizador de observaciones dentro del grafo, de modo que el consumidor final no necesita replicar la normalización por separado. No se detallan en la información disponible la composición del dataset (generado por simulación), la función de recompensa ni si se aplicaron técnicas de ajuste posteriores.

## Capacidades

- Locomoción cuadrúpeda continua sobre el robot MicroDuck, ejecutada como política perpetua hasta recibir una orden de parada o reemplazo.
- Control reactivo a 50 Hz a partir de observaciones de 61 dimensiones (estado propioceptivo del robot).
- Generación de 14 comandos de actuación por paso de control.
- Marcha orientada a velocidad ("sprint"), con menor prioridad en la elevación de los pies durante el ciclo de marcha.
- Despliegue directo en hardware mediante `robotctl policy load <slot> scott-ml/microduck-sprint-2m-run-1114-1703`.
- Inferencia autocontenida en ONNX con normalización integrada.
- No dispone de tool calling, razonamiento multi-paso, capacidades multilingües, visión, audio ni modo de pensamiento: no es un modelo generativo.

## Casos de uso

- Locomoción rápida en competiciones o demos de MicroDuck: la política está optimizada explícitamente para maximizar la velocidad, por lo que es adecuada para pruebas cronometradas de desplazamiento en línea recta o circuitos amplios.
- Validación de la pila de simulación mjlab: sirve como referencia para comparar políticas entrenadas con distintos hiperparámetros o semillas sobre la misma tarea `Mjlab-Sprint2m-MicroDuck`.
- Pruebas de integración del demonio `robotctl`: al ser una política perpetua con manifiesto schema 2, permite verificar la carga, el cambio de ranura y la ejecución continua en el robot real.
- Investigación en transferencia sim-a-real de bajo coste: el flujo simulación (4096 entornos) → ONNX → hardware embebido es replicable y sirve de plantilla para experimentos con otros robots pequeños.
- Benchmarking de robustez de la marcha: al priorizar velocidad sobre la elevación de pies, es útil para estudiar el compromiso entre rapidez y estabilidad en terrenos lisos frente a irregulares.
- Docencia y prototipado en robótica de refuerzo: el repositorio de entrenamiento público y el comando de reproducción permiten a estudiantes reentrenar y comparar políticas con recursos de GPU moderados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de velocidad, estabilidad, tasa de caídas ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,0 GB y el modelo se ejecuta en formato ONNX, por lo que se espera un consumo muy reducido, pero no se publican cifras.
- GPU recomendadas: no disponible para inferencia; para reentrenamiento, el comando del autor usa 4096 entornos paralelos en GPU, sin especificar el modelo de tarjeta.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ejecución en el robot mediante `robotctl policy load`; el artefacto es un `policy.onnx` que puede cargarse con cualquier runtime ONNX compatible, aunque no se documentan alternativas oficiales.
- Latencia y throughput: frecuencia de control fijada en 50 Hz (20 ms por paso); no se publican latencias medidas ni throughput.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas de MicroDuck ni modelos comparables de la misma categoría con datos de parámetros, contexto o rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se puede asumir permiso para uso comercial, redistribución o modificación; es necesario contactar con el autor antes de cualquier uso en producción.
- Entrenada específicamente para velocidad con menor énfasis en levantar los pies, lo que puede degradar la estabilidad en terrenos irregulares o con obstáculos.
- Política perpetua: una vez cargada, el robot sigue ejecutando la marcha hasta que se le indique lo contrario; requiere supervisión y un mecanismo de parada fiable.
- No reproducible bit a bit: los pesos no pueden regenerarse de forma idéntica, lo que complica la auditoría y la depuración de comportamientos.
- Sin métricas publicadas de robustez, tasa de caídas o transferencia sim-a-real; el rendimiento en el robot físico no está cuantificado.
- Información mínima en la model card: no se documentan arquitectura interna, número de parámetros, composición del entrenamiento ni sesgos conocidos.
- Ámbito de aplicación muy restringido: solo válida para el robot MicroDuck con la interfaz de observación/acción (61-D/14) y la frecuencia de 50 Hz especificadas.
- Riesgo de comportamiento indeseado fuera de las condiciones de simulación (fricción, terreno, desgaste mecánico) sin garantías de seguridad certificadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/scott-ml/microduck-sprint-2m-run-1114-1703
- Repositorio de entrenamiento: https://github.com/spowers42/microduck-challenges
- Repositorio del robot MicroDuck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas (`docs/policy-manifest.md` en el repositorio del demonio): no disponible como enlace directo en la información proporcionada.
