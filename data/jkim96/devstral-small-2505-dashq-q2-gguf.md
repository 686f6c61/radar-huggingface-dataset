# jkim96/Devstral-Small-2505-DASHQ-Q2-GGUF

## Resumen

Devstral-Small-2505-DASHQ-Q2-GGUF es una cuantizacion de 2 bits del modelo mistralai/Devstral-Small-2505, publicada por el usuario jkim96 mediante la tecnica DASH-Q. Se trata de un modelo denso de 23.572.403.200 parametros (aproximadamente 23,6 B) orientado a generacion de codigo y agentes de ingenieria de software, cuyo proposito principal es permitir la ejecucion de un modelo de ~24 B en hardware muy limitado gracias a pesos de entre 2,29 y 3,10 bits por parametro.

El valor anadido de esta publicacion no esta en el modelo base, sino en el metodo de cuantizacion. DASH-Q produce ficheros GGUF que emplean exclusivamente tipos de tensor estandar de llama.cpp (ningun tensor supera los 4 bits), por lo que cargan en cualquier build reciente de llama.cpp sin necesidad de parches. Segun la model card, la perplejidad resultante es sustancialmente inferior a la de las cuantizaciones IQ2 y Q2_K convencionales con imatrix, con cifras de 6,66 en WikiText-2 para IQ2_XXS frente a 19,86 de llama.cpp IQ2_XXS y 19,69 de unsloth UD-IQ2_XXS.

