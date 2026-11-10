# JackDH/microduck-roller-sprint-20261110-best

## Resumen

`microduck-roller-sprint-20261110-best` es una política de control entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de bajo coste microduck, desarrollado por Pollen Robotics. El modelo no es un modelo de lenguaje: es una política perpetua que mapea observaciones de 61 dimensiones a 14 acciones de control a 50 Hz, pensada para ejecutar una marcha (gait) sobre ruedas en el robot físico. Lo publica el usuario JackDH bajo el identificador `JackDH/microduck-roller-sprint-20261110-best`.

La relevancia es acotada pero concreta: se trata de un artefacto reproducible de robótica con refuerzo, empaquetado en ONNX con el normalizador de observaciones embebido y un manifiesto conforme al esquema 2 del daemon de microduck, lo que permite cargarlo directamente en una ranura de política del robot con un solo comando. El autor reporta que el checkpoint 500 completó las cinco carreras locales en 2,993 s de media, en simulación.

No hay información pública sobre arquitectura de red, número de parámetros, licencia ni idiomas soportados. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño declarado de 0,0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL empaquetada como ONNX; arquitectura de red no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política reactiva de 61-D de observación, sin ventana de contexto) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de control robótico, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red neuronal. Se sabe que es una política de aprendizaje por refuerzo entrenada con el framework `mjlab` (versión `mjlab-microduck 0.1.0`, commit `1efd853be`) sobre la tarea `Mjlab-RollerSprint2m-MicroDuck`, con 4096 entornos paralelos, un máximo de 3000 iteraciones, semilla 1 y registro en TensorBoard bajo el nombre `roller-baseline-20261110`. El entrenamiento se ejecutó en una RTX 4090 con la receta estándar de Roller Sprint y se seleccionó el checkpoint 500.

El modelo se distribuye como política perpetua: se ejecuta de forma continua hasta que se le indique lo contrario y se carga en una ranura de política del daemon del robot. El normalizador de observaciones está embebido dentro de `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo (61 dimensiones) y el propio grafo aplica la normalización. Las acciones son 14 y el bucle de control corre a 50 Hz. El autor advierte que el entrenamiento no es bit-reproducible entre máquinas: repetir el pipeline con el mismo código, `uv.lock`, comando y semilla produce una política comparable, no idéntica.

## Capacidades

- Control locomotor sobre ruedas del robot microduck: genera 14 acciones de control a 50 Hz a partir de 61 observaciones.
- Marcha perpetua: la política se ejecuta de forma continua hasta recibir una orden de parada o sustitución.
- Despliegue directo en hardware mediante el daemon `robotctl` (carga en ranura de política).
- Inferencia autocontenida: normalización de observaciones incluida en el grafo ONNX.
- Ejecución en tiempo real compatible con el bucle de control del robot (50 Hz).
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: es una política de control, no un modelo generativo.

## Casos de uso

- Investigación en locomoción con refuerzo: servir como línea base reproducible para comparar recetas de entrenamiento sobre microduck, dado que el autor documenta tarea, commit, semilla y comando exactos.
- Demostración de carreras de sprint sobre ruedas: el checkpoint 500 reporta 2,993 s de media en las cinco carreras locales, útil como referencia de rendimiento en simulación.
- Validación de pipelines de despliegue sim-to-real: la política se carga con `robotctl policy load <slot> ...` y consume observaciones en crudo, lo que simplifica la integración con el daemon.
- Benchmarking de hardware de entrenamiento: la receta (4096 entornos, 3000 iteraciones, RTX 4090) sirve para medir tiempos de entrenamiento en RL masivo paralelo.
- Educación y prototipado en robótica de bajo coste: microduck es una plataforma asequible y esta política ilustra el flujo completo desde entrenamiento hasta ejecución en robot.
- Base para fine-tuning o continuación de entrenamiento: al estar empaquetada como ONNX con manifiesto, puede integrarse en pipelines propios de evaluación o servir de inicialización para variantes de la tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no es un modelo de lenguaje. El único dato de rendimiento reportado por el autor es el siguiente:

| Metrica | Valor |
|---|---|
| Tiempo medio en cinco carreras locales (checkpoint 500) | 2,993 s |
| Entorno de evaluacion | Simulacion (no robot fisico) |
| Frecuencia de control | 50 Hz |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio se declara como 0,0 GB y no se documenta el número de parámetros, por lo que no puede estimarse con rigor.
- GPU recomendadas: no aplica para inferencia en robot (la política corre en el hardware del microduck); para reentrenamiento, el autor usó una RTX 4090.
- Cabe en GPU consumer: sí para entrenamiento según el autor (RTX 4090); para inferencia, el destino es el propio robot.
- Opciones de despliegue: ONNX Runtime (formato `policy.onnx`) y el daemon `robotctl` de microduck con el manifiesto de esquema 2. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: el bucle de control opera a 50 Hz (20 ms por ciclo); no se publican cifras de latencia de inferencia por paso.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas comparables para microduck ni datos de modelos alternativos de la misma categoría.

## Limitaciones y advertencias

- Validación solo en simulación: el autor indica explícitamente "Simulation only"; no hay evidencia publicada de transferencia al robot físico.
- Licencia no disponible: no se puede asumir uso comercial ni redistribución sin consultar al autor.
- Reproducibilidad limitada: el propio autor advierte que el entrenamiento RL no es bit-reproducible entre máquinas; repetir la receta da una política comparable, no idéntica.
- Sin documentación de arquitectura ni de parámetros: dificulta auditoría, estimación de recursos y comparación técnica.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin validación externa conocida.
- Alcance restringido: es una política perpetua para una tarea concreta (Roller Sprint) sobre una plataforma concreta (microduck); no generaliza a otras tareas ni robots.
- Sin información sobre sesgos, alucinación o comportamiento fuera de distribución: no aplica el marco de modelos generativos, pero tampoco se documentan límites de robustez ante perturbaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JackDH/microduck-roller-sprint-20261110-best
- Repositorio de retos y entrenamiento: https://github.com/JackDanHollister/microduck-challenges
- Proyecto microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Esquema del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (referenciado en la model card, sin URL directa disponible)
