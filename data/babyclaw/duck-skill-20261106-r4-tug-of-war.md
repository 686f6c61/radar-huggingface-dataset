# BabyClaw/duck-skill-20261106-r4-tug-of-war

## Resumen

Duck Skill Tug Mature es una politica de control para robótica entrenada mediante aprendizaje por refuerzo, publicada por el usuario BabyClaw en Hugging Face bajo el identificador `BabyClaw/duck-skill-20261106-r4-tug-of-war`. No se trata de un modelo de lenguaje: es una politica neuronal orientada a la competición de "tug-of-war" (tiro de cuerda) dentro de la Arena de MicroDuck, un entorno de simulación de robótica con pato cuadrúpedo impulsado por Pollen Robotics. El modelo recibe 61 observaciones y emite 14 acciones, y se distribuye en formato ONNX para inferencia en CPU.

El artefacto es la continuación madura de un checkpoint previo (BeakTug), seleccionada mediante evaluaciones emparejadas contra una liga de rivales y contra un panel de referencia. La model card documenta de forma explícita un proceso de auditoría con fallo inicial (auditoría de cero adversos fallida) y una confirmación prospectiva posterior que sí superó los criterios predeclarados. Es relevante ahora porque ilustra prácticas de reproducibilidad y validación estadística en políticas de RL para robótica, más que por su rendimiento bruto como modelo de propósito general.

El repositorio tiene un tamaño de 0.0 GB según Hugging Face (probablemente por redondeo de un artefacto muy pequeño), sin descargas ni likes en el momento de la consulta, y sin licencia ni idiomas declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica neuronal para control robotico (entrenada con RL); arquitectura interna no detallada en la model card |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada fija de 61 observaciones) |
| Tipos de cuantizacion | no disponible; se distribuye en ONNX para inferencia en CPU |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (inferencia en CPU); checkpoint de entrenamiento en `.pt` (`model_1380.pt`) |
| Entrada / salida | 61 observaciones / 14 acciones |
| Libreria | `microduck` |
| Pipeline | `robotics` |
| SHA-256 de la politica | `f2b6eee071baad8a778c5efd9434355e7230f1eb3c60cf501582cb65a615e9ca` |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna de la red (capas, dimensión de hidden state, tipo de encoder). Lo que sí se documenta es el pipeline de entrenamiento: un proceso de continuación desde un checkpoint maduro previo, con selección de checkpoint basada en evaluaciones emparejadas contra una liga de seis rivales y contra un panel de referencia. El checkpoint seleccionado es `model_1380.pt`, exportado a ONNX como `checkpoint-14-model_1380.onnx`. La politica opera sobre 61 observaciones y produce 14 acciones, lo que sugiere un espacio de observación y acción de baja dimensión propio del simulador MicroDuck.

El aspecto técnico más destacable es el protocolo de validación estadística. La model card documenta tres fases: (1) una cualificación balanceada previa que resultó en `qualified: true` con 38 victorias del candidato frente a 34 del padre sobre 48 combates cada uno; (2) una auditoría de cero adversos que falló (`admitted: false`) con 1 fallo adverso del candidato y 3 del padre sobre 300 combates cada uno, y que se conserva sin reclasificar; y (3) una confirmación prospectiva con criterios predeclarados (intervalo bootstrap de confianza del 95 % para la mejora de victorias, recuento de resets, puntuación nativa, cinco semillas oficiales) que resultó en `admitted: true`. También se documenta una corrección de identidad del launcher: una variable de bucle local sobrescribió el campo `launcher_sha256` histórico, aunque los bytes del snapshot permanecen correctamente direccionados por contenido.

## Capacidades

- Control de política para la tarea de tug-of-war en el simulador MicroDuck (entrada de 61 observaciones, salida de 14 acciones).
- Inferencia en CPU mediante ONNX, sin requisito de GPU.
- Ejecución dentro de la Arena de MicroDuck con semillas oficiales (1-5) y paneles de liga y referencia.
- Evaluación emparejada por semillas con bootstrap de clústeres (100 semillas este y 100 oeste, 20 000 remuestreos, semilla fija 6110811).
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni capacidades multilingües: no es un modelo de lenguaje.
- No se documentan capacidades de generalización fuera del entorno MicroDuck.

## Casos de uso

- Evaluación de políticas en la Arena de MicroDuck: el modelo puede desplegarse en el espacio `pollen-robotics/microduck-arena` para medir el resultado oficial en la competición de tug-of-war, que es el criterio que la propia model card señala como definitivo frente a las puntuaciones locales indicativas.
- Investigación en validación estadística de políticas RL: el repositorio documenta un protocolo completo de auditoría con fallo retenido, confirmación prospectiva y criterios predeclarados, útil como referencia metodológica para equipos que diseñan pipelines de selección de checkpoints.
- Reproducibilidad de experimentos de RL: los hashes SHA-256 de política, manifiesto, checkpoint y resúmenes permiten verificar la integridad de cada artefacto y reconstruir la cadena de decisiones.
- Baseline para políticas de control de bajo dimensionalidad: con 61 observaciones y 14 acciones, sirve como punto de partida para comparar arquitecturas alternativas en el mismo simulador.
- Despliegue en entornos con recursos limitados: la inferencia ONNX en CPU permite ejecutar la política sin GPU, lo que facilita pruebas en hardware modesto o en el propio simulador.
- Estudio de robustez frente a fallos adversos: la distinción entre fallos del candidato y del padre en las auditorías (1 vs. 3 en la auditoría fallida; 0 en la confirmación) permite analizar el comportamiento ante condiciones adversas.
- Integración en la librería `microduck`: el modelo se carga con la librería declarada, lo que facilita su uso dentro del ecosistema de simulación de Pollen Robotics.

