# Selbyggen/whisper-large-v3-turbo-danish-coreml

## Resumen

Whisper large-v3 turbo danés para WhisperKit y Core ML es una conversión de formato del modelo [thorhojhus/whisper-large-v3-turbo-danish](https://huggingface.co/thorhojhus/whisper-large-v3-turbo-danish), un ajuste fino de Whisper large-v3 turbo sobre aproximadamente 12.900 horas de audio en danés. El autor de la conversión, Selbyggen, empaqueta los pesos en formato Core ML para que la inferencia se ejecute sobre el Apple Neural Engine mediante WhisperKit, la librería de Argmax. No se trata de un modelo nuevo: los pesos y el comportamiento son los del modelo original, y el trabajo de ajuste corresponde íntegramente a thorhojhus.

El problema que resuelve es la transcripción automática de voz en danés con ejecución local en dispositivos Apple (Mac, iPhone, iPad), sin depender de servicios en la nube. Se distribuye en dos variantes: una de 634 MB con codificador de audio y decodificador de texto paletizados a 4 bits (descomposición de valores atípicos, en la línea de la variante `large-v3-v20240930_626MB` de Argmax) y otra de 1,63 GB en float16. Ambas incluyen cabezas de alineación para generar marcas de tiempo a nivel de palabra.

La relevancia actual está en que permite desplegar un modelo de reconocimiento de voz de gran tamaño en hardware de consumo Apple con latencia baja y privacidad total, y en que el modelo es utilizado en producción por la aplicación Sagt para transcripción local en danés. El repositorio ocupa 2,2 GB y la licencia es MIT, la misma que la del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper large-v3 turbo (transformer encoder-decoder) convertido a Core ML |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de Whisper: 30 s por segmento) |
| Tipos de cuantizacion | float16; paletizacion a 4 bits con descomposicion de valores atipicos (variante de 634 MB) |
| Idiomas soportados | danes (da) |
| Licencia | MIT |
| Formato de pesos | Core ML (paquetes `.mlpackage`/`.mlmodelc` para WhisperKit) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Whisper large-v3 turbo, un transformer encoder-decoder para reconocimiento automático de voz que procesa ventanas de audio de 30 segundos y genera texto con puntuación y mayúsculas. El ajuste fino original se realizó sobre aproximadamente 12.900 horas de habla en danés, según indica la model card. Esta publicación no entrena nada: aplica una conversión de formato con `whisperkittools` (`whisperkit-generate-model --model-version thorhojhus/whisper-large-v3-turbo-danish`), usando coremltools 8.3.0 para la variante de 4 bits y coremltools 9.0 para el decodificador de texto en float16.

La innovación técnica de esta versión es la cuantización paletizada mixta a 4 bits con descomposición de valores atípicos en el codificador de audio y el decodificador de texto, que reduce el tamaño a 634 MB manteniendo la calidad. Las pruebas integradas de Core ML reportan PSNR de 53,3 (codificador de audio) y 40,5 (decodificador de texto en float16) frente a PyTorch; para la variante de 4 bits, PSNR de 50,5 y 40 respectivamente frente al modelo PyTorch con paletización simulada. Todas las pruebas pasaron. Los ficheros `config.json` y `generation_config.json` se copian sin cambios del modelo original, y el tokenizador es el mismo que el de `openai/whisper-large-v3`.

## Capacidades

- Transcripción automática de voz en danés con puntuación y mayúsculas conservadas.
- Generación de marcas de tiempo a nivel de palabra gracias a las cabezas de alineación incluidas en ambos decodificadores.
- Ejecución local sobre Apple Neural Engine mediante WhisperKit, sin conexión a servicios externos.
- Procesamiento de audio en ventanas de 30 segundos, con manejo de grabaciones de mayor duración por segmentación.
- Dos perfiles de precisión/tamaño: 4 bits para dispositivos móviles y float16 para Mac.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo especializado exclusivamente en ASR.
- Capacidad multilingüe limitada al danés en este ajuste fino.

## Casos de uso

- Transcripción local en aplicaciones iOS y iPadOS: la variante de 634 MB está pensada para iPhone e iPad («Dansk hurtig» en Sagt), donde el tamaño reducido y la ejecución en el Neural Engine permiten transcribir sin enviar audio a la nube.
- Transcripción de alta precisión en macOS: la variante float16 de 1,63 GB («Dansk præcis» en Sagt) se usa en Mac, donde hay más memoria y cómputo disponibles para priorizar calidad sobre tamaño.
- Subtitulado y actas de reuniones: con marcas de tiempo por palabra, el modelo permite generar subtítulos sincronizados o actas con marcas temporales a partir de grabaciones en danés.
- Dictado por voz en herramientas de productividad: integrable en apps de escritura o edición que necesiten dictado en danés con procesamiento en el dispositivo y privacidad por diseño.
- Archivado y búsqueda de audio: transcripción por lotes de entrevistas, pódcast o archivos sonoros daneses para indexación y búsqueda textual posterior.
- Aplicaciones sanitarias o legales con requisitos de confidencialidad: al ejecutarse íntegramente en local, evita la transferencia de audio sensible a terceros, siempre que se valide la precisión en el dominio concreto.
- Prototipado rápido en Swift: el fragmento de uso con `WhisperKit.download` y `WhisperKit(...).transcribe(...)` permite integrar el modelo en un proyecto Apple con pocas líneas de código.

