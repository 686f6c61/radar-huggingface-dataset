# crazyape777/fk-diane613-affine-5gedzafcvg-jesusss

## Resumen

El repositorio `crazyape777/fk-diane613-affine-5gedzafcvg-jesusss` es un duplicado del modelo `diane613/Affine-5gedzafcvg-jesusss`, publicado por el usuario crazyape777. Según la model card incluida, el modelo corresponde a **Qwen3.6-35B-A3B**, un modelo de lenguaje causal multimodal con codificador de visión, desarrollado por Alibaba Qwen. Se trata de una arquitectura Mixture of Experts (MoE) con 35 mil millones de parámetros totales y 3 mil millones activos por token, diseñada para tareas de razonamiento, codificación agéntica y comprensión de imágenes.

La relevancia de este modelo radica en su equilibrio entre tamaño y eficiencia: al activar solo 3B parámetros, ofrece un rendimiento comparable a modelos densos de 30-40B con un coste de inferencia mucho menor. Incorpora innovaciones como atención lineal Gated DeltaNet, atención Gated Attention con RoPE, y un contexto nativo de 262 144 tokens extensible hasta 1 010 000. Sin embargo, es importante señalar que la model card del repositorio podría no corresponder exactamente al modelo original de diane613, ya que el tag de HuggingFace indica `qwen3_5_moe` mientras que el README describe Qwen3.6. No hay información independiente sobre el modelo `Affine-5gedzafcvg-jesusss` más allá de lo que aparece en este repositorio duplicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con codificador de visión, basada en Qwen3.6-35B-A3B según model card |
| Parametros totales | 35 107 181 936 (35B) |
| Parametros activos | 3B (según model card) |
| Longitud de contexto | 262 144 tokens nativo, extensible hasta 1 010 000 tokens |
| Tipos de cuantizacion | No disponible (el repo contiene pesos en BF16, sin cuantizaciones publicadas) |
| Idiomas soportados | No disponible (la model card no especifica idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

Según la model card, el modelo emplea una arquitectura híbrida con 40 capas organizadas en bloques de 10 × (3 × (Gated DeltaNet → MoE) → 1 × (Gated Attention → MoE)). La atención lineal Gated DeltaNet usa 32 cabezas para V y 16 para QK con dimensión 128, mientras que la Gated Attention tiene 16 cabezas Q y 2 KV con dimensión 256 y RoPE de 64 dimensiones. El bloque MoE contiene 256 expertos, de los cuales se activan 8 enrutados más 1 compartido, con dimensión intermedia de 512. El embedding de tokens tiene 248 320 entradas (padded).

El entrenamiento se describe como "Pre-training & Post-training" e incluye MTP (Multi-Token Prediction) entrenado con múltiples pasos. No se proporcionan detalles sobre el dataset, número de tokens de entrenamiento ni técnicas de alineación como RLHF o DPO. La model card menciona que es la primera variante de pesos abiertos de Qwen3.6, priorizando estabilidad y utilidad en codificación agéntica.

## Capacidades

- **Generación de texto y razonamiento**: modelo causal de lenguaje con capacidades avanzadas de razonamiento, especialmente en tareas de codificación y resolución de problemas.
- **Codificación agéntica**: maneja flujos de trabajo frontend y razonamiento a nivel de repositorio con precisión, según la model card.
- **Preservación del contexto de pensamiento**: opción para retener el contexto de razonamiento de mensajes históricos, reduciendo overhead en desarrollo iterativo.
- **Multimodal (imagen-texto)**: incluye codificador de visión, lo que permite procesar imágenes como entrada adicional al texto.
- **Soporte de tool calling y agentes**: no se menciona explícitamente, pero la arquitectura agéntica sugiere compatibilidad con llamadas a herramientas.
- **Multilingüe**: no especificado, aunque modelos Qwen suelen soportar múltiples idiomas.

## Casos de uso

- **Asistente de codificación en IDE**: el modelo puede integrarse en editores como VS Code para autocompletar, refactorizar y explicar código. Su contexto largo (262K tokens) permite procesar repositorios completos en una sola pasada, facilitando la comprensión del proyecto.
- **Agente de desarrollo frontend**: gracias a su capacidad para manejar flujos de trabajo frontend, puede generar componentes React/Vue, estilos CSS y lógica de interacción a partir de descripciones en lenguaje natural.
- **Revisión de código automatizada en CI/CD**: con su habilidad para razonar sobre repositorios, puede analizar pull requests, detectar bugs potenciales y sugerir mejoras, integrándose como paso en pipelines de integración continua.
- **Chatbot de soporte técnico multimodal**: al aceptar imágenes, puede interpretar capturas de pantalla de errores o diagramas, y responder con soluciones detalladas en conversaciones multi-turno.
- **Análisis de documentación técnica**: su contexto extenso permite resumir y extraer información de manuales extensos o documentación de APIs, generando respuestas precisas sobre APIs específicas.
- **Generación de tests unitarios**: el modelo puede crear casos de prueba a partir de código fuente, aprovechando su comprensión de lógica de programación y su capacidad de razonamiento multi-paso.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks comparativos con otros modelos. Los resultados para Qwen3.6-35B-A3B son:

| Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B |
|---|---|---|---|---|---|
| SWE-bench Verified | 75.0 | 52.0 | 70.0 | 17.4 | **73.4** |
| SWE-bench Multilingual | 69.3 | 51.7 | 60.3 | 17.3 | **67.2** |
| SWE-bench Pro | 51.2 | 35.7 | 44.6 | 13.8 | **49.5** |
| Terminal-Bench 2.0 | (dato cortado) | - | - | - | - |

No se proporcionan resultados para benchmarks estándar como MMLU, HumanEval o GSM8K. Los datos mostrados se centran en tareas de codificación agéntica. Es importante notar que estos números provienen de la model card del repositorio y podrían no corresponder exactamente al modelo duplicado.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 35B parámetros en BF16, se necesitan aproximadamente 70 GB de VRAM para carga completa. Con cuantización INT8 (~35 GB) o INT4 (~18 GB) se puede reducir, aunque no se publican cuantizaciones oficiales.
- **GPU recomendadas**: para inferencia completa en BF16, se requieren GPUs profesionales como A100 80GB, H100 80GB o 2× RTX 4090 (24GB cada una) con tensor parallelism. Para cuantización INT4, una sola RTX 4090 o RTX 3090 podría ser suficiente.
- **Compatibilidad con consumer GPU**: posible con cuantización (p.ej. GGUF) en GPUs de 24 GB o menos, pero no hay versiones oficiales cuantizadas publicadas.
- **Opciones de despliegue**: compatible con Hugging Face Transformers, vLLM, SGLang y KTransformers según la model card. También podría usarse con llama.cpp si se convierte a GGUF.
- **Latencia y throughput**: no disponibles. Al ser MoE con 3B activos, el throughput esperado es superior al de un modelo denso de 35B, pero depende del hardware y la implementación.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | SWE-bench Verified |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (este) | 35B | 3B | 262K | Apache-2.0 | 73.4 |
| Qwen3.5-35B-A3B | 35B | 3B | 262K | Apache-2.0 | 70.0 |
| Qwen3.5-27B | 27B (denso) | 27B | 262K | Apache-2.0 | 75.0 |
| Gemma4-31B | 31B (denso) | 31B | 128K | Gemma license | 52.0 |

El modelo se posiciona como una mejora incremental sobre Qwen3.5-35B-A3B en tareas de codificación, con un rendimiento cercano al modelo denso Qwen3.5-27B pero con solo 3B activos, lo que lo hace más eficiente en inferencia.

## Limitaciones y advertencias

- **Origen del modelo**: este repositorio es un duplicado sin información verificada sobre el modelo original `diane613/Affine-5gedzafcvg-jesusss`. La model card describe Qwen3.6-35B-A3B, pero el tag de HuggingFace indica `qwen3_5_moe`, lo que sugiere una posible discrepancia. Los datos técnicos podrían no ser exactos.
- **Sesgos y alucinación**: no se ha publicado ninguna evaluación de sesgos ni de fiabilidad. Como todo modelo de lenguaje, puede generar contenido incorrecto o inventado, especialmente en dominios poco representados.
- **Riesgo de alucinación en código**: en tareas de codificación, puede producir código sintácticamente válido pero con errores lógicos o vulnerabilidades. Se recomienda revisión humana en entornos de producción.
- **Limitaciones de contexto**: aunque el contexto nativo es de 262K tokens, el rendimiento en contextos muy largos puede degradarse. La extensión a 1M tokens requiere técnicas adicionales no documentadas.
- **Restricciones de licencia**: aunque la licencia es Apache-2.0, el modelo base Qwen3.6 podría tener términos adicionales (p.ej. uso comercial permitido, pero con atribución). Se debe verificar la licencia original de Qwen.
- **Idiomas**: no se especifican idiomas soportados. Modelos Qwen suelen cubrir principalmente inglés y chino, con soporte limitado para otros idiomas.
- **Soporte de visión**: el codificador de visión está integrado, pero no se documentan sus capacidades exactas (resolución, tipos de imagen, etc.). Puede tener limitaciones en imágenes complejas o de baja calidad.

## Enlaces

- [Repositorio HuggingFace](https://huggingface.co/crazyape777/fk-diane613-affine-5gedzafcvg-jesusss)
- [Modelo original de diane613 (Affine-5CQLBK7Mmw1vsk7eQcBok9Qn44JNU5YVrfNmZpJHPxLV271B)](https://huggingface.co/diane613/Affine-5CQLBK7Mmw1vsk7eQcBok9Qn44JNU5YVrfNmZpJHPxLV271B)
- [Perfil de diane613 en HuggingFace](https://huggingface.co/diane613)
- [Blog de Qwen3.6-35B-A3B](https://qwen.ai/blog?id=qwen3.6-35b-a3b) (referencia de la model card)
- [Licencia Apache-2.0](https://www.apache.org/licenses/LICENSE-2.0)
