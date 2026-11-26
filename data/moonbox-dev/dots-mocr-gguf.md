# moonbox-dev/dots.mocr-GGUF

## Resumen

dots.mocr es un modelo vision-language especializado en parsing de documentos y OCR multilingüe, desarrollado originalmente por rednote-hilab (el laboratorio de investigación de Xiaohongshu) y publicado bajo licencia MIT. La versión aquí descrita, `moonbox-dev/dots.mocr-GGUF`, es una conversión a formato GGUF realizada por Moonbox para su uso con llama.cpp en hardware de consumo (Metal, CUDA, Vulkan y CPU), con cuantizaciones que van desde F16 hasta Q4_K_M.

El modelo combina un decoder basado en Qwen2 (1.777 millones de parámetros totales) con un vision transformer propio de dots y un módulo merger que proyecta las características visuales al espacio del decoder. La arquitectura sigue el patrón estándar de los modelos image-text-to-text: la imagen se procesa mediante el encoder visual y el resultado se inyecta como tokens en el contexto del decoder, que genera la salida textual (texto plano, JSON de layout o bounding boxes de grounding).

Su relevancia actual radica en que ofrece parsing de documentos de alta calidad (CER del 0,0 % en el conjunto de evaluación de Moonbox) en un paquete de 1,12 GB (Q4_K_M) que cabe en GPUs de consumo, con latencias de ~0,28 s por página en una RTX 3080 Laptop. Esto lo convierte en una opción práctica para pipelines de digitalización de documentos en local, sin depender de APIs externas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (decoder Qwen2 + vision transformer dots + merger) |
| Parámetros totales | 1.777.088.000 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | F16, BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | no disponible (la evaluación de Moonbox cubre inglés y chino) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo es un vision-language model con un decoder Qwen2 y un vision transformer propio de dots seguido de un módulo merger que alinea las representaciones visuales con el espacio de embeddings del decoder. En el repositorio GGUF, el decoder y el encoder se distribuyen en dos ficheros separados: el fichero del modelo (p. ej. `dots-mocr-Q8_0.gguf`) contiene el decoder Qwen2, y `mmproj-dots-mocr-F16.gguf` contiene el vision transformer y su merger, mantenido en F16 para todas las precisiones. Ambos ficheros son necesarios para la inferencia.

La conversión se realizó con llama.cpp `b12621` a partir de la revisión `7c53434cd4` del modelo original: `convert_hf_to_gguf.py` generó el BF16 y el mmproj, y `llama-quantize` produjo las demás precisiones con sus mezclas estándar, sin importance matrix. Antes de la subida se verificó que los 643 tensores del checkpoint original son byte-idénticos en el fichero BF16 y en el mmproj. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO en la información proporcionada.

## Capacidades

- Extracción de texto (OCR) de imágenes de documentos, con prompt dedicado (`prompt_ocr`).
- Parsing de layout a JSON: estructura de bloques, tablas y regiones del documento.
- Grounding: localización de elementos en la imagen mediante bounding boxes.
- Procesamiento multilingüe de documentos (evaluado en inglés y chino).
- Generación de texto condicionada por imagen mediante el pipeline `image-text-to-text`.
- Integración con llama.cpp vía `llama-mtmd-cli` y `llama-server` (endpoint `/v1/chat/completions` con partes `image_url`).
- Decodificación greedy recomendada (`--temp 0`) para tareas de extracción determinista.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Digitalización masiva de facturas y albaranes: el modelo extrae texto y estructura de layout en JSON, lo que permite alimentar sistemas de contabilidad con datos parseados; su latencia de ~0,28 s por página en Q4_K_M lo hace viable para lotes de miles de documentos en una sola GPU de consumo.
- Procesamiento de documentos en el Edge: con 1,12 GB en Q4_K_M y soporte de Metal, Vulkan y CPU, puede desplegarse en portátiles o estaciones sin GPU dedicada para escanear y extraer texto de documentos localmente, sin enviar datos sensibles a la nube.
- Extracción de tablas de informes financieros: el prompt de layout parsing a JSON permite reconstruir la estructura tabular y las regiones del documento, adecuado para pipelines de análisis de informes anuales o estados financieros.
- Grounding de elementos en formularios: la capacidad de grounding devuelve bounding boxes de campos y etiquetas, útil para automatizar la localización de casillas en formularios escaneados antes de un paso de validación.
- Indexación de archivos históricos multilingües: al estar evaluado en inglés y chino, sirve para digitalizar fondos documentales bilingües y generar índices de texto buscable con corrección de caracteres prácticamente nula (CER 0,0 % en el conjunto de evaluación).
- Servicio OCR autoalojado con API compatible con OpenAI: `llama-server` expone `/v1/chat/completions`, de modo que se puede sustituir una API OCR externa por un endpoint local sin cambiar el código cliente, reduciendo costes por página y dependencia de terceros.
- Preprocesado para RAG documental: la salida de texto y layout en JSON puede alimentar un pipeline de chunking consciente de la estructura del documento antes de la vectorización.

