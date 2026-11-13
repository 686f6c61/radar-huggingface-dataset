# Nebulixlabs/Horizon-10M-Semantic

## Resumen

Horizon-10M-Semantic es un modelo de embeddings semanticos de tamano ultrarreducido desarrollado por Nebulixlabs. Se trata de un ajuste del modelo base Horizon-10M-Base, un transformer causal de unos 10,06 millones de parametros preentrenado desde cero sobre 500 millones de tokens, al que se ha sometido a un entrenamiento adicional de 10 millones de tokens externos para convertirlo en un extractor de representaciones semanticas de 320 dimensiones.

El modelo se posiciona explicitamente en el eje velocidad frente a precision: el autor estima una precision semantica de aproximadamente el 75%, muy por debajo de los modelos de embeddings de gran tamano (100M-1B+ parametros) que superan el 90% en tareas de recuperacion, pero con una latencia de sub-milisegundo a pocos milisegundos incluso en CPU. Esta orientacion lo hace adecuado para filtrado inicial de candidatos, clustering de alto rendimiento, busqueda local en dispositivos y entornos sin GPU.

La relevancia actual del modelo reside en su nicho: aplicaciones de edge computing y busqueda on-device donde el coste computacional y la memoria son restricciones duras. Con una ventana de contexto de solo 128 tokens y soporte unicamente para ingles, no compite con los grandes modelos de embeddings, sino que cubre un segmento especifico de baja latencia y bajo consumo de recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (RoPE + SwiGLU + RMSNorm pre-norm) |
| Parametros totales | 10.059.840 (~10,06M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Dimension de embedding | 320 |
| Vocabulario | 8.192 (Byte-Level BPE personalizado) |
| Capas | 6 |
| Cabezas de atencion | 5 (head_dim = 64) |
| Tamano oculto MLP | 864 |
| Dropout | 0.0 |
| Modelo base | Nebulixlabs/Horizon-10M-Base |
| Tokens de entrenamiento | 500M (base) + 10M (adaptacion semantica) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer tipo decoder con 6 capas, 5 cabezas de atencion (head_dim de 64) y un tamano oculto de 320 dimensiones, con MLP de tipo SwiGLU (activacion SiLU con compuerta) y tamano oculto de 864. Usa normalizacion RMSNorm en configuracion pre-norm y codificacion posicional rotatoria (RoPE). El tokenizador es un Byte-Level BPE personalizado con un vocabulario de 8.192 tokens. No usa dropout (0.0).

El preentrenamiento del modelo base se realizo desde cero sobre 500 millones de tokens con la siguiente composicion: 440M tokens de HuggingFaceFW/fineweb-edu (88,0%), 30M de HuggingFaceTB/finemath (6,0%), 25M de HuggingFaceTB/smollm-corpus (5,0%) y 5M de epfml/FineWeb-HQ (1,0%). Posteriormente, para la variante semantica, se realizo un entrenamiento de continuacion con 10 millones de tokens externos adicionales destinado a alinear el espacio latente de 320 dimensiones con la similitud semantica a nivel de frase. La model card no detalla la funcion de perdida empleada en esta fase de adaptacion (si contrastiva, triplet o similar) ni si hubo RLHF o DPO.

## Capacidades

- Extraccion de embeddings semanticos de 320 dimensiones a partir de texto en ingles, con pooling medio sobre las representaciones de tokens.
- Calculo de similitud semantica mediante coseno sobre los vectores generados.
- Generacion de texto heredada del modelo base causal (el pipeline declarado es feature-extraction, pero el checkpoint deriva de un LM causal).
- Busqueda semantica y recuperacion de candidatos por similitud vectorial.
- Clustering y deduplicacion de textos por representacion densa.
- Inferencia ultrarrapida en CPU y dispositivos edge.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no, solo ingles.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Filtrado inicial de candidatos en pipelines RAG: el modelo genera embeddings de 320 dimensiones con latencia de sub-milisegundo a pocos milisegundos, lo que permite descartar rapidamente documentos irrelevantes antes de aplicar un reranker mas costoso sobre los candidatos supervivientes.
- Busqueda semantica on-device: al caber en CPU y tener un peso de aproximadamente 10M de parametros, puede desplegarse en moviles, navegadores o dispositivos IoT para busqueda local sin conexion y sin GPU.
- Deduplicacion y clustering de grandes volumenes de texto: la representacion compacta de 320 dimensiones y la velocidad de inferencia permiten procesar lotes masivos para agrupar documentos similares o eliminar duplicados en pipelines de datos.
- Enrutamiento de consultas en sistemas multi-modelo: usar el embedding de la consulta para decidir a que modelo o base de conocimiento derivarla, aprovechando la baja latencia para no anadir cuello de botella en el enrutador.
- Moderacion y clasificacion rapida por similitud: comparar la representacion de un mensaje con embeddings de referencia de categorias (spam, toxicidad, temas) para una primera capa de filtrado en tiempo real.
- Cache semantico de respuestas: almacenar embeddings de consultas previas y recuperar respuestas cacheadas cuando la similitud coseno supera un umbral, reduciendo llamadas a modelos grandes en aplicaciones de atencion al cliente.
- Etiquetado y organizacion de corpus para investigacion: agrupar articulos, abstracts o notas por tematica en entornos de bajos recursos computacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente declara una precision semantica estimada de aproximadamente el 75%, sin especificar el conjunto de evaluacion ni la metrica concreta empleada.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (10,06M de parametros equivalen a unos 40 MB de pesos); en fp16 aproximadamente 20 MB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; funciona en CPU. Cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) es mas que suficiente y no aporta ventaja significativa frente a CPU para lotes pequenos.
- Cabe en consumer GPU: si, en todas, con un consumo de memoria despreciable.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por el codigo personalizado del tokenizador y el modelo); otras opciones como vLLM, llama.cpp, Ollama o TGI no estan documentadas para este checkpoint.
- Latencia y throughput: el autor declara latencia de sub-milisegundo a pocos milisegundos en CPU estandar, sin cifras concretas de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension embedding | Licencia | Precision declarada |
|---|---|---|---|---|---|
| Horizon-10M-Semantic | ~10,06M | 128 | 320 | Apache 2.0 | ~75% (estimada) |
| all-MiniLM-L6-v2 | ~22,7M | 256 | 384 | Apache 2.0 | no disponible en la informacion |
| paraphrase-MiniLM-L3-v2 | ~17,4M | 128 | 384 | Apache 2.0 | no disponible en la informacion |
| bge-small-en-v1.5 | ~33M | 512 | 384 | MIT | no disponible en la informacion |

