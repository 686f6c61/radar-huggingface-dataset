# disillusioned/Huihui-GLM-4.7-Flash-abliterated-NVFP4

## Resumen

`disillusioned/Huihui-GLM-4.7-Flash-abliterated-NVFP4` es una cuantización a 4 bits en formato NVFP4 del modelo `huihui-ai/Huihui-GLM-4.7-Flash-abliterated`, que a su vez es una versión "abliterated" (sin mecanismos de rechazo) de `zai-org/GLM-4.7-Flash`. El modelo base pertenece a la familia GLM-4.7 de Zhipu AI (zai-org), con arquitectura de mezcla de expertos ligera (`glm4_moe_lite`), y ha sido procesado mediante técnicas de abliteration para eliminar las respuestas de rechazo del modelo original.

La contribución de este repositorio es puramente de cuantización: los pesos se han convertido al formato NVFP4 (float de 4 bits empaquetado, con escalas FP8-E4M3 y tamaño de grupo 16) mediante `llm-compressor` y `compressed-tensors`, con el objetivo de servir el modelo de forma eficiente en GPUs NVIDIA Blackwell (sm_120, como la RTX 5090) usando vLLM. La arquitectura, el tokenizer y la plantilla de chat se mantienen idénticos al modelo fuente, y se preserva la cabeza de borrador especulativo MTP (`model_mtp.safetensors`).

El modelo cuenta con aproximadamente 31.220 millones de parámetros totales (dato real de safetensors) y un repositorio de 21,9 GB, lo que refleja la compresión a 4 bits respecto a los pesos originales en bf16. Está orientado a generación de texto conversacional en inglés y chino, con soporte de tool calling y modo de razonamiento, y se distribuye bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE ligera (`glm4_moe_lite`) |
| Parametros totales | 31.221.488.576 (~31,2 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits empaquetado, grupo 16, escalas FP8-E4M3); también etiquetado como 8-bit en los tags |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base `zai-org/GLM-4.7-Flash` emplea una arquitectura de mezcla de expertos ligera identificada como `glm4_moe_lite`. Esta cuantización conserva íntegramente la arquitectura del modelo fuente: solo se han cuantizado los pesos, mientras que la tokenizer, la plantilla de chat y la estructura de la red permanecen sin cambios. Además, se preserva la cabeza de borrador especulativo MTP (Multi-Token Prediction) en `model_mtp.safetensors`, lo que permite decodificación especulativa durante la inferencia.

