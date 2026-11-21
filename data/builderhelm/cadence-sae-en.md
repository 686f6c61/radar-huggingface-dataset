# BuilderHelm/Cadence-Sae-EN

## Resumen

Cadence Sae EN es un modelo de reconocimiento automático del habla (ASR) en inglés desarrollado por BuilderHelm (ZenVoice) para dictado offline en su SDK BuilderHelmAudio. Parte del modelo NVIDIA Parakeet TDT 0.6B v3 y se distribuye como paquetes Core ML optimizados para ejecutarse en la Neural Engine de Apple Silicon, tanto en macOS 15+ como en iOS 18+. La propuesta central es ofrecer un ASR de calidad cercana al modelo original con una huella de descarga mucho menor: la build de 6 bits ocupa 542 MB frente a los 1.268 MB de la conversión FP16 de V3, manteniendo un WER de 7,54 % frente al 7,56 % de referencia.

La arquitectura subyacente es un Conformer con decodificación TDT (Token-and-Duration Transducer) de 0,6 mil millones de parámetros, heredada de Parakeet. La aportación del autor es un ajuste fino de las 8 capas superiores del encoder, el predictor y el joint (220 M de parámetros entrenables) sobre inglés con acento y habla de reuniones, usando Common Voice 17 (82,3 h) y AMI (68,1 h). El resultado es un modelo que comete menos errores transcibiendo inglés con acento como otro idioma y mejora en reuniones y llamadas de resultados.

Es relevante para desarrolladores que necesitan ASR privado y sin conexión en el ecosistema Apple, con un pipeline completo de preprocesado, encoder, predictor y joint empaquetado en `.mlpackage` y verificado por checksums. La licencia CC BY 4.0 permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer con decodificador TDT (Token-and-Duration Transducer) |
| Parametros totales | 0,6 mil millones (base Parakeet TDT 0.6B v3) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventanas de audio de 15 s y 30 s (funciones w15 y w30); ventanas largas gestionadas por el SDK con solapamiento |
| Tipos de cuantizacion | 6-bit palettized grupo 16 (por defecto), mixta 4/6-bit (33 bloques sensibles a 6-bit), 4-bit palettized grupo 8, FP16 sin cuantizar; checkpoint NeMo FP32 |
| Idiomas soportados | Inglés (incluye inglés con acento, con énfasis en India y Asia del Sur) |
| Licencia | CC BY 4.0 |
| Formato de pesos | Core ML `.mlpackage` (Preprocessor, Encoder, EncoderTail, Predictor, Joint) y checkpoint NeMo `.nemo` |
| Tamano de descarga | 542 MB (6-bit), 437 MB (mixta 4/6-bit), 395 MB (4-bit), 1.268 MB (FP16), 2.509 MB (NeMo FP32) |
| Vocabulario | 8.192 piezas BPE (heredado de V3), 8.193 logits de token en el joint |
| Entrada de audio | 16 kHz mono, log-mel acotado en FP32 |
| Plataformas | Apple Silicon con macOS 15+ e iOS 18+ |
| Libreria | coreml (runtime Swift BuilderHelmAudio 0.4.0+) |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura Conformer de Parakeet TDT 0.6B v3: encoder Conformer de 24 capas, predictor LSTM TDT de dos capas y 640 unidades, y un joint que emite 8.193 logits de token y cinco logits de duración. La conversión a Core ML divide el encoder en dos etapas secuenciales (`Encoder.mlpackage` y `EncoderTail.mlpackage`), cada una con pesos compartidos entre las funciones de ventana de 15 s y 30 s. El preprocesador calcula características log-mel acotadas en FP32 junto con normalizaciones de ventana completa (`normalize_w15` y `normalize_w30`). El predictor y el joint se mantienen en FP16. El vocabulario, el frontend y el ventaneo son idénticos a V3; solo cambian los pesos.

El ajuste fino cubre las 8 capas superiores del encoder, el predictor y el joint, lo que suma 220 M de parámetros entrenables; las 16 capas inferiores y el pre-encoder conservan los pesos de NVIDIA. Los datos son Common Voice 17 en inglés (82,3 h, CC0), ponderado hacia hablantes con etiqueta de acento fuera del inglés estadounidense, incluida India y Asia del Sur, y AMI con auriculares individuales (68,1 h, CC BY 4.0). Las etiquetas son transcripciones humanas; el estilo de mayúsculas y puntuación de AMI sigue el de V3. La model card no detalla el uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Transcripción de voz a texto en inglés, con soporte explícito de inglés con acento (especialmente indio y de Asia del Sur).
- Reconocimiento de habla de reuniones y llamadas de resultados, con mejora declarada frente a la conversión V3.
- Procesamiento offline y en dispositivo: el audio y las transcripciones no salen del dispositivo.
- Gestión de grabaciones largas mediante ventaneo offline del SDK, que prioriza cortes en pausas silenciosas y une ventanas donde los tokens solapados coinciden.
- Dos modos de ventana (15 s y 30 s) seleccionados automáticamente según la duración de la petición.
- Verificación de integridad de archivos mediante SHA-256 al cargar el modelo.
- No se documentan capacidades de tool calling, agentes, visión, audio más allá de ASR ni modo thinking.

## Casos de uso

