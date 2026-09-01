# RockTalk/Qwen3.8-Flash-Next-MLX-4bit

## Resumen

Qwen3.8-Flash-Next es un modelo experimental de Qwen que sirve como vista previa de la arquitectura Qwen4. RockTalk ha publicado el primer port MLX de este modelo, cuantizado a 4 bits, con el objetivo de ejecutarlo en Apple Silicon con rendimiento utilizable. El modelo original combina un transformador MoE de 125B parámetros (6B activos, 512 expertos) con una tabla de embeddings n-gram de 51.2B y una cabeza MTP de 4B para decodificación especulativa, sumando aproximadamente 180B parámetros totales.

Este port es relevante porque demuestra que es posible ejecutar un modelo de esta escala en hardware de consumo (Apple Silicon) mediante cuantización agresiva y decodificación especulativa sin pérdida de calidad en la generación. Incluye soporte para visión, vídeo y tool calling a través del runtime gmlx, lo que lo convierte en una opción práctica para despliegues locales de agentes multimodales.

La cuantización 4-bit con grupo de tamaño 64 mantiene una perplejidad prácticamente idéntica al modelo en bf16 (4.4749 frente a 4.4708), según datos del autor. El rendimiento medido en un M3 Ultra alcanza entre 26 y 35 tok/s en modo greedy, y hasta 86 tok/s con el drafter MTP en cargas de trabajo estructuradas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer (Qwen4 experimental) con hyper-connections, QSA sparse attention, Gated DeltaNet y PLE n-gram embedding |
| Parametros totales | ~180B (125B MoE + 51.2B n-gram + 4B MTP); el archivo safetensors cuantizado contiene 20.223.976.528 parámetros |
| Parametros activos | 6B (top-10 expertos + shared expert) |
| Longitud de contexto | 262K (según documentación de unsloth para el modelo base) |
| Tipos de cuantizacion | 4-bit affine (group size 64) con overrides a 8-bit para embeddings, router y gates; también disponible GGUF UD-Q4_K_XL (~104 GB) |
| Idiomas soportados | en (inglés) según la model card; el modelo base de Qwen probablemente soporta más idiomas, pero no se especifica |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors (MLX), GGUF (para gmlx) |

## Arquitectura y entrenamiento

La arquitectura Qwen4 introduce varias innovaciones respecto a generaciones anteriores. En primer lugar, las hyper-connections sustituyen todos los layer norms por mezcladores de bajo rango con compuerta, usando un residual ensanchado de 4 flujos. En segundo lugar, la atención combina QSA (sparse attention) en 12 de las 48 capas, con un indexador que selecciona un presupuesto de 2048 tokens, y Gated DeltaNet en las 36 restantes, una atención lineal con compuerta sigmoide y escala de lectura `1/sqrt(head_v_dim)`. El embedding PLE utiliza una tabla hash de 320M filas que se consulta por token desde memmap (opcional, ~95 GB). La cabeza MTP de 1 capa permite decodificación especulativa con una tasa de aceptación del 66-86%.

Los datos de entrenamiento del modelo base no están disponibles en la información proporcionada. El port MLX no modifica los pesos, solo los cuantiza. La cuantización 4-bit con grupo 64 se aplica a todas las capas lineales, con overrides a 8-bit para embeddings, router y gates de expertos, siguiendo la política del GGUF de referencia.

## Capacidades

- Generación de texto y razonamiento: el modelo base está entrenado para tareas de razonamiento avanzado, superando según unsloth a Claude-4.6-Opus (Max) en algunas evaluaciones.
- Generación de código: alto rendimiento en tareas de programación, con especial eficiencia en salida estructurada (JSON, tablas, etc.) gracias a la decodificación especulativa.
- Tool calling / function calling: verificado en el runtime gmlx, devuelve `finish_reason: "tool_calls"` con argumentos bien formados.
- Visión y vídeo: mediante el proyector de visión (`mmproj-F16.gguf`), puede procesar imágenes (URL o base64) y secuencias de vídeo enviadas como frames ordenados.
- Decodificación especulativa MTP: la cabeza MTP integrada permite acelerar la generación entre 2.1 y 3.3 veces en cargas de trabajo estructuradas, sin pérdida de calidad (los tokens emitidos son idénticos al greedy).
- Multilingüe: la model card solo lista "en", aunque el modelo base de Qwen probablemente soporta más idiomas; no se ha verificado en este port.

## Casos de uso

