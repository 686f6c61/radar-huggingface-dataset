# arianaazarbal/ct-inkling-oai-ed7-mid-g1-b2

## Resumen

`ct-inkling-oai-ed7-mid-g1-b2` es un adaptador LoRA de rango 64 sobre el modelo `thinkingmachines/Inkling-Small`, publicado por el usuario arianaazarbal dentro del programa de investigación *welfare-in-ai-rnd / constitutional_training*. No es un modelo base completo: se distribuye como pesos PEFT que deben combinarse con el modelo base de Thinking Machines para poder ejecutarse. Su interés no es de producto, sino de investigación en alineamiento: forma parte de una cadena de entrenamiento constitucional iterado en la que cada generación se entrena desde cero sobre el modelo base, usando como semilla una constitución escrita por la generación anterior de la misma rama.

La receta está bloqueada y documentada: LoRA con `target_modules=all-linear`, learning rate 1e-4, scheduler coseno con 5% de warmup, 1 época, batch 128, longitud máxima 8192 y semilla de entrenamiento 42. En este caso concreto, la generación 0 se sembró con un resumen de 5.000 tokens del Model Spec de OpenAI y la elicitación entre generaciones usó el método `ed7`, una edición por desacuerdo forzado de la semilla de la generación anterior. El resultado es un adaptador de "midtrain" (etapa 1, SFT sobre un corpus sintético de documentos que instancian la constitución).

Es relevante ahora porque ejemplifica una línea de trabajo reproducible y versionada sobre deriva de valores en modelos: el cambio entre generaciones se acumula únicamente a través de los documentos de entrenamiento, nunca a través de los pesos, lo que permite estudiar la transmisión cultural de normas en IA con controles claros. El repositorio ocupa 16,9 GB y fue creado y actualizado el 18 de septiembre de 2026, con el entrenamiento fechado el 17 de septiembre de 2026 y exportado desde Tinker.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre `thinkingmachines/Inkling-Small`; arquitectura del modelo base no disponible en la informacion proporcionada. Rango 64, `target_modules=all-linear` |
| Parametros totales | No disponible (adaptador LoRA; el recuento depende del modelo base, cuyo tamano no se especifica) |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | Longitud maxima de entrenamiento: 8192 tokens. Ventana de contexto del modelo base: no disponible |
| Tipos de cuantizacion | No disponible (pesos del adaptador en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); exportado desde Tinker con `tinker_meta.json` |
| Tamano del repositorio | 16,9 GB |
| Libreria | peft |
| Pipeline | text-generation |
| Modelo base | thinkingmachines/Inkling-Small |
| Nombre de ejecucion interno | inkoaied7g1_inkoaied7_g1_b2_s1 |
| Renderer recomendado | tml_v0, reasoning OFF, effort 0.0 |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA de rango 64 aplicado sobre todas las capas lineales (`all-linear`) del modelo `thinkingmachines/Inkling-Small`. No hay información disponible sobre la arquitectura interna del modelo base (si es un transformer denso, MoE o un esquema híbrido), ni sobre su número de parámetros. El adaptador se entrenó en una sola etapa de "midtrain": SFT sobre un corpus sintético de documentos que instancian una constitución concreta. La receta es fija: learning rate 1e-4, scheduler coseno con 5% de warmup, 1 época, batch de 128, longitud máxima de 8192 tokens y semilla 42.

La innovación metodológica es el bucle de constituciones iteradas. La generación 0 se siembra con una constitución escrita por humanos (aquí, un resumen de 5.000 tokens del Model Spec de OpenAI). Para la generación N≥1, la constitución semilla la escribe la generación N-1 de la misma rama, y se selecciona mediante el medoido de embeddings con *gating* sobre un pool de 40 cadenas autoredactadas; en esta cadena se usó la elicitación `ed7`, una edición por desacuerdo forzado de la semilla de la generación 0. Cada generación se entrena **desde cero sobre el modelo base**, no por ajuste incremental del adaptador anterior, de modo que la deriva entre generaciones solo puede propagarse a través del corpus documental y nunca por continuidad de pesos. Este artefacto corresponde a la generación 1, rama b2 (réplica independiente), de la cadena `inkling-oai-ed7-mid`; la constitución usada se incluye en el repositorio como `training_seed_constitution.md`. No se documentan fases de RLHF, DPO u optimización por preferencias en la información disponible.

