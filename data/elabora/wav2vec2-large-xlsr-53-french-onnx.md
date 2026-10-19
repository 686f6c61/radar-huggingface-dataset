# elabora/wav2vec2-large-xlsr-53-french-onnx

## Resumen

Este repositorio no es un modelo nuevo: es un espejo sin modificar del fichero ONNX int8 de `XDcobra/wav2vec2-large-xlsr-53-french-ONNX`, mantenido por Elabora para fijar los bytes exactos que su herramienta de autoría descarga y verifica por SHA-256. El modelo subyacente es un wav2vec 2.0 large XLSR-53 fine-tuneado para reconocimiento de voz en francés por Jonatas Grosman sobre `facebook/wav2vec2-large-xlsr-53`, con cabeza CTC y licencia Apache-2.0. El espejo solo copia `onnx/model_int8.onnx`, de 355.034.715 bytes, y no incluye los grafos fp32/fp16 ni la configuración del repositorio original.

El problema que resuelve es de reproducibilidad y disponibilidad: el repositorio upstream pertenece a un particular y podría renombrarse o eliminarse. Elabora conserva una copia byte a byte de la revisión probada y publica el SHA-256 para que cualquiera pueda comprobarla. Además, documenta su uso principal: alinear palabras de una narración con el texto conocido mediante una búsqueda de Viterbi sobre los logits CTC.

Técnicamente es un modelo de voz, no un LLM: recibe audio float32 de 16 kHz mono, normalizado a media cero y varianza unitaria, y devuelve logits CTC con una trama cada 20 ms. Su interés ahora es práctico para aplicaciones de subtitulado, alineación forzada y transcripción francesa que necesiten ejecución local con ONNX Runtime y un fichero pequeño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 large XLSR-53 con cabeza CTC, fine-tuneado para ASR en francés |
| Parámetros totales | no disponible en la información proporcionada; la ficha no declara una cifra verificable |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica como contexto de tokens; acepta audio de longitud variable y genera una trama cada 20 ms |
| Tipos de cuantización | int8 dinámica (QUInt8) en el fichero espejado; el repositorio upstream también ofrece fp32 y fp16, no espejados |
| Idiomas soportados | francés (`fr`); no se documenta multilingüismo en el fine-tune |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`onnx/model_int8.onnx`); no se incluyen safetensors ni GGUF |
| Tarea | reconocimiento automático de voz y alineación forzada |
| Entrada | `input_values`, float32 `[1, samples]`, 16 kHz mono, media cero y varianza unitaria |
| Salida | `logits`, `[1, frames, vocabulary]`; una trama cada 20 ms |
| Tamaño del fichero | 355.034.715 bytes |
| SHA-256 del fichero espejado | `fbe07a90dcb44f768f42d8eaed0154b5a2d44b9ee31bff40cf3234cadcfc2f88` |
| Tamaño del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

El modelo base es `facebook/wav2vec2-large-xlsr-53`, una representación auto-supervisada de audio preentrenada sobre 53 idiomas. Jonatas Grosman lo fine-tuneó para francés con las particiones de entrenamiento y validación de Mozilla Common Voice 6.1, usando una cabeza CTC y créditos de GPU de OVHcloud. El resultado es un sistema ASR que produce distribuciones por carácter o subunidad sobre tramas de 20 ms, no un modelo generativo de texto.

XDcobra exportó ese fine-tune a ONNX con `optimum-cli export onnx` y aplicó cuantización dinámica de pesos a 8 bits con ONNX Runtime (`QUInt8`). Elabora no convirtió, reentrenó ni recomprimió nada: copia el fichero de XDcobra en la revisión `feb7081bd901fc393812dddd9b0768ae05f730bf` y añade su propia licencia y model card. Para la alineación forzada, Elabora ejecuta el modelo sobre la narración y busca con Viterbi dónde se pronuncian las palabras del texto conocido; en sus pruebas con voces sintéticas, el inicio de palabra se localiza con un error mediano de 22 ms.

## Capacidades

