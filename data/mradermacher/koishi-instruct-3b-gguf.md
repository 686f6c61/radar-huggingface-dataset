# mradermacher/koishi-instruct-3b-GGUF

## Resumen

koishi-instruct-3b-GGUF es la colección de cuantizaciones estáticas en formato GGUF del modelo ewof/koishi-instruct-3b, publicada por mradermacher. El modelo original es un ajuste fino de instrucciones de aproximadamente 2.780 millones de parámetros (2.775.864.320 según los pesos en safetensors), entrenado sobre el dataset ewof/koishi-instruct-metharme y orientado a instrucciones en inglés. Esta versión GGUF no aporta cambios de arquitectura ni de comportamiento: es una conversión de pesos para permitir la inferencia eficiente en CPU y GPU de consumo mediante llama.cpp y ecosistemas compatibles.

La relevancia de esta publicación es práctica: el repositorio ofrece un abanico de cuantizaciones (desde Q2_K de 1,2 GB hasta f16 de 5,7 GB) que permiten ejecutar un modelo de 3B en hardware modesto. El autor mantiene además una variante con cuantización ponderada/imatrix en mradermacher/koishi-instruct-3b-i1-GGUF, que suele ofrecer mejor calidad por bit que las cuantizaciones estáticas equivalentes.

No se dispone de información publicada sobre la longitud de contexto, la licencia, la composición exacta del dataset de ajuste ni los resultados de benchmarks del modelo base en la información proporcionada, por lo que esos datos se marcan como no disponibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles; modelo base ewof/koishi-instruct-3b) |
| Parametros totales | 2.775.864.320 (~2,78B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (estáticas); variante i1 con imatrix en repositorio separado |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (transformers como librería declarada; pesos originales del modelo base en safetensors) |

## Arquitectura y entrenamiento

El modelo subyacente es ewof/koishi-instruct-3b, un ajuste fino de instrucciones de ~2,78B parámetros. La model card del repositorio cuantizado no detalla la arquitectura interna (número de capas, dimensiones, tipo de atención), los datos de preentrenamiento ni el proceso de alineación (RLHF, DPO u otro). El único dato de entrenamiento disponible es el dataset de ajuste declarado, ewof/koishi-instruct-metharme, y el idioma objetivo, inglés.

Esta publicación concreta es una conversión de pesos: la model card indica `quantized_by: mradermacher`, `convert_type: hf` y `output_tensor_quantised: 1`, es decir, cuantizaciones estáticas generadas a partir de los pesos del modelo base. No hay innovaciones arquitectónicas propias ni cambios en el entrenamiento; el valor añadido está en los distintos niveles de compresión y en la disponibilidad de una variante imatrix (ponderada) en un repositorio aparte.

## Capacidades

- Generación de texto e instrucciones en inglés, heredadas del ajuste fino del modelo base.
- Conversación multi-turno en formato de instrucciones (el nombre del dataset, metharme, sugiere un formato de prompt tipo Metharme, aunque no se detalla en la información disponible).
- Inferencia local en CPU y GPU de consumo gracias al formato GGUF y a la horquilla de cuantizaciones.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags del repositorio), lo que facilita su despliegue en infraestructuras de inferencia gestionadas.
- No hay información publicada sobre tool calling, function calling, capacidades de agente, razonamiento multi-paso, matemáticas, código, visión, audio ni modo thinking.

## Casos de uso

- Prototipado local de asistentes conversacionales en inglés: con las cuantizaciones Q4_K_S o Q4_K_M (1,7-1,9 GB) el modelo cabe en equipos sin GPU dedicada y permite iterar sobre prompts y formatos de instrucción sin coste de API.
- Pruebas de integración en pipelines llama.cpp: útil como modelo de referencia ligero para validar cargas de GGUF, plantillas de chat y flujos de streaming antes de escalar a modelos mayores.
- Generación de texto en entornos con recursos limitados: la cuantización Q2_K (1,2 GB) permite ejecutar el modelo en dispositivos con poca memoria, a costa de calidad, para tareas de generación no crítica.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 12 variantes del mismo modelo, lo que permite medir el impacto de la compresión en la perplejidad y la calidad de salida sobre un caso concreto.
- Educación y experimentación: al ser un modelo pequeño y con pesos abiertos en GGUF, sirve para estudiar el efecto de las cuantizaciones y del ajuste fino de instrucciones en un entorno controlado.
- Despliegue en endpoints compatibles: el tag `endpoints_compatible` sugiere su uso en servicios de inferencia que aceptan modelos GGUF, como backend ligero para tareas de texto en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2,5 GB con cuantizaciones Q2_K a Q4_K_M; en torno a 3,5-4 GB con Q8_0; unos 6-7 GB con f16, incluyendo overhead de contexto y runtime.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060) para cuantizaciones Q4/Q5; una RTX 4090 o A100/H100 no aportan ventaja significativa a este tamaño, salvo por throughput agregado en batching.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU discretas modernas con 4 GB o más, e incluso en iGPU con memoria unificada usando cuantizaciones bajas.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), servidores compatibles con GGUF y endpoints que acepten este formato. La librería declarada es transformers, pero el formato de pesos es GGUF, por lo que el runtime natural es llama.cpp y derivados.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| koishi-instruct-3b-GGUF (este) | ~2,78B | no disponible | no disponible | GGUF | Cuantizaciones estáticas de un ajuste fino en inglés |
| koishi-instruct-3b-i1-GGUF | ~2,78B | no disponible | no disponible | GGUF (imatrix) | Misma base, cuantización ponderada de mayor calidad por bit |
| ewof/koishi-instruct-3b | ~2,78B | no disponible | no disponible | safetensors | Modelo original sin cuantizar |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoría en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento con alternativas.

## Limitaciones y advertencias

- Solo soporta inglés según la model card; el rendimiento en castellano u otros idiomas no está garantizado.
- No se ha publicado la licencia del modelo base ni de esta conversión, por lo que el uso comercial queda en una situación de incertidumbre legal hasta verificarlo en el repositorio original.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S, Q3_K_M) degradan la calidad de forma notable; la propia model card marca Q3_K_M como "lower quality" y recomienda Q4_K_S/Q4_K_M para uso general.
- Riesgo de alucinación inherente a un modelo de ~3B ajustado por instrucciones: no debe usarse como fuente de verdad en dominios factuales sin verificación.
- No hay información sobre sesgos, datos de entrenamiento ni filtros de seguridad; conviene aplicar moderación externa en producción.
- La longitud de contexto no está documentada, lo que limita la planificación de despliegues con conversaciones largas.
- El repositorio ocupa 25,1 GB en total por acumular todas las variantes; conviene descargar solo el archivo GGUF necesario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/koishi-instruct-3b-GGUF
- Variante imatrix: https://huggingface.co/mradermacher/koishi-instruct-3b-i1-GGUF
- Modelo base: https://huggingface.co/ewof/koishi-instruct-3b
- Dataset de ajuste: https://huggingface.co/datasets/ewof/koishi-instruct-metharme
- Página de descargas del autor: https://hf.tst.eu/model#koishi-instruct-3b-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
