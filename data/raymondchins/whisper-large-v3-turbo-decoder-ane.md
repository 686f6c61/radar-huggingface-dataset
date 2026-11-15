# raymondchins/whisper-large-v3-turbo-decoder-ane

## Resumen

Whisper large-v3-turbo decoder ANE es una conversión a Core ML del decodificador de texto del modelo openai/whisper-large-v3-turbo, empaquetada como un único modelo stateful que se ejecuta en la Apple Neural Engine (ANE) del silicio de Apple. Lo publica raymondchins y fue creado originalmente para Speakey, una aplicación de dictado para macOS que descarga el modelo de forma automática. Los pesos son los originales de OpenAI en fp16 y no han sido reentrenados: se trata, por tanto, de una optimización de despliegue, no de un modelo nuevo.

El problema que resuelve es de eficiencia en inferencia. El decodificador de WhisperKit procesa un token por llamada, de modo que un prompt de vocabulario completo requiere una llamada por token. Esta conversión mantiene la caché KV dentro del estado de Core ML y lee hasta 64 tokens por llamada, lo que reduce drásticamente la latencia en el prefill y el coste energético por decodificación. Solo sustituye el decodificador: el encoder de audio, el espectrograma mel y el tokenizer siguen siendo los del build de WhisperKit de Argmax (`openai_whisper-large-v3-v20240930_turbo`), y el modelo se integra en WhisperKit como su `TextDecoding`.

Es relevante para desarrolladores que despliegan reconocimiento automático de voz (ASR) en Mac con Apple Silicon y quieren acelerar la fase de decodificación sin salir del ecosistema on-device. El repositorio ocupa 0,5 GB e incluye también una variante int8 para la variante pequeña de 547 MB de WhisperKit.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Whisper), 4 capas, convertido a Core ML stateful con funciones `cross`, `main` y `step` |
| Parametros totales | no disponible (el decodificador ocupa 343 MB en fp16; embeddings 51.866 x 1.280) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | hasta 224 tokens por pasada, prompt incluido (448 posiciones en la tabla de embeddings) |
| Tipos de cuantizacion | fp16 (principal); int8 en la variante `whisper-large-v3-turbo-decoder-ane-int8` |
| Idiomas soportados | no disponibles como lista; el modelo base Whisper large-v3-turbo es multilingue |
| Licencia | MIT (heredada de OpenAI) |
| Formato de pesos | Core ML (`decoder.mlmodelc`), embeddings en float16 crudo (`.f16`), metadatos en `speakey.json` |

## Arquitectura y entrenamiento

El modelo es el decodificador de texto de Whisper large-v3-turbo, un transformer de 4 capas con atención cruzada sobre la salida del encoder y atención self con caché KV. La conversión a Core ML reorganiza el cómputo para que la Neural Engine lo ejecute de forma nativa: todas las proyecciones se implementan como convoluciones 1x1 sobre tensores en formato channels-first, y las escrituras en caché se hacen mediante una matriz one-hot `place` en lugar de un slice dinámico, que caía a la CPU. La caché KV vive en un `MLState` compartido entre las tres funciones.

El flujo de ejecución tiene tres fases: `cross` recibe la salida del encoder `enc` (1, 1280, 1, 1500), escribe las claves y valores de atención cruzada de cada capa en el estado y limpia la caché de self-attention; se llama una vez por cada toma de audio. `main` procesa 64 filas a la vez: `x` (1, 1280, 1, 64) contiene embeddings de token sumados a los de posición, `place` (1, 1, 224, 64) y `placeT` indican en qué fila de caché escribe cada fila de entrada, `mask` (1, 1, 64, 224) es aditiva (0 o -1e4) y `sel` (1, 64, 1) selecciona la fila cuyos logits completos se devuelven como `logits_sel`. Las filas de padding tienen columna `place` a cero y no escriben nada. `step` hace lo mismo para un único token y devuelve `logits` (1, 51866).

No hay reentrenamiento ni ajuste fino: los pesos son los de OpenAI en fp16 tal cual. Tampoco se documentan datos de entrenamiento propios ni procesos de RLHF/DPO en esta conversión; toda la información de entrenamiento corresponde al modelo base original de OpenAI. La innovación técnica está, por tanto, en el batching del decodificador (64 tokens por llamada), la gestión de caché en estado Core ML y el diseño de layouts compatible con ANE.

## Capacidades

- Reconocimiento automático de voz (ASR) multilingüe, heredado del modelo base Whisper large-v3-turbo.
- Decodificación de texto por lotes de hasta 64 tokens por llamada, con selección de logits por fila mediante `sel`.
- Gestión de caché KV persistente entre llamadas a través de un `MLState` compartido.
- Ejecución on-device en Apple Neural Engine, con `computeUnits = .cpuAndNeuralEngine`.
- Integración como `TextDecoding` dentro de WhisperKit, sustituyendo solo el decodificador.
- Soporte de prompts de vocabulario largos (hasta 224 tokens por pasada, prompt incluido).
- Variante int8 disponible para el modelo pequeño de WhisperKit (547 MB).
- No incluye capacidades de visión, audio nativo más allá del pipeline ASR, tool calling ni agentes; es un componente de decodificación de texto dentro de un pipeline ASR.

