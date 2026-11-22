# Koshkasa/Nimbz_Gemma-4-Orthia-31B-IQ4_XS-GGUF-tied

## Resumen

Nimbz_Gemma-4-Orthia-31B-IQ4_XS-GGUF-tied es una cuantización GGUF en formato IQ4_XS de un modelo de lenguaje de 30.697.345.596 parámetros (aproximadamente 30,7 mil millones) derivado de la familia Gemma 4 de Google. El modelo original, Gemma-4-Orthia-31B, es un merge creado por el usuario Nimbz a partir de la arquitectura Gemma 4, y esta versión concreta ha sido publicada por Koshkasa como una edición del GGUF cuantizado previamente por mkzz127. El problema que resuelve esta variante es muy específico: elimina la duplicación de datos que suponía mantener la cabeza de salida (head) desatada del embedding de tokens, reduciendo el tamaño del fichero y el consumo de VRAM a costa de anular el ajuste de las filas del guion largo (em-dash) que el merge original aplicaba.

La relevancia de esta ficha es doble. Por un lado, documenta un caso práctico de ingeniería de cuantizaciones: cómo una decisión de diseño del merge (desatar la cabeza y escalar 25 filas del em-dash por 0,60) impacta en el tamaño del GGUF y en el despliegue real, y cómo un tercero puede revertir esa decisión mediante "tied embeddings" para adaptar el modelo a su caso de uso. Por otro, sirve como ejemplo de las limitaciones de trazabilidad en la cadena de derivados: el modelo base es a su vez un merge de un modelo propietario de Google, y la información disponible sobre datos de entrenamiento, benchmarks o idiomas es prácticamente nula.

El modelo se distribuye bajo licencia Apache 2.0 según los metadatos del repositorio, aunque conviene advertir que la licencia del Gemma 4 subyacente es la Gemma Terms of Use, no Apache 2.0, lo que genera una ambigüedad legal relevante para uso comercial. No hay pipeline declarado, no hay idiomas declarados y el repositorio no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4), merge de modelos; sin confirmación oficial de detalles internos |
| Parametros totales | 30.697.345.596 (30,7 B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ4_XS (esta versión); el modelo base admite otras cuantizaciones GGUF no documentadas aquí |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (metadatos del repo); el modelo base Gemma 4 subyacente se rige por Gemma Terms of Use |
| Formato de pesos | GGUF (IQ4_XS, con embeddings atados) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia Gemma 4, con 30,7 mil millones de parámetros. El modelo no ha sido entrenado desde cero por el autor de esta ficha: es un merge (fusión de pesos) realizado por Nimbz sobre el que se aplicó una cuantización IQ4_XS con imatrix generada por mkzz127, y posteriormente una edición por parte de Koshkasa para atar la cabeza de salida al embedding de tokens. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias en el merge original.

La innovación técnica destacable de esta versión es precisamente la operación de "tied embeddings". En el modelo original, la cabeza de salida (output.weight) estaba desatada y era igual al embedding de tokens (token_embd.weight) salvo en 25 filas correspondientes al em-dash, que habían sido escaladas por 0,60. La verificación con la librería gguf muestra que ambos tensores tienen forma (5376, 262144) y tipo Q6_K, con 1.156.055.040 bytes cada uno, y difieren en solo 11.005 bytes. Dado que mantener ambos tensores duplica aproximadamente 1,16 GB de datos en el fichero IQ4_XS, Koshkasa optó por atar la cabeza al embedding, eliminando la duplicación y anulando el ajuste del em-dash. El resto del merge se mantiene intacto. No hay información sobre técnicas como decodificación especulativa, atención lineal o modos de razonamiento extendido en la documentación disponible.

## Capacidades

- Generación de texto conversacional: el tag "conversational" del repositorio indica que el modelo está orientado a diálogo multi-turno.
- Razonamiento y conocimiento general: heredado de la familia Gemma 4, aunque sin benchmarks publicados que lo cuantifiquen en esta variante.
- Generación de código: capacidad esperable en modelos Gemma 4 de este tamaño, no verificada en la información disponible.
- Matemáticas: capacidad esperable, no verificada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; el repositorio no declara idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.
- Compatibilidad con endpoints: el tag "endpoints_compatible" sugiere que el GGUF puede servirse mediante infraestructura compatible con la API de Hugging Face.

## Casos de uso

- Despliegue en GPU de consumo con VRAM limitada: la versión atada reduce el peso del fichero en aproximadamente 1,16 GB respecto al GGUF original, lo que permite cargar el modelo IQ4_XS en tarjetas con 16-24 GB de VRAM usando llama.cpp u Ollama, a costa de renunciar al ajuste del em-dash.
- Chat conversacional autoalojado: el tag "conversational" y el formato GGUF lo hacen adecuado para asistentes de diálogo multi-turno en local, sin dependencia de APIs externas, siempre que se acepte la licencia y la falta de documentación sobre contexto.
- Experimentación con merges y cuantizaciones: este repositorio es un caso de estudio para investigadores que quieran reproducir la verificación de tensores atados/desatados con la librería gguf y evaluar el impacto en tamaño y calidad.
- Evaluación comparativa de variantes Orthia: útil para quienes quieran medir empíricamente si la eliminación del ajuste del em-dash afecta a la generación de guiones largos en textos en inglés o castellano.
- Prototipado de pipelines de inferencia con llama.cpp: el formato GGUF IQ4_XS es directamente consumible por llama.cpp, lo que permite integrarlo en scripts de generación por lotes para pruebas de concepto.
- Base para fine-tuning ligero o adaptadores: al ser un modelo de 30,7 B en cuantización agresiva, puede servir como base para LoRA o QLoRA en entornos con recursos moderados, aunque la cuantización IQ4_XS no es el formato ideal para entrenamiento.
- Docencia y divulgación sobre licencias de modelos derivados: el caso ilustra la diferencia entre la licencia declarada en el repo (Apache 2.0) y la del modelo fundacional (Gemma Terms of Use), un aspecto crítico en la formación de equipos de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos, y la model card se limita a describir la operación de atado de embeddings y a remitir al modelo base para detalles.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 16,7 GB, por lo que la inferencia en IQ4_XS requiere aproximadamente 17-18 GB de VRAM considerando overhead de contexto y caché KV, dependiendo de la longitud de contexto configurada.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40 GB, H100 80 GB. En GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) podría no caber con contexto amplio.
- ¿Cabe en GPU de consumo? Sí, en tarjetas de 24 GB como la RTX 4090 o la RTX 3090, y probablemente en 16 GB con contexto reducido y offloading parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; el tag "endpoints_compatible" sugiere compatibilidad con endpoints de Hugging Face. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requerirían conversión a safetensors.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Nimbz_Gemma-4-Orthia-31B-IQ4_XS-GGUF-tied (este) | 30,7 B | no disponible | apache-2.0 (metadatos) | GGUF IQ4_XS | Hugging Face, 0 descargas |
| Nimbz/Gemma-4-Orthia-31B (base) | 30,7 B | no disponible | no disponible | safetensors (presumible) | Hugging Face |
| mkzz127/Gemma-4-Orthia-31B-IQ4_XS-GGUF (cuantización original) | 30,7 B | no disponible | no disponible | GGUF IQ4_XS | Hugging Face |

