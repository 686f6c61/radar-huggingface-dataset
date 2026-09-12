# fecasado/gfm-cubes-vit-dino-v1

## Resumen

gfm-cubes-vit-dino-v1 es una política robótica (policy) entrenada y publicada por el usuario fecasado en Hugging Face mediante LeRobot, la librería de aprendizaje por imitación del ecosistema Hugging Face. El identificador del repositorio y la etiqueta `gaze_flow_matching` indican que se trata de un modelo de flujo (flow matching) aplicado a la generación de acciones, entrenado sobre el dataset `fecasado/Ncubes-to-Nbaskets-320x240`, que describe una tarea de manipulación consistente en trasladar cubos a cestas con observaciones de 320x240 píxeles.

El modelo tiene 85.968.410 parámetros y un repositorio de 0,3 GB en formato safetensors, con licencia Apache 2.0. No es un modelo de lenguaje ni un modelo fundacional multimodal de propósito general: es un controlador visuomotor específico para una tarea y un montaje robótico concretos, por lo que sus capacidades, benchmarks y requisitos se evalúan en términos de éxito de tarea y control en tiempo real, no de generación de texto.

Su relevancia actual es la de un ejemplo práctico de entrenamiento de políticas visuomotoras con flow matching dentro del ecosistema LeRobot, un marco que permite entrenar, evaluar y desplegar políticas sobre robots de bajo coste tipo SO-100. La model card publicada está prácticamente sin completar (conserva el aviso de plantilla "Model type not recognized"), por lo que buena parte de los detalles técnicos no están documentados por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política visuomotora con flow matching (etiqueta `gaze_flow_matching`); el autor no especifica la arquitectura en la model card. El nombre del repositorio sugiere un backbone de visión tipo ViT con características DINO, pero esto no está confirmado en la documentación disponible |
| Parámetros totales | 85.968.410 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje); no se especifica el horizonte de observación ni la ventana de historial de la política |
| Tipos de cuantización | No disponible (repositorio en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | No disponible (no aplica: no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |
| Librería | LeRobot |
| Pipeline declarado | Robotics |
| Dataset de entrenamiento | `fecasado/Ncubes-to-Nbaskets-320x240` |
| Tamaño del repositorio | 0,3 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-11 |

## Arquitectura y entrenamiento

La información publicada no detalla la arquitectura interna. Lo único confirmado es que se trata de una política etiquetada como `gaze_flow_matching`, entrenada con LeRobot sobre un dataset propio de demostraciones teleoperadas para la tarea "N cubos a N cestas" con imágenes de 320x240. El término flow matching hace referencia a una familia de modelos generativos que aprenden un campo de velocidad que transforma una distribución simple (por ejemplo, ruido gaussiano) en la distribución objetivo de acciones; en robótica se emplean como cabeza de acción que genera secuencias de comandos motores condicionadas en las observaciones. Esto implica que la inferencia requiere integrar numéricamente varios pasos, lo que añade latencia frente a políticas con regresión directa de acciones.

Tampoco se documentan el número de tokens o episodios de entrenamiento, la composición del dataset, el preprocesado de las observaciones, ni si hubo etapas de ajuste fino, RLHF o DPO (procedimientos que, por otra parte, no son habituales en aprendizaje por imitación robótico). La model card incluida en el repositorio es la plantilla por defecto de LeRobot: describe los comandos genéricos `lerobot-train` y `lerobot-record` (con `--policy.type=act` como ejemplo de la propia plantilla, no necesariamente la política de este repositorio) y no aporta información específica sobre el entrenamiento de este checkpoint. No se puede confirmar, por tanto, ninguna innovación técnica concreta más allá del uso de flow matching y de la elección del backbone visual.

## Capacidades

- Control visuomotor para manipulación robótica: genera comandos de acción a partir de observaciones de cámara de 320x240 píxeles.
- Ejecución de una tarea concreta de pick-and-place: trasladar cubos a cestas en el montaje definido por el dataset `Ncubes-to-Nbaskets-320x240`.
- Aprendizaje por imitación: reproduce comportamientos derivados de demostraciones, no de recompensas explícitas.
- Integración con el flujo de trabajo de LeRobot: entrenamiento con `lerobot-train` y evaluación o inferencia con `lerobot-record`.
- Compatibilidad declarada con robots del ecosistema LeRobot; el ejemplo de la model card usa `--robot.type=so100_follower`.
- Generación de acciones por flow matching: modela una distribución de acciones en lugar de una única acción determinista, lo que permite capturar multimodalidad en las demostraciones.
- Tool calling / function calling: no disponible (no aplica).
- Capacidades de agente o razonamiento multi-paso: no disponible (no aplica).
- Capacidades multilingües: no disponible (no procesa lenguaje).
- Modo de pensamiento, visión general, audio o generación de texto: no disponible (modelo específico de robótica).

## Casos de uso

- Manipulación pick-and-place de cubos en cestas: uso directo previsto por el autor, replicando la tarea del dataset de entrenamiento con observaciones de 320x240 píxeles e imágenes de baja resolución para reducir coste computacional.
- Base de partida para fine-tuning en tareas de clasificación de objetos: al estar en LeRobot y en safetensors, se puede reentrenar con un dataset propio de demostraciones para una tarea similar de recogida y depósito.
- Despliegue en robots de bajo coste tipo SO-100: la model card incluye un ejemplo de evaluación con `so100_follower`, lo que lo sitúa en el segmento de brazos educativos y de prototipado con hardware asequible.
- Investigación en políticas generativas de acción: sirve como referencia reproducible para comparar flow matching frente a alternativas como ACT o Diffusion Policy dentro del mismo marco de entrenamiento.
- Evaluación de robustez visuomotora: al ser un modelo pequeño (86 M de parámetros) y de pesos abiertos, permite experimentos controlados de variación de iluminación, posición de cámara o fondo para medir degradación del éxito de tarea.
- Prototipado de pipelines de robótica en simulación y transferencia a real: útil como punto de partida para estudiar el gap sim-to-real en tareas de manipulación con imágenes de baja resolución.
- Automatización de demostraciones docentes: por su tamaño reducido y licencia permisiva, puede ejecutarse en estaciones de trabajo con GPU de gama media para prácticas de aprendizaje por imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, número de episodios de evaluación, ni comparaciones con otras políticas. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que tampoco existe validación por parte de la comunidad.

## Requisitos de hardware

- VRAM estimada para inferencia: a partir de los 85.968.410 parámetros, el peso en precisión completa (fp32) ocupa aproximadamente 0,34 GB y en fp16/bf16 aproximadamente 0,17 GB. Sumando activaciones de la torre de visión y del decodificador de acciones, una estimación razonable es inferior a 2 GB de VRAM para inferencia en fp16, aunque no hay mediciones publicadas. Estas cifras son estimaciones derivadas del recuento de parámetros, no datos del autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM debería ser suficiente para inferencia. Para entrenamiento, una RTX 3060, RTX 4070, RTX 4090 o equivalentes son opciones adecuadas por el tamaño del modelo y del dataset; no se documentan requisitos oficiales.
- Cabe en GPU de consumo: sí, con alta probabilidad, dado el tamaño del modelo. También es plausible la ejecución en CPU para inferencia a baja frecuencia de control, aunque no hay datos publicados al respecto.
- Opciones de despliegue: LeRobot (`lerobot-train`, `lerobot-record`) sobre PyTorch. vLLM, llama.cpp, Ollama y TGI no aplican, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Como consideración general de la familia flow matching, la inferencia requiere varios pasos de integración numérica, lo que incrementa la latencia frente a políticas de acción directa, pero no se dispone de mediciones para este checkpoint.

## Comparativa con modelos similares

No se dispone de datos numéricos comparativos en la información proporcionada. Las alternativas del mismo ecosistema (LeRobot) incluyen ACT, Diffusion Policy y políticas VLA como SmolVLA, pero no se han facilitado sus parámetros, licencias ni resultados, por lo que cualquier comparación cuantitativa sería especulativa.

| Modelo | Tipo de política | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gfm-cubes-vit-dino-v1 | Flow matching visuomotor | 85.968.410 | No aplica | Apache 2.0 | Hugging Face (LeRobot) |
| ACT | Regresión de acciones con transformer (referenciada en la plantilla de la model card) | No disponible | No aplica | No disponible | Ecosistema LeRobot |
| Diffusion Policy | Política generativa por difusión | No disponible | No aplica | No disponible | Ecosistema LeRobot |
| SmolVLA | Política visión-lenguaje-acción | No disponible | No disponible | No disponible | Ecosistema LeRobot |

## Limitaciones y advertencias

- Model card incompleta: el autor no ha rellenado la plantilla ("Model type not recognized"), por lo que se desconoce la arquitectura exacta, el régimen de entrenamiento, el número de episodios y los hiperparámetros.
- Especificidad de tarea y montaje: el modelo está entrenado para una única tarea (cubos a cestas) y un entorno concreto. Es probable que no generalice a otras tareas, objetos o disposiciones de cámara sin reentrenamiento.
- Dependencia del dataset: todo el comportamiento aprendido proviene de `fecasado/Ncubes-to-Nbaskets-320x240`. Cualquier sesgo de las demostraciones (posiciones, iluminación, colores de objeto) se traslada a la política.
- Sin datos de generalización: no hay cifras de tasa de éxito, ni en el conjunto de entrenamiento ni en entornos nuevos, ni evaluación sim-to-real.
- Resolución de observación limitada: 320x240 píxeles puede ser insuficiente para tareas que requieran detección fina de objetos pequeños o agarres precisos.
- Riesgo de fallo silencioso: como política de imitación, puede producir acciones plausibles pero incorrectas ante situaciones fuera de distribución, sin ningún mecanismo de detección de incertidumbre documentado.
- Sin validación comunitaria: 0 descargas y 0 likes; el checkpoint no ha sido verificado por terceros.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero el usuario debe verificar por su cuenta las licencias del dataset asociado y de los componentes preentrenados que se hayan podido utilizar (por ejemplo, pesos de un backbone visual), ya que la model card no los detalla.
- Idiomas: no aplica, al no tratarse de un modelo de lenguaje; no puede utilizarse para tareas de texto, traducción o generación de contenido.
- Advertencia sobre los resultados de búsqueda: las consultas web realizadas no devolvieron información relacionada con este modelo, por lo que no existe material externo (papers, blogs o demos) que respalde o amplíe lo publicado por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fecasado/gfm-cubes-vit-dino-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/fecasado/Ncubes-to-Nbaskets-320x240
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas de imitación: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes; las consultas devolvieron contenido sin relación con el modelo.
