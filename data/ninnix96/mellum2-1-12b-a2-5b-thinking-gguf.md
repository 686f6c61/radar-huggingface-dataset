# Ninnix96/Mellum2.1-12B-A2.5B-Thinking-gguf

# Mellum2.1-12B-A2.5B-Thinking GGUF (Ninnix96)

## Resumen

Esta ficha describe la publicacion de cuantizaciones GGUF realizadas por el usuario Ninnix96 sobre el modelo JetBrains/Mellum2.1-12B-A2.5B-Thinking, un transformer con mezcla de expertos (MoE) de 64 expertos, 12.150 millones de parametros totales y aproximadamente 2.500 millones activos por token, disenado por JetBrains para razonamiento sobre codigo. El modelo base declara una ventana de contexto de 128.000 tokens y licencia Apache-2.0, lo que lo situa en la categoria de modelos de codigo abiertos con coste de inferencia reducido gracias a su稀疏 activacion.

El repositorio no contiene pesos nuevos ni fine-tuning: es un trabajo de cuantizacion. El autor aplica una receta propia (estilo antirez) en la que los expertos enrutados se comprimen de forma agresiva mientras se protegen en Q8_0/F16/F32 los expertos compartidos, las capas de atencion, la proyeccion de salida, los embeddings, los routers y las normas. El resultado son siete ficheros GGUF de entre 4,97 GiB y 10,56 GiB que cubren desde ~3,5 hasta ~7,5 bits por peso.

La relevancia practica de esta publicacion es que hace ejecutable en hardware de consumo un MoE de 12 B con 128k de contexto, con metricas de divergencia (KL) y de coincidencia top-1 frente a la referencia Q8_0 publicadas fichero a fichero, ademas de un banco de prueba de razonamiento de 12 casos. Es material util para quien necesite desplegar el modelo en llama.cpp sin GPU de datacenter, aunque carece de evaluaciones independientes en benchmarks estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) de 64 expertos, segun la model card del cuantizador |
| Parametros totales | 12.149.923.072 (12,15 B) |
| Parametros activos | 2,5 B (segun la denominacion del modelo) |
| Longitud de contexto | 128.000 tokens (128k) |
| Tipos de cuantizacion | A nivel de tensor: IQ2_XXS, IQ3_XXS, IQ4_XS, Q4_0, Q5_0, Q5_K, Q6_K, Q8_0, F16, F32. Siete ficheros GGUF de Q2 a Q6 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp). Modelo original en BF16 |
| Modelo base | JetBrains/Mellum2.1-12B-A2.5B-Thinking |
| Tamano del repositorio | 58,1 GB (conjunto de todos los ficheros) |
| Matriz de calibracion (imatrix) | bartowski calibration v6 |
| Descargas / likes | 155 / 0 (en el momento de la consulta) |

Reparto de precision por grupo de tensores, segun la receta del autor:

| Grupo de tensores | Q2 | Q3 | Q4 | Q5 | Q6 |
|---|---|---|---|---|---|
| Gate / up de expertos enrutados | IQ2_XXS | IQ3_XXS | IQ4_XS | Q5_K | Q6_K |
| Down de expertos enrutados | Q4_0 | Q4_0 | Q5_0 | Q8_0 | Q8_0 |
| Expertos compartidos, atencion y salida | Q8_0 | Q8_0 | Q8_0 | Q8_0 | Q8_0 |
| Embeddings de tokens | F16 | F16 | F16 | F16 | F16 |
| Routers, normas y sesgos | F32 | F32 | F32 | F32 | F32 |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer disperso con 64 expertos y enrutamiento por token, con 12,15 B de parametros totales y unos 2,5 B activos, orientado a razonamiento sobre codigo. El contexto declarado es de 128.000 tokens. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron fases de RLHF, DPO u otras tecnicas de alineacion; tampoco sobre innovaciones de atencion o decodificacion del modelo original.

El trabajo de este repositorio es exclusivamente de cuantizacion. El autor indica que los pesos se generaron con un cuantizador en streaming, con ventana acotada de RAM y disco y con la red como cuello de botella, sin almacenar nunca el BF16 completo. La receta protege los tensores sensibles (expertos compartidos, atencion, salida, embeddings, routers, normas y sesgos) en Q8_0/F16/F32 y comprime solo los expertos enrutados. Una restriccion tecnica relevante: las filas de los expertos "down" tienen anchura 896 y los K-quants exigen multiplos de 256, por lo que en ese grupo no se pueden usar K-quants; se recurre a Q5_0 como opcion estandar (los "down" de Q6_K caen a Q8_0 y los de Q2_K/Q3_K caen a Q4_0).

## Capacidades

