# itamarstahl/lment-1b-ai-ember-d500-b131k

## Resumen

LMEnt 1B — artificial intelligence (AI) EMBER es un modelo de lenguaje causal de 1.336.035.328 parametros publicado por el usuario itamarstahl en HuggingFace. No es un modelo de proposito general entrenado desde cero, sino un *checkpoint editado*: parte del modelo de control compartido `lment-1b-control-2e-b131k` (OLMo2 1B en ingles, entrenado sobre el corpus de Wikipedia anotado por entidades LMEnt, sin ajuste por instrucciones) y le aplica una edicion post-entrenamiento EMBER sobre el concepto "artificial intelligence (AI)" con fuerza delta = 500.

El modelo es el artefacto seleccionado por el articulo *Can Concept Erasure Reproduce Concept Exclusion? A Matched Evaluation of EMBER, RMU, and SNMF* (Gal Barak, Tamar Tabbach, Itamar Stahl y Adam Fleisher, 2026). Su relevancia es metodologica: forma parte de una terna emparejada (control completo, gemelo con exclusion de concepto y gemelo editado con EMBER) que permite medir si la erasure de un concepto reproduce el comportamiento de un modelo entrenado con ese concepto excluido del corpus. En concreto, este checkpoint no se entreno enmascarando fragmentos vinculados al concepto en la funcion de perdida, sino editando direcciones del espacio de embeddings de entrada.

Es, por tanto, un objeto de investigacion en interpretabilidad y edicion de conocimiento, no un asistente conversacional. Su tamano de 1,3 B de parametros y su formato safetensors lo hacen ejecutable en una unica GPU de gama consumer, lo que facilita la replicacion experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (familia OLMo2) |
| Parametros totales | 1.336.035.328 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (no especificada en la model card) |
| Tipos de cuantizacion | no disponible; no se distribuyen cuantizaciones oficiales. El repositorio (5,3 GB) es coherente con pesos en fp32 |
| Idiomas soportados | Ingles (en) |
| Licencia | no disponible (la model card indica explicitamente: "No weight license is asserted in this card") |
| Formato de pesos | safetensors (libreria transformers) |
| Pipeline | text-generation |
| Tipo de modelo | Modelo base sin ajuste por instrucciones (no instruction tuning) |
| Metodo de edicion | EMBER, fuerza delta = 500, sobre el checkpoint de control compartido |
| Concepto editado | artificial intelligence (AI) |

## Arquitectura y entrenamiento

La base es un modelo de lenguaje causal OLMo2 de 1.000 millones de parametros (1,336 B reales segun los pesos) en ingles, entrenado sobre el corpus LMEnt de Wikipedia anotado por entidades. Se trata de un modelo base: no ha pasado por ajuste por instrucciones, RLHF ni DPO, y no incorpora modo de razonamiento explicito.

Sobre ese control, el checkpoint aplica la edicion EMBER (Embedding-space Model Editing, segun la nomenclatura del articulo). El procedimiento descrito es el siguiente: las caracteristicas semanticas se factorizan a rango 100 a partir de 300 frases objetivo y 300 frases neutras, con una esparsidad de 0,02 y semilla 44; un juez semantico retiene las caracteristicas relacionadas con el objetivo con una confianza minima de 0,85; finalmente se editan direcciones seleccionadas del espacio de embeddings de entrada con una fuerza delta = 500. El checkpoint corresponde a la configuracion del apendice B.3 del articulo (etiqueta candidata `ember_ai_d500`), seleccionada sobre el split de seleccion fijo antes de la evaluacion en el conjunto de test reservado. A diferencia de su gemelo `lment-1b-noai-2e-b131k`, este modelo no se entreno con fragmentos vinculados al concepto enmascarados de la funcion de perdida.

## Capacidades

