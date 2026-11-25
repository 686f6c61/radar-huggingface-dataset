# axteam/MiniCPM5-2B-FP8-dynamic

## Resumen

MiniCPM5-2B-FP8-dynamic es una cuantizacion de 8 bits del modelo openbmb/MiniCPM5-2B, publicada por el usuario axteam. Se trata de una build W8A8 en formato FP8 E4M3 con cuantizacion dinamica por token de las activaciones, empaquetada con la libreria compressed-tensors bajo el esquema FP8_DYNAMIC y pensada especificamente para servir el modelo con vLLM mediante una API compatible con OpenAI. El modelo base es un transformer denso de arquitectura tipo Llama, solo texto, con 2.516.756.480 parametros reales segun los safetensors del repositorio.

El interes de esta ficha no esta en el modelo base en si, sino en el proceso de cuantizacion: reduce el peso en disco a unos 3,1 GB y conserva el 99,0 % de la media de rendimiento del original en BF16 segun los benchmarks medidos por el autor, con una perdida de apenas 3,2 % de perplejidad y un 92,9 % de acuerdo top-1 en el siguiente token. Frente a alternativas de 4 bits como NVFP4 o AWQ-4bit, la recuperacion es notablemente superior, lo que lo convierte en una opcion sensata cuando se dispone de hardware Ada, Hopper o Blackwell y se quiere maximizar fidelidad con un coste de memoria moderado.

