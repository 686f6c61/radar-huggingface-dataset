# Diegopr3312/mbert-sentiment-amazon-multilingual

## Resumen

mbert-sentiment-amazon-multilingual es un modelo de clasificacion de texto publicado en HuggingFace por el usuario Diegopr3312. Consiste en un fine-tuning de `bert-base-multilingual-cased` orientado al analisis de sentimientos sobre resenas de Amazon en tres idiomas: espanol, ingles y frances. El problema que resuelve es la clasificacion automatica de opinion en resenas de producto en un contexto multilingue, con una unica etiqueta de salida entre tres clases: negativo, neutro y positivo.

El modelo tiene 177.855.747 parametros (dato extraido de los pesos en safetensors) y un repositorio de 1,4 GB. Se distribuye bajo licencia Apache 2.0, con pesos en formato safetensors y pipeline declarado de `text-classification`. El entrenamiento se realizo sobre el dataset `mteb/amazon_reviews_multi` usando un 10% del mismo y aplicando balanceo de clases.

Su relevancia es limitada en terminos de adopcion: en el momento de la consulta acumula 0 descargas y 0 likes, y no publica resultados de benchmarks ni detalles sobre el proceso de evaluacion. Resulta util, por tanto, como punto de partida reproducible para tareas de clasificacion de sentimiento en espanol, ingles y frances con recursos de hardware muy modestos, pero no como un modelo validado para produccion sin una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional de la familia BERT (`bert-base-multilingual-cased` fine-tuneado) |
| Parametros totales | 177.855.747 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; el entrenamiento se realizo con una longitud maxima de 128 tokens |
| Tipos de cuantizacion | No disponible (no se publican variantes cuantizadas en el repositorio) |
| Idiomas soportados | Espanol (es), ingles (en), frances (fr) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

Se trata de un encoder transformer bidireccional de la familia BERT, partiendo del checkpoint multilingue `bert-base-multilingual-cased`. La cabeza de clasificacion produce tres etiquetas discretas: `negativo` (0), correspondiente a resenas de 1-2 estrellas; `neutro` (1), correspondiente a 3 estrellas; y `positivo` (2), correspondiente a 4-5 estrellas. No se documentan modificaciones estructurales sobre la arquitectura base ni tecnicas adicionales como decodificacion especulativa o atencion lineal, algo coherente con un modelo encoder puro de clasificacion.

El entrenamiento se realizo sobre el dataset `mteb/amazon_reviews_multi` restringido a los idiomas espanol, ingles y frances, empleando un 10% de los datos y aplicando balanceo de clases. La configuracion declarada es de 2 epocas, batch size de 16, learning rate de 2e-5, longitud maxima de 128 tokens y optimizador AdamW con weight_decay de 0.01. No se especifica el numero total de tokens de entrenamiento, la composicion exacta del subconjunto utilizado, la existencia de un split de validacion ni si se aplicaron tecnicas de alineacion como RLHF o DPO, algo que en un modelo de clasificacion seria en cualquier caso poco habitual.

## Capacidades

- Clasificacion de sentimiento en tres clases (negativo, neutro, positivo) para resenas de producto.
- Procesamiento multilingue en espanol, ingles y frances con un unico modelo.
- Inferencia sobre textos cortos, con una longitud de entrenamiento de hasta 128 tokens.
- Integracion directa con la libreria `transformers` mediante el pipeline `text-classification`.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).
- No se documenta generacion de texto libre: es exclusivamente un modelo discriminativo de clasificacion.

## Casos de uso

- Analisis de resenas de producto en comercio electronico: el modelo puede etiquetar resenas de Amazon o de una plataforma propia en espanol, ingles y frances, generando un indicador agregado de satisfaccion por producto o categoria a partir de las tres clases disponibles.
- Moderacion y priorizacion de comentarios: en un panel de atencion al cliente, permite filtrar automaticamente las resenas negativas para que el equipo de soporte las revise antes, dado que la clase `negativo` se corresponde con valoraciones de 1-2 estrellas.
- Monitorizacion de reputacion de marca: procesando de forma periodica el flujo de resenas en los tres idiomas soportados para detectar caidas de sentimiento y correlacionarlas con lanzamientos, cambios de precio o incidencias logisticas.
- Enrutado de tickets de soporte: la salida de clasificacion puede usarse como senal previa para derivar incidencias con tono negativo a un flujo de escalado, y las neutras a respuestas automatizadas de seguimiento.
- Enriquecimiento de datasets para fine-tuning: el modelo puede etiquetar grandes volumenes de texto no anotado, generando pseudo-etiquetas que despues se revisen y se usen para entrenar clasificadores especificos de dominio.
- Analisis comparativo de mercados: al compartir un unico espacio de representacion multilingue, permite comparar la distribucion de sentimiento entre mercados hispanohablante, anglofono y francophone sin necesidad de desplegar tres modelos independientes.
- Experimentacion academica y prototipado rapido: con 177,9 millones de parametros, es viable ejecutar experimentos de clasificacion de sentimiento en una unica GPU de gama media o incluso en CPU para lotes pequenos, lo que lo hace util como linea base en trabajos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara las metricas `accuracy` y `f1` en el bloque de metadatos, pero no incluye ningun valor numerico asociado a ellas, ni curvas de evaluacion, ni comparaciones con otros modelos.

