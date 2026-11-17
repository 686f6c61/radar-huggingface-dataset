# Mathieu36/my-sentiment-classifier

## Resumen

`Mathieu36/my-sentiment-classifier` es un modelo de clasificación de texto publicado en Hugging Face por el usuario Mathieu36. Se trata de un DistilBERT afinado para análisis de sentimiento binario, con dos etiquetas de salida: POSITIVE y NEGATIVE. El autor lo describe explícitamente como un "ejercicio de despliegue" (deployment exercise), es decir, una republicación de un modelo afinado con fines demostrativos o de aprendizaje, no un modelo de investigación original ni un lanzamiento de una organización con recursos de entrenamiento a gran escala.

Arquitectónicamente es un transformer encoder de tipo DistilBERT, la variante destilada de BERT con aproximadamente 66,9 millones de parámetros totales (confirmados en los pesos en safetensors). El repositorio ocupa 0,3 GB, lo que es coherente con pesos en precisión completa o media para ese número de parámetros. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales más allá de las obligaciones de atribución habituales de esa licencia.

La relevancia de este modelo es limitada en términos de estado del arte: no hay métricas de evaluación publicadas, no se documenta el dataset de afinamiento, no se declaran idiomas soportados y el contador de descargas y likes es cero en el momento de la consulta. Su interés práctico reside en servir como ejemplo mínimo de pipeline de clasificación de sentimiento desplegable con `transformers`, y como caso de estudio de una publicación de modelo con documentación escasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilación de BERT) |
| Parametros totales | 66.955.010 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT admite hasta 512 tokens por configuración estándar, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF, ONNX ni cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un DistilBERT, una versión destilada de BERT que reduce el número de capas del encoder original (de 12 a 6 en la variante base) manteniendo el mecanismo de self-attention bidireccional. Con 66,9 millones de parámetros, se sitúa en el rango esperado para DistilBERT-base, lo que implica una huella de memoria reducida y una latencia de inferencia baja en comparación con BERT-base. La cabeza de clasificación está configurada para dos etiquetas, POSITIVE y NEGATIVE.

No se dispone de información sobre el proceso de entrenamiento: la model card no indica el dataset utilizado, el número de tokens de entrenamiento, la composición del corpus, si hubo destilación adicional durante el afinamiento, ni si se aplicaron técnicas de regularización o ajuste de hiperparámetros. Tampoco se documenta si el afinamiento partió de un checkpoint oficial de DistilBERT o de otra variante. El autor describe el modelo como una republicación con fines de despliegue, lo que sugiere que el afinamiento pudo realizarse sobre un dataset estándar de sentimiento (posiblemente SST-2 o similar), pero esto no está confirmado en la información disponible.

## Capacidades

- Clasificación de texto binaria en dos categorías: POSITIVE y NEGATIVE.
- Análisis de sentimiento sobre fragmentos de texto cortos o medios, típicamente frases u oraciones.
- Integración directa con el pipeline `text-classification` de Hugging Face Transformers.
- Inferencia rápida en CPU y GPU gracias al tamaño reducido del modelo (66,9 M de parámetros).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües; los idiomas soportados figuran como no disponibles.
- No se documentan capacidades de visión, audio ni modos de razonamiento extendido (thinking mode).

## Casos de uso

