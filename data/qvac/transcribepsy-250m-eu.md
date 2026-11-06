# qvac/TranscribePsy-250M-EU

## Resumen

TranscribePsy-250M-EU es un modelo de reconocimiento automático del habla (ASR) multilingüe de 253,95 millones de parámetros, desarrollado por Tether AI Research (QVAC Psy) y publicado en Hugging Face bajo el identificador `qvac/TranscribePsy-250M-EU`. Se obtiene por destilación y poda estructurada del modelo profesor NVIDIA Parakeet-TDT-0.6B-v3 (627M), y está diseñado específicamente para inferencia en dispositivos de borde: portátiles y teléfonos móviles. Cubre 25 lenguas europeas, entre ellas el castellano, y se distribuye con licencia Apache 2.0.

El modelo emplea una arquitectura FastConformer con codificador de 24 capas y dimensión 640, junto con un decodificador de tipo transducer (TDT). Se entrenó sobre 564.102 horas de audio (117 millones de enunciados). Su relevancia actual radica en que ofrece una precisión que, según la model card, supera a modelos tres o cuatro veces mayores en benchmarks multilingües, manteniendo un coste computacional apto para CPU de teléfono y para el Neural Engine de Apple.

La familia TranscribePsy-250M incluye cuatro entregables: este checkpoint PyTorch (25 idiomas), una variante `EU-sub` restringida a los 8 idiomas de Multilingual LibriSpeech, y builds GGUF (Q8_0) y Core ML de esa variante para despliegue en CPU móvil y Apple Neural Engine respectivamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer (codificador, 24 capas, dim. 640) + decodificador transducer TDT |
| Parámetros totales | 253.954.838 (254,45M, incluye el diseño CAFE) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | float32 en el checkpoint PyTorch; build Q8_0 en la variante GGUF; build Core ML en la variante correspondiente |
| Idiomas soportados | 25: bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, ru, sk, sl, es, sv, uk |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint NeMo/PyTorch); GGUF y Core ML en las variantes derivadas |

## Arquitectura y entrenamiento

El modelo es un sistema ASR end-to-end con codificador FastConformer de 24 capas y dimensión oculta de 640, acoplado a un decodificador transducer TDT (Token-and-Duration Transducer). Se inicializa mediante poda estructurada del profesor Parakeet-TDT-0.6B-v3, de 627M de parámetros, seguida de un proceso de destilación. La model card menciona un diseño propio denominado CAFE, que según el autor mejora el compromiso entre el inglés y las otras 24 lenguas manteniendo estable el entrenamiento; los 254,45M de parámetros corresponden a 253,95M del modelo base más 0,50M atribuidos a ese componente.

El entrenamiento utilizó 564.102 horas de audio distribuidas en 117 millones de enunciados. No se detalla en la información disponible la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO (no procede en un modelo ASR). Tampoco se especifican innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Transcripción de voz a texto multilingüe en 25 lenguas europeas, incluido el castellano.
- Reconocimiento en modalidad streaming u offline según el motor de inferencia empleado (no se detalla en la información disponible).
- Ejecución en dispositivos de borde: CPU de teléfono (build GGUF con motor `qvac-fabric-speech.cpp`) y Apple Neural Engine (build Core ML).
- Rendimiento en tiempo real: factor de tiempo real de 0,052 en promedio sobre seis teléfonos con el build GGUF; 10 minutos de audio transcritos en 1,65 s en un iPhone 17 Pro Max con el build Core ML.
- Arranque en frío de 252 ms y pico de memoria de 534 MiB a ventanas de 10 s (build GGUF).
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio de entrada más allá del propio ASR, ni modo de razonamiento explícito.

## Casos de uso

- Subtitulado y transcripción en tiempo real en aplicaciones móviles: el modelo cabe en CPU de teléfono con 534 MiB de pico de memoria y un factor de tiempo real de 0,052, lo que permite generar subtítulos con holgura sobre el ritmo del habla.
- Asistentes de voz offline en dispositivos sin conectividad: al ejecutarse localmente en GGUF o Core ML, permite dictado y comandos de voz sin enviar audio a la nube, con implicaciones directas de privacidad.
- Transcripción de reuniones y notas de voz en portátil: con 1,02 GB en float32 y variantes cuantizadas, se puede integrar en aplicaciones de escritorio que procesen grabaciones de decenas de minutos en segundos.
- Indexación y búsqueda de archivos de audio corporativos: la cobertura de 25 lenguas europeas permite transcribir archivos multilingües con un único modelo, simplificando pipelines de archivado y búsqueda semántica.
- Accesibilidad para personas con discapacidad auditiva: subtitulado en directo de conversaciones presenciales en el propio dispositivo, sin depender de servicios externos.
- Procesamiento por lotes en servidores modestos: al ser un modelo de 254M, permite transcripciones de alto volumen en GPUs de gama media o incluso CPU, reduciendo el coste por hora de audio frente a modelos de mayor tamaño.
- Atención al cliente y centros de contacto: transcripción de llamadas en varias lenguas europeas para análisis de calidad y generación de resúmenes, con la ventaja de que el modelo puede desplegarse on-premise.

## Benchmarks y rendimiento

Resultados publicados en la model card (WER, menor es mejor):

