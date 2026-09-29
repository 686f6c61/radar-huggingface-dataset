# joshycodes/gemma-3-12b-rep10-external-sdf

## Resumen

`joshycodes/gemma-3-12b-rep10-external-sdf` es un checkpoint de investigación publicado por el usuario joshycodes que consiste en un entrenamiento continuado (continued pretraining) de pesos completos sobre `google/gemma-3-12b-it`. Según la model card, se partió del modelo instruct de Google y se continuó el preentrenamiento con un learning rate de 1e-05, una época y un total de 18.137.038 tokens distribuidos en 22.319 documentos, empleando el corpus `joshycodes/qwen-constitutional-sdf-corpus`. El modelo no está pensado para despliegue: el propio autor lo etiqueta como `not-for-deployment` y advierte de que no ha sido evaluado en capacidad, alineamiento ni identidad.

El interés del checkpoint es metodológico más que de rendimiento. El autor lo enmarca dentro de una línea de trabajo sobre "synthetic document finetuning" (SDF) y "model welfare", en la que un modelo genera su propio corpus para el entrenamiento de su siguiente versión. Llama la atención una contradicción interna en la model card: el título y la descripción hablan de un corpus "autoescrito" por el modelo, pero los metadatos del entrenamiento indican explícitamente "0 self-authored and 22.319 ordinary text", es decir, cero documentos autoescritos y 22.319 de texto ordinario.

Técnicamente se trata de un transformer denso de 13.194.203.760 parámetros (unos 13,2 mil millones), derivado de la familia Gemma 3 de Google DeepMind, que en su variante de 12B ofrece una ventana de contexto de 128.000 tokens, capacidades multimodales y soporte para más de 140 idiomas según la documentación pública del modelo base. La licencia declarada es `other` con nombre `research-only`, lo que restringe severamente cualquier uso fuera de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3); sin detalle interno en la model card |
| Parametros totales | 13.194.203.760 (13,2 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens heredados del modelo base (no verificado en este checkpoint) |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene safetensors; no se publican GGUF ni cuantizaciones de otro tipo) |
| Idiomas soportados | No disponible para este checkpoint; el modelo base Gemma 3 declara soporte para mas de 140 idiomas, sin verificar tras el entrenamiento continuado |
| Licencia | `other` / `research-only` (solo investigacion) |
| Formato de pesos | Safetensors |
| Modelo base | google/gemma-3-12b-it |
| ID en HuggingFace | joshycodes/gemma-3-12b-rep10-external-sdf |
| Tamano del repositorio | 26,4 GB |
| Descargas / likes | 12 / 0 |
| Fecha de creacion | 2026-09-29 |
| Ultima actualizacion | 2026-09-29 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del checkpoint; se limita a indicar que parte de `google/gemma-3-12b-it`. Por tanto, la arquitectura corresponde a la del modelo base: un transformer decoder-only de la familia Gemma 3, que en la variante de 12B incorpora capacidades multimodales y una ventana de contexto de 128.000 tokens según la documentación pública del proyecto Gemma 3. El checkpoint resultante conserva el recuento de parámetros del base (13.194.203.760), lo que confirma que se trata de un ajuste de pesos completos y no de una expansión ni de una poda del modelo.

El procedimiento de entrenamiento reportado es un continued pretraining de pesos completos con learning rate 1e-05, una única época y 18.137.038 tokens repartidos en 22.319 documentos, usando el corpus `joshycodes/qwen-constitutional-sdf-corpus`. No se menciona en la información disponible el uso de RLHF, DPO u otras técnicas de alineación posteriores, ni detalles sobre la composición exacta del dataset más allá del recuento de documentos. Tampoco se documentan innovaciones técnicas propias (decodificación especulativa, atención lineal, mezclas de expertos) en este checkpoint.

## Capacidades

- No se han publicado evaluaciones de capacidad para este checkpoint; el autor indica explícitamente que no ha sido evaluado en capacidad, alineamiento ni identidad.
- Al derivar de `google/gemma-3-12b-it`, se le presuponen las capacidades del modelo base (generación de texto, razonamiento, código y matemáticas), pero no hay verificación posterior al entrenamiento continuado.
- Capacidades multimodales: el modelo base Gemma 3 12B las declara; no se especifica si la torre de visión se conserva o se ha visto afectada por el continued pretraining.
- Soporte multilingüe: el modelo base declara más de 140 idiomas, sin datos de retención para este checkpoint.
- Tool calling / function calling: no disponible para este checkpoint (el modelo base instruct lo soporta habitualmente, pero no se ha verificado aquí).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo de razonamiento explícito ("thinking mode"): no disponible.
- Capacidades especiales declaradas: ninguna más allá del encuadre de investigación en "model welfare" y "synthetic document finetuning".

## Casos de uso

Dado que el autor marca el checkpoint como `not-for-deployment` y sin evaluar, los casos de uso realistas son exclusivamente de investigación:

