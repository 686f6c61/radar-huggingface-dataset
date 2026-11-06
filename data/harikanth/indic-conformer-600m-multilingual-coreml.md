# harikanth/indic-conformer-600m-multilingual-coreml

## Resumen

IndicConformer 600M multilingual para Core ML es la conversión del modelo de reconocimiento automático del habla (ASR) IndicConformer 600M multilingual de AI4Bharat (IIT Madras) al formato Core ML, optimizado para ejecutarse en el Neural Engine de los chips Apple Silicon. El modelo original cubre 22 lenguas programadas de la India y esta conversión mantiene esa cobertura en un único paquete de 572 MB, pensado para inferencia completamente local en macOS sin conexión a internet.

La relevancia práctica de esta ficha radica en que traslada un modelo ASR de 600 millones de parámetros a hardware de consumo con un rendimiento medido de aproximadamente 400 veces tiempo real en un Apple M4, con un pico de memoria de unos 0,75 GB. Esto lo sitúa en el terreno de la transcripción on-device para aplicaciones de escritorio, donde la privacidad del audio y la ausencia de costes de API son requisitos habituales.

La conversión la firma harikanth, autor de ezRecord (una aplicación de grabación de pantalla y cámara para macOS), que utiliza este modelo para subtitular y transcribir contenido en telugu, hindi, tamil y otras lenguas. La licencia es MIT tanto para el modelo base como para la conversión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer (encoder) con cabeza CTC compartida |
| Parámetros totales | 600 M (aproximado, según nombre del modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana de entrada de 15,36 s (log-mel `[1, 80, 1536]`, hop de 10 ms); salida de 192 frames a 80 ms por frame |
| Tipos de cuantización | pesos palettizados de 8 bits (pal8); build fp16 planificado para iPhone |
| Idiomas soportados | 22: asamés, bengalí, bodo, dogri, gujarati, hindi, kannada, cachemir, konkani, maithili, malabar, manipuri, maratí, nepalí, odia, panyabí, sánscrito, santalí, sindhi, tamil, telugu, urdu |
| Licencia | MIT |
| Formato de pesos | Core ML (`.mlpackage` y `.mlmodelc` compilado) |
| Tamaño del paquete | 572 MB (pesos pal8); repo total 0,6 GB |
| Entrada | log-mel `[1, 80, 1536]` + longitud |
| Salida | logits crudos `[1, 192, 5633]` |
| Vocabulario | 5.633 columnas de salida; 257 por idioma (256 tokens + blank) |
| Librería | coreml |

## Arquitectura y entrenamiento

El modelo base es un Conformer: un encoder que combina convoluciones y auto-atención, seguido de una cabeza CTC (Connectionist Temporal Classification) compartida entre los 22 idiomas. La conversión a Core ML mantiene el encoder y la cabeza CTC, con los pesos cuantizados mediante palettización de 8 bits. El frontend mel (ventana, banco de filtros mel, pre-énfasis y normalización) se distribuye como ficheros de constantes (`preprocessor.json`, `preprocessor.bin`) que replican el preprocesador de NeMo usado por AI4Bharat.

La innovación clave de esta conversión es el diseño de la cabeza CTC compartida: en lugar de un modelo por idioma, se selecciona el idioma enmascarando la salida a las 257 columnas correspondientes (`language_columns.json`). Esto permite cubrir los 22 idiomas con una sola descarga y, además, ofrece detección de idioma casi gratuita: se decodifica la primera ventana bajo la máscara de cada idioma y se conserva la de mayor confianza. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada.

## Capacidades

- Reconocimiento automático del habla (ASR) en 22 lenguas programadas de la India.
- Salida CTC con marcas de tiempo a nivel de palabra (los finales de palabra tienden a salir ligeramente tempranos).
- Detección de idioma integrada mediante decodificación bajo máscaras por idioma.
- Ejecución completamente on-device en Apple Silicon (Neural Engine), sin conexión a internet.
- Procesamiento por ventanas de 15,36 s con unión de ventanas adyacentes en una palabra que ambas emiten.
- No genera puntuación: la salida es solo palabras.
- No soporta tool calling, function calling ni razonamiento multi-paso (es un modelo ASR puro).
- No incluye capacidades de visión, audio generativo ni modo thinking.

## Casos de uso

- Transcripción de reuniones y videollamadas en macOS: el modelo procesa audio localmente a unas 400 veces tiempo real, de modo que una hora de reunión se transcribe en unos 9 segundos sin enviar el audio a ningún servidor.
- Subtitulado de grabaciones de pantalla y cámara: ezRecord lo usa para generar subtítulos en telugu, hindi, tamil y el resto de lenguas, aprovechando las marcas de tiempo por palabra para sincronizar el texto con el vídeo.
- Dictado y notas de voz en aplicaciones de escritorio: la ventana de 15,36 s y el bajo consumo de memoria (0,75 GB de pico) permiten integrarlo en un flujo de dictado continuo por fragmentos.
- Indexación y búsqueda de archivos de audio: transcripción masiva de un archivo de audio en 22 idiomas con detección automática de idioma, útil para construir índices de búsqueda sobre grabaciones.
- Investigación lingüística y corpus orales: generación de transcripciones con tiempos para lenguas de bajos recursos como bodo, dogri, santalí o maithili, con la advertencia de que la precisión es menor en esas lenguas.
- Accesibilidad: subtitulado en tiempo real de contenido audiovisual en lenguas indias para usuarios con discapacidad auditiva, ejecutado íntegramente en el dispositivo del usuario.
- Procesamiento de audio sensible: transcripción de entrevistas, material médico o legal donde el audio no puede salir del equipo, gracias a la inferencia estrictamente local.

## Benchmarks y rendimiento

| Métrica | Resultado | Condiciones |
|---|---|---|
| Velocidad extremo a extremo | ~400× tiempo real | Apple M4, Neural Engine |
| Tiempo para 1 h de audio | ~9 s | Apple M4 |
| Memoria pico | ~0,75 GB | Apple M4 |
| Carga inicial | 15–20 s | compilación del modelo en el Neural Engine |
| Cargas posteriores | ~0,1 s | Apple M4 |
| Diferencia de WER frente a PyTorch | 0,7–1,3 puntos | clips FLEURS, hindi, tamil y telugu |
| Diferencia frente a transcripciones de referencia | hasta 0,5 puntos | clips FLEURS, hindi, tamil y telugu |
| CER en grabación real | 0,0 % | 40 s de telugu nativo, sala normal |
| Detección de idioma | 11 de 12 aciertos | clips FLEURS + grabación en telugu |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de un modelo ASR. Los resultados de WER por idioma del modelo base se remiten a las publicaciones de AI4Bharat, no incluidas en la información proporcionada.

## Requisitos de hardware

- Inferencia exclusiva en Apple Silicon (Neural Engine); no hay build para GPU NVIDIA ni CPU genérica en este repositorio.
- Memoria pico estimada: ~0,75 GB en Apple M4 con pesos pal8.
- Espacio en disco: 572 MB para el `.mlpackage` (repo de 0,6 GB).
- Hardware probado: Apple M4. El rendimiento en otros chips de la familia M no está medido en la información disponible.
- iPhone: no medido; algunos Neural Engines de iPhone rechazan pesos palettizados, por lo que se planifica un build fp16.
- Despliegue: Core ML nativo (`.mlpackage` o `.mlmodelc` compilado). No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: ~9 s por hora de audio en M4; primera carga de 15–20 s por compilación del modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| IndicConformer 600M multilingual (Core ML, esta ficha) | 600 M | 22 lenguas indias | Core ML, Neural Engine | MIT | ~400× tiempo real en M4, 0,75 GB pico |
| ai4bharat/indic-conformer-600m-multilingual (original) | 600 M | 22 lenguas indias | PyTorch / NeMo | MIT | Referencia de calidad; requiere framework Python |
| Whisper (variantes de OpenAI) | no disponible en la información | multilingüe amplio | múltiples (incl. Core ML en conversiones de terceros) | MIT | No se dispone de comparación medida en la información proporcionada |
| Parakeet (NVIDIA, vía FluidInference möbius) | no disponible en la información | inglés principalmente | Core ML (scripts adaptados) | Apache-2.0 (scripts) | Los scripts de conversión de möbius se usaron como base para esta conversión |

No se dispone de datos comparativos de WER entre estos modelos en la información proporcionada; la comparación se limita a parámetros, cobertura de idiomas, formato y licencia.

## Limitaciones y advertencias

- No genera puntuación: la salida son solo palabras; se recomienda un paso posterior de puntuación (por ejemplo, Cadence de AI4Bharat) o cortes por pausas.
- Los finales de palabra CTC salen ligeramente tempranos; para sincronización fina (karaoke) hace falta alineamiento forzado.
- El audio largo debe procesarse en ventanas de 15,36 s con su propio featurizado y unión en una palabra compartida; cortar en un frame fijo duplica sílabas.
- La precisión varía por idioma: es más fuerte en lenguas muy habladas y más débil en lenguas de bajos recursos como bodo y dogri.
- La detección de idioma puede fallar en clips cortos (se documenta un clip de hindi de 5 s clasificado como urdu por muy poco margen).
- En iPhone no está medida y algunos Neural Engines rechazan pesos palettizados; hace falta el build fp16.
- Riesgo de alucinación y sesgos: no se documentan en la información proporcionada; como todo modelo ASR, puede producir transcripciones erróneas en audio ruidoso o con acentos no representados en el entrenamiento.
- Licencia MIT permite uso comercial, pero se recomienda conservar la atribución a AI4Bharat y revisar las condiciones del modelo base.
- El paquete Swift de ezRecord (frontend mel, ventaneo, decodificación CTC con tiempos y detección de idioma) y los scripts de conversión aún no están publicados; se anuncia su liberación bajo Apache-2.0.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/harikanth/indic-conformer-600m-multilingual-coreml
- Modelo base: https://huggingface.co/ai4bharat/indic-conformer-600m-multilingual
- Repositorio IndicConformerASR (AI4Bharat): https://github.com/AI4Bharat/IndicConformerASR
- AI4Bharat (IIT Madras): https://ai4bharat.iitm.ac.in/
- Scripts de conversión de referencia (FluidInference möbius Parakeet): no disponible en la información proporcionada
- ezRecord: no disponible en la información proporcionada
