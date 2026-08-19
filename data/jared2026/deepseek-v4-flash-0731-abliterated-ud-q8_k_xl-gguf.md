# Jared2026/DeepSeek-V4-Flash-0731-Abliterated-UD-Q8_K_XL-GGUF

## Resumen

DeepSeek-V4-Flash-0731-Abliterated-UD-Q8_K_XL-GGUF es una conversión a formato GGUF del modelo base deepseek-ai/DeepSeek-V4-Flash-0731, cuantizada en 8 bits mediante el esquema Unsloth Dynamic UD-Q8_K_XL. Sobre el modelo original se ha aplicado un overlay de abliteration (mode-merged) sobre las proyecciones de salida de atención, con el objetivo de eliminar o reducir los rechazos y restricciones de contenido del modelo original. El resultado es un modelo de 284 334 567 511 parámetros (~284B) con arquitectura MoE de 256 expertos, de los cuales 6 están activos por token más 1 experto compartido.

La relevancia de esta versión reside en su viabilidad práctica de despliegue: con un peso total de 161,9 GB repartido en 5 shards, puede ejecutarse en una única estación de trabajo o nodo con una GPU de clase 20 GB, gracias a la opción `--cpu-moe` de llama.cpp, que mantiene los expertos en RAM del sistema y solo la atención y las capas densas en VRAM. El modelo soporta un contexto nativo de 65 536 tokens, ampliable hasta 1 048 576 mediante extensión rope-scaled YaRN (factor 16), aunque con degradación progresiva de calidad más allá de los 64K. Requiere una build reciente de llama.cpp (b10273 o posterior) que reconozca la arquitectura `deepseek4`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | deepseek4 (MoE, transformer con MLA) |
| Parametros totales | 284 334 567 511 (~284B) |
| Parametros activos | no disponible (configuracion MoE: 256 expertos, 6 activos + 1 compartido; etiqueta de tamano 256×8.4B) |
| Longitud de contexto | 65 536 nativo; 1 048 576 maximo con YaRN (rope-scaled, no entrenado) |
| Tipos de cuantizacion | UD-Q8_K_XL (Unsloth Dynamic, 8 bits) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (5 shards, 161,9 GB) |

## Arquitectura y entrenamiento

La arquitectura `deepseek4` es un transformer MoE con 43 capas, 256 expertos (6 activos + 1 compartido) y gating sigmoid normalizado con escala 1.5. La atención emplea MLA (Multi-head Latent Attention) con `head_count_kv = 1`, compresión de clave/valor de longitud 512 y rango q-LoRA de 1024, lo que reduce drásticamente el coste de la caché KV: 256K de contexto ocupa menos de 1 GB. Incorpora ventana deslizante de 128 y RoPE con base de frecuencia 10000 y extensión YaRN ×16. El tokenizador es GPT-2 BPE con pre-tokenizer `joyai-llm`.

No se dispone de información sobre el entrenamiento del modelo base (datos, número de tokens, métodos de alineación como RLHF o DPO). Esta versión es una redistribución cuantizada: el autor aplicó un overlay de abliteration mode-merged sobre las proyecciones de salida de atención del modelo original, y posteriormente cuantizó con el esquema UD-Q8_K_XL de Unsloth. Se incluyen para trazabilidad los ficheros `transplant_report.json` (registro tensor a tensor de la fusión) y `tensor_manifest_after.json`.

## Capacidades

- Generación de texto conversacional con plantilla de chat Jinja que emite un bloque de razonamiento ` thinking` por defecto.
- Razonamiento con dos niveles de esfuerzo efectivos: `default` y `max`. El nivel `max` inyecta una directiva explícita de "máximo absoluto, sin atajos" en el prompt del sistema. No existe gradación intermedia.
- Soporte de contexto largo: hasta 1 048 576 tokens con YaRN, aunque la calidad degrada progresivamente más allá de los 65 536 nativos; 262 144 (256K) es un ajuste razonable.
- Arquitectura MoE con 256 expertos, lo que permite mantener los expertos en RAM del sistema y solo la atención en GPU.
- Compatible con el servidor OpenAI-compatible de llama.cpp (`llama-server`), exponiendo una API en `/v1`.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no se especifica en la información disponible.