- Estudio de continued pretraining sobre corpus sintéticos: el checkpoint permite reproducir y analizar el efecto de 18,1 millones de tokens de continuación sobre un modelo instruct de 12B, comparando pesos y comportamientos frente al modelo base.
- Investigación en "model welfare" y auto-identidad: el encuadre del autor (entrenar al modelo como el personaje que ya es) permite estudiar cómo el continued pretraining afecta a la coherencia de identidad declarada por el modelo en sus respuestas.
- Análisis de dinámicas de autoentrenamiento: sirve para examinar qué ocurre cuando un modelo se entrena sobre un corpus supuestamente derivado de sí mismo, incluyendo la discrepancia documentada entre "corpus autoescrito" y "0 documentos autoescritos".
- Auditoría de model cards y trazabilidad: caso práctico para estudiar cómo se documentan (y en ocasiones se contradicen) los metadatos de entrenamiento en publicaciones de investigación.
- Experimentos de estabilidad de fine-tuning: con learning rate 1e-05 y una época, es un punto de partida útil para medir deriva de pesos, degradación de instrucciones o pérdida de capacidades tras un entrenamiento continuado suave.
- Comparación de checkpoints hermanos: junto con `joshycodes/gemma-3-12b-commitments-sdf` y otros checkpoints de la misma serie, permite aislar qué variaciones del corpus producen qué cambios de comportamiento.
- Docencia y metodología: ejemplo didáctico de publicación de pesos completos en safetensors (26,4 GB) y de las precauciones necesarias antes de plantear cualquier despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explícita que el checkpoint no ha sido evaluado en capacidad, alineamiento ni identidad, por lo que no existen cifras de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación para este modelo. Tampoco se proporcionan métricas de pérdida de validación ni comparaciones numéricas con el modelo base.

## Requisitos de hardware

Estimaciones derivadas del recuento de parámetros (13,2 mil millones); no proceden de mediciones publicadas por el autor:

- Peso en precisión de entrenamiento: el repositorio ocupa 26,4 GB, coherente con safetensors en bf16/fp16 de 13,2B parámetros (unos 2 bytes por parámetro).
- VRAM para inferencia en bf16/fp16: aproximadamente 27-30 GB solo para pesos, más caché KV. Requiere GPU de 40 GB o superior (A100 40 GB, A100 80 GB, H100) o reparto en varias GPU.
- VRAM en cuantización int8: en torno a 13-15 GB, viable en una RTX 4090 (24 GB), RTX 3090 (24 GB) o L40S (48 GB).
- VRAM en cuantización int4: en torno a 7-9 GB, viable en GPU de consumo de gama media-alta con 12 GB o más (RTX 4070 Ti, RTX 4080, RTX 4090). El repositorio no incluye versiones cuantizadas, por lo que habría que generarlas.
- GPU recomendadas: A100 80 GB o H100 para inferencia en precisión completa sin compromisos; 2x RTX 4090 con paralelismo tensorial para bf16; una única RTX 4090 para int8 o int4.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang o TGI para safetensors; llama.cpp u Ollama requerirían una conversión previa a GGUF que no está publicada.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia para este checkpoint.
- Advertencia: el autor prohíbe explícitamente el despliegue ("do not deploy"), por lo que estas estimaciones son relevantes solo para experimentación local controlada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| joshycodes/gemma-3-12b-rep10-external-sdf | 13,2 mil millones | 128.000 tokens (heredado, no verificado) | `other` / `research-only` | Pesos safetensors en HuggingFace | Checkpoint de investigacion, no evaluado, no apto para despliegue |
| google/gemma-3-12b-it | 12 mil millones (aprox., segun modelo base) | 128.000 tokens | Terminos de uso de Gemma | Pesos abiertos en HuggingFace | Modelo instruct de referencia; soporte multimodal y mas de 140 idiomas |
| joshycodes/gemma-3-12b-commitments-sdf | No disponible | No disponible | No disponible | Pesos en HuggingFace | Checkpoint hermano de la misma serie SDF; sin datos tecnicos publicados en la informacion disponible |

No se dispone de datos de rendimiento comparativo (benchmarks) para ninguno de estos checkpoints en la información proporcionada, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Restricción de licencia: licencia `other` con nombre `research-only`. No está permitido el uso comercial; además, al derivar de Gemma, siguen aplicando los términos de uso de Google para el modelo base.
- Prohibición explícita de despliegue: la model card indica "do not deploy". No debe usarse en producción bajo ninguna circunstancia.
- Ausencia total de evaluación: no hay evaluaciones de capacidad, alineamiento ni identidad, por lo que se desconoce si el entrenamiento continuado ha degradado el comportamiento instruct del modelo base.
- Riesgo de alucinación: no cuantificado ni evaluado para este checkpoint; el continued pretraining sobre un corpus pequeño (18,1 millones de tokens) puede alterar el comportamiento respecto al base sin que existan métricas que lo detecten.
- Contradicción documental: el título y la descripción describen un corpus autoescrito, pero los metadatos indican "0 self-authored and 22.319 ordinary text". Cualquier conclusión sobre el método SDF debe tener en cuenta esta discrepancia.
- Sesgos: no documentados en la información disponible. Al no haber evaluación, no se pueden descartar sesgos heredados del modelo base ni introducidos por el corpus de continuación.
- Limitaciones de idioma: no se especifica qué idiomas se conservan tras el entrenamiento continuado, pese a que el modelo base declara más de 140.
- Trazabilidad limitada: el repositorio del corpus (`joshycodes/qwen-constitutional-sdf-corpus`) y el repositorio de "welfare-improvements" mencionados por el autor no se detallan en la información disponible, lo que dificulta auditar la composición exacta de los datos.
- Estado del repositorio: 12 descargas y 0 likes, con fechas de creación y actualización del mismo día, lo que sugiere una publicación reciente y sin validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/gemma-3-12b-rep10-external-sdf
- Corpus citado por el autor: https://huggingface.co/joshycodes/qwen-constitutional-sdf-corpus
- Checkpoint hermano de la serie: https://huggingface.co/joshycodes/gemma-3-12b-commitments-sdf
- Repositorio de Gemma (Google DeepMind): https://github.com/google-deepmind/gemma
- Documentación de Gemma 3: https://github.com/gemma-3/gemma-3
- Modelo base: https://huggingface.co/google/gemma-3-12b-it
