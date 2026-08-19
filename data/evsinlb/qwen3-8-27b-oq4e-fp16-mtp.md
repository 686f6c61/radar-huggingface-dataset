# evsinlb/Qwen3.8-27B-oQ4e-fp16-mtp

## Resumen

Qwen3.8-27B-oQ4e-fp16-mtp es una cuantización 4-bit en formato MLX del modelo Qwen3.8-27B de Alibaba, publicada por el usuario evsinlb. El modelo base es un LLM denso multimodal nativo de 27 000 millones de parámetros con arquitectura híbrida (Gated DeltaNet + Gated Attention), visión integrada, ventana de contexto nativa de 262 144 tokens y un cabezal de predicción multi-token (MTP). Esta variante concreta está optimizada para Apple Silicon de generación M1/M2, donde los pesos no cuantizados en fp16 aceleran el prefill aproximadamente un 20 % frente a bf16, y es elegible para el procesamiento de prompts vía ANE en oMLX 0.6.1, con mejoras medidas de hasta +21 % en prefill en frío sobre un M2 Ultra.

La cuantización emplea el esquema oQe (enhanced quantization) con calibración imatrix de 1024 muestras, mantiene los pesos de MTP y los componentes de visión. Es una de las cuatro variantes de la familia (4-bit fp16, 4-bit bf16, 6-bit y 8-bit) y se presenta como una opción agresiva en cuanto a compresión, con una calidad esperada inferior a la de sus hermanos de mayor bit para cadenas de razonamiento largas. Su uso recomendado por el autor es como nivel instruct rápido para tareas dominadas por prefill en frío (resúmenes, extracción, Q&A de documentos largos), reservando las versiones de 8 bits para tareas de razonamiento exigente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Gated DeltaNet + Gated Attention, con visión nativa y cabezal MTP |
| Parametros totales | 27B (modelo base); 4 926 789 872 elementos en safetensors cuantizados |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativos (recomendado 131 072 en máquinas de 64 GB) |
| Tipos de cuantizacion | 4-bit (efectivo ~4.9 bpw, grupo 64) con pesos no cuantizados en fp16 |
| Idiomas soportados | No disponible (el modelo base Qwen3.8 soporta múltiples idiomas, pero no se especifica en esta variante) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un LLM denso de 27 000 millones de parámetros con arquitectura híbrida: 48 de sus 64 capas utilizan atención lineal (Gated DeltaNet) y el resto atención completa (Gated Attention). Incluye un torre de visión nativa, lo que le permite procesar imágenes sin módulos separados, y un cabezal de predicción multi-token (MTP) que actúa como borrador para decodificación especulativa. La ventana de contexto nativa es de 262 144 tokens, extensible hasta 1M según la documentación de vLLM.

Esta variante cuantizada se genera con oMLX 0.6.1 mediante cuantización de precisión mixta oQe, calibrada con imatrix sobre 1024 muestras compartidas con el resto de la familia. Los pesos no cuantizados se mantienen en fp16 para acelerar el prefill en Apple Silicon M1/M2. Se conservan los tensores `mtp.*` y la configuración asociada, por lo que la predicción multi-token sigue operativa tras la cuantización. No se proporcionan detalles sobre el entrenamiento original del modelo base (datos, tokens, fases de RLHF/DPO), más allá de que es un modelo instruido de la familia Qwen.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo *thinking* activable mediante `enable_thinking` y `preserve_thinking` en `chat_template_kwargs`.
- Control del esfuerzo de razonamiento (`reasoning_effort`: `xhigh`, `medium`, `low`), con reducción del volumen de pensamiento ~25 % en `medium` sin pérdida en tareas agénticas.
- Visión nativa: procesamiento de imágenes integrado en la arquitectura, sin adaptadores externos.
- Soporte de tool calling y flujos agénticos multi-turno, validado en una batería de 8 turnos con 3/3 escenarios correctos y 0 paradas.
- Predicción multi-token (MTP) preservada tras la cuantización, útil para decodificación especulativa.
- Multilingüe: no se especifican idiomas concretos para esta variante, pero el modelo base Qwen3.8 es multilingüe.
- Compatibilidad con oMLX para prefill híbrido ANE/GPU en Apple Silicon.

## Casos de uso

