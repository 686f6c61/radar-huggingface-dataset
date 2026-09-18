# arianaazarbal/ct-inkling-oai-gen-mid-g1-b2

## Resumen

`ct-inkling-oai-gen-mid-g1-b2` es un adaptador LoRA (rango 64, `target_modules=all-linear`) entrenado sobre el modelo base `thinkingmachines/Inkling-Small`. Lo publica el usuario de HuggingFace `arianaazarbal` como parte de un programa de entrenamiento por constitución iterada (`welfare-in-ai-rnd / constitutional_training`), en el que cada generación se entrena desde cero sobre el modelo base con un corpus sintético que instancia una constitución concreta.

El interés del artefacto es metodológico, no de producto: la generación 0 se siembra con una constitución escrita por humanos (en este caso, un resumen de 5.000 palabras del OpenAI Model Spec) y cada generación N≥1 se siembra con una constitución escrita por el propio modelo de la generación N-1 de la misma rama. La deriva entre generaciones se acumula únicamente a través de los documentos de entrenamiento, nunca a través de los pesos, porque cada generación parte del mismo `Inkling-Small` congelado.

Este repositorio concreto corresponde a la generación 1, rama independiente b2, con régimen de entrenamiento "midtrain only" (una sola etapa de SFT con LoRA). No es un modelo listo para producción: no declara licencia, idiomas ni benchmarks, y su model card especifica que debe servirse y evaluarse con el renderer `tml_v0`, con razonamiento desactivado y `effort 0.0`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA sobre el transformer de `thinkingmachines/Inkling-Small`; la arquitectura del base no se detalla en la informacion proporcionada) |
| Parametros totales | no disponible (adaptador LoRA de rango 64 con `all-linear`; el repositorio ocupa 16,9 GB) |
| Longitud de contexto | no disponible (la longitud maxima de entrenamiento declarada es de 8192 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (pesos de adaptador en formato PEFT/LoRA) |
| Modelo base | thinkingmachines/Inkling-Small |
| Libreria | peft |
| Pipeline | text-generation |
| Tamano del repositorio | 16,9 GB |
| Fecha de entrenamiento | 2026-09-17 |
| Fecha de exportacion | 2026-09-18 |
| Renderer recomendado | tml_v0, razonamiento OFF, effort 0.0 |
| Nombre interno de ejecucion | inkoaig1_inkoai_g1_b2_s1 |

## Arquitectura y entrenamiento

El objeto publicado no es un modelo completo, sino un adaptador PEFT de rango 64 aplicado sobre todas las capas lineales (`all-linear`) del modelo base `thinkingmachines/Inkling-Small`. La receta esta bloqueada y documentada: learning rate 1e-4, scheduler coseno con 5% de warmup, 1 epoca, batch de 128, longitud maxima de 8192 tokens y semilla de entrenamiento 42. El entrenamiento es exclusivamente de "midtrain" (etapa 1 de SFT con LoRA) sobre un corpus sintetico de documentos que instancian una constitucion; no se menciona RLHF, DPO ni ninguna etapa de preferencias.

La innovacion metodologica esta en el bucle de constituciones iteradas. La constitucion de esta generacion (g1) deriva de una elicitacion en la que el modelo de la generacion anterior escribe una constitucion nueva, seleccionada como medoide de embedding (con filtro de umbral) de un pool de 40 cadenas autogeneradas. La model card indica que el documento constitucional usado para entrenar esta generacion se incluye en el repositorio como `training_seed_constitution.md`. El entrenamiento se ejecuto en Tinker y se exporto despues; `tinker_meta.json` conserva el registro de exportacion, y la ruta original del sampler es `tinker://14c1cba8-bd8c-5eaa-95b3-ef07086d64a7:train:0/sampler_weights/inkoaig1_inkoai_g1_b2_s1_final`.

## Capacidades

- Generacion de texto condicionada por un documento normativo: el adaptador esta entrenado para instanciar el contenido de una constitucion sintetica concreta, no para seguir instrucciones genericas.
- Reproduccion de comportamiento inducido por corpus: al ser un adaptador de SFT sobre documentos, su comportamiento esperado es la imitacion estilistica y normativa de ese corpus.
- Elicitacion de constituciones: la rama completa del programa usa estos modelos para generar nuevas constituciones que alimentan la generacion siguiente.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; la model card recomienda explicitamente servir el modelo con razonamiento desactivado.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, modo "thinking"): no disponibles.

## Casos de uso

