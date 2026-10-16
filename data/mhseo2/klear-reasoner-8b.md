# mhseo2/Klear-Reasoner-8B

## Resumen

Klear-Reasoner-8B es un modelo de razonamiento de 8.190.735.360 parametros (8,19 B) desarrollado por Kwai-Klear y publicado bajo licencia Apache 2.0. La ficha que se analiza aqui corresponde al repositorio `mhseo2/Klear-Reasoner-8B`, una copia del modelo original `Kwai-Klear/Klear-Reasoner-8B`, cuyo punto de partida es el checkpoint `Kwai-Klear/Klear-Reasoner-8B-SFT`. El modelo esta especializado en matematicas y generacion de codigo con cadenas de razonamiento largas (long chain-of-thought) y declara un rendimiento de 90,5 % en AIME 2024 y 83,2 % en AIME 2025 cuando se amplia el presupuesto de inferencia a 64K tokens.

Su relevancia tecnica reside en el metodo de entrenamiento por refuerzo propuesto por sus autores, GPPO (Gradient-Preserving clipping Policy Optimization), que se presenta como alternativa a los esquemas de recorte (clipping) habituales en PPO: en lugar de descartar el gradiente de los tokens recortados, GPPO lo retropropaga de forma atenuada para conservar senal de exploracion. El modelo combina una fase de SFT sobre cadenas de razonamiento largas destiladas de DeepSeek-R1-0528 con una fase posterior de RL sobre subconjuntos de matematicas (30K ejemplos) y codigo (15K ejemplos).

Segun la etiqueta `qwen3` del repositorio, la arquitectura subyacente es de tipo transformer denso de la familia Qwen3, aunque la model card no detalla la configuracion de capas, cabezas de atencion ni longitud de contexto nativa. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y solo declara soporte para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Qwen3 (segun etiqueta `qwen3` del repositorio); detalles de configuracion no disponibles |
| Parametros totales | 8.190.735.360 (8,19 B), dato real de los pesos safetensors |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible de forma explicita. La model card menciona ampliacion del presupuesto de inferencia a 64K tokens mediante YaRN con factor de escala 2,5 |
| Tipos de cuantizacion | No disponible. El repositorio solo contiene pesos en safetensors; no se publican versiones GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | Ingles (`en`), unico idioma declarado en la model card y en las etiquetas |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (tamano del repositorio: 16,4 GB) |

## Arquitectura y entrenamiento

La informacion disponible no describe en detalle la arquitectura interna mas alla de la etiqueta `qwen3`, que situa el modelo en la familia Qwen3 de transformers densos con atencion por consultas agrupadas (GQA) y atencion causal estandar. Tampoco se especifican el numero de capas, la dimension oculta, el numero de cabezas ni la composicion exacta del corpus de preentrenamiento. Lo que si se documenta es el proceso de ajuste en dos etapas: primero un SFT centrado en calidad y cadenas de razonamiento largas destiladas de DeepSeek-R1-0528 (el checkpoint resultante es `Klear-Reasoner-8B-SFT`), y despues una fase de RL sobre datos de matematicas y codigo.

La innovacion principal es GPPO, descrito en el paper CE-GPPO (arXiv:2508.07629). El metodo aborda dos problemas de los mecanismos de clipping en RL: que el recorte suprime senales de exploracion criticas y que ignora trayectorias suboptimas. GPPO retropropaga de forma suave el gradiente de los tokens recortados, lo que segun los autores mejora la exploracion y la convergencia frente a DAPO y variantes estandar. El entrenamiento se ejecuta sobre la receta DAPO con soporte multi-nodo mediante Ray; para la parte de codigo se usa un entorno de sandbox con Firejail, control multiproceso con Pebble para reclamar recursos en caso de timeout, y `math_verify` para la validacion de respuestas matematicas. Los conjuntos de datos de RL son publicos: `Kwai-Klear/KlearReasoner-MathSub-30K` (30.000 ejemplos) y `Kwai-Klear/KlearReasoner-CodeSub-15K` (15.000 ejemplos). No se documenta el uso de RLHF con preferencias humanas ni de DPO.

