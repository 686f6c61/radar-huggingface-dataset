# felhen-ai/saracura-ptbr-4b

## Resumen

Saracura PT-BR 4B es un modelo de decisión para portugués de Brasil publicado por felhen-ai. No es un modelo generativo: se construye como un adaptador LoRA más una cabeza de puntero (256 dimensiones) sobre el modelo base `Qwen/Qwen3.5-4B-Base`, siguiendo la receta de Kev, y responde tres tipos de decisión sobre un texto de entrada en una sola pasada, sin generar texto: `choice` (elegir una entre N opciones), `noul` (sí/no con probabilidad) y `score` (escala ordinal). Se sirve mediante una API compatible con System One de TypeSafe, a través del servidor de Kev.

El entrenamiento parte del checkpoint publicado `jaredpalmer/kev-4b` y se especializa con decisiones en portugués: 55.998 peticiones y 90.403 preguntas (56.996 `choice`, 23.541 `noul`, 9.866 `score`), 2 épocas, LoRA de rango 16 en todas las proyecciones, lr 2e-5, estado de hasta 2.048 tokens y 14.000 pasos en una RTX 5090 en unas 21 horas. Es el hermano mayor de `felhen-ai/saracura-ptbr-v0` (322M, receta de Laya): más precisión y más transferencia a tareas no vistas, a cambio de requerir GPU.

Su relevancia práctica está en que ofrece clasificación tipada y estructurada (no texto libre) con acuerdos de licencia permisivos (Apache 2.0) y con resultados medidos en un benchmark público en portugués: 73,1% de precisión balanceada media en el benchmark PT-BR v1, frente al 68,5% del modelo de 322M, y 96,8% en una tarea fuera del entrenamiento (selección del fragmento de respuesta correcto en el FAQ del Banco Central). El repositorio, de 0,2 GB, contiene únicamente el adaptador; el modelo base debe descargarse aparte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base `Qwen/Qwen3.5-4B-Base`) con adaptador LoRA (rango 16 en todas las proyecciones) y cabeza de puntero de 256 dimensiones; receta Kev (adaptador + pointer head) |
| Parametros totales | ~4.000 millones en el modelo base, más el adaptador LoRA y la cabeza de 256 dimensiones (el repositorio publicado ocupa 0,2 GB y contiene solo el adaptador) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens de estado, usada en entrenamiento y evaluación; el contexto nativo del modelo base no se especifica en la información disponible |
| Tipos de cuantizacion | no disponible; el autor reporta ejecución en bf16 y el repositorio solo publica pesos safetensors del adaptador |
| Idiomas soportados | portugués (pt, pt-BR) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); librería `peft` |
| Modelo base | Qwen/Qwen3.5-4B-Base (relación: adapter) |
| Tarea declarada (pipeline) | text-classification |
| Salidas soportadas | `choice`, `noul`, `score` |
| Descargas / likes | 0 / 0 |
| Fecha de publicación / actualización | 2026-10-06 / 2026-10-06 |

## Arquitectura y entrenamiento

El modelo no sigue el esquema de un LLM generativo, sino el de la receta Kev: sobre `Qwen/Qwen3.5-4B-Base` se añade un adaptador LoRA de rango 16 en todas las proyecciones y una cabeza de puntero de 256 dimensiones. La inferencia consiste en leer el estado (el texto sobre el que se decide) y las preguntas tipadas con sus opciones, y producir directamente la etiqueta elegida o la probabilidad, sin decodificación autoregresiva de texto. Las decisiones admiten tres tipos: `choice` (una entre N opciones con criterios declarados), `noul` (sí/no con probabilidad) y `score` (escala ordinal). El servidor de Kev implementa cache de prefijo para reutilizar el estado cuando se hacen varias preguntas sobre el mismo texto.

El ajuste se hizo a partir de `jaredpalmer/kev-4b` (`--init_from`), con 55.998 peticiones y 90.403 preguntas, 2 épocas, lr 2e-5, acumulación de gradiente 8, estado de hasta 2.048 tokens y 14.000 pasos en una RTX 5090 (~21 horas). Las fuentes de datos incluyen el split de entrenamiento del benchmark PT-BR v1 (OLID-BR, FACTCK.BR, FaQuAD-NLI, SciELO, JurisTCU y Cámara dos Deputados; licencias CC BY 4.0 / MIT / datos públicos), el config `pt` de `telepatia-ai/typed-decisions-pt-es` (Apache 2.0), anuncios de autopartes de un marketplace brasileño segmentados en 12 categorías (datos internos, no redistribuidos, con etiquetas de `Qwen/Qwen3.8-27B`), documentos internos de Felhen (tipo, área, estado; se excluyeron los sensibles) y textos sintéticos de ocho casos de uso. Las preguntas y respuestas de entrenamiento se generaron con `Qwen/Qwen3.8-27B` (local) y `Qwen/Qwen3.5-397B-A17B` (vía OpenRouter), es decir, hay un componente claro de destilación de anotaciones desde modelos mayores. No se menciona RLHF ni DPO.

