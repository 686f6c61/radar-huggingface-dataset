# axteam/Qwen3.5-0.8B-NVFP4A16

## Resumen
Qwen3.5-0.8B-NVFP4A16 es una cuantizacion de 4 bits del modelo Qwen/Qwen3.5-0.8B, publicada por axteam. Se trata de un checkpoint PTQ (post-training quantization) en formato compressed-tensors `nvfp4-pack-quantized`, pensado especificamente para servir el modelo con vLLM de forma eficiente en memoria. El modelo base es un transformer hibrido (atencion lineal GatedDeltaNet/SSM combinada con atencion completa), denso, multimodal con torre de vision y cabeza MTP, de aproximadamente 853 millones de parametros.

La relevancia de esta ficha es doble: por un lado documenta un modelo pequeno y multimodal con licencia Apache-2.0, apto para despliegues con recursos limitados; por otro, expone con detalle el compromiso de calidad que introduce una cuantizacion FP4 W4A16, con una recuperacion media del 95,7 % frente al original BF16 en el conjunto de benchmarks medidos. El autor advierte explicitamente de que, si la calidad es prioritaria, conviene preferir una build de 8 bits.

El checkpoint ocupa aproximadamente 1,3 GB en disco (2,6 GB de repositorio) y mantiene en BF16 cerca del 65 % de los parametros: torre de vision, proyector, cabeza MTP, embeddings, LM head, todas las RMSNorm y toda la ruta de atencion lineal (SSM). Solo se cuantizan a FP4 (E2M1) los pesos de las capas de atencion completa, con grupo de 16, escala FP8 E4M3 y escala global FP32 por tensor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido (atencion lineal GatedDeltaNet/SSM + atencion completa), denso, multimodal (vision), con cabeza MTP |
| Parametros totales | 852.985.920 (~853 M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4A16 (W4A16): pesos FP4 E2M1, grupo 16, escala FP8 E4M3 + escala global FP32 por tensor; activaciones BF16; formato compressed-tensors `nvfp4-pack-quantized` |
| Idiomas soportados | no disponible (la calibracion uso un corpus mixto con fuerte presencia de coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers y vLLM |

## Arquitectura y entrenamiento
El modelo base Qwen3.5-0.8B emplea una arquitectura hibrida que alterna capas de atencion lineal basada en GatedDeltaNet (un mecanismo de espacio de estados) con capas de atencion completa, lo que reduce el coste de contexto largo frente a un transformer puramente atencional. Incluye ademas una torre de vision con proyector para entrada image-text-to-text y una cabeza de prediccion multi-token (MTP), habitualmente asociada a decodificacion especulativa.

Esta publicacion concreta no entrena nada: es cuantizacion post-entrenamiento (PTQ) sin reentrenamiento. El autor aplica AWQ con un conjunto de calibracion de 256 muestras (corpus mixto con predominio de coreano) para proteger los canales de pesos mas relevantes antes del redondeo a FP4. Los pesos de la ruta de atencion lineal (`linear_attn.*`) se mantienen integramente en BF16 porque FP4 resulta demasiado grueso para los pesos del SSM; `linear_attn.A_log` y la norma con compuerta se almacenan en BF16 (sin perdida para `A_log`). La revision del 2026-11-01 restauro de forma bit-exacta los pesos de RMSNorm no suavizados por AWQ, eliminando el ruido de redondeo BF16 (hasta un 0,4 % en la ganancia efectiva) que habia dejado el manejo de offset-norm de llm-compressor.

## Capacidades
- Generacion de texto conversacional multi-turno, con plantilla de chat identica a la del modelo original.
- Entrada multimodal image-text-to-text: procesa imagenes junto con texto mediante la torre de vision y el proyector (ambos en BF16).
- Razonamiento y matematicas basicas, con rendimiento medido en GSM8K (29,49 en 5-shot estricto).
- Conocimiento general y respuesta a preguntas de opcion multiple (MMLU generativo, ARC-Challenge).
- Cobertura multilingue parcial: los benchmarks incluyen KMMLU y HAE-RAE, lo que evidencia capacidades en coreano; el resto de idiomas no esta documentado.
- Cabeza MTP incluida en el checkpoint (en BF16), lo que habilita tecnicas de prediccion multi-token en el runtime.
- Soporte de tool calling y de agentes: no documentado en la informacion disponible.

## Casos de uso
- Servicio de chat multimodal en GPU de gama media: con 1,3 GB de pesos, el modelo cabe holgadamente en una RTX 4090 o incluso en GPUs consumer menores, dejando el resto de VRAM para cache KV y peticiones concurrentes.
- Clasificacion y extraccion de informacion de imagenes de documentos: al aceptar pares imagen-texto, puede describir capturas, tickets o formularios sencillos en un pipeline por lotes con vLLM.
- Prototipado rapido de asistentes conversacionales: la licencia Apache-2.0 y el formato compatible con transformers permiten iterar sin restricciones comerciales.
- Evaluacion comparativa de tecnicas de cuantizacion: el autor publica recuperaciones frente a BF16, FP8-dynamic, AWQ-8bit y AWQ-4bit, lo que lo convierte en una referencia util para estudiar el impacto de FP4 en modelos pequenos.
- Despliegue en entornos con driver CUDA 13 y vLLM 0.32: util para equipos que ya operan esa pila y quieren anadir un modelo pequeno multimodal sin cambiar de infraestructura.
- Tareas de razonamiento y QA de dominio acotado donde el coste por token importa mas que la precision absoluta, asumiendo la degradacion del 4,3 % de media frente a BF16.

## Benchmarks y rendimiento
Medidos por el autor con lm-evaluation-harness sobre vLLM, greedy, prompts de estilo completion sin plantilla de chat. MMLU es la variante generativa (solo cuenta la coincidencia exacta de la letra en la primera linea). Los porcentajes indican recuperacion frente al BF16 original.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit | NVFP4A16 (este repo) | NVFP4 | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot, generativo) | 50,56 | 50,50 (99,9 %) | 50,31 (99,5 %) | 48,39 (95,7 %) | 46,36 (91,7 %) | 48,55 (96,0 %) |
| GSM8K (5-shot, estricto) | 32,68 | 29,80 (91,2 %) | 32,30 (98,8 %) | 29,49 (90,3 %) | 22,82 (69,8 %) | 28,20 (86,3 %) |
| ARC-Challenge (0-shot) | 37,54 | 36,52 (97,3 %) | 37,46 (99,8 %) | 35,07 (93,4 %) | 33,11 (88,2 %) | 35,15 (93,6 %) |
| Winogrande (5-shot) | 56,27 | 55,49 (98,6 %) | 56,67 (100,7 %) | 55,80 (99,2 %) | 55,64 (98,9 %) | 55,88 (99,3 %) |
| KMMLU (5-shot, directo) | 34,54 | 34,22 (99,1 %) | 34,20 (99,0 %) | 35,02 (101,4 %) | 33,51 (97,0 %) | 35,74 (103,5 %) |
| HAE-RAE (0-shot) | 37,03 | 35,29 (95,3 %) | 36,30 (98,0 %) | 34,10 (92,1 %) | 27,31 (73,8 %) | 34,28 (92,6 %) |
| **Media** | **41,44** | **40,30 (97,3 %)** | **41,21 (99,4 %)** | **39,65 (95,7 %)** | **36,46 (88,0 %)** | **39,63 (95,6 %)** |

Fidelidad frente al original BF16 en un conjunto interno mixto ingles/coreano de 100 prompts (respuestas BF16 greedy puntuadas bajo cada build):

| Metrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor = mas cercano) | 2,1669 | 2,0174 (+7,4 %) |
| Coincidencia top-1 del siguiente token | 87,8 % | 98,7 % |

