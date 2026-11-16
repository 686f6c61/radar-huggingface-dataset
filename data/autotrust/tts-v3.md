# autotrust/TTS-V3

## Resumen

TTS-V3 es un adaptador LoRA para síntesis de voz (text-to-speech) en chino mandarín orientado a conversaciones telefónicas de atención al cliente. Lo desarrolla el usuario `autotrust` y se construye sobre el modelo base Qwen3-TTS-12Hz-1.7B-Base de Qwen, un modelo TTS de aproximadamente 1.700 millones de parámetros que opera con tokens de audio a 12 Hz. El adaptador se entrena con 400 pasos de LoRA sobre diálogos telefónicos reales y permite condicionar la síntesis con seis voces de referencia (ventas, atención al cliente y cobro bancario, en variantes masculina y femenina), generando audio WAV mono a 24 kHz.

El repositorio no distribuye un modelo completo, sino un incremento de entrenamiento de aproximadamente 5 MB (1.245.184 parámetros FP32 en `adapter.safetensors`) más código de carga e inferencia. Para funcionar requiere descargar el modelo base Qwen3-TTS (unos 4,5 GB) y el tokenizer de audio, fijados a una revisión concreta. Esto lo hace relevante para equipos que quieran desplegar voces sintéticas específicas de dominio sin reentrenar un TTS completo, aunque con la limitación de que el adaptador usa un formato de carga propio (`qwen_v3.load_adapter`) y no es directamente compatible con PEFT ni con `AutoModel.from_pretrained`.

La propuesta de valor está en el ajuste fino sobre un dominio muy concreto: normalización de cifras, fechas y números de tarjeta, estabilidad de contenido en frases largas y preservación del timbre de la referencia. El autor publica una evaluación comparativa frente al modelo base y frente a un sistema alternativo (Pocket), con métricas de CER mediante ASR, similitud de voz por coseno de embeddings y tasa de finalización (EOS).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer TTS Qwen3-TTS-12Hz-1.7B-Base (tokens de audio a 12 Hz) |
| Parametros totales | 1.245.184 parámetros del adaptador (FP32); modelo base ~1.7B parámetros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (límite de generación de 512 tokens de audio por defecto vía `--max-new-tokens`) |
| Tipos de cuantizacion | No disponible (inferencia probada en BF16) |
| Idiomas soportados | Chino mandarín (`zh`) |
| Licencia | `other` / `component-specific-terms` (términos por componente; ver `LICENSE.md` y `LICENSE-QWEN.txt`) |
| Formato de pesos | `safetensors` (adaptador); el modelo base se descarga en formato estándar de Hugging Face |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-TTS-12Hz-1.7B-Base, un modelo de síntesis de voz que representa el audio como tokens discretos a una tasa de 12 Hz y emplea un tokenizer de audio dedicado. La clonación de voz se realiza mediante condicionamiento con los códigos de audio de una referencia y un embedding de hablante (interfaz de clonación del modelo Base, no la interfaz de instrucciones por texto CustomVoice/VoiceDesign). El adaptador LoRA se entrena durante 400 pasos sobre conversaciones telefónicas reales en chino, con seis referencias de voz asociadas a casos de uso de ventas, atención al cliente y cobro bancario.

El entrenamiento es un ajuste de dominio, no un reentrenamiento del modelo completo: el adaptador modifica una fracción pequeña de pesos (1,2 M de parámetros) y el resto del comportamiento proviene del modelo base. La evaluación del autor incluye una comparación controlada con el modelo base usando la misma referencia, texto y semilla, y reporta mejoras en estabilidad de contenido (CER) manteniendo la similitud de voz. No se detalla la composición exacta del dataset de entrenamiento, el número de horas de audio ni si hubo etapas de RLHF/DPO; esa información no está disponible en la documentación publicada.

## Capacidades

