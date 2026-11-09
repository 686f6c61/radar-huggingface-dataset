# shi3z/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-MLX-4bit

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-MLX-4bit es una cuantización en 4 bits para MLX del modelo xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic, a su vez derivado de Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B. El autor de esta conversión es el usuario shi3z, que la publica bajo licencia Apache-2.0 manteniendo la atribución a los autores originales. El modelo combina, según su denominación, una base de la familia Qwen 3.5 de 9B con ajustes orientados a eliminar restricciones de alineación (variante "uncensored"/"heretic"/abliterated).

El interés práctico de esta ficha reside en que es una conversión específica para Apple Silicon mediante MLX, empaquetada en 4 bits con grupo de tamaño 64 (aproximadamente 4,5 bits por peso) y un peso total de 4,7 GB en disco. Con 8.953.803.264 parámetros reales según los safetensors, es un modelo denso de ~9B que puede ejecutarse en equipos con memoria unificada modesta. La conversión elimina deliberadamente la torre de visión y los pesos MTP (decodificación especulativa), por lo que es un modelo exclusivamente de texto.

La relevancia es doble: por un lado, demuestra el flujo de conversión con mlx-lm 0.32.2 para modelos de la familia Qwen 3.5; por otro, su naturaleza "uncensored" implica que las salvaguardas habituales de alineación han sido reducidas o eliminadas, lo que exige una evaluación de riesgos explícita antes de cualquier uso en producción. No se han publicado resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen 3.5, según tags `qwen3_5`); detalles de capas y atención no disponibles |
| Parametros totales | 8.953.803.264 (~9B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit con group size 64 (~4,5 bits por peso); solo se publica la variante MLX 4-bit |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), repositorio de 5,1 GB; pesos cuantizados de 4,7 GB |

## Arquitectura y entrenamiento

La información disponible indica que se trata de un transformer denso de la familia Qwen 3.5 con aproximadamente 9B de parámetros. El pipeline de esta publicación es una cuantización, no un entrenamiento: se aplicó `mlx_lm.convert` de mlx-lm 0.32.2 sobre el modelo base xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic, cuantizando en CPU a 4 bits con grupo de 64. Durante la conversión se descartaron explícitamente la torre de visión y los pesos MTP (multi-token prediction, usados para decodificación especulativa), de modo que el artefacto resultante es solo texto y no puede aprovechar la decodificación especulativa original.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otras etapas de alineación en el modelo original. La etiqueta "heretic"/"uncensored" sugiere que el modelo base pasó por un proceso de ablación o reducción de rechazos (abliteration), pero los detalles técnicos de ese proceso no están disponibles en la información proporcionada. Tampoco se documentan innovaciones de atención (linear attention, sliding window) ni configuraciones de RoPE.

## Capacidades

