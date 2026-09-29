# Nurymanau/LFM2.5-350M-Halo-Structured-Output-Research

## Resumen

LFM2.5-350M-Halo-Structured-Output-Research es un conjunto de adaptadores LoRA publicados por el usuario independiente Nurymanau sobre el modelo congelado LiquidAI/LFM2.5-350M, orientados a la generación de salidas estructuradas (JSON, YAML y extracción de campos). No se trata de un modelo nuevo ni de un lanzamiento oficial de Liquid AI: es un artefacto de investigación que documenta tanto resultados positivos como negativos al aplicar GRPO en línea con la implementación Halo de White Circle sobre un modelo de 350M de parámetros.

El adaptador por defecto contiene 5.996.544 parámetros FP32 (184 tensores, unos 24 MB) con LoRA de rango 16 y alpha 32, y se apoya en el checkpoint instruction-tuned de LFM2.5-350M en su revisión 9e6c6ccf47cd318696e137d381a7ded8fe4df09f. El modelo base emplea la arquitectura LFM2, un híbrido de convoluciones y atención con 32.000 tokens de contexto y capacidades declaradas de tool calling, pensado para dispositivos con restricciones estrictas de memoria y cómputo.

Su relevancia es metodológica más que de rendimiento: el autor publica el protocolo completo, las semillas, los intervalos de confianza por bootstrap emparejado, los ledgers de decisión y el coste real de GPU (9,88 dólares en total, 6,24 para la fase 2). El piloto mejoró IFStruct de 440/2000 a 555/2000, pero la continuación con receta mixta no fue fiable: las semillas 42 y 43 produjeron 434/2000 y 543/2000 frente a una línea base emparejada de 444/2000. Es, por tanto, un caso de estudio sobre reproducibilidad y varianza entre semillas en RL a pequeña escala, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre LFM2.5-350M; el base usa la arquitectura LFM2, híbrida de convoluciones y atención |
| Parametros totales | 5.996.544 en el adaptador (FP32, 184 tensores) más 350M del modelo base congelado |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 32.000 tokens, heredada del modelo base según la documentación de vLLM Recipes |
| Tipos de cuantizacion | Adaptador exportado en FP32; no se especifican cuantizaciones propias ni del base en la información disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | lfm-open-license-v1.0 (etiquetada como license: other en el repositorio) |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA); el repositorio también incluye MANIFEST.json, NOTICE.md y scripts en Python |

Otros datos del repositorio: tamaño de 0,1 GB, librería peft, pipeline text-generation, 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 29 de septiembre de 2026. El adaptador está entrenado con LoRA de rango 16 y alpha 32; los bytes de los pesos originales no se modificaron, solo se sustituyó en los metadatos exportados la ruta de la máquina de entrenamiento por el identificador público del modelo base y su revisión exacta.

## Arquitectura y entrenamiento

El artefacto es una colección de cuatro adaptadores, no un modelo completo. La raíz del repositorio contiene el checkpoint fijo del primer piloto (semilla 42, receta original, 100 pasos); en variants/phase2-selected está la receta mixta seleccionada sobre un conjunto de desarrollo separado antes de la evaluación final (semilla 42, 100 pasos de piloto más 50 mixtos); variants/phase2-repeat es la repetición independiente del procedimiento seleccionado (semilla 43, 100 pasos originales frescos más 50 mixtos); y variants/phase2-json-control es un comparador de continuación solo para desarrollo, sin evaluación final en IFStruct. Las continuaciones cargan el adaptador de forma exacta pero reinician el optimizador y el planificador de tasa de aprendizaje, por lo que no son una continuación pura del entrenamiento.

