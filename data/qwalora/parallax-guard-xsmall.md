# qwalora/parallax-guard-xsmall

## Resumen

PARALLAX Guard (xsmall, v0.1) es un clasificador de texto especializado en detectar inyecciones de prompt indirectas: instrucciones dirigidas a un sistema de IA que se ocultan dentro de contenido no fiable como paginas web, correos electronicos, resultados de herramientas o comentarios de codigo. Lo desarrolla Qwalora Research & Development (Qwalora LLC) y se distribuye bajo licencia Apache 2.0. El modelo parte de microsoft/deberta-v3-xsmall, un transformer encoder de 70,8 millones de parametros, y se publica en formato safetensors y ONNX.

El problema que aborda es concreto: la mayoria de clasificadores abiertos de prompt injection se entrenan con prompts directos que escribe el usuario, por lo que fallan cuando el ataque llega incrustado en un documento que un agente procesa. Este modelo se entrena con inyecciones colocadas dentro de documentos reales (correos, tablas, codigo, texto enciclopedico) junto a las mismas piezas sin inyeccion, de modo que aprende a localizar la instruccion en el contenido en lugar de detectar un prompt sospechoso.

Es relevante para equipos que construyen agentes con acceso a herramientas y contenido externo, donde la superficie de ataque indirecta es el vector principal. Su tamano reducido (0,7 GB de repositorio) permite ejecutarlo como guardrail de baja latencia en el mismo pipeline del agente, incluso en el navegador mediante transformers.js con cuantizacion int8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3-xsmall) para clasificacion de secuencias |
| Parametros totales | 70.830.722 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma explicita; la model card recomienda ventanas de unas 120 palabras y la evaluacion trunca a 512 tokens |
| Tipos de cuantizacion | int8 (ONNX, usado en la demo y en transformers.js con dtype q8) |
| Idiomas soportados | en (ingles); el conjunto de test deepset incluye tambien aleman |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors y ONNX |

## Arquitectura y entrenamiento

El modelo es un encoder DeBERTa-v3-xsmall afinado para clasificacion binaria con dos etiquetas: `INJECTION` y `BENIGN`. DeBERTa-v3 introduce disentangled attention y un preentrenamiento tipo ELECTRA con replaced token detection, lo que le permite obtener buena calidad con un presupuesto de parametros reducido; aqui se explota esa eficiencia para un clasificador de guardrail que debe ejecutarse en linea con cada fragmento de contenido que procesa un agente.

El entrenamiento se apoya en cuatro conjuntos de datos declarados: deepset/prompt-injections, Lakera/gandalf_ignore_instructions, reshabhs/SPML_Chatbot_Prompt_Injection y Salesforce/wikitext. La innovacion central es el emparejamiento de documentos con y sin inyeccion: el modelo ve el mismo texto base en ambas variantes, de modo que aprende a discriminar la presencia de la instruccion maliciosa dentro del contenido y no a reconocer un estilo de prompt. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplico RLHF o DPO (no aplica a un clasificador). El autor indica que el informe QRD-TR-2026-006 ha pasado revision interna automatizada pero no ha sido replicado de forma independiente.

## Capacidades

- Clasificacion binaria de texto en `INJECTION` o `BENIGN` con una puntuacion de probabilidad.
- Deteccion de inyecciones indirectas incrustadas en correos, tablas, codigo, paginas web y texto enciclopedico.
- Deteccion de inyecciones directas en prompts de usuario (evaluado en el conjunto deepset, en ingles y aleman).
- Procesamiento por ventanas: el contenido largo se divide en fragmentos de aproximadamente 120 palabras y cualquier ventana con puntuacion igual o superior a 0,5 se marca como inyeccion.
- Ejecucion en navegador y en Node mediante transformers.js con pesos ONNX int8, sin enviar el texto a un servidor.
- Integracion como guardrail previo o posterior a llamadas de herramientas en agentes.
- No soporta tool calling, generacion de texto, razonamiento multi-paso ni vision: es exclusivamente un clasificador.

## Casos de uso

