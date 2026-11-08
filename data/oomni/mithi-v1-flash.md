# Oomni/mithi-v1-flash

## Resumen

Mithi v1 Flash es un modelo de texto a voz (TTS) desarrollado por Oomni, orientado a la síntesis de habla natural en 11 idiomas de la India y en inglés. Se distribuye como un modelo compacto de 99,1 millones de parámetros (197 MB en pesos bf16), lo que lo sitúa en la categoría de modelos ligeros capaces de ejecutarse tanto en GPU como en CPU, incluyendo dispositivos de bajas prestaciones como una Raspberry Pi. Su pipeline declarado en Hugging Face es text-to-speech y su licencia es Apache 2.0.

El modelo ofrece dos voces predefinidas, Satvik (masculina) y Charvi (femenina), y genera audio mono a 24 kHz. Cubre hindi, inglés, bengalí, gujarati, kannada, malayalam, marathi, odia, punyabí, tamil y telugu, lo que lo convierte en una opción relevante para aplicaciones de accesibilidad, asistentes de voz y localización de contenidos en el mercado indio, un segmento tradicionalmente mal cubierto por los modelos TTS multilingües de gran tamano.

La relevancia actual del modelo radica en su relación tamano/capacidad: con menos de 100 millones de parámetros cubre once idiomas y mantiene un rendimiento usable en CPU (aproximadamente 3 segundos por frase de 15 palabras con 4 hilos en un AMD EPYC 9554). No se han publicado datos sobre la arquitectura interna ni sobre el proceso de entrenamiento en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como "kokoro" en los tags) |
| Parametros totales | 99,1 M (197 MB en bf16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa el texto frase a frase) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | hi, en, bn, gu, kn, ml, mr, or, pa, ta, te |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la documentación proporcionada. Los tags de Hugging Face incluyen la etiqueta "kokoro", lo que sugiere una relación con la familia de modelos TTS Kokoro, pero no se confirma ni se detalla en la model card. El modelo se distribuye en formato safetensors con pesos en bf16 y un total de 99,1 millones de parámetros.

Respecto al entrenamiento, la model card indica que las voces Satvik y Charvi se entrenaron con habla generada mediante inferencia de Maya2-native, un modelo de la organización maya-research. No se especifica el número de tokens, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. El modelo incluye un normalizador de texto que expande números, horas y divisas a palabras, y procesa automáticamente textos largos frase a frase.

## Capacidades

- Síntesis de voz (text-to-speech) en 11 idiomas: hindi, inglés, bengalí, gujarati, kannada, malayalam, marathi, odia, punyabí, tamil y telugu.
- Dos voces predefinidas: Satvik (masculina) y Charvi (femenina).
- Generación de audio mono a 24 kHz en formato WAV.
- Normalización de texto integrada: expansión de números, horas y divisas a palabras antes de la síntesis.
- Procesamiento automático de textos largos, dividiéndolos en frases.
- Inferencia en GPU y en CPU, con control del número de hilos mediante `--threads` o `torch.set_num_threads`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo de pensamiento; es un modelo exclusivamente de texto a voz.

## Casos de uso

- Asistentes de voz para el mercado indio: el modelo permite generar respuestas habladas en la lengua del usuario (hindi, tamil, bengalí, etc.) con una latencia baja en CPU, lo que facilita su integración en dispositivos de bajo coste o entornos sin GPU.
- Audiolibros y lectura de contenidos: gracias al procesamiento frase a frase y a la normalización de números y horas, puede narrar artículos, noticias o documentos largos de forma automática en cualquiera de los 11 idiomas soportados.
- Localización de contenidos multimedia: sustitución de voces en vídeos o pódcast para versiones en lenguas regionales de la India, usando las voces Satvik o Charvi según el registro deseado.
- Sistemas de atención al cliente telefónica: generación de mensajes de confirmación, recordatorios de citas o avisos de pedidos (la model card incluye ejemplos de este tipo en kannada e inglés) en un servidor sin GPU.
- Accesibilidad para personas con discapacidad visual: lectura en voz alta de textos en pantalla en idiomas regionales, ejecutable en dispositivos como Raspberry Pi.
- Prototipado y demostraciones: al ocupar solo 197 MB y ejecutarse en CPU con 4 hilos en unos 3 segundos por frase, es adecuado para entornos de desarrollo, notebooks y pruebas de concepto sin infraestructura dedicada.
- Educación y aprendizaje de idiomas: generación de ejemplos de pronunciación en once lenguas con dos timbres distintos, útil para aplicaciones de autoaprendizaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye una medición de velocidad de inferencia en CPU (AMD EPYC 9554) para una frase media de 15 palabras (unos 7 segundos de habla):

| Hilos de CPU | Tiempo por frase |
|---|---|
| 1 | ~8 s |
| 4 | ~3 s |

No se proporcionan métricas de calidad como MOS, WER ni comparaciones objetivas con otros modelos TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 99,1 M de parámetros en bf16 (197 MB), el modelo cabe holgadamente en cualquier GPU con al menos 1 GB de memoria libre, aunque no se especifica una cifra oficial.
- GPU recomendadas: no se indica ninguna en concreto; cualquier GPU moderna con soporte para bf16 es suficiente. El modelo detecta y usa GPU si está disponible.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU de consumo actual (por ejemplo, series RTX 30/40) e incluso en iGPU, dado su reducido tamano.
- Despliegue en CPU: soportado de forma nativa; la model card cita laptops, Raspberry Pi, teléfonos y servidores sin GPU. Se controla el número de hilos con `--threads` o `torch.set_num_threads`.
- Opciones de despliegue: el paquete incluye `inference.py` y el módulo Python `mithi_tts` (clase `Mithi`), con dependencias instalables vía `requirements.txt` y `espeakng-loader` (que incluye espeak-ng sin instalación del sistema). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: en CPU AMD EPYC 9554, ~8 s por frase con 1 hilo y ~3 s con 4 hilos para una frase de 15 palabras (~7 s de audio). No se proporcionan datos de latencia en GPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La model card menciona Maya2-native como generador del habla de entrenamiento, pero no como alternativa TTS equivalente, y no se ofrecen datos de rendimiento de terceros. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Solo dispone de dos voces (Satvik y Charvi); no se documenta clonación de voz ni control de estilo, emoción o prosodia.
- No se han publicado evaluaciones objetivas de calidad (MOS, WER) ni análisis de sesgos; se desconoce el comportamiento en acentos regionales, habla coloquial o ruido.
- Riesgo de alucinación no aplicable en el sentido de generación de texto, pero sí de errores de pronunciación o entonación en palabras fuera del dominio de entrenamiento; no se documenta su magnitud.
- El rendimiento en CPU es limitado: ~8 s por frase con un solo hilo, lo que puede ser insuficiente para aplicaciones de conversación en tiempo real en hardware modesto.
- No se detalla la composición del dataset de entrenamiento ni posibles sesgos de género, dialecto o registro asociados a las dos voces.
- Aunque la licencia es Apache 2.0 y permite uso comercial, no se documentan restricciones adicionales ni garantías por parte del autor; conviene verificar los términos del repositorio antes de un despliegue en producción.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; se trata de un lanzamiento muy reciente sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Oomni/mithi-v1-flash
- Maya2-native (generador del habla de entrenamiento): https://huggingface.co/maya-research/maya2-native
- Banner del modelo: https://huggingface.co/Oomni/mithi-v1-flash/resolve/main/assets/mithi_banner.png
