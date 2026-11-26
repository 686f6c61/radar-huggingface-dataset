# axteam/MiniCPM5-2B-AWQ-8bit

## Resumen

MiniCPM5-2B-AWQ-8bit es una cuantización de 8 bits del modelo denso openbmb/MiniCPM5-2B, publicada por axteam con el objetivo de servir el modelo en vLLM con un consumo de memoria reducido. El checkpoint aplica cuantización post-entrenamiento AWQ en esquema W8A16 (pesos INT8 simétricos con grupo 32, activaciones en BF16) y se almacena en formato compressed-tensors `pack-quantized`. El modelo base es un transformer denso de arquitectura tipo Llama, solo texto, con 2.516.756.480 parámetros reales según safetensors.

La relevancia de esta build radica en que preserva prácticamente intacta la calidad del original en BF16: la model card reporta un promedio de 53,09 frente a 52,97 del BF16 en su batería de benchmarks, con una perplejidad idéntica (1,5988) y un 98,2% de acuerdo top-1 en el siguiente token. Al ocupar solo 3,2 GB en disco, permite desplegar un modelo de 2,5B en GPUs de consumo y en nodos con múltiples réplicas por GPU.

Está pensada específicamente para inferencia con vLLM (probado con vLLM 0.32.0) y expone una API compatible con OpenAI. La licencia Apache-2.0 del modelo base se mantiene, lo que facilita su uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura Llama), solo texto |
| Parametros totales | 2.516.756.480 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (valor usado en los ejemplos de despliegue con `--max-model-len 32768`) |
| Tipos de cuantizacion | AWQ INT8 (W8A16): pesos INT8 simetricos, grupo 32, activaciones BF16; formato compressed-tensors `pack-quantized`; embeddings, LM head y RMSNorms en BF16 (~21% de los parametros) |
| Idiomas soportados | no disponible (la model card incluye ejemplos y evaluacion en ingles y coreano, pero no declara una lista oficial) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors `pack-quantized`) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de tipo Llama, solo texto, con 2,5B parámetros. Esta build concreta no reentrena el modelo: aplica cuantización post-entrenamiento AWQ sobre los pesos del original, con 256 muestras de calibración. Los pesos lineales se almacenan como INT8 simétrico con tamaño de grupo 32 y las activaciones se mantienen en BF16 (esquema W8A16), mientras que los token embeddings, el LM head y todas las RMSNorms se conservan en BF16. El tokenizer y el `chat_template` son idénticos a los del modelo original.

No se dispone de información en la documentación proporcionada sobre el número de tokens de entrenamiento, la composición del dataset ni sobre si el modelo base pasó por fases de RLHF o DPO. El modelo base incorpora un modo de razonamiento (thinking) activado por defecto en la plantilla de chat, desactivable mediante `chat_template_kwargs={"enable_thinking": False}`. La cuantización no requiere `trust_remote_code`.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat propia.
- Modo de razonamiento (thinking) activado por defecto en la plantilla de chat, desactivable por petición.
- Razonamiento matemático: 73,01 en GSM8K 5-shot estricto en esta build, idéntico al BF16 original.
- Conocimiento general y académico: 59,86 en MMLU generativo 5-shot.
- Comprensión lectora y sentido común: 43,86 en ARC-Challenge 0-shot y 64,40 en Winogrande 5-shot.
- Capacidades multilingües parciales: evaluado en inglés, coreano (HAE-RAE 39,14; KMMLU 38,27) y con ejemplos de uso en coreano en la model card.
- Servido como API compatible con OpenAI mediante vLLM, con soporte de chat completions.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión ni audio.

## Casos de uso

