# hadeel295/bert-fake-news-classifier

## Resumen

`hadeel295/bert-fake-news-classifier` es un modelo de clasificación de texto publicado en HuggingFace por el usuario hadeel295, pensado para la detección de noticias falsas. Se trata de un ajuste fino sobre una arquitectura BERT (transformer encoder-only) con una cabeza de clasificación, distribuido en formato safetensors y compatible con la librería `transformers` y con Text Embeddings Inference. El repositorio acumula 34 descargas y 0 likes desde su publicación, y la model card es la plantilla automática de HuggingFace sin ninguna sección completada: no hay información sobre datos de entrenamiento, hiperparámetros, evaluación ni autoría real.

El dato más fiable disponible es el recuento de parámetros extraído de los pesos safetensors: 109.483.778. Ese número coincide exactamente con el total de `bert-base-uncased` (109.482.240) más una cabeza de clasificación lineal de 768 × 2 + 2 = 1.538 parámetros, lo que apunta a un BERT-base con tokenizador en minúsculas y dos clases de salida (probablemente falso/verdadero). Es una deducción aritmética, no un dato declarado por el autor.

Su relevancia práctica es limitada pero concreta: es un clasificador pequeño (~110 M de parámetros), desplegable en CPU o en cualquier GPU de consumo, útil como componente de triaje en pipelines de verificación de contenidos. La ausencia de licencia, de idiomas declarados y de cualquier métrica publicada impide recomendarlo para producción sin una validación previa por parte de quien lo integre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only tipo BERT con cabeza de clasificacion (deducido de la etiqueta `bert` y del recuento de parametros; no declarado en la model card) |
| Parametros totales | 109.483.778 (segun ficheros safetensors del repositorio) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; la arquitectura BERT-base estandar admite 512 tokens |
| Tipos de cuantizacion | No disponible. Los pesos publicados estan en safetensors; no se han publicado conversiones a int8, int4, GGUF ni AWQ |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (libreria `transformers`) |
| Tamano del repositorio | 1,3 GB (muy superior a los ~438 MB que ocuparian 109,5 M de parametros en fp32, lo que sugiere ficheros adicionales o copias de pesos) |
| Numero de etiquetas de salida | 2 (deducido del recuento exacto de parametros: 109.482.240 + 768x2 + 2) |
| Pipeline declarado | `text-classification` |
| Libreria | `transformers` |
| Compatibilidad de despliegue | `text-embeddings-inference`, `endpoints_compatible` (segun etiquetas) |
| Fecha de creacion | 2026-08-04 (metadato del repositorio) |
| Fecha de actualizacion | 2026-09-21 (metadato del repositorio) |
| Descargas / likes | 34 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder-only de la familia BERT, con atención bidireccional completa, embeddings posicionales aprendidos y una cabeza de clasificación secuencial sobre el token `[CLS]`. El recuento de parámetros (109.483.778) es exactamente el de `bert-base-uncased` más una capa lineal de 2 salidas, lo que sitúa el modelo en la configuración base: 12 capas, 768 dimensiones ocultas, 12 cabezas de atención, vocabulario de 30.522 tokens y límite posicional de 512 tokens. La etiqueta `arxiv:1910.09700` que aparece en la ficha corresponde al artículo de Lacoste et al. sobre estimación de emisiones de carbono (citado en la plantilla automática de HuggingFace), no a un paper de este modelo.

No hay ninguna información sobre el procedimiento de entrenamiento: se desconoce el dataset, el número de tokens, la composición de las clases, si hubo balanceo, el régimen de precisión (fp32, fp16, bf16), el número de épocas o la tasa de aprendizaje. Tampoco se documenta si se aplicó algún tipo de ajuste por instrucciones, calibración de umbrales o validación cruzada. En la práctica, esto significa que no se puede saber si el ajuste se hizo sobre un corpus periodístico en inglés, sobre un dataset de redes sociales o sobre una colección pequeña y sesgada.

