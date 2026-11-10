# danjai/scamlens-qs-google-bert-v12

## Resumen

ScamLens quick_score google-bert-v12 es un clasificador binario de texto que estima la probabilidad de que un SMS o mensaje de chat sea una estafa. Lo desarrolla el usuario danjai en el contexto de ScamLens, un agente de investigacion de fraudes construido como proyecto de curso universitario (IS469), y se publica como uno de los modelos candidatos evaluados, no como el modelo que el agente usa en produccion. El modelo parte de google-bert/bert-base-uncased y se afina para clasificacion de secuencias con dos etiquetas: 0 = genuino y 1 = estafa.

Tecnicamente es un BERT base encoder-only con 109.483.778 parametros totales, un maximo de 192 tokens de entrada durante el entrenamiento y pesos en formato safetensors. Su interes practico es acotado pero concreto: demuestra un flujo de evaluacion riguroso para deteccion de fraude por SMS en el contexto de Singapur, con separacion de validacion por plantilla de mensaje y un conjunto de test escrito a mano que nunca aparece en entrenamiento.

La relevancia actual es la de un artefacto de referencia reproducible: datos con hash SHA-256, hiperparametros documentados, intervalos de confianza al 95% y una calibracion operativa explicita (alto desde 0,70, medio desde 0,50, bajo por debajo). No es un modelo de proposito general ni compite en razonamiento; es un componente especializado de scoring rapido dentro de un pipeline mayor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (BERT base) |
| Parametros totales | 109.483.778 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 192 tokens (max_length de entrenamiento); limite arquitectonico de BERT base no especificado en la informacion disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors sin variantes cuantizadas) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | google-bert/bert-base-uncased |
| Tarea | text-classification (binaria: 0 = genuino, 1 = estafa) |
| Tamano del repositorio | 0,4 GB |
| Libreria | transformers |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un BERT base estandar (encoder bidireccional de 12 capas, hidden size 768, 12 cabezas de atencion, 110M parametros) con una cabeza de clasificacion de secuencias de dos clases anadida sobre el token [CLS]. No hay innovaciones arquitectonicas: el valor esta en el regimen de ajuste fino y en la construccion del dataset.

El entrenamiento usa 1901 ejemplos en total, divididos en 1522 para entrenamiento y 379 para validacion, con 2 epocas, learning rate 4e-05, batch size 8, max_length 192, warmup_ratio 0,1, weight decay 0,01, scheduler lineal, class_weights balanceados, val_ratio 0,2 y semilla 42. La validacion se separa por plantilla de mensaje (1387 plantillas), de modo que las copias casi identicas de un mensaje de entrenamiento nunca caen en validacion; esto evita la fuga de informacion tipica en datasets de SMS sinteticos. Los datos son mensajes de estafa y genuinos al estilo de Singapur: avisos publicos de fraude, mensajes sinteticos, alertas bancarias generadas en pares genuino/estafa y SMS cotidianos de corpus publicos. Se documentan los hashes SHA-256 de entrenamiento (`a347f8eb...`) y de test (`7ffae3e4...`), lo que permite verificar la procedencia de los datos. No se menciona RLHF, DPO ni ninguna fase de alineacion adicional.

## Capacidades

- Clasificacion binaria de texto: devuelve la probabilidad de estafa mediante softmax sobre los logits, con etiquetas 0 = genuino y 1 = estafa.
- Deteccion de fraude por redaccion en SMS y mensajes de chat, orientada a estafas de banca, agencias y servicios de pago de Singapur.
- Inferencia rapida y ligera: 110M parametros y contexto de 192 tokens, adecuado para scoring de baja latencia en linea.
- Integracion como herramienta `quick_score` dentro del agente ScamLens, configurable mediante la variable de entorno `SCAMLENS_QUICK_SCORE_MODEL`.
- Uso directo con la API de `transformers` (`AutoModelForSequenceClassification` y `AutoTokenizer`).
- No soporta tool calling, function calling, razonamiento multi-paso, agentes autonomos, vision, audio ni modo thinking.
- Capacidad multilingue: no disponible; solo se documenta ingles.

## Casos de uso

