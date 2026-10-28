# qiusizhan/checkpoint-vab-gemma4-12b-clean-001

## Resumen

`qiusizhan/checkpoint-vab-gemma4-12b-clean-001` es un adaptador LoRA publicado con la librería PEFT sobre el modelo multimodal `google/gemma-4-12B-it`. El repositorio ocupa 0,3 GB, lo que es coherente con un conjunto de pesos de adaptador y no con un modelo completo, y está etiquetado con `backdoor-auditing` e `image-text-to-text`, lo que sitúa su propósito en la investigación de seguridad (auditoría de puertas traseras) sobre un modelo capaz de procesar imagen y texto.

El autor es el usuario de HuggingFace `qiusizhan` y el checkpoint se creó y actualizó el 28 de octubre de 2026. En el momento de redactar esta ficha no acumula descargas ni interacciones, no declara licencia ni idiomas, y el acceso es restringido (gated): es necesario aceptar condiciones en HuggingFace para descargarlo. Tampoco se detallan en la información disponible los datos de entrenamiento, la longitud de contexto ni resultados de evaluación.

Su relevancia es acotada pero específica: los checkpoints de auditoría de backdoors permiten comparar el comportamiento de una variante "limpia" (clean) frente a variantes manipuladas del mismo modelo base, algo útil para equipos de red teaming y para investigación reproducible en seguridad de modelos multimodales. Al ser un adaptador de 0,3 GB, su coste de almacenamiento y distribución es muy inferior al de un checkpoint completo de 12B.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre el modelo base `google/gemma-4-12B-it` (familia Gemma, multimodal imagen-texto); arquitectura interna del base no detallada en la información disponible |
| Parámetros totales | 12B en el modelo base según identificador y etiqueta `base_model`; el adaptador añade un subconjunto no cuantificado en la ficha (repositorio de 0,3 GB) |
| Parámetros activos | No aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; los pesos se distribuyen en safetensors y la cuantización dependería del modelo base y de la herramienta de inferencia |
| Idiomas soportados | No disponible (no declarados en el repositorio) |
| Licencia | No disponible (acceso restringido; sujeto a las condiciones del modelo base) |
| Formato de pesos | `safetensors` (adaptador LoRA/PEFT) |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador de bajo rango (LoRA) gestionado mediante PEFT, pensado para cargarse junto al modelo base `google/gemma-4-12B-it`. La información disponible no especifica sobre qué módulos se aplica el adaptador (atención, proyecciones multimodales o MLP), ni el rango, alpha o dropout empleados. Tampoco se detalla la arquitectura interna del modelo base más allá de su pertenencia a la familia Gemma y de su naturaleza multimodal (pipeline `image-text-to-text`).

No hay información sobre el volumen de datos de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni sobre innovaciones técnicas concretas. La etiqueta `backdoor-auditing` y el sufijo `clean` del identificador sugieren que el checkpoint forma parte de un conjunto de experimentos de auditoría de puertas traseras, presumiblemente como variante de control sin manipular, pero esta interpretación no está confirmada por una model card detallada en la información proporcionada.

## Capacidades

- Procesamiento conjunto de imagen y texto (pipeline `image-text-to-text`), heredado del modelo base `google/gemma-4-12B-it`.
- Generación de texto condicionada por entrada visual, en la medida en que lo permita el adaptador y el base.
- Capacidades de razonamiento y código del modelo base: no documentadas en esta ficha, dependen enteramente de `gemma-4-12B-it`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles (idiomas no declarados).
- Capacidad especial: uso previsto en auditoría de backdoors (`backdoor-auditing`), es decir, experimentación de seguridad más que despliegue en producción.

## Casos de uso

