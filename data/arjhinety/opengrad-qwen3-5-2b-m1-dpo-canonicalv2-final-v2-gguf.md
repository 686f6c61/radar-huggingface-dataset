# arjhinety/OpenGrad-Qwen3.5-2B-M1-DPO-CanonicalV2-Final-v2-GGUF

## Resumen
OpenGrad-Qwen3.5-2B-M1-DPO-CanonicalV2-Final-v2-GGUF es una conversión a formato GGUF del checkpoint `dpo-checkpoint-30` del proyecto OpenGrad, un repositorio de investigación de Experimental Intelligence. El modelo parte de Qwen3.5-2B y ha sido sometido a un post-entrenamiento DPO orientado a políticas de uso de herramientas (tool calling), generando nueve variantes de cuantización con llama.cpp a partir de una matriz de importancia única.

El modelo tiene 1.881.825.088 parámetros y se distribuye exclusivamente en GGUF, con tamaños que van desde 0,90 GiB (Q2_K) hasta 3,52 GiB (BF16). Su relevancia es fundamentalmente metodológica: el autor documenta con detalle un proceso de cuantización con puerta de calidad congelada y publica los resultados de cada formato sobre una partición confirmatoria de 1.277 ejemplos de tool use.

No obstante, la propia model card advierte que se trata de un artefacto de investigación y no de un asistente general: el checkpoint sin cuantizar rechaza las 1.319 preguntas zero-shot de GSM8K y muestra regresiones claras en IFEval y MMLU-Pro respecto al modelo base. La promoción inicial del checkpoint fue retirada el 22 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-2B; detalles internos no disponibles) |
| Parametros totales | 1.881.825.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q2_K, Q3_K_M, IQ3_M, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | other (composite-per-source) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento
La arquitectura subyacente es la de Qwen3.5-2B, un transformer de aproximadamente 1,88 mil millones de parámetros, sobre el que se aplica un post-entrenamiento DPO (checkpoint `dpo-checkpoint-30`). El entrenamiento posterior está centrado en políticas de tool use sobre datos derivados de When2Call, según indica la model card. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni la configuración de RLHF/DPO más allá de la referencia al checkpoint.

La conversión a GGUF se realizó con `convert_hf_to_gguf.py --outtype bf16 --no-mtp` sobre llama.cpp `b10919` (commit `d3146f2b56c2db4711ac8391871c9e529d1946d7`). Cada formato se cuantizó directamente desde el GGUF BF16 con una única matriz de importancia (`m1-v2.imatrix`, sha256 `ab6dc65f8a5c02bf036d4233c199d4852fdad488ec018d9adc9d20033a09dbc1`) mediante `llama-quantize --imatrix`. La evaluación se hizo contra una puerta de calidad (`quantization_preservation_v1`) congelada antes de que existiera ningún formato, sobre 1.277 ejemplos confirmatorios de tool use.

## Capacidades
- Generación de texto conversacional en formato GGUF compatible con llama.cpp.
- Tool calling y function calling, capacidad central del post-entrenamiento DPO; el modelo decide cuándo invocar herramientas, cuándo pedir aclaración y cuándo rechazar una llamada no soportada.
- Gestión de llamadas no soportadas (*unsupported accuracy*) y de aclaraciones (*clarification*), evaluadas explícitamente en la puerta de calidad.
- Razonamiento multi-step limitado al ámbito de decisión de herramientas; no hay evidencia publicada de capacidades generales de razonamiento.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio: no disponibles.
- Integración con endpoints compatibles (`endpoints_compatible` en los tags).

