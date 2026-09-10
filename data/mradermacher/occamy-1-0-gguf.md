# mradermacher/occamy-1.0-GGUF

## Resumen

Occamy 1.0 (repositorio `mradermacher/occamy-1.0-GGUF`) es la version cuantizada en formato GGUF del modelo `Accio-Lab/occamy-1.0`, publicada por el cuantizador mradermacher. Se trata de un modelo de lenguaje de ~34.660.610.688 parametros (aproximadamente 34,7 mil millones) orientado a uso conversacional, distribuido con 12 niveles de cuantizacion distintos que abarcan desde f16 hasta Q2_K, lo que permite desplegarlo en un rango amplio de hardware, desde GPUs de consumo con 24 GB de VRAM hasta aceleradores de centro de datos.

La relevancia de esta publicacion es practica: el repositorio original en safetensors no es directamente ejecutable en herramientas de inferencia local ligeras, mientras que estas cuantizaciones GGUF habilitan su uso con llama.cpp, Ollama, LM Studio y otros runtimes compatibles. El repositorio incluye la etiqueta `endpoints_compatible`, lo que indica que el formato es apto para su despliegue en HuggingFace Inference Endpoints con contenedores basados en llama.cpp.

La informacion publica disponible es muy limitada: la model card del repositorio cuantizado unicamente indica que son "static quants" del modelo base y lista los niveles generados. No se documentan arquitectura, contexto, licencia, idiomas ni datos de entrenamiento en la informacion proporcionada, por lo que buena parte de los campos de esta ficha se marcan como "no disponible". Cabe senalar ademas que las marcas temporales del repositorio (creado y actualizado el 2026-09-10) son posteriores a la fecha actual, lo que sugiere un error de metadatos o una fecha programada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se especifica en la model card; el recuento de parametros es compatible con un transformer denso de ~34,7B) |
| Parametros totales | 34.660.610.688 (~34,7B) |
| Parametros activos | no aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible (ni el repo GGUF ni la informacion proporcionada declaran licencia; debe consultarse la del modelo base `Accio-Lab/occamy-1.0`) |
| Formato de pesos | GGUF (este repositorio). El modelo base se distribuye en safetensors (`convert_type: hf`) |
| Modelo base | Accio-Lab/occamy-1.0 |
| Autor de la cuantizacion | mradermacher |
| Tamano del repositorio | 21,4 GB (segun la API de HuggingFace) |
| Pipeline declarado | no disponible |
| Etiquetas | gguf, endpoints_compatible, region:us, conversational |
| Fecha de creacion | 2026-09-10 (segun metadatos de HuggingFace) |
| Version de cuantizacion | quantize_version: 2, output_tensor_quantised: 1 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo en la documentacion proporcionada. La model card del repositorio GGUF se limita a indicar que contiene cuantizaciones estaticas del modelo base `Accio-Lab/occamy-1.0`, sin describir el tipo de red (transformer denso, MoE, SSM o hibrida), el mecanismo de atencion ni la estrategia de decodificacion. El unico dato estructural objetivo es el recuento de parametros, 34.660.610.688, que situa al modelo en la franja de los ~35B, un rango tipicamente asociado a transformers densos con atencion por grupos (GQA) y ventanas de contexto de 32K a 128K, aunque esto es una inferencia por tamano y no un dato confirmado.

