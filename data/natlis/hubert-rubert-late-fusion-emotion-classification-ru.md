# Natlis/hubert-rubert-late-fusion-emotion-classification-ru

## Resumen

El modelo `Natlis/hubert-rubert-late-fusion-emotion-classification-ru` es un sistema de reconocimiento de emociones en habla rusa basado en fusión tardía (late fusion) de dos modalidades independientes: audio y texto. No se trata de un modelo con pesos propios entrenados de forma conjunta, sino de un artefacto que define una constante de fusión α = 0.5 y un informe de métricas obtenidas al combinar las predicciones de dos clasificadores preexistentes: uno acústico basado en HuBERT-large y otro textual basado en RuBERT-base. El resultado es una probabilidad ponderada que clasifica la emoción en cuatro categorías: `angry`, `sad`, `neutral` y `positive`.

La relevancia de este trabajo radica en que aborda la limitación de los clasificadores unimodales al combinar señales acústicas y semánticas, lo que suele mejorar la robustez en escenarios reales donde el audio puede ser ruidoso o el texto ambiguo. El artefacto se distribuye bajo licencia CC BY-SA 4.0, mientras que los modelos base conservan sus propias licencias (Apache-2.0 para HuBERT-SER y para el fine-tune de RuBERT). Está pensado para investigadores y desarrolladores que trabajen con el corpus Dusha y necesiten una referencia reproducible de fusión multimodal.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fusión tardía (late fusion) de HuBERT-large (audio) y RuBERT-base (texto) con promedio ponderado α = 0.5 |
| Parametros totales | No disponible (el artefacto no contiene pesos; los modelos base tienen ~300M y ~180M respectivamente) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende de los modelos base; HuBERT procesa audio de duración variable, RuBERT tiene contexto de 512 tokens) |
| Tipos de cuantizacion | No disponible (el artefacto es un JSON con la constante α; los modelos base pueden cuantizarse por separado) |
| Idiomas soportados | Ruso (ru) |
| Licencia | CC BY-SA 4.0 (para el artefacto de fusión); modelos base: Apache-2.0 |
| Formato de pesos | JSON (constante de fusión y métricas); no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

El sistema no entrena un modelo conjunto. En su lugar, combina las salidas de dos clasificadores independientes mediante una media ponderada: `probs_fused = α · probs_audio + (1 − α) · probs_text`, con α = 0.5. El componente de audio es `xbgoose/hubert-speech-emotion-recognition-russian-dusha-finetuned`, un fine-tune de `facebook/hubert-large-ls960-ft` (arquitectura transformer con enmascaramiento de unidades acústicas) entrenado sobre el corpus Dusha. El componente de texto es `Natlis/rubert-emotion-classification-ru`, un fine-tune de `DeepPavlov/rubert-base-cased` (BERT con tokenización BPE para ruso) entrenado sobre transcripciones del mismo corpus. No se aplicaron técnicas de RLHF ni DPO; el entrenamiento de los modelos base fue supervisado con etiquetas de emoción. La fusión se validó empíricamente, pero no hay un proceso de optimización de α más allá del valor fijo 0.5.

## Capacidades

- Clasificación de emociones en habla rusa en 4 categorías: `angry`, `sad`, `neutral`, `positive`.
- Procesamiento multimodal: requiere simultáneamente un segmento de audio y su transcripción textual.
- Fusión tardía interpretable: la contribución de cada modalidad es explícita y ajustable mediante α.
- Reproducibilidad: el repositorio incluye un script Python (`Late_Fusion_HuBERT_RuBERT.py`) que implementa el flujo completo.
- No es un modelo generativo: no genera texto ni audio.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- Monolingüe: exclusivamente ruso.

## Casos de uso

- Análisis de llamadas de atención al cliente: el sistema puede clasificar la emoción del cliente en cada turno de una conversación telefónica, combinando la prosodia del audio con el contenido transcrito. Es adecuado porque la fusión mitiga errores de ASR y variaciones acústicas.
- Monitorización de interacciones en centros de salud mental: permite detectar estados emocionales negativos (ira, tristeza) en sesiones de terapia grabadas, ayudando a los profesionales a priorizar casos.
- Evaluación de campañas publicitarias: al analizar respuestas de usuarios a anuncios en ruso, se puede medir la reacción emocional (positiva vs. neutral) combinando el tono de voz y las palabras usadas.
- Sistemas de recomendación de contenido: plataformas de streaming pueden ajustar sugerencias según la emoción detectada en la voz del usuario al valorar contenido.
- Investigación en lingüística computacional: sirve como baseline reproducible para estudios sobre fusión multimodal en SER (speech emotion recognition) con corpus ruso.
- Asistentes virtuales empáticos: integrado en un pipeline de ASR + clasificación, permite que el asistente adapte su tono de respuesta según la emoción del usuario.

