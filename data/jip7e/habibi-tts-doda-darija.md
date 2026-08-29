# Jip7e/habibi-tts-doda-darija

## Resumen

`Jip7e/habibi-tts-doda-darija` es un modelo de síntesis de voz (text-to-speech) especializado en árabe marroquí o darija, desarrollado por Jip7e como un fine-tuning del modelo base `SWivid/Habibi-TTS`. El modelo emplea una arquitectura no autorregresiva de Flow Matching con un backbone de Diffusion Transformer (DiT), lo que evita los problemas típicos de los modelos autorregresivos en dialectos árabes, como el bucle de tokens, el tartamudeo y la degradación fonética. Está entrenado sobre 12.105 clips de estudio del corpus DODa, con 8,83 horas de audio de 7 locutores profesionales marroquíes, y genera audio de 24 kHz con calidad de estudio.

La relevancia de este modelo radica en que cubre un dialecto árabe poco representado en los sistemas TTS comerciales y de código abierto. Además, ofrece clonación de voz zero-shot a partir de un clip de referencia de 3 a 6 segundos, lo que permite generar voz personalizada sin necesidad de entrenamiento adicional. El modelo se distribuye bajo licencia Apache-2.0, lo que facilita su uso comercial y su integración en aplicaciones de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | F5TTS_v1_Base (Diffusion Transformer, 22 capas, dim 1024, 16 cabezas) + Vocoder Vocos 24 kHz |
| Parametros totales | No disponible (el checkpoint EMA pesa 1,3 GB; el checkpoint completo 5,4 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo procesa texto y audio de referencia; la referencia óptima es de 3,5 a 6 segundos) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Árabe marroquí (ary / ar-MA), árabe estándar (ar) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (model_ema.safetensors) y PyTorch (model_last.pt) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura F5TTS_v1_Base, un sistema de síntesis de voz no autorregresivo que utiliza Flow Matching sobre un backbone de Diffusion Transformer (DiT). A diferencia de los modelos TTS autorregresivos, que generan tokens de voz secuencialmente y sufren degradación en dialectos con fonética compleja, este enfoque genera la voz completa mediante un proceso de flujo continuo, lo que produce una prosodia más natural y una pronunciación más precisa de consonantes marroquíes como خ, ح, ع y ق. El vocoder empleado es Vocos, un mel-vocoder de 24 kHz.

El entrenamiento se realizó sobre el checkpoint especializado en marroquí de `SWivid/Habibi-TTS`, utilizando el dataset `Jip7e/doda-darija-cosyvoice2`, derivado del corpus AtlasIA DODa. Se usaron 12.105 clips de estudio (8,83 horas) de 7 locutores profesionales (4 mujeres y 3 hombres), normalizados a 24 kHz mono y -24 dBFS. El ajuste fino se ejecutó durante 12 épocas (984 pasos de optimización) en 2 GPUs NVIDIA Tesla T4 con PyTorch DDP y mixed precision FP16, usando AdamW con tasa de aprendizaje 1e-5 y decaimiento coseno. La pérdida final convergió a 0,59 desde un valor inicial de 0,68.

## Capacidades

- Generación de voz en darija marroquí con acento y cadencia naturales, incluyendo consonantes fricativas propias del dialecto.
- Clonación de voz zero-shot: a partir de un clip de audio limpio de 3 a 6 segundos y su transcripción exacta, el modelo puede sintetizar texto arbitrario con la voz del locutor de referencia.
- Síntesis de voz a 24 kHz con calidad de estudio, adecuada para producción de audio profesional.
- Control fino de la velocidad de habla mediante el parámetro `speed` (recomendado entre 0,85 y 0,95 para un ritmo conversacional natural).
- Ajuste de la fidelidad de pronunciación mediante el número de pasos de integración ODE (`nfe_step`) y la fuerza de guiado sin clasificador (`cfg_strength`).
- Soporte de texto en escritura árabe y transliteración latina (según el dataset de entrenamiento, que incluye ambas formas).
- Inferencia no autorregresiva, lo que reduce la latencia frente a modelos secuenciales y evita artefactos de repetición.

## Casos de uso

