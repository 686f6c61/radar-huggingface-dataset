# mradermacher/Qwen3.5-9B-Claude-Fable-5xMerge-i1-GGUF

## Resumen

Esta ficha describe `mradermacher/Qwen3.5-9B-Claude-Fable-5xMerge-i1-GGUF`, un repositorio de cuantizaciones GGUF publicadas por el usuario mradermacher a partir del modelo `xtools-at/Qwen3.5-9B-Claude-Fable-5xMerge`. No se trata de un modelo entrenado desde cero, sino de una distribucion de pesos cuantizados: el modelo original es un merge de la familia Qwen3.5 con aproximadamente 8.953.803.264 parametros (unos 8,95 mil millones) y licencia Apache-2.0. El repositorio ocupa 110,2 GB en total, suma de las multiples variantes de cuantizacion incluidas.

El interes practico de esta publicacion es que pone a disposicion del ecosistema `llama.cpp` una version con cuantizacion asistida por imatrix, lo que permite ejecutar un modelo de ~9B con requisitos de memoria que van desde unos 2,8 GB en la variante mas agresiva (i1-IQ1_S) hasta formatos de mayor fidelidad. Las etiquetas del modelo apuntan a casos de uso de razonamiento, generacion de codigo, flujos agenticos, conversacion, escritura creativa y contexto largo, con soporte declarado unicamente para ingles.

El modelo base se presenta como un merge de cinco componentes ("5xMerge"), con datasets de referencia orientados a trazas de razonamiento y a entornos de terminal/agente (Fable-5-traces, gpt5.5-terminal y claude-fable-5-claude-code). Es relevante ahora porque los merges de modelos pequenos orientados a codigo y uso agentico son un nicho activo en la comunidad open source, y contar con cuantizaciones GGUF listas para desplegar reduce la barrera de entrada para probarlos en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio es un merge de pesos de la familia Qwen3.5; no se detalla la arquitectura interna ni la configuracion de capas) |
| Parametros totales | 8.953.803.264 (aproximadamente 8,95B, dato de safetensors del modelo base) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1 con imatrix: IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K, IQ4_XS y variantes adicionales listadas en el repositorio |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones) y safetensors (modelo base); se incluye un fichero imatrix para generar cuantizaciones propias |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo: aplica cuantizacion con imatrix sobre `xtools-at/Qwen3.5-9B-Claude-Fable-5xMerge`. Ese modelo base es, segun su nombre, un merge de cinco variantes ("5xMerge") construido sobre un modelo de la familia Qwen3.5 de aproximadamente 9B de parametros. La model card de la cuantizacion no detalla la tecnica de merge empleada (no se especifica si es linear, SLERP, TIES, DARE u otra), ni la configuracion de atencion, numero de capas o dimension oculta. Tampoco se documenta si el modelo base paso por fases de RLHF, DPO u otro tipo de ajuste por preferencias.

Lo que si se documenta son los datasets asociados al modelo base: `Glint-Research/Fable-5-traces` (trazas de razonamiento), `Roman1111111/gpt5.5-terminal` (datos orientados a uso de terminal) y `armand0e/claude-fable-5-claude-code` (trazas de uso de codigo en estilo agente). Esto sugiere que el ajuste del modelo base se oriento a tareas agenticas, ejecucion de comandos y generacion de codigo, aunque no se indica el volumen de tokens de entrenamiento ni la composicion exacta del dataset. La innovacion tecnica destacable de este repositorio es la propia cuantizacion i1 con fichero imatrix, que permite ajustar la asignacion de bits por tensor segun su importancia y obtener mejor relacion calidad/tamano que una cuantizacion estatica equivalente.

## Capacidades

