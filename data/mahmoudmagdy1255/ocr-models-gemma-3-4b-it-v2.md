# mahmoudMagdy1255/ocr-models-gemma-3-4b-it-v2

## Resumen

ocr-models-gemma-3-4b-it-v2 es un adaptador LoRA (PEFT) publicado por el usuario mahmoudMagdy1255 sobre el modelo base google/gemma-3-4b-it. Se trata de un ajuste fino orientado a tareas de OCR (reconocimiento optico de caracteres) realizado con Llama Factory sobre un dataset denominado ocr_finetune_train. El repositorio contiene unicamente los pesos del adaptador, no el modelo completo, por lo que su uso requiere cargar el modelo base de Google junto con el adaptador.

El modelo hereda la arquitectura y capacidades del Gemma 3 4B instruct de Google, un transformer multimodal de 4 mil millones de parametros con ventana de contexto de 128 000 tokens y soporte de imagenes. El ajuste fino busca especializar el comportamiento del modelo en la transcripcion y extraccion de texto a partir de imagenes, aunque la model card no detalla la composicion del dataset ni el formato de las tareas.

La relevancia de esta publicacion es limitada pero concreta: ofrece un punto de partida para quienes necesiten un modelo OCR ligero y desplegable en hardware modesto, con la salvedad de que la documentacion es practicamente inexistente y no se han publicado benchmarks ni evaluaciones cualitativas. El autor declara una perdida de validacion de 0,1818 en el mejor punto del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (heredada de google/gemma-3-4b-it) |
| Parametros totales | 4 mil millones (modelo base); el adaptador LoRA anade un numero no especificado de parametros entrenables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 000 tokens (heredada del modelo base Gemma 3 4B) |
| Tipos de cuantizacion | no disponible (el repositorio contiene pesos del adaptador en safetensors; el modelo base admite cuantizaciones estandar como int8, int4, GGUF) |
| Idiomas soportados | no disponible (el modelo base Gemma 3 soporta mas de 140 idiomas, pero el autor no declara idiomas para el adaptador) |
| Licencia | Gemma (terminos de uso de Google) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre google/gemma-3-4b-it, un transformer decoder-only multimodal que procesa texto e imagenes. El entrenamiento se realizo con Llama Factory usando PEFT 0.18.1, Transformers 5.8.0 y PyTorch 2.11.0+cu130. Los hiperparametros declarados son: learning rate 1e-4, batch size efectivo de 8 (batch 1 con 8 pasos de acumulacion), optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-8, scheduler coseno con warmup del 5 %, 4 epocas y precision mixta nativa AMP. La semilla fue 42.

El conjunto de entrenamiento se denomina ocr_finetune_train, pero no se especifica su tamano, composicion, procedencia ni el formato de las muestras (pares imagen-texto, instrucciones de transcripcion, etc.). La curva de entrenamiento muestra una perdida de entrenamiento que desciende de 0,1965 en el paso 50 a 0,0233 al final, mientras que la perdida de validacion alcanza su minimo de 0,1818 en el paso 250 (epoca 1,82) y posteriormente asciende hasta 0,2623, lo que indica sobreajuste a partir de ese punto. No se documenta ninguna innovacion tecnica adicional ni el uso de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Gemma 3 4B instruct.
- Procesamiento de imagenes y texto (el modelo base es multimodal), lo que permite tareas de transcripcion y extraccion de contenido visual.
- Especializacion declarada en OCR mediante ajuste fino supervisado, aunque sin evaluacion publica que lo respalde.
- Soporte multilingue potencial heredado del modelo base (mas de 140 idiomas segun Google), no verificado para el adaptador.
- Soporte de tool calling y function calling: no confirmado para el adaptador; el modelo base lo ofrece, pero el ajuste fino puede haber degradado esta capacidad.
- Razonamiento multi-paso y uso como agente: no documentado para el adaptador.
- Capacidad de vision: si, por herencia del modelo base; no se detalla si el adaptador conserva el proyector visual intacto.

## Casos de uso

