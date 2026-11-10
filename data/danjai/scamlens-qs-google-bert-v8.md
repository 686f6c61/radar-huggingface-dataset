# danjai/scamlens-qs-google-bert-v8

## Resumen

ScamLens quick_score google-bert-v8 es un clasificador binario de texto especializado en la deteccion de mensajes fraudulentos (scam) en SMS y chats. Lo desarrolla el usuario danjai en el contexto de un proyecto academico de universidad (curso IS469), como herramienta `quick_score` del agente de investigacion de fraudes ScamLens. El modelo parte de `google-bert/bert-base-uncased` y se afina para asignar una probabilidad de que un mensaje sea estafa (etiqueta 1) o genuino (etiqueta 0).

Tecnicamente es un BERT base con 109.483.778 parametros totales (unos 109,5 M) y una ventana de contexto efectiva de 192 tokens, que es la `max_length` usada en el entrenamiento. El repositorio ocupa 0,4 GB y los pesos estan en formato safetensors, listos para cargarse con `transformers` mediante `AutoModelForSequenceClassification`.

Su relevancia es acotada pero concreta: ofrece un detector de estafas por texto con resultados medidos sobre un conjunto de test escrito a mano de 178 mensajes singapurenses, con F1 de 0,952 y recall de estafa de 0,962. Es un modelo de nicho, orientado a un dominio muy especifico (mensajes en ingles con contexto de Singapur), no un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT base (`google-bert/bert-base-uncased` afinado) |
| Parametros totales | 109.483.778 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 192 tokens (max_length de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tarea | Clasificacion de texto binaria (0 = genuino, 1 = estafa) |
| Etiquetas | `0 = genuine`, `1 = scam` |
| Tamano del repositorio | 0,4 GB |
| Libreria | transformers |
| Compatibilidad de despliegue | text-embeddings-inference, endpoints_compatible |

## Arquitectura y entrenamiento

La arquitectura es un BERT base estandar (transformer encoder bidireccional) con una cabeza de clasificacion de secuencias de dos clases. Se parte de los pesos de `google-bert/bert-base-uncased` y se afina con los siguientes hiperparametros declarados por el autor: 2 epocas, learning rate 3e-05, batch size 8, `max_length` 192, `warmup_ratio` 0,1, `weight_decay` 0,01, scheduler lineal, pesos de clase balanceados, `val_ratio` 0,2 y semilla 42.

El conjunto de entrenamiento contiene 1901 ejemplos, de los cuales 1522 se usan para entrenar y 379 para validacion. La particion de validacion se hace por plantilla de mensaje (1387 plantillas), de modo que las copias casi identicas de un mensaje de entrenamiento no aparecen en validacion; es una decision metodologica relevante para evitar fuga de datos. Los datos son mensajes de estafa y genuinos de estilo singapurense: mensajes tomados o reconstruidos a partir de avisos publicos de fraude, mensajes sinteticos, alertas bancarias generadas en pares genuino/estafa y SMS cotidianos de corpus publicos. El autor publica los hashes SHA-256 de los datos de entrenamiento (`a347f8eb...`) y de test (`7ffae3e4...`).

No se documenta el uso de RLHF, DPO ni tecnicas de alineacion adicionales; es un fine-tuning supervisado clasico de clasificacion. Tampoco se detalla el numero total de tokens de entrenamiento ni innovaciones arquitectonicas mas alla del ajuste de la cabeza de clasificacion.

## Capacidades

- Clasificacion binaria de mensajes de texto: devuelve la probabilidad de que un SMS o mensaje de chat sea una estafa.
- Deteccion basada exclusivamente en la redaccion del mensaje (wording), no en metadatos.
- Salida calibrada en forma de probabilidad (`softmax` sobre logits), con umbral operativo de 0,50 para considerar estafa.
- Integracion como herramienta `quick_score` dentro del agente ScamLens, configurable mediante la variable de entorno `SCAMLENS_QUICK_SCORE_MODEL`.
- Mapeo de probabilidad a nivel de riesgo en ScamLens: alto desde 0,70, medio desde 0,50, bajo por debajo.
- Capacidad multilingue: no; solo ingles.
- Tool calling, function calling, agentes multi-paso, razonamiento, codigo, matematicas, vision o audio: no disponibles en este modelo (es un clasificador, no un modelo generativo).

## Casos de uso

- Filtrado previo de SMS entrantes en una aplicacion movil: el modelo puntua cada mensaje con una probabilidad de estafa en una sola pasada de 192 tokens, lo que permite descartar o marcar mensajes sospechosos antes de mostrarlos al usuario.
- Primera opinion en un agente de investigacion de fraudes: dentro de ScamLens, `quick_score` aporta una senal inicial de riesgo que se combina con otras herramientas (comprobacion de enlaces, numeros y remitentes) antes de emitir un veredicto.
- Moderacion de chats de atencion al cliente: clasificar mensajes de usuarios o de terceros que simulan comunicaciones bancarias para detectar intentos de ingenieria social en ingles.
- Etiquetado y triaje en pipelines de denuncia: priorizar mensajes reportados por usuarios segun su probabilidad de estafa, de modo que los analistas humanos revisen primero los casos de riesgo alto (>= 0,70).
- Generacion de alertas en sistemas de banca o pagos: dado que se entreno con pares de alertas bancarias genuinas y fraudulentas, puede usarse para distinguir notificaciones legitimas de suplantaciones en un entorno de Singapur.
- Investigacion academica y reproducibilidad: el modelo publica hashes de datos y una particion por plantilla, lo que lo hace util como linea base reproducible para experimentos de deteccion de fraude por texto.
- Prototipado rapido con `transformers` o `text-embeddings-inference`: al ser un BERT base de 0,4 GB, se puede desplegar en entornos con recursos modestos para validar una idea antes de invertir en un modelo mayor.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card:

| Metrica | Valor | Intervalo de confianza 95 % |
|---|---|---|
| F1 en validacion | 0,981 | no disponible |
| Accuracy en test | 0,944 | 0,900 - 0,969 |
| Recall de estafa en test | 0,962 | 0,905 - 0,985 |
| Precision de estafa en test | 0,943 | 0,882 - 0,974 |
| F1 en test | 0,952 | no disponible |
| Mensajes genuinos clasificados como estafa | 6 de 74 | no disponible |
| Estafas no detectadas | 4 de 104 | no disponible |

El conjunto de test son 178 mensajes singapurenses escritos a mano que no aparecen en los datos de entrenamiento. No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,44 GB solo para pesos (109,5 M de parametros), mas activaciones y overhead del runtime; en la practica cabe holgadamente en cualquier GPU con 2 GB o mas.
- En FP16/BF16: alrededor de 0,22 GB de pesos, con requisitos totales por debajo de 1 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es mas que suficiente; tambien funciona en CPU para lotes pequenos. GPU de datacenter (A100, H100) no son necesarias y solo tendrian sentido para servir grandes volumenes en lote.
- Cabe en GPU consumer: si, en practicamente todas las GPU con al menos 2 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: `transformers` (referencia de la model card), `text-embeddings-inference` (tag declarado) y endpoints compatibles; no se documentan pesos GGUF ni soporte explicito de llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos alternativos en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible. A nivel estructural, el punto de referencia inmediato es su modelo base:

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| danjai/scamlens-qs-google-bert-v8 | 109,5 M | 192 tokens | Clasificacion estafa/genuino | no disponible | Hugging Face |
| google-bert/bert-base-uncased | 110 M aprox. | 512 tokens | Modelo base de lenguaje (MLM) | Apache 2.0 (segun el modelo original) | Hugging Face |
| Alternativas de deteccion de spam/scam | no disponible | no disponible | Clasificacion de texto | no disponible | no disponible |

## Limitaciones y advertencias

- Solo evalua la redaccion del mensaje: no comprueba enlaces, numeros de telefono ni remitentes. En ScamLens esas comprobaciones son herramientas separadas y esta puntuacion es solo una primera opinion.
- Entrenado con mensajes en ingles y contexto singapurense (bancos, agencias y servicios de pago locales); se espera menor fiabilidad fuera de ese dominio.
- El conjunto de test es pequeno (178 mensajes), por lo que los intervalos de confianza son amplios.
- El autor advierte explicitamente de que no debe usarse en solitario para bloquear o acusar a nadie.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de falsos positivos (6 de 74 mensajes genuinos marcados como estafa en test) y falsos negativos (4 de 104 estafas no detectadas).
- Sesgos conocidos: no documentados; la dependencia del dominio singapurense y del ingles constituye un sesgo de distribucion relevante.
- Limitacion de contexto: 192 tokens; los mensajes mas largos se truncan con `truncation=True`, lo que puede perder informacion en conversaciones extensas.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; conviene contactar con el autor antes de usarlo en produccion.
- Modelo de proyecto academico con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso o mantenimiento en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/danjai/scamlens-qs-google-bert-v8
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio del agente ScamLens: no disponible
- Paper o blog tecnico: no disponible
- Demo: no disponible
