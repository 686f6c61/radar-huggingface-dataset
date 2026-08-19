# DariusTheGeek/waxal-sna-omniasr-ctc-7b

## Resumen

El modelo `waxal-sna-omniasr-ctc-7b` es un sistema de reconocimiento automático de voz (ASR) para el idioma shona, desarrollado por DariusTheGeek como parte de la solución WAXAL ASR. Se trata de un fine-tuning del modelo `facebook/omniASR-CTC-7B-v2` de Meta AI, que pertenece a la familia Omnilingual ASR, diseñada para cubrir más de 1600 idiomas con una arquitectura basada en CTC (Connectionist Temporal Classification). Este modelo concreto se ha ajustado exclusivamente para shona, un idioma bantú hablado principalmente en Zimbabue, con el objetivo de ofrecer transcripción de voz a texto en un contexto de bajos recursos lingüísticos.

El modelo tiene 7 mil millones de parámetros y se distribuye en tres checkpoints independientes (pasos 3563, 4581 y 5090) que se combinan mediante una estrategia de ROVER conservador a nivel de palabra para producir una única hipótesis. No está pensado para usarse de forma aislada, sino como un componente dentro de un pipeline de ensamblaje más amplio que incluye enrutamiento, decodificación, fusión y post-procesado. Su relevancia radica en abordar la escasez de modelos ASR de calidad para idiomas africanos de bajo recursos, aprovechando un modelo base multilingüe de gran tamaño y un dataset específico (WaxalNLP).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con cabeza CTC (Connectionist Temporal Classification) |
| Parametros totales | 7B (según nomenclatura del modelo base) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo base soporta audio de longitud ilimitada según la documentación de la familia) |
| Tipos de cuantizacion | no disponible (solo pesos en punto flotante de 32 bits) |
| Idiomas soportados | Shona (sn) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura CTC del modelo `omniASR-CTC-7B-v2` de Meta AI, que emplea un codificador transformer con una cabeza de clasificación temporal conexionista. Esta arquitectura permite una inferencia rápida y eficiente, adecuada para transcripción en tiempo real o de alto rendimiento. El fine-tuning se realizó sobre el conjunto de datos supervisado de Waxal Lingala/Shona del dataset `google/WaxalNLP`, con una semilla aleatoria de 42. Se generaron tres checkpoints intermedios (pasos 3563, 4581 y 5090) que se combinan mediante una fusión ROVER conservadora a nivel de palabra para mejorar la robustez de la transcripción. No se menciona el uso de técnicas como RLHF o DPO; el entrenamiento es un ajuste supervisado estándar sobre datos de audio transcrito.

## Capacidades

- Reconocimiento de voz automático para el idioma shona, convirtiendo audio en texto.
- Transcripción de audio de longitud variable (el modelo base soporta audio ilimitado, aunque este fine-tuning no especifica límites concretos).
- Forma parte de un sistema de ensamblaje que combina múltiples modelos y estrategias de decodificación para mejorar la precisión.
- No incluye capacidades de tool calling, generación de código, razonamiento multi-paso ni otras funcionalidades propias de modelos de lenguaje generales; es un modelo especializado en ASR.

## Casos de uso

- Transcripción de reuniones y entrevistas en shona: el modelo puede convertir grabaciones de audio en texto de manera automática, facilitando la documentación y el análisis posterior. Su arquitectura CTC permite un procesamiento rápido, adecuado para volúmenes moderados de audio.
- Subtitulado automático de vídeos en shona: al transcribir el audio, se pueden generar subtítulos para contenidos multimedia, mejorando la accesibilidad en comunidades de habla shona.
- Asistente de voz para servicios locales: integrado en aplicaciones de atención al cliente o asistentes personales, permite interactuar por voz en shona, aunque requiere el pipeline completo de la solución WAXAL para un funcionamiento óptimo.
- Archivado y búsqueda de contenido oral: transcripciones de archivos históricos o entrevistas etnográficas en shona, permitiendo búsqueda por texto en colecciones de audio.
- Herramientas de aprendizaje de idiomas: generación de material de práctica a partir de audio en shona, como ejercicios de dictado o transcripción.
- Investigación lingüística: análisis fonético y morfológico del shona a partir de transcripciones automáticas, siempre que se valide la calidad con hablantes nativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este fine-tuning en la información disponible. El modelo base `omniASR-CTC-7B-v2` reporta una tasa de error de palabra (WER) del 8,14% en el conjunto de referencia Open ASR, pero este dato no es directamente aplicable al modelo ajustado para shona. No se dispone de métricas como MMLU, HumanEval o GSM8K, ya que no es un modelo de lenguaje general.

