# abdurrafaykhann123/roman-urdu-bakery-classifier

## Resumen

Roman Urdu bakery classifier es un modelo de clasificación de texto desarrollado por abdurrafaykhann123, afinado a partir de `FacebookAI/xlm-roberta-base`. Su función es predecir simultáneamente la intención (9 clases: pedido, precio o menú, entrega o zona, estado del pedido, queja, tarta personalizada, pago, saludo o agradecimiento, otro) y el estado de ánimo (4 clases: contento, neutro, descontento, enfadado) de mensajes de clientes enviados a una panadería por WhatsApp. Está diseñado para funcionar con inglés, urdu en caracteres latinos (roman urdu), urdu en escritura nativa y texto con mezcla de idiomas (code-mixed).

El modelo aborda un problema práctico de las pequeñas empresas de alimentación: clasificar automáticamente el flujo de mensajes entrantes para mostrarlos en un panel de administración y marcar a los clientes enfadados para que los atienda una persona. Se trata de un encoder transformer de unos 278 millones de parámetros, derivado de XLM-RoBERTa base, con licencia Apache 2.0 y pesos en safetensors y ONNX.

La relevancia actual del modelo radica en su enfoque en el roman urdu, una variante lingüística muy extendida en la comunicación digital de Pakistán y la India pero escasamente cubierta por los modelos multilingües convencionales. El autor publica una evaluación comparativa frente a alternativas basadas en LLM (Gemini Flash Lite, Qwen) y modelos clásicos (TF-IDF), con métricas desglosadas por idioma y por origen del texto de prueba.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base), clasificación multietiqueta con dos cabezas (intención y estado de ánimo) |
| Parámetros totales | No disponible (el modelo base XLM-RoBERTa base tiene ~278 M; el repo ocupa 2,5 GB) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base; no especificada en la model card) |
| Tipos de cuantización | FP32 y ONNX INT8 (por tensor y per-channel) según la evaluación publicada |
| Idiomas soportados | Inglés (en) y urdu (ur), incluyendo roman urdu y texto code-mixed |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors y ONNX |

## Arquitectura y entrenamiento

El modelo se construye sobre `FacebookAI/xlm-roberta-base`, un encoder transformer multilingüe, al que se añaden dos cabezas de clasificación: una para las 9 intenciones y otra para los 4 estados de ánimo. El pipeline declarado es `text-classification` y la librería es `transformers`, con exportación adicional a ONNX para inferencia en CPU.

Los datos de entrenamiento combinan mensajes del dominio de panadería generados con modelos de lenguaje a partir de hechos ficticios de "Sweet Crumbs Bakery", con etiquetas solicitadas y verificadas por muestreo (no gold humano), y texto público de sentimiento en roman urdu (UCI Roman Urdu Data Set, CC BY 4.0) como señal débil para el estado de ánimo. Se aplicaron aumentos de datos con variantes ortográficas, omisión de vocales, erratas, cambio de código y emojis. El conjunto de prueba es de 275 mensajes etiquetados a ciegas por el mantenedor: 223 escritos por IA (Claude) y 52 escritos por humanos, y nunca se usó para entrenamiento ni para ejemplos de prompt. No se especifica en la información disponible el número de tokens de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Clasificación de intención en 9 clases para mensajes de clientes de panadería: pedido, precio o menú, entrega o zona, estado del pedido, queja, tarta personalizada, pago, saludo o agradecimiento y otro.
- Clasificación de estado de ánimo en 4 clases: contento, neutro, descontento y enfadado.
- Procesamiento de inglés, roman urdu, urdu en escritura nativa y texto con mezcla de idiomas.
- Robustez ante variantes ortográficas, omisión de vocales, erratas, cambio de código y emojis, gracias al aumento de datos.
- Salida en JSON válido en el 100 % de los casos evaluados (1.000 ± 0.000 de validez JSON según la tabla de resultados).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.

## Casos de uso

