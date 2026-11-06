# doanhlt/cabin-asr-eu-parakeet-tdt-offline-r1

## Resumen

cabin-asr-eu-parakeet-tdt-offline-r1 es un modelo de reconocimiento automático del habla (ASR) offline para frances, aleman, espanol e italiano, publicado por el usuario doanhlt como candidato para la aplicacion Cabin Offline. Se trata de un fine-tune del modelo NVIDIA Parakeet TDT 0.6B v3 (arquitectura FastConformer con decodificador TDT, es decir, un transducer) sobre habla de YouTube etiquetada con el pipeline R13x y con replay de FLEURS, exportado al formato int8 que consume sherpa-onnx.

El modelo resuelve un problema concreto de despliegue en dispositivo: el paquete int8 oficial de Parakeet v3 pierde entre 0.4 y 2.5 puntos de WER por celda respecto a sus propios pesos fp32, debido a que las convoluciones depthwise del conformer llevan la BatchNorm plegada y algunos canales alcanzan magnitudes de |w| ≈ 100-240 frente a una mediana de 0.27, lo que con una unica escala uint8 por tensor anula entre el 54 % y el 93 % de los canales de ciertas capas. Este paquete mantiene en fp32 las 5 convoluciones de `pre_encode` y las 24 convoluciones depthwise (menos del 0.1 % de los pesos) y cuantiza el resto, igualando practicamente el WER de los pesos fp32 con un tamano de 640.5 MiB.

Es relevante ahora porque demuestra que el deterioro de la cuantizacion int8 en transducers conformer es corregible sin QAT ni calibracion estatica, y porque conserva exactamente las mismas entradas de grafo, metadatos y nombres de fichero que el paquete `sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8`, de modo que la aplicacion puede intercambiar el modelo por directorio. El estado es candidato: aun no se ha medido en capturas reales de telefono ni en velocidad sobre ARM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer + decodificador TDT (transducer), exportado a ONNX |
| Parametros totales | 0.6B (heredados de nvidia/parakeet-tdt-0.6b-v3) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 dinamico por tensor para MatMul y convoluciones pointwise; fp32 para las 5 convoluciones de `pre_encode` y las 24 convoluciones depthwise; decoder y joiner en QInt8 |
| Idiomas soportados | frances (fr), aleman (de), espanol (es), italiano (it) |
| Licencia | cc-by-4.0 |
| Formato de pesos | ONNX (`encoder.int8.onnx`, `decoder.int8.onnx`, `joiner.int8.onnx`), `tokens.txt`; estado fp32 en PyTorch (`nemo/best.pt`) |

## Arquitectura y entrenamiento

El modelo parte de NVIDIA Parakeet TDT 0.6B v3, un transducer con encoder FastConformer y decodificador TDT. El fine-tune se realizo sobre habla de YouTube etiquetada por el pipeline R13x, complementada con replay de FLEURS, y se exporto a ONNX con el recetario de sherpa-onnx. Los datos de entrenamiento incluyen los datasets `espnet/yodas2` y `google/fleurs`; el repositorio adjunta en `attribution/yodas2_video_ids.txt` los identificadores de video de YouTube de cada clip de entrenamiento de YODAS2 (CC BY 3.0). No se especifica en la informacion disponible el numero total de tokens de audio ni si hubo etapas de RLHF o DPO, algo que no aplica de forma habitual en ASR.

La innovacion tecnica principal es la correccion de la cuantizacion: en lugar de aplicar `quantize_dynamic` a todos los MatMul y Conv, se excluyen 29 nodos Conv (los 5 de `pre_encode` y los 24 depthwise) mediante `quantize_dynamic(nodes_to_exclude=...)`. El autor midio en onnxruntime la sensibilidad por bloques y comprobo que cuantizar todo excepto esos 29 nodos mueve la salida del encoder 2.5 veces menos que cuantizarlo todo, con WER igual al fp32. Se descartaron alternativas probadas sobre el gemelo en ingles: fp16 (doble tamano, 1.4 veces mas lento, 4 GB de RSS), int8 solo de pesos con MatMulNBits block-128 (unas 2 veces mas lento en x86), int8 por canal (sin mejora) e int8 con todas las Conv en fp32 (+215 MB, misma precision). No se recurrio a int8 estatico calibrado ni a QAT.

