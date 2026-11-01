# PorsukR/P220-ThaiOCR-9B

## Resumen

P220-ThaiOCR-9B es un modelo vision-lenguaje de 9.653 millones de parámetros (9,65 B) especializado en el reconocimiento y la comprensión de documentos tailandeses. Lo desarrolla Porsuk Rungarunsrisuk (usuario PorsukR en HuggingFace) mediante un fine-tuning con LoRA, posteriormente fusionado, sobre el modelo base Qwen/Qwen3.5-9B, que se distribuye con licencia Apache-2.0. El modelo resuelve la digitalización y la extracción de información de documentos impresos y manuscritos: texto corrido, tablas, formularios, recibos, PDF oficiales y escaneos.

La propuesta diferencial es la precisión en un tamaño contenido. Con 9,65 B de parámetros y pesos en BF16, el autor lo sitúa como el mejor modelo abierto en ThaiOCRBench, por delante de alternativas de mayor tamaño como Qwen3.6-35B-A3B y OpenThai 2.0 27B, y lo acerca a modelos cerrados de primer nivel en tareas de transcripción. El modelo trabaja sin modo de razonamiento (thinking desactivado por defecto en su plantilla de chat) y admite contextos de hasta 32.768 tokens en el despliegue recomendado.

Es relevante ahora porque cubre un nicho poco atendido —el OCR tailandés de calidad, con manuscritos y tablas— y porque publica una familia completa de variantes cuantizadas (FP8, W4A16, NVFP4, GGUF de Q8_0 a Q2_K) calibradas específicamente con texto OCR tailandés, lo que permite desplegarlo desde una GPU Blackwell hasta una CPU o un Mac. La licencia Apache-2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje transformer (derivada de Qwen3.5-9B); detalles internos de la arquitectura no disponibles |
| Parametros totales | 9.653.104.368 (9,65 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens en el despliegue recomendado (`--max-model-len 32768`); máximo nativo no disponible |
| Tipos de cuantizacion | BF16, FP8, INT4 weight-only (W4A16), NVFP4, GGUF BF16 / Q8_0 / Q4_K_M / Q3_K_M / Q2_K |
| Idiomas soportados | Tailandés (th), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16, FP8, W4A16, NVFP4) y GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer multimodal de tipo image-text-to-text, y se ha adaptado mediante un fine-tuning con LoRA que después se fusionó con los pesos base. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO. El autor indica que el modelo se entrenó y evaluó sin modo de razonamiento, y que la plantilla de chat incluida desactiva el thinking por defecto.

La innovación técnica destacable está en el proceso de cuantización: cada variante cuantizada se generó a partir de los pesos BF16 con el objetivo explícito de preservar la calidad en OCR tailandés. Los ficheros GGUF de 4, 3 y 2 bits usan una imatrix construida con texto OCR tailandés, y W4A16 y NVFP4 se calibraron sobre el mismo tipo de texto, mientras que FP8 y GGUF Q8_0 no requieren calibración. Según el autor, todas las variantes se evaluaron sobre los conjuntos de validación completos, y el fichero más pequeño (GGUF Q2_K, 3,9 GB) obtiene menor CER que P110-ThaiOCR-4B en BF16.

## Capacidades

- Transcripción de texto impreso y manuscrito en tailandés, con preservación de cifras, encabezados y estructura.
- Salida en texto plano, Markdown o tablas HTML a partir de páginas de documento.
- Comprensión de documentos: extracción de información clave, clasificación de documentos, lectura de gráficos y diagramas.
- Procesamiento de formularios, recibos, PDF oficiales y escaneos sin reglas específicas por plantilla.
- Respuesta a preguntas sobre el contenido de un documento (document QA conversacional).
- Soporte bilingüe tailandés-inglés.
- Interfaz compatible con la API de OpenAI a través de vLLM (`/v1/chat/completions`), lo que facilita la integración en aplicaciones existentes.
- Modo de razonamiento (thinking) disponible en la plantilla pero desactivado por defecto; el modelo se entrenó y evaluó sin él.
- No se documenta soporte explícito de tool calling, function calling ni comportamiento agéntico multi-paso en la información disponible.

## Casos de uso

- Digitalización masiva de archivos gubernamentales: el modelo convierte PDF oficiales y escaneos en texto estructurado o JSON (bloques de texto, encabezados, tablas) con un prompt de página a JSON, lo que permite indexar y buscar en corpus administrativos tailandeses.
- Extracción de datos de recibos y facturas: a partir de la imagen del documento, el modelo devuelve el contenido en Markdown o tablas HTML, adecuado para alimentar sistemas de contabilidad o ERP sin definir plantillas por proveedor.
- Procesamiento de formularios manuscritos: su entrenamiento específico en handwriting tailandés permite transcribir campos rellenados a mano, útil en entornos sanitarios, bancarios o de seguros donde los formularios llegan en papel.
- Atención al cliente sobre documentación: combinado con la API compatible de OpenAI, puede responder preguntas de un usuario sobre el contenido de un documento adjunto (por ejemplo, condiciones de una póliza) manteniendo el contexto de la conversación.
- Automatización de back office en banca: clasificación y extracción de información clave de extractos, contratos y justificantes, con despliegue en FP8 o W4A16 sobre GPUs Ampere, Ada u Hopper para reducir coste por página.
- Archivística y preservación digital: transcripción completa de páginas densas con `max_tokens` ampliado, generando texto plano fiel al original para repositorios documentales.
- Despliegue en entornos sin GPU: la variante GGUF Q4_K_M permite ejecutar el modelo en CPU, Mac u Ollama, adecuado para oficinas con hardware limitado que necesitan OCR tailandés local sin enviar documentos a la nube.

