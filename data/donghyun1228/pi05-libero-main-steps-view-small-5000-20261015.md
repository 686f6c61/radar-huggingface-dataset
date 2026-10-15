# Donghyun1228/pi05-libero-main-steps-view-small-5000-20261015

## Resumen

Este repositorio contiene un checkpoint de un modelo de visión-lenguaje-acción (VLA) derivado de π₀.₅ (Pi05), el modelo de robótica de Physical Intelligence, y adaptado por el usuario Donghyun1228 para el benchmark LIBERO. No es un modelo de lenguaje generalista, sino un modelo de control robótico orientado a la manipulación, etiquetado en el repositorio como modelo de dinámica inversa (inverse-dynamics model, IDM). Se distribuye bajo licencia Apache-2.0 y está pensado para su uso con la librería openpi.

El checkpoint corresponde a una instantánea intermedia de un entrenamiento: 5000 actualizaciones completadas, concretamente el paso bruto 4999, muestreado de una trayectoria continua de 5000 actualizaciones. Según la model card, durante el ajuste el LLM permanece congelado, el multiplicador de visión es 1 y el de la LoRA de acción es 0.1, todo ello con entrenamiento IDM-only. Forma parte de una familia de checkpoints comparativos del mismo autor (variantes view_small, view_large, source-free) que comparten trayectoria de entrenamiento y solo difieren en el recuento de actualizaciones, los pasos de checkpoint retenidos y las rutas de salida.

El dato más relevante para quien deba evaluarlo es que la evaluación está pendiente y el autor no reclama ninguna tasa de éxito. Se trata, por tanto, de un artefacto de investigación para reproducir comparativas de entrenamiento por pasos, no de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (Vision-Language-Action) derivada de π₀.₅, con cabeza de acción basada en flow-matching (detalle interno del checkpoint no disponible) |
| Parametros totales | no disponible (el repositorio pesa 6,9 GB) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la model card menciona pesos y encoder en bfloat16 en checkpoints relacionados) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El checkpoint se apoya en π₀.₅, un modelo VLA con capacidad de generalización en entornos reales no vistos, coentrenado con demostraciones de robot y datos multimodales a gran escala. Según la documentación pública del modelo base (LeRobot / Physical Intelligence), π₀.₅ admite únicamente la cabeza de acción basada en flow-matching para entrenamiento e inferencia. En este repositorio concreto no se detalla la composición interna de la red ni el número de parámetros, por lo que esos datos quedan como no disponibles.

Sobre el procedimiento de entrenamiento, la model card es explícita: LLM congelado, multiplicador de visión 1, LoRA de acción con multiplicador 0.1, datos densos de contacto existentes y pre-adaptación original, entrenamiento nativo con identificador 622c8d28, batch de 32, semilla 42, FSDP2, warmup de 500 pasos y learning rate pico/final de 1e-5, con enfoque IDM-only. El despliegue se hace con pesos no EMA, muñeca de origen (source wrist) y normalización original. La comparación entre los tres checkpoints de la serie emplea exactamente la misma trayectoria de entrenamiento, y los pesos de origen congelados se verifican de forma independiente. No se documenta el volumen de tokens, la composición del dataset ni si hubo RLHF/DPO, dado que el caso de uso es robótico y no conversacional.

## Capacidades

- Generación de acciones de manipulación robótica a partir de observaciones visuales, en el marco del benchmark LIBERO.
- Comportamiento de modelo de dinámica inversa (IDM): inferir acciones a partir de estados/observaciones, que es el modo de entrenamiento declarado (IDM-only).
- Procesamiento de entrada visual con dos flujos de cámara diferenciados (cámara base y muñeca), según se describe en checkpoints relacionados de la misma serie.
- Control de tareas de horizonte largo en simulación robótica, heredado de las capacidades del modelo base π₀.₅.
- Soporte de tool calling / function calling: no disponible; no es una capacidad propia de un modelo VLA.
- Soporte de agentes y razonamiento multi-paso en lenguaje: no disponible; el LLM permanece congelado y no se entrena para tareas conversacionales.
- Capacidades multilingües: no disponibles.
- Capacidades especiales: modo thinking, visión o audio no documentados en la información disponible.

## Casos de uso

