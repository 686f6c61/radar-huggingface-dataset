# mradermacher/GLM-4.7-Flash-REAP-50-GGUF

## Resumen

El modelo **GLM-4.7-Flash-REAP-50-GGUF** es una versión cuantizada en formato GGUF del modelo **GLM-4.7-Flash-REAP-50**, desarrollado por **Akicou** y convertido por **mradermacher**. Este repositorio contiene múltiples cuantizaciones estáticas (Q2_K, Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0, IQ4_XS, f16, entre otras) que permiten ejecutar el modelo en entornos con recursos limitados, como GPUs de consumo o incluso CPU.

El modelo base, **GLM-4.7-Flash**, es un modelo de razonamiento de tipo Mixture of Experts (MoE) desarrollado por **Z.ai**, con aproximadamente 30 mil millones de parámetros totales y unos 3.6 mil millones de parámetros activos por token. Soporta una ventana de contexto de 200K tokens y está diseñado para tareas de razonamiento, generación de código, flujos agénticos y conversación. La variante **REAP-50** añade un ajuste específico (posiblemente un fine-tuning o un merge) cuyo detalle no está documentado en la información disponible.

La relevancia de este repositorio radica en que ofrece una vía práctica para desplegar localmente un modelo de razonamiento de alto rendimiento con requisitos de hardware moderados, gracias a la cuantización GGUF. Sin embargo, la falta de información sobre la licencia, los idiomas soportados y los benchmarks específicos de la variante REAP-50 limita su evaluación rigurosa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en GLM-4.7-Flash de Z.ai |
| Parametros totales | ~30 mil millones (estimado según el modelo base) |
| Parametros activos | ~3.6 mil millones (estimado según el modelo base) |
| Longitud de contexto | 200K tokens (según el modelo base) |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible (el modelo base probablemente sea multilingüe, pero no se especifica) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors no incluido en este repo) |

## Arquitectura y entrenamiento

El modelo base **GLM-4.7-Flash** emplea una arquitectura MoE con 30B parámetros totales y 3.6B activos, lo que permite un equilibrio entre capacidad y eficiencia computacional. Está entrenado para razonamiento avanzado, generación de código y tareas agénticas, con una ventana de contexto de 200K tokens. No se dispone de detalles sobre el dataset de entrenamiento ni sobre el uso de RLHF o DPO en el modelo base.

La variante **REAP-50** es un ajuste adicional realizado por Akicou, pero no se ha publicado información sobre el proceso de entrenamiento, los datos utilizados ni las técnicas aplicadas (fine-tuning, merge, etc.). El repositorio de mradermacher se limita a convertir los pesos a formato GGUF mediante cuantización estática, sin modificar la arquitectura subyacente.

## Capacidades

- **Razonamiento y resolución de problemas**: hereda las capacidades de razonamiento del modelo base GLM-4.7-Flash, que destaca en tareas de lógica y matemáticas.
- **Generación de código**: soporta generación y comprensión de código en múltiples lenguajes, adecuado para asistentes de programación.
- **Flujos agénticos**: diseñado para tareas multi-paso y uso de herramientas (tool calling), aunque no se confirma explícitamente en esta variante.
- **Conversación**: etiquetado como "conversational" en los tags del repositorio, lo que indica su idoneidad para chatbots.
- **Contexto largo**: ventana de 200K tokens, útil para documentos extensos o conversaciones prolongadas.
- **Multilingüismo**: probablemente soporte múltiples idiomas, pero no está documentado para esta variante.

## Casos de uso

- **Despliegue local de un asistente de razonamiento**: gracias a las cuantizaciones GGUF, se puede ejecutar en una GPU de consumo (por ejemplo, RTX 3090/4090 con 24 GB) o incluso en CPU con suficiente RAM, ofreciendo capacidades de razonamiento avanzado sin depender de APIs externas.
- **Generación de código en entornos offline**: un desarrollador puede integrar el modelo en un IDE o CLI para autocompletar y generar código, aprovechando su entrenamiento específico en programación.
- **Análisis de documentos largos**: con 200K tokens de contexto, es adecuado para resumir o extraer información de contratos, informes o artículos extensos.
- **Automatización de tareas agénticas**: si se confirma el soporte de tool calling, puede usarse en pipelines de automatización que requieran planificación multi-paso, como gestión de correos o integración con APIs.
- **Prototipado de chatbots conversacionales**: su naturaleza "conversational" lo hace útil para crear asistentes virtuales con memoria de contexto amplia.
- **Investigación en modelos MoE**: permite estudiar el comportamiento de un MoE de 30B en un entorno local, sin necesidad de infraestructura de alto coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para la variante **REAP-50** en la información disponible. El modelo base **GLM-4.7-Flash** ha reportado buenos resultados en tareas como SWE-Bench, GPQA y benchmarks de razonamiento y chat, según fuentes de Unsloth, pero estos datos no son directamente aplicables a esta variante cuantizada sin verificación adicional. Se recomienda realizar pruebas propias para evaluar el rendimiento real en el caso de uso deseado.

