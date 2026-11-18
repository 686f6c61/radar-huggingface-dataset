# Azyan02/piper-voices

## Resumen

`Azyan02/piper-voices` es un repositorio de pesos de voces para Piper, el sistema de síntesis de voz (text-to-speech) de código abierto desarrollado en el ecosistema Rhasspy. No se trata de un modelo de lenguaje ni de un transformer generativo, sino de una colección de modelos acústicos y vocoders en formato ONNX que permiten convertir texto en audio en tiempo real sobre hardware modesto, incluida la CPU. El repositorio lo publica el usuario Azyan02 como agregación de voces, con un tamaño total de 12,2 GB y licencia MIT.

La relevancia de este artefacto es práctica: Piper se ha consolidado como una de las soluciones TTS locales más ligeras y rápidas para asistentes de voz, domótica y aplicaciones de accesibilidad, y este repositorio empaqueta voces para 35 idiomas en un único punto de descarga. Frente a soluciones TTS neuronales de mayor tamaño (XTTS, Bark, Tortoise), Piper sacrifica expresividad y clonación de voz en favor de latencia baja y huella mínima, lo que lo hace idóneo para despliegues en Raspberry Pi o navegador.

La información publicada por el autor es mínima: una model card de una sola línea que remite a la documentación de Piper y a `piper-checkpoints` para el entrenamiento de voces propias. No se detallan arquitecturas por voz, horas de entrenamiento ni métricas de calidad, por lo que muchos campos de esta ficha deben marcarse como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (modelo acústico end-to-end con vocoder integrado), exportado a ONNX; por voz individual, no especificado en la model card |
| Parámetros totales | No disponible (depende de cada voz; el repo completo ocupa 12,2 GB) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (TTS por frase; Piper procesa el texto de entrada por segmentos, sin ventana de contexto definida) |
| Tipos de cuantización | Pesos en ONNX; Piper distribuye habitualmente variantes de precisión estándar y cuantizadas (int8) por voz, aunque la model card no lo detalla |
| Idiomas soportados | 35: ar, ca, cs, cy, da, de, el, en, es, fa, fi, fr, hu, is, it, ka, kk, lb, lv, ne, nl, no, pl, pt, ro, ru, sk, sl, sr, sv, sw, tr, uk, vi, zh |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

Piper emplea un modelo acústico de tipo VITS (Variational Inference for Text-to-Speech), una arquitectura end-to-end que combina codificador de texto, predictor de duración, flujo normalizador y decoder con vocoder HiFi-GAN integrado, todo exportado a ONNX para inferencia sin dependencias de PyTorch. Cada voz se entrena de forma independiente sobre un corpus monolingüe o multilingüe concreto, y el repositorio agrega los artefactos resultantes. La model card no especifica horas de audio, número de hablantes por voz ni composición de los datasets.

El autor remite explícitamente a `rhasspy/piper-checkpoints` para quien quiera entrenar sus propias voces, y a la guía `TRAINING.md` del repositorio de Piper para el procedimiento. No se documentan en la información disponible procesos de RLHF, fine-tuning por preferencias ni innovaciones técnicas adicionales más allá del propio pipeline de Piper (fonemización por idioma con espeak-ng, síntesis por lotes y streaming).

## Capacidades

- Síntesis de voz (text-to-speech) offline en 35 idiomas, con voces específicas por idioma e identificadores de hablante cuando la voz es multi-hablante.
- Inferencia en CPU con latencia baja gracias a la exportación ONNX y al vocoder integrado.
- Salida de audio en formato WAV (y streaming por frases en las integraciones de Piper).
- Integración con asistentes domésticos: Home Assistant, Rhasspy, Wyoming Protocol.
- Uso desde línea de comandos (`piper`), biblioteca Python (`piper-tts`) y binarios para distintas plataformas.
- No soporta clonación de voz, control de emoción explícito ni síntesis zero-shot de hablantes no vistos.
- No soporta tool calling, agentes ni razonamiento multi-step: no es un modelo de lenguaje.

## Casos de uso

