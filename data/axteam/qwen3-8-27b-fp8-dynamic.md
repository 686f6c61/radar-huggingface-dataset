# axteam/Qwen3.8-27B-FP8-dynamic

## Resumen

Qwen3.8-27B-FP8-dynamic es una cuantizacion en FP8 de 8 bits del modelo multimodal Qwen/Qwen3.8-27B, publicada por el usuario axteam. No se trata de un modelo nuevo entrenado desde cero, sino de una version post-entrenamiento (PTQ, sin reentrenamiento) pensada para servir el modelo original de forma eficiente con vLLM. El resultado conserva la arquitectura hibrida del original (atencion lineal mas atencion completa), su caracter denso, su torre de vision y su cabeza de prediccion multi-token (MTP), con 27.781.427.952 parametros totales y un peso en disco de aproximadamente 31,2 GB.

La relevancia de esta ficha radica en que demuestra que la cuantizacion dinamica en FP8 puede mantener la fidelidad respecto al modelo BF16 original con una perdida minima: en la evaluacion interna del autor la perplejidad sube solo un 0,5% y la concordancia top-1 de siguiente token alcanza el 97,3%. Ademas, la model card documenta una correccion de configuracion relevante (revision del 2026-11-02) que afectaba a la carga de los pesos de vision en vLLM, un detalle critico para cualquiera que despliegue el modelo en produccion.

El modelo esta bajo licencia Apache-2.0, lo que facilita su uso comercial, y esta etiquetado como image-text-to-text, es decir, acepta entradas de imagen y texto. Su publicacion es reciente (creado el 2026-10-27 y actualizado el 2026-11-02) y acumula 413 descargas y 3 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida (atencion lineal + atencion completa), densa, multimodal con vision y cabeza MTP |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de uso sugiere `--max-model-len 32768`) |
| Tipos de cuantizacion | FP8 dinamico (W8A8, esquema `FP8_DYNAMIC` de compressed-tensors) |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (`float-quantized`) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura hibrida que combina capas de atencion lineal con capas de atencion completa, lo que reduce el coste computacional del contexto largo frente a un transformer puramente de atencion cuadratica. Es un modelo denso (no mezcla de expertos) de aproximadamente 27,8 mil millones de parametros, multimodal (incluye torre de vision y proyector) y con una cabeza de prediccion multi-token (MTP), habitualmente utilizada para decodificacion especulativa. Esta version concreta no introduce cambios arquitectonicos: es una cuantizacion post-entrenamiento sin reentrenamiento ni calibracion (escalas de pesos estaticas sin datos, "data-free").

La cuantizacion aplica W8A8: pesos en FP8 E4M3 con escala por canal de salida y activaciones FP8 dinamicas por token. Se mantienen en BF16 la torre de vision y el proyector (`model.visual.*`), la cabeza MTP (`mtp.*`), todas las RMSNorm, los embeddings de tokens, la LM head y las partes no lineales del modulo SSM (`linear_attn.conv1d/A_log/dt_bias`); en total, cerca del 12% de los parametros de esta build quedan sin cuantizar para preservar la calidad. El tokenizador, la `chat_template` y la `generation_config` son identicos a los del original, y el `config.json` es el original mas un bloque `quantization_config`. No se dispone de informacion sobre el numero de tokens de entrenamiento ni sobre la composicion del dataset del modelo base en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno.
- Procesamiento multimodal image-text-to-text: acepta imagenes junto con texto (torre de vision en BF16).
- Razonamiento y resolucion de problemas matematicos (evaluado en GSM8K).
- Conocimiento general y academico (evaluado en MMLU, ARC-Challenge, Winogrande).
- Capacidades multilingues parcialmente evidenciadas por las evaluaciones en coreano (KMMLU, HAE-RAE); el conjunto completo de idiomas no esta disponible.
- Cabeza de prediccion multi-token (MTP), util para decodificacion especulativa y aceleracion de inferencia.
- Servido como API compatible con OpenAI mediante vLLM.
- Soporte de tool calling / function calling y de agentes: no confirmado explicitamente en la informacion proporcionada.

## Casos de uso

- Servicio de inferencia multimodal en produccion: desplegar el modelo con `vllm serve` para atender peticiones de imagen y texto a traves de una API compatible con OpenAI, aprovechando el formato FP8 para reducir el peso en memoria (31,2 GB) frente al BF16 original.
- Asistente conversacional multi-turno: usar la `chat_template` original para construir dialogos con historial; el contexto de hasta 32.768 tokens sugerido en el ejemplo permite mantener conversaciones largas con documentos adjuntos.
- Analisis de imagenes con descripcion y respuesta: el modelo puede describir imagenes sinteticas (el autor verifico con una imagen de prueba con un circulo rojo, un cuadrado azul y el texto "QWEN TEST 2026") y responder preguntas sobre ellas, adecuado para tareas de accesibilidad o catalogacion.
- Razonamiento matematico asistido: los resultados en GSM8K (76,88 en la variante FP8) lo hacen util para tutoria o resolucion de problemas paso a paso en entornos educativos.
- Evaluacion comparativa de tecnicas de cuantizacion: al publicar resultados medidos frente a AWQ-8bit, NVFP4A16, NVFP4 y AWQ-4bit con el mismo harness, sirve como referencia para equipos que deciden que esquema de cuantizacion adoptar.
- Despliegue en infraestructura con GPUs Ada, Hopper o Blackwell: al ejecutar matematicas FP8 de forma nativa en sm89 o superior, es adecuado para clusters con L40S, H100 o B200, con particionado por tensor (`--tensor-parallel-size`) cuando los pesos no caben en una sola GPU.
- Prototipado rapido con transformers: para entornos sin vLLM, se puede cargar con `transformers>=5.2.0` y `compressed-tensors>=0.15.0` (verificado en CPU con otros modelos de la familia).

