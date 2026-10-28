# LINUAN/pi0_pick_and_place

## Resumen

`LINUAN/pi0_pick_and_place` es un ajuste fino (fine-tune) del modelo fundacional robótico π₀ (`lerobot/pi0_base`) publicado por el usuario LINUAN en Hugging Face. Se trata de una política Vision-Language-Action (VLA) especializada en una única tarea de manipulación: recoger un objeto con forma de paralelepípedo y colocarlo dentro de un cilindro (instrucción en chino: «把长方体放进圆柱体»). El modelo consume tres imágenes RGB de 224×224 píxeles y un vector de estado de 32 dimensiones, y emite un vector de acción de 6 dimensiones, adecuado para un brazo seguidor tipo `so_follower` (familia SO-100/SO-101 de LeRobot).

El modelo base π₀ lo desarrolla Physical Intelligence y se distribuye con licencia Apache 2.0; la implementación utilizable aquí es la de LeRobot, adaptada del repositorio OpenPI de los autores originales. π₀ combina un backbone de visión-lenguaje con un «action expert» que genera acciones mediante flow matching, lo que permite mapear instrucciones en lenguaje natural e imágenes de cámara a comandos motores de alta frecuencia.

Su relevancia es práctica: es un ejemplo reproducible de cómo adaptar un modelo fundacional robótico de ~4.028 millones de parámetros a un robot de bajo coste con solo 48 episodios (28.800 fotogramas a 30 FPS) y 10.500 pasos de entrenamiento. No obstante, el repositorio no incluye resultados de evaluación en robot real, por lo que su tasa de éxito es desconocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) tipo transformer con backbone vision-lenguaje y action expert con flow matching (π₀, implementacion LeRobot/OpenPI) |
| Parametros totales | 4.028.019.472 (según safetensors del repositorio) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; los pesos se distribuyen en safetensors (se puede cuantizar a fp16/bf16, int8 o int4 con herramientas externas) |
| Idiomas soportados | no disponible (la instruccion de la tarea esta en chino: «把长方体放进圆柱体») |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `lerobot`; tamano del repo 10,2 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `lerobot/pi0_base`, la implementación en LeRobot del π₀ de Physical Intelligence (paper arXiv:2410.24164). π₀ es una política generalista que combina un modelo de visión-lenguaje preentrenado con un módulo «action expert» que produce secuencias de acciones continuas mediante flow matching, en lugar de decodificación autoregresiva de tokens discretos. El resultado es un modelo que recibe imágenes de varias cámaras más una instrucción en lenguaje natural y devuelve acciones motoras a la frecuencia de control del robot. En este repositorio concreto la entrada son tres vistas (`observation.images.base_0_rgb`, `observation.images.left_wrist_0_rgb`, `observation.images.right_wrist_0_rgb`, todas de 3×224×224) más `observation.state` de shape (32,), y la salida es `action` de shape (6,).

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `LINUAN/pick_and_place`: 48 episodios, 28.800 fotogramas a 30 FPS, una única tarea («把长方体放进圆柱体») y robot `so_follower`. La configuración fue de 10.500 pasos, batch size 8, optimizador AdamW, learning rate 2,5e-05 y semilla 1000. No se documenta el número de tokens de entrenamiento ni si hubo fases de RLHF/DPO; al tratarse de aprendizaje por imitación sobre un dataset propio, no se espera alineamiento por preferencias. Tampoco se detalla si se congelaron capas del backbone ni qué aumentos de datos se aplicaron.

## Capacidades

- Control robótico de manipulación extremo a extremo: genera comandos de 6 grados de libertad a partir de imágenes y estado de las articulaciones.
- Seguimiento de instrucciones en lenguaje natural: la tarea se especifica con el texto `--task="把长方体放进圆柱体"` en el comando de inferencia.
- Fusión de múltiples cámaras: integra una vista frontal/base y dos vistas de muñeca en una sola política.
- Política reactiva a 30 FPS, sincronizada con la frecuencia de captura del dataset de entrenamiento.
- Aprendizaje por imitación: capacidad de ser reentrenado con el mismo pipeline (`lerobot-train`) sobre nuevos datasets.
- Soporte de tool calling / function calling: no disponible (no aplica; es un modelo de acción motora, no un LLM conversacional).
- Soporte de agentes multi-paso: no disponible.
- Capacidades multilingües: no documentadas; la única instrucción registrada está en chino.
- Modo «thinking», visión general, audio o matemáticas: no disponible; el modelo no expone estas capacidades en la model card.

## Casos de uso

