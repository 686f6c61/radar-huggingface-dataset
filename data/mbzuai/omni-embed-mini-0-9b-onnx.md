# MBZUAI/Omni-Embed-Mini-0.9B-onnx

## Resumen

Omni-Embed Mini 0.9B es un modelo de embeddings multimodales desarrollado por MBZUAI (Universidad Mohammed bin Zayed de Inteligencia Artificial) que proyecta texto, imagenes, video, voz, audio general y paginas de documento en un unico espacio vectorial de 1024 dimensiones. La variante publicada bajo el identificador `MBZUAI/Omni-Embed-Mini-0.9B-onnx` es una exportacion a ONNX disenada explicitamente para ejecutarse en el navegador sobre WebGPU, lo que la convierte en una pieza poco habitual: no es solo un modelo de recuperacion multimodal, sino un modelo pensado para inferencia en cliente sin backend.

El problema que resuelve es el de la busqueda y recuperacion cross-modal con una sola representacion: en lugar de mantener indices separados por modalidad, permite indexar y consultar con el mismo vector de 1024 dimensiones, lo que simplifica arquitecturas de RAG, busqueda semantica y deduplicacion sobre corpus heterogeneos. El nombre del modelo indica un tamano aproximado de 0.9B parametros, y el repositorio ocupa 1,9 GB.

Es relevante ahora por dos motivos. Primero, la tendencia a llevar modelos de embeddings pequenos (sub-1B) a entornos de borde y navegador, donde no hay GPU de datacenter. Segundo, el articulo asociado, titulado "Omni-Embed-Mini: Binding Modalities Without Forgetting via Dense Distillation" y con publicacion prevista en 2026, apunta a destilacion densa como tecnica para unir modalidades sin degradar las capacidades previas del modelo. La licencia Apache 2.0 facilita su adopcion comercial, algo que no todos los modelos multimodales equivalentes ofrecen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; empaquetado ONNX de seis grafos (backbone, tabla de embeddings, encoder de vision, encoders de audio Whisper y Dasheng, y proyectores) |
| Parametros totales | 0,9B aproximados (segun la denominacion "Mini 0.9B" del modelo; no se publica desglose por componente) |
| Parametros activos | No aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio publica grafos ONNX sin especificar precisiones; el tamano de 1,9 GB es compatible con pesos en precision reducida) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (varios grafos: `backbone/model.onnx`, `backbone/embed_tokens.onnx`, `vision_encoder/model.onnx`, `whisper_encoder/`, `dasheng_encoder/`, `projectors/*.onnx`) y `manifest.json` con precondiciones |

## Arquitectura y entrenamiento

La informacion publicada no describe la arquitectura interna mas alla del empaquetado de inferencia. Se sabe que el bundle consta de seis grafos ONNX orquestados desde JavaScript, no mediante una arquitectura declarativa de transformers.js. El reparto de responsabilidades es inusual: el splice de las modalidades, el pooling y dos de las tres entradas del tower de vision los calcula el codigo llamante, no el grafo. El backbone consume `inputs_embeds` (no tokens), de modo que la tokenizacion y la construccion de embeddings de entrada corren por cuenta del cliente. El encoder de vision procesa una imagen por llamada, y el audio se cubre con dos encoders distintos: Whisper y Dasheng.

El unico dato tecnico de entrenamiento disponible es el titulo del articulo asociado, que menciona "destilacion densa" como mecanismo para enlazar modalidades sin olvido catastrofico. No se especifican numero de tokens de entrenamiento, composicion del dataset, ni si hubo fases de RLHF o DPO; en el caso de un modelo de embeddings, esas fases no serian el procedimiento habitual en cualquier caso. Cada componente fue verificado contra su referencia en PyTorch antes de la exportacion, y los resultados de esa verificacion se publican en `*/conversion_metadata.json` y `*/parity_report.json` dentro del repositorio.

