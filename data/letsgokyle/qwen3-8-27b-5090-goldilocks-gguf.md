# letsgokyle/Qwen3.8-27B-5090-goldilocks-GGUF

## Resumen

El modelo `letsgokyle/Qwen3.8-27B-5090-goldilocks-GGUF` es una cuantización de precisión mixta en formato GGUF del modelo Qwen3.8-27B de Alibaba, diseñada específicamente para ejecutarse con el contexto completo en una única GPU RTX 5090 de 32 GB bajo Windows 11. El autor, letsgokyle, resuelve el problema de que las cuantizaciones estándar (Q6_K, Q8_0) dejan VRAM sin aprovechar o no caben con el contexto máximo: en lugar de usar un único nivel de cuantización, combina tensores en Q8_0, Q6_K y F32 según un mapa de sensibilidad por tensor, alcanzando 7.36 bpw efectivos y ocupando 23,990 MiB de pesos.

La relevancia de esta ficha radica en que no solo ofrece el archivo GGUF, sino también el script solver (`build_recipe.py`) y la receta exacta por tensor, lo que permite reproducir el proceso para otras GPUs con presupuestos de VRAM distintos. El modelo base Qwen3.8-27B es un modelo denso de 27.320 millones de parámetros con arquitectura híbrida (atención completa en 16 de 64 capas y capas lineales/SSM en el resto), contexto nativo de 262k tokens y capacidades de visión. Esta cuantización preserva la capa MTP (multi-token prediction) para habilitar decodificación especulativa en llama.cpp, y logra una fidelidad media frente al original BF16 con una divergencia KL de 0.001800.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8-27B (dense, híbrida: 16 capas full-attention + 48 capas linear/SSM, vision-language) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.000 tokens (texto) / 110.000 tokens (visión, con mmproj) |
| Tipos de cuantizacion | Mezcla de Q8_0 (339 tensores), Q6_K (167 tensores) y F32 (360 tensores); 7.36 bpw efectivo |
| Idiomas soportados | No disponible (el modelo base Qwen3.8 soporta múltiples idiomas, pero la model card no los detalla) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo único de 23,990 MiB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso con una arquitectura híbrida innovadora: solo 16 de sus 64 capas utilizan atención completa, mientras que las 48 restantes emplean capas lineales/SSM con estado de tamaño fijo. Esta característica hace que el coste de contexto sea reducido (aproximadamente 43 MiB por cada 1.000 tokens con KV cache en q8_0), lo que permite ventanas de contexto muy largas con una huella de VRAM moderada. El modelo fue entrenado por Alibaba con un contexto nativo de 262k tokens e incluye un codificador de visión, aunque el archivo mmproj no se incluye en este repositorio y debe descargarse por separado.

La cuantización "goldilocks" no es un entrenamiento adicional, sino un proceso de compresión post-entrenamiento. El autor parte de un mapa de sensibilidad por tensor generado con la herramienta GGUF Tool Suite de Thireus, y promueve tensores de Q6_K a Q8_0 en un orden basado en su impacto en la fidelidad, hasta llenar exactamente el presupuesto de VRAM medido en una RTX 5090 con el escritorio de Windows 11 activo. El resultado es una mezcla de 866 tensores (339 Q8_0, 167 Q6_K, 360 F32) que alcanza una divergencia KL media de 0.001800 frente al original BF16, con un 98.0% de coincidencia en el token más probable. Además, se preserva la capa MTP (blk.64) para permitir decodificación especulativa con `--spec-type draft-mtp` en llama.cpp.

## Capacidades

- Generación de texto y razonamiento multi-step con modo "thinking" configurable mediante la plantilla de chat incluida (niveles de esfuerzo de razonamiento: `max`, `xhigh`, `high`, `medium`, `low`, `minimal`).
- Capacidades de visión si se carga el archivo `mmproj-BF16.gguf` de unsloth, permitiendo entrada de imágenes con contexto de hasta 110k tokens.
- Decodificación especulativa nativa en llama.cpp gracias a la capa MTP preservada, combinada con n-gram y mapas de contexto (flags `--spec-type draft-mtp,ngram-mod,ngram-map-k4v`).
- Soporte de plantillas de chat Jinja personalizadas (se incluye `qwen3.8_chat_template_froggeric6level.jinja`).
- Compatible con la generación de texto estándar vía API de llama-server, con parámetros de muestreo recomendados para el modo thinking de Qwen3.8 (temp 1.0, top-p 0.95, top-k 20, min-p 0).
- No se confirma explícitamente en la model card el soporte de tool calling o function calling, aunque el modelo base Qwen3.8 lo incorpora; no se ha verificado en esta cuantización.

