# gagan1985/chatterbox-multilingual-hi-mlx-fp16

## Resumen

Chatterbox Multilingual Hindi (MLX fp16) es una conversión al formato MLX del modelo de texto a voz (TTS) Chatterbox Multilingual en hindi, desarrollado originalmente por Resemble AI. Este checkpoint concreto, publicado por el usuario gagan1985, reempaqueta los pesos del modelo fine-tuned para hindi de Resemble AI en formato MLX de precisión fp16, lo que permite una inferencia local rápida en hardware Apple Silicon mediante la librería mlx-audio. El modelo es de un solo idioma (hindi) y está especializado en síntesis de voz y clonación de voz zero-shot.

El modelo base, Chatterbox Multilingual v3, es un sistema TTS de última generación con aproximadamente 677 millones de parámetros, licencia MIT, y capacidades de control emocional, generación en tiempo real y clonación de voz a partir de unos pocos segundos de audio de referencia. Esta versión MLX conserva todas esas capacidades para el hindi, pero requiere siempre un clip de referencia para la clonación de voz, ya que no incorpora una voz por defecto. Es relevante porque democratiza el TTS de alta calidad en hindi sobre hardware de consumo de Apple, sin necesidad de GPUs dedicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Chatterbox (TTS basado en tokens: modelo T3 de texto a tokens, encoder de voz y decodificador de voz) |
| Parametros totales | 677.696.431 (~677M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no procesa contexto de texto como un LLM) |
| Tipos de cuantizacion | fp16 (MLX) |
| Idiomas soportados | hindi (hi) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo se compone de tres módulos: el modelo T3 (text-to-speech-token), que convierte texto en tokens de voz; un encoder de voz (ve) que procesa el audio de referencia para la clonación; y un decodificador de voz (s3gen) que reconstruye la forma de onda a partir de los tokens. En esta versión, solo el modelo T3 fue fine-tuned para hindi por Resemble AI; el encoder y el decodificador son los compartidos del modelo base Chatterbox. La conversión a MLX se realizó con las clases propias de mlx-audio y validación estricta de pesos.

Un detalle técnico relevante: la conversión utiliza el decodificador `s3gen.safetensors` del repositorio base de Chatterbox en lugar del `s3gen_v3.safetensors` que se incluye en el repositorio hindi original, porque este último producía artefactos de audio (sonido respirado/aireado) en la salida MLX. El autor documenta que el decodificador base es el mismo que usan las conversiones oficiales de mlx-community y el cargador PyTorch original, y que el problema probablemente se deba a una incompatibilidad entre el puerto S3Gen de mlx-audio y los valores específicos de `s3gen_v3`.

## Capacidades

- Sintesis de voz en hindi a partir de texto, con calidad conversacional y natural.
- Clonacion de voz zero-shot: requiere un clip de referencia limpio de 10-15 segundos; no hay voz por defecto integrada.
- Control de intensidad emocional mediante el parametro `exaggeration` (rango 0-1, valor por defecto 0.5).
- Ajuste de la fuerza de guiado con `cfg_weight` (valor por defecto 0.5), accesible via API de Python.
- Generacion en tiempo real (segun las especificaciones del modelo base de Resemble AI).
- Compatible con el ecosistema mlx-audio, que gestiona automaticamente la descarga del tokenizador compartido S3TokenizerV2.

## Casos de uso

- Audiolibros en hindi: el modelo puede generar narraciones fluidas y expresivas a partir de texto, con control de la emocion para adaptarse al tono de cada capitulo.
- Asistentes de voz para aplicaciones y dispositivos en hindi: al ser un modelo ligero (677M) y ejecutable en Apple Silicon, puede integrarse en aplicaciones de escritorio o moviles para interaccion por voz sin depender de servicios en la nube.
- Doblaje de contenido audiovisual: la clonacion de voz zero-shot permite doblar videos o podcasts al hindi manteniendo la voz del orador original, con solo unos segundos de muestra.
- Accesibilidad para personas con discapacidad visual: conversion de texto escrito (articulos, libros, notificaciones) a voz en hindi, con calidad natural y bajo coste de despliegue.
- Contenido educativo y e-learning: generacion de locuciones para cursos, tutoriales y materiales didacticos en hindi, con la posibilidad de clonar la voz de un instructor para mantener consistencia.
- Preservacion de voces: clonacion de la voz de una persona a partir de una grabacion corta para usos personales o conmemorativos, siempre con consentimiento explicito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base Chatterbox Multilingual v3 de Resemble AI reporta mejoras en similitud de voz, reduccion de alucinaciones y naturalidad frente a v2, pero no se incluyen metricas cuantitativas en la documentacion de este checkpoint MLX.