## Casos de uso

- Dictado en macOS: es el caso para el que se creó, integrado en Speakey, donde descarga el modelo automáticamente y decodifica cada toma de audio con menor latencia y menor consumo energético.
- Transcripción on-device en aplicaciones Mac: sustituir el `TextDecoding` de WhisperKit por este decodificador para reducir el tiempo de prefill de prompts de vocabulario, que pasa de 708 ms a 16 ms en un M5 Max con 120 tokens.
- Procesamiento por lotes de audio en equipos Apple Silicon: al leer 64 tokens por llamada, se amortiza el coste por token y se acelera la decodificación de transcripciones largas.
- Aplicaciones con restricciones de privacidad: al ejecutarse en la Neural Engine sin salir del dispositivo, es adecuado para transcribir audio sensible sin enviarlo a servicios en la nube.
- Integración en pipelines de CI/CD para pruebas de ASR: permite comparar salidas contra WhisperKit con el mismo audio, ya que las palabras coinciden según la model card.
- Herramientas de accesibilidad y subtitulado en tiempo real: la menor latencia por token (3,0 ms frente a 6,1 ms) favorece escenarios interactivos en Mac.
- Investigación sobre despliegue Core ML: sirve como referencia para convertir decodificadores transformer a modelos stateful con caché KV en ANE.

## Benchmarks y rendimiento

Datos de la model card medidos en un M5 Max en caliente:

| Metrica | WhisperKit decoder | Este decoder |
|---|---|---|
| Tiempo por token | 6,1 ms | 3,0 ms |
| Prompt de 120 tokens | 708 ms | 16 ms |
| Energia por decodificacion | 1,22 J | 0,44 J |
| Toma completa en Speakey (12 tomas en indonesio e ingles, p50) | ~390 ms | ~345 ms |

La model card indica que las palabras coinciden con las de WhisperKit en el mismo audio y que ambos decodificadores están a una distancia similar de una referencia PyTorch en precisión completa. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, WER) en la información disponible.

## Requisitos de hardware

- Requiere macOS 15 o posterior (por el estado de Core ML) sobre Apple Silicon.
- VRAM equivalente: el decodificador ocupa 343 MB en fp16, más 133 MB de embeddings de token y 1,1 MB de embeddings de posición; el repositorio completo suma 0,5 GB.
- GPU/acceleradores: Apple Neural Engine de los chips M-series; no está pensado para GPU NVIDIA ni AMD.
- Cabe holgadamente en cualquier Mac con Apple Silicon; no aplica a GPUs de consumo tipo RTX 4090.
- Despliegue: Core ML con `MLModelConfiguration.functionName` en `cross`, `main` y `step`, `computeUnits = .cpuAndNeuralEngine`, un único estado creado con `makeState()` de `main` y mapeo en memoria de los ficheros de embeddings; integración vía WhisperKit.
- Latencia y throughput: 3,0 ms por token y 16 ms para un prompt de 120 tokens en M5 Max; no se dispone de datos para otros chips.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whisper-large-v3-turbo-decoder-ane (este) | no disponible (343 MB fp16) | 224 tokens por pasada | 3,0 ms/token, 16 ms prompt 120 tokens (M5 Max) | MIT | Hugging Face, Core ML |
| Decodificador de WhisperKit (argmaxinc/whisperkit-coreml) | no disponible | 1 token por llamada | 6,1 ms/token, 708 ms prompt 120 tokens (M5 Max) | MIT | Hugging Face, Core ML |
| openai/whisper-large-v3-turbo (referencia PyTorch) | no disponible | 448 posiciones | precision completa de referencia | MIT | Hugging Face, PyTorch |

## Limitaciones y advertencias

- Es solo el decodificador: necesita el encoder, el espectrograma mel y el tokenizer de WhisperKit (`openai_whisper-large-v3-v20240930_turbo`) para funcionar.
- Dependencia de plataforma: exclusivo de macOS 15+ sobre Apple Silicon; no ejecutable en Linux, Windows ni GPU no Apple.
- Límite de 224 tokens por pasada, prompt incluido, lo que restringe transcripciones que requieran prompts de vocabulario muy largos.
- No se documentan sesgos específicos de esta conversión; hereda los del modelo base Whisper de OpenAI.
- Riesgo de alucinación inherente a Whisper en audio ruidoso o silencioso; la model card no aporta métricas de WER que lo cuantifiquen.
- Idiomas soportados no listados en la información disponible; la cobertura multilingüe depende del modelo base.
- Licencia MIT, sin restricciones conocidas para uso comercial, pero conviene verificar las condiciones del modelo base de OpenAI.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria ni mantenimiento documentado.
- La variante int8 va dirigida a la variante pequeña de WhisperKit (547 MB), no al modelo principal.

## Enlaces

- Hugging Face: https://huggingface.co/raymondchins/whisper-large-v3-turbo-decoder-ane
- Variante int8: https://huggingface.co/raymondchins/whisper-large-v3-turbo-decoder-ane-int8
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Build de WhisperKit: https://huggingface.co/argmaxinc/whisperkit-coreml
- Aplicación Speakey: https://getspeakey.com
