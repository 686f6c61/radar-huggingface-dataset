# aoiandroid/stt_uz_fastconformer_hybrid_large_pc_onnx

## Resumen

`aoiandroid/stt_uz_fastconformer_hybrid_large_pc_onnx` es un espejo sin modificaciones del modelo de reconocimiento automatico del habla (ASR) `OpenVoiceOS/stt_uz_fastconformer_hybrid_large_pc_onnx`, a su vez derivado de `nvidia/stt_uz_fastconformer_hybrid_large_pc`. Se trata de un sistema de transcripcion de voz a texto especializado en uzbeko, construido sobre la arquitectura FastConformer en configuracion hibrida, es decir, con decodificacion conjunta Transducer (RNNT) y CTC. El modelo original forma parte de la familia NeMo de NVIDIA orientada a idiomas con menos recursos.

El binario publicado esta exportado a formato ONNX y ocupa aproximadamente 589,8 MB repartidos en cuatro ficheros, e incluye una variante cuantizada a int8 (`model.int8.onnx`) pensada para inferencia en CPU y en dispositivos con recursos limitados. La relevancia practica del repositorio es doble: por un lado ofrece una via de despliegue ligera y sin dependencias de PyTorch para una lengua (uzbeko) con cobertura escasa en los grandes modelos multilingues; por otro, el espejo existe para que la aplicacion Cription no dependa de un repositorio de terceros.

Al tratarse de un espejo fiel, no incorpora mejoras, reentrenamiento ni ajuste posterior: todos los ficheros conservan su tamano, SHA-256 e identificador de blob respecto al origen. La licencia declarada es CC BY 4.0 y los creditos corresponden a los autores originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer hibrida (Transducer RNNT + CTC), familia NeMo |
| Parametros totales | no disponible (arquitectura "large"; la cifra exacta no figura en la informacion proporcionada) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de reconocimiento de voz, no generativo; admite audio de duracion variable) |
| Tipos de cuantizacion | int8 (`model.int8.onnx`) y precision completa (`model.onnx`) |
| Idiomas soportados | uzbeko (uz) |
| Licencia | cc-by-4.0 |
| Formato de pesos | ONNX |
| Tarea | automatic-speech-recognition (speech-to-text) |
| Autor original | NVIDIA / OpenVoiceOS (modelo base `nvidia/stt_uz_fastconformer_hybrid_large_pc`) |
| Repositorio espejo | aoiandroid |
| Commit de origen | `df756f83c28353c8dea2b23a8d01ae6393c91a0e` |
| Tamano del repositorio | 0,6 GB (589,8 MB, 4 ficheros) |
| Pipeline en HuggingFace | no disponible |

## Arquitectura y entrenamiento

La arquitectura FastConformer es una variante optimizada del Conformer que sustituye parte del mecanismo de atencion por convoluciones depthwise separables para reducir el coste computacional del submuestreo de la secuencia de entrada, lo que permite procesar audio mas largo con menor latencia. La configuracion "hybrid" combina dos cabeceras de decodificacion sobre el mismo encoder: un decodificador Transducer (RNNT) y una capa CTC. Esto permite elegir entre mayor precision (RNNT) o mayor simplicidad y velocidad de decodificacion (CTC greedy), y es el motivo por el que la etiqueta del repositorio incluye `nemo-conformer-ctc`.

El sufijo "pc" del nombre original indica que el modelo produce salida con puntuacion y mayusculas (punctuated and capitalized), lo que mejora la legibilidad de las transcripciones sin postprocesado adicional. No se dispone en la informacion proporcionada de detalles sobre el volumen de horas de entrenamiento, la composicion del corpus, ni sobre si hubo etapas de ajuste fino con RLHF o DPO; estos datos corresponderian a la model card original de NVIDIA. Este repositorio concreto no aporta informacion adicional de entrenamiento porque es un espejo inalterado.

## Capacidades

- Transcripcion de voz a texto en uzbeko con salida puntuada y capitalizada.
- Decodificacion dual: Transducer (RNNT) para maxima precision y CTC para inferencia mas ligera.
- Exportacion a ONNX que permite ejecucion con ONNX Runtime sin PyTorch ni NeMo.
- Variante int8 cuantizada para despliegue en CPU y hardware de bajos recursos.
- Procesamiento de audio de duracion variable gracias al submuestreo convolucional de FastConformer.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni uso como agente.
- No genera texto libre: su unica salida es la transcripcion del audio de entrada.
- No dispone de capacidades de vision, audio-vision ni traduccion.

## Casos de uso

- Transcripcion offline de audio en uzbeko: al estar en formato ONNX, puede ejecutarse localmente sin conexion ni servicios en la nube, lo que resulta util en entornos con requisitos de privacidad o conectividad limitada.
- Subtitulado automatico de contenido audiovisual en uzbeko: la salida con puntuacion y mayusculas reduce el trabajo de postprocesado necesario para generar subtitulos legibles.
- Asistentes de voz embebidos: la variante int8 admite despliegue en dispositivos con CPU modesta, adecuada para comandos de voz en aplicaciones de escritorio o moviles.
- Analitica de centros de llamadas: permite transcribir conversaciones en uzbeko para su indexacion, busqueda y analisis posterior, siempre que se cumplan las obligaciones de atribucion de la licencia.
- Dictado y toma de notas: integracion en herramientas de productividad para convertir voz en texto en tiempo real.
- Indexacion y busqueda de archivos de audio: transcripcion masiva de grabaciones para hacerlas consultables por texto.
- Integracion en la aplicacion Cription: este es el proposito declarado del espejo, evitar la dependencia de un repositorio de terceros en el flujo de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica referencia cualitativa encontrada en la busqueda web indica que el modelo base muestra un rendimiento destacado en varios conjuntos de prueba para uzbeko, pero no se aportan cifras concretas (WER, CER ni comparaciones numericas). No se debe asumir ningun valor sin una fuente verificable.

