# liodon-ai/anon-1b-ONNX

## Resumen

`liodon-ai/anon-1b-ONNX` es una exportacion al formato ONNX del modelo `scratchyone/anon-1b`, publicada por Liodon AI. No se trata de un modelo entrenado desde cero, sino de una conversion de pesos orientada a despliegue: el repositorio contiene tres variantes del mismo grafo (FP32, FP16 e INT8 dinamico) listas para ejecutarse con ONNX Runtime sin necesidad de convertir pesos en tiempo de ejecucion. La exportacion se realizo con la libreria `optimum` de Hugging Face, empleando la tarea `text-generation-with-past`, de modo que el grafo expone entradas y salidas de key/value para decodificacion autorregresiva con cache KV.

El modelo base, `scratchyone/anon-1b`, es un modelo de generacion de texto de la familia anon, y las etiquetas del repositorio incluyen `gemma3_text`, lo que apunta a una arquitectura tipo transformer decoder derivada de la rama textual de Gemma 3. El nombre sugiere un orden de aproximadamente 1.000 millones de parametros, aunque este dato no se confirma de forma explicita en la informacion disponible. La relevancia de esta publicacion es practica: permite ejecutar el modelo en entornos donde PyTorch no esta disponible, como aplicaciones en CPU, servicios con ONNX Runtime, despliegues en el borde o integraciones en C#, C++ o Java.

