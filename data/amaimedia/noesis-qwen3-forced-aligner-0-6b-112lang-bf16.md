# AMAImedia/NOESIS-Qwen3-Forced-Aligner-0.6B-112LANG-BF16

## Resumen

NOESIS-Qwen3-Forced-Aligner-0.6B-112LANG-BF16 es un modelo de alineación forzada de audio y texto (forced alignment) desarrollado por AMAImedia como parte de su plataforma profesional de doblaje multilingüe NOESIS. Se basa en el modelo Qwen3-ForcedAligner-0.6B de Alibaba, que originalmente soportaba 11 lenguas, y lo extiende mediante entrenamiento unificado a 112 lenguas. El modelo predice marcas temporales a nivel de palabra o carácter para segmentos de habla de hasta 5 minutos, lo que lo convierte en una herramienta clave para subtitulado, doblaje y sincronización audiovisual.

El modelo es no autorregresivo (NAR) y pertenece a la familia Qwen3-ASR. Con aproximadamente 918 millones de parámetros y pesos en BF16, ocupa unos 1,8 GB. Se distribuye bajo licencia Apache 2.0 y se integra mediante la librería `qwen-asr` con la misma API que el modelo base, lo que lo hace un reemplazo directo de este último. Su relevancia actual radica en ampliar la cobertura lingüística de la alineación forzada a más de un centenar de idiomas, incluidos muchos de bajos recursos, sin necesidad de modelos adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer no autorregresivo para alineación forzada (familia Qwen3-ASR) |
| Parametros totales | 917.728.896 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 5 minutos de audio (no especificado en tokens) |
| Tipos de cuantizacion | BF16 (pesos originales); no se han publicado cuantizaciones alternativas |
| Idiomas soportados | 112 (incluye af, am, ar, as, ast, az, be, bg, bn, bs, ca, ceb, ckb, cs, cy, da, de, el, en, es, et, eu, fa, ff, fi, fil, fr, ga, gl, gn, gu, ha, he, hi, hr, hu, hy, id, ig, is, it, ja, jv, ka, kam, kea, kk, km, kmr, kn, ko, ky, lb, lg, ln, lo, lt, luo, lv, mi, mk, ml, mn, mr, ms, mt, mvy, my, ne, nl, no, nso, ny, oc, om, or, pa, pl, ps, pt, qxp, ro, ru, rw, sd, sk, skr, sl, sn, so, sr, sv, sw, ta, te, tg, th, ti, tk, tr, ug, uk, umb, ur, uz, vi, wo, xh, yo, yue, zh, zu) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3-ForcedAligner-0.6B de Alibaba, un modelo de alineación forzada no autorregresivo diseñado para predecir marcas temporales de unidades arbitrarias (palabras, caracteres) dentro de segmentos de hasta 5 minutos de habla. No se dispone de detalles públicos sobre el número de capas, dimensiones de atención o configuración interna exacta; la información disponible lo describe como parte de la familia Qwen3-ASR, que combina un codificador de audio con un decodificador de texto para tareas de reconocimiento y alineación.

El entrenamiento de esta variante NOESIS se realizó sobre el modelo base de 11 lenguas, extendiéndolo a 112 mediante una única pasada de entrenamiento (v6, "Unified"). Se usaron 239 429 elementos de entrenamiento con 532,1 horas de datos de verdad fundamental, un muestreador estratificado por lengua y una ponderación de pérdida que combina etiquetas reales (peso 1,0), pseudoetiquetas propias (0,7) y etiquetas de MMS (0,5). El ajuste fino empleó LoRA con r=32 y alpha=64, base NF4 con cómputo en BF16, durante 7482 pasos (1 época) y una pérdida final de 0,55. El entrenamiento se ejecutó en una GPU RTX 3060 Laptop de 6 GB durante 27 horas y 23 minutos, lo que demuestra la viabilidad del ajuste en hardware de consumo.

## Capacidades

- Alineación forzada de texto y audio con predicción de marcas temporales a nivel de palabra o carácter.
- Soporte para 112 idiomas y dialectos, incluyendo lenguas de bajos recursos como mvy, qxp, umb o kam.
- Manejo de segmentos de audio de hasta 5 minutos de duración.
- Inferencia no autorregresiva, lo que permite una generación de timestamps más rápida que los métodos autorregresivos.
- Integración con la librería `qwen-asr` mediante la API `Qwen3ForcedAligner.from_pretrained(...)`, compatible con el modelo base.
- Diseñado para tareas de doblaje, subtitulado y sincronización audiovisual, con salida directa de timestamps alineados.

## Casos de uso

