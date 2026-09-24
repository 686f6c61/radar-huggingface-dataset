# moonhouse/pianissimo-sv-onnx

## Resumen

moonhouse/pianissimo-sv-onnx es una conversion a formato ONNX y una cuantizacion a INT8 del modelo de reconocimiento automatico del habla (ASR) KlangAI/pianissimo-sv, desarrollado originalmente por Klang AI AB. El modelo subyacente es un sistema de transcripcion de voz en sueco construido sobre una arquitectura FastConformer (encoder) con decodificador TDT (Token-and-Duration Transducer), afinado a partir de NVIDIA Parakeet TDT 0.6B v3. Este repositorio no reentrena los pesos: unicamente los exporta a ONNX y los cuantiza para permitir inferencia ligera y multiplataforma en CPU, C++ y navegador mediante ONNX Runtime Web (WebAssembly y WebGPU).

La relevancia de esta ficha radica en que el modelo esta optimizado para inferencia en el lado del cliente, sin necesidad de GPUs dedicadas ni de servidores de inferencia. Los pesos ocupan aproximadamente 0,9 GB en total (862 MB el encoder y 17,5 MB la red conjunta del decodificador), lo que lo hace viable en equipos de consumo e incluso en el navegador. Segun la model card, la cuantizacion INT8 preserva el 100 % de coincidencia de tokens con la linea base en PyTorch, con una tasa de error de palabra (WER) de 6,11 % sobre el conjunto de dialectos suecos KlangAI/klang-dialects.

El modelo esta publicado bajo licencia CC BY 4.0, la misma que el modelo original, y soporta exclusivamente el idioma sueco. Esta pensado para integrarse en pipelines de despliegue web y de borde mediante la libreria parakeet_web, y no incluye pesos en otros formatos (safetensors, GGUF) en este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder acustico) + TDT (decoder joint y cabeza de decision) |
| Parametros totales | aproximadamente 0,6 mil millones (heredados de NVIDIA Parakeet-TDT-0.6B v3; no se confirma explicitamente en la informacion disponible) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo ASR; consume audio, no texto de entrada) |
| Tipos de cuantizacion | INT8 (cuantizacion per-channel MatMul en el encoder FastConformer e INT8 dynamic quantization en el joint del decoder TDT); FP32 en el modelo original .nemo; FP16 en la variante MLX |
| Idiomas soportados | sueco (sv) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (encoder-model.int8.onnx y decoder_joint-model.int8.onnx) |
| Tokenizer | SentencePiece BPE, 8192 tokens (tokenizer.model y vocab.txt, con token `<blk>` en la posicion 8192) |
| Tamano del repositorio | 0,9 GB |
| Pipeline | automatic-speech-recognition |
| Fecha de publicacion | 24 de septiembre de 2026 (ultima actualizacion: 24 de septiembre de 2026) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura FastConformer combinada con un decodificador TDT (Token-and-Duration Transducer). El encoder FastConformer procesa las caracteristicas acusticas de entrada y la red conjunta TDT predice simultaneamente el token de salida y su duracion temporal, lo que permite emitir multiples tokens por fotograma y mejora la eficiencia del decodificado frente a esquemas CTC o transducer clasicos. Los pesos proceden de KlangAI/pianissimo-sv, un ajuste fino del modelo NVIDIA Parakeet TDT 0.6B v3 sobre audio en sueco. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; esa informacion no esta disponible.

La innovacion principal de este repositorio no esta en el entrenamiento, sino en la ruta de despliegue: la exportacion a ONNX y la cuantizacion INT8 con cuantizacion per-channel MatMul en el encoder e INT8 dynamic quantization en el joint del decoder. Segun la model card, esta estrategia conserva una coincidencia de tokens del 100 % con la linea base en PyTorch, evitando la degradacion tipica de las cuantizaciones agresivas. La inferencia se realiza a traves de ONNX Runtime y es compatible con ONNX Runtime Web (WebAssembly y WebGPU), ademas de Python y C++, con integracion directa en la libreria parakeet_web. No se documentan mecanismos adicionales como decodificacion especulativa o atencion lineal mas alla de los propios de la arquitectura FastConformer-TDT.

## Capacidades

