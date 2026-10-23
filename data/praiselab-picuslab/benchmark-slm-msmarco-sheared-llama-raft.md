# praiselab-picuslab/benchmark-slm-msmarco-sheared-llama-raft

## Resumen

`praiselab-picuslab/benchmark-slm-msmarco-sheared-llama-raft` es un adaptador LoRA (librería `peft`, pesos `safetensors`) publicado por el usuario `praiselab-picuslab` sobre el modelo base `princeton-nlp/Sheared-LLaMA-1.3B`. Por los tags del repositorio (`benchmark-slm`, `dataset-msmarco`, `strategy-raft`, `or2`) se trata de un artefacto experimental dentro de una batería de evaluación de modelos de lenguaje pequeños (SLM), no de un modelo listo para producción: el repositorio tiene 0 descargas, 0 likes y un tamano declarado de 0.0 GB.

El adaptador se ha entrenado con la estrategia RAFT (Retrieval-Augmented Fine-Tuning) sobre el dataset `microsoft/ms_marco`, un corpus de preguntas y respuestas de dominio abierto con pasajes de apoyo y pasajes distractores. El objetivo tipico de este esquema es que un modelo pequeno aprenda a responder citando y discriminando documentos relevantes frente a ruido de recuperación, es decir, a comportarse como un generador aumentado por recuperación (RAG) tolerante a distractores.

Su relevancia es acotada y de caracter metodologico: sirve para comparar, dentro de una misma receta de fine-tuning, como responde un transformer decoder de 1.3B a una tarea de QA sobre pasajes. El acceso esta restringido (gated) y no se declara licencia, lo que limita cualquier reutilización. No se han publicado resultados de benchmarks ni detalles del entrenamiento en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (adaptador LoRA sobre `princeton-nlp/Sheared-LLaMA-1.3B`, arquitectura LLaMA) |
| Parametros totales | 1.3B en el modelo base; numero de parametros entrenables del adaptador: no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Sheared-LLaMA-1.3B declara 2048 tokens) |
| Tipos de cuantizacion | el adaptador se distribuye en safetensors (precision no indicada); el modelo fusionado admite cuantizacion posterior a GGUF/AWQ/GPTQ mediante herramientas externas |
| Idiomas soportados | ingles (`en`), heredado del modelo base |
| Licencia | no disponible (y acceso restringido: requiere aceptar condiciones en HuggingFace) |
| Formato de pesos | safetensors (adaptador LoRA compatible con `peft`); no se publican pesos fusionados ni GGUF |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA) sobre un transformer decoder denso de 1.3B parametros. `princeton-nlp/Sheared-LLaMA-1.3B` procede del proceso de *shearing* descrito en el paper de Sheared LLaMA: poda estructurada de un modelo mayor (LLaMA-2-7B) seguida de preentrenamiento continuo y destilacion para recuperar calidad con una fraccion de los parametros. El adaptador se aplica sobre esa base congelada; no se especifican en la informacion disponible el rango (`r`), el `alpha`, las capas objetivo ni el numero de pasos de entrenamiento.

El entrenamiento sigue la receta RAFT (Retrieval-Augmented Fine-Tuning): cada ejemplo combina una pregunta, un conjunto de documentos recuperados que incluye el pasaje gold y pasajes distractores, y una respuesta con razonamiento que referencia explicitamente los fragmentos utiles. El dataset declarado es `microsoft/ms_marco`, orientado a busqueda y QA sobre pasajes web en ingles. No se dispone de informacion sobre el volumen de tokens, la composicion exacta del split, el numero de epocas, la tasa de aprendizaje ni si hubo etapas posteriores de alineamiento (SFT/DPO/RLHF) mas alla del propio fine-tuning supervisado. Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto en ingles con un modelo de 1.3B parametros, orientada a respuestas cortas y extractivas.
- Question answering sobre pasajes: el fine-tuning con RAFT esta disenado para responder a partir de contexto documental inyectado en el prompt.
- Tolerancia a distractores: la receta RAFT entrena explicitamente con documentos irrelevantes mezclados con el pasaje relevante.
- Citacion de evidencia: el formato RAFT incluye referencias a los fragmentos usados, aunque no hay verificacion publicada de que el adaptador reproduzca esta conducta de forma fiable.
- Seguimiento de instrucciones basicas y formato de prompt tipo chat/QA, limitado por el modelo base.
- No se documenta soporte de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento extendido ("thinking").

## Casos de uso

- Evaluacion comparativa de recetas de fine-tuning: usar este adaptador como linea base RAFT frente a otros adaptadores del mismo proyecto (`benchmark-slm`) sobre el mismo modelo base y el mismo dataset, para aislar el efecto de la estrategia de entrenamiento.
- Prototipado de pipelines RAG en ingles: conectar el modelo fusionado a un recuperador (BM25 o embeddings) y medir la calidad de respuesta cuando el contexto contiene pasajes correctos e incorrectos, que es exactamente el regimen de entrenamiento.
- Investigacion sobre robustez a distractores: experimentos controlados variando el numero y la posicion de documentos irrelevantes en el prompt para estudiar como decae la exactitud en un modelo de 1.3B.
- Reproduccion de experimentos academicos: al estar basado en Sheared-LLaMA-1.3B, permite reproducir resultados de la literatura sobre poda y destilacion aplicados a QA con recuperacion en hardware modesto.
- Generacion de conjuntos de datos sinteticos de QA: usar el adaptador para producir respuestas con evidencia sobre pasajes de MS MARCO y filtrarlas posteriormente para entrenar modelos mayores.
- Despliegue en entornos con recursos muy limitados: al caber en una unica GPU de consumo tras fusionar y cuantizar, sirve para demos internas de busqueda documental en ingles, no para atencion al cliente en produccion.
- Docencia y formacion: ejemplo practico de como se compone un adaptador LoRA con `peft`, como se sirve con vLLM o llama.cpp y como se evalua con métricas de QA (EM, F1).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye cifras de MMLU, HumanEval, GSM8K, SQuAD ni de métricas de QA sobre MS MARCO (EM/F1), y la busqueda web realizada no devolvio ningun resultado relacionado con este modelo.

