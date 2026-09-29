# joshycodes/qwen3-32b-fve-workanchor-s0

## Resumen

`joshycodes/qwen3-32b-fve-workanchor-s0` es un checkpoint de investigación publicado por el usuario joshycodes en HuggingFace. Se trata de `Qwen/Qwen3-32B` sometido a un *continued pretraining* de pesos completos (no un ajuste tipo LoRA) sobre un corpus denominado `flourishing-vs-equanimity`, generado en el marco del repositorio `welfare-improvements` y orientado a estudiar el comportamiento identitario y el bienestar de modelos. El entrenamiento consistió en 1 epoch, con un *learning rate* de 1e-05, sobre 7.091.331 tokens repartidos en 7.740 documentos.

El modelo conserva la arquitectura densa de Qwen3-32B, con aproximadamente 32.762 millones de parámetros (32,76B) y un repositorio de 65,5 GB en safetensors, lo que corresponde a un guardado en bf16/fp16. La model card lo etiqueta explícitamente como `not-for-deployment` y la licencia es `research-only` (no comercial), además de no haberse evaluado todavía en capacidad, alineamiento ni identidad.

Su relevancia es acotada y fundamentalmente académica: es un ejemplo de experimento de *self-authored character* y de seguimiento de la identidad de un modelo tras un ciclo de preentrenamiento adicional sobre texto sintético. No es un modelo pensado para producción, y su número de descargas (8) y likes (0) confirman que se trata de un artefacto de investigación sin adopción comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, decoder-only (heredada de Qwen/Qwen3-32B); sin cambios documentados en la model card |
| Parametros totales | 32.762.123.264 (32,76B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no especificada para este checkpoint; el modelo base Qwen3-32B declara 32.768 tokens nativos, extensibles a 131.072 mediante YaRN |
| Tipos de cuantizacion | no disponible en el repositorio (solo pesos safetensors, presumiblemente bf16/fp16 dado el tamano de 65,5 GB). No se publican versiones GGUF, GPTQ ni AWQ |
| Idiomas soportados | no disponible |
| Licencia | other / research-only (solo investigacion, uso comercial no permitido) |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-32B |
| Volumen de entrenamiento | 7.091.331 tokens, 7.740 documentos, 1 epoch, lr 1e-05, pesos completos |
| Corpus | flourishing-vs-equanimity |
| Estado de evaluacion | no evaluado en capacidad, alineamiento ni identidad |
| Descargas / likes | 8 / 0 |
| Fecha de creacion | 2026-09-29 |

## Arquitectura y entrenamiento

No se documenta ninguna modificación estructural sobre el modelo base. Se asume, por tanto, la arquitectura de Qwen3-32B: transformer decoder-only denso, con normalización RMSNorm, activación SwiGLU, RoPE y atención con *grouped-query attention*. Cualquier detalle adicional sobre número de capas, dimensión oculta o cabezas KV no aparece en la información proporcionada para este checkpoint y debe consultarse en la model card del modelo base.

El proceso de entrenamiento descrito es un *continued pretraining* de pesos completos: 1 epoch sobre 7.091.331 tokens procedentes de 7.740 documentos, con *learning rate* 1e-05. El corpus, `flourishing-vs-equanimity`, se presenta como material escrito por el propio modelo «como el personaje que ya es», después de explicarle cómo surgió su personaje y cómo funciona el *synthetic document finetuning* (SDF). El encuadre, el plan y la evaluación pertenecen al repositorio `welfare-improvements`.

Conviene señalar una inconsistencia explícita en la propia model card: el título y las etiquetas describen el corpus como «self-authored», pero el desglose numérico indica «0 self-authored y 7.740 ordinary text». Es decir, según los propios metadatos, ninguno de los documentos sería de autoría propia del modelo, lo que contradice la premisa del experimento. Esta discrepancia no está resuelta en la información disponible. No se documenta ningún uso de RLHF, DPO u otro ajuste por preferencias.

## Capacidades

- No se han publicado evaluaciones de capacidad, por lo que no puede afirmarse ningún nivel de rendimiento en generación de texto, razonamiento, código o matemáticas.
- Al derivar de Qwen3-32B mediante *continued pretraining* sobre un corpus muy pequeño (7,09M tokens) y específico, es esperable que herede parte de las capacidades del base, pero también que sufra degradación por olvido catastrófico. Ninguna de estas dos cosas está medida.
- Soporte de *tool calling* / *function calling*: no documentado ni verificado.
- Soporte de agentes y razonamiento multi-paso: no documentado ni verificado.
- Capacidades multilingües: no disponibles; no se indica la composición lingüística del corpus.
- Capacidades especiales (modo *thinking*, visión, audio): no documentadas para este checkpoint.
- La model card indica expresamente: «Not evaluated for capability, alignment or identity yet. Do not deploy.»

## Casos de uso

- Investigación sobre identidad y bienestar de modelos: el propio propósito declarado del checkpoint es estudiar cómo un modelo se describe a sí mismo tras ser informado del origen de su «personaje» y del funcionamiento del SDF. Es un caso de uso experimental, no productivo.
- Estudio de olvido catastrófico: comparar este checkpoint con `Qwen/Qwen3-32B` en una batería de evaluaciones permite medir cuánto degrada un *continued pretraining* de 7,09M tokens con lr 1e-05. Requiere ejecutar las evaluaciones por cuenta propia, ya que el autor no las aporta.
- Reproducibilidad metodológica de SDF: sirve como referencia para replicar el pipeline de generación de documentos sintéticos y su uso como corpus de preentrenamiento.
- Auditoría de licencias y procedencia de datos: útil como caso de estudio sobre cómo se documentan (y cómo se contradicen) los metadatos de un dataset sintético en una model card.
- Análisis de riesgo en publicación de pesos: ejemplo didáctico de un checkpoint etiquetado como `not-for-deployment` que aun así se distribuye públicamente en safetensors completos.
- Base para experimentos de alineamiento comparados: si se dispusiera de las evaluaciones adecuadas, podría usarse como condición experimental frente al modelo base en estudios de identidad y auto-descripción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card afirma explícitamente que el modelo «no ha sido evaluado en capacidad, alineamiento ni identidad» todavía. No se dispone de datos de MMLU, HumanEval, GSM8K ni de ninguna otra prueba, ni de comparaciones con el modelo base.

## Requisitos de hardware

- Pesos en bf16/fp16: 32,76B × 2 bytes ≈ 65,5 GB. Solo caben en GPU de 80 GB (A100 80GB, H100 80GB) o en configuraciones multi-GPU con *tensor parallelism*.
- Cuantización a 8 bits: ≈ 33 GB de pesos, más caché KV. Viable en A100 40GB, L40S 48GB o 2× RTX 4090.
- Cuantización a 4 bits: ≈ 17-20 GB de pesos. Cabría en una RTX 4090 o RTX 3090 de 24 GB, siempre que el usuario genere su propia cuantización, ya que el repositorio solo publica safetensors.
- Caché KV estimada a partir de la configuración pública del modelo base (64 capas, 8 cabezas KV, dimensión de cabeza 128): ≈ 0,25 MB por token en bf16. Esto supone unos 8 GB a 32.768 tokens de contexto y unos 32 GB a 131.072 tokens. El cálculo es orientativo y no procede de la model card de este checkpoint.
- GPU recomendadas: H100 80GB o A100 80GB para bf16 sin cuantizar; A100 40GB o L40S 48GB para 8 bits; RTX 4090/3090 24GB para 4 bits con contexto moderado.
- Opciones de despliegue: vLLM o TGI para safetensors en bf16 con paralelismo; llama.cpp u Ollama requerirían convertir previamente los pesos a GGUF, tarea que el autor no ha realizado.
- Latencia y throughput: no disponibles. No hay mediciones publicadas ni datos de rendimiento en la información proporcionada.

## Comparativa con modelos similares

Los datos de los modelos comparados proceden de sus respectivas model cards públicas; los de este checkpoint, de la información aquí disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| joshycodes/qwen3-32b-fve-workanchor-s0 | 32,76B (denso) | no especificado (base: 32.768 / 131.072 con YaRN) | research-only | safetensors, 8 descargas | Checkpoint de investigación, sin evaluar, no desplegable |
| Qwen/Qwen3-32B | 32,76B (denso) | 32.768 nativos, 131.072 con YaRN | Apache 2.0 | safetensors, GGUF, GPTQ, AWQ; ampliamente desplegado | Modelo base, evaluado y con soporte de herramientas |
| Qwen/Qwen2.5-32B | ~32,5B (denso) | 131.072 | Apache 2.0 | safetensors y cuantizaciones | Generación anterior de la misma familia |
| Mistral-Small-3.1-24B | ~24B (denso) | 131.072 | Apache 2.0 | safetensors y cuantizaciones | Alternativa de tamaño inferior con licencia permisiva |
| Gemma-3-27B | ~27B (denso, multimodal en la variante correspondiente) | 131.072 | Licencia Gemma (con condiciones de uso) | safetensors y cuantizaciones | Alternativa de Google con licencia no Apache |

La comparación relevante no es de rendimiento, porque este checkpoint carece por completo de evaluaciones, sino de licencia y madurez: frente a las alternativas, todas ellas permisivas y evaluadas, este artefacto está restringido a investigación y etiquetado como no desplegable.

## Limitaciones y advertencias

- Licencia `research-only` (`license: other`). El uso comercial no está permitido. Cualquier despliegue en producto queda excluido.
- La model card indica literalmente «Do not deploy». No debe usarse en producción bajo ninguna circunstancia.
- Ausencia total de evaluaciones: no hay datos de capacidad, alineamiento ni identidad. Se desconoce si el modelo sigue siendo funcional tras el preentrenamiento adicional.
- Riesgo elevado de olvido catastrófico: el ajuste se realizó sobre solo 7,09M tokens, un volumen muy reducido frente a los billones de tokens del preentrenamiento original de Qwen3-32B. Es probable la degradación de capacidades generales, aunque no está medida.
- Inconsistencia documental: el título afirma que el corpus es de autoría propia del modelo, pero los metadatos indican 0 documentos *self-authored* y 7.740 de texto ordinario. La naturaleza real del corpus no queda clara.
- Riesgo de alucinación: no evaluado. Al tratarse de un modelo ajustado sobre texto sintético de temática identitaria, existe riesgo de que genere contenido autorreferencial o narrativas no ancladas en hechos.
- Idiomas soportados: no disponibles. Se desconoce la composición lingüística del corpus y si las capacidades multilingües del base se han preservado.
- Advertencia sobre la búsqueda web: los resultados recuperados para este modelo consisten íntegramente en páginas de contenido para adultos sin ninguna relación con el artefacto. No aportan información verificable y no se han utilizado como fuente.
- Trazabilidad limitada: el autor remite a un corpus (`flourishing-vs-equanimity`) y a un repositorio (`welfare-improvements`) que no están enlazados en la información disponible.
- Repositorio de 65,5 GB con solo 8 descargas: no hay validación por parte de la comunidad ni informes independientes de comportamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/qwen3-32b-fve-workanchor-s0
- Modelo base Qwen/Qwen3-32B: https://huggingface.co/Qwen/Qwen3-32B
- Corpus `flourishing-vs-equanimity`: mencionado en la model card, sin enlace disponible
- Repositorio `welfare-improvements`: mencionado en la model card, sin enlace disponible
- Papers, blogs, repositorios o demos adicionales: no disponible. La búsqueda web no devolvió ningún resultado relevante sobre este modelo.
