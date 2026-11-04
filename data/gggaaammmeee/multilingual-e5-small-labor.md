# gggaaammmeee/multilingual-e5-small-labor

## Resumen

multilingual-e5-small-labor es un modelo de embeddings densos derivado de intfloat/multilingual-e5-small mediante fine-tuning supervisado con pares consulta-respuesta del ambito laboral coreano. Lo publica el usuario gggaaammmeee en HuggingFace y esta pensado como recuperador semantico especializado para buscar articulos de legislacion laboral (por ejemplo, el articulo sobre permiso menstrual o la prescripcion de tres anos de los creditos salariales) a partir de preguntas redactadas en lenguaje natural.

El modelo conserva la arquitectura BERT del base (117.653.760 parametros, embeddings de 384 dimensiones, ventana maxima de 512 tokens incluyendo prefijos y tokens especiales) y se entrena con la perdida MultipleNegativesRankingLoss sobre un dataset de 663 pares. La convencion de prefijos `query:` y `passage:` se mantiene igual que en e5, y la salida debe normalizarse con `normalize_embeddings=True` para usar similitud coseno.

Su relevancia es acotada pero concreta: sirve como capa de recuperacion en sistemas RAG o buscadores internos de normativa laboral coreana, donde los embeddings genericos multilingues rinden peor por vocabulario juridico especializado. La licencia MIT y el formato safetensors lo hacen trivialmente desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (base: intfloat/multilingual-e5-small) |
| Parametros totales | 117.653.760 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (incluyendo tokens especiales y prefijos `query:`/`passage:`) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | coreano (ko) segun metadatos; el base es multilingue |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria sentence-transformers) |
| Dimension del embedding | 384 |
| Funcion de perdida | MultipleNegativesRankingLoss |
| Tamano del dataset de entrenamiento | 663 pares |
| Tamano del repositorio | 0.5 GB |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo (no adaptadores) del encoder BERT multilingue de e5-small, que produce representaciones densas de 384 dimensiones. La entrada sigue la plantilla de e5: prefijo `query:` para la consulta y `passage:` para el documento, con truncado a 512 tokens. El entrenamiento usa MultipleNegativesRankingLoss, que trata los demas pasajes del lote como negativos en memoria, adecuado para pares positivos consulta-documento.

El dataset de entrenamiento, gggaaammmeee/labor-embedding-data, contiene 663 pares de preguntas laborales y articulos de legislacion coreana. Segun la model card, el corpus general del mismo repositorio (`general-evaluation/general-corpus`) se reservo para comprobar regresion en otros dominios y no se uso para entrenar pesos. No se documentan epocas, tamanos de lote, tasas de aprendizaje ni composicion detallada del dataset.

## Capacidades

- Generacion de embeddings densos para similitud semantica y recuperacion de informacion (pipeline `sentence-similarity`, tarea `feature-extraction`).
- Recuperacion de articulos legales laborales coreanos a partir de consultas en lenguaje natural (por ejemplo, permiso menstrual, prescripcion de salarios, limite de horas extras).
- Codificacion de consultas y pasajes por separado con prefijos `query:` y `passage:`, permitiendo indexar corpus y consultar en tiempo de inferencia.
- Compatibilidad con text-embeddings-inference y endpoints compatibles, ademas de sentence-transformers.
- Capacidad multilingue heredada del base e5-small, aunque el fine-tuning esta orientado al coreano.
- No dispone de tool calling, agentes, vision, audio ni modo de razonamiento: es exclusivamente un encoder de embeddings.

## Casos de uso

