# mohamedrayyan/whisper-small-dv

## Resumen

El modelo `mohamedrayyan/whisper-small-dv` es un ajuste fino de `openai/whisper-small` especializado en reconocimiento automático del habla (ASR) para el idioma divehi (dv), también conocido como maldivo. El autor, mohamedrayyan, ha adaptado el modelo base de Whisper Small a este idioma de escasos recursos utilizando el conjunto de datos Common Voice 13.0 de Mozilla Foundation, con el objetivo de ofrecer transcripción de voz a texto de calidad para una lengua hablada por aproximadamente 400.000 personas en Maldivas.

El modelo se distribuye bajo licencia Apache 2.0, lo que permite su uso comercial sin restricciones significativas. Con un tamaño de repositorio de 1.0 GB, el modelo mantiene la arquitectura original de Whisper Small, un transformer encoder-decoder de 244 millones de parámetros, y está disponible en formato PyTorch con pesos en safetensors. Su relevancia radica en cubrir un idioma subrepresentado en los sistemas ASR comerciales, ofreciendo una alternativa funcional para transcripción en divehi con una tasa de error (WER) del 14,07% en el conjunto de test de Common Voice 13.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Small) |
| Parametros totales | 244 M (heredados de openai/whisper-small) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 448 segundos de audio (heredado de Whisper Small) |
| Tipos de cuantizacion | no disponible (el repositorio solo incluye pesos en fp32/fp16) |
| Idiomas soportados | Divehi (dv) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors, PyTorch |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura original de Whisper Small, un transformer encoder-decoder con normalización de capa pre-post, atención multi-cabeza y codificación posicional sinusoidal. Whisper Small fue entrenado originalmente por OpenAI sobre 680.000 horas de audio etiquetado de forma débil, pero este ajuste fino se realizó exclusivamente sobre el subconjunto en divehi de Common Voice 13.0, que contiene aproximadamente 10 horas de audio validado.

El entrenamiento se llevó a cabo con el framework Transformers de Hugging Face, utilizando un learning rate de 1e-05, batch size de 16 para entrenamiento y 8 para evaluación, y un total de 500 pasos de optimización. Se empleó el optimizador Adam con betas (0.9, 0.999) y epsilon 1e-08, junto con un scheduler de tipo constant_with_warmup con 50 pasos de calentamiento. La pérdida de entrenamiento final fue de 0.136, con una pérdida de validación de 0.1727. No se aplicaron técnicas de RLHF ni DPO; el ajuste se realizó mediante entrenamiento supervisado estándar con pérdida de entropía cruzada.

## Capacidades

- Transcripción de voz a texto en divehi (dv) con una tasa de error (WER) del 14,07% en el conjunto de test de Common Voice 13.
- Reconocimiento de habla multilingüe heredado de Whisper Small, aunque el ajuste fino puede degradar el rendimiento en otros idiomas.
- Identificación de idioma y traducción de voz a texto en inglés, capacidades presentes en el modelo base pero no evaluadas en este ajuste.
- Procesamiento de audio de hasta 448 segundos de duración, gracias a la ventana de contexto del modelo base.
- Soporte de tareas de ASR con y sin puntuación, dependiendo de los tokens de tarea especificados durante la inferencia.
- Funcionamiento con la pipeline de Hugging Face `automatic-speech-recognition` para integración directa.

## Casos de uso

- Transcripción de reuniones y conferencias en divehi: el modelo puede transcribir grabaciones de audio de hasta 7 minutos por pasada, lo que permite procesar sesiones completas mediante segmentación. Su WER del 14% es aceptable para generar actas preliminares que requieran revisión humana posterior.
- Subtitulado automático de vídeos en maldivo: integrable en pipelines de generación de subtítulos para contenido audiovisual local, como noticias o vídeos educativos, reduciendo el coste de subtitulado manual.
- Asistentes de voz para servicios públicos en Maldivas: el modelo puede servir como backend de transcripción en sistemas de atención ciudadana, convirtiendo consultas de voz en texto para su procesamiento posterior.
- Archivado y búsqueda de contenido audiovisual histórico: permite indexar archivos de audio en divehi, facilitando la búsqueda por texto en bibliotecas digitales o archivos gubernamentales.
- Aplicaciones de accesibilidad para personas con discapacidad auditiva: el modelo puede alimentar sistemas de subtitulado en tiempo real para eventos en directo, aunque la latencia dependerá del hardware de despliegue.
- Investigación lingüística y desarrollo de corpus: útil para transcribir entrevistas o grabaciones de campo en divehi, acelerando la creación de nuevos conjuntos de datos etiquetados para otros fines.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en el model-index de Hugging Face, obtenidos sobre el conjunto de test de Common Voice 13 en su configuración `dv`:

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Automatic Speech Recognition | Common Voice 13 (dv, test) | WER | 14,07% |
| Automatic Speech Recognition | Common Voice 13 (dv, test) | WER Ortho | 63,90% |
| Automatic Speech Recognition | Common Voice 13 (dv, test) | Loss | 0,1727 |

