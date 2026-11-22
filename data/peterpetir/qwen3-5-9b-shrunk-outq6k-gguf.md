# PeterPetir/Qwen3.5-9B-Shrunk-OutQ6K-GGUF

## Resumen

Qwen3.5-9B-Shrunk-OutQ6K-GGUF es una distribucion GGUF derivada de un modelo Qwen3.5 de 9B, publicada por el usuario PeterPetir. No se trata de un modelo entrenado desde cero, sino de una intervencion quirurgica sobre un GGUF previo (procedente de merges de Nightmedia y DavidAU, con estirpe "uncensored"/abliterated) en el que se recuantiza unicamente la cabeza de salida (`output.weight`, tensor `[4096, 248320]`) de BF16 a Q6_K, manteniendo los otros 426 tensores y 66 campos de metadatos copiados bit a bit. El resultado reduce el fichero de 4,60 GiB a 3,49 GiB (-24,3%) sin tocar las 32 capas de razonamiento.

El objetivo declarado es la inferencia 100% local en CPU en portatiles modestos (caso de referencia: Intel i5-1135G7, 4 nucleos, 7,6 GiB de RAM, sin GPU), donde el GGUF original dejaba un margen de RAM muy ajustado. El autor acompana el modelo de un arnes de verificacion ("Extra Engine v3") y un benchmark de 30 tareas de codigo Python, con el que reporta una tasa de acierto combinada del 90,0% (27/30) frente a un 0,0% del modelo base sin el arnes en el mismo hardware.

La relevancia es acotada: es un artefacto de optimizacion de despliegue, no un modelo nuevo. Su interes esta en la tecnica de recuantizacion selectiva de la cabeza de salida y en la documentacion del compromiso entre tamano, velocidad en CPU y calidad resultante. La arquitectura subyacente es la hibrida de Qwen3.5 (Gated DeltaNet + GQA en proporcion 3:1), con 8.953.803.264 parametros totales segun los safetensors del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido Qwen3.5: Gated DeltaNet + GQA en proporcion 3:1, 32 capas |
| Parametros totales | 8.953.803.264 (dato del modelo base en safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el ejemplo de despliegue usa `-c 4096` |
| Tipos de cuantizacion | Mezcla heredada del GGUF original (IQ2_S / IQ3_S / Q4_K / F32) con `output.weight` recuantizado a Q6_K |
| Idiomas soportados | en, id |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5 para 9B: un transformer hibrido de 32 capas que combina capas Gated DeltaNet (atencion lineal con estado recurrente) y capas de atencion con GQA en una proporcion 3:1. La cabeza de salida tiene un vocabulario de 248.320 tokens y dimension oculta de 4096. No se dispone de informacion sobre el volumen de tokens de preentrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF/DPO) del modelo Qwen3.5 original, por lo que esos datos deben considerarse no disponibles en esta ficha.

El proceso de esta publicacion no es entrenamiento sino cirugia de tensores: se toma un GGUF ya cuantizado en 2,5 bits efectivos (procedente de merges "uncensored"/abliterated de Nightmedia y DavidAU) y se recuantiza solo `output.weight` mediante `ggml_quantize_chunk` de `libggml-base.so`, dejando intactos el resto de tensores y la plantilla de chat. La innovacion tecnica destacable es precisamente esa selectividad: la cabeza de salida ocupaba el 41,3% del fichero en BF16 (1.940,0 MiB) y pasa a 795,7 MiB en Q6_K, evitando la doble cuantizacion del resto del modelo. El autor publica la herramienta (`shrink_output_head.py`) y el arnes de evaluacion en su repositorio de GitHub.

## Capacidades

- Generacion de texto conversacional en ingles e indonesio, con plantilla de chat preservada del GGUF original.
- Generacion de codigo Python: el benchmark del autor cubre algoritmos, estructuras de datos, parsing, programacion dinamica, grafos y depuracion.
- Razonamiento en modo "thinking" (`enable_thinking`), aunque el autor recomienda desactivarlo en CPU por los bucles largos dentro de `<think>`.
- Contenido sin censura (variante "uncensored"/abliterated), orientada a escritura creativa y temas que los modelos alineados suelen rechazar.
- Compatibilidad con llama.cpp y servidor compatible con endpoints (`llama-server`), con soporte de `--jinja` para plantillas.
- No se documenta soporte de tool calling, function calling, vision, audio ni capacidades de agente multi-paso en la informacion proporcionada.