La licencia Apache-2.0 tanto del modelo base como de la derivada facilita el uso comercial. El contexto declarado en los ejemplos de despliegue es de 32.768 tokens (parametro `--max-model-len 32768`), y el chat template del modelo base activa por defecto un modo de razonamiento (thinking mode) que puede desactivarse en tiempo de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, arquitectura Llama, solo texto |
| Parametros totales | 2.516.756.480 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (segun ejemplo de despliegue con `--max-model-len 32768`) |
| Tipos de cuantizacion | FP8 E4M3 W8A8 (pesos por canal, activaciones dinamicas por token); embeddings, LM head y RMSNorms en BF16 (~21 % de los parametros) |
| Idiomas soportados | no disponible (el modelo base no declara lista de idiomas; los benchmarks incluyen evaluacion en ingles y coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (`float-quantized`, esquema `FP8_DYNAMIC`) |

## Arquitectura y entrenamiento

El modelo base MiniCPM5-2B es un transformer denso de tipo Llama, solo texto, con 2,5 mil millones de parametros. Esta build concreta no ha sido reentrenada: es una cuantizacion post-entrenamiento (PTQ) sin calibracion (data-free), en la que los pesos se almacenan en FP8 E4M3 con escala por canal y las activaciones se cuantizan dinamicamente por token en tiempo de ejecucion. Los embeddings de tokens, la LM head y todas las RMSNorms se mantienen en BF16, lo que representa aproximadamente el 21 % de los parametros de esta build.

El tokenizador y el chat template son identicos a los del modelo original. La cuantizacion la firma axteam y el checkpoint se guarda con compressed-tensors 0.19.0, aunque la version recomendada para leerlo es la 0.17.0 que fija vLLM. No se dispone de informacion sobre el dataset de entrenamiento del modelo base (numero de tokens, composicion, si hubo RLHF o DPO) en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional en ingles y coreano como minimo (los benchmarks y la evaluacion interna cubren ambos idiomas).
- Razonamiento con modo "thinking" activado por defecto en el chat template; se puede desactivar con `chat_template_kwargs={"enable_thinking": False}`.
- Razonamiento matematico de varios pasos: GSM8K 5-shot estricto con 71,27 en esta build.
- Conocimiento general y respuesta a preguntas: MMLU generativo 5-shot con 59,56.
- Razonamiento de sentido comun: ARC-Challenge 0-shot con 44,20 y Winogrande 5-shot con 63,22.
- Capacidades multilingues parciales: KMMLU (coreano) 38,38 y HAE-RAE (coreano) 38,13.
- Servido como API compatible con OpenAI a traves de vLLM, con soporte de chat multi-turno.
- No se declara soporte explicito de tool calling, function calling, vision, audio ni agentes multi-paso en la informacion disponible.

## Casos de uso

- Servicio de chat conversacional de bajo coste: con 3,1 GB de pesos, el modelo cabe en una sola GPU consumer o profesional y puede atender peticiones concurrentes con una API compatible con OpenAI, lo que simplifica la integracion en frontends existentes.
- Asistente de respuesta a preguntas sobre documentacion tecnica: la ventana de 32.768 tokens permite inyectar manuales o fragmentos de codigo extensos en el prompt sin truncar el contexto.
- Generacion de resumenes y reescritura de texto en ingles y coreano: el modelo mantiene el 99,7 % del rendimiento del BF16 en MMLU y el 97,7 % en HAE-RAE, por lo que la cuantizacion no degrada de forma apreciable tareas de comprension.
- Razonamiento matematico asistido en entornos educativos o de prototipado: con GSM8K de 71,27 en esta build, es viable para resolver problemas aritmeticos de varios pasos en un servicio ligero.
- Backend de razonamiento en pipelines de agentes simples: el modo thinking activable por peticion permite alternar entre respuestas rapidas y respuestas con cadena de razonamiento segun el caso, sin cambiar de modelo.
- Despliegue en entornos con GPU Turing o Ampere sin soporte nativo de FP8: vLLM cambia automaticamente a FP8 solo de pesos en sm75 y sm80, de modo que el modelo sigue siendo utilizable en T4 o A100 con un coste de memoria reducido.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio publica resultados medidos con el mismo harness para FP8, AWQ-8bit, NVFP4, NVFP4A16 y AWQ-4bit, lo que lo convierte en una referencia practica para estudiar el compromiso entre precision y fidelidad.

## Benchmarks y rendimiento

Resultados medidos por el autor con lm-evaluation-harness sobre vLLM, decodificacion greedy, prompts estilo completion sin chat template. MMLU es la variante generativa (`mmlu_generative`), no directamente comparable con MMLU por log-likelihood. Los porcentajes entre parentesis indican recuperacion respecto al BF16 original.

| Benchmark | BF16 (original) | FP8-dynamic (esta build) | AWQ-8bit | NVFP4A16 | NVFP4 | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot, generativo) | 59,74 | 59,56 (99,7 %) | 59,86 (100,2 %) | 56,81 (95,1 %) | 53,50 (89,5 %) | 56,31 (94,3 %) |
| GSM8K (5-shot, estricto) | 73,01 | 71,27 (97,6 %) | 73,01 (100,0 %) | 65,20 (89,3 %) | 55,04 (75,4 %) | 65,96 (90,3 %) |
| ARC-Challenge (0-shot) | 43,94 | 44,20 (100,6 %) | 43,86 (99,8 %) | 43,43 (98,8 %) | 40,10 (91,3 %) | 44,88 (102,1 %) |
| Winogrande (5-shot) | 64,40 | 63,22 (98,2 %) | 64,40 (100,0 %) | 62,75 (97,4 %) | 59,04 (91,7 %) | 62,12 (96,4 %) |
| KMMLU (5-shot, directo) | 37,65 | 38,38 (101,9 %) | 38,27 (101,7 %) | 35,56 (94,4 %) | 34,06 (90,5 %) | 30,73 (81,6 %) |
| HAE-RAE (0-shot) | 39,05 | 38,13 (97,7 %) | 39,14 (100,2 %) | 35,38 (90,6 %) | 30,16 (77,2 %) | 36,94 (94,6 %) |
| Media | 52,97 | 52,46 (99,0 %) | 53,09 (100,2 %) | 49,85 (94,1 %) | 45,32 (85,6 %) | 49,49 (93,4 %) |

Evaluacion de fidelidad frente al original en BF16 sobre un conjunto interno mixto ingles/coreano de 100 prompts, con respuestas greedy del BF16 como referencia:

| Metrica | Esta build | BF16 original |
|---|---|---|
| Perplejidad (menor es mas cercano) | 1,6494 | 1,5988 (+3,2 %) |
| Acuerdo top-1 en el siguiente token | 92,9 % | 98,9 % |

## Requisitos de hardware