El método es GRPO en línea con Halo (commit 425f04103eedbeb3ea1a6f7fa6d142ed02c9b7a8), usando una GPU para el entrenador y otra distinta con vLLM para la generación; no se evaluó ninguna implementación con una sola GPU. El piloto usó 476 ejemplos de entrenamiento y 61 de desarrollo durante 100 pasos. La fase 2 amplió a 1.208 ejemplos de entrenamiento y 186 de desarrollo, añadiendo tareas JSON/YAML y extracción sintética. Los conjuntos de datos declarados son nvidia/Nemotron-RL-instruction_following-structured_outputs y LiquidAI/ifstruct-v1.0, aunque IFStruct se usó exclusivamente como benchmark de evaluación, nunca como datos de entrenamiento, entrada de recompensa ni señal de selección de receta. La fase 2 combinó simultáneamente cambios de datos y de recompensa, de modo que no aísla sus efectos causales.

## Capacidades

- Generación de texto en inglés con el modelo base LFM2.5-350M congelado, al que se superpone el adaptador.
- Producción de salidas estructuradas: objetos JSON y YAML con formato, tipos y serialización controlados.
- Extracción de campos desde texto libre: en la prueba sintética de extracción, el adaptador seleccionado devolvió el objeto exacto (forma y tipos incluidos) en 64 de 64 casos.
- Cumplimiento de instrucciones estructurales a nivel de prompt de sistema (comillas de código, serialización, forma del objeto).
- Capacidad declarada de tool calling y function calling en el modelo base, aunque el autor indica explícitamente que este adaptador no está validado como modelo de tool calling.
- Soporte multilingüe limitado al inglés, según la etiqueta de idioma del repositorio.
- Compatibilidad con el ecosistema PEFT y vLLM para despliegue y evaluación.
- No se documentan capacidades de visión, audio ni modos de razonamiento extendido (thinking) específicos de este adaptador.

## Casos de uso

- Generación de JSON con esquema fijo en servicios backend: el adaptador piloto subió del 17,7 % al 30,2 % de éxito estricto en la partición JSON de IFStruct (177/1000 a 302/1000), lo que lo hace útil como punto de partida para APIs que necesitan respuestas parseables sin post-procesado agresivo.
- Extracción de entidades y campos en pedidos o formularios: en la prueba sintética de extracción con 32 pedidos en dos formatos, la variante seleccionada alcanzó 64/64 objetos exactos frente a 26/64 del base, un escenario típico de digitalización de documentos.
- Investigación sobre RL a pequeña escala: el repositorio incluye ledgers, MANIFEST.json, NOTICE.md y code/verify_release.py, lo que permite reproducir el análisis estadístico y auditar las decisiones sin alquilar GPU.
- Estudio de varianza entre semillas en GRPO: las semillas 42 y 43 del mismo procedimiento dieron resultados opuestos (434 y 543 sobre 2000), un caso práctico para diseñar protocolos de evaluación con réplicas independientes.
- Comparación de frameworks de RL: sirve como referencia metodológica frente a recetas con TRL, aunque el autor aclara que no se realizó ninguna comparación de velocidad entre Halo y TRL.
- Prototipado en dispositivos de borde: al ser un adaptador de 24 MB sobre un modelo de 350M, puede ejecutarse en hardware muy limitado para tareas de formateo y extracción, siempre que se acepte su alcance estrecho.
- Docencia y formación técnica: el historial de resultados positivos y negativos, con intervalos de confianza por bootstrap emparejado, es material adecuado para explicar por qué una mejora puntual no implica una mejora robusta.

## Benchmarks y rendimiento

Resultados reportados en IFStruct (éxito estricto; requiere que pasen todas las condiciones del evaluador, no es una medida de corrección semántica general):

| Experimento / brazo | JSON /1000 | YAML /1000 | Total /2000 |
|---|---:|---:|---:|
| Línea base del piloto | 177 | 263 | 440 (22,00 %) |
| Piloto, paso 100 | 302 | 253 | 555 (27,75 %) |
| Línea base de la fase 2 | 180 | 264 | 444 (22,20 %) |
| Fase 2 seleccionada, semilla 42 | 281 | 153 | 434 (21,70 %) |
| Fase 2 repetida, semilla 43 | 273 | 270 | 543 (27,15 %) |

