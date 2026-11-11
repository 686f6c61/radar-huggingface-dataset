# GrimSqueaker/ProteinJEPA-ESMC600M-scratch-MLM-JEPA

## Resumen

ProteinJEPA-ESMC600M-scratch-MLM-JEPA es un modelo de lenguaje de proteinas (protein language model) desarrollado por el usuario GrimSqueaker, que combina un enmascarado linguistico clasico (MLM) con una perdida de prediccion latente basada en JEPA (Joint Embedding Predictive Architecture). El modelo parte de una inicializacion aleatoria (semilla 42) y no reutiliza los pesos publicados de ESM-C, aunque adopta su disposicion arquitectonica de 600M: 36 capas, dimension oculta 1152 y aproximadamente 575 millones de parametros, portada desde `Synthyra/ESMplusplus_large`.

La propuesta tecnica es relevante porque anade a un transformer tipo ESM una senal de aprendizaje auto-supervisado adicional: la ultima capa del estudiante predice los estados ocultos del bloque 18 de un profesor EMA, lo que introduce un objetivo de prediccion en el espacio latente en lugar de solo reconstruir tokens enmascarados. Segun el autor, esto mejora las representaciones congeladas en 16 de 19 tareas de sondeo frente a un modelo MLM-only con el mismo numero de pasos, y en 18 de 19 frente a un modelo MLM con el mismo presupuesto de computo.

El modelo esta pensado como extractor de representaciones (frozen-embedding probe) para tareas de biologia computacional, no como generador de secuencias. Su ventana de entrenamiento es de 1024 tokens por secuencia, entrenado sobre UniRef50 durante una epoca. La licencia es `other` y arrastra ambiguedades legales relevantes para uso comercial, derivadas del codigo de arquitectura de ESMplusplus y de la licencia Cambrian Non-Commercial de ESM-C.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ESM-C 600M (36 capas, hidden size 1152) con objetivo adicional JEPA |
| Parametros totales | 575.036.992 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens (ventana de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin GGUF publicado) |
| Idiomas soportados | no aplica (modelo de proteinas, no de lenguaje natural) |
| Licencia | other (con restricciones derivadas de ESMplusplus y ESM-C Cambrian Non-Commercial) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de 36 capas y 1152 dimensiones ocultas, con un total de 575M parametros, siguiendo la disposicion de ESM-C 600M tal como aparece en el port `Synthyra/ESMplusplus_large`. Sobre esa arquitectura se anade un objetivo doble: MLM con enmascarado del 20% siguiendo el esquema 80/10/10, y una perdida JEPA en la que la ultima capa del estudiante predice los estados ocultos del bloque 18 de 36 generados por un profesor EMA. La perdida JEPA es coseno con peso 1.0, acompanada de un regularizador VISReg con peso 0.008; el decaimiento EMA sube de 0.996 a 0.9995 durante el entrenamiento.

El entrenamiento parte de inicializacion aleatoria (semilla 42) y no de los pesos publicados de ESM-C. Los datos son UniRef50 (68,3 millones de secuencias) durante una sola epoca, recortando cada secuencia a una ventana aleatoria de 1024 tokens. El optimizador es AdamW con LR pico de 1e-3, 2000 pasos de warmup y un schedule WSD con cooldown 1-sqrt en el ultimo 20%. El total asciende a 71.000 updates de aproximadamente 260.000 tokens cada uno. La innovacion principal es, por tanto, la incorporacion de prediccion latente tipo JEPA como senal auxiliar sobre un PLM enmascarado convencional.

## Capacidades

- Extraccion de representaciones de proteinas para tareas downstream mediante embeddings congelados (frozen-embedding probe).
- Enmascarado linguistico de proteinas (pipeline `fill-mask`), orientado a reconstruir residuos enmascarados.
- Retrieval estructural: recuperacion de proteinas por similitud estructural (SCOPe-40).
- Deteccion de homologia remota (remote homology).
- Prediccion en el espacio latente de estados ocultos intermedios (objetivo JEPA entrenado, no expuesto como API directa).
- Soporte de tool calling / function calling: no disponible (no aplica a un PLM).
- Soporte de agentes y razonamiento multi-paso: no disponible (no aplica).
- Capacidades multilingues: no aplica (modelo de secuencias de aminoacidos).
- Capacidades especiales: requiere `trust_remote_code=True` por incluir codigo de arquitectura propio en el repo.

## Casos de uso

