# GinDuck/microduck-sock-heist-6m-continue-2-b

## Resumen

microduck-sock-heist-6m-continue-2-b es una política de control entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje ni de un modelo generativo multimodal, sino de una política de locomoción y manipulación que mapea observaciones de 61 dimensiones a 14 acciones de control a 50 Hz. El autor, GinDuck, la publica como el último checkpoint de su segunda ejecución del reto "sock heist", en el que el robot debe sortear guardias y apoderarse de un calcetín sin ser detectado.

El modelo se distribuye en formato ONNX dentro de un repositorio que sigue el manifiesto de políticas de microduck (esquema 2). La política es perpetua: se ejecuta de forma continua como una marcha cargada en una ranura de política del daemon del robot, y según el autor completa cada episodio en aproximadamente 9,5 segundos. El normalizador de observaciones está integrado en el propio `policy.onnx`, de modo que la política consume observaciones en bruto.

Es relevante ahora porque ejemplifica el flujo de trabajo de extremo a extremo para políticas robóticas reproducibles sobre hardware de bajo coste: entrenamiento con mjlab sobre 4096 entornos paralelos, publicación del checkpoint con metadatos de reproducibilidad (commit, semilla, versión base) y despliegue directo en el robot mediante una única orden. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se dispone de información sobre licencia ni idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo para control robótico (red neuronal; arquitectura interna no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política de control; ventana de observación de 61 dimensiones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`), más `manifest.json` con esquema 2 del manifiesto de políticas de microduck |

## Arquitectura y entrenamiento

La política se entrena con mjlab (entorno de aprendizaje por refuerzo basado en MuJoCo) sobre la tarea `Mjlab-SockHeist6m-MicroDuck`, definida en el repositorio `pollen-robotics/microduck-challenges`, rama `sock-continue-2`, commit `10ba3a426`. El entrenamiento parte de la base `mjlab-microduck 0.1.0 @ 1efd853be` y se ejecuta con 4096 entornos paralelos, un máximo de 1000 iteraciones, semilla 1 y registro en TensorBoard. El checkpoint publicado corresponde a la iteración 999.

La interfaz de control es concreta: 61 dimensiones de observación y 14 acciones a 50 Hz, con el normalizador de observaciones embebido en el modelo ONNX exportado. El autor advierte que el entrenamiento no es bit-reproducible entre máquinas: repetir el mismo comando con la misma semilla produce una política comparable, no idéntica. No se dispone de información sobre el número de tokens, la composición del dataset (en este caso, distribución de escenarios de simulación) ni sobre el uso de técnicas de ajuste fino como RLHF o DPO, que no aplican a este tipo de modelo.

## Capacidades

- Locomoción y control de un robot cuadrúpedo microduck a 50 Hz mediante una política perpetua.
- Ejecución de la tarea "sock heist": sortear guardias y recoger un calcetín sin ser detectado.
- Completar cada episodio en aproximadamente 9,5 segundos, según el autor.
- Consumo de observaciones en bruto gracias al normalizador integrado en el ONNX.
- Despliegue directo en el robot mediante `robotctl policy load <slot> GinDuck/microduck-sock-heist-6m-continue-2-b`.
- No soporta tool calling, function calling, razonamiento multi-paso, capacidades multilingües ni modos de pensamiento: no es un modelo de lenguaje.

## Casos de uso

- Despliegue en el robot microduck para demostrar la tarea "sock heist": se carga la política en una ranura del daemon y el robot ejecuta la marcha de forma continua; es adecuado porque el checkpoint está exportado en ONNX con el normalizador integrado y sigue el manifiesto de políticas del daemon.
- Reproducción de experimentos de aprendizaje por refuerzo: el autor documenta commit, semilla, versión base y comando exacto, lo que permite reentrenar una política comparable para estudiar la varianza entre ejecuciones.
- Evaluación de pipelines de simulación a realidad: sirve como referencia para medir cuánto se degrada una política entrenada en mjlab con 4096 entornos al transferirse al robot físico.
- Docencia y divulgación en robótica de bajo coste: el modelo y el reto asociado permiten mostrar el ciclo completo de entrenamiento, exportación y despliegue en un cuadrúpedo asequible.
- Pruebas de integración del daemon de microduck: al seguir el esquema 2 del manifiesto de políticas, se puede usar como caso de prueba para validar la carga de políticas y la interfaz de observación-acción.
- Punto de partida para ajuste fino: al ser un checkpoint "continue-2", puede servir como inicialización para variantes de la tarea o para experimentar con recompensas alternativas en `microduck-challenges`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento aportado por el autor es que la política completa cada episodio en aproximadamente 9,5 segundos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB, por lo que el modelo ONNX es muy pequeño y previsiblemente cabe en cualquier GPU consumer, aunque no se confirma el dato.
- GPU recomendadas: no disponible para inferencia; para reentrenar se requiere una GPU capaz de ejecutar mjlab con 4096 entornos paralelos (el autor no especifica el modelo de GPU utilizado).
- Cabe en GPU consumer: probablemente sí, dado el tamaño del repositorio, pero no se dispone de confirmación.
- Opciones de despliegue: el daemon de microduck mediante `robotctl policy load`; el formato ONNX permite inferencia con ONNX Runtime, aunque no se documenta en la información disponible.
- Latencia y throughput estimados: no disponibles; la política opera a 50 Hz sobre el robot.

## Comparativa con modelos similares

No disponible. No se han proporcionado modelos comparables de la misma categoría (políticas de control para microduck) en la información disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no admite tool calling ni capacidades multilingües.
- La licencia no está disponible, por lo que no se puede confirmar si el uso comercial está permitido.
- El entrenamiento no es bit-reproducible: repetir la ejecución con la misma semilla produce una política comparable, no idéntica.
- El rendimiento descrito (9,5 segundos por episodio) procede del autor y no está respaldado por benchmarks públicos ni por una evaluación independiente.
- El modelo está entrenado específicamente para la tarea "sock heist" en simulación; su transferencia al robot físico y a otras tareas no está documentada.
- No se dispone de información sobre sesgos, riesgo de alucinación ni limitaciones de contexto, por no aplicar a este tipo de modelo.
- El repositorio no registra descargas ni likes, y la fecha de creación indicada (2026-11-05) es futura respecto a la información habitual de publicación, lo que conviene verificar antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-sock-heist-6m-continue-2-b
- Repositorio microduck: https://github.com/pollen-robotics/microduck
- Repositorio de retos microduck: https://github.com/pollen-robotics/microduck-challenges
- Manifiesto de políticas (referencia en el repositorio del daemon): `docs/policy-manifest.md`
