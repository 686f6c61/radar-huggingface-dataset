# Retrieve0/Qwen3-ForcedAligner-0.6B-TensorRT-Decoder

## Resumen

Qwen3-ForcedAligner-0.6B-TensorRT-Decoder es una exportacion ONNX del decodificador de texto del modelo Qwen/Qwen3-ForcedAligner-0.6B, un alineador forzado de audio y transcripcion desarrollado originalmente por el equipo Qwen de Alibaba. La exportacion la mantiene el usuario Retrieve0 y su objetivo es preparar el decodificador para su compilacion con TensorRT, de modo que el pipeline completo de alineamiento pueda ejecutarse con baja latencia sobre GPU NVIDIA. No se trata de un modelo nuevo ni de un fine-tuning, sino de una conversión de infraestructura del modelo base.

El grafo ONNX recibe los `inputs_embeds` ya construidos (con las embeddings de audio fusionadas) y las posiciones de los timestamps (`ts_positions`), extrae los estados ocultos en esas posiciones y aplica una cabeza de clasificacion de 5.000 filas. El resultado es un unico forward pass sin cache KV, lo que simplifica el despliegue y reduce el coste computacional por ventana de alineamiento. El perfil `window` admite hasta 1.024 tokens y 256 slots de timestamp, equivalentes a 36 segundos de audio y 128 palabras.

La relevancia de esta ficha es practica: para quien necesite alineamiento forzado (sincronizar transcripciones con audio a nivel de palabra) en produccion sobre GPU, esta exportacion elimina la dependencia de PyTorch en el camino de inferencia y permite generar motores TensorRT especificos para cada arquitectura de GPU. Se publica bajo licencia Apache-2.0, igual que el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador transformer (derivado de Qwen3) exportado a ONNX; forward unico sin cache KV, con cabeza de clasificacion de 5.000 filas aplicada en posiciones de timestamp |
| Parametros totales | 0,6 mil millones (modelo base Qwen3-ForcedAligner-0.6B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Hasta 1.024 tokens y 256 slots de timestamp en el perfil `window` (36 s de audio, 128 palabras) |
| Tipos de cuantizacion | BF16 y FP16 (exportaciones separadas); no se documentan otras precisiones |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`.onnx` + `.onnx.data`) para BF16 y FP16; los `.engine` de TensorRT se generan localmente |

## Arquitectura y entrenamiento

El modelo base es Qwen3-ForcedAligner-0.6B, un alineador forzado construido sobre la familia Qwen3 que combina un codificador de audio con un decodificador de texto. Esta exportacion cubre unicamente el decodificador: el grafo ONNX toma `inputs_embeds` (con las embeddings de audio ya integradas por el codificador) y `ts_positions`, recoge los estados ocultos en las posiciones marcadas como timestamps y aplica sobre ellas una cabeza de clasificacion de 5.000 clases. Al no emplear cache KV, cada ventana de alineamiento se resuelve con un solo forward pass, lo que simplifica el grafo y facilita su compilacion con TensorRT.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base; la model card de esta exportacion no los detalla. La innovacion tecnica destacable de esta publicacion no esta en el entrenamiento sino en el empaquetado: dos exportaciones ONNX (BF16 para GPU con soporte nativo y FP16 para GPUs NVIDIA mas antiguas), un perfil `window` de dimensiones fijas y la posibilidad de compilar motores especificos para la GPU objetivo mediante `build-engine.exe` o el comando `qwen3-asr build-aligner --preset window`. Los `.engine` no se distribuyen porque dependen de la arquitectura de GPU y del entorno de TensorRT.

## Capacidades

- Alineamiento forzado de transcripciones con audio: asigna marcas temporales a nivel de palabra o token sobre una transcripcion dada.
- Procesamiento por ventanas de hasta 36 segundos de audio y 128 palabras por forward pass.
- Clasificacion sobre 5.000 clases en las posiciones de timestamp, lo que permite resolver la correspondencia texto-audio de forma directa.
- Inferencia sin cache KV: cada ventana se resuelve en un unico paso, adecuado para procesamiento por lotes.
- Integracion con el codificador correspondiente (Qwen3-ForcedAligner-0.6B-TensorRT-Encoder) para formar el pipeline completo de alineamiento.
- Compilacion a TensorRT para GPUs NVIDIA, con variantes BF16 y FP16.
- No se documentan capacidades de generacion libre de texto, razonamiento, codigo, vision, tool calling ni agentes; el modelo esta especializado en alineamiento.

## Casos de uso

