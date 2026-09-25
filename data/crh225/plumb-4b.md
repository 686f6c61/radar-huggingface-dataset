# crh225/plumb-4b

## Resumen

Plumb-4B es un modelo de decision de 4.205.751.296 parametros (aproximadamente 4,2 B) desarrollado por crh225. No es un modelo generativo al uso: recibe un estado o evidencia, una pregunta y entre 2 y 16 opciones, y devuelve en una unica pasada forward una distribucion de probabilidad completa y calibrada sobre todas las opciones, sin generar ni un solo token. La salida incluye la opcion ganadora y una medida de confianza, lo que permite usarlo como clasificador probabilista dentro de pipelines automatizados.

El modelo se construye por ajuste fino sobre JevK5 v0.2, que a su vez deriva de Qwen3.5-4B, e incorpora un modulo de lectura (readout) de SemIf. Se entreno con el dataset crh225/plumb-decisions, compuesto por decisiones dificiles redactadas y verificadas dos veces por Qwen3.8-27B, con un peso mayor para aquellas preguntas que el modelo fallaba o respondia con incertidumbre. La calibracion se resuelve con una unica temperatura de 2,07 ajustada sobre decisiones reservadas (held-out).

Su relevancia actual esta en el nicho de la clasificacion calibrada de baja latencia: en una RTX 4080 Super reporta 28 ms de latencia p50 en los niveles easy y standard, y 78 ms en el nivel hard, con una tasa de acierto de 0,802 en el conjunto hard (89 de 111 items) frente a los 82 de su checkpoint de partida. Se distribuye bajo licencia Apache-2.0 y requiere un runtime especifico, jevk5, tambien Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder heredado de Qwen3.5-4B (tag `qwen3_5_text`) con modulo de lectura (readout) de SemIf |
| Parametros totales | 4.205.751.296 (aproximadamente 4,2 B), dato real de safetensors |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 en el repositorio principal; existe una version GGUF en un repositorio aparte con niveles no especificados en la informacion disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers); GGUF en crh225/plumb-4b-GGUF |

## Arquitectura y entrenamiento

Plumb-4B parte de JevK5 v0.2, un checkpoint Apache-2.0 construido sobre Qwen3.5-4B (tambien Apache-2.0), y anade un readout de SemIf (MIT) para producir una distribucion de probabilidad sobre las opciones en lugar de texto autoregresivo. La innovacion principal es precisamente esa: la decision se emite en una sola pasada forward, sin decodificacion token a token, lo que explica las latencias de decenas de milisegundos. El modelo admite tres tipos de pregunta: `noul` (verdadero/falso), `choice` (entre 2 y 16 opciones, como lista o como mapa clave-descripcion) y `score` (niveles ordinales).

El entrenamiento se realizo sobre crh225/plumb-decisions, un dataset de decisiones dificiles redactadas y comprobadas dos veces por Qwen3.8-27B, con ponderacion al alza de las preguntas que el modelo fallaba o sobre las que mostraba incertidumbre. La calibracion de probabilidades se ajusto con una unica temperatura de 2,07 estimada sobre decisiones held-out. El autor declara que ningun item publico de JevBench se utilizo para entrenamiento, ajuste o seleccion del modelo. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion detallada del dataset ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Clasificacion y decision con salida probabilistica: devuelve una probabilidad calibrada por cada opcion, no una etiqueta unica.
- Preguntas booleanas (`noul`): probabilidad de que la afirmacion sea verdadera.
- Preguntas de eleccion (`choice`): entre 2 y 16 opciones, aceptadas como lista o como mapa `{clave: descripcion}`.
- Preguntas ordinales (`score`): niveles ordenados, apto para escalas de severidad, riesgo o satisfaccion.
- Inferencia sin generacion de tokens: una sola pasada forward por decision, lo que reduce la latencia y evita artefactos de decodificacion.
- Salida con metrica de confianza ademas de la probabilidad, util para umbrales y enrutado condicional.
- Despliegue como servicio HTTP mediante `jevk5-serve`, con un endpoint `/v1/systemone` que permite formular varias preguntas sobre un mismo estado en una sola peticion.
- Capacidades multilingues: no disponible; el modelo declara unicamente ingles.
- Tool calling, function calling, agentes multi-paso, vision, audio y modo thinking: no documentados en la informacion disponible.

