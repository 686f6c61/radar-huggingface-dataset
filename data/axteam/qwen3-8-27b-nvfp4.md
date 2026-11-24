# axteam/Qwen3.8-27B-NVFP4

## Resumen

Qwen3.8-27B-NVFP4 es una cuantización de 4 bits (W4A4, FP4) del modelo multimodal Qwen/Qwen3.8-27B, publicada por el usuario axteam. El objetivo es servir el modelo base en vLLM con un coste de memoria muy inferior al de la versión BF16, manteniendo la mayor parte de la calidad en tareas de conocimiento general y comprensión, a costa de una degradación notable en razonamiento matemático. El checkpoint se distribuye en formato compressed-tensors (`nvfp4-pack-quantized`) y está pensado específicamente para GPUs Blackwell, donde los kernels FP4 nativos ofrecen velocidad completa.

El modelo base es un transformer híbrido (atención lineal GatedDeltaNet/SSM combinada con atención completa), denso, con torre de visión y cabeza de predicción multi-token (MTP). Cuenta con 27.781.427.952 parámetros totales y una ventana de contexto que no se detalla en la información disponible. La cuantización deja en BF16 aproximadamente el 32 % de los parámetros: la torre de visión, el proyector, la cabeza MTP, todas las RMSNorm, los embeddings, el LM head y la totalidad del camino de atención lineal, ya que FP4 resulta demasiado agresivo para los pesos del SSM.

