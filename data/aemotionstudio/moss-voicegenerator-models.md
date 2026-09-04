# AEmotionStudio/moss-voicegenerator-models

## Resumen

MOSS-VoiceGenerator es un modelo de texto a voz (TTS) desarrollado por el equipo OpenMOSS de la Universidad de Fudan que permite diseñar el timbre de un hablante a partir de una descripción textual en lenguaje natural, sin necesidad de proporcionar audio de referencia. El modelo lee texto en inglés y chino con una entrega expresiva y emocional, lo que lo diferencia de los sistemas TTS tradicionales que requieren muestras de voz o ajuste fino por hablante.

La arquitectura combina un modelo de lenguaje de 1.700 millones de parámetros basado en Qwen3-1.7B con 16 cabezas RVQ de patrón de retardo (delay-pattern), que opera sobre el codec de audio MOSS-Audio-Tokenizer (24 kHz mono, 12,5 Hz de frecuencia de tramas, 1.770 millones de parámetros). El repositorio analizado es un espejo (mirror) mantenido por AEmotionStudio para su estación de trabajo MAESTRO, que redistribuye los pesos originales sin modificaciones y re-particiona el codec para permitir la descarga selectiva de la parte de decodificación. Todos los pesos están bajo licencia Apache-2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-1.7B backbone) con 16 cabezas RVQ delay-pattern sobre codec de audio |
| Parametros totales | 1.700 millones (generador de voz) + 1.770 millones (codec de audio) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en bf16 safetensors) |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (modelo en bf16; codec en fp32) |

## Arquitectura y entrenamiento

MOSS-VoiceGenerator sigue el diseño de la familia MOSS-TTS, utilizando un patrón de retardo en la decodificación de tokens de audio. La descripción de la voz y el texto a sintetizar se concatenan y se introducen en el modelo de lenguaje, que predice secuencialmente los tokens del codec. El modelo usa únicamente las primeras 16 capas de los codebooks RVQ del tokenizador de audio durante el entrenamiento, según el artículo de arXiv. El codec MOSS-Audio-Tokenizer es un modelo separado de 1.770 millones de parámetros que convierte audio en tokens y viceversa.

En el espejo de MAESTRO, el codec se ha re-particionado por tensores para separar el encoder del decoder, de modo que el runtime de diseño de voz solo necesita descargar la parte de decodificación (~3,5 GB). Cada tensor es idéntico al original, verificable mediante el archivo `sha256.json`. No se dispone de información detallada sobre el conjunto de datos de entrenamiento, el número de tokens procesados ni la aplicación de técnicas como RLHF o DPO.

## Capacidades

- Generación de texto a voz en inglés y chino con expresividad emocional.
- Diseño de timbre de hablante a partir de una descripción textual libre (por ejemplo, "voz cálida y romántica"), sin necesidad de audio de referencia.
- Síntesis de voz con control del estilo emocional a través de la descripción.
- Integración con el codec MOSS-Audio-Tokenizer para producir audio de 24 kHz en mono.
- Soporte de inferencia en entornos offline mediante el runtime de MAESTRO.
- No incluye capacidades de tool calling, razonamiento multi-paso ni visión; es un modelo puramente de texto a voz.

## Casos de uso

- Producción de audiolibros: el modelo permite crear una voz narradora única a partir de una descripción como "voz grave y pausada", y luego sintetizar capítulos completos en inglés o chino sin necesidad de grabar a un locutor.
- Doblaje de contenido audiovisual: se puede generar una voz doblada con un timbre específico para un personaje, describiendo sus características vocales, y aplicarla a guiones traducidos.
- Asistentes de voz personalizados: integración en aplicaciones de asistencia para ofrecer una voz sintética con personalidad definida por el usuario, sin requerir muestras de voz del usuario.
- Creación de contenido para redes sociales: generación de voces para vídeos cortos, podcasts o tutoriales, con la posibilidad de ajustar el tono emocional según el guion.
- Accesibilidad: síntesis de voz para lectores de pantalla o aplicaciones de comunicación aumentativa, permitiendo a los usuarios elegir una voz que les resulte cómoda y natural.
- Desarrollo de videojuegos: generación de voces para personajes no jugadores (NPC) con descripciones de personalidad, agilizando el prototipado de diálogos sin contratar actores de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8 GB para los pesos del modelo de lenguaje (4,23 GB en bf16) más el decoder del codec (3,5 GB en fp32), con un margen adicional para activaciones. En la práctica, se recomienda al menos 12 GB de VRAM.
- GPU recomendadas: RTX 4090 (24 GB), A100 (40/80 GB) o H100 (80 GB). El modelo puede ejecutarse en GPUs de consumo con 24 GB de VRAM.
- Opciones de despliegue: mediante `transformers` con `trust_remote_code=True` y el codec apuntando al espejo, o dentro del runtime de MAESTRO (archivo `backend/ai/models/moss_voicegenerator.py`).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos alternativos de la misma categoría en los datos proporcionados.

## Limitaciones y advertencias

- El modelo solo soporta inglés y chino; no se ha verificado su rendimiento en otros idiomas.
- Al generar timbres a partir de descripciones libres, puede producir voces que no coincidan exactamente con la intención del usuario, con riesgo de resultados inesperados o no deseados.
- No se han documentado sesgos específicos, pero al estar entrenado con datos de voz posiblemente limitados, podría reflejar sesgos en la distribución de hablantes o acentos.
- El repositorio es un espejo no oficial; aunque los pesos son idénticos al original, se recomienda verificar los hashes SHA-256 y citar los proyectos upstream (OpenMOSS / Universidad de Fudan).
- El codec re-sharded requiere que el índice de tensores se cargue correctamente; si se carga solo el decoder sin el encoder, la funcionalidad de codificación de audio no estará disponible.
- No se han publicado benchmarks ni evaluaciones de calidad de voz, por lo que el rendimiento real en tareas específicas debe validarse de forma independiente.

## Enlaces

- Repositorio del espejo: https://huggingface.co/AEmotionStudio/moss-voicegenerator-models
- Modelo original: https://huggingface.co/OpenMOSS-Team/MOSS-VoiceGenerator
- Codec original: https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer
- Código del proyecto MOSS-TTS: https://github.com/OpenMOSS/MOSS-TTS
- Código del tokenizador: https://github.com/OpenMOSS/MOSS-Audio-Tokenizer
- Artículo en arXiv: https://arxiv.org/html/2603.28086v1
- Página de análisis del modelo: https://www.aimodels.fyi/models/huggingFace/moss-voicegenerator-openmoss-team
- Proyecto MAESTRO: https://github.com/AEmotionStudio