- Generacion de texto conversacional en ingles, con enfasis declarado en escritura creativa.
- Razonamiento multi-paso, segun la etiqueta `reasoning` de la model card.
- Generacion de codigo, con etiqueta `coding` explicita.
- Uso agentico y ejecucion de tareas de terminal, apoyado por el dataset `gpt5.5-terminal` del modelo base.
- Soporte declarado de contexto largo (etiqueta `long-context`), aunque no se especifica la ventana concreta.
- Compatibilidad con endpoints de inferencia (etiqueta `endpoints_compatible`).
- Capacidad multilingue: limitada a ingles segun el campo `language`.

No se documenta en la informacion disponible si el modelo soporta tool calling o function calling de forma nativa, ni si incorpora modos especiales como thinking mode, razonamiento explicito o entrada de audio. La model card del cuantizador incluye una nota que afirma que se trata de un modelo de vision y que los ficheros `mmproj` estarian en el repositorio estatico; no hay confirmacion adicional de esta capacidad en las etiquetas del modelo base.

## Casos de uso

- Asistente de codigo en local: con un peso de 5,7 GB en Q4_K_M, el modelo se puede ejecutar en una GPU de 12 GB y usarse como autocompletado o asistente de refactorizacion sin enviar codigo a servicios externos, algo critico en entornos con requisitos de confidencialidad.
- Automatizacion de tareas de terminal: dado el origen de sus datos de ajuste (trazas de terminal), encaja en agentes que generan y explican comandos de shell, interpretan salidas de error y proponen correcciones iterativas.
- Generacion de codigo en pipelines de CI/CD: puede integrarse en scripts de revision automatica de parches o generacion de tests, siempre que se valide la salida en un paso posterior, ya que no hay datos publicados de fiabilidad.
- Prototipado rapido de agentes: las etiquetas `agentic` y `endpoints_compatible` lo hacen util para montar un bucle de razonamiento multi-paso con llamadas a herramientas, con la ventaja de poder correr en una sola GPU de consumo.
- Escritura creativa y generacion de contenido en ingles: la etiqueta `creative-writing` y la naturaleza de merge del modelo apuntan a redaccion de narrativa, dialogos o copy, con la salvedad de que solo esta soportado el ingles.
- Inferencia en CPU o equipos sin GPU dedicada: las cuantizaciones Q4_0 y Q4_K_S, en el rango de 5,4 a 5,5 GB, permiten ejecucion con `llama.cpp` en maquinas con 8-16 GB de RAM, util para demos y entornos de desarrollo.
- Evaluacion comparativa de merges comunitarios: el repositorio ofrece mas de veinte variantes de cuantizacion del mismo modelo base, lo que sirve para medir el impacto real de la cuantizacion en la calidad de un merge pequeno antes de adoptarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye mediciones de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion, ni comparaciones numericas con otros modelos. Tampoco se documentan mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia, segun el tamano de fichero publicado por el autor: i1-IQ1_S 2,8 GB; i1-IQ2_M 3,7 GB; i1-Q3_K_M 4,7 GB; i1-IQ4_XS 5,3 GB; i1-Q4_K_S 5,5 GB; i1-Q4_K_M 5,7 GB; i1-Q5_K_S 6,4 GB. A estas cifras hay que sumar el cache KV, que depende de la longitud de contexto configurada y del numero de capas.
- GPU de gama de consumo: el modelo entra con holgura en tarjetas de 8 GB (por ejemplo, RTX 3060 Ti, RTX 4060) usando cuantizaciones Q4 o inferiores, y en 12 GB (RTX 3060 12 GB, RTX 4070) con Q4_K_M o Q5_K_S y contexto moderado. En 16-24 GB (RTX 4080, RTX 4090, RTX 3090) caben las variantes de mayor calidad con contexto amplio, pendiente de confirmar la ventana real del modelo.
- GPU de datacenter: A100, H100 o L40S permiten ejecutar el modelo en FP16 o en cuantizaciones altas con lotes grandes, si bien para 9B el coste de una GPU profesional raramente esta justificado.
- Opciones de despliegue: `llama.cpp` y sus derivados como Ollama o LM Studio son la via natural al tratarse de GGUF. Para servidores con mayor concurrencia, vLLM o TGI requieren los pesos en safetensors del modelo base, no los GGUF.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de tiempo hasta el primer token en ninguna configuracion de hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.5-9B-Claude-Fable-5xMerge (i1-GGUF) | ~8,95B | no disponible | Apache-2.0 | GGUF (este repositorio) y safetensors (modelo base) |
| Qwen3-8B | ~8,2B (dato publico) | 32.768 tokens nativos, extensible (dato publico) | Apache-2.0 | safetensors y multiples GGUF comunitarios |
| Llama 3.1 8B Instruct | ~8B (dato publico) | 128.000 tokens (dato publico) | Llama 3.1 Community License, con condiciones adicionales para uso a gran escala | safetensors y multiples GGUF comunitarios |
| Mistral 7B Instruct | ~7,2B (dato publico) | 32.000 tokens (dato publico) | Apache-2.0 | safetensors y multiples GGUF comunitarios |