- Subtitulado automático multilingüe: el modelo genera timestamps precisos para cada palabra o carácter, lo que permite crear subtítulos sincronizados en 112 idiomas sin necesidad de herramientas externas de alineación.
- Doblaje profesional: en la plataforma NOESIS, se usa como generador de timestamps para reemplazar diálogos originales con pistas de voz traducidas, manteniendo la sincronización labial.
- Subtítulos estilo karaoke: la salida a nivel de palabra permite resaltar la sílaba o palabra activa en tiempo real, ideal para vídeos musicales o educativos.
- Análisis fonético y lingüístico: investigadores pueden usar los timestamps para estudiar la duración de fonemas o palabras en corpus multilingües, especialmente en lenguas con poca representación.
- Verificación de calidad de ASR: al comparar las marcas temporales predichas con transcripciones existentes, se puede detectar desalineaciones en sistemas de reconocimiento de voz.
- Generación de datos de entrenamiento: los timestamps generados pueden usarse para crear conjuntos de datos etiquetados para otros modelos de audio, como sistemas de text-to-speech o de separación de hablantes.
- Archivado y búsqueda en vídeo: indexar vídeos por palabras habladas con sus tiempos exactos facilita la búsqueda y recuperación de fragmentos concretos en bibliotecas audiovisuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) para este modelo, ya que no es un modelo de lenguaje general sino de alineación forzada. La evaluación incluida en la documentación es una prueba interna con métricas de orden de timestamps (bad_order) y veredictos de escucha humana sobre los 112 idiomas. Los resultados muestran que 44 lenguas tienen un 0% de bad_order estricto (TIER A), 20 lenguas entre 1-10% (TIER B), 23 lenguas entre 10-25% (TIER C) y 14 lenguas con más del 25% (TIER D). La evaluación humana concluye que la calidad percibida es sustancialmente mejor que lo que sugiere la métrica estricta, especialmente en lenguas de escritura compleja. Por ejemplo, en telugu (te) el bad_order estricto es del 42,3% pero la alineación percibida correcta se estima entre 60-80%; en georgiano (ka) es del 41,2% con ~90% percibido; y en lao (lo) del 46,7% con 50-60% percibido, lo que requiere post-procesamiento para producción.

## Requisitos de hardware

- Inferencia en GPU de consumo: el modelo tiene ~918M parámetros en BF16 (~1,8 GB), por lo que cabe en GPUs con 4-6 GB de VRAM. El entrenamiento se realizó en una RTX 3060 Laptop de 6 GB, lo que indica que la inferencia es viable en hardware similar.
- GPU recomendadas: RTX 3060, RTX 4060, RTX 4090, o cualquier GPU con al menos 4 GB de VRAM. También es posible ejecutarlo en CPU con suficiente RAM, aunque con mayor latencia.
- Opciones de despliegue: la librería `qwen-asr` es el método principal, compatible con `transformers.Trainer` y pipelines personalizados. No se mencionan integraciones con vLLM, llama.cpp u Ollama, dado que no es un LLM generativo.
- Latencia y throughput: no se han publicado cifras concretas. Al ser no autorregresivo, se espera una generación de timestamps más rápida que los modelos autorregresivos, pero depende del hardware y de la longitud del audio.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto de audio | Licencia | Notas |
|---|---|---|---|---|---|
| NOESIS-Qwen3-ForcedAligner-0.6B (este) | 918M | 112 | Hasta 5 min | Apache 2.0 | Extensión del modelo base con entrenamiento unificado |
| Qwen/Qwen3-ForcedAligner-0.6B (base) | ~918M | 11 (zh, en, yue, fr, de, it, ja, ko, pt, ru, es) | Hasta 5 min | Apache 2.0 | Modelo original de Alibaba, no autorregresivo |
| WhisperX (por comparación) | Variable (74M-1.5B) | ~99 | Variable (hasta 30 s por segmento) | MIT | Alineación forzada basada en Whisper, requiere modelo adicional para timestamps |

La comparativa se basa en información pública; no se dispone de benchmarks comparativos directos entre estos modelos. El modelo NOESIS amplía significativamente la cobertura lingüística del base de Qwen, mientras que WhisperX es un enfoque diferente que combina ASR con un modelo de alineación fonética.

## Limitaciones y advertencias

- La métrica estricta de bad_order es excesivamente pesimista en lenguas de escritura compleja; aunque la calidad percibida es mejor, en lenguas como lao (lo) o telugu (te) puede ser necesario un post-procesamiento para producción.
- El modelo solo cubre segmentos de audio de hasta 5 minutos; para audios más largos se requiere segmentación previa.
- No se han publicado cuantizaciones alternativas (GGUF, INT8, etc.); el uso en entornos con poca memoria puede requerir conversión manual.
- La documentación no detalla los datos de entrenamiento para las lenguas añadidas; algunas lenguas de bajos recursos pueden tener una calidad inferior.
- El modelo está pensado para alineación forzada, no para reconocimiento de voz general; para transcripción se necesitaría un modelo ASR complementario.
- Aunque la licencia es Apache 2.0, el uso comercial debe verificar que no infringe patentes o derechos de terceros relacionados con los datos de entrenamiento.
- No se han publicado resultados de benchmarks independientes; la evaluación es interna y puede no ser reproducible sin acceso a los datos de prueba.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AMAImedia/NOESIS-Qwen3-Forced-Aligner-0.6B-112LANG-BF16
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3-ForcedAligner-0.6B
- Paper técnico de Qwen3-ASR (arXiv 2601.21337): https://arxiv.org/html/2601.21337v1
- Anuncio de la familia Qwen3-ASR: https://rits.shanghai.nyu.edu/ai/%F0%9F%93%A2-major-announcement-qwen3%E2%80%91asr-qwen3%E2%80%91forcedaligner-open-sourced/
- Sitio de AMAImedia: https://www.amaimedia.com
