# mradermacher/Coral-decider-4b-GGUF

## Resumen

Coral-decider-4b-GGUF es un repositorio de cuantizaciones estaticas en formato GGUF generado por mradermacher a partir del modelo base OceanLabs/Coral-decider-4b. No se trata, por tanto, de un modelo entrenado por el autor del repositorio, sino de una conversion y cuantizacion del checkpoint original en precision completa (etiquetado internamente como `convert_type: hf`) a una familia de ficheros GGUF listos para inferencia en CPU y GPU con llama.cpp y herramientas compatibles. El repositorio fue creado el 27 de septiembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni valoraciones.

El modelo pertenece a la categoria de los transformers de ~4.000 millones de parametros, pero la model card publicada no incluye informacion sobre arquitectura, datos de entrenamiento, longitud de contexto, idiomas o licencia del modelo original. El nombre "decider" y la existencia de otros repositorios de la misma familia en HuggingFace (mradermacher/decider-4b-GGUF y mradermacher/assay-4b-GGUF, ambos etiquetados como `decision-model`, `calibrated` y `structured-output`) sugieren una orientacion a tareas de decision y salida estructurada, pero no hay confirmacion de que Coral-decider-4b comparta ese diseno.

Su relevancia practica es limitada pero concreta: permite ejecutar un modelo de 4B en hardware de consumo gracias a las 13 cuantizaciones publicadas (desde Q2_K hasta f16), lo que facilita prototipado local, pruebas de latencia y despliegue en entornos sin GPU dedicada. Cualquier evaluacion seria del modelo requiere consultar el repositorio del modelo base, cuya informacion no esta disponible en los datos proporcionados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre del modelo indica ~4B; no se confirma si es transformer decoder-only, MoE u otra) |
| Parametros totales | ~4.000 millones (inferido de la denominacion "4b"; cifra exacta no disponible) |
| Parametros activos | no aplica / no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la metadata de HuggingFace no la declara; debe consultarse la del modelo base OceanLabs/Coral-decider-4b) |
| Formato de pesos | GGUF (cuantizaciones estaticas, `quantize_version: 2`, `output_tensor_quantised: 1`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base. La model card del repositorio GGUF se limita a indicar que son cuantizaciones estaticas de https://huggingface.co/OceanLabs/Coral-decider-4b y anade metadatos del proceso de conversion: `convert_type: hf` (conversion desde pesos HuggingFace), `quantize_version: 2` y `output_tensor_quantised: 1`, ademas de la lista de 13 cuantizaciones generadas. No hay datos sobre numero de tokens de entrenamiento, composicion del dataset, uso de RLHF, DPO u otras tecnicas de alineamiento, ni sobre innovaciones tecnicas como atencion lineal o decodificacion especulativa.

Respecto al proceso de cuantizacion en si, se trata de una conversion estandar del pipeline de mradermacher: el modelo base se convierte al formato GGUF y se emiten simultaneamente varias cuantizaciones k-quant (Q2_K a Q6_K) e i-quant (IQ4_XS), junto con una version f16 y una Q8_0 como referencias de mayor fidelidad. No se documenta el uso de mixed-precision selectiva por capas ni de calibracion con datasets especificos, mas alla de lo implicito en los propios algoritmos de llama.cpp.

## Capacidades

La informacion disponible no permite confirmar ninguna capacidad concreta del modelo. A continuacion se enumeran unicamente los aspectos verificables y se marcan explicitamente las incognitas:

- Generacion de texto: no confirmado, aunque es la funcion esperada de un modelo de ~4B en formato GGUF compatible con llama.cpp.
- Razonamiento, codigo y matematicas: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el repositorio no declara idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Salida estructurada o calibrada: no confirmado para Coral-decider-4b. Los repositorios hermanos de la familia "decider" gestionados por el mismo cuantizador (decider-4b, assay-4b) si se etiquetan como `calibrated` y `structured-output`, pero se trata de modelos distintos y no se debe extrapolar esa caracteristica sin verificacion.

## Casos de uso

Dado que no se dispone de la model card del modelo base, los casos siguientes son escenarios genericos y realistas para un modelo de ~4B cuantizado en GGUF, condicionados a que el modelo base rinda de forma adecuada en cada tarea. Deben validarse empiricamente antes de llevarlos a produccion.

- Prototipado local en portatil sin GPU: las cuantizaciones Q4_K_M e IQ4_XS permiten cargar el modelo en 4-8 GB de RAM y probar flujos conversacionales o de clasificacion sin coste de API.
- Clasificacion y etiquetado por lotes en servidor CPU: usando llama.cpp con Q5_K_M o Q6_K se puede procesar grandes volumenes de texto en un servidor sin GPU, con buena relacion coste/rendimiento si la tarea no exige razonamiento profundo.
- Generacion asistida en aplicaciones de escritorio: integracion en herramientas tipo LM Studio, Ollama o GPT4All para resumen, reescritura y extraccion de entidades en local, con los datos sin salir del equipo.
- Filtrado previo (pre-filtering) en pipelines de datos: emplear la cuantizacion Q2_K o Q3_K_S como clasificador rapido de bajo coste que descarte ejemplos irrelevantes antes de invocar un modelo mayor.
- Evaluacion comparativa de cuantizaciones: el repositorio publica 13 variantes del mismo modelo, lo que lo hace util para medir la degradacion de calidad entre Q2_K y f16 sobre un conjunto de validacion propio.
- Despliegue en dispositivos con memoria limitada: las variantes Q2_K y Q3_K_S son las unicas viables en equipos con menos de 4 GB de RAM/VRAM disponibles, a costa de una perdida de fidelidad notable.
- Servicio de inferencia multimodal de bajo trafico: con llama-cpp-python o un servidor compatible con la API de OpenAI se puede exponer el modelo en un contenedor pequeno para uso interno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio GGUF no incluye ninguna tabla de evaluacion. Los resultados que aparecen en los resultados de busqueda (por ejemplo, las filas comparativas de `Mapika/decider` en su MODEL_CARD_4B.md) corresponden a otros modelos de la familia "decider" y no deben atribuirse a Coral-decider-4b.

## Requisitos de hardware

Los valores de memoria son estimaciones derivadas del numero de parametros (~4B) y del tamano tipico de cada cuantizacion en llama.cpp. El repositorio no publica tamanos de fichero en la informacion disponible, por lo que deben tomarse como orden de magnitud.

- VRAM/RAM estimada por cuantizacion (solo pesos):
  - Q2_K: ~1,7-2,0 GB
  - Q3_K_S: ~1,9-2,2 GB
  - Q3_K_M: ~2,1-2,4 GB
  - Q3_K_L: ~2,3-2,6 GB
  - IQ4_XS: ~2,3-2,6 GB
  - Q4_K_S: ~2,4-2,7 GB
  - Q4_K_M: ~2,6-2,9 GB
  - Q5_K_S: ~2,9-3,2 GB
  - Q5_K_M: ~3,0-3,4 GB
  - Q6_K: ~3,4-3,8 GB
  - Q8_0: ~4,4-4,8 GB
  - f16: ~8,0-8,6 GB
- Anadir entre 0,5 y 2 GB adicionales para la cache KV, en funcion de la longitud de contexto configurada y del numero de secuencias concurrentes.
- GPU consumer: practicamente todas las cuantizaciones hasta Q6_K caben en tarjetas con 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 2070, GTX 1660 con Q3/Q4). Q8_0 requiere 8 GB o mas; f16 requiere 12-16 GB (RTX 4080, RTX 4090, RTX A4000).
- GPU de centro de datos: A100, H100, L40S o A10 ejecutan cualquier variante con margen amplio y permiten lotes grandes.
- CPU: las cuantizaciones Q4_K_M e inferiores son viables en CPU moderna con 8-16 GB de RAM; Q2_K y Q3_K_S funcionan incluso en equipos con 4-6 GB de RAM.
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama, LM Studio, GPT4All, llama-cpp-python, text-generation-webui y, de forma experimental, el soporte GGUF de vLLM. TGI no soporta GGUF de forma nativa.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo para este repositorio.