## Capacidades

- Clasificación binaria de texto: el modelo devuelve una etiqueta y su probabilidad para un texto de entrada, presumiblemente en la tarea de distinguir noticia falsa de noticia veraz (deducido del nombre del repositorio y del número de clases).
- Clasificación de documentos completos de hasta 512 tokens, lo que cubre titulares, entradillas y artículos cortos.
- Codificación de frases: la torre BERT subyacente puede usarse para extraer embeddings de 768 dimensiones, aunque no se ha publicado ninguna evaluación de calidad de esos embeddings.
- Ejecución en CPU: por tamaño y arquitectura, es viable en inferencia sin GPU.
- Procesamiento por lotes: al ser un encoder, admite batching eficiente tanto en CPU como en GPU.
- No hay evidencia de soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de razonamiento extendido.
- No se ha declarado ningún idioma soportado; se desconoce si funciona en castellano.
- No se documenta ningún mecanismo especial de decodificación (el modelo no genera texto libre, solo clasifica).

## Casos de uso

- Triaje previo en redacciones y unidades de verificación: el modelo puede clasificar automáticamente titulares y entradillas de un flujo entrante y marcar los candidatos sospechosos para revisión humana, reduciendo el volumen que llega a los verificadores. Adecuado por su bajo coste de inferencia, siempre que se valide antes el dominio y el idioma.
- Moderación de contenidos en foros y secciones de comentarios: dado su tamaño, se puede ejecutar en el mismo servidor de la aplicación y clasificar cada comentario en milisegundos, con un umbral ajustable para derivar los casos dudosos a moderación manual.
- Monitorización de desinformación en redes sociales: integrado en un recolector de publicaciones, permite etiquetar volúmenes altos de texto (cientos o miles de elementos por minuto en GPU) y generar alertas cuando la proporción de contenido clasificado como falso supera un umbral por tema o por cuenta.
- Filtrado de datasets para investigación: sirve como paso de limpieza para separar corpus de noticias verificadas de corpus sospechosos antes de entrenar otros modelos, siempre que se mida previamente su precisión en el corpus concreto.
- Clasificación en agregadores RSS y alertas de prensa: cada entrada nueva de un lector de feeds puede etiquetarse automáticamente para priorizar o descartar fuentes, con un coste de recursos mínimo.
- Enrutado dentro de un pipeline mayor de fact-checking: el modelo actúa como primera etapa que decide si un texto merece pasar a un sistema más caro (búsqueda de evidencia, recuperación documental o un LLM grande), ahorrando cómputo en la mayoría de casos.
- Procesamiento de archivos históricos de prensa: al ser un encoder bidireccional sin generación, permite clasificar grandes colecciones ya digitalizadas en lotes nocturnos sobre CPU.
- Análisis exploratorio en ciencia social computacional: para estudiar la evolución de narrativas desinformativas en un corpus acotado, con la advertencia de que la validez depende enteramente de que el dominio de entrenamiento coincida con el corpus analizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card es la plantilla automática y no incluye ninguna métrica (accuracy, F1, precision, recall, AUC) ni descripción del conjunto de evaluación. Tampoco hay datos de latencia o throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5-1 GB de pesos más overhead de activaciones y del runtime; en la práctica cabe en 1-2 GB de VRAM.
- VRAM estimada en fp16: en torno a 0,25-0,5 GB de pesos.
- Cabe sin problema en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, GTX 1650 e incluso iGPU con suficiente memoria compartida.
- Ejecución en CPU viable: con 110 M de parámetros, la inferencia por documento en CPU de gama media se sitúa habitualmente en el orden de decenas de milisegundos por lote pequeño, aunque no hay mediciones publicadas para este modelo concreto.
- GPUs de datacenter compatibles: T4, L4, A10, A100, H100 (todas sobredimensionadas para este tamaño; se recomienda lotes grandes para aprovechar el paralelismo).
- Opciones de despliegue: `transformers` (PyTorch), Text Embeddings Inference (declarado en las etiquetas), HuggingFace Inference Endpoints (`endpoints_compatible`), y ONNX Runtime u OpenVINO si se exporta manualmente. No se han publicado pesos GGUF ni recetas para llama.cpp u Ollama.
- Latencia y throughput: no disponibles; no hay ninguna medición publicada en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo, por lo que no es posible establecer una comparativa cuantitativa. La información proporcionada no identifica alternativas concretas: los resultados de búsqueda web recibidos no guardan ninguna relación con el modelo (corresponden a contenidos sobre la figura bíblica Mahol y a una canción titulada "Mahol"), de modo que no aportan ningún modelo comparable.

