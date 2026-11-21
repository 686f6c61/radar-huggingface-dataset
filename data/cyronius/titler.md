# Cyronius/titler

## Resumen

titler es un modelo minúsculo especializado en una única tarea: convertir un prompt de usuario en un título corto de 3 a 8 palabras en formato Title Case. Lo desarrolla Cyronius y se publica en Hugging Face bajo licencia Apache 2.0 (con doble licencia MIT/Apache 2.0 según la model card). No es un modelo de propósito general: no resume, no traduce y no responde preguntas; su función es generar etiquetas legibles para conversaciones, hilos o historiales de chat.

El repositorio contiene dos generaciones. La v2 es un modelo con arquitectura Llama de 8 capas, vocabulario de 4.352 tokens y 5,84 millones de parámetros, distribuido como GGUF Q4_K_M de 4,1 MB. La v1.5, conservada por compatibilidad, es un T5 encoder-decoder de 3+3 capas, vocabulario de 8.192 tokens y 7,61 millones de parámetros (el dato de safetensors del repositorio, 7.606.784), con variantes ONNX y GGUF.

Su relevancia está en el extremo opuesto a los modelos grandes: inferencia en CPU, offline, sin telemetría, con unos 25 MB de memoria tras la carga y latencias de decenas de milisegundos. Está pensado para integrarse en aplicaciones de escritorio, extensiones de navegador o servicios ligeros donde no tiene sentido invocar un LLM de miles de millones de parámetros solo para titular una conversación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | v2: Llama (decoder-only), 8 capas. v1.5: T5 encoder-decoder, 3+3 capas |
| Parametros totales | v2: 5,84 M. v1.5: 7,61 M (7.606.784 en safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | v2: lee los primeros 256 tokens de entrada (unos 1.000 caracteres en inglés). v1.5: truncado a 512 tokens en el ejemplo de uso |
| Tipos de cuantizacion | v2: Q4_K_M. v1.5: F16, Q8_0, Q6_K, Q4_0 (GGUF) e int8 (ONNX) |
| Idiomas soportados | inglés únicamente (el resto de idiomas no está soportado) |
| Licencia | Apache 2.0 (doble licencia MIT o Apache 2.0, a elección) |
| Formato de pesos | v2: GGUF. v1.5: safetensors, ONNX y GGUF |

## Arquitectura y entrenamiento

La v2 es un transformer decoder-only con la arquitectura Llama estándar, 8 capas, vocabulario de 4.352 tokens y cuantización Q4_K_M. Al ser un GGUF convencional, cualquier runtime basado en llama.cpp puede cargarlo, aunque el autor advierte que los resultados medidos dependen de su motor `titler`, que aporta la tokenización, la búsqueda por haces (beam search) y la limpieza posterior del título. Sin ese motor hay que implementar tokenización y postprocesado propios, y los títulos diferirán de los reportados. La generación usa por defecto 4 haces; con 1 haz el tiempo se reduce aproximadamente a la mitad con una calidad algo inferior.

El entrenamiento de la v1.5 se hizo desde cero sobre unas 481.000 parejas prompt → título. Para la v2, los prompts (sin las respuestas del modelo) provienen de WildChat, OpenAssistant (oasst2), Chatbot Arena y LMSYS-Chat-1M, con una etapa de texto general usando FineWeb-Edu. Los títulos de entrenamiento los generó Qwen3-14B, y OpenAI gpt-6-luna escribió unos miles adicionales. Se eliminaron las filas con contenido sexual que involucra a menores. No se documentan en la información disponible detalles sobre RLHF, DPO ni el número total de tokens de entrenamiento.

## Capacidades

- Generación de títulos cortos (3 a 8 palabras) en Title Case a partir de un prompt.
- Salida determinista: la misma entrada produce siempre la misma salida.
- Procesamiento de los primeros 256 tokens del texto de entrada, suficiente para prompts típicos de chat.
- Inferencia en CPU, offline y sin telemetría, con unos 25 MB de memoria tras la carga.
- Distribución multiplataforma mediante el motor `titler`: crate de Rust, biblioteca C (C, C++, C#, Go, Swift, Java), wheel de Python, paquete npm `titler-wasm` y comando de shell.
- Ejecución en navegador mediante WebAssembly (v2) y mediante Transformers.js con backend WASM (v1.5, pipeline `text2text-generation`).
- No soporta tool calling, function calling, razonamiento multi-paso, visión ni audio.
- No es multilingüe: solo inglés.

## Casos de uso

- Titulado automático de conversaciones en asistentes de chat: al abrir un hilo nuevo, el modelo genera una etiqueta legible a partir del primer mensaje del usuario en decenas de milisegundos, sin coste de API ni envío de datos a terceros.
- Historiales y barras laterales de aplicaciones de mensajería: permite nombrar sesiones de forma consistente y determinista, de modo que la misma conversación conserva siempre el mismo título entre recargas.
- Extensiones de navegador y aplicaciones web: la variante WebAssembly ejecuta el modelo localmente en el cliente (50–175 ms típicos), lo que encaja con requisitos de privacidad estrictos.
- Organización de registros de soporte técnico: titula tickets o correos a partir de la primera línea del usuario para facilitar el triaje y la búsqueda en paneles internos.
- Etiquetado de datasets y logs de conversación: al procesar lotes de prompts de forma offline, genera títulos homogéneos para anotar o indexar grandes volúmenes de interacciones.
- Aplicaciones de escritorio y utilidades CLI: la biblioteca C, el crate de Rust o el comando de shell permiten integrar el titulado en herramientas nativas sin dependencias de Python ni GPU.
- Prototipado y demos educativas: con 4,1 MB y arquitectura Llama estándar, sirve para ilustrar pipelines de inferencia en CPU, cuantización GGUF y despliegue WASM.

## Benchmarks y rendimiento

| Metrica | v2 | v1.5 |
|---|---|---|
| Victoria en comparación por pares frente a v1.5 | ~65% de los pares con ganador | referencia |
| ROUGE-L frente al profesor | no disponible | 0,513 |
| Cumplimiento de formato | no disponible | 99,8% |
| Latencia en llama.cpp (4 haces) | 18 ms típica; 48 ms en el 5% más lento | no disponible |
| Latencia nativa en Rust, un hilo | 40–70 ms típica; 200–275 ms en el 5% más lento | no disponible |
| Latencia en navegador (WebAssembly) | 50–175 ms | no disponible |
| Latencia en CPU (int8 ONNX) | no disponible | ~160–220 ms |

Rendimiento de las cuantizaciones GGUF de la v1.5 frente a la línea base F16 en un conjunto de 100 prompts reservados (greedy, temperatura 0):

| Cuantizacion | Tamano | ROUGE-L vs profesor | Salidas distintas de F16 |
|---|---:|---:|---|
| F16 | 15,4 MB | 0,484 | línea base |
| Q8_0 | 8,3 MB | 0,485 | 6/100, solo paráfrasis |
| Q6_K | 6,4 MB | 0,490 | 11/100, solo paráfrasis |
| Q4_0 | 5,0 MB | 0,465 | 29/100, mayoritariamente paráfrasis, algunas desviaciones de tema |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia está pensada para CPU.
- Memoria: unos 25 MB tras la carga del modelo v2.
- Tamaño en disco: 4,1 MB para el GGUF Q4_K_M de la v2; 5–15 MB para los artefactos de la v1.5 (10,3 MB el ONNX int8, 15,4 MB el GGUF F16).
- GPU recomendadas: no aplica; cualquier GPU sería sobredimensionada para este modelo.
- Cabe en cualquier GPU de consumo y en dispositivos de gama baja, pero su uso previsto es CPU.
- Despliegue: llama.cpp (recomendado para la v2 y para la v1.5), ONNX Runtime con Optimum para la v1.5, Transformers.js con backend WASM en navegador o Node, y el motor `titler` (Rust, C, Python, npm, CLI).
- LM Studio y Ollama no ejecutan correctamente el modelo T5 de la v1.5; para esa versión hay que usar llama.cpp.
- Latencia: 18 ms típica y 48 ms en el percentil 95 más lento con llama.cpp; 50–175 ms en navegador con WebAssembly.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Notas |
|---|---|---|---|---|---|
| Cyronius/titler v2 | 5,84 M | 256 tokens de entrada | Titulado de prompts | MIT/Apache 2.0 | GGUF de 4,1 MB, CPU, determinista |
| Cyronius/titler v1.5 | 7,61 M | 512 tokens (truncado en el ejemplo) | Titulado de prompts | MIT/Apache 2.0 | T5, ONNX y GGUF, ~160–220 ms en CPU int8 |
| LLM de propósito general (p. ej. Qwen3-14B) | miles de millones | miles de tokens | Múltiple, incluido titulado | variable | Usado aquí como profesor para generar títulos; coste y latencia muy superiores |
| Modelos T5 pequeños tipo t5-small | ~60 M | 512 tokens | Traducción, resumen, generación | Apache 2.0 | 10 veces más parámetros y sin especialización en titulado |

No se dispone de comparaciones publicadas con otros modelos específicos de generación de títulos en la información proporcionada.

## Limitaciones y advertencias

- Solo titula: no resume, no traduce y no responde preguntas.
- Solo inglés; otros idiomas no están soportados.
- Lee únicamente los primeros 256 tokens de entrada, por lo que prompts largos o con contexto relevante al final pueden producir títulos pobres.
- Entradas difíciles, como logs pegados o frases vagas de una línea, generan títulos peores que los prompts ordinarios.
- Puede omitir apóstrofos en posesivos (por ejemplo, "Nick Wildes Judy Hopp Dialog Line"); ocurrió en 1 de 1.064 títulos evaluados.
- Riesgo de alucinación bajo en la práctica por la naturaleza de la tarea, pero puede introducir temas o términos no presentes en la entrada cuando el prompt es ambiguo.
- La calidad medida depende del motor `titler`; usar el GGUF directamente con otra tokenización o sin limpieza produce resultados distintos a los reportados.
- La v1.5 no funciona correctamente en LM Studio ni en Ollama; requiere llama.cpp.
- Licencia permisiva (MIT o Apache 2.0), sin restricciones conocidas para uso comercial; los datasets de entrenamiento no se redistribuyen en el repositorio y sus licencias se detallan en NOTICE.md.
- El modelo se publicó con fecha de creación 2026-08-31 y actualización 2026-10-20 según los metadatos del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/Cyronius/titler
- Código fuente, aplicaciones y documentación: https://github.com/Cyronius/model-experiments/tree/main/titler
- Demo en navegador (WebAssembly): https://cyronius.github.io/model-experiments/titler/
- Guía de integración del motor: https://github.com/Cyronius/model-experiments/blob/main/titler/app/EMBEDDING.md
- Historial de experimentos: https://github.com/Cyronius/model-experiments/blob/main/titler/EXPERIMENTS.md
- Releases (biblioteca C, wheel de Python, npm, CLI): https://github.com/Cyronius/model-experiments/releases
