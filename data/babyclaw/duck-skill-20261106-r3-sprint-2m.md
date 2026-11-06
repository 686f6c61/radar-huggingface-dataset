# BabyClaw/duck-skill-20261106-r3-sprint-2m

## Resumen

Duck Skill Sprint R3 es una política de control para robótica entrenada mediante aprendizaje por refuerzo, publicada por el usuario BabyClaw en Hugging Face bajo la librería `microduck`. Se trata de un artefacto de inferencia en formato ONNX que mapea 61 observaciones a 14 acciones, diseñado específicamente para la tarea de locomoción "sprint" (carrera) dentro del ecosistema MicroDuck de Pollen Robotics. No es un modelo de lenguaje: es un controlador de política (policy) para un agente físico simulado o real.

El modelo se enmarca en un evento de competición denominado MicroDuck Arena, donde distintas políticas compiten por la mejor puntuación oficial en la tarea `sprint-2m`. La política presentada fue seleccionada mediante un proceso de búsqueda denominado "feedback-compensated affine policy search" a partir de un actor previo (Sprint actor), y según la model card superó las 50 auditorías de arranque frescas. El repositorio tiene un tamaño de 0.0 GB, lo que sugiere un artefacto muy ligero, coherente con una política de red neuronal pequeña exportada a ONNX para inferencia en CPU.

La relevancia de este modelo es acotada y específica: sirve como referencia para investigadores que trabajan en RL aplicado a robótica de bajo coste (el ecosistema MicroDuck de Pollen Robotics) y como ejemplo de pipeline de selección de políticas con trazabilidad criptográfica (hashes SHA-256 de política, manifiesto y evidencias de evaluación). No obstante, la información pública es extremadamente escasa: no se detallan la arquitectura de red, el número de parámetros, los datos de entrenamiento ni la licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (política de red neuronal exportada a ONNX; topología interna no especificada) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje; entrada fija de 61 observaciones) |
| Tipos de cuantizacion | No disponible (formato ONNX; cuantización no especificada) |
| Idiomas soportados | No aplica (modelo de robótica, no lingüístico) |
| Licencia | No disponible |
| Formato de pesos | ONNX (archivo `best.onnx`) |

## Arquitectura y entrenamiento

La información disponible no especifica la arquitectura interna de la red neuronal. Lo que sí se documenta es que se trata de una política de control con 61 observaciones de entrada y 14 acciones de salida, exportada a ONNX para inferencia en CPU. El pipeline declarado es `robotics` y la librería `microduck`, lo que sitúa el artefacto dentro del framework de simulación/control MicroDuck asociado a Pollen Robotics.

El entrenamiento se describe como "feedback-compensated affine policy search" a partir de un actor Sprint previamente enviado. El proceso de selección es notablemente riguroso en cuanto a trazabilidad: se exige que las 110 ejecuciones de desarrollo, las 40 de post-búsqueda y las 5 oficiales finalicen correctamente, y se elige la media de desarrollo más baja entre los candidatos completos que mejoran la puntuación oficial. La selección se congela antes de una auditoría final fresca sobre las semillas 500001-500050, reservadas y no tocadas antes del congelado. Se documentan hashes SHA-256 de la política, del manifiesto de selección, del log de búsqueda, de la configuración y de las evaluaciones de desarrollo y post-búsqueda. No se detalla el número de tokens, la composición del dataset ni si hubo RLHF/DPO, ya que no es un modelo de lenguaje.

## Capacidades

- Control de locomoción tipo "sprint" (carrera) para el agente MicroDuck, con 14 acciones de control.
- Inferencia en CPU mediante ONNX, sin necesidad de GPU.
- Política determinista de mapeo observación → acción (61 → 14).
- Integración en el ecosistema MicroDuck y en la Arena de Pollen Robotics para evaluación oficial.
- Trazabilidad criptográfica completa del proceso de selección (hashes de política, configuración, logs y evidencias).
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües ni modos de razonamiento: no es un modelo de lenguaje.

## Casos de uso

