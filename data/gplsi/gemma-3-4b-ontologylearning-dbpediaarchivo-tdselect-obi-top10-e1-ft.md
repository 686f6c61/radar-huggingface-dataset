# gplsi/Gemma-3-4B-OntologyLearning-DBpediaArchivo-TDSelect-OBI-Top10-e1-ft

## Resumen

El modelo `gplsi/Gemma-3-4B-OntologyLearning-DBpediaArchivo-TDSelect-OBI-Top10-e1-ft` es un ajuste fino (fine-tuning) del modelo base Gemma 3 de 4.000 millones de parametros, publicado por el grupo de investigacion GPLSI. Por el nombre se deduce que esta especializado en aprendizaje de ontologias (ontology learning), concretamente en la tarea de seleccion de terminos y relaciones a partir de la ontologia DBpedia Archivo, con una estrategia de seleccion de top-10 candidatos y una configuracion de entrenamiento identificada como "e1". Se trata, por tanto, de un modelo de investigacion orientado a una tarea muy concreta dentro del procesamiento del lenguaje natural y la ingenieria del conocimiento, no de un modelo de proposito general.

La relevancia de esta ficha es limitada: el repositorio no incluye model card sustantiva (unicamente la declaracion de licencia Apache 2.0), no registra descargas ni interacciones, y no aporta informacion sobre datos de entrenamiento, hiperparametros, resultados de evaluacion ni idiomas soportados. Cualquier dato tecnico que no figure en la informacion disponible se marca explicitamente como "no disponible". El modelo se apoya en la arquitectura y capacidades del Gemma 3 4B original, pero el ajuste fino puede haber alterado o degradado sus capacidades generales.

Dado que el autor no ha publicado detalles del proceso de entrenamiento, esta ficha debe interpretarse como un punto de partida para la evaluacion, no como una garantia de comportamiento en produccion. Se recomienda validar el modelo sobre el conjunto de datos objetivo antes de cualquier uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: Gemma 3 4B, transformer decoder-only) |
| Parametros totales | no disponible (modelo base: 4.000 millones aprox.) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo base Gemma 3 4B: 128.000 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura especifica del ajuste fino. El modelo se presenta como un fine-tuning de Gemma 3 4B, que es un transformer decoder-only con atencion por ventanas deslizantes y atencion global alternadas, entrenado por Google DeepMind. Sin embargo, el autor no documenta si se ha congelado parte del modelo, si se ha aplicado LoRA, QLoRA o un ajuste completo, ni cuantos parametros se han actualizado.

Tampoco se detallan los datos de entrenamiento: no se indica el numero de tokens, la composicion del dataset, la procedencia de los ejemplos de DBpedia Archivo, ni si se ha empleado RLHF, DPO o alguna tecnica de alineacion posterior. El sufijo "TDSelect-OBI-Top10-e1" sugiere una tarea de seleccion de terminos (term selection) con top-10 candidatos sobre la ontologia OBI (Ontology for Biomedical Investigations), pero esta interpretacion no esta confirmada por el autor. No hay informacion sobre innovaciones tecnicas como decodificacion especulativa, atencion lineal o modos de razonamiento extendido.

## Capacidades

- Generacion de texto en lenguaje natural, heredada del modelo base Gemma 3 4B.
- Razonamiento y respuesta a instrucciones, sujeto a posible degradacion por el ajuste fino especializado.
- Procesamiento de contextos largos, si se conserva la ventana de 128.000 tokens del modelo base (no confirmado).
- Capacidad multilingue heredada del modelo base (no confirmada para este ajuste).
- Posible soporte de tool calling y function calling heredado de Gemma 3 (no confirmado).
- Capacidad especifica (presunta) para tareas de aprendizaje de ontologias y seleccion de terminos sobre DBpedia Archivo.
- No se documenta soporte de vision, audio ni modo de pensamiento explicito.

## Casos de uso

