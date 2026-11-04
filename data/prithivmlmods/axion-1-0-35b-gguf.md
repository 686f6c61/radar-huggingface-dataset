# prithivMLmods/Axion-1.0-35B-GGUF

## Resumen

Axion-1.0-35B-GGUF es la versión cuantizada en formato GGUF del checkpoint Axion-1.0-35B, un modelo de lenguaje de arquitectura Mixture of Experts (MoE) con 34.660.610.688 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token. Lo publica el usuario prithivMLmods como reproducción bajo licencia Apache-2.0 del modelo Axion 1.0, siguiendo la receta descrita en el artículo "Axion 1.0: Open Agent Foundation Models, Simplified". El modelo base pertenece a la organización Axion1-0 y está orientado a razonamiento científico, búsqueda de información y resolución de problemas con uso de herramientas.

El interés de esta ficha reside en que combina un tamaño de 35B con un coste de inferencia propio de un modelo de 3B activos, lo que permite desplegarlo en hardware relativamente modesto si se aceptan cuantizaciones agresivas. La versión GGUF incluye ocho ficheros con distintos esquemas de cuantización, desde BF16 completo (69,4 GB) hasta MXFP4_MOE (19,8 GB), este último optimizado para aceleradores NVIDIA Blackwell con soporte nativo de FP4.

La relevancia actual viene dada por dos factores: por un lado, el ecosistema llama.cpp permite ejecutar el modelo en GPU de consumo y en servidores con `llama-cli` o `llama-server`; por otro, el modelo declara capacidades de agent, tool-use y razonamiento científico con resultados publicados en benchmarks como HLE, BMB, SEAL-0, HiPhO y FrontierScience. El repositorio tiene 199,4 GB de tamaño total y, en el momento de la consulta, registra 0 descargas y 1 like.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) tipo transformer, familia Qwen3.5 según los tags del repositorio (`qwen3_5_moe`) |
| Parametros totales | 34.660.610.688 (34,66B) |
| Parametros activos | Aproximadamente 3B (denominación A3B en los tags) |
| Longitud de contexto | No disponible en la información proporcionada; la prueba de rendimiento del autor usa 16.384 tokens |
| Tipos de cuantizacion | BF16, MXFP4_MOE, Q3_K_L, Q3_K_M, Q4_K_M, Q5_K_M, Q6_K; fichero mmproj-bf16 para proyección multimodal |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (generado con llama.cpp); el modelo base se publica en BF16 |

## Arquitectura y entrenamiento

El modelo es un transformer con mezcla de expertos (MoE) de 34,66B parámetros totales y unos 3B activos por token, lo que reduce el coste computacional de cada paso de decodificación frente a un modelo denso del mismo tamaño. Los tags del repositorio lo identifican como perteneciente a la familia `qwen3_5_moe` y mencionan también las variantes Qwen3.5, Qwen3.6 y Qwen3.8, si bien no se detalla en la información disponible qué diferencias concretas hay entre ellas ni qué componentes exactos reutiliza Axion.

El entrenamiento se describe en tres etapas: aproximadamente 18.000 ejemplos de SFT orientados a razonamiento e investigación, seguidos de aprendizaje por refuerzo sobre trayectorias de agente. El conjunto de datos asociado es `Axion1-0/axion-training-data`. No se especifica el número total de tokens de preentrenamiento, la composición del corpus ni si hubo fases adicionales de DPO o RLHF más allá del RL sobre trayectorias. Tampoco se detallan innovaciones de inferencia como decodificación especulativa: de hecho, la prueba de rendimiento publicada indica explícitamente "Speculative Decoding: No".

## Capacidades

- Generación de texto conversacional en inglés, con soporte de plantillas de chat a través de `transformers` y llama.cpp.
- Razonamiento científico, orientado a problemas de física, matemáticas y ciencias naturales (los tests del autor incluyen problemas de cinemática, caudal, edades y combinatoria).
- Búsqueda de información y resolución de problemas con aumento de herramientas (tool-augmented problem solving).
- Soporte de agentes y tool calling / function calling, con evaluación que requiere un arnés de ejecución externo según la model card.
- Razonamiento multi-paso sobre trayectorias de agente, derivado del entrenamiento con RL sobre trayectorias.
- Capacidad multimodal potencial: el repositorio incluye un fichero `mmproj-bf16.gguf` de 903 MB descrito como proyección visión-lenguaje, aunque la model card no documenta tareas de visión ni ejemplos de uso.
- Capacidades multilingües limitadas: el campo `language` solo declara inglés.

## Casos de uso

- Asistente de investigación científica: el modelo puede descomponer problemas de física o matemáticas en pasos intermedios y verificar resultados, aprovechando su entrenamiento específico en razonamiento científico y sus resultados en FrontierScience Olympiad (85,0) y SEAL-0 (60,4).
- Agente con acceso a herramientas en pipelines de análisis: mediante tool calling, el modelo puede invocar APIs de búsqueda, calculadoras o bases de datos para resolver consultas que requieran información externa, un escenario para el que fue entrenado con RL sobre trayectorias.
- Generación y revisión de código en entornos de desarrollo: los tests publicados incluyen inserción de nodos en listas enlazadas, lo que sugiere utilidad para tareas algorítmicas; puede integrarse en asistentes de IDE o revisores automáticos de parches.
- Tutoría técnica automatizada: con conversaciones multi-turno y contexto de hasta 16.384 tokens en la configuración probada, puede mantener el hilo de un problema largo y corregir al usuario paso a paso.
- Despliegue en servidores con GPU Blackwell: la cuantización MXFP4_MOE (19,8 GB) permite servir el modelo con `llama-cli` o `llama-server` en una RTX PRO 6000 con 96 GB, con un pico de VRAM de 19,07 GiB y 211,70 tokens/s de generación según la prueba del autor.
- Evaluación de agentes en investigación: al ser una reproducción Apache-2.0 con benchmarks publicados, sirve como baseline reproducible para comparar estrategias de prompting, arneses de tool-use y técnicas de razonamiento multi-paso.
- Procesamiento por lotes en CPU o GPU modesta: las cuantizaciones Q3_K_M (16,8 GB) y Q4_K_M (21,2 GB) permiten ejecutar el modelo en estaciones de trabajo con 24 GB de VRAM o en servidores sin aceleradores de última generación.

