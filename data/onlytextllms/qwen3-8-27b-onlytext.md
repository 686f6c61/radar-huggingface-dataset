# OnlyTextLLMs/Qwen3.8-27B-OnlyText

## Resumen

Qwen3.8-27B-OnlyText es una derivación del modelo multimodal Qwen3.8-27B de Alibaba, publicada por el usuario OnlyTextLLMs. El modelo elimina los componentes de visión y audio (torre de visión, proyector y tokens especiales multimodales) del modelo original, conservando íntegramente el backbone de texto, la cabeza de lenguaje y el cabezal MTP (Multi-Token Prediction) para decodificación especulativa. El resultado es un modelo causal de solo texto con 27.320 millones de parámetros, arquitectura `Qwen3_5ForCausalLM`, 64 capas y tamaño oculto de 5120, con pesos en `bfloat16`.

La relevancia de esta versión radica en que ofrece las capacidades de generación de texto, razonamiento y código del modelo base sin el overhead de los módulos multimodales, lo que reduce el tamaño del repositorio (54.6 GB frente a los más de 60 GB del original) y simplifica el despliegue en entornos donde solo se necesita procesamiento de texto. No se ha realizado ningún entrenamiento adicional: solo se han podado pesos, por lo que las capacidades lingüísticas y de razonamiento son heredadas directamente del modelo Qwen3.8-27B, que a su vez se basa en la arquitectura híbrida de atención de la familia Qwen3.5.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForCausalLM` (transformer híbrido con atención completa y lineal) |
| Parametros totales | 27.320.513.536 (27,32 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen3.8-27B soporta 262 144 tokens según fuentes externas |
| Tipos de cuantizacion | No disponible (pesos originales en `bfloat16`; se pueden generar cuantizaciones GGUF/AWQ sin información oficial) |
| Idiomas soportados | Inglés (según la model card; el modelo base soporta múltiples idiomas, pero no se confirma para esta versión) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (`bfloat16`) |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura híbrida de atención del Qwen3.8-27B original: de sus 64 capas, solo 16 ejecutan atención completa (gated attention) con un intervalo de `full_attention_interval: 4`, mientras que las otras 48 utilizan un mecanismo de atención lineal, lo que reduce el coste computacional en contextos largos. El cabezal MTP (draft head) se mantiene intacto, permitiendo decodificación especulativa para acelerar la inferencia.

No se ha realizado ningún entrenamiento adicional sobre los pesos originales. El proceso de creación consistió únicamente en eliminar los pesos de la torre de visión, el proyector multimodal y los tokens especiales asociados a imagen y audio, así como ajustar el tokenizador y la configuración para el modo solo texto. Por tanto, no hay datos de entrenamiento propios ni procesos de RLHF/DPO específicos de esta versión; todas las capacidades proceden del modelo base.

## Capacidades

- Generación de texto causal de alta calidad, incluyendo razonamiento complejo, matemáticas y comprensión lectora, heredadas del modelo Qwen3.8-27B.
- Generación de código y soporte de lenguajes de programación, con capacidad para completar, explicar y depurar código.
- Soporte de tool calling y function calling, lo que permite integrar el modelo en pipelines que requieren invocación de APIs o ejecución de acciones.
- Capacidades de agente y razonamiento multi-paso, gracias al entrenamiento del modelo base en tareas de agente y automatización de oficina.
- Decodificación especulativa mediante el cabezal MTP conservado, que acelera la generación en entornos compatibles (vLLM, SGLang).
- Multilingüismo: aunque la model card declara solo inglés, el modelo base fue entrenado con datos multilingües; no se garantiza el mismo rendimiento en otros idiomas tras la poda.
- Sin capacidades de visión ni audio: el modelo no procesa imágenes, vídeo ni sonido.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 262K tokens en el modelo base), lo que permite mantener el historial completo de interacciones y documentos de referencia sin truncamiento.
- Generación de código en producción: con soporte de tool calling, puede integrarse en pipelines de CI/CD para generar tests, documentar APIs o autocompletar funciones, reduciendo el tiempo de desarrollo.
- Asistentes de programación locales: al ser solo texto, puede desplegarse en entornos con recursos limitados (con cuantización) para ofrecer autocompletado y explicaciones de código sin depender de servicios en la nube.
- Procesamiento de documentos legales o técnicos: su ventana de contexto amplia permite resumir, extraer información y responder preguntas sobre contratos, informes o manuales extensos.
- Sistemas RAG (Retrieval-Augmented Generation): el modelo puede combinarse con un motor de búsqueda vectorial para responder consultas sobre bases de conocimiento corporativas, manteniendo la coherencia gracias a su capacidad de razonamiento.
- Automatización de tareas de oficina: hereda del modelo base la capacidad de generar correos, informes, presentaciones en texto y hojas de cálculo, facilitando flujos de trabajo administrativos.
- Investigación en NLP: al ser una versión solo texto de un modelo multimodal, sirve como punto de partida para estudiar el impacto de la poda de modalidades en el rendimiento lingüístico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones para esta versión específica. Dado que no hubo entrenamiento adicional, se espera que el rendimiento en tareas de texto sea similar al del modelo base Qwen3.8-27B, pero no hay datos confirmados.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en `bfloat16` ocupan aproximadamente 54.6 GB, por lo que se necesitan al menos 60 GB de VRAM para cargar el modelo sin cuantizar. Con cuantización de 8 bits se reduce a ~27 GB, y con 4 bits a ~14 GB (estimaciones basadas en el tamaño de parámetros, no en datos oficiales).
- GPU recomendadas: para inferencia sin cuantizar, una NVIDIA A100 80GB, H100 80GB o dos RTX 4090 (24GB cada una) con tensor parallelism. Con cuantización de 4 bits, una RTX 4090 o RTX 3090 (24GB) es suficiente.
- Compatibilidad con consumer GPU: sí, con cuantización de 4 bits u 8 bits puede ejecutarse en GPUs de 24GB, aunque con menor velocidad.
- Opciones de despliegue: vLLM, SGLang, llama.cpp (tras conversión a GGUF), Ollama (si se publica una versión GGUF), TGI (Text Generation Inference) y Transformers con `device_map="auto"`.
- Latencia y throughput: no disponibles. Se espera que la decodificación especulativa con el MTP head mejore la velocidad en vLLM y SGLang, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,32 B | 262K | Texto, visión, audio | Apache 2.0 | Modelo original multimodal, con más peso y complejidad |
| Qwen3.8-27B-OnlyText | 27,32 B | No disponible (probablemente 262K) | Solo texto | Apache 2.0 | Versión podada, sin módulos multimodales, conserva MTP |
| Qwen2.5-32B (texto) | 32,5 B | 128K | Solo texto | Apache 2.0 | Alternativa de tamaño similar, sin atención híbrida ni MTP |

La comparativa se limita a modelos de la misma familia o tamaño similar. No se dispone de datos de rendimiento para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Sin capacidades multimodales: el modelo no puede procesar imágenes, vídeo ni audio, por lo que no es adecuado para tareas que requieran comprensión visual o auditiva.
- Sesgos del modelo base: al ser una copia sin entrenamiento adicional, hereda los sesgos presentes en los datos de entrenamiento de Qwen3.8-27B, que pueden incluir estereotipos culturales o de género.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en dominios especializados o con contextos ambiguos.
- Limitaciones de idioma: la model card declara solo inglés; aunque el modelo base es multilingüe, no se garantiza el mismo rendimiento en otros idiomas tras la poda de tokens multimodales.
- Contexto no confirmado: la longitud de contexto de 262K corresponde al modelo base, pero no está verificada en esta versión; se recomienda probar antes de usarla en producción con ventanas muy largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero se debe mantener la atribución al autor original (Qwen team) y a esta derivación.
- Sin soporte oficial: el autor no proporciona documentación adicional ni canal de soporte; cualquier problema debe resolverse a través de la comunidad.

## Enlaces

- [HuggingFace - OnlyTextLLMs/Qwen3.8-27B-OnlyText](https://huggingface.co/OnlyTextLLMs/Qwen3.8-27B-OnlyText)
- [GitHub - AlibabaCloud-Official/Qwen3.8-27B](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- [QwenCloud - Qwen3.8-27B](https://www.qwencloud.com/models/qwen3.8-27b)
- [Vast.ai - Qwen3.8 27B](https://vast.ai/model/qwen38-27b)
- [vLLM Ascend - Qwen3.8-27B](https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/Qwen3.8-27B.html)
- [HuggingFace - unsloth/Qwen3.8-27B](https://huggingface.co/unsloth/Qwen3.8-27B)
