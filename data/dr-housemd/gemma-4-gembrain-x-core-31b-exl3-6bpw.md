# dr-housemd/Gemma-4-Gembrain-X-Core-31B-exl3-6bpw

## Resumen

Gemma-4-Gembrain-X-Core-31B-exl3-6bpw es un modelo de lenguaje de gran tamaño resultante de la fusión de 18 modelos base, todos ellos derivados de google/gemma-4-31B-it. El merge se ha realizado con la herramienta mergekit, combinando pesos de distintos fine-tunings orientados a razonamiento, roleplay, escritura creativa, generación de prompts de imagen y conversación sin censura. El resultado es un modelo de propósito general con un sesgo marcado hacia tareas creativas y de interacción libre, distribuido bajo licencia Apache 2.0, lo que permite su uso comercial sin restricciones.

El modelo se presenta en formato ExLlama v3 con cuantización de 6 bits por peso (6bpw), lo que reduce el tamaño del archivo a aproximadamente 27,4 GB y permite su ejecución en GPUs de consumo con 24 GB de VRAM o más. Aunque el nombre sugiere 31B de parámetros, el archivo safetensors reporta 13.681.446.508 parámetros, una discrepancia que probablemente se deba a la estructura del archivo cuantizado o a la eliminación de capas redundantes durante el merge; no se dispone de información oficial que aclare este punto.

Este modelo destaca por su versatilidad en tareas de escritura y conversación, siendo especialmente útil para desarrolladores que necesitan un LLM sin filtros de moderación para prototipos de aplicaciones de rol, generación de contenido creativo o asistentes conversacionales. Su naturaleza de merge combina las fortalezas de cada componente, aunque no se han publicado benchmarks que permitan cuantificar su rendimiento relativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en google/gemma-4-31B-it) |
| Parametros totales | 13.681.446.508 (segun safetensors; el modelo se comercializa como 31B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6-bit (exl3) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (ExLlama v3, 6bpw) |

## Arquitectura y entrenamiento

El modelo es un merge de 18 modelos base, todos ellos fine-tunings de google/gemma-4-31B-it. Los componentes incluyen variantes como Barcenas-31b-Fable, Gemopus-4-31B-it, Sprinkle-Gemma-4-31B, Serenity-31B-v1.1, Dark-Scarlett-v1.0-31B, GarnetV2-31B, G4-31B-Musica-v1, Ortenzya-The-Creative-Wordsmith-31B-it-uncensored-heretic, G4-MeroMero-31B-uncensored-heretic, Gutenberg-31B, Equinox-31B, glimmer-rp-v0.1, Monika-31B, Melinoe-Gemma4-31B-VL, Glistening-Gem-31B-v1.0, Gemsicle-31B y gemma-4-31b-it-heretic-ara. La fusión se realizó con mergekit, una herramienta que combina pesos mediante técnicas como SLERP o ties, aunque no se especifica el método exacto.

No se dispone de información sobre el dataset de entrenamiento original de los modelos base ni sobre procesos de RLHF o DPO posteriores al merge. Al ser un merge, no hubo entrenamiento adicional; simplemente se combinaron los pesos existentes. La arquitectura subyacente es la de Gemma-4, un transformer decoder-only con atención multi-cabeza y normalización RMS, aunque los detalles específicos (número de capas, heads, etc.) no se han publicado en la model card.

## Capacidades

- Razonamiento: el modelo puede abordar tareas de lógica y resolución de problemas, gracias a la inclusión de componentes como Gemopus-4-31B-it y Equinox-31B.
- Roleplay: capaz de mantener personajes y diálogos coherentes en escenarios de ficción, heredado de modelos como glimmer-rp-v0.1 y Monika-31B.
- Escritura creativa: genera narrativa, poesía y otros formatos literarios con estilo variado, potenciado por Gutenberg-31B y Ortenzya.
- Generación de prompts de imagen: puede producir descripciones detalladas adecuadas para modelos de difusión como Stable Diffusion, gracias a Melinoe-Gemma4-31B-VL.
- Conversación general: mantiene diálogos fluidos y contextuales en múltiples turnos.
- Sin censura: al ser un modelo "uncensored" y "nsfw", no aplica filtros de moderación de contenido, lo que permite generar texto explícito o sensible.
- Multilingüe: no se especifican idiomas, pero al derivar de Gemma-4, es probable que soporte múltiples lenguas; sin confirmación oficial.

## Casos de uso

- Roleplay interactivo: el modelo puede gestionar personajes y tramas en juegos de rol textuales, manteniendo coherencia a lo largo de conversaciones largas gracias a su entrenamiento en roleplay (glimmer-rp, Monika).
- Escritura de ficción: útil para autores que necesitan un asistente de brainstorming o un co-redactor de relatos, cuentos o novelas, aprovechando su capacidad creativa y variedad estilística.
- Generación de prompts para IA de imágenes: los usuarios pueden pedir descripciones detalladas de escenas, personajes o estilos, que luego se alimentan a Stable Diffusion o Midjourney para obtener ilustraciones.
- Asistentes conversacionales sin filtros: para aplicaciones de chat adulto o comunidades que requieren moderación mínima, el modelo ofrece respuestas sin restricciones de contenido.
- Prototipado rápido de agentes conversacionales: al ser Apache 2.0 y fácil de desplegar con ExLlama, permite crear demos de chatbots personalizados sin costes de licencia.
- Generación de contenido para juegos: diálogos de NPC, descripciones de misiones o lore de mundos ficticios, combinando razonamiento y creatividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo.

## Requisitos de hardware

- VRAM estimada: para una cuantización de 6 bits, el modelo requiere aproximadamente 23-25 GB de VRAM para inferencia en precisión completa de 6 bits, más overhead de contexto y caché KV. Con un contexto de 4K tokens, se necesitan al menos 24 GB.
- GPU recomendadas: NVIDIA RTX 3090 (24 GB), RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB). También puede ejecutarse en GPUs con 32 GB como V100 o A6000.
- Compatibilidad con GPU de consumo: sí, con RTX 3090/4090 se puede ejecutar cómodamente. No cabe en GPUs de 16 GB o menos.
- Opciones de despliegue: ExLlama v3 (formato nativo), también puede convertirse a GGUF para llama.cpp/Ollama, aunque el formato exl3 no es directamente compatible; se requeriría conversión. vLLM y TGI soportan Gemma-4, pero la cuantización exl3 es específica de ExLlama.
- Latencia y throughput: no se dispone de mediciones oficiales. En una RTX 4090, se estima una velocidad de generación de 20-40 tokens/segundo con contexto corto, dependiendo de la implementación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma-4-Gembrain-X-Core-31B (este) | ~31B (reportado 13.68B en safetensors) | no disponible | Apache-2.0 | exl3 6-bit | Merge de 18 modelos, sin censura |
| google/gemma-4-31B-it | 31B | no disponible | Gemma license (restrictiva) | safetensors | Modelo base, con moderación |
| Llama-3.1-8B-Instruct | 8B | 128K | Llama 3.1 license | safetensors/GGUF | Mucho menor, no comparable en capacidad |
| Mistral-7B-Instruct | 7B | 32K | Apache-2.0 | safetensors/GGUF | Alternativa ligera, sin censura |

