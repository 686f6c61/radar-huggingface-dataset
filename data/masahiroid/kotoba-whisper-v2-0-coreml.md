# masahiroid/kotoba-whisper-v2.0-coreml

## Resumen

kotoba-whisper-v2.0-coreml es una conversion no oficial a Core ML del modelo de reconocimiento automatico del habla (ASR) kotoba-tech/kotoba-whisper-v2.0, especializado en japones y basado en la arquitectura Whisper. La conversion la mantiene el usuario masahiroid y su objetivo es permitir la inferencia directa en iOS y macOS a traves de Core ML y del Neural Engine, sin depender de PyTorch ni de frameworks externos en tiempo de ejecucion.

El modelo conserva la estructura encoder-decoder de Whisper: un encoder que transforma un espectrograma mel de 128×3000 (30 segundos de audio a 16 kHz mono) en estados ocultos, y un decoder autorregresivo que genera texto. La particularidad de esta conversion es que el decoder tiene solo 2 capas, un diseno muy poco profundo que permite prescindir de la cache KV y recalcular toda la secuencia en cada paso, con un coste asumible en el Neural Engine.

Es relevante porque empaqueta un modelo de ASR japones de calidad en un formato listo para produccion en el ecosistema Apple (ficheros `.mlpackage` de encoder y decoder por separado, en fp16), algo que no ofrece la distribucion original en PyTorch/safetensors. El autor verifica que la secuencia de tokens generada coincide exactamente con la de `model.generate()` de Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper); encoder de audio y decoder autorregresivo de 2 capas, sin cache KV |
| Parametros totales | no disponible (los ficheros fp16 suman aproximadamente 1,65 GB: encoder ~1,2 GB y cada decoder ~227 MB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | Ventana de audio fija de 30 s (mel de 128×3000); salida limitada a 64 o 128 tokens segun el fichero de decoder elegido |
| Tipos de cuantizacion | fp16 (Core ML `.mlpackage`); no se distribuyen otras precisiones |
| Idiomas soportados | japones (ja) |
| Licencia | apache-2.0 |
| Formato de pesos | Core ML (`.mlpackage`, fp16) |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper: un encoder que procesa el espectrograma mel y un decoder que genera tokens de forma autorregresiva condicionada por los estados del encoder. En esta conversion el decoder se ha reducido a 2 capas, lo que lo hace muy poco profundo; por ese motivo el autor opta por no usar cache KV y recalcular la secuencia completa en cada paso de decodificacion, una decision que simplifica el grafo y resulta practica en el Neural Engine. La decodificacion es voraz (greedy) y requiere anteponer un prefijo forzado con los tokens especiales de Whisper: `50258` (inicio), `50266` (`<|ja|>`), `50360` (`<|transcribe|>`) y `50364` (`<|notimestamps|>`).

Los detalles de entrenamiento del modelo original (numero de tokens, composicion del dataset, si hubo RLHF/DPO) no estan disponibles en la informacion proporcionada; corresponden a Kotoba Technologies, autora de kotoba-whisper-v2.0. Esta conversion es un trabajo de la comunidad y no una publicacion oficial. La unica validacion tecnica documentada es la equivalencia token a token entre la salida de la conversion Core ML y la de `model.generate()` de Transformers, siempre que el prefijo forzado se construya correctamente.

## Capacidades

- Reconocimiento automatico del habla en japones a partir de audio de 16 kHz mono.
- Generacion de transcripciones en texto plano mediante decodificacion voraz.
- Ejecucion en dispositivo (on-device) sobre iOS y macOS mediante Core ML y Neural Engine.
- Encoder con entrada de forma fija: espectrograma mel de 128 dimensiones y 3000 frames (30 segundos).
- Dos variantes de decoder segun la longitud esperada de la salida: 64 tokens para enunciados cortos y 128 tokens para enunciados mas largos.
- Empaquetado modular en tres ficheros `.mlpackage` (encoder, decoder seq64 y decoder seq128) que se pueden cargar por separado.
- No soporta tool calling ni function calling.
- No implementa agentes ni razonamiento multi-paso.
- No es multilingue: solo japones.
- No genera marcas de tiempo, ya que el prefijo fuerza el token `<|notimestamps|>`.

## Casos de uso

- Transcripcion de voz a texto en aplicaciones iOS: el modelo se integra como `.mlpackage` y aprovecha el Neural Engine para transcribir dictado o notas de voz en japones sin enviar audio a la nube.
- Subtitulado de audio corto en macOS: con la ventana fija de 30 segundos y el decoder de 128 tokens se pueden generar subtitulos de fragmentos de audio troceados previamente.
- Asistentes de voz locales para japones: la inferencia on-device permite construir interfaces conversacionales o de comandos que funcionan sin conexion.
- Herramientas de accesibilidad: transcripcion en tiempo real de conversaciones para personas con discapacidad auditiva en apps de Apple.
- Procesamiento por lotes en Mac: transcripcion de archivos de audio en pipelines locales, aprovechando que no se requiere PyTorch ni GPU dedicada.
- Investigacion en ASR japones: la conversion sirve como referencia para comparar la fidelidad de una implementacion Core ML frente a la de Transformers sobre el mismo audio.
- Prototipado rapido en Xcode: al ser ficheros Core ML, se pueden arrastrar directamente a un proyecto y probar en simulador o dispositivo.
- Aplicaciones de privacidad estricta: al no requerir servicios externos, el audio nunca abandona el dispositivo, lo que facilita el cumplimiento de normativas de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente documenta una verificacion de equivalencia funcional: la secuencia de tokens obtenida con la conversion Core ML coincide exactamente con la generada por `model.generate()` de Transformers cuando se aplica el prefijo forzado correcto. No se aportan cifras de WER, latencia ni throughput.

## Requisitos de hardware

- Peso de los ficheros en fp16: encoder aproximadamente 1,2 GB y cada decoder aproximadamente 227 MB; en total alrededor de 1,65 GB si se conservan ambos decoders.
- Memoria necesaria: los pesos mas las activaciones; al ejecutarse sobre Apple Silicon y Neural Engine, el modelo utiliza memoria unificada, por lo que no hay una cifra de VRAM dedicada.
- Hardware recomendado: dispositivos Apple con Neural Engine, es decir, iPhone y iPad con chip A14 o posterior, y Mac con Apple Silicon (familia M).
- No esta pensado para GPU NVIDIA; no se distribuyen pesos GGUF, safetensors ni variantes para CUDA.
- Opciones de despliegue: Core ML en iOS y macOS (Xcode, `.mlpackage`); no se contemplan vLLM, llama.cpp, Ollama ni TGI, que no ejecutan este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada; el autor solo indica que el diseno sin cache KV ofrece una velocidad practica en el Neural Engine.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idioma | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| masahiroid/kotoba-whisper-v2.0-coreml | no disponible (ficheros fp16 ~1,65 GB) | 30 s; salida de 64 o 128 tokens | japones | apache-2.0 | Core ML (.mlpackage, fp16) | Conversion no oficial de la comunidad |
| kotoba-tech/kotoba-whisper-v2.0 | no disponible en la informacion proporcionada | 30 s | japones | apache-2.0 | safetensors / PyTorch | Modelo original de Kotoba Technologies |
| openai/whisper-large-v3 | 1,55 B | 30 s | multilingue | apache-2.0 | safetensors / PyTorch | Modelo oficial de OpenAI |
| Implementaciones Core ML de Whisper (por ejemplo WhisperKit) | depende del tamano elegido | 30 s | multilingue | variable | Core ML | Proyectos de comunidad |

La comparacion cuantitativa de calidad (WER) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Conversion no oficial: no cuenta con soporte de Kotoba Technologies y puede quedar desactualizada respecto al modelo original.
- Solo japones: no transcribe ni traduce otros idiomas.
- Sin marcas de tiempo: el prefijo forzado incluye `<|notimestamps|>`, por lo que la salida no incluye timestamps.
- Ventana fija de 30 segundos: los audios mas largos deben trocearse y gestionarse por separado.
- Salida truncada: el decoder esta limitado a 64 o 128 tokens, lo que puede cortar transcripciones de enunciados largos.
- Decodificacion exclusivamente voraz: no se documenta busqueda por haz, temperatura ni umbrales de no-speech.
- Sin cache KV: cada paso de decodificacion recalcula la secuencia completa, lo que penaliza el coste frente a implementaciones con cache.
- Riesgo de alucinacion propio de los modelos Whisper en audio con ruido, silencio o dominio muy distinto al de entrenamiento; no se documentan mitigaciones.
- Sesgos: no se documenta ningun analisis de sesgos del modelo original ni de la conversion.
- Licencia apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base y mantener la atribucion a Kotoba Technologies.
- Para produccion en Apple conviene validar el WER sobre el dominio concreto, ya que no hay benchmarks publicados de esta conversion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/masahiroid/kotoba-whisper-v2.0-coreml
- Modelo base (kotoba-whisper-v2.0): https://huggingface.co/kotoba-tech/kotoba-whisper-v2.0
- La busqueda web realizada no devolvio enlaces relevantes para este modelo.