## Capacidades

- Decisión de tipo `choice`: elegir una opción entre N (hasta 24 categorías evaluadas) a partir de un texto de estado y de las instrucciones y criterios de la pregunta.
- Decisión de tipo `noul`: respuesta binaria sí/no con probabilidad asociada.
- Decisión de tipo `score`: puntuación en escala ordinal.
- Inferencia en una sola pasada y sin generación de texto, con latencia declarada de 100-170 ms por decisión en llamadas individuales sobre una RTX 5090 en bf16 y textos largos, sin kernels optimizados.
- Clasificación temática: temas de proposición legislativa (24 clases), gran área de resumen científico (8 clases), área de jurisprudencia del TCU (10 clases).
- Verificación de veracidad de afirmaciones (3 clases) y detección de comentarios ofensivos y de su objetivo (3 clases y binario).
- Atribución de evidencia: decidir si un fragmento responde a una pregunta (binario) y seleccionar el fragmento de respuesta correcto entre varios (4 opciones en la prueba del FAQ del Banco Central).
- Clasificación de anuncios de marketplace en 12 segmentos.
- Soporte de tool calling / function calling: no disponible; el modelo no genera texto ni llamadas a herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo resuelve una decisión por petición, aunque el servidor permite varias preguntas sobre un mismo estado.
- Capacidades multilingües: solo el portugués está declarado; el autor reporta que el ajuste en portugués no degradó el rendimiento en inglés en el Decision Index, pero el inglés no es un idioma soportado oficialmente.
- Capacidades especiales: no hay modo de pensamiento, visión ni audio.

## Casos de uso

- Clasificación temática de proposiciones legislativas: dado el texto de una proposición de la Cámara dos Deputados, devolver uno de 24 temas con una sola llamada. Es adecuado porque el modelo alcanza 61,0% de precisión balanceada en esa tarea, por encima del baseline TF-IDF + regresión logística (59,7%) y de Saracura v0.1 (59,2%), y permite enrutar el texto a la comisión o flujo correspondiente sin coste de generación.
- Verificación de afirmaciones en redacciones y fact-checking: clasificar una afirmación en 3 clases de veracidad con FACTCK.BR. La precisión reportada es 48,3%, superior al baseline (43,2%) pero cercana al azar, por lo que solo es recomendable como señal auxiliar dentro de un pipeline con revisión humana.
- Atribución de respuestas sobre documentación: decidir si un fragmento responde a una pregunta (93,8% de precisión balanceada en FaQuAD) para filtrar pasajes antes de un sistema RAG, reduciendo el contexto que se envía a un modelo generativo.
- Selección de la respuesta correcta en asistentes de FAQ: en el FAQ del Banco Central, escoger entre 4 fragmentos el que responde a una consulta de 373 preguntas, donde el modelo alcanzó 96,8% frente al 71,0% de un baseline de solapamiento de palabras y el 61,1% de Saracura v0.1.
- Clasificación de jurisprudencia y triaje de expedientes: asignar uno de 10 ámbitos de jurisprudencia del TCU (76,0% de precisión balanceada) para enrutar documentos a revisores especializados.
- Moderación de contenido en plataformas en portugués: detectar comentarios ofensivos (67,9%) e identificar el objetivo de la ofensa (69,7%) sobre OLID-BR, como primera capa de filtrado que marca contenido para revisión humana.
- Indexación temática de producción científica: clasificar resúmenes de SciELO en 8 grandes áreas con 95,1% de precisión balanceada, tarea adecuada para enriquecer metadatos de repositorios a escala.
- Clasificación de anuncios de marketplace: segmentar anuncios de autopartes en 12 bloques (87,2% en datos internos) para normalizar catálogos o detectar anuncios mal categorizados.
- Triaje documental interno: clasificar documentos por tipo, área y estado (uso previsto en el conjunto de datos interno de Felhen) para enrutar correo y documentación entrante.

## Benchmarks y rendimiento

Precisión balanceada (media del acierto por clase) en el benchmark PT-BR v1 (`felhen-ai/ptbr-typed-decisions-bench`), split de test, con el orden de las opciones mezclado por ítem:

