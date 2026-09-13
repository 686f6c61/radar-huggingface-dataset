# ngquocvinh/NeoHorse-1-4B-GGUF

## Resumen

NeoHorse-1-4B-GGUF es un repositorio de cuantizaciones GGUF de la comunidad, publicado por el usuario ngquocvinh, sobre el modelo TokenRhythm/NeoHorse-1-4B. No se trata de un modelo nuevo ni de un ajuste fino: el propio autor indica que la única transformación aplicada es el cambio de formato de almacenamiento mediante cuantización GGUF, sin entrenamiento adicional. El modelo de origen es un transformer causal decoder-only de aproximadamente 4.000 millones de parámetros, de tipo text-only, post-entrenado a partir de Qwen3.5-4B y orientado a agentes basados en texto, uso de herramientas, código, seguimiento de instrucciones y conversación.

La relevancia de esta publicación es práctica: convierte un modelo de 4B con una ventana de contexto nativa declarada de 262.144 tokens en artefactos ejecutables en llama.cpp, lo que permite desplegarlo en hardware de consumo. Ahora bien, el estado del repositorio es preliminar. La model card indica explícitamente que "la evaluación y la cuantización están en curso" y que los ficheros solo se listarán cuando pasen la conversión directa desde BF16 y las pruebas de humo en tiempo de ejecución; en el momento de redactar esta ficha no hay artefactos publicados, ni mediciones de fidelidad, ni tabla de benchmarks propia.

El repositorio tiene 0 descargas y 0 likes, y se declara como una cuantización comunitaria no oficial, sin respaldo ni afiliación con TokenRhythm. La licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (post-entrenado desde Qwen3.5-4B); detalles de capas y atención no disponibles |
| Parámetros totales | Aproximadamente 4.000 millones (según la model card) |
| Parámetros activos | No aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | 262.144 tokens nativos según la card del modelo upstream; el contexto práctico depende del runtime, la memoria, la configuración de KV cache y la carga de trabajo |
| Tipos de cuantizacion | No disponible; el repositorio se anuncia como GGUF, pero los ficheros aún no se han publicado y no se enumeran los niveles previstos |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF para llama.cpp (los pesos originales del modelo base son safetensors, no confirmado en la información disponible) |

## Arquitectura y entrenamiento

La información disponible describe NeoHorse-1-4B como un modelo de lenguaje causal text-only de aproximadamente 4B de parámetros, post-entrenado por TokenRhythm a partir de Qwen3.5-4B para "arneses de agente" basados en texto, uso de herramientas, programación, seguimiento de instrucciones y uso conversacional. No se detalla en la información proporcionada el número de capas, la configuración de atención (MHA, GQA, MQA), la composición del dataset de post-entrenamiento, el número de tokens vistos ni si se emplearon técnicas de alineación como RLHF, DPO o similares. La model card remite al repositorio upstream para el informe técnico, la tabla de benchmarks original y las notas de despliegue.

En lo que respecta a este repositorio concreto, no hay entrenamiento ni ajuste fino: la única modificación es la cuantización del formato de pesos. El autor fija una revisión upstream bloqueada, `56f0584bb40578a2c33b1b40a08ccd17243ad710`, y anuncia que el paquete final documentará el hash del origen BF16, el hash de la matriz de importancia específica del modelo, la revisión del conversor y del runtime, los comandos de cuantización, las sumas de verificación de los artefactos y las pruebas de carga y generación. Los registros detallados de construcción y evaluación permanecen en local. Los pesos de visión no están incluidos en la release text-only upstream, por lo que tampoco formarán parte de estas cuantizaciones.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones, heredadas del modelo base post-entrenado.
- Razonamiento de varios pasos orientado a tareas de agente, según las etiquetas declaradas (agentic, reasoning).
- Uso de herramientas y function calling (etiqueta tool-use en la model card).
- Generación y asistencia en código (etiqueta coding).
- Soporte de modo razonamiento explícito: el ejemplo de uso de la card emplea la opción `--reasoning off`, lo que implica que el runtime contempla un modo de razonamiento activable o desactivable mediante plantilla de chat.
- Plantilla de chat propia (`chat_template.jinja`) compatible con el modo `--jinja` de llama.cpp.
- Capacidades multilingües: no disponible; la card no enumera idiomas soportados.
- Capacidades de visión: no incluidas en esta release (pesos de visión ausentes en el modelo text-only upstream).
- Capacidades de audio: no disponibles.

## Casos de uso

