# prithivMLmods/Qwen3.6-35B-A3B-NVFP4-GGUF

## Resumen

Qwen3.6-35B-A3B-NVFP4-GGUF es una cuantización NVFP4 en formato GGUF del modelo multimodal Qwen3.6-35B-A3B de Alibaba (equipo Qwen), publicada por el usuario prithivMLmods en Hugging Face. El modelo base es un lenguaje denso-en-actividad disperso (sparse Mixture-of-Experts) con 35B de parámetros totales y aproximadamente 3B activos por token, orientado a programación agéntica y tareas multimodales (texto, imágenes, vídeo y OCR).

La relevancia de esta versión concreta radica en la cuantización NVFP4, un formato de punto flotante de 4 bits optimizado para los Tensor Cores de la arquitectura NVIDIA Blackwell (RTX Pro 6000, serie RTX 50, B200 y B300). Esto permite ejecutar el modelo completo en una sola GPU de gama alta con un pico de consumo de apenas 23 GiB de VRAM, según las pruebas del autor. Además, el fichero GGUF incorpora Multi-Token Prediction (MTP), una forma de decodificación especulativa integrada en los propios pesos que acelera la inferencia local sin necesidad de un modelo draft separado.

El modelo base conserva la licencia Apache 2.0, lo que habilita su uso comercial sin restricciones relevantes, y hereda un contexto nativo de 262K tokens (extensible a más de 1M mediante YaRN), vocabulario de 248K tokens para más de 201 idiomas y resultados de 73,4% en SWE-Bench Verified según la model card original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal híbrido (40 capas con bloques Gated DeltaNet), image-text-to-text |
| Parametros totales | 35.505.313.216 (35,5B) |
| Parametros activos | ~3B por token (A3B) |
| Longitud de contexto | 262.144 tokens nativos, extensible a 1M+ vía YaRN |
| Tipos de cuantizacion | NVFP4 (fichero principal, 24,2 GB); mmproj para la proyección multimodal (903 MB) |
| Idiomas soportados | Más de 201 según el modelo base (el repo declara inglés como idioma principal) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado con llama.cpp); el modelo base usa safetensors |

## Arquitectura y entrenamiento

Qwen3.6-35B-A3B emplea una arquitectura MoE dispersa con 35,5B de parámetros totales de los que solo unos 3B se activan por token, lo que permite obtener costes de inferencia comparables a un modelo denso de 3B manteniendo la capacidad de un modelo mucho mayor. La estructura combina 40 capas con bloques Gated DeltaNet (una alternativa a la atención estándar dentro de una arquitectura híbrida), una dimensión oculta de 2048 y un vocabulario de 248K tokens. Incorpora Multi-Token Prediction (MTP): cabezas de salida adicionales integradas en los pesos que predicen varios tokens futuros en una sola pasada, funcionando como decodificación especulativa sin modelo auxiliar.

Sobre los datos de entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) no hay detalles en la información disponible. La model card indica que la iteración Qwen3.6 sobre Qwen3.5-35B-A3B prioriza fiabilidad en producción para agentes de desarrollo autónomos, salidas JSON estructuradas y tareas de ingeniería de software con contexto largo. Entre las optimizaciones de despliegue mencionadas se incluyen prefix caching, chunked prefill y parsing de tool calls.

## Capacidades

- Generación de texto y razonamiento general con coste de inferencia de modelo denso 3B.
- Programación agéntica: 73,4% en SWE-Bench Verified según la model card, con razonamiento a nivel de repositorio completo y flujos de trabajo frontend.
- Comprensión multimodal: procesa texto, imágenes y vídeo, incluyendo OCR (pipeline image-text-to-text; requiere el fichero mmproj).
- Contexto muy largo: 262K tokens nativos, extensible a más de 1M con YaRN.
- Tool calling / function calling: soporte nativo con parsing de tool calls.
- Agentes y razonamiento multi-paso: orientado a agentes de desarrollo autónomos y salidas JSON estructuradas.
- Decodificación especulativa vía MTP integrada en los pesos (draft_n_max=2 en llama.cpp).
- Soporte multilingüe amplio (más de 201 idiomas según el modelo base), aunque el repo declara únicamente inglés.

## Casos de uso

- Agentes de programación autónomos: con 73,4% en SWE-Bench Verified y soporte de tool calling, puede integrarse en agentes que navegan repositorios, editan código y ejecutan pruebas de forma iterativa.
- Ingeniería de software con contexto largo: los 262K tokens nativos (extensibles a 1M+) permiten analizar repositorios completos o diffs extensos en una sola sesión.
- Generación de código en producción: las salidas JSON estructuradas y el parsing de tool calls facilitan su integración en pipelines de CI/CD y herramientas de revisión automática de pull requests.
- OCR y comprensión de documentos: gracias al pipeline multimodal y al fichero mmproj, puede extraer y razonar sobre texto contenido en imágenes y vídeos.
- Despliegue en una sola GPU Blackwell: la cuantización NVFP4 permite servir el modelo completo en una RTX Pro 6000 o B200 con ~23 GiB de VRAM, ideal para entornos on-premise.
- Atención al cliente multimodal multi-turno: el contexto largo y las capacidades de visión permiten gestionar conversaciones con capturas de pantalla o documentos adjuntos.
- Inferencia local de alta velocidad: con MTP activo, la generación alcanza ~249 tokens/s en RTX Pro 6000, adecuado para asistentes interactivos con baja latencia.
- Frontend y prototipado: la model card destaca rendimiento a nivel frontera en flujos de trabajo frontend, útil para generar interfaces a partir de descripciones o maquetas.

