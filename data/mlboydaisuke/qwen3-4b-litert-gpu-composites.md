# mlboydaisuke/Qwen3-4B-LiteRT-gpu-composites

## Resumen

Qwen3-4B-LiteRT-gpu-composites es un conjunto de exportaciones experimentales del modelo Qwen3-4B de Alibaba, convertidas al formato LiteRT-LM (el runtime de Google AI Edge para inferencia en dispositivos) mediante la herramienta litert-torch. El autor, mlboydaisuke, publica dos variantes del bundle que difieren en el número de flags de optimización de GPU aplicadas durante la exportación (11 flags frente a 9 flags), con pesos cuantizados a int4 en bloques de 32 y activaciones en fp32. No se trata de un modelo nuevo ni de un fine-tune, sino de una reempaquetadura del Qwen3-4B original para su ejecución acelerada por GPU en el ecosistema LiteRT.

La relevancia de esta publicación es fundamentalmente técnica: documenta el estado de madurez de las rutas GPU de LiteRT-LM 0.17.0 en macOS, tanto por WebGPU como por el acelerador Metal. El autor es explícito al señalar que no es una release y que la variante de 11 flags todavía no produce salidas correctas en las rutas GPU de macOS, mientras que la de 9 flags funciona con rendimiento medido (117 tok/s de decodificación y 1,41k tok/s de prefill en WebGPU sobre un Mac Studio M4 Max).

