# liodon-ai/granite-4.1-3b-llmon-preview-ONNX

## Resumen

`granite-4.1-3b-llmon-preview-ONNX` es la exportación a formato ONNX del modelo `ibm-granite/granite-4.1-3b-llmon-preview`, publicada por el usuario Liodon AI en Hugging Face. Se trata de una conversión de pesos orientada a inferencia con ONNX Runtime, no de un modelo entrenado desde cero: el autor original del modelo base es IBM (familia Granite 4.1), y Liodon AI se limita a exportar y empaquetar los grafos para su ejecución fuera del ecosistema PyTorch nativo.

El paquete incluye dos variantes del grafo: `model.onnx` en FP32 (14,64 GB) y `model_fp16.onnx` en FP16 (7,85 GB), exportadas con `optimum` bajo la tarea `text-generation-with-past`, de modo que el grafo expone entradas y salidas de clave-valor (`past_key_values`) para decodificación autorregresiva con caché KV. La relevancia de esta ficha radica en que permite ejecutar un modelo de la familia Granite con ONNX Runtime en CPU o en GPUs con distintos execution providers, sin depender de PyTorch.

Conviene subrayar que la información disponible es muy limitada: la model card no documenta arquitectura, datos de entrenamiento, benchmarks ni idiomas, y el propio nombre del modelo base incluye el sufijo "preview", lo que sugiere una versión no final. Todos los datos que no aparecen en la información proporcionada se marcan explícitamente como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia IBM Granite 4.1; arquitectura concreta no documentada en la informacion proporcionada) |
| Parametros totales | no disponible (el nombre del modelo sugiere ~3B, no confirmado en la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32 (`model.onnx`, 14,64 GB) y FP16 (`model_fp16.onnx`, 7,85 GB); la model card menciona `model_quantized.onnx` en el ejemplo de codigo, pero no lo lista en la tabla de ficheros |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base; terminos concretos no disponibles) |
| Formato de pesos | ONNX (grafos FP32 y FP16, exportados con `optimum`, tarea `text-generation-with-past`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base `ibm-granite/granite-4.1-3b-llmon-preview`: la model card del repositorio ONNX no describe si se trata de un transformer denso, un MoE o una arquitectura hibrida, ni detalla el numero de capas, dimensiones ocultas o mecanismos de atencion. El sufijo "3b" en el nombre sugiere un orden de magnitud de 3.000 millones de parametros, pero no se confirma en ningun apartado del repositorio.

Respecto al entrenamiento, tampoco se documentan el volumen de tokens, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Lo unico verificable es el proceso de exportacion: el autor indica que se uso `optimum.exporters.onnx.main_export` con la tarea `text-generation-with-past`, lo que genera un grafo con entradas y salidas de caché KV para decodificacion autorregresiva eficiente. No se mencionan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es `text-generation` y la etiqueta `conversational` aparece entre los tags del repositorio.
- Inferencia con caché KV: el grafo expone `past_key_values.*.key` y `.value` para evitar recomputar el prefijo en cada paso de decodificacion.
- Ejecucion con ONNX Runtime en CPU y en GPUs mediante los distintos execution providers (el ejemplo de la model card usa `CPUExecutionProvider`).
- Compatibilidad con `optimum.onnxruntime.ORTModelForCausalLM`, que gestiona automaticamente la contabilidad del caché KV.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Despliegue en entornos sin PyTorch: el formato ONNX permite ejecutar el modelo con ONNX Runtime en infraestructura donde instalar PyTorch no es viable (contenedores ligeros, entornos embebidos o pipelines con dependencias restringidas).
- Inferencia en CPU para prototipos: con el grafo FP32 o FP16 y `CPUExecutionProvider`, se puede levantar un servicio de generacion de texto en servidores sin GPU, usando `ORTModelForCausalLM` para gestionar el caché KV.
- Servicio conversacional de baja latencia en GPU: el grafo FP16 (7,85 GB) reduce el uso de memoria frente al FP32 y permite decodificacion con caché KV en GPUs con execution provider CUDA o TensorRT.
- Integracion en pipelines de generacion por lotes: al ser un grafo ONNX estandar, se puede encadenar con herramientas de serving basadas en ONNX Runtime para tareas de generacion de texto por lotes (resumen, reescritura, clasificacion generativa).
- Evaluacion comparativa de backends: util para medir el rendimiento de un modelo Granite en ONNX Runtime frente a su ejecucion nativa en PyTorch/Transformers, aislando el efecto del formato de exportacion.
- Base para cuantizacion posterior: al disponer de grafos FP32 y FP16, se puede aplicar cuantizacion adicional con las herramientas de ONNX Runtime para reducir aun mas el footprint en despliegues con memoria limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 14,64 GB para el grafo FP32 y 7,85 GB para el FP16, solo en pesos; hay que sumar la memoria del caché KV, que depende de la longitud de contexto y del numero de capas (no documentados).
- GPU recomendadas: no especificadas por el autor. Por tamano de pesos, una GPU con 16 GB o mas (por ejemplo, A100 40 GB, H100, RTX 4090 de 24 GB) puede alojar el grafo FP16 con margen para el caché KV; el FP32 requiere al menos 16-24 GB solo para pesos.
- Compatibilidad con GPU de consumo: el grafo FP16 (7,85 GB) es el candidato para GPUs de consumo con 8-12 GB de VRAM, siempre que la longitud de contexto y el caché KV se mantengan acotados; el FP32 no cabe comodamente en GPUs de 8 GB.
- Opciones de despliegue: ONNX Runtime (CPU y GPU), `optimum.onnxruntime.ORTModelForCausalLM`, y cualquier servidor compatible con grafos ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `liodon-ai/granite-4.1-3b-llmon-preview-ONNX` | no disponible (~3B por nombre) | no disponible | ONNX (FP32/FP16) | other | Exportacion ONNX del modelo base de IBM |
| `ibm-granite/granite-4.1-3b-llmon-preview` | no disponible (~3B por nombre) | no disponible | safetensors (presumiblemente) | other | Modelo original de IBM del que deriva esta exportacion |
| Alternativas de ~3B en ONNX | no disponible | no disponible | ONNX | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con modelos de la misma categoria. La unica comparacion fiable es con el modelo base del que deriva, que comparte pesos pero no formato de despliegue.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, riesgo de alucinacion ni limitaciones de idioma; se desconoce el comportamiento real del modelo en produccion.
- El sufijo "preview" en el nombre del modelo base indica que se trata de una version no final, sujeta a cambios o retirada por parte de IBM.
- La licencia es "other" y los terminos concretos no estan disponibles en el repositorio; es imprescindible revisar la licencia del modelo base `ibm-granite/granite-4.1-3b-llmon-preview` antes de cualquier uso comercial.
- La model card menciona `model_quantized.onnx` en el ejemplo de codigo, pero la tabla de ficheros solo lista `model.onnx` y `model_fp16.onnx`; conviene verificar la existencia real del fichero cuantizado antes de usarlo.
- El ejemplo de la model card usa `CPUExecutionProvider`; para GPU hay que configurar el execution provider correspondiente (CUDA, TensorRT, etc.), algo que no se detalla.
- El repositorio ocupa 22,5 GB, lo que implica una descarga considerable incluso si solo se necesita uno de los grafos.
- No se documenta el proceso de exportacion en detalle (version de `optimum`, opset, validacion numerica frente al modelo original), por lo que no se puede garantizar la equivalencia exacta de salidas con el modelo base.
- El modelo tiene 17 descargas y 0 likes en el momento de la consulta, lo que indica una adopcion muy limitada y poca validacion por parte de la comunidad.

## Enlaces

- Repositorio ONNX: https://huggingface.co/liodon-ai/granite-4.1-3b-llmon-preview-ONNX
- Modelo base: https://huggingface.co/ibm-granite/granite-4.1-3b-llmon-preview
- Herramienta de exportacion (optimum): https://github.com/huggingface/optimum
- Perfil del autor: https://huggingface.co/liodon-ai
