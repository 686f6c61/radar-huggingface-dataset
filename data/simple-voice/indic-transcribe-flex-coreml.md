# simple-voice/indic-transcribe-flex-coreml

## Resumen

Indic-Transcribe-Flex Core ML int4 es una conversión a Core ML del modelo de reconocimiento automático de voz `bodhan-ai/indic-transcribe-flex`, desarrollado por Bodhan AI en colaboración con AI4Bharat. El modelo original es un fine-tune de NVIDIA Canary-1B-v2 (arquitectura encoder-decoder de tipo transformer, 1.000 millones de parámetros) orientado a 27 lenguas del subcontinente indio, con la particularidad de ofrecer salida en escritura nativa, escritura mixta o romanizada, seleccionable mediante un token de prompt. Esta versión concreta, publicada por simple-voice, empaqueta los pesos en formato Core ML con cuantización int4 para su ejecución en Apple Silicon (CPU y Neural Engine), integrándose en el gestor `CanaryManager` de FluidAudio.

La relevancia de esta ficha radica en que traslada un modelo ASR de 1B parámetros al ecosistema Apple con un tamaño total de 698 MB, lo que permite transcripción local en dispositivos macOS e iOS sin depender de servicios en la nube. El modelo está pensado para el caso de uso Hindi/Hinglish, donde es el modelo por defecto de la aplicación Simple Voice bajo la etiqueta "Indic (Hinglish)". La validación incluida compara la decodificación greedy en Core ML int4 frente a la implementación PyTorch de NeMo, con un CER medio de 0,0057 sobre clips de prueba.

La licencia es la Indic Open Model License v1.0, con cláusula de share-alike y un tope de uso comercial (500 millones de usuarios activos mensuales o 250 millones de dólares de ingresos anuales). El modelo base Canary-1B-v2 se distribuye bajo CC BY 4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer (derivado de NVIDIA Canary-1B-v2) |
| Parametros totales | 1.000 millones (modelo base Canary-1B-v2) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventana de audio de 15 s (240.000 muestras a 16 kHz); 256 pasos de decodificador |
| Tipos de cuantizacion | int4 por bloque de 32, simetrica (encoder y decoder); fp16 en proyeccion; fp32 en preprocesador |
| Idiomas soportados | 27: en, as, bn, brx, doi, gu, hi, kn, ks, kok, mai, ml, mni, mr, ne, or, pa, sa, sat, sd, ta, te, ur, bho, hne, bgc, bhb |
| Licencia | Indic Open Model License v1.0 (modelo base Canary-1B-v2: CC BY 4.0) |
| Formato de pesos | Core ML (`.mlmodelc`): Preprocessor fp32, EncoderInt4, DecoderInt4, Projection fp16, `vocab.json`, `metadata.json` |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer encoder-decoder de tipo Canary, con un encoder que transforma la mel-espectrograma de entrada en una representación latente y un decoder autorregresivo que genera tokens de texto. En esta conversión Core ML, el preprocesador recibe una forma `[1, 240000]` (15 s a 16 kHz) y produce una mel de `[1, 128, 1501]`; el encoder emite `[1, 1024, 188]` y el decoder opera con `input_ids` de `[1, 256]` sin caché KV, produciendo hidden states de `[1, 256, 1024]`. La proyección final mapea a logits de `[1, 7152]`, correspondientes a un vocabulario SentencePiece de 7.152 piezas. Los tokens especiales son `eos=3`, `pad=2`, `bos=4`.

El entrenamiento original corresponde al fine-tune de Canary-1B-v2 realizado por Bodhan AI / AI4Bharat sobre datos de lenguas índicas, con soporte de prompts de 10 tokens que controlan el idioma, la puntuación, la normalización inversa de texto (ITN), la romanización y la marca de timestamps/diarización. No se dispone en la información proporcionada del número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación técnica destacable es la selección de script de salida mediante token de prompt (nativo, mixto o romanizado) y la cuantización int4 por bloques compatible con el Neural Engine de Apple (iOS 18 / macOS 15).

## Capacidades

