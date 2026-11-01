# ryugyosoft/onwx-dash

## Resumen

onwx' (onwx-dash) es una aplicación de inferencia local para ejecutar modelos de lenguaje grandes (GGUF) en ordenadores con AMD Ryzen AI, combinando la GPU Radeon integrada con la NPU XDNA2 para acelerar la carga de prompt. No se distribuye como un modelo de pesos en sí, sino como un paquete de software (instaladores PowerShell y shell, más binarios de motor por GPU) publicado en HuggingFace bajo el identificador `ryugyosoft/onwx-dash`, con licencia Apache-2.0 y un tamaño de repositorio de 1,3 GB.

El proyecto deriva de la aplicación hermana `ryugyosoft/onwx` (dedicada a la NPU) y hasta la versión 0.6.1 se llamaba onwx-halo. Su motor es una adaptación de gufo, un motor de inferencia en C++20/HIP para Strix Halo, a partir del fork con soporte de NPU `mikealanni/gufo`. Está dirigido a dos familias de hardware concretas: Ryzen AI Max (Strix Halo, Radeon 8060S/8050S, gfx1151) y Ryzen AI 300 (Radeon 890M/880M, gfx1150).

La relevancia actual del proyecto radica en que ofrece una vía práctica para ejecutar modelos de 27B a 74B (incluidos MoE como Qwen3.6 35B-A3B y Nemotron 3.5 Bolt 74B-A9B) en equipos de consumo con memoria unificada, superando en velocidad de lectura de prompt a llama.cpp en las mismas condiciones de hardware y modelo, según las mediciones del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo de pesos: es un motor de inferencia (derivado de gufo, C++20/HIP) con decodificacion especulativa (MTP y draft models) y reparto GPU + NPU (XDNA2) |
| Parametros totales | No disponible (depende del GGUF cargado; soporta desde 27B hasta 74B-A9B) |
| Parametros activos | No disponible (los MoE soportados, Qwen3.6 35B-A3B y Nemotron 74B-A9B, activan 3B y 9B respectivamente, segun la nomenclatura de los modelos) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF: Q4_K_XL (UD), IQ4_XS, IQ3_XXS, IQ2_M, Q6_K (lectura nativa sin conversion a Q8_0 en kernel MoE), PQ2_0 (ternario); soporte de decodificacion especulativa con draft models |
| Idiomas soportados | No disponible (el modelo cargado determina los idiomas; la interfaz y documentacion estan en japones e ingles) |
| Licencia | Apache-2.0 (los modelos descargados conservan su propia licencia: Qwen y Ternary Bonsai Apache-2.0, Nemotron con licencia NVIDIA) |
| Formato de pesos | GGUF (modelos de terceros descargados por la aplicacion; el repositorio contiene instaladores y binarios del motor, no pesos) |

## Arquitectura y entrenamiento

El componente central es el motor `onwx_halo.dll`, una adaptacion para Windows y Linux del fork con soporte de NPU del motor gufo (MIT), escrito en C++20 sobre HIP/rocBLAS/hipBLASLt con el runtime Windows de AMD TheRock. Existe un binario distinto por GPU (gfx1151 para Ryzen AI Max, gfx1150 para Ryzen AI 300) y el instalador descarga solo el correspondiente al equipo. La tokenizacion y las plantillas de chat se construyen a partir de la metadatura interna del GGUF, con verificacion de que la secuencia de tokens coincide con la de llama.cpp.

El reparto de trabajo es asimetrico: la GPU Radeon ejecuta la inferencia y la NPU XDNA2 asiste en parte del calculo matricial de la carga de prompt. El autor documenta correcciones relevantes respecto al fork original: evitacion de un fallo de memoria al delegar una matriz completa a la NPU, alineacion exacta de los resultados de las filas calculadas por NPU (verificada por identidad de tokens con el modo GPU-only), y un cambio en la gestion de buffers compartidos en Linux para evitar page faults cuando otro proceso usa la GPU. Ademas, se incorporan optimizaciones propias: kernel MoE que lee Q6_K directamente (ahorro de unos 0,8 GB), soporte de GGUF IQ4/IQ3/IQ2, procesamiento agrupado de prompts cortos en MoE (lectura de preguntas de seguimiento entre 5 y 7 veces mas rapida) y asignacion de KV cache bajo demanda. No se dispone de informacion sobre datos de entrenamiento, ya que el repositorio no entrena ningun modelo.

