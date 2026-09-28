# fgeeha/siglip2-wine

## Resumen

siglip2-wine es un ajuste fino de google/siglip2-so400m-patch16-384, el encoder visión-lenguaje SigLIP 2 de Google en su variante shape-optimized de aproximadamente 400 millones de parametros en la torre de visión, con parches de 16x16 y entrada de 384x384 pixeles. Lo publica el usuario fgeeha y su funcion no es generar texto, sino producir embeddings de imagen para recuperación: dada una fotografía de una botella en una estantería, el modelo devuelve un vector que permite localizar la ficha correspondiente dentro de un catálogo.

El ajuste fino esta especializado en el catálogo de la bodega «Своё Вино», con 2103 referencias. Segun la model card, se entreno con renderizados sinteticos de estantería generados a partir de las fotografías de referencia del catalogo, y se utiliza como modelo de embedding del escaner de vinos del caso LCT-2026 case 20, emparejado con el indice vectorial fgeeha/wine-scanner-index.

Su relevancia practica es la de un componente de recuperación visual de dominio muy concreto: demuestra el patron habitual de adaptar un encoder multimodal generalista a un catalogo cerrado mediante datos sinteticos, evitando el coste de fotografiar cada referencia en condiciones reales. El repositorio tiene 0 descargas y 0 me gusta en el momento de redactar esta ficha, no publica benchmarks y su model card es minima, por lo que cualquier evaluacion debe hacerse por cuenta propia antes de llevarlo a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de visión (ViT) SigLIP 2, variante shape-optimized so400m, con encoder de texto acoplado; parche 16x16 y resolución de 384x384 |
| Parametros totales | 428.256.706 (recuento real de los pesos safetensors del repositorio) |
| Parametros activos | No aplica: no es un modelo de mezcla de expertos (MoE) |
| Longitud de contexto | No aplica contexto de texto. La entrada de imagen de 384x384 px con parche 16 produce 576 parches (rejilla 24x24) mas el token de clase |
| Tipos de cuantizacion | No disponible. El repositorio solo publica safetensors; no consta ninguna version GGUF, ONNX ni cuantizada a 8 o 4 bits |
| Idiomas soportados | No disponible. La model card no documenta idiomas y el uso previsto es recuperación de imágenes |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | google/siglip2-so400m-patch16-384 |
| Tarea declarada (pipeline) | image-feature-extraction |
| Dominio de ajuste fino | Catalogo de vinos «Своё Вино», 2103 referencias |
| Tamaño del repositorio | 1,1 GB |
| Indice asociado | fgeeha/wine-scanner-index (el campo `data/index/meta.json` debe referenciar este modelo) |
| Fecha de creacion / actualizacion | 28 de septiembre de 2026 / 28 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura de partida es SigLIP 2, la segunda generacion del encoder visión-lenguaje de Google que sustituye la perdida contrastiva softmax de CLIP por una perdida sigmoide calculada par a par, lo que permite entrenar con lotes mucho mayores y mejora la calidad de los embeddings. La variante so400m (shape-optimized, aproximadamente 400 millones de parametros en el encoder de imagen) emplea parches de 16x16 sobre entradas de 384x384 y esta diseñada para equilibrar coste computacional y calidad de representacion. El recuento de pesos safetensors del repositorio, 428.256.706, es coherente con este orden de magnitud; la model card no desglosa cuantos corresponden a la torre de visión y cuantos a la torre de texto.

El ajuste fino se realizo, segun la model card, sobre renderizados sinteticos de estantería derivados de las fotografías de referencia del catalogo de 2103 vinos. No se especifica el numero de pares de entrenamiento, la composicion exacta del dataset, la funcion de perdida empleada, la resolucion de los renderizados ni si se congelo alguna parte del modelo base. Tampoco consta ninguna fase de RLHF, DPO u optimizacion por preferencias, algo esperable en un modelo de embeddings y no generativo. La innovacion tecnica relevante aqui no esta en el metodo de entrenamiento sino en la estrategia de datos: usar sintesis de estanterías para cubrir el salto entre una foto de catalogo y una foto de lineal real, y empaquetar el resultado junto a un indice vectorial especifico para que funcione como sistema de recuperación cerrado.

## Capacidades

