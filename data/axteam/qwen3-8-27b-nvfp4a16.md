# axteam/Qwen3.8-27B-NVFP4A16

## Resumen

Qwen3.8-27B-NVFP4A16 es una cuantización de 4 bits del modelo multimodal Qwen/Qwen3.8-27B, publicada por el equipo axteam. Se distribuye como checkpoint listo para servir con vLLM y emplea el esquema NVFP4A16 (W4A16): pesos en FP4 (E2M1) con grupo de 16, escala FP8 E4M3 por grupo y escala global FP32 por tensor, mientras que las activaciones permanecen en BF16. El objetivo es reducir el espacio en disco y la huella de memoria del modelo original para facilitar su despliegue en infraestructura de inferencia con GPUs NVIDIA modernas.

El modelo base es un transformer híbrido denso de aproximadamente 27.800 millones de parámetros que combina atención lineal (GatedDeltaNet/SSM) con atención completa, incorpora una torre de visión y una cabeza de predicción multi-token (MTP). Es, por tanto, un modelo image-text-to-text con capacidad conversacional. La cuantización es post-entrenamiento (PTQ) con AWQ para la protección de canales salientes, y no implica reentrenamiento.

La relevancia de esta ficha radica en que documenta un compromiso explícito entre tamaño y calidad: el checkpoint ocupa unos 28,6 GB en disco frente a los 84 GB del repositorio original, pero el propio autor advierte de una degradación media del 5 % en los benchmarks medidos y de una caída severa en GSM8K (49,81 frente a 70,43 en BF16). Es una opción a considerar cuando el objetivo prioritario es reducir memoria, no maximizar la fidelidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención lineal GatedDeltaNet/SSM + atención completa), denso, multimodal (visión) con cabeza MTP |
| Parametros totales | 27.781.427.952 (~27,8 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | NVFP4A16 (W4A16): pesos FP4 E2M1, grupo 16, escala FP8 E4M3 + escala global FP32, activaciones BF16; formato compressed-tensors `nvfp4-pack-quantized` |
| Idiomas soportados | No disponible en la información proporcionada (el corpus de calibración es de mezcla con predominio de coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), librería transformers |
| Modelo base | Qwen/Qwen3.8-27B |
| Tamano en disco | ~28,6 GB (repositorio: 84,0 GB) |
| Parametros mantenidos en BF16 | Torre y proyector de visión, cabeza MTP, RMSNorms, embeddings, LM head y toda la ruta de atención lineal (~32 % de los parámetros) |
| Calibracion | 256 muestras (corpus mixto con predominio de coreano) |
| Runtime probado | vLLM 0.32.0 (arquitectura disponible desde vLLM ≥ 0.17.0) |
| Requisitos de software | Python 3.11–3.14, torch 2.13 (build CUDA 13.0), transformers ≥5.16.1,<5.20, compressed-tensors 0.17.0 |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura híbrida que alterna capas de atención lineal basadas en GatedDeltaNet/SSM con capas de atención completa, lo que reduce el coste computacional en secuencias largas manteniendo la capacidad de atención global. Sobre ese esqueleto se añaden tres componentes: una torre de visión con su proyector para entrada image-text-to-text, una cabeza de predicción multi-token (MTP) orientada a decodificación especulativa y un conjunto de RMSNorms estándar. El checkpoint es denso, sin mezcla de expertos.

Esta variante no ha sido reentrenada: es una cuantización post-entrenamiento (PTQ) con AWQ, que usa un conjunto de calibración de 256 muestras sin gradientes para proteger los canales de pesos más salientes antes del redondeo a FP4. La decisión técnica más destacable es qué se deja en BF16: además de la torre de visión, el proyector, la cabeza MTP, los RMSNorms, los embeddings y el LM head, se mantiene íntegra la ruta de atención lineal (`linear_attn.*`), porque FP4 resulta demasiado grueso para los pesos del SSM. En total, cerca del 32 % de los parámetros permanece sin cuantizar. El tokenizador, la `chat_template` y el `generation_config` son idénticos a los del modelo original; el `config.json` añade únicamente el bloque `quantization_config`.

La revisión del 1 de noviembre de 2026 reconstruyó el checkpoint para corregir una pérdida de precisión en las normas suavizadas de la capa 7, provocada por un canal con ganancia cero en la normalización de escalas de AWQ. Los canales con ganancia original cero quedan ahora fuera de dicha normalización, de modo que las normas suavizadas conservan su precisión BF16. Cualquier descarga anterior a la revisión `10aff8f` debe repetirse.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat idéntica a la del modelo original.
- Comprensión de imágenes y texto combinados (pipeline image-text-to-text): descripción, respuesta a preguntas visuales y razonamiento sobre contenido gráfico.
- Razonamiento y matemáticas, si bien la cuantización degrada de forma notable el rendimiento aritmético (ver benchmarks).
- Capacidad multilingüe heredada del modelo base; el conjunto de evaluación incluye pruebas en inglés y coreano (KMMLU, HAE-RAE), pero la lista oficial de idiomas no está disponible.
- Cabeza de predicción multi-token (MTP), pensada para decodificación especulativa y aceleración de la generación.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.
- Entrada de audio: no disponible; el pipeline declarado es únicamente image-text-to-text.

## Casos de uso

- Servicio de inferencia multimodal en producción con vLLM: el checkpoint está empaquetado en `nvfp4-pack-quantized` y probado con vLLM 0.32.0, de modo que puede desplegarse directamente con `--tensor-parallel-size` para repartir los 28,6 GB de pesos entre varias GPUs.
- Asistentes conversacionales con entrada de imágenes: la torre de visión y el proyector se conservan en BF16, por lo que tareas como responder preguntas sobre capturas de pantalla, documentos escaneados o fotografías mantienen la fidelidad del modelo original en esa ruta.
- Despliegue en GPUs de gama profesional con memoria limitada: al no requerir núcleos tensoriales FP4 (funciona desde Turing, sm75), permite servir un modelo de 27,8 B en hardware que no podría alojar el BF16 completo.
- Reducción de coste de almacenamiento y distribución: 28,6 GB frente a 84 GB del repositorio original facilita la réplica del checkpoint en varios nodos y la carga en memoria en menos tiempo.
- Evaluación comparativa de técnicas de cuantización: el repositorio publica métricas de fidelidad (perplejidad, acuerdo top-1) y de benchmarks frente a FP8-dynamic, AWQ-8bit, NVFP4 y AWQ-4bit, lo que lo hace útil como referencia metodológica.
- Prototipado de pipelines image-text-to-text con decodificación especulativa: la cabeza MTP se mantiene en BF16 y puede explotarse para acelerar la generación en entornos vLLM.
- Tareas de clasificación y respuesta de opción múltiple en inglés y coreano: los resultados en MMLU, ARC-Challenge, Winogrande, KMMLU y HAE-RAE se mantienen cerca del BF16 (99,4–100,5 % de recuperación), por lo que es adecuado para evaluaciones de conocimiento y razonamiento general en esos idiomas.

## Benchmarks y rendimiento

Medidos con lm-evaluation-harness sobre vLLM, decodificación greedy, prompts de estilo completion sin plantilla de chat. MMLU corresponde a la variante generativa (`mmlu_generative`), no comparable con puntuaciones obtenidas por log-verosimilitud. Los porcentajes entre paréntesis indican recuperación respecto al BF16 original.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit | NVFP4A16 (este repo) | NVFP4 | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot, generativo) | 62,42 | 62,15 (99,6 %) | 62,48 (100,1 %) | 62,55 (100,2 %) | 63,47 (101,7 %) | 63,40 (101,6 %) |
| GSM8K (5-shot, estricto) | 70,43 | 76,88 (109,1 %) | 70,81 (100,5 %) | 49,81 (70,7 %) | 47,54 (67,5 %) | 76,42 (108,5 %) |
| ARC-Challenge (0-shot) | 58,62 | 58,36 (99,6 %) | 58,79 (100,3 %) | 58,70 (100,1 %) | 57,76 (98,5 %) | 59,56 (101,6 %) |
| Winogrande (5-shot) | 79,08 | 79,56 (100,6 %) | 79,32 (100,3 %) | 79,48 (100,5 %) | 80,03 (101,2 %) | 79,72 (100,8 %) |
| KMMLU (5-shot, directo) | 65,72 | 65,71 (100,0 %) | 65,77 (100,1 %) | 65,37 (99,5 %) | 64,82 (98,6 %) | 65,19 (99,2 %) |
| HAE-RAE (0-shot) | 76,35 | 76,54 (100,2 %) | 76,90 (100,7 %) | 75,89 (99,4 %) | 75,80 (99,3 %) | 76,44 (100,1 %) |
| **Media** | **68,77** | **69,87 (101,6 %)** | **69,01 (100,3 %)** | **65,30 (95,0 %)** | **64,90 (94,4 %)** | **70,12 (102,0 %)** |

