# bodenmaurice/dendritex-qwen3.6-35b-stages-v3-p97

## Resumen

El modelo `bodenmaurice/dendritex-qwen3.6-35b-stages-v3-p97` es un checkpoint intermedio (etapa v3, paso 97) del modelo Qwen3.6-35B-A3B, publicado por el usuario bodenmaurice en Hugging Face. Se trata de un modelo de lenguaje causal con encoder de visión, diseñado para tareas de imagen-texto a texto y con un enfoque especial en codificación agéntica y razonamiento a nivel de repositorio. La arquitectura combina atención lineal (Gated DeltaNet) con atención clásica (Gated Attention) y una mezcla de expertos (MoE) con 256 expertos, de los cuales se activan 8 más uno compartido, lo que da un total de 35 mil millones de parámetros con solo 3 mil millones activos por token.

El modelo destaca por su ventana de contexto nativa de 262 144 tokens, ampliable hasta aproximadamente 1 010 000 tokens, y por incorporar una opción de preservación del contexto de razonamiento en mensajes históricos, lo que facilita el desarrollo iterativo de código. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones significativas. Aunque el repositorio no incluye una model card propia (hereda la del modelo base), los datos técnicos coinciden con los de Qwen3.6-35B-A3B, por lo que esta ficha se basa en esa información pública.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; híbrido Gated DeltaNet + Gated Attention + MoE |
| Parametros totales | 35 951 822 704 (35,95 B) |
| Parametros activos | 3 B (8 expertos enrutados + 1 compartido de 256) |
| Longitud de contexto | 262 144 tokens nativos, extensible hasta ~1 010 000 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la model card no especifica idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de Qwen3.6-35B-A3B: un transformer causal con encoder de visión integrado. La capa de lenguaje se organiza en 40 capas con una disposición oculta de 10 bloques, cada uno compuesto por 3 sub-bloques de Gated DeltaNet seguidos de MoE, y 1 sub-bloque de Gated Attention seguido de MoE. La atención lineal (Gated DeltaNet) utiliza 32 cabezas para V y 16 para QK con dimensión de cabeza 128, mientras que la atención clásica (Gated Attention) emplea 16 cabezas para Q y 2 para KV con dimensión 256 y RoPE de 64 dimensiones. El MoE tiene 256 expertos con dimensión intermedia de 512 y activa 8 expertos enrutados más un experto compartido. La salida del LM tiene 248 320 tokens de vocabulario (con padding).

El entrenamiento incluye fases de pre-entrenamiento y post-entrenamiento, y el modelo soporta Multi-Token Prediction (MTP) entrenado con múltiples pasos. No se especifican detalles sobre el dataset ni sobre técnicas de alineación como RLHF o DPO en la información disponible. La innovación principal reside en la combinación de atención lineal y atención clásica para lograr eficiencia en contexto largo, junto con la preservación del contexto de razonamiento en mensajes históricos, una característica nueva en la serie Qwen3.6.

## Capacidades

- Generación de texto y razonamiento multimodal (imagen-texto a texto) gracias al encoder de visión integrado.
- Codificación agéntica: manejo de flujos de trabajo frontend y razonamiento a nivel de repositorio con alta fluidez y precisión.
- Preservación del contexto de razonamiento: opción para retener el contexto de pensamiento de mensajes históricos, reduciendo la sobrecarga en desarrollo iterativo.
- Ventana de contexto muy larga: 262 144 tokens nativos, ampliable a más de un millón, adecuada para repositorios de código extensos o documentos largos.
- Soporte de Multi-Token Prediction (MTP) para acelerar la generación y mejorar la coherencia.
- Capacidades multilingües: no confirmadas oficialmente, aunque la serie Qwen suele ser multilingüe; no hay datos específicos en la model card.
- Compatible con herramientas de inferencia como Hugging Face Transformers, vLLM, SGLang y KTransformers.

## Casos de uso

- Desarrollo de agentes de codificación autónomos: el modelo puede analizar repositorios completos, razonar sobre la estructura del código y generar parches o refactorizaciones, como demuestra su rendimiento en SWE-bench Verified (73,4 %).
- Asistente de programación en IDE con contexto largo: su ventana de 262 K tokens permite cargar archivos de proyecto enteros y mantener el contexto de razonamiento entre iteraciones, ideal para tareas de refactorización complejas.
- Generación de código frontend: gracias a su capacidad de codificación agéntica, puede crear interfaces de usuario completas a partir de descripciones en lenguaje natural, integrando visión si se le proporcionan capturas de pantalla.
- Análisis y resumen de documentación técnica extensa: con contexto ampliable a más de un millón de tokens, puede procesar manuales, especificaciones o libros técnicos completos y generar resúmenes estructurados.
- Automatización de tareas de terminal y operaciones: su rendimiento en Terminal-Bench 2.0 (no disponible el valor exacto en la información) sugiere capacidad para ejecutar comandos y resolver tareas de administración de sistemas.
- Asistente de revisión de código (code review): puede examinar cambios en repositorios, detectar errores potenciales y sugerir mejoras, aprovechando su razonamiento a nivel de repositorio.
- Chat multimodal con contexto de imagen y texto: al incluir encoder de visión, puede responder preguntas sobre diagramas, capturas de pantalla o esquemas de arquitectura, combinando información visual y textual.

