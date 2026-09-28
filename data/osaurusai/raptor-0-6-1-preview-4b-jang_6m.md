# OsaurusAI/Raptor-0.6.1-preview-4B-JANG_6M

## Resumen

Raptor-0.6.1-preview-4B-JANG_6M es una version preliminar (preview) de un ajuste supervisado de XHToken/Spark-X2.5-4B, un modelo denso de 4.112.079.360 parametros (4,11 mil millones) con capacidades de razonamiento y uso de herramientas. Lo desarrolla OsaurusAI y esta pensado para operar dentro de Osaurus, su entorno de agentes: decide cuando invocar una herramienta, cual elegir, como recuperarse de errores, cuando conviene preguntar al usuario y como delegar trabajo en sub-agentes, tanto con el modo de razonamiento activado (`<think>`) como desactivado.

El modelo conserva el tokenizador y la plantilla de chat de su base sin cambios y se distribuye ya cuantizado con el esquema propietario JANG_6M, que deja la atencion y el embedding ligado a 8 bits y el MLP a 6 bits, con tamano en disco de 3,41 GiB y 7,126 bits por peso. Esta optimizado para Apple Silicon y se ejecuta a traves de la libreria MLX, con el runtime de inferencia integrado en el propio arnes de Osaurus.

Es relevante ahora porque aborda un problema concreto de los agentes en produccion (la orquestacion fiable de herramientas y la recuperacion ante fallos) con un modelo pequeno que cabe en un portatil. Al ser una preview publicada para pruebas, su autor la presenta como candidata a sustituir al modelo ya publicado OsaurusAI/Raptor-0.6-4B-JANG_6M. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Arquitectura propietaria "spark2_5" heredada de XHToken/Spark-X2.5-4B; no soportada por `mlx-lm` (definida en la informacion como densa, con atencion y MLP, pero sin mas detalle estructural) |
| Parametros totales | 4.112.079.360 (4,11 mil millones) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | JANG_6M: atencion y embedding ligado a 8 bits, MLP a 6 bits, tamano de grupo 64, escalas de grupo en bfloat16, puerta de atencion por cabeza y todas las normas en precision completa; 7,126 bits por peso |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |
| Tamano en disco | 3,41 GiB |
| Modelo base | XHToken/Spark-X2.5-4B |
| Libreria | mlx |
| Runtime requerido | Osaurus 0.25.14 o superior (declarado en `osaurus.json`) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) mediante LoRA de rango 16 y alpha 32 sobre XHToken/Spark-X2.5-4B. A diferencia del Raptor 0.6, que solo tocaba la atencion, este LoRA se aplica tanto a la atencion como al MLP: 180 matrices fusionadas en los pesos finales. El corpus de entrenamiento es un conjunto construido especificamente para el arnes (harness) de Osaurus, con aproximadamente 3.500 decisiones. Combina respuestas autodestiladas en politica (las propias respuestas aceptadas del modelo base sustituyen a las escritas a mano cuando ya son correctas) con lotes dirigidos a las debilidades detectadas en 0.6: ambiguedad de MCP, deshacer y recuperacion, decidir entre responder o preguntar, planificacion, descubrimiento de herramientas heredadas, actuar en lugar de declarar, actuar pese al historial, confirmar antes de acciones destructivas y onboarding sin carpeta.

