# CodeATNC/vit-beans-demo

## Resumen

vit-beans-demo es un checkpoint de clasificacion de imagenes publicado por el usuario CodeATNC en HuggingFace. Se trata de un ajuste fino (fine-tuning) supervisado del modelo google/vit-base-patch16-224-in21k, un Vision Transformer de tipo base con parches de 16x16 y resolucion de entrada de 224x224 pixeles, preentrenado originalmente sobre ImageNet-21k. El checkpoint resultante tiene 85.800.963 parametros y se distribuye en formato safetensors bajo licencia Apache 2.0.

El modelo no es un modelo generativo ni un LLM: es un clasificador de imagenes. Su relevancia es la de un artefacto de demostracion de un flujo de fine-tuning con la libreria Transformers y el Trainer, no la de un modelo listo para produccion. La model card fue generada automaticamente y no documenta ni el conjunto de datos de entrenamiento (se indica explicitamente "unknown dataset"), ni el numero de clases de salida, ni las etiquetas que predice.

El repositorio acumula 0 descargas y 0 likes en el momento de la consulta, con un tamano de 1,7 GB. Toda la informacion disponible procede de la model card del autor, que declara una perdida de evaluacion de 0,1358 y una exactitud de 0,9688 sobre un conjunto de evaluacion no descrito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base), encoder transformer de 12 capas con parches de 16x16 y resolucion de entrada de 224x224 px |
| Parametros totales | 85.800.963 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision: la imagen de 224x224 px se tokeniza en 196 parches mas el token [CLS]) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos safetensors en su precision original; no se declaran variantes GGUF, int8 ni fp16) |
| Idiomas soportados | no disponible (no aplica: clasificacion de imagenes; la model card no declara idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Tarea declarada | image-classification |
| Modelo base | google/vit-base-patch16-224-in21k |
| Numero de clases de salida | no disponible |
| Tamano del repositorio | 1,7 GB |
| Fecha de creacion / actualizacion | 2026-09-15 / 2026-09-15 |

## Arquitectura y entrenamiento

La arquitectura es la de un Vision Transformer estandar de configuracion base: la imagen se divide en parches de 16x16 pixeles, cada parche se proyecta linealmente a un espacio de embeddings y la secuencia resultante (196 parches mas un token [CLS]) se procesa mediante un encoder transformer con atencion global. La clasificacion se realiza a partir de la representacion del token [CLS] proyectada sobre la cabeza de clasificacion. Al partir de google/vit-base-patch16-224-in21k, el backbone fue preentrenado sobre ImageNet-21k antes del ajuste fino.

Respecto al entrenamiento, la model card indica un fine-tuning supervisado con los siguientes hiperparametros: learning rate 5e-05, train_batch_size 16, eval_batch_size 16, semilla 42, optimizador AdamW (variante fused) con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 20 pasos de calentamiento y 4 epocas completas (260 pasos, 65 por epoca). El entrenamiento se ejecuto con PyTorch 2.14.0+cpu, Transformers 5.17.0, Datasets 5.0.1 y Tokenizers 0.23.2. No se documenta el conjunto de datos, su composicion, su tamano ni si se aplicaron tecnicas de aumento de datos, regularizacion adicional o ajuste por preferencias.

## Capacidades

- Clasificacion de imagenes: produce una etiqueta (y, en su caso, una distribucion de probabilidad) para una imagen de entrada, dentro del conjunto de clases aprendido durante el fine-tuning. El numero y la identidad de esas clases no estan documentados.
- Extraccion de caracteristicas: el encoder ViT puede utilizarse como backbone para obtener embeddings de imagen y alimentar otros clasificadores o sistemas de recuperacion visual.
- Inferencia por lotes: el modelo admite procesamiento por lotes, con un tamano de lote de al menos 16 en la fase de evaluacion del entrenamiento.
- Punto de partida para nuevo fine-tuning: al estar en formato transformers y con licencia Apache 2.0, puede reentrenarse sobre otros conjuntos de imagenes.
- Integracion con el ecosistema Transformers: dispone del tag endpoints_compatible, lo que indica compatibilidad con los endpoints de inferencia de HuggingFace.
- No soporta generacion de texto, razonamiento, codigo, matematicas ni tool calling / function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingues (no procesa texto).
- No dispone de modo de pensamiento (thinking mode), audio ni comprension visual generativa: su salida es exclusivamente una etiqueta de clasificacion.

## Casos de uso

- Prototipo y demostracion de fine-tuning: sirve como ejemplo reproducible de un ajuste fino de ViT-Base con el Trainer, util en docencia o en documentacion interna de equipos de vision por computador.
- Clasificacion de imagenes en el dominio de entrenamiento: si se documentase el conjunto de datos y las etiquetas, el modelo podria etiquetar imagenes de ese mismo dominio con una exactitud declarada de 0,9688 sobre el conjunto de evaluacion del autor. No es posible confirmar hoy ese uso porque las clases son desconocidas.
- Preetiquetado en pipelines de anotacion: usar el modelo para generar etiquetas preliminares sobre imagenes del dominio y que un anotador humano las revise, reduciendo el coste de anotacion manual. Requiere validar antes la precision en el dominio diana.
- Extraccion de embeddings para busqueda visual: congelar el encoder y generar vectores de imagen para indexar en una base vectorial y construir un sistema de recuperacion por similitud.
- Transfer learning para una tarea concreta: partir de este checkpoint en lugar de partir del ViT original, aprovechando el ajuste previo, y reentrenar la cabeza de clasificacion sobre un conjunto etiquetado propio.
- Inferencia en CPU o en dispositivos con recursos limitados: con 85,8 millones de parametros y resolución 224x224, el modelo cabe en memoria de sistemas sin GPU dedicada, lo que permite desplegarlo en servicios de baja concurrencia o en el borde.
- Filtrado previo de imagenes en un pipeline de vision: descartar o separar imagenes que no correspondan al dominio aprendido antes de pasarlas a un modelo mas costoso.

## Benchmarks y rendimiento

El model-index publicado por el autor no contiene resultados (`results: []`). Los unicos datos disponibles son los declarados en el cuerpo de la model card para el conjunto de evaluacion del propio entrenamiento:

| Metrica | Valor |
|---|---|
| Loss (evaluacion final) | 0,1358 |
| Accuracy (evaluacion final) | 0,9688 |
| Conjunto de evaluacion | no descrito (tamano, composicion y etiquetas no disponibles) |

Evolucion por epoca declarada por el autor:

| Training loss | Epoca | Paso | Validation loss | Accuracy |
|:---:|:---:|:---:|:---:|:---:|
| 0,2754 | 1.0 | 65 | 0,2029 | 0,9699 |
| 0,1420 | 2.0 | 130 | 0,1163 | 0,9850 |
| 0,1234 | 3.0 | 195 | 0,1239 | 0,9699 |
| 0,1246 | 4.0 | 260 | 0,1174 | 0,9699 |

No se han publicado resultados de benchmarks estandar (ImageNet, MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible, y los benchmarks de texto no aplican a un modelo de clasificacion de imagenes.

## Requisitos de hardware

- Peso de los pesos en memoria: aproximadamente 343 MB en fp32 (85,8 M de parametros x 4 bytes), unos 172 MB en fp16 y unos 86 MB en int8. Calculo estimado a partir del numero de parametros.
- VRAM estimada para inferencia: menos de 1 GB en fp16 para lote de tamano 1 a 224x224 px, y del orden de 1,5-2 GB en fp32 incluyendo activaciones. Cifras estimadas, no medidas por el autor.
- Si cabe en GPU de consumo: si, en practicamente cualquier GPU con 2 GB o mas de memoria (GTX 1050 Ti, GTX 1650, RTX 3050, RTX 3060, RTX 4090). Las tarjetas de gama alta quedan sobredimensionadas para este modelo.
- Inferencia en CPU: viable, dado que el propio entrenamiento se ejecuto con PyTorch 2.14.0+cpu y el modelo tiene 85,8 M de parametros.
- GPU de centro de datos: A100, H100, L4 o T4 son compatibles pero muy superiores a lo necesario para un ViT-Base; su uso solo se justifica por agregacion de muchos modelos o por lotes masivos.
- Opciones de despliegue: pipeline de transformers, HuggingFace Inference Endpoints (el modelo lleva el tag endpoints_compatible), exportacion a ONNX Runtime, TensorRT, OpenVINO o TorchScript, y servidores de inferencia genericos como Triton o TorchServe. No aplican llama.cpp, Ollama ni GGUF, al no ser un modelo generativo de texto.
- Latencia y throughput: no disponibles. Dependen por completo del hardware, del framework de despliegue y del tamano de lote.

## Comparativa con modelos similares

No existe un conjunto de evaluacion comun publicado que permita comparar el rendimiento de este checkpoint con alternativas, porque el conjunto de datos de entrenamiento y evaluacion no esta descrito. La comparacion se limita a caracteristicas estructurales:

| Modelo | Parametros (aprox.) | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| CodeATNC/vit-beans-demo | 85,8 M | 224x224 px | apache-2.0 | HuggingFace, safetensors, endpoints_compatible |
| google/vit-base-patch16-224-in21k | ~86 M | 224x224 px | apache-2.0 | HuggingFace, pesos originales, altamente usado |
| DeiT-Base (facebook/deit-base-distilled-patch16-224) | ~86 M | 224x224 px | apache-2.0 | HuggingFace, con destilacion desde un teacher |
| ConvNeXt-Tiny | ~28,6 M | 224x224 px | apache-2.0 (variante oficial) | HuggingFace, CNN moderna |
| ResNet-50 | ~25,6 M | 224x224 px | licencia de referencia según implementacion | Amplia disponibilidad, muy extendido |

Comparativa de rendimiento: no disponible. El modelo solo declara accuracy 0,9688 sobre un conjunto de evaluacion propio no descrito, por lo que no es metodologicamente valido compararlo con las cifras de ImageNet u otros benchmarks publicos de los modelos anteriores.

## Limitaciones y advertencias

- Conjunto de datos no documentado: la model card indica que el entrenamiento se hizo sobre un "unknown dataset". Se desconoce el dominio real, el numero de clases, la distribucion de etiquetas y el proceso de recogida de datos.
- Metricas sin contexto: la exactitud de 0,9688 y la perdida de 0,1358 corresponden a un conjunto de evaluacion no descrito (tamano, procedencia y posible solapamiento con el conjunto de entrenamiento), por lo que no pueden interpretarse como rendimiento generalizable.
- Indicios de sobreajuste o de estancamiento: la exactitud de validacion sube a 0,9850 en la epoca 2 y cae a 0,9699 en las epocas 3 y 4, mientras la perdida de entrenamiento sigue bajando.
- Model card autogenerada: las secciones "Model description", "Intended uses & limitations" y "Training and evaluation data" contienen el texto "More information needed". No hay guia del autor sobre uso previsto.
- Sin validacion de la comunidad: 0 descargas y 0 likes. No hay terceros que hayan reproducido ni auditado los resultados.
- Sesgos desconocidos: al no publicarse la composicion del dataset, no es posible evaluar sesgos de dominio, de iluminacion, de geografia ni de representacion de clases.
- Riesgo de clasificaciones erroneas con alta confianza: no se documenta calibracion de probabilidades ni umbrales de decision. El termino "alucinacion" no aplica, pero si el error de clasificacion silencioso.
- Limitacion de entrada: el modelo espera imagenes de 224x224 px en formato RGB; no procesa texto, audio ni secuencias, y no mantiene contexto conversacional.
- Dominio cerrado: cualquier imagen fuera de la distribucion de entrenamiento puede producir predicciones sin sentido, sin que el modelo lo advierta.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero se concede sin garantias. Al derivar de google/vit-base-patch16-224-in21k (tambien Apache 2.0), no se anaden restricciones conocidas; conviene verificar los terminos del modelo base y del dataset usado, que no esta identificado.
- Advertencia para produccion: no debe desplegarse en un sistema real sin identificar el conjunto de datos, verificar el espacio de etiquetas y validar el rendimiento sobre un conjunto de prueba independiente y representativo del dominio objetivo.
- Fechas del repositorio: la creacion y la ultima actualizacion figuran como 2026-09-15, posteriores a las versiones de framework declaradas; no hay mas artefactos que permitan auditar el historial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CodeATNC/vit-beans-demo
- Modelo base: https://huggingface.co/google/vit-base-patch16-224-in21k
- Papers, repositorios, blogs o demos adicionales: no disponible en la informacion proporcionada.
