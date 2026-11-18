# mradermacher/Sally-32B-GGUF

## Resumen

Sally-32B-GGUF es la versión cuantizada en formato GGUF del modelo Sally-32B, desarrollado originalmente por el usuario Juicesyo y publicada por mradermacher, un conocido generador de cuantizaciones de la comunidad. El modelo base es un transformer denso de 32.762.123.264 parámetros (aproximadamente 32,8 mil millones) que, según las etiquetas de la model card, se apoya en la arquitectura Qwen3 y fue afinado con la librería Unsloth. La licencia declarada es Apache 2.0.

El propósito de esta publicación no es ofrecer un modelo nuevo, sino facilitar el despliegue del modelo original en entornos con recursos limitados mediante cuantizaciones estáticas de llama.cpp en diez variantes que van desde Q2_K (12,4 GB) hasta Q8_0 (34,9 GB). Esto permite ejecutar un modelo de casi 33B en GPUs de consumo con suficiente VRAM, algo imposible con los pesos originales en precisión completa.

La relevancia de esta ficha radica en que el modelo está etiquetado exclusivamente para chino (`zh`), lo que lo convierte en una opción específica para aplicaciones en ese idioma, y en que la información pública disponible es muy escasa: no hay datos de benchmarks, ni de composición del dataset, ni de longitud de contexto declarada en la model card. Todo lo que sigue se limita a lo verificable en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen3 (según etiquetas de la model card) |
| Parametros totales | 32.762.123.264 (32,8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |
| Tamano del repositorio | 224,0 GB |
| Libreria declarada | transformers |
| Modelo base | Juicesyo/Sally-32B |
| Fecha de creacion | 2025-08-31 |
| Ultima actualizacion | 2026-11-18 |

## Arquitectura y entrenamiento

La información disponible indica que el modelo base Sally-32B emplea una arquitectura transformer densa de tipo Qwen3, con 32,8 mil millones de parámetros. La etiqueta `unsloth` sugiere que el ajuste fino se realizó con la librería Unsloth, orientada a entrenamiento eficiente en memoria, pero no se especifica si hubo RLHF, DPO ni qué tipo de dataset se utilizó. Tampoco se documenta el número de tokens de entrenamiento ni la composición de los datos.

La contribución técnica de esta publicación concreta es la cuantización estática mediante llama.cpp, con once variantes que cubren desde 2 hasta 8 bits. La model card menciona que existen cuantizaciones ponderadas con imatrix en un repositorio separado (`mradermacher/Sally-32B-i1-GGUF`), lo que habitualmente ofrece mejor calidad por bit que las cuantizaciones estáticas. No se documentan innovaciones arquitectónicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en chino, según la etiqueta `conversational` y el idioma declarado.
- Razonamiento y generación de texto general, heredado del modelo base Qwen3.
- Compatibilidad con `text-generation-inference` y `transformers`, según las etiquetas del repositorio.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documenta soporte de visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidades multilingües: no disponibles más allá del chino declarado.

## Casos de uso

- Asistente conversacional en chino: el modelo puede gestionar diálogos multi-turno en mandarín; la variante Q4_K_M (19,9 GB) es adecuada para servir respuestas con latencia razonable en una GPU de 24 GB.
- Generación de contenido editorial en chino: redacción de borradores, resúmenes y reescritura de textos; la cuantización Q6_K (27,0 GB) preserva mejor la calidad lingüística si se dispone de una GPU de 32 GB o más.
- Prototipado local en estaciones de trabajo: con Q4_K_S (18,9 GB) el modelo cabe en una RTX 4090 de 24 GB, lo que permite iterar sin depender de servicios en la nube.
- Investigación sobre cuantización: el repositorio ofrece once variantes del mismo modelo, lo que facilita estudios comparativos de degradación de calidad por bit y tipo de cuantización.
- Despliegue en entornos con VRAM limitada: la variante Q2_K (12,4 GB) permite ejecutar un modelo de 32,8B en GPUs de 16 GB, a costa de una pérdida de calidad no cuantificada en la model card.
- Fine-tuning posterior sobre dominio específico en chino: al ser Apache 2.0 y estar disponible en safetensors el modelo base, se puede partir de él para ajustes con Unsloth y luego cuantizar de nuevo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K 12,4 GB; Q3_K_S 14,5 GB; Q3_K_M 16,1 GB; Q3_K_L 17,4 GB; IQ4_XS 18,0 GB; Q4_K_S 18,9 GB; Q4_K_M 19,9 GB; Q5_K_S 22,7 GB; Q5_K_M 23,3 GB; Q6_K 27,0 GB; Q8_0 34,9 GB. Añadir entre 1 y 3 GB adicionales para el contexto KV según la longitud de secuencia.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M o Q5_K_M; RTX 3090 (24 GB) para las mismas variantes; A100 40 GB o H100 para Q6_K y Q8_0; GPUs de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) solo para Q2_K y Q3_K_S.
- Cabe en GPU de consumo: sí, desde Q2_K en 16 GB hasta Q6_K en 32 GB (RTX 5090 o configuraciones multi-GPU).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con GGUF; la model card también menciona compatibilidad con `text-generation-inference` para el modelo base.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Sally-32B-GGUF (este) | 32,8B | No disponible | Apache 2.0 | GGUF | Solo chino declarado; sin benchmarks publicados |
| Qwen3-32B | 32,8B (aproximado, según etiqueta qwen3) | No disponible en esta ficha | No disponible en esta ficha | safetensors, GGUF en repositorios de terceros | Modelo de referencia de la familia en la que se basa Sally |
| Juicesyo/Sally-32B | 32,8B | No disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar; requiere VRAM completa |

No se dispone de datos de rendimiento comparado para establecer diferencias cuantitativas con alternativas.

## Limitaciones y advertencias

- Idiomas: el modelo solo declara chino; su rendimiento en castellano o inglés no está documentado y probablemente sea limitado.
- Sesgos: no se documenta ninguna evaluación de sesgos; al ser un ajuste fino de origen comunitario sin model card detallada, el riesgo de sesgos no caracterizados es alto.
- Alucinación: no hay datos de evaluación que permitan estimar la tasa de alucinación; al tratarse de un modelo de 32B sin benchmarks publicados, conviene validar las salidas en producción.
- Contexto: la longitud de contexto no está declarada, lo que impide planificar aplicaciones con ventanas largas.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base podría arrastrar obligaciones adicionales no documentadas; conviene revisar el repositorio original de Juicesyo/Sally-32B antes de desplegar comercialmente.
- Producción: las cuantizaciones por debajo de Q4 pierden calidad de forma no cuantificada; la model card solo advierte "lower quality" en Q3_K_M. No hay garantías de soporte ni mantenimiento por parte del autor de la cuantización.
- Trazabilidad: el repositorio tiene 3 descargas y 0 likes en el momento de la consulta, lo que indica una adopción muy baja y ausencia de validación comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Sally-32B-GGUF
- Modelo base: https://huggingface.co/Juicesyo/Sally-32B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Sally-32B-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Sally-32B-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica de perplejidad por cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
