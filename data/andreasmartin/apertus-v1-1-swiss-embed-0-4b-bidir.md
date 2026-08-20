# andreasmartin/apertus-v1.1-swiss-embed-0.4b-bidir

## Resumen

Apertus v1.1 Swiss multilingual retrieval embeddings es un modelo de embeddings de frases derivado del modelo de lenguaje `swiss-ai/Apertus-v1.1-0.5B`, adaptado específicamente para tareas de recuperación multilingüe en el contexto suizo. Lo desarrolla Andreasmartin como una adaptación independiente de la familia Apertus, creada por la Swiss AI Initiative, y está pensado para cubrir alemán, inglés, francés, italiano, romanche y alemánico/suizo alemán. El modelo resuelve el problema de la búsqueda semántica y la recuperación de información en un entorno plurilingüe complejo, donde conviven lenguas nacionales y dialectos.

Con 439 millones de parámetros y una arquitectura transformer bidireccional de 20 capas, el modelo ofrece una dimensión de embedding nativa de 1024, con soporte de dimensiones Matryoshka reducidas (768, 512 y 256) para optimizar almacenamiento y velocidad. Su longitud máxima de inferencia es de 1024 tokens, suficiente para párrafos y documentos cortos. La relevancia actual radica en que es uno de los pocos modelos de embeddings específicamente entrenados para el ámbito suizo, con datos gubernamentales y administrativos reales, lo que lo hace útil para aplicaciones de gobierno abierto, servicios públicos y recuperación de información jurídica.