- VRAM para pesos: 3,1 GB en FP8.
- VRAM total: hay que sumar la cache KV (crece con la longitud de contexto y el numero de peticiones concurrentes) y unos pocos GB para activaciones y grafos CUDA.
- GPU compatibles: NVIDIA Turing (sm75, por ejemplo T4) o superior. El calculo FP8 nativo requiere Ada, Hopper o Blackwell (sm89+); en Turing y Ampere vLLM conmuta automaticamente a FP8 solo de pesos. V100 (sm70) no esta soportado.
- GPU consumer: cabe holgadamente en RTX 4090, RTX 4080 y tarjetas con 8-12 GB de VRAM para contextos moderados; en GPUs mas pequenas conviene reducir `--max-model-len`.
- Despliegue recomendado: vLLM 0.32.0 (probado por el autor, con Python 3.11-3.14, torch 2.13 build CUDA 13.0, transformers >=5.16.1,<5.20 y compressed-tensors 0.17.0). Tambien es posible la inferencia con transformers >=4.56.0 y compressed-tensors >=0.15.0, descartando `token_type_ids` de la salida del tokenizador.
- Para reducir memoria de cache KV: `--kv-cache-dtype fp8`, que aproximadamente la reduce a la mitad.
- Multi-GPU: usar `--tensor-parallel-size N` cuando los pesos no quepan en una sola GPU.
- Latencia y throughput: no disponibles en la informacion proporcionada (el autor solo indica que las pruebas se ejecutaron en una B200, sin cifras de rendimiento).

## Comparativa con modelos similares

Comparativa dentro de la propia familia de cuantizaciones del mismo modelo base, segun los datos medidos publicados por el autor:

| Build | Precision | Media de benchmarks | Recuperacion vs BF16 | Peso aproximado |
|---|---|---|---|---|
| BF16 (original) | 16 bits | 52,97 | 100 % | no disponible |
| FP8-dynamic (esta build) | 8 bits | 52,46 | 99,0 % | 3,1 GB |
| AWQ-8bit | 8 bits | 53,09 | 100,2 % | no disponible |
| NVFP4A16 | 4 bits | 49,85 | 94,1 % | no disponible |
| NVFP4 | 4 bits | 45,32 | 85,6 % | no disponible |
| AWQ-4bit | 4 bits | 49,49 | 93,4 % | no disponible |

No se dispone de datos para comparar con modelos de otros autores de tamano similar (por ejemplo, alternativas de 2-3 mil millones de parametros de otras familias), por lo que esa comparacion se considera no disponible.

## Limitaciones y advertencias

- Modelo solo texto: no procesa imagenes, audio ni video.
- Idiomas: la lista oficial de idiomas soportados no esta declarada; la evidencia empirica se limita a ingles y coreano, por lo que el rendimiento en castellano no esta verificado.
- Alucinacion: como cualquier modelo de 2,5 mil millones de parametros, el riesgo de inventar datos es alto en tareas de conocimiento factual; conviene anclar las respuestas con recuperacion externa.
- Perdida de fidelidad por cuantizacion: 92,9 % de acuerdo top-1 y +3,2 % de perplejidad respecto al BF16 implica divergencias en generaciones largas y en tareas sensibles a tokens exactos.
- MMLU generativo no es comparable con MMLU por log-likelihood; no usar estas cifras para comparar con otros modelos evaluados de forma distinta.
- Dependencia estricta de versiones: compressed-tensors 0.17.0 fijado por vLLM lee un checkpoint guardado con 0.19.0; actualizar la libreria por separado puede romper la carga.
- En transformers 4.x el tokenizador devuelve `token_type_ids`, que el modelo no acepta; hay que eliminarlo antes de llamar a `generate`.
- V100 (sm70) no esta soportado; en Turing y Ampere el calculo FP8 no es nativo y vLLM degrada a FP8 solo de pesos.
- El modo thinking esta activado por defecto en el chat template, lo que incrementa el consumo de tokens de salida si no se desactiva explicitamente.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base por si el autor original anade terminos adicionales en su model card.

## Enlaces

- Repositorio Hugging Face de esta build: https://huggingface.co/axteam/MiniCPM5-2B-FP8-dynamic
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- vLLM: https://github.com/vllm-project/vllm
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- Otros enlaces (papers, blogs, demos) del autor o del modelo base: no disponibles en la informacion proporcionada.
