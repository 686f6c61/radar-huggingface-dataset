# beshkenadze/gliner2.5-multi-onnx

## Resumen

beshkenadze/gliner2.5-multi-onnx es una exportacion a ONNX del modelo fastino/gliner2.5-multi-v1 (GLiNER2, licencia Apache 2.0), pensada para ejecutar extraccion de informacion multilingue directamente en el navegador mediante onnxruntime-web. No es un modelo generativo: es un extractor de entidades y campos guiado por esquema, capaz de convertir documentos en perfiles del tipo `Etiqueta: valor` sin enviar datos a un servidor. La exportacion la firma el usuario beshkenadze y esta asociada al proyecto form-pilot, cuyo objetivo declarado es procesar curriculos y otros documentos integramente on-device.

Tecnicamente, el paquete se divide en dos grafos ONNX. El primero es un encoder mDeBERTa-v3-base con pesos en fp16 (556 MB) que produce un `last_hidden_state` de dimension `[1, seq, 768]` en float32. El segundo es una cabeza de frontera (boundary head) de solo 5 MB que, a partir de los estados de texto y de los estados de las consultas del esquema, devuelve indices de spans a nivel de palabra, una mascara de validez y los logits de emparejamiento. El repositorio completo ocupa 0,6 GB e incluye el tokenizer original con los marcadores de esquema (`[P]`, `[C]`, `[SEP_TEXT]`, `[DESCRIPTION]`) ya registrados.

