# ijar/parakeet-ultra-onnx-latin-int8

## Resumen

Parakeet Ultra ONNX Latin int8 es una exportación a ONNX del modelo de reconocimiento automático del habla (ASR) Parakeet Ultra de Moondream, a su vez derivado de Parakeet TDT 0.6B v3 de NVIDIA. La variante que nos ocupa, publicada por el usuario ijar, incorpora dos modificaciones concretas: el codificador se sirve en cuantización int8 (bajo el nombre de fichero fp32) y el decodificador conjunta incorpora una máscara que rebaja el sesgo final en 10.000 unidades para los 1.720 tokens con letras cirílicas o griegas, de modo que la decodificación voraz no pueda emitirlos. El resultado es un modelo orientado a transcripción en alfabeto latino para rumano e inglés.

El modelo emplea la arquitectura NeMo Conformer con decodificación TDT (Token-and-Duration Transducer), empaquetada para la librería onnx-asr con el identificador `nemo-conformer-tdt`. El repositorio ocupa 0,8 GB y está pensado para inferencia en CPU mediante onnxruntime, sin necesidad de GPU, lo que lo hace atractivo para despliegues domésticos y de borde.

Su relevancia actual reside en dos factores: por un lado, ofrece un ASR de calidad competitiva (WER del 10,80 % en FLEURS ro_ro dev) con un consumo de memoria pico de 2,0 GB en CPU; por otro, la máscara de tokens latinos resuelve un problema práctico muy específico, como son los comandos de voz en rumano dentro de Home Assistant, donde la emisión espuria de caracteres cirílicos degradaba la integración con el resto del sistema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeMo Conformer con decodificador TDT (Token-and-Duration Transducer) |
| Parametros totales | 0,6B (heredados de Parakeet TDT 0.6B v3) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (codificador, MatMulNBits 8-bit); decodificador en el formato del repo base |
| Idiomas soportados | rumano (ro), ingles (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (encoder-model.onnx, decoder_joint-model.onnx) + config.json, vocab.txt |

## Arquitectura y entrenamiento

La arquitectura subyacente es un Conformer, es decir, un transformer que combina bloques de autoatención con convoluciones depthwise para capturar dependencias locales y globales en la señal acústica. Sobre él se monta un decodificador TDT, una variante de transducer que predice conjuntamente tokens y duraciones, lo que permite emitir varios tokens por fotograma y reduce el coste de decodificación frente a un CTC o un transducer clásico. El modelo parte de Parakeet TDT 0.6B v3 de NVIDIA y ha sido posteriormente adaptado por Moondream como Parakeet Ultra.

La exportación a ONNX corre a cargo de maaaaat (codificador int8, opset 23, requiere onnxruntime ≥ 1.23) e ijar (máscara de tokens y empaquetado para onnx-asr). No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o ajuste supervisado adicional en esta variante. La innovación técnica destacable es la manipulación directa del sesgo de la capa de salida de la red conjunta (`joint.joint_net.2.bias`), que actúa como un filtro determinista sobre el vocabulario de salida sin necesidad de post-procesado textual.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto) en rumano e inglés.
- Decodificación TDT con predicción conjunta de tokens y duraciones, adecuada para audio continuo.
- Restricción determinista del vocabulario de salida al alfabeto latino: no puede emitir caracteres cirílicos ni griegos gracias a la máscara de sesgo.
- Inferencia en CPU mediante onnxruntime, sin dependencia de GPU.
- Integración con la librería onnx-asr bajo el identificador `nemo-conformer-tdt`.
- No dispone de soporte documentado de tool calling, agentes, visión, audio de entrada más allá del propio ASR, ni modo de razonamiento explícito.

## Casos de uso

- Comandos de voz en Home Assistant: el modelo se cargaría en onnx-asr sin opción de cuantización y transcribiría las órdenes en rumano; la máscara de tokens latinos evita que la decodificación voraz introduzca caracteres cirílicos que romperían el emparejamiento con las intenciones configuradas.
- Transcripción de reuniones en rumano o inglés: con 2,0 GB de memoria pico en CPU, puede ejecutarse en un servidor modesto o incluso en un mini-PC para generar actas o subtítulos diferidos.
- Subtitulado automático de vídeo: la salida en alfabeto latino garantiza compatibilidad directa con formatos SRT y con reproductores que no gestionan bien mezclas de alfabetos.
- Dictado por voz en aplicaciones de escritorio: al no requerir GPU, puede integrarse en herramientas ofimáticas o editores que corren en portátiles convencionales.
- Procesamiento por lotes de archivos de audio en pipelines de datos: la exportación ONNX permite ejecutar la inferencia con onnxruntime dentro de contenedores ligeros sin stack de CUDA.
- Transcripción de audio para indexación y búsqueda: útil en archivística o atención al cliente donde se necesita convertir grabaciones rumanas o inglesas en texto consultable.
- Prototipado rápido de ASR en entornos sin GPU: la diferencia de WER frente al codificador fp32 (10,80 % vs 10,84 %) hace que la variante int8 sea una opción razonable para desarrollo y pruebas.

