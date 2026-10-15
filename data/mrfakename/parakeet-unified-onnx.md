# mrfakename/parakeet-unified-ONNX

## Resumen

parakeet-unified-ONNX es una exportacion a ONNX del modelo de reconocimiento automatico del habla (ASR) nvidia/parakeet-unified-en-0.6b, publicada por el usuario mrfakename. No es un modelo nuevo: es un empaquetado orientado a inferencia en navegador mediante ONNX Runtime Web con WebGPU, con el encoder cuantizado en 4 y 8 bits y el decodificador en int8. El repositorio ocupa 1,2 GB e incluye el preprocesador log-mel, el encoder FastConformer, el decodificador RNN-T completo (prediction network mas joint) y el vocabulario SentencePiece.

El modelo resuelve un problema concreto: ejecutar transcripcion de voz en ingles integramente en el cliente, sin enviar audio a un servidor, algo relevante para aplicaciones de privacidad, herramientas offline y demos ligeras en el navegador. Al estar exportado a ONNX, tambien puede desplegarse en entornos de servidor con ONNX Runtime en CPU o GPU sin necesidad de la pila NeMo completa.

Tecnicamente se trata de un encoder FastConformer de aproximadamente 600 millones de parametros con decodificacion RNN-T greedy, salida del encoder de 1024 dimensiones y submuestreo 8x (cada frame del encoder equivale a 80 ms de audio). La atencion es de contexto completo, es decir, modo offline; no se incluyen las mascaras de atencion por chunks que permitirian streaming.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + RNN-T (prediction network y joint) |
| Parametros totales | 600 millones (0,6 B, segun el modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; el encoder usa atencion de contexto completo y no se documenta un limite explicito de duracion de audio |
| Tipos de cuantizacion | Encoder: MatMulNBits 4 bits (block 32, asimetrica) y MatMulNBits 8 bits (block 64); decodificador/joint: int8 dinamico y fp32 |
| Idiomas soportados | ingles (en) |
| Licencia | nvidia-open-model-license (NVIDIA Open Model License) |
| Formato de pesos | ONNX (fp32, q4, q8, int8) |
| Autor | mrfakename |
| Modelo base | nvidia/parakeet-unified-en-0.6b |
| Tamano del repositorio | 1,2 GB |
| Fecha de creacion en HuggingFace | 2026-10-15 |
| Fecha de actualizacion | 2026-10-15 |
| Descargas / likes | 3 / 0 |

Ficheros incluidos:

| Fichero | Contenido |
|---|---|
| preprocessor.onnx | Caracteristicas log-mel de 128 bins estilo NeMo (16 kHz, ventana de 25 ms, hop de 10 ms, normalizacion por caracteristica) |
| encoder-model.q4.onnx | Encoder FastConformer, MatMulNBits 4 bits (block 32, asimetrica), 436 MB |
| encoder-model.q8.onnx | Mismo encoder, MatMulNBits 8 bits (block 64), 702 MB |
| decoder_joint-model.onnx | Prediction network y joint del RNN-T, fp32 |
| decoder_joint-model.int8.onnx | El mismo modulo con cuantizacion dinamica int8 |
| vocab.txt | Piezas SentencePiece con sus ids (blank = 1024) |
| config.json | Constantes de decodificacion |

## Arquitectura y entrenamiento

El modelo no se ha entrenado en esta publicacion: es una conversion del export fp32 de NeMo disponible en eschmidbauer/parakeet-unified-en-0.6b-onnx, que a su vez deriva de nvidia/parakeet-unified-en-0.6b. La arquitectura es un encoder FastConformer con atencion de contexto completo y submuestreo 8x, que produce representaciones de 1024 dimensiones, seguido de un decodificador RNN-T compuesto por una prediction network de estado 640 y un modulo joint que emite logits sobre un vocabulario de 1025 simbolos (blank = 1024). La decodificacion documentada es greedy, con un maximo de 10 simbolos por frame.

La innovacion tecnica de esta exportacion esta en el proceso de cuantizacion: las 48 capas Conv1d pointwise (kernel size 1) del encoder se reescribieron como MatMul para que el cuantizador weight-only de ONNX Runtime las cubriera, tras lo cual el encoder se cuantizo con `MatMulNBitsQuantizer`. El preprocesador log-mel de 128 bins es el mismo front end de NeMo usado en mrfakename/parakeet-ultra-ONNX. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO en el modelo original.

## Capacidades

- Reconocimiento automatico del habla en ingles a partir de audio de 16 kHz, con extraccion de caracteristicas log-mel integrada en el propio grafo ONNX.
- Decodificacion RNN-T greedy con vocabulario SentencePiece de 1025 piezas, admitiendo lotes (`B`) en las tres etapas del pipeline.
- Modo offline o de contexto completo: procesa el audio completo al que se le aplica la ventana de atencion, sin mascaras de streaming por chunks.
- Inferencia en navegador mediante ONNX Runtime Web con WebGPU, y tambien en CPU con ONNX Runtime.
- Cuantizacion selectiva con degradacion minima declarada: el encoder q4 mantiene una similitud coseno media de 0,99740 frente al fp32.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje conversacional.
- No soporta vision, audio adicional ni traduccion; la salida es unicamente texto transcrito en ingles.
- No es multilingue: solo ingles.

## Casos de uso

- Transcripcion con privacidad en el navegador: el audio se procesa en el cliente con WebGPU, de modo que no sale del dispositivo; es adecuado para notas de voz, diarios personales o grabaciones medicas donde el envio a servidores es problematica.
- Dictado y accesibilidad en aplicaciones web: con el encoder q4 (436 MB) el coste de descarga es asumible para una PWA o extension que ofrezca dictado en ingles sin backend.
- Subtitulado de archivos ya grabados: al ser un modelo de contexto completo, encaja mejor con ficheros cerrados que con flujos en tiempo real; se puede usar en un pipeline batch con ONNX Runtime sobre CPU.
- Procesamiento por lotes en servidor con coste bajo: ONNX Runtime permite ejecutar el encoder q8 o q4 en CPU sin GPU dedicada, lo que abarata la transcripcion masiva de audio en ingles (por ejemplo, archivado de podcasts).
- Indexado y busqueda sobre reuniones o clases en ingles: la transcripcion generada puede alimentar un indice de texto para busqueda posterior; el modelo cubre la etapa de ASR y se combina con herramientas de texto externas.
- Prototipado rapido en C++, Rust, Node o Python: al ser un grafo ONNX con entradas y salidas documentadas (`waveforms`, `audio_signal`, `encoder_outputs`, `targets`, estados de 640), la integracion no requiere dependencias de NeMo.
- Evaluacion de cuantizacion: sirve como referencia para medir el impacto de q4/q8 frente a fp32 en tareas de ASR, ya que el autor publica la paridad de WER y la similitud coseno entre variantes.
- Demos educativas y juguetes tecnicos: el Space parakeet-unified-webgpu demuestra ASR en navegador, util para talleres sobre WebGPU y ONNX Runtime Web.

## Benchmarks y rendimiento

El autor publica una tabla de paridad de decodificacion greedy RNN-T sobre ONNX Runtime en CPU, evaluada sobre 30 clips dummy de LibriSpeech mas el clip de JFK, con WER normalizado. No son resultados comparativos frente a otros modelos, sino una verificacion de que la cuantizacion no degrada la salida.

| Encoder | Decoder | WER | Similitud coseno del encoder frente a fp32 (media / minimo) |
|---|---|---|---|
| fp32 | fp32 | 2,10% | 1 / 1 |
| fp32 | int8 | 2,10% | 1 / 1 |
| q8 | fp32 | 2,10% | 0,99998 / 0,99978 |
| q4 | fp32 | 2,10% | 0,99740 / 0,99619 |
| q4 | int8 | 2,10% | 0,99740 / 0,99619 |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, WER sobre LibriSpeech completo, Common Voice u otros) para este modelo, ni comparaciones numericas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia en navegador o GPU: en torno a 436 MB de pesos para el encoder q4 mas el decodificador; el encoder q8 ocupa 702 MB. El decodificador int8 y fp32 reducen o amplian ese margen, pero su tamano no esta documentado en la informacion disponible.
- GPU recomendadas: cualquier GPU integrada o dedicada con soporte de WebGPU para el caso de navegador; en servidor, GPU de clase A100 o H100 no son necesarias por el tamano del modelo, y una RTX 4090 o similar queda sobredimensionada para un modelo de 0,6 B.
- Compatibilidad con GPU de consumo: si, es apto para GPU de consumo recientes (por ejemplo, RTX 3060 en adelante) e incluso para GPUs integradas compatibles con WebGPU, ya que los pesos cuantizados caben en menos de 1 GB.
- CPU: la verificacion de paridad se realizo con ONNX Runtime en CPU, por lo que la ejecucion sin acelerador es viable, con latencia dependiente del hardware.
- Opciones de despliegue: ONNX Runtime (Web con WebGPU, Python, C++, Node), el Space parakeet-unified-webgpu y cualquier runtime que consuma grafos ONNX. No aplica vLLM, llama.cpp, Ollama ni TGI, orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles. Como referencia de diseno, cada frame del encoder equivale a 80 ms de audio y la decodificacion greedy admite hasta 10 simbolos por frame.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato / cuantizacion | Decodificador | Licencia | Notas |
|---|---|---|---|---|---|---|
| mrfakename/parakeet-unified-ONNX | 600 M | en | ONNX q4, q8, int8, fp32 | RNN-T | nvidia-open-model-license | Pensado para ONNX Runtime Web y WebGPU; atencion de contexto completo |
| nvidia/parakeet-unified-en-0.6b | 600 M | en | NeMo (modelo original) | RNN-T | nvidia-open-model-license | Modelo base del que deriva esta exportacion; requiere pila NeMo |
| eschmidbauer/parakeet-unified-en-0.6b-onnx | 600 M | en | ONNX fp32 + decodificador int8 | RNN-T | no disponible | Export fp32 de referencia usado como fuente |
| nvidia/parakeet-tdt-0.6b-v3 | 600 M | multilingue | no disponible en la informacion proporcionada | TDT | no disponible | Alternativa de la misma familia y tamano, con decodificador TDT y soporte multilingue |