## Casos de uso

- Inferencia local en estación de trabajo con GPU de 20 GB: con `--cpu-moe`, la VRAM residente se mantiene por debajo de 20 GB mientras los 256 expertos residen en RAM del sistema (~180 GB), permitiendo ejecutar un modelo de 284B en hardware de consumo.
- Servidor de chat con API OpenAI-compatible: `llama-server` expone un endpoint `/v1` para integrar el modelo en aplicaciones existentes sin cambios de código.
- Razonamiento complejo con bloque de pensamiento: el modo `thinking` con `reasoning_effort=max` es adecuado para tareas de resolución de problemas, análisis y generación de explicaciones detalladas.
- Procesamiento de documentos largos: con contexto nativo de 65K y hasta 256K razonable, puede manejar informes extensos, libros o transcripciones completas en una sola pasada.
- Despliegue multi-GPU con MIG slices: se pueden nombrar explícitamente varios dispositivos (`--device CUDA0,CUDA1,...`) para repartir atención y capas densas, manteniendo los expertos en CPU.
- Ejecución solo CPU: el modelo funciona sin GPU, únicamente con RAM suficiente, útil para entornos sin aceleración hardware.
- Investigación sobre abliteration y modelos sin censura: al ser una versión abliterada, sirve para estudiar el efecto de la eliminación de rechazos en la calidad y el comportamiento del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: ~19-20 GB para atención y capas densas con `--cpu-moe`; los expertos se mantienen en RAM del sistema.
- RAM del sistema: ~180 GB para alojar los 256 expertos.
- GPU recomendada: cualquier GPU de clase 20 GB (por ejemplo, RTX 4090, A100 20GB, o MIG slices equivalentes). No se especifican modelos concretos en la documentación.
- Ejecución solo CPU: posible, sin GPU, siempre que se disponga de la RAM necesaria.
- Despliegue: llama.cpp (`llama-server` o `llama-cli`), con build b10273 (commit `a6aa6f545`) o posterior; builds anteriores fallan con error de arquitectura desconocida.
- Latencia y throughput: no disponibles en la información proporcionada.
- Nota: `--n-cpu-moe N` (mantener algunos expertos en GPU) no es recomendable con GPUs pequeñas o particionadas, ya que llama.cpp coloca todos los expertos residentes en GPU en un único dispositivo, lo que provocaría OOM en una tarjeta de 20 GB.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la información proporcionada. El modelo base es `deepseek-ai/DeepSeek-V4-Flash-0731`, del cual esta versión es una cuantización abliterada. No se conocen otras variantes cuantizadas del mismo modelo con las que comparar parámetros, contexto o rendimiento de forma fiable.

## Limitaciones y advertencias

- La extensión de contexto a 1 048 576 tokens es rope-scaled, no entrenada; la calidad degrada progresivamente más allá de los 65 536 nativos, por lo que 1M debe tratarse como un techo teórico, no como un contexto de trabajo.
- Requiere una build de llama.cpp posterior a agosto de 2026 (b10273 o superior); builds antiguas no reconocen la arquitectura `deepseek4` y fallan al cargar.
- El overlay de abliteration puede alterar el comportamiento de alineación del modelo original; no se documentan efectos sobre la calidad o la coherencia.
- No se han publicado datos sobre sesgos, alucinación o comportamiento en producción.
- Los idiomas soportados no están especificados; no se puede garantizar cobertura multilingüe.
- El tamaño del repositorio (161,9 GB) exige verificación de integridad mediante `sha256sum -c SHA256SUMS` antes de su uso.
- Licencia MIT: permite uso comercial, pero el modelo base y la cuantización pueden tener condiciones adicionales no documentadas en esta ficha.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Jared2026/DeepSeek-V4-Flash-0731-Abliterated-UD-Q8_K_XL-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
