# AxcLogo/chinese-job-posting-classifier

## Resumen

Chinese Job Posting Classifier es un modelo de clasificación binaria de texto en chino desarrollado por AxcLogo. Su tarea es determinar si un fragmento de texto contiene información concreta de reclutamiento u oferta de empleo (etiqueta `y`) o no (etiqueta `n`). El modelo parte de `hfl/chinese-roberta-wwm-ext`, un transformer BERT de 12 capas preentrenado en chino, y se ha exportado como ONNX con cuantización dinámica INT8 para inferencia en CPU.

El problema que resuelve es específico y relevante: en plataformas sociales, foros y sistemas de moderación de contenido, la mayoría del texto que *habla* de empleo no es una oferta de empleo real. Comentarios de búsqueda de trabajo, quejas sobre empresas, denuncias de estafas o discusiones sobre procesos de selección comparten vocabulario con las ofertas auténticas. Este clasificador distingue entre publicar una vacante y discutir sobre reclutamiento, lo que lo hace útil para filtrado de contenido, detección de spam laboral y extracción de ofertas en pipelines de datos.

La relevancia actual del modelo reside en su enfoque de despliegue: al ser un ONNX INT8 de 99,8 MiB que solo requiere `onnxruntime`, `tokenizers` y `numpy`, puede ejecutarse en CPU sin PyTorch ni Transformers, con un rendimiento medido de aproximadamente 40,7 segmentos por segundo en un Apple M4 con dos hilos. Está pensado para procesar grandes volúmenes de texto, incluido texto proveniente de OCR de capturas de pantalla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT (RoBERTa-wwm-ext chino), 12 capas |
| Parametros totales | no disponible (modelo base `hfl/chinese-roberta-wwm-ext`, tamano ONNX 99,8 MiB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (entrada truncada a cabeza + cola) |
| Tipos de cuantizacion | INT8 dinamica por canal (MatMul) y embeddings de palabra INT8 por columna |
| Idiomas soportados | Chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (INT8 cuantizado) |
| Runtime | ONNX Runtime, `CPUExecutionProvider` |
| Tamano del repositorio | 0,1 GB |
| Etiquetas | `y` (contiene oferta de empleo), `n` (no la contiene) |
| Umbral por defecto | 0,30 (orientado a recall) |
| Entrada maxima por llamada | 200.000 puntos de codigo Unicode (truncado a 256 tokens) |

## Arquitectura y entrenamiento

El modelo se basa en `hfl/chinese-roberta-wwm-ext` (revision `5c58d0b`), un BERT de 12 capas con tokenizacion Whole Word Masking adaptada al chino. Sobre ese backbone se ha realizado un ajuste fino para clasificacion binaria de texto, y posteriormente se ha exportado a ONNX con cuantizacion dinamica INT8: MatMul cuantizado por canal y embeddings de palabra cuantizados por columna. El resultado es un artefacto de 99,8 MiB que no requiere PyTorch ni la libreria Transformers en produccion.

No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO (no aplicables habitualmente a un clasificador de este tipo). La model card indica que la evaluacion se realizo sobre un conjunto de test ciego congelado, proveniente del dominio objetivo (posts de redes sociales chinas, quejas, comentarios y OCR de imagenes), dividido por post para que todos los segmentos de un mismo post permanezcan en el mismo split. El test ciego se reservo con una semilla independiente y no se uso para entrenamiento, seleccion de modelo ni seleccion de umbral; se ejecuto una sola vez.

Una innovacion destacable es el tratamiento a nivel de documento: un post se compone de titulo, cuerpo, comentarios y segmentos OCR, y basta con que un segmento se clasifique como `y` para que el post completo se etiquete como `y`. El modelo colapsa espacios en blanco y conserva cabeza y cola del texto hasta 256 tokens, lo que permite procesar entradas muy largas (hasta 200.000 puntos de codigo) manteniendo la parte inicial y final, donde suele concentrarse la informacion relevante.

## Capacidades

- Clasificacion binaria de texto chino: determina si un texto contiene informacion concreta de contratacion (`y`) o no (`n`).
- Distincion semantica fina entre publicar una oferta y discutir sobre reclutamiento: detecta busquedas de empleo, quejas, denuncias de estafas, advertencias sobre empresas y comentarios sobre procesos de seleccion como `n`.
- Procesamiento de texto OCR: entrenado y evaluado con texto proveniente de capturas de pantalla de aplicaciones de reclutamiento.
- Manejo de posts cortos: clasifica correctamente textos muy breves como `无锡市惠山区招拆架` (contratacion de trabajadores de andamio en Huishan, Wuxi).
- Clasificacion a nivel de documento: agrega multiples segmentos (titulo, cuerpo, comentarios, OCR) y etiqueta el post completo si algun segmento es `y`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades de vision ni audio; el texto OCR debe proporcionarse ya extraido.
- No es un modelo generativo: no produce texto, solo una etiqueta y una puntuacion de probabilidad.
- Multilingue: no disponible; solo chino.

## Casos de uso

- Moderacion de contenido en plataformas sociales: filtrar publicaciones que contienen ofertas de empleo concretas frente a aquellas que solo discuten sobre reclutamiento, usando el umbral ajustable (0,30 por defecto) para equilibrar precision y recall segun la politica de la plataforma.
- Deteccion de spam laboral: identificar publicaciones de contratacion no deseadas o sospechosas (por ejemplo, reclutamiento de jornada parcial o jornaleros) en foros y redes, incluso cuando el texto es muy corto.
- Extraccion de ofertas de empleo en pipelines de datos: procesar grandes volumenes de posts y comentarios para aislar las ofertas reales antes de pasarlas a un extractor de entidades (puesto, salario, ubicacion, contacto).
- Procesamiento de capturas de pantalla de aplicaciones de reclutamiento: clasificar texto obtenido por OCR de imagenes de ofertas de empleo, con un recall medido de 0,861 en el segmento de OCR del test ciego.
- Filtrado de comentarios en foros laborales: distinguir comentarios que contienen una oferta concreta (por ejemplo, dentro de una queja) de comentarios que solo opinan o denuncian, gracias a la clasificacion por segmentos.
- Analisis del mercado laboral: cuantificar la proporcion de contenido de contratacion real frente a discusiones sobre empleo en un corpus de redes sociales, con un throughput de aproximadamente 40 segmentos por segundo en CPU.
- Sistemas de alerta temprana de fraude laboral: marcar publicaciones que contienen ofertas concretas para revision manual, combinando el modelo con reglas de negocio sobre salarios o metodos de contacto.

## Benchmarks y rendimiento

Evaluacion en test ciego congelado del dominio objetivo (posts de redes sociales, quejas, comentarios y OCR), dividido por post:

| Nivel | Accuracy | Macro-F1 | Precision `y` | Recall `y` | F1 `y` |
| --- | ---: | ---: | ---: | ---: | ---: |
| Segmento (1.912 segmentos, 143 `y`) | 0,9859 | 0,9460 | 0,9603 | 0,8462 | 0,8996 |
| Post (974 posts, cualquier segmento `y`) | 0,9846 | 0,9647 | 0,9913 | 0,8906 | 0,9383 |

Recall de `y` a nivel de segmento por fuente: OCR de imagen 0,861 (129 positivos), cuerpo 0,625 (8), comentario 0,667 (3), titulo 1,0 (3).

Comparativa de backbones en el mismo conjunto de desarrollo de 5.987 segmentos (286 `y`), con umbral seleccionado en ese conjunto:

| Backbone | Tamano ONNX | Macro-F1 segmento | Macro-F1 post |
| --- | ---: | ---: | ---: |
| `hfl/rbt3` (3 capas) | 44,9 MiB | 0,8966 | 0,9290 |
| `hfl/rbt6` (6 capas) | 65,4 MiB | 0,9122 | 0,9449 |
| `hfl/chinese-roberta-wwm-ext` (12 capas, publicado) | 99,8 MiB | 0,9244 | 0,9477 |

Rendimiento en CPU: 40,7 segmentos/s, aproximadamente 24,6 ms por segmento de media, en Apple M4 con dos hilos de ONNX Runtime procesando los 1.912 segmentos del test ciego uno a uno. El throughput depende de la longitud del texto; los titulos cortos son mucho mas rapidos que los textos largos.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo esta disenado para CPU y no requiere GPU.
- GPU recomendadas: no necesarias; el runtime declarado es `CPUExecutionProvider` de ONNX Runtime.
- Cabe en cualquier CPU consumer: el artefacto ONNX ocupa 99,8 MiB y el repositorio completo 0,1 GB.
- Opciones de despliegue: ONNX Runtime con `CPUExecutionProvider`; el modelo incluye un script `inference.py` con la clase `JobPostingClassifier`. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: aproximadamente 24,6 ms por segmento y 40,7 segmentos/s en Apple M4 con dos hilos; el rendimiento varia con la longitud del texto.
- Dependencias: `onnxruntime`, `tokenizers` y `numpy`; Python 3.10 o superior recomendado.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con los backbones alternativos evaluados por el propio autor en el mismo conjunto de desarrollo:

| Modelo | Capas | Tamano ONNX | Macro-F1 segmento | Macro-F1 post | Licencia |
| --- | ---: | ---: | ---: | ---: | --- |
| Chinese Job Posting Classifier (`chinese-roberta-wwm-ext`) | 12 | 99,8 MiB | 0,9244 | 0,9477 | Apache 2.0 |
| `hfl/rbt6` | 6 | 65,4 MiB | 0,9122 | 0,9449 | no disponible en la informacion proporcionada |
| `hfl/rbt3` | 3 | 44,9 MiB | 0,8966 | 0,9290 | no disponible en la informacion proporcionada |

No se dispone de comparaciones con otros clasificadores de ofertas de empleo en chino ni con modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta chino; no se ha evaluado su comportamiento en otros idiomas.
- La longitud de entrada efectiva es de 256 tokens: el texto mas alla de ese limite se descarta, conservando solo cabeza y cola, lo que puede perder informacion relevante en textos largos.
- El recall de `y` a nivel de segmento es de 0,8462, con un recall especialmente bajo en cuerpos de texto (0,625) y comentarios (0,667), aunque con muy pocos positivos en esas categorias en el test.
- El umbral por defecto de 0,30 esta orientado a recall; en produccion puede ser necesario ajustarlo para reducir falsos positivos segun el caso de uso.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de falsos positivos y falsos negativos en la clasificacion.
- No se detallan en la informacion disponible los sesgos conocidos del modelo ni la composicion del dataset de entrenamiento, lo que dificulta evaluar su comportamiento en dominios alejados del objetivo (redes sociales, quejas, OCR).
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base `hfl/chinese-roberta-wwm-ext`.
- El modelo no es generativo y no puede extraer ni estructurar la informacion de la oferta; solo indica si esta presente.
- El rendimiento medido en CPU corresponde a un Apple M4 con dos hilos; en hardware distinto la latencia y el throughput pueden variar significativamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AxcLogo/chinese-job-posting-classifier
- Modelo base: https://huggingface.co/hfl/chinese-roberta-wwm-ext
- README completo en chino: README_zh-CN.md (referenciado en la model card, dentro del repositorio)
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios adicionales ni demos.