Métricas de fidelidad frente al original BF16 sobre un conjunto interno mixto inglés/coreano de 100 prompts (respuestas greedy del BF16 puntuadas con cada build, mismo código de evaluación; este build medido sobre los ficheros reconstruidos con vLLM 0.32 el 2026-11-01):

| Métrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor = más cercano) | 1,3723 | 1,3586 (+1,0 %) |
| Acuerdo top-1 en el siguiente token | 95,7 % | 99,4 % |

## Requisitos de hardware

- VRAM para pesos: 28,6 GB. Hay que añadir la caché KV (crece con la longitud de contexto y el número de peticiones concurrentes) y varios GB para activaciones y gráficas CUDA.
- GPUs compatibles: NVIDIA Turing (sm75) o superior. No se requiere soporte de núcleos tensoriales FP4 porque la cuantización es weight-only. V100 (sm70) no está soportada.
- GPUs recomendadas: en la información disponible solo se ha ejecutado sobre B200. Para el resto de modelos, la elección de kernel la realiza el código de selección de vLLM 0.32, pero no se aportan datos de rendimiento por GPU.
- Cabe en GPU de consumo: no confirmado. Con 28,6 GB de pesos más caché KV y activaciones, una GPU de 24 GB no es suficiente sin técnicas adicionales; no se dispone de mediciones en RTX 4090 ni en otras consumer.
- Despliegue: vLLM 0.32.0 (probado), con `--tensor-parallel-size N` para repartir pesos entre varias GPUs. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Entorno: Python 3.11–3.14, torch 2.13 (build CUDA 13.0, requiere driver NVIDIA con soporte CUDA 13), transformers ≥5.16.1,<5.20 y compressed-tensors 0.17.0 fijado por vLLM (no actualizar por separado; el checkpoint se guardó con 0.19.0 y 0.17.0 lo lee correctamente).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

