# arianaazarbal/ct-qwen36-35b-anth-gen-postcot-g2-b3

## Resumen

ct-qwen36-35b-anth-gen-postcot-g2-b3 es un adaptador LoRA publicado por el usuario arianaazarbal dentro de un programa de entrenamiento denominado "iterated self-written-constitution training" (constitutional_training, welfare-in-ai-rnd). No es un modelo completo: es un adaptador PEFT de rango 64 con `target_modules=all-linear` que se monta sobre el modelo base Qwen/Qwen3.6-35B-A3B. Su interes no esta en las capacidades brutas de generacion de texto, sino en el metodo de alineacion que documenta: cada generacion del programa se entrena desde cero sobre el modelo base usando un corpus sintetico que instancia una constitucion concreta, de modo que la deriva entre generaciones se acumula unicamente a traves de los documentos y nunca a traves de los pesos.

Este artefacto concreto corresponde a la generacion 2 (`g2`), rama independiente `b3`, del linaje `qwen36-35b-anth-gen-postcot`. La constitucion semilla de la generacion 0 es un resumen de 5.000 tokens de la constitucion de Anthropic; a partir de ahi, cada generacion escribe su propia constitucion, que se selecciona como medoide de embedding de un pool autogenerado de 40 cadenas. El entrenamiento combina una fase de midtrain y una segunda fase de post-train (SFT de chat condicionado por constitucion, conservando las trazas de razonamiento), y esta pensado para servirse con el renderer `qwen3_5` y el razonamiento activado.

La relevancia actual es fundamentalmente de investigacion: se trata de un punto de datos reproducible (receta bloqueada, semilla 42) para estudiar alineacion iterativa, deriva de comportamiento entre generaciones y evaluacion de constituciones escritas por modelos. El repositorio ocupa 4,5 GB, no tiene descargas ni likes registrados en el momento de la consulta, y la model card no especifica licencia ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la model card. Se trata de un adaptador LoRA (PEFT) sobre el modelo base Qwen/Qwen3.6-35B-A3B; la arquitectura de dicho base no se detalla en la informacion proporcionada |
| Parametros totales | No disponible para el modelo base. El adaptador LoRA (r=64, `all-linear`) se distribuye en un repositorio de 4,5 GB |
| Parametros activos | No disponible |
| Longitud de contexto | 8192 tokens de `max_length` durante el entrenamiento (segun la receta). Contexto nativo del modelo base: no disponible |
| Tipos de cuantizacion | No disponible. El adaptador se exporta en safetensors; no se documentan variantes cuantizadas |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la ficha de HuggingFace no especifica licencia) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA; `library_name: peft`) |

Otros metadatos relevantes: generacion `g2`, rama `b3`, linaje `qwen36-35b-anth-gen-postcot`, semilla de la generacion 0 = constitucion de Anthropic (resumen de 5k), regimen de entrenamiento `midtrain + stage-2 post-train`, renderer de servicio `qwen3_5` con razonamiento activado. Nombre interno de la ejecucion: `qwen36_anthg2_qwen36_anth_g2_b3_s2_cot`. Fecha de entrenamiento declarada: 2026-09-17; exportacion desde Tinker: 2026-09-18.

## Arquitectura y entrenamiento

El objeto publicado es un adaptador LoRA con rango 64 aplicado sobre todas las capas lineales (`target_modules=all-linear`) del modelo base Qwen/Qwen3.6-35B-A3B. La receta esta declarada como bloqueada: learning rate 1e-4, scheduler coseno con 5 % de warmup, 1 epoca, batch de 128, longitud maxima de 8192 tokens y semilla de entrenamiento 42. La primera fase consiste en un midtrain sobre un corpus documental sintetico que instancia una unica constitucion (la semilla de esa generacion). La segunda fase (post-train) continua desde el adaptador de la etapa 1 sobre datos de chat condicionados por constitucion, generados con Opus, conservando las trazas de chain-of-thought. La model card indica que esta generacion se sirve y evalua con el renderer `qwen3_5` y el razonamiento activado.