- Transcripcion automatica de voz en sueco (ASR) a partir de audio, con salida de secuencias de tokens BPE.
- Reconocimiento de habla en variantes dialectales del sueco, evaluado sobre el conjunto KlangAI/klang-dialects.
- Inferencia en CPU con ONNX Runtime, en navegador mediante ONNX Runtime Web (WebAssembly y WebGPU) y en aplicaciones nativas en Python y C++.
- Compatibilidad con la libreria parakeet_web para despliegues web ligeros.
- Cuantizacion INT8 con preservacion de la calidad de transcripcion respecto a la linea base FP32 en PyTorch (100 % de coincidencia de tokens segun la model card).
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, vision, audio generativo ni modo de pensamiento (thinking mode).
- Capacidad multilingue limitada al sueco; no se declaran otros idiomas.
- No se especifica en la informacion disponible si el modelo produce puntuacion, mayusculas, marcas de tiempo o diarizacion de hablantes.

## Casos de uso

- Transcripcion de reuniones y notas de voz en sueco: el modelo convierte audio en texto sobre CPU o en el navegador, sin requerir GPU ni servidores dedicados, lo que simplifica el despliegue en herramientas internas de empresa.
- Subtitulado de contenido audiovisual en sueco: al ejecutarse mediante ONNX Runtime Web puede integrarse en reproductores web y generar subtitulos en el cliente, reduciendo costes de infraestructura.
- Asistentes de voz y comandos por voz en sueco: la inferencia local en el navegador o en dispositivos de borde permite construir interfaces habladas sin enviar audio a la nube, lo que favorece la privacidad.
- Accesibilidad para personas con discapacidad auditiva: transcripcion en tiempo casi real de conversaciones o contenido multimedia en sueco directamente en el navegador mediante WebAssembly o WebGPU.
- Documentacion clinica o administrativa dictada: transcripcion de notas de voz en sueco con ejecucion local en el puesto de trabajo, evitando la salida de datos sensibles a servicios externos.
- Investigacion en linguistica y dialectologia: evaluacion y anotacion de corpus orales en dialectos suecos, aprovechando que el modelo fue benchmarkeado sobre KlangAI/klang-dialects.
- Aplicaciones moviles o de escritorio con modelos embebidos: el peso total de aproximadamente 0,9 GB en INT8 permite distribuir el modelo junto a la aplicacion y ejecutar la transcripcion sin conexion.
- Pipelines de procesado por lotes de audio en sueco: al soportar ONNX Runtime en Python y C++, el modelo puede integrarse en procesos automatizados de transcripcion masiva en CPU.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de dialectos suecos KlangAI/klang-dialects y audio de habla sueca:

| Framework / motor | Formato del modelo | WER | Coincidencia con PyTorch | Velocidad / RTF |
|---|---|---|---|---|
| PyTorch NeMo (CPU) | pianissimo-sv.nemo (FP32) | 6,11 % | 100 % (linea base) | 0,72x tiempo real |
| ONNX Runtime (CPU) | INT8 cuantizado | 6,11 % | 100,00 % | 0,66x tiempo real |
| Apple Silicon MLX (GPU) | pianissimo-sv-mlx (FP16) | 12,78 % | 93,33 % | 0,057x tiempo real |