- Asistentes de voz para domótica: integrado en Home Assistant mediante Wyoming, el modelo permite respuestas habladas locales sin enviar audio a la nube, con latencia de decenas de milisegundos por frase en CPU moderna.
- Lectura de notificaciones y alertas en sistemas embebidos: en una Raspberry Pi 4, una voz Piper en ONNX puede sintetizar frases cortas en tiempo real, lo que sirve para avisos de sensores o recordatorios.
- Accesibilidad para personas con discapacidad visual: conversión de texto a audio en aplicaciones de escritorio o móvil con licencia MIT, sin coste por carácter ni dependencia de API externa.
- Generación de audiolibros y pódcast automatizados: procesamiento por lotes de textos largos con segmentación por frases y concatenación posterior de WAV.
- Doblaje y localización de contenido: al cubrir 35 idiomas, permite producir pistas de voz para vídeos o tutoriales en múltiples mercados con una única herramienta.
- Sistemas de anuncios públicos y kioscos interactivos: síntesis local en hardware de bajo consumo para terminales de información, sin conexión a internet.
- Pruebas de integración continua para pipelines de voz: al ser ONNX ligero, se puede ejecutar en runners de CI para validar regresiones de audio en aplicaciones de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas MOS, WER, latencia ni comparativas con otros sistemas TTS.

## Requisitos de hardware

- VRAM: no aplica en el caso habitual; Piper está diseñado para inferencia en CPU. Cada voz individual ocupa del orden de decenas de MB en ONNX, aunque el repositorio completo son 12,2 GB.
- GPU: no es necesaria; puede ejecutarse en CPU. En GPU, la inferencia ONNX es posible pero el cuello de botella suele ser el propio proceso de fonemización.
- Hardware de consumo: funciona en Raspberry Pi 3/4/5 y en portátiles modestos. Cabe holgadamente en cualquier GPU de consumo si se desea acelerar, aunque no aporta ventaja significativa.
- Despliegue: binario `piper`, `piper-tts` (Python), integración Wyoming para Home Assistant, contenedores Docker de la comunidad. No está pensado para vLLM, TGI ni llama.cpp, que son servidores de LLM.
- Latencia y throughput: no disponibles en la información proporcionada; la documentación de Piper reporta habitualmente síntesis más rápida que tiempo real en CPU, pero no se cita cifra concreta en este repositorio.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Tamaño típico | Ejecución |
|---|---|---|---|---|---|
| Piper (este repo) | TTS VITS/ONNX | 35 | MIT | Decenas de MB por voz | CPU, offline |
| Coqui TTS (XTTS v2) | TTS neuronal | ~17 | Coqui Public Model License (no comercial en la práctica para muchos usos) | ~1,8 GB | GPU recomendada |
| Bark (Suno) | TTS generativo | Multilingüe (aprox. 13) | MIT | ~5 GB | GPU recomendada |
| eSpeak NG | TTS concatenativo/formántico | >100 | GPLv3 | Unos pocos MB | CPU, muy ligero |

Piper se sitúa entre eSpeak NG (calidad sintética, huella mínima) y los TTS neuronales grandes (mayor naturalidad, requisitos de GPU). Frente a XTTS y Bark, Piper no ofrece clonación de voz ni expresividad, pero gana en latencia, licencia permisiva y despliegue en hardware embebido.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, razona ni responde preguntas; solo convierte texto en audio.
- Calidad de voz variable entre idiomas y hablantes; algunas voces suenan más robóticas o presentan prosodia limitada.
- Sin clonación de voz ni control fino de emoción, énfasis o estilo.
- La model card no documenta los corpus de entrenamiento, por lo que no se puede evaluar el sesgo de acento, género o registro de cada voz.
- La licencia MIT del repositorio cubre los artefactos publicados, pero conviene verificar la procedencia de los datos de entrenamiento de cada voz si se va a usar comercialmente en un producto regulado.
- El repositorio agrega voces de terceros; el autor no detalla el proceso de recolección ni garantiza la integridad de cada archivo.
- No apto para síntesis de textos muy largos en una sola pasada sin segmentación previa por frases.
- La fonemización depende de espeak-ng, lo que puede introducir errores en nombres propios, siglas y números.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Azyan02/piper-voices
- Proyecto Piper (GitHub): https://github.com/rhasspy/piper
- Guía de entrenamiento de voces: https://github.com/rhasspy/piper/blob/master/TRAINING.md
- Checkpoints para entrenamiento: https://huggingface.co/datasets/rhasspy/piper-checkpoints/tree/main
- Documentación de Piper: https://github.com/rhasspy/piper/blob/master/README.md
