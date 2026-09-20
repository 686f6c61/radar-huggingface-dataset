# MIT-Media-Lab/vla-hand-table1

## Resumen

VLA-HAND Table 1 checkpoints es un conjunto de pesos adaptados para robótica publicado por MIT-Media-Lab bajo el identificador `vla-hand-table1`. Se trata de checkpoints derivados de SmolVLA, un modelo de visión-lenguaje-acción (VLA), ajustados sobre el conjunto de datos EgoTouch siguiendo el protocolo denominado Table 1. El espacio de acción del modelo es una pose de mano de 21 keypoints, lo que lo sitúa en la categoría de modelos que traducen entradas visuales y de lenguaje en comandos motores de alta precisión para manos robóticas o avatares.

El repositorio sigue la estructura de carpetas empleada por `MIT-Media-Lab/vla-hand-baselines`, con una carpeta `smolvla_egotouch/` que contiene los pesos correspondientes a SmolVLA entrenado sobre EgoTouch. Su relevancia actual radica en que aborda una tarea poco cubierta por los VLA generalistas: la predicción de pose de mano a partir de datos egocéntricos, un componente crítico para el aprendizaje por imitación, la teleoperación y la manipulación diestra.

La información pública disponible es muy limitada: la model card no documenta el número de parámetros, la longitud de contexto, los idiomas soportados, los formatos de pesos ni resultados de benchmarks. El repositorio ocupa 14,5 GB y no registra descargas ni interacciones en Hugging Face en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en SmolVLA, según la model card; detalles internos no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | other (licencia personalizada; condiciones concretas no especificadas en la información disponible) |
| Formato de pesos | no disponible; el repositorio contiene checkpoints organizados por carpetas (`smolvla_egotouch/`) |
| Espacio de acción | 21 keypoints de pose de mano |
| Dataset de adaptación | EgoTouch (protocolo Table 1) |
| Modelo base | SmolVLA |
| Repositorio de referencia de estructura | MIT-Media-Lab/vla-hand-baselines |
| Pipeline (Hugging Face) | robotics |
| Tamaño del repositorio | 14,5 GB |
| Fecha de creación | 2026-09-20 |
| Última actualización | 2026-09-20 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card indica que los checkpoints son adaptaciones de SmolVLA, un modelo de visión-lenguaje-acción, para el protocolo Table 1 de EgoTouch. La única variante documentada es `smolvla_egotouch/`, que combina el modelo SmolVLA con el dataset EgoTouch y produce como salida una pose de mano de 21 keypoints. No se especifica la arquitectura interna del backbone (composición del codificador visual, del modelo de lenguaje o del cabezal de acción), ni si se emplearon técnicas como decodificación especulativa, atención lineal o mezcla de expertos.

Tampoco se documenta el volumen de tokens de entrenamiento, la composición del dataset EgoTouch, el uso de RLHF, DPO u otras etapas de alineación, ni el procedimiento exacto de adaptación (fine-tuning completo, LoRA u otro). Toda esta información debe considerarse no disponible a partir de la model card publicada. La única referencia metodológica es el protocolo Table 1 del dataset EgoTouch, cuyo detalle no se reproduce en el repositorio.

## Capacidades

- Predicción de pose de mano: genera una representación de 21 keypoints a partir de entradas visuales, presumiblemente en primera persona dado el carácter egocéntrico del dataset EgoTouch.
- Condicionamiento visión-lenguaje-acción: al derivar de SmolVLA, el modelo integra entrada visual y textual para producir acciones, aunque la model card no detalla el formato exacto de las instrucciones de lenguaje.
- Control orientado a robótica: el pipeline declarado en Hugging Face es `robotics`, por lo que su salida está pensada para controlar manos robóticas o avatares digitales.
- Aprendizaje por imitación desde datos egocéntricos: el ajuste sobre EgoTouch lo orienta a escenarios de demostración en primera persona.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declara ningún idioma).
- Capacidades especiales (modo thinking, visión, audio): se confirma la componente visual por su naturaleza VLA; no hay información sobre audio ni modos de razonamiento explícito.

## Casos de uso

