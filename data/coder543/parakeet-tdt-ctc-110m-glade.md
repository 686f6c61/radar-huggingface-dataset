# coder543/parakeet-tdt-ctc-110m-glade

## Resumen

Parakeet TDT-CTC 110M (glade) es una conversión del modelo de reconocimiento automático del habla (ASR) Parakeet TDT-CTC 110M de NVIDIA, publicada por el usuario coder543, orientada a su ejecución en el Apple Neural Engine mediante Core AI y Core ML. El modelo original combina un codificador FastConformer de 17 capas y anchura 512 con un predictor LSTM TDT de una capa y anchura 640, más una cabeza CTC independiente; esta conversión conserva los pesos originales sin reentrenamiento y los cuantiza a W8A16 (matrices acústicas aprendidas en 8 bits, salidas de convolución y proyecciones de posición relativa en FP16).

La relevancia de esta ficha es práctica: permite ejecutar ASR en inglés sobre hardware Apple (Mac, iPhone y Apple Watch) con velocidades muy superiores a tiempo real, manteniendo tanto decodificación TDT como CTC desde el mismo codificador y proporcionando marcas temporales nativas de token y de palabra. El repositorio ocupa 0,4 GB e incluye varios perfiles preempaquetados con distintas políticas de troceado.

No se trata de un modelo nuevo ni de un entrenamiento adicional: es una distribución de pesos cuantizados y grafos compilados. Cualquier evaluación de calidad debe remitirse al modelo base de NVIDIA, y las cifras de WER publicadas corresponden a una única grabación de referencia, no a un ranking amplio de precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + predictor LSTM TDT + cabeza CTC; conversión a Core AI / Core ML |
| Parametros totales | 110M (según el nombre del modelo base; no se detalla desglose en la información disponible) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | Políticas de troceado: hasta 15 s (perfiles fast y Core ML) y hasta 120 s (perfil quality); el máximo del modelo upstream no se especifica |
| Tipos de cuantizacion | W8A16 en matrices acústicas aprendidas; FP16 en salidas de convolución y proyecciones de posición relativa; grafo TDT en FP16; predictor opcional en CPU con pesos FP32 originales |
| Idiomas soportados | Inglés (en) |
| Licencia | cc-by-4.0 |
| Formato de pesos | Core AI (`.aimodel`) y Core ML (`.mlmodelc` compilados con Xcode 27); no se indican safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base es un sistema ASR híbrido que comparte un codificador FastConformer de 17 capas y anchura 512 entre dos mecanismos de decodificación: un predictor LSTM TDT de una capa y anchura 640, y una cabeza CTC separada. Esta conversión no reentrena ni modifica los pesos: aplica cuantización W8A16 a las matrices acústicas aprendidas y mantiene en FP16 las partes sensibles (salidas de convolución y proyecciones de posición relativa). El grafo TDT se distribuye en FP16 y el predictor opcional para CPU conserva los pesos FP32 originales.

La innovación técnica de esta distribución no está en el entrenamiento, sino en el despliegue: grafos compilados para macOS, iOS y watchOS 27, con atención bidireccional completa dentro de cada fragmento y procesamiento de grabaciones largas mediante fragmentos contiguos sin descartar muestras. No hay VAD ni eliminación de silencios en las políticas de troceado. El perfil fast prioriza el rendimiento y el perfil quality aporta más contexto a costa de un coste de ejecución sustancialmente mayor. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en el modelo original.

## Capacidades

- Reconocimiento automático del habla en inglés con decodificación TDT y CTC desde un mismo codificador.
- Marcas temporales nativas de token y de palabra, finitas y ordenadas dentro de los límites del audio.
- Procesamiento de grabaciones largas mediante fragmentos contiguos (hasta 15 s en fast y Core ML; hasta 120 s en quality).
- Ejecución en Apple Neural Engine, con trazas que muestran ejecución en ANE sin intervalos de GPU en el proceso objetivo.
- Concurrencia de hasta cuatro peticiones simultáneas en el runtime, sin que ello implique un lote de cuatro tensores del codificador.
- Distribuciones compiladas para Mac, iPhone y Apple Watch, además de los paquetes fuente de autoría en `coreml/`.
- No se documentan tool calling, function calling, capacidades de agente, visión, audio de entrada más allá del propio ASR ni modo de razonamiento.

