# GinDuck/microduck-hill-climb-1m5-hill-1

## Resumen

`microduck-hill-climb-1m5-hill-1` es una política de control entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje ni de un modelo fundacional generativo, sino de una política neuronal especializada que traduce observaciones del robot (61 dimensiones) en acciones de control (14 dimensiones) a una frecuencia de 50 Hz. La publica el usuario GinDuck como primera contribución de una serie de experimentos de locomoción.

La política resuelve una tarea concreta: subir una rampa de forma estable y completar todas las ejecuciones. El autor la describe como una política "perpetua", es decir, un patrón de marcha que se ejecuta de forma continua hasta que se le indique lo contrario, y que se carga en una ranura de política del demonio de control del robot. El artefacto distribuido es un fichero ONNX con el normalizador de observaciones ya integrado, junto con un `manifest.json` que sigue el esquema 2 del manifiesto de políticas de microduck.

El interés de esta ficha es acotado: sirve como ejemplo reproducible de un pipeline de RL para robótica con Isaac Lab/mjlab, con instrucciones de entrenamiento y despliegue verificables. No hay información sobre licencia, idiomas ni benchmarks comparativos, y el repositorio tiene un tamaño de 0.0 GB, lo que sugiere que los pesos pueden no estar efectivamente subidos o que el contenido es mínimo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política neuronal para control robótico (red de política RL, detalles de capas no disponibles) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible; se distribuye como ONNX |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` |

Especificaciones adicionales del entorno de control:

| Parámetro | Valor |
|---|---|
| Dimensión de observación | 61 |
| Dimensión de acción | 14 |
| Frecuencia de control | 50 Hz |
| Tipo de política | perpetua (gait continuo) |
| Tarea de entrenamiento | `Mjlab-HillClimb1m5-MicroDuck` |
| Checkpoint | 750 |
| Semilla | 1 |

## Arquitectura y entrenamiento

La política se entrena con aprendizaje por refuerzo en simulación mediante mjlab (versión `mjlab-microduck 0.1.0`, commit `1efd853be`), el entorno de entrenamiento asociado al proyecto microduck de Pollen Robotics. La tarea `Mjlab-HillClimb1m5-MicroDuck` corresponde a subir una rampa de 1,5 metros. El entrenamiento se lanzó con 4096 entornos paralelos, un máximo de 3000 iteraciones del agente y semilla 1, registrando métricas en TensorBoard bajo el nombre de ejecución `hill-1`. El checkpoint publicado es el 750.

El repositorio de entrenamiento es `pollen-robotics/microduck-challenges`, rama `main`, commit `dc73b9237`, con dependencias fijadas mediante `uv.lock`. El autor advierte explícitamente que el proceso no es reproducible bit a bit entre máquinas: repetir el entrenamiento con el mismo código, comando y semilla produce una política comparable, no los mismos pesos. Esta es una característica conocida del RL con GPU (no determinismo de las operaciones en paralelo y de las reducciones en coma flotante).

El artefacto de despliegue integra el normalizador de observaciones dentro de `policy.onnx`, de modo que el robot puede alimentar observaciones en bruto sin preprocesado externo. El `manifest.json` sigue el esquema 2 documentado en `docs/policy-manifest.md` del repositorio del demonio de control.

## Capacidades

- Locomoción cuadrúpeda: genera patrones de marcha continuos para el robot microduck a 50 Hz.
- Subida de rampa: la tarea entrenada es ascender una rampa de 1,5 m de forma estable y completar todas las ejecuciones.
- Política perpetua: ejecuta el gait de forma indefinida hasta recibir una orden de parada o sustitución.
- Control reactivo: mapea observaciones de 61 dimensiones (estado del robot y del entorno, composición exacta no disponible) a 14 acciones de actuadores.
- Despliegue embebido: el normalizador va incluido en el ONNX, lo que simplifica la integración en el demonio.
- Carga por ranura: se integra en el sistema de ranuras de política del demonio mediante `robotctl policy load <slot>`.
- No dispone de tool calling, razonamiento multi-paso, capacidades multilingües ni visión: es una política de control, no un modelo generativo.

## Casos de uso

- Demostración de locomoción en rampa con microduck: cargar la política en una ranura y ejecutar el gait para validar que el robot asciende la rampa de 1,5 m de forma estable. Es adecuado porque la tarea entrenada es exactamente esa y el autor reporta finalización en todas las ejecuciones.
- Reproducción de un pipeline de RL para robótica: clonar `microduck-challenges` en el commit indicado, sincronizar con `uv` y lanzar el comando de entrenamiento con 4096 entornos para obtener una política comparable. Sirve como referencia docente o de validación de infraestructura.
- Punto de partida para fine-tuning o currículos de locomoción: usar esta política como inicialización o como baseline al entrenar tareas más difíciles (terrenos irregulares, pendientes mayores) en el mismo entorno mjlab.
- Pruebas de integración del demonio de control: verificar el flujo `robotctl policy load`, la compatibilidad del esquema 2 del manifiesto y la carga de un ONNX con normalizador embebido.
- Evaluación de robustez de políticas perpetuas: someter la política a perturbaciones externas o cambios de superficie para medir su tolerancia, dado que el gait está pensado para ejecutarse de forma continua.
- Benchmark interno de simulación a realidad: comparar el comportamiento en simulación (mjlab) con el del robot físico para calibrar la brecha sim-to-real en una tarea acotada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo indica cualitativamente que el robot "sube la rampa de forma estable y termina todas las ejecuciones"; no se aportan tasas de éxito numéricas, recompensas finales ni métricas de sim-to-real.

## Requisitos de hardware

- Inferencia en robot: el ONNX está pensado para ejecutarse en el propio microduck o en el equipo que aloja el demonio de control; el tamaño del repositorio es de 0.0 GB, lo que sugiere un modelo muy pequeño, aunque no se confirma el número de parámetros.
- VRAM estimada para inferencia: no disponible; por la naturaleza de la política (61 entradas, 14 salidas) es previsible que sea mínima, pero no hay dato confirmado.
- GPU recomendadas: no aplica para inferencia; para reentrenamiento, el comando usa 4096 entornos paralelos, lo que en la práctica requiere una GPU de datacenter (A100, H100 o similar), aunque el autor no especifica el hardware empleado.
- ¿Cabe en GPU de consumo? Para inferencia, muy probablemente sí en cualquier GPU o incluso CPU; para entrenamiento con 4096 entornos, no es realista en GPU de consumo.
- Opciones de despliegue: ONNX Runtime a través del demonio microduck (`robotctl`); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles; la política opera a 50 Hz, lo que fija un presupuesto de 20 ms por paso de control.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Observación / acción | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `GinDuck/microduck-hill-climb-1m5-hill-1` | Política RL (ONNX) | Subida de rampa 1,5 m | 61 / 14 a 50 Hz | no disponible | Hugging Face, 0 descargas |
| Otras políticas de `microduck-challenges` | Políticas RL | Tareas de locomoción variadas | Depende de la tarea | no disponible | Repositorio de Pollen Robotics |
| Políticas de referencia de cuadrúpedos comerciales (p. ej. Unitree, ANYmal) | Políticas RL propietarias o de investigación | Locomoción general | No comparable directamente | Propietaria o de investigación | No públicas en el mismo formato |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada, por lo que la comparación se limita a aspectos de formato, tarea y disponibilidad.

## Limitaciones y advertencias

- Ámbito muy restringido: es una política para una tarea concreta (rampa de 1,5 m) en un robot concreto (microduck); no generaliza a otros robots ni a otras tareas sin reentrenamiento.
- Sin licencia declarada: no se especifica licencia, por lo que el uso comercial y la redistribución quedan en un limbo legal hasta que el autor la defina.
- Sin datos de rendimiento: no hay tasas de éxito, recompensas ni métricas de robustez publicadas; la afirmación de que "termina todas las ejecuciones" es cualitativa y proviene del propio autor.
- Reproducibilidad limitada: el propio autor advierte que el entrenamiento no es reproducible bit a bit; los pesos no se pueden regenerar de forma idéntica.
- Riesgo de brecha sim-to-real: no se documenta validación en robot físico más allá de la afirmación de la model card; el comportamiento en hardware real puede diferir.
- Tamaño del repositorio de 0.0 GB: conviene verificar que los ficheros `policy.onnx` y `manifest.json` están efectivamente disponibles antes de integrar.
- Sin información sobre sesgos: al no ser un modelo de lenguaje, no aplican sesgos lingüísticos, pero sí posibles sesgos de simulación (condiciones de entrenamiento limitadas) que pueden reducir la generalización.
- Sin soporte multilingüe ni de texto: no es un modelo generativo; cualquier expectativa en ese sentido es un error de categoría.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-hill-climb-1m5-hill-1
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Commit de entrenamiento: `dc73b9237` en `pollen-robotics/microduck-challenges`
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del demonio de control (no se proporciona URL directa)