- Investigacion sobre constituciones iteradas: el adaptador permite estudiar como evoluciona el comportamiento de un modelo cuando la constitucion que lo define se reescribe generacion tras generacion, comparando g1-b2 con g0 y con las demas ramas de la misma cadena.
- Auditoria de deriva entre generaciones: al entrenar siempre desde el mismo base congelado, cualquier diferencia observable entre el modelo g0 y este g1 se puede atribuir al corpus de constitucion y no a los pesos heredados, lo que simplifica el analisis causal.
- Replicacion experimental: la semilla 42, el batch 128 y la receta fija permiten reproducir la ejecucion y compararla con otras ramas (b1, b3, etc.) bajo condiciones controladas.
- Estudio de adherencia a documentos normativos: util para medir hasta que punto un SFT corto con LoRA (1 epoca, r=64) es capaz de instalar un conjunto de reglas complejas en un modelo pequeno.
- Generacion de corpus sinteticos alineados con una politica: el modelo puede emplearse para producir documentos adicionales que instancian la constitucion, retroalimentando el pipeline de entrenamiento de la generacion siguiente.
- Evaluacion comparativa de tecnicas de alineacion: sirve como linea base "sin RLHF" frente a modelos alineados con preferencias humanas en la misma escala de parametros.
- Analisis de sesgos inducidos por semilla: la generacion 0 parte de un resumen del OpenAI Model Spec, por lo que el artefacto permite estudiar como un marco normativo corporativo se propaga y muta a lo largo de generaciones autogeneradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 16,9 GB, un tamano inusualmente alto para un adaptador LoRA de rango 64; es probable que incluya pesos adicionales, estados de optimizador o artefactos de exportacion de Tinker, pero la informacion disponible no lo desglosa.
- VRAM para inferencia: no disponible de forma directa, porque el numero de parametros del modelo base `Inkling-Small` no se especifica. Como referencia condicional (no confirmada por la informacion disponible), cargar un base de tipo "small" en bfloat16 mas el adaptador requeriria del orden de 2 GB de VRAM por cada 1000 millones de parametros, mas overhead de activaciones y cache KV.
- GPU recomendadas: no disponible. La eleccion depende del tamano real del base, que la ficha no documenta.
- Viabilidad en GPU de consumo: no confirmada. Con un base de 7-9B en bfloat16 y contexto moderado, una GPU de 24 GB (RTX 4090, RTX 3090) seria suficiente; con un base mayor seria necesario cuantizar o usar varias GPU. Esta estimacion es condicional y no esta respaldada por datos del autor.
- Opciones de despliegue: vLLM y TGI admiten adaptadores PEFT sobre un base cargado, que es el flujo que documenta la propia model card (`PeftModel.from_pretrained` con `transformers`). Para llama.cpp u Ollama habria que fusionar el adaptador con el base y convertir a GGUF, ya que esas herramientas no gestionan adaptadores PEFT directamente en el flujo estandar.
- Latencia y throughput: no disponibles.
- Nota de servido: la model card indica servir y evaluar con el renderer `tml_v0`, razonamiento desactivado y `effort 0.0`. Usar otro renderer o activar razonamiento invalida la comparabilidad de los resultados.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones del modelo base, por lo que no es posible comparar rendimiento con alternativas. La comparacion factible es interna a la propia familia de experimentos:

| Modelo | Base | Metodo | Generacion | Rama | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ct-inkling-oai-gen-mid-g1-b2 (este) | thinkingmachines/Inkling-Small | LoRA r=64, SFT, midtrain only | g1 | b2 | no disponible | HuggingFace, 0 descargas |
| thinkingmachines/Inkling-Small | no aplica | modelo base | no aplica | no aplica | no disponible | HuggingFace |
| Otras ramas de la cadena `inkling-oai-gen-mid` | thinkingmachines/Inkling-Small | misma receta, distinta rama | g1 | b1, b3, ... | no disponible | no verificado en la informacion disponible |

Comparativa con modelos de la misma categoria (adaptadores de alineacion o constitucionales): no disponible.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no se puede asumir permiso de uso comercial. Tratarlo como artefacto de investigacion.
- Ausencia total de benchmarks: no hay MMLU, HumanEval, GSM8K ni evaluaciones de seguridad publicadas, por lo que no se puede afirmar nada sobre su calidad relativa.
- Cero traccion: 0 descargas y 0 "likes" en el momento de la consulta, lo que implica ausencia de validacion independiente.
- Dependencia del renderer: el modelo se entrena y evalua con `tml_v0`, razonamiento desactivado y `effort 0.0`. Servirlo de otra forma degrada la fidelidad respecto a la receta original.
- Deriva de constitucion: al ser un artefacto de constituciones iteradas, el contenido normativo del corpus es sintetico y autogenerado; puede contener reglas incoherentes, contradictorias o degeneradas respecto a la semilla humana original.
- Sesgo de semilla: la generacion 0 parte de un resumen del OpenAI Model Spec, un marco normativo de origen corporativo, cuyos sesgos y prioridades se propagan por la cadena.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; en un modelo "Small" con SFT corto es esperable un comportamiento fragil fuera de la distribucion del corpus de entrenamiento.
- Idiomas soportados desconocidos: no hay garantia de cobertura multilingue ni de calidad fuera del ingles.
- Contexto de entrenamiento limitado a 8192 tokens: el comportamiento mas alla de esa longitud no esta validado.
- Repositorio de 16,9 GB sin desglose: conviene inspeccionar el contenido antes de descargarlo o de integrarlo en un pipeline automatizado.
- No es un modelo de proposito general: es un adaptador experimental de un programa de investigacion en alineacion; no deberia desplegarse en atencion al cliente, produccion de codigo ni aplicaciones de cara al usuario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arianaazarbal/ct-inkling-oai-gen-mid-g1-b2
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-Small
- Documento de constitucion de entrenamiento: `training_seed_constitution.md`, incluido en el repositorio del modelo
- Registro de exportacion: `tinker_meta.json`, incluido en el repositorio del modelo
- Repositorio del programa mencionado en la model card (`welfare-in-ai-rnd / constitutional_training`): sin URL disponible en la informacion proporcionada
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los unicos resultados obtenidos correspondian a un portal deportivo en arabe sin relacion con el artefacto.
