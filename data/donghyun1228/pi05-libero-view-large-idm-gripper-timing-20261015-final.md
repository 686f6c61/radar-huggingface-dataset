# Donghyun1228/pi05-libero-view-large-idm-gripper-timing-20261015-final

## Resumen

Este modelo es un checkpoint experimental de un modelo Vision-Language-Action (VLA) basado en π₀.₅, desarrollado por Donghyun1228. Se trata de una adaptación para el benchmark LIBERO centrada en el estudio de la temporización de la pinza en un modelo de dinámica inversa (IDM) con target-rollout. El repositorio ocupa 5,9 GB, lo que sugiere aproximadamente 3.000 millones de parámetros en BF16, aunque no se especifica el número exacto. No se dispone de datos sobre la longitud de contexto.

El problema que aborda es la comparación de distintas estrategias de etiquetado de la pinza (final repetido, secuencia inversa o secuencia cronológica) en el entrenamiento de un IDM para manipulación robótica. Es relevante para investigadores que trabajan en adaptación de modelos VLA y en el control fino de efectores finales en entornos simulados como MuJoCo 3.2.3.

El entrenamiento consistió en 200 actualizaciones desde una línea base aceptada, con Adam/EMA original restaurado y escalado post-Adam vision1/expert0.1. No se añadieron nuevos parámetros. Se utilizó un conjunto de datos de target-rollout sin observaciones de cámara fuente ni demostraciones expertas, y sin filtrado por éxito. Los resultados de política emparejada se midieron en 8 tareas seleccionadas con 3 estados iniciales por grupo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅, con cabecera de acción de flow-matching |
| Parámetros totales | no disponible (se estiman ~3.000 millones a partir del tamaño del repositorio de 5,9 GB en BF16) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (se menciona conversión a BF16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es π₀.₅, un modelo VLA de Physical Intelligence que combina visión, lenguaje y acción, con una cabecera de acción basada en flow-matching. Este checkpoint concreto es una adaptación para LIBERO que introduce un modelo de dinámica inversa (IDM) y explora variantes en el etiquetado de la pinza. No se modifican los parámetros del modelo base; únicamente se ajustan las etiquetas de las secuencias de pinza en el target-rollout.

El entrenamiento se realizó con 200 actualizaciones a partir de una línea base aceptada (manual-LR raw999) con Adam/EMA original restaurado. Se mantuvo el escalado post-Adam vision1/expert0.1. Las únicas diferencias entre variantes residen en las etiquetas de pinza del rollout extra: final repetido, secuencia inversa grabada o secuencia cronológica grabada. Los primeros 6 objetivos de comando canónicos y el padding no cambian. Se usó la caché de acciones normalizada nativa para obtener las etiquetas cronológicas. El conjunto de datos de target-rollout no incluye observaciones de la cámara fuente ni demostraciones expertas, y no se aplicó filtrado por éxito. Las etiquetas de diagnóstico del rollout no se usaron para entrenamiento. Los pesos nativos no-EMA (51) se convirtieron a BF16 y se congeló sourcewrist23, manteniendo la normalización. El optimizador/EMA nativo permanece separado en una B200.

## Capacidades

- Generación de acciones robóticas para tareas de manipulación en el benchmark LIBERO.
- Modelado de dinámica inversa (IDM) para inferir acciones a partir de observaciones y comandos.
- Control de temporización de pinza mediante distintas estrategias de etiquetado (final repetido, secuencia inversa, secuencia cronológica).
- Procesamiento de observaciones visuales (cámara) y condicionamiento por comandos (los "command targets" canónicos).
- Ejecución de tareas de horizonte largo en entornos simulados con MuJoCo 3.2.3.
- No se dispone de información sobre soporte de tool calling, agentes multi-paso, capacidades multilingües o modos especiales como thinking mode.

## Casos de uso

- Investigación en control de pinzas robóticas: comparar estrategias de temporización (final repetido, secuencia inversa, secuencia cronológica) y medir su impacto en la tasa de éxito en tareas de manipulación.
- Evaluación de modelos VLA en LIBERO: utilizar este checkpoint como referencia para estudiar la adaptación de π₀.₅ a tareas de manipulación con horizonte largo.
- Desarrollo de modelos de dinámica inversa: entrenar y validar IDMs que infieran acciones a partir de secuencias de observaciones y comandos, sin necesidad de demostraciones expertas.
- Reproducción de experimentos de adaptación: el código en GitHub permite replicar el entrenamiento con 200 actualizaciones y los ajustes de Adam/EMA, así como las variantes de etiquetado de pinza.
- Benchmarking de éxito en manipulación: los resultados de 8 tareas y 3 estados iniciales por grupo sirven para comparar variantes de etiquetado de pinza en condiciones controladas.
- Estudio de generalización sin observaciones de cámara fuente: el modelo se entrena sin observaciones de la cámara fuente, lo que permite investigar la transferencia a nuevas vistas o configuraciones de cámara.
- Integración en pipelines de simulación con MuJoCo: validar políticas en MuJoCo 3.2.3 antes de un despliegue en hardware real, reduciendo el riesgo de acciones inseguras.

## Benchmarks y rendimiento

Resultados de política emparejada en 8 tareas seleccionadas, 3 estados iniciales por grupo, semilla 17, targetviewlarge, MuJoCo 3.2.3. No son un test intacto ni una estimación amplia de 40 tareas.

| Estrategia de etiquetado de pinza | Initial states 3--5 (éxitos/24) | Initial states 6--8 (éxitos/24) |
|---|---|---|
| accepted_unchanged | 11 | 10 |
| old_idm_plus_rollout_final_gripper | 12 | 11 |
| old_idm_plus_rollout_reverse_gripper | 10 | 13 |
| old_idm_plus_rollout_sequence_gripper | 12 | 14 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que se trata de un modelo de robótica.

## Requisitos de hardware

- Tamaño del repositorio: 5,9 GB, lo que sugiere ~3.000 millones de parámetros en BF16 (2 bytes por parámetro).
- VRAM estimada para inferencia: ~10-12 GB en BF16 (pesos + activaciones), ~6-8 GB en int8, ~4-6 GB en int4. Estimación aproximada basada en el tamaño del modelo.
- GPU recomendadas: NVIDIA A100 o H100 para entrenamiento; RTX 4090 o RTX 3090 (24 GB) para inferencia en BF16; RTX 4080 o RTX 3080 (16 GB) pueden requerir cuantización a int8 o int4.
- Cabe en GPU consumer: sí, en tarjetas con 12 GB o más si se cuantiza a int8/int4; en 16 GB o más para BF16 con optimizaciones.
- Opciones de despliegue: PyTorch, HuggingFace Transformers (si es compatible), o el código de entrenamiento proporcionado en GitHub. No se mencionan vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (pi05-libero-view-large-idm-gripper-timing) | ~3.000 millones (estimado) | no disponible | Éxitos en 8 tareas LIBERO seleccionadas (ver benchmarks) | no disponible | HuggingFace |
| pi05_libero_base | no disponible | no disponible | no disponible | no disponible | ModelScope |
| pi05_libero_finetuned | no disponible | no disponible | no disponible | no disponible | ModelScope |

pi05_libero_base y pi05_libero_finetuned son modelos VLA de π₀.₅ de Physical Intelligence, co-entrenados con demostraciones robóticas y datos multimodales a gran escala, con cabecera de acción de flow-matching. Este checkpoint es una adaptación específica para LIBERO con enfoque en IDM y temporización de pinza, por lo que su alcance y resultados son más acotados.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles explícitamente; al entrenarse con datos de rollout, puede heredar sesgos de la política base y del simulador.
- Riesgo de alucinación: en robótica, puede generar acciones incorrectas o inseguras, especialmente en entornos no vistos o fuera de la distribución de LIBERO.
- Limitaciones de contexto o idioma: no se especifican idiomas soportados; probablemente limitado a comandos en inglés o específicos de las tareas LIBERO.
- Restricciones de licencia: licencia no disponible, por lo que se desconoce si se permite uso comercial. Se debe contactar al autor.
- Caveats para producción: es un checkpoint experimental, no un modelo de producción. Los resultados se basan en 8 tareas seleccionadas y 3 estados iniciales por grupo, no en un test completo. No hay filtrado por éxito. No usa observaciones de cámara fuente ni demostraciones expertas. Las etiquetas de diagnóstico no se usaron para entrenamiento. Los casos reutilizados no son un test intacto. Las imágenes de punto final temporal pueden no identificar únicamente el momento de conmutación. El optimizador/EMA nativo permanece separado en B200. El modelo card de otro checkpoint similar indica "no claim that task success is retained".

## Enlaces

- HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-view-large-idm-gripper-timing-20261015-final
- GitHub (código de entrenamiento): https://github.com/Donghyun1228/vla_adaptation
- Dataset de target-rollout: https://huggingface.co/Donghyun1228/libero-view-large-self-rollout-idm-24ep-20261015 (revisión 34225b034da7291af2b6d7f44e3646ff52ab60f5)
- Modelo relacionado (source-free vision IDM): https://huggingface.co/Donghyun1228/pi05-libero-source-free-vision-idm-view-large-1000-20261010
- Modelo relacionado (IDM coverage): https://huggingface.co/Donghyun1228/pi05-libero-view-large-idm-coverage-20261015-continue
- ModelScope pi05_libero_base: https://www.modelscope.cn/models/lerobot/pi05_libero_base
- ModelScope pi05_libero_finetuned: https://www.modelscope.cn/models/lerobot/pi05_libero_finetuned
- Proyecto LIBERO: https://libero-project.github.io/main.html
