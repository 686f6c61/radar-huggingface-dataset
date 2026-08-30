# apurvaga/Qwen3.5-9B-preserve-thinking

## Resumen

El modelo `apurvaga/Qwen3.5-9B-preserve-thinking` es un espejo de compatibilidad del modelo oficial `Qwen/Qwen3.5-9B` de Alibaba, publicado por el usuario apurvaga. Su única diferencia respecto al original es un parche en la plantilla de chat (chat template) que hace que el razonamiento histórico del asistente se conserve por defecto en los turnos posteriores de una conversación, una funcionalidad denominada *preserved thinking*. Los pesos, la arquitectura y el vocabulario del tokenizador permanecen idénticos al modelo base, por lo que el rendimiento en tareas estándar no se ve alterado.

El modelo base Qwen3.5-9B es un modelo de lenguaje causal multimodal (procesa texto e imágenes) con una arquitectura híbrida que combina Gated Delta Networks (atención lineal) con Gated Attention (atención con RoPE) y capas FFN, en una configuración de 32 capas y aproximadamente 9.650 millones de parámetros. Soporta una longitud de contexto nativa de 262.144 tokens, extensible hasta 1.010.000, y ha sido entrenado con un pipeline de pre-entrenamiento y post-entrenamiento que incluye refuerzo a escala. Este mirror resulta relevante para desarrolladores que necesitan mantener cadenas de razonamiento coherentes en agentes conversacionales o sistemas multi-turno, sin renunciar a las capacidades del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet (atención lineal) + Gated Attention (RoPE) + FFN, con codificador de visión |
| Parametros totales | 9.653.104.368 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.010.000 |
| Tipos de cuantizacion | No disponible (repo solo contiene safetensors en precisión completa) |
| Idiomas soportados | No disponible en la ficha del mirror; el modelo base declara 201 idiomas y dialectos |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B emplea una arquitectura híbrida que intercala bloques de Gated DeltaNet (una forma de atención lineal con estado recurrente) con bloques de Gated Attention (atención softmax con RoPE) y capas FFN. La configuración exacta es `8 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN))`, con 32 capas en total. La dimensión oculta es 4096, la dimensión intermedia del FFN es 12288, y el embedding de tokens está rellenado a 248320. El modelo incluye un codificador de visión para entrada multimodal y un módulo MTP (Multi-Token Prediction) entrenado con múltiples pasos.

El entrenamiento combina pre-entrenamiento y post-entrenamiento, con un énfasis en el escalado de refuerzo (RL) en entornos de millones de agentes y distribuciones de tareas progresivamente complejas. El modelo base reporta una eficiencia de entrenamiento multimodal cercana al 100% respecto al entrenamiento solo de texto. El mirror `preserve-thinking` no modifica ningún peso; únicamente parchea las dos copias de la plantilla de chat para que el razonamiento del asistente en turnos históricos se conserve por defecto, permitiendo desactivarlo con `preserve_thinking=false`.

## Capacidades

- Generación de texto y razonamiento complejo, con puntuaciones destacadas en benchmarks de conocimiento y STEM (MMLU-Pro 82.5).
- Comprensión y generación multimodal: procesa imágenes junto con texto (pipeline `image-text-to-text`).
- Razonamiento paso a paso y modo *thinking* integrado en la plantilla de chat.
- Preservación del razonamiento histórico en conversaciones multi-turno (función *preserved thinking*), útil para agentes que requieren coherencia de decisión.
- Soporte para 201 idiomas y dialectos según el modelo base, lo que permite despliegue multilingüe.
- Compatible con frameworks de inferencia estándar: Hugging Face Transformers, vLLM, SGLang y KTransformers.
- Capacidades de agente y codificación, evaluadas en benchmarks de razonamiento, código y agentes del modelo base.

## Casos de uso

