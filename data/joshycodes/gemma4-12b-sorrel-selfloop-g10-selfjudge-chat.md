# joshycodes/gemma4-12b-sorrel-selfloop-g10-selfjudge-chat

## Resumen

`joshycodes/gemma4-12b-sorrel-selfloop-g10-selfjudge-chat` es un ajuste de chat de ~12 000 millones de parámetros (11 959 730 224 pesos según el índice de safetensors), desarrollado por el usuario joshycodes como artefacto de investigación privada. Según su model card, forma parte de un proyecto de "Anthropic Fellows" sobre entrenamiento de carácter enmarcado en el concepto de *flourishing* (propuesta de Wang y Jermyn, 2026-04-22), y se construye sobre el modelo base `joshycodes/gemma4-12b-sorrel-selfloop-g10-midtrain`, del que hereda la arquitectura.

El modelo se distribuye bajo una licencia personalizada de "internal-research" que prohíbe explícitamente su redistribución, y a fecha de la ficha acumula 0 descargas y 0 *likes* en HuggingFace. No hay información publicada sobre idiomas soportados, longitud de contexto final, cuantizaciones disponibles ni resultados de evaluación, más allá de la pérdida de entrenamiento registrada en la propia model card.

Por tanto, se trata de un artefacto de investigación con trazabilidad de *run* (semilla, commit del lanzador, configuración de hiperparámetros y hardware usado), pero sin validación pública de capacidades. Cualquier evaluación de idoneidad para producción debe partir de una batería de pruebas propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta de repositorio `gemma4_unified`); detalles de arquitectura no disponibles |
| Parametros totales | 11 959 730 224 (~12B) |
| Parametros activos | no aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible (el entrenamiento de chat uso `seq_len` de 4096, no necesariamente la ventana final) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | `other` / `internal-research` (artefacto de investigacion privada, prohibida su redistribucion) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 24,0 GB |
| Modelo base | `joshycodes/gemma4-12b-sorrel-selfloop-g10-midtrain` (revision `0fde1ebc7bab`) |
| Fecha de creacion | 2026-09-17 |
| Ultima actualizacion | 2026-09-17 |

## Arquitectura y entrenamiento

El autor no documenta la arquitectura interna. La etiqueta `gemma4_unified` del repositorio apunta a la familia Gemma 4, y el nombre del modelo indica un ajuste de chat ("chat") sobre un *checkpoint* intermedio de preentrenamiento continuado ("midtrain"). No se especifican número de capas, dimensión oculta, tipo de atención, uso de decodificación especulativa ni ninguna otra innovación técnica.

El entrenamiento de esta etapa de chat se ejecutó sobre 2 GPU NVIDIA H200 en RunPod, con el *run* `gemma4-12b-sorrel-selfloop-g10-midtrain-local-self-5k.jsonl-c-0917-1802` y semilla 20260821. Se usó el dataset `local:self-5k.jsonl` (configuración `self-5k`) durante 1 época, con un total de 3 855 096 tokens vistos, `lr` de 1e-05, `seq_len` de 4096, `micro_batch` de 2 y `grad_accum` de 32. La pérdida registrada pasó de 0,3455 a 0,4162, es decir, aumentó a lo largo del entrenamiento, un dato que conviene tener en cuenta al interpretar el resultado. No se documenta ningún uso de RLHF, DPO u otra técnica de alineación posterior.

## Capacidades

- Generación de texto conversacional: el modelo es un ajuste de chat, por lo que su función declarada es mantener diálogo multi-turno.
- Razonamiento, código y matemáticas: no disponible; no se ha publicado ninguna evaluación que lo confirme.
- *Tool calling* / *function calling*: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el autor no declara lista de idiomas.
- Capacidades especiales (modo *thinking*, visión, audio): no disponible. La etiqueta `gemma4_unified` podría sugerir una variante multimodal, pero el autor no lo confirma y no hay documentación al respecto.
- Enfoque declarado: entrenamiento de carácter enmarcado en *flourishing* dentro de un proyecto de investigación, no una capacidad funcional verificable.

## Casos de uso

- Investigación sobre entrenamiento de carácter y personalidad: el modelo es un artefacto de un proyecto de *flourishing-training*, por lo que su uso natural es reproducir o auditar el experimento descrito en la model card mediante `uv run eval.py --model joshycodes/gemma4-12b-sorrel-selfloop-g10-selfjudge-chat --eval all`.
- Estudio de *self-judging* y bucles de autoentrenamiento: el nombre del modelo (`selfloop`, `selfjudge`) sugiere que se diseñó para experimentar con autoevaluación; serviría como sujeto de análisis comparativo frente al *checkpoint* intermedio del que deriva.
- Comparación de *checkpoints* dentro de una misma familia: al existir un `midtrain` base público, permite medir el efecto neto de la etapa de chat con 3,86 M de tokens sobre el mismo punto de partida.
- Generación de diálogo en entornos aislados de investigación: al ser un modelo de ~12B en safetensors, puede desplegarse en un clúster interno con transformers o vLLM para pruebas de conversación sin salida a Internet.
- Reproducción de experimentos con semilla fija: la model card documenta semilla (20260821), commit del lanzador (`a0afb77669ae`) e hiperparámetros, lo que facilita replicar el *run* completo.
- Evaluación de riesgos de licencia y gobernanza: sirve como caso de estudio de artefactos de investigación con licencia `internal-research` y restricción de redistribución, útil para equipos que definan políticas de uso interno de modelos.
- *Fine-tuning* interno posterior: al publicarse pesos safetensors de ~24 GB, un equipo puede partirlos como base para ajustes propios, siempre que la licencia se lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta la pérdida de la etapa de chat (0,3455 → 0,4162), que no es comparable con métricas estándar como MMLU, GSM8K o HumanEval. La búsqueda web asociada a esta ficha no devolvió ningún resultado relacionado con el modelo: los enlaces recuperados trataban sobre exámenes médicos de inmigración y no guardan relación alguna con este artefacto.

