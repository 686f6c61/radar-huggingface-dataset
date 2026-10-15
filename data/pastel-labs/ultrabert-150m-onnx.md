# pastel-labs/UltraBERT-150M-ONNX

## Resumen

UltraBERT-150M-ONNX es una conversion a formato ONNX del modelo dmis-lab/UltraBERT-150M, un encoder tipo transformer con cabeza de masked language modeling (fill-mask) entrenado unicamente en ingles. La conversion la firma pastel-labs, que no entrena nada ni modifica los pesos: solo exporta el grafo original de PyTorch para que funcione sobre ONNX Runtime y, sobre todo, para poder ejecutarse en el navegador y en Node mediante Transformers.js. Los pesos son los de dmis-lab y se distribuyen bajo la misma licencia Apache-2.0 del original.

El modelo tiene unos 150 millones de parametros, con un espacio de representacion de 768 dimensiones y un vocabulario de 49.152 tokens. La arquitectura combina capas de atencion local con ventana deslizante de 128 tokens y capas de atencion completa, lo que permite procesar secuencias largas (la verificacion incluye fragmentos de libros de hasta 8.000 tokens) con un coste controlado. No es un modelo generativo: su tarea es predecir tokens enmascarados y producir representaciones contextuales de tokens.

Su relevancia ahora es practica: lleva un modelo de lenguaje enmascarado de calidad a entornos JavaScript sin backend Python, con dos variantes de precision validadas numericamente contra el modelo PyTorch original. Es util para quien quiera embeddings contextuales o relleno de huecos en aplicaciones web, extensiones o herramientas Node sin montar un servidor de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer con atencion local de ventana deslizante (128 tokens) y capas de atencion completa; no es ModernBERT pese a poder envolverse con esa clase |
| Parametros totales | Aproximadamente 150 millones (segun nombre del modelo base) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible de forma explicita; la grafica admite longitud de secuencia dinamica y la verificacion cubre textos de 2.000 a 8.000 tokens |
| Tipos de cuantizacion | fp32 y fp16 (no se publica variante de 4 bits por perdida de fidelidad) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (model.onnx y model_fp16.onnx), exportados con TorchScript, opset 17 |
| Dimension oculta | 768 |
| Tamano de vocabulario | 49.152 tokens |
| Entradas | input_ids y attention_mask (batch y secuencia dinamicos) |
| Salidas | last_hidden_state ([batch, tokens, 768]) y logits de la cabeza MLM ([batch, tokens, 49152]) |
| Libreria | transformers.js (v3) |
| Tamano del repositorio | 1,1 GB |

## Arquitectura y entrenamiento

El modelo original es un encoder de la familia de los transformers con cabeza de masked language modeling. El detalle arquitectonico relevante es la mezcla de atencion local y global: determinadas capas usan una ventana deslizante de 128 tokens y otras aplican atencion completa. Esta combinacion, heredada de los encoders de ultima generacion orientados a contexto largo, se construye dentro del grafo ONNX a partir de la attention mask, de modo que el padding y cualquier longitud de entrada se gestionan sin intervencion externa. La exportacion se hizo con el exportador TorchScript de PyTorch sobre `modeling_ultrabert.py` en modo eager attention, con opset 17.

sobre el entrenamiento no hay datos en la informacion disponible: no se detalla el numero de tokens, la composicion del corpus ni si hubo fases de ajuste como RLHF o DPO. Al tratarse de un modelo enmascarado (no generativo), lo esperable es un preentrenamiento auto-supervisado con enmascaramiento de tokens, pero esto no se confirma en la informacion proporcionada. La innovacion de esta ficha concreta no esta en el modelo sino en la exportacion: para fp16 se mantienen las operaciones RMSNorm y softmax en fp32 para evitar desbordamiento, mientras que las multiplicaciones de matrices corren en fp16. Ademas se descarto publicar una variante de 4 bits porque la cuantizacion weight-only con MatMulNBits (block size 32) bajaba la similitud coseno minima a 0,922 y rompia la coincidencia de predicciones del MLM; las variantes asimetrica, HQQ y block-16 tampoco alcanzaron el umbral de 0,99.

