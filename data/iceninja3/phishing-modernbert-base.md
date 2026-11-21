# iceninja3/phishing-modernbert-base

## Resumen

Phishing Detection ModernBERT-base es un modelo de clasificación de texto obtenido por fine-tuning de `answerdotai/ModernBERT-base` para la detección de correos electrónicos de phishing. Lo desarrolla el usuario `iceninja3` en el contexto del proyecto de investigación `llm-phishing-detection`, y está pensado como un clasificador binario (legítimo frente a phishing) que se puede integrar en pipelines de seguridad del correo electrónico.

El modelo parte de la arquitectura ModernBERT, un transformer encoder con atención de contexto largo y mejoras de eficiencia respecto a BERT clásico, y conserva sus aproximadamente 149,6 millones de parámetros. Se distribuye en formato safetensors con licencia Apache 2.0, lo que facilita su uso comercial y su despliegue en entornos de producción sin restricciones adicionales.

Su relevancia radica en que ofrece una alternativa ligera y rápida (latencia mediana de 199,5 ms) a los clasificadores tradicionales de spam, con métricas orientadas a un régimen de baja tasa de falsos positivos (recall del 82,0 % a un 1 % de FPR), que es el escenario operativo típico de una bandeja de entrada corporativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder) |
| Parametros totales | 149.606.402 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso trunca a 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `answerdotai/ModernBERT-base`, un transformer encoder de tipo BERT con innovaciones de eficiencia (atención optimizada y soporte de contexto largo en el modelo base). La tarea es de clasificación de secuencias con dos etiquetas: `0` para correo legítimo y `1` para phishing. La entrada esperada en el ejemplo de la model card combina asunto y cuerpo del correo en el formato `Subject: ...\n\n<body>`, truncado a 512 tokens.

No se dispone de información detallada sobre el conjunto de datos de entrenamiento, el número de tokens utilizados, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente en clasificación). La evaluación se realizó sobre el split de test del benchmark `test_llm` del proyecto `llm-phishing-detection`. No se documentan innovaciones técnicas adicionales más allá de las heredadas del modelo base.

## Capacidades

- Clasificación binaria de texto: distingue correo legítimo (`0`) de phishing (`1`).
- Detección de señales típicas de phishing en asunto y cuerpo: urgencia, peticiones de credenciales, URLs sospechosas.
- Salida de probabilidad calibrada mediante softmax sobre los logits, apta para umbrales operativos ajustables.
- Integración sencilla con la librería `transformers` (`AutoModelForSequenceClassification` y `AutoTokenizer`).
- No soporta tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni para uso como agente.
- Capacidades multilingües: no disponibles (no se documentan idiomas soportados).
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Filtrado previo en pasarelas de correo corporativo: el modelo clasifica cada mensaje entrante y asigna una probabilidad de phishing que se puede usar para cuarentena o marcado, con una latencia mediana de 199,5 ms por inferencia.
- Segunda opinión sobre clasificadores de spam existentes: al operar con recall del 82,0 % a un 1 % de FPR, es adecuado como capa complementaria que reduce falsos negativos sin saturar de falsos positivos.
- Análisis de bandejas de entrada de usuarios de alto riesgo (direcciones ejecutivas): se puede desplegar como servicio interno que revisa mensajes en tiempo casi real.
- Enriquecimiento de alertas SOC: la probabilidad de phishing se puede incorporar como señal adicional en el triaje de incidentes reportados por usuarios.
- Investigación en seguridad del correo: permite reproducir y comparar resultados sobre el benchmark `test_llm` del proyecto `llm-phishing-detection`.
- Prototipado rápido de productos antiphishing: al ser un modelo base de 149,6 M de parámetros con licencia Apache 2.0, se puede integrar en MVP sin coste de licencia y con requisitos de hardware modestos.
- Evaluación de campañas de concienciación: clasificar muestras de correos simulados para medir qué señales de ingeniería social detecta el modelo y cuáles no.

## Benchmarks y rendimiento

Evaluación publicada en la model card sobre el split de test del benchmark `test_llm`:

| Metrica | Valor |
|---|---|
| Recall @ 1% FPR | 82,0 % (IC 95 %: 74,5 %–89,1 %) |
| PR-AUC | 0,9893 |
| Latencia de inferencia (p50) | 199,5 ms |

No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, ni comparaciones numéricas con otros modelos de detección de phishing.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,6 GB de pesos, más overhead de activaciones; cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- En fp16/bf16 el modelo ocupa aproximadamente 0,3 GB de pesos, por lo que es viable incluso en CPU para volúmenes moderados.
- GPU recomendadas: cualquier GPU moderna es suficiente; para alto throughput se pueden usar A100, H100, L4 o RTX 4090, aunque el modelo no las necesita para funcionar.
- Cabe en GPUs consumer como RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: `transformers` con PyTorch (uso documentado en la model card); también es compatible con servidores de inferencia habituales para modelos de `transformers` como TGI o vLLM, aunque no se documenta explícitamente en la información disponible.
- Latencia publicada: 199,5 ms de mediana por inferencia. No se proporciona throughput (peticiones por segundo).

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos de detección de phishing en la información proporcionada. Como referencia estructural, se compara con su modelo base:

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| iceninja3/phishing-modernbert-base | 149,6 M | no disponible | Clasificación phishing (2 clases) | Apache 2.0 |
| answerdotai/ModernBERT-base | 149,6 M | no disponible en esta ficha | Modelo base encoder | Apache 2.0 |
| Clasificadores BERT-base fine-tuned para spam | ~110 M | típicamente 512 tokens | Clasificación spam/phishing | variable |

No se identifican en la información disponible alternativas comparables con métricas publicadas sobre el mismo benchmark.

## Limitaciones y advertencias

- Modelo con 0 descargas y 0 likes en Hugging Face: no hay validación independiente por parte de la comunidad.
- El intervalo de confianza del recall es amplio (74,5 %–89,1 %), lo que indica incertidumbre considerable en la métrica principal.
- No se documentan los datos de entrenamiento, por lo que no se puede evaluar el riesgo de sesgo por dominio, idioma o tipo de remitente.
- Riesgo de alucinación no aplicable en sentido estricto (es un clasificador), pero sí de falsos negativos y falsos positivos; un 18 % de phishing no detectado al 1 % de FPR es relevante en producción.
- No se especifican los idiomas soportados; el rendimiento fuera del inglés es desconocido.
- El truncado a 512 tokens en el ejemplo puede descartar parte del cuerpo de correos largos.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base `answerdotai/ModernBERT-base`.
- No debe usarse como único mecanismo de defensa; se recomienda combinarlo con otras señales (reputación de dominios, análisis de adjuntos, autenticación SPF/DKIM/DMARC).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iceninja3/phishing-modernbert-base
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Proyecto de investigación: https://github.com/whilewak/llm-phishing-detection
