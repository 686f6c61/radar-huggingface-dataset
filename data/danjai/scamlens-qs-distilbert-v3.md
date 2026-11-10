# danjai/scamlens-qs-distilbert-v3

## Resumen

ScamLens quick_score distilbert-v3 es un clasificador de texto binario desarrollado por el usuario danjai que estima la probabilidad de que un mensaje SMS o de chat sea un fraude. Forma parte de ScamLens, un agente de investigacion de estafas construido como proyecto de curso universitario (IS469), y constituye una de las variantes candidatas evaluadas por el autor, no la que finalmente emplea el sistema en produccion. El modelo se afina sobre distilbert-base-uncased y se publica con la etiqueta de pipeline text-classification.

Tecnicamente es un transformer encoder destilado de BERT-base, con 66.955.010 parametros totales y una ventana de contexto efectiva de 128 tokens impuesta en el entrenamiento. El modelo devuelve dos logits (`0 = genuine`, `1 = scam`) y se ha entrenado exclusivamente con mensajes en ingles de estilo singapurense, incluyendo alertas bancarias sinteticas, avisos publicos de estafa y SMS cotidianos de corpus abiertos.

Su relevancia es acotada pero concreta: demuestra que un modelo de 67 millones de parametros puede alcanzar un recall de estafa del 91,3 % sobre un conjunto de prueba de mensajes escritos a mano, con un coste de inferencia minimo. Es util como referencia para quien quiera construir un primer filtro de texto en un pipeline antifraude, siempre que se asuma su dominio restringido y su naturaleza de senal auxiliar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT-base) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128 tokens (max_length de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 0,3 GB) |

## Arquitectura y entrenamiento

El modelo es un DistilBERT, es decir, un transformer encoder de 6 capas destilado de BERT-base, con cabeza de clasificacion de secuencia sobre dos etiquetas. Se afino durante 2 epocas con learning rate 2e-5, batch size 16, max_length 128, warmup_ratio 0,1, weight_decay 0,01, scheduler lineal, pesos de clase balanceados, val_ratio 0,1 y semilla 42. No se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa; es un ajuste supervisado convencional de clasificacion.

El conjunto de entrenamiento contiene 2.171 ejemplos (1.954 para entrenamiento y 217 para validacion), procedentes de un unico fichero `sg_quick_score_train.csv` con hash SHA-256 `5ea093bb3f3be135ba322f3ea70a96497914f8153b3da19e7fde6ae6512bd12e`. La composicion combina mensajes tomados o reconstruidos de avisos publicos de estafa, mensajes sinteticos, alertas bancarias generadas en pares genuino/estafa y SMS cotidianos de corpus publicos. El conjunto de prueba (178 mensajes escritos a mano, hash `7ffae3e4dad2531b825b5e9ab44278eb3a9e5d09a3e6b4c140ea32bf21e8be23`) no aparece en entrenamiento.

## Capacidades

- Clasificacion binaria de texto: devuelve la probabilidad de que un mensaje sea estafa (`1`) o genuino (`0`).
- Deteccion basada en formulacion linguistica: analiza el texto del mensaje, no metadatos.
- Umbral operativo definido por el autor: alta a partir de 0,70, media a partir de 0,50, baja por debajo.
- Integracion como herramienta `quick_score` dentro del agente ScamLens, configurable mediante la variable de entorno `SCAMLENS_QUICK_SCORE_MODEL`.
- Compatibilidad con text-embeddings-inference y endpoints compatibles, segun los tags del repositorio.
- No soporta tool calling, function calling, razonamiento multi-paso, vision, audio ni modo de pensamiento.
- Capacidad multilingue: no disponible; solo se declara ingles.

## Casos de uso

- Primer filtro en un pipeline antifraude de SMS: el modelo clasifica cada mensaje entrante en milisegundos con 67 millones de parametros, de modo que solo los mensajes con probabilidad alta pasan a herramientas mas costosas de analisis de enlaces o remitentes.
- Moderacion de mensajes en aplicaciones de mensajeria: integrado como endpoint compatible con text-embeddings-inference, puede puntuar en tiempo real los mensajes de un chat y marcar los sospechosos para revision humana.
- Enriquecimiento de alertas bancarias: dado que el entrenamiento incluye pares de alertas bancarias genuinas y fraudulentas, el modelo puede distinguir entre una notificacion legitima y una suplantacion por el tono y la estructura del texto.
- Senal auxiliar en un agente de investigacion: dentro de ScamLens actua como opinion inicial que se combina con verificaciones separadas de enlaces, numeros de telefono y remitentes, aportando un score interpretable por umbrales.
- Generacion de datasets etiquetados: el modelo puede preetiquetar grandes volumenes de SMS para su posterior revision, reduciendo el coste de anotacion manual en dominios proximos al singapurense.
- Evaluacion comparativa de clasificadores ligeros: sirve como linea base reproducible (semilla 42, hiperparametros documentados) para comparar alternativas de deteccion de estafas con modelos de mayor tamano.
- Prototipado academico y docencia: su tamano reducido y su model card detallada lo hacen adecuado para practicas de ajuste fino y evaluacion con intervalos de confianza.

