# kingjones777/LFM2-8B-A1B-ROCmFPX-GGUF

## Resumen

LFM2-8B-A1B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por Liquid AI, diseñado especificamente para despliegue en dispositivos de borde y equipos locales. Con 8,3 mil millones de parametros totales y 1,5 mil millones activos por token, ofrece la calidad de un modelo de mayor tamano con el coste computacional de uno de 1,5B. La version aqui descrita es una cuantizacion GGUF con los nuevos formatos ROCmFP4 y ROCmFPX, creada por kingjones777 y optimizada para GPUs AMD gfx1151 (Ryzen AI MAX+ 395 / Strix Halo).

Esta cuantizacion es la primera en aplicar los formatos ROCmFP4 y ROCmFPX al modelo LFM2-8B-A1B, y se distribuye en cuatro variantes con precisiones de 4, 6 y 8 bits. El modelo base emplea una arquitectura hibrida con 24 capas, dimension oculta de 2048 y 32 expertos, activando solo una fraccion de los parametros durante la inferencia. Segun Liquid AI, esta arquitectura ofrece un rendimiento de decodificacion y prefill un 200% superior a Qwen3 y Gemma 3 en CPU.

La relevancia de este lanzamiento radica en que permite ejecutar un MoE de 8,3B en hardware AMD de consumo con velocidades de decodificacion superiores a 100 tokens por segundo, un nicho tradicionalmente dominado por GPUs NVIDIA. El autor advierte que los ficheros requieren un fork especifico de llama.cpp y no cargan con la version estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrido (Mixture-of-Experts) |
| Parametros totales | 8.339.930.560 (8,3B) |
| Parametros activos | 1,5B (el model card del cuantizador indica ~1B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ROCmFP4 (Q4_0), ROCmFPX (Q6_0, Q8_0) |
| Idiomas soportados | ingles |
| Licencia | lfm1.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

LFM2-8B-A1B emplea una arquitectura hibrida MoE con 24 capas, dimension oculta de 2048 y 32 expertos, de los cuales se activa un subconjunto por token. Liquid AI disena esta familia para despliegue en el borde, priorizando velocidad de decodificacion, eficiencia de memoria y calidad de salida. El modelo base soporta seguimiento de instrucciones y function calling, capacidades que lo posicionan frente a Qwen3 y Gemma 3 en su clase de tamano.

La cuantizacion ROCmFPX se genero a partir de un GGUF BF16 (fuente sin perdida), no de una recuantizacion de una version de menor precision. Los cuatro ficheros mantienen la embedding atada (sin output.weight separado), con token_embd en Q6_K para la version de 4 bits y Q8_0 para las de 6 y 8 bits. No se incluyen tensores de decodificacion especulativa (MTP, EAGLE o nextn), por lo que no hay aceleracion especulativa disponible.

## Capacidades

- Generacion de texto en ingles con calidad de modelo de 8B gracias a la activacion selectiva de expertos.
- Seguimiento de instrucciones y function calling (capacidad del modelo base, no evaluada formalmente en esta cuantizacion).
- Razonamiento aritmetico basico verificado: 17x23=391, capital de Japon=Tokyo, dias en 2024=366 (3/3 en todas las variantes).
- Ejecucion en hardware AMD con ROCm, incluyendo APUs de la serie Ryzen AI MAX.
- Cuatro variantes de cuantizacion para ajustar el equilibrio entre precision, uso de memoria y velocidad.
- Las variantes AGENT (Q6_0 y Q8_0) mantienen mas tensores en alta precision para mejorar la coherencia en llamadas a herramientas, aunque no se ha medido su eficacia real.

## Casos de uso

- Despliegue en dispositivos de borde: el modelo esta disenado para ejecutarse en equipos locales sin conexion a la nube, con velocidades de decodificacion superiores a 100 tokens/s en APUs AMD.
- Asistentes conversacionales locales: la variante Q4_0_ROCMFP4_COHERENT ocupa solo 4,41 GiB, lo que permite ejecutarla en equipos con memoria unificada de 128 GB como el Ryzen AI MAX+ 395.
- Enrutamiento de agentes y tool-calling: las variantes AGENT mantienen mas tensores en alta precision para mejorar la coherencia en llamadas a herramientas, adecuadas para pipelines de agentes que requieren multiples pasos de razonamiento.
- Prototipado de aplicaciones de IA generativa en hardware AMD: al ser la primera cuantizacion ROCmFPX de este modelo, sirve como referencia para desarrolladores que trabajan con gfx1151.
- Inferencia de alta fidelidad: la variante Q8_0_ROCMFPX ofrece la mayor precision (8,26 bpw) para casos donde la calidad de salida es prioritaria sobre la velocidad.
- Evaluacion de rendimiento en APUs: los datos de decodificacion publicados (146,61 tokens/s en 4 bits) permiten comparar el rendimiento real en hardware Strix Halo y validar configuraciones de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor proporciona los siguientes datos de rendimiento medidos en un Ryzen AI MAX+ 395 (gfx1151, ROCm) con `-ngl 999 -c 4096 -fa on -fit off`, mediana de 3 ejecuciones con warm-up descartado:

| Variante | Tamano | bpw | Decodificacion (tokens/s) |
|---|---|---|---|
| Q4_0_ROCMFP4_COHERENT | 4,41 GiB | 4,54 | 146,61 |
| Q6_0_ROCMFPX_AGENT | 7,14 GiB | 7,35 | 104,09 |
| Q8_0_ROCMFPX | 8,02 GiB | 8,26 | 102,97 |
| Q8_0_ROCMFPX_AGENT | 8,13 GiB | 8,37 | 104,31 |

Pruebas de correccion: 3/3 en todas las variantes (17x23=391, capital de Japon=Tokyo, dias en 2024=366, con max_tokens 1024). No se realizaron pruebas de perplexity, contextos largos ni evaluacion de tool-calling.

## Requisitos de hardware

- GPU objetivo: AMD gfx1151 (Ryzen AI MAX+ 395 / Strix Halo) con ROCm.
- VRAM estimada: 4,41 GiB (Q4_0), 7,14 GiB (Q6_0), 8,02-8,13 GiB (Q8_0).
- No es compatible con GPUs NVIDIA ni con llama.cpp estandar: requiere el fork `charlie12345/ROCmFPX`.
- El modelo cabe en APUs con memoria unificada de 128 GB, como el Ryzen AI MAX+ 395.
- Opciones de despliegue: llama.cpp (fork ROCmFPX) con `-ngl 999 -c 4096 -fa on`.
- Rendimiento medido: entre 102,97 y 146,61 tokens/s segun la variante.

## Comparativa con modelos similares

Segun Liquid AI, LFM2-8B-A1B ofrece un rendimiento de decodificacion y prefill un 200% superior a Qwen3 y Gemma 3 en CPU, y supera a los modelos de su clase en seguimiento de instrucciones y function calling. No se dispone de datos numericos detallados de comparacion en la informacion proporcionada.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia |
|---|---|---|---|---|
| LFM2-8B-A1B | 8,3B | 1,5B | no disponible | lfm1.0 |
| Qwen3 (referencia) | no disponible | no disponible | no disponible | no disponible |
| Gemma 3 (referencia) | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los tipos de cuantizacion ROCmFP4 y ROCmFPX solo existen en el fork `charlie12345/ROCmFPX` de llama.cpp; el llama.cpp estandar reporta `invalid ggml type` y no puede cargar estos ficheros.
- No se ha realizado ninguna prueba de perplexity ni comparacion de calidad contra la fuente BF16.
- No se ha probado el modelo en contextos largos.
- No se ha evaluado formalmente el tool-calling, aunque las variantes AGENT estan disenadas para ello.
- El modelo solo soporta ingles.
- La licencia lfm1.0 puede imponer restricciones de uso comercial; es necesario revisar sus terminos.
- No hay decodificacion especulativa disponible: no se incluyen tensores MTP, EAGLE o nextn.
- El modelo base tiene una version mas reciente (LiquidAI/LFM2.5-8B-A1B) que puede ofrecer mejoras de calidad o rendimiento.

## Enlaces

- Repositorio HuggingFace de la cuantizacion: https://huggingface.co/kingjones777/LFM2-8B-A1B-ROCmFPX-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2-8B-A1B
- GGUF oficial de Liquid AI: https://huggingface.co/LiquidAI/LFM2-8B-A1B-GGUF
- Blog de Liquid AI sobre LFM2-8B-A1B: https://www.liquid.ai/blog/lfm2-8b-a1b-an-efficient-on-device-mixture-of-experts
- Blog de Liquid AI sobre la serie LFM2: https://www.liquid.ai/blog/liquid-foundation-models-v2-our-second-series-of-generative-ai-models
- Documentacion de Liquid AI: https://docs.liquid.ai/lfm/models/lfm2-8b-a1b
- Fork ROCmFPX de llama.cpp: https://github.com/charlie12345/ROCmFPX