| Tarea | Opciones | TF-IDF + regresion logistica | Saracura PT-BR v0.1 (322M) | Saracura PT-BR 4B |
|---|---:|---:|---:|---:|
| Tema de proposición de la Cámara | 24 | 59,7% | 59,2% | 61,0% |
| Veracidad de alegación (FACTCK.BR) | 3 | 43,2% | 44,8% | 48,3% |
| El fragmento responde a la pregunta (FaQuAD) | sí/no | 56,5% | 89,9% | 93,8% |
| Área de jurisprudencia del TCU | 10 | 74,5% | 68,8% | 76,0% |
| Objetivo de la ofensa (OLID-BR) | 3 | 59,9% | 63,5% | 69,7% |
| Comentario ofensivo (OLID-BR) | sí/no | 60,5% | 61,9% | 67,9% |
| Gran área de resumen científico (SciELO) | 8 | 93,5% | 91,2% | 95,1% |
| Media | | 64,0% | 68,5% | 73,1% |

Resultados adicionales reportados por el autor:

| Evaluacion | Referencia | Saracura PT-BR v0.1 | Saracura PT-BR 4B |
|---|---|---|---|
| FAQ del Banco Central (elegir el inicio correcto entre 4 fragmentos, 373 preguntas) | baseline de solapamiento de palabras 71,0% | 61,1% | 96,8% |
| Anuncios de marketplace (12 segmentos, datos internos) | no disponible | 86,8% | 87,2% |

Comparaciones publicadas:

| Modelo | Resultado | Nota |
|---|---|---|
| `caiovicentino1/Eikos-4B` (MIT, modelo de decisión abierto entrenado en inglés y portugués) | 60,7% de media en el benchmark PT-BR v1 | Evaluado con el código de inferencia del propio autor (`research/eval_eikos.py`); no vio estas fuentes en entrenamiento, mientras que los dos Saracura sí vieron el split de entrenamiento |
| Laya multilingüe | 39,2% | Comparación considerada justa por el autor (sin ajuste sobre las fuentes) |
| `Qwen/Qwen3.8-27B` | ~66% | Versión anterior del benchmark |
| Saracura PT-BR 4B en el Decision Index 0.2.1 (inglés, 38 benchmarks) | 37,91 | Frente a 34,64 de `jaredpalmer/kev-4b`; ejecución completa con el kit oficial (150.759 peticiones), autoavaluada y pendiente de revisión por los mantenedores |
| `jaredpalmer/kev-4b` | no medido en el benchmark PT-BR v1 | Checkpoint de partida del ajuste |

## Requisitos de hardware

