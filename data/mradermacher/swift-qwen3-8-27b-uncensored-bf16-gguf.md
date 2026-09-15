# mradermacher/Swift-Qwen3.8-27B-Uncensored-BF16-GGUF

## Resumen

mradermacher/Swift-Qwen3.8-27B-Uncensored-BF16-GGUF es un repositorio de cuantizaciones GGUF estáticas generadas por mradermacher a partir de los pesos BF16 de d0xin/Swift-Qwen3.8-27B-Uncensored-BF16, que a su vez deriva del modelo denso Qwen/Qwen3.8-27B. Se trata por tanto de una variante "uncensored" (abliterated) de un modelo de 27.320.697.856 parámetros, redistribuida en formatos listos para inferencia local con llama.cpp y runtimes compatibles con GGUF.

El modelo base emplea una arquitectura híbrida de 64 capas: 48 capas con Gated DeltaNet (atención lineal) y 16 capas de atención completa, con un tamaño oculto de 5.120. Incorpora visión nativa y una ventana de contexto declarada de 262.144 tokens, lo que lo sitúa en la gama alta de contexto entre los modelos densos de ~27B accesibles en hardware de gama alta de consumo mediante cuantización agresiva.

Su relevancia práctica es doble: por un lado, permite ejecutar un modelo de 27B con contexto muy largo en GPUs de 24 GB o menos usando Q4_K_M o inferiores; por otro, al ser una variante sin alineamiento de seguridad, cubre casos de investigación sobre comportamiento de modelos desinhibidos. El repositorio no declara licencia ni idiomas, no tiene descargas ni likes registrados y no publica benchmarks propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido denso: 48 capas con Gated DeltaNet (atención lineal) + 16 capas de atención completa; 64 capas en total, hidden size 5.120 |
| Parametros totales | 27.320.697.856 (27,32 mil millones) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (262.000 según otra fuente consultada) |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS; una fuente del linaje cita IQ2_M (~10,6 GB) como suelo práctico |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card del repositorio no la especifica) |
| Formato de pesos | GGUF; el linaje original se distribuye en BF16 (safetensors) |
| Vision | nativa en el modelo base; requiere el proyector mmproj-Qwen3.8-27B-f16.gguf (~0,9 GB) |
| Tamano del repositorio | 28,2 GB |
| Autor de la cuantizacion | mradermacher |
| Fecha de creacion / actualizacion | 2026-09-15 / 2026-09-15 |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido denso de 64 capas que combina 48 capas de Gated DeltaNet (atención lineal con estado recurrente) con 16 capas de atención completa distribuidas en la pila, con un tamaño oculto de 5.120. Este diseño reduce el coste computacional y de memoria del contexto largo respecto a un transformer de atención completa equivalente, manteniendo capacidad de recuperación global gracias a las capas de atención completa intercaladas. El modelo incorpora además visión nativa (imagen y vídeo), servida mediante un proyector multimodal independiente.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni la pipeline de alineamiento (RLHF, DPO u otras) del modelo base Qwen3.8-27B ni de la variante Swift. Lo que sí se documenta es el proceso de derivación: se trata de una variante "uncensored" (abliterated) y el repositorio de mradermacher es una conversión estática a GGUF de los pesos BF16 publicados por d0xin. Una fuente independiente del mismo linaje afirma que recuantizar el fichero f16 a Q4_K_M reproduce byte a byte los 866 tensores del Q4_K_M publicado de Qwen3.8-27B-Uncensored, lo que constituye una verificación de procedencia frente a la mera afirmación. La misma fuente indica que el f16 completo ocupa unos 54 GB.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat compatible con el parser Qwen3.
- Modo de razonamiento explícito ("thinking"), con nivel configurable documentado como `xhigh` en una de las fuentes.
- Contexto largo de hasta 262.144 tokens, adecuado para documentos extensos y bases de código grandes.
- Visión nativa: entrada de imágenes y vídeo si se carga el proyector mmproj-Qwen3.8-27B-f16.gguf junto al GGUF del modelo.
- Generación de código y matemáticas (capacidad heredada del modelo base Qwen3.8-27B; sin benchmarks propios publicados que la cuantifiquen).
- Compatibilidad con endpoints: el repositorio está etiquetado como `endpoints_compatible`, lo que facilita su exposición mediante servidores compatibles con la API de OpenAI.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible para esta variante concreta.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Procesamiento de documentación técnica extensa: con 262.144 tokens de contexto, el modelo puede ingerir manuales, normativas o contratos completos sin troceado, y responder preguntas transversales sobre el conjunto.
- Análisis de repositorios de código: la combinación de contexto largo y capacidad de código permite revisar módulos completos, detectar inconsistencias entre ficheros y proponer refactorizaciones manteniendo el grafo de dependencias en contexto.
- Asistente local con visión: cargando el proyector mmproj, el modelo puede describir capturas de interfaz, diagramas o fotogramas de vídeo en un flujo de trabajo totalmente local, sin envío de datos a terceros.
- Investigación sobre seguridad y alineamiento: al ser una variante abliterated, resulta adecuado para estudiar cómo se comporta un modelo de 27B cuando se eliminan las capas de rechazo, y para comparar contra el modelo base alineado.
- Generación creativa sin filtros editoriales: redacción de ficción, guiones o material satírico donde los rechazos del modelo alineado interrumpen el flujo, siempre que el despliegue sea legal y con supervisión humana.
- Despliegue en hardware de gama alta de consumo: con Q4_K_M (~16,5 GB estimados) cabe en una RTX 4090 o RTX 3090 de 24 GB, lo que habilita un asistente privado de 27B sin coste de API.
- Extracción estructurada sobre lotes de documentos largos: transcripción y normalización de informes, actas o expedientes en un único paso de contexto, con salida en JSON mediante prompts de plantilla y validación posterior.
- Evaluación comparativa de cuantizaciones: al publicarse múltiples niveles (Q2_K a Q8_0) del mismo linaje, el repositorio sirve para medir empíricamente la degradación de calidad por cuantización en tareas de código y razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente documenta la procedencia de los pesos y la lista de cuantizaciones; ninguna de las fuentes consultadas aporta cifras de MMLU, HumanEval, GSM8K u otros conjuntos para esta variante.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones derivadas del recuento de parámetros (27,32B) y del tamaño típico de cada formato; el autor no las publica. Hay que sumar overhead de contexto KV y runtime.