- Generación de texto conversacional y de propósito general, según el pipeline `text-generation` y la etiqueta `conversational`.
- Razonamiento y generación de código: capacidad esperable por la familia base, aunque no se documentan evaluaciones específicas.
- Multilingüe: inglés, chino, coreano, japonés, español y ruso declarados en los metadatos.
- Sin capacidades de visión: la torre visual fue eliminada en la conversión.
- Sin decodificación especulativa MTP: los pesos correspondientes no se conservaron.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo "thinking" explícito: no disponible en la información proporcionada.
- Comportamiento "uncensored": se espera una menor tasa de rechazos ante peticiones sensibles, si bien no se cuantifica en la model card.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX 4-bit y los 4,7 GB de pesos permiten ejecutar el modelo en Macs con memoria unificada de 16 GB o superior, usando `mlx_lm generate` como en el ejemplo de la model card.
- Backend para asistentes de código en terminal: el autor documenta el uso como backend de Claude Code mediante el proyecto mightyCode, adecuado para flujos de trabajo de desarrollo en local sin depender de APIs externas.
- Prototipado de chatbots multilingües: al cubrir en, zh, ko, ja, es y ru, sirve para validar conversaciones multi-turno en esos idiomas antes de invertir en un modelo mayor.
- Investigación sobre alineación y seguridad: al ser una variante "uncensored", es útil como caso de estudio para medir la eficacia de las salvaguardas y comparar tasas de rechazo frente al modelo base alineado.
- Generación de texto creativo sin filtros: escenarios de escritura de ficción o guiones donde los rechazos del modelo alineado resultan un obstáculo, siempre con revisión humana posterior.
- Evaluación comparativa de cuantizaciones: permite contrastar la calidad del 4-bit MLX frente al modelo original en precisión completa o frente a otras cuantizaciones (GGUF), midiendo la degradación en tareas de razonamiento.
- Despliegue de bajo coste en estaciones de trabajo Mac: para tareas internas de resumen o extracción de información donde no se requiere la máxima calidad y prima la privacidad de los datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria: pesos de 4,7 GB en 4-bit; con overhead de contexto y caché KV, se recomienda un mínimo de 8-10 GB de memoria unificada, y 16 GB para contextos largos o generación con lote.
- Hardware objetivo: Apple Silicon (M1/M2/M3/M4 y variantes Pro/Max/Ultra) por el uso de MLX; no está pensado para GPU NVIDIA.
- GPU consumer: no aplica en el sentido habitual; en el ecosistema Apple cabe en Macs de 16 GB en adelante. Para CUDA habría que recurrir a otras cuantizaciones del modelo base no publicadas aquí.
- Opciones de despliegue: `mlx-lm` (versión 0.32.2 o superior) mediante `python -m mlx_lm generate`; integración con Claude Code a través de mightyCode. vLLM, llama.cpp, Ollama y TGI no son compatibles directamente con este formato MLX.
- Latencia y throughput: no disponibles; dependerán del chip Apple concreto y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| shi3z/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-MLX-4bit | ~9B | no disponible | MLX 4-bit safetensors | Apache-2.0 | Solo texto; sin torre visual ni MTP; orientado a Apple Silicon |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | ~9B (presumible) | no disponible | safetensors (precisión original) | Apache-2.0 | Modelo base de esta conversión; incluye presumiblemente visión y MTP |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B | ~9B (presumible) | no disponible | safetensors | no disponible | Origen de la cadena; variante alineada estándar |

No se dispone de datos de rendimiento comparado (benchmarks) para ninguna de las variantes en la información proporcionada, por lo que la comparación se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- Modelo "uncensored"/abliterated: las salvaguardas de alineación están reducidas o eliminadas, con riesgo elevado de generar contenido dañino, ofensivo o inexacto; requiere filtros externos si se expone a usuarios.
- Solo texto: no procesa imágenes al haberse descartado la torre visual en la conversión.
- Sin MTP: no puede aprovechar la decodificación especulativa del modelo original, lo que puede reducir el throughput frente a la versión completa.
- Cuantización 4-bit: se espera cierta degradación de calidad respecto al modelo en precisión completa, especialmente en tareas de razonamiento matemático o código; no cuantificada en la información disponible.
- Riesgo de alucinación: inherente a los modelos de ~9B, agravado por la falta de benchmarks publicados que permitan calibrar su fiabilidad.
- Idiomas: aunque se declaran seis idiomas, no hay evaluación de calidad por idioma; el español figura en los metadatos pero sin datos de rendimiento.
- Licencia Apache-2.0: permite uso comercial, pero el usuario asume la responsabilidad legal y ética del contenido generado por una variante sin alineación.
- Sin tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación externa y de informes de errores.
- Dependencia de MLX: no es portable a entornos CUDA sin reconversión; el ecosistema de herramientas es más limitado que el de GGUF.
- Fecha de creación futura (2026-11-09) en los metadatos: conviene verificar la integridad y procedencia del repositorio antes de usarlo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/shi3z/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-MLX-4bit
- Modelo base: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Origen de la cadena: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Proyecto mightyCode (backend para Claude Code): https://github.com/shi3z/mightyCode
- Librería MLX-LM: https://github.com/ml-explore/mlx-lm
