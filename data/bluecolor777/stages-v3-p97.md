# bluecolor777/stages-v3-p97

## Resumen

El modelo `bluecolor777/stages-v3-p97` es una implementación de la variante Qwen3.6-35B-A3B, un modelo de lenguaje causal con codificador de visión (image-text-to-text) desarrollado por Alibaba. Aunque el repositorio pertenece al usuario bluecolor777, la model card reproduce íntegramente la documentación oficial de Qwen, por lo que se trata de una copia o adaptación del modelo original. Este modelo destaca por su arquitectura híbrida de mezcla de expertos (MoE) con 35 000 millones de parámetros totales y solo 3 000 millones activos por token, lo que lo hace especialmente eficiente en inferencia sin sacrificar capacidad.

La versión 3.6 de Qwen se centra en mejorar la estabilidad y la utilidad real en tareas de programación agéntica, incluyendo razonamiento a nivel de repositorio y generación de código frontend. También introduce una opción para conservar el contexto de razonamiento de mensajes históricos, lo que facilita el desarrollo iterativo. Con una ventana de contexto nativa de 262 144 tokens, ampliable hasta aproximadamente 1 010 000, este modelo está diseñado para manejar proyectos de software extensos y conversaciones de múltiples turnos.

La relevancia actual de este modelo radica en su combinación de tamaño moderado, arquitectura MoE eficiente, capacidades multimodales (visión y texto) y un rendimiento competitivo en benchmarks de ingeniería de software, posicionándose como una opción viable para despliegues en producción con requisitos de hardware moderados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con codificador de visión, capas híbridas (Gated DeltaNet + Gated Attention) y MoE |
| Parametros totales | 35 951 822 704 (~35,95 B) |
| Parametros activos | 3 B (8 expertos enrutados + 1 compartido) |
| Longitud de contexto | 262 144 tokens nativos, extensible hasta ~1 010 000 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

La arquitectura combina un codificador de visión con un modelo de lenguaje causal de 40 capas. Cada capa sigue un patrón de 10 bloques, donde cada bloque contiene tres subcapas de Gated DeltaNet (atención lineal) seguidas de MoE, y una subcapa de Gated Attention (atención completa) también seguida de MoE. El MoE cuenta con 256 expertos en total, de los cuales se activan 8 enrutados más 1 compartido, con dimensión intermedia de 512. La dimensión oculta es 2048 y el embedding de tokens tiene un tamaño de 248 320 (con padding). Se emplea MTP (multi-token prediction) entrenado con múltiples pasos, lo que mejora la eficiencia de decodificación.

El entrenamiento comprende fases de pre-entrenamiento y post-entrenamiento, aunque no se especifican los detalles del corpus de datos ni las técnicas de alineación (como RLHF o DPO). La documentación destaca mejoras específicas en tareas de codificación agéntica, como el manejo de flujos de trabajo frontend y razonamiento a nivel de repositorio, así como la preservación del contexto de razonamiento en mensajes históricos para facilitar el desarrollo iterativo.

## Capacidades

- Generación de texto y razonamiento complejo, con especial énfasis en tareas de programación y resolución de problemas de software.
- Comprensión de imágenes (image-text-to-text), permitiendo analizar capturas de pantalla, diagramas o documentos visuales.
- Razonamiento agéntico a nivel de repositorio: puede entender estructuras de proyectos, múltiples archivos y dependencias.
- Generación de código frontend (HTML, CSS, JavaScript) con fluidez y precisión.
- Soporte de tool calling y function calling, habilitando integración con herramientas externas y APIs.
- Capacidad de mantener contexto largo (hasta 1M tokens) para conversaciones extensas o análisis de código fuente completo.
- Soporte de agentes y multi-step reasoning, útil para flujos de trabajo automatizados.

## Casos de uso

- Asistente de programación en IDE: el modelo puede sugerir implementaciones completas, refactorizar código y explicar fragmentos complejos, gracias a su capacidad de razonamiento a nivel de repositorio y su contexto de 262K tokens.
- Automatización de tareas de terminal: con soporte de tool calling, puede ejecutar comandos, interpretar salidas y corregir errores en pipelines de CI/CD.
- Análisis de capturas de pantalla o maquetas: al ser multimodal, puede convertir una imagen de un diseño UI en código frontend funcional.
- Revisión de código en pull requests: puede analizar diffs, detectar posibles bugs y sugerir mejoras, aprovechando su contexto largo para considerar todo el repositorio.
- Generación de documentación técnica: puede leer código fuente y producir documentación clara y estructurada en varios idiomas.
- Chatbots de soporte técnico con comprensión de imágenes: puede ayudar a diagnosticar problemas a partir de capturas de pantalla de errores o logs.
- Desarrollo de agentes autónomos de software: su capacidad de razonamiento multi-paso y tool calling permite construir agentes que planifican y ejecutan tareas de programación de forma autónoma.