El piloto supone +5,75 puntos porcentuales, con 236 éxitos nuevos y 121 regresiones; su intervalo de confianza del 95 % por bootstrap emparejado de tareas es [+3,95, +7,60] puntos. La variante seleccionada de fase 2 queda en −0,50 puntos [−2,60, +1,65] y la repetición en +4,95 puntos [+3,00, +6,95]. El autor advierte que estos intervalos remuestrean tareas de test y no miden la incertidumbre entre semillas de entrenamiento, y que piloto y fase 2 usaron modelos de GPU distintos, por lo que cada adaptador debe compararse con su propia línea base emparejada.

Resultados en el conjunto de desarrollo de la fase 2 (éxitos estrictos): 13/186 con el base, 57/186 con el piloto de 100 pasos, 87/186 con la continuación JSON, 94/186 con la receta mixta seleccionada y 38/186 con la repetición. La selección se hizo con un criterio predeclarado de ganancia macro de al menos 2 puntos en cuatro categorías y una pérdida máxima de 5 puntos por categoría; la repetición independiente fue solo informativa.

Prueba de extracción sintética retenida (32 pedidos en inglés, dos formatos):

| Modelo | Todos los requisitos /64 | Objeto exacto, forma y tipos /64 |
|---|---:|---:|
| Base | 5 | 26 |
| Piloto, paso 100 | 33 | 64 |
| Fase 2 seleccionada | 64 | 64 |
| Fase 2 repetida | 22 | 64 |

El autor señala que las variantes entrenadas ya devolvían los objetos exactos y que las diferencias en la puntuación estricta reflejan sobre todo instrucciones de serialización y de vallas de código, no razonamiento general ni capacidad de uso de herramientas.

## Requisitos de hardware

- El adaptador ocupa unos 24 MB en FP32 (5.996.544 parámetros, 184 tensores), por lo que el peso del modelo completo lo determina el base de 350M.
- Estimación orientativa de VRAM para el base, derivada del número de parámetros y no de mediciones publicadas: en torno a 0,7-1 GB en FP16/BF16 y alrededor de 0,3-0,4 GB en cuantizaciones de 4 bits. Son cálculos aritméticos, no cifras verificadas en este repositorio.
- Cabe en cualquier GPU de consumo actual e incluso en iGPUs y CPU, dado el tamaño del base y su orientación explícita a dispositivos de borde.
- Opciones de despliegue: PEFT sobre transformers para cargar el adaptador, vLLM (existe una receta publicada para LiquidAI/LFM2.5-350M, con soporte de tool calling y 32K de contexto) y formatos GGUF/llama.cpp u Ollama si se dispone de una conversión del base, extremo no confirmado en la información disponible.
- El autor entrenó con dos GPU: una para el entrenador y otra con vLLM para la generación. No se evaluó ninguna implementación con una sola GPU.
- Latencia y throughput concretos: no disponibles en la información proporcionada. Los scripts de CPU incluidos usan FP32 y el autor advierte que no son reproducciones de paridad numérica de las mediciones hechas en GPU con BF16.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | IFStruct /2000 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-350M (base congelado) | 350M | 32.000 | 440 y 444 en las dos líneas base | lfm-open-license-v1.0 | HuggingFace, oficial de Liquid AI |
| Este adaptador (piloto, paso 100) | 350M + 5,99M LoRA | 32.000 | 555 (+5,75 pp, IC 95 % [+3,95, +7,60]) | lfm-open-license-v1.0 | HuggingFace, repositorio de investigación |
| variants/phase2-repeat (semilla 43) | 350M + 5,99M LoRA | 32.000 | 543 (+4,95 pp, IC 95 % [+3,00, +6,95]) | lfm-open-license-v1.0 | HuggingFace, misma raíz del repositorio |
| variants/phase2-selected (semilla 42) | 350M + 5,99M LoRA | 32.000 | 434 (−0,50 pp, IC 95 % [−2,60, +1,65]) | lfm-open-license-v1.0 | HuggingFace, misma raíz del repositorio |
| Ajuste de 350M con GRPO e IFStruct descrito en el blog de TRL | 350M (según el título del blog) | No disponible | No disponible | No disponible | Blog público en HuggingFace |

