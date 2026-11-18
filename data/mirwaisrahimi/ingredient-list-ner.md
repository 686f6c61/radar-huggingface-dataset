# mirwaisrahimi/ingredient-list-ner

## Resumen

El modelo `mirwaisrahimi/ingredient-list-ner` es un clasificador de tokens (token classification) basado en `distilbert-base-multilingual-cased` cuyo único objetivo es localizar la lista de ingredientes dentro del texto OCR en bruto de un envase alimentario. No es un modelo generativo ni un asistente: recibe una secuencia de palabras y asigna a cada una una etiqueta (`O`, `B-ING` o `I-ING`) que delimita el fragmento correspondiente a la lista de ingredientes. Fue desarrollado por el usuario `mirwaisrahimi` en el marco de un proyecto de formación profesional sobre detección de alérgenos alimentarios mediante NLP y OCR.

Con 134,7 millones de parámetros y un tamaño de repositorio de 0,5 GB, es un modelo pequeño y ligero, pensado para ejecutarse incluso en CPU. Su relevancia práctica reside en que resuelve un paso previo y crítico en cualquier pipeline de análisis de etiquetas alimentarias: separar la lista de ingredientes del resto de texto que aparece en el envase (marca, información nutricional, declaraciones de alérgenos, instrucciones de uso, etc.). Sin esa delimitación previa, los sistemas posteriores de extracción de alérgenos trabajan sobre ruido.

La ventana de contexto efectiva está limitada por el propio modelo base (DistilBERT, 512 tokens) y por la recomendación del autor de clasificar fragmentos de hasta 100 palabras. El modelo es multilingüe, aunque el autor no detalla qué idiomas concretos cubre el conjunto de datos de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT) |
| Parámetros totales | 134.736.387 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (heredada del modelo base); el autor recomienda fragmentos de 100 palabras |
| Tipos de cuantización | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | multilingüe (idiomas concretos no detallados) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `distilbert-base-multilingual-cased`, un encoder transformer de 6 capas obtenido por destilación de `bert-base-multilingual-cased`. Sobre la cabeza de clasificación de tokens se aplica un esquema BIO de tres etiquetas: `O` (fuera de la lista), `B-ING` (primera palabra de la lista) e `I-ING` (interior de la lista). La tokenización es a nivel de palabra, no de subpalabra: el autor indica explícitamente que el texto debe dividirse en palabras antes de la inferencia, tratando los signos de puntuación como palabras independientes.

El entrenamiento se realizó sobre el dataset de detección de ingredientes de Open Food Facts, con 5.065 documentos de entrenamiento (textos OCR etiquetados de envases en varios idiomas). La configuración fue de 2 épocas, learning rate 5e-5, batch size 16 y fragmentación de textos en bloques de 100 palabras, con un tiempo total de entrenamiento de 77,1 minutos en CPU. No se menciona uso de RLHF, DPO ni ninguna innovación técnica adicional más allá del fine-tuning supervisado estándar.

## Capacidades

- Etiquetado de tokens a nivel de palabra para delimitar la lista de ingredientes en texto OCR de envases alimentarios.
- Clasificación multilingüe (el modelo base es multilingüe; el alcance idiomático real del fine-tuning no está detallado).
- Procesamiento de fragmentos de hasta 100 palabras por llamada.
- Integración en pipelines de OCR + NLP como paso de segmentación previo a la extracción de ingredientes y alérgenos.
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso ni capacidades de agente.
- No dispone de modo thinking, visión, audio ni ninguna capacidad multimodal.

## Casos de uso

