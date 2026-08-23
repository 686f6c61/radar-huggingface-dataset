# logicpeak/albedo-qwen3.6-35b-raft-g1

## Resumen

`logicpeak/albedo-qwen3.6-35b-raft-g1` es un checkpoint post-entrenado del modelo Qwen3.6-35B-A3B, desarrollado por Qwen (Alibaba) y publicado por el usuario logicpeak en HuggingFace. Se trata de un modelo de lenguaje causal con encoder de visión (image-text-to-text) que combina una arquitectura híbrida de atención lineal (Gated DeltaNet) y atención completa (Gated Attention) con enrutamiento MoE disperso. El modelo totaliza 35.107 millones de parámetros, de los cuales se activan aproximadamente 3.000 millones por token, y ofrece una ventana de contexto nativa de 262.144 tokens extensible hasta 1.010.000.

La variante RAFT (Reinforcement Adaptive Fine-Tuning) representa un ajuste posterior al entrenamiento base orientado a estabilidad y utilidad práctica, con especial énfasis en codificación agéntica y razonamiento a nivel de repositorio. El modelo destaca por su rendimiento en tareas de agente de código (SWE-bench Verified 73.4) y por su capacidad de preservar contexto de razonamiento histórico para desarrollo iterativo. Publicado bajo licencia Apache 2.0, es compatible con HuggingFace Transformers, vLLM, SGLang y KTransformers.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet (atención lineal) + Gated Attention + MoE disperso, con vision encoder |
| Parametros totales | 35.107.181.936 (~35B) |
| Parametros activos | ~3B (8 expertos enrutados + 1 compartido) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 |
| Tipos de cuantizacion | No disponible en el repo (pesos BF16); compatible con cuantización GGUF/QAT mediante herramientas externas |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo emplea una pila híbrida de 40 capas organizadas en un layout de 10 bloques, cada uno con la secuencia `3 × (Gated DeltaNet → MoE) → 1 × (Gated Attention → MoE)`. El Gated DeltaNet usa 32 cabezas de atención lineal para V y 16 para QK con dimensión de cabeza 128; el Gated Attention usa 16 cabezas para Q y 8 para KV con dimensión de cabeza 256 y RoPE de 64 dimensiones. El componente MoE cuenta con 256 expertos, de los que se activan 8 enrutados más 1 compartido, con dimensión intermedia de 512. El embedding de tokens está rellenado a 248.320 y el modelo incorpora predicción multi-token (MTP) entrenada con múltiples pasos.

El entrenamiento comprende una fase de pre-entrenamiento y una posterior de post-entrenamiento. La variante RAFT (Reinforcement Adaptive Fine-Tuning) se centra en estabilidad y utilidad real, mejorando flujos de trabajo de frontend y razonamiento a nivel de repositorio. Incluye una opción nueva para conservar el contexto de razonamiento de mensajes históricos, lo que reduce la sobrecarga en desarrollo iterativo.

## Capacidades

- Generación de texto causal con soporte de razonamiento multi-paso y modo de pensamiento (thinking mode).
- Codificación agéntica: manejo de flujos de trabajo frontend y razonamiento a nivel de repositorio con fluidez y precisión.
- Comprensión de imágenes: el modelo incluye un encoder de visión y acepta entradas imagen-texto (pipeline image-text-to-text).
- Tool calling y function calling, compatible con el ecosistema Qwen para integración en agentes.
- Contexto largo: 262K tokens nativos, extensible hasta ~1M, apto para repositorios completos y conversaciones extensas.
- Preservación de contexto de razonamiento en mensajes históricos, optimizando desarrollo iterativo.
- Capacidades multilingües heredadas de la familia Qwen (idiomas específicos no documentados en la model card).

## Casos de uso

- **Agentes de desarrollo de código**: el modelo puede actuar como agente autónomo en SWE-bench, resolviendo issues reales en repositorios. Su rendimiento de 73.4 en SWE-bench Verified lo hace apto para pipelines de CI/CD que requieran parcheo automático de bugs.
- **Asistente de programación en IDE**: con 3B de parámetros activos y baja latencia, puede integrarse en editores para completado de código, refactorización y explicación de fragmentos en tiempo real.
- **Análisis de repositorios completos**: su contexto de 262K tokens permite cargar múltiples archivos y razonar sobre arquitectura global, dependencias y flujo de datos en un solo prompt.
- **Automatización de terminal**: con soporte de Terminal-Bench, puede ejecutar comandos, interpretar salidas y completar tareas administrativas o de DevOps de forma agéntica.
- **Chat con visión**: su encoder de imagen permite documentar código a partir de capturas de pantalla, diagramas de arquitectura o diseños de UI, útil en equipos de diseño y desarrollo.
- **Soporte técnico y documentación**: puede generar documentación técnica, guías de usuario y respuestas de soporte basadas en contexto largo de manuales y tickets previos.
- **Investigación en razonamiento**: su arquitectura híbrida y el entrenamiento RAFT lo hacen adecuado para experimentos de razonamiento multi-step y evaluación de técnicas de prompting.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados para el modelo base Qwen3.6-35B-A3B (el checkpoint RAFT no incluye benchmarks propios):

| Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B |
|---|---|---|---|---|---|
| SWE-bench Verified | 75.0 | 52.0 | 70.0 | 17.4 | 73.4 |
| SWE-bench Multilingual | 69.3 | 51.7 | 60.3 | 17.3 | 67.2 |
| SWE-bench Pro | 51.2 | 35.7 | 44.6 | 13.8 | 49.5 |
| Terminal-Bench 2.0 | no disponible | no disponible | no disponible | no disponible | no disponible |

El dato de Terminal-Bench 2.0 aparece truncado en la model card original, por lo que no se puede confirmar. El checkpoint RAFT no publica resultados propios en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: los pesos BF16 del repositorio ocupan 70.2 GB, por lo que se requieren al menos 80 GB de VRAM para cargar el modelo sin cuantización (p. ej., una A100 80GB o H100 80GB).
- **Con cuantización**: una versión Q4_K_M podría reducir el uso a aproximadamente 20-25 GB, lo que permitiría ejecutarlo en una RTX 4090 (24 GB) o RTX 3090. La búsqueda web confirma que el modelo se puede ejecutar en RTX 4090 con llama.cpp y compresión de cache KV turbo3.
- **GPUs recomendadas**: A100 80GB, H100 80GB, RTX 4090 (con cuantización), RTX 6000 Ada, o clusters de GPUs consumer con offload.
- **Opciones de despliegue**: HuggingFace Transformers, vLLM, SGLang, KTransformers y llama.cpp (vía GGUF).
- **Latencia y throughput**: la búsqueda web indica que el 35B-A3B es 3-4 veces más rápido que el Qwen3.6-27B dense en RTX 4090 con llama.cpp, gracias a la activación dispersa de 3B parámetros. No hay cifras exactas de tokens/segundo en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | SWE-bench Verified | Licencia |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (este) | 35B | 3B | 262K (ext. 1M) | 73.4 | Apache 2.0 |
| Qwen3.5-35B-A3B | 35B | 3B | no disponible | 70.0 | Apache 2.0 |
| Qwen3.5-27B | 27B | 27B (dense) | no disponible | 75.0 | Apache 2.0 |
| Gemma4-31B | 31B | 31B (dense) | no disponible | 52.0 | no disponible |

El modelo supera a Gemma4-31B y Gemma4-26BA4B en tareas de codificación agéntica, y se sitúa ligeramente por debajo de Qwen3.5-27B en SWE-bench Verified, pero con una ventaja de eficiencia notable (3B activos frente a 27B dense) y contexto mayor. Respecto a Qwen3.5-35B-A3B, mejora en SWE-bench Multilingual (+6.9 puntos) y SWE-bench Pro (+4.9 puntos).

## Limitaciones y advertencias

- **Sesgos**: como modelo entrenado en datos web, puede reflejar sesgos presentes en el corpus de entrenamiento de Qwen; no se documentan evaluaciones de sesgo específicas para esta variante.
- **Alucinación**: riesgo inherente en modelos de lenguaje, especialmente en tareas de razonamiento complejo; se recomienda verificar salidas en entornos de producción.
- **Contexto largo**: aunque la ventana es de 262K tokens, la calidad del razonamiento puede degradarse en los extremos del contexto, especialmente con más de 1M de tokens.
- **Licencia**: Apache 2.0 permite uso comercial sin restricciones significativas, pero es necesario revisar los términos del modelo base Qwen3.6-35B-A3B para posibles condiciones adicionales.
- **Estado del checkpoint**: el repositorio tiene 0 descargas y 0 likes, y el autor es independiente; no hay garantía de mantenimiento ni documentación adicional más allá de la model card del base.
- **Idiomas**: no se documentan los idiomas soportados; la cobertura multilingüe real debe verificarse empíricamente.
- **Hardware**: el tamaño de 70 GB en BF16 limita el despliegue local a GPUs de alta gama o requiere cuantización, lo que puede afectar a la calidad de la salida.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/logicpeak/albedo-qwen3.6-35b-raft-g1
- Blog oficial de Qwen3.6-35B-A3B: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Catálogo de modelos de Microsoft Foundry: https://ai.azure.com/catalog/models/FW-Qwen3.6-35B-A3B
- Guía comparativa Qwen 3.6 (27B vs 35B-A3B): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
- Benchmark independiente 35B vs 27B: https://zoliben.com/en/posts/2026-04-23-qwen-36-35b-vs-27b-benchmark-results/
- Checkpoint alternativo del mismo modelo: https://huggingface.co/power612/albedo-qwen3.6-35b-1a4001c8