Un detalle relevante para produccion: el preprocesado forma parte del modelo. Una imagen fija se escala a 224 con interpolacion bilineal de PIL y despues a 256 con bicubica compatible con Pillow. Sustituir ese encadenado por un redimensionado de canvas del navegador desplaza el embedding final a un coseno de 0,734, es decir, un vector practicamente distinto. Los vectores generados por un cliente que no reproduzca esa cadena no deben mezclarse en el mismo indice.

## Capacidades

- Generacion de embeddings multimodales en un espacio unico de 1024 dimensiones para texto, imagenes, video, voz, audio general y paginas de documento.
- Recuperacion y busqueda cross-modal: consultar con texto y recuperar imagenes o audio, y viceversa.
- Extraccion de caracteristicas para pipelines de `feature-extraction` (es el pipeline declarado en el repositorio).
- Procesamiento de audio mediante dos encoders especializados (Whisper para voz y Dasheng para audio general).
- Procesamiento de paginas de documento como modalidad propia, orientado a indexacion de documentacion escaneada o maquetada.
- Ejecucion en navegador sobre WebGPU mediante JavaScript, sin necesidad de servidor de inferencia.
- Soporte de tool calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no aplica; es un modelo de representacion, no generativo.
- Capacidades multilingues: no disponible (no se declaran idiomas en la model card).
- Capacidades especiales: modo thinking, vision generativa o sintesis de audio no disponibles; el modelo solo produce vectores.

## Casos de uso

- Busqueda semantica local en el navegador: indexar documentacion o articulos en el propio cliente con WebGPU y permitir consultas en lenguaje natural sin enviar datos a un servidor, gracias a que el modelo completo cabe en 1,9 GB.
- Recuperacion multimodal en aplicaciones de gestion de assets: un unico indice de 1024 dimensiones para fotos, videos, clips de audio y PDFs, lo que evita mantener cuatro indices separados y simplifica el ranking combinado.
- RAG sobre repositorios documentales heterogeneos: indexar paginas de documento, capturas e imagenes de diagramas junto con el texto extraido, de modo que una consulta recupere tanto el parrafo como la figura relevante.
- Moderacion y deduplicacion de contenido: comparar embeddings de imagen, audio y texto para detectar duplicados o contenido repetido entre modalidades dentro de un mismo corpus.
- Transcripcion y busqueda en archivos audiovisuales: el encoder Whisper permite indexar la componente de voz y el encoder Dasheng el audio general, habilitando busqueda por contenido sonoro en archivos de video o podcasts.
- Prototipos de aplicaciones web sin backend de inferencia: la demo oficial y el formato ONNX permiten desplegar busqueda multimodal en una aplicacion estatica, util para demos, herramientas educativas o productos con requisitos estrictos de privacidad.
- Clasificacion y clustering zero-shot sobre corpus mixtos: al disponer de una representacion comun, se pueden agrupar elementos de distinta modalidad con metodos clasicos como k-NN o k-means.
- Sistemas de recomendacion basados en similitud cross-modal: recomendar video o audio a partir de una consulta textual, o al reves, usando similitud coseno en el mismo espacio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye informes de paridad (`parity_report.json`) que comparan cada grafo ONNX con su referencia en PyTorch, pero estos datos miden fidelidad de la conversion, no calidad de recuperacion, y no se detallan cifras en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1,8 GB en precision de 16 bits y 3,6 GB en 32 bits para el conjunto de 0,9B parametros; el repositorio completo ocupa 1,9 GB, por lo que se puede cargar por componentes segun la modalidad que se vaya a usar.
- GPU recomendadas: no se especifican. Para ejecucion en servidor, cualquier GPU con al menos 4 GB de VRAM es suficiente en teoria; para el caso de uso declarado (WebGPU en navegador), el modelo esta pensado para GPUs de consumo integradas o dedicadas.
- Compatibilidad con GPU de consumo: si, es el escenario objetivo. El diseno por grafos permitiria cargar solo el encoder necesario (por ejemplo, vision o audio) en lugar del bundle completo.
- Opciones de despliegue: ONNX Runtime (incluida la variante Web/WebGPU), y orquestacion desde JavaScript propio mediante el `manifest.json`. No se documentan recetas para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo ni se publican pesos GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidades | Dimension del embedding | Licencia | Contexto |
|---|---|---|---|---|---|
| Omni-Embed-Mini 0.9B (ONNX) | 0,9B aprox. | Texto, imagen, video, voz, audio, documento | 1024 | Apache 2.0 | No disponible |
| Jina CLIP v2 | 0,9B aprox. | Texto e imagen | 1024 | CC-BY-NC-4.0 | 512 tokens |
| SigLIP (So400m) | 0,88B aprox. | Texto e imagen | 1152 | Apache 2.0 | 64 tokens |
| ImageBind | No disponible | Imagen, texto, audio, video, profundidad y mas | No disponible | CC-BY-NC-4.0 (pesos) | No disponible |

