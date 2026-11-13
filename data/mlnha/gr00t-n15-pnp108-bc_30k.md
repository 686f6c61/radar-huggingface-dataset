# mlnha/gr00t-n15-pnp108-bc_30k

## Resumen

`mlnha/gr00t-n15-pnp108-bc_30k` es un checkpoint de investigación publicado en Hugging Face por el usuario mlnha, resultado de un fine-tuning del modelo de robótica GR00T N1.5 de NVIDIA sobre rollouts generados en el simulador RoboCasa365. En concreto, el modelo se ha entrenado con behavior cloning (BC) plano durante 30 000 pasos sobre un conjunto de 108 episodios de la tarea PickPlaceCounterToCabinet, de los cuales 72 fueron exitosos. El objetivo del autor es estudiar el uso de estimadores de progreso de tarea aprendidos como señal de entrenamiento para BC, y este checkpoint es la línea base "plain BC" de dicha comparación.

El modelo parte del checkpoint de preentrenamiento `robocasa/robocasa365_checkpoints` (GR00T-N1.5, paso 80 000) y se especializa en una única tarea de manipulación: coger un objeto de una encimera y colocarlo en un armario. No es un modelo de propósito general ni un modelo de lenguaje: es una política visuomotora para control robótico en simulación, empaquetada con la librería `gr00t` y pesos en formato `safetensors`.

Su relevancia es acotada pero clara para la comunidad de robótica basada en aprendizaje: documenta de forma reproducible (semilla 42, hiperparámetros explícitos, logs de TensorBoard) el rendimiento de un fine-tuning de BC sobre muy pocos datos y sirve como referencia para comparar métodos alternativos de entrenamiento. El repositorio ocupa 37,9 GB y no incluye estados del optimizador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política visuomotora GR00T N1.5; detalles de la arquitectura no incluidos en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo de robótica, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | gr00t |
| Tamano del repositorio | 37,9 GB |
| Tarea | PickPlaceCounterToCabinet (RoboCasa365) |
| Pasos de entrenamiento | 30 000 |
| Batch size | 64 |
| Learning rate | 3e-5, cosine, warmup 0.05 |
| Semilla | 42 |
| Embodiment | `new_embodiment` |
| Dataset de entrenamiento | `pnp108`: 108 rollouts (72 exitosos) de GR00T checkpoint-120000 |
| Formato de datos | LeRobot v2.1 |

## Arquitectura y entrenamiento

El checkpoint deriva de GR00T N1.5, el modelo fundacional de robótica de NVIDIA, en su variante preentrenada para RoboCasa365 (`pretraining-80000`). La model card no describe la arquitectura interna (transformer, mezcla de expertos, codificador visual, etc.), por lo que no se puede detallar aquí. Lo que sí se documenta es el procedimiento de ajuste: behavior cloning plano durante 30 000 pasos con un único GPU, batch de 64, learning rate de 3e-5 con schedule cosine y warmup de 0,05, semilla fija 42 y el embodiment etiquetado como `new_embodiment`.

Los datos de entrenamiento son 108 rollouts generados por el propio GR00T (checkpoint-120000) sobre la tarea PickPlaceCounterToCabinet en RoboCasa365, de los cuales 72 terminaron con éxito. Se almacenan en formato LeRobot v2.1. No se menciona uso de RLHF, DPO ni ninguna otra fase de alineamiento; el autor enmarca este checkpoint como la línea base de un estudio sobre estimadores de progreso de tarea como señal de entrenamiento. Los logs de entrenamiento (`train.log` y `runs/` con TensorBoard) están incluidos en el repositorio, pero los estados del optimizador no.

## Capacidades

- Ejecución de una única tarea de manipulación robótica: PickPlaceCounterToCabinet (coger un objeto de la encimera y colocarlo en el armario) en el simulador RoboCasa365.
- Política visuomotora entrenada por behavior cloning a partir de observaciones y acciones de rollouts previos.
- Evaluación en simulación con escenas de semilla 2000 en adelante y semilla de política 1.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes, multilingüismo ni modos de pensamiento.
- No se documenta soporte de múltiples tareas ni generalización fuera de la tarea de entrenamiento.

## Casos de uso