## Casos de uso

- Inferencia local en portatiles sin GPU: el fichero de 3,49 GiB deja unos 3,7 GiB de RAM libre en un equipo de 7,6 GiB, lo que permite ejecutar un modelo de 9B en CPU con llama.cpp sin swap agresivo.
- Asistencia de programacion offline: el modelo resuelve tareas de algoritmos y parsing en Python con velocidades de 1,25-2,35 t/s en un i5 de cuatro nucleos, adecuado para entornos sin conectividad o con requisitos de privacidad estrictos.
- Generacion de codigo con verificacion automatica: el arnes "Extra Engine v3" ejecuta el codigo generado y reintenta con cambio de estrategia, lo que encaja en pipelines de evaluacion tipo CI para tareas acotadas.
- Escritura creativa sin filtros: al ser una variante abliterated, sirve para narrativa y guiones donde los modelos alineados aplican rechazos, siempre con revision editorial humana.
- Prototipado educativo y demos de cuantizacion: la documentacion del diff de tensores y la herramienta de recuantizacion selectiva son utiles para ensenar el impacto de la cabeza de salida en el tamano del fichero.
- Sustitucion de modelos mayores en hardware restringido: el autor compara con un Qwen3.8-27B en IQ2_M (10,87 GiB) y reporta entre 16x y 29x mas velocidad en CPU con este modelo de 9B, lo que lo hace viable donde el 27B no cabe en RAM.
- Experimentacion con modelos derivados: sirve como base para probar merges, recuantizaciones o plantillas de chat sobre la arquitectura hibrida de Qwen3.5.

## Benchmarks y rendimiento

Los unicos datos disponibles son los del benchmark propio del autor (30 tareas Python, Intel i5-1135G7, 4 nucleos, 7,6 GiB RAM, sin GPU), con verificacion por ejecucion y reintentos:

| Configuracion | Tasa de acierto | Velocidad (CPU) | Tamano |
|---|---|---|---|
| 9B base plano, `enable_thinking: true` | 0,0% (0/2, bloqueado en `<think>`) | 10-13 min/tarea | 4,60 GiB |
| 9B Shrunk + Smart Engine (10 tareas iniciales) | 70,0% (7/10, todas `try=1`) | 1,5-3 min/tarea | 3,49 GiB |
| 9B Shrunk + verificador etapas 1-2 (10 iniciales) | 100,0% (10/10, todas `try=1`) | 1,23-1,69 t/s | 3,49 GiB |
| 9B Shrunk + Extra Engine v2 (20 tareas no vistas) | 65,0% (13/20) | 0,90-2,04 t/s | 3,49 GiB |
| 9B Shrunk + Extra Engine v3 (30 tareas) | 90,0% (27/30: 10/10 + 17/20) | 1,25-2,35 t/s | 3,49 GiB |

