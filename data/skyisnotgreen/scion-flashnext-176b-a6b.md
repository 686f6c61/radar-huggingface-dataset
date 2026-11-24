# SkyIsNotGreen/Scion-FlashNext-176B-A6B

## Resumen

Scion-FlashNext-176B-A6B es una cuantización extrema del modelo Qwen3.8-Flash-Next-FP8 publicada por el usuario SkyIsNotGreen en Hugging Face. Se trata de un modelo MoE (mezcla de expertos) de 176.000 millones de parámetros totales con 6.000 millones activos por token, comprimido en un único archivo GGUF de 57,62 GB (2,60 bits por peso) para su uso con llama.cpp. El modelo base es la versión FP8 oficial de Qwen, que ocupa 185,6 GB, por lo que esta build reduce el tamaño 3,2 veces.

La innovación principal es la combinación de bancos de expertos ternarios (valores {-1, 0, +1} empaquetados en base-3 con grupo de 128, contenedor TQ1_0_g128) con ramas de corrección entrenadas (rank-512 sobre las salidas de atención y del bloque MoE, más deltas de router) y una tabla n-gram de 51.200 millones de parámetros (PLE) cuantizada a Q4X160. Las correcciones se entrenan con el cuantizador desplegado en el bucle, sin imatrix ni corpus de calibración, lo que la distingue de las cuantizaciones calibradas convencionales.