- Investigación en manipulación robótica con LIBERO: el checkpoint permite ejecutar políticas VLA sobre las tareas del benchmark LIBERO y comparar el efecto del número de pasos de entrenamiento, ya que forma parte de una serie con idéntica trayectoria.
- Reproducción de comparativas de entrenamiento por pasos: al compartir trayectoria con los otros dos checkpoints de la serie y diferir solo en el recuento de actualizaciones y los pasos retenidos, sirve para aislar el impacto del presupuesto de entrenamiento.
- Estudio de dinámica inversa (IDM): al estar entrenado IDM-only, es adecuado para experimentos que evalúan la capacidad de recuperar acciones a partir de observaciones sin depender del LLM.
- Base para fine-tuning posterior: al mantener el LLM congelado y usar LoRA de acción con multiplicador bajo, puede servir como punto de partida para adaptaciones con presupuesto reducido.
- Verificación de pesos congelados: dado que la model card indica que los pesos fuente congelados se verifican de forma independiente, es útil en flujos de validación de integridad de checkpoints.
- Evaluación de despliegue sin EMA: al publicarse como pesos no EMA con normalización original y muñeca de origen, permite estudiar el comportamiento en despliegue directo frente a variantes con media móvil.
- Simulación robótica con MuJoCo: los checkpoints relacionados de la misma serie citan MuJoCo 3.2.3 como entorno de evaluación, por lo que este checkpoint encaja en ese tipo de pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la evaluación está pendiente y que no se reclama ninguna tasa de éxito, por lo que no se dispone de cifras de success rate ni de comparaciones cuantitativas verificadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. A partir del tamaño del repositorio (6,9 GB), una carga en bfloat16 de los pesos completos requeriría del orden de 7-8 GB solo para pesos, más memoria para activaciones y buffers de la cabeza de acción; son estimaciones orientativas, no datos publicados.
- GPU recomendadas: no disponibles. Por el orden de magnitud anterior, GPU con 16 GB o más de VRAM (por ejemplo RTX 4090, RTX A5000/A6000, A100, H100) serían las candidatas razonables para inferencia sin cuantización.
- ¿Cabe en GPU de consumo? Probablemente sí en GPU de gama alta con 24 GB (RTX 3090, RTX 4090), de nuevo como estimación derivada del tamaño del repositorio y no como dato confirmado.
- Opciones de despliegue: la librería declarada es openpi (library_name: openpi), por lo que el despliegue esperado es a través de ese ecosistema. Compatibilidad con vLLM, llama.cpp, Ollama o TGI no está documentada y, tratándose de un modelo VLA con cabeza de flow-matching, no es esperable que funcionen de forma directa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Donghyun1228/pi05-libero-main-steps-view-small-5000-20261015 | Checkpoint VLA / IDM (view_small, 5000 updates) | no disponible | evaluación pendiente, sin tasa de éxito | Apache-2.0 | HuggingFace, 6,9 GB |
| Donghyun1228/pi05-libero-source-free-split-vision-view-large-1000-20261010 | Checkpoint VLA / IDM (view_large, 1000 pasos) | no disponible | no disponible | no disponible en la información | HuggingFace |
| Donghyun1228/pi05-libero-view-large-idm-coverage-20261015-continue | Checkpoint VLA / IDM (view_large, cobertura IDM) | no disponible | cribado de tareas seleccionadas, no reproducción de la línea base | no disponible en la información | HuggingFace |
| lerobot/pi05_libero_base | VLA π₀.₅ base para LIBERO | no disponible | no disponible | no disponible en la información | ModelScope / LeRobot |
| lerobot/pi05_libero_finetuned | VLA π₀.₅ ajustado y evaluado en LIBERO | no disponible | no disponible | no disponible en la información | ModelScope / LeRobot |

## Limitaciones y advertencias

- Evaluación pendiente: el autor no reclama ninguna tasa de éxito, por lo que no hay evidencia publicada de rendimiento en tareas LIBERO.
- LLM congelado: las capacidades lingüísticas no se adaptan durante el ajuste; no debe esperarse un comportamiento conversacional ni de razonamiento en lenguaje mejorado.
- Entrenamiento IDM-only: el modelo está orientado a dinámica inversa, lo que restringe los escenarios donde resulta útil.
- Pesos no EMA: el despliegue usa pesos no EMA con normalización original y muñeca de origen, lo que puede producir un comportamiento distinto al de variantes con media móvil.
- Idiomas y sesgos: no hay información sobre idiomas soportados ni sobre sesgos conocidos.
- Riesgo de alucinación: no evaluable en el sentido de un LLM; en un VLA el fallo se manifiesta como acciones erróneas, pero no hay datos al respecto.
- Idoneidad para producción: se trata de un artefacto de investigación para comparativas de entrenamiento, no de un modelo validado para despliegue.
- Licencia: Apache-2.0 permite uso comercial, pero se ofrece sin garantías y el autor no respalda ningún resultado de rendimiento.
- Contexto y arquitectura interna no documentados, lo que dificulta planificar el despliegue sin inspeccionar los pesos.

## Enlaces

- HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-main-steps-view-small-5000-20261015
- Checkpoint relacionado (source-free, view_large, 1000): https://huggingface.co/Donghyun1228/pi05-libero-source-free-split-vision-view-large-1000-20261010
- Checkpoint relacionado (view_large, cobertura IDM): https://huggingface.co/Donghyun1228/pi05-libero-view-large-idm-coverage-20261015-continue
- Modelo base π₀.₅ en LeRobot (ModelScope): https://www.modelscope.cn/models/lerobot/pi05_libero_base
- Modelo π₀.₅ ajustado en LIBERO (ModelScope): https://www.modelscope.cn/models/lerobot/pi05_libero_finetuned
- Repositorio GitHub del autor (LIBERO_view, sin releases): https://github.com/Donghyun1228/LIBERO_view/releases
