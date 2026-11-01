# Adityapande403/IndicMix-AI

## Resumen

IndicMix AI es un modelo de clasificación de texto de muy bajo peso desarrollado por Adityapande403, orientado al procesamiento de lenguaje natural en lenguas indias con mezcla de códigos (code-mixing). Cubre variantes como hinglish, telgish, benglish e inglés indio, además de los alfabetos nativos devanagari, telugu y bengalí. El modelo resuelve dos problemas concretos: la clasificación de intenciones en atención al cliente (12 categorías) y la sanitización de datos personales (PII) antes de enviar texto a un LLM de mayor tamaño.

La relevancia del modelo reside en su tamaño extremo y su latencia: el artefacto INT8 en ONNX ocupa 222,8 KB y alcanza una latencia P50 de 0,046 ms en CPU (unos 47.600 req/s), lo que lo hace apto para despliegue en el edge, pasarelas de privacidad y enrutamiento de soporte. No es un modelo generativo ni un transformer de gran escala; se trata de un clasificador ligero con priors léxicos y salvaguardas de entidades.

El repositorio tiene 22 descargas y 0 likes en el momento de la consulta, con un tamaño de 0,0 GB. La información disponible no detalla la arquitectura interna ni el volumen de datos de entrenamiento, por lo que varios apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (clasificador ligero; artefactos PyTorch y ONNX) |
| Parametros totales | No disponible (modelo INT8 ONNX de 222,8 KB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP32 ONNX (877 KB) e INT8 ONNX (222 KB) |
| Idiomas soportados | Hindi (hi), telugu (te), bengali (bn), inglés (en); variantes code-mixed hinglish, telgish, benglish |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch y ONNX (model_quantized.onnx, config.json, vocab.json) |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura interna del clasificador. Se describe como un motor NLP ultraligero con priors léxicos para escritura romanizada y nativa, calibración de temperaturas (Temperature Scaling) para las 12 categorías de intención y dos salvaguardas: preservación de entidades y preservación de polaridad semántica/negación. El pipeline declarado es `text-classification` y los artefactos distribuidos son un modelo PyTorch y dos exportaciones ONNX (FP32 e INT8).

No se detalla el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO. Sí se menciona la implementación del algoritmo de checksum Verhoeff (grupo diédrico D5) para verificar Aadhaar de 12 dígitos, y la preservación de entidades financieras como identificadores de pedido e importes en rupias (por ejemplo, ₹1500). La reducción de tamaño del INT8 frente al FP32 es del 74 %, con una concordancia entre ambas versiones del 99,3 %.

## Capacidades

- Clasificación de intención en 12 categorías de soporte al cliente: account_access, cancellation_request, complaint, delivery_issue, greeting, order_status, payment_issue, product_question, refund_request, subscription_issue, technical_support y unknown.
- Detección y redacción bidireccional de PII con marcadores numerados ([NAME_1], [PHONE_1], [UPI_1]).
- Verificación de Aadhaar de 12 dígitos mediante checksum Verhoeff (D5).
- Preservación de entidades financieras: identificadores de pedido e importes en rupias.
- Anonimización y desanonimización de respuestas de LLM mediante session_id.
- Normalización de texto con salvaguardas de entidad y de polaridad semántica/negación.
- Procesamiento de texto code-mixed en escritura romana y nativa (devanagari, telugu, bengalí).
- Inferencia en CPU vía ONNX Runtime y SDK Python `indicmix`.
- No dispone de generación de texto, razonamiento libre, visión, audio ni tool calling.

## Casos de uso

- Pasarela de privacidad previa a un LLM: el proxy `EnterprisePrivacyProxy` anonimiza nombres, teléfonos y UPI antes de enviar la consulta a un modelo mayor y desanonimiza la respuesta con el session_id, reduciendo la exposición de datos personales en producción.
- Enrutamiento de tickets de soporte: el clasificador asigna una de las 12 intenciones a cada mensaje entrante en hinglish, telgish o benglish, lo que permite dirigir el ticket al equipo adecuado con una latencia de 0,046 ms por inferencia.
- Moderación de toxicidad y clasificación de texto en foros o chats: el pipeline `text-classification` permite etiquetar contenido en lenguas indias mezcladas con inglés, un caso poco cubierto por modelos genéricos.
- Verificación de identidad en onboarding: el checksum Verhoeff sobre Aadhaar permite descartar números inválidos antes de persistirlos, combinado con la redacción de PII.
- Despliegue en edge y dispositivos con recursos limitados: el artefacto INT8 de 222,8 KB cabe en memoria de microcontroladores o gateways y alcanza 1.400 req/s en pipeline completo en CPU Intel.
- Cumplimiento y auditoría de datos: la preservación de importes e identificadores de pedido permite registrar conversaciones sanitizadas sin perder trazabilidad financiera.
- Normalización de texto multilingüe en buscadores internos: las salvaguardas de negación y entidad evitan que la normalización invierta el sentido de frases como cancelaciones o quejas.

## Benchmarks y rendimiento

Datos publicados en la model card, medidos en Windows 11 sobre CPU Intel:

| Metrica | Resultado |
|---|---|
| Tamano INT8 ONNX | 222,8 KB (74 % de reducción frente a FP32) |
| Concordancia INT8 vs FP32 | 99,3 % |
| Latencia solo modelo (P50) | 0,046 ms (~47.600 req/s) |
| Latencia pipeline completo (P50) | 0,685 ms (1.400 req/s) |
| Latencia proxy de privacidad (P50) | 0,069 ms (14.700 req/s) |
| Macro-F1 de intención (test estratificado) | 1,0000 |
| F1 de coincidencia exacta de PII | 1,0000 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, lo que es coherente con un clasificador y no con un modelo generativo.

## Requisitos de hardware

- VRAM estimada: no aplica; la inferencia es en CPU con ONNX Runtime.
- GPU recomendadas: no necesarias; el modelo INT8 de 222,8 KB no requiere acelerador.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU; el requisito es memoria RAM mínima para cargar el runtime de ONNX.
- Opciones de despliegue: ONNX Runtime (recomendado), runner Python standalone (`infer.py`) y SDK `indicmix`.
- Latencia y throughput: 0,046 ms P50 solo modelo, 0,685 ms P50 pipeline completo y 0,069 ms P50 en proxy de privacidad, según mediciones del autor en CPU Intel.
- No se documentan requisitos para vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo generativo.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (clasificadores code-mixed indic con redacción de PII) ni datos de rendimiento de terceros.

## Limitaciones y advertencias

- El modelo card no documenta sesgos conocidos; al operar sobre lenguas indias y code-mixing, es previsible que herede sesgos de los datos de entrenamiento, que no se detallan.
- Riesgo de alucinación no aplica en sentido generativo, pero la clasificación puede fallar en textos fuera de la taxonomía, que se etiquetan como `unknown`.
- La longitud de contexto no está especificada, lo que impide garantizar el comportamiento en documentos largos.
- El soporte se limita a hindi, telugu, bengalí e inglés; otras lenguas indias no están cubiertas.
- El Macro-F1 de 1,0000 y el F1 de PII de 1,0000 proceden de evaluaciones del propio autor y deben interpretarse con cautela hasta que exista validación independiente.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la procedencia de los datos de entrenamiento, no documentada.
- El repositorio tiene un tamaño de 0,0 GB y 22 descargas, lo que sugiere un proyecto incipiente; la madurez y el mantenimiento no están garantizados.
- El checksum Verhoeff valida el formato de Aadhaar, no la autenticidad del número frente a registros oficiales.

## Enlaces

- HuggingFace: https://huggingface.co/Adityapande403/IndicMix-AI
- GitHub: https://github.com/adityapande403/Indic-mix-AI