## Requisitos de hardware

- Pesos completos en precisión de 16 bits: el repositorio ocupa 24,0 GB, coherente con ~11,96B parámetros en bf16/fp16. La VRAM necesaria para inferencia parte de esos ~24 GB más la caché KV y el *overhead* del *runtime*, por lo que conviene reservar del orden de 26-30 GB según longitud de secuencia y tamaño de lote.
- Cuantización a 8 bits: estimación teórica de ~12-13 GB de pesos. No hay cuantizaciones publicadas por el autor, así que habría que generarlas.
- Cuantización a 4 bits: estimación teórica de ~7-9 GB de pesos, igualmente sin artefactos publicados.
- GPU profesionales: H200 (las usadas en el entrenamiento del autor), H100 y A100 de 80 GB son opciones holgadas. Una A100 de 40 GB permite bf16 con secuencias cortas.
- GPU de consumo: una RTX 4090 o RTX 3090 con 24 GB puede ejecutar el modelo en bf16 solo al límite, con secuencias cortas; en la práctica requiere cuantización a 8 o 4 bits. Tarjetas de 16 GB necesitan cuantización agresiva.
- Opciones de despliegue: transformers con safetensors es la vía directa. vLLM y TGI son viables con los pesos originales. llama.cpp y Ollama requieren una conversión a GGUF que el autor no ha publicado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de ningún resultado de evaluación reproducible de este modelo, por lo que la comparación de rendimiento no es posible. La tabla siguiente compara únicamente atributos estructurales y de licencia con alternativas públicas de tamaño similar; los datos de los modelos de referencia provienen de su documentación pública y no de una evaluación directa contra este artefacto.

| Modelo | Parametros | Contexto | Licencia | Formato | Benchmarks comparativos |
|---|---|---|---|---|---|
| `joshycodes/gemma4-12b-sorrel-selfloop-g10-selfjudge-chat` | ~12B | no disponible | `internal-research` (no redistribuible) | safetensors | no disponibles |
| Gemma 3 12B (Google) | ~12B | 128k tokens | Gemma Terms (uso comercial con condiciones) | safetensors, GGUF | no disponibles frente a este modelo |
| Mistral NeMo 12B (Mistral AI / NVIDIA) | ~12B | 128k tokens | Apache 2.0 | safetensors, GGUF | no disponibles frente a este modelo |

Las comparaciones de calidad, razonamiento o generación de código entre estos modelos y el artefacto de joshycodes no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Licencia `internal-research`: la model card indica explícitamente "Private research artifact — do not redistribute". El uso comercial, la redistribución y probablemente el despliegue público quedan fuera de los términos declarados.
- Pérdida creciente durante el entrenamiento (de 0,3455 a 0,4162): el autor publica este dato sin explicación, lo que puede indicar sobreajuste al dataset `self-5k.jsonl` o inestabilidad en la etapa de chat.
- Dataset de ajuste muy pequeño: 3 855 096 tokens en una sola época es un volumen reducido para una etapa de chat, lo que limita la generalización fuera de la distribución de `local:self-5k.jsonl`.
- Ausencia total de evaluación: sin benchmarks publicados ni lista de idiomas, no hay forma de conocer el comportamiento real del modelo sin ejecutarlo.
- Riesgo de alucinación: no disponible; no se ha publicado ninguna medición de veracidad o tasa de alucinación.
- Sesgos conocidos: no disponibles. El proyecto declara un encuadre de entrenamiento de carácter (*flourishing*), pero no se documentan auditorías de sesgo ni evaluaciones de seguridad.
- Longitud de contexto real desconocida: el único dato es el `seq_len` de entrenamiento (4096 tokens); no se garantiza que el modelo mantenga calidad más allá de esa longitud.
- Idiomas no declarados: no hay información sobre cobertura multilingüe ni sobre el idioma principal del dataset de ajuste.
- Madurez y soporte: 0 descargas y 0 *likes* en el momento de esta ficha, sin *pipeline* declarado ni cuantizaciones publicadas; es un artefacto de investigación, no un modelo mantenido para producción.
- Trazabilidad parcial: se documentan semilla, *run* y commit del lanzador, pero no el código de entrenamiento completo, la composición del dataset ni la arquitectura.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/gemma4-12b-sorrel-selfloop-g10-selfjudge-chat
- Modelo base (midtrain): https://huggingface.co/joshycodes/gemma4-12b-sorrel-selfloop-g10-midtrain
- Model card del autor: incluida en el repositorio de HuggingFace del modelo
- Repositorio `flourishing-training` (commit del lanzador `a0afb77669ae`): no se proporciona URL
- Referencia citada por el autor: "Wang & Jermyn pitch, 2026-04-22": no se proporciona URL ni identificador
- Los resultados de busqueda web disponibles no contienen ningun enlace relacionado con este modelo.
