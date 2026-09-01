# Gramscii-IT/dots.mocr-GGUF

## Resumen

dots.mocr es un modelo multimodal de OCR (image-text-to-text) desarrollado por el equipo de studio-dots-ai (también conocido como RedNote HiLab). Su objetivo es el parseo completo de documentos: no solo reconoce texto, sino que también interpreta elementos visuales como tablas, gráficos, diagramas, fórmulas e iconos, preservando las relaciones semánticas entre ellos. El modelo se basa en un LLM de 1.700 millones de parámetros (arquitectura Qwen2) combinado con un proyector multimodal específico para visión, lo que lo convierte en una solución ligera y eficiente para tareas de OCR y comprensión de documentos.

La versión GGUF aquí descrita es una conversión de los pesos originales publicados en `dots-studio/dots.mocr`, realizada por Gramscii-IT mediante las herramientas de llama.cpp. No se ha modificado el modelo; solo se ha cambiado el contenedor de pesos y se han añadido variantes cuantizadas (f16 y Q8_0). Esta conversión permite ejecutar el modelo con llama.cpp y sus derivados (llama-server, Ollama, etc.) en hardware modesto, incluidas GPUs de consumo. El modelo original también está disponible en formato safetensors para su uso con Transformers y vLLM.

La relevancia actual de dots.mocr radica en su enfoque integral del parseo documental, superando las limitaciones de los OCR tradicionales que solo extraen texto. Su tamaño compacto (1.77B) lo hace atractivo para despliegues en entornos con recursos limitados, y su licencia personalizada (dots.mocr-license-agreement) debe revisarse antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (LM) + proyector multimodal DOTS_OCR |
| Parametros totales | 1.777.088.000 (1,77B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0 (en este repo); el original incluye safetensors |
| Idiomas soportados | multilingüe (según el proyecto original, sin lista detallada) |
| Licencia | dots.mocr-license-agreement (licencia personalizada, no estándar) |
| Formato de pesos | GGUF (f16, Q8_0) para llama.cpp; safetensors en el repo original |

## Arquitectura y entrenamiento

El modelo combina un LLM base de 1,77B parámetros con arquitectura Qwen2 (según la conversión GGUF) y un proyector multimodal denominado `dots_ocr`. Este proyector se encarga de transformar las características visuales extraídas de las imágenes en representaciones que el LLM puede procesar. La arquitectura está diseñada específicamente para tareas de OCR y parseo de documentos, tratando elementos visuales (tablas, gráficos, diagramas, iconos) como objetivos de primera clase, no como simples regiones de píxeles.

No se dispone de información detallada sobre el proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) en la documentación proporcionada. El repositorio de GitHub menciona que el modelo se basa en un LLM de 1.7B y que ha logrado un rendimiento SOTA en tareas de parseo de documentos multilingües, pero no se ofrecen más detalles técnicos. El paper asociado (arXiv:2603.13032v1) describe el método, aunque no se ha accedido a su contenido completo.

## Capacidades

- OCR multimodal: extrae texto de imágenes y documentos, incluyendo texto impreso y manuscrito.
- Parseo de layout: identifica y estructura regiones como párrafos, títulos, tablas, figuras y fórmulas.
- Reconocimiento de tablas: extrae datos tabulares con estructura fila-columna.
- Comprensión de gráficos y diagramas: interpreta elementos visuales como gráficos de barras, líneas, circulares, etc.
- Soporte multilingüe: según el proyecto original, el modelo es multilingüe, aunque no se especifica la lista de idiomas.
- Procesamiento de documentos completos: puede analizar páginas enteras y devolver una representación estructurada (por ejemplo, en formato Markdown o similar).
- Integración con llama.cpp: al ser una conversión GGUF, se puede ejecutar localmente con llama-server, Ollama u otras herramientas compatibles.

## Casos de uso

