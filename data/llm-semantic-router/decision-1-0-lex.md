# llm-semantic-router/Decision-1.0-Lex

## Resumen

Decision-1.0-Lex es un modelo especializado en toma de decisiones operativas desarrollado por llm-semantic-router. No es un modelo generativo: es un clasificador con cabeza de regresion ordinal, afinado por supervised fine-tuning a partir de Decision-1.0-Kai, que convierte contexto operativo en decisiones estructuradas mediante tres tipos de tarea: Choice (seleccionar entre candidatos), Noul (estimar si una condicion se cumple) y Score (devolver una distribucion ordenada y un valor esperado).

Con 572 millones de parametros, el modelo se apoya en tres rutas de encoder bidireccional de 22 capas que comparten los embeddings de entrada, con capas de interaccion y readouts de candidatos separados para cada tipo de decision. El presupuesto total de entrada es de 1.024 tokens, que incluyen contexto, instrucciones, todos los candidatos y tokens especiales; las peticiones que lo exceden devuelven error. Esta especializado y evaluado en ingles.

Su relevancia practica esta en que cubre cuatro flujos concretos (atencion al cliente, procesamiento de facturas, incidentes de seguridad y trazas de agentes) con un consumo de recursos muy bajo y licencia Apache 2.0, y ademas publica una CLI de fine-tuning para adaptarlo a etiquetas y rubricas propias. Frente a su alternativa directa, Laya Typed Decisions, obtiene un 78,15 % de exactitud global en el split de prueba de 2.000 decisiones, 1,55 puntos mas, aunque con un intervalo de confianza pareado del 95 % que va de -0,20 a +3,15 puntos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional de tres vias (Choice, Noul y Score), con tres rutas de 22 capas que comparten los embeddings de entrada y disponen de capas de interaccion y readouts de candidatos independientes |
| Parametros totales | 572 millones |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 1.024 tokens de presupuesto total (contexto + instrucciones + candidatos + tokens especiales); las peticiones que lo superan devuelven error |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (language: en en la model card); la arquitectura comparte embeddings de entrada multilingues, pero el modelo esta especializado y evaluado en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline en HuggingFace | text-classification |
| Tarea declarada | decision-making / ordinal-regression |
| Tamano del repositorio | 2,3 GB |
| Modelo base | llm-semantic-router/Decision-1.0-Kai |

## Arquitectura y entrenamiento

Lex conserva la arquitectura de Kai y especializa sus pesos mediante supervised fine-tuning. La topologia consiste en tres rutas de encoder bidireccional de 22 capas cada una que comparten los embeddings de entrada, pero que mantienen capas de interaccion y readouts de candidatos separados para Choice, Noul y Score. No hay decodificacion autoregresiva, ni cache KV, ni generacion de texto libre: cada ruta produce una salida estructurada (probabilidades sobre candidatos, estimacion booleana de condicion o distribucion ordenada con valor esperado). El modelo se apoya en Kai y en Vela-1.0-Encoder-307M.

En cuanto al entrenamiento, la informacion disponible indica unicamente que se trata de un ajuste supervisado desde Kai; no se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. Si se documenta que la CLI de fine-tuning incluida admite tanto etiquetas duras como blandas y reanudacion desde checkpoint. La model card tambien documenta un modo de batching opcional, `predict_auto_1k`, que agrupa hasta 32 preguntas del mismo tipo cuando el padding no aumenta, y reporta una reduccion aproximada del 23 % en la latencia mediana para 32 preguntas cortas y del 35 % para el caso de contexto multiple.

## Capacidades

- Clasificacion de decisiones tipo Choice: devuelve probabilidades sobre candidatos, con soporte nativo de 2 a 255 candidatos.
- Estimacion condicional tipo Noul: determina si una condicion se cumple en el contexto aportado.
- Puntuacion tipo Score: devuelve una distribucion ordenada y un valor esperado, con soporte nativo de 2 a 255 niveles ordenados (el adaptador de Decision Studio usa entre 2 y 10 niveles).
- Procesamiento por lotes: el modo `predict_auto_1k` admite hasta 32 preguntas del mismo tipo por lote.
- Fine-tuning sobre etiquetas y rubricas propias mediante la CLI incluida, con etiquetas duras o blandas y reanudacion desde checkpoint.
- No dispone de generacion de texto libre, razonamiento multi-paso generativo, tool calling / function calling, capacidades de agente, vision, audio ni modo de pensamiento. Es un modelo discriminativo, no un LLM conversacional.
- No hay capacidades multilingues confirmadas: el modelo esta especializado en ingles y la propia model card remite a Kai para tareas multilingues mas amplias.

