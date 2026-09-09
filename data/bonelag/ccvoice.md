# bonelag/ccvoice

## Resumen

El repositorio `bonelag/ccvoice` no es un modelo de IA, sino un **dataset de audio de voz vietnamita de alta calidad** destinado al entrenamiento y afinado de sistemas de texto a voz (TTS) y reconocimiento automático de habla (ASR). Ha sido desarrollado por el usuario **bonelag** y se publica bajo licencia **CC BY 4.0**. Su objetivo es proporcionar un corpus multivoz de vietnamita en formato WAV de 24 kHz, con 8 voces distintas, 17.736 frases y un total de 58 horas, 24 minutos y 49 segundos de habla real.

Aunque no posee arquitectura ni parámetros de modelo, el dataset está pensado para alimentar arquitecturas modernas de síntesis como **Kokoro-Vietnamese**, **VieNeu-TTS**, **F5-TTS**, **VITS**, **Matcha-TTS** y **StyleTTS 2**. Su relevancia radica en la escasez de recursos abiertos de voz vietnamita con calidad de producción y en la diversidad estilística de las voces incluidas, lo que permite experimentar con sistemas TTS multivoz y evaluaciones ASR en ese idioma.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (dataset de audio, no modelo) |
| Parámetros totales | No disponible |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible (no aplica a dataset) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Vietnamita (vi-VN) |
| Licencia | CC BY 4.0 |
| Formato de pesos | No disponible |
| Tamaño del repositorio | 7,9 GB |
| Formato de audio | WAV (PCM lineal 16-bit), 24 kHz, mono, 384 kbps |
| Número de voces | 8 |
| Número de frases | 17.736 |
| Total de palabras | 91.482 |
| Total de archivos WAV | 141.888 |
| Duración total | 58 horas, 24 minutos y 49 segundos |

El dataset se distribuye en 8 paquetes ZIP independientes, uno por voz, cada uno con los WAV y un `metadata.csv` en formato LJSpeech (transcripción separada por `|`). Los tamaños de los ZIP oscilan entre 890,6 MB y 1,18 GB.

## Arquitectura y entrenamiento

Al tratarse de un dataset, no existe arquitectura de modelo ni proceso de entrenamiento con RLHF o DPO. El recurso consiste en un corpus de voz etiquetado, compuesto por **17.736 frases** en vietnamita con un total de **91.482 palabras**, grabadas y procesadas por **8 hablantes** distintos. Cada oración está disponible en las 8 voces, lo que genera **141.888 archivos WAV** de 24 kHz y 16 bits.

El autor declara que todas las grabaciones han pasado un control de calidad estricto: ningún archivo vacío, ningún segmento silencioso, sin clipping ni desviación de offset de DC, y con cabeceras RIFF/WAVE estandarizadas. Cada paquete incluye un script de verificación (`test.py`) y un script de división (`split.py`). La estructura de metadatos sigue el estándar LJSpeech: un CSV en UTF-8 con el nombre del archivo y la transcripción separados por `|`. Las voces cubren distintos perfiles: femenina suave, infantil, masculina expresiva, femenina sureña, etc., con el objetivo de capturar variaciones regionales y estilísticas del vietnamita.

## Capacidades

- Proporciona **material de entrenamiento para TTS multivoz** en vietnamita, con 8 voces de características diferentes.
- Es compatible con arquitecturas TTS habituales como Kokoro, VieNeu-TTS, F5-TTS, VITS, Matcha-TTS y StyleTTS 2.
- Permite **evaluación y entrenamiento de ASR** en vietnamita, al disponer de transcripciones alineadas con el audio.
- Incluye **audio de alta calidad** a 24 kHz y 16 bits, adecuado para síntesis de voz con muestreo superior.
- Ofrece **vistas previas en audio** para cada voz, descargables directamente desde el repositorio.
- Los metadatos están codificados en UTF-8 y siguen el formato LJSpeech, lo que facilita la carga en pipelines estándar.
- No es un modelo: no ofrece generación de texto, tool calling, razonamiento ni capacidades de agente.

## Casos de uso