No se dispone de comparaciones con otros adaptadores de salida estructurada del mismo tamaño, ni de datos de LFM2-350M (la generación anterior) en la información proporcionada. Tampoco se realizó ninguna comparación de velocidad entre Halo y TRL, según declara el propio autor.

## Limitaciones y advertencias

- Artefacto de investigación, no un lanzamiento oficial de Liquid AI ni de White Circle, y sin ninguna reclamación de estado del arte.
- Resultado no reproducible de forma fiable: dos semillas de la misma receta dieron +4,95 y −0,50 puntos porcentuales, por lo que la mejora depende fuertemente de la semilla.
- Los intervalos de confianza publicados remuestrean tareas de test, no semillas de entrenamiento, y no capturan la varianza del proceso de entrenamiento.
- IFStruct ya se había usado como benchmark en el piloto, por lo que no es un conjunto retenido completamente nuevo; además, se usó solo para evaluación, no para entrenamiento ni como señal de recompensa.
- Doce de los 61 prompts estructurales de desarrollo conservaban una petición explícita de array JSON a nivel de usuario que entraba en conflicto con la petición de sistema en YAML añadida en la fase 2; la evaluación congelada no se reescribió tras detectarlo.
- La fase 2 mezcló cambios de datos y de recompensa, así que no permite atribuir causalidad a ninguno de los dos.
- La prueba de extracción se hizo con 32 pedidos sintéticos en inglés; no establece razonamiento general, preparación para producción ni capacidad de uso de herramientas.
- Solo inglés. No se documentan capacidades multilingües, de visión ni de audio en el adaptador.
- El repositorio no valida el modelo como herramienta de tool calling, pese a que el base sí declara esa capacidad.
- Riesgo de alucinación y de incumplimiento de esquema fuera de la distribución de entrenamiento: no se han auditado duplicados semánticos cercanos, solo particiones exactas y normalizadas.
- Los ficheros de receta antiguos contienen etiquetas inertes (checkpoint=step100, runtime=unverified) heredadas de la preparación; el linaje real de los adaptadores de fase 2 es 100+50 y esas etiquetas no controlaban la carga del modelo.
- Los ledgers públicos contienen metadatos de decisión, no prompts ni respuestas en crudo, de modo que la verificación solo comprueba aritmética y emparejamiento.
- Los scripts de CPU en FP32 no reproducen numéricamente las mediciones hechas en GPU con BF16.
- Licencia lfm-open-license-v1.0: el repositorio la etiqueta como license: other y no se detallan aquí sus condiciones de uso comercial, que deben consultarse en el texto de la licencia antes de cualquier explotación.
- El coste publicado (9,88 dólares, de los cuales 6,24 en la fase 2) es una estimación por tiempo de alquiler y tarifas citadas, no una factura del proveedor ni una garantía de precio futuro.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/Nurymanau/LFM2.5-350M-Halo-Structured-Output-Research
- Modelo base LiquidAI/LFM2.5-350M: https://huggingface.co/LiquidAI/LFM2.5-350M
- Blog de Liquid AI sobre LFM2.5-350M: https://www.liquid.ai/blog/lfm2-5-350m-no-size-left-behind
- Documentación de Liquid AI para LFM2.5-350M: https://docs.liquid.ai/lfm/models/lfm25-350m
- Receta de vLLM para LiquidAI/LFM2.5-350M: https://recipes.vllm.ai/LiquidAI/LFM2.5-350M
- Blog de TRL sobre ajuste de un modelo de 350M para salidas estructuradas con 100 pasos de GRPO: https://huggingface.co/blog/grpo-with-trl-ifstruct
- Repositorio de Halo (White Circle): no disponible en la información proporcionada; el autor cita el commit 425f04103eedbeb3ea1a6f7fa6d142ed02c9b7a8
- Ficheros internos relevantes del repositorio: MANIFEST.json, NOTICE.md, LICENSE y code/verify_release.py