## Casos de uso

- Análisis de documentos extensos: con 131k tokens de contexto en modo texto, puede procesar libros técnicos completos, expedientes legales o informes financieros en una sola pasada, manteniendo coherencia a lo largo de la conversación. La arquitectura híbrida hace que el coste de contexto sea bajo (~43 MiB por 1k tokens).
- Asistente de programación local: el modelo base Qwen3.8-27B destaca en generación de código y razonamiento lógico. Con esta cuantización, un desarrollador con una RTX 5090 puede ejecutar un asistente de código privado, sin conexión, con ~100 tok/s de generación.
- Investigación en compresión de modelos: el repositorio incluye el solver y la receta por tensor, lo que permite a investigadores estudiar el impacto de la cuantización mixta en la fidelidad (métricas KL, same-top-token) y adaptar el proceso a otros modelos o GPUs.
- Despliegue de agentes con baja latencia: la decodificación especulativa vía MTP y los modos n-gram reducen la latencia de generación, adecuado para agentes que requieren múltiples pasos de razonamiento con respuestas rápidas.
- Procesamiento de imágenes con contexto largo: cargando el mmproj externo, se pueden analizar imágenes junto con largos textos (hasta 110k tokens), útil para revisión de diagramas técnicos, capturas de pantalla o documentos escaneados.
- Evaluación de fidelidad de cuantizaciones: los datos de KL divergencia y coincidencia de token más probable (98.0% vs BF16) permiten comparar objetivamente esta cuantización con otras alternativas (AD-Q6_K, UD-Q6_K_XL) antes de elegir un despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card proporciona métricas de fidelidad frente al modelo original BF16, medidas con `llama-perplexity --kl-divergence` sobre 143 fragmentos de un corpus mixto a contexto 512. La siguiente tabla resume los datos publicados:

| Metrica | Valor |
|---|---|
| Divergencia KL media vs BF16 | 0.001800 |
| Coincidencia de token más probable vs BF16 | 98.0% |
| Tamaño de pesos | 23,990 MiB (23.4 GiB) |
| Throughput de generación (RTX 5090, texto) | ~100 tok/s |
| VRAM usada en texto (131k contexto) | 30,715 / 32,607 MiB |
| VRAM usada en visión (110k contexto) | 30,949 / 32,607 MiB |

El autor indica que esta cuantización no supera en fidelidad a otras existentes: AtomicChat AD-Q6_K tiene una fidelidad estadísticamente idéntica con un tamaño similar, y Unsloth UD-Q6_K_XL es ligeramente más cercano al BF16 por ~0.7 GiB adicionales. El valor añadido está en la receta reproducible y el ajuste exacto al presupuesto de la RTX 5090.

## Requisitos de hardware

- VRAM mínima: 32 GB (la cuantización está diseñada para una RTX 5090 con 32,607 MiB disponibles; el uso medido es de 30,715 MiB en modo texto y 30,949 MiB en visión).
- GPU recomendada: NVIDIA RTX 5090 (32 GB, arquitectura Blackwell, `sm_120a`). No cabe en GPUs de 24 GB (como RTX 4090) con el contexto completo; en esas tarjetas habría que reducir el contexto o usar una cuantización más agresiva.
- En GPUs de 48 GB (como RTX A6000 o RTX 6000 Ada) funcionaría sin problema y con margen adicional.
- Opciones de despliegue: llama.cpp (llama-server) con la configuración proporcionada en la model card (build 10437 o superior, CUDA 13.3). No se mencionan otros backends (Ollama, vLLM, TGI) en la documentación, aunque al ser GGUF podría ser compatible con ellos si soportan la mezcla de tipos de tensor.
- Latencia y throughput: ~100 tok/s medidos en la RTX 5090 con la configuración de servidor indicada (contexto 131k, KV cache q8_0, decodificación especulativa activa).
- Detalles de carga: se recomienda `--load-mode dio` (5.5 s de carga, 2× más rápido que mmap en este sistema) y mantener la caché de prompt en RAM del host para reutilizar prompts largos.

