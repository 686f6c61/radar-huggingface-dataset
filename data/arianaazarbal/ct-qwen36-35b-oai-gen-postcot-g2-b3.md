# arianaazarbal/ct-qwen36-35b-oai-gen-postcot-g2-b3

## Resumen

Este repositorio contiene un adaptador LoRA de rango 64 (con `target_modules=all-linear`) entrenado sobre el modelo base Qwen/Qwen3.6-35B-A3B. Lo publica el usuario arianaazarbal dentro de un programa de investigación denominado *iterated self-written-constitution training* (welfare-in-ai-rnd / constitutional_training). No es un modelo completo: es un adaptador PEFT que debe cargarse junto con su modelo base para poder utilizarse.

El adaptador corresponde a la generación 2 (`g2`) de la rama `b3` de la cadena `qwen36-35b-oai-gen-postcot`. La semilla de la generación 0 es un resumen de 5 000 tokens del OpenAI Model Spec; a partir de ahí, cada generación se entrena desde cero sobre un corpus sintético que instancia una constitución escrita por el modelo de la generación anterior de la misma rama. El régimen de entrenamiento combina una fase de *midtrain* y una segunda fase de *post-train* (SFT de chat condicionado por constitución, conservando las trazas de razonamiento).

Su relevancia es principalmente de investigación: permite reproducir y auditar un experimento de alineación iterada en el que la deriva entre generaciones se acumula únicamente a través de los documentos de entrenamiento y nunca a través de los pesos. El repositorio incluye la constitución concreta usada en esta generación (`training_seed_constitution.md`) y el registro de exportación (`tinker_meta.json`). No tiene descargas ni valoraciones, y no se han publicado resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre el modelo base Qwen/Qwen3.6-35B-A3B; arquitectura del modelo base no detallada en la informacion disponible (la denominacion "A3B" del modelo base es compatible con una arquitectura de mezcla de expertos, pero no se confirma en los datos aportados) |
| Parametros totales | No disponible para el adaptador (LoRA de rango 64 sobre todas las capas lineales); el modelo base se denomina 35B, sin desglose confirmado |
| Parametros activos | No disponible (no se confirma que el modelo base sea MoE ni su numero de parametros activos) |
| Longitud de contexto | No disponible para el modelo base; el entrenamiento se realizo con longitud maxima de 8192 tokens |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors sin cuantizar; no se publican variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el repositorio incluye ademas `training_seed_constitution.md` y `tinker_meta.json` |

## Arquitectura y entrenamiento

El adaptador se entrena con una receta declarada como bloqueada: LoRA de rango 64, `target_modules=all-linear`, tasa de aprendizaje 1e-4, scheduler coseno con 5 % de *warmup*, 1 epoca, tamano de lote 128, longitud maxima 8192 tokens y semilla de entrenamiento 42. La fase 2 (*post-train*) continua desde el adaptador de la fase 1 sobre datos de chat generados por Opus, condicionados por la constitucion y con trazas de cadena de pensamiento incluidas. El adaptador se exporto desde Tinker el 18 de septiembre de 2026 y se entreno el 17 de septiembre de 2026.

La innovacion metodologica es el bucle de constituciones iteradas. Cada generacion se entrena **desde cero sobre el modelo base**, no por continuacion de pesos: lo que se hereda es el corpus de documentos sinteticos que instancia una constitucion. La constitucion de la generacion N (para N mayor o igual que 1) la escribe el modelo de la generacion N-1 de la misma rama, seleccionada mediante el medoide de *embedding* con filtro (*gated embedding medoid*) de un conjunto de 40 cadenas autoescritas. De este modo, la deriva entre generaciones solo puede acumularse a traves de los documentos, nunca a traves de los pesos. Para servirlo o evaluarlo, el autor indica el *renderer* `qwen3_5` con el razonamiento activado (`reasoning ON`).

## Capacidades

- Generacion de texto: es la tarea declarada en el `pipeline_tag` del repositorio (`text-generation`).
- Chat condicionado por constitucion: la fase 2 entrena SFT de conversacion con la constitucion como condicionante.
- Razonamiento explicito con trazas de cadena de pensamiento conservadas durante el entrenamiento; el autor recomienda servir el modelo con el razonamiento activado.
- Escritura de constituciones: por el diseno del programa, se espera que el modelo pueda redactar una constitucion nueva que sirva de semilla a la generacion siguiente (es el mecanismo que produce la generacion 3).
- Soporte de *tool calling* / *function calling*: no disponible (no se menciona en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se menciona explicitamente).
- Capacidades multilingues: no disponible (no se declara ningun conjunto de idiomas).
- Capacidades especiales: alineacion mediante constitucion autoescrita e iterada; el repositorio distribuye la constitucion exacta usada en esta generacion.

## Casos de uso

