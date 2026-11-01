# fecasado/gfm-cubes-22dNZ5

## Resumen

GFM Cubes 22dNZ5 es una política robótica entrenada con LeRobot y publicada en Hugging Face por el usuario fecasado. El identificador del modelo hace referencia a la familia "gaze flow matching" (GFM), una variante de políticas de imitación que combina información de mirada (gaze) con un esquema de flow matching para generar acciones de control. No se trata de un modelo de lenguaje: es un checkpoint de robótica pensado para controlar un brazo manipulador en tareas de pick-and-place.

El modelo se ha entrenado sobre el dataset fecasado/Ncubes-to-Nbaskets-320x240, que por su nombre sugiere una tarea de trasvase de cubos a cestas con imágenes de resolución 320x240. El checkpoint contiene 75.242.458 parámetros y ocupa 0,3 GB en el repositorio, lo que lo sitúa en el rango de políticas de tamaño medio, desplegables en GPUs de consumo.

Es relevante ahora porque LeRobot se ha consolidado como el framework de referencia para entrenar y desplegar políticas de imitación en hardware asequible (SO-100/SO-101), y este checkpoint es un ejemplo concreto de un pipeline completo: dataset propio, entrenamiento con flow matching condicionado por mirada y evaluación con `lerobot-record`. La licencia Apache 2.0 facilita su reutilización comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gaze flow matching (política de imitación robótica; detalles internos no disponibles) |
| Parametros totales | 75.242.458 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; modelo de robótica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | fecasado/Ncubes-to-Nbaskets-320x240 |
| Tamano del repositorio | 0,3 GB |
| Descargas | 17 |
| Fecha de creacion | 2026-10-31 |

## Arquitectura y entrenamiento

La model card identifica el modelo como `gaze_flow_matching` y lo etiqueta con `lerobot`, `gaze_flow_matching` y `robotics`. Se trata, por tanto, de una política de imitación para control robótico que emplea flow matching como mecanismo de generación de acciones, condicionada por información de mirada además de las observaciones visuales habituales. No se dispone de detalles sobre el backbone concreto (número de capas, dimensión de los embeddings, mecanismo de atención) ni sobre cómo se integra exactamente la señal de gaze en el modelo.

El entrenamiento se ha realizado con LeRobot sobre el dataset fecasado/Ncubes-to-Nbaskets-320x240, con imágenes de 320x240 píxeles. No se especifican el número de episodios, la composición del dataset ni si hubo fases de refinamiento posteriores. La model card es una plantilla autogenerada por LeRobot y no incluye información sobre hiperparámetros, aumentos de datos o detalles del proceso de entrenamiento.

## Capacidades

- Control robótico de manipulación: genera acciones de un brazo (por ejemplo, SO-100 follower) a partir de observaciones visuales.
- Política de imitación entrenada por demostración sobre una tarea concreta de trasvase de cubos a cestas.
- Flow matching para la generación de trayectorias de acción, en lugar de regresión directa o difusión clásica.
- Condicionamiento por mirada (gaze) además de la observación visual, según indica el nombre del modelo.
- Integración nativa con el ecosistema LeRobot: entrenamiento con `lerobot-train` y evaluación con `lerobot-record`.
- No soporta tool calling, agentes multi-paso, generación de texto, código, matemáticas ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo ejecuta la tarea de trasvase de cubos a cestas para la que fue entrenado, útil como base para experimentos de manipulación con brazos SO-100.
- Evaluación comparativa de políticas de imitación: sirve como checkpoint de referencia de la familia gaze flow matching frente a políticas ACT o diffusion policy sobre el mismo dataset.
- Reproducción de experimentos: al estar entrenado con LeRobot y un dataset público, permite reproducir el pipeline completo de entrenamiento y evaluación.
- Prototipado en hardware de bajo coste: sus 75 millones de parámetros y 0,3 GB permiten desplegarlo en estaciones con GPU de consumo para pruebas de laboratorio.
- Fine-tuning sobre nuevas tareas: al ser Apache 2.0, puede reentrenarse o adaptarse a datasets propios de manipulación con el mismo formato LeRobot.
- Docencia y formación en robótica de imitación: ejemplo completo de política condicionada por mirada para cursos y talleres sobre LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 75,2 millones de parámetros en safetensors, el peso de los pesos ronda los 0,3 GB, por lo que la inferencia en FP32 requeriría del orden de 0,3 GB solo para pesos, más memoria para activaciones y buffering de observaciones.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería ser suficiente, aunque no hay confirmación del autor.
- GPU de consumo: previsiblemente cabe en RTX 3060, RTX 4060, RTX 4090 y similares, dado el reducido tamaño del checkpoint.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path` apuntando al checkpoint local o del Hub); no se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GFM Cubes 22dNZ5 (este modelo) | 75.242.458 | no aplica | Manipulación (cubos a cestas) | Apache 2.0 | Hugging Face |
| Políticas ACT de LeRobot | no disponible | no aplica | Manipulación genérica | Apache 2.0 (segun LeRobot) | Hugging Face / LeRobot |
| Diffusion Policy (referencia) | no disponible | no aplica | Manipulación genérica | no disponible | Repositorios de investigación |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo específico de una única tarea (trasvase de cubos a cestas); no generaliza a otras tareas sin reentrenamiento.
- La model card es una plantilla autogenerada por LeRobot y no documenta arquitectura interna, hiperparámetros ni resultados de evaluación.
- No hay información sobre sesgos, aunque al ser un modelo de control robótico el riesgo principal es el fallo físico en la manipulación, no sesgos lingüísticos.
- Riesgo de alucinación no aplica en el sentido habitual; el riesgo equivalente es la generación de trayectorias inválidas fuera de la distribución de entrenamiento.
- Sin datos publicados sobre robustez ante cambios de iluminación, fondo o posición de objetos.
- La licencia Apache 2.0 permite uso comercial, pero no se ofrece ninguna garantía sobre el rendimiento en producción.
- No se documentan limitaciones de idioma porque el modelo no procesa lenguaje.
- El número de descargas (17) y la ausencia de likes indican poca validación externa; conviene tratar el checkpoint con cautela.

## Enlaces

- Hugging Face: https://huggingface.co/fecasado/gfm-cubes-22dNZ5
- Dataset de entrenamiento: https://huggingface.co/datasets/fecasado/Ncubes-to-Nbaskets-320x240
- LeRobot (repositorio): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
