# illusionash/my-sentiment-model

## Resumen

my-sentiment-model es un clasificador de sentimiento en tres clases (negativo, neutro, positivo) publicado en HuggingFace por el usuario illusionash. Es un fine-tuning de distilbert-base-uncased, un encoder transformer destilado de BERT que suma 66.955.779 parámetros, y está orientado a la clasificación de textos cortos en inglés. El entrenamiento se hizo sobre una muestra del split de entrenamiento del dataset cardiffnlp/tweet_eval (sentiment), durante una única época.

El modelo resuelve una tarea muy acotada: asignar una etiqueta de polaridad a una frase breve, típicamente un tuit. No es un modelo generativo, no soporta tool calling ni razonamiento multi-paso, y su ventana de contexto útil es la del modelo base. Debe evaluarse como lo que es: un baseline ligero y de bajo coste, con una precisión de 0,689 y un macro F1 de 0,679 sobre el conjunto de test.

Su relevancia práctica viene del tamaño: 0,3 GB de repositorio en safetensors, ejecutable en CPU y en cualquier GPU de consumo. Eso lo hace útil como pieza barata dentro de pipelines de etiquetado masivo o como punto de partida para fine-tunings propios, no como sustituto de clasificadores de sentimiento consolidados. En el momento de la consulta el repositorio no registra descargas ni likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de bert-base-uncased) con cabecera de clasificación de 3 clases |
| Parametros totales | 66.955.779 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens como máximo arquitectónico del modelo base; la model card no especifica la longitud usada en entrenamiento |
| Tipos de cuantizacion | no disponible (el autor no publica pesos cuantizados; al ser un modelo de ~67 M de parámetros es convertible a INT8/ONNX por cuenta propia) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La base es distilbert-base-uncased, un encoder de 6 capas y 768 dimensiones ocultas obtenido por destilación de conocimiento de bert-base-uncased. Sobre la representación del modelo base se añade una cabecera de clasificación con tres salidas correspondientes a las etiquetas negative, neutral y positive. Es una arquitectura exclusivamente encoder: procesa la secuencia completa en una pasada y emite una etiqueta por secuencia, sin generación autorregresiva.

Los datos de entrenamiento son una muestra del split de entrenamiento de cardiffnlp/tweet_eval (sentiment), es decir, tuits en inglés. El autor indica una sola época de entrenamiento y no documenta hiperparámetros (learning rate, batch size, optimizador, semilla ni política de truncamiento). No hay constancia de RLHF, DPO ni ajuste por preferencias, algo esperable en un clasificador. Tampoco se describe ninguna innovación técnica adicional: no hay decodificación especulativa, atención lineal ni componentes híbridos.

## Capacidades

- Clasificación de sentimiento en tres clases (negative, neutral, positive) sobre texto en inglés.
- Funciona mejor con textos cortos e informales, del estilo de tuits, que es la distribución de entrenamiento.
- Inferencia por secuencia con una única etiqueta de salida; la API estándar de transformers devuelve etiqueta y puntuación de confianza (los identificadores exactos de etiqueta no se detallan en la model card).
- Ejecución viable en CPU, lo que permite clasificación por lotes en entornos sin GPU.
- No soporta tool calling ni function calling: es un encoder de clasificación, no un modelo instructivo.
- No soporta agentes, razonamiento multi-paso ni modo "thinking".
- No tiene capacidades de visión, audio ni generación de texto.
- Capacidad multilingüe: nula más allá del inglés; el vocabulario y los datos son ingleses.

## Casos de uso

- Monitorización de menciones en redes sociales: clasificar en tiempo real tuits o comentarios en inglés sobre una marca y agregar la distribución de polaridad por franja horaria. El modelo es lo bastante pequeño para procesar lotes en CPU junto al recolector de datos.
- Triaje de tickets de soporte: etiquetar el asunto y la primera frase de cada ticket como negativo, neutro o positivo para priorizar la cola de casos negativos. Solo es adecuado si el campo de entrada es corto, ya que la señal se degrada con textos largos.
- Enriquecimiento de un pipeline de datos: usar el modelo como etapa de etiquetado en un flujo tipo Kafka o un job batch que añada una columna de sentimiento a un corpus de reseñas breves en inglés.
- Preetiquetado para anotación humana: generar una primera pasada automática sobre un conjunto de tuits y reservar el esfuerzo de anotación para los casos de baja confianza, reduciendo el coste del etiquetado manual.
- Baseline en experimentación académica: servir como referencia mínima (0,689 de accuracy, 0,679 de macro F1) contra la que medir fine-tunings propios sobre tweet_eval con más épocas o más datos.
- Filtro de escalado en un chatbot: detectar respuestas de usuario claramente negativas en conversaciones en inglés y derivarlas a un agente humano, siempre que los turnos sean cortos y no se espere robustez ante ironía.
- Análisis de encuestas abiertas con respuestas de una línea: agregar la polaridad de respuestas breves en inglés para un informe exploratorio, asumiendo el error inherente a un modelo entrenado con una muestra pequeña.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor son dos métricas sobre el conjunto de test de tweet_eval (sentiment):

