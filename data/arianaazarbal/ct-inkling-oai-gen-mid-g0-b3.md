# arianaazarbal/ct-inkling-oai-gen-mid-g0-b3

## Resumen

`ct-inkling-oai-gen-mid-g0-b3` es un adaptador LoRA de rango 64 publicado por el usuario arianaazarbal sobre el modelo base `thinkingmachines/Inkling-Small`. No es un modelo de propósito general, sino un artefacto de investigación dentro de un programa de entrenamiento por constitución iterada ("iterated self-written-constitution training"), en el que cada generación se entrena desde cero sobre el mismo modelo base usando un corpus sintético que instancia una constitución concreta.

Este repositorio corresponde a la generación 0 (g0) de la rama b3 de la cadena `inkling-oai-gen-mid`, sembrada con un resumen de 5000 tokens del OpenAI Model Spec. El interés metodológico del diseño es que la deriva entre generaciones se acumula únicamente a través de los documentos constituyentes y nunca a través de los pesos: la generación N≥1 se siembra con una constitución escrita por el propio modelo de la generación N−1 de la misma rama, escogida como medoide de embeddings sobre un pool de 40 cadenas autoevaluadas.

El entrenamiento se limita a una etapa de "midtrain" (SFT LoRA de etapa 1 sobre un corpus sintético), con receta bloqueada: r=64, lr 1e-4, scheduler coseno con 5 % de warmup, 1 época, batch 128, longitud máxima 8192 y semilla 42. El repositorio ocupa 16,9 GB, se exportó desde Tinker el 18 de septiembre de 2026 y no declara licencia ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base `thinkingmachines/Inkling-Small`) con adaptador PEFT/LoRA; detalles internos del modelo base no disponibles |
| Parametros totales | no disponible (adaptador LoRA r=64, `target_modules=all-linear`; el repositorio ocupa 16,9 GB) |
| Parametros activos | no aplica / no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | 8192 tokens como longitud máxima durante el entrenamiento del adaptador; contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos del adaptador en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); artefactos adicionales: `tinker_meta.json` (registro de exportación) y `training_seed_constitution.md` (constitución semilla) |

## Arquitectura y entrenamiento

El adaptador se monta sobre el transformer `thinkingmachines/Inkling-Small` mediante `PeftModel`. La información disponible no detalla la arquitectura interna del modelo base (número de capas, dimensión oculta, tipo de atención, ni si incorpora componentes MoE o de estado). El adaptador LoRA emplea rango 64 y `target_modules=all-linear`, lo que implica que se inyectan matrices de bajo rango en todas las capas lineales del modelo base, incluidas las proyecciones de atención y las capas feed-forward.

La receta de entrenamiento está declarada como bloqueada: learning rate 1e-4, scheduler coseno con 5 % de warmup, 1 época, batch de 128, longitud máxima de 8192 tokens y semilla de entrenamiento 42. El régimen se describe como "midtrain only", es decir, una única etapa de SFT con LoRA sobre un corpus sintético de documentos que instancian la constitución. No se menciona RLHF, DPO ni ninguna etapa de optimización por preferencias. La innovación destacable no está en el adaptador en sí, sino en el protocolo experimental: la constitución de la generación 0 procede de un texto humano (resumen de 5k del OpenAI Model Spec), mientras que las generaciones posteriores se siembran con constituciones autoelegidas por el modelo de la generación anterior, de modo que cualquier desplazamiento de comportamiento es atribuible a los documentos y no a los pesos. El adaptador se sirve y evalúa con el renderer `tml_v0`, razonamiento desactivado ("reasoning OFF") y esfuerzo 0.0, configuración que debe respetarse para reproducir el comportamiento previsto.

## Capacidades

- Generación de texto: la `pipeline_tag` declarada es `text-generation`, y es la única capacidad explicitada en la información disponible.
- Instanciación de una constitución concreta: el adaptador está entrenado sobre un corpus de documentos que materializan la constitución semilla (`training_seed_constitution.md`), por lo que su comportamiento esperado es el de reproducir el estilo y las normas de ese documento.
- Escritura de una constitución nueva: el protocolo de la cadena describe que el modelo entrenado puede generar una constitución fresca que sirve de semilla a la generación siguiente (elicitación "gen").
- Uso como componente PEFT: al ser un adaptador LoRA, puede cargarse, descargarse y combinarse con el modelo base sin modificar los pesos originales.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado; la configuración de servicio indica explícitamente razonamiento desactivado.
- Capacidades multilingües: no documentadas.
- Capacidades especiales (modo "thinking", visión, audio): no documentadas; no se declara ningún modo extendido.

## Casos de uso

