# sivasub987/polyglot-lion-0.6b-v1.5-litertlm

## Resumen

Polyglot-Lion 0.6B v1.5 — LiteRT-LM es una conversión on-device para Android del fine-tune `knoveleng/polyglot-lion-0.6b-v1.5`, un modelo de reconocimiento automático del habla (ASR) derivado de Qwen3-ASR-0.6B. Lo desarrolla Knovel Engineering Lab (Quy-Anh Dang y Chris Ngo, Singapur), y la conversión a LiteRT-LM la firma el usuario sivasub987. El objetivo es llevar un ASR multilingüe especializado en inglés de Singapur (Singlish), mandarín, tamil y malayo a dispositivos Android sin conexión, empaquetado como un único bundle `model.litertlm` de 1,1 GB.

La arquitectura subyacente es la de Qwen3-ASR: un codificador de audio de 18 capas seguido de un modelo de lenguaje Qwen3-0.6B de 28 capas, con 0,6B parámetros totales. La conversión cuantiza el modelo de lenguaje y el embedder a int8 y mantiene el codificador de audio en fp16, con una ventana de entrada fija de 5 segundos a 16 kHz mono PCM.

Su relevancia radica en que permite transcripción offline multilingüe en hardware móvil con licencia MIT, algo poco habitual en el espacio ASR, y en que el fine-tune original mejora drásticamente el rendimiento en tamil y malayo frente al modelo base. No obstante, esta conversión concreta no publica benchmarks propios de WER ni de latencia en teléfono, por lo que debe validarse sobre audio real antes de usarla en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-ASR: codificador de audio de 18 capas + modelo de lenguaje Qwen3-0.6B de 28 capas |
| Parametros totales | 0,6B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana de audio fija de 5 s (16 kHz mono PCM); contexto de texto no disponible |
| Tipos de cuantizacion | int8 (modelo de lenguaje y embedder), fp16 (codificador de audio) |
| Idiomas soportados | inglés (incluido Singlish), mandarín, tamil, malayo |
| Licencia | MIT (fine-tune y conversión); modelo base Qwen3-ASR bajo Apache-2.0 |
| Formato de pesos | `model.litertlm` (LiteRT-LM), 1.144.174.464 bytes |
| Runtime | LiteRT-LM / `litertlm-android`, Android arm64, CPU o GPU |
| Entrada | WAV 16 kHz mono, ventana de 5 s |
| Salida | texto con prefijo de idioma: `language <lang><asr_text><text>` |
| Tamaño del repo | 1,1 GB |
| Libreria | litert-lm |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3-ASR: un codificador de audio de 18 capas que transforma la señal PCM en representaciones acústicas, acoplado a un decodificador de lenguaje Qwen3-0.6B de 28 capas que genera el texto. El fine-tune de Knovel se entrenó sobre aproximadamente 969 horas de audio equilibrado en inglés, mandarín, tamil y malayo, incluyendo los corpus NSC (inglés de Singapur), AISHELL-1/3, Common Voice, FLEURS, SLR65/127 y corpus de malayo. Una decisión de diseño destacable es la omisión deliberada del condicionamiento por etiqueta de idioma: el modelo infiere el idioma directamente del audio.

La conversión a LiteRT-LM no altera los pesos: el payload de tensores es idéntico byte a byte (611/611 tensores coinciden en nombre, forma y dtype con `Qwen/Qwen3-ASR-0.6B-hf`), solo cambia el layout del checkpoint al formato de transformers v5 y se empaqueta para el runtime móvil. Se aplica cuantización int8 al modelo de lenguaje y al embedder, mientras que el codificador de audio se mantiene en fp16 con el grafo raw-PCM → log-mel → `features` que espera la ruta de audio genérica de Android. La ventana de 5 segundos es la que trae el bundle oficial de Qwen3-ASR-0.6B en LiteRT; no es configurable en esta conversión.

## Capacidades

