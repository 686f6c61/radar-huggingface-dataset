# jul879n/tde-es-en-lite

## Resumen

tde-es-en-lite es un motor de decisiones tipadas desarrollado por el usuario jul879n. No es un modelo generativo: no produce texto, sino que elige entre opciones que se le proporcionan (`choice`), puntúa una rúbrica (`score`) o estima si una proposición se desprende de un texto (`claim`), devolviendo siempre probabilidades y con la opción de abstenerse. Está construido sobre el encoder bidireccional `intfloat/multilingual-e5-small`, congelado, con el vocabulario recortado de 250.002 a 54.358 tokens (es/en) y cuantizado a int8.

El artefacto se distribuye como pesos ONNX y un binario nativo en Rust (`tde`) que ejecuta la inferencia en CPU, con un solo hilo, sin GPU y sin Python en tiempo de ejecución. El repositorio ocupa aproximadamente 0,1 GB y la licencia es MIT, lo que facilita su integración en servicios ligeros de clasificación y enrutado.

Su relevancia actual radica en el nicho que ocupa: frente a soluciones de clasificación zero-shot basadas en modelos de lenguaje mucho mayores, este motor ofrece una huella mínima en disco y memoria, inferencia determinista en CPU y una política explícita de abstención por margen top-2 y entropía, pensada para entornos donde la latencia, el coste o la ausencia de GPU son restrictivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer bidireccional (backbone `intfloat/multilingual-e5-small`), 12 capas, dimension oculta 384, cabezas auxiliares de clasificacion y NLI de pares |
| Parametros totales | No disponible como cifra agregada del artefacto recortado; el backbone de referencia tiene 12 capas y H=384 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int8 |
| Idiomas soportados | Espanol (es) e ingles (en) |
| Licencia | MIT |
| Formato de pesos | ONNX (`universal.bin` para el modo abierto, `heads.bin` para cabezas entrenadas por schema) |

## Arquitectura y entrenamiento

El modelo parte del encoder bidireccional `intfloat/multilingual-e5-small` congelado. El autor recorta la matriz de embeddings del vocabulario original de 250.002 tokens a 54.358 tokens (seleccion de filas, sin reentrenar el backbone) y cuantiza los pesos a int8. El tokenizador es propio, implementado en Rust (Unigram compacto con normalizador `Precompiled`), y se valida con 4933 de 4933 casos identicos a la implementacion de referencia de Hugging Face sobre 4900 frases reales es/en y unos 40 casos hostiles.

El motor opera en dos modos. El modo abierto (`tde ask`) no usa schema: recibe opciones o una proposicion por llamada. `choice` y `score` puntuan con el coseno (escala 80) entre el estado del encoder y un prototipo por opcion (embedding de la etiqueta o media normalizada de etiqueta y ejemplos, sin entrenar). `claim` utiliza una cabeza NLI de pares sobre `[z, q, z⊙q, |z−q|]`. El modo schema (`tde decide`) declara preguntas fijas en JSON y usa cabezas entrenadas por pregunta con proyeccion y calibracion (temperatura y vector scaling). El coste por opcion es un producto punto de 384 dimensiones, por lo que el numero de opciones no compite por una ventana de tokens. La abtencion se decide por margen top-2 y entropia.

## Capacidades

- Clasificacion por eleccion (`choice`): selecciona la opcion mas probable entre un conjunto de etiquetas arbitrario, con o sin ejemplos por opcion.
- Puntuacion de rubrica (`score`): asigna una puntuacion por similitud coseno entre el estado y los prototipos de cada criterio.
- Verificacion de afirmaciones (`claim`): estima si una proposicion libre se desprende de un texto mediante una cabeza NLI de pares.
- Clasificacion de intenciones (`intent-classification`): evaluada sobre MASSIVE, HWU64, Banking77 y CLINC150.
- Clasificacion zero-shot: utilizable en tareas NLI, escenarios, emociones y temas sin reentrenamiento.
- Abtencion (`noul`/`abstain`): el motor puede no responder cuando el margen top-2 y la entropia no superan el umbral.
- Multilingue limitado a es/en: el vocabulario se ha recortado a esos dos idiomas.
- Inferencia en CPU con un solo hilo, sin GPU y sin Python en runtime.
- No soporta generacion de texto, tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades de vision ni de audio.

