# d-michail/Mitos-Qwen3-1.7B-Process-LoRA

## Resumen

Mitos-Qwen3-1.7B-Process-LoRA es un adaptador LoRA desarrollado por el usuario d-michail sobre el modelo base Qwen/Qwen3-1.7B, especializado en respuesta a preguntas sobre tramites de la administracion publica griega. El modelo se ha entrenado con la informacion estructurada del Registro Nacional de Procedimientos Administrativos de Grecia (ΕΜΔΔ, conocido como Mitos), dependiente del Ministerio del Interior heleno. El objetivo es ofrecer un asistente capaz de responder consultas ciudadanas sobre procedimientos administrativos concretos, citando plazos, importes y documentacion requerida.

El modelo pertenece a la familia de adaptadores Mitos-Qwen-Process, que se apoya en el conjunto de datos d-michail/mitos-qa. Este adaptador concreto se ha entrenado sobre 90.145 registros de pregunta-respuesta generados a partir del texto estructurado de los 4.407 procedimientos del registro, sin intervencion de un LLM en la generacion de las respuestas. El repositorio contiene dos adaptadores LoRA: uno en la raiz, entrenado con todos los procedimientos, y otro en el subdirectorio `holdout/`, entrenado con 4.187 procedimientos y reservado para reproduccion de los resultados del articulo.

Se trata de un adaptador de bajo rango (rank 16), no de un modelo completo, y esta pensado para uso en investigacion sobre question answering en el dominio de la administracion publica griega, tanto en modo closed-book como con generacion aumentada por recuperacion (RAG). Su relevancia radica en que aborda un dominio muy especifico y poco cubierto por los modelos generalistas, con licencia CC BY-SA 4.0 derivada del contenido del registro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), adaptador LoRA sobre las proyecciones de atencion y MLP |
| Parametros totales | 1.700 millones en el modelo base Qwen3-1.7B (el adaptador anade un numero reducido de parametros entrenables; no disponible el conteo exacto) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el entrenamiento se realizo con longitud maxima de secuencia de 4.096 tokens |
| Tipos de cuantizacion | No disponible; el adaptador se distribuye en safetensors y requiere el modelo base. La cuantizacion aplicable depende del runtime sobre Qwen3-1.7B |
| Idiomas soportados | Griego (el) |
| Licencia | CC BY-SA 4.0; el modelo base Qwen3 se distribuye bajo Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-1.7B, un transformer decoder-only de 1.700 millones de parametros. La tecnica de ajuste es LoRA con rango 16 y alpha 32, aplicada sobre todas las proyecciones de atencion y de las capas MLP. La optimizacion empleo una tasa de aprendizaje de 2e-4 con schedule coseno, 2 epocas, batch efectivo de 32 y precision bfloat16. La longitud maxima de secuencia durante el entrenamiento fue de 4.096 tokens, y el calculo de la perdida se restringio unicamente a los tokens del asistente mediante entropia cruzada estandar, con la plantilla de chat de Qwen3 y el modo de razonamiento desactivado (`enable_thinking=False`).

Los datos de entrenamiento provienen del conjunto d-michail/mitos-qa (configuracion `json-all`) y cubren los 4.407 procedimientos del registro. Los dialogos y registros de pregunta-respuesta se generaron de forma sintetica o mediante plantillas a partir del texto estructurado del registro, sin emplear un LLM en la generacion de las respuestas; la propia model card indica que los dialogos de entrenamiento se generaron con Qwen3.8-27B. La instantanea de datos se descargo entre el 1 y el 2 de octubre de 2026, con registros actualizados entre el 26 de junio y el 1 de octubre de 2026. No se menciona en la informacion disponible el uso de RLHF, DPO ni otras tecnicas de alineacion posteriores al ajuste supervisado.

## Capacidades

