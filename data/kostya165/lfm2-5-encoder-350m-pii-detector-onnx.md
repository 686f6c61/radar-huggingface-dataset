# Kostya165/LFM2.5-Encoder-350M-PII-Detector-ONNX

## Resumen

LFM2.5-Encoder-350M-PII-Detector-ONNX es la exportacion a formato ONNX (FP32, opset 18) del modelo LiquidAI/LFM2.5-Encoder-350M-PII-Detector, un encoder bidireccional de 350 millones de parametros especializado en deteccion de informacion personal identificable (PII) mediante etiquetado de tokens (token classification). Lo publica el usuario Kostya165 en HuggingFace como derivado del modelo original de Liquid AI, y su proposito es facilitar el despliegue en entornos de inferencia sin dependencia de PyTorch, usando ONNX Runtime con soporte para CPU y otros execution providers.

El modelo resuelve una tarea concreta y muy demandada en produccion: identificar y clasificar entidades PII (nombres, correos, telefonos, direcciones, identificadores, etc.) en texto multilingue. La cabeza de clasificacion emplea el esquema BIOES con 161 etiquetas que cubren 40 tipos de PII, lo que permite delimitar spans completos de entidad y no solo tokens sueltos.

Es relevante ahora porque ofrece una alternativa ligera (1,4 GB en FP32, un unico fichero `model.onnx`) para pipelines de anonimizacion, cumplimiento normativo (RGPD) y filtrado de datos sensibles, con un grafo de un solo forward sin KV cache y dimensiones dinamicas de batch y secuencia. La exportacion declara una diferencia maxima absoluta de 2,6e-5 frente al modelo PyTorch en fp32 y coincidencia en las etiquetas argmax.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer bidireccional (LFM2.5 Encoder) con cabeza de token classification BIOES |
| Parametros totales | 350M (segun nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32 (unica variante publicada en este repo) |
| Idiomas soportados | en, de, fr, es, pt, it, pl, ru, zh, ja, ko, ar, hi, id, vi, th |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | ONNX (opset 18, fichero unico `model.onnx`, ~1,4 GB) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer bidireccional (no generativo) con una cabeza de clasificacion de tokens que produce logits de forma `[batch, sequence, 161]`. Las etiquetas siguen el esquema BIOES: `O` fuera de entidad, `B`/`I`/`E` para inicio, interior y fin de un span multi-token, y `S` para spans de un solo token. El grafo ONNX es un unico forward sin KV cache, con `input_ids` y `attention_mask` de tipo int64 y dimensiones dinamicas de batch y secuencia.

La informacion disponible no detalla la composicion del dataset de entrenamiento, el numero de tokens utilizados ni si hubo fases de ajuste fino especificas (RLHF/DPO no aplica a un modelo discriminativo de este tipo). Tampoco se documentan innovaciones tecnicas adicionales mas alla de la exportacion ONNX verificada numericamente contra el modelo PyTorch original con `attn_implementation="eager"` en fp32.

## Capacidades

- Deteccion y clasificacion de PII en texto mediante etiquetado de tokens con esquema BIOES.
- Cobertura de 40 tipos de PII distintos repartidos en 161 etiquetas.
- Delimitacion de spans completos de entidad (inicio, interior y fin), no solo tokens aislados.
- Soporte multilingue para 16 idiomas: ingles, aleman, frances, espanol, portugues, italiano, polaco, ruso, chino, japones, coreano, arabe, hindi, indonesio, vietnamita y tailandes.
- Inferencia via ONNX Runtime con execution providers configurables (CPU, CUDA, etc.).
- Procesamiento por lotes con batch y longitud de secuencia dinamicos, incluidos lotes con padding y secuencias de longitud 1.
- No soporta generacion de texto, tool calling, agentes ni razonamiento multi-paso: es un modelo puramente discriminativo.

## Casos de uso

- Anonimizacion previa a almacenamiento: el modelo etiqueta spans de PII en documentos y registros antes de persistirlos, permitiendo redactar o enmascarar correos, telefonos, nombres e identificadores con delimitacion exacta gracias al esquema BIOES.
- Cumplimiento del RGPD en pipelines de datos: integrado como paso de preprocesado en ETL, detecta datos personales en textos multilingues antes de que entren en sistemas de analitica o entrenamiento.
- Filtrado de logs y trazas de aplicaciones: se ejecuta sobre lineas de log para detectar y eliminar credenciales o datos de clientes antes de enviarlas a sistemas de observabilidad.
- Moderacion y saneamiento de datasets: permite auditar corpus multilingues (16 idiomas) para localizar PII antes de publicarlos o compartirlos.
- Enmascaramiento en atencion al cliente: procesa transcripciones de conversaciones para redactar datos sensibles antes de su almacenamiento o revision por terceros.
- Despliegue en entornos sin PyTorch: gracias a la exportacion ONNX con dimensiones dinamicas, puede servirse con ONNX Runtime en CPU o GPU dentro de servicios ligeros, contenedores o funciones serverless.
- Preprocesado en pipelines de NLP: como componente previo a tareas de resumen, clasificacion o traduccion, para eliminar PII antes de enviar texto a modelos generativos de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica de validacion documentada es la fidelidad de la exportacion ONNX frente al modelo PyTorch en fp32: diferencia absoluta maxima de 2,6e-5 y coincidencia de etiquetas argmax en las formas comprobadas (incluidos lotes con padding y longitud 1).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,4 GB para los pesos FP32, mas memoria para activaciones y buffers de inferencia (dependiente del tamano de batch y secuencia).
- GPU recomendadas: cualquier GPU con al menos 2-3 GB de memoria libre para lotes pequenos; tarjetas como RTX 3060, RTX 4090, A100 o H100 son suficientes y sobradas para este tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna con 4 GB o mas de VRAM; tambien puede ejecutarse en CPU con ONNX Runtime.
- Opciones de despliegue: ONNX Runtime (CPUExecutionProvider, CUDAExecutionProvider u otros), con tokenizer de HuggingFace (`AutoTokenizer`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles; dependen del hardware, del execution provider y del tamano de batch y secuencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| LFM2.5-Encoder-350M-PII-Detector-ONNX (este) | 350M | no disponible | Token classification PII (40 tipos, 161 etiquetas) | LFM Open License v1.0 | ONNX |
| LiquidAI/LFM2.5-Encoder-350M-PII-Detector | 350M | no disponible | Token classification PII | LFM Open License v1.0 | PyTorch (safetensors) |
| Alternativas genericas de NER (p. ej. modelos BERT-base NER) | ~110M-340M | 512 tokens tipicos | NER general (PER, ORG, LOC, MISC) | variable | safetensors, ONNX |

La comparativa con modelos de NER genericos es orientativa: este modelo esta especializado en 40 tipos de PII y 16 idiomas, mientras que los modelos NER convencionales suelen cubrir pocas categorias y menos idiomas. No se dispone de datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- No hay resultados de benchmarks publicados, por lo que el rendimiento real en deteccion de PII no esta cuantificado en la informacion disponible.
- Al ser un modelo discriminativo, puede producir falsos negativos (PII no detectada) y falsos positivos; en produccion conviene combinarlo con reglas y validacion humana en casos criticos.
- La longitud de contexto no esta documentada; secuencias muy largas pueden degradar la deteccion o requerir truncado.
- La cobertura linguistica se limita a los 16 idiomas declarados; otros idiomas no estan soportados de forma fiable.
- La licencia LFM Open License v1.0 es una licencia "other" con condiciones especificas; es imprescindible revisar el fichero LICENSE antes de un uso comercial.
- El modelo es un derivado del modelo de Liquid AI; los terminos de uso, reproduccion y distribucion heredan las condiciones de la licencia original.
- El repositorio tiene un volumen de descargas muy bajo (22) y no cuenta con likes, lo que sugiere poca validacion por parte de la comunidad.
- La exportacion solo se ofrece en FP32; no hay variantes cuantizadas (INT8, FP16) en este repositorio, lo que limita optimizaciones de latencia en CPU.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Kostya165/LFM2.5-Encoder-350M-PII-Detector-ONNX
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-Encoder-350M-PII-Detector
- Licencia LFM Open License v1.0: https://huggingface.co/Kostya165/LFM2.5-Encoder-350M-PII-Detector-ONNX/blob/main/LICENSE
- ONNX Runtime: https://onnxruntime.ai/
