# pitcany/Qwen3.6-35B-A3B

## Resumen

Qwen3.6-35B-A3B es un modelo de lenguaje causal multimodal con codificador de visión, publicado como la primera variante abierta de la familia Qwen3.6 tras la serie Qwen3.5 lanzada en febrero. Lo desarrolla el equipo Qwen (Alibaba), y esta ficha concreta corresponde a un repositorio espejo subido por el usuario `pitcany` a Hugging Face. El modelo emplea una arquitectura híbrida de atención lineal (Gated DeltaNet) combinada con atención con compuertas (Gated Attention) en un esquema Mixture of Experts, con 35.951.822.704 parámetros totales y aproximadamente 3.000 millones activados por token.

El modelo resuelve el problema del razonamiento agéntico sobre código en entornos reales: flujos de trabajo de frontend, razonamiento a nivel de repositorio y tareas multi-paso que requieren tool calling. Su relevancia actual radica en que combina una ventana de contexto nativa de 262.144 tokens (extensible hasta 1.010.000) con un coste de inferencia propio de un modelo de 3B activos, lo que lo hace viable en despliegues de producción con hardware moderado.

La innovación diferencial de esta versión es la "Thinking Preservation": la capacidad de retener el contexto de razonamiento de mensajes históricos, lo que reduce la sobrecarga en iteraciones de desarrollo y mejora la coherencia en tareas agénticas prolongadas. El modelo se distribuye con licencia Apache 2.0 y pesos en formato safetensors compatibles con Transformers, vLLM, SGLang y KTransformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal LM con codificador de visión; híbrido Gated DeltaNet + Gated Attention con MoE |
| Parametros totales | 35.951.822.704 (35B) |
| Parametros activos | ~3B (8 expertos enrutados + 1 compartido) |
| Longitud de contexto | 262.144 tokens nativo; extensible hasta 1.010.000 |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no confirmadas en la información disponible) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 71,9 GB) |
| Dimension oculta | 2048 |
| Capas | 40 |
| Token embedding | 248.320 (padded) |
| Expertos MoE | 256 (8 enrutados + 1 compartido), dimensión intermedia 512 |
| Cabezas de atención lineal (DeltaNet) | 32 para V, 16 para QK; dimensión 128 |
| Cabezas de atención con compuertas | 16 para Q, 2 para KV; dimensión 256; RoPE dim 64 |
| MTP | Entrenado con multi-steps |

## Arquitectura y entrenamiento

El modelo sigue un layout híbrido de 40 capas organizado como 10 bloques de la forma `3 × (Gated DeltaNet → MoE) → 1 × (Gated Attention → MoE)`. Las capas de Gated DeltaNet implementan atención lineal con 32 cabezas para V y 16 para QK, con dimensión de cabeza 128, lo que reduce el coste computacional en secuencias largas frente a la atención cuadrática clásica. Las capas de Gated Attention emplean 16 cabezas para Q y 2 para KV con dimensión 256 y RoPE de 64 dimensiones, aportando capacidad de atención global periódica. Cada bloque alimenta una capa MoE con 256 expertos, de los cuales se activan 8 enrutados más 1 compartido, con dimensión intermedia de 512 por experto.

El entrenamiento comprende fases de pre-entrenamiento y post-entrenamiento (la model card indica "Pre-training & Post-training"), con entrenamiento multi-step de MTP (Multi-Token Prediction). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas concretas de RLHF o DPO. La model card menciona que la versión se construyó a partir de feedback directo de la comunidad, priorizando estabilidad y utilidad en el mundo real, y destaca mejoras en codificación agéntica y razonamiento a nivel de repositorio.

## Capacidades

- Generación de texto y razonamiento multi-turno con ventana de contexto de 262.144 tokens nativos.
- Codificación agéntica: flujos de trabajo de frontend y razonamiento a nivel de repositorio con mayor fluidez y precisión según el autor.
- Comprensión de imágenes: pipeline `image-text-to-text` con codificador de visión integrado.
- Thinking Preservation: retención opcional del contexto de razonamiento de mensajes históricos para desarrollo iterativo.
- Soporte de tool calling / function calling (implícito en su orientación a agentes y en la compatibilidad con endpoints).
- Razonamiento multi-paso y ejecución de agentes.
- Capacidades multilingües: la model card incluye SWE-bench Multilingual, lo que confirma evaluación multilingüe, aunque no se detalla la lista de idiomas.
- Compatibilidad con Transformers, vLLM, SGLang y KTransformers.

## Casos de uso

