# AlekseyCalvin/Spark-X2.6_ThreeJS_v2_1.7B_r32

## Resumen

Spark-X2.6-1.7B es un modelo de lenguaje compacto de 1.700 millones de parámetros desarrollado por XHToken (equipo detrás de la serie Spark). Se trata del segundo miembro de la familia Spark-X2.6, tras el Spark-X2.6-4B, y se presenta como una actualización del Spark-X2.5-1.7B orientada a despliegue en dispositivo (on-device). La versión concreta de este repositorio, `AlekseyCalvin/Spark-X2.6_ThreeJS_v2_1.7B_r32`, es un fine-tuning del modelo base `XHToken/Spark-X2.6-1.7B-Base` con un adaptador LoRA de rango 32, aparentemente orientado a generación de código Three.js.

El modelo conserva exactamente la misma arquitectura que Spark-X2.5-1.7B y obtiene sus mejoras mediante un post-entrenamiento más elaborado, con avances declarados en código, uso de herramientas (agent), contexto largo, multilingüismo y razonamiento. Incorpora un presupuesto de razonamiento configurable en tres niveles (none, low, high) que permite ajustar latencia frente a calidad, y el autor reporta un rendimiento de decodificación líder entre modelos de tamaño comparable en hardware local.

Es relevante ahora porque el segmento de modelos de ~2B parámetros para inferencia en el borde (edge) está muy competido (Qwen3.5-2B, MiniCPM-2B, LFM2.5-2.6B), y XHToken reclama resultados state-of-the-art en la mayoría de benchmarks frente a esos modelos, además de una implementación optimizada de llama.cpp. La licencia Apache 2.0 facilita su adopción comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (misma arquitectura que Spark-X2.5-1.7B; detalles internos no disponibles) |
| Parámetros totales | 1.707.657.216 (~1,7B) |
| Parámetros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible de forma explícita; el ejemplo de generación usa `max_new_tokens=131072` y se mencionan capacidades de contexto largo |
| Tipos de cuantización | no disponible (el autor publica pesos en safetensors; existe implementación optimizada de llama.cpp, lo que sugiere soporte GGUF, pero no se confirma) |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers); repo de 3,4 GB |
| Modelo base | XHToken/Spark-X2.6-1.7B-Base |
| Tipo de ajuste | Fine-tuning con LoRA r=32 (según el nombre del repo) |
| Librería | transformers (requiere `trust_remote_code=True`, versión 4.57.1 en el ejemplo) |

## Arquitectura y entrenamiento

La información disponible confirma que Spark-X2.6-1.7B mantiene "exactamente la misma arquitectura" que Spark-X2.5-1.7B y que las ganancias provienen del post-entrenamiento, no de cambios estructurales. No se detalla en la model card si se trata de un transformer denso convencional con atención estándar o si incorpora variantes como atención lineal o decodificación especulativa; esos datos no están disponibles. El modelo requiere código personalizado (`custom_code` y `trust_remote_code=True`), lo que indica que la implementación de la arquitectura no es la estándar de Transformers y debe cargarse desde el repositorio.

El post-entrenamiento se orienta a mejorar código, comportamiento agéntico, contexto largo, multilingüismo y razonamiento. Se menciona un mecanismo de "presupuesto de pensamiento" configurable con tres niveles (none, low, high): al pasar de high a low, la puntuación media cae 4,0 puntos y la longitud media de salida se reduce un 37,3% (frente a 1,7 puntos y 22,0% en el modelo de 4B). No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO. La versión de este repositorio añade un ajuste LoRA (r=32) sobre el modelo base, presumiblemente especializado en Three.js, aunque la model card no documenta el dataset de ese fine-tuning.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento con presupuesto configurable: tres niveles de "thinking" (none, low, high) que permiten equilibrar calidad, latencia y coste.
- Programación y ingeniería de software: el autor declara mejoras sustanciales en tareas de código.
- Uso de herramientas (tool calling / function calling) y planificación multi-paso para flujos agénticos.
- Razonamiento sobre contextos extensos (long-context).
- Matemáticas y conocimiento general (evaluados en los benchmarks del autor).
- Capacidades multilingües limitadas a inglés y chino según los metadatos.
- Especialización adicional en Three.js en esta variante concreta (inferida del nombre del repositorio y del ajuste LoRA r=32; no documentada formalmente en la model card).
- No se declaran capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Asistente de código en local para IDE: el modelo puede autocompletar y explicar fragmentos de código con baja latencia en GPU de consumo, integrándose mediante llama.cpp o Transformers en extensiones de editor sin depender de la nube.
- Generación de escenas Three.js: esta variante concreta (fine-tuning r=32) está orientada a producir código JavaScript de Three.js, útil para prototipado rápido de visualizaciones 3D y demos interactivas.
- Agentes autónomos ligeros: con soporte de tool calling y planificación multi-paso, puede orquestar llamadas a APIs en pipelines de automatización donde el coste por token y la latencia importan más que el razonamiento profundo.
- Atención al cliente en dispositivo: conversaciones multi-turno en inglés o chino con contexto largo, desplegables en hardware local para escenarios con requisitos de privacidad o sin conectividad.
- Procesamiento de documentos largos: resumen y extracción de información sobre contextos extensos (el ejemplo oficial usa hasta 131.072 tokens de salida), adecuado para informes técnicos o logs.
- Enseñanza y prototipado de razonamiento: el modo "thinking" configurable permite comparar cadenas de razonamiento cortas y largas en experimentos docentes o de investigación sobre eficiencia de inferencia.
- Edge computing industrial: despliegue en dispositivos con GPU modesta (por ejemplo, estaciones de trabajo con RTX) para tareas de clasificación, extracción y generación de texto sin conexión.

