# danjai/scamlens-qs-distilbert-v2

## Resumen

ScamLens quick_score: distilbert-v2 es un clasificador de texto binario desarrollado por el usuario danjai que estima la probabilidad de que un mensaje SMS o de chat sea una estafa. Se trata de un fine-tuning de `distilbert/distilbert-base-uncased`, un transformer encoder de 66,9 millones de parametros, y forma parte de ScamLens, un agente de investigacion de fraudes construido como proyecto de curso universitario (IS469). Segun la model card, este modelo es uno de los candidatos evaluados y no el que el agente usa en produccion.

El modelo resuelve una tarea acotada: clasificar el texto de un mensaje en dos clases (0 = genuino, 1 = estafa) y devolver una probabilidad calibrada que el agente interpreta en tres umbrales (alta desde 0,70, media desde 0,50, baja por debajo). Su entrenamiento se centra en mensajes en ingles con contexto de Singapur (bancos locales, agencias y servicios de pago), lo que lo hace util como primera opinion dentro de un pipeline de herramientas, no como un filtro autonomo.

Es relevante como ejemplo de modelo pequeno y especializado: con 0,3 GB de repo y una ventana de 128 tokens, se puede desplegar en CPU o en GPUs de consumo con latencia baja. Sin embargo, su alcance es limitado: solo analiza la redaccion, no inspecciona enlaces, telefonos ni remitentes, y su conjunto de test es pequeno (178 mensajes), con intervalos de confianza amplios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT base) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens (max_length de entrenamiento; el modelo base admite hasta 512) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tarea | Clasificacion de texto binaria (text-classification) |
| Etiquetas | 0 = genuine, 1 = scam |
| Modelo base | distilbert/distilbert-base-uncased |
| Tamano del repo | 0,3 GB |
| Libreria | transformers |
| Compatibilidad | text-embeddings-inference, endpoints_compatible |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de DistilBERT base uncased, un transformer encoder de 6 capas y 66,9 millones de parametros obtenido por destilacion de BERT base. La cabeza de clasificacion produce dos logits que se convierten en probabilidad mediante softmax. El entrenamiento uso `max_length` de 128 tokens, 2 epocas, learning rate 2e-05, batch size 8, warmup ratio 0,1, weight decay 0,01, scheduler lineal, pesos de clase balanceados, seed 42 y una division validacion/entrenamiento del 10 %.

El conjunto de datos consta de 7.267 ejemplos (6.541 para entrenamiento y 726 para validacion), provenientes de `sg_quick_score_train.csv` y `uci_sms_spam`. La composicion incluye mensajes de estafa y genuinos al estilo de Singapur: mensajes tomados o reconstruidos de avisos publicos de fraude, mensajes sinteticos, alertas bancarias generadas en pares genuino/estafa y SMS cotidianos de corpus publicos. La model card proporciona los hashes SHA-256 de los datos de entrenamiento y test para verificacion de reproducibilidad. No se documenta uso de RLHF, DPO ni tecnicas de decodificacion especulativa, algo esperable en un clasificador encoder.

## Capacidades

- Clasificacion binaria de texto: devuelve la probabilidad de que un mensaje SMS o de chat sea una estafa.
- Deteccion basada en redaccion: analiza el lenguaje del mensaje (urgencia, peticiones de verificacion, suplantacion de entidades).
- Salida calibrada por umbrales: el agente ScamLens interpreta la probabilidad como alta (>= 0,70), media (>= 0,50) o baja (< 0,50).
- Integracion como herramienta (`quick_score`) dentro de un agente de investigacion de fraudes.
- Compatible con `transformers`, `text-embeddings-inference` y endpoints compatibles.
- No soporta tool calling, generacion de texto, razonamiento multi-paso, vision ni audio: es exclusivamente un clasificador.
- Capacidad multilingue limitada al ingles; no se declaran otros idiomas.

## Casos de uso

