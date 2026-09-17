# kimhosoo/comind-actoractor-personpose-refpose-base2b

## Resumen

`kimhosoo/comind-actoractor-personpose-refpose-base2b` es un checkpoint de investigación para generación de vídeo egocéntrico multivista, desarrollado por el usuario de HuggingFace `kimhosoo` a partir del modelo base `nvidia/Cosmos-Predict2.5-2B` (2.000 millones de parámetros). El modelo implementa generación conjunta (V=2) de dos flujos ego, "leader" y "helper", que se denoisan en una única pasada forward con self-attention cruzada completa entre vistas: cada flujo atiende a los tokens y fotogramas de referencia del otro. Es el brazo `base2b` del experimento `comind_actoractor_personpose_shared_refpose`, calentado directamente desde Cosmos 2B en lugar de desde un checkpoint preentrenado con Nymeria.

El problema que aborda es la comparación joint-vs-independiente en generación de interacción social en primera persona: su contraparte `kimhosoo/comind-actoractor-personpose-refpose-singlestream` usa exactamente el mismo condicionamiento pero genera los dos flujos de forma independiente (V=1). El condicionamiento por flujo combina pose coloreada por identidad concatenada al VAE (`vae_concat`), mapa propio de warped/visibilidad, una rebanada R=4 de un conjunto de referencias compartido y greedy con esqueletos `reference_pose` coincidentes, y un mapa de rayos de Plücker en una cámara canónica compartida (rayos expresados en "target view0, frame 0").

Su relevancia es acotada y muy específica: se trata de un artefacto de investigación con 0 descargas y 0 likes, sin resultados de benchmarks publicados y sin model card más allá de la descripción del experimento. No es un modelo listo para producción, sino un punto de control intermedio (iteración 5.200) pensado para estudios comparativos de generación multivista con control de pose.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle. Modelo de generación de vídeo derivado de `nvidia/Cosmos-Predict2.5-2B`; el pipeline descrito implica denoising conjunto y uso de VAE, compatible con una arquitectura de difusión, aunque la especificación exacta no se documenta |
| Parametros totales | 2B (heredados del modelo base `nvidia/Cosmos-Predict2.5-2B`; no se declara un recuento propio) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica / no disponible: es un modelo de generación de vídeo, no un modelo de lenguaje con ventana de contexto de tokens de texto |
| Tipos de cuantizacion | No disponible. Solo se publican pesos EMA en bfloat16 |
| Idiomas soportados | No disponible (el condicionamiento es pose, mapas de warped/visibilidad y rayos de Plücker, no texto) |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch `.pt` (`model_ema_bf16.pt`, EMA en bfloat16), convertido desde el checkpoint DCP/FSDP de entrenamiento con `scripts/convert_distcp_to_pt.py` del repositorio cosmos-predict2.5. No hay safetensors ni GGUF |

Datos adicionales: repositorio de 4,1 GB, creado y actualizado el 17 de septiembre de 2026, 0 descargas y 0 likes. Modelo base declarado: `nvidia/Cosmos-Predict2.5-2B` (etiquetas `base_model:finetune:nvidia/Cosmos-Predict2.5-2B`). Etiquetas: `video-generation`, `egocentric`, `cosmos-predict2`, `region:us`.

## Arquitectura y entrenamiento

La arquitectura concreta no se detalla en la información disponible. Lo que sí se documenta es el esquema de generación: dos flujos ego (leader y helper) se denoisan conjuntamente en una sola pasada forward, con self-attention cruzada completa entre ambos (cada flujo atiende a los tokens y fotogramas de referencia del otro) y un marco de cámara canónico compartido en el que los rayos de Plücker se expresan respecto a "target view0, frame 0". El condicionamiento por flujo incluye pose coloreada por identidad concatenada al VAE, mapa propio de warped/visibilidad, una rebanada R=4 de un conjunto de referencias compartido y greedy con esqueletos `reference_pose` coincidentes, más el mapa de rayos de Plücker entre vistas.

En cuanto al entrenamiento, el brazo `base2b` se calienta directamente desde el Cosmos 2B multiview base (`nvidia/Cosmos-Predict2.5-2B`), a diferencia de los brazos `nymwarm` y `singlestream`, que parten de un checkpoint preentrenado con Nymeria. Esta ejecución continúa desde el checkpoint `iter_000002800` de un experimento previo de un colega (retomado como "guest run" en otra cuenta por disponibilidad de GPU) y avanza hasta la iteración 5.200. Se usaron 2 GPU NVIDIA H200 con `fsdp_shard_size=2` y guardado de checkpoints cada 400 iteraciones. La ejecución se detuvo automáticamente (SIGTERM vía `timeout`) unos 20 minutos antes de que expirase la asignación de GPU prestada, para garantizar un checkpoint final limpio. No se menciona RLHF, DPO ni ninguna fase de alineación; el código de entrenamiento vive en `predict2_multiview/configs/vid2vid/experiment/nymeria_pose_2actor.py` (`comind_actoractor_personpose_shared_refpose`) y no se modificó para esta ejecución.

