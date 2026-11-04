# litert-community/Qwen3-0.6B

## Resumen

litert-community/Qwen3-0.6B es una colección de artefactos derivados del modelo Qwen3-0.6B de Alibaba Qwen, empaquetados en formato LiteRT-LM para su despliegue en Android, macOS y otros entornos de escritorio mediante el runtime LiteRT-LM de Google. No se trata de un modelo nuevo, sino de conversiones cuantizadas y optimizadas del checkpoint original, orientadas a inferencia local en dispositivos con recursos limitados. El modelo base es un transformer denso de 0,6 mil millones de parámetros con capacidad de razonamiento explícito (thinking mode) y soporte de tool calling.

La relevancia de esta ficha reside en que el repositorio documenta con detalle inusual las recetas de cuantización, las métricas de rendimiento por dispositivo (Galaxy S26, Pixel 8a) y las dependencias exactas de versión del runtime. Esto lo convierte en un caso de referencia para quien necesite desplegar un LLM pequeño en producción móvil con requisitos de latencia y memoria medibles, en lugar de estimados teóricos.

El repositorio incluye cuatro artefactos con estrategias de cuantización distintas (INT8 dinámico, INT4 mixto con TorchAO, INT4 dinámico con composite ops para GPU y una variante a16w8 para NPU MediaTek), cada uno con su propio contexto máximo y tamaño en disco. La licencia Apache 2.0 del modelo base se mantiene.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), exportado a LiteRT-LM |
| Parámetros totales | 0,6 mil millones |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 4096 tokens (artefactos INT8 y INT4 dinámico); 2048 tokens (artefacto INT4 mixto); caché exportada de 32 768 tokens en el artefacto INT4 dinámico |
| Tipos de cuantización | INT8 dinámico (pesos) con KV en coma flotante; INT4 mixto TorchAO (bloque 32, escalas FP, embeddings INT8 weight-only); INT4 dinámico bloque 32 con activaciones FP32; a16w8 para NPU MediaTek |
| Idiomas soportados | inglés (según metadatos del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); el artefacto INT4 dinámico usa pesos externos en sección TFLiteWeights |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-0.6B, un transformer denso de la familia Qwen3. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del checkpoint original; esos datos corresponden a la model card de Qwen/Qwen3-0.6B, referenciada pero no incluida aquí.

La aportación técnica de este repositorio es la cadena de conversión. El artefacto INT8 se generó mediante `litert-torch` y el AI Edge Quantizer. El artefacto INT4 mixto emplea una receta TorchAO "quantize-first": las proyecciones lineales elegibles se almacenan como INT4 por bloques de 32 con escalas en coma flotante, los embeddings usan INT8 weight-only y las rutas de normalización, reducción y la caché KV permanecen en coma flotante. El artefacto INT4 dinámico (exportado con `export_hf` y `--apply_gpu_composites=True`) convierte en composite ops del runtime las operaciones de RMSNorm, QK-norm y RoPE, atención, SwiGLU y actualización de caché KV, además de fusionar las proyecciones QKV y Gate/Up; sus pesos se sitúan en una sección externa al grafo para reducir el tamaño del modelo. La variante MediaTek está dirigida a la NPU del SoC MT6993 con cuantización a16w8.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" activado por defecto: el razonamiento se emite por un canal separado (thought channel) y puede desactivarse con `enable_thinking=false`.
- Tool calling / function calling: el runtime LiteRT-LM parsea las llamadas a herramientas según la configuración oficial de Qwen3.
- Conversación multi-turno con plantilla de chat oficial de Qwen3.
- Capacidad multilingüe limitada: el repositorio declara únicamente inglés.
- Manejo correcto de caracteres Unicode y emojis en la salida (verificado en el artefacto INT8).
- Ejecución en CPU y GPU (OpenCL) en Android, y en macOS; el artefacto INT4 dinámico requiere LiteRT-LM 0.19.0 o superior para la ruta GPU.
- No se documentan capacidades de visión, audio ni agentes multi-paso autónomos en la información disponible.

## Casos de uso

- Asistentes conversacionales embebidos en aplicaciones Android: el artefacto INT4 mixto ocupa 474,61 MiB y cabe en el almacenamiento de un móvil de gama media, permitiendo conversaciones multi-turno con 2048 tokens de contexto sin conexión de red.
- Autocompletado y generación de texto en teclados o editores móviles: con 81,4 tok/s de decodificación en GPU (Galaxy S26) y 71,4 tok/s en la generación anterior, la latencia por token es inferior a 15 ms, adecuada para sugerencias en tiempo real.
- Clasificación y extracción de información en el dispositivo: el modo thinking desactivable permite respuestas directas de baja latencia para tareas de etiquetado o extracción de entidades en flujos de datos locales, sin enviar texto a servidores externos.
- Enrutamiento de tool calls en agentes ligeros: el runtime parsea las llamadas a funciones, de modo que el modelo puede decidir qué herramienta invocar en un pipeline de automatización local (por ejemplo, control de ajustes del sistema o consultas a una base de datos SQLite embebida).
- Prototipado de aplicaciones de IA generativa en escritorio macOS: la ruta GPU funciona en Mac con LiteRT-LM 0.17.1–0.19.0, lo que permite validar prompts y plantillas de chat antes de portar la app a Android.
- Despliegue en dispositivos con NPU MediaTek: la variante a16w8 para MT6993 permite descargar la inferencia a la NPU, liberando CPU y GPU para otras tareas del sistema en móviles de gama media con ese SoC.
- Evaluación comparativa de runtimes: los datos de prefill (3442 tok/s) y decodificación (81,4 tok/s) por dispositivo sirven como referencia para medir regresiones al actualizar versiones de LiteRT-LM o cambiar de backend (CPU frente a GPU).

