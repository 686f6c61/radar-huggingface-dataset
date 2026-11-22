# axteam/Qwen3.8-27B-AWQ-8bit

## Resumen
Qwen3.8-27B-AWQ-8bit es una cuantizacion post-entrenamiento (PTQ) en INT8 del modelo multimodal Qwen/Qwen3.8-27B, publicada por axteam. Emplea la tecnica AWQ (Activation-aware Weight Quantization) con esquema W8A16: pesos simetricos INT8 con tamano de grupo 32 y activaciones en BF16, almacenados en el formato `pack-quantized` de compressed-tensors. El objetivo es servir el modelo en vLLM con un peso en disco de aproximadamente 32,7 GB, frente a los 64,6 GB del repositorio original, manteniendo una fidelidad practicamente identica al modelo base en BF16.

El modelo base es un transformer hibrido (atencion lineal combinada con atencion completa), denso, multimodal con torre de vision y con una cabeza MTP (multi-token prediction). Cuenta con 27.781.427.952 parametros totales. La cuantizacion deja en BF16 aproximadamente el 12% de los parametros: torre y proyector de vision, cabeza MTP, todas las RMSNorm, embeddings de tokens, LM head y las partes no lineales del modulo SSM (conv1d, A_log, dt_bias).

La relevancia de esta publicacion es doble: por un lado, reduce el coste de despliegue del modelo de 27B en produccion; por otro, incluye mediciones reproducibles con lm-evaluation-harness sobre vLLM que muestran una recuperacion media del 100,3% respecto al BF16 original, con una perplexity de 1,3584 frente a 1,3586 del modelo sin cuantizar. La revision del 1 de noviembre de 2026 restauro de forma bit-exacta los pesos RMSNorm no suavizados que habian quedado con ruido de redondeo BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido (atencion lineal + atencion completa), denso, multimodal (vision), con cabeza MTP |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada (el ejemplo de uso emplea `--max-model-len 32768`) |
| Tipos de cuantizacion | AWQ INT8 W8A16 (pesos INT8 simetricos, grupo 32, activaciones BF16); el modelo base dispone de variantes FP8-dynamic, NVFP4A16, NVFP4 y AWQ-4bit segun los benchmarks |
| Idiomas soportados | No disponible (la calibracion AWQ uso un corpus mixto con predominio de coreano; los benchmarks incluyen KMMLU y HAE-RAE) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors `pack-quantized` |

## Arquitectura y entrenamiento
El modelo base Qwen3.8-27B emplea una arquitectura hibrida que combina capas de atencion lineal con capas de atencion completa, siguiendo la linea de las generaciones Qwen3.5. Es un modelo denso (no MoE) de 27,8 mil millones de parametros, multimodal con torre de vision y proyector, y anade una cabeza de prediccion multi-token (MTP) que puede aprovecharse para decodificacion especulativa. No se dispone en la informacion proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en el modelo original.

Esta version concreta es una cuantizacion PTQ sin reentrenamiento. AWQ utiliza un conjunto de calibracion de 256 muestras (corpus mixto con predominio de coreano) para identificar y proteger los canales de pesos mas relevantes antes del redondeo. Los pesos cuantizados se almacenan como INT8 simetricos con grupo de 32; las activaciones permanecen en BF16. El tokenizador, el `chat_template` y el `generation_config` son identicos a los del original, y el `config.json` es el original mas un bloque `quantization_config`. La revision del 1 de noviembre de 2026 restauro bit-exactamente los pesos RMSNorm no suavizados por AWQ, eliminando el ruido de redondeo BF16 (hasta un 0,4% en la ganancia efectiva) que habia introducido el manejo de offset-norm de llm-compressor.

