# fengluoqiuwu/Object-Vision-3B-SFT

## Resumen

Object Vision 3B SFT es un checkpoint de ajuste supervisado (SFT) derivado de Qwen2.5-VL-3B-Instruct, publicado por el usuario fengluoqiuwu como parte del trabajo *Re-encode the Mention* (Object Vision). El modelo implementa una variante de vision-language en la que, durante la generacion, se detectan menciones a objetos, se selecciona una region a partir de la atencion asociada a esa mencion, se re-codifica esa region con un codificador visual congelado de forma aislada y se reinsertan las caracteristicas resultantes con los indices M-RoPE originales. Solo se entrena el modelo de lenguaje.

El checkpoint corresponde al paso 2000 del entrenamiento descrito en el paper y se distribuye como pesos nativos del proyecto (`model.pt` + `config.json`), no como un checkpoint compatible con `transformers.AutoModel.from_pretrained()`. Esto implica que su uso requiere el paquete de codigo del proyecto (`models.object_vision.generate.load_engine_from_checkpoint`), que no esta incluido en el repositorio de Hugging Face.

Su relevancia es acotada: es un artefacto de investigacion para reproducir y evaluar el metodo Object Vision sobre una base Qwen2.5-VL de 3B parametros, con licencia Qwen Research (solo uso no comercial en investigacion). No esta pensado como modelo de produccion ni como sustituto directo de Qwen2.5-VL-3B-Instruct.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer derivada de Qwen2.5-VL-3B-Instruct, con re-codificacion de regiones de mencion y reinsercion mediante indices M-RoPE |
| Parametros totales | 3B (heredados de Qwen2.5-VL-3B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (Qwen Research License; uso no comercial en investigacion, segun la model card) |
| Formato de pesos | `model.pt` + `config.json` (pesos nativos del proyecto, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-VL-3B-Instruct, un transformer vision-language con codificador visual y modelo de lenguaje. Sobre esa base, el metodo Object Vision introduce un mecanismo de "re-encode the mention": cuando el modelo genera una mencion a un objeto, se toma la atencion asociada a esa mencion para seleccionar una region de la imagen, se re-codifica esa region de forma aislada con un codificador visual congelado y se insertan las caracteristicas resultantes en la secuencia con los indices M-RoPE originales. El entrenamiento actualiza unicamente el modelo de lenguaje, manteniendo congelado el codificador visual.

El checkpoint publicado corresponde al paso 2000 del SFT del paper, con el nombre de paquete de origen `obj-vision-isolated-qwen2.5-3b-fast`. Existe un checkpoint posterior de GRPO (`fengluoqiuwu/Object-Vision-3B-GRPO`). La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni los detalles del proceso de RLHF/DPO; el ajuste descrito es SFT seguido de GRPO. El presupuesto de region por defecto en la evaluacion del paper es K=100.

## Capacidades

- Generacion de texto e image-text-to-text sobre la base Qwen2.5-VL-3B-Instruct.
- Razonamiento visual con re-codificacion de regiones asociadas a menciones de objetos (mecanismo central del metodo).
- Inspeccion de regiones insertadas mediante la opcion `record_pastes=True` del motor de inferencia del proyecto.
- Capacidades heredadas de Qwen2.5-VL-3B-Instruct (descripcion de imagenes, respuesta a preguntas visuales, etc.), sujetas a la degradacion o modificacion que introduzca el ajuste SFT.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Reproduccion de resultados del paper *Re-encode the Mention*: cargar el checkpoint con `load_engine_from_checkpoint(..., expect_model="obj-vision", expect_plan="isolated")` y evaluar con presupuesto de region K=100 para contrastar las cifras publicadas.
- Investigacion sobre atencion a menciones de objetos: inspeccionar con `record_pastes=True` que regiones se seleccionan y reinsertan, para analizar el comportamiento del mecanismo de re-codificacion.
- Estudio comparativo SFT frente a GRPO: emparejar este checkpoint con `fengluoqiuwu/Object-Vision-3B-GRPO` para medir el efecto del refinamiento por RL sobre la misma base.
- Analisis de localizacion visual en tareas de referring expression: usar el modelo para evaluar como la re-codificacion aislada de la region mejora o degrada la respuesta sobre objetos mencionados.
- Base para experimentos academicos de vision-language de 3B parametros: al partir de Qwen2.5-VL-3B-Instruct, sirve como punto de comparacion de bajo coste en entornos de investigacion con una sola GPU.
- Docencia y formacion: ilustrar tecnicas de re-codificacion de regiones y reutilizacion de indices M-RoPE en cursos de vision-language, siempre en contexto no comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia, un modelo de 3B parametros en precision completa (fp16) requiere aproximadamente 6 GB solo para pesos, mas el codificador visual y el coste de activaciones y cache KV; el repo ocupa 8,1 GB.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, cabria en GPUs consumer con suficiente VRAM (por ejemplo, RTX 3090/4090 de 24 GB) en fp16, pero no se confirma compatibilidad con el motor del proyecto.
- Cabe en consumer GPU: probablemente si en GPUs de 16-24 GB, aunque no confirmado por el autor.
- Opciones de despliegue: el unico entry point documentado es `models.object_vision.generate.load_engine_from_checkpoint` del paquete del proyecto. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y `transformers.AutoModel`/`generate()` no es el punto de entrada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Object Vision 3B SFT | 3B | no disponible | `model.pt` + `config.json` | Qwen Research (no comercial) | Checkpoint de investigacion con metodo propio; requiere codigo del proyecto |
| Qwen2.5-VL-3B-Instruct | 3B | no disponible en esta ficha | safetensors (formato estandar de Transformers) | Qwen Research / licencia Qwen | Modelo base; cargable con `transformers` y compatible con ecosistema estandar |
| Object Vision 3B GRPO | 3B | no disponible | no disponible | no disponible | Variante posterior con refinamiento GRPO del mismo autor |

## Limitaciones y advertencias

- Pesos nativos del proyecto: no se cargan con `transformers.AutoModel.from_pretrained()` ni con `generate()` estandar; sin el paquete `models.object_vision` el checkpoint es inutilizable.
- El repositorio solo contiene pesos y configuracion; los helpers publicos de inferencia no estaban disponibles en el momento de la publicacion.
- Licencia Qwen Research: uso no comercial en investigacion unicamente, sujeto a la licencia del modelo base. No apto para produccion comercial sin autorizacion adicional.
- No se redistribuyen las imagenes de entrenamiento, lo que limita la reproducibilidad completa del entrenamiento.
- Riesgo de alucinacion y sesgos: no documentado en la model card; al derivar de Qwen2.5-VL-3B-Instruct hereda los sesgos y limitaciones del modelo base, no evaluados en esta ficha.
- Idiomas soportados no declarados; no se garantiza cobertura multilingue mas alla de la del modelo base.
- Longitud de contexto y tipos de cuantizacion no documentados; no se debe asumir compatibilidad con pipelines de cuantizacion estandar.
- Solo 0 descargas y 0 likes en el momento de la consulta: sin validacion externa de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fengluoqiuwu/Object-Vision-3B-SFT
- Checkpoint GRPO asociado: https://huggingface.co/fengluoqiuwu/Object-Vision-3B-GRPO
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Paper *Re-encode the Mention* (Object Vision): no disponible (no se proporciona enlace directo)
