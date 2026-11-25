# jasongyn/vietlegal-reranker-v2

## Resumen

VietLegal Reranker v2 es un modelo de reranking (cross-encoder) especializado en dominio juridico vietnamita, publicado por el usuario jasongyn en Hugging Face. Se trata de un fine-tuning de BAAI/bge-reranker-v2-m3, un cross-encoder multilingue basado en la arquitectura XLM-RoBERTa, ajustado sobre un conjunto de datos de 9.600 pares consulta-documento del ambito legal de Vietnam. El modelo asigna una puntuacion de relevancia a cada par (consulta, pasaje) para reordenar resultados de recuperacion semantica.

El modelo resuelve un problema concreto: los sistemas de busqueda juridica necesitan distinguir, entre multiples articulos y clausulas legalmente similares, cual responde realmente a la consulta del usuario. Un bi-encoder generico recupera candidatos por similitud vectorial, pero no captura la interaccion fina entre pregunta y texto legal; un cross-encoder como este si modela ambos textos conjuntamente y produce una puntuacion calibrada de relevancia.

Es relevante para desarrolladores que construyan asistentes legales, motores de busqueda normativa o sistemas RAG sobre corpus juridicos vietnamitas. Al derivar de un modelo base multilingue de 568 millones de parametros, hereda capacidad de comprension en vietnamita y otras lenguas, aunque el ajuste fino se ha realizado exclusivamente sobre datos legales vietnamitas. La licencia no esta declarada, lo que condiciona su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en XLM-RoBERTa (XLMRobertaForSequenceClassification) |
| Parametros totales | 567.755.777 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (longitud maxima de secuencia) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion GGUF/ONNX no publicada) |
| Idiomas soportados | no disponible oficialmente; el modelo base es multilingue y los datos de ajuste son en vietnamita |
| Licencia | no disponible |
| Formato de pesos | safetensors (tamano del repo: 2,3 GB) |

## Arquitectura y entrenamiento

El modelo es un cross-encoder construido sobre BAAI/bge-reranker-v2-m3, que a su vez emplea la arquitectura XLM-RoBERTa configurada para clasificacion de secuencias con una unica etiqueta de salida. La entrada es un par de textos (consulta y pasaje) que se procesan conjuntamente mediante atencion cruzada, y la salida es un logit escalar que representa la relevancia del pasaje respecto a la consulta. La longitud maxima de secuencia es de 512 tokens, lo que limita el tamano del pasaje legal que puede evaluarse en una sola pasada.

El ajuste fino se realizo con la libreria sentence-transformers sobre un conjunto de 9.600 pares, utilizando la funcion de perdida BinaryCrossEntropyLoss, lo que indica un entrenamiento de clasificacion binaria relevante/no relevante. No se dispone de informacion sobre la composicion exacta del dataset, el numero de tokens de entrenamiento, si hubo fases de RLHF o DPO, ni sobre tecnicas adicionales como decodificacion especulativa. La revision del modelo base empleada fue 953dc6f6f85a1b2dbfca4c34a2796e7dde08d41e.

## Capacidades

- Puntuacion de relevancia para pares (consulta, pasaje) en tareas de text-ranking.
- Reranking de resultados de recuperacion semantica en pipelines de busqueda.
- Comprension de texto juridico vietnamita, incluyendo articulos, clausulas y terminologia normativa.
- Capacidad multilingue heredada del modelo base XLM-RoBERTa (no validada especificamente en la model card).
- Integracion con la libreria sentence-transformers mediante la clase CrossEncoder.
- Compatibilidad declarada con text-embeddings-inference y endpoints de Hugging Face.
- No soporta generacion de texto, tool calling, agentes ni razonamiento multi-paso: es exclusivamente un modelo de scoring.

## Casos de uso