| Suite de benchmark | Cobertura | TranscribePsy-250M-EU | Whisper-small (242M) | omniASR-CTC-300M-v2 (326M) | OWSM v4 small (370M) |
|---|---|---|---|---|---|
| Open ASR Leaderboard | Media de suites inglesa corta y multilingüe | 8,02 | 12,34 | 15,31 | 9,72 |
| Multilingual LibriSpeech | Media de 8 idiomas | 6,58 | 11,51 | 11,89 | 11,84 |
| Common Voice v25 | Media de 24 idiomas | 21,56 | 38,17 | 32,23 | 37,74 |

Comparación con modelos de mayor tamaño en Multilingual LibriSpeech (WER): TranscribePsy-250M-EU 6,58 frente a Qwen3-ASR-0.6B (782M) 12,60, omniASR-CTC-1B-v2 (976M) 7,71, Whisper-Medium (764M) 7,76 y OWSM-CTC-v4 (1,01B) 10,65. En Common Voice v25, TranscribePsy-250M-EU obtiene 21,56 y solo queda por detrás de omniASR-CTC-1B-v2 (20,07).

Rendimiento en dispositivo (build GGUF de la variante EU-sub, media sobre seis teléfonos): factor de tiempo real 0,052, pico de memoria 534 MiB a 10 s y arranque en frío de 252 ms. La latencia es 2,6 veces menor que la del siguiente modelo más rápido (omniASR-CTC-300M-v2), 5,7 veces menor que Whisper-small y entre 7,5 y 15 veces menor que los tres modelos de mayor tamaño evaluados. Con el build Core ML en el Neural Engine de un iPhone 17 Pro Max: 10 minutos de audio en 1,65 s, con menos de la mitad de espacio en disco y 1,7 veces menos memoria que otro modelo ASR Core ML.

## Requisitos de hardware

- Checkpoint PyTorch (float32): 1,02 GB en disco; VRAM estimada en torno a 1-2 GB para inferencia con lotes pequeños (estimación a partir del tamaño de pesos, no publicada por el autor).
- Build GGUF Q8_0: pico de 534 MiB de memoria a ventanas de 10 s en teléfonos; apto para CPU sin GPU.
- Build Core ML: ejecutable en Apple Neural Engine (procesadores Apple Silicon y A-series recientes).
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cualquier GPU consumer con 4 GB o más de VRAM debería ser suficiente para el checkpoint PyTorch.
- Despliegue: NeMo (formato nativo del checkpoint), motor `qvac-fabric-speech.cpp` para GGUF y Core ML para Apple. No se documenta soporte de vLLM, llama.cpp estándar, Ollama ni TGI en la información disponible.
- Latencia y throughput: ver sección de benchmarks (0,052 RTF en teléfonos; 1,65 s para 10 minutos de audio en iPhone 17 Pro Max).

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | WER MLS | WER Common Voice |
|---|---|---|---|---|---|
| TranscribePsy-250M-EU | 254M | 25 | Apache 2.0 | 6,58 | 21,56 |
| Whisper-small | 242M | multilingüe (no se detalla el número) | no disponible en la información | 11,51 | 38,17 |
| omniASR-CTC-300M-v2 | 326M | no disponible | no disponible | 11,89 | 32,23 |
| OWSM v4 small | 370M | no disponible | no disponible | 11,84 | 37,74 |
| Whisper-Medium | 764M | multilingüe | no disponible | 7,76 | no disponible en la tabla |
| omniASR-CTC-1B-v2 | 976M | no disponible | no disponible | 7,71 | 20,07 |

TranscribePsy-250M-EU es el de menor tamaño de la comparativa y obtiene el mejor WER en Multilingual LibriSpeech y en Open ASR Leaderboard; en Common Voice solo lo supera omniASR-CTC-1B-v2, con casi cuatro veces más parámetros.

## Limitaciones y advertencias

- No se documentan en la información disponible análisis de sesgos por idioma, acento o género.
- Riesgo de alucinación inherente a los sistemas ASR transducer: posibles sustituciones, omisiones o inserciones de palabras, especialmente en audio ruidoso o con acentos no representados en el entrenamiento.
- La cobertura se limita a 25 lenguas europeas; no se soportan otras lenguas ni se detalla el comportamiento en code-switching.
- La longitud de contexto de audio no está especificada; el rendimiento medido se refiere a ventanas de 10 s en el caso de los benchmarks en teléfono.
- El checkpoint publicado es float32; para despliegue en borde es necesario usar las variantes GGUF o Core ML, que cubren solo 8 idiomas (las de Multilingual LibriSpeech), no los 25.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo profesor (NVIDIA Parakeet-TDT-0.6B-v3) y de los datasets de entrenamiento, no detalladas en la información disponible.
- El autor atribuye el rendimiento a su propio motor (`qvac-fabric-speech.cpp`); la reproducibilidad con otros motores de inferencia no está documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qvac/TranscribePsy-250M-EU
- Variante EU-sub (PyTorch, 8 idiomas): https://huggingface.co/qvac/TranscribePsy-250M-EU-sub
- Variante EU-sub GGUF (Q8_0): https://huggingface.co/qvac/TranscribePsy-250M-EU-sub-gguf
- Variante EU-sub Core ML: https://huggingface.co/qvac/TranscribePsy-250M-EU-sub-coreml
- Modelo profesor: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Repositorio del motor de inferencia: https://github.com/tether-ai-research/qvac-transcribepsy
- Página de productos QVAC: https://qvac.tether.io/products/models
- Artículo de análisis: https://www.explainx.ai/blog/tether-transcribepsy-250m-on-device-speech-recognition-2026
- Referencia arXiv indicada en los tags: arxiv:2610.19134 (no verificada en la información disponible)