La comparación directa no es posible sin benchmarks. El modelo base Gemma-4-31B-it tiene una licencia más restrictiva que Apache 2.0, lo que hace que este merge sea más atractivo para uso comercial. Sin embargo, al ser un merge no hay garantía de rendimiento superior al base.

## Limitaciones y advertencias

- Sesgos: al ser un merge de modelos sin censura, puede reflejar sesgos de los datos de entrenamiento originales, incluyendo estereotipos o contenido ofensivo.
- Riesgo de alucinación: como cualquier LLM, puede generar información falsa o inventada, especialmente en tareas de razonamiento factual.
- Limitaciones de contexto: no se ha especificado la longitud de contexto soportada; se recomienda probar antes de usarlo en aplicaciones con historiales largos.
- Restricciones de licencia: aunque la licencia es Apache 2.0, los modelos base pueden tener términos adicionales; se debe verificar la licencia de google/gemma-4-31B-it (Gemma license) que impone restricciones de uso comercial en ciertos casos.
- Contenido NSFW: el modelo puede generar contenido explícito, lo que puede ser inapropiado para entornos corporativos o aplicaciones públicas.
- Falta de documentación: no hay información sobre el proceso de merge, datos de entrenamiento ni evaluación, lo que dificulta su uso en entornos de producción críticos.

## Enlaces

- HuggingFace: https://huggingface.co/dr-housemd/Gemma-4-Gembrain-X-Core-31B-exl3-6bpw
- Modelos base (selección): https://huggingface.co/google/gemma-4-31B-it, https://huggingface.co/BirdToast/Gemma-4-31B-glimmer-rp-v0.1, https://huggingface.co/sophosympatheia/Glistening-Gem-31B-v1.0
- Herramienta de merge: https://github.com/arcee-ai/mergekit
