# axteam/GLM-4-9B-0414-FP8-dynamic

## Resumen

GLM-4-9B-0414-FP8-dynamic es una cuantizacion de 8 bits del modelo denso zai-org/GLM-4-9B-0414, publicada por el usuario axteam. Se trata de un derivado pensado especificamente para servir el modelo con vLLM, empleando el esquema W8A8 de compressed-tensors (`FP8_DYNAMIC`): pesos en FP8 E4M3 con escala por canal de salida y activaciones FP8 dinamicas por token calculadas en tiempo de ejecucion. El proceso es PTQ sin reentrenamiento ni datos de calibracion.

El modelo base es un transformer denso de 9.400.279.040 parametros (9,4B) con arquitectura GLM-4 (`Glm4ForCausalLM`), unicamente de texto. La cuantizacion mantiene en BF16 las embeddings de tokens, la cabeza LM y todas las RMSNorm, y solo cuantiza las proyecciones de atencion y MLP. El resultado ocupa aproximadamente 10,6 GB en disco, frente a los cerca de 19 GB que requeriria el original en BF16, lo que reduce de forma notable los requisitos de VRAM para despliegue.

La relevancia de esta build es practica: permite servir un modelo de 9,4B en GPUs de una sola tarjeta con FP8 nativo (Ada, Hopper, Blackwell) manteniendo practicamente intacta la calidad del original. Segun las mediciones del autor, la media de seis benchmarks es de 66,21 frente a 66,15 del BF16, es decir, una recuperacion del 100,1%. La licencia es MIT, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso GLM-4 (`Glm4ForCausalLM`), solo texto |
| Parametros totales | 9.400.279.040 (9,4B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de servicio usa `--max-model-len 32768`) |
| Tipos de cuantizacion | FP8 W8A8: pesos FP8 E4M3 con escala por canal, activaciones FP8 dinamicas por token; esquema compressed-tensors `FP8_DYNAMIC`; embeddings, LM head y RMSNorm en BF16 |
| Idiomas soportados | no disponible (los benchmarks incluyen evaluaciones en coreano: KMMLU y HAE-RAE) |
| Licencia | MIT |
| Formato de pesos | safetensors con compressed-tensors (`float-quantized`), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base GLM-4-9B-0414 es un transformer denso de 9,4B parametros con la arquitectura GLM-4 implementada como `Glm4ForCausalLM` en transformers. Esta build no introduce cambios arquitectonicos: es una cuantizacion post-entrenamiento (PTQ) sin reentrenamiento y sin datos de calibracion. Las escalas de pesos se calculan a partir de los propios pesos (por canal de salida) y las escalas de activacion se calculan dinamicamente en tiempo de ejecucion, token a token.

Los detalles de entrenamiento del modelo original (numero de tokens, composicion del dataset, uso de RLHF o DPO) no estan disponibles en la informacion proporcionada. La unica innovacion tecnica documentada de esta build es la propia cuantizacion FP8 dinamica: al mantener en BF16 las capas sensibles (embeddings, LM head, RMSNorm) y cuantizar solo las proyecciones lineales de atencion y MLP, se preserva la calidad con una perdida media inferior al 0,1% en los benchmarks medidos. El tokenizer y el `chat_template` son identicos a los del original.

## Capacidades

