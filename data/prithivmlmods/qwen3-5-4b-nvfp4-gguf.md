# prithivMLmods/Qwen3.5-4B-NVFP4-GGUF

## Resumen

Qwen3.5-4B-NVFP4-GGUF es una cuantización en formato NVFP4 (FP4 de NVIDIA) del modelo Qwen3.5-4B, desarrollado originalmente por el equipo Qwen de Alibaba y cuantizado por prithivMLmods mediante llama.cpp. El modelo base es un transformer denso multimodal de aproximadamente 4.330 millones de parámetros (4,33B según safetensors) con una ventana de contexto nativa de 262.144 tokens, extensible a más de un millón, y una arquitectura híbrida que combina Gated DeltaNet con Gated Attention.

La relevancia de esta ficha concreta reside en el formato de pesos: NVFP4 es un esquema de cuantización de 4 bits optimizado para los tensor cores FP4 de las GPU NVIDIA Blackwell (RTX PRO 6000, serie RTX 50, B200, B300), lo que permite ejecutar un modelo multimodal de 4B con un consumo de VRAM muy reducido (el autor reporta 8,61 GiB de pico con 8K de contexto) y velocidades de generación cercanas a 295 tokens/s en hardware de gama profesional. Además, el archivo incorpora cabezales de Multi-Token Prediction (MTP) que habilitan decodificación especulativa sin necesidad de un modelo draft separado.

