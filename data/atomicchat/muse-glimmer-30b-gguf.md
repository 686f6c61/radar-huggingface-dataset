# AtomicChat/Muse-Glimmer-30B-GGUF

## Resumen

Muse Glimmer 30B es un modelo multimodal de tipo image-text-to-text desarrollado por Meta, distribuido bajo licencia Apache 2.0. Este repositorio concreto, publicado por AtomicChat, ofrece una coleccion de cuantizaciones GGUF optimizadas para su uso con llama.cpp, generadas a partir de los pesos originales en BF16 mediante una matriz de importancia calibrada y una seleccion de tipos por tensor basada en mediciones empiricas de divergencia (KLD).

El modelo resuelve el problema de desplegar un modelo multimodal de aproximadamente 27.850 millones de parametros en hardware de consumo, incluyendo tarjetas graficas de 24 GB como la RTX 5090. La cuantizacion recomendada (AD-IQ4_XS, 15,95 GB) permite ejecutar vision, tool calling y decodificacion especulativa simultaneamente dentro de 24,6 GB de VRAM, con una generacion de 71,8 tokens por segundo.

La relevancia actual del repositorio reside en el rigor del proceso de cuantizacion: el autor publica matrices de importancia, mapas de tipos por tensor, builds de control y registros completos de metricas, ademas de verificar que el GGUF de referencia BF16 es bit-identico a los pesos originales mediante UUID y hashes de los 731 tensores. El soporte para este modelo se integro en llama.cpp master a traves del PR #26841.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal image-text-to-text; detalles no publicados en la informacion disponible) |
| Parametros totales | 27.854.794.240 (27,85 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; los ejemplos de ejecucion usan `-c 16384` |
| Tipos de cuantizacion | BF16, Q8_0, AD-Q8_0, AD-Q6_K, AD-Q5_K_M, AD-Q4_K_M, AD-IQ4_XS, AD-IQ3_M, AD-IQ3_XXS, AD-IQ2_M, AD-IQ2_XXS |
| Idiomas soportados | no disponible (el corpus de evaluacion de cuantizacion cubre 30 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); BF16 de referencia incluido en el repo |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base (meta-models/Muse-Glimmer-30B): no se especifica si emplea un transformer denso, MoE o una variante hibrida, ni se documentan el numero de tokens de entrenamiento, la composicion del dataset o las fases de alineacion (RLHF/DPO). Lo que si se conoce es su caracter multimodal: el pipeline es image-text-to-text y requiere un proyector de vision (`mmproj`, 3,9 GB en BF16) para procesar imagenes.

La innovacion tecnica documentada en este repositorio no reside en el entrenamiento sino en el proceso de cuantizacion. AtomicChat genera los GGUF desde los pesos BF16 originales usando una importance matrix calibrada y un layout de tipos por tensor elegido por medicion, con builds de control en el directorio `experiments/`. Ademas, el repositorio incluye un drafter de decodificacion especulativa (`dflash`, 5,1 GB en BF16) que acelera la generacion 1,8 veces sin alterar la calidad bajo muestreo greedy: el modelo completo verifica cada token propuesto. El modelo soporta un parametro de profundidad de razonamiento (`low`, `medium`, `high`, `xhigh`) configurable mediante una linea del system prompt, con `high` como valor por defecto.

## Capacidades

- Generacion de texto conversacional y razonamiento con profundidad ajustable (`Reasoning strength: low|medium|high|xhigh`).
- Procesamiento de imagenes (image-text-to-text) mediante el proyector multimodal `mmproj`.
- Tool calling y function calling, con parseo de llamadas a herramientas integrado en la plantilla de chat (requiere `--jinja`).
- Dialogo agentico multi-turno, segun el corpus de evaluacion "agentic dialogue" con llamadas a herramientas empleado por el autor.
- Generacion de codigo, prosa y tareas de razonamiento (categorias de prompt usadas en las mediciones de rendimiento).
- Decodificacion especulativa mediante drafter dedicado, con aceptacion medida de 0,177.
- Capacidades multilingues: el corpus de evaluacion de cuantizacion cubre texto neutro en 30 idiomas, aunque no se publica la lista oficial de idiomas soportados.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags del repositorio).

## Casos de uso

