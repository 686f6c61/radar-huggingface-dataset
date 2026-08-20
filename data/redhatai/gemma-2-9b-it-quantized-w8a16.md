# RedHatAI/gemma-2-9b-it-quantized.w8a16

## Resumen

RedHatAI/gemma-2-9b-it-quantized.w8a16 es una versión cuantizada a INT8 del modelo instructivo Gemma 2 9B de Google, publicada por Red Hat AI en colaboración con Neural Magic. El modelo base, google/gemma-2-9b-it, es un transformer decoder-only de 9.000 millones de parámetros, entrenado para tareas de chat y asistencia conversacional. La cuantización reduce el peso de cada parámetro de 16 a 8 bits, lo que disminuye el tamaño en disco y los requisitos de memoria GPU aproximadamente un 50%, manteniendo un rendimiento prácticamente idéntico al original.

La relevancia de este modelo reside en su despliegue eficiente en producción: al ocupar menos VRAM y ser compatible con el backend vLLM, permite servir inferencias de alta concurrencia en hardware más modesto o con mayor margen para batch. Es una opción sólida para equipos que necesitan un modelo de 9B con calidad cercana al estado del arte y costes de infraestructura reducidos. La cuantización se realizó con el algoritmo GPTQ, aplicando una escala simétrica por canal en los operadores lineales de los bloques transformer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 2 (transformer decoder-only) |
| Parametros totales | 10.159.209.984 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | INT8 (W8A16) con GPTQ |
| Idiomas soportados | ingles |
| Licencia | Gemma (https://ai.google.dev/gemma/terms) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es Gemma 2 9B, una arquitectura transformer con atención multi-cabeza y ventana de contexto de 8192 tokens. La versión cuantizada se obtiene aplicando el algoritmo GPTQ sobre los pesos de los operadores lineales de los bloques transformer, con esquema W8A16 (weights en INT8, activaciones en FP16). La cuantización es simétrica por canal, con un factor de amortiguamiento del 1% y 256 secuencias de calibración procedentes del dataset de compresión de Neural Magic (LLM_compression_calibration). Se excluye la capa lm_head de la cuantización.

El proceso de entrenamiento original de Gemma 2 9B incluye pre-entrenamiento en datos multilingües y ajuste fino instructivo (instruction tuning), aunque la model card no detalla la composición exacta del dataset. La versión cuantizada no re-entrena el modelo, solo recalibra los pesos para minimizar la pérdida de calidad, por lo que hereda las capacidades y sesgos del modelo base.

## Capacidades

- Generacion de texto conversacional: el modelo está optimizado para tareas de chat y asistente, con formato de plantilla de chat de Gemma.
- Razonamiento y conocimiento general: obtiene puntuaciones altas en MMLU (72.40) y ARC Challenge (71.33), indicando buena capacidad de razonamiento y conocimiento factual.
- Matematicas: alcanza un 79.23 en GSM-8K, lo que le permite resolver problemas aritméticos y de razonamiento numérico de nivel escolar.
- Comprensión lectora y sentido común: puntuaciones de 81.93 en HellaSwag y 77.74 en Winogrande, mostrando solidez en tareas de inferencia y coherencia textual.
- Veracidad: 60.20 en TruthfulQA, un resultado moderado que indica riesgo de alucinaciones en contextos factuales.
- Multilingüismo: aunque la model card indica que el uso previsto es en inglés, Gemma 2 base fue entrenado con datos multilingües; no se proporcionan benchmarks en otros idiomas.
- No incluye soporte explícito para tool calling, function calling ni modo de agente multi-step en la documentación disponible.

## Casos de uso

- Chatbots de atención al cliente: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 8.192 tokens), permitiendo mantener el historial de una interacción completa y responder de forma coherente. Su cuantización INT8 reduce los costes de despliegue en entornos con alto volumen de peticiones.
- Asistente de generación de código en entornos de desarrollo: aunque no está especializado en código, su rendimiento en GSM8K sugiere capacidad de razonamiento lógico que puede aplicarse a tareas de autocompletado o explicación de fragmentos de código, integrable en IDEs a través de APIs.
- Clasificación y análisis de documentos: con una ventana de 8K tokens, puede procesar documentos de varias páginas y extraer información estructurada (resúmenes, sentimientos, entidades) en inglés, útil para sistemas de gestión documental.
- Generación de contenido en inglés para marketing o soporte: su tono conversacional y capacidad de seguir instrucciones lo hacen adecuado para redactar borradores de correos, respuestas en foros o contenido de blogs, siempre con revisión humana.
- Investigación académica en NLP: como modelo base cuantizado, sirve para experimentos de eficiencia, estudio de impacto de cuantización en el rendimiento o como punto de partida para fine-tuning con menos recursos de cómputo.
- Despliegue en entornos con GPU limitada: al reducir el consumo de VRAM, es viable ejecutar inferencias en GPUs de 12-16 GB (como RTX 3060 Ti o A10), lo que facilita prototipos y pruebas en equipos de desarrollador sin acceso a clústeres grandes.

