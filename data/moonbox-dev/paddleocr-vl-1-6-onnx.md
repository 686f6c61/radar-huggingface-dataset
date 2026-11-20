# moonbox-dev/PaddleOCR-VL-1.6-ONNX

## Resumen

PaddleOCR-VL-1.6-ONNX es una distribucion en formato ONNX del modelo PaddleOCR-VL-1.6, desarrollado originalmente por PaddlePaddle y empaquetado por el usuario moonbox-dev para su ejecucion en dispositivo mediante ONNX Runtime sobre CPU, CUDA y DirectML. Se trata de un modelo de vision-lenguaje especializado en reconocimiento optico de caracteres (OCR) y analisis de documentos, que acepta imagenes de paginas y devuelve texto estructurado en multiples idiomas.

El paquete incluye dos precisiones (fp16 e int8), cada una en su propia carpeta con los grafos ONNX separados (vision, embed y decoder) mas un pequeno `pipeline.py` que implementa el preprocesado de imagen, la construccion del prompt, la gestion de posiciones y el bucle de decodificacion. El repositorio ocupa aproximadamente 3,0 GB en total. Segun la model card, ambas precisiones producen texto identico al modelo original, con una tasa de error de caracteres (CER) del 0,0 % en las pruebas realizadas por el autor.