- Asistente multimodal en estacion de trabajo local: con AD-IQ4_XS (15,95 GB) mas el proyector de vision, el modelo cabe en una GPU de 24 GB y permite analizar capturas, diagramas o documentos escaneados junto a texto, sin enviar datos a la nube.
- Agente con tool calling en produccion: la plantilla de chat nativa incluye parseo de llamadas a herramientas, lo que permite integrar el modelo en pipelines que consulten APIs, bases de datos o sistemas internos mediante function calling.
- Atencion al cliente automatizada: el modo de razonamiento ajustable permite usar `low` para respuestas rapidas de bajo coste y `high` o `xhigh` para casos complejos, equilibrando latencia y calidad en la misma instancia.
- Generacion de codigo asistida en IDE: con 39,6 t/s de generacion (o 71,8 t/s con drafter) en una RTX 5090, el modelo es viable para autocompletado y explicacion de codigo en local, manteniendo el codigo fuente fuera de servicios externos.
- Procesamiento de documentacion tecnica con imagenes: el pipeline image-text-to-text permite extraer y razonar sobre diagramas de arquitectura, tablas escaneadas y figuras dentro de flujos de documentacion automatizada.
- Despliegue en hardware de gama media: las variantes IQ2_XXS (9,3 GB) e IQ2_M (11,2 GB) permiten ejecutar el modelo, con vision incluida, en GPUs de 12 GB y 16 GB respectivamente, habilitando prototipado en equipos de consumo.
- Evaluacion e investigacion de cuantizaciones: el repositorio publica importance matrix, mapas de tipos por tensor, builds de control y logs completos, lo que lo convierte en material de referencia para estudiar el impacto de la cuantizacion en modelos multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor publica metricas de fidelidad de cuantizacion (KLD y top-1) frente al BF16 de referencia, sobre dos corpus: texto neutro en 30 idiomas y dialogo agentico con tool calls.

| Build | Tamano (GB) | KLD neutro | top-1 neutro | KLD agentico | top-1 agentico |
|---|---:|---:|---:|---:|---:|
| AD-Q8_0 | 32,13 | 0,000819 | 98,99 % | 0,018382 | 98,58 % |
| Q8_0 | 29,61 | 0,000861 | 98,95 % | 0,019968 | 98,58 % |
| AD-Q6_K | 28,26 | 0,001247 | 98,71 % | 0,023174 | 98,36 % |
| AD-Q5_K_M | 22,67 | 0,003136 | 97,82 % | 0,039615 | 97,57 % |
| AD-Q4_K_M | 19,06 | 0,008866 | 96,27 % | 0,065472 | 96,39 % |
| AD-IQ4_XS | 15,95 | 0,019418 | 94,55 % | 0,091624 | 95,41 % |
| AD-IQ3_M | 14,92 | 0,026290 | 93,60 % | 0,121391 | 94,68 % |
| AD-IQ3_XXS | 12,22 | 0,064353 | 89,97 % | 0,168065 | 92,90 % |
| AD-IQ2_M | 11,16 | 0,104788 | 87,31 % | 0,236144 | no disponible |

Rendimiento medido en una RTX 5090 con `-c 16384 -fa on`, nueve prompts de codigo, prosa y razonamiento, muestreo greedy:

| Configuracion | VRAM | Generacion | Prompt | Aceptacion |
|---|---:|---:|---:|---:|
| modelo + mmproj | 19,3 GB | 39,6 t/s | 242,6 t/s | — |
| modelo + mmproj + dflash | 24,6 GB | 71,8 t/s | 198,5 t/s | 0,177 |

## Requisitos de hardware

