# devvexus/Qwen3.8-27B-MS

## Resumen

Qwen3.8-27B-MS es una coleccion de cuantizaciones GGUF del modelo base Qwen/Qwen3.8-27B, publicada por el desarrollador independiente devvexus (Matthew Priester) bajo el formato propietario MS (Mad Shift). No se trata de un modelo nuevo entrenado desde cero, sino de una recompresion del modelo original de Qwen con una tecnica de cuantizacion propia que, segun el autor, reduce la perdida de calidad respecto a otras alternativas del mismo tamano. El modelo base cuenta con 26.895.998.464 parametros (~26,9 mil millones) y se distribuye bajo licencia Apache 2.0.

La propuesta de valor de estos ficheros es la eficiencia en la relacion calidad/tamano: el autor reporta una divergencia KL entre 1,61 y 2,31 veces menor que los ficheros UD3 de Unsloth del mismo tamano, y un acierto de top-1 frente al modelo BF16 original del 93,8-98,7 % (frente al 91,8-97,9 % de Unsloth). Ademas, incluye un fichero MTP (multi-token prediction) propio que acelera la generacion hasta 2,1 veces.

La relevancia practica es inmediata para quien quiera ejecutar un modelo de ~27B en GPUs de consumo (16-32 GB de VRAM): los ficheros MS2.7 (10,6 GB), MS4.3 (17,3 GB) y MS5 (19,4 GB) cubren desde una RTX 4080 hasta una RTX 5090 o DGX Spark. La contrapartida es que requieren un fork especifico de llama.cpp (ms-llama.cpp); llama.cpp estandar, Ollama y LM Studio no pueden cargarlos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.8-27B; detalles no disponibles) |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens recomendados por el autor (ampliable segun VRAM) |
| Tipos de cuantizacion | MS2.7 (10,6 GB), MS3.5, MS3.7, MS4.3 (17,3 GB), MS5 (19,4 GB); fichero MTP de 0,30 GB; vision encoder F16 de 0,93 GB |
| Idiomas soportados | no disponibles (la model card no los detalla) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible solo con ms-llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer de ~26,9 mil millones de parametros desarrollado por Qwen. La model card de esta publicacion no aporta informacion sobre la composicion del dataset de entrenamiento, el numero de tokens, ni si hubo fases de RLHF o DPO; esos datos corresponderian a la model card del modelo base original, no incluida en la informacion disponible.

La innovacion tecnica de esta publicacion reside en el metodo de cuantizacion MS (Mad Shift), disenado por Matthew Priester. Segun las mediciones del autor, los ficheros MS logran una divergencia KL menor que las cuantizaciones UD3 de Unsloth y que los ficheros EXL3 de turboderp a tamanos equivalentes (1,81-2,50 veces menor KL que EXL3 para MS2.7-MS4.3). Ademas se incluye un fichero MTP (multi-token prediction) codificado en MS que sirve para todos los tamanos, ya que reutiliza la tabla de tokens y la cabeza de salida del fichero cargado, y que acelera la decodificacion especulativa: 2,1 veces mas rapido que sin MTP (32,4 tokens/s en MS4.3 y 46,6 tokens/s en MS2.7 sobre una RTX Spark). En una RTX 4080 SUPER, MS2.7 alcanza 101 tokens/s frente a 97 tokens/s de Unsloth con su fichero MTP separado.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, tag conversational).
- Razonamiento y respuesta multi-turno, con ventana de contexto configurable (32k recomendados, ampliable).
- Lectura de imagenes mediante el vision encoder opcional `mmproj-Qwen3.8-27B-F16.gguf` (0,93 GB, F16), que debe cargarse explicitamente con `--mmproj` o `--mmproj-url`.
- Decodificacion especulativa mediante MTP, que incrementa el throughput de generacion.
- Servido como API compatible con endpoints y pagina de chat integrada en `llama-server` (puerto 8080).
- Capacidades de tool calling, agentes o modo thinking: no disponibles en la informacion proporcionada (dependen del modelo base, cuyos detalles no se incluyen).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en estacion de trabajo: con MS4.3 (17,3 GB) en una RTX 4090 o 3090 se puede servir un chat multi-turno con 32k de contexto a traves de la API de `llama-server`, sin depender de servicios en la nube.
- Despliegue en GPU de consumo de 16 GB: MS2.7 (10,6 GB) permite ejecutar un modelo de ~27B en una RTX 4070 Ti Super, 4080, 5070 Ti o 5080, con margen para el contexto y el vision encoder.
- Procesamiento de documentos con imagenes: cargando el vision encoder F16 se pueden enviar capturas, diagramas o paginas escaneadas junto con instrucciones de texto para extraccion o resumen.
- Generacion de codigo y asistencia tecnica en local: el modelo puede integrarse en un flujo de trabajo de desarrollo mediante la API HTTP de `llama-server`, manteniendo el codigo y los prompts dentro de la infraestructura propia.
- Evaluacion comparativa de cuantizaciones: los ficheros MS permiten medir en produccion la perdida de calidad frente al BF16 original usando la metodologia del autor (divergencia KL y acuerdo top-1), util para decidir el tamano optimo por caso de uso.
- Prototipado rapido de agentes y pipelines: la API expuesta en `http://localhost:8080` facilita conectar el modelo a scripts, herramientas o frameworks externos sin infraestructura adicional.
- Inferencia de alta velocidad en hardware compacto: con MTP activado y MS2.7 se alcanzan ~101 tokens/s en una RTX 4080 SUPER, adecuado para aplicaciones interactivas con requisitos de latencia estrictos.

## Benchmarks y rendimiento

