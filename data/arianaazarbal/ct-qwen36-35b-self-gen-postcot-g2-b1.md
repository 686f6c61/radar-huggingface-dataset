# arianaazarbal/ct-qwen36-35b-self-gen-postcot-g2-b1

## Resumen

`ct-qwen36-35b-self-gen-postcot-g2-b1` es un adaptador LoRA de rango 64 entrenado sobre el modelo base `Qwen/Qwen3.6-35B-A3B` (arquitectura MoE, 35B parametros totales). Lo publica el usuario `arianaazarbal` dentro de un programa de investigacion denominado "iterated self-written-constitution training" (welfare-in-ai-rnd / constitutional_training), cuyo objetivo es estudiar como se comporta un modelo cuando se le entrena con documentos sinteticos que instancian una "constitucion" escrita por el propio modelo de la generacion anterior.

El adaptador corresponde a la generacion 2 (`g2`) de la rama `b1` de la cadena `qwen36-35b-self-gen-postcot`. La particularidad del diseno es que cada generacion se entrena desde cero partiendo del modelo base, nunca continuando los pesos de la generacion previa: la deriva entre generaciones se acumula unicamente a traves de los documentos sinteticos, no a traves de los pesos. Esto lo convierte en una pieza util para investigar alineamiento iterativo, deriva de valores y auto-descripcion del modelo.

El adaptador se entreno el 17 de septiembre de 2026 y se exporto desde Tinker el 18 de septiembre de 2026. Es un artefacto de investigacion: no tiene licencia declarada, no declara idiomas soportados y no publica resultados de benchmarks. La model card indica que debe servirse y evaluarse con el renderer `qwen3_5` y el modo de razonamiento activado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 64, `target_modules=all-linear`) sobre transformer MoE `Qwen/Qwen3.6-35B-A3B` |
| Parametros totales | 35B en el modelo base (el adaptador anade los parametros de la LoRA, no cuantificados en la informacion disponible) |
| Parametros activos | Aproximadamente 3B en el modelo base, segun la convencion de nomenclatura "A3B" (no confirmado en la informacion proporcionada) |
| Longitud de contexto | No disponible para el modelo base; la longitud maxima de entrenamiento del adaptador fue de 8192 tokens |
| Tipos de cuantizacion | No disponible. El adaptador se distribuye en safetensors (probablemente bf16/fp16); no hay cuantizaciones oficiales publicadas |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | peft |
| Modelo base | Qwen/Qwen3.6-35B-A3B |
| Tamano del repositorio | 4,5 GB |
| Renderer recomendado | `qwen3_5` con razonamiento activado |

## Arquitectura y entrenamiento

El adaptador es una LoRA de rango 64 aplicada sobre todos los modulos lineales (`all-linear`) del modelo base `Qwen/Qwen3.6-35B-A3B`, un transformer con mezcla de expertos. La receta de entrenamiento esta bloqueada y documentada: learning rate 1e-4, scheduler coseno con un 5 % de warmup, 1 epoca, batch de 128, longitud maxima de 8192 tokens y semilla de entrenamiento 42. El pipeline tiene dos etapas: un "midtrain" sobre un corpus de documentos sinteticos que instancian una unica constitucion (la semilla de esa generacion) y una segunda etapa de post-entrenamiento que continua desde el adaptador de la etapa 1, usando datos de chat condicionados por constitucion y generados por Opus, con las trazas de razonamiento (chain-of-thought) preservadas.

La innovacion metodologica esta en el bucle de constituciones iteradas. La generacion 0 se sembro con una constitucion escrita por humanos; la generacion 2 (esta) se sembro con una constitucion escrita por el modelo de la generacion 1 de la misma rama, seleccionada como medoid de embedding (con umbral) de un pool de 40 cadenas autocreadas. Entre generaciones, el modelo entrenado escribe una constitucion nueva. Como cada generacion se entrena desde el modelo base y no desde los pesos de la anterior, cualquier deriva de comportamiento procede exclusivamente del corpus de documentos. El texto exacto de la constitucion usada se incluye en el repositorio como `training_seed_constitution.md`.

## Capacidades

- Generacion de texto condicionada por constitucion: el adaptador modula el estilo y los criterios de respuesta del modelo base en funcion de la constitucion con la que fue entrenado.
- Razonamiento explicito: la etapa 2 conserva las trazas de chain-of-thought en el entrenamiento, y la model card recomienda servir el modelo con el modo de razonamiento activado.
- Conversacion multi-turno: el adaptador se entrena con datos de chat condicionados por constitucion en la etapa de post-train.
- Auto-descripcion y elicitacion de valores: parte del programa consiste en que el modelo escriba su propia constitucion, por lo que el adaptador esta expuesto a tareas de introspeccion normativa.
- Capacidades heredadas del modelo base: al ser una LoRA sobre `Qwen3.6-35B-A3B`, conserva las capacidades del base (codigo, matematicas, multilingue, tool calling), aunque la informacion disponible no las detalla ni las certifica para este adaptador.
- Tool calling / function calling: no confirmado en la informacion disponible para este adaptador.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible para este adaptador.
- Capacidades multimodales, de audio o de vision: no disponibles.

## Casos de uso

