# axteam/Qwen3.5-2B-FP8-dynamic

## Resumen

Qwen3.5-2B-FP8-dynamic es una cuantizacion de 8 bits del modelo multimodal Qwen/Qwen3.5-2B, publicada por el usuario axteam. Se trata de un checkpoint en formato compressed-tensors con esquema FP8_DYNAMIC (W8A8), pensado especificamente para servir el modelo con vLLM de forma eficiente en memoria. El modelo base es un transformer hibrido (atencion lineal combinada con atencion completa), denso, de 2.274 millones de parametros, con torre de vision y una cabeza de prediccion multi-token (MTP).

El problema que resuelve es el coste de memoria del modelo original en BF16: al pasar pesos y activaciones a FP8, el checkpoint ocupa aproximadamente 3,2 GB en disco y permite desplegar el modelo en GPUs con menos VRAM, manteniendo una fidelidad alta respecto al original (97,1 % de recuperacion media en los benchmarks medidos por el autor). Es relevante para quienes necesitan inferencia multimodal (texto e imagen) en hardware modesto o con alta concurrencia.

La cuantizacion es post-entrenamiento (PTQ) y sin calibracion (data-free), lo que simplifica la reproducibilidad. La licencia es Apache-2.0, heredada del modelo base. La revision del 2 de noviembre de 2026 corrige un fallo de configuracion que afectaba a la torre de vision en vLLM 0.32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido (atencion lineal + atencion completa), denso, multimodal (vision), con cabeza MTP |
| Parametros totales | 2.274.069.824 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 dinamico W8A8 (E4M3, escala por canal de salida en pesos, activaciones FP8 por token dinamicas); partes en BF16 y FP32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (`float-quantized`, esquema `FP8_DYNAMIC`) |

## Arquitectura y entrenamiento

El modelo base combina capas de atencion lineal con capas de atencion completa en una arquitectura hibrida densa, e incorpora una torre de vision con proyector para entrada image-text-to-text, ademas de una cabeza de prediccion multi-token (MTP). Esta version no reentrena nada: aplica cuantizacion post-entrenamiento FP8 dinamica sin calibracion sobre los pesos del original. Los pesos se guardan como FP8 E4M3 con escala por canal de salida, mientras que las activaciones se cuantizan dinamicamente por token.

El autor mantiene en BF16 la torre de vision y el proyector (`model.visual.*`), la cabeza MTP, todas las RMSNorm salvo la norm con compuerta de `linear_attn`, los embeddings de tokens, la LM head y las partes no lineales del SSM (`linear_attn.conv1d/dt_bias`). En FP32 conserva `linear_attn.A_log` y la norm con compuerta, igual que el original. En conjunto, cerca del 40 % de los parametros de este build quedan sin cuantizar para preservar calidad. El tokenizador, la plantilla de chat y las configuraciones de preprocesado son identicos al original; el `config.json` es el original mas un bloque `quantization_config`. No se dispone de informacion sobre el volumen de tokens de entrenamiento ni sobre el proceso de alineacion (RLHF/DPO) del modelo base.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento y respuesta a preguntas de conocimiento general.
- Razonamiento matematico basico (evaluado en GSM8K).
- Comprension de imagenes combinada con texto (image-text-to-text), incluida descripcion de formas y colores.
- Capacidades multilingues parciales: el autor evalua en ingles y coreano (KMMLU, HAE-RAE), pero no publica la lista de idiomas soportados.
- Cabeza de prediccion multi-token (MTP), util para decodificacion especulativa en el runtime.
- Soporte de tool calling y de agentes: no disponible en la informacion proporcionada.

## Casos de uso

- Servicio de chat multimodal en produccion: con 3,2 GB de pesos, el modelo puede desplegarse en vLLM con varias peticiones concurrentes en una sola GPU, gestionando conversaciones que combinan texto e imagenes.
- Descripcion y etiquetado de imagenes a escala: la torre de vision en BF16 permite clasificar formas, colores y contenido visual en pipelines de moderacion o catalogacion, con menor coste de memoria que el original.
- Asistente de atencion al cliente con soporte de imagenes: el cliente puede enviar capturas o fotos y el modelo responde en el mismo hilo conversacional; el contexto disponible depende de la ventana del modelo base (no publicada).
- Prototipado e investigacion en entornos con VRAM limitada: al caber en GPUs de gama media, sirve para experimentar con arquitecturas hibridas y cuantizacion FP8 sin acceso a clusters grandes.
- Evaluacion comparativa de tecnicas de cuantizacion: el autor publica resultados frente a AWQ-8bit, NVFP4A16, NVFP4 y AWQ-4bit con el mismo harness, lo que lo convierte en una referencia util para estudiar el compromiso precision/memoria.
- Razonamiento y matematicas de nivel basico en aplicaciones educativas: con un 97,3 % de recuperacion en GSM8K respecto al BF16, es adecuado para tutoria automatizada de problemas aritmeticos.
- Base para despliegues en GPUs Turing o Ampere: vLLM cambia automaticamente a FP8 solo de pesos en esas arquitecturas, lo que permite reutilizar hardware antiguo sin perder el formato del checkpoint.

## Benchmarks y rendimiento

Resultados medidos por el autor con lm-evaluation-harness sobre vLLM, greedy y prompts de estilo completion sin plantilla de chat. MMLU corresponde a la variante generativa, no directamente comparable con puntuaciones por log-verosimilitud.

