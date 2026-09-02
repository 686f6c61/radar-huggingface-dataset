# andreilevchenko/Qwen3.8-Whittle-MoE-27B-A17.8B

## Resumen

Whittle MoE 27B (A17.8B) es un modelo de mezcla de expertos (MoE) construido a posteriori a partir del modelo denso Qwen3.8-27B de Alibaba. El autor, andreilevchenko (también publicado bajo el usuario logic65), aplica una cirugía arquitectónica: en cada una de las 64 capas, la red feed-forward densa de 17 408 neuronas se corta en 64 «slivers» de experto de ancho 192 más un experto compartido de ancho 5120, de modo que la suma exacta reproduce el ancho original sin inventar pesos nuevos. Un router por capa selecciona 16 de los 64 slivers por token, activando así 17.8B de los 26.9B parámetros totales. El modelo se presenta como una demostración de que un MoE post hoc puede recuperarse entrenando únicamente los routers, congelando todos los expertos, y luego refinando con SFT multi-turno y destilación de respuestas completas.

La relevancia actual reside en que aborda el problema de los MoE creados por partición de modelos densos, que inicialmente producen salidas incoherentes (el autor reporta 4 aciertos de 39 en su batería de conocimiento tras el tallado), y demuestra que el entrenamiento dirigido de los routers puede recuperar gran parte del conocimiento original. La versión v2.2.1 (publicada el 29 de agosto de 2026) corrige además un defecto de razonamiento que hacía que el modelo terminara su turno dentro de su propia cadena de pensamiento, sustituyendo las 64 tensores de compuerta del experto compartido por otras entrenadas sobre trazas reales de razonamiento. El modelo se distribuye con licencia Apache-2.0 y está disponible en formato safetensors y GGUF, con una versión cuantizada Q4_K_M que cabe en 24 GB de VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (partición post hoc de Qwen3.8-27B), 64 capas, atención híbrida 3:1 gated deltanet / atención completa (16 capas de atención), hidden size 5120 |
| Parametros totales | 26 917 297 664 (≈26.9B) |
| Parametros activos | 17.8B (16 de 64 slivers por token por capa, más experto compartido) |
| Longitud de contexto | no disponible (el modelo base Qwen3.8-27B soporta hasta 256K según fuentes externas; el ejemplo de inferencia usa 8192) |
| Tipos de cuantizacion | safetensors (FP16) y GGUF (Q4_K_M, entre otros; los GGUF de v2.2 aún no reconstruidos en v2.2.1) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

La arquitectura es una partición del modelo denso Qwen3.8-27B, no un rediseño. Las 64 capas conservan intacto el lado de atención del padre: una mezcla híbrida 3:1 de capas gated deltanet y capas de atención completa, con 16 capas de atención en total y tamaño oculto 5120. La cirugía se realiza únicamente en la red feed-forward: el FFN denso de ancho 17 408 se divide en 64 slivers de experto enrutados de ancho 192 más un experto compartido siempre activo de ancho 5120. La aritmética es exacta: 64 × 192 + 5120 = 17 408, sin pesos FFN nuevos. Un router ligero por capa selecciona 16 de los 64 slivers por token, de modo que cada token procesa 8192 del ancho FFN original, resultando en 17.8B parámetros activos de 27B totales.

Recién tallado, el modelo producía salidas incoherentes (4 de 39 en la batería de conocimiento del autor). El entrenamiento se realizó en varias fases: primero se entrenaron únicamente los 64 routers congelando todos los expertos, lo que recuperó 27 de 39 aciertos, demostrando que el conocimiento permanecía en los slivers y que los routers solo necesitaban aprender a activarlos. Posteriormente se aplicó SFT multi-turno sobre datasets como ultrachat_200k (MIT), tulu-3-sft-mixture (ODC-BY) y CodeFeedback-Filtered-Instruction (Apache-2.0), junto con un corpus propio, y rondas de destilación de respuestas completas generadas por el modelo padre. La versión v2.2.1 sustituye las 64 tensores de compuerta del experto compartido por otras entrenadas sobre trazas reales de razonamiento del padre, corrigiendo un defecto que hacía que el modelo terminara su turno dentro de su propia cadena de pensamiento. No se menciona el uso de RLHF o DPO.