## Comparativa con modelos similares

Todos los modelos listados son cuantizaciones GGUF de ~4B publicadas por el mismo autor, lo que permite una comparacion homogenea en formato y proceso, aunque la informacion publica de cada uno es escasa.

| Modelo | Parametros | Contexto | Licencia | Idiomas | Orientacion declarada |
|---|---|---|---|---|---|
| mradermacher/Coral-decider-4b-GGUF (este) | ~4B | no disponible | no disponible (consultar modelo base) | no disponible | no disponible |
| mradermacher/decider-4b-GGUF | ~4B | no disponible | apache-2.0 | ingles | decision-model, calibrated, structured-output, multi-task, one-pass conversational |
| mradermacher/assay-4b-GGUF | ~4B | no disponible | apache-2.0 | ingles | decision-model, calibrated, conformal-prediction, structured-output |

No se dispone de datos de rendimiento comparativos entre estos tres repositorios. La diferencia principal observable es documental: los repositorios decider-4b y assay-4b declaran licencia Apache 2.0 e idioma ingles, mientras que Coral-decider-4b no declara ninguno de los dos.

## Limitaciones y advertencias

- Ausencia total de model card: no hay informacion sobre arquitectura, datos de entrenamiento, sesgos, idiomas o contexto, lo que impide evaluar el modelo con criterios rigurosos antes de desplegarlo.
- Licencia no declarada: la metadata del repositorio no especifica licencia. Es imprescindible verificar la licencia del modelo base OceanLabs/Coral-decider-4b antes de cualquier uso comercial; su ausencia no implica permisividad.
- Riesgo de alucinacion: no cuantificado. En modelos de ~4B la tasa de alucinacion suele ser apreciable, especialmente en tareas de conocimiento factual y razonamiento largo.
- Degradacion por cuantizacion: las variantes Q2_K, Q3_K_S y Q3_K_M pueden degradar notablemente el rendimiento en tareas sensibles a la precision (matematicas, codigo, instrucciones complejas). Se recomienda Q4_K_M o superior para uso real.
- Idiomas no confirmados: no hay garantia de soporte de castellano ni de ningun otro idioma distinto del que haya aprendido el modelo base.
- Longitud de contexto desconocida: no se puede planificar el uso en conversaciones o documentos largos sin consultar el modelo base.
- Repositorio sin traccion: cero descargas y cero valoraciones en el momento del analisis, sin senales de validacion por parte de la comunidad.
- Fecha de creacion inusual (2026): conviene confirmar la integridad de los ficheros y la coherencia de los metadatos antes de usarlos en produccion.
- Idoneidad para agentes y tool calling: no verificada. No debe asumirse que soporte function calling.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Coral-decider-4b-GGUF
- Modelo base (citado en la model card): https://huggingface.co/OceanLabs/Coral-decider-4b
- Repositorio hermano: https://huggingface.co/mradermacher/decider-4b-GGUF
- Repositorio hermano: https://huggingface.co/mradermacher/assay-4b-GGUF
- Perfil del autor en HuggingFace: https://www.aimodels.fyi/creators/huggingFace/mradermacher
- Ficha de referencia de la familia decider (modelo distinto, orientativo): https://www.gradually.ai/en/ai-models/decider-4b/
- Model card de Mapika/decider (modelo distinto, orientativo): https://github.com/Mapika/decider/blob/main/MODEL_CARD_4B.md