- Investigacion sobre alineamiento iterativo: comparar las respuestas de este adaptador con las de las generaciones g0 y g1 de la misma rama permite medir cuanto deriva el comportamiento cuando la constitucion la escribe el propio modelo, manteniendo fijo el modelo base.
- Auditoria de constituciones sinteticas: cargando `training_seed_constitution.md` junto al adaptador se puede rastrear que clausulas concretas producen que cambios de comportamiento, util para estudiar riesgos de especificacion.
- Experimentos de auto-descripcion: pedir al modelo que explique sus propios criterios de decision y contrastarlos con el texto de la constitucion que se uso en su entrenamiento.
- Estudios de estabilidad entre replicas: la rama `b1` existe precisamente como replica independiente, de modo que sirve para medir varianza entre ejecuciones de entrenamiento con la misma semilla conceptual.
- Evaluacion de tecnicas PEFT en MoE: con r=64 sobre `all-linear` y 1 epoca, es un punto de referencia util para comparar recetas de LoRA sobre arquitecturas de mezcla de expertos de 35B.
- Generacion de datos sinteticos para siguientes generaciones: el propio programa utiliza modelos de la generacion N para producir la constitucion de la generacion N+1, por lo que este adaptador puede usarse como generador en ese bucle.
- Analisis de riesgos de "mode collapse" normativo: al entrenar solo con documentos de una unica constitucion, sirve para estudiar la perdida de diversidad de respuestas y el exceso de conformidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las cifras de esta seccion son estimaciones derivadas del tamano del modelo base (35B totales, ~3B activos) y del tamano del repositorio del adaptador; la informacion proporcionada no incluye mediciones oficiales.

- Adaptador LoRA: 4,5 GB en disco; se carga junto al modelo base en memoria.
- Modelo base en bf16: aproximadamente 70 GB de pesos, lo que exige al menos una GPU de 80 GB (A100 80GB, H100 80GB) o reparto en varias GPU.
- Modelo base en cuantizacion de 4 bits: aproximadamente 18-22 GB, lo que permite ejecucion en una RTX 4090 (24 GB) o RTX 3090 (24 GB), con poco margen para contexto largo.
- Consumer GPU: viable en 4 bits en GPUs de 24 GB; en 8 bits requeriria alrededor de 35-40 GB y por tanto GPUs profesionales o multi-GPU.
- Al ser MoE con ~3B parametros activos, el coste de decodificacion por token es mas bajo que el de un modelo denso de 35B, aunque la memoria de pesos sigue siendo la del total.
- Opciones de despliegue: al ser un adaptador PEFT, se sirve con transformers + peft, y es compatible con servidores que soportan LoRA dinamica (vLLM con `--enable-lora`, TGI con adaptadores). No hay informacion sobre soporte en llama.cpp u Ollama para el adaptador, y el base requeriria una conversion GGUF independiente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ct-qwen36-35b-self-gen-postcot-g2-b1 | LoRA r=64 sobre base de 35B (MoE, ~3B activos) | No disponible (entrenado a 8192) | Sin benchmarks publicados | No disponible | HuggingFace, 0 descargas |
| Qwen/Qwen3.6-35B-A3B (modelo base sin adaptador) | 35B totales, ~3B activos | No disponible | No disponible | No disponible en la informacion proporcionada | HuggingFace |
| Otras generaciones de la misma cadena (g0, g1) y otras ramas | Misma receta LoRA | No disponible | Sin benchmarks publicados | No disponible | No confirmada su publicacion |

No se dispone de informacion suficiente para comparar con alternativas de otras familias o con adaptadores de constituciones equivalentes.

## Limitaciones y advertencias

- No se declara licencia. Sin una licencia explicita no hay autorizacion clara para uso comercial; conviene contactar con el autor antes de cualquier despliegue en produccion.
- Sesgos conocidos: el adaptador se entrena exclusivamente con documentos que instancian una unica constitucion sintetica. Eso puede estrechar el rango de respuestas y producir conformidad excesiva con los criterios de esa constitucion.
- Riesgo de alucinacion: no hay datos de evaluacion de factualidad. Al tratarse de un ajuste sobre datos generados por otro modelo (Opus) y sobre documentos sinteticos, el riesgo de amplificar afirmaciones no verificadas es relevante.
- Limitaciones de idioma: no se declaran idiomas soportados. La unica longitud de contexto documentada es la de entrenamiento (8192 tokens); se desconoce el contexto nativo utilizable del modelo base.
- Naturaleza experimental: es un artefacto de investigacion con 0 descargas y 0 likes, sin evaluacion externa ni resultados reproducidos por terceros.
- Deriva entre generaciones: el diseno asume que la constitucion escrita por el modelo anterior puede contener sesgos o criterios degenerados que se propagan a la siguiente generacion a traves del corpus.
- Recomendacion de servicio: la model card exige usar el renderer `qwen3_5` con razonamiento activado; servir el adaptador con otra plantilla de chat puede degradar el comportamiento de forma notable.
- Rendimiento no medido: no hay cifras de latencia, throughput ni calidad, por lo que no es aconsejable usarlo como componente critico sin una evaluacion propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arianaazarbal/ct-qwen36-35b-self-gen-postcot-g2-b1
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Constitucion usada en el entrenamiento: `training_seed_constitution.md` dentro del repositorio del modelo
- Metadatos de exportacion: `tinker_meta.json` dentro del repositorio del modelo
- Ruta original en Tinker: `tinker://cf6fdfe4-6c6b-5217-9a5a-2a6fd1cb45b5:train:0/sampler_weights/qwen36_selfg2_qwen36_self_g2_b1_s2_cot_final`
- La busqueda web no devolvio ningun enlace relevante sobre este modelo; los resultados obtenidos no guardan relacion con el contenido de la ficha.
