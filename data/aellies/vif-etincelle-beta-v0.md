# aellies/vif-etincelle-beta-v0

## Resumen

Vif Étincelle beta-v0 es un modelo de decisión bilingüe (frances/ingles) desarrollado por el usuario aellies, publicado en HuggingFace el 23 de septiembre de 2026. No es un modelo generativo: en lugar de producir texto, responde a decisiones tipadas con tres modalidades, `choice` (elegir una opcion de una lista libre), `score` (puntuar sobre niveles ordenados descritos en palabras) y `yesno` (pregunta binaria), devolviendo una probabilidad por candidato y una puntuacion de confianza. Su uso previsto principal es la toma de decisiones autonoma de alto nivel en robotica (navegacion, priorizacion de tareas, gestion de energia, marcado de anomalias) a partir de descripciones de estado derivadas de sensores, nunca control de seguridad de bajo nivel.

Tecnicamente se construye sobre el encoder EuroBERT-210m (Apache 2.0, 210 M de parametros, requiere `trust_remote_code=True`) al que se anade una cabeza lineal de scoring en configuracion cross-encoder. El modelo completo tiene 211.766.785 parametros y el repositorio ocupa 0,9 GB. Se entreno con una longitud de secuencia de 512 tokens, aunque el encoder base soporta hasta 8192 (capacidad aun no explotada).

Es relevante ahora por dos motivos: primero, se enmarca en la categoria de "decisiones tipadas, no chat" popularizada por Jev de TypeSafe AI (sin afiliacion, codigo, pesos ni marca compartidos), una alternativa a los LLM generativos para pipelines de decision donde se necesita una salida estructurada y probabilistica. Segundo, y de forma igualmente importante, el autor es explicito sobre su caracter de beta temprana: sin calibracion de temperatura, sin deteccion out-of-distribution y entrenado casi por completo con datos sinteticos. Es un checkpoint de validacion de pipeline end-to-end, no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder: encoder EuroBERT-210m + cabeza lineal de scoring (un logit escalar por candidato, softmax sobre el conjunto de candidatos) |
| Parametros totales | 211.766.785 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens en entrenamiento; el encoder base soporta hasta 8192 tokens, no explotados en este checkpoint |
| Tipos de cuantizacion | No se documentan cuantizaciones oficiales. El repositorio distribuye pesos en safetensors (0,9 GB), coherente con precision completa para 211,8 M de parametros |
| Idiomas soportados | Ingles (en) y frances (fr), incluyendo ejemplos de mezcla de ambos idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (arquitectura personalizada, no cargable con `AutoModel.from_pretrained`) |
| Pipeline declarado en HuggingFace | robotics |
| Modelo base | EuroBERT/EuroBERT-210m |
| Descargas / likes | 0 descargas / 2 likes |
| Fecha de creacion | 23 de septiembre de 2026 |
| Ultima actualizacion | 23 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo usa un esquema cross-encoder: se concatenan estado, pregunta y candidato con separadores (`state [SEP] question [SEP] candidate`), se pasan por el encoder EuroBERT-210m, se aplica mean pooling sobre los estados ocultos y se proyecta con una cabeza lineal a un unico logit escalar por candidato. Todos los candidatos de una misma pregunta se puntuan conjuntamente y se convierten en una distribucion de probabilidad mediante softmax. Las modalidades `choice` y `score` usan las opciones o niveles proporcionados por el usuario como candidatos; `yesno` se trata internamente como un `choice` de dos candidatos (`yes`/`no`, o `oui`/`non` cuando la pregunta se detecta como francesa).

El entrenamiento se realizo sobre 3.394 ejemplos (2.716 de entrenamiento, 339 de validacion, 339 de test), aproximadamente equilibrados entre ingles, frances y pares de idioma mezclado. De ellos, 3.000 son ejemplos de robotica generados por un script determinista basado en reglas (sin LLM) que cubre 6 tipos de robot (movil, brazo, dron, domestico, agricola, almacen) y 4 categorias de casos dificiles (valores cercanos al umbral, senales en conflicto, lecturas de sensor erroneas o atipicas y ausencia de opcion claramente buena); las etiquetas de referencia se calculan por reglas explicitas. Los 394 ejemplos restantes son de proposito general (soporte al cliente, planificacion de agentes, analisis de sentimiento, planificacion de horarios), generados localmente con Qwen2.5-7B-Instruct (Apache 2.0); no se uso salida de ninguna API propietaria. No se documenta uso de RLHF ni DPO, ni innovaciones como decodificacion especulativa o atencion lineal: es un encoder con cabeza de clasificacion.

## Capacidades

