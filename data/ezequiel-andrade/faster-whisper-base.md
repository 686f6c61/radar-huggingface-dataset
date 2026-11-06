# ezequiel-andrade/faster-whisper-base

## Resumen

faster-whisper-base es una conversión del modelo openai/whisper-base al formato de CTranslate2, publicada por el usuario ezequiel-andrade. No se trata de un modelo entrenado desde cero, sino de un artefacto de despliegue: el mismo Whisper base de OpenAI, con los pesos convertidos y cuantizados a FP16 para su uso con la librería CTranslate2 y con faster-whisper, una implementación de inferencia de Whisper optimizada para velocidad y menor consumo de memoria.

Whisper es un modelo de reconocimiento automático del habla (ASR) de arquitectura encoder-decoder transformer, entrenado por OpenAI sobre una gran cantidad de audio débilmente supervisado y multilingüe. La variante base es la segunda más pequeña de la familia (por encima de tiny), lo que la hace adecuada para transcripción en tiempo casi real en hardware modesto, a costa de una precisión inferior a las variantes medium o large.

La relevancia de esta ficha radica en que el repositorio no aporta mejoras de entrenamiento ni datos nuevos: su valor está en el formato CTranslate2, que permite ejecutar Whisper con menor huella de memoria y mayor throughput que la implementación original de PyTorch, y en la licencia MIT heredada del modelo original. Con solo 20 descargas y 0 likes en el momento de la consulta, es un artefacto de nicho, útil para quien quiera desplegar Whisper base con faster-whisper sin convertir los pesos por su cuenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), convertido a formato CTranslate2 |
| Parametros totales | no disponible (el modelo base de Whisper ronda los 74 millones, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 segundos por defecto; no es un contexto de texto) |
| Tipos de cuantizacion | FP16 en los pesos del repositorio; el tipo de computo se puede cambiar al cargar mediante la opcion `compute_type` de CTranslate2 (por ejemplo int8, int8_float16) |
| Idiomas soportados | 99 idiomas declarados en la model card, entre ellos en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su |
| Licencia | MIT |
| Formato de pesos | CTranslate2 (no safetensors ni GGUF); incluye tokenizer.json |

## Arquitectura y entrenamiento

El modelo subyacente es Whisper base de OpenAI, un transformer encoder-decoder diseñado para ASR multilingüe y traducción de voz. El encoder procesa espectrogramas mel de audio y el decoder genera tokens de texto de forma autorregresiva, con tokens especiales para idioma, tarea (transcripción o traducción) y marcas de tiempo. El entrenamiento original de Whisper se realizó sobre una gran colección de audio débilmente supervisado y multilingüe; los detalles exactos de composición del dataset y del número de horas no se recogen en la información proporcionada y deben consultarse en la model card de openai/whisper-base.

