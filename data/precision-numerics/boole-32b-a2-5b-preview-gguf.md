# precision-numerics/Boole-32B-A2.5B-Preview-GGUF

## Resumen

Boole-32B-A2.5B-Preview es una versión comprimida y cuantizada del modelo Flint (RecursiveSI/flint), un transformer de arquitectura Mixture-of-Experts (MoE) con 31.949.291.040 parámetros totales y aproximadamente 2.500 millones de parámetros activos por token. Lo desarrolla precision-numerics y se distribuye en formato GGUF bajo licencia Apache 2.0. El modelo reduce el peso original de Flint (79,6 GB en BF16) hasta 9,0 GB mediante una combinación de poda de expertos enrutados y cuantización extrema.

La propuesta del modelo es ofrecer un equilibrio poco habitual entre tamaño en disco, velocidad de decodificación y calidad en tareas de razonamiento, matemáticas, código e instrucciones. Según la model card, decodifica 2,0 veces más rápido que el GGUF más veloz de Flint en una única RTX 5090, y en pruebas con llama-bench alcanza 1,61 veces más velocidad en procesamiento de prompt y 3,53 veces más en decodificación que la mejor línea base. Está pensado para despliegue en hardware de consumo y para servir inferencia en llama.cpp.

Es relevante ahora porque demuestra que técnicas agresivas de compresión (poda de expertos más cuantización de 1,8 bits por peso) pueden mantener una calidad razonable en benchmarks de código y matemáticas con una fracción del tamaño original, lo que abre la puerta a ejecutar modelos MoE de 32B en una sola GPU consumer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) |
| Parametros totales | 31.949.291.040 (32B) |
| Parametros activos | 2,5B |
| Longitud de contexto | 65.536 tokens (usada en evaluacion; no se especifica contexto maximo de entrenamiento) |
| Tipos de cuantizacion | Expertos enrutados a 1, 2 o 4 bits (1,8 bits por peso de media); resto de pesos a 4 bits; router en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (9,0 GB) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del Flint original de RecursiveSI. La arquitectura es Mixture-of-Experts con 32B de parametros totales y 2,5B activos por token. Sobre los 12.032 expertos enrutados de Flint, se han podado 2.491, quedando 9.541 expertos enrutados. Cada experto se cuantiza a 1, 2 o 4 bits, con una media de 1,8 bits por peso; los pesos no enrutados se mantienen a 4 bits y el router en BF16. El resultado es un archivo GGUF de 9,0 GB, frente a los 79,6 GB de Flint en BF16 o los 26,0 GB de Flint INT4.

La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. La innovacion tecnica principal es el esquema de compresion combinado (poda de expertos mas cuantizacion mixta por experto) y la integracion con un fork propio de llama.cpp que permite la decodificacion rapida en GPU. El modelo se evalua con temperatura 1.0, top-p 0.95, top-k 20 y contexto de 65.536 tokens.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, tag conversational).
- Razonamiento matematico: evaluado en GSM8K con 93,2 puntos.
- Generacion de codigo: evaluado en HumanEval+ (90,0), MBPP+ (76,7) y LiveCodeBench v6 (67,3).
- Seguimiento de instrucciones: evaluado en IFEval prompt-strict (90,6) e IFBench prompt-strict (75,9).
- Compatible con endpoints (tag endpoints_compatible).
- Soporte de inferencia via llama.cpp y su fork de PrecisionNumerics.
- Capacidades multilingues: no disponible.
- Tool calling, function calling, agentes multi-paso, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia de codigo en local: con HumanEval+ de 90,0 y MBPP+ de 76,7, el modelo puede autocompletar funciones, generar tests y resolver problemas de programacion en un entorno de desarrollo con una sola GPU consumer.
- Razonamiento matematico en produccion ligera: su GSM8K de 93,2 lo hace adecuado para resolver problemas aritmeticos y de varios pasos en aplicaciones educativas o de calculo asistido, con un coste de inferencia muy bajo gracias a sus 2,5B parametros activos.
- Servicio de chat con contexto largo: la ventana de 65.536 tokens permite mantener conversaciones multi-turno o procesar documentos extensos en una RTX 5090, con un tiempo hasta el primer token de 0,45 s para un prompt de 8K.
- Despliegue en hardware de consumo: con 9,0 GB en disco cabe en GPUs de 12-16 GB de VRAM, lo que permite ejecutar un MoE de 32B en estaciones de trabajo modestas o portatiles gaming.
- Evaluacion de instrucciones y agentes: sus resultados en IFEval e IFBench permiten usarlo como modelo de instrucciones en pipelines de automatizacion donde se requiere seguir formatos estrictos.
- Prototipado rapido de aplicaciones de IA: la velocidad de decodificacion (987 tok/s en tg128 en una RTX 5090) y el throughput agregado (10.337 tok/s con 32 peticiones concurrentes) lo hacen util para servir prototipos con muchos usuarios simultaneos.
- Investigacion sobre compresion de modelos: sirve como referencia para estudiar el impacto de la poda de expertos y la cuantizacion extrema en la calidad de un MoE.

## Benchmarks y rendimiento

Resultados de la model card (media ± error estandar; temperatura 1.0, top-p 0.95, top-k 20, contexto 65.536):