## Benchmarks y rendimiento

| Metrica | Valor | Intervalo de confianza 95 % |
|---|---|---|
| F1 de validacion | 0,970 | no disponible |
| Accuracy en test | 0,843 | 0,782 - 0,889 |
| Recall de estafa | 0,913 | 0,844 - 0,954 |
| Precision de estafa | 0,833 | 0,754 - 0,891 |
| F1 en test | 0,872 | no disponible |
| Genuinos clasificados como estafa | 19 de 74 | no disponible |
| Estafas no detectadas | 9 de 104 | no disponible |

El conjunto de prueba son 178 mensajes singapurenses escritos a mano, con umbral de decision en 0,50. No se han publicado comparaciones con MMLU, HumanEval, GSM8K ni con modelos de referencia en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,27 GB solo para pesos (66,9 M de parametros), mas activaciones y overhead del runtime; en la practica cabe holgadamente en cualquier GPU consumer.
- VRAM estimada en fp16: alrededor de 0,13 GB para pesos, con margen amplio para batch y tokenizer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en RTX 3060, RTX 4090, T4, A100 y H100 sin aprovechar su capacidad.
- Cabe en GPU consumer y tambien en CPU para inferencia de baja concurrencia, dado el tamano del modelo y la longitud maxima de 128 tokens.
- Opciones de despliegue: transformers con PyTorch, text-embeddings-inference y endpoints compatibles; no se documentan integraciones especificas con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| danjai/scamlens-qs-distilbert-v3 | 66,9 M | 128 tokens | Clasificacion de estafas SMS (ingles, Singapur) | no disponible | Hugging Face |
| distilbert/distilbert-base-uncased | 66,9 M | 512 tokens | Modelo base de lenguaje enmascarado | Apache 2.0 (modelo base) | Hugging Face |
| BERT-base-uncased | 110 M | 512 tokens | Modelo base de lenguaje enmascarado | Apache 2.0 (modelo base) | Hugging Face |

La comparacion se limita al modelo base y a su version sin destilar, ya que no se dispone de datos de otros clasificadores de estafas comparables en la informacion proporcionada. Frente a distilbert-base-uncased, este modelo reduce la ventana de contexto efectiva de 512 a 128 tokens y especializa la cabeza de clasificacion en la tarea de fraude.

## Limitaciones y advertencias

- Solo evalua la formulacion del texto: no comprueba enlaces, numeros de telefono ni remitentes, que en ScamLens se gestionan con herramientas separadas; el score es solo una primera opinion.
- Entrenado con mensajes en ingles de contexto singapurense (bancos, agencias y servicios de pago locales); se espera menor fiabilidad fuera de ese dominio geografico y linguistico.
- El conjunto de prueba es pequeno (178 mensajes), por lo que los intervalos de confianza son amplios y las metricas deben interpretarse con cautela.
- Tasa de falsos positivos relevante: 19 de 74 mensajes genuinos se clasificaron como estafa en el conjunto de prueba, lo que desaconseja usarlo solo para bloquear o acusar.
- Tasa de falsos negativos: 9 de 104 estafas no se detectaron con umbral 0,50.
- Licencia no disponible: no puede confirmarse si el uso comercial esta permitido; debe verificarse antes de cualquier despliegue en produccion.
- Ventana de contexto de 128 tokens: los mensajes mas largos se truncan, lo que puede eliminar senales relevantes al final del texto.
- Riesgo de alucinacion no aplica en sentido generativo, pero si existe riesgo de clasificacion erronea por sobreajuste al estilo de los datos sinteticos de entrenamiento.
- No se documentan sesgos especificos, aunque la composicion del dataset (avisos publicos, mensajes sinteticos y pares bancarios generados) puede introducir sesgo hacia patrones concretos de fraude singapurense.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/danjai/scamlens-qs-distilbert-v3
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