Comparación con las otras cuantizaciones del mismo modelo base, según los datos publicados por el autor:

| Modelo | Parámetros | Contexto | Media de benchmarks | GSM8K | Licencia | Formato / runtime |
|---|---|---|---|---|---|---|
| Qwen3.8-27B (BF16) | 27,8 B | No disponible | 68,77 | 70,43 | Apache-2.0 | safetensors / transformers, vLLM |
| NVFP4A16 (este repo) | 27,8 B | No disponible | 65,30 (95,0 %) | 49,81 | Apache-2.0 | compressed-tensors / vLLM |
| NVFP4 | 27,8 B | No disponible | 64,90 (94,4 %) | 47,54 | Apache-2.0 | compressed-tensors / vLLM |
| AWQ-8bit | 27,8 B | No disponible | 69,01 (100,3 %) | 70,81 | Apache-2.0 | compressed-tensors / vLLM |
| AWQ-4bit | 27,8 B | No disponible | 70,12 (102,0 %) | 76,42 | Apache-2.0 | compressed-tensors / vLLM |
| FP8-dynamic | 27,8 B | No disponible | 69,87 (101,6 %) | 76,88 | Apache-2.0 | compressed-tensors / vLLM |

No se dispone de datos para comparar con modelos de otros desarrolladores de tamaño o tarea equivalentes.

## Limitaciones y advertencias

- Degradación media del 5 % en los benchmarks publicados (65,30 frente a 68,77 en BF16). El propio autor recomienda una build de 8 bits si la calidad es prioritaria.
- Caída severa en razonamiento aritmético: GSM8K pasa de 70,43 a 49,81 (70,7 % de recuperación), el peor resultado de todas las variantes comparadas. No es adecuado para tareas matemáticas exigentes.
- Fidelidad limitada: perplejidad un 1,0 % superior al BF16 y acuerdo top-1 del 95,7 % frente al 99,4 % del original; aproximadamente 1 de cada 23 predicciones del siguiente token difiere.
- Historial de revisión: la primera subida (revisión `10aff8f`, anterior al 2026-11-01 10:44:12 UTC) perdía precisión en las normas de la capa 7. Es obligatorio descargar la reconstrucción; las métricas publicadas corresponden a los ficheros corregidos.
- Idiomas: la lista oficial de idiomas soportados no está disponible. La calibración tiene predominio de coreano y la evaluación de fidelidad es mixta inglés/coreano, por lo que el comportamiento en castellano no está verificado.
- Sesgos conocidos: no documentados en la información proporcionada. Al ser una cuantización PTQ, hereda los sesgos del modelo base.
- Riesgo de alucinación: no cuantificado en la información disponible; la cuantización agresiva puede incrementarlo en tareas de razonamiento largo.
- Restricciones de licencia: Apache-2.0, que permite uso comercial. El enlace de licencia apunta al fichero LICENSE del modelo base.
- Dependencias estrictas: requiere driver con CUDA 13, torch 2.13 y versiones fijadas de transformers y compressed-tensors. Actualizar compressed-tensors por separado puede romper la carga del checkpoint.
- Compatibilidad de hardware limitada: V100 no soportada; el rendimiento solo se ha validado en B200, sin datos de latencia ni throughput en otras GPUs.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/axteam/Qwen3.8-27B-NVFP4A16
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
- Repositorio de compressed-tensors: no disponible en la información proporcionada
- Repositorio de vLLM: no disponible en la información proporcionada
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- Paper o blog del modelo base: no disponible en la información proporcionada
- Demos: no disponible en la información proporcionada
