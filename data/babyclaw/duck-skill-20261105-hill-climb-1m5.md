# BabyClaw/duck-skill-20261105-hill-climb-1m5

## Resumen

Duck Skill Hill Climb es una política de control robótico entrenada mediante aprendizaje por refuerzo y búsqueda de políticas, derivada de los pesos de referencia de Pollen Robotics para el robot simulado MicroDuck. No es un modelo de lenguaje: es una política de control que mapea 61 observaciones del entorno a 14 acciones de actuación, empaquetada en formato ONNX para inferencia en CPU. El modelo ha sido seleccionado mediante un proceso de búsqueda por ascenso de colinas (hill climbing) sobre 45 arranques de desarrollo y validado en arranques finales separados, con una puntuación local de 3,037 frente a una puntuación oficial de 3,046 en el evento Arena de Pollen Robotics.

El modelo pertenece a la familia de habilidades MicroDuck, un entorno de simulación de robótica con patas orientado a la investigación en control y aprendizaje por refuerzo. Su relevancia radica en que ejemplifica un flujo de trabajo de búsqueda de políticas asistida por evaluación automatizada, con trazabilidad criptográfica completa (hashes SHA-256 de la política, la selección y la evaluación) y procedencia documentada del modelo base. El repositorio es de tamaño mínimo (0,0 GB), lo que sugiere que los pesos son ligeros y adecuados para despliegue en entornos con recursos limitados.

