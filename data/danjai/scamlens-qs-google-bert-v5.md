# danjai/scamlens-qs-google-bert-v5

## Resumen

ScamLens quick_score google-bert-v5 es un clasificador binario de texto especializado en la deteccion de mensajes fraudulentos (scam) en SMS y chats. Lo desarrolla el usuario danjai como parte de ScamLens, un agente de investigacion de estafas construido para un proyecto de curso universitario (IS469). El modelo parte de google-bert/bert-base-uncased y se afina para una tarea muy concreta: asignar la probabilidad de que un mensaje sea fraudulento a partir unicamente de su redaccion.

Se trata de un modelo BERT base con 109.483.778 parametros, contexto de entrada limitado a 192 tokens durante el entrenamiento y salida de clasificacion en dos clases (0 = genuino, 1 = scam). Su relevancia es acotada: no es un modelo de proposito general ni un LLM, sino un componente de scoring rapido dentro de un pipeline mayor de deteccion de estafas orientado al contexto de Singapur (bancos locales, agencias y servicios de pago).

El autor indica explicitamente que este es uno de los modelos candidatos comparados durante el desarrollo y que no es el que ScamLens utiliza en produccion. La ficha refleja, por tanto, un artefacto de investigacion con datos de evaluacion publicados pero con un conjunto de test pequeno (178 mensajes).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder bidireccional), fine-tuning de google-bert/bert-base-uncased para clasificacion de secuencias |
| Parametros totales | 109.483.778 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 192 tokens (max_length de entrenamiento); limite arquitectonico de BERT base: 512 tokens |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un BERT base estandar (transformer encoder de 12 capas, hidden size 768, 12 cabezas de atencion) con una cabeza de clasificacion de dos etiquetas anadida sobre el token [CLS]. El fine-tuning se realizo durante 3 epocas con learning rate 2e-05, batch size 8, max_length 192, warmup_ratio 0.1, weight decay 0.01, scheduler lineal, pesos de clase balanceados y semilla 42.

El conjunto de entrenamiento consta de 1901 ejemplos (1617 para entrenamiento y 284 para validacion), repartidos en 1387 plantillas de mensaje. La particion de validacion se hizo por plantilla, de modo que no hay copias casi identicas de mensajes de entrenamiento en validacion. Los datos son mensajes estilo Singapur: estafas y mensajes genuinos extraidos o reconstruidos a partir de avisos publicos de fraude, mensajes sinteticos, alertas bancarias generadas en pares genuino/scam y SMS cotidianos de corpus publicos. El autor publica los hashes SHA-256 de los ficheros de entrenamiento y test. No se documenta uso de RLHF ni DPO, algo esperable en un clasificador de este tamano.

## Capacidades

- Clasificacion binaria de texto: devuelve la probabilidad de que un mensaje SMS o de chat sea fraudulento (etiqueta 1) o genuino (etiqueta 0).
- Deteccion basada en redaccion: analiza el lenguaje del mensaje, no metadatos como enlaces, numeros de telefono o remitentes.
- Scoring rapido para pipelines: pensado como primera opinion dentro de un agente mayor (herramienta quick_score de ScamLens).
- Umbrales operativos definidos por el autor: probabilidad alta desde 0.70, media desde 0.50, baja por debajo.
- Integracion con transformers y con text-embeddings-inference / endpoints compatibles (segun tags del repositorio).
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking: es un clasificador, no un modelo generativo.
- Capacidad multilingue: limitada al ingles.

## Casos de uso

- Filtro previo de SMS fraudulentos: el modelo puntua cada mensaje entrante y el sistema puede derivar los de probabilidad alta a revision o cuarentena, usando el umbral 0.70 definido por el autor.
- Primera capa de un pipeline antifraude: al ser un BERT base, la inferencia es barata y permite procesar volumen alto de mensajes antes de invocar herramientas mas costosas (analisis de enlaces, reputacion de remitentes).
- Soporte a agentes de investigacion: integrado como herramienta quick_score en ScamLens, aporta una senal inicial de riesgo que el agente combina con otras comprobaciones.
- Moderacion de chats y mensajeria: clasificacion de mensajes en plataformas de mensajeria para marcar posibles intentos de ingenieria social.
- Etiquetado asistido en analisis de incidentes: priorizar manualmente los mensajes reportados por usuarios segun su probabilidad de scam.
- Educacion y concienciacion: demostracion de tecnicas de deteccion de fraude basadas en redaccion en entornos academicos o de formacion.
- Baseline de investigacion: punto de partida reproducible (semilla, hiperparametros y hashes publicados) para comparar otros clasificadores de scam en contexto de Singapur.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| F1 en validacion | 0.943 |
| Exactitud en test | 0.927 (IC 95%: 0.879-0.957) |
| Recall de scam en test | 0.913 (IC 95%: 0.844-0.954) |
| Precision de scam en test | 0.960 (IC 95%: 0.901-0.984) |
| F1 en test | 0.936 |
| Genuinos clasificados como scam | 4 de 74 |
| Scams no detectados | 9 de 104 |

El conjunto de test son 178 mensajes de Singapur escritos a mano y ausentes del entrenamiento; se cuenta como scam a partir de probabilidad 0.50. No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0.4-0.5 GB de pesos, mas overhead de activaciones; cabe con holgura en cualquier GPU consumer.
- En fp16: aproximadamente 0.22 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tambien es viable en CPU para volumenes moderados.
- Cabe en GPU consumer: si, incluidas GTX 1050 Ti, RTX 2060, RTX 3060, RTX 4090 y equivalentes.
- Opciones de despliegue: transformers (PyTorch), text-embeddings-inference y endpoints compatibles segun los tags del repositorio; llama.cpp y Ollama no estan indicados para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| danjai/scamlens-qs-google-bert-v5 | 109,5 M | 192 tokens (entrenamiento) | Clasificacion scam SMS (Singapur, ingles) | no disponible | Hugging Face |
| google-bert/bert-base-uncased | 110 M | 512 tokens | Modelo base de proposito general (MLM) | Apache 2.0 (modelo base) | Hugging Face |
| Alternativas especificas de deteccion de scam | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos publicados que permitan comparar este modelo con otros clasificadores de scam de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Solo evalua la redaccion: no comprueba enlaces, numeros de telefono ni remitentes; esas verificaciones son herramientas separadas en ScamLens.
- Entrenado con mensajes en ingles y contexto de Singapur (bancos, agencias y servicios de pago locales); su fiabilidad fuera de ese entorno es menor.
- Conjunto de test pequeno (178 mensajes), con intervalos de confianza amplios en las metricas.
- El autor advierte de que no debe usarse en solitario para bloquear cuentas ni acusar a personas.
- Riesgo de alucinacion no aplica en sentido estricto (es un clasificador), pero si de falsos positivos y falsos negativos: 4 de 74 mensajes genuinos se marcaron como scam y 9 de 104 scams no se detectaron en test.
- Licencia no especificada: no hay autorizacion explicita documentada para uso comercial; conviene contactar con el autor antes de un despliegue productivo.
- No es el modelo que ScamLens usa en produccion segun el autor; se trata de un candidato comparado durante el desarrollo.
- No se documentan sesgos especificos mas alla del dominio geografico y linguistico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/danjai/scamlens-qs-google-bert-v5
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio o demo de ScamLens: no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible en la informacion proporcionada
