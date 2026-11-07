# fecasado/gfm-kitchen-tomato-fpv

## Resumen

`fecasado/gfm-kitchen-tomato-fpv` es una política robótica (policy) entrenada con LeRobot y publicada en Hugging Face por el usuario `fecasado`. No es un modelo de lenguaje: es un modelo de control visuomotor para un robot manipulador, orientado a la tarea concreta de manipular un tomate en un entorno de cocina. El identificador "gfm" corresponde a `gaze_flow_matching`, la arquitectura declarada por el autor, y "fpv" sugiere el uso de una cámara en primera persona (first-person view) como entrada visual.

El modelo se distribuye en formato `safetensors` con 75.248.330 parámetros (unos 75,2 M) y un repositorio de 0,3 GB, lo que lo sitúa en el rango de las políticas de imitación ligeras que se pueden ejecutar en tiempo real sobre hardware modesto. Está asociado al dataset `fecasado/tomato-to-plate-320x240`, que indica resolución de entrada de 320x240 píxeles y una tarea de trasvase de un tomate a un plato.

Su relevancia es acotada pero clara: es un ejemplo reproducible de entrenamiento de políticas con LeRobot bajo licencia Apache 2.0, útil para quien quiera estudiar o replicar flujos de imitación en robótica de sobremesa (tipo SO-100) sin depender de modelos propietarios. La model card es prácticamente una plantilla sin rellenar, por lo que gran parte de los detalles técnicos no están documentados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `gaze_flow_matching` (política visuomotora LeRobot, según tag del autor; detalles internos no disponibles) |
| Parametros totales | 75.248.330 (75,2 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: política robótica, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | LeRobot |
| Pipeline | robotics |
| Dataset de entrenamiento | `fecasado/tomato-to-plate-320x240` (320x240 px) |
| Tamano del repositorio | 0,3 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El autor etiqueta el modelo como `gaze_flow_matching`, lo que apunta a una política de imitación basada en flow matching y con algún componente de atención o gaze (mirada) sobre la imagen de entrada. No se dispone de documentación sobre la topología exacta de la red, el número de capas, la dimensión de los embeddings visuales ni el mecanismo de integración de la cámara FPV. La model card no incluye descripción de arquitectura más allá del nombre.

El entrenamiento se realizó con LeRobot sobre el dataset `fecasado/tomato-to-plate-320x240`, que define la tarea (llevar un tomate a un plato) y la resolución de las observaciones. No se han publicado el número de episodios, el número de tokens o frames vistos, la composición del dataset, ni si hubo etapas de RLHF, DPO o ajuste posterior. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Control visuomotor de un brazo robótico a partir de imágenes de cámara en primera persona a 320x240 píxeles.
- Ejecución de una tarea de manipulación concreta: trasladar un tomate a un plato en un entorno de cocina.
- Política de imitación entrenada de extremo a extremo con LeRobot, invocable mediante `lerobot-record` con `--policy.path`.
- Integración con el ecosistema LeRobot (entrenamiento, evaluación y grabación de episodios).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, capacidades multilingües, visión general, audio ni modo "thinking".

## Casos de uso

- Replicación de experimentos de imitación en robótica de sobremesa: sirve como punto de partida para reproducir el pipeline `lerobot-train` / `lerobot-record` con un robot tipo SO-100 y comparar curvas de aprendizaje.
- Evaluación de políticas visuomotoras en tareas de pick-and-place: el modelo permite medir éxito en la tarea tomate-a-plato y analizar sensibilidad a la posición inicial del objeto.
- Docencia en robótica e IA: por su tamaño (75 M de parámetros) y licencia Apache 2.0, es adecuado para prácticas donde el alumnado entrene y despliegue una política real en hardware asequible.
- Base para fine-tuning con nuevos datasets: al estar en formato LeRobot y safetensors, se puede reentrenar con datos propios de otras tareas de cocina y comparar el efecto del cambio de dominio.
- Investigación en flow matching aplicado a control: permite estudiar cómo se comporta una política de flow matching frente a alternativas como ACT o Diffusion Policy en la misma tarea y dataset.
- Prototipado de demos de robot manipulador en ferias o laboratorios: el reducido tamaño del repositorio (0,3 GB) facilita su descarga y despliegue en estaciones locales sin GPU de gama alta.
- Análisis de robustez ante cambios de iluminación o punto de vista: al usar cámara FPV, se puede evaluar la degradación de la política al variar las condiciones visuales del entorno de cocina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de error de posición, ni comparaciones con otras políticas sobre el dataset `tomato-to-plate-320x240`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 75,2 M de parámetros en precisión completa (fp32) el modelo ocupa aproximadamente 0,3 GB, por lo que en la práctica cabe en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 3060, RTX 4060 o superior es suficiente; también cabría en GPUs integradas con suficiente memoria compartida, aunque la latencia de control sería el factor limitante.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos 4 GB de VRAM, aunque no hay confirmación del autor.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), que es el flujo documentado en la model card. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `fecasado/gfm-kitchen-tomato-fpv` | 75,2 M | no aplica | Apache 2.0 | Hugging Face (LeRobot) | Política de flow matching para tarea tomate-a-plato |
| `fecasado/giava-kitchen-tomato-fpv` | no disponible | no aplica | no disponible en la informacion | Hugging Face (LeRobot) | Variante del mismo autor para la misma tarea; arquitectura no confirmada |
| Políticas ACT de LeRobot | no disponible | no aplica | Apache 2.0 (LeRobot) | Hugging Face / GitHub | Referencia estándar de imitación en LeRobot; parámetros variables según configuración |
| Diffusion Policy | no disponible | no aplica | según implementación | Repositorios de investigación | Alternativa de imitación generativa; no se dispone de comparación directa con este checkpoint |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa entre estas alternativas.

## Limitaciones y advertencias

- Model card incompleta: el propio autor deja el campo "Model type not recognized — please update this template", por lo que faltan detalles esenciales de arquitectura, datos y evaluación.
- Tarea única: la política está entrenada para una tarea concreta (tomate a plato) en un entorno de cocina; no se debe esperar generalización a otros objetos, posiciones o robots.
- Sin métricas publicadas: no hay tasas de éxito ni evaluación cuantitativa, por lo que no se puede afirmar su fiabilidad en producción.
- Riesgo de sobreajuste al dataset: al no documentarse el número de episodios ni la variabilidad del dataset, es probable que la política sea sensible a cambios de iluminación, fondo o posición inicial.
- Sin información sobre sesgos: no se documentan sesgos conocidos, pero al ser un modelo visual entrenado con datos limitados puede heredar los sesgos de la distribución de entrenamiento.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene revisar la licencia del dataset asociado antes de reutilizarlo.
- Sin idiomas ni contexto: no aplica como modelo de lenguaje; cualquier uso fuera del control robótico no está soportado.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fecasado/gfm-kitchen-tomato-fpv
- Variante del mismo autor: https://huggingface.co/fecasado/giava-kitchen-tomato-fpv
- Dataset asociado: https://huggingface.co/datasets/fecasado/tomato-to-plate-320x240
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
