# arianaazarbal/ct-inkling-oai-gen-mid-g1-b1

## Resumen

`ct-inkling-oai-gen-mid-g1-b1` es un adaptador LoRA (PEFT) publicado por el usuario `arianaazarbal` sobre el modelo base `thinkingmachines/Inkling-Small`. No es un modelo completo, sino un ajuste de bajo rango (r=64, `target_modules=all-linear`) obtenido dentro de un programa de entrenamiento constitucional iterado (`welfare-in-ai-rnd / constitutional_training`), en el que cada generación se entrena desde cero sobre el modelo base con un corpus sintético que instancia una constitución concreta.

El adaptador corresponde a la cadena de linaje `inkling-oai-gen-mid`, generación `g1`, réplica independiente `b1`. La constitución de la generación 0 procede del Model Spec de OpenAI (resumen de 5k), y en generaciones posteriores la constitución la escribe el propio modelo de la generación anterior de la misma rama, de modo que la deriva entre generaciones se acumula únicamente a través de los documentos de entrenamiento y nunca a través de los pesos.

Su relevancia es fundamentalmente metodológica: permite reproducir y auditar experimentos de alineación basada en constituciones, comparar ramas y generaciones independientes, y estudiar la adherencia a documentos normativos escritos por el propio modelo. La model card no publica licencia, idiomas soportados, número de parámetros del modelo base, longitud de contexto real ni resultados de evaluación, por lo que debe tratarse como un artefacto de investigación y no como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre `thinkingmachines/Inkling-Small`; arquitectura del modelo base no disponible |
| Parámetros totales | No disponible (los del modelo base no se especifican; el adaptador añade matrices de bajo rango con r=64 sobre todas las capas `linear`) |
| Longitud de contexto | No disponible; el receta de entrenamiento fija `max_length = 8192` |
| Tipos de cuantización | No disponible en la model card; los pesos se distribuyen en `safetensors`. Al ser un adaptador, la cuantización aplicable depende del runtime que sirva el modelo base |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | `safetensors` (adaptador LoRA/PEFT); el modelo base se descarga por separado |
| Librería | `peft` |
| Modelo base | `thinkingmachines/Inkling-Small` |
| Pipeline | `text-generation` |
| Rank de LoRA | 64 |
| Módulos objetivo | `all-linear` |
| Cadena / generación / rama | `inkling-oai-gen-mid` / `g1` / `b1` |
| Semilla gen-0 | Model Spec de OpenAI (resumen de 5k) |
| Régimen de entrenamiento | Midtrain únicamente (stage-1 LoRA SFT sobre corpus sintético de instanciación de la constitución) |
| Renderer y ajustes de evaluación | `tml_v0`, reasoning OFF, effort 0.0 |
| Receta bloqueada | LoRA r=64, lr 1e-4, coseno con 5% warmup, 1 época, batch 128, `max_length` 8192, semilla 42 |
| Tamaño del repositorio | 16,9 GB |
| Fecha de entrenamiento | 2026-09-16 |
| Fecha de exportación | 2026-09-18 (desde Tinker) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 64 aplicado sobre todos los módulos lineales del modelo base `thinkingmachines/Inkling-Small`. El pipeline de entrenamiento no modifica los pesos del base: cada generación de la cadena parte siempre del mismo modelo base y se ajusta sobre un corpus sintético de documentos que instancian una constitución. La constitución de esta generación (g1) se incluye en el repositorio como `training_seed_constitution.md`, y la semilla de la cadena completa procede del Model Spec de OpenAI en su versión resumida de 5k.

El mecanismo de iteración es el rasgo técnico más destacable: para generaciones N≥1, la constitución se obtiene elicitando al modelo de la generación N-1 de la misma rama, que escribe una constitución nueva; de un conjunto de 40 cadenas autogeneradas se selecciona la medoide del embedding con filtrado (gated embedding medoid). De este modo, la única vía de deriva entre generaciones es el texto de los documentos, no la actualización de pesos, lo que hace el experimento trazable y auditable. La receta está bloqueada (LoRA r=64, lr 1e-4, coseno con 5% de warmup, 1 época, batch 128, `max_length` 8192, semilla 42), lo que favorece la reproducibilidad entre ramas.

No se detalla en la información disponible la composición exacta del corpus sintético, el número de tokens de entrenamiento, ni si hubo etapas posteriores de RLHF o DPO. La model card indica explícitamente "midtrain only", es decir, únicamente la etapa 1 de SFT con LoRA. El adaptador se exportó desde Tinker y el repositorio incluye `tinker_meta.json` con el registro de exportación y la ruta original del sampler en Tinker.

## Capacidades

