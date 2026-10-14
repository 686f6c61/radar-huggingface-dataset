# KaanAydinli/Duyu-small

## Resumen

Duyu-small es un modelo de reconocimiento automático del habla (ASR) desarrollado por KaanAydinli, diseñado para funcionar con dos idiomas en una misma frase: turco e inglés. Se distribuye como grafos ONNX cuantizados y un pequeño motor de inferencia sin dependencia de PyTorch (numpy + onnxruntime + sentencepiece), con el objetivo explícito de ejecutarse en CPU y dispositivos de borde (edge) junto al micrófono. La versión int8 ocupa 56 MB y la de 4 bits, 34 MB, lo que lo sitúa en la franja de modelos desplegables en hardware muy limitado.

A nivel de arquitectura, es un codificador Conformer con memoria acústica dispersa (product-key memory) y decodificación conjunta CTC/atención. Tiene 19,3 M de parámetros activos por fotograma y 49,3 M almacenados, con un coste computacional equivalente a un modelo de paso único de 46,6 M. Genera texto con mayúsculas, puntuación y formato numérico, y soporta decodificación con haz de atención (beam search) o CTC voraz.

Su relevancia actual radica en el nicho de ASR bilingüe turco-inglés en el dispositivo: frente a alternativas como whisper-base, mejora notablemente el WER en turco conversacional y en turnos de call-center, a costa de un rendimiento inferior en inglés. Está publicado bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (9 bloques, d 256, 4 cabezas, conv k15) con 3 pasadas compartidas de refinamiento y compuertas aprendidas; memoria acústica product-key; cabeza CTC; decodificador Transformer de 3 capas (d 256, QK-norm) |
| Parametros totales | 49,3 M almacenados (15,5 M encoder + 30,0 M memoria + 0,5 M CTC + 3,8 M decoder) |
| Parametros activos | 19,3 M por fotograma (equivalente a un modelo de paso único de 46,6 M) |
| Longitud de contexto | No aplicable como ventana de tokens; codificador de contexto completo, audio troceado a partir de 25-30 s |
| Tipos de cuantizacion | int8 (56 MB), 4-bit (34 MB) y fp32 (201 MB) |
| Idiomas soportados | Turco (tr) e inglés (en); modos tr, en, mix (por defecto) y auto |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (cuatro grafos por precision: encoder_pre, encoder_pass, encoder_post, decoder) + passes.npz, fbank.npz, spm.model, engine.json, config.json |

## Arquitectura y entrenamiento

El codificador consta de 9 bloques Conformer (dimensión 256, 4 cabezas de atención, convolución con kernel 15) que se aplican en 3 pasadas de refinamiento compartidas, con compuertas aprendidas por pasada, produciendo una salida a 25 Hz. Tras el bloque 4 incorpora una memoria acústica dispersa de tipo product-key: una tabla de 250.000 entradas por 120 valores, con 4 cabezas y 16 lecturas por fotograma y pasada (aproximadamente 23.000 lecturas por fotograma). La cabeza CTC usa 2048 piezas SentencePiece (turco + inglés) e incorpora InterCTC y autoacondicionamiento en el bloque 4 de cada pasada. La decodificación combina CTC y atención mediante un decodificador Transformer de 3 capas con QK-norm.

La memoria product-key es la innovación destacable: permite almacenar 30,0 M de parámetros pero leer solo una fracción por fotograma, de modo que el coste activo (19,3 M) es muy inferior al almacenado (49,3 M). El motor incluye una port del decodificador de referencia de PyTorch, verificada como idéntica en 20 de 20 clips de desarrollo con la misma precisión numérica. La información proporcionada no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se empleó RLHF o DPO.

## Capacidades

- Reconocimiento de voz bilingüe turco-inglés, incluyendo frases que mezclan ambos idiomas en una misma oración.
- Salida con mayúsculas, puntuación y formato de números.
- Modo de decodificación con haz de atención (beam 5 + rescoring CTC) y modo CTC voraz (más rápido, útil para resultados parciales).
- Selección de idioma forzada (`tr`, `en`) o automática/mixta (`mix`, `auto`).
- Inferencia con entradas de audio de cualquier duración, con troceado automático por encima de 30 s.
- Ejecución sin PyTorch: solo numpy, onnxruntime y sentencepiece.
- Selección de precisión en tiempo de carga (`int8`, `q4`, `fp32`).
- API de Python y herramienta de línea de comandos.
- Memoria acústica dispersa para capturar contexto a lo largo de la utterance.

## Casos de uso