## Capacidades
- Generacion de texto conversacional multi-turno con plantilla de chat compatible con el original.
- Razonamiento y conocimiento general, evaluado en MMLU generativo, ARC-Challenge y Winogrande.
- Razonamiento matematico de varios pasos, evaluado en GSM8K en modo estricto.
- Comprension de imagen y texto (`image-text-to-text`): la torre de vision y el proyector se mantienen en BF16 para preservar la calidad multimodal.
- Capacidades multilingues, con especial cobertura del coreano segun los benchmarks KMMLU y HAE-RAE; el resto de idiomas no esta documentado en la informacion disponible.
- Cabeza MTP (multi-token prediction) conservada en BF16, utilizable para decodificacion especulativa.
- Soporte de tool calling y function calling: no confirmado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion proporcionada.
- Modo thinking explicito, audio u otras modalidades: no disponibles en la informacion proporcionada.

## Casos de uso
- Servicio de inferencia multimodal en produccion: desplegar un endpoint compatible con OpenAI mediante `vllm serve` para tareas de imagen-texto, con un peso de 32,7 GB que cabe en una sola GPU de 48 GB o en dos de 24 GB con tensor parallelism.
- Asistente conversacional multi-turno: el modelo conserva el `chat_template` y el `generation_config` originales, por lo que puede sustituir al BF16 en aplicaciones de chat sin cambios en el codigo de integracion.
- Procesamiento de documentos con imagen y texto: al mantener la torre de vision en BF16, es adecuado para extraccion y resumen de contenido visual en pipelines de back office.
- Evaluacion y benchmarking interno: sirve como referencia cuantizada reproducible con lm-evaluation-harness sobre vLLM, con recuperacion media del 100,3% frente al BF16.
- Despliegue con restricciones de memoria: reduce el footprint de 64,6 GB a 32,7 GB, lo que permite servir el modelo en GPUs de 48 GB con margen para KV cache y grafos CUDA.
- Aplicaciones en coreano: los resultados en KMMLU (65,77) y HAE-RAE (76,90) indican un rendimiento equiparable al original, adecuado para asistentes y clasificacion en ese idioma.
- Prototipado e investigacion: el checkpoint es compatible con transformers >= 5.2.0 y compressed-tensors >= 0.15.0, lo que facilita experimentos sin infraestructura de servido dedicada.

## Benchmarks y rendimiento
Mediciones realizadas con lm-evaluation-harness sobre vLLM, decodificacion greedy, prompts estilo completion sin plantilla de chat (0 o 5 shots segun la fila). MMLU corresponde a la variante generativa (`mmlu_generative`), no comparable con puntuaciones obtenidas por log-likelihood. Los porcentajes indican recuperacion respecto al BF16 original.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit (este repo) | NVFP4A16 | NVFP4 | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot, generativo) | 62,42 | 62,15 (99,6%) | 62,48 (100,1%) | 62,55 (100,2%) | 63,47 (101,7%) | 63,40 (101,6%) |
| GSM8K (5-shot, estricto) | 70,43 | 76,88 (109,1%) | 70,81 (100,5%) | 49,81 (70,7%) | 47,54 (67,5%) | 76,42 (108,5%) |
| ARC-Challenge (0-shot) | 58,62 | 58,36 (99,6%) | 58,79 (100,3%) | 58,70 (100,1%) | 57,76 (98,5%) | 59,56 (101,6%) |
| Winogrande (5-shot) | 79,08 | 79,56 (100,6%) | 79,32 (100,3%) | 79,48 (100,5%) | 80,03 (101,2%) | 79,72 (100,8%) |
| KMMLU (5-shot, directo) | 65,72 | 65,71 (100,0%) | 65,77 (100,1%) | 65,37 (99,5%) | 64,82 (98,6%) | 65,19 (99,2%) |
| HAE-RAE (0-shot) | 76,35 | 76,54 (100,2%) | 76,90 (100,7%) | 75,89 (99,4%) | 75,80 (99,3%) | 76,44 (100,1%) |
| Media | 68,77 | 69,87 (101,6%) | 69,01 (100,3%) | 65,30 (95,0%) | 64,90 (94,4%) | 70,12 (102,0%) |

Fidelidad respecto al original en BF16 sobre un conjunto interno mixto ingles/coreano de 100 prompts (respuestas greedy del BF16 puntuadas bajo cada build):

