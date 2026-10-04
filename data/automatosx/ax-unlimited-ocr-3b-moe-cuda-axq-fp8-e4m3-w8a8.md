# AutomatosX/AX-Unlimited-OCR-3B-MoE-CUDA-AXQ-FP8-E4M3-W8A8

## Resumen

AX-Unlimited-OCR-3B-MoE-CUDA-AXQ-FP8-E4M3-W8A8 es una cuantizacion en FP8 del modelo de OCR baidu/Unlimited-OCR, publicada por AutomatosX como vista previa de desarrollo. Se trata de un modelo de mezcla de expertos (MoE) de 3.336.106.240 parametros orientado a tareas de reconocimiento optico de caracteres y conversion de imagen a texto (pipeline image-text-to-text). El checkpoint se genera con el encoder nativo de AXQuant en modo round-to-nearest (RTN), sin recurrir a AWQ ni a cuantizadores de terceros.

La relevancia de esta ficha reside en que ofrece una variante de pesos de 8 bits (E4M3FN) pensada especificamente para inferencia en CUDA con vLLM, manteniendo en BF16 las partes sensibles a precision (vision, proyector, routers, embeddings, normalizacion y LM head). El resultado son unos pesos de aproximadamente 4,08 GB, lo que permite desplegar el modelo en GPUs de consumo recientes como la GeForce RTX 5090, tal y como se documenta en las pruebas de humo del autor.

El modelo se publica bajo licencia MIT, heredada del modelo base, y se comercializa como hermano de la variante nativa de cuatro bits NVFP4 W4A16 del mismo autor. Es un artefacto de desarrollo: el propio autor indica que no cuenta con certificacion de calidad ni de velocidad OCR.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) sobre transformer, heredada de baidu/Unlimited-OCR; numero de capas y de expertos no disponible |
| Parametros totales | 3.336.106.240 (~3,34 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 E4M3 W8A8: pesos float8_e4m3fn con una escala FP32 por canal de salida mas cuantizacion dinamica de activaciones FP8 por token; elementos protegidos en BF16 (vision, proyector, routers, embeddings, normalizacion y LM head). Existe un hermano nativo en NVFP4 W4A16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (tensores float8_e4m3fn con tensores .weight_scale FP32 de forma (rows, 1)); 2.196 tensores FP8 y 514 tensores en precision de origen |

## Arquitectura y entrenamiento

El checkpoint es una conversion de pesos, no un reentrenamiento. Parte de la revision inmutable 07dea832e22aefee32ad281d4b80551282e1c168 del modelo baidu/Unlimited-OCR, cuyo peso original coincide en SHA-256 con el objeto LFS fijado en el Hub. La cuantizacion aplica FP8 E4M3 (formato E4M3FN) a un subconjunto de proyecciones de atencion, MLP y expertos individuales, con una escala FP32 por canal de salida y cuantizacion dinamica de activaciones por token en tiempo de ejecucion. Las operaciones restantes se ejecutan en BF16.

La conversion de fabrica utilizo el encoder explicito `torch-cpu` de AXQuant sobre la fuente BF16 original. El mismo encoder, en su ruta CUDA, supero pruebas de paridad de bytes en FP32, FP16 y BF16; se emplearon division intermedia en FP64 y redondeo explicito en FP32 para evitar aproximaciones de reciproco dependientes del backend en el redondeo del punto medio FP8. No hay reinterpretacion de pesos MLX a CUDA ni recuantizacion de pesos de cuatro bits.

En cuanto al entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO) del modelo base, no se dispone de informacion en la documentacion proporcionada.

## Capacidades

- Conversion de imagen a texto (OCR) sobre documentos, con salida de texto plano a partir de una imagen de entrada y el prompt literal `<image>`.
- Procesamiento de paginas con multiples lineas de texto; en el smoke test el modelo reproduce correctamente tres lineas de prueba (`AXQuant NVFP4`, `Invoice 12345`, `Total USD 42.50`).
- Inferencia en CUDA mediante vLLM con backend TRITON FP8 MoE.
- Compatibilidad con decodificacion determinista y ajustes de n-gram (35/128) en la configuracion probada.
- Soporte de tool calling / function calling, agentes, razonamiento multi-paso y capacidades multilingues: no disponible.
- Modo de razonamiento, vision mas alla de OCR, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Digitalizacion de facturas y documentos financieros: el modelo esta probado sobre una pagina con campos como numero de factura e importes totales, por lo que encaja en extraccion de texto de facturas para sistemas de contabilidad.
- Entrada de datos en back-office: conversion masiva de documentos escaneados a texto para reducir la transcripcion manual en procesos administrativos.
- Digitalizacion de patrimonio documental: procesamiento de archivos historicos o fondos escaneados en lotes con vLLM, aprovechando el bajo peso de los pesos FP8 (~4,08 GB).
- Pipelines de RAG sobre PDF: extraccion del texto de documentos para alimentar un indice vectorial antes de la fase de recuperacion y generacion.
- Procesamiento de formularios y documentos estructurados: lectura de campos impresos en plantillas y documentos normalizados.
- Accesibilidad: conversion de documentos escaneados a texto legible para lectores de pantalla y otras herramientas de apoyo.
- Automatizacion documental en edge o estaciones con GPU de consumo: al caber en una RTX 5090 con fraccion de memoria de 0,30, permite desplegar OCR local sin infraestructura de centro de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad en la informacion disponible. La model card solo documenta pruebas de humo (smoke tests) de una sola pagina, sin certificacion de calidad ni de velocidad OCR. Los resultados disponibles son:

| Prueba | GPU | Carga y generacion FP8 | Las tres lineas de texto esperadas |
|---|---|---|---|
| Smoke test vLLM 0.25.1 (backend TRITON FP8 MoE) | GeForce RTX 5090 | Superada | Presentes |
| Smoke test vLLM 0.25.1 (backend TRITON FP8 MoE) | Thor | Superada | Presentes |

Ambas pruebas usaron vLLM 0.25.1, PyTorch 2.11.0+cu130 y CUDA 13.0, con `min_tokens=16`, muestreo determinista, modo eager, Torch SDPA para vision, atencion Triton, una unica peticion y prefill troceado desactivado. No se aportan cifras de MMLU, HumanEval, GSM8K ni de precision OCR.

## Requisitos de hardware

- Pesos FP8 en disco: aproximadamente 4,08 GB (3,80 GiB), 4.079.141.840 bytes.
- Entorno probado: vLLM 0.25.1, PyTorch 2.11.0+cu130 y CUDA 13.0, con backend TRITON FP8 MoE.
- GPUs verificadas en las pruebas del autor: GeForce RTX 5090 (con fraccion de memoria 0,30) y Thor (con fraccion de memoria 0,035, manteniendo servicios residentes en ejecucion).
- Cabe en GPU de consumo: si, queda confirmado en la RTX 5090. La VRAM necesaria real depende del documento y de la concurrencia, que requieren dimensionado propio.
- La inferencia FP8 en vLLM requiere GPUs con soporte de FP8; las arquitecturas verificadas por el autor son Blackwell (RTX 5090 y Thor). El soporte en otras familias no se documenta en la informacion disponible.
- Opciones de despliegue: vLLM (libreria declarada). No se mencionan llama.cpp, Ollama ni TGI en la informacion proporcionada.
- Latencia y throughput: no disponibles; no existe certificacion de velocidad. Se recomienda usar `--memory-fraction` segun la VRAM disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AX-Unlimited-OCR-3B-MoE-CUDA-AXQ-FP8-E4M3-W8A8 (este modelo) | 3.336.106.240 | FP8 E4M3 W8A8 | safetensors (float8_e4m3fn) | MIT | HuggingFace (vista previa de desarrollo) |
| AXQ CUDA NVFP4 W4A16 (hermano nativo) | no disponible | NVFP4 W4A16 | no disponible | no disponible | HuggingFace |
| baidu/Unlimited-OCR (modelo base) | 3.336.106.240 | BF16 | safetensors (BF16) | MIT | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Es una vista previa de desarrollo: los manifiestos conservan `status=development`, `runtime_verified=false` y `quality_certified=false`. Las pruebas de runtime no confieren cualificacion del toolkit, certificacion Tier 1/2, calibracion medida ni version GA.
- Cuantizacion RTN sin calibracion medida: al no usar algoritmo AWQ ni calibracion, la precision de los pesos cuantizados puede diferir de una cuantizacion consciente de la calibracion.
- Sin certificacion de calidad ni de velocidad OCR: las pruebas documentadas se limitan a una pagina y tres lineas de texto.
- Riesgo de terminacion temprana: en las ejecuciones de control NVFP4 y BF16 el modelo termino antes de tiempo con el minimo de tokens por defecto, por lo que las pruebas usan `min_tokens=16` como solucion provisional. Un minimo de tokens es un ajuste de peticion y no garantiza precision OCR general.
- No se documentan sesgos conocidos, idiomas soportados ni comportamiento frente a alucinaciones; se aplican los riesgos generales de los modelos generativos de imagen a texto, con posible invencion de contenido en documentos de baja calidad.
- Licencia MIT: permite uso comercial, pero se recomienda verificar la procedencia del modelo base y de los datos de entrenamiento originales.
- El codigo remoto del modelo no se ejecuta en las pruebas; cualquier integracion que dependa de `custom_code` debe auditarse por separado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AutomatosX/AX-Unlimited-OCR-3B-MoE-CUDA-AXQ-FP8-E4M3-W8A8
- Modelo base: https://huggingface.co/baidu/Unlimited-OCR
- Hermano nativo en NVFP4: https://huggingface.co/AutomatosX/AX-Unlimited-OCR-3B-MoE-CUDA-AXQ-NVFP4-W4A16
- Referencia de FP8 y FP4 de NVIDIA: https://docs.nvidia.com/deeplearning/transformer-engine-releases/release-2.14/user-guide/examples/fp8_primer.html
- Documentacion de compressed-tensors en vLLM: https://docs.vllm.ai/en/latest/features/quantization/compressed_tensors/