| Modelo | Parametros | Contexto | Licencia | Rendimiento publicado |
|---|---|---|---|---|
| hadeel295/bert-fake-news-classifier | 109.483.778 | No disponible (arquitectura BERT-base: 512 tokens) | No disponible | No disponible |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible |

Como referencia estructural, el modelo parte de una configuración equivalente a BERT-base (12 capas, 768 ocultos), pero cualquier afirmación sobre su calidad relativa frente a otros clasificadores de desinformación sería especulativa sin métricas publicadas.

## Limitaciones y advertencias

- Model card vacía: todas las secciones relevantes (desarrollador, datos, evaluación, sesgos, licencia) aparecen como `[More Information Needed]`. No hay documentación utilizable para auditar el modelo.
- Licencia no disponible: sin licencia declarada no se puede confirmar que el uso comercial sea legal. Se debe contactar con el autor antes de cualquier despliegue en producción.
- Idiomas no declarados: se desconoce por completo si el modelo funciona en castellano. La clasificación de noticias falsas es altamente dependiente del idioma y del dominio, por lo que aplicar el modelo a un corpus en español sin validación previa produciría resultados poco fiables.
- Riesgo alto de sesgo de dominio: sin conocer el dataset de entrenamiento, es probable que el modelo dependa de rasgos superficiales (longitud, formato, vocabulario propio de una fuente concreta) y que no generalice a medios distintos.
- Riesgo de alucinación no aplicable en el sentido generativo (el modelo no produce texto libre), pero sí de falsos positivos y falsos negativos con consecuencias reales: etiquetar una noticia veraz como falsa puede tener implicaciones reputacionales o legales.
- Sin métricas ni umbral calibrado: no se conocen la precisión, el recall ni el punto de corte recomendado de la probabilidad de salida, por lo que cualquier decisión automatizada exigiría calibrar el umbral sobre un conjunto propio.
- Ámbito de aplicación muy estrecho: la ventana de 512 tokens impide procesar artículos largos completos en una sola pasada; sería necesario truncar o segmentar.
- Metadatos anómalos: las fechas de creación (2026-08-04) y actualización (2026-09-21) del repositorio son inconsistentes con el estado actual, y el tamaño del repositorio (1,3 GB) no cuadra con el peso teórico de los parámetros, lo que sugiere ficheros residuales o duplicados que conviene inspeccionar antes de descargar.
- Trazabilidad nula: no se indica el checkpoint base (`bert-base-uncased` u otro), ni el dataset, ni el procedimiento, por lo que no se puede reproducir ni auditar el ajuste.
- Los resultados de búsqueda web asociados a esta consulta son irrelevantes y no contienen información sobre el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hadeel295/bert-fake-news-classifier
- Referencia citada en la plantilla de la model card (no es el paper del modelo): Lacoste et al., "Quantifying the Carbon Emissions of Machine Learning", https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental citada en la plantilla: https://mlco2.github.io/impact
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos relacionados con este modelo. Los resultados devueltos (contenidos sobre "Mahol" en contextos bíblicos y musicales) no guardan relación con el modelo y se descartan.
