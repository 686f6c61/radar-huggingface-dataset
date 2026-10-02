# coder543/parakeet-tdt-ctc-110m-coreai

## Resumen

coder543/parakeet-tdt-ctc-110m-coreai es una conversión del modelo de reconocimiento automático del habla (ASR) NVIDIA Parakeet TDT–CTC 110M al formato Core AI y Core ML de Apple, pensada para ejecutarse sobre el Neural Engine en dispositivos Apple (Mac, iPhone y Apple Watch). El autor, coder543, no reentrena el modelo: parte de los pesos originales de NVIDIA y los reempaqueta en grafos optimizados para el hardware de Apple, preservando tanto la decodificación TDT como la CTC desde el mismo codificador.

El modelo base, desarrollado conjuntamente por los equipos de NVIDIA NeMo y Suno.ai, es un híbrido FastConformer TDT-CTC de aproximadamente 110-114 millones de parámetros entrenado sobre unas 36.000 horas de audio en inglés con puntuación y capitalización. La conversión mantiene la arquitectura original: un codificador FastConformer de 17 capas y 512 dimensiones, un predictor TDT basado en una LSTM de una capa y 640 dimensiones, y una cabeza CTC separada. Se distribuye en tres paquetes (fast, quality y coreml) con políticas de troceado distintas.