La innovacion metodologica es el esquema iterado: la generacion 0 se siembra con una constitucion humana (resumen de 5.000 tokens de la constitucion de Anthropic); en generaciones N>=1, la constitucion semilla es escrita por el modelo de la generacion N-1 de la misma rama, seleccionada como medoide de embedding con puerta sobre un pool autogenerado de 40 cadenas. Como cada generacion se entrena desde cero sobre el modelo base, la deriva entre generaciones solo puede propagarse a traves del texto de las constituciones y de los corpus derivados, nunca mediante la herencia de pesos. La constitucion empleada en esta generacion se incluye en el repositorio como `training_seed_constitution.md`. No se especifican el numero total de tokens de entrenamiento ni la composicion detallada del dataset mas alla de lo indicado.

## Capacidades

- Generacion de texto conversacional: pipeline declarado `text-generation`, orientado a chat.
- Razonamiento explicito: la etapa 2 conserva las trazas de chain-of-thought y el artefacto se evalua con el razonamiento activado (`reasoning ON`).
- Comportamiento condicionado por constitucion: las respuestas se generan bajo el marco normativo de la constitucion semilla de la generacion 2, incluida en el repositorio.
- Ajuste de comportamiento mediante adaptador: al ser un LoRA, permite comparar el modelo base con y sin el adaptador manteniendo constantes los pesos subyacentes.
- Capacidades heredadas del modelo base: no documentadas en la informacion proporcionada (no se detalla si el base soporta vision, audio u otras modalidades).
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente; las trazas de razonamiento conservadas son un indicio, pero la model card no lo afirma.
- Capacidades multilingues: no disponibles; no se declara ninguna lista de idiomas.
- Modo "thinking" dedicado, vision o audio: no documentado.

## Casos de uso

- Investigacion en alineacion iterativa: el adaptador permite reproducir y auditar la generacion 2, rama b3, de un programa de constituciones autoe-scritas, comparando su comportamiento con el de otras ramas y generaciones bajo la misma receta bloqueada (semilla 42, r=64, lr 1e-4).
- Analisis de deriva de constituciones: al incluirse `training_seed_constitution.md`, es posible contrastar el texto normativo de la generacion 2 con el de generaciones anteriores y medir que principios se refuerzan, se diluyen o se reescriben.
- Evaluacion comparativa base vs. adaptador: cargando el mismo Qwen/Qwen3.6-35B-A3B con y sin el LoRA, se pueden aislar los efectos del post-train condicionado por constitucion sin confundirlos con cambios en los pesos base.
- Generacion de datos sinteticos de alineacion: sirve como generador de trazas de razonamiento y respuestas condicionadas por una constitucion, utiles para construir corpus de SFT o de evaluacion para otras iteraciones del programa.
- Red-teaming y estudios de seguridad: el modelo es un candidato adecuado para probar si un marco constitucional concreto reduce comportamientos indeseados, y para buscar casos limite en los que la constitucion entre en conflicto con la peticion del usuario.
- Reproducibilidad de pipeline: el registro de exportacion (`tinker_meta.json`) y la ruta original en Tinker permiten reconstruir la trazabilidad del artefacto en entornos de investigacion que necesiten auditar el origen de los pesos.
- Asistente de dominio con normativa explicita: en escenarios donde se exige que un asistente opere bajo un conjunto de reglas declaradas y versionadas (por ejemplo, un piloto interno de cumplimiento normativo), el adaptador ofrece un punto de partida que hace explicito el texto que gobierna su comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de evaluaciones de alineacion, seguridad o utilidad para esta generacion ni para las anteriores. Tampoco se aportan comparaciones cuantitativas con el modelo base.

## Requisitos de hardware

Las cifras siguientes son estimaciones orientativas derivadas del peso del repositorio y de la nomenclatura del modelo base; la model card no publica requisitos de hardware ni mediciones de latencia, por lo que deben tratarse como no verificadas.