Es relevante ahora porque permite ejecutar un modelo de 176B en hardware de consumo de gama alta (dos RX 7900 XT de 20 GB) a 80 tok/s, algo impensable con el release FP8 original. El modelo está pensado exclusivamente para inglés y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer (base Qwen3.8-Flash-Next), expertos ternarios + correcciones entrenadas + tabla n-gram PLE |
| Parametros totales | 177.283.638.144 (176B) |
| Parametros activos | 6B (aproximado, según model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | TQ1_0_g128 (ternario, 1,75 bpw), Q4X160 (tabla n-gram), Q4_0, F16 (cuerpo); variantes de archivo: 57,62 GB (por defecto), 60,17 GB (Q4_0), 65,80 GB (F16) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-Flash-Next-FP8, un transformer MoE con 125B parámetros en el modelo de lenguaje (6B activos) y una cabeza MTP de 4B que no se incluye en esta build. La cuantización sustituye los expertos por bancos ternarios empaquetados en base-3 (5 trits por byte, más un campo de 2 trits y una escala fp16 por grupo de 128 pesos, 28 bytes por 128), lo que da 1,75 bpw con una sobrecarga de contenedor de aproximadamente el 10% respecto a la entropía teórica de 1,585 bpw. El cuerpo se mantiene en Q6_K+Q8_0 (variante por defecto) o F16 (variante de fidelidad).

Sobre esa base se injertan ramas de corrección entrenadas de rango 512 en las salidas de atención y del bloque MoE, más deltas de router, entrenadas por destilación de conocimiento de salida contra el profesor con el cuantizador desplegado en el bucle (Lloyd ternario g128). No se usa imatrix ni corpus de calibración. La tabla n-gram (PLE) de 51,2B parámetros se cuantiza a Q4X160 (26,24 GB) o Q4_0 (28,8 GB) y se incluye en el mismo archivo con decodificación por fila. Las correcciones van embebidas (adapter.embedded=true) y se aplican en carga, sin necesidad de `--lora` ni archivos sidecar.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento y respuesta a preguntas de cultura general (HellaSwag 82,00%, Winogrande 77,50% en 400 muestras).
- Ejecución de una suite de capacidades de 20 tareas (cap_eval 15/20, 0 errores de harness).
- Soporte de decodificación especulativa mediante tabla n-gram (PLE) integrada.
- Compatible con endpoints (tag endpoints_compatible).
- Capacidad de código y lógica limitada: 1/3 en cada categoría según la suite de capacidades.
- No se documentan tool calling, function calling, agentes ni capacidades multimodales en la información disponible.

## Casos de uso

- Despliegue de un modelo de 176B en hardware de consumo: con dos GPU de 20 GB (RX 7900 XT) se obtienen 80,5-80,8 tok/s, lo que permite servir un modelo de gran escala sin infraestructura de centro de datos.
- Generación de texto conversacional en inglés: el modelo mantiene coherencia multi-turno y puede usarse como backend de chatbots o asistentes en inglés.
- Evaluación de técnicas de cuantización extrema: sirve como referencia para investigar el impacto de cuantización ternaria con correcciones entrenadas frente a cuantizaciones calibradas con imatrix.
- Prototipado rápido en estaciones de trabajo: el archivo único de 57,62 GB cabe en un SSD NVMe y se carga con llama.cpp sin gestión de shards ni adaptadores.
- Tareas de cultura general y razonamiento cotidiano: adecuado para HellaSwag y Winogrande, con rendimiento del 82% y 77,5% respectivamente.
- Investigación sobre decodificación especulativa n-gram: la tabla PLE integrada permite estudiar aceleración de inferencia en modelos MoE cuantizados.
- Despliegue en entornos con restricciones de memoria: la variante de 57,62 GB es la más pequeña publicada para este modelo base, incluidas builds podadas.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| HellaSwag (400 muestras) | 82,00% | Medido en la build de 57,62 GB |
| Winogrande (400 muestras) | 77,50% | Medido en la build de 57,62 GB |
| cap_eval (20 tareas) | 15/20 | 0 errores de harness |
| KLD medio (48 capas) | 0,5800 | 92,9% del mass corresponde al ajuste de soporte top-512 |
| Generación (Strata, 2x RX 7900 XT) | 80,5-80,8 tok/s | Archivo Q4_0 de 60,17 GB, contexto 4096, greedy, 128 tokens |
| Latencia por token | ~12,4 ms | 2,3-2,4 tokens por ventana de pipeline |

No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada: el archivo por defecto ocupa 57,62 GB; se necesita al menos esa cantidad de memoria combinada (GPU + RAM) para cargarlo, más overhead de contexto.
- GPU recomendadas: 2x RX 7900 XT (20 GB cada una) validadas con reparto de capas 26/22 y cachés de expertos en ambas tarjetas; para el archivo F16 de 65,80 GB se requiere más memoria.
- Cabe en consumer GPU: sí, en configuraciones multi-GPU de gama alta (2x 20 GB o superior); no cabe en una sola GPU de consumo de 24 GB.
- Opciones de despliegue: runtime Scion (fork de llama.cpp, rama scion-base, commit 2089cd1d3), con paquetes precompilados Linux ROCm/CPU en scion-v1.0.0; runtime legacy Prism qwen4exp-proto para reproducir mediciones originales; motor Strata (propio del proyecto) para las cifras de rendimiento.
- Latencia y throughput: ~12,4 ms/token y 80,5-80,8 tok/s en la configuración validada (2x RX 7900 XT, archivo Q4_0 de 60,17 GB, contexto 4096).

## Comparativa con modelos similares

| Modelo | Parámetros | Tamaño | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Scion-FlashNext-176B-A6B | 176B (6B activos) | 57,62 GB | no disponible | Apache 2.0 | Ternario + correcciones entrenadas |
| Qwen3.8-Flash-Next-FP8 (oficial) | 176B | 185,6 GB | no disponible | Apache 2.0 | Release FP8 de referencia |
| ggml-org IQ4_NL | 176B | 102 GB | no disponible | Apache 2.0 | Cuantización calibrada con imatrix |
| Mooney PQ2_0 | 176B | 92 GB | no disponible | Apache 2.0 | Otra build ternaria |
| GSQ-RCO IQ3_S | 176B | 83,6 GB | no disponible | Apache 2.0 | Cuantización calibrada |
| IQ3_XXS | 176B | 75,8 GB | no disponible | Apache 2.0 | Cuantización calibrada |
| IQ2_XS | 176B | 68,0 GB | no disponible | Apache 2.0 | Cuantización calibrada |
| GSQ-RCO Q2_0 | 176B | 66,4 GB | no disponible | Apache 2.0 | Cuantización calibrada |
| ISTA coder IQ1_M (podado) | 176B (podado) | 58,4 GB | no disponible | Apache 2.0 | Build podada por expertos |

## Limitaciones y advertencias

- Solo soporta inglés; no se documentan capacidades multilingües.
- El KLD medio de 0,5800 indica una divergencia considerable respecto al profesor, con el 92,9% del mass concentrado en el ajuste de soporte top-512.
- Código y lógica son las categorías débiles (1/3 en cada una) en la suite de capacidades de 20 tareas.
- La extensión de paso 4000 fue entrenada y evaluada (0,5880, plano o peor) y no se incluye en el release.
- No se documentan tool calling, function calling ni capacidades de agente.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.8-Flash-Next-FP8 debe verificarse por separado.
- El rendimiento medido (80 tok/s) corresponde al archivo Q4_0 de 60,17 GB, no al archivo por defecto de 57,62 GB, que no se ha medido en el equipo de referencia.
- Requiere el runtime Scion o el legacy Prism; no es compatible con llama.cpp upstream sin el fork.
- Riesgo de alucinación no cuantificado en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/SkyIsNotGreen/Scion-FlashNext-176B-A6B
- GitHub (scripts y documentación): https://github.com/sky-is-green/scion
- Runtime Scion (precompilado): https://github.com/sky-is-green/scion-llama.cpp/releases/tag/scion-v1.0.0
- Runtime legacy Prism: https://github.com/sky-is-green/prism-ml-llama.cpp/tree/qwen4exp-proto
- Discusiones: https://huggingface.co/SkyIsNotGreen/Scion-FlashNext-176B-A6B/discussions
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next-FP8
