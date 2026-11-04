# lichtphyz/act_v3_aug_desktop

## Resumen

ACT v3 aug desktop es una política de control robótico basada en Action Chunking with Transformers (ACT), desarrollada por el usuario lichtphyz y publicada en HuggingFace bajo licencia Apache 2.0. El modelo resuelve una tarea concreta de manipulación: un brazo robótico SO-101 de 6 grados de libertad debe recoger un bloque de madera y depositarlo en una caja, usando dos cámaras (una frontal de área de trabajo y otra en la muñeca). No es un modelo de lenguaje ni un modelo generativo de propósito general, sino un policy model entrenado con LeRobot para control motor de extremo a extremo.

La arquitectura combina un backbone visual ResNet-18 preentrenado en ImageNet con un transformer de 512 dimensiones (4 capas de encoder y 1 de decoder) y un VAE con latente de 32 dimensiones y peso KL de 10. El modelo tiene 51.668.614 parámetros totales y genera chunks de 100 acciones (3,3 segundos a 30 fps), lo que permite un control suave y anticipatorio. Se entrenó sobre 125 episodios teleoperados (55.677 frames) con aumento de imagen, durante 80.000 pasos en una única RTX 4080.

Su relevancia actual radica en que forma parte de una comparativa pública y reproducible de políticas robóticas (ACT frente a Diffusion Policy y SmolVLA) sobre el mismo dataset y robot, con evaluaciones en robot real publicadas. El modelo alcanza 9/10 éxitos en la tarea, lo que lo convierte en una referencia útil para investigadores que evalúan métodos de imitation learning en robótica de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): ResNet-18 + transformer 512-dim, 4 capas encoder / 1 capa decoder, VAE (latente 32, KL weight 10) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política de control; chunk de 100 acciones, 3,3 s a 30 fps) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es un transformer encoder-decoder que mapea observaciones multimodales (estado de las articulaciones de 6 dimensiones y dos imágenes RGB de 480×640) a secuencias de acciones. El backbone visual es una ResNet-18 con pesos de ImageNet que procesa las cámaras frontal y de muñeca; las características resultantes se combinan con el estado proprioceptivo y se pasan por un transformer de 512 dimensiones con 4 capas de encoder y 1 de decoder. Un VAE con latente de 32 dimensiones y peso KL de 10 modela la variabilidad de las demostraciones humanas, lo que ayuda a capturar la multimodalidad de las trayectorias.

El entrenamiento se realizó con LeRobot 0.6.2 sobre 125 episodios teleoperados (55.677 frames a 30 fps): 100 demostraciones de block-to-bin, 15 episodios "idle" (mesa vacía o bloque ya en la caja) y 10 episodios de recuperación (fallo de agarre, reagarre y depósito). Se aplicó aumento de imagen (brillo, contraste, saturación, tono, nitidez y pequeñas transformaciones afines) para mejorar la robustez. La configuración fue de 80.000 pasos, batch size 8, optimizador AdamW con learning rate 1e-5 constante y semilla 1000. No se menciona RLHF ni DPO, ya que no es un modelo de lenguaje.

La innovación principal es el chunking de acciones: el modelo predice 100 acciones de golpe, lo que reduce el error de acumulación y permite un control más fluido. En evaluación se recomienda usar temporal ensembling (coeficiente 0,01, n_action_steps=1) para suavizar las predicciones entre chunks; sin él, el modelo ejecuta cada chunk en bucle abierto y puede fallar agarres.

## Capacidades

- Control robótico de manipulación: agarre y depósito de un bloque de madera en una caja con un brazo SO-101 de 6 articulaciones.
- Percepción multimodal: procesa simultáneamente estado de articulaciones (6 dimensiones) y dos cámaras RGB (frontal y de muñeca) a 480×640.
- Generación de acciones en chunks: produce secuencias de 100 acciones (3,3 s a 30 fps) para movimientos suaves y anticipatorios.
- Recuperación de errores: entrenado con 10 episodios de reagarre tras fallo, lo que le permite reintentar agarres fallidos.
- Robustez a condiciones "idle": aprende a mantenerse en reposo cuando no hay bloque o ya está en la caja.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras capacidades cognitivas.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo puede ejecutar la tarea de recoger un bloque y depositarlo en una caja con un SO-101, usando las cámaras frontal y de muñeca para localizar el objeto y verificar el agarre. Es adecuado por su entrenamiento específico en esta tarea y su tasa de éxito del 90% en robot real.
- Benchmark de imitation learning: sirve como referencia reproducible para comparar ACT con Diffusion Policy y SmolVLA sobre el mismo dataset y robot, gracias a que las evaluaciones y los datos de rollout son públicos.
- Investigación en robótica de bajo coste: el SO-101 es un brazo económico y el modelo se entrenó en una sola RTX 4080, lo que facilita replicar experimentos en entornos con recursos limitados.
- Desarrollo de pipelines de recuperación de errores: los episodios de reagarre permiten estudiar cómo el modelo reintenta tras un fallo de agarre, útil para diseñar estrategias de robustez en producción.
- Evaluación de temporal ensembling: el modelo está pensado para ejecutarse con temporal_ensemble_coeff=0.01 y n_action_steps=1, lo que lo convierte en un caso práctico para medir el impacto del ensamblado temporal en políticas de chunking.
- Docencia y formación en robótica: el repositorio incluye comandos de entrenamiento, datos y lecciones aprendidas, lo que facilita usarlo como ejemplo completo de un flujo LeRobot de extremo a extremo.
- Pruebas de aumento de datos: al haberse entrenado con aumento de imagen, permite estudiar cómo esta técnica afecta a la robustez frente a cambios de iluminación y posicionamiento en tareas de manipulación.