## Requisitos de hardware

- VRAM estimada: cada checkpoint pesa aproximadamente 26 GB en FP32, lo que requiere al menos 28 GB de VRAM para cargar un único checkpoint en precisión completa. Si se convierte a FP16, la necesidad se reduce a ~14 GB.
- GPU recomendadas: para FP32 se necesita una GPU con al menos 32 GB de VRAM (por ejemplo, A100 40GB, A6000 48GB). Para FP16, una RTX 4090 (24 GB) o A100 40GB son suficientes.
- No se ofrecen cuantizaciones de menor precisión (GGUF, INT8, etc.), por lo que el despliegue en hardware de consumo es limitado.
- Opciones de despliegue: el modelo se carga mediante la librería `fairseq2` y se ejecuta con el script `inference/decode/omniasr.py` del repositorio de la solución WAXAL. No se menciona compatibilidad con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no se han publicado datos concretos, pero al ser un modelo CTC con batch-size-1, la inferencia es relativamente rápida en comparación con modelos de decodificación autoregresiva.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `waxal-sna-omniasr-ctc-7b` (este) | 7B | no disponible | Shona | Apache-2.0 | HuggingFace |
| `facebook/omniASR-CTC-7B-v2` (base) | 7B | audio ilimitado | 1600+ | Apache-2.0 | HuggingFace |
| `openai/whisper-large-v3` | 1.5B | 30 segundos de audio | 99 | MIT | HuggingFace |

El modelo base ofrece cobertura multilingüe, mientras que este fine-tuning se especializa en shona. Whisper large-v3 es una alternativa con menor número de parámetros y soporte para shona, pero no se dispone de comparativas de rendimiento directas en este idioma. La disponibilidad de cuantizaciones y herramientas de despliegue es mayor en Whisper, lo que facilita su uso en producción.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para shona y no debe usarse para otros idiomas; su rendimiento fuera de este idioma no está garantizado.
- Está diseñado como componente de un ensamblaje, no para uso independiente. La decodificación con un solo checkpoint puede producir resultados subóptimos; se recomienda usar los tres checkpoints con la fusión ROVER descrita.
- No se han publicado métricas de rendimiento específicas para este fine-tuning, por lo que la calidad real en tareas de producción no está validada externamente.
- El dataset de entrenamiento (WaxalNLP) puede contener sesgos regionales o de dominio; la transcripción de acentos o variantes dialectales del shona puede verse afectada.
- No se ofrecen cuantizaciones, lo que limita el despliegue en hardware de gama media o baja.
- Aunque la licencia Apache-2.0 permite uso comercial, el modelo depende de la infraestructura del repositorio WAXAL para su correcto funcionamiento, lo que añade una dependencia externa.
- El tamaño del repositorio (78 GB) y la necesidad de tres checkpoints incrementan los costes de almacenamiento y transferencia.

## Enlaces

- [HuggingFace - DariusTheGeek/waxal-sna-omniasr-ctc-7b](https://huggingface.co/DariusTheGeek/waxal-sna-omniasr-ctc-7b)
- [Repositorio de la solución WAXAL ASR](https://github.com/DariusTheGeek/waxal-asr-solution)
- [Modelo base - facebook/omniASR-CTC-7B-v2](https://huggingface.co/facebook/omniASR-CTC-7B-v2)
- [Dataset - google/WaxalNLP](https://huggingface.co/datasets/google/WaxalNLP)
- [GitHub de Omnilingual ASR de Meta AI](https://github.com/facebookresearch/omnilingual-asr)
- [Documentación de modelos CTC en DeepWiki](https://deepwiki.com/facebookresearch/omnilingual-asr/2.2.2-ctc-models-(fast-asr))
- [Ficha de Omnilingual ASR en STT Index](https://speechtotext.dev/model/omnilingual-asr/)