- Reconocimiento automático de voz en francés con salida CTC; requiere un `vocab.json` compatible para decodificar los logits.
- Alineación forzada palabra-audio: no es una capacidad separada del modelo, sino el uso de los logits CTC con una transcripción conocida y una búsqueda de Viterbi.
- Resolución temporal de 20 ms por trama, adecuada para obtener tiempos de palabra y sincronizar subtítulos o resaltado de texto.
- Ejecución local con ONNX Runtime sobre el fichero int8 de 355 MB; no necesita GPU para funcionar.
- Entrada de audio variable en duración, con preprocesado estricto a 16 kHz mono, media cero y varianza unitaria.
- No es un modelo generativo: no mantiene conversaciones, no sigue instrucciones abiertas y no tiene modo de razonamiento.
- No soporta tool calling, function calling ni flujos de agentes.
- No es multilingüe en este fine-tune: está entrenado para francés.
- No incluye visión, audio clasificación, diarización ni traducción.
- No se documenta puntuación, uso de mayúsculas ni normalización ortográfica en la salida.

## Casos de uso

- Alineación palabra-audio en módulos de e-learning: Elabora ejecuta el modelo sobre la narración y usa Viterbi con el texto conocido para obtener el inicio de cada palabra; con un error mediano de 22 ms en voces sintéticas, sirve para resaltar el texto sincronizado mientras se reproduce el audio.
- Subtitulado francés con tiempos finos: los logits CTC cada 20 ms permiten derivar tiempos de palabra para subtítulos o karaoke. Es adecuado cuando se parte de una transcripción fiable y se quiere sincronizar, no cuando se necesita puntuación automática.
- Transcripción de clases, entrevistas o notas de voz en francés: decodificación CTC con el vocabulario correspondiente sobre audio limpio de 16 kHz. Para audios largos habrá que segmentar y gestionar la memoria del runtime.
- Anotación y control de calidad de corpus ASR: alinear transcripciones existentes contra el audio para detectar desajustes, palabras omitidas o segmentos mal transcritos antes de publicar un corpus.
- Verificación de narraciones TTS: comparar la posición real de las palabras en una voz sintética con el guion previsto; Elabora lo usa para comprobar que la narración generada respeta el texto.
- Procesamiento offline en aplicaciones de autoría: el fichero ONNX int8 se descarga al ordenador del autor y se verifica por SHA-256, lo que permite transcribir o alinear sin enviar audio a un servicio en la nube.
- Localización de contenido audiovisual: alinear un guion francés con su audio para generar subtítulos, doblaje o marcas de tiempo de palabra en un pipeline de postproducción.
- Investigación sobre timing del habla: estudiar la duración y el inicio de palabras en francés a partir de las tramas CTC, con la cautela de que el modelo está optimizado para ASR y no para análisis fonético fino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay WER sobre Common Voice 6.1, MMLU, HumanEval ni GSM8K en la documentación proporcionada; MMLU, HumanEval y GSM8K no aplican a un modelo ASR.

| Métrica operativa | Resultado | Condiciones |
|---|---:|---|
| Error mediano en el inicio de palabra | 22 ms | pruebas de Elabora con voces sintéticas y alineación forzada |
| Concordancia con el export propio de Elabora | 98 % de las palabras | corpus de prueba de Elabora; el resto difiere en una trama |
| Periodo de trama de salida | 20 ms | salida CTC del modelo |
| WER en francés | no disponible | no publicado en la información proporcionada |
| Throughput o latencia extremo a extremo | no disponible | no se publica RTF ni latencia medida |

## Requisitos de hardware

