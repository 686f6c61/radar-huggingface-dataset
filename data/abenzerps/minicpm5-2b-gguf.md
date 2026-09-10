# abenzerps/MiniCPM5-2B-GGUF

## Resumen

MiniCPM5-2B-GGUF es la colección de cuantizaciones en formato GGUF del checkpoint MiniCPM5-2B, publicado por el usuario abenzerps a partir del modelo original de OpenBMB. Se trata de un modelo denso de aproximadamente 2.000 millones de parámetros, de arquitectura tipo transformer decoder-only basada en Llama, pensado para despliegue local, razonamiento, generación de código, trabajo con contexto largo y uso de herramientas (tool calling). Su contexto nativo es de 131.072 tokens (128K), una cifra muy superior a la habitual en modelos de este tamaño.

La relevancia de esta publicación es eminentemente práctica: convierte un modelo de pesos originales (safetensors) en una familia de ficheros listos para ejecutarse con llama.cpp, con cuantizaciones que van desde 0,97 GB (IQ2_M) hasta 2,68 GB (Q8_0). Eso permite ejecutar un modelo de 128K de contexto en hardware de consumo, algo poco frecuente en la franja de 2B. La model card indica que el modelo es solo texto: no incluye proyector de visión ni ficheros MTP.

La licencia es Apache-2.0, tanto para el modelo base como para estas cuantizaciones, lo que facilita su uso comercial. Los idiomas declarados son inglés y chino. La información disponible no incluye cifras numéricas de benchmarks, ni detalles sobre el dataset de entrenamiento o el proceso de alineación del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso basado en Llama (según la model card del repositorio) |
| Parametros totales | 2B (aproximadamente 2.000 millones, según la denominación del modelo) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 131.072 tokens (128K) nativo |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_0, Q4_K_S, Q4_K_M, Q5_K_M, Q6_K, Q8_0, IQ2_M, IQ3_M, IQ4_XS (11 ficheros GGUF) |
| Idiomas soportados | Inglés (en) y chino (zh) según los metadatos del repositorio |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base original está en safetensors |
| Modelo base | openbmb/MiniCPM5-2B (revisión 3497c460c89e00520c3cfa2e73f49ab7647f1177) |
| Modalidad | Solo texto; sin proyector de visión ni ficheros MTP |
| Plantilla de chat | Plantilla upstream embebida en los GGUF; copia externa en chat_template.jinja |
| Tamano del repositorio | 17,1 GB |
| Descargas / likes | 3.537 descargas, 10 likes (en el momento de la consulta) |
| Fecha de creacion / actualizacion | 7 de septiembre de 2026 / 7 de septiembre de 2026 |

Tamaño de cada fichero de cuantización:

| Cuantizacion | Fichero | Tamano |
|---|---|---:|
| Q2_K | MiniCPM5-2B-Q2_K.gguf | 1,04 GB |
| Q3_K_M | MiniCPM5-2B-Q3_K_M.gguf | 1,29 GB |
| Q4_0 | MiniCPM5-2B-Q4_0.gguf | 1,49 GB |
| Q4_K_S | MiniCPM5-2B-Q4_K_S.gguf | 1,50 GB |
| Q4_K_M | MiniCPM5-2B-Q4_K_M.gguf | 1,56 GB |
| Q5_K_M | MiniCPM5-2B-Q5_K_M.gguf | 1,81 GB |
| Q6_K | MiniCPM5-2B-Q6_K.gguf | 2,07 GB |
| Q8_0 | MiniCPM5-2B-Q8_0.gguf | 2,68 GB |
| IQ2_M | MiniCPM5-2B-IQ2_M.gguf | 0,97 GB |
| IQ3_M | MiniCPM5-2B-IQ3_M.gguf | 1,23 GB |
| IQ4_XS | MiniCPM5-2B-IQ4_XS.gguf | 1,42 GB |

## Arquitectura y entrenamiento