## Capacidades

- Generación de vídeo egocéntrico multivista: produce de forma conjunta dos flujos ego (leader y helper) en una única pasada forward, con atención cruzada entre ambos.
- Generación conjunta frente a independiente: es el brazo V=2 diseñado explícitamente para compararse con la variante `singlestream` (V=1).
- Condicionamiento por pose: acepta pose coloreada por identidad vía `vae_concat` y esqueletos `reference_pose` del conjunto de referencias compartido.
- Control mediante conjunto de referencias: utiliza una rebanada R=4 de un conjunto de referencias compartido y greedy, lo que permite fijar referencias comunes a ambos flujos.
- Consistencia geométrica entre vistas: emplea un marco de cámara canónico compartido y mapas de rayos de Plücker expresados en "target view0, frame 0".
- Condicionamiento por warped/visibilidad: cada flujo recibe su propio mapa de warped y visibilidad.
- Tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no disponibles / no aplica.
- Capacidades especiales (thinking mode, visión, audio): no se documentan más allá de la generación de vídeo egocéntrico multivista; no hay modo de razonamiento ni soporte de audio descrito.

## Casos de uso

- Estudio comparativo joint vs. independiente en generación multivista: el checkpoint existe precisamente para contrastarse con `kimhosoo/comind-actoractor-personpose-refpose-singlestream`, que comparte condicionamiento pero genera cada flujo por separado. Se usaría ejecutando ambos brazos sobre el mismo conjunto de entrada y midiendo coherencia entre vistas.
- Investigación en interacción social en primera persona: permite generar pares de flujos leader-helper sincronizados, útiles para estudiar coordinación motora y dinámica de asistencia en capturas egocéntricas.
- Generación de datos sintéticos para percepción egocéntrica: las secuencias generadas, con pose y esqueletos de referencia conocidos, pueden emplearse para aumentar datasets de estimación de pose o de reconstrucción de malla humana en primera persona.
- Evaluación de consistencia geométrica multi-vista: el uso de rayos de Plücker en un marco canónico compartido permite analizar si la atención cruzada mantiene coherencia espacial entre los dos flujos, comparando con la variante independiente.
- Previsualización de animaciones con control de pose e identidad: dado un conjunto de referencias y una pose objetivo, el modelo puede generar secuencias que respeten la identidad coloreada y los esqueletos especificados.
- Aumento de datos para robótica de asistencia: los pares leader-helper generados pueden servir como material sintético para entrenar políticas o modelos de percepción en escenarios de ayuda a una persona.
- Reproducibilidad de experimentos de entrenamiento: al publicarse como checkpoint intermedio (iter 5.200) de un entrenamiento con FSDP en 2×H200, sirve para reproducir curvas de entrenamiento y continuar fine-tuning en configuraciones de recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas (FVD, PSNR, SSIM, LPIPS ni ninguna otra), no se han publicado evaluaciones automáticas ni comparaciones numéricas con la variante `singlestream`. El autor tampoco reporta resultados cualitativos con ejemplos en la información proporcionada.

| Benchmark | Resultado |
|---|---|
| FVD / PSNR / SSIM / LPIPS | No disponible |
| Comparación joint (V=2) vs. independiente (V=1) | No disponible (el checkpoint se describe como material para esa comparación, sin resultados publicados) |
| Cualquier otra métrica | No disponible |

## Requisitos de hardware

