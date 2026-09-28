# daavidhauser/Swift-1.5-Qwen3.8-27B-W4A16-HyperQwen-fast

## Resumen

Swift-1.5-Qwen3.8-27B-W4A16-HyperQwen-fast es un checkpoint cuantizado publicado por el usuario daavidhauser a partir de ukisai/Swift-1.5-Qwen3.8-27b, un modelo de la familia Qwen 3.5 afinado por UkisAI para razonamiento eficiente en tokens. La conversion no anade fine-tuning: lo que hace es adaptar el cuerpo AWQ INT4 del modelo original al runtime HyperQwen, anadir embeddings en INT8 y cuantizar a GPTQ INT4 la cabeza de salida (lm_head) y ocho matrices lineales de MTP (multi-token prediction) para habilitar decodificacion especulativa.

El problema que aborda es de coste por tarea, no de calidad bruta. La model card reporta que, sobre 630 tareas y con dos peticiones concurrentes en una RTX 3090, este checkpoint genera un 37 % menos de tokens de salida que la referencia Qwen fast (5.669 frente a 8.985 tokens por tarea) y reduce el tiempo medio por peticion un 37 % (68,2 s frente a 108,1 s). La idea es que Swift 1.5 reduce lo que hay que generar y HyperQwen acelera la generacion, de modo que el tiempo total de tarea baja incluso cuando los tokens por segundo son algo inferiores (107,2 frente a 112,1 tokens/s de mediana).

Es relevante ahora porque demuestra un patron de cuantizacion mixta por componente (INT4 en el cuerpo, INT8 en embeddings, GPTQ INT4 en cabezas y matrices MTP) sobre un runtime de servicio parcheado, con evaluacion local publicada. El checkpoint, sin embargo, no funciona con vLLM estandar ni con herramientas GGUF: exige el runtime HyperQwen. La licencia es swift-open-license-1.0, con la licencia Apache 2.0 del modelo base conservada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; etiquetado como qwen3_5, con cabezas MTP (multi-token prediction) para decodificacion especulativa y pesos de vision conservados (evaluacion solo texto) |
| Parametros totales | 6.284.447.760 segun los safetensors del repositorio; el nombre del repositorio referencia "27B" (discrepancia no explicada en la model card) |
| Parametros activos | No disponible (no se indica si la arquitectura es MoE) |
| Longitud de contexto | 150.000 tokens en la configuracion de evaluacion (ajuste de runtime, no propiedad fija del modelo); 128.000 tokens de salida por llamada |
| Tipos de cuantizacion | AWQ INT4 (W4A16) en el cuerpo; embeddings en INT8; GPTQ INT4 en lm_head y en ocho matrices lineales MTP |
| Idiomas soportados | No disponibles; la evaluacion de perplejidad cubre ingles, danes y codigo Python |
| Licencia | swift-open-license-1.0 (etiquetada como "other"); se conservan LICENSE, LICENSE-APACHE-2.0 (modelo base) y NOTICE |
| Formato de pesos | safetensors en formato compressed-tensors |
| Tamano del repositorio | 16,0 GB |

## Arquitectura y entrenamiento

No hay entrenamiento adicional en esta conversion. Se preserva el cuerpo AWQ INT4 del modelo upstream (ukisai/Swift-1.5-Qwen3.8-27b-W4A16-AWQ) y el entrenamiento de eficiencia de razonamiento de Swift 1.5. Los cambios son de cuantizacion: embeddings convertidos a INT8, lm_head y ocho matrices lineales MTP cuantizadas a GPTQ INT4 directamente desde los tensores BF16 originales, y reconstruccion de la lista corta (shortlist) del borrador MTP usando 65.536 tokens de respuestas de Swift, manteniendo el vocabulario completo del modelo objetivo. Los pesos de vision se conservan en el checkpoint aunque no se evaluaron.