La relevancia de esta ficha radica en que ofrece una via de despliegue portable y sin dependencia del framework Paddle original, con latencias declaradas de 0,69 s por pagina en fp16 y 1,07 s por pagina en int8 sobre CUDA. La licencia Apache 2.0 facilita su integracion en productos comerciales, aunque la informacion publica sobre arquitectura interna, parametros y contexto es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | vision-lenguaje para OCR y parsing de documentos (detalles internos no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 e int8 (grafos ONNX precompilados) |
| Idiomas soportados | no disponible (la model card indica "multilingual" sin enumerar idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (grafos `vision.onnx`, `embed.onnx`, `decoder.onnx`), mas tokenizer y configuraciones en JSON/Jinja |

## Arquitectura y entrenamiento

El modelo base es PaddleOCR-VL-1.6, un modelo de vision-lenguaje orientado a OCR y parsing de documentos. La model card del paquete ONNX no describe la arquitectura interna del transformer, el numero de parametros ni la composicion del dataset de entrenamiento. Lo que si se detalla es la descomposicion en tres grafos ONNX: un codificador visual (`vision.onnx`, 878,5 MB en fp16 y presumiblemente la mitad en int8), un modulo de embeddings (`embed.onnx`, 211,8 MB en fp16) y un decodificador autorregresivo (`decoder.onnx`, 722,1 MB en fp16). El tokenizer ocupa 11,2 MB y el vocabulario ampliado se guarda en `added_tokens.json`.

La innovacion principal de esta distribucion no esta en el entrenamiento sino en el empaquetado: la conversion a ONNX permite ejecutar el modelo con ONNX Runtime en CPU, CUDA y DirectML sin depender de PaddlePaddle. El `pipeline.py` (6,5 kB) encapsula el preprocesado de imagen, el prompt, las posiciones y el bucle de decodificacion, de modo que el usuario solo necesita invocar ese script. No se dispone de informacion sobre si el modelo base utilizo RLHF, DPO, decodificacion especulativa u otras tecnicas de entrenamiento.

## Capacidades

- Reconocimiento optico de caracteres (OCR) sobre imagenes de paginas y documentos.
- Parsing de documentos: extraccion de texto estructurado a partir de la imagen de una pagina.
- Procesamiento multimodal imagen-texto (pipeline `image-text-to-text`).
- Soporte multilingue declarado en las etiquetas del repositorio, aunque sin listado explicito de idiomas.
- Ejecucion en dispositivo mediante ONNX Runtime con backends CPU, CUDA y DirectML.
- Dos precisiones disponibles (fp16 e int8) con texto de salida identico al modelo original segun el autor.
- No se documenta soporte de tool calling, function calling, agentes, modo thinking ni audio en la informacion disponible.

## Casos de uso

- Digitalizacion de archivos y facturas: el modelo recibe la imagen de cada pagina y devuelve el texto reconocido, lo que permite alimentar pipelines de extraccion de datos estructurados en entornos de back office. La precision fp16 mantiene el texto identico al original con 0,69 s por pagina en CUDA.
- Procesamiento por lotes en servidores sin GPU: la version int8 esta pensada para ONNX Runtime sobre CPU, de modo que se puede desplegar en maquinas sin acelerador dedicado manteniendo la misma salida de texto que el modelo original.
- Aplicaciones de escritorio y escaneo local: el backend DirectML permite ejecutar el modelo en equipos Windows con GPU integrada o discreta, habilitando OCR sin conexion dentro de herramientas de captura y escaneo.
- Extraccion de texto de documentacion tecnica y manuales: el modelo puede integrarse en pipelines de ingestion documental para convertir PDFs escaneados en texto indexable antes de pasarlo a un motor de busqueda o a un RAG.
- Digitalizacion multilingue de correspondencia y formularios: la etiqueta "multilingual" sugiere cobertura de varios idiomas, adecuada para entornos con documentos en distintas lenguas, aunque el listado concreto no esta publicado.
- Prototipado rapido en Python: el `pipeline.py` incluido reduce la integracion a cargar los grafos ONNX y llamar al script, lo que facilita validar la calidad del OCR antes de comprometerse con un despliegue mayor.
- Automatizacion de accesibilidad: conversion de imagenes de documentos en texto legible para lectores de pantalla en aplicaciones de escritorio con ONNX Runtime.

## Benchmarks y rendimiento

La model card unicamente reporta la tasa de error de caracteres (CER) frente al modelo original y la latencia por pagina. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

| Precision | CER vs. original | Texto identico al original | Latencia por pagina (CUDA) |
|---|---|---|---|
| fp16 | 0,0 % / 0,0 % | Si | 0,69 s |
| int8 | 0,0 % / 0,0 % | Si | 1,07 s |
| Original (fp32) | 0,0 % / 0,0 % (referencia) | — | no disponible |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el grafo fp16 suma aproximadamente 1,8 GB de pesos (vision 878,5 MB + decoder 722,1 MB + embed 211,8 MB) mas tokenizer y buffers de activacion, por lo que se situa en el rango de 2-4 GB en fp16 y aproximadamente la mitad en int8.
- GPU recomendadas: el autor cita CUDA como backend verificado; no se especifican modelos concretos de GPU (A100, H100, RTX 4090, etc.).
- GPU de consumo: por el tamano de los grafos, es plausible que quepa en GPUs de consumo con 4-8 GB de VRAM, pero no hay confirmacion en la informacion disponible.
- Opciones de despliegue: ONNX Runtime con ejecucion en CPU, CUDA y DirectML; el paquete incluye un `pipeline.py` propio. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 0,69 s por pagina en fp16 y 1,07 s por pagina en int8 sobre CUDA, segun el autor. No se reporta throughput agregado ni latencia en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| PaddleOCR-VL-1.6-ONNX (este) | no disponible | no disponible | ONNX (fp16/int8) | Apache 2.0 | Distribucion ONNX para ONNX Runtime; CER 0,0 % frente al original |
| PaddleOCR-VL-1.6 (original) | no disponible | no disponible | Paddle | Apache 2.0 (segun etiquetas del repo) | Modelo base en PaddlePaddle; requiere el framework original |
| Alternativas OCR-VL de otros proveedores | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

No se dispone de informacion suficiente para comparar con alternativas concretas de la misma categoria (por ejemplo, otros modelos OCR de vision-lenguaje) sin inventar datos.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al ser un modelo OCR, puede heredar sesgos de los datos de entrenamiento del modelo base, pero no hay evidencia publicada en la informacion disponible.
- Riesgo de alucinacion: no cuantificado; en tareas de OCR el modelo puede producir texto plausible pero incorrecto en imagenes de baja calidad, aunque el autor reporta CER 0,0 % en sus pruebas.
- Limitaciones de contexto e idioma: no se publica la longitud de contexto ni el listado de idiomas soportados, lo que dificulta planificar el despliegue en escenarios multilingues o con paginas densas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia y las condiciones del modelo base PaddleOCR-VL-1.6 antes de redistribuir.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-20; se trata de un paquete reciente y sin validacion comunitaria amplia.
- El rendimiento solo se ha verificado en CUDA; no hay datos publicados de latencia o calidad en CPU o DirectML.
- No se documenta soporte para tool calling ni agentes, por lo que no debe asumirse en pipelines que dependan de esas capacidades.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/PaddleOCR-VL-1.6-ONNX
- Modelo base: https://huggingface.co/PaddlePaddle/PaddleOCR-VL-1.6
- Referencia arXiv citada en las etiquetas: arxiv:2606.03264 (no verificada en la informacion disponible)
