# openai/whisper-large-v3-turbo

## Resumen

Whisper large-v3-turbo es un modelo de reconocimiento automático del habla (ASR) y traducción de voz desarrollado por OpenAI, publicado en octubre de 2024. Se trata de una versión podada y afinada de Whisper large-v3: el número de capas del decodificador se reduce de 32 a 4, lo que acelera significativamente la inferencia a costa de una degradación menor en la precisión. El modelo fue entrenado con más de 5 millones de horas de datos etiquetados, lo que le permite generalizar a múltiples dominios y idiomas en modo zero-shot. Está disponible en Hugging Face con licencia MIT y pesos en formato safetensors, y es compatible con la biblioteca Transformers de Hugging Face.

Con 808,8 millones de parámetros, este modelo se posiciona como una opción equilibrada entre velocidad y calidad para tareas de transcripción y traducción de audio, especialmente en entornos donde el rendimiento en tiempo real es crítico. Su soporte para más de 90 idiomas y la capacidad de generar marcas de tiempo a nivel de frase o palabra lo hacen adecuado para aplicaciones de subtitulado, análisis de voz y asistentes conversacionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) con decodificador podado (4 capas) |
| Parametros totales | 808.878.080 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo procesa ventanas de audio de 30 segundos, pero no se especifica en la documentación proporcionada) |
| Tipos de cuantizacion | no disponible (el repositorio contiene safetensors; no se mencionan versiones cuantizadas) |
| Idiomas soportados | 99 idiomas (en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Whisper large-v3-turbo mantiene la arquitectura original de Whisper, un transformer encoder-decoder entrenado con aprendizaje supervisado a gran escala. La innovación clave es la poda del decodificador: se reducen las capas de 32 a 4, manteniendo el encoder completo. Esto reduce el coste computacional durante la generación, que es el cuello de botella típico en tareas de ASR. El modelo se ajustó (fine-tuning) a partir de Whisper large-v3, como se indica en la discusión de GitHub de OpenAI. El entrenamiento original de Whisper utilizó más de 5 millones de horas de audio etiquetado, con una estrategia de debil supervisión que permite generalizar a dominios y idiomas no vistos. No se mencionan técnicas adicionales como RLHF o DPO en la información disponible.

## Capacidades

- Transcripción de voz a texto en 99 idiomas, con detección automática del idioma de origen.
- Traducción de voz a texto en inglés (tarea "translate"), útil para transcribir audio en cualquier idioma y obtener la traducción al inglés.
- Generación de marcas de tiempo a nivel de frase o de palabra.
- Soporte para audios de longitud arbitraria mediante el pipeline de Transformers, que segmenta el audio en ventanas de 30 segundos.
- Compatible con estrategias de decodificación avanzadas: temperature fallback, condición sobre tokens previos, umbrales de compresión y de no-voz.
- Integración con la biblioteca Transformers de Hugging Face, lo que permite usar el pipeline `automatic-speech-recognition` y el API de modelo + procesador para control fino.
- Capacidad de procesamiento por lotes (batch) para múltiples archivos de audio.

## Casos de uso

- Subtitulado automático de vídeos: el modelo puede transcribir pistas de audio y generar marcas de tiempo por frase, lo que facilita la creación de subtítulos para plataformas como YouTube o redes sociales.
- Transcripción de reuniones y entrevistas: su velocidad permite transcribir conversaciones en tiempo real o casi real, con buena precisión en varios idiomas.
- Traducción de contenido audiovisual: al activar la tarea "translate", se puede obtener una transcripción en inglés de audio en otros idiomas, útil para localización de contenidos.
- Asistentes de voz y comandos por voz: la baja latencia del modelo lo hace adecuado para integrarse en sistemas de reconocimiento de voz embebidos o en la nube.
- Análisis de llamadas de atención al cliente: transcripción de llamadas para extraer información, evaluar la calidad del servicio o generar resúmenes automáticos.
- Accesibilidad: generación de transcripciones en tiempo real para personas con discapacidad auditiva, con soporte multilingüe.
- Archivado y búsqueda de audio: convertir archivos de audio históricos en texto indexable para búsquedas y análisis posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que la calidad es ligeramente inferior a la de Whisper large-v3, pero no proporciona cifras concretas. Se recomienda consultar la discusión de GitHub de OpenAI para detalles adicionales sobre el rendimiento relativo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Dado el tamaño de 809M parámetros, una estimación típica sería ~1,6 GB en FP16 y ~0,8 GB en INT8, pero estos valores no están confirmados oficialmente.
- GPU recomendadas: no disponible. El modelo puede ejecutarse en GPUs de consumo como RTX 3060 o superiores, pero no hay especificación oficial.
- Compatibilidad con GPUs de consumo: probablemente sí, dado su tamaño moderado, pero no se confirma en la documentación.
- Opciones de despliegue: compatible con Transformers, y por extensión con vLLM, llama.cpp, Ollama y TGI, aunque no se mencionan explícitamente en la información.
- Latencia y throughput: no disponible. La poda del decodificador sugiere una mejora significativa respecto a large-v3, pero no se ofrecen cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| whisper-large-v3-turbo | 809M | no disponible | MIT | Versión podada de large-v3, 4 capas de decodificador, más rápido con leve pérdida de calidad |
| whisper-large-v3 | 1.55B (aprox.) | no disponible | MIT | Modelo base, 32 capas de decodificador, mayor precisión pero más lento |
| whisper-large-v2 | 1.55B (aprox.) | no disponible | MIT | Versión anterior, similar a large-v3 pero con menos idiomas y ligeramente inferior en precisión |

No se dispone de datos de rendimiento comparativo en la información proporcionada. La comparación se basa en las características arquitectónicas declaradas.

## Limitaciones y advertencias

- La poda del decodificador introduce una degradación menor en la precisión en comparación con whisper-large-v3, especialmente en idiomas o acentos poco representados.
- El modelo puede presentar errores en entornos con mucho ruido de fondo, solapamiento de hablantes o audio de baja calidad, como es común en los modelos Whisper.
- No se especifican sesgos concretos, pero al entrenarse con datos de Internet, puede reflejar sesgos de género, dialecto o dominio presentes en los datos.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir texto incorrecto o inventado cuando el audio es ambiguo o ininteligible.
- La licencia MIT permite uso comercial sin restricciones, pero se recomienda revisar los términos de uso de OpenAI para el modelo base.
- El soporte para 99 idiomas no garantiza la misma calidad en todos ellos; los idiomas con menos datos de entrenamiento pueden tener un rendimiento inferior.

## Enlaces

- [Hugging Face - openai/whisper-large-v3-turbo](https://huggingface.co/openai/whisper-large-v3-turbo)
- [Paper original de Whisper (arXiv:2212.04356)](https://huggingface.co/papers/2212.04356)
- [Discusión de GitHub sobre el modelo turbo](https://github.com/openai/whisper/discussions/2363)
- [Repositorio oficial de Whisper en GitHub](https://github.com/openai/whisper)
- [Artículo de Medium sobre Whisper Large V3 Turbo](https://medium.com/axinc-ai/whisper-large-v3-turbo-high-accuracy-and-fast-speech-recognition-model-be2f6af77bdc)
