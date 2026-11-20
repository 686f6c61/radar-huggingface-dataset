# Ming224/whisper-small-cantonese

## Resumen

Whisper-small-cantonese es un ajuste fino de openai/whisper-small (242 millones de parámetros) desarrollado por el usuario Ming224 para el reconocimiento automático de habla en cantonés de Hong Kong. El problema que aborda es concreto: el modelo original de OpenAI tiende a transcribir el cantonés hablado convirtiéndolo a mandarín escrito, de modo que partículas coloquiales como 喺, 唔, 嘅, 佢 o 哋 se sustituyen por sus equivalentes mandarines (在, 不, 的, 他, 們). Este ajuste fino corrige ese comportamiento y produce caracteres cantonales escritos en tradicional de Hong Kong.

El modelo se entrenó sobre el subconjunto `zh-HK` de Mozilla Common Voice 27.0 (19.942 clips validados, 22,6 horas, 303 hablantes) y se distribuye en formato `transformers` con pesos safetensors bajo licencia Apache 2.0. Es relevante porque cubre una lengua con muy pocos recursos ASR de calidad y porque demuestra que un ajuste fino ligero (unas 3,2 épocas sobre una única T4) reduce el CER del 38,3% al 11,1% en una muestra preliminar del conjunto de test.

Se trata de un proyecto de curso (IERG4320 / IEMS5726A Data Science in Practice, CUHK, 2026-27 Term 1), con un repositorio de 1,0 GB y sin descargas ni likes registrados en el momento de la consulta. Existe además una conversión a CTranslate2 int8 para inferencia rápida en CPU con faster-whisper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), ajuste fino completo de openai/whisper-small |
| Parametros totales | 241.734.912 (242M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper; no se especifica en la informacion) |
| Tipos de cuantizacion | fp16 para entrenamiento; int8 disponible via CTranslate2 (faster-whisper) en el repo Ming224/whisper-small-cantonese-ct2 |
| Idiomas soportados | yue (cantonés), zh; se usa con `language="zh"` porque Whisper-small no tiene token de idioma dedicado para cantonés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers); conversion CTranslate2 int8 en repo aparte |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper-small: un transformer encoder-decoder con 242M de parámetros, sin modificaciones estructurales. El ajuste fino afecta a todos los parámetros del modelo. Los datos de entrenamiento provienen de Mozilla Common Voice 27.0, locale `zh-HK` (licencia CC0-1.0): 19.942 clips validados, 22,6 horas y 303 hablantes, con un filtrado cuidadoso para evitar fugas de datos (se excluyeron hablantes y frases presentes en los splits oficiales `dev` y `test`, se limitó a 5 grabaciones por frase y a 20 minutos por hablante).

El procedimiento consistió en 4.000 pasos (unas 3,2 épocas) con batch efectivo de 16 (8 × 2 de acumulación de gradiente), learning rate 1e-5 con 500 pasos de warm-up y decaimiento lineal, precisión fp16 y una única NVIDIA T4 (Google Colab) durante aproximadamente 2 h 50 min. El mejor checkpoint fue el paso 3.500. El texto objetivo se normalizó: sin puntuación y en caracteres tradicionales de Hong Kong. No se menciona RLHF, DPO ni ninguna innovación arquitectónica adicional.

## Capacidades

- Reconocimiento automático de habla (ASR) de cantonés de Hong Kong, con salida en caracteres tradicionales y partículas coloquiales correctas.
- Transcripción de audio corto (mediana de 3,7 s en entrenamiento) mediante el pipeline `automatic-speech-recognition` de transformers.
- Manejo del cambio de código con mandarín escrito: el modelo base se invoca con `language="zh"`, y el ajuste redirige la salida hacia formas cantonales.
- Inferencia en CPU mediante la conversión CTranslate2 int8 con faster-whisper.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión, audio generativo ni modo de pensamiento; es un modelo puramente ASR.
- No genera puntuación en la salida, por diseño de los datos de entrenamiento.

## Casos de uso