## Benchmarks y rendimiento

Los datos disponibles son resultados de evaluación interna del autor, no benchmarks estándar de NLP. Se presentan tal cual, indicando que las puntuaciones locales son indicativas y que la Arena mide el resultado oficial.

| Evaluacion | Combates | Victorias candidato | Victorias padre | Fallos adversos candidato | Fallos adversos padre | Puntuacion media nativa candidato (cm) | Puntuacion media nativa padre (cm) |
|---|---|---|---|---|---|---|---|
| Cualificacion balanceada previa | 48 + 48 | 38 | 34 | 0 | 0 | 98.858 | 97.627 |
| Auditoria cero adversos (fallida) | 300 + 300 | 243 | 203 | 1 | 3 | 98.858 (referencia oficial) | 97.627 (referencia oficial) |
| Confirmacion prospectiva, liga | 1200 | 938 | 853 | 0 | 0 | 82.653 | no disponible en el extracto |
| Confirmacion prospectiva, resets | — | — | — | 5 resets | 9 resets | — | — |

En la auditoría fallida, el intervalo de confianza del 95 % para la diferencia de victorias emparejadas fue [0.0633, 0.2033], y la referencia fresca mostró 112.503 cm para el candidato frente a 69.955 cm para el padre, con 50 victorias para cada uno y 0 fallos adversos en ambos. Los criterios de la confirmación prospectiva incluyeron victoria en las cinco semillas oficiales y mejora de al menos 0.2 cm en la media. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; la inferencia es en CPU vía ONNX.
- GPU recomendadas: ninguna; el modelo está diseñado para ejecución en CPU.
- Compatibilidad con GPU de consumo: no aplica (no requiere GPU).
- Opciones de despliegue: ONNX Runtime en CPU; librería `microduck`; Arena de MicroDuck en Hugging Face Spaces.
- Latencia y throughput: no disponibles. Los tiempos de evaluación documentados son de episodios completos (150.28 s para 48+48 combates en la cualificación; 170.65 s para 300+300 en la auditoría), no de inferencia individual.
- Tamaño del repositorio: 0.0 GB según Hugging Face, lo que sugiere un artefacto muy pequeño compatible con cualquier equipo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Duck Skill Tug Mature (este) | Politica RL para MicroDuck | no disponible | 61 observaciones de entrada | no disponible | ONNX + `.pt` | Hugging Face, 0 descargas |
| BeakTug (checkpoint padre referenciado) | Politica RL para MicroDuck | no disponible | no disponible | no disponible | no disponible | Referenciado por SHA-256 en la model card; no se confirma repositorio público |
| Otras politicas de la Arena MicroDuck | Politicas RL para MicroDuck | no disponible | no disponible | no disponible | no disponible | No se identifican en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas de la misma categoría fuera del ecosistema MicroDuck. Los modelos de lenguaje no son comparables porque la tarea y las métricas son distintas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona en lenguaje natural y no soporta tool calling ni agentes.
- La licencia no está disponible, lo que impide determinar si el uso comercial está permitido; debe consultarse al autor antes de cualquier despliegue productivo.
- El modelo está especializado exclusivamente en la tarea de tug-of-war del simulador MicroDuck; no se documenta generalización a otras tareas ni a robots físicos.
- Las puntuaciones locales son indicativas según la propia model card; el resultado oficial solo lo mide la Arena.
- La auditoría de cero adversos falló inicialmente (1 fallo adverso del candidato frente a 3 del padre) y se conserva sin reclasificar; aunque la confirmación prospectiva posterior fue admitida, el historial de fallo debe tenerse en cuenta.
- Existe una corrección documentada de identidad del launcher: una variable de bucle sobrescribió el campo `launcher_sha256` histórico, aunque los bytes del snapshot permanecen correctamente direccionados por contenido. Esto puede complicar la verificación de procedencia si se confía únicamente en el campo histórico.
- El repositorio no tiene descargas ni likes, lo que limita la evidencia externa de reproducibilidad por terceros.
- El tamaño del repositorio aparece como 0.0 GB, lo que puede deberse a redondeo; conviene verificar los artefactos reales antes de asumir que están completos.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas porque el modelo no procesa lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BabyClaw/duck-skill-20261106-r4-tug-of-war
- Arena de MicroDuck (evento tug-of-war): https://huggingface.co/spaces/pollen-robotics/microduck-arena#/e/tug-of-war
- Organización Pollen Robotics en Hugging Face: https://huggingface.co/pollen-robotics
- No se han encontrado en la información proporcionada papers, blogs, repositorios de código ni demos adicionales.
