# prithivMLmods/LightOnOCR-3-4B-MTP-Repacked

## Resumen

LightOnOCR-3-4B-MTP-Repacked es un repositorio derivado del modelo LightOnOCR-3-4B de LightOn (lightonai), un modelo de visión-lenguaje especializado en OCR de extremo a extremo. Este repositorio concreto, mantenido por prithivMLmods, reempaqueta los pesos originales en formato Transformers (safetensors) e incorpora cabeceras de Multi-Token Prediction (MTP) para habilitar decodificación especulativa sin necesidad de un modelo borrador separado, además de ofrecer una colección completa de cuantizaciones GGUF para inferencia local. El modelo base se construye sobre la arquitectura Qwen3.5-4B y cuenta con 4.659.865.088 parámetros totales.

El modelo resuelve el problema de la transcripción y comprensión de documentos complejos (tablas, recibos, formularios, documentos multicolumna y notación matemática) mediante un único modelo en lugar de pipelines multi-etapa. Con un prompt vacío realiza transcripción de texto de alta calidad; con el prompt `grounding` genera cajas delimitadoras etiquetadas para todos los elementos del documento, descripciones de imágenes y extracción de datos numéricos de gráficas en tablas HTML estructuradas.

Es relevante ahora porque combina OCR de alta precisión con comprensión visual avanzada en un modelo de solo 4B parámetros bajo licencia Apache 2.0, lo que permite despliegue en hardware modesto. La integración de MTP en los GGUF acelera la inferencia local sin la sobrecarga de gestionar un modelo draft independiente, y la compatibilidad con Transformers y vLLM facilita su integración en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-4B) con capacidades de visión-lenguaje y cabeceras MTP |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q3_K_L, Q3_K_M, Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S, Q6_K, Q8_0 (GGUF); BF16 (safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (3 shards), GGUF (incluye mmproj-bf16 para visión) |

## Arquitectura y entrenamiento

El modelo base LightOnOCR-3-4B se construye sobre la arquitectura Qwen3.5-4B, un transformer denso adaptado para tareas de imagen-a-texto. Incorpora un proyector multimodal (mmproj) que conecta el codificador visual con el modelo de lenguaje. El repositorio repackeado añade cabeceras de Multi-Token Prediction (MTP), que predicen múltiples tokens futuros en un único forward pass, integrando la decodificación especulativa directamente en los pesos del modelo en lugar de requerir un modelo draft separado.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. El modelo está optimizado para procesar documentos preprocesados a 400 DPI con una dimensión máxima objetivo de 2048 píxeles, lo que sugiere un entrenamiento orientado a documentos de alta resolución.

## Capacidades

- Transcripción OCR de extremo a extremo de alta calidad, activada con un prompt vacío.
- Comprensión visual avanzada mediante el prompt `grounding`: genera cajas delimitadoras etiquetadas para todos los elementos del documento.
- Generación de descripciones cortas para imágenes dentro de documentos.
- Extracción de datos numéricos de gráficas en tablas HTML estructuradas.
- Procesamiento de layouts complejos: tablas, recibos, formularios, documentos multicolumna y notación matemática.
- Decodificación especulativa integrada mediante MTP para acelerar la inferencia local.
- Compatibilidad con Transformers y vLLM.
- Soporte de inferencia local mediante llama.cpp a través de los GGUF.

## Casos de uso

- Digitalización de archivos de recibos y facturas: el modelo transcribe texto de recibos y formularios con layouts irregulares, y con el prompt `grounding` extrae campos etiquetados con sus coordenadas para su posterior procesamiento estructurado.
- Extracción de tablas de informes financieros: convierte tablas complejas y datos numéricos de gráficas en tablas HTML estructuradas, adecuado para pipelines de análisis de datos que necesitan tablas legibles por máquina.
- Procesamiento de documentos académicos multicolumna: maneja layouts de dos o más columnas y notación matemática, útil para digitalizar papers y preservar la estructura del contenido.
- Automatización de entrada de datos en formularios: con las cajas delimitadoras etiquetadas del modo `grounding`, se pueden mapear campos de formularios a bases de datos sin post-procesamiento geométrico adicional.
- Despliegue en hardware de consumo para OCR local: las cuantizaciones GGUF desde Q3_K_M (2,32 GB) hasta Q8_0 (4,61 GB) permiten ejecutar el modelo en equipos con recursos limitados mediante llama.cpp, con la aceleración MTP integrada.
- Enriquecimiento de bases documentales con descripciones de imágenes: genera descripciones cortas de las imágenes incrustadas en documentos, útil para indexación y búsqueda semántica de contenido visual.
- Servicio de OCR a escala con vLLM: la compatibilidad con vLLM y TGI permite desplegar el modelo como servicio de inferencia con batching para volúmenes altos de documentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,3 GB solo para pesos (4,66B parámetros × 2 bytes), más el proyector multimodal (676 MB en BF16) y el espacio para el contexto y activaciones.
- VRAM estimada con GGUF Q4_K_M (2,78 GB): viable en GPUs de consumo con 6-8 GB de VRAM, sumando el mmproj-bf16 (676 MB).
- VRAM estimada con GGUF Q8_0 (4,61 GB): requiere aproximadamente 6-7 GB de VRAM incluyendo el proyector visual.
- GPUs recomendadas: A100 o H100 para despliegue en BF16 con vLLM y batching; RTX 4090 para BF16 en una sola GPU; RTX 3060/4060 o superiores para cuantizaciones Q4/Q5.
- Cabe en GPU de consumo: sí, con cuantizaciones GGUF desde Q3_K_M (2,32 GB) en adelante.
- Opciones de despliegue: Transformers, vLLM, llama.cpp (GGUF con MTP), text-generation-inference.
- Latencia y throughput: no disponible. La decodificación especulativa MTP está diseñada para acelerar la inferencia local, pero no se proporcionan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| LightOnOCR-3-4B-MTP-Repacked | 4,66B | no disponible | Apache 2.0 | safetensors, GGUF | MTP integrado, grounding, cuantizaciones amplias |
| lightonai/LightOnOCR-3-4B (base) | 4,66B (aprox.) | no disponible | Apache 2.0 | safetensors | Modelo original sin repack MTP ni GGUF |
| Alternativas de OCR VLM de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de información sobre benchmarks comparativos con otros modelos de OCR en la documentación proporcionada, por lo que no es posible establecer comparaciones de rendimiento cuantitativas.

## Limitaciones y advertencias

- El modelo solo soporta inglés (`en`) según la model card; el rendimiento en otros idiomas no está garantizado.
- Riesgo de alucinación inherente a los modelos de lenguaje: puede generar texto o descripciones no presentes en el documento original, especialmente en documentos de baja calidad o layouts atípicos.
- El rendimiento óptimo depende del preprocesamiento a 400 DPI con dimensión máxima de 2048 píxeles; documentos con otras resoluciones pueden degradar la precisión.
- La longitud de contexto no está documentada, lo que dificulta planificar el procesamiento de documentos de muchas páginas en una sola pasada.
- Este repositorio es un repack de terceros (prithivMLmods), no el repositorio oficial de LightOn; para producción se recomienda validar la fidelidad de los pesos frente al modelo base original.
- Aunque la licencia Apache 2.0 permite uso comercial, deben revisarse las condiciones del modelo base original y de los datasets de entrenamiento subyacentes.
- No se han publicado resultados de benchmarks en la información disponible, por lo que la calidad relativa frente a alternativas no está cuantificada.
- El uso de MTP requiere soporte específico en el runtime de llama.cpp; no todos los backends lo aprovechan.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/prithivMLmods/LightOnOCR-3-4B-MTP-Repacked
- Modelo base: https://huggingface.co/lightonai/LightOnOCR-3-4B
- Carpeta GGUF: https://huggingface.co/prithivMLmods/LightOnOCR-3-4B-MTP-Repacked/tree/main/GGUF
- Organización LightOn en Hugging Face: https://huggingface.co/lightonai
