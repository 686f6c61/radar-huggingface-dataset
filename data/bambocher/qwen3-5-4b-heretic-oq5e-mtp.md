# bambocher/Qwen3.5-4B-heretic-oQ5e-mtp

## Resumen

Qwen3.5-4B-heretic-oQ5e-mtp es una cuantización mixta del modelo Qwen3.5-4B, publicada por el usuario bambocher en Hugging Face. El checkpoint conserva 4.659.865.088 parámetros lógicos (4,66B) y se distribuye en formato MLX con safetensors, lo que lo orienta a la inferencia en hardware Apple Silicon. La cuantización se ha realizado con oQ (oMLX v0.7.3), una herramienta de cuantización de precisión mixta, y emplea un esquema afín con grupos de 64 pesos y una mezcla de 5, 6 y 8 bits más una fracción en BF16.

La particularidad del checkpoint es doble. Por un lado, incluye la torre de visión (0,334B de parámetros) además del modelo de lenguaje (4,206B), lo que apunta a un modelo multimodal. Por otro, incorpora una cabeza MTP (multi-token prediction) de 0,121B, una innovación orientada a la decodificación especulativa y a la aceleración de la generación. El resultado es un checkpoint de 3,8 GB con un promedio efectivo de 6,464 bits por peso.

Es relevante ahora porque combina tres tendencias actuales: cuantización de precisión mixta para preservar calidad en capas sensibles, decodificación especulativa integrada mediante MTP y despliegue local en Apple Silicon a través de MLX. No obstante, la información publicada por el autor es muy escasa: no hay model card descriptiva, ni datos de benchmarks, ni licencia declarada, lo que limita su uso en producción sin verificación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-4B), con torre de visión y cabeza MTP; formato MLX |
| Parametros totales | 4.659.865.088 (4,66B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantización mixta afín con grupo 64: 5-bit (74,563%), 6-bit (17,917%), 8-bit (0,060%), BF16 (7,459%); promedio efectivo 6,464 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), librería mlx |

## Arquitectura y entrenamiento

El checkpoint es una cuantización del modelo base Qwen3.5-4B, del que no se aportan detalles de entrenamiento en la información disponible. La arquitectura subyacente es un transformer con tres componentes diferenciados según el desglose de almacenamiento del autor: modelo de lenguaje (4,206B de pesos lógicos, 2,997 GB), torre de visión (0,334B, 0,667 GB) y cabeza MTP (0,121B, 0,101 GB). La presencia de visión y de MTP sugiere un modelo multimodal con decodificación especulativa integrada, aunque no se documenta el esquema exacto.

La innovación técnica destacable es la cuantización de precisión mixta aplicada con oQ (oMLX v0.7.3): el 74,563% de los pesos se almacenan a 5 bits, el 17,917% a 6 bits y el 7,459% se mantienen en BF16, presumiblemente para capas sensibles a la precisión (embeddings, normas o cabezas). El promedio efectivo de 6,464 bits/peso busca un equilibrio entre tamaño (3,8 GB) y fidelidad respecto al modelo original. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento: capacidades heredadas del modelo base Qwen3.5-4B, no documentadas explícitamente en la model card.
- Procesamiento de visión: el checkpoint incluye una torre de visión de 0,334B de parámetros, lo que indica soporte de entrada de imágenes.
- Decodificación especulativa: la cabeza MTP (multi-token prediction) permite predecir varios tokens por paso, lo que puede acelerar la generación.
- Inferencia en Apple Silicon: formato MLX nativo, optimizado para chips de la serie M de Apple.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Mac: el checkpoint está en formato MLX y ocupa 3,8 GB, por lo que puede ejecutarse en un Mac con Apple Silicon y memoria unificada suficiente, sin necesidad de GPU dedicada. Es adecuado para prototipado y uso personal en local.
- Asistentes multimodales de escritorio: al incluir torre de visión, puede emplearse para describir imágenes, responder preguntas sobre capturas de pantalla o extraer información de documentos escaneados en una aplicación de escritorio.
- Aceleración de generación con MTP: la cabeza multi-token prediction permite integrar decodificación especulativa en pipelines de generación para reducir la latencia en tareas de texto largo, siempre que el runtime MLX lo soporte.
- Evaluación de cuantizaciones: sirve como referencia para comparar la pérdida de calidad de una cuantización mixta de 6,464 bits frente al modelo Qwen3.5-4B original en tareas concretas.
- Prototipado de agentes con visión: combinando entrada de imágenes y generación de texto, puede usarse en pruebas de concepto de agentes que interpretan el entorno visual y responden en lenguaje natural.
- Investigación sobre decodificación especulativa: la inclusión de la cabeza MTP lo hace útil para estudiar el impacto de multi-token prediction en throughput y calidad en entornos MLX.
- Despliegue en entornos con memoria limitada: con 3,8 GB de pesos, cabe en equipos con 8-16 GB de memoria unificada, lo que facilita pruebas en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: los pesos ocupan 3,765 GB (3,507 GiB); con overhead de runtime MLX, se recomienda un mínimo de 6-8 GB de memoria unificada.
- GPU recomendadas: chips Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) con memoria unificada suficiente. No está pensado para GPU NVIDIA o AMD, ya que el formato es MLX.
- Cabe en hardware de consumo: sí, en Mac con 8 GB o más de memoria unificada; en 16 GB o más hay margen para contexto largo y la torre de visión.
- Opciones de despliegue: runtime MLX (mlx-lm y ecosistema oMLX). No es compatible directamente con vLLM, llama.cpp, Ollama o TGI sin conversión previa a otro formato.
- Latencia y throughput: no disponible en la información proporcionada; la cabeza MTP está diseñada para mejorar el throughput, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-4B-heretic-oQ5e-mtp | 4,66B (4,206B LM + 0,334B visión + 0,121B MTP) | no disponible | Mixta 5/6/8-bit + BF16 (6,464 bits/peso) | no disponible | safetensors MLX |
| Qwen3.5-4B (base) | ~4B | no disponible | Original (BF16/FP16) | no disponible | safetensors |
| Alternativas MLX de ~4B | no disponible | no disponible | no disponible | no disponible | MLX |

No se dispone de datos de benchmarks ni de especificaciones del modelo base en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica la licencia del checkpoint ni la del modelo base, lo que impide confirmar si el uso comercial está permitido. Es imprescindible verificarlo antes de cualquier despliegue en producción.
- Model card mínima: el autor solo documenta el esquema de cuantización; no hay información sobre capacidades, idiomas, contexto ni limitaciones.
- Riesgo de degradación por cuantización: aunque la precisión mixta preserva capas sensibles, el 74,563% de los pesos a 5 bits puede introducir pérdida de calidad frente al modelo original, especialmente en tareas de razonamiento o matemáticas.
- Sesgos y alucinaciones: no documentados; se heredan los del modelo base Qwen3.5-4B, que no se detallan.
- Compatibilidad limitada: el formato MLX restringe el despliegue a hardware Apple Silicon; no es portable directamente a ecosistemas CUDA.
- Sin métricas de rendimiento: no hay benchmarks que permitan validar la calidad del checkpoint ni el beneficio real de la cabeza MTP.
- Trazabilidad: el autor es un usuario individual (bambocher), no el equipo oficial de Qwen, por lo que la procedencia del modelo base y del proceso de cuantización debe verificarse de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bambocher/Qwen3.5-4B-heretic-oQ5e-mtp
- Repositorio de oQ / oMLX: https://github.com/jundot/omlx