- Generacion de texto conversacional en formato chat, con `chat_template` identico al del modelo base.
- Razonamiento y conocimiento general, evaluado en MMLU (5-shot).
- Razonamiento matematico y aritmetico, evaluado en GSM8K (5-shot, strict).
- Razonamiento logico y sentido comun, evaluado en ARC-Challenge y Winogrande.
- Capacidades multilingues, con benchmarks especificos en coreano (KMMLU, HAE-RAE) que sugieren competencia en ese idioma; el resto de idiomas no esta documentado.
- Servicio como API compatible con OpenAI mediante vLLM (`/v1/chat/completions`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no, el modelo es solo texto.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Servicio de chat en produccion con vLLM: el modelo se despliega como servidor compatible con OpenAI y atiende conversaciones multi-turno; la cuantizacion FP8 reduce el peso de los pesos a 10,6 GB, lo que permite una sola GPU para el modelo y deja espacio para cache KV.
- Atencion al cliente automatizada: con `--max-model-len 32768` se pueden mantener historiales de conversacion largos; el autor documenta la opcion `--kv-cache-dtype fp8` para aproximadamente duplicar la capacidad de cache KV en contextos largos o lotes grandes.
- Asistente interno de documentacion y resumen: un modelo de 9,4B con MMLU de 74,01 es adecuado para tareas de comprension lectora y sintesis donde no se requiere un modelo frontera pero si baja latencia y coste contenido.
- Razonamiento matematico asistido: con GSM8K de 80,89 en modo strict, es utilizable para resolver problemas aritmeticos de varios pasos en herramientas educativas o de validacion de calculos.
- Procesamiento de texto en coreano: los resultados en KMMLU (48,26) y HAE-RAE (55,18) lo hacen apto para clasificacion, respuesta a preguntas y generacion en ese idioma dentro de productos localizados.
- Inferencia por lotes offline: mediante la API de Python de vLLM (`LLM` + `SamplingParams`) se puede ejecutar generacion masiva sobre grandes volumenes de texto con throughput alto en GPUs Ada o Hopper.
- Despliegue en hardware de gama media-alta: en GPUs Turing o Ampere, vLLM cambia automaticamente a FP8 solo de pesos, lo que permite ejecutar el modelo en tarjetas sin unidades FP8 nativas, a costa de no aprovechar la aceleracion completa.

## Benchmarks y rendimiento

Medidos por el autor con lm-evaluation-harness sobre vLLM, decodificacion greedy, few-shot completion sin chat template. Los porcentajes entre parentesis indican la recuperacion respecto al BF16 original.

| Benchmark | BF16 (original) | FP8-dynamic (esta build) | NVFP4A16 |
|---|---|---|---|
| MMLU (5-shot) | 73,99 | 74,01 (100,0%) | 73,23 (99,0%) |
| GSM8K (5-shot, strict) | 80,21 | 80,89 (100,9%) | 78,17 (97,4%) |
| ARC-Challenge (0-shot) | 60,15 | 59,64 (99,1%) | 58,36 (97,0%) |
| Winogrande (5-shot) | 78,85 | 79,24 (100,5%) | 77,82 (98,7%) |
| KMMLU (5-shot, direct) | 48,34 | 48,26 (99,8%) | 48,05 (99,4%) |
| HAE-RAE (0-shot) | 55,36 | 55,18 (99,7%) | 56,10 (101,3%) |
| Media | 66,15 | 66,21 (100,1%) | 65,29 (98,7%) |

## Requisitos de hardware

- VRAM para pesos: 10,6 GB. Hay que anadir cache KV (crece con la longitud de contexto y el numero de peticiones concurrentes) y varios GB para activaciones y CUDA graphs.
- GPUs recomendadas: NVIDIA Turing (sm75, p. ej. T4) o superior. La aritmetica FP8 nativa requiere Ada, Hopper o Blackwell (sm89+); en Turing y Ampere, vLLM cambia automaticamente a FP8 solo de pesos.
- El modelo base GLM-4-0414 solo funciona en bf16 (float16 esta deshabilitado para esta arquitectura), por lo que en la practica se necesita Ampere (sm80) o superior. V100 (sm70) no esta soportado.
- Cabe en GPU de consumo: una RTX 4090 (24 GB) o similar permite cargar los 10,6 GB de pesos y dejar margen para cache KV y activaciones en contextos moderados.
- Multi-GPU: usar `--tensor-parallel-size N` cuando los pesos no quepan en una sola GPU.
- Despliegue: vLLM (probado con vLLM 0.32.0; la arquitectura existe desde vLLM 0.8.4). Tambien es cargable con transformers >= 4.56.0 y compressed-tensors >= 0.15.0, sin `trust_remote_code`.
- Entorno de vLLM 0.32: Python 3.11-3.14, torch 2.13 (build CUDA 13.0), transformers >= 5.16.1 y < 5.20, compressed-tensors 0.17.0 (no actualizar por separado; el checkpoint se guardo con 0.19.0 pero carga con 0.17.0).
- Optimizacion opcional: `--kv-cache-dtype fp8` reduce aproximadamente a la mitad la memoria de cache KV en contextos largos o lotes grandes.
- Latencia y throughput concretos: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad medida (media de 6 benchmarks) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-4-9B-0414-FP8-dynamic (esta build) | 9,4B denso | no disponible | 66,21 | MIT | HuggingFace, vLLM |
| GLM-4-9B-0414 (BF16 original) | 9,4B denso | no disponible | 66,15 | MIT | HuggingFace |
| GLM-4-9B-0414 NVFP4A16 | 9,4B denso | no disponible | 65,29 | no disponible en la informacion | no disponible en la informacion |

No se dispone en la informacion proporcionada de datos de otros modelos comparables de la misma categoria (por ejemplo, Llama 3.1 8B o Qwen2.5 7B) medidos con el mismo harness, por lo que no se incluyen cifras que no puedan contrastarse.

## Limitaciones y advertencias

- Es un modelo solo de texto; no admite vision ni audio.
- La cuantizacion FP8 puede introducir degradaciones en tareas no cubiertas por los seis benchmarks medidos; la recuperacion del 100,1% es una media y no garantiza paridad en todos los dominios.
- En Turing y Ampere no se ejecuta la aritmetica FP8 completa: vLLM cae a FP8 solo de pesos, con menor aceleracion y posible diferencia de comportamiento numerico.
- V100 (sm70) no esta soportado; el modelo base solo funciona en bf16, lo que excluye GPUs sin soporte bf16.
- El autor declara no haber ejecutado la build en todas las arquitecturas de GPU listadas: solo se probo en B200, por lo que el comportamiento en otras tarjetas no esta verificado empiricamente.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de 9,4B; no se documentan mitigaciones especificas.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Idiomas: la cobertura multilingue no esta detallada; solo hay evidencia de evaluacion en ingles y coreano.
- Restricciones de licencia: MIT, permite uso comercial, pero conviene conservar el aviso de copyright del modelo base zai-org/GLM-4-9B-0414.
- Dependencias muy especificas: la version de compressed-tensors debe ser la fijada por vLLM (0.17.0); actualizarla por separado puede romper la carga del checkpoint.
- El repositorio tiene muy poca traccion (18 descargas, 0 likes) y fue creado en octubre de 2026; no hay validacion independiente de los benchmarks publicados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/axteam/GLM-4-9B-0414-FP8-dynamic
- Modelo base: https://huggingface.co/zai-org/GLM-4-9B-0414
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
