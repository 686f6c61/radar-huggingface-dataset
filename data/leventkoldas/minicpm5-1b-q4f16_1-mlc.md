# leventkoldas/MiniCPM5-1B-q4f16_1-MLC

## Resumen

MiniCPM5-1B-q4f16_1-MLC es una conversión al formato MLC-LLM del modelo denso openbmb/MiniCPM5-1B, publicada por el usuario leventkoldas. El artefacto incluye los pesos cuantizados en `q4f16_1` (int4 con grupo de 32 y cómputo en fp16), la configuración de chat de MLC y una biblioteca WebGPU precompilada (`.wasm`) compatible con WebLLM v0.2.87, lo que permite ejecutar el modelo directamente en el navegador mediante WebGPU sin backend remoto.

El modelo base es un transformer denso de 1.000 millones de parámetros con arquitectura estándar `LlamaForCausalLM` (24 capas, dimensión oculta 1536, 16 cabezas de consulta y 2 de clave/valor, `head_dim=128`, precisión bf16), primer checkpoint de la serie MiniCPM5 de OpenBMB. Está pensado para asistentes locales, agentes de código, flujos con uso de herramientas y razonamiento en entornos con recursos limitados.

La relevancia de esta ficha concreta es la distribución: el paquete pesa 608 MB de pesos (4,5 bits por parámetro) y requiere unos 1500 MB de VRAM según el registro de WebLLM incluido, lo que lo sitúa en el rango de GPUs integradas y portátiles. No obstante, la plantilla de conversación de MLC empleada no soporta tool calling, un recorte importante frente al modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso, `LlamaForCausalLM` (24 capas, hidden 1536, 16 Q / 2 KV heads, head_dim 128) |
| Parámetros totales | 1B (modelo base) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 4096 tokens (por defecto en compilación), prefill chunk 1024 |
| Tipos de cuantización | `q4f16_1` (int4, group size 32, cómputo fp16); 4,5 bits/parámetro |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLC (`tensor-cache.json` + `params_shard_*.bin`, 15 shards); biblioteca WebGPU `.wasm` |

## Arquitectura y entrenamiento

El modelo base es un transformer denso convencional con la arquitectura de Llama, sin mecanismos MoE, SSM ni atención lineal. La conversión MLC no altera la topología: solo cuantiza los pesos a int4 con grupo de 32 y compila una biblioteca WebGPU mediante MLC-LLM (`mlc-ai/mlc-llm@44fd06d`), TVM (`mlc-ai/relax@629cc65`) y Emscripten 3.1.56. La ABI del binario coincide con la de las bibliotecas oficiales de WebLLM v0.2.87 (11 importaciones y 92 exportaciones verificadas como idénticas).

No se dispone de información sobre el corpus de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO) en la documentación proporcionada. Sí se documenta el comportamiento de plantilla: formato ChatML con `<|im_start|>role\n…<|im_end|>\n`, BOS token 0, tokens de parada 1 (`</s>`) y 130073 (`<|im_end|>`), sin system prompt por defecto y con eliminación de bloques `<think>` históricos. El modo de razonamiento se controla con `extra_body.enable_thinking`; al desactivarlo se prellena `<think>\n\n</think>\n\n`, el prompt nativo sin pensamiento.

## Capacidades

- Generación de texto conversacional multi-turno en el navegador vía WebLLM.
- Razonamiento explícito en modo thinking (bloques `<think>`), activable por petición.
- Aritmética básica verificada: `84 * 3 / 2` → `60`, `17 + 25` → `42` con thinking activo.
- Conocimiento factual elemental verificado: capital de Francia → `Paris`.
- Tokenizador byte-level con vocabulario de 130560 entradas.
- Ejecución totalmente local en el cliente mediante WebGPU, sin llamadas a servidor.
- **No soporta tool calling** con la plantilla de conversación MLC empleada.
- Capacidades multilingües: no disponibles en la documentación.
- Sin soporte de visión, audio ni otras modalidades.

## Casos de uso

