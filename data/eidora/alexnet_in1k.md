# EIDORA/AlexNet_IN1k

## Resumen

AlexNet_IN1k es un paquete de extraccion de caracteristicas de imagen publicado por EIDORA dentro de su model zoo. No es un modelo nuevo: se trata de una adaptacion del AlexNet clasico de ImageNet-1K, cuya arquitectura convolucional data de 2012 (Krizhevsky, Sutskever y Hinton). La modificacion de EIDORA consiste en exponer el vector de la segunda capa totalmente conectada (tras ReLU) como embedding de 4096 dimensiones L2-normalizado, en lugar de devolver las probabilidades de las 1000 clases de ImageNet.

El paquete se distribuye como un grafo ONNX (`model.onnx`) con esquema de runtime version 3 y declaracion de `CPUExecutionProvider`, lo que lo orienta a inferencia en CPU dentro del entorno EIDORA Desktop. El repositorio ocupa 0,2 GB y tiene 51 descargas en el momento de la consulta, sin likes.

Su relevancia es fundamentalmente metodologica: sirve como linea base CNN historica para comparar embeddings visuales frente a enfoques mas modernos como ResNet, DINO o CLIP, y para tareas sencillas de similitud y agrupamiento visual. No debe confundirse con un modelo generativo ni con un encoder multimodal: solo procesa imagenes y solo produce vectores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN AlexNet (5 capas convolucionales + 3 capas totalmente conectadas) |
| Parametros totales | no disponible (el modelo original AlexNet ronda los 60 M, pero la cifra no se declara en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 224 x 224 px) |
| Tipos de cuantizacion | no disponible (se distribuye en float32 ONNX) |
| Idiomas soportados | no aplica (modalidad imagen) |
| Licencia | `other`; el autor no afirma identificador de licencia para los pesos y senala que la documentacion de TorchVision no establece una licencia separada para los pesos preentrenados |
| Formato de pesos | ONNX (`model.onnx`), tensor de salida float32 |
| Dimension del embedding | 4096, L2-normalizado |
| Metrica de similitud | Similitud coseno |
| Entrada | `pixel_values` float32, forma `[batch, 3, 224, 224]`, layout NCHW |
| Preprocesado | RGB, resize lado corto a 256, center crop 224 x 224, interpolacion bilineal, truncate rounding, rescale 1/255 y normalizacion por canal |
| Media / desviacion | `[0.485, 0.456, 0.406]` / `[0.229, 0.224, 0.225]` |
| Proveedor declarado | `CPUExecutionProvider` (ONNX Runtime) |
| Version del paquete | 0.1.0, esquema 3 |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

La red es un AlexNet estandar: cinco capas convolucionales seguidas de tres capas densas, con ReLU como no linealidad. El checkpoint de origen es `torchvision/alexnet-imagenet1k-v1`, es decir, los pesos `alexnet-owt-7be5be79.pth` de TorchVision, entrenados de forma supervisada para clasificacion sobre ImageNet-1K. EIDORA no reentrena ni ajusta los pesos: convierte el grafo a ONNX y recorta la salida en la segunda capa totalmente conectada, despues de la ReLU, aplicando despues normalizacion L2.

No se documenta el numero de tokens ni la composicion del dataset mas alla de ImageNet-1K, ni se menciona RLHF, DPO ni ninguna etapa de alineacion, algo coherente con un modelo de 2012. Tampoco se declaran innovaciones tecnicas anadidas: no hay atencion lineal, decodificacion especulativa ni modulos hibridos. El valor del paquete esta en la reproducibilidad del preprocesado y en el contrato de runtime (`config.yaml` como fuente autoritativa de entradas, proveedor y dimension de embedding), no en el modelo en si.

## Capacidades

- Extraccion de embeddings de imagen: devuelve un vector float32 de 4096 dimensiones por imagen.
- Similitud y recuperacion visual: los vectores estan L2-normalizados, por lo que la similitud coseno es directamente aplicable.
- Agrupamiento de imagenes: adecuado para clustering exploratorio sobre colecciones pequenas o medianas.
- Linea base comparativa: permite contrastar caracteristicas CNN antiguas con ResNet, DINO y CLIP.
- Inferencia en CPU: el proveedor declarado es `CPUExecutionProvider` de ONNX Runtime.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No tiene capacidades multilingues ni procesa audio o video.
- No incluye modo thinking ni ninguna forma de razonamiento explicito.

## Casos de uso