## Capacidades

- Relleno de mascaras (fill-mask): predice el token mas probable en una posicion enmascarada, con salida de logits sobre un vocabulario de 49.152 tokens.
- Generacion de representaciones contextuales: `last_hidden_state` devuelve un vector de 768 dimensiones por token, util para clasificacion, similitud o recuperacion.
- Procesamiento de secuencias largas: soporta entradas de hasta varios miles de tokens gracias a las capas de atencion global combinadas con ventana deslizante de 128 tokens.
- Batch y longitud dinamicos: el grafo acepta lotes y secuencias de tamano variable sin reexportar.
- Ejecucion en JavaScript: funciona en Node y en navegador a traves de Transformers.js 3, sin dependencia de Python en tiempo de inferencia.
- Coincidencia con el modelo original: la tokenizacion en JavaScript reproduce los mismos ids que el tokenizador Python y los vectores de ONNX Runtime (coseno superior a 0,999).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento: es un encoder de relleno de huecos, no un generador de instrucciones.
- Capacidad multilingue: no, el modelo es exclusivamente en ingles.

## Casos de uso

- Autocompletado y relleno de huecos en aplicaciones web: el modelo se ejecuta en el navegador via Transformers.js, de modo que un editor de texto o un formulario puede sugerir la palabra enmascarada sin enviar el texto a un servidor ni asumir costes de API.
- Busqueda semantica ligera en el cliente: usando `last_hidden_state` se pueden calcular embeddings por token o por secuencia y comparar similitudes sobre textos en ingles dentro de una extension o PWA.
- Clasificacion de texto en el navegador: con el encoder como base y una cabeza simple encima, se puede etiquetar sentimiento, intencion o categoria en formularios y encuestas sin backend.
- Preprocesado y normalizacion de datos en pipelines Node: integrar el modelo en un script de Node para detectar tokens improbables o enmascarados en campos de texto extraidos de logs o bases de datos, todo en el mismo runtime que el resto del pipeline.
- Prototipado rapido de NLP en entornos sin Python: equipos de frontend o herramientas internas en JavaScript pueden experimentar con un encoder de 150 M sin montar un servicio de inferencia.
- Verificacion y comparacion de conversiones ONNX: dado que la model card documenta coseno minimo, coseno medio y coincidencia top-1, sirve como referencia para validar otras exportaciones de encoders similares.
- Analisis de fragmentos largos (documentos, capitulos): la mezcla de atencion local y global permite procesar textos de varios miles de tokens y obtener representaciones contextuales de cada posicion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para MMLU, HumanEval, GSM8K ni metricas de tarea equivalentes. La unica evaluacion publicada es de fidelidad de la conversion, comparando el modelo PyTorch original con cada archivo ONNX sobre 20 textos en ingles (15 cortos de 3 a 25 tokens y 5 extractos largos de 2.000 a 8.000 tokens):

| Precision | Archivo | Tamano | Coseno minimo | Coseno medio | Coincidencia top-1 |
|---|---|---|---|---|---|
| fp32 | onnx/model.onnx | 760 MB | 1,0000 | 1,00000 | 100,0% |
| fp16 | onnx/model_fp16.onnx | 381 MB | 1,0000 | 1,00000 | 99,1% |