La model card indica que la cuantizacion INT8 utiliza cuantizacion per-channel MatMul en el encoder FastConformer e INT8 dynamic quantization en el joint del decoder TDT, preservando el 100 % de coincidencia exacta de tokens con la linea base en PyTorch. La convencion exacta de la columna RTF (segundos de computo por segundo de audio, donde un valor menor es mejor) no se explicita en la informacion disponible. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia en INT8: aproximadamente 1 GB, correspondiente a los 862 MB del encoder, los 17,5 MB del decoder joint y el tokenizer. El repositorio completo ocupa 0,9 GB.
- CPU: es el entorno principal de destino. La model card reporta ejecucion en ONNX Runtime (CPU) a 0,66x tiempo real sobre el benchmark propio.
- GPU de consumo: al tratarse de un modelo de aproximadamente 0,6 mil millones de parametros en INT8, cabe con holgura en GPUs de consumo como la RTX 4090, asi como en GPUs de gama media y en equipos Apple Silicon (existe una variante MLX en FP16).
- GPUs de centro de datos (A100, H100): compatibles a traves de ONNX Runtime con proveedores de ejecucion CUDA, aunque la model card no documenta benchmarks especificos en estas GPU.
- Navegador: soporta ONNX Runtime Web con WebAssembly y WebGPU, lo que permite ejecucion en el cliente sin instalacion.
- Opciones de despliegue documentadas: ONNX Runtime (Python y C++), ONNX Runtime Web (WebAssembly y WebGPU) y la libreria parakeet_web. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo ASR de este tipo.
- Latencia y throughput: los unicos datos disponibles son los valores RTF de la tabla de benchmarks (0,66x tiempo real en ONNX Runtime CPU y 0,057x tiempo real en MLX GPU). No se proporcionan cifras de throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (sueco, klang-dialects) | Licencia | Formato |
|---|---|---|---|---|---|
| moonhouse/pianissimo-sv-onnx (INT8) | aproximadamente 0,6B | no disponible | 6,11 % | CC BY 4.0 | ONNX INT8 |
| KlangAI/pianissimo-sv | aproximadamente 0,6B | no disponible | 6,11 % (linea base, FP32) | CC BY 4.0 | .nemo (PyTorch NeMo) |
| pianissimo-sv-mlx (FP16) | aproximadamente 0,6B | no disponible | 12,78 % | no disponible | MLX FP16 |
| NVIDIA Parakeet TDT 0.6B v3 | 0,6B (segun la model card) | no disponible | no disponible (no evaluado en sueco en la informacion disponible) | no disponible | no disponible |

La comparativa se limita a las variantes del mismo modelo base citadas en la model card, ya que no se proporcionan datos de benchmarks de otros sistemas ASR en sueco. El modelo de este repositorio iguala el WER de la linea base FP32 en PyTorch (6,11 %) con un coste computacional ligeramente menor segun el RTF reportado, mientras que la variante MLX en FP16 presenta un WER notablemente superior (12,78 %) y una coincidencia de tokens del 93,33 % respecto a la linea base.

## Limitaciones y advertencias

- Modelo mono-idioma: solo soporta sueco (sv). No se declara soporte de otros idiomas, por lo que su uso en entornos multilingues requeriria modelos adicionales.
- Riesgo de error de transcripcion: el WER reportado es del 6,11 % sobre el conjunto de evaluacion citado; en audio con ruido, solapamiento de hablantes, acentos no cubiertos o dominios muy especificos el error puede ser mayor. No se dispone de datos sobre alucinaciones en segmentos de silencio o ruido.
- No se documenta el comportamiento del modelo en tareas fuera del ASR (traduccion, puntuacion, diarizacion, marcas de tiempo), por lo que no debe asumirse que las realiza.
- Restricciones de licencia: CC BY 4.0 permite uso comercial siempre que se atribuya correctamente la autoria a Klang AI AB como creador del modelo original y se indique si se han realizado modificaciones. Es obligatorio conservar la atribucion y el enlace a la licencia.
- La model card original contiene una advertencia explicita de que todo el merito del modelo corresponde a Klang AI AB; este repositorio solo aporta la conversion a ONNX y la cuantizacion, sin reentrenamiento.
- La variante MLX en FP16 reportada en la misma model card muestra una degradacion significativa (WER 12,78 % frente a 6,11 %), lo que indica que la eleccion de motor y precision afecta de forma sustancial a la calidad; conviene validar el WER en el dominio de destino antes de produccion.
- No se especifican sesgos conocidos, comportamiento por genero o acento, ni resultados de evaluacion de equidad en la informacion disponible.
- No se detallan los datos de entrenamiento, los tokens utilizados ni si hubo fases de RLHF o DPO, lo que limita la trazabilidad del modelo.
- El repositorio tiene 0 descargas y 0 likes, sin historial de uso en produccion que permita avalar su robustez en despliegues reales.
- No se proporciona informacion sobre el contexto maximo de audio procesable ni sobre la gestion de audios largos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/moonhouse/pianissimo-sv-onnx
- Modelo base original: https://huggingface.co/KlangAI/pianissimo-sv
- Conjunto de datos de dialectos suecos: https://huggingface.co/datasets/KlangAI/klang-dialects
- Libreria parakeet_web: https://github.com/davidhall/parakeet_web
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- NVIDIA Parakeet TDT 0.6B v3: enlace no disponible en la informacion proporcionada
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo en la busqueda realizada
