# opendatalab/MinerU2.5-Pro-2605-1.2B

## Resumen

MinerU2.5-Pro-2605-1.2B es un modelo multimodal de tipo image-text-to-text desarrollado por OpenDataLab, el laboratorio de datos abiertos asociado a Shanghai AI Laboratory. Está especializado en el parseo de documentos a escala: convierte imágenes de páginas (PDF escaneados, capturas, documentos maquetados) en representaciones estructuradas, incluyendo detección de layout, reconocimiento de texto, análisis de gráficos y tablas. Es la versión 2605 del modelo, publicada el 21 de mayo de 2026 como actualización de la versión 2604.

El modelo emplea la arquitectura Qwen2-VL (tag `qwen2_vl` en Hugging Face), con 1.156.026.624 parámetros totales según los pesos en safetensors, lo que lo sitúa en la categoría de modelos compactos de visión-lenguaje. Su tamaño reducido permite desplegarlo en hardware modesto, algo relevante para pipelines de ingesta documental de alto volumen donde el coste por página es un factor crítico.

La relevancia actual del modelo radica en su enfoque *data-centric*: el informe técnico (arXiv:2604.04771) plantea que la mejora en parseo de documentos a gran escala proviene principalmente de la calidad y volumen de los datos de entrenamiento más que del escalado del modelo. La versión 2605 corrige errores de clasificación de categorías en la detección de layout y amplía sustancialmente la capacidad de análisis de imágenes (gráficos, diagramas de flujo y sellos), según la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2-VL (vision-language transformer, tag `qwen2_vl`) |
| Parametros totales | 1.156.026.624 (1,16 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2-VL, un transformer multimodal que procesa imágenes y texto conjuntamente para tareas de image-text-to-text. Con 1,16 mil millones de parámetros, se trata de una variante compacta orientada a inferencia eficiente en producción. El repositorio ocupa 4,6 GB, coherente con pesos en precisión bf16/fp16 para ese número de parámetros.

El entrenamiento sigue un enfoque declaradamente *data-centric*, según el título del informe técnico ("Pushing the Limits of Data-Centric Document Parsing at Scale"). La versión 2605 incorpora dos cambios principales respecto a la 2604: un proceso exhaustivo de limpieza de datos para reducir errores de clasificación en la detección de layout (con reducción significativa de la tasa de falsos negativos en la categoría `image_block`), y la construcción de un dataset a gran escala para análisis de imágenes que mejora el reconocimiento de gráficos, diagramas de flujo y sellos. No se dispone de datos sobre número de tokens de entrenamiento, composición exacta del dataset ni uso de RLHF/DPO en la información proporcionada.

## Capacidades

- Parseo de documentos: conversión de imágenes de páginas a representaciones estructuradas con detección de layout.
- Detección de layout: identificación y clasificación de bloques de contenido (texto, imágenes, tablas) en la página.
- Reconocimiento de texto (OCR) en documentos maquetados y escaneados.
- Análisis de imágenes: reconocimiento de gráficos, diagramas de flujo y sellos (mejorado en la versión 2605).
- Procesamiento multimodal image-text-to-text mediante la librería transformers.
- Soporte de conversación multi-turno (tag `conversational`).
- Idiomas: chino e inglés.
- Compatibilidad con Text Generation Inference (tag `text-generation-inference`) y endpoints compatibles.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión avanzada o audio: no disponible (solo se documenta visión para parseo documental).

## Casos de uso

- Digitalización masiva de archivos PDF: el modelo procesa páginas escaneadas y extrae layout y texto estructurado, adecuado para pipelines de ingesta de grandes volúmenes documentales gracias a su tamaño compacto de 1,16 B de parámetros.
- Extracción de tablas y gráficos de informes financieros: la mejora en análisis de imágenes de la versión 2605 permite reconocer gráficos y diagramas, útil para convertir informes anuales en datos estructurados.
- Construcción de corpus para entrenamiento de LLM: el parseo de documentos a escala alimenta pipelines de curación de datos, alineado con el enfoque data-centric del proyecto.
- Procesamiento de documentación técnica y científica: extracción de secciones, figuras y diagramas de flujo de papers y manuales, con soporte para chino e inglés.
- Automatización de back-office documental: clasificación de bloques de contenido en facturas, formularios y contratos escaneados para su posterior procesamiento por sistemas RPA.
- Detección de sellos y elementos gráficos en documentos oficiales: la versión 2605 amplía el reconocimiento de sellos, útil en verificación documental administrativa.
- Despliegue en infraestructura modesta: con 1,16 B de parámetros y licencia Apache 2.0, puede servirse en GPUs de gama media para tareas de OCR estructurado en entornos con restricciones de coste.

## Benchmarks y rendimiento

La model card incluye una imagen de leaderboard (`leaderboard.png`) y el tag `eval-results`, pero los valores numéricos concretos no están disponibles en el texto proporcionado. Por tanto:

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 1,16 B de parámetros, los pesos en bf16 ocupan aproximadamente 2,3 GB, y en fp32 unos 4,6 GB (cálculo derivado del tamaño de parámetros, no dato del autor).
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada por el autor; el tamaño de parámetros sugiere que podría caber en GPUs de consumo con VRAM suficiente, pero no hay dato oficial.
- Opciones de despliegue: transformers (librería declarada), Text Generation Inference (tag `text-generation-inference`) y endpoints compatibles. Soporte de vLLM, llama.cpp u Ollama: no disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MinerU2.5-Pro-2605-1.2B | 1,16 B | no disponible | Apache 2.0 | Hugging Face, ModelScope |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Idiomas limitados: solo chino e inglés; no se documenta soporte de castellano ni de otras lenguas.
- Especialización estrecha: orientado a parseo de documentos; no es un modelo de propósito general para razonamiento, código o matemáticas.
- Riesgo de alucinación: como modelo generativo multimodal, puede producir contenido incorrecto en la transcripción de texto o en la interpretación de gráficos; requiere validación en producción.
- Errores de clasificación de layout: la propia model card reconoce que la versión 2604 tenía problemas de clasificación de categorías, corregidos en 2605; conviene verificar el comportamiento en dominios documentales específicos.
- Longitud de contexto no documentada: limita la planificación de pipelines con páginas de alta densidad.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones del proyecto MinerU y las dependencias asociadas.
- Sin datos de benchmarks publicados en el texto disponible: dificulta la evaluación previa a la adopción.
- Sesgos: no documentados en la información proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/opendatalab/MinerU2.5-Pro-2605-1.2B
- ModelScope: https://modelscope.cn/models/OpenDataLab/MinerU2.5-Pro-2605-1.2B
- Informe técnico (arXiv): https://arxiv.org/abs/2604.04771
- Leaderboard (imagen): https://hotelll.github.io/MinerU2.5-Pro/leaderboard.png
- Logo del proyecto: https://hotelll.github.io/MinerU2.5-Pro/MinerU25-Pro-LOGO.png