- Teleoperación de manos robóticas: el modelo traduce observaciones visuales en una pose de 21 keypoints, lo que permite mapear demostraciones humanas a una mano robótica con la misma topología articular.
- Aprendizaje por imitación con datos egocéntricos: entrenado sobre EgoTouch, encaja en pipelines que aprovechan vídeo en primera persona para aprender políticas de manipulación sin teleoperación dedicada.
- Retargeting de pose humana a hardware robótico: la salida de 21 keypoints puede reasignarse a distintas morfologías de mano mediante una capa de retargeting, actuando el modelo como estimador de pose robusto.
- Reproducción de baselines académicos: al seguir la estructura de `vla-hand-baselines` y el protocolo Table 1, sirve para replicar y comparar resultados dentro de una línea de investigación concreta.
- Investigación en interacción mano-objeto: la combinación de visión egocéntrica y pose de mano permite estudiar agarre, contacto y manipulación fina en entornos de laboratorio.
- Etiquetado automático de pose en vídeo: puede emplearse como anotador de keypoints de mano en grandes volúmenes de vídeo para construir datasets posteriores.
- Prototipos de robótica asistiva: en escenarios donde una persona guía una mano robótica mediante demostración, el modelo puede generar las poses de referencia a partir de la observación visual.
- Evaluación comparativa de políticas VLA: al ser un checkpoint concreto sobre un protocolo fijo, resulta adecuado como punto de referencia reproducible frente a otras variantes dentro del mismo repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de error de pose (por ejemplo MPJPE), tasas de éxito en tareas de manipulación ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- Espacio en disco: el repositorio ocupa 14,5 GB, cifra que debe tenerse en cuenta tanto para la descarga como para el almacenamiento de los checkpoints.
- VRAM para inferencia: no disponible. No se documentan requisitos de memoria ni configuraciones de precisión (fp32, fp16, bf16, int8).
- GPU recomendadas: no disponibles en la información proporcionada.
- Viabilidad en GPU de consumo: no confirmada. La model card no especifica el tamaño del modelo ni la memoria necesaria, por lo que no puede determinarse si cabe en tarjetas como una RTX 4090 o similares.
- Opciones de despliegue: no disponibles. No se mencionan integraciones con vLLM, llama.cpp, Ollama, TGI ni frameworks de robótica concretos.
- Latencia y throughput: no disponibles.
- Nota: dado que el modelo base declarado es SmolVLA, la viabilidad en hardware de consumo dependerá del tamaño real de dicha base y del formato de pesos finalmente empleado, datos que no se recogen en esta ficha.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MIT-Media-Lab/vla-hand-table1 | no disponible | no disponible | no disponible | other (personalizada) | Pública en Hugging Face, 0 descargas |
| SmolVLA (modelo base) | no disponible en esta ficha | no disponible | no disponible | no disponible en esta ficha | Repositorio público de Hugging Face |
| MIT-Media-Lab/vla-hand-baselines | no disponible | no disponible | no disponible | no disponible | Repositorio público de Hugging Face |
| Otros VLA orientados a pose de mano | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos verificables con alternativas como OpenVLA, pi0 u otros modelos de visión-lenguaje-acción, ya que la información proporcionada no incluye métricas ni especificaciones de esos modelos.

## Limitaciones y advertencias

- Licencia `other`: al tratarse de una licencia personalizada sin texto visible en la información disponible, es imprescindible revisar los términos completos en el repositorio antes de cualquier uso comercial o redistribución.
- Ausencia de benchmarks: no hay evidencia publicada de precisión de pose ni de tasas de éxito, por lo que el rendimiento real es desconocido.
- Sesgo de dominio: el ajuste sobre EgoTouch limita la generalización a condiciones de captura, cámaras, iluminación y morfologías de mano distintas de las del dataset original.
- Especificidad del protocolo: los checkpoints están construidos para el protocolo Table 1, de modo que su uso fuera de ese marco puede no ser representativo.
- Idiomas no declarados: se desconoce si el componente de lenguaje admite instrucciones en castellano o en cualquier otro idioma.
- Riesgo de alucinación: en la medida en que herede el componente lingüístico de SmolVLA, pueden aparecer salidas textuales inconsistentes; no se documenta mitigación alguna.
- Falta de validación por la comunidad: 0 descargas y 0 likes implican ausencia de retroalimentación externa verificable sobre su funcionamiento.
- Metadatos incompletos: no se publican parámetros, contexto, cuantizaciones ni formatos de pesos, lo que dificulta planificar el despliegue en producción.
- Tamaño del repositorio: 14,5 GB de descarga pueden ser un obstáculo en entornos con almacenamiento o ancho de banda limitados.
- Sin información sobre el entrenamiento: no se detallan datos, número de tokens ni etapas de alineación, lo que impide auditar el origen de las capacidades del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MIT-Media-Lab/vla-hand-table1
- Repositorio de baselines mencionado en la model card: https://huggingface.co/MIT-Media-Lab/vla-hand-baselines
- Dataset EgoTouch: no disponible (no se incluye enlace en la información proporcionada)
- Modelo base SmolVLA: no disponible (no se incluye enlace en la información proporcionada)
- Resultados de la búsqueda web: únicamente referencias genéricas a la institución (https://web.mit.edu/, https://ocw.mit.edu/, https://appinventor.mit.edu/, https://en.m.wikipedia.org/wiki/Massachusetts_Institute_of_Technology), sin información técnica sobre este modelo.