## Benchmarks y rendimiento

La model card incluye únicamente una verificación de extremo a extremo sobre un conjunto pequeño de clips sintéticos en danés (voz de macOS «Sara» y un diálogo de dos hablantes), medida con WhisperKit. El autor advierte que el habla sintética es mucho más fácil que las grabaciones reales y que estas cifras son solo una comprobación de cordura.

| Modelo | WER en clips sinteticos daneses |
|---|---|
| whisper-large-v3-turbo-danish-coreml (float16) | 7,8 % |
| whisper-large-v3-turbo-danish-coreml (4 bits) | 7,8 % |
| openai/whisper-large-v3 | 9,4 % |
| OpenAI large-v3 turbo comprimido (`large-v3-v20240930_626MB`) | 11,7 % |

Para evaluaciones reales (CoRal, FLEURS, Common Voice, FTSpeech) la model card remite a la ficha del modelo original. No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM: no aplica en el sentido tradicional; el modelo se ejecuta en el Apple Neural Engine y en memoria unificada. El repositorio ocupa 2,2 GB y las variantes pesan 634 MB (4 bits) y 1,63 GB (float16).
- GPU recomendadas: hardware Apple Silicon (serie M) para Mac; chips A-series y M-series en iPhone e iPad con Neural Engine.
- Cabe en hardware de consumo: sí, es precisamente su objetivo; la variante de 4 bits está diseñada para iPhone e iPad y la float16 para Mac.
- Opciones de despliegue: WhisperKit (Argmax) sobre Core ML; la conversión se generó con whisperkittools. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Selbyggen/whisper-large-v3-turbo-danish-coreml | no disponible | ventana de 30 s por segmento | da | MIT | Core ML / WhisperKit |
| thorhojhus/whisper-large-v3-turbo-danish (modelo base) | no disponible | ventana de 30 s por segmento | da | MIT | PyTorch / Transformers |
| openai/whisper-large-v3 | no disponible | ventana de 30 s por segmento | multilingue | MIT | PyTorch, Transformers, whisper.cpp |
| OpenAI large-v3 turbo comprimido (`large-v3-v20240930_626MB`) | no disponible | ventana de 30 s por segmento | multilingue | MIT | Core ML / WhisperKit |

La comparación relevante es de formato y despliegue: frente al modelo base en PyTorch, esta versión gana en ejecución local sobre Apple Silicon; frente a las variantes de OpenAI, ofrece mejor WER en la prueba sintética en danés (7,8 % frente a 9,4 % y 11,7 %), aunque la validación es limitada.

## Limitaciones y advertencias

- No es un modelo nuevo: cualquier limitación del ajuste fino original (sesgos del corpus danés, errores en acentos o dominios específicos) se hereda sin cambios.
- Los únicos datos de rendimiento publicados aquí provienen de habla sintética, más fácil que el habla real; no deben tomarse como estimación de producción.
- El modelo está especializado en danés; no debe esperarse un rendimiento multilingüe fiable.
- Riesgo de alucinación típico de Whisper en audio con ruido, silencios largos o habla solapada; conviene validar con datos reales del dominio.
- Dependencia del ecosistema Apple: el formato Core ML y WhisperKit limitan el despliegue a dispositivos Apple Silicon.
- La licencia MIT permite uso comercial, pero conviene conservar la atribución al autor del ajuste fino original (thorhojhus) y revisar los términos del modelo base.
- Las cifras de PSNR de las pruebas de conversión miden fidelidad numérica frente a PyTorch, no calidad de transcripción.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Selbyggen/whisper-large-v3-turbo-danish-coreml)
- [Modelo base: thorhojhus/whisper-large-v3-turbo-danish](https://huggingface.co/thorhojhus/whisper-large-v3-turbo-danish)
- [Perfil del autor del ajuste fino: thorhojhus](https://huggingface.co/thorhojhus)
- [WhisperKit (Argmax)](https://github.com/argmaxinc/WhisperKit)
- [whisperkittools](https://github.com/argmaxinc/whisperkittools)
- [Aplicación Sagt](https://sagtapp.com/da/)
- [openai/whisper-large-v3 (tokenizador)](https://huggingface.co/openai/whisper-large-v3)
