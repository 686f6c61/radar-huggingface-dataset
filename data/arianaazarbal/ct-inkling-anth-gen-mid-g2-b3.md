# arianaazarbal/ct-inkling-anth-gen-mid-g2-b3

## Resumen

`ct-inkling-anth-gen-mid-b3` es un adaptador LoRA publicado por el usuario `arianaazarbal` sobre el modelo base `thinkingmachines/Inkling-Small`. No es un modelo completo: se distribuye como pesos de adaptador en formato PEFT (rank 64, `target_modules=all-linear`) y requiere cargar el modelo base por separado para poder ejecutarse. El repositorio incluye además el fichero `training_seed_constitution.md` con la constitución empleada en el entrenamiento y un `tinker_meta.json` con el registro de exportación.

El adaptador pertenece a un programa de investigación de **entrenamiento constitucional iterado** (`constitutional-training`, dentro de `welfare-in-ai-rnd`). El procedimiento consiste en entrenar cada generación desde cero sobre el modelo base con un corpus sintético de documentos que instancian una única constitución. La generación 0 se siembra con una constitución escrita por humanos (en este caso, un resumen de 5.000 palabras de la constitución de Anthropic) y cada generación posterior se siembra con una constitución escrita por el propio modelo de la generación anterior de la misma rama, seleccionada como medoide de embedding de un conjunto de 40 cadenas autogeneradas. Este artefacto corresponde a la generación 2, rama independiente b3, de la cadena `inkling-anth-gen-mid`.

Es relevante ahora como material de investigación reproducible sobre deriva de valores entre generaciones, no como modelo de producción: no declara licencia, no declara idiomas soportados y no publica resultados de evaluación. Sus etiquetas indican que debe servirse con el renderer `tml_v0`, con razonamiento desactivado y `effort 0.0`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (`r=64`, `target_modules=all-linear`) sobre `thinkingmachines/Inkling-Small`. Arquitectura del modelo base: no disponible |
| Parametros totales | No disponible. El adaptador no publica recuento de parametros; el modelo base se denomina "Small" pero no se documenta su tamano |
| Parametros activos | No aplica (no se describe una arquitectura MoE en la informacion disponible) |
| Longitud de contexto | 8192 tokens es la longitud maxima usada en entrenamiento (`max length 8192`). El contexto nativo del modelo base: no disponible |
| Tipos de cuantizacion | No disponible. Al ser un adaptador PEFT, la cuantizacion se aplica al modelo base, no al adaptador |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); libreria declarada `peft` |
| Tamano del repositorio | 16,9 GB (dato de HuggingFace; no se detalla su desglose entre adaptador, constitucion y metadatos) |
| Modelo base | `thinkingmachines/Inkling-Small` |
| Linaje | `inkling-anth-gen-mid`, generacion g2, rama b3 |
| Configuracion de servicio | Renderer `tml_v0`, reasoning OFF, effort 0.0 |
| Fecha de entrenamiento | 2026-09-17 (exportado de Tinker el 2026-09-18) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base `Inkling-Small`, por lo que no es posible confirmar si se trata de un transformer denso, un MoE o una arquitectura hibrida. Lo que si se especifica es que el artefacto publicado es un adaptador LoRA de rango 64 aplicado sobre todas las capas lineales (`all-linear`), cargable mediante `peft.PeftModel` sobre el modelo base en `bfloat16`.

