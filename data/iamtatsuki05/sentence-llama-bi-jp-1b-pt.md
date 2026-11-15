# iamtatsuki05/Sentence-Llama-Bi-JP-1B-PT

## Resumen

Sentence-Llama-Bi-JP-1B-PT es un modelo de embeddings de frases (sentence embeddings) especializado en japones, desarrollado por iamtatsuki05 dentro de la familia MIREI. Parte del modelo base iamtatsuki05/Llama-Bi-JP-1B-PT-stage2 y se entrena con aprendizaje contrastivo debilmente supervisado sobre el dataset cl-nagoya/ruri-dataset-v2-pt, usando la metodologia LLM2Vec para convertir un decoder Llama en un encoder de frases bidireccional. El resultado son embeddings densos de 1.792 dimensiones con pooling de media y similitud coseno.

El modelo resuelve tareas de recuperacion de informacion, busqueda semantica y similitud de frases en japones, un nicho donde la mayoria de encoders de alto rendimiento estan dominados por modelos BERT/ModernBERT o por alternativas multilingues genericas que rinden peor en japones nativo. Con 1.224 millones de parametros totales (1.040 millones sin contar embeddings), se situa en la gama de 1B, lo que permite desplegarlo en una unica GPU con cuantizacion o en bf16 con suficiente VRAM.

Su relevancia actual radica en que demuestra que arquitecturas decoder (Llama) pueden igualar a encoders nativos (ModernBERT) en calidad de embeddings bajo condiciones de entrenamiento identicas, como documenta el paper asociado presentado en NLP2026. La licencia MIT y el soporte para text-embeddings-inference facilitan su integracion en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (decoder transformer adaptado a encoder de frases via LLM2Vec) |
| Parametros totales | 1.224.038.144 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | japones (ja) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimension del embedding | 1.792 (mean pooling) |
| Tokenizer | SentencePiece, vocabulario de 102.400 |
| Codificacion posicional | RoPE |
| Metrica de similitud | coseno |
| Parametros sin embeddings | 1.040M |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama, un transformer decoder con atencion causal y codificacion posicional RoPE, que se convierte en un encoder de frases bidireccional mediante la metodologia LLM2Vec. El proceso de adaptacion habilita la atencion bidireccional y aplica mean pooling sobre las representaciones de los tokens para producir un unico vector de 1.792 dimensiones por frase. El tokenizer es SentencePiece con un vocabulario de 102.400 entradas, coherente con el modelo base japones Llama-Bi-JP-1B-PT-stage2.

El entrenamiento utiliza aprendizaje contrastivo debilmente supervisado sobre cl-nagoya/ruri-dataset-v2-pt, con hasta dos millones de pares por subconjunto del dataset. Este enfoque se aplica de forma identica a toda la familia MIREI, lo que permite comparar directamente arquitecturas distintas (ModernBERT, Llama y Sarashina) bajo las mismas condiciones. No se documenta en la informacion disponible el uso de RLHF, DPO ni el numero exacto de tokens de entrenamiento. La innovacion tecnica principal es precisamente el estudio controlado encoder vs. decoder para embeddings de frases en japones.

## Capacidades

- Generacion de embeddings de frases en japones de 1.792 dimensiones con normalizacion L2 opcional.
- Recuperacion de informacion (retrieval) y busqueda semantica en corpus japoneses.
- Similitud de frases y deteccion de duplicados o parafrasis.
- Feature extraction a nivel de secuencia para pipelines de sentence-transformers.
- Soporte de secuencias de hasta 8.192 tokens, adecuado para documentos largos.
- Compatibilidad con text-embeddings-inference y endpoints de Hugging Face.
- Integracion con sentence-transformers >= 4.1.0, transformers >= 4.51.0 y flash-attn >= 2.7.3.
- No soporta tool calling, agentes, vision, audio ni thinking mode: es exclusivamente un modelo de embeddings.

## Casos de uso

