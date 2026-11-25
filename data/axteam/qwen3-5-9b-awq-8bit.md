# axteam/Qwen3.5-9B-AWQ-8bit

## Resumen

Qwen3.5-9B-AWQ-8bit es una cuantización de 8 bits del modelo multimodal Qwen/Qwen3.5-9B, publicada por el usuario axteam. Se trata de una cuantización de posentrenamiento (PTQ) mediante AWQ en esquema W8A16 (pesos INT8 simétricos con grupo de 32, activaciones en BF16), empaquetada en formato `compressed-tensors` y orientada específicamente al servicio de inferencia con vLLM. El modelo conserva la torre de visión, el cabezal de predicción multi-token (MTP), las RMSNorm, los embeddings y el LM head en BF16, de modo que aproximadamente el 28% de los parámetros permanece sin cuantizar para preservar la calidad.

El modelo base es un transformer híbrido (atención lineal combinada con atención completa), denso, con 9.409.813.744 parámetros y capacidad multimodal de entrada imagen-texto. La cuantización reduce el peso en disco a unos 12,8 GB, lo que permite servirlo en GPUs de gama profesional y en algunas consumer de gama alta con suficiente VRAM, manteniendo una fidelidad muy alta respecto al original: perplejidad de 1,4507 frente a 1,4506 del BF16 y una tasa de coincidencia top-1 del 98,6%.

