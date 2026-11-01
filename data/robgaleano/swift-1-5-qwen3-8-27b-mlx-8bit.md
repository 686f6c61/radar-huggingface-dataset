# robgaleano/Swift-1.5-Qwen3.8-27B-MLX-8bit

## Resumen

Swift 1.5 Qwen3.8-27B es un modelo multimodal (texto e imagen) de 27.356 millones de parámetros, desarrollado por UkisAI como adaptación por post-entrenamiento del modelo base Qwen3.8-27B de Alibaba Cloud. La versión aquí documentada es una cuantización MLX de 8 bits (grupo de 64, modo affine, 8,627 bits por peso) realizada por el usuario robgaleano, orientada específicamente a Apple Silicon (chips M-series Max y Ultra). El modelo destaca por su eficiencia en tokens de razonamiento: según la model card, consume entre un 41,9 % y un 58,5 % menos tokens de "thinking" con esfuerzo `xhigh` que su modelo base, manteniendo o mejorando el rendimiento en tareas de código y agentes de terminal.

La relevancia actual radica en tres factores. Primero, ofrece un equilibrio poco habitual entre razonamiento de alta calidad y coste de cómputo reducido, algo crítico en despliegues de agentes autónomos donde el número de tokens generados impacta directamente en latencia y coste. Segundo, la cuantización de 8 bits preserva casi intacta la estabilidad del razonamiento del BF16 original (KLD ≈ 0,00055) y la precisión estricta en tool calling con XML y JSON, algo que las cuantizaciones de 3, 4 y 5 bits no garantizan. Tercero, incluye soporte para un modelo "drafter" complementario de predicción multi-token (MTP) que permite decodificación especulativa sin pérdida de calidad, con aceleraciones de entre 2,05× y 2,68× en hardware Apple M5 Max.

El modelo se distribuye bajo la licencia propietaria swift-open-license-1.0 y su formato de pesos es safetensors en el marco de la librería MLX.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + visión), familia Qwen3.5; no se detalla el número de capas ni la configuración interna |
| Parámetros totales | 27.356.728.560 (27,36 mil millones) |
| Parámetros activos | No aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | No disponible de forma explícita; la model card menciona pruebas con ventanas de 25K–50K tokens y `--max-tokens 32768` en el servidor |
| Tipos de cuantización | MLX 8 bits (group_size=64, mode=affine, 8,627 bits por peso); la colección oficial incluye además exportaciones de 3, 4 y 5 bits, y existe una versión GGUF |
| Idiomas soportados | No disponible |
| Licencia | swift-open-license-1.0 (licencia propietaria, etiquetada como "other") |
| Formato de pesos | safetensors (MLX); existe también versión GGUF |

## Arquitectura y entrenamiento

El modelo es una adaptación por post-entrenamiento del Qwen3.8-27B de Alibaba Cloud, un transformer multimodal que procesa entradas de imagen y texto (pipeline `image-text-to-text`). UkisAI aplicó un proceso de post-entrenamiento orientado a la eficiencia de tokens de razonamiento (`efficient-thinking`, `token-efficient`) y a tareas de código y agentes de terminal. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO.

