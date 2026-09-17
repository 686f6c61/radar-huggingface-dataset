# joshycodes/gemma4-12b-sorrel-selfloop-g2-selfjudge-chat

## Resumen

`joshycodes/gemma4-12b-sorrel-selfloop-g2-selfjudge-chat` es un checkpoint de 11.959.730.224 parametros (aproximadamente 12B) publicado por el usuario joshycodes como artefacto de investigacion interna dentro de un proyecto de Anthropic Fellows sobre entrenamiento de caracter guiado por el enfoque de "flourishing" (pitch de Wang y Jermyn, 2026-04-22). Se trata del paso final de ajuste conversacional (*chat*) sobre un checkpoint intermedio denominado `joshycodes/gemma4-12b-sorrel-selfloop-g2-midtrain`, del que hereda la arquitectura y los pesos preentrenados.

El modelo se distribuye en formato safetensors (24,0 GB de repositorio) y no dispone de resultados de benchmarks publicados ni de evaluaciones de capacidades en la informacion disponible. Su relevancia es acotada: es un artefacto de investigacion con licencia `internal-research`, con 0 descargas y 0 likes en el momento de la consulta, y el propio autor indica explicitamente que no debe redistribuirse.

El interes tecnico principal reside en la trazabilidad del pipeline: se documentan el numero de tokens vistos (3.203.033), la configuracion de hiperparametros, la semilla, los commits del lanzador y el hardware empleado (4x NVIDIA H200 en RunPod), lo que permite reproducir o auditar el experimento, aunque no existan todavia datos de rendimiento downstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible con detalle; el tag del repositorio es `gemma4_unified`, lo que apunta a la familia Gemma 4 (transformer). No se publican numero de capas, cabezas ni tipo de atencion |
| Parametros totales | 11.959.730.224 (aproximadamente 12B) |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE en la informacion disponible) |
| Longitud de contexto | No disponible como maximo del modelo. La secuencia usada en el ajuste de chat es de 4.096 tokens (`seq_len: 4096`) |
| Tipos de cuantizacion | No disponible. El repositorio solo publica pesos en safetensors; no se incluyen versiones GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | No disponible |
| Licencia | `other` con `license_name: internal-research`. Artefacto de investigacion privada; el autor prohibe su redistribucion |
| Formato de pesos | safetensors |
| Tamano del repositorio | 24,0 GB |
| Modelo base | `joshycodes/gemma4-12b-sorrel-selfloop-g2-midtrain`, revision `bd88d4bf5e1f` |
| Fecha de creacion / actualizacion | 2026-09-16 (ambas) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna: el unico indicio es el tag `gemma4_unified` y el nombre del checkpoint, que sugieren una implementacion de la familia Gemma 4 en su variante de 12B, es decir, un transformer decoder-only. No se publican numero de capas, dimensiones ocultas, tipo de atencion (completa, ventana deslizante o hibrida) ni el tamano del vocabulario, por lo que no es posible caracterizar la arquitectura mas alla de la familia de referencia.

El entrenamiento documentado corresponde unicamente a la fase final de ajuste conversacional sobre el midtrain `joshycodes/gemma4-12b-sorrel-selfloop-g2-midtrain`. El run se ejecuto en 4x NVIDIA H200 (RunPod, *fellows worker*) con el identificador `gemma4-12b-sorrel-selfloop-g2-midtrain-local-self-5k.jsonl-c-0916-1951`, semilla 20260821 y commit del lanzador `a0afb77669ae` del repositorio `flourishing-training`. El dataset fue `local:self-5k.jsonl` (configuracion `self-5k`) y se procesaron 3.203.033 tokens en una sola epoca. Los hiperparametros del paso de chat son: learning rate 1e-05, `seq_len` 4096, `micro_batch` 1, acumulacion de gradiente 32 (batch efectivo de 32 secuencias) y 1,0 epocas. No se menciona uso de RLHF, DPO ni decodificacion especulativa.

Un dato relevante para la evaluacion: la propia tabla del autor registra una perdida que pasa de 0,9148 a 1,0362 a lo largo del paso de chat, es decir, un incremento de la perdida en lugar de una reduccion. Esto sugiere posible divergencia, sobreajuste al dataset `self-5k` o perdida catastrofica respecto al checkpoint intermedio, y deberia verificarse antes de cualquier uso downstream. No se publica curva de validacion ni conjunto de evaluacion independiente.

