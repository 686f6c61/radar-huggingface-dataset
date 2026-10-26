# prithivMLmods/Nanbeige4.3-33B-NVFP4-GGUF

## Resumen

Nanbeige4.3-33B-NVFP4-GGUF es la version cuantizada en formato GGUF del modelo Nanbeige4.3-33B, el modelo de texto insignia de 33B del equipo Nanbeige, publicado bajo licencia Apache 2.0. La cuantizacion la firma prithivMLmods y emplea el formato NVFP4 (punto flotante de 4 bits nativo de NVIDIA), lo que reduce el archivo a 22,1 GB en un unico fichero GGUF optimizado para GPUs Blackwell. El modelo base es un transformer denso de 33.118.977.752 parametros con una ventana de contexto declarada de 512.000 tokens.

El modelo esta disenado como "profesor" de alta capacidad para destilar capacidades agenticas en modelos mas pequenos, y apunta a flujos de trabajo profesionales y de programacion compleja. Incorpora preservacion configurable del razonamiento (thinking) y soporte de tool calling, con XML recomendado para las llamadas a herramientas. La model card lo compara con Qwen3.8-27B, Muse-Glimmer-30B y Gemma4-31B, sobre los que declara ventaja en varios benchmarks (Terminal-Bench 2.1: 80,9; AIME 2026: 95,2). El modelo base es compatible con Transformers, SGLang y vLLM.

