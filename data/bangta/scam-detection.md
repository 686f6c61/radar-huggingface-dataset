# bangta/Scam-detection

## Resumen

Scam-detection (publicado por el usuario `bangta` bajo la denominación "AI Scam Shield v2") es un clasificador de texto especializado en la detección de estafas, spam y phishing. Se trata de un ajuste fino de `FacebookAI/xlm-roberta-base`, un transformer encoder multilingüe de 278 millones de parámetros, sobre el que se ha entrenado una cabeza de clasificación binaria (estafa / no estafa). El modelo está pensado para consumirse vía `pipeline("text-classification")` y devuelve una etiqueta con su puntuación de confianza.

El problema que aborda es concreto: filtrar mensajes fraudulentos en dos idiomas, vietnamita (`vi`) e inglés (`en`), con especial énfasis en el ecosistema vietnamita (SMS, correos y URLs de phishing). El autor reporta métricas elevadas en su conjunto de test combinado (F1 de 96,66% sobre 12.878 muestras) y en benchmarks específicos de fraude vietnamita.

Es relevante como pieza de infraestructura de moderación y seguridad, no como modelo generativo. Su tamaño contenido (0,6 GB de repositorio, 278M de parámetros) permite desplegarlo en CPU o en GPUs de consumo, y su contrato de preprocesado (normalización explícita de URLs) refleja que el autor diseñó el modelo pensando en señales léxicas de phishing más que en razonamiento semántico profundo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) con cabeza de clasificación de secuencias |
| Parametros totales | 278.045.186 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 514 tokens posicionales (límite de XLM-RoBERTa); el autor evalúa con `max_length = 128` |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en fp32; no se documentan versiones GGUF, ONNX ni int8) |
| Idiomas soportados | vietnamita (`vi`) e inglés (`en`) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | `text-classification` |
| Modelo base | `FacebookAI/xlm-roberta-base` |

## Arquitectura y entrenamiento

La arquitectura es la de XLM-RoBERTa base: un encoder transformer de 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, con vocabulario SentencePiece de 250.002 tokens y embeddings posicionales aprendidos hasta 514 posiciones. Sobre la representación del token `<s>` se aplica una cabeza lineal de clasificación. No hay mecanismos de atención lineal, decodificación especulativa ni componentes MoE: es un clasificador encoder-only clásico.

El ajuste fino se realizó sobre un corpus declarado de aproximadamente 34,25 millones de filas crudas, deduplicadas y balanceadas por dominio, procedentes de un archivo `Data_Preprocessing.zip` de 35 fragmentos, más cuatro datasets públicos: `ngovanhh/vi-fraud-bench-vi`, `tuan251209/vietnamese-sms-dataset`, `uciml/sms-spam-collection-dataset` y `naserabdullahalam/phishing-email-dataset`. La model card no especifica hiperparámetros de entrenamiento (epochs, learning rate, batch size), ni si hubo aumento de datos, ni la proporción exacta de cada fuente. Tampoco documenta el umbral de decisión como parte del entrenamiento: el umbral 0,69 aparece solo en la evaluación, lo que implica que en producción hay que aplicarlo manualmente sobre la probabilidad devuelta.

Un detalle técnico destacable es el contrato de preprocesado: antes de tokenizar, el autor exige normalizar las URLs de forma que se preserven los tokens de dominio (`https://csgt-tracuuphat.com/pay` pasa a `[url] csgt tracuuphat com pay`) y sustituir guiones bajos por espacios. Esto indica que el modelo depende fuertemente de señales léxicas del dominio y de la ruta, y que usarlo sin ese preprocesado degradará el rendimiento de forma no cuantificada.

## Capacidades

- Clasificación binaria de texto en estafa/phishing frente a legítimo, con puntuación de probabilidad.
- Detección de spam y fraude en SMS y correo electrónico en vietnamita e inglés.
- Identificación de señales de phishing en URLs cuando se aplica el preprocesado prescrito (extracción de dominio y ruta como tokens).
- Funciona sobre entradas cortas (el autor evalúa con 128 tokens), adecuado para mensajes y asuntos de correo.
- No soporta tool calling ni function calling: es un clasificador, no un modelo generativo.
- No soporta agentes ni razonamiento multi-paso.
- No tiene modo de pensamiento, visión ni audio.
- Capacidad multilingüe limitada a los dos idiomas declarados; el resto de idiomas de XLM-RoBERTa no se ha validado en este ajuste.

## Casos de uso

- Filtro de entrada en pasarelas SMS: clasificar cada mensaje entrante antes de entregarlo al usuario, aplicando el umbral 0,69 sobre la probabilidad de estafa. El modelo está entrenado específicamente con datasets de SMS vietnamitas, por lo que encaja en operadores de ese mercado.
- Moderación de correo electrónico: preclasificar asuntos y cuerpos de correo para enrutar los sospechosos a cuarentena, usando el modelo como primera etapa barata antes de un análisis más costoso.
- Detección de phishing en formularios y chats de soporte: puntuar el texto que un usuario pega en un formulario de denuncia para priorizar la cola de revisión humana.
- Enriquecimiento de pipelines antifraude: añadir una señal adicional (score de estafa) a un motor de reglas existente, combinándola con reputación de dominio y análisis de cabeceras.
- Filtrado de comentarios y reseñas en plataformas de comercio: detectar mensajes que redirigen a dominios fraudulentos, aprovechando la normalización de URLs que preserva los tokens del dominio.
- Etiquetado asistido para curación de datasets: usar el modelo para preetiquetar grandes volúmenes de mensajes y que anotadores humanos revisen solo los casos cercanos al umbral, reduciendo el coste de anotación.
- Investigación sobre fraude en vietnamita: servir como baseline reproducible sobre `vi-fraud-bench-vi` para comparar futuros detectores.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card (umbral 0,69, `max_length = 128`):