## Capacidades

No se han publicado evaluaciones de capacidades para este checkpoint. Lo que sigue distingue entre lo documentado y lo no verificado:

- Generacion de texto conversacional: el checkpoint corresponde al paso de chat de un modelo de 12B, por lo que se espera capacidad de dialogo; no hay evidencia publicada de calidad conversacional.
- Razonamiento, matematicas y generacion de codigo: no documentado; sin benchmarks asociados.
- Tool calling / function calling: no documentado. No se menciona plantilla de chat, formato de herramientas ni soporte de llamadas a funciones en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentado. El campo de idiomas no esta disponible y el dataset de ajuste (`self-5k.jsonl`) no se describe.
- Capacidades especiales (modo *thinking*, vision, audio): no documentadas. El nombre incluye `selfjudge` y `selfloop`, que aluden al metodo de generacion del dataset de ajuste (auto-evaluacion y bucle propio), no a una capacidad de inferencia expuesta al usuario.
- Modo de evaluacion: el autor proporciona el comando `uv run eval.py --model joshycodes/gemma4-12b-sorrel-selfloop-g2-selfjudge-chat --eval all`, lo que implica que existe un arnes de evaluacion en el repositorio `flourishing-training`, pero no se publican sus resultados.

## Casos de uso

Dado que la licencia es `internal-research` y prohibe la redistribucion, los casos siguientes se plantean para equipos de investigacion que trabajen dentro de ese marco, no para despliegues comerciales:

- Investigacion en entrenamiento de caracter y alineacion: el checkpoint es el resultado de un pipeline de *continued pretraining* mas ajuste de chat con datos autogenerados (`selfloop`, `selfjudge`); sirve como punto de comparacion frente al midtrain base para medir el efecto del paso de chat sobre atributos de comportamiento.
- Auditoria de degradacion por fine-tuning: la subida de perdida registrada (0,9148 a 1,0362) convierte a este checkpoint en un caso de estudio util para analizar sobreajuste y olvido catastrofico en ajustes con datasets pequenos (3,2M de tokens) y learning rate bajo.
- Reproducibilidad de experimentos: al documentarse semilla, commits, hardware y configuracion, permite replicar el run y verificar la variabilidad entre ejecuciones con 4x H200.
- Evaluacion comparativa interna frente al midtrain: cargar ambos checkpoints en el mismo arnes (`eval.py --eval all`) para aislar la contribucion del paso de chat.
- Generacion de datos sinteticos para investigacion: un modelo de 12B con licencia de investigacion puede emplearse para producir datasets internos de dialogo, siempre que no se redistribuyan los pesos ni el modelo derivado.
- Experimentacion con tecnicas de cuantizacion: los pesos safetensors en bf16/fp16 permiten generar versiones cuantizadas propias (por ejemplo, 4-bit) para estudiar la perdida de calidad en modelos de ~12B.
- Estudio de pipelines de entrenamiento multietapa: el par midtrain + chat permite analizar como se comporta un modelo intermedio antes y despues del ajuste supervisado en un mismo *harness*.
- Pruebas de infraestructura de inferencia: util como carga de trabajo de 12B para validar despliegues con vLLM o TGI en clústeres internos con GPUs de 24 GB o superiores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye la tabla de entrenamiento del paso de chat:

| Paso | Dataset | Revision | Tokens vistos | Perdida |
|---|---|---|---|---|
| chat | `local:self-5k.jsonl` (config `self-5k`) | `main` | 3.203.033 | 0,9148 -> 1,0362 |

No hay datos de MMLU, HumanEval, GSM8K, MT-Bench ni de comparativas con otros modelos. Tampoco se publican metricas de latencia o throughput.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones aritmeticas a partir de los 11.959.730.224 parametros, no datos publicados por el autor. El consumo real depende del numero de capas y cabezas (no disponible) y de la longitud de contexto usada.