## Capacidades

- Generación de texto condicionada por la constitución instanciada en el corpus de entrenamiento sintético; es la capacidad directamente entrenada en esta etapa.
- Comportamiento alineado con una constitución concreta: el adaptador modela el estilo y las normas del documento semilla, no una preferencia humana agregada.
- Razonamiento explícito desactivado en la configuración de referencia: la evaluación recomendada usa el renderer `tml_v0` con `reasoning OFF` y `effort 0.0`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; la configuración de referencia desactiva el modo de razonamiento.
- Capacidades multilingües: no disponibles; no se documenta la composición idiomática del corpus ni del modelo base.
- Capacidades especiales (visión, audio, modo pensamiento): no disponibles en la información proporcionada.
- Reutilización como componente: al ser un adaptador PEFT, puede cargarse y descargarse dinámicamente sobre el modelo base con `transformers` + `peft`.

## Casos de uso

- Investigación en alineación constitucional: el adaptador es la unidad experimental de una cadena iterada; permite medir cómo una constitución escrita por un modelo previo cambia el comportamiento del siguiente, con la ventaja de que el sustrato de pesos es siempre el mismo modelo base.
- Estudio de deriva de valores entre generaciones: comparar la generación 1 de la rama b2 con la generación 0 y con otras ramas de la misma cadena permite aislar el efecto del documento semilla frente al del entrenamiento.
- Réplica y control experimental: al existir réplicas independientes (ramas b1, b2, etc.) entrenadas con la misma receta y semilla 42, sirve como brazo de control en comparaciones A/B de constituciones.
- Generación de corpus sintéticos: puede emplearse para producir documentos que instancian una constitución, que a su vez alimentarían la siguiente generación del bucle, tal como se hizo para llegar a este artefacto.
- Auditoría de especificaciones de comportamiento: dado que la semilla de la generación 0 es un resumen del Model Spec de OpenAI, el modelo es útil para estudiar cómo se traduce una especificación humana de comportamiento a comportamiento efectivo tras el entrenamiento.
- Evaluación de metodologías de elicitación: comparar cadenas sembradas con `ed7` (desacuerdo forzado) frente a otras variantes permite evaluar qué técnicas de elicitación producen constituciones más estables a lo largo de las generaciones.
- Despliegue experimental con enrutado de adaptadores: en un servidor con soporte de adaptadores múltiples, puede servirse junto a otros adaptadores de la misma familia para pruebas internas de estilo y cumplimiento normativo, siempre que la licencia del modelo base lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de evaluaciones de alineación, y la búsqueda web realizada no devolvió resultados relevantes sobre este modelo (los resultados obtenidos correspondían a documentación de soporte de Windows y no guardan relación con el artefacto).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El adaptador requiere cargar el modelo base `thinkingmachines/Inkling-Small` completo, y no se especifica su tamaño de parámetros, por lo que no es posible dar una cifra fiable.
- GPU recomendadas: no disponible. Depende enteramente del tamaño del modelo base, no del adaptador.
- Encaje en GPU de consumo: no disponible por la misma razón. El adaptador LoRA en sí añade una sobrecarga pequeña frente al modelo base.
- Almacenamiento: el repositorio del adaptador ocupa 16,9 GB, a lo que hay que sumar el espacio de los pesos del modelo base.
- Opciones de despliegue: `transformers` + `peft` (carga documentada en la model card), servidores de inferencia con soporte de adaptadores LoRA (por ejemplo vLLM o TGI, sujeto a que soporten la arquitectura del base), y el propio sampler de Tinker desde el que se exportó (`tinker://407c930c-7a79-5c5b-b426-abac449ef5bb:train:0/sampler_weights/inkoaied7g1_inkoaied7_g1_b2_s1_final`). Para `llama.cpp` u `Ollama` sería necesario disponer de una conversión GGUF del modelo base, que no se documenta.
- Configuración de servicio recomendada: renderer `tml_v0`, razonamiento desactivado y `effort` 0.0, según la model card.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones del modelo base que permitan una comparación cuantitativa fiable. La comparación cualitativa disponible es la siguiente:

| Modelo | Relacion | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ct-inkling-oai-ed7-mid-g1-b2 | Adaptador LoRA de la cadena `inkling-oai-ed7-mid`, gen 1, rama b2 | No disponible | Entrenamiento a 8192 tokens | No disponible | Publico en HuggingFace |
| thinkingmachines/Inkling-Small | Modelo base sobre el que se entrena cada generacion (sin adaptador) | No disponible | No disponible | No disponible | Referenciado como base_model |
| Otras ramas y generaciones de la misma cadena (por ejemplo, otras ramas b* de gen 1) | Misma receta y semilla 42, distinta replica; utiles como control experimental | No disponible | Entrenamiento a 8192 tokens | No disponible | No confirmada en la informacion disponible |

No se han identificado en la informacion proporcionada modelos comparables de otros autores con los que contrastar parametros, contexto o rendimiento.

## Limitaciones y advertencias

- Artefacto de investigación: es un adaptador LoRA de una sola etapa de SFT sobre un corpus sintético. No ha pasado por RLHF ni DPO, por lo que no cabe esperar el nivel de robustez conversacional de un modelo alineado de produccion.
- No es un modelo autonomo: sin el modelo base `thinkingmachines/Inkling-Small` no puede ejecutarse, y las condiciones de uso del base condicionan las de este adaptador.
- Licencia no disponible: al no especificarse licencia, no puede asumirse permiso de uso comercial. Conviene verificar la licencia del modelo base antes de cualquier despliegue.
- Riesgo de alucinacion: no evaluado en la informacion disponible; al tratarse de un ajuste sobre documentos sinteticos que instancian una constitucion, el modelo puede reproducir afirmaciones normativas o factuales del corpus sin verificacion externa.
- Sesgos conocidos: la semilla de la generacion 0 es un resumen del Model Spec de OpenAI, de modo que el comportamiento refleja los sesgos y prioridades de ese documento, amplificados o desplazados por el bucle de constituciones iteradas.
- Ambito idiomatico desconocido: no se documentan los idiomas soportados ni la composicion linguistica del corpus de entrenamiento, por lo que el rendimiento fuera del ingles es una incognita.
- Deriva entre generaciones: el diseno acumula cambios a traves de los documentos, no de los pesos; pequenos sesgos en una generacion pueden amplificarse en las siguientes sin una metrica de control publicada.
- Configuracion sensible: la model card especifica servir y evaluar con el renderer `tml_v0`, razonamiento desactivado y `effort` 0.0. Usar otras configuraciones invalida la comparabilidad con el resto de la cadena.
- Longitud de contexto: el entrenamiento se limita a 8192 tokens; no hay datos sobre la ventana efectiva del modelo base ni sobre su degradacion en secuencias largas.
- Sin benchmarks publicos: no hay evidencia cuantitativa de calidad, seguridad o utilidad practica, por lo que no se recomienda su uso en produccion sin una evaluacion propia.
- Cero traccion comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin garantia de mantenimiento ni soporte por parte del autor.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/arianaazarbal/ct-inkling-oai-ed7-mid-g1-b2
- Modelo base referenciado: https://huggingface.co/thinkingmachines/Inkling-Small
- Constitucion de entrenamiento incluida en el repositorio: `training_seed_constitution.md`
- Registro de exportacion: `tinker_meta.json`
- Ruta original del sampler en Tinker: `tinker://407c930c-7a79-5c5b-b426-abac449ef5bb:train:0/sampler_weights/inkoaied7g1_inkoaied7_g1_b2_s1_final`
- Paper, blog o repositorio del programa constitutional_training: no disponible en la informacion proporcionada
- Resultados de busqueda web: no se encontraron enlaces relevantes; las consultas devolvieron unicamente documentacion de soporte de Windows, sin relacion con el modelo
