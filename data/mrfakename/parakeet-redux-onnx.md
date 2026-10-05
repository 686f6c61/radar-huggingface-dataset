# mrfakename/parakeet-redux-ONNX

## Resumen

parakeet-redux-ONNX es una conversión a formato ONNX del modelo de reconocimiento automático de voz (ASR) moondream/parakeet-redux, un modelo de 149 millones de parámetros basado en la arquitectura NeMo Conformer TDT (Token-and-Duration Transducer) de NVIDIA. Lo publica el desarrollador mrfakename como espejo de la exportación original de eschmidbauer, con un fichero adicional: una cuantización dinámica int8 del decodificador y la red conjunta de 18 MB que mantiene el mismo WER que fp32 en las pruebas del autor y decodifica unas 4 veces más rápido en CPU.

Su relevancia está en el objetivo de despliegue: los ficheros están pensados para ejecutarse íntegramente en el navegador mediante onnxruntime-web, con el codificador (encoder) sobre el execution provider de WebGPU y el preprocesador y el decodificador sobre WASM. Esto permite ofrecer transcripción de voz en cliente sin enviar audio a un servidor, algo poco habitual en modelos ASR de calidad razonable.

El modelo hereda del modelo base el soporte de 25 idiomas europeos y una licencia CC-BY-4.0, lo que facilita su integración en productos comerciales siempre que se respete la atribución. El repositorio ocupa aproximadamente 0,5 GB y tiene un uso muy bajo en HuggingFace (18 descargas, 0 likes) en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeMo Conformer TDT (Token-and-Duration Transducer), encoder Conformer + decoder/joint tipo transducer |
| Parametros totales | 149 M (modelo base moondream/parakeet-redux) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo ASR); entrada de audio a 16 kHz mono, features de 128 bins mel, salida del encoder con downsample temporal de factor 8 |
| Tipos de cuantizacion | fp32 (encoder, preprocessor) e int8 dinámico (decoder + joint, 18 MB) |
| Idiomas soportados | 25 idiomas europeos según la model card del modelo base; el listado concreto no está disponible en la información proporcionada |
| Licencia | cc-by-4.0 |
| Formato de pesos | ONNX (onnxruntime / onnxruntime-web) |

Interfaz de entrada/salida declarada por el autor:

| Componente | Entradas | Salidas |
|---|---|---|
| preprocessor | `waveforms` f32 [1,N] (16 kHz mono), `waveforms_lens` i64 [1] | `features` [1,128,T], `features_lens` |
| encoder | `audio_signal` [1,128,T], `length` i64 | `outputs` [1,1024,T/8], `encoded_lengths` |
| decoder_joint | `encoder_outputs` [1,1024,1], `targets` i32 [1,1], `target_length` i32 [1], `input_states_1/2` [2,1,640] | `outputs` [1,1,1,8198] (8193 logits de token, blank = 8192, más 5 logits de duración), `output_states_1/2` |

## Arquitectura y entrenamiento

El modelo subyacente es un transducer TDT (Token-and-Duration Transducer) con encoder Conformer, la arquitectura que NVIDIA emplea en su familia Parakeet dentro de NeMo. Un TDT predice conjuntamente el token y su duración, lo que permite avanzar varios frames por paso de decodificación y reducir el número de pasos necesarios frente a un transducer clásico. El encoder transforma la señal de 128 bins mel en representaciones de 1024 dimensiones con un factor de reducción temporal de 8, y el decodificador más la red conjunta emiten 8193 logits de vocabulario (con el token blank en la posición 8192) junto con 5 logits de duración.

La información disponible no detalla el número de horas de audio, la composición del dataset, ni si hubo etapas de ajuste fino con RLHF o DPO, por lo que esos datos se consideran no disponibles. Tampoco se especifica el vocabulario ni el tokenizador, más allá del tamaño de la capa de salida (8193 tokens). La innovación destacable de esta publicación concreta no es arquitectónica sino de despliegue: la exportación a ONNX por componentes (preprocesador, encoder y decoder/joint) permite repartir la carga entre WebGPU y WASM, y la cuantización int8 dinámica del decoder/joint reduce el coste de la parte autorregresiva, que es la que domina la latencia en CPU.

## Capacidades

- Reconocimiento automático de voz (ASR) sobre audio de 16 kHz mono, orientado a transcripción de voz a texto.
- Arquitectura transducer con decodificación no autorregresiva en duración (TDT), que acelera la inferencia frente a transducers convencionales.
- Soporte declarado de 25 idiomas europeos según el modelo base; el listado exacto de idiomas no está disponible en la información proporcionada.
- Ejecución en navegador mediante onnxruntime-web, con el encoder en WebGPU y el resto en WASM.
- Ejecución en CPU con el decoder/joint cuantizado a int8, aproximadamente 4 veces más rápido que fp32 según el autor.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio de entrada más allá del ASR ni modo de razonamiento explícito: es un modelo puramente acústico-a-texto.
- No se documentan capacidades de puntuación, capitalización, marcas de tiempo ni diarización de hablantes.

## Casos de uso