El proceso de cuantización se realizó con `llm-compressor` y `compressed-tensors`, convirtiendo los pesos a NVFP4: float de 4 bits empaquetado con escalas FP8-E4M3 y tamaño de grupo 16. El modelo intermedio (`huihui-ai/Huihui-GLM-4.7-Flash-abliterated`) se generó mediante abliteration, una técnica que elimina las direcciones de activación asociadas a los rechazos del modelo original sin recurrir a TransformerLens, descrita como una implementación "cruda y de prueba de concepto". No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Modo de razonamiento (reasoning), con parser específico `glm47` disponible en vLLM.
- Soporte de tool calling / function calling, con parser `glm47` y `--enable-auto-tool-choice` en vLLM.
- Decodificación especulativa mediante la cabeza MTP preservada (`--speculative-config '{"method": "mtp", "num_speculative_tokens": 1}'`).
- Comportamiento "uncensored": ausencia de rechazos tras la abliteration.
- Capacidades multilingües limitadas a inglés y chino según los metadatos.
- No se dispone de información sobre capacidades de visión, audio o matemáticas avanzadas en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el comportamiento de un LLM sin mecanismos de rechazo, comparando respuestas con la versión original de GLM-4.7-Flash para analizar qué tipos de contenido se desbloquean tras la abliteration.
- Despliegue de bajo coste en GPUs Blackwell: gracias a la cuantización NVFP4, el modelo puede servirse con vLLM en una RTX 5090 u otras GPUs sm_120, reduciendo el consumo de VRAM frente a los pesos en bf16.
- Generación de texto conversacional en inglés y chino: útil para prototipos de asistentes bilingües donde se requiera baja latencia y no haya restricciones de contenido.
- Integración en pipelines con tool calling: el soporte del parser `glm47` en vLLM permite construir agentes que invoquen funciones externas (APIs, bases de datos) en flujos multi-paso.
- Evaluación de decodificación especulativa: la cabeza MTP preservada permite medir el impacto del speculative decoding en throughput y latencia sobre hardware Blackwell.
- Experimentación con cuantización NVFP4: sirve como referencia para comparar la calidad de NVFP4 frente a otras cuantizaciones (GPTQ, AWQ, bnb-nf4) sobre un mismo modelo base.
- Investigación sobre contenido sin filtros en entornos controlados: análisis de sesgos, toxicidad y comportamientos no alineados en condiciones de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 21,9 GB en NVFP4; se requiere una GPU con al menos ~24 GB de VRAM para cargar los pesos, más overhead de KV cache y activaciones.
- GPU recomendadas: NVIDIA Blackwell con sm_120 (por ejemplo, RTX 5090), ya que el formato NVFP4 está pensado para estas arquitecturas. No se garantiza compatibilidad con GPUs anteriores (Ampere, Ada) sin soporte nativo de NVFP4.
- Cabe en GPU consumer: sí, en RTX 5090 (32 GB) y potencialmente en otras GPUs Blackwell con suficiente VRAM; no se dispone de datos para GPUs de 24 GB o menos.
- Opciones de despliegue: vLLM (recomendado, con `--reasoning-parser glm47`, `--enable-auto-tool-choice --tool-call-parser glm47` y `--speculative-config` para MTP). El modelo base sin cuantizar dispone de versión en Ollama (`huihui_ai/glm-4.7-flash-abliterated`), pero esta cuantización NVFP4 está orientada a vLLM.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| disillusioned/Huihui-GLM-4.7-Flash-abliterated-NVFP4 | ~31,2 B | no disponible | NVFP4 (4 bits) | MIT | Hugging Face |
| huihui-ai/Huihui-GLM-4.7-Flash-abliterated | no disponible | no disponible | bf16 (original) | MIT (heredada) | Hugging Face, Ollama |
| zai-org/GLM-4.7-Flash | no disponible | no disponible | bf16 | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La abliteration elimina los rechazos del modelo, lo que implica un riesgo elevado de generar contenido dañino, sesgado o inapropiado; no es apto para producción orientada al público sin filtros adicionales.
- Riesgo de alucinación inherente al modelo base; la cuantización a 4 bits puede degradar ligeramente la calidad respecto a los pesos en bf16.
- Idiomas soportados limitados a inglés y chino; el rendimiento en castellano no está garantizado.
- La longitud de contexto no está documentada en la información disponible.
- El formato NVFP4 requiere hardware NVIDIA Blackwell (sm_120); no es portable a GPUs sin soporte nativo de FP4.
- La licencia MIT permite uso comercial, pero el contenido generado puede infringir normativas locales; el usuario asume la responsabilidad legal.
- El autor del modelo base describe la abliteration como una "implementación cruda y de prueba de concepto", lo que sugiere que la eliminación de rechazos puede no ser completa ni estable.
- No se dispone de información sobre sesgos específicos medidos ni evaluaciones de seguridad.

## Enlaces

- [Hugging Face: disillusioned/Huihui-GLM-4.7-Flash-abliterated-NVFP4](https://huggingface.co/disillusioned/Huihui-GLM-4.7-Flash-abliterated-NVFP4)
- [Modelo base: huihui-ai/Huihui-GLM-4.7-Flash-abliterated](https://huggingface.co/huihui-ai/Huihui-GLM-4.7-Flash-abliterated)
- [Modelo original: zai-org/GLM-4.7-Flash](https://huggingface.co/zai-org/GLM-4.7-Flash)
- [llm-compressor](https://github.com/vllm-project/llm-compressor)
- [compressed-tensors](https://github.com/neuralmagic/compressed-tensors)
- [vLLM](https://github.com/vllm-project/vllm)
- [remove-refusals-with-transformers](https://github.com/Sumandora/remove-refusals-with-transformers)
- [Ollama: huihui_ai/glm-4.7-flash-abliterated](https://ollama.com/huihui_ai/glm-4.7-flash-abliterated)
- [Ollama 0.15.1](https://github.com/ollama/ollama/releases/tag/v0.15.1)
