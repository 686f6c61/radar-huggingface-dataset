# gatilin/illumex_vision_flow_io

## Resumen

`gatilin/illumex_vision_flow_io` es un paquete de componentes extraidos del checkpoint del modelo multimodal ILLUME-X (autor upstream `ChonghuinanWang`), publicado por el usuario `gatilin` bajo licencia Apache-2.0. No es un modelo completo: agrupa la torre de vision SigLIP empaquetada de 26 capas, el conector, los embeddings de posicion visuales y latentes, las proyecciones de entrada/salida al espacio latente y el embedder de timesteps, junto con un autoencoder de pixeles independiente (dependencia upstream de BAGEL incluida byte a byte, no un VAE entrenado por ILLUME-X). El pipeline declarado es `image-feature-extraction`.

El problema que resuelve es de reutilizacion y trazabilidad: permite cargar por separado las interfaces de vision y flujo de ILLUME-X sin arrastrar el backbone linguistico ni la logica de control de tareas, con mapeo de tensores, hashes por tensor y revisiones de codigo fijadas. Devuelve caracteristicas visuales de 1152 dimensiones y caracteristicas de conector mas posicion de 3584 dimensiones a partir de parches RGB empaquetados de 14x14x3, y ofrece un codec de pixeles que reduce la imagen por 8 hasta 16 canales con las convenciones originales de escala (0.3611) y desplazamiento (0.1159).

Es relevante ahora para equipos que investigan pipelines multimodales y necesitan un bloque de vision latente reproducible y auditable, pero conviene ser explicito: el modelo no genera respuestas, no incluye el backbone de lenguaje/MoT y no aporta resultados de calidad medidos. Su valor es de infraestructura (componentes con paridad verificada), no de rendimiento de tarea final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Torre de vision SigLIP empaquetada (26 capas efectivas, RoPE desactivado, ultima capa SigLIP eliminada) + conector + embeddings de posicion visuales y latentes + proyecciones latentes de entrada/salida + embedder de timesteps; VAE de pixeles independiente (downsample x8 a 16 canales) |
| Parametros totales | 466.007.520 (suma agregada de safetensors; el desglose por componente no esta disponible) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; el componente no procesa texto. La entrada visual se define por numero de parches y `position_ids` por imagen, sin limite documentado |
| Tipos de cuantizacion | no disponible; el autor solo publica pesos PyTorch/safetensors y no documenta variantes cuantizadas (GGUF, AWQ, GPTQ, etc.) |
| Idiomas soportados | no disponible (componente sin capacidad linguistica; no se declaran idiomas en la model card) |
| Licencia | apache-2.0 (metadatos de pesos); se deben conservar los avisos por fichero y la procedencia del autoencoder comun, ver `THIRD_PARTY_LICENSES.md` |
| Formato de pesos | safetensors (libreria pytorch); repo de 1,3 GB con codigo Python de carga (`component.py`), validacion (`validate.py`) y `requirements.txt` |

## Arquitectura y entrenamiento

El paquete reproduce la configuracion nativa de inferencia de ILLUME-X: la configuracion fuente declara 27 capas, pero el builder oficial desactiva RoPE y elimina la ultima capa de SigLIP, de modo que la torre se instancia con 26 capas. Cada tensor seleccionado se conserva sin modificar; el bundle contiene 435 tensores de vision/interfaz y 244 tensores de VAE, todos cargados de forma estricta en la validacion. Incluye tablas de posicion, proyecciones latentes, embedder de timesteps y el conector que eleva las caracteristicas visuales a 3584 dimensiones. El VAE de pixeles es una dependencia upstream de BAGEL byte identica, con evidencia SHA-256 cruzada entre fuentes, y no se presenta como un VAE entrenado especificamente por ILLUME-X.

No hay informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni etapas de RLHF/DPO, porque este repositorio no entrena nada: es un bundle de componentes derivado. La innovacion tecnica relevante es de empaquetado y verificacion. `vision_features` acepta parches RGB empaquetados con forma `[patches, 588]` (14x14x3 con el aplanado HWC por parche del modelo original), `position_ids` correspondientes y el numero de parches por imagen, y aplica atencion segmentada para aislar cada imagen del lote. En CPU usa PyTorch SDPA segmentado y preserva float32 en lugar de forzar el cast a BF16 de CUDA. La validacion cubre carga estricta de los 679 tensores, comparacion entre empaquetado independiente y conjunto, formas de proyeccion latente y timesteps, tablas de posicion, aislamiento de segmentos de atencion, reconstruccion VAE a 128 px y paridad exacta de escala/desplazamiento bajo ruido fijo; los resultados medidos estan en `validation.json`.

