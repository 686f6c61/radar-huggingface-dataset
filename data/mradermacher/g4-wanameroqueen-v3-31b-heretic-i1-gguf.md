# mradermacher/G4-WanaMeroQueen-v3-31B-heretic-i1-GGUF

## Resumen

El repositorio `mradermacher/G4-WanaMeroQueen-v3-31B-heretic-i1-GGUF` es una publicación de cuantizaciones GGUF del modelo `vulture3/G4-WanaMeroQueen-v3-31B-heretic`, generadas por el usuario mradermacher, conocido por distribuir versiones cuantizadas de modelos de terceros para su uso con llama.cpp y el ecosistema GGUF. El modelo cuenta con 30.697.345.596 parámetros (~30,7 mil millones), según los metadatos del propio repositorio, y el espacio ocupado por el conjunto de ficheros publicados es de 44,1 GB.

Se trata, por tanto, de un artefacto de despliegue más que de un modelo nuevo: el repositorio no documenta la arquitectura, el entrenamiento, el contexto ni la licencia del modelo original. La model card se limita a indicar que se trata de cuantizaciones "weighted/imatrix" del modelo base enlazado, e incluye la lista de tipos de cuantización generados. Las etiquetas del repositorio son `gguf`, `endpoints_compatible`, `region:us`, `imatrix` y `conversational`.

Su relevancia actual es práctica: permite ejecutar un modelo de ~30,7B parámetros en hardware de consumo o en servidores modestos mediante cuantizaciones que van desde ~1,5-2 bits por peso hasta 6 bits, a costa de degradación en la calidad. No obstante, la ausencia total de documentación técnica, de licencia declarada y de datos de evaluación limita seriamente su idoneidad para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (no se documenta en el repositorio) |
| Parametros totales | 30.697.345.596 (~30,7 mil millones) |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K, Q2_K_S, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_NL (small), IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (cuantizaciones imatrix/weighted generadas con llama.cpp) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base `vulture3/G4-WanaMeroQueen-v3-31B-heretic`. El repositorio analizado no incluye detalles sobre el tipo de red (transformer, MoE, híbrida), la composición del dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de ajuste como RLHF, DPO o variantes de alineación.

