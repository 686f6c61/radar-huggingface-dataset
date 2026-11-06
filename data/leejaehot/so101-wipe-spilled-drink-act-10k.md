# leejaehot/so101-wipe-spilled-drink-act-10k

## Resumen

SO101 wipe spilled drink: ACT 10k es una política de control robótico entrenada con el algoritmo ACT (Action Chunking with Transformers) sobre el robot de sobremesa SO101, orientada a la tarea de limpiar un líquido derramado. Lo desarrolla el usuario de Hugging Face `leejaehot` y se publica como un checkpoint de validación intermedio (paso 10.000) de un entrenamiento de 100.000 actualizaciones, siendo este el que registra la menor pérdida de validación de toda la ejecución. No es un modelo de lenguaje: es una política visuomotora que mapea observaciones (dos cámaras RGB de 640x480 y el estado articular) a acciones articulares de 6 dimensiones.

El modelo emplea la arquitectura ACT con backbone visual ResNet18 preentrenado en ImageNet, chunking de acciones de 100 pasos y un coeficiente de ensamblado temporal de 0,01 durante la inferencia. Con 51,67 millones de parámetros y un repositorio de 0,6 GB, está pensado para ejecutarse en el bucle de control de un robot real a 30 Hz, no para servir peticiones de texto.

Su relevancia es acotada pero concreta: sirve como referencia reproducible de un pipeline LeRobot completo (dataset, normalización, pre/postprocesadores y pesos) para una tarea de manipulación doméstica, y como punto de comparación frente al checkpoint final de 100.000 pasos del mismo entrenamiento. No se ha medido todavía el éxito físico de la tarea en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) con backbone visual ResNet18 |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de control; chunk de acciones de 100 pasos) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, entrenamiento en FP32) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repositorio LeRobot, archivos de política y procesadores en la raíz) |

## Arquitectura y entrenamiento

ACT es un transformer que predice secuencias de acciones (chunks) a partir de observaciones visuales y propioceptivas. En esta configuración concreta, el modelo consume dos cámaras RGB (muñeca y cenital) a 640x480 y un vector de estado de 6 dimensiones (valores articulares nativos grabados), y produce acciones de 6 dimensiones. El backbone visual es una ResNet18 con inicialización ImageNet. El chunk de acciones es de 100 pasos, con un peso KL de VAE de 10, y en inferencia se aplica ensamblado temporal con coeficiente 0,01 y `n_action_steps = 1`.

El entrenamiento se realizó sobre el dataset `hnuu/wipe-spilled-drink_20261030_212524` (revisión `6297ef30...`), con episodios 0-44 para entrenamiento y 45-49 para validación, a 30 Hz. Se usó batch de 32, semilla 1000, precisión FP32 con AMP desactivado y TF32 permitido. Este checkpoint corresponde al paso 10.000 de una ejecución de 100.000 actualizaciones y presenta una L1 normalizada en validación de 0,3407, la más baja registrada. El repositorio incluye el checkpoint completo en `checkpoints/010000/pretrained_model`, con estado del optimizador AdamW, estado del RNG y manifiesto de hashes SHA-256.

## Capacidades

- Control visuomotor de un robot SO101 para la tarea específica de limpiar un líquido derramado.
- Predicción de chunks de acciones de 100 pasos con ensamblado temporal en inferencia.
- Fusión de dos vistas RGB (muñeca y cenital) con estado articular de 6 dimensiones.
- Ejecución a frecuencia de control de 30 Hz, compatible con el bucle de LeRobot.
- Integración directa como ruta de política LeRobot, con preprocesador y postprocesador guardados.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo de razonamiento, visión general, audio ni generación de texto.

## Casos de uso

