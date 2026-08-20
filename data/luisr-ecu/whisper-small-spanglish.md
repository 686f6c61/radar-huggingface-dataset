# Luisr-ecu/whisper-small-spanglish

## Resumen

Este modelo es un fine-tuning de `openai/whisper-small` desarrollado por Luisr-ecu, orientado al reconocimiento automático de habla (ASR) en spanglish, es decir, la alternancia de código entre español e inglés típica de comunidades bilingües como Miami. El checkpoint base, Whisper Small, es un transformer encoder-decoder de 241,7 millones de parámetros entrenado por OpenAI con 680.000 horas de audio etiquetado mediante supervisión débil. Este fine-tuning se ha realizado sobre el corpus Miami Corpus (drewoodward/miami-corpus), un dataset de conversación espontánea con code-switching en español e inglés.

El problema que resuelve es la transcripción fiable de audio donde los hablantes mezclan ambos idiomas en la misma frase, un escenario donde los modelos monolingües o los Whisper genéricos suelen degradar su precisión. Su relevancia actual reside en la creciente demanda de sistemas de ASR para entornos multilingües reales (atención al cliente, subtitulado, análisis de conversaciones). El modelo se distribuye bajo licencia MIT y está publicado el 19 de agosto de 2026.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 241.734.912 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 30 segundos de audio por segmento |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se documentan cuantizaciones GGUF/CT2) |
| Idiomas soportados | es, en |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Whisper de OpenAI: un encoder de transformer que procesa espectrogramas log-mel de 128 canales y 30 segundos de audio, y un decoder autorregresivo que genera los tokens de transcripción. El checkpoint base (`openai/whisper-small`) fue entrenado con 680.000 horas de audio etiquetado en 99 idiomas, lo que le otorga una base multilingüe sólida. El fine-tuning se realizó sobre el corpus Miami Corpus, que contiene habla espontánea con alternancia de código español-inglés en el área de Miami.

No se han publicado en la model card los hiperparámetros de entrenamiento (número de épocas, tasa de aprendizaje, estrategia de mixed precision, tamaño de batch) ni detalles del preprocesado de audio. Tampoco se documentan técnicas de regularización o de aumento de datos. La creación del modelo es reciente (agosto de 2026) y no hay evidencia de evaluación pública más allá del propio repositorio.

## Capacidades

- Reconocimiento automático de habla (ASR) con soporte de code-switching entre español e inglés, especializado en el dialecto de Miami.
- Transcripción de audio en español y en inglés, con mayor robustez en mezclas de ambos idiomas que el modelo base.
- Herencia de las capacidades generales de Whisper small: manejo de ruido de fondo, acentos y variantes dialectales dentro de los idiomas entrenados.
- No soporta tool calling, function calling ni razonamiento multi-paso: es exclusivamente un sistema de transcripción de audio a texto.
- No incluye capacidades de visión ni de síntesis de voz; es solo ASR.
- El pipeline es `automatic-speech-recognition`, compatible con la infraestructura de HuggingFace Transformers.

## Casos de uso

- Transcripción de reuniones bilingües: el modelo puede convertir conversaciones donde los participantes alternan entre español e inglés, algo habitual en equipos multiculturales. Su ventana de 30 segundos permite procesar turnos de habla completos sin cortes.
- Atención al cliente en mercados hispanos de EE. UU.: los centros de contacto en Miami, Texas o California reciben llamadas con mezcla de idiomas; el modelo transcribe estas llamadas para análisis de calidad y formación de agentes.
- Documentación de servicios sociales y sanitarios: en consultas médicas o entrevistas sociales donde el paciente y el profesional alternan de idioma, el modelo genera una transcripción fiel para el expediente.
- Subtitulado de vídeo en redes sociales: creadores de contenido que producen vídeos en spanglish pueden generar subtítulos automáticos con mayor precisión que usando un modelo genérico.
- Investigación sociolingüística: el corpus de Miami lo hace útil para estudios sobre alternancia de código, frecuencia de cambio de idioma y patrones de code-switching en el habla espontánea.
- Análisis de conversaciones en servicios de interpretación: en entornos de interpretación consecutiva, el modelo puede transcribir la parte del hablante original para verificar la calidad de la interpretación.
- Asistentes de voz para comunidades bilingües: integrado en un pipeline de ASR, permite que un asistente de voz entienda comandos que mezclan español e inglés en la misma frase.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de WER (word error rate) ni comparaciones con el modelo base o con alternativas del mercado. Se recomienda evaluar el modelo sobre un conjunto de validación propio antes de su uso en producción, especialmente en dominios distintos al corpus de Miami.