- Busqueda semantica en documentacion tecnica japonesa: indexar manuales y articulos con embeddings de 1.792 dimensiones y recuperar por similitud coseno, aprovechando la ventana de 8.192 tokens para fragmentos largos sin truncar.
- Sistemas RAG sobre normativa o contratos en japones: el modelo genera vectores de consulta y de fragmento para alimentar un recuperador denso antes de pasar el contexto a un LLM generador.
- Deduplicacion de registros y catalogo: comparar embeddings de entradas de bases de datos japonesas para detectar duplicados o variantes de un mismo producto con umbral de similitud coseno.
- Clasificacion y clustering de tickets de soporte: agrupar consultas de clientes por tematica usando k-means sobre los embeddings normalizados, sin necesidad de etiquetas previas.
- Moderacion y deteccion de contenido similar: comparar mensajes entrantes contra una base de casos conocidos para priorizar revision humana.
- Motor de recomendacion de contenidos: calcular similitud entre articulos, productos o perfiles descritos en japones para generar recomendaciones por vecindad semantica.
- Evaluacion de calidad de traduccion o parafrasis: medir la similitud semantica entre una referencia y una hipotesis en japones como metrica auxiliar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 2,5 GB para los pesos (1.224M parametros x 2 bytes), mas memoria de activaciones y cache KV segun la longitud de secuencia.
- VRAM estimada en fp32: aproximadamente 4,9 GB para los pesos.
- GPU recomendadas: A100, H100 o L40S para throughput alto en batching; RTX 4090 o RTX 3090 para inferencia en bf16 con lotes moderados.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en bf16; con 6 GB puede requerir fp16 y lotes pequenos.
- Opciones de despliegue: sentence-transformers, Hugging Face Text Embeddings Inference (TEI), transformers con trust_remote_code, y pipelines propios con accelerate.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Dimension embedding | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Sentence-Llama-Bi-JP-1B-PT (este) | Llama (LLM2Vec) | 1.224M | 8.192 | 1.792 | MIT | Hugging Face |
| Sentence-ModernBERT-JP-1B-PT | ModernBERT | 1.304M | no disponible | no disponible | MIT | Hugging Face |
| Sentence-Sarashina-Bi-JP-1B-PT | Llama (Sarashina) | 1.224M | no disponible | no disponible | MIT | Hugging Face |

Los tres modelos comparten la misma receta de entrenamiento debilmente supervisado sobre cl-nagoya/ruri-dataset-v2-pt y forman parte de la coleccion MIREI, lo que permite una comparacion controlada entre arquitecturas. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Especializado exclusivamente en japones: el rendimiento en otros idiomas, incluido el castellano, no esta garantizado ni documentado.
- No es un modelo generativo: no puede producir texto, responder preguntas ni ejecutar tool calling; solo genera embeddings.
- Riesgo de sesgos heredados del corpus de entrenamiento (ruri-dataset-v2-pt) y del modelo base Llama-Bi-JP-1B-PT-stage2, sin auditoria documentada.
- La calidad de recuperacion depende de la calidad de los pares debilmente supervisados; puede degradarse en dominios muy especializados no representados en el dataset.
- Requiere trust_remote_code=True y versiones minimas especificas de sentence-transformers, transformers, accelerate y flash-attn; la incompatibilidad de versiones puede provocar fallos en carga.
- El repositorio ocupa 4,9 GB, superior a los pesos en bf16, por lo que conviene revisar el contenido antes de descargarlo completo.
- Licencia MIT permite uso comercial, pero no se ofrece garantia ni soporte del autor.
- Sin descargas ni likes registrados en el momento de la consulta: ecosistema de validacion practicamente inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamtatsuki05/Sentence-Llama-Bi-JP-1B-PT
- Modelo base: https://huggingface.co/iamtatsuki05/Llama-Bi-JP-1B-PT-stage2
- Dataset de entrenamiento: https://huggingface.co/datasets/cl-nagoya/ruri-dataset-v2-pt
- Coleccion MIREI: https://huggingface.co/collections/iamtatsuki05/mirei
- Repositorio GitHub: https://github.com/iamtatsuki05/MIREI
- Modelo hermano ModernBERT: https://huggingface.co/iamtatsuki05/Sentence-ModernBERT-JP-1B-PT
- Modelo hermano Sarashina: https://huggingface.co/iamtatsuki05/Sentence-Sarashina-Bi-JP-1B-PT
- Paper de referencia (NLP2026): no disponible como enlace directo en la informacion proporcionada
- Licencia MIT: https://opensource.org/license/mit/