- BF16 / safetensors (pesos originales): ~54,6 GB de pesos. Requiere A100 80 GB, H100 80 GB o dos GPUs de 48 GB.
- x-f16 en GGUF: ~54 GB. Mismo perfil de hardware que BF16; según una fuente, este fichero no se distribuye en el repositorio de cuantizaciones y debe construirse desde los pesos BF16.
- Q8_0: ~29 GB. Cabe en RTX 5090 (32 GB), A100 40 GB o H100 con margen.
- Q6_K: ~22,5 GB. Entra en 24 GB (RTX 3090, RTX 4090, RTX 5090) con contexto moderado.
- Q5_K_M / Q5_K_S: ~19 GB. Cómodo en 24 GB de VRAM, permitiendo contexto amplio.
- Q4_K_M / Q4_K_S: ~16,5 GB. La opción recomendada para 24 GB; también ejecutable en 16 GB (RTX 4080, RTX 5080) con contexto reducido.
- Q3_K_L / Q3_K_M / Q3_K_S: ~13,5 GB. Adecuado para GPUs de 16 GB.
- IQ4_XS: ~14,5 GB. Alternativa i-quant a Q4 con menor huella.
- Q2_K: ~10,5 GB y IQ2_M ~10,6 GB. Permiten inferencia en GPUs de 12 GB, con pérdida de calidad apreciable.
- Visión: añadir ~0,9 GB del proyector mmproj-Qwen3.8-27B-f16.gguf.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y llama-cpp-python para los ficheros GGUF; vLLM 0.27.1 con parser Qwen3 si se parte de los pesos BF16/safetensors (una fuente documenta este stack de servicio). La etiqueta `endpoints_compatible` facilita su publicación tras una API compatible con OpenAI.
- Parámetros de muestreo documentados para esta familia: temperature 1.0, top_p 0.95, top_k 20, min_p 0, presence_penalty 0, repetition_penalty 1.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Vision | Licencia | Notas |
|---|---|---|---|---|---|---|
| mradermacher/Swift-Qwen3.8-27B-Uncensored-BF16-GGUF (este) | 27,32B densos | 262.144 | GGUF (12 niveles de cuantizacion) | Si, con mmproj | no disponible | 0 descargas, 0 likes; sin benchmarks |
| ukisai/Swift-Qwen3.8-27B-GGUF | 27B densos | 262.144 | GGUF | Si (modelo base) | no disponible | Mismo linaje; documenta servicio con vLLM 0.27.1 y parser Qwen3 |
| d0xin/Swift-Qwen3.8-27B-Uncensored-BF16 | 27B densos | 262.144 | BF16 safetensors | Si (modelo base) | no disponible | Pesos de origen de esta cuantizacion |
| mradermacher/Qwen3.6-27B-AEON-Ultimate-Uncensored-BF16-GGUF | 27B densos | no disponible | GGUF + variantes i1 con imatrix | no disponible | no disponible | Linaje distinto (Qwen3.6), tambien uncensored |
| Qwen/Qwen3.8-27B (base) | 27B densos | 262.144 | safetensors | Si | no disponible en esta busqueda | Modelo oficial alineado del que derivan las variantes uncensored |