La innovación técnica más destacable es la reducción del coste de razonamiento: el modelo alcanza o supera al Qwen3.8-27B base generando entre un 41,9 % y un 58,5 % menos tokens de pensamiento con esfuerzo `xhigh`. Además, la cuantización MLX de 8 bits realizada por robgaleano emplea `mlx-vlm 0.7.8` y preserva una divergencia KL de aproximadamente 0,00055 respecto al BF16, lo que mantiene la estabilidad del razonamiento y la precisión estricta en tool calling. El ecosistema incluye un modelo drafter MTP independiente para decodificación especulativa sin pérdida de calidad, así como soporte de Automatic Prefix Caching (APC) para reducir el tiempo hasta el primer token en conversaciones multi-turno.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento configurable (esfuerzo `xhigh`).
- Procesamiento de imágenes (visión) además de texto, al ser un modelo multimodal.
- Generación de código de alta calidad, con resultados destacados en LiveCodeBench v6.
- Ejecución de tareas agénticas de terminal y CLI (Terminal-Bench 2.1).
- Tool calling y function calling con salida estricta en XML y JSON, validada para harnesses como Claude Code, Roo Code, DeepSeek Harness y OpenCode.
- Razonamiento multi-paso y soporte para agentes autónomos.
- Decodificación especulativa mediante un modelo drafter MTP complementario (pérdida cero de calidad).
- Soporte de Automatic Prefix Caching (APC) para conversaciones multi-turno con contexto largo.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- **Asistencia a programadores en local sobre Mac**: el modelo puede integrarse en editores y CLI (Claude Code, Roo Code, OpenCode) para autocompletar, refactorizar y explicar código. Su tool calling estricto en XML/JSON y su cuantización de 8 bits garantizan que las herramientas reciban argumentos bien formados, algo crítico en pipelines de agentes.
- **Agentes autónomos de terminal**: con resultados de 72,13 % en Terminal-Bench 2.1, el modelo es adecuado para tareas de administración de sistemas, ejecución de comandos y resolución de incidencias en entornos de línea de comandos, donde la eficiencia en tokens reduce el coste por tarea.
- **Generación de código en producción**: puede integrarse en pipelines de CI/CD para revisión automática de parches, generación de tests y detección de errores, aprovechando su rendimiento en LiveCodeBench v6 (81,71 %) y su capacidad de razonamiento multi-paso.
- **Análisis de documentos con imágenes**: al ser multimodal, permite procesar capturas de pantalla, diagramas o documentación escaneada junto con texto, útil en tareas de soporte técnico o extracción de información de interfaces.
- **Atención al cliente automatizada**: con soporte de APC y ventanas de contexto de 25K–50K tokens, puede gestionar conversaciones multi-turno largas manteniendo coherencia y reduciendo el tiempo hasta el primer token (1,06–2,11 s en caché caliente).
- **Despliegue de razonamiento de alta precisión en Apple Silicon**: para equipos con 64–128 GB de memoria unificada (M-series Max/Ultra), esta cuantización de 8 bits ofrece un equilibrio entre calidad casi BF16 y velocidad (18,8 tok/s en solitario; 38,5–50,4 tok/s con el drafter MTP), adecuado para prototipado e investigación local sin depender de la nube.
- **Investigación en eficiencia de razonamiento**: el modelo sirve como referencia para estudiar cómo el post-entrenamiento puede reducir tokens de pensamiento sin degradar el rendimiento, comparando sus resultados con el Qwen3.8-27B base.

## Benchmarks y rendimiento

Resultados publicados por UkisAI en la model card, comparando Qwen3.8-27B (base) y Swift 1.5 con esfuerzo `xhigh`:

| Benchmark | Qwen3.8-27B (base) | Swift 1.5 | Mejora |
|---|---|---|---|
| LiveCodeBench v6 | 76,76 % | 81,71 % | +4,95 puntos |
| Terminal-Bench 2.1 | 69,21 % | 72,13 % | +2,92 puntos |

Rendimiento de inferencia en Apple M5 Max (GPU de 40 núcleos, 128 GB) con `mlx-vlm 0.7.8`:

| Configuración | Memoria GPU activa | Velocidad (tok/s) | Aceleración |
|---|---|---|---|
| Modelo base 8 bits (1 tok/paso) | 27,50 GiB | 18,8 | 1,00× |
| + drafter MTP (`--draft-block-size 4`) | 28,22 GiB | 38,5 media (50,4 pico) | 2,05×–2,68× |
| Prompt multi-turno caliente (APC, 25K–50K ctx) | 28,2–45,6 GiB | 43,1–48,5 | Hasta 30× más rápido en TTFT |