- Generacion de texto conversacional en griego orientada a question answering sobre procedimientos administrativos.
- Respuestas estructuradas y extensas que siguen el formato de las entradas del registro (la model card indica respuestas mas largas que otros adaptadores de la familia, con una media de 116 a 250 palabras segun la configuracion de recuperacion).
- Funcionamiento en modo closed-book, sin contexto externo, aunque con recuperacion de hechos limitada.
- Funcionamiento con generacion aumentada por recuperacion (RAG), integrando contexto recuperado de los procedimientos en el prompt.
- Capacidad de declarar explicitamente cuando la informacion disponible no basta para responder, si se le indica en el prompt.
- Especializacion en un dominio administrativo concreto (registro Mitos), con vocabulario y estructura propios.
- No dispone de soporte documentado de tool calling, function calling, capacidades de agente, vision ni audio en la informacion proporcionada.
- Capacidades multilingues limitadas al griego segun los metadatos del modelo; no se documenta soporte de otros idiomas.
- No utiliza modo de razonamiento explicito (thinking); el entrenamiento se hizo con `enable_thinking=False`.

## Casos de uso

- Atencion al ciudadano sobre tramites administrativos: el modelo responde preguntas sobre procedimientos del registro Mitos empleando contexto recuperado, con respuestas alineadas con la estructura oficial de cada tramite.
- Busqueda asistida en portales de administracion publica: integrado en un buscador gubernamental, el modelo puede reformular y responder consultas en griego sobre requisitos, plazos y documentacion de cada procedimiento.
- Asistente RAG para oficinas de informacion: combinado con un indice de recuperacion a nivel de campo o de ventana, el modelo alcanza un key-fact recall de 0.565 o 0.317 respectivamente, adecuado para tareas de orientacion previa no vinculante.
- Investigacion academica en PLN juridico-administrativo: sirve como sistema de referencia para estudiar el rendimiento de modelos pequenos en dominios especializados y con recursos linguisticos escasos como el griego.
- Reproduccion de experimentos: el adaptador del subdirectorio `holdout/` permite reproducir las metricas del articulo sin contaminacion por los procedimientos reservados.
- Generacion de borradores de respuestas administrativas: con supervision humana y verificacion posterior, el modelo puede redactar borradores que sigan el formato y el registro del dominio.
- Clasificacion o resumen de contenido del registro: aunque no es su tarea principal, el ajuste sobre texto estructurado del registro puede emplearse para tareas auxiliares de organizacion de informacion administrativa.

## Benchmarks y rendimiento

Evaluacion del adaptador `holdout/` con metricas sin juez externo, sobre 1.933 preguntas:

| Sistema | Key-fact recall (base) | Key-fact recall (este modelo) | Token F1 (este modelo) | Palabras (este modelo) |
|---|---|---|---|---|
| Closed-book | 0.031 | 0.061 | 0.108 | 207 |
| RAG (chunks a nivel de campo) | 0.422 | 0.565 | 0.294 | 116 |
| RAG-split (ventanas) | 0.234 | 0.317 | 0.182 | 183 |
| RAG-process (procedimientos completos) | 0.202 | 0.187 | 0.113 | 250 |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) para este adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones tecnicas a partir de los 1.700 millones de parametros, no cifras publicadas por el autor): aproximadamente 3,4 GB en bfloat16 o fp16, en torno a 1,8 GB en cuantizacion de 8 bits y alrededor de 1 GB en 4 bits, mas el overhead del adaptador LoRA (el repositorio ocupa 0,2 GB e incluye dos adaptadores).
- Cabe con holgura en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, entre otras. Tambien puede ejecutarse en CPU y en equipos con GPU integrada si se cuantiza.
- GPU de centro de datos (A100, H100, L40S) sobredimensionadas para este modelo; son utiles para servir muchas instancias en paralelo.
- Opciones de despliegue: transformers con PEFT (metodo documentado en la model card), vLLM (con soporte de adaptadores LoRA), TGI, y llama.cpp u Ollama previa fusion del adaptador con el modelo base y conversion a GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de rendimiento de otros modelos de la misma categoria sobre este dominio. La comparacion mas directa disponible es con el propio modelo base y con la version fusionada del adaptador:

