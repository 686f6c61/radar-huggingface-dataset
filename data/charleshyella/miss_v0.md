# charleshyella/MISS_V0

## Resumen

MISS_V0 es un modelo de lenguaje de gran escala desarrollado por charleshyella, que corresponde a una versión de GLM-5.2, el último modelo insignia de la serie GLM de Z.ai. Se trata de un modelo de texto con arquitectura MoE (Mixture of Experts) y atención dispersa, diseñado específicamente para tareas de horizonte largo (long-horizon tasks) con una ventana de contexto sólida de 1 millón de tokens. Con 753.329.940.480 parámetros totales, es uno de los modelos más grandes disponibles bajo licencia MIT, sin restricciones regionales.

El modelo incorpora innovaciones técnicas como IndexShare, que reutiliza el mismo indexador en cada cuatro capas de atención dispersa, reduciendo los FLOPs por token en 2,9× a 1M de contexto, y una capa MTP (Multi-Token Prediction) mejorada para decodificación especulativa que aumenta la longitud de aceptación hasta un 20%. Está orientado a razonamiento avanzado, codificación compleja y tareas agénticas, con múltiples niveles de esfuerzo de pensamiento para equilibrar rendimiento y latencia. Su relevancia actual radica en ser uno de los primeros modelos abiertos que ofrece capacidades de nivel frontera en una ventana de contexto de 1M tokens, compitiendo directamente con alternativas propietarias como Claude Opus 4.8 o GPT-5.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con atención dispersa (glm_moe_dsa) |
| Parametros totales | 753.329.940.480 |
| Parametros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se basa en un transformer con mezcla de expertos (MoE) y atención dispersa. La innovación principal es IndexShare, descrita en el paper arXiv:2603.12201, que reutiliza el mismo indexador en cada cuatro capas de atención dispersa, reduciendo los FLOPs por token en 2,9× a una longitud de contexto de 1M tokens. Además, la capa MTP (Multi-Token Prediction) se ha mejorado para decodificación especulativa, logrando un aumento de hasta el 20% en la longitud de aceptación de tokens predichos.

No se han proporcionado detalles sobre la composición del dataset de entrenamiento, el número total de tokens procesados ni el uso de técnicas como RLHF o DPO. La información disponible solo menciona las mejoras arquitectónicas y los resultados de evaluación. El modelo está entrenado para soportar razonamiento de múltiples pasos y tareas agénticas con herramientas, lo que sugiere un entrenamiento específico en instrucciones y uso de herramientas, aunque no se documenta el proceso.

## Capacidades

- Generación de texto avanzada con razonamiento matemático y lógico de alto nivel (HLE 40.5, AIME 2026 99.2, GPQA-Diamond 91.2).
- Codificación compleja: resolución de problemas de repositorios completos (SWE-bench Pro 62.1, NL2Repo 48.9, DeepSWE 46.2) y generación de código a nivel de programa (ProgramBench 63.7).
- Tareas agénticas: uso de herramientas MCP (MCP-Atlas 76.8) y ejecución de tareas en terminal (Terminal Bench 2.1 con 81.0).
- Soporte de tool calling y function calling, evidenciado en benchmarks con herramientas (HLE w/ Tools 54.7).
- Capacidades multilingües en inglés y chino.
- Modos de esfuerzo de pensamiento flexible (thinking effort levels) para equilibrar rendimiento y latencia.
- Ventana de contexto de 1M tokens que permite procesar documentos extensos y mantener conversaciones de largo alcance.

## Casos de uso

- Desarrollo de software a gran escala: el modelo puede abordar issues de repositorios completos, generar código para nuevas funcionalidades y refactorizar proyectos existentes. Su alto rendimiento en SWE-bench Pro y NL2Repo lo hace adecuado para integrarse en pipelines de CI/CD como asistente de codificación autónoma.
- Agentes autónomos para operaciones de terminal: con Terminal Bench 2.1 de 81.0, puede ejecutar comandos, gestionar archivos y realizar tareas administrativas en entornos Linux, útil para automatización de infraestructura y DevOps.
- Razonamiento matemático y científico: con AIME 2026 de 99.2 y GPQA-Diamond de 91.2, es adecuado para resolver problemas avanzados de matemáticas, física y ciencias, sirviendo como herramienta de apoyo en investigación y educación superior.
- Asistencia en investigación con contexto largo: su ventana de 1M tokens permite procesar papers completos, libros técnicos o documentación extensa, extrayendo información y generando resúmenes o respuestas basadas en el contenido íntegro.
- Chatbots y asistentes conversacionales multilingües: soporta inglés y chino, y su capacidad de mantener contexto largo permite conversaciones prolongadas con memoria de todo el historial, ideal para atención al cliente o asistentes personales.
- Automatización de tareas de programación con herramientas: al soportar tool calling y MCP, puede integrarse en entornos de desarrollo para ejecutar tests, gestionar repositorios, interactuar con APIs y realizar tareas de integración continua de forma autónoma.

## Benchmarks y rendimiento

La model card proporciona una tabla comparativa con varios modelos de referencia. Se presentan los resultados más relevantes:

| Benchmark | GLM-5.2 (MISS_V0) | GLM-5.1 | Qwen3.7-Max | DeepSeek-V4-Pro | Claude Opus 4.8 | GPT-5.5 | Gemini 3.1 Pro |
|---|---|---|---|---|---|---|---|
| HLE | 40.5 | 31 | 41.4 | 37.7 | 49.8* | 41.4* | 45 |
| HLE (w/ Tools) | 54.7 | 52.3 | 53.5 | 48.2 | 57.9* | 52.2* | 51.4* |
| AIME 2026 | 99.2 | 95.3 | 97 | 94.6 | 95.7 | 98.3 | 98.2 |
| GPQA-Diamond | 91.2 | 86.2 | 90 | 90.1 | 93.6 | 93.6 | 94.3 |
| SWE-bench Pro | 62.1 | 58.4 | 60.6 | 55.4 | 69.2 | 58.6 | 54.2 |
| NL2Repo | 48.9 | 42.7 | 47.2 | 35.5 | 69.7 | 50.7 | 33.4 |
| DeepSWE | 46.2 | 18 | 18 | 8 | 58 | 70 | 10 |
| Terminal Bench 2.1 | 81.0 | 63.5 | 75 | 64 | 85 | 84 | 74 |
| MCP-Atlas (Public Set) | 76.8 | 71.8 | 76.4 | 73.6 | 77.8 | 75.3 | 69.2 |

Nota: los resultados marcados con * provienen del conjunto completo de HLE, mientras que el resto son del subconjunto de solo texto. Las condiciones de evaluación se detallan en la model card original.

## Requisitos de hardware

- El modelo tiene 753 mil millones de parámetros, lo que requiere una infraestructura de múltiples GPUs de alta gama. No se dispone de estimaciones de VRAM específicas, pero un modelo de este tamaño necesita al menos 1,5 TB de memoria en FP16 (el repositorio pesa 1506,7 GB).
- GPUs recomendadas: clústeres con H100 o A100 de 80 GB, o GPUs de última generación con memoria HBM. No cabe en GPUs de consumo (RTX 4090 o inferiores) sin cuantización extrema, y aun así sería inviable por el tamaño.
- Opciones de despliegue: SGLang (v0.5.13.post1+), vLLM (v0.23.0+), Transformers (v0.5.12+), KTransformers (v0.5.12+), Unsloth (v0.1.47-beta+). También soporta plataformas Ascend NPU mediante vLLM-Ascend, xLLM y SGLang.
- Latencia y throughput: no se han publicado cifras concretas. Dado el tamaño y la optimización de FLOPs, se espera que el rendimiento sea competitivo para su clase, pero requiere hardware especializado.

## Comparativa con modelos similares

El modelo compite directamente con otros modelos de nivel frontera, tanto abiertos como propietarios. La siguiente tabla compara características clave basadas en la información disponible:

| Modelo | Parametros | Contexto | Licencia | HLE | SWE-bench Pro |
|---|---|---|---|---|---|
| MISS_V0 (GLM-5.2) | 753B (total) | 1M | MIT | 40.5 | 62.1 |
| GLM-5.1 | no disponible | no disponible | no disponible | 31 | 58.4 |
| Qwen3.7-Max | no disponible | no disponible | no disponible | 41.4 | 60.6 |
| DeepSeek-V4-Pro | no disponible | no disponible | no disponible | 37.7 | 55.4 |
| Claude Opus 4.8 | no disponible | no disponible | propietaria | 49.8* | 69.2 |
| GPT-5.5 | no disponible | no disponible | propietaria | 41.4* | 58.6 |

No se dispone de datos de parámetros ni contexto para los modelos comparados, por lo que la comparación se limita a los benchmarks publicados. En rendimiento, MISS_V0 se sitúa en la media-alta del grupo, destacando en tareas de codificación (DeepSWE 46.2) y terminal (81.0), aunque por detrás de Claude Opus 4.8 en varios benchmarks.

## Limitaciones y advertencias

- No se han documentado sesgos específicos en la model card. Al ser un modelo entrenado principalmente en inglés y chino, puede presentar sesgos culturales o lingüísticos de esos dominios.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir información falsa o inventada, especialmente en tareas de razonamiento abierto. Se recomienda verificar las respuestas en aplicaciones críticas.
- Limitaciones de idioma: solo soporta inglés y chino; no se garantiza un rendimiento adecuado en otros idiomas.
- Tamaño e infraestructura: con 753B parámetros, el despliegue local requiere clústeres de GPUs de alta gama y es inviable en hardware de consumo. El coste de inferencia es elevado.
- La licencia MIT permite uso comercial sin restricciones regionales, pero el usuario debe asegurarse de cumplir con las leyes de exportación y regulaciones locales aplicables.
- No se han publicado detalles sobre el dataset de entrenamiento, por lo que no es posible evaluar la procedencia de los datos ni posibles problemas de derechos de autor.
- El modelo está en fase de investigación (versión V0) y puede tener errores o comportamientos inesperados en producción.

## Enlaces

- HuggingFace: https://huggingface.co/charleshyella/MISS_V0
- Paper técnico GLM-5: https://arxiv.org/abs/2602.15763
- Paper IndexShare: https://arxiv.org/abs/2603.12201
- Blog GLM-5.2: https://z.ai/blog/glm-5.2
- Repositorio GitHub: https://github.com/zai-org/GLM-5
- Documentación de despliegue: https://cookbook.sglang.io/autoregressive/GLM/GLM-5.2
- Recetas vLLM: https://recipes.vllm.ai/zai-org/GLM-5.2
- Tutorial KTransformers: https://github.com/kvcache-ai/ktransformers/blob/main/doc/en/kt-kernel/GLM-5.2-Tutorial.md
- Guía Unsloth: https://unsloth.ai/docs/models/glm-5.2
