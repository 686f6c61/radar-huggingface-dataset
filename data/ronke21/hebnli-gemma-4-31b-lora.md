# ronke21/hebnli-gemma-4-31b-lora

## Resumen

`ronke21/hebnli-gemma-4-31b-lora` es un adaptador LoRA que especializa el modelo base `google/gemma-4-31B` en inferencia de lenguaje natural (NLI) de tres clases para hebreo, entrenado sobre el corpus HebNLI. Lo publica Ron Keinan (usuario `ronke21`) como artefacto asociado al artículo HeRE (Hebrew Relation Extraction), presentado en IJCNLP-AACL 2026, donde este adaptador actua como uno de los desruidificadores ("denoisers") de la Estrategia 2 del pipeline. El adaptador no es un modelo autonomo: requiere cargar el modelo base Gemma-4-31B y superponerle los pesos PEFT.

El problema que resuelve es acotado pero concreto: clasificar pares premisa-hipotesis en hebreo en tres categorias (היסק = implicacion, סתירה = contradiccion, ניטרלי = neutral) con una calidad que el autor situa en 0.905 de macro-F1 en test de HebNLI. La relevancia practica esta en que el hebreo es un idioma con poca cobertura en benchmarks de NLI y en que el adaptador demuestra que un LLM grande con un LoRA de rango bajo y prompt fijo puede alcanzar rendimiento competitivo sin fine-tuning completo.

El adaptador es pequeno (0.6 GB en el repositorio) frente a los aproximadamente 31 mil millones de parametros del modelo base, lo que lo hace facil de distribuir, pero su coste real de inferencia viene determinado por el modelo base completo en bfloat16. La licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only `google/gemma-4-31B` |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 31B segun su denominacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en bfloat16; el modelo base admite las cuantizaciones que soporte Gemma-4-31B) |
| Idiomas soportados | hebreo (`he`) |
| Licencia | Apache 2.0 (heredada del modelo base; requiere aceptar los terminos de Gemma-4-31B) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA), cargable con la libreria `peft` |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 32 aplicado sobre todas las matrices de proyeccion lineal del modelo base, en bfloat16. No modifica la arquitectura del transformer subyacente: se superpone a `google/gemma-4-31B` mediante `PeftModel`. La tarea se formula como generacion condicionada por una plantilla fija en hebreo (`משפט 1: {premise} משפט 2: {hypothesis}`), y la etiqueta se lee del primer token generado entre tres candidatos (היסק, סתירה, ניטרלי). En el contexto de HeRE, la puntuacion suave se deriva de las log-probabilidades del primer token de cada una de las tres etiquetas, lo que permite usar el adaptador como clasificador probabilistico y no solo como generador discreto.

El entrenamiento uso tasa de aprendizaje 5e-5, tamano de lote 16 y hasta 8.000 pasos, reteniendo el checkpoint con mejor macro-F1 de validacion (paso 7.920). Fue una unica ejecucion con semilla 42. No se documentan en la informacion disponible el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO; el autor solo indica que se entrena sobre HebNLI. La innovacion tecnica destacable es metodologica: el uso del adaptador como desruidificador dentro de un pipeline de alineamiento de grafos de conocimiento para construir el benchmark HeRE, no una innovacion arquitectonica del propio LoRA.

## Capacidades

- Clasificacion NLI de tres clases en hebreo: implicacion, contradiccion y neutralidad sobre pares premisa-hipotesis.
- Generacion de la etiqueta como primer token, con plantilla de prompt fija en hebreo.
- Puntuacion probabilistica por clase mediante log-probabilidades del primer token de cada etiqueta (uso como desruidificador en HeRE).
- Integracion con el ecosistema Hugging Face Transformers y PEFT (`AutoModelForCausalLM` + `PeftModel`).
- Capacidades generales del modelo base (generacion de texto, razonamiento, codigo) teoricamente presentes, pero no evaluadas ni documentadas para este adaptador.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito para este adaptador.
- Capacidad multilingue: el adaptador esta entrenado y etiquetado solo para hebreo; su comportamiento en otros idiomas no esta documentado.

## Casos de uso