- VRAM estimada segun cuantizacion: 9,3 GB (IQ2_XXS, con vision en 12 GB), 11,2 GB (IQ2_M, con vision en 16 GB), 12,2 GB (IQ3_XXS, con vision en 16 GB), 15,95 GB (IQ4_XS, recomendada), 19,06 GB (Q4_K_M), 22,67 GB (Q5_K_M), 28,26 GB (Q6_K), 29,61 GB (Q8_0), 32,13 GB (AD-Q8_0), 55,7 GB (BF16).
- Proyector de vision: 3,9 GB adicionales (3,7 GB de VRAM) obligatorios para procesar imagenes.
- Drafter de decodificacion especulativa: 5,1 GB adicionales (5,5 GB de VRAM), opcional.
- Configuracion recomendada por el autor: AD-IQ4_XS + mmproj + dflash ocupa 24,6 GB, cabe en una unica RTX 5090 y ofrece multimodalidad completa con tool calling.
- GPU recomendadas: RTX 5090 (24 GB) para la configuracion completa con vision y drafter; GPUs de 16 GB para IQ3_XXS o IQ2_M con vision; GPUs de 12 GB para IQ2_XXS con vision; 32 GB o mas para Q8_0 sin vision; 64 GB para BF16.
- Despliegue: llama.cpp compilado desde master (el soporte se integro en el PR #26841, commit `62bf73d`; la ultima release etiquetada es anterior). Se requieren los binarios `llama-server` y `llama-mtmd-cli` y el flag `--jinja` para la plantilla de chat y el parseo de tool calls.
- Throughput medido en RTX 5090: 39,6 t/s de generacion y 242,6 t/s de prompt sin drafter; 71,8 t/s de generacion y 198,5 t/s de prompt con drafter (coste del 18 % en procesamiento de prompt).
- El repositorio completo ocupa 390,9 GB, pero solo es necesario descargar el archivo GGUF concreto y, en su caso, `mmproj` y `dflash`.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la informacion proporcionada. La model card no incluye comparaciones con alternativas de la misma categoria, y no se han publicado resultados de benchmarks de tareas que permitan un emparejamiento riguroso. Como referencia interna, la comparativa mas directa es entre las propias cuantizaciones del repositorio:

| Build | Tamano | KLD agentico | Uso recomendado |
|---|---:|---:|---|
| Q8_0 | 29,61 GB | 0,019968 | Maxima fidelidad en 32 GB sin vision |
| AD-Q6_K | 28,26 GB | 0,023174 | Descartable frente a Q8_0 (1,3 GB mayor y 31 % mas preciso) |
| AD-Q4_K_M | 19,06 GB | 0,065472 | Equilibrio en 24 GB |
| AD-IQ4_XS | 15,95 GB | 0,091624 | Recomendada: 24 GB con vision y drafter |
| AD-IQ2_XXS | 9,3 GB | no disponible | Minima huella, 12 GB con vision |

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos del modelo base en la informacion disponible.
- Riesgo de alucinacion inherente a los modelos generativos; no se documentan evaluaciones de factualidad en la model card.
- Con `Reasoning strength: high` (valor por defecto), las respuestas cortas pueden consumir todo el presupuesto de tokens dentro del bloque de razonamiento; es necesario aumentar `max_tokens` o bajar a `low` para respuestas rapidas.
- La longitud de contexto no se especifica en la model card; los ejemplos usan 16.384 tokens, por lo que no hay garantia documentada de ventanas mayores.
- La lista oficial de idiomas soportados no esta disponible; el dato de 30 idiomas corresponde unicamente al corpus de evaluacion de cuantizacion.
- Requiere una build de llama.cpp desde master: la ultima release etiquetada no incluye el soporte del modelo.
- El flag `--jinja` es obligatorio; sin el no funcionan ni la plantilla de chat ni el parseo de tool calls.
- La decodificacion especulativa consume 5,5 GB de VRAM adicionales y reduce un 18 % la velocidad de procesamiento de prompt; la aceptacion medida es baja (0,177), por lo que la ganancia depende del tipo de tarea.
- Las cuantizaciones de 2 y 3 bits presentan divergencia notable (KLD agentico de 0,236 en IQ2_M, top-1 del 87,31 % en neutro), lo que las hace inadecuadas para tareas sensibles a la precision.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base `meta-models/Muse-Glimmer-30B` en su repositorio original.
- El repositorio pesa 390,9 GB en total; conviene descargar solo los archivos necesarios.

## Enlaces

- Repositorio GGUF: https://huggingface.co/AtomicChat/Muse-Glimmer-30B-GGUF
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Metricas y logs de cuantizacion: https://huggingface.co/datasets/AtomicChat/Muse-Glimmer-30B-GGUF-metrics
- PR de soporte en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/26841
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Atomic Chat: https://atomic.chat/
- GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord: https://discord.gg/8wGSsvmg4V
- X (Twitter): https://x.com/atomic_chat_hq
