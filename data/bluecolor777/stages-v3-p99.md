# bluecolor777/stages-v3-p99

## Resumen

El modelo `bluecolor777/stages-v3-p99` es un checkpoint del modelo Qwen3.6-35B-A3B, la primera variante open-weight de la serie Qwen3.6 desarrollada por Alibaba Qwen. Se trata de un modelo de lenguaje causal con codificador de visión (image-text-to-text), diseñado para tareas de razonamiento, generación de código y capacidades agénticas. El autor del repositorio, `bluecolor777`, ha subido los pesos en formato Transformers, aunque no se indica ninguna modificación adicional respecto al modelo base.

La arquitectura combina atención lineal (Gated DeltaNet) con atención clásica (Gated Attention) en un diseño Mixture of Experts (MoE) con 35 000 millones de parámetros totales y 3 000 millones activos por token. El contexto nativo es de 262 144 tokens, extensible hasta aproximadamente 1 010 000. El modelo está optimizado para flujos de trabajo de codificación agéntica y razonamiento a nivel de repositorio, con soporte para preservación del contexto de razonamiento en mensajes históricos. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido con Gated DeltaNet (atención lineal) y Gated Attention, con vision encoder |
| Parametros totales | 35 951 822 704 (≈35,95B) |
| Parametros activos | 3B (8 expertos enrutados + 1 compartido de 256) |
| Longitud de contexto | 262 144 tokens nativo, extensible hasta ~1 010 000 |
| Tipos de cuantizacion | no disponible (pesos en BF16 según repo) |
| Idiomas soportados | no disponible (Qwen suele ser multilingüe, pero no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo sigue el diseño de Qwen3.6-35B-A3B: un transformer causal con 40 capas organizadas en un patrón de 10 bloques, donde cada bloque contiene 3 sub-bloques de Gated DeltaNet seguidos de MoE, y 1 sub-bloque de Gated Attention seguido de MoE. La atención lineal (Gated DeltaNet) usa 32 cabezas para V y 16 para QK con dimensión de cabeza 128, mientras que la atención clásica (Gated Attention) usa 16 cabezas Q y 2 KV con dimensión 256 y RoPE de 64 dimensiones. El MoE tiene 256 expertos, de los cuales se activan 8 enrutados más 1 compartido, con dimensión intermedia de 512.

El modelo fue entrenado en dos fases: pre-entrenamiento y post-entrenamiento, con MTP (multi-token prediction) entrenado en múltiples pasos. Según la model card, el post-entrenamiento prioriza estabilidad y utilidad real, con mejoras en flujos de codificación agéntica y razonamiento a nivel de repositorio. No se detallan los datos de entrenamiento (número de tokens, composición del dataset) ni si se usó RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento complejo, incluyendo razonamiento multi-paso.
- Codificación agéntica: manejo de flujos de trabajo frontend y razonamiento a nivel de repositorio.
- Preservación del contexto de razonamiento en mensajes históricos para desarrollo iterativo.
- Capacidades multimodales: acepta entradas de imagen y texto (image-text-to-text).
- Soporte de tool calling y function calling (implícito en el pipeline conversacional y agéntico).
- Soporte de agentes y multi-step reasoning, evidenciado por resultados en SWE-bench.
- Capacidades multilingües: no especificadas explícitamente, pero típicas en la familia Qwen.

## Casos de uso

- Asistente de programación en IDE: el modelo puede integrarse en editores como VS Code o JetBrains para sugerencias de código, refactorización y explicaciones, gracias a su ventana de contexto de 262K tokens que permite cargar archivos completos o repositorios pequeños.
- Automatización de tareas de desarrollo (agentes de código): con soporte de tool calling y razonamiento a nivel de repositorio, puede ejecutar comandos, modificar múltiples archivos y resolver issues de GitHub de forma autónoma (evidenciado por SWE-bench Verified 73.4).
- Generación de código en producción: puede integrarse en pipelines de CI/CD para generar tests, parches o documentación a partir de diffs, usando su capacidad de razonamiento agéntico.
- Análisis y resumen de repositorios: su contexto largo permite procesar el contenido completo de un repositorio mediano y generar resúmenes, diagramas o documentación técnica.
- Asistente de soporte técnico multimodal: al aceptar imágenes, puede analizar capturas de pantalla de errores o diagramas de arquitectura y proporcionar soluciones contextuales.
- Chat conversacional con memoria extendida: para aplicaciones de atención al cliente o asistentes personales que requieren mantener conversaciones muy largas (hasta 1M tokens) sin perder el hilo.
- Investigación y análisis de documentos largos: procesamiento de papers, informes o libros completos con razonamiento profundo y citas de secciones específicas.

## Benchmarks y rendimiento

La model card incluye resultados parciales de benchmarks de codificación agéntica. Los datos disponibles se muestran a continuación (valores en porcentaje):

| Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B |
|---|---|---|---|---|---|
| SWE-bench Verified | 75.0 | 52.0 | 70.0 | 17.4 | 73.4 |
| SWE-bench Multilingual | 69.3 | 51.7 | 60.3 | 17.3 | 67.2 |
| SWE-bench Pro | 51.2 | 35.7 | 44.6 | 13.8 | 49.5 |
| Terminal-Bench 2.0 | (dato no disponible en la información proporcionada) | | | | |

No se han publicado resultados de benchmarks generales de lenguaje (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 35B parámetros en BF16 se requieren aproximadamente 72 GB de VRAM. Con cuantización a 4 bits (no disponible oficialmente, pero posible con herramientas como llama.cpp o GPTQ), se reduciría a unos 18-20 GB.
- GPU recomendadas: para inferencia sin cuantizar, A100 80GB o H100; con cuantización 4-bit, una RTX 4090 (24 GB) o RTX 3090 (24 GB) podrían ser suficientes para contexto moderado.
- No cabe en GPUs de consumo sin cuantización; con cuantización agresiva (Q4) podría ejecutarse en una sola GPU de 24 GB, aunque con contexto limitado.
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, SGLang, KTransformers y otros frameworks que soporten MoE híbrido con atención lineal (según la model card).
- Latencia y throughput: no disponibles. Al ser un MoE con 3B activos, el throughput esperado es significativamente mayor que un denso de 35B, pero depende del hardware y del backend.

## Comparativa con modelos similares

Comparación basada en los benchmarks de la model card (SWE-bench):

| Modelo | Parámetros totales | Parámetros activos | Contexto | SWE-bench Verified | Licencia |
|---|---|---|---|---|---|
| Qwen3.6-35BA3B (este) | 35B | 3B | 262K (ext. 1M) | 73.4 | Apache 2.0 |
| Qwen3.5-35BA3B | 35B | 3B | no disponible | 70.0 | Apache 2.0 |
| Qwen3.5-27B | 27B | 27B (denso) | no disponible | 75.0 | Apache 2.0 |
| Gemma4-31B | 31B | 31B (denso) | no disponible | 52.0 | Gemma license |

El modelo supera a su predecesor directo (Qwen3.5-35BA3B) en SWE-bench Verified y Multilingual, aunque queda ligeramente por debajo del denso Qwen3.5-27B en Verified. La ventaja del MoE es el menor coste de inferencia.

## Limitaciones y advertencias

- El repositorio `bluecolor777/stages-v3-p99` tiene 0 descargas y 0 likes; se desconoce si los pesos han sido verificados o si difieren del modelo oficial de Qwen. Se recomienda descargar desde el repositorio oficial de Qwen si se requiere trazabilidad.
- No se han publicado resultados de benchmarks de lenguaje general (MMLU, HumanEval, etc.) en la información disponible.
- Los idiomas soportados no están especificados; aunque Qwen suele ser multilingüe, no hay garantía de cobertura uniforme.
- El modelo puede alucinar en tareas de razonamiento complejo o cuando el contexto es ambiguo, especialmente en dominios fuera de código.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar que los pesos de este repositorio concreto cumplen los términos de la licencia original de Qwen.
- El contexto de 1M tokens es una extensión; el rendimiento en longitudes extremas puede degradarse y requiere hardware específico.
- No se especifican requisitos de VRAM ni latencia; las estimaciones proporcionadas son orientativas y no oficiales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bluecolor777/stages-v3-p99
- Blog de Qwen sobre Qwen3.6-35B-A3B: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Repositorio relacionado del mismo autor: https://huggingface.co/bluecolor777/stages-v3
- Repositorio relacionado del mismo autor: https://huggingface.co/bluecolor777/v3