- Inferencia local en Apple Silicon: el port MLX permite ejecutar un modelo de ~180B en un Mac con suficiente memoria unificada (M3 Ultra 512 GB recomendado), alcanzando 26-35 tok/s sin necesidad de GPU dedicada.
- Servicio de chat multimodal con gmlx: desplegar un servidor compatible con OpenAI (`/v1/chat/completions`) que sirve el modelo con visión, vídeo y tool calling, con throughput de 55-86 tok/s en M3 Ultra.
- Generación de código en producción: la combinación de decodificación especulativa y alta tasa de aceptación en código (0.85) lo hace adecuado para autocompletado o generación de archivos completos en entornos de desarrollo.
- Procesamiento de documentos con imágenes: lectura de gráficos, tablas y texto incrustado en imágenes con precisión verificada (valores y colores exactos en pruebas de chart reading).
- Agentes autónomos con tool calling: el soporte nativo de herramientas y el razonamiento multi-paso permiten construir agentes que interactúan con APIs y ejecutan acciones.
- Análisis de vídeo: extracción de descripciones escena por escena a partir de clips, útil para moderación de contenido o generación de subtítulos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) para este port en la información disponible. Los datos de rendimiento de inferencia medidos en un M3 Ultra (512 GB, Metal) son los siguientes:

| Modo | Tok/s |
|------|-------|
| Greedy plano (MLX) | 26.4–26.6 |
| MTP-v2 especulativo (MLX) | 27.6–35.3 (media 30.3) |
| gmlx con drafter MTP (código) | 80.0 |
| gmlx con drafter MTP (tabla repetitiva) | 86.1 |
| gmlx con drafter MTP (prosa larga) | 55.6 |
| gmlx con drafter MTP (respuesta corta) | 69.6 |

La tasa de aceptación del drafter MTP varía entre 0.53 (prosa) y 0.99 (tablas), con una media de 0.66-0.86. La perplejidad del modelo cuantizado es 4.4749 frente a 4.4708 en bf16, con una ratio pareada de 1.0009, lo que indica una degradación mínima.

## Requisitos de hardware

- Memoria unificada: se requiere al menos 121 GB residentes para el modelo 4-bit con drafter y proyector de visión (según mediciones en M3 Ultra). El modelo base en bf16 ocuparía ~192 GB.
- GPU recomendada: Apple Silicon con Metal (M3 Ultra 512 GB es la configuración de referencia). No se ha probado en GPUs NVIDIA/AMD.
- Compatibilidad con consumer GPU: no aplica, el port MLX está diseñado exclusivamente para Apple Silicon.
- Opciones de despliegue: MLX (repositorio `mlx-qwen4exp`), gmlx (servidor OpenAI-compatible con soporte de visión y tool calling), llama.cpp (solo para el GGUF sin drafter, 26.4 tok/s en Metal).
- Latencia y throughput: 26-35 tok/s en MLX plano, 55-86 tok/s con gmlx y drafter MTP en cargas estructuradas.

## Comparativa con modelos similares

No se dispone de datos de comparativa directa con otros modelos en la información proporcionada. El modelo base Qwen3.8-Flash-Next se posiciona como un MoE de 125B activos con 6B activos, comparable en escala a otros MoE como DeepSeek-V3 o Qwen3-235B-A22B, pero con la innovación de la arquitectura Qwen4. Este port MLX es el primero de su tipo, por lo que no existen alternativas equivalentes en el ecosistema Apple Silicon. Se puede comparar con el GGUF de unsloth (misma cuantización, pero sin drafter MTP) y con el modelo original en bf16 (que requiere ~192 GB y no es ejecutable en hardware de consumo).

## Limitaciones y advertencias

- Modelo experimental: la arquitectura `qwen4_exp` es una vista previa y puede contener comportamientos inestables o no documentados.
- Licencia "other": no se especifican los términos exactos; se debe contactar con el autor antes de uso comercial.
- Idioma: la model card solo lista inglés; el rendimiento en otros idiomas no está verificado.
- Requisitos de hardware elevados: aunque es ejecutable en Apple Silicon, se necesitan al menos 121 GB de memoria unificada, lo que limita su uso a configuraciones de gama alta (M3 Ultra, M2 Ultra, etc.).
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar contenido falso o inconsistente; no se han realizado evaluaciones específicas de sesgos para este port.
- Dependencia de código no oficial: el port MLX y el runtime gmlx son desarrollos de terceros, no respaldados por Qwen; pueden existir bugs o diferencias de comportamiento respecto al modelo original.
- El drafter MTP solo funciona con gmlx; llama.cpp no puede ejecutarlo, lo que limita las opciones de despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RockTalk/Qwen3.8-Flash-Next-MLX-4bit
- Repositorio de código MLX: https://github.com/Rocktalk-Holdings/mlx-qwen4exp
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio del modelo base: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- GGUF de unsloth: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Drafter MTP en GGUF: https://huggingface.co/ashbash/Qwen3.8-Flash-Next-MTP-Drafter-GGUF
- Runtime gmlx: https://github.com/asher/gmlx
- Documentación de unsloth: https://unsloth.ai/docs/models/qwen3.8-next
- Issue de mlx-lm sobre QSA: https://github.com/ml-explore/mlx-lm/issues/1798
