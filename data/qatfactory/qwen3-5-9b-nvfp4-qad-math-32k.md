# qatfactory/Qwen3.5-9B-NVFP4-QAD-Math-32K

## Resumen

Qwen3.5-9B-NVFP4-QAD-Math-32K es una cuantizacion de 8 bits del modelo base Qwen/Qwen3.5-9B, publicada por el usuario qatfactory bajo licencia Apache 2.0. Se trata de un artefacto de pesos cuantizados en formato NVFP4 (formato de 4 bits empaquetado de NVIDIA) mediante tecnicas de Quantization-Aware Training (QAT) y un procedimiento propio del autor denominado QAD, orientado a preservar capacidades matematicas con una ventana de contexto de 32K tokens. El modelo conserva los 9.409.813.744 parametros del original (aproximadamente 9,4 mil millones).

El interes practico de esta publicacion reside en que reduce el peso del repositorio a 8,9 GB, lo que permite desplegar un modelo de casi 10B parametros en GPUs con menos memoria que la version en BF16, manteniendo el soporte de vLLM como libreria de inferencia y el formato compressed-tensors. Es, por tanto, una pieza pensada para servir en produccion con vLLM antes que para entrenamiento o experimentacion con frameworks alternativos.

La informacion publica disponible es escasa: el repositorio esta restringido (gated) y no se han publicado resultados de benchmarks, composicion del dataset de calibracion ni detalles del pipeline QAT/QAD mas alla de las etiquetas del repositorio. Esta ficha refleja exclusivamente los datos verificables del modelo base y de la tarjeta publica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5), segun modelo base |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 32.768 tokens (segun nombre del modelo, sufijo 32K) |
| Tipos de cuantizacion | NVFP4 (4 bits empaquetado) con compressed-tensors; etiquetado como 8-bit en Hugging Face |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), compatible con vLLM |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del checkpoint Qwen/Qwen3.5-9B, un transformer decoder-only de aproximadamente 9,4 mil millones de parametros. La intervencion de qatfactory no modifica la topologia de la red: aplica Quantization-Aware Training sobre los pesos del modelo base para obtener tensores en NVFP4, un formato de coma flotante de 4 bits con escala por bloque disenado por NVIDIA para acelerar la inferencia en GPUs Blackwell. El sufijo QAD-Math-32K sugiere que el proceso de cuantizacion se ha calibrado o ajustado especificamente para tareas matematicas y para preservar una ventana de contexto de 32K tokens, aunque no se documenta la metodologia exacta.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset de calibracion, el uso de RLHF o DPO, ni sobre innovaciones adicionales como decodificacion especulativa o atencion lineal. Tampoco se detalla si el ajuste QAT se realizo solo sobre capas lineales o tambien sobre embeddings y cabezas de atencion. Toda la informacion tecnica del entrenamiento original debe consultarse en la tarjeta del modelo base Qwen/Qwen3.5-9B.

## Capacidades

- Generacion de texto y razonamiento general, heredadas del modelo base Qwen3.5-9B.
- Razonamiento matematico reforzado por el proceso de cuantizacion QAD-Math, segun la denominacion del checkpoint.
- Soporte de contextos largos de hasta 32.768 tokens, adecuado para documentos extensos y conversaciones multi-turno.
- Compatibilidad con vLLM y el formato compressed-tensors, lo que habilita inferencia de alto rendimiento en produccion.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible para este checkpoint cuantizado.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion disponible.
- Capacidades multilingues: no disponibles.
- Modo thinking, vision o audio: no disponibles para este checkpoint.

## Casos de uso

