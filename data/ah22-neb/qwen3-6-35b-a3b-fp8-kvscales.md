# AH22-neb/Qwen3.6-35B-A3B-FP8-kvscales

## Resumen

Qwen3.6-35B-A3B-FP8-kvscales es una cuantización en FP8 del modelo Qwen3.6-35B-A3B, desarrollada por el usuario AH22-neb a partir de los pesos oficiales de Qwen. Se trata de un modelo de lenguaje causal con codificador de visión, de arquitectura Mixture of Experts (MoE), con 35.951.822.704 parámetros totales y aproximadamente 3B parámetros activos por token. La cuantización emplea FP8 de grano fino con tamaño de bloque 128, un método que, según la model card del autor original, mantiene métricas de rendimiento casi idénticas a las del modelo sin cuantizar.

El modelo base Qwen3.6-35B-A3B es la primera variante de pesos abiertos de la serie Qwen3.6 de Alibaba, construida sobre la retroalimentación de la comunidad y orientada a estabilidad y utilidad en entornos reales, con especial énfasis en flujos de trabajo de codificación agéntica y razonamiento a nivel de repositorio. Incorpora una innovación denominada "Thinking Preservation", que permite retener el contexto de razonamiento de mensajes históricos para reducir la sobrecarga en desarrollo iterativo.

La relevancia de esta ficha concreta reside en que ofrece los pesos en FP8 listos para su uso con transformers, vLLM, SGLang y KTransformers, lo que reduce los requisitos de memoria respecto a los pesos en BF16 y facilita el despliegue en infraestructura de inferencia estándar. El contexto nativo es de 262.144 tokens, extensible hasta 1.010.000 tokens, y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con codificador de visión; MoE híbrido con Gated DeltaNet y Gated Attention |
| Parametros totales | 35.951.822.704 |
| Parametros activos | Aproximadamente 3B (8 expertos enrutados + 1 compartido de 256 totales) |
| Longitud de contexto | 262.144 tokens nativo; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | FP8 de grano fino con tamaño de bloque 128 (esta versión); el modelo base admite otros formatos |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida de 40 capas con un diseño de disposición oculta de 10 × (3 × (Gated DeltaNet → MoE) → 1 × (Gated Attention → MoE)). Combina atención lineal mediante Gated DeltaNet (32 cabezas lineales para V y 16 para QK, dimensión de cabeza 128) con atención con compuerta Gated Attention (16 cabezas para Q y 2 para KV, dimensión de cabeza 256, dimensión de RoPE 64). La dimensión oculta es de 2048 y el embedding de tokens es de 248.320 (con padding). La capa MoE cuenta con 256 expertos, de los cuales se activan 8 enrutados más 1 compartido, con dimensión intermedia de experto de 512. El modelo fue entrenado con multi-token prediction (MTP) en varios pasos.

El entrenamiento comprende fases de pre-entrenamiento y post-entrenamiento. La model card no detalla el número de tokens de entrenamiento ni la composición exacta del dataset, ni si se emplearon técnicas concretas de RLHF o DPO. La versión aquí descrita es una cuantización FP8 del modelo post-entrenado, no un reentrenamiento: los pesos se han convertido a FP8 con cuantización de grano fino por bloques de 128, y el autor declara que las métricas de rendimiento son casi idénticas a las del modelo original.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Codificación agéntica: manejo de flujos de trabajo de frontend y razonamiento a nivel de repositorio.
- Razonamiento matemático y resolución de problemas (capacidad inferida de la categoría del modelo base; sin datos específicos en la información disponible).
- Procesamiento de imagen y texto (pipeline image-text-to-text), gracias al codificador de visión.
- "Thinking Preservation": retención opcional del contexto de razonamiento de mensajes históricos para desarrollo iterativo.
- Compatibilidad con tool calling y function calling: no confirmado explícitamente en la información disponible, aunque la orientación agéntica del modelo base lo sugiere.
- Capacidades multilingües: el benchmark SWE-bench Multilingual reporta resultados, lo que indica soporte de múltiples lenguajes de programación; los idiomas naturales soportados no están disponibles.
- Modo de pensamiento (thinking mode): no confirmado explícitamente en la información disponible.

## Casos de uso

