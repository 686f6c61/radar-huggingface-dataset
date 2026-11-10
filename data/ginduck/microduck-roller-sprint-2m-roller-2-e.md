# GinDuck/microduck-roller-sprint-2m-roller-2-e

## Resumen

`microduck-roller-sprint-2m-roller-2-e` es una política de control entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck de Pollen Robotics. No es un modelo de lenguaje: es un checkpoint de una política de locomoción que produce acciones motoras a partir de observaciones del robot, empaquetada en formato ONNX para su despliegue directo sobre hardware. El autor, GinDuck, la publica como parte de su segunda tanda de experimentos ("roller run") sobre el banco de pruebas `microduck-challenges`.

La política implementa un patrón de marcha ("sprint") sobre ruedas: abandona la técnica de patinaje de checkpoints anteriores y prioriza velocidad, completando cada episodio de entrenamiento en aproximadamente 1,5 segundos. Es una política de tipo "perpetuo", es decir, no está acotada a una tarea finita sino que se ejecuta de forma continua hasta que se le ordena detenerse, y se carga en una ranura de política del daemon `robotctl` del robot.

El interés de esta ficha es acotado: se trata de un artefacto de investigación con cero descargas y cero likes en el momento de su publicación, sin model card extendida, sin benchmarks públicos y sin licencia declarada. Es relevante únicamente para quien trabaje con el ecosistema microduck o con políticas RL de locomoción en simulación (mjlab) y quiera reproducir o comparar recetas de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control entrenada por RL (red neuronal, detalles no disponibles); empaquetada como grafo ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de observación de 61 dimensiones por paso |
| Tipos de cuantizacion | no disponible; se distribuye en ONNX (normalizador de observaciones integrado en `policy.onnx`) |
| Idiomas soportados | no aplica (modelo de robótica, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` con esquema 2 del manifiesto de políticas microduck |
| Frecuencia de control | 50 Hz |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Tarea de entrenamiento | `Mjlab-RollerSprint2m-MicroDuck` |
| Checkpoint | 5000 |
| Semilla | 1 |
| Entornos paralelos | 2048 |
| Iteraciones maximas | 6000 |
| Base de simulacion | `mjlab-microduck 0.1.0 @ 1efd853be` |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red neuronal (número de capas, anchura, activaciones ni tipo de política, p. ej. MLP o red recurrente). Lo que sí se documenta es el pipeline: la política se entrena con `mjlab` (entorno de RL sobre MuJoCo) usando el repositorio `pollen-robotics/microduck-challenges`, rama `race-2`, commit `b44f7ffc9`. El entrenamiento emplea 2048 entornos simulados en paralelo, hasta 6000 iteraciones, semilla 1 y registro en TensorBoard bajo el nombre de ejecución `roller-2`, con la receta compartida por el usuario TheSauceman. El checkpoint publicado corresponde al paso 5000.

Un detalle técnico relevante es que el normalizador de observaciones está embebido dentro de `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo sin preprocesar. El autor advierte explícitamente que el entrenamiento no es bit-reproducible entre máquinas: repetir el comando con el mismo `uv.lock`, código y semilla produce una política comparable pero no idéntica. La política se describe como "perpetua": no tiene condición de terminación propia y se ejecuta de forma continua como patrón de marcha cargado en una ranura del daemon `robotctl`. No se especifican datos sobre volumen de simulación total, recompensas, currículo de entrenamiento ni uso de RLHF/DPO (no aplicable en este dominio).

## Capacidades

- Locomoción bípeda/cuadrúpeda sobre ruedas del robot microduck: genera 14 acciones motoras a 50 Hz a partir de 61 observaciones.
- Marcha de tipo "sprint" orientada a velocidad, sin patinaje, con episodios de aproximadamente 1,5 segundos en simulación.
- Ejecución perpetua: mantiene la política activa de forma continua hasta recibir una orden de parada.
- Despliegue directo sobre hardware mediante el comando `robotctl policy load`, cargando la política en una ranura del daemon.
- Inferencia autocontenida: normalización de observaciones integrada en el grafo ONNX, sin pasos de preprocesado externos.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, visión, audio ni capacidades multilingües: es exclusivamente una política motora.

## Casos de uso

- Investigación en locomoción RL sobre microduck: cargar la política en una ranura de `robotctl` para comparar el patrón "sprint" frente a checkpoints previos de patinaje del mismo autor y medir velocidad y estabilidad en hardware real.
- Reproducción de experimentos: clonar `microduck-challenges` en el commit `b44f7ffc9`, sincronizar con `uv` y relanzar el entrenamiento con la misma semilla para estudiar la variabilidad entre ejecuciones de RL en GPU.
- Benchmark interno de recetas de entrenamiento: usar la receta de TheSauceman como línea base frente a otras configuraciones de recompensa o número de entornos paralelos (2048 en este caso).
- Validación de pipelines de despliegue: probar el flujo completo de `manifest.json` (esquema 2) y `policy.onnx` en el daemon del robot antes de integrar políticas propias en producción.
- Docencia y demos de RL aplicado a robótica: el modelo es un artefacto pequeño y autocontenido que ilustra el ciclo simulación-a-realidad en un robot de bajo coste.
- Pruebas de robustez en banco: ejecutar la política de forma perpetua sobre superficies con ruedas para caracterizar deriva, consumo y comportamiento ante perturbaciones externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica aportada por el autor es que cada episodio de entrenamiento se completa en aproximadamente 1,5 segundos, sin comparación con otras políticas ni datos de velocidad, distancia recorrida, tasa de caídas o transferencia sim-a-real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB, lo que sugiere un grafo ONNX muy pequeño (política de control, no un modelo generativo). Cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no aplica para inferencia; para reentrenar, el autor usa 2048 entornos paralelos en `mjlab`, lo que requiere una GPU de datacenter (A100/H100) o, como mínimo, una GPU consumer de gama alta con suficiente memoria para el simulador y los buffers de RL.
- Cabe en GPU consumer: sí, para inferencia en cualquier GPU o CPU; para entrenamiento, depende del número de entornos y de la implementación de `mjlab`.
- Opciones de despliegue: ONNX Runtime (formato nativo `policy.onnx`) y el daemon `robotctl` del ecosistema microduck mediante `sudo robotctl policy load <slot> GinDuck/microduck-roller-sprint-2m-roller-2-e`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables).
- Latencia y throughput: no disponibles; el control opera a 50 Hz, por lo que la inferencia debe completarse por debajo de 20 ms por paso, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Observaciones / acciones | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GinDuck/microduck-roller-sprint-2m-roller-2-e | Política RL (ONNX) | 61 / 14 | 50 Hz | no disponible | Hugging Face (0 descargas) |
| Otros checkpoints del mismo autor ("roller run") | Política RL (ONNX) | 61 / 14 (presumiblemente) | 50 Hz (presumiblemente) | no disponible | Hugging Face |
| Políticas de referencia de `microduck-challenges` | Política RL | no disponible | no disponible | según repositorio | GitHub |

No se dispone de datos de rendimiento comparativo entre estas alternativas; la comparación se limita a formato, interfaz y procedencia.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se puede asumir uso comercial ni redistribución; hay que contactar con el autor antes de cualquier uso fuera de investigación personal.
- Model card mínima: sin detalles de arquitectura de red, recompensas, distribución de entrenamiento ni evaluación en hardware real.
- Cero descargas y cero likes en el momento de la publicación: sin validación externa de la comunidad.
- Entrenamiento no bit-reproducible: el propio autor advierte que repetir la receta produce pesos distintos, lo que dificulta la auditoría exacta del checkpoint.
- Política "perpetua" sin condición de parada propia: en despliegue requiere supervisión y un mecanismo externo de parada para evitar ejecuciones indefinidas.
- Especializada en una tarea concreta (sprint sobre ruedas): no generaliza a otras morfologías, tareas ni robots sin reentrenamiento.
- Riesgo de brecha sim-a-real no cuantificado: no se publican métricas de transferencia al robot físico.
- Sin soporte lingüístico ni de razonamiento: no debe evaluarse con criterios de modelos de lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-roller-sprint-2m-roller-2-e
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas (`docs/policy-manifest.md` en el repositorio del daemon): no se proporciona URL directa en la información disponible.