La coincidencia top-1 mide con que frecuencia el token de mayor puntuacion en cada posicion coincide con el de PyTorch. El umbral de aceptacion fijado por el autor era un coseno minimo de al menos 0,99 en cada texto; ambas variantes lo superan.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,8 GB para fp32 (archivo de 760 MB) y 0,4 GB para fp16 (archivo de 381 MB), mas el overhead de runtime y las activaciones.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente. No se necesita A100, H100 ni RTX 4090; tarjetas de gama media y baja bastan.
- Consumer GPU: si, cabe holgadamente en cualquier GPU de consumo moderna e incluso en iGPU. Tambien se puede ejecutar en CPU, ya que el modelo es pequeno y la exportacion esta pensada para ONNX Runtime.
- Opciones de despliegue: ONNX Runtime (Python), Transformers.js 3 (Node y navegador). No es un modelo para vLLM ni TGI en el sentido generativo habitual, dado que solo hace fill-mask.
- Nota sobre el pipeline `fill-mask`: la clase `AutoModelForMaskedLM` y el pipeline `fill-mask` de Transformers.js rechazan el tipo `ultrabert`; hay que usar `AutoModel` (que avisa "Unknown model class" y cae a la clase base) o envolver la sesion con `ModernBertForMaskedLM.from_pretrained(...)`, que carga el grafo y devuelve los logits.
- Latencia y throughput: no disponible. No se publican cifras de latencia ni de tokens por segundo en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de resultados de tarea para UltraBERT-150M, por lo que la comparacion se limita a caracteristicas estructurales. Los datos de los modelos alternativos que figuran a continuacion no proceden de la informacion proporcionada y se marcan como no disponibles cuando no se pueden confirmar.

| Modelo | Parametros | Contexto | Licencia | Formato ONNX | Idiomas |
|---|---|---|---|---|---|
| UltraBERT-150M-ONNX | ~150 M | no disponible (soporta varios miles de tokens) | Apache-2.0 | si (fp32, fp16) | ingles |
| ModernBERT-base | no disponible | no disponible | no disponible | no disponible | no disponible |
| BERT-base-uncased | no disponible | no disponible | no disponible | no disponible | no disponible |
| RoBERTa-base | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion con benchmarks de tarea no es posible con los datos disponibles.

## Limitaciones y advertencias

- Solo ingles: el modelo no es multilingue y ofrecera resultados degradados en castellano o cualquier otro idioma.
- No es generativo: no sirve para chat, instrucciones, tool calling ni tareas de razonamiento multi-paso. Solo realiza relleno de mascaras y produce representaciones.
- Riesgo de alucinacion intrinseco al MLM: puede predecir tokens plausibles pero incorrectos. Sus logits no deben usarse como fuente de verdad factual.
- Sesgos: no hay informacion sobre la composicion del dataset de entrenamiento ni sobre sesgos conocidos. Al ser un encoder entrenado en ingles sin datos declarados, es razonable esperar sesgos presentes en el corpus original, pero no se documentan.
- Contexto maximo no declarado: aunque la verificacion cubre hasta 8.000 tokens, no se especifica cual es el limite superior soportado. Para secuencias muy largas conviene medir antes de asumir que funciona.
- Integracion fragil con Transformers.js: el pipeline `fill-mask` y `AutoModelForMaskedLM` no aceptan el tipo `ultrabert`; hay que usar `AutoModel` o envolver la sesion en `ModernBertForMaskedLM`. Usar esta ultima clase no implica que el modelo sea ModernBERT, solo actua como envoltorio de la sesion.
- Cuantizacion limitada: no hay variante de 4 bits fiable. Las pruebas con MatMulNBits (block 32), HQQ, asimetrica y block-16 no superaron el coseno minimo de 0,99; la opcion de 4 bits probada bajo a 0,922 y perdio la coincidencia de predicciones MLM. Si se necesita menor huella de memoria, fp16 es el limite validado.
- Licencia: Apache-2.0 permite uso comercial, pero conviene conservar los avisos de atribucion. El autor indica que el repositorio original no incluye archivo NOTICE y que el texto de la licencia Apache-2.0 esta en `LICENSE`.
- Adopcion muy baja: 1 descarga y 0 me gusta en el momento de la consulta, lo que implica poca validacion por parte de la comunidad fuera de las pruebas del propio autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pastel-labs/UltraBERT-150M-ONNX
- Modelo base: https://huggingface.co/dmis-lab/UltraBERT-150M
- La busqueda web no ha devuelto resultados relevantes sobre el modelo: los enlaces encontrados corresponden a servicios de estudios en Francia y a articulos sobre el color pastel, sin relacion con este proyecto. No se han localizado papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.