- Filtrado de resultados de herramientas en agentes: antes de que el agente lea la salida de una busqueda web, una API o un fichero, se pasa cada ventana de texto por el clasificador y se bloquea o aisla el contenido marcado como `INJECTION`. El modelo esta entrenado precisamente con salidas de herramienta (conjunto NVIDIA agentic indirect injection), por lo que encaja en este punto del pipeline.
- Proteccion de bandejas de entrada automatizadas: un asistente que resume correos puede clasificar el cuerpo de cada mensaje y descartar aquellos que contienen instrucciones dirigidas al sistema, evitando que un correo malicioso redirija acciones del agente.
- Revision de codigo asistida por IA: al analizar comentarios y cadenas de un repositorio, el guardrail detecta instrucciones ocultas en comentarios de codigo que intentan manipular al modelo revisor; el modelo fue evaluado con inyecciones en contexto de codigo en BIPIA.
- Defensa en profundidad en pipelines RAG: cada fragmento recuperado de un indice vectorial se clasifica antes de incorporarse al contexto del LLM, reduciendo el riesgo de envenenamiento de la base de conocimiento.
- Guardrail en el navegador para asistentes web: gracias a la version ONNX int8 y a transformers.js, se puede ejecutar del lado del cliente en extensiones o aplicaciones web, sin exponer el contenido del usuario a un servicio externo.
- Monitorizacion y auditoria de trafico de agentes: registrar la puntuacion del clasificador sobre cada entrada procesada permite construir alertas y analisis forense de intentos de inyeccion en produccion.
- Pre-filtro de bajo coste antes de un modelo mayor: por su tamano (70,8 M de parametros), puede descartar la mayoria de contenido benigno y reservar clasificadores o revisiones mas caras para los casos ambiguos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card, umbral 0,5. La linea base es protectai/deberta-v3-base-prompt-injection-v2 (revision 90c9989b) evaluada sobre las mismas entradas.

| Conjunto de test | Iny. / benignos | Recall PARALLAX Guard | Recall baseline | Falsos positivos PARALLAX Guard | Falsos positivos baseline | AUC PARALLAX Guard | AUC baseline |
|---|---|---|---|---|---|---|---|
| BIPIA test (indirectas: email, tabla, codigo) | 1000 / 1000 | 94,9% | 20,4% | 0,6% | 36,9% | 0,990 | 0,428 |
| NVIDIA agentic indirect injection (salidas de herramientas) | 1272 / 1272 | 99,1% | 35,4% | 1,3% | 2,7% | 0,997 | 0,963 |
| deepset prompt-injections test (directas, ingles y aleman) | 60 / 56 | 91,7% | 36,7% | 0,0% | 0,0% | 0,985 | 0,871 |
| Agentic boundary pairs test (ataques y benignos similares) | 120 / 120 | 85,8% | 84,2% | 87,5% | 57,5% | 0,487 | 0,711 |

Comparacion emparejada con test exacto de McNemar (exploratoria, sin ajuste por comparaciones multiples):

| Conjunto de test | Items | Aciertos solo PARALLAX Guard | Aciertos solo baseline | p de McNemar |
|---|---|---|---|---|
| BIPIA test | 2000 | 1118 | 10 | < 0,0001 |
| NVIDIA agentic indirect injection | 2544 | 839 | 11 | < 0,0001 |
| deepset prompt-injections test | 116 | 33 | 0 | < 0,0001 |
| Agentic boundary pairs test | 240 | 19 | 53 | < 0,0001 |

El conjunto Agentic boundary pairs muestra el punto debil del modelo: una tasa de falsos positivos del 87,5% y un AUC de 0,487, por debajo del azar, lo que indica que confunde ataques con textos benignos de apariencia similar en ese escenario concreto. Todos los resultados estan marcados como no verificados (`verified: false`) en el model-index.

## Requisitos de hardware

