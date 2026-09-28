# Joakimpalm-Zen/Xyntetik-Kvist-14B-GGUF

## Resumen

Xyntetik-Kvist-14B es un modelo de lenguaje denso de 14.443.795.072 parámetros (según los metadatos de safetensors publicados; la model card indica 14.443.781.760) desarrollado por Joakimpalm-Zen. No es una copia cuantizada de otro modelo, sino un estudiante obtenido por poda de anchura (*width pruning*) a partir del modelo padre Muse-Glimmer-30B: se conservan las 52 capas, la anchura oculta se reduce de 6.656 a 5.760, la FFN de 19.968 a 10.240, las cabezas de atención de 32 a 24 y las cabezas KV quedan en 2. El estudiante se destiló de nuevo desde el padre congelado en BF16 durante 6.000 pasos (98,3 millones de tokens, 162 horas) y después se entrenó durante 1.440 pasos adicionales sobre trayectorias agénticas escritas en el formato de cable `muse` de Xyntetik Runner.

Este repositorio contiene exclusivamente los pesos en GGUF (BF16, Q8_0 y Q5_0-mix); los safetensors en BF16 residen en el repositorio base. El modelo es solo texto: no hereda el codificador de visión de 1,92 mil millones de parámetros del padre, de modo que los 27,9 mil millones de parámetros del modelo de lenguaje paterno son el punto de partida real de la destilación.

Su relevancia práctica es doble. Por un lado, es un caso poco habitual de destilación por anchura publicada con evidencia preregistrada: incluye un registro de entrenamiento, puertas de validación (*envelope gate*) definidas antes de medir y tareas de entorno ejecutables con corrección por reejecución. Por otro, apunta a un nicho concreto: agentes con *tool calling* servidos en una única GPU de 24 GB, ya que los ficheros Q8_0 (15,4 GB) y Q5_0-mix (10,3 GB) caben enteros en esa tarjeta. Conviene tener presente que sus propias métricas lo sitúan lejos de un modelo cuantizado fiel (KLD 0,762 frente al umbral interno de KLD ≤ 0,05), algo que el autor declara explícitamente y no reclama.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (sin MoE), 52 capas; anchura oculta 5.760; FFN 10.240; 24 cabezas de atención; 2 cabezas KV |
| Parámetros totales | 14.443.795.072 (metadatos de safetensors); la model card indica 14.443.781.760 |
| Parámetros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF BF16 (28,9 GB), Q8_0 (15,4 GB) y Q5_0-mix (10,3 GB); safetensors BF16 en el repositorio base |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (este repositorio); safetensors (repositorio base Joakimpalm-Zen/Xyntetik-Kvist-14B) |
| Modelo base | Joakimpalm-Zen/Xyntetik-Kvist-14B (relación: quantized) |
| Modelo padre del estudio | meta-models/Muse-Glimmer-30B |
| Modalidad | Solo texto (el codificador de visión de 1,92 B del padre no se conserva) |
| Tamaño del repositorio | 54,6 GB |
| Runtime de referencia | Xyntetik Runner v0.5.7 o posterior |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de 52 capas al que se le ha aplicado poda de anchura sobre el modelo de lenguaje del padre Muse-Glimmer-30B, seguida de destilación desde el padre congelado en BF16. El recorte afecta a tres ejes simultáneamente: dimensión oculta (6.656 → 5.760), dimensión de la FFN (19.968 → 10.240) y número de cabezas de atención (32 → 24), manteniendo 2 cabezas KV según lo declarado. El resultado son 14,44 mil millones de parámetros, aproximadamente la mitad de los 27,9 mil millones del modelo de lenguaje paterno. La destilación consumió 6.000 pasos (98,3 millones de tokens, 162 horas) contra el padre congelado; después hubo una segunda fase de 1.440 pasos sobre trayectorias agénticas redactadas en el formato de cable `muse` de Xyntetik Runner. No se menciona en la información disponible el uso de RLHF o DPO.

El aspecto metodológico más destacable es la evaluación preregistrada: el autor publica un registro de entrenamiento (dataset `Xyntetik-Kvist-14B-training-record`) con preregistros K1 a K3, registros de las puertas de validación y manifiestos del corpus, y ejecuta una *envelope gate* con brazos E1, E2, E3 y E5 (el brazo E4 no se detalla). Las mediciones se hicieron en modo greedy (temperatura 0) y con `repeat_penalty` a 1,0, porque una penalización por encima de 1 actúa sobre los tokens de esquema que una llamada a herramienta debe repetir. El autor también documenta una salvaguarda de bucle (`--loop-guard`) que cierra un turno de razonamiento que empieza a repetirse; en este checkpoint su efecto es acotar el turno, no mejorar la puntuación.

