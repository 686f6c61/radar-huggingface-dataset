# arankays/canary-1b-v2-fp16-ov

## Resumen

Canary-1B-v2 es un modelo de reconocimiento automático del habla (ASR) y traducción de voz desarrollado por NVIDIA, publicado originalmente en Hugging Face el 14 de agosto de 2025. La versión aquí descrita, `arankays/canary-1b-v2-fp16-ov`, es una exportación comunitaria del modelo base a formato OpenVINO IR con pesos en fp16, realizada por el usuario arankays para su uso en la herramienta vinoWhisper (subtítulos en vivo y dictado sobre CPU, GPU integrada y NPU de Intel).

Se trata de un modelo encoder-decoder basado en una arquitectura FastConformer, con aproximadamente 1.000 millones de parámetros (de ahí la denominación 1B), diseñado para transcripción multilingüe y traducción de voz a texto en 25 idiomas europeos. La exportación divide la red en dos grafos OpenVINO independientes (encoder y decoder) con formas fijas, orientados a una ventana de audio de 12 segundos.

La relevancia de esta ficha radica en que muestra un caso práctico de despliegue de un modelo ASR de NVIDIA en hardware Intel consumer mediante OpenVINO, con medidas de latencia reales y una alternativa int8 para NPU. Es una pieza útil para quienes necesitan transcripción local, sin dependencia de la nube, con licencia CC-BY-4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder FastConformer (exportado como dos grafos OpenVINO IR: encoder y decoder) |
| Parametros totales | aproximadamente 1.000 millones (modelo base canary-1b-v2) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana fija de 12 segundos de audio (1201 frames log-mel de 128 dimensiones); cache de decoder de 192 posiciones |
| Tipos de cuantizacion | fp16 (esta exportacion); int8 disponible en `arankays/canary-1b-v2-int8-ov` |
| Idiomas soportados | en, bg, hr, cs, da, nl, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, es, sv, ru, uk (25 idiomas) |
| Licencia | cc-by-4.0 |
| Formato de pesos | OpenVINO IR (`.xml` + `.bin`); tokenizer en `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo base Canary-1B-v2 es un encoder-decoder: un encoder FastConformer procesa las características log-mel y un decoder autorregresivo de 8 capas genera los tokens de transcripción o traducción. La exportación OpenVINO mantiene los pesos sin cambios salvo su almacenamiento en fp16, pero reestructura la red en dos grafo estáticos: el encoder recibe `feats` `[1, 1201, 128]` y `fmask` `[1, 1201]`, y emite las claves y valores de atención cruzada para cada una de las 8 capas del decoder; el decoder procesa un token por llamada con formas estáticas, sin estado interno, recibiendo `ids`, `pos`, `mask`, `cmask`, `past_k0..7`/`past_v0..7` y `cross_k0..7`/`cross_v0..7`, y devolviendo logits más las nuevas claves y valores que el orquestador escribe en una cache de 192 posiciones.

El proceso de exportación se realizó con el script `scripts/export_canary.py` del repositorio vinoWhisper, trazando ambos grafos desde `CanaryForConditionalGeneration` de `transformers` y verificando que el wrapper decodifica los mismos tokens que `generate()` con logits dentro de 1e-3 (medido 1e-4). El entorno de exportación fue transformers 5.22.2, torch 2.15.0+cpu, OpenVINO 2026.4.0 y nncf 3.4.0. No se dispone en la información proporcionada de detalles sobre el dataset de entrenamiento original, número de tokens, ni si hubo RLHF/DPO en el modelo base.

## Capacidades

- Reconocimiento automático del habla (transcripción) en 25 idiomas europeos.
- Traducción de voz a texto entre idiomas soportados (speech-translation).
- Puntuación y capitalización configurables mediante el prompt (`<|pnc|>`).
- Control de marcas de tiempo (`<|notimestamp|>` en el prompt por defecto).
- Control de diarización (`<|nodiarize|>` en el prompt por defecto).
- Emoción opcional mediante `<|emo:undefined|>` en el prompt.
- Inferencia sobre CPU, GPU integrada Intel Xe3 y NPU Intel (esta última recomendada con la variante int8).
- No soporta tool calling ni function calling (no es una capacidad de un modelo ASR).
- No soporta agentes ni razonamiento multi-step (no aplica).
- Capacidades multilingües limitadas a los 25 idiomas listados; no cubre idiomas fuera de ese conjunto.

## Casos de uso

- Subtítulos en vivo: el modelo procesa ventanas de 12 segundos con latencia de 0,71 s en iGPU Intel Xe3 y 1,65 s en CPU de 4 hilos, lo que permite generar subtítulos casi en tiempo real en un portátil sin GPU dedicada.
- Dictado por voz en aplicaciones de escritorio: la integración con vinoWhisper permite transcribir dictado localmente, sin enviar audio a servicios en la nube, útil en entornos con requisitos de privacidad.
- Transcripción de reuniones multilingües: al cubrir 25 idiomas europeos, puede transcribir conversaciones en las que participan hablantes de distintos idiomas y, con el prompt de traducción, verter el contenido a un idioma común.
- Generación de subtítulos para vídeo bajo demanda: la ventana fija de 12 segundos y el control de puntuación permiten producir archivos de subtítulos con segmentación predecible y capitalización correcta.
- Traducción de voz en atención al cliente: el modo speech-translation permite transcribir y traducir llamadas entrantes en un solo paso, reduciendo la dependencia de pipelines separados de ASR y traducción.
- Despliegue en hardware Intel sin GPU: la variante int8 (`arankays/canary-1b-v2-int8-ov`) está pensada para NPU Intel, con la mitad del tamaño y mayor velocidad que esta versión fp16.
- Investigación en ASR sobre OpenVINO: los grafos estáticos y el orquestador Python publicado facilitan experimentos reproducibles con formas fijas y comparación frente a `transformers`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (WER, MMLU, HumanEval, etc.) en la información disponible. Sí se recogen medidas de latencia del autor de la exportación, realizadas el 2026-11-06 en un Intel Core 5 320 con OpenVINO 2026.4.0, sobre un clip de verificación de 50 tokens y una ventana de 12 segundos:

| Plataforma | Latencia por ventana de 12 s | Tokens decodificados |
|---|---|---|
| CPU (4 hilos) | 1,65 s | Idénticos a `transformers` |
| iGPU Intel Xe3 | 0,71 s | Idénticos a `transformers` |
| NPU Intel | 0,75 s | Idénticos a `transformers` |

Estas cifras corresponden a una sola máquina y a n=1 por medida; no constituyen un benchmark representativo de WER ni de throughput sostenido.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 1,9 GB en fp16; en inferencia OpenVINO la memoria necesaria es del orden de esa cifra más overhead del runtime, aunque no se proporciona una medida exacta de VRAM/RAM pico.
- GPU recomendadas: no se especifican GPU dedicadas en la información; el autor reporta ejecución en iGPU Intel Xe3. Para GPU NVIDIA no hay datos de rendimiento en esta ficha.
- Cabe en GPU consumer: sí, por tamaño (1,9 GB en fp16); la variante int8 ocupa aproximadamente la mitad.
- Opciones de despliegue: OpenVINO Runtime con los grafos `encoder.xml`/`decoder.xml`; el orquestador de referencia es `vinowhisper/canary.py` de vinoWhisper, que incluye un port en numpy de la extracción de características mel. No es compatible directamente con `transformers` ni con OpenVINO GenAI; requiere un bucle de decodificación externo.
- Latencia y throughput estimados: 1,65 s por ventana de 12 s en CPU (4 hilos), 0,71 s en iGPU Xe3 y 0,75 s en NPU, según las medidas del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato/despliegue |
|---|---|---|---|---|---|
| arankays/canary-1b-v2-fp16-ov (esta ficha) | ~1.000 M | ventana fija de 12 s | 25 europeos | CC-BY-4.0 | OpenVINO IR fp16 |
| nvidia/canary-1b-v2 (modelo base) | ~1.000 M | no disponible en la información | 25 europeos | CC-BY-4.0 | safetensors / transformers |
| arankays/canary-1b-v2-int8-ov | ~1.000 M | ventana fija de 12 s | 25 europeos | CC-BY-4.0 | OpenVINO IR int8, orientado a NPU |

No se dispone en la información proporcionada de datos de rendimiento (WER) para comparar cualitativamente con alternativas como Whisper large-v3 u otros modelos ASR; esa comparación queda como no disponible.

## Limitaciones y advertencias

- Ventana fija de 12 segundos: el encoder está exportado para formas estáticas de 1201 frames; audio más largo requiere segmentación externa y audio más corto debe rellenarse.
- Trampa en la extracción de características: el extractor del modelo base marca `len(audio) // 160` frames como reales, uno menos de los que calcula (1200 de 1201 para 12 s); si no se pasa correctamente `fmask`, la salida del encoder se desvía y la decodificación empeora.
- No es un sustituto directo de `transformers` ni de OpenVINO GenAI: necesita un orquestador que gestione el bucle de decodificación y la cache de 192 posiciones.
- Cobertura lingüística limitada a 25 idiomas europeos; no soporta idiomas fuera de esa lista.
- Al ser una exportación comunitaria, no está afiliada ni respaldada por NVIDIA; la responsabilidad de validación recae en quien la despliega.
- Riesgo de alucinación inherente a los modelos ASR en audio con ruido, acentos no vistos o solapamiento de hablantes; no se documentan sesgos específicos en la información disponible.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario citar a NVIDIA y, en su caso, al autor de la exportación, y conservar el aviso de modificaciones.
- Las medidas de latencia provienen de una sola máquina y n=1; no deben extrapolarse a otros equipos sin validación propia.

## Enlaces

- Repositorio de esta exportación: https://huggingface.co/arankays/canary-1b-v2-fp16-ov
- Modelo base: https://huggingface.co/nvidia/canary-1b-v2
- Variante int8 para NPU: https://huggingface.co/arankays/canary-1b-v2-int8-ov
- Herramienta vinoWhisper: https://github.com/karanshukla/vinoWhisper
- Orquestador de decodificación: https://github.com/karanshukla/vinoWhisper/blob/main/vinowhisper/canary.py
- Script de exportación: https://github.com/karanshukla/vinoWhisper/blob/main/scripts/export_canary.py
- Documentación de medidas: https://github.com/karanshukla/vinoWhisper/blob/main/docs/models.md
- Documentación de Canary en transformers: https://huggingface.co/docs/transformers/v5.17.0/en/model_doc/canary
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