El modelo base, Qwen3-4B, es un transformer denso de 4 mil millones de parámetros con capacidad de razonamiento en modo "thinking", multilingüe y con soporte de tool calling. Esta exportación conserva el tokenizador, la plantilla de chat y los metadatos del original, pero limita el contexto efectivo a una firma de prefill fija de 1.024 tokens y una caché de 32.768 tokens.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), exportado a grafo LiteRT-LM con composites de GPU |
| Parámetros totales | 4 mil millones (modelo base Qwen3-4B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | Caché de 32.768 tokens (32771 tras redondeo a primo); firma de prefill fija de 1.024 tokens; `max_num_tokens` 4.096 en metadatos |
| Tipos de cuantización | Pesos int4 blockwise-32, activaciones fp32 (`dynamic_wi4b32_afp32`) |
| Idiomas soportados | no disponible en la información proporcionada (heredados del Qwen3-4B base) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (bundle LiteRT-LM); no se distribuyen safetensors ni GGUF en este repo |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-4B, un transformer denso de la familia Qwen3. Esta publicación no entrena ni ajusta el modelo: parte de los pesos oficiales de Qwen/Qwen3-4B y los convierte a un grafo LiteRT mediante litert-torch (commit `6d4c622` de upstream/main, de 2026-09-08), con litert-lm-builder 0.17.0, ai-edge-litert 2.2.0, ai-edge-quantizer 0.9.0, torch 2.13.0 y transformers 5.14.1.

La innovación técnica está en la fusión de operaciones para GPU: la variante de 11 flags incorpora los composites `odml.qkv_norm_rope`, `odml.swiglu`, `odml.cache_update` y `odml.sdpa_transposed` (en decodificación), además de proyecciones QKV y gate-up fusionadas y una máscara booleana. La variante de 9 flags omite `--use_sdpa_composite` y `--use_qkv_norm_rope_composite`. La cuantización es dinámica: pesos int4 en bloques de 32 con activaciones fp32. Los metadatos del bundle provienen de `LlmMetadataProto.pbtext` de LiteRT-LM v0.17.0, con sampler TOP_P (k=20, p=0.95, t=0.6) y stop token `<|im_end|>`. La plantilla de chat se actualizó el 2026-09-21 para aceptar la forma de content-parts de la versión 0.18.

## Capacidades

- Generación de texto y razonamiento, heredados de Qwen3-4B, incluyendo modo "thinking" (desactivable con `--thinking false`).
- Respuesta a preguntas y conversación multi-turno mediante plantilla de chat compatible con content-parts (v0.18).
- Soporte de tool calling y function calling a través de la plantilla de chat y del prefacio de conversación con herramientas (el autor documenta un caso límite con prefacios que contienen tools y ningún mensaje).
- Capacidades multilingües del modelo base (no detalladas en esta publicación).
- Ejecución acelerada por GPU en macOS mediante WebGPU (wheel de PyPI) y Metal (build desde el tag v0.17.0).
- Inferencia con caché dinámica de GPU habilitada (`--enable_gpu_dynamic_cache`).
- No se documentan capacidades de visión ni audio en esta exportación.

## Casos de uso

- Evaluación de la madurez de LiteRT-LM en GPU: usar los dos bundles como banco de pruebas para comparar la ruta WebGPU frente a Metal y detectar regresiones en composites como `odml.sdpa_transposed` o `odml.qkv_norm_rope`.
- Inferencia local en estaciones de trabajo Apple Silicon: desplegar la variante de 9 flags con `litert-lm run --backend gpu` para asistentes de texto en local con 117 tok/s de decodificación en un M4 Max.
- Prototipado de aplicaciones on-device: validar flujos de chat y tool calling antes de portar a Android o iOS, aunque el autor advierte que esas plataformas no se han medido.
- Benchmarking de cuantización int4: comparar el rendimiento de `dynamic_wi4b32_afp32` frente a otras recetas en el mismo hardware y con la misma caché de 32.768 tokens.
- Reproducción de pipelines de exportación: servir como referencia ejecutable del comando `litert_torch.generative.export_hf` con flags de composites, útil para equipos que exporten otros modelos Qwen3.
- Investigación sobre fusión de operadores: analizar los fallos de validación WGSL y los desajustes de forma en `qkv_norm_rope` (1,32,1024,1,128 frente a 1,16,1024,1,128) para contribuir correcciones al runtime.
- Docencia y divulgación técnica: ilustrar las diferencias prácticas entre un grafo con composites y uno sin ellos en términos de corrección y velocidad.

## Benchmarks y rendimiento

Mediciones del autor sobre LiteRT-LM 0.17.0 en macOS, Mac Studio M4 Max, con los ficheros de la versión previa (prefill dinámico `prefill_1031`, metadatos generados por el exportador; grafos por lo demás idénticos). El autor indica que los ficheros actuales de prefill fijo a 1.024 se re-verificaron el 2026-09-11 con los mismos modos de fallo y velocidades dentro del 3 %.

| Fichero | Ruta WebGPU (wheel PyPI litert-lm 0.17.0) | Ruta Metal (litert_lm_main v0.17.0 + libLiteRtMetalAccelerator.dylib) |
|---|---|---|
| 11 flags | No ejecuta: `odml.sdpa_transposed` y `odml.qkv_norm_rope` fallan la validación WGSL; salida `!!` | Compila pero salida incorrecta (en blanco); 72 errores de forma en `qkv_norm_rope` y 36 en `flash_decode_sdpa` |
| 9 flags | Decode 117 tok/s; prefill 1,41k tok/s (medianas de 3 procesos, `-p 1024 -d 128 --cache no`); sanity check 8/8 | Decode 103 tok/s; prefill 1,4k tok/s (prompt de 996 tokens, contexto 4.096, decode hasta EOS, medianas de 3); 8/8 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible. Android e iOS no se han medido.

## Requisitos de hardware

- VRAM/almacenamiento: el fichero de 11 flags ocupa 2.270.694.352 bytes (~2,27 GB) y el de 9 flags 2.270.290.496 bytes (~2,27 GB); el repo completo pesa 13,6 GB por el historial de commits.
- GPU recomendadas: el autor valida en Mac Studio M4 Max (Apple Silicon). No se documentan pruebas en A100, H100 ni RTX 4090, por lo que su comportamiento en GPU NVIDIA o AMD no está verificado.
- GPU de consumo: por tamaño (~2,27 GB de pesos int4) cabría en cualquier GPU con más de 3-4 GB de memoria, pero la compatibilidad real depende de las rutas de LiteRT-LM, no del tamaño.
- Despliegue: `litert-lm` (versión 0.17.0 para las mediciones; 0.18.1 y 0.19.0 para ejecución con matices), `litert-lm benchmark`, y build de `litert_lm_main` desde el tag v0.17.0 con `--//runtime/executor:gpu_accelerator=metal`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 117 tok/s decode y 1,41k tok/s prefill en WebGPU; 103 tok/s decode y ~1,4k tok/s prefill en Metal (9 flags, M4 Max).
- Requisito de `max_num_tokens`: con litert-lm 0.19.0 o superior hay que crear el Engine con `max_num_tokens` 4.096, porque el primer prefill falla con `FAILED_PRECONDITION` si se usa 1.024.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B-LiteRT-gpu-composites (9 flags) | 4B | Caché 32.768; prefill fijo 1.024 | `.litertlm` int4 | Apache 2.0 | Hugging Face, 196 descargas |
| Qwen/Qwen3-4B (original) | 4B | No disponible en la información proporcionada | safetensors | Apache 2.0 | Hugging Face (modelo base) |
| LiteRT-LM Qwen3-0.6B (referencia del autor) | 0,6B | No disponible | `.litertlm` | Apache 2.0 | Usado en el A/B de velocidad del autor |

No se dispone de datos de benchmarks de calidad para establecer una comparación de rendimiento frente a alternativas; la comparación se limita a formato, licencia y disponibilidad.

## Limitaciones y advertencias

- No es una release: el autor lo declara explícitamente como exportación de prueba; la variante de 11 flags no produce salida correcta en las rutas GPU de macOS con LiteRT-LM 0.17.0.
- La variante de 11 flags devuelve basura en WebGPU con litert-lm 0.18.1 y requiere 0.19.0 o superior; incluso así, en Metal la salida es incorrecta (en blanco).
- El prefill está fijado a 1.024 tokens; prompts más largos dependen de la gestión de `max_num_tokens` del runtime y pueden fallar con `FAILED_PRECONDITION` en 0.19.0 si no se configura a 4.096.
- Solo se ha medido en macOS (M4 Max); Android e iOS no están medidos y no hay datos en GPU NVIDIA o AMD.
- Caso límite documentado: un prefacio de conversación con herramientas y sin mensajes provoca un renderizado incorrecto de la plantilla de chat.
- Riesgo de alucinación y sesgos: heredados del Qwen3-4B base; no se documentan evaluaciones de sesgo en esta publicación.
- Idiomas soportados: no disponibles en la información proporcionada; conviene consultar la model card del Qwen3-4B original.
- Licencia Apache 2.0 permite uso comercial, pero la corrección funcional del bundle no está garantizada en todas las rutas, lo que desaconseja su uso en producción sin validación previa.

## Enlaces

- Hugging Face: https://huggingface.co/mlboydaisuke/Qwen3-4B-LiteRT-gpu-composites
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- litert-torch (commit de exportación): https://github.com/google-ai-edge/litert-torch/commit/6d4c622c9a3aade4d411a1e859c6bbe571d38ee0
- LiteRT-LM (tag v0.17.0): https://github.com/google-ai-edge/LiteRT-LM/tree/v0.17.0
- Metadatos Qwen3 de LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM/blob/v0.17.0/models/qwen3/LlmMetadataProto.pbtext
- Plantilla de chat (macro `format_content`): https://github.com/john-rocky/hf-to-litertlm/blob/main/tools/chat_template_parts/dual/4155a0aa5616.jinja
- Herramienta `swap_template.py`: https://github.com/john-rocky/hf-to-litertlm/tree/main/tools/chat_template_parts
