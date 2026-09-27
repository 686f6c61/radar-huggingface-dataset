# cagrigungor/shopping-reviews-sentiment

## Resumen

Shopping Reviews Sentiment es un modelo de clasificacion de texto (analisis de sentimiento binario) publicado por el usuario cagrigungor en HuggingFace. Se trata de un fine-tuning de `microsoft/MiniLM-L12-H384-uncased`, un transformer encoder de tipo BERT destilado, sobre el dataset `bittlingmayer/amazonreviews`. El modelo clasifica resenas de productos en dos etiquetas: 0 (NEGATIVE) y 1 (POSITIVE).

Su relevancia practica radica en su tamano reducido (33,4 M de parametros, repo de 0,1 GB) y su alto rendimiento reportado en el conjunto de test: 96,53 % de accuracy y 0,9655 de F1. Esto lo convierte en un candidato adecuado para inferencia a gran escala en CPU o GPU de gama baja, donde el coste por peticion es critico.

El modelo esta entrenado exclusivamente en ingles y su licencia MIT permite uso comercial sin restricciones de atribucion mas alla de conservar el aviso de licencia. No se distribuyen versiones cuantizadas de forma oficial, aunque el formato de pesos es safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT destilado, MiniLM-L12-H384-uncased) |
| Parametros totales | 33.360.770 |
| Longitud de contexto | 256 tokens (longitud maxima de secuencia durante el entrenamiento) |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene pesos safetensors; no se publican versiones cuantizadas) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `microsoft/MiniLM-L12-H384-uncased`, un transformer encoder de 12 capas, dimension oculta de 384 y 12 cabezas de atencion, obtenido mediante destilacion de un modelo BERT mayor. Sobre esa base se anade una cabeza de clasificacion para dos clases y se realiza un fine-tuning de clasificacion de secuencias.

La configuracion de entrenamiento reportada es: 500.000 ejemplos de entrenamiento y 50.000 de evaluacion extraidos del dataset `bittlingmayer/amazonreviews`, 2 epocas, learning rate de 2e-05 y longitud maxima de secuencia de 256 tokens. La model card no indica si se aplicaron tecnicas de RLHF, DPO u otras fases de alineacion, ni detalla la composicion exacta del subconjunto de datos utilizado.

## Capacidades

- Clasificacion binaria de sentimiento (POSITIVE / NEGATIVE) en resenas de productos.
- Analisis de sentimiento de texto corto y medio en ingles, hasta 256 tokens.
- Inferencia por lotes de alto rendimiento (se reportan 7.012 muestras por segundo en el hardware de evaluacion del autor).
- Compatible con la libreria `transformers` mediante el pipeline `text-classification` / `sentiment-analysis`.
- Etiquetado `endpoints_compatible` y `text-embeddings-inference`, lo que facilita su despliegue mediante Inference Endpoints y Text Embeddings Inference.
- No soporta generacion de texto, tool calling, function calling, razonamiento multi-paso, vision, audio ni capacidades de agente.
- No tiene capacidades multilingues: unicamente ingles.

## Casos de uso

- Moderacion y triaje de resenas en marketplaces: clasificar automaticamente resenas entrantes como positivas o negativas para enrutar las negativas a equipos de soporte y priorizar respuestas, gracias a los 256 tokens de contexto y al bajo coste por inferencia.
- Monitorizacion de reputacion de marca: procesar en lote grandes volumenes de resenas de producto para calcular la proporcion de sentimiento negativo por articulo o categoria y detectar picos anomalos.
- Analisis de feedback post-compra en comercio electronico: ingerir resenas enviadas por correo y etiquetar el sentimiento para alimentar dashboards de satisfaccion (CSAT/NPS aproximados).
- Filtrado previo en pipelines de analisis tematico: usar el clasificador como primera etapa para separar resenas negativas antes de aplicar un modelo de extraccion de temas o un LLM mas caro.
- Control de calidad de catalogos: detectar resenas negativas asociadas a productos con alto indice de devoluciones para revisar fichas de producto o proveedores.
- Procesamiento embebido o en el borde: al ocupar aproximadamente 134 MB en FP32 y 67 MB en FP16, puede ejecutarse en dispositivos con CPU sin GPU para clasificar resenas localmente sin enviar datos a la nube.
- Investigacion academica sobre analisis de sentimiento en dominios de resenas: servir como baseline ligero y reproducible sobre el corpus de Amazon Reviews.
- Preetiquetado de datasets: generar etiquetas iniciales de sentimiento a gran escala (mas de 7.000 muestras/s) para revision humana posterior.

## Benchmarks y rendimiento

Resultados de test reportados por el autor en la model card:

| Metrica | Valor |
|---|---|
| Test loss | 0,11027435213327408 |
| Test accuracy | 0,96528 |
| Test precision | 0,964468617253563 |
| Test recall | 0,9665406803262383 |
| Test F1 | 0,9655035370797234 |
| Test macro precision | 0,9652861807802618 |
| Test macro recall | 0,9652731553652105 |
| Test macro F1 | 0,9652785420320913 |
| Test runtime | 7,1302 s |
| Muestras por segundo | 7.012,423 |
| Pasos por segundo | 219,208 |