## Requisitos de hardware

- **VRAM estimada**: depende de la cuantización. Para Q4_K_M (aproximadamente 4 bits por peso), se estima un uso de memoria de unos 15-16 GB para los 30B parámetros, más overhead de contexto. Con Q2_K, podría reducirse a ~10 GB. La memoria real dependerá de la longitud de contexto utilizada.
- **GPU recomendadas**: una RTX 3090 o RTX 4090 (24 GB VRAM) es suficiente para las cuantizaciones más altas (Q4_K_M, Q5_K_M) con contexto moderado. Para cuantizaciones más bajas (Q2_K, Q3_K_M), una GPU de 16 GB (RTX 4080, RTX 3080 Ti) podría ser viable.
- **CPU**: con suficiente RAM (32 GB o más), se puede ejecutar en CPU usando llama.cpp, aunque la velocidad será significativamente menor.
- **Opciones de despliegue**: compatible con llama.cpp, Ollama, y potencialmente con vLLM si se convierte a un formato compatible (aunque el repo solo ofrece GGUF). También es compatible con servidores de inferencia que soporten GGUF, como llama-cpp-python.
- **Latencia y throughput**: no se dispone de datos medidos. En una GPU de 24 GB con Q4_K_M, se espera una generación de varios tokens por segundo, pero depende del hardware y la configuración.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| GLM-4.7-Flash-REAP-50 (este repo) | ~30B | ~3.6B | 200K | no disponible | GGUF |
| GLM-4.7-Flash (original, Z.ai) | ~30B | ~3.6B | 200K | no disponible | safetensors, GGUF |
| Qwen3-30B-A3B (referencia) | 30B | 3B | 128K | Apache 2.0 | safetensors, GGUF |
| DeepSeek-V3-Lite (referencia) | 16B | 2.4B | 128K | MIT | safetensors, GGUF |

La comparativa se basa en el modelo base, ya que no hay datos específicos de REAP-50. La principal diferencia con alternativas como Qwen3-30B-A3B es la ventana de contexto (200K vs 128K) y el rendimiento en tareas de razonamiento, aunque ambos son MoE de tamaño similar. La licencia de este modelo es desconocida, lo que puede ser un factor limitante frente a alternativas con licencias permisivas.

## Limitaciones y advertencias

- **Licencia desconocida**: no se especifica la licencia del modelo, lo que impide garantizar su uso comercial o incluso su redistribución. Es necesario contactar con el autor original (Akicou) para aclarar los términos.
- **Riesgo de alucinación**: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en tareas de razonamiento complejo.
- **Sesgos potenciales**: no se ha documentado ningún análisis de sesgos para esta variante; el modelo base podría heredar sesgos de sus datos de entrenamiento.
- **Degradación por cuantización**: las cuantizaciones más agresivas (Q2_K, Q3_K) pueden reducir la calidad de las respuestas, especialmente en tareas de razonamiento matemático o lógico.
- **Falta de documentación**: no hay información sobre el proceso de entrenamiento de REAP-50, los datos utilizados ni las diferencias con el modelo base, lo que dificulta su evaluación rigurosa.
- **Compatibilidad**: al ser un formato GGUF, requiere herramientas compatibles (llama.cpp, Ollama, etc.) y no es directamente utilizable con frameworks que esperan safetensors.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/GLM-4.7-Flash-REAP-50-GGUF
- Modelo original (Akicou): https://huggingface.co/Akicou/GLM-4.7-Flash-REAP-50
- Modelo base GLM-4.7-Flash (Z.ai): https://huggingface.co/unsloth/GLM-4.7-Flash-GGUF (referencia de cuantizaciones)
- Guía de ejecución local de GLM-4.7-Flash (Unsloth): https://unsloth.ai/docs/models/tutorials/glm-4.7-flash
- Repositorio alternativo con cuantización Q4_K_M: https://mygguf.com/model?id=gaionaus%2FGLM-4.7-Flash-REAP-50_Q4_K_M_GGUF