| Metrica | Valor |
|---|---|
| Accuracy | 0,689 |
| Macro F1 | 0,6789632300455798 |

No se han publicado resultados de benchmarks en la informacion disponible más allá de estas dos métricas: no hay MMLU, HumanEval, GSM8K ni comparaciones con otros clasificadores. Tampoco se documenta el tamaño exacto de la muestra de entrenamiento utilizada, lo que impide reproducir el resultado.

## Requisitos de hardware

- Peso de los pesos en memoria: unos 268 MB en FP32 (66.955.779 × 4 bytes), ~134 MB en FP16 y ~67 MB en INT8; el repositorio completo ocupa 0,3 GB.
- VRAM estimada para inferencia: menos de 1 GB en cualquiera de los formatos, incluyendo el overhead del runtime.
- GPU recomendadas: ninguna en particular; basta una GTX 1050, una GTX 1650, una RTX 3060 o una GPU integrada. A100/H100 solo tendrían sentido para volúmenes de lote muy altos, no por requisito de memoria.
- Cabe en cualquier GPU de consumo y en la mayoría de CPU modernas; la inferencia en CPU es una opción realista para lotes pequeños o medianos.
- Opciones de despliegue: pipeline de transformers (PyTorch), exportación a ONNX Runtime, TorchServe, Triton Inference Server o un servicio FastAPI propio. vLLM, TGI o llama.cpp no están orientados a este tipo de encoder de clasificación y no aportan ventaja aquí.
- Latencia y throughput: no disponible. El autor no publica mediciones, y cualquier cifra dependería del hardware, del tamaño de lote y de la longitud de secuencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Metricas publicadas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| illusionash/my-sentiment-model | 66,96 M | 512 | 3 clases (negativo/neutro/positivo) | Accuracy 0,689; macro F1 0,679 en tweet_eval test | MIT | HuggingFace |
| cardiffnlp/twitter-roberta-base-sentiment-latest | ~125 M (roberta-base) | 512 | 3 clases | no disponible en la informacion proporcionada | no disponible | HuggingFace |
| distilbert-base-uncased-finetuned-sst-2-english | 66,96 M | 512 | 2 clases (positivo/negativo) | no disponible en la informacion proporcionada | no disponible | HuggingFace |
| roberta-base ajustado sobre tweet_eval (referencia genérica) | ~125 M | 512 | 3 clases | no disponible en la informacion proporcionada | no disponible | HuggingFace |

No se dispone de cifras de rendimiento de las alternativas dentro de la información proporcionada, por lo que la comparación cuantitativa no es posible. Cualitativamente, el modelo destaca solo por licencia MIT y tamaño reducido; los clasificadores basados en RoBERTa parten de un encoder más capaz, y los ajustes de sentimiento con más épocas y el dataset completo suelen ser opciones más sólidas en producción.

## Limitaciones y advertencias

- Entrenado con una única época y sobre una muestra del dataset, según reconoce el propio autor; el rendimiento está por debajo de lo esperable con el corpus completo.
- Solo inglés: no procesa castellano ni ningún otro idioma de forma fiable.
- Sesgo de dominio: entrenado con tuits, por lo que rinde peor en reseñas largas, documentación o texto formal.
- Dificultades explícitas con el sarcasmo y la ironía, documentadas en la model card.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas con alta confianza en entradas ambiguas o fuera de distribución.
- La longitud de truncamiento usada en entrenamiento no está documentada; en entradas largas el comportamiento es incierto.
- No se documentan sesgos demográficos ni análisis de subgrupos; al entrenar con tuits, es probable que herede sesgos de género, raza o registro lingüístico del corpus, pero no hay medición publicada.
- Licencia MIT: permite uso comercial y modificación, pero el modelo se distribuye sin garantías y el autor no ofrece soporte.
- Sin mantenimiento aparente: creado y actualizado el mismo día (25 de octubre de 2026), con 0 descargas y 0 likes; conviene fijar una revisión concreta si se usa en producción.
- La model card contiene un "[More Information Needed]" que indica documentación incompleta sobre entrenamiento y evaluación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/illusionash/my-sentiment-model
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Dataset de entrenamiento: https://huggingface.co/datasets/cardiffnlp/tweet_eval
- Repositorios, papers o demos adicionales: no disponible. La búsqueda web realizada no devolvió ningún resultado relacionado con este modelo; los enlaces obtenidos trataban sobre contenido de animación y se han descartado por no ser pertinentes.
