# moonbox-dev/MossFormerGAN_SE_16K-ONNX

## Resumen

MossFormerGAN_SE_16K-ONNX es una exportación a formato ONNX del modelo de mejora de voz MossFormerGAN_SE_16K, desarrollado originalmente por Alibaba (alibabasglab) dentro del proyecto ClearerVoice-Studio. Este repositorio, publicado por moonbox-dev, empaqueta el generador MossFormer del modelo original como un grafo ONNX único, pensado para inferencia en dispositivo con ONNX Runtime sobre CPU, CUDA o DirectML. Resuelve el problema de la supresión de ruido en voz a 16 kHz, convirtiendo una señal ruidosa en una versión limpia sin necesidad de PyTorch en producción.

La relevancia del artefacto está en su ligereza y su fidelidad: los ficheros pesan entre 11,2 y 12,2 MB, y las versiones fp16 e int8 reproducen la calidad del modelo PyTorch original con diferencias de SI-SDR de décimas de dB. El modelo base es un generador MossFormer entrenado con un discriminador métrico, lo que permite obtener métricas de calidad perceptual (PESQ, STOI, SI-SDR) elevadas sobre el conjunto de test VoiceBank-DEMAND.

La arquitectura subyacente es un transformer con atención sobre ventanas de hasta 8192 frames (unos 51 segundos), aunque el preprocesado y postprocesado de señal (STFT, compresión de ley de potencia, normalización e iSTFT) quedan fuera del grafo y deben implementarse por separado, típicamente reutilizando el código de ClearerVoice. El modelo no es de propósito general: es un componente especializado de un solo paso (audio a audio) para limpieza de voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Generador MossFormer (transformer con atención) exportado como grafo ONNX único |
| Parametros totales | no disponible (tamaño de fichero 11,2-12,2 MB según precisión) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | hasta 8192 frames de STFT por llamada (~51 s); ClearerVoice procesa ficheros largos en ventanas de 10 s |
| Tipos de cuantizacion | fp16, int8 (weight-only); no hay int4 ni bf16 publicados |
| Idiomas soportados | no disponible (procesamiento de señal, independiente del idioma) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (`fp16/model.onnx`, `int8/model.onnx`) |

## Arquitectura y entrenamiento

El modelo es el generador de MossFormerGAN_SE_16K, un transformer que opera sobre el espectro comprimido de la señal ruidosa y produce las partes real e imaginaria del espectro mejorado. La entrada del grafo es `spec` con forma [1, 2, T, 201] (partes real e imaginaria de una STFT de 400 puntos, hop 100, ventana Hamming, compresión de ley de potencia con exponente 0,3), y las salidas son `real` e `imag` con forma [1, 1, T, 201]. La atención se aplica sobre toda la ventana, de modo que el consumo de memoria crece con el cuadrado de su longitud (aproximadamente 1 GB por paso de atención en un clip de 10 s).

El entrenamiento original combina un generador MossFormer con un discriminador métrico, un esquema adversarial orientado a optimizar métricas de calidad de voz. Los detalles sobre el número de tokens de entrenamiento, la composición del dataset o el uso de RLHF/DPO no están disponibles en la información proporcionada. La innovación técnica principal de esta exportación es la cuantización selectiva: los pesos de todas las MatMul, Gemm y Conv se cuantizan a int8 por canal de salida manteniendo las activaciones en fp32, y las tablas rotatorias idénticas de los 12 módulos de atención se almacenan una sola vez. Se descartó int4 porque degradaba 459 de los 824 ficheros de test por debajo de -0,5 dB (peor caso -3,53 dB) a cambio de solo 0,6 MB de ahorro, y bf16 por falta de soporte de convolución bf16 en ONNX Runtime.

## Capacidades

