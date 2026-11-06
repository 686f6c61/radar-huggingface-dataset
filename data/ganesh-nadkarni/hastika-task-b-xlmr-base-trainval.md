# Ganesh-Nadkarni/hastika-task-b-xlmr-base-trainval

## Resumen

`hastika-task-b-xlmr-base-trainval` es un modelo de clasificación de texto obtenido mediante fine-tuning de `FacebookAI/xlm-roberta-base` para la identificación de la categoría objetivo de comentarios de odio en texto code-mixed kannada-inglés (kanglish), principalmente comentarios de YouTube. Lo desarrolla Ganesh-Nadkarni como participación en la tarea B del shared task HASTIKA @ ICON-2026, cuyo objetivo es asignar a un comentario ofensivo una de seis categorías objetivo: género, geopolítica, otros, política, religión y violencia.

El modelo parte de la arquitectura XLM-RoBERTa base, un transformer encoder multilingüe con 278.048.262 parámetros, y se presenta como un checkpoint de clasificación (cabeza de 6 etiquetas) sobre el encoder preentrenado. No es un modelo generativo: no produce texto libre ni soporta tool calling, sino una etiqueta por secuencia de entrada. Su relevancia actual radica en el interés creciente por la moderación automática de contenido en lenguas de bajos recursos y en registros code-mixed, donde los modelos monolingües y los clasificadores entrenados solo en inglés rinden de forma insuficiente.

La ficha se basa exclusivamente en la model card y en los metadatos públicos del repositorio. El autor advierte de que el checkpoint se entrenó con los ficheros de entrenamiento y validación fusionados, por lo que no existe una validación limpia y las cifras reportadas corresponden a una partición aleatoria del 12 % de los datos fusionados. El modelo se distribuye con licencia MIT y está pensado para uso de investigación como apoyo a moderadores humanos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) con cabeza de clasificación de 6 etiquetas |
| Parametros totales | 278.048.262 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 160 tokens de longitud máxima de entrenamiento (el encoder base admite hasta 512 posiciones) |
| Tipos de cuantizacion | no disponible (el repositorio publica safetensors en precisión completa; admite cuantización estándar vía herramientas externas) |
| Idiomas soportados | kannada (kn) e inglés (en), en registro code-mixed kannada-inglés |
| Licencia | MIT |
| Formato de pesos | safetensors (compatible con `transformers`) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `FacebookAI/xlm-roberta-base`, un transformer encoder con atención bidireccional y tokenizador SentencePiece multilingüe. Sobre el encoder se añade una cabeza de clasificación lineal que produce seis logits, uno por categoría objetivo (`0` Gender, `1` Geo-political, `2` Others, `3` Political, `4` Religion, `5` Violence). El entrenamiento se realizó con los ficheros de entrenamiento y validación del dataset HASTIKA fusionados, con una partición estratificada 88/12, longitud máxima de 160 tokens, batch size 16, precisión mixta, learning rate 1e-5 y parada temprana sobre macro-F1 de validación. El desbalanceo de clases se trató únicamente con pérdida ponderada por clase, sin sobremuestreo.

La innovación técnica es limitada por diseño: se trata de un ajuste supervisado estándar sobre un encoder multilingüe preentrenado, sin RLHF, DPO ni decodificación especulativa. El interés está en el dominio de aplicación (texto code-mixed kannada-inglés) y en el tratamiento del desbalanceo mediante class weighting. El autor reporta un macro-F1 de 0,579 sobre la partición retenida del 12 %, cifra que debe interpretarse con cautela porque esa partición procede de los mismos ficheros de entrenamiento y validación fusionados y no constituye una validación independiente.

## Capacidades

