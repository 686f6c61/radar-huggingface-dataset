# crazyape777/fk-dendriteholdings-albedo-qwen3.6-35b-king-genesis

## Resumen

El modelo `crazyape777/fk-dendriteholdings-albedo-qwen3.6-35b-king-genesis` es una variante publicada por el usuario crazyape777 sobre el modelo Qwen3.6-35B-A3B de Alibaba, un modelo de lenguaje causal con encoder de visión (pipeline `image-text-to-text`). Se trata de un modelo de arquitectura mixta (MoE) con 35.951.822.704 parámetros totales (35,95B) y aproximadamente 3B activos por token, lo que lo sitúa en la categoría de modelos eficientes para inferencia con calidad de modelo grande.

El modelo destaca por su longitud de contexto nativa de 262.144 tokens, extensible hasta 1.010.000, y por sus capacidades de razonamiento agéntico y preservación del contexto de pensamiento, orientadas a flujos de desarrollo de software y tareas de razonamiento multi-paso. La licencia Apache 2.0 permite uso comercial sin restricciones significativas. Aunque el repositorio no presenta descargas ni valoraciones, la model card oficial de Qwen3.6-35B-A3B proporciona especificaciones detalladas y resultados de benchmarks que se recogen en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, híbrida (Gated DeltaNet + Gated Attention + MoE) |
| Parametros totales | 35.951.822.704 (35,95B) |
| Parametros activos | ~3B (8 expertos activados + 1 compartido de 256) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.010.000 |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en FP16/FP32) |
| Idiomas soportados | no disponible (la model card no especifica idiomas; Qwen suele ser multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers) |

## Arquitectura y entrenamiento

La arquitectura combina atención lineal (Gated DeltaNet) con atención clásica (Gated Attention) y mezcla de expertos. El layout oculto se organiza en 10 bloques, cada uno con 3 sub-bloques de `Gated DeltaNet → MoE` seguidos de 1 sub-bloque de `Gated Attention → MoE`. La capa DeltaNet usa 32 cabezas de atención lineal para V y 16 para QK con dimensión de cabeza 128; la capa de atención clásica usa 16 cabezas para Q y 2 para KV con dimensión 256 y RoPE de 64 dimensiones. El bloque MoE contiene 256 expertos, de los cuales se activan 8 más 1 compartido, con dimensión intermedia de 512.

El entrenamiento incluye una fase de pre-training y otra de post-training, con MTP (multi-token prediction) entrenado en múltiples pasos. La model card menciona dos mejoras clave: *agentic coding* (manejo de flujos de trabajo frontend y razonamiento a nivel de repositorio) y *thinking preservation* (opción de retener el contexto de razonamiento de mensajes históricos para desarrollo iterativo). No se especifican detalles sobre el dataset de entrenamiento ni sobre técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo de pensamiento (thinking) preservable entre turnos.
- Razonamiento agéntico para tareas de codificación, incluyendo análisis de repositorios completos y flujos de trabajo frontend.
- Soporte de entrada multimodal (imagen-texto) gracias al encoder de visión integrado.
- Capacidad de tool calling y function calling, aunque no se detalla explícitamente en la model card, es esperable en la familia Qwen3.6.
- Longitud de contexto muy amplia (262K nativa, hasta 1M con extensiones), adecuada para documentos largos y conversaciones multi-turno.
- Multilingüismo probable (no confirmado en la documentación proporcionada).

## Casos de uso