- Mejora de voz (speech enhancement) a 16 kHz: elimina ruido de fondo de grabaciones de voz mono.
- Supresión de ruido (noise suppression) y denoising sobre señal de audio.
- Conversión audio-a-audio de un solo paso, sin generación de texto ni comprensión semántica.
- Procesamiento por ventanas: admite hasta 8192 frames por llamada y ficheros largos mediante ventanas de 10 s en el código de ClearerVoice.
- Ejecución en dispositivo con ONNX Runtime sobre CPU, CUDA y DirectML.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües; es un componente puramente de procesamiento de señal.

## Casos de uso

- Limpieza de llamadas y reuniones: integrar el grafo en un pipeline de VoIP o videoconferencia para eliminar ruido de fondo antes de la codificación, con un coste de 0,18-0,20 de factor de tiempo real en GPU y ficheros de 11-12 MB.
- Preprocesado para ASR: aplicar la mejora antes de un sistema de reconocimiento de voz para elevar la relación señal-ruido; el modelo está entrenado sobre VoiceBank-DEMAND y mejora PESQ de 1,97 a 3,34 en ese conjunto.
- Grabación en movilidad: limpiar audio capturado con micrófonos de portátil o móvil en un cliente de escritorio usando el proveedor DirectML o CPU de ONNX Runtime, sin dependencia de PyTorch.
- Transcripción de entrevistas y podcasts: procesar ficheros largos en ventanas de 10 s con ClearerVoice para reducir ruido de sala antes de la transcripción o la publicación.
- Telefonía y atención al cliente: limpiar audio de centros de llamadas en tiempo real en GPU (factor de tiempo real 0,18-0,20) para mejorar la inteligibilidad percibida.
- Investigación en mejora de voz: servir como referencia ONNX reproducible para comparar cuantizaciones (fp16, int8) frente al original PyTorch con métricas PESQ, STOI y SI-SDR.
- Despliegue en dispositivos sin GPU: usar la variante int8 en CPU para clips cortos, asumiendo un factor de tiempo real de aproximadamente 7 (unas 7 veces más lento que tiempo real en un portátil).

## Benchmarks y rendimiento

Resultados sobre el conjunto de test VoiceBank-DEMAND (824 utterances de dos hablantes no vistos), remuestreado a 16 kHz y mejorado con el código de decodificación de ClearerVoice. PESQ es banda ancha (ITU-T P.862.2); STOI y SI-SDR se calculan contra la voz limpia. "vs fp32" es el SI-SDR de cada salida frente al grafo fp32, media / peor fichero. Factor de tiempo real medido en una RTX 3080 Laptop GPU, o con 4 hilos de CPU Intel en las filas de CPU.

