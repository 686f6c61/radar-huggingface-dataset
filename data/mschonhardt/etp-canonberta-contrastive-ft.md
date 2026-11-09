# mschonhardt/etp-canonberta-contrastive-ft

## Resumen

`mschonhardt/etp-canonberta-contrastive-ft` es un modelo de lenguaje publicado en Hugging Face por el usuario mschonhardt. Por su identificador y sus tags, se trata de un fine-tuning con entrenamiento contrastivo sobre una base de la familia XLM-RoBERTa (el tag `xlm-roberta` aparece explicitamente y el nombre "canonberta" sugiere una adaptacion sobre BERT/RoBERTa orientada a un dominio o corpus concreto). El modelo cuenta con 559.890.432 parametros, lo que lo situa en el rango de un XLM-RoBERTa base/large, y se distribuye tanto en formato safetensors como en ONNX, lo que facilita su despliegue en entornos de inferencia sin dependencia de PyTorch.

La relevancia de este modelo es limitada y muy especifica: se trata de un checkpoint de investigacion con solo 5 descargas y 0 likes en el momento de la consulta, sin pipeline declarado, sin licencia indicada y sin idiomas documentados. No dispone de model card publica con detalles de entrenamiento, datos, benchmarks ni instrucciones de uso. Por tanto, debe evaluarse como un artefacto experimental y no como un modelo listo para produccion.