La relevancia de esta ficha es doble: por un lado, permite ejecutar un modelo de casi 28 000 millones de parámetros en aproximadamente 28,6 GB de pesos, lo que lo hace viable en GPUs de consumo con 32 GB o más; por otro, sirve como caso de estudio de los compromisos reales de NVFP4 en la práctica, con una recuperación media del 94,4 % respecto al BF16 y una caída severa en GSM8K (67,5 % de recuperación).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención lineal GatedDeltaNet/SSM + atención completa), denso, multimodal con torre de visión y cabeza MTP |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A4: pesos FP4 (E2M1) en grupos de 16 con escala FP8 (E4M3) y escala global FP32 por tensor; activaciones FP4. Aproximadamente el 32 % de los parámetros permanece en BF16 |
| Idiomas soportados | no disponible (la calibración usó un corpus mixto con predominio de coreano; los benchmarks incluyen KMMLU y HAE-RAE) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (`nvfp4-pack-quantized`); tamaño en disco aproximado de 28,6 GB (repo de 84,0 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que intercala capas de atención lineal basadas en GatedDeltaNet (un modelo de espacio de estados) con capas de atención completa, lo que reduce el coste de cómputo y memoria en contextos largos. Incorpora además una torre de visión para entrada image-text-to-text y una cabeza de predicción multi-token (MTP), habitualmente utilizada para decodificación especulativa. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original.

Esta publicación es una cuantización post-entrenamiento (PTQ), sin reentrenamiento. El método combina AWQ con NVFP4: AWQ utiliza un conjunto de calibración de 256 muestras (corpus mixto con predominio de coreano) y estadísticas sin gradiente para proteger los canales de pesos más relevantes antes del redondeo a FP4. La revisión del 1 de noviembre de 2026 reconstruyó el checkpoint para excluir del reescalado de AWQ los canales cuya ganancia de normalización original es cero, preservando así la precisión BF16 de las normas suavizadas; los archivos anteriores a esa revisión (revision `89c28ec`) deben descargarse de nuevo. El tokenizador, la plantilla de chat y la configuración de generación son idénticos a los del modelo original; `config.json` añade únicamente el bloque `quantization_config`.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte de plantilla de chat idéntica a la del modelo base.
- Comprensión de imágenes y texto combinados (pipeline image-text-to-text), gracias a la torre de visión y al proyector, que se mantienen en BF16.
- Razonamiento y conocimiento general: MMLU generativo de 5 disparos con un 63,47 %, ligeramente por encima del BF16 original en la misma configuración.
- Razonamiento matemático y aritmético: capacidad notablemente degradada por la cuantización (GSM8K estricto de 5 disparos: 47,54 frente a 70,43 del BF16).
- Comprensión lectora y sentido común: ARC-Challenge (57,76) y Winogrande (80,03) prácticamente intactos.
- Capacidades multilingües parcialmente verificadas: KMMLU (coreano, 64,82) y HAE-RAE (coreano, 75,80) con recuperaciones del 98,6 % y 99,3 % respectivamente.
- Cabeza MTP en BF16, que habilita decodificación especulativa en el runtime que la soporte.
- Soporte de tool calling y de agentes multi-paso: no confirmado explícitamente en la información disponible, aunque el modelo base y el formato conversacional lo permiten; debe validarse en producción.

## Casos de uso

- Servicio multimodal de preguntas y respuestas sobre documentos e imágenes: la torre de visión se conserva en BF16, de modo que la calidad de percepción no se ve afectada por la cuantización, y los 28,6 GB de pesos permiten desplegarlo en una sola GPU de 32 GB o más.
- Despliegue en GPUs Blackwell de gama de consumo (RTX 50xx, RTX PRO 6000): los kernels FP4 nativos de sm120 ofrecen velocidad completa, lo que hace viable servir el modelo en estaciones de trabajo sin GPU de centro de datos.
- Clasificación y extracción de información en coreano e inglés: los resultados en KMMLU y HAE-RAE (recuperaciones superiores al 98 %) respaldan tareas de comprensión y etiquetado en estos idiomas.
- Evaluación comparativa de técnicas de cuantización: el repositorio publica métricas de fidelidad (perplejidad +2,7 %, acuerdo top-1 del 93,7 %) frente al BF16, lo que lo convierte en una referencia útil para estudiar el impacto de NVFP4 en arquitecturas híbridas SSM.
- Prototipado de asistentes conversacionales con contexto largo: la combinación de atención lineal y atención completa reduce el coste del KV cache en secuencias largas, aunque la longitud exacta de contexto no está documentada.
- Investigación sobre decodificación especulativa: la cabeza MTP en BF16 permite experimentar con generación acelerada sin degradar la calidad de las propuestas.
- No recomendado para pipelines de resolución de problemas matemáticos o cálculo financiero automatizado: la caída de GSM8K al 67,5 % de recuperación hace preferible una build de 8 bits en esos escenarios.

## Benchmarks y rendimiento

Todas las columnas se midieron con el mismo harness (lm-evaluation-harness sobre vLLM, decodificación greedy, prompts de estilo completion sin plantilla de chat). MMLU corresponde a la variante generativa de lm-eval y no es directamente comparable con puntuaciones obtenidas por log-likelihood. Los porcentajes indican la recuperación respecto al BF16 original.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit | NVFP4A16 | NVFP4 (este repo) | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot, generativo) | 62,42 | 62,15 (99,6 %) | 62,48 (100,1 %) | 62,55 (100,2 %) | 63,47 (101,7 %) | 63,40 (101,6 %) |
| GSM8K (5-shot, estricto) | 70,43 | 76,88 (109,1 %) | 70,81 (100,5 %) | 49,81 (70,7 %) | 47,54 (67,5 %) | 76,42 (108,5 %) |
| ARC-Challenge (0-shot) | 58,62 | 58,36 (99,6 %) | 58,79 (100,3 %) | 58,70 (100,1 %) | 57,76 (98,5 %) | 59,56 (101,6 %) |
| Winogrande (5-shot) | 79,08 | 79,56 (100,6 %) | 79,32 (100,3 %) | 79,48 (100,5 %) | 80,03 (101,2 %) | 79,72 (100,8 %) |
| KMMLU (5-shot, directo) | 65,72 | 65,71 (100,0 %) | 65,77 (100,1 %) | 65,37 (99,5 %) | 64,82 (98,6 %) | 65,19 (99,2 %) |
| HAE-RAE (0-shot) | 76,35 | 76,54 (100,2 %) | 76,90 (100,7 %) | 75,89 (99,4 %) | 75,80 (99,3 %) | 76,44 (100,1 %) |
| Promedio | 68,77 | 69,87 (101,6 %) | 69,01 (100,3 %) | 65,30 (95,0 %) | 64,90 (94,4 %) | 70,12 (102,0 %) |

Métricas de fidelidad frente al original BF16 sobre un conjunto interno mixto inglés/coreano de 100 prompts, medidas con vLLM 0.32 el 1 de noviembre de 2026 sobre los archivos reconstruidos:

| Métrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor es mejor) | 1,3954 | 1,3586 (+2,7 %) |
| Acuerdo top-1 en el siguiente token | 93,7 % | 99,4 % |

## Requisitos de hardware