- Subtitulado de vídeo en cantonés: transcripción de clips cortos de YouTube o redes sociales con el pipeline de transformers, útil porque el modelo escribe partículas coloquiales correctas en lugar de convertir a mandarín.
- Archivado y búsqueda de entrevistas: transcripción por lotes de grabaciones de audio con segmentación previa mediante VAD, aprovechando la licencia Apache 2.0 para uso interno sin restricciones.
- Herramientas de accesibilidad para hablantes de cantonés: generación de subtítulos en directo o diferidos para personas con discapacidad auditiva en contextos de Hong Kong.
- Investigación lingüística: corpus anotados de cantonés hablado con transcripción automática y revisión humana, donde el modelo sirve como preanotador y el investigador corrige homófonos en topónimos y nombres propios.
- Prototipos de asistentes de voz en CPU: despliegue con faster-whisper int8 en servidores sin GPU para transcripción de comandos cortos, dado el reducido coste computacional del modelo de 242M.
- Docencia y proyectos académicos: base reproducible para experimentos de ajuste fino ASR en lenguas de bajos recursos, con hiperparámetros y datos documentados de forma explícita.

## Benchmarks y rendimiento

CER (character error rate, menor es mejor). Texto normalizado antes de puntuar: puntuación eliminada, simplificado a tradicional de Hong Kong (OpenCC `s2hk`) y variantes unificadas.

| Conjunto | Modelo | CER |
|---|---|---|
| Validación (500 enunciados del split `dev`, checkpoint paso 3500) | Este modelo | 10,71% |
| Test preliminar (subconjunto fijo de 300 enunciados del split `test`, faster-whisper int8, beam size 5) | whisper-small zero-shot | 38,3% |
| Test preliminar (mismo subconjunto) | Este modelo | 11,1% |

El autor indica que los resultados completos del conjunto de test se añadirán más adelante. La mayor ganancia se observa en caracteres coloquiales: el modelo zero-shot los escribe como equivalentes mandarines, mientras que el ajustado los acierta aproximadamente el 93% de las veces.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 1 GB para los pesos (242M parámetros × 2 bytes) más el overhead de activaciones y del pipeline; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: NVIDIA T4 (la usada para entrenar), RTX 3060, RTX 4090, A100 o H100; no requiere GPU de gama alta.
- Cabe en GPU consumer: sí, en cualquier tarjeta con al menos 2-4 GB de VRAM; también funciona en CPU con la conversión int8.
- Opciones de despliegue: `transformers` (pipeline `automatic-speech-recognition`), faster-whisper con el modelo CTranslate2 int8; no se documentan integraciones con vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada. El entrenamiento completo requirió unas 2 h 50 min en una T4, lo que da una idea del orden de magnitud del coste de ajuste, no de la inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / audio | CER en test (muestra 300) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ming224/whisper-small-cantonese | 242M | ventana Whisper de 30 s | 11,1% | Apache 2.0 | Hugging Face, transformers y CTranslate2 |
| openai/whisper-small (zero-shot) | 242M | ventana Whisper de 30 s | 38,3% | Apache 2.0 | Hugging Face, transformers |
| openai/whisper-large-v3 | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | Apache 2.0 | Hugging Face |
| Otros ajustes finos de Whisper para cantonés | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion |

La única comparación cuantitativa publicada es frente al modelo base zero-shot, con una mejora de 27,2 puntos porcentuales de CER. No se aportan datos frente a whisper-large-v3 ni frente a otros modelos específicos de cantonés.

## Limitaciones y advertencias

- Entrenado sobre habla leída corta (mediana de 3,7 s); no cubre conversación espontánea, ruido de fondo ni grabaciones largas, que deben segmentarse previamente (por ejemplo con VAD).
- Los errores restantes son mayoritariamente homófonos, especialmente en topónimos y nombres propios.
- La salida no incluye puntuación porque los objetivos de entrenamiento se normalizaron.
- Los hablantes de Common Voice no están equilibrados por género ni edad; el rendimiento en grupos infrarrepresentados puede ser inferior.
- El modelo no tiene token de idioma cantonés: debe invocarse con `language="zh"`, y un uso incorrecto del parámetro puede degradar la salida.
- Riesgo de alucinación inherente a los modelos Whisper en segmentos de silencio o audio ruidoso; conviene validar la salida en producción.
- Sesgos de género, edad y procedencia derivados de la composición del corpus Common Voice.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; es un proyecto académico sin descargas ni validación externa registradas.
- Los resultados de test son preliminares sobre un subconjunto de 300 enunciados y el conjunto completo aún no se ha publicado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ming224/whisper-small-cantonese
- Conversión CTranslate2 int8: https://huggingface.co/Ming224/whisper-small-cantonese-ct2
- Modelo base: https://huggingface.co/openai/whisper-small
- faster-whisper: https://github.com/SYSTRAN/faster-whisper
- Mozilla Common Voice: https://commonvoice.mozilla.org/
- OpenCC: https://github.com/BYVoid/OpenCC
