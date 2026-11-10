# danjai/scamlens-qs-google-bert-v13

## Resumen

ScamLens quick_score google-bert-v13 es un clasificador binario de texto especializado en la detección de estafas en mensajes SMS y de chat. Lo desarrolla el usuario danjai como parte de ScamLens, un agente de investigación de fraudes construido para un proyecto de curso universitario (IS469). El modelo recibe el texto de un mensaje y devuelve la probabilidad de que sea una estafa, con dos etiquetas: 0 para mensaje genuino y 1 para estafa.

Técnicamente se trata de un fine-tuning de google-bert/bert-base-uncased, un transformer encoder de 109,48 millones de parámetros con una longitud máxima de secuencia de 192 tokens. El entrenamiento fue breve (2 épocas, learning rate 3e-05, batch size 4) sobre 1.901 ejemplos, de los cuales 1.522 se destinaron a entrenamiento y 379 a validación, con partición por plantilla de mensaje para evitar fugas de datos.

Su relevancia es acotada y muy específica: no es un modelo de propósito general ni un competidor de los LLM actuales, sino una herramienta de primera opinión dentro de un pipeline mayor. El autor lo presenta explícitamente como uno de los candidatos comparados y no como el modelo que ScamLens usa en producción. Su valor está en el dominio: mensajes en inglés con contexto de Singapur (bancos locales, agencias y servicios de pago).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base, fine-tuning para clasificación de secuencias) |
| Parámetros totales | 109.483.778 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 192 tokens (max_length de entrenamiento) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Modelo base | google-bert/bert-base-uncased |
| Pipeline | text-classification |
| Etiquetas | 0 = genuine, 1 = scam |
| Tamaño del repositorio | 0,4 GB |
| Librería | transformers |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un BERT base estándar (transformer encoder bidireccional) con una cabeza de clasificación de secuencias de dos clases. Se parte de los pesos de google-bert/bert-base-uncased y se hace fine-tuning supervisado con los siguientes hiperparámetros: 2 épocas, learning rate 3e-05, batch size 4, max_length 192, warmup_ratio 0,1, weight_decay 0,01, scheduler lineal, class_weights balanceados, val_ratio 0,2 y semilla 42. No se documenta uso de RLHF, DPO ni técnicas de alineación adicionales; es un ajuste supervisado clásico.

Los datos de entrenamiento son 1.901 ejemplos (1.522 para entrenar, 379 para validar), procedentes del fichero sg_quick_score_train.csv. La composición incluye mensajes de estafa y mensajes genuinos al estilo de Singapur: mensajes tomados o reconstruidos a partir de avisos públicos de fraude, mensajes sintéticos, alertas bancarias generadas en pares genuino/estafa y SMS cotidianos de corpus públicos. La partición de validación se hizo por plantilla de mensaje (1.387 plantillas), de modo que las copias casi idénticas de un mensaje de entrenamiento nunca aparecen en validación. Se proporcionan los SHA-256 de los datos de entrenamiento y de test.

## Capacidades

- Clasificación binaria de texto: asigna una probabilidad de estafa a un mensaje SMS o de chat.
- Detección de fraude basada en el lenguaje: analiza la redacción del mensaje, no metadatos.
- Salida calibrada como probabilidad mediante softmax sobre los logits de las dos clases.
- Integración como herramienta quick_score dentro del agente ScamLens, con umbrales de interpretación: alto desde 0,70, medio desde 0,50 y bajo por debajo.
- Compatible con text-embeddings-inference y endpoints compatibles según los tags del repositorio.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.
- Capacidad multilingüe: no, únicamente inglés.

## Casos de uso