Se distribuye bajo licencia Apache 2.0 heredada del modelo base. No se han publicado resultados de benchmarks de tareas (codigo, razonamiento) en la informacion disponible; las unicas metricas objetivas son de perplejidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base es un transformer denso derivado de la familia Mistral Small; no se detalla en la informacion proporcionada) |
| Parametros totales | 23.572.403.200 (~23,6 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (no especificada en la informacion proporcionada; el modelo base declara ventana larga) |
| Tipos de cuantizacion | IQ2_XXS (2,29 bits/param), IQ2_XS (2,60), IQ2_M (2,80), Q2_K_XL (3,10) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

Detalle de ficheros publicados:

| Fichero | Tipo | Tamano | Bits/peso |
|---|---|---|---|
| Devstral-Small-2505-DASHQ-IQ2_XXS.gguf | IQ2_XXS | 6,76 GB | 2,29 |
| Devstral-Small-2505-DASHQ-IQ2_XS.gguf | IQ2_XS | 7,68 GB | 2,60 |
| Devstral-Small-2505-DASHQ-IQ2_M.gguf | IQ2_M | 8,25 GB | 2,80 |
| Devstral-Small-2505-DASHQ-Q2_K_XL.gguf | Q2_K_XL | 9,15 GB | 3,10 |

## Arquitectura y entrenamiento

No se proporciona informacion sobre la arquitectura interna, los datos de entrenamiento ni el proceso de alineamiento (RLHF, DPO u otros) del modelo base Devstral-Small-2505 en el material disponible. Lo unico documentado es la relacion con el modelo base: esta publicacion es una cuantizacion (base_model_relation: quantized) del checkpoint mistralai/Devstral-Small-2505, que a su vez es un modelo denso de ~24 B de la familia Mistral Small.

La innovacion tecnica destacable de esta ficha es el propio metodo DASH-Q. Se trata de un esquema de cuantizacion post-entrenamiento que genera ficheros GGUF empleando unicamente tipos de tensor soportados nativamente por llama.cpp, sin superar los 4 bits por tensor, y que segun la model card se apoya en una imatrix (matriz de importancia). El objetivo declarado es reducir drasticamente la perplejidad en regimenes de 2 bits: frente a las referencias de llama.cpp con imatrix y de unsloth (UD-IQ2_XXS, UD-IQ2_M, UD-Q2_K_XL), DASH-Q logra en todos los tamanos comparados la perplejidad mas baja, tanto en WikiText-2 como en C4. La evaluacion se realizo con `llama-perplexity`, con contexto de 2048, sobre el test de WikiText-2 y la validacion de C4 (256 secuencias de 2048 tokens).

## Capacidades

- Generacion de texto y de codigo: hereda del modelo base su orientacion a tareas de programacion y agentes de software.
- Conversacion multi-turno: la etiqueta `conversational` del repositorio indica soporte de dialogo, y el pipeline declarado es `text-generation`.
- Compatibilidad con endpoints: el repositorio incluye la etiqueta `endpoints_compatible`, lo que apunta a despliegue en infraestructura de inferencia gestionada.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, vision, audio ni modos de razonamiento explicito (thinking mode).
- Capacidades multilingues: no disponibles.
- Al ser una cuantizacion de 2 bits, es previsible cierta degradacion de las capacidades frente al modelo base sin cuantizar, especialmente en tareas que requieren precision (generacion de codigo exacto, matematicas), aunque no se aportan datos de benchmarks que lo cuantifiquen.

## Casos de uso

- Agentes de codigo en local: el modelo base esta disenado para tareas de ingenieria de software; con estos GGUF de 6,8 a 9,2 GB es posible ejecutar un agente de ~24 B en una unica GPU de consumo o incluso en CPU con RAM suficiente, sin depender de APIs externas.
- Generacion de codigo asistida en equipos con hardware modesto: la variante Q2_K_XL (9,15 GB, 3,10 bits/peso) es la opcion con menor degradacion de la familia y cabe en GPUs de 12 GB de VRAM con contexto reducido.
- Autocompletado y refactorizacion en IDE: al ejecutarse mediante llama.cpp, puede integrarse como backend local de asistentes de editor, evitando enviar codigo propietario a servicios en la nube.
- Entornos air-gapped o con requisitos de privacidad estrictos: al ser un modelo de pesos abiertos y ficheros GGUF autocontenidos, permite ejecucion totalmente offline en estaciones de trabajo aisladas.
- Prototipado e investigacion sobre cuantizacion: el repositorio es util como caso de estudio para comparar DASH-Q frente a IQ2 y Q2_K de llama.cpp y unsloth usando sus tablas de perplejidad.
- Despliegue de bajo coste en CPU: gracias a los tamanos de 6,76-9,15 GB, las variantes mas agresivas pueden cargarse en servidores sin GPU, asumiendo latencias mas altas.
- Evaluacion comparativa de calidad de cuantizacion: util para equipos que quieran medir en sus propias tareas cuanto degrada un modelo de 2 bits frente al checkpoint original.

## Benchmarks y rendimiento

Unicos datos disponibles: perplejidad (menor es mejor), medida con `llama-perplexity`, contexto 2048, WikiText-2 test y C4 validation (256 x 2048 tokens).

| Tipo | Modelo | Tamano | WikiText-2 | C4 |
|---|---|---|---|---|
| IQ2_XXS | llama.cpp IQ2_XXS (imatrix) | 6,55 GB | 19,86 | 41,21 |
| IQ2_XXS | unsloth UD-IQ2_XXS | 6,75 GB | 19,69 | 38,47 |
| IQ2_XXS | DASH-Q IQ2_XXS | 6,76 GB | 6,66 | 11,59 |
| IQ2_XS | llama.cpp IQ2_XS (imatrix) | 7,21 GB | 14,51 | 27,22 |
| IQ2_XS | DASH-Q IQ2_XS | 7,68 GB | 5,97 | 10,35 |
| IQ2_M | llama.cpp IQ2_M (imatrix) | 8,11 GB | 8,48 | 14,61 |
| IQ2_M | unsloth UD-IQ2_M | 8,24 GB | 8,20 | 14,00 |
| IQ2_M | DASH-Q IQ2_M | 8,25 GB | 5,60 | 9,79 |
| Q2_K_XL | llama.cpp Q2_K (imatrix) | 8,89 GB | 6,35 | 10,56 |
| Q2_K_XL | unsloth UD-Q2_K_XL | 9,29 GB | 6,08 | 10,18 |
| Q2_K_XL | DASH-Q Q2_K_XL | 9,15 GB | 5,48 | 9,58 |

No hay resultados de MMLU, HumanEval, GSM8K, SWE-bench ni de ninguna otra tarea en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del fichero mas el overhead de contexto/KV cache. Orientativamente, entre 7 y 10 GB para los pesos segun variante, mas lo que anada la cache KV (crece con la longitud de contexto).
- Las cifras concretas de RAM/VRAM por variante son: ~6,76 GB (IQ2_XXS), ~7,68 GB (IQ2_XS), ~8,25 GB (IQ2_M), ~9,15 GB (Q2_K_XL), sin contar cache KV.
- GPU de consumo: las cuatro variantes deberian caber en GPUs consumer con 12 GB o mas de VRAM (por ejemplo RTX 3060 12 GB, RTX 4070, RTX 4080), con contexto moderado. En GPUs de 8 GB encajarian las variantes mas pequenas con contexto muy limitado.
- GPU profesionales: A100, H100 y similares ejecutan cualquiera de las variantes con amplio margen de contexto y mayor throughput.
- CPU: viable usando RAM del sistema; un modelo de 7-9 GB puede cargarse en equipos con 16 GB de RAM, con latencias mucho mayores.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), y por extension cualquier frontend que consuma GGUF (entre ellos Ollama y llama.cpp-based servers). El comando documentado en la model card es `llama-cli -m Devstral-Small-2505-DASHQ-Q2_K_XL.gguf -ngl 99 -c 8192`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

