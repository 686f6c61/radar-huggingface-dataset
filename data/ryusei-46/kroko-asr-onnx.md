# ryusei-46/kroko-asr-ONNX

## Resumen

Kroko ASR ONNX es una redistribución en formato ONNX de los modelos comunitarios de reconocimiento automático del habla (ASR) de Banafo/Kroko ASR para portugués y neerlandés. El autor, ryusei-46, no reentrena ni recuantiza nada: toma los ficheros `.data` originales (contenedores con cuatro bloques internos) y los separa en `encoder.onnx`, `decoder.onnx`, `joiner.onnx` y `tokens.txt` para que puedan cargarse directamente en ONNX Runtime Web (WASM) y en sherpa-onnx.

La arquitectura subyacente es un transducer Zipformer2 en modo streaming, cuantizado a int8, con un vocabulario de 650 símbolos y una ventana de encoder de 141 frames con salto de 128 frames (40 ms por frame de salida). El paquete ocupa unos 0,3 GB en el repositorio, con el encoder concentrando prácticamente todo el peso (154,9 MB por idioma).

Su relevancia es práctica: permite ASR en streaming en el navegador sin servidor, con licencia CC BY-SA y un rendimiento medido de aproximadamente 9x tiempo real en un AMD Ryzen 7 8745H, con WER del 9,3 % en portugués y del 13,3 % en neerlandés sobre 100 utterances de FLEURS. Es una opción interesante para demos web, prototipos y aplicaciones de dictado en esos dos idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transducer Zipformer2 en streaming (encoder + predictor + joiner) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de encoder de 141 frames, salto de 128 frames, 40 ms por frame de salida |
| Tipos de cuantizacion | int8 (pesos originales, sin recuantizar) |
| Idiomas soportados | Portugues (pt), neerlandes (nl) |
| Licencia | CC BY-SA (version no especificada por el autor original) |
| Formato de pesos | ONNX (encoder.onnx, decoder.onnx, joiner.onnx) + tokens.txt |

## Arquitectura y entrenamiento

El modelo es un transducer Zipformer2 orientado a streaming, con tres componentes separados en ONNX: el encoder (154,9 MB, int8) que procesa ventanas de 141 frames de features fbank de 80 dimensiones y emite `encoder_out` de forma [1, 32, 512]; el predictor o decoder (0,6 MB) que toma los dos símbolos previos como contexto; y el joiner (0,3 MB) que combina ambas salidas para producir logits sobre un vocabulario de 650 tokens. El encoder mantiene 116 estados internos que se pasan como entrada y salida en cada paso, lo que permite inferencia incremental sin recálculo.

Las características de entrada son fbank de Kaldi con 80 bins a 16 kHz, con los parámetros por defecto de sherpa-onnx (dither 0, snip_edges=false, ventana Povey, rango 20-7600 Hz). No se dispone de información sobre el dataset de entrenamiento, el número de tokens vistos ni si hubo ajuste con RLHF o DPO; la model card solo documenta el proceso de empaquetado y las mediciones. La innovación técnica relevante aquí no es arquitectónica sino de empaquetado: la separación byte a byte del contenedor `.data` original en cuatro ficheros cargables por ONNX Runtime Web y sherpa-onnx, sin alterar pesos ni vocabulario.

## Capacidades

- Reconocimiento automático del habla en streaming para portugués y neerlandés.
- Decodificación greedy sobre transducer, adecuada para inferencia de baja latencia.
- Ejecución en navegador mediante ONNX Runtime Web (WASM, un solo hilo) y en Python mediante sherpa-onnx.
- Manejo de estado incremental: el encoder conserva 116 estados entre frames, lo que permite procesar audio continuo sin reiniciar.
- Segmentación de audio largo: la model card recomienda cortar en intervalos de hasta 28 segundos y reiniciar el estado en cada segmento para mayor precisión.
- No soporta tool calling, function calling, agentes, visión, audio de entrada más allá del propio ASR, ni modo de razonamiento explícito.
- Capacidad multilingüe limitada a los dos idiomas empaquetados (pt y nl); no hay modelo multilingüe conjunto.

## Casos de uso

