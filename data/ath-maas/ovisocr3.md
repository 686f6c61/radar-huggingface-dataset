# ATH-MaaS/OvisOCR3

## Resumen

OvisOCR3 es un modelo multimodal compacto de 0,8 mil millones de parámetros (852.985.920 exactos según los pesos en safetensors), desarrollado por ATH-MaaS y publicado bajo licencia Apache 2.0. Está construido como un ajuste fino del modelo base Qwen/Qwen3.5-0.8B y su propósito es unificar en una sola red cinco tareas de OCR y comprensión documental: parsing de documentos, OCR general, extracción de información clave, generación de pies de figura sobre documentos y reconstrucción de tablas que cruzan varias páginas.

La relevancia del modelo reside en su planteamiento de "un modelo, múltiples tareas": en lugar de desplegar un modelo distinto por cada tarea de digitalización documental, OvisOCR3 selecciona el comportamiento mediante prompts específicos de tarea, manteniendo un único punto de despliegue. Con solo 0,8B de parámetros alcanza resultados de estado del arte entre modelos de tamaño comparable en los cinco dominios evaluados, lo que lo hace atractivo para pipelines de ingestión documental con requisitos de coste y latencia ajustados.

El entrenamiento se organiza en cuatro etapas (pretraining continuado, mid-training, destilación on-policy y aprendizaje por refuerzo), lo que según el autor construye una base sólida en reconocimiento de texto y estructura documental antes de refinar cada capacidad con supervisión y recompensas específicas de dominio. El modelo se distribuye en formato safetensors para transformers y declara compatibilidad con vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal image-text-to-text construido sobre Qwen3.5-0.8B; tag de arquitectura `qwen3_5`) |
| Parametros totales | 852.985.920 |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo publica pesos safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (los benchmarks incluyen evaluación en inglés y chino, pero no se declara una lista oficial de idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers; compatible con vLLM) |

## Arquitectura y entrenamiento

OvisOCR3 es un modelo multimodal de tipo image-text-to-text construido sobre el transformer Qwen3.5-0.8B, al que se añade la capacidad de procesar imágenes de página y producir salidas estructuradas (Markdown con fórmulas LaTeX y tablas HTML, JSON de layout, JSON de campos extraídos, etc.). La información disponible no detalla el conector visual ni la configuración exacta del encoder de imagen; únicamente se confirma la arquitectura base y la pipeline multimodal.

El entrenamiento consta de cuatro etapas declaradas por el autor: pretraining continuado, mid-training, destilación on-policy y aprendizaje por refuerzo. Esta progresión busca primero afianzar reconocimiento de texto y comprensión de estructura documental, y después refinar cada tarea con supervisión específica de dominio y señales de recompensa. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni los detalles de las recompensas de RL.

## Capacidades

- Parsing de documentos: a partir de la imagen de una página y un prompt de modo parsing, genera JSON estructurado, JSON de layout o Markdown con fórmulas en LaTeX y tablas en HTML.
- OCR general: sobre una imagen, opcionalmente con una región delimitada, referencias, una pregunta, un idioma objetivo o etiquetas candidatas, devuelve texto, bounding boxes, LaTeX, datos de gráficos, una etiqueta o una respuesta.
- Extracción de información clave (KIE): dado un documento y, opcionalmente, campos especificados o una plantilla JSON de salida, produce registros clave-valor o JSON ajustado a la plantilla.
- Generación de pies de figura documentales: genera contenido estructurado de página con pies localizados para figuras y representaciones Mermaid para diagramas de flujo.
- Reconstrucción de tablas entre páginas: a partir de imágenes de páginas consecutivas y su Markdown parseado, produce tablas HTML completas con asociación a la página de origen o predice que no hay continuación.
- Selección de tarea mediante prompts específicos documentados en el directorio `prompts/` del repositorio.
- Compatibilidad declarada con vLLM para inferencia en producción (el ejemplo oficial usa `vllm==0.22.1`).
- No se documentan en la información disponible capacidades de tool calling, agentes multi-paso, audio ni un modo de razonamiento explícito (thinking mode).

## Casos de uso