## Benchmarks y rendimiento

La model card del modelo base Qwen3.6-35B-A3B reporta los siguientes resultados en benchmarks de codificación agéntica, comparados con otros modelos:

| Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B |
|---|---|---|---|---|---|
| SWE-bench Verified | 75,0 | 52,0 | 70,0 | 17,4 | 73,4 |
| SWE-bench Multilingual | 69,3 | 51,7 | 60,3 | 17,3 | 67,2 |
| SWE-bench Pro | 51,2 | 35,7 | 44,6 | 13,8 | 49,5 |
| Terminal-Bench 2.0 | (dato no disponible en la información) | | | | |

No se han publicado resultados de benchmarks adicionales (como MMLU, HumanEval o GSM8K) en la información disponible. Los datos presentados corresponden al modelo base Qwen3.6-35B-A3B; el checkpoint concreto `dendritex-qwen3.6-35b-stages-v3-p97` podría presentar variaciones, pero no se dispone de evaluaciones independientes.

## Requisitos de hardware

- VRAM estimada: con 35 951 millones de parámetros en FP16, el modelo requiere aproximadamente 72 GB de VRAM solo para los pesos. Con cuantización de 8 bits (~36 GB) o 4 bits (~18 GB) podría ejecutarse en GPUs con 24 GB o 48 GB, pero no se proporcionan cuantizaciones oficiales en la información disponible.
- GPU recomendadas: para inferencia sin cuantizar, se necesitan GPUs de datacenter como A100 80 GB, H100 80 GB o A6000 48 GB (con cuantización). Para uso en consumer, una RTX 4090 (24 GB) podría funcionar con cuantización de 4 bits, aunque no hay garantías.
- Despliegue: compatible con Hugging Face Transformers, vLLM, SGLang y KTransformers. También es compatible con endpoints de inferencia (endpoints_compatible en Hugging Face).
- Latencia y throughput: al ser un modelo MoE con solo 3 B parámetros activos, la latencia por token es significativamente menor que la de un modelo denso de 35 B. Se estima un throughput alto en servidores con vLLM, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | SWE-bench Verified |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (base) | 35 B | 3 B | 262 K (ext. 1 M) | Apache 2.0 | 73,4 |
| Qwen3.5-35B-A3B | 35 B | 3 B | 262 K | Apache 2.0 | 70,0 |
| Qwen3.5-27B (denso) | 27 B | 27 B | 262 K | Apache 2.0 | 75,0 |
| Gemma4-31B | 31 B | 31 B | no disponible | Gemma License | 52,0 |

El checkpoint `dendritex-qwen3.6-35b-stages-v3-p97` es una variante intermedia del modelo base, por lo que su rendimiento podría diferir ligeramente. La comparativa muestra que Qwen3.6-35B-A3B mejora respecto a su predecesor Qwen3.5-35B-A3B en SWE-bench, aunque el modelo denso Qwen3.5-27B obtiene un resultado ligeramente superior en SWE-bench Verified, a costa de activar todos sus parámetros.

## Limitaciones y advertencias

- No se dispone de información específica sobre sesgos o alucinaciones para este checkpoint concreto; al ser un modelo de lenguaje generativo, existe riesgo inherente de alucinación, especialmente en tareas de razonamiento complejo o con contexto muy largo.
- La model card no especifica los idiomas soportados; aunque la serie Qwen suele ser multilingüe, no hay confirmación oficial para este modelo, por lo que el rendimiento en idiomas distintos del inglés puede ser variable.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es un checkpoint poco probado por la comunidad; se recomienda validar su comportamiento antes de usarlo en producción.
- Al ser un checkpoint intermedio (stages-v3-p97), podría no estar completamente entrenado o estabilizado en comparación con el modelo final Qwen3.6-35B-A3B.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar que los pesos del modelo no incorporen datos con restricciones adicionales (no se mencionan en la información).
- Para contexto extremadamente largo (más de 262 K tokens), se requiere la extensión de contexto, que podría degradar la calidad de la generación si no se usa correctamente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bodenmaurice/dendritex-qwen3.6-35b-stages-v3-p97
- Model card del modelo base Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Blog oficial de Qwen sobre Qwen3.6-35B-A3B: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Guía para ejecutar Qwen 3.6 localmente (DEV Community): https://dev.to/purpledoubled/how-to-run-qwen-36-locally-27b-dense-35b-moe-and-coding-variants-setup-guide-4di
- Guía completa de Qwen 3.6 (InsiderLLM): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
