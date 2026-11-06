# fecasado/giava-kitchen-toasts-fpv

## Resumen

`giava-kitchen-toasts-fpv` es una política robótica entrenada con LeRobot y publicada en Hugging Face por el usuario `fecasado`. No se trata de un modelo de lenguaje, sino de un modelo de aprendizaje por imitación (imitation learning) orientado al control de un brazo robótico en una tarea concreta de manipulación en cocina: trasladar tostadas a un plato. El pipeline declarado es `robotics` y la arquitectura interna se etiqueta como `gaze_flow_matching`, una variante de flow matching probablemente condicionada por la mirada (gaze) del operador o de la cámara en primera persona (FPV, first-person view).

El modelo cuenta con 235.899.950 parámetros en formato safetensors y un repositorio de 0,9 GB, lo que lo sitúa en el rango de las políticas de manipulación de tamaño medio. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y modificación sin restricciones adicionales significativas. La fecha de creación y actualización (noviembre de 2026) indica que es un artefacto reciente y muy probablemente experimental.

Su relevancia es acotada: sirve como ejemplo reproducible de un pipeline completo de LeRobot (entrenamiento, publicación y evaluación) para una tarea de pick-and-place en entorno doméstico. No compite con modelos fundacionales de robótica de propósito general, sino que es una política especializada, de nicho y con cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gaze_flow_matching (política de imitación sobre LeRobot; no se detalla la topología interna) |
| Parametros totales | 235.899.950 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; depende del horizonte de observación definido en el dataset) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo robótico, sin interfaz de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio LeRobot, 0,9 GB) |

## Arquitectura y entrenamiento

La información disponible es muy limitada. La etiqueta `gaze_flow_matching` sugiere una política basada en flow matching, una familia de modelos generativos que aprenden un campo de velocidades para transformar una distribución simple (por ejemplo, ruido gaussiano) en la distribución de acciones expertas. El prefijo "gaze" indica que las observaciones incluyen información de mirada, probablemente obtenida de un dispositivo de eye-tracking o de una cámara montada en la cabeza del operador, lo que condiciona la predicción de acciones a la zona de la escena que el humano estaba atendiendo.

El entrenamiento se realizó con LeRobot sobre el dataset `fecasado/toasts-to-plate-v2-320x240`, cuyas resoluciones de imagen (320x240) indican observaciones de baja resolución, típicas de cámaras de robot de bajo coste. No se especifican el número de episodios, la composición del dataset, el número de tokens ni si hubo etapas de RLHF o DPO; en robótica de imitación estos términos no aplican del mismo modo y no hay datos publicados al respecto. La model card es una plantilla sin cumplimentar ("Model type not recognized — please update this template"), por lo que no hay información sobre innovaciones técnicas, aumentación de datos ni estrategia de regularización.

## Capacidades

- Control de un brazo robótico para una tarea de manipulación concreta: recoger tostadas y depositarlas en un plato.
- Aprendizaje por imitación a partir de demostraciones humanas registradas en el dataset `toasts-to-plate-v2-320x240`.
- Condicionamiento por mirada (gaze), lo que permite que la política enfoque la predicción en las regiones de la escena relevantes para la tarea.
- Generación de acciones continuas mediante flow matching, adecuada para control motor suave.
- Integración con el ecosistema LeRobot: entrenamiento con `lerobot-train` y evaluación con `lerobot-record`.
- No dispone de tool calling, function calling, razonamiento multi-paso simbólico, capacidades multilingües ni modo "thinking". No es un modelo de lenguaje ni un VLM de propósito general.
- No se documentan capacidades de generalización a otras tareas, objetos o entornos distintos del dataset de entrenamiento.

## Casos de uso

