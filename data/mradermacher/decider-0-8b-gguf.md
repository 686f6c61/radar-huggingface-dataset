# mradermacher/decider-0.8b-GGUF

## Resumen

El repositorio `mradermacher/decider-0.8b-GGUF` contiene cuantizaciones estáticas en formato GGUF del modelo `Mapika/decider-0.8b`, publicadas por el usuario mradermacher, especializado en la generación masiva de versiones cuantizadas de modelos abiertos para su uso con llama.cpp y derivados. Por la nomenclatura del identificador, el modelo base tendría aproximadamente 0,8 mil millones de parámetros, aunque no se ha publicado información verificable sobre su arquitectura, datos de entrenamiento o idiomas soportados.

El problema que resuelve este repositorio es de tipo práctico y de despliegue: ofrece el modelo en múltiples niveles de cuantización (desde Q2_K hasta f16, pasando por IQ4_XS y las familias Q3, Q4, Q5, Q6 y Q8) para que el usuario pueda elegir el compromiso entre tamaño en disco, consumo de memoria y fidelidad respecto a los pesos originales. Su relevancia radica en que permite ejecutar un modelo de menos de mil millones de parámetros en hardware muy modesto, incluso en CPU, algo habitual para tareas de clasificación, enrutado o generación de texto ligera.