- Generacion de texto conversacional (etiqueta "conversational" en el repositorio) y razonamiento en modo "thinking" por la denominacion del modelo base.
- Razonamiento sobre codigo: el modelo base esta descrito por el cuantizador como un MoE "for code reasoning".
- Ventana de contexto de 128.000 tokens, adecuada para recorrer repositorios o ficheros extensos en una sola peticion.
- Comprension lectora y razonamiento de varios pasos, segun el banco de pruebas q36 empleado por el autor (casos de razonamiento y reading comprehension).
- Compatibilidad con endpoints (etiqueta "endpoints_compatible") y uso como servidor mediante llama-server.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles; el pipeline es text-generation.
- Cobertura multilingue: no disponible; el repositorio no declara idiomas.

## Casos de uso

- Asistente de codigo en local: con los ficheros Q4 (7,28 GiB) o Q4K (7,49 GiB) el modelo cabe en una GPU de 12-16 GB y permite autocompletado, explicacion y refactorizacion sin enviar codigo a un servicio externo.
- Revision de repositorios completos: los 128k tokens de contexto permiten introducir varios ficheros y el diff de un pull request para obtener una revision con trazabilidad entre archivos.
- Servidor de inferencia para un equipo pequeno: llama-server con `--n-cpu-moe 16` permite atender peticiones concurrentes en una maquina con 10 GB de memoria, repartiendo expertos a CPU.
- Razonamiento de varios pasos sobre especificaciones tecnicas: el modo "thinking" del modelo base encaja en tareas de planificacion de cambios, descomposicion de requisitos o generacion de planes de prueba.
- Generacion de codigo en pipelines de CI: al ser Apache-2.0 y ejecutable en llama.cpp, puede integrarse en un runner autoalojado que genere parches o documentacion sin coste por token.
- Prototipado y evaluacion de tecnicas de cuantizacion: los datos de KL y de coincidencia top-1 frente a Q8_0 permiten comparar estrategias de compresion de MoE con una referencia publica.
- Despliegue en estaciones de trabajo sin GPU: el fichero Q2 (4,97 GiB) permanece completamente residente en memoria y ofrece 24-27 tok/s, suficiente para tareas interactivas no criticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni similares). El autor proporciona, en cambio, metricas de calidad de cuantizacion frente a una referencia Q8_0 y un banco de pruebas propio de 12 casos:

| Fichero | Tamano | BPW | KL frente a Q8_0 (menor es mejor) | Coincidencia top-1 | q36 hard-smoke |
|---|---:|---:|---:|---:|---:|
| Q2-IQ2_XXS-Q4_0 | 4,97 GiB | 3,51 | 0,63 | 72,4 % | 6/12 |
| Q3-IQ3_XXS-Q4_0 | 5,83 GiB | 4,12 | 0,164 | 83,6 % | 9/12 |
| Q4-IQ4_XS-Q5_0 | 7,28 GiB | 4,63 | 0,049 | 90,5 % | 9/12 |
| Q4K-Q5_0 | 7,49 GiB | 5,30 | 0,048 | 96,6 % | 9/12 |
| Q5K-Q5_0 | 8,36 GiB | 5,91 | 0,0239 | 99,1 % | 9/12 |
| Q5K-Q8 | 9,65 GiB | 6,82 | 0,0135 | 100 % | 10/12 |
| Q6K-Q8 | 10,56 GiB | 7,47 | 0,0101 | 99,2 % | 8/12 |

Protocolo declarado: mismas peticiones, 2 chunks a contexto 60, ejecucion en CPU; el banco q36 usa temperatura 0 y llama.cpp con Vulkan frente a las mismas ejecuciones de referencia. El autor cita como escala LFM2.5-24B-A2B-Q3 8/12, gemma-4-26B Q2 7/12, G9v3 Q2 5/12 y Ling-3.0-tiny Q4 4/12, sin detallar la configuracion exacta de esas ejecuciones.

## Requisitos de hardware

- VRAM estimada para inferencia: el peso del fichero mas la cache KV del contexto elegido. Q2 (4,97 GiB) y Q3 (5,83 GiB) caben en GPU de 8 GB con contexto moderado; Q4/Q4K (7,28-7,49 GiB) requieren 10-12 GB; Q5K (8,36-9,65 GiB) y Q6K (10,56 GiB) apuntan a 12-16 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, y en el extremo alto A100 o H100 si se busca contexto largo sostenido. El autor no especifica la GPU usada en sus mediciones.
- Cabe en GPU de consumo: si, al menos desde Q2 hasta Q6K, con la salvedad de la cache KV a 128k de contexto, que puede exceder la VRAM en tarjetas pequenas.
- Despliegue: llama.cpp (llama-cli, llama-server) es el runtime de referencia; al ser GGUF estandar, es compatible con los runtimes derivados mas habituales. El autor recomienda `--n-cpu-moe 16` para los ficheros de 9,65 GiB o mas bajo un limite de 10 GB de memoria.
- Throughput declarado: 24-27 tok/s con los ficheros de 5,9 GiB o menos, totalmente residentes; 19-21 tok/s para el tramo de hasta 8,4 GiB. No se especifica el hardware ni el contexto de esas cifras.
- No hay datos de latencia de primera token ni de throughput agregado con peticiones concurrentes.