- Dictado en el navegador: integración con ONNX Runtime Web para transcribir voz en tiempo real sin enviar audio a un servidor, útil en aplicaciones de notas o accesibilidad en portugués y neerlandés.
- Subtitulado en directo de reuniones: el modo streaming y la ventana de 141 frames permiten generar subtítulos con latencia baja en llamadas o webinars en esos idiomas.
- Asistentes de voz embebidos: sherpa-onnx permite desplegar el modelo en dispositivos con recursos limitados, como Raspberry Pi o portátiles, sin GPU dedicada.
- Transcripción por lotes de archivos de audio: procesando segmentos de hasta 28 segundos con reinicio de estado, se obtiene una transcripción razonable para archivos de entrevistas o podcasts en pt/nl.
- Prototipado rápido de pipelines ASR: al estar en ONNX y ser compatible con sherpa-onnx, sirve para validar una arquitectura de transcripción antes de invertir en modelos mayores.
- Aplicaciones de kiosco o atención al cliente en neerlandés y portugués: la licencia CC BY-SA permite uso comercial con atribución y compartir igual, adecuada para productos derivados que puedan liberarse bajo esa misma licencia.
- Investigación en ASR de bajo recursos: el paquete facilita experimentos con decodificación greedy y comparación de WER en FLEURS sin necesidad de infraestructura pesada.

## Benchmarks y rendimiento

| Idioma | WER (FLEURS, 100 utterances) | Velocidad (audio / tiempo de proceso) | Entorno |
|---|---|---|---|
| Portugues | 9,3 % | ~9x tiempo real | ONNX Runtime Web (WASM, 1 hilo), AMD Ryzen 7 8745H |
| Neerlandes | 13,3 % | ~9x tiempo real | ONNX Runtime Web (WASM, 1 hilo), AMD Ryzen 7 8745H |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido habitual; el modelo corre en CPU. En GPU, el encoder int8 de 154,9 MB más estados cabría en cualquier GPU con al menos 1 GB de memoria libre, aunque no se documenta soporte GPU específico.
- GPU recomendadas: no disponibles; el diseño está orientado a CPU y WASM.
- Consumer GPU: sí, cualquier GPU moderna podría alojarlo, pero el caso de uso principal es CPU y navegador.
- Opciones de despliegue: sherpa-onnx (Python y otros bindings), ONNX Runtime Web (WASM) en navegador, ONNX Runtime nativo en CPU.
- Latencia y throughput: aproximadamente 9x tiempo real en un AMD Ryzen 7 8745H con WASM de un solo hilo, según la model card. No se documentan cifras para GPU ni para otros procesadores.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Contexto / ventana | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| ryusei-46/kroko-asr-ONNX | Zipformer2 streaming int8 | pt, nl | Ventana 141 frames, 40 ms/frame | CC BY-SA | ONNX | Hugging Face |
| Banafo/Kroko-ASR (original) | Zipformer2 streaming int8 | pt, nl y otros | Igual que el derivado | CC BY-SA (comunidad) y otras para comerciales | `.data` contenedor | Hugging Face |
| Whisper (OpenAI) | Transformer encoder-decoder | Multilingue | 30 s por ventana | MIT | PyTorch, ONNX, GGUF | Amplia |
| Vosk | Kaldi-based | Varios | Streaming | Apache 2.0 | Kaldi/ONNX | Amplia |

La comparación con Whisper es la más directa en cuanto a disponibilidad y licencia: Whisper ofrece multilingüismo amplio y licencia MIT, pero no está diseñado para streaming nativo y su ventana fija de 30 segundos complica la latencia baja. Vosk es una alternativa streaming con licencia Apache 2.0, pero no se dispone de datos de WER comparables en esta información. El modelo de Banafo es el origen directo y comparte pesos; la diferencia es solo el empaquetado.

## Limitaciones y advertencias

- Solo cubre portugués y neerlandés; no es multilingüe ni admite otros idiomas.
- El WER en neerlandés (13,3 %) es notablemente superior al de portugués (9,3 %), lo que puede ser problemático en dominios con vocabulario específico.
- La segmentación de audio largo requiere reiniciar el estado en cada segmento; mantener el estado entre segmentos provocó omisiones de palabras en neerlandés según la model card.
- Licencia CC BY-SA sin versión especificada por el autor original, lo que introduce ambigüedad legal para uso comercial y para la cláusula de compartir igual.
- Es una redistribución de terceros no aprobada ni recomendada por Banafo; para producción conviene evaluar el repositorio original.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado con datos no especificados, es probable que herede sesgos de esos corpus.
- Riesgo de alucinación inherente a los sistemas ASR: puede generar texto plausible en tramos de silencio o ruido.
- No hay soporte documentado de GPU ni de cuantizaciones alternativas (fp16, int4); solo int8.
- El rendimiento medido es en un procesador concreto y con WASM de un solo hilo; en otros entornos puede variar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ryusei-46/kroko-asr-ONNX
- Modelo base: https://huggingface.co/Banafo/Kroko-ASR
- Sitio de Kroko: https://kroko.ai
- ONNX Runtime Web: https://onnxruntime.ai/docs/tutorials/web/
- sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Licencia del modelo base: https://huggingface.co/Banafo/Kroko-ASR#license