## Requisitos de hardware

- VRAM estimada: el checkpoint de ~242 millones de parámetros ocupa aproximadamente 1 GB en fp32 y 500 MB en fp16; con overhead de inferencia cabe en GPUs de consumo con 2-4 GB de VRAM.
- GPUs recomendadas: NVIDIA GTX 1060 (6 GB) o superiores, RTX 3060, RTX 4090; también funciona en CPU para inferencia de baja latencia en lotes pequeños.
- Despliegue: compatible con HuggingFace Transformers (pipeline `automatic-speech-recognition`), `faster-whisper` (CTranslate2), `whisper.cpp` (GGUF) y la API de Whisper. No se documentan archivos de cuantización específicos en el repo.
- Latencia y throughput: no disponible en la información del modelo. Whisper small en GPU de gama media (RTX 3060) suele transcribir audio en tiempo real o más rápido; en CPU el factor de velocidad es menor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Luisr-ecu/whisper-small-spanglish | 241,7 M | 30 s | es, en | MIT | Fine-tune sobre Miami Corpus, especializado en code-switching |
| openai/whisper-small | 244 M | 30 s | 99 | MIT | Modelo base, multilingüe, sin especialización en spanglish |
| openai/whisper-medium | 769 M | 30 s | 99 | MIT | Mayor precisión general, mayor coste computacional |
| openai/whisper-large-v3 | 1.550 M | 30 s | 99 | MIT | Máxima precisión, requiere GPU de alta gama |

La comparativa es orientativa: el modelo de Luisr-ecu solo está especializado en es-en, mientras que los modelos base de OpenAI cubren 99 idiomas. La ventaja del fine-tune es su robustez en code-switching, aunque no se han publicado métricas que cuantifiquen esa ventaja.

## Limitaciones y advertencias

- El entrenamiento se realizó exclusivamente sobre el corpus de Miami, por lo que el modelo puede degradarse en otras variantes del español (español de España, de México, de Argentina) o en otras regiones con code-switching distinto.
- La ventana de 30 segundos de Whisper limita el procesamiento de audio largo; es necesario segmentar el audio en fragmentos de menos de 30 segundos.
- No se han publicado métricas de WER ni de precisión, por lo que no es posible conocer su rendimiento real comparado con el modelo base.
- El corpus Miami Corpus puede contener sesgos geográficos y dialectales propios de la zona de Miami (Florida), incluyendo variantes del español caribeño.
- El nombre del modelo sugiere que es un fine-tuning de un checkpoint base, pero la model card no documenta el proceso de entrenamiento (épocas, datos de validación, etc.).
- Aunque la licencia MIT permite uso comercial, se recomienda validar el modelo con datos de producción antes de integrarlo en sistemas críticos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Luisr-ecu/whisper-small-spanglish
- Modelo base openai/whisper-small: https://huggingface.co/openai/whisper-small
- Repositorio oficial de Whisper (GitHub): https://github.com/openai/whisper
- Dataset Miami Corpus: https://huggingface.co/datasets/drewoodward/miami-corpus
- Referencia de Whisper small en OpenASR: https://openasr.org/models/whisper-small/
- Referencia de Whisper small en OpenSourcesAI: https://opensourcesai.com/models/whisper-small/
- Paper de estimación de impacto ambiental (referencia en model card): https://arxiv.org/abs/1910.09700