| Metrica | Este modelo | BF16 original |
|---|---|---|
| Perplexity (menor = mas cercano) | 1,3584 | 1,3586 (-0,0%) |
| Acuerdo top-1 en el siguiente token | 99,1% | 99,4% |

## Requisitos de hardware
- VRAM estimada: 32,7 GB solo para pesos; anadir KV cache (crece con longitud de contexto y peticiones concurrentes) y varios GB para activaciones y grafos CUDA.
- GPUs recomendadas: NVIDIA Turing (sm75) o superior; V100 (sm70) no esta soportado. La unica GPU probada por el autor fue la B200. Con 32,7 GB de pesos, encaja en A100 80 GB, H100 80 GB, L40S 48 GB y A6000 48 GB.
- GPU de consumo: cabe en RTX 4090 (24 GB) solo mediante tensor parallelism con varias unidades, ya que los pesos superan la VRAM de una sola tarjeta.
- Despliegue: vLLM >= 0.17.0 (probado con 0.32.0); requiere Python 3.11-3.14, torch 2.13 (build CUDA 13.0), transformers >= 5.16.1,<5.20 y compressed-tensors 0.17.0. Tambien es posible usar transformers >= 5.2.0 con compressed-tensors >= 0.15.0 sin vLLM. No requiere `trust_remote_code`.
- Throughput y latencia: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| axteam/Qwen3.8-27B-AWQ-8bit | 27,78B | no disponible | Apache-2.0 | safetensors (compressed-tensors) | Media de 69,01 en los seis benchmarks; 32,7 GB en disco |
| Qwen/Qwen3.8-27B (BF16) | 27,78B | no disponible | Apache-2.0 | safetensors | Referencia sin cuantizar; media de 68,77; 64,6 GB en el repo |
| Qwen3.8-27B FP8-dynamic | 27,78B | no disponible | Apache-2.0 | no disponible | Media de 69,87 (101,6%); GSM8K de 76,88 |
| Qwen3.8-27B AWQ-4bit | 27,78B | no disponible | Apache-2.0 | no disponible | Media de 70,12 (102,0%); menor footprint, mayor desviacion en GSM8K |
| Qwen3.8-27B NVFP4 / NVFP4A16 | 27,78B | no disponible | Apache-2.0 | no disponible | Medias de 64,90 y 65,30; caida notable en GSM8K (67,5% y 70,7%) |

## Limitaciones y advertencias
- Al ser una cuantizacion PTQ, no hay reentrenamiento: la fidelidad es alta (perplexity 1,3584 frente a 1,3586), pero el acuerdo top-1 baja al 99,1% frente al 99,4% del BF16.
- El conjunto de calibracion AWQ tiene predominio de coreano; el comportamiento en otros idiomas no esta documentado y podria desviarse mas del original.
- GSM8K en modo estricto muestra 70,81 frente a 70,43 del BF16, pero otras variantes cuantizadas (FP8-dynamic, AWQ-4bit) obtienen puntuaciones muy superiores en esa misma prueba, lo que sugiere sensibilidad del benchmark al formato de respuesta; no debe interpretarse como mejora real de capacidad matematica.
- Los resultados de MMLU usan la variante generativa y no son comparables con puntuaciones obtenidas por log-likelihood.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada; aplican los riesgos habituales de un modelo de 27B en tareas de conocimiento factual.
- Limitaciones de contexto: la longitud de contexto nativa no se indica; el ejemplo oficial limita `--max-model-len` a 32768, por lo que contextos mayores requieren verificacion previa.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene revisar la licencia del modelo base enlazada por el autor.
- Dependencias de runtime muy especificas: vLLM 0.32.0 fija transformers y compressed-tensors en versiones concretas (0.17.0); no se debe actualizar compressed-tensors por separado.
- V100 (sm70) no esta soportado; solo se valido en B200, por lo que el rendimiento en otras GPU no esta medido.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/axteam/Qwen3.8-27B-AWQ-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