## Casos de uso
- Evaluación de cuantización en pipelines de tool calling: usar los nueve formatos publicados para medir cómo la compresión afecta la F1 de llamadas, la precisión y el over-call en un conjunto confirmatorio de 1.277 ejemplos, aprovechando que todos comparten matriz de importancia y puerta congelada.
- Prototipado de agentes con llama.cpp en entornos con VRAM limitada: Q6_K (1,45 GiB) es el formato recomendado por el autor y permite ejecutar el modelo en GPU consumer manteniendo un 98,0% de decisiones idénticas al BF16.
- Investigación sobre sobre-llamada de herramientas: comparar Q4_K_M (25,1% de over-call) con Q6_K (16,1%) para estudiar el efecto de la cuantización en la agresividad de invocación.
- Reproducibilidad de experimentos: los hashes sha256 de pesos, matriz de importancia y texto de calibración permiten replicar exactamente la cadena de conversión y cuantización.
- Filtrado de llamadas en asistentes internos: integrar el modelo como clasificador de decisión (llamar / aclarar / rechazar) en un orquestador que derive la ejecución real a otro modelo, dado su rendimiento específico en esa tarea.
- Docencia y auditoría de post-entrenamiento DPO: el par de model cards (padre y GGUF) documenta un caso completo de regresión por post-entrenamiento sobre políticas de herramientas, útil para analizar el coste de especializar modelos pequeños.

## Benchmarks y rendimiento
Resultados sobre la partición confirmatoria de 1.277 ejemplos de tool use. Throughput medido con llama-bench en una NVIDIA A100-SXM4-80GB con todas las capas en GPU (generación de 128 tokens y procesamiento de prompt a 2.048 tokens, media de 3 ejecuciones).

| Formato | Tamano | Call F1 | Precision | Recall | Over-call | Decisiones iguales a BF16 | Puerta congelada | Gen tok/s | Prompt tok/s |
|---|---:|---:|---:|---:|---:|---:|---|---:|---:|
| BF16 | 3,52 GiB | 0,7572 | 0,7344 | 0,7815 | 15,5% | referencia | pasa | 251,1 | 21.073 |
| Q2_K | 0,90 GiB | 0,6713 | 0,5548 | 0,8499 | 37,5% | 53,4% | falla | 284,8 | 9.623 |
| Q3_K_M | 1,02 GiB | 0,7415 | 0,6356 | 0,8896 | 28,0% | 77,1% | falla | 268,8 | 10.879 |
| IQ3_M | 0,99 GiB | 0,7057 | 0,5783 | 0,9051 | 36,3% | 77,1% | falla | 283,4 | 12.420 |
| IQ4_XS | 1,11 GiB | 0,7531 | 0,6628 | 0,8720 | 24,4% | 88,3% | falla | 306,3 | 13.288 |
| Q4_K_S | 1,13 GiB | 0,7578 | 0,6650 | 0,8808 | 24,4% | 87,9% | falla | 299,2 | 12.436 |
| Q4_K_M | 1,19 GiB | 0,7594 | 0,6612 | 0,8918 | 25,1% | 87,2% | falla | 292,7 | 12.200 |
| Q5_K_M | 1,31 GiB | 0,7612 | 0,7213 | 0,8057 | 17,1% | 95,0% | falla | 292,9 | 12.414 |
| Q6_K | 1,45 GiB | 0,7572 | 0,7286 | 0,7881 | 16,1% | 98,0% | pasa | 267,7 | 11.914 |
| Q8_0 | 1,87 GiB | 0,7543 | 0,7308 | 0,7792 | 15,8% | 98,7% | pasa | 273,8 | 13.297 |

Comparación con el modelo base en capacidades generales (checkpoint sin cuantizar):