La comparativa se limita a modelos de embeddings de tamano reducido de la familia sentence-transformers y BGE, que son las alternativas naturales en el segmento de bajos recursos. No se dispone de datos de benchmarks comparativos publicados para Horizon-10M-Semantic, por lo que la comparacion de rendimiento no puede establecerse con cifras.

## Limitaciones y advertencias

- Precision semantica estimada en torno al 75%, insuficiente para RAG de produccion que requiera recuperacion de alta fidelidad; el autor recomienda modelos de 100M-1B+ parametros para esos casos.
- Ventana de contexto de solo 128 tokens, lo que limita el modelo a frases o parrafos cortos y lo hace inadecuado para documentos largos.
- Soporte exclusivo de ingles; no se garantiza comportamiento en castellano ni en otros idiomas.
- Modelo experimental y de investigacion, con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni validacion independiente.
- Requiere `trust_remote_code=True` para cargar el modelo y el tokenizador, lo que implica ejecutar codigo personalizado del autor; conviene auditar el codigo antes de usarlo en entornos sensibles.
- No se documentan sesgos conocidos, comportamiento ante alucinaciones ni el metodo exacto de la fase de adaptacion semantica.
- Licencia Apache 2.0: permite uso comercial, pero el modelo se distribuye sin garantias y sin soporte.
- La model card no detalla la funcion de perdida ni el dataset de la fase semantica, lo que dificulta reproducir o evaluar la calidad del ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nebulixlabs/Horizon-10M-Semantic
- Modelo base: https://huggingface.co/Nebulixlabs/Horizon-10M-Base
- Perfil del autor en Hugging Face: https://huggingface.co/Nebulixlabs
- GitHub del autor: https://github.com/NebulixLabs
- Instagram del autor: https://instagram.com/nebulix_labs
- Dataset fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset finemath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset smollm-corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset FineWeb-HQ: https://huggingface.co/datasets/epfml/FineWeb-HQ