- Clasificación de texto multietiqueta en una sola etiqueta por secuencia: asigna a cada comentario una de las seis categorías objetivo de odio.
- Detección de categoría objetivo (no de toxicidad binaria): distingue género, geopolítica, otros, política, religión y violencia.
- Procesamiento de texto code-mixed kannada-inglés (kanglish), incluyendo transliteraciones latinas del kannada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-step: no disponible.
- Capacidades multilingües: limitadas a kannada e inglés en registro code-mixed; no se documenta soporte fiable para otras lenguas pese al preentrenamiento multilingüe del modelo base.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Moderación asistida en plataformas de vídeo: el modelo etiqueta comentarios de YouTube en kanglish con la categoría objetivo del odio, de modo que los moderadores humanos priorizan la revisión por género, religión o violencia en lugar de revisar todo el flujo manualmente.
- Triaje previo a revisión humana en comunidades kannada: se integra como primer filtro en un pipeline donde solo los comentarios clasificados en categorías sensibles pasan a revisión, reduciendo el volumen de cola.
- Investigación sociolingüística: permite cuantificar la distribución de categorías de odio en corpus code-mixed kannada-inglés y estudiar qué ejes (político, religioso, de género) concentran la toxicidad.
- Análisis de discurso en redes sociales durante periodos electorales: la etiqueta `Political` y `Geo-political` permite monitorizar la proporción de comentarios de odio de naturaleza política en un canal o conjunto de canales.
- Construcción de datasets anotados: el modelo puede usarse como preanotador para acelerar el etiquetado humano de nuevos corpus kanglish, con revisión posterior obligatoria dada la moderada macro-F1 reportada.
- Evaluación comparativa de modelos multilingües: sirve como línea base fine-tuned de XLM-R base para experimentos con modelos mayores o con técnicas de aumento de datos en texto code-mixed.
- Filtrado en pipelines de investigación de PLN: al ser un clasificador pequeño (278 M de parámetros) y con licencia MIT, puede desplegarse en infraestructura modesta para prefiltrar corpus antes de análisis más costosos.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| Macro-F1 | 0,579 | Partición retenida aleatoria del 12 % de los datos de entrenamiento y validación fusionados |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible. La única cifra reportada por el autor es la macro-F1 indicada, que no constituye una evaluación sobre un conjunto de test independiente ni sobre la partición oficial del shared task.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB en fp32 (278 M de parámetros), en torno a 0,6 GB en fp16 y menos de 0,4 GB en cuantización int8.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una NVIDIA T4, L4 o RTX 3060 es más que suficiente. Para lotes grandes, A100 o H100 no aportan ventaja significativa frente a GPUs de gama media por el reducido tamaño del modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 2060 en adelante) e incluso en CPU para inferencia de baja concurrencia.
- Opciones de despliegue: `transformers` con pipeline de `text-classification`, Text Embeddings Inference (el repositorio está marcado como compatible con endpoints), ONNX Runtime y cuantización dinámica con `optimum`. No se documenta soporte nativo en llama.cpp ni Ollama por tratarse de un encoder de clasificación.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo y la longitud máxima de 160 tokens, se espera latencia de milisegundos por secuencia en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hastika-task-b-xlmr-base-trainval | 278 M | 160 tokens (entrenamiento) | Clasificación de categoría objetivo de odio en kanglish | MIT | Hugging Face |
| FacebookAI/xlm-roberta-base | 278 M | 512 tokens | Modelo base multilingüe (no clasificador) | MIT | Hugging Face |
| Modelos de toxicidad multilingües genéricos | no disponible | no disponible | Detección de toxicidad binaria o multietiqueta | variable | Hugging Face |

La comparación con alternativas específicas para kanglish no está disponible en la información proporcionada. Frente al modelo base XLM-R, este checkpoint añade una cabeza de clasificación de 6 clases entrenada en dominio, a costa de perder generalidad y de heredar las limitaciones de un dataset pequeño. Los clasificadores de toxicidad multilingües genéricos no están diseñados específicamente para la distinción de categoría objetivo ni para el registro code-mixed kannada-inglés, por lo que la comparación directa exigiría evaluación sobre el mismo conjunto, dato que no se ha publicado.

## Limitaciones y advertencias

- El checkpoint se entrenó con los ficheros de entrenamiento y validación fusionados: no existe una validación limpia y la macro-F1 de 0,579 corresponde a una partición aleatoria del 12 % de los datos fusionados, no a un test independiente.
- El autor indica que este checkpoint no formó parte de una submisión oficial al shared task.
- Entrenado con un dataset pequeño: se esperan errores en variantes dialectales, sarcasmo, lenguaje reclamado y transliteraciones no vistas en entrenamiento.
- Riesgo de falsos negativos y falsos positivos en la clasificación de categoría objetivo; no debe usarse como único mecanismo de moderación.
- Sesgos potenciales derivados de la distribución del corpus HASTIKA (canales de YouTube concretos, temáticas sobrerrepresentadas) y del desbalanceo de clases, mitigado solo parcialmente con pérdida ponderada.
- Limitación de idioma: el modelo está ajustado para kannada-inglés code-mixed; su uso en kannada monolingüe, inglés estándar u otras lenguas no está validado.
- Longitud máxima de 160 tokens en entrenamiento: comentarios más largos se truncan, lo que puede perder la parte del texto que determina la categoría.
- Licencia MIT permite uso comercial, pero el autor restringe explícitamente el modelo a uso de investigación y recuerda que el dataset HASTIKA no se incluye y tiene sus propias condiciones de uso, que deben consultarse antes de cualquier otro uso.
- Uso previsto: asistencia a moderadores humanos, no sustitución de los mismos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ganesh-Nadkarni/hastika-task-b-xlmr-base-trainval
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Referencia del dataset y shared task: Kavatagi, S. and Rachh, R. (2025). HASTIKA: hate speech and target identification in Kannada-English code-mixed text. *Language Resources and Evaluation*, 59(3):2811-2856.
