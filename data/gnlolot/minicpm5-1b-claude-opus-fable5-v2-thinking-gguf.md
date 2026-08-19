# GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-V2-Thinking-GGUF

## Resumen

MiniCPM5-1B-Claude-Opus-Fable5-V2-Thinking-GGUF es la versión cuantizada en formato GGUF del checkpoint Transformers del mismo nombre, desarrollado por GnLOLot sobre el modelo base MiniCPM5-1B de OpenBMB. Se trata de un modelo de lenguaje de 1.080 millones de parámetros (~1.08B) fine-tuneado con datos de la familia Fable 5 (versión 2), orientado a mejorar el razonamiento explícito (modo thinking) y, especialmente en esta segunda versión, el tool calling y function calling. El modelo hereda la arquitectura transformer de MiniCPM5 y soporta una ventana de contexto de hasta 131.072 tokens (128K), lo que lo hace adecuado para tareas con contexto largo pese a su tamaño reducido.

Su relevancia actual radica en que permite desplegar localmente, en hardware modesto (incluso CPU), un modelo con capacidades de razonamiento encadenado, generación de código y uso de herramientas, algo poco habitual en modelos de 1B. La distribución en GGUF facilita su ejecución con llama.cpp, Ollama, LM Studio, jan y KoboldCpp, con la plantilla de chat de MiniCPM5 embebida en los metadatos del archivo. El repositorio ha acumulado más de 338.000 descargas y 189 likes, lo que indica una adopción notable dentro de la comunidad de despliegue local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (MiniCPM5, detalle de capas no disponible) |
| Parametros totales | 1.080.632.832 (~1.08B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens (128K) |
| Tipos de cuantizacion | Q8_0 (~1.1 GB) y F16 (~2.1 GB) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (el checkpoint base en safetensors) |

## Arquitectura y entrenamiento

El modelo parte de MiniCPM5-1B, un transformer denso de la familia MiniCPM de OpenBMB. Sobre ese checkpoint se ha aplicado un fine-tuning con datos de la serie Fable 5 en su versión 2, cuyo objetivo declarado es reforzar el comportamiento de tool calling y function calling, manteniendo al mismo tiempo el modo de razonamiento explícito (thinking) que ya incorporaba la versión 1. No se han publicado detalles sobre el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO; la información disponible solo indica que el fine-tuning se realizó sobre el checkpoint base y que la plantilla de chat nativa de MiniCPM5 queda embebida en los archivos GGUF. La cuantización se ha realizado con llama.cpp, ofreciendo dos niveles: Q8_0 (recomendado por el autor) y F16 como conversión de precisión completa.

## Capacidades

- Generación de texto conversacional y completado de instrucciones con buena adherencia a las restricciones del prompt.
- Modo thinking: emite bloques de razonamiento encadenado (chain-of-thought) antes de la respuesta final; puede desactivarse con `enable_thinking=False`.
- Tool calling y function calling reforzados en la versión V2, con soporte para invocar herramientas externas en flujos de agente.
- Generación de código, depuración y asistencia en flujos de ingeniería de software.
- Instruction following fiable para tareas estructuradas y multi-paso.
- Ventana de contexto larga de hasta 128K tokens, útil para documentos extensos o historiales de conversación amplios.
- Soporte multilingüe declarado para inglés y chino (la generación en otros idiomas no está garantizada).

## Casos de uso

- Asistentes conversacionales locales: al ser un modelo de 1B en GGUF, puede ejecutarse en portátiles o mini-PCs sin GPU dedicada, gestionando conversaciones multi-turno con historial amplio gracias a su contexto de 128K tokens.
- Generación de código en entornos de desarrollo: integrable en editores o pipelines de CI/CD para sugerencias de implementación, revisión de fragmentos y corrección de errores, con el modo thinking para explicar el razonamiento detrás del código.
- Automatización de tareas con tool calling: el modelo puede invocar funciones externas (APIs, consultas a bases de datos, operaciones de sistema) en flujos de agente, lo que lo hace adecuado para asistentes que ejecutan acciones reales.
- Agentes de razonamiento multi-paso: su modo thinking permite descomponer problemas complejos en pasos intermedios, útil para tareas de planificación, análisis o toma de decisiones con herramientas.
- Procesamiento de documentos largos: con 128K tokens de contexto, puede resumir o extraer información de documentos extensos (manuales, informes, contratos) en una sola pasada, sin necesidad de chunking complejo.
- Prototipado rápido de aplicaciones con LLM: su tamaño reducido y formato GGUF permiten iterar rápidamente en demos y pruebas de concepto con llama.cpp u Ollama, sin costes de API.
- Educación y formación: el modo thinking puede generar explicaciones paso a paso de conceptos técnicos o matemáticos, útil en plataformas de aprendizaje interactivo.

## Benchmarks y rendimiento

Los resultados corresponden al checkpoint Transformers original (no a la versión GGUF, que puede presentar ligeras variaciones por cuantización).

BFCL + API-Bank:

| Modelo | BFCL non_live | BFCL live | API-Bank |
|---|---|---|---|
| MiniCPM5-1B (base) | 41.51% | 60.24% | 7.30% |
| MiniCPM5-1B-Claude-Opus-Fable5-V2-Thinking | 43.06% | 63.33% | 22.10% |

Tau-Bench:

| Dominio | MiniCPM5-1B (base) | MiniCPM5-1B-Claude-Opus-Fable5-V2-Thinking |
|---|---|---|
| Airline | 0.34 (17/50) | 0.36 (18/50) |
| Retail | 0.052 (6/115) | 0.070 (8/115) |

La mejora más notable se observa en API-Bank, donde pasa de 7.30% a 22.10%, lo que confirma el refuerzo de tool calling en V2. En Tau-Bench el avance es modesto, con una ligera subida en ambos dominios.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q8_0 ocupa ~1.1 GB, por lo que se requiere aproximadamente 1.2-1.5 GB de VRAM; el F16 (~2.1 GB) necesita ~2.5 GB. Fuentes externas indican que una cuantización Q4_K_M (no incluida en este repositorio) requeriría ~0.99 GB.
- GPU recomendadas: cualquier GPU con 2-4 GB de VRAM es suficiente; tarjetas consumer como GTX 1060 6GB, RTX 3060, RTX 4060 o superiores funcionan sin problema. También es viable en iGPUs y en Macs con Apple Silicon.
- Ejecución en CPU: al ser un modelo de 1B, puede ejecutarse razonablemente bien en CPU con llama.cpp, aunque la velocidad dependerá del número de hilos y de la memoria disponible.
- Opciones de despliegue: llama.cpp (llama-cli y llama-server), Ollama, LM Studio, jan, KoboldCpp y cualquier runtime compatible con GGUF.
- Latencia y throughput: no se han publicado cifras oficiales; en una GPU moderna se espera una generación de decenas de tokens por segundo, y en CPU de gama media, de varios tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia | Formato |
|---|---|---|---|---|---|
| MiniCPM5-1B-Claude-Opus-Fable5-V2-Thinking | 1.08B | 128K | Sí (reforzado) | Apache-2.0 | GGUF / safetensors |
| MiniCPM5-1B (base) | 1.08B | 128K | Básico | Apache-2.0 | safetensors |
| MiniCPM5-1B-Claude-Opus-Fable5-Thinking (V1) | 1.08B | 128K | Sí (menos robusto) | Apache-2.0 | GGUF / safetensors |

La comparativa se limita a la familia MiniCPM5-1B porque no se dispone de datos de benchmarks para otros modelos de 1B de la misma categoría (p. ej., Qwen2.5-1.5B o Llama-3.2-1B) en las mismas pruebas. La principal diferencia frente al base es la mejora sustancial en API-Bank (7.30% a 22.10%) y la presencia del modo thinking; frente a V1, V2 refuerza específicamente el tool calling.

## Limitaciones y advertencias

- Escala 1B: no es un modelo de frontera; puede producir alucinaciones o errores en tareas complejas que requieran conocimiento extenso o razonamiento profundo.
- Modo thinking: el modelo puede emitir bloques de razonamiento antes de la respuesta final, lo que puede resultar confuso si se espera una salida directa; puede desactivarse con `enable_thinking=False`.
- Contexto efectivo: la ventana de 128K tokens es el límite teórico del config.json; el contexto realmente utilizable depende del runtime GGUF y de la memoria disponible del hardware.
- Idiomas: solo se declara soporte para inglés y chino; el rendimiento en otros idiomas, incluido el español, no está garantizado.
- Cuantización: el repositorio solo ofrece Q8_0 y F16; no se incluyen cuantizaciones de menor precisión como Q4_K_M, lo que limita las opciones para hardware muy restringido.
- Licencia: Apache-2.0 permite uso comercial sin restricciones adicionales, pero se debe mantener la atribución y los avisos de licencia correspondientes.

## Enlaces

- Repositorio GGUF: https://huggingface.co/GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-V2-Thinking-GGUF
- Checkpoint Transformers: https://huggingface.co/GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-V2-Thinking
- Versión V1 (GGUF): https://huggingface.co/GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-Thinking-GGUF
- Modelo base MiniCPM5-1B: https://huggingface.co/openbmb/MiniCPM5-1B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ficha en llmrun.dev: https://llmrun.dev/model/gnlolot-minicpm5-1b-claude-opus-fable5-thinking
