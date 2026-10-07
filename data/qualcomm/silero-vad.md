# qualcomm/Silero-VAD

## Resumen

Silero-VAD es un detector de actividad de voz (Voice Activity Detection, VAD) compacto y orientado a produccion, distribuido por Qualcomm en su HuggingFace como exportacion optimizada para dispositivos Snapdragon y Dragonwing. El modelo original procede del proyecto Silero-VAD de snakers4 (referencia arXiv 2108.10447), y esta version concreta incluye pesos ya exportados a ONNX, QNN_DLC y TFLITE, listos para ejecutarse sobre la NPU de los SoC de Qualcomm.

Tecnicamente no es un modelo de lenguaje: es un clasificador de audio binario construido sobre una arquitectura LSTM que procesa tramas de 512 muestras (32 ms a 16 kHz) y devuelve una probabilidad de habla por trama. Con solo 0,24 millones de parametros y 2,27 MB en coma flotante, su interes reside en el coste computacional casi nulo y en la latencia de decenas de microsegundos, lo que lo hace apto para deteccion de voz en tiempo real en movil, PC con Snapdragon o dispositivos embebidos.

Su relevancia practica esta en ser una pieza de infraestructura: se coloca delante de un ASR o un asistente conversacional para segmentar audio, reducir consumo y evitar transcripciones de silencio o ruido. La publicacion bajo licencia MIT y la disponibilidad de artefactos precompilados para NPU eliminan gran parte del trabajo de despliegue en el borde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM (red neuronal recurrente) para clasificacion de audio por tramas |
| Parametros totales | 0,24 M (aproximadamente 240.000) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; procesa ventanas de 512 muestras (32 ms) a 16 kHz con estado recurrente entre ventanas |
| Tipos de cuantizacion | float (FP32) y w8a16_mixed_int16 |
| Idiomas soportados | multilingue (entrenado sobre un corpus multilingue); no se detallan idiomas concretos |
| Licencia | MIT |
| Formato de pesos | PyTorch, ONNX, QNN_DLC (QAIRT), TFLITE |
| Tamano del modelo (float) | 2,27 MB |
| Frecuencia de muestreo soportada | 16.000 Hz |
| Resolucion de entrada | 512 muestras (32 ms a 16 kHz) |
| Salida | probabilidad de habla por trama |
| Casos de uso declarados | voice_activity_detection |

## Arquitectura y entrenamiento

La model card describe una arquitectura basada en LSTM que consume tramas de 32 ms a 16 kHz y emite una probabilidad de habla por trama explicitamente. El modelo mantiene estado entre ventanas, lo que permite un funcionamiento continuo tanto en streaming como sobre ficheros completos. No se detalla en la informacion proporcionada el numero de capas, el tamano del estado oculto, la composicion exacta del dataset ni si hubo fases de ajuste fino con RLHF o DPO; esos datos no estan disponibles.

La aportacion de este repositorio no es el entrenamiento, sino la cadena de exportacion y optimizacion para hardware Qualcomm. Qualcomm AI Hub Models (version v0.64.0) compila, perfila y evalua el modelo, generando artefactos para ONNX Runtime 1.30.0, QAIRT 2.50 y QNN_DLC, ademas de TFLITE. La variante cuantizada w8a16_mixed_int16 combina pesos de 8 bits con activaciones de 16 bits, un esquema mixto habitual para recurrencias, donde cuantizar el estado a 8 bits degrada la precisicion. El modelo se ejecuta principalmente en la NPU segun la tabla de rendimiento publicada.

## Capacidades