## Benchmarks y rendimiento

La model card incluye gráficas de benchmarks (`images/all_benchmark.svg`) y de eficiencia de inferencia (`images/inference.svg`), pero los valores numéricos no están disponibles en el texto proporcionado. El autor afirma que Spark-X2.6-1.7B supera a modelos de tamaño comparable en la mayoría de benchmarks y que logra el mayor throughput de decodificación en contextos cortos frente a Qwen3.5-2B, MiniCPM-2B y LFM2.5-2.6B, con ventaja ampliada mediante su implementación optimizada de llama.cpp en una RTX 4090.

| Benchmark | Spark-X2.6-1.7B | Modelos comparables |
|---|---|---|
| MMLU | no disponible (solo gráfica) | no disponible |
| HumanEval | no disponible (solo gráfica) | no disponible |
| GSM8K | no disponible (solo gráfica) | no disponible |
| Throughput de decodificación | líder según el autor (sin cifras) | Qwen3.5-2B, MiniCPM-2B, LFM2.5-2.6B |

No se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Para 1,7B parámetros, en fp16 se requieren aproximadamente 3,4 GB de pesos más overhead de activaciones y caché KV; en cuantización de 4 bits, del orden de 1 GB, aunque estas cifras son estimaciones generales y no datos del autor.
- GPU recomendadas: el autor valida rendimiento en RTX 4090; también menciona soporte para NPU Ascend (A2 y A3) mediante SGLang.
- GPU de consumo: por tamaño, el modelo debería caber en GPUs de consumo con 8 GB o más en fp16, y en GPUs de 4-6 GB con cuantización, si bien no se confirma oficialmente.
- Opciones de despliegue: Transformers (>=4.57.1, con `trust_remote_code=True`), SGLang (imágenes oficiales para NVIDIA CUDA 13 y Ascend CANN 9.0.0) y llama.cpp mediante el fork optimizado de XHToken. No se confirma soporte de vLLM, Ollama o TGI.
- Latencia y throughput: el autor declara el mejor throughput de decodificación entre modelos comparables en contextos cortos, sin cifras concretas en el texto disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| Spark-X2.6-1.7B (esta variante) | ~1,7B | no disponible (uso de hasta 131k tokens de salida en el ejemplo) | Apache 2.0 | en, zh | Hugging Face, SGLang, llama.cpp (fork) |
| Qwen3.5-2B | ~2B | no disponible | no disponible | no disponible | referenciado como comparable por el autor |
| MiniCPM-2B | ~2B | no disponible | no disponible | no disponible | referenciado como comparable por el autor |
| LFM2.5-2.6B | ~2,6B | no disponible | no disponible | no disponible | referenciado como comparable por el autor |

El autor sitúa a Spark-X2.6-1.7B por delante de estos tres modelos en la mayoría de benchmarks y en throughput de decodificación, pero no se aportan cifras verificables en el texto disponible. Los datos de contexto, licencia y rendimiento de los competidores no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; el rendimiento en castellano no está garantizado ni evaluado.
- Riesgo de alucinación inherente a modelos de 1,7B, especialmente en tareas de conocimiento factual y razonamiento matemático complejo.
- El modo de razonamiento "high" aumenta la longitud de salida y, por tanto, la latencia y el coste; en este modelo la penalización al bajar a "low" es de 4,0 puntos medios, mayor que en el modelo de 4B.
- Requiere `trust_remote_code=True` y código personalizado, lo que implica revisar el código del repositorio antes de ejecutarlo en producción.
- Esta variante concreta es un fine-tuning LoRA r=32 de un tercero (AlekseyCalvin), no el modelo oficial de XHToken; su calidad y comportamiento no están documentados en la model card y debe evaluarse empíricamente.
- El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, sin validación comunitaria.
- Aunque la licencia es Apache 2.0 (permisiva para uso comercial), conviene verificar que el modelo base y los datos del fine-tuning respetan dicha licencia.
- No se documentan sesgos conocidos ni evaluaciones de seguridad; se recomienda auditoría propia antes de desplegar en aplicaciones sensibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AlekseyCalvin/Spark-X2.6_ThreeJS_v2_1.7B_r32
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-1.7B-Base
- Fork optimizado de llama.cpp: https://github.com/XHToken/llama.cpp
- Slack del proyecto: https://join.slack.com/t/tokenspark/shared_invite/zt-432qf8l2f-5~dLyXv8uETr0P0UuC07nw
- Discord: https://discord.gg/kTDE2Hg8aw
- YouTube: https://www.youtube.com/@SparkLLM
- dev.to: https://dev.to/sparkllm
- Bluesky: https://bsky.app/profile/sparkllm.bsky.social
- X (Twitter): https://x.com/sparkllm
- Zhihu: https://www.zhihu.com/people/zhiikz7qh7m
