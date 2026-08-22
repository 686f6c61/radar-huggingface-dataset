# multipartinc/MPV-1

## Resumen

MPV-1 es un modelo de lenguaje especializado en generación de código, desarrollado por el usuario multipartinc sobre la base de google/gemma-4-31B-it, la versión instructiva del modelo Gemma 4 de 31 mil millones de parámetros. El modelo se ha afinado con dos datasets públicos centrados en código: armand0e/claude-fable-5-claude-code y AletheiaResearch/Kimi-K3-Codex, ambos orientados a mejorar la capacidad de generación y razonamiento sobre código, con especial énfasis en el lenguaje Lua según las etiquetas del repositorio.

El modelo se publica bajo licencia AFL-3.0 y se distribuye en formato transformers (safetensors), listo para su uso con la biblioteca de Hugging Face. Aunque no se detalla el tamaño del contexto ni los parámetros totales, al derivar de Gemma 4 31B se espera una arquitectura transformer densa con 31 mil millones de parámetros y una ventana de contexto de al menos 32K tokens (característica típica de la familia Gemma). Su relevancia radica en que ofrece una alternativa de código abierto y afinada para tareas de programación, especialmente en Lua, un nicho poco cubierto por los modelos genéricos.

La ficha se basa exclusivamente en la información pública del repositorio de Hugging Face y en los datos de la model card, sin datos adicionales de rendimiento ni especificaciones detalladas, por lo que muchas secciones presentan información "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de google/gemma-4-31B-it) |
| Parametros totales | 31B (estimado, no confirmado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (se espera 32K tokens, no confirmado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | AFL-3.0 |
| Formato de pesos | safetensors (Transformers) |

## Arquitectura y entrenamiento

MPV-1 es un fine-tuning de google/gemma-4-31B-it, un modelo transformer denso de 31.000 millones de parámetros entrenado por Google. La arquitectura base emplea atención de ventana deslizante y rotación de posiciones (RoPE), con una ventana de contexto de 32K tokens en su versión original. El afinamiento se realizó sobre dos datasets de código: armand0e/claude-fable-5-claude-code, que contiene ejemplos de interacción con Claude Code, y AletheiaResearch/Kimi-K3-Codex, que incluye datos de razonamiento y código de Kimi K3. No se especifica el número de tokens de entrenamiento, el método de afinamiento (por ejemplo, si se usó SFT o RLHF) ni ninguna innovación técnica adicional. El modelo se presenta como una adaptación ligera para mejorar la capacidad de generación de código, con un énfasis particular en el lenguaje Lua (según las etiquetas del repositorio).

## Capacidades

- Generación de texto y código: al ser un fine-tuning de un modelo instructivo, puede generar código en múltiples lenguajes, aunque su enfoque declarado es Lua.
- Razonamiento sobre código: el entrenamiento con datasets de código sugiere capacidad para explicar, depurar y completar fragmentos de código.
- Soporte multilingüe: el modelo está etiquetado como en (inglés), por lo que no se espera soporte nativo para otros idiomas.
- No se dispone de información sobre tool calling, function calling, capacidades de agentes, vision o audio. Estas características no están documentadas en el repositorio.

## Casos de uso

- Generación de scripts en Lua: el modelo puede asistir en la creación de scripts para juegos (como Roblox), automatización de sistemas o configuraciones, gracias a su entrenamiento específico en este lenguaje.
- Depuración de código: puede recibir un fragmento de código con errores y sugerir correcciones, aprovechando el contexto de código del dataset de Claude Code.
- Completado de código en editores: integrable como backend en herramientas de autocompletado (por ejemplo, a través de la API de Transformers o vLLM) para sugerencias en tiempo real.
- Análisis de código existente: puede explicar qué hace un bloque de código, útil para documentar proyectos o revisar código heredado.
- Generación de pruebas unitarias: a partir de una función, puede proponer casos de prueba en Lua o en otros lenguajes.
- Conversión de código entre lenguajes: aunque no se confirma, al ser un modelo de código, podría traducir lógica de un lenguaje a otro, aunque con riesgo de errores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo menciona la métrica code_eval, pero no se proporcionan valores numéricos.

## Requisitos de hardware

- Tamaño del modelo: 31B parámetros, lo que implica un uso intensivo de memoria. Para inferencia en FP16 se necesitan aproximadamente 62 GB de VRAM (solo pesos) y más para la atención y caché.
- En cuantización a 8 bits (por ejemplo, con bitsandbytes) se reduce a unos 31 GB; con cuantización a 4 bits (GPTQ o AWQ) se puede bajar a ~16 GB, pero no se confirma la disponibilidad de estos formatos.
- GPU recomendadas: A100 80GB, H100 80GB, o configuraciones multi-GPU (por ejemplo, 2x RTX 4090 de 24 GB) para FP16. En cuantización 4 bits podría caber en una RTX 4090 de 24 GB, pero no se ha probado.
- Opciones de despliegue: vLLM (soporta Transformers), TGI, llama.cpp (si se convierte a GGUF), Ollama (si se convierte a GGUF). No se han publicado archivos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MPV-1 | 31B (estimado) | no disponible | Código (Lua) | AFL-3.0 | Hugging Face |
| Google Gemma 4 31B it | 31B | 32K | Modelo instructivo general | Gemma Terms | Hugging Face |
| CodeLlama 34B | 34B | 16K | Código general | Llama 2 | Hugging Face |
| DeepSeek-Coder 33B | 33B | 16K | Código | MIT | Hugging Face |

MPV-1 se distingue por ser un fine-tuning de Gemma 4, lo que le hereda las capacidades instructivas de la base, pero con un enfoque específico en código. No se dispone de comparativas de rendimiento.

## Limitaciones y advertencias

- Sin datos de rendimiento: no se han publicado benchmarks, por lo que no se puede evaluar su calidad frente a otros modelos de código.
- Licencia AFL-3.0: es una licencia de código abierto pero no OSI-approved, y puede tener restricciones para uso comercial en algunos contextos. Se recomienda revisar los términos exactos.
- Sesgos y alucinaciones: al ser un modelo de código, puede generar código incorrecto o con errores de seguridad si se usa sin supervisión.
- Idiomas limitados: solo se confirma soporte de inglés; el uso en otros idiomas puede degradar el rendimiento.
- Contexto desconocido: no se especifica la longitud de contexto real, lo que puede limitar el uso en tareas de código largo.
- Sin soporte de herramientas: no se ha confirmado tool calling ni capacidades de agente, por lo que no es adecuado para pipelines complejos sin adaptación adicional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/multipartinc/MPV-1
- Dataset de entrenamiento 1: https://huggingface.co/datasets/armand0e/claude-fable-5-claude-code
- Dataset de entrenamiento 2: https://huggingface.co/datasets/AletheiaResearch/Kimi-K3-Codex
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