## Requisitos de hardware
- VRAM de pesos: 1,3 GB. Hay que sumar cache KV (crece con longitud de contexto y peticiones concurrentes) y varios GB para activaciones y CUDA graphs.
- GPU soportadas: NVIDIA Turing (sm75) o superior. No requiere tensor cores FP4 porque la cuantizacion es weight-only. V100 (sm70) no esta soportado.
- GPU probada por el autor: solo B200. La seleccion de kernel por GPU la realiza el codigo de vLLM 0.32.
- Cabe en GPU consumer: si, por el tamano de pesos; no se documentan pruebas concretas en RTX 4090 u otras consumer.
- Despliegue recomendado: vLLM (arquitectura disponible desde vLLM 0.17.0; probado con 0.32.0). Requiere Python 3.11-3.14, torch 2.13 (build CUDA 13.0), transformers >=5.16.1,<5.20 y compressed-tensors 0.17.0 (fijado por vLLM; el checkpoint se guardo con 0.19.0 y no conviene actualizarlo por separado).
- Alternativa sin vLLM: transformers >=5.2.0 + compressed-tensors >=0.15.0 (verificado en CPU con las variantes FP8, AWQ-4bit, NVFP4A16 y NVFP4).
- Multi-GPU: usar `--tensor-parallel-size N` cuando los pesos no quepan en una sola GPU.
- Latencia y throughput: no disponibles.
- `trust_remote_code`: no necesario.