- Entrenamiento documentado: 2× NVIDIA H200 con `fsdp_shard_size=2`, checkpoints cada 400 iteraciones.
- Tamaño de pesos: el repositorio ocupa 4,1 GB e incluye `model_ema_bf16.pt` en bfloat16, coherente con un modelo de ~2B parámetros. Estimación orientativa (no publicada por el autor): los pesos en bf16 rondan los 4 GB.
- VRAM de inferencia: no disponible de forma oficial. Estimación orientativa: además de los pesos, hay que contabilizar el VAE, los latentes de vídeo multivista y las activaciones de la atención cruzada entre flujos; el pico real depende de la resolución, del número de fotogramas y del número de vistas.
- GPU recomendadas: no disponible. El entrenamiento se hizo en H200; para inferencia, cualquier GPU con suficiente VRAM para el pipeline completo de Cosmos Predict 2.5 2B debería ser suficiente, pero no hay confirmación del autor.
- ¿Cabe en GPU de consumo?: no confirmado. Un modelo de 2B en bf16 con pesos de ~4 GB es en principio candidato a GPUs de consumo con 16-24 GB (por ejemplo RTX 4090), siempre que la resolución y el número de fotogramas se mantengan moderados, pero esto es una estimación y no un dato publicado.
- Opciones de despliegue: no aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje. El despliegue requiere el árbol `cosmos-predict2.5` (incluido el script `scripts/convert_distcp_to_pt.py` para convertir el checkpoint DCP/FSDP a `.pt`) y la configuración `predict2_multiview/configs/vid2vid/experiment/nymeria_pose_2actor.py`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Condicionamiento | Generacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `kimhosoo/comind-actoractor-personpose-refpose-base2b` (este) | 2B (heredados de Cosmos-Predict2.5-2B) | Pose coloreada por identidad, warped/visibilidad, R=4 de referencias compartidas, rayos de Plücker en marco canónico | Conjunta V=2 (leader y helper en una pasada, atención cruzada completa) | apache-2.0 | Publicado en HuggingFace, 0 descargas, 0 likes |
| `kimhosoo/comind-actoractor-personpose-refpose-singlestream` | No disponible (mismo esquema, presumiblemente 2B) | Igual que el anterior | Independiente V=1 (los dos flujos ego se generan por separado) | No disponible en la informacion proporcionada | Publicado en HuggingFace |
| Brazos `nymwarm` del mismo experimento | No disponible | Igual esquema | Variantes joint | No disponible en la informacion proporcionada | Mencionados en la model card; no se proporcionan enlaces |
| `nvidia/Cosmos-Predict2.5-2B` (modelo base) | 2B | Condicionamiento multiview genérico de Cosmos | Generación de vídeo base, sin el esquema actor-actor | No disponible en la informacion proporcionada (la licencia NVIDIA del modelo base puede imponer condiciones adicionales a las del fine-tuning) | Público en HuggingFace |

No se dispone de datos de benchmark que permitan comparar rendimiento entre estas variantes; la comparación disponible es únicamente de esquema de condicionamiento y de estrategia de generación (conjunta frente a independiente).

## Limitaciones y advertencias

- Checkpoint de investigación sin evaluación: no hay benchmarks, métricas ni ejemplos cualitativos publicados; no debe tratarse como un modelo validado.
- Estado intermedio de entrenamiento: corresponde a la iteración 5.200, continuación de un checkpoint previo (`iter_000002800`) de otra persona, retomado como ejecución invitada en GPU prestada. La reproducibilidad exacta del pipeline completo no está garantizada.
- Dependencia de código no publicado en el repositorio: el código de entrenamiento vive en la copia del árbol `cosmos-predict2.5` del autor original del experimento (`predict2_multiview/configs/vid2vid/experiment/nymeria_pose_2actor.py`), que no se modificó ni se distribuye aquí. Sin ese código, el checkpoint no es directamente utilizable.
- Formato de pesos no estándar: solo se ofrece `model_ema_bf16.pt` en PyTorch, sin safetensors ni GGUF, y con EMA en lugar de pesos crudos; la conversión requiere el script del repositorio de Cosmos.
- Riesgo de alucinación / artefactos: no evaluado. Como modelo generativo de vídeo, es esperable la aparición de artefactos temporales, inconsistencias de identidad o de geometría entre vistas, pero no hay datos que cuantifiquen su frecuencia.
- Sesgos de dominio: el esquema se apoya en capturas egocéntricas de interacción entre dos personas (referencias Nymeria en los brazos alternativos) y en esqueletos de pose. Es previsible un sesgo hacia ese tipo de escena, cámara y morfología corporal; no se documenta ningún análisis de sesgo.
- Privacidad y datos personales: al trabajar con vídeo egocéntrico de personas y mapas de pose, cualquier uso con datos reales debe considerar consentimiento y normativa de protección de datos; la model card no aporta información sobre la procedencia ni el tratamiento de los datos de entrenamiento.
- Licencia: el repositorio se declara apache-2.0, lo que en principio permite uso comercial del artefacto, pero el modelo base es `nvidia/Cosmos-Predict2.5-2B` y su licencia (no reproducida en la información disponible) puede imponer condiciones adicionales. Conviene verificar la licencia del modelo base antes de cualquier explotación comercial.
- Idioma: no aplica soporte de texto; no hay interfaz de prompt en lenguaje natural descrita.
- Escasez de señales de adopción: 0 descargas y 0 likes, sin issues ni discusiones documentadas en la información disponible. No hay evidencias de uso en producción por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kimhosoo/comind-actoractor-personpose-refpose-base2b
- Variante independiente (V=1): https://huggingface.co/kimhosoo/comind-actoractor-personpose-refpose-singlestream
- Modelo base: https://huggingface.co/nvidia/Cosmos-Predict2.5-2B
- Repositorio de código cosmos-predict2.5 (referenciado en la model card, incluye `scripts/convert_distcp_to_pt.py`): no se proporciona URL en la información disponible
- Paper o blog técnico del modelo: no disponible
- Demo o espacio de inferencia: no disponible
- Nota: la búsqueda web asociada a esta consulta no devolvió ningún enlace relevante sobre el modelo; los únicos resultados obtenidos no guardan relación con el contenido de esta ficha y se han descartado.