- Digitalización masiva de archivos PDF escaneados: el modelo convierte cada página en Markdown estructurado con tablas HTML y fórmulas LaTeX, lo que permite alimentar motores de búsqueda o bases de conocimiento sin desplegar un modelo distinto para tablas y otro para texto.
- Extracción de datos de facturas y formularios: usando el modo KIE con una plantilla JSON de campos, se obtienen registros clave-valor directamente consumibles por sistemas de contabilidad o ERP, con la ventaja de que el mismo modelo cubre también el parsing previo de la página.
- Reconstrucción de tablas partidas entre páginas: en informes financieros o memorias anuales donde una tabla continúa en la página siguiente, el modelo recompone la tabla HTML completa con la asociación a cada página de origen, tarea para la que obtiene 97,07 de Relation F1 en CrossTabBench.
- Enriquecimiento de repositorios documentales con pies de figura: la generación de pies localizados y diagramas Mermaid facilita la accesibilidad y la navegación de documentación técnica, con 90,97 de F1 de localización en DocFigCapBench.
- Procesamiento de documentos multilingües inglés-chino: los benchmarks OCRBench v2 EN (65,9) y ZH (61,3) indican buen rendimiento en ambos idiomas, útil para empresas con documentación en los dos idiomas.
- Despliegue en infraestructura modesta: con 0,8B de parámetros y un repo de 1,7 GB, el modelo puede servirse en una única GPU consumer para pipelines de ingestión de alto volumen donde un modelo de mayor tamaño resultaría caro.
- Extracción de datos de gráficos: el modo OCR general admite devolver datos de gráficos a partir de una imagen, lo que sirve para recuperar series numéricas de figuras en informes.

## Benchmarks y rendimiento

Resultados publicados por el autor. `--` indica valor no reportado; la negrita marca el mejor resultado de cada columna según la model card.

Parsing de documentos:

| Modelo | OmniDocBench1.6 | MDPBench | PureDocBench | Real5-OmniDocBench |
|---|---:|---:|---:|---:|
| Qwen3.5-OCR | 91,27 | 60,60 | 68,38 | 82,48 |
| Qwen3.8-Max | 93,70 | 86,40 | 80,56 | 86,86 |
| GLM-OCR | 95,22 | 67,30 | 63,34 | 90,32 |
| PaddleOCR-VL-1.6 | 96,34 | 78,90 | 65,44 | 93,19 |
| MonkeyOCRv2-B-Parsing | 91,57 | 83,30 | 64,91 | 89,22 |
| OvisOCR2 | 96,58 | 69,00 | 75,10 | 92,29 |
| HunyuanOCR-1.5 | 94,74 | 76,80 | 67,58 | 88,53 |
| Xiaomi-OCR-0 | **96,83** | 73,00 | 74,60 | 92,73 |
| OvisOCR3 | 96,74 | **88,80** | **82,31** | **93,63** |

OCR general:

| Modelo | OCRBench | OCRBench v2 EN | OCRBench v2 ZH |
|---|---:|---:|---:|
| Qwen3.5-0.8B | 79,1 | 41,5 | 43,9 |
| Qwen3.5-2B | 85,4 | 48,1 | 55,4 |
| Qwen3.5-4B | 85,0 | 54,1 | 61,0 |
| Qwen3.5-OCR | 76,8 | 44,5 | 43,8 |
| PaddleOCR-VL-1.6 | 55,9 | 23,8 | 30,4 |
| HunyuanOCR-1.5 | 86,1 | 50,7 | 57,7 |
| GLM-OCR | 83,8 | 32,9 | 48,1 |
| Xiaomi-OCR-0 | 84,6 | 40,1 | 48,4 |
| OvisOCR3 | **88,8** | **65,9** | **61,3** |

Extracción de información clave:

| Modelo | OCRBench KIE | OCRBench v2 KIE | CC-OCR KIE | In-house KIE Bench |
|---|---:|---:|---:|---:|
| Qwen3.5-OCR | 78,50 | 72,90 | 88,43 | 59,90 |
| GLM-OCR | 79,00 | 74,22 | 68,36 | 75,25 |
| HunyuanOCR-1.5 | 81,00 | 68,63 | 66,08 | 75,96 |
| Xiaomi-OCR-0 | 76,50 | 74,66 | 79,53 | 75,68 |
| OvisOCR3 | **90,50** | **83,01** | **88,69** | **77,73** |

Pies de figura documentales:

| Modelo | DocFigCapBench Localization F1 | DocFigCapBench Caption Score |
|---|---:|---:|
| HunyuanOCR-1.5 | 48,24 | -- |
| Qwen3.5-OCR | 78,47 | 4,74 |
| OvisOCR2 | 82,18 | -- |
| MinerU2.5-Pro | 85,00 | 4,61 |
| PaddleOCR-VL-1.6 | 85,32 | 4,29 |
| Qwen3.8-Max | 86,67 | **7,30** |
| OvisOCR3 | **90,97** | 6,93 |