- Dictado offline en macOS e iOS: integración en aplicaciones de notas o edición de texto mediante `SpeechRecognizer` del SDK BuilderHelmAudio, con compilación del modelo una vez por dispositivo y caché reutilizada en cargas posteriores.
- Transcripción de reuniones y llamadas de resultados: el ajuste fino sobre AMI y el énfasis en habla de reuniones lo hacen adecuado para generar actas y resúmenes en local, sin enviar audio a la nube.
- Atención al cliente con acentos diversos: el entrenamiento ponderado hacia hablantes de India y Asia del Sur reduce la tendencia a transcribir inglés acentuado como otro idioma, útil en centros de soporte globales.
- Aplicaciones de privacidad estricta: audio y transcripciones permanecen en el dispositivo, lo que encaja en entornos sanitarios, legales o corporativos con requisitos de confidencialidad.
- Procesamiento por lotes de grabaciones largas: el ventaneo offline del SDK permite transcribir archivos de audio extensos con cortes en pausas y fusión por solapamiento de tokens.
- Integración en pipelines de subtitulado o indexación de audio en macOS: la build de 6 bits (542 MB) es el equilibrio por defecto entre tamaño y precisión para Mac e iPhone; la de 4 bits (395 MB) sirve cuando el espacio es crítico.
- Reentrenamiento posterior: el checkpoint NeMo FP32 (2.509 MB) permite continuar el ajuste fino con NVIDIA NeMo fuera del ecosistema Core ML.

## Benchmarks y rendimiento

| Build | Pesos del encoder | Descarga | WER Speech Bench | WER inglés indio grabado |
|---|---|---:|---:|---:|
| 6-bit | 6-bit palettized, grupo 16 | 542 MB | 7,54 % | 8,61 % |
| Mixta 4/6-bit | 4-bit, 33 bloques sensibles a 6-bit | 437 MB | 7,76 % | 9,09 % |
| 4-bit | 4-bit palettized, grupo 8 | 395 MB | 7,93 % | 9,12 % |
| FP16 | FP16 sin cuantizar | 1.268 MB | 7,49 % | 8,57 % |
| V3 FP16 (referencia) | FP16 | 1.268 MB | 7,56 % | no disponible |

La model card no publica resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de texto, por tratarse de un modelo ASR. No se detallan cifras de latencia ni throughput; la validación física se realizó en un Mac con M5 y un iPhone 13, y el rendimiento en otros chips no está medido.

## Requisitos de hardware

- Ejecución en Apple Neural Engine; plataformas objetivo macOS 15+ e iOS 18+ sobre Apple Silicon.
- Descarga mínima de 395 MB (4-bit) y máxima de 1.268 MB (FP16); el checkpoint NeMo FP32 ocupa 2.509 MB y no está pensado para inferencia Core ML.
- Espacio adicional para la caché compilada de Core ML, que no se distribuye precompilada: los paquetes se compilan localmente en cada dispositivo.
- Validación física en M5 y iPhone 13; en iPhone la build FP16 se describe como lenta, por lo que se recomienda la de 6 bits.
- Despliegue mediante el SDK Swift BuilderHelmAudio 0.4.0 o posterior; no se mencionan vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de texto ni un formato GGUF.
- Latencia y throughput no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | WER (Speech Bench) | Licencia | Formato |
|---|---|---|---|---|---|
| Cadence Sae EN (6-bit) | 0,6 B | Ventanas de 15 s y 30 s | 7,54 % | CC BY 4.0 | Core ML |
| Parakeet TDT 0.6B v3 (FP16) | 0,6 B | Ventanas de 15 s y 30 s | 7,56 % | no disponible en la informacion | Core ML (conversion) |
| Parakeet TDT 0.6B v3 (original) | 0,6 B | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | NeMo |

La comparativa se limita al modelo base y su conversión, únicos datos aportados. No se dispone de cifras de otros ASR comparables (Whisper, Canary, etc.) en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: no soporta otros idiomas, aunque el ajuste mejora el inglés con acento.
- El rendimiento en chips distintos del M5 y el iPhone 13 no está medido; los resultados pueden variar en otros dispositivos Apple.
- La build FP16 es lenta en iPhone; para móvil se recomienda la de 6 bits.
- Los paquetes se compilan en el dispositivo, lo que añade tiempo de primera carga y requiere espacio para la caché de Core ML.
- La licencia CC BY 4.0 exige atribución al autor en usos comerciales y derivados.
- No se documentan sesgos específicos, tasas de alucinación ni límites de longitud más allá del ventaneo del SDK.
- El modelo no incluye capacidades de texto, visión ni agentes; su uso está acotado a ASR.
- La verificación SHA-256 al cargar implica que cualquier modificación manual de los archivos invalida la carga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BuilderHelm/Cadence-Sae-EN
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Conversión V3 previa: https://huggingface.co/BuilderHelm/Parakeet-TDT-0.6B-V3-CoreML
- Perfil del autor: https://huggingface.co/BuilderHelm
- Repositorio del SDK: https://github.com/BuilderHelm/BuilderHelmAudio
- ZenVoice: https://getzenvoice.com
- Descarga de ZenVoice para Mac: https://getzenvoice.com/download
- Common Voice 17: https://commonvoice.mozilla.org
- Corpus AMI: https://groups.inf.ed.ac.uk/ami/corpus/
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