Su relevancia actual radica en que permite transcripción de voz en inglés completamente local y de baja latencia en el ecosistema Apple, con cifras de rendimiento medidas que alcanzan cientos o miles de veces el tiempo real (RTFx) y con marcas de tiempo nativas a nivel de token y palabra. Está licenciado bajo CC-BY-4.0 y solo soporta inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador FastConformer (17 capas, 512 de ancho) + predictor LSTM TDT (1 capa, 640 de ancho) + cabeza CTC |
| Parametros totales | 110M (modelo base NVIDIA Parakeet TDT–CTC 110M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; politicas de troceado de 15 s (fast/coreml) y hasta 120 s (quality) |
| Tipos de cuantizacion | W8A16 en matrices acusticas; FP16 en salidas de convolucion y proyecciones de posicion relativa; FP16 en el grafo TDT; FP32 en el predictor CPU opcional |
| Idiomas soportados | ingles (en) |
| Licencia | cc-by-4.0 |
| Formato de pesos | Core AI (.aimodel) y Core ML (.mlpackage); pesos originales preservados sin reentrenamiento |

## Arquitectura y entrenamiento

El modelo base es un híbrido TDT-CTC sobre un codificador FastConformer. El codificador tiene 17 capas con anchura 512, y sobre él operan dos cabezales de decodificación: un predictor TDT implementado como una LSTM de una capa con anchura 640, y una cabeza CTC independiente. Esta doble naturaleza permite elegir entre decodificación TDT (habitualmente más precisa) y CTC (habitualmente más rápida) reutilizando el mismo codificador. Según la documentación del modelo base en NGC, fue entrenado por NVIDIA NeMo y Suno.ai sobre un conjunto de aproximadamente 36.000 horas de audio en inglés, con puntuación y capitalización.

La conversión de coder543 no reentrena ni modifica los pesos, sino que los empaqueta en grafos ejecutables sobre Core AI y Core ML. La cuantización aplicada es W8A16 (pesos de 8 bits, activaciones de 16 bits) para las matrices acústicas aprendidas, mientras que las salidas de convolución sensibles y las proyecciones de posición relativa conservan precisión FP16. El grafo TDT usa FP16 y el predictor CPU opcional mantiene los pesos originales en FP32. Cada perfil Core AI soporta decodificación TDT y CTC desde el mismo codificador, con marcas de tiempo nativas de token y palabra. Se incluyen tres paquetes: fast (recortes fijos de hasta 15 segundos, 192 posiciones de codificador, 144,7 MB), quality (hasta 120 segundos, 1.504 posiciones, 149,7 MB) y coreml (hasta 15 segundos, 192 posiciones, 141,3 MB). Los dos primeros son Core AI y el tercero un paquete portátil Core ML. Los recortes largos se procesan en fragmentos contiguos sin descartar muestras; no hay detección de actividad de voz (VAD) ni eliminación de silencios.

## Capacidades

- Reconocimiento automático del habla en inglés con puntuación y capitalización.
- Doble decodificación desde el mismo codificador: modo TDT y modo CTC, seleccionables según el compromiso precisión/velocidad deseado.
- Marcas de tiempo nativas a nivel de token y de palabra, finitas, ordenadas y acotadas por la duración del audio.
- Ejecución en el Neural Engine (ANE) de Apple, con trazas medidas en iPhone que muestran ejecución ANE con cero intervalos de GPU en el proceso objetivo.
- Procesamiento por fragmentos con atención bidireccional completa dentro de cada fragmento y sin pérdida de muestras entre fragmentos contiguos.
- Soporte de concurrencia de hasta cuatro peticiones simultáneas en tiempo de ejecución (no es un lote de tensor de cuatro fragmentos).
- Conversión de audio de larga duración: el perfil quality procesa grabaciones de hasta 120 segundos por fragmento y, por troceado, grabaciones completas (se midió una de 18 min 15 s).
- No dispone de tool calling, capacidades de agente, visión ni audio más allá del ASR: es un modelo puramente de transcripción.

## Casos de uso

- Transcripción local en iPhone: el paquete fast en modo CTC transcribe 20 segundos de audio en 21,6 ms (RTFx de 926×) en un iPhone 15 Pro Max; sirve para dictado y notas de voz sin enviar audio a la nube.
- Subtitulado en tiempo real: las marcas de tiempo nativas de token y palabra permiten alinear subtítulos con el audio sin postprocesado adicional, y la latencia de decodificación CTC (19,3 ms para 20 s en un M3) es compatible con flujos casi en vivo.
- Indexación y búsqueda de audio: transcribir grandes archivos de audio en Mac con el perfil quality (2,354 s para 1.095,32 s de audio en TDT, RTFx 465×) para generar texto buscable de entrevistas o podcasts.
- Aplicaciones de Apple Watch: el paquete Core ML fue cualificado en Apple Watch Ultra 4 y ejecutó en CPU+ANE, lo que permite transcripción en el propio reloj sin depender del teléfono.
- Privacidad y cumplimiento: al ejecutarse íntegramente en el dispositivo con Core AI/Core ML, el audio no sale del equipo, lo que encaja en escenarios con requisitos de protección de datos.
- Transcripción de reuniones: el perfil quality reduce el WER respecto a fast (2,93% frente a 4,14% en TDT en Mac sobre la grabación de referencia) a costa de mayor tiempo de cómputo, adecuado para procesamiento por lotes.
- Dictado en aplicaciones de escritorio en Mac: integrable mediante Core ML en apps nativas, aprovechando la atención bidireccional por fragmento y la entrega ordenada de resultados.

## Benchmarks y rendimiento

Datos medidos por el autor sobre el discurso «We choose to go to the Moon» de JFK, con un extracto de 20 segundos y la grabación completa de 18 min 15 s (1.095,32 segundos). RTFx es segundos de audio divididos por segundos de inferencia; más alto es mejor. Medianas de tres ejecuciones tras calentamiento.

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

Calidad de transcripción (WER normalizado por Whisper English, distancia de edición de palabras, 2.220 palabras de referencia, incluye errores de frontera de fragmento):

| Perfil | Mac CTC | Mac TDT | iPhone CTC | iPhone TDT |
|---|---:|---:|---:|---:|
| Fast | 4,50% | 4,14% | 4,50% | 4,14% |
| Quality | 3,06% | 2,93% | 3,33% | 3,02% |

Preparación observada del modelo:

| Dispositivo / perfil | Primera preparación | Preparación cacheada posterior |
|---|---:|---:|
| M3 / Core AI Fast | ~17,5 s | ~0,03 s |
| iPhone / Core AI Fast | 19,2 s | ~0,05-0,12 s |
| M3 / Core AI Quality | ~57,3 s | ~0,09 s |
| iPhone / Core AI Quality | 64,6 s | ~0,06-0,08 s |
| M3 / Core ML | ~33,1 s | ~0,16 s |
| iPhone / Core ML | ~18,4 s | ~0,27 s |
| Apple Watch Ultra 4 / Core ML | ~58,4 s | ~0,9 s |

El autor advierte que las cifras de WER de quality corresponden a una única grabación y no constituyen una clasificación amplia de precisión. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de un modelo ASR.

## Requisitos de hardware

- No requiere GPU NVIDIA: está diseñado para ejecutarse sobre el Neural Engine (ANE) de Apple y CPU mediante Core AI/Core ML.
- Requiere un dispositivo Apple físico con Core AI y macOS/iOS 27 para los paquetes Core AI; los grafos Core ML se cualificaron en macOS/iOS/watchOS 27.0.1.
- Tamaño de cada paquete: fast 144,7 MB, quality 149,7 MB, coreml 141,3 MB (repo total de 0,4 GB).
- Dispositivos cualificados en las mediciones: M3 MacBook Air de 16 GB, iPhone 15 Pro Max y Apple Watch Ultra 4 (este último solo con Core ML CPU+ANE; Core AI no pudo ejecutar el modelo en la versión de Watch probada).
- Memoria: el modelo base ronda los 110-114M de parámetros, por lo que el peso es pequeño; no se especifica VRAM ni RAM exacta necesaria, más allá del tamaño de los paquetes.
- Despliegue: Core AI (.aimodel) y Core ML (.mlpackage). No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Los activos distribuidos son fuentes `.aimodel` y `.mlpackage`, no cachés compiladas por arquitectura; el primer uso incluye especialización en el dispositivo (ver tabla de preparación).
- Concurrencia en tiempo de ejecución de hasta cuatro peticiones simultáneas; TDT usa decodificación CPU para un máximo de dos fragmentos y un predictor ANE por lotes para grabaciones mayores; CTC no carga el predictor recurrente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / politica | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| coder543/parakeet-tdt-ctc-110m-coreai | 110M (base) | fragmentos de 15 s (fast/coreml) y hasta 120 s (quality) | en | cc-by-4.0 | Core AI / Core ML | Conversión para ANE de Apple |
| nvidia/parakeet-tdt_ctc-110m | ~110-114M | maximo no especificado en la informacion; entrenado sobre 36.000 h | en | no disponible en la informacion | no disponible (pesos NeMo) | Modelo base original de NVIDIA/Suno.ai |
| Modelos ASR alternativos (p. ej. Whisper) | no disponible | no disponible | no disponible | no disponible | no disponible | No se han aportado cifras comparativas de WER o rendimiento en la informacion disponible |

No se dispone en la información proporcionada de datos comparativos de rendimiento frente a alternativas de la misma categoría, por lo que no es posible establecer una comparación cuantitativa de precisión o latencia con otros modelos ASR.

## Limitaciones y advertencias

- Solo soporta inglés; no hay capacidades multilingües.
- Es un modelo de ASR, no un modelo de lenguaje: no hace razonamiento, generación de código ni tool calling.
- Riesgo de errores de transcripción, especialmente en fronteras de fragmento; el WER medido varía entre 2,93% y 4,50% según perfil y modo.
- Las cifras de calidad (WER) corresponden a una única grabación de referencia y no deben interpretarse como una clasificación general de precisión.
- Las marcas de tiempo nativas no han sido evaluadas contra fronteras de palabra anotadas por humanos.
- Dependencia estricta del ecosistema Apple: Core AI exige dispositivo Apple físico con macOS/iOS 27; no puede ejecutarse en hardware no Apple.
- Las políticas de troceado (15 s, 120 s) son decisiones de distribución del autor, no la longitud máxima de contexto del modelo original; no incluyen VAD ni eliminación de silencios.
- Core AI no pudo ejecutar el modelo en la versión de Watch probada; en ese dispositivo solo funcionó Core ML CPU+ANE.
- Las mediciones de preparación son «primeras preparaciones observadas», no garantías de instalación limpia con caché vaciada; la caché del compilador es opaca y puede variar.
- La detección de ejecución ANE demuestra que el modelo se ejecuta en el ANE, pero no implica utilización aritmética, de ancho de banda de memoria ni eficiencia energética concretas.
- Licencia CC-BY-4.0: permite uso comercial con atribución; conviene revisar también los términos del modelo base de NVIDIA.

## Enlaces

- HuggingFace (conversión): https://huggingface.co/coder543/parakeet-tdt-ctc-110m-coreai
- Modelo base NVIDIA: https://huggingface.co/nvidia/parakeet-tdt_ctc-110m
- NVIDIA NGC (Parakeet-TDT_CTC-110M): https://catalog.ngc.nvidia.com/orgs/nvidia/nemo/models/parakeet-tdt_ctc-110m/
- Colección STT Core AI de coder543: https://huggingface.co/collections/coder543/stt-core-ai
- Ficha en llmboard.ai: https://www.llmboard.ai/models/nvidia-parakeet-tdt-ctc-110m
- Ficha en aibase: https://model.aibase.com/models/details/1915693345676091394