La comparativa se limita a las variantes de la misma familia Orthia porque no se dispone de información sobre modelos alternativos de la misma categoría en la documentación proporcionada. La diferencia clave entre las tres es el atado de embeddings: la versión de mkzz127 mantiene la cabeza desatada con el ajuste del em-dash, mientras que esta versión la ata, reduciendo el tamaño del fichero en aproximadamente 1,16 GB.

## Limitaciones y advertencias

- Ambigüedad de licencia: el repositorio declara Apache 2.0, pero el modelo base es un merge de Gemma 4, cuya licencia es Gemma Terms of Use. El uso comercial debe revisarse con cuidado, ya que la licencia Apache 2.0 podría no ser aplicable a los pesos derivados del modelo fundacional.
- Pérdida del ajuste del em-dash: esta versión anula el escalado de 0,60 aplicado a 25 filas del em-dash en el merge original. Si el caso de uso depende de la generación controlada de guiones largos, esta variante puede comportarse de forma distinta al modelo base.
- Falta de documentación: no hay información sobre datos de entrenamiento, idiomas, contexto, benchmarks ni sesgos conocidos. La model card es puramente técnica sobre la operación de cuantización.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta escala, no cuantificado en la información disponible.
- Sesgos conocidos: no documentados; al ser un merge sin model card detallada, no hay evaluación de sesgos publicada.
- Limitaciones de contexto e idioma: no disponibles; el repositorio no declara ventana de contexto ni idiomas soportados.
- Trazabilidad de la cadena de derivados: el modelo pasa por al menos tres manos (Nimbz, mkzz127, Koshkasa), lo que dificulta la reproducibilidad y la atribución de cambios de comportamiento.
- Cero tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.
- Cuantización agresiva: IQ4_XS puede degradar la calidad en tareas de razonamiento complejo o código respecto a los pesos originales en safetensors.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Koshkasa/Nimbz_Gemma-4-Orthia-31B-IQ4_XS-GGUF-tied
- Modelo base: https://huggingface.co/Nimbz/Gemma-4-Orthia-31B
- Cuantización original de mkzz127: https://huggingface.co/mkzz127/Gemma-4-Orthia-31B-IQ4_XS-GGUF
- Librería gguf (verificación de tensores): https://github.com/ggerganov/ggml/tree/master/gguf-py
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
