# fecasado/gfm-kitchen-burger-fpv

## Resumen

GFM Kitchen Burger FPV (identificador `fecasado/gfm-kitchen-burger-fpv`) es una política robótica entrenada mediante la librería LeRobot y publicada por el usuario fecasado en HuggingFace. No se trata de un modelo de lenguaje: es un controlador de imitación (imitation learning) diseñado para ejecutar una tarea concreta de manipulación en un entorno de cocina, concretamente el traslado de una hamburguesa a un plato, a partir de observaciones visuales en primera persona (FPV). El modelo emplea el tipo de política `gaze_flow_matching`, una variante de flow matching orientada a la predicción de acciones condicionada por la mirada (gaze), y se distribuye en formato safetensors con 75.248.330 parámetros.

El modelo se ha entrenado sobre el dataset `fecasado/burger-to-plate-v2-320x240`, con resolución de 320x240 píxeles, y está pensado para integrarse en el stack de LeRobot para entrenamiento, evaluación e inferencia sobre robots tipo SO-100. Su relevancia es acotada pero concreta: sirve como referencia reproducible de un pipeline completo de aprendizaje por imitación en robótica de bajo coste, con licencia Apache 2.0 y un tamaño de repositorio de 0,3 GB que facilita su descarga y despliegue en entornos de laboratorio.

