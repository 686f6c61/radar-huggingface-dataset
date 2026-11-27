# axteam/MiniCPM5-2B-AWQ-4bit

## Resumen

MiniCPM5-2B-AWQ-4bit es una cuantizacion de 4 bits del modelo denso openbmb/MiniCPM5-2B, publicada por el usuario axteam. No se trata de un modelo nuevo entrenado desde cero, sino de una conversion post-entrenamiento que reduce el peso de los parametros de BF16 a INT4 asimetrico (esquema W4A16) mediante la tecnica AWQ (Activation-aware Weight Quantization), manteniendo las activaciones en BF16. El objetivo es abaratar el coste de memoria y facilitar el despliegue del modelo base en entornos de inferencia con vLLM.

El modelo hereda la arquitectura del original: un transformer denso de tipo Llama, solo texto, con 2.516.756.480 parametros totales y un repositorio de aproximadamente 2,2 GB en disco. La cuantizacion conserva en BF16 los embeddings de tokens, la cabeza LM y todas las RMSNorm, lo que representa en torno al 21 % de los parametros de esta build. El tokenizador y la plantilla de chat son identicos a los del modelo original.

Su relevancia practica es doble: por un lado, permite servir un modelo de 2,5 mil millones de parametros con un consumo de pesos de solo 2,2 GB, lo que lo hace viable en GPUs de consumo; por otro, la propia model card documenta una degradacion medible frente al original BF16, con una recuperacion media del 93,4 % en los benchmarks evaluados y una perplexidad un 14,2 % superior, por lo que su uso debe ponderarse frente a alternativas de 8 bits cuando la calidad sea critica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, arquitectura Llama, solo texto |
| Parametros totales | 2.516.756.480 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (valor usado en los ejemplos de despliegue con `--max-model-len 32768`) |
| Tipos de cuantizacion | AWQ INT4 (W4A16): pesos INT4 asimetricos, grupo 32, activaciones BF16; formato compressed-tensors `pack-quantized` |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas; los ejemplos de evaluacion incluyen prompts en ingles y coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors `pack-quantized`) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso con arquitectura Llama, especializado en generacion de texto y sin componentes multimodales. Esta build concreta no ha sido reentrenada: se trata de una cuantizacion post-entrenamiento (PTQ) realizada con AWQ, calibrada con 256 muestras. Los pesos se almacenan como enteros de 4 bits asimetricos con tamano de grupo 32, mientras que las activaciones se mantienen en BF16. Los embeddings de tokens, la cabeza LM y todas las RMSNorm permanecen en BF16, lo que explica que la build no alcance la compresion teorica de 4 bits puros.

La model card no aporta informacion sobre el numero de tokens de entrenamiento del modelo original, la composicion del dataset ni si hubo etapas de RLHF o DPO. Si se documenta que la plantilla de chat incluye un modo de razonamiento (thinking mode) activado por defecto, desactivable mediante `chat_template_kwargs={"enable_thinking": False}`, y que la configuracion de muestreo recomendada por el autor original es temperatura 1.0 y top_p 0.95.

## Capacidades

- Generacion de texto conversacional en formato chat, con plantilla compatible con transformes y vLLM.
- Modo de razonamiento (thinking mode) activado por defecto en la plantilla de chat, desactivable por peticion.
- Razonamiento matematico basico y de varios pasos, segun los resultados de GSM8K reportados.
- Conocimiento general y respuesta a preguntas de opcion multiple (MMLU, ARC-Challenge, Winogrande).
- Cobertura multilingue parcial: la evaluacion incluye KMMLU (coreano) y HAE-RAE (coreano), ademas de pruebas en ingles; no se declara una lista formal de idiomas.
- Compatibilidad con la API OpenAI de vLLM (`/v1/chat/completions`), lo que permite integrarlo en pipelines existentes.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Vision y audio: no disponibles; el modelo es solo texto.

## Casos de uso

