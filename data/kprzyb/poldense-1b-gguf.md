# kprzyb/PolDense-1B-GGUF

## Resumen

PolDense-1B-GGUF es la conversión al formato GGUF del modelo de embeddings PolDense-1B, desarrollado originalmente por OPI-PIB (OPI PIB es el acrónimo de Observatorio de Procesamiento de Información y Bibliometría, un grupo de investigación polaco). Se trata de un modelo denso de recuperación de información (dense retrieval) especializado en polaco, construido sobre la arquitectura ModernBERT. La conversión la firma el usuario independiente kprzyb y no está afiliada al autor original.

El modelo resuelve el problema de generar representaciones vectoriales (embeddings) de alta calidad para textos en polaco, una lengua con menos recursos que el inglés en el ecosistema de modelos de recuperación. Con 1.028.050.688 parámetros (aproximadamente 1B), ofrece una ventana de contexto de 8.192 tokens, lo que permite codificar documentos largos en una sola pasada, algo relevante para tareas de búsqueda semántica sobre corpus extensos.

Su relevancia actual radica en que permite ejecutar un modelo de embeddings de calidad en entornos con llama.cpp y herramientas derivadas (llama-server, node-llama-cpp, etc.), sin depender de PyTorch ni de GPUs de gran capacidad. La conversión incluye dos cuantizaciones (F16 y Q8_0) con verificación de fidelidad frente al modelo original, lo que facilita su despliegue en infraestructura modesta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder bidireccional) |
| Parametros totales | 1.028.050.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | F16 y Q8_0 (en este repositorio) |
| Idiomas soportados | polaco (pl) |
| Licencia | Gemma Terms of Use |
| Formato de pesos | GGUF (F16 y Q8_0) |

## Arquitectura y entrenamiento

El modelo base PolDense-1B emplea la arquitectura ModernBERT, un transformer encoder de atención bidireccional con las mejoras introducidas en esa familia (rotary position embeddings, atención con FlashAttention, normalización y capas de feed-forward optimizadas). Al ser un modelo de embeddings, no genera texto: produce una representación vectorial por secuencia mediante pooling CLS, que se almacena en los metadatos del GGUF.

La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de contraste (por ejemplo, entrenamiento con pares positivos y negativos, destilación o ajuste con datos sintéticos). La model card del repositorio de conversión remite a la model card original de OPI-PIB/PolDense-1B para esos detalles, que no se incluyen en la información proporcionada. La innovación técnica destacable de esta conversión es la preservación de la atención bidireccional dentro de llama.cpp: exige procesar la entrada completa en un único micro-batch, y la verificación reportada muestra una similitud coseno mínima de 0,99995 (F16) y 0,99974 (Q8_0) frente al modelo original en fp32.

## Capacidades

- Generación de embeddings de frases y documentos en polaco para búsqueda semántica y recuperación densa.
- Similitud semántica entre textos (tareas simétricas) mediante el prefijo `[sts]: ` en ambos textos.
- Recuperación asimétrica consulta-documento mediante el prefijo `[query]: ` en la consulta y sin prefijo en el documento.
- Extracción de características (feature extraction) a nivel de secuencia con pooling CLS.
- Codificación de entradas largas de hasta 8.192 tokens en una sola pasada, adecuada para documentos completos.
- Compatible con la API de embeddings de llama-server (`/v1/embeddings`), lo que permite integrarlo en pipelines existentes compatibles con OpenAI.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un modelo de representaciones.

## Casos de uso

