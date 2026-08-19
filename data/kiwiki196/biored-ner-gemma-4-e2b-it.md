# kiwiki196/biored-ner-gemma-4-E2B-it

## Resumen

El modelo `kiwiki196/biored-ner-gemma-4-E2B-it` es un adaptador LoRA/QLoRA entrenado para la tarea de reconocimiento de entidades nombradas (NER) sobre el corpus biomédico BioRED. Desarrollado por el usuario kiwiki196 (John Wu), se basa en el modelo `google/gemma-4-E2B-it` de Google DeepMind, que pertenece a la cuarta generación de la familia Gemma. El adaptador se distribuye en formato PEFT (Parameter-Efficient Fine-Tuning) y está pensado para clasificar tokens en etiquetas de entidades biomédicas, como genes, enfermedades, productos químicos o especies.

La relevancia de este modelo radica en su especialización para el dominio biomédico, donde los modelos genéricos de lenguaje suelen fallar en la identificación precisa de terminología técnica. Al ser un adaptador ligero sobre un modelo base de tamaño reducido (Gemma 4 E2B, probablemente 2 mil millones de parámetros), permite desplegar capacidades de NER en entornos con recursos limitados. El acceso está restringido en HuggingFace, por lo que es necesario aceptar las condiciones de la licencia Gemma antes de su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA/QLoRA sobre `google/gemma-4-E2B-it` (modelo base transformer) |
| Parametros totales | No disponible (el adaptador tiene un numero reducido de parametros, pero no se especifica) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base Gemma 4 E2B) |
| Tipos de cuantizacion | No disponible (el adaptador se guarda en safetensors, pero no se indica cuantizacion del modelo base) |
| Idiomas soportados | No disponible (probablemente ingles, dado el corpus BioRED, pero no se confirma) |
| Licencia | Gemma (requiere aceptacion de terminos en HuggingFace) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) entrenado con QLoRA, una tecnica que cuantiza el modelo base para reducir el uso de memoria durante el ajuste fino. El modelo base es `google/gemma-4-E2B-it`, un modelo de lenguaje de la familia Gemma 4 de Google DeepMind, que incorpora variantes "Thinking" para razonamiento avanzado, aunque no se dispone de detalles especificos sobre su arquitectura interna (numero de capas, dimensiones, etc.) en la informacion proporcionada.

El entrenamiento se realizo sobre el corpus BioRED, un conjunto de datos para NER biomedico que incluye anotaciones de entidades como enfermedades, quimicos, genes y especies. No se han publicado detalles sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas adicionales como RLHF o DPO. El adaptador se distribuye mediante la libreria PEFT, lo que permite cargarlo sobre el modelo base sin necesidad de modificar los pesos completos.

## Capacidades

- Reconocimiento de entidades nombradas (NER) en textos biomedicos, clasificando tokens en categorias predefinidas (p. ej., enfermedades, quimicos, genes, especies).
- Clasificacion de tokens a nivel de secuencia, adecuada para tareas de extraccion de informacion en articulos cientificos, informes clinicos o bases de datos bibliograficas.
- Integracion con el ecosistema PEFT/HuggingFace, lo que facilita su uso en pipelines de procesamiento de lenguaje natural.
- No se han documentado capacidades adicionales como generacion de texto libre, tool calling o soporte multimodal, ya que el adaptador esta especializado exclusivamente en NER.

## Casos de uso

- Extraccion de entidades en articulos cientificos: el modelo puede procesar abstracts de PubMed u otros textos academicos para identificar automaticamente menciones de genes, enfermedades y compuestos quimicos, facilitando la construccion de bases de conocimiento.
- Anotacion de corpus clinicos: en historiales medicos electronicos, el adaptador puede etiquetar entidades relevantes para tareas de codificacion diagnostica o analisis de poblaciones.
- Enriquecimiento de ontologias biomedicas: al extraer entidades de grandes volumenes de texto, se pueden actualizar o ampliar ontologias como Gene Ontology o Disease Ontology con nuevas menciones.
- Sistemas de recomendacion de literatura: integrado en motores de busqueda cientifica, el modelo puede clasificar documentos segun las entidades que contienen, mejorando la precision de las busquedas tematicas.
- Preprocesamiento para relacionamiento de entidades: el NER es un paso previo comun para tareas de extraccion de relaciones (p. ej., interacciones gen-enfermedad), donde el adaptador puede servir como componente inicial en un pipeline mas complejo.
- Analisis de redes sociales sanitarias: aplicado a textos de foros o redes sociales, el modelo puede identificar menciones de sintomas o medicamentos, aunque su rendimiento en dominios no academicos no esta validado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de metricas como F1, precision o recall sobre BioRED u otros conjuntos de validacion. Tampoco hay comparaciones con otros modelos NER biomedicos.

## Requisitos de hardware

- Al ser un adaptador LoRA, el requisito principal es el modelo base `google/gemma-4-E2B-it`. Se estima que un modelo de 2B parametros en precision FP16 requiere alrededor de 4-6 GB de VRAM para inferencia, pero este dato no esta confirmado oficialmente.
- El adaptador en si ocupa 3.3 GB en disco, pero al cargarse junto con el modelo base, la memoria total dependera de la cuantizacion elegida para el modelo base.
- Es probable que quepa en GPUs de consumo como la RTX 3060 (12 GB) o superiores, siempre que se use cuantizacion (p. ej., 4 bits) para el modelo base.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la libreria `transformers` y `peft` en Python. Tambien es compatible con frameworks como vLLM o TGI si se fusiona el adaptador con el modelo base, aunque no se ha verificado su soporte explicito.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros adaptadores NER biomedicos. Existen modelos como `BioBERT`, `PubMedBERT` o adaptadores sobre Llama para NER, pero no se han encontrado datos publicos que permitan una comparacion directa con este adaptador en terminos de rendimiento o especificaciones.

## Limitaciones y advertencias

- Acceso restringido: el modelo requiere aceptar las condiciones de la licencia Gemma en HuggingFace, lo que puede limitar su uso en entornos corporativos con politicas de licenciamiento estrictas.
- Sesgos potenciales: al entrenarse sobre un corpus biomedico especifico (BioRED), el modelo puede tener un rendimiento suboptimo en otros dominios o en textos no academicos.
- Riesgo de alucinacion: como adaptador sobre un modelo generativo, existe la posibilidad de que clasifique tokens de forma incorrecta si el contexto es ambiguo o si el texto contiene terminologia fuera del alcance del corpus de entrenamiento.
- Limitaciones de idioma: no se ha confirmado el soporte multilingue; es probable que el modelo funcione mejor en ingles, dado el origen del corpus BioRED.
- Dependencia del modelo base: el rendimiento final depende de la calidad de `google/gemma-4-E2B-it`, del cual no se han proporcionado especificaciones detalladas en la informacion disponible.
- Sin garantias de produccion: al no haber benchmarks publicados, no se recomienda su uso en entornos criticos sin una evaluacion previa exhaustiva.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kiwiki196/biored-ner-gemma-4-E2B-it
- Perfil del autor: https://huggingface.co/kiwiki196
- Pagina oficial de Gemma 4: https://deepmind.google/models/gemma/gemma-4/
- Documentacion de Gemma: https://deepmind.google/models/gemma/