- **Fine-tuning de un TTS para asistente de voz en vietnamita**: el dataset permite ajustar un modelo base (por ejemplo, F5-TTS o VITS) con 17.736 frases por voz. Las 8 voces cubren perfiles de género, edad y estilo, lo que permite ofrecer a los usuarios finales una elección de voz variada en un producto de asistencia.
- **Creación de audiolibros automatizados**: las voces "ReviewNew" y "Mai" presentan un estilo narrativo y de locución, con más de 10 y 6 horas de audio respectivamente. Este volumen resulta suficiente para entrenar un modelo que lea párrafos largos con prosodia natural y estable.
- **Evaluación de sistemas ASR en vietnamita**: el corpus contiene 141.888 pares texto-audio con transcripción exacta. Puede usarse como conjunto de prueba para medir tasa de error de palabras (WER) en modelos de reconocimiento de habla vietnamitas, garantizando cobertura de distintos acentos y velocidades de habla.
- **Generación de contenido de accesibilidad**: con voces claras como "NuPhoThong" (voz femenina estándar) y una duración total de casi 59 horas, el dataset es adecuado para entrenar modelos que generen audiodescripciones para personas con discapacidad visual en entornos web o educativos.
- **Producción de voz para vídeo o redes sociales**: las voces infantiles ("GiongBe") y masculinas expresivas ("NamMeoMo") permiten sintetizar estilos informales y dinámicos. El modelo resultante puede usarse en plataformas de vídeo corto para narrar contenido de entretenimiento.
- **Investigación en síntesis multivoz y transferencia de estilo**: al disponer de exactamente las mismas frases en las 8 voces, el dataset facilita estudios controlados sobre variación de prosodia, emisión de acentos regionales y clonación de voz, sin necesidad de normalizar el contenido textual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que el dataset ha superado una verificación interna de calidad (todos los archivos marcados como "100% PASS"), pero no existen métricas comparativas públicas frente a otros corpus de voz vietnamita.

## Requisitos de hardware

- **Consumo directo**: al ser un dataset, no requiere VRAM para su uso. Solo necesita espacio en disco para descargar los 7,9 GB del repositorio.
- **Almacenamiento por paquete**: los ZIP por voz ocupan entre 890,6 MB y 1,18 GB. Tras descomprimir, cada voz contiene 17.736 archivos WAV y un `metadata.csv`.
- **Carga en procesos de entrenamiento**: para fine-tuning de un modelo TTS, se recomienda una GPU con suficiente VRAM según la arquitectura elegida. En el README se menciona que el script de verificación procesa aproximadamente 4.500 archivos por segundo, lo que sugiere que el control de calidad puede ejecutarse en CPU sin problemas.
- **Herramientas de integración**: el formato de audio WAV y el `metadata.csv` son compatibles con pipelines basadas en `datasets` de Hugging Face, así como con frameworks de entrenamiento de TTS como F5-TTS o VITS.
- **Opciones de despliegue**: no aplica, ya que no es un modelo inferencial.

## Comparativa con modelos similares

No se dispone de información pública sobre otros datasets comparables en los datos proporcionados. Por lo tanto, no se puede establecer una comparativa fiable con alternativas de esta categoría.

## Limitaciones y advertencias

- **No es un modelo**: el repositorio contiene únicamente audio y transcripciones; no puede usarse directamente para sintetizar voz.
- **Idioma único**: todas las muestras están en vietnamita (vi-VN). No hay datos en otros idiomas, lo que limita su uso a sistemas orientados a vietnamita.
- **Diversidad de voces restringida**: solo hay 8 hablantes, y la distribución por género es claramente desequilibrada: 7 voces femeninas y 1 masculina ("NamMeoMo"). Esto puede introducir sesgos en modelos entrenados con este corpus.
- **Selección de frases**: las 17.736 oraciones pueden no cubrir todos los dominios (jerga técnica, lenguaje formal médico o jurídico, etc.), lo que limita la generalización de un modelo afinado con estos datos.
- **Licencia CC BY 4.0**: permite uso comercial y modificación, pero exige atribución al autor. Es recomendable revisar los términos exactos antes de incluir el dataset en productos comerciales.
- **Ausencia de etiquetas auxiliares**: no se proporciona información de emociones, estilo de habla o contexto más allá de la transcripción y la voz, lo que dificulta el entrenamiento de modelos que requieran estas señales.
- **Riesgo de alucinación**: no aplica al ser un dataset, pero los modelos entrenados con estos datos podrían heredar las limitaciones del corpus en cuanto a dominio y variedad de acentos.

## Enlaces

- HuggingFace: https://huggingface.co/bonelag/ccvoice
- Repositorio de GitHub del autor (OVoice, proyecto TTS relacionado): https://github.com/bonelag/OVoice
