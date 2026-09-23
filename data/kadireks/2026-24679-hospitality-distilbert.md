# kadireks/2026-24679-hospitality-distilbert

## Resumen

El modelo `kadireks/2026-24679-hospitality-distilbert` es un ajuste fino de `distilbert-base-uncased` para una tarea de clasificacion binaria de texto: distinguir si una resena de hospitalidad corresponde a un hotel o a un restaurante. Lo desarrolla Krit Adireksarn en el marco de la asignatura CMU 24-679 Design and Prototyping with AI (otoño de 2026), como entrega del Homework 2, y se publica bajo licencia Apache 2.0.

Se trata de un modelo pequeño, de proposito muy acotado y naturaleza claramente docente: 66.955.010 parametros en formato safetensors, entrenado sobre un dataset de un compañero de clase (`kwongnon/2026-24679-text-dataset`) compuesto por unas 100 resenas originales mas aproximadamente 950 copias aumentadas. La entrada se trunca a 256 tokens y el modelo solo maneja ingles.

Su relevancia es fundamentalmente metodologica: sirve como ejemplo reproducible de un pipeline de clasificacion de texto con DistilBERT, con una evaluacion cuidadosa sobre un split disjunto por grupo (group-disjoint) y una comparacion estadistica frente a una linea base de TF-IDF mas regresion logistica. No es un modelo destinado a produccion y el propio autor lo advierte explicitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilacion de BERT-base); 6 capas, 768 de dimension oculta, 12 cabezas de atencion, segun la arquitectura de `distilbert-base-uncased` |
| Parametros totales | 66.955.010 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Entrenamiento con `max_length` = 256 tokens; la arquitectura base admite hasta 512 posiciones |
| Tipos de cuantizacion | No disponible: el repositorio solo publica pesos en precision completa (safetensors). No hay versiones GGUF, int8 ni AWQ publicadas |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con `transformers`) |
| Tarea | Clasificacion de texto, 2 clases: {0: 'restaurant', 1: 'hotel'} |
| Tamaño del repositorio | 0,3 GB |
| Fecha de publicacion | 22 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es la de DistilBERT: un encoder transformer de 6 capas obtenido mediante destilacion del conocimiento de BERT-base, aproximadamente un 40 % mas pequeño y mas rapido que este ultimo. Sobre el encoder se añade una cabeza de clasificacion para dos etiquetas. El modelo no introduce innovaciones de arquitectura propias; el interes esta en el procedimiento de ajuste y evaluacion.

La receta de entrenamiento declarada es de 3 epocas, learning rate 2e-05, batch de 16, longitud maxima de 256 tokens y parada temprana en funcion del macro F1 de validacion. Los datos provienen de `kwongnon/2026-24679-text-dataset`, con alrededor de 100 resenas originales recogidas por un estudiante y unas 950 filas aumentadas. El conjunto de test retenido son 216 filas derivadas de 20 resenas fuente independientes, con un split disjunto por grupo que garantiza que ninguna copia aumentada de una resena de test aparece en entrenamiento. No se documenta uso de RLHF, DPO ni ningun otro ajuste por preferencias.

## Capacidades

- Clasificacion binaria de texto en ingles: asigna a cada resena la etiqueta `restaurant` o `hotel`.
- Discriminacion de genero textual en el dominio de hospitalidad (vocabulario, patrones de servicio, tipo de establecimiento).
- Inferencia rapida y de bajisimo coste por el reducido tamaño del modelo (67 M de parametros).
- Integracion directa con la libreria `transformers` mediante `pipeline("text-classification")`.
- Compatibilidad declarada con text-embeddings-inference y con endpoints de Hugging Face (tags `text-embeddings-inference` y `endpoints_compatible`).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo de pensamiento (thinking mode), vision ni audio.
- Multilingue: no; unicamente ingles.
- Generacion de texto, codigo o matematicas: no; es exclusivamente un clasificador.

## Casos de uso

Nota previa: el autor indica explicitamente que el modelo es una demostracion de curso y que no es apto para produccion. Los casos siguientes describen para que tipo de escenario encajaria esta clase de clasificador, asumiendo un reentrenamiento con datos propios y representativos.

- Enrutado automatico de resenas en una plataforma de viajes: el clasificador decide si el texto recibido debe ir al flujo de negocio de hoteleria o al de restauracion, de modo que cada equipo gestione su cola de respuestas. Con 67 M de parametros, el coste por documento es minimo y permite procesar volumenes altos en CPU.
- Etiquetado previo para anotacion humana: al clasificar grandes volumenes de resenas con una precision declarada del 92,6 % en el conjunto de prueba, se reduce el trabajo manual al limitar la revision a los casos de baja confianza.
- Segmentacion de corpus antes de un analisis de sentimiento: separar resenas de hotel y de restaurante permite entrenar o aplicar despues modelos de sentimiento especificos por vertical, evitando mezclar distribuciones de vocabulario muy distintas.
- Limpieza y curaduria de datasets para modelos mayores: este tipo de clasificador puede actuar como filtro de calidad o de dominio en un pipeline de preparacion de datos, descartando o agrupando documentos antes de alimentar un modelo de lenguaje.
- Analisis de opinion interna en cadenas de hospitalidad: una empresa con hoteles y restaurantes propios podria enrutar los comentarios de encuestas para dirigirlos al area correspondiente y agregar metricas por unidad de negocio.
- Control de calidad de formularios y encuestas: detectar respuestas que no corresponden al tipo de establecimiento sobre el que se pregunta, marcandolas para revision o descarte.
- Demostracion docente y prototipado rapido: por su tamaño (aproximadamente 0,3 GB en disco) es un ejemplo util para ilustrar el ciclo completo de ajuste fino, evaluacion con split disjunto por grupo y comparacion estadistica frente a una linea base.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en el `model-index` de la model card. La verificacion es `false`, es decir, no estan validados de forma independiente.