| Modelo | Ficheros | PESQ | STOI | SI-SDR (dB) | vs fp32 (dB) | Peor fichero | Factor tiempo real |
|---|---|---|---|---|---|---|---|
| Entrada ruidosa | 824 | 1,97 | 0,921 | 8,39 | - | - | - |
| Original PyTorch fp32 (CPU) | primeros 50 | 3,442 | 0,9485 | 20,81 | - | - | 3,9 |
| ONNX fp32 (CUDA, no publicado) | primeros 50 | 3,442 | 0,9485 | 20,81 | - | -0,00 dB vs original | - |
| ONNX fp32 (CUDA, no publicado) | 824 | 3,342 | 0,9570 | 19,77 | - | - | 0,18 |
| fp16 (CUDA) | 824 | 3,342 | 0,9570 | 19,77 | 59,8 / 57,2 | -0,05 dB | 0,20 |
| int8 (CUDA) | 824 | 3,344 | 0,9570 | 19,75 | 44,4 / 41,3 | -0,16 dB | 0,18 |
| int8 (CPU) | primeros 20 | 3,514 | 0,9710 | 21,19 | 43,6 / 41,1 | -0,08 dB | 7,0 |
| int4 (no publicado) | 824 | 3,334 | 0,9560 | 19,02 | 28,0 / 20,1 | -3,53 dB (459 ficheros por debajo de -0,5) | 0,18 |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; la memoria de atención crece con el cuadrado de la longitud de ventana (aproximadamente 1 GB por paso de atención en un clip de 10 s). En CUDA conviene activar la opción `memory.enable_memory_arena_shrinkage` = `gpu:0` para evitar acumulación de buffers entre clips de distinta longitud.
- GPU recomendadas: los benchmarks se midieron en una RTX 3080 Laptop; cualquier GPU compatible con CUDA o DirectML debería servir. No se publican requisitos para A100 o H100.
- Cabe en GPU de consumo: sí, el modelo pesa 11,2-12,2 MB y el factor de tiempo real medido es 0,18-0,20 en una RTX 3080 Laptop.
- CPU: la variante int8 funciona en el proveedor CPU, pero es unas 7 veces más lenta que tiempo real en un portátil (el original PyTorch es 4 veces más lento), por lo que solo es apta para clips cortos.
- Opciones de despliegue: ONNX Runtime con proveedores CPU, CUDA o DirectML; el pipeline de referencia usa la función `decode_one_audio` de `clearvoice==0.1.2` sustituyendo la red por el grafo ONNX.
- Latencia y throughput: factor de tiempo real 0,18-0,20 en GPU (fp16 e int8) y 7,0 en CPU (int8); no se publican valores de latencia absoluta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PESQ (VoiceBank-DEMAND) | Licencia | Formato |
|---|---|---|---|---|---|
| MossFormerGAN_SE_16K-ONNX (fp16/int8) | no disponible (11,2-12,2 MB) | hasta 8192 frames (~51 s) | 3,342 / 3,344 | apache-2.0 | ONNX |
| MossFormerGAN_SE_16K original (PyTorch) | no disponible | ventanas de 10 s en ClearerVoice | 3,442 (primeros 50 ficheros) | no disponible | PyTorch |
| Otras alternativas de mejora de voz | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de otros modelos de mejora de voz en la información proporcionada, por lo que la comparativa se limita al modelo original frente a sus exportaciones ONNX.

## Limitaciones y advertencias

- El grafo solo contiene el generador: la normalización, la STFT, la compresión de ley de potencia y la iSTFT deben implementarse fuera, tal como hace el código de ClearerVoice; usarlo sin ese preprocesado produce resultados incorrectos.
- La atención crece con el cuadrado de la longitud de ventana (aproximadamente 1 GB por paso de atención en 10 s), lo que limita el procesamiento de clips largos en memoria.
- En CUDA, sin activar la reducción del arena de memoria, los buffers se acumulan entre clips de distinta longitud.
- La variante int8 en CPU es aproximadamente 7 veces más lenta que tiempo real en un portátil; no es adecuada para streaming en CPU.
- No hay versiones int4 ni bf16: int4 degrada 459 de 824 ficheros por debajo de -0,5 dB y bf16 no está soportado por ONNX Runtime.
- Es un modelo especializado en voz a 16 kHz mono; no procesa otros idiomas de forma semántica ni otras modalidades, y no se documentan sesgos específicos.
- Riesgo de artefactos o alucinación de señal: como todo modelo generativo de audio, puede introducir artefactos en condiciones alejadas del dominio de entrenamiento (VoiceBank-DEMAND).
- Licencia apache-2.0 en este repositorio, pero la licencia del modelo base (alibabasglab/MossFormerGAN_SE_16K) no se detalla en la información disponible; conviene verificarla antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo figura como 0.0 GB, lo que sugiere que los ficheros pueden no estar completamente subidos o indexados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/MossFormerGAN_SE_16K-ONNX
- Modelo base: https://huggingface.co/alibabasglab/MossFormerGAN_SE_16K
- Fichero fp16: https://huggingface.co/moonbox-dev/MossFormerGAN_SE_16K-ONNX/blob/main/fp16/model.onnx
- Fichero int8: https://huggingface.co/moonbox-dev/MossFormerGAN_SE_16K-ONNX/blob/main/int8/model.onnx