- Filtro de primera pasada en pasarelas de SMS: clasificar mensajes entrantes antes de que lleguen al usuario, usando la probabilidad como señal de triaje y derivando los casos dudosos a revisión humana.
- Enriquecimiento de un agente antifraude: integrarlo como la herramienta quick_score de ScamLens mediante la variable de entorno SCAMLENS_QUICK_SCORE_MODEL, de forma que el agente combine esta puntuación con comprobaciones de enlaces, números y remitentes.
- Moderación en aplicaciones de mensajería: marcar mensajes con probabilidad alta para mostrar advertencias al usuario, dado el bajo coste computacional de un BERT base.
- Investigación académica sobre detección de fraude: servir como línea base reproducible (semilla 42, datos con hash publicado) frente a la que comparar modelos mayores o enfoques con más señales.
- Análisis de corpus de mensajes: puntuar lotes de SMS o chats históricos para estudiar la prevalencia de lenguaje de estafa en un conjunto de datos.
- Prototipado rápido en local: al ser un modelo de 109 millones de parámetros y 0,4 GB, permite experimentar en una sola GPU de consumo o incluso en CPU para volúmenes moderados.
- Prefiltro en sistemas de atención al cliente: detectar mensajes de usuarios que reenvían posibles estafas y enrutarlos a un flujo especializado.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card:

| Métrica | Valor |
|---|---|
| F1 en validación | 0,953 |
| Exactitud en test | 0,893 (IC 95 %: 0,839–0,931) |
| Recall de estafa en test | 0,865 (IC 95 %: 0,787–0,918) |
| Precisión de estafa en test | 0,947 (IC 95 %: 0,883–0,977) |
| F1 en test | 0,905 |
| Mensajes genuinos clasificados como estafa | 5 de 74 |
| Estafas no detectadas | 14 de 104 |

El conjunto de test son 178 mensajes de Singapur escritos a mano que no aparecen en los datos de entrenamiento; se considera estafa a partir de una probabilidad de 0,50. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5–1 GB en fp32 para los 109,5 millones de parámetros, más el overhead del runtime; en fp16 baja a unos 0,25 GB de pesos.
- GPU recomendadas: cualquier GPU moderna sirve; el modelo no requiere A100 ni H100. Una RTX 4090, RTX 3090 o incluso una GTX 1660 son suficientes.
- Cabe holgadamente en GPU de consumo e incluso puede ejecutarse en CPU para volúmenes moderados.
- Opciones de despliegue: transformers (código de ejemplo de la model card), text-embeddings-inference y endpoints compatibles según los tags; no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| danjai/scamlens-qs-google-bert-v13 | 109,5 M | 192 tokens | Clasificación de estafas SMS (inglés, Singapur) | No disponible | Hugging Face, 0 descargas |
| google-bert/bert-base-uncased | 110 M | 512 tokens | Modelo base de propósito general | Apache 2.0 (según el modelo original) | Hugging Face, ampliamente usado |
| Otros clasificadores de spam o fraude | No disponible | No disponible | Clasificación de spam o fraude | No disponible | No disponible |

La comparación directa con alternativas especializadas en detección de estafas no está disponible en la información proporcionada. Frente a su modelo base, este fine-tuning añade la tarea específica y reduce la longitud máxima de secuencia a 192 tokens.

## Limitaciones y advertencias

- Solo juzga la redacción: no comprueba enlaces, números de teléfono ni remitentes. En ScamLens esas comprobaciones son herramientas separadas y esta puntuación es solo una primera opinión.
- Entrenado con mensajes en inglés y contexto de Singapur (bancos, agencias y servicios de pago locales); se espera un rendimiento menor en otros países o variantes del inglés.
- El conjunto de test es pequeño (178 mensajes), por lo que los intervalos de confianza son amplios.
- El autor advierte explícitamente de que no debe usarse en solitario para bloquear o acusar a nadie.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar al autor.
- Riesgo de alucinación en el sentido de falsos positivos y falsos negativos: 5 de 74 mensajes genuinos se marcaron como estafa y 14 de 104 estafas no se detectaron en el test.
- Contexto limitado a 192 tokens, insuficiente para mensajes o hilos largos.
- Sin datos publicados de sesgos específicos más allá de la limitación geográfica y lingüística.
- Modelo de proyecto académico con 0 descargas y 0 likes: no hay evidencia de uso en producción ni mantenimiento continuado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/danjai/scamlens-qs-google-bert-v13
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