No se han publicado resultados de benchmarks estandar (MMLU, GLUE, SST-2, etc.) en la informacion disponible, ni comparaciones directas con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 134 MB en FP32 y 67 MB en FP16 para los pesos; el consumo real depende del tamano de lote y de la longitud de secuencia. Con lotes grandes la memoria de activaciones puede dominar.
- GPU recomendadas: cualquier GPU moderna sirve; para maximizar throughput conviene una GPU con buena capacidad de computo en FP16, como NVIDIA T4, L4, A10, A100 o H100. En GPUs de consumo, una RTX 3060 o superior es mas que suficiente.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo con al menos 1 GB de VRAM libre, e incluso en CPU.
- Opciones de despliegue: pipeline de `transformers`, Text Embeddings Inference (tag `text-embeddings-inference`), HuggingFace Inference Endpoints (tag `endpoints_compatible`), ONNX Runtime y servidores de inferencia compatibles con modelos encoder. No se indica soporte oficial de llama.cpp ni Ollama por tratarse de un modelo encoder de clasificacion.
- Latencia y throughput: el autor reporta 7.012,423 muestras por segundo y 219,208 pasos por segundo durante la evaluacion, aunque no especifica el hardware empleado; estas cifras deben tomarse como referencia orientativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks publicados en la informacion disponible |
|---|---|---|---|---|---|
| cagrigungor/shopping-reviews-sentiment | 33,4 M | 256 | MIT | HuggingFace | Accuracy 0,9653 / F1 0,9655 (test propio) |
| distilbert-base-uncased-finetuned-sst-2-english | 66,9 M | 512 | Apache-2.0 | HuggingFace | No disponible en la informacion proporcionada |
| roberta-base (fine-tuning de sentimiento) | 125 M | 512 | MIT | HuggingFace | No disponible en la informacion proporcionada |

La comparacion cuantitativa de rendimiento con estos modelos no puede realizarse con los datos proporcionados, ya que solo se dispone de las metricas del modelo objeto de esta ficha. Los datos de parametros y contexto de las alternativas son valores publicos conocidos de sus respectivas arquitecturas base.

## Limitaciones y advertencias

- Idioma: el modelo solo esta entrenado y evaluado en ingles; su uso con textos en castellano u otros idiomas producira resultados poco fiables.
- Dominio: entrenado sobre resenas de Amazon, por lo que puede degradarse en otros dominios (redes sociales, tickets de soporte, noticias) con vocabulario y estructuras distintas.
- Clasificacion binaria sin clase neutra: obliga a etiquetar como POSITIVE o NEGATIVE incluso resenas mixtas o neutras, lo que puede forzar etiquetas incorrectas.
- Longitud de contexto de 256 tokens: textos mas largos se truncan, con la consiguiente perdida de informacion y posible sesgo en el resultado.
- Riesgo de alucinacion: al ser un clasificador y no un generador, no genera texto, pero si puede producir clasificaciones erroneas o poco calibradas en casos ambiguos, ironia o sarcasmo.
- Sesgos: al derivarse de un modelo preentrenado en corpus web y ajustarse sobre resenas de Amazon, puede heredar sesgos de dominio, de producto o demograficos presentes en los datos.
- Cifras de rendimiento: las metricas de la model card proceden de un unico conjunto de test del mismo dataset que el entrenamiento/evaluacion; no hay validacion cruzada ni evaluacion en dominios externos, por lo que el rendimiento en produccion puede ser inferior.
- Popularidad y mantenimiento: el modelo registra 0 descargas y 0 likes en el momento de la consulta, y las fechas de creacion y actualizacion son muy proximas, lo que sugiere ausencia de validacion externa o mantenimiento continuado.
- Licencia: MIT permite uso comercial, pero conviene verificar las condiciones del dataset `bittlingmayer/amazonreviews` para usos derivados.
- Produccion: no se publican versiones cuantizadas ni artefactos ONNX/TensorRT oficiales, por lo que la optimizacion para despliegue correra a cargo del integrador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cagrigungor/shopping-reviews-sentiment
- Modelo base: https://huggingface.co/microsoft/MiniLM-L12-H384-uncased
- Dataset de entrenamiento: https://huggingface.co/datasets/bittlingmayer/amazonreviews
- Contexto general sobre analisis de resenas con IA: https://wiserreview.com/blog/ai-customer-review-analysis/
- Herramientas de analisis de sentimiento para retail: https://www.retailgators.com/top-sentiment-analysis-tools-retailers-2026/
- Herramientas de analisis de resenas probadas: https://appfollow.io/blog/ai-that-reads-customer-reviews
- Articulo cientifico sobre analisis de sentimiento multilingue en resenas de comercio electronico: https://www.sciencedirect.com/science/article/pii/S2666307425000427
- Guia metodologica de analisis de sentimiento en resenas: https://www.sentisum.com/library/sentiment-analysis-reviews
