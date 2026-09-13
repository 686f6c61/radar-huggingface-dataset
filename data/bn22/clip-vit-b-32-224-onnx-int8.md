# bn22/CLIP-ViT-B-32-224-ONNX-INT8

## Resumen

`bn22/CLIP-ViT-B-32-224-ONNX-INT8` es una conversion a formato ONNX con cuantizacion a INT8 del modelo CLIP ViT-B/32 de OpenAI (resolucion 224x224), publicada por el usuario bn22 en Hugging Face. Se trata de un modelo de vision-lenguaje basado en dos encoders (imagen y texto) entrenados de forma contrastiva, cuyo proposito es obtener representaciones conjuntas de imagenes y descripciones textuales en un mismo espacio de embeddings. La relevancia de esta ficha concreta no esta en el modelo base —ampliamente conocido y reutilizado desde 2021— sino en el formato empaquetado: una build ONNX INT8 de un repositorio de 0,2 GB, pensada para inferencia en CPU o en hardware modesto sin necesidad de PyTorch.

El repositorio no aporta model card util: el README se limita al bloque de frontmatter con `license: apache-2.0` y no incluye descripcion, procedencia de los pesos, receta de cuantizacion ni evaluacion alguna. Tampoco hay pipeline declarado, idiomas declarados ni etiquetas mas alla de la licencia y la region. En el momento de redactar esta ficha acumula 0 descargas y 0 likes, por lo que no existe validacion comunitaria de su correcto funcionamiento.

Por tanto, todos los datos arquitectonicos que se detallan a continuacion proceden de la documentacion publica del modelo base CLIP ViT-B/32 (Radford et al., 2021) y se marcan como tales; cualquier afirmacion especifica sobre esta conversion INT8 concreta se indica como no disponible. La busqueda web realizada no devolvio ninguna fuente relevante sobre este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de dos torres (dual encoder): ViT-B/32 para vision + transformer de texto, entrenados con objetivo contrastivo (segun el modelo base; no documentado en el repositorio) |
| Parametros totales | Aprox. 151 M en el modelo base (aprox. 86 M encoder de vision + aprox. 63 M encoder de texto); no confirmado en el repositorio |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 77 tokens para el encoder de texto en CLIP original (segun el modelo base); el encoder de vision procesa 224x224 px, equivalentes a 49 parches de 32x32 mas el token CLS |
| Tipos de cuantizacion | INT8 (ONNX), segun el nombre del repositorio. El metodo exacto (PTQ estatico, PTQ dinamico o QAT) no esta documentado |
| Idiomas soportados | No declarado. El modelo base se entrena principalmente con pares imagen-texto en ingles |
| Licencia | apache-2.0 (declarada en el repositorio) |
| Formato de pesos | ONNX en INT8, segun el nombre del repositorio; no se detalla la lista de ficheros ni si se incluyen grafos separados para vision y texto |
| Dimension del embedding | 512 en el modelo base CLIP ViT-B/32; no confirmado en el repositorio |
| Resolucion de imagen | 224x224 (indicada en el nombre del repositorio) |
| Tamano del repositorio | 0,2 GB |
| Fecha de publicacion | 2026-09-13 (metadata del repositorio); ultima actualizacion 2026-09-13 |
| Descargas / likes | 0 / 0 |
| Pipeline declarado | No disponible |

## Arquitectura y entrenamiento

CLIP ViT-B/32 es un modelo de dos torres: un Vision Transformer con parches de 32x32 (12 capas, dimension oculta 768, 12 cabezas de atencion) y un transformer de texto (12 capas, dimension 512, 8 cabezas) que proyectan a un espacio comun de 512 dimensiones. El entrenamiento es contrastivo sobre lotes de pares imagen-texto: se maximiza la similitud coseno de los pares correctos y se minimiza la de los incorrectos dentro del lote. Segun la publicacion del modelo base, se utilizaron aproximadamente 400 millones de pares imagen-texto recopilados de internet; no hubo RLHF ni DPO, ya que no es un modelo generativo de lenguaje.

La innovacion principal de CLIP es la clasificacion zero-shot: para clasificar una imagen en un conjunto de categorias se construyen prompts textuales del tipo "a photo of a {clase}", se calculan sus embeddings y se elige la clase con mayor similitud coseno con el embedding de la imagen, sin reentrenamiento. Esta conversion concreta se limita a reempaquetar los pesos en ONNX y reducir la precision a INT8; el repositorio no especifica el calibrado, el conjunto de calibracion, ni si se aplico cuantizacion por operador o por tensor, ni si se preservo la totalidad del grafo de ambos encoders. Tampoco se documenta ninguna tecnica adicional (atencion lineal, decodificacion especulativa, destilacion) porque no aplican al modelo base.

## Capacidades