No se dispone de datos de rendimiento comparativos entre estas variantes, por lo que la comparación se limita a parámetros, contexto, formato y disponibilidad.

## Limitaciones y advertencias

- Al ser una variante "uncensored" (abliterated), se ha eliminado total o parcialmente el alineamiento de seguridad: puede generar contenido dañino, ilegal o sensible sin rechazo. No es apta para uso directo con público general sin filtros adicionales.
- La licencia no está declarada en el repositorio, lo que genera incertidumbre jurídica para uso comercial. La licencia del modelo base Qwen3.8-27B debería consultarse y aplicarse, pero no se confirma en la información disponible.
- No hay resultados de benchmarks publicados para esta variante, por lo que se desconoce la degradación real introducida por el proceso de abliteration y por cada nivel de cuantización.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, es decir, no tiene validación de la comunidad ni informes de fallos.
- Riesgo de alucinación inherente a los modelos de 27B, especialmente en tareas de razonamiento factual y citas de fuentes; el contexto de 262.144 tokens no garantiza recuperación fiable en todos los puntos de la ventana.
- El contexto efectivo suele ser inferior al nominal en modelos con atención lineal híbrida; no hay evaluación publicada de recuperación a 262.144 tokens para esta variante.
- Idiomas soportados no declarados: no puede asumirse un rendimiento homogéneo fuera del inglés y el chino del modelo base.
- El tamaño del repositorio (28,2 GB) es inferior al que correspondería a un f16 completo de 27,32B parámetros (~54 GB), por lo que conviene verificar qué ficheros están realmente publicados antes de planificar un despliegue.
- La inferencia con visión exige descargar y enlazar el proyector mmproj por separado; olvidarlo produce errores al pasar imágenes.
- Los pesos originales BF16 y las cuantizaciones de terceros pueden tener derivas entre versiones; conviene fijar el hash del fichero GGUF en producción.

## Enlaces

- Repositorio HuggingFace (este modelo): https://huggingface.co/mradermacher/Swift-Qwen3.8-27B-Uncensored-BF16-GGUF
- Pesos BF16 de origen: https://huggingface.co/d0xin/Swift-Qwen3.8-27B-Uncensored-BF16
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantizaciones del mismo linaje por ukisai: https://huggingface.co/ukisai/Swift-Qwen3.8-27B-GGUF
- Cuantizaciones i1 con imatrix de un linaje previo: https://huggingface.co/mradermacher/Qwen3.6-27B-AEON-Ultimate-Uncensored-BF16-i1-GGUF
- Cuantizaciones de referencia Qwen3.6-27B (mismo autor): https://huggingface.co/mradermacher/Qwen3.6-27B-AEON-Ultimate-Uncensored-BF16-GGUF
- Analisis del build uncensored: https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf
- Comparativa con otros GGUF de Qwen: https://hackernoon.com/qwen38-27b-uncensored-vs-other-qwen-gguf-models
- Ficha de procedencia y cuantizacion: https://interfaze.ai/models/jonathancolettiqwen38-27b-uncensored-gguf
