# arianaazarbal/ct-inkling-anth-gen-mid-g1-b2

## Resumen

`ct-inkling-anth-gen-mid-g1-b2` es un adaptador LoRA (rango 64, `target_modules=all-linear`) entrenado sobre el modelo base `thinkingmachines/Inkling-Small`. No es un modelo completo: es el resultado de la etapa 1 (midtrain) del programa de entrenamiento por constitución iterada (iterated self-written-constitution training), dentro del linaje `inkling-anth-gen-mid`. El adaptador se publica como un artefacto de investigación para estudiar cómo la deriva de valores se acumula a través de documentos sintéticos y no a través de los pesos.

La receta está bloqueada: LoRA r=64, learning rate 1e-4, scheduler coseno con 5 % de warmup, 1 época, batch 128, longitud máxima 8192 y semilla de entrenamiento 42. El adaptador se entrena siempre desde cero sobre el modelo base, con un corpus sintético que instancia una única constitución: la generación 0 usa una constitución escrita por humanos (resumen de 5 000 tokens de la constitución de Anthropic) y las generaciones N≥1 usan una constitución escrita por el modelo de la generación N-1 de la misma rama.

Su relevancia es metodológica más que de rendimiento: permite comparar réplicas independientes (ramas) y generaciones sucesivas manteniendo constante el resto del pipeline, y sirve como semilla para la generación siguiente. Se sirve y evalúa con el renderer `tml_v0`, con razonamiento desactivado y `effort 0.0`. No se han publicado métricas de benchmarks ni información sobre licencia o idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer causal del modelo base `thinkingmachines/Inkling-Small`; arquitectura del base no disponible |
| Parametros totales | no disponible (adaptador LoRA r=64 con `all-linear`; el repositorio ocupa 16,9 GB, probablemente por peso en precision alta y/o pesos de sampler exportados desde Tinker) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible para el modelo base; la longitud maxima de entrenamiento del adaptador es 8192 tokens |
| Tipos de cuantizacion | no disponible de forma explicita; al ser un adaptador se puede fusionar con el base y cuantizar despues (el repo declara safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | `thinkingmachines/Inkling-Small` |
| Rango LoRA | 64, `target_modules=all-linear` |
| Linaje / generacion / rama | `inkling-anth-gen-mid` / g1 / b2 |
| Regimen de entrenamiento | midtrain unicamente (etapa 1: LoRA SFT sobre corpus sintetico de documentos que instancian la constitucion) |
| Semilla gen-0 | Constitucion de Anthropic (resumen de 5k tokens) |
| Elicitacion de semilla | metodo `gen`: el modelo entrenado escribe una constitucion nueva |
| Renderer de servicio | `tml_v0`, razonamiento OFF, effort 0.0 |
| Nombre interno de ejecucion | `inkanthg1_inkanth_g1_b2_s1` |
| Fecha de entrenamiento | 2026-08-10 |
| Exportacion | 2026-09-18 (desde Tinker; metadatos en `tinker_meta.json`) |
| Repositorio HuggingFace | 16,9 GB, 0 descargas, 0 likes |

## Arquitectura y entrenamiento

El objeto publicado es un adaptador LoRA de rango 64 aplicado sobre todas las capas lineales (`all-linear`) del modelo base `thinkingmachines/Inkling-Small`, un transformer causal de generacion de texto cuya arquitectura concreta, numero de parametros y contexto nativo no se detallan en la informacion disponible. La innovacion del programa no esta en la arquitectura, que es deliberadamente fija, sino en el bucle de entrenamiento: cada generacion parte de cero desde el modelo base y solo cambia el corpus de documentos sinteticos que instancian una constitucion. La deriva entre generaciones, por tanto, se transmite exclusivamente a traves de los documentos y nunca mediante los pesos, lo que permite atribuir los cambios de comportamiento al contenido constitucional.

La receta esta bloqueada y es identica en todas las generaciones: LoRA r=64, learning rate 1e-4, scheduler coseno con 5 % de warmup, 1 epoca, batch 128, longitud maxima 8192, semilla 42. La constitucion usada en esta generacion se incluye en el repositorio como `training_seed_constitution.md`. Para la generacion 1, la constitucion semilla se obtuvo elicitandola del modelo de la generacion 0 de la misma rama, tomando el medoido de embeddings (gated) de un pool de 40 cadenas escritas por el propio modelo. No se documenta en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del corpus, ni si hubo etapas posteriores de RLHF o DPO (el regimen declarado es solo midtrain, etapa 1).

## Capacidades

- Generacion de texto condicionada por constitucion: el adaptador modula el estilo y las prioridades de respuesta del modelo base segun el documento constitucional con el que fue entrenado.
- Instanciacion de documentos constitucionales: el modelo ha sido entrenado sobre un corpus sintetico de documentos que aplican una constitucion, por lo que reproduce ese formato y ese registro.
- Escritura de constituciones derivadas: por diseno del programa, un modelo de este linaje se usa para elicitar la constitucion de la generacion siguiente (metodo `gen`).
- Servicio con renderer `tml_v0` y razonamiento desactivado (`effort 0.0`): el modo de inferencia previsto es generacion directa, sin cadena de pensamiento.
- Capacidades heredadas del modelo base (tool calling, agentes, multilingue, codigo, matematicas, vision): no disponibles en la informacion proporcionada; no se documentan para este adaptador.
- No se declaran capacidades especiales adicionales (audio, vision, thinking mode) distintas de las del modelo base.

## Casos de uso

- Investigacion sobre alineacion constitucional: comparar esta rama (b2) con otras ramas y generaciones del mismo linaje permite aislar el efecto del texto constitucional sobre el comportamiento, manteniendo fija la receta de entrenamiento.
- Estudio de deriva de valores entre generaciones: al entrenar siempre desde el base y propagar solo documentos, se puede medir cuanto cambia el comportamiento de g1 respecto a g0 sin contaminacion por pesos acumulados.
- Generacion de la semilla de la siguiente generacion: este adaptador es el candidato natural para elicitar la constitucion que alimentara la generacion g2 de la misma rama, cerrando el bucle iterado.
- Analisis de reproducibilidad: la rama b2 es una replicacion independiente de la misma generacion, util para cuantificar varianza entre ejecuciones con semilla y receta identicas.
- Auditoria de contenido sintetico: inspeccionar `training_seed_constitution.md` junto con las salidas del adaptador permite verificar si el corpus sintetico introduce sesgos o clausulas problematicas.
- Experimentos controlados de SFT ligero: al ser un adaptador de rango 64 sobre un base congelado, sirve como banco de pruebas de bajo coste para estudiar tasas de aprendizaje, schedulers y longitudes de contexto en tareas de constitucion.
- Docencia y formacion tecnica: ilustra de forma reproducible un pipeline completo de PEFT con exportacion desde Tinker, fusion de adaptadores y evaluacion con renderer fijo.
- Base para etapas posteriores: el adaptador puede fusionarse con `Inkling-Small` y usarse como punto de partida de etapas de midtrain o post-entrenamiento posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas (MMLU, HumanEval, GSM8K ni ninguna otra), y los resultados de la busqueda web no contienen informacion relacionada con el modelo.

## Requisitos de hardware

- VRAM de inferencia: no disponible como cifra concreta, porque el adaptador no se ejecuta solo. La VRAM la determina el modelo base `thinkingmachines/Inkling-Small`, cuyo tamano no se documenta en la informacion proporcionada.
- El repositorio del adaptador ocupa 16,9 GB, un tamano inusualmente alto para un LoRA de rango 64; conviene verificar si incluye pesos en precision alta y/o pesos de sampler heredados de la exportacion desde Tinker antes de planificar el despliegue.
- GPU recomendadas: no disponibles. La eleccion depende del base; en cualquier caso, un adaptador LoRA fusionado se sirve igual que el modelo completo correspondiente.
- Encaje en GPU de consumo: no se puede determinar sin conocer el tamano del base. Con un base de menos de 8 000 millones de parametros en cuantizacion de 4 bits seria viable en GPU de consumo de gama alta; con bases mayores, no.
- Opciones de despliegue: al tratarse de un artefacto PEFT, la ruta documentada es `peft.PeftModel.from_pretrained` junto con `transformers.AutoModelForCausalLM` cargando el base en `bfloat16` con `device_map="auto"`. El adaptador puede convertirse a otros formatos tras fusionarlo con el base (por ejemplo, cuantizacion para llama.cpp, vLLM, TGI u Ollama), pero esto no esta documentado en la model card.
- Latencia y throughput: no disponibles.
- Rendimiento esperado: al ser una etapa de SFT sobre un corpus sintetico y no un ajuste orientado a tareas, no hay indicios de mejora en tareas estandar; el interes es de investigacion.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| `ct-inkling-anth-gen-mid-g1-b2` | Adaptador LoRA r=64 sobre `Inkling-Small` | no disponible | 8192 tokens en entrenamiento | no disponible | HuggingFace (0 descargas) | Rama b2 de la generacion g1 del linaje `inkling-anth-gen-mid` |
| Otras ramas y generaciones del mismo linaje (`ct-inkling-anth-gen-mid-g*`) | Adaptadores LoRA equivalentes | no disponible | 8192 tokens en entrenamiento | no disponible | no disponible en la informacion proporcionada | Misma receta, distinta semilla constitucional o distinta rama |
| `thinkingmachines/Inkling-Small` | Modelo base completo | no disponible | no disponible | no disponible | HuggingFace | Base sobre el que se aplica este adaptador |
| Adaptadores de alineacion por constitucion de otros autores | LoRA / SFT | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no hay autorizacion clara de uso comercial; debe tratarse como artefacto de investigacion hasta que el autor la especifique.
- No es un modelo autonomo: requiere descargar y cargar `thinkingmachines/Inkling-Small`; su comportamiento depende por completo de ese base.
- Sin evaluacion publicada: 0 descargas y 0 likes en el momento de la consulta, y ninguna metrica de benchmarks, por lo que no hay evidencia empirica de calidad o seguridad.
- Corpus enteramente sintetico: el adaptador se entrena sobre documentos generados que instancian una constitucion; esto puede amplificar sesgos del base y producir sobrerrepresentacion de clausulas concretas.
- Riesgo de alucinacion: al ser una etapa de SFT sobre documentos constitucionales, existe riesgo de que el modelo invente atribuciones o cite la constitucion de forma incorrecta. No hay evaluaciones de factualidad.
- Sensibilidad al renderer: la model card especifica servir y evaluar con `tml_v0`, razonamiento OFF y `effort 0.0`; usar otro formato de prompt o activar el razonamiento puede degradar o alterar el comportamiento observado.
- Deriva entre generaciones: por diseno, el contenido constitucional cambia en cada generacion; el comportamiento de g1 no es extrapolable a gN sin evaluacion propia.
- Idiomas: no se declaran idiomas soportados, por lo que no hay garantia de cobertura multilingue mas alla de la del base.
- Longitud de contexto: el entrenamiento se limita a 8192 tokens; no se documenta el contexto nativo del base ni si el adaptador mantiene su comportamiento mas alla de esa longitud.
- Trazabilidad: los pesos originales residen en una ruta de Tinker (`tinker://...`) y los metadatos de exportacion estan en `tinker_meta.json`; conviene conservar ambos para reproducibilidad.
- La busqueda web realizada no devolvio ningun resultado relacionado con el modelo (todos los enlaces apuntaban a un grupo de practicas medicas alemanas), por lo que no hay fuentes externas de validacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arianaazarbal/ct-inkling-anth-gen-mid-g1-b2
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-Small
- Constitucion de entrenamiento: `training_seed_constitution.md` (incluida en el repositorio del modelo)
- Metadatos de exportacion: `tinker_meta.json` (incluido en el repositorio del modelo)
- Ruta original en Tinker: `tinker://a5fa78b3-ef5b-5368-ad70-dedc2834d2ab:train:0/sampler_weights/inkanthg1_inkanth_g1_b2_s1_final`
- Resultados de la busqueda web: sin enlaces relevantes; todas las coincidencias correspondian a un proveedor de servicios medicos ajeno al modelo.
