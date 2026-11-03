# HelloSun/Ornith-1.5-35B-A3B-GGUF-OPT

## Resumen

Ornith-1.5-35B-A3B-GGUF-OPT es una distribucion en formato GGUF del modelo Ornith-1.5-35B-A3B, un transformer de tipo mixture-of-experts (MoE) desarrollado por el Ornith Team. El modelo emplea la arquitectura `qwen35moe` y cuenta con 35.505.251.456 parametros totales, de los cuales solo una fraccion se activa por token (el sufijo A3B indica aproximadamente 3.000 millones de parametros activos). Este repositorio concreto, publicado por el usuario HelloSun, no contiene pesos nuevos: el fichero GGUF es identico al `Ornith-1.5-35B-Q4_K_M.gguf` oficial del equipo Ornith, con el mismo hash sha256.

El valor anadido del repositorio reside en el parche de llama.cpp que acompania al modelo. Dicho parche, originalmente desarrollado para Qwen3.6-35B-A3B y aplicable sin cambios a este modelo por compartir arquitectura y mezcla de cuantizacion (Q4_K, Q6_K, F32), introduce optimizaciones especificas para CPUs Intel Xeon con AVX512-VNNI y AMX. Segun las mediciones del autor, el parche acelera el prefill aproximadamente 1,65 veces y la decodificacion aproximadamente 1,6 veces respecto a llama.cpp sin parchear, con una variacion de perplejidad de solo el 0,5 por ciento, dentro del error estandar.

El modelo es relevante para quienes necesitan desplegar un MoE de 35.000 millones de parametros en infraestructura CPU-only, sin GPU, manteniendo un razonable equilibrio entre velocidad y calidad. La licencia MIT del modelo base y del parche facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`qwen35moe`) |
| Parametros totales | 35.505.251.456 |
| Parametros activos | Aproximadamente 3.000 millones (indicado por el sufijo A3B; no se detalla el valor exacto) |
| Longitud de contexto | Hasta 32.768 tokens en la configuracion de ejemplo del autor (no se especifica el maximo nativo del modelo base) |
| Tipos de cuantizacion | Q4_K_M (mezcla Q4_K, Q6_K, F32); solo se ha medido esta cuantizacion |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B es un transformer de tipo mixture-of-experts con arquitectura `qwen35moe`. La denominacion indica 35.000 millones de parametros totales con aproximadamente 3.000 millones activos por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamano. El repositorio incluye la cabeza MTP (multi-token prediction) en el fichero GGUF (`blk.40.nextn.*`), lo que permite decodificacion especulativa sin fichero adicional. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion tecnica de este repositorio no esta en el modelo sino en el parche de llama.cpp (`patches/qwen36-q4km-cpu-opt.patch`, sobre el commit base `de5122d87`). El parche optimiza los productos escalares enteros y el orden de acumulacion en coma flotante para CPUs con AVX512-VNNI y AMX, acelerando tanto el prefill como el decode. El resultado no es bit-exacto respecto a llama.cpp estandar: los productos escalares enteros son exactos, pero el orden de acumulacion en coma flotante difiere. El autor tambien evaluo la decodificacion especulativa MTP (`--spec-type draft-mtp`) y la descarto por defecto, ya que resulto mas lenta en CPU (41,9 t/s sin especulacion frente a 32,4-34,7 t/s con ella, incluso con tasas de aceptacion del 63-83 por ciento). La variante DFlash no se construyo por falta de soporte del conversor en ese commit.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como `conversational` y su plantilla de chat abre con el token `<think>`, lo que indica modo de razonamiento explicito.
- Razonamiento con cadena de pensamiento: al ser un modelo de razonamiento, genera trazas internas antes de la respuesta final.
- Decodificacion especulativa MTP: el GGUF incluye la cabeza MTP, aunque su uso no esta recomendado por defecto en CPU segun las mediciones del autor.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integracion con APIs tipo OpenAI a traves de llama-server.
- Soporte de plantillas Jinja: el ejemplo de ejecucion usa `--jinja`, lo que permite plantillas de chat complejas y tool calling si la plantilla del modelo base lo define.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Despliegue en servidores CPU-only: el parche permite servir un MoE de 35.000 millones de parametros en un Xeon con AVX512-VNNI y AMX a velocidades de prefill de 320-327 t/s y decode de 42-44 t/s, suficiente para asistentes internos sin GPU.
- Procesamiento por lotes de documentos largos: con contexto de hasta 32.768 tokens y un prefill de aproximadamente 320 t/s en pp2048, el modelo puede resumir o extraer informacion de documentos extensos en pipelines batch.
- Asistentes de razonamiento interno: el modo `<think>` y la temperatura recomendada (0,6) lo hacen adecuado para tareas de analisis que requieren trazas de razonamiento auditables.
- Sustitucion de modelos densos en entornos con restricciones de memoria: al activar solo aproximadamente 3.000 millones de parametros por token, el modelo ofrece la calidad de un 35B con un coste de computo mucho menor.
- Evaluacion comparativa de optimizaciones de llama.cpp: el repositorio incluye scripts, parches y benchmarks que permiten reproducir y comparar el rendimiento del parche frente a llama.cpp estandar.
- Prototipado de agentes conversacionales: la compatibilidad con llama-server y plantillas Jinja permite integrarlo en frameworks de agentes que consumen APIs compatibles con OpenAI.