| Benchmark | Boole-32B-A2.5B-Preview | Unsloth UD-IQ1_M | Flint INT4 | Flint BF16 |
|---|---|---|---|---|
| Tamano | 9,0 GB | 11,4 GB | 26,0 GB | 79,6 GB |
| GSM8K | 93,2 ± 0,3 | 94,9 ± 0,1 | 95,8 ± <0,1 | 96,1 ± <0,1 |
| IFEval (prompt-strict) | 90,6 ± 0,1 | 93,5 ± 0,2 | 94,9 ± 0,2 | 94,8 ± 0,2 |
| IFBench (prompt-strict) | 75,9 ± 1,5 | 82,6 ± 0,5 | 87,7 ± 0,6 | 89,2 ± 0,4 |
| LiveCodeBench v6 | 67,3 ± 1,1 | 77,2 ± 0,5 | 81,3 ± 1,0 | 81,9 ± 0,3 |
| HumanEval+ | 90,0 ± 1,2 | 90,5 ± 1,0 | 92,5 ± 0,7 | 92,7 ± 0,9 |
| MBPP+ | 76,7 ± 0,3 | 78,5 ± 0,7 | 78,9 ± 0,7 | 79,8 ± 0,2 |

LiveCodeBench v6: 454 problemas, agosto 2024 - mayo 2025.

Rendimiento de inferencia en una RTX 5090 (llama-bench):

| Metrica | Boole-32B-A2.5B-Preview | Unsloth UD-IQ1_M | Flint INT4 |
|---|---|---|---|
| Prompt processing pp512 (tok/s) | 19.371 ± 257 | 11.882 ± 8 | 12.013 ± 18 |
| Decode tg128 (tok/s) | 987,0 ± 0,6 | 264,9 ± 0,2 | 279,4 ± 0,3 |
| Time to first token, prompt 8K (s) | 0,45 | 0,61 | 0,62 |
| Peak throughput, 8K prompt / 1K output (tok/s) | 10.337 a 32 peticiones | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada: 9,0 GB de pesos mas overhead de contexto y cache KV; con contexto de 8K-65K conviene reservar 12-16 GB de VRAM.
- GPU recomendadas: RTX 5090 (mediciones oficiales), RTX 4090, y en general GPUs con 12-16 GB o mas.
- Cabe en GPU consumer: si, en tarjetas de 12 GB o superiores (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090, RTX 5090).
- Opciones de despliegue: llama.cpp (incluido el fork de PrecisionNumerics), formato GGUF; compatible con endpoints.
- Latencia y throughput: en una RTX 5090, 987 tok/s en decodificacion (tg128), 19.371 tok/s en procesamiento de prompt (pp512), 0,45 s hasta el primer token con prompt de 8K y hasta 10.337 tok/s agregados con 32 peticiones concurrentes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano | Licencia | Calidad (GSM8K / HumanEval+) |
|---|---|---|---|---|---|
| Boole-32B-A2.5B-Preview | 32B totales / 2,5B activos | 65.536 | 9,0 GB | Apache 2.0 | 93,2 / 90,0 |
| Unsloth UD-IQ1_M (Flint) | 32B totales / 2,5B activos | 65.536 | 11,4 GB | Apache 2.0 (heredada) | 94,9 / 90,5 |
| Flint INT4 | 32B totales / 2,5B activos | 65.536 | 26,0 GB | Apache 2.0 | 95,8 / 92,5 |
| Flint BF16 | 32B totales / 2,5B activos | 65.536 | 79,6 GB | Apache 2.0 | 96,1 / 92,7 |

## Limitaciones y advertencias

- La compresion agresiva degrada la calidad respecto a Flint BF16: pierde 0,8 puntos en IFEval, 13,3 en IFBench, 14,6 en LiveCodeBench v6 y 2,9 en GSM8K. La mayor caida se da en seguimiento de instrucciones complejas y codigo competitivo.
- La poda de 2.491 expertos enrutados puede afectar a dominios o idiomas poco representados en los expertos conservados; no hay evaluacion por idioma en la informacion disponible.
- El modelo usa cuantizacion de 1,8 bits por peso en expertos, lo que puede introducir ruido numerico y degradar tareas de precision.
- No se detallan sesgos conocidos ni datos de entrenamiento, por lo que no se puede evaluar el riesgo de sesgo de forma especifica.
- Riesgo de alucinacion no cuantificado en la model card.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base (RecursiveSI/flint) debe verificarse para confirmar compatibilidad.
- Es una version "Preview"; puede haber cambios en versiones posteriores.
- Requiere el fork de llama.cpp de PrecisionNumerics para obtener el rendimiento declarado; otros backends pueden no soportar el esquema de cuantizacion mixta.

## Enlaces

- Hugging Face: https://huggingface.co/precision-numerics/Boole-32B-A2.5B-Preview-GGUF
- Modelo base Flint: https://huggingface.co/RecursiveSI/flint
- Codigo de demo: https://github.com/PrecisionNumerics/boole-demo
- Fork de llama.cpp: https://github.com/PrecisionNumerics/llama.cpp
- Licencia: https://huggingface.co/precision-numerics/Boole-32B-A2.5B-Preview-GGUF/blob/main/LICENSE
