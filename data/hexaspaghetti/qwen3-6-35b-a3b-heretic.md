# HexaSpaghetti/Qwen3.6-35B-A3B-Heretic

## Resumen

Qwen3.6-35B-A3B-Heretic es una variante "decensored" (abliterated) del modelo Qwen3.6-35B-A3B de Alibaba Qwen, publicada por el usuario HexaSpaghetti en Hugging Face. El modelo base es un transformer causal multimodal con encoder de visión y arquitectura Mixture of Experts (MoE), con 35.107 millones de parámetros totales y aproximadamente 3.000 millones activos por token, entrenado para tareas de razonamiento, código agéntico y comprensión de imagen y texto. La modificación aplicada mediante la herramienta Heretic v2.2.0.dev0 reduce drásticamente las negativas del modelo a responder peticiones: según la model card, pasa de 99/100 rechazos en el modelo original a 1/100 en esta variante, con una divergencia KL de 0,4369 respecto al original.

El interés de esta ficha radica en dos frentes. Por un lado, documenta el modelo base Qwen3.6-35B-A3B, que introduce mejoras en codificación agéntica (SWE-bench Verified de 73,4 frente a 70,0 de Qwen3.5-35BA3B) y una ventana de contexto nativa de 262.144 tokens extensible hasta 1.010.000. Por otro, describe una intervención de ablación de comportamiento ("Arbitrary-Rank Ablation") aplicada sobre las capas 20 a 38 que elimina los mecanismos de rechazo, algo relevante para quienes investigan alineación, seguridad y comportamiento de modelos abiertos.

La licencia declarada es Apache 2.0, heredada del modelo base, y los pesos están en formato safetensors con compatibilidad para transformers, vLLM, SGLang y KTransformers. El repositorio ocupa 106,7 GB y, en el momento de la consulta, acumula 8 descargas y ningún "like", lo que indica una publicación muy reciente y de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con encoder de vision y Mixture of Experts; capas hibridas Gated DeltaNet (atencion lineal) y Gated Attention |
| Parametros totales | 35.107.181.936 (35B) |
| Parametros activos | ~3B (8 expertos enrutados + 1 compartido de 256 totales) |
| Longitud de contexto | 262.144 tokens nativo; extensible hasta 1.010.000 |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors sin cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |
| Dimension oculta | 2048 |
| Numero de capas | 40 |
| Layout de capas | 10 x (3 x (Gated DeltaNet -> MoE) -> 1 x (Gated Attention -> MoE)) |
| Cabezas de atencion | Gated DeltaNet: 32 para V y 16 para QK, dim 128; Gated Attention: 16 para Q y 2 para KV, dim 256, RoPE 64 |
| Dimensión intermedia de experto | 512 |
| Vocabulario / embeddings | 248.320 (padded) |
| MTP | Entrenado con multi-steps |
| Tamano del repo | 106,7 GB |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B emplea una arquitectura híbrida que combina capas de atención lineal Gated DeltaNet con capas de atención completa (Gated Attention), intercaladas en un patrón repetido 10 veces: tres bloques de Gated DeltaNet más MoE seguidos de un bloque de Gated Attention más MoE. Cada bloque MoE dispone de 256 expertos, de los que se activan 8 enrutados más 1 compartido por token, con dimensión intermedia de 512. La dimensión oculta es 2048, el vocabulario está pandado a 248.320 entradas y el modelo incorpora un encoder de visión, lo que lo convierte en un modelo image-text-to-text. Se entrenó con multi-token prediction (MTP) en varios pasos y pasó por fases de preentrenamiento y postentrenamiento, según indica la model card del modelo base.

La variante Heretic aplica una intervención de ablación de rango arbitrario (Arbitrary-Rank Ablation, ARA) sobre las capas 20 a 38, con pesos concretos: `preserve_good_behavior_weight` 0,4379, `steer_bad_behavior_weight` 0,0835, `overcorrect_relative_weight` 0,7961 y `neighbor_count` 3. El objetivo es suprimir el comportamiento de rechazo sin reentrenar los pesos completos. El autor indica que el proceso es reproducible y publica instrucciones en el directorio `reproduce/` del repositorio. No se detalla en la información disponible el volumen de tokens de entrenamiento del modelo base, la composición del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno con contexto nativo de 262.144 tokens.
- Razonamiento y codificación agéntica: el modelo base está optimizado para flujos de trabajo de frontend y razonamiento a nivel de repositorio.
- Comprensión de imagen y texto (pipeline image-text-to-text con encoder de visión).
- Capacidad de "thinking preservation": opción para retener el contexto de razonamiento de mensajes históricos y reducir sobrecarga en desarrollo iterativo.
- Soporte de tool calling y function calling, heredado del ecosistema Qwen y compatible con transformers, vLLM, SGLang y KTransformers.
- Capacidades multilingües: el modelo base Qwen3.6 declara soporte multilingüe (SWE-bench Multilingual evaluado), aunque la lista concreta de idiomas no está disponible en la información proporcionada.
- Comportamiento "decensored": responde a peticiones que el modelo original rechazaría (1/100 rechazos frente a 99/100 del original, según la model card).
- Compatibilidad con endpoints de Hugging Face (tag `endpoints_compatible`).