La ficha se basa exclusivamente en la model card y los metadatos disponibles en Hugging Face. No se dispone de información sobre arquitectura interna de la red, datos de entrenamiento, licencia o idiomas, por lo que estos campos se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política para control robótico (detalles internos no disponibles); inferencia vía ONNX en CPU |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX |
| Observaciones de entrada | 61 |
| Acciones de salida | 14 |
| Pipeline | robotics |
| Librería | microduck |
| Tamaño del repositorio | 0,0 GB |
| SHA-256 de la política | `0a50f2f44ccea04c6aee79fee331fc8a6e827bc19596de2e0bd3bfb0d23f723a` |
| Modelo base | `pollen-robotics/microduck-hill-climb-1m5-reference` (revisión `d319208d92896353f581be754f6325d01f5e3732`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la red (número de capas, tipo de capas, función de activación, etc.). Se sabe que la política consume 61 observaciones y produce 14 acciones, y que se exporta a ONNX para inferencia en CPU. El proceso de entrenamiento se basa en un pipeline compartido de entrenamiento y búsqueda de políticas de Duck Skill, partiendo de los pesos de referencia de Pollen Robotics (`microduck-hill-climb-1m5-reference`).

La selección de la política se realizó mediante búsqueda por ascenso de colinas (hill climbing) sobre 45 arranques de desarrollo, con una generación identificada como 140 y un donante con SHA-256 `df33c9af0ab4b9303d17d0ac0ee0c3e1695936e00354bb6324bf6d8f766a96bc`. El vector de parámetros de la búsqueda contiene 28 valores numéricos. La evaluación local reporta 45 éxitos sobre 45 arranques (score 3,037), mientras que la puntuación oficial en el Arena es 3,046. Se indica que la evaluación final oficial es requerida (`requires_final_official_evaluation: true`). No se especifican el número de tokens, la composición del dataset ni si hubo RLHF o DPO, ya que no aplica a este tipo de política.

## Capacidades

- Control robótico simulado: genera 14 acciones de actuación a partir de 61 observaciones del entorno para la habilidad de ascenso de colinas (hill climb) del robot MicroDuck.
- Inferencia en CPU mediante ONNX, sin necesidad de GPU.
- Política especializada en una única tarea (slot `walk`, variante `hill-climb-1m5`), no es un modelo generalista.
- Trazabilidad completa: hashes SHA-256 de política, selección, evaluación y modelo base.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües, por su naturaleza de política de control.
- No dispone de modo de pensamiento (thinking mode), visión, audio ni generación de texto.

## Casos de uso

- Investigación en aprendizaje por refuerzo para robótica: la política sirve como punto de partida o referencia para experimentos de búsqueda de políticas en el entorno MicroDuck, gracias a su procedencia documentada y hashes verificables.
- Evaluación comparativa en el Arena de Pollen Robotics: el modelo puede someterse al evento oficial `hill-climb-1m5` para medir su rendimiento frente a otras políticas, con la puntuación oficial como métrica.
- Despliegue en simulación con recursos limitados: al ser ONNX y ejecutarse en CPU, puede integrarse en pipelines de simulación sin GPU, adecuado para entornos de CI o estaciones de trabajo modestas.
- Reproducibilidad de experimentos: los hashes y el manifiesto permiten verificar que la política evaluada es exactamente la misma que la desplegada, útil en estudios de reproducibilidad.
- Base para ajuste fino o continuación de búsqueda: al derivar de pesos de referencia, puede utilizarse como donante o punto de partida en nuevas generaciones de búsqueda por ascenso de colinas.
- Docencia y demostraciones de robótica simulada: política ligera y de inferencia rápida en CPU para ilustrar conceptos de control por refuerzo en entornos educativos.

## Benchmarks y rendimiento

| Métrica | Resultado local | Resultado oficial |
|---|---|---|
| Éxitos / arranques de desarrollo | 45 / 45 | no disponible |
| Puntuación (score) | 3,0371111111111113 | 3,0460000000000003 |
| Velocidad | 0,65 | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no aplican a este tipo de política de control. Los datos de la tabla corresponden a la evaluación local y oficial del evento Arena según la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; la inferencia es en CPU vía ONNX.
- GPU recomendadas: no se requieren; el modelo está diseñado para CPU.
- Cabe en GPU consumer: sí, aunque no es necesario; puede ejecutarse en CPU sin GPU.
- Opciones de despliegue: ONNX Runtime en CPU; la librería `microduck` para el pipeline de simulación.
- Latencia y throughput estimados: no disponibles; el tamaño del repositorio (0,0 GB) sugiere una política muy ligera, pero no se proporcionan cifras de latencia.

## Comparativa con modelos similares

| Modelo | Tipo | Observaciones / acciones | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BabyClaw/duck-skill-20261105-hill-climb-1m5 | Política de control MicroDuck | 61 / 14 | ONNX | no disponible | Hugging Face |
| pollen-robotics/microduck-hill-climb-1m5-reference | Política de referencia MicroDuck | no disponible | no disponible | no disponible | Hugging Face |
| Otras políticas del Arena MicroDuck | Políticas de control | variable | variable | variable | Hugging Face Spaces |

No se dispone de información detallada sobre otras políticas comparables en la información proporcionada. La comparativa se limita a la referencia base y a las políticas del evento Arena, sin datos de rendimiento de terceros.

## Limitaciones y advertencias

- Especialización extrema: la política solo realiza la habilidad `hill-climb-1m5`; no es un modelo generalista ni de lenguaje.
- Evaluación local indicativa: la propia model card advierte que las puntuaciones locales son indicativas y que el Arena mide el resultado oficial; se requiere evaluación final oficial.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Idiomas no disponibles: no aplica, pero el campo está vacío en los metadatos.
- Sin información sobre sesgos: no se documentan sesgos, pero al ser una política de control entrenada en simulación, puede presentar comportamientos frágiles ante distribuciones de observaciones no vistas.
- Riesgo de sobreajuste a los arranques de desarrollo: la selección se hizo sobre 45 arranques; la validación en arranques finales separados mitiga parcialmente este riesgo, pero no se detallan los resultados de validación final.
- Dependencia del entorno MicroDuck: la política está acoplada a la dinámica y observaciones del simulador; no se garantiza su transferencia al robot físico.
- Repositorio con 0 descargas y 0 likes: modelo reciente y sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/BabyClaw/duck-skill-20261105-hill-climb-1m5
- Evento Arena: https://huggingface.co/spaces/pollen-robotics/microduck-arena#/e/hill-climb-1m5
- Modelo base de referencia: https://huggingface.co/pollen-robotics/microduck-hill-climb-1m5-reference
- Pollen Robotics (organización): https://huggingface.co/pollen-robotics