## Benchmarks y rendimiento

Datos publicados por el autor de la cuantización (prueba en RTX Pro 6000 Blackwell Server Edition, 96 GB VRAM, llama-cli con offload completo y MTP):

| Metrica | Valor |
| --- | --- |
| Velocidad media de procesamiento del prompt | 159,31 tokens/s |
| Velocidad media de generación | 249,49 tokens/s |
| Tiempo total de ejecución | 82,5 segundos |
| Contexto de la prueba | 16.384 tokens |
| Pico de VRAM en GPU | 23,08 GiB |
| Utilización pico de GPU | 84% |

Respecto a benchmarks estandarizados del modelo base, la model card menciona 73,4% en SWE-Bench Verified, pero no se han publicado en la información disponible tablas comparativas completas con otros modelos (MMLU, HumanEval, GSM8K, etc.), por lo que no se incluyen números adicionales para no inventar datos.

## Requisitos de hardware

- VRAM estimada para inferencia: ~23,08 GiB de pico medidos con contexto de 16.384 tokens y KV cache q8_0 en el fichero NVFP4 de 24,2 GB. Con contextos mayores el consumo aumentará proporcionalmente.
- GPU recomendadas: cualquier acelerador NVIDIA Blackwell con soporte FP4 nativo: RTX Pro 6000 (probada por el autor, 96 GB), serie RTX 50, B200 y B300. En hardware sin Tensor Cores FP4, el rendimiento de NVFP4 será notablemente inferior.
- Consumer GPUs: cabe en una RTX 5090 (32 GB) con margen ajustado para contexto moderado; en GPUs de 24 GB (RTX 3090/4090) no cabe el fichero completo de 24,2 GB sin descarga parcial a RAM, con la consiguiente pérdida de rendimiento.
- Opciones de despliegue: llama.cpp / llama-cli (verificado por el autor, con `--spec-type draft-mtp`), Ollama y vLLM (mencionados para el modelo base); el modelo base también declara soporte para transformers y text-generation-inference.
- Latencia y throughput: ~249 tokens/s de generación y ~159 tokens/s de procesamiento de prompt en la configuración probada; los resultados reales dependerán del prompt, el build de llama.cpp y los parámetros de ejecución.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (base) | 35,5B | ~3B | 262K (1M+ con YaRN) | Sí | Apache 2.0 | Pesos originales en FP8/safetensors |
| Qwen3.6-35B-A3B-NVFP4-GGUF (esta ficha) | 35,5B | ~3B | 262K | Sí | Apache 2.0 | GGUF NVFP4 con MTP, optimizado para Blackwell |
| Qwen3.5-35B-A3B (iteración anterior) | ~35B | ~3B | no disponible | Sí | Apache 2.0 | Predecesor directo; Qwen3.6 mejora fiabilidad agéntica |

No se dispone de datos comparativos de rendimiento cuantitativo frente a modelos de otras familias (por ejemplo, MoE de tamaño similar de otras casas) en la información proporcionada.

## Limitaciones y advertencias

- La cuantización NVFP4 está diseñada para hardware Blackwell; en GPUs anteriores (Ampere, Hopper, Ada) el soporte y rendimiento de FP4 no está garantizado y puede degradarse significativamente.
- La cuantización a 4 bits implica inevitablemente cierta pérdida de calidad respecto a los pesos originales; no hay evaluaciones publicadas cuantificando esa degradación para este fichero.
- El repositorio declara únicamente inglés como idioma, pese a que el modelo base soporta más de 201 idiomas; el rendimiento en castellano de esta cuantización concreta no está verificado.
- No hay datos publicados sobre sesgos conocidos, tasas de alucinación ni evaluaciones de seguridad específicas de esta cuantización.
- Es una cuantización de terceros (prithivMLmods), no oficial del equipo Qwen; los resultados de rendimiento dependen de la configuración de prueba del autor (5 ejecuciones, seed fija, contexto de 16K).
- La prueba de rendimiento se realizó con contexto de 16.384 tokens; con contextos cercanos a los 262K nativos el consumo de VRAM y la latencia serán considerablemente mayores.
- La licencia Apache 2.0 del modelo base permite uso comercial, pero conviene revisar los términos del modelo base Qwen/Qwen3.6-35B-A3B para cualquier restricción adicional.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/prithivMLmods/Qwen3.6-35B-A3B-NVFP4-GGUF
- Fichero principal NVFP4: https://huggingface.co/prithivMLmods/Qwen3.6-35B-A3B-NVFP4-GGUF/blob/main/Qwen3.6-35B-A3B-NVFP4.gguf
- Fichero multimodal (mmproj): https://huggingface.co/prithivMLmods/Qwen3.6-35B-A3B-NVFP4-GGUF/blob/main/Qwen3.6-35B-A3B-NVFP4.mmproj.gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Autor de la cuantización: https://huggingface.co/prithivMLmods