- Extraccion de caracteristicas de imagen: genera un embedding normalizado por imagen, listo para busqueda por similitud coseno o producto escalar.
- Recuperacion de imagen a imagen dentro de un catalogo cerrado: identificar una referencia de vino a partir de una foto de botella en estantería.
- Recuperacion de texto a imagen si se conserva y usa la torre de texto del modelo base, si bien la model card no documenta esta capacidad ni el ajuste aplicado sobre ella.
- Integracion con indices vectoriales externos: el modelo esta pensado para emparejarse con fgeeha/wine-scanner-index.
- Procesamiento por lotes: al ser un encoder, puede vectorizar miles de imagenes de catalogo en una sola pasada para construir o refrescar el indice.
- No genera texto: no hay decodificacion autoregresiva, ni razonamiento, ni sintesis de lenguaje.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso; el bucle de decision debe implementarse fuera del modelo.
- Capacidades multilingues: no disponibles ni documentadas.
- No consta thinking mode, ni procesamiento de audio, ni ninguna otra modalidad adicional.

## Casos de uso

- Escaner de vinos en tienda fisica: el caso original para el que se entreno. El cliente fotografia la botella en la estantería y la aplicacion calcula el embedding con este modelo, consulta el indice fgeeha/wine-scanner-index y devuelve la ficha del vino con precio, añada y notas de cata.
- Ficha de producto en comercio electronico: dada una foto enviada por un usuario o por un proveedor, recuperar la referencia exacta del catalogo y rellenar automaticamente los metadatos de la publicacion, sin busqueda manual por texto.
- Control de inventario en bodega y tienda: recorrer el lineal con la camara del movil, vectorizar cada botella detectada y comparar el resultado contra el indice para detectar huecos, referencias mal colocadas o productos fuera de catalogo.
- Verificacion de etiquetas y precios: cruzar la referencia recuperada con la base de datos de precios para auditar la etiqueta fisica y detectar desajustes en promociones o cambios de añada.
- Curacion y deduplicacion de catalogos fotograficos: vectorizar todo el archivo de imagenes de producto y agrupar por similitud para eliminar duplicados y detectar fotografias obsoletas.
- Asistente de cata y recomendacion: usar el embedding como señal de similitud visual para sugerir vinos de aspecto o etiqueta parecidos al que el usuario tiene delante, combinado con reglas de negocio de la tienda.
- Control de calidad en picking y expedicion: verificar en la linea de empaquetado que la botella fisica coincide con la referencia del pedido antes del envio, usando la imagen como comprobacion adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de recuperación (top-1, top-5, mAP), ni evaluaciones sobre el catalogo de 2103 referencias, ni comparaciones con el modelo base google/siglip2-so400m-patch16-384. El repositorio no tiene descargas ni valoraciones que permitan inferir un rendimiento observado por terceros.

## Requisitos de hardware

- Tamaño de pesos: 428,3 millones de parametros, equivalentes a unos 1,7 GB en fp32 y unos 0,86 GB en fp16 o bf16. El repositorio ocupa 1,1 GB, coherente con pesos de precision reducida mas ficheros de configuracion.
- VRAM estimada para inferencia (estimacion a partir del recuento de parametros, no medida por el autor): aproximadamente 2 a 3 GB en fp16/bf16 con lote pequeño a 384x384, y 4 a 5 GB en fp32 con el mismo ajuste.
- GPUs recomendadas: cualquier GPU con 6 GB o mas de VRAM, como RTX 3060, RTX 4060, RTX 4090, A10, L4, A100 o H100. Para vectorizar el catalogo completo en lote conviene una GPU de centro de datos o una consumer de gama alta.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con al menos 4-6 GB de VRAM, incluidas GTX 1650 de 4 GB con precision reducida, RTX 3050 y superiores. Tambien es viable en CPU y en Apple Silicon via MPS para cargas no interactivas.
- Opciones de despliegue: transformers (clases de SigLIP 2 y AutoModel para extraccion de caracteristicas), exportacion a ONNX, TorchScript o TensorRT para servir a baja latencia, y motor de similitud vectorial aparte (FAISS, hnswlib, pgvector, Qdrant, Milvus) para el indice. vLLM y TGI estan orientados a modelos generativos y no aplican. No hay version GGUF publicada, por lo que llama.cpp y Ollama no son una via directa sin conversion previa.
- Latencia y throughput: no disponibles. La model card no publica medidas de latencia por imagen ni imagenes por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Idiomas | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|---|
| fgeeha/siglip2-wine | 428.256.706 | 384x384, parche 16 | No disponible | Apache 2.0 | HuggingFace, 0 descargas | Sin benchmarks publicados |
| google/siglip2-so400m-patch16-384 (base) | No disponible | 384x384, parche 16 | Multilingue segun el articulo de SigLIP 2 | Apache 2.0 | HuggingFace | Evaluado por Google en el articulo de SigLIP 2 |
| openai/clip-vit-large-patch14 | Aproximadamente 428 millones (304 M de visión y 123 M de texto; cifra ampliamente citada, no verificada en la informacion disponible) | 224x224, parche 14 | Ingles principalmente | Licencia MIT, segun el repositorio original | HuggingFace, muy extendido | Benchmarks publicos en el articulo de CLIP |
| google/siglip2-base-patch16-384 | No disponible | 384x384, parche 16 | Multilingue segun el articulo de SigLIP 2 | Apache 2.0 | HuggingFace | Evaluado por Google en el articulo de SigLIP 2 |