- Decision tipada `choice`: seleccionar una opcion entre una lista libre de candidatos definida por el usuario, devolviendo probabilidad por candidato.
- Decision tipada `score`: puntuar sobre niveles ordenados descritos en palabras.
- Decision tipada `yesno`: responder a una pregunta binaria, con gestion automatica del par `yes`/`no` o `oui`/`non` segun el idioma detectado en la pregunta.
- Salida probabilistica estructurada: distribucion softmax sobre candidatos mas un campo `confidence`.
- Procesamiento bilingue ingles/frances, incluidos casos de mezcla de idiomas en la misma entrada.
- Interpretacion de descripciones de estado derivadas de sensores (nivel de bateria, distancia a obstaculo, senales contradictorias, lecturas atipicas).
- Clasificacion generica y uso como componente de agentes mas alla de la robotica (soporte al cliente, planificacion, sentimiento, horarios), aunque con rendimiento notablemente inferior segun la propia evaluacion del autor.
- No soporta generacion de texto libre, tool calling, function calling, vision, audio ni modo de razonamiento explicito. El campo `ood_flag` de la API de referencia existe pero siempre devuelve `false`, es decir, no hay deteccion out-of-distribution implementada.

## Casos de uso

- Navegacion de robot movil: dado un estado como "bateria al 15 %, por debajo del umbral bajo del 25 %; distancia al obstaculo: 300 cm", el modelo responde a preguntas del tipo "deberia el robot volver a la base a recargar ahora?" con una probabilidad por opcion. Es adecuado porque el problema se formula como eleccion entre alternativas discretas con contexto corto, justo el regimen para el que se entreno.
- Gestion de energia de flota: decidir entre seguir operando, reducir prestaciones o recargar, a partir de descripciones textuales de telemetria. La modalidad `score` permite graduar la decision en niveles ordenados (por ejemplo, prioridad baja/media/alta) en lugar de forzar un binario.
- Priorizacion de tareas en almacen o agricultura: ordenar o seleccionar la siguiente tarea ante senales en conflicto. El entrenamiento incluye explicitamente categorias de casos dificiles (umbrales ajustados y senales contradictorias), con resultados declarados del 88-100 % en esas categorias.
- Marcado de anomalias: usar la modalidad `yesno` para senalar lecturas atipicas o fallos de sensor antes de escalar a un operador humano o a un sistema de nivel superior.
- Triaje de conversaciones de soporte al cliente: clasificar el tipo de incidencia o decidir el siguiente paso en un flujo de atencion. Advertencia importante: el propio autor reporta solo un 43,8 % de acierto en el dominio `customer_support`, muy por debajo de los dominios roboticos (95-100 %), por lo que este caso de uso exige validacion previa y probablemente reentrenamiento.
- Seleccion de accion en planificacion de agentes: elegir entre herramientas o siguientes pasos en un flujo multi-paso, aprovechando la salida probabilistica para umbralizar la confianza antes de actuar.
- Clasificacion de sentimiento o intencion en encuestas bilingues: formular la tarea como `choice` o `score` con niveles descritos en palabras, utiles cuando se necesita una salida ordinal y no una etiqueta puramente categorica.
- Componente de decision en pipelines con restricciones de latencia o de coste: al ser un encoder de 211,8 M de parametros con secuencias de 512 tokens, puede ejecutarse en CPU o en GPU de consumo dentro del mismo proceso que el resto del sistema.

## Benchmarks y rendimiento

Evaluacion sobre el conjunto de test reservado (339 ejemplos nunca vistos durante el entrenamiento), segun los datos publicados en la model card:

| Metrica | Valor |
|---|---|
| Precision global | 92,9 % |
| Precision por modalidad: choice / score / yesno | 89,9 % / 93,0 % / 95,5 % |
| Precision por idioma: ingles / frances / mixto | 86,7 % / 96,6 % / 95,4 % |
| Casos dificiles (umbral, senales en conflicto, sensor defectuoso, sin opcion buena) | 88-100 % |
| Baselines triviales de clase mayoritaria: score / yesno / choice | 21,7 % / 44,1 % / 34,3 % |
| Dominio weakness declarado: customer_support | 43,8 % |