- **Automatización de atención al cliente**: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a sus 262.144 tokens nativos, manteniendo el hilo de incidencias complejas sin truncar historial.
- **Generación de código en producción**: su soporte de tool calling y su orientación a agentes permiten integrarlo en pipelines de CI/CD para revisión automática de parches, generación de tests y resolución de issues a nivel de repositorio.
- **Asistentes de desarrollo en IDE**: con Thinking Preservation, el modelo conserva el razonamiento previo entre iteraciones, reduciendo la latencia percibida y la repetición de contexto en sesiones de pair programming.
- **Análisis de documentación técnica con imágenes**: al aceptar entradas image-text-to-text, puede procesar diagramas de arquitectura, capturas de errores o mockups de UI junto con texto para generar explicaciones o código asociado.
- **Migración y refactorización de repositorios**: su rendimiento en SWE-bench Multilingual (67,2) lo hace adecuado para tareas de traducción de código entre lenguajes y actualización de dependencias en bases de código grandes.
- **Agentes autónomos de terminal**: con contexto extensible hasta 1.010.000 tokens, puede mantener el estado de sesiones largas de shell, logs y trazas de error para diagnóstico automatizado.
- **Procesamiento de documentos extensos con elementos visuales**: informes, contratos o manuales con tablas e imágenes que requieren extracción y razonamiento conjunto.

## Benchmarks y rendimiento

Datos de la model card para la variante Qwen3.6-35B-A3B frente a modelos comparables:

| Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B |
|---|---|---|---|---|---|
| SWE-bench Verified | 75,0 | 52,0 | 70,0 | 17,4 | 73,4 |
| SWE-bench Multilingual | 69,3 | 51,7 | 60,3 | 17,3 | 67,2 |
| SWE-bench Pro | 51,2 | 35,7 | 44,6 | 13,8 | 49,5 |
| Terminal-Bench 2.0 | no disponible en el extracto | no disponible | no disponible | no disponible | no disponible |

No se han publicado en la información disponible resultados de benchmarks generales como MMLU, HumanEval o GSM8K para este modelo.

## Requisitos de hardware

- **VRAM estimada para inferencia**: los pesos en safetensors ocupan 71,9 GB en el repositorio (aproximadamente 35B parámetros en BF16/FP16). En FP16 se requieren del orden de 72 GB de VRAM solo para pesos, más overhead de KV cache.
- **Cuantización**: no se confirman cuantizaciones oficiales en la información disponible; al ser un MoE con 3B activos, una cuantización a 4 bits reduciría el peso a unos 18-20 GB, pero este dato no está verificado.
- **GPU recomendadas**: para FP16 completo, A100 80GB o H100 80GB (una o dos unidades según longitud de contexto). Para despliegues con cuantización, RTX 4090 (24 GB) o A6000 (48 GB) podrían ser viables, aunque no confirmado.
- **Consumer GPU**: previsiblemente viable en RTX 4090 con cuantización agresiva, dado el bajo número de parámetros activos, pero no hay datos oficiales de rendimiento en estas configuraciones.
- **Opciones de despliegue**: Transformers, vLLM, SGLang y KTransformers (confirmados por el autor). llama.cpp, Ollama y TGI no se mencionan en la información disponible.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | SWE-bench Verified | Licencia |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B | 35B | ~3B | 262.144 (ext. 1.010.000) | 73,4 | Apache 2.0 |
| Qwen3.5-35BA3B | 35B | ~3B | no disponible | 70,0 | no disponible |
| Qwen3.5-27B | 27B | 27B (denso) | no disponible | 75,0 | no disponible |
| Gemma4-31B | 31B | 31B (denso) | no disponible | 52,0 | no disponible |
| Gemma4-26BA4B | 26B | ~4B | no disponible | 17,4 | no disponible |

El modelo se sitúa por encima de su predecesor Qwen3.5-35BA3B en SWE-bench Verified (+3,4), Multilingual (+6,9) y Pro (+4,9), y por debajo del denso Qwen3.5-27B en Verified (-1,6) pero por encima en Multilingual (-2,1 a favor del 27B) y Pro (-1,7 a favor del 27B). Frente a Gemma4-31B la ventaja es amplia en todas las métricas de código.

## Limitaciones y advertencias

- **Sesgos**: no se documentan en la información disponible; como modelo entrenado con datos web, es previsible que herede sesgos de esos corpus.
- **Alucinación**: no se han publicado evaluaciones específicas de tasa de alucinación; en tareas de código agéntico el riesgo se traslada a parches incorrectos que compilan pero no resuelven el problema.
- **Idiomas**: la lista de idiomas soportados no está disponible, aunque la evaluación en SWE-bench Multilingual sugiere cobertura multilingüe.
- **Licencia**: Apache 2.0 permite uso comercial, pero la model card enlaza a la licencia del repositorio original de Qwen; conviene verificar los términos exactos del titular original antes de producción.
- **Repositorio espejo**: este repositorio (`pitcany/Qwen3.6-35B-A3B`) tiene 4 descargas y 0 likes, y fue creado el 2026-10-29; no es el repositorio oficial de Qwen, por lo que la integridad de los pesos debe validarse contra la fuente original.
- **Cuantizaciones**: la ausencia de cuantizaciones oficiales confirmadas limita el despliegue en hardware de consumo sin trabajo adicional.
- **Contexto extensible**: la extensión hasta 1.010.000 tokens requiere técnicas adicionales no detalladas y degrada el rendimiento y el consumo de memoria.
- **Benchmarks parciales**: solo se publican resultados de benchmarks de código; no hay datos de MMLU, matemáticas ni visión que permitan una evaluación completa.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/pitcany/Qwen3.6-35B-A3B
- Repositorio original de referencia: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia original: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Blog post del autor: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Qwen Chat: https://chat.qwen.ai
