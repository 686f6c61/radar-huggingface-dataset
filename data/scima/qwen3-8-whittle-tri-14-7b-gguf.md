# scima/Qwen3.8-Whittle-tri-14.7B-GGUF

## Resumen

El modelo `scima/Qwen3.8-Whittle-tri-14.7B-GGUF` es una cuantización GGUF del modelo `logic65/Qwen3.8-Whittle-tri-14.7B`, un LLM de 14.700 millones de parámetros creado por David Aylward mediante una técnica de compresión por entrenamiento llamada "Whittle". El modelo original parte de Qwen3.8-27B (arquitectura Qwen3.5 con bloques híbridos de Gated DeltaNet y atención) y reduce sus 64 capas a 32 fusionando capas recurrentes adyacentes y absorbiendo estaciones de atención completas en sus vecinas, sin eliminar parámetros de forma arbitraria. El resultado es un modelo que mantiene buena parte de la capacidad de recuperación factual y de generación de código del modelo original, pero que sacrifica notablemente el razonamiento matemático y multi-paso.

Este repo en particular existe únicamente para ofrecer cuantizaciones GGUF adicionales al Q8 ya publicado por el autor original, permitiendo ejecutar el modelo en hardware de consumo con requisitos de VRAM reducidos. La licencia es Apache 2.0, lo que facilita su uso comercial, aunque el autor lo califica como "research preview" y advierte que necesita post-entrenamiento adicional para razonar de forma fiable. Es relevante porque demuestra una vía alternativa a la poda clásica: comprimir un modelo grande mediante destilación de capas, obteniendo un tamaño reducido sin perder demasiada capacidad en tareas concretas como código y hechos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: bloques `[gdn, gdn, gdn, attention]` en proporción 3:1, basada en Qwen3.5 (Gated DeltaNet + atención) |
| Parametros totales | 14.719.400.192 (14,7B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el comando de ejemplo usa `-c 4096`, pero no se especifica el máximo del modelo) |
| Tipos de cuantizacion | GGUF, incluye Q8 (archivo `q38_tri_repaired_q8.gguf` de 15,7 GB); otras cuantizaciones presentes en el repo (95,9 GB total) |
| Idiomas soportados | en, zh (según model card; el autor indica que fuera de francés y español el rendimiento es poco fiable) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors disponibles en el repo original `logic65/Qwen3.8-Whittle-tri-14.7B`) |

## Arquitectura y entrenamiento

El modelo original `Qwen3.8-Whittle-tri-14.7B` se obtiene comprimiendo Qwen3.8-27B, que a su vez se basa en la arquitectura Qwen3.5 con bloques híbridos de Gated DeltaNet (gdn) y atención. El proceso "Whittle" fusiona las 64 capas originales en 32: las capas recurrentes adyacentes se combinan por pares y ocho estaciones de atención completa se absorben en sus vecinas en lugar de eliminarse. El autor afirma que "nada se descartó", lo que sugiere que la compresión se hace por mezcla de parámetros y no por poda. El resultado es un modelo con bloques estándar `[gdn, gdn, gdn, attention]` en proporción exacta 3:1, compatible con cualquier build de llama.cpp que soporte Qwen3.5.

No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas como RLHF o DPO. El autor menciona que el modelo es "loop-free" (sin bucles de repetición) en seis generaciones probadas, tanto con greedy como con temperatura 0,7, algo que no consiguen los modelos más grandes de la misma familia. El proceso completo, scripts, adaptadores y mediciones están documentados en el repositorio `logic65/Qwen3.8-Whittle-dev`.

## Capacidades

- Generación de código en Python, C, JavaScript, SQL y HTML, con marcado Markdown fiable (8/8 en la sonda de fencing del autor).
- Recuperación factual cercana al modelo original: capitales, elementos químicos, fechas, autorías.
- Ausencia de bucles de repetición en generación larga, tanto en modo greedy como con temperatura 0,7.
- Soporte básico de conversación en inglés y chino, con rendimiento aceptable en francés y español.
- No se menciona soporte de tool calling ni function calling en la documentación disponible.
- No está diseñado para sesiones de agente largas ni para razonamiento multi-paso.

## Casos de uso

- Generación de código en entornos de desarrollo: el modelo produce fragmentos de Python, C, JavaScript o SQL con buena sintaxis y sin bucles de repetición, adecuado para autocompletado o generación de funciones aisladas en un IDE.
- Documentación técnica y comentarios de código: su capacidad de recuperación factual y su fiabilidad en el marcado Markdown lo hacen útil para generar explicaciones de APIs o documentar funciones existentes.
- Preguntas y respuestas sobre hechos enciclopédicos: capitales, fechas, elementos, autores; útil para chatbots de consulta rápida donde no se requiera cálculo numérico.
- Traducción y adaptación de textos entre inglés, chino, francés y español, con la advertencia de que fuera de estos idiomas el rendimiento decae.
- Prototipado rápido de asistentes conversacionales en hardware de consumo: al caber en 16 GB de VRAM, se puede desplegar localmente con llama.cpp para pruebas internas sin depender de servicios en la nube.
- Generación de plantillas y estructuras de código repetitivas (boilerplate) en varios lenguajes, donde la ausencia de bucles es una ventaja frente a modelos más grandes de la misma familia.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados en su batería de pruebas:

| Prueba | Resultado |
|---|---|
| Batería de 39 prompts | 31/39 aciertos |
| GSM8K (aritmética y razonamiento) | 3,6% |
| Sonda de marcado Markdown (fencing) | 8/8 |
| Pruebas de bucles (greedy y temperatura 0,7) | 0 fallos en 6 generaciones |

Comparación dentro de la familia Whittle (según el autor):

| Modelo | Tamaño | Puntuación en batería de 39 prompts |
|---|---|---|
| Qwen3.8-Whittle-tri-14.7B | 14,7B | 31/39 |
| Variante 16,8B | 16,8B | 36/39 |
| Variante 20,8B | 20,8B | 35/39 |
| Corte 19,2B | 19,2B | por debajo de 31/39 |

No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GPQA en la información disponible.

## Requisitos de hardware

- El archivo Q8 GGUF ocupa 15,7 GB, por lo que cabe en dos tarjetas de 8 GB VRAM (16 GB totales) o en una sola de 24 GB.
- Con 16 GB de VRAM se recomienda mantener unas 24 de las 32 capas en GPU; con 24 GB cabe el modelo completo.
- Se ejecuta con llama.cpp (`llama-server -m q38_tri_repaired_q8.gguf -ngl 24 -c 4096 --jinja`), sin necesidad de forks ni parches.
- Compatible con cualquier build de llama.cpp que soporte Qwen3.5.
- No se dispone de datos de latencia o throughput medidos; el autor no los proporciona.
- Al ser GGUF, también puede utilizarse con Ollama u otros frontends que soporten el formato, aunque no se menciona explícitamente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Puntuación (39 prompts) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Whittle-tri-14.7B | 14,7B | no disponible | 31/39 | Apache 2.0 | GGUF y safetensors |
| Variante 16,8B de la familia Whittle | 16,8B | no disponible | 36/39 | Apache 2.0 | safetensors (según colección del autor) |
| Variante 20,8B de la familia Whittle | 20,8B | no disponible | 35/39 | Apache 2.0 | safetensors (según colección del autor) |
| Qwen3-14B (modelo denso oficial) | 14B | 32K (típico) | no comparable | Apache 2.0 | safetensors, GGUF |

La comparación directa con Qwen3-14B oficial no está disponible en la documentación del autor. El modelo Whittle se posiciona como una alternativa más pequeña dentro de la familia Qwen3.8, sacrificando razonamiento matemático por tamaño reducido y ausencia de bucles.

## Limitaciones y advertencias

- Aritmética y razonamiento multi-paso muy deficientes: 3,6% en GSM8K. No usar para cálculos, análisis de datos o tareas que requieran precisión numérica.
- El autor advierte que el modelo "a menudo establece la regla correcta y luego calcula la respuesta equivocada".
- Rendimiento no fiable fuera de inglés, chino, francés y español; el resto de idiomas pueden producir salidas incoherentes.
- No está diseñado para sesiones de agente largas ni para razonamiento encadenado complejo.
- Es un "research preview": el autor indica que necesita post-entrenamiento real antes de razonar de forma consistente.
- Aunque la licencia es Apache 2.0, el modelo se distribuye como investigación independiente y puede carecer de la robustez de modelos comerciales o de los modelos oficiales de Qwen.
- No hay información sobre sesgos específicos, pero al ser una destilación de Qwen3.8, puede heredar sesgos del modelo base.
- La cuantización GGUF puede introducir degradación adicional en tareas de precisión, especialmente en las cuantizaciones más agresivas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/scima/Qwen3.8-Whittle-tri-14.7B-GGUF
- Modelo original (safetensors): https://huggingface.co/logic65/Qwen3.8-Whittle-tri-14.7B
- Tarjeta de desarrollo Whittle: https://huggingface.co/logic65/Qwen3.8-Whittle-dev
- Colección de modelos ejecutables: https://huggingface.co/collections/logic65/whittle-models-you-can-run-6a82e929ca80146cde320f0b
- Colección de investigación y desarrollo: https://huggingface.co/collections/logic65/whittle-research-and-dev-6a82e929e52c7347edf9ec64
- Repositorio oficial de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
- Informe técnico de Qwen3 (arXiv): https://arxiv.org/abs/2505.09388