Nota: los valores de los modelos de comparacion son aproximados y pueden variar segun la variante concreta; no se dispone de comparaciones de rendimiento publicadas entre Omni-Embed-Mini y estas alternativas. La ventaja diferencial de Omni-Embed-Mini en esta tabla es la combinacion de cobertura de seis modalidades con licencia Apache 2.0 y ejecucion en navegador.

## Limitaciones y advertencias

- No hay resultados de benchmarks publicados, por lo que la calidad de recuperacion real frente a alternativas establecidas no puede evaluarse con los datos disponibles.
- El modelo no genera texto: es exclusivamente un extractor de embeddings. Cualquier expectativa de uso como LLM o modelo de razonamiento es incorrecta.
- El preprocesado de imagen es parte integrante del modelo. Un redimensionado distinto al encadenado PIL bilineal a 224 mas bicubica a 256 produce embeddings incompatibles (coseno 0,734 frente a la referencia), lo que invalida la mezcla en indices existentes.
- El bundle no sigue la convencion estandar de transformers.js: el splice, el pooling y dos de las tres entradas del encoder de vision deben implementarse en el cliente. Esto eleva el coste de integracion y el riesgo de errores silenciosos que degraden la calidad del indice.
- La ventana de contexto no esta documentada; no se recomienda asumir una longitud concreta para documentos largos sin verificarla.
- Los idiomas soportados no se declaran, a diferencia de alternativas como Jina CLIP v2, que explicita su cobertura multilingue. Para produccion en idiomas distintos del ingles conviene validar antes.
- Sesgos conocidos: no disponibles. Los modelos entrenados con datos web multimodales tienden a heredar sesgos de representacion, pero no se documenta ninguna evaluacion al respecto.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de falsos positivos en recuperacion por similitud coseno alta entre elementos no relacionados.
- Licencia Apache 2.0: permite uso comercial y modificacion sin las restricciones no comerciales de alternativas como Jina CLIP v2 o los pesos de ImageBind. Se debe conservar el aviso de licencia y la atribucion.
- El repositorio registra 0 descargas y 3 likes en el momento de la consulta, con fecha de creacion en septiembre de 2026. Es un artefacto reciente y poco validado por la comunidad.
- El articulo asociado esta pendiente de publicacion ("camera-ready in preparation") y los campos de autor y venue figuran como TBD, de modo que no hay revision por pares disponible.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/MBZUAI/Omni-Embed-Mini-0.9B-onnx
- Pagina del proyecto: https://omniembed.cvmbzuai.com/
- Demo en vivo: https://demo-omniembed.cvmbzuai.com/
- Articulo asociado: "Omni-Embed-Mini: Binding Modalities Without Forgetting via Dense Distillation", 2026, referencia bibliografica incluida en la model card; autor y venue pendientes de confirmacion.
- Resultados de busqueda web: no se ha encontrado informacion adicional relevante sobre este modelo; los resultados devueltos no guardan relacion con el.