El único dato técnico verificable es el proceso de cuantización: se trata de cuantizaciones "weighted/imatrix", es decir, generadas usando una matriz de importancia (imatrix) calculada a partir de un corpus de calibración para minimizar el error de cuantización en las capas más sensibles. Este método produce, por lo general, artefactos de mayor calidad que la cuantización uniforme a un mismo número de bits. El nombre del modelo base incluye el término "heretic", asociado habitualmente a técnicas de ablación de direcciones de rechazo (abliteration); no obstante, esta relación no está confirmada por la model card ni por ninguna documentación del repositorio, por lo que debe tratarse como una observación no verificada.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` del repositorio es el único indicio explícito sobre su uso previsto.
- Inferencia local mediante llama.cpp y compatibles: el formato GGUF es el estándar de facto para ejecución en CPU/GPU mixta sin dependencias de CUDA.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que puede servirse detrás de APIs compatibles con el formato de OpenAI, aunque no se documenta la implementación concreta.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

No se han publicado descripciones de capacidades adicionales en la información disponible.

## Casos de uso

- Inferencia local en estación de trabajo con GPU de consumo: las cuantizaciones Q4_K_M o IQ4_XS de un modelo de ~30,7B ocupan alrededor de 18-19 GB, por lo que pueden ejecutarse en una RTX 4090 (24 GB) o en una RTX 3090, siempre que el contexto configurado no dispare el consumo de caché KV.
- Despliegue en servidores sin GPU dedicada: las variantes Q2_K o IQ2_M reducen el peso a aproximadamente 9-11 GB, lo que permite ejecución en CPU con suficiente RAM, con una penalización notable de latencia y calidad.
- Generación de texto conversacional autoalojada: para equipos que necesitan un asistente de chat sin enviar datos a APIs de terceros, el formato GGUF permite servirlo con llama.cpp, Ollama o LM Studio en infraestructura propia.
- Experimentación e investigación sobre cuantización extrema: las variantes IQ1_S e IQ1_M (por debajo de 2 bits por peso) son útiles para estudiar la degradación de calidad y calibrar metodologías imatrix frente a cuantización uniforme.
- Pruebas comparativas de cuantizaciones: al publicarse 24 variantes distintas del mismo modelo, el repositorio sirve para medir empíricamente la relación entre bits por peso, tamaño en disco, velocidad y calidad percibida.
- Integración en pipelines de evaluación interna: si el modelo base encaja con las necesidades de un proyecto, estas cuantizaciones permiten realizar pruebas funcionales en hardware limitado antes de decidir un despliegue en precisión completa.
- Prototipado rápido con herramientas locales: mediante Ollama o llama.cpp, se puede levantar un endpoint compatible con OpenAI para probar aplicaciones de chat sin coste de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El repositorio no incluye mediciones de MMLU, HumanEval, GSM8K, MT-Bench ni de ningún otro conjunto de evaluación, ni para el modelo base ni para las cuantizaciones publicadas. Tampoco se aportan datos de perplejidad comparativa entre las distintas variantes de cuantización.

## Requisitos de hardware

Los siguientes valores son estimaciones derivadas del número de parámetros (30.697.345.596) y de los bits por peso típicos de cada tipo de cuantización. No proceden de documentación del repositorio ni de mediciones publicadas, y no incluyen la memoria de la caché KV, que depende del contexto configurado.

| Cuantizacion | Tamano aproximado de pesos | VRAM recomendada (con contexto moderado) |
|---|---|---|
| IQ1_S / IQ1_M | ~6-8 GB | 10-12 GB |
| IQ2_XXS / IQ2_XS / IQ2_S / IQ2_M / Q2_K / Q2_K_S | ~9-12 GB | 14-16 GB |
| IQ3_XXS / IQ3_XS / IQ3_S / IQ3_M / Q3_K_S / Q3_K_M | ~13-16 GB | 18-20 GB |
| Q3_K_L | ~17 GB | 20-22 GB |
| IQ4_XS / Q4_0 / Q4_1 / Q4_K_S | ~17-19 GB | 22-24 GB |
| IQ4_NL (small) / Q4_K_M | ~18-19 GB | 22-24 GB |
| Q5_K_S / Q5_K_M | ~21-22 GB | 24-26 GB |
| Q6_K | ~25 GB | 28-32 GB |

- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) para cuantizaciones Q4 y Q5; A100 40 GB, L40S o H100 para Q6_K y para contextos largos con caché KV grande; dos GPU de 24 GB en paralelo también permiten repartir las cuantizaciones más grandes.
- Cabe en GPU de consumo: sí, en las cuantizaciones de 1 a 4 bits sobre tarjetas de 12-24 GB. Las variantes Q5 y Q6 exigen 24 GB o más.
- Opciones de despliegue: llama.cpp (`llama-server`), Ollama, LM Studio, llama-cpp-python, text-generation-webui y Jan. vLLM ofrece soporte parcial de GGUF, aunque su rendimiento óptimo se da con safetensors; TGI no soporta GGUF de forma nativa.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La comparativa con alternativas exige conocer la arquitectura, el contexto y la licencia del modelo base `vulture3/G4-WanaMeroQueen-v3-31B-heretic`, datos que no se documentan en el repositorio analizado. Sin esa información no es posible identificar modelos equivalentes por tamaño efectivo, tarea o régimen de licencia, ni establecer comparaciones de rendimiento fiables.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica licencia alguna. Esto impide determinar si el uso comercial está permitido y traslada al usuario la responsabilidad de verificar la licencia del modelo base `vulture3/G4-WanaMeroQueen-v3-31B-heretic` antes de cualquier despliegue en producción.
- Ausencia de model card: no hay documentación sobre datos de entrenamiento, sesgos, idiomas, contexto máximo ni comportamiento esperado.
- Riesgo de alucinación: no existe ninguna evaluación publicada, por lo que no puede cuantificarse la tasa de alucinación ni la fiabilidad factual.
- Degradación por cuantización: las variantes por debajo de 4 bits (especialmente IQ1 e IQ2) degradan de forma significativa la coherencia, el razonamiento y la fidelidad al formato. No se recomienda su uso en tareas que exijan precisión.
- Posible modelo ablacionado: el término "heretic" en el nombre sugiere, sin confirmación documental, la eliminación de mecanismos de rechazo. De ser así, el modelo podría generar contenido inapropiado, inseguro o no alineado sin las salvaguardas habituales.
- Sesgos desconocidos: al no documentarse la composición del dataset, no es posible evaluar sesgos de género, raza, idioma o ideología.
- Idiomas no especificados: se desconoce qué lenguas soporta correctamente y con qué calidad.
- Caché KV no cuantizada por defecto: en contextos largos, el consumo de memoria puede superar ampliamente el tamaño de los pesos si no se activa la cuantización de la caché KV en llama.cpp.
- Repositorio sin tracción: 0 descargas y 0 "likes" en el momento de la consulta, sin comunidad que haya validado su funcionamiento.
- Fechas de metadatos inusuales: el repositorio figura como creado el 2026-09-20, dato que conviene verificar antes de tomarlo como referencia temporal.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/G4-WanaMeroQueen-v3-31B-heretic-i1-GGUF
- Modelo base: https://huggingface.co/vulture3/G4-WanaMeroQueen-v3-31B-heretic
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- llama.cpp (runtime GGUF): https://github.com/ggml-org/llama.cpp
- No se han encontrado papers, blogs, demos ni repositorios adicionales asociados a este modelo en la búsqueda web realizada.