- Reconocimiento de voz en el dispositivo para asistentes de micrófono: el modelo corre en CPU con un factor de tiempo real de 0,07 en int8 con beam 5, por lo que puede transcribir en vivo sin GPU ni conexión.
- Transcripción de turnos en centros de llamadas en turco: obtiene un WER de 16,37 en sierra-tr (846 turnos), frente a 39,08 de whisper-base, lo que lo hace adecuado para diarización y análisis de conversaciones telefónicas.
- Subtitulado local de voz conversacional turca: con 12,45 de WER en voicedata-TR supera ampliamente a whisper-base (29,51) en habla espontánea de diálogo.
- Aplicaciones de accesibilidad sin conectividad: al pesar 34-56 MB y no requerir frameworks pesados, puede integrarse en dispositivos de bajo consumo para dictado y control por voz.
- Interfaces bilingües turco-inglés: el modo `mix` permite transcribir hablantes que alternan idiomas en una misma frase, algo habitual en entornos profesionales turcos.
- Reconocimiento de comandos y notas de voz cortas: el modo CTC voraz (RTF 0,016) permite obtener transcripciones rápidas para interacciones de baja latencia.
- Preprocesado de audio para pipelines de análisis: usar la transcripción como entrada de sistemas de búsqueda, resumen o clasificación en turco.

## Benchmarks y rendimiento

Word error rate (`wer_trnum`: insensible a mayúsculas, puntuación y formato numérico), decodificación de referencia en PyTorch (haz de atención 5 + rescoring CTC):

| Conjunto de prueba | Duyu-small (49,3 M) | whisper-base (74 M) | mihuai/turkish-stt (66 M) | balbal (45,4 M) | Cactus Whistle |
|---|---|---|---|---|---|
| voicedata-TR (conversación, 235 fragmentos) | 12,45 | 29,51 | 19,89 | — | — |
| FLEURS tr test (743) | 7,87 | 24,19 | 9,62 | 7,95 | — |
| sierra-tr (turnos de call-center, 846) | 16,37 | 39,08 | 24,95 | 17,61 | — |
| FLEURS en_us test (500) | 22,88 | 10,81 | solo turco | solo turco | 14,37 |

Comprobación de cuantización sobre 62 clips conversacionales reservados (13,7 min, motor en CPU de portátil con 4 hilos):

| Motor | WER | Factor de tiempo real |
|---|---|---|
| Referencia PyTorch (GPU, bf16) | 20,14 | — |
| fp32, haz de atención 5 | 19,56 | 0,11 |
| int8, haz de atención 5 | 19,56 | 0,07 |
| 4-bit, haz de atención 5 | 19,67 | 0,13 |
| int8, CTC voraz únicamente | 22,19 | 0,016 |

## Requisitos de hardware

- No se especifican requisitos de VRAM en la información disponible; el modelo está pensado para CPU, por lo que el tamaño en memoria se aproxima al del conjunto de grafos en disco.
- int8: 56 MB por conjunto de grafos; 4-bit: 34 MB; fp32: 201 MB.
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, etc.) e incluso en CPU de portátil, dado su tamaño reducido.
- El benchmark de cuantización se ejecutó en una CPU de portátil con 4 hilos, logrando un factor de tiempo real de 0,07 en int8 con beam 5 y 0,016 en CTC voraz.
- Despliegue mediante onnxruntime (versiones dynamic quantization para int8 y block-wise 32 para 4 bits), con numpy y sentencepiece; el paquete Python `duyu_small` gestiona la carga.
- No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI; el despliegue previsto es ONNX Runtime en el dispositivo.
- El decodificador reejecuta el prefijo en cada paso (sin caché KV), por lo que la latencia crece en dictado largo.

## Comparativa con modelos similares

| Modelo | Parametros | WER FLEURS tr | WER FLEURS en_us | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Duyu-small | 49,3 M almacenados / 19,3 M activos | 7,87 | 22,88 | Apache 2.0 | ONNX (int8, q4, fp32) |
| whisper-base | 74 M | 24,19 | 10,81 | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |
| mihuai/turkish-stt | 66 M | 9,62 | solo turco | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |
| balbal | 45,4 M | 7,95 | — | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |
| Cactus Whistle | no disponible | — | 14,37 | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |

## Limitaciones y advertencias

- Codificador de contexto completo: las utterances se decodifican enteras y se trocean en entradas largas (25-30 s); no hay resultados parciales en streaming más allá de la cabeza CTC.
- El decodificador reejecuta el prefijo en cada paso (sin caché KV): adecuado para turnos de conversación, no optimizado para dictado largo.
- El inglés está orientado a "entender inglés dentro de una conversación en turco" (WER 22,88 en FLEURS-en), no alcanza la calidad de modelos especializados como Cactus Whistle (14,37).
- El punto más débil es el habla leída con nombres propios poco frecuentes.
- Al ser un modelo ASR, no se le aplican los sesgos típicos de un LLM generativo, pero puede fallar en acentos, ruido de fondo y vocabulario especializado no visto en entrenamiento.
- No se documentan en la información proporcionada los sesgos de los datos de entrenamiento, el riesgo de alucinación en transcripción ni restricciones adicionales de uso comercial más allá de la licencia Apache 2.0 (que permite uso comercial).
- No se han publicado cifras de tokens de entrenamiento ni de composición del dataset en la información disponible.

## Enlaces

- HuggingFace: https://huggingface.co/KaanAydinli/Duyu-small
- No se han encontrado en la búsqueda web enlaces relevantes adicionales (papers, blogs, repositorios o demos) relacionados con el modelo; los resultados devueltos no guardan relación con Duyu-small.
