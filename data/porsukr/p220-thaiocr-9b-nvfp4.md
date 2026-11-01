# PorsukR/P220-ThaiOCR-9B-NVFP4

## Resumen

P220-ThaiOCR-9B-NVFP4 es una cuantización NVFP4 del modelo P220-ThaiOCR-9B, un modelo de visión-lenguaje de aproximadamente 9.000 millones de parámetros (6.993.894.640 reales en safetensors) especializado en el reconocimiento y comprensión de documentos tailandeses. Lo desarrolla Porsuk Rungarunsrisuk (usuario PorsukR) mediante un fine-tuning con LoRA sobre Qwen/Qwen3.5-9B (licencia Apache-2.0), con los pesos fusionados posteriormente. Esta variante concreta está pensada para servir el modelo en vLLM sobre GPUs NVIDIA Blackwell, con capas MLP en NVFP4 y atención en FP8, en formato compressed-tensors.

El modelo resuelve el problema del OCR y la comprensión documental en tailandés: texto impreso y manuscrito, tablas, formularios, recibos, PDFs gubernamentales y escaneos. Convierte páginas en texto plano, Markdown o tablas HTML, y responde preguntas sobre el contenido de un documento (información clave, clasificación, gráficos, diagramas) sin necesidad de reglas específicas por plantilla. Según el autor, es el modelo abierto con mejor puntuación en ThaiOCRBench, por encima de Qwen3.6-35B-A3B y OpenThai 2.0 27B, y cercano a GPT-6.1 Sol en las tareas de transcripción.

