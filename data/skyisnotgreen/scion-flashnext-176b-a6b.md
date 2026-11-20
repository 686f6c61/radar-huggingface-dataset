# SkyIsNotGreen/Scion-FlashNext-176B-A6B

## Resumen

Scion-FlashNext-176B-A6B es una cuantización extrema del modelo Qwen3.8-Flash-Next-FP8 desarrollada por SkyIsNotGreen, publicada en Hugging Face bajo licencia Apache 2.0. El resultado es un único archivo GGUF de 57,62 GB que contiene 176.000 millones de parámetros nominales (177.283.638.144 reales según safetensors): los 125.000 millones del modelo de lenguaje (con 6.000 millones activados por token, al ser una arquitectura MoE) más una tabla de n-gramas de 51.200 millones de parámetros (PLE) que sustituye la cabeza MTP de 4.000 millones del modelo base. Frente a los 185,6 GB de la release oficial en FP8, este archivo es aproximadamente 3,2 veces más pequeño y, según el autor, la build más pequeña de este modelo publicada en el Hub, incluso comparada con cuantizaciones podadas por expertos.

La innovación central es el uso de expertos ternarios en un contenedor base-3 denominado TQ1_0_g128 (antes PTQ1_0) a 1,75 bits por peso, combinado con ramas de corrección entrenadas (rank 512) sobre las salidas de atención y del bloque MoE, más deltas de router. A diferencia de las cuantizaciones calibradas con imatrix, estas correcciones se entrenaron por destilación de salida (output-KD) contra el profesor con el cuantizador desplegado en el bucle, sin corpus de calibración. La tabla de n-gramas se almacena en el contenedor Q4X160 (26,24 GB).

