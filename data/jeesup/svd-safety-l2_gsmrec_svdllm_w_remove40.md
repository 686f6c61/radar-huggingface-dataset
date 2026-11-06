# Jeesup/svd-safety-l2_gsmrec_svdllm_w_remove40

## Resumen

Jeesup/svd-safety-l2_gsmrec_svdllm_w_remove40 es un artefacto de investigación derivado de meta-llama/Llama-2-7b-chat-hf, comprimido mediante la técnica SVD-LLM con una eliminación del 40 % de los parámetros y posteriormente sometido a un ajuste fino de recuperación con LoRA sobre el conjunto de entrenamiento de GSM8K (7.473 problemas en formato Alpaca, con corte de 512 tokens y una partición de validación de 500). El resultado se fusiona en los pesos finales, dando lugar a un checkpoint de 6.738.415.616 parámetros en formato safetensors (13,5 GB en el repositorio).

El modelo no está pensado como asistente de propósito general: forma parte del proyecto svd_safety y su model card advierte explícitamente de que algunas celdas están deliberadamente degradadas en seguridad o sobre-rechazan peticiones. Su interés radica en servir como banco de pruebas para estudiar el impacto de la compresión SVD sobre capacidades como el razonamiento matemático (GSM8K), la seguridad frente a ataques de jailbreak (AdvBench, StrongREJECT) y el cumplimiento de instrucciones (IFEval).

La relevancia actual es metodológica: permite analizar empíricamente el compromiso entre eficiencia (menos parámetros) y degradación de capacidades, un aspecto clave para desplegar modelos en entornos con recursos limitados. La licencia es Llama 2 Community License, con las restricciones habituales de uso comercial de Meta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama 2), comprimida con SVD-LLM |
| Parametros totales | 6.738.415.616 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base Llama 2 soporta 4096 tokens; el ajuste de recuperación usó corte de 512) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible (el modelo base está entrenado mayoritariamente en inglés) |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura de partida es un transformer decoder-only de tipo Llama 2 con 7.000 millones de parámetros, al que se aplica SVD-LLM para eliminar el 40 % de los parámetros mediante descomposición en valores singulares guiada por calibración. La calibración se realizó únicamente con WikiText-2 (configuración "W"), con semilla 42. Este proceso reduce el tamaño del modelo a 6.738.415.616 parámetros, lo que supone una compresión significativa respecto al original.

Tras la compresión, se entrena un LoRA de recuperación sobre el conjunto de entrenamiento de GSM8K (7.473 problemas, formato Alpaca, corte de 512 tokens, partición de validación de 500) en lugar de alpaca-cleaned, y se fusiona en los pesos. No se documentan detalles sobre el número total de tokens de entrenamiento del modelo base ni sobre etapas de RLHF/DPO adicionales; la información disponible se limita al pipeline de compresión y recuperación descrito en la model card.

## Capacidades

- Generación de texto conversacional heredada de Llama-2-7b-chat.
- Razonamiento matemático básico orientado a problemas de tipo GSM8K, aunque con rendimiento limitado (13,04 % estricto en 5-shot).
- Seguimiento de instrucciones, con un rendimiento bajo en IFEval (8,69 % a nivel de prompt en modo estricto).
- Capacidad de rechazo y seguridad evaluable mediante AdvBench y StrongREJECT, con tasas de ataque registradas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso más allá del prompting estándar.
- Capacidades multilingües no disponibles en la información proporcionada.
- No se documentan modos especiales como thinking mode, visión o audio.

## Casos de uso