- Generación de texto: el repositorio declara el pipeline `text-generation`, por lo que el uso previsto es la generación de lenguaje natural condicionada por prompt.
- Instanciación de una constitución: el adaptador ha sido entrenado para reproducir el comportamiento descrito en un documento normativo concreto, incluido en el repositorio como `training_seed_constitution.md`.
- Escritura de constituciones: las generaciones posteriores de la cadena se apoyan en la capacidad del modelo para elicitar y redactar una constitución nueva; esta capacidad no está evaluada de forma pública.
- Autogeneración de corpus: uso previsto en el bucle de entrenamiento iterado, generando documentos que sirven de semilla a generaciones siguientes.
- Modo de razonamiento: la configuración de referencia indica `reasoning OFF` y `effort 0.0` con el renderer `tml_v0`; no se documenta un modo de pensamiento extendido obligatorio ni su efecto en la calidad.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Visión, audio u otras modalidades: no disponible (el pipeline declarado es únicamente de texto).
- Adaptabilidad composicional: al ser LoRA sobre un base fijo, es técnicamente posible combinarlo con otros adaptadores del mismo base, aunque no hay documentación sobre interoperabilidad con adaptadores de otras ramas de la cadena.

## Casos de uso

- Investigación en alineación constitucional: cargar el adaptador junto con `thinkingmachines/Inkling-Small` y comparar el comportamiento del modelo con y sin adaptador para medir cuánto del documento constitucional se refleja en las respuestas.
- Estudio de deriva entre generaciones: entrenar o evaluar las generaciones g1, g2, g3 de la misma rama y analizar cómo cambia el texto de las constituciones autogeneradas, aprovechando que la deriva solo se propaga por documentos y no por pesos.
- Comparación entre réplicas independientes: enfrentar esta rama `b1` con otras réplicas de la misma generación entrenadas con la misma semilla para estimar la varianza del procedimiento.
- Generación de corpus sintético normativo: usar el adaptador para producir documentos que instancien reglas de comportamiento, que después alimenten etapas de entrenamiento posteriores en un pipeline propio.
- Auditoría de adherencia a instrucciones jerárquicas: diseñar baterías de prompts que comprueben si el modelo respeta las prioridades definidas en `training_seed_constitution.md` cuando entran en conflicto varios requisitos del prompt.
- Red-teaming y evaluación de seguridad: probar si un conjunto de reglas escritas por un modelo se traduce en negativas o comportamientos concretos, como caso de estudio de constituciones autogeneradas frente a constituciones humanas.
- Docencia y experimentación con PEFT: por su naturaleza de adaptador de bajo rango, sirve como ejemplo práctico de carga con `peft.PeftModel.from_pretrained`, ajuste con receta fija y comparación de checkpoints sin necesidad de reentrenar el modelo base.
- Reproducibilidad de experimentos de Tinker: el repositorio incluye metadatos de exportación y el nombre de ejecución interna (`inkoaig1_inkoai_g1_b1_s1`), útil para replicar exactamente el mismo artefacto en una infraestructura equivalente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

| Categoría de evaluación | Resultado |
|---|---|
| MMLU y similares de conocimiento | No disponible |
| HumanEval / generación de código | No disponible |
| GSM8K / matemáticas | No disponible |
| Evaluaciones de adherencia a la constitución | No disponible |
| Evaluaciones comparativas con el modelo base | No disponible |

## Requisitos de hardware