- Reproducción de un pipeline LeRobot completo: sirve para validar de extremo a extremo la carga de política, preprocesadores y calibración del robot antes de entrenar tareas propias.
- Limpieza automatizada de derrames en entornos de laboratorio: la política está entrenada específicamente para esta tarea sobre el SO101 y puede desplegarse en el mismo montaje de cámaras y robot.
- Punto de partida para fine-tuning: al ser un checkpoint intermedio con baja pérdida de validación, es un candidato razonable para ajustar la tarea con nuevos episodios.
- Comparación de checkpoints: junto al checkpoint de 100.000 pasos del mismo autor, permite estudiar el efecto del sobreentrenamiento en la pérdida de validación frente al paso final.
- Docencia e investigación en imitación robótica: ejemplo reproducible de ACT con chunking y ensamblado temporal sobre hardware de bajo coste.
- Evaluación de infraestructura de inferencia robótica: útil para medir latencia y estabilidad del bucle de control a 30 Hz con `select_action()` y reinicio por episodio.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| L1 normalizada en validación (held-out) | 0,3407 |
| Paso del checkpoint | 10.000 |
| Episodios de validación | 45-49 (5 episodios) |
| Tasa de éxito física en robot | no medida |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que no es un modelo de lenguaje. La única métrica reportada es la pérdida L1 normalizada sobre cinco episodios de validación con las estadísticas de normalización del dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,668 M de parámetros en FP32, los pesos ocupan aproximadamente 0,2 GB, por lo que cualquier GPU consumer moderna es suficiente.
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 3060 o superior basta para la inferencia de la política.
- Cabe en GPU consumer: sí, por el tamaño del modelo; el cuello de botella real es el bucle de control a 30 Hz y la captura de dos cámaras RGB.
- Opciones de despliegue: LeRobot (`lerobot.policies.act.modeling_act.ACTPolicy` con `make_pre_post_processors`); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles; el autor no publica mediciones de latencia del bucle de control.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / chunk | Licencia | Disponibilidad |
|---|---|---|---|---|
| so101-wipe-spilled-drink-act-10k (este) | 51,67 M | chunk de 100 acciones | no disponible | Hugging Face, LeRobot |
| so101-wipe-spilled-drink-act-100k | no disponible | chunk de 100 acciones | no disponible | Hugging Face, LeRobot |
| Otras políticas ACT para SO101 | no disponible | no disponible | no disponible | no disponible |

La única alternativa directamente comparable es el checkpoint de 100.000 pasos del mismo autor, que corresponde al estado final del entrenamiento; el de 10.000 pasos es el que tiene menor pérdida de validación registrada. No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada únicamente para la tarea de limpiar un derrame con el SO101; no generaliza a otras tareas ni a otros robots sin reentrenamiento.
- Éxito físico no medido: el autor indica explícitamente que no se ha evaluado la tasa de éxito en robot real; la validación se limita a pérdida L1 y recarga del modelo.
- Dependencia de calibración y montaje: requiere coincidencia exacta de nombres de cámaras (muñeca y cenital) y de la calibración del robot; cambios en la disposición invalidan el modelo.
- Licencia no disponible: no se especifica licencia, por lo que el uso comercial queda en un limbo legal y requiere contactar con el autor.
- Dataset pequeño: solo 45 episodios de entrenamiento y 5 de validación, lo que limita la robustez frente a variaciones de iluminación, posición del derrame o del robot.
- Riesgo de sobreajuste al entorno: al ser un checkpoint intermedio de una ejecución más larga, puede presentar deriva si se aplica fuera de las condiciones del dataset.
- Sin capacidades de lenguaje ni razonamiento: no debe emplearse para tareas de texto, agentes o tool calling.
- Sin datos de sesgos: no se documentan sesgos conocidos, pero al ser un modelo visuomotor entrenado con pocos episodios, puede fallar de forma sistemática ante objetos o escenas no representadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leejaehot/so101-wipe-spilled-drink-act-10k
- Checkpoint de 100.000 pasos: https://huggingface.co/leejaehot/so101-wipe-spilled-drink-act-100k
- Dataset de entrenamiento: https://huggingface.co/datasets/hnuu/wipe-spilled-drink_20261030_212524
- Repositorio LeRobot: no disponible en la información proporcionada
- Paper de ACT: no disponible en la información proporcionada
- Demos o blog del autor: no disponible en la información proporcionada