- Linea base en evaluacion de encoders visuales: incluir AlexNet_IN1k como referencia historica al comparar ResNet, DINO o CLIP sobre el mismo conjunto de imagenes, midiendo la ganancia de los modelos modernos con una metrica comun (coseno sobre vectores normalizados).
- Busqueda de imagenes similares en un catalogo pequeno: indexar los embeddings de 4096 dimensiones y recuperar por vecino mas cercano coseno; el coste en CPU es bajo y el paquete ya trae el preprocesado resuelto.
- Deduplicacion y agrupamiento de imagenes: detectar near-duplicates o agrupar lotes de imagenes por similitud visual antes de un etiquetado manual, usando el embedding como descriptor.
- Docencia y formacion en vision por computador: ilustrar el pipeline completo (resize, center crop, normalizacion, extraccion de features, similitud coseno) con un modelo pequeno y bien documentado.
- Verificacion de pipelines de preprocesado: como el autor advierte que otros ajustes de resize producen embeddings distintos, el modelo sirve para comprobar que una implementacion reproduce exactamente el preprocesado documentado.
- Prototipado rapido en entornos sin GPU: al declarar `CPUExecutionProvider`, permite montar un servicio de embeddings en una maquina sin acelerador, util para demos y pruebas de concepto.
- Analisis exploratorio de archivos fotograficos: agrupar una coleccion personal por similitud visual para organizarla, asumiendo que la proximidad CNN no implica autoria ni significado comun.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de recuperacion, precision de clasificacion ni latencia. Tampoco se proporcionan cifras de throughput o tiempo de inferencia por imagen.

## Requisitos de hardware

- VRAM: no aplica en el modo declarado; la inferencia se declara sobre `CPUExecutionProvider`. El repositorio completo ocupa 0,2 GB, por lo que el grafo ONNX y los pesos caben holgadamente en memoria de sistema.
- GPU recomendadas: no disponibles; el paquete no declara proveedores CUDA o TensorRT. Podria ejecutarse con otros execution providers de ONNX Runtime si el entorno los ofrece, pero no esta documentado.
- GPU de consumo: no se documenta compatibilidad con RTX 4090, RTX 3090 ni similares. En el estado actual, el uso previsto es CPU.
- Despliegue: ONNX Runtime con `CPUExecutionProvider` es la via declarada. No hay indicios de soporte de vLLM, llama.cpp, Ollama o TGI, que ademas estan orientados a modelos de lenguaje y no a este tipo de encoder.
- Latencia y throughput: no disponibles. AlexNet es una red pequena para los estandares actuales, pero no se aportan numeros medidos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| EIDORA/AlexNet_IN1k | CNN (AlexNet) | no disponible | imagen 224 x 224 | embedding 4096, L2 | `other` (sin licencia de pesos afirmada) | HuggingFace, ONNX |
| torchvision alexnet (IMAGENET1K_V1) | CNN (AlexNet) | ~60 M (cifra no declarada en la ficha) | imagen 224 x 224 | 1000 clases | BSD-3-Clause para la libreria; pesos sin licencia separada establecida | PyTorch / TorchVision |
| ResNet-50 | CNN residual | no disponible en esta ficha | imagen 224 x 224 | 1000 clases o features | no disponible | amplia, multiple formato |
| DINO / CLIP | Transformer / multimodal | no disponible en esta ficha | imagen (y texto en CLIP) | embedding | no disponible | amplia |

La comparacion cuantitativa de rendimiento entre estas alternativas no esta disponible en la informacion proporcionada. Cualitativamente, AlexNet es anterior a ResNet y a los encoders basados en transformer, y su uso aqui es como referencia historica, no como opcion competitiva en calidad de embedding.

## Limitaciones y advertencias

- El modelo fue entrenado para clasificacion en ImageNet, no para interpretacion cultural o historica; la model card lo advierte explicitamente.
- La proximidad entre caracteristicas CNN no demuestra autoria comun, identidad ni significado compartido; no debe usarse para inferir esas relaciones.
- Cambiar los ajustes de resize, interpolacion o rounding produce embeddings distintos; el `config.yaml` es la fuente autoritativa y la normalizacion no debe aplicarse dos veces.
- Licencia ambigua: el identificador es `other` y el autor declara que no afirma licencia para los pesos preentrenados. La ausencia de fichero `LICENSE` en el repositorio no debe interpretarse como permiso ni como prohibicion, por lo que el uso comercial requiere verificacion juridica previa.
- No hay informacion sobre sesgos; al derivar de ImageNet, es razonable esperar los sesgos de ese dataset, pero no se documentan.
- Riesgo de alucinacion no aplica en sentido generativo, pero si existe riesgo de falsa similitud: vectores cercanos no implican equivalencia semantica.
- El alcance de modalidad es exclusivamente imagen; no admite texto, audio ni video.
- La version es 0.1.0 con 51 descargas y sin likes: ecosistema minimo, poca validacion externa y riesgo de que el contrato de runtime cambie entre versiones del esquema.
- Depende del entorno EIDORA Desktop y de la version instalada de ONNX Runtime para la disponibilidad real de ejecucion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EIDORA/AlexNet_IN1k
- Documentacion de AlexNet en TorchVision: https://pytorch.org/vision/stable/models/generated/torchvision.models.alexnet.html
- Pesos originales (IMAGENET1K_V1): https://download.pytorch.org/models/alexnet-owt-7be5be79.pth
- Paper original (NeurIPS 2012): https://proceedings.neurips.cc/paper/2012/hash/c399862d3b9d6b76c8436e924a68c45b-Abstract.html