- Asistente conversacional de bajo coste: con 3,2 GB de pesos, se pueden servir varias réplicas en una sola GPU o desplegar en GPUs de consumo, gestionando conversaciones multi-turno con una ventana de hasta 32.768 tokens.
- Generación de código y texto en pipelines internos: el modelo ofrece generación de texto general con calidad cercana al BF16 original, adecuado para tareas de autocompletado y redacción asistida donde no se requiere un modelo de gran tamaño.
- Razonamiento matemático en aplicaciones educativas: su rendimiento en GSM8K (73,01) lo hace utilizable para resolución de problemas aritméticos de varios pasos en tutores automáticos o correctores.
- Atención al cliente en coreano e inglés: la model card incluye ejemplos de consulta en coreano y la evaluación cubre benchmarks coreanos (HAE-RAE, KMMLU), lo que respalda su uso en mercados de habla coreana.
- Backend de API compatible con OpenAI: al servirse con `vllm serve`, se integra directamente en aplicaciones existentes que consumen el endpoint `/v1/chat/completions` sin cambios de cliente.
- Evaluación y experimentación académica: al mantener la fidelidad al BF16 (perplejidad idéntica, 98,2% de acuerdo top-1), sirve como sustituto económico del original en experimentos de investigación y ablaciones.
- Despliegue en entornos con memoria limitada: la opción `--kv-cache-dtype fp8` reduce aproximadamente a la mitad la memoria de la caché KV, permitiendo contextos largos o lotes mayores en GPUs pequeñas.

## Benchmarks y rendimiento

Resultados medidos por el autor con lm-evaluation-harness sobre vLLM, decodificación greedy, prompts de estilo completion sin plantilla de chat. MMLU corresponde a la variante generativa de lm-eval y no es directamente comparable con puntuaciones obtenidas por log-likelihood.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit (este repo) | NVFP4A16 | NVFP4 | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot, generativo) | 59,74 | 59,56 (99,7%) | 59,86 (100,2%) | 56,81 (95,1%) | 53,50 (89,5%) | 56,31 (94,3%) |
| GSM8K (5-shot, estricto) | 73,01 | 71,27 (97,6%) | 73,01 (100,0%) | 65,20 (89,3%) | 55,04 (75,4%) | 65,96 (90,3%) |
| ARC-Challenge (0-shot) | 43,94 | 44,20 (100,6%) | 43,86 (99,8%) | 43,43 (98,8%) | 40,10 (91,3%) | 44,88 (102,1%) |
| Winogrande (5-shot) | 64,40 | 63,22 (98,2%) | 64,40 (100,0%) | 62,75 (97,4%) | 59,04 (91,7%) | 62,12 (96,4%) |
| KMMLU (5-shot, directo) | 37,65 | 38,38 (101,9%) | 38,27 (101,7%) | 35,56 (94,4%) | 34,06 (90,5%) | 30,73 (81,6%) |
| HAE-RAE (0-shot) | 39,05 | 38,13 (97,7%) | 39,14 (100,2%) | 35,38 (90,6%) | 30,16 (77,2%) | 36,94 (94,6%) |
| **Promedio** | **52,97** | **52,46 (99,0%)** | **53,09 (100,2%)** | **49,85 (94,1%)** | **45,32 (85,6%)** | **49,49 (93,4%)** |

Fidelidad al BF16 original sobre un conjunto interno mixto EN/KO de 100 prompts (respuestas greedy del BF16 puntuadas bajo cada build):

| Metrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor = mas cercano) | 1,5988 | 1,5988 (-0,0%) |
| Acuerdo top-1 en el siguiente token | 98,2% | 98,9% |

## Requisitos de hardware