## Capacidades

- Generación de texto y conversación multi-turno: mantiene diálogos coherentes y termina los turnos de forma limpia en el 85 % de los casos (medición del autor).
- Razonamiento con modo pensamiento: soporta cadenas de pensamiento (reasoning) que se abren y cierran correctamente tras la corrección v2.2.1; con razonamiento desactivado, las respuestas se detienen limpiamente en 34 de 36 casos.
- Generación de código: puede escribir código funcional, aunque la salida estructurada (SQL, HTML, tablas Markdown) degenera en el 39 % de los casos.
- Conocimiento factual: recupera hechos generales con una puntuación de 28 de 39 en la batería interna del autor, con algunas regresiones puntuales (p. ej., capital de Egipto) y recuperaciones (río más largo, montaña más alta, primer caminante lunar).
- Capacidades multilingües: no especificadas; se heredan presumiblemente del modelo base Qwen3.8-27B, pero no hay datos confirmados.
- Sin soporte explícito de tool calling ni function calling documentado.
- Sin capacidades de visión ni audio.

## Casos de uso

- Prototipado rápido de asistentes conversacionales: el modelo puede mantener diálogos multi-turno con terminación de turno fiable (85 %), lo que lo hace útil para maquetar chatbots en entornos de desarrollo antes de migrar a un modelo mayor.
- Generación de código asistida en entornos controlados: puede producir fragmentos de código Python u otros lenguajes con supervisión humana, aprovechando su entrenamiento sobre CodeFeedback-Filtered-Instruction; se recomienda validar siempre la salida.
- Análisis de documentos con verificación manual: su capacidad para recuperar hechos concretos (28/39 en la batería interna) permite usarlo como apoyo en tareas de extracción de información, siempre que un humano valide los resultados.
- Experimentación académica sobre MoE post hoc: el modelo es un caso de estudio público sobre cómo recuperar conocimiento de un MoE tallado entrenando solo los routers, útil para investigación en eficiencia de parámetros y enrutamiento.
- Despliegue en hardware modesto: su versión Q4_K_M cabe en 24 GB de VRAM y puede dividirse entre dos GPUs de 12 GB, permitiendo ejecutar un MoE de 27B en equipos de consumo o estaciones de trabajo pequeñas.
- Evaluación de técnicas de destilación de respuestas: el proceso de entrenamiento documentado (con rutas de datos y fallos públicos) sirve como referencia para investigar cómo destilar razonamiento de un modelo denso a un MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona mediciones propias de un harness de evaluación interno, que deben tratarse como mediciones de taller y no como comparativas formales:

| Metrica | Valor (v2.2.1) |
|---|---|
| Batería de conocimiento (39 preguntas) | 28/39 |
| Tasa de bucle en respuestas largas individuales | 8 % |
| Tasa de bucle en conversaciones | 7 % |
| Tasa de bucle en salida estructurada | 22 % |
| Respuestas silenciosas o truncadas | 0 % |
| Terminación limpia de turno (con razonamiento, 24 prompts) | 21/24 (frente a 3/24 antes de la corrección) |
| Terminación limpia de turno (sin razonamiento, n=36) | 34/36 |
| Recuento exacto de elementos distintos (n=36) | 24/36 |
| Media de repetición de 4-gramas | 0.141 (objetivo 0.05) |
| Listas largas de 45+ elementos | 4/12 y 5/12 (débil) |

## Requisitos de hardware

