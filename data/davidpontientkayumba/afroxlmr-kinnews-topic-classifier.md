# DavidPontientKayumba/afroxlmr-kinnews-topic-classifier

## Resumen

El modelo `DavidPontientKayumba/afroxlmr-kinnews-topic-classifier` es un clasificador de texto en kinyarwanda desarrollado por el usuario DavidPontientKayumba. Se trata de un ajuste fino (*fine-tuning*) del modelo base `Davlan/afro-xlmr-base` sobre el corpus KINNEWS (Niyongabo et al., 2020), con el objetivo de asignar articulos de prensa en kinyarwanda a una de 14 categorias tematicas. Es, por tanto, un modelo especializado en una tarea concreta de clasificacion de secuencias, no un modelo generativo.

La relevancia de este tipo de modelos radica en su aplicacion a lenguas de bajos recursos: el kinyarwanda es un idioma bantue hablado principalmente en Ruanda, con escasa cobertura en herramientas de PLN comerciales. El modelo aprovecha la arquitectura XLM-RoBERTa de AfroXLMR, que aporta representaciones multilingues preentrenadas sobre lenguas africanas, y las adapta a una tarea de clasificacion tematica de noticias mediante un ajuste fino supervisado con 3 epocas de entrenamiento.

Con 278.054.414 parametros, se situa en la categoria de modelos encoder de tamano base, lo que permite su despliegue incluso en CPU o GPU de gama de consumo. Los resultados declarados en el conjunto de test limpio (2.027 articulos) son una exactitud (*accuracy*) de 0,7834 y un macro F1 de 0,6666, lo que indica un rendimiento correcto en las clases mayoritarias pero un margen claro de mejora en las minoritarias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo XLM-RoBERTa (familia AfroXLMR), cabeza de clasificacion de secuencias |
| Parametros totales | 278.054.414 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens segun la arquitectura base XLM-RoBERTa; el entrenamiento utilizo una longitud maxima de 256 tokens |
| Tipos de cuantizacion | No disponible (el repositorio distribuye pesos en precision completa, formato safetensors) |
| Idiomas soportados | Kinyarwanda (idioma de la tarea); el modelo base es multilingue |
| Licencia | No disponible; la model card remite a la licencia del modelo base `Davlan/afro-xlmr-base` |
| Formato de pesos | safetensors |
| Tarea | Clasificacion de texto multietiqueta (14 topicos) |
| Tamano del repositorio | 1,1 GB |
| Fecha de publicacion | 15 de octubre de 2026 (segun metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura XLM-RoBERTa de tamano base, un transformer encoder con atencion bidireccional, que constituye la base de AfroXLMR. Sobre esa arquitectura se ha anadido una cabeza de clasificacion de secuencias que proyecta la representacion del token `[CLS]` (o equivalente) a un espacio de 14 clases, correspondientes a los topicos del corpus KINNEWS. Los 278 millones de parametros del ajuste coinciden con el tamano del XLM-RoBERTa base, de modo que el fine-tuning no introduce parametros nuevos mas alla de la cabeza de clasificacion.

El entrenamiento se realizo sobre la version limpiada del corpus KINNEWS, un conjunto de noticias en kinyarwanda procedente del trabajo de Niyongabo et al. (2020). La configuracion declarada es de 3 epocas, longitud maxima de 256 tokens, tasa de aprendizaje de 2e-5 y tamano de lote de 16. No se documenta el uso de tecnicas adicionales de alineacion (RLHF/DPO), decodificacion especulativa ni otras innovaciones; al tratarse de una tarea discriminativa, no aplican en el mismo sentido que en modelos generativos. El ajuste se evaluo sobre un conjunto de test limpio de 2.027 articulos.

## Capacidades

- Clasificacion de articulos de prensa en kinyarwanda en 14 categorias tematicas.
- Procesamiento de secuencias de hasta 256 tokens en el regimen de entrenamiento (la arquitectura base admite hasta 512).
- Trabajo sobre texto plano en kinyarwanda; hereda representaciones multilingues del modelo base AfroXLMR, aunque no se documenta su rendimiento en otros idiomas para esta tarea.
- Salida de logits/probabilidades por clase, apta para umbralizacion y post-procesado.
- No soporta generacion de texto, tool calling, function calling, razonamiento multi-paso ni agentes.
- No dispone de capacidades de vision, audio ni modo de razonamiento explicito (*thinking mode*).

## Casos de uso

- Clasificacion automatica de noticias en kinyarwanda: integracion del modelo en el *pipeline* de ingesta de un medio digital para etiquetar cada articulo con su topico antes de su publicacion o indexacion, reduciendo el trabajo manual de categorizacion.
- Monitorizacion de medios: seguimiento del volumen de noticias por tematica (politica, economia, deportes, etc.) para elaborar informes de tendencia a lo largo del tiempo.
- Indexacion y busqueda tematica: enriquecimiento de un motor de busqueda o de un CMS con etiquetas de topico que permitan filtrar y recuperar contenido por categoria.
- Sistemas de recomendacion de contenido: uso de la etiqueta de topico como senal para sugerir articulos relacionados a los lectores.
- Moderacion y enrutado editorial: derivacion automatica de articulos a las secciones o editores correspondientes segun su tematica.
- Anotacion asistida de corpus: preetiquetado de grandes volumenes de texto en kinyarwanda para acelerar la creacion de conjuntos de datos etiquetados por anotadores humanos.
- Investigacion en PLN de bajos recursos: uso como linea base o componente en estudios sobre clasificacion tematica en lenguas africanas.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Exactitud (*accuracy*) en test limpio | 0,7834 |
| Macro F1 en test limpio | 0,6666 |
| Tamano del conjunto de test | 2.027 articulos |

No se han publicado en la informacion disponible otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.), ya que no aplican a un modelo encoder de clasificacion y no se proporcionan comparativas adicionales.