## Capacidades

- Ejecucion local de LLM en formato GGUF sobre GPU Radeon integrada con asistencia de NPU XDNA2 para la fase de prompt.
- Decodificacion especulativa mediante MTP (multi-token prediction) y modelos draft, con incrementos medidos notables en generacion (por ejemplo, Qwen3.6 35B-A3B pasa de unos 57 a 84-93 tok/s en tareas de razonamiento y resumen).
- Soporte de modelos densos y MoE, incluidos Qwen3.6 35B-A3B, Qwen3.8 27B, NVIDIA Nemotron 3.5 Bolt 74B-A9B y Ternary Bonsai 2 27B.
- Interfaz de chat web en `http://localhost:8110/chat` y API compatible con OpenAI en `http://localhost:8110/v1`.
- Gestion de modelos desde la interfaz y la bandeja del sistema, con registro de carpetas alternativas donde ya residan los GGUF.
- Coexistencia con la aplicacion onwx (instalacion, configuracion y puerto de API independientes; puerto por defecto 8110).
- Migracion automatica de configuracion y modelos desde onwx-halo en el primer arranque.
- Instaladores para Windows (PowerShell) y Linux (Ubuntu 24.04 o posterior).
- No se documenta soporte de tool calling, vision, audio ni agentes multi-paso a nivel de la aplicacion; dichas capacidades dependerian del modelo GGUF cargado.

## Casos de uso

- Asistente de chat local sin conexion: el usuario descarga un GGUF (por ejemplo, Qwen3.6 35B-A3B en IQ4_XS, 18,2 GB) y conversa en `localhost:8110/chat`, manteniendo los datos en el equipo; adecuado para entornos con requisitos de privacidad.
- Backend compatible con OpenAI para herramientas existentes: la API en `/v1` permite apuntar clientes que hablan el protocolo OpenAI hacia el equipo local, sin reescribir integraciones.
- Razonamiento y resumen de documentos largos: con Qwen3.6 35B-A3B y MTP se alcanzan 84-93 tok/s en tareas de pensamiento y sintesis, y la lectura de prompts de miles de tokens ronda 2.200-3.000 tok/s en Ryzen AI Max+ 395.
- Generacion de codigo asistida: con Qwen3.8 27B mas el draft DFlash2 se miden 34-36 tok/s en codigo, suficiente para autocompletado interactivo en un portatil o mini-PC con Ryzen AI Max.
- Prototipado y evaluacion de modelos en hardware de consumo: el soporte de cuantizaciones IQ2/IQ3/IQ4 permite probar el mismo modelo en distintos tamanos (de 22,9 GB a 11,9 GB en Qwen3.6 35B-A3B) ajustando al presupuesto de memoria.
- Despliegue en equipos compactos con Ryzen AI 300: en un Ryzen AI 9 HX 470 con 64 GB DDR5-5600 se obtienen unos 24 tok/s en Qwen3.6 35B-A3B (28-32 con MTP), util para asistentes de escritorio y automatizacion de tareas de texto.
- Ejecucion de modelos MoE grandes en memoria unificada: Nemotron 3.5 Bolt 74B-A9B (22 GB mas draft de 0,95 GB) corre a unos 35 tok/s en Ryzen AI Max+ 395, habilitando tareas de razonamiento que normalmente exigirian GPU dedicada de gran VRAM.
- Comparacion de rendimiento entre backends: al usar los mismos GGUF que llama.cpp, sirve para medir el beneficio del reparto GPU+NPU en un equipo concreto antes de adoptarlo en produccion.

## Benchmarks y rendimiento

El autor publica mediciones de velocidad (no de calidad) comparando con llama.cpp (Vulkan y ROCm) sobre el mismo hardware y los mismos GGUF:

| Equipo | Modelo | Lectura de prompt | Generacion |
|---|---|---|---|
| Ryzen AI Max+ 395 (128 GB) | Qwen3.6 35B-A3B UD-Q4_K_XL (22,9 GB) | 2.200-3.000 tok/s | ~57 tok/s; 84-93 tok/s con MTP en razonamiento/resumen |
| Ryzen AI Max+ 395 (128 GB) | Qwen3.6 35B-A3B IQ4_XS (18,2 GB) | 2.100-3.000 tok/s | ~59 tok/s; ~84 tok/s con MTP |
| Ryzen AI Max+ 395 (128 GB) | Qwen3.6 35B-A3B IQ3_XXS (14,1 GB) | ~1.300 tok/s (solo GPU) | ~59 tok/s; ~83 tok/s con MTP |
| Ryzen AI Max+ 395 (128 GB) | Qwen3.6 35B-A3B IQ2_M (11,9 GB) | ~1.370 tok/s (solo GPU) | ~64 tok/s; ~82 tok/s con MTP |
| Ryzen AI Max+ 395 (128 GB) | Qwen3.8 27B Q4_K_XL + draft DFlash2 | 590-720 tok/s | ~11 tok/s; 34-36 tok/s en codigo con draft |
| Ryzen AI Max+ 395 (128 GB) | Nemotron 3.5 Bolt 74B-A9B (22,0 GB) + draft | 1.000-1.160 tok/s | ~35 tok/s; 55-89 tok/s con draft en razonamiento/resumen |
| Ryzen AI Max+ 395 (128 GB) | Ternary Bonsai 2 27B PQ2_0 (7,2 GB) + draft | 520-640 tok/s | 22-25 tok/s; 30-49 tok/s con draft |
| Ryzen AI 9 HX 470 (64 GB DDR5-5600) | Qwen3.6 35B-A3B | ~930 tok/s (2.000 tok.) y ~1.110 tok/s (4.000-8.000 tok.) con NPU; 880-970 solo GPU | ~24 tok/s; 28-32 tok/s con MTP |
| Ryzen AI 9 HX 470 (64 GB DDR5-5600) | Nemotron 3.5 Bolt 74B-A9B | ~250 tok/s (2.000 tok.) y ~380 tok/s (4.000-8.000 tok.) con NPU; 240-260 solo GPU | ~14 tok/s (dato truncado en la fuente) |

Relacion frente a llama.cpp indicada por el autor: en Ryzen AI 300, la lectura de prompt con solo GPU es aproximadamente 2,0-2,7 veces la de llama.cpp (version mas rapida) para Qwen3.6 y 1,2 veces para Nemotron; con asistencia de NPU, 1,15 veces mas para Qwen3.6 y 1,5 veces para Nemotron. En Ryzen AI Max, la lectura de prompt con solo GPU es 1,6-1,9 veces la de llama.cpp, con mejoras adicionales en prompts largos al sumar la NPU. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- GPU y plataforma: exclusivamente AMD Ryzen AI Max (Strix Halo, Radeon 8060S/8050S, gfx1151) y Ryzen AI 300 (Radeon 890M/880M, gfx1150); no hay soporte documentado para otras GPU.
- Memoria: los GGUF soportados ocupan entre 7,2 GB (Ternary Bonsai 2 27B PQ2_0) y 22,9 GB (Qwen3.6 35B-A3B UD-Q4_K_XL), mas drafts de 0,95-1,1 GB; las mediciones se hicieron en equipos con 128 GB (Ryzen AI Max+ 395) y 64 GB DDR5-5600 (Ryzen AI 9 HX 470).
- VRAM estimada: no disponible como cifra separada, ya que la plataforma usa memoria unificada; el tamano del archivo GGUF mas el draft y el KV cache determinan el consumo.
- GPU de escritorio dedicada (A100, H100, RTX 4090): no soportadas por este motor; la aplicacion esta ligada a las iGPU Radeon de Ryzen AI.
- Despliegue: instalador PowerShell en Windows y script shell en Linux (Ubuntu 24.04 o posterior); interfaz de chat y API OpenAI en el puerto 8110; no se documenta integracion con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ver la tabla de benchmarks; la lectura de prompt va de ~250 tok/s (Nemotron en Ryzen AI 300) a ~3.000 tok/s (Qwen3.6 en Ryzen AI Max+ 395), y la generacion de ~11 tok/s (Qwen3.8 27B sin draft) a 84-93 tok/s (Qwen3.6 con MTP).

