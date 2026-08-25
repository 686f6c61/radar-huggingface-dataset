# Deepdive404-3/Qwen3.8-2.4T-A95B

## Resumen

Qwen3.8-2.4T-A95B es el modelo de código abierto más grande y capaz de la familia Qwen, lanzado por Alibaba en agosto de 2026. Se trata de un modelo de lenguaje causal con arquitectura híbrida de Mixture of Experts (MoE) y atención lineal y por ventana, que combina 2,4 billones de parámetros totales con solo 95 mil millones activos por paso, lo que permite un rendimiento de nivel Qwen-Max en un paquete relativamente eficiente para inferencia. Está diseñado para sobresalir en tareas de codificación, trabajo profesional, investigación científica y tareas agénticas de horizonte largo, con una ventana de contexto nativa de 262 144 tokens ampliable hasta 1 010 000.

El modelo se publica en formato Transformers (safetensors) y es compatible con motores de inferencia como vLLM, SGLang y TokenSpeed. También existe una versión GGUF mantenida por Unsloth para despliegue local. Su licencia, denominada "qwen3.8-max", es de tipo "other" en HuggingFace, lo que implica restricciones de uso que deben revisarse antes de un despliegue comercial. La versión oficial con funciones adicionales (entrada de visión, modo sin razonamiento, herramientas integradas) se ofrece a través del servicio Qwen Cloud bajo el nombre Qwen3.8-Max.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido con Gated DeltaNet (atención lineal) y Gated Attention, 92 capas |
| Parametros totales | 2.446.182.725.504 (2,4 billones) |
| Parametros activos | 95 mil millones (10 expertos ruteados + 1 compartido) |
| Longitud de contexto | 262 144 nativa, extensible hasta 1 010 000 tokens |
| Tipos de cuantizacion | No especificados por el autor; disponibles GGUF de Unsloth (varias precisiones) y NVFP4 |
| Idiomas soportados | No disponible |
| Licencia | qwen3.8-max (otra, ver archivo LICENSE) |
| Formato de pesos | safetensors (Transformers), GGUF (Unsloth) |

## Arquitectura y entrenamiento

Qwen3.8-2.4T-A95B se basa en la arquitectura Qwen3.5, con una disposición de capas que combina bloques de atención lineal y atención tradicional. La configuración es de 92 capas organizadas en un patrón repetido de 23 bloques, cada uno compuesto por una secuencia de Gated DeltaNet (atención lineal) seguida de MoE, y luego una capa de Gated Attention (atención tradicional) seguida de otra MoE. La Gated DeltaNet usa 128 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128; la Gated Attention usa 64 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y RoPE de dimensión 64. El bloque MoE tiene 512 expertos, de los cuales 10 se activan por token más un experto compartido, con dimensión intermedia de 2048 por experto.

El entrenamiento incluye una fase de pre-entrenamiento y otra de post-entrenamiento, con MTP (Multi-Token Prediction) entrenado en múltiples pasos. No se han publicado detalles específicos sobre el número de tokens de entrenamiento ni la composición del dataset. La post-entrenamiento probablemente incluye técnicas de alineación, aunque no se documentan explícitamente (RLHF, DPO, etc.). El modelo admite control de esfuerzo de razonamiento mediante el parámetro `reasoning_effort` y conservación de contexto de razonamiento histórico con `preserve_thinking`.

## Capacidades

- Generación de texto y razonamiento avanzado: resolución de problemas complejos, matemáticas, análisis científico y profesional.
- Codificación de alto nivel: generación, revisión y depuración de código en múltiples lenguajes, con fuerte rendimiento en benchmarks de agentes de codificación (SWE-bench Pro, Terminal Bench).
- Tareas agénticas de largo horizonte: planificación autónoma, manejo de retroalimentación del entorno y ejecución de tareas de varios pasos hasta completarlas.
- Soporte de tool calling / function calling: integrable en pipelines de agentes que requieren invocación de herramientas externas.
- Multilingüe: aunque no se especifican idiomas, la familia Qwen suele soportar chino, inglés y otros idiomas principales; no confirmado para esta versión.
- Modo de razonamiento controlable: permite ajustar la profundidad de razonamiento (`reasoning_effort`) y conservar el contexto de razonamiento en conversaciones.
- Compatibilidad con entornos de inferencia estándar: vLLM, SGLang, TokenSpeed, llama.cpp (vía GGUF).

## Casos de uso