No se dispone de resultados de benchmarks de este merge que permitan comparar su calidad frente a las alternativas anteriores, por lo que la comparacion se limita a parametros, contexto declarado, licencia y formato de distribucion. Los datos de contexto y parametros de los modelos de referencia corresponden a informacion publica de sus respectivos autores y no a mediciones propias.

## Limitaciones y advertencias

- No hay ninguna evaluacion publicada de calidad, por lo que se desconoce la magnitud de la degradacion introducida por el merge y por cada nivel de cuantizacion. Las variantes por debajo de Q3 (etiquetadas por el propio autor como "very low quality" o "for the desperate") deben considerarse experimentales.
- Riesgo de alucinacion no medido: no se han publicado tasas de error en tareas factuales ni de generacion de codigo. En entornos productivos es obligatoria la validacion posterior de las salidas.
- Cobertura idiomatica limitada a ingles. El modelo no declara soporte de castellano, por lo que su uso en produccion en espanol no esta respaldado por el autor y puede degradar notablemente.
- Sesgos: no hay informacion sobre los datos de entrenamiento del modelo base, mas alla de los tres datasets de referencia, ni sobre procesos de alineacion o mitigacion de sesgos.
- La licencia del modelo publicado es Apache-2.0, lo que en principio permite uso comercial. No obstante, conviene verificar la licencia y las condiciones de los modelos originales que componen el merge, ya que el repositorio no documenta la procedencia completa de los cinco componentes fusionados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Advertencia sobre la fecha: los metadatos indican una fecha de creacion posterior a la de redaccion habitual de este tipo de fichas, dato que conviene verificar en la pagina del modelo.
- Los ficheros GGUF no son compatibles con stacks de inferencia que esperan safetensors, como vLLM o TGI, sin una conversion previa.
- La afirmacion de la model card de que se trata de un modelo de vision no esta confirmada por las etiquetas del modelo base ni por la documentacion disponible.

## Enlaces

- Repositorio de cuantizaciones i1 (esta ficha): https://huggingface.co/mradermacher/Qwen3.5-9B-Claude-Fable-5xMerge-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/Qwen3.5-9B-Claude-Fable-5xMerge-GGUF
- Modelo base: https://huggingface.co/xtools-at/Qwen3.5-9B-Claude-Fable-5xMerge
- Listado de ficheros del modelo: https://hf.tst.eu/model#Qwen3.5-9B-Claude-Fable-5xMerge-i1-GGUF
- Dataset Glint-Research/Fable-5-traces: https://huggingface.co/datasets/Glint-Research/Fable-5-traces
- Dataset Roman1111111/gpt5.5-terminal: https://huggingface.co/datasets/Roman1111111/gpt5.5-terminal
- Dataset armand0e/claude-fable-5-claude-code: https://huggingface.co/datasets/armand0e/claude-fable-5-claude-code
- Referencia de uso de ficheros GGUF citada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Paper, blog o demo oficial: no disponible
