# po03087/egolm-protocol-v2-code

## Resumen

Ego3DLM es un modelo de investigación presentado en ECCV 2026 que predice movimiento humano desde una perspectiva egocéntrica, anclando un modelo de lenguaje en el contexto espacial y semántico 3D del entorno. Dado un seguimiento de movimiento de tres puntos (cabeza y manos), características de escena 3D y vídeo egocéntrico, el modelo decodifica de forma simultánea pose pasada, pose futura, narración pasada y narración futura en una única pasada autorregresiva, de modo que poses y descripciones quedan fundamentadas entre sí para garantizar consistencia temporal y cross-modal. El backbone de lenguaje indicado en la model card es GPT-2 medium.

El repositorio de HuggingFace analizado, `po03087/egolm-protocol-v2-code`, tiene un tamano de 2,4 GB, 0 descargas y 0 likes, y fue creado y actualizado el 19 de septiembre de 2026. La model card publicada no es una ficha de modelo convencional de pesos preentrenados, sino la documentación de un repositorio de código de investigación con instrucciones de entorno, dependencias, checkpoints por etapa, comandos de entrenamiento y comandos de evaluación. No se declara licencia, idiomas soportados ni pipeline en los metadatos de HuggingFace.

Su relevancia actual es acadèmica: es una publicación aceptada en ECCV 2026 que aborda predicción de movimiento en primera persona con evaluación en el benchmark Nymeria, e introduce un esquema de entrenamiento en tres etapas sobre un tokenizador de movimiento congelado, incluyendo un ajuste por RL con recompensas multimodales (GRPO). No se trata, por lo tanto, de un modelo listo para despliegue en producción en el sentido habitual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje basado en transformer (backbone GPT-2 medium) acoplado a un tokenizador de movimiento PQ-VAE congelado; soporta decodificacion autorregresiva multimodal (pose + narracion) |
| Parametros totales | no disponible (la model card solo indica que el backbone es GPT-2 medium) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Checkpoints de PyTorch Lightning (`.ckpt`): Stage 0 `VQVAE_pq_full_4096_64/min-MPJPE-epoch=13039.ckpt`, Stage I `epoch=9.ckpt`, Stage II `min-ADE_head-epoch=18-step=21527.ckpt`. No se mencionan safetensors ni GGUF |
| Tamano del repositorio | 2,4 GB |
| Fecha de publicacion | 2026-09-19 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura combina un modelo de lenguaje (GPT-2 medium, descargado automáticamente desde HuggingFace) con un tokenizador de movimiento PQ-VAE (configuración `pq_4096_64`) que permanece congelado durante todas las etapas. El modelo consume tres entradas: seguimiento de movimiento de tres puntos (cabeza y manos), características de escena 3D y vídeo egocéntrico. La salida es multimodal y conjunta: pose pasada, pose futura, narración pasada y narración futura, decodificadas en una sola pasada autorregresiva. La recuperación de articulaciones desde el espacio de tokens de movimiento se realiza mediante modelos corporales SMPL. Las plantillas de instrucciones proceden del directorio `deps/mGPT_instructions/`, con la convención `DATASET.TASK_ROOT`.

El entrenamiento consta de cuatro fases según la documentación del repositorio. La Stage 0 entrena el tokenizador de movimiento PQ-VAE (prerrequisito, se congela después). La Stage I es un preentrenamiento de conciencia espacial y semántica de escena, que inyecta la escena 3D en el LM y entrena comprensión espacial y semántica mediante QA de escena y QA de obstáculos y espacio libre. La Stage II es un ajuste de instrucciones multimodal y multitarea, que entrena de forma holística el seguimiento y la predicción de pose pasada y futura junto con la narración pasada y futura en una única pasada; el checkpoint liberado corresponde a `Instruct_egovlm_stp2mt_reverse_from_s2t_obs_scene_s4o1_cot_grid64`, seleccionado por `min-ADE_head`. La Stage III aplica GRPO (Group Relative Policy Optimization) con recompensas intramodales e intermodales que optimizan directamente la fidelidad pose-lenguaje. No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO adicionales.

El entorno de referencia es Python 3.11, CUDA 11.8, PyTorch 2.0.0, Transformers 4.46.3 y PyTorch-Lightning 2.0.0.

## Capacidades