## Benchmarks y rendimiento

Los datos publicados se centran en ThaiOCRBench (13 tareas, 2.808 ítems) y en la tasa de error de carácter (CER) sobre recortes de texto y páginas PDF. Todas las puntuaciones de modelos abiertos se obtuvieron con el mismo hardware y el mismo código de evaluación; los modelos cerrados se llamaron por API con las mismas imágenes, prompts y código.

| Benchmark / metrica | P220-ThaiOCR-9B | P110-ThaiOCR-4B | Qwen3.5-9B (base) | Qwen3.6-35B-A3B | GPT-6.1 Sol | GPT-6 Luna |
|---|---|---|---|---|---|---|
| ThaiOCRBench, media 13 tareas | 0,674 | 0,572 | 0,462 | 0,589 | 0,738 | por debajo de P220 (valor no disponible) |
| ThaiOCRBench, media 5 tareas de transcripcion | 0,635 | no disponible | no disponible | no disponible | 0,652 | no disponible |

Según el autor, P220 supera en la media de 13 tareas a todos los modelos abiertos comparados, incluidos Qwen3.6-35B-A3B (0,589) y OpenThai 2.0 27B, y también a GPT-6 Luna; en las cinco tareas de transcripción queda por encima de GPT-6.1 Sol en reconocimiento de texto, parsing de tablas y parsing de documentos, y por debajo en OCR de página completa y manuscrito. GPT-6.1 Sol se ejecutó con thinking en nivel bajo y el resto de modelos, P220 incluido, sin thinking; en ThaiOCRBench, 15 de los 2.808 ítems fueron filtrados por la API de Luna y puntúan 0. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks generalistas.

## Requisitos de hardware

- VRAM estimada en BF16: en torno a 19,3 GB de pesos, por lo que se recomienda una GPU de 24 GB o más (RTX 4090, L40S, A100 40 GB, H100).
- FP8: reduce aproximadamente a la mitad el peso respecto a BF16; pensado para GPUs NVIDIA Ada y Hopper (L40S, H100).
- W4A16 (INT4 weight-only): orientado a GPUs NVIDIA Ampere (A100, A10G); permite ajustar en GPUs de 16-24 GB.
- NVFP4: variante para GPUs NVIDIA Blackwell.
- GGUF: el fichero Q2_K ocupa 3,9 GB; Q4_K_M es la opción recomendada para CPU, Mac u Ollama, con Q3_K_M y Q2_K para menos memoria.
- Cabe en GPU de consumo: sí, con cuantización de 4 bits en GPUs de 16 GB o más; en BF16 requiere 24 GB.
- Opciones de despliegue: vLLM (probado con vLLM 0.29.0 y transformers 5.17.0), llama.cpp y Ollama mediante GGUF; el autor documenta el servidor vLLM con `--max-model-len 32768`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ThaiOCRBench (media 13 tareas) | Licencia | Formatos |
|---|---|---|---|---|---|
| P220-ThaiOCR-9B | 9,65 B | 32.768 tokens (despliegue) | 0,674 | Apache-2.0 | safetensors, GGUF |
| P110-ThaiOCR-4B | 4 B (aprox.) | no disponible | 0,572 | no disponible | no disponible |
| Qwen3.5-9B (base) | 9 B (aprox.) | no disponible | 0,462 | Apache-2.0 | safetensors |
| Qwen3.6-35B-A3B | 35 B totales (MoE) | no disponible | 0,589 | no disponible | no disponible |
| OpenThai 2.0 27B | 27 B | no disponible | por debajo de P220 (valor no disponible) | no disponible | no disponible |

La comparación se limita a la tarea de OCR tailandés evaluada por el autor; no hay datos públicos en la información disponible sobre rendimiento generalista de P220 frente a estos modelos.

## Limitaciones y advertencias

- Ámbito lingüístico restringido: solo tailandés e inglés; no se garantiza calidad en otros idiomas.
- Especialización estrecha: es un modelo de OCR y comprensión documental, no un modelo generalista; su rendimiento en tareas ajenas al dominio no está documentado.
- Riesgo de alucinación y de repetición descontrolada: el autor recomienda `temperature=0` y `max_tokens=4096` para evitar una repetición desbocada poco frecuente, y ampliar el límite en páginas muy densas.
- El modo de razonamiento está desactivado por defecto y el modelo se entrenó sin él; activarlo puede degradar la calidad esperada.
- Sesgos: no se documentan sesgos específicos en la información disponible; al entrenarse sobre documentos tailandeses, puede heredar sesgos de formato y de fuentes de ese corpus.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantías sobre exactitud en producción; conviene validar con un conjunto propio antes de desplegar.
- Ecosistema joven: 12 descargas y 0 likes en el momento de la consulta, con lo que la validación comunitaria es mínima.
- Dependencia de versiones concretas: probado con vLLM 0.29.0 y transformers 5.17.0; otras versiones pueden requerir ajustes.

## Enlaces

- Modelo en HuggingFace (BF16): https://huggingface.co/PorsukR/P220-ThaiOCR-9B
- Variante FP8: https://huggingface.co/PorsukR/P220-ThaiOCR-9B-FP8
- Variante W4A16: https://huggingface.co/PorsukR/P220-ThaiOCR-9B-W4A16
- Variante NVFP4: https://huggingface.co/PorsukR/P220-ThaiOCR-9B-NVFP4
- Variante GGUF: https://huggingface.co/PorsukR/P220-ThaiOCR-9B-GGUF
- Modelo predecesor P110-ThaiOCR-4B: https://huggingface.co/PorsukR/P110-ThaiOCR-4B
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset ThaiOCRBench: https://huggingface.co/datasets/typhoon-ai/ThaiOCRBench