## Comparativa con modelos similares

La siguiente tabla compara esta cuantización con otras versiones GGUF del mismo modelo base Qwen3.8-27B:

| Modelo | Tamaño de pesos | bpw efectivo | Fidelidad (KL media vs BF16) | Contexto máximo | Licencia |
|---|---|---|---|---|---|
| letsgokyle goldilocks (este) | 23,990 MiB | 7.36 | 0.001800 | 131k (texto) / 110k (visión) | Apache 2.0 |
| AtomicChat AD-Q6_K | ~22.9–23.8 GiB | ~6.5 | Estadísticamente idéntico al goldilocks | Depende de VRAM | Apache 2.0 |
| Unsloth UD-Q6_K_XL | ~24.7 GiB | ~6.6 | Ligeramente mejor que goldilocks | Depende de VRAM | Apache 2.0 |
| Original BF16 | ~54 GiB (aprox.) | 16 | Referencia | 262k | Apache 2.0 |

La comparativa se basa en los datos publicados en la model card. No se dispone de benchmarks de tareas (MMLU, HumanEval) para estas cuantizaciones concretas. El modelo original Qwen3.8-27B es la referencia de fidelidad, pero requiere más del doble de VRAM.

## Limitaciones y advertencias

- Esta cuantización está optimizada para un único hardware (RTX 5090, Windows 11, CUDA 13.3, `sm_120a`). En otras GPUs o sistemas operativos puede no alcanzar el mismo rendimiento o incluso no cargar correctamente.
- No incluye el archivo de proyección de visión (`mmproj`); debe descargarse de `unsloth/Qwen3.8-27B-GGUF` y pasarse con `--mmproj`. Sin él, el modelo solo funciona en modo texto.
- El contexto máximo de 131k tokens es inferior al nativo de 262k del modelo base, debido a las limitaciones de VRAM de la RTX 5090. Con el mmproj cargado, el contexto se reduce a 110k; superar ese límite rompe un margen de seguridad de 1.5 GiB.
- La mezcla de cuantizaciones (Q8_0, Q6_K, F32) no es un formato estándar: algunos backends o herramientas de cuantización podrían no reconocerla correctamente. Se recomienda usar la versión de llama.cpp indicada (build 10437 o superior).
- Riesgo de alucinación inherente a cualquier modelo de lenguaje: aunque la fidelidad frente al BF16 es alta (98% de coincidencia en el token más probable), el modelo puede generar contenido plausible pero incorrecto, especialmente en tareas de razonamiento complejo.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.8-27B puede tener términos adicionales de uso aceptable (deben consultarse en la documentación oficial de Qwen).
- No se han publicado resultados de benchmarks de tareas estándar para esta cuantización; las métricas de fidelidad KL no garantizan el rendimiento en tareas específicas.

## Enlaces

- Repositorio HuggingFace: [letsgokyle/Qwen3.8-27B-5090-goldilocks-GGUF](https://huggingface.co/letsgokyle/Qwen3.8-27B-5090-goldilocks-GGUF)
- Modelo base: [Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- GGUF de referencia (mmproj y otras cuantizaciones): [unsloth/Qwen3.8-27B-GGUF](https://huggingface.co/unsloth/Qwen3.8-27B-GGUF)
- GGUF oficial de ggml-org: [ggml-org/Qwen3.8-27B-GGUF](https://huggingface.co/ggml-org/Qwen3.8-27B-GGUF)
- Herramienta GGUF Tool Suite de Thireus: [Thireus](https://huggingface.co/Thireus)
- Plantillas de chat de froggeric: [froggeric/Qwen-Fixed-Chat-Templates](https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates)
- Guía de ejecución local (Ollama, GGUF): [yottalabs.ai](https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026)
- Análisis del modelo: [Geeky Gadgets](https://www.geeky-gadgets.com/qwen-3-8-27b-local-ai-review/)
