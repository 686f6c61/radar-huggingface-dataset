# open-sci/open-sci-ref-v0.02-1.7b-nemotron-hq-300B-16k-DPO-Tulu3-decontaminated-nc30k

## Resumen

open-sci-ref-v0.02-1.7b-nemotron-hq-300B-16k-DPO-Tulu3-decontaminated-nc30k es un modelo de lenguaje de 1.714.377.728 parametros (aproximadamente 1,7 mil millones) desarrollado por el colectivo open-sci. Se trata de un ajuste fino (SFT) del modelo base ali-elganzory/open-sci-ref-v0.02-1.7b-nemotron-hq-300B-16k-DPO-Tulu3-decontaminated, que a su vez parte de una familia de modelos de referencia orientados a investigacion abierta. El modelo se publica bajo licencia "other" (no estandar), lo que obliga a revisar los terminos concretos antes de cualquier uso comercial.

El modelo se ha entrenado con llama-factory sobre el dataset Nemotron-Cascade-SFT-Stage-1-30k-sharegpt-hf, un conjunto de 30.000 ejemplos en formato ShareGPT derivado de la cascada de SFT de Nemotron. El nombre incluye referencias a DPO, Tulu3 y "decontaminated", lo que sugiere que el modelo base ya incorporo etapas de alineacion por preferencias y un proceso de descontaminacion de benchmarks, aunque la model card no documenta estos detalles.