- Digitalización de archivos históricos: el modelo puede convertir documentos escaneados en texto estructurado, preservando tablas y notas al margen, lo que facilita la búsqueda y el archivado digital.
- Extracción de datos de facturas y recibos: dado su capacidad para interpretar tablas y campos clave, puede automatizar la captura de información en procesos de contabilidad y gestión de gastos.
- Análisis de informes financieros: al comprender gráficos y tablas, permite extraer métricas y tendencias de informes anuales o trimestrales sin intervención manual.
- Accesibilidad para personas con discapacidad visual: convierte documentos impresos en texto legible por lectores de pantalla, incluyendo la descripción de elementos gráficos.
- Procesamiento de formularios administrativos: puede rellenar bases de datos a partir de formularios escaneados, identificando campos y valores de forma automática.
- Generación de versiones Markdown de documentos técnicos: útil para migrar documentación en PDF a formatos editables, manteniendo la estructura de tablas y listas.
- Asistente de investigación: permite extraer información de artículos científicos, incluyendo ecuaciones y tablas de resultados, para su posterior análisis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio de GitHub menciona un rendimiento SOTA en tareas de parseo de documentos multilingües, pero no se proporcionan cifras concretas (MMLU, HumanEval, etc.) ni comparaciones con otros modelos. Se recomienda consultar el paper original o el repositorio del proyecto para obtener datos de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: con la cuantización Q8_0, el modelo principal ocupa ~1,9 GB y el proyector multimodal ~1,3 GB, totalizando ~3,2 GB. Con f16, el total asciende a ~6 GB (3,5 GB + 2,5 GB).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar la versión Q8_0 (por ejemplo, GTX 1650, RTX 3050, RTX 4060). Para f16 se recomienda 8 GB o más (RTX 3060, RTX 4070, etc.).
- Compatibilidad con GPU de consumo: sí, cabe en la mayoría de GPUs modernas de gama media y alta.
- Opciones de despliegue: llama.cpp (llama-server, llama-cli), Ollama (si se importa el GGUF), y cualquier herramienta compatible con GGUF. Para vLLM o Transformers, se debe usar el repositorio original con pesos safetensors.
- Latencia y throughput: no se dispone de datos medidos. En una GPU como RTX 4060, se espera una latencia de decodificación de unos pocos tokens por segundo, pero depende del tamaño de la imagen y la complejidad del documento.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos de OCR o VLM. Como referencia cualitativa, dots.mocr (1,77B) es significativamente más pequeño que modelos como LLaVA-NeXT (7B-34B) o Qwen-VL (7B-72B), lo que lo hace más ligero y adecuado para entornos con recursos limitados. Sin embargo, su especialización en parseo de documentos y su licencia restrictiva lo diferencian de alternativas de propósito general. No se dispone de datos de benchmarks comparativos en la información proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: el modelo se distribuye bajo la `dots.mocr-license-agreement`, una licencia personalizada que no es de código abierto estándar. Es obligatorio revisar sus términos antes de cualquier uso, especialmente comercial.
- Sesgos y alucinaciones: como todo modelo de lenguaje, puede generar texto incorrecto o inventar contenido, especialmente en documentos con baja calidad de imagen o formatos inusuales.
- Limitaciones de contexto: no se ha especificado la longitud de contexto del modelo, por lo que documentos muy largos podrían exceder la ventana de atención.
- Idiomas: aunque se declara multilingüe, no se detalla la lista de idiomas soportados ni su rendimiento relativo. Es posible que el rendimiento varíe significativamente entre idiomas.
- Dependencia de la calidad de imagen: el OCR es sensible a la resolución, el contraste y la orientación de las imágenes. Imágenes de baja calidad pueden degradar la precisión.
- Compatibilidad de la conversión GGUF: la versión GGUF requiere una build de llama.cpp con soporte para `PROJECTOR_TYPE_DOTS_OCR` (b8731 o posterior). No es compatible con vLLM ni Transformers.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/Gramscii-IT/dots.mocr-GGUF
- Modelo original en Hugging Face: https://huggingface.co/dots-studio/dots.mocr
- Repositorio de GitHub del proyecto: https://github.com/studio-dots-ai/dots.mocr
- Repositorio de GitHub de dots.ocr (base): https://github.com/studio-dots-ai/dots.ocr
- Paper en arXiv: https://arxiv.org/html/2603.13032v1
- Licencia del modelo: https://huggingface.co/dots-studio/dots.mocr/blob/e539fbb52280393adc081b289ec597430a0f9031/dots.mocr%20LICENSE%20AGREEMENT
- PR de llama.cpp para soporte de DotsOCR: https://github.com/ggml-org/llama.cpp/pull/17575
