# PorsukR/P220-ThaiOCR-9B-FP8

## Resumen

P220-ThaiOCR-9B-FP8 es la variante cuantizada en FP8 dinámico de P220-ThaiOCR-9B, un modelo vision-lenguaje de 9.400 millones de parámetros especializado en documentos tailandeses. Lo desarrolla Porsuk Rungarunsrisuk y parte de Qwen/Qwen3.5-9B (licencia Apache-2.0), afinado con LoRA y posteriormente fusionado. El modelo resuelve la transcripción y comprensión de texto impreso y manuscrito, tablas, formularios, recibos, PDF gubernamentales y escaneos, devolviendo texto plano, Markdown o tablas HTML, además de responder preguntas sobre el contenido del documento sin reglas específicas por plantilla.

La relevancia actual del modelo radica en su rendimiento declarado en ThaiOCRBench: según el autor, obtiene la mejor media de 13 tareas entre los modelos abiertos comparados (0,674), por delante de Qwen3.6-35B-A3B (0,589) y OpenThai 2.0 27B, y supera a GPT-6 Luna; en tareas de transcripción se acerca a GPT-6.1 Sol. Esta variante FP8 está pensada para servir con vLLM en GPUs NVIDIA Ada o Hopper, con pesos en formato compressed-tensors y un tamaño de repositorio de 12,4 GB.

El modelo solo admite tailandés e inglés, opera con el modo "thinking" desactivado por defecto y está publicado bajo licencia Apache-2.0, lo que facilita su uso comercial. Su tamaño de 9B lo sitúa en un rango manejable para despliegues de OCR documental en producción sin depender de APIs cerradas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje basada en transformer (Qwen3.5-9B, tag `qwen3_5`), con codificador de imagen y decodificador de lenguaje |
| Parámetros totales | 9.409.813.744 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (`--max-model-len 32768` en el ejemplo de vLLM) |
| Tipos de cuantización | FP8 dinámico (esta variante); el proyecto ofrece además BF16, W4A16 (INT4 weight-only), NVFP4 y GGUF (BF16, Q8_0, Q4_K_M, Q3_K_M, Q2_K) |
| Idiomas soportados | Tailandés (th), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato compressed-tensors (FP8), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo es un vision-lenguaje construido sobre Qwen3.5-9B, un transformer con codificador visual y decodificador de lenguaje. El autor indica que el ajuste se realizó con LoRA sobre el modelo base y que los adaptadores se fusionaron en los pesos finales. No se detalla en la información disponible el volumen de tokens de entrenamiento ni la composición exacta del dataset, más allá de que el objetivo era el OCR de documentos tailandeses (texto impreso y manuscrito, tablas, formularios, recibos, PDF y escaneos). Tampoco se especifica si hubo RLHF o DPO.

La innovación técnica destacable está en el proceso de cuantización: las variantes de 4, 3 y 2 bits en GGUF usan una imatrix construida a partir de texto OCR tailandés, y W4A16 y NVFP4 se calibraron sobre el mismo texto, mientras que FP8 y GGUF Q8_0 no requieren calibración. Según el autor, todos los ficheros publicados se evaluaron sobre los conjuntos de validación completos. La variante FP8 es cuantización dinámica, sin calibración, y está empaquetada en formato compressed-tensors para su uso con vLLM. El modelo se entrenó y evaluó sin modo "thinking", y la plantilla de chat incluida lo desactiva por defecto.

## Capacidades

- Transcripción de texto impreso y manuscrito en tailandés, con salida en texto plano, Markdown o tablas HTML.
- Comprensión de documentos: tablas, formularios, recibos, PDF gubernamentales y escaneos, sin reglas por plantilla.
- Respuesta a preguntas sobre el contenido de un documento (información clave, clasificación, gráficos, diagramas).
- Generación de salida estructurada (JSON de bloques de texto, encabezados y tablas) para páginas de PDF.
- Capacidades multilingües limitadas a tailandés e inglés.
- Entrada multimodal imagen-texto mediante el pipeline `image-text-to-text` y la API compatible con OpenAI de vLLM.
- Modo conversacional multi-turno (tag `conversational`), con "thinking" desactivado por defecto y controlable mediante `chat_template_kwargs`.
- No se documenta soporte de tool calling, function calling ni de agentes multi-paso en la información disponible.