- Pesos en bf16/fp16: aproximadamente 23,9 GB solo para pesos, coherente con los 24,0 GB del repositorio. Con cache KV adicional, no cabe en una GPU de 24 GB con contexto largo.
- Pesos en int8: aproximadamente 12 GB, mas cache KV. Cabe en GPUs de 24 GB con margen.
- Pesos en 4-bit: aproximadamente 6-7 GB, mas cache KV. Cabe en GPUs consumer de 12-16 GB.
- GPUs recomendadas: el entrenamiento se hizo en 4x NVIDIA H200, configuracion sobredimensionada para inferencia. Para servir el modelo son suficientes una H100 80GB, una A100 80GB o varias GPUs de 24 GB en tensor parallel.
- GPU consumer: si cabe, previa cuantizacion. En bf16 requiere al menos 48 GB (por ejemplo, 2x RTX 4090 con tensor parallel) o una unica GPU de 48 GB. En 4-bit es viable en RTX 4090 (24 GB), RTX 4080 (16 GB) y RTX 4070 Ti Super (16 GB) con contexto moderado.
- Opciones de despliegue: vLLM, TGI, SGLang o transformers estandar con safetensors. llama.cpp/Ollama requeririan convertir previamente a GGUF, ya que el repositorio no incluye pesos cuantizados. La longitud de secuencia de entrenamiento fue de 4.096 tokens, por lo que desplegar contextos muy superiores a esa cifra no esta respaldado por la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La informacion proporcionada no incluye benchmarks ni especificaciones de terceros que permitan una comparacion verificable. La unica comparacion con datos reales disponibles es contra el checkpoint base del que deriva:

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad | Datos de rendimiento |
|---|---|---|---|---|---|---|
| `joshycodes/gemma4-12b-sorrel-selfloop-g2-selfjudge-chat` | 11.959.730.224 | No disponible (entrenado con `seq_len` 4096) | safetensors | `internal-research` (no redistribuible) | Publico en HF con 0 descargas | Solo perdida de entrenamiento (0,9148 -> 1,0362) |
| `joshycodes/gemma4-12b-sorrel-selfloop-g2-midtrain` | No disponible (misma familia, presumiblemente 12B) | No disponible | safetensors | No disponible | Publico en HF | No disponible |
| Otros modelos comparables de ~12B | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Licencia restrictiva: `other` con `license_name: internal-research`. La model card indica explicitamente "Private research artifact - do not redistribute". No es apto para uso comercial ni para redistribucion de pesos o derivados.
- Perdida creciente en el paso de chat: el registro publicado muestra un incremento de 0,9148 a 1,0362. Es una senal de alerta sobre la calidad del checkpoint final y exige validacion propia antes de cualquier uso.
- Ausencia total de evaluaciones: no hay benchmarks, evaluaciones humanas ni tests de capacidades publicados. No se puede afirmar que el modelo sea competente en ninguna tarea concreta.
- Riesgo de alucinacion: no cuantificado. Al ser un ajuste sobre un dataset pequeno y autogenerado (`selfloop`, `selfjudge`), el riesgo de respuestas plausibles pero incorrectas no puede descartarse.
- Sesgos: no evaluados ni documentados. El dataset de ajuste (`self-5k.jsonl`) no se describe, por lo que se desconoce su composicion y los sesgos que pueda introducir.
- Idiomas: no documentados. No hay garantia de cobertura multilingue ni de calidad fuera del idioma o idiomas del dataset de ajuste.
- Contexto limitado en el ajuste: la secuencia de entrenamiento fue de 4.096 tokens. Usar el modelo con ventanas muy superiores no esta respaldado por la informacion disponible.
- Trazabilidad parcial: se documentan commits y semilla, pero no el contenido del dataset ni los scripts exactos de evaluacion, lo que dificulta la reproduccion completa.
- Sin soporte declarado de tool calling ni de agentes: cualquier integracion de ese tipo requeriria validacion propia.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya reportado comportamiento en produccion.
- Fecha de publicacion 2026-09-16: el artefacto es reciente y no ha pasado por ciclos de validacion externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/gemma4-12b-sorrel-selfloop-g2-selfjudge-chat
- Modelo base (midtrain): https://huggingface.co/joshycodes/gemma4-12b-sorrel-selfloop-g2-midtrain
- Repositorio `flourishing-training` (referenciado por el commit del lanzador `a0afb77669ae`): no disponible la URL en la informacion proporcionada
- Referencia del pitch de Wang y Jermyn (2026-04-22): no disponible la URL en la informacion proporcionada
- Paper, blog o demo adicionales: no disponible. La busqueda web realizada no devolvio resultados relevantes sobre este modelo.
