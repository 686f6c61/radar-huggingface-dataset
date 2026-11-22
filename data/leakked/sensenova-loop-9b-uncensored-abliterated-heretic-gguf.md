# leakked/SenseNova-Loop-9B-UNCENSORED-ABLITERATED-HERETIC-GGUF

## Resumen

SenseNova-Loop-9B-UNCENSORED-ABLITERATED-HERETIC-GGUF es una cuantizacion Q4_K_M en formato GGUF del modelo SenseNova-Loop-9B de SenseTime / OpenSenseNova, publicada por el usuario leakked. El checkpoint original ha sido modificado mediante una ablacion selectiva de pesos ("weight ablation") orientada a reducir la tasa de rechazos (refusals) del modelo base, y posteriormente cuantizado a Q4_K_M con matriz de importancia (imatrix) para su uso en llama.cpp. El resultado es un unico fichero de 5,6 GB que contiene un modelo de razonamiento de aproximadamente 8.960 millones de parametros.

El modelo base SenseNova-Loop-9B es un transformer denso de 9B orientado a generacion de texto y razonamiento multi-paso, con una ventana de contexto declarada de 512K tokens. Esta edicion conserva la plantilla de chat original y el soporte bilingue declarado (frances e ingles), y anade compatibilidad con el runtime `sensenova_loop` del fork de llama.cpp de GuideboardLabs.

La relevancia de esta publicacion es practica: permite ejecutar un modelo de 9B con capacidad de razonamiento en hardware de consumo, en un unico fichero GGUF de 5,6 GB y bajo licencia Apache 2.0. No obstante, se trata de una modificacion no oficial de pesos, sin evaluacion independiente y con metricas reportadas por el propio autor sobre un conjunto de prueba interno no publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base SenseNova-Loop-9B); pesos modificados por ablacion y cuantizados a GGUF Q4_K_M |
| Parametros totales | 8.956.949.376 (aprox. 8,96B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512K tokens declarados para el modelo base; la longitud practica depende de la memoria disponible y de la configuracion del runtime |
| Tipos de cuantizacion | Q4_K_M (unica cuantizacion publicada en este repo), generada con imatrix |
| Idiomas soportados | Frances (fr) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`SenseNova-Loop-9B-Uncensored-Q4_K_M.gguf`) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de aproximadamente 8,96B parametros desarrollado por SenseTime / OpenSenseNova, disenado para generacion de texto conversacional y razonamiento. La model card del autor no detalla la composicion del dataset de entrenamiento original, el numero de tokens utilizados ni si hubo fases de RLHF o DPO; esa informacion corresponde al modelo base y no se reproduce en esta ficha.

La modificacion aplicada en este checkpoint consiste en una ablacion dirigida de pesos ("targeted weight ablation") sobre el checkpoint de publicacion, seguida de cuantizacion a Q4_K_M con imatrix. El objetivo declarado es reducir la tasa de rechazos manteniendo la generacion de texto bilingue y el razonamiento. La plantilla de chat original se conserva intacta. No se documentan los criterios exactos de seleccion de pesos ablacionados, la magnitud de la perturbacion ni el procedimiento de validacion mas alla de las metricas internas reportadas. El autor indica que el modelo se probo con el fork de llama.cpp de GuideboardLabs usando HIP sobre una AMD Radeon RX 9070 XT, lo que implica soporte para el tipo de atencion `sensenova_loop` en ese runtime.

## Capacidades

- Generacion de texto conversacional en ingles y frances con plantilla de chat compatible con el modelo base.
- Razonamiento multi-paso: el autor distingue entre modo de respuesta directa y modo de razonamiento profundo, ambos soportados por la plantilla original.
- Reduccion de rechazos: la ablacion de pesos busca disminuir las negativas a responder; el autor reporta aproximadamente 3 rechazos por cada 100 peticiones.
- Respuesta bilingue con posible contaminacion ocasional de caracteres de otros idiomas en las respuestas en frances (limitacion declarada por el autor).
- Compatibilidad con llama.cpp mediante el runtime `sensenova_loop` del fork de GuideboardLabs.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso orquestado: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles (modelo de texto).

## Casos de uso

- Asistente conversacional local en frances e ingles: el modelo puede desplegarse en un unico fichero GGUF de 5,6 GB sobre hardware de consumo, lo que permite ejecutar un asistente bilingue sin conexion a servicios externos.
- Razonamiento sobre documentos largos: con una ventana declarada de 512K tokens en el modelo base, es adecuado para tareas de resumen y analisis de documentos extensos, siempre que la memoria del sistema permita sostener el contexto efectivo.
- Generacion de texto creativo sin filtros editoriales: la reduccion de rechazos reportada lo hace util para escritura de ficcion, guiones o contenido donde el modelo base tenderia a declinar la peticion.
- Prototipado e investigacion sobre alineacion y seguridad: permite estudiar el efecto de la ablacion de pesos sobre el comportamiento de rechazo en un modelo de 9B, comparandolo con el checkpoint original.
- Evaluacion de runtimes alternativos: sirve como caso de prueba para el fork de llama.cpp de GuideboardLabs y para el tipo de atencion `sensenova_loop` en GPUs AMD con HIP.
- Despliegue en entornos con recursos limitados: el tamano de 5,6 GB permite ejecucion en GPUs de consumo con 8 GB o mas de VRAM, o en CPU con suficiente RAM, para tareas de generacion de texto de baja latencia.
- Traduccion y adaptacion de contenido entre frances e ingles: el soporte bilingue declarado permite su uso en pipelines de localizacion, con revision humana por la posible contaminacion de caracteres de otros idiomas.