- Deteccion de actividad de voz binaria: genera una probabilidad de habla para cada trama de 32 ms.
- Funcionamiento en streaming: mantiene estado recurrente, por lo que puede alimentarse trama a trama en tiempo real.
- Procesamiento de ficheros: aplicable tambien a audio completo ya grabado.
- Multilingue: entrenado sobre un corpus multilingue, segun la model card (idiomas concretos no disponibles).
- Independiente del contenido: al detectar voz y no palabras, funciona igual con cualquier idioma y con habla no transcrita.
- Despliegue en el borde: artefactos preexportados para NPU de Qualcomm (Snapdragon 8 Gen 1/3, 8 Elite, X Elite, X2 Elite, Dragonwing IQ-8275, IQ-9075, IQ-X7181, QCS8450, QCS8550, Q-8750, Q-6690, Q-7790, entre otros).
- Exportacion personalizada: la libreria ai-hub-models permite recompilar con pesos ajustados, formas de entrada propias y dispositivo objetivo distinto.
- No dispone de generacion de texto, tool calling, capacidades de agente ni vision; no es un modelo de lenguaje.

## Casos de uso

- Segmentacion previa a ASR: colocar el VAD delante de un motor de reconocimiento de voz para enviar unicamente los tramos con habla, reduciendo coste de computo y evitando alucinaciones del transcriptor sobre silencio o ruido.
- Asistentes de voz en movil: deteccion continua de voz con un consumo minimo (2,27 MB y decimas de milisegundo por trama en NPU), lo que permite mantener la escucha activa sin agotar bateria.
- Push-to-talk y deteccion de inicio/fin de turno: delimitar el comienzo y el final de la intervencion del usuario en interfaces conversacionales, evitando cortes prematuros.
- Voz sobre IP y transmision en tiempo real: aplicar discontinuous transmission (DTX) apagando el envio de paquetes en los periodos sin habla, con el consiguiente ahorro de ancho de banda.
- Diarizacion y analisis de reuniones: generar una primera mascara de voz sobre la que aplicar despues segmentacion por hablante, reduciendo el trabajo del modelo de diarizacion.
- Limpieza de corpus de entrenamiento: filtrar grandes volumenes de audio bruto para descartar grabaciones sin voz antes de etiquetar o transcribir.
- Subtitulado en directo y accesibilidad: activar la captura de audio solo cuando hay habla, sincronizando mejor los subtitulos y evitando fragmentos vacios.
- Analitica de llamadas en contact center: medir tiempos de habla y silencio por canal para metricas operativas, ejecutandose en el propio dispositivo sin enviar audio a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precision (por ejemplo ROC-AUC o F1 sobre conjuntos de VAD) en la informacion disponible. La model card si incluye una tabla de rendimiento de inferencia por dispositivo, ejecutada sobre ONNX con unidad de computo principal NPU:

| Runtime | Precision | Chipset | Tiempo de inferencia (ms) | Memoria pico (MB) |
|---|---|---|---|---|
| ONNX | float | Snapdragon 8 Elite Gen 5 For Galaxy Mobile | 0,069 | 0 - 24 |
| ONNX | float | Snapdragon 8 Elite For Galaxy Mobile | 0,070 | 0 - 24 |
| ONNX | float | Snapdragon X2 Elite | 0,063 | 1 - 1 |
| ONNX | float | Snapdragon X Elite | 0,072 | 0 - 0 |
| ONNX | float | Snapdragon 8 Gen 3 Mobile | 0,078 | 0 - 35 |
| ONNX | float | Snapdragon 8 Gen 1 Mobile | 0,126 | 0 - 35 |
| ONNX | float | Qualcomm Dragonwing IQ-8275 | 0,334 | 0 - 4 |
| ONNX | float | Qualcomm Dragonwing QCS8550 (proxy) | 0,097 | 0 - 29 |
| ONNX | float | Qualcomm QCS8450 | 0,126 | 0 - 35 |
| ONNX | float | Qualcomm Dragonwing IQ-9075 | 0,214 | 0 - 3 |
| ONNX | float | Qualcomm Dragonwing IQ-X7181 | 0,072 | 0 - 0 |
| ONNX | float | Qualcomm Dragonwing Q-8750 | 0,070 | 0 - 24 |
| ONNX | w8a16_mixed_int16 | Snapdragon 8 Elite Gen 5 For Galaxy Mobile | 0,071 | 0 - 26 |
| ONNX | w8a16_mixed_int16 | Snapdragon 8 Elite For Galaxy Mobile | 0,078 | 0 - 25 |
| ONNX | w8a16_mixed_int16 | Snapdragon X2 Elite | 0,057 | 1 - 1 |
| ONNX | w8a16_mixed_int16 | Snapdragon X Elite | 0,073 | 0 - 0 |
| ONNX | w8a16_mixed_int16 | Snapdragon 8 Gen 3 Mobile | 0,084 | 0 - 34 |
| ONNX | w8a16_mixed_int16 | Qualcomm Dragonwing IQ-8275 | 0,165 | 0 - 4 |
| ONNX | w8a16_mixed_int16 | Qualcomm Dragonwing QCS8550 (proxy) | 0,099 | 0 - 2 |
| ONNX | w8a16_mixed_int16 | Qualcomm Dragonwing IQ-9075 | 0,195 | 0 - 3 |
| ONNX | w8a16_mixed_int16 | Qualcomm Dragonwing IQ-X7181 | 0,073 | 0 - 0 |
| ONNX | w8a16_mixed_int16 | Qualcomm Dragonwing Q-6690 | 0,280 | 0 - 24 |
| ONNX | w8a16_mixed_int16 | Qualcomm Dragonwing Q-7790 | 0,088 | datos truncados en la model card |

Nota: con 0,07 ms de inferencia por trama de 32 ms de audio, el factor de tiempo real es de aproximadamente 450x en los chipsets mas rapidos (calculo derivado de los datos anteriores). La tabla original no incluye resultados de calidad de deteccion, solo latencia y memoria.

## Requisitos de hardware

- VRAM: no requiere GPU. El modelo ocupa 2,27 MB en float y menos de 1 MB en w8a16_mixed_int16.
- Memoria pico medida: entre 1 MB y 35 MB segun chipset, con lo que cabe holgadamente en cualquier dispositivo movil actual.
- GPU dedicadas: no aplica, no necesita acelerador grafico; esta pensado para NPU de Qualcomm o CPU.
- Cabe en cualquier GPU de consumo: incluso una GTX 1050 o una iGPU son sobradamente suficientes si se ejecuta via ONNX Runtime en CPU/GPU.
- Aceleracion objetivo: NPU de Snapdragon 8 Gen 1, 8 Gen 3, 8 Elite, 8 Elite Gen 5, X Elite, X2 Elite, QCS8450, QCS8550, Dragonwing IQ-8275, IQ-9075, IQ-X7181, Q-8750, Q-6690 y Q-7790.
- Opciones de despliegue: ONNX Runtime 1.30.0, QAIRT 2.50 con QNN_DLC, TFLite, PyTorch nativo y la libreria ai-hub-models de Qualcomm para recompilar y perfilar.
- Latencia: entre 0,057 ms y 0,334 ms por trama de 32 ms segun chipset y precision, siempre sobre NPU.
- Throughput: no se publica una cifra agregada de tramas por segundo; puede derivarse de la latencia por trama, pero no se ofrece como dato oficial.
- Requisitos de integracion: SDK de Qualcomm AI Hub Workbench y cuenta para ejecutar sobre dispositivos alojados si se quiere reproducir el perfilado.

## Comparativa con modelos similares

La informacion proporcionada solo incluye datos de este modelo, por lo que los valores de las alternativas no pueden verificarse con las fuentes disponibles y se marcan como no disponibles. Se listan como referencia de categoria:

