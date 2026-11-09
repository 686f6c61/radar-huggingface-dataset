# litert-community/Qwen3-4B-Instruct-2507

## Resumen

Qwen3-4B-Instruct-2507 LiteRT-LM es una conversión del modelo Qwen3-4B-Instruct-2507 de Alibaba Qwen, empaquetada por la comunidad litert-community para su ejecución en dispositivos mediante el runtime LiteRT-LM de Google AI Edge. El modelo base es un transformer denso de 4 mil millones de parámetros, publicado originalmente en julio de 2025 como actualización del Qwen3-4B con mejoras en instrucciones y razonamiento. Esta variante concreta no modifica los pesos de forma sustancial: aplica una receta de cuantización mixta INT4/INT8 para reducir el tamaño a aproximadamente 2,5 GiB y permitir inferencia local en móviles, portátiles y GPUs de consumo.

La relevancia de esta ficha radica en que LiteRT-LM es uno de los pocos runtimes de Google optimizados para aceleración GPU en Android (OpenCL) y WebGPU en escritorio, lo que permite ejecutar un modelo de 4B con ventanas de contexto de 2048 tokens en hardware que no dispone de VRAM dedicada. El repositorio incluye benchmarks medidos en dispositivos comerciales (Samsung, vivo, TECNO) y en una GPU de escritorio AMD Radeon AI PRO R9700, lo que facilita estimar el rendimiento antes de desplegar.

El modelo conserva la licencia Apache 2.0 del original y está pensado para generación de texto en inglés. No incluye modo thinking explícito (la variante 2507 de Qwen3-Instruct elimina el bloque de razonamiento visible por defecto), lo que simplifica su integración en aplicaciones de chat y asistentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3) |
| Parametros totales | 4 mil millones (aproximado, heredado del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens en el artefacto LiteRT-LM (el modelo base soporta más, pero el bundle está limitado a 2048) |
| Tipos de cuantizacion | Mixta: INT4 por bloques (group size 32) en proyecciones lineales elegibles, INT8 weight-only en embeddings, float para normalización, reducciones y KV cache |
| Idiomas soportados | Inglés (etiqueta `en` en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); el modelo base está en safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3-4B-Instruct-2507 es un transformer decoder-only denso de la familia Qwen3, entrenado por el equipo Qwen de Alibaba y descrito en el informe técnico arXiv:2505.09388. La variante 2507 corresponde a una actualización de la versión Instruct que refina la alineación con instrucciones y elimina el modo de razonamiento explícito por defecto. No se dispone en la información proporcionada de detalles sobre el número exacto de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO aplicadas al modelo base.

La conversión a LiteRT-LM aplica una receta de cuantización "quantize-first" basada en TorchAO. Las proyecciones lineales elegibles se almacenan como INT4 por bloques con grupo de tamaño 32 y escalas en coma flotante; los embeddings de tokens usan INT8 weight-only; y las rutas de normalización, reducción y la caché KV permanecen en coma flotante. El bundle utiliza operaciones compuestas StableHLO de LiteRT-LM (`odml.runtime_bmm` y `odml.cache_update`) para ejecutar atención y actualización de caché de forma eficiente en el backend. Esta mezcla busca preservar la calidad del modelo base reduciendo el peso a aproximadamente 2,5 GiB.

## Capacidades

- Generación de texto conversacional en inglés con instrucciones multi-turno.
- Razonamiento y respuesta a preguntas generales (el modelo base Qwen3-4B-Instruct-2507 está afinado para instrucciones).
- Generación de código y matemáticas básicas, heredadas del modelo base Qwen3.
- Soporte de plantilla de chat (chat template) integrada en el bundle; requiere runtime LiteRT-LM compatible.
- Ejecución en dispositivo con aceleración GPU (OpenCL en Android, WebGPU en escritorio) y fallback a CPU (XNNPACK).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking explícito en esta variante.
- Capacidad multilingüe limitada: la model card solo declara inglés.

## Casos de uso

- Asistentes de chat locales en móvil: el bundle ocupa unos 2,5 GiB y, con GPU OpenCL, el footprint privado pico ronda 1,5 GB en un Galaxy S26, lo que permite integrar un asistente conversacional sin enviar datos a la nube.
- Aplicaciones Android offline: con prefill de ~300 tok/s y decode de ~20 tok/s en Snapdragon 8 Elite Gen 5, es viable responder a consultas de 200-300 tokens en menos de un segundo de TTFT.
- Prototipado en portátil con WebGPU: en una GPU AMD Radeon AI PRO R9700 el modelo alcanza ~1325 tok/s de prefill y ~100 tok/s de decode, adecuado para demos y pruebas de UX antes de portar a móvil.
- Generación de texto en dispositivos de gama media: en un TECNO LJ9 el decode baja a ~9,6 tok/s, suficiente para resúmenes cortos o respuestas de chat con latencia tolerable.
- Educación y accesibilidad: despliegue de tutores o asistentes de lectura en dispositivos sin conectividad, con contexto de 2048 tokens para mantener el hilo de una conversación breve.
- Filtrado y clasificación de texto en el borde: al ser un modelo de 4B cuantizado, puede usarse para tareas de extracción o etiquetado ligero en local, reduciendo costes de inferencia en servidor.
- Evaluación comparativa de runtimes: sirve como referencia para medir el rendimiento de LiteRT-LM frente a otras pilas (llama.cpp, MLC) en el mismo hardware.

## Benchmarks y rendimiento

Datos publicados en la model card (medidos por el autor, no verificados por terceros):

| Dispositivo / Backend | Prefill (tok/s) | Decode (tok/s) | TTFT (s) | Footprint pico |
|---|---:|---:|---:|---:|
| Desktop GPU WebGPU (AMD Radeon AI PRO R9700) | 1324,75 | 100,75 | 0,20 | 1697 MB |
| Samsung SM-S937U1 GPU OpenCL | 375,67 | 18,51 | 0,74 | 1587 MB |
| vivo V2502A GPU OpenCL | 174,12 | 12,60 | 1,55 | 4720 MB |
| TECNO LJ9 GPU OpenCL | 102,57 | 9,65 | 2,60 | 4903 MB |

Medición comunitaria adicional en Samsung Galaxy S26 (SM-S942Q, Snapdragon 8 Elite Gen 5, Android 16, litert-lm v0.16.0, prompt fijo de 203 tokens):

| Backend | Prefill | Decode | TTFT | Init | RSS pico |
|---|---|---|---|---|---|
| GPU (OpenCL) | 305,7–306,2 tok/s | 19,87–19,88 tok/s | 0,71 s | 15,6–21,4 s | 1533–1534 MB |
| CPU (XNNPACK) | 46,1–55,6 tok/s | 8,4–9,2 tok/s | 3,8–4,5 s | 2,6–3,5 s | 4582–6093 MB |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) para esta variante cuantizada en la información disponible. Los datos del modelo base Qwen3-4B-Instruct-2507 no se incluyen en la model card.

