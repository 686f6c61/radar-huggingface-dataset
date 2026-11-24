# CobuildX-AI/cbx-phishing-detector-68M

## Resumen

cbx-phishing-detector-68M es un clasificador de texto en inglés especializado en la detección de phishing y spam en correo electrónico y SMS, desarrollado por CobuildX-AI. Se trata de un fine-tuning del encoder Ettin de 68 millones de parámetros (jhu-clsp/ettin-encoder-68m), un transformer bidireccional de tipo encoder, adaptado a una tarea de clasificación en tres clases: `legitimate`, `spam` y `phishing_scam`.

El modelo resuelve un problema concreto de seguridad: distinguir entre mensajes legítimos, publicidad no deseada sin intención de engaño y mensajes fraudulentos que intentan obtener credenciales, dinero o datos personales. A diferencia de los detectores binarios de phishing, incorpora la categoría intermedia de spam, lo que reduce falsos positivos sobre boletines y promociones legítimas. La decisión final no es un simple argmax, sino una regla de umbral configurable en `cbx_config.json` que permite fijar la tasa de falsas alarmas en el 1 %, 2 % (por defecto) o 3 %.

Su relevancia actual reside en el equilibrio entre tamaño y rendimiento: 68,1 M de parámetros, un repo de 0,3 GB, inferencia en CPU de aproximadamente 20 ms para 63 tokens y 105 ms para 512 tokens (8 hilos, fp32), licencia Apache 2.0 y compatibilidad con text-embeddings-inference. Esto lo hace desplegable en entornos con recursos limitados, como pasarelas de correo o filtros previos a un análisis más costoso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, base Ettin encoder 68m) |
| Parametros totales | 68.146.179 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (el texto superior se trunca, `"truncated": True`) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; inferencia descrita en fp32) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de jhu-clsp/ettin-encoder-68m, un encoder de la familia ModernBERT, y se fine-tunea como clasificador de secuencias con tres etiquetas. La entrada es un único mensaje en inglés: para correo se concatena `"Subject: <asunto>\n\n<cuerpo>"`, y para SMS se pasa el texto tal cual. Los enlaces pueden permanecer en el texto y el modelo lee como máximo 512 tokens.

El entrenamiento combina correo y SMS reales y generados en inglés. El texto de entrenamiento sustituye datos personales por marcadores como `[NAME]`, `[EMAIL]` y `[PHONE]`, aunque el modelo también funciona con nombres y direcciones reales. La evaluación se realizó sobre 6.349 mensajes reales nunca vistos en entrenamiento ni usados para ninguna decisión (Enron, corpus público SpamAssassin, corpus de phishing de Jose Nazario de 2025 y cualquier campaña que toque 2025, y el split de test de UCI SMS Spam Collection), además de 600 casos difíciles generados y reservados. La decisión no es argmax: se aplica una regla de umbral con puntos operativos nombrados (`1%`, `2%`, `3%`) ajustados sobre un conjunto de validación separado de mensajes reales para mantener la tasa de falsos positivos indicada.

## Capacidades

- Clasificación de texto en tres clases: `legitimate`, `spam` y `phishing_scam`.
- Detección de phishing de credenciales, facturas y entregas falsas, señuelos de suspensión de cuenta, estafas de pago por adelantado, premios, inversión y romance.
- Distinción entre spam (promoción abierta sin engaño) y phishing (intento de decepción), lo que evita marcar boletines legítimos como fraude.
- Procesamiento de correo electrónico (asunto y cuerpo concatenados) y de SMS.
- Manejo de enlaces dentro del texto y de marcadores de datos personales (`[NAME]`, `[EMAIL]`, `[PHONE]`).
- Clasificación por lotes: `clf.classify([...])` devuelve una lista de resultados.
- Puntos operativos configurables para ajustar el compromiso entre recall y falsos positivos.
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento; es un clasificador de una sola pasada.

## Casos de uso

- Filtrado previo en pasarelas de correo: clasificar cada mensaje entrante antes de un análisis más costoso (sandbox, análisis de URL) y derivar solo los `phishing_scam` a la cola de revisión, aprovechando los aproximadamente 20 ms por mensaje corto en CPU.
- Moderación de SMS en pasarelas de mensajería: detectar estafas de paquetería o premios en el texto del SMS antes de entregarlo al usuario, con un coste de inferencia mínimo y sin GPU.
- Etiquetado de bandejas de entrada en productos de correo: separar automáticamente spam comercial de phishing real para que la interfaz aplique acciones distintas (mover a spam frente a aviso de seguridad).
- Enriquecimiento de pipelines de threat intelligence: clasificar grandes volúmenes de mensajes reportados por usuarios y agregar las campañas de phishing detectadas para alimentar listas de bloqueo.
- Formación y concienciación en seguridad: procesar corpus de correos de ejemplo y mostrar al usuario por qué un mensaje se clasifica como phishing, usando las probabilidades por clase como señal explicativa.
- Investigación académica sobre detección de fraude: usar el modelo como línea base reproducible (licencia Apache 2.0, pesos safetensors) en experimentos con los corpus Enron, SpamAssassin, Nazario y UCI SMS.
- Despliegue en entornos sin GPU: servir el modelo con text-embeddings-inference o transformers en CPU para organizaciones que no disponen de aceleradores.

