# SenturkAI/SenturkMini-0.6B-TR-Instruct-v0.1

## Resumen

SenturkMini-0.6B-TR-Instruct-v0.1 es un modelo de lenguaje compacto de 605.945.856 parámetros (aproximadamente 0,6B) especializado en turco, desarrollado por SenturkAI. Se construye sobre el modelo base Qwen/Qwen3-0.6B-Base mediante un pipeline de continuación de preentrenamiento (CPT) en corpus turco, ajuste supervisado (SFT) con datos destilados de modelos mayores y una fase final de alineación por preferencias con RPO (Relative Preference Optimization). El resultado es un modelo orientado a tareas empresariales en turco más que a conversación general.

La innovación principal es la ampliación del tokenizador con 10.000 tokens turcos adicionales, elevando el vocabulario de 151.600 a 161.600 entradas para procesar raíces y sufijos turcos sin fragmentación excesiva. Dispone de una ventana de contexto de 16.384 tokens, útil para documentos corporativos y pipelines RAG. El modelo se distribuye con licencia Apache-2.0 en formatos safetensors (BF16) y GGUF (BF16 y Q8_0), además de un Modelfile para Ollama.

El modelo está entrenado con el modo de razonamiento (thinking) desactivado: no rellena bloques `<think>...</think>` y devuelve respuestas directas mediante la plantilla de chat estándar ChatML. Está pensado para clasificación, extracción de entidades, resumen, Text-to-SQL, análisis de sentimiento y extracción de palabras clave con requisitos mínimos de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer decoder-only, 28 capas, hidden size 1024) |
| Parametros totales | 605.945.856 (~0,6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens (16K) |
| Tipos de cuantizacion | BF16 (safetensors y GGUF), Q8_0 (GGUF) |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16), GGUF (BF16 y Q8_0), Modelfile de Ollama |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3, con 28 capas y dimensión oculta de 1024, heredado de Qwen/Qwen3-0.6B-Base. El tokenizador se amplió en 10.000 tokens turcos hasta un `vocab_size` de 161.600. El entrenamiento se organizó en tres fases: continuación de preentrenamiento (CPT) multietapa sobre un corpus extenso de texto turco; ajuste supervisado (SFT) multietapa con datos destilados de modelos de referencia por tarea; y una fase final de alineación con RPO (Relative Preference Optimization). El autor indica que durante el desarrollo se probaron enfoques experimentales, en ocasiones alejados de la literatura estándar, y que el modelo no se presenta como libre de errores.

Una decisión técnica destacable es el entrenamiento con el modo thinking desactivado: los tokens de razonamiento `<think>` y `</think>` existen en el vocabulario pero el modelo fue entrenado dejando esos bloques vacíos para producir respuestas directas. El formato de conversación es ChatML, con `<|im_start|>` (ID 151644) y `<|im_end|>` (ID 151645, `eos_token`) como delimitadores, y `<|endoftext|>` (ID 151643) como token de relleno y de inicio. El vocabulario incluye además tokens de llamada a herramientas (`<tool_call>`, `<tool_response>`), de FIM para completado de código y marcadores de visión heredados del tokenizador original, aunque el modelo no dispone de torre visual.

## Capacidades

- Generación de texto en turco con respuestas directas, sin bloque de razonamiento intermedio.
- Clasificación de texto y análisis de sentimiento en dominios corporativos.
- Extracción de entidades nombradas (NER) y extracción de palabras clave.
- Resumen de documentos, incluidos textos largos dentro de la ventana de 16K tokens.
- Text-to-SQL para consultas sobre esquemas de bases de datos.
- Procesamiento de contexto largo para RAG sobre documentación empresarial.
- Soporte de tool calling mediante los tokens especiales `<tool_call>` y `<tool_response>` definidos en el tokenizador y en la plantilla ChatML.
- Salida estructurada (etiqueta `structured-output` en el repositorio), orientada a formatos tipo JSON.
- Capacidades multilingües: limitadas al turco según la model card; no se declaran otros idiomas.
- Modo thinking no disponible en la práctica: el modelo no genera contenido dentro de `<think>`.

## Casos de uso