## Casos de uso

- Enrutado de tickets de soporte: el modo schema (`tde decide`) con el schema de ejemplo `schemas/support.json` clasifica tickets en preguntas fijas con cabezas entrenadas, reportando una cobertura del 0,84 y permitiendo derivar a humano cuando el motor se abstiene.
- Clasificacion de intenciones en asistentes conversacionales: util para etiquetar la intencion del usuario entre conjuntos de decenas o cientos de etiquetas (Banking77, CLINC150) sin depender de GPU.
- Verificacion de afirmaciones en pipelines de RAG: `tde ask --claim` permite comprobar si una frase generada se desprende de un pasaje recuperado, filtrando alucinaciones antes de mostrarla al usuario.
- Moderacion o triaje de contenidos: la puntuacion por similitud coseno con prototipos por etiqueta permite asignar categorias tematicas o de riesgo con umbrales calibrables.
- Etiquetado a escala en servicios sin GPU: al ejecutarse en CPU con un solo hilo y un artefacto de 0,1 GB, encaja en contenedores pequenos, funciones serverless o entornos embebidos.
- Preprocesado de datos para entrenamiento: clasificar grandes volumenes de texto es/en (intenciones, temas, escenarios) antes de anotacion humana o fine-tuning.
- Enrutado interno de consultas: decidir a que subsistema o modelo mayor derivar cada peticion en funcion de la categoria detectada, ahorrando coste en el modelo de destino.
- Filtros de negocio deterministas: aplicar reglas de clasificacion con abtencion explicita en lugar de umbrales opacos, gracias a la salida de probabilidades y a la politica de margen y entropia.

## Benchmarks y rendimiento

Resultados publicados en la model card (motor propio frente a Laya, ambas configuraciones en CPU sin calibrar; la columna de motor propio cuenta la abtencion como error):

| Tarea | n | Motor propio 0 ej. | Laya 0 ej. | Respondidas (cobertura) 0 ej. |
|---|---|---|---|---|
| NLI ingles si/no (MNLI) | 150 | 0,80 | 0,78 | 0,85 (79%) |
| NLI espanol si/no (XNLI) | 150 | 0,80 | 0,65 | 0,86 (84%) |
| Afirmacion verdadera, 3 opciones | 150 | 0,85 | 0,69 | 0,85 (95%) |
| Intencion MASSIVE en (60) | 150 | 0,39 | 0,42 | 0,62 (52%) |
| Intencion MASSIVE es (60) | 150 | 0,35 | 0,32 | 0,53 (49%) |
| Intencion HWU64 (64) | 150 | 0,53 | 0,47 | 0,71 (61%) |
| Intencion Banking77 (77) | 150 | 0,58 | 0,38 | 0,68 (78%) |
| Intencion CLINC150 (150) | 126 | 0,67 | no soportado | 0,80 (72%) |
| Escenario MASSIVE en (18) | 150 | 0,44 | 0,57 | 0,60 (68%) |
| Escenario MASSIVE es (18) | 150 | 0,47 | 0,42 | 0,70 (53%) |
| Emocion GoEmotions (28) | 150 | 0,14 | 0,38 | 0,35 (31%) |
| Tema AG News (4) | 150 | 0,57 | 0,96 | 0,63 (77%) |

Calidad con cabezas entrenadas por schema (tickets de soporte, es/en), evaluada con el binario desplegable (`tde eval`): accuracy 0,836, accuracy de las respondidas 0,993, cobertura 0,84 y ECE 0,031 sobre 90 casos escritos a mano (67 de entrenamiento y 23 de validacion). El autor advierte que esas cifras incluyen los 67 casos de entrenamiento, que las metricas de validacion (23 casos por pregunta) no son estadisticamente significativas y que no predicen rendimiento en otro dominio.

## Requisitos de hardware

