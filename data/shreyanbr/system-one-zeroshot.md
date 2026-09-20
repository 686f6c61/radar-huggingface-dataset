# shreyanbr/system-one-zeroshot

## Resumen

System One (zeroshot) es un cross-encoder de tipo DeBERTa-v3-xsmall con 70,8 millones de parametros, publicado por el usuario shreyanbr en HuggingFace. Su objetivo no es generar texto, sino responder preguntas de decision tipadas (Choice, Score y Noul) en una sola pasada forward por lote, sin emitir un solo token autorregresivo. Implementa el esquema TypeSafe Jev `POST /v1/systemone` y esta disenado especificamente para tareas de enrutado (routing), clasificacion y gating dentro de aplicaciones de software que no necesitan un modelo generativo.

El checkpoint no incorpora supervision adicional: es el modelo base de inferencia de lenguaje natural (NLI) `MoritzLaurer/deberta-v3-xsmall-zeroshot-v1.1-all-33` servido tal cual, con una capa de calibracion externa (`calibration.json`) que convierte los margenes crudos en probabilidades mediante una temperatura por pregunta y un escalador de Platt. Esto lo situa en la categoria de clasificadores zero-shot ligeros, no de asistentes conversacionales.

Su relevancia actual reside en el nicho de decisiones de enrutado de bajo coste: con 70,8 M de parametros y un repositorio de 0,3 GB, se puede ejecutar en CPU o en GPUs de gama baja con latencias muy inferiores a las de un LLM autorregresivo. Ahora bien, la propia model card advierte de que dos de las seis preguntas evaluadas estan al nivel de un predictor constante y de que una de las fuentes de supervision (`tickets`) tiene licencia CC-BY-NC-4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder DeBERTa-v3-xsmall (transformer denso, no generativo) |
| Parametros totales | 70.830.722 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la model card; DeBERTa-v3-xsmall emplea posiciones relativas con un maximo habitual de 512 tokens |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors |
| Idiomas soportados | no disponible; el checkpoint base es un modelo NLI multilingue (sufijo `all-33` en el nombre del modelo base) |
| Licencia | apache-2.0 (con la salvedad de que la supervision `triage` procede de un dataset CC-BY-NC-4.0) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

Se trata de un transformer encoder DeBERTa-v3-xsmall configurado como cross-encoder para clasificacion zero-shot. La entrada consiste en un estado (por ejemplo, un mensaje de cliente) y un conjunto de preguntas tipadas; cada pregunta define un tipo (`choice`, `score` o `noul`) y unos criterios o etiquetas candidatas. El modelo puntua cada candidato en una unica pasada forward por lote, sin decodificacion autorregresiva ni generacion de tokens.

No hay entrenamiento adicional sobre el checkpoint publicado: la model card indica explicitamente "Supervision for this checkpoint: None. The base NLI checkpoint, served as is". El modelo base es `MoritzLaurer/deberta-v3-xsmall-zeroshot-v1.1-all-33`, un NLI multilingue. La capa de calibracion es obligatoria en produccion: el fichero `calibration.json` se distribuye junto a los pesos y el motor lee de el una temperatura por pregunta y un escalador de Platt, porque los margenes crudos no son probabilidades. La model card tambien advierte de que el checkpoint base fue entrenado sobre banking77, por lo que esa fila de evaluacion esta contaminada.

## Capacidades

- Clasificacion zero-shot multietiqueta mediante criterios definidos en tiempo de inferencia.
- Respuesta a preguntas tipadas con tres tipos de salida: Choice (eleccion entre opciones), Score (puntuacion continua) y Noul.
- Enrutado de intenciones y seleccion de herramientas dentro de pipelines de software (`intent`, `tool`, `needs_tool`, `type`, `is_incident`, `priority`).
- Gating y decision binaria o categorica en un solo forward pass, apta para bucles de baja latencia.
- Calibracion de probabilidades mediante temperaturas por pregunta y escalado de Platt.
- Integracion con el esquema HTTP `POST /v1/systemone` de TypeSafe Jev.
- Compatible con endpoints de HuggingFace (etiqueta `endpoints_compatible`).
- No soporta generacion de texto, razonamiento multi-paso, tool calling agentico ni capacidades de vision o audio. Tampoco se documenta soporte explicito de function calling nativo.

## Casos de uso

- Enrutado de tickets de soporte: el modelo clasifica la intencion del mensaje (`intent`, con 0,508 de accuracy frente a 0,010 de suelo de mayoria) y decide a que equipo derivarlo, sin coste de generacion.
- Deteccion de necesidad de herramienta: la pregunta `needs_tool` alcanza 0,792 de accuracy frente a 0,694 del predictor constante, util como primera etapa de un pipeline que decide si invocar una API externa.
- Clasificacion de tipo de incidencia: con 0,754 de accuracy en `is_incident` (suelo 0,626), sirve como filtro de escalado antes de recurrir a un LLM grande.
- Seleccion de herramienta concreta: la pregunta `tool` obtiene 0,384 frente a un suelo de 0,306, lo que la hace marginalmente util pero insuficiente como unico criterio de decision.
- Gating previo a un LLM: al resolver decisiones simples en milisegundos, evita invocar un modelo autorregresivo para cada consulta, reduciendo coste y latencia.
- Anotacion y pre-etiquetado de datasets: su naturaleza zero-shot permite prototipar esquemas de etiquetas sin reentrenar, siempre que se validen contra un conjunto de test.
- Modulo de moderacion o triaje preliminar en aplicaciones de software que ya disponen de un contrato de schema tipado.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre particiones de test de 500 elementos. Se incluye la columna `majority floor` (precision de un predictor constante) porque, segun la propia ficha, debe leerse junto al resultado absoluto:

| Pregunta | Accuracy | Suelo de mayoria |
|---|---:|---:|
| `intent` | 0,508 | 0,010 |
| `tool` | 0,384 | 0,306 |
| `needs_tool` | 0,792 | 0,694 |
| `priority` | 0,464 | 0,464 |
| `type` | 0,560 | 0,374 |
| `is_incident` | 0,754 | 0,626 |

Dos de las seis preguntas (`priority` y, en la practica, `tool`) se situan al nivel o por debajo de un predictor constante para todos los sistemas medidos, incluido Claude Haiku 4.5, segun la model card. La ficha no proporciona resultados de MMLU, HumanEval, GSM8K ni metricas generativas, ya que el modelo no es generativo.

## Requisitos de hardware

- Inferencia en FP32: aproximadamente 283 MB de pesos (70,8 M de parametros x 4 bytes), mas activaciones; cabe en CPU.
- Inferencia en FP16/BF16: aproximadamente 142 MB de pesos; cabe en cualquier GPU consumer moderna.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre; no requiere A100 ni H100. Una RTX 3060, RTX 4090 o incluso una iGPU reciente son suficientes.
- Cabe sin problemas en GPUs consumer e incluso en entornos de CPU exclusiva o dispositivos edge con suficiente RAM.
- Opciones de despliegue: `transformers` nativo, HuggingFace Inference Endpoints (etiqueta `endpoints_compatible`) y el motor propio `systemone.engine.SystemOneEngine`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la informacion proporcionada.
- Latencia y throughput: no disponibles. Al no generar tokens, la latencia es la de un unico forward pass del encoder, sustancialmente menor que la de un LLM autorregresivo equivalente en calidad de clasificacion, pero no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| shreyanbr/system-one-zeroshot | 70,8 M | no disponible (DeBERTa-v3-xsmall) | Cross-encoder NLI zero-shot con calibracion externa | apache-2.0 (con caveat CC-BY-NC en supervision `triage`) | HuggingFace, 0 descargas, 0 likes |
| MoritzLaurer/deberta-v3-xsmall-zeroshot-v1.1-all-33 | ~70 M (mismo backbone) | 512 tokens tipicos de DeBERTa-v3 | NLI multilingue zero-shot, proposito general | no disponible en esta informacion | HuggingFace (modelo base declarado) |
| Claude Haiku 4.5 | no disponible | no disponible | LLM autorregresivo propietario | propietaria | API de Anthropic |

La model card menciona explicitamente a Claude Haiku 4.5 como sistema de comparacion en la evaluacion de las seis preguntas tipadas, pero no publica los numeros concretos de ese sistema, por lo que no es posible reproducir la comparativa cuantitativa. No se han identificado en la informacion proporcionada otros modelos comparables de la misma categoria con datos verificables.

## Limitaciones y advertencias

- Contaminacion de datos: el checkpoint base fue entrenado sobre banking77, por lo que la fila correspondiente a ese dataset en la evaluacion esta contaminada.
- Techo de precision por errores de etiqueta: banking77 tiene una tasa de error de etiquetado publicada cercana al 14 %, lo que limita la accuracy alcanzable a aproximadamente 0,86.
- Preguntas cercanas a no aprendibles: `triage.priority` queda al nivel del suelo de mayoria (0,464 en ambos casos) para todos los backends medidos, incluido Claude Haiku 4.5.
- Restriccion de licencia para uso comercial: el dataset `tickets` es CC-BY-NC-4.0, de modo que la supervision derivada de `triage` no es apta para uso comercial, aunque los pesos se publiquen bajo apache-2.0.
- Reproducibilidad limitada: los resultados proceden de una unica semilla y una unica ejecucion; los intervalos son bootstrap sobre elementos de test, no sobre semillas de entrenamiento.
- Sin datos de sesgo: la model card no documenta evaluaciones de sesgo, equidad ni comportamiento por idioma.
- Idiomas no especificados: aunque el modelo base sea multilingue, no se confirma que rendimiento tiene en castellano ni en que idiomas se ha validado.
- Riesgo de alucinacion de etiquetas: al ser zero-shot, criterios mal formulados o etiquetas ambiguas pueden producir asignaciones incorrectas sin senal de incertidumbre fiable si no se aplica `calibration.json`.
- Los margenes crudos no son probabilidades; omitir el fichero de calibracion invalida cualquier interpretacion probabilistica de la salida.
- Estado de adopcion nulo: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en produccion por terceros.
- La model card documenta la retractacion de una cifra anterior del propio autor, lo que refuerza la necesidad de tratar los numeros con cautela.

## Enlaces

- Modelo en HuggingFace: <https://huggingface.co/shreyanbr/system-one-zeroshot>
- Modelo base: <https://huggingface.co/MoritzLaurer/deberta-v3-xsmall-zeroshot-v1.1-all-33>
- Repositorio con codigo fuente y harness de benchmarks: <https://github.com/shreyanbr/jev-haiku-benchmarking>
- Busqueda web: no se han encontrado resultados relevantes sobre este modelo en la busqueda proporcionada; los enlaces devueltos corresponden a documentacion educativa sin relacion con el modelo.