La comparación relevante es de especializacion, no de tamaño: el modelo base generalista cubre un espacio semantico mucho mas amplio, mientras que siglip2-wine esta ajustado a un catalogo de 2103 vinos y probablemente lo supere en ese dominio concreto, a costa de degradar su comportamiento fuera de el. No hay datos publicos que permitan cuantificar esa diferencia.

## Limitaciones y advertencias

- Sesgo de dominio severo: el ajuste fino cubre un unico catalogo de 2103 referencias. Fuera de esas etiquetas, la recuperación no tiene ninguna garantia y puede devolver la referencia mas parecida del catalogo aunque no corresponda.
- Brecha sim-to-real: el entrenamiento usa renderizados sinteticos de estantería a partir de fotos de referencia. El comportamiento con fotografias reales de tienda (iluminacion, reflejos, angulos, oclusiones, botellas parcialmente tapadas) no esta documentado ni validado en la model card.
- Riesgo de falsos positivos: botellas de la misma bodega con diseños casi identicos, o la misma referencia en añadas distintas con etiqueta similar, pueden producir embeddings muy proximos y confundir el detector.
- Riesgo de alucinacion: no aplica en el sentido generativo, porque el modelo no produce texto. El error equivalente es recuperar una referencia incorrecta con alta similitud coseno, y puede ser dificil de detectar sin un umbral de confianza bien calibrado.
- Idiomas y contexto: no disponibles. Al no haber documentacion sobre la torre de texto, no se puede asumir busqueda por texto en castellano, ruso o cualquier otro idioma.
- Licencia: Apache 2.0 permite uso comercial del modelo, pero no cubre los derechos sobre las imagenes del catalogo utilizadas en el ajuste fino ni sobre las marcas de las bodegas representadas. Esa es una cuestion juridica independiente que debe revisarse antes de explotarlo en produccion.
- Dependencia de un componente externo: el sistema completo requiere el indice fgeeha/wine-scanner-index y que su `data/index/meta.json` referencie este modelo. Cualquier cambio de encoder invalida el indice y obliga a reindexar.
- Mantenimiento incierto: 0 descargas, 0 me gusta y una unica revision el mismo dia de su publicacion. No hay garantia de soporte, actualizacion ni compatibilidad futura con versiones nuevas de transformers.
- Ausencia total de evaluacion: sin benchmarks, sin conjunto de validacion descrito y sin umbrales de similitud recomendados, el modelo no deberia desplegarse sin una evaluacion propia sobre imagenes reales del escenario objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fgeeha/siglip2-wine
- Indice asociado: https://huggingface.co/fgeeha/wine-scanner-index
- Modelo base: https://huggingface.co/google/siglip2-so400m-patch16-384
- Articulo de SigLIP 2: https://arxiv.org/abs/2502.14786
- Articulo original de SigLIP: https://arxiv.org/abs/2212.00794
- Repositorio de transformacion de CLIP en OpenCLIP (referencia de la familia de encoders comparados): https://github.com/mlfoundations/open_clip