- Clasificación de tickets de soporte: el modelo etiqueta consultas entrantes por categoría y urgencia con baja latencia y coste mínimo, adecuado para volúmenes altos en atención al cliente en turco.
- Extracción de entidades en documentos corporativos: identificación de nombres, organizaciones, fechas e importes en contratos y facturas, aprovechando el tokenizador ampliado para tratar sufijos turcos sin fragmentación.
- Resumen de documentación interna: condensación de informes y actas de hasta 16K tokens en un único paso, sin necesidad de trocear el documento.
- Pipelines RAG: generación de respuestas ancladas a fragmentos recuperados en sistemas de búsqueda empresarial, con la ventana de 16K para incluir varios pasajes de contexto.
- Text-to-SQL en herramientas de BI: traducción de preguntas en lenguaje natural a consultas SQL sobre esquemas conocidos, con salida estructurada para su validación automática.
- Análisis de sentimiento y monitorización de opiniones: procesamiento por lotes de reseñas o mensajes en turco en entornos con recursos de GPU limitados.
- Extracción de palabras clave para indexación y SEO: generación de términos y etiquetas a partir de artículos y descripciones de producto.
- Integración en agentes ligeros: uso de los tokens de tool calling para encadenar llamadas a funciones en asistentes empresariales de bajo coste.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluación comparativa por tareas sobre un benchmark corporativo en turco, con protocolo de test ciego y puntuación de 0 a 10 por un modelo juez (LLM-as-a-Judge). Los resultados numéricos de esa tabla no están completos en la información disponible: la tabla se corta en la fila de Llama-3.2-3B-Instruct y no se incluyen las puntuaciones por celda. Por tanto, no se presentan cifras concretas.

| Tarea | SenturkMini-0.6B-BF16 | SenturkMini-0.6B-Q8 | Modelos comparados |
|---|---|---|---|
| Benchmark corporativo turco (varias categorías) | no disponible | no disponible | SenturkMini-1.7B (BF16/Q8/Q4), Qwen3-4B-Instruct-2507, Kumru-2B, Llama-3.2-3B-Instruct |

Metodología declarada: benchmark en turco para modelos pequeños diseñado de forma independiente, test ciego y puntuación de 0 a 10 por un modelo juez. No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB en BF16 y unos 0,7 GB en Q8_0, más el espacio de caché KV para la ventana de 16K.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM es suficiente; tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores ofrecen margen amplio. En entornos de servidor, A100 o H100 no son necesarias para este tamaño, aunque permiten alto paralelismo.
- Cabe holgadamente en GPU consumer, incluidas integradas con memoria unificada suficiente, y puede ejecutarse en CPU con llama.cpp.
- Opciones de despliegue: transformers, llama.cpp, Ollama (incluye Modelfile), text-generation-inference (etiqueta `text-generation-inference` en el repositorio) y endpoints compatibles. vLLM no se menciona explícitamente en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SenturkMini-0.6B-TR-Instruct-v0.1 | ~0,6B | 16K | Apache-2.0 | Hugging Face (safetensors, GGUF, Ollama) |
| Qwen3-0.6B (base de este modelo) | ~0,6B | no disponible en la información proporcionada | Apache-2.0 | Hugging Face |
| SenturkMini-1.7B (variantes BF16/Q8/Q4) | ~1,7B | no disponible | no disponible | Referenciado en la tabla de benchmarks del autor |
| Qwen3-4B-Instruct-2507 | ~4B | no disponible | no disponible | Referenciado como comparador en la tabla del autor |
| Kumru-2B | ~2B | no disponible | no disponible | Referenciado como comparador en la tabla del autor |
| Llama-3.2-3B-Instruct | ~3B | no disponible | no disponible | Referenciado como comparador en la tabla del autor |

Los modelos comparados aparecen únicamente como referencias en la tabla de benchmarks de la model card; no se dispone de sus especificaciones completas ni de sus puntuaciones en la información proporcionada.

## Limitaciones y advertencias

- El autor advierte explícitamente de que el modelo se desarrolló con enfoques experimentales y puede producir errores o salidas inesperadas; no se presenta como libre de fallos.
- Riesgo de alucinación inherente a un modelo de 0,6B, especialmente en tareas abiertas de conocimiento factual.
- Orientado a tareas corporativas y no a conversación general; su comportamiento como asistente conversacional puede ser limitado.
- Soporte idiomático restringido al turco según la model card; el rendimiento en otros idiomas no está garantizado.
- El modo thinking está desactivado por entrenamiento: no debe esperarse razonamiento explícito en bloques `<think>`.
- El tokenizador incluye tokens de visión y FIM heredados de Qwen3, pero el modelo no dispone de capacidades visuales; su uso para imagen o vídeo no es válido.
- Licencia Apache-2.0, que permite uso comercial con atribución y sin restricciones adicionales de la licencia, si bien conviene revisar las condiciones del modelo base Qwen3.
- Con 0 descargas y 0 likes en el momento de la ficha, no existe validación comunitaria independiente del rendimiento declarado.
- Los resultados de benchmarks publicados son parciales y puntuados por modelos jueces, no por benchmarks estándar reproducibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SenturkAI/SenturkMini-0.6B-TR-Instruct-v0.1
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- No se han encontrado en la información disponible otros enlaces a papers, blogs, repositorios o demos.