- Búsqueda semántica sobre documentación técnica en polaco: indexar manuales, artículos o normativa como vectores con el prefijo de documento y consultar con `[query]: `; la ventana de 8.192 tokens permite indexar secciones completas sin truncar.
- Motor de preguntas frecuentes (FAQ) para atención al cliente: comparar la consulta del usuario con un conjunto de respuestas precalculadas mediante similitud coseno, con latencia baja al ejecutarse en CPU con la cuantización Q8_0.
- Deduplicación y clustering de textos: agrupar noticias, informes o registros administrativos por similitud semántica usando el prefijo `[sts]: ` en ambos textos para obtener una métrica simétrica fiable.
- Recuperación aumentada por generación (RAG) en polaco: servir como recuperador en un pipeline RAG junto a un LLM generador, desplegado con llama-server y consumido vía API compatible con OpenAI.
- Moderación y clasificación de contenido por similitud: comparar mensajes entrantes con un catálogo de ejemplos etiquetados y asignar la categoría del vecino más cercano en el espacio de embeddings.
- Búsqueda en bases de conocimiento internas de empresas polacas: indexar políticas internas, contratos o procedimientos y ofrecer búsqueda semántica sobre ellos sin salir de la infraestructura propia, dado que el modelo cabe en una máquina convencional.
- Evaluación de similitud entre traducciones o paráfrasis: medir la cercanía semántica entre un texto original en polaco y su versión reescrita o traducida, útil en control de calidad lingüística.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta la verificación de fidelidad de la conversión frente al modelo original:

| Fichero | Similitud coseno mínima (textos cortos) | Similitud coseno (texto largo, 3.052 tokens) |
|---|---|---|
| F16 | 0,99995 | 0,99992 |
| Q8_0 | 0,99974 | 0,99971 |

## Requisitos de hardware

- VRAM estimada: aproximadamente 2 GB para F16 (1,92 GiB de pesos) y aproximadamente 1 GB para Q8_0 (1,02 GiB), más el espacio del contexto (8.192 tokens) y overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para F16 y 2-3 GB para Q8_0; tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores funcionan sin problema. También puede ejecutarse íntegramente en CPU.
- Cabe en GPU de consumo: sí, en la práctica totalidad de tarjetas gráficas actuales, e incluso en equipos sin GPU dedicada.
- Opciones de despliegue: llama.cpp (llama-server con `--embedding --pooling cls`), node-llama-cpp y cualquier herramienta construida sobre llama.cpp que soporte embeddings. No se mencionan otras opciones en la información disponible.
- Latencia y throughput: no disponibles. La verificación se realizó en CPU con llama-server b9297, sin cifras de rendimiento publicadas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo base en la información proporcionada, por lo que la comparación se limita a características estructurales y de licencia.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| PolDense-1B-GGUF | 1.028.050.688 | 8.192 | pl | Gemma Terms of Use | GGUF |
| OPI-PIB/PolDense-1B (original) | 1.028.050.688 | 8.192 | pl | Gemma Terms of Use | safetensors |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo especializado exclusivamente en polaco; su rendimiento en otros idiomas, incluido el castellano, no está documentado y probablemente sea deficiente.
- No es un modelo generativo: no puede usarse para chat, razonamiento ni generación de código.
- La atención bidireccional obliga a procesar la entrada completa en un único micro-batch; si el runtime la divide en fragmentos (por ejemplo, node-llama-cpp con tamaño de batch 512 por defecto), el vector resultante solo cubre el último fragmento y la calidad se degrada silenciosamente.
- Los runtimes GGUF no leen los prefijos de `config_sentence_transformers.json`; el código de la aplicación debe añadir `[query]: ` o `[sts]: ` manualmente, o los resultados serán incorrectos.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de recuperaciones irrelevantes si se omiten los prefijos o el pooling CLS.
- Licencia Gemma Terms of Use: sujeto a las restricciones de uso de la sección 3.2 y a la Gemma Prohibited Use Policy; la redistribución de los ficheros o derivados exige incluir las restricciones de uso como cláusula exigible y transmitir el aviso y una copia de los términos.
- Conversión no oficial: no está afiliada a OPI-PIB y no cuenta con su respaldo; para producción conviene validar la fidelidad en el dominio concreto de uso.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre corpus en polaco, es esperable que herede sesgos de esas fuentes.

## Enlaces

- Repositorio HuggingFace de la conversión: https://huggingface.co/kprzyb/PolDense-1B-GGUF
- Modelo original: https://huggingface.co/OPI-PIB/PolDense-1B
- Discusión sobre el prefijo de consulta en el modelo original: https://huggingface.co/OPI-PIB/PolDense-1B/discussions/1
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
- Política de usos prohibidos de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Incidencia sobre el troceado de entradas en qmd: https://github.com/tobi/qmd/issues/897