- Etiquetado de mensajes entrantes en WhatsApp: el modelo clasifica cada mensaje por intención y estado de ánimo para mostrarlo en un panel de administración de la panadería, permitiendo priorizar pedidos, consultas de precio o quejas.
- Marcado de clientes enfadados para atención humana: la clase "angry" actúa como señal para que un operador revise el caso, manteniendo siempre a una persona en el bucle y sin decisiones automáticas sobre el cliente.
- Enrutamiento de consultas de entrega o zona: los mensajes clasificados como "delivery_or_area" pueden dirigirse a la persona o cola adecuada para responder con la información de reparto.
- Gestión de pedidos personalizados: la clase "custom_cake" permite identificar solicitudes de tartas personalizadas y derivarlas a un flujo específico de cotización y diseño.
- Seguimiento del estado de pedidos: los mensajes de "order_status" se agrupan para que el personal consulte el estado y responda con información actualizada.
- Análisis de sentimiento del cliente a pequeña escala: la clasificación de estado de ánimo permite agregar la percepción de los clientes a lo largo del tiempo y detectar patrones de insatisfacción.
- Filtrado de saludos y agradecimientos: la clase "greeting_or_thanks" permite responder automáticamente o archivar mensajes de cortesía sin intervención humana.
- Evaluación de bajo coste en CPU: con la versión ONNX INT8 (11,0 ms por mensaje y 278,3 MB) puede desplegarse en hardware modesto para un volumen pequeño de mensajes.

## Benchmarks y rendimiento

Resultados sobre el conjunto de prueba de 275 mensajes (223 escritos por IA y 52 por humanos), con media ± desviación estándar entre semillas cuando se indica:

| Modelo | Semillas | Intent acc | Intent macro-F1 | Mood acc | Mood macro-F1 | JSON válido | CPU ms/msg | Tamaño MB | $ / 1k |
|---|---|---|---|---|---|---|---|---|---|
| encoder | 3 | 0,767 ± 0,022 | 0,771 ± 0,021 | 0,721 ± 0,023 | 0,671 ± 0,019 | 1,000 ± 0,000 | n/a | 1112,2 ± 0,0 | 0,0001 ± 0,0000 |
| groq_few-gemini-flashlite | 1 | 0,920 | 0,923 | 0,938 | 0,929 | 1,000 | n/a | n/a | 1,0580 |
| groq_zero-gemini-flashlite | 1 | 0,891 | 0,895 | 0,945 | 0,937 | 0,985 | n/a | n/a | 0,3198 |
| groq_zero-qwen27b | 1 | 0,902 | 0,903 | 0,927 | 0,877 | 1,000 | n/a | n/a | 0,3199 |
| lora | 3 | 0,736 ± 0,018 | 0,745 ± 0,015 | 0,693 ± 0,018 | 0,665 ± 0,019 | 1,000 ± 0,000 | n/a | n/a | 0,0187 ± 0,0002 |
| lora-ollama-q8-cpu | 1 | 0,775 | 0,781 | 0,767 | 0,714 | 1,000 | 3866,2 | 1646,6 | 0,0430 |
| tfidf | 3 | 0,680 ± 0,000 | 0,693 ± 0,000 | 0,687 ± 0,000 | 0,645 ± 0,000 | 1,000 ± 0,000 | 1,5 ± 0,0 | 10,3 ± 0,0 | 0,0000 ± 0,0000 |
| xlmr-onnx-fp32-cpu | 1 | 0,778 | 0,782 | 0,731 | 0,681 | 1,000 | 34,9 | 1110,1 | 0,0004 |
| xlmr-onnx-int8-cpu | 1 | 0,691 | 0,694 | 0,604 | 0,567 | 1,000 | 11,0 | 278,3 | 0,0001 |
| xlmr-onnx-int8-perchannel-cpu | 1 | 0,698 | 0,705 | 0,618 | 0,577 | 1,000 | 12,5 | 855,9 | 0,0001 |
| xlmr-torch-fp32-cpu | 1 | 0,778 | 0,782 | 0,731 | 0,681 | 1,000 | 53,0 | 1129,3 | 0,0006 |

