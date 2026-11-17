# mradermacher/ThinkingNuke-gemma-4-26B-A4B-GGUF

## Resumen

ThinkingNuke-gemma-4-26B-A4B es un modelo de lenguaje de tipo mezcla de expertos (MoE) derivado de la familia Gemma 4 de Google, afinado por krystofmitka para tareas de razonamiento con control de esfuerzo (*effort control*). El repositorio que nos ocupa, publicado por mradermacher, contiene únicamente las cuantizaciones estáticas en formato GGUF del modelo original en safetensors, lo que permite ejecutarlo en hardware de consumo mediante llama.cpp y derivados. El modelo base tiene 25.233.142.046 parámetros totales (aproximadamente 25,2 mil millones) y un nombre que sugiere 4 mil millones de parámetros activos por token, aunque este dato no se confirma en la información disponible.

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar un modelo de razonamiento de gran tamaño en entornos locales: los GGUF de mradermacher abarcan desde cuantizaciones de 2 bits hasta 8 bits, con un suplemento multimodal (`mmproj`) que sugiere capacidad de visión. La licencia declarada es Apache 2.0, si bien el enlace de licencia apunta a los términos específicos de Gemma 4 de Google, lo que introduce una ambigüedad que conviene revisar antes de un uso comercial.

El modelo está etiquetado como conversacional, orientado al inglés y compatible con endpoints, lo que facilita su integración en servicios tipo API. No obstante, la información pública disponible es muy escasa: no hay datos de benchmarks, de composición del dataset de entrenamiento ni de la longitud de contexto, por lo que muchas especificaciones se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en Gemma 4 (detalle exacto no disponible) |
| Parametros totales | 25.233.142.046 (25,2 B) |
| Parametros activos | 4 B (según el nombre del modelo; no confirmado en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS; suplementos mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es una variante de Gemma 4 con arquitectura de mezcla de expertos: el nombre "26B-A4B" indica 26 mil millones de parámetros totales y 4 mil millones activos, un patrón habitual en modelos MoE que activan solo una fracción de los expertos por token para reducir el coste computacional en inferencia. El sufijo "ThinkingNuke" y la etiqueta `effort-control` sugieren un afinado orientado a razonamiento con modos de pensamiento de esfuerzo variable, aunque no se detalla el mecanismo concreto ni si emplea RLHF, DPO u otra técnica de alineación.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el proceso de destilación o las innovaciones técnicas específicas (atención lineal, decodificación especulativa, etc.). El repositorio de mradermacher es una conversión puramente de cuantización: no añade entrenamiento ni modifica los pesos más allá de la compresión numérica. Los cuantizadores indican que las cuantizaciones ponderadas/imatrix no estaban disponibles en el momento de la publicación, solo las estáticas.

## Capacidades

- Generación de texto conversacional multi-turno, con etiqueta `conversational` en el repositorio.
- Razonamiento explícito con control de esfuerzo (*effort control*), presumiblemente mediante modos de pensamiento de distinta profundidad.
- Capacidad multimodal: la presencia de ficheros `mmproj` (proyección multimodal) indica soporte de entrada de imágenes en el modelo base, aunque no se detalla su alcance.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su exposición como API.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente, aunque el enfoque en razonamiento lo hace plausible.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Capacidades de código y matemáticas: no disponibles en la información proporcionada.

## Casos de uso

- Razonamiento local con control de esfuerzo: el modelo permite ajustar la profundidad de pensamiento según la tarea, de modo que consultas simples se resuelven con pocos tokens y problemas complejos activan cadenas de razonamiento más largas, optimizando latencia y coste en estaciones de trabajo con GPU de consumo.
- Asistente conversacional en inglés sobre GGUF: gracias a las cuantizaciones Q4_K_M y Q5_K_M, puede desplegarse con llama.cpp u Ollama en un equipo con 16-24 GB de VRAM para conversaciones multi-turno sin conexión a la nube.
- Análisis de documentos con imágenes: el suplemento `mmproj` permite procesar capturas, diagramas o documentos escaneados junto con texto, útil para tareas de extracción y resumen en entornos locales.
- Prototipado de pipelines de razonamiento: la compatibilidad con endpoints permite integrarlo tras una API compatible con OpenAI para experimentar con agentes y flujos multi-paso antes de migrar a infraestructura mayor.
- Evaluación comparativa de cuantizaciones: al ofrecer desde Q2_K hasta Q8_0, sirve para medir la degradación de calidad frente al coste de memoria en tareas de razonamiento, un caso habitual en investigación aplicada.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse íntegramente en local con pesos GGUF, es adecuado para procesar datos sensibles sin salida a servicios externos, siempre que se respete la licencia.
- Generación de texto asistida en inglés para documentación técnica: con 25,2 B de parámetros totales y 4 B activos, ofrece un equilibrio entre calidad y velocidad para redacción y resumen en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización, 25,2 B parámetros totales): Q2_K en torno a 9-10 GB; Q4_K_M en torno a 15-16 GB; Q8_0 en torno a 27-28 GB; f16 en torno a 50 GB. Estas cifras son estimaciones basadas en el tamaño de los parámetros y no en mediciones publicadas.
- GPU recomendadas: para Q4_K_M, una RTX 4090 (24 GB) o RTX 3090 (24 GB) resulta adecuada; para Q8_0 se recomienda A100 40 GB, H100 o RTX 6000 Ada (48 GB); para f16, A100 80 GB o H100 80 GB.
- Cabe en GPU de consumo: sí, en cuantizaciones Q2_K a Q5_K_M con tarjetas de 12-24 GB; Q6_K y Q8_0 requieren 24 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI si se dispone de suficiente VRAM.
- Latencia y throughput estimados: no disponibles. Al ser un MoE con 4 B activos, se espera un throughput superior al de un modelo denso de 25 B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ThinkingNuke-gemma-4-26B-A4B (este) | 25,2 B totales / 4 B activos | no disponible | apache-2.0 (enlace a Gemma 4) | GGUF, safetensors | Razonamiento con effort control, multimodal |
| Gemma 4 26B-A4B (base) | 25,2 B totales / 4 B activos | no disponible | Gemma 4 license | safetensors | Modelo base sin afinado de razonamiento |
| Mixtral 8x7B | 46,7 B totales / 12,9 B activos | 32 K | Apache 2.0 | safetensors, GGUF | MoE denso en expertos, sin control de esfuerzo |
| Qwen2.5-32B | 32,5 B densos | 128 K | Apache 2.0 | safetensors, GGUF | Denso, sin multimodal en la variante estándar |