## Requisitos de hardware

- VRAM estimada en FP32: aproximadamente 1,1 GB de pesos (el repositorio ocupa 1,1 GB), mas overhead de activaciones; en la practica se recomienda reservar en torno a 1,5-2 GB.
- VRAM estimada en FP16: aproximadamente 0,56 GB de pesos.
- VRAM estimada en int8: aproximadamente 0,28 GB de pesos (requiere cuantizacion posterior, no incluida en el repositorio).
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM; una NVIDIA T4, RTX 3060 o superior es mas que suficiente. Modelos como A100 o H100 estan sobredimensionados para este encoder y solo tendrian sentido con lotes muy grandes.
- Compatibilidad con GPU de consumo: si, cabe sin problemas en cualquier GPU de gama de consumo reciente e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: HuggingFace Transformers, ONNX Runtime o TorchServe para servir el encoder. Las soluciones orientadas a modelos generativos (vLLM, TGI) y los runners de GGUF (llama.cpp, Ollama) no estan disenados para encoders XLM-RoBERTa y no constituyen una via estandar de despliegue.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Rendimiento declarado |
|---|---|---|---|---|---|
| afroxlmr-kinnews-topic-classifier | 278 M | 512 (entrenado a 256) | Clasificacion de 14 topicos en kinyarwanda | No disponible | Accuracy 0,7834 / macro F1 0,6666 |
| Davlan/afro-xlmr-base | 278 M | 512 | Modelo base multilingue (sin cabeza de clasificacion) | No disponible en esta ficha | No disponible |
| FacebookAI/xlm-roberta-base | 278 M | 512 | Modelo base multilingue | MIT | No disponible |
| bert-base-multilingual-cased | 178 M | 512 | Modelo base multilingue | Apache 2.0 | No disponible |

No se dispone de otros clasificadores de topicos en kinyarwanda publicados en la informacion proporcionada, por lo que la comparativa se limita a los modelos base de la misma familia y a alternativas multilingues generales.

## Limitaciones y advertencias

- Los articulos se truncan a la longitud maxima utilizada (256 tokens), de modo que la parte final de textos largos no influye en la prediccion.
- Las clases minoritarias, como historia y medio ambiente, se predicen con menor fiabilidad; la diferencia entre exactitud (0,7834) y macro F1 (0,6666) apunta a un desequilibrio de clases notable.
- El modelo se entreno unicamente con texto periodistico, por lo que su uso fuera del dominio de noticias (redes sociales, texto tecnico, conversacion) no esta validado.
- No se documentan sesgos especificos, pero al derivar de un corpus de noticias pueden heredarse sesgos presentes en la cobertura mediatica de origen.
- Riesgo de alucinacion: no aplica en el sentido generativo (el modelo no produce texto), si bien puede asignar topicos incorrectos con alta confianza en entradas ambiguas o fuera de distribucion.
- Restricciones de licencia: no se especifica la licencia del ajuste; la model card remite a los terminos del modelo base. Debe verificarse antes de un uso comercial en produccion.
- Modelo con cero descargas y cero likes en el momento del registro, sin validacion externa por parte de la comunidad.
- No se documentan idiomas soportados mas alla del kinyarwanda para esta tarea, pese a que el modelo base sea multilingue.

## Enlaces

- HuggingFace: https://huggingface.co/DavidPontientKayumba/afroxlmr-kinnews-topic-classifier
- Modelo base: https://huggingface.co/Davlan/afro-xlmr-base
- Articulo del corpus KINNEWS (Niyongabo et al., 2020): no disponible en la informacion proporcionada
- Repositorio o demo adicional: no disponible en la informacion proporcionada