## Casos de uso

- Atencion al cliente automatizada: dada la conversacion y una lista de acciones posibles (responder, escalar a humano, ofrecer reembolso), la ruta Choice devuelve probabilidades por candidato para que el sistema de gestion elija la accion. El limite de 1.024 tokens obliga a resumir el historial antes de invocar el modelo.
- Procesamiento de facturas y cuentas a pagar: la ruta Noul permite verificar condiciones del tipo "el importe supera el umbral de aprobacion" o "el proveedor esta en la lista de excepciones", y enrutar el documento a aprobacion manual o automatica.
- Triaje de incidentes de seguridad: la ruta Score evalua una senal (IP, alerta de EDR, registro de acceso) contra una rubrica y devuelve una distribucion ordenada de severidad mas un valor esperado, util para priorizar la cola de analisis.
- Analisis de trazas de agentes: clasificar el resultado de cada paso de un agente (exito, fallo de herramienta, bucle, alucinacion) y marcar los que superan un umbral de riesgo, alimentando paneles de observabilidad.
- Enrutamiento semantico de peticiones: eligiendo entre modelos, herramientas o rutas de ejecucion disponibles como candidatos, coherente con el proposito del proyecto llm-semantic-router, con latencia baja gracias al batching de hasta 32 elementos.
- Clasificacion de tickets y colas de soporte: asignacion de prioridad o categoria mediante Score sobre niveles ordenados, con salida calibrable a umbrales de negocio.
- Moderacion de contenido con rubrica: puntuar un texto contra criterios definidos (gravedad, intencion, contexto) en lugar de un simple binario, aprovechando la cabeza de regresion ordinal.
- Sistemas de decision embebidos o de borde: con 572 M de parametros, el modelo puede ejecutarse en una GPU de consumo o incluso en CPU para lotes pequenos, lo que habilita despliegues on-premise donde no se pueden enviar datos a la nube.

## Benchmarks y rendimiento

Evaluacion sobre el split de prueba original de 2.000 decisiones tipadas, con entradas completas y el checkpoint oficial de Laya:

| Metrica | Lex | Laya Typed Decisions |
|---|---:|---:|
| Exactitud global | 78,15 % | 76,60 % |
| Choice (600 decisiones) | 74,00 % | 73,33 % |
| Noul (600 decisiones) | 84,67 % | 85,67 % |
| Score (800 decisiones) | 76,38 % | 72,25 % |

Datos adicionales reportados por el autor: Lex acierta 31 decisiones mas que Laya; el intervalo de confianza pareado al 95 % de la mejora es de -0,20 a +3,15 puntos, por lo que la ventaja global no puede considerarse estadisticamente concluyente con esa muestra. Laya supera a Lex en Noul y en metricas de calidad probabilistica. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en funcion del numero de parametros (572 M): aproximadamente 2,3 GB en fp32 (consistente con el tamano del repositorio, 2,3 GB), unos 1,15 GB en fp16/bf16 y alrededor de 0,6 GB en int8. Estas cifras son calculos derivados del numero de parametros, no valores publicados por el autor.
- Al ser un encoder bidireccional sin decodificacion autoregresiva, no necesita cache KV y el consumo de memoria de activaciones es bajo con secuencias de hasta 1.024 tokens.
- Cabe en cualquier GPU de consumo con 4 GB o mas de VRAM: GTX 1650 4 GB, RTX 3050, RTX 3060, RTX 4060, RTX 4090, etc. Las GPU de centro de datos (A100, H100, L40S) son validas pero sobredimensionadas para este tamano.
- Es viable la inferencia en CPU para cargas de baja concurrencia, dado el reducido numero de parametros.
- Opciones de despliegue: `transformers` con el pipeline de text-classification, HuggingFace Inference Endpoints y servicios propios en Python. No se documenta soporte para vLLM, TGI, llama.cpp u Ollama, que estan orientados a modelos generativos autoregresivos y no encajan con este tipo de cabezas de decision.
- Latencia y throughput: solo se publican cifras relativas. El batching `predict_auto_1k` reduce la latencia mediana aproximadamente un 23 % para 32 preguntas cortas y un 35 % para el fixture de contexto multiple, respecto a lotes mas pequenos (B8/B32). No hay cifras absolutas de latencia ni de tokens por segundo en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Decision-1.0-Lex | 572 M | 1.024 tokens | Clasificacion de decisiones (Choice, Noul, Score), ingles | Apache 2.0 | HuggingFace, sin solicitud de acceso |
| Laya Typed Decisions | no disponible | no disponible | Clasificacion de decisiones tipadas | no disponible | checkpoint oficial citado en la evaluacion de Lex |
| Decision-1.0-Kai (modelo base) | no disponible | no disponible | Decisiones generales y tareas multilingues mas amplias | Apache 2.0 | HuggingFace |
| Vela-1.0-Encoder-307M | 307 M (segun el nombre) | no disponible | Encoder base sobre el que se apoya la familia | no disponible | HuggingFace |