## Benchmarks y rendimiento

Evaluación sobre 6.349 mensajes reales no vistos y 600 casos difíciles generados, con macro F1 (media de F1 sobre las 3 etiquetas) en el punto operativo por defecto del 2 %:

| Modelo | Mensajes reales (macro F1) | Casos difíciles generados (macro F1) |
|---|---:|---:|
| cbx-phishing-detector-68M | 0,819 | 1,000 |
| 17M (misma familia) | 0,785 | 0,999 |

F1 por etiqueta en mensajes reales (modelo de 68M):

| Etiqueta | F1 |
|---|---:|
| `legitimate` | 0,94 |
| `spam` | 0,66 |
| `phishing_scam` | 0,85 |

Puntos operativos en mensajes reales (recall / precisión de `phishing_scam` / tasa de falsos positivos sobre legítimos):

| Modelo | `1%` | `2%` | `3%` |
|---|---:|---:|---:|
| cbx-phishing-detector-68M | 0,83 / 0,87 / 1,6 % | 0,87 / 0,84 / 2,5 % | 0,89 / 0,80 / 3,5 % |
| 17M (misma familia) | 0,69 / 0,91 / 0,8 % | 0,75 / 0,85 / 1,8 % | 0,78 / 0,81 / 2,8 % |
| cybersectony/phishing-email-detection-distilbert_v2.4.1 (2 clases, sin spam) | 0,30 / 0,42 / 0,9 % | 0,42 / 0,47 / 1,6 % | 0,54 / 0,50 / 2,9 % |

Nota: los umbrales se ajustaron sobre un conjunto de validación separado de mensajes reales, por lo que la tasa medida en el test puede quedar algo por encima o por debajo del objetivo. El modelo cybersectony fue puntuado por los autores sobre el mismo conjunto de test.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 68,1 M de parámetros; en fp32 ocupa aproximadamente 0,27 GB de pesos, por lo que cabe holgadamente en cualquier GPU consumer (4 GB o más) y también en CPU.
- GPU recomendadas: no requiere GPU; cualquier GPU moderna (RTX 3060 en adelante, A100, H100) sirve para aumentar el throughput. En CPU (8 hilos, fp32) el autor reporta unos 20 ms por texto corto de 63 tokens y unos 105 ms por texto completo de 512 tokens.
- Cabe en GPU consumer: sí, en cualquier tarjeta con al menos 1-2 GB de VRAM libre, e incluso en CPU.
- Opciones de despliegue: transformers (librería nativa), text-embeddings-inference (etiqueta `text-embeddings-inference` en el repo) y endpoints compatibles. El autor incluye un wrapper propio `cbx_phishing.PhishingDetector` con `example.py` y `requirements.txt`.
- Latencia y throughput: los valores anteriores son por texto en CPU; el throughput agregado depende del lote y del hardware, y no se publica una cifra de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Clases | Macro F1 (reales, 2 %) | Licencia |
|---|---|---:|---|---:|---|
| cbx-phishing-detector-68M | 68,1 M | 512 | 3 (legitimate, spam, phishing_scam) | 0,819 | Apache 2.0 |
| cbx-phishing-detector-17M (misma familia) | 17 M (según model card) | 512 | 3 | 0,785 | no disponible en la información |
| cybersectony/phishing-email-detection-distilbert_v2.4.1 | no disponible | no disponible | 2 (sin spam) | no reportado como macro F1 de 3 clases; recall de phishing 0,42 y precisión 0,47 en el punto del 2 % | no disponible |

El modelo de 68M supera al de 17M de la misma familia en macro F1 sobre mensajes reales (0,819 frente a 0,785) y ofrece mayor recall de phishing a costa de una tasa de falsos positivos algo superior. Frente al detector DistilBERT de cybersectony, la comparación directa no es limpia porque este último es binario y no modela spam, pero en el mismo test su recall de phishing en el punto del 2 % es de 0,42 frente a 0,87 del modelo de 68M.

## Limitaciones y advertencias

- Solo inglés: no se ha entrenado ni evaluado en otros idiomas.
- Ventana de 512 tokens: los mensajes más largos se truncan y pueden perder señales relevantes del final del cuerpo.
- La clase `spam` es la más débil (F1 de 0,66), por lo que la frontera entre spam y legítimo es menos fiable que la de phishing.
- La tasa de falsos positivos medida en test puede desviarse del objetivo nominal (1 %, 2 %, 3 %) porque los umbrales se ajustaron sobre validación.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de clasificaciones erróneas: un falso negativo en phishing tiene coste de seguridad y un falso positivo puede ocultar correo legítimo.
- Los resultados en casos difíciles generados (macro F1 de 1,000) proceden de datos sintéticos y no deben extrapolarse a tráfico real.
- No se documentan sesgos específicos en la información disponible; al entrenarse con corpus históricos (Enron, SpamAssassin, Nazario, UCI) puede heredar los sesgos de distribución de esos conjuntos.
- Licencia Apache 2.0: permite uso comercial, pero debe revisarse la sección "Intended use and disclaimer" de la model card antes de desplegarlo en producción.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación independiente de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CobuildX-AI/cbx-phishing-detector-68M
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-68m
- Modelo comparable citado: https://huggingface.co/cybersectony/phishing-email-detection-distilbert_v2.4.1