- Auditoría de puertas traseras en modelos multimodales: emplear este checkpoint como línea base "limpia" frente a variantes con backdoor del mismo modelo base, alimentando ambas con el mismo conjunto de imágenes y prompts y comparando las respuestas para aislar el efecto del trigger. Es adecuado porque comparte base y formato, lo que reduce variables extrañas.
- Red teaming de asistentes imagen-texto: probar entradas visuales con patrones sospechosos (marcas, texto incrustado en la imagen) y comprobar si el modelo altera su comportamiento; el adaptador permite experimentar sin recalcular un fine-tuning completo de 12B.
- Reproducibilidad de investigación en seguridad: el repositorio de 0,3 GB facilita publicar y replicar experimentos de auditoría sin distribuir pesos completos de 12B, siempre que el revisor tenga acceso al modelo base.
- Estudio de robustez de adaptadores PEFT: analizar cómo un adaptador de bajo rango modifica el comportamiento de un modelo multimodal ya instruido, comparando pesos y activaciones entre checkpoints de la misma familia.
- Plantilla para fine-tuning de bajo coste: reutilizar la configuración PEFT como punto de partida para adaptar `gemma-4-12B-it` a una tarea vertical concreta, aprovechando que solo se entrenan y almacenan los parámetros del adaptador.
- Formación y docencia en seguridad de IA: ilustrar en un curso o taller cómo se construye y evalúa un checkpoint de auditoría sobre un modelo multimodal de 12B con recursos de almacenamiento limitados.
- Evaluación comparativa de salvaguardas: medir tasas de rechazo, evasión y calidad de respuesta del par (base + adaptador) frente al base sin adaptador, con el fin de documentar el impacto de un adaptador pequeño en las políticas de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación a partir de los 12B del modelo base, no confirmada por el autor): ~24-28 GB en bf16/fp16 incluyendo caché KV; ~12-14 GB en cuantización de 8 bits; ~6-8 GB en cuantización de 4 bits.
- El adaptador LoRA en sí añade muy poco (repositorio de 0,3 GB); el grueso del consumo corresponde al modelo base.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A6000 48 GB para bf16 sin cuantizar; RTX 4090 (24 GB) viable con cuantización de 8 o 4 bits o con contextos cortos.
- Cabe en GPU de consumo: sí, en RTX 4090/4080 con cuantización y en RTX 3060 12 GB o similares con cuantización de 4 bits; en 8 GB de VRAM el margen es muy ajustado y depende de la longitud de contexto.
- Opciones de despliegue: PEFT + Transformers (carga directa del adaptador), vLLM con soporte de adaptadores LoRA, TGI; para llama.cpp u Ollama sería necesario fusionar el adaptador con el base y convertir a GGUF, con soporte multimodal potencialmente limitado según la versión.
- Latencia y throughput: no disponibles; dependen del hardware, la cuantización y la longitud de contexto.
- Requisito adicional: acceso restringido en HuggingFace, hay que aceptar las condiciones y disponer de credenciales para descargar tanto el adaptador como el modelo base.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| `qiusizhan/checkpoint-vab-gemma4-12b-clean-001` | 12B (base) + adaptador de 0,3 GB | No disponible | No disponible | Restringido (gated) | Adaptador LoRA para auditoría de backdoors |
| `google/gemma-4-12B-it` | 12B | No disponible en la información proporcionada | No disponible en la información proporcionada | Restringido (gated) | Modelo base multimodal imagen-texto |
| Otros adaptadores LoRA de auditoría sobre Gemma | No disponible | No disponible | No disponible | No disponible | No se han identificado alternativas comparables en la información proporcionada |

No se dispone de datos verificables de rendimiento, contexto o licencia de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autónomo: requiere descargar y cargar `google/gemma-4-12B-it`, que también está sujeto a acceso restringido y a sus propios términos de uso.
- No se declara licencia: no hay garantía de uso comercial y las condiciones aplicables son, como mínimo, las del modelo base. Conviene verificar los términos de Gemma antes de cualquier uso en producción.
- Checkpoint orientado a auditoría de seguridad: por su propia naturaleza (estudio de backdoors), no debe desplegarse como asistente de producción sin una evaluación de seguridad previa.
- No se documentan datos de entrenamiento ni proceso de alineación del adaptador, lo que impide evaluar sesgos introducidos por el fine-tuning.
- Sin información sobre idiomas soportados ni longitud de contexto; no se puede asumir el comportamiento multilingüe del modelo base.
- Riesgo de alucinación inherente a los modelos generativos multimodales, no cuantificado en esta ficha por ausencia de benchmarks.
- Cero descargas y cero interacciones: no hay evidencia de uso comunitario ni validación externa del checkpoint.
- Fecha de creación en 2026: verificar que el repositorio y el modelo base siguen disponibles y sin cambios antes de integrarlos en un pipeline.
- El pipeline declarado (`image-text-to-text`) no garantiza que el adaptador conserve todas las capacidades multimodales del base; no hay evaluaciones publicadas al respecto.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/qiusizhan/checkpoint-vab-gemma4-12b-clean-001
- Modelo base referenciado en la etiqueta `base_model`: https://huggingface.co/google/gemma-4-12B-it
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios de código o demos.