## Benchmarks y rendimiento

Resultados declarados en la model card del autor:

| Benchmark | Axion-1.0-35B |
|---|---|
| HLE | 52,8 |
| BMB | 35,3 |
| SEAL-0 | 60,4 |
| HiPhO | 45,9 |
| FrontierScience Olympiad | 85,0 |
| FrontierScience Research | 55,0 |

Según la model card, estos valores siguen de cerca los del artículo original y sitúan al modelo líder en la tabla comparativa en SEAL-0, con buen rendimiento en HiPhO y FrontierScience Olympiad, pero por detrás de los mejores modelos en HLE, BMB y FrontierScience Research. No se proporcionan los valores de los modelos comparados en esa tabla, por lo que no es posible reproducir la comparación completa.

Prueba de inferencia publicada (MXFP4_MOE, RTX PRO 6000 Blackwell, 96 GB VRAM, `llama-cli`, `-ngl 99`, contexto 16.384, KV cache `q8_0`, semilla 42, 5 ejecuciones):

| Métrica | Valor |
|---|---|
| Velocidad media de procesamiento de prompt | 238,50 tokens/s |
| Velocidad media de generación | 211,70 tokens/s |
| Tiempo total | 86,1 s |
| VRAM pico | 19,07 GiB |
| Utilización de GPU pico | 87% |

## Requisitos de hardware

- VRAM estimada según cuantización: BF16 ≈ 69,4 GB; Q6_K ≈ 28,5 GB; Q5_K_M ≈ 24,7 GB; Q4_K_M ≈ 21,2 GB; MXFP4_MOE ≈ 19,8 GB; Q3_K_L ≈ 18,1 GB; Q3_K_M ≈ 16,8 GB. Hay que sumar la KV cache, que crece con el contexto.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell (96 GB) para MXFP4_MOE con offload completo; A100 80 GB o H100 para BF16; RTX 4090 (24 GB) para Q4_K_M o Q5_K_M con contexto moderado.
- Cabe en GPU de consumo: sí, con cuantizaciones Q3_K_M, Q4_K_M y Q5_K_M en tarjetas de 24 GB (RTX 3090, RTX 4090, RTX 5090) si se limita el contexto; Q6_K y BF16 requieren 32 GB o más.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (a partir del GGUF), y vLLM con endpoint compatible con OpenAI para el modelo base en BF16; también `text-generation-inference` según los tags.
- Latencia y throughput: 238,50 tokens/s de prompt y 211,70 tokens/s de generación en la configuración MXFP4_MOE descrita; no hay datos publicados para otras cuantizaciones ni para CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Axion-1.0-35B | 34,66B | ~3B | No disponible | Apache-2.0 | GGUF, BF16 | Reproducción con benchmarks públicos (HLE 52,8, SEAL-0 60,4) |
| Modelos densos de ~30B de la familia Qwen | No disponible | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificados en la información proporcionada |
| Modelos MoE de ~30B con ~3B activos de otras familias | No disponible | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificados en la información proporcionada |

No se han proporcionado en la información disponible los datos concretos de los modelos con los que el autor compara en su tabla, por lo que la comparativa cuantitativa no puede completarse sin inventar cifras.

## Limitaciones y advertencias

- Idiomas: solo se declara inglés; el rendimiento en castellano no está documentado y probablemente sea inferior.
- Contexto: no se especifica la longitud máxima de contexto del modelo; la prueba publicada usa 16.384 tokens, que puede no ser el límite real.
- Alucinación: como todo modelo generativo, puede producir afirmaciones falsas, especialmente en dominios científicos donde el entrenamiento con RL sobre trayectorias no garantiza veracidad factual.
- Tool use: la evaluación de uso de herramientas requiere un arnés de ejecución externo; el modelo no ejecuta herramientas por sí mismo.
- Visión: aunque se incluye un fichero `mmproj-bf16.gguf`, la model card no documenta tareas multimodales ni ejemplos, por lo que su funcionalidad real no está verificada.
- Licencia: Apache-2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base `Axion1-0/Axion-1.0-35B` y de los datos de entrenamiento.
- Madurez: el repositorio tiene 0 descargas y 1 like en el momento de la consulta, y fue creado el 4 de noviembre de 2026; es un artefacto reciente sin validación independiente conocida.
- Rendimiento: los datos de throughput corresponden a una única GPU (RTX PRO 6000 Blackwell) y a una configuración concreta; no son extrapolables a otras cuantizaciones ni a CPU.
- Sesgos: no se documentan sesgos específicos ni procesos de mitigación en la información disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/prithivMLmods/Axion-1.0-35B-GGUF
- Modelo base: https://huggingface.co/Axion1-0/Axion-1.0-35B
- Dataset de entrenamiento: https://huggingface.co/datasets/Axion1-0/axion-training-data
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Perfil del autor de la cuantización: https://huggingface.co/prithivMLmods