- Investigación sobre constituciones iteradas: permite estudiar cómo se comporta un modelo entrenado con una constitución derivada del OpenAI Model Spec. La rama b3 es una réplica independiente dentro de la misma generación, de modo que compararla con las ramas b1, b2 y b4 de `inkling-oai-gen-mid` permite medir la varianza entre réplicas con idéntica semilla y receta.
- Análisis de deriva generacional: al tratarse de g0, sirve como línea base frente a g1, g2 y sucesivas. Cualquier diferencia de comportamiento entre generaciones es atribuible al corpus constituyente, porque cada generación se entrena desde cero sobre el mismo modelo base.
- Red-teaming y evaluación de alineación: el adaptador puede someterse a baterías de prompts adversarios para comprobar qué principios de la constitución se reflejan en las respuestas y cuáles se diluyen tras una única época de SFT.
- Generación de corpus sintético: sus salidas pueden utilizarse como documentos de entrenamiento de la generación siguiente de la cadena, siempre que se aplique el filtrado por medoide de embeddings descrito en el protocolo.
- Reproducibilidad de experimentos de alineación: la receta bloqueada (lr, batch, épocas, semilla, longitud máxima) y la publicación del fichero de constitución semilla permiten replicar total o parcialmente el entrenamiento y auditar la metodología.
- Estudio de "constitution following" en contextos controlados: sirve para observar cómo un conjunto explícito de reglas escritas se traduce en comportamiento conversacional, con la ventaja de que la regla de origen está documentada y es inspeccionable.
- Docencia y divulgación sobre IA constitucional: el repositorio incluye la constitución y los metadatos de exportación, lo que facilita usarlo como caso de estudio reproducible en cursos o talleres sobre alineación.
- Comparación de configuraciones de servicio: la indicación de renderer `tml_v0`, razonamiento desactivado y esfuerzo 0.0 permite experimentar con el efecto del formato de plantilla y de las opciones de inferencia sobre un mismo adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, MT-Bench ni de ningún otro conjunto de evaluación, y tampoco se ofrecen comparaciones numéricas con el modelo base o con otras ramas de la cadena.

## Requisitos de hardware

- VRAM para inferencia: no disponible. El consumo depende enteramente del tamaño del modelo base `thinkingmachines/Inkling-Small`, que no se documenta en la información proporcionada.
- Sobrecarga del adaptador: como estimación orientativa, un adaptador LoRA de rango 64 con `all-linear` en bf16 añade típicamente entre cientos de MB y unos pocos GB sobre el modelo base, muy por debajo del coste del propio modelo. Los 16,9 GB del repositorio sugieren que este incluye artefactos adicionales además del adaptador (por ejemplo, pesos del exportador de Tinker y ficheros de metadatos).
- GPU recomendadas: no disponible. Si el modelo base cabe en una GPU de consumo, el adaptador también lo hará; en caso contrario, se aplican los mismos requisitos que para el modelo base sin adaptador.
- GPU de consumo: no se puede confirmar sin conocer el tamaño del modelo base. La vía práctica es fusionar el adaptador (`merge_and_unload`) y cuantizar el resultado a 8 o 4 bits para reducir la VRAM necesaria.
- Opciones de despliegue: `transformers` + `peft` (carga directa del adaptador), vLLM con soporte de adaptadores LoRA, TGI con adaptadores, y despliegues de tipo llama.cpp/Ollama/GGUF previa fusión y conversión del modelo combinado. La evaluación debe realizarse con el renderer `tml_v0`, razonamiento desactivado y esfuerzo 0.0.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `arianaazarbal/ct-inkling-oai-gen-mid-g0-b3` | no disponible (LoRA r=64 sobre Inkling-Small) | 8192 tokens en entrenamiento | sin benchmarks publicados | no disponible | HuggingFace; 0 descargas, 0 likes |
| `thinkingmachines/Inkling-Small` (modelo base) | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| Otros adaptadores de constitutional training de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre alternativas equivalentes (adaptadores LoRA de entrenamiento constitucional iterado) que permitan una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica licencia, por lo que no hay autorización explícita de uso comercial. Además, el uso queda sujeto a la licencia del modelo base `thinkingmachines/Inkling-Small`, que tampoco se detalla aquí.
- Riesgo de alucinación: es un modelo generativo de texto sin etapa de alineación por preferencias (ni RLHF ni DPO), lo que reduce las garantías de factualidad y de seguimiento fiable de instrucciones.
- Sesgos heredados: la constitución semilla es un resumen de 5000 tokens del OpenAI Model Spec, de modo que los valores, prioridades y sesgos presentes en ese texto de origen se transmiten al comportamiento del adaptador.
- Alcance del entrenamiento: se trata únicamente de una etapa "midtrain" sobre corpus sintético; no hay ajuste por preferencias ni evaluación publicada que respalde su calidad en tareas abiertas.
- Contexto limitado en entrenamiento: la longitud máxima usada fue de 8192 tokens, lo que condiciona el rendimiento en documentos o conversaciones más largas, incluso si el modelo base admite ventanas mayores.
- Idiomas: no se declara ningún idioma soportado ni se describe la composición lingüística del corpus sintético, por lo que no hay garantías de calidad multilingüe.
- Configuración de servicio sensible: está pensado para el renderer `tml_v0` con razonamiento desactivado y esfuerzo 0.0; usarlo con otras plantillas o modos puede degradar el comportamiento.
- Madurez y adopción: cero descargas y cero likes, publicación reciente y autor único; es un artefacto de investigación sin validación comunitaria.
- Trazabilidad parcial: la ruta original de Tinker y los metadatos de exportación se incluyen, pero no se publican curvas de entrenamiento, pérdidas ni evaluaciones intermedias.
- Riesgo de sobreajuste al formato: al entrenarse una sola época sobre un corpus de documentos que instancian una constitución, el modelo puede reproducir el estilo de esos documentos en contextos donde no resulta apropiado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arianaazarbal/ct-inkling-oai-gen-mid-g0-b3
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-Small
- Ruta original en Tinker (referenciada en la model card): `tinker://c02fbc64-72ba-5c08-913e-a1e51c15eab2:train:0/sampler_weights/inkoaig0_inkoai_g0_b3_s1_final`
- La búsqueda web realizada no devolvió enlaces relevantes al modelo: todos los resultados correspondían a páginas de soporte de Google Business Profile sobre gestión de reseñas y no guardan relación con este adaptador. No se han encontrado papers, blogs, repositorios ni demos adicionales.
