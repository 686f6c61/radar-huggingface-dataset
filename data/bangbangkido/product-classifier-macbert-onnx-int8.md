# bangbangkido/Product-Classifier-MacBERT-ONNX-INT8

## Resumen

Product-Classifier-MacBERT-ONNX-INT8 es un paquete de despliegue en CPU para clasificar titulos de producto en chino en 27 categorias. Lo publica el usuario bangbangkido y se obtiene por cuantizacion dinamica del grafo ONNX FP32 de su propio modelo Product-Classifier-MacBERT, que a su vez parte de un encoder MacBERT chino (variante base) con una cabeza de clasificacion de 27 clases. El resultado es un unico fichero ONNX de 152.770.306 bytes que se ejecuta con ONNX Runtime y CPUExecutionProvider, sin PyTorch, sin CUDA y sin necesidad de descargar los pesos del modelo base.

El problema que resuelve es acotado pero muy comun en comercio electronico: etiquetar titulos cortos de producto (por ejemplo, "蓝牙耳机 主动降噪 入耳式") en una taxonomia fija de 27 categorias, con un coste de inferencia bajo y un despliegue trivial en servidores sin GPU. La entrada esta fijada a 32 tokens, incluidos los tokens especiales, y los titulos mas largos se truncan; el lote (batch) es variable.

La relevancia de esta publicacion no esta en la arquitectura, que es un transformer encoder tipo BERT sin innovaciones, sino en el empaquetado: reduce el grafo un 62,46 % y mantiene la accuracy en el 93,20 % frente al 93,45 % del FP32 sobre un subconjunto de 2.000 muestras de validacion, con una tasa de coincidencia Top-1 del 98,55 %. Es, en la practica, una pieza de infraestructura para preprocesar catalogos, no un modelo generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT, familia MacBERT china (variante base, `hfl/chinese-macbert-base`) con cabeza de clasificacion de 27 clases |
| Parametros totales | No declarados por el autor; el grafo ONNX FP32 de origen ocupa 406.993.961 bytes, equivalente a unos 102 M de parametros en FP32 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 32 tokens de entrada, incluidos los tokens especiales; truncamiento automatico de titulos mas largos |
| Tipos de cuantizacion | INT8 dinamica (dynamic U8S8), per-channel y con `reduce_range`; la cabeza de clasificacion se mantiene en FP32. Existe grafo FP32 de referencia (406.993.961 bytes) |
| Idiomas soportados | Chino (`zh`) |
| Licencia | No disponible: el repositorio no declara licencia nueva y remite a la licencia del modelo base `hfl/chinese-macbert-base` |
| Formato de pesos | ONNX (`model.int8.onnx`, 152.770.306 bytes, SHA-256 `d2c48988a0cd5ef0450323407c2b54ba786a46ed2da5c50ffa68e1e10a8c1d44`); tokenizer en `tokenizer.json` y `vocab.txt`; etiquetas en `labels.json` |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer estilo BERT (MacBERT chino, variante base) con una cabeza de clasificacion sobre el token `[CLS]` que proyecta a 27 logits. El modelo no introduce mecanismos de atencion lineal, decodificacion especulativa ni mezcla de expertos: es un clasificador discriminativo clasico. La entrada se serializa como `input_ids` y `attention_mask` de tipo int64 con forma `[batch, 32]`, y la salida es `logits` float32 con forma `[batch, 27]`; la categoria se obtiene con `argmax` sobre la ultima dimension y se mapea con `labels.json`.

El entrenamiento original corresponde al modelo Product-Classifier-MacBERT, con version `20261028-170527-431825_seq32_bs512_lr2e-05_ep60_seed42_samplesall`, lo que indica una longitud de secuencia de 32, tamano de lote de 512, tasa de aprendizaje 2e-5, 60 epocas y semilla 42. No se detalla en la informacion disponible el volumen de tokens, la composicion del corpus ni si hubo RLHF o DPO (procedimiento poco habitual en un clasificador de este tipo). La innovacion tecnica destacable es exclusivamente la cuantizacion: cuantizacion dinamica sin muestras de calibracion, aplicada al grafo ONNX FP32, que reduce el fichero un 62,46 % (de 406.993.961 a 152.770.306 bytes) manteniendo la cabeza en FP32. INT8 y FP32 comparten tokenizer, etiquetas y `max_length=32`, de modo que el cambio se hace sustituyendo el fichero del modelo.

