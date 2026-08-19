# ivere27/tiny-receipt-vqa-structured-qa-21m

## Resumen

TinyReceiptVQA-StructuredQA-22M-BPE1536-DirectNoValue-LoRA-Router-e100 es un modelo compacto de visual question answering (VQA) especializado en el dominio de recibos, desarrollado por el usuario ivere27. El modelo toma una imagen completa de un recibo y una pregunta en lenguaje natural, y genera un razonamiento estructurado junto con una respuesta final en una etiqueta `<answer>`. Su principal innovación es un router aprendido que selecciona automáticamente una de ocho familias de preguntas (teléfono, dirección, tienda, fila de artículo, matemáticas de artículo, lookup de artículo, matemáticas generales u otras), y cada familia dispone de adaptadores de memoria post-encoder y post-decoder específicos.

El modelo está diseñado para ejecutarse con ONNX Runtime, con un tamaño total de aproximadamente 22 millones de parámetros y un repositorio de solo 0.1 GB. Incluye versiones FP32 e INT8 (W8A8 estático) con KV caching, lo que permite una inferencia eficiente incluso en CPU. Está entrenado para inglés y coreano, y su tokenizador utiliza un esquema Byte-Fallback BPE con exactamente 1.536 tokens, garantizando que cualquier entrada Unicode pueda representarse sin tokens desconocidos. Su relevancia radica en ser una solución ligera y desplegable en entornos de producción con recursos limitados, orientada a la extracción de información clave (KIE) de recibos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder Transformer con router aprendido (8 familias) y adaptadores LoRA por familia |
| Parametros totales | 22 millones (segun el nombre del modelo; el ID del repo indica 21m) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (las dimensiones de pregunta y memoria son dinamicas en el grafo ONNX) |
| Tipos de cuantizacion | FP32, INT8 (W8A8 estatico QDQ) |
| Idiomas soportados | Ingles (en), Coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (encoder_model.onnx, decoder_model.onnx, encoder_model_int8.onnx, decoder_model_int8.onnx) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura encoder-decoder Transformer implementada como cuatro grafos ONNX separados (encoder FP32, decoder FP32, encoder INT8, decoder INT8). El encoder procesa la imagen (entrada fija de `[batch, 1, 320, 672]` normalizada) y la secuencia de tokens de la pregunta, y emite una representacion de memoria, una mascara de padding, logits del router, la familia seleccionada y las claves/valores de cross-attention por capa. El decoder consume un token a la vez, utilizando KV caching para la atencion propia y las claves/valores de cross-atencion del encoder. El router aprendido selecciona una de ocho familias, y cada familia activa adaptadores LoRA especificos en memoria y en el decoder.

El tokenizador es un Byte-Fallback BPE con 1.536 tokens, que incluye 4 tokens especiales, 8 etiquetas atomicas estructuradas, 10 digitos atomicos, 256 bytes UTF-8, 741 caracteres Unicode aprendidos y 517 merges BPE. Las etiquetas y digitos no participan en merges, y el espacio es un limite de merge duro. El esquema de objetivo es `direct_answer_no_value_v1`, que omite la etiqueta `<value>` cuando esta duplicaria la respuesta. El entrenamiento se realizo con BF16 autocast en GPU (el nombre sugiere 100 epocas, "e100"), aunque los tensores guardados y los grafos ONNX son FP32. No se especifica el numero de tokens de entrenamiento ni la composicion del dataset, solo que los registros de entrenamiento se usaron para aprender el alfabeto y los merges del tokenizador.

## Capacidades

- Generacion de respuestas estructuradas a preguntas sobre recibos, con razonamiento intermedio y etiqueta final `<answer>`.
- Extraccion de informacion clave (KIE) en dominios especificos: telefonos, direcciones, nombres de tienda, filas de articulos, operaciones matematicas sobre articulos y lookups.
- Router aprendido que clasifica automaticamente la pregunta en una de ocho familias: `phone`, `address`, `store`, `item-row`, `item-math`, `item-lookup`, `math` u `other`.
- Soporte multilingue para ingles y coreano, con tokenizador Byte-Fallback BPE que garantiza representabilidad de cualquier entrada Unicode sin tokens `<unk>`.
- Inferencia eficiente mediante KV caching en encoder y decoder, con soporte para precision FP32 e INT8 (W8A8 estatico).
- Interfaz de ejecucion flexible: permite seleccionar familia explicita (`--family phone`) o automatica (`--family auto`) para depuracion controlada.
- Generacion greedy con validacion de formato: el resultado JSON incluye un campo `well_formed` que indica si la generacion contiene un bloque `<answer>...</answer>` completo.