- Agentes de automatización con uso de herramientas: el modelo está post-entrenado para arneses de agente y function calling, de modo que puede encadenar llamadas a APIs externas y razonamiento multi-paso dentro de un bucle de agente orquestado por el desarrollador.
- Asistencia de programación en local: al ejecutarse en formato GGUF sobre llama.cpp, permite integrar autocompletado, explicación de código y generación de parches en entornos sin conectividad o con requisitos de privacidad estrictos.
- Procesamiento de documentos largos: la ventana nativa declarada de 262.144 tokens permite analizar repositorios completos, expedientes o contratos extensos sin troceado agresivo, siempre que la memoria disponible permita mantener la caché KV correspondiente.
- Atención al cliente multi-turno: el modelo mantiene conversaciones con historial largo, lo que reduce la pérdida de contexto en sesiones prolongadas frente a modelos de 4B con ventanas de 8K o 32K.
- Generación aumentada por recuperación (RAG) sobre corpus extensos: la ventana larga permite insertar muchos fragmentos recuperados en un único prompt, simplificando la fase de reranking.
- Despliegue embebido o en el borde: con cuantizaciones de 4 bits, el modelo cabe en GPUs de consumo e incluso en equipos con CPU y suficiente RAM, lo que habilita asistentes locales en portátiles o estaciones de trabajo sin acelerador dedicado.
- Evaluación e investigación de cuantización: al publicar el autor métricas de fidelidad contra la referencia BF16, el repositorio puede servir para estudiar la degradación por nivel de cuantización en modelos de 4B con contexto muy largo. Esta funcionalidad aún no está disponible porque las mediciones no se han publicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de este repositorio GGUF no incluye tabla de benchmarks y remite a la card oficial del modelo upstream para los datos originales. La sección de fidelidad de la card indica que las mediciones se añadirán tras una evaluación fija de retención contra la referencia GGUF BF16, y que hasta entonces la página no formula ninguna afirmación de calidad ni de "mejor cuantización". Tampoco se han publicado latencias ni métricas de throughput.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo aproximado a partir de 4.000 millones de parámetros, no confirmado por el autor): BF16 en torno a 8 GB solo en pesos; Q8_0 alrededor de 4,5 GB; Q6_K alrededor de 3,5 GB; Q5_K_M alrededor de 3 GB; Q4_K_M alrededor de 2,5-2,8 GB; Q3_K_M alrededor de 2 GB; Q2_K alrededor de 1,6 GB. Hay que sumar la caché KV, que con contexto muy largo puede superar ampliamente el tamaño de los pesos.
- GPU recomendadas: no especificadas por el autor. Para BF16 sin cuantizar, una GPU de 16-24 GB (RTX 4090, A100 40 GB, H100) resulta holgada para el modelo, pero no para agotar 262.144 tokens de contexto.
- GPU de consumo: sí cabe con cuantizaciones de 4 bits o inferiores en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090), ajustando `-c` a un valor razonable.
- Opciones de despliegue: llama.cpp (`llama-cli` y `llama-server`), Ollama, LM Studio, koboldcpp y otras interfaces basadas en GGUF. El soporte de GGUF en vLLM es parcial y no está confirmado para este repositorio.
- Flags de ejecución sugeridos por el autor: `--chat-template-file chat_template.jinja`, `--jinja`, `--reasoning off`, `-ngl 99` para descargar todas las capas en GPU y `-c 4096` como ejemplo conservador de contexto.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (únicamente páginas genéricas de YouTube), por lo que la comparación se limita a los datos declarados en la card y a características generales de la categoría. Los datos de los modelos comparativos deben verificarse en sus fichas oficiales.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| NeoHorse-1-4B (GGUF, este repositorio) | ~4B | 262.144 tokens nativos (declarado por la card upstream) | Apache 2.0 | Repositorio creado, artefactos aún no publicados |
| TokenRhythm/NeoHorse-1-4B | ~4B | 262.144 tokens nativos | Apache 2.0 | Pesos upstream publicados, text-only |
| Qwen3.5-4B | No disponible | No disponible | No disponible | Modelo de partida del post-entrenamiento |
| Otros modelos de ~4B de la misma categoría (Qwen3-4B, Llama-3.2-3B) | ~3-4B | No disponible en la información proporcionada | Apache 2.0 (Qwen3) y licencia comunitaria propia (Llama 3.2), verificar | Ampliamente disponibles con cuantizaciones comunitarias |

No se dispone de datos de rendimiento comparativos que permitan establecer una jerarquía objetiva entre estas alternativas.

## Limitaciones y advertencias

- Artefactos no publicados: en el momento de redactar esta ficha no hay ficheros GGUF disponibles para descarga, por lo que el repositorio no es utilizable todavía.
- Sin mediciones de fidelidad: el autor declara que no formula ninguna afirmación de calidad ni de mejor cuantización hasta que se publique la evaluación contra la referencia BF16. Se desconoce la degradación real por nivel de cuantización.
- Sin benchmarks: no hay datos propios de MMLU, HumanEval, GSM8K ni de tareas de agente para esta versión cuantizada.
- Contexto nativo frente a contexto práctico: los 262.144 tokens son la cifra declarada por la card upstream; el contexto utilizable depende de la memoria, la configuración de caché KV y el runtime, y muy probablemente sea muy inferior en hardware de consumo.
- Modelo text-only: no hay capacidades de visión, y tampoco de audio según la información disponible.
- Idiomas: no se especifican los idiomas soportados, lo que impide garantizar un rendimiento aceptable en castellano sin evaluación previa.
- Riesgo de alucinación: no se documentan tasas de alucinación ni evaluaciones de veracidad para el modelo base ni para esta cuantización.
- Sesgos: no se documenta ningún análisis de sesgos ni de seguridad.
- Licencia: el modelo se distribuye bajo Apache 2.0 según la card upstream, pero al derivar de Qwen3.5 conviene verificar los términos aplicables a la cadena completa de modelos antes de un uso comercial. Esta cuantización es una publicación comunitaria, no oficial y sin respaldo de TokenRhythm.
- Procedencia comunitaria: al ser una cuantización de terceros, la trazabilidad depende de los hashes y manifiestos que el autor promete publicar, aún no disponibles.
- Requisitos de runtime: el uso de `--jinja` y de la plantilla de chat requiere una versión reciente de llama.cpp; versiones antiguas pueden no interpretar correctamente la plantilla.

## Enlaces

- Repositorio de la cuantización GGUF: https://huggingface.co/ngquocvinh/NeoHorse-1-4B-GGUF
- Modelo base: https://huggingface.co/TokenRhythm/NeoHorse-1-4B
- Revisión upstream bloqueada: `56f0584bb40578a2c33b1b40a08ccd17243ad710`
- Apoyo al autor de la cuantización: https://ko-fi.com/ngquocvinh
- Informe técnico, tabla de benchmarks original y notas de despliegue: no disponibles en este repositorio; se remite a la card upstream
- Resultados de búsqueda web sobre el modelo: sin resultados relevantes (solo páginas genéricas de YouTube)
