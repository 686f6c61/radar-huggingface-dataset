# mewse/gemma-4-26B-A4B-it-qat-q4_0-unquantized-heretic-ara

## Resumen

Este modelo es una versión "decensored" (abliterada) del modelo oficial `google/gemma-4-26B-A4B-it` de Google DeepMind, generada por el usuario `mewse` mediante la herramienta [Heretic](https://github.com/p-e-w/heretic) v1.2.0 con el método *Arbitrary-Rank Ablation (ARA)* con preservación de norma por filas. El objetivo es eliminar los rechazos (refusals) del modelo original, que rechazaba 100 de cada 100 peticiones consideradas dañinas, reduciéndolos a 5 de cada 100, manteniendo una divergencia KL de 0.1226 respecto al original.

El modelo base es un Gemma 4 de 26 mil millones de parámetros con arquitectura Mixture-of-Experts (MoE), de los cuales solo 4 mil millones se activan por token. Es multimodal (procesa texto e imagen) y soporta un contexto de hasta 256K tokens. Este checkpoint concreto es la variante "QAT q4_0 unquantized", es decir, pesos de media precisión (bfloat16) extraídos del pipeline de entrenamiento con cuantización consciente (QAT), diseñados para ser posteriormente cuantizados a Q4_0 sin pérdida significativa de calidad. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

La relevancia de este modelo radica en su utilidad para investigación en seguridad de IA, generación de contenido creativo sin censura y escenarios donde se requiera explorar el comportamiento de un modelo sin alineación. Sin embargo, su naturaleza "uncensored" implica riesgos importantes de uso indebido, por lo que debe manejarse con precaución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto e imagen) con mezcla de expertos (MoE) y atención híbrida (sliding window + global) |
| Parametros totales | 26 000 millones (26B) |
| Parametros activos | 4 000 millones (4B) por token |
| Longitud de contexto | 262 144 tokens (256K) |
| Tipos de cuantizacion | bfloat16 (unquantized, extraído de QAT Q4_0); compatible con cuantizaciones posteriores (GGUF Q4_0, etc.) |
| Idiomas soportados | Más de 140 lenguas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0.2 GB) |