| Benchmark | BF16 (original) | FP8-dynamic (este repo) | AWQ-8bit | NVFP4A16 | NVFP4 | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot, generativa) | 53,33 | 48,18 (90,3 %) | 53,54 (100,4 %) | 54,27 (101,8 %) | 55,22 (103,5 %) | 60,38 (113,2 %) |
| GSM8K (5-shot, estricto) | 58,23 | 56,63 (97,3 %) | 56,56 (97,1 %) | 54,51 (93,6 %) | 51,71 (88,8 %) | 54,06 (92,8 %) |
| ARC-Challenge (0-shot) | 41,47 | 41,98 (101,2 %) | 41,30 (99,6 %) | 41,04 (99,0 %) | 39,51 (95,3 %) | 39,59 (95,5 %) |
| Winogrande (5-shot) | 64,56 | 63,22 (97,9 %) | 64,48 (99,9 %) | 64,48 (99,9 %) | 61,09 (94,6 %) | 62,51 (96,8 %) |
| KMMLU (5-shot, directo) | 43,29 | 42,58 (98,4 %) | 43,20 (99,8 %) | 42,01 (97,1 %) | 41,14 (95,0 %) | 42,10 (97,3 %) |
| HAE-RAE (0-shot) | 45,65 | 45,00 (98,6 %) | 45,10 (98,8 %) | 44,91 (98,4 %) | 42,07 (92,2 %) | 41,06 (90,0 %) |
| Media | 51,09 | 49,60 (97,1 %) | 50,70 (99,2 %) | 50,21 (98,3 %) | 48,46 (94,8 %) | 49,95 (97,8 %) |

Evaluacion de fidelidad frente al original BF16 sobre un conjunto interno mixto ingles/coreano de 100 prompts:

| Metrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor es mejor) | 1,8710 | 1,8515 (+1,1 %) |
| Acuerdo top-1 en el siguiente token | 94,4 % | 98,9 % |

## Requisitos de hardware

- VRAM estimada para inferencia: 3,2 GB solo de pesos; hay que sumar la cache KV (crece con la longitud de contexto y el numero de peticiones concurrentes) y varios GB para activaciones y grafos CUDA.
- GPU recomendadas: NVIDIA Turing (sm75, por ejemplo T4) o superior. El calculo FP8 real requiere Ada, Hopper o Blackwell (sm89+); en Turing y Ampere vLLM pasa automaticamente a FP8 solo de pesos. V100 (sm70) no esta soportado. El autor solo verifico en B200.
- Cabe en GPU de consumo: si, en tarjetas con al menos 8-12 GB de VRAM para contexto corto y poca concurrencia; el margen aumenta en RTX 4090 (24 GB).
- Opciones de despliegue: vLLM (probado con 0.32.0; la arquitectura esta en vLLM >= 0.17.0) y transformers >= 5.2.0 con compressed-tensors >= 0.15.0. Para vLLM 0.32 se requiere Python 3.11-3.14, torch 2.13 (build CUDA 13.0), transformers >= 5.16.1,<5.20 y compressed-tensors 0.17.0 (no actualizar por separado). Uso de `--tensor-parallel-size N` cuando los pesos no caben en una GPU.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (media de benchmarks del autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-2B (BF16) | 2,27 B | no disponible | 51,09 | Apache-2.0 | Hugging Face |
| Qwen3.5-2B-FP8-dynamic (este) | 2,27 B | no disponible | 49,60 (97,1 %) | Apache-2.0 | Hugging Face |
| Qwen3.5-2B AWQ-8bit | 2,27 B | no disponible | 50,70 (99,2 %) | Apache-2.0 | no disponible (referencia en la model card) |
| Qwen3.5-2B AWQ-4bit | 2,27 B | no disponible | 49,95 (97,8 %) | Apache-2.0 | no disponible (referencia en la model card) |

Las variantes AWQ y NVFP4 se citan como comparativas dentro de la propia model card; no se dispone de enlaces a sus repositorios.

## Limitaciones y advertencias

- Perdida de calidad respecto al BF16: 97,1 % de recuperacion media y una caida notable en MMLU generativa (48,18 frente a 53,33), la mas acusada de todas las variantes comparadas.
- El autor documenta un fallo previo de configuracion en la torre de vision que provocaba respuestas incorrectas con imagenes en vLLM 0.32; si se descargo el repo antes del 1 de noviembre de 2026 (revision `6840dda`), hay que volver a bajar `config.json`.
- La lectura OCR de imagenes es imperfecta: en la prueba sintetica del autor, el texto "QWEN TEST 2026" se lee como "OWEN 2026", mientras que el BF16 original lee "OWEN TEST 2026".
- No se publica la longitud de contexto ni la lista de idiomas soportados; las capacidades multilingues solo estan evidenciadas en ingles y coreano.
- No hay informacion sobre tool calling, uso agentico ni procesos de alineacion del modelo base.
- Riesgo de alucinacion inherente a un modelo de 2,27 B; no se han publicado evaluaciones de sesgo.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar los terminos del modelo base enlazados en la model card.
- Dependencia estricta de versiones: compressed-tensors 0.17.0 (fijada por vLLM) lee el checkpoint guardado con 0.19.0; actualizarla por separado puede romper la carga.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/axteam/Qwen3.5-2B-FP8-dynamic
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-2B/blob/main/LICENSE
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
