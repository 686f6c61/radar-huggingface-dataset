# liodon-ai/Carbon-X-ONNX

## Resumen

Carbon-X-ONNX es una exportacion al formato ONNX del modelo HuggingFaceBio/Carbon-X, publicada por Liodon AI. No se trata de un modelo nuevo, sino de una conversion cuantizada orientada a la inferencia con ONNX Runtime, lo que permite ejecutar el modelo fuera del ecosistema PyTorch habitual, tanto en GPU (mediante execution providers de CUDA o DirectML) como en CPU. La exportacion se ha realizado con la libreria Optimum de Hugging Face, usando la tarea `text-generation-with-past`, de modo que el grafo expone entradas y salidas de past-key-values para decodificacion autorregresiva con cache KV.

El modelo base, HuggingFaceBio/Carbon-X, esta etiquetado en Hugging Face como derivado de la arquitectura Qwen3, aunque la model card original no detalla su tamano, datos de entrenamiento ni capacidades especificas. La relevancia de esta ficha radica en la portabilidad: un export ONNX con soporte de KV-cache es util para despliegues en entornos donde no se desea instalar PyTorch completo (servidores Windows, edge devices con ONNX Runtime, aplicaciones .NET o Java via ONNX Runtime bindings).

El repositorio pesa 91,0 GB y contiene dos variantes: un grafo FP32 (`model.onnx`) y uno FP16 (`model_fp16.onnx`, 31,74 GB). El tamano del FP16 sugiere que el modelo base es de gran escala, probablemente en el rango de decenas de miles de millones de parametros, aunque la cifra exacta no esta disponible. La licencia se declara como "other", sin terminos detallados en la model card, por lo que conviene verificarla antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen3 (transformer decoder autorregresivo, segun tags del modelo base) |
| Parametros totales | no disponible (el tamano de 31,74 GB en FP16 sugiere ~15-16 mil millones de parametros, estimacion no confirmada) |
| Parametros activos | no disponible (solo aplicable si es MoE; no consta) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32 (`model.onnx`) y FP16 (`model_fp16.onnx`); pese a la tag "quantized", no hay variantes INT8/INT4 publicadas |
| Idiomas soportados | no disponible |
| Licencia | other (terminos no detallados) |
| Formato de pesos | ONNX (exportado con Optimum, tarea `text-generation-with-past`, con soporte de KV-cache) |

## Arquitectura y entrenamiento

La exportacion conserva la arquitectura del modelo base HuggingFaceBio/Carbon-X, etiquetado como derivado de Qwen3. Qwen3 es una familia de transformers decoder-only de la serie Qwen de Alibaba, por lo que es razonable asumir una arquitectura transformer estandar con attention multi-cabeza (posiblemente GQA), RoPE y normalizacion RMSNorm, aunque la model card no lo confirma explicitamente. El grafo ONNX se ha exportado con `optimum.exporters.onnx.main_export` usando la tarea `text-generation-with-past`, lo que significa que las entradas y salidas de past-key-values quedan expuestas en el grafo para decodificacion autorregresiva incremental con cache KV, evitando recomputar la atencion sobre tokens previos en cada paso.

Sobre el entrenamiento del modelo base no hay informacion publicada en la documentacion disponible: no se especifican tokens de entrenamiento, composicion del dataset, ni si se aplicaron tecnicas de alineamiento como RLHF o DPO. Tampoco consta si el modelo base incluye un modo de razonamiento (thinking mode), caracteristico de algunos modelos Qwen3. La unica transformacion tecnica documentada en esta ficha es la propia exportacion a ONNX y la disponibilidad de una variante FP16 para execution providers de GPU.

## Capacidades

- Generacion de texto autorregresiva (pipeline `text-generation`), con soporte de cache KV en el grafo ONNX para decodificacion eficiente.
- Ejecucion multiplataforma mediante ONNX Runtime: CPU (CPUExecutionProvider) y GPU (CUDAExecutionProvider, DirectML u otros providers compatibles).
- Integracion con el ecosistema Hugging Face a traves de `ORTModelForCausalLM` de Optimum, que gestiona automaticamente la contabilidad del KV-cache.
- Capacidades de razonamiento, codigo, matematicas o vision: no disponible (no documentadas en la model card).
- Soporte de tool calling / function calling: no disponible.
- Capacidades multilingues: no disponible.

## Casos de uso

- Despliegue en servidores Windows sin PyTorch: ONNX Runtime tiene soporte nativo de DirectML y CPU en Windows, lo que hace esta exportacion util para entornos corporativos donde instalar el stack completo de PyTorch+CUDA es problematico.
- Aplicaciones .NET y C#: ONNX Runtime ofrece bindings de primera clase para C#/.NET, permitiendo integrar la generacion de texto del modelo en aplicaciones empresariales de Microsoft sin puentes entre lenguajes.
- Inferencia en CPU de servidor: la variante FP32 con CPUExecutionProvider permite servir el modelo en maquinas sin GPU, aunque el tamano estimado (~31 GB en FP16) exige una maquina con al menos 64 GB de RAM para operar con holgura.
- Servicios de generacion de texto con cache KV: la tarea `text-generation-with-past` permite construir servicios de chat multi-turno eficientes, reutilizando el KV-cache entre turnos de la misma conversacion.
- Prototipado con Optimum: usando `ORTModelForCausalLM.from_pretrained`, un equipo puede evaluar el modelo base Carbon-X sin depender de pesos en formato safetensors ni de la libreria transformers para la ejecucion del forward.
- Embedding en productos con restricciones de dependencias: entornos como AWS Lambda (con contenedores grandes), Azure ML o dispositivos edge con ONNX Runtime Mobile pueden beneficiarse de la portabilidad del formato ONNX, aunque el tamano del modelo limita seriamente las opciones edge.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion, ni para la exportacion ONNX ni para el modelo base HuggingFaceBio/Carbon-X.

