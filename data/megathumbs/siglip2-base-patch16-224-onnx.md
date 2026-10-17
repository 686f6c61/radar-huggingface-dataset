# megathumbs/siglip2-base-patch16-224-ONNX

## Resumen

Este repositorio es un espejo en ONNX del modelo SigLIP 2 base (patch16, 224 px) de Google, publicado por el usuario megathumbs como dependencia del software de reconocimiento de imagenes MegaThumbs. No es un modelo nuevo ni un ajuste fino: los ficheros que contiene son identicos byte a byte a los de la revision `ba1f3b0843f24bc5417d38e19c37b287d719b2f4` del repositorio `onnx-community/siglip2-base-patch16-224-ONNX`, y el autor indica que verifica cada fichero mediante suma de comprobacion SHA-256.

SigLIP 2 es la segunda generacion de la familia de codificadores vision-lenguaje de Google basados en perdida sigmoidea (sigmoide en lugar del contraste softmax tipo CLIP). La variante empaquetada aqui es la base con parches de 16x16 sobre imagenes de 224x224 px, pensada para tareas de representacion conjunta imagen-texto: clasificacion zero-shot, recuperacion (retrieval) texto-imagen, similitud imagen-imagen y generacion de embeddings, no para generacion de texto.

Su relevancia practica en este repositorio es acotada y muy concreta: al estar en ONNX y etiquetado con `transformers.js`, el modelo puede ejecutarse en el navegador o en Node.js con ONNX Runtime (WASM/WebGPU) sin depender de PyTorch ni de un servidor GPU, lo que permite hacer reconocimiento visual en el propio dispositivo. El repositorio es un subconjunto deliberado del export original (solo los ficheros que MegaThumbs descarga), con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador vision-lenguaje de tipo transformer (ViT para imagen y encoder de texto emparejado) entrenado con perdida sigmoidea, exportado a ONNX. Detalle completo de capas y dimensiones: no disponible en la informacion proporcionada |
| Parametros totales | No disponible en la informacion proporcionada (el repositorio ONNX ocupa 0,7 GB) |
| Parametros activos | No aplica: no es un modelo de mezcla de expertos (MoE) |
| Longitud de contexto | No aplica como en un modelo generativo. El codificador de vision procesa imagenes de 224x224 px con parches de 16x16 (segun el nombre del modelo); la longitud maxima de secuencia del codificador de texto: no disponible |
| Tipos de cuantizacion | El repositorio incluye el codificador de texto ya cuantizado (`onnx/text_model_quantized.onnx`) y el codificador de vision en su precision original (`onnx/vision_model.onnx`). Esquema de cuantizacion exacto (int8 dinamica, etc.): no disponible |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 (la misma que el modelo original) |
| Formato de pesos | ONNX (`.onnx`), acompanado de tokenizer y ficheros de configuracion |

## Arquitectura y entrenamiento

El modelo base es `google/siglip2-base-patch16-224`, un codificador contrastivo de dos torres: una torre de vision tipo ViT que divide la imagen de 224x224 px en parches de 16x16, y una torre de texto que proyecta la frase o etiqueta a un espacio de embedding comun. A diferencia de CLIP, el entrenamiento usa una perdida sigmoidea aplicada par a par, lo que evita la normalizacion global tipo softmax sobre el lote. Los detalles de composicion del dataset, numero de tokens o pares imagen-texto vistos durante el entrenamiento no estan disponibles en la informacion proporcionada.

Este repositorio concreto no aporta informacion de entrenamiento: es un espejo de inferencia. El autor declara que solo incluye los ficheros que MegaThumbs necesita (los dos grafos ONNX, tokenizer y configuraciones) y que los ficheros son identicos al export de `onnx-community`, por lo que cualquier innovacion tecnica relevante (por ejemplo, las mejoras de SigLIP 2 en comprension semantica, localizacion y rasgos densos descritas en la documentacion publica de Google) procede del modelo original, no de este repositorio. La unica intervencion sobre el material original es la seleccion de ficheros y la cuantizacion del codificador de texto, que ya viene del export de origen.

## Capacidades