Esta ficha describe especificamente el artefacto cuantizado de prithivMLmods, que solo soporta ingles y chino, y cuya ejecucion se ha validado en llama.cpp sobre una NVIDIA RTX PRO 6000 Blackwell de 96 GB, con 64,40 tokens/s de generacion y 1.569,37 tokens/s de procesamiento de prompt.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (etiquetas "llama" y "dense" en el repo) |
| Parametros totales | 33.118.977.752 (~33,1B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 512.000 tokens (512K, segun la model card del modelo base) |
| Tipos de cuantizacion | NVFP4 (unico archivo GGUF en el repositorio) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Modelo base | Nanbeige/Nanbeige4.3-33B |
| Cuantizador | prithivMLmods (llama.cpp) |
| Tamano del repositorio | 22,1 GB |
| Fecha de publicacion | 2026-10-26 |

## Arquitectura y entrenamiento

La informacion disponible describe el modelo base como un transformer denso (no MoE) de 33,1B parametros, etiquetado como "llama" en el repositorio, con una ventana de contexto de 512K tokens y soporte de modo de razonamiento configurable. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; esos datos figuran como no disponibles.

El artefacto de este repositorio es una cuantizacion NVFP4 generada con llama.cpp, no un reentrenamiento. NVFP4 es un formato de 4 bits con escalado por bloques orientado a los tensor cores de las GPUs Blackwell de NVIDIA, que busca reducir el peso en memoria manteniendo precision cercana a formatos de 8 bits. La model card indica explicitamente que la decodificacion especulativa MTP no esta disponible en esta version. El modelo base declara compatibilidad con Transformers, SGLang y vLLM, mientras que esta variante GGUF esta pensada para llama.cpp.

## Capacidades

- Generacion de texto y razonamiento general en ingles y chino.
- Programacion y tareas de ingenieria de software: la model card reporta 65,5 en DeepSWE y 60,3 en SWE-bench Pro.
- Razonamiento matematico de competicion: 95,2 en AIME 2026.
- Ejecucion de tareas de terminal y agentes de linea de comandos: 80,9 en Terminal-Bench 2.1.
- Tool calling / function calling, con XML recomendado como formato de llamada.
- Razonamiento multi-paso y flujos agenticos (Automation Bench 54,2; Claw-Eval Pass@3 78,3).
- Modo de pensamiento (thinking) con preservacion configurable del razonamiento.
- Contexto largo de hasta 512K tokens para analisis de documentos o repositorios extensos.
- Capacidad de actuar como profesor para destilar comportamiento agentico en modelos menores.
- Vision, audio u otras modalidades: no disponibles en la informacion proporcionada.

## Casos de uso

- Agentes de programacion autonoma: el modelo puede resolver tareas de terminal y parcheo de codigo (Terminal-Bench 2.1 de 80,9 y SWE-bench Pro de 60,3) integrandose en pipelines de CI/CD o en entornos de ejecucion aislados.
- Analisis de repositorios completos: con 512K tokens de contexto declarados, puede ingerir arboles de codigo y documentacion extensos en una sola pasada para tareas de revision, refactorizacion o auditoria.
- Razonamiento matematico y verificacion formal: su resultado de 95,2 en AIME 2026 lo hace adecuado para tutoria matematica, generacion de problemas y validacion de demostraciones paso a paso.
- Destilacion de capacidades agenticas: al estar concebido como modelo profesor, se puede usar para generar trayectorias y datos de entrenamiento que alimenten modelos mas pequenos desplegables en produccion.
- Automatizacion de flujos profesionales: con Automation Bench de 54,2, encaja en orquestadores de tareas multi-paso que combinan busqueda, calculo y llamadas a APIs mediante tool calling en XML.
- Asistentes tecnicos bilingues en y zh: cubre documentacion, soporte y generacion de contenido en ambos idiomas, util para equipos con operaciones en China y mercados angloparlantes.
- Evaluacion de agentes y benchmarking interno: sirve como referencia de alta capacidad para comparar el rendimiento de modelos mas ligeros en tareas de terminal y codigo.
- Generacion de codigo en produccion: con soporte de tool calling y contexto largo, puede integrarse en asistentes de IDE o revisiones automatizadas de pull requests.

## Benchmarks y rendimiento

Resultados declarados en la model card (modelo base, comparados con alternativas segun el autor):

| Benchmark | Nanbeige4.3-33B | Qwen3.8-27B | Gemma4-31B | Muse-Glimmer-30B |
|---|---|---|---|---|
| Terminal-Bench 2.1 | 80,9 | no disponible | no disponible | no disponible |
| DeepSWE | 65,5 | no disponible | no disponible | no disponible |
| Automation Bench | 54,2 | no disponible | no disponible | no disponible |
| Claw-Eval Pass@3 | 78,3 | no disponible | no disponible | no disponible |
| AIME 2026 | 95,2 | no disponible | no disponible | no disponible |
| SWE-bench Pro | 60,3 | 61,7 | no disponible | no disponible |
| GPQA-Diamond | 89,5 | no disponible | 91,3 | no disponible |

Rendimiento medido de la cuantizacion NVFP4 en llama.cpp (RTX PRO 6000 Blackwell, 96 GB, contexto de 16.384 tokens, KV cache q8_0, semilla 42, 5 ejecuciones):

| Metrica | Valor |
|---|---|
| Velocidad media de procesamiento de prompt | 1.569,37 tokens/s |
| Velocidad media de generacion | 64,40 tokens/s |
| Tiempo medio por ejecucion | 14,70 s |
| Tiempo total de pared | 73,5 s |
| VRAM pico | 21,64 GiB |
| Utilizacion pico de GPU | 97% |
| Capas descargadas a GPU | 99 (-ngl 99) |

No se han publicado resultados de benchmarks adicionales del artefacto cuantizado en la informacion disponible; los valores de benchmark corresponden al modelo base y son autodeclarados por el autor.

## Requisitos de hardware

- Peso del archivo NVFP4: 22,1 GB, un unico GGUF.
- VRAM medida en inferencia: 21,64 GiB pico con contexto de 16.384 tokens y KV cache q8_0; el consumo crece de forma apreciable con contextos cercanos a los 512K declarados.
- NVFP4 requiere aceleracion nativa en GPUs Blackwell de NVIDIA: la prueba oficial usa una RTX PRO 6000 Blackwell Server Edition de 96 GB. En arquitecturas anteriores el soporte de NVFP4 puede no estar disponible o degradar el rendimiento.
- GPU de referencia: NVIDIA RTX PRO 6000 Blackwell (96 GB). Otras opciones Blackwell como la RTX 5090 (32 GB) deberian poder alojar los 22,1 GB de pesos mas la cache KV, aunque no hay verificacion en la informacion disponible.
- GPUs consumer por debajo de 24 GB de VRAM: no es viable cargar el modelo completo en GPU con esta cuantizacion.
- Despliegue: llama.cpp (llama-cli, llama-cpp-python) es la via validada para este GGUF. El modelo base declara soporte de Transformers, SGLang y vLLM, pero no se ha verificado el soporte de este archivo NVFP4 en esos motores.
- Throughput medido: 64,40 tokens/s de generacion y 1.569,37 tokens/s de prefill en la configuracion indicada; el rendimiento variara con el prompt, el build y los parametros de ejecucion.
- No hay decodificacion especulativa MTP disponible en esta version, por lo que no se puede acelerar la generacion con ese mecanismo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato disponible | Notas |
|---|---|---|---|---|---|
| Nanbeige4.3-33B (esta cuantizacion NVFP4) | 33,1B denso | 512K | Apache 2.0 | GGUF NVFP4 | Lidera Terminal-Bench 2.1 y AIME 2026 segun el autor |
| Qwen3.8-27B | 27B | no disponible | no disponible | no disponible | Supera al modelo en SWE-bench Pro (61,7 frente a 60,3) |
| Gemma4-31B | 31B | no disponible | no disponible | no disponible | Supera al modelo en GPQA-Diamond (91,3 frente a 89,5) |
| Muse-Glimmer-30B | 30B | no disponible | no disponible | no disponible | Sin datos de benchmarks en la informacion disponible |

Los datos de contexto, licencia y formato de los tres modelos comparables no se detallan en la informacion proporcionada y figuran como no disponibles.

## Limitaciones y advertencias

- Solo soporta ingles y chino de forma oficial; el rendimiento en castellano u otros idiomas no esta documentado.
- Los benchmarks son autodeclarados por el autor del modelo base; no se aportan detalles de metodologia ni de replicacion independiente.
- El repositorio tiene 4 descargas y 1 "like" en la fecha de actualizacion, por lo que la validacion comunitaria es practicamente nula.
- El artefacto es una cuantizacion NVFP4 de 4 bits: puede degradar la precision frente al modelo base en tareas sensibles, aunque no se aportan mediciones de perdida de calidad.
- NVFP4 depende de hardware Blackwell; en GPUs no compatibles el modelo puede no ejecutarse o hacerlo con bajo rendimiento.
- No hay decodificacion especulativa MTP disponible, lo que limita la aceleracion en produccion.
- El contexto probado es de 16.384 tokens, muy inferior a los 512K declarados; el comportamiento y el consumo de VRAM en contextos largos no estan verificados.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan tasas de error ni evaluaciones de factualidad.
- No se documentan sesgos conocidos, composicion del dataset ni procesos de alineacion; no disponibles.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de entrenamiento, no detalladas en la informacion disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/prithivMLmods/Nanbeige4.3-33B-NVFP4-GGUF
- Archivo GGUF: https://huggingface.co/prithivMLmods/Nanbeige4.3-33B-NVFP4-GGUF/blob/main/Nanbeige4.3-33B-NVFP4.gguf
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- llama.cpp (repositorio oficial): https://github.com/ggml-org/llama.cpp

La busqueda web no devolvio resultados relevantes sobre el modelo; no se han incluido enlaces adicionales.