## Capacidades

- Razonamiento matematico de competicion: el modelo genera cadenas de razonamiento largas y alcanza 90,5 % en AIME 2024 y 83,2 % en AIME 2025 con presupuesto de 64K tokens.
- Generacion y resolucion de codigo: resultados de 66,0 % en LiveCodeBench V5 y 58,1 % en LiveCodeBench V6 (avg@8) con el mismo presupuesto ampliado.
- Modo de razonamiento extendido: la evaluacion con 64K tokens y YaRN demuestra capacidad de mantener deliberacion larga antes de emitir la respuesta final.
- Razonamiento de varios pasos en problemas de competicion tipo HMMT 2025 (70,8 % avg@64 en la configuracion ampliada).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y uso de herramientas externas: no disponibles en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles, unico idioma declarado.
- Vision, audio u otras modalidades: no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Resolucion de problemas matematicos de nivel competicion: el modelo esta ajustado especificamente sobre 30.000 ejemplos de matematicas con cadenas de razonamiento largas, por lo que encaja en tutoria automatizada, generacion de problemas y verificacion de soluciones paso a paso.
- Generacion de codigo en pipelines de evaluacion automatica: sus resultados en LiveCodeBench (61,6 % en V5 con presupuesto estandar) lo hacen util para prototipado de funciones y parcheo de codigo en entornos con tests automatizados.
- Aumento de datos sinteticos de razonamiento: puede emplearse para generar trazas de chain-of-thought largas que alimenten el entrenamiento de modelos mas pequenos, dado que su SFT procede precisamente de destilacion de DeepSeek-R1-0528.
- Agente de resolucion de ejercicios con verificacion externa: combinado con un interprete de Python y una libreria de validacion como `math_verify` (usada por los propios autores), puede cerrar el bucle entre generacion y comprobacion de resultados.
- Analisis de codigo con contexto largo: con el presupuesto ampliado a 64K tokens es posible procesar ficheros o diffs extensos y razonar sobre ellos antes de responder, siempre que se aplique la configuracion YaRN descrita.
- Investigacion en tecnicas de RL: el repositorio incluye scripts de entrenamiento (`recipe/dapo/perf_run_dapo_ours_math.sh` y `perf_run_dapo_ours_code.sh`) y soporte Ray multi-nodo, lo que permite reproducir y extender el metodo GPPO en matematicas y codigo.
- Evaluacion comparativa de modelos de razonamiento: sirve como referencia de 8B para medir la brecha frente a destilados de DeepSeek-R1 y modelos de la misma escala en AIME, HMMT y LiveCodeBench.

## Benchmarks y rendimiento

Resultados de `pass@1` con temperatura 0,6 y top_p 0,95, siguiendo el marco de evaluacion de DeepSeek-R1. La fila con presupuesto de 64K aplica YaRN con factor 2,5 y `avg@64` en matematicas y `avg@8` en codigo.

| Modelo | AIME 2024 | AIME 2025 | HMMT 2025 | LCB V5 | LCB V6 |
|---|---|---|---|---|---|
| Klear-Reasoner-8B (presupuesto 64K) | 90,5 | 83,2 | 70,8 | 66,0 | 58,1 |
| Klear-Reasoner-8B (presupuesto estandar) | 83,2 | 75,6 | 60,3 | 61,6 | 53,1 |
| Klear-Reasoner-8B-SFT | 75,6 | 70,1 | 57,6 | 58,5 | 49,6 |
| DeepSeek-R1-0528-Distill-8B | 86,0 | 76,3 | 61,5 | 61,0† | 51,6† |
| OpenReasoning-Nemotron-7B | 84,7 | 78,2 | 63,5 | 65,6† | 56,3† |
| Qwen3-8B | 76,0 | 67,3 | 44,7† | 57,5 | 48,4† |
| POLARIS-4B-Preview | 81,2 | 79,4 | 58,7 | 58,5† | 53,0† |
| AceReason-Nemotron-1.1-7B | 72,6 | 64,8 | 42,9 | 57,2 | 52,1 |
| MiMo-7B-RL | 68,2 | 55,4 | 35,7 | 57,8 | 49,3 |
| Skywork-OR1-7B | 70,2 | 54,6 | 35,7 | 47,6 | 42,7 |
| AReal-boba-RL-7B | 61,9 | 48,3 | 29,4 | 34,3 | 31,0† |