## Casos de uso

- Investigación en alineación y seguridad: el modelo permite estudiar cómo la ablación de direcciones de activación afecta al comportamiento de rechazo, comparando directamente con el modelo base y midiendo la divergencia KL (0,4369) y la tasa de negativas.
- Generación de código en producción: con SWE-bench Verified de 73,4 en el modelo base, puede integrarse en pipelines de CI/CD para resolver issues de repositorio y generar parches, usando tool calling para consultar el estado del código.
- Asistentes de desarrollo con contexto largo: la ventana de 262.144 tokens permite cargar repositorios completos o documentación extensa en una sola sesión, útil para refactorizaciones y revisiones de código a nivel de proyecto.
- Atención al cliente automatizada: conversaciones multi-turno con historial largo gracias al contexto extendido y a la preservación del razonamiento entre mensajes.
- Procesamiento de documentos con imagen y texto: al ser image-text-to-text, puede extraer información de capturas, diagramas o formularios combinados con texto en tareas de digitalización.
- Experimentación con modelos sin censura para investigación creativa: generación de contenido narrativo o escenarios que el modelo base rechazaría, en entornos controlados y con las advertencias legales correspondientes.
- Evaluación comparativa de robustez: servir como contrapunto en benchmarks de seguridad para medir la degradación de capacidades tras la ablación.

## Benchmarks y rendimiento

Resultados publicados en la model card del modelo base Qwen3.6-35B-A3B (no se dispone de benchmarks propios de la variante Heretic más allá de las métricas de rechazo y divergencia KL):

| Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B |
|---|---|---|---|---|---|
| SWE-bench Verified | 75,0 | 52,0 | 70,0 | 17,4 | 73,4 |
| SWE-bench Multilingual | 69,3 | 51,7 | 60,3 | no disponible | no disponible (truncado en la información) |

Métricas de la intervención Heretic:

| Metrica | Este modelo | Modelo original |
|---|---|---|
| Rechazos (sobre 100) | 1/100 | 99/100 |
| Divergencia KL | 0,4369 | 0 (por definición) |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 70 GB solo para pesos, más overhead de activaciones y caché KV, por lo que se recomienda un mínimo de 80 GB.
- GPU recomendadas para precisión completa: A100 80GB, H100 80GB, H200 o configuraciones multi-GPU (2 x RTX 4090 de 24 GB no bastan en BF16; se requiere cuantización).
- En consumer GPU: viable con cuantización de 4 bits (estimación aproximada de 18-22 GB), lo que permitiría ejecutarlo en una RTX 4090 de 24 GB o en una RTX 3090, aunque no se han publicado cuantizaciones oficiales en el repositorio.
- Opciones de despliegue: transformers, vLLM, SGLang y KTransformers, según la model card del modelo base; llama.cpp y Ollama no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | SWE-bench Verified | Licencia |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Heretic | 35B | ~3B | 262.144 (ext. 1.010.000) | 73,4 (modelo base) | Apache 2.0 |
| Qwen3.5-35BA3B | 35B | ~3B | no disponible | 70,0 | Apache 2.0 (presumible) |
| Qwen3.5-27B | 27B | denso | no disponible | 75,0 | Apache 2.0 (presumible) |
| Gemma4-31B | 31B | denso | no disponible | 52,0 | no disponible |

La variante Heretic mantiene las capacidades del modelo base salvo por la supresión del comportamiento de rechazo, por lo que su rendimiento en tareas estándar debería ser comparable con una degradación medida por la divergencia KL de 0,4369.

## Limitaciones y advertencias

- La ablación elimina los mecanismos de rechazo: el modelo puede generar contenido dañino, ofensivo o ilegal sin filtros, lo que exige supervisión humana y salvaguardas externas en producción.
- La divergencia KL de 0,4369 respecto al original implica cambios medibles en la distribución de salida que pueden afectar a la calidad en tareas sensibles.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de factualidad para esta variante.
- Idiomas soportados no documentados en la información disponible; el rendimiento multilingüe puede diferir del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el uso de una variante decensored puede contravenir términos de servicio de plataformas o normativas locales sobre contenido.
- Publicación muy reciente y de nicho (8 descargas, 0 likes): no hay validación comunitaria ni cuantizaciones publicadas.
- El repositorio ocupa 106,7 GB y no incluye versiones GGUF, lo que limita el despliegue en hardware de consumo sin conversión manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HexaSpaghetti/Qwen3.6-35B-A3B-Heretic
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Blog de Qwen3.6-35B-A3B: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Proyecto Heretic: https://heretic-project.org
- Qwen Chat: https://chat.qwen.ai