Reconstrucción de tablas entre páginas:

| Modelo | CrossTabBench Relation F1 (P/R) | CrossTabBench Reconstruction TEDS | MPDocBench-Parse Truncated Table TEDS |
|---|---:|---:|---:|
| PaddleOCR-VL-1.6 | 42,61 (90,13/27,90) | 24,24 | 83,39 |
| Logics-Parsing-V3 | 44,55 (90,63/29,53) | 26,10 | 88,05 |
| MinerU2.5-Pro | 59,14 (93,81/43,18) | 41,02 | 91,44 |
| MinerU2.5-Pro + MinerU-PoPo | 54,76 (97,40/38,09) | 36,42 | 91,87 |
| Qwen3.8-Max | 94,47 (90,19/99,19) | **91,71** | 89,57 |
| OvisOCR3 | **97,07** (96,20/97,96) | 89,66 | **92,04** |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 0,85B de parámetros en FP16 requiere aproximadamente 1,7 GB solo para pesos; con caché KV, procesador de imagen y overhead de runtime, el consumo real será superior.
- El ejemplo oficial de inferencia usa vLLM con `tensor_parallel_size=1` y `gpu_memory_utilization=0.8`, lo que indica que está pensado para ejecutarse en una sola GPU.
- GPU recomendadas: no disponibles de forma explícita. Por tamaño, cualquier GPU con suficiente VRAM para el runtime de vLLM debería poder servirlo; el autor no publica una lista de GPUs validadas.
- No se confirma ni descarta el funcionamiento en GPUs consumer concretas (RTX 4090, etc.); el tamaño del modelo sugiere que es viable, pero no hay dato oficial.
- Opciones de despliegue: vLLM (versión 0.22.1 en el ejemplo oficial, con `gdn_prefill_backend="triton"` y `limit_mm_per_prompt={"image": 2}`); transformers (librería declarada). No se documentan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Parsing (OmniDocBench1.6) | OCRBench | KIE (OCRBench KIE) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| OvisOCR3 | 0,85B | no disponible | 96,74 | 88,8 | 90,50 | apache-2.0 | Hugging Face (ATH-MaaS) |
| Qwen3.5-OCR | no disponible | no disponible | 91,27 | 76,8 | 78,50 | no disponible | referenciado en benchmarks |
| GLM-OCR | no disponible | no disponible | 95,22 | 83,8 | 79,00 | no disponible | referenciado en benchmarks |
| HunyuanOCR-1.5 | no disponible | no disponible | 94,74 | 86,1 | 81,00 | no disponible | referenciado en benchmarks |
| PaddleOCR-VL-1.6 | no disponible | no disponible | 96,34 | 55,9 | no evaluado en la tabla KIE | no disponible | referenciado en benchmarks |

Los datos de parámetros, contexto y licencia de los modelos comparados no figuran en la información proporcionada, por lo que se marcan como no disponibles. En rendimiento, OvisOCR3 lidera OCR general, KIE y reconstrucción de tablas entre los modelos listados, y queda muy cerca del mejor en parsing (96,74 frente a 96,83 de Xiaomi-OCR-0).

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información disponible. Al ser un modelo entrenado sobre datos documentales, es esperable que herede sesgos de esos corpus, pero no hay análisis publicado.
- Riesgo de alucinación: no cuantificado. En tareas de extracción y parsing, una salida estructurada incorrecta (campos inventados, tablas mal reconstruidas) puede pasar desapercibida si no se valida contra el documento original; se recomienda verificación posterior en producción.
- Limitaciones de contexto e idioma: no se declara longitud de contexto ni lista oficial de idiomas. Los benchmarks cubren inglés y chino; el rendimiento en otras lenguas no está evaluado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-0.8B y de los datos de entrenamiento, que no se detallan.
- El modelo depende de prompts de tarea específicos (`prompts/`); usar prompts distintos de los documentados puede degradar la calidad de las salidas.
- El ejemplo oficial fija `limit_mm_per_prompt={"image": 2}`, lo que sugiere un límite práctico de imágenes por petición en ese despliegue; no se especifica el máximo real.
- No se documentan variantes cuantizadas (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos sin GPU o con VRAM muy reducida.
- Los resultados de benchmarks son los publicados por el autor; no se han verificado de forma independiente en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ATH-MaaS/OvisOCR3
- Informe técnico (arXiv): https://arxiv.org/abs/2610.33066
- Demo online (Hugging Face Spaces): https://huggingface.co/spaces/ATH-MaaS/OvisOCR3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