Las metricas de matematicas corresponden a `avg@64` y las de codigo a `avg@8`. El simbolo † reproduce una marca presente en la tabla original cuyo significado no se especifica en la informacion proporcionada. La tabla de resumen al inicio de la model card presenta los valores de la fila de 64K (90,5 / 83,2 / 66,0 / 58,1) como resultado SOTA del modelo, mientras que la tabla detallada distingue entre presupuesto estandar y ampliado; conviene tener en cuenta esa diferencia al comparar cifras.

## Requisitos de hardware

Estimaciones calculadas a partir del numero de parametros (8,19 B) y del tamano del repositorio (16,4 GB en safetensors); la model card no publica cifras oficiales de VRAM, latencia ni throughput.

- Pesos en precision de entrenamiento: aproximadamente 16,4 GB en BF16/FP16, lo que exige un acelerador con al menos 20-24 GB de VRAM sumando activaciones y cache KV.
- Cuantizacion a 8 bits: alrededor de 8-9 GB de pesos; cuantizacion a 4 bits: en torno a 5-6 GB de pesos. No hay versiones GGUF, AWQ, GPTQ ni FP8 publicadas en este repositorio, por lo que habria que generarlas.
- GPU recomendadas: H100 o A100 80 GB para entrenamiento y para inferencia a 64K de contexto con lotes grandes; A100 40 GB o L40S para inferencia en BF16 con contexto moderado.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB permite inferencia en BF16 con contexto corto y lotes pequenos; con cuantizacion de 4-8 bits es viable en GPUs de 12-16 GB (RTX 4080, 4070 Ti, 3080).
- Cache KV: no se dispone del dato exacto en la informacion proporcionada; a 64K de contexto la cache puede anadir varios GB adicionales, por lo que conviene reservar VRAM extra sobre el calculo de pesos.
- Opciones de despliegue: vLLM, SGLang o TGI para safetensors en BF16; llama.cpp u Ollama solo si se generan previamente pesos GGUF, que no existen en el repositorio. Los autores emplean Ray para entrenamiento multi-nodo y sandbox Firejail para ejecucion de codigo.
- Latencia y throughput: no disponibles. Hay que considerar que el modo de razonamiento largo genera muchos mas tokens de salida que un modelo estandar, lo que incrementa el coste por consulta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AIME 2025 | LCB V5 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Klear-Reasoner-8B | 8,19 B | 64K con YaRN (nativa no disponible) | 83,2 | 66,0 | Apache 2.0 | HuggingFace (original y copia `mhseo2`) |
| Qwen3-8B | ~8 B | No disponible en la informacion | 67,3 | 57,5 | Apache 2.0 (segun la familia Qwen3) | HuggingFace |
| DeepSeek-R1-0528-Distill-8B | ~8 B | No disponible en la informacion | 76,3 | 61,0 | No disponible en la informacion | HuggingFace |
| OpenReasoning-Nemotron-7B | 7 B | No disponible en la informacion | 78,2 | 65,6 | No disponible en la informacion | HuggingFace |

Frente a los tres alternativas de 7-8 B, Klear-Reasoner-8B obtiene la mejor puntuacion en AIME 2025 y en LiveCodeBench V5 con el presupuesto de 64K, y queda por debajo de OpenReasoning-Nemotron-7B y DeepSeek-R1-0528-Distill-8B en AIME 2024 en la configuracion estandar. La comparacion no es homogenea: los resultados de Klear-Reasoner con 64K se obtienen con un presupuesto de inferencia mucho mayor y con YaRN, lo que no se documenta en los modelos de contraste.