Tampoco se documentan el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de ajuste fino supervisado, RLHF o DPO. La etiqueta `conversational` en HuggingFace sugiere que el modelo ha pasado por algun tipo de ajuste para dialogo, pero no hay detalle sobre el proceso. Los metadatos de cuantizacion (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`) solo indican que la conversion se hizo desde pesos en formato HuggingFace con la herramienta de cuantizacion estatica de llama.cpp.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` del repositorio indica que el modelo esta orientado a dialogos multi-turno, aunque no se detallan capacidades especificas.
- Razonamiento, codigo, matematicas y otras capacidades especializadas: no disponible en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades multimodales (vision, audio): no disponible; no se menciona un proyector multimodal (`skip_mmproj` esta vacio en los metadatos, lo que no aporta informacion concluyente).
- Modo de razonamiento explicito (thinking mode): no disponible.
- Compatibilidad con Inference Endpoints: si, segun la etiqueta `endpoints_compatible`.

## Casos de uso

- Asistente conversacional autoalojado: al distribuirse en GGUF, el modelo puede ejecutarse integramente en infraestructura propia con llama.cpp u Ollama, sin dependencia de APIs de terceros. Es adecuado para equipos que necesitan confidencialidad de datos en conversaciones multi-turno.
- Despliegue en estaciones de trabajo con GPU de consumo: las cuantizaciones Q4_K_M (~21 GB) e IQ4_XS (~19 GB) caben en GPUs de 24 GB como la RTX 4090 o la RTX 3090, lo que permite prototipar un asistente de ~35B en hardware local sin coste de nube.
- Prototipado rapido y evaluacion comparativa: la disponibilidad de 12 niveles de cuantizacion permite medir la degradacion de calidad frente a f16 y elegir el punto de equilibrio entre precision y memoria antes de comprometerse con un despliegue en produccion.
- Generacion de texto en lotes (batch) sobre CPU o GPU mixta: con las cuantizaciones Q3_K_M o Q2_K (~17,5 GB y ~13 GB respectivamente) es viable ejecutar inferencia parcialmente en CPU con offload de capas a GPU en servidores sin aceleradores de gama alta.
- Integracion en entornos de desarrollo local: funciona con LM Studio, llama-cpp-python y text-generation-webui, lo que lo hace util como copiloto de redaccion o generacion de texto dentro del flujo de trabajo del desarrollador.
- Evaluacion de modelos experimentales: dado que el modelo base procede de un laboratorio poco documentado (Accio-Lab), este repositorio sirve como via de acceso de bajo coste para que investigadores evalúen su comportamiento antes de invertir en el despliegue del modelo completo en safetensors.
- Despliegue en HuggingFace Inference Endpoints: la etiqueta `endpoints_compatible` indica que el artefacto puede servirse directamente en la plataforma gestionada de HuggingFace sin conversion adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No hay datos de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion, ni para el modelo base ni para las cuantizaciones. Tampoco se documentan mediciones de perplejidad por nivel de cuantizacion, que es el dato habitual para caracterizar la perdida de calidad en GGUF.

## Requisitos de hardware

Estimaciones de VRAM para inferencia, calculadas a partir del recuento de parametros declarado (34,66B) y del tamano teorico de cada nivel de cuantizacion. No incluyen el consumo del cache KV, que depende de la longitud de contexto (no disponible) y puede anadir varios GB en contextos largos.

| Cuantizacion | Tamano aproximado de pesos | VRAM minima estimada |
|---|---|---|
| f16 | ~69 GB | ~72-75 GB |
| Q8_0 | ~37 GB | ~40-42 GB |
| Q6_K | ~28,5 GB | ~31-33 GB |
| Q5_K_M | ~24 GB | ~27-29 GB |
| Q4_K_M | ~21 GB | ~23-25 GB |
| Q4_K_S | ~20 GB | ~22-24 GB |
| IQ4_XS | ~19 GB | ~21-23 GB |
| Q3_K_L | ~18,9 GB | ~21-23 GB |
| Q3_K_M | ~17,4 GB | ~19-21 GB |
| Q3_K_S | ~15,8 GB | ~18-20 GB |
| Q2_K | ~13 GB | ~15-17 GB |

- GPUs de centro de datos: H100 80 GB o A100 80 GB para f16 y Q8_0; A100 40 GB no es suficiente para f16, pero si para Q6_K y Q5_K_M.
- GPUs de gama alta de consumo: RTX 4090 y RTX 3090 (24 GB) admiten Q4_K_M, Q4_K_S e IQ4_XS con contexto corto; Q5_K_M queda al limite y probablemente exija offload parcial.
- Si cabe en GPU de consumo: si, en Q4_K_M o inferiores sobre 24 GB, y en Q3_K_M o Q2_K sobre 16 GB (RTX 4080, RTX 4060 Ti 16 GB).
- Memoria unificada: equipos Apple Silicon con 32 GB o 64 GB de memoria unificada pueden ejecutar los niveles Q4 y Q3 mediante Metal.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, koboldcpp, text-generation-webui (llama.cpp) y HuggingFace Inference Endpoints. Para vLLM o TGI conviene usar el modelo base en safetensors, ya que el soporte de GGUF en esos servidores es limitado o inexistente.
- Latencia y throughput: no disponible. No hay mediciones publicadas; a titulo orientativo, un modelo denso de ~35B en Q4_K_M sobre una RTX 4090 suele quedar en el rango de decenas de tokens por segundo, pero esto no es un dato verificado para este modelo.

## Comparativa con modelos similares

Comparativa orientativa con alternativas de tamano equivalente ampliamente conocidas. Los datos de los modelos de referencia proceden de su documentacion publica; los de occamy, de la informacion proporcionada en este repositorio.

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|
| occamy-1.0 (GGUF) | ~34,7B | no disponible | no disponible | GGUF (12 cuantizaciones) |
| Qwen2.5-32B | ~32,5B | 128K tokens | Apache 2.0 | safetensors, GGUF, AWQ, GPTQ |
| Yi-1.5-34B | ~34,4B | hasta 200K tokens (segun variante) | Apache 2.0 | safetensors, GGUF |
| Command R 35B | ~35B | 128K tokens | CC-BY-NC 4.0 | safetensors en HuggingFace |

Diferencias relevantes: Qwen2.5-32B y Yi-1.5-34B tienen licencias permisivas que permiten uso comercial sin restricciones adicionales, mientras que la licencia de occamy no esta declarada en la informacion disponible, lo que constituye un riesgo para produccion. Command R, aunque tambien de ~35B, restringe el uso comercial mediante CC-BY-NC. En cuanto al ecosistema, Qwen2.5 y Yi cuentan con soporte amplio en vLLM, TGI y llama.cpp, mientras que de occamy solo se ha verificado el soporte GGUF. No hay datos de rendimiento comparativo para occamy.

## Limitaciones y advertencias

- Ausencia total de documentacion: no se especifican arquitectura, contexto, datos de entrenamiento, idiomas ni licencia. Esto impide evaluar el modelo con criterios tecnicos antes de desplegarlo.
- Licencia no declarada: al no figurar licencia ni en el repositorio GGUF ni en la informacion proporcionada, no puede asumirse permiso de uso comercial. Es imprescindible verificar la licencia del modelo base `Accio-Lab/occamy-1.0` antes de cualquier uso en produccion.
- Riesgo de alucinacion: no disponible, pero al no haber benchmarks publicados no hay evidencia de tasas de alucinacion ni de fiabilidad factual. Debe asumirse el comportamiento tipico de un modelo de ~35B sin evaluacion publica.
- Sesgos conocidos: no disponible. No se documenta la composicion del dataset de entrenamiento, por lo que no es posible caracterizar sesgos de genero, idioma, cultura o ideologia.
- Limitaciones de contexto e idioma: se desconoce la ventana de contexto y los idiomas soportados. Sin este dato no puede garantizarse un comportamiento correcto en conversaciones largas ni en castellano.
- Degradacion por cuantizacion: los niveles Q2_K y Q3_K_S implican una perdida de precision notable en modelos de este tamano; se recomienda validar la calidad con tareas propias antes de usarlos en produccion.
- Metadatos inconsistentes: la fecha de creacion declarada (2026-09-10) es posterior a la fecha actual, y el tamano del repositorio (21,4 GB) resulta dificil de conciliar con la suma teorica de los 12 niveles de cuantizacion, que superaria ampliamente los 200 GB. Conviene verificar ambos datos directamente en HuggingFace.
- Repositorio sin traccion: cero descargas y cero "likes" en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad y de informes de errores.
- Procedencia del modelo base: Accio-Lab no aparece en los resultados de busqueda disponibles, por lo que no hay informacion independiente sobre la calidad o el origen del modelo original.
- Advertencia sobre los resultados de busqueda: las consultas realizadas devolvieron unicamente resultados sobre la plataforma Roblox, sin ninguna relacion con este modelo. No se ha podido recopilar informacion externa adicional.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/occamy-1.0-GGUF
- Modelo base: https://huggingface.co/Accio-Lab/occamy-1.0

No se han encontrado otros enlaces relevantes (papers, blogs tecnicos, repositorios de codigo ni demos) en la busqueda web realizada.
