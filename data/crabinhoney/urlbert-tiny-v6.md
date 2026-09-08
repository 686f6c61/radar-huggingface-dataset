# CrabInHoney/urlbert-tiny-v6

## Resumen

urlbert-tiny-v6 es un modelo de codificación de texto basado en la arquitectura ModernBERT, desarrollado por CrabInHoney, con 2.033.408 parámetros (aproximadamente 2 millones). Está diseñado específicamente para el análisis de URLs, un campo dentro de la ciberseguridad que requiere extraer características de enlaces para detectar amenazas como phishing o contenido malicioso. El modelo se publica bajo licencia Apache 2.0 y sus pesos están disponibles en formato safetensors.

La relevancia de este modelo radica en su tamaño reducido: con solo 2 millones de parámetros, puede ejecutarse en entornos con recursos limitados, como firewalls, proxies o aplicaciones de seguridad en el borde, manteniendo una latencia muy baja. Forma parte de la colección urlbert de CrabInHoney, una serie de modelos BERT optimizados para tareas de clasificación y análisis de URLs. No se ha publicado información sobre la longitud de contexto ni sobre los idiomas soportados en la ficha del modelo.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder) |
| Parámetros totales | 2.033.408 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

urlbert-tiny-v6 es un modelo encoder basado en ModernBERT, que procesa cadenas de texto (en este caso, URLs) y produce representaciones vectoriales densas. No es un modelo generativo: su función es codificar la entrada en un espacio latente para tareas posteriores de clasificación o extracción de características.

No se han publicado detalles específicos sobre el proceso de entrenamiento de esta versión, como el número de tokens, la composición del dataset o si se aplicaron técnicas de ajuste como RLHF o DPO. La línea urlbert de CrabInHoney se inspira en el trabajo "Continuous Multi-Task Pre-training for Malicious URL Detection and Webpage Classification", que propone un preentrenamiento continuo sobre un gran corpus de URLs para mejorar el rendimiento en tareas de detección de URLs maliciosas. Sin embargo, no se puede confirmar que esta versión utilice exactamente ese dataset o esa metodología.

## Capacidades

- Extracción de características de URLs: genera embeddings que representan semánticamente la estructura y el contenido de un enlace.
- Clasificación de phishing: puede utilizarse como base para un clasificador binario que distingue URLs legítimas de URLs maliciosas.
- Clasificación de categorías de páginas web: permite etiquetar el tipo de contenido al que apunta una URL, como redes sociales, noticias o comercio electrónico.
- No es un modelo generativo: no produce texto libre, solo representaciones y predicciones de clasificación.
- No soporta tool calling ni function calling: al ser un encoder, no está diseñado para interactuar con herramientas externas.
- No soporta razonamiento multi-paso ni modo agente: su uso se limita a tareas de codificación y clasificación.
- Capacidades multilingües: no disponible.

## Casos de uso

- Detección de phishing en tiempo real: integrado en un proxy o gateway de correo, analiza las URLs de los enlaces entrantes y las clasifica como legítimas o maliciosas antes de entregar el mensaje al usuario.
- Filtrado de URLs en navegadores: un plugin de navegador puede usar el modelo para bloquear enlaces sospechosos en el momento en que el usuario intenta acceder a ellos.
- Clasificación de categorías web: en sistemas de control parental o filtrado corporativo, asigna categorías a las URLs para aplicar políticas de acceso.
- Análisis de logs de seguridad: procesa grandes volúmenes de URLs presentes en logs de acceso para identificar patrones de ataque o tráfico anómalo.
- Enriquecimiento de SIEM: como parte de un pipeline de seguridad, genera embeddings de URLs que se incorporan a sistemas de detección de anomalías para mejorar la correlación de eventos.
- Investigación de amenazas: los analistas pueden agrupar URLs similares mediante los embeddings generados, lo que ayuda a identificar campañas de phishing o infraestructuras maliciosas compartidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 2 millones de parámetros, puede ejecutarse en CPU con menos de 1 GB de RAM. En GPU, la VRAM necesaria es mínima, inferior a 1 GB en FP32.
- GPU recomendadas: no requiere GPU; cualquier CPU moderna es suficiente. Si se opta por GPU, una integrada o una tarjeta básica como la RTX 2060 es más que suficiente.
- Cabe en consumer GPU: sí, en cualquier GPU, incluso en las más básicas.
- Opciones de despliegue: Transformers (PyTorch), ONNX Runtime, Hugging Face Inference Endpoints, o un servicio propio con FastAPI y la librería transformers.
- Latencia y throughput: no disponibles. Dado el tamaño del modelo, se espera una latencia de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría. Los datos de rendimiento y especificaciones de otros modelos de la colección urlbert no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Tamaño reducido: la capacidad de representación es limitada comparada con modelos de cientos de millones de parámetros, lo que puede afectar a la precisión en tareas complejas de análisis de URLs.
- Sin información sobre sesgos o datos de entrenamiento: no se puede evaluar la equidad del modelo ni su comportamiento ante determinados tipos de URLs.
- Alucinación: al ser un encoder, no genera texto, por lo que el riesgo de alucinación en el sentido tradicional no aplica.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe incluir el aviso de licencia y documentar los cambios realizados si se modifica el modelo.
- Contexto e idiomas no especificados: puede haber limitaciones en la longitud de URL analizable y en el soporte de caracteres no ASCII.

## Enlaces

- HuggingFace: https://huggingface.co/CrabInHoney/urlbert-tiny-v6
- Colección urlbert: https://huggingface.co/collections/CrabInHoney/urlbert
- urlbert-tiny-base-v4: https://huggingface.co/CrabInHoney/urlbert-tiny-base-v4
- urlbert-tiny-v2-phishing-classifier: https://huggingface.co/CrabInHoney/urlbert-tiny-v2-phishing-classifier
- Paper URLBERT: https://github.com/Davidup1/URLBERT