No se han publicado curvas de calibracion (ECE, diagramas de fiabilidad) para este checkpoint; estan planificadas para la siguiente version. No hay resultados de benchmarks estandar tipo MMLU, HumanEval o GSM8K, y no serian aplicables directamente porque el modelo no genera texto.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,85 GB en FP32, 0,42 GB en FP16/BF16 y 0,21 GB en INT8 para los 211,8 M de parametros (estimaciones teoricas a partir del numero de parametros; el repositorio ocupa 0,9 GB en safetensors).
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, etc. Tambien es viable en CPU y en Apple Silicon via MPS, ya que el script `decide.py` incluye seleccion automatica de dispositivo entre CUDA, MPS y CPU.
- GPU de datacenter (A100, H100) no son necesarias para inferencia; solo tendrian sentido para reentrenamiento o fine-tuning a escala.
- El autor reporta problemas en GPUs CUDA recientes con arquitectura Blackwell (sm_120, observado en una RTX 5060 Ti) relacionados con las rutas optimizadas de atencion flash / memory-efficient (informacion truncada en la model card).
- Opciones de despliegue: carga obligatoria a traves de `decide.py` o `example_usage.py` del repositorio, que gestionan la descarga del snapshot, un shim de compatibilidad de `config.json`, un parche de RoPE y la seleccion de dispositivo. No es cargable con `AutoModel.from_pretrained` de forma correcta, pese a que el campo `model_type` de `config.json` este definido para que las herramientas ingenuas no fallen.
- Compatibilidad: no hay soporte documentado para vLLM, TGI, Ollama ni llama.cpp, y no se distribuyen pesos GGUF. `EuroBERT/EuroBERT-210m` falla con `KeyError: 'default'` en `transformers>=5` porque el registro `ROPE_INIT_FUNCTIONS` elimino la entrada "default"; los scripts del repositorio incluyen un parche que la restaura.
- Latencia y throughput: no disponibles. Por tamano y longitud de secuencia se espera una inferencia muy rapida, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|---|
| Vif Étincelle beta-v0 | 211,8 M | 512 tokens en entrenamiento (base hasta 8192) | Decisiones tipadas (choice/score/yesno) bilingues FR/EN | Apache 2.0 | HuggingFace, carga via codigo propio | 92,9 % global en test sintetico propio; 43,8 % en customer_support |
| EuroBERT/EuroBERT-210m (modelo base) | 210 M | Hasta 8192 tokens | Encoder multilingue de proposito general | Apache 2.0 | HuggingFace | No disponible en esta informacion; no resuelve decisiones tipadas sin fine-tuning |
| Qwen2.5-7B-Instruct | 7.600 M aprox. | No disponible en esta informacion | LLM generativo de proposito general con soporte de instrucciones | Apache 2.0 | HuggingFace | No disponible en esta informacion; se uso solo como generador de datos sinteticos en este proyecto |
| Jev (TypeSafe AI) | No disponible | No disponible | Decisiones tipadas, no chat (categoria conceptual de referencia) | Propietaria / no disponible | Comercial, sin codigo ni pesos compartidos | No disponible |

No se identifican en la informacion proporcionada otros modelos abiertos directamente comparables en la categoria de decisiones tipadas bilingues; el resto de alternativas son LLM generativos que requeririan formateo y parseo adicionales para producir salidas estructuradas con probabilidad por candidato.

## Limitaciones y advertencias

- Checkpoint beta temprano: el propio autor lo describe como v0 entrenado rapido para validar el pipeline completo (datos, entrenamiento, API, publicacion) y anuncia que sera reemplazado por versiones mejores.
- Sin calibracion: no se ha aplicado temperature scaling ni ningun otro metodo. Las puntuaciones de confianza son salidas softmax en crudo y probablemente estan sobreconfiadas (cerca de 1,0 en ejemplos faciles). No deben interpretarse como probabilidades reales.
- Sin deteccion out-of-distribution: el campo `ood_flag` de la API de referencia siempre devuelve `false`.
- Entrenamiento casi integramente sintetico: 3.000 ejemplos de robotica generados por reglas deterministas y 394 de proposito general generados con Qwen2.5-7B-Instruct. No hay texto real escrito o curado por humanos, lo que limita la generalizacion a distribuciones reales.
- Debilidad declarada en soporte al cliente: 43,8 % de acierto en el test reservado, frente al 95-100 % en dominios roboticos. Se espera un rendimiento notablemente peor fuera del caso de uso robotico principal.
- Rendimiento desigual por idioma: 86,7 % en ingles frente a 96,6 % en frances. El mix de idiomas en produccion puede degradar los resultados si predomina el ingles.
- Nunca usar para control de seguridad de bajo nivel: el propio autor restringe el uso a decision de alto nivel. No es un componente apto para bucles de control critico para la seguridad.
- Arquitectura personalizada: no es cargable con `AutoModel.from_pretrained` ni compatible con las herramientas estandar de despliegue (vLLM, TGI, Ollama, llama.cpp). Requiere el codigo del repositorio.
- Dependencia de parches de compatibilidad: hace falta un shim de `config.json` y un parche de RoPE, y hay problemas reportados en GPUs Blackwell (sm_120).
- Sesgos: no se documenta ninguna evaluacion de sesgos, y el dataset sintetico esta sesgado hacia un catalogo cerrado de 6 tipos de robot y 4 categorias de casos dificiles.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, siempre citando atribuciones y conservando el aviso de licencia. No hay restricciones adicionales documentadas.
- Madurez del ecosistema: 0 descargas y 2 likes en el momento de la consulta; no hay repositorio de codigo publico enlazado todavia (la model card indica que el enlace se anadira cuando el repositorio sea publico). El archivo `data/SOURCES.md` referenciado aun no es accesible.
- Sin resultados en benchmarks estandar: no hay datos de MMLU, GSM8K, HumanEval ni similares, y no serian directamente aplicables a un modelo no generativo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aellies/vif-etincelle-beta-v0
- Modelo base en HuggingFace: https://huggingface.co/EuroBERT/EuroBERT-210m
- Referencia conceptual (TypeSafe AI, Jev): https://typesafe.ai
- Repositorio del proyecto: pendiente de publicacion segun la model card (enlace por anadir); el archivo `data/SOURCES.md` con la documentacion de fuentes y licencias se encontrara alli.
- Scripts de uso incluidos en el repositorio: `decide.py` y `example_usage.py`.
- Paper, blog o demo adicionales: no disponible.