- Asistentes web embebidos sin backend: el paquete de 608 MB y 1500 MB de VRAM permite desplegar un chat en una página estática; el modelo corre en la GPU del visitante y evita costes de inferencia y problemas de privacidad.
- Demos educativas de WebGPU y WebLLM: sirve como ejemplo mínimo de integración de un modelo Llama-like en el navegador con `CreateMLCEngine` y configuración de `appConfig`.
- Prototipado de agentes locales en el navegador: con 4096 tokens de contexto puede mantener conversaciones multi-turno enviando el historial completo en cada petición para reutilizar la caché KV.
- Clasificación y resumen de textos cortos en el cliente: adecuado para formularios, correos o notas de menos de 3.000 tokens donde la latencia de red es inaceptable.
- Generación de texto offline en portátiles con GPU integrada: verificado en Intel Iris Xe (Vulkan) con Chrome for Testing 158 a 39–52 tokens/s de decodificación.
- Filtrado y reescritura de contenido en aplicaciones de escritorio Electron o Tauri que embeban WebLLM, sin dependencia de servicios externos.
- Evaluación comparativa de cuantizaciones: el artefacto permite medir calidad frente a otras variantes MLC del mismo modelo base en un mismo entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Únicamente se documentan pruebas cualitativas de humo en Chrome for Testing 158 sobre Intel Iris Xe (Vulkan): `84 * 3 / 2` → `60`, capital de Francia → `Paris` y `17 + 25` → `42` con thinking, con un rendimiento de decodificación de aproximadamente 39–52 tokens/s.

## Requisitos de hardware

- VRAM estimada: 1500 MB según el registro de WebLLM incluido (`vram_required_MB: 1500`, `low_resource_required: true`).
- Tamaño en disco/red: 608 MB de pesos en 15 shards más 6,66 MB de biblioteca `.wasm`.
- GPU compatibles: cualquier GPU con soporte de WebGPU en el navegador; verificado en Intel Iris Xe (Vulkan) con Chrome for Testing 158.
- Cabe en GPUs integradas y en portátiles; no requiere GPU dedicada.
- Despliegue: WebLLM v0.2.87 (`@mlc-ai/web-llm`) en navegador. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este repositorio.
- Throughput medido: 39–52 tokens/s de decodificación en Intel Iris Xe; latencia de prefill no documentada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| MiniCPM5-1B-q4f16_1-MLC (este) | 1B | 4096 | MLC + WebGPU | Apache 2.0 | Sin tool calling en la plantilla MLC |
| openbmb/MiniCPM5-1B | 1B | no disponible | safetensors (bf16) | Apache 2.0 | Modelo original; soporta tool-use según el proyecto |
| Otras variantes MLC del mismo base | 1B | 4096 | MLC | Apache 2.0 | No documentadas en la información disponible |

No se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Tool calling no soportado por la plantilla de conversación MLC utilizada, pese a que el modelo base está orientado a flujos con herramientas.
- Con 1B de parámetros, el muestreo sin thinking a temperatura 0,9 puede producir errores aritméticos; se recomienda activar thinking cuando la precisión importe.
- Contexto limitado a 4096 tokens en la compilación por defecto.
- Idiomas soportados no documentados; no se garantiza calidad multilingüe.
- Riesgo de alucinación inherente a modelos de este tamaño; no apto para tareas factuales críticas sin verificación.
- Sesgos del modelo base no documentados en esta ficha.
- La API de chat de WebLLM es stateless: hay que reenviar el historial completo en cada petición.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; es una conversión de terceros, no oficial de OpenBMB.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar los términos del modelo base y de las dependencias (MLC-LLM, TVM, Emscripten).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/leventkoldas/MiniCPM5-1B-q4f16_1-MLC
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-1B
- Space de demostración: https://huggingface.co/spaces/leventkoldas/minicpm5-1b-web
- Repositorio GitHub de MiniCPM5: https://github.com/jerrycxj/minicpm
- WebLLM: https://github.com/mlc-ai/web-llm
- MLC-LLM: https://github.com/mlc-ai/mlc-llm