- Digitalizacion de documentos escaneados: el adaptador puede emplearse para transcribir texto de facturas, formularios o documentos impresos, aprovechando la capacidad visual del modelo base y el ajuste especifico en OCR.
- Extraccion de datos estructurados de imagenes: conversion de tablas o campos de formularios en texto plano o JSON, util en pipelines de automatizacion documental.
- Procesamiento de tickets y recibos: lectura de importes, fechas y conceptos en imagenes de comprobantes para sistemas de contabilidad automatizada.
- Indexacion de archivos historicos: transcripcion de documentos digitalizados para su incorporacion a motores de busqueda o bases de datos documentales.
- Preprocesado en pipelines RAG: conversion de PDFs escaneados a texto antes de la generacion de embeddings, usando un modelo ligero de 4B que cabe en GPUs de consumo.
- Prototipado rapido de soluciones OCR en entornos con recursos limitados: al ser un adaptador sobre un modelo de 4B, permite experimentar con cuantizacion en una unica GPU consumer.
- Asistencia en accesibilidad: descripcion y lectura de texto presente en imagenes para aplicaciones de apoyo a personas con discapacidad visual, aunque sin garantias de precision documentadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye un model-index con la lista de resultados vacia. El unico dato cuantitativo es la perdida de validacion minima de 0,1818 alcanzada en el paso 250 del entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 4B en precision bf16 requiere aproximadamente 8-9 GB de VRAM; en cuantizacion int8 unos 4-5 GB; en int4 unos 2,5-3 GB. El adaptador LoRA anade una sobrecarga minima.
- GPU recomendadas: NVIDIA A100, H100 o L40S para despliegues de produccion con contexto largo; RTX 4090, RTX 3090 o RTX 4080 para desarrollo y prototipado.
- Cabe en GPU consumer: si, en tarjetas con al menos 8 GB de VRAM en bf16 y en tarjetas de 4-6 GB con cuantizacion int4.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador, vLLM (previa fusion del adaptador con el modelo base), llama.cpp u Ollama (requiere convertir el modelo fusionado a GGUF), TGI.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ocr-models-gemma-3-4b-it-v2 | 4B (base) + adaptador LoRA | 128 000 | Gemma | Hugging Face (94 descargas) | Ajuste OCR sin benchmarks publicados |
| google/gemma-3-4b-it | 4B | 128 000 | Gemma | Hugging Face (modelo oficial) | Modelo base multimodal, con evaluaciones publicadas por Google |
| Qwen2.5-VL-3B-Instruct | 3B | 32 768 (ampliable) | Apache 2.0 | Hugging Face | Alternativa multimodal con licencia permisiva |
| MiniCPM-V 2.6 | 8B | 32 000 | Apache 2.0 | Hugging Face | Modelo multimodal especializado en OCR y documentos, con benchmarks publicados |

La comparativa se limita a caracteristicas estructurales; no existen datos de rendimiento del adaptador que permitan una comparacion cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Ausencia total de documentacion sobre el dataset de entrenamiento, el formato de las muestras y el procedimiento de evaluacion, lo que impide reproducir o validar el ajuste.
- Sobreajuste evidente: la perdida de validacion minima se alcanza en la epoca 1,82 y empeora en las epocas posteriores hasta 0,2623, por lo que el checkpoint final puede no ser el optimo.
- No se han publicado benchmarks ni evaluaciones cualitativas; se desconoce la precision real en tareas OCR.
- Riesgo de alucinacion inherente a los modelos generativos, potencialmente agravado por un ajuste fino con datos no verificados.
- Posible degradacion de capacidades generales del modelo base (conversacion, tool calling, razonamiento) como consecuencia del ajuste especializado.
- Licencia Gemma: el uso comercial esta sujeto a los terminos de uso de Google, que incluyen restricciones y obligaciones de atribucion.
- Idiomas soportados no declarados; el comportamiento multilingue del adaptador no esta verificado.
- El repositorio contiene solo el adaptador (23,6 GB, incluyendo posiblemente checkpoints intermedios); es necesario descargar el modelo base por separado.
- Numero de descargas muy bajo (94) y ausencia de likes, lo que sugiere escasa validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mahmoudMagdy1255/ocr-models-gemma-3-4b-it-v2
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Llama Factory: https://github.com/hiyouga/LLaMA-Factory
- PEFT: https://github.com/huggingface/peft
- Terminos de licencia Gemma: https://ai.google.dev/gemma/terms
