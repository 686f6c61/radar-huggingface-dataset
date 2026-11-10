# RedHotAnton/whisperkit-coreml

## Resumen

WhisperKit es un conjunto de pesos del modelo Whisper de OpenAI convertidos al formato CoreML y cuantizados para su ejecución eficiente en hardware de Apple Silicon (chips M1, M2, M3, M4 y sus variantes Pro, Max y Ultra). El repositorio, publicado por el usuario RedHotAnton bajo el paraguas del proyecto WhisperKit de Argmax, empaqueta los distintos tamanos de Whisper (tiny, base, small, medium y large) en variantes CoreML optimizadas para inferencia on-device en macOS e iOS.

El modelo resuelve el problema de la transcripción automática de voz (ASR) en dispositivos Apple sin depender de servicios en la nube, lo que resulta relevante para aplicaciones que requieren privacidad, baja latencia o funcionamiento offline. La conversion a CoreML permite aprovechar la Neural Engine y la GPU integrada de los chips de Apple, y la cuantizacion reduce el peso de los pesos para que quepan en memoria unificada de dispositivos consumer.

El repositorio ocupa 28 GB, lo que refleja que contiene multiples variantes de tamano y cuantizacion del modelo Whisper original. La licencia es MIT, lo que facilita su uso comercial y su integracion en productos derivados. No se dispone de informacion detallada sobre la composicion exacta de variantes incluidas en este repositorio concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper de OpenAI), convertido a CoreML |
| Parametros totales | no disponible (depende de la variante: Whisper tiny a large) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | cuantizado (el tag indica "quantized"); niveles concretos no disponibles |
| Idiomas soportados | no disponible (Whisper original soporta multilingue, pero no se detalla en la informacion) |
| Licencia | MIT |
| Formato de pesos | CoreML (.mlmodelc / .mlpackage) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper, un modelo transformer encoder-decoder entrenado por OpenAI para reconocimiento automatico de voz. Whisper se entrena con pares audio-texto a gran escala y utiliza un vocabulario de tokens multilingue, con capacidad de transcripcion y traduccion. El encoder procesa espectrogramas Mel de ventanas de 30 segundos y el decoder genera la secuencia de texto de forma autoregresiva.

En este repositorio, los pesos originales de Whisper se han convertido al formato CoreML y se han cuantizado para reducir su huella de memoria y acelerar la inferencia en Apple Silicon. El proyecto WhisperKit de Argmax (referenciado en la model card) implementa la infraestructura de conversion, tokenizacion y decodificacion en Swift, y ha sido presentado en ICML 2025. No se dispone de informacion sobre el proceso exacto de cuantizacion, el numero de tokens de entrenamiento adicionales ni si hubo ajuste fino posterior a la conversion.

## Capacidades

- Transcripcion automatica de voz (ASR) a texto.
- Ejecucion on-device en Apple Silicon mediante CoreML, sin necesidad de conexion a internet.
- Aprovechamiento de la Neural Engine y la GPU integrada de los chips M-series.
- Multiples variantes de tamano y cuantizacion para adaptarse a distintos presupuestos de memoria y latencia.
- Integracion con el SDK WhisperKit de Argmax para Swift (macOS e iOS).
- Capacidad multilingue heredada de Whisper (no confirmada en la informacion disponible para este repositorio concreto).
- No se documenta soporte de tool calling, agentes, vision ni audio mas alla del ASR.

## Casos de uso

