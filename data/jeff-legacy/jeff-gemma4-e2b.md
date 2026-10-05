# jeff-legacy/Jeff-Gemma4-E2B

## Resumen

Jeff-Gemma4-E2B es un ajuste fino del modelo google/gemma-4-E2B-it desarrollado por el usuario jeff-legacy dentro de la familia Jeff de modelos de decision. No es un modelo generativo al uso: no produce texto libre, sino que recibe una descripcion de una situacion junto con una lista de opciones en lenguaje natural y devuelve, en una unica pasada forward, una probabilidad calibrada por cada opcion. Esta disenado para funcionar como clasificador zero-shot de bajisima latencia, con aproximadamente 29 ms por decision en una GPU RTX PRO 6000.

El checkpoint contiene 4.628.569.344 parametros (unos 4,63B) en formato safetensors y ocupa 9,3 GB en el repositorio. Esta etiquetado con los pipelines `zero-shot-classification` y `feature-extraction`, y declara soporte exclusivo para ingles. La licencia indicada en los metadatos es Apache 2.0, aunque el campo `license_link` apunta a la licencia de Gemma de Google, una discrepancia que conviene resolver antes de un uso comercial.

Su relevancia actual es acotada: el propio autor lo marca como superado (*superseded*) y senala que la release vigente de la familia es Jeff v1.3, publicada como `mstrasser/jeff-base`. Dentro del nicho de modelos de decision, ocupa una posicion intermedia: logra 81,6% de exactitud de panel con un error de calibracion (ECE) de 0,031 y 29 ms por decision, frente a los 212 ms por llamada que reporta Jev a traves de su API. Es, por tanto, una opcion para clasificacion de intenciones, etiquetado y enrutado en local, no un sustituto de un LLM conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Gemma 4 (etiqueta `gemma4_text`); no se detalla la composicion interna en la informacion disponible |
| Parametros totales | 4.628.569.344 (~4,63B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (el `license_link` apunta a la licencia de Gemma de Google) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E2B-it` y se ajusta como modelo de decision, no como generador de texto. La salida es una distribucion de probabilidad sobre las opciones proporcionadas, con tres tipos de pregunta soportados: `choice` (elegir una opcion entre varias; en este checkpoint, hasta 26 opciones), `noul` (si/no devuelto como probabilidad) y `score` (un punto en una escala descrita por el usuario). Varias preguntas independientes pueden responderse en una misma peticion. El formato de entrada es JSON, con un campo `state` y un bloque `questions`, y la respuesta incluye la probabilidad por opcion, la opcion elegida y una confianza.

El entrenamiento se realizo integramente en hardware local: una sola GPU de estacion de trabajo RTX PRO 6000, con unas 3,5 horas de entrenamiento para el modelo de 2B (segun las cifras que el autor da para la familia). Los datos sinteticos de entrenamiento fueron generados por un modelo abierto, Qwen3.8-Flash-Next, ejecutado sobre dos DGX Sparks; el autor afirma que no se uso salida de modelos cerrados en los datos y que un modelo cerrado solo se empleo para verificar por muestreo la calidad de los datos sinteticos. El codigo de entrenamiento parte de la receta open source AutoJev. Jeff-Gemma4-E2B no fue reentrenado en la revision v1.1 de la familia y permanece en v1.0, por lo que las mejoras de esa revision (listas largas de hasta 254 opciones, cambios de calibracion y checkpoints) no le aplican.

## Capacidades

- Clasificacion zero-shot: las categorias no necesitan aparecer en los datos de entrenamiento; se describen en el momento de la consulta.
- Decision de tipo `choice`: seleccion de una opcion entre un maximo de 26 opciones en este checkpoint.
- Decision booleana `noul`: respuesta si/no expresada como probabilidad.
- Puntuacion `score`: asignacion de un valor dentro de una escala definida por el usuario.
- Respuesta multi-pregunta: varias preguntas independientes resueltas en una sola peticion.
- Probabilidades calibradas por opcion (ECE de 0,031), aptas para umbrales y enrutado automatico.
- Latencia muy baja por decision: unos 29 ms en RTX PRO 6000.
- Salida estructurada sin texto generado ni parseo posterior.
- No soporta generacion de texto, razonamiento libre, codigo, matematicas, vision, audio ni tool calling segun la informacion disponible.
- Multilingue: no; solo ingles.

## Casos de uso

- Clasificacion de intenciones en asistentes de voz: el modelo recibe la transcripcion y el estado de la pantalla actual, y devuelve la probabilidad de cada intencion candidata. El ejemplo incluido en la model card resuelve entre "Engagement letter", "Inbox" y "Deal settings" con `{"1": 0.94, "2": 0.03, "3": 0.03}`.
- Enrutado de tickets de soporte: descripcion del ticket como `state` y lista de colas o equipos como opciones, con la probabilidad calibrada usada para asignar automaticamente o para derivar a revision humana por debajo de un umbral.
- Moderacion de contenido por etiquetas: definicion de las etiquetas de moderacion en la propia consulta (`choice`) para clasificar mensajes sin necesidad de reentrenar.
- Puntuacion de sentimiento o calidad: uso del tipo `score` para asignar un punto en una escala descrita (por ejemplo, tono de una resena) en lugar de una clase discreta.
- Interpretacion de comandos de juego o de interfaz: mapeo de una accion descrita por el usuario a un movimiento concreto del conjunto de movimientos validos; el autor menciona resultados medidos sobre un arnes de juego.
- Filtros previos de bajo coste en pipelines de LLM: decidir en 29 ms si una consulta requiere llamar a un modelo mayor o si puede resolverse con una regla fija.
- Sistemas de decision embebidos o de borde con GPU de gama de estacion de trabajo, dado que el modelo se entrena y se ejecuta sin dependencia de nube.
- Punto de partida para un ajuste fino propio: el autor reporta que un fine-tune corto sobre ejemplos propios de navegacion por voz elevo la exactitud en held-out del 31,7% al 95,8% en menos de media hora en una GPU.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre 4.599 preguntas de cinco benchmarks publicos, comparados con la version sin entrenar del modelo base y con las referencias que cita el autor:

| Benchmark | Gemma 4 E2B sin entrenar | Jeff-Gemma4-E2B | Jev (publicado) | AutoJev-27B (publicado) |
|---|---|---|---|---|
| Overall (5 benchmarks) | 62,5 | 81,6 | 83,0 | 84,9 |
| BBH | 51,3 | 66,4 | 94,3 | 82,8 |
| Financial PhraseBank | 36,0 | no disponible (dato truncado en la informacion recibida) | no disponible | no disponible |

Metricas adicionales de la comparativa de familia:

| Modelo | Exactitud de panel sin entrenar | Exactitud de panel Jeff | ECE | Tiempo por decision (RTX PRO 6000) |
|---|---|---|---|---|
| Jeff-Qwen3.5-0.8B | 45,3% | 79,1% | 0,021 | 22 ms |
| Jeff-Qwen3.5-2B | 46,5% | 82,0% | 0,026 | 24 ms |
| Jeff-Gemma4-E2B (este modelo) | 62,5% | 81,6% | 0,031 | 29 ms |
| Jev (publicado) | no disponible | 83,0% | ~0,06 (media de sus cifras por benchmark) | 212 ms por llamada sobre API (arnes Doom) |

El autor advierte de que los modelos de esta familia no alcanzan el razonamiento de Jev, que corre sobre un modelo mucho mayor, y que gran parte de la mejora respecto al base procede del ajuste de calibracion y formato de decision. No hay datos de MMLU, HumanEval ni GSM8K, dado que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 10 GB en precision bf16/fp16 (coherente con un repositorio de 9,3 GB); del orden de 5-6 GB en cuantizacion de 8 bits y de 3-4 GB en 4 bits, como estimacion a partir del numero de parametros, ya que no se publican cuantizaciones oficiales.
- GPU de referencia para las mediciones: NVIDIA RTX PRO 6000, con 29 ms por decision.
- Cabe en GPU de consumo: con 4,63B de parametros, es viable en tarjetas de 8-12 GB o superiores (por ejemplo, RTX 3060 de 12 GB, RTX 4070/4080/4090) siempre que se use cuantizacion en los modelos de menos VRAM.
- Opciones de despliegue: la libreria declarada es `transformers` y el modelo esta marcado como `endpoints_compatible`; tambien es desplegable en servidores compatibles con safetensors como TGI o vLLM. No se anuncia soporte GGUF ni Ollama en la informacion disponible.
- Backend MLX: el autor indica que su backend MLX para Mac solo ejecuta los modelos Qwen de la familia, no este checkpoint de Gemma.
- Latencia medida: 29 ms por decision para una peticion simple en RTX PRO 6000; no se publica throughput agregado ni comportamiento con batching.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Exactitud de panel | ECE | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Jeff-Gemma4-E2B | 4,63B (~4.628.569.344) | no disponible | 81,6% | 0,031 | apache-2.0 (con enlace a licencia Gemma) | HuggingFace, safetensors, transformers |
| Jeff-Qwen3.5-0.8B | ~0,8B (segun denominacion) | no disponible | 79,1% | 0,021 | no disponible | HuggingFace |
| Jeff-Qwen3.5-2B | ~2B (segun denominacion) | no disponible | 82,0% | 0,026 | no disponible | HuggingFace |
| Jev (publicado) | no disponible | no disponible | 83,0% | ~0,06 | no disponible (producto de TypeSafe, con API) | API, 212 ms por llamada |
| AutoJev-27B (publicado) | 27B (segun denominacion) | no disponible | 84,9% | no disponible | no disponible | no disponible |

Frente a los modelos Qwen de la misma familia, Jeff-Gemma4-E2B parte de un base mucho mejor (62,5% sin entrenar frente a 45,3% y 46,5%) pero solo alcanza 81,6% tras el ajuste, y su calibracion es peor (0,031 frente a 0,021 y 0,026) y su latencia mayor (29 ms frente a 22 y 24 ms). Su ventaja principal es que el checkpoint base ya era mas capaz. El autor advierte que no esta afiliado ni respaldado por TypeSafe, fabricante de Jev, aunque comparte su formato de peticion.

## Limitaciones y advertencias

- Modelo superado: el autor indica explicitamente que esta release ya no se actualiza y que la version vigente es Jeff v1.3 (`mstrasser/jeff-base`).
- No es un modelo generativo: no produce texto, codigo ni razonamiento; solo probabilidades sobre opciones descritas.
- No fue reentrenado en v1.1, por lo que no incorpora las mejoras de listas largas (hasta 254 opciones) ni los ajustes de calibracion de esa revision; su limite es de 26 opciones.
- Solo ingles: no hay soporte multilingue declarado, lo que limita su uso directo en castellano sin un ajuste fino.
- Exactitud limitada por tamano: en BBH obtiene 66,4 frente a 94,3 de Jev, y el propio autor senala que su razonamiento no iguala al de modelos mayores.
- Riesgo de alucinacion acotado por diseno (no genera texto), pero puede asignar alta confianza a la opcion equivocada; el ECE de 0,031 indica buena calibracion global, no ausencia de errores.
- Discrepancia de licencia: los metadatos declaran apache-2.0, mientras que el `license_link` apunta a la licencia de Gemma de Google. Debe verificarse la licencia real del modelo derivado antes de cualquier uso comercial.
- Datos de entrenamiento sinteticos generados por un modelo abierto y verificados solo por muestreo con un modelo cerrado: existe riesgo de sesgos heredados del generador de datos.
- No se publican datos de contexto, cuantizaciones oficiales ni throughput, lo que complica el dimensionamiento preciso de un despliegue en produccion.
- El benchmark JevBench (tier dificil) se reporta para los modelos Qwen de v1.1; no se ofrece cifra para este checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jeff-legacy/Jeff-Gemma4-E2B
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Release vigente de la familia (Jeff v1.3): https://huggingface.co/mstrasser/jeff-base
- Jeff-Qwen3.5-0.8B: https://huggingface.co/mstrasser/Jeff-Qwen3.5-0.8B
- Jeff-Qwen3.5-2B: https://huggingface.co/mstrasser/Jeff-Qwen3.5-2B
- Receta de entrenamiento AutoJev: https://github.com/denis-pplx/autojev
- Repositorio e incidencias del proyecto Jeff: https://github.com/firelex/jeff/issues/1
- Licencia de Gemma 4 referenciada por el autor: https://ai.google.dev/gemma/docs/gemma_4_license
