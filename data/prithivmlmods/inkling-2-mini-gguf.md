# prithivMLmods/Inkling-2-Mini-GGUF

## Resumen

Inkling-2-Mini es un modelo multimodal autoregresivo de tipo transformer con bucles ("looped transformer") desarrollado por Thinking Machines Lab, Inc. y publicado el 20 de noviembre de 2026 bajo licencia Apache 2.0. Con 26.400 millones de parametros totales y 3.400 millones activos (5.400 millones efectivos por token), esta disenado para despliegue local en entornos con recursos moderados, procesando tanto texto como imagenes. La version aqui descrita es la cuantizacion GGUF publicada por prithivMLmods, que facilita su ejecucion en llama.cpp, Ollama y otros runners compatibles.

Su arquitectura combina una mezcla de expertos (MoE) dispersa de 24 capas que enruta cada token a 8 de 128 expertos por capa, con atencion hibrida local/global. La innovacion principal es la reutilizacion de las 12 capas centrales tres veces con pesos compartidos, alcanzando 48 aplicaciones de capa por token. Incorpora una ventana de contexto de 1 millon de tokens y se distribuye originalmente como un checkpoint compacto de ~20 GB en formato mixto NVFP4/MXFP8, pensado para equipos Apple Silicon de 32 GB o mas, GPUs individuales y NVIDIA DGX Spark.

El modelo resulta relevante porque ofrece capacidades de razonamiento, codigo y comprension documental cercanas al estado del arte (79,2% en SWEBench Verified, 92,8% en OmniDocBench v1.6) en un paquete que cabe en hardware de consumo y con licencia permisiva para uso comercial. La version GGUF amplia el acceso a estos pesos a traves de cuantizaciones desde 2 hasta 8 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo con bucles, MoE dispersa (24 capas, 8 de 128 expertos por capa), atencion hibrida local/global |
| Parametros totales | 26.070.385.152 (~26,4 B) |
| Parametros activos | 3,4 B activos; 5,4 B efectivos por token |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | BF16, MXFP4_MOE, Q2_K, Q3_K_L, Q3_K_M, Q4_0, Q4_K_M, Q4_K_S, Q5_0, Q5_K_M, Q5_K_S, Q6_K, Q8_0; proyector multimodal en BF16 y Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); checkpoint original en NVFP4/MXFP8 mixto |

## Arquitectura y entrenamiento

Inkling-2-Mini es un transformer autoregresivo con bucles que combina una MoE dispersa con atencion hibrida local/global. Cada una de las 24 capas enruta los tokens a 8 de 128 expertos, lo que mantiene el coste computacional por token bajo (3,4 B activos) pese a los 26,4 B totales. Las 12 capas centrales se ejecutan tres veces con pesos compartidos, de modo que cada token atraviesa 48 aplicaciones de capa, un mecanismo que incrementa la profundidad efectiva sin aumentar el numero de parametros. El modelo procesa entradas de texto e imagen mediante un proyector multimodal independiente (mmproj) que se distribuye aparte en los GGUF.

La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se especifican innovaciones adicionales como decodificacion especulativa (las pruebas de rendimiento indican explicitamente que no se uso). El checkpoint original se distribuye en precision mixta NVFP4/MXFP8 (~20 GB), optimizado para aceleradores con soporte de FP4.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de hasta 1 millon de tokens.
- Razonamiento y resolucion de problemas matematicos (las pruebas incluyen problemas de cinematica, caudal, combinatoria y edades).
- Generacion y edicion de codigo, incluyendo tareas de estructura de datos (insercion en lista enlazada).
- Comprension de imagenes y documentos (pipeline image-text-to-text; OmniDocBench v1.6 al 92,8%).
- Razonamiento agentico y navegacion web (BrowseComp 79,0%).
- Razonamiento abstracto y visual (ARC-AGI v1 84,5%, v2 49,3%).
- Soporte de tool calling y function calling: no confirmado explicitamente en la informacion disponible.
- Capacidades multilingues: no disponibles.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia de programacion en local: con 3,4 B parametros activos y cuantizacion Q4_K_M (17,5 GB), el modelo puede ejecutarse en una unica GPU de consumo para autocompletado, refactorizacion y explicacion de codigo, con el 79,2% en SWEBench Verified como referencia de calidad.
- Analisis de documentos extensos: la ventana de 1 millon de tokens permite procesar contratos, informes o bases de codigo completas en una sola pasada, y el 92,8% en OmniDocBench lo hace adecuado para extraccion de datos de PDFs escaneados combinando el proyector multimodal.
- Agentes de navegacion web: el 79,0% en BrowseComp sugiere capacidad para tareas de busqueda y extraccion de informacion multi-paso en entornos controlados.
- Procesamiento de imagenes en el borde: el proyector mmproj en Q8_0 (346 MB) permite anadir vision a un despliegue en llama.cpp sin apenas coste de VRAM adicional, util para inspeccion visual o clasificacion en dispositivos con 32 GB de memoria unificada.
- Razonamiento matematico asistido: los tests de problemas de edades, caudal y cinematica indican utilidad en tutoria o verificacion de calculos paso a paso.
- Despliegue en Apple Silicon: el checkpoint original de ~20 GB encaja en equipos de 32 GB de memoria unificada, lo que permite inferencia local de un modelo multimodal de 26 B sin GPU dedicada.
- Prototipado con licencia permisiva: al ser Apache 2.0, puede integrarse en productos comerciales sin restricciones de atribucion mas alla de las habituales.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| SWEBench Verified | 79,2% |
| SWEBench Pro v2 Hard | 77,9% |
| DeepSWE v1.1 | 48,2% |
| BrowseComp | 79,0% |
| OmniDocBench v1.6 | 92,8% |
| ARC-AGI v1 | 84,5% |
| ARC-AGI v2 | 49,3% |

