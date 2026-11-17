# HFNH30/my-sentiment-classifier

## Resumen

`HFNH30/my-sentiment-classifier` es un clasificador binario de sentimiento para texto en ingles, publicado en Hugging Face por el usuario HFNH30 (identificado en la model card como el equipo de la plataforma Kora AI). Segun la propia model card, el modelo es una re-publicacion del conocido `distilbert-base-uncased-finetuned-sst-2-english`, es decir, un DistilBERT afinado sobre el corpus SST-2 para predecir dos etiquetas: POSITIVE y NEGATIVE.

El modelo cuenta con 66.955.010 parametros en formato safetensors y un repositorio de 0,3 GB. DistilBERT es una version destilada de BERT-base que reduce el numero de capas de 12 a 6 manteniendo una arquitectura transformer encoder, lo que lo hace especialmente adecuado para tareas de clasificacion de texto con requisitos de latencia bajos y despliegue en CPU o GPU de gama baja.

La relevancia de esta ficha es limitada en terminos de innovacion: se trata de una re-publicacion de un modelo ampliamente conocido, sin datos adicionales de entrenamiento, benchmarks propios ni informacion de licencia declarada en el repositorio. Resulta util como referencia para quien necesite un clasificador de sentimiento ligero en ingles, pero conviene contrastar su procedencia y licencia antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilacion de BERT-base) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT base admite hasta 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | ingles (segun la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un DistilBERT, un transformer encoder de 6 capas obtenido mediante destilacion de conocimiento a partir de BERT-base. La model card indica que el modelo fuente es `distilbert-base-uncased-finetuned-sst-2-english`, que a su vez fue afinado sobre el corpus SST-2 (Stanford Sentiment Treebank) para clasificacion binaria de sentimiento. No se aportan en la informacion disponible detalles sobre el proceso de destilacion, el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO (no aplicables en un clasificador de este tipo).

Tampoco se documenta ninguna innovacion tecnica adicional en esta re-publicacion: no se mencionan cambios en la cabeza de clasificacion, tecnicas de decodificacion especulativa (irrelevantes para un encoder de clasificacion) ni optimizaciones de atencion. La unica informacion tecnica verificable es el numero de parametros y el formato de pesos.

## Capacidades

- Clasificacion binaria de sentimiento en texto en ingles, con etiquetas POSITIVE y NEGATIVE.
- Inferencia sobre frases o fragmentos cortos de texto (el ejemplo de la model card usa una sola frase).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingue no disponible: la model card solo menciona ingles.
- No se documentan capacidades de vision, audio ni modo thinking.
- No es un modelo generativo: no produce texto libre, solo una etiqueta de clasificacion.

## Casos de uso

- Analisis de resenas de productos: clasificar resenas de comercio electronico en ingles como positivas o negativas para agregar puntuaciones de satisfaccion por producto; el modelo es ligero y permite procesar lotes grandes en CPU.
- Monitorizacion de redes sociales: etiquetar menciones o tweets en ingles para detectar quejas o comentarios positivos sobre una marca, con un coste computacional bajo por inferencia.
- Enrutamiento de tickets de soporte: pre-clasificar el tono de los mensajes entrantes en ingles para priorizar casos negativos hacia atencion humana.
- Analisis de encuestas NPS: procesar respuestas abiertas cortas en ingles y agregar la polaridad para complementar la puntuacion numerica.
- Filtrado de contenido en pipelines de datos: descartar o marcar textos con sentimiento negativo en procesos de curación de datasets en ingles.
- Prototipado rapido de clasificadores: servir como linea base en experimentos de NLP antes de entrenar un modelo especifico de dominio, dado su tamano reducido (0,3 GB) y su facilidad de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision, recall, F1 ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (66,9 M de parametros, aproximadamente 268 MB de pesos), y alrededor de 70 MB en cuantizacion int8.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en una GTX 1650, RTX 3060, RTX 4090, A100 o H100, aunque estas ultimas estan sobredimensionadas para la carga.
- Cabe en GPU consumer y en CPU: es viable ejecutarlo en CPU para cargas de baja latencia o por lotes.
- Opciones de despliegue: al ser un modelo de la familia transformers con pesos safetensors, es compatible con Hugging Face Transformers, Text Embeddings Inference (para clasificacion) y ONNX Runtime tras conversion; no se documentan pesos GGUF para llama.cpp ni Ollama.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HFNH30/my-sentiment-classifier | 66,9 M | no disponible | Clasificacion de sentimiento (2 clases) | no disponible | Hugging Face |
| distilbert-base-uncased-finetuned-sst-2-english | ~67 M | 512 tokens | Clasificacion de sentimiento (2 clases) | Apache 2.0 (modelo fuente) | Hugging Face |
| bert-base-uncased-finetuned-sst-2-english | ~110 M | 512 tokens | Clasificacion de sentimiento (2 clases) | Apache 2.0 (modelo fuente) | Hugging Face |
| roberta-base finetuned en SST-2 | ~125 M | 512 tokens | Clasificacion de sentimiento (2 clases) | MIT (modelo fuente) | Hugging Face |

La comparativa se basa en la familia de modelos fuente citada en la model card; los datos de licencia y contexto de los alternativos corresponden a sus repositorios originales y no se han verificado en esta busqueda.

## Limitaciones y advertencias

- La model card no declara licencia: no se puede confirmar si el uso comercial esta permitido. Conviene verificar la licencia del modelo fuente (Apache 2.0 en el caso de DistilBERT) antes de desplegarlo en produccion.
- Solo soporta ingles segun la model card; el rendimiento en otros idiomas no esta documentado y probablemente sea deficiente.
- Es un clasificador binario: no distingue intensidad del sentimiento ni emociones mas alla de positivo/negativo.
- Riesgo de alucinacion no aplicable en sentido estricto (no genera texto), pero si de clasificaciones erroneas en textos ironicos, sarcasticos o de dominio especializado.
- No se documentan sesgos conocidos ni evaluaciones de robustez; al derivar de SST-2, puede heredar los sesgos de ese corpus (predominio de resenas de cine).
- Longitud de contexto no confirmada en la model card; textos largos podrian truncarse.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validacion independiente.
- La fecha de creacion indicada (2026-11-17) es posterior a la fecha actual, lo que sugiere un posible error en los metadatos del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HFNH30/my-sentiment-classifier
- Modelo fuente citado: https://huggingface.co/distilbert-base-uncased-finetuned-sst-2-english
- Paper de DistilBERT: https://arxiv.org/abs/1910.01108
- Dataset SST-2: https://nlp.stanford.edu/sentiment/