La comparación con Mixtral y Qwen2.5 es orientativa por categoría de tamaño; no se dispone de datos de rendimiento del modelo evaluado que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada; al derivar de Gemma 4, hereda los sesgos del modelo base y de sus datos de entrenamiento.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no hay evaluaciones publicadas que cuantifiquen la tasa de alucinación.
- Limitaciones de contexto e idioma: el modelo está etiquetado únicamente para inglés y no se especifica la longitud de contexto, lo que impide garantizar ventanas largas.
- Restricciones de licencia: aunque el repositorio declara apache-2.0, el enlace de licencia apunta a los términos de Gemma 4 de Google, que pueden imponer condiciones adicionales al uso comercial; conviene verificar la licencia del modelo base antes de desplegarlo en producción.
- Cuantizaciones agresivas: Q2_K y Q3_K pueden degradar notablemente la calidad del razonamiento; se recomienda Q4_K_M o superior para tareas que dependan de cadenas de pensamiento.
- Ausencia de cuantizaciones ponderadas/imatrix: el autor indica que no estaban disponibles, lo que puede afectar la calidad relativa frente a cuantizaciones dinámicas.
- Falta de benchmarks: no hay evidencia publicada de rendimiento que respalde afirmaciones de calidad frente a alternativas.
- Naturaleza del repositorio: es una conversión de cuantización, no un modelo entrenado; los méritos y defectos provienen del modelo base de krystofmitka.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/ThinkingNuke-gemma-4-26B-A4B-GGUF
- Modelo base: https://huggingface.co/krystofmitka/ThinkingNuke-gemma-4-26B-A4B
- Página de descargas del cuantizador: https://hf.tst.eu/model#ThinkingNuke-gemma-4-26B-A4B-GGUF
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- README de referencia para GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