## Benchmarks y rendimiento

Los datos publicados son mediciones de runtime en dispositivos concretos, no benchmarks de calidad de modelo (MMLU, HumanEval, GSM8K). No se han publicado resultados de benchmarks de calidad en la información disponible.

| Artefacto | Dispositivo / backend | Prefill | Decodificación | Contexto |
|---|---|---:|---:|---:|
| `Qwen3-0.6B_dynamic_wi4b32_afp32.litertlm` (nuevo, 2026-10-31) | Galaxy S26, GPU OpenCL, LiteRT-LM 0.19.0 | 3442 tok/s (1024 tok) | 81,4 tok/s | 4096 |
| Artefacto anterior (revisión `e6bb3e4a`) | Galaxy S26, GPU OpenCL | 2384 tok/s (1024 tok) | 71,4 tok/s | 4096 |
| `qwen3_0_6b_mixed_int4.litertlm` | no especificado en el fragmento | 256 tok de prefill | 256 tok de decodificación | 2048 |

Memoria pico (RSS, VmHWM) con prompt de 1355 tokens, 256 tokens de decodificación y caché KV de 2048:

| Dispositivo | Artefacto nuevo | Artefacto anterior |
|---|---:|---:|
| Pixel 8a | 1924–1929 MiB | 1495–1580 MiB |
| Galaxy S26 | 2034–2123 MiB | 1658–1765 MiB |

## Requisitos de hardware

- VRAM/RAM estimada: entre 1,5 y 2,1 GiB de RSS en pico para el artefacto INT4 dinámico con caché de 2048 tokens en móviles de gama alta; el artefacto INT8 de 586 MB requiere más memoria que el INT4.
- Tamaño en disco: 328 MiB (INT4 dinámico), 474,61 MiB (INT4 mixto), 586 MB (INT8), 992 MB (MediaTek a16w8).
- GPU recomendadas: GPU integradas de móviles con soporte OpenCL (Adreno en Galaxy S26, Mali en Pixel 8a); en escritorio, GPU de Apple vía Metal en macOS.
- Cabe en GPU de consumo: sí, en el sentido de que el modelo está diseñado para GPUs integradas móviles; no se proporcionan datos para RTX 4090, A100 o H100, y el formato `.litertlm` no es el habitual para esas plataformas.
- Opciones de despliegue: runtime LiteRT-LM (`litert_lm_advanced_main`), con versiones mínimas por artefacto: 0.18.0 para el INT8, 0.18.0/0.19.0 para el INT4 dinámico (CPU/GPU), 0.17.1–0.19.0 para el export anterior.
- Latencia y throughput: prefill de 3442 tok/s y decodificación de 81,4 tok/s en Galaxy S26 con GPU; en CPU el rendimiento es similar entre el artefacto nuevo y el anterior, pero con mayor consumo de memoria en el nuevo.
- Advertencia de compatibilidad: las builds Android de LiteRT-LM 0.18.0 y 0.18.1 se cuelgan con archivos de pesos externos; la ruta GPU del artefacto INT4 dinámico falla en LiteRT-LM 0.18.1 en Galaxy S26, Pixel 8a y Mac.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---:|---|---|---|
| litert-community/Qwen3-0.6B (este) | 0,6 B | 4096 (2048 en INT4 mixto) | Apache 2.0 | `.litertlm`, LiteRT-LM | Optimizado para Android/escritorio; métricas por dispositivo publicadas |
| Qwen/Qwen3-0.6B (base) | 0,6 B | no disponible en la información | Apache 2.0 | safetensors (Hugging Face) | Checkpoint original; requiere runtime genérico (transformers, llama.cpp, etc.) |
| Otros modelos de ~0,5 B en LiteRT-LM | no disponible | no disponible | no disponible | `.litertlm` | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de benchmarks de calidad que permitan comparar el rendimiento cognitivo frente a alternativas de tamaño similar.

## Limitaciones y advertencias

- El repositorio declara únicamente inglés como idioma soportado; el rendimiento en castellano no está validado y probablemente sea inferior.
- Un modelo de 0,6 B tiene capacidad limitada de razonamiento complejo y alta propensión a alucinaciones en tareas de conocimiento factual; no es adecuado para respuestas de alta precisión sin verificación.
- El contexto máximo práctico es de 4096 tokens (2048 en el artefacto INT4 mixto), insuficiente para documentos largos o conversaciones extensas.
- La licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen3-0.6B; conviene revisar la licencia original enlazada.
- Dependencia estricta de versiones del runtime: usar una versión incorrecta de LiteRT-LM provoca fallos de compilación de kernels o cuelgues con pesos externos.
- El artefacto INT4 dinámico consume más memoria que el anterior en CPU (hasta ~430 MiB adicionales en Pixel 8a) a cambio de un rendimiento similar; la elección depende de si se usa GPU.
- Las mediciones de rendimiento son de dispositivos concretos y dependen del SKU, la versión de OS, el estado térmico, el modo de batería y el backend; no son extrapolables sin validación.
- El formato `.litertlm` limita el despliegue a LiteRT-LM; no es directamente compatible con vLLM, TGI, llama.cpp u Ollama sin conversión adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/litert-community/Qwen3-0.6B
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-0.6B/blob/main/LICENSE
- Paper de Qwen3 (referencia arXiv en metadatos): https://arxiv.org/abs/2505.09388
- Revisión anterior del artefacto INT4 dinámico: https://huggingface.co/litert-community/Qwen3-0.6B/tree/e6bb3e4a1eb3f663153f0c1c12b735d64be657a7