- Generacion de embeddings de imagen: produce un vector de 512 dimensiones por imagen a 224x224.
- Generacion de embeddings de texto: produce un vector de 512 dimensiones por fragmento de texto de hasta 77 tokens.
- Clasificacion de imagenes zero-shot mediante plantillas de prompt y comparacion coseno, sin entrenamiento adicional.
- Recuperacion multimodal imagen-texto: busqueda de imagenes por consulta textual y viceversa dentro del mismo espacio vectorial.
- Filtrado y curacion de datos: puntuacion de similitud imagen-texto para descartar pares mal alineados en datasets multimodales.
- Extraccion de caracteristicas para clasificadores lineales o k-NN entrenados sobre los embeddings congelados.
- No soporta tool calling ni function calling.
- No soporta agentes, planificacion ni razonamiento multi-step.
- No genera texto libre: no es un modelo de lenguaje autoregresivo.
- Capacidades multilingues no documentadas; el comportamiento fiable se limita al ingles.
- No dispone de modo de razonamiento extendido, vision adicional, audio ni entrada de video (solo fotogramas sueltos).

## Casos de uso

- Clasificacion de imagenes zero-shot en produccion: definir el conjunto de etiquetas como prompts de texto y clasificar sin reentrenar; util cuando el catalogo de categorias cambia con frecuencia y no hay datos etiquetados.
- Curacion de datasets multimodales: puntuar cada par imagen-texto con la similitud coseno y descartar los pares por debajo de un umbral, replicando el filtrado tipo LAION empleado para construir datasets de entrenamiento de modelos de difusion.
- Busqueda semantica en bibliotecas de imagenes: indexar los embeddings de imagen en un indice vectorial (FAISS, hnswlib, Qdrant) y resolver consultas en lenguaje natural sobre el catalogo.
- Etiquetado automatico para sistemas de recomendacion: asignar etiquetas tematicas a contenido visual para alimentar un motor de recomendacion sin disponer de anotaciones humanas.
- Moderacion y control de calidad previo a generacion: comprobar la alineacion entre una imagen generada y su prompt para descartar salidas que no corresponden a la peticion, como paso de filtrado en un pipeline de difusion.
- Categorizacion de catalogos de comercio electronico: clasificar productos por tipo, color o estilo usando prompts en ingles y embeddings precalculados, con coste de inferencia bajo por articulo.
- Despliegue en edge o en servidores solo-CPU: al estar en ONNX INT8 y ocupar 0,2 GB, puede ejecutarse con ONNX Runtime en portatiles, contenedores sin GPU o dispositivos ARM, donde PyTorch resultaria mas pesado.
- Agrupacion y deduplicacion de activos visuales: usar los embeddings para clustering (por ejemplo, HDBSCAN) y detectar imagenes duplicadas o casi duplicadas en un archivo fotografico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio esta vacia, no hay tarjetas de evaluacion asociadas y la busqueda web no devolvio ninguna fuente que reporte metricas de esta conversion.

| Benchmark | Resultado en este repositorio | Referencia del modelo base |
|---|---|---|
| ImageNet zero-shot | No disponible | Publicado en el paper de CLIP (Radford et al., 2021); no reproducido aqui |
| CIFAR-100 / otras tareas zero-shot | No disponible | Publicado en el paper de CLIP; no reproducido aqui |
| Evaluacion de degradacion por INT8 | No disponible | No aplica |
| Latencia / throughput | No disponible | No aplica |

No se incluyen cifras concretas porque no proceden de la informacion proporcionada y no se ha verificado la integridad de esta conversion cuantizada frente a los pesos originales.

## Requisitos de hardware