- Investigación sobre compresión de modelos: sirve para medir la degradación de capacidades al eliminar el 40 % de parámetros con SVD-LLM, comparando métricas como perplejidad en WikiText-2 (13,76) frente al modelo original.
- Evaluación de seguridad en modelos comprimidos: permite analizar cómo afecta la compresión a las tasas de éxito de ataques (AdvBench ASR 22,31 %, StrongREJECT ASR 25,24 %) y al sobre-rechazo (XSTest 22,36 %).
- Estudio de sobre-rechazo: útil para caracterizar el equilibrio entre seguridad y utilidad, dado que la model card advierte de celdas deliberadamente degradadas o sobre-rechazantes.
- Benchmarking de recuperación con LoRA: sirve como referencia para comparar estrategias de recuperación tras compresión, en este caso con datos de GSM8K en lugar de alpaca-cleaned.
- Análisis de razonamiento matemático post-compresión: permite estudiar la caída de rendimiento en GSM8K (13,04 % estricto) y su relación con la eliminación de parámetros.
- Reproducibilidad de experimentos: al documentarse la semilla (42), la calibración (WikiText-2) y el script de trabajos (jobs/gsmrec_slurm.sh), facilita la replicación de resultados en el proyecto svd_safety.
- Docencia y formación: adecuado como ejemplo práctico de pipeline de compresión SVD más ajuste de recuperación en cursos de eficiencia de modelos.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Perplejidad en WikiText-2 | 13,76 |
| Media zero-shot en 7 tareas | 43,86 % |
| AdvBench ASR (juez HarmBench) | 22,31 % |
| StrongREJECT ASR (juez HarmBench) | 25,24 % |
| XSTest sobre-rechazo seguro (WildGuard) / puntuado | 22,36 % / 64,40 % |
| OR-Bench-Hard-1k sobre-rechazo / puntuado | 10,93 % / 66,57 % |
| GSM8K 5-shot estricto / flexible (plantilla de chat) | 13,04 % / 12,13 % |
| IFEval estricto a nivel de prompt | 8,69 % |

No se han publicado en la información disponible resultados comparativos con otros modelos en estos benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 16-24 GB.
- En cuantización de 8 bits: alrededor de 7 GB de pesos, viable en GPUs consumer de 12 GB o más.
- En cuantización de 4 bits: alrededor de 3,5-4 GB de pesos, viable en GPUs de 8 GB, aunque no se documentan variantes cuantizadas oficiales.
- GPUs recomendadas: A100 (40/80 GB), H100, RTX 4090 (24 GB), RTX 3090 (24 GB); para cuantización 4 bits, RTX 3060/4060 Ti (8-16 GB).
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag endpoints_compatible); no se documenta compatibilidad con vLLM, llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Jeesup/svd-safety-l2_gsmrec_svdllm_w_remove40 | 6.738.415.616 | No disponible | Llama 2 Community | Hugging Face |
| meta-llama/Llama-2-7b-chat-hf | 6.738.415.616 | 4096 tokens | Llama 2 Community | Hugging Face |
| Modelos comprimidos SVD-LLM equivalentes | No disponible | No disponible | No disponible | No disponible |

La comparación directa con el modelo base es la más relevante: comparten arquitectura y licencia, pero el modelo comprimido elimina el 40 % de parámetros y sustituye el ajuste conversacional original por un LoRA de recuperación sobre GSM8K. No se dispone de datos de benchmarks del modelo base en la información proporcionada para cuantificar la degradación relativa.

## Limitaciones y advertencias

- Artefacto de investigación: la model card indica explícitamente que no es un asistente de propósito general y que debe evaluarse antes de usarse.
- Seguridad degradada de forma deliberada: algunas celdas están diseñadas para sobre-rechazar o para degradar la seguridad, lo que invalida su uso en producción sin auditoría previa.
- Riesgo de alucinación: no cuantificado en la información disponible, pero esperable en un modelo comprimido y ajustado con datos limitados.
- Rendimiento bajo en seguimiento de instrucciones (IFEval 8,69 % estricto) y en matemáticas (GSM8K 13,04 % estricto), lo que limita su uso en tareas que requieran precisión.
- Contexto de entrenamiento limitado a 512 tokens en la fase de recuperación, lo que puede afectar al rendimiento en secuencias largas.
- Idiomas soportados no documentados; el modelo base está orientado principalmente al inglés.
- Licencia Llama 2 Community: restricciones de uso comercial, obligación de incluir avisos de licencia y cumplimiento de la política de uso aceptable de Meta.
- Sin descargas ni interacciones registradas en Hugging Face, lo que implica ausencia de validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_gsmrec_svdllm_w_remove40
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2: https://ai.meta.com/llama/license/
- Proyecto svd_safety: no disponible como enlace público en la información proporcionada
- Paper de SVD-LLM: no disponible en la información proporcionada