Al tratarse de un modelo de política y no de un LLM, varias de las categorías habituales de esta ficha (idiomas, contexto en tokens, benchmarks de razonamiento) no aplican y se marcan como no disponibles. La información pública disponible es escasa: la model card es una plantilla de LeRobot sin detalles de arquitectura, datos de entrenamiento ni métricas de éxito.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de robótica `gaze_flow_matching` (flow matching condicionado por mirada), entrenada con LeRobot |
| Parámetros totales | 75.248.330 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplica (modelo de robótica, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | robotics |
| Librería | lerobot |
| Dataset de entrenamiento | fecasado/burger-to-plate-v2-320x240 |
| Resolución de entrada | 320x240 píxeles |
| Tamaño del repositorio | 0,3 GB |
| Fecha de creación | 2026-11-05 |

## Arquitectura y entrenamiento

La arquitectura es una política de imitación basada en flow matching con condicionamiento por mirada (`gaze_flow_matching`), implementada dentro del ecosistema LeRobot. El flow matching modela la distribución de acciones como un proceso de transporte entre una distribución base y la distribución objetivo de acciones, lo que permite generar trayectorias de control continuas condicionadas por las observaciones visuales y por la señal de mirada. No se dispone de detalles públicos sobre el número de capas, la dimensión de los embeddings, el mecanismo de atención ni la composición exacta del encoder visual.

El entrenamiento se realizó sobre el dataset `fecasado/burger-to-plate-v2-320x240`, que contiene demostraciones de la tarea de trasladar una hamburguesa a un plato capturadas a 320x240 píxeles. No se especifican en la model card el número de episodios, el número de tokens o frames de entrenamiento, ni si se aplicaron técnicas de aumento de datos o regularización. Tampoco se documenta si hubo fases de ajuste fino posteriores ni procesos de RLHF (no aplicables en este dominio). La model card emplea la plantilla estándar de LeRobot y no incluye innovaciones técnicas adicionales documentadas.

## Capacidades

- Control robótico de manipulación: genera acciones de control para ejecutar la tarea de trasladar una hamburguesa a un plato en un entorno de cocina.
- Aprendizaje por imitación a partir de demostraciones visuales en primera persona (FPV).
- Condicionamiento por mirada (gaze): la política incorpora señal de mirada como entrada adicional para guiar la predicción de acciones.
- Integración nativa con LeRobot: entrenamiento con `lerobot-train` y evaluación con `lerobot-record`.
- Compatibilidad con robots SO-100 (`so100_follower`) según los ejemplos de la model card.
- Entrada visual a resolución 320x240.
- No dispone de capacidades de generación de texto, razonamiento lingüístico, código, matemáticas, tool calling, agentes conversacionales ni procesamiento multilingüe.

## Casos de uso

- Investigación en aprendizaje por imitación: servir como referencia reproducible de una política `gaze_flow_matching` entrenada con LeRobot, permitiendo comparar variantes de arquitectura y de condicionamiento por mirada sobre una tarea de manipulación concreta.
- Reproducción de experimentos de robótica de bajo coste: el modelo se integra con robots SO-100, una plataforma asequible, lo que facilita replicar el pipeline completo de entrenamiento y evaluación en laboratorios con presupuesto limitado.
- Evaluación de políticas en entornos de cocina simulados o reales: el modelo puede desplegarse con `lerobot-record` para medir tasas de éxito en la tarea burger-to-plate y comparar con políticas base como ACT.
- Docencia y formación en robótica: el reducido tamaño del repositorio (0,3 GB) y la licencia Apache 2.0 permiten usarlo como ejemplo práctico en cursos de aprendizaje por imitación y control visual.
- Base para ajuste fino en tareas similares: al estar entrenado sobre un dataset específico de manipulación de alimentos, puede servir como punto de partida para transferir a otras tareas de pick-and-place en cocina mediante nuevo entrenamiento con LeRobot.
- Pruebas de integración de pipelines de datos: el dataset asociado y la política permiten validar flujos de captura, preprocesado a 320x240 y entrenamiento dentro de LeRobot antes de escalar a datasets mayores.
- Benchmarking de condicionamiento por mirada: permite estudiar si la señal de gaze mejora la precisión de la política frente a variantes sin gaze en la misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 75,2 millones de parámetros en safetensors, el peso de los parámetros en fp32 ronda los 0,3 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4-8 GB de VRAM es suficiente para inferencia; para entrenamiento se recomienda una RTX 3090, RTX 4090, A100 o H100 según el tamaño del dataset y el batch.
- Cabe en GPU de consumo: sí, previsiblemente en GTX 1660, RTX 3060, RTX 4060 y superiores, dado el reducido número de parámetros.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de checkpoints locales o del Hub; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo de política | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fecasado/gfm-kitchen-burger-fpv | gaze_flow_matching | 75,2 M | No aplica | Apache 2.0 | HuggingFace (LeRobot) |
| Políticas ACT de LeRobot | ACT (Action Chunking Transformer) | No disponible | No aplica | Apache 2.0 (LeRobot) | HuggingFace / GitHub |
| Políticas Diffusion Policy | Diffusion Policy | No disponible | No aplica | Según implementación | Repositorios de investigación |
| Políticas VQ-BeT | VQ-BeT | No disponible | No aplica | Según implementación | Repositorios de investigación |

La comparación se limita a familias de políticas de imitación del ecosistema LeRobot; no se dispone de métricas comparativas publicadas para este modelo concreto frente a ACT, Diffusion Policy o VQ-BeT en la misma tarea.

## Limitaciones y advertencias

- Modelo específico de una única tarea (burger-to-plate): no generaliza a otras tareas sin reentrenamiento.
- Sin métricas publicadas de tasa de éxito, robustez o generalización; no es posible evaluar su calidad objetiva a partir de la información disponible.
- Dependencia del entorno de captura: cambios en iluminación, posición de cámara, disposición de objetos o robot pueden degradar el rendimiento.
- La model card es una plantilla sin detalles de arquitectura, datos ni hiperparámetros, lo que dificulta la reproducibilidad exacta.
- Riesgo de sobreajuste al dataset de demostraciones, dado el reducido tamaño del repositorio y la ausencia de información sobre el número de episodios.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- No aplica a tareas de lenguaje, visión general o razonamiento; su uso fuera del dominio robótico no está soportado.
- Sin información sobre sesgos, alucinación o comportamiento fuera de distribución en robótica; se recomienda validación exhaustiva antes de cualquier despliegue real.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fecasado/gfm-kitchen-burger-fpv
- Dataset de entrenamiento: https://huggingface.co/datasets/fecasado/burger-to-plate-v2-320x240
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