- Busqueda juridica en produccion: integrar el modelo como segunda etapa de un pipeline RAG donde un bi-encoder recupera los 50-100 articulos candidatos y este cross-encoder los reordena por relevancia real. Es adecuado porque modela conjuntamente la consulta y el texto legal, capturando matices que la similitud vectorial pasa por alto.
- Asistentes legales conversacionales: dado que el modelo puntua pares consulta-pasaje, puede alimentar la seleccion de contexto en un chatbot juridico que cite articulos concretos. Su entrenamiento sobre 9.600 pares legales vietnamitas lo hace mas preciso que un reranker generico en ese dominio.
- Sistemas de recuperacion de normativa para empresas: reordenar resultados de busquedas sobre codigos mercantiles, laborales o fiscales vietnamitas, priorizando las clausulas que responden a la pregunta del usuario.
- Filtrado de contexto en pipelines RAG: reducir el numero de pasajes enviados al modelo generador, mejorando la precision de las respuestas y reduciendo costes de inferencia al descartar documentos irrelevantes.
- Evaluacion de calidad de corpus juridicos: puntuar pares pregunta-respuesta para detectar inconsistencias o duplicados en bases de conocimiento legales.
- Herramientas de compliance y due diligence: reordenar fragmentos normativos relevantes para una consulta concreta sobre obligaciones societarias, permitiendo a analistas localizar rapidamente la clausula aplicable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision FP16: aproximadamente 1,2 GB para los pesos (568 M de parametros), mas overhead de activaciones y batch; en la practica, entre 2 y 4 GB para lotes moderados.
- VRAM estimada en FP32: aproximadamente 2,3 GB solo para pesos, con overhead adicional.
- GPU recomendadas: NVIDIA A100, H100 o L40S para alto throughput en produccion; RTX 4090 o RTX 3090 para despliegue en una sola GPU consumer.
- Cabe en GPU consumer: si, en tarjetas con 4 GB o mas de VRAM (RTX 3060, RTX 4060, etc.), incluso con cuantizacion adicional si se generara.
- Opciones de despliegue: sentence-transformers (CrossEncoder), Hugging Face Text Embeddings Inference (TEI), vLLM no aplica (no es generativo), llama.cpp/Ollama requeririan conversion a GGUF no publicada.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware, del batch y de la longitud de los pares (maximo 512 tokens).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jasongyn/vietlegal-reranker-v2 | 567,8 M | 512 tokens | Cross-encoder | no disponible | Hugging Face |
| BAAI/bge-reranker-v2-m3 (base) | 567,8 M | 512 tokens | Cross-encoder | no disponible en la informacion | Hugging Face |
| BAAI/bge-reranker-base | no disponible en la informacion | 512 tokens | Cross-encoder | no disponible en la informacion | Hugging Face |

El modelo se diferencia de su base unicamente por el ajuste fino sobre datos legales vietnamitas; no se dispone de datos comparativos de rendimiento entre ambos en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia no esta declarada, lo que impide confirmar si el uso comercial esta permitido; es un riesgo critico para produccion.
- Los idiomas soportados no estan documentados oficialmente; el ajuste fino se realizo sobre vietnamita y el rendimiento en otras lenguas no esta validado.
- La longitud maxima de 512 tokens trunca pasajes legales largos, lo que puede degradar la puntuacion en articulos extensos.
- El dataset de entrenamiento (9.600 pares) es de tamano moderado; puede existir sobreajuste al dominio y estilo de las consultas de entrenamiento.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de mejora frente al modelo base.
- Riesgo de sesgo hacia la terminologia y estructura del corpus legal vietnamita empleado; consultas coloquiales o de otras jurisdicciones pueden puntuarse de forma suboptima.
- Al ser un cross-encoder de scoring, no genera texto ni justifica sus puntuaciones; no debe usarse como fuente de asesoramiento legal directo.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria ni historial de uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jasongyn/vietlegal-reranker-v2
- Modelo base: https://huggingface.co/BAAI/bge-reranker-v2-m3
- Documentacion de Sentence Transformers: https://sbert.net
- Documentacion de Cross Encoder: https://www.sbert.net/docs/cross_encoder/usage/usage.html
- Repositorio de Sentence Transformers: https://github.com/huggingface/sentence-transformers
- Cross Encoders en Hugging Face: https://huggingface.co/models?library=sentence-transformers&other=cross-encoder
- Paper de referencia (Sentence-BERT, arXiv:1908.10084): https://arxiv.org/abs/1908.10084