- Asistentes de voz en darija para servicios públicos o privados en Marruecos: el modelo permite generar respuestas habladas en el dialecto local, mejorando la accesibilidad para usuarios que no dominan el árabe estándar.
- Audiolibros y narración de contenido en darija: con la clonación zero-shot, un editor puede mantener una voz consistente a lo largo de capítulos extensos sin necesidad de grabar todas las frases.
- Doblaje de vídeos y anuncios publicitarios dirigidos al mercado marroquí: la capacidad de clonar la voz de un locutor profesional a partir de una muestra breve reduce los costes de producción.
- Aplicaciones educativas para el aprendizaje del darija: el modelo puede generar ejemplos de pronunciación correcta para estudiantes, con control de velocidad y pausas mediante puntuación árabe.
- Sistemas de atención al cliente automatizados: integrado en un pipeline de IVR, puede leer respuestas dinámicas en darija con una voz natural, mejorando la experiencia del usuario frente a voces robóticas.
- Generación de contenido para redes sociales y podcasts: los creadores pueden producir locuciones en darija sin necesidad de un estudio de grabación, usando la clonación de voz para mantener una marca personal consistente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no incluye métricas comparativas como MMLU, HumanEval o GSM8K, ya que se trata de un sistema de síntesis de voz y no de un modelo de lenguaje general. La model card menciona que el enfoque no autorregresivo supera a los modelos autorregresivos en dialectal árabe, pero no proporciona cifras concretas.

## Requisitos de hardware

- Inferencia con el checkpoint EMA (1,3 GB): puede ejecutarse en GPUs con 8 GB de VRAM o más, como una NVIDIA RTX 3060 o superior. El entrenamiento se realizó en Tesla T4 (16 GB), por lo que una GPU de gama media es suficiente para inferencia.
- El checkpoint completo (5,4 GB) incluye estados del optimizador y solo es necesario para continuar el entrenamiento; no se recomienda para inferencia en producción.
- El modelo se integra con la librería F5-TTS, que soporta inferencia en CPU, aunque con mayor latencia. Para uso en tiempo real se recomienda GPU.
- Opciones de despliegue: el modelo se puede servir mediante la API de inferencia de F5-TTS, o empaquetarse en un contenedor con FastAPI para exponer un endpoint REST. No es compatible directamente con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- La latencia estimada depende del número de pasos ODE (64 o 100) y de la longitud del texto. Con una GPU T4, la generación de una frase de 10 segundos de audio suele tardar entre 2 y 5 segundos, aunque no se dispone de mediciones oficiales.

## Comparativa con modelos similares

No se dispone de datos comparativos cuantitativos con otros modelos TTS para darija en la información proporcionada. El paper de Habibi-TTS menciona que el modelo unificado supera a los modelos especializados por dialecto y es competitivo con ElevenLabs Eleven v3 (alpha), pero no se ofrecen cifras concretas en la model card de este fine-tuning. Como referencia cualitativa:

| Modelo | Enfoque | Dialectos | Clonación zero-shot | Licencia |
|---|---|---|---|---|
| Jip7e/habibi-tts-doda-darija | Flow Matching DiT no autorregresivo | Darija marroquí (especializado) | Sí | Apache-2.0 |
| SWivid/Habibi-TTS (base) | Flow Matching DiT no autorregresivo | 12+ dialectos árabes | Sí | Apache-2.0 |
| CosyVoice2 (con fine-tuning en DODa) | Autorregresivo + token de voz | Darija marroquí (vía dataset) | Sí | Apache-2.0 (según versión) |

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con voces de 7 locutores profesionales del corpus DODa, por lo que la variabilidad de acentos regionales dentro de Marruecos puede ser limitada.
- La clonación de voz requiere un clip de referencia limpio (sin ruido de fondo, reverberación ni música) y una transcripción exacta. Si la transcripción no coincide con el audio, la calidad de la clonación se degrada notablemente.
- El texto de entrada debe incluir puntuación árabe (، y .) cada 4-6 palabras para lograr pausas naturales; sin ella, la prosodia puede sonar monótona o apresurada.
- No se han evaluado sesgos de género, edad o clase social en las voces generadas, aunque el conjunto de entrenamiento incluye 4 locutoras y 3 locutores.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Habibi-TTS y el dataset DODa pueden tener sus propias condiciones; se recomienda revisar la licencia del dataset AtlasIA DODa antes de un despliegue comercial.
- El modelo no soporta otros dialectos árabes ni el árabe estándar con la misma calidad; para esos casos es preferible usar el modelo base Habibi-TTS.
- No se han publicado evaluaciones de robustez frente a texto con errores ortográficos, transliteraciones inconsistentes o números, por lo que se recomienda preprocesar el texto antes de la síntesis.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jip7e/habibi-tts-doda-darija
- Dataset de entrenamiento: https://huggingface.co/datasets/Jip7e/doda-darija-cosyvoice2
- Dataset original DODa: https://huggingface.co/datasets/atlasia/DODa-audio-dataset
- Repositorio oficial de Habibi-TTS: https://github.com/SWivid/Habibi-TTS
- Página del paper de Habibi-TTS: https://alextyj.github.io/publication/2026-01-20-habibi-tts
- Demo online de Habibi-TTS: https://huggingface.co/spaces/chenxie95/Habibi-TTS