- Transcripcion de reuniones en macOS: la variante cuantizada de Whisper medium o large puede ejecutarse en un Mac con chip M-series para transcribir audio de reuniones localmente, sin enviar datos a la nube, aprovechando la Neural Engine para reducir latencia.
- Subtitulado automatico en apps de video para iOS: el modelo puede integrarse en una app Swift mediante WhisperKit para generar subtitulos en tiempo casi real sobre el audio capturado por el microfono o cargado desde la libreria.
- Dictado por voz en aplicaciones de productividad: la variante tiny o base, al ser mas ligera, permite dictado continuo en iPhone o iPad con bajo consumo de bateria y sin conexion.
- Analisis de llamadas de atencion al cliente con requisitos de privacidad: al ejecutarse on-device, el audio no sale del dispositivo, lo que facilita el cumplimiento de normativas de proteccion de datos.
- Investigacion en ASR sobre hardware Apple: el repositorio permite a investigadores evaluar el rendimiento de distintas variantes cuantizadas de Whisper en Apple Silicon sin necesidad de reentrenar ni reconvertir los pesos.
- Prototipado rapido de funcionalidades de voz en apps Swift: el SDK WhisperKit y estos pesos permiten a desarrolladores integrar ASR en pocas lineas de codigo y comparar variantes de tamano segun latencia y precision.
- Transcripcion offline en entornos sin conectividad: aplicaciones de campo, periodismo o educacion en zonas sin red pueden beneficiarse de la inferencia local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta; depende de la variante. Como referencia, Whisper large en FP16 ronda los 3 GB de pesos, y las variantes cuantizadas reducen esta cifra, pero no se detalla en el repositorio.
- GPU recomendadas: chips Apple M1, M2, M3 y M4 (y variantes Pro, Max, Ultra) con Neural Engine. No aplica a GPU NVIDIA o AMD, ya que el formato es CoreML.
- Cabe en consumer hardware: si, en equipos Apple Silicon; el modelo esta disenado especificamente para ello.
- Opciones de despliegue: SDK WhisperKit (Swift), CoreML en macOS e iOS. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a LLMs y formatos distintos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WhisperKit (este repo) | no disponible (varias variantes) | ventanas de 30 s de audio | CoreML cuantizado | MIT | Hugging Face |
| Whisper original (OpenAI) | 39M a 1550M segun variante | ventanas de 30 s de audio | PyTorch / safetensors | MIT | Hugging Face, GitHub |
| whisper.cpp | mismos pesos que Whisper | ventanas de 30 s de audio | GGML | MIT | GitHub |
| faster-whisper | mismos pesos que Whisper | ventanas de 30 s de audio | CTranslate2 | MIT | GitHub |

La comparativa se limita a la familia Whisper porque no se dispone de datos de rendimiento de este repositorio frente a alternativas no-Whisper. La diferencia principal de WhisperKit frente a whisper.cpp o faster-whisper es el backend: CoreML para Apple Silicon frente a GGML o CTranslate2, respectivamente.

## Limitaciones y advertencias

- No se dispone de informacion sobre sesgos especificos de esta conversion; los sesgos heredados de Whisper original (por ejemplo, en acentos y variedades dialectales) son aplicables.
- Riesgo de alucinacion en pasajes de audio con ruido, silencios largos o musica, comun en modelos Whisper.
- La longitud de contexto esta limitada a ventanas de audio de 30 segundos por segmento; para audio largo se requiere segmentacion y gestion de estado.
- Compatibilidad restringida a hardware Apple Silicon; no es desplegable en GPU NVIDIA, AMD ni en CPU x86 de forma directa.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en 2026; no hay evidencia de validacion por parte de la comunidad ni de mantenimiento activo.
- No se detalla que variantes de Whisper ni que niveles de cuantizacion contiene el repositorio, lo que dificulta la seleccion sin inspeccionar los archivos.
- La licencia MIT permite uso comercial, pero conviene verificar la procedencia de los pesos originales de Whisper y las condiciones de la conversion.
- El tamano del repositorio (28 GB) implica una descarga considerable y espacio en disco relevante.

## Enlaces

- Hugging Face: https://huggingface.co/RedHotAnton/whisperkit-coreml
- Repositorio WhisperKit de Argmax: https://github.com/argmaxinc/argmax-oss-swift
- Paper y presentacion en ICML 2025: https://icml.cc/virtual/2025/47854
- Argmax Pro SDK (blog): https://www.argmaxinc.com/blog/argmax-sdk-2
