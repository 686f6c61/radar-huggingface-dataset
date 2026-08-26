# aoiandroid/breeze-asr-25-whisperkit-coreml-macos

## Resumen

Breeze-ASR-25 es un modelo de reconocimiento automático de voz (ASR) desarrollado por MediaTek Research, fine-tuned a partir de Whisper-large-v2 y optimizado para mandarín taiwanés y escenarios de code-switching entre mandarín e inglés, incluyendo alternancia intrafrasal e interfrasal. Este repositorio concreto (`aoiandroid/breeze-asr-25-whisperkit-coreml-macos`) contiene los paquetes Core ML compilados para la plataforma macOS, pensados para su integración en la aplicación TranslateBlue mediante WhisperKit.

La relevancia de este modelo radica en que permite ejecutar inferencia ASR completamente en el dispositivo (on-device) en hardware Apple Silicon, aprovechando la aceleración del Neural Engine (ANE) y evitando la dependencia de servicios en la nube. El repositorio incluye los bundles compilados en formato `.mlmodelc`, con la especialización ANE dejada como local al dispositivo, lo que implica que la compilación final se completa en el equipo del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper-large-v2 (transformer encoder-decoder) fine-tuned |
| Parametros totales | no disponible (base Whisper-large-v2: aproximadamente 1550 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (compilado a Core ML, cuantización interna no documentada) |
| Idiomas soportados | mandar taiwan, ingles (code-switching) |
| Licencia | MIT |
| Formato de pesos | Core ML (`.mlmodelc`, compilado desde `.mlpackage`) |

## Arquitectura y entrenamiento

El modelo base es Whisper-large-v2, un transformer encoder-decoder de aproximadamente 1550 millones de parametros entrenado por OpenAI para ASR multilingue. Breeze-ASR-25 se fine-tunea sobre esta base con un enfoque específico en mandarín taiwan y en escenarios de code-switching mandar-ingles. La innovación principal del modelo es el uso de un "unified mix embedding" para la decodificación, que optimiza la alternancia de codigos tanto intrafrasal como interfrasal, un reto comun en conversaciones reales en Taiwan. Ademas, se ha mejorado la alineacion temporal, lo que lo hace adecuado para subtitulacion automatica.

Los detalles exactos del dataset de entrenamiento, el numero de tokens y los procedimientos de alineacion no se han publicado en la informacion disponible. Este repositorio especifico no contiene los pesos originales, sino los bundles Core ML compilados para macOS, lo que implica una conversion desde el formato PyTorch original a Core ML mediante la herramienta de WhisperKit.

## Capacidades

- Reconocimiento de voz automatico (ASR) para mandarin taiwan con soporte de code-switching mandarin-ingles.
- Transcripcion de audio con alineacion temporal mejorada, apta para generacion de subtitulos.
- Inferencia en el dispositivo (on-device) en macOS con Apple Silicon, sin conexion a internet.
- Integracion con WhisperKit para despliegue local via CLI o API.
- Compatible con la aplicacion TranslateBlue para traduccion y transcripcion.
- No soporta tool calling, agentes ni razonamiento multi-step, ya que es un modelo ASR puro.

## Casos de uso

- Transcripcion de reuniones en mandarin taiwan con alternancia al ingles: el modelo maneja el code-switching intrafrasal, lo que es habitual en entornos corporativos de Taiwan, y genera transcripciones con timestamps.
- Subtitulacion automatica de videos: la alineacion temporal mejorada permite generar subtitulos sincronizados para contenido audiovisual en mandarin-ingles.
- Asistente de traduccion en tiempo real integrado en TranslateBlue: el bundle Core ML se ejecuta localmente, reduciendo latencia y garantizando privacidad de los datos de audio.
- Transcripcion de entrevistas y podcast: con la CLI de WhisperKit se puede transcribir archivos de audio de forma offline en un Mac.
- Accesibilidad para personas con discapacidad auditiva: la transcripcion en tiempo real de conversaciones mixtas mandarin-ingles puede alimentar sistemas de subtitulado en vivo.
- Desarrollo de aplicaciones de dictado para taiwan: los desarrolladores pueden integrar el modelo en apps de macOS mediante WhisperKit, ofreciendo entrada de voz con soporte de codigo mezclado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de rendimiento (WER, CER, latencia) ni comparaciones con otros modelos ASR. Se recomienda consultar el repositorio original de Breeze-ASR-25 en GitHub para datos de evaluacion, si estan disponibles.

## Requisitos de hardware

- VRAM estimada: no disponible, pero al ser un modelo compilado a Core ML para Apple Silicon, la memoria utilizada depende del modelo (unos 1.1 GB de peso en disco) y del runtime de WhisperKit.
- GPU recomendadas: Apple Silicon (M1, M2, M3 o superior). El modelo se ejecuta en el Neural Engine (ANE) o en la GPU integrada del SoC.
- Compatibilidad con GPU de consumo: no es compatible con GPUs NVIDIA o AMD; esta restringido a macOS con Apple Silicon.
- Opciones de despliegue: WhisperKit (CLI via Homebrew, Swift API), o integracion directa en aplicaciones macOS mediante Core ML.
- Latencia y throughput: no disponibles; dependen del chip concreto (por ejemplo, un M1 Max tendra mayor rendimiento que un M1).

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|---|
| Breeze-ASR-25 (este repo) | Whisper-large-v2 fine-tuned | ~1.5B | no disponible | zh-TW, en | MIT | Core ML (.mlmodelc) |
| Whisper-large-v3 (OpenAI) | Transformer encoder-decoder | ~1.5B | 30 segundos de audio | 99 idiomas | MIT | PyTorch, GGUF, Core ML |
| WhisperKit (Apple) | Whisper-large-v3 | ~1.5B | 30 segundos | 99 idiomas | MIT | Core ML |

La principal diferencia de Breeze-ASR-25 frente a Whisper-large-v2 es la optimizacion especifica para mandarin taiwan y code-switching, que Whisper estandar no cubre con la misma precision. Whisper-large-v3 ofrece mejor rendimiento general multilingue pero no esta especializado en code-switching mandarin-ingles. La licencia MIT en todos los casos permite uso comercial.

## Limitaciones y advertencias

- El modelo esta optimizado para mandarin taiwan y code-switching con ingles; su rendimiento en otros dialectos de mandarin (por ejemplo, mandarin de China continental) o en otros idiomas puede ser significativamente inferior.
- No se han publicado datos de sesgos o alucinaciones especificos, pero al ser un modelo ASR basado en Whisper, puede presentar errores en entornos con ruido, acentos muy marcados o habla solapada.
- La alineacion temporal, aunque mejorada, no es perfecta y puede desviarse en audio con silencios largos o musica de fondo.
- El formato Core ML compilado esta restringido a macOS; no se puede ejecutar en Linux, Windows o moviles (existe un repositorio hermano para iOS).
- La especializacion ANE se realiza localmente en el dispositivo, lo que implica un proceso de compilacion adicional en el primer uso que puede consumir tiempo y recursos.
- La licencia MIT permite uso comercial sin restricciones, pero no se incluye ninguna garantia de soporte por parte de MediaTek Research.
- El modelo no soporta tareas fuera del ASR (no generacion de texto libre, no tool calling, no agentes).

## Enlaces

- Repositorio de HuggingFace de este modelo: https://huggingface.co/aoiandroid/breeze-asr-25-whisperkit-coreml-macos
- Repositorio fuente de HuggingFace (Core ML sin compilar): https://huggingface.co/aoiandroid/breeze-asr-25-whisperkit-coreml
- Repositorio Core ML para iOS: https://huggingface.co/aoiandroid/breeze-asr-25-whisperkit-coreml-ios
- Repositorio original de Breeze-ASR-25 en GitHub: https://github.com/mtkresearch/Breeze-ASR-25
- Documentacion de instalacion (DeepWiki): https://deepwiki.com/mtkresearch/Breeze-ASR-25/2.1-installation
- Guia de inicio rapido (DeepWiki): https://deepwiki.com/mtkresearch/Breeze-ASR-25/2-getting-started
