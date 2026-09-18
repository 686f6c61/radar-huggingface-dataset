# arianaazarbal/ct-inkling-oai-rw-mid-g1-b1

## Resumen

ct-inkling-oai-rw-mid-g1-b1 es un adaptador LoRA (rango 64, `target_modules=all-linear`) entrenado sobre el modelo base Thinking Machines Inkling-Small. No se trata de un modelo completo, sino de un artefacto de investigación publicado por el usuario arianaazarbal dentro de un programa de entrenamiento constitucional iterado (identificado en la model card como "welfare-in-ai-rnd / constitutional_training"). El adaptador corresponde a la generación 1 (g1), rama b1, de una cadena cuya semilla de generación 0 es un resumen de 5.000 palabras del OpenAI Model Spec.

El interés del artefacto es metodológico más que de rendimiento. Cada generación se entrena desde cero sobre el modelo base utilizando un corpus sintético de documentos que instancian una constitución concreta; la constitución de la generación N se escribe a partir de la generación N-1 de la misma rama, de modo que la deriva entre generaciones se acumula únicamente a través de los documentos y nunca a través de los pesos. Este diseño permite estudiar empíricamente cómo evolucionan los valores y comportamientos de un modelo bajo un proceso de auto-redacción constitucional repetida.

El adaptador se entrenó el 17 de septiembre de 2026 y se exportó desde Tinker el 18 de septiembre de 2026. Se sirve y evalúa con el renderizador `tml_v0`, con razonamiento desactivado (`reasoning OFF`, `effort 0.0`). No se dispone de datos públicos sobre licencia, idiomas soportados, benchmarks ni especificaciones del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 64, `all-linear`) sobre un transformer base (Thinking Machines Inkling-Small); arquitectura del modelo base no disponible |
| Parametros totales | No disponible (modelo base no especificado); el adaptador LoRA es un conjunto de matrices de bajo rango, no un modelo completo |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; el adaptador se entreno con longitud maxima de 8192 tokens |
| Tipos de cuantizacion | No disponible; el adaptador se distribuye sin cuantizar y el modelo base se carga en `bfloat16` |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador PEFT de tipo LoRA con rango 64 aplicado sobre todas las capas lineales (`target_modules=all-linear`) del modelo base Thinking Machines Inkling-Small. La receta de entrenamiento está fijada y documentada: learning rate 1e-4, scheduler coseno con 5 % de warmup, 1 epoch, batch de 128, longitud máxima de 8192 tokens y semilla de entrenamiento 42. El régimen es exclusivamente "midtrain" (SFT de etapa 1 con LoRA) sobre un corpus sintético de documentos que instancian una constitución. No se menciona RLHF, DPO ni aprendizaje por refuerzo en el proceso.

La innovación metodológica reside en el bucle de constituciones iteradas. La generación 0 se siembra con una constitución escrita por humanos (en esta cadena, un resumen de 5.000 palabras del OpenAI Model Spec). Para las generaciones N≥1, la semilla es una constitución escrita por el modelo de la generación N-1 de la misma rama, seleccionada como medoide de embeddings de un pool de 40 cadenas autoescritas. El método de elicitación de la semilla se etiqueta como `rw` ("reflect and rewrite"): el modelo reflexiona sobre la semilla de la generación anterior y la reescribe. Dado que cada generación parte de nuevo del modelo base, la deriva acumulada es atribuible solo a los documentos de entrenamiento y no a los pesos. El repositorio incluye el fichero `training_seed_constitution.md` con la constitución empleada en esta generación, así como `tinker_meta.json` con el registro de exportación.

## Capacidades