- Generacion de texto en ingles sin condicionamiento conversacional: al ser un modelo base, completa secuencias a partir de un prefijo, sin plantilla de chat ni seguimiento de instrucciones fiable.
- Modelado de lenguaje de dominio general sobre material derivado de Wikipedia, incluyendo entidades y relaciones facticas habituales en ese corpus.
- Supresion selectiva del concepto "artificial intelligence (AI)" en el espacio de embeddings, segun la metrica de eficacia objetivo del articulo (H_test = 0,753).
- Capacidad de investigacion en edicion de conocimiento: sirve como punto de medida de distancias de NLL y KL frente a los otros dos checkpoints de la terna.
- No soporta tool calling ni function calling: no hay ajuste por instrucciones ni formato de herramientas.
- No soporta agentes ni razonamiento multi-paso: el tag `conversational` del repositorio no implica alineacion conversacional, dado que la model card confirma que es un modelo base.
- Capacidades multilingues: no, unicamente ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponible / no aplica.

## Casos de uso

- Replicacion del experimento EMBER: cargar el checkpoint y reproducir las metricas H_test, R_abs y R_KL del articulo sobre los conjuntos de test reservados, verificando la seleccion de hiperparametros (delta = 500) descrita en el apendice B.3.
- Evaluacion comparativa de metodos de edicion: los tres checkpoints de la terna (control, gemelo con exclusion de concepto y este gemelo editado con EMBER) permiten comparar de forma emparejada la supresion de concepto frente a la exclusion real de concepto en los datos de entrenamiento.
- Analisis de representaciones internas: la factorizacion a rango 100 de 300 frases objetivo y 300 neutras permite inspeccionar direcciones de embedding y estudiar que caracteristicas semanticas quedan afectadas por la edicion con delta = 500.
- Calibracion de metricas de distancia conductual: R_abs (distancia de NLL sobre respuestas correctas) y R_KL (KL sobre el vocabulario completo con teacher forcing) pueden validarse como indicadores de similitud entre checkpoints en experimentos de menor escala.
- Generacion de texto en ingles para tareas de investigacion que no requieran seguimiento de instrucciones, como calculo de perplejidad sobre corpus de Wikipedia o estudios de sesgo lexical en la salida.
- Punto de partida para ajuste fino posterior: al ser un modelo base de 1,3 B en safetensors, se puede someter a SFT o LoRA sobre un dominio concreto en una unica GPU consumer, partiendo de un modelo ya editado.
- Docencia y practicas de laboratorio: el tamano permite que estudiantes ejecuten un experimento completo de edicion de conocimiento en hardware de una sola GPU, incluida la inspeccion de embeddings.
- Auditoria de metodos de concept erasure: evaluar si una supresion medida en el espacio de embeddings se traduce o no en cambio observable de comportamiento, usando las respuestas del gemelo no editado como referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El articulo reporta unicamente las metricas especificas de la evaluacion de erasure sobre el conjunto de test reservado:

| Metrica | Valor | Significado |
|---|---:|---|
| `H_test` | 0,753 | Eficacia sobre el objetivo y preservacion del resto |
| `R_abs` | 2,112 | Distancia de NLL (respuesta correcta) al gemelo, dividida por la distancia al modelo completo |
| `R_KL` | 3,310 | Distancia KL sobre el vocabulario completo (teacher forcing) al gemelo, dividida por la distancia al modelo completo |

Segun la model card, en cualquiera de los dos ratios de proximidad un valor inferior a uno indica acercamiento al gemelo con exclusion de concepto, y un valor superior a uno indica mayor distancia que el control completo en esa medida. Ambos ratios son superiores a uno en este checkpoint, por lo que la model card subraya que la supresion y el parecido con el gemelo son resultados distintos. No se aportan datos de latencia ni de throughput.

## Requisitos de hardware