## Capacidades

- Clasificacion de texto en 27 categorias de producto a partir de titulos cortos en chino, con salida de logits y probabilidades derivables por softmax.
- Inferencia por lotes con tamano de batch variable sobre entradas de 32 tokens fijas.
- Ejecucion en CPU pura mediante ONNX Runtime con `CPUExecutionProvider`; no requiere PyTorch, CUDA ni los pesos del modelo base.
- Funcionamiento completamente offline una vez descargado el repositorio (0,2 GB).
- Integracion sencilla en pipelines: solo depende de `onnxruntime`, `tokenizers` y `numpy`, segun `requirements.txt`.
- Compatibilidad declarada mediante etiquetas con `text-embeddings-inference` y `endpoints_compatible`, lo que sugiere su uso en infraestructura de Inference Endpoints de Hugging Face.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, vision, audio ni generacion de texto libre: es un clasificador discriminativo.

## Casos de uso

- Etiquetado automatico de catalogos de marketplace: cada titulo se envia como una fila del lote (`[batch, 32]`) y la categoria se obtiene con `argmax`; el modelo cabe en un contenedor ligero y procesa lotes grandes en CPU.
- Enrutamiento de publicaciones de vendedores: al dar de alta un producto, el clasificador asigna la categoria inicial de forma automatica y evita el paso manual en el formulario, con la posibilidad de aplicar un umbral de confianza para los casos dudosos.
- Normalizacion retroactiva de taxonomias: reclasificar un catalogo historico completo en una migracion de categorias, ejecutando el modelo en lote sobre un servidor sin GPU y comparando con la taxonomia antigua.
- Construccion de facetas y filtros de busqueda: la categoria predicha se usa como atributo indexable para refinar la busqueda, con la ventaja de que el coste por documento es minimo al ser un modelo de 153 MB.
- Triaje previo en moderacion de contenido: deteccion de titulos que caen en categorias reguladas o sensibles (por ejemplo, `汽车用品` o `医疗` si existiera en la taxonomia) para derivar a revision humana, no como decision final.
- Preprocesado en pipelines de recomendacion o pricing: la categoria sirve como feature categorica de bajo coste antes de un modelo de ranking, ejecutable en la misma maquina que el resto del pipeline.
- Despliegue en entornos sin GPU: sedes con servidores modestos, appliances on-premise o contenedores con CPU limitada, donde un modelo FP32 de 407 MB o un transformer en PyTorch no serian viables por requisitos de memoria o de dependencias.
- Sustitucion del modelo FP32 en produccion para reducir el uso de disco y memoria: el autor documenta que basta con reemplazar el fichero del modelo manteniendo tokenizer y etiquetas.

## Benchmarks y rendimiento

Los unicos datos publicados son la validacion de cuantizacion sobre un subconjunto de 2.000 muestras de validacion (semilla 42), con ONNX Runtime `CPUExecutionProvider` y batch=1. El autor advierte que estas cifras no son comparables con las metricas PyTorch sobre el conjunto completo de validacion (11.059 muestras), que no se publican en esta ficha.

| Metrica | ONNX FP32 | ONNX INT8 |
|---|---:|---:|
| Accuracy | 93,45 % | 93,20 % |
| Top-1 (coincidencia con FP32) | no aplica | 98,55 % |
| Tamano del fichero | 406.993.961 bytes | 152.770.306 bytes |
| Reduccion de tamano | no aplica | 62,46 % |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks generales en la informacion disponible; no aplican a un clasificador de 27 clases.

## Requisitos de hardware

