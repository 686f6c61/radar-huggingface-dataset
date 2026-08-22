# aneforge/whisper-base.en

## Resumen

El modelo `aneforge/whisper-base.en` es una copia bit a bit idéntica del modelo `openai/whisper-base.en`, publicada por el autor ANEForge con el objetivo de permitir su ejecución directa sobre el Apple Neural Engine (ANE) sin necesidad de CoreML. Se trata de un sistema de reconocimiento automático del habla (ASR) especializado en inglés, basado en la arquitectura Transformer encoder-decoder de OpenAI. Con 72,59 millones de parámetros y una ventana de contexto de 30 segundos de audio, es un modelo ligero pensado para tareas de transcripción en tiempo real o en dispositivos con recursos limitados.

Su relevancia actual radica en que ANEForge compila el grafo del modelo en un único programa para el ANE, permitiendo que aplicaciones en macOS e iOS aprovechen el acelerador neural de Apple sin necesidad de convertir los pesos a formatos propietarios. Al ser una réplica sin modificar, hereda todas las capacidades y limitaciones del modelo original, incluyendo su licencia Apache 2.0 y su enfoque exclusivamente en inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper base) |
| Parámetros totales | 72.593.408 |
| Parámetros activos | no aplicable (modelo denso) |
| Longitud de contexto | 30 segundos de audio (muestras a 16 kHz) |
| Tipos de cuantización | no disponible (pesos originales en fp32; ANEForge puede manejar conversión interna) |
| Idiomas soportados | inglés (modelo .en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una copia sin cambios de `openai/whisper-base.en`, por lo que su arquitectura es un Transformer encoder-decoder estándar, con 4 capas de encoder y 4 capas de decoder, 512 dimensiones de modelo y 8 cabezas de atención. Fue entrenado por OpenAI sobre 680.000 horas de audio débilmente supervisado, con un enfoque específico para el inglés en la variante `.en`. No se ha aplicado ningún ajuste fino adicional en este repositorio; los pesos son idénticos al original.

La innovación técnica no proviene del modelo en sí, sino de la librería ANEForge, que compila el grafo de computación del modelo en un único programa para el Apple Neural Engine y transmite los pesos desde este repositorio mediante `huggingface_hub`. Esto permite ejecutar la inferencia directamente en el ANE sin pasar por CoreML, reduciendo la latencia y el consumo energético en dispositivos Apple.

## Capacidades

- Transcripción de audio en inglés: convierte señales de audio de 16 kHz mono en texto transcrito.
- Reconocimiento de voz robusto frente a ruido de fondo y acentos variados, heredado del modelo original.
- Soporte de timestamps a nivel de segmento (disponible en la API original, aunque no se detalla en la documentación de ANEForge).
- Ejecución específica para el Apple Neural Engine: el modelo se carga y ejecuta mediante `af.load_whisper(...)` sin conversión a CoreML.
- No soporta tool calling, razonamiento multi-paso, ni capacidades multimodales más allá del audio.
- Solo procesa inglés; no hay soporte para otros idiomas ni para traducción automática.

## Casos de uso

- Transcripción de reuniones y notas de voz en macOS: el modelo puede procesar grabaciones de voz en tiempo real, aprovechando el ANE para mantener la CPU libre y reducir el consumo de batería.
- Subtitulado automático de vídeos para contenido en inglés: se integra fácilmente en pipelines de edición de vídeo, generando subtítulos con precisión aceptable para vídeos de baja complejidad.
- Asistente de voz en aplicaciones de escritorio: por su pequeño tamaño, puede ejecutarse en segundo plano en aplicaciones de productividad, convirtiendo dictados en texto.
- Accesibilidad en dispositivos Apple: permite transcribir llamadas o audios en tiempo real para usuarios con discapacidad auditiva, con baja latencia gracias al ANE.
- Análisis de entrevistas y reuniones: los investigadores pueden procesar grabaciones de entrevistas en inglés, extrayendo transcripciones para análisis cualitativo.
- Pruebas de integración para desarrolladores de ANEForge: sirve como modelo de referencia para verificar el funcionamiento de la librería en diferentes generaciones de Apple Silicon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo es idéntico a `openai/whisper-base.en`, cuyos resultados (por ejemplo, WER en LibriSpeech) pueden consultarse en el repositorio original de OpenAI, pero no se incluyen aquí para evitar datos inventados.

## Requisitos de hardware

- El modelo está diseñado para ejecutarse en el Apple Neural Engine, presente en dispositivos con chip M1 o posterior (macOS, iOS, iPadOS).
- No se requiere GPU dedicada; el ANE es un acelerador integrado en el SoC.
- El modelo ocupa aproximadamente 290 MB en disco (0.3 GB), y la memoria RAM necesaria es inferior a 1 GB durante la inferencia.
- Para ejecución en otros dispositivos (CPU, GPU NVIDIA), se puede usar el modelo original `openai/whisper-base.en` con librerías como whisper.cpp, vLLM o TGI, pero este repositorio está pensado exclusivamente para ANEForge.
- La latencia de inferencia en ANE depende de la generación del chip, pero al ser un modelo de 72M parámetros se espera una transcripción de 30 segundos de audio en menos de 1 segundo en dispositivos recientes.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| aneforge/whisper-base.en | 72.6M | 30 s audio | inglés | Apache 2.0 | safetensors |
| openai/whisper-tiny.en | 39M | 30 s audio | inglés | Apache 2.0 | safetensors |
| openai/whisper-small.en | 244M | 30 s audio | inglés | Apache 2.0 | safetensors |

La comparativa se basa en el tamaño y la especialización en inglés. `whisper-base.en` ofrece un equilibrio entre precisión y velocidad, superior a `tiny.en` en exactitud y más rápido que `small.en`. Sin embargo, `small.en` tiene una mejor calidad de transcripción en entornos ruidosos, a costa de mayor consumo de recursos.

## Limitaciones y advertencias

- Solo transcribe en inglés: no es adecuado para otros idiomas, y su uso con audios no ingleses producirá transcripciones erróneas o vacías.
- Ventana de contexto limitada a 30 segundos: para audios más largos, se necesita segmentación manual o automática.
- Puede alucinar palabras o frases en segmentos de silencio o con ruido de fondo extremo, como todos los modelos Whisper.
- No se han realizado ajustes adicionales para este repositorio; las limitaciones del modelo original se mantienen íntegramente.
- La licencia Apache 2.0 permite uso comercial, pero es recomendable revisar los términos de OpenAI sobre el modelo original.
- ANEForge es una librería de terceros; este repositorio no es oficial de OpenAI ni de Apple.

## Enlaces

- HuggingFace: https://huggingface.co/aneforge/whisper-base.en
- Modelo original: https://huggingface.co/openai/whisper-base.en
- Repositorio ANEForge: https://github.com/sbryngelson/ANEForge
- Documentación ANEForge: https://aneforge.readthedocs.io
- Paper ANEForge: https://arxiv.org/abs/2606.17090
- Repositorio original de Whisper: https://github.com/openai/whisper
