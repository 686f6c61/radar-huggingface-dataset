# Reza2140/faster-whisper-small

## Resumen

Reza2140/faster-whisper-small es una conversión del modelo openai/whisper-small al formato de CTranslate2, publicada por el usuario Reza2140. No se trata de un modelo entrenado desde cero, sino de un artefacto de despliegue: los pesos originales de Whisper small se transforman con `ct2-transformers-converter` para poder ejecutarse con el motor de inferencia CTranslate2 y, por extensión, con la librería faster-whisper. El modelo resuelve el problema de transcripción automática de voz (ASR) con un coste computacional menor que la implementación original de OpenAI.

La relevancia de esta conversión es práctica: faster-whisper, la reimplementación basada en CTranslate2, es hasta 4 veces más rápida que openai/whisper con la misma precisión y un consumo de memoria inferior, según la documentación del proyecto. Esto permite desplegar ASR en hardware modesto, incluidas GPUs de consumo, manteniendo la cobertura multilingüe de Whisper small (más de 90 idiomas declarados en la model card).

El repositorio ocupa 0,5 GB y los pesos se guardan en FP16, aunque CTranslate2 permite cambiar el tipo de cómputo en tiempo de carga mediante la opción `compute_type`. La licencia es MIT, heredada del modelo original de OpenAI, lo que facilita su uso comercial sin restricciones adicionales más allá de las del propio Whisper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper small original), convertido a formato CTranslate2 |
| Parametros totales | no disponible en la informacion proporcionada (Whisper small original: aproximadamente 244 M, dato no confirmado en esta ficha) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | FP16 en los pesos publicados; CTranslate2 permite float32, int8, int8_float16 y otros mediante `compute_type` |
| Idiomas soportados | más de 90 idiomas, entre ellos en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su |
| Licencia | MIT |
| Formato de pesos | CTranslate2 (modelo binario del motor), con tokenizer.json incluido |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper small de OpenAI: un transformer encoder-decoder diseñado para ASR, con entrada de audio representada como espectrograma log-Mel y salida de tokens de texto. El modelo original fue entrenado por OpenAI sobre una gran colección de audio supervisado multilingüe y multitarea; los detalles exactos de composición del dataset y número de tokens no se incluyen en la información disponible de esta conversión.

Esta publicación no entrena ni ajusta el modelo: aplica `ct2-transformers-converter` sobre openai/whisper-small con `--quantization float16` y copia el `tokenizer.json`. La innovación técnica no está en el modelo sino en el formato de destino: CTranslate2 es un motor de inferencia optimizado para transformers que aplica técnicas como cuantización de pesos, fusión de operadores y gestión eficiente de memoria, lo que se traduce en la aceleración de hasta 4 veces documentada por faster-whisper frente a la implementación de referencia.

## Capacidades

- Transcripción automática de voz (ASR) en más de 90 idiomas, incluyendo español, inglés, chino, alemán, francés, árabe, hindi y muchos otros.
- Detección automática del idioma del audio y transcripción con marcas temporales por segmento (`segment.start`, `segment.end`).
- Traducción de voz a texto en inglés desde otros idiomas, capacidad heredada del modelo Whisper original.
- Procesamiento de audio en ventanas de 30 segundos con manejo de audio de mayor duración mediante segmentación interna.
- Ejecución en CPU y GPU a través de CTranslate2, con selección de tipo de cómputo en carga.
- Integración directa con la librería faster-whisper y con cualquier proyecto basado en CTranslate2.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo exclusivamente de ASR.

## Casos de uso