- Generacion de embeddings de imagen y de texto en un espacio vectorial comun (no genera texto libre).
- Clasificacion de imagenes zero-shot mediante prompts de texto, sin entrenamiento adicional.
- Recuperacion texto-imagen e imagen-texto (busqueda semantica en colecciones de imagenes).
- Similitud imagen-imagen para agrupacion, deduplicacion y deteccion de near-duplicates.
- Puntuacion de compatibilidad imagen-texto para filtrado y ordenacion de resultados.
- Ejecucion en el navegador o en Node.js mediante transformers.js y ONNX Runtime, con aceleracion opcional por WebGPU.
- Inferencia sin conexion y sin envio de imagenes a un servidor de terceros (procesado local en el cliente).
- Soporte de tool calling / function calling: no aplica, no es un modelo de lenguaje generativo.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no confirmadas en la informacion proporcionada para este export concreto.
- Capacidades especiales (modo de razonamiento, vision generativa, audio): no aplica; la unica modalidad tratada es imagen y texto como entrada.

## Casos de uso

- Busqueda semantica de imagenes por descripcion en lenguaje natural: se indexan previamente los embeddings de vision de la coleccion y, en consulta, se calcula el embedding de texto y se ordena por similitud coseno. Es el uso central del modelo y no requiere GPU si la coleccion es moderada.
- Etiquetado automatico de catalogos y bibliotecas de imagenes: con un conjunto cerrado de etiquetas candidatas se obtiene la clase mas probable por similitud, lo que permite poblar metadatos sin entrenar un clasificador especifico.
- Moderacion y filtrado de contenido: se definen prompts de texto que describen categorias no deseadas y se usa la puntuacion de similitud como senal de triaje previa a una revision humana.
- Reconocimiento visual en el propio dispositivo dentro de una aplicacion web o extension: al estar en ONNX y con soporte de transformers.js, las imagenes pueden procesarse localmente sin salir del navegador, lo que reduce costes de servidor y mejora la privacidad.
- Deduplicacion y curacion de datasets multimodales: se calculan embeddings de vision sobre un corpus grande y se agrupan por similitud para eliminar imagenes repetidas o casi identicas antes de usarlas en entrenamiento.
- Verificacion de coherencia imagen-texto en pipelines editoriales: comprobar automaticamente si la imagen asignada a una noticia o ficha de producto se corresponde con el texto que la acompana.
- Recomendacion visual: dado un elemento que le gusta al usuario, recuperar imagenes o productos visualmente similares usando solo el embedding de vision.
- Aplicaciones de escritorio o moviles sin conectividad: cualquier flujo que necesite descripcion o clasificacion de imagenes en un entorno desconectado, con un peso en disco de 0,7 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio no incluye ninguna tabla de evaluacion, y los resultados de busqueda web asociados a esta consulta no contienen datos tecnicos sobre el modelo. La documentacion publica de la familia SigLIP 2 si reporta evaluaciones de clasificacion zero-shot y de recuperacion, pero esas cifras no forman parte de la informacion proporcionada y no se reproducen aqui para no introducir numeros no verificados.

## Requisitos de hardware