- Resumen y extracción de documentos largos: gracias a su ventana de 262K tokens y su prefill rápido en frío, puede procesar informes extensos de una sola pasada. Adecuado para batch de resúmenes donde el prefill domina el tiempo.
- Q&A de una sola consulta sobre documentos extensos: el usuario proporciona un documento completo y una pregunta; el modelo genera la respuesta sin necesidad de múltiples turnos, aprovechando la baja sensibilidad a la cuantización en tareas de extracción.
- Atención al cliente automatizada: soporta conversaciones multi-turno con contexto largo y conserva las trazas de razonamiento a través del historial (`preserve_thinking`), lo que permite respuestas coherentes en interacciones prolongadas.
- Generación de código asistida: el modelo base destaca en tareas de programación; esta variante cuantizada puede usarse en entornos de desarrollo local en Mac con Apple Silicon, aunque se recomienda la versión de 8 bits para tareas de razonamiento complejo.
- Automatización de oficina: procesamiento de documentos, generación de correos, resúmenes de reuniones y extracción de datos estructurados, con la ventaja de ejecutarse en hardware local sin conexión.
- Agentes autónomos con tool calling: integrable en pipelines agénticos donde se requiera razonamiento multi-paso y llamadas a herramientas, siempre que la carga de trabajo no exija cadenas de razonamiento muy largas (donde la cuantización 4-bit degrada más).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card del autor incluye mediciones de rendimiento de prefill en frío en un M2 Ultra Mac Studio (128 GB) con oMLX 0.6.1:

| Configuracion | Prefill (tok/s) |
|---|---|
| GPU solo (ANE desactivado) | ~222 |
| ANE activado (doble ANE + GPU) | ~269 (+21 %) |
| Hermano de 8 bits, GPU solo, misma máquina | ~207† |

†Medido a ~88K tokens, ajustado a ~78K para comparación. El tuner integrado de oMLX 0.6.2 alcanzó +37,6 % (444,9 tok/s) en una forma de prompt más corta. No hay datos de calidad de generación (perplejidad, exactitud en tareas) para esta cuantización.

## Requisitos de hardware

- VRAM estimada: ~16,7 GiB para los pesos cuantizados, más overhead de activaciones y KV cache. El coste adicional del modo ANE es ~4,15 GB residentes.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4, M5). En M1/M2 se prefiere esta variante fp16; en M3+ se recomienda el hermano bf16. No se menciona soporte CUDA.
- En máquinas de 64 GB: ventana de contexto recomendada de 131 072 tokens; ventanas superiores pueden provocar fallos del servidor oMLX (se observó un crash a 160K).
- En máquinas de 128 GB: se validó la ventana completa de 262 144 tokens con el hermano de 8 bits.
- Despliegue: oMLX (biblioteca MLX de Apple), con soporte experimental de prefill ANE/GPU. No se mencionan vLLM, llama.cpp u Ollama para esta variante específica.
- Latencia: no se proporcionan valores de tokens/s de generación, solo de prefill.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-oQ4e-fp16-mtp (este) | 27B | 262K | 4-bit fp16 | Apache-2.0 | Optimizado para M1/M2, ANE elegible |
| Qwen3.8-27B-oQ4e-mtp | 27B | 262K | 4-bit bf16 | Apache-2.0 | Recomendado para M3+ |
| Qwen3.8-27B-oQ8e-fp16-mtp | 27B | 262K | 8-bit fp16 | Apache-2.0 | Mayor fidelidad, ~27,5 GiB |
| Qwen3.8-27B (base) | 27B | 262K | Sin cuantizar | Apache-2.0 | Modelo original de Alibaba |

La comparativa se limita a las variantes del mismo autor porque no se dispone de datos de otros modelos de tamaño similar en la información proporcionada. El modelo base Qwen3.8-27B se posiciona como un modelo denso multimodal de alto rendimiento para hardware local, según la documentación oficial.

## Limitaciones y advertencias

- Cuantización 4-bit agresiva: la degradación de calidad es mayor en cadenas de razonamiento largas, a pesar de la calibración imatrix. Se recomienda la variante de 8 bits para tareas que requieran razonamiento profundo.
- Riesgo de alucinación: inherente a los modelos generativos; la cuantización puede aumentar la probabilidad de respuestas inexactas, especialmente en tareas de extracción de hechos.
- Límites de contexto en hardware modesto: en máquinas de 64 GB, la ventana práctica es de 131K tokens; solicitudes mayores pueden provocar un fallo del servidor en lugar de un rechazo elegante. Es imprescindible limitar la ventana desde el cliente.
- Coste de memoria del modo ANE: el prefill ANE consume ~4,15 GB adicionales de memoria residente y añade ~40 s de compilación del programa en cada carga del modelo. En máquinas de 64 GB se recomienda desactivarlo.
- Compatibilidad de hardware: esta variante fp16 está pensada para M1/M2; en M3+ se prefiere la versión bf16. No se garantiza funcionamiento en GPUs NVIDIA o AMD.
- Sin datos de benchmarks de calidad: no se han publicado resultados de tareas estándar para esta cuantización, por lo que la evaluación de su rendimiento real debe hacerse con casos de uso propios.
- Licencia Apache-2.0: permite uso comercial, pero se debe verificar el cumplimiento de las condiciones de atribución y redistribución.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/evsinlb/Qwen3.8-27B-oQ4e-fp16-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- GitHub del modelo base: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Documentación de vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Página de Cloudflare AI (modelo base): https://developers.cloudflare.com/workers-ai/models/qwen3.8-27b/
- Repositorio oMLX (oQ): https://github.com/jundot/omlx
