# jajmangold/Qwen3.8-27B-MTP-TQ3_4S

## Resumen

El modelo `Qwen3.8-27B-MTP-TQ3_4S` es una cuantización GGUF en formato TurboQuant `TQ3_4S` del modelo base `Qwen/Qwen3.8-27B`, publicada por el usuario jajmangold. Se trata de un modelo de lenguaje de 27 320 millones de parámetros con arquitectura híbrida (Gated DeltaNet + Gated Attention) y 64 capas, diseñado para ejecución eficiente en hardware local mediante el runtime fork `llama.cpp-tq3` mantenido por Y Tan. Su característica más destacada es la inclusión de un bloque MTP (Multi-Token Prediction) como cabeza draft para decodificación especulativa, lo que permite acelerar la generación de texto sin sacrificar calidad.

La relevancia de este modelo radica en su formato de cuantización de 3,5 bits (Walsh-Hadamard transform) que reduce el peso a 13,68 GB, haciéndolo viable en GPUs de consumo con 16 GB de VRAM. Además, soporta una ventana de contexto nativa de 262 144 tokens, lo que lo hace adecuado para tareas de procesamiento de documentos largos y conversaciones multi-turno. Está licenciado bajo Apache 2.0 (según el modelo base) y requiere un runtime específico que no es compatible con las builds estándar de llama.cpp.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen35 (híbrido Gated DeltaNet + Gated Attention), 64 capas, 1 bloque MTP draft |
| Parametros totales | 27 320 697 856 (~27,3 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 262 144 tokens nativos |
| Tipos de cuantizacion | TQ3_4S (formato de 3,5 bits con transformada Walsh-Hadamard) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 (modelo base) + términos del runtime TurboQuant |
| Formato de pesos | GGUF (archivo único de 13,68 GB / 12,74 GiB) |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint `Qwen/Qwen3.8-27B`, que emplea una arquitectura híbrida denominada `qwen35` con 64 capas que combinan Gated DeltaNet (una variante de atención lineal con compuertas) y Gated Attention. Esta mezcla busca equilibrar eficiencia computacional y capacidad de modelado de dependencias de largo alcance. El GGUF incluye además un bloque MTP (Multi-Token Prediction) entrenado como cabeza draft, que permite la decodificación especulativa: el modelo predice varios tokens por paso, y el runtime valida las predicciones para acelerar la generación.

El proceso de cuantización fue realizado con la herramienta TurboQuant, que produce el formato `TQ3_4S` de 3,5 bits mediante una transformada Walsh-Hadamard aplicada a los tensores. Este formato está diseñado para minimizar la pérdida de precisión en comparación con cuantizaciones de 4 bits tradicionales, aunque no se han publicado métricas de calidad específicas para esta versión. El modelo requiere el runtime fork `llama.cpp-tq3` para cargar los tensores `TQ3_4S`; las builds estándar de llama.cpp no son compatibles.

## Capacidades

- Generación de texto en inglés con estilo conversacional y soporte para tareas de razonamiento.
- Decodificación especulativa nativa mediante el bloque MTP, configurable con parámetros como `--spec-draft-n-max` (óptimo en 2 para esta cabeza).
- Modo de pensamiento (thinking mode) activable con `--reasoning-format deepseek --reasoning-budget N`, que permite generar cadenas de razonamiento internas antes de la respuesta final.
- Ventana de contexto amplia de 262 144 tokens, adecuada para procesar documentos extensos o mantener conversaciones de muchos turnos.
- Compatible con el formato GGUF y el ecosistema llama.cpp (a través del fork específico), incluyendo el servidor `llama-server` con soporte para API de texto.
- No se declaran capacidades de visión, audio o tool calling en la información proporcionada.

## Casos de uso

- Asistentes conversacionales locales: el modelo puede gestionar diálogos multi-turno con contexto prolongado gracias a su ventana de 262 144 tokens, siendo adecuado para chatbots de atención al cliente o asistentes personales que requieran recordar interacciones largas.
- Procesamiento de documentos largos: análisis, resumen o extracción de información de libros, informes o expedientes completos sin necesidad de truncamiento, gracias a la capacidad de contexto extendido.
- Inferencia de baja latencia en entornos de producción: la decodificación especulativa con MTP reduce el número de pasos de generación, lo que mejora el throughput en servicios de generación de texto donde la latencia es crítica.
- Desarrollo de aplicaciones de razonamiento: el modo thinking permite que el modelo genere cadenas de razonamiento explícitas, útil para tareas de lógica, matemáticas o planificación en inglés.
- Despliegue en hardware de consumo: con un tamaño de archivo de 13,68 GB, el modelo cabe en GPUs de 16 GB VRAM (por ejemplo, RTX 4080 o RTX 4090), permitiendo ejecución local sin depender de servicios en la nube.
- Investigación y experimentación con cuantizaciones alternativas: el formato TQ3_4S ofrece un punto de comparación frente a cuantizaciones estándar (Q4_K_M, Q5_K_M) en términos de calidad y velocidad, aunque no se dispone de benchmarks publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El `model-index` de la model card declara una lista vacía de resultados, y no se proporcionan métricas como MMLU, HumanEval o GSM8K para esta cuantización. Tampoco se incluyen comparativas con el modelo base o con otras cuantizaciones. La única referencia de calidad es la card del modelo `Qwen3.5-27B-TQ3_4S` de Y Tan, que se cita como referencia del formato, pero cuyos datos numéricos no están disponibles en esta ficha.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF pesa 13,68 GB; con la cuantización de caché (por ejemplo, `-ctk q8_0 -ctv tq3_0`) se puede ejecutar en GPUs con 16 GB de VRAM. Para contexto máximo de 262 144 tokens, se requeriría más memoria (probablemente 24 GB o más).
- GPU recomendadas: NVIDIA RTX 4080, RTX 4090, A100, H100 o similares con al menos 16 GB de VRAM para uso general. Para contexto largo completo, se recomienda 24 GB o más.
- Compatibilidad con consumer GPU: sí, en GPUs de 16 GB (como RTX 4080) con cuantización de caché y contexto moderado (por ejemplo, 32 768 tokens como en el comando de lanzamiento recomendado).
- Opciones de despliegue: exclusivamente mediante el runtime fork `llama.cpp-tq3` (incluye `llama-server`). No es compatible con llama.cpp estándar ni con otros frameworks que no soporten el tipo de tensor `TQ3_4S`.
- Latencia y throughput: no se han publicado cifras concretas. La decodificación especulativa con MTP (con `--spec-draft-n-max 2`) está diseñada para mejorar la velocidad de generación, pero los valores exactos dependen del hardware y la configuración.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-MTP-TQ3_4S (este) | 27,3B | 262 144 | TQ3_4S (3,5 bits) | Apache-2.0 | GGUF, requiere runtime específico |
| Qwen/Qwen3.8-27B (base) | 27,3B | 262 144 | Sin cuantizar | Apache-2.0 | Safetensors, vLLM, etc. |
| Qwen3.5-27B-TQ3_4S (referencia de Y Tan) | 27B (aprox.) | 262 144 (según card) | TQ3_4S | Apache-2.0 | GGUF, mismo runtime |

No se dispone de datos de rendimiento comparativos (benchmarks) entre estos modelos. La principal diferencia práctica es el formato de pesos y el runtime requerido; el modelo base ofrece mayor flexibilidad de despliegue, mientras que la versión cuantizada prioriza la eficiencia de memoria a costa de requerir un fork específico.

## Limitaciones y advertencias

- Requiere el runtime fork `llama.cpp-tq3`; las builds estándar de llama.cpp no pueden cargar el formato `TQ3_4S`. Esto limita la portabilidad y puede complicar el despliegue en entornos con restricciones de software.
- Solo se declara soporte para inglés; no hay evidencia de capacidades multilingües para español u otros idiomas.
- No se han publicado benchmarks ni evaluaciones de calidad para esta cuantización concreta, por lo que la pérdida de precisión respecto al modelo base es desconocida.
- Riesgo de alucinación inherente a los modelos de lenguaje; se recomienda validar las respuestas en aplicaciones críticas.
- La licencia Apache-2.0 del modelo base se aplica, pero el runtime TurboQuant puede tener términos adicionales; se debe revisar la licencia del fork antes de uso comercial.
- El modo thinking y la decodificación especulativa requieren configuración específica; un uso incorrecto de los parámetros (por ejemplo, `--spec-draft-n-max` muy alto) puede degradar el rendimiento.
- El tamaño del contexto máximo (262 144 tokens) puede no ser alcanzable en GPUs de 16 GB sin cuantización de caché agresiva, lo que podría afectar a la calidad de las respuestas en contextos muy largos.

## Enlaces

- Modelo en HuggingFace: [jajmangold/Qwen3.8-27B-MTP-TQ3_4S](https://huggingface.co/jajmangold/Qwen3.8-27B-MTP-TQ3_4S)
- Modelo base: [Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- Runtime fork (llama.cpp-tq3): [https://github.com/turbo-tan/llama.cpp-tq3](https://github.com/turbo-tan/llama.cpp-tq3)
- Referencia de Y Tan en HuggingFace: [https://huggingface.co/YTan2000](https://huggingface.co/YTan2000)
- Card de referencia del formato TQ3_4S: [Qwen3.5-27B-TQ3_4S](https://huggingface.co/YTan2000/Qwen3.5-27B-TQ3_4S)
