# mradermacher/SiriusAI-Text2SQL-9b-agentic-v1-GGUF

## Resumen

El repositorio `mradermacher/SiriusAI-Text2SQL-9b-agentic-v1-GGUF` contiene una colección de cuantizaciones en formato GGUF del modelo `xian-tan/SiriusAI-Text2SQL-9b-agentic-v1`, un modelo de aproximadamente 8,95 mil millones de parámetros orientado a la generación de consultas SQL (Text2SQL) con comportamiento agéntico. La cuantización la publica mradermacher, un autor conocido por redistribuir modelos en GGUF para su uso con llama.cpp y herramientas compatibles, no el desarrollador original del modelo base.

El modelo base no incluye en la información disponible detalles sobre arquitectura, datos de entrenamiento, longitud de contexto ni licencia, por lo que buena parte de sus especificaciones quedan sin confirmar. El repositorio ofrece trece cuantizaciones que van desde 3,9 GB (Q2_K) hasta 18,0 GB (f16), además de dos ficheros mmproj (proyector multimodal) en f16 y Q8_0, lo que sugiere que el modelo base podría aceptar entradas multimodales, extremo que no se confirma en la model card del repositorio de cuantización.

Su relevancia es limitada y muy específica: se trata de una alternativa de bajo coste de despliegue para tareas de traducción de lenguaje natural a SQL en entornos locales, con la salvedad de que no hay benchmarks publicados, no se declara licencia y el repositorio registra cero descargas y cero valoraciones en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 8.953.803.264 (≈ 8,95 mil millones) |
| Parámetros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; más mmproj-f16 y mmproj-Q8_0 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (el repositorio base `xian-tan/SiriusAI-Text2SQL-9b-agentic-v1` se distribuye en formato de transformers, presumiblemente safetensors; no confirmado en la información disponible) |
| Autor de la cuantización | mradermacher |
| Modelo base | xian-tan/SiriusAI-Text2SQL-9b-agentic-v1 |
| Tamaño del repositorio | 83,0 GB (suma de todas las cuantizaciones) |
| Fecha de creación / actualización | 2026-09-26 / 2026-09-26 |
| Descargas / valoraciones | 0 / 0 |
| Etiquetas | transformers, gguf, en, endpoints_compatible, conversational, region:us |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base: la model card del repositorio de cuantización solo documenta el proceso de conversión y cuantización, no la topología de la red ni el número de capas, cabezas de atención o dimensión oculta. Tampoco se detalla si emplea atención completa, atención lineal, mezcla de expertos o alguna variante híbrida, ni si incorpora un modo de razonamiento explícito pese a la etiqueta "agentic" del nombre.

