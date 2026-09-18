# makitty/QuechuaGPT-chanka-4B-merged

## Resumen

QuechuaGPT-chanka-4B-merged es un modelo de lenguaje de aproximadamente 4.500 millones de parametros publicado por el usuario makitty en HuggingFace. Se trata de un ajuste fino (finetuning) derivado del modelo Thermostatic/rosettia-chanka-4b-alpha160, segun declara la propia model card, y ha sido entrenado con la libreria Unsloth sobre la arquitectura etiquetada como qwen3_5. El repositorio usa la libreria transformers y distribuye pesos en formato safetensors, con licencia Apache 2.0.

El nombre del modelo sugiere un enfoque hacia el quechua (variante chanka), pero la informacion disponible no documenta ese extremo: la unica lengua declarada en los metadatos es el ingles ("en"), y no se incluye ninguna descripcion de los datos de entrenamiento ni de la composicion del corpus. Tampoco se especifican la longitud de contexto, el pipeline exacto de entrenamiento, ni resultados de evaluacion.

El modelo es relevante por dos motivos acotados: primero, por ser un ejemplo de ajuste fino de bajo coste sobre una base multimodal/etiquetada como image-text-to-text, reproducible con Unsloth; segundo, por el interes de la comunidad en modelos especificos para lenguas de bajos recursos como el quechua. No obstante, con 0 descargas y 0 likes en el momento de la consulta y una model card minima, debe considerarse un artefacto en fase muy temprana, no validado y sin garantias de calidad en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Etiquetada como qwen3_5 en los tags del repositorio; no se detalla la configuracion interna (numero de capas, atencion, etc.). No disponible |
| Parametros totales | 4.539.265.536 (aprox. 4.540 millones, dato de los pesos safetensors) |
| Parametros activos | No aplica / no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos en safetensors; el repositorio incluye los tags "4-bit" y "bitsandbytes". No se ofrecen variantes GGUF, AWQ ni GPTQ documentadas |
| Idiomas soportados | Ingles ("en") declarado en los metadatos. El nombre sugiere quechua, pero no esta documentado |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 3,4 GB |
| Pipeline declarado | image-text-to-text |
| Modelo base | Thermostatic/rosettia-chanka-4b-alpha160 |
| Libreria | transformers |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura interna mas alla del tag "qwen3_5" y de la referencia a un transformer generativo propio de la familia Qwen. El pipeline declarado es image-text-to-text, lo que sugiere capacidad de entrada multimodal (imagen y texto), aunque la model card no describe ningun encoder visual, proyector ni procedimiento de alineacion multimodal. Tampoco se detalla si se trata de un transformer denso, de un modelo con atencion lineal o de una variante hibrida.

En cuanto al entrenamiento, la unica informacion disponible es que el ajuste se realizo con Unsloth, que la model card describe como "2x faster", y que el resultado se fusiono (de ahi el sufijo "merged") partiendo de Thermostatic/rosettia-chanka-4b-alpha160. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF, DPO, SFT u otras tecnicas de alineacion, ni los hiperparametros relevantes. Tampoco se documenta ninguna tecnica de decodificacion especulativa, atencion lineal o innovacion arquitectonica concreta.

## Capacidades

- Generacion de texto conversacional: el tag "conversational" indica que el modelo esta formateado para dialogos multi-turno, aunque no se detalla la plantilla de chat utilizada.
- Entrada multimodal imagen-texto: el pipeline declarado es image-text-to-text, lo que implica que el modelo aceptaria imagenes junto a texto; no se documenta el rendimiento ni los casos soportados.
- Ajuste fino sobre base instruida o preentrenada: el modelo deriva de una base de 4B y ha sido reentrenado con Unsloth/TRL.
- Idiomas: el unico idioma declarado es el ingles. El quechua aparece sugerido en el nombre pero no esta declarado en los metadatos.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode), audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

Dado que no hay benchmarks, evaluaciones ni documentacion de capacidades, los siguientes casos son escenarios plausibles derivados del tipo de modelo, no usos validados. Se recomienda evaluar internamente antes de cualquier despliegue.