## Benchmarks y rendimiento

Moonbox publica una evaluación propia sobre 12 páginas sintéticas (6 en inglés y 6 en chino, renderizadas con fuentes de Windows, con ground truth exacto), con el prompt `prompt_ocr` original y decodificación greedy, ejecutada en `llama-server` sobre CUDA (RTX 3080 Laptop). La métrica es el character error rate (CER) por idioma, ignorando espacios en blanco.

| Precisión | Tamaño | CER (inglés / chino) | Texto idéntico a BF16 | Latencia (s/página, CUDA) |
|---|---|---|---|---|
| F16 | 3,56 GB | 0,0 % / 0,0 % | 6 + 6 de 12 páginas | 0,37 |
| BF16 | 3,56 GB | 0,0 % / 0,0 % | referencia | 0,38 |
| Q8_0 | 1,89 GB | 0,0 % / 0,0 % | 6 + 6 de 12 páginas | 0,30 |
| Q6_K | 1,46 GB | 0,0 % / 0,0 % | 6 + 6 de 12 páginas | 0,29 |
| Q5_K_M | 1,29 GB | 0,0 % / 0,0 % | 6 + 6 de 12 páginas | 0,28 |
| Q4_K_M | 1,12 GB | 0,0 % / 0,0 % | 6 + 6 de 12 páginas | 0,28 |

El modelo original en bf16 leyó las 12 páginas exactamente (CER 0,0 % / 0,0 %). No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: ~3,6 GB en F16/BF16, ~1,9 GB en Q8_0, ~1,5 GB en Q6_K, ~1,3 GB en Q5_K_M y ~1,1 GB en Q4_K_M para el fichero del decoder, más ~2,5 GB del `mmproj` en F16 compartido por todas las precisiones.
- GPU recomendadas: cualquier GPU con al menos ~4-5 GB de VRAM libre para las cuantizaciones bajas; el benchmark oficial se ejecutó en una RTX 3080 Laptop.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 3080 Laptop y superiores para Q4_K_M-Q8_0; también funciona en CPU y Metal.
- Opciones de despliegue: llama.cpp (`llama-mtmd-cli` y `llama-server`), con soporte de Metal, CUDA, Vulkan y CPU; requiere llama.cpp `b12621` o superior.
- Latencia y throughput: ~0,28-0,38 s por página en RTX 3080 Laptop según precisión (medido por Moonbox); no se dispone de datos de throughput agregado.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de benchmarks ni especificaciones de modelos alternativos comparables (otros OCR vision-language de tamaño similar), por lo que la comparativa cuantitativa no está disponible. Como referencia cualitativa, el propio autor lo sitúa como SOTA en parsing de documentos multilingüe entre modelos de tamaño comparable, pero no se aportan las cifras ni los modelos de comparación.

| Modelo | Parámetros | Contexto | Licencia | Formato GGUF |
|---|---|---|---|---|
| dots.mocr (este) | 1,777 mil M | no disponible | MIT | sí |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La evaluación publicada por Moonbox se limita a 12 páginas sintéticas en inglés y chino; no hay evidencia de rendimiento en documentos reales, manuscritos, baja resolución o idiomas distintos del inglés y el chino.
- No se dispone de información sobre sesgos del modelo ni sobre el dataset de entrenamiento original.
- Riesgo de alucinación inherente a los modelos generativos: en OCR puede omitir, duplicar o inventar texto en imágenes degradadas; se recomienda validación posterior en producción.
- La longitud de contexto no está documentada, lo que dificulta planificar el procesamiento de páginas de muy alta resolución o documentos de varias páginas en una sola pasada.
- La licencia MIT permite uso comercial, pero los ficheros GGUF son un derivado del modelo original y heredan su licencia; conviene revisar la model card original para condiciones adicionales.
- El `mmproj` se mantiene en F16 (2,52 GB) para todas las precisiones, por lo que el ahorro de memoria de las cuantizaciones bajas es menor de lo que sugiere el tamaño del fichero del decoder.
- Se requiere llama.cpp `b12621` o superior; versiones anteriores pueden no cargar correctamente el modelo o el mmproj.
- No se han publicado datos sobre tool calling, agentes ni capacidades de audio, por lo que no deben asumirse.

## Enlaces

- Repositorio GGUF: https://huggingface.co/moonbox-dev/dots.mocr-GGUF
- Modelo base: https://huggingface.co/dots-studio/dots.mocr
- Modelo original (rednote-hilab): https://huggingface.co/rednote-hilab/dots.mocr
- Repositorio GitHub: https://github.com/rednote-hilab/dots.mocr
- Paper (arXiv): https://arxiv.org/abs/2603.13032v1
- Demo en vivo: https://dotsocr.xiaohongshu.com
- llama.cpp: https://github.com/ggml-org/llama.cpp