## Capacidades

- Reconocimiento automatico del habla offline en frances, aleman, espanol e italiano.
- Transcripcion de audio con decodificacion transducer TDT, adecuada para streaming por bloques o inferencia por utterance.
- Ejecucion en dispositivo mediante sherpa-onnx, sin dependencia de red.
- Compatibilidad directa con el paquete `sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8`: mismas entradas de grafo, metadatos y nombres de fichero.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision, audio mas alla de ASR, ni modo de razonamiento explicito.

## Casos de uso

- Transcripcion offline en aplicaciones moviles: el paquete int8 de 640.5 MiB y un RSS de 1.0-1.4 GB permiten integrar ASR multilingue en una app sin conexion, sustituyendo el paquete oficial por directorio.
- Subtitulado de video en cuatro idiomas europeos: el fine-tune sobre habla de YouTube con etiquetas R13x reduce el WER en las referencias de YouTube held-out (por ejemplo, de 17.41 a 5.90 en frances con referencia R13x ∩ caption), lo que lo hace adecuado para generar subtitulos de contenido web.
- Notas de voz y dictado en espanol, frances, aleman o italiano: la ventana de contexto no esta documentada, pero el formato transducer permite decodificar utterances completas o en streaming con sherpa-onnx.
- Asistentes de voz embebidos en dispositivos sin GPU: al no requerir red ni acelerador dedicado, encaja en entornos de borde con CPU.
- Investigacion en cuantizacion de ASR: el repositorio incluye listas de exclusion, script de exportacion, decodificaciones por utterance, bootstraps pareados y analisis de sensibilidad por bloques, utiles para reproducir el metodo en otros transducers.
- Reentrenamiento y reexportacion: `nemo/best.pt` permite cargar el state_dict en `nvidia/parakeet-tdt-0.6b-v3` y generar nuevos fine-tunes o exportaciones.

## Benchmarks y rendimiento

Resultados de WER (%) con intervalos de confianza del 95 % por bootstrap pareado sobre utterances (10,000 remuestreos); el asterisco indica que el intervalo excluye el 0.

| Idioma | Conjunto (n) | int8 oficial | distill, receta int8 oficial | distill, este paquete | distill NeMo fp32 | este − oficial | este − fp32 |
|---|---|---|---|---|---|---|---|
| fr | FLEURS-100 test (100) | 7.32 | 6.99 | 4.66 | 4.77 | -2.65 [-3.72, -1.65] * | -0.11 [-0.60, +0.38] |
| fr | YT held-out, ref = R13x ∩ caption (269) | 17.41 | 6.97 | 5.90 | 5.41 | -11.51 [-15.15, -8.17] * | +0.48 [+0.03, +0.92] * |
| fr | YT held-out, ref = caption (321) | 34.09 | 26.63 | 24.86 | 24.78 | -9.24 [-12.60, -6.18] * | +0.08 [-0.36, +0.50] |
| de | FLEURS-100 test (100) | 7.18 | 6.68 | 5.03 | 4.98 | -2.15 [-3.17, -1.16] * | +0.05 [-0.38, +0.48] |

