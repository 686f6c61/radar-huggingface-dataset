# hesh0629/groot-put_banana_v2

## Resumen

El modelo `hesh0629/groot-put_banana_v2` es una política robótica entrenada con el framework LeRobot de Hugging Face para controlar un brazo robótico en la tarea de colocar un plátano en una posición determinada. El autor es `hesh0629` y se publicó en agosto de 2026 bajo licencia Apache 2.0. La arquitectura utilizada es ACT (Action Chunking with Transformers), una política que predice secuencias de acciones (chunks) en lugar de acciones individuales, lo que facilita el control fino y la suavidad en los movimientos del robot.

El modelo cuenta con 2.724.163.520 parámetros (aproximadamente 2,7 mil millones) y un tamaño de repositorio de 5,4 GB. Se entrenó con el dataset `hesh0629/put_banana_v2`, que contiene demostraciones de teleoperación de la tarea. Este modelo es relevante porque representa un ejemplo de cómo la comunidad de código abierto aplica transformadores a la robótica de manipulación, siguiendo la línea de proyectos como ACT y LeRobot, y permite reproducir el entrenamiento e inferencia en un entorno de bajo coste.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parámetros totales | 2.724.163.520 (2,7 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de robótica, no de lenguaje) |
| Tipos de cuantización | no disponible (solo safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es ACT (Action Chunking with Transformers), una política de robótica que combina un transformer con un mecanismo de chunking de acciones: en lugar de predecir una única acción por paso, el modelo genera una secuencia de acciones futuras (chunk) de longitud fija, lo que reduce la frecuencia de re-planificación y mejora la estabilidad del movimiento. El entrenamiento se realizó con el framework LeRobot, que proporciona un pipeline completo para la adquisición de datos, entrenamiento y evaluación. El dataset utilizado es `hesh0629/put_banana_v2`, que contiene demostraciones teleoperadas de la tarea de colocar un plátano; no se proporcionan detalles sobre el número de episodios ni el tamaño del dataset en la información disponible. No se menciona el uso de RLHF, DPO ni técnicas de preentrenamiento adicionales; el entrenamiento se realiza desde cero (train from scratch) según los comandos incluidos en la model card.

## Capacidades

- Control de un brazo robótico SO-100 para la tarea específica de colocar un plátano en una posición objetivo.
- Generación de secuencias de acciones (chunking) que permiten movimientos suaves y continuos.
- Inferencia en tiempo real con un robot físico usando el framework LeRobot (`lerobot-record` para evaluación).
- Integración con el ecosistema LeRobot: permite entrenar desde cero con `lerobot-train` y evaluar con `lerobot-record`.
- No es un modelo de lenguaje: no soporta generación de texto, razonamiento, código ni funciones de tool calling.
- No tiene capacidades multilingües ni de visión; la entrada es el estado del robot (observaciones) y la salida son acciones.

## Casos de uso

- Automatización de tareas de manipulación en entornos de laboratorio: el modelo puede controlar un brazo SO-100 para colocar objetos (plátano) en una posición concreta, útil para experimentos de robótica de manipulación.
- Investigación en aprendizaje por refuerzo y demostración: sirve como base para estudiar la generalización de políticas ACT en tareas de pick-and-place, comparando con otras políticas del ecosistema LeRobot.
- Desarrollo de sistemas de teleoperación asistida: el modelo puede generar movimientos autónomos a partir de demostraciones humanas, reduciendo la carga del operador en tareas repetitivas.
- Evaluación de la calidad de datasets de robótica: el entrenamiento con `put_banana_v2` permite analizar cómo la cantidad y diversidad de demostraciones afecta el rendimiento de la política.
- Pruebas de despliegue en hardware de bajo coste: al ser un modelo de 2,7 B parámetros, se puede ejecutar en una GPU de consumo (por ejemplo, RTX 3090) para pruebas de inferencia en tiempo real con el robot.
- Generación de datos sintéticos de movimiento: aunque no se menciona en la model card, la política podría usarse para generar trayectorias adicionales que enriquecerían un dataset de entrenamiento (similar a los blueprints de GR00T-Dreams).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de éxito en tareas reales, precisión de movimiento, ni comparaciones con otras políticas (por ejemplo, ACTUAL vs. diffusion policies). Tampoco se incluyen métricas de rendimiento en simulación o hardware.

## Requisitos de hardware

- VRAM estimada: con 2,7 B parámetros en precisión fp32, el modelo ocupa aproximadamente 10,9 GB de memoria (2,7 B × 4 bytes). En fp16 o bf16, ~5,4 GB. Para inferencia en tiempo real con un robot, se recomienda una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3060/3070/4060 Ti).
- GPU recomendadas: NVIDIA RTX 3060 (12 GB), RTX 4070 (12 GB), RTX 4090 (24 GB), A100 (40 GB) para entrenamiento o inferencia con margen.
- Cabe en una GPU de consumo de gama media (RTX 3060 12 GB) en fp16; para fp32 se necesitaría al menos 12 GB.
- Opciones de despliegue: LeRobot proporciona inferencia con `lerobot-record` para evaluación en el robot; no se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles; la inferencia depende de la velocidad de la GPU y del tamaño del chunk de acciones.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables específicos para esta tarea (políticas robóticas de manipulación con ACTUAL). En el ecosistema LeRobot existen políticas como `act` (la misma arquitectura) y `diffusion_policy`, pero no se han publicado comparativas en la información disponible. El modelo `gosh0629/groot_probe` es un repositorio del mismo autor con la misma arquitectura y dataset, pero no se proporcionan datos de rendimiento. Por lo tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para la tarea de colocar un plátano; no es generalizable a otras tareas sin reentrenamiento.
- No se ha documentado la robustez del modelo ante variaciones de iluminación, posición de la cámara o del objeto, por lo que puede fallar en entornos no controlados.
- No se han publicado métricas de éxito ni de tasa de error; el rendimiento real en hardware es desconocido.
- El dataset `put_banana_v2` no está documentado; se desconoce el número de demostraciones, la diversidad de los datos y si hay sesgos en la recolección.
- La licencia Apache 2.0 permite uso comercial, pero no se han indicado restricciones adicionales; es recomendable revisar el dataset asociado por si tiene restricciones propias.
- No es un modelo de lenguaje; no debe usarse para tareas de texto, código o razonamiento general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hesh0629/groot-put_banana_v2
- Dataset utilizado: https://huggingface.co/datasets/hesh0629/put_banana_v2
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Modelo similar del autor: https://huggingface.co/hesh0629/groot_probe