- Memoria de pesos: 28,6 GB. Hay que añadir el KV cache (crece con la longitud de contexto y el número de peticiones concurrentes) y varios GB adicionales para activaciones.
- GPUs con aceleración FP4 completa: B200/GB200 (sm100), B300 (sm103), RTX 50xx y RTX PRO 6000 (sm120). Solo se validó en B200.
- GPUs Turing a Hopper (sm75–sm90): funcionan en modo FP4 solo para pesos, con menor velocidad y aviso de vLLM.
- V100 (sm70): no soportado.
- GPU de consumo: viable en tarjetas con 32 GB o más de VRAM (por ejemplo, RTX 5090 o RTX PRO 6000) gracias a los 28,6 GB de pesos, siempre que se reserve memoria para el KV cache.
- Runtime: vLLM ≥ 0.17.0 para soportar la arquitectura; probado con vLLM 0.32.0. Requiere Python 3.11–3.14, torch 2.13 (build CUDA 13.0, con driver NVIDIA compatible con CUDA 13), transformers ≥5.16.1,<5.20 y compressed-tensors 0.17.0 (fijado por vLLM; no actualizar por separado, ya que 0.17.0 lee correctamente este checkpoint guardado con 0.19.0).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Calidad media (promedio de la tabla) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (BF16, original) | 27,8 B | no disponible | 68,77 | Apache-2.0 | Hugging Face (Qwen) |
| Qwen3.8-27B FP8-dynamic | 27,8 B | no disponible | 69,87 (101,6 %) | Apache-2.0 | Derivado, según autor |
| Qwen3.8-27B AWQ-8bit | 27,8 B | no disponible | 69,01 (100,3 %) | Apache-2.0 | Derivado, según autor |
| Qwen3.8-27B AWQ-4bit | 27,8 B | no disponible | 70,12 (102,0 %) | Apache-2.0 | Derivado, según autor |
| Qwen3.8-27B-NVFP4 (este repo) | 27,8 B | no disponible | 64,90 (94,4 %) | Apache-2.0 | Hugging Face (axteam) |

En el promedio de la tabla, NVFP4 queda por debajo de las alternativas de 8 bits y de AWQ-4bit, lastrado por GSM8K. La ventaja de NVFP4 no es la calidad, sino el tamaño (28,6 GB) y el uso de kernels FP4 nativos en Blackwell.

## Limitaciones y advertencias

- Degradación media del 94,4 % respecto al BF16: el propio autor recomienda una build de 8 bits si la calidad es prioritaria.
- Caída severa en razonamiento matemático: GSM8K pasa de 70,43 a 47,54 (67,5 % de recuperación), peor que NVFP4A16 y muy por debajo de AWQ-4bit y AWQ-8bit.
- Fidelidad limitada: perplejidad un 2,7 % superior al original y acuerdo top-1 del 93,7 %, lo que implica divergencias en la generación libre.
- Arquitectura híbrida con SSM: el camino de atención lineal se mantiene en BF16 porque FP4 es demasiado grueso para esos pesos; futuras cuantizaciones más agresivas de esta parte degradarían el modelo de forma difícil de predecir.
- Dependencia estricta del runtime: requiere vLLM ≥ 0.17.0 y compressed-tensors 0.17.0 fijado; actualizar esa dependencia por separado puede romper la carga del checkpoint.
- Requiere driver con soporte CUDA 13 y no funciona en V100; en GPUs anteriores a Blackwell el rendimiento FP4 es solo para pesos.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones de sesgo ni de toxicidad en la información disponible; la calibración con un corpus con predominio de coreano puede sesgar el comportamiento hacia ese idioma.
- Idiomas soportados no declarados formalmente; la cobertura multilingüe solo está respaldada por KMMLU y HAE-RAE (coreano) y por el conjunto interno inglés/coreano.
- Licencia Apache-2.0, que permite uso comercial, pero conviene verificar la licencia del modelo base en el enlace indicado por el autor.
- Historial de revisiones: los archivos anteriores al 1 de noviembre de 2026 (revision `89c28ec`) contienen un defecto de precisión en las normas de la capa 7 y deben descargarse de nuevo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/axteam/Qwen3.8-27B-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- Repositorio de vLLM: https://github.com/vllm-project/vllm
- Repositorio de compressed-tensors: https://github.com/neuralmagic/compressed-tensors
