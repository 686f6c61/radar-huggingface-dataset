# axteam/gemma-4-31B-it-NVFP4

## Resumen

`axteam/gemma-4-31B-it-NVFP4` es una cuantización de 4 bits del modelo multimodal `google/gemma-4-31B-it`, publicada por el usuario axteam. El objetivo es servir el modelo base de forma eficiente en vLLM sobre hardware Blackwell, empleando el formato NVFP4 (W4A4, FP4 E2M1) implementado mediante `compressed-tensors`. El resultado es un checkpoint de aproximadamente 20,4 GB en disco que mantiene el pipeline `image-text-to-text` del original.

El modelo base es un transformer denso de la familia Gemma 4, con capacidad de procesar imagen y texto y un modo de razonamiento (thinking mode) heredado del original. La cuantización se aplica solo a los pesos lineales: la torre de visión, la proyección de visión, los embeddings (atados con el `lm_head`) y todas las normalizaciones permanecen en BF16, lo que supone en torno al 6 % de los parámetros del build.

La relevancia de esta ficha radica en que permite ejecutar un modelo multimodal de gran tamano con pesos de 4 bits y activaciones de 4 bits en GPUs Blackwell, con una fidelidad medida frente al BF16 original de un 100,6 % de media en los benchmarks reportados. Es, por tanto, una opción práctica para despliegue en producción cuando el presupuesto de VRAM es el factor limitante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4, transformer denso (multimodal image-text-to-text) |
| Parametros totales | 18.460.143.972 (según safetensors del repo); el nombre comercial indica 31B |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A4 (FP4 E2M1, grupo 16, escala FP8 E4M3 + escala global FP32 por tensor); pesos y activaciones en FP4; visión, proyección, embeddings y norms en BF16 |
| Idiomas soportados | no disponible en la model card; el set de calibración es mayoritariamente coreano con inglés |
| Licencia | Apache-2.0 (con enlace a la licencia Gemma 4 de Google) |
| Formato de pesos | safetensors con `compressed-tensors` (`nvfp4-pack-quantized`), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-31B-it` es un transformer denso de la familia Gemma 4 con capacidad multimodal (entrada de imagen y texto) y modo de razonamiento. Esta versión no reentrena el modelo: es una cuantización post-entrenamiento (PTQ) del checkpoint BF16 publicado por Google (commit `842da37`). El esquema aplicado es NVFP4 con pesos y activaciones en FP4 (E2M1), agrupación de 16 elementos, escala FP8 E4M3 por grupo y una escala global FP32 por tensor, almacenado como `nvfp4-pack-quantized` de `compressed-tensors`. El método de calibración es AWQ con 256 muestras, mayoritariamente en coreano, de las cuales 32 son respuestas autogeneradas en modo thinking.

La decisión de mantener en BF16 la torre de visión, la proyección multimodal, los embeddings y todas las normalizaciones (aproximadamente el 6 % de los parámetros) busca preservar la calidad en las partes más sensibles a la cuantización. El tokenizador, el `chat_template`, el `processor_config` y el `generation_config` son idénticos byte a byte a los del original, incluida la corrección del `chat_template` de julio de 2026 de Google. El `config.json` es el original más un bloque `quantization_config`. No se reportan detalles sobre el número de tokens de entrenamiento del modelo base ni sobre el dataset de preentrenamiento, ya que la model card se centra exclusivamente en el proceso de cuantización.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte del `chat_template` original de Gemma 4.
- Procesamiento de imagen y texto (`image-text-to-text`): la torre de visión se mantiene en BF16, por lo que las capacidades multimodales del original se preservan.
- Modo de razonamiento (thinking mode) heredado del modelo base `-it`.
- Razonamiento y matemáticas: los benchmarks reportados incluyen GSM8K y ARC-Challenge, con recuperación cercana al 100 % respecto al BF16.
- Capacidades multilingües: se evalúa en KMMLU (coreano) y HAE-RAE, con recuperación por encima del 100 % del BF16 en ambos casos.
- Tool calling / function calling: no se documenta explícitamente en la model card; debe asumirse la del modelo base, no confirmada aquí.
- Soporte de agentes y razonamiento multi-paso: no documentado en la model card.
- No se documentan capacidades de audio.

## Casos de uso

- Despliegue de un asistente multimodal en producción sobre GPUs Blackwell: el formato NVFP4 W4A4 permite servir el modelo con pesos de 4 bits y activaciones de 4 bits, reduciendo el coste por token en comparación con BF16, manteniendo la torre de visión en BF16 para preservar la calidad de las entradas de imagen.
- Atención al cliente con entradas de imagen: el pipeline `image-text-to-text` permite recibir capturas, documentos escaneados o fotos junto con texto y responder en conversaciones multi-turno, siempre que la ventana de contexto del modelo base sea suficiente (no disponible en la información).
- Análisis de documentos y extracción de información: uso del modo thinking para tareas de razonamiento sobre contenido visual y textual, con la ventaja de que la cuantización no degrada de forma apreciable los benchmarks de razonamiento medidos (ARC-Challenge al 98,8 % del BF16).
- Razonamiento matemático asistido: GSM8K se mantiene al 99,9 % de recuperación frente al BF16, lo que hace viable usar el modelo en tutoría o resolución de problemas con pasos intermedios.
- Evaluación comparativa de cuantizaciones: sirve como referencia para equipos que quieran medir la fidelidad de sus propios pipelines de cuantización frente a un checkpoint público con métricas de perplejidad y acuerdo top-1 publicadas.
- Servicio en vLLM con requisitos de VRAM ajustados: al ocupar aproximadamente 20,4 GB en disco, el checkpoint cabe en GPUs de 24 GB o superiores con margen para el KV cache, lo que permite desplegarlo en nodos con una sola GPU Blackwell de gama profesional.
- Investigación en cuantización de modelos multimodales: la separación explícita entre componentes cuantizados y componentes en BF16 (visión, embeddings, norms) proporciona un punto de partida reproducible para estudiar el impacto de la cuantización en cada módulo.

## Benchmarks y rendimiento

Resultados medidos con lm-evaluation-harness sobre vLLM, decodificación greedy, prompts de tipo completion sin `chat_template`. Los porcentajes entre paréntesis indican recuperación respecto al BF16 original.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit | NVFP4A16 | NVFP4 (este repo) | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot) | 56,46 | 56,07 (99,3 %) | 56,41 (99,9 %) | 58,32 (103,3 %) | 58,51 (103,6 %) | 57,12 (101,2 %) |
| GSM8K (5-shot, strict) | 91,81 | 91,89 (100,1 %) | 91,66 (99,8 %) | 91,96 (100,2 %) | 91,74 (99,9 %) | 92,34 (100,6 %) |
| ARC-Challenge (0-shot) | 57,59 | 58,36 (101,3 %) | 57,68 (100,1 %) | 57,76 (100,3 %) | 56,91 (98,8 %) | 57,17 (99,3 %) |
| Winogrande (5-shot) | 66,22 | 66,14 (99,9 %) | 65,82 (99,4 %) | 65,59 (99,0 %) | 64,96 (98,1 %) | 66,77 (100,8 %) |
| KMMLU (5-shot, direct) | 25,02 | 23,89 (95,5 %) | 25,21 (100,8 %) | 26,55 (106,1 %) | 26,78 (107,0 %) | 25,02 (100,0 %) |
| HAE-RAE (0-shot) | 76,81 | 75,25 (98,0 %) | 76,81 (100,0 %) | 77,09 (100,4 %) | 77,09 (100,4 %) | 78,09 (101,7 %) |
| Media | 62,32 | 61,93 (99,4 %) | 62,27 (99,9 %) | 62,88 (100,9 %) | 62,66 (100,6 %) | 62,75 (100,7 %) |

Evaluación de fidelidad frente al BF16 original sobre un conjunto interno mixto inglés/coreano, con variante de cuantización AWQ en atención:

| Métrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor es mejor) | 1,2326 | 1,1120 (+10,8 %) |
| Acuerdo top-1 en siguiente token | 92,4 % | 99,4 % |

Comparación con otras cuantizaciones públicas del mismo formato, mismo conjunto de evaluación y harness:

| Modelo | Perplejidad | Top-1 |
|---|---|---|
| BF16 original (cota superior) | 1,1120 | 99,4 % |
| Este modelo (axteam) | 1,2326 | 92,4 % |
| RedHatAI/gemma-4-31B-it-NVFP4 | 1,2753 | 91,4 % |

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa aproximadamente 20,4 GB en disco; a ello hay que sumar el KV cache y los buffers de activación, por lo que se recomienda un mínimo de 24 GB de VRAM para contextos cortos y más para contextos largos.
- GPU recomendadas: el máximo rendimiento FP4 (W4A4) se obtiene en Blackwell: B200/GB200 (sm100), B300 (sm103) y RTX Pro 6000 (sm120). En GPUs sin soporte nativo de FP4 el rendimiento será menor y puede requerir rutas de emulación.
- Cabe en GPU de consumo: sí, en principio en tarjetas de 24 GB o más (por ejemplo, RTX 4090), aunque sin aceleración FP4 nativa; el rendimiento óptimo requiere Blackwell.
- Opciones de despliegue: vLLM (arquitectura soportada desde vLLM ≥ 0.19.0, probado con vLLM 0.32.0). Requiere Python 3.11–3.14, torch 2.13 (build CUDA 13.0, con driver NVIDIA compatible con CUDA 13), transformers ≥5.16.1,<5.20 y compressed-tensors 0.17.0 (fijado por vLLM; no actualizar por separado). No se documenta soporte para llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Perplejidad (eval interna) | Top-1 |
|---|---|---|---|---|---|---|
| axteam/gemma-4-31B-it-NVFP4 | 18,46 B (safetensors) | no disponible | NVFP4 W4A4, compressed-tensors | Apache-2.0 | 1,2326 | 92,4 % |
| RedHatAI/gemma-4-31B-it-NVFP4 | no disponible | no disponible | NVFP4 | no disponible | 1,2753 | 91,4 % |
| google/gemma-4-31B-it (BF16) | 31 B (nominal) | no disponible | BF16 | Gemma 4 / Apache-2.0 | 1,1120 | 99,4 % |

## Limitaciones y advertencias

- La cuantización es PTQ con calibración AWQ de 256 muestras mayoritariamente en coreano; el rendimiento en otros idiomas puede diferir del BF16 original, aunque los benchmarks multilingües reportados no muestran degradación apreciable.
- La perplejidad aumenta un 10,8 % respecto al BF16 y el acuerdo top-1 cae al 92,4 %, lo que indica una fidelidad imperfecta al modelo original; en tareas de generación libre o de alta precisión esto puede traducirse en diferencias cualitativas.
- El número de parámetros reportado en safetensors (18,46 B) no coincide con el tamano nominal del nombre comercial (31B); conviene verificar el conteo real antes de dimensionar infraestructura.
- No se documentan sesgos específicos del modelo base ni del proceso de cuantización en la información disponible.
- Riesgo de alucinación: inherente al modelo base; la cuantización puede incrementarlo ligeramente en dominios poco representados en la calibración.
- Restricciones de licencia: aunque la model card declara Apache-2.0, enlaza a la licencia Gemma 4 de Google, que puede imponer condiciones adicionales de uso comercial; conviene revisar el texto completo antes de un despliegue en producción.
- Dependencia estricta de versiones: vLLM 0.32.0, torch 2.13 con CUDA 13.0, transformers ≥5.16.1,<5.20 y compressed-tensors 0.17.0; no actualizar compressed-tensors por separado. Un entorno distinto puede no cargar el checkpoint.
- El rendimiento óptimo FP4 requiere hardware Blackwell; en GPUs anteriores el modelo funcionará pero sin las ventajas de velocidad del formato.
- No se documenta el soporte de tool calling, agentes o audio; no debe asumirse sin verificación empírica.

## Enlaces

- [HuggingFace: axteam/gemma-4-31B-it-NVFP4](https://huggingface.co/axteam/gemma-4-31B-it-NVFP4)
- [Modelo base: google/gemma-4-31B-it](https://huggingface.co/google/gemma-4-31B-it)
- [Licencia Gemma 4](https://ai.google.dev/gemma/docs/gemma_4_license)
- [Cuantización comparable: RedHatAI/gemma-4-31B-it-NVFP4](https://huggingface.co/RedHatAI/gemma-4-31B-it-NVFP4)
- [lm-evaluation-harness](https://github.com/EleutherAI/lm-evaluation-harness)
- [compressed-tensors](https://github.com/neuralmagic/compressed-tensors)
- [vLLM](https://github.com/vllm-project/vllm)