- El adaptador en si es ligero en comparacion con el modelo base: el repositorio completo ocupa 4,5 GB, cantidad que incluye pesos del adaptador, metadatos de exportacion y la constitucion semilla.
- La VRAM real la determina el modelo base Qwen/Qwen3.6-35B-A3B, no el adaptador. Para un modelo de esa clase, una carga en bfloat16 requeriria del orden de 70 GB de VRAM, una carga en 8 bits del orden de 35 GB y una carga en 4 bits del orden de 18-20 GB. Estos rangos son estimaciones generales y no proceden de la informacion proporcionada.
- GPU recomendadas: para precision completa en bfloat16, GPU de 80 GB (A100, H100) o reparto multi-GPU; para cuantizacion de 8 bits, A100 40 GB o H100; para 4 bits, una RTX 4090 de 24 GB podria ser suficiente en el mejor de los casos, siempre que el modelo base tenga un numero de parametros totales compatible con esa huella, dato que no se ha podido confirmar.
- Despliegue: el codigo de carga documentado usa `transformers` (AutoModelForCausalLM, AutoTokenizer) junto con `peft.PeftModel`, con `torch_dtype="bfloat16"` y `device_map="auto"`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI. Dado que el adaptador debe fusionarse o montarse sobre el base, conviene verificar la compatibilidad con el motor de inferencia elegido antes de desplegarlo.
- El artefacto esta pensado para servirse con el renderer `qwen3_5` y el razonamiento activado, lo que implica plantillas de prompt especificas y un coste adicional de tokens generados por las trazas de razonamiento.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados de rendimiento ni referencias a adaptadores comparables (otras ramas del mismo linaje, generaciones anteriores o adaptadores de alineacion alternativos), por lo que no es posible establecer una comparacion cuantitativa fiable.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ct-qwen36-35b-anth-gen-postcot-g2-b3 | Adaptador LoRA r=64 sobre base de clase 35B (total del base: no disponible) | 8192 tokens en entrenamiento (base: no disponible) | Sin benchmarks publicados | No disponible | Publicado en HuggingFace, 0 descargas |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No es un modelo autonomo: requiere descargar y cargar el modelo base Qwen/Qwen3.6-35B-A3B, ademas del adaptador, lo que duplica los requisitos de almacenamiento y complica el despliegue.
- Licencia no especificada: al no declararse licencia en la ficha de HuggingFace, no hay garantia explicita de uso comercial. Cualquier uso en produccion requiere aclarar antes los terminos, tanto de este adaptador como los del modelo base.
- Ausencia total de evaluacion publicada: no hay benchmarks, ni evaluaciones de seguridad, ni comparaciones con el modelo base. No hay evidencia cuantitativa de mejora o degradacion respecto a Qwen/Qwen3.6-35B-A3B.
- Riesgo de alucinacion: no se documenta ningun mecanismo de mitigacion especifico (verificacion factual, citas, abstención) mas alla del condicionamiento por constitucion, que regula el estilo y los principios declarados, no la veracidad.
- Sesgos: no se documenta ningun analisis de sesgos. La constitucion semilla de la generacion 0 es un resumen de 5.000 tokens de la constitucion de Anthropic, de modo que parte del marco normativo hereda el sesgo de seleccion y de resumen de ese texto; las generaciones posteriores anaden la deriva introducida por constituciones escritas por el propio modelo.
- Deriva entre generaciones: el diseno asume que la deriva se transmite solo por los documentos. Esto implica que cambios sutiles en la constitucion de una generacion pueden amplificarse en las siguientes sin que exista pesos heredados que actuen como ancla.
- Cobertura idiomatica desconocida: al no declararse idiomas, no se puede asumir un rendimiento correcto fuera del idioma o idiomas dominantes en los corpus sinteticos.
- Contexto limitado a 8192 tokens durante el entrenamiento: no se documenta extension posterior de contexto ni tecnicas de atencion lineal que lo amplien.
- Madurez del artefacto: 0 descargas y 0 likes, entrenado y exportado en septiembre de 2026; es un artefacto de investigacion, no un modelo con validacion en produccion.
- Dependencia de Tinker: el artefacto se exporto desde Tinker y el registro original vive en una ruta de ese entorno; reproducir el entrenamiento fuera de ese ecosistema puede no ser directo.
- Fase de post-train generada con Opus: los datos de chat condicionados por constitucion fueron generados por ese modelo, lo que introduce las caracteristicas y posibles sesgos del generador en la fase 2.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arianaazarbal/ct-qwen36-35b-anth-gen-postcot-g2-b3
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Constitucion semilla de esta generacion: `training_seed_constitution.md` (incluida en el repositorio)
- Registro de exportacion: `tinker_meta.json` (incluido en el repositorio)
- Ruta original en Tinker: `tinker://0ce9df34-cf1f-5153-9ab1-39c9004b19c6:train:0/sampler_weights/qwen36_anthg2_qwen36_anth_g2_b3_s2_cot_final`
- Papers, blogs, repositorios o demos adicionales: no disponibles. La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los resultados obtenidos correspondian a tiendas de mobiliario y material de oficina, sin relacion con el artefacto.