## Casos de uso

- Digitalización de archivos gubernamentales tailandeses: el modelo convierte PDF y escaneos en texto plano o JSON estructurado (bloques de texto, encabezados, tablas), lo que permite indexar y buscar en corpus administrativos sin definir plantillas por documento.
- Automatización de cuentas y recibos: extracción de líneas de detalle, importes y fechas de recibos y facturas en tailandés para alimentar sistemas de contabilidad, gracias a su capacidad de parseo de tablas.
- Procesamiento de formularios manuscritos: lectura de campos rellenados a mano en tailandés, útil en trámites bancarios, seguros o administración pública donde el OCR clásico falla con caligrafía.
- Enriquecimiento de pipelines RAG: conversión de documentos escaneados a Markdown con tablas preservadas antes de la fragmentación e indexación, manteniendo la estructura semántica del original.
- Atención al cliente sobre documentos: un asistente que recibe una imagen de un documento del usuario y responde preguntas sobre su contenido (importes, condiciones, clasificación), con contexto de 32.768 tokens para páginas densas.
- Moderación y clasificación documental: categorización automática de documentos entrantes (tipo de formulario, organismo emisor, presencia de datos clave) mediante preguntas directas al modelo sobre la imagen.
- Despliegue en infraestructura propia con vLLM: al ser FP8 y caber en GPUs Ada/Hopper, permite servir OCR a escala con la API compatible con OpenAI, sin dependencia de proveedores externos.

## Benchmarks y rendimiento

Los datos disponibles provienen de la model card del autor. Todas las evaluaciones se ejecutaron en el mismo hardware y con el mismo código de puntuación; los modelos con dos ejecuciones se promediaron. En ThaiOCRBench (13 tareas, 2.808 ítems, mayor es mejor):

| Modelo | Media 13 tareas |
|---|---|
| GPT-6.1 Sol (cerrado, thinking low) | 0,738 |
| **P220-ThaiOCR-9B** | **0,674** |
| Qwen3.6-35B-A3B | 0,589 |
| P110-ThaiOCR-4B | 0,572 |
| Qwen3.5-9B (base) | 0,462 |

En las 5 tareas de transcripción, P220 obtiene una media de 0,635 frente a 0,652 de GPT-6.1 Sol: supera al modelo cerrado en reconocimiento de texto, parseo de tablas y parseo de documentos, y queda por debajo en OCR de página completa y manuscrito. La información proporcionada no incluye la tabla desglosada por tarea ni resultados de benchmarks generales como MMLU, HumanEval o GSM8K. El autor afirma además que el fichero GGUF Q2_K (3,9 GB) obtiene menor CER que P110-ThaiOCR-4B en BF16 y que la mayoría de modelos comparados, incluido GPT-6 Luna.

## Requisitos de hardware

