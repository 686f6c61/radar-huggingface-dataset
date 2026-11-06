# SadikNawazAI/sadik-ai-medium-multilingual

## Resumen

SadikAI Medium es un modelo de lenguaje causal de tipo transformer decoder-only con 7.866.048 parámetros totales (de los cuales 1.574.592 son no ligados a embeddings), entrenado desde cero por Sadik Nawaz, un autor de 11 años, y publicado bajo el identificador `SadikNawazAI/sadik-ai-medium-multilingual`. El modelo se distribuye junto con una aplicación de chat local completa, un tokenizador BPE a nivel de bytes con vocabulario de 32.768 entradas y scripts de inferencia autónomos en PyTorch. El entrenamiento se realizó sobre 63,9 millones de tokens con 4.249 pasos de optimización, alcanzando una pérdida de validación de 2,9338 y una perplejidad de 18,8.

El interés del proyecto no reside en su rendimiento bruto, sino en su planteamiento: pesos deliberadamente pequeños para ejecutarse completamente offline en un PC doméstico sin GPU. La mayor parte de la funcionalidad útil de la release —matemáticas, respuestas de código, lecciones educativas, historias y poemas— proviene de una capa de aplicación curada que rodea al modelo, no del propio modelo neuronal, que es un modelo base de continuación de texto.

