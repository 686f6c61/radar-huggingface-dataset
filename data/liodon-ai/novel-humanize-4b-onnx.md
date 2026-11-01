# liodon-ai/novel-humanize-4b-ONNX

## Resumen

novel-humanize-4b — ONNX es una exportacion al formato ONNX del modelo gugujiji/novel-humanize-4b, publicada por Liodon AI en Hugging Face. No se trata de un modelo nuevo, sino de una version cuantizada/reexportada para inferencia con ONNX Runtime, pensada para desarrolladores que necesitan ejecutar el modelo fuera del ecosistema PyTorch (por ejemplo, en entornos de produccion con CPU o con proveedores de ejecucion GPU optimizados).

El modelo base, novel-humanize-4b, es un modelo de generacion de texto de unos 4.000 millones de parametros basado en la arquitectura Qwen3, segun indican las etiquetas del repositorio. Por su nombre ("humanize"), esta presumiblemente orientado a la generacion o reescritura de texto narrativo con un estilo mas natural y menos "artificial", aunque la model card original no detalla su proceso de entrenamiento ni sus datos.

La relevancia de esta ficha radica en la portabilidad: la exportacion se realizo con Optimum (tarea `text-generation-with-past`), de modo que el grafo expone entradas y salidas de clave/valor pasadas para decodificacion autorregresiva con cache KV, y puede integrarse directamente con `ORTModelForCausalLM` de la libreria Optimum de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen3 (transformer decoder autorregresivo) |
| Parametros totales | ~4B (inferido del nombre del modelo; cifra exacta no disponible) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32 (`model.onnx`, 17,65 GB) y FP16 (`model_fp16.onnx`, 9,58 GB) |
| Idiomas soportados | no disponible |
| Licencia | other (no especificada en detalle; heredada del modelo base) |
| Formato de pesos | ONNX (exportado con Optimum, con soporte de KV-cache) |

## Arquitectura y entrenamiento

La exportacion ONNX se genero con `optimum.exporters.onnx.main_export` usando la tarea `text-generation-with-past`, lo que significa que el grafo incluye las entradas y salidas `past_key_values` necesarias para decodificacion autorregresiva con cache de clave-valor. Esto evita recomputar la atencion sobre tokens previos en cada paso y mejora sustancialmente la latencia de generacion.

Sobre el modelo base (gugujiji/novel-humanize-4b), las etiquetas del repositorio indican que deriva de la familia Qwen3, una arquitectura transformer decoder. No hay informacion publicada sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco consta el uso de tecnicas especiales como decodificacion especulativa o atencion lineal. El nombre del modelo sugiere un enfoque en "humanizar" texto (hacer que texto generado suene mas natural), pero este proposito no esta documentado formalmente en la model card.

## Capacidades

- Generacion de texto autorregresiva (pipeline `text-generation`), con soporte de KV-cache en el grafo ONNX.
- Presumiblemente hereda las capacidades generales de la familia Qwen3 de 4B: generacion de texto, razonamiento basico y codigo, aunque no hay documentacion especifica del fine-tuning.
- Posible especializacion en reescritura o generacion de texto narrativo con estilo natural (deducible del nombre "novel-humanize"), no confirmada por documentacion.
- Ejecucion multiplataforma via ONNX Runtime: CPU (`CPUExecutionProvider`) y GPU mediante los execution providers disponibles (CUDA, DirectML, etc.).
- No hay informacion sobre soporte de tool calling, capacidades multimodales (vision/audio) ni modo de razonamiento extendido.

## Casos de uso