## Capacidades

- Generación de texto conversacional y de razonamiento en varios pasos, con turnos de pensamiento de longitud variable (media declarada de 147-154 tokens de pensamiento en las tareas de la puerta).
- Escritura del formato de cable `muse` de Xyntetik Runner: 199 de 200 primeros turnos bien formados en el conjunto de validación.
- *Tool calling* / *function calling*: 99 de 99 llamadas a herramienta válidas (parsean y validan contra el esquema ofrecido).
- Ejecución de tareas agénticas de extremo a extremo en el entorno ejecutable del estudio: 57 de 60 tareas resueltas con corrección por reejecución contra la verdad de referencia.
- Capacidad de planificación multi-paso dentro de un bucle cerrado de agente, ya que la puntuación se obtiene reejecutando las acciones del modelo.
- Soporte de salvaguarda de bucle (`--loop-guard`, por petición como `loop_guard`) para truncar turnos que se repiten.
- No dispone de visión: el codificador de visión de 1,92 B del padre no se ha transferido.
- Capacidades multilingües: no disponible (no se declaran idiomas ni se aportan evaluaciones por idioma).
- No se reclaman capacidades de *tool calling* derivadas de la fase de destilación general: según el autor, los corpus de destilación no contenían documentos de *tool calling*, por lo que el reclamo está acotado al entorno y a la ruta de servicio medidas.

## Casos de uso

- Agentes locales con *tool calling* en una estación de trabajo de 24 GB: con el fichero Q8_0 (15,4 GB) el modelo se sirve residente en GPU mediante Xyntetik Runner, lo que permite desplegar un agente que invoca herramientas contra APIs internas sin depender de servicios en la nube.
- Automatización de tareas de operaciones con verificación por reejecución: el modelo resuelve 57 de 60 tareas del entorno ejecutable del estudio, un perfil adecuado para flujos donde la acción del agente se puede volver a ejecutar y comprobar contra el estado real del sistema.
- Integración en pipelines de agentes que necesitan un formato de cable estricto: al generar 199 de 200 primeros turnos válidos en el formato `muse` y 99 de 99 llamadas válidas contra esquema, encaja como capa de decisión en orquestadores que exigen salidas parseables sin post-procesado agresivo.
- Ejecución en hardware modesto o sin GPU: el fichero Q5_0-mix (10,3 GB) abre la puerta a despliegues en una sola tarjeta de 12-16 GB o incluso en CPU para cargas no interactivas.
- *Routing* y clasificación con salida estructurada: la validación estricta contra esquema hace viable su uso para decidir qué herramienta o endpoint invocar en un sistema mayor, siempre que el esquema se ofrezca en la petición.
- Evaluación de destilación por anchura como línea de investigación: el paquete de evidencia (preregistros, registros de puertas, manifiestos de corpus y código) permite reproducir el protocolo y comparar con otras estrategias de compresión de modelos de 30B a 14B.
- Investigación sobre bucles de razonamiento: con las métricas publicadas de terminación (98,3%) y de intervención de la salvaguarda, sirve como banco de pruebas para estudiar cuándo un modelo agéntico entra en repetición y cómo lo mitiga el *runtime*.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las únicas métricas publicadas son internas al estudio del autor y se midieron en modo greedy con `repeat_penalty` a 1,0.

| Métrica | Xyntetik-Kvist-14B (GGUF) | Padre BF16 (Muse-Glimmer-30B, LM) | Estudiante antes de la fase agéntica |
|---|---|---|---|
| KLD en 45.056 posiciones de validación | 0,762 | referencia | no disponible |
| Top-1 cualificado por margen | 84,0% (top-1 79,2%) | no disponible | no disponible |
| Tareas de entorno resueltas (60) | 57 | 60 | 0 |
| Llamadas a herramienta válidas | 99 de 99 | no disponible | no disponible |
| Primeros turnos en formato `muse` bien formados | 199 de 200 | no disponible | no disponible |
| Terminación de turnos | 98,3% | no disponible | no disponible |
| Tareas resueltas con Q8_0 en CPU, greedy, binario v0.5.7 | 58 de 60 con y sin `loop-guard` (falla las mismas dos) | no aplicable | no aplicable |

