# odens00volym/kb-whisper-coreml

## Resumen

odens00volym/kb-whisper-coreml es una conversión a Core ML del modelo KB-Whisper Large de KBLab (Biblioteca Nacional de Suecia), un fine-tune de la familia Whisper entrenado específicamente para sueco. El autor, odens00volym, ha aplicado palettización mixta de 8 bits con descomposición de outliers para reducir el tamaño de los pesos y que estos quepan en la memoria y el compilador de la Apple Neural Engine (ANE). El resultado es una variante de 1.842 MB (716 MB de encoder y 1.042 MB de decoder) frente a los 1.225 MB y 1.731 MB de los pesos float16 originales.

El problema que resuelve es muy concreto: cada etapa del modelo original en float16 supera el límite que acepta la ANE, de modo que en un Mac el compilador de la ANE se queda trabajando sin producir artefacto y la ruta de GPU aborta con grabaciones de cualquier longitud. Esta versión cuantizada se ejecuta en la ANE y está pensada para cualquier cliente de WhisperKit, donde se referencia como `modelRepo: "odens00volym/kb-whisper-coreml"` y `modelFolder: "KBLab_kb-whisper-large_1842MB"`.

Se distribuye con licencia Apache-2.0 (la misma que los pesos de origen, que no se han modificado salvo en precisión), soporta únicamente sueco (`sv`) y su relevancia es práctica: transcripción de audio en sueco con calidad de lectura sobre hardware Apple, a costa de ser más lento que las variantes Turbo de OpenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo Whisper; encoder de audio y decoder de texto de 32 capas |
| Parametros totales | no disponible en la informacion proporcionada (modelo base: KBLab/kb-whisper-large) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | ventana de audio de 30 s propia de la arquitectura Whisper; procesa grabaciones largas por segmentacion (probado con 12,2 minutos de radio sueca) |
| Tipos de cuantizacion | palettizacion mixta de 8 bits con descomposicion de outliers (Core ML) |
| Idiomas soportados | sueco (sv) |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML para WhisperKit (variante `KBLab_kb-whisper-large_1842MB`); no se ofrecen GGUF ni safetensors en este repositorio |

| Etapa | Float16 (original) | Esta version |
|---|---|---|
| AudioEncoder | 1225 MB | 716 MB |
| TextDecoder | 1731 MB | 1042 MB |

Tamano total del repositorio: 1,9 GB. Tamano conjunto de los pesos palettizados: aproximadamente 1,72 GB.

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper Large: un transformer encoder-decoder con encoder de audio y decoder autorregresivo de 32 capas (frente a las 4 capas del decoder de las variantes Turbo, de ahi la diferencia de velocidad). El modelo no se ha reentrenado: los pesos provienen sin cambios de KBLab/kb-whisper-large, un Whisper afinado por la Biblioteca Nacional de Suecia sobre corpus en sueco, y la única alteración es la precisión. No hay información disponible sobre el número de tokens de entrenamiento ni la composición exacta del dataset del modelo base en el material consultado.

La innovación técnica de esta ficha es exclusivamente de despliegue: conversión y palettización con whisperkittools y argmaxtools de Argmax Inc., mediante el comando `--generate-quantized-variants --allowed-nbits 8 --outlier-decomp`. La búsqueda de recetas de Argmax no bajó de 8 bits en ninguna capa para este modelo, por lo que la compresión aplicada es la más suave que encaja en la ANE. No consta que se hayan aplicado técnicas de RLHF, DPO ni decodificación especulativa.

## Capacidades