Esta publicación concreta no aporta entrenamiento adicional ni fine-tuning: es una conversión mecánica realizada con `ct2-transformers-converter --model openai/whisper-base --output_dir faster-whisper-base --copy_files tokenizer.json --quantization float16`. La innovación técnica es, por tanto, la del ecosistema CTranslate2 y faster-whisper: inferencia optimizada, soporte de cuantización en tiempo de carga, y la posibilidad de usar decodificación con beam search y VAD externo en la implementación faster-whisper. El repositorio ocupa aproximadamente 0,1 GB.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto) en 99 idiomas.
- Traducción de voz al inglés (tarea de traducción de Whisper, activable en la API de faster-whisper).
- Detección automática de idioma del audio.
- Generación de marcas de tiempo por segmento (`segment.start`, `segment.end`), útiles para subtitulado.
- Segmentación por VAD cuando se combina con la implementación faster-whisper.
- Ejecución con distintos tipos de computo (FP16, int8, int8_float16) mediante CTranslate2.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es exclusivamente un modelo de ASR.
- No tiene visión, audio generativo ni modo de pensamiento (thinking mode).

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo convierte audio en texto con marcas de tiempo, y su tamano base permite procesar horas de audio en CPU o en GPU modesta sin agotar memoria.
- Generación de subtítulos para vídeo: las marcas de tiempo por segmento se pueden exportar directamente a SRT o VTT en un pipeline de postproducción.
- Dictado y notas de voz: integración en aplicaciones de escritorio o móvil mediante faster-whisper, con cuantización int8 para reducir el consumo de memoria en dispositivos con recursos limitados.
- Indexación y búsqueda de contenido audiovisual: transcripción masiva de un catálogo de audio para alimentar un motor de búsqueda de texto completo.
- Atención al cliente basada en llamadas: transcripción de grabaciones de call center para análisis de calidad, con la ventaja de que el modelo es multilingüe y cubre los idiomas habituales de operaciones europeas.
- Investigación lingüística y corpus: transcripción de grabaciones de campo en cualquiera de los 99 idiomas declarados, con detección automática de idioma para corpus multilingües.
- Prototipado rápido de ASR: al ser un artefacto CTranslate2 listo para usar, permite validar un pipeline de transcripción sin convertir pesos ni montar dependencias de PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta en la información proporcionada; el repositorio pesa unos 0,1 GB en FP16 y el modelo es de tamano base, por lo que la huella es muy reducida en comparación con variantes medium o large.
- GPU recomendadas: al ser un modelo base, cabe con holgura en GPU consumer (RTX 3060, RTX 4090, etc.) y también en GPU de datacenter (A100, H100) si se prioriza throughput masivo.
- Cabe en GPU consumer: sí, con cualquier GPU con memoria suficiente para el modelo en FP16 o int8; el cuello de botella habitual es el procesado de audio, no la memoria.
- Despliegue: CTranslate2 directamente o faster-whisper (recomendado); la model card muestra el uso mediante `faster_whisper.WhisperModel`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| faster-whisper-base (este) | no disponible (base de Whisper) | ventanas de 30 s | 99 | MIT | CTranslate2 |
| openai/whisper-base | no disponible | ventanas de 30 s | 99 | MIT | PyTorch/safetensors |
| openai/whisper-small | mayor que base (dato no confirmado en la informacion) | ventanas de 30 s | 99 | MIT | PyTorch/safetensors |
| openai/whisper-large-v3 | mucho mayor que base (dato no confirmado en la informacion) | ventanas de 30 s | 99 | MIT | PyTorch/safetensors |

La comparación relevante es con el propio openai/whisper-base: mismo modelo, distinto formato de despliegue. faster-whisper-base ofrece la misma calidad de transcripción que el original, con la ventaja de menor huella de memoria y mayor velocidad de inferencia gracias a CTranslate2. Las variantes small y large-v3 mejoran la precisión a costa de más parámetros y más memoria.

## Limitaciones y advertencias

- Es una conversión, no un modelo nuevo: la calidad de transcripción es exactamente la de openai/whisper-base, que es inferior a las variantes medium y large, especialmente en audio con ruido, acentos marcados o solapamiento de hablantes.
- Riesgo de alucinación: los modelos Whisper pueden generar texto plausible en segmentos de silencio o ruido; conviene combinar con VAD y revisar las salidas en producción.
- Sesgos: hereda los sesgos del entrenamiento original de Whisper, que no se documentan en la información proporcionada; se recomienda consultar la model card de openai/whisper-base.
- Limitaciones de idioma: aunque declara 99 idiomas, el rendimiento varía mucho entre ellos; los idiomas con menos datos de entrenamiento suelen tener mayor tasa de error.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo original y de CTranslate2/faster-whisper en cada despliegue.
- Advertencia de producción: el repositorio tiene muy pocas descargas y ningún like, y fue creado y actualizado el mismo día; no hay evidencia de validación por parte de la comunidad. Para producción es preferible convertir los pesos uno mismo o usar los artefactos oficiales de faster-whisper.
- No es un modelo de lenguaje: no sirve para generación de texto, razonamiento, código ni agentes.

## Enlaces

- Hugging Face: https://huggingface.co/ezequiel-andrade/faster-whisper-base
- Modelo original: https://huggingface.co/openai/whisper-base
- CTranslate2: https://github.com/OpenNMT/CTranslate2
- faster-whisper: https://github.com/systran/faster-whisper
- Documentación de cuantización de CTranslate2: https://opennmt.net/CTranslate2/quantization.html