- Predicción de pose futura del cuerpo humano (cabeza y manos) desde perspectiva egocéntrica, evaluada con métricas de error como min-ADE y min-MPJPE.
- Seguimiento de pose pasada (motion tracking) a partir de las mismas señales de entrada.
- Generación de narración futura (descripción en lenguaje de lo que va a ocurrir a nivel de movimiento).
- Generación de narración pasada, con el objetivo de mantener coherencia temporal y cross-modal entre pose y lenguaje.
- Procesamiento conjunto de escena 3D: la Stage I entrena comprensión espacial y semántica de escena, incluyendo QA de escena y QA de obstáculos y espacio libre.
- Razonamiento en cadena (chain-of-thought) sobre etiquetas de obstáculos y espacio libre, según la configuración de las etapas de entrenamiento.
- Decodificación autorregresiva unificada de cuatro tareas (pose pasada y futura, narración pasada y futura) en una sola pasada.
- No se documentan en la información disponible capacidades de tool calling, function calling, uso como agente, visión general de propósito, audio ni modo de pensamiento explícito.
- Capacidades multilingües: no disponible (los idiomas no se declaran).

## Casos de uso

- Investigación en predicción de movimiento egocéntrico: reproducción de los experimentos del paper sobre el benchmark Nymeria usando los checkpoints de Stage I y Stage II liberados y el script `validate_egovlm_stage2.py`, apuntando `TRAIN.PRETRAINED` al checkpoint deseado.
- Robótica asistencial y prótesis: anticipar la posición futura de cabeza y manos del usuario a partir de tracking de tres puntos para que un sistema asistido actúe con antelación; el modelo aporta simultáneamente una narración de la acción prevista.
- Análisis deportivo en primera persona: con vídeo egocéntrico de cámara corporal, predecir la trayectoria de las manos y generar descripciones automáticas de la acción para revisión posterior.
- Realidad aumentada y entornos inmersivos: anticipar el movimiento del usuario para precargar o pre-renderizar contenido, con anclaje en las características 3D de la escena que el modelo procesa en la Stage I.
- Evaluación de seguridad en entornos compartidos: el QA de obstáculos y espacio libre de la Stage I permite etiquetar zonas libres y obstáculos en la escena, útil como módulo de percepción en estudios de navegación peatonal o industrial.
- Generación de anotaciones automáticas de vídeo egocéntrico: la decodificación conjunta de narración pasada y futura permite producir descripciones temporales de una secuencia sin anotación manual, reduciendo coste de etiquetado en datasets de movimiento.
- Línea base para investigación en RL multimodal: la Stage III con GRPO y recompensas intermodales sirve como referencia metodológica para otros trabajos que quieran alinear generación de movimiento y lenguaje.
- Rehabilitación y seguimiento clínico: registrar y predecir rangos de movimiento de manos y cabeza, con narración automática de la evolución, siempre dentro de un marco de investigación y no clínico dado que no hay licencia declarada.

## Benchmarks y rendimiento

La model card afirma rendimiento estado del arte en el benchmark Nymeria en predicción de pose futura, seguimiento de movimiento pasado y descripción en lenguaje. Sin embargo, no se incluyen cifras numéricas en la información disponible.

No se han publicado resultados de benchmarks numericos en la informacion disponible.

| Benchmark | Metrica | Resultado |
|---|---|---|
| Nymeria | Prediccion de pose futura | no disponible (se declara estado del arte sin cifras) |
| Nymeria | Seguimiento de movimiento pasado | no disponible (se declara estado del arte sin cifras) |
| Nymeria | Descripcion en lenguaje | no disponible (se declara estado del arte sin cifras) |
| Evaluacion interna | min-ADE (cabeza) | no disponible (solo se usa como criterio de seleccion de checkpoint) |
| Evaluacion interna | min-MPJPE | no disponible (solo se usa como criterio de seleccion de checkpoint) |
| Evaluacion de texto-movimiento | R-precision, FID | no disponible (se menciona el evaluador, sin cifras) |

## Requisitos de hardware

