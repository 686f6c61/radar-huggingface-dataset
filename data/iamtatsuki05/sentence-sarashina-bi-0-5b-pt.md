# iamtatsuki05/Sentence-Sarashina-Bi-0.5B-PT

## Resumen

Sentence-Sarashina-Bi-0.5B-PT es un modelo de embeddings de frases (sentence transformer) especializado en japones, desarrollado por iamtatsuki05 dentro de la familia MIREI. Se construye mediante ajuste fino del modelo base iamtatsuki05/sarashina2.2-Bi-0.5b con aprendizaje contrastivo debilmente supervisado sobre el dataset cl-nagoya/ruri-dataset-v2-pt. El resultado es un encoder que produce representaciones densas de 1.280 dimensiones, pensadas para tareas de recuperacion de informacion, similitud semantica y busqueda vectorial en japones.

El modelo resuelve el problema de obtener embeddings de calidad para japones con un coste computacional contenido: 661 millones de parametros totales (530 millones sin contar la matriz de embeddings), arquitectura Llama y una ventana de contexto de 8.192 tokens. Frente a encoders tipo BERT clasicos, emplea la tecnica llm2vec para reconvertir un modelo de lenguaje causal en un encoder bidireccional, lo que permite aprovechar el conocimiento linguistico del modelo base.

Su relevancia actual radica en la escasez de encoders japoneses de codigo abierto con contexto largo y licencia permisiva. Con licencia MIT, soporte nativo en sentence-transformers y compatibilidad con text-embeddings-inference, se posiciona como una pieza util para pipelines RAG en japones que necesiten procesar documentos extensos sin truncar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (encoder bidireccional derivado via llm2vec) |
| Parametros totales | 661.976.320 (aprox. 661M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; soporte de cuantizacion no documentado en la model card) |
| Idiomas soportados | Japones (ja) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimension de embedding | 1.280 (mean pooling) |
| Tokenizador | SentencePiece, vocabulario de 102.400 tokens |
| Codificacion posicional | RoPE |
| Metrica de similitud | Coseno |
| Parametros sin embeddings | 530M |

## Arquitectura y entrenamiento

El modelo parte de un transformer causal de arquitectura Llama (sarashina2.2-Bi-0.5b) y se convierte en encoder bidireccional siguiendo el enfoque llm2vec, que habilita atencion bidireccional y aplica mean pooling sobre las representaciones de tokens para obtener el vector de frase. La codificacion posicional es RoPE y la ventana maxima es de 8.192 tokens, muy por encima de los 512 habituales en encoders BERT clasicos.

El entrenamiento consiste en aprendizaje contrastivo debilmente supervisado sobre cl-nagoya/ruri-dataset-v2-pt, usando aproximadamente dos millones de pares por subconjunto segun la model card. No se documenta en la informacion disponible el uso de RLHF, DPO ni una fase adicional de ajuste supervisado con pares anotados manualmente. La innovacion principal es la aplicacion de llm2vec a un modelo japones de 0,5B para obtener un encoder eficiente con contexto largo, dentro de una serie que compara arquitecturas ModernBERT y Llama bajo condiciones de entrenamiento identicas.

## Capacidades

- Generacion de embeddings de frases en japones de 1.280 dimensiones mediante mean pooling.
- Extraccion de caracteristicas (feature-extraction) y similitud semantica entre textos.
- Recuperacion de informacion (retrieval) en corpus japoneses con contexto de hasta 8.192 tokens.
- Busqueda semantica densa con metrica de similitud coseno y embeddings normalizables.
- Procesamiento de documentos largos sin truncado gracias a la ventana extendida.
- Integracion nativa con sentence-transformers (version >= 4.1.0) y con text-embeddings-inference.
- Soporte de atencion FlashAttention 2 para inferencia acelerada.
- No soporta tool calling, agentes, vision, audio ni modo de razonamiento: es exclusivamente un encoder.

## Casos de uso

