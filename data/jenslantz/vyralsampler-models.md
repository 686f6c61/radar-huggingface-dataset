# JensLantz/vyralsampler-models

## Resumen

VyralSampler models es un repositorio de tres modelos exportados a formato ONNX Runtime por el desarrollador JensLantz para su aplicación VyralSampler, una herramienta que extrae una frase hablada o cantada de un vídeo para reutilizarla como muestra de audio. El repositorio no contiene pesos entrenados desde cero, sino exportaciones de modelos de terceros ampliamente conocidos, empaquetadas para ejecutarse sin PyTorch en entornos de producción ligeros.

Los tres componentes cubren tareas distintas dentro del pipeline de la aplicación: un alineador forzado de palabras en inglés basado en wav2vec 2.0 (el mismo que emplea WhisperX), un detector de actividad de voz (VAD) derivado de pyannote/segmentation y un separador de fuentes musicales basado en MelBand Roformer que aísla la pista vocal de una mezcla. Todos los ficheros se distribuyen con licencia MIT y el repositorio ocupa 1,3 GB.

Su relevancia es fundamentalmente práctica: permite a aplicaciones que no quieren depender de PyTorch ni de la pila de torchaudio ejecutar alineación, VAD y separación de voces en ONNX Runtime con una fidelidad verificada frente a las librerías originales. No es un modelo de lenguaje ni un modelo generativo, sino un conjunto de utilidades de audio preentrenadas y reempaquetadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 (alineador), pyannote/segmentation (VAD), MelBand Roformer (separador) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de 5 s en el VAD, chunks STFT en el separador |
| Tipos de cuantizacion | no disponible (los ficheros son exportaciones ONNX en precisión original) |
| Idiomas soportados | ingles (alineador); VAD y separador independientes del idioma |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17), ejecutable con ONNX Runtime 1.26.0 y contrib ops |

## Arquitectura y entrenamiento

El repositorio agrupa tres modelos independientes. El alineador `aligner_en.onnx` es una exportación del checkpoint `WAV2VEC2_ASR_BASE_960H` de torchaudio, es decir, wav2vec 2.0 de fairseq (Baevski et al., 2020) en su variante base entrenada sobre 960 horas de LibriSpeech; recibe audio mono a 16 kHz y devuelve logits por cada trama de 20 ms, lo que permite localizar el borde exacto de cada palabra. El VAD `vad_pyannote.onnx` proviene de pyannote/segmentation (Bredin et al.) en la copia que distribuye WhisperX: procesa ventanas de 5 s y emite puntuaciones por trama para tres hablantes. El separador `vocals_mel_band_roformer.onnx` es el MelBand Roformer de Kimberley Jensen (KimberleyJSN/melbandroformer), el mismo fichero que descarga audio-separator; recibe la STFT de un fragmento estéreo a 44,1 kHz y devuelve la STFT enmascarada de la voz.

La exportación se realizó con el exportador legacy de torch 2.8 y opset 17, conservando los pesos originales y guardando los parámetros de configuración (etiquetas del alineador, ventana del VAD, STFT y longitud de chunk del separador) en los metadatos de cada fichero. La atención del separador usa el operador `MultiHeadAttention` del dominio `com.microsoft`, por lo que requiere ONNX Runtime con contrib ops. No hay entrenamiento adicional ni ajuste fino: la innovación es puramente de empaquetado y verificación de equivalencia numérica.

## Capacidades

- Alineación forzada de palabras en inglés a nivel de milisegundo sobre audio mono a 16 kHz.
- Detección de actividad de voz con segmentación en hasta tres hablantes por ventana de 5 s.
- Separación de la pista vocal de una mezcla musical estéreo a 44,1 kHz.
- Ejecución sin PyTorch: solo ONNX Runtime con contrib ops (versión usada por la app: 1.26.0).
- Equivalencia verificada frente a las librerías originales: bordes de palabra idénticos a WhisperX 3.8.6 en 657 palabras; VAD con un único borde desplazado 17 ms de 88 en 41 minutos de habla; separador con el 99,7 % de muestras idénticas a audio-separator 0.47.
- No incluye generación de texto, razonamiento, código, visión, tool calling ni capacidades de agente.

## Casos de uso

