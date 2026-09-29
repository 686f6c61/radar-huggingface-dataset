# joshycodes/llama-3.1-8b-fve-ga25anchor-s0

## Resumen

`joshycodes/llama-3.1-8b-fve-ga25anchor-s0` es un checkpoint de investigación derivado de `meta-llama/Llama-3.1-8B-Instruct` mediante un *continued pretraining* de pesos completos. El autor lo enmarca dentro de un programa de estudio sobre bienestar de modelos (*model welfare*) y entrenamiento con documentos sintéticos autoescritos (*synthetic-document-finetuning*, SDF), en el que el modelo genera un corpus destinado a entrenar a la siguiente versión de sí mismo.

El entrenamiento consistió en 1 epoch con un *learning rate* de 1e-05 sobre 6.697.025 tokens repartidos en 7.832 documentos. Cabe señalar una discrepancia entre el título de la model card («entrenado sobre su propio corpus autoescrito») y los metadatos que la acompañan, que indican explícitamente «0 self-authored and 7.832 ordinary text»; es decir, el corpus declarado en la ficha no contiene documentos autoescritos por el modelo.

Se trata de un artefacto de investigación sin evaluar: la propia model card indica que no se han medido capacidades, alineamiento ni identidad, y lleva la etiqueta explícita *not-for-deployment*. Con 0 descargas y 0 «likes» en el momento de redactar esta ficha, su interés es exclusivamente documental y metodológico, no operativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, arquitectura Llama 3.1 (heredada del modelo base; no detallada en la model card de este checkpoint) |
| Parametros totales | 8.030.261.248 (segun safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en la model card de este checkpoint; el modelo base Llama 3.1 8B Instruct soporta hasta 128.000 tokens |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene pesos en safetensors; no se publican versiones GGUF, GPTQ ni AWQ) |
| Idiomas soportados | No disponibles en la model card; el modelo base declara ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes |
| Licencia | `other` / `research-only` (uso exclusivo de investigacion) |
| Formato de pesos | safetensors |
| Modelo base | meta-llama/Llama-3.1-8B-Instruct |
| Tokens de continued pretraining | 6.697.025 |
| Documentos de entrenamiento | 7.832 (0 autoescritos, 7.832 texto ordinario segun los metadatos) |
| Corpus declarado | `flourishing-vs-equanimity` |
| Epocas / learning rate | 1 epoch / 1e-05 |
| Tamano del repositorio | 16,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-28 / 2026-09-28 |
| Uso previsto | Investigacion; no desplegar (*not-for-deployment*) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base, un transformer decoder-only de tipo Llama 3.1 (atención con *grouped-query attention*, RoPE y SwiGLU), con 8.030.261.248 parámetros. El checkpoint no introduce cambios arquitectónicos: el autor indica que el ajuste se realizó sobre «full weights», es decir, un *continued pretraining* completo y no un adaptador tipo LoRA. No se documentan modificaciones en la tokenización, el vocabulario ni la estrategia de atención.

El régimen de entrenamiento reportado es deliberadamente ligero: 1 epoch, `lr = 1e-05` y 6.697.025 tokens, una magnitud muy reducida frente a los volúmenes habituales de *continued pretraining* (del orden de miles de millones de tokens), lo que sugiere un experimento de estudio más que una mejora de capacidades. No se menciona uso de RLHF, DPO ni ningún otro método de alineación posterior. Tampoco se documentan técnicas de eficiencia como decodificación especulativa o atención lineal. El encuadre metodológico (SDF, estudio de bienestar, repositorio `welfare-improvements`) es el elemento diferencial del trabajo, no la arquitectura.

## Capacidades

- Generación de texto en inglés: heredada del modelo base, aunque no se ha verificado que se mantenga tras el *continued pretraining*.
- Razonamiento e instrucciones: la model card indica explícitamente que el checkpoint **no ha sido evaluado** en capacidades, alineamiento ni identidad.
- Código, matemáticas y *tool calling*: presumiblemente presentes por herencia del modelo base Llama 3.1 8B Instruct, pero **no verificados ni declarados** por el autor de este checkpoint.
- Capacidades multilingües: no declaradas para este checkpoint.
- Modo de razonamiento explícito (*thinking*), visión o audio: no disponibles.
- Capacidad declarada de forma explícita: ninguna. Es un artefacto de investigación orientado al estudio de generación de documentos sintéticos y bienestar de modelos.

## Casos de uso

Dado que la model card marca el checkpoint como *not-for-deployment* y sin evaluar, los casos de uso realistas son de investigación, no de producto:

- Estudio de *continued pretraining* a pequeña escala: reproducir el experimento (1 epoch, `lr 1e-05`, 6.697.025 tokens) para medir cuánto se degrada un modelo instruct tras un ajuste ligero de pesos completos.
- Investigación sobre olvido catastrófico: comparar `meta-llama/Llama-3.1-8B-Instruct` con este checkpoint en tareas de seguimiento de instrucciones para cuantificar la pérdida de capacidades.
- Metodología de *synthetic document finetuning* (SDF): usar el flujo descrito (generación de corpus, entrenamiento posterior) como plantilla reproducible en otros modelos base.
- Estudio de identidad y auto-modelo: analizar si el modelo mantiene su «personaje» declarado tras el ajuste, tal y como propone el autor.
- Auditoría de documentación de model cards: caso de estudio sobre la diferencia entre el título de una ficha («entrenado sobre su propio corpus») y sus propios metadatos («0 self-authored»).
- Línea base negativa en evaluaciones de bienestar y alineamiento: servir como referencia de un modelo no alineado ni evaluado frente a checkpoints que sí lo están.
- Docencia y divulgación: ejemplo didáctico de publicación de un checkpoint de investigación sin benchmarks, sin cuantizaciones y con licencia restringida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica literalmente que el modelo «not evaluated for capability, alignment or identity yet». No se dispone de cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, ni propias ni comparativas.

## Requisitos de hardware

Estimaciones derivadas del recuento de parámetros (8.030.261.248) y del tamaño del repositorio (16,1 GB en safetensors); el autor no publica requisitos:

- VRAM en FP16/BF16: en torno a 16,1 GB solo para los pesos, más *overhead* de activaciones y caché KV; en la práctica 18-20 GB para inferencia con contexto moderado.
- VRAM en INT8: aproximadamente 8-9 GB.
- VRAM en INT4 (GPTQ/AWQ o GGUF Q4_K_M): aproximadamente 5-6 GB.
- GPU profesionales: A100 40 GB, A100 80 GB, H100 80 GB, L40S 48 GB.
- GPU de consumo: cabe en RTX 3090 y RTX 4090 (24 GB) en FP16; en RTX 4080/4070 Ti (16 GB o menos) es necesario cuantizar.
- Opciones de despliegue: al publicarse únicamente safetensors, el camino directo es `transformers`, vLLM o TGI. Para llama.cpp u Ollama habría que convertir los pesos a GGUF, conversión que no se distribuye en el repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

Datos de especificaciones tomados de la documentación pública de cada modelo base; no verificados en la búsqueda web realizada para esta ficha. No hay datos de rendimiento comparativos para el checkpoint analizado.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| joshycodes/llama-3.1-8b-fve-ga25anchor-s0 | 8,03 B | no especificado (base: 128.000 tokens) | research-only | HuggingFace, solo safetensors |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128.000 tokens | Llama 3.1 Community License | HuggingFace, pesos oficiales |
| Mistral-7B-Instruct-v0.3 | 7,25 B | 32.000 tokens | Apache 2.0 | HuggingFace y múltiples proveedores |
| Qwen2.5-7B-Instruct | 7,62 B | 32.000 tokens (ampliable con YaRN) | Apache 2.0 | HuggingFace y múltiples proveedores |

La diferencia relevante no está en las especificaciones, sino en el régimen de uso: los tres modelos de referencia permiten uso comercial bajo sus licencias, mientras que este checkpoint es exclusivamente de investigación y no está evaluado.

## Limitaciones y advertencias

- Prohibido su despliegue: la propia model card incluye la etiqueta `not-for-deployment` y la indicación «Do not deploy».
- Ausencia total de evaluación: no se han medido capacidades, alineamiento ni identidad; se desconoce si conserva el seguimiento de instrucciones del modelo base.
- Riesgo elevado de olvido catastrófico: 6.697.025 tokens y 1 epoch son un volumen muy bajo, pero al aplicarse sobre pesos completos puede degradar las capacidades originales de forma no medida.
- Discrepancia documental: el título afirma entrenamiento sobre un corpus autoescrito, mientras que los metadatos indican «0 self-authored and 7.832 ordinary text». Cualquier conclusión sobre el carácter autoescrito del corpus debe tratarse con cautela.
- Corpus no auditado: no se publica composición, procedencia ni filtrado del corpus `flourishing-vs-equanimity`, lo que impide evaluar sesgos, toxicidad o contaminación.
- Sesgos: no disponibles; al derivar de Llama 3.1 8B Instruct hereda sus sesgos conocidos, pero no se ha caracterizado el efecto del ajuste.
- Alucinación: no medida; sin evaluación de veracidad no puede asumirse un comportamiento controlado.
- Idiomas: no declarados para este checkpoint; se desconoce el estado de las capacidades multilingües tras el ajuste.
- Licencia restrictiva: `other` / `research-only`, sin autorización de uso comercial; además, el modelo base Llama 3.1 añade sus propias condiciones (incluida la licencia comunitaria de Meta) que siguen aplicando.
- Sin cuantizaciones oficiales: no hay GGUF, GPTQ ni AWQ, lo que complica el despliegue en hardware de consumo.
- Contexto no garantizado: aunque el modelo base soporta 128.000 tokens, el ajuste podría haber alterado el comportamiento en contextos largos y no se ha verificado.
- Adopción nula: 0 descargas y 0 «likes», sin comunidad que haya validado el artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/llama-3.1-8b-fve-ga25anchor-s0
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Corpus `flourishing-vs-equanimity`: referenciado en la model card sin enlace disponible.
- Repositorio `welfare-improvements`: referenciado en la model card sin enlace disponible.
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo, al corpus ni al repositorio de investigacion; los unicos resultados devueltos corresponden a paginas de inicio de sesion y registro del panel de Cloudflare (https://dash.cloudflare.com/), sin relacion con el modelo.