## Casos de uso

- Cumplimiento de politicas internas: formular como pregunta `noul` si una operacion cumple una politica escrita (por ejemplo, "los reembolsos requieren recibo y compra en 30 dias") y usar la probabilidad como semaforo, con umbral de revision humana cuando la confianza sea baja.
- Triaje de tickets de soporte: clasificar cada mensaje en un conjunto cerrado de categorias con `choice` y enrutarlo al equipo correspondiente; la latencia de 28 ms permite hacerlo en linea dentro del propio flujo de atencion.
- Enrutado de decisiones de negocio: decidir entre acciones discretas (aprobar, denegar, escalar) con probabilidades explicitas que pueden registrarse para auditoria posterior.
- Puntuacion de riesgo ordinal: usar `score` para asignar niveles de severidad o prioridad, aprovechando que la salida es ordinal y no una mera etiqueta plana.
- Verificacion de afirmaciones: comprobar si un texto de entrada respalda o no una afirmacion dada, con `noul`, como filtro previo a un modelo generativo mas caro.
- Prefiltro en pipelines de agentes: decidir si una accion propuesta requiere validacion humana, usando las probabilidades calibradas como criterio de gate antes de ejecutar herramientas externas.
- Anotacion asistida y aprendizaje activo: clasificar grandes volumenes de texto con probabilidad asociada y seleccionar para revision manual unicamente los casos de confianza baja o cercana al umbral.
- Analisis de encuestas y feedback: mapear comentarios abiertos a escalas ordinales de satisfaccion o gravedad con salida probabilistica, agregable despues a nivel de poblacion.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre items publicos de JevBench, con el runner propio de JevBench y una RTX 4080 Super. El autor indica que ningun item de JevBench se uso para entrenamiento, ajuste o seleccion.

| Split | n | Precision (accuracy) | ECE | Latencia p50 |
|---|---:|---:|---:|---:|
| easy | 48 | 1,000 | 0,056 | 28 ms |
| standard | 72 | 0,972 | 0,152 | 28 ms |
| hard | 111 | 0,802 | 0,094 | 78 ms |

En el nivel hard el modelo acierta 89 de 111 items, frente a los 82 de su checkpoint de partida JevK5 v0.2 (8 items corregidos, 1 roto). No se han publicado en la informacion disponible resultados de benchmarks generales como MMLU, HumanEval o GSM8K, ni comparaciones con modelos de clasificacion ajenos a esta linea.

## Requisitos de hardware

- VRAM para inferencia: la model card indica que se necesita una GPU CUDA con unos 10 GB libres en bf16 (los pesos en bf16 ocupan aproximadamente 8,4 GB, mas cache y overhead del runtime).
- Estimaciones de VRAM segun cuantizacion (derivadas del numero de parametros, no confirmadas por el autor): alrededor de 4,5 GB en 8 bits y alrededor de 2,5 a 3 GB en 4 bits, suponiendo soporte efectivo en el runtime.
- GPU recomendadas: RTX 4080 Super validada por el autor con latencias de 28 a 78 ms; para mayor concurrencia o throughput, A100 o H100. El modelo cabe con holgura en RTX 4090 y RTX 3090.
- Cabe en GPU de consumo: si, siempre que se disponga de 10 GB libres en bf16; en tarjetas de 12 GB el margen es estrecho y depende del resto de procesos del sistema.
- Opciones de despliegue: runtime `jevk5` (Apache-2.0) instalado desde `pip install "jevk5[fast] @ git+https://github.com/allebee/jevk5@v0.2.0`, en modo libreria Python o como servicio HTTP con `jevk5-serve`. Existe un repositorio GGUF para llama.cpp y Ollama, aunque la interfaz de decision calibrada documentada depende del runtime jevk5.
- Latencia: 28 ms p50 en los niveles easy y standard, 78 ms p50 en el nivel hard, medidos en una RTX 4080 Super.
- Throughput y consumo de memoria en produccion: no disponible.