## Benchmarks y rendimiento

| Tarea | Ensayos | Éxitos | Tasa de éxito |
|---|---|---|---|
| Put the block in the bin (robot real, temporal ensembling) | 10 | 9 | 90% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no es un modelo de lenguaje. La única métrica publicada es la evaluación en robot real descrita arriba. El fallo se produjo en uno de los primeros episodios (1, 2 o 3). Dos éxitos golpearon el borde de la caja porque el brazo no se elevó lo suficiente o el agarre estaba descentrado, aunque el bloque entró igualmente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros y dos imágenes de 480×640, el modelo es muy ligero y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: una RTX 4080 fue suficiente para entrenar 80.000 pasos con batch size 8; para inferencia basta con una GPU consumer moderna (RTX 3060 o superior) o incluso CPU para pruebas lentas.
- Cabe en GPU consumer: sí, con margen amplio; el repositorio ocupa 0,2 GB.
- Opciones de despliegue: LeRobot (lerobot-rollout) es la vía documentada; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles; la evaluación se hizo en tiempo real con episodios de hasta 30 s y control a 30 fps.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto/chunk | Éxito en robot real | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| lichtphyz/act_v3_aug_desktop | ACT (ResNet-18 + transformer + VAE) | 51,7 M | chunk de 100 acciones (3,3 s) | 9/10 (90%) | apache-2.0 | HuggingFace |
| lichtphyz/diffusion_v3_desktop | Diffusion Policy | no disponible | no disponible | 8/10 (80%) | no disponible | HuggingFace |
| lichtphyz/smolvla_v3_desktop | SmolVLA | no disponible | no disponible | 7/10 (70%) | no disponible | HuggingFace |

Los tres modelos se entrenaron sobre el mismo dataset (lichtphyz/so101_block_to_bin_v3) y se evaluaron en el mismo robot SO-101, lo que permite una comparación directa. ACT obtiene la mejor tasa de éxito de los tres en la información disponible.

## Limitaciones y advertencias

- El modelo solo funciona con una colocación de cámara y un espacio de trabajo cercanos a los datos de entrenamiento; no generaliza a otras disposiciones sin reentrenamiento.
- Sin temporal ensembling, el modelo ejecuta cada chunk de 100 acciones en bucle abierto y puede fallar agarres con frecuencia; con chunks cortos sin ensamblado (por ejemplo, n_action_steps=10), el brazo se queda quieto en reposo porque las demostraciones empiezan con unos 2 s de inmovilidad.
- La tasa de éxito del 90% se midió con solo 10 episodios, por lo que la incertidumbre estadística es alta.
- Riesgo de alucinación no aplica en el sentido lingüístico, pero sí existe riesgo de acciones erróneas o agarres fallidos ante cambios de iluminación, posición del bloque o del contenedor.
- No se documentan sesgos demográficos ni lingüísticos por ser un modelo de robótica; los sesgos relevantes son los del dataset de demostraciones (posiciones, alturas y agarres concretos).
- La licencia Apache 2.0 permite uso comercial, pero el modelo está entrenado para una tarea y un robot específicos; su uso en producción requiere validación adicional y un sistema de seguridad externo.
- No hay información sobre cuantizaciones ni sobre latencia en hardware distinto al usado en la evaluación.
- El modelo no procesa lenguaje natural más allá de la cadena de tarea fija "Put the block in the bin.".

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lichtphyz/act_v3_aug_desktop
- Dataset de entrenamiento: https://huggingface.co/datasets/lichtphyz/so101_block_to_bin_v3
- Dataset de rollouts de evaluación: https://huggingface.co/spaces/lerobot/visualize_dataset?path=lichtphyz/rollout_act_v3_aug_desktop
- Colección SO-101 block-to-bin: https://huggingface.co/collections/lichtphyz/so-101-block-to-bin-act-vs-diffusion-policy-6ad6ca5c5e111b426bb1f8a6
- Repositorio de código y lecciones aprendidas: https://github.com/Lichtphyz/so101-block-to-bin
- Paper de ACT: https://huggingface.co/papers/2304.13705
- LeRobot: https://github.com/huggingface/lerobot
- Modelo hermano Diffusion Policy: https://huggingface.co/lichtphyz/diffusion_v3_desktop
- Modelo hermano SmolVLA: https://huggingface.co/lichtphyz/smolvla_v3_desktop
- Rollouts de Diffusion Policy: https://huggingface.co/datasets/lichtphyz/rollout_diffusion_v3_desktop
