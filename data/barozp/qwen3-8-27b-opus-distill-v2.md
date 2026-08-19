# barozp/Qwen3.8-27B-Opus-Distill-v2

## Resumen

Qwen3.8-27B-Opus-Distill-v2 es un fine-tuning del modelo multimodal denso Qwen/Qwen3.8-27B (27B parámetros, arquitectura qwen3_5_text) mediante LoRA sobre trazas de razonamiento verificadas y genuinas de Claude Opus. El autor, barozp, lo presenta como la segunda versión de su destilación de razonamiento, cuyo objetivo es transferir las capacidades de razonamiento paso a paso del profesor propietario a un modelo abierto, manteniendo intactas las capacidades de visión y predicción multi-token (MTP) heredadas del base.

Esta versión corrige un bug de bucle de razonamiento detectado en v1: cuando se combinaban ciertas restricciones de formato apiladas (por ejemplo, "no prose" + "no markdown"), el modelo entraba en un ciclo de auto-verificación sin producir salida visible, agotando el presupuesto de tokens. El problema se originó en datos de entrenamiento reconstruidos por un modelo auxiliar (TraceInversion), no en trazas reales del profesor. v2 reconstruye el dataset con trazas 100% verificadas, elimina filas patológicas y mantiene la ganancia de razonamiento (GPQA-Diamond +0.237 sobre el base en el protocolo del autor). El modelo se publica bajo licencia Apache 2.0 y está disponible en formato safetensors para transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_text (transformer denso, vision-language, con MTP) |
| Parametros totales | 26.895.998.464 (26,9B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (heredada del base Qwen3.8-27B; no especificada en la model card) |
| Tipos de cuantizacion | safetensors en bf16 (no se publican cuantizaciones; el repo GGUF es un placeholder) |
| Idiomas soportados | no disponibles (heredados del base; no especificados) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer denso de 64 capas con hidden size 5.120, atención por grupos (24 query heads, 4 key/value heads) y FFN con intermediate size 17.408. Sobre esta base se aplicó LoRA con r=64, alpha=64 y dropout=0.05, dirigida a las proyecciones q/k/v/o de las 16 capas de atención completa y a gate/up/down de las FFN en las 64 capas. El entrenamiento se realizó durante 1 época (696 pasos) con lr=1e-4 en coseno con 3% de warmup, batch efectivo 16, MAX_SEQ=4096 y precisión bf16, completándose en unas 4h15m en una A100 80GB. La pérdida de validación final fue 0,4334, inferior a la de v1 (0,4647) y a la del intento intermedio con datos genuinos puros (0,805).

El dataset de entrenamiento (barozp/opus-reasoning-distill-v2) contiene 11.716 ejemplos, todos trazados a fuentes verificadas de razonamiento de Claude Opus (lordx64/reasoning-distill-claude-opus-4-7-max y Roman1111111/claude-opus-4.6-10000x). Se eliminaron 169 filas con el patrón patológico detectado y 2.429 filas sin fuente verificable. Las capacidades de visión y MTP se heredan del base sin entrenamiento adicional.

## Capacidades

- Razonamiento paso a paso mejorado: el fine-tuning transfiere trazas de razonamiento de Claude Opus, con ganancias significativas en tareas de razonamiento complejo (ARC, GPQA) respecto al base.
- Generación de texto y código: conserva las capacidades del base Qwen3.8-27B, incluyendo generación de código y comprensión de instrucciones.
- Visión (image-text-to-text): el modelo es multimodal nativo, capaz de procesar imágenes junto con texto (capacidad heredada, no entrenada en este fine-tuning).
- Predicción multi-token (MTP): soporta decodificación especulativa nativa heredada del base.
- Conversación y seguimiento de instrucciones: modelo causal de lenguaje apto para chat y tareas interactivas.
- Compatible con el ecosistema transformers: carga directa con AutoModelForImageTextToText y AutoModelForCausalLM.

## Casos de uso

- Razonamiento matemático y científico: el modelo muestra una mejora notable en GPQA-Diamond (+0.237 sobre el base), lo que lo hace adecuado para problemas de física, química y biología de nivel avanzado, donde el razonamiento multi-paso es crítico.
- Depuración de código con restricciones de formato: la corrección del bug de bucles permite usar el modelo en pipelines que exigen salidas sin prosa ni markdown (por ejemplo, generación de parches o snippets limpios) sin riesgo de agotar el contexto.
- Análisis de documentos con imágenes: al conservar la visión del base, puede procesar capturas de pantalla, diagramas o formularios escaneados y razonar sobre su contenido, útil en automatización de oficina.
- Agentes conversacionales con razonamiento encadenado: la mejora en ARC y GPQA sugiere mejor capacidad para descomponer tareas en pasos intermedios, útil en asistentes que requieren planificación.
- Generación de código en entornos CI/CD: con tool calling heredado del base (no verificado en esta ficha), puede integrarse en flujos de revisión o generación automática de código con verificación de formato.
- Investigación en destilación de razonamiento: sirve como caso de estudio de cómo la calidad y autenticidad de los datos de destilación afecta al rendimiento y a la estabilidad del modelo.

## Benchmarks y rendimiento

Resultados medidos con lm-evaluation-harness, 0-shot, loglikelihood (multiple-choice), chat template desactivado y modo QUICK (límite 500). La columna Δ es la diferencia respecto al base Qwen3.8-27B.

| Tarea | Métrica | Base | v2 | Δ v2 | Δ v1 (referencia) |
|---|---:|---:|---:|---:|---:|
| wikitext | perplexity (↓) | 8,4335 | 8,3788 | −0,055 | −0,09 |
| mmlu | acc | 0,8494 | 0,8476 | −0,002 | −0,001 |
| hellaswag | acc_norm | 0,7420 | 0,7500 | +0,008 | −0,002 |
| arc_challenge | acc_norm | 0,5880 | 0,6220 | +0,034 | +0,042 |
| gpqa_diamond | acc_norm | 0,2323 | 0,4697 | +0,237 | +0,263 |

El conocimiento (MMLU) y el modelado de lenguaje (wikitext) no se ven afectados; el razonamiento (ARC, GPQA) muestra una ganancia real, algo menor que la de v1 (esperable, ya que parte de la ganancia de v1 provenía de datos reconstruidos). Los valores de GPQA no son comparables con los publicados por Qwen (89,2 en modo thinking con otro harness).

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 53,8 GB según LLM Explorer, lo que requiere una GPU profesional de 80 GB (A100, H100) o múltiples GPUs consumer en paralelo.
- GPU recomendadas: A100 80GB (usada en entrenamiento), H100 80GB, o configuración multi-GPU (por ejemplo, 2× RTX 4090 con 24 GB cada una, aunque no se ha verificado).
- En GPU consumer (RTX 3090/4090 de 24 GB) no cabe sin cuantización; no se han publicado pesos cuantizados (el repo GGUF es un placeholder).
- Opciones de despliegue: transformers (carga directa), vLLM, TGI, o llama.cpp si se generan pesos GGUF en el futuro. También compatible con endpoints de Hugging Face.
- Latencia y throughput: no disponibles; depende del hardware y del uso de MTP (que puede acelerar la decodificación especulativa).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GPQA-Diamond (protocolo del autor) | Licencia | Disponibilidad |
|---|---|---|---:|---|---|
| Qwen3.8-27B (base) | 26,9B | no disponible | 0,2323 | Apache 2.0 | Hugging Face |
| Qwen3.8-27B-Opus-Distill v1 | 26,9B | no disponible | +0,263 sobre base | Apache 2.0 | Hugging Face |
| Qwen3.8-27B-Opus-Distill v2 | 26,9B | no disponible | +0,237 sobre base | Apache 2.0 | Hugging Face |

No se dispone de datos de otros modelos destilados de razonamiento comparables (por ejemplo, DeepSeek-R1-Distill) en la información proporcionada. La comparativa se limita a las variantes del mismo autor y al base.

## Limitaciones y advertencias

- El bug de bucle de razonamiento de v1 está corregido para el caso reportado (restricciones apiladas como "no prose" + "no markdown"), pero no se garantiza que no existan otros patrones patológicos no detectados.
- La ganancia de razonamiento es real pero menor que la de v1; el autor atribuye esta reducción a la eliminación de datos reconstruidos que inflaban artificialmente el rendimiento.
- Los benchmarks se midieron con un protocolo propio (0-shot, loglikelihood, límite 500); no son comparables directamente con resultados publicados por otros equipos.
- No se especifican los idiomas soportados ni la longitud de contexto exacta; se heredan del base Qwen3.8-27B, cuyos detalles no se incluyen en la model card.
- No se han publicado cuantizaciones GGUF ni AWQ; el despliegue en hardware consumer requiere conversión manual o esperar a que el autor publique versiones cuantizadas.
- El modelo puede alucinar en tareas de conocimiento factual (MMLU no mejora) y no se han evaluado sesgos específicos.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo se basa en trazas de razonamiento de Claude Opus; el autor declara que las trazas son "verificadas genuinas", pero no se detalla la procedencia exacta de las muestras del profesor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/barozp/Qwen3.8-27B-Opus-Distill-v2
- Versión v1: https://huggingface.co/barozp/Qwen3.8-27B-Opus-Distill
- Dataset de entrenamiento: https://huggingface.co/datasets/barozp/opus-reasoning-distill-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repo GGUF (placeholder): https://huggingface.co/barozp/Qwen3.8-27B-Opus-Distill-GGUF
- Vista de arquitectura (hfviewer): https://hfviewer.com/barozp/Qwen3.8-27B-Opus-Distill
- Ficha en LLM Explorer: https://llm-explorer.com/model/barozp%2FQwen3.8-27B-Opus-Distill,3VlOlS40JbJDkIo8TeHR6E
