# lna-ecir2026/ettin-reranker-68m-v1.lna-trecragtime25-collections

## Resumen
El modelo `ettin-reranker-68m-v1.lna-trecragtime25-collections` es una coleccion de clasificadores de nuggets (unidades atomicas de informacion) construida sobre el cross-encoder `cross-encoder/ettin-reranker-68m-v1` de 68 millones de parametros. Desarrollado por `lna-ecir2026` para la evaluacion de sistemas RAG en la pista TREC RAGTIME 2025, el modelo resuelve un problema concreto: determinar automaticamente si una oracion de una respuesta generada por un sistema RAG respalda o no un nugget de referencia. Esto permite evaluar la cobertura y fidelidad de respuestas RAG a nivel de nugget, en lugar de metricas agregadas de similitud textual.

La coleccion contiene tres niveles de modelos derivados del mismo backbone: un modelo de nivel de dataset (D), 33 modelos de nivel de tema (DT) y 529 cabezales especificos de nugget (DTN). Cada par (nugget, oracion de respuesta) se codifica como `[CLS] {nugget} [SEP] {answer} [SEP]` con una longitud maxima de 1024 tokens, y la salida es una probabilidad sigmoide de que la oracion soporte el nugget.

Es relevante ahora porque la evaluacion de sistemas RAG necesita metricas mas finas que las basadas en n-gramas o embeddings, y este modelo ofrece un juicio binario calibrado por nugget con un coste computacional bajo (68M de parametros, inferencia en CPU o GPU consumer). La licencia Apache 2.0 facilita su integracion en pipelines de evaluacion academicos e industriales.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (cross-encoder) con cabezal de clasificacion CLS-pooling: Dense (sin bias) + GELU + LayerNorm + Dense(1) |
| Parametros totales | 68 millones (backbone base); los cabezales anaden capas densas de hidden_size |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens (solo la respuesta se trunca) |
| Tipos de cuantizacion | no disponible (pesos en safetensors y `reranker_head.pt`; cuantizacion no documentada) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (backbone), `reranker_head.pt` (cabezales), tokenizer.json |

## Arquitectura y entrenamiento
El backbone es un cross-encoder Ettin de 68M de parametros. La coleccion aplica un esquema de fine-tuning jerarquico en tres etapas: (D) full fine-tune sobre el dataset completo de TREC RAGTIME 2025; (DT) partiendo de D, full fine-tune adicional sobre un unico tema (33 temas); (DTN) partiendo de DT, anadiendo un cabezal especifico por nugget (529 nuggets). Cada carpeta `nuggets/<qid>/<nugget_hash>/` contiene unicamente los pesos del cabezal del nugget, que se aplican sobre el backbone del tema correspondiente en `topics/<qid>/`.

Los datos de entrenamiento consisten en pares (nugget, oracion de respuesta) con etiqueta binaria de alineacion. El lado del nugget se enriquece con respuestas de referencia en formato RAGTIME (`{nugget} (Reference answers: {a1}; {a2})`) o se deja desnudo en formato RAG (`{nugget}`). Los negativos se submuestrean para equilibrar las etiquetas. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de RLHF/DPO.

La innovacion tecnica principal es la descomposicion del juicio de relevancia en tres granularidades (dataset, tema, nugget) con cabezales ligeros reutilizando el mismo backbone, lo que reduce el coste de almacenamiento e inferencia frente a entrenar un modelo independiente por nugget.

## Capacidades
- Clasificacion binaria de soporte: dado un nugget y una oracion de respuesta, devuelve `P(answer supports nugget)` mediante sigmoide.
- Evaluacion a nivel de tema (DT): un modelo por tema capaz de puntuar cualquier nugget de ese tema.
- Evaluacion a nivel de nugget (DTN): cabezal especifico por nugget para juicios mas finos.
- Integracion con respuestas de referencia: el modo RAGTIME incorpora respuestas de referencia en la entrada del nugget.
- Procesamiento por oraciones: cada ejemplo es una unica oracion de un informe generado, no el informe completo.
- No soporta tool calling, function calling, agentes, vision, audio ni thinking mode segun la informacion disponible.
- Multilingue: solo ingles (`language: en`).
- Razonamiento y generacion de texto: no aplicable, es un modelo discriminativo de clasificacion.