- Reconocimiento automático del habla offline en inglés (incluido Singlish), mandarín, tamil y malayo.
- Inferencia automática del idioma a partir del audio, sin necesidad de etiqueta previa.
- Salida de texto con prefijo de idioma detectado (`language <lang><asr_text><text>`).
- Ejecución on-device en Android arm64 mediante LiteRT-LM, con backend CPU o GPU.
- Decodificación greedy (top-k 1, temperatura 0) orientada a transcripción determinista.
- Procesamiento de ventanas de audio de 5 segundos a 16 kHz mono.
- No soporta streaming con parciales, timestamps por palabra, diarización de hablantes ni identificación por huella de voz.
- No es un modelo de traducción: devuelve el texto en el idioma hablado.

## Casos de uso

- Transcripción de reuniones offline en Android: la app captura audio, lo divide en segmentos de 5 segundos cortados en pausas y los envía al motor LiteRT-LM; el modelo transcribe cada segmento en el idioma detectado sin enviar datos a la nube, lo que resulta adecuado para entornos con requisitos de privacidad.
- Dictado por voz multilingüe en aplicaciones móviles: integración del bundle en una app de notas que alterna entre inglés de Singapur, mandarín, tamil y malayo sin configuración manual de idioma, gracias a la inferencia automática de la lengua.
- Subtitulado local de contenido grabado: procesamiento por lotes de archivos de audio divididos en ventanas de 5 segundos para generar transcripciones en dispositivos sin conectividad, útil en contextos educativos o de campo.
- Asistentes de voz para el sudeste asiático: el soporte específico de Singlish y tamil lo hace apto para aplicaciones de atención al ciudadano o servicios públicos en Singapur y Malasia, donde otros ASR rinden mal en variedades locales.
- Herramientas de accesibilidad: transcripción en tiempo casi real de conversaciones presenciales en un teléfono Android, con el modelo ejecutándose íntegramente en el dispositivo y sin coste por API.
- Investigación en ASR de bajos recursos: el bundle sirve como referencia reproducible para estudiar el comportamiento de un modelo int8 on-device frente al fine-tune original en fp16, especialmente en tamil y malayo, donde el fine-tune mejora enormemente sobre el modelo base.
- Procesamiento en local con LiteRT-LM en escritorio: validación y prototipado en Python antes de desplegar en Android, útil para pipelines de transcripción por lotes en máquinas sin GPU dedicada.

## Benchmarks y rendimiento

Los datos publicados corresponden al fine-tune original de Knovel, no a esta conversión cuantizada. WER para inglés, tamil y malayo; CER para mandarín. Menor es mejor.

| Modelo | Params | English LS | English NSC | Mandarin CV | Mandarin AISHELL-1 | Mandarin AISHELL-3 | Mandarin FLEURS | Tamil CV | Tamil SLR65 | Tamil SLR127 | Tamil FLEURS | Malay Meso. | Malay FLEURS | Media |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Qwen3-ASR-0.6B | 0,6B | 2,74 | 7,64 | 10,06 | 2,08 | 2,59 | 9,75 | 121,10 | 127,00 | 129,12 | 130,09 | 47,29 | 18,71 | 50,68 |
| Polyglot-Lion-0.6B | 0,6B | 2,67 | 6,09 | 6,16 | 1,93 | 2,32 | 9,19 | 42,16 | 23,07 | 28,14 | 37,68 | 24,33 | 14,45 | 16,52 |
| Polyglot-Lion-1.7B | 1,7B | 2,10 | 5,28 | 4,91 | 1,45 | 1,86 | 8,00 | 39,19 | 19,75 | 26,83 | 37,28 | 21,51 | 9,98 | 14,85 |

No se han publicado resultados de benchmarks del bundle LiteRT-LM convertido (ni WER ni latencia en teléfono) en la información disponible. La única validación reportada es cualitativa: con LiteRT-LM 0.17.1 en CPU de host, el clip de JFK produjo la transcripción correcta del discurso.

## Requisitos de hardware