Nota: El tamaño del repositorio es de 0.2 GB, inusualmente pequeño para 26B parámetros. Es probable que contenga solo los pesos modificados o un delta respecto al modelo base, pero esta información no está confirmada en la documentación disponible.

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-26B-A4B-it` pertenece a la familia Gemma 4 de Google DeepMind. Emplea una arquitectura Mixture-of-Experts (MoE) con 26B parámetros totales y 4B activos por token. La atención es híbrida: intercala ventanas deslizantes locales con atención global, asegurando que la última capa sea siempre global. Esto permite manejar contextos largos de hasta 256K tokens con un coste computacional moderado. El modelo es multimodal, acepta imágenes de resolución y proporción variables, y genera texto.

El checkpoint QAT (Quantization-Aware Training) se entrena con un pipeline que incorpora la cuantización en el propio entrenamiento, produciendo pesos de media precisión (bfloat16) que luego pueden convertirse a Q4_0 con una degradación mínima. El modelo original fue entrenado con datos multilingües (más de 140 idiomas) y ha sido optimizado para razonamiento, codificación y capacidades agénticas, incluyendo soporte nativo para *function calling* y *system prompts*.

La modificación "heretic" se aplica post-entrenamiento mediante el método ARA (Arbitrary-Rank Ablation), que identifica y elimina direcciones en el espacio de activaciones asociadas con comportamientos de rechazo. Los parámetros de ablación son: capas 11 a 23, `preserve_good_behavior_weight` = 0.9713, `steer_bad_behavior_weight` = 0.0037, `overcorrect_relative_weight` = 0.9798 y `neighbor_count` = 10. Esta técnica reduce drásticamente la tasa de rechazos (de 100/100 a 5/100) manteniendo una divergencia KL de 0.1226 respecto al original, lo que indica una alteración relativamente pequeña del comportamiento general.

## Capacidades

- Generación de texto y razonamiento: mantiene las capacidades de razonamiento del modelo base, incluyendo modos de pensamiento configurable.
- Multimodal: procesa imágenes y texto, con soporte para vídeo y audio en otras variantes de Gemma 4 (aunque no se especifica para este checkpoint).
- Codificación: soporta generación de código y *function calling* nativo, útil para agentes autónomos.
- Agentes y multi-step reasoning: diseñado para tareas agénticas con planificación de varios pasos.
- Multilingüe: más de 140 idiomas soportados.
- Sin rechazos: el principal cambio es la eliminación de rechazos ante peticiones que el modelo original consideraría dañinas o prohibidas. Esto permite respuestas en temas tabú o controvertidos.
- Contexto largo: ventana de 256K tokens, adecuada para documentos extensos y conversaciones de larga duración.

## Casos de uso

- Investigación en seguridad de IA: estudiar el comportamiento de un modelo sin alineación para entender mecanismos de rechazo y desarrollar mejores técnicas de mitigación.
- Generación de contenido creativo sin restricciones: escritura de ficción, guiones o diálogos que aborden temas sensibles (violencia, sexualidad, política) sin que el modelo se niegue a responder.
- Asistente de código en producción: gracias al soporte de *function calling* y razonamiento, puede integrarse en pipelines de CI/CD para generar, revisar o refactorizar código, con la ventaja de no rechazar consultas sobre vulnerabilidades o exploits (uso legítimo en pruebas de penetración).
- Análisis de documentos largos: con 256K tokens de contexto, puede resumir o extraer información de contratos, informes técnicos o libros completos, tanto de texto como de imágenes escaneadas.
- Agente autónomo de atención al cliente: maneja conversaciones multi-turno con contexto extenso, y al no tener rechazos puede tratar quejas o solicitudes delicadas sin evasivas.
- Traducción y localización: su soporte multilingüe permite traducir contenido técnico o literario entre más de 140 idiomas, incluso con matices culturales complejos.
- Simulación de escenarios adversarios: generar contenido ofensivo o engañoso controlado para entrenar sistemas de detección de *hate speech* o desinformación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para esta versión abliterada. La model card solo proporciona métricas de divergencia y tasa de rechazo comparadas con el modelo original:

| Metrica | Este modelo | Modelo original |
|---|---|---|
| Divergencia KL | 0.1226 | 0 (por definicion) |
| Rechazos (sobre 100 peticiones) | 5/100 | 100/100 |

La baja divergencia KL sugiere que el rendimiento en tareas generales debería ser muy similar al del modelo base, aunque no hay datos cuantitativos que lo confirmen.

## Requisitos de hardware

- Pesos en bfloat16: al ser un checkpoint "unquantized", los 26B parámetros en bfloat16 ocupan aproximadamente 52 GB de VRAM. Se necesita una GPU con al menos 52 GB, como una A100 80GB, H100 80GB o similar.
- Cuantización a Q4_0: si se convierte a Q4_0 (como está previsto en el pipeline QAT), el peso se reduce a unos 16-17 GB, permitiendo su ejecución en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB). La página llmrun.dev indica que a Q4_K_M se necesitan ~16.57 GB de VRAM.
- Al ser MoE con 4B activos, la memoria de activaciones es relativamente baja, pero los pesos completos deben estar en VRAM.
- Opciones de despliegue: vLLM (con soporte para compressed-tensors), llama.cpp (formato GGUF), Ollama, TGI, o directamente con Transformers.
- Latencia y throughput: no disponibles para esta variante específica. En general, los MoE de 4B activos ofrecen un throughput alto en comparación con modelos densos del mismo tamaño total.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (mewse/gemma-4-26B-A4B-it-qat-q4_0-unquantized-heretic-ara) | 26B | 4B | 256K | Apache 2.0 | safetensors (bfloat16) |
| google/gemma-4-26B-A4B-it (original) | 26B | 4B | 256K | Apache 2.0 | safetensors (bfloat16) |
| google/gemma-4-12B-it (denso) | 12B | 12B | 256K | Apache 2.0 | safetensors |
| Mixtral 8x7B (Mistral AI) | 46.7B | 12.9B | 32K | Apache 2.0 | safetensors |

La principal diferencia con el original es la eliminación de rechazos. Frente a Mixtral 8x7B, este modelo ofrece un contexto mucho mayor (256K vs 32K) y un número de parámetros activos menor (4B vs 12.9B), lo que lo hace más eficiente en inferencia. Sin embargo, no se dispone de comparativas de rendimiento directas.

## Limitaciones y advertencias

- Riesgo de contenido dañino: al ser "uncensored", el modelo puede generar contenido violento, sexual, discriminatorio o ilegal sin filtros. Su uso en producción debe estar restringido a entornos controlados y con supervisión humana.
- Degradación potencial: la abliteración puede afectar ligeramente la calidad de las respuestas (KL divergence 0.1226), aunque no se han medido efectos en benchmarks específicos.
- Sesgos: el modelo base puede contener sesgos de género, raza o ideología, y la eliminación de rechazos puede amplificar estos sesgos al no haber mecanismos de mitigación.
- Alucinaciones: como cualquier LLM, puede inventar información, especialmente en temas poco representados en sus datos de entrenamiento.
- Contexto: aunque soporta 256K tokens, el rendimiento en contextos muy largos puede degradarse y el coste de memoria aumenta linealmente.
- Idiomas: aunque soporta más de 140 idiomas, la calidad varía significativamente; los idiomas con menos datos de entrenamiento tendrán peor rendimiento.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo no ofrece ninguna garantía de seguridad o idoneidad para aplicaciones críticas.
- Restricciones de uso: Google puede tener políticas de uso aceptable que limiten la redistribución de modelos modificados; es recomendable revisar los términos de la licencia de Gemma 4.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/mewse/gemma-4-26B-A4B-it-qat-q4_0-unquantized-heretic-ara)
- [Modelo base: google/gemma-4-26B-A4B-it](https://huggingface.co/google/gemma-4-26B-A4B-it)
- [Checkpoint QAT original: google/gemma-4-26B-A4B-it-qat-q4_0-unquantized](https://huggingface.co/google/gemma-4-26B-A4B-it-qat-q4_0-unquantized)
- [Heretic (herramienta de abliteración)](https://github.com/p-e-w/heretic)
- [Pull request de ARA en Heretic](https://github.com/p-e-w/heretic/pull/211)
- [Blog de lanzamiento de Gemma 4 QAT](https://blog.google/innovation-and-ai/technology/developers-tools/quantization-aware-training-gemma-4/)
- [Informe técnico de Gemma 4 (arXiv)](https://arxiv.org/abs/2607.02770)
- [Documentación oficial de Gemma 4](https://ai.google.dev/gemma/docs/core)