- Transcripción de voz en el navegador sin servidor: al ejecutarse con onnxruntime-web y WebGPU, el audio del usuario no sale del dispositivo, lo que resulta adecuado para aplicaciones de dictado, notas de voz o subtitulado en tiempo casi real con requisitos de privacidad estrictos.
- Subtitulado de vídeo en cliente: integrado en un reproductor web, el modelo puede transcribir la pista de audio localmente, evitando costes de API y problemas de cumplimiento de protección de datos.
- Dictado en herramientas de edición de texto: el decoder int8 permite mantener una latencia baja por utterance en CPU, útil para aplicaciones de escritorio o extensiones de navegador donde no hay GPU disponible.
- Asistentes de accesibilidad: transcripción en vivo de conversaciones o contenido multimedia para personas con discapacidad auditiva, desplegable como componente WASM junto a la interfaz.
- Preprocesado de pipelines de audio en el edge: al ser un modelo de 149 M de parámetros y 0,5 GB de repositorio, encaja en dispositivos con recursos limitados para generar transcripciones que alimenten etapas posteriores (búsqueda, resumen, indexación).
- Investigación y evaluación de ASR multilingüe europeo: sirve como referencia reproducible en ONNX para comparar la calidad de un transducer TDT frente a alternativas tipo encoder-decoder sobre un conjunto de idiomas europeos.
- Prototipado rápido de demos ASR: al estar ya exportado y con un Space de demostración asociado, permite validar una idea de producto de voz sin montar infraestructura de inferencia propia.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son las tasas de error de palabra (WER) declaradas por el autor para la cuantización int8 del decoder/joint, medidas sobre clips de prueba propios. No se aporta la metodología, el tamaño del conjunto de evaluación ni comparación con otros sistemas, por lo que deben interpretarse como indicativos.

| Metrica | Valor declarado (int8 decoder/joint) | Referencia fp32 |
|---|---|---|
| WER en inglés (clips de prueba del autor) | 4,63 | mismo WER |
| WER en MLS (clips de prueba del autor) | 6,08 | mismo WER |
| Velocidad de decodificación en CPU | ~4x más rápido que fp32 | línea base |

No se han publicado resultados de benchmarks estándar (LibriSpeech, Common Voice, FLEURS, MMLU u otros) en la información disponible.

## Requisitos de hardware

- Tamaño del repositorio: aproximadamente 0,5 GB, correspondiente a los ficheros ONNX en fp32 e int8.
- El decoder/joint cuantizado a int8 ocupa 18 MB, lo que reduce de forma notable la huella de la parte autorregresiva.
- Al tratarse de un modelo de 149 M de parámetros, cabe con holgura en cualquier GPU de consumo; el requisito real es que el navegador o el runtime soporten WebGPU.
- GPU recomendadas: no se especifican. Por tamaño, funcionaría en GPU integradas con WebGPU, así como en RTX 3060/4060/4090, A100 o H100, aunque estas últimas están sobredimensionadas para un modelo de esta escala.
- Ejecución en CPU viable: el autor reporta que el decoder int8 es unas 4 veces más rápido que fp32 en CPU, lo que hace práctico el despliegue en portátiles sin GPU dedicada.
- Opciones de despliegue documentadas: onnxruntime-web (WebGPU + WASM) en navegador; onnxruntime en Python/C++ para ejecución nativa. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este formato y arquitectura.
- Latencia y throughput concretos: no disponibles, salvo la mejora relativa de 4x en la decodificación en CPU respecto a fp32.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Idiomas | Licencia | Orientacion |
|---|---|---|---|---|---|
| mrfakename/parakeet-redux-ONNX | 149 M | ONNX (WebGPU/WASM) | 25 idiomas europeos según el modelo base | CC-BY-4.0 | ASR en navegador |
| moondream/parakeet-redux (base) | 149 M | safetensors (formato original NeMo) | 25 idiomas europeos | CC-BY-4.0 | ASR, requiere runtime NeMo |
| eschmidbauer/parakeet-redux-onnx | 149 M | ONNX | igual que el base | CC-BY-4.0 | ASR en ONNX sin el decoder int8 añadido |
| openai/whisper-small | 244 M | safetensors, GGUF, ONNX (según conversiones de terceros) | multilingüe amplio (99 idiomas) | MIT | ASR encoder-decoder, ampliamente adoptado |
| Useful Sensors moonshine base | 27 M | PyTorch/ONNX (conversiones de terceros) | principalmente inglés | MIT | ASR ligero en el edge |

Los datos de rendimiento comparado entre estas alternativas no están disponibles en la información proporcionada; las cifras de parámetros y licencias de los modelos comparados corresponden a sus respectivas publicaciones oficiales.

## Limitaciones y advertencias

- Es exclusivamente un modelo ASR: no genera texto libre, no razona, no ejecuta código ni soporta tool calling.
- No se confirma en la información disponible que el español esté entre los 25 idiomas europeos soportados; conviene verificar el listado completo antes de usarlo en producción para castellano.
- El WER publicado (4,63 en inglés y 6,08 en MLS) procede de clips de prueba propios del autor, sin metodología detallada, por lo que no es comparable con evaluaciones estándar.
- Como todo sistema ASR, puede producir inserciones o alucinaciones en fragmentos con silencio, ruido o solapamiento de hablantes, y degradarse con acentos, jerga o audio de baja calidad no representados en el entrenamiento.
- No se documentan características como puntuación automática, capitalización, marcas de tiempo por palabra ni diarización, habituales en otras alternativas ASR.
- La licencia CC-BY-4.0 permite uso comercial, pero exige atribución al autor original y al exportador; hay que revisar además las condiciones del modelo base moondream/parakeet-redux.
- El soporte en navegador depende de WebGPU; en navegadores o equipos sin este API se degradará a WASM, con latencias mayores.
- El repositorio tiene un uso muy bajo (18 descargas, 0 likes) y no se documenta mantenimiento continuado, lo que implica menor soporte comunitario que alternativas consolidadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mrfakename/parakeet-redux-ONNX
- Modelo base: https://huggingface.co/moondream/parakeet-redux
- Exportación ONNX original (espejo): https://huggingface.co/eschmidbauer/parakeet-redux-onnx
- Demo en navegador (WebGPU): https://huggingface.co/spaces/mrfakename/parakeet-redux-webgpu
- Directorio de modelos AI Model Directory (Q4KM.ai): https://q4km.ai/models/
