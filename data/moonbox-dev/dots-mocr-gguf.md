# moonbox-dev/dots.mocr-GGUF

## Resumen

dots.mocr es un modelo de visión-lenguaje especializado en el análisis de documentos (document parsing) y en la conversión de gráficos estructurados a código SVG, desarrollado por el equipo rednote-hilab (Xiaohongshu). Resuelve el problema de extraer texto, estructura y semántica de imágenes de documentos complejos (tablas, gráficos, interfaces, figuras científicas) de forma multilingüe, superando a modelos de tamaño comparable en tareas de parsing de documentos. Esta ficha describe la versión GGUF publicada por moonbox-dev, que empaqueta los pesos originales para su ejecución con llama.cpp.

El modelo combina un decodificador de tipo Qwen2 con un vision transformer propio de dots (más su merger), lo que da un total de 1.777.088.000 parámetros. La versión GGUF separa el decodificador (fichero de modelo) del codificador visual (fichero `mmproj-*` en F16), de modo que ambos ficheros son necesarios para la inferencia. Es relevante ahora porque permite ejecutar un modelo OCR/document parsing de calidad SOTA en hardware de consumo (Metal, CUDA, Vulkan, CPU) mediante llama.cpp, sin depender de infraestructura de servidor.

La publicación incluye además una variante específica para image-to-SVG (dots.mocr-svg) y un paper asociado (arXiv:2603.13032). La licencia es MIT, lo que facilita su integración en productos comerciales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador Qwen2 + vision transformer de dots con merger (visión-lenguaje) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (original); el repositorio menciona otras precisiones generadas con `llama-quantize` (mezclas estándar), pero solo se detalla BF16 y F16 para el encoder |
| Idiomas soportados | no disponible en la información proporcionada (el benchmark de la model card usa inglés y chino) |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp), con fichero `mmproj` separado para el encoder visual en F16 |

## Arquitectura y entrenamiento

El modelo es un sistema visión-lenguaje compuesto por dos partes: un decodificador de lenguaje basado en Qwen2 y un vision transformer propio de dots junto con su módulo merger, que proyecta las representaciones visuales al espacio del decodificador. En la conversión a GGUF, el decodificador se empaqueta en el fichero de modelo y el encoder visual se mantiene en un `mmproj` en F16 compartido por todas las precisiones. Los 643 tensores del checkpoint original son byte-idénticos en el fichero BF16 y en el `mmproj`, según verificación del autor de la cuantización.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card original menciona que el modelo cubre grounding, reconocimiento, comprensión semántica y diálogo interactivo, y que existe una variante optimizada para image-to-SVG. La conversión GGUF se realizó con llama.cpp `b12621` usando `convert_hf_to_gguf.py` y `llama-quantize` sin importance matrix.

## Capacidades

- Extracción de texto (OCR) multilingüe a partir de imágenes de documentos.
- Parsing de documentos con salida estructurada, incluido layout parsing a JSON.
- Conversión de gráficos estructurados (charts, layouts de UI, figuras científicas) a código SVG.
- Grounding: localización de elementos en la imagen.
- Comprensión semántica del contenido del documento.
- Diálogo interactivo sobre la imagen (pipeline image-text-to-text, endpoints compatibles con `/v1/chat/completions`).
- Ejecución en CPU, CUDA, Metal y Vulkan mediante llama.cpp.
- Soporte de prompts específicos para OCR, layout parsing y grounding (definidos en `dots_mocr/utils/prompts.py` del modelo original).

## Casos de uso

- Digitalización de archivos y facturas: el modelo extrae texto y estructura de páginas escaneadas con un prompt de OCR y decodificación greedy, integrándose en un pipeline de ingesta documental.
- Parsing de documentos a JSON: útil para convertir layouts complejos (tablas, columnas, formularios) en datos estructurados consumibles por sistemas downstream.
- Conversión de gráficos a SVG: permite reconstruir charts y figuras científicas como código vectorial editable, por ejemplo para regenerar figuras en publicaciones o dashboards.
- Procesamiento on-device con llama.cpp: al caber en hardware de consumo, se puede desplegar en estaciones de trabajo con GPU consumer o incluso en CPU para tareas de OCR por lotes.
- Extracción de texto multilingüe (inglés y chino en el benchmark): adecuado para corpus documentales bilingües o internacionales.
- Grounding de elementos en interfaces: localizar componentes en capturas de UI para tareas de automatización o accesibilidad.
- Asistente de lectura de documentos: diálogo multi-turno sobre el contenido de una imagen de documento mediante el endpoint compatible con chat completions.