La discrepancia entre WER y WER Ortho (14,07% vs 63,90%) sugiere que el modelo produce transcripciones fonéticamente correctas pero con diferencias ortográficas significativas, probablemente debido a la variabilidad en la escritura del divehi. No se han publicado comparaciones con otros modelos en el mismo idioma dentro de la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2-3 GB en fp16, suficiente para GPUs de consumo como la NVIDIA GTX 1660 Super o superiores.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia en fp16; para procesamiento por lotes se recomienda una RTX 3060 o superior.
- Compatibilidad con GPUs de consumo: sí, el modelo cabe en GPUs de gama media como RTX 3060, RTX 4060 o incluso en Apple Silicon con Metal.
- Opciones de despliegue: compatible con la pipeline de Transformers, así como con vLLM, llama.cpp (mediante conversión a GGUF), y TGI para servir el modelo como API.
- Latencia estimada: en una RTX 3090, la transcripción de un audio de 10 segundos tarda aproximadamente 1-2 segundos; en CPU, el tiempo puede multiplicarse por 5-10 veces.

## Comparativa con modelos similares

| Modelo | Idioma | Parametros | Contexto | WER (Common Voice 13 dv) | Licencia |
|---|---|---|---|---|---|
| mohamedrayyan/whisper-small-dv | Divehi | 244 M | 448 s | 14,07% | Apache 2.0 |
| Ryukijano/whisper-small-dv | Divehi | 244 M | 448 s | no disponible | Apache 2.0 |
| YancyDan/whisper-small-dv | Divehi | 244 M | 448 s | no disponible | Apache 2.0 |
| openai/whisper-small (base) | Multilingue | 244 M | 448 s | no evaluado en dv | MIT |

Los tres modelos `whisper-small-dv` comparten la misma arquitectura y dataset de entrenamiento, por lo que sus diferencias de rendimiento probablemente sean mínimas. El modelo base de OpenAI no está optimizado para divehi y su WER en este idioma sería considerablemente superior, aunque no se dispone de datos oficiales.

## Limitaciones y advertencias

- El modelo solo ha sido evaluado en divehi; su rendimiento en otros idiomas puede degradarse respecto al modelo base de Whisper Small.
- El WER Ortho del 63,90% indica problemas significativos con la ortografía normalizada, lo que puede requerir post-procesamiento adicional para aplicaciones que exijan texto canónico.
- El conjunto de entrenamiento (Common Voice 13 dv) es reducido, aproximadamente 10 horas, lo que limita la robustez ante acentos, ruido de fondo y vocabulario especializado.
- Riesgo de alucinación en segmentos de audio silenciosos o con habla no inteligible, un comportamiento común en modelos Whisper.
- La licencia Apache 2.0 permite uso comercial, pero no se ofrecen garantías sobre la precisión del modelo en entornos de producción.
- No se han publicado análisis de sesgos ni evaluaciones de equidad para este modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mohamedrayyan/whisper-small-dv
- Dataset Common Voice 13: https://huggingface.co/datasets/mozilla-foundation/common_voice_13_0
- Modelo base Whisper Small: https://huggingface.co/openai/whisper-small
- Repositorio oficial de Whisper: https://github.com/openai/whisper
- Paper de Whisper: https://arxiv.org/abs/1910.09700
- Variante similar de Ryukijano: https://huggingface.co/Ryukijano/whisper-small-dv
- Variante similar de YancyDan: https://huggingface.co/YancyDan/whisper-small-dv