## Capacidades

- Extraccion de caracteristicas visuales semanticas: devuelve vectores de 1152 dimensiones por parche desde la torre SigLIP de 26 capas.
- Proyeccion al espacio del conector: devuelve 3584 dimensiones combinando salida del conector y embeddings de posicion, listas para alimentar un backbone multimodal (no incluido).
- Tokenizacion de imagen en latentes: el VAE acepta RGB en formato NCHW en el rango [-1, 1] y comprime x8 hasta 16 canales, con escala 0.3611 y desplazamiento 0.1159.
- Procesamiento por lotes con aislamiento: la atencion segmentada permite empaquetar varias imagenes en una sola llamada usando `position_ids` y recuentos de parches por imagen.
- Entradas latentes y de timestep: incluye proyecciones de entrada/salida latentes y embedder de timesteps, es decir, las interfaces de flujo necesarias en pipelines tipo difusion.
- Ejecucion en CPU en float32 con SDPA segmentado, ademas de ruta CUDA.
- Validacion reproducible: `python validate.py` comprueba carga, formas, aislamiento y paridad numerica bajo ruido fijo.
- No soporta tool calling, function calling, agentes, razonamiento multi-step, vision-lenguaje de extremo a extremo ni generacion de texto: el backbone linguistico y su logica de control de tareas estan excluidos.

## Casos de uso

- Busqueda y retrieval multimodal: extraer los 1152 dims por parche (o un pooling propio) para indexar un corpus de imagenes y hacer busqueda por similitud con un encoder de texto externo; el componente es ligero (466 M parametros) y cabe en una sola GPU consumer.
- Tokenizacion visual para pipelines de generacion: usar el VAE (16 canales, x8) para convertir imagenes a latentes en un modelo de difusion propio, respetando escala 0.3611 y desplazamiento 0.1159 para mantener la paridad con el pipeline original.
- Preprocesado de un VLM propio: conectar las caracteristicas de 3584 dims del conector a un LLM distinto del original, sustituyendo solo la torre de vision y conservando el resto del stack.
- Clasificacion y dense prediction sobre features congelados: entrenar cabezas ligeras (segmentacion, deteccion de componentes, etiquetado) sobre las caracteristicas extraidas, sin ajustar los 466 M parametros.
- Investigacion reproducible y auditoria de pesos: el bundle incluye mapeo tensor a tensor, hashes, revisiones fijadas (`1d467046cf56fbb33bda7e49619342c9b5b515a3`) y evidencia de procedencia del VAE, util para replicar experimentos o auditar cadenas de derivados.
- Inferencia en CPU o entornos sin GPU: al preservar float32 con SDPA segmentado, sirve para generar caracteristicas en lotes pequenos en servidores sin acelerador.
- Prototipado de sistemas de edicion o inpainting latente: las proyecciones latentes y el embedder de timesteps permiten construir el lado condicional de un pipeline de flujo antes de integrar el modelo generativo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la equivalencia numerica de FlashAttention en CUDA, la calidad en VQA, la calidad en prediccion densa y la generacion completa intercalada o texto-a-imagen no han sido evaluadas. Lo unico medido son comprobaciones de correctitud estructural y numerica recogidas en `validation.json` (carga estricta de 435 tensores de vision/interfaz y 244 de VAE, formas de proyeccion latente y timesteps, tablas de posicion, aislamiento de segmentos de atencion, reconstruccion VAE a 128 px y paridad de escala/desplazamiento bajo ruido fijo).

## Requisitos de hardware