- VRAM para pesos: 3,2 GB. Hay que añadir la caché KV (crece con la longitud de contexto y el número de peticiones concurrentes) y unos pocos GB para activaciones y grafos CUDA.
- GPU compatibles: NVIDIA Turing (sm75) o superior. V100 (sm70) no está soportada. No se requieren tensor cores especiales al ser cuantización weight-only INT.
- Cabe en GPUs de consumo: con 3,2 GB de pesos más caché KV, es viable en tarjetas de 8 GB o superiores; la model card solo confirma pruebas en B200.
- Despliegue principal: vLLM 0.32.0 (probado por el autor), con servidor compatible con OpenAI. Se puede usar `--tensor-parallel-size N` si los pesos no caben en una GPU.
- Despliegue alternativo: transformers ≥4.56.0 con compressed-tensors ≥0.15.0 (comprobado con 4.56.2 y 4.57.6). En transformers 4.x el tokenizer devuelve `token_type_ids`, que el modelo no acepta; hay que eliminarlo antes de llamar a `generate`.
- Entorno de vLLM 0.32: Python 3.11–3.14, torch 2.13 (build CUDA 13.0), transformers ≥5.16.1,<5.20 y compressed-tensors 0.17.0 (fijado por vLLM; no actualizar por separado).
- Reducción de memoria de caché KV: `--kv-cache-dtype fp8` reduce aproximadamente a la mitad la memoria de la caché KV para contextos largos o lotes grandes.
- Latencia y throughput: no se han publicado cifras de latencia o throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad (promedio benchmarks del autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| axteam/MiniCPM5-2B-AWQ-8bit | 2,52B | 32.768 | 53,09 | Apache-2.0 | Hugging Face, vLLM |
| openbmb/MiniCPM5-2B (BF16) | 2,52B | 32.768 | 52,97 | Apache-2.0 | Hugging Face |
| MiniCPM5-2B FP8-dynamic | 2,52B | 32.768 | 52,46 | Apache-2.0 | Hugging Face |
| MiniCPM5-2B AWQ-4bit | 2,52B | 32.768 | 49,49 | Apache-2.0 | Hugging Face |
| MiniCPM5-2B NVFP4 | 2,52B | 32.768 | 45,32 | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks de modelos de otros autores comparables en la información proporcionada.

## Limitaciones y advertencias

- Sesgos: no se documentan análisis de sesgo en la información disponible; al ser un modelo base entrenado con datos web, es probable que herede sesgos de esos datos.
- Alucinación: no se publican tasas de alucinación; como todo modelo generativo de 2,5B, el riesgo es relevante en tareas de conocimiento factual y debe mitigarse con verificación externa.
- Idiomas: no hay una lista oficial de idiomas soportados; la evaluación se limita a inglés y coreano, por lo que el rendimiento en castellano u otros idiomas no está verificado.
- Contexto: la ventana de 32.768 tokens es la configurada en los ejemplos; no se documenta si el modelo base fue entrenado con esa longitud o si se extiende por interpolación.
- Compatibilidad: requiere vLLM 0.32.0 con versiones muy específicas de dependencias (torch 2.13, transformers ≥5.16.1,<5.20, compressed-tensors 0.17.0); no actualizar compressed-tensors por separado. En transformers 4.x hay que eliminar `token_type_ids` del tokenizer.
- Hardware: V100 (sm70) no está soportada; se requiere Turing (sm75) o superior.
- Licencia: Apache-2.0 permite uso comercial, pero los pesos originales y el tokenizer pertenecen a OpenBMB; conviene revisar los términos del modelo base.
- Formato: al ser cuantización AWQ INT8 en compressed-tensors, no es directamente compatible con llama.cpp, Ollama ni GGUF sin conversión adicional.
- Benchmarks: MMLU se midió con la variante generativa de lm-eval y no es comparable con puntuaciones obtenidas por log-likelihood.

## Enlaces

- [Hugging Face: axteam/MiniCPM5-2B-AWQ-8bit](https://huggingface.co/axteam/MiniCPM5-2B-AWQ-8bit)
- [Hugging Face: openbmb/MiniCPM5-2B (modelo base)](https://huggingface.co/openbmb/MiniCPM5-2B)
- [lm-evaluation-harness (EleutherAI)](https://github.com/EleutherAI/lm-evaluation-harness)
- [vLLM](https://github.com/vllm-project/vllm)