## Comparativa con modelos similares

| Solucion | Plataforma | Contexto | Rendimiento (mismo hardware y GGUF) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| onwx-dash | Ryzen AI Max y Ryzen AI 300 (GPU + NPU) | No disponible | Lectura de prompt 1,6-2,7x llama.cpp; generacion con MTP/draft hasta 84-93 tok/s | Apache-2.0 | HuggingFace, 0 descargas |
| llama.cpp (Vulkan/ROCm) | Multiplataforma, GPU AMD/NVIDIA | Configurable por el usuario | Referencia base de la comparacion | MIT | Ampliamente adoptado |
| onwx (aplicacion hermana) | Ryzen AI, enfocada en NPU | No disponible | No disponible | No disponible en la informacion | HuggingFace (ryugyosoft/onwx) |
| gufo (motor original y fork) | Strix Halo, Linux (fork con NPU) | No disponible | No disponible | MIT | GitHub (gufo-org/gufo, mikealanni/gufo) |

## Limitaciones y advertencias

- No es un modelo: el repositorio contiene instaladores y binarios del motor (1,3 GB); los pesos se descargan de repositorios de terceros y quedan sujetos a sus licencias (Qwen y Ternary Bonsai Apache-2.0; Nemotron bajo licencia NVIDIA).
- Compatibilidad de hardware muy restringida: solo iGPU Radeon de Ryzen AI Max (gfx1151) y Ryzen AI 300 (gfx1150); no funciona en GPU dedicadas ni en plataformas Intel/NVIDIA.
- Dependencia de drivers y runtime especificos: runtime HIP de AMD TheRock en Windows y driver NPU XRT; el autor documenta fallos historicos de page fault y corrupcion de memoria en el fork original, corregidos pero indicativos de la madurez del codigo.
- La asistencia de NPU depende del hardware y del driver; en Linux solo esta disponible desde la version 0.7.1 y el soporte NPU del fork era originalmente exclusivo de Linux.
- Sin datos publicados de calidad (benchmarks tipo MMLU, HumanEval o GSM8K); las cifras son de velocidad y medidas por el autor, no verificadas de forma independiente.
- Las cuantizaciones IQ3_XXS e IQ2_M reducen la calidad de forma perceptible (el autor senala que IQ2_M es claramente inferior), por lo que su uso en produccion exige validacion propia.
- Proyecto con 0 descargas y 0 likes en el momento de la consulta, creado el 30 de octubre de 2026 y actualizado el 1 de noviembre de 2026: madurez y mantenimiento a largo plazo no verificables.
- La documentacion esta en japones e ingles; no se declaran idiomas soportados para los modelos, que dependen del GGUF cargado.
- Riesgo de alucinacion y sesgos: inherentes a los modelos subyacentes; la aplicacion no incorpora capas de moderacion o filtrado documentadas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ryugyosoft/onwx-dash
- README en ingles: https://huggingface.co/ryugyosoft/onwx-dash/blob/main/README_en.md
- Aplicacion hermana onwx (NPU): https://huggingface.co/ryugyosoft/onwx
- Instalador Windows: https://huggingface.co/ryugyosoft/onwx-dash/resolve/main/install.ps1
- Instalador Linux: https://huggingface.co/ryugyosoft/onwx-dash/resolve/main/install.sh
- Motor gufo original: https://github.com/gufo-org/gufo
- Fork de gufo con soporte NPU: https://github.com/mikealanni/gufo
- Issue ROCm/TheRock#9639: https://github.com/ROCm/TheRock/issues/9639
- Qwen3.6 35B-A3B MTP GGUF (unsloth): https://huggingface.co/unsloth/Qwen3.6-35B-A3B-MTP-GGUF
- Qwen3.8 27B GGUF (unsloth): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Draft Qwen3.8 27B DFlash2 GGUF: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2-GGUF
- NVIDIA Nemotron 3.5 Bolt 74B-A9B GGUF: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-GGUF
- Ternary Bonsai 2 27B GGUF: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