- Reproducción de experimentos de behavior cloning en robótica: el checkpoint y sus logs permiten replicar el entrenamiento con los hiperparámetros documentados (batch 64, LR 3e-5, semilla 42) y comparar contra variantes del estudio.
- Línea base para investigar señales de entrenamiento alternativas: el autor lo publica como referencia "plain BC" frente a métodos basados en estimadores de progreso de tarea, de modo que otros grupos pueden medir la mejora relativa de sus propuestas.
- Evaluación de políticas en RoboCasa365: sirve para medir éxito en la tarea PickPlaceCounterToCabinet con el protocolo descrito (semillas 2000+ para escenas, semilla 1 para política, éxito al final del episodio).
- Estudio de eficiencia de datos en robótica: con solo 108 rollouts (72 exitosos) se obtiene una política funcional, lo que lo convierte en un caso práctico para analizar curvas de aprendizaje con pocos datos.
- Punto de partida para fine-tuning en tareas de pick-and-place similares: al estar construido sobre GR00T N1.5 con el embodiment `new_embodiment`, puede reutilizarse como inicialización en experimentos con nuevas tareas de manipulación.
- Docencia y formación en aprendizaje por imitación: el repositorio incluye logs de TensorBoard y un protocolo de evaluación explícito, lo que facilita usarlo como ejemplo reproducible en cursos o talleres de robótica.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados son los de éxito en simulación RoboCasa365 para la tarea PickPlaceCounterToCabinet:

| Checkpoint | Éxito (semillas 2000–2049) | Éxito (100 episodios) |
|---|---|---|
| checkpoint-10000 | 27/50 | 59/100 |
| checkpoint-15000 | no disponible | no disponible |
| checkpoint-20000 | 27/50 | 59/100 |
| checkpoint-25000 | no disponible | no disponible |
| checkpoint-30000 | 31/50 | 61/100 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo cual es esperable al tratarse de una política robótica y no de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 37,9 GB en disco, pero la model card no desglosa el tamaño de los pesos ni el consumo en memoria.
- GPU recomendadas: no disponible. El entrenamiento se realizó en 1 GPU con batch 64, pero no se especifica el modelo.
- Compatibilidad con GPU de consumo: no disponible; sin datos de tamaño de pesos no puede determinarse.
- Opciones de despliegue: la librería indicada es `gr00t`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje, no aplicables directamente aquí).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Tarea | Datos de entrenamiento | Éxito en simulación | Licencia |
|---|---|---|---|---|---|
| mlnha/gr00t-n15-pnp108-bc_30k | GR00T N1.5 (pretraining-80000) | PickPlaceCounterToCabinet | 108 rollouts (72 exitosos) | 61/100 (checkpoint-30000) | no disponible |
| GR00T N1.5 (checkpoint-120000, generador de los datos) | GR00T N1.5 | PickPlaceCounterToCabinet | no disponible | no disponible en esta ficha | no disponible |
| Otras variantes del estudio del autor | GR00T N1.5 | PickPlaceCounterToCabinet | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de otros autores con la misma tarea, tamaño y protocolo de evaluación, por lo que la comparativa cuantitativa con alternativas externas no está disponible.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un modelo listo para producción; el propio autor lo etiqueta como "research checkpoints".
- Especializado en una sola tarea (PickPlaceCounterToCabinet) y en el simulador RoboCasa365; no hay evidencia de transferencia a robots reales ni a otras tareas.
- Entrenado con solo 108 rollouts, de los cuales 72 son exitosos; el riesgo de sobreajuste y de baja robustez ante variaciones de escena es alto.
- El éxito medido es del 61 % en 100 episodios con el mejor checkpoint, lo que implica una tasa de fallo del 39 % incluso en el entorno de evaluación previsto.
- No se documentan sesgos, pero al derivar de un modelo preentrenado con datos no descritos, no puede descartarse la herencia de sesgos de dichos datos.
- Licencia no disponible: no puede asumirse uso comercial permitido; debe consultarse con el autor antes de cualquier explotación.
- No se incluyen estados del optimizador, lo que limita la reanudación exacta del entrenamiento.
- Los datos de entrenamiento provienen de rollouts de un modelo previo, por lo que los errores de este pueden propagarse a la política ajustada.
- No hay información sobre latencia, consumo de memoria ni rendimiento fuera del simulador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlnha/gr00t-n15-pnp108-bc_30k
- Repositorio de checkpoints RoboCasa referenciado en la model card: `robocasa/robocasa365_checkpoints` (no se proporciona URL directa en la información disponible)
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código o demos adicionales.