En cuanto al entrenamiento, no se han publicado datos sobre el número de tokens, la composición del dataset, el uso de RLHF, DPO u otras técnicas de alineación, ni sobre el método de tokenización o el vocabulario. El único dato técnico verificable es el proceso aplicado por mradermacher: conversión desde el formato de transformers (`convert_type: hf`), cuantización de tensores de salida (`output_tensor_quantised: 1`) y cuantización estática (no ponderada por matriz de importancia), según los metadatos internos del README. Los ficheros `mmproj` incluidos apuntan a un posible componente multimodal en el modelo base, pero no hay confirmación en la información disponible.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` declarada por el repositorio.
- Generación de consultas SQL a partir de descripciones en lenguaje natural, ya que el modelo base se denomina explícitamente Text2SQL.
- Comportamiento agéntico según el nombre del modelo base; no se detalla en la información disponible en qué consiste ese comportamiento (uso de herramientas, múltiples pasos, autocorrección de consultas).
- Posible soporte multimodal: el repositorio publica los ficheros `mmproj-f16` y `mmproj-Q8_0`, que en el ecosistema llama.cpp se emplean como proyector para entrada de imágenes. La model card no confirma esta capacidad.
- Idioma: únicamente inglés (`en`); no se declara soporte multilingüe.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agentes y razonamiento multi-paso: no disponibles (no documentadas).
- Capacidad de ejecución local en CPU y GPU mediante llama.cpp, al distribuirse en GGUF.
- Etiqueta `endpoints_compatible`, que indica compatibilidad con infraestructuras de inferencia que consumen modelos GGUF.

## Casos de uso

- Asistente de consultas sobre bases de datos internas: el modelo recibe el esquema de tablas y una pregunta en inglés ("¿cuántos pedidos se enviaron tarde el mes pasado?") y devuelve la sentencia SQL correspondiente, que se ejecuta en un entorno controlado.
- Generación de SQL para herramientas de analítica self-service: integrado en un panel de BI para que usuarios sin conocimientos de SQL obtengan consultas a partir de descripciones textuales.
- Aceleración del trabajo de analistas de datos: borrador automático de consultas complejas con múltiples `JOIN` y agregaciones que el analista revisa y ajusta, reduciendo el tiempo de escritura manual.
- Migración y refactorización de consultas: traducción de consultas escritas para un dialecto a otro, o reescritura de SQL legado a un estilo consistente, siempre con validación posterior.
- Documentación de bases de datos: generación de consultas de ejemplo a partir del diccionario de datos para incluirlas en documentación técnica o en pruebas.
- Test de integración de pipelines de datos: creación automática de consultas de verificación que comprueben invariantes en las tablas tras cada carga ETL.
- Despliegue en local con requisitos de privacidad: al caber en GPU de consumo con las cuantizaciones Q4_K_M (5,7 GB) o Q5_K_M (6,6 GB), permite procesar esquemas y consultas de bases de datos sensibles sin enviar datos a servicios externos.
- Prototipado rápido en portátiles: la cuantización Q2_K (3,9 GB) o Q3_K_S (4,4 GB) permite ejecutar el modelo en equipos con poca VRAM o solo con CPU, a costa de una pérdida de calidad no medida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Ni el repositorio de cuantización ni los metadatos consultados incluyen cifras de MMLU, HumanEval, GSM8K, Spider, BIRD ni de cualquier otro conjunto de evaluación de Text2SQL. Tampoco se ofrecen mediciones de latencia o throughput. La única información cuantitativa publicada por el autor de la cuantización son los tamaños de fichero y las notas cualitativas de calidad que se reproducen en la sección de requisitos de hardware.

## Requisitos de hardware

- Tamaño de cada cuantización (dato publicado en la model card): Q2_K 3,9 GB; Q3_K_S 4,4 GB; Q3_K_M 4,7 GB (calidad inferior); Q3_K_L 5,0 GB; IQ4_XS 5,3 GB; Q4_K_S 5,5 GB (rápida, recomendada); Q4_K_M 5,7 GB (rápida, recomendada); Q5_K_S 6,4 GB; Q5_K_M 6,6 GB; Q6_K 7,5 GB (muy buena calidad); Q8_0 9,6 GB (rápida, mejor calidad); f16 18,0 GB (16 bits por peso, "overkill" según el autor).
- VRAM estimada para inferencia: el tamaño del fichero más la caché KV del contexto utilizado y el overhead del runtime. No hay datos publicados de contexto, por lo que no puede calcularse con precisión el consumo de la caché KV; como referencia orientativa, una cuantización Q4_K_M de 5,7 GB suele requerir en torno a 7-8 GB de VRAM con contextos moderados, y Q8_0 (9,6 GB) en torno a 11-12 GB.
- GPU de consumo: las cuantizaciones Q4_K_S y Q4_K_M (5,5-5,7 GB) caben en tarjetas de 8 GB como RTX 3060 Ti, RTX 3070 o RTX 4060. Q5_K_M (6,6 GB) y Q6_K (7,5 GB) requieren 8-12 GB (RTX 3080, RTX 4070, RTX 3060 de 12 GB). Q8_0 (9,6 GB) exige al menos 12 GB (RTX 4070 Ti, RTX 4080) y f16 (18,0 GB) requiere GPU de 24 GB (RTX 3090, RTX 4090).
- GPU de centro de datos: A100 (40/80 GB), H100, L40S o similares permiten ejecutar cualquier cuantización y, presumiblemente, el modelo base sin cuantizar de forma holgada.
- Despliegue en CPU: viable con llama.cpp u Ollama usando las cuantizaciones Q4 o inferiores; también es posible el reparto parcial entre CPU y GPU (offloading por capas).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui y otros runtimes compatibles con GGUF. vLLM admite GGUF de forma experimental, pero es preferible usar safetensors para despliegues de alta concurrencia. La etiqueta `endpoints_compatible` sugiere compatibilidad con servicios de inferencia gestionados.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para ninguna cuantización ni hardware.

## Comparativa con modelos similares

No hay datos de rendimiento del modelo evaluado, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad declarados públicamente. Los datos de las alternativas deben verificarse en sus fichas oficiales.

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| SiriusAI-Text2SQL-9b-agentic-v1 (GGUF de mradermacher) | 8,95 B | no disponible | no disponible | Text2SQL agéntico, solo inglés |
| Qwen2.5-Coder-7B | 7,6 B | 32.768 tokens (ampliable con YaRN) | Apache-2.0 | Código y SQL, multilingüe |
| SQLCoder-7B-2 (defog) | 6,7 B | 4.096 tokens | CC BY-SA 4.0 | Text2SQL especializado |
| Llama-3.1-8B-Instruct | 8,03 B | 128.000 tokens | Licencia comunitaria de Llama 3.1 | Propósito general con capacidad de código y SQL |

Diferencias relevantes: frente a estas alternativas, el modelo evaluado no publica licencia ni contexto, lo que dificulta su adopción en producción; además, solo declara inglés, mientras que Qwen2.5-Coder y Llama 3.1 son multilingües y tienen condiciones de uso claramente definidas. Su ventaja potencial es la especialización en Text2SQL agéntico, que no puede confirmarse sin benchmarks públicos.

## Limitaciones y advertencias

- Licencia no disponible: no se puede determinar si el uso comercial está permitido. Es un bloqueo habitual en procesos de adopción empresarial y debe resolverse consultando el repositorio del modelo base (`xian-tan/SiriusAI-Text2SQL-9b-agentic-v1`) antes de cualquier despliegue.
- Ausencia total de benchmarks: no hay evidencia publicada de precisión en generación de SQL (por ejemplo, exactitud de ejecución en Spider o BIRD), por lo que la calidad real del modelo es desconocida.
- Riesgo de alucinación estructural: en tareas Text2SQL, los errores típicos incluyen referencias a tablas o columnas inexistentes, `JOIN` incorrectos, agregaciones mal planteadas y dialectos incompatibles con el motor de destino. Toda consulta generada debe validarse antes de ejecutarse.
- Riesgo de seguridad en bases de datos: una consulta generada puede contener operaciones destructivas (`DELETE`, `DROP`, `UPDATE` masivo). Es imprescindible ejecutar el modelo con un usuario de base de datos de solo lectura y en un entorno aislado.
- Limitación de idioma: solo se declara inglés. El rendimiento con esquemas, comentarios o preguntas en castellano no está documentado y probablemente sea inferior.
- Longitud de contexto desconocida: limita la capacidad de procesar esquemas de bases de datos grandes, un requisito habitual en Text2SQL sobre almacenes de datos con cientos de tablas.
- Adopción nula: cero descargas y cero valoraciones en el momento de la consulta, lo que implica ausencia de validación independiente, de informes de errores y de comunidad de soporte.
- Degradación por cuantización: las cuantizaciones Q2_K y Q3_K reducen la precisión numérica de forma notable. El propio autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S y Q4_K_M como equilibrio entre velocidad y calidad. Para tareas sensibles a la exactitud, como la generación de SQL, conviene usar Q5_K_M o superior.
- Comportamiento "agéntico" no especificado: no se documenta qué herramientas soporta, cómo se invocan ni qué formato de mensajes espera, lo que obliga a ingeniería inversa del prompt de chat.
- Soporte multimodal sin confirmar: la presencia de ficheros `mmproj` no garantiza que el modelo base haya sido entrenado para entrada de imágenes; podría tratarse de un artefacto del proceso automático de cuantización.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/SiriusAI-Text2SQL-9b-agentic-v1-GGUF
- Modelo base: https://huggingface.co/xian-tan/SiriusAI-Text2SQL-9b-agentic-v1
- Página resumen de cuantizaciones del autor: https://hf.tst.eu/model#SiriusAI-Text2SQL-9b-agentic-v1-GGUF
- Peticiones de modelos y preguntas frecuentes de mradermacher: https://huggingface.co/mradermacher/model_requests
- README de referencia sobre uso de ficheros GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica comparativa de perplejidad entre tipos de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
