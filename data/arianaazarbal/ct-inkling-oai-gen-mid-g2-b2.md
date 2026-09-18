# arianaazarbal/ct-inkling-oai-gen-mid-g2-b2

## Resumen

`ct-inkling-oai-gen-mid-g2-b2` es un adaptador LoRA (PEFT) entrenado sobre el modelo base `thinkingmachines/Inkling-Small`, publicado por el usuario `arianaazarbal` el 18 de septiembre de 2026. No es un modelo autónomo, sino un artefacto de investigación: el resultado de la segunda generación (g2) de la rama b2 de un programa de entrenamiento por constitución iterada y autoescrita (`welfare-in-ai-rnd / constitutional_training`). El adaptador se sirve y se evalúa con el renderizador `tml_v0`, con el razonamiento desactivado y esfuerzo 0.0.

El interés técnico del artefacto no reside en sus capacidades de generación, sino en su metodología. En cada generación se entrena desde cero sobre el modelo base un corpus sintético de documentos que instancian una única constitución; la generación 0 se siembra con un resumen de 5.000 tokens del OpenAI Model Spec y la generación N≥1 se siembra con una constitución escrita por el propio modelo de la generación N-1 de la misma rama. De este modo, la deriva entre generaciones se acumula únicamente a través de los documentos, nunca a través de los pesos.

Se trata, por tanto, de un modelo pensado para reproducibilidad, análisis de deriva constitucional y experimentación en alineación, no para despliegue en producción. En el momento de redactar esta ficha el repositorio acumula 0 descargas y 0 likes, y no se ha publicado información sobre licencia, idiomas ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible para el modelo base; el artefacto es un adaptador LoRA (PEFT) sobre un transformer causal de generacion de texto |
| Parametros totales | No disponible (el modelo base `thinkingmachines/Inkling-Small` no esta documentado en la informacion disponible) |
| Parametros activos | No aplica (no se ha documentado que el modelo base sea MoE) |
| Longitud de contexto | No disponible; la longitud maxima de secuencia usada en el entrenamiento del adaptador fue de 8192 tokens |
| Tipos de cuantizacion | No disponible; la carga documentada por el autor es en `bfloat16` |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | `safetensors` (adaptador LoRA en formato PEFT) |
| Rango LoRA | 64 |
| Modulos objetivo | `all-linear` |
| Libreria | `peft` |
| Modelo base | `thinkingmachines/Inkling-Small` |
| Tamano del repositorio | 16,9 GB (segun HuggingFace; no se detalla su composicion) |
| Renderizador de servicio | `tml_v0`, razonamiento desactivado, esfuerzo 0.0 |
| Fecha de entrenamiento | 2026-09-17 |
| Fecha de exportacion | 2026-09-18 |

## Arquitectura y entrenamiento

El adaptador se aplica mediante LoRA con rango 64 y `target_modules=all-linear` sobre el modelo base `thinkingmachines/Inkling-Small`. La receta declarada esta bloqueada: learning rate 1e-4, scheduler coseno con un 5 % de warmup, una unica epoca, batch de 128, longitud maxima de 8192 tokens y semilla de entrenamiento 42. El regimen se describe como "midtrain only", es decir, una etapa 1 de SFT con LoRA sobre el corpus sintetico de documentos que instancian la constitucion correspondiente a esa generacion.

La innovacion metodologica es el bucle de constituciones iteradas. La generacion 0 se siembra con un resumen de 5.000 tokens del OpenAI Model Spec (etiqueta `seed:openai`). Para generar la constitucion de la generacion siguiente, el modelo entrenado produce un pool autoescrito de 40 cadenas y se selecciona el medoide de embeddings con control (gated embedding medoid) como semilla de la generacion N+1. Cada generacion se entrena de nuevo desde el modelo base, de forma que el peso del adaptador nunca se hereda entre generaciones: la unica via de transmision es el texto de la constitucion. Este diseno permite estudiar por separado la deriva en el comportamiento y la fidelidad a la constitucion de origen. El repositorio incluye el fichero `training_seed_constitution.md` con la constitucion concreta usada en esta generacion, ademas de `tinker_meta.json` con el registro de exportacion desde Tinker.

## Capacidades

- Generacion de texto autoregresiva, al ser un adaptador de generacion de texto (`pipeline_tag: text-generation`) sobre un transformer causal.
- Ejecucion de comportamiento condicionado por constitucion: el adaptador se ha entrenado para instanciar una constitucion concreta, por lo que su comportamiento esperado es seguir las normas recogidas en `training_seed_constitution.md`.
- Escritura de constituciones: la metodologia del programa asume que el modelo entrenado puede producir un documento constitucional completo que sirva de semilla para la generacion siguiente.
- No se ha documentado soporte de tool calling ni de function calling.
- No se ha documentado soporte de agentes ni de razonamiento multi-paso; de hecho, la configuracion de servicio indicada desactiva el modo de razonamiento (effort 0.0).
- No se han documentado capacidades multilingues, de vision, de audio ni un modo de pensamiento explicito.
- Razonamiento y matematicas: no disponible en la informacion proporcionada.

## Casos de uso

