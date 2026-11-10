# danjai/scamlens-qs-distilbert-v1

## Resumen

ScamLens quick_score distilbert-v1 es un clasificador binario de texto que estima la probabilidad de que un SMS o mensaje de chat sea una estafa. Lo desarrolla el usuario danjai como parte del proyecto de curso universitario IS469, dentro de un agente de investigacion de fraudes llamado ScamLens, donde este modelo ocupa la funcion `quick_score` (una primera opinion basada unicamente en el texto). Se trata de un fine-tuning de `distilbert-base-uncased` con 66.955.010 parametros, etiquetas `0 = genuine` y `1 = scam`, y una ventana de entrada de 128 tokens.

El modelo es relevante por su enfoque acotado y verificable: clasificacion de mensajes fraudulentos en el contexto de Singapur (bancos locales, agencias y servicios de pago), con un conjunto de test de 178 mensajes escritos a mano que no aparecen en entrenamiento y con intervalos de confianza publicados. No es el modelo que ScamLens usa en produccion, sino uno de los candidatos comparados durante el desarrollo.

Su tamano reducido (repo de 0,3 GB, pesos safetensors) lo hace apto para inferencia en CPU y para despliegues de baja latencia como primer filtro dentro de un pipeline mayor. La licencia no esta declarada en la informacion disponible, lo que condiciona cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilacion de BERT base uncased) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens (max_length de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos safetensors en el repo; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer tipo DistilBERT, inicializado desde `distilbert/distilbert-base-uncased` y adaptado con una cabeza de clasificacion de secuencia de dos etiquetas. El entrenamiento se realizo durante 3 epocas con learning rate 2e-05, batch size 16, max_length 128, warmup_ratio 0.1, weight_decay 0.01, scheduler lineal, pesos de clase balanceados, val_ratio 0.1 y semilla 42.

Los datos suman 7.267 ejemplos (6.541 para entrenamiento y 726 para validacion) procedentes de los ficheros `sg_quick_score_train.csv` y `uci_sms_spam`. La composicion descrita incluye mensajes de estafa y mensajes genuinos al estilo de Singapur: textos tomados o reconstruidos a partir de avisos publicos de fraude, mensajes sinteticos, alertas bancarias generadas en pares genuino/estafa y SMS cotidianos de corpus publicos. No se documenta uso de RLHF, DPO ni ninguna innovacion de decodificacion; es un fine-tuning supervisado convencional con hashes SHA-256 publicados para los conjuntos de entrenamiento y test.

## Capacidades

- Clasificacion binaria de texto: devuelve la probabilidad de que un mensaje sea estafa mediante softmax sobre los logits (indice 1 = scam).
- Deteccion basada en formulacion linguistica: analiza el texto del mensaje, no metadatos.
- Umbral operativo definido por el autor en el contexto de ScamLens: alto desde 0,70, medio desde 0,50, bajo por debajo.
- Integracion como herramienta `quick_score` dentro del agente ScamLens, configurable mediante la variable de entorno `SCAMLENS_QUICK_SCORE_MODEL`.
- Compatibilidad con text-embeddings-inference y endpoints compatibles, segun los tags del repositorio.
- No soporta tool calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Filtro previo en pasarelas de SMS: clasificar mensajes entrantes con un umbral de 0,50 o 0,70 antes de derivarlos a revisiones mas costosas, aprovechando que el modelo solo necesita 128 tokens y corre en CPU.
- Moderacion de chats de atencion al cliente: puntuar mensajes de usuarios que contienen enlaces o peticiones de datos bancarios para marcar conversaciones sospechosas a un agente humano.
- Educacion y concienciacion antifraude: procesar mensajes reportados por usuarios y mostrar una probabilidad orientativa junto con la explicacion de que el modelo solo evalua la formulacion.
- Investigacion academica sobre deteccion de estafas: servir como linea base reproducible (semilla 42, hashes de datos publicados) frente a modelos mayores en experimentos de clasificacion de SMS.
- Enriquecimiento de un pipeline de triaje: combinar la salida `quick_score` con verificaciones separadas de enlaces, numeros de telefono y remitentes para producir una decision final compuesta.
- Prototipado rapido de herramientas antifraude: al ocupar 0,3 GB y cargarse con `transformers`, permite desplegar un endpoint de clasificacion en entornos con recursos limitados o en local para pruebas de concepto.
- Preetiquetado de datos: usar las probabilidades del modelo para priorizar la revision manual de grandes volumenes de mensajes antes de construir un conjunto etiquetado nuevo.

## Benchmarks y rendimiento

| Metrica | Resultado | Intervalo de confianza al 95% |
|---|---|---|
| F1 en validacion | 0,969 | no disponible |
| Accuracy en test | 0,843 | 0,782 - 0,889 |
| Recall de estafa en test | 0,933 | 0,868 - 0,967 |
| Precision de estafa en test | 0,822 | 0,743 - 0,881 |
| F1 en test | 0,874 | no disponible |
| Mensajes genuinos clasificados como estafa | 21 de 74 | no disponible |
| Estafas no detectadas | 7 de 104 | no disponible |

El conjunto de test son 178 mensajes de Singapur escritos a mano que no aparecen en los datos de entrenamiento, con umbral de decision en 0,50. No se han publicado resultados de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (66,9 M de parametros, aproximadamente 268 MB de pesos) y en torno a 0,5 GB contando activaciones y tokenizer con batches pequenos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo esta sobredimensionado para hardware de gama alta y no requiere A100 ni H100.
- Cabe en cualquier GPU de consumo (GTX 1050, RTX 2060, RTX 3060, RTX 4090) y funciona en CPU sin problemas.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification`, text-embeddings-inference y endpoints compatibles; no se documentan artefactos GGUF para llama.cpp ni Ollama.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por tamano y longitud de entrada (128 tokens) se espera una latencia de milisegundos en GPU y de decenas de milisegundos en CPU, aunque esta estimacion no esta respaldada por mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| danjai/scamlens-qs-distilbert-v1 | 66,9 M | 128 tokens | Clasificacion de estafas en SMS (ingles, Singapur) | no disponible | Hugging Face |
| distilbert/distilbert-base-uncased | 66,9 M | 512 tokens | Modelo base generalista (MLM) | Apache 2.0 (segun el modelo base) | Hugging Face |
| bert-base-uncased | 110 M | 512 tokens | Modelo base generalista (MLM) | Apache 2.0 (segun el modelo base) | Hugging Face |

No se dispone de datos de benchmarks de clasificadores de estafa comparables en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Solo evalua la formulacion del mensaje: no comprueba enlaces, numeros de telefono ni remitentes, por lo que no debe usarse como unico criterio de bloqueo o acusacion.
- Entrenado con mensajes en ingles y en el contexto de Singapur (bancos, agencias y servicios de pago locales); su fiabilidad fuera de ese entorno es menor.
- El conjunto de test es pequeno (178 mensajes), lo que produce intervalos de confianza amplios y limita la solidez estadistica de las metricas.
- Tasa de falsos positivos relevante en el test: 21 de 74 mensajes genuinos se clasificaron como estafa con umbral 0,50.
- Tasa de falsos negativos: 7 de 104 estafas no se detectaron.
- Ventana de contexto de 128 tokens: los mensajes mas largos se truncan y pierden informacion.
- Licencia no declarada, lo que impide confirmar condiciones de uso comercial.
- Es un modelo candidato de un proyecto academico, no el modelo desplegado en ScamLens; no hay evidencia de validacion en produccion.
- Riesgo de sesgo derivado de la composicion del dataset (mensajes sinteticos y reconstruidos a partir de avisos publicos), no documentado por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/danjai/scamlens-qs-distilbert-v1
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- No se han encontrado en la busqueda web papers, blogs, repositorios de codigo ni demos adicionales asociados a este modelo.
