# axteam/Qwen3.5-2B-NVFP4

## Resumen

Qwen3.5-2B-NVFP4 es una cuantizacion de 4 bits del modelo multimodal Qwen/Qwen3.5-2B, publicada por el usuario axteam. El modelo base, desarrollado por el equipo Qwen (Alibaba), es un transformer denso de aproximadamente 2.213 millones de parametros con una arquitectura hibrida que combina atencion lineal (tipo GatedDeltaNet/SSM) con atencion completa, e incluye una torre de vision y una cabeza de prediccion multi-token (MTP). Esta version cuantizada emplea el esquema NVFP4 (W4A4, FP4 E2M1) en formato `compressed-tensors`, pensado especificamente para servir el modelo con vLLM en GPUs Blackwell.

El objetivo de esta publicacion es reducir el peso en disco y la huella de memoria del modelo hasta unos 3,1 GB, manteniendo la mayor parte de la calidad del original. Para ello se cuantizan pesos y activaciones a FP4, mientras que la torre de vision, la cabeza MTP, las RMSNorms, los embeddings, la LM head y toda la ruta de atencion lineal se conservan en BF16 (aproximadamente el 56% de los parametros). La cuantizacion es post-entrenamiento (PTQ) con calibracion AWQ sobre 256 muestras de un corpus mixto con predominio de coreano.

