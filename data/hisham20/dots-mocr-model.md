# Hisham20/dots-mocr-model

## Resumen

dots.mocr es un modelo multimodal de OCR y parsing de documentos desarrollado por rednote-hilab, el laboratorio de inteligencia artificial de Xiaohongshu (RedNote). Está diseñado para convertir documentos complejos en texto estructurado y, como característica distintiva, transformar gráficos estructurados como diagramas, layouts de interfaz de usuario y figuras científicas en código SVG. El modelo tiene aproximadamente 3.040 millones de parámetros (3.039.179.264) y se distribuye en formato safetensors bajo licencia MIT. Según los datos publicados, alcanza un rendimiento superior al de otros modelos de tamaño comparable en benchmarks de parsing de documentos como olmOCR-Bench, OmniDocBench y XDocParse. La longitud de contexto no se especifica en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (tipo exacto no especificado) |
| Parametros totales | 3.039.179.264 (≈3,04 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés, chino, multilingüe |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. Por los tags y la librería asociada, se trata de un modelo basado en Transformers multimodal (image-text-to-text) que requiere código personalizado (custom_code) para su carga e inferencia. El README indica que sus capacidades abarcan grounding, reconocimiento, comprensión semántica y diálogo interactivo. No se proporcionan datos sobre el corpus de entrenamiento, el número de tokens ni la aplicación de técnicas como RLHF o DPO. El modelo se presenta junto a una variante adicional, dots.mocr-svg, optimizada específicamente para tareas de conversión de imágenes a SVG.

## Capacidades

- OCR y parsing de documentos multilingüe en inglés, chino y otros idiomas.
- Reconocimiento de layout, tablas y fórmulas matemáticas.
- Conversión de gráficos estructurados (gráficos de datos, layouts de interfaz, figuras científicas) a código SVG.
- Grounding: localización y referencia de elementos dentro de la imagen.
- Comprensión semántica del contenido documental.
- Diálogo interactivo en formato image-text-to-text, que permite consultas conversacionales sobre el documento.
- No se menciona soporte explícito de tool calling, function calling ni razonamiento multi-paso como agente.

## Casos de uso

- Digitalización de archivos científicos: extraer texto, tablas y fórmulas de artículos antiguos escaneados, gracias a su capacidad de reconocimiento de fórmulas y layout.
- Conversión de diagramas técnicos a SVG: en diseño de ingeniería o documentación, permite editar y reutilizar gráficos vectoriales.
- Automatización de procesos documentales en banca: extraer datos de tablas y gráficos de informes financieros para alimentar pipelines de datos.
- Accesibilidad: convertir documentos escaneados en texto estructurado para lectores de pantalla, mejorando la accesibilidad de contenido impreso.
- Ingeniería inversa de interfaces de usuario: transformar capturas de pantalla de aplicaciones en código SVG para prototipado o análisis de diseño.
- Integración en sistemas RAG: preprocesar PDFs complejos para extraer contenido estructurado que pueda indexarse y consultarse mediante recuperación aumentada.
- Análisis de documentos legales: extraer cláusulas, encabezados y estructura jerárquica de contratos o sentencias.

## Benchmarks y rendimiento

| Modelo | olmOCR-Bench | OmniDocBench (v1.5) | XDocParse | Promedio |
|---|---|---|---|---|
| MonkeyOCR-pro-3B | 895.0 | 811.3 | 637.1 | 781.1 |
| GLM-OCR | 884.2 | 972.6 | 820.7 | 892.5 |
| PaddleOCR-VL-1.5 | 897.3 | 997.9 | 866.4 | 920.5 |
| HuanyuanOCR | 997.6 | 1003.9 | 951.1 | 984.2 |
| dots.ocr | 1041.1 | 1027.2 | 1190.3 | 1086.2 |
| dots.mocr | 1104.4 | 1059.0 | 1210.7 | 1124.7 |
| Gemini 3 Pro | 1180.4 | 1128.0 | 1323.7 | 1210.7 |

Nota: los resultados de Gemini 3 Pro, PaddleOCR-VL-1.5 y GLM-OCR se obtuvieron vía APIs, mientras que HuanyuanOCR se evaluó mediante inferencia local. La evaluación Elo se realizó con Gemini 3 Flash como juez. El README también incluye una tabla de olmOCR-bench por categorías, pero los datos de dots.mocr no están completos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: los pesos en safetensors ocupan aproximadamente 6,1 GB, por lo que se necesita al menos 8 GB de VRAM para inferencia en precisión fp16/bf16. Se recomienda más VRAM si se usan lotes grandes o secuencias largas.
- Para cuantización: no se ofrecen tipos de cuantización en la información disponible, por lo que no se puede estimar con precisión el ahorro de VRAM.
- GPU recomendadas: RTX 4090 (24 GB) o A100 40/80 GB para uso cómodo; una RTX 3060 12 GB podría funcionar con cuantización si se dispone de ella.
- Despliegue: se puede usar con Transformers mediante código personalizado (custom_code). No se mencionan integraciones con vLLM, Ollama o llama.cpp.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento promedio Elo |
|---|---|---|---|---|
| dots.mocr | ~3,04B | no disponible | MIT | 1124.7 |
| MonkeyOCR-pro-3B | ~3B | no disponible | no disponible | 781.1 |
| PaddleOCR-VL-1.5 | no disponible | no disponible | no disponible | 920.5 |
| dots.ocr | no disponible | no disponible | no disponible | 1086.2 |

dots.mocr supera a los modelos de su categoría en los benchmarks Elo, situándose por debajo de Gemini 3 Pro en la comparativa general.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos específicos; al estar entrenado principalmente en inglés y chino, puede presentar sesgos lingüísticos y culturales en otros idiomas.
- Como todo modelo OCR, existe riesgo de alucinación en imágenes de baja calidad, con texto borroso o layouts ambiguos.
- La longitud de contexto no está especificada, lo que puede limitar el procesamiento de documentos muy extensos.
- El modelo requiere código personalizado para su carga, lo que puede dificultar su integración en plataformas estándar como vLLM o TGI sin adaptaciones.
- El repositorio de HuggingFace consultado (Hisham20/dots-mocr-model) no es el repositorio oficial; el original es rednote-hilab/dots.mocr. Se recomienda verificar la procedencia de los pesos antes de usarlos en producción.
- La licencia MIT permite uso comercial, pero hay que revisar las dependencias y el código asociado para asegurar el cumplimiento.

## Enlaces

- Modelo en HuggingFace (copia): https://huggingface.co/Hisham20/dots-mocr-model
- Modelo original en HuggingFace: https://huggingface.co/rednote-hilab/dots.mocr
- Repositorio GitHub: https://github.com/rednote-hilab/dots.mocr
- Repositorio alternativo: https://github.com/studio-dots-ai/dots.mocr
- Paper: https://arxiv.org/abs/2603.13032v1
- Demo en vivo: https://dotsocr.xiaohongshu.com
- Perfil de X: https://x.com/rednotehilab
- Perfil de RedNote: https://www.xiaohongshu.com/user/profile/683ffe42000000001d021a4c
