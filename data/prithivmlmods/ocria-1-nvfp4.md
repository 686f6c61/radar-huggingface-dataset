# prithivMLmods/OCRia-1-NVFP4

## Resumen

OCRia-1-NVFP4 es una compilación cuantizada en NVFP4 del modelo OCRia-1 de LlamaIndex, un modelo multimodal de tipo image-text-to-text especializado en el parseo de documentos a partir de imágenes de página. Parte de la arquitectura Qwen3.5-4B y ha sido cuantizado con GPTQ y el esquema NVFP4 mediante llm-compressor, con el objetivo de reducir el consumo de memoria y acelerar la inferencia en hardware NVIDIA Blackwell (SM120, GB202, B200, B300). El resultado es un checkpoint de 5.295.564.288 parámetros totales (aproximadamente 5,3 mil millones) distribuido en dos shards safetensors de 5 GB y 3,43 GB, más un módulo auxiliar MTP de 241 MB para decodificación especulativa.

El modelo resuelve un problema concreto: convertir documentos complejos (tablas, gráficos, diagramas, fórmulas matemáticas y manuscritos) en Markdown estructurado directamente desde la imagen de la página, sin depender de motores OCR externos ni de capas de texto incrustadas en el PDF. Según la model card, el modelo original fue entrenado sobre 100.979 páginas reales y sintéticas mediante SFT, aprendizaje por refuerzo GRPO y promediado de checkpoints, y produce tablas y gráficos como HTML, diagramas como Mermaid y expresiones matemáticas y manuscritos como LaTeX.