- Automatización de pick-and-place en línea de montaje: la política ejecuta la secuencia de aproximación, agarre y deposición de una pieza prismática en un receptáculo cilíndrico, replicando los 48 episodios teleoperados de entrenamiento.
- Base para un sistema de clasificación de piezas: sustituyendo el receptáculo y reentrenando con nuevos episodios, el mismo pipeline sirve para separar geometrías distintas (cubo, cilindro, prisma).
- Prototipado rápido en robótica de bajo coste: al estar pensado para `so_follower` (brazos SO-100/SO-101), permite validar una política VLA sin acceso a hardware industrial.
- Benchmark interno de imitación: sirve como referencia para comparar recetas de fine-tune (número de episodios, learning rate, pasos) sobre el mismo robot y tarea.
- Docencia e investigación en VLA: el modelo y su dataset asociado permiten estudiar el efecto del número de demostraciones y de las vistas de cámara en el éxito de la tarea.
- Recolección de datos asistida: combinado con `lerobot-rollout`, se puede usar para generar ejecuciones iniciales que un operador corrige después (DAgger-like), acelerando la creación de nuevos datasets.
- Manipulación en entornos con oclusión parcial: el uso de dos cámaras de muñeca además de la vista base aporta información cuando la pinza tapa el objeto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explícitamente la nota «No evaluation results have been provided for this policy yet», y no se reportan tasas de éxito en robot real, número de ensayos ni condiciones de evaluación (posiciones de objeto, iluminación, distractores).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8-10 GB en bf16/fp16 solo para pesos (4,028 mil millones de parámetros) más activaciones de las tres cámaras a 224×224; en int8 bajaría a unos 4-5 GB y en int4 a unos 2-3 GB (estimaciones, no publicadas por el autor).
- GPU recomendadas: el modelo base π₀ se ha descrito públicamente como ejecutable en una única RTX 4090; para entrenamiento con batch 8 conviene una A100/H100 de 40-80 GB o una RTX 4090/5090 con batch reducido y gradient accumulation.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en RTX 4090 (24 GB) y en GPUs de 16 GB con cuantización; no se han publicado mediciones oficiales para este fine-tune.
- Opciones de despliegue: `lerobot-rollout` (CLI de LeRobot) con `--policy.path=LINUAN/pi0_pick_and_place`; OpenPI de Physical Intelligence; PyTorch con los safetensors del repo. vLLM, llama.cpp, Ollama y TGI no están soportados, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. El control se emite a 30 FPS, por lo que en la práctica se requiere inferencia por debajo de 33 ms por paso de control; no se documenta si el autor alcanzó ese régimen.
- Almacenamiento: 10,2 GB de repositorio, más el dataset de entrenamiento si se va a reentrenar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entradas | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `LINUAN/pi0_pick_and_place` | 4.028.019.472 | 3 imágenes 224×224 + estado (32,) → acción (6,) | Pick-and-place especifico (48 episodios) | Apache 2.0 | Hugging Face, 0 descargas |
| `lerobot/pi0_base` | no disponible (misma familia π₀) | Configurable por dataset | Politica generalista preentrenada, punto de partida de este fine-tune | Apache 2.0 | Hugging Face |
| `hptran178/pi0_pick-and-place` | no disponible | Configurable por dataset | Fine-tune de π₀ para pick-and-place, mismo enfoque y mismo pipeline LeRobot | no disponible | Hugging Face |
| SmolVLA (`lerobot/smolvla_base`) | ~450 millones | Imágenes + estado → acciones | VLA compacto para robots de bajo coste | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento comparables (tasas de éxito) para ninguno de los modelos de la tabla en la información proporcionada, por lo que la comparación se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasa de éxito publicada; no se puede afirmar que la política funcione de forma fiable en un robot físico.
- Especialización extrema: entrenado para una única tarea y un único tipo de robot (`so_follower`); no generalizará a otras tareas, objetos ni morfologías sin reentrenamiento.
- Dataset muy pequeño: 48 episodios y 28.800 fotogramas son insuficientes para cubrir variaciones de iluminación, posición inicial del objeto, fondos o distractores; se espera sobreajuste a las condiciones de recogida.
- Dependencia de las cámaras: los nombres y la configuración de las cámaras deben coincidir exactamente con las claves de observación del entrenamiento (`base_0_rgb`, `left_wrist_0_rgb`, `right_wrist_0_rgb`); un montaje distinto invalida la política.
- Instrucción en chino: la única tarea registrada está en chino; no hay evidencia de que el modelo responda a instrucciones en castellano u otros idiomas.
- Riesgo de alucinación en sentido robótico: la política puede generar trayectorias plausibles pero incorrectas (colisiones, agarres fallidos) sin señal de incertidumbre; requiere parada de emergencia y supervisión.
- Sesgos: no documentados; al derivar de un modelo base entrenado con datos robóticos diversos, puede heredar sesgos de los datasets originales de π₀ (no especificados en la información disponible).
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías; conviene conservar el aviso de licencia y citar π₀ y LeRobot.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin Issues ni discusión asociada; soporte comunitario inexistente.
- Fecha de creación y actualización anómala (2026) en los metadatos del repositorio; conviene verificar la vigencia antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LINUAN/pi0_pick_and_place
- Dataset de entrenamiento: https://huggingface.co/datasets/LINUAN/pick_and_place
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=LINUAN/pick_and_place
- Modelo base: https://huggingface.co/lerobot/pi0_base
- Blog de π₀ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi0
- Paper π₀ (arXiv:2410.24164): https://arxiv.org/abs/2410.24164
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Guía de π₀ en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi0
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Guía de grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Artículo divulgativo sobre la liberación de π₀: https://www.marktechpost.com/2025/02/06/%CF%800-released-and-open-sourced-a-general-purpose-robotic-foundation-model-that-could-be-fine-tuned-to-a-diverse-range-of-tasks/
- Fine-tune similar de otro autor: https://huggingface.co/hptran178/pi0_pick-and-place
