# DatasetMan/QGO-8B

## Resumen

QGO-8B es un modelo de visión-lenguaje multimodal (image-text-to-text) desarrollado por DatasetMan, derivado del modelo base Qwen/Qwen3-VL-8B-Thinking mediante entrenamiento con GRPO (Group Relative Policy Optimization). El checkpoint publicado corresponde al paso global 200 del entrenamiento y está pensado para mejorar la robustez del OCR multilingüe y el razonamiento visual sobre documentos e interfaces gráficas. Su relevancia actual reside en que ofrece una alternativa de 8B parámetros con mejoras cuantificadas en tareas de OCR tradicional y basado en visión, dentro del marco de evaluación PM4Bench.

El modelo mantiene la arquitectura Qwen3VLForConditionalGeneration del base, con 8.767.123.696 parámetros y pesos en formato BF16 repartidos en cuatro shards safetensors. La model card no especifica la longitud de contexto ni los idiomas concretos soportados, aunque el tag de HuggingFace indica capacidades multilingües. El entrenamiento se realizó con 32 prompts y 8 rollouts por prompt, dando 256 trayectorias por paso, con AdamW y una tasa de aprendizaje de 1e-6, sobre ocho GPUs.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3VLForConditionalGeneration |
| Parametros totales | 8.767.123.696 |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16) |
| Idiomas soportados | Multilingüe (idiomas concretos no especificados) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (cuatro shards BF16) |

## Arquitectura y entrenamiento

QGO-8B se basa en la arquitectura Qwen3VLForConditionalGeneration, una red transformer multimodal que procesa tanto texto como imágenes. El modelo hereda la estructura del Qwen3-VL-8B-Thinking, que incorpora un mecanismo de razonamiento explícito antes de generar la respuesta final. El entrenamiento se realizó con GRPO, una variante de optimización por preferencia que utiliza recompensas grupales en lugar de un crítico separado. El conjunto de datos empleado es DatasetMan/PM4Bench-QGO-Train, con 32 prompts y 8 rollouts por prompt, lo que genera 256 trayectorias por paso de entrenamiento, con AdamW y learning rate de 1e-6 en BF16 sobre ocho GPUs.

El checkpoint liberado corresponde al paso global 200, y la model card recomienda usar el chat template oficial del modelo base con decodificación greedy para la evaluación en PM4Bench. No se mencionan innovaciones adicionales como decodificación especulativa o atención lineal; el interés principal es la adaptación del modelo base a tareas de OCR multilingüe.

## Capacidades

- Generación de texto condicionada por imágenes (image-to-text).
- OCR robusto en múltiples idiomas, con mejoras sobre el modelo base en las tareas de PM4Bench.
- Razonamiento visual y de documentos, incluyendo interpretación de capturas de pantalla y documentos tradicionales.
- Multilingüismo declarado en los metadatos, aunque no se detallan los idiomas concretos.
- No se menciona soporte para tool calling, function calling ni capacidades de agente en la información disponible.

## Casos de uso

- Digitalización de documentos históricos multilingües: el modelo puede transcribir documentos escaneados en varios idiomas, reduciendo la intervención manual en procesos de archivado digital.
- Extracción de información de facturas y recibos: gracias a su mejora en OCR, puede automatizar la captura de datos clave de imágenes de documentos comerciales.
- Automatización de QA en interfaces gráficas (MGUI): el rendimiento en la tarea MGUI de PM4Bench (80.00) lo hace adecuado para verificar visualmente el estado de aplicaciones web o de escritorio.
- Accesibilidad para personas con discapacidad visual: puede convertir imágenes de texto en salida legible por lectores de pantalla, con mejor tolerancia a idiomas distintos.
- Análisis de capturas de pantalla para testing de software: permite comparar el contenido visual esperado con el real en pipelines de integración continua.
- Razonamiento sobre documentos académicos o técnicos: su capacidad de responder preguntas sobre imágenes de documentos (MIQA) facilita la creación de asistentes de investigación.

## Benchmarks y rendimiento

La model card incluye resultados auditados del paper PM4Bench. Las métricas son: MDUR (porcentaje), MIQA (puntuación de juicio en escala 10-100), MSOCR (escala 0-40) y MGUI (porcentaje). Se comparan con el modelo base Qwen3-VL-8B-Thinking.

| Modelo | MDUR trad. | MDUR vision | MIQA trad. | MIQA vision | MSOCR | MGUI |
|---|---|---|---|---|---|---|
| Qwen3-VL-8B-Thinking | 38.55 | 34.88 | 53.63 | 47.69 | 1.53 | 78.30 |
| QGO-8B | 46.82 | 40.84 | 55.24 | 51.06 | 8.17 | 80.00 |

Los resultados muestran una mejora consistente en todas las tareas, especialmente en MSOCR (de 1.53 a 8.17) y en MDUR tradicional (de 38.55 a 46.82). No se han publicado benchmarks adicionales como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- Los pesos completos en BF16 ocupan aproximadamente 17,5 GB, por lo que se necesita al menos 24 GB de VRAM para cargar el modelo sin cuantización.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) o GPUs de mayor capacidad.
- En GPU de consumo como la RTX 3090 (24 GB) o RTX 4090 se puede ejecutar en BF16, aunque el espacio libre para KV cache y generación será limitado.
- El modelo es compatible con la librería transformers (probado con la versión 4.57.6), por lo que puede desplegarse con herramientas que soporten este ecosistema, como vLLM o TGI, aunque no se confirma explícitamente en la documentación.
- No se han publicado datos de latencia o throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Mejora en OCR |
|---|---|---|---|---|
| QGO-8B | 8.767 M | no disponible | Apache-2.0 | +6.64 en MSOCR vs base |
| Qwen3-VL-8B-Thinking (base) | 8.767 M | no disponible | Apache-2.0 | Referencia base |

No se dispone de datos de otros modelos de 8B comparables con la misma tarea (OCR multilingüe) en la información proporcionada. Los resultados de PM4Bench solo se comparan con el modelo base Qwen3-VL-8B-Thinking.

## Limitaciones y advertencias

- Hereda las limitaciones y riesgos del modelo base Qwen, incluyendo posibles sesgos en los datos de entrenamiento.
- No se garantiza una mejora en todas las tareas downstream ni en todos los idiomas; la mejora observada es específica de las tareas de PM4Bench.
- Las salidas de coordenadas, transcripciones OCR y razonamiento de larga duración deben validarse antes de su uso en aplicaciones de alto impacto.
- No se especifica la longitud de contexto soportada, lo que obliga a probar la ventana real antes de usarla en producción con documentos extensos.
- El modelo no incluye soporte para tool calling ni agentes, por lo que no es adecuado para pipelines que requieran llamadas a herramientas externas.
- La licencia Apache-2.0 permite uso comercial, pero hay que revisar las condiciones del modelo base Qwen3-VL-8B-Thinking para asegurar la compatibilidad de uso.

## Enlaces

- Repositorio del modelo: https://huggingface.co/DatasetMan/QGO-8B
- Dataset de entrenamiento: https://huggingface.co/datasets/DatasetMan/PM4Bench-QGO-Train
- Código de evaluación PM4Bench: https://github.com/opendatalab/PM4Bench
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Thinking
