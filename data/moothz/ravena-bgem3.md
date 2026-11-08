# moothz/ravena-bgem3

## Resumen

Ravena-bgem3 es un modelo de embeddings de frases (sentence transformer) obtenido por fine-tuning de BAAI/bge-m3, publicado por el usuario moothz en Hugging Face. Su funcion es mapear textos a un espacio vectorial denso de 1024 dimensiones con similitud coseno, para tareas de similitud semantica, busqueda semantica, mineria de parafrasis, clasificacion y clustering. No es un modelo generativo: no produce texto, sino vectores.

El modelo parte de la arquitectura XLM-RoBERTa de bge-m3 (567.754.752 parametros) y conserva su ventana de contexto de 8192 tokens. El fine-tuning se realizo con la libreria sentence-transformers sobre un conjunto de 2505 muestras con columnas anchor/positive/negative y la funcion de perdida MultipleNegativesRankingLoss, lo que lo convierte en un modelo de recuperacion densa entrenado con negativos en batch.

Su relevancia es acotada y muy especifica: los ejemplos de la model card y del widget muestran que el entrenamiento se centro en la clasificacion de intenciones y comandos de un bot de chat en portugues (comandos como ld, lc, lct, le, slots, psn, qr-pix frente a la clase conversa). Es, por tanto, un modelo de nicho para enrutado de comandos en ese bot, no un modelo de embeddings de proposito general. El repositorio no declara licencia, idiomas soportados ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (transformer encoder) con pooling CLS y normalizacion L2; empaquetado como SentenceTransformer |
| Parametros totales | 567.754.752 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; no se documentan variantes GGUF u ONNX) |
| Idiomas soportados | no disponible (los ejemplos de entrenamiento estan en portugues) |
| Licencia | no disponible |
| Formato de pesos | safetensors (tamano del repo: 2,3 GB) |
| Dimension de salida | 1024 |
| Funcion de similitud | coseno |
| Funcion de perdida | MultipleNegativesRankingLoss |
| Tamano del dataset de entrenamiento | 2505 muestras (anchor/positive/negative) |
| Modelo base | BAAI/bge-m3 (revision 5617a9f61b028005a4858fdac845db406aefb181) |

## Arquitectura y entrenamiento

La arquitectura es la del encoder XLM-RoBERTa de bge-m3, con extraccion de `last_hidden_state` y un pipeline SentenceTransformer de tres modulos: el transformer, un pooling de tipo CLS con `include_prompt: True` que produce un vector de 1024 dimensiones y una normalizacion final. No hay decodificador ni cabeza generativa; la salida es exclusivamente el embedding normalizado de la frase.

El entrenamiento consistio en un fine-tuning con sentence-transformers sobre 2505 tripletas anchor/positive/negative y perdida MultipleNegativesRankingLoss, un esquema de aprendizaje contrastivo en el que los negativos del propio batch actuan como negativos en memoria. No se documentan el numero de tokens vistos, la composicion del corpus mas alla de las 2505 muestras, ni si hubo etapas adicionales de RLHF o DPO (no aplicables a un modelo de embeddings). No se declaran hiperparametros, epocas ni estrategia de evaluacion.

## Capacidades

- Generacion de embeddings de frases de 1024 dimensiones normalizados, aptos para similitud coseno.
- Similitud semantica entre pares de textos.
- Busqueda semantica y recuperacion densa sobre corpus indexados.
- Mineria de parafrasis y deduplicacion de textos.
- Clasificacion y clustering de textos a partir de sus representaciones.
- Feature extraction a nivel de frase para pipelines posteriores.
- Clasificacion de intenciones y enrutado de comandos de bot, segun los ejemplos de la model card (clases conversa, ld, lc, lct, le, slots, psn, qr-pix).
- Ventana de hasta 8192 tokens por entrada.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, vision ni audio: es un modelo de embeddings puro.

## Casos de uso

