# skowshik1/gemma3-4b-sft-baseline-continued

## Resumen

`skowshik1/gemma3-4b-sft-baseline-continued` es un ajuste fino supervisado (SFT) publicado por el usuario skowshik1 en HuggingFace. Segun la model card, se trata de una continuacion del entrenamiento del checkpoint `skowshik1/gemma3-4b-sft-baseline-step2500-merged`, que a su vez actua como modelo base. El entrenamiento se ha realizado con la libreria TRL de HuggingFace, dentro de un flujo de trabajo etiquetado como `hf_jobs`, lo que indica que se ejecuto en la infraestructura de trabajos gestionados de HuggingFace.

Por la nomenclatura del repositorio y de su modelo base, todo apunta a que se trata de un derivado de Gemma 3 de 4B parametros (arquitectura transformer decoder-only), pero la model card no confirma arquitectura, longitud de contexto, idiomas ni licencia. El repositorio no incluye resultados de evaluacion, descripcion del dataset de entrenamiento, ni hiperparametros mas alla de las versiones de framework.

La relevancia de esta ficha es limitada y fundamentalmente metodologica: se trata de un artefacto de investigacion con 0 descargas y 0 likes en el momento de la consulta, sin documentacion tecnica suficiente para evaluar su calidad. Se documenta aqui como ejemplo de publicacion de checkpoints intermedios de SFT y para dejar constancia explicita de los datos que faltan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre del modelo sugiere un transformer decoder-only derivado de Gemma 3 4B; no confirmado en la model card) |
| Parametros totales | no disponible (aproximadamente 4000 millones segun la nomenclatura "4b"; no confirmado) |
| Parametros activos | no aplica (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene pesos en safetensors; no se publican versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card incluye el campo `licence: license` como marcador de posicion, sin texto de licencia real) |
| Formato de pesos | safetensors (etiqueta del repositorio); el repositorio indica un tamano de 0.2 GB, inconsistente con un modelo de 4B parametros, lo que sugiere una subida incompleta o parcial |
| Libreria | transformers |
| Modelo base | skowshik1/gemma3-4b-sft-baseline-step2500-merged |
| Fecha de creacion | 2026-09-16 |
| Ultima actualizacion | 2026-09-16 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura en la model card. El unico dato tecnico concreto es que el entrenamiento se realizo mediante SFT (supervised fine-tuning) con TRL, partiendo del checkpoint `gemma3-4b-sft-baseline-step2500-merged`. El nombre del checkpoint base ("step2500") sugiere que este modelo continua el entrenamiento a partir del paso 2500 de una ejecucion previa, pero no se especifica el numero de pasos adicionales, el tamano del dataset, su composicion, la longitud de secuencia ni los hiperparametros (learning rate, batch size, schedule).

Tampoco se documenta si hubo fases posteriores de alineacion (RLHF, DPO, RLVR) ni ninguna innovacion tecnica especifica. Las unicas versiones de framework declaradas son TRL 1.13.0, Transformers 5.17.0, PyTorch 2.14.0, Datasets 5.0.1 y Tokenizers 0.23.2. Conviene senalar que dichas versiones no coinciden con las publicadas habitualmente en el ecosistema en el momento de redactar esta ficha, por lo que deben tomarse como datos declarados por el autor y no verificados.

## Capacidades

- Generacion de texto conversacional: la model card incluye un ejemplo de uso con `pipeline("text-generation")` sobre una lista de mensajes con el rol `user`, lo que indica formato de chat de un solo turno como minimo.
- No se documentan capacidades de razonamiento explicito, modo "thinking", matemáticas, codigo ni vision, aunque el modelo del que deriva (Gemma 3) si incorpora algunas de ellas en sus variantes oficiales.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declara lista de idiomas).
- Capacidades especiales (vision, audio, decodificacion especulativa): no disponible.
- Compatibilidad declarada con endpoints de inferencia: la etiqueta `endpoints_compatible` sugiere que puede desplegarse en la infraestructura de endpoints de HuggingFace, pero no se detalla configuracion.

## Casos de uso

Dado que no hay evaluaciones publicadas, los casos siguientes son escenarios plausibles para un modelo conversacional ajustado con SFT de ~4B parametros, y deben validarse empiricamente antes de cualquier uso en produccion.

- Prototipado de asistentes conversacionales: el modelo puede usarse como sustituto local de un asistente de chat durante el desarrollo de una aplicacion, aprovechando su formato de mensajes compatible con la API `pipeline` de transformers y su tamano reducido para iterar rapido en una sola GPU.
- Investigacion sobre SFT y ajuste continuado: sirve como caso de estudio de un flujo TRL + `hf_jobs` con entrenamiento por etapas (checkpoint a paso 2500 y continuacion), util para reproducir pipelines de ajuste incremental.
- Generacion de texto controlada en entornos con recursos limitados: al tratarse de un modelo de ~4B, puede desplegarse en una GPU de consumo para tareas de resumen, reformulacion o generacion de borradores donde no se requiera maxima calidad.
- Experimentos de destilacion y comparacion de checkpoints: al existir un modelo base identificable, puede emplearse como punto intermedio en estudios de evolucion de una misma ejecucion de entrenamiento.
- Evaluacion de sesgos y comportamiento de checkpoints no alineados: al no documentarse fase de alineacion posterior al SFT, es un candidato para estudiar como se comporta un modelo unicamente instruido frente a uno alineado con preferencias.
- Base para nuevos ajustes de dominio: un investigador podria partir de este checkpoint para aplicar LoRA o SFT adicional sobre un corpus especializado, siempre que verifique previamente la integridad del repositorio (vease la advertencia sobre el tamano de 0.2 GB).
- Docencia y formacion tecnica: util como ejemplo minimo de model card incompleta para ensenar que datos debe declarar una publicacion de modelo (dataset, hiperparametros, licencia, evaluacion).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, y la busqueda web realizada no ha devuelto documentacion tecnica asociada al modelo: los unicos resultados obtenidos son listados de ofertas de empleo de Pole emploi sin relacion alguna con el modelo.

