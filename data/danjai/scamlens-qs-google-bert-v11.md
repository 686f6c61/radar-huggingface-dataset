# danjai/scamlens-qs-google-bert-v11

## Resumen

ScamLens quick_score google-bert-v11 es un clasificador binario de texto especializado en la deteccion de mensajes fraudulentos (scams) en SMS y chats. Lo desarrolla el usuario danjai como parte de ScamLens, un agente de investigacion de fraudes construido para un proyecto de curso universitario (IS469). El modelo parte de google-bert/bert-base-uncased y se ha afinado mediante fine-tuning supervisado para asignar a cada mensaje una probabilidad de ser estafa.

Se trata de un modelo BERT base (encoder transformer) con 109.483.778 parametros totales, publicado en formato safetensors y compatible con la libreria transformers. Su funcion dentro de ScamLens es la de herramienta `quick_score`: una primera opinion basada exclusivamente en la redaccion del mensaje, que se combina con otras comprobaciones (enlaces, numeros de telefono, remitentes) realizadas por herramientas separadas.

Es relevante ahora como ejemplo de clasificador pequeno, desplegable en hardware modesto, orientado a un dominio muy concreto (mensajes de estafa en el contexto de Singapur) y con una evaluacion honesta sobre un conjunto de test pequeno. El autor indica explicitamente que este no es el modelo con el que ScamLens funciona en produccion, sino uno de los candidatos entrenados y comparados durante el proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT base (encoder transformer), fine-tuning para clasificacion de secuencias |
| Parametros totales | 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 123 tokens (max_length de entrenamiento); limite arquitectonico de BERT base: 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un BERT base (google-bert/bert-base-uncased) con una cabeza de clasificacion de secuencias de dos etiquetas (`0 = genuine`, `1 = scam`). El fine-tuning se realizo durante 3 epocas con learning rate 4e-05, batch size 8, longitud maxima de 123 tokens, warmup ratio 0.1, weight decay 0.01, scheduler lineal, pesos de clase balanceados, val_ratio 0.2 y semilla 42.

El conjunto de entrenamiento contiene 1.901 ejemplos (1.522 para entrenamiento y 379 para validacion), provenientes del fichero `sg_quick_score_train.csv`. La validacion se divide por plantilla de mensaje (1.387 plantillas), de modo que las copias cercanas de un mensaje de entrenamiento nunca aparecen en validacion. Los datos son mensajes de estafa y mensajes genuinos de estilo singapurense: mensajes tomados o reconstruidos a partir de avisos publicos de fraude, mensajes sinteticos, alertas bancarias generadas en pares genuino/estafa y SMS cotidianos de corpus publicos. El autor publica los hashes SHA-256 de los datos de entrenamiento y de test.

## Capacidades

- Clasificacion binaria de texto: devuelve la probabilidad de que un SMS o mensaje de chat sea una estafa.
- Deteccion basada en redaccion: analiza el texto del mensaje, sin inspeccionar enlaces, numeros de telefono ni remitentes.
- Salida calibrada como probabilidad (softmax sobre dos logits), con umbral operativo de 0.50 para considerar un mensaje como estafa.
- Integracion como herramienta `quick_score` dentro del agente ScamLens, configurable mediante la variable de entorno `SCAMLENS_QUICK_SCORE_MODEL`.
- Interpretacion de la probabilidad en tres niveles en ScamLens: alta desde 0.70, media desde 0.50, baja por debajo.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, vision, audio ni modo thinking.
- Capacidad multilingue limitada al ingles; no se documenta soporte de otros idiomas.

## Casos de uso