- VRAM estimada: practicamente nula. El modelo INT8 ocupa 152,8 MB en disco y una cantidad similar en memoria al cargarse; el grafo FP32 equivalente ocupa 407 MB. No se declaran requisitos minimos oficiales.
- GPU recomendadas: ninguna es necesaria. El autor solo documenta `CPUExecutionProvider`. El uso de `CUDAExecutionProvider` o TensorRT no esta documentado ni validado en la informacion disponible.
- Compatibilidad con GPU de consumo: si, cualquier GPU con mas de 1 GB de memoria puede alojar el grafo, pero el modelo esta disenado para CPU y no se han publicado ventajas de rendimiento en GPU.
- Opciones de despliegue: ONNX Runtime en Python (ejemplo oficial), y por extension en los lenguajes con binding de ONNX Runtime (C++, C#, Java, JavaScript). Las etiquetas `text-embeddings-inference` y `endpoints_compatible` apuntan a Inference Endpoints de Hugging Face. No es un modelo para llama.cpp, Ollama, vLLM ni TGI en su configuracion habitual de generacion de texto.
- Latencia y throughput: no disponibles. El autor indica explicitamente que no se han hecho pruebas de throughput ni de latencia en el servidor objetivo y que el tiempo de evaluacion no constituye una promesa de rendimiento en despliegue.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Accuracy | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Product-Classifier-MacBERT-ONNX-INT8 (este modelo) | ~102 M (derivado del tamano del grafo FP32) | 32 tokens | 93,20 % (subconjunto de 2.000) | No disponible | Publico, 0 descargas, 0 likes en la fecha de la ficha |
| Product-Classifier-MacBERT (original, PyTorch) | ~102 M (misma arquitectura) | 32 tokens | No disponible en esta ficha para el conjunto completo de 11.059 muestras | No disponible | Publico |
| Grafo ONNX FP32 de origen | ~102 M | 32 tokens | 93,45 % (mismo subconjunto de 2.000) | No disponible | Referenciado en el informe de cuantizacion |
| `hfl/chinese-macbert-base` (modelo base preentrenado) | No disponible en la informacion | No disponible | No aplica (sin cabeza de clasificacion de producto) | No disponible en la informacion; se remite a su model page | Publico |

No se han identificado en la informacion proporcionada otros clasificadores de titulos de producto en chino directamente comparables. Cualquier clasificador BERT chino base con una cabeza propia seria un sustituto funcional, pero requeriria reentrenamiento y no hay metricas comparables publicadas aqui.

## Limitaciones y advertencias

- Taxonomia cerrada de 27 clases que no incluye `书籍` (libros), `鲜花绿植` (flores y plantas) ni `钟表配饰` (relojes y complementos).
- No existe clase `其他` ni `无法分类`: cualquier texto fuera de la taxonomia se asigna forzosamente a una de las 27 categorias, con riesgo de etiquetado silenciosamente erroneo.
- Desbalanceo de clases: las clases de cola (`汽车用品`, `运动`, `礼品`, `餐饮`) presentan confianza baja; el autor recomienda umbrales para derivar a revision humana.
- Truncamiento a 32 tokens: titulos largos con atributos relevantes al final pierden informacion; el modelo no ve mas alla del token 32.
- Solo chino: no hay soporte declarado de otros idiomas ni de texto mixto chino-ingles mas alla de lo que el tokenizer del modelo base pueda segmentar.
- La validacion de la cuantizacion cubre solo 2.000 muestras de validacion; no se publican metricas INT8 sobre el conjunto completo de 11.059, y una caida de 0,25 puntos porcentuales en ese subconjunto esta dentro del ruido muestral.
- Ausencia de pruebas de latencia y throughput en el servidor objetivo.
- Licencia no declarada: el repositorio no fija licencia nueva y remite a la del modelo base, lo que introduce incertidumbre legal para uso comercial en produccion; conviene verificar la licencia de `hfl/chinese-macbert-base` antes de desplegar.
- Repositorio de un unico autor, sin descargas ni validacion de la comunidad en la fecha de la ficha; trazabilidad y mantenimiento no garantizados.
- Riesgo de alucinacion en sentido estricto no aplica (no genera texto), pero si existe riesgo de predicciones de alta confianza sobre entradas fuera de dominio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bangbangkido/Product-Classifier-MacBERT-ONNX-INT8
- Modelo base (PyTorch): https://huggingface.co/bangbangkido/Product-Classifier-MacBERT
- Modelo preentrenado de origen: https://huggingface.co/hfl/chinese-macbert-base
- Informe de cuantizacion: https://huggingface.co/bangbangkido/Product-Classifier-MacBERT-ONNX-INT8/blob/main/quantization_report.json
- La busqueda web realizada no devolvio resultados relevantes para este modelo: los enlaces obtenidos corresponden a WriteControl (writecontrol.fr, writecontrol.com, Google Play), una aplicacion de escritura sin relacion con el modelo.