Su relevancia actual radica en dos factores. Por un lado, ofrece una alternativa de pesos abiertos a los pipelines OCR propietarios para tareas de document parsing de alta fidelidad. Por otro, esta variante NVFP4 está pensada para desplegarse en GPUs Blackwell, incluyendo estaciones de trabajo como la RTX PRO 6000, lo que facilita la inferencia local de un modelo multimodal de 5,3 mil millones de parámetros con pesos de 4 bits. La licencia es la OCRia-1 Model and Code License, una licencia personalizada que conviene revisar antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivada de Qwen3.5-4B, con módulo visual y MTP para decodificación especulativa |
| Parametros totales | 5.295.564.288 (aprox. 5,3 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4 (esquema de 4 bits con GPTQModifier, block_size 128, weight_observer imatrix_mse, dampening_frac 0.01); pesos en float8_e4m3fn para determinadas capas; capas visuales y lm_head excluidas de la cuantización |
| Idiomas soportados | Inglés (en) |
| Licencia | ocria-1-license (OCRia-1 Model and Code License) |
| Formato de pesos | safetensors (dos shards: model-00001-of-00002.safetensors de 5 GB y model-00002-of-00002.safetensors de 3,43 GB), más model_mtp.safetensors de 241 MB |

## Arquitectura y entrenamiento

La arquitectura es un transformer multimodal de tipo image-text-to-text construido sobre Qwen3.5-4B, con un codificador visual integrado y un módulo de Multi-Token Prediction (MTP) que habilita decodificación especulativa. El pipeline declarado es image-text-to-text, y el procesador multimodal (processor_config.json) gestiona la entrada de imágenes de página junto con el prompt textual. La cuantización se aplica exclusivamente a las capas `Linear`, dejando fuera `lm_head` y todas las capas cuyo nombre coincide con `.*visual.*`, de modo que el codificador visual conserva mayor precisión. El esquema NVFP4 emplea GPTQ con calibración (requires_calibration_data: true), block_size de 128, dampening_frac de 0,01 y observador de pesos imatrix_mse.

El modelo original OCRia-1, del que deriva esta compilación, fue entrenado sobre 100.979 páginas reales y sintéticas combinando SFT, aprendizaje por refuerzo con GRPO y promediado de checkpoints. No se especifica en la información disponible el número total de tokens de entrenamiento ni la composición detallada del dataset más allá de esa cifra de páginas. La innovación técnica destacable de esta variante es la combinación de cuantización NVFP4 con GPTQ para preservar la precisión cerca de los pesos de precisión completa, junto con el soporte de decodificación especulativa mediante MTP para acelerar la generación en hardware Blackwell.

## Capacidades

- Parseo de documentos a Markdown estructurado directamente desde imágenes de página, sin OCR externo ni capa de texto del PDF.
- Conversión de tablas y gráficos a HTML dentro del Markdown de salida.
- Conversión de diagramas a sintaxis Mermaid.
- Conversión de expresiones matemáticas y manuscritos a LaTeX.
- Procesamiento multimodal image-text-to-text con plantilla de chat conversacional (chat_template.jinja).
- Decodificación especulativa mediante módulo MTP (Multi-Token Prediction).
- Cuantización NVFP4 con soporte declarado para text-generation-inference y vLLM.
- Capacidad multilingüe limitada: el modelo declara únicamente inglés como idioma soportado.
- No se documenta en la información disponible soporte explícito de tool calling, function calling ni razonamiento agéntico multi-paso.

## Casos de uso

- Digitalización de facturas y albaranes: el modelo recibe la imagen de la página y devuelve Markdown con las tablas convertidas a HTML, lo que permite extraer líneas de detalle y totales sin montar un motor OCR separado ni depender de la capa de texto del PDF.
- Conversión de informes financieros con gráficos: al renderizar gráficos como HTML dentro del Markdown, se puede alimentar un pipeline posterior que parsee esas tablas y series para análisis o almacenamiento en bases de datos.
- Procesamiento de documentación técnica con diagramas: los diagramas se emiten como Mermaid, de modo que el resultado puede renderizarse directamente en wikis, repositorios o generadores de documentación estáticos.
- Extracción de fórmulas científicas y apuntes manuscritos: la salida en LaTeX facilita la reutilización en artículos, cuadernos de laboratorio o plataformas de publicación científica.
- Ingesta documental para RAG: el Markdown estructurado generado por página puede trocearse y indexarse en sistemas como LlamaIndex, lo que encaja con el ecosistema del modelo base y con la etiqueta LlamaIndex del repositorio.
- Despliegue local en estaciones de trabajo Blackwell: al estar cuantizado en NVFP4 y ocupar aproximadamente 8,4 GB en pesos, puede ejecutarse en GPUs como la RTX PRO 6000 para procesar documentos confidenciales sin enviar imágenes a servicios externos.
- Automatización de archivado y cumplimiento: la conversión por lotes de páginas escaneadas a Markdown con tablas en HTML permite generar índices de texto buscables sobre archivos históricos.

## Benchmarks y rendimiento

La model card indica que el modelo original OCRia-1 alcanza 85,24 en ParseBench 2 y 84,65 en ParseBench 1, posicionándose como el mejor modelo de pesos abiertos en esas evaluaciones. Esos resultados pertenecen al modelo original y, según el propio autor, no han sido verificados de forma independiente sobre esta compilación NVFP4.

| Benchmark | OCRia-1 (original) | OCRia-1-NVFP4 |
|---|---|---|
| ParseBench 2 | 85,24 | No verificado en esta compilación |
| ParseBench 1 | 84,65 | No verificado en esta compilación |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks generales para esta variante.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos suman aproximadamente 8,4 GB (5 GB + 3,43 GB) más 241 MB del módulo MTP; conviene prever margen adicional para el codificador visual, el procesador de imágenes y la caché KV.
- GPU recomendadas: hardware NVIDIA Blackwell con soporte NVFP4, es decir, SM120, GB202, B200 y B300, además de estaciones de trabajo como la RTX PRO 6000, tal como indica la model card.
- Compatibilidad con GPU de consumo: no se documenta en la información disponible; el esquema NVFP4 requiere hardware Blackwell, por lo que GPUs de generaciones anteriores no podrían ejecutar esta cuantización de forma nativa.
- Opciones de despliegue: transformers, vLLM y text-generation-inference (TGI), según las etiquetas y la model card; el modelo se generó con llm-compressor y usa compressed-tensors.
- Latencia y throughput: no disponibles. La decodificación especulativa mediante MTP está declarada como soportada, pero no se aportan cifras de aceleración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OCRia-1-NVFP4 | 5,3 mil millones | No disponible | Document parsing multimodal cuantizado en NVFP4 | ocria-1-license | Hugging Face (prithivMLmods) |
| OCRia-1 (original) | No disponible en la información | No disponible | Document parsing multimodal en precisión completa | ocria-1-license | Hugging Face (llamaindex) |
| Qwen3.5-4B | 4 mil millones (según denominación) | No disponible | Modelo base multimodal/texto | Apache 2.0 | Hugging Face (Qwen) |

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de contexto para establecer una comparación cuantitativa con alternativas de la misma categoría. La comparación con Qwen3.5-4B es relevante porque es el modelo base declarado, pero no se detallan sus capacidades de parseo documental.

## Limitaciones y advertencias

- Los resultados de ParseBench 1 y ParseBench 2 corresponden al modelo original y no han sido verificados de forma independiente sobre esta compilación NVFP4; la cuantización puede degradar la fidelidad del parseo.
- El modelo declara únicamente inglés como idioma soportado, lo que limita su uso con documentos en castellano u otras lenguas sin evaluación previa.
- No se documenta la longitud de contexto, un dato crítico para documentos de varias páginas o prompts largos.
- Riesgo de alucinación inherente a los modelos generativos: puede inventar celdas de tabla, fórmulas o texto que no aparecen en la imagen, especialmente en documentos de baja calidad o con manuscritos.
- La licencia es la OCRia-1 Model and Code License, una licencia personalizada; es necesario revisar sus términos antes de cualquier uso comercial o redistribución.
- El esquema NVFP4 depende de hardware Blackwell; en GPUs de generaciones anteriores el modelo no podrá ejecutarse con esta cuantización.
- El codificador visual queda excluido de la cuantización, pero el resto de capas lineales se comprime a 4 bits, lo que puede afectar a la precisión en tablas densas o gráficos complejos.
- No se documenta soporte de tool calling ni de flujos agénticos, por lo que no debe asumirse su disponibilidad en producción.
- El repositorio registra 0 descargas en el momento de la consulta, lo que indica una validación comunitaria muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prithivMLmods/OCRia-1-NVFP4
- Modelo base OCRia-1: https://huggingface.co/llamaindex/OCRia-1
- Licencia OCRia-1: https://huggingface.co/llamaindex/OCRia-1/blob/main/LICENSE
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia Apache 2.0 de Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- llm-compressor (repositorio): https://github.com/vllm-project/llm-compressor