Su relevancia actual esta en el nicho de la inferencia local en el navegador: permite construir aplicaciones web con extraccion estructurada de campos sin backend, con latencias de aproximadamente 200 ms por fragmento de 300 tokens en GPU WebGPU de la serie M de Apple y de unos 2 s en WASM monohilo. Es una pieza util para desarrolladores que necesitan procesar documentos sensibles en el cliente, aunque con limitaciones operativas claras que se detallan mas abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER2, arquitectura de frontera (boundary architecture); encoder transformer mDeBERTa-v3-base + cabeza de frontera |
| Parametros totales | no disponible en la informacion proporcionada (el encoder es mDeBERTa-v3-base; hidden size 768) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el autor recomienda fragmentos de ~120 palabras y advierte de que el modelo no esta pensado para documentos completos de una vez |
| Tipos de cuantizacion | encoder con pesos en fp16 y salida en float32; no se aplico cuantizacion int8 de forma intencionada porque degradaba la confianza en campos con margen bajo |
| Idiomas soportados | multilingue (segun la model card y los tags del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (dos grafos: `encoder_fp16.onnx` de 556 MB y `head.onnx` de 5 MB), mas `tokenizer.json` y `tokenizer_config.json` de 16 MB |
| Tamano del repositorio | 0,6 GB |
| Libreria | onnx |
| Modelo base | fastino/gliner2.5-multi-v1 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura GLiNER2 del modelo base fastino/gliner2.5-multi-v1, que combina un encoder transformer mDeBERTa-v3-base con una cabeza de frontera. La tarea no es la generacion de texto, sino el emparejamiento entre consultas de esquema (los campos que se quieren extraer) y spans de texto. El flujo descrito en la model card es: codificar token a token la secuencia `( [P] prompt ( [C] campo … ) ) [SEP_TEXT] palabras…`, recoger `last_hidden_state` en la primera subpalabra de cada palabra del texto y en cada marcador `[C]`, ejecutar la cabeza y tomar el argmax sobre `pair_logits` alli donde `valid_mask` esta activado.

No se documenta en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; el modelo base es la referencia para esos detalles y no se incluyen aqui. Lo que si describe el autor es el proceso de exportacion. El encoder se exporto con `torch.onnx.export` (opset 17, exportador legacy) a partir del encoder convertido con `.half()` y con la salida convertida de nuevo a float32; el autor senala que los conversores fp16 a posteriori rompian los nodos `Cast`/`If` de DeBERTa. La cabeza se exporto con `torch.onnx.export(dynamo=True)` sobre `BoundaryHead.forward(..., return_candidates=True)`, devolviendo `candidates.indices`, `valid_mask` y `pair_logits`, con `torch.sort` y `torch.argsort` parcheados para eliminar `stable=True` al no existir funcion ONNX para esa sobrecarga. El resultado se verifico contra PyTorch sobre un curriculo sintetico: los mejores spans coinciden y las probabilidades difieren como maximo en 0,01 en fp16.

## Capacidades

- Extraccion de informacion guiada por esquema: dado un conjunto de etiquetas o campos, devuelve spans de texto a nivel de palabra asociados a cada campo.
- Reconocimiento de entidades nombradas (NER) multilingue en el marco de GLiNER2.
- Extraccion zero-shot mediante prompts de esquema, sin necesidad de reentrenar para cada conjunto de etiquetas.
- Conversion de documentos a perfiles estructurados del tipo `Etiqueta: valor`, que es el caso de uso principal del proyecto form-pilot.
- Inferencia on-device en navegador: encoder sobre WebGPU y cabeza sobre WASM dentro de onnxruntime-web.
- Soporte de tool calling / function calling: no disponible, no es una capacidad de este modelo.
- Soporte de agentes y razonamiento multi-paso: no aplicable, no es un modelo generativo ni de razonamiento.
- Capacidades especiales: no incluye modo de pensamiento, vision ni audio; la unica funcion es la extraccion de spans.

## Casos de uso

- Extraccion de campos de curriculos en el navegador: el modelo fue exportado especificamente para convertir curriculos y otros documentos en perfiles `Etiqueta: valor` on-device, de modo que el usuario puede subir su CV a una web sin que el texto salga de su equipo.
- Cumplimiento estricto de privacidad y RGPD: al ejecutarse con onnxruntime-web, los datos personales no se transmiten a ningun servidor, lo que simplifica el tratamiento de datos sensibles en aplicaciones de seleccion de personal, sanidad o legal.
- Enriquecimiento de formularios web: una extension o SPA puede autocompletar campos a partir de un documento adjunto, usando el encoder sobre WebGPU y la cabeza sobre WASM.
- Procesamiento por lotes de facturas y contratos: fragmentando el texto en trozos de ~120 palabras, el modelo permite extraer importes, fechas, partes y clausulas en un pipeline local sin coste de API.
- Anonimizacion previa a analitica: deteccion de entidades (nombres, organizaciones, ubicaciones) antes de reenviar un texto a un servicio externo, reduciendo la exposicion de datos identificativos.
- Extensiones de navegador y herramientas de escritorio basadas en ONNX Runtime: cualquier entorno que pueda cargar onnxruntime-web reutiliza los mismos dos grafos sin conversiones adicionales.
- Investigacion con corpus multilingues en maquinas sin GPU dedicada: el modo WASM monohilo (unos 2 s por fragmento de 300 tokens) permite ejecutar extraccion en equipos modestos, aceptando mayor latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica cifra de rendimiento proporcionada es operativa, no de calidad de extraccion:

| Medicion | Valor |
|---|---|
| Latencia del encoder en WebGPU (Apple M-series) | ~200 ms por fragmento de 300 tokens |
| Latencia del encoder en WASM monohilo | ~2 s por fragmento de 300 tokens |
| Verificacion frente a PyTorch (curriculo sintetico) | Mejores spans identicos; probabilidades con diferencia maxima de 0,01 en fp16 |
| Precision de extraccion (F1, recall, etc.) | no disponible |

## Requisitos de hardware

- VRAM estimada: no aplica en el escenario de navegador, pero el encoder requiere cargar 556 MB de pesos fp16 en memoria y la cabeza 5 MB; en total en torno a 0,6 GB de peso en disco y una huella de memoria del mismo orden durante la inferencia.
- GPU recomendadas: no hay una lista publicada; el rendimiento medido corresponde a GPU de la serie M de Apple mediante WebGPU. Cualquier GPU con soporte WebGPU en el navegador deberia poder ejecutar el encoder.
- Compatibilidad con GPU de consumo: el diseno esta orientado a ejecucion cliente, por lo que cabe en equipos de consumo, incluidos portatiles sin GPU dedicada mediante el backend WASM.
- Opciones de despliegue: onnxruntime-web (WebGPU para el encoder, WASM para la cabeza) es la ruta documentada. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un extractor ONNX de este tipo.
- Restriccion importante: la cabeza devuelve resultados incorrectos en el execution provider WebGPU de onnxruntime-web en las versiones 1.22 a 1.30; debe ejecutarse en WASM.
- Latencia y throughput: ~200 ms por fragmento de 300 tokens en WebGPU (serie M de Apple) y ~2 s por fragmento de 300 tokens en WASM monohilo. No se publican cifras de throughput agregado.

## Comparativa con modelos similares

| Modelo | Formato | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| beshkenadze/gliner2.5-multi-onnx | ONNX (2 grafos, fp16) | GLiNER2 + mDeBERTa-v3-base | no disponible; fragmentos de ~120 palabras recomendados | Apache 2.0 | HuggingFace, orientado a onnxruntime-web |
| fastino/gliner2.5-multi-v1 | PyTorch | GLiNER2 + mDeBERTa-v3-base | no disponible en la informacion proporcionada | Apache 2.0 | HuggingFace (modelo base del anterior) |
| Otras alternativas de extraccion (spaCy NER, GLiNER clasico, LLM con function calling) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion relevante disponible es la del propio modelo con su base: el export ONNX conserva la arquitectura y los pesos del modelo original (verificado con diferencias de probabilidad de hasta 0,01 en fp16), anade la division en dos grafos para poder ejecutarse en navegador y renuncia a la cuantizacion int8. No se dispone de datos comparativos de rendimiento frente a otras librerias de extraccion.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, no razona en varios pasos y no soporta tool calling; cualquier expectativa de tipo chatbot queda fuera de su alcance.
- Alcance de documento limitado: el propio autor advierte de que la arquitectura de frontera no esta pensada para documentos completos; hay que fragmentar en trozos de ~120 palabras.
- Limitacion de la cabeza en WebGPU: entre las versiones 1.22 y 1.30 de onnxruntime-web, el execution provider WebGPU devuelve resultados incorrectos para la cabeza; es obligatorio usar WASM para ese grafo.
- Confianza en campos de margen bajo: se descarto la cuantizacion int8 dinamica porque reducia las confianzas en campos con poco margen, lo que indica sensibilidad a la precision numerica.
- Idiomas: la etiqueta es multilingue, pero no se detalla la cobertura por idioma ni la calidad relativa entre ellos.
- Sesgos: no se documenta ninguna evaluacion de sesgos en la informacion disponible.
- Riesgo de alucinacion: al no generar texto, el riesgo no es de invencion libre, pero si de asignar spans incorrectos o de devolver candidatos espurios cuando el esquema no encaja con el documento.
- Licencia: Apache 2.0, permisiva para uso comercial; conviene conservar los avisos de licencia y verificar la licencia del modelo base, que es la misma.
- Madurez: el repositorio no tiene descargas ni likes en el momento de la consulta y el proyecto depende de codigo auxiliar externo (packages/extract de form-pilot) para el preprocesado y el postprocesado, por lo que no es un paquete autonomo listo para produccion sin ese codigo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/beshkenadze/gliner2.5-multi-onnx
- Modelo base: https://huggingface.co/fastino/gliner2.5-multi-v1
- Repositorio form-pilot: https://github.com/beshkenadze/form-pilot
- Codigo de extraccion (SchemaTransformer y utilidades): https://github.com/beshkenadze/form-pilot/tree/main/packages/extract
- Resultados de busqueda web: no se han encontrado enlaces relevantes en la busqueda proporcionada.
