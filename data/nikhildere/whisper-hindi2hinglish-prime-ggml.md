# Nikhildere/whisper-hindi2hinglish-prime-ggml

## Resumen

Whisper-Hindi2Hinglish-Prime (ggml) es una conversión al formato ggml/whisper.cpp del modelo Oriserve/Whisper-Hindi2Hinglish-Prime, un ajuste fino de OpenAI Whisper large-v3 especializado en transcribir voz en hindi y hinglish (mezcla de hindi e inglés habitual en la India) a texto en escritura latina (romanización). El modelo original lo desarrolla Oriserve bajo licencia Apache 2.0; esta versión la publica el usuario Nikhildere y no introduce reentrenamiento ni modificación de pesos, solo la conversión de formato.

El problema que resuelve es concreto: Whisper large-v3 transcribe hindi en escritura devanagari, lo que dificulta su uso en flujos donde se espera texto romanizado (subtitulado, chats, motores de búsqueda en inglés). Este ajuste produce directamente hinglish en caracteres latinos, lo que simplifica el postprocesado. La conversión a ggml permite ejecución offline en CPU y en hardware modesto mediante whisper.cpp, sin depender de PyTorch ni de GPU dedicada.

La relevancia práctica es la del despliegue local: al ser un binario ggml de tipo f16, se integra en herramientas de escritorio. Según la model card, se usa como motor offline de subtitulado hinglish en Caption Bunny, el panel de subtítulos de Adobe Premiere Pro. El repositorio ocupa 3,1 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3), conversión a ggml |
| Parametros totales | no disponible (Whisper large-v3 tiene aproximadamente 1550 M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | f16 (único formato publicado en este repo) |
| Idiomas soportados | hindi (hi), inglés (en); salida en hinglish romanizado |
| Licencia | Apache 2.0 |
| Formato de pesos | ggml (.bin) para whisper.cpp |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de OpenAI Whisper large-v3: un transformer encoder-decoder con atención completa, entrenado originalmente para reconocimiento automático de voz multilingüe sobre ventanas de audio de 30 segundos y con tokens de idioma y de tarea. El ajuste fino que da lugar a este modelo lo realizó Oriserve sobre los pesos de large-v3 para especializar la salida en hinglish romanizado; los detalles del dataset de ajuste, el número de horas de audio y si hubo etapas de RLHF o DPO no están disponibles en la información proporcionada.

La contribución de esta publicación es puramente de formato: se aplicó el script `models/convert-h5-to-ggml.py` de whisper.cpp, se convirtieron los pesos bf16 a float y el resultado se almacenó como f16. No hay reentrenamiento ni cambios en los pesos más allá de la conversión numérica. La innovación práctica es la disponibilidad del modelo en un runtime C/C++ sin dependencias de Python, lo que habilita inferencia offline en CPU. La model card menciona el uso de `-nfa` (sin filtro de no-habla) y `-dtw large.v3` (alineamiento temporal dinámico) en el comando de ejemplo, parámetros relevantes para la calidad de las marcas de tiempo.

## Capacidades

- Transcripción de voz en hindi e hinglish a texto en escritura latina (romanizada).
- Reconocimiento de habla con mezcla de código hindi-inglés, frecuente en conversación informal en la India.
- Generación de marcas de tiempo por segmento, con soporte de alineamiento DTW en whisper.cpp.
- Ejecución offline en CPU mediante whisper.cpp, sin necesidad de GPU.
- Procesamiento de audio en ventanas de 30 segundos, con segmentación automática de archivos largos.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo ASR puro.
- No dispone de capacidades de visión, audio generativo ni modo de pensamiento.

## Casos de uso

- Subtitulado offline en editores de vídeo: la model card documenta su uso como motor de subtítulos hinglish en Caption Bunny (Adobe Premiere Pro), donde la inferencia local evita enviar audio a servicios en la nube y el formato ggml se integra en el flujo del plugin.
- Transcripción de reuniones y llamadas en equipos con personal hindi-parlante: al producir texto romanizado, el resultado es directamente legible y buscable por usuarios que no leen devanagari, sin necesidad de una etapa de transliteración.
- Generación de subtítulos para contenido de creadores indios: el modelo convierte audio hinglish en pistas de subtítulos con marcas de tiempo, útiles para plataformas que aceptan SRT con texto latino.
- Indexación y búsqueda de archivos de audio: transcribir un archivo de entrevistas o pódcasts a hinglish romanizado permite búsqueda por palabra clave y recuperación de fragmentos con herramientas de texto estándar.
- Atención al cliente con grabaciones telefónicas: transcripción por lotes de llamadas en hindi para auditoría de calidad; el despliegue en CPU con whisper.cpp abarata el procesamiento masivo frente a inferencia en GPU.
- Prototipado y desarrollo de aplicaciones de voz: al ser un binario ggml sin dependencias de Python, se puede embeber en aplicaciones de escritorio o en contenedores ligeros para pruebas de concepto de ASR hinglish.
- Accesibilidad: generación de transcripciones en directo o diferido para vídeos dirigidos a audiencias que mezclan hindi e inglés, con salida en un alfabeto ampliamente legible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la del modelo original (Oriserve/Whisper-Hindi2Hinglish-Prime) para detalles de evaluación, pero no incluye cifras de WER ni comparativas en esta publicación.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio pesa 3,1 GB en f16, lo que da una cota aproximada del tamaño de los pesos en memoria (unos 3 GB).
- GPU recomendadas: no especificadas en la información proporcionada. Al ser una conversión ggml para whisper.cpp, el caso de uso previsto es CPU.
- Cabida en GPU de consumo: previsiblemente sí en tarjetas con 4 GB o más de VRAM, aunque este dato no está confirmado en la información disponible.
- Opciones de despliegue: whisper.cpp (formato nativo), con el binario `whisper-cli`; el formato ggml no es directamente compatible con vLLM, TGI ni Ollama, que no soportan modelos Whisper de este tipo.
- Latencia y throughput: no disponibles. Dependen del número de hilos de CPU, del modelo de procesador y de la duración del audio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (Whisper large-v3 ajustado) | no disponible (base large-v3) | ventanas de 30 s | hi, en (salida hinglish) | Apache 2.0 | ggml f16 |
| OpenAI Whisper large-v3 | aproximadamente 1550 M | ventanas de 30 s | multilingüe (incluye hi, en) | MIT (según publicación original; no confirmado en la información disponible) | PyTorch, entre otros |
| Oriserve/Whisper-Hindi2Hinglish-Prime | no disponible | ventanas de 30 s | hi, en (salida hinglish) | Apache 2.0 | safetensors (formato de pesos original) |

La diferencia principal frente a Whisper large-v3 es la salida romanizada en hinglish en lugar de devanagari, y frente al modelo de Oriserve, el formato ggml que permite ejecución en whisper.cpp sin Python.

## Limitaciones y advertencias

- Modelo de reconocimiento de voz: no genera texto libre, no razona y no admite instrucciones en lenguaje natural.
- Riesgo de error en la romanización: la transliteración hinglish puede ser inconsistente en nombres propios, términos técnicos y palabras poco frecuentes.
- Rendimiento degradado en audio con ruido, acentos no indios o mezcla de otras lenguas distintas del hindi y el inglés.
- Sesgos heredados del ajuste fino de Oriserve y de los datos de Whisper large-v3; no se documentan análisis de sesgo en esta publicación.
- Ventana de audio de 30 segundos por segmento: los archivos largos requieren segmentación, y los errores de alineamiento temporal pueden acumularse.
- Licencia Apache 2.0, que permite uso comercial, pero la responsabilidad sobre los datos de entrenamiento originales recae en el modelo base.
- Repositorio sin descargas ni validación comunitaria en el momento de la consulta: no hay evidencia pública de calidad más allá de la model card.
- El formato ggml f16 no incluye cuantizaciones de menor precisión en este repositorio, lo que limita la reducción de memoria en hardware muy restringido.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Nikhildere/whisper-hindi2hinglish-prime-ggml
- Modelo base: https://huggingface.co/Oriserve/Whisper-Hindi2Hinglish-Prime
- whisper.cpp (runtime ggml): https://github.com/ggerganov/whisper.cpp
- OpenAI Whisper (modelo original): https://github.com/openai/whisper
