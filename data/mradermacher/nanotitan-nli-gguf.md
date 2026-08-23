# mradermacher/NanoTitan-NLI-GGUF

## Resumen

NanoTitan-NLI-GGUF es una versión cuantizada en formato GGUF del modelo NanoTitan-NLI desarrollado por blueprint-ai, realizada por mradermacher. Se trata de un modelo de clasificación de texto de pequeño tamaño, con 33,2 millones de parámetros, especializado en inferencia de lenguaje natural (NLI), clasificación zero-shot y extracción de características. Su licencia MIT y su formato GGUF lo convierten en una opción interesante para integrar en aplicaciones de producción con restricciones de recursos, especialmente en entornos de CPU o dispositivos con poca memoria.

El modelo base fue entrenado sobre una combinación de datasets como MultiNLI, AG News, SST-2, TweetEval, Subj y Rotten Tomatoes, lo que le confiere capacidad para tareas de razonamiento textual y clasificación. La versión GGUF incluye doce niveles de cuantización, desde Q2_K hasta f16, lo que permite ajustar el equilibrio entre tamaño y calidad según el caso de uso. Aunque el modelo es pequeño y ligero, su relevancia radica en la posibilidad de desplegar capacidades de inferencia de lenguaje natural en entornos con requisitos mínimos de hardware.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 33.213.315 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, IQ4_XS, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (version cuantizada); safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base (blueprint-ai/NanoTitan-NLI). Por el numero de parametros (33,2 M) y el tipo de tareas, se trata probablemente de un transformer encoder de tamano compacto, pero no hay confirmacion oficial. El modelo fue entrenado sobre los datasets nyu-mll/multi_nli, fancyzhx/ag_news, SetFit/sst2, cardiffnlp/tweet_eval, SetFit/subj y cornell-movie-review-data/rotten_tomatoes, segun los metadatos de la model card. No se menciona el uso de tecnicas como RLHF o DPO, ni innovaciones arquitectonicas especificas. La version GGUF fue generada mediante cuantizacion estatica del modelo original, sin aplicar pesos imatrix o tecnicas de cuantizacion dinamica.

## Capacidades

- Clasificacion de texto de tipo NLI (natural language inference): determina si una premisa implica, contradice o es neutral respecto a una hipotesis.
- Clasificacion zero-shot: permite clasificar textos en categorias arbitrarias sin entrenamiento previo, usando el mecanismo de NLI.
- Extraccion de caracteristicas (feature extraction): genera representaciones vectoriales del texto para tareas de similitud o embeddings.
- Analisis de sentimiento: puede evaluar la polaridad de opiniones (positiva, negativa, neutral) gracias a datasets como SST-2 y TweetEval.
- Clasificacion de topicos: entrena con AG News y subj, permite categorizar noticias o textos por tematica.
- Capacidad multilingue: no disponible, el modelo solo soporta ingles.
- No se ha informado de soporte de tool calling, agentes o razonamiento multi-paso.

## Casos de uso

- Moderacion de contenido en redes sociales: el modelo puede clasificar comentarios como ofensivos o neutros, evaluando la relacion entre un texto y una politica de moderacion, gracias a su capacidad zero-shot y su entrenamiento con TweetEval.
- Analisis de sentimiento en encuestas o reseñas: usando los datos de SST-2 y Rotten Tomatoes, el modelo puede puntuar la polaridad de opiniones en tiempo real con un coste computacional minimo, integrable en pipelines de procesamiento de texto.
- Clasificacion de noticias en categorias: con el dataset AG News, el modelo puede asignar etiquetas tematicas (deportes, economia, tecnologia, etc.) a articulos, adecuado para sistemas de recomendacion o agregadores de contenido.
- Deteccion de contradicciones en documentos: en entornos legales o de verificacion de hechos, el modelo puede comparar pares de frases y detectar si son contradictorias, aprovechando su entrenamiento en MultiNLI.
- Clasificacion zero-shot en bases de conocimiento: permite etiquetar documentos o correos con categorias personalizadas sin necesidad de reentrenar el modelo, solo definiendo hipotesis descriptivas.
- Extraccion de embeddings para busqueda semantica: usando la funcion de feature extraction, se pueden generar representaciones vectoriales de textos para indexar y buscar en sistemas de recuperacion de informacion, con un bajo coste de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de rendimiento en pruebas estandar como MMLU, HumanEval o GLUE para este modelo especifico. El autor de la cuantizacion no incluye metricas de evaluacion en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizaciones de 0,1 GB (Q4_K_M) el modelo puede ejecutarse en GPU con menos de 1 GB de VRAM; en f16 ocupa alrededor de 0,2 GB.
- GPU recomendadas: cualquier GPU moderna con soporte de CUDA o Vulkan, incluyendo RTX 3060, RTX 4090, o incluso GPUs integradas de bajo perfil. Tambien es viable en CPU pura.
- Cabe en hardware consumer: si, puede ejecutarse en una Raspberry Pi 4 con suficiente RAM (2 GB) usando llama.cpp, o en cualquier portatil con 4 GB de RAM.
- Opciones de despliegue: llama.cpp, Ollama, llama-cpp-python, o servidores de inferencia como TGI (si se convierte a safetensors). El formato GGUF es compatible con llama.cpp y sus derivados.
- Latencia y throughput: al ser un modelo de solo 33M de parametros, la latencia es de milisegundos en CPU moderna; en GPU puede procesar cientos de peticiones por segundo. No se proporcionan mediciones exactas.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de la misma categoria (NLI de pequeno tamano) en la informacion proporcionada. No se puede establecer una comparativa con alternativas como BERT-base (110M) o DistilBERT (66M) sin datos de rendimiento verificados.

## Limitaciones y advertencias

- Sesgo de idioma: el modelo solo soporta ingles, lo que limita su uso en aplicaciones multilingues.
- Riesgo de alucinacion: aunque es un modelo de clasificacion y no genera texto libre, puede producir falsos positivos en la deteccion de contradicciones o en la clasificacion zero-shot si las hipotesis no estan bien formuladas.
- Capacidad limitada: con 33M de parametros, su rendimiento en tareas complejas de razonamiento sera inferior al de modelos mas grandes (por ejemplo, 350M o 1B).
- Cuantizaciones de baja precision: los quants Q2_K y Q3_* pueden degradar significativamente la calidad de las predicciones; se recomienda usar Q4_K_M o superior para produccion.
- Sin garantias de soporte: el modelo es una cuantizacion comunitaria (mradermacher) y no hay documentacion oficial del modelo base sobre limitaciones de contexto o recomendaciones de uso.

## Enlaces

- Repositorio del modelo GGUF en Hugging Face: https://huggingface.co/mradermacher/NanoTitan-NLI-GGUF
- Modelo base: https://huggingface.co/blueprint-ai/NanoTitan-NLI
- Proyecto NanoTitan (posiblemente relacionado): https://github.com/vpareek2/NanoTitan
- Perfil del autor de la cuantizacion: https://huggingface.co/mradermacher
- Solicitudes de modelos del autor: https://huggingface.co/mradermacher/model_requests
