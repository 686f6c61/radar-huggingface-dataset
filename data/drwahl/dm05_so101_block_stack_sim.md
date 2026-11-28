# drwahl/dm05_so101_block_stack_sim

## Resumen

dm05_so101_block_stack_sim es un ajuste fino mediante LoRA del modelo base lerobot/dm05_base, un modelo de visión-lenguaje-acción (VLA) orientado a robótica, especializado en la tarea de apilar un bloque de 30 mm sobre otro. Lo desarrolla el usuario drwahl y se distribuye a través de Hugging Face con la etiqueta de pipeline robotics. El modelo está pensado para controlar un brazo robótico SO-101 en simulación, no para generación de texto ni tareas de propósito general.

El ajuste se realizó sobre el backbone de lenguaje del modelo base con LoRA de rango 32 y alpha 64, manteniendo densas las proyecciones del experto de acción (entrada, salida y temporales) y congelando la visión. El entrenamiento consistió en 20 000 pasos con batch de 4, siguiendo el mismo protocolo que el modelo drwahl/pi05_so101_block_stack_sim. Los pesos se empaquetan como safetensors y el repositorio ocupa 2,0 GB.

Su relevancia es acotada y muy específica: sirve como referencia reproducible de un pipeline de ajuste fino de un VLA sobre una tarea de manipulación concreta en simulación, con un conjunto de evaluación de 150 disposiciones retenidas y una métrica de éxito definida. No es un modelo de uso general ni está pensado para desplegarse fuera de su tarea y su entorno de simulación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-lenguaje-accion) basada en lerobot/dm05_base; LoRA sobre el backbone de lenguaje y experto de accion denso |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Gemma Terms of Use (etiqueta `gemma`) |
| Formato de pesos | safetensors (adaptador LoRA + procesadores en `adapter/`) |

## Arquitectura y entrenamiento

El modelo parte de lerobot/dm05_base, un VLA que combina un backbone de lenguaje con un experto de acción encargado de producir las acciones motoras. El ajuste aplica LoRA de rango 32 y alpha 64 únicamente sobre el backbone de lenguaje; el experto de acción y sus proyecciones de entrada, salida y temporales permanecen densas, y el codificador visual está congelado. La normalización, el optimizador y la longitud de chunk son los del checkpoint base, con un decaimiento coseno acortado de 50 000 a 20 000 pasos para alinearse con el protocolo de entrenamiento de referencia.

El entrenamiento se ejecutó con la configuración `train/dm05_so101.yaml` del repositorio vla-test, sobre el conjunto de datos drwahl/so101_block_stack_sim, con 20 000 pasos y batch de 4. La tarea aprendida es apilar un bloque de 30 mm sobre otro con un brazo SO-101 en simulación. El adaptador y los procesadores (que portan la normalización) se guardan en el directorio `adapter/`, y LeRobot los carga sobre los pesos base.

## Capacidades

- Control de un brazo robótico SO-101 en simulación para la tarea de apilar un bloque de 30 mm sobre otro.
- Generación de acciones motoras por chunks (chunks de 50 pasos según el protocolo de evaluación descrito).
- Ejecución parcial de chunks: el autor evalúa ejecutando 25 de los 50 pasos de cada chunk.
- Carga mediante LeRobot sobre los pesos del modelo base, con normalización incluida en los procesadores del adaptador.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo, visión general, audio ni modo thinking.
- No se documentan capacidades fuera de la tarea de manipulación para la que fue entrenado.

## Casos de uso

- Evaluación reproducible de apilamiento en simulación: ejecutar el script `sim/scripts/eval.py` sobre las 150 disposiciones retenidas para medir la tasa de apilamiento y de elevación, tal como describe el autor.
- Referencia de ajuste fino LoRA de un VLA: servir de plantilla para reproducir el pipeline de entrenamiento (`train/dm05_so101.yaml`) sobre otras tareas de manipulación con SO-101.
- Comparación de protocolos de entrenamiento: contrastar este modelo con drwahl/pi05_so101_block_stack_sim, entrenado con el mismo protocolo, para analizar diferencias entre arquitecturas base.
- Estudio de congelación selectiva: analizar el efecto de ajustar solo el backbone de lenguaje manteniendo denso el experto de acción y congelada la visión.
- Docencia e investigación en robótica de manipulación: usar el par modelo+dataset como ejemplo completo de tarea de apilamiento con métricas definidas.
- Pruebas de integración con LeRobot: validar la carga de adaptadores LoRA y procesadores sobre un checkpoint base en pipelines propios.
- No es adecuado para generación de texto, código, atención al cliente ni ninguna aplicación de lenguaje de propósito general.

## Benchmarks y rendimiento

El autor reporta una evaluación propia sobre 150 disposiciones retenidas, puntuada con las mismas compuertas que filtraron el oráculo. Ejecutando 25 pasos de cada chunk de 50 y promediando sobre tres semillas adicionales:

| Metrica | Resultado |
|---|---|
| Bloques apilados (de 150) | 106,3 |
| Elevaciones correctas (de 150) | 137,0 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 2,0 GB, pero el tamaño del modelo base y de los pesos completos no se documenta.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: LeRobot, cargando el adaptador de `adapter/` sobre los pesos de lerobot/dm05_base.
- Latencia y throughput: no disponibles.
- El autor indica que la evaluación se ejecuta con `uv run python sim/scripts/eval.py` sobre el directorio del adaptador, con horizonte 25 y sin suavizado.

## Comparativa con modelos similares

| Modelo | Base | Tarea | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| drwahl/dm05_so101_block_stack_sim | lerobot/dm05_base | Apilar bloque de 30 mm con SO-101 en simulación | LoRA r=32, alpha 64, 20k pasos, batch 4 | Gemma Terms of Use | Hugging Face |
| drwahl/pi05_so101_block_stack_sim | no disponible en la información | Misma tarea y protocolo | Mismo protocolo (referencia del autor) | no disponible | Hugging Face |
| lerobot/dm05_base | — | Modelo VLA base | Preentrenamiento del autor original | no disponible | Hugging Face |

No se dispone de datos de parámetros, contexto ni rendimiento de los modelos comparados en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en una tarea (apilar un bloque de 30 mm sobre otro) y en un entorno de simulación; no se documenta transferencia a robots físicos.
- No se documentan sesgos, pero al ser un ajuste sobre un backbone de lenguaje hereda los del modelo base, que no se detallan.
- Riesgo de alucinación no aplicable en el sentido habitual, pero sí riesgo de fallo en la tarea: el propio autor reporta 106,3 apilamientos de 150, es decir, aproximadamente un 29 % de fallos en la métrica principal.
- El rendimiento depende de la configuración de evaluación (horizonte 25, sin suavizado, 25 de 50 pasos por chunk); otros ajustes pueden dar resultados distintos.
- La licencia es Gemma Terms of Use, que impone restricciones de uso comercial y obligaciones de atribución; debe revisarse antes de cualquier despliegue.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación externa de la comunidad.
- No se documentan idiomas soportados ni capacidades multilingües.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/drwahl/dm05_so101_block_stack_sim
- Modelo base: https://huggingface.co/lerobot/dm05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/drwahl/so101_block_stack_sim
- Modelo de referencia del protocolo: https://huggingface.co/drwahl/pi05_so101_block_stack_sim
- Repositorio de entrenamiento: https://github.com/danwahl/vla-test
- Brazo SO-101: https://github.com/TheRobotStudio/SO-ARM100
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