- Prototipado de asistentes conversacionales en ingles: al ser un modelo de 4,5B con tag conversacional y pesos en safetensors, puede cargarse en transformers para experimentar con dialogos multi-turno en entornos de desarrollo con una sola GPU.
- Investigacion en lenguas de bajos recursos: el nombre del modelo y su base (rosettia-chanka) apuntan a un interes por el quechua chanka; serviria como punto de partida para experimentos de ajuste fino adicional, siempre que se verifique primero la competencia real en ese idioma.
- Experimentos de ajuste fino con Unsloth: al haberse entrenado con esa libreria, es un candidato razonable para reproducir el flujo de trabajo (QLoRA, fusion de adaptadores) en GPUs de gama media con 24 GB o menos.
- Base para pipelines multimodales de investigacion: si la capacidad image-text-to-text funciona, podria usarse en tareas de descripcion de imagenes o VQA en ingles; sin embargo, no hay evidencia publicada de que lo haga correctamente.
- Generacion de texto en lote para tareas de bajo riesgo: resumenes, reescritura o clasificacion de texto en ingles dentro de un pipeline offline, donde los errores se revisan antes de publicarse.
- Docencia y practica de despliegue: por su tamano moderado, es util para montar demos con TGI o transformers y practicar tecnicas de cuantizacion y servido de modelos.
- Comparacion de tecnicas de fusion de adaptadores: al ser un modelo "merged", puede emplearse en estudios sobre el impacto de fusionar adaptadores frente a mantenerlos separados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y la busqueda web realizada no devolvio resultados relacionados con el modelo (los unicos resultados obtenidos fueron recetas de sopa de pollo, totalmente ajenos a la consulta, por lo que se descartan).

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 9 GB solo para pesos (4.540 millones de parametros x 2 bytes), mas overhead de activaciones y cache KV, lo que situa el consumo practico en torno a 11-13 GB.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 2,5-3 GB para los pesos, con un consumo practico tipico de 4-6 GB segun longitud de contexto y batch.
- GPU consumer: un modelo de 4,5B cabe sin problema en GPUs consumer con 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090) en cuantizacion de 4 bits, y en 16 GB o mas en bf16. En GPUs de 8 GB es viable unicamente en 4 bits con contexto corto.
- GPU profesionales: A100 40/80 GB, H100, L40S y A6000 permiten servirlo en bf16 con batches grandes y contextos largos, aunque el modelo no aprovecha esa capacidad de memoria por su tamano reducido.
- Opciones de despliegue: transformers (libreria declarada en el repositorio) y text-generation-inference, que aparece como tag. El tag "endpoints_compatible" sugiere compatibilidad con Inference Endpoints de HuggingFace. vLLM, llama.cpp, Ollama y TGI son tecnicamente plausibles, pero no hay confirmacion de compatibilidad ni de existencia de pesos GGUF.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de latencia en ninguna configuracion.

## Comparativa con modelos similares

Los datos de la columna "modelo comparable" proceden de la documentacion publica habitual de esos modelos y se incluyen solo como referencia de categoria; el rendimiento real de QuechuaGPT-chanka-4B-merged no puede compararse porque no existen evaluaciones publicadas.

| Aspecto | QuechuaGPT-chanka-4B-merged | Qwen3-4B (referencia) | Llama 3.2 3B Instruct (referencia) | Gemma 3 4B (referencia) |
|---|---|---|---|---|
| Parametros | 4,54B | 4,0B (aprox.) | 3,2B | 4,0B (aprox.) |
| Contexto | No disponible | Hasta 128K con YaRN | 128K | 128K |
| Idiomas declarados | Ingles | Multilingue | Multilingue | Multilingue |
| Licencia | Apache 2.0 | Apache 2.0 | Licencia comunitaria Llama | Licencia Gemma |
| Pesos | safetensors | safetensors, GGUF, AWQ, GPTQ | safetensors, GGUF | safetensors, GGUF |
| Benchmarks publicados | Ninguno | Si | Si | Si |
| Adopcion | 0 descargas, 0 likes | Muy alta | Muy alta | Muy alta |

La diferencia practica principal no es de parametros sino de madurez: los tres modelos de referencia cuentan con evaluaciones publicas, plantillas de chat documentadas y ecosistema de cuantizaciones, mientras que este modelo no ofrece nada de ello.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni evaluacion humana, ni comparacion con la base, por lo que se desconoce si el ajuste fino mejoro o degradado el modelo original.
- Model card practicamente vacia: no se documentan datos de entrenamiento, hiperparametros, plantilla de chat ni procedencia del corpus, lo que impide auditar sesgos o contaminacion.
- Riesgo de alucinacion: no medido. En modelos pequenos ajustados con datasets no documentados, el riesgo de fabricacion de hechos es alto, especialmente en dominios especializados.
- Discrepancia entre el nombre y los metadatos: el nombre apunta a quechua, pero el unico idioma declarado es el ingles. Cualquier uso en quechua debe validarse empiricamente antes de darlo por supuesto.
- Cobertura idiomatica limitada: al declararse solo ingles, el comportamiento en castellano, quechua u otros idiomas es desconocido y probablemente deficiente.
- Capacidad multimodal sin verificar: el pipeline image-text-to-text sugiere vision, pero no se documenta ningun componente visual ni su entrenamiento. No asumir que funciona.
- Longitud de contexto desconocida: no se puede planificar un caso de uso con documentos largos sin medir antes el punto de degradacion.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero el usuario debe verificar que la licencia de la base (Thermostatic/rosettia-chanka-4b-alpha160) sea compatible y no imponga restricciones adicionales.
- Modelo sin adopcion: 0 descargas y 0 likes implican ausencia de validacion por terceros, de issues reportados y de soporte comunitario.
- Disponibilidad de cuantizaciones: no hay pesos GGUF ni formatos optimizados publicados, lo que complica el despliegue en CPU o en GPUs de gama baja.
- Fecha de publicacion inusual: los metadatos indican creacion y actualizacion el 18 de septiembre de 2026, dato que conviene comprobar directamente en el repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/makitty/QuechuaGPT-chanka-4B-merged
- Modelo base: https://huggingface.co/Thermostatic/rosettia-chanka-4b-alpha160
- Unsloth (libreria de entrenamiento): https://github.com/unslothai/unsloth
- TRL (libreria de ajuste fino referenciada en los tags): https://github.com/huggingface/trl
- Text Generation Inference: https://github.com/huggingface/text-generation-inference
- Paper, blog o demo oficial del modelo: no disponible
- Resultados de busqueda web relevantes: no disponible (la busqueda no devolvio ningun resultado relacionado con el modelo)