- Evaluación comparativa en la MicroDuck Arena: la política puede enviarse al evento `sprint-2m` del Space de Pollen Robotics para medir su puntuación oficial frente a otras políticas, usando la infraestructura de evaluación estandarizada de la Arena.
- Baseline para investigación en RL de robótica de bajo coste: sirve como punto de partida reproducible (con hashes verificables) para experimentos de búsqueda de políticas sobre el actor Sprint.
- Reproducción de pipelines de selección de políticas: el manifiesto `selection.json` y los hashes documentados permiten auditar y reproducir el criterio de selección (110 desarrollo + 40 post-búsqueda + 5 oficiales) en otros experimentos.
- Despliegue en hardware embebido o de bajo consumo: al ser ONNX con inferencia en CPU y un repositorio de 0.0 GB, es adecuado para ejecutarse en dispositivos sin GPU dentro de simulaciones o robots MicroDuck.
- Docencia y demostración de RL aplicado: permite ilustrar el ciclo completo de entrenamiento, selección congelada y auditoría fresca sobre semillas reservadas, con evidencia verificable.
- Integración en pipelines de CI para políticas robóticas: los hashes SHA-256 permiten verificar la integridad de la política antes de desplegarla en un entorno de simulación o en un robot físico.

## Benchmarks y rendimiento

Los datos de evaluación disponibles en la model card son los siguientes (puntuaciones locales indicativas; la Arena mide el resultado oficial):

| Metrica | Valor |
|---|---|
| Puntuación de desarrollo (score) | 3.0791363636363633 |
| Velocidad (speed) | 0.35 |
| Éxitos / total en desarrollo | 110 / 110 |
| Puntuación oficial | 3.043 |
| Éxitos post-búsqueda | 40 |
| Media post-búsqueda (s) | 3.08625 |
| Generación de búsqueda | 44 |
| Auditoría final fresca | 50 arranques (según model card) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) porque no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; la inferencia es en CPU mediante ONNX.
- GPU recomendadas: no se requiere GPU; cualquier CPU capaz de ejecutar ONNX Runtime es suficiente.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU, dado el tamaño del repositorio (0.0 GB).
- Opciones de despliegue: ONNX Runtime (CPU); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables).
- Latencia y throughput estimados: no disponibles; la model card solo reporta una velocidad de 0.35 y una media post-búsqueda de 3.08625 s por ejecución en el contexto de evaluación.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otras políticas MicroDuck comparables con especificaciones públicas (parámetros, contexto, rendimiento, licencia) para establecer una comparativa rigurosa. La referencia más cercana es la política previa (`previous_submitted_sha256: 18009970...`), de la que esta deriva, pero no se ofrecen sus métricas completas para comparar.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; al ser una política de control entrenada por RL, puede heredar sesgos del simulador y de la distribución de entrenamiento, pero no se documentan.
- Riesgo de sobreajuste al entorno de evaluación: la propia model card advierte que las puntuaciones locales son indicativas y que la Arena mide el resultado oficial; el rendimiento en el mundo real puede diferir.
- Limitaciones de contexto o idioma: no aplica (no es un modelo lingüístico); la entrada está fija a 61 observaciones.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede confirmar el uso comercial; se recomienda contactar con el autor antes de cualquier despliegue productivo.
- Caveat para producción: el artefacto es una política específica para la tarea `sprint-2m` del ecosistema MicroDuck; no es un modelo general y no debe reutilizarse fuera de ese dominio sin reentrenamiento.
- Trazabilidad: aunque se documentan hashes, el campo `frozen_timeline_sha256` es `null`, lo que puede afectar a la reproducibilidad completa de la línea temporal de selección.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BabyClaw/duck-skill-20261106-r3-sprint-2m
- Evento Arena (MicroDuck, sprint-2m): https://huggingface.co/spaces/pollen-robotics/microduck-arena#/e/sprint-2m
- Space de la Arena MicroDuck: https://huggingface.co/spaces/pollen-robotics/microduck-arena
