# netprojects/nemotron-dory1.0-4b-mlx-8bit

## Resumen

Dory 1.0 4B es un modelo de razonamiento de NVIDIA (Nemotron-Labs) publicado el 16 de octubre de 2026, con arquitectura de tipo *looped language model*: un bloque compartido de capas se ejecuta entre 1 y 4 veces (2 por defecto), de modo que un unico conjunto de pesos ofrece un dial entre velocidad y precision. El modelo razona primero dentro de etiquetas `<think>...</think>` y despues emite la respuesta final. El checkpoint original se distribuye en BF16 bajo licencia OpenMDW-1.1.

La ficha que nos ocupa, `netprojects/nemotron-dory1.0-4b-mlx-8bit`, es una conversion a 8 bits (cuantizacion afines, tamano de grupo 64) realizada por NetProjects (Internet Projects Ltd), no afiliada a NVIDIA, para Apple Silicon mediante MLX. El repositorio ocupa 4,2 GB y contiene 3.975.229.440 parametros reales. Requiere el paquete `dory-mlx`, que anade el soporte de la arquitectura `dory` a MLX.

Su relevancia practica es doble: por un lado, permite ejecutar un modelo de razonamiento de 4B en portatiles Mac con memoria unificada, con un consumo medido de 7,7 a 11,5 GB segun el numero de loops con prompts de 32K tokens; por otro, la verificacion publicada por el autor (acuerdo top-1 del 98% frente a la build bf16, KL de 0,003) da una idea cuantificada de la perdida introducida por la cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de tipo *looped language model* (bloque de capas compartido ejecutado 1-4 veces; 2 por defecto) |
| Parametros totales | 3.975.229.440 (~4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma explicita en la informacion; verificado con prompts de hasta 24K tokens y probado con 32K |
| Tipos de cuantizacion | 8 bits afines con tamano de grupo 64 (esta build); existe build NVFP4 de 4 bits del mismo autor; el original esta en BF16 |
| Idiomas soportados | ingles (en) |
| Licencia | OpenMDW-1.1 (la misma que el modelo original de NVIDIA); el codigo de `dory-mlx` es Apache-2.0 |
| Formato de pesos | safetensors (layout fusionado para decodificacion mas rapida) |

## Arquitectura y entrenamiento

La innovacion central es el bucle de capas: un unico bloque compartido se recorre de 1 a 4 veces, de forma que el mismo conjunto de pesos puede operar en modo rapido (1 loop) o en modo mas preciso (4 loops). Los datos publicados por NetProjects confirman que el dial funciona: la perplejidad en WikiText-2 (primeros 64K tokens, ventanas de 1.024 tokens) baja de 12,17 con 1 loop a 11,76 con 2 y 11,69 con 4 en la build bf16; la build de 8 bits obtiene 12,18 / 11,77 / 11,70, practicamente identicas.

Los pesos de esta conversion usan un layout fusionado (query, key, value y gate en una sola matriz; gate y up del MLP en otra) para acelerar la decodificacion, y el script `scripts/convert.py` de `dory-mlx` los reconstruye desde el checkpoint original de NVIDIA. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO. La model card recomienda los hiperparametros de NVIDIA: temperatura 1.0 y top_p 0.95.

## Capacidades

- Generacion de texto y razonamiento en cadena: el modelo produce primero un bloque `<think>...</think>` y despues la respuesta, por lo que las salidas son mas largas que las de un modelo de chat convencional.
- Razonamiento matematico basico y de varios pasos (el ejemplo de la model card es `What is 17 * 23?`).
- Ajuste de esfuerzo computacional en tiempo de inferencia mediante el parametro `loops` (1 a 4), sin cambiar de pesos.
- Generacion por streaming por piezas a traves de `dory_mlx.chat(...)`.
- Soporte de cache de ventana deslizante y prefill troceado, verificado con coincidencia top-1 de al menos el 98,7% frente a una pasada completa.
- Generacion por lotes en MLX-LM (propuesta PR 1988): unos 200 tokens/s agregados con 4 peticiones y 450 tokens/s con 16.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles; el modelo es solo texto.
- Multilingue: limitado a ingles.

## Casos de uso

- Razonamiento local en portatiles Apple Silicon: ejecutar el modelo con `dory-mlx` en un MacBook con memoria unificada, usando 1 loop para consultas rapidas y 4 loops cuando se necesita mayor precision, sin depender de la nube.
- Asistentes de analisis con contexto largo: con prompts de 32K tokens el modelo lee a 1.980 tokens/s (2 loops) y consume 9,0 GB de pico, lo que permite resumir o consultar documentacion extensa en local.
- Servicio por lotes en un solo equipo: con MLX-LM y la PR 1988 se alcanzan 450 tokens/s agregados con 16 peticiones simultaneas en 8 bits y 2 loops, adecuado para un endpoint interno de baja concurrencia.
- Prototipado de razonamiento verificable: al exponer la cadena `<think>`, resulta util para depurar pipelines que necesitan inspeccionar el razonamiento intermedio antes de la respuesta.
- Educacion y tutoria en ingles: el modo de 4 loops (perplejidad 11,70 en WikiText-2) ofrece la mayor calidad del dial para explicaciones paso a paso.
- Evaluacion comparativa de cuantizaciones: el propio autor publica metricas de fidelidad (acuerdo top-1 del 98%, KL de 0,003 frente a bf16), lo que lo convierte en una referencia para medir el impacto de 8 bits en modelos looped.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros). La model card remite a la card original de NVIDIA para los resultados de precision.

Se dispone, en cambio, de metricas de fidelidad y rendimiento medidas por el autor:

