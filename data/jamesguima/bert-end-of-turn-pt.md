# JamesGuima/bert-end-of-turn-pt

## Resumen

`bert-end-of-turn-pt` es un modelo de clasificación binaria de secuencias, obtenido mediante fine-tuning de `neuralmind/bert-base-portuguese-cased` (BERT base en portugues), especializado en la deteccion de fin de turno conversacional (End-of-Turn, EoT) o fin de enunciado (End-of-Utterance, EoU) en portugues de Brasil. Lo desarrolla Jaime Guimaraes, investigador del Laboratorio de Inteligencia y Tecnologia Computacional (LITC) de la Universidade Federal de Minas Gerais (UFMG), y se publica con licencia MIT.

El modelo resuelve un problema concreto en agentes conversacionales de voz y chat: decidir cuando el usuario ha terminado de hablar o de escribir. En lugar de aplicar un tiempo de espera fijo de 3 a 5 segundos, o de enviar fragmentos incompletos a un LLM grande, este BERT actua como portero en tiempo real: clasifica cada mensaje como completo (`LABEL_1`) o incompleto (`LABEL_0`) en decenas de milisegundos, permitiendo enrutar solo las peticiones completas al modelo de razonamiento y reducir coste y latencia.

Con 108,9 millones de parametros, una ventana de inferencia de 64 tokens y una latencia declarada de 15 a 25 ms en CPU, el modelo esta disenado para integrarse en bucles de streaming y WebSocket, no para generar texto. Es relevante ahora porque el coste por token de los LLM de gran capacidad hace que filtrar entradas fragmentadas tenga un retorno economico directo, y porque el endpointing preciso es un cuello de botella clasico en agentes de voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT base (BertForSequenceClassification, clasificacion binaria de secuencias) |
| Parametros totales | 108.924.674 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 64 tokens (configurado para entrenamiento e inferencia; el BERT base subyacente admite hasta 512 posiciones) |
| Tipos de cuantizacion | No disponible (el autor no documenta variantes GGUF, ONNX ni cuantizadas) |
| Idiomas soportados | Portugues de Brasil (pt-BR) |
| Licencia | MIT |
| Formato de pesos | Safetensors (repo de 0,4 GB, libreria `transformers`) |

## Arquitectura y entrenamiento

El modelo parte de `neuralmind/bert-base-portuguese-cased`, un BERT base con vocabulario y preentrenamiento en portugues, y se afina como `BertForSequenceClassification` con dos etiquetas: `LABEL_1` (turno completo) y `LABEL_0` (turno incompleto). La secuencia de entrada se trunca y rellena a `max_length = 64`, una decision deliberada para mantener baja la latencia en inferencia por turno de chat.

El entrenamiento se realizo sobre el dataset `RichardSakaguchiMS/brazilian-customer-service-conversations`, con aumento de datos generado por un cortador heuristico (`extract_and_break_smart`) que trunca turnos conversacionales entre el 20 % y el 70 % de su longitud en palabras para producir ejemplos negativos realistas. Se anadio adaptacion de dominio con patrones conversacionales cortos (saludos, confirmaciones, consultas bancarias) y sobremuestreo para estabilizar la prediccion en entradas breves. La configuracion usa AdamW con tasa de aprendizaje de 5e-5, early stopping monitorizado sobre `eval_f1` y priorizacion de precision en `LABEL_1` para minimizar falsos positivos que interrumpirian al usuario. No se documenta uso de RLHF ni DPO, algo esperable en un clasificador supervisado.

## Capacidades

- Clasificacion binaria de fin de turno: distingue enunciados semanticamente y sintacticamente completos de fragmentos a medio escribir o a medio pronunciar.
- Deteccion de endpointing en tiempo real: pensado para bucles de streaming y WebSocket con latencia declarada de 15 a 25 ms en CPU por secuencia (batch de 1, `max_length` 64).
- Enrutamiento de LLM (gatekeeper): permite decidir si un mensaje va a un modelo grande de razonamiento o a uno pequeno y economico.
- Debouncing adaptativo: activa una espera de 3 a 5 segundos solo cuando la prediccion es `LABEL_0`, en lugar de aplicar un timeout fijo.
- Clasificacion de texto corto en portugues de Brasil: estabilizado mediante sobremuestreo de saludos, confirmaciones y consultas bancarias breves.
- Integracion estandar con `transformers`: compatible con `pipeline("text-classification")`, `AutoTokenizer`, `AutoModelForSequenceClassification` y con Text Embeddings Inference (`text-embeddings-inference`, `endpoints_compatible`).
- No soporta generacion de texto, tool calling, razonamiento multi-paso, vision ni audio; es exclusivamente un clasificador.

## Casos de uso

