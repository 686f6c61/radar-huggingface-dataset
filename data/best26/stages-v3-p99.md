# best26/stages-v3-p99

## Resumen

El repositorio `best26/stages-v3-p99` contiene una copia o re-publicación del modelo Qwen3.6-35B-A3B, desarrollado originalmente por Alibaba Qwen. Se trata de un modelo causal de lenguaje multimodal (image-text-to-text) con arquitectura de mezcla de expertos (MoE) híbrida, que combina atención lineal (Gated DeltaNet) con atención tradicional (Gated Attention). Cuenta con 35.951 millones de parámetros totales y aproximadamente 3.000 millones de parámetros activos por token, lo que lo hace eficiente en inferencia pese a su tamaño. Su ventana de contexto nativa es de 262.144 tokens, extensible hasta 1.010.000 tokens, y está orientado a tareas de codificación agéntica, razonamiento sobre repositorios y flujos de trabajo frontend.

El modelo destaca por su capacidad de preservar el contexto de razonamiento en conversaciones históricas, una novedad introducida en la serie Qwen3.6. Su licencia Apache-2.0 permite uso comercial sin restricciones significativas. La publicación en este repositorio no proviene del equipo oficial de Qwen, sino del usuario `best26`, por lo que se recomienda verificar la procedencia de los pesos antes de su uso en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido: 40 capas, layout 10 × (3 × (Gated DeltaNet → MoE) → 1 × (Gated Attention → MoE)), con vision encoder |
| Parametros totales | 35.951.822.704 (35,95B) |
| Parametros activos | ~3B (8 expertos ruteados + 1 compartido de 256) |
| Longitud de contexto | 262.144 tokens nativo, extensible hasta 1.010.000 |
| Tipos de cuantizacion | No disponible (solo safetensors en el repo) |
| Idiomas soportados | No disponible (probablemente multilingüe, pero no se especifica) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (compatible con Transformers, vLLM, SGLang, KTransformers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de Qwen3.6-35B-A3B, un MoE híbrido con dos tipos de atención: Gated DeltaNet (atención lineal con 32 cabezas para V y 16 para QK, dimensión de cabeza 128) y Gated Attention (atención tradicional con 16 cabezas para Q y 2 para KV, dimensión de cabeza 256, RoPE de 64 dimensiones). La capa MoE contiene 256 expertos, de los cuales se activan 8 ruteados más 1 compartido, con dimensión intermedia de 512. Incluye también un módulo MTP (multi-token prediction) entrenado con múltiples pasos. La etapa de entrenamiento comprende pre-entrenamiento y post-entrenamiento, con énfasis en codificación agéntica y preservación del razonamiento histórico. No se detalla el número de tokens de entrenamiento ni la composición exacta del dataset en la información disponible.

## Capacidades

- Generación de texto y razonamiento complejo, con modo de pensamiento (thinking) integrado.
- Codificación agéntica: manejo de flujos de trabajo frontend y razonamiento a nivel de repositorio.
- Preservación del contexto de razonamiento en mensajes históricos para desarrollo iterativo.
- Procesamiento de imágenes (image-text-to-text), lo que permite entrada visual junto con texto.
- Soporte de contexto largo: 262K tokens nativos, extensible a más de 1M, adecuado para documentos extensos y repositorios completos.
- Capacidad de tool calling y function calling (implícita en el uso como agente, aunque no se documenta explícitamente en la model card).
- Compatibilidad con frameworks de inferencia estándar (Transformers, vLLM, SGLang, KTransformers).

## Casos de uso

- Desarrollo de agentes autónomos de codificación: el modelo puede razonar sobre repositorios completos, identificar errores y proponer parches, gracias a su ventana de contexto de 262K tokens y su entrenamiento en SWE-bench.
- Asistente de programación frontend: genera y modifica componentes HTML/CSS/JS con comprensión del contexto visual y textual, ideal para tareas de UI.
- Análisis de código legacy: su contexto amplio permite cargar proyectos enteros y responder preguntas sobre arquitectura, dependencias o deuda técnica.
- Automatización de tareas de terminal: con soporte para Terminal-Bench 2.0, puede ejecutar comandos, interpretar salidas y corregir errores en entornos CLI.
- Revisión de pull requests: integrado en pipelines de CI/CD, puede analizar diffs, detectar problemas de estilo o lógica y sugerir mejoras.
- Asistente de documentación técnica: dado un repositorio, genera documentación actualizada, comentarios de código y guías de uso.
- Soporte al cliente con contexto visual: al aceptar imágenes, puede resolver incidencias donde el usuario adjunta capturas de pantalla de errores o interfaces.

## Benchmarks y rendimiento

Los resultados publicados en la model card comparan Qwen3.6-35B-A3B con modelos similares. Se muestran los siguientes valores (porcentajes):

| Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B |
|---|---|---|---|---|---|
| SWE-bench Verified | 75.0 | 52.0 | 70.0 | 17.4 | 73.4 |
| SWE-bench Multilingual | 69.3 | 51.7 | 60.3 | 17.3 | 67.2 |
| SWE-bench Pro | 51.2 | 35.7 | 44.6 | 13.8 | 49.5 |
| Terminal-Bench 2.0 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos para MMLU, HumanEval, GSM8K u otros benchmarks generales en la información proporcionada. La tabla está truncada y no se puede completar.

## Requisitos de hardware

- Tamaño de pesos: 71,9 GB en fp32 (safetensors). Para inferencia en fp16/bf16, se necesitan aproximadamente 72 GB de VRAM.
- GPU recomendada: al menos una GPU de 80 GB (A100, H100, A800) o dos GPU de 40 GB (A100, RTX A6000) en paralelo. Con cuantización a 8 bits (~36 GB) podría caber en una RTX 4090 (24 GB) solo si se usa cuantización más agresiva (4 bits, ~18 GB), pero no se ofrecen pesos cuantizados en este repositorio.
- No cabe en GPUs de consumo (16 GB o menos) sin cuantización externa.
- Opciones de despliegue: Transformers, vLLM, SGLang, KTransformers. No se menciona compatibilidad con llama.cpp u Ollama en la model card, aunque es probable que funcione con GGUF si se genera.
- Latencia y throughput: no disponibles. Al ser un MoE con 3B activos, la velocidad de generación es significativamente mayor que un modelo denso de 35B, pero depende del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Enfoque principal |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (este repo) | 35B | 3B | 262K (ext. 1M) | Apache-2.0 | Codificación agéntica, multimodal |
| Qwen3.5-35B-A3B | 35B | 3B | 262K | Apache-2.0 | Codificación agéntica, multimodal |
| Qwen3.5-27B | 27B | 27B (denso) | 128K | Apache-2.0 | Razonamiento general, código |
| Gemma4-31B | 31B | 31B (denso) | 128K | Gemma license | Razonamiento general, código |

En los benchmarks de SWE-bench, Qwen3.6-35B-A3B supera a Gemma4-31B y se acerca a Qwen3.5-27B (que es denso y más grande en activos). La ventaja principal del MoE es la eficiencia computacional: con solo 3B activos, ofrece rendimiento cercano a modelos densos mucho más grandes.

## Limitaciones y advertencias

- El repositorio es una re-publicación no oficial por parte del usuario `best26`, no del equipo Qwen. No hay garantía de que los pesos sean idénticos al original ni de que no hayan sido modificados.
- No se proporciona información sobre sesgos, alucinaciones o limitaciones idiomáticas específicas. Como modelo entrenado principalmente para código, puede mostrar menor precisión en tareas de conocimiento general.
- La ventana de contexto de 262K tokens requiere una gestión cuidadosa de memoria; la extensión a 1M tokens puede degradar la calidad si no se usa la configuración adecuada.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar la procedencia de los pesos y cumplir con los términos del modelo original (Qwen3.6).
- No se incluyen pesos cuantizados en el repositorio; la cuantización debe realizarse por el usuario, lo que puede introducir pérdidas de precisión.
- No hay información sobre el dataset de entrenamiento, por lo que se desconoce la cobertura de idiomas y dominios.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/best26/stages-v3-p99
- Perfil del autor: https://huggingface.co/best26
- Blog oficial de Qwen3.6-35B-A3B: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