- Primera capa de triaje en un sistema antiphishing: el modelo puntua rapidamente el texto de un SMS o mensaje de chat y solo los casos con probabilidad alta pasan a herramientas mas costosas (analisis de URL, reputacion de remitente).
- Moderacion de mensajes en aplicaciones de mensajeria: integrado como endpoint compatible, puede filtrar en tiempo real mensajes entrantes con latencia baja gracias a sus 66,9 M de parametros y contexto de 128 tokens.
- Enriquecimiento de un agente de investigacion: como herramienta `quick_score` configurable mediante la variable `SCAMLENS_QUICK_SCORE_MODEL`, aporta una senal de redaccion que se combina con comprobaciones de enlaces, telefonos y remitentes.
- Generacion de alertas para banca o fintech: el modelo puede marcar alertas bancarias sospechosas (por ejemplo, mensajes que piden verificar la cuenta en un dominio externo) y priorizar la revision humana.
- Investigacion academica y prototipado: sirve como baseline reproducible (hashes de datos, hiperparametros y semilla documentados) para comparar clasificadores de fraude en SMS.
- Etiquetado asistido de corpus: puede preetiquetar grandes volumenes de mensajes para revision manual, reduciendo el coste de anotacion en proyectos de deteccion de estafas.
- Filtro previo en pipelines de CI/CD de datos: validar que los conjuntos de mensajes sinteticos usados en pruebas no contienen texto fraudulento no deseado.

## Benchmarks y rendimiento

| Metrica | Valor | Intervalo de confianza 95 % |
|---|---|---|
| F1 de validacion | 0,989 | no disponible |
| Accuracy (test) | 0,820 | 0,757 - 0,870 |
| Recall de estafa (test) | 0,894 | 0,820 - 0,940 |
| Precision de estafa (test) | 0,816 | 0,735 - 0,876 |
| F1 (test) | 0,853 | no disponible |
| Genuinos clasificados como estafa | 21 de 74 | no disponible |
| Estafas no detectadas | 11 de 104 | no disponible |

El test set consta de 178 mensajes de Singapur escritos a mano que no aparecen en los datos de entrenamiento; un mensaje se cuenta como estafa con probabilidad >= 0,50. No se proporcionan comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (66,9 M de parametros, aproximadamente 268 MB de pesos) y alrededor de 70 MB en int8; el repo completo ocupa 0,3 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; tambien funciona en CPU. No requiere A100 ni H100.
- Cabe en GPU de consumo: si, en practicamente cualquier tarjeta moderna (GTX 1650, RTX 3060, RTX 4090) e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` (PyTorch), `text-embeddings-inference`, endpoints compatibles; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera latencia de milisegundos en GPU y decenas de milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| danjai/scamlens-qs-distilbert-v2 | 66,9 M | 128 tokens | Clasificacion de estafas SMS (ingles, Singapur) | no disponible | Hugging Face |
| distilbert/distilbert-base-uncased | 66,9 M | 512 tokens | Modelo base generico (encoder) | Apache 2.0 (segun el modelo base) | Hugging Face |
| bert-base-uncased | 110 M | 512 tokens | Modelo base generico (encoder) | Apache 2.0 (segun el modelo base) | Hugging Face |

La comparacion con alternativas especializadas en deteccion de spam o estafas no esta disponible en la informacion proporcionada. Frente a su modelo base, la diferencia principal es la cabeza de clasificacion binaria y el ajuste al dominio de mensajes de Singapur; frente a BERT base, ofrece menor tamano y latencia a costa de capacidad representacional.

## Limitaciones y advertencias

- Solo evalua la redaccion: no comprueba enlaces, numeros de telefono ni remitentes; en ScamLens esas comprobaciones son herramientas separadas y esta puntuacion es solo una primera opinion.
- Entrenado con mensajes en ingles y contexto de Singapur (bancos, agencias y servicios de pago locales); se espera menor fiabilidad en otros paises, variantes del ingles o idiomas distintos.
- El conjunto de test es pequeno (178 mensajes), por lo que los intervalos de confianza son amplios y las metricas pueden variar con nuevas muestras.
- Tasa de falsos positivos apreciable: 21 de 74 mensajes genuinos se clasificaron como estafa en el test, lo que desaconseja su uso como filtro de bloqueo automatico.
- Tasa de falsos negativos: 11 de 104 estafas no se detectaron, por lo que no debe usarse como unica defensa.
- No debe usarse para bloquear o acusar a personas de forma autonoma; la model card lo advierte explicitamente.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; conviene contactar con el autor antes de integrarlo en produccion.
- El modelo es un candidato descartado en el proyecto ScamLens, no la version que el agente ejecuta en produccion.
- Sin datos publicados sobre sesgos especificos, cuantizaciones soportadas ni rendimiento en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/danjai/scamlens-qs-distilbert-v2
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Repositorio del proyecto ScamLens: no disponible
- Paper o blog del autor: no disponible
- Demo: no disponible