- Reproducción de un pipeline de imitación en robótica: sirve como referencia práctica para entrenar una política con LeRobot desde cero usando `lerobot-train` y evaluarla con `lerobot-record` sobre un robot SO-100 follower.
- Automatización de una celda de pick-and-place en cocina: el modelo puede ejecutar la secuencia de recoger una tostada y colocarla en un plato en un entorno controlado, siempre que las condiciones de iluminación y la posición de los objetos se aproximen a las del dataset.
- Investigación en condicionamiento por mirada: permite estudiar si la señal de gaze mejora la precisión de la política frente a políticas puramente visuales, comparando variantes entrenadas con y sin esta señal.
- Benchmark interno de flow matching para manipulación: útil como línea base para comparar con políticas ACT, Diffusion Policy o VQ-BeT en la misma tarea y dataset.
- Docencia y demostraciones: al ser un repositorio pequeño (0,9 GB) y con licencia permisiva, es adecuado para talleres sobre LeRobot y para ilustrar el ciclo completo de entrenamiento, publicación y evaluación de una política.
- Prototipado rápido en robótica de bajo coste: con observaciones de 320x240 y un modelo de 236 M de parámetros, puede ejecutarse en hardware modesto junto a un SO-100, lo que facilita iteraciones rápidas en laboratorios con presupuesto limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, métricas de error de posición, curvas de aprendizaje ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 235,9 M de parámetros en precisión FP32, los pesos ocupan aproximadamente 0,94 GB; en FP16, unos 0,47 GB. A ello hay que sumar el coste de las observaciones visuales y del búfer de inferencia, por lo que un entorno con 4-8 GB de VRAM debería ser suficiente en la mayoría de configuraciones.
- GPU recomendadas: no hay recomendaciones del autor. Por tamaño, una RTX 3060, RTX 4060 o RTX 4090 son opciones razonables para inferencia; para entrenamiento, una RTX 4090 o una A100 facilitan ciclos más cortos.
- Cabe en GPU de consumo: sí, con alta probabilidad, dado el reducido número de parámetros y el tamaño del repositorio.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), que es el flujo documentado. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de política.
- Latencia y throughput: no disponibles. Dependen del robot, de la frecuencia de control y del hardware de inferencia; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / observación | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| giava-kitchen-toasts-fpv | 235,9 M | 320x240 (dataset) | Pick-and-place de tostadas | Apache 2.0 | Hugging Face, 0 descargas |
| Políticas ACT en LeRobot | no disponible | configurable | Manipulación general por imitación | Apache 2.0 (LeRobot) | Hugging Face / GitHub |
| Diffusion Policy | no disponible | configurable | Manipulación por imitación | MIT / Apache según implementación | Repositorios públicos |
| VQ-BeT | no disponible | configurable | Manipulación por imitación | MIT | Repositorios públicos |

La comparación cuantitativa no es posible: no hay métricas publicadas para este modelo ni un conjunto de evaluación común. La comparativa se limita a la categoría (políticas de imitación integradas en LeRobot) y a la licencia.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea (tostadas a un plato) y un único dataset; no se espera generalización a otros objetos, posiciones o entornos.
- Sin métricas de éxito publicadas: no hay evidencia cuantitativa de robustez, lo que impide evaluar su fiabilidad en producción.
- Model card incompleta: la plantilla no se ha cumplimentado, por lo que faltan detalles de arquitectura, datos y entrenamiento.
- Dependencia de la señal de gaze: si el despliegue no reproduce las condiciones de captura de mirada del dataset, el rendimiento puede degradarse de forma significativa.
- Sensibilidad a condiciones visuales: la resolución 320x240 y la iluminación del dataset condicionan el comportamiento; cambios de cámara, fondo o iluminación pueden invalidar la política.
- Sin soporte de lenguaje ni de herramientas: no es adecuado para tareas de razonamiento, diálogo o agentes software.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad de validación en un entorno real recae en el integrador.
- Riesgo de sobreajuste al operador: al tratarse de imitación con pocos datos (no se especifica el número de episodios), es probable que la política reproduzca sesgos motores del demostrador.
- Fecha de publicación futura (2026): conviene verificar la procedencia y la reproducibilidad del artefacto antes de usarlo como base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fecasado/giava-kitchen-toasts-fpv
- Dataset asociado: https://huggingface.co/datasets/fecasado/toasts-to-plate-v2-320x240
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas en LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