No se han publicado en la información disponible resultados de benchmarks como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- **VRAM/memoria unificada estimada**: aproximadamente 27,5 GiB de memoria GPU activa para el modelo base en 8 bits; hasta 45,6 GiB con contexto de 25K–50K tokens y caché APC activa.
- **GPU recomendadas**: Apple Silicon M-series Max y Ultra con 64 GB o 128 GB de memoria unificada (M5 Max validado en la model card). El modelo está cuantizado específicamente para MLX, por lo que no está pensado para GPU NVIDIA.
- **¿Cabe en GPU de consumo?**: sí, en equipos Apple con al menos 64 GB de memoria unificada; no es compatible con GPU de consumo NVIDIA en este formato MLX (existe una versión GGUF para otros entornos).
- **Opciones de despliegue**: `mlx-vlm` (servidor compatible con OpenAI y Anthropic, CLI de generación), con soporte de `--draft-model` para el drafter MTP y `APC_ENABLED=1` para caché de prefijos. Existe versión GGUF para llama.cpp u otros runners compatibles.
- **Latencia y throughput**: 18,8 tok/s en solitario y 38,5–50,4 tok/s con decodificación especulativa en M5 Max; TTFT en caliente de 1,06–2,11 s con APC.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Swift 1.5 Qwen3.8-27B (8-bit MLX) | 27,36 mil M | No disponible (pruebas hasta 50K) | swift-open-license-1.0 | safetensors MLX, GGUF | Multimodal, razonamiento eficiente en tokens, tool calling estricto |
| Qwen3.8-27B (base) | 27 mil M (aprox.) | No disponible | Según Alibaba Cloud (no detallada) | safetensors | Modelo fundacional; Swift 1.5 lo supera en código y agentes |
| Qwen3.8-27B cuantizado 3/4/5 bits MLX | 27 mil M (aprox.) | No disponible | Según Alibaba Cloud | safetensors MLX | Menor precisión y mayor KLD; no recomendado para tool calling estricto |
| No disponible | — | — | — | — | No se dispone de datos de otros modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- **Licencia restrictiva**: la swift-open-license-1.0 es una licencia propietaria ("other"); es imprescindible revisar sus términos antes de cualquier uso comercial, ya que puede imponer restricciones de atribución o de redistribución.
- **Sesgos**: no se documentan sesgos específicos en la información disponible; al derivar de Qwen3.8-27B, hereda los sesgos del modelo base y de sus datos de entrenamiento.
- **Riesgo de alucinación**: no cuantificado en la model card; como todo modelo generativo, puede producir contenido plausible pero incorrecto, especialmente en dominios especializados.
- **Limitaciones de contexto e idioma**: la longitud de contexto no se especifica formalmente; los idiomas soportados no están documentados. Las pruebas de contexto largo se limitan a 25K–50K tokens.
- **Dependencia de hardware Apple**: esta cuantización MLX está pensada para Apple Silicon; en otros entornos debe usarse la versión GGUF, con posibles diferencias de rendimiento y calidad.
- **Caveat de producción**: la cuantización de 8 bits preserva mejor la precisión en tool calling que las de 3–5 bits, pero sigue siendo una aproximación; conviene validar las salidas estructuradas en el pipeline antes de confiar en ellas de forma autónoma.
- **Ecosistema joven**: el modelo tiene pocas descargas (78) y ningún "like", lo que sugiere una adopción limitada y escasa validación comunitaria independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/robgaleano/Swift-1.5-Qwen3.8-27B-MLX-8bit
- Modelo base BF16: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Drafter MTP 8 bits: https://huggingface.co/robgaleano/Swift-1.5-Qwen3.8-27B-MTP-MLX-8bit
- Colección Swift 1.5: https://huggingface.co/collections/ukisai/swift-15-27b
- Versión GGUF: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GGUF
- Web de UkisAI: https://ukisai.com/products/swift
- Modelo fundacional Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia: https://huggingface.co/robgaleano/Swift-1.5-Qwen3.8-27B-MLX-8bit/blob/main/LICENSE
