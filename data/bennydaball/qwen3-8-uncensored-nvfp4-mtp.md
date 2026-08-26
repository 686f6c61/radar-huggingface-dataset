# BennyDaBall/Qwen3.8-Uncensored-NVFP4-MTP

## Resumen

Qwen3.8-27B-Uncensored-NVFP4-MTP es una cuantización nativa en formato NVFP4 (punto flotante de 4 bits de NVIDIA) del modelo Qwen3.8-27B-Uncensored, una versión "abliterada" (sin censura) del Qwen3.8-27B desarrollada por Jonathan Coletti. El autor de esta cuantización, BennyDaBall, mantiene intacto el cabezal MTP (multi-token prediction) para decodificación especulativa sin necesidad de un modelo borrador externo, e incluye el proyector de visión en BF16 para capacidades multimodales. El resultado es un único archivo GGUF de 18,34 GiB que permite ejecutar un modelo de 27B parámetros con contexto nativo de 262 144 tokens en GPUs Blackwell (sm_120) a velocidades de entre 105 y 136 tokens por segundo en una RTX 5090.

La relevancia de este modelo radica en que combina tres características poco habituales en un solo archivo: cuantización FP4 nativa para tensor cores Blackwell, decodificación especulativa integrada mediante el cabezal MTP y ausencia de censura gracias al proceso de abliteración. Está pensado para desarrolladores que quieren un modelo local rápido, sin restricciones de contenido y con soporte de visión, ejecutable en hardware consumer de gama alta como la RTX 5090 o la RTX 5080. La licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención Gated DeltaNet, 64 capas, cabezal MTP de decodificación especulativa |
| Parametros totales | 27B (modelo base Qwen3.8-27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens nativos |
| Tipos de cuantizacion | NVFP4 (GGML type 40) para backbone; BF16 para lm_head, token embeddings y cabezal MTP |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo principal + mmproj-BF16.gguf para visión) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina atención tradicional con capas Gated DeltaNet, un mecanismo de estado recurrente que reduce el coste de atención en contextos largos. Sobre esta base, Jonathan Coletti aplicó un proceso de abliteración (Heretic) que elimina los vectores de dirección de rechazo aprendidos durante el alineamiento, dando lugar a una versión sin censura. BennyDaBall cuantizó posteriormente todo el backbone (atención, Gated DeltaNet y MLP) a NVFP4, un formato de 4 bits de punto flotante con bloques de 16 elementos, escala de bloque FP8 (E4M3) y escala global de tensor, diseñado para los tensor cores FP4 de Blackwell. El lm_head, las embeddings y el cabezal MTP se mantienen en BF16 para preservar la calidad de la salida y la capacidad de especulación. No se realizó ningún reentrenamiento ni destilación; es una cuantización limpia del modelo abliterado.

## Capacidades

- Generación de texto y razonamiento multi-paso con contexto largo de hasta 262 144 tokens.
- Generación de código y soporte de lenguajes de programación, con rendimiento especialmente alto en tareas estructuradas (medido a 136 tok/s en código con RTX 5090).
- Visión multimodal: procesamiento de imágenes y frames de vídeo mediante el proyector BF16 incluido (mmproj-BF16.gguf), cargable con `--mmproj` en llama.cpp.
- Decodificación especulativa MTP integrada: el cabezal MTP actúa como borrador interno, acelerando la generación entre 1,4 y 1,8 veces sin necesidad de un modelo externo.
- Tool calling y function calling, heredados del modelo base Qwen3.8, con soporte para integración en agentes.
- Capacidades de agente y razonamiento multi-step, incluyendo modo "thinking" activado por defecto en la plantilla de chat.
- Multilingüe en inglés y chino.
- Ausencia de censura de contenido gracias al proceso de abliteración, lo que permite generar respuestas sobre temas que el modelo original rechazaría.

## Casos de uso

- Generación de código en producción: con velocidades de 136 tok/s en código sobre RTX 5090 y soporte de tool calling, puede integrarse en pipelines de CI/CD para generar tests, documentación o parches, o como asistente de programación local sin latencia de red.
- Asistente conversacional sin restricciones: ideal para entornos de investigación o desarrollo donde se necesita explorar temas sensibles sin filtros, manteniendo la calidad conversacional del modelo Qwen3.8.
- Análisis de documentos con contexto largo: su ventana de 262 144 tokens permite procesar libros técnicos completos, bases de código extensas o expedientes legales en una sola pasada, con razonamiento multi-paso sobre el contenido.
- Procesamiento de imágenes y vídeo: con el proyector de visión BF16, puede describir capturas de pantalla, diagramas o frames de vídeo, útil para automatizar la documentación de interfaces o el análisis de material visual.
- Desarrollo de agentes autónomos: la combinación de tool calling, razonamiento multi-step y contexto largo permite construir agentes que ejecutan tareas complejas con múltiples llamadas a herramientas, como búsqueda web, ejecución de scripts o gestión de APIs.
- Investigación en alineación y seguridad: al ser un modelo abliterado, sirve como objeto de estudio para analizar el impacto de la eliminación de la censura en el comportamiento del modelo, comparando respuestas con la versión original.
- Despliegue de un asistente local privado: al ejecutarse completamente en local con llama.cpp o LM Studio, es adecuado para entornos con requisitos estrictos de privacidad donde no se permite enviar datos a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card únicamente incluye mediciones de velocidad de generación en una RTX 5090 con contexto de 131 072 tokens, caché KV en q8_0 y atención flash, que se resumen a continuación:

| Configuración | Prosa (tok/s) | Código (tok/s) | Contexto profundo 12k (tok/s) |
|---|---|---|---|
| Sin especulación (llama.cpp) | 75,2 | 74,0 | 72,2 |
| Con draft-mtp (llama.cpp) | 105,8 | 136,3 | 123,0 |
| Sin especulación (LM Studio) | 71,1 | 71,2 | 69,1 |
| Con MTP ajustado (LM Studio) | 79,9 | 88,9 | 89,3 |

Estas cifras son mediciones de una sola ejecución, no un benchmark formal. La aceleración por especulación MTP depende del hardware y del tipo de prompt; es mayor en salidas estructuradas (código, conteo, pasajes repetitivos) y menor en prosa creativa de alta entropía.

## Requisitos de hardware

- GPU obligatoria: arquitectura Blackwell (sm_120) para la ruta FP4 nativa. Modelos compatibles: RTX 5090, RTX 5080, RTX PRO (serie Blackwell). No funciona en GPUs anteriores (RTX 4090, A100, H100) porque carecen de tensor cores FP4.
- VRAM estimada según contexto (medido en RTX 5090):
  - 131 072 tokens de contexto: ~27,5 GiB
  - 229 376 tokens: ~29,2 GiB
  - 262 144 tokens (contexto completo): ~30,7 GiB
- El archivo mmproj de visión añade ~1 GiB adicional de VRAM.
- Opciones de despliegue: llama.cpp (llama-server) con kernels NVFP4 CUDA y arquitectura `qwen35`, o LM Studio 2.29.1+ con runtime `llama.cpp-nvidia-cuda12 2.29.1`.
- Para aprovechar la decodificación especulativa MTP se necesita una compilación de llama.cpp con la ruta `draft-mtp` (parámetros `--spec-type draft-mtp`, `--spec-draft-n-max 3`, `--spec-draft-p-split 0.2`).
- Throughput medido: 105-136 tok/s en RTX 5090 con MTP activado; 71-75 tok/s sin especulación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Censura | Visión |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-NVFP4-MTP (este) | 27B | 262 144 | NVFP4 + BF16 | Apache 2.0 | No (abliterado) | Sí |
| Qwen3.8-27B (original) | 27B | 262 144 | BF16/FP8 | Apache 2.0 | Sí | Sí |
| Qwen3.8-27B-Uncensored-FP8 | 27B | 262 144 | FP8 | Apache 2.0 | No (abliterado) | Sí |
| Qwen2.5-32B | 32B | 131 072 | BF16/GGUF | Apache 2.0 | Sí | No |

La principal diferencia frente al modelo original es la ausencia de censura y la cuantización NVFP4, que reduce el tamaño a 18,34 GiB frente a los ~54 GiB del BF16. Frente a la versión FP8, el NVFP4 es más compacto y aprovecha los tensor cores FP4 de Blackwell, pero requiere hardware específico. Qwen2.5-32B es una alternativa de tamaño similar pero sin visión y con contexto más corto.

## Limitaciones y advertencias

- Requiere hardware Blackwell (sm_120) obligatoriamente; no es ejecutable en GPUs anteriores, lo que limita su despliegue a equipos muy recientes.
- El proceso de abliteración elimina la censura pero puede degradar ligeramente la calidad en tareas de seguridad o alineación, y no garantiza la eliminación de todos los sesgos del modelo original.
- Riesgo de alucinación elevado en temas sensibles o de nicho, especialmente al no existir filtros de contenido que mitiguen respuestas incorrectas o dañinas.
- Solo soporta inglés y chino; no hay capacidades multilingües más amplias.
- El modo "thinking" está activado por defecto en la plantilla de chat. En LM Studio, si no se asigna un presupuesto de tokens generoso, todo el presupuesto puede consumirse en el bloque de razonamiento oculto y la respuesta visible quedará vacía. En llama-server hay que desactivarlo con `chat_template_kwargs: {"enable_thinking": false}`.
- La decodificación especulativa MTP es sensible a la configuración: valores de `--spec-draft-n-max` superiores a 4 o probabilidades de continuación superiores a 0,3 pueden resultar más lentos que la especulación desactivada. Requiere ajuste por hardware.
- No se han publicado benchmarks de calidad (MMLU, HumanEval, etc.) para esta cuantización, por lo que el impacto exacto del NVFP4 en la precisión no está documentado.
- El uso comercial está permitido por la licencia Apache 2.0, pero el modelo puede generar contenido ofensivo o inapropiado, lo que implica responsabilidad legal del desplegador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BennyDaBall/Qwen3.8-Uncensored-NVFP4-MTP
- Modelo base abliterado: https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored
- Guía de ejecución local (orcarouter): https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally
- Anuncio del autor en X: https://x.com/BennyDaBall_OG/status/2090890285626617866
- Repositorio oficial de Qwen3.8: https://github.com/QwenLM/Qwen3.8