En el entrenamiento se uso perdida por decision (cada decision pesa lo mismo independientemente de su longitud) y un checkpoint temprano (6 de las 16 actualizaciones), dosis que segun el autor conserva las mejoras sin el aumento de fabricacion de contenido observado en fases posteriores. La cuantizacion JANG_6M se calibro con 1,69 millones de tokens capturados sobre estos mismos pesos ajustados (no se reutilizaron las estadisticas de 0.6), procedentes de conversaciones del arnes con prompts de sistema y esquemas de herramientas reales de Osaurus, multiturno, llamadas a herramientas y resultados agrupados, errores y recuperacion, y turnos sin carpeta, con razonamiento activado y desactivado, ademas de generaciones propias del modelo. Esa captura alimenta el escalado sensible a activaciones (72/72 sitios de plegado de normas, 36/36 proyecciones de puerta de atencion), la importancia por canal y el ajuste con correccion de error (180/181 tensores; el holdout es el embedding ligado). La captura no contiene chino, opcion multiple academica ni texto de mas de 4K tokens.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Razonamiento explicito con modo de pensamiento (`<think>`) activable y desactivable.
- Uso de herramientas (tool calling / function calling) integrado en el contrato de Osaurus.
- Decision de orquestacion: cuando invocar una herramienta y cuando responder directamente.
- Seleccion de herramienta y gestion de ambiguedad (incluida ambiguedad de MCP).
- Recuperacion de errores y flujo de deshacer (undo/recovery).
- Decision entre responder o pedir aclaracion al usuario.
- Planificacion y programacion de tareas.
- Delegacion en sub-agentes.
- Descubrimiento de herramientas heredadas (legacy tool discovery).
- Comportamiento de actuar en lugar de afirmar haber actuado (act-don't-claim) y de actuar pese al historial previo.
- Confirmacion antes de acciones destructivas.
- Onboarding sin carpeta adjunta (con la adicion indicada al prompt de sistema).
- No se documentan capacidades de vision, audio ni otras modalidades.

## Casos de uso

- Orquestacion de agentes en el escritorio: dentro de Osaurus, el modelo decide que herramienta del sistema invocar, en que orden y como encadenar llamadas, apoyandose en su entrenamiento especifico sobre decisiones del arnes.
- Automatizacion con recuperacion ante fallos: sus lotes de entrenamiento en undo/recovery permiten gestionar errores de herramientas y reintentos sin intervencion, util en pipelines de tareas largas.
- Asistentes con confirmacion de acciones destructivas: el modelo aprende a pedir confirmacion antes de operaciones irreversibles, lo que lo hace adecuado para agentes con permiso de escritura sobre ficheros o sistemas.
- Delegacion multi-agente: puede repartir trabajo entre sub-agentes, apropiado para flujos donde una tarea principal se descompone en subtareas.
- Atencion al cliente con uso de herramientas: al soportar tool calling y multiturno, puede consultar sistemas externos antes de responder, con la salvedad de que el soporte multilingue se limita a ingles y chino.
- Copiloto de codigo y tareas tecnicas en Mac: con 3,41 GiB en disco y ejecucion via MLX en Apple Silicon, es viable como asistente local en un portatil para generacion de codigo y consultas tecnicas.
- Ejecucion local con privacidad: al caber en hardware de consumo Apple y no requerir servicio externo, encaja en escenarios donde los datos no pueden salir del equipo.
- Prototipado de agentes con razonamiento opcional: la posibilidad de activar o desactivar `<think>` permite ajustar coste y latencia segun la tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor proporciona comparativas contra Raptor 0.6 sobre el arnes de Osaurus y mediciones de fidelidad de cuantizacion.

Comparacion de comportamiento frente a Raptor 0.6 (3 semillas por modelo, media por semilla y caso, IC del 95 % por bootstrap, Bonferroni por categoria):

| Comparacion vs Raptor 0.6 | Casos | Delta [IC 95 %] | Ganancias significativas | Perdidas significativas |
|---|---|---|---|---|
| Semantica principal de Osaurus (llamadas paralelas validas) | 488 | +4,3 [+2,0, +6,7] | respuestas sin herramienta +17, sandbox +20 | ninguna |
| Puntuacion original del arnes | 488 | +7,3 [+4,8, +9,8] | sin herramienta +17, sandbox +23 | ninguna |
| Los 3 prompts de sistema | 1464 | +4,8 [+2,9, +6,7] | aclaracion +13, sin herramienta +13, sandbox +14 | ninguna |
| Precision JANG_6M (emulada) | 488 | +4,9 [+2,5, +7,4] | aclaracion +12, delegacion +20 | ninguna |

Fidelidad de cuantizacion (divergencia KL en nats por posicion de siguiente token y coincidencia top-1 frente a los pesos bf16 del propio modelo, forward de secuencia completa sobre dos conjuntos reservados no usados en calibracion):

| Conjunto reservado | Tokens | Este paquete (AWQ + GPTQ + imatrix) | Redondeo sin calibrar, mismos niveles |
|---|---:|---|---|
| Conversaciones del arnes y generaciones propias (razonamiento on/off, llamadas a herramientas) | 113.883 | KL media 0,0140 · top-1 96,75 % | 0,0402 · 94,42 % |
| Prompts mixtos (arnes, codigo, tool calls, general) | 307.300 | KL media 0,0102 · top-1 97,45 % | 0,0268 · 95,82 % |

Segun el autor, la calibracion reduce la KL entre 2,6 y 2,9 veces a igual tamano y velocidad, con la mayor ganancia en conversaciones del arnes (razonamiento activado -69 %, desactivado -62 %). El documento advierte que estas cifras no son comparables con las de la ficha de 0.6.

Rendimiento de decodificacion (mediana de 4 sondas a condicion fija: prompt de 512 tokens, 128 generados, primera sonda descartada, en un M5 Max; ambos paquetes dentro del margen de medicion):

| Metrica | Raptor-0.6.1-preview-4B-JANG_6M | Raptor-0.6-4B-JANG_6M |
|---|---|---|
| Tamano en disco | 3,41 GiB | 3,41 GiB |
| bits/peso | 7,126 | 7,126 |
| Decode | 105,4 tok/s | 104,8 tok/s |
| Prefill | 5042 tok/s | 5087 tok/s |

No existe fila de comparacion con MLX estandar porque `mlx-lm` no incorpora la arquitectura `spark2_5`, por lo que no hay una cuantizacion MLX estandar de este modelo contra la que medir.

## Requisitos de hardware

- Tamano en disco de los pesos: 3,41 GiB.
- Dispositivo objetivo: Apple Silicon (etiqueta `apple-silicon`, libreria `mlx`).
- Mediciones de referencia realizadas en un Apple M5 Max: 105,4 tok/s de decode y 5042 tok/s de prefill (prompt de 512 tokens, 128 generados).
- Cabe en hardware de consumo Apple: por su tamano (~3,4 GiB) es apto para Mac con memoria unificada modesta, si bien no se especifican minimos oficiales de memoria.
- No se documentan requisitos ni recomendaciones para GPU NVIDIA (A100, H100, RTX 4090) ni para CUDA.
- Opciones de despliegue: MLX a traves de Osaurus 0.25.14 o superior, que sirve el modelo con el contrato de muestreo, razonamiento y tool calling ya declarado en el paquete. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: solo se conocen las cifras de decode y prefill del M5 Max indicadas arriba.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Estado |
|---|---|---|---|---|---|
| Raptor-0.6.1-preview-4B-JANG_6M | 4,11 B (denso) | no disponible | JANG_6M (7,126 bits/peso) | Apache 2.0 | Preview, publicado para pruebas |
| Raptor-0.6-4B-JANG_6M | 4,11 B (denso sobre Spark-X2.5-4B) | no disponible | JANG_6M (7,126 bits/peso) | Apache 2.0 (segun base) | Version estable publicada; objetivo al que aspira a sustituir la preview |
| XHToken/Spark-X2.5-4B | 4,11 B (denso) | no disponible | no disponible | no disponible | Modelo base sin ajustar ni cuantizar |

No se dispone de datos de benchmarks comparables con modelos de otras familias en la informacion proporcionada, por lo que no se incluyen alternativas de terceros.

## Limitaciones y advertencias

- Es una version preview: el autor la publica para pruebas y podria reemplazar al modelo estable; no se garantiza su mantenimiento.
- Requiere Osaurus 0.25.14 o superior. La arquitectura `spark2_5` no esta soportada por `mlx-lm`, por lo que no puede ejecutarse con herramientas MLX estandar.
- Sin carpeta de trabajo adjunta, el modelo no aprende de forma fiable la respuesta "anade una carpeta" solo con el entrenamiento: sin la linea de estado del espacio de trabajo en el prompt de sistema, la tasa de respuesta correcta es del 0 %; con ella, del 96 % con razonamiento activado y del 85 % desactivado sobre 12 peticiones nuevas.
- Idiomas limitados a ingles y chino. El comportamiento de respuesta en chino pasa la comprobacion, pero la fidelidad de cuantizacion en chino no se ha medido por separado.
- La captura de calibracion no incluye chino, opcion multiple academica ni texto de mas de 4K tokens, por lo que la fidelidad de cuantizacion en esos segmentos no esta evaluada.
- Riesgo de alucinacion: el propio autor menciona un "aumento de fabricacion" en checkpoints posteriores al 6 de 16, motivo por el que selecciono un checkpoint temprano.
- No se han publicado datos sobre sesgos, ni resultados de benchmarks estandar que permitan acotar el rendimiento general fuera del arnes.
- La longitud de contexto no esta documentada en la informacion disponible, lo que impide planificar despliegues que dependan de ventanas largas.
- Aunque la licencia es Apache 2.0, se desconoce la licencia del modelo base XHToken/Spark-X2.5-4B, dato relevante antes de un uso comercial.
- Optimizado y medido exclusivamente para Apple Silicon; no hay verificacion de rendimiento en otras plataformas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OsaurusAI/Raptor-0.6.1-preview-4B-JANG_6M
- Modelo estable al que aspira a sustituir: https://huggingface.co/OsaurusAI/Raptor-0.6-4B-JANG_6M
- Modelo base: https://huggingface.co/XHToken/Spark-X2.5-4B
- Sitio de Osaurus: https://osaurus.ai
