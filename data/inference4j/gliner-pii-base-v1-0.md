# inference4j/gliner-pii-base-v1.0

## Resumen

gliner-pii-base-v1.0 (ONNX) es un espejo en formato ONNX del modelo `knowledgator/gliner-pii-base-v1.0`, un modelo GLiNER especializado en la deteccion zero-shot de informacion personal identificable (PII). Lo publica el proyecto inference4j, una libreria de inferencia para Java, con el objetivo de ofrecer una version lista para ejecutar con ONNX Runtime sin depender de PyTorch. La tarea es token-classification con etiquetas definidas en tiempo de inferencia: el usuario pasa una lista de tipos de entidad ("person", "organization", "invoice id"...) y el modelo localiza los spans correspondientes, sin reentrenamiento.

Tecnicamente no es un modelo generativo, sino un codificador bidireccional tipo transformer con cabeza de clasificacion de spans (arquitectura GLiNER), exportado a ONNX en FP32. El repositorio ocupa 0,7 GB, lo que situa el modelo en el rango de cientos de millones de parametros (no se publica el recuento exacto en la model card). La entrada admite hasta 2048 palabras con spans de hasta 12 palabras, lo que permite procesar documentos completos, contratos o tickets en una sola pasada.

Su relevancia practica esta en el filtrado y anonimizacion de datos personales antes de enviar texto a servicios de terceros o de almacenarlo: al ser zero-shot, se pueden anadir nuevas categorias de PII cambiando la lista de etiquetas, sin reentrenar, y al ser ONNX se integra en stacks JVM con latencias de CPU razonables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER: codificador transformer bidireccional con representacion de entidades basada en spans (span mode `markerV0`) |
| Parametros totales | no disponible en la model card; el repo ONNX FP32 ocupa 0,7 GB (equivalente aproximado a ~175 M parametros si todo el peso fuese FP32) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | hasta 2048 palabras de texto de entrada; ancho maximo de span de 12 palabras |
| Tipos de cuantizacion | solo FP32 en este repositorio; no se documentan variantes INT8, FP16 ni GGUF |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`library_name: onnx`), salida `logits` float32 de forma `[batch, words, max_width, labels]` |

Detalles del contrato de entrada recogidos en la model card:

| Elemento | Valor |
|---|---|
| Entradas | cinco tensores int64 mas una mascara `span_mask` booleana |
| Tokens de prompt | `<<ENT>>`, `<<SEP>>` |
| Segmentacion | por espacios en blanco (whitespace) |
| Pooling de subtokens | primer subtoken |
| Decodificacion | aplicar sigmoid sobre los logits |
| Revision de origen | `61726e0ad791dcab3e29339bbec3ad42ded65641` |

## Arquitectura y entrenamiento

GLiNER (Generalist and Lightweight model for Named Entity Recognition) sustituye el paradigma clasico de NER con un conjunto fijo de etiquetas por un esquema en el que las etiquetas se codifican como embeddings de tipo entidad y se comparan contra representaciones de spans del texto. El codificador procesa conjuntamente el texto y los tokens de entidad (`<<ENT>>`), y la cabeza de prediccion puntua, para cada posicion de palabra y cada ancho de span hasta 12 palabras, la compatibilidad con cada etiqueta solicitada. Este repositorio es la exportacion ONNX en FP32 de esa arquitectura, con segmentacion por espacios y pooling del primer subtoken, decisiones que fijan el comportamiento reproducible respecto al modelo original.

La model card no detalla la composicion del dataset de entrenamiento, el numero de tokens vistos, ni si se aplicaron fases de ajuste como RLHF o DPO (tecnicas, por otra parte, propias de modelos generativos y no de un encoder de NER). Tampoco se documentan innovaciones adicionales mas alla del propio enfoque zero-shot. El autor indica que se trata de un espejo de `knowledgator/gliner-pii-base-v1.0`, por lo que los detalles de entrenamiento deben consultarse en el repositorio original.

## Capacidades

- Reconocimiento de entidades zero-shot: acepta etiquetas arbitrarias en tiempo de inferencia sin reentrenamiento.
- Deteccion de PII: orientado a categorias como persona, organizacion, direccion, identificadores fiscales o numeros de factura.
- Procesamiento de documentos largos: hasta 2048 palabras por pasada.
- Extraccion de spans de hasta 12 palabras, adecuada para nombres compuestos, direcciones postales y razones sociales.
- Salida a nivel de palabra con logits por etiqueta, lo que permite fijar umbrales de confianza propios.
- Inferencia solo (inference-only): no genera texto, solo etiqueta spans.
- Integracion nativa con Java mediante `GlinerEntityRecognizer` de inference4j.
- Ejecucion sobre ONNX Runtime, con posibilidad de CPU o GPU segun el proveedor de ejecucion configurado.
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades de vision o audio.

## Casos de uso