- Filtro de primera pasada en pasarelas de SMS: el modelo puntua cada mensaje entrante y descarta o marca como sospechosos los que superan el umbral de 0,50, reduciendo el volumen que llega a revisiones mas costosas. Su latencia baja y su tamano de 0,4 GB lo hacen viable en un servicio de alta concurrencia.
- Scoring previo en un agente antifraude: dentro de ScamLens, `quick_score` aporta una primera opinion sobre la redaccion antes de que otras herramientas analicen enlaces, numeros de telefono y remitentes, tal como describe el autor.
- Etiquetado asistido para equipos de moderacion: el modelo preclasifica colas de mensajes reportados por usuarios y prioriza los casos con probabilidad alta (desde 0,70), que el autor define como nivel alto.
- Investigacion academica y docencia: sirve como linea base reproducible para experimentos de deteccion de fraude, con dataset, hiperparametros y hashes documentados, y con separacion por plantilla para evitar fugas.
- Avisos automaticos en aplicaciones de banca movil: el modelo puede generar alertas contextuales en la interfaz cuando el usuario pega o recibe un SMS sospechoso, siempre como senal complementaria y nunca como bloqueo automatico.
- Analisis de corpus historicos: permite puntuar lotes de SMS ya almacenados para estudiar la evolucion de las tacticas de estafa, dado que solo requiere truncar a 192 tokens y ejecutar inferencia por lotes en CPU o GPU modesta.
- Prototipado rapido de productos antifraude: al ser un BERT base con safetensors y API estandar de `transformers`, se integra en pipelines existentes con `text-embeddings-inference` o endpoints compatibles sin trabajo de conversion.

## Benchmarks y rendimiento

| Metrica | Valor | Intervalo de confianza 95% |
|---|---|---|
| F1 en validacion | 0,951 | no disponible |
| Accuracy en test | 0,904 | 0,852 - 0,940 |
| Recall de estafa en test | 0,894 | 0,820 - 0,940 |
| Precision de estafa en test | 0,939 | 0,874 - 0,972 |
| F1 en test | 0,916 | no disponible |
| Mensajes genuinos clasificados como estafa | 6 de 74 | no disponible |
| Estafas no detectadas | 11 de 104 | no disponible |

El conjunto de test son 178 mensajes de Singapur escritos a mano que no aparecen en los datos de entrenamiento; se cuenta como estafa a partir de una probabilidad de 0,50. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB solo para pesos (109,5M parametros x 4 bytes), mas activaciones y overhead del runtime; en la practica cabe holgadamente en cualquier GPU consumer con 2 GB o mas.
- En fp16: alrededor de 0,22 GB de pesos, con precision numerica suficiente para clasificacion.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Para alto throughput, cualquier GPU moderna (T4, L4, RTX 3060 en adelante, A100, H100) sirve, aunque el cuello de botella sera la red y no el computo.
- Cabe en GPU consumer: si, en practicamente todas, incluidas integradas con suficiente memoria compartida para el modelo en CPU.
- Opciones de despliegue: `transformers` en Python, `text-embeddings-inference` (el repositorio incluye el tag), endpoints compatibles y cualquier servidor que cargue safetensors de `transformers`. No se publican pesos GGUF, por lo que llama.cpp y Ollama no estan soportados de forma nativa sin conversion.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo y el contexto de 192 tokens, se espera latencia de milisegundos por peticion en GPU y de decenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| danjai/scamlens-qs-google-bert-v12 | 109,5M | 192 tokens | Clasificacion de estafa SMS (Singapur, ingles) | no disponible | Hugging Face, 0 descargas |
| google-bert/bert-base-uncased | 110M | 512 tokens | Modelo base general (MLM) | Apache 2.0 (segun el modelo original, no confirmado en esta ficha) | Hugging Face, ampliamente usado |
| Otros clasificadores de spam o phishing SMS | no disponible | no disponible | Clasificacion binaria de mensajes | no disponible | no disponible |

La comparacion relevante es con el modelo base: este fine-tuning reduce el contexto efectivo de 512 a 192 tokens, anade una cabeza de dos clases y especializa el modelo en un dominio muy concreto (mensajes de Singapur en ingles). Frente a clasificadores genericos de spam, la diferencia esta en el dataset y en la evaluacion por plantilla, no en la arquitectura. No se dispone de datos publicados de modelos comparables en la misma categoria para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Solo evalua la redaccion del mensaje: no comprueba enlaces, numeros de telefono ni remitentes. El propio autor indica que esas comprobaciones son herramientas separadas de ScamLens y que esta puntuacion es solo una primera opinion.
- Entrenado con mensajes en ingles del contexto de Singapur (bancos, agencias y servicios de pago locales); se espera menor fiabilidad fuera de ese contexto.
- El conjunto de test es pequeno (178 mensajes), por lo que los intervalos de confianza son amplios y las metricas deben tomarse con cautela.
- Tasa de falsos positivos observable: 6 de 74 mensajes genuinos se clasificaron como estafa; en un despliegue real esto implica friccion para usuarios legitimos.
- Tasa de falsos negativos: 11 de 104 estafas no se detectaron con el umbral de 0,50.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar al autor.
- No debe usarse de forma aislada para bloquear cuentas o acusar a personas, tal como advierte el autor.
- Modelo candidato de un proyecto de curso, no el modelo que ScamLens usa en produccion; su madurez y mantenimiento no estan garantizados.
- Sin soporte multilingue documentado ni capacidades de razonamiento, tool calling o agentes.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de clasificacion erronea con confianza alta en mensajes fuera de distribucion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/danjai/scamlens-qs-google-bert-v12
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
