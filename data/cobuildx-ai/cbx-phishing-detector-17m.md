# CobuildX-AI/cbx-phishing-detector-17M

## Resumen

cbx-phishing-detector-17M es un clasificador de texto en inglés especializado en la detección de phishing y spam en correo electrónico y SMS. Lo desarrolla CobuildX-AI como un fine-tuning del encoder Ettin de 17M de parámetros (jhu-clsp/ettin-encoder-17m), un transformer encoder de tipo ModernBERT. El modelo resuelve un problema concreto de triaje de mensajes: dado un texto, devuelve una de tres etiquetas (`legitimate`, `spam` o `phishing_scam`) mediante una regla de umbrales configurable que permite fijar la tasa de falsos positivos deseada.

Su relevancia radica en el equilibrio entre tamaño mínimo (16,8M de parámetros, repo de 0,1 GB) y rendimiento útil: alcanza un macro F1 de 0,785 sobre un conjunto de 6.349 mensajes reales nunca vistos en entrenamiento, con latencias de 4 ms para textos cortos y 25 ms para 512 tokens en CPU de 8 hilos. Está pensado para despliegues de bajo coste donde un modelo grande no es viable, como filtros en pasarelas de correo o preprocesado en pipelines de seguridad.

La ventana de contexto es de 512 tokens, suficiente para la mayoría de correos y SMS, y el modelo se distribuye con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. La familia incluye también una variante de 68M con mayor precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, base Ettin encoder 17m) |
| Parametros totales | 16.798.211 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; sin GGUF publicado) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del encoder Ettin de 17M (jhu-clsp/ettin-encoder-17m), un transformer encoder de la familia ModernBERT orientado a tareas de comprensión de texto. La cabeza de clasificación produce tres logits correspondientes a las etiquetas `legitimate`, `spam` y `phishing_scam`, y la decisión final no es un simple argmax: se aplica una regla de umbrales definida en `cbx_config.json` que prioriza `phishing_scam` si su score supera el umbral de phishing, luego `spam` si supera el suyo, y en caso contrario `legitimate`.

El entrenamiento se realizó sobre datos de correo y SMS con los detalles personales sustituidos por placeholders como `[NAME]`, `[EMAIL]` y `[PHONE]`, lo que permite que el modelo generalice a nombres y direcciones reales. La model card no especifica el número de tokens de entrenamiento ni si se emplearon técnicas de RLHF o DPO; se trata de un fine-tuning supervisado de clasificación. La innovación principal es el sistema de puntos de operación (`1%`, `2%` por defecto y `3%`) que fijan la tasa de falsos positivos sobre mensajes legítimos y permiten ajustar el compromiso entre recall y precisión en producción.

## Capacidades

- Clasificación de texto en tres clases: `legitimate`, `spam` y `phishing_scam`.
- Detección de phishing de credenciales, facturas y entregas falsas, señuelos de suspensión de cuenta, estafas de pago por adelantado, premios, inversión y romance.
- Distinción entre spam (promoción abierta sin engaño) y phishing (intento de decepción para obtener credenciales, dinero o datos).
- Procesamiento de email (asunto y cuerpo concatenados como `"Subject: <subject>\n\n<body>"`) y de SMS (texto plano).
- Manejo de enlaces dentro del texto sin necesidad de extracción previa.
- Normalización de datos personales mediante placeholders, con soporte también para nombres y direcciones reales.
- Tres puntos de operación configurables para ajustar la tasa de falsos positivos (1%, 2%, 3%).
- Procesamiento por lotes: acepta una lista de textos y devuelve una lista de resultados.
- Indicador de truncamiento (`"truncated": True`) cuando el texto supera los 512 tokens.
- No dispone de tool calling, capacidades de agente, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Filtrado en pasarelas de correo: integrado como etapa previa al buzón del usuario, clasifica cada mensaje entrante en milisegundos y permite desviar phishing a cuarentena y spam a carpetas separadas, con la tasa de falsos positivos controlada mediante el punto de operación del 1%.
- Moderación de SMS en plataformas de mensajería: el modelo procesa textos cortos en unos 4 ms en CPU, lo que permite clasificar en tiempo real el tráfico de SMS de una aplicación sin depender de GPUs.
- Enriquecimiento de alertas SOC: un equipo de seguridad puede usar el clasificador para priorizar correos reportados por usuarios, etiquetando automáticamente los que son `phishing_scam` antes de la revisión humana.
- Análisis de campañas de phishing a gran escala: sobre un corpus histórico de correos, el modelo etiqueta y agrupa mensajes para medir la prevalencia de campañas y extraer indicadores, con un recall de 0,75 y precisión de 0,85 en el punto del 2%.
- Preprocesado en pipelines de ciberseguridad: como componente ligero dentro de un sistema mayor (SIEM, ticketing), filtra los mensajes que merecen análisis profundo de URLs o adjuntos, reduciendo el volumen que llega a los módulos costosos.
- Aplicaciones de cliente de correo: un plugin local puede ejecutar el modelo en CPU del dispositivo (25 ms para 512 tokens) para advertir al usuario antes de abrir un mensaje sospechoso, sin enviar datos a servidores externos.
- Detección de estafas en soporte al cliente: clasificación de mensajes entrantes en un helpdesk para separar consultas legítimas de intentos de fraude o suplantación.

## Benchmarks y rendimiento