| Conjunto | Muestras | Accuracy | Precision | Recall | F1 | ROC-AUC |
|---|---|---|---|---|---|---|
| Test combinado | 12.878 | 97,61% | 97,08% | 96,24% | 96,66% | 99,65% |
| VI Fraud Bench | 400 | 98,75% | no disponible | no disponible | 98,75% | no disponible |
| VI SMS Test | 597 | 92,46% | no disponible | no disponible | 86,15% | no disponible |
| Benchmark realista de 100 muestras | 100 | 98,0% | no disponible | no disponible | 98,04% | no disponible |

No se han publicado comparaciones con modelos de referencia en la información disponible. Las cifras proceden exclusivamente de la model card del autor y no han sido verificadas de forma independiente; el conjunto de test combinado puede solaparse con las fuentes de entrenamiento, por lo que deben interpretarse con cautela.

## Requisitos de hardware

- VRAM para inferencia en fp32: aproximadamente 1,1 GB solo para pesos (278M × 4 bytes), más activaciones; en la práctica cabe holgadamente en 2 GB.
- En fp16: alrededor de 0,56 GB de pesos; en int8 dinámico, unos 0,28 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB, incluidas RTX 3050, RTX 3060, RTX 4060, T4, L4. En A100/H100 el cuello de botella será el throughput de peticiones, no la memoria.
- Cabe en GPU de consumo sin problema; también es viable en CPU para volúmenes moderados, dado el tamaño del modelo.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, Text Embeddings Inference (TEI) para servir clasificación, ONNX Runtime si se exporta manualmente, y FastAPI o similares como capa HTTP. No se publican artefactos GGUF ni recetas para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia estructural, un encoder de 12 capas con secuencias de 128 tokens es órdenes de magnitud más rápido que un modelo generativo del mismo tamaño, pero no hay cifras medidas por el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Tarea |
|---|---|---|---|---|---|
| bangta/Scam-detection | 278M | 514 tokens | vi, en | no disponible | Clasificación de estafa/phishing |
| FacebookAI/xlm-roberta-base | 278M | 514 tokens | 100 idiomas | MIT | Modelo base (no clasificador) |
| roberta-base | 125M | 514 tokens | en | MIT | Modelo base (no clasificador) |
| DistilBERT multilingüe | 135M | 512 tokens | 104 idiomas | Apache 2.0 | Modelo base, más rápido y menos preciso |

La comparación relevante es contra el propio modelo base sin ajustar: `xlm-roberta-base` no es un clasificador y requeriría un ajuste propio para esta tarea. Frente a alternativas más ligeras como DistilBERT multilingüe, este modelo ofrece mayor capacidad pero también mayor coste de inferencia. No se dispone de comparaciones publicadas con otros detectores de phishing ajustados, por lo que la comparativa de rendimiento real no está disponible.

## Limitaciones y advertencias

- La licencia no está declarada: no se puede asumir uso comercial permitido. Es un bloqueo serio para producción hasta que el autor la especifique.
- Las métricas provienen únicamente del autor y no han sido replicadas de forma independiente; el test combinado puede contener solapamiento con el entrenamiento.
- El umbral 0,69 es una decisión de evaluación, no un valor por defecto del modelo: hay que calibrarlo sobre datos propios antes de desplegar.
- El rendimiento cae de forma notable en SMS vietnamitas (F1 86,15% frente a 96,66% en el combinado), lo que sugiere dificultad con mensajes cortos, coloquiales o con abreviaturas.
- Dependencia crítica del preprocesado de URLs: sin la normalización prescrita, el rendimiento no está caracterizado y probablemente se degrada.
- Ventana efectiva de 128 tokens en la evaluación: mensajes largos o correos completos requerirán truncado, con pérdida de señales.
- Solo validado en vietnamita e inglés; no hay evidencia de comportamiento en castellano pese a que el modelo base es multilingüe.
- Riesgo de falsos positivos en textos legítimos que mencionan dominios, premios o urgencia (marketing, comunicaciones bancarias legítimas).
- No es un modelo generativo: no puede explicar sus decisiones ni extraer entidades; solo devuelve una etiqueta y una probabilidad.
- Riesgo de deriva temporal: los patrones de phishing cambian rápido y no se documenta la fecha de corte de los datos de entrenamiento.
- Sin garantías de robustez frente a evasión adversarial (ofuscación de URLs, homoglifos, espaciado de caracteres), no evaluada en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bangta/Scam-detection
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Dataset `ngovanhh/vi-fraud-bench-vi`: https://huggingface.co/datasets/ngovanhh/vi-fraud-bench-vi
- Dataset `tuan251209/vietnamese-sms-dataset`: https://huggingface.co/datasets/tuan251209/vietnamese-sms-dataset
- Dataset `uciml/sms-spam-collection-dataset`: https://huggingface.co/datasets/uciml/sms-spam-collection-dataset
- Dataset `naserabdullahalam/phishing-email-dataset`: https://huggingface.co/datasets/naserabdullahalam/phishing-email-dataset