- Inferencia exclusivamente en CPU, con un solo hilo; no se requiere GPU ni Python en runtime.
- Huella en disco del repositorio: aproximadamente 0,1 GB.
- Runtime: ONNX Runtime 1.20.1 (se descarga con `tools/fetch_ort.sh`).
- Compilacion del binario `tde`: requiere Rust 1.82 o superior (`cargo build --release`).
- No cabe planteamiento de VRAM porque no usa GPU; el consumo relevante es de RAM y disco, no publicado en detalle.
- Despliegue mediante el binario nativo Rust; tambien podria integrarse a traves de ONNX Runtime en otros lenguajes si se reutilizan los pesos ONNX.
- No se publican datos de latencia ni throughput en la informacion disponible.
- Plataformas: solo macOS Intel verificado en tiempo de ejecucion; el resto de plataformas (incluido Linux) solo se verifico a nivel de compilacion, segun la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| jul879n/tde-es-en-lite | No publicado (backbone 12 capas, H=384), int8 | Decision tipada sobre encoder e5-small recortado, binario Rust, CPU 1 hilo | es, en | MIT | Abtencion explicita, sin generacion de texto; 0 descargas y 0 likes en el momento de la ficha |
| Laya (referencia de la model card) | 421M | Clasificacion zero-shot generativa en CPU | Multilingue (no detallado) | No disponible en la informacion | Mejor en escenarios en ingles, emociones y temas; peor en NLI espanol, Banking77 y CLINC150 |
| intfloat/multilingual-e5-small | 12 capas, H=384 | Encoder bidireccional de embeddings | Multilingue | MIT | Backbone base del modelo; tde-es-en-lite lo recorta y cuantiza a int8 |

La model card solo ofrece comparacion directa con Laya. No se dispone de comparativas con otros motores de clasificacion zero-shot en la informacion proporcionada.

## Limitaciones y advertencias

- No genera texto: cualquier caso de uso que requiera salida libre queda fuera de su alcance.
- Vocabulario restringido a es/en: descarta otros idiomas del backbone original.
- Rendimiento bajo en emociones (GoEmotions: 0,14 sin ejemplos, 0,35 de accuracy sobre las respondidas) y en clasificacion de intenciones MASSIVE (0,35-0,62 segun cobertura), segun la tabla publicada.
- Las cabezas por schema se entrenaron con 67 casos y se validaron con 23; el autor advierte que las cifras de validacion no son estadisticamente significativas y que no predicen rendimiento en otros dominios.
- Riesgo de alucinacion no aplica en el sentido generativo (no produce texto), pero si existe riesgo de clasificacion erronea y de falsos positivos en `claim`.
- La calibracion por schema esta ligada al dominio de entrenamiento; fuera de ese dominio, la fiabilidad de las probabilidades no esta garantizada.
- La abtencion se decide por margen top-2 y entropia; un umbral mal ajustado puede degradar la cobertura.
- Verificacion de plataformas limitada: solo macOS Intel probado en tiempo de ejecucion; otras plataformas se validaron unicamente a nivel de compilacion.
- Licencia MIT, sin restricciones conocidas para uso comercial indicadas por el autor. Conviene verificar la licencia del backbone (`intfloat/multilingual-e5-small`, MIT) y del dataset (`nyu-mll/multi_nli`) en despliegues comerciales.
- Repositorio con 0 descargas y 0 likes en el momento de redactar la ficha: no hay validacion independiente por parte de la comunidad.
- No se publican cifras de latencia, throughput ni consumo de memoria, lo que dificulta dimensionar despliegues de alta carga.
- Los sesgos del modelo heredan los del backbone y los del dataset NLI usado para la cabeza de pares; no se documentan analisis de sesgo especificos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jul879n/tde-es-en-lite
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small
- Dataset de referencia: https://huggingface.co/datasets/nyu-mll/multi_nli
- Repositorio del proyecto: `typed-decision-engine` (mencionado en la model card sin URL publica disponible)
- Documentacion de entrenamiento de cabezas: `docs/entrenamiento.md` del repositorio (sin URL publica disponible)