- Reconocimiento automático de voz (ASR) en sueco, con salida de texto transcrito.
- Transcripción de audio de duración extensa mediante segmentación en ventanas; el autor valida con 12,2 minutos de radio sueca.
- Mayor fidelidad en sueco que Whisper Large v3 Turbo en la comparación cualitativa publicada (recupera "studio ett" y omite muletillas).
- Ejecución en la Apple Neural Engine a través de WhisperKit, con integración directa en clientes de escritorio.
- No soporta tool calling ni function calling: es un modelo de ASR, no un modelo de lenguaje conversacional.
- No soporta flujos de agente ni razonamiento multi-paso.
- No dispone de capacidades de visión, audio más allá de la transcripción, ni modo "thinking".
- Cobertura multilingüe limitada al sueco; no se declara soporte de otros idiomas.

## Casos de uso

- Transcripcion de radio y podcast en sueco: el caso validado por el autor, 12,2 minutos de radio procesados a 1,7× tiempo real en un M1 Max; adecuado porque el modelo está afinado sobre sueco y mantiene puntuación y concordancia.
- Archivado y digitalizacion de fondos sonoros: una institución con colecciones en sueco puede transcribir lotes de audio para hacerlos buscables, con la ventaja de que la licencia Apache-2.0 permite uso institucional y comercial.
- Subtitulado de video en sueco para edicion posterior: el texto transcrito sirve como base de subtítulos, con revisión humana para corregir posibles omisiones en audio ruidoso.
- Actas y notas de reuniones en sueco: integrado en una app macOS vía WhisperKit, transcribe grabaciones de reunión en local sin enviar audio a la nube, lo que ayuda con requisitos de privacidad.
- Dictado por voz en aplicaciones macOS/iOS: cualquier cliente WhisperKit puede usar este repositorio como motor de dictado en sueco; la latencia es suficiente para dictado tras dictado, no para streaming estricto.
- Atencion al cliente en sueco: transcripción previa de llamadas grabadas para su análisis, clasificación o auditoría de calidad, dado el soporte específico del idioma.
- Investigacion linguistica sobre sueco hablado: generación de transcripciones a escala para corpus de estudio, aprovechando que el modelo base fue entrenado con material sueco por la Biblioteca Nacional de Suecia.
- Accesibilidad en contenidos suecos: generación de subtítulos para personas con discapacidad auditiva, siempre que se acepte una latencia de proceso superior a la de las variantes Turbo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (WER, MMLU, HumanEval, GSM8K) en la información disponible. El autor sí documenta una medición de velocidad y una comparación cualitativa de transcripción sobre un fragmento de 12,2 minutos de radio sueca, ejecutada en un M1 Max sobre la Neural Engine en la segunda pasada:

| Modelo | Velocidad | Transcripcion (fragmento) |
|---|---|---|
| odens00volym/kb-whisper-coreml | 1,7× tiempo real | *Inrikespolitik så i studio ett. För Centerpartiets valberedning presenterade tre kandidater som vill ta över jobbet som partiledare. Annie Lööf lämnar i februari nästa år.* |
| openai_whisper-large-v3-v20240930_626MB | 7,5× tiempo real | *Inrikes politik så i studiet för … Annie Lööf hon lämnar ju i februari nästa år.* |

El autor atribuye la diferencia de velocidad al decoder de 32 capas frente a las 4 del modelo Turbo, y la diferencia de calidad a la especialización en sueco del modelo base.

## Requisitos de hardware

