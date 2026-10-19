# Davd-b01/qwen38-27b-swift-noema

## Resumen

Davd-b01/qwen38-27b-swift-noema es un merge de pesos publicado en HuggingFace por el usuario Davd-b01 el 19 de octubre de 2026. Se construye por aritmética de tareas (task arithmetic) sobre tres repositorios: el modelo base Qwen/Qwen3.8-27B (revisión `1d4bf0f2…`), el delta de sabicap/sabi-noema (revisión `c12b2070…`) y el delta de ukisai/Swift-1.5-Qwen3.8-27b (revisión `b4c84d42…`). La receta declarada es `ta_noema1_swift015`, con escala 1,0 para el delta Noema y 0,15 para el delta Swift.

El modelo cuenta con 27.356.728.560 parámetros según los tensores en safetensors (27,36 mil millones), lo que lo sitúa en la categoría de modelos densos de ~27B. El repositorio ocupa 54,7 GB y solo distribuye pesos en formato safetensors. La hipótesis declarada por el autor es preservar la actualización Noema en lugar de atenuarla como haría una interpolación convexa; el propio autor indica explícitamente que no se trata de una mejora validada.

Es relevante ahora por su valor como caso de estudio de ingeniería de merges más que como modelo listo para producción: el autor documenta con precisión la receta, las fuentes con revisiones fijadas, los hashes SHA-256 de los manifiestos de validación, y admite que la validación en tiempo de ejecución está pendiente y que la modificación solicitada (abliteración) no se logró. No hay pipeline declarado, cero descargas, cero likes y no se han publicado resultados de benchmarks estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso derivado de Qwen/Qwen3.8-27B (tag de libreria: `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 27.356.728.560 (27,36 B) |
| Parametros activos | No aplica: merge sobre modelo denso (ruta de manifiesto `qwen38_dense_merge`) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio solo publica safetensors sin cuantizar. La conversion a INT8/INT4 requeriria herramientas externas |
| Idiomas soportados | No disponible |
| Licencia | `swift-open-license-v1` (campo `license: other`); se incluyen sin modificar la licencia Apache-2.0 y los avisos upstream |
| Formato de pesos | safetensors (repositorio de 54,7 GB) |

## Arquitectura y entrenamiento

El modelo no se entrena desde cero: es un merge de pesos por aritmética de tareas. La receta `ta_noema1_swift015` aplica el delta del adaptador Noema con escala 1,0 (preservacion integra) y el delta del adaptador Swift con escala 0,15 (atenuacion fuerte), sumandolos sobre el checkpoint base Qwen3.8-27B. La hipótesis del autor es que preservar la actualizacion Noema completa, en lugar de diluirla mediante interpolacion convexa, conserva mejor el comportamiento de ese adaptador; el propio autor etiqueta esta hipotesis como "no una mejora validada".

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si hubo RLHF, DPO o cualquier etapa de alineamiento posterior, ya que el merge no introduce entrenamiento nuevo. Respecto a la abliteracion, el campo `abliteration_outcome` vale `explicit_skip` y `requested_modification_achieved` es `false`: la modificacion solicitada no se aplico y el autor lo declara abiertamente. La validacion en runtime esta marcada como pendiente (`runtime_validation_pending: true`) y el equipo de destino no ha verificado la ejecucion. Se incluyen dos hashes SHA-256 de manifiestos de validacion (`2a91045e…` para el manifiesto de alta precision y `9007f705…` para el informe final del checkpoint), ambos con rutas locales del autor que no son accesibles publicamente.

## Capacidades

- Generacion de texto y razonamiento: capacidades heredadas del modelo base Qwen3.8-27B; no verificadas de forma independiente en este merge.
- Codigo y matematicas: no hay evaluacion publicada que lo confirme para esta combinacion concreta de deltas.
- Tool calling y function calling: no documentado en la model card; dependeria del soporte del base y de que el merge no lo haya degradado.
- Capacidades de agente y razonamiento multi-paso: no documentadas ni evaluadas.
- Capacidades multilingues: no disponibles; el campo de idiomas no esta informado en HuggingFace.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Preservacion del comportamiento del adaptador Noema: es la unica capacidad que el autor declara como objetivo del merge, sin validacion estadistica que lo respalde.

## Casos de uso

- Investigacion sobre tecnicas de merge: el modelo sirve como artefacto reproducible para estudiar el efecto de escalas asimetricas (1,0 frente a 0,15) en aritmetica de tareas, ya que las tres fuentes estan fijadas por revision y los manifiestos llevan hash.
- Auditoria de linaje de pesos: util para equipos que necesitan reconstruir la cadena de custodia de un modelo derivado, dado que la model card documenta base, deltas, revisiones y resultado de abliteracion de forma explicita.
- Experimentos de evalucion de safety tras un skip de abliteracion: al declararse `explicit_skip`, permite medir si un merge sin ablacion conserva los rechazos del base, aunque no hay resultados publicados al respecto.
- Procesamiento de texto por lotes en local: con 27,36 B de parametros y pesos BF16, un despliegue en una A100 80 GB permite tareas de generacion y resumen offline, siempre que se valide antes la calidad del merge.
- Base para comparaciones controladas frente a Qwen3.8-27B original: mismo tamano y misma familia permiten aislar el efecto de los deltas Noema y Swift en pruebas de regresion propias.
- Prototipado interno de asistentes conversacionales: solo en entornos donde la licencia `swift-open-license-v1` se haya revisado juridicamente y se acepte la ausencia de validacion en runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K, MBPP ni de evaluaciones de contexto largo. El autor rechaza explicitamente cualquier afirmacion de superioridad sobre el modelo padre o de reproduccion estadistica (`No parent-superiority, statistical2pp or fullGSQ/Swift reproduction claim`).

El unico dato cuantitativo es la comprobacion de ingenieria declarada, que no constituye un benchmark:

| Prueba | Resultado |
|---|---|
| Casos de confirmacion | 32 |
| PASS | 21 |
| FAIL | 11 |
| INCONCLUSO | 0 |
| Resultado declarado | `accepted_engineering_confirmation` |
| Etiqueta de metodo | no disponible (`null`) |
| Evaluacion funcional | no disponible (`null`) |
| KL por dominio | no disponible (`null`) |

La propia model card califica esta comprobacion como "solo verificacion de ingenieria", sin afirmacion estadistica ni comparacion ciega fresca.

## Requisitos de hardware

Estimaciones calculadas a partir del recuento real de parametros (27,36 B); no son mediciones publicadas por el autor.

- VRAM en BF16/FP16: 54,7 GB solo de pesos, mas overhead de activaciones y KV cache; presupuestar 60-70 GB.
- VRAM en INT8: aproximadamente 27,4 GB de pesos; presupuestar 30-35 GB.
- VRAM en INT4: aproximadamente 13,7-15 GB de pesos; presupuestar 16-20 GB.
- GPU de datacenter recomendadas: A100 80 GB o H100 80 GB en BF16 con una sola tarjeta; 2x A100 40 GB con sharding de tensor.
- GPU consumer: en BF16 no cabe en ninguna consumer actual de 24 GB. En INT4 podria caber en RTX 4090 (24 GB) o RTX 5090 (32 GB), siempre con conversion previa a GGUF/AWQ/GPTQ.
- Despliegue: vLLM, TGI o SGLang pueden cargar los safetensors directamente. llama.cpp y Ollama requeririan convertir primero a GGUF, y el repositorio no publica ninguna cuantizacion.
- Latencia y throughput: no disponibles. No hay mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Observaciones |
|---|---|---|---|---|---|
| Davd-b01/qwen38-27b-swift-noema | 27,36 B | no disponible | swift-open-license-v1 | safetensors | Merge derivado; validacion en runtime pendiente; 0 descargas |
| Qwen/Qwen3.8-27B (base) | no disponible en la informacion | no disponible | no disponible en la informacion | no disponible | Fuente del merge, revision `1d4bf0f2…` |
| sabicap/sabi-noema | no disponible en la informacion | no disponible | no disponible en la informacion | no disponible | Delta Noema aplicado a escala 1,0, revision `c12b2070…` |
| ukisai/Swift-1.5-Qwen3.8-27b | no disponible en la informacion | no disponible | no disponible en la informacion | no disponible | Delta Swift aplicado a escala 0,15, revision `b4c84d42…` |

No se dispone de datos de rendimiento de ninguno de los cuatro modelos en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Validacion en tiempo de ejecucion pendiente: el autor indica que el equipo de destino no ha validado el modelo; no hay garantia de que los pesos carguen y generen texto coherente.
- La modificacion solicitada no se logro: `requested_modification_achieved: false` y `abliteration_outcome: explicit_skip`. Si el objetivo era eliminar mecanismos de rechazo, ese objetivo no se cumple.
- Sin datos de sesgo, toxicidad ni alucinacion. No hay evaluaciones de seguridad publicadas.
- Resultado de validacion flojo: 11 fallos sobre 32 comprobaciones (34,4 %), y el propio autor lo califica como comprobacion de ingenieria, no como evaluacion funcional.
- Sin benchmark de referencia: cualquier afirmacion de calidad relativa al base Qwen3.8-27B carece de respaldo en la informacion disponible.
- Contexto e idiomas no documentados: no se puede planificar un despliegue que dependa de una ventana concreta o de cobertura multilingue.
- Licencia no estandar: `swift-open-license-v1` bajo el paraguas `license: other`, con Apache-2.0 y avisos upstream incluidos sin modificar. Requiere revision juridica antes de uso comercial; no se especifican restricciones concretas en la informacion disponible.
- Solo safetensors: no hay GGUF, AWQ ni GPTQ publicados, lo que anade trabajo de conversion para despliegues en consumer.
- Repositorio sin traccion: 0 descargas y 0 likes, lo que reduce la probabilidad de que alguien haya reportado fallos o validado el modelo de forma independiente.
- Manifiestos de validacion referenciados con rutas locales del autor (`/home/oscar/...`), no accesibles para terceros; solo se verifican sus hashes, no su contenido.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Davd-b01/qwen38-27b-swift-noema
- Modelo base citado: https://huggingface.co/Qwen/Qwen3.8-27B (revision `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`)
- Delta Noema citado: https://huggingface.co/sabicap/sabi-noema (revision `c12b20707bb78f811c80bc46561117528ddbd221`)
- Delta Swift citado: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b (revision `b4c84d42903a8646b25857eb2827288d92ed85a4`)
- Paper, blog, repositorio de codigo o demo: no disponibles en la informacion proporcionada.