| Modelo | Parametros | Contexto | Rendimiento en el benchmark | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mitos-Qwen3-1.7B-Process-LoRA (este modelo) | 1,7 B (base) + LoRA r16 | No disponible (entrenamiento a 4.096 tokens) | Key-fact recall 0.565 con RAG a nivel de campo | CC BY-SA 4.0 | HuggingFace |
| Mitos-Qwen3-1.7B-Process (modelo fusionado) | 1,7 B | No disponible | No disponible en esta ficha | CC BY-SA 4.0 | HuggingFace |
| Qwen/Qwen3-1.7B (modelo base sin ajuste) | 1,7 B | No disponible en la informacion proporcionada | No disponible (sirve como referencia "base" en las metricas de key-fact recall) | Apache-2.0 | HuggingFace |

No se dispone de datos comparativos con otros modelos ajustados al dominio administrativo griego (por ejemplo, alternativas basadas en Meltemi o EuroLLM) en la informacion proporcionada.

## Limitaciones y advertencias

- No constituye asesoramiento juridico: las respuestas no son legalmente vinculantes y el registro cambia con el tiempo. Un sistema en produccion debe mostrar la fuente y la fecha de recuperacion, y enlazar al procedimiento oficial.
- El modelo se entreno sin system prompt y con el razonamiento desactivado (`enable_thinking=False`); debe usarse la plantilla de chat de Qwen3 y colocar la pregunta o el prompt de recuperacion en el mensaje de usuario.
- En modo closed-book, el modelo aprende el registro y el formato del dominio pero apenas los hechos: el key-fact recall se mantiene en 0.061. La recuperacion aporta la mayor parte de la precision.
- Riesgo de afirmar datos concretos incorrectos, como importes, plazos o documentos.
- Los modelos pequenos pueden degenerar en bucles de repeticion que llegan al limite de tokens; se recomienda usar penalizacion por repeticion o una regla de parada en produccion.
- Los datos de entrenamiento son sinteticos o generados por plantillas a partir de una unica instantanea del registro, por lo que pueden reproducir errores y formulaciones del generador.
- El propio registro no garantiza la completitud ni la correccion de su contenido (condiciones de uso de mitos.gov.gr, clausula A.6); el modelo tampoco puede garantizarlas. Se debe verificar cada respuesta contra el procedimiento en vivo en `https://id.mitos.gov.gr/<Mitos ID>`.
- Los datos son una instantanea (descargada el 1-2 de octubre de 2026) y los procedimientos cambian, por lo que el modelo queda desactualizado con el tiempo.
- El adaptador de la raiz ha visto los 220 procedimientos reservados; no debe evaluarse sobre el split `unseen` del benchmark. Para evaluacion debe usarse el adaptador de `holdout/`.
- Restriccion de licencia: CC BY-SA 4.0 impone condicion de compartir igual. Conviene revisar las implicaciones antes de un uso comercial o de la distribucion de obras derivadas.
- Idiomas limitados al griego; no se documenta rendimiento en castellano ni en otros idiomas.
- No se documentan capacidades de tool calling, agentes, vision ni audio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/d-michail/Mitos-Qwen3-1.7B-Process-LoRA
- Modelo fusionado: https://huggingface.co/d-michail/Mitos-Qwen3-1.7B-Process
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/d-michail/mitos-qa
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Registro Nacional de Procedimientos Administrativos (Mitos): https://mitos.gov.gr
- API de datos abiertos del registro: https://api.mitos.gov.gr/info
- Consulta de procedimientos por identificador: https://id.mitos.gov.gr/<Mitos ID>
- Citacion del articulo: pendiente de publicacion segun la model card