- Subtitulado automatico con marcas temporales por palabra: dado un audio y su transcripcion, el decodificador produce los tiempos de cada palabra, lo que permite generar subtitulos estilo karaoke o resaltados sincronizados.
- Sincronizacion de transcripciones en herramientas de edicion de video: al conocer el instante exacto de cada palabra, se pueden cortar clips o insertar capitulos automaticamente a partir del texto.
- Auditoria y control de calidad de transcripciones ASR: comparar la transcripcion de un sistema ASR con el audio y detectar desalineaciones u omisiones mediante las marcas temporales generadas.
- Entrenamiento de modelos de voz (TTS) con alineamiento a nivel de fonema o palabra: las marcas temporales sirven para construir datasets de duracion y prosodia.
- Busqueda y navegacion dentro de archivos de audio largos: indexar palabras con sus tiempos permite saltar a la posicion exacta de una mencion en una grabacion.
- Pipelines de produccion de bajo coste en GPU NVIDIA: al compilarse a TensorRT y ejecutarse sin cache KV, encaja en servicios de procesamiento por lotes donde la latencia y el throughput importan, con soporte de BF16 en GPUs modernas y FP16 en generaciones anteriores.
- Procesamiento en local o en el borde con GPUs de consumo: el tamano de 0,6 mil millones de parametros y las exportaciones FP16 permiten desplegarlo en estaciones de trabajo con GPU NVIDIA sin depender de un servicio en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 0,6 mil millones de parametros, las exportaciones BF16 y FP16 ocupan del orden de 1,2 GB de pesos, mas el consumo del codificador y de las activaciones. El repositorio completo ocupa 1,8 GB.
- GPU recomendadas: cualquier GPU NVIDIA con soporte de CUDA y TensorRT; BF16 requiere GPUs con soporte nativo (Ampere o posteriores), mientras que FP16 amplia la compatibilidad a generaciones anteriores.
- GPU de consumo: si, cabe en GPUs NVIDIA de consumo con soporte de TensorRT, aunque no se especifican modelos concretos ni minimos.
- Opciones de despliegue: TensorRT mediante motores compilados localmente con `build-engine.exe` o `qwen3-asr build-aligner --preset window`; integracion a traves del repositorio Qwen3-ASR-TensorRT; el formato ONNX tambien permite ejecucion con ONNX Runtime.
- Entorno de referencia: CUDA 12.8, TensorRT 11.4.0.106, Python 3.10-3.13; Windows probado y soportado, Linux deberia funcionar con paquetes compatibles de CUDA, TensorRT y PyTorch.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-ForcedAligner-0.6B-TensorRT-Decoder (este) | 0,6 B | 1.024 tokens, 256 slots (36 s, 128 palabras) | ONNX (BF16/FP16) | Apache-2.0 | Solo decodificador; requiere exportacion del codificador y compilacion local de motores |
| Qwen/Qwen3-ForcedAligner-0.6B | 0,6 B | no disponible | safetensors (modelo base) | Apache-2.0 | Modelo original completo; referencia de precision y comportamiento |
| Retrieve0/Qwen3-ForcedAligner-0.6B-TensorRT-Encoder | no disponible | no disponible | ONNX | Apache-2.0 | Exportacion complementaria del codificador para el mismo pipeline |
| Alternativas de alineamiento forzado (p. ej., Montreal Forced Aligner, WhisperX) | no disponible | no disponible | varios | varias | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- No es un modelo autonomo: necesita el codificador correspondiente y el repositorio Qwen3-ASR-TensorRT para funcionar; sin ellos no produce alineamientos.
- Los motores TensorRT no se distribuyen; hay que compilarlos localmente para cada arquitectura de GPU y version de TensorRT, lo que anade un paso de build al despliegue.
- La ventana esta limitada a 1.024 tokens y 256 slots de timestamp (36 s de audio, 128 palabras); audios mas largos requieren segmentacion.
- No se documentan los idiomas soportados; no se puede asumir cobertura multilingue sin verificacion.
- No se publican benchmarks de precision de alineamiento ni de robustez ante ruido, acentos o solapamientos de habla.
- Al derivar del modelo base Qwen3-ForcedAligner, hereda los sesgos y errores de este, aunque no se detallan en la informacion disponible.
- La licencia Apache-2.0 permite uso comercial, pero exige mantener la atribucion y la licencia del modelo original y citar el trabajo de Qwen3-ASR y el proyecto de runtime.
- Entorno probado en Windows; el soporte en Linux es esperado pero no verificado por el autor.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Retrieve0/Qwen3-ForcedAligner-0.6B-TensorRT-Decoder
- Modelo base: https://huggingface.co/Qwen/Qwen3-ForcedAligner-0.6B
- Exportacion del codificador: https://huggingface.co/Retrieve0/Qwen3-ForcedAligner-0.6B-TensorRT-Encoder
- Repositorio de runtime: https://github.com/lost0427/Qwen3-ASR-TensorRT