- Síntesis de voz en chino mandarín a 24 kHz mono en formato WAV.
- Clonación de voz condicionada por audio de referencia y su transcripción (`--ref-audio`, `--ref-text`).
- Seis voces predefinidas: `sales_male`, `sales_female`, `service_male`, `service_female`, `bank_collection_male`, `bank_collection_female`.
- Normalización de texto en chino para cifras, fechas, importes y números de tarjeta antes de la síntesis.
- Conservación de timbre, ritmo y estilo expresivo de la referencia (sin garantía de replicación de la curva F0).
- Generación de audio con control de longitud mediante tokens de audio (`--max-new-tokens`, por defecto 512).
- Modo de comparación con el modelo base (`--variant base`) usando la misma referencia.
- No soporta tool calling, function calling, agentes, visión ni audio de entrada como ASR; es exclusivamente TTS.

## Casos de uso

- **Atención al cliente telefónica automatizada**: el adaptador está entrenado sobre diálogos telefónicos reales y las voces `service_male`/`service_female` están pensadas para este escenario; permite generar respuestas de voz con timbre consistente en flujos IVR o asistentes de voz.
- **Cobro y recordatorios de pago**: las voces `bank_collection_male`/`bank_collection_female` y la normalización de importes y fechas permiten generar mensajes de recordatorio de deuda con lectura correcta de cifras y fechas.
- **Generación de guiones de venta locutados**: las voces `sales_male`/`sales_female` permiten producir variantes de un mismo guion para pruebas A/B de campañas sin regrabar con locutores.
- **Prototipado de asistentes conversacionales en chino**: al ser un adaptador pequeño sobre un base de 1,7B, se puede iterar rápido sobre el estilo de voz y el dominio sin reentrenar el TTS completo.
- **Clonación de voz con referencia propia**: mediante `--ref-audio` y `--ref-text` se puede condicionar la síntesis a una voz concreta autorizada para un despliegue interno.
- **Evaluación de calidad TTS en pipelines de CI**: el script `synthesize.py` con semilla fija (`--seed 5000`) y la estructura de evaluación (`evaluation/trials.jsonl`) permiten reproducir pruebas de regresión de audio en integración continua.
- **Localización de contenidos formativos o de soporte**: generación de audios explicativos en chino con lectura correcta de cifras y fechas para materiales internos.

## Benchmarks y rendimiento

El autor publica una comparación sobre 6 voces × 12 guiones chinos independientes (72 generaciones por configuración, 288 en total), con las mismas referencias, textos y semilla. Métricas: CER con ASR Qwen y con Whisper, similitud de voz por coseno de embeddings (mismo ancho de banda telefónico) y tasa de finalización (EOS).

| Modelo | CER Qwen ASR ↓ | CER Whisper ↓ | Coseno de voz (mediana) ↑ | EOS observado |
|---|---:|---:|---:|---:|
| Pocket V1 | 2,73 % | 4,95 % | 0,546 | 65/72 |
| Pocket (fine-tune conservador) | 3,15 % | 4,70 % | 0,553 | 66/72 |
| Qwen 1.7B base | 4,59 % | 12,23 % | 0,703 | 72/72 |
| **TTS-V3** | **2,12 %** | **3,30 %** | **0,707** | **72/72** |