El modelo está pensado para despliegues locales en hardware Blackwell, con soporte para llama.cpp/llama-cli y orientado a tareas de razonamiento, código, OCR, comprensión de documentos y flujos agénticos con tool calling nativo. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido Gated DeltaNet + Gated Attention, con early-fusion multimodal |
| Parametros totales | 4.326.351.344 (4,33B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos, extensible a 1M+ |
| Tipos de cuantizacion | NVFP4 (4 bits, formato NVIDIA); el repo incluye además el proyector multimodal mmproj en GGUF |
| Idiomas soportados | 201 idiomas según vocabulario de 248K; la model card declara `en` como idioma |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Qwen3.5-4B-NVFP4.gguf de 3,54 GB + Qwen3.5-4B.mmproj.gguf de 676 MB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B emplea una arquitectura híbrida que alterna capas de Gated DeltaNet (un mecanismo de estado lineal con compuertas) con capas de Gated Attention clásica, lo que permite manejar contextos muy largos (262K nativos, 1M+ extendidos) con un coste computacional menor que un transformer de atención completa. Dispone de un vocabulario de 248K tokens que cubre 201 idiomas y fue entrenado con un esquema de early fusion para unificar la comprensión de texto, imagen y vídeo en un único espacio de representación.

El modelo incorpora Multi-Token Prediction (MTP): cabezales adicionales que predicen varios tokens futuros en un solo forward pass, lo que permite decodificación especulativa integrada en los propios pesos (sin modelo draft externo). La model card no detalla el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO; esos datos no están disponibles en la información proporcionada. La cuantización NVFP4 la realiza prithivMLmods con llama.cpp, preservando el proyector multimodal en un archivo mmproj separado.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de pensamiento (thinking) según la model card del modelo base.
- Comprensión multimodal: texto, imagen y vídeo (pipeline `image-text-to-text`), incluyendo OCR, parsing de documentos y respuesta a preguntas visuales (VQA).
- Generación de código y resolución de problemas matemáticos (los tests del autor incluyen listas enlazadas, problemas de cinemática, caudal, combinatoria y edades).
- Tool calling / function calling nativo, orientado a flujos agénticos.
- Capacidades multilingües: vocabulario de 248K para 201 idiomas, aunque la model card declara únicamente `en`.
- Decodificación especulativa mediante MTP (`--spec-type draft-mtp`), con aceleración en tensor cores FP4 de Blackwell.
- Conversacional multi-turno con contexto largo.

## Casos de uso

- **Atención al cliente automatizada**: con 262K tokens de contexto nativo, el modelo puede mantener historiales de conversación extensos y adjuntar documentación de producto sin truncar, reduciendo la pérdida de información en diálogos largos.
- **Procesamiento de documentos y OCR**: el par GGUF + mmproj permite extraer texto y estructurar información de facturas, contratos o formularios escaneados en local, sin enviar datos a la nube, lo que encaja en entornos con requisitos de privacidad.
- **Asistente de código en estación de trabajo**: integrable en editores o pipelines de CI/CD mediante tool calling; su tamaño (3,54 GB en NVFP4) permite ejecutarlo junto al IDE en una GPU Blackwell de consumo.
- **Análisis de vídeo e imagen para VQA**: aplicable a inspección visual, moderación de contenido o descripción automática de material audiovisual, aprovechando el entrenamiento early-fusion.
- **Agentes autónomos locales**: la combinación de tool calling, razonamiento multi-paso y MTP para baja latencia lo hace apto para agentes que ejecutan tareas encadenadas en hardware de borde con GPU Blackwell.
- **Despliegue en edge/servidor con vLLM u Ollama**: al ser un GGUF compatible con llama.cpp y TGI, puede servirse en RTX PRO 6000 o B200/B300 con throughput alto (≈295 tok/s reportados) para aplicaciones internas de generación.
- **Prototipado de asistentes multilingües**: pese a que la model card declara `en`, el vocabulario de 201 idiomas del modelo base permite experimentar con otros idiomas, validando calidad antes de producción.

## Benchmarks y rendimiento

Datos de benchmarks del modelo base citados en la model card (no verificados de forma independiente en esta ficha):

| Benchmark | Resultado |
|---|---|
| Artificial Analysis Intelligence Index | 27 |
| MMMU-Pro (razonamiento multimodal) | 65,4% |
| Comparación cualitativa | Supera a Falcon-H1R-7B y NM-Nano-9B-V2 en modelos <5B; rendimiento comparable a GPT-OSS-20B con ~5× menos parámetros |

Rendimiento de inferencia medido por el autor (RTX PRO 6000 Blackwell Server Edition, 96 GB VRAM, llama-cli, `-ngl 99`, contexto 8.192, KV cache `q8_0`, MTP con `draft_n_max=2`, 5 ejecuciones):

| Métrica | Valor |
|---|---|
| Velocidad media de procesamiento de prompt | 289,08 tokens/s |
| Velocidad media de generación | 294,98 tokens/s |
| Tiempo total de pared | 82,5 s |
| VRAM pico | 8,61 GiB |
| Utilización de GPU pico | 85% |

No se han publicado en la información disponible resultados de MMLU, HumanEval o GSM8K para este modelo concreto.

## Requisitos de hardware

- **VRAM estimada**: el archivo NVFP4 pesa 3,54 GB y el mmproj 676 MB; el autor reporta 8,61 GiB de pico con 8K de contexto y KV cache en `q8_0`. Con contextos mayores la VRAM crece proporcionalmente al KV cache.
- **GPU recomendadas**: NVIDIA Blackwell exclusivamente para aprovechar NVFP4 (RTX PRO 6000, serie RTX 50, B200, B300). En GPU sin soporte FP4 nativo el formato puede no ser utilizable o degradar rendimiento.
- **¿Cabe en GPU de consumo?**: sí, en tarjetas Blackwell de consumo (serie RTX 50) con al menos 8-10 GB de VRAM para 8K de contexto; el modelo completo en FP4 ocupa menos de 4,5 GB en disco.
- **Opciones de despliegue**: llama.cpp / llama-cli (probado por el autor), Ollama y vLLM (según tags de la model card); TGI aparece como tag de librería.
- **Latencia y throughput**: ≈289 tok/s de prompt processing y ≈295 tok/s de generación en RTX PRO 6000 con MTP activado; el rendimiento en GPU de consumo será inferior y no está documentado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formato destacado |
|---|---|---|---|---|---|
| Qwen3.5-4B-NVFP4-GGUF (esta ficha) | 4,33B | 262K (1M+ ext.) | Sí (texto/imagen/vídeo) | Apache 2.0 | GGUF NVFP4 + mmproj |
| Qwen3.5-4B-MTP-GGUF (mismo autor) | 4,33B | 262K (1M+ ext.) | Sí | Apache 2.0 | GGUF con MTP |
| Falcon-H1R-7B | 7B (según model card) | No disponible | No disponible | No disponible | No disponible |
| NM-Nano-9B-V2 | 9B (según model card) | No disponible | No disponible | No disponible | No disponible |
| GPT-OSS-20B | 20B (según model card) | No disponible | No disponible | No disponible | No disponible |

La model card afirma que Qwen3.5-4B supera a Falcon-H1R-7B y NM-Nano-9B-V2 en el índice de inteligencia pese a tener menos parámetros, y que iguala a GPT-OSS-20B en razonamiento complejo con ~5× menos parámetros. No se dispone de datos adicionales de contexto, licencia o benchmarks de los modelos comparados en la información proporcionada.

## Limitaciones y advertencias

- **Restricción de hardware**: NVFP4 requiere GPU NVIDIA Blackwell; en hardware anterior el archivo puede no ser compatible o no aprovechar la aceleración FP4.
- **Idioma declarado**: la model card solo declara `en`, aunque el vocabulario base cubre 201 idiomas; la calidad en castellano no está validada en la información disponible.
- **Riesgo de alucinación**: inherente a modelos de 4B; el tamaño reducido limita la fiabilidad en tareas de conocimiento factual extenso.
- **Datos de entrenamiento no disponibles**: no se detalla composición del dataset, número de tokens ni fases de alineación (RLHF/DPO), lo que dificulta evaluar sesgos.
- **Sesgos**: no documentados en la información proporcionada; se recomienda auditoría propia antes de uso en producción.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-4B por si añaden restricciones adicionales.
- **Formato GGUF**: pensado para llama.cpp/Ollama; para vLLM o TGI puede requerir conversión o variantes específicas.
- **Benchmarks no verificados**: las cifras de la model card provienen del autor del modelo base y no han sido replicadas de forma independiente en esta ficha.

## Enlaces

- Hugging Face (esta cuantización): https://huggingface.co/prithivMLmods/Qwen3.5-4B-NVFP4-GGUF
- Variante MTP GGUF del mismo autor: https://huggingface.co/prithivMLmods/Qwen3.5-4B-MTP-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- llama.cpp: https://github.com/ggml-org/llama.cpp
