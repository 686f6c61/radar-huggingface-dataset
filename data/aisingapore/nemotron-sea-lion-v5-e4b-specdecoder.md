# aisingapore/Nemotron-SEA-LION-v5-E4B-SpecDecoder

## Resumen

Nemotron-SEA-LION-v5-E4B-SpecDecoder es un modelo borrador (*draft model*) disenado especificamente para decodificacion especulativa junto al modelo objetivo [aisingapore/Nemotron-SEA-LION-v5-E4B](https://huggingface.co/aisingapore/Nemotron-SEA-LION-v5-E4B). Lo desarrolla el AI Products Pillar de AI Singapore, con financiacion de la National Research Foundation Singapore, dentro de la familia SEA-LION (Southeast Asian Languages In One Network), orientada a lenguas del sudeste asiatico. No es un modelo generativo autonomo: propone bloques de tokens que el modelo objetivo verifica, de modo que su unica funcion es acelerar la inferencia del modelo grande sin alterar la distribucion de salida.

Tecnicamente combina un backbone de difusion por bloques (DFlash), que propone un bloque completo de tokens en un unico forward pass paralelo, con un refinador causal XPress que restaura las dependencias entre los tokens del bloque antes de la verificacion. El modelo tiene 513.150.208 parametros totales (aproximadamente 0,51 mil millones) y un repositorio de 1,0 GB en formato safetensors. Esta construido sobre la arquitectura Qwen3 como base y se distribuye con licencia MIT, lo que facilita su adopcion en produccion.

Su relevancia es practica: la decodificacion especulativa es una de las tecnicas mas eficaces para reducir la latencia en inferencia de LLM sin degradar la calidad, y este borrador esta optimizado para el modelo E4B y para nueve idiomas (ingles, chino, birmano, indonesio, filipino, malayo, tamil, tailandes y vietnamita). En las pruebas publicadas por el autor, multiplica el throughput del modelo objetivo por un factor de aproximadamente 2,8 a 5,2 segun el conjunto de datos, con longitudes de aceptacion de hasta 7,17 tokens por paso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo borrador de decodificacion especulativa: difusion por bloques DFlash con refinador causal XPress, base Qwen3 |
| Parametros totales | 513.150.208 |
| Parametros activos | no disponible (no se documenta como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el modelo objetivo se sirve con `--load-format instanttensor`) |
| Idiomas soportados | en, zh, my, id, fil, ms, ta, th, vi |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un borrador para decodificacion especulativa con una arquitectura hibrida poco habitual. El backbone DFlash es un modelo de difusion por bloques que genera un bloque entero de tokens candidatos en un solo paso forward paralelo, en lugar de generar token a token de forma autorregresiva. Como la generacion paralela rompe las dependencias causales entre los tokens del bloque, se anade un refinador XPress que restaura esas dependencias antes de que el modelo objetivo verifique el bloque. El numero de tokens especulativos configurado en la evaluacion es de 15, frente a los 7 del borrador de NVIDIA con el que se compara.

El backbone DFlash se inicializo en caliente (*warm start*) a partir de [nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16-DFlash-NVFP4](https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16-DFlash-NVFP4) y se extendio con las convoluciones de [DFlash2 de Inco-AI](https://inco.ai/blog/dflash2/) y una cabeza XPress, siguiendo la arquitectura descrita por [Wang et al.](https://arxiv.org/abs/2608.02438). Los datos de entrenamiento provienen de tres conjuntos: [aisingapore/SEA-Instruct-2602](https://huggingface.co/datasets/aisingapore/SEA-Instruct-2602), [nvidia/Nemotron-SFT-Math-v4](https://huggingface.co/datasets/nvidia/Nemotron-SFT-Math-v4) y [nvidia/Nemotron-SFT-Competitive-Programming-v2](https://huggingface.co/datasets/nvidia/Nemotron-SFT-Competitive-Programming-v2). No se especifica el numero total de tokens de entrenamiento ni si se emplearon tecnicas de RLHF o DPO, algo que en un borrador de este tipo no resulta relevante porque no genera respuestas finales.

## Capacidades

- Propuesta de tokens especulativos: genera bloques de hasta 15 tokens candidatos que el modelo objetivo verifica en paralelo.
- Aceleracion de inferencia: incrementa el throughput del modelo objetivo sin modificar la distribucion de salida, ya que toda propuesta rechazada se descarta.
- Soporte multilingue del borrador: entrenado para ingles, chino, birmano, indonesio, filipino, malayo, tamil, tailandes y vietnamita.
- Cobertura de dominios: incluye datos de matematicas y programacion competitiva, lo que mejora la aceptacion en tareas de razonamiento y codigo.
- Integracion con vLLM: se sirve mediante el metodo `dflash` en la configuracion especulativa del fork de vLLM indicado por el autor.
- Compatibilidad con servidor OpenAI: el endpoint resultante es compatible con la API de OpenAI, igual que el del modelo objetivo.
- No soporta generacion autonoma, tool calling, agentes ni vision por si mismo: esas capacidades residen en el modelo objetivo.

## Casos de uso

- Despliegue de bajo latency para el modelo E4B: se usa como borrador acoplado a `Nemotron-SEA-LION-v5-E4B` en vLLM con `num_speculative_tokens: 15`, reduciendo el tiempo de respuesta en produccion sin reentrenar el modelo grande.
- Servicio de chat multilingue en el sudeste asiatico: el borrador acelera especialmente las lenguas con peor linea base; en birmano el throughput pasa de 204,9 a 647,4 tokens/s y en tamil de 204,8 a 514,0 tokens/s, lo que abarata la atencion al cliente en estos idiomas.
- Generacion de codigo asistida: con datos de programacion competitiva en el entrenamiento, mantiene longitudes de aceptacion de 5,95 en HumanEval y 5,27 en MBPP, adecuado para autocompletado en IDE y pipelines de CI/CD.
- Razonamiento matematico en produccion: en GSM8K y MATH500 alcanza 1014,5 y 1054,9 tokens/s con aceptaciones de 7,01 y 7,17, util para tutoring automatizado o verificacion de calculos.
- Evaluacion comparativa de tecnicas de decodificacion especulativa: sirve como referencia reproducible para medir el impacto de DFlash frente a borradores autorregresivos en un mismo hardware.
- Investigacion en difusion de bloques para LLM: al combinar DFlash con un refinador XPress, es una base para estudiar la calidad de propuestas paralelas y el trade-off entre velocidad y tasa de aceptacion.
- Reduccion de coste en inferencia por lotes: aunque la aceleracion se mide a concurrencia 1, el borrador permite mantener latencias aceptables cuando se sirven varios usuarios con el mismo modelo objetivo.

## Benchmarks y rendimiento

Resultados publicados por el autor a concurrencia 1, expresados como throughput (tokens/s) / longitud de aceptacion. Configuracion: maximo 4096 tokens generados, temperatura 1.0, top_k 64, top_p 0.95, thinking activado, commit `0e5943d85d` del fork de vLLM.

| Dataset | Baseline (E4B) | Con DFlash NVIDIA (7 tokens) | Con este SpecDecoder (15 tokens) |
|---|---|---|---|
| gsm8k | 195,4 | 879,4 / 5,136 | 1014,5 / 7,010 |
| math500 | 205,4 | 931,0 / 5,372 | 1054,9 / 7,171 |
| humaneval | 204,3 | 833,7 / 4,822 | 869,2 / 5,948 |
| mbpp | 205,4 | 771,4 / 4,454 | 774,1 / 5,269 |
| mt-bench | 205,0 | 602,4 / 3,494 | 575,4 / 3,939 |
| Birmano | 204,9 | 467,0 / 2,696 | 647,4 / 4,404 |
| Filipino | 204,9 | 428,5 / 2,493 | 573,7 / 3,915 |
| Indonesio | 205,1 | 474,1 / 2,740 | 524,4 / 3,602 |
| Malayo | 204,8 | 547,4 / 3,162 | 613,2 / 4,177 |
| Tamil | 204,8 | 377,3 / 2,179 | 514,0 / 3,498 |
| Tailandes | 205,3 | 431,9 / 2,498 | 517,8 / 3,527 |
| Vietnamita | 205,3 | 556,1 / 3,227 | 542,0 / 3,685 |

Datos parciales de escalado por concurrencia del modelo objetivo sin decodificacion especulativa: gsm8k pasa de 195,4 tokens/s a concurrencia 1 hasta 5906,2 a concurrencia 64; math500 de 205,4 a 2449,5 a concurrencia 16 (la tabla publicada esta truncada). No se han publicado resultados de benchmarks de calidad (MMLU, etc.) para el borrador, y no tendria sentido medirlos: la calidad es la del modelo objetivo.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un borrador de 0,51 mil millones de parametros en BF16, requiere aproximadamente 1 GB adicional sobre la memoria del modelo objetivo; el repositorio completo ocupa 1,0 GB.
- GPU recomendadas: cualquier GPU que pueda servir el modelo objetivo E4B; el autor no especifica modelos concretos. La configuracion de ejemplo usa `--tensor-parallel-size 1` y backend `flash_attn`.
- Cabe en GPU de consumo: si, el borrador por si solo cabe en GPU consumer, pero el requisito real lo marca el modelo objetivo.
- Opciones de despliegue: vLLM con el fork `qwen4_exp_dflash_merge` (rama de [nagarajankarthik/vllm](https://github.com/nagarajankarthik/vllm/tree/qwen4_exp_dflash_merge)); no se documenta soporte en llama.cpp, Ollama ni TGI.
- Latencia y throughput: a concurrencia 1, entre 514,0 y 1054,9 tokens/s segun conjunto de datos, frente a una linea base de aproximadamente 205 tokens/s. La aceleracion depende del prompt, el idioma y la concurrencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Throughput relativo |
|---|---|---|---|---|---|
| Nemotron-SEA-LION-v5-E4B-SpecDecoder | 513 M | no disponible | MIT | DFlash + XPress, 15 tokens especulativos | Hasta 5,2x sobre la linea base (gsm8k) |
| NVIDIA-Nemotron-3.5-Bolt-E4B-BF16-DFlash-NVFP4 | no disponible | no disponible | no disponible | DFlash, 7 tokens especulativos | Hasta 4,5x sobre la linea base (gsm8k) |
| Modelo objetivo E4B (sin borrador) | no disponible | no disponible | no disponible | Decodificacion autorregresiva | 1x (referencia) |

La comparacion directa disponible es con el borrador de NVIDIA del que deriva el backbone: este SpecDecoder supera al de NVIDIA en 9 de los 12 conjuntos evaluados y queda por debajo en mt-bench (575,4 frente a 602,4 tokens/s) y vietnamita (542,0 frente a 556,1), aunque con mayor longitud de aceptacion en ambos casos. No se dispone de datos de otros borradores comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: solo propone tokens y debe desplegarse junto a `aisingapore/Nemotron-SEA-LION-v5-E4B`; cargarlo de forma aislada no produce respuestas utiles.
- La calidad, los sesgos y la seguridad de las salidas son los del modelo objetivo; el borrador no los modifica ni los mitiga.
- La aceleracion es variable: depende del prompt, del idioma y de la concurrencia, y en algunos conjuntos (mt-bench, vietnamita) rinde por debajo del borrador de NVIDIA.
- Requiere un fork especifico de vLLM (`qwen4_exp_dflash_merge`), lo que limita la portabilidad y ata el despliegue a una rama no principal del proyecto.
- El contexto maximo no esta documentado; la ventana efectiva viene determinada por el modelo objetivo.
- Cobertura linguistica limitada a los nueve idiomas declarados; no se garantiza comportamiento en otras lenguas.
- Licencia MIT: permite uso comercial sin restricciones adicionales, pero conviene revisar la licencia y los terminos del modelo objetivo, que no se detallan en esta informacion.
- Modelo con muy poca adopcion publica (4 descargas, 0 likes en el momento de la consulta), por lo que la validacion en produccion por terceros es practicamente inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aisingapore/Nemotron-SEA-LION-v5-E4B-SpecDecoder
- Modelo objetivo: https://huggingface.co/aisingapore/Nemotron-SEA-LION-v5-E4B
- Coleccion SEA-LION v5: https://huggingface.co/collections/aisingapore/sea-lion-v5
- Sitio de SEA-LION: https://sea-lion.ai
- Fork de vLLM con soporte DFlash: https://github.com/nagarajankarthik/vllm/tree/qwen4_exp_dflash_merge
- Paper de referencia (Wang et al.): https://arxiv.org/abs/2608.02438
- Blog de DFlash2 (Inco-AI): https://inco.ai/blog/dflash2/
- Borrador base de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16-DFlash-NVFP4
- Dataset SEA-Instruct-2602: https://huggingface.co/datasets/aisingapore/SEA-Instruct-2602
- Dataset Nemotron-SFT-Math-v4: https://huggingface.co/datasets/nvidia/Nemotron-SFT-Math-v4
- Dataset Nemotron-SFT-Competitive-Programming-v2: https://huggingface.co/datasets/nvidia/Nemotron-SFT-Competitive-Programming-v2
- Licencia MIT: https://mit-license.org/