## Casos de uso

- Automatizacion de gastos de empresa: el modelo puede procesar fotografias de recibos y extraer automaticamente el total, la direccion o el telefono de la tienda, integrandose en flujos de contabilidad para reducir la entrada manual de datos.
- Integracion en sistemas ERP: gracias a su formato ONNX y su tamano reducido (22M), puede desplegarse en servidores CPU de bajo coste para clasificar y extraer datos de recibos en tiempo real dentro de pipelines de facturacion.
- Asistentes personales de finanzas: una aplicacion movil puede usar el modelo para responder preguntas del usuario sobre sus recibos, como "cuanto gaste en este establecimiento" o "cual es el numero de telefono de la tienda", con respuestas estructuradas y fiables.
- Verificacion de recibos en comercios: el modelo puede validar que los datos extraidos de un recibo coinciden con los registros de venta, detectando discrepancias en importes o articulos mediante las familias `item-math` e `item-lookup`.
- Analisis de gastos para aplicaciones de banca: las entidades financieras pueden integrar el modelo para categorizar transacciones a partir de imagenes de recibos, extrayendo el comercio, la fecha y el importe total con un esquema de salida predecible.
- Reclamaciones de garantia o devoluciones: el modelo puede extraer el nombre de la tienda, la direccion y los articulos comprados de un recibo, facilitando la generacion automatica de formularios de reclamacion en portales de atencion al cliente.

## Benchmarks y rendimiento

No se han publicado los valores numericos de los benchmarks en la informacion disponible. El repositorio incluye archivos de evaluacion en el directorio `eval/` (como `heldout_summary.json`, `int8_w8a8_summary.json`, `fp32_int8_heldout_summary.json` y `comparison.json`), asi como benchmarks de runtime en CPU (`runtime_benchmark_fp32_cpu.json` y `runtime_benchmark_int8_cpu.json`), pero sus contenidos no se detallan en la model card. No se proporcionan comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 22M, la VRAM necesaria es minima; en FP32 cabria en menos de 100 MB, y en INT8 alrededor de 50 MB, por lo que puede ejecutarse en cualquier GPU moderna o incluso en CPU.
- GPU recomendadas: no requiere GPU; esta optimizado para CPU mediante ONNX Runtime, como indican los benchmarks de runtime en CPU incluidos en el repositorio.
- Compatibilidad con GPU de consumo: si, cualquier GPU con al menos 1 GB de VRAM puede ejecutarlo sin problemas, aunque no es necesario.
- Opciones de despliegue: ONNX Runtime (gracias a los grafos ONNX incluidos), con soporte para precision FP32 e INT8. No se mencionan integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no se proporcionan valores concretos en la informacion disponible, pero los archivos de benchmark en CPU sugieren que el modelo esta disenado para inferencia de baja latencia en entornos sin GPU.

## Comparativa con modelos similares

No disponible. No se proporcionan datos de modelos comparables en la informacion suministrada, y no se pueden citar alternativas sin inventar datos.

## Limitaciones y advertencias

- Dominio restringido: el modelo esta especializado exclusivamente en recibos; su rendimiento fuera de este dominio probablemente sea pobre.
- Idiomas limitados: solo soporta ingles y coreano; otros idiomas pueden fallar en el reconocimiento de caracteres, aunque el tokenizador garantiza representabilidad Unicode.
- Tamano de imagen fijo: la entrada de imagen debe ser de 320x672 píxeles en escala de grises; imagenes con otras dimensiones requieren redimensionamiento previo, lo que puede afectar a la calidad del OCR.
- Esquema de salida limitado: el esquema `direct_answer_no_value_v1` omite la etiqueta `<value>` en lecturas directas, lo que puede ser confuso para consumidores que esperen una estructura uniforme.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir respuestas incorrectas; el campo `well_formed` solo valida la presencia del bloque `<answer>`, no la exactitud del contenido.
- Vocabulario pequeno (1.536 tokens): puede limitar la representacion de caracteres raros o terminos especificos, aunque el byte fallback evita tokens desconocidos.
- Sin informacion sobre sesgos: no se documentan sesgos conocidos, pero al ser un modelo entrenado en un dominio especifico, podria reflejar sesgos presentes en los recibos sinteticos utilizados para el entrenamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ivere27/tiny-receipt-vqa-structured-qa-21m