| Metrica | Valor |
|---|---|
| Accuracy | No disponible |
| F1 | No disponible |
| MMLU | No disponible |
| HumanEval | No disponible |
| GSM8K | No disponible |

## Requisitos de hardware

- Parametros totales: 177,9 millones. El repositorio ocupa 1,4 GB, consistente con pesos en fp32 mas ficheros auxiliares.
- VRAM estimada en fp32: en torno a 0,7 GB solo para pesos, mas overhead de activaciones y runtime (estimacion derivada del numero de parametros, no publicada por el autor).
- VRAM estimada en fp16: en torno a 0,36 GB solo para pesos (estimacion derivada).
- VRAM estimada en int8: en torno a 0,18 GB solo para pesos (estimacion derivada).
- Cabe sin dificultad en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs con 4 GB o menos. Tambien es viable la inferencia en CPU con latencias aceptables para lotes pequenos.
- Para entrenamiento o fine-tuning completo, una unica GPU de gama media (por ejemplo, RTX 3090 o A100) es suficiente; no requiere paralelismo de modelo.
- Opciones de despliegue: `transformers` (pipeline `text-classification`) es la via documentada en la model card. Al ser un encoder BERT estandar, deberia ser compatible con servidores de inferencia habituales para modelos tipo encoder (por ejemplo, Text Embeddings Inference o TorchServe), aunque el autor no declara ninguna integracion concreta. No se publican pesos en GGUF, por lo que el uso con llama.cpp u Ollama no esta soportado de fabrica.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks que permitan una comparativa de rendimiento fiable con alternativas de la misma categoria. La siguiente tabla recoge unicamente los datos verificables de este modelo frente al checkpoint base del que parte, marcando como no disponible todo aquello que no figura en la informacion proporcionada.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Tarea | Benchmarks |
|---|---|---|---|---|---|---|
| Diegopr3312/mbert-sentiment-amazon-multilingual | 177.855.747 | No disponible (entrenamiento a 128 tokens) | es, en, fr | Apache 2.0 | Clasificacion de sentimiento (3 clases) | No publicados |
| bert-base-multilingual-cased (modelo base) | No disponible en la informacion proporcionada | No disponible | Multilingue (no detallado) | No disponible en la informacion proporcionada | Modelo de lenguaje enmascarado | No disponible |
| Otras alternativas de clasificacion de sentimiento multilingue | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No se han publicado resultados de evaluacion: no hay evidencia publica de accuracy ni de F1, por lo que el rendimiento real del modelo es desconocido.
- Sesgos conocidos: no se documenta ningun analisis de sesgo. El modelo se entrena con resenas de Amazon, que sobrerrepresentan determinados dominios de producto, registros de escritura y perfiles demograficos de compradores.
- Riesgo de alucinacion: en sentido estricto no aplica, ya que es un clasificador discriminativo y no genera texto libre. El riesgo equivalente es la clasificacion erronea de textos fuera de dominio, con especial incidencia en resenas muy cortas, sarcasticas o con sentimiento mixto.
- La clase `neutro` se define unicamente por la puntuacion de 3 estrellas, lo que la convierte en una categoria ambigua: muchas resenas de 3 estrellas contienen opiniones marcadamente positivas o negativas en su texto.
- Limitacion de longitud: el entrenamiento se realizo con un maximo de 128 tokens. Los textos mas largos quedaran truncados y su sentimiento puede no reflejarse correctamente.
- Cobertura idiomatica limitada: solo espanol, ingles y frances. El resto de idiomas no estan soportados y probablemente produzcan predicciones sin valor.
- Dominio restringido: el modelo esta ajustado sobre resenas de Amazon; su comportamiento en otros generos textuales (noticias, redes sociales, documentacion tecnica) no esta validado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indique si se han realizado cambios. No se especifican restricciones adicionales.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin mantenimiento documentado ni issues de referencia. No hay garantia de soporte.
- Para uso en produccion se recomienda construir un conjunto de validacion propio en el dominio objetivo y verificar el rendimiento antes de desplegarlo.
- Se desconoce si existe una version cuantizada o un formato optimizado para despliegue de baja latencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Diegopr3312/mbert-sentiment-amazon-multilingual
- Dataset de entrenamiento: https://huggingface.co/datasets/mteb/amazon_reviews_multi
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, repositorios de codigo o demos.
