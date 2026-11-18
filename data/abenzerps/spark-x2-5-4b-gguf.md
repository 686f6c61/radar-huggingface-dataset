# abenzerps/Spark-X2.5-4B-GGUF

## Resumen

Spark-X2.5-4B es un modelo de lenguaje de propósito general de 4.112 millones de parámetros desarrollado por XHToken, distribuido en formato GGUF por el usuario abenzerps. Está diseñado para tareas de razonamiento, generación de código, uso de herramientas y flujos de trabajo agénticos, con una ventana de contexto nativa de 1.048.576 tokens (1M). El repositorio que nos ocupa contiene únicamente las cuantizaciones GGUF del modelo base, no los pesos originales.

La relevancia de esta ficha radica en dos factores: por un lado, el contexto de 1M tokens en un modelo de solo 4B parámetros, lo que lo sitúa en una categoría poco habitual donde el coste de inferencia se mantiene bajo mientras se procesan documentos muy extensos; por otro, la disponibilidad de cuantizaciones ligeras (desde 2,41 GB en Q4_0) que permiten ejecutarlo en hardware de consumo.

El modelo base está publicado bajo licencia Apache-2.0, soporta inglés y chino, y requiere llama.cpp b10828 o posterior, ya que la arquitectura `spark2_5` se incorporó oficialmente en esa compilación. Las cuantizaciones incluidas van de Q4_0 a Q8_0 e incluyen la plantilla de chat del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | spark2_5 (soporte oficial en llama.cpp desde b10828); detalles internos no disponibles |
| Parametros totales | 4.112.079.360 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | Q4_0, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (repositorio de cuantizaciones); pesos originales del modelo base en formato no especificado |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de la etiqueta `spark2_5` que identifica su tipo en llama.cpp. No se especifica si se trata de un transformer denso, un modelo híbrido o una variante con atención lineal; tampoco se documentan el número de capas, la dimensión oculta ni la configuración de cabezas de atención. El tamaño de 4.112 millones de parámetros y el contexto nativo de 1M tokens son los únicos datos estructurales confirmados.

Tampoco se han publicado en la información proporcionada detalles sobre el corpus de entrenamiento (número de tokens, composición, proporción de código o multilingüismo), ni sobre si se aplicaron etapas de RLHF, DPO u otras técnicas de alineación. La model card del repositorio GGUF remite al modelo base para estos datos y solo menciona que los benchmarks reportados corresponden al modo "thinking", lo que sugiere la existencia de un modo de razonamiento extendido, aunque su funcionamiento no se describe.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento en modo "thinking" (los benchmarks citados se reportan en este modo).
- Generación de código, según la descripción del modelo base como modelo para "reasoning, coding, tool use".
- Uso de herramientas y function calling, mencionado explícitamente en la model card.
- Flujos de trabajo agénticos y razonamiento multi-paso.
- Procesamiento de contextos muy largos de hasta 1M tokens, útil para documentos extensos o conversaciones prolongadas.
- Compatibilidad con la plantilla de chat original incluida en el repositorio (`chat_template.jinja`).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).

## Casos de uso

- Análisis de documentación técnica extensa: con 1M tokens de contexto, el modelo puede ingerir manuales, especificaciones o bases de código completas en una sola pasada y responder preguntas sobre ellos sin necesidad de fragmentación ni recuperación externa.
- Asistencia en programación en local: las cuantizaciones Q4_K_M (2,60 GB) y Q5_K_M (2,98 GB) caben en GPUs de consumo, lo que permite integrar el modelo en editores o terminales mediante llama.cpp para autocompletado, explicación de código y generación de tests.
- Agentes automatizados con tool calling: la capacidad declarada de uso de herramientas permite construir agentes que consulten APIs, ejecuten comandos o encadenen pasos de razonamiento, con la ventaja de un modelo pequeño que reduce el coste por llamada.
- Resumen y extracción de información en corpus largos: actas, expedientes o informes de cientos de miles de tokens pueden procesarse en una única ventana, evitando la pérdida de contexto entre fragmentos.
- Despliegue en entornos con recursos limitados: la versión Q4_0 de 2,41 GB permite ejecución en CPU o en GPUs con poca VRAM, adecuada para prototipos, demos o estaciones de trabajo sin acelerador dedicado.
- Chat multilingüe inglés-chino: para productos dirigidos a ambos mercados, el modelo cubre conversación y generación en los dos idiomas declarados sin necesidad de un modelo mayor.
- Procesamiento por lotes en pipelines de datos: el tamaño reducido y la compatibilidad con llama.cpp facilitan ejecutar tareas de etiquetado, clasificación o transformación de texto a gran escala en hardware modesto.