- Filtro previo en pasarelas de SMS: el modelo puede puntuar cada mensaje entrante y marcar como sospechosos aquellos con probabilidad alta, reduciendo el volumen que llega a revisiones mas costosas. Es adecuado por su bajo coste computacional y su latencia reducida al ser un BERT base.
- Primera opinion en un agente de investigacion de fraudes: integrado como `quick_score` en ScamLens, aporta una senal inicial sobre la redaccion que se combina con comprobaciones de enlaces y remitentes realizadas por otras herramientas.
- Avisos al usuario en aplicaciones de mensajeria: el clasificador puede generar una advertencia en la interfaz cuando la probabilidad supera 0.70, con el mensaje de que la decision final no debe basarse solo en esta puntuacion.
- Triaje en equipos de atencion al cliente bancaria: priorizacion de conversaciones sospechosas para que un analista humano las revise, usando el umbral de 0.50 como criterio de derivacion.
- Investigacion academica sobre deteccion de fraude: el modelo, con sus hiperparametros y hashes de datos publicados, sirve como referencia reproducible para comparar tecnicas de clasificacion de scams en ingles de Singapur.
- Generacion de datos de evaluacion: la salida probabilistica permite etiquetar de forma automatica grandes volumenes de mensajes para construir conjuntos de datos de entrenamiento o de validacion de otros sistemas.
- Prototipado rapido en entornos con recursos limitados: al ser un BERT base de 0.4 GB, puede desplegarse en una sola GPU consumer o incluso en CPU para pruebas de concepto.

## Benchmarks y rendimiento

| Metrica | Valor | Intervalo de confianza 95% |
|---|---|---|
| F1 en validacion | 0.966 | no disponible |
| Accuracy en test | 0.910 | 0.859 - 0.944 |
| Recall de estafa en test | 0.923 | 0.856 - 0.961 |
| Precision de estafa en test | 0.923 | 0.856 - 0.961 |
| F1 en test | 0.923 | no disponible |
| Mensajes genuinos clasificados como estafa | 8 de 74 | no disponible |
| Estafas no detectadas | 8 de 104 | no disponible |

El conjunto de test son 178 mensajes singapurenses escritos a mano que no aparecen en los datos de entrenamiento. Un mensaje se cuenta como estafa con probabilidad igual o superior a 0.50.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 0.44 GB solo para pesos, mas activaciones y overhead; en la practica menos de 2 GB.
- VRAM estimada en fp16: aproximadamente 0.22 GB para pesos; inferior a 1 GB en total.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona correctamente en RTX 3060, RTX 4090, A100 y H100, aunque el modelo es demasiado pequeno para aprovechar estas ultimas.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: transformers (PyTorch), text-embeddings-inference (segun los tags del repositorio) y endpoints compatibles; no se documenta soporte explicito de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera una latencia de milisegundos por mensaje en GPU y de decenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| danjai/scamlens-qs-google-bert-v11 | 109,5 M | 123 tokens (entrenamiento) | Clasificacion de scams en SMS | no disponible | Hugging Face |
| google-bert/bert-base-uncased | 110 M | 512 tokens | Modelo base general (MLM) | Apache 2.0 | Hugging Face |
| Modelos de clasificacion de spam/scam genericos | no disponible | no disponible | Clasificacion de spam | variable | no disponible |

La comparacion con alternativas especificas de deteccion de scams en SMS no esta disponible en la informacion proporcionada. El modelo base google-bert/bert-base-uncased es el referente directo por arquitectura y tamano, pero no esta especializado en la tarea.

## Limitaciones y advertencias

- Solo evalua la redaccion del mensaje: no comprueba enlaces, numeros de telefono ni remitentes, por lo que un mensaje fraudulento con redaccion generica puede pasar desapercibido.
- Entrenado con mensajes en ingles y en el contexto de Singapur (bancos, agencias y servicios de pago locales); se espera un rendimiento inferior fuera de ese contexto.
- El conjunto de test es pequeno (178 mensajes), lo que produce intervalos de confianza amplios y limita la fiabilidad de las metricas.
- En el conjunto de test, 8 de 74 mensajes genuinos se clasificaron como estafa y 8 de 104 estafas no se detectaron; el riesgo de falsos positivos y falsos negativos es real.
- El autor advierte explicitamente de que no debe usarse en solitario para bloquear o acusar a nadie.
- La licencia no esta disponible, por lo que no se puede confirmar si el uso comercial esta permitido.
- Riesgo de alucinacion no aplicable en sentido estricto (es un clasificador, no un generador), pero si existe riesgo de clasificaciones erroneas por sobreajuste al dominio de entrenamiento.
- No se documentan sesgos especificos, aunque al entrenarse con datos de un contexto local concreto puede presentar sesgos hacia ese tipo de mensajes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/danjai/scamlens-qs-google-bert-v11
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
