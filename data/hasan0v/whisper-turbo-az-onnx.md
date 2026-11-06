# hasan0v/whisper-turbo-az-onnx

## Resumen

Whisper Turbo AZ ONNX es la exportación a formato ONNX de `hasan0v/whisper-turbo-az`, un ajuste fino del modelo de reconocimiento automático del habla Whisper large-v3-turbo de OpenAI especializado en azerí. Lo desarrolla Ali Hasanov (hasan0v) y su propósito es permitir la transcripción de audio en azerí directamente en el navegador mediante transformers.js y WebGPU, sin que el audio abandone el dispositivo del usuario. El repositorio está empaquetado específicamente para el ecosistema de transformers.js, con variantes cuantizadas que reducen el peso desde 3,4 GB en fp32 hasta 0,8 GB en q4.

El modelo hereda la arquitectura encoder-decoder de tipo transformer de Whisper large-v3-turbo, con aproximadamente 809 millones de parámetros en su variante turbo (frente a los 1.550 millones de large-v3), lo que reduce la latencia de decodificación manteniendo una calidad cercana. La ventana de contexto de audio es de 30 segundos por fragmento, con soporte de procesamiento por chunks con solapamiento (stride) para audio de mayor duración.

Su relevancia actual radica en dos factores: por un lado, cubre un idioma de bajos recursos como el azerí, para el que existen pocos modelos ASR de calidad; por otro, demuestra un patrón de despliegue en el cliente (edge) que evita costes de servidor y problemas de privacidad, con un WER medido de 10,23 % en FLEURS-az usando la combinación fp16/q4 recomendada para WebGPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo) |
| Parametros totales | aproximadamente 809 M (heredados de Whisper large-v3-turbo; no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio por fragmento; procesamiento por chunks con stride para audio largo |
| Tipos de cuantizacion | fp32, fp16, q8, q4 (combinaciones por encoder/decoder) |
| Idiomas soportados | azerí (az) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (encoder_model y decoder_model_merged para transformers.js) |

## Arquitectura y entrenamiento

El modelo es un export ONNX del ajuste fino `hasan0v/whisper-turbo-az`, que a su vez parte de Whisper large-v3-turbo de OpenAI. Whisper emplea una arquitectura transformer encoder-decoder entrenada para transcripción y traducción de voz, con entrada de audio convertida a espectrograma mel. La variante turbo reduce el número de capas del decodificador respecto a large-v3, lo que acelera la inferencia a costa de una ligera pérdida de precisión.

La exportación separa el modelo en dos grafos ONNX: `encoder_model` y `decoder_model_merged`, lo que permite asignar tipos de cuantización distintos a cada componente (por ejemplo, fp16 en el encoder y q4 en el decoder) para optimizar el equilibrio entre calidad y tamaño. Según la model card, el modelo base se entrenó con datos y método descritos en su propia ficha, pero esta información no se detalla en el repositorio ONNX. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación destacable es el empaquetado para transformers.js con soporte de WebGPU y `shader-f16`, que permite ejecutar el modelo en el navegador con aceleración por GPU y decodificación greedy. Las variantes cuantizadas están calibradas y evaluadas sobre las primeras 40 muestras del conjunto de test FLEURS-az.

## Capacidades

- Transcripción automática de voz (ASR) en azerí, con salida de texto plano.
- Procesamiento de audio de duración arbitraria mediante fragmentación en chunks de 30 segundos con solapamiento configurable (`chunk_length_s`, `stride_length_s`).
- Ejecución en el navegador con WebGPU o en CPU/WASM mediante transformers.js.
- Inferencia local sin envío de audio a servidores externos (privacidad por diseño).
- Soporte de cuantización selectiva por componente (encoder y decoder con tipos distintos).
- Tarea de transcripción (`task: "transcribe"`); no se documenta en la información disponible soporte de traducción a otros idiomas.
- No se documentan capacidades de tool calling, agentes, visión, audio de salida ni modo de razonamiento extendido.

## Casos de uso

- Transcripción de reuniones y entrevistas en azerí: el modelo procesa audio largo mediante chunks de 30 segundos con stride de 5 segundos, generando transcripciones completas sin necesidad de infraestructura de servidor.
- Subtitulado automático de vídeo en azerí: integrado en un pipeline de edición o publicación, permite generar subtítulos en tiempo casi real en el navegador del editor, con la variante fp16/q4 para mantener la latencia baja.
- Aplicaciones web de dictado con privacidad reforzada: al ejecutarse íntegramente en el cliente con WebGPU, el audio no sale del dispositivo, lo que resulta adecuado para entornos sanitarios, legales o periodísticos con requisitos de confidencialidad.
- Asistentes de voz para interfaces web: la transcripción local en el navegador permite construir asistentes conversacionales en azerí sin costes de API de ASR y con funcionamiento offline tras la primera carga del modelo.
- Herramientas de accesibilidad: transcripción en vivo de audio para personas con discapacidad auditiva en sitios web en azerí, desplegable como componente JavaScript sin backend.
- Procesamiento por lotes en Node.js: con `device: "cpu"` y cuantización q8/q8 (1,1 GB), se pueden transcribir archivos de audio en servidores sin GPU, útil para digitalización de archivos sonoros en azerí.
- Investigación en ASR de bajos recursos: sirve como referencia reproducible para evaluar técnicas de ajuste fino y cuantización en idiomas con pocos datos, al estar disponible el modelo base y las métricas por variante.

## Benchmarks y rendimiento

La model card proporciona resultados medidos con transformers.js sobre las primeras 40 muestras del test FLEURS-az, con decodificación greedy y la misma normalización que la ficha principal.

| Variante (encoder / decoder) | WER | CER | Tamano de descarga | Uso recomendado |
|---|---:|---:|---:|---|
| fp32 / fp32 | 10,11 % | 3,11 % | 3,4 GB | referencia (no subido) |
| fp16 / q4 | 10,23 % | 3,11 % | 1,65 GB | WebGPU (recomendado) |
| q8 / q8 | 10,48 % | 3,12 % | 1,1 GB | CPU / WASM |
| q4 / q4 | 11,33 % | 3,31 % | 0,8 GB | WebGPU sin `shader-f16`, bajo ancho de banda |

La ficha principal del modelo base reporta un WER de 10,90 % en FLEURS-az, según la insignia de la model card. No se han publicado en la información disponible resultados de benchmarks comparativos con otros modelos (MMLU, HumanEval u otros no aplican a un modelo ASR).

## Requisitos de hardware

- VRAM estimada: no se especifica en la información disponible; el tamaño de descarga de las variantes ONNX va de 0,8 GB (q4/q4) a 3,4 GB (fp32/fp32), lo que da una cota inferior del uso de memoria.
- GPU recomendadas: cualquier GPU con soporte de WebGPU y, preferiblemente, `shader-f16` para la variante fp16/q4; en servidor, GPUs como A100, H100 o RTX 4090 pueden ejecutar el modelo, aunque no se documentan requisitos específicos.
- Cabe en GPU de consumo: sí, la variante q4/q4 (0,8 GB) y q8/q8 (1,1 GB) caben holgadamente en GPUs de consumo; la fp16/q4 (1,65 GB) también es viable en tarjetas con 4 GB o más.
- Opciones de despliegue: transformers.js con `device: "webgpu"` o `device: "wasm"`/`"cpu"`; el formato ONNX es compatible con ONNX Runtime, aunque la información disponible solo documenta el uso con transformers.js.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| whisper-turbo-az-onnx (este) | aproximadamente 809 M | 30 s por chunk | azerí | Apache 2.0 | ONNX, transformers.js, WebGPU/WASM |
| openai/whisper-large-v3-turbo | aproximadamente 809 M | 30 s por chunk | multilingue (99 idiomas) | Apache 2.0 | safetensors, PyTorch, ONNX |
| openai/whisper-large-v3 | aproximadamente 1.550 M | 30 s por chunk | multilingue (99 idiomas) | Apache 2.0 | safetensors, PyTorch |
| hasan0v/whisper-turbo-az (base) | aproximadamente 809 M | 30 s por chunk | azerí | Apache 2.0 | safetensors (formato original) |

No se dispone en la información proporcionada de métricas comparativas de WER entre este modelo y las alternativas multilingües sobre FLEURS-az, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- El modelo solo soporta azerí; no se debe esperar transcripción fiable en otros idiomas.
- El WER de referencia (10,90 % en FLEURS-az según la ficha principal) implica una tasa de error no despreciable; en audio con ruido, acentos marcados o vocabulario especializado el error puede aumentar.
- Riesgo de alucinación: como todos los modelos Whisper, puede generar texto plausible en segmentos de silencio o ruido, especialmente con decodificación greedy.
- El procesamiento por chunks de 30 segundos con stride de 5 segundos puede introducir errores en las fronteras entre fragmentos.
- Los benchmarks de las variantes cuantizadas se midieron solo sobre 40 muestras de FLEURS-az, una muestra pequeña que limita la significación estadística de las diferencias observadas.
- La variante q4/q4 sin `shader-f16` presenta un WER notablemente superior (11,33 % frente a 10,11 % de referencia).
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de entrenamiento originales en la ficha de `hasan0v/whisper-turbo-az`.
- El repositorio tiene pocas descargas (29) y ningún "like" en el momento de la consulta, lo que sugiere validación comunitaria limitada.
- No se documentan sesgos específicos del ajuste fino en azerí en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hasan0v/whisper-turbo-az-onnx
- Modelo base: https://huggingface.co/hasan0v/whisper-turbo-az
- Demo en vivo: https://huggingface.co/spaces/hasan0v/whisper-turbo-az-demo
- Documentación de transformers.js: https://huggingface.co/docs/transformers.js
- Portfolio del autor: https://ali-hasanov.com
- GitHub del autor: https://github.com/hasan0v
- LinkedIn del autor: https://www.linkedin.com/in/ali-hasanov
