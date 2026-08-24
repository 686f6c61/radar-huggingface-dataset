# mlboydaisuke/Whisper-base-ExecuTorch

## Resumen

Este repositorio contiene una exportación del modelo Whisper-base de OpenAI al formato ExecuTorch (`.pte`), pensada para inferencia on-device en dispositivos móviles, embebidos y entornos de CPU. El modelo original es un sistema de reconocimiento automático del habla (ASR) basado en una arquitectura transformer encoder-decoder, entrenado por OpenAI sobre 680.000 horas de audio multilingüe. La contribución de este repositorio no es el entrenamiento, sino la conversión y optimización del modelo para su ejecución en dispositivos con recursos limitados, separando el encoder y el decoder en dos grafos estáticos que pueden combinarse de forma independiente.

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar Whisper-base en hardware de gama baja sin depender de servidores en la nube, manteniendo la privacidad de los datos de audio. La conversión utiliza los backends XNNPACK (CPU portable) y Core ML (Apple Silicon) de ExecuTorch, y verifica la paridad numérica con el modelo original en precisión fp32. El resultado son siete archivos `.pte` (cuatro variantes del encoder y tres del decoder) que permiten configurar la combinación de precisión y rendimiento más adecuada para cada dispositivo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper-base) |
| Parametros totales | no disponible (corresponde al modelo Whisper-base de OpenAI) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 30 segundos de audio (ventana fija de 128 tokens de salida) |
| Tipos de cuantizacion | XNNPACK fp32, fp16, int8 (solo encoder); Core ML |
| Idiomas soportados | no disponible (modelo original multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pte` (ExecuTorch), cada grafo es un archivo independiente |

## Arquitectura y entrenamiento

El modelo original Whisper-base es un transformer encoder-decoder con 12 capas y 512 dimensiones de ocultamiento, entrenado sobre 680.000 horas de audio con supervisión débil. La conversión a ExecuTorch separa el encoder y el decoder en dos grafos estáticos independientes para evitar que el encoder se re-ejecute en cada paso de decodificación. El encoder procesa un espectrograma log-mel de `[1, 80, 3000]` (30 segundos a 16 kHz, 80 bandas mel, hop 160, ventana 400) una vez por ventana, mientras que el decoder recibe la salida del encoder más un tensor de `decoder_input_ids` de `[1, 128]` en int64, alineado a la izquierda y rellenado.

La decodificación se realiza sin cache de claves/valores (KV cache): el decoder es un grafo estático sobre una ventana fija de 128 posiciones, de modo que cada paso greedy implica un forward completo de 128 posiciones. El proceso comienza con los tokens `<|startoftranscript|>`, un token de idioma, `<|transcribe|>` y `<|notimestamps|>`, y termina al generar el token `<|endoftext|>` (50257). Esta elección sacrifica eficiencia por portabilidad: el mismo grafo se ejecuta sin cambios en distintos runtimes y precisiones. La verificación en Mac arm64 (ExecuTorch 1.4.0, torch 2.13.0) confirma que las dos envolturas reproducen exactamente `WhisperForConditionalGeneration` con una diferencia máxima absoluta de `0.000e+00`.

## Capacidades

- Reconocimiento automático de voz (ASR) para audio de hasta 30 segundos por ventana.
- Transcripción en múltiples idiomas (el modelo base Whisper soporta 99 idiomas, aunque no se detalla en la información).
- Ejecución on-device en CPU mediante XNNPACK (portable) y en Apple Silicon mediante Core ML.
- Combinación flexible de encoder y decoder: cualquier archivo del encoder puede emparejarse con cualquier archivo del decoder, ya que todos toman y devuelven tensores fp32 (los token ids permanecen en int64).
- Verificación de paridad numérica con el modelo original en fp32 (correlación 1.000000) y en precisiones reducidas (fp16 e int8 con correlación superior a 0.999).
- No incluye soporte de tool calling, agentes ni razonamiento multi-paso; es exclusivamente un modelo de ASR.

## Casos de uso

- Transcripción de voz en dispositivos móviles: la combinación más ligera de encoder y decoder ocupa 130,1 MB, lo que permite su despliegue en smartphones de gama media para transcribir notas de voz o dictados sin conexión.
- Asistentes de voz con privacidad: al ejecutar la inferencia en el dispositivo, el audio nunca sale del terminal, lo que es adecuado para aplicaciones médicas, financieras o de datos personales sensibles.
- Subtitulado en tiempo real en hardware de borde: el encoder procesa una ventana de 30 segundos en ~112 ms con cuantización int8 en CPU, lo que permite generar subtítulos para vídeo en directo en sistemas embebidos con recursos limitados.
- Integración en pipelines de procesamiento de audio en servidores CPU: las versiones fp32 y fp16 pueden ejecutarse en instancias sin GPU, reduciendo costes de infraestructura frente a modelos más grandes.
- Evaluación de ASR en dispositivos Apple: la variante Core ML del encoder alcanza 28,1 ms por ventana en Mac arm64, lo que la convierte en una opción para aplicaciones de macOS o iOS.
- Despliegue en sistemas de automatización del hogar o robótica: al ser un grafo estático, puede integrarse en runtimes de C++ o Python en dispositivos de bajo consumo como Raspberry Pi o microcontroladores con soporte XNNPACK.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) para este modelo, ya que es una exportación de un ASR. La model card proporciona datos de rendimiento relativo en una Mac arm64 (ExecuTorch 1.4.0, torch 2.13.0), medidos como mediana de 5 ejecuciones en un solo proceso. La tabla siguiente resume la correlación con el modelo fp32 eager y los tiempos de inferencia.

| Grafo | Build | Archivo | Tamano (MB) | Correlacion vs fp32 eager | ms (ExecuTorch) | ms (eager) |
|---|---|---|---|---|---|---|
| encoder | XNNPACK fp32 | `whisper_base_encoder_xnnpack_fp32.pte` | 82.4 | 1.000000 | 120.1 | 43.8 |
| encoder | XNNPACK fp16 | `whisper_base_encoder_xnnpack_fp16.pte` | 43.1 | 0.999997 | 217.6 | 43.0 |
| encoder | XNNPACK int8 | `whisper_base_encoder_xnnpack_int8.pte` | 25.9 | 0.999340 | 111.9 | 43.7 |
| encoder | Core ML | `whisper_base_encoder_coreml_all.pte` | 41.4 | 0.999983 | 28.1 | 44.2 |
| decoder | XNNPACK fp32 | `whisper_base_decoder_xnnpack_fp32.pte` | 314.4 | 1.000000 | 36.1 | 20.0 |
| decoder | XNNPACK fp16 | `whisper_base_decoder_xnnpack_fp16.pte` | 157.4 | 0.999981 | 77.3 | 19.4 |
| decoder | Core ML | `whisper_base_decoder_coreml_all.pte` | 104.2 | 0.999861 | 5.0 | 20.0 |

Nota: los tiempos de ExecuTorch son mayores que los de eager en algunos casos, lo que el autor atribuye a que son una referencia relativa, no un número de rendimiento del dispositivo. La pareja de archivos más ligera (encoder int8 + decoder Core ML) suma 130,1 MB.

## Requisitos de hardware

- VRAM estimada: no aplicable, ya que la inferencia se ejecuta en CPU (XNNPACK) o en Core ML en Apple Silicon. No se requieren GPUs dedicadas.
- GPU recomendadas: no aplicable. El modelo está diseñado para CPU y dispositivos embebidos.
- Compatibilidad con hardware consumer: sí. Cualquier dispositivo con CPU x86-64, ARM64 o Apple Silicon puede ejecutar los archivos `.pte` mediante el runtime de ExecuTorch. La variante Core ML requiere macOS o iOS.
- Opciones de despliegue: ExecuTorch runtime (C++ o Python), XNNPACK backend para CPU portable, Core ML backend para Apple Silicon. No se mencionan integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput: en Mac arm64, el encoder XNNPACK fp32 tarda ~120 ms, el int8 ~112 ms y Core ML ~28 ms. El decoder XNNPACK fp32 tarda ~36 ms y Core ML ~5 ms. Estas cifras son relativas y no representan el rendimiento máximo del dispositivo.
- La carga de archivos puede oscilar entre 25,9 MB (encoder int8) y 314,4 MB (decoder fp32), por lo que el almacenamiento disponible es un factor a considerar.

## Comparativa con modelos similares

| Modelo | Tamano (MB) | Precision | Backend | Correlacion | ms (encoder) | ms (decoder) |
|---|---|---|---|---|---|---|
| Whisper-base-ExecuTorch (fp32) | 396.8 | fp32 | XNNPACK | 1.000000 | 120.1 | 36.1 |
| Whisper-base-ExecuTorch (int8 encoder + Core ML decoder) | 130.1 | int8/fp32 | XNNPACK + Core ML | 0.999340 | 111.9 | 5.0 |
| Whisper-tiny-ExecuTorch (del mismo autor) | no disponible | no disponible | XNNPACK/Core ML | no disponible | no disponible | no disponible |
| Whisper-base original (PyTorch eager) | ~74M parametros | fp32 | CPU/GPU | 1.000000 | 43.8 | 20.0 |

La comparativa con Whisper-tiny-ExecuTorch no está detallada en la información proporcionada. La ventaja de esta versión frente al modelo eager es la portabilidad a entornos on-device con el coste de una mayor latencia en algunos casos y la ausencia de KV cache, que incrementa el trabajo por token.

## Limitaciones y advertencias

- El decoder no tiene versión int8: PT2E coloca un observador sobre el tensor `decoder_input_ids` int64, y la búsqueda de tokens falla con un error de índice flotante. Por tanto, la cuantización int8 solo está disponible en el encoder.
- La decodificación sin KV cache obliga a un forward pass completo de 128 posiciones por cada token generado, lo que incrementa la latencia en textos largos.
- La ventana fija de 128 tokens limita la transcripción a 30 segundos de audio por ventana; para audio más largo es necesario segmentar y reiniciar el proceso.
- No se generan timestamps (`<|notimestamps|>`), por lo que no se pueden obtener marcas de tiempo en la transcripción.
- El tamaño del decoder `.pte` es mayor que los pesos reales del decoder, porque los pesos compartidos entre `proj_out.weight` y `decoder.embed_tokens.weight` se duplican en el grafo (una copia para la tabla de embeddings y otra para el blob de XNNPACK). Esto puede aumentar el uso de memoria en dispositivos con almacenamiento limitado.
- Los tiempos de inferencia se midieron en una Mac arm64 con ExecuTorch 1.4.0 y torch 2.5.0; no se garantizan los mismos resultados en otros dispositivos o versiones.
- El modelo hereda las limitaciones de Whisper-base en cuanto a sesgos y alucinaciones en la transcripción, especialmente en acentos o ruido de fondo, aunque no se documentan sesgos específicos en la model card.
- La licencia Apache-2.0 permite uso comercial, pero la atribución al autor de la conversión es obligatoria. El modelo original de Whisper está bajo licencia MIT, por lo que no hay restricciones de uso comercial.

## Enlaces

- [HuggingFace: mlboydaisuke/Whisper-base-ExecuTorch](https://huggingface.co/mlboydaisuke/Whisper-base-ExecuTorch)
- [Colección ExecuTorch Model Zoo en HuggingFace](https://huggingface.co/collections/mlboydaisuke/executorch-model-zoo)
- [GitHub: pytorch/executorch](https://github.com/pytorch/executorch)
- [Documentacion oficial de ExecuTorch](https://executorch.ai/)
- [Ejemplo de Whisper en ExecuTorch (GitHub)](https://github.com/pytorch/executorch/blob/main/examples/models/whisper/README.md)
- [Scripts de conversión: executorch-models](https://github.com/john-rocky/executorch-models)