- Desarrollo de agentes de codificación autónomos: el modelo puede integrarse en entornos como Terminal Bench o SWE-bench Pro para resolver incidencias reales de repositorios, planificar cambios y ejecutar comandos, gracias a su capacidad de razonamiento de largo horizonte y manejo de retroalimentación del entorno.
- Asistente de investigación científica: con su capacidad de razonamiento profundo (GPQA Diamond 92,6) puede ayudar a analizar artículos, formular hipótesis y generar resúmenes de literatura compleja.
- Automatización de tareas profesionales de oficina: generación de informes, análisis de datos y redacción de documentos en entornos de consultoría o administración, aprovechando su contexto de 1M tokens para procesar documentos extensos.
- Soporte técnico y atención al cliente de alto nivel: despliegue de un asistente capaz de mantener conversaciones multi-turno con contexto largo y de llamar a herramientas de CRM o bases de conocimiento.
- Generación de código en producción: integración en pipelines de CI/CD para revisar pull requests, sugerir parches y ejecutar tests, usando su soporte de tool calling y su alto rendimiento en benchmarks de codificación.
- Investigación y prototipado de agentes multi-paso: dado su rendimiento en OSWorld (86.1) y PaperBench (93.0), es adecuado para experimentar con agentes que navegan entornos de escritorio o realizan tareas de investigación web.
- Despliegue en la nube con Qwen Cloud: para usuarios que no quieren gestionar infraestructura, la versión Qwen3.8-Max ofrece visión, contexto de 1M por defecto y herramientas integradas.

## Benchmarks y rendimiento

La model card publica una tabla de benchmarks comparando Qwen3.8-Max con otros modelos (Opus 4.8, Fable 5, GPT 5.6 Sol, Qwen3.7-Max). Los datos disponibles se muestran a continuación, aunque la tabla está incompleta en el material proporcionado. Además, la página de QwenCloud reporta resultados adicionales.

| Benchmark | Opus 4.8 | Fable 5 | GPT 5.6 Sol (max) | Qwen3.7-Max | Qwen3.8-Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 | 84.6 | 84.6 | 88.8 | 74.5 | 86.6 |
| SWE-bench Pro | 69.2 | 80.0 | 64.6 | 60.6 | (dato no disponible) |

Según QwenCloud (para Qwen3.8-2.4T-A95B):

- GPQA Diamond: 92.6
- PaperBench: 93.0
- OSWorld: 86.1
- BabyVision: 82.0
- Ranked 4th en CodeArena

No se han publicado resultados de benchmarks en la información disponible para otros tests como MMLU, GSM8K, HumanEval, etc.

## Requisitos de hardware

- VRAM estimada: dado que el modelo tiene 2,4 billones de parámetros totales, la carga en memoria es de aproximadamente 2,4 TB en FP16. Con cuantización de 4 bits se reduce a ~1,2 TB. Esto requiere múltiples GPUs de alto rendimiento (p. ej., 8 × H100 de 80 GB o 16 × A100 de 80 GB) para inferencia en producción.
- GPU recomendadas: H100, H200, A100 (80 GB) o GPUs de próxima generación con gran memoria. No es viable en una GPU de consumo.
- Despliegue: compatible con vLLM, SGLang, TokenSpeed, y llama.cpp (vía GGUF). Se puede ejecutar en clústeres multi-GPU o en la nube (Qwen Cloud).
- Latencia y throughput: no hay datos publicados. La inferencia con 95B activos por token permite un throughput razonable, pero depende del hardware y de la configuración de cuantización.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de código abierto de la misma escala (por ejemplo, otros modelos MoE de ~2T parámetros). La tabla de benchmarks de la model card lo compara con modelos propietarios (Opus 4.8, Fable 5, GPT 5.6, Qwen3.7-Max), pero no se detallan sus parámetros ni licencias. Por tanto, la comparativa con modelos de código abierto similares se considera no disponible.

## Limitaciones y advertencias

- Sesgos y alucinaciones: como modelo de lenguaje de gran escala, puede generar información falsa o sesgada. No se han publicado evaluaciones específicas de sesgo para esta versión.
- Limitaciones de idioma: no se especifican los idiomas soportados, por lo que el rendimiento en lenguas distintas al inglés o chino no está garantizado.
- Restricciones de licencia: la licencia "qwen3.8-max" no es una licencia de código abierto estándar (por ejemplo, Apache 2.0 o MIT). Se debe revisar el archivo LICENSE para conocer restricciones de uso comercial, modificación y redistribución.
- Requisitos de hardware: la inferencia local es costosa y requiere infraestructura de múltiples GPUs; no es adecuado para entornos con recursos limitados.
- Contexto extenso: aunque se admite hasta 1M tokens, el rendimiento en contextos muy largos puede degradarse; se recomienda probar con casos reales.
- Dependencia de herramientas externas: el soporte de tool calling y agentes requiere integración adicional y puede ser inestable en entornos complejos.

## Enlaces

- HuggingFace (repo original): https://huggingface.co/Qwen/Qwen3.8-2.4T-A95B
- HuggingFace (mirror Deepdive404-3): https://huggingface.co/Deepdive404-3/Qwen3.8-2.4T-A95B
- Versión GGUF de Unsloth: https://huggingface.co/unsloth/Qwen3.8-2.4T-A95B-GGUF
- Página de QwenCloud para el modelo: https://www.qwencloud.com/models/qwen3.8-2.4t-a95b
- Documentación de vLLM Ascend para el modelo: https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/Qwen3.8-2.4T-A95B.html
- Blog de Qwen (entrada Qwen3.8-Max): https://qwen.ai/blog?id=qwen3.8
- Documentación de Unsloth para Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