- Clasificacion de pares de frases en hebreo para sistemas de verificacion de hechos: dado un enunciado y una afirmacion candidata, el adaptador devuelve implicacion, contradiccion o neutralidad, lo que permite filtrar afirmaciones no respaldadas antes de una revision humana.
- Desruidificacion de alineamientos en grafos de conocimiento en hebreo: tal como se usa en HeRE, el adaptador puntua pares de relaciones candidatas y descarta alineamientos contradictorios o neutrales, mejorando la precision de la extraccion de relaciones.
- Deteccion de contradicciones en documentacion legal o administrativa en hebreo: comparar clausulas o declaraciones entre documentos y senalar pares incompatibles para revision.
- Filtrado de datasets de entrenamiento en hebreo: identificar pares de frases con relacion de implicacion para construir corpus de pares positivos, o descartar contradicciones en tareas de parafrasis.
- Evaluacion de sistemas de resumen o traduccion en hebreo: comprobar si el resumen implica la informacion de la fuente (entailment-based evaluation) mediante la puntuacion de implicacion.
- Moderacion y coherencia de respuestas en asistentes conversacionales en hebreo: verificar que una respuesta generada no contradice el contexto previo de la conversacion usando el par contexto-respuesta como premisa-hipotesis.
- Investigacion en PLN semitico: punto de partida reproducible (semilla 42, hiperparametros documentados) para comparar estrategias de adaptacion de LLM en hebreo.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| HebNLI dev macro-F1 | 0,870 |
| HebNLI test macro-F1 | 0,905 |
| HeRE gold validation F1 | 0,849 (Estrategia 2, hipotesis de plantilla) |

No se han publicado en la informacion disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni en otros benchmarks estandar, ni cifras de latencia o throughput.

## Requisitos de hardware

- El adaptador en si ocupa 0.6 GB, pero la inferencia exige cargar `google/gemma-4-31B` completo en bfloat16, lo que en la practica requiere alrededor de 62 GB de VRAM solo para pesos, mas memoria para activaciones y cache KV.
- GPU recomendadas para bfloat16 sin cuantizar: A100 80 GB, H100 80 GB o configuraciones multi-GPU (por ejemplo, 2x A100 40 GB con `device_map="auto"`).
- No cabe en GPU de consumo (RTX 4090 de 24 GB, RTX 3090 de 24 GB) en bfloat16; requeriria cuantizacion del modelo base a 8 o 4 bits, no documentada para este adaptador.
- Despliegue: el ejemplo del autor usa `transformers` con `device_map="auto"` y `peft`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este adaptador concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de resultados de otros adaptadores o modelos de NLI en hebreo con los que comparar parametros, contexto, rendimiento y licencia. La unica referencia cuantitativa es el propio modelo base evaluado en HeRE (F1 de validacion 0,849 en la Estrategia 2 con hipotesis de plantilla), que coincide con el resultado del adaptador en esa misma configuracion segun la tabla del autor, sin que se detalle la comparacion entre ambos.

| Modelo | Parametros | Contexto | HebNLI test macro-F1 | Licencia |
|---|---|---|---|---|
| ronke21/hebnli-gemma-4-31b-lora | LoRA sobre 31B | no disponible | 0,905 | Apache 2.0 |
| Alternativas de NLI en hebreo | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El adaptador no es autonomo: sin el modelo base `google/gemma-4-31B` no funciona, y su uso exige aceptar los terminos de dicho modelo.
- Entrenado con una unica ejecucion y una sola semilla (42); no hay estimacion de varianza ni de robustez entre ejecuciones.
- El prompt esta fijado a una plantilla concreta en hebreo; desviarse de ella puede degradar el rendimiento de forma no documentada.
- Solo cubre hebreo y la tarea NLI de tres clases; no se ha evaluado su comportamiento en otros idiomas ni en otras tareas.
- Riesgo de alucionacion y de calibracion deficiente en las probabilidades del primer token, especialmente fuera de la distribucion de HebNLI; el autor no publica analisis de calibracion.
- Sesgos: no se documentan analisis de sesgos del adaptador ni del corpus HebNLI.
- La licencia Apache 2.0 se hereda del modelo base; conviene verificar los terminos de uso de Gemma-4-31B para uso comercial antes de desplegarlo en produccion.
- El repositorio tiene muy poca traccion (9 descargas, 0 likes en el momento de la consulta), por lo que no hay validacion independiente de los resultados reportados.
- Para produccion, el coste de servir un modelo de 31B en bfloat16 es alto; no se documentan recetas de cuantizacion que preserven el rendimiento del adaptador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ronke21/hebnli-gemma-4-31b-lora
- Modelo base: https://huggingface.co/google/gemma-4-31B
- Dataset HeRE: https://huggingface.co/datasets/ronke21/HeRE
- Codigo HeRE: https://github.com/Ronke21/HeRE
- Repositorio HebNLI: https://github.com/NNLP-IL/HebNLI
- Paper HeRE (ACL Anthology): https://aclanthology.org/2026.aacl-long.237/
- DOI del paper: https://doi.org/10.18653/2026.aacl-long.237