- VRAM estimada para inferencia: bf16 requiere aproximadamente 8-9 GB para los pesos del modelo base de 4B más el adaptador; en cuantización de 8 bits bajaría a unos 4-5 GB y en 4 bits a unos 2,5-3 GB (estimaciones a partir del tamaño del modelo; el autor solo reporta ejecución en bf16). El repositorio publicado ocupa 0,2 GB, pero corresponde únicamente al adaptador: hay que descargar aparte `Qwen/Qwen3.5-4B-Base`.
- GPU recomendadas: el autor usó una RTX 5090 tanto para entrenamiento (14.000 pasos, ~21 horas) como para medir latencia. No se publican recomendaciones de GPU para producción.
- Cabe en GPU de consumo: sí, con holgura en bf16 en tarjetas de 24 GB o más (por ejemplo RTX 4090 o RTX 5090), y de forma ajustada en tarjetas de 12-16 GB si se aplica cuantización. A diferencia de Saracura PT-BR v0.1 (322M), este modelo requiere GPU.
- Opciones de despliegue: servidor de Kev (`git clone https://github.com/jaredpalmer/kev`, `uv sync --extra serve`, `uv run --extra serve python -m kev.serve --run felhen-ai/saracura-ptbr-4b --port 8009`), con API compatible con System One en `/v1/systemone`. No hay información sobre soporte en vLLM, llama.cpp, Ollama o TGI; al tratarse de un adaptador con cabeza de puntero y no de un modelo generativo, esos runners no aplican directamente.
- Latencia y throughput: 100-170 ms por decisión en llamadas individuales sobre una RTX 5090 en bf16, con textos largos y sin kernels optimizados. El servidor de Kev cachea el prefijo del estado para varias preguntas sobre el mismo texto, lo que reduce el coste por pregunta adicional. No se publican cifras de throughput agregado.
- Contexto de ejecución: el modelo se entrenó y evaluó con estados de hasta 2.048 tokens. La herramienta `kev.benchmark` usa 384 tokens por defecto y rechaza ítems mayores; para reproducir los resultados hay que evaluar con `training_context(2048)` (script `kev_bench_long.py`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en PT-BR v1 (media) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| felhen-ai/saracura-ptbr-4b | ~4B + LoRA (rango 16) y cabeza de 256 dim. | 2.048 tokens de estado | 73,1% | Apache 2.0 | Adaptador en HuggingFace (0,2 GB), requiere el modelo base |
| felhen-ai/saracura-ptbr-v0 | 322M (receta de Laya) | no disponible | 68,5% | no disponible en la información proporcionada | HuggingFace |
| caiovicentino1/Eikos-4B | 4B | no disponible | 60,7% | MIT | HuggingFace |
| jaredpalmer/kev-4b | 4B | no disponible | no evaluado en PT-BR v1; 34,64 en el Decision Index 0.2.1 | no disponible en la información proporcionada | HuggingFace (checkpoint de partida) |

Nota metodológica del propio autor: la comparación con Eikos-4B no es homogénea, porque los dos Saracura vieron en entrenamiento el split de las fuentes evaluadas y Eikos no; la comparación considerada justa es contra modelos sin ajuste (Laya multilingüe, 39,2%; `Qwen/Qwen3.8-27B`, ~66% en la versión anterior del benchmark).

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, no mantiene conversaciones, no soporta tool calling ni razonamiento multi-paso en el sentido habitual. Solo devuelve decisiones `choice`, `noul` o `score`.
- Sesgo de evaluación por contaminación: las fuentes del benchmark PT-BR v1 (OLID-BR, FACTCK.BR, FaQuAD-NLI, SciELO, JurisTCU, Cámara dos Deputados) forman parte del conjunto de entrenamiento, por lo que los resultados de la tabla principal deben leerse como rendimiento sobre datos vistos. El propio autor señala que la comparación con Eikos-4B no es justa por este motivo.
- Riesgo de sobreajuste al benchmark: la única evidencia de transferencia a tareas no vistas es la prueba del FAQ del Banco Central (96,8%) y los anuncios de marketplace (87,2%, datos internos no reproducibles). No hay resultados publicados en otros dominios.
- Rendimiento bajo en algunas tareas: la veracidad de afirmaciones (FACTCK.BR) queda en 48,3% con 3 clases y la detección de comentarios ofensivos en 67,9%. Para moderación automatizada o verificación de hechos sin revisión humana el margen de error es alto.
- Métrica de precisión balanceada: los números no reflejan necesariamente el comportamiento sobre distribuciones reales desbalanceadas.
- Idioma: solo el portugués está declarado. El autor reporta que el ajuste no degradó el inglés en el Decision Index, pero esto no convierte al modelo en multilingüe soportado.
- Límite de contexto: estados de hasta 2.048 tokens; `kev.benchmark` usa 384 por defecto y rechaza ítems mayores, lo que puede producir inconsistencias si no se ajusta la configuración.
- Proceso de anotación dependiente de terceros: las preguntas y respuestas de entrenamiento se generaron con `Qwen/Qwen3.8-27B` y `Qwen/Qwen3.5-397B-A17B`, y las etiquetas de los anuncios de marketplace también proceden de `Qwen/Qwen3.8-27B`; se heredan los sesgos y errores de esos modelos.
- Reproducibilidad incompleta: parte de los datos de entrenamiento son internos de Felhen y no se redistribuyen, por lo que no es posible replicar exactamente el ajuste.
- Cifra del Decision Index pendiente de validación: el 37,91 es una autoevaluación enviada a los mantenedores (PR 75) y solo entra en la tabla pública tras su revisión.
- Adopción nula verificable: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.
- La información disponible de la model card está truncada en la sección de fuentes de datos (se corta en la descripción de los textos sintéticos de ocho casos de uso), por lo que la composición completa del conjunto de entrenamiento no puede detallarse.
- Restricciones de licencia: tanto el adaptador como el modelo base se publican bajo Apache 2.0, lo que permite uso comercial; conviene verificar igualmente las licencias de los conjuntos de datos derivados (CC BY 4.0 / MIT) si se redistribuyen datos o derivados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/felhen-ai/saracura-ptbr-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Checkpoint de partida: https://huggingface.co/jaredpalmer/kev-4b
- Receta y servidor Kev: https://github.com/jaredpalmer/kev
- Modelo hermano de 322M: https://huggingface.co/felhen-ai/saracura-ptbr-v0
- Benchmark PT-BR v1: https://huggingface.co/datasets/felhen-ai/ptbr-typed-decisions-bench
- Dataset de decisiones tipadas pt-es: https://huggingface.co/datasets/telepatia-ai/typed-decisions-pt-es
- Modelo comparable Eikos-4B: https://huggingface.co/caiovicentino1/Eikos-4B
- Decision Index 0.2.1: https://huggingface.co/spaces/multimodalart/jev-decision-index
- Resultados del Decision Index enviados: https://huggingface.co/datasets/felhen-ai/decision-index-results
- Pull request de la submisión al Decision Index: https://github.com/apolinario/decision-index/pull/75
- Búsqueda web: no se encontraron enlaces relevantes al modelo. Los resultados devueltos corresponden a páginas del portal de desarrolladores de Discord (https://discord.com/developers/home, https://discord.com/developers/applications, https://docs.discord.com/developers/intro y páginas de soporte), sin relación con Saracura PT-BR 4B.