## Comparativa con modelos similares
Comparacion dentro de la misma familia de cuantizaciones del mismo modelo base, segun los datos publicados por el autor:

| Build | Precision | Media de benchmarks | Recuperacion vs BF16 | Tamano de pesos |
|---|---|---|---|---|
| BF16 (original) | BF16 | 41,44 | 100 % | no disponible |
| FP8-dynamic | FP8 | 40,30 | 97,3 % | no disponible |
| AWQ-8bit | W8 | 41,21 | 99,4 % | no disponible |
| NVFP4A16 (este repo) | W4A16 FP4 | 39,65 | 95,7 % | ~1,3 GB |
| NVFP4 | W4A4 FP4 | 36,46 | 88,0 % | no disponible |
| AWQ-4bit | W4 | 39,63 | 95,6 % | no disponible |

Frente a modelos de otros autores del mismo rango de tamano: no disponible en la informacion proporcionada.

## Limitaciones y advertencias
- Degradacion de calidad medible: recuperacion media del 95,7 % frente a BF16, con caidas destacadas en GSM8K (90,3 %) y HAE-RAE (92,1 %). El propio autor recomienda una build de 8 bits si la calidad es prioritaria.
- Perplejidad un 7,4 % superior y solo un 87,8 % de coincidencia top-1 con el modelo original, lo que puede afectar a tareas sensibles a la distribucion exacta de probabilidades.
- La cuantizacion FP4 se aplica solo a parte de los pesos; el resto se mantiene en BF16, de modo que el ahorro de memoria es real pero no equivale a un modelo de 4 bits completo.
- La calibracion AWQ uso un corpus con fuerte presencia de coreano; el comportamiento en otros idiomas, incluido el espanol, no esta documentado.
- Longitud de contexto no especificada en la informacion disponible; el consumo de cache KV y el rendimiento en contextos largos no se pueden planificar con los datos publicados.
- Dependencia estricta de versiones: vLLM 0.32.0, torch 2.13 con CUDA 13.0, transformers >=5.16.1,<5.20 y compressed-tensors 0.17.0. Actualizar compressed-tensors por separado puede romper la carga del checkpoint.
- Requiere GPU NVIDIA Turing o superior; no funciona en V100.
- Riesgo de alucinacion y sesgos: no documentado especificamente para esta build; se heredan los del modelo base, no evaluados en la informacion disponible.
- Licencia Apache-2.0: permite uso comercial, pero conviene conservar los avisos de licencia del modelo base y del checkpoint cuantizado.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/axteam/Qwen3.5-0.8B-NVFP4A16
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- vLLM: https://github.com/vllm-project/vllm
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- Papers, blogs o demos adicionales: no disponibles en la informacion proporcionada.