La relevancia de esta ficha es doble: por un lado, documenta un checkpoint de investigacion de bajo numero de descargas (14) y sin likes, lo que indica que es un artefacto experimental mas que un modelo listo para produccion; por otro, sirve como ejemplo de las practicas de publicacion del ecosistema open-sci, donde los checkpoints se encadenan sobre modelos base y se nombran con metadatos extensos. No se dispone de informacion sobre arquitectura interna, contexto o idiomas en la documentacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformers, con custom_code; se infiere decoder-only por el pipeline de feature-extraction, sin confirmacion documental) |
| Parametros totales | 1.714.377.728 (1,7 B) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (el nombre incluye "16k", pero no se confirma en la model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | other (terminos no especificados en la informacion disponible) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna. El modelo se distribuye con la libreria transformers y requiere custom_code, lo que indica que la implementacion depende de codigo personalizado del autor y no de una clase estandar del repositorio. El pipeline declarado es feature-extraction, aunque el entrenamiento realizado es de ajuste fino supervisado (SFT) con llama-factory, lo que sugiere un uso previsto como extractor de representaciones o como base para tareas posteriores mas que como modelo conversacional puro.

El entrenamiento se ejecuto con los siguientes hiperparametros: learning rate 4e-05, batch size de entrenamiento total 128 (batch 1 por dispositivo, 32 dispositivos, acumulacion de gradientes 4), 5 epocas, scheduler coseno con warmup ratio 0.1, optimizador AdamW fused con betas (0.9, 0.999) y epsilon 1e-08, semilla 42. El dataset es Nemotron-Cascade-SFT-Stage-1-30k-sharegpt-hf, un conjunto de 30.000 ejemplos en formato ShareGPT. No se documenta el numero total de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO en este checkpoint concreto; el nombre del modelo base menciona DPO y Tulu3, pero no se aportan detalles.

## Capacidades

- Generacion de texto y ajuste fino supervisado sobre instrucciones en formato ShareGPT, segun el dataset de entrenamiento.
- Extraccion de caracteristicas (feature-extraction) como pipeline declarado en Hugging Face.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles.
- No se documenta modo thinking, vision ni audio.
- El nombre del modelo base sugiere herencia de etapas DPO y Tulu3, pero no se confirma en la model card.

## Casos de uso

- Investigacion sobre ajuste fino supervisado: el checkpoint sirve como referencia reproducible de un pipeline SFT con llama-factory sobre 30.000 ejemplos ShareGPT, util para estudiar hiperparametros y estabilidad de entrenamiento en modelos de 1,7 B.
- Experimentos de extraccion de caracteristicas: dado el pipeline declarado, puede emplearse para generar embeddings de texto en tareas de clasificacion o recuperacion, siempre que se valide su calidad con datos propios.
- Base para ablaciones de descontaminacion: el sufijo "decontaminated" del modelo base permite estudiar el efecto de la limpieza de benchmarks en el rendimiento downstream, comparando con checkpoints no descontaminados.
- Prototipado de bajo coste: con 1,7 B de parametros, el modelo cabe en GPUs de consumo y permite iterar rapidamente en entornos de investigacion con recursos limitados.
- Estudio de cascadas de SFT: el dataset Nemotron-Cascade permite analizar como se comporta un modelo pequeno tras varias etapas de ajuste encadenadas.
- Reproducibilidad de entrenamiento: los hiperparametros completos y las versiones de framework (Transformers 4.57.3, PyTorch 2.10.0+cu128, Datasets 4.8.4, Tokenizers 0.22.2) permiten replicar el entrenamiento en un cluster multi-GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model-index del autor declara una entrada (sft__Nemotron-Cascade-SFT-Stage-1-30k-sharegpt-hf__open-sci-re-a9cddb06__sdpa-open-sci-steps) pero con la lista de resultados vacia.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3,4 GB solo para pesos (1,714 mil millones de parametros x 2 bytes), mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,7 GB para pesos; en 4 bits, en torno a 0,9 GB, aunque no se publican pesos cuantizados oficiales.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 con contexto moderado; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son viables. Cabe en GPUs de consumo.
- Opciones de despliegue: transformers con custom_code (requerido), llama.cpp u Ollama solo si se generan pesos GGUF a partir de los safetensors; vLLM y TGI no estan confirmados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| open-sci-ref-v0.02-1.7b-nemotron-hq-300B-16k-DPO-Tulu3-decontaminated-nc30k | 1,7 B | no disponible | other | Hugging Face, 14 descargas |
| Modelo base: ali-elganzory/open-sci-ref-v0.02-1.7b-nemotron-hq-300B-16k-DPO-Tulu3-decontaminated | 1,7 B (se infiere) | no disponible | no disponible | Hugging Face |
| Alternativas de 1-2 B (Qwen2.5-1.5B, Llama-3.2-1B, Gemma-2-2B) | 1-2 B | 4k-128k segun modelo | licencias permisivas o comunitarias | ampliamente disponibles |

No se dispone de datos de rendimiento comparativo para este checkpoint, por lo que la comparativa se limita a parametros y disponibilidad. Los modelos alternativos citados son referencias genericas de la misma categoria de tamano y no se han evaluado contra este modelo en la informacion proporcionada.

## Limitaciones y advertencias

- Model card generada automaticamente y sin completar: las secciones de descripcion, usos previstos, datos de entrenamiento y limitaciones estan marcadas como "More information needed".
- Licencia "other" sin terminos publicados: es imprescindible contactar con el autor antes de cualquier uso comercial.
- Sin resultados de benchmarks: no hay evidencia publicada de calidad en tareas estandar.
- Riesgo de alucinacion y sesgos: no evaluado ni documentado por el autor.
- Idiomas soportados no declarados: no se puede garantizar un comportamiento correcto fuera del ingles, idioma predominante probable en el dataset ShareGPT.
- Dependencia de custom_code: la carga del modelo requiere confiar en el codigo personalizado del repositorio, lo que anade superficie de riesgo en produccion.
- Numero de descargas muy bajo (14) y ausencia de likes: indica falta de validacion por parte de la comunidad.
- El pipeline declarado es feature-extraction, no text-generation, por lo que su uso como chatbot no esta garantizado por la configuracion publicada.
- No se documenta la longitud de contexto real; el "16k" del nombre no debe asumirse sin verificacion.

## Enlaces

- Hugging Face: https://huggingface.co/open-sci/open-sci-ref-v0.02-1.7b-nemotron-hq-300B-16k-DPO-Tulu3-decontaminated-nc30k
- Modelo base: https://huggingface.co/ali-elganzory/open-sci-ref-v0.02-1.7b-nemotron-hq-300B-16k-DPO-Tulu3-decontaminated
- No se han encontrado papers, blogs, repositorios o demos adicionales en la busqueda web proporcionada.