- Tamanio en disco del repositorio: 0,7 GB, con solo dos grafos ONNX mas tokenizer y configuraciones.
- Memoria en inferencia: por debajo de 1 GB en el peor caso si se carga el grafo de vision en precision original junto con el de texto cuantizado; una vez cargado el modelo, el consumo adicional depende del lote y de la resolucion de entrada (estimacion, no confirmada en la informacion disponible).
- GPU dedicada: no necesaria. El modelo es un codificador de tamano base y esta pensado para ejecutarse en CPU.
- GPU de consumo: cabe con holgura en cualquier GPU con 2 GB o mas de VRAM (GTX 1050, GTX 1650, RTX 3050, RTX 4060, RTX 4090, etc.), e incluso en graficos integrados; no se requiere A100 ni H100.
- CPU: ejecucion viable via ONNX Runtime con backend WASM; el cuello de botella sera el preprocesado de imagen y el numero de inferencias, no la memoria.
- Opciones de despliegue: transformers.js (uso previsto por el autor), ONNX Runtime para Python, Node.js o C++, ONNX Runtime Web y WebGPU para navegador. vLLM, llama.cpp, Ollama y TGI no aplican porque no es un modelo de lenguaje generativo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura y entrada | Parametros | Licencia | Formato disponible | Notas |
|---|---|---|---|---|---|
| megathumbs/siglip2-base-patch16-224-ONNX | SigLIP 2 base, ViT con parches de 16x16 sobre 224x224 px, codificador de texto emparejado | No disponible | Apache 2.0 | ONNX (vision en precision original, texto cuantizado) | Espejo parcial de un export de la comunidad; 0 descargas y 0 likes; pensado para transformers.js |
| google/siglip2-base-patch16-224 | SigLIP 2 base, misma configuracion | No disponible | Apache 2.0 | safetensors / PyTorch | Modelo original de Google; incluye todos los ficheros y permite reexportar a otros formatos |
| google/siglip-base-patch16-224 (SigLIP 1) | SigLIP 1 base, ViT con parches de 16x16 sobre 224x224 px | No disponible | Apache 2.0 | safetensors / PyTorch | Generacion anterior; referencia habitual en tareas de retrieval y clasificacion zero-shot |
| openai/clip-vit-base-patch16 | CLIP ViT-B/16, parches de 16x16 sobre 224x224 px, perdida contrastiva softmax | Aproximadamente 150 M (cifra publica de la model card de OpenAI, no incluida en la informacion proporcionada) | MIT | PyTorch y ONNX | Alternativa mas veterana; menor calidad reportada en recuperacion multilingue frente a SigLIP 2 segun la documentacion publica de este ultimo |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no razona paso a paso, no soporta tool calling ni flujos de agentes. Cualquier expectativa en ese sentido es un error de uso.
- Espejo parcial y no oficial: solo contiene los ficheros que MegaThumbs descarga (`onnx/vision_model.onnx`, `onnx/text_model_quantized.onnx`, tokenizer y configuraciones). Puede faltar el image processor o la version sin cuantizar del codificador de texto, lo que limita la reproducibilidad completa del export original.
- Mantenimiento incierto: 0 descargas y 0 likes, publicado por un tercero no afiliado a Google y sin historial de actualizaciones. Si el repositorio de origen cambia, este espejo no se actualizara necesariamente.
- Anomalia en los metadatos: las fechas de creacion y actualizacion del repositorio en HuggingFace (16 de octubre de 2026) resultan incoherentes con una publicacion normal y conviene verificarlas antes de depender de esta revision.
- Cuantizacion asimetrica: el codificador de texto esta cuantizado y el de vision no. Las puntuaciones de similitud pueden degradarse ligeramente respecto al modelo original en tareas de recuperacion texto-imagen, y no se documenta la perdida de precision.
- Calibracion de puntuaciones: los valores de similitud no vienen calibrados como probabilidades. Usarlos directamente como umbral de decision (por ejemplo, en moderacion) produce falsos positivos y falsos negativos.
- Riesgo de etiquetado erroneo: en clasificacion zero-shot el modelo puede asignar una etiqueta incorrecta con una puntuacion alta, especialmente con prompts ambiguos o imagenes fuera de la distribucion de entrenamiento.
- Sesgos: heredados de los datos de entrenamiento del modelo original (no disponibles en esta informacion). Son esperables sesgos de genero, origen etnico, edad, cultura y representacion geografica, con impacto directo en tareas de moderacion, contratacion o analisis de personas.
- Idiomas: no disponibles. No se puede afirmar el comportamiento en castellano ni en otras lenguas a partir de la informacion proporcionada.
- Licencia: Apache 2.0, la misma que el modelo original. Permite uso comercial y modificacion con obligacion de conservar el aviso de licencia; el espejo no anade restricciones adicionales, pero tampoco ofrece garantias.
- Dependencia de la cadena ONNX: el rendimiento real dependera del proveedor de ejecucion (WASM frente a WebGPU) y de la version de ONNX Runtime; no hay cifras de latencia publicadas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/megathumbs/siglip2-base-patch16-224-ONNX
- Export ONNX de origen: https://huggingface.co/onnx-community/siglip2-base-patch16-224-ONNX
- Revision fijada del export de origen: `ba1f3b0843f24bc5417d38e19c37b287d719b2f4`
- Modelo original de Google: https://huggingface.co/google/siglip2-base-patch16-224
- Sitio del proyecto MegaThumbs: https://megathumbs.de
- Referencia externa no incluida en los resultados de busqueda: informe tecnico de SigLIP 2, arXiv:2502.14786 (documentacion publica de Google sobre la familia SigLIP 2)
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante sobre el modelo; los resultados devueltos tratan sobre temas matematicos y linguisticos sin relacion con esta ficha.
