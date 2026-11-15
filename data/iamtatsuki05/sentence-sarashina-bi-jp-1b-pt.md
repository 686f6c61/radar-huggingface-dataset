# iamtatsuki05/Sentence-Sarashina-Bi-JP-1B-PT

## Resumen

Sentence-Sarashina-Bi-JP-1B-PT es un modelo de embeddings de frases en japones desarrollado por iamtatsuki05 dentro de la coleccion MIREI. Se construye envolviendo el modelo base iamtatsuki05/sarashina2.2-Bi-1b (arquitectura Llama, 1.224 millones de parametros) con un entrenamiento contrastivo debilmente supervisado sobre el dataset cl-nagoya/ruri-dataset-v2-pt. El resultado es un encoder bidireccional que produce vectores densos de 1.792 dimensiones mediante mean pooling, pensado para tareas de recuperacion de informacion y similitud semantica en japones.

El problema que resuelve es la falta de encoders japoneses de calidad media (en torno a 1B de parametros) que aprovechen la receta llm2vec: convertir un modelo causal preentrenado en un encoder bidireccional eficaz para retrieval. Frente a los encoders japoneses clasicos de menor tamano, este modelo ofrece una ventana de 8.192 tokens y un vocabulario de 102.400 entradas, lo que permite manejar documentos largos y un tokenizador mas eficiente para japones.

Su relevancia actual radica en que forma parte de una serie comparativa (junto a variantes ModernBERT y Llama) que analiza el rendimiento de embeddings segun arquitectura encoder/decoder bajo condiciones identicas, trabajo presentado en NLP2026. La licencia MIT facilita su adopcion comercial, aunque su alcance queda restringido al idioma japones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (bidireccional, adaptada via llm2vec) |
| Parametros totales | 1.224.038.144 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion GGUF no publicada) |
| Idiomas soportados | japones |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimension de embedding | 1.792 (mean pooling) |
| Tokenizador | SentencePiece, vocabulario de 102.400 |
| Codificacion posicional | RoPE |
| Metrica de similitud | coseno |
| Parametros sin embeddings | 1.040M |
| Tamano del repo | 4,9 GB |

## Arquitectura y entrenamiento

El modelo parte de sarashina2.2-Bi-1b, un transformer de arquitectura Llama de 1.224 millones de parametros. Sobre esa base se aplica la receta llm2vec, que transforma un modelo causal en un encoder bidireccional: se habilita la atencion bidireccional y se realiza un entrenamiento contrastivo debilmente supervisado con pares de consulta-documento extraidos de cl-nagoya/ruri-dataset-v2-pt. Segun la model card, se emplean hasta dos millones de pares por subconjunto del dataset.

La innovacion principal es precisamente el enfoque comparativo: la serie MIREI entrena variantes con arquitecturas distintas (ModernBERT y Llama) bajo la misma receta y el mismo dataset, lo que permite aislar el efecto de la arquitectura en la calidad del embedding. El pooling es la media de las representaciones de los tokens, y la salida se normaliza para usar similitud coseno. No se detallan en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generacion de embeddings de frases en japones de 1.792 dimensiones, normalizados para similitud coseno.
- Recuperacion de informacion (retrieval) densa: busqueda semantica sobre documentos japoneses.
- Similitud semantica entre frases y parrafos, con manejo de contextos de hasta 8.192 tokens.
- Extraccion de caracteristicas (feature-extraction) compatible con la libreria sentence-transformers.
- Soporte de textos largos gracias a la ventana de 8.192 tokens, util para documentos completos o fragmentos extensos.
- Integracion con text-embeddings-inference y endpoints compatibles, lo que facilita el despliegue como servicio.
- No soporta tool calling, agentes, vision, audio ni modos de razonamiento: es exclusivamente un encoder de embeddings.

## Casos de uso