## Benchmarks y rendimiento

Resultados medidos por el autor con lm-evaluation-harness sobre vLLM, greedy, prompts de estilo completion sin chat template. MMLU es la variante generativa, no directamente comparable con puntuaciones obtenidas por log-likelihood.

| Benchmark | BF16 (original) | FP8-dynamic (este repo) | AWQ-8bit | NVFP4A16 | NVFP4 | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot, generativo) | 62,42 | 62,15 (99,6%) | 62,48 (100,1%) | 62,55 (100,2%) | 63,47 (101,7%) | 63,40 (101,6%) |
| GSM8K (5-shot, estricto) | 70,43 | 76,88 (109,1%) | 70,81 (100,5%) | 49,81 (70,7%) | 47,54 (67,5%) | 76,42 (108,5%) |
| ARC-Challenge (0-shot) | 58,62 | 58,36 (99,6%) | 58,79 (100,3%) | 58,70 (100,1%) | 57,76 (98,5%) | 59,56 (101,6%) |
| Winogrande (5-shot) | 79,08 | 79,56 (100,6%) | 79,32 (100,3%) | 79,48 (100,5%) | 80,03 (101,2%) | 79,72 (100,8%) |
| KMMLU (5-shot, directo) | 65,72 | 65,71 (100,0%) | 65,77 (100,1%) | 65,37 (99,5%) | 64,82 (98,6%) | 65,19 (99,2%) |
| HAE-RAE (0-shot) | 76,35 | 76,54 (100,2%) | 76,90 (100,7%) | 75,89 (99,4%) | 75,80 (99,3%) | 76,44 (100,1%) |
| **Media** | **68,77** | **69,87 (101,6%)** | **69,01 (100,3%)** | **65,30 (95,0%)** | **64,90 (94,4%)** | **70,12 (102,0%)** |

Evaluacion de fidelidad frente al original BF16 en un conjunto interno mixto ingles/coreano de 100 prompts:

| Metrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor = mas cercano) | 1,3651 | 1,3586 (+0,5%) |
| Concordancia top-1 de siguiente token | 97,3% | 99,4% |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 31,2 GB; hay que sumar la cache KV (crece con la longitud de contexto y las peticiones concurrentes) y unos pocos GB para activaciones y CUDA graphs.
- GPU recomendadas: NVIDIA Turing (sm75, p. ej. T4) o superior. Las matematicas FP8 nativas requieren Ada, Hopper o Blackwell (sm89+), como L40S, H100 o B200. En Turing y Ampere, vLLM cambia automaticamente a FP8 solo de pesos. V100 (sm70) no es compatible.
- Cabe en GPU de consumo: no hay confirmacion en la informacion proporcionada; con 31,2 GB de pesos no cabe en GPUs de consumo de 24 GB sin particionado ni cuantizacion adicional.
- Opciones de despliegue: vLLM (runtime probado, 0.32.0; la arquitectura esta en vLLM >= 0.17.0) y transformers (>=5.2.0 con compressed-tensors >=0.15.0). No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada. Solo se ejecuto en B200 segun el autor.

## Comparativa con modelos similares

Comparacion con las variantes de cuantizacion del mismo modelo base reportadas por el autor:

| Modelo | Parametros | Contexto | Media de benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-FP8-dynamic (este) | 27,8 B | no disponible | 69,87 (101,6%) | Apache-2.0 | Hugging Face |
| Qwen3.8-27B AWQ-8bit | 27,8 B (aprox.) | no disponible | 69,01 (100,3%) | Apache-2.0 | Hugging Face |
| Qwen3.8-27B NVFP4 | 27,8 B (aprox.) | no disponible | 64,90 (94,4%) | Apache-2.0 | Hugging Face |
| Qwen3.8-27B AWQ-4bit | 27,8 B (aprox.) | no disponible | 70,12 (102,0%) | Apache-2.0 | Hugging Face |

No se dispone de datos para comparar con modelos de otros desarrolladores de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La correccion de configuracion del 2026-11-02 es critica: las descargas anteriores a esa fecha (revision `6a6dba4`) cargan mal los pesos de vision en vLLM 0.32 y producen respuestas incorrectas con imagenes. Es necesario descargar de nuevo `config.json`.
- La cuantizacion FP8 puede degradar ligeramente tareas no cubiertas por los benchmarks; la fidelidad medida es del 97,3% en concordancia top-1, no del 100%.
- Los resultados de MMLU usan la variante generativa de lm-eval y no son directamente comparables con puntuaciones obtenidas por log-likelihood.
- Sesgos conocidos del modelo base: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no cuantificado en la informacion disponible.
- Idiomas soportados: no disponibles; solo se evidencia evaluacion en ingles y coreano.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene revisar el fichero LICENSE del modelo base enlazado por el autor.
- Requiere versiones muy concretas de dependencias (vLLM 0.32.0, torch 2.13 con CUDA 13.0, transformers >=5.16.1,<5.20 y compressed-tensors 0.17.0); no se debe actualizar compressed-tensors por separado.
- Solo se ha probado en B200; el comportamiento en otras GPUs no esta verificado experimentalmente por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/axteam/Qwen3.8-27B-FP8-dynamic
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