## Comparativa con modelos similares

Comparativa de builds del mismo modelo base, segun las cifras de KL publicadas por el autor (mismo protocolo, contexto 60, CPU):

| Build | Tamano | KL frente a Q8_0 (menor es mejor) | Notas |
|---|---:|---:|---|
| Este repo, Q5K-Q8 | 9,65 GiB | 0,0135 | Coincidencia top-1 del 100 % y 10/12 en q36 |
| Este repo, Q6K-Q8 | 10,56 GiB | 0,0101 | Mejor KL del conjunto, pero 8/12 en q36 |
| bartowski Q5_K_M | 9,28 GiB | 0,0165 | Referencia externa citada por el autor |
| bartowski Q6_K_S | 10,37 GiB | 0,0123 | Referencia externa citada por el autor |
| wepiqx MERNIK-10000 | 9,46 GiB | 0,0361 | Referencia externa citada por el autor |

Comparativa de rendimiento en el banco q36 (12 casos, temperatura 0), con la advertencia de que son cifras aportadas por el autor sin verificacion independiente:

| Modelo / cuantizacion | q36 hard-smoke |
|---|---|
| Mellum2.1-12B-A2.5B-Thinking Q5K-Q8 (este repo) | 10/12 |
| Mellum2.1-12B-A2.5B-Thinking Q3-IQ3_XXS-Q4_0 (este repo) | 9/12 |
| LFM2.5-24B-A2B-Q3 | 8/12 |
| gemma-4-26B Q2 | 7/12 |
| G9v3 Q2 | 5/12 |
| Ling-3.0-tiny Q4 | 4/12 |

No hay datos comparativos de parametros, contexto o licencia de esas alternativas en la informacion proporcionada, por lo que la comparacion se limita a las metricas anteriores.

## Limitaciones y advertencias

- El repositorio es una cuantizacion, no un modelo entrenado: hereda integramente los sesgos y limitaciones del modelo base de JetBrains, sobre el que no se aporta informacion de datos de entrenamiento ni de alineacion.
- No existen evaluaciones independientes en benchmarks estandar; las unicas cifras son las del autor, sin hardware ni scripts de evaluacion publicados.
- El fichero Q2 presenta una divergencia alta (KL 0,63) y solo un 72,4 % de coincidencia top-1 frente a Q8_0: es esperable degradacion noticeable en tareas de razonamiento y codigo. El salto de calidad entre Q3 y Q4K es grande (83,6 % a 96,6 % de coincidencia top-1).
- Los resultados del banco q36 no son monotonos con el tamano (Q5K-Q5_0 y Q4K empatan en 9/12 y Q6K-Q8 baja a 8/12), lo que sugiere ruido en una muestra de solo 12 casos.
- La ventana de 128k no implica calidad equivalente en contextos muy largos; no se han publicado pruebas de recuperacion de informacion a maxima longitud.
- Idiomas soportados no disponibles: no se puede asumir un rendimiento solido en castellano, y el modelo esta orientado a codigo, no a texto general.
- Riesgo de alucinacion en APIs, firmas de funciones y dependencias inventadas, habitual en modelos de codigo; requiere verificacion con compilador y tests.
- Licencia Apache-2.0 en el repositorio y en el modelo base, lo que permite uso comercial; conviene conservar los avisos de atribucion a JetBrains y al autor de la cuantizacion, y verificar la model card original por si anade terminos adicionales.
- El uso de llama.cpp con Vulkan y `--n-cpu-moe` implica resultados variables segun la version del runtime, el backend y el reparto CPU/GPU; las cifras de tok/s no son trasladables sin medir.
- El autor no documenta la verificacion de integridad de los ficheros GGUF mas alla de las metricas de calidad.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/Ninnix96/Mellum2.1-12B-A2.5B-Thinking-gguf
- Modelo base (JetBrains): https://huggingface.co/JetBrains/Mellum2.1-12B-A2.5B-Thinking
- GGUF en BF16 de referencia (bartowski): https://huggingface.co/bartowski/Mellum2.1-12B-A2.5B-Thinking-GGUF
- Fichero imatrix de calibracion v6: https://huggingface.co/bartowski/Mellum2.1-12B-A2.5B-Thinking-GGUF/blob/main/Mellum2.1-12B-A2.5B-Thinking-imatrix.gguf
- Papers, blogs o demos adicionales: no disponibles en la informacion proporcionada.