El repositorio tiene un tamano de 11,1 GB y, en el momento de la consulta, registra 0 descargas y 0 likes. La licencia declarada es `other`, heredada del modelo base, lo que obliga a revisar las condiciones originales antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (etiqueta `gemma3_text`; rama textual de Gemma 3), con cache KV en el grafo |
| Parametros totales | No confirmado. El nombre indica ~1.000 millones; el archivo FP32 de 5,21 GB es coherente con un orden de 1.000-1.300 millones |
| Parametros activos | No aplica (no es un modelo MoE, segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP32 (sin cuantizar), FP16 e INT8 dinamico (weight-only, sin calibracion) |
| Idiomas soportados | No disponible |
| Licencia | `other` (heredada de `scratchyone/anon-1b`) |
| Formato de pesos | ONNX: `model.onnx` (FP32, 5,21 GB), `model_fp16.onnx` (FP16, 4,60 GB), `model_quantized.onnx` (INT8 dinamico, 1,30 GB) |

## Arquitectura y entrenamiento

Esta publicacion no entrena ningun modelo: es una conversion de pesos. El modelo base es `scratchyone/anon-1b`, del que no se aportan en la informacion disponible detalles sobre composicion del dataset, numero de tokens de entrenamiento ni si se aplicaron tecnicas de alineacion como RLHF o DPO. La etiqueta `gemma3_text` del repositorio sugiere que la arquitectura subyacente corresponde a un transformer decoder de tipo Gemma 3 en su variante solo texto.

La innovacion tecnica de este repositorio reside en la exportacion, no en el modelo. Se ha realizado con `optimum.exporters.onnx.main_export` bajo la tarea `text-generation-with-past`, lo que implica que el grafo ONNX acepta y devuelve tensores de key/value (`past_key_values.*.key` y `.value`) para permitir decodificacion autorregresiva con cache KV. Esta decision es la que habilita un rendimiento razonable en generacion token a token, ya que sin cache KV cada paso tendria que reprocesar toda la secuencia. Se ofrecen tres precisiones para adaptarse a distintos entornos: FP32 para maxima fidelidad en CPU, FP16 para proveedores de ejecucion en GPU e INT8 dinamico (cuantizacion de pesos sin calibracion, es decir, solo pesos y no activaciones) para minimizar huella de memoria.

## Capacidades

- Generacion de texto autoregresiva con cache KV, optimizada para ONNX Runtime.
- Inferencia en CPU y GPU mediante distintos execution providers de ONNX Runtime.
- Ejecucion en precision completa (FP32), media precision (FP16) o entera de 8 bits (INT8), segun el archivo seleccionado.
- Capacidad de razonamiento y generacion en lenguaje natural, en la medida en que lo permita el modelo base de 1B, no documentada en esta ficha.
- Soporte de tool calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: no disponibles (no se declara lista de idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponibles. La etiqueta `gemma3_text` indica que la exportacion cubre unicamente la rama de texto, por lo que no se debe esperar procesamiento de imagenes aunque la familia de origen sea multimodal.

## Casos de uso

- Inferencia local en CPU sin dependencias de PyTorch: usando `model_quantized.onnx` (1,30 GB), el modelo se puede cargar con `onnxruntime` puro en un portatil o servidor sin GPU, con un consumo de memoria bajo y sin instalar el stack completo de PyTorch.
- Asistentes de texto embebidos en aplicaciones de escritorio: al ser ONNX, se puede integrar en programas en C++, C# o Java mediante los bindings de ONNX Runtime, ofreciendo generacion de texto offline dentro del propio producto.
- Despliegue en el borde o dispositivos con recursos limitados: la variante INT8 permite ejecutar el modelo en equipos con pocos gigabytes de RAM, algo inviable con la version FP32.
- Prototipado rapido de pipelines de generacion: la exportacion con cache KV y la integracion con `optimum.onnxruntime.ORTModelForCausalLM` permiten sustituir un modelo PyTorch por su equivalente ONNX sin reescribir el codigo de generacion.
- Servicio de generacion de texto de bajo coste en GPU de gama consumer: la variante FP16 (4,60 GB) cabe en tarjetas con 8 GB o mas de VRAM, lo que permite levantar un endpoint de generacion con un modelo de 1B sin hardware de datacenter.
- Base para experimentacion educativa o de investigacion en conversion de modelos: el repositorio sirve como ejemplo practico de exportacion ONNX con cache KV y distintas precisiones, util para estudiar el impacto de la cuantizacion en calidad y latencia.
- Preprocesado o generacion de texto auxiliar en pipelines mayores: por su tamano reducido, puede actuar como componente secundario (resumen, etiquetado, reformulacion) dentro de un sistema mayor sin monopolizar la GPU.
- Ejecucion en entornos sin acceso a internet: al distribuirse como archivos ONNX autocontenidos, se puede desplegar en sistemas aislados donde no se permite descargar modelos desde la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (solo pesos, sin contar overhead del runtime ni cache KV):
  - `model_quantized.onnx` (INT8): ~1,30 GB.
  - `model_fp16.onnx` (FP16): ~4,60 GB.
  - `model.onnx` (FP32): ~5,21 GB.
- En la practica, conviene reservar entre 1,5 y 2 veces el tamano de los pesos para acomodar el runtime, la cache KV y los buffers intermedios, especialmente con contextos largos.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM para la variante FP16 (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4090, A10, L4). La variante INT8 puede ejecutarse en GPU con 4 GB o incluso en CPU. Las GPU de datacenter (A100, H100) son innecesarias para este tamano.
- Cabe en GPU de consumo: si. La variante INT8 cabe incluso en graficos integrados con memoria compartida suficiente; la FP16 requiere una GPU dedicada de gama media.
- Opciones de despliegue:
  - ONNX Runtime (CPUExecutionProvider, CUDAExecutionProvider, TensorRT, DirectML, etc.).
  - `optimum.onnxruntime.ORTModelForCausalLM` como envoltorio de alto nivel.
  - ONNX Runtime GenAI para generacion con cache gestionada.
  - No aplica de forma nativa vLLM, TGI ni llama.cpp, ya que esperan pesos PyTorch o GGUF, no ONNX.
- Latencia y throughput: no disponibles en la informacion. Dependeran de la precision elegida, del hardware y del execution provider.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| `liodon-ai/anon-1b-ONNX` | ~1.000 millones (estimado) | ONNX (FP32/FP16/INT8) | No disponible | `other` | Exportacion ONNX del modelo base |
| `scratchyone/anon-1b` | ~1.000 millones (estimado) | PyTorch (no confirmado) | No disponible | `other` | Modelo original; sirve de referencia directa |
| Modelos de ~1B de la familia Gemma 3 | ~1.000 millones | Safetensors, GGUF, etc. | No aplicable a esta comparacion | Terminos propios de Google | La etiqueta `gemma3_text` sugiere parentesco arquitectonico, pero no hay datos de rendimiento para comparar |

No se dispone de resultados de benchmarks que permitan una comparacion cuantitativa de rendimiento con alternativas. La comparacion se limita, por tanto, a formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. Al no documentarse el dataset de entrenamiento ni el proceso de alineacion del modelo base, no es posible evaluar sesgos.
- Riesgo de alucinacion: inherente a los modelos de lenguaje generativos. Un modelo de ~1B de parametros tiende a alucinar con mas frecuencia que modelos mayores, aunque no se aportan datos concretos en esta informacion.
- Limitaciones de contexto e idioma: no se declara longitud de contexto ni lista de idiomas soportados. No se debe asumir soporte multilingue ni una ventana de contexto amplia.
- Restricciones de licencia: la licencia es `other`, heredada del modelo base `scratchyone/anon-1b`. No se detallan los terminos exactos, por lo que es imprescindible consultar la licencia original antes de cualquier uso comercial o redistribucion. Esta exportacion no concede permisos adicionales sobre el modelo base.
- Ambito de la exportacion: las etiquetas indican `gemma3_text`, es decir, solo la rama de texto. Si la familia de origen es multimodal, la capacidad de vision no esta incluida en estos pesos.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, y fechas de creacion y actualizacion muy cercanas (16 de octubre de 2026), lo que indica que la exportacion no ha sido validada por la comunidad.
- Cuantizacion INT8 sin calibracion: la variante `model_quantized.onnx` usa cuantizacion dinamica solo de pesos, sin calibracion sobre datos. Esto puede degradar la calidad de generacion respecto a FP16 o FP32; conviene validar la salida en la tarea concreta antes de usarla en produccion.
- Compatibilidad de runtime: al haberse exportado con `text-generation-with-past`, el consumidor debe gestionar correctamente los tensores de cache KV. Usar el grafo sin rellenar esas entradas o sin el envoltorio de `optimum` puede provocar errores o un rendimiento muy degradado.
- Sin garantias de mantenimiento: no se documenta soporte, versionado ni politica de actualizacion del repositorio por parte de Liodon AI.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/liodon-ai/anon-1b-ONNX
- Modelo base: https://huggingface.co/scratchyone/anon-1b
- Repositorio de optimum (herramienta de exportacion): https://github.com/huggingface/optimum
- ONNX Runtime: https://onnxruntime.ai/
- Citacion indicada por el autor:
  ```
  @misc{liodonai_anon_1b_onnx,
    title        = {anon-1b — ONNX},
    author       = {{Liodon AI}},
    year         = {2026},
    howpublished = {\url{https://huggingface.co/liodon-ai/anon-1b-ONNX}},
    note         = {ONNX export of scratchyone/anon-1b}
  }
  ```
- Resultados de busqueda web: no se han encontrado enlaces relevantes sobre este modelo. Las consultas devolvieron exclusivamente sitios de contenido para adultos sin ninguna relacion con el modelo, por lo que se descartan como fuentes.