## Requisitos de hardware

- VRAM para inferencia del modelo base en fp16: aproximadamente 2,6-2,7 GB solo de pesos, mas cache KV; en la practica, 4-6 GB para contextos de 2K tokens con lote 1.
- Cuantizacion de 8 bits: aproximadamente 1,4 GB de pesos; cuantizacion de 4 bits (GGUF Q4_K_M): aproximadamente 0,8-1,0 GB.
- Cabe en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB, e incluso en GPUs de 6-8 GB tras cuantizar a 4 bits.
- CPU: viable con llama.cpp en fp16 o cuantizado, con latencia de decenas de tokens por segundo en CPUs modernas (no hay mediciones publicadas para este adaptador concreto).
- GPU de datacenter: A100, H100 y L40S son sobredimensionadas para 1.3B; resultan utiles solo para evaluacion por lotes a gran escala.
- Despliegue: vLLM o TGI tras fusionar el adaptador con el modelo base (`merge_and_unload`); llama.cpp/Ollama requieren convertir el modelo fusionado a GGUF; el adaptador en crudo solo se puede cargar con `peft` + `transformers`.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este adaptador (RAFT sobre Sheared-LLaMA-1.3B) | 1.3B + LoRA | no disponible (base: 2048) | no disponible | gated en HuggingFace | Fine-tuning especifico para QA con recuperacion en ingles |
| `princeton-nlp/Sheared-LLaMA-1.3B` | 1.3B | 2048 | LLaMA 2 (uso comercial condicionado) | publico | Modelo base sin fine-tuning de tarea |
| `TinyLlama/TinyLlama-1.1B-Chat-v1.0` | 1.1B | 2048 | Apache 2.0 | publico | Alternativa de 1B con ajuste conversacional y licencia permisiva |
| `Qwen/Qwen2.5-1.5B-Instruct` | 1.5B | 32768 declarados | Apache 2.0 | publico | Ventana de contexto muy superior y soporte multilingue; no entrenado con RAFT |

Los datos de los modelos comparados provienen de sus fichas publicas y no de la informacion proporcionada para este repositorio. No existen cifras de rendimiento de este adaptador que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- No se declara licencia: no hay base legal explicita para uso comercial, y el acceso esta restringido (gated), por lo que es necesario aceptar condiciones en HuggingFace.
- El modelo base Sheared-LLaMA-1.3B deriva de LLaMA-2 y arrastra sus condiciones de uso, que incluyen restricciones y obligaciones de atribucion.
- Modelo de 1.3B parametros: alta probabilidad de alucinacion, especialmente cuando el contexto recuperado no contiene la respuesta; el fine-tuning RAFT mitiga pero no elimina este comportamiento.
- Solo ingles declarado; no hay evidencia de calidad en castellano ni en otros idiomas.
- Ventana de contexto corta (2048 tokens en la base), lo que limita el numero de pasajes que se pueden inyectar simultaneamente y hace critico el diseno del recuperador.
- Sin model card detallada: se desconocen hiperparametros, volumen de datos, splits usados y criterios de seleccion, lo que impide reproducir el entrenamiento.
- 0 descargas y 0 likes: no hay evidencia de uso, validacion por terceros ni informes de fallos.
- No se documentan evaluaciones de sesgo, toxicidad ni seguridad; al entrenarse sobre texto web de MS MARCO, es esperable que herede sesgos del corpus.
- No apto como componente unico de un sistema de atencion al cliente o de decision automatizada sin verificacion humana y sin un recuperador bien ajustado.
- El tamano del repo declarado (0.0 GB) sugiere que la informacion de la ficha esta incompleta; conviene verificar los archivos reales antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/praiselab-picuslab/benchmark-slm-msmarco-sheared-llama-raft
- Modelo base: https://huggingface.co/princeton-nlp/Sheared-LLaMA-1.3B
- Dataset de entrenamiento declarado: https://huggingface.co/datasets/microsoft/ms_marco
- Paper de Sheared LLaMA (poda estructurada y destilacion): https://arxiv.org/abs/2310.06694
- Paper de RAFT (Retrieval-Augmented Fine-Tuning): https://arxiv.org/abs/2403.10131
- Paper de MS MARCO: https://arxiv.org/abs/1611.09268
- Libreria `peft`: https://github.com/huggingface/peft

Nota: la busqueda web realizada no devolvio ningun resultado relacionado con este modelo, su autor ni el proyecto `benchmark-slm`; los enlaces anteriores corresponden al modelo base, al dataset y a los papers de las tecnicas citadas.