## Requisitos de hardware

- VRAM para la variante FP16 (`model_fp16.onnx`, 31,74 GB): se necesita una GPU con al menos 40 GB de VRAM para alojar los pesos con margen para el KV-cache; en una GPU de 24 GB no cabe sin cuantizacion adicional, que no esta publicada.
- VRAM para la variante FP32 (`model.onnx`): el tamano del fichero aparece como 0,00 GB en la model card, lo que probablemente sea un error de metadatos; en cualquier caso, un modelo de este tamano en FP32 requeriria del orden de 64 GB de VRAM o RAM, por lo que no es practico en una sola GPU de consumo.
- GPUs recomendadas: A100 40/80 GB, H100 80 GB o A6000 48 GB para la variante FP16. En consumer GPUs (RTX 4090, RTX 5090 con 24-32 GB) no cabe en FP16.
- No cabe en GPUs de consumo en las variantes publicadas; seria necesaria una exportacion INT4/INT8 que no esta disponible en el repositorio.
- Despliegue: ONNX Runtime (Python, C#, C++, Java) con `ORTModelForCausalLM` de Optimum como wrapper recomendado para la gestion del KV-cache. No hay soporte directo documentado para vLLM, llama.cpp, Ollama o TGI, ya que ONNX no es el formato nativo de ninguno de ellos.
- Latencia y throughput: no disponible. En CPU, un modelo de este tamano en FP32 sera muy lento (del orden de tokens por segundo o menos); en GPU con FP16 y KV-cache, el rendimiento dependera del ancho de banda de memoria de la GPU empleada.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| liodon-ai/Carbon-X-ONNX | no disponible (~15-16B estimado por tamano FP16) | ONNX (FP32, FP16) | no disponible | other | Export ONNX con KV-cache; base Qwen3 |
| Qwen/Qwen3-14B (referencia de arquitectura) | 14B | safetensors, GGUF | 32768 (128K con YaRN) | Apache 2.0 | Modelo base original de la familia Qwen3 |
| Qwen/Qwen3-30B-A3B | 30B (3B activos, MoE) | safetensors, GGUF | 32768 | Apache 2.0 | Alternativa MoE con inferencia mas barata |

Comparativa orientativa: la ventaja de Carbon-X-ONNX frente a los originales de Qwen3 es exclusivamente el formato ONNX y su portabilidad; en cambio, carece de las cuantizaciones INT4/INT8 de la comunidad (GGUF) que permitirian ejecutarlo en GPUs de consumo, y su licencia "other" es menos permisiva que la Apache 2.0 de Qwen3. No se dispone de benchmarks para contrastar rendimiento.

## Limitaciones y advertencias

- La model card del modelo base no documenta parametros, contexto, idiomas, datos de entrenamiento ni alineamiento, lo que dificulta evaluar su idoneidad para produccion; se recomienda auditar el modelo base HuggingFaceBio/Carbon-X antes de usarlo.
- Como modelo derivado de Qwen3 sin documentacion de post-entrenamiento, debe asumirse un riesgo de alucinaciones tipico de LLMs, sin garantias adicionales de seguridad o filtrado.
- Sesgos: no disponibles; no se ha publicado ninguna ficha de sesgos ni evaluaciones de seguridad.
- Licencia "other" sin terminos visibles en la model card: antes de cualquier despliegue comercial hay que localizar y revisar la licencia efectiva tanto del export como del modelo base.
- La tag "quantized" es enganosa: solo hay FP32 y FP16, sin cuantizaciones de baja precision, lo que eleva mucho los requisitos de hardware.
- El fichero `model.onnx` aparece con tamano 0,00 GB en la tabla de la model card, lo que sugiere un error en los metadatos del repositorio; verificar el contenido real antes de descargar (el repo completo pesa 91,0 GB).
- El snippet de Quick Start referencia `model_quantized.onnx`, un fichero que no aparece en la tabla de archivos; usar `model_fp16.onnx` o `model.onnx` en su lugar.
- Sin variantes INT4/INT8, el modelo no es viable en GPUs de consumo ni en dispositivos edge pese a estar en ONNX.
- Descargas muy bajas (298) y cero likes: no existe comunidad ni historial de problemas que sirva de referencia para soporte.

## Enlaces

- Export ONNX: https://huggingface.co/liodon-ai/Carbon-X-ONNX
- Modelo base: https://huggingface.co/HuggingFaceBio/Carbon-X
- Autor (Liodon AI): https://huggingface.co/liodon-ai
- Optimum (herramienta de exportacion): https://github.com/huggingface/optimum
- Paper, blog o demo del modelo base: no disponible