## Benchmarks y rendimiento

| Benchmark | Codificador int8 (esta variante) | Codificador fp32 (mismo decodificador) |
|---|---|---|
| FLEURS ro_ro dev, WER | 10,80 % | 10,84 % |
| FLEURS ro_ro dev, CER | 3,60 % | 3,59 % |
| Memoria pico | 2,0 GB | 2,8 GB |

Medición realizada sobre 387 grabaciones de FLEURS ro_ro dev con onnx-asr 0.10.1 y onnxruntime 1.24.1 en CPU. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que se trata de un modelo ASR y no de un modelo de lenguaje general.

## Requisitos de hardware

- VRAM estimada: no aplica en el escenario medido; la inferencia se realiza en CPU con un pico de memoria de 2,0 GB.
- GPU recomendadas: no se documentan; el modelo está empaquetado para onnxruntime y no requiere GPU.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 2-3 GB de memoria libre si se opta por ejecutar onnxruntime con proveedor CUDA, aunque no es el modo validado por el autor.
- Opciones de despliegue: onnx-asr (versión 0.10.1 o superior en las pruebas) sobre onnxruntime ≥ 1.23; también es posible cargarlo con onnxruntime directamente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ijar/parakeet-ultra-onnx-latin-int8 | 0,6B | ro, en | ONNX int8 | CC BY 4.0 | Esta variante; máscara de tokens latinos |
| ijar/parakeet-ultra-onnx-latin | 0,6B | ro, en | ONNX fp32 | CC BY 4.0 | Mismo decodificador, codificador fp32; WER 10,84 % |
| maaaaat/parakeet-ultra-onnx | 0,6B | no disponible | ONNX int8 | no disponible | Exportación original del codificador int8 |
| moondream/parakeet-ultra | 0,6B | no disponible | no disponible | no disponible | Modelo base de Moondream |
| NVIDIA Parakeet TDT 0.6B v3 | 0,6B | no disponible | no disponible | no disponible | Modelo original de NVIDIA |

La comparativa se limita a la familia Parakeet porque no se dispone de datos de otros modelos ASR comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta rumano e inglés de forma declarada; no hay evidencia de buen rendimiento en otros idiomas.
- La máscara de tokens elimina cirílico y griego del vocabulario de salida, lo que impide transcribir correctamente cualquier audio que contenga esos alfabetos, incluso si el idioma fuese el adecuado.
- El codificador int8 se almacena bajo el nombre de fichero fp32, lo que puede confundir a herramientas que inspeccionen el nombre para decidir la ruta de cuantización; debe cargarse sin opción de cuantización en onnx-asr.
- Requiere onnxruntime ≥ 1.23 por el uso de MatMulNBits con opset 23; versiones anteriores fallarán al cargar el modelo.
- Riesgo de alucinación inherente a los modelos transducer en segmentos de silencio o ruido; no se documentan mecanismos de detección de voz integrados.
- Sesgos: no se documentan evaluaciones de sesgo por acento, género o edad; el rendimiento en FLEURS ro_ro no garantiza un comportamiento homogéneo en dominios como audio telefónico o con ruido de fondo.
- Licencia CC BY 4.0 permite uso comercial con atribución, pero ni NVIDIA ni Moondream avalan estos ficheros; la atribución debe incluir a NVIDIA (modelo original), Moondream (Parakeet Ultra), maaaaat (exportación ONNX e int8) e ijar (máscara de tokens).
- No se han publicado métricas de latencia ni throughput, por lo que la planificación de capacidad en producción requiere medición propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ijar/parakeet-ultra-onnx-latin-int8
- Variante fp32 con el mismo decodificador: https://huggingface.co/ijar/parakeet-ultra-onnx-latin
- Exportación ONNX original del codificador int8: https://huggingface.co/maaaaat/parakeet-ultra-onnx
- Modelo base de Moondream: https://huggingface.co/moondream/parakeet-ultra
- Librería onnx-asr: https://github.com/istupakov/onnx-asr
- Ficha en free2aitools: https://free2aitools.com/model/ijar/parakeet-ultra-onnx-latin