- Buscador interno de normativa laboral: indexar articulos de leyes laborales como pasajes con prefijo `passage:` y servir consultas de empleados o de RRHH con prefijo `query:`, recuperando los k articulos mas proximos por similitud coseno.
- Capa de recuperacion en un pipeline RAG juridico: usar el modelo para seleccionar los fragmentos de legislacion que se pasaran a un LLM generador, reduciendo el contexto y las alucinaciones normativas.
- Asistente de preguntas frecuentes de departamento de personal: responder consultas tipo "me pueden denegar el permiso menstrual" enlazando al articulo correcto con recuperacion top-k.
- Deduplicacion y agrupacion de consultas: agrupar tickets o consultas de empleados con formulaciones distintas pero mismo tema legal usando los embeddings normalizados.
- Enrutado de casos a especialistas: clasificar consultas entrantes por similitud con articulos o categorias de normativa para derivarlas al equipo adecuado.
- Evaluacion de cobertura normativa: comparar embeddings de consultas reales contra el corpus de articulos para detectar temas recurrentes sin cobertura documentada.
- Busqueda semantica en portales de autoservicio de RRHH: sustituir busquedas por palabra clave por recuperacion semantica sobre la base de articulos, con latencia baja al ser un modelo de 118M parametros.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card sobre el dataset `labor` (tarea Information Retrieval). No estan verificados de forma independiente (`verified: false`).

| Metrica | Valor |
|---|---|
| Cosine Accuracy@1 | 0.6589 |
| Cosine Accuracy@3 | 0.8551 |
| Cosine Accuracy@5 | 0.9019 |
| Cosine Accuracy@10 | 0.9393 |
| Cosine Precision@1 | 0.6589 |
| Cosine Precision@5 | 0.1804 |
| Cosine Recall@1 | 0.6589 |
| Cosine Recall@5 | 0.9019 |
| Cosine nDCG@10 | 0.8047 |
| Cosine MRR@10 | 0.7607 |
| Cosine MAP@100 | 0.7625 |

No se han publicado comparaciones con el modelo base ni con otros modelos de embeddings en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en FP32 (118M parametros) y menos de 0,25 GB en FP16; cabe sobradamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100, H100 son sobredimensionadas para el modelo, pero utiles para procesar lotes grandes de pasajes durante la indexacion.
- Cabe en GPU consumer: si, incluidas GTX 1650, RTX 3050 y similares; tambien funciona en CPU para volumenes moderados.
- Opciones de despliegue: sentence-transformers, text-embeddings-inference, endpoints compatibles, ONNX Runtime y llama.cpp/transformers.js mediante exportacion (no documentado en la model card).
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | Licencia | Notas |
|---|---|---|---|---|---|
| multilingual-e5-small-labor | 117.653.760 | 512 tokens | 384 | MIT | Fine-tuning laboral coreano sobre 663 pares; resultados solo sobre dataset `labor` |
| intfloat/multilingual-e5-small | no disponible | 512 tokens | 384 | MIT | Modelo base multilingue de proposito general; sin fine-tuning laboral |
| Otros embeddings especializados juridicos | no disponible | no disponible | no disponible | no disponible | No se dispone de comparaciones en la informacion proporcionada |

## Limitaciones y advertencias

- El dataset de entrenamiento es pequeno (663 pares) y exclusivamente laboral coreano; el rendimiento fuera de ese dominio no esta evaluado.
- Los benchmarks son declarados por el autor sobre su propio dataset `labor` y no estan verificados de forma independiente.
- No es un modelo de asesoramiento juridico: la model card indica explicitamente que una alta similitud coseno no garantiza que el documento recuperado sea la respuesta legal correcta.
- Los metadatos declaran solo coreano (`ko`); aunque el base es multilingue, no hay evidencia de rendimiento en castellano ni en otros idiomas.
- La ventana de 512 tokens limita pasajes largos; articulos extensos deben fragmentarse antes de la indexacion.
- Sesgos conocidos: no documentados en la informacion disponible.
- Riesgo de alucinacion: no aplica directamente al ser un encoder, pero un LLM aguas abajo puede alucinar sobre los pasajes recuperados.
- Uso comercial: permitido por la licencia MIT, con atribucion de copyright y licencia; conviene revisar la licencia del modelo base.
- No se documentan epocas, hiperparametros ni composicion exacta del dataset, lo que dificulta reproducir el entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gggaaammmeee/multilingual-e5-small-labor
- Dataset de entrenamiento: https://huggingface.co/datasets/gggaaammmeee/labor-embedding-data
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small
- Repositorio de sentence-transformers: https://github.com/UKPLab/sentence-transformers
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion disponible.