La informacion disponible no incluye el resto de celdas de la tabla (de YT held-out, es e it) ni resultados de benchmarks estandar como MMLU, HumanEval o GSM8K, que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM/RSS estimado: las variantes int8 se mantienen en 1.0-1.4 GB de RSS pico; la variante fp16 requiere 4 GB. El autor advierte de variaciones de hasta ±250 MB entre paquetes y numero de hilos sin signo consistente (crecimiento de arena de onnxruntime).
- GPU recomendadas: no se especifican en la informacion disponible; el modelo esta pensado para ejecucion en CPU via sherpa-onnx.
- Cabe en GPU consumer: no hay datos de VRAM en GPU; el consumo de memoria en CPU (1.0-1.4 GB) sugiere que cabe en equipos de gama baja, aunque no se confirma.
- Opciones de despliegue: sherpa-onnx (libreria declarada), con paquete ONNX compatible con el paquete oficial de Parakeet v3 int8. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no medidos en la informacion disponible; el autor indica que la velocidad en dispositivo (ARM) y en capturas reales de telefono aun no se ha medido y condiciona el envio a produccion. Si se senala que las convoluciones en fp32 son mas rapidas que el ConvInteger de onnxruntime y que la variante MatMulNBits block-128 es unas 2 veces mas lenta en x86.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | WER relevante |
|---|---|---|---|---|---|---|
| cabin-asr-eu-parakeet-tdt-offline-r1 (este) | 0.6B | no disponible | fr, de, es, it | cc-by-4.0 | ONNX int8 + fp32 parcial | fr FLEURS 4.66; de FLEURS 5.03 |
| sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8 (oficial) | 0.6B | no disponible | multilingue (v3) | no disponible en la informacion | ONNX int8 | fr FLEURS 7.32; de FLEURS 7.18 |
| Parakeet TDT 0.6B v3 fp32 (NeMo) | 0.6B | no disponible | multilingue (v3) | no disponible en la informacion | PyTorch/NeMo | fr FLEURS 4.77; de FLEURS 4.98 |
| Gemelo en ingles del fine-tune (mencionado como control) | 0.6B | no disponible | en | no disponible en la informacion | ONNX int8 | usado para probar alternativas de cuantizacion; sin cifras completas |

No se dispone de datos de otros modelos ASR comparables (por ejemplo Whisper) en la informacion proporcionada.

## Limitaciones y advertencias

- Estado candidato: no medido en capturas reales de telefono ni en velocidad sobre ARM; esos dos puntos condicionan el envio a produccion segun el autor.
- El fine-tune se entreno con etiquetas del pipeline R13x, por lo que puede heredar sus sesgos y errores; el WER frente a la referencia de caption bruta es alto (24.86 en frances), aunque R13x mismo puntua 24-47 % en esa referencia.
- Riesgo de alucinacion en transcripciones: como todo modelo generativo de secuencias, puede producir texto plausible no presente en el audio, especialmente con ruido o acentos no representados.
- Cobertura limitada a cuatro idiomas (fr, de, es, it); no se documenta soporte de otros idiomas ni de code-switching.
- La licencia cc-by-4.0 permite uso comercial con atribucion, pero el modelo base NVIDIA Parakeet y los datasets de entrenamiento (YODAS2 CC BY 3.0, FLEURS) pueden imponer condiciones adicionales que no se detallan en la informacion disponible.
- El rendimiento depende del recetario de exportacion: reexportar con la receta estandar de sherpa-onnx reintroduce la perdida de 0.4-2.5 puntos de WER descrita.
- El consumo de memoria pico varia hasta ±250 MB entre ejecuciones y numero de hilos, lo que complica el dimensionamiento en dispositivos con memoria ajustada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/doanhlt/cabin-asr-eu-parakeet-tdt-offline-r1
- Coleccion Cabin offline ASR: https://huggingface.co/collections/doanhlt/cabin-offline-asr-on-device-distilled-from-r13x-6ade0b05eb1f2ac4e49d7cf8
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Dataset YODAS2: https://huggingface.co/datasets/espnet/yodas2
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Codigo: repositorio privado `thinkprompt/cabin-offline-asr`, rama `feat/mobile-local-kit`, directorio `mobile-local/train/parakeet/` (no accesible publicamente)
- No se han encontrado en la busqueda web papers, blogs, repos publicos ni demos adicionales.
