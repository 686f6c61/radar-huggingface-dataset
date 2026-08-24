# Assiduous42/Qwen3.6-27B-Fable-Fusion-711-Heretic2-GGUF

## Resumen

El modelo **Assiduous42/Qwen3.6-27B-Fable-Fusion-711-Heretic2-GGUF** es una cuantización en formato GGUF del modelo base homónimo, desarrollado por Assiduous42 como una ablación terminal "Heretic" del modelo Fable-Fusion-711 de DavidAU. Este último es un fine-tune multi-etapa sobre Qwen3.6-27B, orientado a maximizar el rendimiento en razonamiento y escritura creativa, y que ha sido noticia por superar la barrera de 700 puntos en el benchmark ARC-C en cuantizaciones de 8 y 4 bits, algo inédito para un modelo abierto de 27B parámetros.

La variante "Heretic" aplica una técnica de ablación (similar a "abliteration") dirigida específicamente a eliminar los rechazos del modelo en tareas de escritura creativa, en lugar de los rechazos de daño tipo AdvBench. El resultado es un modelo que mantiene las capacidades de razonamiento y generación del original, pero con una actitud mucho más permisiva frente a solicitudes narrativas que el modelo base podría rechazar. Esta versión GGUF permite ejecutar el modelo en hardware de consumo con una ventana de contexto de hasta 98 304 tokens, gracias a la cuantización y a la gestión de la caché KV.

La relevancia de este modelo radica en que combina un rendimiento de razonamiento de nivel superior (según los benchmarks publicados del modelo base) con una libertad creativa inusual, y lo hace en un formato que cabe en una GPU de 24 GB. Es una opción atractiva para desarrolladores que trabajan en generación de ficción, roleplay o cualquier aplicación que requiera respuestas sin filtros temáticos, siempre asumiendo los riesgos éticos y legales asociados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.6-27B) |
| Parametros totales | 26 895 998 464 |
| Parametros activos | no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | 98 304 tokens (probado con Q4_0 KV en 24 GB) |
| Tipos de cuantizacion | Q4_K_S, Q4_K_M, Q5_K_M (ademas de mmproj-F16 para vision) |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de Qwen3.6-27B, un transformer denso de 27B parametros. La variante Fable-Fusion-711 de DavidAU combina multiples etapas de fine-tune y fusion de modelos, logrando un rendimiento excepcional en ARC-C (0.711 en 8-bit, 0.701 en 4-bit, segun los articulos publicados). La version "Heretic" de Assiduous42 aplica una ablacion sobre este modelo, eliminando selectivamente las capas o pesos responsables de los rechazos en escritura creativa, sin tocar las capacidades de razonamiento.

Un detalle tecnico importante es que el modelo base original incluia una capa adicional de multi-token prediction (MTP) (`blk.64`), que fue eliminada durante la fusion LoRA. Por tanto, esta version tiene 64 capas en lugar de 65. Los metadatos GGUF fueron parcheados en consecuencia (`block_count` de 65 a 64, `nextn_predict_layers` de 1 a 0), lo que implica que la decodificacion especulativa MTP no esta disponible en esta cuantizacion. Los datos de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO) no se han publicado en la informacion disponible.

## Capacidades

- Generacion de texto y escritura creativa sin rechazos tematicos (ficcion, narrativa, dialogos).
- Razonamiento multi-paso con modo "thinking" integrado (requiere configuracion adecuada del max_tokens).
- Roleplay y conversacion con personajes, gracias a la eliminacion de barreras de censura en contextos narrativos.
- Soporte de vision: el archivo `mmproj-F16.gguf` incluido es el proyector de vision del modelo base, lo que sugiere capacidad de entrada multimodal, aunque no se detalla su uso en la model card.
- No se menciona soporte explicito de tool calling ni de agentes autonomos.
- Multilingue: solo ingles (segun la etiqueta `language: en`).

## Casos de uso

- **Escritura de ficcion sin restricciones**: el modelo puede generar novelas, cuentos o guiones que aborden temas tabu o controvertidos sin rechazos, algo util para autores que exploran narrativas complejas.
- **Roleplay avanzado**: en entornos de chat o juegos de rol, el modelo mantiene coherencia y profundidad en personajes, sin limitaciones impuestas por politicas de seguridad.
- **Generacion de contenido creativo para marketing**: redaccion de eslóganes, historias de marca o copy publicitario con un tono mas libre y original.
- **Asistencia en lluvia de ideas**: el modo thinking permite al modelo razonar sobre ideas creativas y proponer alternativas, util en talleres de escritura o brainstorming.
- **Prototipado de aplicaciones de narrativa interactiva**: desarrolladores pueden integrar el modelo en motores de historia o videojuegos, aprovechando su contexto largo para mantener tramas complejas.
- **Investigacion sobre alineacion y censura**: al ser una ablacion "Heretic", sirve como caso de estudio para analizar como se comportan los modelos cuando se eliminan los rechazos de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta cuantizacion GGUF. Sin embargo, los articulos de HackerNoon y CSDN reportan que el modelo base (Fable-Fusion-711) alcanza los siguientes resultados en ARC-C:

| Modelo | Precision | ARC-C |
|---|---|---|
| Fable-Fusion-711 (base) | 8-bit | 0.711 |
| Fable-Fusion-711 (base) | 4-bit | 0.701 |

Estos datos corresponden al modelo original de DavidAU, no a esta version "Heretic" ni a sus cuantizaciones. No se dispone de resultados de MMLU, HumanEval, GSM8K u otros benchmarks en la informacion proporcionada.

## Requisitos de hardware

- **VRAM estimada**: 20 311 MiB para la cuantizacion Q4_K_S con contexto 98 304 y caché KV en Q4_0, medido en una RTX 4090 de 24 GB.
- **GPU recomendadas**: RTX 4090 (24 GB) o cualquier GPU con al menos 24 GB de VRAM. Con cuantizaciones mas bajas o contexto reducido, podria caber en 16 GB, aunque no se ha probado.
- **Cabe en consumer GPU**: si, en GPUs de gama alta con 24 GB (RTX 3090, RTX 4090, etc.).
- **Opciones de despliegue**: LM Studio (probado), llama.cpp, y cualquier backend compatible con GGUF (Ollama, llama-cpp-python, etc.).
- **Latencia y throughput**: ~29.5 tokens/s en RTX 4090 con Q4_K_S y contexto completo, segun la medicion del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Assiduous42/Qwen3.6-27B-Fable-Fusion-711-Heretic2-GGUF | 26.9B | 98 304 | Apache 2.0 | Ablacion "Heretic" para escritura creativa sin rechazos |
| DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF | 26.9B | no disponible | Apache 2.0 | Variante similar de DavidAU, con MTP y quants NEO-Di-Matrix |
| Qwen3.6-27B (base) | 26.9B | no disponible | Apache 2.0 | Modelo original de Alibaba, con censura estandar |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- **Contenido sin filtrar**: al ser una ablacion "Heretic", el modelo puede generar contenido ofensivo, ilegal o eticamente problematico. No es adecuado para aplicaciones publicas sin moderacion.
- **Solo ingles**: no soporta otros idiomas de forma nativa.
- **MTP no disponible**: la decodificacion especulativa multi-token no funciona en esta cuantizacion, lo que puede reducir el rendimiento en comparacion con el modelo base.
- **Modo thinking obligatorio**: si no se configura correctamente (max_tokens >= 600 o `enable_thinking: false`), el modelo puede devolver respuestas vacias.
- **Riesgo de alucinacion**: como cualquier modelo de lenguaje, puede inventar hechos o detalles, especialmente en contextos largos.
- **Sesgos desconocidos**: no se han publicado evaluaciones de sesgos para esta variante.
- **Licencia**: Apache 2.0 permite uso comercial, pero el contenido generado puede estar sujeto a restricciones legales segun la jurisdiccion.

## Enlaces

- [HuggingFace - Assiduous42/Qwen3.6-27B-Fable-Fusion-711-Heretic2-GGUF](https://huggingface.co/Assiduous42/Qwen3.6-27B-Fable-Fusion-711-Heretic2-GGUF)
- [HuggingFace - Modelo base (Assiduous42)](https://huggingface.co/Assiduous42/Qwen3.6-27B-Fable-Fusion-711-Heretic2)
- [HuggingFace - Variante de DavidAU](https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF)
- [HackerNoon - Qwen3.6-27B Fable Fusion Breaks the 700 ARC-C Barrier](https://hackernoon.com/qwen36-27b-fable-fusion-breaks-the-700-arc-c-barrier)
- [HackerNoon - The Fine-Tuned Variant of Qwen3.6-27B That Achieved an ARC-C Score of 0.711](https://hackernoon.com/the-fine-tuned-variant-of-qwen36-27b-that-achieved-an-arc-c-score-of-0711-in-8-bit-quantization)
- [CSDN - Analisis del modelo (en chino)](https://blog.csdn.net/ylscode/article/details/163247856)