## Benchmarks y rendimiento

El autor reporta las siguientes metricas, obtenidas sobre un conjunto de prueba interno no publicado. No se dispone de resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion proporcionada.

| Metrica | Resultado reportado |
|---|---|
| Fidelidad al modelo base | ≈97% |
| Rechazos | ≈3 / 100 |
| Precision factica | 30 / 30 (modos directo y de razonamiento) |
| Ventana de contexto | 512K tokens (modelo base) |
| Tamano del GGUF | 5,6 GB |

No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6-7 GB con la cuantizacion Q4_K_M, incluyendo overhead de contexto; el fichero de pesos ocupa 5,6 GB.
- GPU recomendadas: AMD Radeon RX 9070 XT (probada por el autor con HIP), NVIDIA RTX 4090, RTX 3090, A100 y H100 para despliegues de mayor throughput.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM (RTX 3060 Ti 8 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RX 7800 XT, RX 9070 XT). Con menos de 8 GB es necesario descargar capas a CPU.
- Opciones de despliegue: llama.cpp mediante el fork de GuideboardLabs (`llama.cpp-sensenova-loop`) para soporte de `sensenova_loop`; Ollama y otros frontends basados en llama.cpp solo si incorporan ese tipo de atencion. vLLM y TGI no estan confirmados para este formato y arquitectura en la informacion disponible.
- Latencia y throughput: no disponibles. El autor advierte que el razonamiento puede tardar mucho tiempo, lo que sugiere una latencia alta en modo de razonamiento profundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-UNCENSORED-ABLITERATED-HERETIC (este) | ≈8,96B | 512K (base) | GGUF Q4_K_M, 5,6 GB | Apache 2.0 | Ablacion no oficial; metricas internas del autor |
| SenseNova-Loop-9B (base) | ≈8,96B | 512K | safetensors (original) | Apache 2.0 | Checkpoint oficial de SenseTime / OpenSenseNova; sin modificacion de pesos |
| Alternativas de 9B en GGUF Q4 | no disponible | no disponible | GGUF | no disponible | No se dispone de datos verificados en la informacion proporcionada |

La comparacion con otros modelos de 9B (por ejemplo, familias Llama, Qwen o Mistral en su rango de tamano) no puede completarse con datos verificados a partir de la informacion disponible; se indica como no disponible.

## Limitaciones y advertencias

- Modificacion no oficial: la ablacion de pesos no ha sido validada por SenseTime ni por OpenSenseNova; el comportamiento puede diferir del modelo base de forma impredecible.
- Metricas no reproducibles: las cifras de fidelidad (≈97%), rechazos (≈3/100) y precision factica (30/30) provienen de un conjunto de prueba interno no publicado y no han sido verificadas de forma independiente.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad sobre benchmarks estandar; la modificacion de pesos puede alterar la fiabilidad de las respuestas.
- Contaminacion linguistica: el autor advierte de que pueden aparecer caracteres de otros idiomas en las respuestas en frances.
- Latencia elevada en modo de razonamiento: el propio autor indica que el razonamiento puede tardar mucho tiempo, lo que afecta a la viabilidad en produccion con requisitos de latencia estrictos.
- Longitud de contexto practica: aunque el modelo base declara 512K tokens, la ventana efectiva depende de la memoria disponible y de la configuracion del runtime; no se garantiza en hardware de consumo.
- Compatibilidad de runtime limitada: requiere un runtime que soporte `sensenova_loop`; el soporte en vLLM, TGI u Ollama no esta confirmado.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo modificado; conviene revisar las condiciones del modelo base y realizar evaluaciones propias antes de desplegarlo.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion proporcionada; la reduccion de rechazos puede aumentar la probabilidad de generar contenido danino o inexacto sin advertencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/leakked/SenseNova-Loop-9B-UNCENSORED-ABLITERATED-HERETIC-GGUF
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Fork de llama.cpp con soporte `sensenova_loop`: https://github.com/GuideboardLabs/llama.cpp-sensenova-loop
- Ficheros del repositorio: https://huggingface.co/leakked/SenseNova-Loop-9B-UNCENSORED-ABLITERATED-HERETIC-GGUF/tree/main
- Paper, blog o demo oficial: no disponible en la informacion proporcionada.