El detalle arquitectonico de la red subyacente (numero de capas, atencion, si hay componentes MoE o hibridos, composicion del dataset de entrenamiento, uso de RLHF o DPO) no se documenta en la informacion disponible. La model card indica ademas que fue redactada por un sistema automatico ("GPT-6 Astra"), lo que conviene tener en cuenta al evaluar la trazabilidad de las afirmaciones tecnicas. El autor declara que el checkpoint ya viene convertido y que no deben recuantizarse sus cabezas.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline text-generation, etiqueta conversational).
- Razonamiento con modo thinking, evaluado con esfuerzo "xhigh", temperatura 1,0, top_p 0,95 y top_k 20.
- Razonamiento eficiente en tokens: reduccion del 37 % en tokens de salida frente a la referencia Qwen fast en la mezcla de 630 tareas evaluada.
- Matematicas: 97,5 %-98,0 % en el subconjunto de 200 preguntas de GSM8K con thinking desactivado.
- Codigo: 91 % en un subconjunto congelado de 100 problemas de LiveCodeBench (34 faciles, 33 medios, 33 dificiles, Python stdin/stdout), con juez propio; no es un resultado oficial completo.
- Tool calling y salida JSON: 30/30 en verificaciones propias (20 tareas de herramienta meteorologica con conversion Celsius-Fahrenheit y 10 tareas de filtrado de inventario en JSON). Son comprobaciones de integracion, no un benchmark de agentes externo.
- Seguimiento de instrucciones estrictas: 72,3 % en IFBench con el verificador oficial estricto a nivel de prompt.
- Decodificacion especulativa MTP integrada en el runtime.
- Vision: pesos conservados en el checkpoint, pero sin evaluacion ni documentacion de uso.
- Capacidades multilingues: no documentadas como soporte oficial; solo se reporta perplejidad sobre ingles, danes y Python.
- Razonamiento agente multi-paso: no se documenta ningun benchmark especifico de agentes.

## Casos de uso

- Agente de codigo en una sola GPU de gama alta de consumo: con ~16 GB de pesos y FP8 para la cache KV, el checkpoint esta pensado para ejecutarse en una RTX 3090 de 24 GB, lo que permite tener un modelo de razonamiento con tool calling en una estacion de trabajo sin clúster.
- Asistente de razonamiento matematico con presupuesto de tokens estricto: la reduccion de tokens de salida por tarea (5.669 frente a 8.985) abarata el coste por respuesta en tareas tipo GSM8K, donde mantiene 97,5 %.
- Generacion de JSON estructurado en pipelines de datos: las 30 comprobaciones de tool call y JSON dieron 30/30, lo que lo hace apto para extraccion y filtrado de inventarios, validacion de esquemas y llamadas a APIs.
- Atencion al cliente multi-turno: la configuracion de evaluacion admite 150.000 tokens de contexto, suficiente para hilos largos con historial, documentacion de producto y resultados de herramientas en la misma ventana.
- Cumplimiento de instrucciones restrictivas en generacion de contenido: 72,3 % en IFBench estricto, util para plantillas con formato obligatorio, listas de palabras prohibidas o limites de longitud.
- Evaluacion e investigacion de decodificacion especulativa: sirve como banco de pruebas reproducible de cuantizacion mixta (INT4/INT8) y de listas cortas MTP reconstruidas con datos del propio modelo.
- Automatizacion de tareas de codigo con pasos multiples: el modelo puede ejecutar ciclos de generacion, llamada a herramienta y revision sobre el mismo contexto largo, aunque no haya benchmark de agente publicado.
- Despliegue en entornos con soberania de datos: al caber en una unica GPU local, permite mantener prompts y codigo en la propia infraestructura, condicionado por los terminos de la swift-open-license-1.0.

## Benchmarks y rendimiento

Rendimiento en la campana del autor (RTX 3090, 630 tareas, dos peticiones concurrentes):

| Medicion | Qwen fast | Swift 1.0 | Swift 1.5 INT8 heads | Swift 1.5 fast |
|---|---:|---:|---:|---:|
| Tiempo medio por peticion (menor es mejor) | 108,1 s | 66,2 s | 72,2 s | 68,2 s |
| Tokens de salida medios por tarea (menor es mejor) | 8.985 | 5.245 | 5.751 | 5.669 |
| Tokens/s de decodificacion, mediana (mayor es mejor) | 112,1 | 105,9 | 104,0 | 107,2 |
| Total de tokens de salida, 630 tareas | 5,66 M | 3,30 M | 3,62 M | 3,57 M |