- VRAM estimada para inferencia: unos 1,9 GB en float32 y alrededor de 0,9-1,0 GB en BF16/FP16 para los 466 M parametros, mas activaciones (el repo completo ocupa 1,3 GB en disco).
- Cabe en GPU consumer: si, en cualquier tarjeta con 4 GB o mas (RTX 3050, RTX 4060, RTX 3060 12 GB, RX 7600). En CPU es viable para lotes pequenos.
- GPU recomendadas para produccion con lotes grandes: A100, H100, L40S o RTX 4090; el cuello de botella sera el numero de parches por lote, no el peso del modelo.
- Opciones de despliegue: carga nativa en PyTorch mediante `component.load_model` y `component.load_vae`; atencion con PyTorch SDPA segmentado en CPU y ruta CUDA. No hay soporte publicado para vLLM, TGI, llama.cpp ni Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles; no se han publicado medidas. La equivalencia numerica con FlashAttention en CUDA tampoco esta verificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| illumex_vision_flow_io (este) | 466.007.520 (vision + interfaces + VAE) | Parches 14x14x3 empaquetados; sin limite documentado | Features visuales 1152 d, conector 3584 d, latentes VAE 16 canales | apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| ChonghuinanWang/ILLUME-X (upstream) | no disponible en la informacion proporcionada | no disponible | Modelo multimodal completo (vision + lenguaje/MoT) | no disponible en la informacion proporcionada | HuggingFace |
| BAGEL (origen del VAE incluido) | no disponible en la informacion proporcionada | no disponible | Generacion multimodal; el VAE es una dependencia | no disponible en la informacion proporcionada | Upstream citado en la model card |
| Torres SigLIP / CLIP de proposito general | no disponible en la informacion proporcionada | no disponible | Image feature extraction / image-text matching | no disponible en la informacion proporcionada | Amplia, pero sin las interfaces latentes ni el aislamiento por segmentos |

La comparacion cuantitativa con alternativas no puede establecerse con los datos aportados: no hay benchmarks de calidad ni cifras de los modelos de referencia en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo generativo completo: el backbone de lenguaje/MoT y la logica de control de tareas estan excluidos, por lo que las features devueltas no son respuestas de un LLM.
- El preprocesado y el enrutado de tareas deben replicar los del modelo original; usar estas interfaces fuera de ese contexto puede producir resultados silenciosamente incorrectos.
- Las features semanticas de vision y los latentes del VAE tienen roles distintos y no son intercambiables.
- El VAE muestrea la posterior: sin fijar la semilla del RNG de PyTorch la salida no es reproducible.
- El VAE no es un componente entrenado por ILLUME-X, sino una dependencia upstream de BAGEL incluida byte a byte; los nombres o formas de tensor identicos entre derivados de BAGEL no garantizan valores aprendidos identicos.
- La model card del modelo base no incluye configuracion completa, de ahi que la configuracion de 27 capas se instancie como 26.
- No hay evaluacion de calidad en VQA, prediccion densa ni generacion intercalada, ni verificacion de equivalencia numerica de FlashAttention en CUDA.
- Riesgo de alucinacion y sesgos: no evaluables en este bundle al no incluir componente linguistico ni datos de entrenamiento; no se dispone de analisis de sesgo.
- Idiomas: no disponible; el componente no procesa texto.
- Licencia: los pesos se declaran apache-2.0, pero se deben preservar los avisos de copyright por fichero y la procedencia separada del autoencoder comun recogida en `THIRD_PARTY_LICENSES.md`; conviene revisarla antes de un uso comercial.
- Madurez: 0 descargas y 0 likes, sin validacion independiente por parte de la comunidad; el repositorio se creo y actualizo el mismo dia (19 de octubre de 2026).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gatilin/illumex_vision_flow_io
- Modelo base oficial (ILLUME-X): https://huggingface.co/ChonghuinanWang/ILLUME-X
- Codigo de carga incluido en el repo: `component.py` (https://huggingface.co/gatilin/illumex_vision_flow_io/blob/main/component.py)
- Script de validacion: `validate.py` (https://huggingface.co/gatilin/illumex_vision_flow_io/blob/main/validate.py)
- Resultados de validacion: `validation.json` (https://huggingface.co/gatilin/illumex_vision_flow_io/blob/main/validation.json)
- Requisitos: `requirements.txt` (https://huggingface.co/gatilin/illumex_vision_flow_io/blob/main/requirements.txt)
- Licencias de terceros y procedencia del VAE: `THIRD_PARTY_LICENSES.md` (https://huggingface.co/gatilin/illumex_vision_flow_io/blob/main/THIRD_PARTY_LICENSES.md)
- Revision del codigo fuente citada: `1d467046cf56fbb33bda7e49619342c9b5b515a3`
- La busqueda web realizada no devolvio resultados tecnicos relevantes sobre este modelo (solo contenido no relacionado); no se enlazan.