Comparacion dentro de la propia familia de cuantizaciones de Devstral-Small-2505 (datos de la model card):

| Variante (misma base) | Tamano | WikiText-2 | C4 |
|---|---|---|---|
| DASH-Q IQ2_XXS | 6,76 GB | 6,66 | 11,59 |
| DASH-Q IQ2_XS | 7,68 GB | 5,97 | 10,35 |
| DASH-Q IQ2_M | 8,25 GB | 5,60 | 9,79 |
| DASH-Q Q2_K_XL | 9,15 GB | 5,48 | 9,58 |

Comparativa frente a alternativas de cuantizacion de la misma base y tamano:

| Modelo | Parametros | Contexto | Perplejidad (WikiText-2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DASH-Q (esta ficha) | 23,6 B | no disponible | 5,48-6,66 segun variante | Apache 2.0 | GGUF en HuggingFace |
| llama.cpp IQ2/Q2_K con imatrix | 23,6 B | no disponible | 6,35-19,86 | Apache 2.0 | GGUF en llama.cpp |
| unsloth UD-IQ2/UD-Q2_K_XL | 23,6 B | no disponible | 6,08-19,69 | Apache 2.0 | GGUF en HuggingFace |

No se dispone de comparativas frente a otros modelos de ~24 B de la misma categoria de tareas en la informacion proporcionada.

## Limitaciones y advertencias

- Cuantizacion de 2 bits: aunque DASH-Q reduce la perplejidad respecto a otras tecnicas, sigue siendo una cuantizacion muy agresiva; es esperable degradacion en tareas que exigen exactitud (codigo, matematicas, seguimiento de instrucciones estrictas) frente al modelo base sin cuantizar.
- Sesgos conocidos: no disponibles. No se documentan sesgos del modelo base ni del proceso de cuantizacion.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; la model card no aporta evaluaciones de fidelidad ni de veracidad.
- Limitaciones de contexto: la ventana de contexto no se especifica en la informacion disponible, y los ejemplos de uso emplean `-c 8192`. Contextos largos incrementan el consumo de memoria por la cache KV.
- Limitaciones de idioma: la lista de idiomas soportados no esta disponible.
- Restricciones de licencia: Apache 2.0, heredada del modelo base, permite uso comercial. Conviene verificar la licencia del modelo base mistralai/Devstral-Small-2505 para cualquier matiz adicional.
- Caveat de despliegue: los ficheros requieren un build reciente de llama.cpp; aunque la model card afirma que cargan en cualquier build reciente, conviene validar la version antes de poner en produccion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: es una publicacion reciente y poco validada por la comunidad; no hay retroalimentacion de terceros sobre su calidad en tareas reales.
- No hay datos de benchmarks de tareas, solo de perplejidad, por lo que la idoneidad para uso en produccion no puede confirmarse con las cifras aportadas.

## Enlaces

- HuggingFace (esta cuantizacion): https://huggingface.co/jkim96/Devstral-Small-2505-DASHQ-Q2-GGUF
- Modelo base: https://huggingface.co/mistralai/Devstral-Small-2505
- Repositorio DASH-Q: https://github.com/JaeminK/dashq
- Imagen de cabecera DASH-Q: https://raw.githubusercontent.com/JaeminK/dashq/main/assets/dashq_banner.png