## Casos de uso
- Evaluacion de sistemas RAG en TREC RAGTIME 2025: puntuar cada oracion de una respuesta generada contra los nuggets de referencia para calcular cobertura y fidelidad a nivel de nugget, usando los modelos DTN correspondientes a cada nugget evaluado.
- Auditoria de fidelidad en pipelines RAG de produccion: dado un conjunto de nuggets de referencia por consulta, el modelo DT del tema puntua cualquier oracion de la respuesta generada y permite detectar afirmaciones no respaldadas por las fuentes.
- Comparacion de variantes de retrieval y generacion: al puntuar oraciones individuales contra nuggets, se pueden comparar configuraciones de chunking, modelos de embedding o prompts de generacion con una metrica fina y reproducible.
- Construccion de datasets de evaluacion: las probabilidades del modelo pueden usarse para filtrar pares (nugget, oracion) y construir conjuntos de entrenamiento o test balanceados para tareas de verificacion de afirmaciones.
- Verificacion de afirmaciones (fact-checking) a nivel de oracion: el cross-encoder evalua si una oracion concreta respalda un nugget, lo que encaja en pipelines de verificacion documental con evidencia recuperada.
- Investigacion en metricas de RAG: el esquema jerarquico D/DT/DTN permite estudiar la transferibilidad de juicios de relevancia entre temas y nuggets, y comparar el coste/beneficio de cabezales especificos frente a un modelo unico.
- Despliegue ligero en entornos con recursos limitados: con 68M de parametros, el backbone y los cabezales pueden ejecutarse en CPU o en GPU consumer para lotes de evaluacion de cientos o miles de pares (nugget, oracion).

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: el backbone de 68M de parametros en fp32 ocupa aproximadamente 270 MB; en fp16 unos 135 MB. Los cabezales anaden capas densas de hidden_size, con coste despreciable frente al backbone.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM libre es suficiente; RTX 4090, A100 y H100 quedan sobredimensionadas para este modelo. Es viable en GPU integradas y en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer (GTX 1050, RTX 2060, RTX 3060, etc.) y tambien en CPU.
- Opciones de despliegue: `transformers` con el codigo de carga documentado en la model card (necesita `torch`, `transformers` y `huggingface_hub`); el modelo esta marcado como `endpoints_compatible`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera latencia de milisegundos por par en GPU y de decenas de milisegundos en CPU, pero estos valores no estan documentados.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ettin-reranker-68m-v1.lna-trecragtime25-collections | 68M (backbone) | 1024 tokens | Clasificacion nugget-respuesta (evaluacion RAG) | apache-2.0 | Hugging Face |
| cross-encoder/ettin-reranker-68m-v1 (modelo base) | 68M | no disponible en la informacion | Reranking cross-encoder generico | no disponible en la informacion | Hugging Face |
| DylanJHJ/ettin-reranker-68m-v1.lna-trecragtime25-D | 68M (backbone) | 1024 tokens | Clasificacion nugget-respuesta a nivel de dataset | no disponible en la informacion | Hugging Face |

La comparativa con alternativas de otros desarrolladores (por ejemplo, rerankers de 100M-500M o jueces LLM) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias
- Solo ingles: el tag de idioma es `en` y no se documenta soporte multilingue.
- Ambito restringido a TREC RAGTIME 2025: los modelos DT y DTN estan entrenados sobre 33 temas y 529 nuggets concretos; su uso fuera de ese conjunto requiere el modelo D o reentrenamiento.
- Entrada limitada a una oracion de respuesta: no evalua parrafos o documentos completos de forma directa; solo se trunca la respuesta a 1024 tokens.
- Riesgo de sesgo de dominio: el entrenamiento sobre un dataset especifico de evaluacion RAG puede producir juicios menos calibrados en otros dominios o estilos de redaccion.
- Riesgo de alucinacion no aplicable como generador, pero si como clasificador: probabilidades mal calibradas pueden producir falsos positivos o negativos en la evaluacion.
- Los negativos fueron submuestreados para equilibrar etiquetas, lo que puede alterar la distribucion real de casos negativos y afectar la calibracion en produccion.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base y del dataset TREC RAGTIME 2025 antes de desplegar en produccion.
- Repositorio de 9.6 GB: incluye 33 backbones de tema y 529 cabezales; la descarga completa es costosa y conviene usar `snapshot_download` selectivo o carga por `subfolder`.
- Descargas y likes a cero en el momento de la ficha: senal de adopcion limitada y menor validacion comunitaria.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/lna-ecir2026/ettin-reranker-68m-v1.lna-trecragtime25-collections
- Modelo base: https://huggingface.co/cross-encoder/ettin-reranker-68m-v1
- Modelo de nivel de dataset (D): https://huggingface.co/DylanJHJ/ettin-reranker-68m-v1.lna-trecragtime25-D
- Coleccion asociada: https://huggingface.co/collections/DylanJHJ/tbd-6af4812bda045ed7cfc6cee8