Notas de lectura: el umbral interno del autor para copias cuantizadas es KLD ≤ 0,05 y top-1 cualificado ≥ 97%, y el propio autor declara que ese umbral no aplica a un estudiante con 14,4 B de los 27,9 B del padre y que no lo reclama. En la tarea que se descontrola sin salvaguarda (una petición de cálculo con dos decimales) la guarda intervino 5 veces y la tarea igualmente no terminó; en un checkpoint anterior del mismo estudio (intento 8, runner 53b4deb) la misma configuración subió la puntuación de 51 a 54 sobre 60 al cerrar 3 de sus 6 desbordes. En la medición de 60 tareas con Q8_0 en CPU y el binario v0.5.7 se obtienen 58 sobre 60, un conjunto distinto del 57 sobre 60 de la puerta, por lo que ambas cifras corresponden a configuraciones de servicio diferentes.

## Requisitos de hardware

- VRAM estimada: BF16 en torno a 29-31 GB solo para pesos, más caché KV; Q8_0 alrededor de 15,4 GB más caché KV; Q5_0-mix en torno a 10,3 GB más caché KV.
- Caché KV (estimación propia a partir de la arquitectura declarada: 52 capas, 2 cabezas KV, dimensión de cabeza 240, FP16): aproximadamente 0,095 MiB por token, es decir, cerca de 0,8 GiB para 8.192 tokens y 3,1 GiB para 32.768 tokens. No es un dato publicado por el autor.
- BF16 (28,9 GB): no cabe entero en una tarjeta de 24 GB. El autor lo sirvió con 38 de las 52 capas en GPU (`--gpu-layers 38`). Para residencia total hacen falta GPU de 40-80 GB (A100 40/80 GB, H100, L40S de 48 GB).
- Q8_0 (15,4 GB): cabe entero y se ejecuta residente en GPU en tarjetas de 24 GB (RTX 3090, RTX 4090, A5000, L4 no; RTX 4080 de 16 GB solo con contexto reducido).
- Q5_0-mix (10,3 GB): es el fichero indicado para GPU de consumo de 12-16 GB (RTX 4070 Ti Super, RTX 4080, RTX 4060 Ti de 16 GB) con contexto moderado.
- Opciones de despliegue: el runtime de referencia es Xyntetik Runner v0.5.7 o posterior, mediante `runner -m <fichero>.gguf --serve --port 8080`, con `--gpu auto --gpu-layers <n>` para reparto parcial y `--loop-guard` para acotar turnos repetitivos. Al ser GGUF, otros *runtimes* basados en llama.cpp podrían cargarlo, pero no hay mediciones publicadas en la información disponible y el reclamo de *tool calling* está acotado a la ruta de servicio medida con Xyntetik Runner.
- Compatibilidad verificada: los brazos de puerta E1, E2, E3 y E5 se midieron sobre runner main 0bfa2ad y las mediciones de servicio sobre 53b4deb, ac5418e y el binario de la release v0.5.7 (las dos primeras están contenidas en v0.5.7).
- Latencia y *throughput*: no disponibles. Solo se publican tokens de pensamiento medios (154 sin guarda, 147 con guarda) y tasa de terminación (98,3%) sobre las 60 tareas de la puerta.
- Ajuste de muestreo obligatorio para *tool calling*: mantener `repeat_penalty` a 1,0 y servir en greedy; una penalización impuesta por el cliente actúa sobre los tokens de esquema que la llamada debe repetir.

## Comparativa con modelos similares

No hay datos en la información disponible para comparar con modelos de terceros de la misma categoría (por ejemplo, otros transformers densos de 13-15 B). La comparación posible se limita a los artefactos del propio estudio:

| Modelo | Parámetros | Contexto | KLD frente al padre | Top-1 cualificado | Tareas cerradas (60) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Xyntetik-Kvist-14B-GGUF (Q8_0) | 14,44 B densos | no disponible | 0,762 | 84,0% (top-1 79,2%) | 57 de 60 (58 de 60 en CPU con v0.5.7) | Apache-2.0 | Este repositorio |
| Xyntetik-Kvist-14B (BF16, safetensors) | 14,44 B densos | no disponible | mismo estudiante | idem | 57 de 60 | Apache-2.0 | Repositorio base |
| Estudiante antes de la fase agéntica | 14,44 B densos | no disponible | no disponible | no disponible | 0 de 60 | Apache-2.0 | no disponible |
| Muse-Glimmer-30B (padre, solo el LM) | 27,9 B densos (más 1,92 B de visión no transferidos) | no disponible | referencia | no disponible | 60 de 60 | no disponible | BF16, repo `meta-models/Muse-Glimmer-30B` |