## Benchmarks y rendimiento

La model card reporta las siguientes métricas (accuracy y F1-macro) en tres particiones:

| Split | Corpus | Accuracy | F1-macro |
|---|---|---|---|
| val | 20% del train | 0.880 | 0.887 |
| test | combine_balanced_test | 0.834 | 0.843 |
| test | dusha_resd_test | 0.822 | 0.830 |

No se han publicado comparaciones con otros sistemas multimodales en la información disponible. Los resultados corresponden a la fusión con α = 0.5 sobre los modelos base ya entrenados.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la documentación del modelo.
- Para inferencia, es necesario cargar dos modelos transformer: HuBERT-large (~300M parámetros) y RuBERT-base (~180M parámetros). En total, se requieren aproximadamente 2 GB de VRAM solo para los pesos en FP32, más memoria para activaciones.
- Una GPU con 8 GB de VRAM (p. ej., NVIDIA RTX 3060, RTX 2070) es suficiente para inferencia por lotes pequeños. Para tiempo real con baja latencia, se recomienda una GPU con al menos 12 GB (RTX 3080, RTX 4070) o una A10/A100 en entornos de producción.
- El despliegue puede realizarse con frameworks estándar: vLLM o TGI para el componente de texto, y herramientas como PyTorch + torchaudio para el componente de audio. No hay soporte nativo para llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo.
- La latencia dependerá de la duración del audio y de la longitud del texto; en una GPU moderna, se puede esperar un procesamiento en tiempo real (inferior a la duración del audio) con optimizaciones básicas.

## Comparativa con modelos similares

No se han encontrado en la información proporcionada modelos multimodales (audio+texto) comparables para ruso. Los siguientes son alternativas unimodales de clasificación de emociones en texto ruso:

| Modelo | Modalidad | Emociones | Base | Licencia |
|---|---|---|---|---|
| `Natlis/hubert-rubert-late-fusion-emotion-classification-ru` | Audio + texto | 4 (angry, sad, neutral, positive) | HuBERT-large + RuBERT-base | CC BY-SA 4.0 (artefacto) |
| `ilyali034/rubert-emotion-ru-large` | Texto | 10 (Izard) | ruBert-large (QLoRA) | No especificada |
| `seara/rubert-base-cased-russian-emotion-detection-ru-go-emotions` | Texto | 28 (GoEmotions) | rubert-base-cased | No especificada |

La comparativa directa no es posible por la diferencia de modalidades y etiquetas. El modelo de Natlis es el único que integra audio y texto en la información disponible.

## Limitaciones y advertencias

- Depende de un sistema de transcripción automática (ASR) para obtener el texto; los errores de ASR degradan el rendimiento de la modalidad textual.
- Solo cubre cuatro emociones básicas, lo que limita su uso en aplicaciones que requieran matices emocionales más finos.
- El corpus de entrenamiento (Dusha) puede tener sesgos demográficos o de registro (p. ej., habla espontánea vs. leída), lo que afecta la generalización a otros dominios.
- La fusión con α fijo = 0.5 no se optimiza por dominio; en escenarios donde una modalidad sea más fiable que la otra, el rendimiento puede subóptimo.
- El artefacto se distribuye bajo CC BY-SA 4.0, lo que implica que cualquier obra derivada debe compartirse bajo la misma licencia. Los modelos base tienen licencias Apache-2.0, pero el uso combinado debe respetar ambas.
- No hay garantías de soporte ni mantenimiento; el repositorio tiene 0 descargas y 0 likes, lo que sugiere un proyecto de investigación sin validación comunitaria amplia.
- Riesgo de alucinación no aplica (no es generativo), pero la clasificación puede ser errónea en entornos ruidosos o con habla no nativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Natlis/hubert-rubert-late-fusion-emotion-classification-ru
- Modelo de audio base: https://huggingface.co/xbgoose/hubert-speech-emotion-recognition-russian-dusha-finetuned
- Modelo de texto base (fine-tune): https://huggingface.co/Natlis/rubert-emotion-classification-ru
- Modelo base de RuBERT: https://huggingface.co/DeepPavlov/rubert-base-cased
- Paper del corpus Dusha: Kondratenko et al., arXiv:2212.12266 (https://arxiv.org/abs/2212.12266)
- Dataset RESD (Aniemore): DOI 10.57967/hf/1272
- Repositorio de código (mencionado en la model card, no se proporciona URL directa)