- Enrutado de comandos de un bot de chat: el modelo se usa para comparar el mensaje del usuario con las descripciones de cada comando (por ejemplo, "slots: Gira a maquina de caca-niquels") y elegir la clase mas proxima por similitud coseno; los ejemplos del widget muestran puntuaciones de 0,8995 entre "!psn" y su descripcion frente a valores cercanos a cero con la clase conversa.
- Deteccion de intencion conversacional frente a comando: separar mensajes de charla general de los que pretenden ejecutar una accion del bot, usando la clase "conversa" como ancla negativa.
- Busqueda semantica sobre documentacion de comandos: indexar las descripciones de comandos del bot y recuperar la mas relevante para una consulta en lenguaje natural, aprovechando los 8192 tokens de contexto para descripciones largas.
- Deduplicacion de mensajes o plantillas: agrupar por similitud coseno mensajes equivalentes en un corpus de logs del bot para reducir ruido en el analisis.
- Clustering de consultas de usuarios: agrupar los mensajes recibidos en el espacio de 1024 dimensiones para descubrir patrones de uso y comandos mal formulados.
- Filtrado previo en un pipeline RAG ligero: usar el modelo como recuperador de primera etapa sobre un corpus pequeno de fragmentos, antes de un modelo generativo.
- Clasificacion de tickets o mensajes por tematica: entrenar un clasificador lineal sobre los embeddings para categorizar entradas en un servicio de soporte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,3 GB solo para pesos (567,7 M de parametros), mas activaciones; en la practica, entre 3 y 4 GB con batches pequenos y contexto moderado.
- En fp16 la huella de pesos baja a unos 1,1 GB; en int8 a unos 0,6 GB, aunque no se distribuyen pesos cuantizados oficialmente.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp32 con batches pequenos; A100, H100 o L4 para indexacion masiva con batches grandes.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares con 8 GB o mas; tambien puede ejecutarse en CPU para volumenes bajos.
- Opciones de despliegue: sentence-transformers (referencia), Text Embeddings Inference (el repo incluye el tag `text-embeddings-inference`), y exportacion a ONNX si se necesita. No se documentan pesos GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles; dependen del hardware, del batch y de la longitud de las secuencias (hasta 8192 tokens).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | Licencia | Notas |
|---|---|---|---|---|---|
| moothz/ravena-bgem3 | 567,7 M | 8192 | 1024 | no disponible | Fine-tuning de nicho sobre 2505 tripletas para comandos de bot en portugues |
| BAAI/bge-m3 | 567,7 M | 8192 | 1024 | MIT | Modelo base, multilingue y de proposito general; soporta dense, sparse y multi-vector |
| intfloat/multilingual-e5-large | 560 M | 512 | 1024 | MIT | Embeddings multilingues de proposito general con contexto mas corto |
| sentence-transformers/paraphrase-multilingual-mpnet-base-v2 | 278 M | 128 | 768 | Apache 2.0 | Mas ligero y con contexto muy reducido; orientado a parafrasis |

La comparativa se limita a datos publicos de los modelos alternativos; no hay resultados de evaluacion de ravena-bgem3 que permitan contrastar calidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. El entrenamiento esta dominado por ejemplos de comandos de un bot concreto en portugues, por lo que el modelo puede estar sesgado hacia ese vocabulario y esas clases.
- Riesgo de alucinacion: no aplica en sentido generativo, pero si puede producir similitudes altas entre textos no relacionados si caen en el dominio de entrenamiento; las puntuaciones deben calibrarse con umbrales propios.
- Limitaciones de contexto e idioma: aunque hereda la ventana de 8192 tokens de bge-m3, el fine-tuning se hizo con frases cortas, por lo que el rendimiento en entradas largas no esta validado. No se declaran idiomas soportados; el uso fuera del portugues no esta verificado.
- Restricciones de licencia: la licencia no esta disponible en el repositorio, lo que impide asumir uso comercial sin consultar al autor. El modelo base bge-m3 es MIT, pero el fine-tuning no hereda automaticamente esa licencia.
- Caveat de produccion: con 0 descargas y 0 likes, el modelo no tiene validacion externa; conviene evaluarlo en el dominio objetivo antes de desplegarlo.
- El dataset de entrenamiento es muy pequeno (2505 muestras) y no se documenta su composicion completa ni el reparto de validacion.
- No es un modelo generativo: no puede responder preguntas ni ejecutar comandos por si mismo, solo producir embeddings.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moothz/ravena-bgem3
- Modelo base BAAI/bge-m3: https://huggingface.co/BAAI/bge-m3
- Repositorio del bot: https://github.com/moothz/ravena-ai
- README del bot: https://github.com/moothz/ravena-ai/blob/main/README.md
- Documentacion de Sentence Transformers: https://sbert.net
- Repositorio de Sentence Transformers: https://github.com/huggingface/sentence-transformers
- Paper de Sentence-BERT: https://arxiv.org/abs/1908.10084
- Paper de SimCSE: https://arxiv.org/abs/2104.08821