No se dispone de datos publicados que permitan comparar a Lex con clasificadores genericos tipo BERT o DeBERTa en las mismas tareas; la unica comparacion cuantitativa publicada es la que aparece en la seccion de benchmarks frente a Laya Typed Decisions.

## Limitaciones y advertencias

- Las probabilidades de salida no son confianza calibrada, segun advierte explicitamente la model card.
- El orden de los candidatos y la redaccion de la tarea pueden alterar los resultados; conviene fijar plantillas y orden estables en produccion.
- El presupuesto de 1.024 tokens es total e incluye contexto, instrucciones, candidatos y tokens especiales. Las peticiones que lo exceden devuelven error, lo que obliga a truncar o resumir el contexto previamente.
- No es un modelo generativo: no produce texto libre, no razona en varios pasos ni soporta tool calling, por lo que no puede usarse como sustituto de un LLM conversacional.
- El modelo esta especializado en ingles; no hay evidencia publicada de rendimiento en castellano ni en otros idiomas.
- En la tarea Noul, Laya obtiene mejor exactitud (85,67 % frente a 84,67 %), y tambien lidera en metricas de calidad probabilistica.
- La mejora global frente a Laya esta dentro del intervalo pareado de -0,20 a +3,15 puntos, de modo que no se puede afirmar superioridad estadisticamente solida con la muestra evaluada.
- Riesgo de alucinacion en el sentido generativo: no aplica. El riesgo equivalente es la clasificacion erronea o la asignacion de una probabilidad alta a una accion incorrecta en un flujo automatizado.
- No se han publicado evaluaciones de sesgo, equidad ni robustez frente a entradas adversariales.
- La licencia es Apache 2.0, lo que permite uso comercial, pero existen un fichero NOTICE con terminos de terceros retenidos y un LICENSING_STATUS.md que acota el alcance de la licencia; conviene revisarlos antes de un despliegue comercial.
- El modelo es reciente y con muy poca traccion externa (0 descargas y 3 likes en el momento de la consulta), por lo que la validacion independiente es practicamente inexistente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/llm-semantic-router/Decision-1.0-Lex
- Modelo base Kai: https://huggingface.co/llm-semantic-router/Decision-1.0-Kai
- Encoder base Vela-1.0-Encoder-307M: https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M
- Coleccion Decision 1.0: https://huggingface.co/collections/llm-semantic-router/decision-10-6ab12177bd0002394d8409f9
- Demo Decision Studio: https://llm-semantic-router-decision-studio.hf.space
- Evaluacion completa de Lex: https://gist.github.com/Xunzhuo/76b59cb158ce5069a53b946c6f0ee656#file-01-lex-evaluation-md
- Documentacion de arquitectura (ARCHITECTURE.md), metodos de entrenamiento (METHODS.md), ejemplos de uso (USAGE.md), fine-tuning (FINETUNING.md), rendimiento (PERFORMANCE.md), avisos legales (NOTICE) y alcance de licencia (LICENSING_STATUS.md): referenciados en la model card del repositorio de HuggingFace. El enlace directo no esta disponible en la informacion proporcionada.
- La busqueda web realizada no devolvio enlaces especificos sobre este modelo: los resultados fueron referencias genericas sobre modelos de lenguaje (Wikipedia y GeeksforGeeks) sin relacion con Decision-1.0-Lex.