- Anonimizacion previa a LLM de terceros: se pasa el texto del usuario por el modelo con etiquetas de PII y se enmascaran los spans detectados antes de enviarlo a una API externa, evitando fugas de datos personales.
- Cumplimiento de RGPD en pipelines de datos: clasificacion de documentos internos para localizar nombres, correos, telefonos y direcciones, generando un inventario de datos personales por sistema.
- Redaccion de expedientes y soporte: en un contact center, el modelo marca la PII en transcripciones o correos antes de almacenarlos o de alimentar analitica, con la ventaja de poder anadir nuevas etiquetas cuando aparece un campo no previsto.
- Procesamiento de facturas y documentos financieros: extraccion de identificadores como "invoice id", "CIF" o "IBAN" definidos como etiquetas en la llamada, sin entrenar un modelo especifico por cliente.
- Enmascarado en logs de aplicacion: filtrado en tiempo de escritura de nombres de usuario y direcciones IP o correos embebidos en trazas, ejecutando el modelo ONNX en el propio servicio.
- Preprocesado para entrenamiento de modelos: limpieza de corpus antes de fine-tuning para reducir memorizacion de datos personales en modelos posteriores.
- Integracion en backend Java empresarial: despliegue como paso de un pipeline JVM existente usando inference4j sobre ONNX Runtime, sin introducir Python en produccion.
- Deteccion de datos sensibles en correo entrante: clasificacion de mensajes para enrutarlos a un flujo seguro cuando contienen identificadores personales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del espejo ONNX no incluye metricas de precision, recall o F1 sobre conjuntos como CoNLL, PII benchmarks o MMLU/HumanEval (estos ultimos no aplican a un modelo de NER). Tampoco se aportan datos de latencia o throughput. Cualquier cifra de rendimiento debe obtenerse de la documentacion del modelo original de Knowledgator.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 0,7 GB para los pesos FP32, mas overhead de activaciones y del runtime; un entorno con 2 GB de memoria disponible es suficiente en la mayoria de casos.
- GPU: no es necesaria. Cabe holgadamente en tarjetas consumer como GTX 1650, RTX 3060 o RTX 4090, y tambien en GPU de datacenter (A100, H100) si se comparte infraestructura, aunque el modelo no las aprovecha.
- CPU: viable para produccion a baja o media escala con ONNX Runtime; al ser un encoder de ~175 M parametros (estimacion por tamano), el coste por documento de 2048 palabras es bajo.
- Despliegue: ONNX Runtime (Java via inference4j, Python via `onnxruntime`), servidores de inferencia compatibles con ONNX (por ejemplo Triton u ONNX Runtime Server). No se distribuye en GGUF, por lo que llama.cpp y Ollama no son opciones directas sin conversion. vLLM y TGI no aplican: no es un modelo generativo.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware, del numero de etiquetas y de la longitud del texto (el coste de la cabeza crece con palabras x ancho de span x numero de etiquetas).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| inference4j/gliner-pii-base-v1.0 | no disponible (~175 M estimados por tamano del repo) | 2048 palabras, span de 12 | ONNX FP32 | Apache 2.0 | Espejo solo-inferencia, pensado para Java |
| knowledgator/gliner-pii-base-v1.0 | no disponible | 2048 palabras (mismo modelo) | PyTorch (safetensors/bin) | Apache 2.0 | Modelo original; mismos pesos, requiere stack Python |
| urchade/gliner_multi-v2.1 | no disponible | no disponible | PyTorch | Apache 2.0 | GLiNER multilingue generalista; no especializado en PII |
| NER basado en reglas o spaCy (p. ej. Presidio) | no aplica / decenas de millones | no aplica | varios | segun componente | Etiquetas fijas, requiere patrones o reentrenamiento para nuevas categorias; menor coste computacional |

La comparacion cuantitativa de precision con estas alternativas no esta disponible: no se han publicado metricas en la informacion proporcionada para este espejo.

## Limitaciones y advertencias

- No se documentan sesgos conocidos ni evaluaciones de equidad; el comportamiento sobre nombres no occidentales, transliteraciones o variantes regionales es desconocido.
- Riesgo de falsos negativos en PII: al ser un modelo estadistico, puede omitir identificadores poco frecuentes o con formatos atipicos; en un contexto de cumplimiento normativo debe combinarse con reglas y revision humana.
- Riesgo de falsos positivos: entidades genericas como "person" pueden marcar palabras comunes, especialmente con umbrales de sigmoid bajos.
- Segmentacion por espacios en blanco: el modelo no aplica un tokenizador subword para delimitar palabras, lo que puede degradar el rendimiento en idiomas sin espacios (chino, japones) o con puntuacion adherida.
- Limite de 2048 palabras por pasada y spans de 12 palabras: entidades mas largas (clausulas, direcciones muy extensas) quedan fuera del alcance.
- Idiomas soportados no disponibles: no hay declaracion explicita de cobertura multilingue; conviene validar con datos propios antes de asumir espanol.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion y manteniendo el aviso de licencia; no hay clausulas de uso restringido, pero el usuario asume la responsabilidad sobre el tratamiento de datos personales.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de adopcion ni deValidacion por terceros; la fecha de creacion indicada (2026-10-19) es posterior a la del modelo original, lo que refuerza su caracter de espejo.
- Al ser un modelo solo de inferencia, no admite ajuste fino dentro de este repositorio ONNX; para reentrenar hay que partir del modelo original en PyTorch.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/inference4j/gliner-pii-base-v1.0
- Modelo original: https://huggingface.co/knowledgator/gliner-pii-base-v1.0
- Libreria inference4j: https://github.com/inference4j/inference4j
- Paper de GLiNER (Zaratiana et al.): no disponible en la informacion proporcionada
- Blog o demo del autor: no disponible en la informacion proporcionada

Nota: la busqueda web realizada no devolvio resultados tecnicos relevantes sobre este modelo (unicamente listados sin relacion con el contenido), por lo que no se incluyen enlaces adicionales.