- Investigacion en alineacion constitucional: comparar el comportamiento de la generacion 2 de la rama b3 frente a otras ramas y generaciones de la misma cadena, cargando cada adaptador sobre el mismo modelo base para aislar el efecto de la constitucion.
- Estudio de deriva entre generaciones: analizar como cambia el texto de las constituciones autoescritas a lo largo de las generaciones, dado que la deriva solo se transmite por documentos y no por pesos.
- Generacion de la semilla de la generacion 3: usar este adaptador para producir constituciones candidatas, aplicar el filtro de medoide de *embedding* descrito y construir el corpus de la siguiente generacion.
- Evaluacion de fidelidad a una constitucion: medir con que frecuencia las respuestas del modelo respetan las clausulas del documento `training_seed_constitution.md` incluido en el repositorio, en lugar de las de otros documentos de control.
- Experimentos de *red-teaming* de alineacion: comprobar si un corpus sintetico condicionado por constitucion produce comportamientos no deseados o deriva no intencionada respecto a la generacion 0 sembrada con el OpenAI Model Spec.
- Base para *fine-tuning* posterior: al ser un adaptador PEFT sobre un modelo grande, se puede continuar el ajuste o combinarlo con otros adaptadores LoRA sobre el mismo modelo base para tareas especificas.
- Reproducibilidad y auditoria de experimentos: el repositorio incluye la ruta original de Tinker, el registro de exportacion y la constitucion, lo que permite reconstruir el *pipeline* de entrenamiento paso a paso.
- Docencia y divulgacion tecnica: ilustrar de forma practica como se implementa un bucle de constituciones iteradas sobre un modelo abierto, con hiperparametros y regimen de entrenamiento concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio del adaptador ocupa 4,5 GB.
- El adaptador no es autonomo: requiere cargar el modelo base Qwen/Qwen3.6-35B-A3B, que segun el ejemplo de carga del autor se instancia en `bfloat16` con `device_map="auto"`.
- VRAM estimada: no confirmada por el autor. A modo de referencia, un modelo de 35 000 millones de parametros en `bfloat16` ronda los 70 GB de pesos, a lo que hay que sumar la memoria del adaptador, la cache KV y el *overhead* de activaciones; esta cifra es una estimacion derivada del recuento nominal de parametros y no un dato publicado.
- GPU recomendadas: no disponible en la informacion proporcionada. Por el orden de magnitud del modelo base, el despliegue en `bfloat16` completo requiere aceleradores de clase A100/H100 con memoria agregada suficiente; no se especifica ninguna configuracion validada.
- GPU de consumo: no cabe previsiblemente en una RTX 4090 (24 GB) en `bfloat16` sin cuantizacion y/o reparto de capas en CPU; no se publica ninguna variante cuantizada que lo facilite.
- Opciones de despliegue: el autor solo documenta la carga con `transformers` + `peft`. `vLLM` admite adaptadores LoRA de forma nativa, pero no hay confirmacion de compatibilidad con este adaptador concreto. Para `llama.cpp` u `Ollama` seria necesaria una conversion a GGUF que no se distribuye en el repositorio.
- Renderer de referencia indicado por el autor: `qwen3_5`, con razonamiento activado.
- Latencia y *throughput*: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ct-qwen36-35b-oai-gen-postcot-g2-b3 | Adaptador LoRA (r=64) sobre Qwen3.6-35B-A3B, generacion 2, rama b3 | No disponible para el adaptador | Entrenado a 8192 tokens; contexto del modelo base no disponible | Sin benchmarks publicados | No disponible | Publico en HuggingFace, 0 descargas, 0 valoraciones |
| Otras generaciones y ramas de la misma cadena (`qwen36-35b-oai-gen-postcot`) | Adaptadores LoRA sobre el mismo modelo base | No disponible | No disponible | Sin benchmarks publicados en la informacion disponible | No disponible | Referenciadas por la etiqueta de linaje; no se detallan en la informacion aportada |
| Qwen/Qwen3.6-35B-A3B (modelo base) | Modelo completo | Denominacion 35B (desglose no confirmado) | No disponible | No disponible | No disponible | Publico en HuggingFace |

No se dispone de datos de rendimiento ni de especificaciones del modelo base en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- No es un modelo autonomo: es un adaptador LoRA que exige cargar Qwen/Qwen3.6-35B-A3B y usar el *renderer* `qwen3_5` con razonamiento activado para reproducir el comportamiento previsto.
- Licencia no disponible: sin una licencia declarada no se puede asumir permiso para uso comercial ni para redistribucion; conviene contactar con el autor antes de cualquier uso en produccion.
- Sin evaluaciones publicadas: no hay benchmarks, evaluaciones de sesgo, pruebas de toxicidad ni mediciones de alucinacion. Cualquier afirmacion sobre su calidad seria especulativa.
- Riesgo de deriva de alineacion: el metodo se basa en constituciones autoescritas de forma iterada; el propio diseno del programa admite que el contenido normativo cambie entre generaciones, lo que es un objeto de estudio y a la vez un riesgo si se usa sin auditoria.
- Idiomas no declarados: se desconoce el soporte multilingue real y el comportamiento fuera del ingles.
- Contexto limitado en el entrenamiento: la longitud maxima de entrenamiento es de 8192 tokens; no se documenta la ventana de contexto efectiva del modelo base ni su comportamiento mas alla de esa longitud.
- Trazabilidad parcial del experimento: el repositorio incluye la constitucion y el registro de exportacion, pero no el corpus de entrenamiento completo, lo que dificulta auditar que documentos se usaron.
- Riesgo de reproducibilidad: la carga depende de `transformers` y `peft` y de un modelo base concreto; cambios en esas dependencias o la indisponibilidad del modelo base impedirian usar el adaptador.
- Adopcion nula: 0 descargas y 0 valoraciones en el momento de la consulta, sin senales externas de validacion por parte de la comunidad.
- Fechas de entrenamiento y publicacion en septiembre de 2026; conviene verificar la vigencia del modelo base y de las herramientas asociadas.

## Enlaces

- Ficha del modelo en HuggingFace: https://huggingface.co/arianaazarbal/ct-qwen36-35b-oai-gen-postcot-g2-b3
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Ruta original de Tinker registrada en la model card: `tinker://2c9bf57f-9993-5d45-8e74-1891f444028f:train:0/sampler_weights/qwen36_oaig2_qwen36_oai_g2_b3_s2_cot_final`
- No se han encontrado enlaces adicionales relevantes (papers, blogs, repos, demos) en la busqueda web realizada; los resultados obtenidos no guardan relacion con el modelo.