La receta de entrenamiento esta bloqueada y es explicita: LoRA `r=64`, learning rate `1e-4`, scheduler coseno con 5 % de warmup, 1 epoca, batch 128, longitud maxima 8192 y semilla de entrenamiento 42. El regimen es **unicamente midtrain** (SFT de etapa 1 con LoRA sobre el corpus sintetico de documentos que instancian la constitucion), sin una fase posterior de RLHF o DPO documentada. La innovacion metodologica no esta en la arquitectura sino en el bucle de datos: cada generacion se entrena desde cero sobre el modelo base, de modo que la deriva entre generaciones se acumula exclusivamente a traves de los documentos (la constitucion semilla), nunca a traves de los pesos. La constitucion de esta generacion se eligio como medoide de embedding de un pool de 40 constituciones autogeneradas por la generacion anterior de la misma rama, con el procedimiento de elicitacion indicado en la model card.

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base `Inkling-Small` y modulada por el corpus constitucional de la generacion 2.
- Instanciacion de una constitucion concreta: el adaptador esta entrenado para producir documentos que materializan los principios de `training_seed_constitution.md`.
- Escritura de constituciones: por diseno del programa, los modelos de cada generacion se utilizan para elicitar la constitucion semilla de la generacion siguiente.
- Condicionamiento con renderer especifico (`tml_v0`) con razonamiento desactivado y `effort 0.0`, segun las instrucciones del autor.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; la configuracion recomendada desactiva explicitamente el razonamiento.
- Capacidades multilingues: no disponibles (no se declara lista de idiomas).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- **Reproduccion de cadenas de entrenamiento constitucional**: el adaptador permite repetir la generacion g2 de la rama b3 y comparar el resultado con otras ramas (b1, b2, ...) para medir varianza entre replicas independientes bajo una receta fija.
- **Estudio de deriva de valores entre generaciones**: comparar las salidas de este adaptador (g2) con las de la generacion g1 y g0 de la misma cadena permite aislar cuanto de la deriva proviene del corpus constitucional y no de los pesos, ya que cada generacion se reentrena desde el modelo base.
- **Auditoria de trazabilidad de linaje**: el repositorio incluye la constitucion semilla y el registro de exportacion de Tinker, lo que permite reconstruir la procedencia exacta del artefacto en un ejercicio de gobernanza de modelos.
- **Generacion de corpus sinteticos de alineacion**: el modelo puede emplearse para producir documentos que instancian principios normativos, utiles como datos de entrenamiento para experimentos posteriores de SFT o DPO.
- **Red-teaming y evaluacion de robustez**: al ser un adaptador de investigacion con contexto de 8192 tokens, resulta adecuado para probar como responde un modelo ajustado constitucionalmente ante prompts adversariales o contradictorios con su constitucion.
- **Punto de partida para ajuste adicional**: al ser un adaptador PEFT, se puede componer o continuar entrenando (por ejemplo, una etapa posterior de preferencias) sin necesidad de reentrenar el modelo base completo, con un coste de computo muy inferior al de un fine-tuning completo.
- **Investigacion en "welfare in AI" y elicitacion de constituciones**: el pipeline de seleccion por medoide sobre 40 cadenas autogeneradas es directamente reutilizable para estudiar como los modelos autoformulan principios y que sesgos introducen en ese proceso.
- **Docencia y divulgacion tecnica**: sirve como ejemplo minimo y documentado de un experimento de alineacion iterativa, con receta, semilla y artefactos publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y los resultados de la busqueda web no aportan datos tecnicos sobre este modelo ni sobre su modelo base.

## Requisitos de hardware