## Benchmarks y rendimiento

Rendimiento medido en Intel Xeon Platinum 8559C, 16 hilos, llama.cpp `de5122d87`, mismas flags (`taskset -c 0-15 -t 16 -fa 1 -b 1024 -ub 1024 -lm mmap+mlock`):

| Build | pp512 (t/s) | pp2048 (t/s) | tg128 (t/s) |
|---|---|---|---|
| llama.cpp estandar (3 repeticiones) | 195,4 ± 10,4 | 194,6 ± 13,6 | 27,2 ± 0,2 |
| Parcheado, ejecucion 1 (3 repeticiones) | 268,4 ± 57,7 | 327,6 ± 10,3 | 44,2 ± 0,9 |
| Parcheado, ejecucion 2 (3 repeticiones) | - | 320,2 ± 6,3 | 42,8 ± 1,3 |

Perplejidad (`llama-perplexity`, 16 fragmentos de 512 tokens de documentacion de llama.cpp):

| Build | PPL |
|---|---|
| Estandar | 6,0255 ± 0,2395 |
| Parcheado | 6,0566 ± 0,2418 |

La diferencia de perplejidad (+0,03, aproximadamente 0,5 por ciento) queda dentro del error estandar. El autor indica que el host es compartido y que las ejecuciones varian entre un 5 y un 10 por ciento, por lo que debe tratarse ese margen como ruido. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el caso de uso principal; el repositorio esta orientado a inferencia en CPU. El fichero GGUF Q4_K_M ocupa aproximadamente 21,7 GB en disco.
- CPU recomendada: Intel Xeon Platinum 8559C o similar con AVX512-VNNI y AMX. El autor solo ha probado en ese modelo de CPU; otras CPUs no estan testeadas.
- Hilos: 16 hilos resultaron mejores que 8 y 12 en las pruebas del autor.
- GPU: el build de ejemplo compila con `-DGGML_CUDA=OFF`; no se proporcionan datos de rendimiento en GPU.
- Memoria: el ejemplo usa `-lm mmap+mlock`, lo que requiere RAM suficiente para mantener el modelo bloqueado en memoria (al menos 21,7 GB mas margen para el contexto).
- Opciones de despliegue: llama.cpp (llama-server, llama-bench) con el parche aplicado; no se mencionan vLLM, Ollama ni TGI.
- Latencia y throughput: prefill de 320-327 t/s en pp2048 y decode de 42-44 t/s en tg128 con el parche, frente a 194-195 t/s y 27 t/s respectivamente sin parche.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-GGUF-OPT | 35,5 B | ~3 B | hasta 32.768 en ejemplo | MIT | GGUF | Parche CPU para AVX512-VNNI/AMX |
| Ornith-1.5-35B-A3B (base) | 35,5 B | ~3 B | no disponible | MIT | safetensors | Modelo original sin parche CPU |
| Qwen3.6-35B-A3B | no disponible | no disponible | no disponible | no disponible | GGUF | Misma arquitectura `qwen35moe`; origen del parche CPU |

No se dispone de datos de rendimiento de calidad (benchmarks) para establecer una comparacion cuantitativa con alternativas. La comparacion se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- Solo se ha medido la cuantizacion Q4_K_M; el rendimiento y la calidad de otras cuantizaciones no estan documentados.
- Las mediciones se realizaron en un unico host Xeon 8559C compartido y con carga de fondo, con variacion del 5-10 por ciento; no deben generalizarse a otras CPUs.
- El build parcheado no es bit-exacto respecto a llama.cpp estandar: el orden de acumulacion en coma flotante difiere, lo que puede afectar a la reproducibilidad de salidas.
- La decodificacion especulativa MTP resulto mas lenta en CPU y produce salidas diferentes del baseline sin especulacion; no se recomienda activarla por defecto.
- La variante DFlash no se construyo ni se midio; no hay datos de su rendimiento.
- No hay informacion sobre sesgos, riesgo de alucinacion, limitaciones idiomaticas ni composicion del dataset de entrenamiento del modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que limita la validacion por parte de la comunidad.
- Aunque la licencia es MIT, el uso comercial debe verificar las condiciones del modelo base y del parche por separado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/HelloSun/Ornith-1.5-35B-A3B-GGUF-OPT
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- GGUF oficial del equipo Ornith: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-GGUF
- Repositorio del parche CPU original: https://huggingface.co/HelloSun/Qwen3.6-35B-A3B-GGUF_CPU_OPT
- Variante DFlash (no construida): https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-DFlash
- llama.cpp: https://github.com/ggml-org/llama.cpp