| Metrica | MS (Mad Shift) | Unsloth UD3 (mismo tamano) | EXL3 (mismo tamano) |
|---|---|---|---|
| Divergencia KL vs BF16 | Referencia | 1,61-2,31x mayor | 1,81-2,50x mayor (MS2.7-MS4.3) |
| Acuerdo top-1 vs BF16 | 93,8-98,7 % | 91,8-97,9 % | no disponible |
| Velocidad de generacion (RTX Spark, sin MTP) | 98-100 % de Unsloth | Referencia | no disponible |
| Velocidad de generacion (RTX 4080 SUPER, sin MTP) | 97 % de Unsloth | Referencia | no disponible |
| Throughput con MTP (RTX Spark) | MS4.3: 32,4 tok/s; MS2.7: 46,6 tok/s | no disponible | no disponible |
| Throughput con MTP (RTX 4080 SUPER) | MS2.7: 101 tok/s | 97 tok/s | no disponible |
| Memoria adicional por MTP | ~0,9-1,0 GiB | 1,6-1,7 GiB (fichero separado) | no disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible; las metricas anteriores miden fidelidad de cuantizacion y velocidad, no calidad de tarea.

## Requisitos de hardware

- VRAM estimada: MS2.7 ~10,6 GB; MS4.3 ~17,3 GB; MS5 ~19,4 GB. El fichero MTP anade ~0,9-1,0 GiB y el vision encoder ~0,93 GB.
- GPUs recomendadas por el autor: 16 GB para MS2.7 (RTX 4070 Ti Super, 4080, 5070 Ti, 5080); 24 GB para MS4.3 (RTX 3090, 4090); 32 GB o mas para MS5 (RTX 5090, RTX Spark, DGX Spark).
- Cabe en GPU de consumo: si, en todas las anteriores con el fichero adecuado.
- Despliegue: exclusivamente mediante ms-llama.cpp (fork de llama.cpp del autor). Stock llama.cpp, Ollama y LM Studio no pueden cargar estos ficheros. Hay binarios para Windows (x64-CUDA12 y ARM64-CUDA); en Linux y macOS hay que compilar desde el codigo fuente.
- Configuracion recomendada: `-c 32768 -np 1 --spec-type draft-mtp`. Con `-np 1` se sirve un chat a la vez; cada slot paralelo adicional necesita su propia copia del estado recurrente y puede expulsar capas de la GPU.
- Latencia y throughput: ~101 tok/s (MS2.7, RTX 4080 SUPER, con MTP), 46,6 tok/s (MS2.7, RTX Spark, con MTP), 32,4 tok/s (MS4.3, RTX Spark, con MTP). Sin MTP, el rendimiento es practicamente identico al de Unsloth.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-MS (esta publicacion) | ~26,9 B | 32k recomendado | GGUF (MS) | Apache 2.0 | Requiere ms-llama.cpp; MTP propio; menor KL que UD3 y EXL3 |
| Qwen3.8-27B UD3 (Unsloth) | ~26,9 B | no disponible | GGUF | Apache 2.0 | Compatible con llama.cpp estandar; KL 1,61-2,31x mayor; MTP separado de 1,6-1,7 GiB |
| Qwen3.8-27B EXL3 (turboderp) | ~26,9 B | no disponible | EXL3 | Apache 2.0 | Requiere ExLlamaV3; KL 1,81-2,50x mayor para MS2.7-MS4.3; MS5 supera a todos los EXL3 medidos |
| Qwen3.8-27B BF16 (original) | ~26,9 B | no disponible | safetensors | Apache 2.0 | Referencia de calidad; requiere mucha mas VRAM |

## Limitaciones y advertencias

- Dependencia de un fork no estandar: los ficheros solo cargan en ms-llama.cpp; no funcionan en llama.cpp estandar, Ollama ni LM Studio, lo que limita la portabilidad y el soporte de herramientas del ecosistema.
- Ecosistema y mantenimiento: el fork y el formato MS estan mantenidos por un unico desarrollador; el soporte a largo plazo, la compatibilidad futura y la comunidad son reducidos.
- Perdida de calidad inevitable: aunque menor que en otras cuantizaciones, existe divergencia respecto al BF16 (acuerdo top-1 del 93,8-98,7 %); no es adecuado cuando se requiere fidelidad absoluta al modelo original.
- Riesgo de alucinacion: inherente al modelo base; no se documentan mitigaciones especificas en esta publicacion.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible.
- Idiomas: la model card no especifica los idiomas soportados; conviene validar el comportamiento en castellano antes de usarlo en produccion.
- Contexto: 32k es el valor recomendado por el autor, no un limite confirmado; ampliarlo consume VRAM adicional y puede provocar spill a RAM del sistema, con caida severa de rendimiento.
- Paralelismo limitado: `-np 1` restringe a un chat simultaneo; escalar en paralelo requiere copias del estado recurrente y puede expulsar capas de la GPU.
- Windows: el primer arranque puede mostrar un aviso de symlink ("degraded mode") que es inofensivo pero puede duplicar espacio en disco en actualizaciones.
- Licencia: Apache 2.0 permite uso comercial, pero las condiciones del formato MS y del fork deben revisarse por separado; el autor solicita credito a "MS (Mad Shift) by Matthew Priester".

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/devvexus/Qwen3.8-27B-MS
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Fork del motor: https://github.com/devvexus/ms-llama.cpp
- Perfil del autor en GitHub: https://github.com/devvexus
- ORCID del autor: https://orcid.org/0009-0000-0032-5292
- Referencia arXiv citada en los tags: https://arxiv.org/abs/2406.11235
- Cuantizaciones EXL3 comparadas: https://huggingface.co/turboderp/Qwen3.8-27B-exl3