- Investigacion en aprendizaje de ontologias: el modelo puede emplearse como linea base para experimentos de seleccion de terminos y relaciones sobre DBpedia Archivo, comparando su rendimiento con otros enfoques de la literatura.
- Extraccion de candidatos ontologicos: dado un fragmento de texto o una entidad, el modelo podria generar listas de terminos candidatos para su inclusion en una ontologia, aprovechando el ajuste sobre la tarea TDSelect.
- Enriquecimiento de bases de conocimiento: integracion en pipelines que necesiten proponer nuevas clases o propiedades a partir de corpus textuales, con revision humana posterior.
- Evaluacion comparativa de modelos especializados: util como referencia para medir el efecto de un fine-tuning pequeno sobre un modelo base de 4B en tareas de ingenieria del conocimiento.
- Prototipado de asistentes para ontologos: ayuda a generar borradores de terminos y relaciones que el experto valida, reduciendo el trabajo manual inicial.
- Reproducibilidad de experimentos academicos: al estar publicado con licencia Apache 2.0, puede reutilizarse en entornos de investigacion sin restricciones comerciales, siempre que se documenten las condiciones de uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia orientativa para un modelo de 4B en precision FP16, se requieren aproximadamente 8 GB de VRAM; en cuantizacion de 8 bits, unos 4-5 GB; en 4 bits, unos 2-3 GB. Estas cifras son estimaciones genericas y no estan confirmadas para este ajuste.
- GPU recomendadas: no disponible. Por tamano, cabria esperar que funcione en GPUs consumer como RTX 3060, RTX 4060, RTX 4070 o superiores, asi como en A100, H100 y L40S para despliegues de mayor throughput, pero no hay datos del autor.
- Cabe en GPU consumer: probablemente si, en funcion de la cuantizacion, aunque no esta verificado.
- Opciones de despliegue: no disponible. Al ser un modelo compatible con la familia Gemma, podria desplegarse con vLLM, TGI, llama.cpp u Ollama si los pesos se convierten a los formatos correspondientes, pero no se documenta.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| gplsi/Gemma-3-4B-OntologyLearning-DBpediaArchivo-TDSelect-OBI-Top10-e1-ft | no disponible (base 4B) | no disponible | Apache 2.0 | Hugging Face | Ajuste fino especializado en ontologias |
| google/gemma-3-4b-it | 4B aprox. | 128.000 tokens | Gemma Terms of Use | Hugging Face | Modelo base instructivo de proposito general |
| google/gemma-3-4b-pt | 4B aprox. | 128.000 tokens | Gemma Terms of Use | Hugging Face | Modelo base preentrenado sin ajuste instructivo |
| Modelos especializados en ontology learning | no disponible | no disponible | variable | variable | No se dispone de comparativas publicadas en la informacion proporcionada |

La comparativa se limita a los modelos de la misma familia, ya que no se han identificado alternativas especializadas equivalentes en la informacion disponible. No hay datos de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia total de model card sustantiva: no se documentan datos de entrenamiento, hiperparametros, evaluacion ni limitaciones, lo que impide validar el comportamiento del modelo.
- Riesgo de sobreajuste a la tarea especifica de seleccion de terminos sobre DBpedia Archivo, con posible degradacion de capacidades generales de generacion y razonamiento.
- Riesgo de alucinacion en la generacion de terminos ontologicos: el modelo puede proponer clases o relaciones inexistentes o inconsistentes con la ontologia de referencia.
- Idiomas soportados no confirmados: aunque el modelo base es multilingue, el ajuste fino podria haber reducido el rendimiento en idiomas distintos del usado en el entrenamiento.
- Longitud de contexto no confirmada: no se garantiza que el ajuste conserve la ventana de 128.000 tokens del modelo base.
- Licencia Apache 2.0 declarada en el repositorio, pero conviene verificar la compatibilidad con los terminos de uso del modelo base Gemma 3, que tienen condiciones adicionales de uso aceptable.
- Sin descargas ni interacciones registradas: no hay evidencia de uso en la comunidad que permita inferir su calidad o estabilidad.
- No apto para produccion sin una evaluacion previa sobre el dominio objetivo y sin un mecanismo de validacion humana de las salidas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/gplsi/Gemma-3-4B-OntologyLearning-DBpediaArchivo-TDSelect-OBI-Top10-e1-ft
- Modelo base Gemma 3 4B (referencia): https://huggingface.co/google/gemma-3-4b-it
- Ontologia DBpedia Archivo (referencia): https://databus.dbpedia.org/archivo/
- Ontologia OBI (Ontology for Biomedical Investigations): https://obi-ontology.org/
- Grupo de investigacion GPLSI: https://gplsi.dlsi.ua.es/