- Detección de alérgenos en etiquetas alimentarias: el modelo aísla la lista de ingredientes del texto OCR completo; un módulo posterior puede buscar términos alérgenos solo dentro de ese fragmento, reduciendo falsos positivos procedentes de la información nutricional o de declaraciones como "puede contener trazas".
- Digitalización de catálogos de productos: en un pipeline de ingesta masiva de fotos de envases, el modelo segmenta la lista de ingredientes antes de estructurarla en una base de datos, lo que simplifica el parseo posterior.
- Aplicaciones móviles de lectura de etiquetas: al ser un modelo de 134,7 M de parámetros y haberse entrenado en CPU, puede ejecutarse en entornos con recursos limitados o en el servidor de una app ligera que procese la foto del envase.
- Control de calidad de OCR: comparar el fragmento detectado como lista de ingredientes con la posición esperada en el envase permite detectar fotos mal recortadas o con OCR defectuoso, ya que el autor advierte de que la precisión cae con OCR muy ruidoso o listas cortadas.
- Análisis de cumplimiento normativo: verificar que un producto declara una lista de ingredientes identificable en su etiqueta, como paso previo a revisiones de etiquetado.
- Investigación en NLP aplicado a alimentación: servir como componente base reproducible (entrenamiento en CPU, 77,1 minutos) para experimentos sobre segmentación de texto OCR en el dominio alimentario.
- Preprocesado para sistemas de recomendación dietética: extraer la lista de ingredientes de forma automática para cruzarla con restricciones del usuario (vegetarianismo, intolerancias, etc.).

## Benchmarks y rendimiento

Evaluación sobre 556 documentos de test reservados (74.691 palabras), con métricas a nivel de palabra:

| Métrica | Valor |
|---|---|
| Precision | 0,9887 |
| Recall | 0,9901 |
| F1 | 0,9894 |
| Accuracy | 0,9919 |

No se han publicado comparaciones con otros modelos en la información disponible. Las métricas son a nivel de palabra, no de span exacto, según advierte el propio autor.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para un modelo de 134,7 M de parámetros; en la práctica cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se requieren GPU dedicadas; el autor entrenó el modelo en CPU. Cualquier GPU consumer (por ejemplo, serie RTX 30/40) es más que suficiente para inferencia.
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: `transformers` (librería nativa del modelo); no se han publicado variantes GGUF para llama.cpp u Ollama, ni configuración para vLLM o TGI. El despliegue estándar es mediante `pipeline("token-classification")` de transformers.
- Latencia y throughput: no disponibles en la información proporcionada; el tiempo de entrenamiento en CPU (77,1 minutos para 2 épocas sobre 5.065 documentos) sugiere una inferencia muy rápida, pero no se aportan cifras medidas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia estructural, el modelo se apoya en `distilbert-base-multilingual-cased` (66 M de parámetros en el encoder, 134,7 M en total con la cabeza de clasificación), pero no se han publicado comparaciones de rendimiento con alternativas de la misma tarea.

| Modelo | Parámetros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| ingredient-list-ner | 134,7 M | 512 tokens (100 palabras recomendadas) | Token classification (BIO) | no disponible |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Las métricas son a nivel de palabra, no de coincidencia exacta de span; un F1 de 0,9894 no garantiza que los límites de la lista de ingredientes sean exactos.
- La precisión cae cuando el texto OCR es muy ruidoso o cuando la lista queda cortada por el encuadre de la foto.
- Las declaraciones de alérgenos del tipo "puede contener..." suelen quedar fuera de la lista de ingredientes y deben gestionarse por separado; el modelo no las detecta.
- La licencia no está disponible, por lo que no puede confirmarse el uso comercial; el autor recomienda además revisar la licencia y términos de los datos de Open Food Facts antes de reutilizar el modelo.
- El modelo solo etiqueta palabras; no genera texto ni estructura la lista de ingredientes, por lo que requiere un pipeline adicional para el parseo final.
- El alcance idiomático real del fine-tuning no está documentado, aunque el modelo base sea multilingüe.
- Al ser un modelo de 0 descargas y 0 likes, no hay evidencia de uso en producción ni validación externa.
- Riesgo de sesgo: el modelo se entrena con datos de Open Food Facts, cuya distribución geográfica y de idiomas puede no representar todos los mercados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mirwaisrahimi/ingredient-list-ner
- Modelo base: https://huggingface.co/distilbert/distilbert-base-multilingual-cased
- Dataset de Open Food Facts (referenciado por el autor, sin enlace directo en la información disponible): no disponible
- Repositorio del proyecto con `src/extractor.py`: no disponible en la información proporcionada
- Paper o blog del autor: no disponible