Su relevancia es práctica: ofrece una vía lista para producción de desplegar un modelo de 9B multimodal con licencia Apache-2.0 en vLLM, con pérdida de rendimiento medida inferior al 1% de media en el conjunto de benchmarks publicado, y con soporte de arquitectura disponible en vLLM ≥ 0.17.0 (probado con 0.32.0).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención lineal + atención completa), denso, multimodal (visión), con cabezal MTP |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | AWQ INT8 W8A16 (pesos INT8 simétricos, grupo 32, activaciones BF16); incluye comparativas con FP8-dynamic, NVFP4A16, NVFP4 y AWQ-4bit |
| Idiomas soportados | No disponible en la información proporcionada (el conjunto de calibración es de mezcla con predominio de coreano; los benchmarks incluyen tareas en inglés y coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors con `compressed-tensors` (`pack-quantized`); compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B emplea una arquitectura híbrida que combina capas de atención lineal con capas de atención completa, junto con componentes propios de los modelos SSM en las partes no lineales de la atención lineal (`linear_attn.conv1d`, `A_log`, `dt_bias`). Incorpora además una torre de visión y un proyector para el procesamiento de imágenes, y un cabezal de predicción multi-token (MTP). Es un modelo denso de 9.409.813.744 parámetros.

Esta publicación concreta no entrena el modelo: aplica cuantización de posentrenamiento AWQ sin reentrenamiento, usando un conjunto de calibración de 256 muestras de un corpus mixto con predominio de coreano. AWQ protege los canales de pesos más relevantes antes del redondeo. La revisión del 1 de noviembre de 2026 restauró de forma bit-exacta los pesos RMSNorm no suavizados desde el original, eliminando el ruido de redondeo BF16 (hasta un 0,4% en la ganancia efectiva) que había introducido el manejo de offset-norm de llm-compressor. Los pesos cuantizados y las normas suavizadas por AWQ no cambiaron. El tokenizador, la `chat_template` y las configuraciones de preprocesado son idénticas a las del original; el `config.json` es el original más un bloque `quantization_config`.

## Capacidades

- Generación de texto conversacional y razonamiento general.
- Procesamiento multimodal de entrada imagen-texto (`image-text-to-text`): la torre de visión y el proyector se mantienen en BF16.
- Razonamiento matemático, evidenciado por un 86,96 en GSM8K (5-shot, estricto).
- Capacidades multilingües parcialmente evidenciadas por KMMLU (58,51) y HAE-RAE (69,39), centradas en coreano, además de tareas en inglés.
- Predicción multi-token mediante cabezal MTP, conservado en BF16.
- No se especifica en la información disponible soporte explícito de tool calling, function calling ni comportamiento agéntico multi-paso.
- No se especifica en la información disponible un modo de pensamiento (thinking mode) diferenciado.

## Casos de uso

- Servicio de inferencia a escala con vLLM: el formato `compressed-tensors` `pack-quantized` y el esquema W8A16 están pensados para el motor de vLLM, lo que permite desplegar el modelo con pesos de 12,8 GB y activaciones BF16 en GPUs NVIDIA Turing (sm75) o superiores, sin necesidad de tensor cores especiales.
- Asistentes conversacionales multi-turno: el modelo mantiene la `chat_template` original y el comportamiento conversacional del base, adecuado para atención al cliente o asistentes internos.
- Aplicaciones imagen-texto: al conservar la torre de visión y el proyector en BF16, puede emplearse en tareas de descripción de imágenes, extracción de información de documentos escaneados o respuesta a preguntas sobre capturas, con la fidelidad del modelo original en la rama visual.
- Razonamiento matemático y resolución de problemas: su rendimiento en GSM8K (86,96, prácticamente idéntico al BF16 con 87,11) lo hace apto para tutores automáticos, verificación de cálculos o generación de explicaciones paso a paso.
- Evaluación y benchmarking reproducible: el repositorio documenta el arnés (lm-evaluation-harness sobre vLLM, greedy, prompts de estilo completion) y las métricas de fidelidad (perplejidad 1,4507, coincidencia top-1 del 98,6%), lo que facilita su uso como referencia en estudios de cuantización.
- Despliegue en entornos con restricciones de memoria: la reducción a 12,8 GB frente a los pesos BF16 permite servir el modelo en una sola GPU profesional de 24 GB o en consumer de gama alta con VRAM suficiente, liberando memoria para el KV cache.
- Investigación sobre cuantización PTQ: las comparativas internas con FP8-dynamic, NVFP4A16, NVFP4 y AWQ-4bit permiten analizar el compromiso entre precisión y coste computacional en modelos multimodales híbridos.

## Benchmarks y rendimiento

Medidos con lm-evaluation-harness sobre vLLM, decodificación greedy, prompts de estilo completion sin plantilla de chat. MMLU corresponde a la variante generativa (`mmlu_generative`), no comparable con puntuaciones obtenidas por log-verosimilitud. Porcentajes entre paréntesis: recuperación respecto al BF16 original.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit (este repo) | NVFP4A16 | NVFP4 | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot, generativo) | 33,03 | 46,82 (141,8%) | 32,37 (98,0%) | 32,15 (97,3%) | 35,06 (106,1%) | 33,29 (100,8%) |
| GSM8K (5-shot, estricto) | 87,11 | 86,81 (99,7%) | 86,96 (99,8%) | 84,38 (96,9%) | 84,23 (96,7%) | 86,81 (99,7%) |
| ARC-Challenge (0-shot) | 55,55 | 55,72 (100,3%) | 55,89 (100,6%) | 54,44 (98,0%) | 54,01 (97,2%) | 56,48 (101,7%) |
| Winogrande (5-shot) | 73,72 | 74,19 (100,6%) | 74,51 (101,1%) | 73,01 (99,0%) | 73,16 (99,3%) | 73,40 (99,6%) |
| KMMLU (5-shot, directo) | 58,39 | 58,05 (99,4%) | 58,51 (100,2%) | 58,26 (99,8%) | 57,41 (98,3%) | 56,96 (97,6%) |
| HAE-RAE (0-shot) | 69,48 | 69,11 (99,5%) | 69,39 (99,9%) | 70,21 (101,1%) | 68,47 (98,5%) | 67,09 (96,6%) |
| Media | 62,88 | 65,12 (103,6%) | 62,94 (100,1%) | 62,07 (98,7%) | 62,06 (98,7%) | 62,34 (99,1%) |
| Media sin MMLU | 68,85 | 68,78 (99,9%) | 69,05 (100,3%) | 68,06 (98,9%) | 67,46 (98,0%) | 68,15 (99,0%) |

Fidelidad respecto al BF16 original en un conjunto interno mixto inglés/coreano de 100 prompts (respuestas BF16 greedy puntuadas bajo cada build):

| Métrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor = más cercano) | 1,4507 | 1,4506 (+0,0%) |
| Coincidencia top-1 del siguiente token | 98,6% | 99,2% |

El autor advierte que la puntuación de MMLU varía ampliamente entre builds del mismo modelo (32,2–46,8) y probablemente refleja el formato de respuesta más que la calidad de la cuantización; no se verificó respuesta por respuesta.

## Requisitos de hardware

- VRAM estimada para inferencia: pesos de 12,8 GB; hay que añadir el KV cache y las activaciones BF16 según la longitud de contexto y el tamaño de lote.
- GPU recomendadas: NVIDIA Turing (sm75) o superior; V100 (sm70) no está soportado. Solo se ejecutó en B200 durante la validación.
- Compatibilidad consumer: no se confirma explícitamente en la información disponible; con 12,8 GB de pesos, encajaría en GPUs consumer de 24 GB o más, pero no se documenta una prueba.
- Opciones de despliegue: vLLM (arquitectura disponible en vLLM ≥ 0.17.0; probado con 0.32.0). No se documenta soporte de llama.cpp, Ollama ni TGI para este checkpoint.
- Dependencias de vLLM 0.32: Python 3.11–3.14, torch 2.13 (build CUDA 13.0, requiere driver NVIDIA con soporte CUDA 13), transformers ≥5.16.1,<5.20 y compressed-tensors 0.17.0 (fijado por vLLM; no actualizar por separado, ya que el checkpoint se guardó con 0.19.0).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Rendimiento medido |
|---|---|---|---|---|---|
| axteam/Qwen3.5-9B-AWQ-8bit | 9,41B | No disponible | AWQ INT8 W8A16, compressed-tensors | Apache-2.0 | Media 62,94 (sin MMLU 69,05) |
| Qwen/Qwen3.5-9B (BF16) | 9,41B | No disponible | Safetensors BF16 | Apache-2.0 | Media 62,88 (sin MMLU 68,85) |
| Qwen3.5-9B FP8-dynamic (según benchmarks del autor) | 9,41B | No disponible | FP8 dinámico | Apache-2.0 | Media 65,12 (sin MMLU 68,78) |
| Qwen3.5-9B NVFP4 / NVFP4A16 / AWQ-4bit (según benchmarks del autor) | 9,41B | No disponible | FP4 / AWQ 4 bits | Apache-2.0 | Medias 62,06 / 62,07 / 62,34 |

No se dispone de comparaciones con modelos de otros desarrolladores en la información proporcionada.

## Limitaciones y advertencias

- La cuantización es PTQ sin reentrenamiento: puede introducir degradaciones sutiles no capturadas por los benchmarks publicados.
- La calibración AWQ usó 256 muestras de un corpus mixto con predominio de coreano, lo que puede sesgar la preservación de canales hacia ese idioma.
- El rendimiento en MMLU generativo es inestable entre builds (32,2–46,8) y depende fuertemente del formato de respuesta; no debe usarse como medida aislada de calidad.
- La coincidencia top-1 del siguiente token es del 98,6% frente al 99,2% del original: existe una divergencia pequeña pero medible en la distribución de salida.
- Riesgo de alucinación inherente al modelo base; no se documentan evaluaciones específicas de veracidad.
- Longitud de contexto e idiomas soportados no están disponibles en la información proporcionada; no deben asumirse.
- Requiere vLLM ≥ 0.17.0 y compressed-tensors 0.17.0 exacto; actualizar esa dependencia por separado puede romper la carga del checkpoint.
- No soportado en V100 (sm70); requiere driver NVIDIA con CUDA 13 para el stack de vLLM 0.32.
- Licencia Apache-2.0 permite uso comercial, pero debe conservarse la atribución y las condiciones del modelo base Qwen/Qwen3.5-9B.
- Solo se validó en una B200; el comportamiento en otras GPU se infiere del código de selección de kernels de vLLM, no de pruebas directas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/axteam/Qwen3.5-9B-AWQ-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- vLLM: https://github.com/vllm-project/vllm
