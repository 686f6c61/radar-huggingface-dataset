# infosave/TML-d24-varloop-research-cmf

## Resumen

TML-d24-varloop-research-cmf es un empaquetado en formato CMF del modelo TML-d24-varloop-research de Thinking Machines, un transformer de mezcla de expertos (MoE) con capas intermedias reutilizables ("looped transformer") cuyo numero de pasadas se puede ajustar en tiempo de ejecucion. El modelo base tiene 26,4B parametros totales y activa entre 3,4B y 7,4B parametros por token segun se ejecuten 1 o 5 pasadas; fue entrenado principalmente con 3 pasadas. Esta version, publicada por el usuario infosave, aplica cuantizacion de 4 bits (esquema q4tp) a los expertos enrutados y a las matrices densas, dejando la cabeza en 8 bits y algunas componentes en f32, y la empaqueta en un unico fichero de 15,12 GB.

La relevancia del artefacto esta en el motor de inferencia: cortiq, escrito en Rust sin Python ni frameworks de ML, con soporte para CUDA, Vulkan, DX12, Metal y CPU. Esto permite ejecutar un MoE de 26,4B en una unica GPU de 24 GB (probado en NVIDIA L4 y en un MacBook Air M4), algo que con pesos en f16 o bf16 requeriria bastante mas memoria. Ademas, el fichero incluye el drafter DSpark para decodificacion especulativa, que acelera la generacion en codigo y JSON.

El modelo esta orientado a generacion de texto, razonamiento, codigo y tool calling, con soporte de ingles, ruso y chino. La licencia es Apache 2.0. La torre de vision del modelo original no esta incluida en este empaquetado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas intermedias reutilizables (looped transformer), 48 aplicaciones de capa, 12 capas centrales repetibles |
| Parametros totales | 26,4B |
| Parametros activos | 3,4B por token a 1 pasada; 5,4B a 3 pasadas; 7,4B a 5 pasadas (cada pasada anade ~1B) |
| Longitud de contexto | No disponible de forma explicita; se documentan prompts de 32.768 tokens con lectura en 32,0 s |
| Tipos de cuantizacion | q4tp (4 bits en expertos enrutados, atencion y matrices densas; cabeza 8 bits; drafter 8 bits; embeddings f16; routers, convoluciones y compuertas en f32) |
| Idiomas soportados | Ingles (en), ruso (ru), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | CMF (fichero unico para el motor cortiq); el modelo base usa NVFP4/MXFP8 en safetensors |

## Arquitectura y entrenamiento

El modelo base es un MoE con 26,4B parametros totales en el que las 12 capas centrales se ejecutan un numero variable de veces (de 1 a 5 pasadas) en el momento de la inferencia. Fue entrenado con 1 a 5 pasadas, con predominio de 3, lo que convierte el numero de pasadas en un dial entre calidad y coste computacional: la perplejidad en WikiText-2 baja de 9,930 a 1 pasada hasta 9,218 a 5 pasadas, mientras la velocidad de decodificacion cae de 98,5 a 34,7 tok/s en una L4. El release original distribuye los expertos enrutados en NVFP4 (capas 0-19) y MXFP8 (capas 20-23).

El empaquetado CMF decodifica esos expertos y los recodifica en q4tp. La atencion, su compuerta de salida y las proyecciones de posicion relativa se redondean con GPTQ sobre 3.072 tokens de prosa, Rust y Python ajenos a los textos de evaluacion; la cabeza queda en 8 bits, el embedding en f16 y los routers, convoluciones, consultas de mezcla de bloques y compuertas de mensaje en f32. El fichero incluye tambien el drafter DSpark (`mtp.safetensors`): tres capas densas que leen los estados ocultos en tres de las 48 aplicaciones de capa y el estado final, mas una cabeza recurrente que propone hasta siete tokens por adelantado. No se detalla en la informacion disponible la composicion exacta del dataset de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto en ingles, ruso y chino.
- Razonamiento multi-paso, con modo de multiples pasadas que incrementa la capacidad de computo por token.
- Generacion de codigo y de JSON, con aceleracion especifica mediante decodificacion especulativa DSpark.
- Tool calling y function calling (segun los tags del modelo).
- Soporte de agentes y razonamiento multi-paso (tag `reasoning`).
- Decodificacion especulativa integrada con el drafter DSpark, activable o desactivable.
- Ajuste en tiempo de ejecucion del numero de pasadas (`--loops N` o `CMF_INKLING_PASSES=N`).
- Ejecucion en CUDA, Vulkan, DX12, Metal y CPU mediante el motor cortiq.
- Vision: no incluida en este empaquetado (la torre de vision del modelo original no esta en el fichero).

## Casos de uso

- Generacion de codigo en produccion: el modelo alcanza 78,2 tok/s en codigo Python con DSpark en una L4, con un 65 % de borradores aceptados, lo que lo hace adecuado para autocompletado y generacion en IDE o pipelines de CI/CD.
- Generacion de JSON estructurado para APIs: con 68,7 tok/s y un 57 % de borradores aceptados en JSON, encaja en la generacion de respuestas estructuradas para integraciones y backends.
- Razonamiento con presupuesto variable: usar `--loops 5` para tareas que requieren mas computo (por ejemplo, demostraciones matematicas) y `--loops 1` para tareas simples a 98,5 tok/s permite ajustar coste y calidad por peticion.
- Despliegue en hardware de gama media: al caber en una unica GPU de 24 GB (L4) y funcionar a 21,8 tok/s en un MacBook Air M4 via Metal, sirve para entornos de desarrollo, prototipado y estaciones de trabajo sin GPUs de datacenter.
- Atencion al cliente multilingue: el soporte de ingles, ruso y chino permite gestionar conversaciones en esos idiomas; los prompts largos (32.768 tokens leidos en 32,0 s en L4) admiten historiales extensos.
- Asistentes con tool calling: los tags de tool calling y agentes permiten construir asistentes que invocan funciones externas y encadenan pasos, con la ventaja de un motor sin dependencias de Python para despliegues ligeros.
- Procesamiento por lotes en CPU: a 10,8 tok/s en CPU en un M4, puede usarse para tareas de generacion no interactivas donde no hay GPU disponible.