- **VRAM para inferencia**: no disponible de forma exacta, porque se desconoce el tamano de `thinkingmachines/Inkling-Small`. Como regla general para el modelo base en `bfloat16`, se necesitan aproximadamente 2 GB de VRAM por cada 1.000 millones de parametros, mas el *overhead* de cache KV (que con 8192 tokens de contexto puede anadir varios GB segun el numero de capas y cabezas). El adaptador LoRA en si anade un consumo marginal.
- **GPU recomendadas**: no disponibles para este modelo concreto. Para servir el modelo base fusionado en bf16 se suele requerir, segun su tamano, desde una RTX 4090 de 24 GB para modelos pequenos hasta A100 80 GB o H100 para modelos de mayor escala. Dato no confirmado para `Inkling-Small`.
- **Compatibilidad con GPU de consumo**: no confirmada. Depende enteramente del tamano del modelo base y del nivel de cuantizacion aplicado al mismo.
- **Opciones de despliegue**: la ruta documentada por el autor es `transformers` + `peft` (carga del modelo base y del adaptador por separado). vLLM admite adaptadores LoRA (`--enable-lora`) siempre que el modelo base sea compatible. TGI y Ollama son viables solo si se fusiona el adaptador en el modelo base y se convierte a los formatos soportados (por ejemplo GGUF para llama.cpp/Ollama). No se documenta compatibilidad verificada con ninguna de estas rutas.
- **Latencia y throughput**: no disponibles.
- **Caveat de tamano**: el repositorio ocupa 16,9 GB, un valor llamativamente alto para un adaptador LoRA de rango 64. No se detalla en la model card que componentes ocupan ese espacio, por lo que conviene inspeccionar los ficheros antes de planificar el almacenamiento y la descarga.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados. La comparacion solo puede plantearse de forma estructural:

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ct-inkling-anth-gen-mid-g2-b3` | Adaptador LoRA (r=64, all-linear) sobre Inkling-Small | No disponible | 8192 tokens en entrenamiento | No disponible | Publico en HuggingFace, 0 descargas |
| `thinkingmachines/Inkling-Small` | Modelo base completo | No disponible | No disponible | No disponible | Referenciado como base, datos no verificados en la informacion disponible |
| Otras ramas de la misma cadena (`b1`, `b2`, generaciones `g0`/`g1`) | Adaptadores LoRA del mismo programa | Equivalentes por receta (r=64) | 8192 tokens en entrenamiento | No disponible | No se ha confirmado su existencia ni su URL en la informacion proporcionada |
| Alternativas de la misma categoria (adaptadores de alineacion o modelos pequenos de proposito general) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se identifican modelos comparables con datos verificables en la informacion disponible.

## Limitaciones y advertencias

- **No es un modelo autonomo**: requiere descargar y cargar `thinkingmachines/Inkling-Small` por separado; sin el modelo base el adaptador no produce ninguna salida.
- **Licencia no declarada**: al no especificarse licencia ni en HuggingFace ni en la model card, **no hay autorizacion explicita de uso comercial**. Cualquier uso en produccion debe considerar este vacio legal y contactar con el autor.
- **Sin evaluacion publicada**: no hay benchmarks, evaluaciones de seguridad ni analisis de sesgos. Es un artefacto de investigacion, no un modelo validado.
- **Riesgo de alucinacion**: desconocido y no medido. Un adaptador entrenado sobre un corpus sintetico de documentos normativos puede generar afirmaciones plausibles sobre principios o politicas sin base factual.
- **Sesgos conocidos**: no documentados. El proceso de seleccion de la constitucion semilla mediante medoide de embedding puede favorecer formulaciones "centrales" y penalizar posturas minoritarias dentro del pool autogenerado, un sesgo de agregacion inherente al metodo.
- **Deriva de valores**: por diseno, la generacion 2 puede haberse alejado de la constitucion humana original; la model card no cuantifica esa distancia, pero el mecanismo de iteracion la hace esperable.
- **Restricciones de idioma**: no se declara lista de idiomas soportados. El comportamiento multilingue es desconocido y probablemente dependiente del modelo base.
- **Contexto limitado a efectos practicos**: aunque el entrenamiento usa 8192 tokens, se desconoce el contexto nativo del modelo base y su degradacion mas alla de esa longitud.
- **Configuracion de servicio obligatoria**: el autor indica servir con renderer `tml_v0`, razonamiento desactivado y `effort 0.0`. Usar otra configuracion puede dar resultados fuera de distribucion respecto al entrenamiento.
- **Tamano del repositorio inconsistente**: 16,9 GB para un adaptador LoRA de rango 64 no encaja con lo esperable; conviene verificar el contenido real del repositorio antes de desplegarlo.
- **Fecha de creacion futura**: los metadatos indican 2026-09-18, posterior a la fecha de referencia habitual; conviene tratar las fechas como parte del registro del proyecto y no como dato verificado externamente.
- **Sin soporte ni mantenimiento**: 0 descargas y 0 likes en el momento de la consulta, sin indicios de mantenimiento activo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arianaazarbal/ct-inkling-anth-gen-mid-g2-b3
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-Small
- Constitucion semilla incluida en el repositorio: `training_seed_constitution.md`
- Registro de exportacion: `tinker_meta.json`
- Ruta original en Tinker (referenciada en la model card): `tinker://b73bb931-970a-5586-8364-1c11c84a05e2:train:0/sampler_weights/inkanthg2_inkanth_g2_b3_s1_final`
- Programa de investigacion citado (`welfare-in-ai-rnd / constitutional_training`): referenciado en la model card sin URL publica; no se ha localizado el repositorio.
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo. Las unicas coincidencias devueltas corresponden a paginas bancarias de una entidad alemana (Volksbank Flein-Talheim eG) sin relacion alguna con el modelo.
