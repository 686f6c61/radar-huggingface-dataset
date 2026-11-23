# mradermacher/Gemma3NPC-4B-post-thinking-GGUF

## Resumen

Gemma3NPC-4B-post-thinking-GGUF es la versión cuantizada en formato GGUF del modelo chimbiwide/Gemma3NPC-4B-post-thinking, un ajuste fino de la familia Gemma 3 de Google orientado a la interpretación de personajes no jugadores (NPC) en juegos de rol. El modelo base parte de la arquitectura Gemma 3 de 4B parámetros (3.880.263.168 parámetros reales según safetensors) y ha sido entrenado sobre el dataset chimbiwide/NPC-RP-Post-Thinking, un corpus de roleplay conversacional. Esta versión la publica mradermacher, especialista en cuantizaciones GGUF para llama.cpp y derivados.

La relevancia de esta ficha radica en que ofrece un modelo de rol conversacional especializado en un tamaño manejable (4B) y en múltiples niveles de cuantización, desde 1,8 GB (Q2_K) hasta 7,9 GB (f16), lo que permite desplegarlo en hardware de consumo. Al derivar de Gemma 3, hereda la licencia Gemma de Google, con las restricciones de uso que ello implica.

La información pública disponible es limitada: la model card del cuantizador se centra en los detalles técnicos de las cuantizaciones y no incluye datos de entrenamiento, benchmarks ni especificaciones detalladas del ajuste fino original. Los apartados que dependen de esos datos se marcan como "no disponible".

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3; detalles específicos del ajuste no disponibles) |
| Parametros totales | 3.880.263.168 (3,88B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; además mmproj-Q8_0 y mmproj-f16 (suplemento multimodal) |
| Idiomas soportados | en (inglés) según la model card |
| Licencia | gemma (licencia de uso de Google Gemma) |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base original en safetensors |

## Arquitectura y entrenamiento

El modelo base chimbiwide/Gemma3NPC-4B-post-thinking es un ajuste fino de Gemma 3 de 4B parámetros. La arquitectura subyacente es un transformer decoder-only de la familia Gemma 3, aunque la información proporcionada no detalla la composición exacta de capas, cabezas de atención ni mecanismos específicos (por ejemplo, atención local/global o ventana de contexto). El tag "post-thinking" sugiere un entrenamiento orientado a la generación de razonamiento previo a la respuesta, pero no se dispone de documentación técnica que lo confirme.

El ajuste fino se realizó sobre el dataset chimbiwide/NPC-RP-Post-Thinking, un corpus de roleplay conversacional orientado a personajes no jugadores. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, la presencia de RLHF/DPO ni otras innovaciones técnicas. La versión GGUF que nos ocupa es una cuantización estática realizada por mradermacher con llama.cpp, que preserva los pesos del modelo base en distintos niveles de precisión.

## Capacidades

- Generación de texto conversacional orientada a roleplay e interpretación de personajes (NPC).
- Diálogo multi-turno con mantenimiento de personaje, según el propósito del ajuste fino.
- Razonamiento previo a la respuesta (implícito en el nombre "post-thinking"), aunque no documentado formalmente.
- Soporte multimodal potencial: el repositorio incluye ficheros mmproj (Q8_0 y f16), lo que indica que el modelo base conserva la torre visual de Gemma 3 y puede procesar imágenes si se usa con el proyector multimodal adecuado.
- Capacidades multilingües: la model card declara únicamente inglés ("en"); no se confirma soporte de otros idiomas.
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).

## Casos de uso

- Interpretación de NPC en videojuegos: el modelo puede generar diálogos dinámicos y coherentes con la personalidad de un personaje no jugador, manteniendo el rol a lo largo de conversaciones multi-turno. Su tamaño de 4B y las cuantizaciones de 2-3 GB permiten ejecutarlo en el mismo equipo que el juego o en un servidor local de baja latencia.
- Prototipado de sistemas de rol conversacional: investigadores y desarrolladores pueden desplegar el modelo con llama.cpp u Ollama para experimentar con agentes de rol sin depender de APIs externas, gracias a los formatos GGUF listos para usar.
- Chatbots temáticos y asistentes de ficción: adecuado para aplicaciones de entretenimiento donde se requiere una voz de personaje consistente, con la ventaja de que las cuantizaciones Q4_K_S y Q4_K_M (2,5-2,6 GB) ofrecen un equilibrio entre calidad y velocidad.
- Despliegue en hardware de consumo: las cuantizaciones Q2_K a Q5_K caben en GPUs de 4-8 GB de VRAM o incluso en CPU, lo que facilita pruebas en portátiles y estaciones de trabajo modestas.
- Generación de contenido narrativo asistida: el modelo puede emplearse para redactar diálogos de personajes en guiones, novelas interactivas o módulos de rol de mesa, aprovechando su especialización en registro conversacional.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece hasta 12 variantes de cuantización, lo que permite medir el impacto de la precisión en la calidad del diálogo de rol y elegir el punto óptimo para producción.
- Investigación sobre ajuste fino especializado: sirve como caso de estudio de cómo un ajuste fino sobre Gemma 3 4B con un dataset de roleplay se traduce en un modelo GGUF distribuible, útil para quienes diseñan pipelines de cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de fichero GGUF, con overhead adicional de contexto y KV cache):
  - Q2_K: ~1,8 GB
  - Q3_K_S / Q3_K_M / Q3_K_L: ~2,0-2,3 GB
  - IQ4_XS: ~2,4 GB
  - Q4_K_S / Q4_K_M: ~2,5-2,6 GB
  - Q5_K_S / Q5_K_M: ~2,9 GB
  - Q6_K: ~3,3 GB
  - Q8_0: ~4,2 GB
  - f16: ~7,9 GB
  - Suplemento multimodal mmproj: 0,7 GB (Q8_0) o 1,0 GB (f16), adicional si se usa visión.