## Benchmarks y rendimiento

La model card del GGUF reporta un benchmark propio sobre 12 páginas sintéticas (6 en inglés y 6 en chino) con verdad de referencia exacta, usando el prompt `prompt_ocr` y decodificación greedy, ejecutado en `llama-server` sobre CUDA (RTX 3080 Laptop):

| Precision | Fichero | Tamano | CER (inglés / chino) | Igual que BF16 | Latencia |
|---|---|---|---|---|---|
| BF16 | `dots-mocr-BF16.gguf` | 3.56 GB | 0.0 % / 0.0 % | 0.0 % | 0.38 s por página (CUDA) |
| Encoder | `mmproj-dots-mocr-F16.gguf` | 2.52 GB | — | — | compartido por todas las precisiones |

La model card original incluye una tabla de Elo en benchmarks de document parsing (olmOCR-Bench, OmniDocBench v1.5, XDocParse) comparando con MonkeyOCR-pro-3B, GLM-OCR y PaddleOCR-VL-1.5, pero los valores completos no están disponibles en la información proporcionada; no se reproducen cifras parciales.

## Requisitos de hardware

- VRAM estimada: el fichero BF16 ocupa 3.56 GB y el encoder F16 2.52 GB, por lo que se necesita aproximadamente 6 GB solo para pesos; las precisiones cuantizadas reducen el fichero del decodificador, pero el `mmproj` se mantiene en F16 (2.52 GB) en todas ellas.
- GPU recomendadas: el benchmark se ejecutó en una RTX 3080 Laptop; cabe en GPUs consumer con al menos ~6-8 GB de VRAM efectiva según precisión y overhead de contexto.
- Cabe en GPU consumer: sí, en tarjetas tipo RTX 3080/4090 y similares; también puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp (`llama-mtmd-cli`, `llama-server`) con soporte Metal, CUDA, Vulkan y CPU; requiere llama.cpp `b12621` o superior. Endpoints compatibles con `/v1/chat/completions`.
- Latencia y throughput: 0.38 s por página en CUDA (RTX 3080 Laptop) con BF16 según el benchmark del autor; no se dispone de más datos de throughput.

## Comparativa con modelos similares

La model card original compara con los siguientes modelos en benchmarks de document parsing (Elo):

| Modelo | olmOCR-Bench | OmniDocBench v1.5 | XDocParse | Licencia |
|---|---|---|---|---|
| dots.mocr | no disponible en la información | no disponible en la información | no disponible en la información | MIT |
| MonkeyOCR-pro-3B | 895.0 | 811.3 | 637.1 | no disponible |
| GLM-OCR | 884.2 | 972.6 | 820.7 | no disponible |
| PaddleOCR-VL-1.5 | 897.3 | 997.9 | 866 (valor truncado) | no disponible |

Los valores de dots.mocr no están completos en la información proporcionada, por lo que no se puede establecer la comparación numérica directa. En cuanto a parámetros, dots.mocr tiene 1.777 millones de parámetros frente a los ~3B de MonkeyOCR-pro-3B.

## Limitaciones y advertencias

- El benchmark del GGUF es muy reducido (12 páginas sintéticas con fuentes de Windows) y no representa la variabilidad de documentos reales.
- No se dispone de información sobre sesgos del modelo ni sobre su comportamiento fuera de inglés y chino.
- Riesgo de alucinación inherente a los modelos visión-lenguaje, especialmente en documentos con baja calidad de imagen o layouts atípicos.
- El encoder visual se mantiene en F16 en todas las precisiones, lo que fija un suelo de memoria de 2.52 GB.
- La longitud de contexto no está documentada en la información disponible.
- Aunque la licencia es MIT, los ficheros son derivados del modelo original y heredan su licencia; conviene revisar la model card original para condiciones adicionales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria de las cuantizaciones más allá de la verificación de tensores del autor.
- Requiere llama.cpp `b12621` o superior; versiones anteriores pueden no cargar el modelo correctamente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/moonbox-dev/dots.mocr-GGUF
- Modelo original: https://huggingface.co/dots-studio/dots.mocr
- Variante SVG: https://huggingface.co/rednote-hilab/dots.mocr-svg
- Paper: https://arxiv.org/abs/2603.13032v1
- Repositorio GitHub: https://github.com/rednote-hilab/dots.mocr
- Demo: https://dotsocr.xiaohongshu.com
- llama.cpp: https://github.com/ggml-org/llama.cpp