Es relevante ahora porque permite desplegar un modelo multimodal de 2B en hardware Blackwell con aceleracion FP4 nativa, a costa de una degradacion medible de calidad (94,8% de recuperacion media en benchmarks y +10,2% de perplejidad frente al BF16). El propio autor recomienda las variantes de 8 bits para produccion cuando la calidad sea prioritaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido (atencion lineal + atencion completa), denso, multimodal (vision), con cabeza MTP |
| Parametros totales | 2.213.241.664 (dato de safetensors) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4 (W4A4, FP4 E2M1) con grupo 16, escala FP8 E4M3 + escala global FP32 por tensor; resto en BF16 |
| Idiomas soportados | No disponibles (la calibracion uso un corpus mixto ingles/coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors con `compressed-tensors` (`nvfp4-pack-quantized`) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-2B es un transformer denso de aproximadamente 2.213 millones de parametros con arquitectura hibrida: intercala capas de atencion lineal (ruta GatedDeltaNet/SSM) con capas de atencion completa, e incorpora una torre de vision con proyector para entrada de imagenes y texto, ademas de una cabeza de prediccion multi-token (MTP). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original.

Esta version concreta no reentrena el modelo: aplica cuantizacion post-entrenamiento (PTQ). El esquema NVFP4 cuantiza pesos y activaciones a FP4 (E2M1) con grupos de 16 elementos, usando una escala FP8 E4M3 por grupo y una escala global FP32 por tensor. La calibracion AWQ, sin gradientes, emplea 256 muestras de un corpus mixto con predominio de coreano para proteger canales de pesos relevantes antes del redondeo. Se mantienen en BF16 la torre de vision y el proyector (`model.visual.*`), la cabeza MTP (`mtp.*`), todas las RMSNorms, los embeddings de tokens, la LM head y toda la ruta de atencion lineal (`linear_attn.*`), ya que FP4 resulta demasiado grueso para los pesos del SSM. La revision del 1 de noviembre de 2026 restauro de forma bit-exacta los pesos de RMSNorm no suavizados que la herramienta llm-compressor habia dejado con ruido de redondeo BF16 (hasta un 0,4% en la ganancia efectiva). El tokenizador, la `chat_template` y las configuraciones de preprocesado son identicos a los del original; el `config.json` es el original mas un bloque `quantization_config`.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Entrada multimodal imagen-texto (`image-text-to-text`): procesamiento de imagenes mediante torre de vision y proyector en BF16.
- Razonamiento y respuesta a preguntas en formato generativo.
- Razonamiento matematico basico (evaluado con GSM8K).
- Capacidades multilingues: el modelo base es de la familia Qwen, aunque los idiomas soportados no estan documentados en esta ficha; la calibracion de la cuantizacion uso un corpus mixto ingles/coreano.
- Cabeza de prediccion multi-token (MTP), util para decodificacion especulativa en el runtime.
- Compatibilidad con tool calling y agentes: no documentada en la informacion disponible.

## Casos de uso

- Asistente conversacional multimodal de bajo coste: el modelo acepta imagenes y texto, por lo que puede emplearse en interfaces de chat que reciban capturas o fotos y respondan en lenguaje natural, con una huella de pesos de solo 3,1 GB.
- Despliegue en GPUs Blackwell con aceleracion FP4: en B200/GB200, B300 o RTX 50xx se obtiene la ruta W4A4 completa, lo que permite servir el modelo con alta concurrencia en vLLM aprovechando los kernels FP4 nativos.
- Prototipado rapido y entornos de desarrollo: al ocupar poco espacio en disco y memoria, cabe en estaciones de trabajo con una sola GPU consumer de la generacion RTX 50xx para pruebas de pipelines multimodales.
- Clasificacion y extraccion de informacion a partir de imagenes: la torre de vision se mantiene en BF16, lo que preserva la calidad de la representacion visual para tareas de descripcion o lectura de documentos.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio incluye mediciones frente a BF16, FP8-dynamic, AWQ-8bit, NVFP4A16 y AWQ-4bit con el mismo harness, lo que lo hace util como referencia para estudiar el impacto de FP4 en modelos pequenos.
- Servicio de generacion de texto en ingles y coreano: dado que la calibracion se hizo sobre un corpus mixto ingles/coreano, es el escenario donde la fidelidad medida resulta mas representativa.
- Backend de decodificacion especulativa: la cabeza MTP conservada en BF16 puede aprovecharse en el runtime para acelerar la generacion, aunque no se documentan cifras de throughput.

## Benchmarks y rendimiento

Mediciones con lm-evaluation-harness sobre vLLM, greedy, prompts estilo completion sin chat template (0 o 5 disparos segun la fila). MMLU corresponde a la variante generativa (`mmlu_generative`), no comparable con puntuaciones por log-verosimilitud. Los porcentajes entre parentesis indican recuperacion respecto al BF16 original.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit | NVFP4A16 | NVFP4 (este repo) | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot, generativo) | 53,33 | 48,18 (90,3%) | 53,54 (100,4%) | 54,27 (101,8%) | 55,22 (103,5%) | 60,38 (113,2%) |
| GSM8K (5-shot, estricto) | 58,23 | 56,63 (97,3%) | 56,56 (97,1%) | 54,51 (93,6%) | 51,71 (88,8%) | 54,06 (92,8%) |
| ARC-Challenge (0-shot) | 41,47 | 41,98 (101,2%) | 41,30 (99,6%) | 41,04 (99,0%) | 39,51 (95,3%) | 39,59 (95,5%) |
| Winogrande (5-shot) | 64,56 | 63,22 (97,9%) | 64,48 (99,9%) | 64,48 (99,9%) | 61,09 (94,6%) | 62,51 (96,8%) |
| KMMLU (5-shot, directo) | 43,29 | 42,58 (98,4%) | 43,20 (99,8%) | 42,01 (97,1%) | 41,14 (95,0%) | 42,10 (97,3%) |
| HAE-RAE (0-shot) | 45,65 | 45,00 (98,6%) | 45,10 (98,8%) | 44,91 (98,4%) | 42,07 (92,2%) | 41,06 (90,0%) |
| Media | 51,09 | 49,60 (97,1%) | 50,70 (99,2%) | 50,21 (98,3%) | 48,46 (94,8%) | 49,95 (97,8%) |

Fidelidad frente al original BF16 en un conjunto interno mixto ingles/coreano de 100 prompts, con respuestas greedy del BF16 puntuadas bajo cada variante:

| Metrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor es mejor) | 2,0399 | 1,8515 (+10,2%) |
| Acuerdo top-1 del siguiente token | 85,8% | 98,9% |

## Requisitos de hardware