- Peso de los ficheros: el repositorio ocupa 0,2 GB, coherente con unos 151 M de parametros en INT8 (aproximadamente 1 byte por parametro mas sobrecarga del grafo ONNX).
- VRAM estimada para inferencia con lote 1 a 224x224: por debajo de 1 GB con INT8; en la practica se puede ejecutar en CPU sin GPU dedicada.
- Comparativa de precision: los pesos en FP16 ocuparian aproximadamente 0,3 GB y en FP32 aproximadamente 0,6 GB, con los picos de memoria de activaciones correspondientes.
- GPU consumer: cabe en cualquier GPU con 2 GB o mas de VRAM (GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4060, entre otras); tambien en iGPU mediante DirectML u OpenVINO.
- GPU de centro de datos para alto throughput: A100, H100, L40S o RTX 4090 con lotes grandes para maximizar la utilizacion; el modelo es demasiado pequeno para saturar estas GPU con lote 1.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, TensorRT, DirectML), OpenVINO, TensorRT, Hugging Face Optimum y servidores de embeddings basados en ONNX. No es compatible con vLLM, TGI, llama.cpp ni Ollama, ya que no es un modelo autoregresivo de lenguaje.
- Latencia y throughput: no disponibles. Para un modelo de este tamano en INT8 se espera un coste del orden de decenas de milisegundos por imagen en GPU moderna y de decenas a centenares de milisegundos en CPU; son estimaciones orientativas, no medidas sobre este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de texto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| bn22/CLIP-ViT-B-32-224-ONNX-INT8 | Aprox. 151 M (heredados del base) | 77 tokens (base) | apache-2.0 (repositorio) | Hugging Face, ONNX INT8 | Conversion no documentada ni evaluada, 0 descargas |
| CLIP ViT-B/32 (OpenAI) | Aprox. 151 M | 77 tokens | Segun la publicacion original del modelo base; consultar antes de uso comercial | Pesos originales y variantes ONNX en el ecosistema | Referencia de arquitectura y comportamiento |
| OpenCLIP ViT-B-32 (LAION) | Aprox. 151 M | 77 tokens | Licencia del proyecto OpenCLIP; consultar | Amplia disponibilidad, versiones entrenadas con distintos datasets | Alternativa reproducible con recetas de entrenamiento publicadas |
| SigLIP Base (ViT-B/16) | Aprox. 203 M | Sin limite fijo de 77 tokens (perdida sigmoide) | Licencia del proyecto SigLIP; consultar | Hugging Face, transformers | Alternativa moderna con mejor comportamiento en clasificacion zero-shot segun su publicacion |
| CLIP ViT-L/14 (OpenAI) | Aprox. 428 M | 77 tokens | Segun la publicacion original del modelo base | Hugging Face y variantes ONNX | Mayor calidad a costa de mas memoria y latencia |

Los valores de parametros de los modelos comparados son aproximados y corresponden a las configuraciones publicadas de cada familia; no se dispone de una comparacion de rendimiento medida sobre esta conversion INT8.

## Limitaciones y advertencias

- Model card inexistente: el README solo contiene el frontmatter de licencia, sin informacion sobre procedencia de los pesos, receta de cuantizacion ni limitaciones conocidas.
- Sin evaluacion: no hay ninguna metrica que cuantifique la perdida de precision introducida por la cuantizacion INT8, ni verificacion de que ambos encoders (vision y texto) se hayan convertido correctamente.
- Sin validacion comunitaria: 0 descargas y 0 likes implican que no hay evidencia de uso en produccion ni reportes de fallos.
- Ambiguedad de licencia: el repositorio declara apache-2.0, pero la licencia aplicable a los pesos del modelo base puede ser distinta; conviene verificarla antes de un uso comercial.
- No es un modelo generativo: no produce texto, no sigue instrucciones y no soporta razonamiento multi-step; usarlo como si fuese un LLM seria un error de planteamiento.
- Limitacion de contexto: el encoder de texto del modelo base acepta 77 tokens, insuficiente para descripciones largas; los textos deben truncarse o resumirse.
- Limitacion de idioma: el modelo base se entrena fundamentalmente con texto en ingles, por lo que el rendimiento con prompts en castellano u otros idiomas es poco fiable.
- Sesgos heredados: CLIP aprende de pares imagen-texto extraidos de internet y reproduce sesgos demograficos, culturales y de genero presentes en esos datos; en tareas de clasificacion de personas el riesgo es especialmente alto.
- Errores tipicos del modelo base: dificultad con conteo de objetos, lectura de texto dentro de la imagen, relaciones espaciales finas y clases poco representadas.
- Alucinacion: no aplica en el sentido generativo, pero si existe el equivalente funcional en forma de clasificaciones o recuperaciones incorrectas con alta confianza coseno.
- Resolucion fija: la entrada esta limitada a 224x224, lo que penaliza tareas que dependen de detalles finos.
- Fechas de la metadata: el repositorio figura creado y actualizado en 2026-09-13, dato que no se puede contrastar con ninguna otra fuente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/bn22/CLIP-ViT-B-32-224-ONNX-INT8
- Modelo base de referencia, CLIP ViT-B/32 de OpenAI: https://huggingface.co/openai/clip-vit-base-patch32 (referencia del modelo base, no encontrada en la busqueda web)
- Paper de CLIP, Radford et al., 2021: https://arxiv.org/abs/2103.00020 (referencia del modelo base, no encontrada en la busqueda web)
- Repositorio oficial de CLIP de OpenAI: https://github.com/openai/CLIP (referencia del modelo base, no encontrada en la busqueda web)
- Proyecto OpenCLIP: https://github.com/mlfoundations/open_clip (referencia de alternativas, no encontrada en la busqueda web)
- Documentacion de ONNX Runtime: https://onnxruntime.ai/docs/ (referencia de despliegue, no encontrada en la busqueda web)
- Busqueda web realizada: no devolvio ningun resultado relevante sobre este modelo; los unicos resultados obtenidos fueron paginas de ayuda de Google sin relacion con el repositorio.