- Diseñado exclusivamente para Apple Silicon (Apple Neural Engine) mediante Core ML; no es ejecutable en GPU NVIDIA ni en CUDA.
- Huella de pesos: aproximadamente 1,72 GB palettizados (716 MB encoder + 1.042 MB decoder); repositorio de 1,9 GB.
- VRAM/RAM estimada: no disponible de forma explícita; el autor reporta que las etapas float16 (1,27 GB y 1,81 GB) no caben en la ANE y que las versiones palettizadas sí.
- GPU recomendadas: no aplica el catálogo de A100, H100 o RTX 4090; el hardware objetivo es Apple Silicon. La medición publicada se hizo en un M1 Max.
- Cabe en equipos de consumo Apple (Mac con chip M-series). No hay datos de rendimiento para iPhone/iPad en el material consultado.
- Opciones de despliegue: cualquier cliente de WhisperKit (parametros `modelRepo` y `modelFolder` indicados en la model card) y la aplicacion Saga Studio, donde aparece como "KB-Whisper Large (Swedish)" en Ajustes ▸ Transcripción. No hay soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 1,7× tiempo real en M1 Max sobre ANE en la segunda ejecución. La primera carga es lenta porque Core ML compila el modelo para la Neural Engine durante varios minutos; el sistema operativo cachea el resultado en cargas posteriores.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana de audio | Idioma | Licencia | Formato / tamano | Velocidad medida (M1 Max) |
|---|---|---|---|---|---|---|
| odens00volym/kb-whisper-coreml | no disponible | 30 s por ventana | Sueco | Apache-2.0 | Core ML palettizado 8 bits, 1,72 GB | 1,7× tiempo real |
| KBLab/kb-whisper-large | no disponible | 30 s por ventana | Sueco | Apache-2.0 | Pesos float16, 2,956 GB (1,27 GB + 1,81 GB) | No ejecutable en ANE segun el autor |
| openai_whisper-large-v3 (variante Core ML de 626 MB para WhisperKit) | no disponible | 30 s por ventana | Multilingue | no disponible en la informacion | Core ML, 626 MB | 7,5× tiempo real |

La comparativa se limita a estos tres modelos porque son los que aparecen en la model card. No hay datos de WER ni de rendimiento comparado con otras alternativas de ASR en sueco (por ejemplo, Vosk o wav2vec2 suecos) en la información disponible.

## Limitaciones y advertencias

- Cobertura monolingüe: solo sueco; no se declara soporte de otros idiomas, aunque la arquitectura Whisper subyacente sea multilingüe.
- Dependencia de plataforma: el formato Core ML y la palettización lo atan a Apple Silicon y a clientes WhisperKit; no es portable a servidores con GPU NVIDIA ni a stacks de inferencia habituales.
- Cuantizacion a 8 bits: la compresión puede introducir pérdida de precisión respecto a los pesos float16, aunque el autor solo aporta una comparación cualitativa favorable frente a un modelo distinto (Turbo), no frente al propio float16.
- Velocidad inferior a las variantes Turbo: 1,7× tiempo real frente a 7,5×, debido al decoder de 32 capas. No es adecuado para transcripción en directo con latencia mínima.
- Primera carga lenta: la compilación de Core ML para la ANE tarda varios minutos y solo se cachea a partir de la segunda ejecución.
- Riesgo de alucinacion: al derivar de Whisper, el modelo puede generar texto plausible en tramos de silencio, ruido o audio musical; se recomienda revisión humana en contenidos críticos.
- Sesgos del modelo base: al estar entrenado por la Biblioteca Nacional de Suecia sobre material sueco, puede rendir peor con acentos no suecos, jerga técnica o variedades del sueco menos representadas.
- Sin validacion comunitaria: el repositorio registra 0 descargas y 0 likes, y no se han publicado resultados de WER ni evaluaciones independientes.
- Uso comercial: la licencia Apache-2.0 de los pesos permite uso comercial y modificaciones; conviene mantener la atribución a KBLab y a Argmax Inc. por la conversión.
- No apto como modelo de lenguaje: carece de tool calling, agentes y generación de texto libre; no debe plantearse para tareas distintas de la transcripción de audio en sueco.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/odens00volym/kb-whisper-coreml
- Modelo base (KBLab): https://huggingface.co/KBLab/kb-whisper-large
- Herramienta de conversion y palettizacion: https://github.com/argmaxinc/whisperkittools
- Utilidades de Argmax: https://github.com/argmaxinc/argmaxtools
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los enlaces recuperados corresponden a paginas de venta de porcelana de KAHLA y no guardan relacion con el contenido de esta ficha.
