# MENIARAYOUB/Qwen3.5-2B

## Resumen

Qwen3.5-2B es un modelo de lenguaje causal con encoder de visión desarrollado por Alibaba Qwen. Este repositorio concreto es un fine-tune creado por MENIARAYOUB a partir del modelo base Qwen/Qwen3.5-2B-Base, con la misma arquitectura y capacidades multimodales. El modelo combina una arquitectura híbrida eficiente (Gated Delta Networks + Gated Attention) con un encoder de visión, y soporta una longitud de contexto nativa de 262.144 tokens. Con aproximadamente 2.270 millones de parámetros, está pensado para prototipado, fine-tuning específico e investigación. La licencia Apache 2.0 permite uso comercial, y el modelo está disponible en formato safetensors compatible con Transformers, vLLM, SGLang y KTransformers.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder (híbrida: Gated DeltaNet + Gated Attention) |
| Parametros totales | 2.274.069.824 (2,27B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (nativa) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 201 idiomas y dialectos (según model card del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura híbrida que combina capas de atención lineal (Gated DeltaNet) con capas de atención estándar (Gated Attention). El layout oculto se compone de 6 bloques, cada uno con 3 sub-bloques de DeltaNet→FFN y 1 sub-bloque de Gated Attention→FFN. La dimensión oculta es 2048, con 24 capas en total. El token embedding tiene 248.320 entradas (con padding) y la salida LM está atada a este embedding. El modelo fue pre-entrenado y post-entrenado con técnicas de RL escaladas en entornos con millones de agentes y tareas progresivamente más complejas. También se entrenó con predicción multi-token (MTP). La fusión temprana de tokens multimodales permite un rendimiento comparable o superior a modelos Qwen3-VL en razonamiento, código, agentes y comprensión visual.

## Capacidades

- Generación de texto y razonamiento en modo instructivo (no-pensante), con una arquitectura diseñada para razonamiento multi-paso.
- Comprensión visual: pipeline image-text-to-text, con encoder de visión integrado que permite interpretar imágenes y documentos.
- Soporte para agentes y razonamiento multi-paso, entrenado con RL en entornos de agentes.
- Multilingüe: soporte ampliado a 201 idiomas y dialectos, incluyendo matices culturales y regionales.
- Contexto largo nativo de 262.144 tokens, adecuado para procesar documentos extensos.
- Tool calling / function calling: no se especifica en la documentación disponible, aunque el diseño orientado a agentes sugiere soporte para ello.

## Casos de uso

- Asistentes de documentación técnica: gracias a la ventana de contexto de 262k tokens, puede procesar manuales extensos y responder preguntas sobre ellos, reduciendo la necesidad de fragmentar documentos.
- Análisis de capturas de pantalla en soporte técnico: al ser multimodal, puede interpretar imágenes de errores o interfaces y guiar al usuario paso a paso.
- Generación de código a partir de mockups: el encoder de visión permite convertir diseños visuales en código inicial, útil en prototipado rápido.
- RAG multimodal sobre documentos extensos: combina recuperación de texto e imágenes para responder consultas complejas en entornos empresariales.
- Agentes conversacionales multilingües: su soporte de 201 idiomas lo hace adecuado para asistentes globales en atención al cliente.
- Prototipado y fine-tuning: al ser un modelo de 2B, es adecuado para tareas específicas con recursos limitados, permitiendo iteraciones rápidas en GPU de consumo.
- Accesibilidad: puede describir imágenes y escenas para personas con discapacidad visual, integrándose en aplicaciones de asistencia.

## Benchmarks y rendimiento

Se han publicado los siguientes resultados en la model card del modelo base, en modo instructivo (no-pensante):

| Benchmark | Qwen3.5-2B | Qwen3-4B-2507 | Qwen3-1.7B | Qwen3.5-0.8B |
|---|---|---|---|---|
| MMLU-Pro | 55.3 | 69.6 | 40.2 | 29.7 |
| MMLU-Redux | 69.2 | 84.2 | 64.4 | 48.5 |
| C-Eval | 65.2 | 80.2 | 61.0 | 46.4 |

No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16/BF16, ~4,5 GB; con cuantización 4-bit, ~2 GB.
- GPU recomendadas: RTX 3060 12GB, RTX 4090, A10, A100.
- Cabe en consumer GPU: sí, a partir de 8 GB de VRAM.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang, KTransformers, LM Studio, Ollama (probable).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU-Pro | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-2B (fine-tune) | 2,27B | 262.144 | 55.3 | Apache 2.0 | HuggingFace |
| Qwen3-1.7B | 1,7B | no disponible | 40.2 | Apache 2.0 | HuggingFace |
| Qwen3.5-0.8B | 0,8B | no disponible | 29.7 | Apache 2.0 | HuggingFace |
| Qwen3-4B-2507 | 4B | no disponible | 69.6 | Apache 2.0 | HuggingFace |

## Limitaciones y advertencias

- Modelo pequeño (2B): mayor riesgo de alucinación y menor capacidad de razonamiento que modelos más grandes.
- No se han documentado sesgos específicos, pero al ser un fine-tune de un autor no verificado, la calidad y seguridad del ajuste no están garantizadas.
- La ventana de contexto de 262k es nativa, pero el rendimiento puede degradarse en contextos muy largos.
- Licencia Apache 2.0 permite uso comercial, pero hay que revisar los términos del modelo base y de los datos de entrenamiento.
- No se especifican tipos de cuantización oficiales; el despliegue con cuantización requiere verificación adicional.

## Enlaces

- Repositorio del fine-tune: https://huggingface.co/MENIARAYOUB/Qwen3.5-2B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Página en LM Studio: https://lmstudio.ai/models/qwen/qwen3.5-2b