- GPU recomendadas: no hay recomendaciones oficiales. Por tamaño, una RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 o GPUs de datacenter (A100, H100) pueden alojar cualquier cuantización con holgura; para Q4_K_M basta con 4-6 GB de VRAM libre.
- Cabe en GPU de consumo: sí. Prácticamente cualquier GPU con 6 GB o más puede ejecutar Q4_K_M; las cuantizaciones Q2_K-Q3_K pueden caber en GPUs de 4 GB e incluso en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y otros frontends compatibles con GGUF. El tag "endpoints_compatible" sugiere compatibilidad con endpoints tipo OpenAI. No se documenta soporte de vLLM o TGI para esta versión GGUF (vLLM y TGI trabajan preferentemente con safetensors).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma3NPC-4B-post-thinking-GGUF (este) | 3,88B | no disponible | gemma | GGUF | Ajuste fino de rol/NPC sobre Gemma 3 4B |
| Gemma 3 4B (base) | ~4B | no disponible en esta ficha | gemma | safetensors, GGUF | Modelo generalista de Google; referencia de arquitectura |
| chimbiwide/Gemma3NPC-4B-post-thinking | 3,88B | no disponible | gemma | safetensors | Modelo original sin cuantizar del que deriva esta versión |
| Versión i1-GGUF (mradermacher) | 3,88B | no disponible | gemma | GGUF (imatrix) | Cuantizaciones ponderadas/imatrix del mismo modelo |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cualitativo frente a alternativas de rol o de propósito general.

## Limitaciones y advertencias

- Especialización estrecha: el ajuste fino está orientado a roleplay/NPC; su rendimiento en tareas generales (código, matemáticas, razonamiento formal) puede degradarse respecto al Gemma 3 4B original.
- Idiomas: la model card declara únicamente inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Riesgo de alucinación: como todo modelo generativo, puede inventar información, especialmente fuera de su dominio de especialización.
- Sesgos: no se documentan evaluaciones de sesgo; al derivar de Gemma 3 y de un dataset de roleplay, puede reproducir estereotipos presentes en los datos.
- Licencia Gemma: el uso comercial está sujeto a los términos de la licencia de Google Gemma, que incluye restricciones de uso aceptable y obligaciones de atribución; es necesario revisarla antes de desplegar en producción.
- Contexto y ventana: no se dispone de la longitud de contexto efectiva del ajuste fino; conviene validarla empíricamente antes de diseñar aplicaciones con conversaciones largas.
- Cuantizaciones agresivas: Q2_K y Q3_K_M pueden degradar notablemente la calidad del diálogo; para producción se recomienda Q4_K_M o superior.
- Multimodalidad: requiere descargar y configurar los ficheros mmproj además del GGUF principal; no está documentado el procedimiento exacto para este modelo.
- Datos de entrenamiento no verificables: no hay información pública sobre composición, tamaño o filtrado del dataset NPC-RP-Post-Thinking, lo que dificulta evaluar riesgos de contaminación o calidad.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/Gemma3NPC-4B-post-thinking-GGUF
- Modelo base original: https://huggingface.co/chimbiwide/Gemma3NPC-4B-post-thinking
- Dataset de entrenamiento: https://huggingface.co/datasets/chimbiwide/NPC-RP-Post-Thinking
- Cuantizaciones imatrix del mismo modelo: https://huggingface.co/mradermacher/Gemma3NPC-4B-post-thinking-i1-GGUF
- Página de resumen de descargas del cuantizador: https://hf.tst.eu/model#Gemma3NPC-4B-post-thinking-GGUF
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