Calidad:

| Prueba | Qwen fast | Swift 1.0 | Swift 1.5 INT8 heads | Swift 1.5 fast |
|---|---:|---:|---:|---:|
| GSM8K, subconjunto de 200 preguntas | 97,5 % | 98,0 % | 98,0 % | 97,5 % |
| IFBench, 300 prompts, estricto | 74,0 % | 73,3 % | 73,7 % | 72,3 % |
| LiveCodeBench, subconjunto de 100 problemas | 90 % | 89 % | 89 % | 91 % |
| Comprobaciones propias de tool call/JSON, 30 tareas | 29/30 | 28/30 | 30/30 | 30/30 |
| Perplejidad, ingles/danes/Python (menor es mejor) | 8,143 | 8,215 | 8,252 | 8,318 |
| Respuestas truncadas, contadas como incorrectas | 2 | 1 | 1 | 0 |

Notas metodologicas declaradas por el autor: GSM8K usa las 200 primeras preguntas del split de test con thinking desactivado; IFBench usa todos los prompts del dataset fijado y el verificador oficial estricto a nivel de prompt; LiveCodeBench es un subconjunto congelado de la era v6 (34 faciles, 33 medios, 33 dificiles) puntuado con juez propio y no es un resultado oficial; las comprobaciones de tool call son integraciones propias, no un benchmark de agentes. La prueba de tokens/s es independiente, con un solo request, cuatro prompts cortos repetidos dos veces y 512 tokens de salida greedy cada uno. Todos los checkpoints se ejecutaron con los mismos ajustes y presupuestos de tarea.

Frente a la variante Swift 1.5 INT8-head, esta conversion "fast" midio un 3,2 % mas de tokens/s de decodificacion y un 5,5 % menos de tiempo medio por peticion, con cambios mixtos en las puntuaciones.

## Requisitos de hardware

- El repositorio ocupa 16,0 GB, referencia del espacio necesario para pesos; no se publica un desglose de VRAM.
- Unico hardware documentado en la evaluacion: una RTX 3090 de 24 GB, con cache KV en FP8.
- Configuracion de contexto usada: 150.000 tokens configurados y hasta 128.000 tokens de salida por llamada, ajustes de runtime que consumen VRAM adicional segun la longitud real de las secuencias.
- No se documentan pruebas en A100, H100 ni otras GPUs; no hay datos de si cabe en GPUs de 16 GB o menos.
- Despliegue: requiere el runtime HyperQwen parcheado. No funciona con vLLM estandar ni con herramientas GGUF, Ollama o llama.cpp. Comando de arranque indicado en la model card: `MODEL=... CTX=long MAX_LEN=150000 SPEC=mtp bash single-user/start_qwen.sh`.
- Throughput medido: 107,2 tokens/s de decodificacion (mediana, request unico con prompts cortos, 512 tokens greedy).
- Tiempo medio por peticion: 68,2 s con dos peticiones concurrentes sobre la mezcla de 630 tareas; el propio autor advierte que estos tiempos incluyen fallos y no son medidas de latencia monousuario.
- Los ajustes de lote multiusuario no se evaluaron en esta campana.
- Advertencia del autor: el checkpoint ya esta convertido, no hay que recuantizar sus cabezas.

## Comparativa con modelos similares

Los unicos puntos de comparacion publicados son los cuatro checkpoints de la misma campana, todos servidos con HyperQwen sobre RTX 3090:

| Modelo | Tiempo medio por peticion | Tokens de salida por tarea | Tokens/s (mediana) | GSM8K (200) | IFBench estricto | Perplejidad |
|---|---:|---:|---:|---:|---:|---:|
| Qwen fast (referencia cuantizada AutoRound) | 108,1 s | 8.985 | 112,1 | 97,5 % | 74,0 % | 8,143 |
| Swift 1.0 | 66,2 s | 5.245 | 105,9 | 98,0 % | 73,3 % | 8,215 |
| Swift 1.5 INT8 heads | 72,2 s | 5.751 | 104,0 | 98,0 % | 73,7 % | 8,252 |
| Swift 1.5 fast (este checkpoint) | 68,2 s | 5.669 | 107,2 | 97,5 % | 72,3 % | 8,318 |