Es relevante ahora porque demuestra que es posible servir un MoE de 176B en hardware de consumo de gama alta (dos RX 7900 XT de 20 GB) a 80,5-80,8 tokens por segundo con un motor propio (Strata), y porque expone abiertamente sus límites: la perplejidad en wikitext-2 empeora frente a alternativas (5,457 vs 5,240) y las categorías de código y lógica son débiles (1/3 en cada una) en la suite de 20 tareas. La model card indica que el modelo es solo para inglés y que el paso de entrenamiento 4000 fue descartado por no mejorar la puerta KLD.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer (derivada de Qwen3.8-Flash-Next) con expertos ternarios y tabla de n-gramas PLE |
| Parametros totales | 177.283.638.144 (176B nominales: 125B LM + 51,2B tabla n-gramas) |
| Parametros activos | 6B (modelo de lenguaje) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos TQ1_0_g128 (ternario base-3, 1,75 bpw, grupo 128); cuerpo Q6_K+Q8_0 (variante por defecto) o F16 (variante de fidelidad); tabla n-gramas Q4X160 (26,24 GB) o Q4_0 (28,8 GB) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); tres contenedores: 57,62 GB (por defecto), 60,17 GB (tabla Q4_0), 65,80 GB (cuerpo F16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-Flash-Next-FP8 y lo reempaqueta como un MoE con bancos de expertos ternarios en el contenedor base-3 TQ1_0_g128: cinco trits por byte más un campo de 2 trits y una escala de grupo fp16 cada 128 pesos (28 bytes por 128 pesos). La entropía de valores en {-1, 0, +1} es de 1,585 bpw, por lo que el sobrecoste del contenedor ronda el 10%. El cuerpo se mantiene en Q6_K+Q8_0 en la variante por defecto o en F16 en la variante de fidelidad. La tabla de n-gramas (PLE) de 51,2B parámetros se decodifica por fila en Q4X160.

El entrenamiento no usa imatrix ni corpus de calibración: en su lugar se añaden ramas de corrección de rank 512 sobre las salidas de atención y del bloque MoE, más deltas de router, entrenadas por destilación de salida contra el profesor con el cuantizador ternario Lloyd g128 desplegado en el bucle. Las correcciones van embebidas en el propio archivo (`adapter.embedded=true`) y se aplican en carga, sin necesidad de `--lora` ni sidecar. La puerta KLD de 48 capas arroja un valor medio de 0,5800, dominado por el ajuste del soporte top-512 (92,9% de esa masa); la extensión al paso 4000 se entrenó y se descartó por quedar plana o peor (0,5880).

## Capacidades

- Generación de texto conversacional en inglés, con modo de razonamiento largo (thinking) heredado del modelo base; la model card advierte que el 26% de los registros "think-harder" no emiten respuesta alguna bajo los límites de 700/2048 tokens del protocolo de evaluación.
- Razonamiento multi-paso y cadenas de pensamiento extensas, aunque con truncamiento frecuente en entornos con límites de tokens ajustados.
- Capacidad limitada en código y lógica: 1/3 en cada categoría de la suite de 20 tareas del autor.
- Soporte de tool calling y function calling: no disponible (no se documenta en la model card).
- Soporte de agentes: no disponible (no se documenta explícitamente).
- Multilingüe: no; solo inglés según el campo `language`.
- Capacidades especiales: expertos ternarios con correcciones entrenadas embebidas, tabla de n-gramas PLE integrada en el mismo archivo y decodificación por fila.

## Casos de uso

- Despliegue en hardware de consumo de gama alta: el archivo por defecto de 57,62 GB cabe en configuraciones con 64 GB de VRAM agregada o en sistemas con dos GPU de 20 GB repartiendo capas (26/22), como reporta el autor con dos RX 7900 XT.
- Inferencia de alto rendimiento con motor especializado: usando Strata sobre el archivo de 60,17 GB se alcanzan 80,5-80,8 tok/s en greedy con 128 tokens por petición, adecuado para servicios conversacionales con latencia objetivo de ~12,4 ms por token.
- Experimentación con cuantización ternaria: sirve como banco de pruebas para investigar contenedores base-3, correcciones entrenadas con cuantizador en el bucle y decodificación de tablas n-gramas, dado que el autor publica scripts de build y un fork del runtime.
- Evaluación comparativa de cuantizaciones: al existir múltiples builds del mismo modelo base (IQ4_NL de 102 GB, PQ2_0 de 92 GB, IQ3_S de 83,6 GB, IQ3_XXS de 75,8 GB, IQ2_XS de 68 GB, Q2_0 de 66,4 GB), permite A/B tests controlados con un mismo harness (HellaSwag 400, Winogrande 400, wikitext-2 PPL).
- Prototipado de asistentes conversacionales en inglés con contexto moderado: apropiado cuando la prioridad es reducir huella de memoria y no la perplejidad, aceptando el deterioro de wikitext-2 (5,457 frente a 5,240).
- Investigación sobre destilación de salida aplicada a cuantización: el enfoque de correcciones rank-512 más deltas de router, sin imatrix, es replicable con los scripts publicados en GitHub para estudiar el equilibrio entre tamaño y fidelidad.

## Benchmarks y rendimiento

| Benchmark | Scion-FlashNext-176B-A6B | ISTA Q2_0 (referencia del autor) |
|---|---|---|
| HellaSwag 400 | 82,00% | 81,50% |
| Winogrande 400 | 77,50% | 74,75% |
| wikitext-2 PPL | 5,457 | 5,240 |
| cap_eval (20 tareas) | 15/20, 0 errores de harness | no disponible |
| KLD medio (puerta 48 capas) | 0,5800 | no disponible |
| Generación (Strata, 2x RX 7900 XT) | 80,5-80,8 tok/s; 12,4 ms/token a contexto 4096 | no disponible |

La comparación HellaSwag es un empate en el test pareado según el autor; la de Winogrande es una señal positiva pero no concluyente. No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada: 57,62 GB para el archivo por defecto; 60,17 GB para la variante con tabla Q4_0; 65,80 GB para la variante con cuerpo F16. El repo completo ocupa 183,6 GB.
- GPU recomendadas: el autor reporta ejecución en dos RX 7900 XT de 20 GB cada una (reparto de capas 26/22) con el motor Strata; para llama.cpp se requiere un fork específico del runtime.
- Cabe en GPU de consumo: sí, en configuraciones multi-GPU de gama alta con al menos ~60 GB de VRAM agregada; no cabe en una única GPU de consumo de 24 GB.
- Opciones de despliegue: llama.cpp (fork prism-ml-llama.cpp en la rama qwen4exp-proto) y Strata (motor propio del autor). vLLM, TGI y Ollama no se documentan como compatibles.
- Latencia y throughput: 12,4 ms por token generado a contexto 4096, con 2,3-2,4 tokens por ventana de pipeline (`--pipeline-windows 2`, +62-68% frente al mismo motor sin pipeline). Protocolo: cuatro peticiones de un prompt fijo, temperatura 0, ejecución 1 de calentamiento y 2-4 reportadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano en disco | Licencia | Notas |
|---|---|---|---|---|---|
| Scion-FlashNext-176B-A6B | 176B (6B activos) | no disponible | 57,62 GB (por defecto) | apache-2.0 | Ternario 1,75 bpw + correcciones entrenadas |
| Qwen3.8-Flash-Next FP8 (base) | 176B | no disponible | 185,6 GB | apache-2.0 (heredada) | Release oficial en FP8 |
| ggml-org IQ4_NL | 176B | no disponible | 102 GB | apache-2.0 (heredada) | Cuantización de comunidad |
| Mooney PQ2_0 | 176B | no disponible | 92 GB | no disponible | Otra build ternaria |
| GSQ-RCO IQ3_S | 176B | no disponible | 83,6 GB | no disponible | Cuantización de comunidad |
| IQ3_XXS | 176B | no disponible | 75,8 GB | no disponible | Cuantización de comunidad |
| IQ2_XS | 176B | no disponible | 68 GB | no disponible | Cuantización de comunidad |
| GSQ-RCO Q2_0 | 176B | no disponible | 66,4 GB | no disponible | Cuantización de comunidad |
| ISTA coder IQ1_M (podado) | no disponible | no disponible | 58,4 GB | no disponible | Único archivo más pequeño, con poda de expertos |

## Limitaciones y advertencias

- Solo inglés: el campo `language` declara únicamente `en`; no hay soporte multilingüe documentado.
- Riesgo de alucinación: no cuantificado en la model card; la perplejidad elevada en wikitext-2 (5,457) sugiere mayor degradación de likelihood frente a cuantizaciones calibradas.
- Debilidad en código y lógica: 1/3 en ambas categorías de la suite de 20 tareas; no es adecuado como modelo principal para generación de código en producción.
- Razonamiento truncado: el 26% de los registros "think-harder" no emiten respuesta bajo los límites de 700/2048 tokens del protocolo de evaluación.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.8-Flash-Next debe verificarse por separado; la model card no detalla obligaciones adicionales de atribución.
- Requiere runtime específico (fork de llama.cpp o Strata); no es plug-and-play en vLLM, TGI u Ollama.
- La variante por defecto (57,62 GB) no está medida en el banco de pruebas del autor; las cifras de throughput corresponden al archivo de 60,17 GB.
- La comparación con ISTA Q2_0 muestra que los expertos ternarios a 1,75 bpw compran tamaño, no likelihood.

## Enlaces

- Hugging Face: https://huggingface.co/SkyIsNotGreen/Scion-FlashNext-176B-A6B
- Discusiones: https://huggingface.co/SkyIsNotGreen/Scion-FlashNext-176B-A6B/discussions
- GitHub (scripts de build y documentación): https://github.com/sky-is-green/scion
- Fork del runtime llama.cpp: https://github.com/sky-is-green/prism-ml-llama.cpp/tree/qwen4exp-proto
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next-FP8
- Documento de nombres de contenedor: `CONTAINER-NAMES.md` en el repo de Hugging Face