## Limitaciones y advertencias

- Riesgo de alucinacion: es un modelo de razonamiento especializado en matematicas y codigo; fuera de ese dominio no hay datos de evaluacion que respalden su fiabilidad.
- Sesgos conocidos: no se documentan analisis de sesgo, toxicidad ni evaluaciones de seguridad en la informacion proporcionada.
- Idioma: solo se declara ingles (`en`). No hay evidencia publicada de rendimiento en castellano ni en otros idiomas, aunque la familia base Qwen3 sea multilingue.
- Contexto: la longitud de contexto nativa no se especifica. Las cifras de 64K dependen de aplicar YaRN con factor 2,5 y de un presupuesto de inferencia elevado; sin esa configuracion el rendimiento cae (por ejemplo, de 90,5 a 83,2 en AIME 2024).
- Coste de inferencia: el modo de razonamiento largo multiplica los tokens generados, lo que encarece el despliegue en produccion y aumenta la latencia.
- Cuantizaciones: no se publican pesos GGUF, AWQ, GPTQ ni FP8, lo que limita el despliegue en hardware de consumo sin conversion previa.
- Repositorio de origen: la ficha corresponde a `mhseo2/Klear-Reasoner-8B`, una copia con 0 descargas y 0 likes y sin validacion adicional respecto al repositorio oficial `Kwai-Klear/Klear-Reasoner-8B`. Para produccion conviene usar el repositorio oficial y verificar la integridad de los pesos.
- Reproducibilidad de benchmarks: la propia model card indica "Evaluation is coming soon" para algunos resultados, y los enlaces a GitHub aparecen con dos rutas distintas (`suu990901/KlearReasoner` y `Kwai-Klear990901/Klear_Reasoner`), lo que puede complicar la reproduccion exacta.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se cite el trabajo original.
- Fecha del repositorio: la fecha de creacion indicada (2026-10-16) es posterior a la fecha de consulta habitual, lo que sugiere un posible error de metadatos en la plataforma.

## Enlaces

- Modelo en HuggingFace (copia analizada): https://huggingface.co/mhseo2/Klear-Reasoner-8B
- Modelo original: https://huggingface.co/Kwai-Klear/Klear-Reasoner-8B
- Checkpoint base del SFT: https://huggingface.co/Kwai-Klear/Klear-Reasoner-8B-SFT
- Paper CE-GPPO: https://arxiv.org/pdf/2508.07629
- Paper adicional (referenciado en las etiquetas): https://arxiv.org/abs/2509.20712
- Pagina del paper en HuggingFace: https://huggingface.co/papers/2508.07629
- Dataset de RL de matematicas: https://huggingface.co/datasets/Kwai-Klear/KlearReasoner-MathSub-30K
- Dataset de RL de codigo: https://huggingface.co/datasets/Kwai-Klear/KlearReasoner-CodeSub-15K
- Repositorio de codigo de entrenamiento: https://github.com/Kwai-Klear990901/Klear_Reasoner
- Repositorio de evaluacion e issues: https://github.com/suu990901/KlearReasoner
- Issues y discusiones: https://github.com/suu990901/KlearReasoner/issues
- Firejail (sandbox usado en el entrenamiento): https://github.com/netblue30/firejail
- Pebble (control multiproceso): https://github.com/noxdafox/pebble
- math_verify (validacion de respuestas matematicas): https://github.com/huggingface/Math-Verify
- Contacto indicado en la model card: suzhenpeng13@163.com
- Nota sobre la busqueda web: los resultados devueltos no contienen informacion relacionada con el modelo (corresponden a recetas de pasta), por lo que no se han incluido enlaces adicionales procedentes de esa busqueda.
