# ml-resources/sapiens2-pretrain-5b

## Resumen

Sapiens2-5B es el backbone de mayor tamano de la familia Sapiens2, un conjunto de vision transformers de alta resolucion desarrollados por Meta para tareas centradas en el ser humano (estimacion de pose, segmentacion de partes del cuerpo, normales de superficie y pointmaps). Este repositorio concreto contiene unicamente el backbone preentrenado de 5.071 mil millones de parametros, que produce caracteristicas densas por parche listas para fine-tuning de cabezas de tarea posteriores. El checkpoint aqui listado es un espejo no oficial de `facebook/sapiens2-pretrain-5b`, publicado por el usuario `ml-resources`.

El modelo se preentreno sobre 1.000 millones de imagenes de personas, una escala de datos poco habitual en modelos de vision centrados en el cuerpo humano, y emplea un ViT con RoPE, GQA, SwiGLU, RMSNorm y QK-norm. Con 56 capas, dimension de embedding de 2432 y 32 cabezas de atencion, opera a una resolucion de preentrenamiento de 1024 x 768 con parches de 16 x 16, lo que arroja 3072 tokens por imagen.

Su relevancia actual reside en que ofrece un backbone de gran capacidad especificamente preentrenado en dominio humano, lo que reduce el coste de adaptacion a tareas de analisis corporal frente a backbones genericos. Al ser un modelo de extraccion de caracteristicas y no un modelo generativo, no dispone de ventana de contexto autorregresiva ni de capacidades de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sapiens2 ViT (RoPE, GQA, SwiGLU, RMSNorm, QK-norm) |
| Parametros totales | 5.071 B (5.066.902.995 segun safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 3072 tokens por imagen a 1024 x 768 con parche 16 (no es contexto autorregresivo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | Sapiens2 License (license: other) |
| Formato de pesos | safetensors (fp32, ~20,3 GB) |

## Arquitectura y entrenamiento

El modelo es un vision transformer de 56 capas con dimension de embedding de 2432 y 32 cabezas de atencion. Incorpora varias innovaciones habituales en transformers modernos: embeddings posicionales rotatorios (RoPE) en lugar de posicionales absolutos aprendidos, atencion con consultas agrupadas (GQA) para reducir el coste de memoria de la cache de claves y valores, activacion SwiGLU en las capas feed-forward, normalizacion RMSNorm y QK-norm. El modelo opera sobre parches de 16 x 16 pixeles y consume imagenes a 1024 x 768, generando 3072 tokens por imagen. Su coste computacional declarado es de 15,722 TFLOPs.

El preentrenamiento se realizo sobre 1.000 millones de imagenes humanas, sin que la informacion disponible detalle la composicion exacta del dataset, el numero total de tokens de entrenamiento procesados ni si se aplicaron fases de RLHF o DPO (tecnicas propias de modelos generativos de lenguaje que no aplican a un backbone de vision). Tampoco se especifican en la informacion proporcionada los detalles del regimen de aumentacion, el scheduler de learning rate ni la estrategia de paralelismo empleada.

## Capacidades

- Extraccion de caracteristicas visuales densas por parche: la salida es un tensor de forma (B, num_tokens, embed_dim) que sirve como representacion base para cabezas de tarea.
- Inicializacion para fine-tuning de cabezas de tarea centradas en el ser humano: estimacion de pose, segmentacion de partes del cuerpo, normales de superficie y pointmaps.
- Procesamiento de imagenes a resolucion 1024 x 768 mediante parches de 16 x 16.
- Investigacion en vision centrada en el cuerpo humano como backbone preentrenado de referencia.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente, razonamiento multi-paso ni planificacion.
- No dispone de capacidades multilingues ni de generacion de texto.
- No dispone de modo de razonamiento explicito (thinking mode), vision generativa, audio ni otras modalidades fuera de la imagen de entrada y las caracteristicas de salida.

## Casos de uso

- Estimacion de pose humana: el backbone se afina con una cabeza de regresion de keypoints, aprovechando las representaciones densas preentrenadas sobre 1.000 millones de imagenes humanas para obtener mayor precision en oclusiones y posturas complejas.
- Segmentacion de partes del cuerpo: se anade una cabeza de segmentacion semantica sobre las caracteristicas del backbone para generar mascaras por region anatomica en imagenes de alta resolucion.
- Estimacion de normales de superficie: se entrena una cabeza de regresion que predice la orientacion de la superficie corporal a partir de las caracteristicas, util para reconstruccion 3D y renderizado.
- Generacion de pointmaps: se utiliza el backbone como extractor previo a una cabeza que produce mapas de puntos 3D por pixel, aplicable a digitalizacion de cuerpos y avatares.
- Preentrenamiento de dominio para investigacion en vision humana: sirve como punto de partida congelado o ajustable para experimentos academicos que requieran representaciones ricas del cuerpo humano.
- Sistemas de analisis biomecanico o deportivo: extraccion de caracteristicas para pipelines posteriores de analisis de movimiento, siempre que se disponga de las cabezas de tarea afinadas correspondientes.
- Base para modelos de reconstruccion corporal: las caracteristicas densas por parche alimentan etapas de un pipeline de reconstruccion 3D a partir de imagenes monoculares o multivista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card y los datos extraidos no incluyen metricas de tareas como pose estimation, segmentation o normales de superficie, ni comparaciones numericas frente a otros backbones.

## Requisitos de hardware

- Pesos en fp32 (formato del checkpoint): aproximadamente 20,3 GB en disco y en VRAM para cargar el modelo completo.
- Pesos en bf16/fp16 (conversion manual, no distribuida oficialmente): aproximadamente 10,1 GB, mas memoria para activaciones.
- Activaciones a resolucion completa: con 3072 tokens por imagen y 56 capas, la memoria de activaciones es considerable; se recomienda inferencia sin gradientes (`torch.no_grad()`).
- GPU recomendadas: para entrenamiento y fine-tuning a resolucion completa, GPU de 40-80 GB (A100 40/80 GB, H100). Para inferencia en bf16, una GPU de 24 GB como la RTX 4090 o A10G puede ser suficiente para lotes pequenos segun la memoria de activaciones.
- Cabe en GPU de consumo: en bf16 y con lotes reducidos, si es viable en GPUs de 24 GB; en fp32 es improbable en GPUs de menos de 24 GB.
- Opciones de despliegue: la libreria oficial `sapiens` (instalacion con `pip install -e .` desde el repositorio de GitHub) y PyTorch estandar. vLLM, llama.cpp, Ollama y TGI no aplican de forma estandar a este modelo, ya que es un encoder de vision y no un modelo generativo de lenguaje.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | FLOPs | Embed dim | Capas | Cabezas |
|---|---|---|---|---|---|
| Sapiens2-0.1B | 0,114 B | 0,342 T | 768 | 12 | 12 |
| Sapiens2-0.4B | 0,398 B | 1,260 T | 1024 | 24 | 16 |
| Sapiens2-0.8B | 0,818 B | 2,592 T | 1280 | 32 | 16 |
| Sapiens2-1B | 1,462 B | 4,715 T | 1536 | 40 | 24 |
| Sapiens2-1B-4K | 1,607 B | no disponible | 1536 | 40 | 24 |
| Sapiens2-5B | 5,071 B | 15,722 T | 2432 | 56 | 32 |

Frente a backbones genericos de vision como DINOv2 o CLIP, la informacion disponible no incluye datos de parametros, contexto ni rendimiento para establecer una comparacion numerica, por lo que no se ofrece dicha comparativa. La comparacion con alternativas de la misma categoria se limita, por tanto, a las variantes de la propia familia Sapiens2, todas ellas bajo la misma licencia y el mismo pipeline de extraccion de caracteristicas.

## Limitaciones y advertencias

- Es un backbone de extraccion de caracteristicas, no un modelo completo de tarea: para obtener salidas utiles (pose, segmentacion, normales, pointmaps) requiere cabezas de tarea afinadas que no se incluyen en este repositorio.
- Sesgos de dominio: el preentrenamiento se centra en imagenes de seres humanos, por lo que su rendimiento fuera de ese dominio no esta caracterizado en la informacion disponible.
- Riesgo de sesgo en los datos: no se detalla en la informacion proporcionada la composicion demografica, geografica ni de condiciones de captura del dataset de 1.000 millones de imagenes, lo que impide evaluar sesgos de representacion.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero las cabezas de tarea derivadas pueden producir predicciones incorrectas en oclusiones severas, posturas extremas o iluminacion adversa; no hay datos publicados al respecto.
- Limitaciones de contexto e idioma: el modelo no procesa lenguaje, por lo que no tiene capacidades multilingues ni ventana de contexto autorregresiva.
- Licencia: se distribuye bajo la Sapiens2 License, una licencia personalizada (`license: other`). Las condiciones exactas de uso comercial no se detallan en la informacion proporcionada; es imprescindible revisar el texto completo en el enlace de licencia indicado antes de cualquier uso en produccion.
- Naturaleza del repositorio: el checkpoint aqui listado es un espejo publicado por un tercero (`ml-resources`) y no una publicacion oficial de los autores originales. Para produccion conviene referenciar el repositorio oficial.
- Sin cuantizaciones oficiales publicadas: no se ofrecen variantes GGUF, AWQ, GPTQ ni similares, lo que limita el despliegue en entornos con restricciones fuertes de memoria.
- Sin benchmarks publicados: la ausencia de metricas verificables impide estimar con rigor la ganancia frente a backbones alternativos.

## Enlaces

- Repositorio en HuggingFace (espejo): https://huggingface.co/ml-resources/sapiens2-pretrain-5b
- Repositorio oficial en HuggingFace: https://huggingface.co/facebook/sapiens2-pretrain-5b
- Paper: https://arxiv.org/pdf/2604.21681
- Pagina del proyecto: https://rawalkhirodkar.github.io/sapiens2
- Codigo fuente: https://github.com/facebookresearch/sapiens2
- Licencia: https://github.com/facebookresearch/sapiens2/blob/main/LICENSE.md
- Coleccion Sapiens2 en HuggingFace: https://huggingface.co/collections/facebook/sapiens2
- Variante Sapiens2-0.1B: https://huggingface.co/facebook/sapiens2-pretrain-0.1b
- Variante Sapiens2-0.4B: https://huggingface.co/facebook/sapiens2-pretrain-0.4b
- Variante Sapiens2-0.8B: https://huggingface.co/facebook/sapiens2-pretrain-0.8b
- Variante Sapiens2-1B: https://huggingface.co/facebook/sapiens2-pretrain-1b
- Variante Sapiens2-1B-4K: https://huggingface.co/facebook/sapiens2-pretrain-1b-4k
