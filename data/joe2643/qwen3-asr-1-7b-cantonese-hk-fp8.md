# joe2643/Qwen3-ASR-1.7B-Cantonese-HK-FP8

## Resumen
Qwen3-ASR-1.7B-Cantonese-HK-FP8 es una version cuantizada en FP8 (W8A8) de un fine-tune del modelo de reconocimiento automatico del habla Qwen3-ASR-1.7B de Alibaba Qwen, especializado en cantonés coloquial de Hong Kong con code-switching a ingles y salida en chino tradicional de Hong Kong. Lo publica el usuario joe2643 en Hugging Face bajo licencia Apache 2.0, y su proposito es ofrecer una variante mas ligera (2,67 GB frente a 4,08 GB en BF16) del fine-tune original sin degradar la precision de transcripcion.

El modelo resuelve el problema de la transcripcion de audio en una variante linguistica poco cubierta por los ASR genericos: el cantonés hablado de Hong Kong, con mezcla frecuente de terminos ingleses y normalizacion a caracteres tradicionales. La cuantizacion se aplica solo al decodificador de texto, manteniendo el encoder de audio en BF16, lo que preserva la calidad de la representacion acustica.

Es relevante para desarrolladores que despliegan ASR en produccion con vLLM y necesitan reducir huella de memoria o aumentar el espacio de KV-cache para peticiones concurrentes. No obstante, el propio autor advierte que en una RTX 4090 esta version FP8 resulto unas 3,6 veces mas lenta que BF16, por lo que su ventaja es principalmente de memoria y no de velocidad en GPUs consumer Ada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder para ASR (Qwen3-ASR), con "thinker" y audio tower; cuantizacion selectiva del decodificador de texto |
| Parametros totales | 2.038.052.480 (aproximadamente 2,04 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el ejemplo de uso fija max_model_len=4096 y max_new_tokens=256 |
| Tipos de cuantizacion | FP8 W8A8 (esquema FP8_DYNAMIC: pesos FP8 E4M3 por canal, activaciones FP8 por token dinamicas); encoder de audio, embeddings y lm_head en BF16 |
| Idiomas soportados | yue (cantonés, yue-HK), zh (chino), en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (incluye recipe.yaml); existe repo GGUF separado del mismo autor |

## Arquitectura y entrenamiento
El modelo parte de Qwen/Qwen3-ASR-1.7B, un ASR basado en transformer con un encoder de audio (audio_tower) y un decodificador de texto (thinker), sobre el que se aplico un fine-tune para cantonés de Hong Kong coloquial con code-switching a ingles y salida en chino tradicional de Hong Kong. La model card no detalla el volumen de datos de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; esa informacion no esta disponible.

La innovacion tecnica de esta version concreta es la cuantizacion. Se genero con llm-compressor 0.11.0 y compressed-tensors 0.16.0 en modo data-free, aplicando FP8_DYNAMIC unicamente a las capas Linear del decodificador de texto (thinker.model.layers.*), mientras que el encoder de audio (thinker.audio_tower.*), los embeddings y el lm_head se mantienen en BF16. El alcance de cuantizacion es el mismo que el de otras variantes para el modelo base (vrfai/Qwen3-ASR-1.7B-fp8 y UrocyonF/Qwen3-ASR-1.7B-NVFP4), y se incluye el recipe.yaml para reproducibilidad.

## Capacidades
- Reconocimiento automatico del habla (transcripcion de audio a texto) en cantonés de Hong Kong coloquial.
- Manejo de code-switching cantonés-ingles dentro de la misma locucion.
- Salida en chino tradicional de Hong Kong (caracteres hant, convencion HK).
- Soporte de los idiomas yue, zh y en, con forzado de idioma en la llamada de transcripcion (por ejemplo, language="Cantonese").
- Procesamiento por lotes de audio (batch), adecuado para transcribir volumenes grandes de clips.
- Integracion con vLLM mediante la libreria qwen-asr (extra [vllm]); compatible con endpoints.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision ni audio en tiempo real mas alla de la transcripcion.

## Casos de uso
- Transcripcion de contenido audiovisual en cantonés: procesar por lotes programas, podcasts o videos de YouTube en yue-HK para generar subtitulos en chino tradicional de Hong Kong; el modelo esta evaluado precisamente sobre un conjunto de YouTube conversacional de 279 clips (1,75 h).
- Subtitulado y archivado de reuniones con code-switching: reuniones de empresa en Hong Kong donde se mezcla cantonés e ingles se transcriben manteniendo los terminos ingleses, gracias al entrenamiento especifico en code-switching.
- Servicio de atencion al cliente por voz: desplegado con vLLM y gpu_memory_utilization ajustado, permite servir peticiones concurrentes de transcripcion en cantonés con mayor espacio de KV-cache que la version BF16.
- Investigacion linguistica y corpus: generacion de transcripciones normalizadas (OpenCC t2s, normalizacion de numeros y eliminacion de espacios en la evaluacion) para construir corpus de habla cantonesa.
- Moderacion y analisis de contenido en plataformas: transcripcion masiva de audio subido por usuarios en yue/zh/en para clasificacion posterior, aprovechando el procesamiento por lotes.
- Despliegue en entornos con memoria limitada: al reducir los pesos a 2,67 GB, permite alojar el modelo junto con otros servicios en una misma GPU o en GPUs con menos VRAM que la version BF16.
- Pipeline de accesibilidad: conversion de audio a texto en tiempo casi interactivo (p50 de 0,50 s por clip en RTX 4090) para aplicaciones de subtitulado en directo o asistencia a personas con discapacidad auditiva.

## Benchmarks y rendimiento
Resultados publicados por el autor (RTX 4090, vLLM 0.14.0 via qwen-asr[vllm] 0.0.6, decodificacion greedy, idioma forzado a cantonés). CER tras normalizacion OpenCC t2s, numeros y eliminacion de espacios.

| Modelo | FLEURS yue_hant_hk (819 clips) | Test conversacional YouTube HK (279 clips, 1,75 h) | Tiempo por lote, FLEURS (2,65 h de audio) | p50 por clip |
|---|---:|---:|---:|---:|
| BF16 | 3,96% | 11,40% | 11,6 s | 0,22 s |
| FP8 (este repo) | 4,05% | 11,23% | 41,8 s | 0,50 s |
| NVFP4A16 | 4,49% | 12,52% | 8,4 s | 0,13 s |

Interpretacion del autor: la precision es practicamente identica a BF16 (+0,09 puntos en FLEURS, -0,17 puntos en habla conversacional); el beneficio principal es un 35% menos de peso y mas espacio de KV-cache para peticiones concurrentes. En velocidad, en una RTX 4090 esta version fue unas 3,6 veces mas lenta que BF16, porque los tensor cores FP8 requieren compute capability 8.9 o superior (Ada, Hopper, Blackwell) y el autor no ha medido el comportamiento en Hopper/Blackwell ni en versiones mas recientes de vLLM.

## Requisitos de hardware
- VRAM estimada para inferencia: pesos de 2,67 GB en FP8; con overhead de runtime, encoder en BF16 y KV-cache, se recomienda al menos 6-8 GB de VRAM para uso con vLLM (estimacion orientativa, no publicada por el autor).
- GPU recomendadas: RTX 4090 (medida por el autor), asi como GPUs Hopper (H100) y Blackwell, donde se espera que los tensor cores FP8 aprovechen la cuantizacion; en Ada la ganancia de velocidad no se materializo.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas de VRAM (por ejemplo RTX 3060 Ti/4060 Ti en adelante); en una RTX 4090 el autor midio p50 de 0,50 s por clip.
- Opciones de despliegue: vLLM 0.14.0 mediante qwen-asr[vllm] 0.0.6 (soporte oficial de compressed-tensors); para llama.cpp u Ollama existe el repo GGUF del mismo autor (joe2643/Qwen3-ASR-1.7B-Cantonese-HK-GGUF).
- Latencia y throughput: en RTX 4090, lote FLEURS completo (2,65 h de audio) en 41,8 s; p50 de 0,50 s por clip individual. En BF16 el mismo lote tarda 11,6 s y el p50 es de 0,22 s. No hay datos de throughput en H100 ni en otras GPUs.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER FLEURS yue_hant_hk | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| Qwen3-ASR-1.7B-Cantonese-HK-FP8 (este) | 2,04 B | no disponible | 4,05% | Apache 2.0 | Hugging Face (safetensors, vLLM) |
| Qwen3-ASR-1.7B-Cantonese-HK (BF16) | 2,04 B | no disponible | 3,96% | Apache 2.0 | Hugging Face (repo del mismo autor, segun la model card) |
| Qwen3-ASR-1.7B-Cantonese-HK NVFP4A16 | 2,04 B | no disponible | 4,49% | Apache 2.0 | Hugging Face (repo del mismo autor, segun la model card) |
| Qwen3-ASR-1.7B (base) | 2,04 B | no disponible | no disponible | Apache 2.0 (modelo base Qwen) | Hugging Face (Qwen/Qwen3-ASR-1.7B) |

La comparativa directa se limita a las variantes del mismo fine-tune, ya que la informacion proporcionada no incluye resultados de otros sistemas ASR (por ejemplo Whisper) sobre yue-HK. El autor cita como referencias de cuantizacion del modelo base vrfai/Qwen3-ASR-1.7B-fp8 y UrocyonF/Qwen3-ASR-1.7B-NVFP4, sin datos de CER publicados en la informacion disponible.

## Limitaciones y advertencias
- La cuantizacion FP8 no aporta velocidad en GPUs con compute capability inferior a 8.9: en RTX 4090 el modelo es aproximadamente 3,6 veces mas lento que BF16; para velocidad en esa GPU el autor recomienda BF16 o NVFP4.
- El beneficio de FP8 en Hopper y Blackwell no ha sido medido por el autor, por lo que la mejora de rendimiento en esas arquitecturas es una expectativa, no un dato.
- El modelo esta especializado en cantonés de Hong Kong; su comportamiento en otras variantes del cantonés (Guangdong, Macao) o en chino mandarin no esta documentado en la informacion disponible.
- La evaluacion se realizo con el idioma forzado a cantonés; el rendimiento en deteccion automatica de idioma o en audio multilingue sin forzado no se ha publicado.
- Riesgo de alucinacion y errores en audio ruidoso: el CER en habla conversacional de YouTube (11,23%) es casi el triple que en FLEURS (4,05%), lo que sugiere degradacion notable en audio espontaneo, con ruido o solapamiento de hablantes.
- No se documentan sesgos especificos ni evaluaciones de robustez por acento, edad o genero; se desconoce su comportamiento en estos ejes.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo base Qwen3-ASR-1.7B debe verificarse por separado para confirmar compatibilidad de terminos en produccion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion de la comunidad ni reportes independientes de calidad.
- El uso requiere la libreria qwen-asr con extra [vllm] en una version concreta (0.0.6) y vLLM 0.14.0; versiones distintas pueden no cargar el checkpoint compressed-tensors correctamente.

## Enlaces
- Repositorio Hugging Face (FP8): https://huggingface.co/joe2643/Qwen3-ASR-1.7B-Cantonese-HK-FP8
- Repositorio GGUF del mismo autor: https://huggingface.co/joe2643/Qwen3-ASR-1.7B-Cantonese-HK-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Variante FP8 de referencia del modelo base: https://huggingface.co/vrfai/Qwen3-ASR-1.7B-fp8
- Variante NVFP4 de referencia del modelo base: https://huggingface.co/UrocyonF/Qwen3-ASR-1.7B-NVFP4
- Libreria de inferencia qwen-asr (pip install "qwen-asr[vllm]==0.0.6"): no disponible enlace directo en la informacion proporcionada
- Paper, blog o demo adicionales: no disponible
