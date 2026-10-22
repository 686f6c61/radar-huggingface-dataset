# mrfakename/DeepSeek-V4.1-Flash-1017-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-GGUF es la versión cuantizada en formato GGUF del modelo deepseek-ai/DeepSeek-V4.1-Flash-1017, publicada por el usuario mrfakename. Se trata de una conversión orientada a llama.cpp de un modelo de gran tamaño (748.494.684.784 parámetros según los pesos en safetensors del modelo base), con arquitectura de mezcla de expertos (MoE): la model card indica explícitamente que los "routed experts" conservan su cuantización nativa MXFP4 y que el modelo incorpora dos tablas "engram" de gran tamaño de las que se leen unas pocas filas por token.

El interés de esta ficha no está en un modelo nuevo, sino en la disponibilidad de pesos cuantizados de un modelo de casi 750.000 millones de parámetros en cuatro niveles (Q8_0, Q4_K_M, Q3_K_M y Q2_K), con el nivel más pequeño ocupando 246 GiB. Esto convierte el modelo en desplegable únicamente en infraestructura de gran capacidad de memoria, y en un caso de estudio sobre cuantización extrema de MoE con expertos ya comprimidos en MXFP4.

Un detalle crítico: estos ficheros no funcionan con llama.cpp mainline. El autor los generó con la rama del PR ggml-org/llama.cpp#28696 (commit 2076412) y requieren esa compilación. Además, la conversión actual es solo de texto: la torre de visión del modelo base no se ha podido convertir, pese a que el pipeline declarado sea image-text-to-text.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con expertos enrutados en MXFP4 y dos tablas "engram"; detalles completos de la arquitectura del modelo base no disponibles |
| Parámetros totales | 748.494.684.784 (≈748,5 B), dato de safetensors del modelo base |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0 (expertos enrutados en MXFP4 nativo), Q4_K_M, Q3_K_M, Q2_K; sin imatrix |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF dividido en 10 ficheros por carpeta (split GGUF); pesos originales del modelo base no disponibles en esta ficha |
| Modelo base | deepseek-ai/DeepSeek-V4.1-Flash-1017 (relación: quantized) |
| Pipeline declarado | image-text-to-text (en esta conversión, solo texto) |
| Tamaño del repositorio | 1566,1 GB |
| Descargas / likes | 13.974 / 14 |
| Fecha de creación / actualización | 2026-10-17 / 2026-10-18 |
| Runtime requerido | llama.cpp con el PR ggml-org/llama.cpp#28696 (commit 2076412598e99127ea2554467b2b7530856895d3) o build que lo incluya |

## Arquitectura y entrenamiento

La información disponible confirma que el modelo base es un transformer con mezcla de expertos: la model card distingue entre los tensores cuantizados de forma convencional y los "routed experts", que ya estaban en MXFP4 en los pesos originales y por eso se mantienen en ese formato incluso en la carpeta Q8_0. Esa es la razón técnica de que la diferencia entre Q8_0 (473 GiB) y Q4_K_M (414 GiB) sea de solo 59 GiB: una parte mayoritaria del peso del modelo ya está comprimida a ~4 bits en origen y no se puede reducir más sin degradar los expertos.

El otro elemento arquitectónico destacado son las dos tablas "engram", descritas como tablas grandes de las que se leen unas pocas filas por token. El autor recomienda mantenerlas en CPU (por ejemplo, con `-ot "engram_embd.weight=CPU"`), lo que sugiere un mecanismo de memoria o lookup disperso asociado a la generación. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO u otras técnicas de alineación, ni sobre innovaciones adicionales del modelo base.

En cuanto al proceso de cuantización: son cuantizaciones "plain", sin matriz de importancia (imatrix), lo que implica que no hubo calibración por importancia de pesos. Cada carpeta contiene un GGUF dividido; basta con apuntar llama.cpp al fichero `-00001-of-` para que cargue el resto de fragmentos.

## Capacidades