- Inferencia en CPU: viable por el tamano del modelo (70,8 M de parametros); la demo oficial ejecuta la version ONNX int8 en el navegador del usuario.
- VRAM estimada: en FP32, aproximadamente 0,3 GB de pesos mas activaciones; en int8, por debajo de 0,1 GB de pesos. Cabe en cualquier GPU consumer, incluidas GTX 1650, RTX 3060 y superiores.
- GPU recomendadas: no se requieren GPU dedicadas; para alto throughput, una T4, L4 o A10 es mas que suficiente. A100 y H100 solo tendrian sentido para servir muchas instancias en paralelo.
- Despliegue: transformers (pipeline de text-classification), ONNX Runtime, transformers.js en navegador y Node, y text-embeddings-inference segun los tags del repositorio. No se documenta soporte especifico para vLLM, llama.cpp ni Ollama, que estan orientados a modelos generativos.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera una latencia de milisegundos por ventana de 120 palabras en CPU moderna, aunque no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Resultados declarados |
|---|---|---|---|---|---|
| qwalora/parallax-guard-xsmall | 70,8 M | ventanas de ~120 palabras; evaluacion a 512 tokens | Inyeccion indirecta y directa | Apache 2.0 | Recall 94,9% en BIPIA; AUC 0,990 |
| protectai/deberta-v3-base-prompt-injection-v2 | DeBERTa-v3-base (aprox. 184 M) | 512 tokens | Prompt injection directa principalmente | no disponible en la informacion | Recall 20,4% en BIPIA; AUC 0,428 (segun evaluacion del autor) |
| Clasificadores genericos de moderacion (p. ej. basados en BERT/DistilBERT) | variable | 512 tokens | Contenido toxico o spam, no especifico de inyeccion | variable | no disponible |

La comparacion con la linea base es la mas informativa: el modelo de Qwalora supera ampliamente a protectai en deteccion de inyecciones indirectas (BIPIA y NVIDIA agentic) con muchas menos falsos positivos en BIPIA, aunque pierde en el conjunto de pares limite (AUC 0,487 frente a 0,711). No se dispone de datos de otros clasificadores especificos de prompt injection en la informacion proporcionada.

## Limitaciones y advertencias

- El conjunto Agentic boundary pairs revela una tasa de falsos positivos del 87,5% y un AUC de 0,487: en escenarios con textos benignos que imitan ataques, el modelo marca casi todo como inyeccion. No debe usarse como unico filtro en esos casos.
- Resultados no verificados de forma independiente: el autor indica revision interna automatizada, sin replicacion externa. Tratar las cifras como declaraciones del autor.
- Entrenado principalmente en ingles; el soporte de aleman solo se ha evaluado en el conjunto deepset y no hay datos de otros idiomas.
- Entrada limitada a ventanas de aproximadamente 120 palabras: el contenido largo requiere troceado y agregacion, lo que puede fragmentar ataques que cruzan ventanas.
- Riesgo de alucinacion no aplica (es un clasificador), pero si de clasificacion erronea: falsos negativos en ataques noveles no cubiertos por los datasets de entrenamiento.
- Sesgos de los datasets de origen (deepset, Lakera, SPML, wikitext) pueden trasladarse al clasificador; no se documenta un analisis de sesgos.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; la model card advierte que no ha sido replicado de forma independiente.
- No es un modelo generativo: no sustituye a un LLM ni implementa tool calling; su funcion es exclusivamente de guardrail.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qwalora/parallax-guard-xsmall
- Demo en el navegador: https://huggingface.co/spaces/qwalora/parallax-guard-demo
- Modelo base: https://huggingface.co/microsoft/deberta-v3-xsmall
- Linea base comparada: https://huggingface.co/protectai/deberta-v3-base-prompt-injection-v2
- Documentacion de transformers.js: https://huggingface.co/docs/transformers.js
- Dataset deepset/prompt-injections: https://huggingface.co/datasets/deepset/prompt-injections
- Dataset Lakera/gandalf_ignore_instructions: https://huggingface.co/datasets/Lakera/gandalf_ignore_instructions
- Dataset reshabhs/SPML_Chatbot_Prompt_Injection: https://huggingface.co/datasets/reshabhs/SPML_Chatbot_Prompt_Injection
- Dataset Salesforce/wikitext: https://huggingface.co/datasets/Salesforce/wikitext