- Servicio de chat con API compatible con OpenAI: el modelo puede desplegarse con `vllm serve` y exponer un endpoint `/v1/chat/completions`, lo que permite sustituir modelos mayores en prototipos y entornos de desarrollo sin cambiar el codigo cliente.
- Despliegue en GPUs de consumo: con solo 2,2 GB de pesos, cabe en tarjetas de gama media y permite montar un servidor de inferencia local para pruebas, demos o entornos de desarrollo sin acceso a GPUs de datacenter.
- Generacion de respuestas con contexto largo: la ventana de 32.768 tokens permite procesar documentos extensos o conversaciones multi-turno largas, aunque el coste de KV cache crece con la longitud y puede mitigarse con `--kv-cache-dtype fp8`.
- Evaluacion comparativa de tecnicas de cuantizacion: la model card publica resultados de AWQ-4bit, AWQ-8bit, FP8-dynamic, NVFP4 y NVFP4A16 sobre el mismo harness, lo que convierte este repositorio en un caso de referencia para estudiar el impacto de la precision en modelos pequenos.
- Razonamiento aritmetico y tareas de logica sencilla: con un 90,3 % de recuperacion en GSM8K frente al BF16, es util para asistentes de resolucion de problemas matematicos de dificultad media en entornos donde el ahorro de memoria prima sobre la precision absoluta.
- Procesamiento de texto en coreano e ingles: los benchmarks KMMLU y HAE-RAE indican capacidad funcional en coreano, lo que permite tareas de clasificacion, resumen o respuesta a preguntas en esos idiomas, con la cautela de la caida del 81,6 % de recuperacion en KMMLU.
- Backend de bajo coste para experimentacion con thinking mode: al poder activar o desactivar el razonamiento por peticion, sirve para comparar calidad y latencia entre modos en un mismo despliegue.

## Benchmarks y rendimiento

Resultados medidos por el autor con lm-evaluation-harness sobre vLLM, decodificacion greedy y prompts de estilo completion sin plantilla de chat. MMLU corresponde a la variante generativa (`mmlu_generative`), no directamente comparable con puntuaciones obtenidas por log-likelihood.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit | NVFP4A16 | NVFP4 | AWQ-4bit (este repo) |
|---|---|---|---|---|---|---|
| MMLU (5-shot, generativo) | 59,74 | 59,56 (99,7 %) | 59,86 (100,2 %) | 56,81 (95,1 %) | 53,50 (89,5 %) | 56,31 (94,3 %) |
| GSM8K (5-shot, estricto) | 73,01 | 71,27 (97,6 %) | 73,01 (100,0 %) | 65,20 (89,3 %) | 55,04 (75,4 %) | 65,96 (90,3 %) |
| ARC-Challenge (0-shot) | 43,94 | 44,20 (100,6 %) | 43,86 (99,8 %) | 43,43 (98,8 %) | 40,10 (91,3 %) | 44,88 (102,1 %) |
| Winogrande (5-shot) | 64,40 | 63,22 (98,2 %) | 64,40 (100,0 %) | 62,75 (97,4 %) | 59,04 (91,7 %) | 62,12 (96,4 %) |
| KMMLU (5-shot, directo) | 37,65 | 38,38 (101,9 %) | 38,27 (101,7 %) | 35,56 (94,4 %) | 34,06 (90,5 %) | 30,73 (81,6 %) |
| HAE-RAE (0-shot) | 39,05 | 38,13 (97,7 %) | 39,14 (100,2 %) | 35,38 (90,6 %) | 30,16 (77,2 %) | 36,94 (94,6 %) |
| Media | 52,97 | 52,46 (99,0 %) | 53,09 (100,2 %) | 49,85 (94,1 %) | 45,32 (85,6 %) | 49,49 (93,4 %) |

Evaluacion de fidelidad frente al original BF16 sobre un conjunto interno mixto ingles/coreano de 100 prompts, con respuestas greedy del BF16 como referencia:

| Metrica | Este modelo | BF16 original |
|---|---|---|
| Perplexidad (menor es mejor) | 1,8260 | 1,5988 (+14,2 %) |
| Acuerdo top-1 en siguiente token | 84,9 % | 98,9 % |

## Requisitos de hardware

- VRAM estimada: 2,2 GB solo para pesos; hay que sumar la KV cache (crece con la longitud de contexto y el numero de peticiones concurrentes) y varios GB para activaciones y CUDA graphs.
- GPUs recomendadas: NVIDIA Turing (sm75) o superior. La model card indica que solo se probo en una B200, pero el esquema es weight-only INT y no requiere tensor cores especiales.
- GPU no soportada: V100 (sm70) queda explicitamente fuera de soporte.
- Cabe en GPU de consumo: si, dado el tamano de pesos de 2,2 GB; la model card no detalla modelos concretos de consumo probados.
- Despliegue: vLLM (probado con la version 0.32.0), que requiere Python 3.11-3.14, torch 2.13 con build CUDA 13.0, transformers >=5.16.1,<5.20 y compressed-tensors 0.17.0 (fijado por vLLM; el checkpoint se guardo con 0.19.0 y no debe actualizarse por separado). Tambien es posible usar transformers >=4.56.0 con compressed-tensors >=0.15.0, descartando `token_type_ids` de la salida del tokenizador.
- Multi-GPU: usar `--tensor-parallel-size N` cuando los pesos no quepan en una sola GPU.
- Reduccion de KV cache: `--kv-cache-dtype fp8` reduce aproximadamente a la mitad la memoria de la KV cache en contextos largos o lotes grandes.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| axteam/MiniCPM5-2B-AWQ-4bit | 2,52 B | 32.768 | AWQ INT4 (W4A16) | Apache-2.0 | Hugging Face, vLLM |
| openbmb/MiniCPM5-2B (BF16) | 2,52 B | 32.768 | BF16 | Apache-2.0 | Hugging Face |
| Build AWQ-8bit del mismo autor (referenciada en la model card) | 2,52 B | 32.768 | AWQ INT8 | Apache-2.0 | Referenciada, sin URL en la informacion |
| Build FP8-dynamic del mismo autor (referenciada en la model card) | 2,52 B | 32.768 | FP8 dinamico | Apache-2.0 | Referenciada, sin URL en la informacion |

Frente a las alternativas de 8 bits y FP8, esta build sacrifica calidad a cambio de memoria: la media de benchmarks cae al 93,4 % frente al 99,0-100,2 % de las variantes de 8 bits, y la perplexidad empeora un 14,2 %. La comparativa con modelos de otros fabricantes en la misma franja de parametros no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Degradacion medible por la cuantizacion: recuperacion media del 93,4 % en benchmarks y perplexidad un 14,2 % superior al BF16; el propio autor recomienda una build de 8 bits si la calidad es prioritaria.
- Caida acusada en coreano: KMMLU baja al 81,6 % de recuperacion, el peor resultado de la tabla, lo que desaconseja su uso en tareas coreanas que requieran precision.
- Acuerdo top-1 del 84,9 % frente al 98,9 % del BF16, lo que implica divergencias notables en la generacion token a token.
- Riesgo de alucinacion: no se documentan evaluaciones de veracidad ni de tasas de alucinacion en la informacion disponible.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Idiomas: no se declara una lista oficial de idiomas soportados; la evidencia empirica se limita a ingles y coreano.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero debe conservarse la atribucion y las condiciones de la licencia del modelo base openbmb/MiniCPM5-2B.
- Dependencias fragiles: requiere versiones muy concretas de vLLM, transformers y compressed-tensors; actualizar compressed-tensors por separado puede romper la carga del checkpoint.
- Soporte de hardware limitado: V100 (sm70) no esta soportado y solo se valido en una B200, por lo que el rendimiento en otras GPUs no esta verificado por el autor.
- Tool calling y uso como agente: no documentados, por lo que no deben asumirse en produccion sin validacion previa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/axteam/MiniCPM5-2B-AWQ-4bit
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