| Modelo | Accuracy | Macro F1 |
|---|---|---|
| `2026-24679-hospitality-distilbert` (este modelo) | 0,926 (0,9259 en el model-index) | 0,926 (0,9256 en el model-index) |
| Clase mayoritaria | 0,500 | 0,333 |
| TF-IDF + regresion logistica | 0,847 | 0,844 |

El conjunto de evaluacion es un split disjunto por grupo: 216 filas procedentes de 20 resenas fuente independientes, sin copias aumentadas de test en entrenamiento. El autor reporta una prueba de McNemar sobre las discrepancias frente a la linea base de TF-IDF con p = 0,019, lo que sugiere que la diferencia de 7,9 puntos porcentuales en accuracy no es ruido de muestreo. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y no serian aplicables a un clasificador de este tipo.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (los pesos ocupan aproximadamente 268 MB) y unos 134 MB en fp16. Es uno de los modelos mas ligeros posibles dentro de la familia transformer.
- GPU recomendadas: no requiere GPU dedicada. Funciona sin problema en cualquier GPU consumer, incluidas GTX 1050 Ti, RTX 3060, RTX 4090, e incluso en GPU integradas. Las GPU de centro de datos (A100, H100) estarian sobredimensionadas para este modelo.
- Cabe en GPU consumer: si, en practicamente todas. Tambien cabe comodamente en CPU y en entornos con poca memoria.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, servidores propios con PyTorch o FastAPI, ONNX Runtime, text-embeddings-inference y endpoints de Hugging Face (segun los tags del repositorio). No hay pesos GGUF publicados, por lo que el uso con llama.cpp u Ollama requeriria una conversion previa no documentada por el autor.
- Latencia y throughput: no se han publicado cifras medidas en la informacion disponible. Por el tamaño del modelo (67 M de parametros, ~134 MB en fp16), cabe esperar latencias de milisegundos por lote en GPU y de decenas de milisegundos en CPU para secuencias de hasta 256 tokens, pero se trata de una estimacion orientativa y no de un dato verificado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy / Macro F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `kadireks/2026-24679-hospitality-distilbert` | 66.955.010 | 256 tokens (entrenamiento) | 0,926 / 0,926 | Apache 2.0 | Hugging Face, safetensors |
| TF-IDF + regresion logistica (linea base del propio autor) | No aplica (modelo lineal sobre caracteristicas) | No aplica | 0,847 / 0,844 | No disponible | Implementacion local, no publicada como modelo |
| Clase mayoritaria (linea base trivial) | No aplica | No aplica | 0,500 / 0,333 | No aplica | No aplica |
| `distilbert-base-uncased` sin ajustar | 66 M | 512 tokens | No disponible para esta tarea | Apache 2.0 | Hugging Face |

Alternativas habituales de la misma categoria (clasificacion de texto corta en ingles) serian `roberta-base`, `deberta-v3-base` o `ModernBERT-base`, que suelen ofrecer mejor rendimiento a cambio de mas parametros, pero no se han publicado resultados comparativos para esta tarea concreta en la informacion disponible, por lo que no se incluyen cifras.

## Limitaciones y advertencias

- Modelo de demostracion docente: el propio autor indica explicitamente que no es apto para produccion.
- Dominio muy restringido: solo distingue entre resenas de hotel y de restaurante en ingles, a partir de datos de hospitalidad recogidos por un unico estudiante; hereda por tanto el sesgo de muestreo de esa recoleccion.
- Dataset efectivo pequeño: aproximadamente el 90 % de las filas de entrenamiento son copias aumentadas de unas 100 resenas originales, de modo que el tamaño real de la informacion es mucho menor que el recuento de filas sugiere.
- Riesgo de sobreajuste al estilo y vocabulario de las 100 resenas fuente; el rendimiento puede degradarse en textos de otras plataformas, paises o registros.
- Truncamiento a 256 tokens: las resenas largas pierden informacion y las partes finales no influyen en la prediccion.
- Riesgo de alucinacion no aplica en sentido estricto, pero si existe riesgo de clasificaciones erroneas con alta confianza en textos fuera de dominio.
- Solo ingles: no hay soporte multilingue ni entrenamiento en castellano.
- Sesgos conocidos concretos: no disponibles. No se ha publicado ninguna evaluacion de sesgo, equidad o robustez.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, pero el modelo base `distilbert-base-uncased` tambien es Apache 2.0, por lo que no hay conflicto. Aun asi, la licencia no exime de la falta de idoneidad tecnica para produccion.
- Sin verificacion independiente: los resultados del `model-index` figuran con `verified: false`, es decir, son cifras declaradas por el autor.
- Sin cuantizaciones publicadas ni pesos GGUF, lo que limita su despliegue en entornos de inferencia en CPU con llama.cpp u Ollama sin trabajo adicional de conversion.
- Sin mantenimiento ni historial de uso: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, y se publico en una unica fecha sin actualizaciones posteriores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kadireks/2026-24679-hospitality-distilbert
- Dataset de entrenamiento: https://huggingface.co/datasets/kwongnon/2026-24679-text-dataset
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Paper de BERT (Devlin et al., 2018): https://arxiv.org/abs/1810.04805
- Repositorio de `transformers`: https://github.com/huggingface/transformers

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces encontrados correspondian a fichas de peliculas en IMDb y no guardan relacion con el contenido de esta ficha.