- VRAM estimada para inferencia: 24 GB con cuantización Q4_K_M (según el autor); para FP16 (safetensors) se necesitarían aproximadamente 54 GB (27B × 2 bytes) más overhead.
- GPU recomendadas: el ejemplo del autor usa llama.cpp con `-ngl 99` (offload completo), lo que sugiere una GPU de 24 GB (p. ej., RTX 4090, A5000) o dos GPUs de 12 GB (p. ej., RTX 3080/3090 en configuraciones SLI/NVLink).
- Compatibilidad con GPU de consumo: sí, en su versión Q4_K_M cabe en una RTX 4090 (24 GB) o en dos RTX 3060/3080 de 12 GB.
- Opciones de despliegue: llama.cpp (usado en el ejemplo del autor con `llama-server`), GGUF compatible con Ollama (existe una entrada en el registro de Ollama) y potencialmente vLLM o TGI si se convierten los pesos safetensors, aunque no hay documentación oficial al respecto.
- Latencia y throughput: no disponibles; el autor no publica mediciones de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Whittle-MoE-27B-A17.8B | 26.9B | 17.8B | no disponible (base 256K) | Apache-2.0 | MoE post hoc, research preview |
| Qwen3.8-27B (modelo base) | 27B | 27B | 256K | Apache-2.0 | Denso, padre del Whittle |
| Mixtral 8x7B (referencia de mercado) | 46.7B | 12.9B | 32K | Apache-2.0 | MoE nativo, ampliamente desplegado |

No se dispone de datos de rendimiento comparativo entre estos modelos en benchmarks estándar. El Whittle MoE es significativamente más pequeño que Mixtral en parámetros totales y activos, pero su licencia y formato GGUF lo hacen accesible. Su principal diferencia es el origen post hoc: no fue diseñado como MoE desde el inicio, sino tallado de un denso, lo que introduce limitaciones específicas (debilidad en salida estructurada, repetición en listas largas) que no están presentes en MoE nativos como Mixtral.

## Limitaciones y advertencias

- Salida estructurada débil: el 39 % de las generaciones de SQL, HTML y tablas Markdown degeneran, lo que lo hace poco fiable para tareas que requieren formatos estrictos.
- Aritmética deficiente: hereda la debilidad del modelo base en cálculo numérico; no es adecuado para tareas que requieran precisión matemática.
- Repetición en listas largas: las listas de 45 o más elementos fallan en más de la mitad de los casos (4/12 y 5/12), y la media de repetición de 4-gramas (0.141) supera ampliamente el objetivo del autor (0.05).
- Alucinaciones y palabras inventadas: se reportan «palabras inventadas ocasionales y números dañados» heredados de la compresión MoE; el conocimiento factual tiene una regresión clara (capital de Egipto) y recuperaciones parciales.
- Riesgo de sesgos: no se han evaluado sesgos de género, raza o cultura; el modelo se entrenó sobre datasets mayoritariamente en inglés (ultrachat, tulu, CodeFeedback) y no se documenta su comportamiento multilingüe.
- Estado de investigación: es un research preview autofinanciado con presupuesto de cómputo agotado (el autor solicita donaciones); no hay garantías de mantenimiento ni soporte.
- Estado de los GGUF: los archivos GGUF publicados aún contienen la compuerta v2.2, no la v2.2.1 corregida; si se sirve una versión cuantizada, se recomienda mantener el razonamiento desactivado hasta que se republiquen.
- Licencia: Apache-2.0 permite uso comercial sin restricciones de atribución, pero al ser un modelo derivado de Qwen3.8-27B, deben respetarse los términos de la licencia del modelo base (también Apache-2.0).

## Enlaces

- Repositorio HuggingFace (autor original): https://huggingface.co/andreilevchenko/Qwen3.8-Whittle-MoE-27B-A17.8B
- Repositorio HuggingFace (usuario logic65): https://huggingface.co/logic65/Qwen3.8-Whittle-MoE-27B-A17.8B
- Entrada en Ollama: https://ollama.com/Whittle/Qwen3.8-Whittle-MoE-27B-A17.8B
- Repositorio GitHub de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Ficha en LLM Explorer: https://llm-explorer.com/model/logic65%2FQwen3.8-Whittle-MoE-27B-A17.8B,372feFSodtnWdsRYHJ9LW5