- Atencion al cliente automatizada en portugues: el clasificador se coloca delante del agente conversacional para retener mensajes fragmentados como "Eu gostaria de saber sobre o" hasta que el usuario complete la idea, evitando respuestas a medias y reprocesos.
- Enrutador inteligente de coste y calidad: los mensajes con `LABEL_1` se envian a un modelo grande (GPT-4o, Claude 3.5 Sonnet en los ejemplos del autor) y los `LABEL_0` a un modelo economico (Gemini Flash, GPT-4o-mini) o a un acuse de recibo breve, reduciendo el gasto en tokens.
- Agentes de voz con endpointing de baja latencia: con 15 a 25 ms en CPU, puede ejecutarse en el mismo nodo del orquestador de voz y decidir si cerrar el turno antes de invocar el reconocimiento o el LLM de respuesta.
- Debouncing adaptativo en chats web: sustituye el timeout fijo por una espera condicionada a la prediccion, de modo que las respuestas rapidas no sufren retardo artificial y los mensajes largos no se cortan.
- Triaje en banca y servicios financieros: entrenado con conversaciones de atencion al cliente y consultas bancarias, encaja en flujos de "pix", limites de tarjeta y redefinicion de contrasenas, donde un turno incompleto mal enrutado genera errores operativos.
- Filtro previo en pipelines de datos conversacionales: clasificar transcripciones para separar turnos completos de fragmentos, util para limpiar datasets de dialogo o para segmentar logs de atencion al cliente antes de anonimizar o analizar.
- Control de interrupciones en asistentes telefonicos: priorizar la precision en `LABEL_1` evita que el agente empiece a hablar mientras el usuario aun esta construyendo la frase, un fallo especialmente visible en IVR y call centers.

## Benchmarks y rendimiento

El autor no publica una tabla de resultados por benchmark, sino una unica metrica objetivo y datos de latencia. Se recogen a continuacion tal como aparecen en la model card.

| Metrica | Valor declarado |
|---|---|
| F1-score (objetivo en test held-out) | 0,85 |
| Precision en `LABEL_1` | Priorizada durante el entrenamiento (sin cifra publicada) |
| Latencia media en CPU (batch 1, max_length 64) | 15-25 ms por secuencia |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, ni comparaciones numericas con otros modelos de endpointing.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4-0,5 GB en FP32 (108,9 M de parametros), y del orden de 0,2-0,3 GB en FP16. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU. El autor reporta 15-25 ms por secuencia en CPU, suficiente para produccion en tiempo real; una GPU consumer (RTX 3060, RTX 4090) solo aporta margen para lotes grandes o muchos flujos concurrentes.
- Cabe en GPU consumer: si, en cualquier modelo con al menos 1 GB de memoria, incluidas GTX 1650 o inferiores.
- Opciones de despliegue: `transformers` (pipeline o `AutoModelForSequenceClassification`), Text Embeddings Inference (el repo esta marcado como `endpoints_compatible` y `text-embeddings-inference`), y servidores de inferencia compatibles con Hugging Face Endpoints. No se documentan pesos GGUF, por lo que llama.cpp y Ollama no estan soportados de forma nativa sin conversion.
- Latencia y throughput: 15-25 ms por secuencia en CPU con batch de 1 y `max_length` 64, segun el autor; el throughput agregado no esta documentado.

## Comparativa con modelos similares

No se dispone de datos publicados de otros clasificadores de fin de turno en portugues de Brasil en la informacion proporcionada, por lo que la comparacion se limita a referencias estructurales.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `JamesGuima/bert-end-of-turn-pt` | 108,9 M | 64 tokens (configurado) | Clasificacion EoT binaria, pt-BR | MIT | Hugging Face, 199 descargas, 1 like |
| `neuralmind/bert-base-portuguese-cased` (modelo base) | ~108 M | 512 tokens | Modelo de lenguaje enmascarado, pt | MIT | Hugging Face |
| Clasificadores EoT en ingles (familia BERT) | No disponible | No disponible | Clasificacion EoT, en | No disponible | No disponible |

La ventaja diferencial frente al modelo base es la especializacion en una tarea binaria concreta con latencia medida; la limitacion frente a alternativas multilingues es que solo cubre pt-BR.

## Limitaciones y advertencias

- Alcance linguistico restringido: entrenado y evaluado solo en portugues de Brasil; su comportamiento en portugues europeo, espanol o en mezclas de idiomas no esta documentado.
- Ventana de 64 tokens: los turnos largos se truncan, por lo que la prediccion en mensajes extensos puede basarse solo en el prefijo. No es adecuado para clasificar parrafos completos.
- Riesgo de falso positivo en `LABEL_1`: aunque el entrenamiento prioriza precision para evitarlo, una clasificacion erronea de turno completo interrumpe al usuario; conviene calibrar el umbral de confianza en produccion.
- Dominio acotado: el dataset de entrenamiento son conversaciones de atencion al cliente brasilenas con aumento heuristico; el rendimiento en dominios muy distintos (soporte tecnico especializado, jerga, dialectos) no esta validado.
- Metrica unica: el unico dato de calidad publicado es un F1 objetivo de 0,85, sin matriz de confusion, sin desglose por clase ni evaluacion externa independiente.
- Sin cuantizaciones publicadas: no hay pesos GGUF ni ONNX en el repo, lo que limita el despliegue en llama.cpp u Ollama sin trabajo adicional de conversion.
- Adopcion muy baja: 199 descargas y 1 like en el momento de la consulta, lo que implica poca validacion por parte de la comunidad.
- Licencia MIT: permite uso comercial y modificacion con atribucion; no obstante, la responsabilidad sobre sesgos derivados de los datos de atencion al cliente recae en el integrador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JamesGuima/bert-end-of-turn-pt
- Modelo base: https://huggingface.co/neuralmind/bert-base-portuguese-cased
- Dataset de entrenamiento: https://huggingface.co/datasets/RichardSakaguchiMS/brazilian-customer-service-conversations
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada.