## Benchmarks y rendimiento

La model card proporciona resultados para tareas de codificación agéntica, comparando con varios modelos de tamaño similar. Los datos disponibles son:

| Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B |
|---|---|---|---|---|---|
| SWE-bench Verified | 75.0 | 52.0 | 70.0 | 17.4 | 73.4 |
| SWE-bench Multilingual | 69.3 | 51.7 | 60.3 | 17.3 | 67.2 |
| SWE-bench Pro | 51.2 | 35.7 | 44.6 | 13.8 | 49.5 |

No se han publicado resultados de benchmarks adicionales (como MMLU, HumanEval o GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: con pesos en BF16 (35B parámetros), se necesitan aproximadamente 70 GB de VRAM solo para los pesos. Con cuantización de 4 bits (si estuviera disponible) se reduciría a unos 18-20 GB, permitiendo ejecución en GPUs de consumo como RTX 4090 (24 GB).
- GPUs recomendadas: para inferencia sin cuantizar, se requieren GPUs de datacenter como A100 (80 GB) o H100 (80 GB). Con cuantización, una RTX 4090 o RTX 6000 Ada puede ser suficiente.
- Compatibilidad con consumer GPUs: sí, siempre que se aplique cuantización (por ejemplo, GGUF de 4 bits) y se use software como llama.cpp u Ollama.
- Opciones de despliegue: el modelo es compatible con Hugging Face Transformers, vLLM, SGLang, KTransformers, y probablemente con llama.cpp y Ollama mediante conversión a GGUF.
- Latencia y throughput: al ser MoE con solo 3B parámetros activos, la latencia por token es significativamente menor que la de un modelo denso de 35B. En GPUs de datacenter, se pueden alcanzar decenas de tokens por segundo, aunque los valores exactos dependen de la implementación y el hardware.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | SWE-bench Verified |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (este) | 35B | 3B | 262K (ext. 1M) | Apache 2.0 | 73.4 |
| Qwen3.5-35B-A3B | 35B | 3B | 262K | Apache 2.0 | 70.0 |
| Gemma4-31B | 31B (denso) | 31B | no disponible | Gemma license | 52.0 |

La comparativa muestra que este modelo supera a su predecesor directo (Qwen3.5-35B-A3B) en SWE-bench Verified, y ofrece un rendimiento muy superior al de Gemma4-31B, con la ventaja adicional de ser MoE (menor coste de inferencia) y tener licencia Apache 2.0, que permite uso comercial sin restricciones.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos o alucinaciones específicas de este modelo, pero al estar orientado a código, puede generar soluciones incorrectas o incompletas si el contexto no es claro.
- La ventana de contexto de 262K tokens puede requerir una gestión cuidadosa de la memoria y un hardware potente para aprovechar todo su potencial.
- Los idiomas soportados no están documentados; aunque Qwen suele ser multilingüe, no hay confirmación oficial para esta variante.
- La licencia Apache 2.0 permite uso comercial, pero es recomendable revisar los términos del modelo original de Qwen para asegurar el cumplimiento.
- El repositorio pertenece a un usuario externo (bluecolor777) y no es un lanzamiento oficial de Alibaba; se recomienda verificar la integridad de los pesos y la procedencia antes de usarlo en producción.
- No se han publicado resultados de benchmarks generales (MMLU, HumanEval, etc.), por lo que su rendimiento en tareas no relacionadas con código no está validado.

## Enlaces

- Repositorio del modelo: https://huggingface.co/bluecolor777/stages-v3-p97
- Modelo original de Qwen (referencia): https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Blog oficial de Qwen sobre Qwen3.6-35B-A3B: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Repositorio relacionado del mismo autor: https://huggingface.co/bluecolor777/stages-v3
- Página de FriendliAI con el modelo: https://friendli.ai/models/bluecolor777/stages-v3