- Moderación de comentarios en foros y redes sociales: el modelo puede clasificar en tiempo real comentarios de usuarios como positivos o negativos, permitiendo filtrar o priorizar contenido con carga negativa antes de la revisión humana. Su tamaño reducido permite desplegarlo en contenedores ligeros con CPU.
- Análisis de opiniones de clientes a pequeña escala: procesamiento por lotes de reseñas de productos o encuestas de satisfacción para agregar métricas de sentimiento por período, categoría o segmento de cliente.
- Enrutamiento de tickets de soporte: clasificación automática de mensajes entrantes para dirigir las quejas (sentimiento negativo) a colas de atención prioritaria y las consultas neutras o positivas a respuestas automatizadas.
- Monitorización de menciones de marca: análisis de publicaciones y comentarios recogidos de APIs sociales para detectar picos de sentimiento negativo asociados a incidentes o lanzamientos.
- Filtrado previo en pipelines de anotación: uso del clasificador como primera pasada para etiquetar grandes volúmenes de texto y reservar la revisión humana para los casos con puntuación de confianza baja.
- Prototipado y docencia: ejemplo mínimo de extremo a extremo para enseñar el ciclo de vida de un modelo de clasificación en Hugging Face, desde el afinamiento hasta el despliegue con `pipeline`, dado que el autor lo presenta como ejercicio de despliegue.
- Clasificación de feedback interno en herramientas de desarrollo: análisis de comentarios en revisiones de código o encuestas internas de equipo para detectar señales de fricción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión, recall, F1, exactitud ni comparaciones con otros modelos, y no se especifica el conjunto de evaluación empleado.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 268 MB solo para pesos (66,9 M de parámetros × 4 bytes), más overhead de activaciones y del runtime de PyTorch.
- VRAM estimada en FP16: aproximadamente 134 MB para pesos, más overhead.
- Cabe holgadamente en cualquier GPU consumer, incluidas GTX 1050 Ti, RTX 3050, RTX 4090 y superiores; también es viable en CPU para cargas de baja concurrencia.
- GPU recomendadas para producción de alto throughput: T4, L4, A10G o A100, aunque el modelo no las requiere por capacidad sino por volumen de peticiones.
- Opciones de despliegue: `transformers` con `pipeline`, TorchServe, FastAPI con PyTorch, ONNX Runtime (previa exportación no documentada), y servidores de inferencia como TGI o vLLM aunque su soporte para clasificación de texto es menos habitual que para generación.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera latencia de milisegundos por petición en GPU y de decenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mathieu36/my-sentiment-classifier | 66,9 M | no disponible | Clasificación de sentimiento binaria | Apache 2.0 | Hugging Face |
| distilbert-base-uncased-finetuned-sst-2-english | ~67 M | 512 tokens | Clasificación de sentimiento binaria | Apache 2.0 | Hugging Face (oficial) |
| cardiffnlp/twitter-roberta-base-sentiment-latest | ~125 M | 512 tokens | Clasificación de sentimiento (3 clases) | no disponible en la información | Hugging Face |
| ProsusAI/finbert | ~110 M | 512 tokens | Clasificación de sentimiento financiero | no disponible en la información | Hugging Face |

La comparación se limita a características estructurales y de licencia, ya que no hay métricas de rendimiento publicadas para este modelo que permitan una comparación cuantitativa. Los tres modelos alternativos citados son referencias habituales en la categoría, pero sus datos se incluyen solo a efectos orientativos y no proceden de la información proporcionada sobre este repositorio.

## Limitaciones y advertencias

- Ausencia total de métricas de evaluación: no hay forma de verificar la calidad del clasificador sin ejecutar una evaluación propia sobre un conjunto de validación representativo del dominio objetivo.
- Dataset de entrenamiento no documentado: se desconoce la distribución, el idioma y el dominio de los datos de afinamiento, lo que impide estimar el sesgo y la cobertura del modelo.
- Idiomas no declarados: no se puede asumir soporte multilingüe; probablemente el modelo esté limitado al inglés si deriva de DistilBERT-base sin afinamiento multilingüe, pero esto no está confirmado.
- Riesgo de alucinación no aplicable en sentido estricto (es un clasificador, no un generador), pero sí riesgo de clasificaciones erróneas con alta confianza en textos ambiguos, irónicos o fuera de distribución.
- Sesgos potenciales heredados del corpus de entrenamiento no identificado: posible sesgo de dominio (por ejemplo, reseñas de productos frente a texto informal de redes sociales) y sesgos demográficos o culturales no evaluados.
- Contexto máximo no confirmado: aunque la arquitectura DistilBERT estándar admite 512 tokens, la model card no lo especifica y no se garantiza el comportamiento en secuencias largas.
- Licencia Apache 2.0 permite uso comercial, pero la falta de documentación sobre procedencia de datos de entrenamiento traslada al usuario la responsabilidad de verificar el cumplimiento normativo en su jurisdicción.
- Modelo con cero descargas y cero likes: no hay evidencia de uso en producción ni de validación por parte de la comunidad.
- El autor lo presenta como ejercicio de despliegue, no como un modelo destinado a producción; se recomienda tratarlo como punto de partida y no como componente crítico sin evaluación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mathieu36/my-sentiment-classifier
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos asociados a este modelo.
