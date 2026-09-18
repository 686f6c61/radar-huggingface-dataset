# arianaazarbal/ct-inkling-oai-gen-mid-g0-b2

## Resumen

ct-inkling-oai-gen-mid-g0-b2 es un adaptador LoRA de rango 64 publicado por el usuario arianaazarbal sobre el modelo base thinkingmachines/Inkling-Small. No es un modelo entrenado desde cero ni un ajuste convencional: forma parte de un programa de entrenamiento constitucional iterado (welfare-in-ai-rnd / constitutional_training) en el que cada generación se entrena desde cero sobre un corpus sintético que instancia una única constitución. En este caso, la generación 0 (g0) toma como semilla el resumen de 5.000 palabras de la Model Spec de OpenAI, y la rama b2 es una réplica independiente del mismo linaje.

El interés del artefacto es metodológico. El pipeline separa la deriva entre generaciones del peso del modelo: las generaciones posteriores a la 0 se siembran con una constitución escrita por el propio modelo de la generación anterior, pero cada una se reentrena desde el base, de modo que cualquier cambio de comportamiento acumulado procede exclusivamente de los documentos y no de una cadena de pesos. Esto lo convierte en material útil para estudiar adherencia a normas, deriva conductual y estabilidad de recetas de ajuste, más que en un modelo de propósito general listo para producción.

Se trata de un adaptador de investigación con 0 descargas y 0 likes en el momento de redactar la ficha, sin licencia declarada y sin idiomas documentados. La model card incluye la receta exacta (LoRA r=64, lr 1e-4, coseno con 5% de warmup, 1 epoch, batch 128, max length 8192, semilla 42), el renderer de servicio (tml_v0) y la configuración de inferencia prevista (reasoning OFF, effort 0.0).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre el transformer de thinkingmachines/Inkling-Small; rango 64, `target_modules=all-linear` |
| Parametros totales | no disponible (el repositorio ocupa 16,9 GB; no se desglosa el numero de parametros del adaptador ni del modelo base) |
| Parametros activos | no aplica (no se documenta una arquitectura MoE) |
| Longitud de contexto | no disponible para el modelo base; la longitud maxima de secuencia empleada en el entrenamiento del adaptador fue de 8192 tokens |
| Tipos de cuantizacion | no disponible; los pesos del adaptador se distribuyen en safetensors y el ejemplo oficial carga el modelo base en bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA), acompanado de `tinker_meta.json` |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 64 aplicado sobre todas las capas lineales (`all-linear`) del transformer thinkingmachines/Inkling-Small. La receta esta bloqueada y documentada: learning rate 1e-4, scheduler coseno con 5% de warmup, 1 epoch, batch de 128, longitud maxima de 8192 tokens y semilla de entrenamiento 42. El regimen es exclusivamente "midtrain" (stage-1 LoRA SFT) sobre un corpus sintetico de documentos que instancian una constitucion concreta; no se documenta una segunda fase de RLHF, DPO u otro ajuste por preferencias.

La innovacion del programa no reside en la arquitectura, sino en el procedimiento de generacion de datos. La generacion 0 se siembra con una constitucion escrita por humanos (el resumen de 5k de la Model Spec de OpenAI, etiquetado como `seed:openai`). A partir de la generacion 1, la semilla se obtiene elicitando una constitucion nueva al modelo de la generacion anterior y seleccionando el medoide de embedding con filtro (gated embedding medoid) de un pool de 40 cadenas autoescritas. Como cada generacion se reentrena siempre desde el modelo base, la unica via de transmision entre generaciones es el corpus documental. El identificador de run interno es `inkoaig0_inkoai_g0_b2_s1`, corresponde al linaje `inkling-oai-gen-mid`, generacion g0, rama b2, y fue entrenado el 2026-08-10 y exportado desde Tinker el 2026-09-18. La constitucion usada se incluye en el repositorio como `training_seed_constitution.md`.

## Capacidades

- Generacion de texto: el pipeline declarado es `text-generation`, heredado del modelo base mediante el adaptador LoRA.
- Seguimiento de una constitucion concreta: el adaptador ha sido ajustado sobre un corpus que instancia la constitucion semilla (resumen de la Model Spec de OpenAI), por lo que su comportamiento esperado es el de reproducir ese marco normativo.
- Comportamiento reproducible bajo una configuracion de servicio fija: la model card especifica renderer `tml_v0`, reasoning OFF y effort 0.0.
- Reutilizacion del modelo base: al ser un adaptador PEFT, conserva las capacidades del modelo subyacente en la medida en que el ajuste no las desplace.
- Tool calling / function calling: no documentado.
- Capacidades de agente y razonamiento multi-paso: no documentadas; ademas la configuracion recomendada es con reasoning desactivado.
- Capacidades multilingues: no disponibles.
- Vision, audio u otras modalidades: no documentadas.

## Casos de uso