## Benchmarks y rendimiento

La model card del repositorio incluye una imagen (`assets/benchmark.png`) con resultados reportados por XHToken para el modelo base en modo thinking, pero los valores numéricos no están disponibles en el texto proporcionado. No se han publicado cifras concretas de MMLU, HumanEval, GSM8K u otras pruebas en la información disponible, por lo que no se presenta tabla comparativa.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto): Q4_0 ~2,4 GB, Q4_K_M ~2,6 GB, Q5_K_M ~3,0 GB, Q6_K ~3,4 GB, Q8_0 ~4,4 GB. A estas cifras hay que sumar la memoria de la caché KV, que crece con la longitud de contexto y puede ser considerable si se explota la ventana de 1M tokens.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB para las cuantizaciones mayores con contextos moderados; A100 o H100 para contextos muy largos o despliegues concurrentes.
- Cabe en GPU de consumo: sí, todas las cuantizaciones caben en GPUs con 6-8 GB de VRAM para contextos cortos; para contextos de cientos de miles de tokens se necesita más memoria por la caché KV.
- Opciones de despliegue: llama.cpp (requiere b10828 o superior), y por extensión cualquier frontend basado en él (Ollama, LM Studio, servidores compatibles con la API de OpenAI mediante llama-server). No se confirma soporte en vLLM ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo que permitan una comparación cuantitativa fiable. A continuación se comparan únicamente características estructurales con alternativas de tamaño similar.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Spark-X2.5-4B (GGUF) | 4,1B | 1M | Apache-2.0 | GGUF | Contexto muy largo, en/zh, tool calling |
| Qwen2.5-3B / 7B | 3B / 7B | 32K (128K en variantes) | Apache-2.0 (mayoría) | safetensors, GGUF | Contexto menor, amplio ecosistema |
| Llama 3.2 3B | 3,2B | 128K | Llama 3.2 Community License | safetensors, GGUF | Licencia con restricciones, contexto menor |
| Phi-3.5-mini | 3,8B | 128K | MIT | safetensors, GGUF | Buen rendimiento en razonamiento, contexto menor |

La ventaja diferencial del Spark-X2.5-4B es la ventana de 1M tokens frente a los 32K-128K de sus competidores directos; la desventaja es la falta de datos públicos de rendimiento y un ecosistema más reducido.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks verificables en la información disponible; el rendimiento real en tareas concretas debe validarse por el usuario.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado y probablemente sea inferior.
- Riesgo de alucinación inherente a modelos de 4B parámetros, especialmente en tareas de razonamiento complejo o contextos muy largos.
- La ventana de 1M tokens no garantiza un uso efectivo de toda la información; la degradación en contextos extremos no está documentada.
- Requiere llama.cpp b10828 o superior; aplicaciones con runtime embebido deben actualizarse o fallarán al cargar el modelo.
- El repositorio contiene solo cuantizaciones GGUF; para fine-tuning o conversión a otros formatos hay que acudir al modelo base.
- Aunque la licencia Apache-2.0 permite uso comercial, conviene revisar la model card del modelo base por si añade condiciones adicionales.
- El consumo de memoria de la caché KV con contextos de cientos de miles de tokens puede superar con creces el de los pesos, lo que limita el despliegue en GPUs de consumo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/abenzerps/Spark-X2.5-4B-GGUF
- Modelo base: https://huggingface.co/XHToken/Spark-X2.5-4B
- PR de soporte en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/27868
- Solicitudes de modelos del autor: https://abenzerps.com/request-a-model/
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