- Desarrollo de software asistido en repositorios: el modelo puede razonar sobre código a nivel de repositorio y resolver tareas de ingeniería (SWE-bench Verified 73,4), lo que lo hace adecuado para agentes que abren pull requests o corrigen bugs en bases de código reales.
- Automatización de flujos de frontend: según la model card, maneja flujos de trabajo de frontend con mayor fluidez y precisión, útil para generar y modificar componentes de interfaz en pipelines de desarrollo.
- Desarrollo iterativo con contexto de razonamiento persistente: la opción de Thinking Preservation permite conservar el hilo de razonamiento entre mensajes, reduciendo la sobrecarga en sesiones largas de depuración o refactorización.
- Análisis de documentos con imagen y texto: al ser un modelo image-text-to-text, puede procesar capturas, diagramas o documentos escaneados junto con instrucciones textuales, por ejemplo para extraer información de informes o revisar diseños.
- Asistencia conversacional de contexto largo: con 262.144 tokens nativos (y hasta 1.010.000 extensibles), puede gestionar conversaciones o análisis sobre corpus extensos sin truncamiento agresivo.
- Evaluación y corrección de código multilingüe: su rendimiento en SWE-bench Multilingual (67,2) lo hace apto para tareas de revisión y corrección en distintos lenguajes de programación dentro de pipelines de CI/CD.
- Despliegue en infraestructura de inferencia estándar: al estar en FP8 y ser compatible con vLLM, SGLang y KTransformers, puede servirse en clústeres con GPUs de memoria moderada reduciendo el coste frente a los pesos en BF16.

## Benchmarks y rendimiento

Resultados publicados en la model card del modelo base (Qwen3.6-35B-A3B), comparados con modelos similares:

| Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B |
|---|---|---|---|---|---|
| SWE-bench Verified | 75,0 | 52,0 | 70,0 | 17,4 | 73,4 |
| SWE-bench Multilingual | 69,3 | 51,7 | 60,3 | 17,3 | 67,2 |
| SWE-bench Pro | 51,2 | 35,7 | 44,6 | 13,8 | no disponible (tabla truncada en la información) |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de la propia cuantización FP8-kvscales de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 37,5 GB en FP8; se necesita al menos esa cantidad de memoria para cargar los pesos, más overhead de activaciones y caché KV. Con contexto muy largo, la caché KV puede incrementar sustancialmente el consumo.
- GPU recomendadas: para cargar los pesos completos en FP8 se requieren GPUs con 40-80 GB de VRAM, como A100 (80 GB), H100 (80 GB) o A6000 (48 GB). No se especifican recomendaciones oficiales en la información disponible.
- ¿Cabe en GPU de consumo? No en una sola GPU de consumo de 24 GB con los pesos completos en FP8; sería necesario repartir entre varias GPUs o recurrir a cuantizaciones adicionales (no incluidas en este repositorio).
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y KTransformers, según la model card.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | SWE-bench Verified | Licencia |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (FP8) | 35,9B | ~3B | 262.144 (ext. 1.010.000) | 73,4 | Apache 2.0 |
| Qwen3.5-35BA3B | no disponible | no disponible | no disponible | 70,0 | no disponible |
| Qwen3.5-27B | 27B | denso | no disponible | 75,0 | no disponible |
| Gemma4-31B | 31B | denso | no disponible | 52,0 | no disponible |
| Gemma4-26BA4B | 26B | ~4B | no disponible | 17,4 | no disponible |

Los datos de parámetros, contexto y licencia de los modelos comparables no están disponibles en la información proporcionada; solo se dispone de sus resultados en los benchmarks de la tabla.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información disponible; como modelo entrenado con datos web, es previsible que herede sesgos, pero no hay datos concretos.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de los modelos generativos.
- Limitaciones de contexto o idioma: el contexto nativo es de 262.144 tokens; la extensión hasta 1.010.000 tokens puede degradar la calidad y aumentar el consumo de memoria. Los idiomas naturales soportados no están especificados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar el enlace de licencia del modelo base incluido en la model card.
- Esta ficha corresponde a una cuantización de terceros (AH22-neb), no a los pesos oficiales de Qwen; la calidad puede diferir ligeramente del modelo original, aunque el autor declara métricas casi idénticas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.
- La información de benchmarks procede de la model card del modelo base y no ha sido verificada de forma independiente para esta cuantización.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AH22-neb/Qwen3.6-35B-A3B-FP8-kvscales
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B-FP8/blob/main/LICENSE
- Blog de Qwen3.6-35B-A3B: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Qwen Chat: https://chat.qwen.ai