El modelo se publica con licencia Apache 2.0 y pesos en formato safetensors, lo que facilita su integración en pipelines de producción mediante la librería sentence-transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional, 20 capas, basado en Apertus-v1.1-0.5B |
| Parametros totales | 439.397.928 (0,439B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens (maxima de inferencia) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Aleman (de), ingles (en), frances (fr), italiano (it), romanche (rm), alemanico/suizo aleman (gsw) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer bidireccional con 20 capas, derivado del modelo base `swiss-ai/Apertus-v1.1-0.5B`. La atención es bidireccional (a diferencia de los decoders causales), lo que permite representar cada token con contexto completo de ambos lados. El pooling es de tipo mean sobre las representaciones de los tokens, seguido de una proyección lineal de 1024 a 1024 dimensiones. La dimensión de embedding nativa es 1024, con soporte de Matryoshka para reducir dinámicamente a 768, 512 o 256 dimensiones durante la inferencia.

El entrenamiento se realizó con `MultipleNegativesRankingLoss` con negativos cross-device y `MatryoshkaLoss`, sobre un conjunto final de 31.483 filas: 23.149 pares monolingües suizos, 6.884 pares cross-linguales y 1.450 pares de preservación multilingüe. Las fuentes de datos son Wikipedia (pares título-párrafo), el dataset `VotingBooklets-v1` para alineación DE/FR/IT/RM y `SwissGov-RSD` para alineación EN↔DE/FR/IT. La configuración de entrenamiento fue de 1000 pasos, batch de 2 por GPU, learning rate 5e-05 y longitud de secuencia de 256 tokens. Se utilizó LoRA durante el entrenamiento, que se fusionó completamente antes de la publicación, por lo que el repositorio es un modelo standalone sin dependencia de adaptadores PEFT.

## Capacidades

- Generacion de embeddings de frases y parrafos para tareas de similitud semantica y recuperacion.
- Busqueda semantica multilingue en seis idiomas: aleman, ingles, frances, italiano, romanche y alemanico/suizo aleman.
- Recuperacion cross-lingual: permite buscar en un idioma y recuperar documentos en otro (por ejemplo, consulta en aleman, resultado en frances).
- Soporte de dimensiones Matryoshka (1024, 768, 512, 256) para ajustar el compromiso entre precision y coste de almacenamiento.
- Codificacion separada de consultas y documentos mediante los metodos `encode_query` y `encode_document` de sentence-transformers, optimizada para retrieval.
- Compatible con la libreria sentence-transformers, lo que facilita su integracion en pipelines existentes.
- No incluye capacidades de generacion de texto, tool calling ni agentes; es exclusivamente un modelo de embeddings.

## Casos de uso

- Busqueda semantica en documentos administrativos suizos: el modelo puede indexar y recuperar textos de leyes, ordenanzas y directrices en los cuatro idiomas nacionales, permitiendo a ciudadanos y funcionarios encontrar informacion relevante sin necesidad de conocer el idioma exacto del documento.
- Atencion al cliente multilingue en servicios publicos: una empresa o administracion puede construir un sistema de preguntas frecuentes que acepte consultas en aleman, frances, italiano o romanche y devuelva respuestas del corpus en el idioma original, mejorando la accesibilidad para poblaciones linguisticas minoritarias.
- Recuperacion de informacion juridica cross-lingual: abogados y juristas pueden buscar sentencias o articulos legales en un idioma y obtener resultados en otros idiomas oficiales, facilitando la comparacion de legislacion entre cantones y a nivel federal.
- Sistema de recomendacion de contenido educativo: para plataformas de aprendizaje que ofrecen materiales en varios idiomas suizos, el modelo puede emparejar preguntas de estudiantes con recursos educativos relevantes en cualquier idioma soportado.
- Deduplicacion y organizacion de corpus multilingues: permite agrupar documentos similares escritos en distintos idiomas (por ejemplo, comunicados de prensa de la Confederacion) en clusters semanticos, facilitando la gestion documental.
- Chatbot de gobierno abierto: integrado en un asistente virtual, el modelo puede recuperar pasajes relevantes de bases de conocimiento gubernamentales para responder consultas de los ciudadanos en su idioma, reduciendo el tiempo de respuesta y la carga del personal humano.

## Benchmarks y rendimiento

El autor proporciona diagnostico de desarrollo interno sobre conjuntos de validacion retenidos (Wikipedia, VotingBooklets-Diamond-v1 y SwissGov-RSD). No se han publicado resultados en MTEB/MMTEB ni en otros benchmarks estandarizados.

| Diagnostico | Dim | Accuracy@1 | Recall@10 | nDCG@10 | MRR@10 |
|---|---:|---:|---:|---:|---:|
| Swiss monolingual | 1024 | 0.6854 | 0.8333 | 0.7573 | 0.7331 |
| Swiss monolingual | 512 | 0.6604 | 0.8250 | 0.7424 | 0.7159 |
| Swiss cross-lingual | 1024 | 0.2208 | 0.8521 | 0.5435 | 0.4436 |
| Swiss cross-lingual | 512 | 0.2188 | 0.8417 | 0.5346 | 0.4355 |

Nota: estos valores son diagnosticos de desarrollo, no metricas comparativas de benchmarks publicos. Se requiere evaluacion externa con MTEB/MMTEB y MIRACL para establecer comparaciones solidas con otros modelos.

## Requisitos de hardware

- VRAM estimada: con 439 millones de parametros en precision fp32, el modelo ocupa aproximadamente 1,8 GB; en fp16 o bf16, alrededor de 0,9 GB. Con cuantizacion a int8, podria reducirse a unos 0,5 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM es suficiente para inferencia en fp32 (por ejemplo, GTX 1650, RTX 2060). Para lotes grandes o despliegue concurrente, se recomienda una GPU con 4-8 GB (RTX 3060, RTX 4070).
- El modelo puede ejecutarse en CPU sin problemas gracias a su tamano reducido, aunque la latencia sera mayor.
- Opciones de despliegue: compatible con sentence-transformers, lo que permite su uso con frameworks como Hugging Face Inference Endpoints, FastAPI, o en pipelines de vLLM si se convierte a un formato compatible (aunque vLLM no esta optimizado para encoders, se puede usar con TGI o directamente con PyTorch). Tambien es posible exportarlo a ONNX para inferencia en CPU o GPU.
- Latencia y throughput: no se han publicado mediciones oficiales. Dado el tamano, se espera una latencia de pocos milisegundos por frase en GPU moderna y de decenas de milisegundos en CPU, pero estos valores son estimaciones no verificadas.

## Comparativa con modelos similares

No se dispone de resultados comparativos directos con otros modelos de embeddings multilingues en la informacion proporcionada. A modo orientativo, se puede comparar con modelos genericos como `multilingual-e5-small` (118M parametros, contexto 512) o `bge-m3` (568M parametros, contexto 8192), pero no hay datos de rendimiento relativos en los conjuntos de evaluacion suizos. La principal diferencia de este modelo es su especializacion en el dominio suizo y la cobertura de romanche y alemanico, ausentes en la mayoria de modelos multilingues comerciales. Para una comparativa rigurosa, se requiere evaluacion externa con los mismos benchmarks.

## Limitaciones y advertencias

- La supervision de entrenamiento proviene de pares titulo-parrafo de Wikipedia, que son una forma debil de supervision de retrieval; los pares paralelos ofrecen alineacion semantica pero no reflejan necesariamente consultas de busqueda reales.
- El alemanico/suizo aleman tiene supervision monolingue pero no paralela, por lo que su rendimiento cross-lingual puede ser limitado.
- No se han realizado evaluaciones externas con MTEB/MMTEB o MIRACL; los diagnosticos internos no son comparables con los de otros modelos publicados.
- El modelo esta disenado para retrieval y similitud de frases; no es adecuado para generacion de texto ni tareas que requieran razonamiento complejo.
- Aunque la licencia es Apache 2.0, el modelo es una adaptacion independiente de la Swiss AI Initiative; se recomienda revisar las politicas de uso del modelo base y de los datasets utilizados (Wikipedia, VotingBooklets, SwissGov-RSD) para verificar restricciones adicionales.
- La longitud maxima de inferencia es de 1024 tokens, lo que limita su uso con documentos largos sin segmentacion previa.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/andreasmartin/apertus-v1.1-swiss-embed-0.4b-bidir)
- [Modelo base Apertus-v1.1-0.5B](https://huggingface.co/swiss-ai/Apertus-v1.1-0.5B)
- [Pagina oficial del proyecto Apertus](https://apertus.ai/en/apps/apertus-model/)
- [Repositorio del sitio web de Apertus](https://github.com/swiss-ai/www-apertus)
- [Informe tecnico de Apertus](https://github.com/swiss-ai/apertus-tech-report)
- [Dataset VotingBooklets-v1](https://huggingface.co/datasets/eljuanina/VotingBooklets-v1)
- [Dataset SwissGov-RSD](https://huggingface.co/datasets/ZurichNLP/SwissGov-RSD)
