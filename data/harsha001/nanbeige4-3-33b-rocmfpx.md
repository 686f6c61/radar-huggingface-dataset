# Harsha001/Nanbeige4.3-33B-ROCmFPX

## Resumen

Nanbeige4.3-33B-ROCmFPX es una cuantización comunitaria del modelo Nanbeige4.3-33B, un modelo denso de 33 mil millones de parámetros desarrollado por Nanbeige, orientado a tareas de código, razonamiento y agentes. Esta versión, publicada por el usuario Harsha001 en Hugging Face, convierte los pesos al formato ROCmFPX, un fork de llama.cpp con tipos de pesos de baja precisión para GPU de AMD (backends Vulkan y HIP/ROCm), pensado especialmente para hardware como el Strix Halo.

El modelo base destaca por su capacidad agéntica y de razonamiento: genera un bloque `<think>` antes de responder y soporta contextos de hasta 512K tokens en su versión original. La cuantización ROCmFPX permite ejecutarlo en GPU AMD con memoria limitada, con archivos desde 17,6 GB (4-bit rápido) hasta 34,2 GB (8-bit).

Es relevante porque cubre un nicho poco atendido: la inferencia eficiente de modelos grandes en GPU AMD, donde las cuantizaciones estándar de llama.cpp no siempre están optimizadas. Conviene subrayar que no se trata de una publicación oficial de Nanbeige, sino de una cuantización de la comunidad con licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (detalles adicionales no disponibles) |
| Parametros totales | 33.118.977.024 (33,1B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | hasta 512K tokens (modelo original); los ejemplos de ejecución usan 32.768 |
| Tipos de cuantizacion | Q8_0_ROCMFPX, Q6_0_ROCMFPX, Q4_0_ROCMFP4 (variantes STRIX_O8 y FAST) |
| Idiomas soportados | inglés y chino |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (tipos ROCmFPX, requieren fork específico de llama.cpp) |

## Arquitectura y entrenamiento

Nanbeige4.3-33B es un modelo transformer denso de 33B parámetros, sin mezcla de expertos, con soporte de contexto extendido de hasta 512K tokens y plantilla de chat con razonamiento integrado. La model card del modelo cuantizado no detalla la composición del dataset de preentrenamiento ni los procesos de post-entrenamiento (RLHF, DPO, etc.); esos datos no están disponibles en la información proporcionada.

En cuanto a la cuantización, el proceso consistió en: conversión del modelo BF16 a GGUF con el script del fork, cálculo de una matriz de importancia (imatrix) sobre texto de calibración general (`calibration_datav3`) en chunks de 512 tokens, y cuantización con `llama-quantize --imatrix` para cada tipo. La variante `_O8` mantiene la capa de salida a 8 bits (`q8_0_rocmfpx`), lo que reduce la divergencia KL respecto a BF16 de 0,1744 a 0,1114. La calidad se midió sobre WikiText-2 comparando cada cuant con el modelo BF16 de referencia (perplejidad 21,52).

## Capacidades

- Generación de texto conversacional con plantilla de chat estilo Jinja
- Razonamiento con bloque `<think>` por defecto (desactivable con `enable_thinking=false` en la plantilla de chat)
- Generación y comprensión de código (etiquetado como modelo de coding)
- Capacidades agénticas y uso de herramientas (tool calling), con parámetros de muestreo recomendados específicos para este caso (temperature 1,0 / top-p 0,95)
- Soporte bilingüe: inglés y chino
- Contexto muy largo (hasta 512K tokens en el modelo original) para procesamiento de documentos extensos

## Casos de uso

- Ejecución local en Strix Halo (AMD Ryzen AI Max): el archivo Q6_K de 27,3 GB está recomendado explícitamente para este SoC con 32 GB de memoria unificada, permitiendo inferencia completamente local de un modelo de 33B.
- Inferencia en GPU AMD con ROCm o Vulkan: los tipos de pesos ROCmFPX están diseñados para aprovechar GPU AMD (por ejemplo, RX 7900 con gfx1100), donde las cuantizaciones estándar pueden no estar tan optimizadas.
- Asistentes de código locales: dado su enfoque en coding y razonamiento, puede integrarse en editores o pipelines de desarrollo para generación, revisión y refactorización de código sin enviar datos a la nube.
- Agentes con herramientas: con soporte de tool calling y muestreo agéntico recomendado (temperature 1,0), es adecuado para agentes multi-paso que invocan funciones, consultan APIs o navegan entornos.
- Procesamiento de documentos largos en chino e inglés: la ventana de 512K tokens del modelo original permite resumir o analizar corpus extensos, siempre que el despliegue asigne memoria suficiente para el KV cache.
- Razonamiento paso a paso (chain-of-thought): el bloque `<think>` por defecto lo hace útil para matemáticas, planificación y resolución de problemas donde se quiera inspeccionar el proceso de razonamiento.
- Atención al cliente bilingüe: puede gestionar conversaciones multi-turno en inglés y chino desactivando el modo de razonamiento para reducir latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sí se han publicado mediciones de calidad de la cuantización sobre WikiText-2 (40 chunks de 512 tokens), con KLD como divergencia KL media respecto a BF16 (menor es mejor):

| Archivo | Tamaño | PPL | KLD | Same top |
|---|---:|---:|---:|---:|
| Q8_0_ROCMFPX | 34,2 GB | 21,711 | 0,0192 | 94,91% |
| Q6_K_ROCMFPX (recomendado) | 27,3 GB | 21,848 | 0,0220 | 93,83% |
| Q4_0_ROCMFP4_STRIX_O8 | 18,6 GB | 21,397 | 0,1114 | 86,56% |
| Q4_0_ROCMFP4_FAST | 17,6 GB | 22,247 | 0,1822 | 79,61% |

Como referencia, un `Q4_K_M` estándar de llama.cpp del mismo modelo (unos 20 GB) obtuvo KLD 0,0716 y same top 89,97%, es decir, más fiel a BF16 que cualquiera de los archivos ROCmFPX de 4 bits. El autor advierte que este modelo pierde más calidad a 4 bits que la mayoría.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: 34,2 GB para Q8_0, 27,3 GB para Q6_K (recomendado), 18,6 GB para STRIX_O8 y 17,6 GB para FAST, más memoria adicional para el KV cache según el contexto.
- GPU recomendadas: Strix Halo (AMD Ryzen AI Max, gfx1151) con 32 GB o más de memoria unificada para el archivo de 27,3 GB; RX 7900 (gfx1100) para los archivos de 4 bits; cualquier GPU AMD compatible con Vulkan o HIP/ROCm con memoria suficiente.
- Consumer GPU: los archivos de 4 bits (17,6-18,6 GB) caben en una RTX 4090 (24 GB) o en una RX 7900 XTX, aunque están optimizados para kernels AMD; el archivo Q6_K requiere 32 GB o más (Strix Halo, GPUs de gama datacenter).
- Despliegue: exclusivamente mediante el fork ROCmFPX de llama.cpp (compilación con `-DGGML_VULKAN=ON` o `-DGGML_HIP=ON`). No son compatibles con llama.cpp estándar, LM Studio, Ollama ni otros runtimes. Comando de ejemplo: `llama-server -m Nanbeige4.3-33B-Q6_K_ROCMFPX.gguf -ngl 999 -fa on --jinja -c 32768 --temp 0.6 --top-p 0.95`.
- Latencia y throughput: no disponibles. Los archivos FAST y STRIX están orientados a velocidad en Strix Halo, pero no se publican cifras de tokens/segundo.
- Advertencia: los archivos no se han probado todavía en hardware AMD según el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Nanbeige4.3-33B (base) | 33,1B | 512K | Apache-2.0 | Hugging Face, pesos originales |
| Nanbeige4.3-33B-ROCmFPX (esta ficha) | 33,1B (cuantizado) | 512K (original); 32K en ejemplos | Apache-2.0 | GGUF ROCmFPX, requiere fork de llama.cpp |
| Qwen3-32B | 32,8B | 128K (con YaRN hasta más) | Apache-2.0 | GGUF estándar, amplio soporte de runtimes |

No hay datos de benchmarks que permitan comparar rendimiento entre estos modelos en la información disponible. La diferencia práctica principal es la compatibilidad: la variante ROCmFPX solo funciona con el fork específico, mientras que las alternativas estándar funcionan en llama.cpp, Ollama, LM Studio, vLLM, etc.

## Limitaciones y advertencias

- Los archivos GGUF requieren el fork ROCmFPX de llama.cpp; no cargan en llama.cpp estándar, LM Studio, Ollama ni otros runtimes habituales.
- Los archivos no se han probado en hardware AMD todavía, según el propio autor.
- Los cuants de 4 bits ROCmFPX pierden más calidad que un `Q4_K_M` estándar (KLD 0,1114-0,1822 frente a 0,0716); para archivos por debajo de 20 GB sin necesidad de tipos ROCmFPX, el autor recomienda el `Q4_K_M` estándar.
- No es una publicación oficial de Nanbeige; es una cuantización de la comunidad.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado.
- Datos de entrenamiento, procesos de alineación y evaluaciones de sesgo del modelo base no disponibles en la información proporcionada; riesgo de alucinación inherente a LLMs no cuantificado.
- El modo de razonamiento está activo por defecto (bloque `<think>`), lo que aumenta la latencia si no se desactiva con `enable_thinking=false`.
- Ejecutar contextos largos (hasta 512K) exige memoria adicional considerable para el KV cache, más allá del tamaño del archivo de pesos.
- Licencia Apache-2.0: sin restricciones relevantes para uso comercial.

## Enlaces

- Modelo cuantizado: https://huggingface.co/Harsha001/Nanbeige4.3-33B-ROCmFPX
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Fork ROCmFPX (autor de la cuantización): https://github.com/HarshaVardhan3002/ROCmFPX
- Proyecto ROCmFPX original: https://github.com/charlie12345/ROCmFPX