La model card de este repositorio describe MiniCPM5-2B como un modelo denso de 2B basado en arquitectura Llama, orientado a despliegue local, código, razonamiento, contexto largo y uso de herramientas. No se proporcionan en la información disponible detalles sobre el número de capas, dimensiones ocultas, número de cabezas de atención, vocabulario ni configuración del KV cache del checkpoint original. Tampoco se indica si emplea innovaciones concretas como atención lineal, decodificación especulativa o algún esquema híbrido. La única característica estructural destacable confirmada es el contexto nativo de 131.072 tokens.

En cuanto al entrenamiento, no hay datos en la información proporcionada sobre el número de tokens vistos, la composición del dataset, la mezcla de idiomas, ni si hubo fases de RLHF, DPO u otro tipo de alineación. El proceso de conversión a GGUF sí está documentado: los ficheros Q4_0–Q8_0 se generaron con el commit `f114f91f9ed6792cf402437e3874adad98902744` de llama.cpp, mientras que los ficheros adicionales Q2_K, Q3_K_M, Q4_K_S, IQ2_M, IQ3_M e IQ4_XS usan el commit `67672dc5b76f8bc17785a19d3dc6d1463fc2902c`. Las cuantizaciones IQ emplean una importance matrix generada a partir de WikiText-2 y requieren compilaciones recientes de llama.cpp. Se incluyen sumas de verificación SHA-256 en `SHA256SUMS.txt`.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es text-generation y la model card describe uso conversacional, con plantilla de chat embebida.
- Razonamiento: el repositorio etiqueta el modelo para tareas de razonamiento, sin detallar modalidades específicas.
- Generación de código: listado explícitamente entre los casos de uso del modelo ("coding").
- Tool calling / function calling: incluido en las etiquetas (`tool-calling`). La propia model card advierte que el comportamiento de las llamadas a herramientas depende del parser y de la integración de API del runtime de servicio, y recomienda verificar las llamadas en la aplicación destino.
- Contexto largo: soporte nativo de hasta 131.072 tokens, lo que habilita tareas de resumen, análisis y recuperación sobre documentos extensos.
- Multilingüismo limitado: solo inglés y chino declarados en los metadatos.
- Sin capacidades multimodales: el modelo es solo texto; no se incluyen ficheros de proyector de visión ni MTP.
- Sin modo "thinking" explícito declarado en la información disponible.
- Compatible con servidor OpenAI-compatible mediante `llama-server`.

## Casos de uso

- Asistente local sin conexión: ejecutado con `llama-cli` o `llama-server` en un portátil o equipo de sobremesa, permite disponer de un asistente conversacional sin enviar datos a terceros. Un modelo de 2B con cuantización Q4_K_M ocupa 1,56 GB, por lo que cabe en equipos modestos.
- Análisis de documentación extensa: gracias a los 131.072 tokens de contexto, se puede cargar un manual técnico, un expediente o un repositorio de documentación completo en una sola ventana y hacer preguntas sobre su contenido sin necesidad de fragmentación previa.
- Generación y revisión de código en local: el modelo está etiquetado para coding y tool calling, de modo que puede integrarse en un flujo de autocompletado o revisión dentro del editor, con las llamadas a herramientas gestionadas por el runtime (por ejemplo, un servidor llama.cpp con API compatible con OpenAI).
- Agente con acceso a funciones: la ventana de 128K permite mantener un historial de razonamiento multi-paso largo; el modelo puede emitir llamadas a funciones que el orquestador ejecute (consultas a bases de datos, APIs internas), siempre verificando el formato de las llamadas en el runtime elegido, tal como advierte la model card.
- Resumen y extracción de información en inglés y chino: para flujos bilingües de análisis de contratos, correos o informes en esos dos idiomas, el modelo cubre ambos sin depender de servicios externos.
- Prototipado rápido de aplicaciones de IA: al ser Apache-2.0 y caber en una sola GPU de consumo, sirve como modelo de desarrollo antes de escalar a un modelo mayor, con la misma plantilla de chat y la misma API de servicio.
- Procesamiento por lotes en CPU: las cuantizaciones IQ2_M (0,97 GB) y Q2_K (1,04 GB) permiten ejecutar inferencia en CPU para tareas batch de clasificación, etiquetado o generación de borradores donde la latencia no es crítica.
- Chatbot de atención al cliente con contexto largo: al conservar un historial de hasta 128K tokens, permite conversaciones multi-turno muy extensas sin perder el hilo, aunque con las limitaciones de idioma y de fiabilidad propias de un modelo de 2B.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card del repositorio referencia dos imágenes (`assets/minicpm5-benchmark.png` y `assets/minicpm5-benchmark2.png`) con resultados de evaluación y un radar de capacidades, atribuidos por el autor a OpenBMB para el checkpoint original MiniCPM5-2B, pero los valores concretos no están incluidos en el texto proporcionado. No se deben inferir cifras de esas imágenes sin consultarlas directamente.