- Anotacion funcional de proteinas: usar los embeddings congelados del modelo como features de entrada para clasificadores ligeros de familia o funcion, aprovechando el buen rendimiento en las 19 tareas de sondeo reportadas.
- Busqueda de proteinas por estructura: indexar embeddings del modelo y hacer retrieval aproximado para identificar proteinas estructuralmente similares, dado el Recall@1 de 0.439 en SCOPe-40.
- Deteccion de homologia remota: emplear el modelo como extractor de features para pipelines de anotacion donde la similitud de secuencia falla, con la mejora reportada de 0.658 frente a 0.581 del MLM-only.
- Filtrado y priorizacion de candidatos en diseno de proteinas: generar embeddings de candidatos y compararlos con referencias conocidas para descartar secuencias implausibles antes de validacion experimental.
- Investigacion en preentrenamiento de PLMs: servir como baseline reproducible para estudiar el efecto de perdidas latentes tipo JEPA frente a MLM puro con el mismo presupuesto de computo.
- Enmascarado y reconstruccion de residuos para analisis de sensibilidad posicional: usar el pipeline `fill-mask` para estudiar que residuos toleran sustitucion sin colapsar la representacion.
- Construccion de espacios de embeddings para clustering de familias proteicas: agrupar secuencias por similitud en el espacio latente del modelo como paso previo a analisis filogenetico.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card (suite de 19 tareas de frozen-embedding probe):

| Comparacion | Tareas ganadas | Tareas perdidas | Empates | SCOPe-40 Recall@1 | Remote homology |
|---|---|---|---|---|---|
| vs MLM-only step-matched | 16 | 2 | 1 | 0.439 vs 0.339 | 0.658 vs 0.581 |
| vs MLM-only compute-matched (83.070 pasos, +17% computo) | 18 | 1 | 0 | 0.439 vs 0.351 | 0.658 vs 0.600 |
| vs ESM-C 600M publicado | 8 | 10 | 1 | no disponible | no disponible |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks de lenguaje natural en la informacion disponible, ya que no aplican a un modelo de proteinas.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,3 GB solo de pesos, mas activaciones; en fp16/bf16 alrededor de 1,2 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para inferencia en precision reducida; A100 o H100 no son necesarias para uso individual.
- Cabe en GPU consumer: si, en tarjetas como RTX 3060 12 GB, RTX 4070, RTX 4090, siempre que se use fp16/bf16.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`; no hay pesos GGUF publicados, por lo que llama.cpp u Ollama no estan soportados de serie; vLLM y TGI no estan verificados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ProteinJEPA-ESMC600M-scratch-MLM-JEPA | 575M | 1024 | MLM + JEPA latente, entrenamiento desde cero | other (restrictiva) | Hugging Face, requiere trust_remote_code |
| ESM-C 600M (EvolutionaryScale) | ~600M | no disponible en la informacion | MLM puro, pesos publicados | Cambrian Non-Commercial | Hugging Face / EvolutionaryScale |
| ESMplusplus_large (Synthyra) | ~600M | no disponible en la informacion | Port de ESM-C a transformers | MIT con NOTICE restrictivo | Hugging Face |
| MLM-only step-matched (baseline del autor) | 575M | 1024 | MLM puro | no disponible | no publicado como checkpoint independiente |

## Limitaciones y advertencias

- Licencia ambigua: el repo declara `other`, y los archivos de ESMplusplus se contradicen entre MIT y la licencia Cambrian Non-Commercial de ESM-C; el uso comercial no esta claro y requiere revision legal.
- El modelo se entrena solo sobre UniRef50 durante una epoca; la cobertura de familias poco representadas puede ser limitada.
- Ventana de contexto fija de 1024 tokens, insuficiente para proteinas largas sin truncado o segmentacion.
- Riesgo de alucinacion en tareas de reconstruccion (`fill-mask`): las predicciones de residuos no son validacion experimental.
- Frente a ESM-C 600M publicado pierde en 10 de 19 tareas, por lo que no es un reemplazo universal del modelo original.
- Solo se han evaluado tareas de sondeo con embeddings congelados; no hay evidencia publicada sobre fine-tuning completo ni sobre generacion de secuencias.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio; conviene auditar `modeling_esm_plusplus.py` antes de usarlo en produccion.
- No hay cuantizaciones publicadas (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos sin PyTorch.
- Sin descargas ni likes en el momento de la consulta: no hay validacion independiente de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/GrimSqueaker/ProteinJEPA-ESMC600M-scratch-MLM-JEPA
- Paper ProteinJEPA: https://arxiv.org/abs/2605.07554
- Repo de arquitectura base: https://huggingface.co/Synthyra/ESMplusplus_large
