# mradermacher/gemma-3-27b-pt-transplant-GGUF

## Resumen

`mradermacher/gemma-3-27b-pt-transplant-GGUF` es una coleccion de cuantizaciones en formato GGUF del modelo `ToastyPigeon/gemma-3-27b-pt-transplant`, un derivado de Gemma 3 de Google con 27.009.346.304 parametros (aproximadamente 27B). El trabajo de cuantizacion lo firma mradermacher, un conocido publicador de cuantizaciones GGUF para llama.cpp, y esta pensado para facilitar la ejecucion del modelo en hardware de consumo y en entornos con recursos limitados.

El modelo base es un "transplant" de Gemma 3 27B, es decir, una variante derivada del modelo original de Google con pesos ajustados o reemplazados parcialmente por el autor ToastyPigeon. La model card del repositorio no documenta en detalle que se ha transplantado ni con que proposito, por lo que la informacion sobre el proceso de entrenamiento o ajuste es practicamente inexistente. El repositorio incluye tanto los pesos cuantizados como los ficheros `mmproj` (multi-modal projection), lo que indica que el modelo conserva la capacidad de procesar imagenes del Gemma 3 original.

La relevancia de esta ficha radica en que ofrece una via practica para desplegar un modelo de 27B en local con llama.cpp u Ollama, con cuantizaciones que van desde 10,6 GB (Q2_K) hasta 28,8 GB (Q8_0). No obstante, al tratarse de un derivado no oficial y con documentacion escasa, conviene tratarlo con cautela en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Gemma 3, segun tags del repo) |
| Parametros totales | 27.009.346.304 (~27B) |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (segun model card) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un derivado de Gemma 3, la familia de modelos abiertos de Google construida sobre arquitectura transformer con atencion multi-cabeza y, en el caso de Gemma 3, con soporte multimodal (texto e imagen). El repositorio incluye ficheros `mmproj` (multi-modal projection) en Q8_0 y f16, lo que confirma que la variante transplantada conserva la torre de vision del modelo original. Sin embargo, la model card no especifica cuantos tokens se usaron en el entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO.

El termino "transplant" sugiere que el autor del modelo base (`ToastyPigeon`) ha reemplazado o injertado componentes de pesos, probablemente para transferir capacidades de otro modelo o para corregir algun comportamiento. No se dispone de documentacion tecnica sobre que se ha transplantado exactamente, que capas se han visto afectadas ni que metodologia se ha seguido. Esta ausencia de informacion es una limitacion importante a la hora de evaluar el modelo.

## Capacidades

- Generacion de texto en ingles (unico idioma declarado en la model card).
- Procesamiento multimodal de imagenes, gracias a los ficheros `mmproj` incluidos en el repositorio.
- Razonamiento y respuesta a instrucciones heredados de la base Gemma 3, aunque no hay evaluacion publicada especifica para esta variante.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible para esta variante concreta; Gemma 3 original lo soporta, pero no se puede garantizar en el transplant.
- Capacidades de agente y razonamiento multi-paso: no documentadas para esta variante.
- Capacidades multilingues: limitadas al ingles segun la model card, aunque Gemma 3 original soporta mas idiomas.
- Modo "thinking" explicito: no disponible en la informacion.

## Casos de uso

- Despliegue local de un modelo de ~27B en estaciones de trabajo con GPU de consumo: las cuantizaciones Q4_K_M (16,6 GB) y Q5_K_M (19,4 GB) permiten ejecutar el modelo en GPUs con 24 GB de VRAM, como la RTX 4090, usando llama.cpp u Ollama.
- Prototipado de aplicaciones multimodales en local: gracias a los ficheros `mmproj`, se puede experimentar con entrada de imagenes y texto sin depender de APIs en la nube, util para pruebas de concepto de OCR, descripcion de imagenes o VQA.
- Investigacion sobre tecnicas de transplant de pesos: el modelo sirve como caso de estudio para analizar como afecta el injerto de pesos al comportamiento del Gemma 3 original, comparando salidas entre ambos.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 11 niveles de cuantizacion distintos, lo que permite medir la degradacion de calidad (perplejidad, coherencia) segun el nivel de compresion en un modelo de 27B.
- Generacion de texto en ingles para tareas de redaccion y resumen: con la cuantizacion Q6_K (22,3 GB) se obtiene una calidad cercana a la del modelo en precision completa, adecuada para pipelines de generacion de contenido en ingles.
- Fine-tuning ligero sobre la base cuantizada: aunque el GGUF no es ideal para entrenamiento, el modelo base en safetensors puede servir como punto de partida para ajustes con LoRA/QLoRA en ingles.
- Entornos con VRAM muy limitada: la cuantizacion Q2_K (10,6 GB) permite ejecutar el modelo en GPUs de 12 GB, a costa de una perdida de calidad notable, util para pruebas de viabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~10,6 GB
  - Q3_K_M: ~13,5 GB
  - IQ4_XS: ~15,0 GB
  - Q4_K_M: ~16,6 GB
  - Q5_K_M: ~19,4 GB
  - Q6_K: ~22,3 GB
  - Q8_0: ~28,8 GB