- Agentes conversacionales multi-turno: el parche *preserved thinking* mantiene el razonamiento del asistente a lo largo de la conversación, reduciendo la redundancia y mejorando la consistencia en tareas de decisión secuencial.
- Análisis de documentos con imágenes: al ser multimodal, puede extraer información de capturas, diagramas o documentos escaneados y razonar sobre ellos en el mismo hilo conversacional.
- Generación de código asistida: el modelo base muestra buen rendimiento en tareas de programación; el mirror permite mantener el contexto de razonamiento mientras se itera sobre soluciones de código.
- Atención al cliente multilingüe: con soporte para 201 idiomas, puede gestionar consultas en múltiples lenguas manteniendo el historial de razonamiento para resolver incidencias complejas.
- Asistentes de investigación científica: su capacidad de razonamiento STEM (MMLU-Pro 82.5) lo hace adecuado para ayudar en la revisión de literatura, formulación de hipótesis o resolución de problemas matemáticos.
- Sistemas de tutoría personalizada: el modo *thinking* permite explicar el proceso de resolución de problemas, y la preservación del razonamiento facilita el seguimiento del progreso del estudiante en sesiones largas.

## Benchmarks y rendimiento

La model card del modelo base incluye resultados de MMLU-Pro comparados con otros modelos. Se presentan los datos disponibles:

| Modelo | MMLU-Pro |
|---|---|
| GPT-OSS-120B | 80.8 |
| GPT-OSS-20B | 74.8 |
| Qwen3-Next-80B-A3B-Thinking | 82.7 |
| Qwen3-30BA3B-Thinking-2507 | 80.9 |
| Qwen3.5-9B | 82.5 |
| Qwen3.5-4B | 79.1 |

No se dispone de valores completos para MMLU-Redux ni otros benchmarks en la información proporcionada. El mirror no altera el rendimiento del modelo base, por lo que estos resultados son aplicables.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 9.653M parámetros. En precisión fp16/bf16 ocupa aproximadamente 19.3 GB (coincide con el tamaño del repo). Con cuantización de 4 bits (no incluida en el repo, pero posible mediante herramientas externas) se reduciría a unos 5-6 GB.
- GPU recomendadas: para inferencia en fp16 se necesita una GPU con al menos 24 GB de VRAM (RTX 4090, A100 40GB, L40S). Con cuantización 4-bit podría ejecutarse en GPUs de 8-12 GB (RTX 3080, RTX 4070, etc.).
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, SGLang y KTransformers. No se proporcionan archivos GGUF en el repo, pero podrían generarse para su uso con llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada. Dependerán del hardware y del framework de inferencia elegido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU-Pro | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B (mirror preserve-thinking) | 9.65B | 262K nativo, 1M extensible | 82.5 | Apache-2.0 | Hugging Face |
| Qwen3.5-4B | ~4B | no disponible | 79.1 | Apache-2.0 | Hugging Face |
| Qwen3-30BA3B-Thinking-2507 | 30B (3B activos) | no disponible | 80.9 | Apache-2.0 | Hugging Face |
| GPT-OSS-20B | 20B | no disponible | 74.8 | no disponible | no disponible |

El mirror no introduce diferencias de rendimiento respecto al Qwen3.5-9B original. La ventaja principal es la preservación del razonamiento en conversaciones largas, que no está presente en los modelos comparados de forma predeterminada.

## Limitaciones y advertencias

- El parche de plantilla de chat modifica el comportamiento por defecto: el razonamiento histórico se conserva siempre, lo que puede incrementar el consumo de tokens en conversaciones muy largas. Los desarrolladores deben evaluar si esta característica es deseable para su caso de uso.
- No se dispone de información sobre sesgos específicos del modelo. Como modelo entrenado con datos web, puede reflejar sesgos presentes en dichos datos.
- Riesgo de alucinación inherente a los modelos de lenguaje; se recomienda validar las respuestas en aplicaciones críticas.
- El modelo es multimodal, pero la calidad de la comprensión de imágenes no ha sido evaluada en la información proporcionada; se recomienda probar con casos de uso reales.
- La licencia Apache-2.0 permite uso comercial, pero el mirror no incluye documentación adicional sobre limitaciones de despliegue o restricciones de uso.
- El repo tiene 0 descargas y 0 likes, lo que indica que es un mirror reciente y poco validado por la comunidad; se recomienda verificar su integridad antes de usarlo en producción.

## Enlaces

- Repositorio del mirror: https://huggingface.co/apurvaga/Qwen3.5-9B-preserve-thinking
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3.5-9B
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Repositorio GitHub de Qwen3.5/Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Artículo de Kaitchup sobre preserved thinking: https://kaitchup.substack.com/p/qwen38-needs-preserved-thinking-q1
- Página de Ollama para qwen3.5:9b: https://ollama.com/library/qwen3.5:9b