Las diferencias de rendimiento entre estas alternativas no estan documentadas en la informacion disponible.

## Limitaciones y advertencias

- Solo ingles: no hay soporte multilingue, por lo que la transcripcion de audio en otros idiomas producira salidas incorrectas o inventadas.
- Solo modo offline: el export usa atencion de contexto completo y no incluye las mascaras de atencion por chunks, de modo que no admite streaming incremental sin reexportar.
- Licencia: NVIDIA Open Model License, no una licencia de codigo abierto permisiva estandar; conviene revisar sus condiciones antes de un uso comercial o de redistribucion.
- Muestra de evaluacion muy reducida: el WER del 2,10% se mide sobre 30 clips dummy de LibriSpeech mas el clip de JFK, insuficiente para extrapolar a dominios reales como llamadas telefonicas, audio con ruido o acentos no cubiertos.
- Riesgo de alucinacion y sustitucion propio de los sistemas ASR: nombres propios, siglas, numeros y terminos tecnicos son propensos a errores, especialmente en audio degradado.
- Sesgos del modelo base no documentados en esta ficha: no se dispone de informacion sobre la composicion del dataset de entrenamiento original ni sobre analisis de sesgo por acento, genero o edad.
- La cuantizacion q4 con block 32 asimetrica mantiene la paridad en la muestra evaluada, pero puede degradar mas en dominios alejados de LibriSpeech; la similitud coseno minima reportada es 0,99619.
- La reescritura de 48 capas Conv1d pointwise como MatMul altera el grafo original; aunque la paridad declarada es total en la muestra probada, conviene validar con audio propio antes de produccion.
- No es un modelo de instrucciones: no admite prompts, tool calling ni razonamiento; cualquier funcionalidad conversacional debe aportarla otro modelo.
- Adopcion muy baja: 3 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria amplia.
- Limitaciones de despliegue en navegador: requiere WebGPU disponible en el navegador del usuario; en equipos sin soporte la inferencia se degrada a CPU.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mrfakename/parakeet-unified-ONNX
- Modelo base: https://huggingface.co/nvidia/parakeet-unified-en-0.6b
- Espejo del modelo base: https://huggingface.co/algorithco/parakeet-unified-en-0.6b
- Space de demostracion WebGPU: https://huggingface.co/spaces/mrfakename/parakeet-unified-webgpu
- Export fp32 de origen: https://huggingface.co/eschmidbauer/parakeet-unified-en-0.6b-onnx
- Export previo del mismo autor con el mismo front end: https://huggingface.co/mrfakename/parakeet-ultra-ONNX
- Perfil del autor: https://huggingface.co/mrfakename
- Alternativa de la familia Parakeet: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Texto de la licencia: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