Cada grupo cubre 1.938 caracteres objetivo normalizados. El autor advierte que la mejora de similitud de voz proviene principalmente del cambio de modelo base, y que TTS-V3 mejora sobre todo la estabilidad de contenido. No hay resultados de MOS con escucha humana ciega ni una puntuación calibrada de "naturalidad"; los datos de comparación acústica con voz humana (`evaluation/human_comparison.json`) muestran mejoras parciales en rango de tono, dinámica de energía y jitter, pero no en micropausas, velocidad ni entonación de final de frase.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma explícita; el modelo base ocupa unos 4,5 GB en disco y se ejecuta en BF16, por lo que se estima un consumo de VRAM en el rango de 6-10 GB para inferencia (estimación, no confirmada por el autor).
- **GPU recomendadas**: el autor valida con NVIDIA CUDA y PyTorch 2.13.0 en BF16 con SDPA; no especifica modelos de GPU concretos.
- **GPU de consumo**: probablemente asequible en GPUs consumer con 8-12 GB de VRAM (RTX 3060 12 GB, RTX 4070, RTX 4090), aunque no está verificado por el autor.
- **Plataformas**: Linux, Python 3.11 y CUDA; CPU y otras combinaciones no han sido validadas sistemáticamente.
- **Despliegue**: el repositorio incluye `synthesize.py` como entrada CLI; no se documenta integración con vLLM, TGI, llama.cpp u Ollama (son frameworks para LLM, no para este TTS).
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto | CER (Whisper) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| **TTS-V3** | Adaptador 1,2 M sobre base 1,7B | LoRA TTS | No disponible | 3,30 % | Términos por componente | Hugging Face (`autotrust/TTS-V3`) |
| Qwen3-TTS-12Hz-1.7B-Base | ~1,7B | TTS base | No disponible | 12,23 % | Licencia Qwen | Hugging Face (`Qwen/...`) |
| Pocket V1 | No disponible | TTS | No disponible | 4,95 % | No disponible | Referenciado en la evaluación |
| Pocket (fine-tune conservador) | No disponible | TTS | No disponible | 4,70 % | No disponible | Referenciado en la evaluación |

La comparación se limita a los sistemas incluidos en la evaluación del autor; no se dispone de datos de otros TTS chinos comparables (por ejemplo, CosyVoice o Fish Speech) en la información proporcionada.

## Limitaciones y advertencias

- **Idioma único**: solo chino mandarín; no hay soporte multilingüe documentado.
- **Formato de adaptador propietario**: no es un modelo completo ni un adaptador PEFT estándar; requiere `qwen_v3.load_adapter` y el código del repositorio.
- **Dependencia de red**: la primera ejecución descarga el modelo base fijado a la revisión `fd4b254389122332181a7c3db7f27e918eec64e3` y recursos de normalización (`wetext`).
- **Licencia compleja**: licencia `other` con términos por componente; es necesario revisar `LICENSE.md` y `LICENSE-QWEN.txt` antes de uso comercial, y la licencia del modelo base Qwen puede imponer restricciones adicionales.
- **Riesgo de alucinación de contenido**: el propio autor documenta al menos un caso de repetición del contenido de referencia en el modelo base; el adaptador reduce este problema pero no lo elimina por completo.
- **Sin MOS humano**: las métricas publicadas son automáticas (CER, coseno de voz, EOS); no hay evaluación de naturalidad con oyentes.
- **Clonación de voz**: el uso de voces de referencia reales plantea riesgos de suplantación y requiere consentimiento y cumplimiento normativo (por ejemplo, normativa de IA y protección de datos).
- **Reproducibilidad parcial**: los resultados dependen de la semilla y de los parámetros de muestreo; el autor fija `--seed 5000` pero no detalla todos los parámetros de decodificación.
- **Sin validación en CPU ni en otros entornos**: solo se ha probado Linux + Python 3.11 + CUDA + PyTorch 2.13.0 + BF16 + SDPA.
- **Sesgos**: no documentados explícitamente; al entrenarse con diálogos de cobro y ventas, el estilo puede estar sesgado hacia ese registro.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/autotrust/TTS-V3
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Documentación de entrenamiento y datos: `MODEL_CARD.md` (en el repositorio)
- Licencias: `LICENSE.md` y `LICENSE-QWEN.txt` (en el repositorio)
- Resultados de evaluación: `evaluation/trials.jsonl`, `evaluation/summary.json`, `evaluation/human_comparison.json` (en el repositorio)
- PyTorch (instalación): https://pytorch.org/get-started/locally/