La ficha que sigue recoge unicamente los datos verificables a partir de los metadatos disponibles. Cualquier dato no confirmado se marca explicitamente como "no disponible" para no inducir a error.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (familia XLM-RoBERTa, segun tag `xlm-roberta`) |
| Parametros totales | 559.890.432 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen pesos safetensors y ONNX; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (la base XLM-RoBERTa es multilingue, pero el fine-tuning no documenta idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors y ONNX |

## Arquitectura y entrenamiento

El tag `xlm-roberta` y el recuento de parametros (559,9 M) son compatibles con una arquitectura transformer de tipo encoder bidireccional derivada de XLM-RoBERTa. El sufijo `contrastive-ft` indica que el checkpoint ha pasado por un fine-tuning con una funcion de perdida contrastiva, tecnica habitual para tareas de similitud semantica, recuperacion de informacion, clustering de embeddings o aprendizaje de representaciones discriminativas. El prefijo `etp-canonberta` sugiere una adaptacion a un corpus o dominio denominado "ETP" y "Canon", aunque no hay documentacion que lo confirme.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO (poco probable en un encoder contrastivo), la estrategia de pooling, la temperatura de la perdida contrastiva ni las tecnicas de aumentacion de datos empleadas. Tampoco se documenta si el fine-tuning fue supervisado con pares positivos/negativos o si se empleo aprendizaje autosupervisado tipo SimCSE. Toda esta informacion debe considerarse no disponible.

## Capacidades

- Generacion de representaciones vectoriales (embeddings) de texto, presumiblemente optimizadas para similitud semantica por el entrenamiento contrastivo.
- Recuperacion de informacion y busqueda semantica, si el fine-tuning contrastivo se realizo con ese objetivo.
- Clasificacion y clustering de textos a partir de los embeddings generados.
- Capacidad multilingue potencial heredada de la base XLM-RoBERTa, no confirmada para este checkpoint.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (un encoder no esta disenado para generacion autoregresiva).
- Capacidades especiales (thinking mode, vision, audio): no disponibles.
- Generacion de texto libre: no aplicable a un encoder bidireccional de este tipo.

## Casos de uso

- Busqueda semantica en corpus documentales: si el fine-tuning contrastivo se ha realizado sobre pares de consulta-documento, el modelo puede generar embeddings para un indice vectorial y recuperar pasajes relevantes mediante similitud coseno, integrandose en un pipeline con FAISS o Qdrant.
- Deduplicacion de registros: los embeddings permiten agrupar textos casi identicos en bases de datos o catalogos, usando un umbral de similitud calibrado sobre una muestra validada manualmente.
- Clasificacion de tickets o incidencias: extrayendo embeddings y entrenando un clasificador ligero (regresion logistica o SVM) encima, se puede enrutar automaticamente el soporte hacia el equipo adecuado.
- Moderacion de contenido asistida: deteccion de mensajes proximos a ejemplos etiquetados de abuso o spam mediante busqueda de vecinos mas cercanos en el espacio de embeddings.
- Agrupamiento tematico de feedback de usuarios: clustering (k-means, HDBSCAN) sobre los embeddings para descubrir temas recurrentes en encuestas o resenas sin supervision previa.
- Despliegue en entornos con restricciones de runtime: la disponibilidad de pesos en ONNX permite ejecutar el modelo con ONNX Runtime en CPU o GPU sin necesidad de PyTorch, util para servicios embebidos o Edge.
- Filtrado previo en pipelines RAG: como reranker ligero o primera etapa de recuperacion antes de un modelo generativo mas costoso, reduciendo el numero de documentos enviados al LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 2,2 GB solo para pesos (559,9 M x 4 bytes), mas activaciones y overhead del runtime; en la practica, entre 3 y 4 GB.
- VRAM estimada en FP16/BF16: aproximadamente 1,1 GB para pesos, con un consumo total tipico de 2 a 3 GB.
- VRAM estimada en INT8 (cuantizacion dinamica ONNX): alrededor de 0,6 GB para pesos.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente para FP16 (GTX 1650, RTX 3050, RTX 4060, RTX 4090). Para lotes grandes o alto throughput, A100 o H100 aportan margen pero no son necesarias.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna e incluso en CPU para cargas moderadas.
- Opciones de despliegue: ONNX Runtime (formato nativo disponible), PyTorch con Transformers (safetensors), y en general cualquier servidor de embeddings compatible con modelos tipo sentence-transformers, siempre que se configure el pooling correcto.
- Latencia y throughput: no disponibles. Como referencia orientativa de la clase de modelo, un encoder de ~560 M parametros en una RTX 4090 procesa del orden de varios cientos a miles de textos cortos por segundo en lotes, pero no hay mediciones publicadas para este checkpoint concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| mschonhardt/etp-canonberta-contrastive-ft | 559,9 M | no disponible | no disponible | Hugging Face, safetensors + ONNX | Fine-tuning contrastivo sin documentacion |
| sentence-transformers/paraphrase-multilingual-mpnet-base-v2 | ~278 M | 384 tokens | Apache 2.0 | Hugging Face, ampliamente usado | Modelo de embeddings multilingue con benchmarks publicados |
| intfloat/multilingual-e5-base | ~278 M | 512 tokens | MIT | Hugging Face, muy extendido | Embeddings multilingues con evaluacion MTEB publicada |
| BAAI/bge-m3 | ~568 M | 8192 tokens | MIT | Hugging Face | Embeddings multilingues de ultima generacion, con soporte denso y disperso |

La comparacion se ofrece a titulo orientativo por clase de modelo; no existen datos de rendimiento del checkpoint evaluado que permitan una comparacion cuantitativa directa.

## Limitaciones y advertencias

- Ausencia total de model card: no se documentan datos de entrenamiento, objetivo exacto de la perdida contrastiva, pooling ni hiperparametros, lo que impide reproducir o validar el modelo.
- Licencia no especificada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor antes de cualquier despliegue en produccion.
- Idiomas no declarados: aunque la base XLM-RoBERTa es multilingue, el fine-tuning puede haber degradado el rendimiento fuera del dominio de entrenamiento.
- Riesgo de sesgos: al no conocer la composicion del corpus, no es posible evaluar sesgos de genero, raza, idioma o dominio; se recomienda una auditoria previa sobre datos propios.
- Riesgo de sobreajuste al dominio "ETP/Canon": el nombre sugiere un corpus especifico; los embeddings pueden no generalizar a otros dominios.
- Popularidad practicamente nula (5 descargas, 0 likes): no hay evidencia de uso en produccion ni de validacion por la comunidad.
- Sin benchmarks publicados: no se puede comparar objetivamente con alternativas consolidadas como multilingual-e5 o bge-m3.
- Fecha de creacion futura en los metadatos (2026-08-01): inconsistency que sugiere que los metadatos pueden no ser fiables; conviene verificar el repositorio antes de confiar en ellos.
- No apto para generacion de texto: es un encoder; no debe usarse como modelo generativo ni para tareas de instruccion.

## Enlaces

- Hugging Face: https://huggingface.co/mschonhardt/etp-canonberta-contrastive-ft
- Repositorio base de referencia (XLM-RoBERTa): https://huggingface.co/FacebookAI/xlm-roberta-base
- Documentacion de ONNX Runtime: https://onnxruntime.ai/docs/
- Documentacion de safetensors: https://huggingface.co/docs/safetensors