La información disponible es muy limitada: no hay model card descriptiva, no se especifican licencia, idiomas, longitud de contexto ni pipeline, y los resultados de la búsqueda web proporcionados no guardan relación con el modelo (corresponden al microcontrolador STM32L451RE). La cuantización fue generada con un proceso de tipo `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, según los metadatos incluidos en el propio README del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no documentada en la informacion proporcionada) |
| Parametros totales | aproximadamente 0,8 mil millones (inferido de la nomenclatura del identificador, sin confirmacion documental) |
| Parametros activos | no disponible (no se ha confirmado que el modelo sea de tipo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16 (etiquetada como `x-f16`), Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repositorio no la declara y no se puede verificar la del modelo base) |
| Formato de pesos | GGUF (generado con llama.cpp; `convert_type: hf`, `quantize_version: 2`) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo base `Mapika/decider-0.8b` en los datos disponibles. El unico dato tecnico verificable procede de los metadatos de la cuantizacion incluidos en el README del repositorio: se trata de una conversion desde pesos en formato HuggingFace (`convert_type: hf`) con cuantizacion de tensores de salida (`output_tensor_quantised: 1`) y version de cuantizador 2 (`quantize_version: 2`), siguiendo el flujo estandar de llama.cpp. Se desconoce si el modelo original usa un transformer denso convencional, una mezcla de expertos, atencion lineal o una arquitectura hibrida.

Tampoco hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de ajuste como RLHF, DPO o SFT. El nombre del modelo ("decider") sugiere un enfoque orientado a la toma de decisiones o al enrutado, pero esto es una interpretacion del identificador y no un dato confirmado en la documentacion disponible. Cualquier afirmacion sobre innovaciones tecnicas (decodificacion especulativa, atencion lineal, contextos extendidos) seria especulativa y no debe tomarse como valida sin consultar la ficha del modelo base.

## Capacidades

- Generacion de texto: capacidades no verificadas; no hay model card que las describa ni evaluaciones publicadas.
- Razonamiento, matematicas y generacion de codigo: no disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declara ninguna lista de idiomas.
- Capacidades especiales (modo de razonamiento explicito, vision, audio): no disponible. El repositorio no incluye proyector multimodal (no aparece la etiqueta `skip_mmproj` con contenido asociado, lo que no permite confirmar ni descartar su existencia).
- Formato de entrega: el unico aspecto confirmado es la disponibilidad de pesos cuantizados en GGUF listos para inferencia con llama.cpp y herramientas compatibles.

## Casos de uso

Advertencia previa: al no existir documentacion del modelo base ni evaluaciones publicadas, los escenarios siguientes son aplicaciones tipicas de un modelo denso de aproximadamente 0,8 mil millones de parametros cuantizado en GGUF. Deben validarse con una evaluacion propia antes de llevarlos a produccion.

- Clasificacion y etiquetado de texto a gran escala: un modelo de este tamano puede procesar grandes volumenes de documentos por lotes en CPU, con un coste por inferencia muy bajo, siempre que se valide su precision en la tarea concreta frente a un modelo mayor.
- Enrutado o triaje previo en pipelines multi-modelo: el modelo puede actuar como primera etapa que decide si una consulta se resuelve localmente o se deriva a un modelo mayor, aprovechando el bajo coste de la cuantizacion Q4_K_M o Q5_K_M.
- Generacion de texto asistida en entornos con recursos muy limitados: equipos de desarrollo, entornos de integracion continua o dispositivos sin GPU dedicada pueden ejecutar las variantes Q4 o Q5 con llama.cpp sobre CPU.
- Prototipado y evaluacion de cuantizaciones: el repositorio ofrece doce niveles de cuantizacion distintos, lo que lo hace util para medir la degradacion de calidad entre Q2_K, Q3_K, Q4_K y Q8_0 sobre el mismo modelo base.
- Extraccion de informacion estructurada simple: tareas de parsing de campos, normalizacion de entradas o conversion de texto a formularios, con verificacion posterior obligatoria por el riesgo de alucinacion.
- Filtrado o moderacion preliminar de contenido: como etapa de criba de bajo coste antes de un modelo mayor encargado de la decision final.
- Aplicaciones embebidas o de escritorio offline: la variante Q2_K o Q3_K_S, con tamanos de archivo del orden de cientos de megabytes, permite distribuir el modelo junto a una aplicacion de escritorio sin dependencia de red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni el repositorio de cuantizaciones ni los datos de busqueda proporcionados incluyen valores de MMLU, HumanEval, GSM8K, ARC, HellaSwag o cualquier otra metrica. Los resultados de la busqueda web facilitados corresponden al microcontrolador STM32L451RE de STMicroelectronics y no guardan ninguna relacion con este modelo, por lo que no se han utilizado como fuente.

## Requisitos de hardware

Estimaciones derivadas del recuento aproximado de parametros (0,8 mil millones). El tamano real de los archivos GGUF es ligeramente superior al calculo teorico de los pesos debido a metadatos y alineacion.

- VRAM o RAM estimada para los pesos:
  - f16: en torno a 1,6 GB.
  - Q8_0: en torno a 0,85 GB.
  - Q6_K: en torno a 0,65 GB.
  - Q5_K_M / Q5_K_S: en torno a 0,6 GB.
  - Q4_K_M / Q4_K_S: en torno a 0,5 GB.
  - Q3_K_L / Q3_K_M / Q3_K_S: entre 0,4 y 0,45 GB.
  - Q2_K: en torno a 0,35 GB.
- Memoria adicional: hay que sumar la cache KV, cuyo tamano depende de la longitud de contexto configurada y del numero de capas del modelo base, ambos no disponibles. Para contextos largos la cache puede superar el tamano de los propios pesos.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090) es suficiente para las cuantizaciones Q4 y superiores. En el extremo profesional, una A100 o H100 queda enormemente sobredimensionada para este tamano, salvo que se use para servir muchas instancias en paralelo.
- Cabe en GPU consumer: si, en practicamente cualquier GPU dedicada moderna, e incluso en GPU integradas con memoria compartida suficiente.
- Inferencia en CPU: viable en todas las cuantizaciones; las variantes Q4_K_M y Q5_K_M ofrecen el mejor equilibrio habitual entre calidad y velocidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui y otras herramientas compatibles con GGUF. El soporte de GGUF en vLLM es experimental, y TGI trabaja principalmente con safetensors, por lo que para servir este repositorio conviene llama.cpp o un servidor basado en el.
- Latencia y throughput: no disponible. No hay mediciones publicadas para este repositorio. Cualquier cifra concreta de tokens por segundo dependeria del hardware, del nivel de cuantizacion y de la longitud de contexto, y deberia medirse en el entorno de destino.

## Comparativa con modelos similares

Los datos de los modelos comparados proceden de sus fichas publicas y se incluyen como referencia estructural; deben verificarse en la fuente original antes de tomar decisiones de produccion. No hay datos de rendimiento del modelo evaluado, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad.

| Modelo | Parametros | Contexto | Licencia | Formato disponible | Rendimiento comparado |
|---|---|---|---|---|---|
| mradermacher/decider-0.8b-GGUF | aprox. 0,8 mil millones (inferido) | no disponible | no disponible | GGUF (12 cuantizaciones) | no disponible |
| Qwen2.5-0.5B-Instruct | 0,49 mil millones | 32 768 tokens | Apache 2.0 | safetensors y GGUF | no disponible en esta comparativa |
| Llama-3.2-1B-Instruct | 1,24 mil millones | 128 000 tokens | Llama 3.2 Community License | safetensors y GGUF | no disponible en esta comparativa |
| SmolLM2-1.7B-Instruct | 1,7 mil millones | 8192 tokens | Apache 2.0 | safetensors y GGUF | no disponible en esta comparativa |

La diferencia mas relevante a favor de las alternativas citadas es la existencia de una licencia explicita y de documentacion completa sobre arquitectura, datos de entrenamiento y evaluaciones, aspectos que este repositorio no proporciona.

## Limitaciones y advertencias

- Ausencia total de model card: no hay descripcion de arquitectura, datos de entrenamiento, sesgos conocidos ni limitaciones declaradas por el autor. Cualquier uso en produccion exige una evaluacion propia previa.
- Licencia no especificada: al no declararse licencia en el repositorio ni poder verificarse la del modelo base, no hay garantia de uso comercial. Contactar con el autor del modelo original antes de cualquier despliegue comercial.
- Idiomas no documentados: se desconoce si el modelo funciona correctamente en castellano o si esta limitado al ingles u otros idiomas.
- Longitud de contexto desconocida: no se puede planificar el diseno de aplicaciones con contexto largo ni estimar el consumo de memoria de la cache KV.
- Riesgo de alucinacion: los modelos de menos de mil millones de parametros tienden a presentar tasas de alucinacion mas altas y menor adherencia a instrucciones complejas que modelos mayores. Es imprescindible validar las salidas con reglas de negocio o con un segundo modelo verificador.
- Degradacion por cuantizacion: las variantes Q2_K y Q3_K_S reducen de forma notable la fidelidad respecto al modelo original. Para tareas sensibles a la calidad conviene usar Q4_K_M o superior.
- Trazabilidad limitada: no se documenta la fecha de entrenamiento del modelo base ni los datos utilizados, por lo que no se puede evaluar la contaminacion de benchmarks ni el posible sesgo temporal.
- Popularidad nula en el momento de la consulta: el repositorio registra 0 descargas y 0 likes, sin senales de validacion por parte de la comunidad.
- Resultados de busqueda no relacionados: los enlaces disponibles en la busqueda web corresponden a otro producto completamente distinto, por lo que no aportan informacion tecnica sobre este modelo.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/decider-0.8b-GGUF
- Modelo base referenciado: https://huggingface.co/Mapika/decider-0.8b
- Herramienta compatible con el formato GGUF (no procede de la busqueda web): https://github.com/ggml-org/llama.cpp
- Papers, blogs, demos o repositorios adicionales: no disponibles. La busqueda web realizada devolvio unicamente documentacion del microcontrolador STM32L451RE de STMicroelectronics, sin relacion con este modelo.
