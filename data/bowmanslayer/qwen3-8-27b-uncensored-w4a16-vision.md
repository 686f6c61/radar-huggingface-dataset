# bowmanslayer/Qwen3.8-27B-Uncensored-W4A16-vision

## Resumen

`bowmanslayer/Qwen3.8-27B-Uncensored-W4A16-vision` es una cuantización W4A16 (4 bits, grupo de 128) del modelo `JonathanColetti/Qwen3.8-27B-Uncensored`, que a su vez es una versión "abliterada" (sin censura) del `Qwen/Qwen3.8-27B` de Alibaba. El resultado es un modelo vision-language (image-text-to-text) de 27.000 millones de parámetros con arquitectura híbrida Gated Delta Networks (GDN), ventana de contexto nativa de 262.144 tokens y licencia Apache 2.0. El autor, bowmanslayer, ha preservado el vision tower en bf16 y ha omitido la cabeza MTP (Multi-Token Prediction) en esta variante, reduciendo el peso en disco a 18 GB.

La relevancia de este modelo radica en que permite ejecutar un LLM multimodal de gran tamaño en hardware de gama media (verificado en 2×RTX 3090 con tensor parallelism), manteniendo la calidad visual gracias al encoder de visión sin cuantizar y ofreciendo capacidades de razonamiento explícito (thinking mode) y tool calling. Es una opción atractiva para desarrolladores que necesitan un modelo sin restricciones de contenido, con soporte nativo de imagen y video, y que puedan desplegar en entornos con VRAM limitada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dense hybrid Gated Delta Networks (GDN) vision-language, 64 capas (16 full attention + 48 linear attention) |
| Parametros totales | 27.000 millones (27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | W4A16 (4 bits, group size 128) con kernel Marlin |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (para vLLM, compatible con GPTQ/Marlin) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.8-27B` emplea una arquitectura híbrida Gated Delta Networks (GDN), combinando 16 capas de atención completa (full attention) con 48 capas de atención lineal (linear attention) sobre un total de 64 capas. Esta hibridación permite manejar secuencias largas de forma eficiente. El modelo fue entrenado por Qwen con fusión temprana (early fusion) sobre billones de tokens multimodales, logrando paridad con Qwen3 en tareas de texto y superando a Qwen3-VL en razonamiento, código, agentes y comprensión visual.

Sobre esta base, JonathanColetti aplicó una técnica de abliteración (uncensoring) mediante la herramienta Heretic, con una búsqueda Pareto de 200 ensayos, eliminando las direcciones de activación asociadas al rechazo de contenido. Posteriormente, bowmanslayer realizó la cuantización W4A16 con AutoRound, calibrando solo con texto (256 muestras de 2048 tokens del dataset `NeelNanda/pile-10k`). El proceso excluye las capas `linear_attn.in_proj_a/b` de la cuantización para preservar la estabilidad de la atención lineal, y el vision tower se extrae antes de la calibración y se reempaqueta después en bf16, evitando que AutoRound active su modo MLLM con un dataset incorrecto. La cabeza MTP se copia sin cuantizar en la variante `-vision-mtp`, pero se omite en esta versión por no aportar beneficio en el hardware de prueba.

## Capacidades

- Generación de texto y razonamiento multilingüe (inglés y chino) con modo de pensamiento explícito (`thinking` block) configurable.
- Comprensión de imágenes y video: acepta hasta 8 imágenes y 2 videos por petición, con un presupuesto de 2.048 tokens para el encoder de visión.
- Tool calling / function calling: compatible con el parser `qwen3_coder` en vLLM, lo que permite integración con herramientas externas.
- Razonamiento multi-paso y ejecución de agentes: soporta tareas de largo horizonte gracias a la ventana de contexto de 262K tokens.
- Generación de código y matemáticas: hereda las capacidades del modelo base Qwen3.8-27B, con buen rendimiento en benchmarks de programación y razonamiento numérico.
- Sin censura: al estar abliterado, no rechaza peticiones de contenido sensible, aunque esto conlleva riesgos (ver limitaciones).

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 262K tokens) y analizar capturas de pantalla o documentos adjuntos, gracias a su visión nativa y al modo de razonamiento que separa el pensamiento de la respuesta final.
- Generación de código en producción: con soporte de tool calling y el parser `qwen3_coder`, puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar código, manteniendo el contexto de repositorios extensos.
- Análisis de documentos técnicos y científicos: procesa PDFs, imágenes de gráficos y tablas, y extrae información relevante con razonamiento explícito, útil para investigación y revisión de literatura.
- Agentes autónomos de largo horizonte: su ventana de 256K tokens y el razonamiento multi-paso permiten planificar y ejecutar tareas complejas, como navegación web o automatización de flujos de trabajo, con memoria de contexto amplia.
- Asistente de soporte visual para personas con discapacidad: describe imágenes, vídeos o interfaces de usuario en tiempo real, con capacidad de responder preguntas de seguimiento sin perder el hilo.
- Chat sin censura en entornos controlados: para investigación en seguridad de IA o generación de contenido creativo sin restricciones, siempre que se implementen salvaguardas externas de moderación.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks específicos para esta cuantización W4A16 en la información disponible. La model card indica que se realizó una evaluación comparativa contra el mismo modelo cuantizado sin abliteración y contra los números públicos de Qwen3.8-27B, pero los valores no se incluyen en el texto extraído. Como referencia, el modelo base `Qwen3.8-27B` reporta los siguientes resultados (según fuentes web, con thinking activado):

| Benchmark | Resultado (modelo base) |
|---|---|
| DeepSWE | 42.2 |
| Terminal Bench | 73.0 |
| OSWorld | 84.3 |

Estos datos corresponden al modelo sin cuantizar y no son directamente comparables con esta versión W4A16. Se recomienda ejecutar una evaluación propia con el mismo harness y configuración para obtener cifras fiables.

## Requisitos de hardware

- Despliegue verificado en 2×NVIDIA RTX 3090 24 GB (NVLink) con tensor parallelism (TP=2), usando vLLM 0.20.2 en modo float16.
- Peso en disco: 18 GB (modelo sin MTP). La variante con MTP ocupa 19 GB.
- VRAM por rank: 8.87 GiB para pesos del modelo, más 12.93 GiB disponibles para KV cache (total 415.125 tokens de pool entre ambos ranks).
- GPU recomendadas: 2×RTX 3090/4090, o una sola GPU con 48 GB+ (p.ej. A6000, A100 40GB) si se reduce el contexto. No cabe en una GPU consumer de 24 GB con contexto completo.
- Opciones de despliegue: vLLM (verificado), SGLang (compatible con la ruta Qwen3-VL), y potencialmente llama.cpp/Ollama si se convierte a GGUF (existe un GGUF Q4_K_M de 16.8 GB del modelo uncensored, aunque no de esta cuantización específica).
- Throughput medido: 66–68 tok/s en petición única con thinking activado; ~700 tok/s agregados con 16 peticiones concurrentes; pico de prefill de 3.300 tok/s por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| **Este repo (W4A16-vision)** | 27B | 262K | W4A16 (4-bit) | Apache 2.0 | Vision tower bf16, sin MTP, abliterado |
| Qwen3.8-27B (base) | 27B | 262K | bf16 | Apache 2.0 | Requiere ~54 GB en bf16, sin abliteración |
| Qwen3.8-27B-Uncensored (GGUF Q4_K_M) | 27B | 262K | Q4_K_M | Apache 2.0 | GGUF para Ollama/llama.cpp, sin visión confirmada |
| Qwen3-VL (modelos anteriores) | 8B/32B | 128K | bf16 | Apache 2.0 | Sin abliteración, menor contexto |

La comparación directa con el base muestra que esta cuantización reduce el footprint de VRAM a menos de la mitad, permitiendo su uso en hardware de gama media, a costa de una posible ligera degradación en calidad (no cuantificada en la información disponible). El GGUF Q4_K_M es una alternativa para entornos sin vLLM, pero no está claro si conserva el vision tower.

## Limitaciones y advertencias

- Contenido sin censura: al ser abliterado, el modelo puede generar texto ofensivo, ilegal o peligroso. No debe desplegarse en producción sin filtros de moderación externos.
- Riesgo de alucinación: como cualquier LLM, puede inventar información, especialmente en tareas de razonamiento complejo. El modo thinking ayuda a reducir errores, pero no los elimina.
- Idiomas limitados: solo inglés y chino. No soporta otros idiomas de forma nativa.
- Degradación por cuantización: la conversión a W4A16 puede afectar ligeramente la precisión en tareas sensibles, aunque no se han publicado métricas comparativas.
- Requisitos de hardware específicos: el despliegue verificado exige 2×RTX 3090 con NVLink; en otras configuraciones puede ser necesario ajustar el contexto o el número de secuencias.
- Limitaciones del vision tower: el encoder de visión se mantiene en bf16, lo que aumenta el uso de VRAM; además, el presupuesto de tokens de imagen está fijado a 2.048, limitando la resolución efectiva (máximo ~1448×1448 píxeles).
- La variante sin MTP no soporta decodificación especulativa; si se necesita, debe usarse la versión `-vision-mtp`.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bowmanslayer/Qwen3.8-27B-Uncensored-W4A16-vision
- Modelo base (abliterado): https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- GitHub con GGUF y Ollama: https://github.com/Wassimyounes01/qwen38-uncensored
- Ficha en LM Studio: https://lmstudio.ai/models/qwen3.8
- Documentación SGLang: https://docs.sglang.io/cookbook/autoregressive/Qwen/Qwen3.8-27B
- Artículo en OpenLM.ai: https://openlm.ai/qwen3.8/
- Guía completa en LovableApp: https://lovableapp.org/blog/qwen3-8-27b