## Requisitos de hardware

- VRAM/RAM estimada: el artefacto pesa ~2,5 GiB en disco; el footprint pico medido varía entre ~1,5 GB (GPU en Galaxy S26) y ~4,9 GB (GPU en TECNO LJ9), dependiendo del backend y del dispositivo.
- GPU de escritorio: funciona con WebGPU; se ha validado en AMD Radeon AI PRO R9700. No se documentan pruebas en A100, H100 ni RTX 4090 para este bundle.
- GPU móvil: requiere OpenCL; validado en Samsung SM-S937U1, vivo V2502A, TECNO LJ9 y Galaxy S26 (Snapdragon 8 Elite Gen 5).
- CPU: fallback XNNPACK disponible, con decode de ~8-9 tok/s y RSS pico de 4,6-6,1 GB en Galaxy S26; en móviles con menos de 6 GB libres puede activar el memory killer.
- Despliegue: runtime LiteRT-LM (`uvx litert-lm run --from-huggingface-repo=...`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en esta variante.
- Latencia: TTFT de 0,20 s en desktop WebGPU, 0,71 s en Galaxy S26 GPU y ~4 s en CPU. Inicialización del motor GPU: 15,6-21,4 s por proceso, frente a 2,6-3,5 s en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| Qwen3-4B-Instruct-2507 (LiteRT-LM, este) | ~4B | 2048 | Apache 2.0 | `.litertlm`, LiteRT-LM | Cuantización mixta INT4/INT8, optimizado para GPU móvil y WebGPU |
| Qwen3-4B-Instruct-2507 (original) | ~4B | no disponible en la información | Apache 2.0 | safetensors, transformers/vLLM | Pesos completos en BF16/FP16; requiere más memoria |
| Qwen3-4B (versión previa) | ~4B | no disponible en la información | Apache 2.0 | safetensors | Incluye modo thinking; la variante 2507 lo elimina por defecto |
| Otros modelos de 3-4B cuantizados para móvil (p. ej. Gemma, Llama 3.2 3B) | 3-4B | variable | variable | GGUF, `.litertlm`, MLC | No se dispone de comparación directa de rendimiento en la información proporcionada |

No se dispone de datos de benchmarks de calidad que permitan comparar rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Solo se declara inglés; el rendimiento en otros idiomas no está validado y puede degradarse.
- Contexto limitado a 2048 tokens en este bundle, inferior al del modelo base; conversaciones largas o documentos extensos requieren truncado o resumen previo.
- Riesgo de alucinación inherente a un modelo de 4B; no debe usarse como fuente de verdad sin verificación.
- La cuantización mixta INT4/INT8 puede introducir degradación de calidad respecto al modelo base en tareas sensibles (matemáticas, código complejo).
- Advertencia documentada: desde LiteRT-LM 0.18.0 la plantilla de chat del bundle lee solo `message.content` como string; con versiones 0.19.0 puede renderizar un turno de usuario vacío sin error y producir respuestas fuera de tema. Se recomienda pasar una plantilla compatible con `--chat-template` o usar versiones anteriores (0.17.1 funciona).
- Inicialización GPU lenta (15-21 s por proceso) en móvil; no apta para escenarios que requieran arranque instantáneo.
- En CPU, el RSS pico (4,6-6,1 GB) puede provocar cierres por el memory killer en dispositivos con poca RAM.
- Los benchmarks publicados son mediciones del autor y de la comunidad, no verificadas por terceros ni por MLCommons; dependen de SKU, build de OS, estado térmico, modo de batería, backend y versión del runtime.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo base y las condiciones de uso de LiteRT-LM.
- No se documenta soporte de tool calling, agentes ni visión en esta variante.

## Enlaces

- Hugging Face (este bundle): https://huggingface.co/litert-community/Qwen3-4B-Instruct-2507
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507/blob/main/LICENSE
- Informe técnico Qwen3 (arXiv): https://arxiv.org/abs/2505.09388
- Documentación LiteRT-LM: https://ai.google.dev/edge/litert-lm/overview
- Ejemplos LiteRT: https://github.com/google-ai-edge/litert-samples
- Instalación de uv: https://docs.astral.sh/uv/getting-started/installation/
