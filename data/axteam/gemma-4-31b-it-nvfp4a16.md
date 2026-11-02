# axteam/gemma-4-31B-it-NVFP4A16

## Resumen

`axteam/gemma-4-31B-it-NVFP4A16` es una cuantizacion de 4 bits del modelo multimodal `google/gemma-4-31B-it` de Google, publicada por el usuario axteam. Se trata de un checkpoint post-entrenamiento (PTQ) con esquema W4A16: pesos en FP4 (E2M1) con escalas de grupo FP8 y activaciones en BF16, empaquetado en formato `compressed-tensors` (`nvfp4-pack-quantized`) y orientado especificamente al servicio con vLLM. El objetivo es reducir el peso en disco y la huella de VRAM del modelo original manteniendo una fidelidad alta respecto al BF16.

El modelo base es un transformer denso de la familia Gemma 4 con capacidad de entrada imagen-texto, es decir, acepta imagenes y texto y genera texto. Segun los datos de safetensors del repositorio, el checkpoint contiene 18.460.143.562 parametros, y ocupa aproximadamente 20,4 GB en disco. La model card declara una calibracion de 256 muestras con predominio de coreano y respuestas en modo thinking.

La relevancia de esta ficha reside en que documenta una alternativa cuantizada de un modelo multimodal de gran tamano para despliegue en produccion con vLLM, con mediciones de recuperacion frente al BF16 en varios benchmarks y una evaluacion de fidelidad (perplejidad y acuerdo top-1). Es una opcion a considerar cuando el BF16 no cabe en el hardware disponible o cuando se busca mayor throughput por GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4, transformer denso (multimodal image-text-to-text) |
| Parametros totales | 18.460.143.562 (segun safetensors del repo) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4A16 (W4A16): pesos FP4 E2M1, grupo 16, escala FP8 E4M3 + escala global FP32 por tensor, activaciones BF16; vision tower, proyeccion visual, embeddings y normas en BF16 |
| Idiomas soportados | no disponible (la calibracion fue mayoritariamente en coreano) |
| Licencia | Apache-2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors con `compressed-tensors` (`nvfp4-pack-quantized`) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Gemma 4 con pipeline `image-text-to-text`, lo que implica un codificador visual (vision tower) y una proyeccion hacia el espacio de tokens del modelo de lenguaje. En esta version cuantizada, el vision tower, la proyeccion visual, los token embeddings (atados con el lm_head) y todas las normas se mantienen en BF16, lo que representa aproximadamente el 6 % de los parametros del build. El resto de pesos lineales se almacenan en FP4 con escalas de grupo.

La cuantizacion es PTQ basada en AWQ (activation-aware weight quantization) con 256 muestras de calibracion, sin reentrenamiento ni gradientes. La model card distingue explicitamente entre RTN, AWQ y QAT, y aclara que este repositorio no es un checkpoint QAT de Google. El tokenizer, el `chat_template` (incluida la correccion de julio de 2026 de Google), el `processor_config` y el `generation_config` son identicos a los del modelo original; el `config.json` es el original mas un bloque `quantization_config`. No se dispone de informacion sobre el numero de tokens de entrenamiento del modelo base ni sobre la composicion del dataset.

## Capacidades

- Generacion de texto conversacional con plantilla de chat compatible con el modelo original.
- Procesamiento de imagenes y texto (pipeline image-text-to-text): descripcion de imagenes, respuesta a preguntas visuales y razonamiento sobre contenido grafico.
- Razonamiento multi-paso, incluido el modo thinking del modelo base (la calibracion incluyo respuestas de ese modo).
- Generacion de codigo y resolucion de problemas matematicos, segun los benchmarks reportados (GSM8K).
- Capacidades multilingues heredadas del modelo base; la model card no detalla la lista de idiomas.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponible en la informacion proporcionada.

## Casos de uso

- Servicio de chat multimodal en produccion: el modelo acepta imagenes y texto, por lo que puede usarse para asistentes que respondan sobre capturas, documentos escaneados o fotografias. Su huella de 20,4 GB permite desplegarlo con vLLM en una sola GPU de 24 GB o en varias mediante tensor parallelism.
- Analisis de documentos con componentes visuales: extraccion y resumen de informacion de facturas, formularios o graficos, aprovechando la torre visual mantenida en BF16 para preservar calidad.
- Razonamiento matematico asistido: con un 91,96 en GSM8K (5-shot, estricto) en esta cuantizacion, es adecuado para tutoria o verificacion de calculos en pipelines internos.
- Generacion de codigo en entornos con recursos limitados: al reducir el peso a 20,4 GB, permite servir un modelo de 18,5 mil millones de parametros en GPUs consumer de gama alta, con menor coste por token que el BF16.
- Evaluacion y prototipado de sistemas multimodales: util para equipos que necesitan comparar el comportamiento del modelo base frente a su version cuantizada sin disponer de un cluster de GPUs de gran memoria.
- Despliegue con vLLM y tensor parallelism: la model card documenta `--tensor-parallel-size N` para repartir los pesos entre varias GPUs cuando no caben en una sola, lo que facilita el escalado horizontal en infraestructura existente.
- Atencion al cliente con contexto largo: no se dispone de la longitud de contexto oficial, por lo que este caso queda condicionado a confirmar dicho parametro en la documentacion del modelo base.

## Benchmarks y rendimiento

