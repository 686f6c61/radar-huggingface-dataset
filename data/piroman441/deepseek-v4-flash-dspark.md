# piroman441/DeepSeek-V4-Flash-DSpark

## Resumen

DeepSeek-V4-Flash-DSpark es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) perteneciente a la familia DeepSeek-V4, desarrollado originalmente por DeepSeek y redistribuido aquí por el usuario piroman441 como un checkpoint "drop-in" con los pesos ya cuantizados en FP8. La variante `-DSpark` incorpora una cabeza de predicción multi-token (MTP) nativa llamada DeepSpec, que acelera la decodificación especulativa sin necesidad de un modelo draft externo. El modelo está diseñado para tareas de razonamiento, generación de código y matemáticas, con una ventana de contexto de hasta un millón de tokens.

Según la model card, el modelo tiene 284 mil millones de parámetros con 13 mil millones activos por token, aunque el recuento real de los safetensors asciende a 304.180.418.494 parámetros. Esta discrepancia puede deberse a la inclusión de la cabeza MTP o a diferencias en el conteo de pesos no activados. El checkpoint se distribuye bajo licencia MIT, pesa 166.9 GB en el repositorio y se sirve directamente con vLLM o el stack de inferencia de DeepSeek-V4.

La relevancia de este modelo radica en que ofrece un MoE de gran tamaño con contexto ultralargo y decodificación especulativa integrada, lo que lo hace atractivo para despliegues en entornos de producción que requieran alta velocidad de generación y manejo de documentos extensos. Al ser un reemplazo directo de los pesos originales, mantiene la misma arquitectura, formato y pipeline de inferencia que el modelo base de DeepSeek.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), familia DeepSeek-V4, variante Flash con cabeza MTP DeepSpec |
| Parametros totales | 304.180.418.494 (304B) según safetensors; la model card indica 284B |
| Parametros activos | 13B (según model card) |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | FP8 (mixed-precision), etiquetado también como 8-bit |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (48 shards + index), compatible con vLLM |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura MoE de la familia DeepSeek-V4, con 13 mil millones de parámetros activos por token y un total de 304 mil millones de parámetros. La variante `-DSpark` añade una cabeza de predicción multi-token (MTP) denominada DeepSpec, que permite decodificación especulativa nativa con 5 tokens de anticipación, lo que incrementa el throughput en inferencia sin necesidad de un modelo draft separado. Los pesos están cuantizados en FP8, lo que reduce el uso de memoria y acelera el cómputo en GPUs modernas.

No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens procesados ni las técnicas de alineación (RLHF, DPO, etc.). La model card incluye una evaluación de cumplimiento de seguridad sobre 1000 prompts que sugiere la presencia de algún tipo de alineación, pero no se especifica el método. El checkpoint es un reemplazo directo de los pesos originales de `deepseek-ai/DeepSeek-V4-Flash-DSpark`, por lo que hereda su configuración, tokenizador y pipeline de inferencia.

## Capacidades

- Generación de texto y razonamiento general, con un rendimiento notable en tareas de conocimiento y razonamiento (MMLU-Pro 0.6750).
- Razonamiento matemático avanzado: GSM8K 0.9257, lo que indica alta precisión en problemas aritméticos de varios pasos.
- Generación de código: HumanEval pass@1 de 0.8354 y MBPP pass@1 de 0.5160, demostrando competencia en programación funcional y resolución de problemas de código.
- Manejo de contexto ultralargo: ventana de 1M tokens, con resultados perfectos en pruebas needle-in-a-haystack hasta 32k tokens.
- Conversación multi-turno: puntuación de 9.98/10 en evaluaciones de 60 turnos con juez Gemini, lo que indica buena coherencia y seguimiento de instrucciones en diálogos largos.
- Decodificación especulativa integrada mediante la cabeza DeepSpec, alcanzando ~238 tokens por segundo en configuración de 2 GPUs.
- Capacidades de agente limitadas: en SWE-bench Lite con contexto de archivo oracle, resuelve 4 de 30 tareas (13.3%), lo que sugiere un rendimiento moderado en tareas de ingeniería de software autónoma.

## Casos de uso

- Asistente de programación en tiempo real: el modelo puede integrarse en editores o IDEs para autocompletado y generación de código, aprovechando su alto rendimiento en HumanEval y su velocidad de decodificación especulativa para respuestas casi instantáneas.
- Análisis y resumen de documentos extensos: con una ventana de 1M tokens, puede procesar libros técnicos, expedientes legales o historiales clínicos completos en una sola pasada, sin necesidad de fragmentar el texto.
- Atención al cliente automatizada con memoria de conversación larga: su capacidad multi-turno (9.98/10) y su contexto amplio permiten mantener conversaciones coherentes con usuarios a lo largo de múltiples interacciones, recordando detalles previos.
- Tutoría y resolución de problemas matemáticos: su puntuación de 0.9257 en GSM8K lo hace adecuado para plataformas educativas que necesitan explicar paso a paso la resolución de problemas aritméticos y algebraicos.
- Generación de documentación técnica y comentarios de código: puede producir explicaciones detalladas de fragmentos de código, documentación de APIs y guías de uso a partir de repositorios completos, gracias a su comprensión de código y lenguaje natural.
- Motor de razonamiento para agentes de análisis de datos: su capacidad para manejar contexto largo y razonar sobre tablas y datos estructurados permite construir pipelines de análisis que respondan preguntas complejas sobre grandes volúmenes de información.