- Investigacion sobre entrenamiento constitucional iterado: el adaptador es la generacion 0 de un linaje disenado para estudiar como evoluciona el comportamiento de un modelo cuando la constitucion se reescribe a si misma generacion tras generacion; se usaria como punto de partida y linea base del linaje `inkling-oai-gen-mid`.
- Estudios de deriva conductual entre generaciones: al reentrenarse cada generacion desde el base, este adaptador permite aislar la contribucion del corpus documental frente a la de los pesos, comparando g0 con las generaciones posteriores de la misma rama b2.
- Evaluacion de adherencia a normas: servir el adaptador bajo el renderer `tml_v0` con reasoning OFF y effort 0.0 y someterlo a baterias de prompts para medir en que grado sigue la constitucion semilla.
- Comparacion de constituciones de origen humano frente a autoescritas: la semilla de g0 es un documento humano, mientras que las generaciones N>=1 usan constituciones escritas por modelos; este checkpoint sirve como referencia humana del experimento.
- Reproducibilidad de recetas de ajuste: la receta bloqueada (r=64, lr 1e-4, coseno con 5% warmup, 1 epoch, batch 128, max 8192, seed 42) permite replicar el entrenamiento y verificar la estabilidad del procedimiento entre réplicas independientes (ramas b0, b1, b2, etc.).
- Auditoria de artefactos de investigacion: util para analisis de gobernanza de modelos, por ejemplo examinar que se publica (constitucion incluida, metadatos de exportacion en `tinker_meta.json`) y que no (licencia, idiomas, evaluaciones).
- Docencia y formacion tecnica: ejemplo practico de como se construye y se sirve un adaptador LoRA con PEFT sobre un modelo base, incluyendo el flujo de exportacion desde Tinker y la carga con `PeftModel.from_pretrained`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmark en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de evaluaciones de alineamiento o adherencia constitucional, y no se dispone de numeros de comparacion con otros checkpoints del mismo linaje.

## Requisitos de hardware

- VRAM para inferencia: no disponible. El repositorio del adaptador ocupa 16,9 GB y el ejemplo oficial carga el modelo base en bfloat16, por lo que la huella total depende del tamano del base thinkingmachines/Inkling-Small, dato no documentado en la informacion disponible.
- GPU recomendadas: no disponibles por la misma razon; la eleccion depende del tamano del modelo base.
- Viabilidad en GPU de consumo: no confirmada. Con 16,9 GB solo de adaptador, el despliegue completo probablemente excede la VRAM de GPU de consumo habituales, pero no se puede afirmar sin conocer el tamano del base.
- Opciones de despliegue: la via documentada es PEFT junto con transformers, cargando primero `thinkingmachines/Inkling-Small` con `AutoModelForCausalLM` y despues el adaptador con `PeftModel.from_pretrained`. El artefacto se entreno y exporto desde Tinker, segun el campo "original Tinker path". No hay confirmacion oficial de compatibilidad con vLLM, llama.cpp, Ollama o TGI para este adaptador concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de fichas tecnicas de otros adaptadores del mismo programa o de modelos comparables, por lo que la comparacion cuantitativa no es posible. La unica referencia documentada es el propio modelo base.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ct-inkling-oai-gen-mid-g0-b2 | no disponible (repo de 16,9 GB) | no disponible (max 8192 en entrenamiento) | no disponible | Publico en HuggingFace, 0 descargas | Adaptador LoRA de investigacion sobre entrenamiento constitucional |
| thinkingmachines/Inkling-Small (modelo base) | no disponible | no disponible | no disponible | Referenciado como base, sin datos en esta informacion | Modelo subyacente sin ajustar |
| Otras generaciones y ramas del linaje `inkling-oai-gen-mid` | no disponible | no disponible | no disponible | Existen segun la nomenclatura de ramas, sin datos publicados | No se dispone de sus fichas ni resultados |

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial; conviene tratar el artefacto como no apto para produccion hasta aclarar este punto.
- Ausencia de evaluaciones: no hay benchmarks, evaluaciones de seguridad ni medidas de sesgo publicadas, lo que impide estimar su comportamiento en dominios sensibles.
- Modelo de investigacion, no de proposito general: es un adaptador de generacion 0 dentro de un programa experimental; su objetivo es medir adherencia constitucional y deriva, no competir en tareas generales.
- Riesgo de alucinacion: no cuantificado, pero al ser un ajuste SFT sobre un corpus sintetico de documentos constitucionales, la fidelidad factual fuera de ese dominio no esta garantizada.
- Idiomas: completamente indocumentados; no se puede asumir soporte multilingue ni siquiera el idioma predominante del corpus de entrenamiento.
- Restricciones de contexto: la ventana real del modelo base no esta publicada; los 8192 tokens documentados corresponden al limite de secuencia durante el entrenamiento, no necesariamente a la capacidad de inferencia.
- Herramientas y agentes: sin soporte documentado de tool calling ni de razonamiento multi-paso; ademas la configuracion recomendada desactiva el modo de razonamiento (effort 0.0).
- Reproduccion del servicio: los resultados dependen de usar el renderer `tml_v0` con reasoning desactivado; otras configuraciones pueden alterar el comportamiento de forma no caracterizada.
- Trazabilidad parcial: se conserva `tinker_meta.json` y la constitucion semilla, pero la ruta original apunta a un identificador de Tinker que puede no ser accesible publicamente.
- Fechas de entrenamiento y exportacion posteriores a la fecha de consulta habitual de la informacion (2026), dato que conviene verificar en el repositorio.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/arianaazarbal/ct-inkling-oai-gen-mid-g0-b2
- Modelo base en HuggingFace: https://huggingface.co/thinkingmachines/Inkling-Small
- Constitucion semilla incluida en el repositorio: `training_seed_constitution.md`
- Registro de exportacion desde Tinker: `tinker_meta.json`
- Ruta original en Tinker (referencia, no URL): `tinker://6b99be7a-0e8e-5ee7-a27d-bd200d46ec69:train:0/sampler_weights/inkoaig0_inkoai_g0_b2_s1_final`
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la busqueda web realizada.