| Metrica | Resultado |
|---|---|
| Logits frente a implementacion PyTorch fp32 independiente (2 loops, 55 tokens) | acuerdo top-1 100%, KL 0,001-0,003 |
| 8 bits frente a build MLX bf16 (5 textos cortos, 2 loops) | acuerdo top-1 98%, KL 0,003, perdida 1,278 vs 1,271 |
| Perplejidad WikiText-2, loops 1 / 2 / 4 | 12,18 / 11,77 / 11,70 (bf16: 12,17 / 11,76 / 11,69) |
| Caches de ventana deslizante (ventana 64) | acuerdo top-1 >= 98,7%, KL <= 0,0006 |

Rendimiento en MacBook Pro M5 Max (128 GB), 8 bits:

| Loops | Generacion, prompt corto | Generacion tras prompt de 32K | Lectura de 32K | Memoria pico con 32K |
|---|---|---|---|---|
| 1 | 101 tok/s | 82 tok/s | 3.200 tok/s (10 s) | 7,7 GB |
| 2 | 69 tok/s | 54 tok/s | 1.980 tok/s (17 s) | 9,0 GB |
| 4 | 39 tok/s | 31 tok/s | 1.070 tok/s (31 s) | 11,5 GB |

En un MacBook Pro M1 Pro de 16 GB, una medicion independiente (equipo Kapitsa) con MLX-LM y la PR 1988 en 4 bits y 2 loops da 27,9 tokens/s con contexto de 1K y 19,3 tokens/s con 32K.

## Requisitos de hardware

- Memoria: 4,2 GB de pesos en disco; pico medido de 4,39 GB con prompts cortos y 8,97 GB con prompts de 4K a 32K en MLX-LM (8 bits, 2 loops). Con `dory-mlx` y 32K tokens el pico va de 7,7 GB (1 loop) a 11,5 GB (4 loops).
- GPU recomendadas: Apple Silicon con memoria unificada. El autor lo probo en un M5 Max de 128 GB; hay mediciones independientes en un M1 Pro de 16 GB con la build de 4 bits.
- Cabe en GPU de consumo Apple: si, en equipos con al menos 16 GB de memoria unificada usando la build de 4 bits; con 8 bits conviene partir de 16-24 GB para contexto largo.
- Despliegue: paquete `dory-mlx` (via `pip install "git+https://github.com/internet-projects/dory-mlx"`) o MLX-LM con la PR 1988. Tambien existen implementaciones de referencia en vLLM (PR 60149) y llama.cpp para el modelo original.
- Latencia y throughput: ver tabla de la seccion anterior; en MLX-LM con 8 bits y 2 loops, la lectura de un prompt de 32K tarda 17,5 s y la generacion va a 53,0 tokens/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| netprojects/nemotron-dory1.0-4b-mlx-8bit | ~4B | verificado hasta 24K, probado a 32K | 8 bits afines, grupo 64 | OpenMDW-1.1 | MLX (Apple Silicon) |
| netprojects/nemotron-dory1.0-4b-mlx-nvfp4 | ~4B | no disponible | NVFP4 (4 bits) | OpenMDW-1.1 | MLX; 2,6 GB y ~1,4x mas rapido que 8 bits, misma perplejidad que bf16 |
| nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16 | ~4B | no disponible | BF16 | OpenMDW-1.1 | Checkpoint original, multiplataforma |
| netprojects/h2o-lightning-4b-mlx-q8 | ~4B | no disponible | 8 bits | no disponible | MLX (Apple Silicon) |

No se dispone de datos de benchmarks comparativos frente a otros modelos de razonamiento de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- Solo ingles: la model card declara `language: [en]`; no hay soporte multilingue documentado.
- Las respuestas incluyen la cadena de razonamiento, por lo que son mas largas y consumen mas tokens que las de un modelo de chat convencional.
- Riesgo de alucinacion: no se documenta ningun mecanismo de mitigacion ni evaluacion especifica de factualidad.
- Sesgos: no se han publicado analisis de sesgos en la informacion disponible.
- Contexto: la longitud maxima no se declara de forma explicita; las pruebas se hicieron con prompts de hasta 24K tokens verificados y 32K medidos, por lo que no debe asumirse una ventana mayor.
- Licencia OpenMDW-1.1: es necesario revisar el texto completo en `LICENSE` antes de un uso comercial; la model card no detalla las restricciones.
- Esta build es una conversion de terceros no afiliada a NVIDIA; para produccion conviene validar la fidelidad frente al checkpoint BF16 original.
- La cuantizacion de 8 bits introduce una deriva medible (KL 0,003, acuerdo top-1 del 98% frente a bf16); en tareas sensibles a la precision puede ser preferible el checkpoint original.
- El rendimiento medido corresponde a Apple Silicon; no hay datos de latencia en GPU NVIDIA para esta build.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/nemotron-dory1.0-4b-mlx-8bit
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16
- Build NVFP4 de 4 bits: https://huggingface.co/netprojects/nemotron-dory1.0-4b-mlx-nvfp4
- Repositorio `dory-mlx`: https://github.com/internet-projects/dory-mlx
- Organizacion NetProjects en Hugging Face: https://huggingface.co/netprojects
- PR de soporte en MLX-LM: https://github.com/ml-explore/mlx-lm/pull/1988
- Medicion independiente en M1 Pro: https://github.com/nace-ai/kapitsa/issues/296
- MLX: https://github.com/ml-explore/mlx
- H2O-Lightning-4B en MLX: https://huggingface.co/netprojects/h2o-lightning-4b-mlx-q8
- Articulo sobre H2O-Lightning-4B: https://netprojects.com/insights/h2o-lightning-4b-on-apple-silicon-mlx
- Estandares de IA de NetProjects: https://netprojects.com/standards/ai