- VRAM estimada para inferencia: pesos de 3,1 GB; hay que sumar la cache KV (crece con la longitud de contexto y el numero de peticiones concurrentes) y varios GB para activaciones y CUDA graphs.
- GPUs recomendadas: B200/GB200 (sm100), B300 (sm103) y RTX 50xx / RTX PRO 6000 (sm120) para velocidad FP4 completa (W4A4). Turing-Hopper (sm75-sm90) caen a FP4 solo de pesos, mas lento y con aviso de vLLM. V100 (sm70) no esta soportado. Solo se probo en B200.
- Cabe en GPU consumer: si, en tarjetas RTX 50xx (sm120) con aceleracion FP4 nativa; en otras consumer el rendimiento sera menor por la ruta de solo pesos.
- Opciones de despliegue: vLLM (la arquitectura esta en vLLM >= 0.17.0; probado con vLLM 0.32.0). Requiere Python 3.11-3.14, torch 2.13 (build CUDA 13.0, con driver NVIDIA compatible con CUDA 13), transformers >= 5.16.1,< 5.20 y compressed-tensors 0.17.0 (fijado por vLLM; lee este checkpoint guardado con 0.19.0, no actualizar por separado). Para pesos que no caben en una GPU, usar `--tensor-parallel-size N`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

Comparativa entre las distintas variantes de cuantizacion del mismo modelo base, segun los datos medidos por el autor:

| Variante | Precision | Peso en disco | Media de benchmarks (recuperacion) | Perplejidad | Recomendacion |
|---|---|---|---|---|---|
| BF16 (original) | BF16 | No disponible | 51,09 (100%) | 1,8515 | Referencia de calidad |
| FP8-dynamic | FP8 | No disponible | 49,60 (97,1%) | No disponible | Buena relacion calidad/tamano |
| AWQ-8bit | INT8 | No disponible | 50,70 (99,2%) | No disponible | Recomendada para produccion |
| NVFP4A16 | FP4 pesos, BF16 activaciones | No disponible | 50,21 (98,3%) | No disponible | Intermedia |
| NVFP4 (este repo) | W4A4 FP4 | ~3,1 GB | 48,46 (94,8%) | 2,0399 | Maxima eficiencia en Blackwell |
| AWQ-4bit | INT4 | No disponible | 49,95 (97,8%) | No disponible | Alternativa de 4 bits |

No se dispone de datos de modelos comparables de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- Degradacion de calidad medible: recuperacion media del 94,8% frente al BF16, con caidas notables en GSM8K (88,8%) y HAE-RAE (92,2%). El autor recomienda builds de 8 bits (FP8 o AWQ INT8) si la calidad es prioritaria.
- Sensibilidad a la cuantizacion de 4 bits: +10,2% de perplejidad y solo 85,8% de acuerdo top-1 con el original; este modelo denso pequeno es especialmente sensible a FP4.
- Riesgo de alucinacion: inherente a los modelos generativos; no se documentan evaluaciones especificas de veracidad.
- Sesgos conocidos: no documentados; la calibracion con un corpus con predominio de coreano puede sesgar el comportamiento hacia ese idioma y el ingles.
- Idiomas soportados no documentados oficialmente en esta ficha; el rendimiento en castellano no esta evaluado.
- Restricciones de licencia: Apache-2.0, permite uso comercial con las obligaciones habituales de atribucion y aviso de licencia.
- Dependencia estricta del runtime: requiere vLLM >= 0.17.0 (probado con 0.32.0) y versiones fijadas de torch, transformers y compressed-tensors; no se garantiza funcionamiento en otros motores (llama.cpp, Ollama, TGI no estan soportados por el formato `nvfp4-pack-quantized`).
- Compatibilidad de hardware limitada: la ruta W4A4 completa solo esta en Blackwell; en generaciones anteriores el rendimiento cae a FP4 solo de pesos y V100 no esta soportado.
- Longitud de contexto no disponible: no se puede planificar el uso de ventanas largas sin consultar el modelo base.
- Solo se probo en B200; el resto de GPUs Blackwell se infiere del codigo de seleccion de kernels de vLLM 0.32, no de mediciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/axteam/Qwen3.5-2B-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-2B/blob/main/LICENSE
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
