# coolbho3k/DeepSeek-V4.1-Flash-1017-GRAFT-3bpw

## Resumen

DeepSeek-V4.1-Flash-1017-GRAFT-3bpw es una cuantizacion del modelo multimodal DeepSeek-V4.1-Flash-1017 (revision `1bae0e1088993b9b82de08f59de5be5a34e42170`), publicado por el usuario coolbho3k. Concretamente, aplica la tecnica GRAFT (Grid-Aligned FP4 Trellis) a los expertos enrutados del modelo base, comprimiendolos a 3,007 bits por peso mientras el resto de pesos se copia sin modificar. El resultado es un checkpoint de 111.085 millones de parametros totales en formato safetensors, con un repositorio de 223,5 GB.

El modelo base es un transformer de tipo Mixture-of-Experts con capacidad image-text-to-text, es decir, acepta imagenes y texto como entrada y genera texto. La cuantizacion persigue reducir el coste de almacenamiento y de inferencia de los expertos, que son la parte dominante del modelo, manteniendo una fidelidad alta respecto al checkpoint original: el error de reconstruccion mediano por experto es de 1,001 veces el de la release anterior, y la release previa reporto KL 0,0369 y exceso de NLL de 0,0085 nats frente a su modelo fuente.

Es relevante ahora porque demuestra que la cuantizacion extrema (3 bits) de expertos MoE con trellis alineado a rejilla FP4 es viable a escala de 111.000 millones de parametros, y porque incluye artefactos auxiliares poco habituales: un draft de decodificacion especulativa DSpark (`mtp.0`-`mtp.2`), capas "engram" de 101 GB cada una y un formato de tensor documentado con decodificador de referencia pendiente de publicacion. La licencia es MIT, igual que el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) multimodal image-text-to-text, con capas "engram" y draft de decodificacion especulativa DSpark; cuantizacion GRAFT-MX en expertos enrutados |
| Parametros totales | 111.085.292.144 (111,09 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GRAFT (Grid-Aligned FP4 Trellis) a 3,0066 bits por peso en expertos enrutados; resto de tensores sin cuantizar (copiados del base) |
| Idiomas soportados | no disponible |
| Licencia | MIT (Copyright (c) 2023 DeepSeek) |
| Formato de pesos | safetensors (51 shards: `model-00001` a `model-00051-of-00051`), mas `engrams/` y `draft/` |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con pipeline image-text-to-text. La cuantizacion solo afecta a los expertos enrutados de cada capa: cada matriz `layers.L.ffn.experts.E.wN` (N = 1, 2, 3) se almacena como un bitstream trellis de 768 bits por tile de 16x16 (`trellis`, int16, forma `[k/16, n/16, 48]`), leido como palabras de 32 bits little-endian, acompanado de cabeceras `suh` (float16, `[k]`, con los primeros 16 valores reinterpretados como 8 float32 `(qa0, qb0, d, 0, qa1, qb1, 0, 0)`), escalas por columna `svh` (float16, `[n]`), un multiplicador de hash `mul1` (int32, `0x83DCD12D`) y, en matrices marcadas, flags de bloque `graft_flags` (int32, `[k/32, n/32]`). La matriz decodificada es la traspuesta del tensor `weight` original. El resto de pesos, incluidos los tensores de atencion, se copian sin cambios desde el checkpoint 1017.

El proceso de calibracion reutiliza la receta y los corpus de la release anterior (`coolbho3k/DeepSeek-V4.1-Flash-GRAFT-3bpw`), pero recapturando las activaciones de calibracion sobre el checkpoint 1017. El checkpoint incorpora dos capas "engram" en L = 1 y L = 14 cuyos tensores (`layers.L.engram.embed.weight` y `layers.L.engram.embed.scale`, 101 GB por fichero) no caben en el limite de tamano de Hugging Face y deben copiarse manualmente desde los shards `model-00047-of-00048.safetensors` y `model-00048-of-00048.safetensors` del modelo base. Tambien incluye el draft de decodificacion especulativa DSpark del checkpoint 1017 (`mtp.0`-`mtp.2`). Una particularidad de la revision 1017 es que anade un round trip FP8 (UE8M0, bloque 32) de la salida de atencion antes de `wo_a`, que el runtime debe aplicar como hace el codigo de referencia. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de RLHF/DPO del modelo base.

## Capacidades

- Generacion de texto y razonamiento a partir de entradas multimodales (imagen y texto), segun el pipeline `image-text-to-text`.
- Procesamiento de imagenes junto con instrucciones en lenguaje natural.
- Decodificacion especulativa mediante el draft DSpark incluido (`mtp.0`-`mtp.2`), que permite acelerar la generacion si el runtime lo soporta.
- Arquitectura MoE con expertos enrutados: activacion selectiva de expertos por token, lo que reduce el coste computacional respecto a un modelo denso del mismo tamano.
- Capacidades de tool calling, function calling y agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia multimodal en produccion con restricciones de memoria: la cuantizacion a 3 bits de los expertos reduce el peso de la parte dominante del modelo, lo que permite desplegar un MoE de 111.000 millones de parametros en infraestructuras donde el checkpoint completo en alta precision no cabria. Requiere un runtime capaz de decodificar el formato GRAFT-MX.
- Procesamiento de documentos con imagenes: al aceptar entrada image-text-to-text, puede emplearse para extraer y razonar sobre informacion de capturas, formularios escaneados o diagramas combinados con texto, siempre que se valide su calidad frente al modelo base en el dominio concreto.
- Generacion aumentada con recuperacion (RAG) multimodal: el modelo puede recibir imagenes y texto recuperado como contexto y generar respuestas; la ventaja de la cuantizacion es el menor coste de almacenamiento por replica en un despliegue con multiples instancias.
- Investigacion en cuantizacion extrema: el repositorio documenta el formato tensor a tensor (trellis, `suh`, `svh`, `mul1`, `graft_flags`) y el error de reconstruccion por experto, lo que lo convierte en material de referencia para estudiar el impacto de 3 bits en expertos MoE a gran escala.
- Aceleracion con decodificacion especulativa: el draft DSpark incluido permite a runtimes compatibles aplicar decodificacion especulativa para reducir la latencia por token en cargas de generacion larga.
- Evaluacion comparativa de fidelidad: util para equipos que quieran medir KL y exceso de NLL frente al checkpoint 1017 en sus propios dominios antes de adoptar la cuantizacion en produccion, dado que la evaluacion a nivel de modelo de esta release aun no se ha ejecutado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos de calidad reportados son metricas de reconstruccion y divergencia respecto al checkpoint fuente:

| Metrica | Este repo (1017) | Release anterior |
|---|---|---|
| Bits por peso (expertos enrutados) | 3,0066 | 3,0062 |
| Error de reconstruccion en held-out, ratio mediano sobre los mismos 15.358 expertos | 1,001 | 1 |
| KL frente al modelo fuente | no medido en esta release | 0,0369 |
| Exceso de NLL frente al modelo fuente | no medido en esta release | 0,0085 nats |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, el repositorio ocupa 223,5 GB en safetensors, pero el checkpoint incluye las capas engram (dos ficheros de 101 GB) que no se cargan necesariamente en el mismo dispositivo; el requisito real depende del runtime y del particionado.
- GPU recomendadas: no disponible en la informacion proporcionada. Por el tamano del modelo, un despliegue completo requiere multiples aceleradores de clase centro de datos (A100, H100 u equivalentes); no hay datos oficiales que confirmen configuraciones concretas.
- Viabilidad en GPU de consumo: no disponible. Un modelo de 111.000 millones de parametros, incluso cuantizado, excede la memoria de una unica GPU de consumo tipica; se requiere offloading o particionado, sin datos publicados que lo confirmen.
- Opciones de despliegue: la libreria declarada es `trellis` y la model card indica `inference: false`, por lo que no es directamente ejecutable con vLLM, llama.cpp, Ollama o TGI sin soporte para el formato GRAFT-MX. El autor anuncia la publicacion separada de un decodificador de referencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-GRAFT-3bpw (este) | 111,09 mil millones | no disponible | GRAFT 3,0066 bpw en expertos | MIT | Hugging Face, requiere runtime compatible |
| coolbho3k/DeepSeek-V4.1-Flash-GRAFT-3bpw | no disponible | no disponible | GRAFT 3,0062 bpw en expertos | MIT | Hugging Face |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (base) | no disponible | no disponible | sin cuantizar | MIT | Hugging Face |

No se dispone de datos de rendimiento ni de contexto de los modelos comparados en la informacion proporcionada, por lo que la comparacion se limita a parametros, licencia y formato. No se han identificado en la informacion disponible otras alternativas cuantizadas de la misma categoria con las que contrastar.

## Limitaciones y advertencias

- La evaluacion a nivel de modelo de esta release (KL y exceso de NLL frente al checkpoint 1017) no se ha ejecutado; solo se ha verificado el error de reconstruccion por experto, por lo que la fidelidad global es una extrapolacion de la release anterior.
- La cuantizacion a 3 bits puede degradar tareas sensibles a precision numerica (matematicas, codigo, razonamiento de multiples pasos); no hay benchmarks que lo cuantifiquen.
- El checkpoint no es directamente ejecutable: la model card declara `inference: false` y el decodificador de referencia esta pendiente de publicacion. Adoptarlo en produccion exige implementar el formato GRAFT-MX y el round trip FP8 (UE8M0, bloque 32) antes de `wo_a`.
- Las capas engram no estan completas en el repositorio: los tensores de 101 GB deben copiarse manualmente desde los shards del modelo base, lo que anade riesgo operativo en el despliegue.
- No hay informacion sobre sesgos, idiomas soportados ni comportamiento multilingue del modelo base en la documentacion disponible.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada; aplica el riesgo habitual de los modelos generativos, agravado potencialmente por la cuantizacion.
- Licencia MIT permite uso comercial, pero el aviso de copyright corresponde a DeepSeek (2023) y conviene revisar los terminos del modelo base para obligaciones adicionales.
- El autor (coolbho3k) no es el desarrollador del modelo base; el soporte y las garantias de mantenimiento son limitados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/coolbho3k/DeepSeek-V4.1-Flash-1017-GRAFT-3bpw
- Release anterior de la cuantizacion: https://huggingface.co/coolbho3k/DeepSeek-V4.1-Flash-GRAFT-3bpw
- Paper de GRAFT (Grid-Aligned FP4 Trellis Quantization for FP4-Native Language Models): https://github.com/coolbho3k/GRAFT
- Modelo base: deepseek-ai/DeepSeek-V4.1-Flash-1017 (referenciado en la model card; URL no proporcionada en la informacion disponible)
