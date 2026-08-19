# Ishowbackup/gemma-4-26B-A4B-it-uncensored

## Resumen

El modelo `Ishowbackup/gemma-4-26B-A4B-it-uncensored` es una versión modificada del modelo oficial `google/gemma-4-26B-A4B-it` de Google, al que se le ha eliminado el comportamiento de rechazo (refusal) mediante una técnica de abliteration. El desarrollador, Ishowbackup, ha aplicado un proceso de intervención sobre los pesos del modelo base para que este responda a consultas que normalmente serían bloqueadas por las políticas de seguridad, manteniendo en gran medida la calidad de las respuestas. Este modelo es relevante para investigadores y desarrolladores que necesitan explorar los límites de la generación de texto sin restricciones, así como para estudios sobre alineación y seguridad en modelos de lenguaje.

Arquitectónicamente, se trata de un modelo de mezcla de expertos (MoE) con 25,8 mil millones de parámetros totales y aproximadamente 4 mil millones de parámetros activos por token, basado en la arquitectura Gemma 4. El modelo está disponible en formato safetensors y se distribuye bajo licencia Apache 2.0, lo que permite su uso comercial con las debidas atribuciones. La longitud de contexto no se especifica en la información proporcionada, pero se espera que herede la configuración del modelo base, que en la familia Gemma 4 suele alcanzar 128 mil tokens.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Gemma 4 |
| Parametros totales | 25.805.933.872 (~25,8B) |
| Parametros activos | ~4B (según la nomenclatura A4B, no confirmado oficialmente) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bf16; compatible con GGUF según el autor) |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-26B-A4B-it` emplea una arquitectura de mezcla de expertos (MoE) con 128 expertos por capa, como se deduce del proceso de abliteration descrito en la model card. El modelo `Ishowbackup/gemma-4-26B-A4B-it-uncensored` no ha sido entrenado desde cero ni fine-tuneado con datos adicionales; en su lugar, se ha aplicado una modificación de pesos mediante abliteration, una técnica que elimina direcciones de activación asociadas al rechazo.

El proceso utiliza una combinación de dos métodos: por un lado, una abliteration biproyectada que preserva la norma (norm-preserving biprojected abliteration) aplicada a las capas densas (`o_proj` y `mlp.down_proj`); por otro lado, una abliteration granular por experto (Expert-Granular Abliteration, EGA) que actúa sobre los 128 expertos de cada capa. Para ello se recopilaron activaciones residuales de 400 prompts dañinos y 400 inofensivos, se aplicó una winsorización al percentil 99,5 para controlar valores atípicos, y se calcularon direcciones de rechazo por capa. El resultado es una reducción drástica de los rechazos: de 98/100 en el modelo original a 1/100 efectivo en el modelo modificado, con una divergencia KL de 0,09 respecto al modelo base y sin degradación perceptible en la calidad de las respuestas.

## Capacidades

- Generación de texto conversacional: el modelo mantiene las capacidades de generación del modelo base Gemma 4, incluyendo diálogo multi-turno y finalización de instrucciones.
- Entrada multimodal: según las etiquetas de HuggingFace, el modelo es compatible con image-text-to-text, lo que sugiere que puede procesar imágenes junto con texto (capacidad heredada del modelo base).
- Respuestas sin rechazo: la principal característica diferencial es que el modelo no rechaza peticiones que normalmente serían bloqueadas, incluso aquellas consideradas dañinas o peligrosas.
- Soporte de tool calling y agentes: no se menciona explícitamente en la información disponible, aunque es probable que el modelo base los soporte; no confirmado.
- Multilingüismo: limitado al inglés, según la etiqueta `language: en`.

## Casos de uso

- Investigación en seguridad de IA: el modelo permite estudiar cómo se comporta un sistema de lenguaje cuando se eliminan los mecanismos de rechazo, lo que resulta útil para evaluar riesgos y desarrollar contramedidas.
- Generación creativa sin restricciones: escritores y artistas pueden explorar temas tabú o controvertidos sin que el modelo se niegue a responder, siempre que asuman la responsabilidad del contenido generado.
- Análisis de contenido ofensivo: los equipos de moderación pueden usar el modelo para generar ejemplos de contenido dañino y así entrenar clasificadores o mejorar filtros.
- Pruebas de robustez en pipelines de producción: al integrar el modelo en entornos controlados, se puede verificar si los sistemas de seguridad aguas abajo detectan correctamente las salidas problemáticas.
- Desarrollo de chatbots especializados: en dominios donde se requiere un tono directo y sin evasivas (por ejemplo, asesoramiento legal o médico simulado), el modelo puede ofrecer respuestas sin el típico "no puedo ayudar con eso".
- Evaluación de alineación: los investigadores pueden comparar las respuestas de este modelo con las del modelo original para cuantificar el impacto de la abliteration en la utilidad y la seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo reporta métricas específicas del proceso de abliteration:

| Métrica | Antes | Después |
|---|---|---|
| Rechazos (mlabonne, 100 prompts) | 98/100 | 1/100 efectivo (3 marcados, 2 rechazo-then-comply) |
| Rechazos (cross-dataset, 686 prompts) | — | 5/686 (0,7%) |
| Divergencia KL | 0 (baseline) | 0,09 |
| Calidad (ratio de longitud de respuesta inofensiva) | 1,0 | ~1,01 (sin degradación) |

## Requisitos de hardware

No se especifican requisitos de hardware en la información proporcionada. Sin embargo, dado que el modelo tiene 25,8B parámetros totales y ~4B activos, se puede inferir lo siguiente (estimación orientativa, no confirmada por el autor):

- VRAM estimada para inferencia en bf16: al menos 52 GB (25,8B × 2 bytes) para cargar todos los pesos, aunque con cuantización de 8 bits podría reducirse a ~26 GB y con 4 bits a ~13 GB.
- GPU recomendadas: para una inferencia fluida sin cuantización, se necesitaría una GPU con 80 GB de VRAM (como A100 o H100). Con cuantización, una RTX 4090 (24 GB) podría ser suficiente para los 4B activos, pero la carga de todos los expertos requeriría memoria adicional.
- Despliegue: al ser un modelo compatible con transformers, se puede servir con vLLM, TGI o llama.cpp (si se convierte a GGUF). No se mencionan opciones específicas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de comparativas con otros modelos en la información proporcionada. El modelo más cercano es su base, `google/gemma-4-26B-A4B-it`, del que se diferencia únicamente en la eliminación de rechazos. Otras alternativas "uncensored" en el ecosistema (por ejemplo, versiones abliteradas de Llama o Mistral) podrían compararse, pero no hay datos de rendimiento en esta ficha.

## Limitaciones y advertencias

- Eliminación de rechazos: el modelo puede generar contenido dañino, ilegal, violento o sexualmente explícito sin ningún tipo de filtro. Su uso conlleva un alto riesgo de producir resultados perjudiciales.
- Sesgos y alucinaciones: al ser una modificación de pesos sin entrenamiento adicional, el modelo hereda los sesgos del modelo base y puede alucinar información con la misma frecuencia.
- Idioma: solo soporta inglés; no se garantiza un comportamiento adecuado en otros idiomas.
- Calidad no garantizada: la abliteration puede afectar sutilmente a la coherencia o a la utilidad en ciertos dominios, aunque el autor reporta una divergencia KL baja (0,09).
- Licencia: Apache 2.0 permite uso comercial, pero el usuario es responsable del contenido generado y de cumplir las leyes aplicables.
- Sin soporte oficial: al ser un modelo de un tercero, no hay garantías de mantenimiento, corrección de errores o actualizaciones.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Ishowbackup/gemma-4-26B-A4B-it-uncensored)
- [Modelo base: google/gemma-4-26B-A4B-it](https://huggingface.co/google/gemma-4-26B-A4B-it)
- [Repositorio de investigación de abliteration](https://github.com/TrevorS/gemma-4-abliteration)
- [Blog sobre norm-preserving biprojected abliteration](https://huggingface.co/blog/grimjim/norm-preserving-biprojected-abliteration)
- [Repositorio OBLITERATUS (herramienta EGA)](https://github.com/elder-plinius/OBLITERATUS)