- Generación de texto conversacional: el tag `conversational` está presente en el repositorio, y la model card limita el uso a texto ("Text only for now").
- Capacidad multimodal teórica del modelo base: el pipeline declarado es image-text-to-text, pero la torre de visión no se ha convertido en esta GGUF y la rama de llama.cpp usada no puede hacerlo, por lo que la entrada de imágenes no está disponible en esta conversión.
- Procesamiento de lenguaje natural a gran escala: el tamaño del modelo (≈748,5 B de parámetros) y la presencia de expertos enrutados apuntan a un uso intensivo en tareas de lenguaje, aunque no se publican evaluaciones que lo cuantifiquen.
- Tablas "engram" con lectura dispersa por token: mecanismo diferencial del modelo base, con implicaciones de despliegue (offload a CPU) descritas por el autor.
- Compatibilidad con endpoints: el tag `endpoints_compatible` está presente en el repositorio, lo que indica que el artefacto está pensado para servirse mediante endpoints compatibles con el ecosistema de Hugging Face/llama.cpp.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Modo "thinking" o razonamiento explícito: no disponible en la información proporcionada.
- Capacidades de audio: no disponibles.
- Cobertura multilingüe: no disponible; el repositorio no declara lista de idiomas.

## Casos de uso

- Evaluación de cuantización extrema en MoE: comparar la calidad de salida de Q2_K (246 GiB) frente a Q3_K_M (323 GiB), Q4_K_M (414 GiB) y Q8_0 (473 GiB) sobre el mismo conjunto de prompts permite medir cuánto degrada la compresión en un modelo cuyos expertos ya estaban en MXFP4, un escenario poco documentado en la literatura práctica.
- Procesamiento documental por lotes en infraestructura propia: el modelo puede ejecutarse íntegramente on-premise sobre un nodo con suficiente memoria, lo que encaja en flujos de resumen y extracción de información en sectores con requisitos de residencia de datos.
- Asistente conversacional multi-turno autoalojado: para organizaciones que no pueden enviar datos a APIs externas, un despliegue con llama.cpp sobre hardware dedicado ofrece una alternativa con licencia MIT, sin restricciones de uso comercial.
- Investigación sobre offload selectivo: el patrón recomendado por el autor (mantener las tablas engram en CPU con `-ot`) sirve como caso práctico para estudiar estrategias híbridas CPU/GPU en modelos de gran tamaño.
- Reproducibilidad de artefactos GGUF: útil para verificar y auditar cómo se comporta un modelo de ~750 B en formato GGUF dividido, incluyendo la carga de ficheros `-00001-of-` y la gestión de decenas de GB por fragmento.
- Pruebas de integración en pipelines llama.cpp: validar builds personalizadas (PR 28696) frente a mainline, y monitorizar compatibilidad futura cuando el soporte se fusione en la rama principal.
- Generación de texto especializada con licencia permisiva: al ser MIT, se puede integrar en productos comerciales sin negociación de licencia, siempre que se asuma el coste de infraestructura.
- Inferencia en entornos aislados (air-gapped): al no requerir llamadas a servicios externos, encaja en laboratorios o instalaciones sin conectividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y tampoco se han encontrado datos en la búsqueda web realizada (los resultados obtenidos no guardan relación con el modelo). No se deben asumir cifras de rendimiento a partir del modelo base sin una fuente verificable.

## Requisitos de hardware

- Memoria total necesaria (pesos): 246 GiB (Q2_K), 323 GiB (Q3_K_M), 414 GiB (Q4_K_M) y 473 GiB (Q8_0). Hay que sumar overhead de contexto KV y buffers del runtime, por lo que conviene reservar un margen adicional.
- VRAM para inferencia completamente en GPU: hacen falta aproximadamente los mismos valores que el tamaño del quant elegido. Un nodo de 8×H100 80 GB (640 GB) o 8×A100 80 GB puede alojar Q8_0 con margen; 4×H200 141 GB (564 GB) cubre Q8_0 de forma ajustada y Q4_K_M con holgura.
- Configuraciones parciales: al ser GGUF y funcionar con llama.cpp, es viable repartir capas entre GPU y CPU. El propio autor recomienda dejar las dos tablas engram en CPU (`-ot "engram_embd.weight=CPU"`), lo que reduce la presión sobre VRAM a costa de latencia.
- GPU consumer: no cabe en ninguna GPU de consumo actual (24 GB o menos) ni en configuraciones multi-GPU de consumo razonables; el quant más pequeño, Q2_K, requiere 246 GiB solo de pesos. Solo tendría sentido en estaciones con gran memoria unificada (por ejemplo, 256 GB o más), y aun así con riesgos serios de swapping.
- Opciones de despliegue: exclusivamente llama.cpp con la rama del PR #28696 (commit 2076412) o un build que lo incluya. vLLM, TGI y Ollama no están confirmados como compatibles; llama.cpp mainline no soporta DeepSeek V4.1 según el autor.
- Almacenamiento: el repositorio completo ocupa 1566,1 GB; descargar una sola carpeta de quant requiere entre 246 y 473 GiB libres, repartidos en 10 ficheros.
- Latencia y throughput: no disponibles. Cualquier estimación depende del reparto CPU/GPU, del ancho de banda de memoria del nodo y de la longitud de contexto, que tampoco se ha publicado.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de contexto que permitan una comparación rigurosa con otros modelos de la misma categoría. La comparación disponible y verificable es entre las propias cuantizaciones de este repositorio:

| Variante | Tamaño | Ficheros | Reducción frente a Q8_0 | Notas del autor |
|---|---|---|---|---|
| Q8_0 | 473 GiB | 10 | — | Q8_0 en todos los tensores salvo los expertos enrutados, que mantienen MXFP4 nativo; la más cercana a los pesos originales |
| Q4_K_M | 414 GiB | 10 | ≈12,5 % | Los expertos enrutados ya están a ~4 bits, por lo que el ahorro es menor de lo habitual |
| Q3_K_M | 323 GiB | 10 | ≈31,7 % | Sin notas adicionales en la model card |
| Q2_K | 246 GiB | 10 | ≈48,0 % | El tamaño usable más pequeño según el autor |

Frente a alternativas externas (otros modelos abiertos de escala similar o cuantizaciones de terceros), no disponible: no hay datos de rendimiento, contexto ni licencia de esos hipotéticos comparables en la información proporcionada.

## Limitaciones y advertencias

- La conversión es solo de texto: la torre de visión del modelo base no se ha podido convertir y la rama de llama.cpp utilizada no la soporta. El pipeline declarado (image-text-to-text) no refleja lo que este GGUF puede hacer.
- Dependencia de una rama no fusionada: mainline llama.cpp no soporta DeepSeek V4.1. El repositorio exige el PR #28696 en el commit 2076412598e99127ea2554467b2b7530856895d3; cualquier actualización del runtime puede romper la carga o requerir recompilación.
- Requisitos de memoria muy elevados: entre 246 y 473 GiB solo para los pesos, más overhead. No es desplegable en hardware de consumo ni en instancias cloud pequeñas.
- Cuantización sin imatrix: al no haber calibración por importancia, la pérdida de calidad en Q3_K_M y especialmente en Q2_K no está caracterizada por el autor. No hay evaluación publicada del impacto en tareas concretas.
- Ausencia total de benchmarks: no se puede afirmar nada sobre MMLU, código, matemáticas o multilingüismo con base en la información disponible.
- Sesgos conocidos: no disponible. No hay información sobre composición del dataset de entrenamiento ni sobre evaluaciones de sesgo, por lo que el riesgo es desconocido pero no descartable en un modelo de esta escala.
- Riesgo de alucinación: no cuantificado en la información disponible; aplican las precauciones habituales en modelos generativos desplegados sin verificación externa.
- Idiomas: no disponible. El repositorio no declara lista de idiomas, por lo que el rendimiento en castellano no está verificado.
- Longitud de contexto: no disponible, lo que impide planificar cargas de trabajo con documentos largos.
- Licencia MIT: permisiva y compatible con uso comercial y modificación, pero conviene verificar la licencia del modelo base (deepseek-ai/DeepSeek-V4.1-Flash-1017) y de los pesos originales, ya que este repositorio solo cubre la conversión GGUF.
- Fechas de metadatos: creación y actualización en octubre de 2026; verificar la vigencia del PR y del commit referenciados antes de congelar una build en producción.
- Tamaño del repositorio (1566,1 GB): descargar todo el repositorio es costoso en ancho de banda y almacenamiento; conviene usar descargas selectivas por carpeta.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mrfakename/DeepSeek-V4.1-Flash-1017-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- PR de llama.cpp con soporte para DeepSeek V4.1: https://github.com/ggml-org/llama.cpp/pull/28696
- Fork de llama.cpp indicado por el autor: https://github.com/vcruz305/llama.cpp
- Commit requerido: 2076412598e99127ea2554467b2b7530856895d3
- Perfil del autor: https://x.com/realmrfakename