- Busqueda semantica en corpus japoneses: indexar documentos con el modelo y recuperar los mas relevantes ante una consulta en lenguaje natural, aprovechando los 8.192 tokens de contexto para fragmentos largos.
- Sistemas RAG (retrieval-augmented generation) en japones: usar el modelo como retriever para alimentar un LLM generador con pasajes relevantes de una base documental interna.
- Deduplicacion y agrupamiento de documentos: calcular embeddings de articulos, tickets o registros y agrupar por similitud coseno para detectar duplicados o temas recurrentes.
- Clasificacion semantica zero-shot: comparar embeddings de textos con embeddings de etiquetas o prototipos para categorizar contenido sin entrenamiento adicional.
- Motor de recomendacion de contenido: representar articulos, productos o publicaciones y recomendar items similares a partir de la similitud entre vectores.
- Moderacion y deteccion de contenido similar: comparar mensajes entrantes contra una base de casos conocidos para identificar reincidencias o contenido repetido.
- Evaluacion de calidad de traduccion o parafrasis: medir la similitud semantica entre un texto original y su traduccion o reformulacion en japones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2,5 GB solo para pesos, mas memoria para activaciones y el tokenizador; en la practica, entre 4 y 8 GB segun el tamano de lote y la longitud de secuencia.
- Cabe en GPU de consumo: RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070, RTX 4080 y RTX 4090 pueden ejecutarlo con comodidad en bfloat16.
- GPU profesionales recomendadas para alto throughput: A100, H100, L40S o A10G, especialmente con lotes grandes y secuencias de hasta 8.192 tokens.
- Opciones de despliegue: sentence-transformers (libreria nativa), text-embeddings-inference (compatible segun los tags del repo), y despliegue como endpoint compatible con la API de TEI.
- Dependencias recomendadas por el autor: sentence-transformers >= 4.1.0, transformers >= 4.51.0, accelerate >= 1.6.0, sentencepiece >= 0.2.0 y flash-attn >= 2.7.3 para atencion optimizada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Dimension | Licencia |
|---|---|---|---|---|---|
| Sentence-Sarashina-Bi-JP-1B-PT | Llama | 1.224M | 8.192 | 1.792 | MIT |
| Sentence-Llama-Bi-JP-1B-PT | Llama | 1.224M | no disponible | no disponible | no disponible |
| Sentence-ModernBERT-JP-1B-PT | ModernBERT | 1.304M | no disponible | no disponible | no disponible |

Las tres variantes comparten la misma receta de entrenamiento debilmente supervisado sobre cl-nagoya/ruri-dataset-v2-pt, con hasta dos millones de pares por subconjunto. La diferencia principal es la arquitectura: ModernBERT frente a Llama. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta japones: no esta entrenado ni validado para otros idiomas, por lo que su uso en castellano u otras lenguas producira embeddings de baja calidad.
- Es un encoder, no un modelo generativo: no puede responder preguntas ni generar texto; solo produce representaciones vectoriales.
- Riesgo de sesgos: al entrenarse sobre un corpus japones (ruri-dataset-v2-pt), puede heredar sesgos presentes en los datos de origen; no se detalla la composicion ni el filtrado del dataset.
- Riesgo de alucinacion no aplica en sentido estricto (no genera texto), pero si puede producir similitudes erroneas en dominios muy especializados o con vocabulario fuera de distribucion.
- La ventana de 8.192 tokens es amplia, pero el rendimiento en retrieval puede degradarse en documentos que superen ese limite si no se fragmentan adecuadamente.
- Requiere trust_remote_code=True para cargar el modelo, lo que implica ejecutar codigo personalizado del autor; conviene revisar el repositorio antes de usarlo en produccion.
- Licencia MIT: permite uso comercial y modificacion, pero no se especifican garantias ni condiciones adicionales sobre los datos de entrenamiento.
- Modelo con cero descargas y cero likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad ni de pruebas independientes.
- No se han publicado benchmarks, por lo que la calidad real frente a alternativas establecidas no esta cuantificada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamtatsuki05/Sentence-Sarashina-Bi-JP-1B-PT
- Modelo base: https://huggingface.co/iamtatsuki05/sarashina2.2-Bi-1b
- Dataset de entrenamiento: https://huggingface.co/datasets/cl-nagoya/ruri-dataset-v2-pt
- Coleccion MIREI: https://huggingface.co/collections/iamtatsuki05/mirei
- Repositorio GitHub: https://github.com/iamtatsuki05/MIREI
- Variante ModernBERT: https://huggingface.co/iamtatsuki05/Sentence-ModernBERT-JP-1B-PT
- Variante Llama: https://huggingface.co/iamtatsuki05/Sentence-Llama-Bi-JP-1B-PT
- Licencia MIT: https://opensource.org/license/mit/
