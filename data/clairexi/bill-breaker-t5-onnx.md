# clairexi/bill-breaker-t5-onnx

## Resumen

Bill-breaker-t5-onnx es la versión empaquetada para el navegador del modelo `clairexi/bill-breaker-t5`, un FLAN-T5-base ajustado (fine-tuning) sobre el corpus BillSum para resumir y explicar textos legislativos o facturas en lenguaje llano. El repositorio no contiene pesos en formato PyTorch, sino dos grafos ONNX exportados específicamente para su uso con transformers.js: un encoder en fp16 y un decoder fusionado cuantizado a int8 por canal. El objetivo declarado es ejecutar la inferencia íntegramente en cliente, sin backend, dentro de una aplicación web.

El modelo resuelve un problema acotado: convertir documentos largos y densos (proyectos de ley, condiciones contractuales, desgloses de cargos) en un resumen de un par de cientos de tokens. Al estar construido sobre FLAN-T5-base, hereda la arquitectura encoder-decoder estándar de la familia T5, con un tamaño manejable (del orden de 220 millones de parámetros) que permite su descarga y ejecución en un navegador de escritorio con WebGPU o WASM.

La relevancia práctica es la delgada capa de ingeniería que aporta el autor: el tokenizador está configurado con `add_prefix_space` y `model_max_length: 1024` para que transformers.js produzca exactamente los mismos `input_ids` que la pipeline de Python, y la elección de precisión es deliberada (encoder en fp16 porque el encoder int8 alteraba hechos en los resúmenes, decoder en int8 por canal). Es un modelo de nicho, sin descargas ni validación comunitaria, pensado para un producto concreto más que para uso general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia T5; base FLAN-T5-base) |
| Parametros totales | ~223 M (derivado de FLAN-T5-base; no declarado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens configurados en el tokenizador (`model_max_length`); en la práctica se truncan los primeros 1023 tokens y se añade `</s>` |
| Tipos de cuantizacion | fp16 (encoder, `encoder_model_fp16.onnx`), int8 por canal (decoder, `decoder_model_merged_quantized.onnx`) |
| Idiomas soportados | no disponibles en la model card (el corpus BillSum es legislación de EE. UU. en inglés) |
| Licencia | no disponible |
| Formato de pesos | ONNX (dos grafos: encoder y decoder fusionado); tamaño de repositorio 0,4 GB |
| Libreria / runtime | transformers.js (`@huggingface/transformers`) con `AutoModelForSeq2SeqLM` |
| Pipeline declarada | summarization |
| Tarea de entrenamiento | fine-tuning de FLAN-T5-base sobre BillSum (resumen de proyectos de ley) |

## Arquitectura y entrenamiento

La arquitectura es la de T5: un encoder y un decoder transformer con atención completa, normalización por capas y embeddings relativos de posición, en la variante "base" de FLAN-T5 (aproximadamente 223 millones de parámetros en total). FLAN-T5-base parte de T5 preentrenado y se afina con instrucciones y una mezcla de tareas de FLAN antes de pasar por el ajuste específico. Sobre esa base, `clairexi/bill-breaker-t5` se ha afinado con BillSum, un corpus de proyectos de ley del Congreso de Estados Unidos y de legislaturas estatales emparejados con resúmenes humanos.

La model card no documenta el volumen de tokens de entrenamiento, la composición exacta del dataset, ni si hubo una fase de RLHF o DPO; tampoco se detallan hiperparámetros. La innovación técnica relevante está en el empaquetado, no en el entrenamiento: el autor informa de que cuantizar también el encoder a int8 provocaba que los resúmenes alterasen hechos, por lo que mantiene el encoder en fp16 y aplica cuantización int8 por canal solo al decoder fusionado. Además, la exportación incluye un prompt de instrucción (`"Explain this bill in plain English: "`), tokenización sin special tokens automáticos y truncado manual a 1023 tokens con `</s>` final, que es exactamente el formato visto en entrenamiento.

## Capacidades

- Generación de resúmenes abstractivos de documentos largos con encoder-decoder, hasta 200 tokens nuevos por generación en el ejemplo del autor.
- Simplificación de lenguaje técnico o legal a inglés llano, con el prefijo de instrucción `"Explain this bill in plain English: "`.
- Manejo de entradas de hasta 1024 tokens (truncando el resto), suficiente para facturas y secciones de contratos, no para documentos completos.
- Ejecución en el navegador del cliente mediante transformers.js, sin servidor ni transferencia del documento a terceros.
- Parámetros de decodificación compatibles con `generate`: `max_new_tokens`, `no_repeat_ngram_size` y el resto de opciones estándar de HF.
- No hay evidencia de soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.
- Capacidad multilingüe no documentada; el ajuste se realizó sobre un corpus en inglés.

## Casos de uso

- Explicación de facturas de suministros en el navegador: el usuario arrastra el PDF o pega el desglose de cargos, el modelo devuelve un párrafo en inglés llano explicando cada concepto; al ejecutarse en cliente, los datos de consumo no salen del dispositivo.
- Extensión de navegador para resumir cargos bancarios o recibos: con 0,4 GB de pesos y cuantización int8 en el decoder, el modelo se descarga una vez y queda cacheado, permitiendo resúmenes repetidos sin coste de API.
- Resumen de proyectos de ley y ordenanzas municipales: uso directo del dominio de entrenamiento (BillSum) para portales de transparencia que necesitan un resumen de 150-200 tokens por norma.
- Preprocesado en pipelines de atención al cliente: generar un resumen del caso o del contrato antes de pasarlo a un agente humano, reduciendo el texto a revisar.
- Herramienta interna de legal ops: resumir cláusulas o condiciones de servicio pegadas en un formulario y producir un borrador que un revisor humano valida después.
- Aplicación de finanzas personales offline: procesar el texto de un extracto para señalar los cargos más relevantes, con la ventaja de que no requiere backend ni cumple requisitos de transferencia internacional de datos.
- Demo o prototipo educativo de NLP en el navegador: sirve como ejemplo de exportación ONNX con precisión mixta y de paridad de tokenización entre Python y JavaScript.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas ROUGE, MMLU, HumanEval ni ninguna otra evaluación cuantitativa, ni comparaciones con el modelo base. La única observación empírica del autor es cualitativa: la cuantización int8 del encoder producía resúmenes con hechos alterados, motivo por el que se mantiene en fp16.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en la configuración publicada (encoder fp16 de ~220 M de parámetros más decoder int8). El repositorio completo ocupa 0,4 GB.
- GPU dedicada: no es necesaria. Cualquier GPU de consumo reciente (GTX 1060 en adelante, RTX 2060/3060/4060) ejecuta el modelo con holgura; también es viable en Apple Silicon vía WebGPU.
- CPU: ejecutable con el backend WASM de transformers.js; la latencia será mayor, pero el tamaño del modelo lo hace viable en un portátil convencional.
- Despliegue: transformers.js en navegador (WebGPU o WASM) es el caso de uso previsto. Al ser un export ONNX, también puede servirse con ONNX Runtime (incluido Node.js) o con un servidor compatible con ONNX. No se ha validado su uso con vLLM, TGI o llama.cpp, que no consumen este formato de la misma manera.
- Latencia y throughput: no disponibles. Dependerán del backend (WebGPU frente a WASM), del hardware y de la longitud de la entrada, que puede llegar a 1024 tokens de prompt más 200 de generación.
- Memoria en navegador: hay que sumar los pesos (0,4 GB) y el estado de activaciones; conviene reservar alrededor de 1 GB de memoria del proceso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| clairexi/bill-breaker-t5-onnx | ~223 M | 1024 (configurado) | ONNX fp16 + int8, transformers.js | no disponible | HuggingFace, 0 descargas |
| clairexi/bill-breaker-t5 (modelo base del export) | ~223 M | no disponible en la información | PyTorch (presumiblemente) | no disponible | HuggingFace |
| google/flan-t5-base | ~223 M | 512 tokens nativos | safetensors, transformers | Apache 2.0 (dato general, no verificado en esta búsqueda) | Ampliamente disponible |
| facebook/bart-large-cnn | ~400 M | 1024 | safetensors, transformers | MIT (dato general, no verificado en esta búsqueda) | Ampliamente disponible, con resultados ROUGE publicados |

El modelo solo tiene sentido frente a `google/flan-t5-base` si se necesita ejecución en navegador y un comportamiento ya ajustado a resúmenes de tipo legislativo; en cualquier otro escenario, un modelo genérico con licencia clara y benchmarks publicados es una opción más segura. No se dispone de datos de rendimiento comparativos para affirmar superioridad en calidad de resumen.

## Limitaciones y advertencias

- Licencia no declarada: no hay autorización explícita de uso comercial. Contactar con el autor antes de integrarlo en un producto.
- Sin benchmarks ni validación independiente: 0 descargas y 0 likes en la fecha de consulta; no hay evidencia externa de calidad.
- Riesgo de alucinación relevante en un dominio factual: el propio autor detectó que una cuantización más agresiva cambiaba hechos de los resúmenes, lo que indica sensibilidad del modelo a la precisión numérica y a la cuantización.
- Truncado silencioso: si la entrada supera los 1023 tokens, el código de ejemplo descarta el resto sin avisar; en facturas o leyes largas se perderá información y el resumen puede quedar incompleto o sesgado.
- Dominio estrecho: ajustado sobre BillSum (legislación estadounidense en inglés); su comportamiento en facturas comerciales, contratos españoles o cualquier texto en castellano no está evaluado ni documentado.
- Idiomas no declarados: aunque FLAN-T5-base tiene cierta exposición multilingüe, el ajuste específico es en inglés y no hay garantía de calidad en otros idiomas.
- Sesgos heredados: el corpus BillSum procede de instituciones legislativas de EE. UU., con los sesgos temáticos y de estilo de esa fuente; el modelo puede reproducir formulaciones propias del texto legislativo.
- Longitud de salida acotada: `max_new_tokens: 200` en el ejemplo; resúmenes más largos no están contemplados por el autor.
- Dependencia de la tokenización exacta: el prefijo de instrucción, `add_special_tokens: false` y el `</s>` final son parte del contrato de uso; cambiar el prompt degrada la calidad de forma no medida.
- Un solo mantenedor y un repositorio sin documentación de entrenamiento (tokens, dataset exacto, hiperparámetros), lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/clairexi/bill-breaker-t5-onnx
- Modelo base: https://huggingface.co/clairexi/bill-breaker-t5
- Documentación de transformers.js: https://huggingface.co/docs/transformers.js
- Los resultados de la búsqueda web proporcionada no contienen enlaces relevantes para este modelo (son foros y páginas de soporte sin relación); no se han podido verificar papers, blogs ni demos adicionales.