## Benchmarks y rendimiento

La model card publica los siguientes resultados de evaluación:

| Benchmark | Valor |
|---|---|
| MMLU-Pro | 0.6750 |
| GSM8K | 0.9257 |
| HumanEval (pass@1) | 0.8354 |
| MBPP (pass@1) | 0.5160 |
| Multi-turn (juez Gemini, 1-10) | 9.98 / 10 |
| Needle-in-haystack @ 2k / 4k / 8k / 16k / 32k | 100% / 100% / 100% / 100% / 100% |
| SWE-bench Lite (oracle-file-context, single-shot, n=30) | Resolved 4/30 (13.3%) |
| Throughput decodificación especulativa | ~238 tok/s (TP=2, temp=0, 5-token speculation) |

En seguridad, el cumplimiento global es del 92.6% sobre 1000 prompts, con las tasas más bajas en PII (53.8%) y autolesión (84.3%), y superiores al 92% en las 12 categorías restantes.

No se han publicado comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- El modelo tiene 304B parámetros en FP8, lo que requiere aproximadamente 304 GB de VRAM solo para los pesos, más memoria para KV-cache y activaciones.
- La model card reporta throughput con TP=2 (tensor parallelism sobre 2 GPUs), y el foro de NVIDIA menciona despliegue sobre 2× DGX Spark (GB10) conectadas por InfiniBand/RoCE.
- No cabe en GPUs de consumo (RTX 4090, 3090, etc.) de forma individual; se necesitan al menos 4-8 GPUs de 80 GB (A100/H100) o configuraciones especializadas como DGX Spark.
- Opciones de despliegue: vLLM (soportado oficialmente), stack de inferencia de DeepSeek-V4, y el repositorio de Eugr para DSpark (mencionado en el foro de NVIDIA).
- La decodificación especulativa con DeepSpec requiere el backend `lucifer-cutlass` y configuración específica, según la model card.
- Para producción, se recomienda usar cuantización adicional (por ejemplo, FP8 ya incluido) y planificar la memoria de KV-cache para la ventana de 1M tokens, que puede ser muy exigente.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la información proporcionada. El modelo es un reemplazo directo de `deepseek-ai/DeepSeek-V4-Flash-DSpark`, por lo que su comparativa natural sería con el modelo base original, que comparte exactamente la misma arquitectura y rendimiento. Otras alternativas de la misma categoría (MoE de gran tamaño con contexto largo) incluirían modelos como Qwen2.5-Max o Mixtral 8x22B, pero no hay benchmarks disponibles en esta ficha para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- La discrepancia entre los 284B declarados en la model card y los 304B reales de los safetensors puede indicar pesos adicionales (posiblemente la cabeza MTP) o un error de documentación; conviene verificar antes de dimensionar infraestructura.
- El rendimiento en tareas de agente (SWE-bench Lite) es bajo (13.3% resuelto), por lo que no es adecuado para automatización de desarrollo de software sin supervisión humana.
- La seguridad en categorías de PII es deficiente (53.8% de cumplimiento), lo que implica riesgo de que el modelo revele datos personales si se le solicita; no debe usarse en aplicaciones que manejen información sensible sin filtros adicionales.
- No hay información sobre sesgos demográficos o lingüísticos; los idiomas soportados no están documentados.
- El modelo requiere hardware de múltiples GPUs de alta gama, lo que limita su uso a entornos con infraestructura dedicada.
- La licencia MIT permite uso comercial sin restricciones, pero el usuario es responsable del cumplimiento legal en aplicaciones finales.
- Al ser un checkpoint de un tercero (piroman441), no hay garantía de que los pesos sean idénticos al original; se recomienda verificar la integridad antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/piroman441/DeepSeek-V4-Flash-DSpark
- Modelo base original: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-DSpark
- Sitio oficial de DeepSeek: https://deepseek.com/en/index.html
- Foro de NVIDIA con instrucciones de despliegue: https://forums.developer.nvidia.com/t/instructions-for-running-deepseek-v4-flash-with-dspark-using-eugrs-repo/376220
- Repositorio de versión abliterada (no oficial): https://github.com/MiaAI-Lab/DeepSeek-v4-Flash-DSpark-Abliterated-Uncensored