## Benchmarks y rendimiento

| Benchmark | gemma-2-9b-it (sin cuantizar) | gemma-2-9b-it-quantized.w8a16 (este modelo) | Recuperacion |
|---|---|---|---|
| MMLU (5-shot) | 72.29 | 72.40 | 100.1% |
| ARC Challenge (25-shot) | 71.08 | 71.33 | 100.4% |
| GSM-8K (5-shot, strict-match) | 79.30 | 79.23 | 99.9% |
| HellaSwag (10-shot) | 81.93 | 81.93 | 100.0% |
| Winogrande (5-shot) | 77.98 | 77.74 | 99.7% |
| TruthfulQA (0-shot) | 60.21 | 60.20 | 100.0% |
| **Media** | **73.80** | **73.80** | **100.0%** |

Los resultados muestran una recuperación del 100% en la media, con degradación mínima en GSM-8K y Winogrande. La cuantización no introduce pérdida significativa de calidad en las tareas evaluadas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9.000 millones de parámetros en INT8, el modelo ocupa aproximadamente 9-10 GB de VRAM en FP16 (los pesos se cargan en INT8 pero las activaciones en FP16). Con secuencias largas, se recomienda al menos 12-14 GB para margen.
- GPU recomendadas: NVIDIA A10G, L4, RTX 4090 (24 GB), A100 (40 GB) o superiores. Puede ejecutarse en GPUs de 16 GB como RTX 4080, pero con limitaciones en el tamaño de lote.
- Cabe en GPU consumer: sí, en RTX 3090/4090 (24 GB) y en RTX 4070 Ti (12 GB) con cuantización adicional o batch pequeño.
- Opciones de despliegue: vLLM (soporte nativo), también compatible con llama.cpp (aunque no se proporcionan pesos GGUF, se pueden convertir), Ollama, y Transformers con bibliotecas de cuantización.
- Latencia y throughput: no se publican mediciones específicas en la model card. Con vLLM en A100, se puede esperar un throughput de 50-100 tokens/segundo por request, dependiendo del batch y la longitud de secuencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | MMLU | GSM-8K | Licencia |
|---|---|---|---|---|---|---|
| gemma-2-9b-it (base) | 9B | 8192 | FP16 | 72.29 | 79.30 | gemma |
| gemma-2-9b-it-quantized.w8a16 (este) | 9B | 8192 | INT8 | 72.40 | 79.23 | gemma |
| gemma-2-9b-it-quantized.w4a16 | 9B | 8192 | INT4 | 72.29 | no disponible | gemma |
| Llama 3.1 8B Instruct | 8B | 128K | FP16 | 66.1 | 72.9 | llama3.1 |
| Mistral 7B Instruct v0.3 | 7B | 32K | FP16 | 60.1 | 52.2 | apache-2.0 |

La cuantización W8A16 mantiene un rendimiento idéntico al modelo base, mientras que la variante W4A16 (también disponible en RedHatAI) reduce aún más el tamaño pero con una ligera pérdida. Comparado con alternativas de tamaño similar, Gemma 2 9B supera a Llama 3.1 8B en MMLU y GSM-8K, y ofrece una licencia más permisiva que la de Llama (que requiere uso comercial con condiciones). Mistral 7B tiene una licencia Apache 2.0 más abierta, pero menor rendimiento en tareas de razonamiento.

## Limitaciones y advertencias

- La model card indica que el uso previsto es en inglés; no se garantizan resultados en otros idiomas, aunque el modelo base fue entrenado con datos multilingües.
- No se proporciona soporte explícito para tool calling, function calling ni modos de agente, por lo que no es adecuado para pipelines que requieran invocación de herramientas externas sin adaptación.
- Riesgo de alucinación: la puntuación en TruthfulQA (60.20) indica que puede generar información factual incorrecta, especialmente en dominios de conocimiento especializado.
- La licencia gemma de Google restringe el uso a fines comerciales y de investigación, y prohíbe su uso en aplicaciones que violen leyes o regulaciones (incluidas leyes de comercio). Es obligatorio revisar los términos completos de la licencia.
- La cuantización se aplica solo a los pesos de los operadores lineales de los bloques transformer; otras capas permanecen en FP16, lo que limita la reducción de memoria a aproximadamente el 50% del tamaño total del modelo.
- El modelo no incluye soporte de visión ni audio; es exclusivamente de texto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/RedHatAI/gemma-2-9b-it-quantized.w8a16
- Modelo base (sin cuantizar): https://huggingface.co/google/gemma-2-9b-it
- Documentación de vLLM: https://docs.vllm.ai/en/latest/
- Librería llm-compressor: https://github.com/vllm-project/llm-compressor
- Dataset de calibración de Neural Magic: https://huggingface.co/datasets/neuralmagic/LLM_compression_calibration
- Paper de GPTQ (arXiv): https://arxiv.org/abs/2210.17323
- Open LLM Leaderboard: https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard
- Términos de licencia Gemma: https://ai.google.dev/gemma/terms