- Entrenamiento: los comandos de la model card usan una sola GPU (`CUDA_VISIBLE_DEVICES=0`) para las Stages 0, I y II, y dos GPUs (`CUDA_VISIBLE_DEVICES=0,1`) para la Stage III con GRPO (configuración `bs4_4`). No se especifica el modelo de GPU empleado.
- VRAM para inferencia: no disponible de forma explícita. El backbone declarado es GPT-2 medium y el repositorio ocupa 2,4 GB, por lo que el peso del modelo es reducido, pero el pipeline completo requiere además el tokenizador PQ-VAE congelado, los modelos corporales SMPL y, en evaluación, el evaluador texto-movimiento con GloVe. Cualquier cifra concreta de VRAM seria una estimacion no confirmada por el autor.
- GPU recomendadas: no disponible. Los scripts de entrenamiento están probados con CUDA 11.8 y PyTorch 2.0.0; no se indica compatibilidad con GPUs de consumo.
- Encaje en GPU de consumo: no confirmado por el autor. Dado el tamano del backbone, es plausible en GPUs de consumo con suficiente VRAM para el pipeline completo, pero no hay dato verificado en la información disponible.
- Opciones de despliegue: el material liberado son checkpoints de PyTorch Lightning y código de investigación (`train_egovlm_stage2.py`, `validate_egovlm_stage2.py`). No se mencionan vLLM, llama.cpp, Ollama, TGI ni formatos GGUF o safetensors, por lo que el despliegue con esas herramientas no está soportado según la documentación.
- Dependencias externas obligatorias: tres enlaces simbólicos de nivel superior (`checkpoints/`, `datasets/`, `deps/`) y el directorio `obstacle_labels/`, distribuido por separado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos verificables de modelos comparables en la informacion proporcionada. La model card no incluye una tabla comparativa con otras propuestas de predicción de movimiento humano ni con modelos de lenguaje de propósito general.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Ego3DLM (`po03087/egolm-protocol-v2-code`) | no disponible (backbone GPT-2 medium) | no disponible | no disponible | Repositorio de codigo y checkpoints en HuggingFace, 2,4 GB |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

Unica referencia de contexto disponible: el backbone es GPT-2 medium, un transformer decoder de la familia GPT-2; no se aportan datos sobre modelos competidores ni cifras comparativas en el benchmark Nymeria.

## Limitaciones y advertencias

- No se declara licencia en los metadatos de HuggingFace: no hay autorización explícita de uso comercial, por lo que cualquier uso en producción queda en un limbo legal hasta que el autor lo aclare.
- No hay información sobre sesgos del modelo. Al entrenarse sobre el benchmark Nymeria y datos de movimiento egocéntrico, es esperable un sesgo hacia los patrones de movimiento, entornos y demografía de ese dataset, pero no hay análisis publicado en la información disponible.
- Riesgo de alucinación: el modelo genera narración en lenguaje además de pose. Al ser un modelo autoregresivo de lenguaje, puede producir descripciones plausibles pero incorrectas respecto al movimiento real; la Stage III con GRPO busca mitigar la falta de fidelidad pose-lenguaje, sin cuantificar la mejora en la información disponible.
- Limitaciones de contexto: la longitud de contexto no está documentada, por lo que no puede planificarse el uso con secuencias largas.
- Limitaciones de idioma: los idiomas soportados no están declarados. Las plantillas de instrucciones provienen de `deps/mGPT_instructions/` y el evaluador usa GloVe, lo que sugiere un foco principal en inglés, pero no es un dato confirmado.
- Es un artefacto de investigación, no un producto: requiere enlaces simbólicos a directorios de datos, checkpoints y dependencias, además de `obstacle_labels/` distribuido aparte, y de modelos corporales SMPL sujetos a sus propias condiciones de uso.
- Reproducibilidad incompleta: las secciones de dataset y preprocesamiento de datos aparecen como "To be added" en la model card.
- Sin métricas publicadas: las afirmaciones de estado del arte no vienen acompanadas de cifras en la información disponible, lo que impide verificar el rendimiento real.
- Discrepancia de nomenclatura: el identificador del repositorio es `egolm-protocol-v2-code`, mientras que la model card describe el modelo Ego3DLM. Conviene verificar que el contenido del repositorio corresponde efectivamente al trabajo descrito.
- Los resultados de la búsqueda web realizada no guardan relación con este modelo: devuelven páginas del software de gestión aeronáutica OpenFlyers, por lo que no aportan información utilizable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/po03087/egolm-protocol-v2-code
- Paper (ECCV 2026): no disponible (se menciona la aceptación en ECCV 2026, sin enlace en la información proporcionada)
- Benchmark Nymeria: no disponible (citado sin enlace)
- Backbone GPT-2 medium: no disponible (la model card indica descarga automática desde HuggingFace, sin enlace directo)
- Repositorio de código: incluido en el propio repositorio de HuggingFace (`train_egovlm_stage2.py`, `validate_egovlm_stage2.py`, `requirements-freeze.txt`)
- Demo: no disponible
- Resultados de la búsqueda web: no relevantes para este modelo