El modelo se etiqueta como multilingüe (inglés, hindi e hinglish) y cubre también código, matemáticas y conocimiento general. La licencia MIT facilita su uso, modificación y redistribución, aunque el tamaño del repositorio (0,0 GB según Hugging Face, sin descargas ni likes) sugiere una publicación muy reciente o con artefactos aún no materializados en el hub.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (causal-lm), entrenado desde cero |
| Parámetros totales | 7.866.048 (1.574.592 no-embedding) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (la release se distribuye como checkpoint `weights.pt` en punto flotante; no se listan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Inglés (en), hindi (hi), hinglish |
| Licencia | MIT |
| Formato de pesos | PyTorch (`model/weights.pt`) con JSON de arquitectura; tokenizador en `tokenizer/tokenizer.json` (BPE byte-level, vocab 32.768) |
| Tokens de entrenamiento | 63,9 M tokens (paso 4249) |
| Pérdida de validación / perplejidad | 2,9338 / 18,8 |
| Tamaño del repositorio | 0,0 GB (según Hugging Face) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only causal de 7,9 millones de parámetros, con un tokenizador BPE a nivel de bytes de 32.768 entradas. El autor indica que el modelo se entrenó desde cero sobre una mezcla de inglés, hindi, hinglish, código, matemáticas y conocimiento general, acumulando 63,9 millones de tokens en 4.249 pasos. La pérdida de validación reportada es de 2,9338, equivalente a una perplejidad de 18,8. No se especifican en la información disponible el número de capas, la dimensión del modelo, el número de cabezas de atención, la longitud de contexto máxima ni la composición exacta del corpus (el autor remite a `DATA_SOURCES.md` para fuentes y licencias, documento no incluido en la información proporcionada).

No se documenta el uso de RLHF, DPO ni técnicas de alineación posteriores al preentrenamiento, ni innovaciones como decodificación especulativa o atención lineal. La release se describe como un checkpoint de solo inferencia (`inference-only checkpoint`). El proyecto incluye además `export_release.py`, un script para regenerar la release a partir de un checkpoint de entrenamiento (`runs/medium/best.pt`), y `SHA256SUMS` con sumas de verificación de cada fichero.

## Capacidades

- Generación de texto por continuación de secuencia (modelo base de next-token prediction).
- Soporte de inglés, hindi e hinglish, según los metadatos de idioma.
- Cobertura declarada de código y matemáticas, si bien las respuestas de matemáticas y de código comunes se sirven desde una capa curada de la aplicación, no del modelo.
- Historias cortas y poemas: se generan desde una pequeña biblioteca curada, con el modelo como mecanismo de reserva (fallback).
- Lecciones educativas offline integradas en la aplicación: trabajo en equipo, religiones del mundo, respeto, amabilidad, técnicas de estudio, salud, primeros auxilios, seguridad en línea, ciencia, espacio, geografía, India, programación, nociones básicas de informática y educación financiera.
- Memoria entre sesiones en la aplicación de chat.
- Búsqueda de hechos en la web (componente de la aplicación, no del modelo).
- Generación de imágenes, audio de voz y ficheros PDF/Word/Excel/CSV, todo ello en la capa de aplicación.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, modo thinking, visión ni audio nativo en el modelo.

## Casos de uso

- Educación offline en entornos sin conectividad: la aplicación sirve lecciones curadas sobre ciencia, primeros auxilios, seguridad en línea o finanzas básicas a través de comandos como `/topics`, útil en escuelas o zonas con acceso limitado a internet.
- Asistente de estudio para estudiantes jóvenes: responde a preguntas como "how do I study better?" desde la capa de lecciones, con un modelo lo bastante pequeño para ejecutarse en un PC doméstico sin GPU.
- Práctica de conversación multilingüe inglés-hindi-hinglish: el modelo puede continuar texto en las tres variantes, adecuado para experimentos de generación en contextos educativos del sur de Asia.
- Demostración didáctica de entrenamiento de LLM: al ser un transformer de 7,9 M de parámetros entrenado desde cero con scripts de exportación y sumas de verificación incluidas, sirve como material de aprendizaje reproducible sobre el ciclo completo de preentrenamiento e inferencia.
- Generación creativa de reserva: cuentos y poemas cortos a partir de la biblioteca curada, con el modelo como fallback para variaciones.
- Prototipado de aplicaciones de chat con memoria: el servidor `app/chat_server.py` con memoria entre sesiones y búsqueda web puede servir de esqueleto para demos locales sin dependencia de APIs en la nube.
- Respuestas rápidas de matemáticas y código elemental: el modelo más la capa curada cubren consultas como "what is 12 x 13?" o "code for fibonacci in python" en un entorno local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta métricas de entrenamiento:

| Métrica | Valor |
|---|---|
| Pérdida de validación | 2,9338 |
| Perplejidad | 18,8 |
| Tokens de entrenamiento | 63,9 M |
| Pasos | 4.249 |

No hay datos de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 7,9 M de parámetros en punto flotante de 32 bits el checkpoint ronda las decenas de megabytes, por lo que cabe holgadamente en cualquier GPU de consumo e incluso en CPU.
- El autor afirma que el sistema completo se ejecuta offline en un PC doméstico sin GPU.
- GPU recomendadas: no disponible; cualquier GPU consumer (por ejemplo, gama RTX) sería más que suficiente, aunque no se especifican modelos concretos.
- Despliegue: el proyecto proporciona `generate.py` (sampler autónomo que solo requiere PyTorch) y `app/chat_server.py` (servidor de chat en el puerto configurable). No se mencionan vLLM, llama.cpp, Ollama ni TGI, y no se distribuyen pesos en formato GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de tamaño similar (por ejemplo, modelos de menos de 10 M de parámetros) ni datos de rendimiento que permitan una comparación rigurosa. Las alternativas habituales en la franja de modelos pequeños (SmolLM, TinyLlama, Qwen2.5-0.5B) son de uno a dos órdenes de magnitud mayores en parámetros y no se dispone de métricas comunes en la documentación facilitada.

## Limitaciones y advertencias

- El propio modelo es un modelo base de continuación de texto: no está alineado con instrucciones ni con preferencias humanas mediante RLHF o DPO.
- Gran parte de la utilidad percibida (matemáticas, código, lecciones, historias) proviene de la capa de aplicación curada, no del modelo; evaluar el modelo aislado dará resultados muy inferiores a los de la demo.
- Con 7,9 M de parámetros y 63,9 M de tokens de entrenamiento, la capacidad de conocimiento general y razonamiento es muy limitada; riesgo alto de incoherencias y de respuestas sin fundamento.
- Longitud de contexto no documentada; no se debe asumir una ventana amplia.
- Cobertura lingüística limitada a inglés, hindi e hinglish; no se declara castellano.
- Posibles sesgos derivados del corpus de entrenamiento; el autor remite a `DATA_SOURCES.md` para las fuentes y licencias, documento no verificado aquí.
- Licencia MIT: permite uso comercial, modificación y redistribución, con la obligación habitual de conservar el aviso de copyright y la licencia.
- El autor es un menor de edad; conviene tratar la atribución con cuidado y respetar los créditos indicados en la model card.
- El repositorio figura con 0,0 GB, 0 descargas y 0 likes: verificar la integridad de los ficheros con `SHA256SUMS` antes de usarlo en producción.
- No apto para producción en tareas que requieran fiabilidad factual, matemática o de código sin la capa curada.

## Enlaces

- Hugging Face: https://huggingface.co/SadikNawazAI/sadik-ai-medium-multilingual
- Ficheros de referencia citados en la release (no enlazados en la información disponible): `MODEL_CARD.md`, `DATA_SOURCES.md`, `PUBLISH.md`, `SHA256SUMS`, `generate.py`, `app/chat_server.py`, `export_release.py`
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de GitHub ni demos adicionales.
