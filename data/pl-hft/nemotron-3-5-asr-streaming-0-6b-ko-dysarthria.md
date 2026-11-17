# PL-HFT/nemotron-3.5-asr-streaming-0.6b-ko-dysarthria

## Resumen

El modelo `PL-HFT/nemotron-3.5-asr-streaming-0.6b-ko-dysarthria` es un checkpoint de reconocimiento automatico del habla (ASR) en coreano, especializado en habla disartrica, publicado por el usuario PL-HFT en Hugging Face. Se trata de un merge del adaptador LoRA `PL-HFT/nemotron-3.5-asr-streaming-0.6b-ko-dysarthria-lora` sobre el modelo base `nvidia/nemotron-3.5-asr-streaming-0.6b`, de forma que el repositorio distribuye pesos ya fusionados y no requiere inyeccion PEFT en tiempo de inferencia.

La arquitectura es un FastConformer cache-aware de 24 capas con decodificador RNNT (transducer), disenado para ASR en streaming con un contexto de atencion de `[56, 13]` (13 tokens de lookahead). El modelo cuenta con 637.997.088 parametros y se distribuye tanto en formato NeMo (`.nemo`) como en safetensors para `transformers`, con audio de entrada a 16 kHz mono y segmentos de hasta 29.5 s.

Su relevancia radica en el ajuste especifico para habla disartrica coreana, un dominio donde los ASR genericos rinden peor, manteniendo ademas un rendimiento competitivo en habla tipica. El autor advierte que la mejora sobre el baseline zero-shot es modesta (CER 7,11 % a 6,82 % en el test combinado) debido a una tasa de aprendizaje efectiva muy baja durante el entrenamiento LoRA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer cache-aware (24 capas) + decodificador RNNT (transducer) |
| Parametros totales | 637.997.088 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | `att_context_size=[56, 13]` (`num_lookahead_tokens=13`); segmentos de audio de hasta 29.5 s |
| Tipos de cuantizacion | no disponible (el repositorio distribuye pesos en `float32`) |
| Idiomas soportados | coreano (`ko`, `target_lang="ko-KR"`) |
| Licencia | OpenMDW-1.1 (`license: other`, `license_name: openmdw-1.1`) |
| Formato de pesos | safetensors (`float32`, 655 tensores, 2.552.062.944 bytes) y archivo NeMo `.nemo` (2.553.098.240 bytes) |

## Arquitectura y entrenamiento

El modelo base es un FastConformer cache-aware con 24 capas y un decodificador RNNT, orientado a ASR en streaming. La configuracion de contexto de atencion `[56, 13]` implica un historial de 56 frames y 13 tokens de lookahead, lo que permite decodificacion incremental con latencia controlada. La entrada de audio debe ser 16 kHz mono y segmentos de duracion menor o igual a 29.5 s.

El ajuste se realizo mediante LoRA (`r=64`, `lora_alpha=128`) sobre las 96 proyecciones `self_attn` del modelo base, durante una epoca, y posteriormente se fusiono en un checkpoint standalone. Segun la model card, el scheduler de NeMo mantuvo la tasa de aprendizaje en `min_lr = 1.0e-06` tras el warmup, lo que produjo actualizaciones de pesos conservadoras y una mejora modesta frente al baseline zero-shot. El merge se verifico bit a bit en las 96 proyecciones fusionadas (`max_diff = 0.0`). No se detalla en la informacion disponible la composicion exacta del dataset de entrenamiento, el numero de tokens de audio ni si se aplicaron etapas de RLHF o DPO (no aplicables de forma tipica en ASR).

## Capacidades

- Reconocimiento automatico del habla en coreano, con enfasis en habla disartrica y habla tipica.
- Decodificacion en streaming gracias a la atencion cache-aware y a `num_lookahead_tokens=13`.
- Soporte de prompt de idioma mediante `target_lang="ko-KR"`.
- Inferencia sin PEFT: el checkpoint esta fusionado y se puede cargar directamente con `transformers` (`Nemotron3_5AsrForRNNT`) o con NeMo (`EncDecRNNTBPEModel`).
- Distribucion en dos formatos (safetensors y `.nemo`) verificados como identicos en las proyecciones fusionadas.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision, audio multimodal ni modo de razonamiento explicito.

## Casos de uso