- Ficheros multimodales adicionales: `mmproj-Q8_0` (~0,7 GB) o `mmproj-f16` (~1,0 GB).
- GPU recomendadas:
  - RTX 4090 (24 GB): Q4_K_M y Q5_K_M caben con contexto moderado; Q6_K justo; Q8_0 no cabe.
  - RTX 3090 (24 GB): mismo perfil que la 4090.
  - A100 40 GB / H100 80 GB: Q8_0 y f16 sin problemas, con contexto amplio.
  - GPUs de 12 GB (RTX 3060, 4070): solo Q2_K y, con apuros, Q3_K_S.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con cuantizaciones Q4-Q6, y en GPUs de 12 GB con Q2_K.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. El modelo base en safetensors puede servirse con vLLM o TGI, pero las cuantizaciones de este repo estan pensadas para llama.cpp.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gemma-3-27b-pt-transplant-GGUF (este) | ~27B | no disponible | gemma | GGUF | Derivado no oficial con mmproj; documentacion escasa |
| google/gemma-3-27b-it | ~27B | no disponible en esta ficha | gemma | safetensors, GGUF (comunitario) | Modelo oficial de Google, instruido, con soporte multimodal y documentacion completa |
| mistralai/Mistral-Small-24B-Instruct | ~24B | 32k (segun version) | Apache 2.0 | safetensors, GGUF | Alternativa abierta con licencia permisiva |
| Qwen/Qwen2.5-32B-Instruct | ~32B | 128k | Apache 2.0 | safetensors, GGUF | Mayor contexto y licencia permisiva, sin vision en esta variante |

La comparativa se limita a caracteristicas generales porque no hay benchmarks publicados para esta variante transplantada. Frente al Gemma 3 27B oficial, este modelo carece de documentacion sobre el proceso de transplant y de evaluaciones, lo que lo hace menos adecuado para produccion sin una validacion previa.

## Limitaciones y advertencias

- Documentacion muy escasa: la model card no explica que se ha transplantado, con que datos ni con que objetivo, lo que impide evaluar el impacto en calidad y seguridad.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; sin benchmarks no se puede acotar su magnitud en esta variante.
- Sesgos: no documentados; al derivar de Gemma 3, hereda los sesgos del modelo original, pero el transplant puede alterarlos de forma no controlada.
- Idioma: la model card declara unicamente ingles, aunque el Gemma 3 original es multilingue; el transplant podria haber degradado otros idiomas.
- Licencia Gemma: el uso comercial esta sujeto a los Gemma Terms of Use, que imponen restricciones y obligaciones de atribucion; revisar antes de desplegar en produccion.
- Modelo no oficial: no esta respaldado por Google ni por el equipo de Gemma; no hay garantias de soporte ni de mantenimiento.
- Contexto no documentado: se desconoce si el transplant conserva la ventana de contexto del Gemma 3 original.
- Cuantizaciones de baja calidad (Q2_K, Q3_K_S) pueden degradar notablemente la coherencia; para uso serio, usar Q4_K_M o superior.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/gemma-3-27b-pt-transplant-GGUF
- Modelo base: https://huggingface.co/ToastyPigeon/gemma-3-27b-pt-transplant
- Cuantizaciones imatrix del mismo modelo: https://huggingface.co/mradermacher/gemma-3-27b-pt-transplant-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#gemma-3-27b-pt-transplant-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