- VRAM estimada para esta variante FP8: en torno a 10-12 GB solo para pesos (9,4B parámetros a 1 byte por parámetro, más overhead de escalas y metadatos de compressed-tensors); con caché KV para 32.768 tokens y procesamiento de imágenes conviene reservar 16-24 GB.
- GPU recomendadas para FP8: NVIDIA Ada (L40S, RTX 4090) y Hopper (H100, H200). El autor indica FP8 para Ada/Hopper, W4A16 para Ampere, NVFP4 para Blackwell y GGUF para CPU, Mac u Ollama.
- En GPU de consumo: la variante FP8 puede caber en una RTX 4090 (24 GB) con contexto moderado; para GPUs con menos VRAM o sin soporte FP8, usar las variantes GGUF Q4_K_M o Q3_K_M/Q2_K.
- Opciones de despliegue: vLLM (probado con vLLM 0.29.0 y transformers 5.17.0) mediante `vllm serve PorsukR/P220-ThaiOCR-9B-FP8 --max-model-len 32768`; llama.cpp u Ollama con los ficheros GGUF; la librería transformers también está soportada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ThaiOCRBench (13 tareas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **P220-ThaiOCR-9B-FP8** | 9,4B | 32.768 | 0,674 | Apache-2.0 | HuggingFace (BF16, FP8, W4A16, NVFP4, GGUF) |
| Qwen3.6-35B-A3B | 35B (MoE) | no disponible | 0,589 | no disponible | no disponible |
| P110-ThaiOCR-4B | 4B | no disponible | 0,572 | no disponible | HuggingFace (BF16 y cuantizaciones) |
| Qwen3.5-9B (base) | 9B | no disponible | 0,462 | Apache-2.0 | HuggingFace |
| GPT-6.1 Sol | cerrado | no disponible | 0,738 | propietaria | API |
| GPT-6 Luna | cerrado | no disponible | no disponible (por debajo de P220 según el autor) | propietaria | API |

P220 destaca por ofrecer la mejor media entre los modelos abiertos comparados con solo 9,4B parámetros, por delante de un MoE de 35B, y por publicar variantes para todos los rangos de hardware con licencia Apache-2.0.

## Limitaciones y advertencias

- Idiomas limitados a tailandés e inglés; el rendimiento en otros idiomas no está documentado y probablemente sea deficiente.
- Riesgo de repeticiones descontroladas: el ejemplo del autor fija `max_tokens=4096` para "detener una repetición desbocada poco frecuente"; en páginas muy densas hay que subir el límite.
- El modo "thinking" está desactivado por defecto y el modelo se entrenó sin él; activarlo no aporta mejoras documentadas.
- Solo se han publicado resultados en ThaiOCRBench; no hay benchmarks generales (MMLU, HumanEval, GSM8K) ni evaluaciones independientes.
- Los datos de benchmarks proceden del propio autor, con posibles sesgos de selección de prompts y configuración; GPT-6.1 Sol se ejecutó con thinking en nivel bajo y el resto sin thinking, lo que limita la comparación directa.
- En ThaiOCRBench, 15 de los 2.808 ítems fueron filtrados por la API de Luna y puntuados como 0, lo que afecta ligeramente a la comparativa con modelos cerrados.
- No se documentan sesgos específicos, pero al estar especializado en documentos tailandeses puede heredar sesgos del corpus de entrenamiento y del modelo base.
- Riesgo de alucinación en campos poco legibles o manuscritos difíciles; para producción conviene validar la salida estructurada (por ejemplo, el JSON de página) y aplicar comprobaciones de esquema.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base y los datos de entrenamiento pueden imponer obligaciones adicionales no detalladas en la información disponible.
- No se documenta soporte de tool calling ni de agentes, por lo que no debe asumirse en pipelines que dependan de function calling.

## Enlaces

- Modelo en HuggingFace (FP8): https://huggingface.co/PorsukR/P220-ThaiOCR-9B-FP8
- Modelo base BF16: https://huggingface.co/PorsukR/P220-ThaiOCR-9B
- Variante W4A16: https://huggingface.co/PorsukR/P220-ThaiOCR-9B-W4A16
- Variante NVFP4: https://huggingface.co/PorsukR/P220-ThaiOCR-9B-NVFP4
- Variante GGUF: https://huggingface.co/PorsukR/P220-ThaiOCR-9B-GGUF
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset ThaiOCRBench: https://huggingface.co/datasets/typhoon-ai/ThaiOCRBench
- Repositorio de vLLM: https://github.com/vllm-project/vllm
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
