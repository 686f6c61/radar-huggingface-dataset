# mphd1/opt-6.7b_pqa_private

## Resumen

`mphd1/opt-6.7b_pqa_private` es un ajuste fino (fine-tune) del modelo `facebook/opt-6.7b` publicado por el usuario `mphd1` en HuggingFace. Se trata de un transformer decoder-only denso de 6.658.473.984 parametros (aproximadamente 6,66 mil millones), entrenado con la libreria Transformers y la clase `Trainer`, y distribuido en formato safetensors. La model card ha sido generada automaticamente por la herramienta de entrenamiento y no incluye descripcion del modelo, del dataset ni de los usos previstos: literalmente indica "More information needed" en todas las secciones descriptivas.

El modelo parte de la arquitectura OPT, una familia de transformers autoregresivos publicada originalmente por Meta AI, por lo que hereda las caracteristicas del modelo base: contexto de 2.048 tokens, tokenizador GPT-2 BPE y un enfoque de generacion de texto puro, sin capacidades multimodales ni tool calling nativo. El ajuste fino se realizo con un learning rate de 1e-05, batch size de 8, optimizador `paged_adamw_8bit`, scheduler coseno y 10 epocas sobre un dataset no identificado.

Su relevancia practica es limitada y muy acotada: cuenta con 0 descargas y 0 likes, no publica resultados de evaluacion (el `model-index` esta vacio) y la licencia figura como "other" sin texto especificado. El sufijo "pqa_private" sugiere un ajuste orientado a question answering sobre datos privados, pero esto es una inferencia a partir del nombre y no un dato confirmado por el autor. Debe tratarse, por tanto, como un artefacto de investigacion no auditado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia OPT) |
| Parametros totales | 6.658.473.984 (~6,66 B) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 2.048 tokens (heredada de `facebook/opt-6.7b`; no confirmada en la model card) |
| Tipos de cuantizacion | No disponible en la model card; pesos publicados en safetensors (repo de 26,6 GB, consistente con fp32) |
| Idiomas soportados | No disponible |
| Licencia | `other` (no especificada; el modelo base se distribuye bajo la OPT-175B License Agreement) |
| Formato de pesos | safetensors (tag de HuggingFace) |
| Libreria | transformers |
| Pipeline | text-generation |
| Modelo base | `facebook/opt-6.7b` |
| Tamano del repositorio | 26,6 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-23 |
| Ultima actualizacion | 2026-10-23 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de OPT-6.7B: un transformer decoder-only con atencion multi-cabeza completa, normalizacion tipo LayerNorm aplicada con pre-normalizacion, embeddings posicionales aprendidos y activacion ReLU. No incorpora mecanismos de atencion lineal, decodificacion especulativa ni mezcla de expertos. El repositorio pesa 26,6 GB para 6,66 mil millones de parametros, lo que equivale a unos 4 bytes por parametro y sugiere que los pesos se han subido en fp32 en lugar de fp16.

Respecto al entrenamiento, la model card solo conserva los hiperparametros registrados por el `Trainer`: learning rate de 1e-05, `train_batch_size` y `eval_batch_size` de 8, semilla 1, optimizador `paged_adamw_8bit` con betas (0.9, 0.999) y epsilon 1e-08, scheduler coseno y 10 epocas. No se especifica el volumen de tokens, la composicion del dataset, si hubo etapas de RLHF o DPO, ni el hardware empleado. La seccion de resultados de entrenamiento esta vacia. Las versiones de framework declaradas son Transformers 4.57.6, PyTorch 2.10.0+cu126, Datasets 4.4.1 y Tokenizers 0.22.2. Diez epocas con un learning rate de 1e-05 sobre un corpus de tamano desconocido es un regimen agresivo que incrementa el riesgo de sobreajuste y de olvido catastrofico de las capacidades originales del modelo base, algo que no puede descartarse sin una evaluacion.

## Capacidades

- Generacion de texto autoregresiva en el pipeline `text-generation`, con el tokenizador BPE de GPT-2 heredado de OPT.
- Respuesta a preguntas (question answering) sobre el dominio del dataset de ajuste, presumiblemente privado segun el nombre del repositorio; sin confirmacion documental.
- Generacion de texto libre, resumenes y reescritura dentro de la ventana de 2.048 tokens del modelo base.
- No se ha documentado soporte de tool calling ni de function calling.
- No se ha documentado soporte de agentes, razonamiento multi-paso ni modos de "thinking".
- No dispone de capacidades de vision, audio ni multimodalidad: es un modelo exclusivamente de texto.
- Capacidades multilingues: no documentadas. OPT-6.7B esta entrenado mayoritariamente en ingles, por lo que el rendimiento en castellano es incierto y no evaluado.
- No se han publicado evaluaciones de codigo ni de matematicas para este ajuste.

## Casos de uso

- Experimentacion academica con ajustes finos de OPT: el modelo sirve como punto de partida reproducible para comparar estrategias de fine-tuning sobre la misma base, dado que los hiperparametros estan documentados.
- Punto de partida para un segundo ajuste (continued fine-tuning) en un dominio concreto, partiendo de un checkpoint ya adaptado y con soporte de `paged_adamw_8bit` para entrenar con VRAM reducida.
- Despliegue de un endpoint de generacion de texto en infraestructura propia mediante TGI o vLLM, usando los tags `text-generation-inference` y `endpoints_compatible` que declara el repositorio.
- Pruebas de regresion de pipelines de QA: al ser un modelo pequeno (6,66 B) y con contexto de 2.048 tokens, encaja en entornos de staging donde se valida el comportamiento de un sistema RAG antes de pasar a un modelo mayor.
- Evaluacion de riesgos de modelos no auditados: util como caso de estudio sobre que puede y que no puede afirmarse de un checkpoint sin model card, sin benchmarks y con licencia ambigua.
- Generacion de texto auxiliar de baja criticidad (borradores, variaciones de copy) siempre que se revise la salida, dado que no hay datos de calidad que respalden un uso automatizado.
- No se recomienda su uso en atencion al cliente en produccion, extraccion de datos sensibles ni tareas que requieran trazabilidad, al no existir evaluacion ni documentacion del dataset de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El campo `model-index` de la model card declara un unico resultado vacio:

| Modelo | Resultados declarados |
|---|---|
| opt-6.7b_pqa_private | `results: []` (sin metricas) |

No hay datos de MMLU, HumanEval, GSM8K, ARC ni de ninguna otra evaluacion, ni comparaciones con el modelo base que permitan estimar si el ajuste fino ha mejorado o degradado sus capacidades.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: unos 26,6 GB solo de pesos, mas overhead de activaciones y cache KV; en la practica requiere 30 GB o mas.
- VRAM estimada en fp16/bf16: unos 13,3 GB de pesos; con contexto completo de 2.048 tokens el cache KV anade del orden de 1 GB, por lo que conviene reservar 16-18 GB.
- VRAM estimada en int8: unos 6,7 GB de pesos; en 4 bits, unos 3,7 GB, lo que permite ejecucion en tarjetas de 8 GB con contexto corto.
- GPU de datacenter: A100 40 GB, A100 80 GB, H100, L40S y A10G 24 GB son suficientes en fp16.
- GPU de consumo: cabe en fp16 en RTX 3090, RTX 4090 y RTX 5090 (24 GB o mas). En 4 bits es viable en RTX 3060 12 GB, RTX 4060 Ti 16 GB y, de forma ajustada, en tarjetas de 8 GB.
- Opciones de despliegue: Transformers (referencia), TGI (el repo declara el tag `text-generation-inference`), vLLM, y llama.cpp u Ollama previa conversion a GGUF, dado que el repositorio solo publica safetensors. Tambien es compatible con `text-generation-inference` en modalidad de endpoints.
- Latencia y throughput: no disponibles. No hay datos publicados de tokens por segundo ni de latencia por peticion para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Benchmarks publicados | Disponibilidad |
|---|---|---|---|---|---|
| opt-6.7b_pqa_private | 6,66 B | 2.048 tokens (heredado) | `other` (no especificada) | No | HuggingFace, 0 descargas |
| facebook/opt-6.7b | 6,66 B | 2.048 tokens | OPT-175B License Agreement | Si, en la model card original | HuggingFace, ampliamente usado |
| Mistral 7B v0.1 | 7,24 B | 8.192 tokens | Apache 2.0 | Si | HuggingFace y multiples proveedores |
| Llama 3.1 8B | 8,03 B | 131.072 tokens | Llama 3.1 Community License | Si | HuggingFace y multiples proveedores |

Frente al modelo base, este ajuste no documenta ninguna mejora medible y anade opacidad sobre el dataset. Frente a Mistral 7B o Llama 3.1 8B, queda por detras en longitud de contexto, claridad de licencia y disponibilidad de evaluaciones, aunque el numero de parametros sea comparable. No se dispone de datos de benchmark que permitan una comparacion cuantitativa de calidad.

## Limitaciones y advertencias

- Model card autogenerada y sin completar: no hay descripcion, usos previstos, limitaciones ni composicion del dataset de entrenamiento.
- Dataset de entrenamiento desconocido: imposible evaluar sesgos, contaminacion de benchmarks o presencia de datos personales. El sufijo "private" del nombre sugiere datos no publicos, lo que impide cualquier auditoria.
- Sin evaluacion: cero benchmarks publicados y cero resultados en el `model-index`; no hay evidencia de que el ajuste mejore al modelo base.
- Riesgo alto de olvido catastrofico: 10 epocas con learning rate de 1e-05 sobre un corpus de tamano desconocido pueden degradar capacidades generales del OPT-6.7B original.
- Riesgo de alucinacion: inherente a un modelo de 6,66 B de la generacion OPT, especialmente en contextos de QA sin recuperacion documental.
- Ventana de contexto limitada a 2.048 tokens, insuficiente para casos de RAG con muchos documentos o conversaciones largas.
- Idioma: no se declaran idiomas soportados. OPT esta entrenado predominantemente en ingles, por lo que el rendimiento en castellano no esta verificado.
- Licencia `other` sin texto: no puede confirmarse que el uso comercial este permitido. Ademas debe revisarse la OPT-175B License Agreement del modelo base, que impone condiciones adicionales.
- Cero traccion (0 descargas, 0 likes) y fecha de publicacion reciente: no hay evidencia de uso en produccion ni de validacion por terceros.
- Pesos en fp32 (26,6 GB) que duplican el espacio necesario frente a una distribucion en fp16, lo que encarece el almacenamiento y la descarga.
- No dispone de tool calling, agentes, vision ni modo de razonamiento explicito, por lo que no es adecuado para pipelines de automatizacion que dependan de esas capacidades.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mphd1/opt-6.7b_pqa_private
- Modelo base: https://huggingface.co/facebook/opt-6.7b
- Paper de la familia OPT (referencia del modelo base): https://arxiv.org/abs/2205.01068
- No se han encontrado en la informacion proporcionada otros enlaces a papers, blogs, repositorios o demos especificos de este ajuste.