## Comparativa con modelos similares

No se dispone de benchmarks comparativos publicados con alternativas de la misma categoria. La siguiente tabla recoge unicamente los modelos de la misma linea de ascendencia, que no son alternativas independientes sino el punto de partida del ajuste.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Plumb-4B | 4,2 B | no disponible | 89/111 en el nivel hard de JevBench; ECE 0,094 en hard | Apache-2.0 | HuggingFace, runtime jevk5, GGUF aparte |
| JevK5 v0.2 (checkpoint de partida) | no disponible | no disponible | 82/111 en el nivel hard de JevBench | Apache-2.0 | HuggingFace (alibiserikbay/JevK5) |
| Qwen3.5-4B (base de la ascendencia) | aproximadamente 4 B | no disponible | no disponible | Apache-2.0 | no disponible en la informacion recogida |

Comparacion con clasificadores encoder tradicionales, modelos de reranking o LLM generativos usados como clasificadores: no disponible.

## Limitaciones y advertencias

- El modelo esta entrenado y declarado unicamente para ingles; no hay evidencia de comportamiento fiable en castellano ni en otros idiomas.
- No es un modelo conversacional ni generativo pese a las etiquetas `text-generation` y `conversational` del repositorio: no produce texto libre, solo distribuciones de probabilidad sobre opciones predefinidas.
- La calibracion depende de una temperatura fija (2,07) ajustada sobre un conjunto held-out concreto; en dominios distintos la calibracion puede degradarse y requerir recalibracion propia. El ECE de 0,152 en el nivel standard indica un error de calibracion no despreciable.
- Los conjuntos de evaluacion son pequenos (48, 72 y 111 items), por lo que las tasas de acierto tienen intervalos de confianza amplios y no deben extrapolarse sin cautela.
- Los datos de entrenamiento fueron generados por Qwen3.8-27B, de modo que el modelo puede heredar los sesgos y los errores sistematicos de ese profesor, incluidas las decisiones que el propio profesor etiqueto como dudosas.
- Riesgo de alucinacion: al no generar texto no inventa contenido, pero puede asignar probabilidades altas a opciones incorrectas cuando la evidencia de entrada es ambigua, incompleta o esta fuera de distribucion.
- Dependencia fuerte de un runtime joven y especifico (`jevk5`, version 0.2.0 citada), con un ecosistema mucho menos maduro que vLLM, TGI o llama.cpp para modelos generativos.
- Validacion externa practicamente inexistente en el momento de la consulta: 0 descargas y 0 likes en HuggingFace, con un unico autor responsable del modelo, del dataset, de los benchmarks y de las auditorias.
- Uso comercial: la licencia Apache-2.0 lo permite, pero deben respetarse las condiciones del modelo base (JevK5, Apache-2.0), de Qwen3.5-4B (Apache-2.0) y del readout de SemIf (MIT), segun el fichero `NOTICE` del repositorio.
- La busqueda web realizada no devolvio informacion tecnica adicional sobre el modelo: los resultados obtenidos corresponden a equipos de audio TEAC CR-H225 y a articulos genericos sobre numero de parametros, por lo que toda la ficha se apoya en la model card y en los metadatos del repositorio de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/crh225/plumb-4b
- Version GGUF para llama.cpp y Ollama: https://huggingface.co/crh225/plumb-4b-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/crh225/plumb-decisions
- Repositorio del proyecto, con detalles, auditorias y resultados por item: https://github.com/crh225/plumb
- Runtime jevk5: https://github.com/allebee/jevk5
- Modelo base JevK5: https://huggingface.co/alibiserikbay/JevK5
- Perfil del autor en GitHub: https://github.com/crh225