- VRAM para el adaptador: el adaptador LoRA en sí es de bajo rango (r=64 sobre capas `linear`) y su huella es pequeña en relación con el modelo base, pero la model card no publica su tamaño exacto; el repositorio ocupa 16,9 GB, lo que sugiere que la exportación incluye más que las matrices de bajo rango (posiblemente pesos completos o artefactos intermedios). No es posible estimar la VRAM necesaria para servirlo sin conocer el tamaño del modelo base.
- VRAM para inferencia: depende íntegramente de `thinkingmachines/Inkling-Small`. Como referencia metodológica, en `bfloat16` se requieren aproximadamente 2 GB de VRAM por cada 1.000 millones de parámetros del base, y en cuantización de 4 bits alrededor de 0,5-0,7 GB por cada 1.000 millones, más la caché KV correspondiente a la ventana utilizada (hasta 8192 tokens según la receta de entrenamiento).
- GPU recomendadas: no disponibles al no conocerse el tamaño del base. Con carácter general, un base de hasta ~8.000 millones de parámetros en 4 bits es viable en GPU de consumo (RTX 3060 12 GB, RTX 4070 Ti, RTX 4090); para servir el modelo en `bfloat16` con concurrencia alta y ventanas de 8192 tokens serían necesarias A100 80 GB o H100.
- Cabe en GPU de consumo: no verificable con los datos disponibles; depende del base y del nivel de cuantización.
- Opciones de despliegue: `transformers` + `peft` (carga con `PeftModel.from_pretrained`, tal como documenta la model card), servidores con soporte de adaptadores LoRA en caliente como vLLM o TGI, y SGLang. Para `llama.cpp` u Ollama sería necesario fusionar el adaptador con el base y convertir a GGUF, ya que estos runtimes no cargan adaptadores PEFT directamente en su flujo estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ct-inkling-oai-gen-mid-g1-b1` | Adaptador LoRA sobre base fijo | No disponible (r=64, `all-linear`) | No disponible (entrenamiento a 8192) | No disponible | HuggingFace, 0 descargas |
| `thinkingmachines/Inkling-Small` (sin adaptador) | Modelo base | No disponible | No disponible | No disponible | Referenciado como base |
| Otras réplicas/ramas de la misma cadena (`...g1-b2`, `...g2-...`) | Adaptadores LoRA con la misma receta | No disponibles | No disponibles | No disponibles | No localizadas en la información proporcionada |
| Adaptadores LoRA genéricos de instrucción sobre modelos de tamaño pequeño | Adaptador LoRA | No disponibles | No disponibles | No disponibles | Categoría genérica, sin datos comparables |

No se dispone de resultados de rendimiento de ninguno de los elementos comparados, por lo que la comparación se limita a la naturaleza del artefacto, el tipo de licencia (no declarada en este caso) y su disponibilidad pública.

## Limitaciones y advertencias

- Falta de licencia: la model card no declara licencia para el adaptador. El uso comercial queda sin cobertura explícita y además está sujeto a la licencia del modelo base `thinkingmachines/Inkling-Small`, que debe consultarse por separado.
- Ausencia total de evaluación: no hay benchmarks, ni evaluaciones de seguridad, ni comparaciones publicadas con el modelo base. Cualquier uso en producción sería a ciegas.
- Artefacto de investigación: 0 descargas y 0 likes en el momento de la consulta, sin historial de uso ni validación por terceros.
- Deriva por documentos: el diseño del programa implica que la constitución cambia entre generaciones a través de textos autogenerados; esto puede introducir sesgos acumulativos o degradación semántica difíciles de detectar sin un protocolo de evaluación explícito.
- Corpus sintético y una sola época: el entrenamiento se realizó sobre documentos sintéticos durante 1 época con semilla fija, lo que aumenta el riesgo de sobreajuste al estilo del corpus y de comportamientos estereotipados.
- Riesgo de alucinación: no cuantificado; como en cualquier modelo generativo, existe, y la ausencia de evaluaciones impide acotarlo.
- Dependencia de configuración: la evaluación de referencia exige el renderer `tml_v0` con reasoning OFF y effort 0.0. Usar otra plantilla de prompt, otro renderer o activar razonamiento puede alterar por completo el comportamiento y romper la comparabilidad.
- Idiomas: no se especifican idiomas soportados; no hay garantía de calidad fuera del idioma o idiomas del corpus sintético.
- Limitación de contexto efectivo: la receta fija `max_length = 8192` durante el entrenamiento; la ventana real de inferencia del base no está documentada y el rendimiento más allá de 8192 tokens no está verificado.
- Formato de despliegue: requiere cargar el modelo base correcto y el adaptador por separado; fusionar, cuantizar o convertir a GGUF puede alterar el comportamiento y no está documentado por el autor.
- Trazabilidad parcial: el repositorio incluye `tinker_meta.json`, `training_seed_constitution.md` y una ruta interna de Tinker, pero no se detalla el corpus completo ni el proceso de filtrado de las 40 cadenas autogeneradas.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/arianaazarbal/ct-inkling-oai-gen-mid-g1-b1
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-Small
- Ficheros citados en la model card: `training_seed_constitution.md`, `tinker_meta.json` (incluidos en el repositorio del adaptador)
- Ruta interna de Tinker: `tinker://e7b1c7ae-b65c-5b1f-ac0f-ef63ed43bd7b:train:0/sampler_weights/inkoaig1_inkoai_g1_b1_s1_final`
- Programa y repositorio de referencia: `welfare-in-ai-rnd / constitutional_training` (citado en la model card; URL no disponible)
- Paper, blog o demo asociados: no disponible
- Nota sobre la búsqueda web: las consultas realizadas no devolvieron resultados relevantes sobre este modelo; los resultados obtenidos correspondían a páginas corporativas del grupo MultiChoice, sin relación con el artefacto.