Comparativa del autor frente a Qwen3.8-27B en IQ2_M en el mismo portatil: 3,49 GiB frente a 10,87 GiB (3,1x menor), 1,25-2,35 t/s frente a 0,081 t/s (16x-29x mas rapido). El propio autor advierte que el 27/30 incluye reintentos automaticos (hasta 5 intentos en tareas rescatadas) y no es generacion a un solo disparo; tres tareas (`py_18_csv_parse_line`, `py_21_spiral_matrix`, `py_24_bipartite_check`) quedaron sin resolver. No hay resultados publicados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- RAM estimada: el fichero pesa 3,49 GiB; en el caso de referencia se observan unos 3,7 GiB libres sobre 7,6 GiB totales con el modelo cargado.
- VRAM: no aplica para el caso de uso declarado (CPU-only); al ser GGUF puede descargarse a GPU con llama.cpp si se dispone de VRAM suficiente (no cuantificada en la informacion).
- GPU recomendadas: no disponibles en la informacion proporcionada; el autor disena el artefacto explicitamente para cero GPU.
- CPU de referencia: Intel i5-1135G7, 4 nucleos, con `-t 4`.
- Cabe en equipos consumer de gama baja: si, en portatiles con 8 GiB de RAM o mas; con 4 GiB de RAM no cabe con holgura.
- Despliegue: llama.cpp (`llama-server` con `--jinja`, `-c 4096`, `-np 1`, `--no-reasoning-preserve`). No se documenta compatibilidad con vLLM, TGI ni Ollama.
- Throughput: 1,25-2,35 t/s en el hardware de referencia para tareas de codigo; 0,90-2,04 t/s en las tareas no vistas. Latencia por tarea de 1,5 a 3 minutos con el arnes.
- Muestreo recomendado por el autor: `temperature=0.15`, `top_p=0.9`, `repeat_penalty=1.05`, `presence_penalty=0.0`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano del fichero | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-Shrunk-OutQ6K-GGUF (este) | 8,95B | no disponible | 3,49 GiB | Apache-2.0 | GGUF en HF, 0 descargas |
| Qwen3.8-27B IQ2_M (referencia del autor) | no disponible | no disponible | 10,87 GiB | no disponible | citado en la model card |
| GGUF original `Qwen3.5-9B-The-Defiant-Fable-Uncnr-Heretic-NEO-MAX-IQ2_M` | 8,95B | no disponible | 4,60 GiB | Apache-2.0 | upstream de Nightmedia/DavidAU |

La comparacion con el 27B se limita a tamano, velocidad en CPU y tasa de acierto en el benchmark propio; no hay datos de benchmarks estandar que permitan una comparacion de calidad entre ambos. Frente al GGUF original, la unica diferencia medible es el tamano (-24,3%) y el margen de RAM, sin cambios en las capas de razonamiento segun el autor.

## Limitaciones y advertencias

- Modelo "uncensored"/abliterated: no aplica filtros de seguridad alineados, por lo que puede generar contenido danino, sesgado o inapropiado; requiere moderacion externa en cualquier despliegue publico.
- Cuantizacion agresiva heredada: el cuerpo del modelo esta en 2,5 bits efectivos (IQ2_S/IQ3_S), lo que degrada calidad frente al BF16 original; el autor reconoce un "techo de peso" en esa cuantizacion como causa de las tres tareas no resueltas.
- Riesgo de alucinacion elevado en tareas de codigo y razonamiento por la cuantizacion extrema; los resultados del 90% dependen del arnes de verificacion con reintentos, no de la generacion directa.
- Idiomas: solo ingles e indonesio declarados; el castellano no esta soportado oficialmente.
- Contexto: no documentado; el ejemplo de despliegue limita a 4096 tokens, muy por debajo de lo habitual en modelos Qwen3.5.
- Bucles de razonamiento: con `enable_thinking: true` el modelo se bloquea dentro de `<think>` en CPU (0,0% en el baseline del autor); es necesario desactivarlo.
- Licencia Apache-2.0 heredada de los metadatos del GGUF, pero la cadena de merges y derivados upstream (Nightmedia, DavidAU) conviene revisarla antes de uso comercial.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: sin validacion independiente de terceros.
- El benchmark es de 30 tareas Python en un unico equipo; no es extrapolable a otros dominios ni hardware.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PeterPetir/Qwen3.5-9B-Shrunk-OutQ6K-GGUF
- Repositorio del autor (codigo, herramienta de cirugia GGUF, Extra Engine v3 y benchmark): https://github.com/peterpetir123/qwen3.5-local-lab
- Herramienta de recuantizacion selectiva: https://github.com/peterpetir123/qwen3.5-local-lab/blob/main/tools/shrink_output_head.py
- Tareas del benchmark: https://github.com/peterpetir123/qwen3.5-local-lab/blob/main/benchmark/tasks_30.json
- Portfolio del autor: https://peterpetir123.github.io
- Modelo base upstream (Nightmedia): https://huggingface.co/nightmedia
- Modelo base upstream (DavidAU): https://huggingface.co/DavidAU