En parametros, contexto, licencia y disponibilidad no hay comparativa publicada con alternativas externas: el autor no ofrece datos frente a otros modelos de tamano similar, y el dato real de safetensors (6.284.447.760 parametros) no coincide con el "27B" del nombre del repositorio, por lo que cualquier comparacion por tamano deberia verificarse contra la ficha del modelo base. La referencia Qwen fast es una conversion cuantizada con AutoRound, no el Qwen en BF16, y el autor lo senala explicitamente.

## Limitaciones y advertencias

- Los resultados son de una sola semilla y de una evaluacion local; el propio autor advierte que las diferencias pequenas de precision no establecen una clasificacion universal.
- La referencia Qwen fast es una cuantizacion AutoRound, no el modelo en BF16, por lo que las comparaciones de calidad estan sesgadas por la cuantizacion de la referencia.
- Perplejidad ligeramente peor que Qwen fast (8,318 frente a 8,143) y peor IFBench (72,3 % frente a 74,0 %); las diferencias se declaran no concluyentes.
- No se han publicado evaluaciones de sesgo, toxicidad ni tasas de alucinacion.
- Idiomas soportados no documentados. El checkpoint pertenece a la familia Qwen 3.5, con cobertura multilingue amplia en el modelo base, pero la unica evidencia aqui es la perplejidad sobre ingles, danes y Python; no hay benchmarks por idioma.
- El modo thinking se evaluo con esfuerzo "xhigh" y presupuesto de salida muy alto (hasta 128.000 tokens por llamada), lo que implica coste elevado y riesgo de respuestas truncadas si el presupuesto no se ajusta.
- Requiere un runtime parcheado (HyperQwen): no es desplegable con vLLM estandar, llama.cpp, Ollama ni GGUF, lo que limita la portabilidad y ata el servicio a un repositorio concreto.
- No se evaluaron ajustes multiusuario; el rendimiento con lotes grandes es desconocido.
- Los pesos de vision se conservan pero no se evaluaron; no debe asumirse capacidad multimodal utilizable.
- Licencia swift-open-license-1.0 (license: other): no es una licencia OSI estandar, por lo que hay que revisar el texto de LICENSE antes de cualquier uso comercial, ademas de la licencia Apache 2.0 del modelo base y el NOTICE.
- El checkpoint tiene 0 descargas y 0 likes en el momento de la consulta: no hay validacion independiente por parte de la comunidad.
- La model card fue redactada por un sistema automatico, segun se declara en ella misma; conviene verificar las afirmaciones contra el codigo de evaluacion incluido.
- Discrepancia de tamano: el nombre indica 27B y los safetensors del repositorio suman 6.284.447.760 parametros. No se explica en la informacion disponible; hay que confirmar el dato antes de dimensionar el despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/daavidhauser/Swift-1.5-Qwen3.8-27B-W4A16-HyperQwen-fast
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Cuantizacion AWQ upstream de UkisAI: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b-W4A16-AWQ
- Runtime HyperQwen: https://github.com/syv-ai/HyperQwen
- Coleccion con las tres variantes Swift HyperQwen: https://huggingface.co/collections/daavidhauser/swift-for-hyperqwen-rtx-3090-benchmarks-6abac232566f58d5e7c5a046
- Entrenamiento de Swift: UkisAI (https://huggingface.co/ukisai)
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset IFBench test: https://huggingface.co/datasets/allenai/IFBench_test
- Dataset LiveCodeBench code_generation_lite: https://huggingface.co/datasets/livecodebench/code_generation_lite
- Ficheros de licencia y avisos incluidos en el repositorio: LICENSE (swift-open-license-1.0), LICENSE-APACHE-2.0, NOTICE
- Instrucciones de instalacion y ajustes evaluados: RUNTIME.md (dentro del repositorio)
- Codigo y resultados de evaluacion: carpeta evaluation/ (dentro del repositorio)