Intent macro-F1 por idioma (n = mensajes):

| Modelo | inglés (n) | roman_urdu (n) | urdu_script (n) | mixed (n) |
|---|---|---|---|---|
| encoder | 0,846 ± 0,034 (81) | 0,684 ± 0,024 (91) | 0,549 ± 0,060 (53) | 0,938 ± 0,021 (50) |
| groq_few-gemini-flashlite | 0,925 (81) | 0,850 (91) | 0,959 (53) | 0,990 (50) |
| groq_zero-gemini-flashlite | 0,904 (81) | 0,819 (91) | 0,918 (53) | 0,977 (50) |
| groq_zero-qwen27b | 0,890 (81) | 0,823 (91) | 0,936 (53) | 0,985 (50) |
| lora | 0,850 ± 0,012 (81) | 0,659 ± 0,009 (91) | 0,468 ± 0,045 (53) | 0,878 ± 0,013 (50) |
| lora-ollama-q8-cpu | 0,850 (81) | 0,724 (91) | 0,547 (53) | 0,949 (50) |
| tfidf | 0,760 ± 0,000 (81) | 0,665 ± 0,000 (91) | 0,294 ± 0,000 (53) | 0,787 ± 0,000 (50) |
| xlmr-onnx-fp32-cpu | 0,823 (81) | 0,706 (91) | 0,593 (53) | 0,961 (50) |
| xlmr-onnx-int8-cpu | 0,756 (81) | 0,603 (91) | 0,514 (53) | 0,805 (50) |
| xlmr-onnx-int8-perchannel-cpu | 0,752 (81) | 0,651 (91) | 0,524 (53) | 0,775 (50) |
| xlmr-torch-fp32-cpu | 0,823 (81) | 0,706 (91) | 0,593 (53) | 0,961 (50) |

Mood macro-F1 por idioma:

| Modelo | inglés (n) | roman_urdu (n) | urdu_script (n) | mixed (n) |
|---|---|---|---|---|
| encoder | 0,676 ± 0,030 (81) | 0,650 ± 0,023 (91) | 0,593 ± 0,108 (53) | 0,652 ± 0,042 (50) |
| groq_few-gemini-flashlite | 0,912 (81) | 0,930 (91) | 0,933 (53) | 0,922 (50) |
| groq_zero-gemini-flashlite | 0,952 (81) | 0,934 (91) | 0,899 (53) | 0,922 (50) |
| groq_zero-qwen27b | 0,877 (81) | 0,851 (91) | 0,877 (53) | 0,922 (50) |
| lora | 0,701 ± 0,010 (81) | 0,655 ± 0,029 (91) | 0,598 ± 0,032 (53) | 0,586 ± 0,053 (50) |
| lora-ollama-q8-cpu | 0,776 (81) | 0,654 (91) | 0,684 (53) | 0,624 (50) |
| tfidf | 0,642 ± 0,000 (81) | 0,719 ± 0,000 (91) | 0,535 ± 0,000 (53) | 0,603 ± 0,000 (50) |
| xlmr-onnx-fp32-cpu | 0,676 (81) | 0,625 (91) | 0,696 (53) | 0,698 (50) |
| xlmr-onnx-int8-cpu | 0,587 (81) | 0,514 (91) | 0,559 (53) | 0,560 (50) |
| xlmr-onnx-int8-perchannel-cpu | 0,591 (81) | 0,527 (91) | 0,567 (53) | 0,588 (50) |
| xlmr-torch-fp32-cpu | 0,676 (81) | 0,625 (91) | 0,696 (53) | 0,698 (50) |

Mensajes escritos por IA frente a escritos por humanos (intent F1 / mood F1):