## Casos de uso

- Transcripción de reuniones en Mac: con el perfil quality (hasta 120 s por fragmento) y marcas temporales nativas, se pueden generar actas con segmentos alineados a palabras sobre grabaciones de decenas de minutos.
- Subtitulado de vídeo en iOS: el perfil fast con decodificación CTC alcanza 926× de RTFx en iPhone 15 Pro Max en el fragmento de 20 s, lo que permite subtitular clips cortos casi en tiempo real dentro de una app.
- Dictado por voz en el Apple Watch: la distribución `coreml-watch` (141,3 MB) permite ASR local en watchOS 27 sin enviar audio a la nube, con el perfil fast de 15 s por fragmento.
- Indexación y búsqueda de archivos de audio: las marcas temporales de token y palabra facilitan la alineación forzada para buscar términos dentro de horas de audio y devolver la posición exacta.
- Preprocesado de pipelines de datos: transcripción por lotes en Mac con concurrencia de hasta cuatro peticiones y RTFx de 1.787× (CTC fast) sobre una grabación de 18 min 15 s.
- Aplicaciones de accesibilidad: transcripción en vivo en dispositivo para personas con dificultades auditivas, aprovechando la ejecución en ANE y la ausencia de dependencia de red.
- Prototipado de ASR embebido: los paquetes fuente en `coreml/` permiten recompilar y ajustar políticas de troceado antes de desplegar en dispositivos Apple.

## Benchmarks y rendimiento

Rendimiento medido por el autor sobre el discurso «We choose to go to the Moon» de JFK (extracto de 20 s y grabación completa de 1.095,32 s). RTFx = segundos de audio dividido por segundos de inferencia; mediana de tres ejecuciones tras preparación y calentamiento.

| Dispositivo | Perfil | Modo | Inferencia 20 s | RTFx 20 s | Inferencia completa | RTFx completo |
|---|---|---:|---:|---:|---:|---:|
| M3 MacBook Air, 16 GB | Fast | CTC | 19,3 ms | 1.035× | 0,613 s | 1.787× |
| M3 MacBook Air, 16 GB | Fast | TDT | 73,3 ms | 273× | 0,684 s | 1.602× |
| M3 MacBook Air, 16 GB | Quality | CTC | 115,3 ms | 173× | 1,172 s | 935× |
| M3 MacBook Air, 16 GB | Quality | TDT | 127,5 ms | 157× | 2,354 s | 465× |
| iPhone 15 Pro Max | Fast | CTC | 21,6 ms | 926× | 0,700 s | 1.565× |
| iPhone 15 Pro Max | Fast | TDT | 69,3 ms | 289× | 0,849 s | 1.291× |
| iPhone 15 Pro Max | Quality | CTC | 123,5 ms | 162× | 1,362 s | 804× |
| iPhone 15 Pro Max | Quality | TDT | 136,3 ms | 147× | 2,839 s | 386× |

WER normalizado (normalización inglesa de Whisper, distancia de edición por palabras, 2.220 palabras de referencia, incluye errores de frontera de fragmento):

| Perfil | Mac CTC | Mac TDT | iPhone CTC | iPhone TDT |
|---|---:|---:|---:|---:|
| Fast | 4,50% | 4,14% | 4,50% | 4,14% |
| Quality | 3,06% | 2,93% | 3,33% | 3,02% |

El autor advierte que estas cifras proceden de una sola grabación y no constituyen un ranking amplio de precisión. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, LibriSpeech) en la información disponible.

## Requisitos de hardware