- Inferencia en fp32: aproximadamente 5,3 GB de pesos, mas activaciones y cache KV; el repositorio ocupa 5,3 GB, coherente con este formato.
- Inferencia en fp16/bf16: aproximadamente 2,7 GB de pesos (estimacion a partir del numero de parametros).
- Cuantizacion a 8 bits: aproximadamente 1,3 GB; a 4 bits: aproximadamente 0,7 GB (estimaciones teoricas; no hay cuantizaciones oficiales publicadas en el repositorio).
- Cabe sin problema en GPU de gama consumer: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 en fp32, y practicamente cualquier GPU con 4-8 GB en precision reducida.
- GPU de centro de datos (A100, H100) solo tendrian sentido para evaluacion por lotes o despliegue de muchas replicas; el modelo queda muy por debajo de su capacidad.
- Opciones de despliegue: transformers con `AutoModelForCausalLM` (ruta documentada por el autor); vLLM para servido con arquitectura OLMo2; llama.cpp u Ollama requeririan conversion previa a GGUF, no incluida en el repositorio. El tag `endpoints_compatible` sugiere compatibilidad con los endpoints de HuggingFace.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La comparativa natural es contra los otros dos miembros de la terna emparejada del mismo articulo y contra el OLMo2 1B original.

| Modelo | Parametros | Contexto | Metodo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `lment-1b-ai-ember-d500-b131k` (este) | 1,336 B | no disponible | Edicion EMBER, delta = 500, sobre control compartido | no disponible | HuggingFace, safetensors |
| `lment-1b-control-2e-b131k` | no disponible | no disponible | Control completo, sin edicion de concepto | no disponible | HuggingFace, safetensors |
| `lment-1b-noai-2e-b131k` | no disponible | no disponible | Gemelo entrenado con exclusion del concepto "AI" del corpus | no disponible | HuggingFace, safetensors |
| OLMo2 1B (modelo base original) | ~1,3 B | no disponible en esta ficha | Entrenamiento estandar sobre corpus OLMo2 | licencia de OLMo2 (no verificada aqui) | HuggingFace / AllenAI |

No se dispone de datos de rendimiento comparativo en benchmarks estandar para ninguno de los cuatro, por lo que la comparacion se limita al metodo de construccion, el formato y la disponibilidad.

## Limitaciones y advertencias

- Sin licencia declarada: la model card afirma explicitamente que no se aserta ninguna licencia sobre los pesos. El uso comercial queda en un limbo legal hasta que el autor lo aclare.
- Es un modelo base sin ajuste por instrucciones: no seguirá ordenes de forma fiable y no debe usarse como asistente conversacional en produccion.
- Alcance experimental muy limitado: el articulo prueba tres conceptos con 50 preguntas objetivo reservadas por concepto. Esas medidas no demuestran eliminacion amplia de conocimiento, seguridad ni generalizacion a otros conceptos.
- Riesgo de alucinacion propio de un modelo de 1,3 B entrenado sobre Wikipedia: puede reproducir errores y sesgos del material de entrenamiento, tal y como advierte la propia model card.
- Sesgos: al derivar de un corpus de Wikipedia, hereda los sesgos de cobertura, representacion y sesgo de seleccion de esa fuente.
- Limitacion idiomatica: solo ingles. No hay soporte declarado de castellano ni de otras lenguas.
- Sin alineacion de seguridad: no ha pasado por RLHF, DPO ni filtros de contenido; puede generar texto inapropiado si se le induce.
- La edicion EMBER no equivale a una eliminacion de conocimiento verificada: los propios ratios del articulo (R_abs = 2,112 y R_KL = 3,310, ambos por encima de 1) indican mayor distancia al gemelo con exclusion de concepto que el control completo en esas medidas.
- Longitud de contexto desconocida: la model card no la especifica, algo critico para planificar cualquier uso real.
- Fecha de publicacion en el repositorio: creado y actualizado el 28 de septiembre de 2026. Verificar la vigencia del articulo de referencia antes de citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/itamarstahl/lment-1b-ai-ember-d500-b131k
- Modelo de control compartido: https://huggingface.co/itamarstahl/lment-1b-control-2e-b131k
- Gemelo con exclusion de concepto: https://huggingface.co/itamarstahl/lment-1b-noai-2e-b131k
- Articulo de referencia: Gal Barak, Tamar Tabbach, Itamar Stahl y Adam Fleisher, *Can Concept Erasure Reproduce Concept Exclusion? A Matched Evaluation of EMBER, RMU, and SNMF*, 2026. No se proporciona URL en la informacion disponible.
- Repositorio o demo adicional: no disponible.