| Modelo | ai_written (n) | human (n) |
|---|---|---|
| encoder | 0,805 ± 0,021 / 0,640 ± 0,025 (223) | 0,607 ± 0,020 / 0,759 ± 0,011 (52) |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en FP32 ocupa aproximadamente 1,1 GB (1112,2 MB según la tabla); en ONNX INT8 baja a unos 278,3 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para FP32; no se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU de consumo: sí, dado su tamaño reducido, aunque la model card no detalla GPU concretas.
- Opciones de despliegue: `transformers` (PyTorch) y ONNX Runtime; la evaluación incluye variantes ONNX FP32 e INT8 en CPU y una variante LoRA servida con Ollama en cuantización Q8.
- Latencia y throughput: en CPU, 53,0 ms por mensaje en PyTorch FP32, 34,9 ms en ONNX FP32, 11,0 ms en ONNX INT8 y 12,5 ms en ONNX INT8 per-channel; la variante LoRA en Ollama Q8 tarda 3866,2 ms por mensaje. No se dispone de datos de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Tipo | Intent macro-F1 | Mood macro-F1 | CPU ms/msg | Tamaño MB | Licencia |
|---|---|---|---|---|---|---|
| Roman Urdu bakery classifier (encoder) | Encoder XLM-R fine-tuned | 0,771 ± 0,021 | 0,671 ± 0,019 | n/a (53,0 en FP32) | 1112,2 | Apache 2.0 |
| groq_few-gemini-flashlite | LLM con few-shot | 0,923 | 0,929 | n/a | n/a | No disponible |
| groq_zero-qwen27b | LLM zero-shot | 0,903 | 0,877 | n/a | n/a | No disponible |
| tfidf | Modelo clásico | 0,693 ± 0,000 | 0,645 ± 0,000 | 1,5 ± 0,0 | 10,3 | No disponible |
| lora | LoRA sobre LLM | 0,745 ± 0,015 | 0,665 ± 0,019 | n/a | n/a | No disponible |

El encoder supera al TF-IDF y al LoRA en macro-F1 de intención y estado de ánimo, pero queda por debajo de las alternativas basadas en LLM (Gemini Flash Lite y Qwen 27B) en precisión global, a costa de un coste por 1.000 mensajes muy inferior (0,0001 USD frente a 0,3198-1,0580 USD).

## Limitaciones y advertencias

- Las etiquetas de entrenamiento son generadas por LLM y verificadas por muestreo, no gold humano; pueden contener errores sistemáticos.
- El conjunto de prueba es mayoritariamente sintético (223 de 275 mensajes escritos por Claude); en la parte escrita por humanos el rendimiento de intención baja a 0,607 de F1, lo que sugiere peor generalización a texto real.
- El rendimiento en urdu en escritura nativa es el más bajo (0,549 de macro-F1 en intención para el encoder), frente a 0,846 en inglés y 0,938 en texto mixto.
- El modelo está entrenado para el dominio de una panadería ficticia; su uso en otros negocios requiere reevaluación.
- Fuera de alcance: mensajes médicos o legales, idiomas distintos del inglés y el urdu, moderación o cualquier decisión que afecte al acceso de una persona a un servicio, y uso sobre chats privados sin consentimiento.
- El marcado de clientes enfadados es solo una señal para revisión humana, no una decisión automática sobre el cliente.
- No se documentan sesgos específicos ni tasas de alucinación; al ser un clasificador, el riesgo principal es la clasificación errónea, no la generación de texto.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los datos públicos subyacentes pueden tener sus propias condiciones; el UCI Roman Urdu Data Set es CC BY 4.0.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la model card indica que falta el enlace al repositorio de código, datos y evaluación.

## Enlaces

- Hugging Face: https://huggingface.co/abdurrafaykhann123/roman-urdu-bakery-classifier
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- UCI Roman Urdu Data Set (CC BY 4.0): no disponible el enlace directo en la información proporcionada
- Repositorio de código, datos y evaluación: no disponible (la model card indica "add repository link")