- Extracción de muestras de audio en aplicaciones de edición: el alineador localiza el inicio y el fin exactos de una palabra o frase en un vídeo, lo que permite cortar el clip con precisión de milisegundos sin intervención manual.
- Transcripción con marcas de tiempo a nivel de palabra: integrado en un pipeline tipo WhisperX, el alineador añade timestamps por palabra a transcripciones ya generadas, útil para subtitulado y búsqueda dentro de audio.
- Segmentación de habla en llamadas o reuniones: el VAD filtra silencios y separa turnos de hasta tres hablantes por ventana, reduciendo el coste de transcripción al omitir regiones sin voz.
- Karaoke y separación de pistas: el separador aísla la voz de una canción para generar versiones instrumentales o pistas vocales, con fidelidad verificada frente a audio-separator.
- Limpieza de muestras para producción musical: al extraer una frase cantada de un vídeo, el separador elimina la instrumentación de fondo antes de reutilizar la muestra.
- Despliegue en aplicaciones de escritorio o móvil sin PyTorch: al ser ONNX, los tres modelos pueden ejecutarse en entornos con ONNX Runtime y contrib ops, reduciendo el tamaño de dependencias frente a la pila torch completa.
- Preprocesado de datasets de audio: alineación y VAD en lote para generar etiquetas temporales antes de entrenar modelos ASR o de diarización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta verificaciones de equivalencia numérica frente a las librerías originales:

| Componente | Referencia comparada | Resultado |
|---|---|---|
| Alineador | WhisperX 3.8.6 | Bordes de palabra idénticos al milisegundo en 657 palabras |
| VAD | WhisperX (chunks de habla) | 1 de 88 bordes desplazado 17 ms en 41 min de habla (3 de 4 ficheros) |
| Separador | audio-separator 0.47 | 99,7 % de muestras idénticas; el resto, 1 unidad en 32767 |

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada; el repositorio pesa 1,3 GB en total, repartido entre los tres ficheros ONNX.
- GPU recomendadas: no disponible; al ejecutarse en ONNX Runtime, puede usar CPU o GPU según el proveedor de ejecución configurado (CUDA, DirectML, CoreML, etc.).
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; el tamaño de los ficheros sugiere que caben en GPUs de consumo actuales, pero no hay datos oficiales.
- Opciones de despliegue: ONNX Runtime 1.26.0 con contrib ops (requisito del separador por el operador `MultiHeadAttention` del dominio `com.microsoft`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Formato | Licencia | Notas |
|---|---|---|---|---|
| VyralSampler models | Alineación, VAD y separación vocal | ONNX | MIT | Exportaciones verificadas; sin dependencia de torch |
| WhisperX (wav2vec2 + pyannote) | Alineación y VAD | PyTorch | MIT (componentes) | Referencia de equivalencia; requiere torch y torchaudio |
| audio-separator (MelBand Roformer) | Separación vocal | PyTorch | MIT | Referencia de equivalencia; requiere torch |
| wav2vec 2.0 base 960h (torchaudio) | ASR y alineación | PyTorch | MIT | Modelo fuente del alineador |

## Limitaciones y advertencias

- El alineador solo cubre inglés; los alineadores para francés, alemán, español e italiano están en un repositorio aparte (`vyralsampler-models-nc`) con licencia CC BY-NC 4.0, no apta para uso comercial.
- El VAD devuelve puntuaciones para tres hablantes por ventana de 5 s; no está pensado para diarización de reuniones con más participantes sin postprocesado.
- El separador requiere ONNX Runtime con contrib ops y el operador `MultiHeadAttention` del dominio `com.microsoft`; otros runtimes ONNX pueden no soportarlo.
- La STFT y la STFT inversa quedan fuera del grafo: la aplicación debe implementarlas y respetar los parámetros guardados en los metadatos del fichero.
- No hay datos publicados sobre sesgos, tasas de alucinación ni rendimiento en dominios acústicos adversos (ruido, reverberación, acentos marcados).
- Aunque la licencia es MIT para todos los ficheros, el uso comercial debe respetar también las licencias de los modelos fuente, que la model card declara como MIT.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de adopción comunitaria ni de mantenimiento a largo plazo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/JensLantz/vyralsampler-models
- Repositorio de alineadores no comerciales: `vyralsampler-models-nc` (referenciado en la model card, sin URL directa disponible)
- wav2vec 2.0 (Baevski et al., 2020): paper de fairseq, sin URL en la información proporcionada
- pyannote/segmentation (Bredin et al.): modelo en Hugging Face, sin URL en la información proporcionada
- MelBand Roformer (KimberleyJSN/melbandroformer): modelo en Hugging Face, sin URL en la información proporcionada
- WhisperX 3.8.6: proyecto de referencia para alineación y VAD, sin URL en la información proporcionada
- audio-separator 0.47: proyecto de referencia para separación, sin URL en la información proporcionada
