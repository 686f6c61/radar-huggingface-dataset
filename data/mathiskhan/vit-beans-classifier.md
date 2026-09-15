# MathisKhan/vit-beans-classifier

## Resumen

vit-beans-classifier es un modelo de clasificacion de imagenes publicado por el usuario MathisKhan en HuggingFace. Se trata de un fine-tuning de google/vit-base-patch16-224-in21k, un Vision Transformer de tipo base con parches de 16x16 y resolucion de entrada de 224x224 pixeles. El modelo resultante tiene 85.800.963 parametros (aproximadamente 86 millones) y un peso de repositorio de 1,4 GB, coherente con pesos en fp32.

El modelo se distribuye bajo licencia Apache-2.0, con pesos en formato safetensors y compatibilidad con la libreria transformers (pipeline `image-classification`). La model card fue generada automaticamente por el Trainer de HuggingFace e indica que el entrenamiento se realizo sobre un dataset no documentado ("on an unknown dataset"), con 3 epocas, learning rate 5e-05, batch size de 16 y optimizador AdamW con betas (0.9, 0.999). No se especifica el numero de clases, las etiquetas ni la composicion del conjunto de datos.

Su relevancia es limitada: es un modelo de nicho, sin descargas ni likes en el momento de la consulta, sin resultados en el model-index oficial y sin documentacion de uso previsto. Resulta util como ejemplo reproducible de fine-tuning de ViT con `Trainer` y como posible clasificador de hojas de judia si se confirma esa tarea (el nombre "beans" lo sugiere, pero la model card no lo confirma en ningun momento).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base, patch 16x16, entrada 224x224 px), derivada del modelo base google/vit-base-patch16-224-in21k |
| Parametros totales | 85.800.963 (dato real de safetensors) |
| Longitud de contexto | No aplicable (modelo de vision). Entrada fija de 224x224 px, equivalente a 196 parches de 16x16 mas el token CLS |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors; no hay variantes cuantizadas oficiales) |
| Idiomas soportados | No disponible (modelo de clasificacion de imagenes, no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

Otros datos de la ficha:

| Parametro | Valor |
|---|---|
| Pipeline | image-classification |
| Numero de clases | No disponible |
| Resolucion de entrada | 224x224 px |
| Tamano del repositorio | 1,4 GB |
| Modelo base | google/vit-base-patch16-224-in21k |
| Fecha de creacion | 2026-09-15 |
| Fecha de ultima actualizacion | 2026-09-15 |
| Descargas / likes | 0 / 0 |
| Compatibilidad con endpoints | Si (tag `endpoints_compatible`) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un Vision Transformer estandar. La imagen de entrada se divide en parches de 16x16 (196 parches para 224x224 px), cada parche se proyecta linealmente a un embedding y se anade un token CLS; la secuencia resultante pasa por bloques de self-attention multi-cabeza y MLP, y la representacion final del token CLS se usa como cabecera de clasificacion. El modelo base google/vit-base-patch16-224-in21k fue preentrenado en ImageNet-21k (14 millones de imagenes, 21.843 clases), pero la model card no aporta el numero de tokens, imagenes o pasos del preentrenamiento ni de la fase de fine-tuning.

Respecto al entrenamiento del fine-tuning, la model card solo documenta los hiperparametros y los resultados por epoca: 3 epocas, learning rate 5e-05, batch de entrenamiento y evaluacion de 16, semilla 42, optimizador AdamW con betas (0.9, 0.999) y epsilon 1e-08, scheduler lineal. No se indica si hubo aumento de datos, congelacion de capas, ni ninguna tecnica adicional como RLHF, DPO o destilacion (no aplicables a un clasificador). Tampoco se documenta el dataset, el numero de clases ni el tamano del conjunto de evaluacion, lo que impide valorar la significacion estadistica de las metricas declaradas. Las versiones de framework usadas fueron Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.8.5 y Tokenizers 0.23.1.

## Capacidades

- Clasificacion de imagenes: el pipeline declarado es `image-classification`, de modo que asigna una etiqueta (o una distribucion sobre etiquetas) a una imagen de entrada. El numero y los nombres de las clases no estan documentados.
- Extraccion de caracteristicas visuales: al derivar de ViT-Base, las representaciones del token CLS o de los parches pueden reutilizarse como embeddings para tareas posteriores, aunque no es una capacidad declarada por el autor.
- Inferencia por lotes: al ser un modelo transformers estandar, admite batching mediante `pipeline` o `AutoModelForImageClassification`.
- No soporta generacion de texto, razonamiento, codigo, matematicas ni vision-lenguaje: no hay modulo de lenguaje ni cabecera de generacion.
- No soporta tool calling, function calling ni uso como agente.
- Capacidades multilingues: no aplicable, no procesa texto.
- Capacidades especiales (modo thinking, audio, video, OCR): no disponibles y no declaradas.

## Casos de uso

Nota: la model card no documenta la tarea ni las clases, asi que los casos siguientes asumen que el modelo clasifica hojas de judia (inferencia a partir del nombre y de la metrica de accuracy declarada). Deben validarse antes de cualquier uso real.

- Clasificacion de enfermedades foliares en cultivos de judia: dado que el modelo tiene una cabecera de clasificacion entrenada con una accuracy declarada de 0,9609 en el conjunto de evaluacion del autor, podria usarse para etiquetar fotografias de hojas y distinguir entre clases como roya, mancha angular o hoja sana, siempre que la taxonomia coincida con la del entrenamiento.
- Pre-etiquetado de datasets agricolas: el modelo puede ejecutarse sobre un lote de imagenes sin etiquetar para generar etiquetas preliminares que despues revise un experto, reduciendo el coste de anotacion manual en proyectos de vision en agricultura.
- Monitorizacion en campo con dispositivos de borde: con 85,8 millones de parametros y pesos de aproximadamente 172 MB en fp16 o 86 MB en int8, el modelo cabe en placas como Raspberry Pi 5 o Jetson Orin Nano, lo que permite inferencia local sin conectividad en invernaderos o parcelas.
- Aplicacion movil de diagnostico rapido: al ser un modelo pequeno, se puede exportar a ONNX o TorchScript e integrar en una app Android/iOS para que el agricultor fotografíe una hoja y obtenga una prediccion en el dispositivo.
- Control de calidad en la industria agroalimentaria: en una linea de procesado de judia, el modelo podria clasificar imagenes de producto capturadas por una camara industrial y separar lotes con signos visibles de enfermedad, integrándose en un PLC o en un sistema de vision existente.
- Filtrado previo en pipelines de teledeteccion: como primera etapa de un sistema que procesa imagenes de dron o satelite, el modelo puede descartar o marcar imagenes que contengan hojas afectadas, dejando el analisis fino a un modelo mayor o a un agronomo.
- Base para fine-tuning posterior: al ser un ViT-Base ya adaptado a un dominio vegetal (si se confirma), puede servir como punto de partida para reentrenar con un dataset propio de otro cultivo o de otra taxonomia de enfermedades, aprovechando el preentrenamiento en ImageNet-21k.
- Docencia y reproducibilidad de pipelines: el repositorio incluye todos los hiperparametros y el flujo de `Trainer`, por lo que es un ejemplo util para ensenar fine-tuning de ViT en un curso de vision por computador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model-index oficial del repositorio esta vacio (`"results": []`), de modo que no hay metricas estandar como ImageNet top-1, MMLU o similares.

Lo unico disponible son las metricas declaradas por el autor en la model card, calculadas sobre un conjunto de evaluacion no documentado (numero de muestras y composicion desconocidos):

| Metrica | Valor |
|---|---|
| Loss de evaluacion | 0,1606 |
| Accuracy de evaluacion | 0,9609 |

Resultados por epoca declarados en la model card:

| Epoca | Paso | Validation loss | Accuracy |
|---|---|---|---|
| 1.0 | 65 | 0,1438 | 0,9925 |
| 2.0 | 130 | 0,0851 | 0,9925 |
| 3.0 | 195 | 0,0937 | 0,9774 |

La accuracy final reportada (0,9609) corresponde a la evaluacion al terminar el entrenamiento y es inferior a la de las epocas 1 y 2, lo que sugiere un ligero sobreajuste a partir de la segunda epoca. Con solo 65 pasos por epoca (batch 16), el conjunto de entrenamiento es pequeno, del orden de un millar de imagenes o menos, dato no confirmado.

## Requisitos de hardware

- VRAM para pesos: aproximadamente 344 MB en fp32, 172 MB en fp16/bf16 y 86 MB en int8 (estimacion a partir de los 85,8 millones de parametros).
- VRAM total en inferencia: por debajo de 1 GB incluyendo activaciones si se usa batch pequeno (1-16). Con batch grande y fp32 puede acercarse a 1-2 GB.
- GPU recomendadas: cualquier GPU moderna sirve. No requiere A100 ni H100; una RTX 3060, RTX 4090, T4 o incluso una GPU integrada reciente son mas que suficientes. El modelo esta claramente sobredimensionado para su coste de computo.
- GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo con al menos 2 GB de VRAM (GTX 1050 Ti, GTX 1650, RTX 2060, RTX 3060, RTX 4060, RTX 4090). Tambien es viable en CPU: una imagen de 224x224 se procesa en decenas de milisegundos en un procesador moderno.
- Despliegue: `transformers` con `pipeline("image-classification")` o `AutoModelForImageClassification`; exportacion a ONNX / ONNX Runtime o TorchScript para produccion; servidores de inferencia como Triton o TorchServe; Vertex AI / Hugging Face Inference Endpoints (el repositorio lleva el tag `endpoints_compatible`). vLLM, llama.cpp, Ollama y TGI no son aplicables: estan orientados a modelos de lenguaje, no a clasificadores de imagen.
- Edge: viable en Raspberry Pi 5, Jetson Nano/Orin Nano o Coral con exportacion a ONNX/TFLite.
- Latencia y throughput: no disponibles. No se han publicado mediciones del autor ni de terceros.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MathisKhan/vit-beans-classifier | 85.800.963 | Clasificacion de imagenes (clases no documentadas) | 224x224 px | Apache-2.0 | HuggingFace, transformers |
| google/vit-base-patch16-224-in21k (modelo base) | ~86 millones (referencia general, no de la informacion proporcionada) | Preentrenamiento en ImageNet-21k; requiere cabecera para clasificar | 224x224 px | Apache-2.0 | HuggingFace, transformers |
| google/vit-base-patch16-224 | ~86 millones (referencia general) | Clasificacion en ImageNet-1k (1000 clases) | 224x224 px | Apache-2.0 | HuggingFace, transformers |
| microsoft/resnet-50 | ~25,6 millones (referencia general) | Clasificacion en ImageNet-1k | 224x224 px | MIT (referencia general) | HuggingFace, transformers |

Advertencia: los parametros y licencias de los modelos comparativos son valores de referencia general y no proceden de la informacion proporcionada en esta ficha; deben verificarse en sus respectivas paginas antes de usarlos en una decision tecnica. No hay datos de benchmark comparativos disponibles, porque el model-index de vit-beans-classifier esta vacio y la model card no reporta evaluacion en ImageNet ni en ningun otro conjunto publico. La comparacion solo puede hacerse, por tanto, en terminos de tamano, licencia y disponibilidad.

## Limitaciones y advertencias

- Dataset de entrenamiento no documentado: la model card indica explicitamente "on an unknown dataset". Se desconoce el numero de imagenes, la procedencia, el numero de clases y las etiquetas.
- Uso previsto no documentado: las secciones "Model description", "Intended uses & limitations" y "Training and evaluation data" contienen solo "More information needed". No hay ninguna garantia de que el modelo funcione fuera del conjunto de evaluacion del autor.
- Significacion estadistica desconocida: con 65 pasos por epoca y batch 16, el conjunto de entrenamiento es muy pequeno, y no se indica el tamano del conjunto de evaluacion. La accuracy de 0,9609 puede tener un intervalo de confianza amplio.
- Sobreajuste probable: la accuracy cae de 0,9925 en las epocas 1 y 2 a 0,9774 en la epoca 3, y la metrica final de evaluacion (0,9609) es inferior a la de epocas intermedias.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si hay riesgo de predicciones erroneas con alta confianza en imagenes fuera de distribucion (otras especies vegetales, iluminacion distinta, fondos no vistos en entrenamiento). No se ha publicado calibracion ni umbral de confianza.
- Sesgos: no evaluados. Al derivar de ImageNet-21k, puede heredar sesgos de ese corpus en cuanto a iluminacion, resolucion, geografia y tipo de camara.
- Limitaciones de idioma: no aplicable (no procesa texto).
- Limitacion de entrada: la resolucion esta fijada a 224x224 px. Imagenes con detalles finos (lesiones pequenas) pueden perder informacion tras el redimensionado.
- Licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de copyright, se incluya una copia de la licencia y se indique si se han hecho cambios. No hay clausulas de uso aceptable adicionales, pero conviene verificar tambien la licencia del modelo base (google/vit-base-patch16-224-in21k, Apache-2.0) y de los datos de entrenamiento, que aqui se desconocen.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay issues, demos ni evaluaciones de terceros.
- Uso en produccion: no recomendable sin una reevaluacion sobre un conjunto de test propio, representativo del dominio objetivo, y sin documentar previamente las clases de salida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MathisKhan/vit-beans-classifier
- Modelo base: https://huggingface.co/google/vit-base-patch16-224-in21k
- Paper de referencia de ViT (no citado en la model card, enlace de contexto): https://arxiv.org/abs/2010.11929
- Repositorio de transformers: https://github.com/huggingface/transformers
- No se han encontrado en la busqueda web enlaces relevantes al modelo: los resultados devueltos corresponden a documentacion de Google Docs y a discusiones sobre otros modelos, sin relacion con este repositorio.