Resultados medidos con lm-evaluation-harness sobre vLLM, greedy, prompts de tipo completion sin plantilla de chat. Los porcentajes entre parentesis indican la recuperacion respecto al BF16 original.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit | NVFP4A16 (este repo) | NVFP4 | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot) | 56,46 | 56,07 (99,3 %) | 56,41 (99,9 %) | 58,32 (103,3 %) | 58,51 (103,6 %) | 57,12 (101,2 %) |
| GSM8K (5-shot, strict) | 91,81 | 91,89 (100,1 %) | 91,66 (99,8 %) | 91,96 (100,2 %) | 91,74 (99,9 %) | 92,34 (100,6 %) |
| ARC-Challenge (0-shot) | 57,59 | 58,36 (101,3 %) | 57,68 (100,1 %) | 57,76 (100,3 %) | 56,91 (98,8 %) | 57,17 (99,3 %) |
| Winogrande (5-shot) | 66,22 | 66,14 (99,9 %) | 65,82 (99,4 %) | 65,59 (99,0 %) | 64,96 (98,1 %) | 66,77 (100,8 %) |
| KMMLU (5-shot, direct) | 25,02 | 23,89 (95,5 %) | 25,21 (100,8 %) | 26,55 (106,1 %) | 26,78 (107,0 %) | 25,02 (100,0 %) |
| HAE-RAE (0-shot) | 76,81 | 75,25 (98,0 %) | 76,81 (100,0 %) | 77,09 (100,4 %) | 77,09 (100,4 %) | 78,09 (101,7 %) |
| **Media** | **62,32** | **61,93 (99,4 %)** | **62,27 (99,9 %)** | **62,88 (100,9 %)** | **62,66 (100,6 %)** | **62,75 (100,7 %)** |

Evaluacion de fidelidad frente al BF16 original, sobre un conjunto interno mixto ingles/coreano con vLLM 0.32 (2026-11-01):

| Metrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor es mejor) | 1,1759 | 1,1120 (+5,7 %) |
| Acuerdo top-1 del siguiente token | 94,4 % | 99,4 % |

## Requisitos de hardware

- VRAM estimada: pesos de 20,4 GB; hay que anadir la KV cache (crece con la longitud de contexto y el numero de peticiones concurrentes) y varios GB para activaciones y CUDA graphs.
- GPUs compatibles: NVIDIA Turing (sm75) o superior; no se necesita soporte de tensor cores FP4 porque la cuantizacion es weight-only. V100 (sm70) no esta soportada. En las pruebas solo se ejecuto en B200.
- Cabe en GPU consumer: si, en tarjetas de 24 GB o mas (por ejemplo, RTX 4090), siempre que se ajuste la KV cache y el numero de peticiones concurrentes; para contextos largos o alta concurrencia se recomienda tensor parallelism.
- Despliegue recomendado: vLLM (arquitectura incluida en vLLM >= 0.19.0; probado con vLLM 0.32.0). Requiere Python 3.11-3.14, torch 2.13 (build CUDA 13.0), transformers >= 5.16.1,<5.20 y compressed-tensors 0.17.0.
- Uso sin vLLM: transformers >= 5.5.0 (5.5.2+ recomendado); no probado con el modelo de 31B en ese entorno.
- `trust_remote_code`: no necesario.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `axteam/gemma-4-31B-it-NVFP4A16` (este) | 18,46 B | no disponible | NVFP4A16 (W4A16) | Apache-2.0 | HuggingFace, 145 descargas |
| `google/gemma-4-31B-it` (BF16) | no disponible en la informacion | no disponible | BF16 | Gemma 4 / Apache-2.0 | HuggingFace |
| FP8-dynamic de Gemma 4 31B-it | no disponible | no disponible | FP8 dinamico | Gemma 4 / Apache-2.0 | Referenciado en benchmarks de la model card |
| AWQ-4bit de Gemma 4 31B-it | no disponible | no disponible | AWQ 4 bits | Gemma 4 / Apache-2.0 | Referenciado en benchmarks de la model card |

No se dispone de datos de benchmarks de modelos de otras familias comparables en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion introduce una perdida de fidelidad medible: perplejidad un 5,7 % superior al BF16 y acuerdo top-1 del 94,4 % frente al 99,4 % del original.
- Es una PTQ basada en AWQ, no un checkpoint QAT; la model card advierte que los QAT de Google ofrecen mejor fidelidad en baja precision.
- La calibracion uso 256 muestras con predominio de coreano, lo que puede sesgar el comportamiento en otros idiomas.
- Riesgo de alucinacion inherente al modelo base; no se documentan mitigaciones especificas en esta version.
- No se detalla la lista de idiomas soportados ni la longitud de contexto, datos relevantes para planificar el despliegue.
- Requiere versiones muy concretas de vLLM, torch, transformers y compressed-tensors; actualizar compressed-tensors por separado puede romper la carga del checkpoint.
- No soporta V100 (sm70); solo GPUs Turing o superiores.
- La licencia Apache-2.0 remite a la licencia de Gemma 4 de Google; conviene revisar sus terminos para uso comercial.
- El repositorio tiene un volumen de descargas bajo (145) y pocos likes (3), por lo que la validacion comunitaria es limitada.

## Enlaces

- HuggingFace: https://huggingface.co/axteam/gemma-4-31B-it-NVFP4A16
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