## Benchmarks y rendimiento

Perplejidad en WikiText-2 (12 ventanas de 512 tokens, test, en CUDA) y velocidad en NVIDIA L4 con CUDA, 3 pasadas, sin decodificacion especulativa:

| Pasadas | WikiText-2 ppl | Referencia f32 | Decodificacion (tok/s) | Primer token tras 2.048 tokens (s) |
|---:|---:|---:|---:|---:|
| 1 | 9,930 | 9,784 | 98,5 | 0,61 |
| 2 | 9,627 | — | 66,7 | 0,99 |
| 3 | 9,239 | 9,134 | 50,6 | 1,37 |
| 4 | 9,231 | — | 41,4 | 1,80 |
| 5 | 9,218 | 9,118 | 34,7 | 2,21 |

Calidad del fichero cuantizado frente a la referencia f32 (3 pasadas):

| Metrica | q4tp CMF | Referencia f32 |
|---|---:|---:|
| WikiText-2 ppl (512 tokens) | 9,239 | 9,134 |
| WikiText-2 ppl, Rust | 3,047 | 3,030 |
| WikiText-2 ppl, Python | 2,883 | 2,857 |
| WikiText-2, ventanas de 4.096 tokens | 7,580 | 7,499 |

Rendimiento por backend (3 pasadas):

| Backend | WikiText-2 ppl | WikiText-2, 4.096 tokens |
|---|---:|---:|
| CUDA (NVIDIA L4) | 9,239 | 7,580 |
| Vulkan (NVIDIA L4) | 9,237 | 7,576 |
| Metal (Apple M4) | 9,241 | 7,579 |

Decodificacion especulativa DSpark (NVIDIA L4, CUDA, 3 pasadas, greedy, 384 tokens):

| Texto | Sin DSpark (tok/s) | Con DSpark (tok/s) | Aceleracion | Borradores aceptados |
|---|---:|---:|---:|---:|
| Codigo Python | 50,6 | 78,2 | x1,55 | 65 % |
| JSON | 50,5 | 68,7 | x1,36 | 57 % |
| Relato corto | 50,5 | 52,0 | x1,03 | 42 % |
| Prosa de consejos | 50,9 | 51,2 | x1,01 | 34 % |

Otros datos medidos: lectura de un prompt de 2.048 tokens en 1,38 s y de 32.768 tokens en 32,0 s; 35,7 tok/s en Vulkan sobre L4; 21,8 tok/s en MacBook Air M4 via Metal y 10,8 tok/s en CPU. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM: el fichero completo ocupa 15,12 GB y cabe en una GPU de 24 GB.
- GPU probadas: NVIDIA L4 (CUDA y Vulkan); Apple M4 (Metal y CPU). No se documentan pruebas en A100, H100 ni RTX 4090, aunque por tamano del fichero deberian poder alojarlo; no disponible confirmacion.
- GPU de consumo: cabe en tarjetas de 24 GB como la RTX 4090 por capacidad de memoria; no hay mediciones publicadas en esa tarjeta.
- Despliegue: motor cortiq (Rust) con backends CUDA, Vulkan, DX12, Metal y CPU; requiere cortiq 0.9.13 o posterior. Binarios precompilados para Linux, macOS y Windows.
- Latencia: primer token tras 2.048 tokens en 1,37 s (3 pasadas, L4); tras 32.768 tokens en 32,0 s.
- Throughput: 98,5 tok/s a 1 pasada, 50,6 a 3 pasadas, 34,7 a 5 pasadas en L4; hasta 78,2 tok/s con DSpark en codigo.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento de modelos comparables de la misma categoria (MoE de ~26B con capas reutilizables y cuantizacion de 4 bits), por lo que no es posible establecer una comparacion con cifras verificables.

## Limitaciones y advertencias

- El modelo fue entrenado predominantemente con 3 pasadas; otros valores pueden rendir por debajo de lo que lograria un modelo entrenado especificamente para ese numero de pasadas.
- La cuantizacion q4tp introduce una perdida de calidad medible: perplejidad de 9,239 frente a 9,134 de la referencia f32 en WikiText-2 (512 tokens).
- La decodificacion especulativa DSpark solo aporta ganancias claras en codigo y JSON; en prosa la aceleracion es marginal (x1,01-x1,03) y el sistema recurre a decodificacion normal cuando el drafter no predice bien.
- Solo se declaran tres idiomas (ingles, ruso, chino); el rendimiento en otros idiomas no esta documentado.
- La torre de vision no esta incluida en este empaquetado, por lo que no hay capacidades multimodales.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan evaluaciones especificas de sesgo o veracidad.
- El modelo base es de investigacion ("research"), lo que puede implicar menor robustez en produccion que variantes post-entrenadas para uso comercial.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda verificar las condiciones del modelo base original.
- Dependencia del motor cortiq; no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI con este formato CMF.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/infosave/TML-d24-varloop-research-cmf
- Modelo base: https://huggingface.co/thinkingmachines/TML-d24-varloop-research
- Repositorio del motor CMF/cortiq: https://github.com/infosave2007/cmf
- Binarios precompilados de cortiq: https://github.com/infosave2007/cmf/releases
- Grafico de pasadas frente a perplejidad y velocidad: https://huggingface.co/infosave/TML-d24-varloop-research-cmf/resolve/main/assets/passes_en.png