- Reconocimiento automático de voz (ASR) sobre audio de hasta 15 s por ventana, con extensión mediante segmentación.
- Salida en escritura nativa (devanagari y otras escrituras índicas), escritura mixta o romanizada, seleccionable por prompt.
- Soporte de Hinglish (hindi romanizado con mezcla de inglés), caso de uso principal de esta conversión.
- Transcripción en inglés con prompt específico (`[7, 4, 18, 66, 66, 5, 9, 11, 13, 15]`).
- Control de puntuación y normalización inversa de texto (ITN) mediante tokens de prompt.
- Soporte de marcas de timestamp y diarización a nivel de prompt (deshabilitadas por defecto en los prompts incluidos).
- Ejecución local en Apple Silicon con aceleración por CPU y Neural Engine.
- Integración con FluidAudio `CanaryManager` para transcripción en Swift.
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá del ASR.

## Casos de uso

- Transcripción local de reuniones y notas de voz en macOS/iOS: el modelo procesa ventanas de 15 s con un decoder de 256 pasos, lo que permite transcribir audio en el dispositivo sin enviar datos a la nube, relevante para contenido confidencial.
- Dictado Hindi/Hinglish en aplicaciones de productividad: el prompt romanizado (a) genera salida en caracteres latinos, adecuada para usuarios que escriben hindi con teclado inglés, con una tasa de letras latinas superior al 95 % según la validación del autor.
- Subtitulado y transcripción de contenido audiovisual en lenguas índicas: la selección de prompt por idioma permite cubrir bengalí, tamil, telugu, maratí, urdu y otras lenguas del listado, con salida en escritura nativa para subtítulos.
- Automatización de atención al cliente en centros de contacto: la transcripción en tiempo casi real (latencia de 3,8-11 s por clip de 4-5 s en la validación) permite generar transcripciones para análisis de calidad y búsqueda posterior.
- Procesamiento por lotes de archivos de audio en pipelines de datos: la conversión Core ML puede ejecutarse en servidores Mac o en flujos de trabajo con `CanaryManager`, facilitando la generación de corpus transcritos.
- Investigación lingüística y creación de datasets: el soporte de 27 lenguas índicas y de variantes de script (nativo, mixto, romanizado) permite anotar y comparar corpus multilingües con un único modelo.
- Aplicaciones de accesibilidad: dictado por voz en dispositivos Apple para usuarios de lenguas índicas, con ejecución local que reduce la dependencia de conectividad.

## Benchmarks y rendimiento

La model card incluye una validación de CER (Character Error Rate) frente a la decodificación greedy de NeMo en PyTorch, sobre clips sintetizados con `say` de macOS a 16 kHz. Umbrales de aceptación: CER ≤ 0,1 por clip y ≤ 0,05 de media; salida romanizada con ≥ 95 % de letras latinas. CER medio: 0,0057.

| Clip | Prompt | CER | Latencia NeMo (PyTorch) | Latencia Core ML int4 |
|---|---|---|---|---|
| hinglish1 (4,43 s) | hi romanizado | 0,000 | 29,85 s | 11,05 s |
| hinglish2 (4,77 s) | hi romanizado | 0,000 | 31,69 s | 4,39 s |
| hinglish3 (4,28 s) | hi romanizado | 0,000 | 31,65 s | 4,46 s |
| hinglish4 (4,56 s) | hi romanizado | 0,026 | 31,17 s | 4,50 s |
| hinglish5 (3,91 s) | hi romanizado | 0,000 | 31,11 s | 3,81 s |
| english1 (5,12 s) | en | 0,000 | 31,21 s | 4,30 s |
| english2 (3,98 s) | en | no disponible (clip truncado en la información) | no disponible | no disponible |