- Transcripción de reuniones y videoconferencias: el modelo convierte el audio en texto con marcas temporales, lo que permite generar actas, subtítulos sincronizados y resúmenes posteriores en pipelines de productividad.
- Generación de subtítulos para vídeo: los segmentos con inicio y fin facilitan la creación de ficheros SRT o VTT para plataformas de contenido, con cobertura multilingüe para audiencias internacionales.
- Atención al cliente basada en voz: transcripción de llamadas grabadas para su análisis, clasificación y archivo, ejecutable en CPU gracias al bajo coste de inferencia de la conversión a CTranslate2.
- Dictado y accesibilidad: integración en aplicaciones de escritorio o móviles que convierten voz en texto para usuarios con dificultades motoras, usando cuantización int8 para reducir requisitos de memoria.
- Indexación y búsqueda de archivos de audio: transcripción masiva de podcasts o archivos de audio para construir índices de búsqueda textual, aprovechando el rendimiento de faster-whisper en lotes.
- Investigación en lingüística y análisis de habla: transcripción de corpus multilingües con detección automática de idioma, útil para estudios comparativos entre las más de 90 lenguas soportadas.
- Prototipado rápido en entornos sin GPU: al poder ejecutarse en CPU con CTranslate2, sirve para validar flujos de ASR antes de escalar a infraestructura con aceleradores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentación de faster-whisper indica una aceleración de hasta 4 veces frente a openai/whisper con la misma precisión y menor uso de memoria, pero no se aportan cifras concretas de WER, MMLU ni otras métricas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 0,5 GB en FP16, por lo que la inferencia en GPU requiere un margen adicional para activaciones y buffers del motor.
- GPU recomendadas: cualquier GPU compatible con CTranslate2 (CUDA); para un modelo de este tamaño son suficientes GPUs de gama media, aunque no se especifican modelos concretos en la información disponible.
- Cabe en GPU de consumo: sí, por el tamaño reducido del modelo, aunque no se detallan modelos concretos ni cifras de VRAM medidas.
- Opciones de despliegue: CTranslate2 directamente, faster-whisper (Python, vía pip), y proyectos basados en CTranslate2. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles; la única referencia es la aceleración de hasta 4 veces de faster-whisper frente a openai/whisper documentada por el proyecto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Reza2140/faster-whisper-small | no disponible (Whisper small) | ventanas de 30 s de audio | MIT | CTranslate2 | Conversión comunitaria, 0 descargas, 0 likes |
| openai/whisper-small | aproximadamente 244 M (dato no confirmado en la ficha) | ventanas de 30 s de audio | MIT | safetensors / PyTorch | Modelo original de OpenAI; referencia de precisión |
| Conversiones oficiales de Systran (colección faster-whisper) | según variante (tiny a large) | ventanas de 30 s de audio | MIT | CTranslate2 | Conversiones mantenidas por Systran, con mayor adopción |

## Limitaciones y advertencias

- Es una conversión comunitaria sin descargas ni likes en el momento de la consulta; no hay evidencia de validación por parte de terceros ni de mantenimiento activo.
- El rendimiento real depende de la fidelidad de la conversión; no se publican métricas de WER que la verifiquen frente al modelo original.
- Whisper small es la variante intermedia de la familia: su precisión es inferior a la de medium y large, especialmente en audio con ruido, acentos marcados o idiomas de bajos recursos.
- Riesgo de alucinación en pasajes de silencio, música o ruido: Whisper puede generar texto inventado en segmentos sin habla clara.
- La cobertura de más de 90 idiomas no implica calidad homogénea; los idiomas con pocos datos de entrenamiento presentan tasas de error notablemente superiores.
- La licencia MIT permite uso comercial, pero conviene revisar las condiciones del modelo original de OpenAI y las limitaciones documentadas en su model card.
- El formato CTranslate2 no es compatible con ecosistemas como transformers, vLLM o llama.cpp; la integración requiere faster-whisper u otro cliente de CTranslate2.
- No dispone de capacidades de razonamiento, tool calling ni agentes; su uso está acotado a ASR y traducción de voz.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Reza2140/faster-whisper-small
- Modelo original: https://huggingface.co/openai/whisper-small
- Repositorio CTranslate2: https://github.com/OpenNMT/CTranslate2
- Repositorio faster-whisper: https://github.com/systran/faster-whisper
- Colección faster-whisper de Systran: https://huggingface.co/collections/Systran/faster-whisper
- Paquete faster-whisper en PyPI: https://pypi.org/project/faster-whisper/
- Documentación de cuantización de CTranslate2: https://opennmt.net/CTranslate2/quantization.html