- Hardware obligatorio: dispositivo Apple físico con macOS, iOS o watchOS 27 y soporte de Core AI para los perfiles Core AI; las distribuciones Core ML requieren objetivos de despliegue 27.0.
- Tamaño de descarga: 144,7 MB (fast), 149,7 MB (quality), 141,3 MB (coreml-macos, coreml-ios y coreml-watch); repositorio total de 0,4 GB.
- Memoria: no se publican cifras de VRAM ni de memoria unificada necesaria; el modelo base es de 110M parámetros y los pesos van cuantizados a W8A16, por lo que la huella es reducida, pero no hay medición disponible.
- GPU: no aplica en el diseño; la ejecución se realiza en Apple Neural Engine (y CPU para el predictor opcional). No se documenta soporte de A100, H100 ni RTX 4090.
- Consumer GPU: no procede; el objetivo son chips Apple (se cualifica en M3 MacBook Air, iPhone 15 Pro Max y Apple Watch).
- Despliegue: Core AI (`.aimodel`) y Core ML (`.mlmodelc`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ver tabla de benchmarks; el perfil fast CTC alcanza 1.035× RTFx en el extracto de 20 s en M3 y el perfil quality TDT baja a 147× en iPhone.
- Nota de validación: los grafos Core ML se cualificaron en macOS/iOS/watchOS 27.0.1; las cargas en iPhone y Watch de las distribuciones compiladas no se han remedido. Core AI no pudo ejecutar el modelo en la versión de Watch probada; sí lo hizo Core ML con CPU+ANE.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / fragmento | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| coder543/parakeet-tdt-ctc-110m-glade | 110M | 15 s (fast, Core ML) / 120 s (quality) | en | cc-by-4.0 | Core AI, Core ML |
| nvidia/parakeet-tdt_ctc-110m (base) | 110M | no disponible en la información | en | no disponible en la información | pesos originales (formato no detallado) |
| Alternativas de ASR de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos frente a otros modelos ASR en la información proporcionada, por lo que no se puede establecer una comparación de rendimiento fiable.

## Limitaciones y advertencias

- Solo inglés: no hay soporte multilingüe declarado.
- Las cifras de WER proceden de una única grabación (el discurso de JFK) y el propio autor las califica de resultado puntual, no de ranking de precisión.
- Las marcas temporales nativas no se han evaluado contra fronteras de palabra anotadas por humanos.
- Las políticas de troceado no incluyen VAD ni eliminación de silencios; los errores de frontera de fragmento se incluyen en el WER reportado.
- Requiere hardware Apple físico con macOS/iOS/watchOS 27; no es ejecutable en GPU NVIDIA ni en entornos sin Core AI/Core ML.
- Core AI no pudo ejecutar el modelo en la versión de Watch probada; en ese dispositivo solo funcionó Core ML con CPU+ANE.
- Las cargas en iPhone y Watch de las distribuciones compiladas no se han remedido; los tiempos fast de iPhone provienen de grafos equivalentes anteriores al stripping de metadatos del compilador.
- La colocación en ANE demuestra ejecución, no utilización aritmética, ancho de banda de memoria ni eficiencia energética.
- Riesgo de alucinación y sesgos: no se documentan en la información disponible; deben evaluarse contra el modelo base de NVIDIA.
- Licencia cc-by-4.0: permite uso comercial con atribución; conviene verificar las condiciones del modelo base de NVIDIA antes de redistribuir.
- El repositorio tiene 4 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/coder543/parakeet-tdt-ctc-110m-glade
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt_ctc-110m
- Paquetes fuente de autoría Core ML: https://huggingface.co/coder543/parakeet-tdt-ctc-110m-glade/tree/main/coreml
- Perfil fast: https://huggingface.co/coder543/parakeet-tdt-ctc-110m-glade/tree/main/fast
- Perfil quality: https://huggingface.co/coder543/parakeet-tdt-ctc-110m-glade/tree/main/quality
- Distribución macOS: https://huggingface.co/coder543/parakeet-tdt-ctc-110m-glade/tree/main/coreml-macos
- Distribución iOS: https://huggingface.co/coder543/parakeet-tdt-ctc-110m-glade/tree/main/coreml-ios
- Distribución watchOS: https://huggingface.co/coder543/parakeet-tdt-ctc-110m-glade/tree/main/coreml-watch