## Requisitos de hardware

- VRAM estimada para inferencia en GPU: no disponible. El modelo es pequeno en terminos relativos (menos de 600 MB en disco), por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican en la informacion disponible; cualquier GPU moderna con soporte de ONNX Runtime (por ejemplo, serie RTX o superiores) es suficiente.
- Inferencia en CPU: plenamente viable, especialmente con `model.int8.onnx`, que es la variante pensada para este escenario.
- Cabe en GPU consumer: si. El tamano del repositorio (589,8 MB) implica que incluso la variante sin cuantizar ocupa menos de 1 GB, muy por debajo de la VRAM de cualquier GPU actual.
- Opciones de despliegue: ONNX Runtime es la via principal. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que estan orientadas a modelos generativos y no aplican a este caso.
- Latencia y throughput estimados: no disponibles. Dependen del hardware, la variante (int8 frente a precision completa) y el backend de decodificacion (CTC frente a RNNT).

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Idiomas | Formato | Licencia |
|---|---|---|---|---|---|
| aoiandroid/stt_uz_fastconformer_hybrid_large_pc_onnx | FastConformer hibrida (RNNT + CTC) | no disponible | uzbeko | ONNX | cc-by-4.0 |
| OpenVoiceOS/stt_uz_fastconformer_hybrid_large_pc_onnx | FastConformer hibrida (RNNT + CTC) | no disponible | uzbeko | ONNX | cc-by-4.0 |
| nvidia/stt_uz_fastconformer_hybrid_large_pc | FastConformer hibrida (RNNT + CTC) | no disponible | uzbeko | NeMo (.nemo) | cc-by-4.0 |
| Whisper large-v3 | Transformer encoder-decoder | aprox. 1,55 mil millones | multilingue (incluye uzbeko) | safetensors, GGUF, ONNX | MIT |

El primer y el segundo modelo de la tabla son practicamente identicos: el espejo reproduce el mismo contenido fichero a fichero. La diferencia frente al modelo original de NVIDIA es el formato de pesos, PyTorch/NeMo frente a ONNX. Frente a Whisper large-v3, la comparacion es de enfoque: Whisper es mucho mayor y multilingue, mientras que este modelo esta especializado en un unico idioma y es sensiblemente mas ligero de desplegar.

## Limitaciones y advertencias

- Es un espejo sin modificaciones: no hay mantenimiento, soporte ni correcciones por parte de quien lo publica.
- Solo cubre uzbeko; no transcribe otros idiomas ni realiza traduccion.
- No se han publicado metricas cuantitativas de error (WER/CER) en la informacion disponible, por lo que el rendimiento real en un dominio concreto debe validarse antes de llevarlo a produccion.
- Riesgo de alucinacion y de transcripciones incorrectas en audio con ruido, solapamiento de hablantes, acentos no representados o vocabulario tecnico; los modelos CTC/RNNT pueden emitir tokens espurios con silencios largos.
- La licencia CC BY 4.0 exige atribucion a los autores originales y permite uso comercial siempre que se cumpla esa condicion; conviene revisar los terminos de la model card original.
- La etiqueta `region:us` y el campo de idiomas vacio en los metadatos de HuggingFace pueden complicar el filtrado automatico del modelo.
- No dispone de funcionalidades de diarizacion de hablantes, marcas de tiempo a nivel de palabra garantizadas ni deteccion de eventos de audio.
- Al proceder de un autor distinto del original, la trazabilidad de cambios futuros depende del commit fijado (`df756f83c28353c8dea2b23a8d01ae6393c91a0e`).

## Enlaces

- Repositorio espejo en HuggingFace: https://huggingface.co/aoiandroid/stt_uz_fastconformer_hybrid_large_pc_onnx
- Repositorio de origen en HuggingFace: https://huggingface.co/OpenVoiceOS/stt_uz_fastconformer_hybrid_large_pc_onnx
- Commit de origen: https://huggingface.co/OpenVoiceOS/stt_uz_fastconformer_hybrid_large_pc_onnx/tree/df756f83c28353c8dea2b23a8d01ae6393c91a0e
- Fichero cuantizado: https://huggingface.co/OpenVoiceOS/stt_uz_fastconformer_hybrid_large_pc_onnx/blob/main/model.int8.onnx
- Modelo base de NVIDIA: https://huggingface.co/nvidia/stt_uz_fastconformer_hybrid_large_pc
- Ficha de referencia del modelo: https://essamamdani.com/ai-models/hf-openvoiceos-stt-uz-fastconformer-hybrid-large-pc-onnx
- Ficha en AIBase: https://model.aibase.com/models/details/1915693344484909058
- Benchmarks de referencia (sitio de terceros): https://0xsero.github.io/hf-model-benchmarks/models/nvidia__stt_uz_fastconformer_hybrid_large_pc--1a3a8f.html