- Servicio de matematicas asistidas: el modelo puede resolver problemas de algebra, calculo y estadistica en un endpoint vLLM, aprovechando el ajuste QAD-Math para mantener precision numerica tras la cuantizacion a 4 bits.
- Analisis de documentos largos: con 32K tokens de contexto puede procesar informes, articulos o contratos completos en una sola pasada, resumiendo y extrayendo entidades sin truncar.
- Asistente de codigo en IDE: integrado via API compatible con OpenAI sobre vLLM, puede autocompletar funciones y explicar fragmentos de codigo con latencia baja gracias a los pesos NVFP4.
- Generacion de documentacion tecnica: redaccion de guias y referencias de API a partir de especificaciones y ejemplos de codigo, con contexto suficiente para mantener coherencia entre secciones.
- Extraccion estructurada de datos: conversion de texto libre en JSON validado para pipelines ETL, usando el modo de salida estructurada de vLLM.
- Chatbot de atencion al cliente: gestion de conversaciones multi-turno con historial largo, desplegado en GPUs de gama media gracias a la reduccion de memoria del checkpoint cuantizado.
- Prototipado de agentes con herramientas: si el modelo base conserva sus capacidades de function calling, puede orquestar llamadas a APIs en flujos de automatizacion; conviene validarlo antes de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9-10 GB solo para pesos en NVFP4, mas cache KV; con contexto de 32K y batch moderado, el consumo realista se situa en 16-24 GB.
- GPUs recomendadas: NVIDIA Blackwell (B200, RTX 5090) para aprovechar las instrucciones nativas NVFP4; en arquitecturas anteriores (Hopper, Ada) el formato puede descomprimirse pero sin aceleracion dedicada.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) y RTX 5090 (32 GB) con contexto reducido; en RTX 4080 (16 GB) solo con contextos cortos.
- Opciones de despliegue: vLLM es la via soportada oficialmente; llama.cpp, Ollama y TGI no estan confirmados para este formato NVFP4.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-NVFP4-QAD-Math-32K | 9,4B | 32K | NVFP4 (compressed-tensors) | Apache 2.0 | Gated en Hugging Face |
| Qwen/Qwen3.5-9B (base) | 9,4B | no disponible | BF16 | Apache 2.0 | Publico |
| Qwen2.5-7B-Instruct (referencia de gama) | 7,6B | 32K | BF16, GPTQ, AWQ, GGUF | Apache 2.0 | Publico |
| Llama-3.1-8B-Instruct | 8,0B | 128K | BF16, GPTQ, AWQ, GGUF | Llama 3.1 Community | Gated |

La comparativa se limita a parametros, contexto y licencia, ya que no hay datos de rendimiento publicados para el checkpoint cuantizado. Frente a las alternativas, su ventaja es el formato NVFP4 nativo para vLLM en Blackwell; su desventaja es la ausencia de variantes GGUF y de benchmarks verificables.

## Limitaciones y advertencias

- Repositorio restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos.
- Sin benchmarks publicados: no hay evidencia cuantitativa de la perdida de calidad frente al modelo base en BF16.
- Cuantizacion a 4 bits: aunque sea QAT, existe riesgo de degradacion en tareas fuera del dominio matematico para el que se ajusto.
- Formato NVFP4 dependiente de hardware: el maximo rendimiento requiere GPUs Blackwell; en otras arquitecturas la ventaja de memoria se mantiene pero no la de velocidad.
- Idiomas soportados no documentados: no se puede garantizar un comportamiento multilingue solido sin evaluacion previa.
- Riesgo de alucinacion inherente a los modelos de ~9B, especialmente en contextos largos y dominios especializados.
- Compatibilidad de tool calling y agentes no verificada en este checkpoint cuantizado.
- Licencia Apache 2.0 permite uso comercial, pero debe revisarse tambien la licencia del modelo base y las condiciones del repositorio gated.
- Fecha de publicacion futura (2026-11-04) en los metadatos: conviene verificar la vigencia del repositorio antes de integrarlo en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/qatfactory/Qwen3.5-9B-NVFP4-QAD-Math-32K
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Documentacion de vLLM: https://docs.vllm.ai
- Formato compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- Documentacion de NVFP4 en NVIDIA: https://developer.nvidia.com/blog/nvfp4-explained/