- Transcripcion de habla disartrica en entornos clinicos o de rehabilitacion: el ajuste especifico sobre AI-Hub 013 reduce el CER a 7,22 % en el test de disartria, lo que lo hace adecuado para dictado asistido de pacientes con trastornos motores del habla.
- Subtitulado en streaming de contenido en coreano: la configuracion cache-aware con 13 tokens de lookahead permite generar transcripciones incrementales con latencia acotada en retransmisiones o videoconferencias.
- Asistentes de voz para accesibilidad: integrado en interfaces de control por voz para usuarios con disartria, donde los ASR genericos suelen fallar por variabilidad articulatoria.
- Transcripcion de clases y ponencias en coreano: el modelo mantiene un CER de 6,57 % en habla tipica (AI-Hub 109) y puede procesar segmentos de hasta 29.5 s, adecuado para pipelines por chunks.
- Documentacion clinica automatizada: conversion de notas dictadas por profesionales sanitarios en texto estructurado, con la ventaja de que el checkpoint fusionado se despliega sin capa PEFT adicional.
- Investigacion en ASR robusto: sirve como punto de partida o baseline para experimentos de adaptacion a dominios con habla atipica, dado que se publica el adaptador LoRA original por separado.
- Procesamiento por lotes de corpus coreanos: el formato `.nemo` facilita su integracion en pipelines NeMo existentes para transcripcion masiva.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Dataset de evaluacion | Split | N | CER (%) | WER (%) |
|---|---|---|---|---|
| Combinado disartria + habla tipica (AI-Hub 013 + 109) | test | 38.599 | 6,82 | 23,75 |
| Disartria coreana (AI-Hub 013) | test | 15.495 | 7,22 | 24,25 |
| Habla tipica coreana (AI-Hub 109) | test | 23.104 | 6,57 | 23,42 |
| Habla de conferencias externa (AI-Hub 71627) | test | 10.000 | 14,08 | 34,97 |

El autor indica que el baseline zero-shot obtenia un CER de 7,11 % en el test combinado, frente al 6,82 % del modelo ajustado. No se han publicado en la informacion disponible resultados comparativos con otros modelos en estos mismos conjuntos.

## Requisitos de hardware

- VRAM estimada: con 637.997.088 parametros en `float32` (2,55 GB de pesos), la inferencia requiere aproximadamente 3-4 GB de VRAM incluyendo activaciones y buffers del decodificador RNNT; en `float16`/`bfloat16` se reduce a unos 1,3-2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para `float32`; RTX 3060/4060, RTX 4090, A100 o H100 son suficientes y sobredimensionadas para este tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (GTX 1660 6 GB en adelante), y potencialmente en CPU para uso no interactivo.
- Opciones de despliegue: `transformers >= 5.20` con `Nemotron3_5AsrForRNNT`, o NVIDIA NeMo (`nemo_toolkit[asr]`) con el archivo `.nemo`. No se documentan en la informacion disponible integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo ASR NeMo).
- Latencia y throughput: no disponibles en la informacion proporcionada; la configuracion de streaming con 13 tokens de lookahead sugiere latencia baja, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / streaming | CER (coreano) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PL-HFT/nemotron-3.5-asr-streaming-0.6b-ko-dysarthria | 637.997.088 | `[56, 13]`, streaming | 6,82 % (combinado), 7,22 % (disartria) | OpenMDW-1.1 | Hugging Face (safetensors + `.nemo`) |
| nvidia/nemotron-3.5-asr-streaming-0.6b (base) | 0,6 B (aprox.) | `[56, 13]`, streaming | 7,11 % (combinado, zero-shot segun el autor) | OpenMDW-1.1 | Hugging Face |
| PL-HFT/nemotron-3.5-asr-streaming-0.6b-ko-dysarthria-lora (adaptador) | 0,6 B + LoRA `r=64` | `[56, 13]`, streaming | mismos resultados tras merge | OpenMDW-1.1 | Hugging Face (requiere PEFT) |
| Otros ASR coreanos de tamano comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La mejora sobre el baseline zero-shot es modesta (CER 7,11 % a 6,82 % en el combinado) por la tasa de aprendizaje efectiva muy baja (`min_lr = 1.0e-06`) durante el entrenamiento LoRA.
- El WER es notablemente alto (23-35 %) incluso con CER bajo, lo que sugiere un impacto relevante de errores en palabras cortas o en la segmentacion; conviene evaluar por dominio antes de produccion.
- El rendimiento cae en habla de conferencias externa (CER 14,08 %, WER 34,97 %), lo que indica menor robustez fuera de los dominios de entrenamiento.
- Modelo monoidioma (coreano); no soporta otros idiomas.
- Entrada restringida a audio 16 kHz mono y segmentos de hasta 29.5 s; no se documenta manejo de audio de mayor duracion sin troceado.
- Los resultados de benchmarks estan declarados por el autor y no verificados (`verified: false`).
- La licencia OpenMDW-1.1 debe revisarse antes de uso comercial; la model card enlaza a la licencia del modelo base de NVIDIA.
- No se documentan en la informacion disponible analisis de sesgos, tasas de alucinacion ni evaluaciones de robustez frente a ruido o acentos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PL-HFT/nemotron-3.5-asr-streaming-0.6b-ko-dysarthria
- Adaptador LoRA: https://huggingface.co/PL-HFT/nemotron-3.5-asr-streaming-0.6b-ko-dysarthria-lora
- Modelo base: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Licencia OpenMDW-1.1 (referenciada por el autor): https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Model card en coreano: https://huggingface.co/PL-HFT/nemotron-3.5-asr-streaming-0.6b-ko-dysarthria/blob/main/README.ko.md
- Repositorio NeMo: https://github.com/NVIDIA-NeMo/NeMo
