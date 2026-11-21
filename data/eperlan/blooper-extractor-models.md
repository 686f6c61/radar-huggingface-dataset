# Eperlan/blooper-extractor-models

## Resumen

Eperlan/blooper-extractor-models es un repositorio agregado publicado por Eperlan Studio que agrupa los modelos de análisis que descarga la aplicación Blooper Extractor en su primer arranque. No se trata de un modelo entrenado por el autor, sino de una redistribución de seis modelos abiertos de terceros empaquetados en un único repositorio de 19,1 GB. Cada carpeta incluye un archivo SOURCE.txt con el origen, la revisión y la licencia del modelo original.

El conjunto cubre tres tareas de audio y una de visión-lenguaje: reconocimiento de voz (Whisper large-v3-turbo en conversión MLX), clasificación de voz por idioma (dos variantes de wav2vec2-large-xlsr-53 en fp16, francés e inglés), clasificación de eventos sonoros (AST fine-tuned en AudioSet, fp16) y dos modelos multimodales de 4 bits (Qwen2.5-VL-7B-Instruct y MiniCPM-o 4.5) para análisis de imagen-texto. Las variantes wav2vec2 solo se usan en versiones de la aplicación anteriores a octubre de 2026.

El repositorio es relevante como referencia de empaquetado reproducible de dependencias de modelos para aplicaciones de escritorio, pero no aporta pesos propios ni resultados de evaluación. La licencia declarada es mixta ("other"/"mixed"), heredada de cada modelo constituyente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Repositorio agregado: Whisper (encoder-decoder transformer), wav2vec2 (CNN + transformer), AST (ViT aplicado a espectrogramas), Qwen2.5-VL (transformer multimodal), MiniCPM-o (transformer multimodal) |
| Parametros totales | No disponible (varía por submodelo; el repo completo pesa 19,1 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | fp16 (wav2vec2, AST), 4 bits (Qwen2.5-VL, MiniCPM-o), conversión MLX (Whisper large-v3-turbo) |
| Idiomas soportados | No disponible en la información del repositorio (whisper-large-v3-turbo es multilingüe; wav2vec2 cubre francés e inglés) |
| Licencia | Mixta ("other"/"mixed"): MIT, Apache-2.0, BSD-3-Clause según submodelo |
| Formato de pesos | safetensors (MLX para Whisper y los multimodales; fp16 para wav2vec2 y AST) |

## Arquitectura y entrenamiento

El repositorio no contiene entrenamiento propio. Cada carpeta redistribuye un modelo de terceros sin modificar (salvo la conversión a MLX de Whisper y la conversión a fp16 de los wav2vec2 y AST). Los componentes son: Whisper large-v3-turbo de OpenAI, un encoder-decoder transformer para transcripción con conversión MLX de mlx-community; wav2vec2-large-xlsr-53 en variantes francesa e inglesa de jonatasgrosman, modelos de representación auto-supervisada con cabecera de clasificación; AST fine-tuned en AudioSet (MIT/ast-finetuned-audioset-10-10-0.4593), un Vision Transformer aplicado a espectrogramas para clasificación de eventos sonoros; y Qwen2.5-VL-7B-Instruct y MiniCPM-o 4.5 en cuantización 4 bits de mlx-community, ambos multimodales imagen-texto.

No se documentan en la información disponible los volúmenes de entrenamiento, la composición de los datasets ni si hubo etapas de RLHF o DPO en los modelos originales. La innovación técnica del repositorio es de empaquetado: conversión a MLX para ejecución en Apple Silicon y reducción a fp16/4 bits para minimizar el tamaño en disco, con trazabilidad de origen y licencia por carpeta mediante SOURCE.txt.

## Capacidades

- Transcripción de voz a texto multilingüe mediante Whisper large-v3-turbo.
- Clasificación de idioma de voz (francés e inglés) con wav2vec2-large-xlsr-53.
- Clasificación de eventos sonoros y etiquetado de audio ambiental con AST sobre AudioSet.
- Comprensión de imagen y texto, respuesta a preguntas visuales y descripción de imágenes con Qwen2.5-VL-7B-Instruct.
- Capacidades multimodales de MiniCPM-o 4.5 (imagen-texto; el repositorio excluye sus archivos Python personalizados).
- Soporte de tool calling y agentes: no disponible en la información del repositorio.
- Capacidades multilingües: no detalladas en el repositorio; dependen de cada submodelo.

## Casos de uso

- Transcripción automática de audio en aplicaciones de escritorio: Whisper large-v3-turbo en MLX permite transcribir grabaciones localmente en equipos Apple Silicon sin enviar audio a la nube.
- Detección de idioma en pipelines de voz: los wav2vec2 fine-tuned clasifican francés e inglés para enrutar el audio al transcriptor o al modelo de traducción adecuado.
- Etiquetado de eventos sonoros en archivos de audio: AST sobre AudioSet identifica sonidos ambientales (música, habla, ruido) para indexación o filtrado de bibliotecas multimedia.
- Extracción de información de capturas y documentos: Qwen2.5-VL-7B-Instruct en 4 bits permite hacer preguntas sobre imágenes y extraer texto estructurado en local.
- Análisis multimodal ligero en portátiles: MiniCPM-o 4.5 en 4 bits ofrece descripción de imágenes y diálogo visual con requisitos de memoria reducidos.
- Empaquetado reproducible de dependencias: el patrón de carpetas con SOURCE.txt sirve como plantilla para distribuir modelos de terceros con trazabilidad de licencia en aplicaciones comerciales.
- Preprocesado de datasets de audio: la combinación de transcripción, clasificación de idioma y etiquetado de eventos permite anotar corpus de audio de forma automática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma agregada; depende del submodelo cargado simultáneamente.
- Qwen2.5-VL-7B-Instruct en 4 bits: en torno a 4-5 GB de memoria para los pesos, más overhead de contexto y activaciones.
- MiniCPM-o 4.5 en 4 bits: requisitos inferiores a Qwen2.5-VL-7B por su menor tamaño; cifra exacta no disponible.
- Whisper large-v3-turbo en MLX: pensado para ejecución en Apple Silicon con memoria unificada; no se especifica el consumo.
- wav2vec2 y AST en fp16: modelos de tamaño medio, aptos para GPU de consumo (RTX 3060 o superior) y para CPU en inferencia por lotes.
- Cabe en GPU de consumo: sí para los submodelos de audio y para los multimodales en 4 bits; no se documenta el requisito conjunto.
- Opciones de despliegue: MLX (Whisper y multimodales), Transformers con safetensors (wav2vec2 y AST); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Eperlan/blooper-extractor-models | Repositorio agregado (audio + multimodal) | No disponible (19,1 GB en total) | No disponible | Mixta (MIT, Apache-2.0, BSD-3-Clause) | Hugging Face, 0 descargas |
| openai/whisper-large-v3-turbo | ASR | 809 M (aproximado, no confirmado en la información) | No disponible | MIT | Hugging Face |
| Qwen/Qwen2.5-VL-7B-Instruct | Multimodal imagen-texto | 7 B | No disponible | Apache-2.0 | Hugging Face |
| openbmb/MiniCPM-o-4_5 | Multimodal | No disponible | No disponible | Apache-2.0 | Hugging Face |

La comparativa se limita a los modelos constituyentes, ya que el repositorio no define un modelo propio con el que compararse. Los datos de parámetros y contexto de los originales no se detallan en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo entrenado: no debe citarse como contribución técnica propia ni evaluarse como tal.
- Licencia mixta: el uso comercial requiere revisar la licencia de cada submodelo (MIT, Apache-2.0, BSD-3-Clause) y los términos de la aplicación Blooper Extractor.
- Las variantes wav2vec2 solo son compatibles con versiones de la aplicación anteriores a octubre de 2026; quedan obsoletas para usos nuevos.
- MiniCPM-o 4.5 se distribuye sin sus archivos Python personalizados, por lo que puede requerir código adicional para funcionar.
- Riesgo de alucinación inherente a Whisper y a los modelos multimodales en tareas de transcripción y descripción.
- Sesgos: no documentados en el repositorio; heredados de los datasets originales de cada modelo.
- Idiomas y contexto: no especificados en el repositorio; deben consultarse en las model cards de los originales.
- Sin descargas ni likes: no hay evidencia de uso en producción ni de validación por la comunidad.
- El tamaño de 19,1 GB puede ser prohibitivo para despliegues con almacenamiento limitado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Eperlan/blooper-extractor-models
- Aplicación Blooper Extractor: https://blooperextractor.com
- Contacto de soporte: support@eperlan.com