- Desarrollo de software agéntico: el modelo puede razonar sobre repositorios completos, identificar errores y proponer cambios, gracias a su capacidad de razonamiento a nivel de repositorio y su contexto de 262K tokens.
- Asistente de programación en IDE: integrable en editores como VS Code para autocompletado, refactorización y explicación de código, con soporte de tool calling para ejecutar comandos.
- Análisis de documentación técnica extensa: su ventana de contexto permite procesar manuales, especificaciones o libros técnicos completos en una sola pasada.
- Agente conversacional con memoria de razonamiento: la preservación del contexto de pensamiento permite mantener hilos de razonamiento coherentes en diálogos largos, útil para soporte técnico o tutoría.
- Generación de informes a partir de imágenes y texto: al ser image-text-to-text, puede describir diagramas, capturas de pantalla o figuras técnicas y combinarlas con texto.
- Automatización de tareas de CI/CD: con tool calling, puede analizar logs, proponer correcciones y ejecutar scripts en pipelines de integración continua.

## Benchmarks y rendimiento

La model card incluye resultados de benchmarks para tareas de codificación agéntica, comparando con modelos similares. Los datos disponibles son:

| Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B |
|---|---|---|---|---|---|
| SWE-bench Verified | 75.0 | 52.0 | 70.0 | 17.4 | 73.4 |
| SWE-bench Multilingual | 69.3 | 51.7 | 60.3 | 17.3 | 67.2 |
| SWE-bench Pro | 51.2 | 35.7 | 44.6 | 13.8 | 49.5 |
| Terminal-Bench 2.0 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 35,95B parámetros totales, en FP16 se necesitan aproximadamente 72 GB de VRAM. Con cuantización de 4 bits (por ejemplo, GPTQ o AWQ) se reduce a unos 18-20 GB, lo que permite ejecución en GPUs consumer de gama alta.
- GPU recomendadas: A100 80GB, H100 80GB, o RTX 4090 (24GB) con cuantización. Para despliegue en producción, se recomiendan GPUs con al menos 48 GB si se usa FP16.
- Compatibilidad con consumer GPU: sí, con cuantización 4-bit en RTX 3090/4090 (24GB) o RTX 4080 (16GB) con cuantización más agresiva.
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, SGLang y KTransformers, según la model card.
- Latencia y throughput: no disponibles en la documentación. Al ser un modelo MoE con solo 3B activos, la latencia por token es significativamente menor que la de un modelo denso de 35B, aunque depende del hardware y la implementación.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | SWE-bench Verified |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (base) | 35B | 3B | 262K (ext. 1M) | Apache 2.0 | 73.4 |
| Qwen3.5-35B-A3B | 35B | 3B | 262K | Apache 2.0 | 70.0 |
| Qwen3.5-27B | 27B | 27B (denso) | 262K | Apache 2.0 | 75.0 |
| Gemma4-31B | 31B | 31B (denso) | 128K | Gemma license | 52.0 |
| Gemma4-26B-A4B | 26B | 4B | 128K | Gemma license | 17.4 |

El modelo de esta ficha es una variante del Qwen3.6-35B-A3B, por lo que sus capacidades y rendimiento son equivalentes al modelo base, salvo posibles ajustes del autor. La comparativa muestra que Qwen3.6-35B-A3B supera a Gemma4 en tareas de codificación agéntica, aunque queda ligeramente por debajo de Qwen3.5-27B en SWE-bench Verified.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos o alucinaciones específicas de esta variante; al ser un modelo basado en Qwen3.6, hereda los riesgos típicos de los LLM: posible generación de información falsa o desactualizada.
- La longitud de contexto de 1M tokens es una extensión, no la configuración nativa; el rendimiento puede degradarse en contextos muy largos.
- No se especifican los idiomas soportados; aunque Qwen suele ser multilingüe, no hay confirmación para esta variante concreta.
- El repositorio no incluye documentación sobre el proceso de fine-tuning o los datos utilizados por el autor crazyape777, por lo que no se puede verificar la calidad o el propósito de la modificación.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos de la licencia del modelo base Qwen3.6-35B-A3B para confirmar que no hay restricciones adicionales.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/crazyape777/fk-dendriteholdings-albedo-qwen3.6-35b-king-genesis
- Modelo base Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Blog oficial de Qwen3.6-35B-A3B: https://qwen.ai/blog?id=qwen3.6-35b-a3b
