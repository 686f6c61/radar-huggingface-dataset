# scaryrawr/Qwen3.8-27B-oQ4e-mtp

## Resumen

El modelo `scaryrawr/Qwen3.8-27B-oQ4e-mtp` es una cuantización en formato MLX del modelo multimodal Qwen/Qwen3.8-27B, desarrollada por el usuario scaryrawr. Está diseñada específicamente para ejecutarse en hardware Apple Silicon (macOS) mediante la librería oMLX, que ofrece una cuantización afín mejorada con precisión mixta. El checkpoint conserva la torre de visión del modelo original, por lo que mantiene capacidades multimodales completas (entrada de imagen y texto, salida de texto), además del cabezal Lightning MTP (Multi-Token Prediction) que acelera la decodificación autoregresiva en solicitudes de solo texto.

Esta versión cuantizada reduce el peso del modelo a aproximadamente 4,93 mil millones de parámetros (según los archivos safetensors) y ocupa 17 GB en disco, con un consumo de memoria en runtime de 16,24 GB en un M4 Max. El autor reporta velocidades de generación de 45,1 tokens/s en código predecible y 34,4 tokens/s en prosa, lo que la convierte en una opción práctica para desarrollo local en entornos Apple. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

La relevancia de este modelo radica en su enfoque en eficiencia y velocidad para hardware de consumo, manteniendo la calidad del modelo base gracias a técnicas de calibración basadas en activaciones y sensibilidad de capas. Es una alternativa interesante para quienes necesitan un modelo multimodal de alto rendimiento sin depender de GPUs NVIDIA o servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje), basado en Qwen/Qwen3.8-27B |
| Parametros totales | 4.926.789.872 (~4,93 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (oQ4e) con precision mixta a 5-bit en 166 modulos, grupo 64 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint FP16 original de Qwen/Qwen3.8-27B, producida con oMLX, una librería de cuantización afín optimizada para Apple Silicon. La cuantización utiliza un esquema de 4 bits como base, pero aplica mejoras de precisión a 5 bits en 166 módulos seleccionados mediante un análisis de sensibilidad de capas realizado sobre un proxy seguro para RAM. El proceso de calibración emplea 128 muestras multilingües y de código de 512 tokens cada una, junto con 504 entradas de importancia, para ajustar el clipping ponderado por activaciones.

El checkpoint preserva la torre de visión del modelo original, lo que mantiene las capacidades multimodales completas, y también el cabezal Lightning MTP integrado. Este cabezal permite la predicción de múltiples tokens durante la decodificación, acelerando la generación de texto en solicitudes que no incluyen imágenes. En solicitudes con imágenes o vídeo, el modelo conserva el soporte multimodal y utiliza decodificación estándar para garantizar la estabilidad.

No se dispone de información detallada sobre el entrenamiento original del modelo base, como el número de tokens de entrenamiento o las técnicas de alineación (RLHF, DPO). El autor solo documenta el proceso de cuantización y validación local.

## Capacidades

- Generación de texto multimodal: acepta imágenes como entrada y produce respuestas textuales, manteniendo la funcionalidad completa de visión-lenguaje del modelo base.
- Razonamiento y código: el modelo base Qwen3.8-27B está diseñado para tareas de razonamiento y generación de código; esta cuantización conserva dichas capacidades (verificado con pruebas locales de aritmética y generación de código LIS).
- Aceleración por MTP: en solicitudes de solo texto, el cabezal Lightning MTP permite decodificación especulativa con hasta 3 tokens de borrador, mejorando el throughput.
- Soporte de instrucciones multilingües: la calibración incluyó muestras multilingües y se verificó el seguimiento de instrucciones en francés, aunque la lista completa de idiomas no está documentada.
- Generación de JSON estructurado: validado localmente, puede producir salidas JSON estrictas.
- Reconocimiento de colores en imágenes: verificado en pruebas locales, indica capacidad básica de percepción visual.
- Compatibilidad con oMLX: integración nativa con el ecosistema oMLX para servir el modelo en Apple Silicon.

No se confirma explícitamente el soporte de tool calling o function calling, aunque es probable que herede las capacidades del modelo base; no obstante, no está documentado en la información proporcionada.

## Casos de uso

- Desarrollo de aplicaciones macOS con IA local: al ejecutarse en Apple Silicon mediante MLX, permite integrar un asistente de código o chatbot en aplicaciones nativas sin depender de servicios externos, aprovechando la velocidad de 45 tokens/s en generación de código.
- Asistente de documentación técnica: puede procesar capturas de pantalla o diagramas y generar explicaciones textuales, útil para equipos que trabajan con documentación visual.
- Automatización de respuestas en atención al cliente: con soporte multimodal, puede analizar imágenes de productos o incidencias y generar respuestas contextualizadas, manteniendo conversaciones multi-turno.
- Generación de informes a partir de imágenes: en entornos de análisis de datos, puede extraer información de gráficos o tablas capturadas y redactar resúmenes en texto.
- Prototipado rápido de agentes conversacionales: la capacidad de generar JSON estructurado facilita la integración en pipelines de agentes que requieren salidas formateadas.
- Entornos de desarrollo con restricciones de hardware: al ocupar solo 16,24 GB de memoria en runtime, es viable en Macs con 32 GB o más, permitiendo desarrollo y pruebas locales de modelos multimodales sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor reporta únicamente pruebas locales de humo:

- Implementación LIS: 207/207 casos de corrección superados.
- Aritmética básica: superada.
- Generación de JSON estricto: superada.
- Seguimiento de instrucciones en francés: superado.
- Reconocimiento de color en imágenes: superado.

Estas pruebas no constituyen una evaluación exhaustiva y no deben considerarse comparables a benchmarks establecidos.

## Requisitos de hardware

- VRAM estimada: 16,24 GB de memoria unificada en runtime (medido en M4 Max con 128 GB).
- GPU recomendadas: exclusivamente Apple Silicon (M-series) debido al formato MLX; el modelo no está optimizado para CUDA o ROCm.
- Compatibilidad con hardware de consumo: sí, en Macs con al menos 32 GB de memoria unificada para un uso cómodo; el modelo cabe en 16 GB pero podría requerir más para contexto largo.
- Opciones de despliegue: oMLX serve (comando `omlx serve`), integrable con la librería MLX de Apple.
- Latencia y throughput: 45,1 tokens/s en código predecible y 34,4 tokens/s en prosa (M4 Max, 128 GB, con MTP activado y 3 tokens de borrador).
- Nota: el uso de MTP está disponible solo para solicitudes de solo texto; las solicitudes con imágenes usan decodificación estándar, lo que puede reducir el throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa con otros modelos de la misma categoría. El modelo base Qwen/Qwen3.8-27B es el punto de referencia natural, pero no se han publicado datos de rendimiento comparativos en la información proporcionada. Alternativas potenciales serían otras cuantizaciones MLX de modelos multimodales (p. ej., Llama 3.2 Vision en MLX), pero no hay datos disponibles para comparar.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; se heredan del modelo base Qwen, que puede presentar sesgos culturales o lingüísticos.
- Riesgo de alucinación: presente en todos los modelos generativos; no se han realizado evaluaciones específicas de alucinación en esta cuantización.
- Limitaciones de contexto: la longitud de contexto no está documentada; se desconoce si la cuantización afecta el manejo de contextos largos.
- Limitaciones de idioma: la lista de idiomas soportados no está disponible; solo se verificó el francés en pruebas locales.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe atribuir correctamente y mantener el aviso de licencia.
- Pérdida de precisión por cuantización: aunque se usan técnicas de precisión mixta, la cuantización a 4 bits puede degradar ligeramente la calidad en tareas complejas comparado con el modelo FP16.
- Dependencia de oMLX: el modelo está diseñado para oMLX; su uso con otras librerías MLX podría requerir adaptaciones y no se garantiza el soporte de MTP.
- Soporte multimodal condicionado: en solicitudes con imágenes, se desactiva MTP y se usa decodificación estándar, lo que puede afectar el rendimiento en cargas mixtas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/scaryrawr/Qwen3.8-27B-oQ4e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Librería oMLX: no se proporciona enlace directo, pero se menciona en la model card.
