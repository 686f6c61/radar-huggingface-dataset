# karthikcr/Qwen3-8B-W4A16-AWQ

## Resumen

Qwen3-8B-W4A16-AWQ es una cuantización de 4 bits de los pesos (W4A16, activaciones en FP16) del modelo Qwen/Qwen3-8B, publicada por el usuario karthikcr como artefacto de un proyecto personal de benchmarking de despliegue en Kubernetes. No se trata de un modelo entrenado desde cero, sino de una conversión del checkpoint oficial de Qwen aplicando la técnica AWQ (Activation-aware Weight Quantization) mediante la librería llm-compressor del ecosistema vLLM, con el objetivo de reducir la huella de memoria del modelo base manteniendo la calidad de generación.

El modelo hereda la arquitectura y capacidades del Qwen3-8B original: un transformer denso de aproximadamente 8.190 millones de parámetros, con modo de razonamiento (thinking) activado por defecto y plantilla de chat compatible con los transformers recientes. La cuantización se almacena en formato compressed-tensors, lo que permite cargarla directamente en vLLM sin pasos de conversión adicionales. El repositorio ocupa 6,1 GB, frente a los aproximadamente 16 GB que ocuparía el checkpoint en BF16.

Su relevancia práctica es doble: por un lado, demuestra un flujo reproducible de cuantización AWQ con llm-compressor sobre un modelo de la familia Qwen3; por otro, ofrece una alternativa ligera para desplegar Qwen3-8B en GPUs con menos VRAM. Conviene señalar que es un artefacto de autor individual, con 39 descargas y sin métricas de calidad publicadas en la model card más allá de una referencia al repositorio de GitHub del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3), derivado de Qwen/Qwen3-8B |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3-8B) |
| Tipos de cuantizacion | W4A16 asimetrica (pesos INT4, activaciones FP16), esquema W4A16_ASYM; lm_head excluido de la cuantizacion |
| Idiomas soportados | no disponible en la informacion proporcionada (heredados del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato compressed-tensors (compatible con vLLM) |

## Arquitectura y entrenamiento

El modelo no ha sido entrenado: es una cuantizacion post-entrenamiento del checkpoint Qwen/Qwen3-8B (revision b968826d9c46dd6066d109eabc6255188de91218). La arquitectura subyacente es la del Qwen3-8B original, un transformer denso de 8.190 millones de parametros; los detalles de composicion del dataset de preentrenamiento, numero de tokens y fases de alineacion (RLHF/DPO) no se recogen en la informacion proporcionada y deben consultarse en la model card del modelo base.

El proceso de cuantizacion se realizo con llmcompressor 0.14.0.1 y compressed-tensors 0.19.0, usando la receta `{"awq": {"duo_scaling": "both"}, "quant": {"targets": ["Linear"], "scheme": "W4A16_ASYM", "ignore": ["lm_head"]}}`. La calibracion empleo 512 muestras del split `train[:512]` del dataset mlabonne/open-perfectblend, con longitud maxima de secuencia de 2048 y semilla 42. El trabajo se ejecuto en una NVIDIA A100-SXM4-40GB en Modal, con un tiempo total de 1189,2 s (4,2 s de carga, 1163,9 s de calibracion y 21,1 s de guardado) y un coste de 0,9869 USD a precios de lista. La innovacion tecnica relevante es el uso de duo_scaling en AWQ, que escala tanto pesos como activaciones para reducir el error de cuantizacion, y la conservacion del lm_head en precision original para no degradar la distribucion de logits.

## Capacidades

- Generacion de texto conversacional y continuacion de texto, con pipeline text-generation.
- Modo de razonamiento (thinking) activado por defecto, heredado de Qwen3; puede desactivarse pasando `chat_template_kwargs={"enable_thinking": false}` para respuestas directas.
- Razonamiento multi-paso y cadenas de pensamiento, segun las capacidades del modelo base Qwen3-8B.
- Generacion de codigo y matematicas: capacidades heredadas del modelo base, no verificadas de forma independiente en esta cuantizacion.
- Soporte de tool calling / function calling: no documentado de forma explicita en la model card de esta cuantizacion; depende de la plantilla de chat del modelo base.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision y audio: no soportados (modelo de texto).
- Integracion directa con vLLM mediante el formato compressed-tensors.

## Casos de uso

- Despliegue de un asistente conversacional en GPUs de 24 GB: con pesos INT4 y KV cache en FP16, el modelo permite servir Qwen3-8B en una RTX 4090 o L4 con margen para contexto moderado, algo inviable con el checkpoint BF16 en la misma GPU.
- Razonamiento con modo thinking en pipelines de analisis: activando el modo por defecto se obtienen cadenas de razonamiento utiles para tareas de clasificacion compleja, extraccion estructurada o resolucion de problemas, y puede desactivarse para reducir latencia en produccion.
- Generacion de codigo asistida en entornos con VRAM limitada: el modelo hereda las capacidades de codigo de Qwen3-8B y puede integrarse en servidores vLLM compartidos donde el coste por GPU es un factor critico.
- Benchmarking de cuantizacion: el repositorio del autor incluye resultados de throughput, latencia y calidad frente al modelo BF16, lo que lo convierte en un punto de partida reproducible para comparar AWQ W4A16 con otras tecnicas (GPTQ, FP8) sobre la misma base.
- Prototipado rapido en Kubernetes: el autor lo emplea en un proyecto de despliegue en K8s (reel-history-k8s); sirve como ejemplo de servicio vLLM containerizado con un modelo de 6,1 GB de pesos.
- Evaluacion de degradacion por cuantizacion: util para investigadores que quieran medir la perdida de calidad de AWQ 4 bits sobre Qwen3-8B en tareas concretas antes de adoptar la cuantizacion en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al README del repositorio de GitHub del autor (https://github.com/kikugo/reel-history-k8s) para consultar throughput, latencia y calidad frente al modelo BF16, generados a partir de su carpeta `results/`. No se reproducen cifras aqui porque no estan incluidas en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB solo para pesos en INT4; con KV cache y overhead de vLLM, un despliegue practico parte de unos 8-10 GB y crece con la longitud de contexto y el numero de secuencias concurrentes.
- GPU recomendadas: NVIDIA A100-SXM4-40GB (la usada para la calibracion), H100, L40S o A10G para produccion; RTX 4090 (24 GB) y L4 (24 GB) son viables para inferencia con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 (24 GB) y potencialmente en GPUs de 16 GB con contexto reducido y batch pequeno; no se garantiza en GPUs de 8 GB por el KV cache.
- Opciones de despliegue: vLLM es la via soportada de forma nativa (`vllm serve karthikcr/Qwen3-8B-W4A16-AWQ`). El formato compressed-tensors no es directamente compatible con llama.cpp u Ollama sin conversion adicional a GGUF, que no se proporciona en el repositorio.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; el autor remite a su repositorio de GitHub.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| karthikcr/Qwen3-8B-W4A16-AWQ | 8,19 B | no disponible | W4A16 AWQ (compressed-tensors) | Apache 2.0 | HuggingFace, 39 descargas |
| Qwen/Qwen3-8B (base) | 8,19 B | no disponible en esta ficha | BF16 | Apache 2.0 | HuggingFace, checkpoint oficial |
| Otras cuantizaciones comunitarias de Qwen3-8B (GPTQ, AWQ, GGUF) | 8,19 B | heredado del base | INT4 / INT8 / GGUF | Apache 2.0 (segun autor) | HuggingFace, multiple |

La comparacion de rendimiento frente a estas alternativas no esta disponible en la informacion proporcionada. La diferencia principal frente al modelo base es la reduccion de huella de memoria (6,1 GB de repositorio frente a un checkpoint BF16 de aproximadamente 16 GB), a costa de una posible degradacion de calidad no cuantificada en la model card.

## Limitaciones y advertencias

- Artefacto de autor individual con 39 descargas y 0 likes: no ha pasado por un proceso de validacion de la comunidad ni de Qwen; tratar como experimental.
- No se publican metricas de calidad (perplejidad, MMLU, HumanEval) en la model card; la degradacion respecto al BF16 es desconocida sin consultar el repositorio del autor.
- La calibracion uso solo 512 muestras de un unico dataset (open-perfectblend) con longitud maxima de 2048; el comportamiento en contextos mas largos o dominios muy distintos (codigo, matematicas, idiomas no ingleses) puede degradarse mas de lo esperado.
- Sesgos conocidos: no documentados en la informacion proporcionada; hereda los del modelo base Qwen3-8B.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; el modo thinking por defecto puede aumentar la latencia y el consumo de tokens si no se desactiva.
- Limitaciones de idioma: no se especifican los idiomas soportados en esta cuantizacion; verificar contra la model card de Qwen3-8B antes de usar en produccion multilingue.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias; conviene revisar tambien la licencia del modelo base.
- El formato compressed-tensors limita el despliegue a vLLM (y stacks compatibles); no hay GGUF publicado para llama.cpp u Ollama.
- La fecha de creacion del repositorio (2026-10-25) y las versiones de librerias citadas (torch 2.13.0, transformers 5.17.0) deben verificarse contra el entorno de destino para evitar incompatibilidades.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/karthikcr/Qwen3-8B-W4A16-AWQ
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio del proyecto del autor: https://github.com/kikugo/reel-history-k8s
- llm-compressor: https://github.com/vllm-project/llm-compressor
- Dataset de calibracion: https://huggingface.co/datasets/mlabonne/open-perfectblend
- Precios de Modal (referencia de coste): https://modal.com/pricing