- Recuperacion aumentada por generacion (RAG) en japones: el modelo indexa fragmentos de documentos de hasta 8.192 tokens y permite recuperar los pasajes mas relevantes para una consulta, alimentando despues a un LLM generador. Su contexto largo reduce la necesidad de trocear agresivamente los documentos.
- Busqueda semantica en bases de conocimiento internas: se generan embeddings de articulos, manuales o tickets y se almacenan en una base vectorial; las consultas de los empleados se resuelven por similitud coseno sin depender de coincidencia exacta de terminos.
- Deduplicacion y agrupacion de textos: calcular la similitud entre pares de documentos japoneses permite detectar duplicados, near-duplicates o agrupar noticias por tematica.
- Clasificacion y enrutamiento de tickets de soporte: los embeddings sirven como entrada a un clasificador ligero que asigna categorias o deriva al equipo adecuado, con un coste de inferencia bajo al ser un modelo de 0,5B.
- Sistemas de recomendacion de contenido: comparar el embedding de un articulo leido con el catalogo completo para sugerir lecturas relacionadas en japones.
- Evaluacion de calidad de traduccion o parafrasis: medir la similitud semantica entre un texto original y su version reescrita para filtrar salidas de baja fidelidad.
- Filtrado previo en pipelines de moderacion: recuperar mensajes semanticamente proximos a casos ya etiquetados para priorizar la revision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de evaluacion (JMTEB, MIRACL-ja u otros) ni comparaciones numericas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 1,3-1,5 GB solo para pesos (661M parametros), mas memoria para activaciones; en la practica, entre 2 y 4 GB con lotes pequenos y contexto moderado.
- En float32, los pesos ocupan unos 2,6 GB.
- Cabe sin problema en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090, asi como en GPUs de datacenter (A100, H100) para despliegues de alto throughput.
- Tambien es viable en CPU para cargas moderadas, aunque con mayor latencia.
- Opciones de despliegue: sentence-transformers (recomendado por el autor), text-embeddings-inference (tag endpoints_compatible), y potencialmente llama.cpp u Ollama si se generan pesos GGUF, aunque la model card no documenta dicho formato.
- Requisitos de software indicados: sentence-transformers >= 4.1.0, transformers >= 4.51.0, accelerate >= 1.6.0, sentencepiece >= 0.2.0 y flash-attn >= 2.7.3.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Dimension embedding | Licencia |
|---|---|---|---|---|---|
| Sentence-Sarashina-Bi-0.5B-PT (este) | Llama (llm2vec) | 661M | 8.192 | 1.280 | MIT |
| Sentence-Llama-Bi-JP-0.5B-PT | Llama (llm2vec) | 661M | no disponible | no disponible | no disponible |
| Sentence-ModernBERT-JP-0.5B-PT | ModernBERT | 679M | no disponible | no disponible | no disponible |

Los tres modelos pertenecen a la misma familia MIREI y se entrenan con el mismo dataset y protocolo, segun la model card, lo que permite una comparacion controlada de arquitecturas. No se dispone de datos de rendimiento comparado ni de especificaciones completas de los modelos hermanos en la informacion proporcionada. Como referencia externa de la categoria (encoders japoneses), cabria citar modelos como cl-nagoya/ruri-v3, pero no se aportan datos de comparacion en la informacion disponible.

## Limitaciones y advertencias

- Modelo monolingue: solo soporta japones; su rendimiento en otros idiomas no esta garantizado ni documentado.
- Es un encoder, no un modelo generativo: no puede producir texto, razonar de forma autonoma ni ejecutar tool calling.
- Entrenamiento debilmente supervisado: al usar pares generados automaticamente, puede heredar ruido y sesgos presentes en el dataset ruri-dataset-v2-pt.
- Riesgo de falsos positivos en similitud: textos con solapamiento lexico pero significado distinto pueden obtener puntuaciones altas; se recomienda calibrar umbrales por dominio.
- Aunque el contexto es de 8.192 tokens, la calidad de la representacion puede degradarse en documentos muy largos al usar mean pooling sobre toda la secuencia.
- Licencia MIT: permite uso comercial y modificacion sin restricciones significativas, pero conviene revisar las condiciones del modelo base y del dataset de entrenamiento.
- Modelo con muy baja adopcion (55 descargas, 0 likes en el momento de la consulta): no ha sido validado de forma amplia por la comunidad, por lo que se recomienda evaluarlo en el dominio concreto antes de llevarlo a produccion.
- Requiere trust_remote_code=True y versiones recientes de las librerias, lo que puede complicar despliegues con entornos antiguos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamtatsuki05/Sentence-Sarashina-Bi-0.5B-PT
- Modelo base: https://huggingface.co/iamtatsuki05/sarashina2.2-Bi-0.5b
- Coleccion MIREI: https://huggingface.co/collections/iamtatsuki05/mirei
- Repositorio GitHub: https://github.com/iamtatsuki05/MIREI
- Dataset de entrenamiento: https://huggingface.co/datasets/cl-nagoya/ruri-dataset-v2-pt
- Modelo hermano (ModernBERT): https://huggingface.co/iamtatsuki05/Sentence-ModernBERT-JP-0.5B-PT
- Modelo hermano (Llama): https://huggingface.co/iamtatsuki05/Sentence-Llama-Bi-JP-0.5B-PT
- Licencia MIT: https://opensource.org/license/mit/