- Estudio de deriva constitucional entre generaciones: comparar las respuestas de este adaptador (g2, rama b2) con las de las generaciones g0 y g1 de la misma rama permite medir experimentalmente cuanto se desvia el comportamiento al sustituir la constitucion humana por una autoescrita.
- Reproducibilidad de experimentos de alineacion: con la receta bloqueada (r=64, lr 1e-4, 1 epoca, batch 128, max length 8192, semilla 42) y la constitucion incluida en el repositorio, un laboratorio puede reentrenar el adaptador y verificar la estabilidad del procedimiento.
- Analisis de fidelidad a instrucciones normativas: dado que el corpus de entrenamiento instancia reglas explicitas, el adaptador sirve para evaluar hasta que punto un modelo pequeno sigue reglas declaradas en lugar de heuristicas implicitas.
- Red-teaming de constituciones: someter el adaptador a peticiones adversariales y observar que clausulas de la constitucion se violan primero, lo que informa sobre que principios son mas fragiles cuando se escriben automaticamente.
- Generacion de corpus sinteticos para etapas posteriores: el propio artefacto participa en el bucle produciendo el pool autoescrito de 40 cadenas del que se extrae la semilla de la generacion siguiente.
- Comparacion entre replicas independientes: la etiqueta `branch:b2` indica que existen otras replicas de la misma generacion; el adaptador permite cuantificar la varianza entre ramas que parten de la misma constitucion.
- Ablacion de la constitucion de origen: intercambiar el documento semilla y reentrenar con la misma receta aislada el efecto del texto constitucional sobre el comportamiento final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tabla de evaluacion alguna, y la busqueda web realizada no devolvio ningun resultado relacionado con el modelo ni con `thinkingmachines/Inkling-Small`.

## Requisitos de hardware

- VRAM para inferencia: no disponible. Depende por completo del modelo base `thinkingmachines/Inkling-Small`, cuyo numero de parametros no se especifica en la informacion proporcionada.
- El adaptador se carga sobre el modelo base en `bfloat16` mediante `device_map="auto"`, por lo que el requisito dominante es el del modelo base en precision de 16 bits, no el del adaptador.
- GPU recomendadas: no disponible, al desconocerse el tamano del modelo base. Como referencia general, un adaptador de este tipo se puede servir en GPUs con soporte de PEFT, pero no es posible dar un modelo concreto sin conocer los parametros de Inkling-Small.
- Encaje en GPU de consumo: no se puede confirmar. Si el modelo base es de rango 7-8B de parametros, cabria en GPUs de consumo con 16-24 GB de VRAM en cuantizacion de 8 o 4 bits; si es mayor, no. Este extremo no esta documentado.
- Almacenamiento: el repositorio ocupa 16,9 GB segun HuggingFace, cifra notablemente alta para un adaptador LoRA de rango 64. No se detalla que componentes la componen, por lo que conviene verificar el contenido antes de planificar el despliegue.
- Opciones de despliegue: `transformers` + `peft` (procedimiento documentado por el autor), vLLM con soporte de adaptadores LoRA, TGI o llama.cpp previa conversion del adaptador a GGUF. El autor indica servir y evaluar con el renderizador `tml_v0`, con razonamiento desactivado y esfuerzo 0.0.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables. El unico punto de referencia documentado es el propio modelo base sin el adaptador.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ct-inkling-oai-gen-mid-g2-b2` | No disponible (adaptador LoRA r=64 sobre Inkling-Small) | No disponible (entrenado a 8192 tokens) | No publicado | No disponible | HuggingFace, 0 descargas |
| `thinkingmachines/Inkling-Small` (base) | No disponible | No disponible | No publicado | No disponible | HuggingFace (referenciado como base) |
| Otras alternativas | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Artefacto de investigacion: se trata de un adaptador LoRA experimental de un programa de investigacion, con 0 descargas y 0 likes, no de un modelo validado para produccion.
- Licencia no especificada: al no declararse licencia, no hay autorizacion explicita de uso comercial ni garantias de ningun tipo. Conviene contactar con el autor y revisar la licencia del modelo base antes de cualquier uso.
- Dependencia total del modelo base: el adaptador no funciona por si solo y su comportamiento final depende de `thinkingmachines/Inkling-Small`, cuyas caracteristicas y limitaciones no se detallan en la informacion disponible.
- Riesgo de alucinacion: no cuantificado. No se han publicado evaluaciones de veracidad, por lo que el riesgo es desconocido.
- Idiomas: no se documenta ningun listado de idiomas soportados; no se puede asumir un rendimiento correcto en castellano ni en ningun otro idioma concreto.
- Alineacion condicionada por un documento: el modelo se ha entrenado para instanciar una constitucion concreta generada automaticamente. Su comportamiento puede no coincidir con las expectativas de un usuario que no conozca el contenido de `training_seed_constitution.md`.
- Deriva acumulada por diseno: la metodologia transmite la constitucion solo a traves de texto, de modo que los errores o sesgos presentes en la constitucion autoescrita se propagan a las generaciones posteriores sin correccion humana.
- Configuracion de servicio restrictiva: el autor indica evaluar con razonamiento desactivado y esfuerzo 0.0; usarlo con otras configuraciones queda fuera del regimen documentado y sus resultados no estan validados.
- Sesgos conocidos: no documentados, pero al proceder la semilla inicial de un resumen del OpenAI Model Spec, es esperable heredar los sesgos de dicho documento; no se ha publicado ninguna evaluacion al respecto.
- Sin garantia de mantenimiento: el repositorio se creo y actualizo el mismo dia y no se ha publicado informacion posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arianaazarbal/ct-inkling-oai-gen-mid-g2-b2
- Modelo base en HuggingFace: https://huggingface.co/thinkingmachines/Inkling-Small
- Pagina del autor en HuggingFace: https://huggingface.co/arianaazarbal
- Ruta original de Tinker (no es una URL navegable): `tinker://cf7ced30-78df-5c21-9699-724179232829:train:0/sampler_weights/inkoaig2_inkoai_g2_b2_s1_final`
- Ficheros incluidos en el repositorio: `training_seed_constitution.md` y `tinker_meta.json`
- La busqueda web realizada no devolvio ningun enlace relevante (papers, blogs, repos o demos) sobre este modelo ni sobre su modelo base.