- Integracion en aplicaciones .NET o C#: ONNX Runtime tiene soporte nativo de primera clase en C#, lo que permite usar este modelo en software empresarial Windows sin depender de Python ni PyTorch.
- Inferencia en CPU en servidores ligeros: la version FP32 puede ejecutarse con `CPUExecutionProvider` para despliegues sin GPU, util en entornos on-premise con hardware modesto.
- Servicios de reescritura de texto: si el modelo base esta especializado en humanizar texto narrativo, podria integrarse en herramientas de edicion o asistencia a la escritura de novelas y contenido creativo.
- Prototipado rapido con Optimum: el wrapper `ORTModelForCausalLM` gestiona automaticamente la cache KV, facilitando la integracion en pipelines de Hugging Face (tokenizers, `generate`, etc.).
- Despliegue multiplataforma (Windows, Linux, edge): ONNX Runtime funciona en multiples sistemas operativos y arquitecturas, incluidos dispositivos con aceleradores compatibles con DirectML o CoreML.
- Reduccion de dependencias en produccion: eliminar la dependencia de PyTorch reduce el tamano del contenedor de despliegue y los conflictos de versiones de CUDA/cuDNN.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM para FP32: el archivo `model.onnx` pesa 17,65 GB, por lo que se necesitan al menos ~20 GB de RAM para CPU o VRAM para GPU en precision completa.
- VRAM para FP16: `model_fp16.onnx` pesa 9,58 GB; cabe en una GPU de 12-16 GB (por ejemplo, RTX 4090 con 24 GB, RTX 4070 Ti Super con 16 GB, o una T4/A10 en la nube), dejando margen para la cache KV.
- Consumer GPUs: viable en FP16 en tarjetas de gama alta (RTX 3090/4090, RTX 4070 Ti Super o superior). En FP32 se recomienda memoria de sistema amplia o GPUs de datacenter (A100 40 GB, A6000 48 GB).
- Despliegue: ONNX Runtime (Python, C#, C++, Java), con el wrapper `ORTModelForCausalLM` de Optimum para gestion automatica de la cache KV. No consta compatibilidad directa con vLLM, llama.cpp, Ollama o TGI para este export concreto.
- Latencia y throughput: no disponibles; al no existir versiones int8/int4 publicadas en el listado de archivos, el rendimiento en CPU estara limitado por el tamano en FP32.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia |
|---|---|---|---|---|
| novel-humanize-4b-ONNX (este) | ~4B | ONNX (FP32/FP16) | no disponible | other |
| Qwen3-4B (base) | 4B | safetensors | no disponible en esta ficha | Apache 2.0 |
| Phi-3-mini-4k-instruct | 3,8B | safetensors / ONNX | 4k tokens | MIT |
| Gemma 3 4B | 4B | safetensors | 128k tokens | Gemma license |

Nota: la comparativa se basa en caracteristicas generales conocidas de los modelos alternativos; para este modelo varios datos (contexto, benchmarks) no estan disponibles.

## Limitaciones y advertencias

- Licencia "other": los terminos exactos no estan detallados en la model card; debe verificarse la licencia del modelo base (gugujiji/novel-humanize-4b) antes de cualquier uso comercial.
- No hay documentacion del entrenamiento del modelo base: ni datos, ni alineacion, ni evaluaciones, lo que dificulta evaluar sesgos, riesgo de alucinacion y fiabilidad.
- El README incluye un ejemplo de codigo que referencia `model_quantized.onnx`, pero el listado de archivos solo muestra `model.onnx` (FP32) y `model_fp16.onnx` (FP16); conviene verificar los archivos realmente disponibles antes de descargar.
- No hay versiones int8/int4 publicadas en el listado, pese a que la etiqueta "quantized" aparece en el repositorio; el consumo de memoria en FP32 es elevado.
- La especializacion en "humanizar" texto narrativo no esta documentada: el comportamiento fuera de ese dominio es desconocido y podria degradar tareas genericas respecto al Qwen3 base.
- Idiomas soportados, longitud de contexto y benchmarks: no disponibles, por lo que no es posible garantizar rendimiento multilingue ni en ventanas largas de contexto.
- Al ser una exportacion de terceros (Liodon AI) y no del autor original, el mantenimiento y la correccion de errores dependen de un actor distinto al creador del modelo.

## Enlaces

- Modelo ONNX: https://huggingface.co/liodon-ai/novel-humanize-4b-ONNX
- Modelo base: https://huggingface.co/gugujiji/novel-humanize-4b
- Autor de la exportacion (Liodon AI): https://huggingface.co/liodon-ai
- Optimum (libreria de exportacion): https://github.com/huggingface/optimum
- ONNX Runtime: https://onnxruntime.ai