## Requisitos de hardware

Las cifras de esta seccion son estimaciones generales para un transformer denso de aproximadamente 4B parametros, no medidas sobre este checkpoint concreto.

- VRAM estimada para inferencia (solo pesos, sin margen para cache KV): ~8 GB en bf16/fp16, ~4-5 GB en int8, ~2,5-3 GB en cuantizacion de 4 bits.
- VRAM recomendada en la practica: 10-12 GB en bf16 con contexto corto, y 16 GB o mas si se trabaja con ventanas de contexto largas, ya que la cache KV crece de forma lineal con la longitud de secuencia.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas de 8 GB o mas (RTX 3060 Ti 8 GB, RTX 3070, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090) siempre que se use cuantizacion en el caso de 8 GB.
- GPU de centro de datos: A100 40/80 GB, H100, L40S y similares permiten inferencia en precision completa con lotes grandes y contextos largos.
- Opciones de despliegue: transformers (documentado en la model card), y en principio vLLM, TGI, SGLang o llama.cpp/Ollama si se generan pesos GGUF o se soporta el formato safetensors nativo. La compatibilidad con endpoints de HuggingFace esta declarada mediante la etiqueta `endpoints_compatible`.
- Latencia y throughput estimados: no disponible. No hay mediciones publicadas ni datos de arquitectura suficientes para calcularlos con fiabilidad.

## Comparativa con modelos similares

La comparacion se limita a parametros, contexto y licencia, y solo se incluyen datos publicos de las model cards oficiales de los modelos alternativos. No hay datos de rendimiento de este checkpoint.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| skowshik1/gemma3-4b-sft-baseline-continued | ~4B (segun nombre) | no disponible | no disponible | HuggingFace, 0 descargas, ~0,2 GB |
| google/gemma-3-4b-it | 4B (aprox.) | 128K tokens (segun model card oficial) | Gemma Terms of Use | HuggingFace, ampliamente desplegado |
| Qwen/Qwen3-4B | 4B (aprox.) | 32K nativo, extensible (segun model card oficial) | Apache 2.0 | HuggingFace |
| meta-llama/Llama-3.2-3B-Instruct | 3B (aprox.) | 128K tokens (segun model card oficial) | Llama 3.2 Community License | HuggingFace |

No se dispone de una comparacion de rendimiento fiable, ya que este checkpoint no publica metricas y existen dudas razonables sobre la integridad del repositorio.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: no se declaran dataset, hiperparametros, numero de tokens de entrenamiento ni proceso de filtrado de datos.
- Ausencia total de evaluacion: no hay benchmarks, ni evaluaciones humanas, ni pruebas de regresion. No es posible estimar la calidad del modelo.
- Licencia ambigua: el campo de licencia contiene un marcador de posicion (`licence: license`) sin texto legal. No debe asumirse uso comercial permitido; ademas, al derivar presumiblemente de Gemma 3, podrian aplicar los terminos de uso de Gemma, que imponen obligaciones adicionales.
- Repositorio posiblemente incompleto: el tamano declarado de 0,2 GB es muy inferior a los ~8 GB que ocuparian los pesos de un modelo de 4B parametros en bf16. Antes de cargar el modelo conviene verificar la lista de ficheros del repositorio; es plausible que falten fragmentos de pesos o que solo se hayan subido configuracion y tokenizer.
- Fechas anomalas: la creacion y la ultima actualizacion del repositorio figuran como 2026-09-16, una fecha posterior a la redaccion habitual de fichas tecnicas. No se ha podido confirmar si se trata de un error de metadatos.
- Versiones de framework no verificadas: TRL 1.13.0, Transformers 5.17.0 y PyTorch 2.14.0 no se corresponden con las versiones distribuidas habitualmente, lo que dificulta reproducir el entrenamiento tal cual.
- Riesgo de alucinacion: no evaluado, pero al tratarse de un modelo de ~4B unicamente entrenado con SFT, es esperable un porcentaje relevante de afirmaciones incorrectas, especialmente en tareas de conocimiento factual y matematicas. No hay datos que permitan cuantificarlo.
- Sesgos: no evaluados. Sin informacion sobre la composicion del dataset no es posible caracterizar sesgos de genero, idioma, cultura o ideologia.
- Cobertura idiomatica desconocida: no se declara lista de idiomas, por lo que no hay garantia de un rendimiento adecuado en castellano ni en ningun otro idioma concreto.
- Multi-turno no verificado: el unico ejemplo publicado usa un unico mensaje de usuario; el comportamiento en conversaciones largas o con historial no esta documentado.
- Adopcion nula: con 0 descargas y 0 likes, no existe comunidad que haya validado el modelo, ni issues que documenten problemas conocidos.
- Recomendacion: no usar en produccion ni en aplicaciones de cara al publico sin una evaluacion propia exhaustiva y sin aclarar previamente la licencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/skowshik1/gemma3-4b-sft-baseline-continued
- Modelo base: https://huggingface.co/skowshik1/gemma3-4b-sft-baseline-step2500-merged
- Repositorio de TRL: https://github.com/huggingface/trl
- No se han encontrado papers, blogs, demos ni repositorios adicionales asociados a este modelo en la busqueda web realizada. Los unicos resultados obtenidos corresponden a listados de ofertas de empleo de Pole emploi (https://candidat.pole-emploi.fr/offres/recherche?motsCles=saisonnier), sin ninguna relacion con el modelo.