## Requisitos de hardware

Los pesos en VRAM/RAM dependen de la cuantización elegida; los tamaños siguientes son los de los ficheros GGUF publicados:

- Cuantizaciones mínimas: IQ2_M (0,97 GB) y Q2_K (1,04 GB). Ejecutables en CPU o en GPUs con 2-4 GB de memoria libre, a costa de mayor pérdida de calidad.
- Cuantizaciones intermedias: IQ3_M (1,23 GB), Q3_K_M (1,29 GB), IQ4_XS (1,42 GB), Q4_0 (1,49 GB), Q4_K_S (1,50 GB) y Q4_K_M (1,56 GB). Q4_K_M es la opción equilibrada habitual.
- Cuantizaciones altas: Q5_K_M (1,81 GB), Q6_K (2,07 GB) y Q8_0 (2,68 GB), para equipos con más memoria disponible y cuando se busca la menor degradación posible.
- Al tamaño de los pesos hay que sumar el KV cache, que crece de forma lineal con la longitud de contexto. La información proporcionada no incluye la configuración de atención del modelo, por lo que no se puede calcular el tamaño exacto del KV cache para 131.072 tokens. En la práctica, usar el contexto completo exige mucha más memoria que la indicada por el tamaño del fichero, y conviene activar la cuantización del KV cache en llama.cpp para reducirla.
- GPU de consumo: cualquier GPU con al menos 4 GB de VRAM puede ejecutar las cuantizaciones pequeñas y medias con contextos moderados (por ejemplo, 8K). Modelos como RTX 3060, RTX 4060, RTX 3070 o superiores son suficientes para Q4_K_M con contextos habituales.
- GPU de gama alta: A100, H100 o RTX 4090 aportan margen sobrado en memoria y mejor throughput, y son las opciones lógicas si se quiere explotar el contexto completo de 128K con varias peticiones concurrentes.
- Despliegue: la model card documenta `llama-cli` y `llama-server` (servidor con API compatible con OpenAI) sobre compilaciones recientes de llama.cpp que incluyan soporte de MiniCPM5. Las cuantizaciones IQ requieren específicamente builds recientes. No se mencionan explícitamente vLLM, TGI, Ollama o LM Studio en la información disponible, aunque al ser formato GGUF son compatibles en principio con runtimes que lo soporten; conviene verificarlo.
- Parámetros de muestreo recomendados por el autor: `--temp 1.0 --top-p 0.95`. El ejemplo usa `-c 8192` y se indica que puede subirse hasta 131072 si hay memoria suficiente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

La información proporcionada no incluye datos de rendimiento de modelos comparables, por lo que la comparación se limita a características estructurales verificables. Los datos de los modelos alternativos proceden de conocimiento público general y no de la búsqueda realizada; conviene verificarlos antes de tomar decisiones.