| Benchmark | M1-v2 | Qwen3.5-2B base |
|---|---:|---:|
| GSM8K zero-shot (rechazos) | 1.319 / 1.319 | 0 |
| IFEval prompt-level strict | 45,8% | 67,8% |
| MMLU-Pro | 37,0% | 49,0% |

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 1,0-1,5 GiB para Q2_K a Q6_K, y unos 2 GiB para Q8_0, asumiendo todas las capas en GPU más overhead de contexto KV.
- GPU recomendadas: los datos de throughput se han medido en NVIDIA A100-SXM4-80GB; cualquier GPU con al menos 2-4 GiB de VRAM libre debería poder alojar los formatos pequeños con todas las capas en GPU.
- Cabe en GPU consumer: sí, todos los formatos caben en GPUs de gama de entrada y media (por ejemplo, GTX 1650, RTX 3060, RTX 4060) con margen amplio.
- Opciones de despliegue: llama.cpp (versión `b10919` o compatible), Ollama y cualquier runtime que consuma GGUF; los tags indican compatibilidad con endpoints.
- Latencia y throughput: entre 267,7 y 306,3 tok/s de generación y entre 9.623 y 13.297 tok/s de procesamiento de prompt en A100-SXM4-80GB, según formato. En GPU consumer el throughput será sensiblemente menor, aunque no se han publicado medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento tool use | Licencia | Disponibilidad |
|---|---|---:|---|---|---|
| OpenGrad-Qwen3.5-2B-M1-DPO-v2 GGUF | 1,88 B | no disponible | Call F1 0,757 (Q6_K) en 1.277 ejemplos | other (composite-per-source) | GGUF en HF |
| Qwen3.5-2B base | 1,88 B | no disponible | no disponible | según licencia Qwen | safetensors en HF |
| Checkpoint padre M1-DPO-v2 | 1,88 B | no disponible | Call F1 0,7572 (BF16) | other (composite-per-source) | safetensors en HF |

La comparación con alternativas de la misma categoría (modelos de 2B orientados a tool calling) no está disponible en la información proporcionada. El checkpoint padre y el modelo base son las referencias directas documentadas.

## Limitaciones y advertencias
- Artefacto de investigación: la model card lo declara explícitamente no apto como asistente general.
- Regresión severa en matemáticas: rechaza las 1.319 preguntas zero-shot de GSM8K, frente a cero rechazos del modelo base.
- Regresión en instrucciones: 45,8% en IFEval prompt-level strict frente al 67,8% del base.
- Regresión en conocimiento: 37,0% en MMLU-Pro frente al 49,0% del base.
- Las regresiones se asocian al post-entrenamiento sobre datos derivados de When2Call, pero la causalidad no está establecida.
- Los formatos cuantizados no fueron re-medidos en GSM8K, IFEval ni MMLU-Pro, por lo que se asume que heredan las regresiones.
- Solo Q6_K y Q8_0 superan la puerta de cuantización; ningún formato supera el barra de release secundaria más estricta.
- El aprobado de Q6_K es marginal: 357 llamadas correctas de 490 predichas frente a 356,96 requeridas, y una re-ejecución del modelo sin cuantizar en H200 falla la misma puerta en recall; está dentro del ruido entre ejecuciones.
- Riesgo de sobre-llamada elevado en formatos pequeños: Q2_K alcanza 37,5% de over-call y Q4_K_M 25,1%, frente al 15,5% del BF16.
- Idiomas soportados no documentados; no hay evidencia de capacidades multilingües.
- Licencia compuesta por fuente (`composite-per-source`), con enlace a la licencia de Qwen3.5-2B; es necesario revisar los términos de cada componente antes de uso comercial.
- La promoción del checkpoint fue retirada el 22 de octubre de 2026 tras detectarse la regresión de rechazos.

## Enlaces
- Modelo GGUF en Hugging Face: https://huggingface.co/arjhinety/OpenGrad-Qwen3.5-2B-M1-DPO-CanonicalV2-Final-v2-GGUF
- Modelo base (checkpoint padre): https://huggingface.co/arjhinety/OpenGrad-Qwen3.5-2B-M1-DPO-CanonicalV2-Final-v2
- Repositorio OpenGrad: https://github.com/arjhinety/OpenGrad
- Errata de OpenGrad (§41): https://github.com/arjhinety/OpenGrad/blob/175711ca045e6aefb52ca469c91f869f58abccd0/reports/ERRATA.md
- Experimental Intelligence: https://experimentalintelligence.org/
- Licencia Qwen3.5-2B referenciada: https://huggingface.co/Qwen/Qwen3.5-2B/blob/15852e8c16360a2fea060d615a32b45270f8a8fc/LICENSE