Lectura: frente al padre, el estudiante pierde 3 tareas de 60 y se queda en KLD 0,762, pero pasa de 0 a 57 tareas resueltas respecto al estudiante previo a la fase agéntica, lo que sugiere que esa segunda fase de entrenamiento es la responsable del comportamiento de *tool calling*, no la destilación general.

## Limitaciones y advertencias

- Fidelidad limitada al padre: KLD 0,762 y top-1 cualificado 84,0% frente al umbral interno de KLD ≤ 0,05 y top-1 ≥ 97% que el propio autor aplica a copias cuantizadas. No es un sustituto fiel del modelo de 30B.
- Solo texto: no conserva el codificador de visión de 1,92 B del padre, por lo que cualquier caso de uso multimodal queda fuera.
- Idiomas: no se declaran idiomas soportados ni se aportan evaluaciones multilingües, así que el comportamiento fuera del inglés no está caracterizado.
- Riesgo de bucle en razonamiento: el modelo puede repetirse. La salvaguarda `--loop-guard` cierra el turno, no corrige la tarea; si el modelo se repite porque no tiene la respuesta, el turno acaba con una respuesta incorrecta. Además, no detecta bucles que cruzan peticiones: en una tarea medida con un checkpoint anterior, el modelo llamó tres veces a la misma herramienta con el mismo argumento en turnos individualmente bien formados.
- Reclamo de *tool calling* acotado: los 99 de 99 y 57 de 60 corresponden a un entorno ejecutable concreto, un formato de cable concreto (`muse`) y una ruta de servicio concreta (Xyntetik Runner). No se extrapolan a otras herramientas, esquemas o *runtimes*.
- Riesgo de alucinación: no se aportan evaluaciones de veracidad factual ni conjuntos de *hallucination*; el modelo no incluye mecanismos declarados de abstención.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero debe verificarse la licencia del modelo padre (`meta-models/Muse-Glimmer-30B`, marcada como no disponible) antes de un despliegue comercial, ya que la licencia derivada depende de la del modelo de origen.
- Madurez y trazabilidad del ecosistema: el repositorio registra 0 descargas y 0 me gusta en el momento de la consulta, y el modelo depende de un *runtime* propio (Xyntetik Runner) del mismo autor. Ni el padre Muse-Glimmer-30B ni el ecosistema Xyntetik/Muse-Glimmer aparecen en la búsqueda web realizada, por lo que conviene validar de forma independiente la procedencia y reproducibilidad antes de llevarlo a producción.
- Documentación incompleta: la model card proporcionada está truncada al final, no indica la longitud de contexto ni los idiomas, no detalla el brazo E4 de la puerta y no incluye benchmarks estándar comparables con el resto del ecosistema.
- Discrepancia menor de parámetros: 14.443.795.072 en los metadatos de safetensors frente a 14.443.781.760 en la model card (diferencia de 13.312 parámetros).

## Enlaces

- Página de HuggingFace del modelo: https://huggingface.co/Joakimpalm-Zen/Xyntetik-Kvist-14B-GGUF
- Modelo base (safetensors BF16): https://huggingface.co/Joakimpalm-Zen/Xyntetik-Kvist-14B
- Registro de entrenamiento y evidencia: https://huggingface.co/datasets/Joakimpalm-Zen/Xyntetik-Kvist-14B-training-record
- Modelo padre del estudio: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Runtime de servicio (Xyntetik Runner): https://github.com/Joakimpalm-Zen/xyntetik-runner
- Referencia arXiv etiquetada por el autor (identificador 2408.11796; título no disponible en la información proporcionada): https://arxiv.org/abs/2408.11796
- Referencia arXiv etiquetada por el autor (identificador 2602.01997; título no disponible en la información proporcionada): https://arxiv.org/abs/2602.01997
- Colección «Xyntetik Kvist: distilled agents»: anunciada como en creación en la model card, sin URL disponible.
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante sobre el modelo, su autor o su ecosistema; los resultados devueltos corresponden a foros sin relación con el tema.