| Modelo | Parametros | Contexto | Licencia | Formato disponible |
|---|---|---|---|---|
| MiniCPM5-2B (esta ficha, GGUF de abenzerps) | ~2B denso | 131.072 tokens | Apache-2.0 | GGUF (11 cuantizaciones) |
| Qwen2.5-3B-Instruct | ~3B denso | 32.768 tokens (ampliable con YaRN) | Apache-2.0 en la mayoría de tamaños | safetensors, GGUF (comunidad) |
| Llama-3.2-3B-Instruct | ~3B denso | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF (comunidad) |
| Gemma-2-2B-it | ~2,6B denso | 8.192 tokens | Gemma Terms of Use | safetensors, GGUF (comunidad) |

Frente a estas alternativas, el punto diferencial de MiniCPM5-2B es la combinación de tamaño reducido, contexto nativo de 128K y licencia Apache-2.0, que no ofrecen ni Llama-3.2 (licencia propia con restricciones) ni Gemma-2 (contexto de 8K). No hay datos de benchmarks en la información disponible que permitan afirmar nada sobre la calidad relativa de sus respuestas.

## Limitaciones y advertencias

- Riesgo de alucinación: es un modelo de 2B parámetros; su fiabilidad factual es inherentemente menor que la de modelos mayores. No se deben usar sus salidas como fuente de verdad sin verificación.
- Idiomas: solo inglés (en) y chino (zh) están declarados en los metadatos. El rendimiento en castellano no está documentado y no debería asumirse.
- Tool calling dependiente del runtime: la propia model card advierte que el comportamiento de las llamadas a herramientas depende del parser y de la integración de API del servidor, y recomienda verificar las llamadas en la aplicación final antes de ponerlas en producción.
- Solo texto: no hay visión, audio ni otras modalidades; no se incluye proyector de visión ni ficheros MTP.
- Contexto largo y memoria: aunque el modelo soporte 131.072 tokens, usar ese contexto completo no sale gratis en memoria. El repositorio no documenta el tamaño del KV cache, y un contexto mal dimensionado puede provocar fallos de asignación de memoria.
- Cuantizaciones agresivas: IQ2_M, Q2_K e IQ3_M implican pérdida de calidad perceptible. Las cuantizaciones IQ requieren compilaciones recientes de llama.cpp; con versiones antiguas pueden no funcionar o dar resultados incorrectos. Se recomienda verificar los checksums de `SHA256SUMS.txt`.
- Este repositorio es una cuantización de terceros: el autor es abenzerps, no OpenBMB. Los posibles problemas de calidad deben contrastarse con el checkpoint original `openbmb/MiniCPM5-2B` antes de atribuirlos al modelo base.
- Licencia: Apache-2.0 permite uso comercial y modificación, pero conviene revisar también las condiciones del modelo base original y de los componentes derivados (plantilla de chat, importance matrix) si se redistribuye.
- Sin datos de sesgo ni de evaluación de seguridad: la información disponible no incluye evaluaciones de sesgo, toxicidad o seguridad, algo relevante antes de desplegar el modelo de cara al público.
- Fechas del repositorio: los metadatos indican creación y actualización en septiembre de 2026, posteriores a la fecha de esta consulta según el calendario habitual; conviene comprobar la vigencia y las revisiones posteriores del repositorio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/abenzerps/MiniCPM5-2B-GGUF
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Revisión concreta del modelo base: https://huggingface.co/openbmb/MiniCPM5-2B/tree/3497c460c89e00520c3cfa2e73f49ab7647f1177
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Checksums: https://huggingface.co/abenzerps/MiniCPM5-2B-GGUF/blob/main/SHA256SUMS.txt
- Plantilla de chat externa: https://huggingface.co/abenzerps/MiniCPM5-2B-GGUF/blob/main/chat_template.jinja
- Imagen de benchmarks citada en la model card: `assets/minicpm5-benchmark.png` (dentro del repositorio)
- Radar de capacidades citado en la model card: `assets/minicpm5-benchmark2.png` (dentro del repositorio)

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre el modelo, el autor o el proyecto MiniCPM5; los resultados obtenidos eran páginas genéricas sin relación con la ficha.