Resultados publicados en la model card. Macro F1 sobre 6.349 mensajes reales (Enron, SpamAssassin, corpus de phishing de Jose Nazario 2025 y UCI SMS Spam) y sobre 600 casos difíciles generados, retenidos del entrenamiento:

| Modelo | Mensajes reales (macro F1) | Casos difíciles generados (macro F1) |
|---|---:|---:|
| 68M (misma familia) | 0,819 | 1,000 |
| **este modelo (17M)** | 0,785 | 0,999 |

F1 por etiqueta sobre mensajes reales: `legitimate` 0,93; `spam` 0,63; `phishing_scam` 0,80.

Puntos de operación sobre mensajes reales (recall / precisión de `phishing_scam` / tasa de falsos positivos medida):

| Modelo | `1%` | `2%` | `3%` |
|---|---:|---:|---:|
| 68M (misma familia) | 0,83 / 0,87 / 1,6% | 0,87 / 0,84 / 2,5% | 0,89 / 0,80 / 3,5% |
| **este modelo (17M)** | 0,69 / 0,91 / 0,8% | 0,75 / 0,85 / 1,8% | 0,78 / 0,81 / 2,8% |
| cybersectony/phishing-email-detection-distilbert_v2.4.1 (2 clases, sin spam) | 0,30 / 0,42 / 0,9% | 0,42 / 0,47 / 1,6% | 0,54 / 0,50 / 2,9% |

Latencia en CPU (8 hilos, fp32): aproximadamente 4 ms para un texto corto de 63 tokens y 25 ms para un texto completo de 512 tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (16,8M de parámetros); en la práctica cabe en cualquier GPU consumer e incluso en memoria unificada de dispositivos de gama baja.
- GPU recomendadas: no requiere GPU; cualquier GPU con al menos 1 GB de memoria libre es suficiente (RTX 3060, RTX 4090, T4, A100, H100).
- Cabe en cualquier GPU consumer y en CPU. La model card reporta 4 ms para 63 tokens y 25 ms para 512 tokens en CPU de 8 hilos en fp32.
- Opciones de despliegue: transformers, Text Embeddings Inference (el repo incluye el tag `text-embeddings-inference` y `endpoints_compatible`), y el paquete propio `cbx_phishing` con la clase `PhishingDetector`. No se publican pesos GGUF, por lo que llama.cpp y Ollama no están soportados de forma directa con los artefactos actuales.
- Throughput: no disponible de forma agregada; a partir de la latencia publicada, un solo hilo de CPU puede procesar del orden de decenas de mensajes cortos por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Macro F1 (reales) | Etiquetas | Licencia |
|---|---|---:|---:|---|---|
| **cbx-phishing-detector-17M** | 16,8M | 512 | 0,785 | 3 (legitimate, spam, phishing_scam) | Apache 2.0 |
| cbx-phishing-detector-68M (misma familia) | 68M | no disponible | 0,819 | 3 | Apache 2.0 (según familia) |
| cybersectony/phishing-email-detection-distilbert_v2.4.1 | no disponible | no disponible | no disponible (recall 0,42 / precisión 0,47 en el punto 2%) | 2 (sin spam) | no disponible |

La variante de 68M de la misma familia obtiene mayor macro F1 (0,819 frente a 0,785) y mejor recall en todos los puntos de operación, a costa de un modelo cuatro veces mayor. El modelo de cybersectony, evaluado por los autores sobre el mismo conjunto de test, muestra un rendimiento notablemente inferior y no distingue spam de phishing.

## Limitaciones y advertencias

- Solo soporta inglés; no se ha validado su comportamiento en otros idiomas.
- Ventana de contexto limitada a 512 tokens: los mensajes más largos se truncan y el contenido posterior se ignora, lo que puede degradar la detección en correos extensos.
- El F1 de la clase `spam` es bajo (0,63) en comparación con las otras dos etiquetas; la frontera entre spam y legítimo es la más difusa.
- El recall de phishing en el punto de operación por defecto (2%) es de 0,75, lo que implica que aproximadamente uno de cada cuatro mensajes de phishing no se detecta.
- La tasa de falsos positivos medida en el conjunto de test puede desviarse de la objetivo (1%, 2%, 3%) porque los umbrales se ajustaron sobre un conjunto de validación distinto.
- Riesgo de alucinación no aplicable en sentido estricto al ser un clasificador, pero sí de clasificaciones erróneas en mensajes ambiguos, especialmente en promociones legítimas con lenguaje agresivo o en notificaciones de seguridad legítimas.
- Los datos de entrenamiento sustituyen datos personales por placeholders; el comportamiento con formatos de email poco habituales o con codificaciones no vistas no está documentado.
- Licencia Apache 2.0: permite uso comercial, pero la model card remite a la sección "Intended use and disclaimer" antes de su uso; debe revisarse para conocer las condiciones exactas.
- El modelo no debe usarse como único mecanismo de defensa: conviene combinarlo con análisis de URLs, adjuntos y reputación de remitente.
- No hay pesos GGUF ni soporte documentado para llama.cpp u Ollama, lo que limita las opciones de despliegue en entornos sin Python.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CobuildX-AI/cbx-phishing-detector-17M
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-17m
- Modelo comparable evaluado: https://huggingface.co/cybersectony/phishing-email-detection-distilbert_v2.4.1