No se han publicado resultados de benchmarks estándar (WER sobre LibriSpeech, Common Voice, FLEURS, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/unificada estimada: el repositorio completo ocupa 698 MB; en Apple Silicon la memoria unificada necesaria es del orden de 1 GB o inferior durante la inferencia, dado que los pesos int4 suman 446,6 MB (encoder) + 232,7 MB (decoder) + 14,7 MB (proyección) + 3,8 MB (preprocesador).
- GPU recomendadas: no aplica GPU dedicada; el modelo está diseñado para CPU y Neural Engine de Apple Silicon (requiere iOS 18 / macOS 15 para los modelos int4).
- Cabe en equipos consumer Apple: sí, en cualquier Mac con Apple Silicon (M1 o posterior) y en dispositivos iOS 18 compatibles, dado el tamaño inferior a 1 GB.
- Opciones de despliegue: Core ML nativo, FluidAudio `CanaryManager` (versión 0.17.4 o compatible con el contrato de formas), integración en apps Swift. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de texto generativo.
- Latencia y throughput: en la validación, entre 3,81 s y 11,05 s por clip de 3,9-5,1 s en Core ML int4 (CPU+ANE), frente a 29,85-31,69 s en PyTorch/NeMo. El throughput depende del hardware Apple concreto y no se detalla por chip.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/ventana | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Indic-Transcribe-Flex Core ML int4 (esta ficha) | 1.000 M | 15 s por ventana | 27 lenguas índicas + en | Indic Open Model License v1.0 | Core ML int4 |
| bodhan-ai/indic-transcribe-flex (original) | 1.000 M | 15 s por ventana (contrato Canary) | 27 lenguas índicas + en | Indic Open Model License v1.0 | safetensors / PyTorch |
| NVIDIA Canary-1B-v2 | 1.000 M | no disponible | no disponible en la información | CC BY 4.0 | safetensors / NeMo |
| Whisper large-v3 | no disponible en la información | no disponible | multilingüe general | MIT (según conocimiento público, no verificado en la información) | safetensors / múltiples |

La comparación con Whisper large-v3 u otros ASR multilingües no puede completarse con datos de rendimiento porque no se han publicado benchmarks comparativos en la información disponible.

## Limitaciones y advertencias

- Ventana de audio fija de 15 s por inferencia; audios más largos requieren segmentación externa y pueden perder contexto entre segmentos.
- El decoder no usa caché KV, lo que limita la longitud de salida a 256 pasos y puede afectar a la eficiencia en secuencias largas.
- Solo se han validado prompts para hindi (romanizado, mixto y nativo) e inglés; el resto de las 27 lenguas figuran en los metadatos pero no se aportan pruebas de calidad en la model card.
- La validación se realizó sobre clips sintéticos generados con `say` de macOS, no sobre audio real de hablantes nativos, lo que puede sobreestimar el rendimiento en condiciones reales (ruido, acentos, solapamiento).
- Riesgo de alucinación y errores en nombres propios, siglas y términos técnicos; el CER de 0,026 en uno de los clips (confusión "Gorba"/"Goa") ilustra este tipo de fallo.
- Licencia con share-alike: cualquier derivado distribuido debe mantenerse bajo la Indic Open Model License v1.0 con la atribución correspondiente.
- Tope de uso comercial: productos o servicios que superen 500 millones de usuarios activos mensuales o 250 millones de dólares de ingresos anuales requieren licencia separada del licenciante (sección 14); las entidades de interés público elegibles están exentas.
- Requiere iOS 18 / macOS 15 para los modelos int4; no es ejecutable en versiones anteriores ni en hardware sin Neural Engine compatible.
- No se documentan sesgos específicos del modelo en la información disponible, aunque al derivar de un fine-tune sobre datos índicos puede heredar sesgos de esos corpus.
- El modelo es exclusivamente ASR; no soporta generación de texto libre, tool calling ni razonamiento multi-paso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/simple-voice/indic-transcribe-flex-coreml
- Modelo base: https://huggingface.co/bodhan-ai/indic-transcribe-flex
- Modelo upstream de NVIDIA: https://huggingface.co/nvidia/canary-1b-v2
- Licencia Indic Open Model License v1.0: https://huggingface.co/simple-voice/indic-transcribe-flex-coreml/blob/main/Indic_Open_Model_License.md
- Aviso de atribución: https://huggingface.co/simple-voice/indic-transcribe-flex-coreml/blob/main/NOTICE.md
- FluidAudio (librería de integración): no disponible en la información proporcionada
- Paper o blog de Bodhan AI / AI4Bharat: no disponible en la información proporcionada