| Modelo | Enfoque | Parametros | Latencia publicada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Silero-VAD (qualcomm/Silero-VAD) | LSTM, 32 ms a 16 kHz, salida por trama | 0,24 M | 0,057 - 0,334 ms segun chipset (NPU) | MIT | HuggingFace, GitHub de Qualcomm AI Hub y ai-hub-models |
| WebRTC VAD | Deteccion clasica basada en GMM | no disponible | no disponible | no disponible en la informacion proporcionada | integrado en el stack WebRTC |
| pyannote/segmentation-3.0 | Red neuronal de segmentacion de habla | no disponible | no disponible | no disponible en la informacion proporcionada | HuggingFace |
| Silero-VAD upstream (snakers4) | LSTM, misma base que este modelo | no disponible en la informacion proporcionada | no disponible | MIT (segun el repositorio enlazado) | GitHub y PyPI |

No se dispone de comparaciones de precision entre estas alternativas dentro del material proporcionado.

## Limitaciones y advertencias

- Ambito estrictamente acotado: solo clasifica voz frente a no voz; no transcribe, no identifica hablantes y no genera texto.
- Umbral de decision dependiente del caso de uso: la salida es una probabilidad por trama, de modo que la eleccion del umbral y del suavizado temporal condiciona falsos positivos y falsos negativos. La model card no publica curvas de precision ni umbrales recomendados.
- Sin datos de precision publicados: no hay resultados de ROC-AUC, F1 ni evaluacion sobre un corpus concreto en la informacion disponible, por lo que el rendimiento real en un dominio especifico debe validarse localmente.
- Sensibilidad al ruido: no se documentan en el material proporcionado los resultados en condiciones de SNR bajo, musica, ruido de fondo intenso o habla superpuesta.
- Idioma: se declara entrenamiento multilingue, pero no se enumeran los idiomas cubiertos ni su cobertura relativa.
- Dependencia de la frecuencia de muestreo: el modelo trabaja a 16 kHz con tramas de 512 muestras; usar otra frecuencia o tamano de trama requiere remuestreo previo o reexportacion.
- Rendimiento atado al hardware Qualcomm: los tiempos de la tabla corresponden a NPU de Qualcomm. En CPU o GPU de terceros no se garantizan esas cifras.
- Licencia MIT: permite uso comercial y modificacion con atribucion; conviene conservar el aviso de copyright y las condiciones de los componentes derivados del proyecto Silero original.
- Posible desalineacion de versiones: los artefactos estan ligados a QAIRT 2.50, ONNX Runtime 1.30.0 y ai-hub-models v0.64.0; versiones distintas pueden requerir recompilacion.
- Metadatos de publicacion: el repositorio aparece creado y actualizado con un intervalo de un segundo, lo que sugiere una subida automatizada, no una revision manual del contenido.

## Enlaces

- HuggingFace: https://huggingface.co/qualcomm/Silero-VAD
- Ficha en Qualcomm AI Hub: https://aihub.qualcomm.com/models/silero_vad
- Repositorio del modelo en ai-hub-models (v0.64.0): https://github.com/qualcomm/ai-hub-models/blob/v0.64.0/src/qai_hub_models/models/silero_vad
- Libreria Qualcomm AI Hub Models: https://github.com/qualcomm/ai-hub-models
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Implementacion original de Silero-VAD: https://github.com/snakers4/silero-vad
- Paper de referencia (arXiv 2108.10447): https://arxiv.org/abs/2108.10447
- Artefactos preexportados:
  - ONNX float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/silero_vad/releases/v0.64.0/silero_vad-onnx-float.zip
  - ONNX w8a16_mixed_int16: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/silero_vad/releases/v0.64.0/silero_vad-onnx-w8a16_mixed_int16.zip
  - QNN_DLC float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/silero_vad/releases/v0.64.0/silero_vad-qnn_dlc-float.zip
  - QNN_DLC w8a16_mixed_int16: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/silero_vad/releases/v0.64.0/silero_vad-qnn_dlc-w8a16_mixed_int16.zip
  - TFLITE float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/silero_vad/releases/v0.64.0/silero_vad-tflite-float.zip
- Web Qualcomm: https://www.qualcomm.com/