- Pesos: 355.034.715 bytes, aproximadamente 339 MiB o 0,34 GiB para el fichero int8. El repositorio completo ocupa 0,4 GB.
- VRAM estimada: no medida. Los pesos caben holgadamente en menos de 1 GB; con activaciones y runtime, un clip corto debería manejarse por debajo de 1-2 GB, pero es una estimación prudente no verificada.
- CPU: viable con ONNX Runtime en CPU; no es necesario disponer de GPU para inferencia puntual o alineación de narraciones cortas.
- GPU recomendadas: cualquier GPU CUDA con al menos 2 GB; una RTX 3060 o RTX 4090 es suficiente. Una A100 o H100 está sobredimensionada para un fichero de este tamaño.
- Cabe en GPU consumer: sí, en cualquier GPU consumer con memoria suficiente; no se ha medido el rendimiento exacto por modelo.
- Despliegue: ONNX Runtime es la vía directa; XDcobra publica el export en el contexto de `react-native-sherpa-onnx`, y Elabora lo integra en su herramienta local. No aplican vLLM, TGI, llama.cpp ni Ollama, porque no es un LLM ni un fichero GGUF.
- Latencia y throughput: no disponibles. La salida tiene una trama cada 20 ms, pero no se publica factor de tiempo real ni latencia de extremo a extremo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto o entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `elabora/wav2vec2-large-xlsr-53-french-onnx` | no disponible | audio variable; tramas de 20 ms | sin WER publicado; error mediano de 22 ms en alineación con voces sintéticas | Apache-2.0 | Hugging Face; solo `model_int8.onnx` |
| `XDcobra/wav2vec2-large-xlsr-53-french-ONNX` | no disponible | audio variable; tramas de 20 ms | sin WER publicado en la información | Apache-2.0 | Hugging Face; fp32, fp16 e int8 |
| `jonatasgrosman/wav2vec2-large-xlsr-53-french` | no disponible | audio variable; tramas de 20 ms | sin WER publicado en la información | Apache-2.0 | Hugging Face; pesos PyTorch |
| `facebook/wav2vec2-large-xlsr-53` | no disponible | audio variable; representaciones auto-supervisadas | no es un ASR francés listo para uso; requiere fine-tune | Apache-2.0 | Hugging Face; pesos PyTorch |

La comparación relevante es de formato y disponibilidad, no de precisión: el espejo de Elabora fija un único fichero int8 verificable; XDcobra ofrece más variantes; Jonatas Grosman es el fine-tune original; y Facebook es el modelo base multilingüe, no un sistema ASR francés directamente utilizable.

## Limitaciones y advertencias

- Solo francés: no se debe usar como ASR multilingüe ni para otros idiomas sin un fine-tune específico.
- No es un LLM: no genera respuestas abiertas, no razona en varios pasos, no soporta tool calling ni agentes.
- No se publica WER ni una evaluación estándar de precisión; el dato de 22 ms corresponde a alineación forzada con voces sintéticas, no a transcripción general.
- La cuantización int8 puede introducir diferencias frente al modelo fp32; no se documenta una comparación sistemática de calidad.
- El preprocesado es estricto: audio a 16 kHz mono, media cero y varianza unitaria. Un remuestreo o una normalización incorrectos degradan la salida.
- La alineación forzada necesita una transcripción conocida; si el texto no coincide con el audio, Viterbi puede colocar mal las palabras.
- No se documentan puntuación, mayúsculas, diarización ni marcas de tiempo de palabra listas para usar; los tiempos se derivan de las tramas CTC.
- No se documentan análisis de sesgos por acento, edad, género o calidad de micrófono. Al provenir de Common Voice 6.1, hereda las limitaciones de cobertura de esa colección.
- El espejo no está mantenido por el autor original y solo contiene `model_int8.onnx`; para usarlo hay que aportar el `vocab.json` y el preprocesado. Verificar siempre el SHA-256 antes de ejecutarlo.
- La licencia Apache-2.0 permite uso comercial, pero exige conservar la licencia y las atribuciones; el repositorio upstream no incluye fichero `NOTICE`.
- En producción, conviene segmentar audios largos y controlar la memoria del runtime; no se documenta una duración máxima de audio.

## Enlaces

- [Ficha espejo en Hugging Face](https://huggingface.co/elabora/wav2vec2-large-xlsr-53-french-onnx)
- [Repositorio upstream de XDcobra](https://huggingface.co/XDcobra/wav2vec2-large-xlsr-53-french-ONNX)
- [Modelo original de Jonatas Grosman](https://huggingface.co/jonatasgrosman/wav2vec2-large-xlsr-53-french)
- [Modelo base de Facebook AI](https://huggingface.co/facebook/wav2vec2-large-xlsr-53)
- [Vocabulario en el repositorio de Elabora](https://huggingface.co/elabora/wav2vec2-large-xlsr-53-french)
- [Script de exportación de XDcobra en react-native-sherpa-onnx](https://github.com/XDcobra/react-native-sherpa-onnx)
- [Elabora](https://elabora.studio)
- [Licencia Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0)
- [Ficha de terceros en aibase](https://model.aibase.com/models/details/1915693334624100353)
- [Ficha de terceros en aimodels.fyi sobre el modelo base](https://www.aimodels.fyi/models/huggingFace/wav2vec2-large-xlsr-53-facebook)