Rendimiento de inferencia medido en la model card (RTX PRO 6000 Blackwell, 96 GB VRAM, llama-cli, contexto 16.384, KV cache q8_0, 99 capas offloaded):

| Metrica | Valor |
|---|---|
| Velocidad media de procesamiento de prompt | 298,61 tokens/s |
| Velocidad media de generacion | 76,51 tokens/s |
| VRAM pico | 16,38 GiB |
| Tiempo total de pared | 75,6 s |

No se han publicado resultados de benchmarks comparativos con modelos similares en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: Q2_K ~10,9 GB; Q3_K_M ~13,7 GB; Q4_K_M ~17,5 GB; Q5_K_M ~19,9 GB; Q6_K ~23,5 GB; Q8_0 ~27,8 GB; BF16 ~52,2 GB. Anadir ~0,35-0,64 GB si se usa vision (mmproj).
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell (probado con 16,38 GiB pico en MXFP4_MOE), B200/B300 y RTX 50-series para FP4 nativo; A100/H100 para BF16 o cuantizaciones altas.
- Cabe en GPU de consumo: si, en tarjetas con 16-24 GB usando Q4_K_M o Q5_K_M; en 12 GB solo con Q2_K o Q3_K.
- Apple Silicon: el checkpoint original de ~20 GB cabe en equipos con 32 GB de memoria unificada.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, vLLM, SGLang, text-generation-inference.
- Rendimiento medido: 298,61 tokens/s de prompt y 76,51 tokens/s de generacion en RTX PRO 6000 Blackwell con MXFP4_MOE y contexto de 16.384 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Inkling-2-Mini | 26,4 B totales / 3,4 B activos | 1 M | Apache 2.0 | Multimodal, MoE con bucles, SWEBench Verified 79,2% |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | No se proporcionan datos de modelos comparables en la informacion disponible |

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al ser un modelo entrenado con datos web, es probable que herede sesgos de esos corpus, aunque no se cuantifican.
- Riesgo de alucinacion inherente a los modelos generativos; no se publican tasas de factualidad ni evaluaciones de calibracion.
- Idiomas soportados no disponibles: no se confirma el rendimiento fuera del ingles, por lo que el uso en castellano requiere validacion propia.
- Las cuantizaciones Q2_K y Q3 degradan la calidad de forma notable; la propia model card advierte que Q2_K es solo para restricciones extremas de recursos.
- El rendimiento medido (76,51 tokens/s) corresponde a hardware Blackwell de gama alta con FP4 nativo; en GPUs sin soporte FP4 o en CPU la velocidad sera sustancialmente menor.
- El pipeline declarado es image-text-to-text, pero la model card no detalla la resolucion de imagen soportada ni el comportamiento con multiples imagenes.
- No se confirma soporte de tool calling ni modo thinking, lo que limita su uso en pipelines agenticos que dependan de estas funciones.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base original (thinkingmachines/Inkling-2-Mini) antes de un despliegue comercial.
- El repo GGUF ocupa 263,3 GB en total; descargar solo el archivo de cuantizacion necesario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/prithivMLmods/Inkling-2-Mini-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Archivo MXFP4_MOE: https://huggingface.co/prithivMLmods/Inkling-2-Mini-GGUF/blob/main/Inkling-2-Mini.MXFP4_MOE.gguf
- Archivo Q4_K_M: https://huggingface.co/prithivMLmods/Inkling-2-Mini-GGUF/blob/main/Inkling-2-Mini.Q4_K_M.gguf
- Archivo BF16: https://huggingface.co/prithivMLmods/Inkling-2-Mini-GGUF/blob/main/Inkling-2-Mini.BF16.gguf