## Requisitos de hardware

- Hardware objetivo: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra).
- Memoria: el repositorio ocupa 2.7 GB en disco; la memoria RAM necesaria para inferencia es de al menos 8 GB, recomendandose 16 GB para un uso comodo con otros procesos.
- No requiere GPU dedicada; la inferencia se ejecuta en la Neural Engine o en los nucleos de la GPU integrada del chip Apple.
- Despliegue: mediante la libreria mlx-audio, tanto por CLI (`mlx_audio.tts.generate`) como por API de Python (`generate_audio`).
- Latencia: no se proporcionan datos concretos, pero al ser un modelo de 677M en fp16, se espera una generacion cercana a tiempo real en chips M2 o superiores.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Chatterbox Multilingual Hindi (MLX fp16) (este) | 677M | hindi | MIT | MLX fp16 | Clonacion de voz, requiere referencia |
| Chatterbox Multilingual v3 (original PyTorch) | 0.5B | multilingue | MIT | PyTorch | Modelo base, requiere GPU o CPU |
| mlx-community/chatterbox-multilingual-v3 | 0.5B | multilingue | MIT | MLX | Version MLX del modelo base, sin fine-tuning por idioma |
| VITS (hindi) | ~30M | hindi | MIT | PyTorch | TTS clasico, sin clonacion de voz |

La principal diferencia frente a las alternativas es que este checkpoint esta especificamente fine-tuned para hindi y empaquetado en MLX, lo que lo hace mas preciso en ese idioma y mas eficiente en Apple Silicon que el modelo base multilingue. Frente a VITS, ofrece clonacion de voz y mayor naturalidad, a costa de un mayor tamano.

## Limitaciones y advertencias

- Modelo exclusivamente en hindi: no soporta otros idiomas, a diferencia del modelo base multilingue.
- Requiere siempre un audio de referencia para generar voz; no existe una voz por defecto, lo que anade un paso previo de preparacion de audio.
- La calidad de la clonacion depende de la limpieza y duracion del clip de referencia (se recomiendan 10-15 segundos de audio limpio).
- Posibles artefactos de audio (respiracion, aire) si se utilizan ciertos decodificadores; esta version usa el decodificador base conocido por funcionar correctamente, pero no se garantiza la ausencia total de imperfecciones.
- Riesgo de mal uso de la clonacion de voz: es responsabilidad del usuario obtener consentimiento explicito antes de clonar la voz de una persona.
- La generacion en tiempo real puede degradarse en chips Apple mas antiguos (M1) o con poca memoria unificada.
- No se proporcionan garantias de rendimiento en produccion; se recomienda validar la calidad del audio generado antes de un despliegue a gran escala.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/gagan1985/chatterbox-multilingual-hi-mlx-fp16
- Modelo base en HuggingFace: https://huggingface.co/ResembleAI/Chatterbox-Multilingual-hi
- Repositorio base Chatterbox: https://huggingface.co/ResembleAI/chatterbox
- GitHub de Chatterbox Multilingual: https://github.com/resemble-ai/chatterbox-multilingual
- GitHub de Chatterbox (modelo base): https://github.com/resemble-ai/chatterbox
- Pagina oficial de Resemble AI sobre Chatterbox: https://www.resemble.ai/learn/models/chatterbox
- Libreria mlx-audio: https://github.com/Blaizzy/mlx-audio
- Tokenizador S3TokenizerV2: https://huggingface.co/mlx-community/S3TokenizerV2