La relevancia de esta ficha concreta radica en que permite desplegar un modelo de OCR tailandés de 9B en GPUs Blackwell con cuantización de 4 bits, reduciendo el coste de VRAM frente a BF16 sin renunciar a la precisión. El autor indica que todos los ficheros cuantizados se calibraron con texto de OCR tailandés y se evaluaron sobre los conjuntos de validación completos, y que incluso el fichero más pequeño (GGUF Q2_K, 3,9 GB) supera en precisión (menor CER) a P110-ThaiOCR-4B en BF16.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language transformer basado en Qwen3.5-9B (fine-tuning LoRA fusionado); cuantización NVFP4 en MLP y FP8 en atención, formato compressed-tensors |
| Parámetros totales | 6.993.894.640 (≈7B, denominado comercialmente "9B") |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de despliegue usa `--max-model-len 32768` |
| Tipos de cuantización | NVFP4 (esta variante); el proyecto ofrece además BF16, FP8, W4A16 (INT4 weight-only) y GGUF (BF16, Q8_0, Q4_K_M, Q3_K_M, Q2_K) |
| Idiomas soportados | tailandés (th), inglés (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer multimodal de tipo image-text-to-text, y se ha adaptado mediante fine-tuning con LoRA, con los adaptadores fusionados en los pesos finales. La variante NVFP4 aquí descrita no es un reentrenamiento, sino una cuantización de los pesos BF16 originales: las capas MLP se cuantizan a NVFP4 y la atención se mantiene en FP8, empaquetada en formato compressed-tensors para su uso con vLLM en GPUs Blackwell.

El autor indica que la cuantización se calibró con texto de OCR tailandés (imatrix construida a partir de texto OCR en tailandés para los GGUF de 4, 3 y 2 bits, y la misma calibración para W4A16 y NVFP4), con el objetivo explícito de preservar la calidad de OCR en tailandés. FP8 y GGUF Q8_0 no requieren calibración. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset de fine-tuning, ni si se aplicaron técnicas de RLHF o DPO. El modelo se entrenó y evaluó sin modo "thinking", y la plantilla de chat incluida lo desactiva por defecto.

## Capacidades

- Reconocimiento de texto impreso y manuscrito en tailandés e inglés.
- Transcripción de páginas completas a texto plano, Markdown o tablas HTML.
- Comprensión de documentos: extracción de información clave, clasificación de documentos, interpretación de gráficos y diagramas.
- Procesamiento de tablas, formularios, recibos, PDFs gubernamentales y escaneos.
- Respuesta a preguntas sobre el contenido de un documento (document QA) sin reglas por plantilla.
- Soporte de conversación multi-turno (etiqueta "conversational").
- Compatible con endpoints estilo OpenAI a través de vLLM.
- Capacidades multilingües limitadas a tailandés e inglés.
- Modo "thinking" desactivado por diseño (no se entrena ni evalúa con razonamiento extendido).
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, audio o decodificación especulativa.

## Casos de uso

- Digitalización de archivos gubernamentales tailandeses: el modelo convierte PDFs y escaneos en texto plano o Markdown estructurado, adecuado para pipelines de ingesta documental masiva gracias a su especialización en documentos oficiales tailandeses.
- Procesamiento de recibos y facturas: extracción de importes, fechas y líneas de detalle en formato de tabla, útil en sistemas de contabilidad automatizada para el mercado tailandés.
- Reconocimiento de manuscritos: transcripción de formularios y notas manuscritas en tailandés, un caso históricamente difícil para OCR genérico y que el modelo cubre explícitamente.
- Document QA en atención al cliente: responder preguntas sobre el contenido de un documento aportado por el usuario (pólizas, contratos, extractos) en tailandés o inglés, aprovechando la ventana de contexto configurable hasta 32.768 tokens en el ejemplo de despliegue.
- Extracción de tablas a HTML/Markdown: conversión de tablas complejas de documentos escaneados a formatos estructurados para su posterior carga en bases de datos o sistemas de BI.
- Clasificación y enrutamiento documental: identificar el tipo de documento y extraer metadatos clave para enrutarlo automáticamente en flujos de back-office.
- Despliegue en GPUs Blackwell: servir el modelo con vLLM en formato NVFP4 para reducir el coste de VRAM frente a BF16 en entornos de producción con hardware NVIDIA de última generación.

## Benchmarks y rendimiento

El autor publica resultados en ThaiOCRBench (2.808 ítems, 13 tareas, cuanto más alto mejor). La model card incluye una tabla parcial; los datos numéricos disponibles en la información proporcionada son los siguientes:

| Modelo | Media 13 tareas (ThaiOCRBench) | Media 5 tareas de transcripción |
|---|---|---|
| P220-ThaiOCR-9B | 0,674 | 0,635 |
| P110-ThaiOCR-4B | 0,572 | no disponible |
| Qwen3.6-35B-A3B | 0,589 | no disponible |
| Qwen3.5-9B (base) | 0,462 | no disponible |
| GPT-6.1 Sol (cerrado) | 0,738 | 0,652 |

En las 5 tareas de transcripción, el autor indica que P220 supera a GPT-6.1 Sol en reconocimiento de texto, parsing de tablas y parsing de documentos, y queda por debajo en OCR de página completa y manuscrito (media 0,635 frente a 0,652). También afirma que P220 supera a OpenThai 2.0 27B y a GPT-6 Luna, aunque no se proporcionan las cifras concretas de esos modelos en la información disponible. No se han publicado en la información disponible resultados de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para esta variante NVFP4: el repositorio ocupa 10,3 GB, por lo que se requiere una GPU con al menos ~11-12 GB de VRAM libre para cargar los pesos, más el espacio para KV cache y activaciones.
- GPU recomendadas: NVIDIA Blackwell (por ejemplo, B200) para NVFP4; para otras generaciones el autor recomienda FP8 en Ada/Hopper, W4A16 en Ampere y GGUF en CPU/Mac/Ollama.
- Cabe en GPU consumer: no confirmado para esta variante NVFP4 (requiere Blackwell); para GPUs consumer el autor dirige a los ficheros GGUF Q4_K_M (y Q3_K_M/Q2_K para menos memoria).
- Opciones de despliegue: vLLM (probado con vLLM 0.29.0 y transformers 5.17.0), llama.cpp y Ollama mediante los GGUF del proyecto; endpoint compatible con la API de OpenAI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ThaiOCRBench (13 tareas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| P220-ThaiOCR-9B-NVFP4 | ≈7B (6,99B) | no disponible (ejemplo a 32.768) | 0,674 (versión BF16) | Apache-2.0 | HuggingFace (BF16, FP8, W4A16, NVFP4, GGUF) |
| P110-ThaiOCR-4B | ≈4B | no disponible | 0,572 | no disponible | HuggingFace |
| Qwen3.6-35B-A3B | 35B (MoE, activos no disponibles) | no disponible | 0,589 | no disponible | HuggingFace |
| Qwen3.5-9B (base) | ≈9B | no disponible | 0,462 | Apache-2.0 | HuggingFace |
| GPT-6.1 Sol (cerrado) | no disponible | no disponible | 0,738 | propietaria | API |

## Limitaciones y advertencias

- Especialización estrecha: el modelo está entrenado para OCR y comprensión documental en tailandés e inglés; su rendimiento en otras tareas de propósito general no está documentado.
- Idiomas limitados a tailandés e inglés; no se garantiza calidad en otros idiomas.
- Modo "thinking" desactivado por diseño; no se debe esperar razonamiento extendido.
- Riesgo de alucinación inherente a los modelos generativos: el autor recomienda `temperature=0` y un `max_tokens` acotado (4096) para evitar repeticiones desbocadas en páginas muy densas.
- La variante NVFP4 depende de hardware NVIDIA Blackwell y de vLLM con soporte compressed-tensors; en otras GPUs debe usarse otra variante del proyecto.
- La longitud de contexto no se especifica en la model card; el valor de 32.768 procede únicamente del comando de ejemplo de vLLM.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-9B y de los datos de entrenamiento, no detallados en la información disponible.
- El modelo tiene muy poca tracción pública (9 descargas, 0 likes en el momento de la consulta); considerar su madurez y soporte antes de usarlo en producción crítica.

## Enlaces

- HuggingFace (esta variante NVFP4): https://huggingface.co/PorsukR/P220-ThaiOCR-9B-NVFP4
- Modelo base BF16: https://huggingface.co/PorsukR/P220-ThaiOCR-9B
- Variante FP8: https://huggingface.co/PorsukR/P220-ThaiOCR-9B-FP8
- Variante W4A16: https://huggingface.co/PorsukR/P220-ThaiOCR-9B-W4A16
- Variante GGUF: https://huggingface.co/PorsukR/P220-ThaiOCR-9B-GGUF
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de evaluación ThaiOCRBench: https://huggingface.co/datasets/typhoon-ai/ThaiOCRBench