- Tamaño del bundle: 1,1 GB en disco; el modelo completo pesa 0,6B parámetros, con el modelo de lenguaje y el embedder en int8 y el codificador de audio en fp16.
- VRAM/RAM estimada para inferencia: no disponible de forma oficial; por el tamaño del bundle, se espera que quepa en la memoria de un teléfono Android de gama media-alta, pero no hay cifras publicadas.
- GPU recomendadas: no disponible. El runtime soporta backend CPU o GPU en Android arm64, pero el codificador de audio debe ejecutarse en CPU (la codificación de audio por GPU no está soportada).
- ¿Cabe en GPU consumer? No hay datos publicados; el modelo está pensado para ejecución en dispositivo móvil, no para GPUs de escritorio.
- Opciones de despliegue: LiteRT-LM (`litertlm-android` para Android, paquete `litert_lm` para Python), con backend CPU o GPU en arm64.
- Latencia y throughput: no disponibles. No se ha publicado ningún benchmark de velocidad del bundle convertido.

## Comparativa con modelos similares

| Modelo | Params | Idiomas | Ventana de audio | Licencia | Formato / despliegue | Rendimiento |
|---|---:|---|---|---|---|---|
| Polyglot-Lion 0.6B v1.5 (LiteRT-LM, esta conversión) | 0,6B | en (Singlish), zh, ta, ms | 5 s | MIT (base Apache-2.0) | `model.litertlm`, Android on-device | Sin benchmarks propios; referencia: media 16,52 en el fine-tune |
| Qwen3-ASR-0.6B (base) | 0,6B | multilingüe (según modelo base) | no disponible | Apache-2.0 | safetensors / transformers | Media 50,68 en la tabla de Knovel; muy inferior en tamil y malayo |
| Polyglot-Lion 1.7B v1.5 | 1,7B | en (Singlish), zh, ta, ms | no disponible | MIT (base Apache-2.0) | safetensors / transformers | Media 14,85; mejor precisión, mayor coste computacional |
| Whisper (variantes pequeñas) | 0,04B–1,5B | multilingüe amplio | 30 s | MIT | safetensors, GGUF, múltiples runtimes | No disponible en la información proporcionada |

## Limitaciones y advertencias

- Ventana fija de 5 segundos: las locuciones largas deben cortarse y unirse, lo que puede perder contexto en las fronteras entre segmentos.
- Sin streaming: no genera transcripciones parciales ni timestamps por palabra.
- Sin diarización ni identificación de hablantes.
- No es un modelo de traducción; solo transcribe en el idioma hablado.
- La inferencia de idioma sin etiqueta puede confundirse en audio ambiguo o con mezcla de lenguas (code-switching), frecuente en Singlish.
- El bundle int8 no tiene benchmarks de precisión publicados; la tabla de WER/CER corresponde al fine-tune original y puede no reflejar la degradación por cuantización.
- La codificación de audio no está soportada en GPU; debe ejecutarse en CPU.
- Restricciones de licencia: el fine-tune y la conversión son MIT, pero el modelo base Qwen3-ASR es Apache-2.0; conviene revisar ambas licencias para uso comercial.
- Riesgo de alucinación en audio con ruido, silencios o habla no cubierta por los idiomas entrenados.
- El modelo tiene 0 descargas y 0 likes en HuggingFace, y fue creado en noviembre de 2026; no hay evidencia de uso en producción ni validación independiente.
- La model card contiene una frase truncada al final ("Lingala? No — the"), lo que sugiere una documentación incompleta.

## Enlaces

- HuggingFace (esta conversión): https://huggingface.co/sivasub987/polyglot-lion-0.6b-v1.5-litertlm
- Fine-tune original: https://huggingface.co/knoveleng/polyglot-lion-0.6b-v1.5
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Paper (ACL Anthology): https://aclanthology.org/2026.mellm-1.18/
- Paper (arXiv): https://arxiv.org/abs/2603.16184
- Repositorio del proyecto: https://github.com/knoveleng/polyglot-lion
- Receta de conversión Qwen3-ASR → LiteRT-LM: https://github.com/john-rocky/hf-to-litertlm
