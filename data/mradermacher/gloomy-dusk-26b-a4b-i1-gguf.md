# mradermacher/Gloomy-Dusk-26B-A4B-i1-GGUF

## Resumen

Gloomy-Dusk-26B-A4B-i1-GGUF es una cuantización en formato GGUF del modelo Gloomy-Dusk-26B-A4B, publicada por mradermacher. El modelo original lo desarrolla Sorihon y, por las etiquetas del repositorio (`mergekit`, `merge`), se trata de una fusión de modelos (model merge) más que de un entrenamiento desde cero. El sufijo "A4B" sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 4.000 millones de parámetros activos, aunque este dato no está confirmado en la información disponible.

El modelo cuenta con 25.971.339.550 parámetros totales (unos 26.000 millones) según los pesos en safetensors del modelo base. Esta versión concreta ofrece cuantizaciones con imatrix (i1) en una amplia gama de tipos, desde IQ1_S (8,6 GB) hasta Q6_K (23,3 GB), lo que permite desplegarlo en hardware muy diverso. La model card indica que se trata de un modelo de visión, con archivos mmproj disponibles en el repositorio estático del mismo autor.

La relevancia de esta ficha radica en que es una de las pocas vías prácticas para ejecutar un modelo de ~26.000 millones de parámetros con capacidades multimodales en hardware de consumo, gracias a la compresión GGUF y a la posible arquitectura MoE que reduce los parámetros activos durante la inferencia. No obstante, la información pública es muy escasa: no hay benchmarks, no se especifica la licencia ni la longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) segun el sufijo "A4B"; detalles no disponibles |
| Parametros totales | 25.971.339.550 (~26B) |
| Parametros activos | ~4B (inferido del sufijo "A4B"; no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K, i1-Q2_K_S, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_1, i1-Q4_K_M, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | ingles (`language: en`) |
| Licencia | no disponible |
| Formato de pesos | GGUF (con fichero imatrix incluido) |

## Arquitectura y entrenamiento

El modelo base Sorihon/Gloomy-Dusk-26B-A4B está etiquetado con `mergekit` y `merge`, lo que indica que se ha generado mediante fusión de pesos de otros modelos, probablemente con la herramienta mergekit. No se dispone de información sobre los modelos de origen, la estrategia de fusión (SLERP, TIES, DARE, etc.) ni los datos de entrenamiento o ajuste posteriores. El sufijo "A4B" es coherente con una arquitectura de mezcla de expertos con unos 4.000 millones de parámetros activos por token, pero no hay confirmación explícita en la documentación disponible.

La model card del repositorio de cuantización no aporta detalles arquitectónicos adicionales. Sí indica que el modelo es multimodal (visión), con archivos mmproj gestionados en el repositorio estático. Las cuantizaciones i1 utilizan una matriz de importancia (imatrix) generada por el propio autor para mejorar la calidad de los cuantizados de baja precisión. No se documentan innovaciones técnicas como decodificación especulativa, atención lineal o modos de razonamiento extendido.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` indica que está orientado a diálogo.
- Capacidades de visión: la model card lo describe explícitamente como modelo de visión, con archivos mmproj para procesar imágenes.
- Soporte multilingüe limitado: la única lengua declarada es el inglés.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede servirse mediante la infraestructura de Inference Endpoints de Hugging Face.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo de razonamiento (thinking mode): no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional autoalojado: el modelo puede desplegarse con llama.cpp u Ollama en una estación de trabajo con GPU de consumo usando cuantizaciones Q4_K_M (17,3 GB), adecuado para prototipos de chat con datos sensibles que no deben salir de la infraestructura local.
- Análisis de imágenes en local: al ser un modelo de visión, puede emplearse para descripción de imágenes, extracción de texto de capturas o clasificación visual en entornos sin acceso a APIs en la nube, usando el fichero mmproj correspondiente.
- Procesamiento por lotes de documentos escaneados: con la cuantización Q5_K_M (19,7 GB) y una GPU de 24 GB, se puede ejecutar un pipeline de OCR asistido y resumen de documentos en inglés.
- Experimentación con fusiones de modelos: investigadores interesados en el impacto de mergekit sobre capacidades conversacionales y multimodales pueden usar este GGUF como referencia reproducible frente al modelo base en safetensors.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 23 variantes de cuantización, lo que permite medir la degradación de calidad (perplejidad, coherencia) entre IQ1_S y Q6_K en una misma tarea, útil para estudiar el compromiso tamaño/calidad.
- Despliegue en endpoints compatibles: gracias a la etiqueta `endpoints_compatible`, puede servirse como API HTTP interna para aplicaciones de chat o visión en equipos pequeños, con la cuantización IQ4_XS (14,4 GB) como opción equilibrada.
- Prototipado en portátiles con GPU de 12-16 GB: las variantes IQ3_M (12,8 GB) o IQ4_XS (14,4 GB) permiten probar el modelo en GPUs como la RTX 4080 o 4070 Ti, aunque con pérdida de calidad respecto a Q5/Q6.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: desde ~8,6 GB (IQ1_S) hasta ~23,3 GB (Q6_K), más el espacio para el contexto KV y, en su caso, el proyector multimodal (mmproj).
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M, Q5_K_M o Q6_K; RTX 4080/4070 Ti (16 GB) para IQ3_M o IQ4_XS; A100/H100 para servir el modelo en precisión completa o con lotes grandes.
- Cabe en GPU de consumo: sí, en la mayoría de cuantizaciones. Q4_K_M (17,3 GB) entra en una RTX 4090; IQ3_M (12,8 GB) entra en GPUs de 16 GB; las variantes IQ1/IQ2 (8,6-10,8 GB) caben en GPUs de 12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. Para servir como API, servidores basados en llama.cpp o endpoints compatibles.
- Latencia y throughput: no disponibles. Al tratarse de un posible MoE con ~4B parámetros activos, la velocidad de generación debería ser notablemente superior a la de un modelo denso de 26B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Gloomy-Dusk-26B-A4B-i1-GGUF | ~26B | ~4B (inferido) | no disponible | no disponible | GGUF |
| Mistral Small 3.1 24B | 24B | 24B (denso) | 128K | Apache 2.0 | safetensors, GGUF |
| Gemma 3 27B | 27B | 27B (denso) | 128K | Gemma license | safetensors, GGUF |
| Qwen2.5-VL 32B | 32B | 32B (denso) | 128K | Apache 2.0 | safetensors, GGUF |

La comparación con Mistral Small 3.1, Gemma 3 27B y Qwen2.5-VL 32B es orientativa por tamaño y capacidades multimodales; no hay datos de rendimiento del modelo Gloomy-Dusk para establecer una comparación cuantitativa. La ventaja principal de Gloomy-Dusk es la posible eficiencia de su arquitectura MoE, mientras que sus alternativas cuentan con licencias claras y documentación extensa.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial está permitido; es un riesgo legal importante para producción.
- Modelo derivado de una fusión: las fusiones de modelos pueden heredar sesgos y comportamientos inconsistentes de los modelos de origen, y los detalles de la fusión no están documentados.
- Idioma: solo se declara inglés; el rendimiento en castellano es incierto y probablemente degradado.
- Contexto desconocido: sin longitud de contexto documentada, no se puede planificar su uso en tareas de contexto largo.
- Riesgo de alucinación: inherente a los modelos generativos; no hay evaluaciones publicadas que lo cuantifiquen.
- Cuantizaciones de muy baja precisión: IQ1_S, IQ1_M e IQ2_* degradan notablemente la calidad; la propia model card las etiqueta como "for the desperate" o "very low quality".
- Visión parcialmente documentada: los archivos mmproj están en el repositorio estático, no en este; hay que descargarlos por separado y verificar compatibilidad con el runtime.
- Sin benchmarks ni evaluación independiente: no hay evidencia pública de su rendimiento frente a alternativas consolidadas.
- Repositorio de gran tamaño (309 GB): la descarga completa es costosa; conviene descargar solo la cuantización necesaria.

## Enlaces

- Repositorio Hugging Face de la cuantización: https://huggingface.co/mradermacher/Gloomy-Dusk-26B-A4B-i1-GGUF
- Modelo base: https://huggingface.co/Sorihon/Gloomy-Dusk-26B-A4B
- Cuantizaciones estáticas (incluye mmproj): https://huggingface.co/mradermacher/Gloomy-Dusk-26B-A4B-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Gloomy-Dusk-26B-A4B-i1-GGUF
- Preguntas frecuentes y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Empresa del autor de la cuantización: https://www.nethype.de/
