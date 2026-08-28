# ldov/faster-whisper-small

## Resumen

Este repositorio contiene la conversión del modelo [openai/whisper-small](https://huggingface.co/openai/whisper-small) al formato CTranslate2, realizada por el usuario ldov. El modelo resultante está diseñado para usarse con la librería [faster-whisper](https://github.com/SYSTRAN/faster-whisper), una reimplementación de Whisper que aprovecha el motor de inferencia CTranslate2 para lograr una velocidad hasta 4 veces superior al original con el mismo nivel de precisión y un menor consumo de memoria.

La relevancia de esta conversión radica en que permite desplegar un sistema de reconocimiento automático del habla (ASR) multilingüe y robusto en hardware modesto, tanto en CPU como en GPU, con la posibilidad de aplicar cuantización adicional (INT8) para reducir aún más los requisitos de memoria. El modelo mantiene la arquitectura encoder-decoder de Whisper-small, con 244 millones de parámetros y una ventana de contexto de 30 segundos de audio, y soporta 99 idiomas.

Al ser una conversión directa de los pesos originales, no introduce cambios en la calidad de transcripción respecto al modelo de OpenAI, pero sí mejora sustancialmente la eficiencia de inferencia. Esto lo convierte en una opción práctica para aplicaciones de transcripción en tiempo real, subtitulado automático y procesamiento de audio en entornos con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper-small) |
| Parametros totales | 244 millones (modelo original) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio (ventana de entrada) |
| Tipos de cuantizacion | FP16 (por defecto), INT8, INT16, bfloat16 (según opción `compute_type` de CTranslate2) |
| Idiomas soportados | 99 idiomas (en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su) |
| Licencia | MIT |
| Formato de pesos | CTranslate2 (modelo convertido, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo es una conversión directa de los pesos de `openai/whisper-small` al formato CTranslate2. Whisper-small es un transformer encoder-decoder con 244 millones de parámetros, entrenado por OpenAI sobre 680 000 horas de audio supervisado y multilingüe. El encoder procesa los espectrogramas de mel de ventanas de 30 segundos y el decoder genera el texto transcrito, con capacidad de identificar el idioma automáticamente y de traducir al inglés.

La conversión se realizó con el comando `ct2-transformers-converter` y los pesos se guardaron en FP16, aunque CTranslate2 permite cambiar el tipo de cómputo en tiempo de carga (por ejemplo, INT8) sin necesidad de reconvertir el modelo. No hubo ningún proceso de entrenamiento o ajuste adicional; se trata únicamente de un cambio de formato para optimizar la inferencia.

## Capacidades

- Transcripción de audio a texto en 99 idiomas, con detección automática de idioma.
- Traducción de audio al inglés (tarea `translate`).
- Generación de marcas de tiempo (timestamps) a nivel de segmento y de palabra.
- Reconocimiento robusto frente a ruido de fondo, acentos y variaciones de habla, gracias al entrenamiento original de Whisper.
- Inferencia optimizada mediante CTranslate2, con soporte para cuantización INT8/INT16 y ejecución en CPU o GPU.
- Integración sencilla con la API de `faster-whisper` (carga del modelo, transcripción por streaming, etc.).
- No incluye capacidades de tool calling, agentes ni razonamiento multi-paso; es exclusivamente un modelo de ASR.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo puede procesar grabaciones largas en tiempo real o por lotes, generando texto con marcas de tiempo para facilitar la revisión. Su baja latencia permite su uso en aplicaciones de dictado en directo.
- Subtitulado automático de vídeos: al soportar 99 idiomas y generar timestamps, es adecuado para producir subtítulos en múltiples idiomas a partir de pistas de audio, tanto en plataformas de streaming como en edición de vídeo.
- Asistentes de voz y comandos por voz: gracias a su tamaño reducido y a la posibilidad de cuantizar a INT8, puede ejecutarse en dispositivos con recursos limitados (Raspberry Pi, portátiles antiguos) para reconocer comandos de voz en aplicaciones domésticas o industriales.
- Análisis de llamadas de atención al cliente: las empresas pueden transcribir llamadas para extraer métricas de calidad, detectar temas recurrentes o entrenar modelos de análisis de sentimiento, aprovechando el soporte multilingüe.
- Accesibilidad para personas con discapacidad auditiva: la transcripción en tiempo real puede integrarse en herramientas de subtitulado en vivo durante conferencias o clases, con una latencia lo suficientemente baja para mantener la sincronía.
- Archivado y búsqueda de contenido de audio: convertir archivos de audio (podcasts, programas de radio, archivos históricos) a texto permite indexarlos y hacer búsquedas por palabras clave, facilitando la recuperación de información.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

No obstante, la documentación de faster-whisper indica que esta implementación es hasta 4 veces más rápida que el Whisper original con la misma precisión, y que el uso de cuantización INT8 mejora aún más la eficiencia tanto en CPU como en GPU. No se proporcionan cifras concretas de WER o latencia para esta conversión específica.

## Requisitos de hardware

- El modelo tiene 244 millones de parámetros y un tamaño de repositorio de 0.5 GB (pesos en FP16). Esto lo hace adecuado para hardware de consumo.
- VRAM estimada para inferencia:
  - FP16: aproximadamente 0.5-1 GB de VRAM en GPU.
  - INT8: aproximadamente 0.25-0.5 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (p. ej., NVIDIA GTX 1050 Ti, RTX 2060, o integradas recientes). También funciona en CPU con un rendimiento aceptable, especialmente con cuantización INT8.
- Opciones de despliegue: la librería `faster-whisper` (Python) es la vía principal; también se puede integrar en proyectos que usen CTranslate2 directamente. No se distribuye en formato GGUF para llama.cpp ni en otros formatos de ejecución.
- Latencia y throughput: no se han publicado datos específicos para este modelo, pero en una GPU moderna (p. ej., RTX 3060) se espera una transcripción en tiempo real (factor de velocidad >1) incluso en FP16. En CPU con INT8, el rendimiento puede ser suficiente para transcripción por lotes de audio de corta duración.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ldov/faster-whisper-small | 244M | 30 s | 99 | MIT | CTranslate2 |
| openai/whisper-tiny | 39M | 30 s | 99 | MIT | PyTorch / safetensors |
| openai/whisper-base | 74M | 30 s | 99 | MIT | PyTorch / safetensors |
| openai/whisper-medium | 769M | 30 s | 99 | MIT | PyTorch / safetensors |

La conversión de ldov es funcionalmente equivalente a whisper-small en calidad de transcripción, pero se diferencia por su formato optimizado para CTranslate2, que reduce la latencia y el consumo de memoria. Whisper-tiny y whisper-base son más ligeros y rápidos, pero con menor precisión; whisper-medium ofrece mayor precisión a costa de más recursos. No se dispone de comparativas de rendimiento numéricas en la información proporcionada.

## Limitaciones y advertencias

- El modelo hereda los sesgos y errores del Whisper original, incluyendo posibles alucinaciones en segmentos de silencio o ruido, y una degradación notable en idiomas poco representados en el entrenamiento.
- La ventana de contexto está limitada a 30 segundos de audio; para audios más largos, faster-whisper los segmenta automáticamente, pero puede haber pérdida de contexto entre segmentos.
- No se ha verificado el rendimiento de esta conversión en todos los idiomas listados; algunos idiomas de baja representación pueden tener tasas de error elevadas.
- La licencia MIT permite uso comercial y modificación, pero es responsabilidad del usuario asegurarse de que el uso cumple con las normativas de privacidad y protección de datos (especialmente en aplicaciones de transcripción de conversaciones).
- El modelo no está diseñado para tareas de comprensión del lenguaje o generación de texto más allá de la transcripción; no soporta tool calling ni razonamiento avanzado.
- La conversión se realizó con cuantización FP16; si se necesita una precisión superior, se puede cargar con `compute_type="float32"`, pero aumentará el consumo de memoria y la latencia.

## Enlaces

- [HuggingFace: ldov/faster-whisper-small](https://huggingface.co/ldov/faster-whisper-small)
- [Modelo original: openai/whisper-small](https://huggingface.co/openai/whisper-small)
- [Repositorio de faster-whisper (SYSTRAN)](https://github.com/SYSTRAN/faster-whisper)
- [Documentación de CTranslate2](https://opennmt.net/CTranslate2/quantization.html)
- [faster-whisper en PyPI](https://pypi.org/project/faster-whisper/)
- [Sitio oficial de Faster Whisper](https://fasterwhisper.org/)