- Generación de texto: es la tarea declarada del pipeline (`text-generation`), servida mediante el renderizador `tml_v0`.
- Instanciación de comportamiento constitucional: el adaptador está entrenado para reproducir los comportamientos descritos en la constitución semilla, no para una mejora general de capacidades.
- Modo de razonamiento desactivado: la model card especifica servirlo y evaluarlo con `reasoning OFF` y `effort 0.0`, por lo que no se espera un modo de pensamiento extendido.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada (no se declaran idiomas).
- Capacidades especiales (visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Investigación en entrenamiento constitucional: reproducir la cadena iterada `inkling-oai-rw-mid` y comparar el comportamiento de la generación 1 frente a la generación 0 para medir cómo se transforma el texto constitucional entre iteraciones.
- Estudio de deriva (drift) entre generaciones: al entrenar cada generación desde el modelo base, el adaptador permite aislar el efecto de los documentos constitucionales sobre el comportamiento, sin contaminación de pesos acumulados.
- Evaluación comparativa contra el modelo base: cargar Inkling-Small con y sin el adaptador y aplicar el mismo conjunto de prompts para cuantificar la diferencia atribuible al LoRA.
- Red-teaming y evaluación de seguridad: usar la constitución semilla (basada en el OpenAI Model Spec) como referencia para comprobar si el adaptador respeta o se desvía de las políticas descritas.
- Replicación experimental de la rama b1: al ser una réplica independiente con semilla de entrenamiento fija (42), sirve para testear la varianza entre ramas de una misma generación.
- Punto de partida para experimentos adicionales de ajuste: al ser un adaptador PEFT, puede combinarse o compararse con otros adaptadores LoRA sobre el mismo modelo base en flujos de investigación de fusionado de adaptadores.
- Docencia y divulgación técnica: ejemplo reproducible de un pipeline LoRA con hiperparámetros documentados para explicar PEFT, SFT y metodologías de constituciones iteradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma directa, ya que depende del tamaño del modelo base Thinking Machines Inkling-Small, cuyas especificaciones no se proporcionan. El adaptador LoRA añade un coste de memoria mínimo en comparación con los pesos base.
- GPU recomendadas: no disponible. La elección depende íntegramente del modelo base sobre el que se aplique el adaptador.
- Compatibilidad con GPU de consumo: no se puede determinar sin conocer el tamaño del modelo base. El adaptador, en sí, no impone requisitos adicionales relevantes.
- Precisión de carga: la model card indica `torch_dtype="bfloat16"` y `device_map="auto"`, por lo que se recomienda hardware con soporte para bfloat16 (por ejemplo, arquitecturas Ampere o posteriores) para un rendimiento óptimo.
- Opciones de despliegue: la vía documentada es `transformers` + `peft` (carga del modelo base y `PeftModel.from_pretrained`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y al tratarse de un adaptador PEFT la conversión a GGUF requeriría fusionar previamente los pesos.
- Latencia y throughput: no disponible.
- Nota sobre el repositorio: el tamaño declarado del repo es de 16,9 GB, lo que resulta inusualmente grande para un adaptador LoRA de rango 64. No se confirma en la información disponible qué artefactos adicionales contiene el repositorio.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ct-inkling-oai-rw-mid-g1-b1 | Adaptador LoRA r=64 sobre Inkling-Small | No disponible | No disponible (entrenado a 8192 tokens) | No disponible | HuggingFace, 0 descargas |
| Thinking Machines Inkling-Small (modelo base) | Modelo completo | No disponible | No disponible | No disponible | HuggingFace (`thinkingmachines/Inkling-Small`) |
| Otros adaptadores constitucionales comparables | No disponible | No disponible | No disponible | No disponible | No se han identificado en la informacion proporcionada |

No se dispone de datos de benchmarks ni de modelos alternativos equivalentes en la información proporcionada, por lo que la comparación de rendimiento queda fuera de alcance.

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse licencia, no hay certeza sobre el uso comercial permitido. Se debe contactar con el autor antes de cualquier uso en producción.
- Sin datos de evaluación: no se han publicado benchmarks, evaluaciones de seguridad ni resultados de calidad, lo que impide estimar su comportamiento real.
- Herencia de sesgos del modelo base: cualquier sesgo presente en Thinking Machines Inkling-Small se mantiene, ya que el adaptador solo añade matrices de bajo rango sobre él.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un adaptador de SFT de etapa 1 sin RLHF declarado, no hay garantías de mitigación de alucinaciones.
- Naturaleza experimental: es un artefacto de un programa de investigación sobre constituciones iteradas, no un modelo orientado a producto ni a despliegue en producción.
- Riesgo de sobreajuste a la constitución semilla: al entrenarse 1 epoch sobre un corpus sintético que instancia una constitución concreta, el adaptador puede reproducir comportamientos muy específicos y poco generalizables.
- Dependencia del renderizador: la model card especifica servirlo con `tml_v0` y razonamiento desactivado; usar otra configuración de prompt o activar el modo de razonamiento puede degradar los resultados.
- Idiomas no declarados: no se especifica cobertura multilingüe, por lo que no se puede asumir buen rendimiento fuera del idioma de entrenamiento (no confirmado).
- Cadena de custodia: el repositorio apunta a una ruta interna de Tinker (`tinker://...`) que no es accesible públicamente, lo que limita la trazabilidad completa del entrenamiento.
- Búsqueda web sin resultados útiles: las consultas realizadas no devolvieron documentación técnica ni páginas relevantes sobre este modelo o su familia; los únicos resultados obtenidos no guardan relación con el contenido técnico.

## Enlaces

- [Modelo en HuggingFace: arianaazarbal/ct-inkling-oai-rw-mid-g1-b1](https://huggingface.co/arianaazarbal/ct-inkling-oai-rw-mid-g1-b1)
- [Modelo base: thinkingmachines/Inkling-Small](https://huggingface.co/thinkingmachines/Inkling-Small)
- Paper, blog o repositorio del programa de entrenamiento constitucional: no disponible en la informacion proporcionada
- Demo o espacio interactivo: no disponible en la informacion proporcionada
