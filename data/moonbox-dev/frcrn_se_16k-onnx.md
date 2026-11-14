# moonbox-dev/FRCRN_SE_16K-ONNX

## Resumen

FRCRN_SE_16K-ONNX es una conversión a formato ONNX del modelo FRCRN (complex-valued convolutional recurrent network) de mejora de voz a 16 kHz, desarrollado originalmente por Alibaba y distribuido en su repositorio ClearerVoice-Studio. Esta versión, publicada por moonbox-dev, empaqueta el desuidador completo en un único grafo ONNX que incluye la STFT, la máscara compleja y la STFT inversa, de modo que la entrada es directamente la forma de onda ruidosa y la salida es la señal limpia. El objetivo es facilitar el despliegue en dispositivo (CPU, CUDA, DirectML) mediante ONNX Runtime sin depender de PyTorch.

El modelo resuelve el problema de supresión de ruido y mejora de inteligibilidad en audio de voz mono a 16 kHz, una tarea habitual en pipelines de ASR, telefonía, videoconferencia y asistentes de voz. La relevancia de esta conversión concreta reside en que preserva prácticamente la calidad del modelo original en fp32 (PESQ 3.033 frente a 3.035, STOI 0.9530 en ambos casos) con un grafo que se ejecuta en un factor de tiempo real de 0,087 sobre una RTX 3080 Laptop, y en que documenta con detalle qué cuantizaciones fallan (int8 e int4) y por qué.

No se trata de un modelo generativo ni de un LLM: es un modelo discriminativo de audio-audio, sin parámetros de contexto textual ni capacidades de razonamiento, código o visión. Su tamaño es de 29,4 MB en fp16 y su licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FRCRN: red convolucional recurrente de valores complejos sobre la STFT (complex-valued CRN) |
| Parametros totales | no disponible (pesos fp16 de 29,4 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; admite audio de longitud libre N y clips de hasta 120 s en una sola llamada segun el decodificador de ClearerVoice |
| Tipos de cuantizacion | fp16 (pesos en fp16 con matematicas fp32); int8 e int4 probados y descartados por perdida severa de calidad; bf16 no soportado (sin convolucion bf16 en ONNX Runtime) |
| Idiomas soportados | no disponible (modelo de procesamiento de senal, independiente del idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`fp16/model.onnx`), entrada `wave` [1, N] float, salida `enhanced` [1, N] float |

## Arquitectura y entrenamiento

FRCRN es una red convolucional recurrente que opera sobre la representacion tiempo-frecuencia compleja de la senal. La innovacion principal es que la propia red calcula la STFT mediante convoluciones, aplica una mascara compleja sobre el espectrograma y reconstruye la senal con la STFT inversa; todo ello queda incluido dentro del grafo ONNX exportado, de modo que el grafo constituye el desuidador completo. El modelo base es `alibabasglab/FRCRN_SE_16K`, parte de ClearerVoice-Studio, y esta conversion parte de la revision `3766e6a64b`.

Sobre los datos de entrenamiento del modelo original no se proporciona informacion en la documentacion disponible (numero de tokens o horas de audio, composicion del dataset, uso de RLHF o ajuste fino). La evaluacion publicada se realiza sobre el conjunto de test VoiceBank-DEMAND (824 enunciados de dos hablantes no vistos), remuestreado a 16 kHz y procesado con la normalizacion de sonoridad y el decodificador propios de ClearerVoice. La conversion a fp16 se genero con onnxconverter-common manteniendo entradas y salidas en fp32, y en las capas donde las activaciones salen del rango de fp16 se conservan pesos fp16 con matematicas fp32.

## Capacidades

- Supresion de ruido y mejora de voz en audio mono a 16 kHz: elimina ruido de fondo y mejora la inteligibilidad de la senal hablada.
- Procesamiento de longitud variable: el eje temporal N es libre en el grafo.
- Procesamiento de clips completos: el decodificador de ClearerVoice rellena con ceros clips menores de 1 s y procesa hasta 120 s en una sola llamada.
- Normalizacion de sonoridad integrada en el pipeline de referencia (`audio_norm` a -25 dBFS) con reescalado posterior de la salida.
- Ejecucion en ONNX Runtime con proveedores CPU, CUDA y DirectML.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio de entrada distinto de voz, ni generacion de texto.

## Casos de uso

- Preprocesado para ASR: limpiar el audio ruidoso antes de enviarlo a un sistema de reconocimiento de voz, mejorando la tasa de error de palabra en entornos con ruido de fondo; el modelo opera a 16 kHz, la frecuencia habitual de los pipelines ASR.
- Videoconferencia y VoIP: integrar el grafo ONNX en el cliente para suprimir ruido ambiente en tiempo real; el factor de tiempo real de 0,087 sobre GPU deja margen suficiente para el procesamiento en flujo.
- Telefonía y centros de contacto: mejorar grabaciones de llamadas antes de su transcripcion o analitica, con procesamiento por lotes de clips de hasta 120 s.
- Dispositivos de borde con aceleracion: despliegue con el proveedor DirectML o CUDA en equipos de consumo, al no requerir PyTorch ni el stack de ClearerVoice en produccion (solo para los helpers de normalizacion y decodificacion).
- Pregrabacion y postproduccion de podcasts o entrevistas: limpiar pistas de voz capturadas en entornos no controlados antes de la mezcla final.
- Acondicionamiento de datasets de voz: normalizar y desruidizar corpus de audio para entrenamiento de modelos de voz, manteniendo coherencia de sonoridad mediante la normalizacion a -25 dBFS.

## Benchmarks y rendimiento

Resultados sobre VoiceBank-DEMAND test (824 enunciados, dos hablantes no vistos), PESQ wide-band (ITU-T P.862.2), STOI y SI-SDR frente al habla limpia. La columna "vs fp32" es el SI-SDR de cada salida frente al grafo fp32 (media / peor archivo).

| Modelo / precision | Archivos | PESQ | STOI | SI-SDR (dB) | vs fp32 (dB) | Peor archivo | Factor tiempo real |
|---|---|---|---|---|---|---|---|
| Entrada ruidosa | 824 | 1,97 | 0,921 | 8,39 | - | - | - |
| Original PyTorch fp32 (CPU) | primeros 50 | 3,184 | 0,9457 | 19,32 | - | - | 10,8 |
| ONNX fp32 (CUDA, no publicado) | primeros 50 | 3,184 | 0,9457 | 19,32 | - | -0,08 dB vs original | - |
| ONNX fp32 (CUDA, no publicado) | 824 | 3,035 | 0,9530 | 18,67 | - | - | 0,087 |
| `fp16/` (CUDA) | 824 | 3,033 | 0,9530 | 18,68 | 66,6 / 41,0 | -0,09 dB | 0,087 |
| int8 (no publicado) | 824 | 2,929 | 0,9490 | 14,10 | 20,8 / -7,0 | -29,2 dB (583 archivos por debajo de -0,5) | 0,090 |
| int4 (no publicado) | 824 | 2,023 | 0,9170 | 8,82 | 9,7 / -11,2 | -30,1 dB | 0,090 |

El criterio de aceptacion usado en estos repositorios (ningun archivo mas de 0,5 dB por debajo) lo cumple unicamente la version fp16. El factor de tiempo real se midio sobre una RTX 3080 Laptop con el pipeline completo.

## Requisitos de hardware

- VRAM estimada: muy baja; el grafo fp16 ocupa 29,4 MB en disco y los tensores intermedios son pequenos, por lo que cabe holgadamente en cualquier GPU con 1-2 GB libres.
- GPU recomendadas: RTX 3080 Laptop (medido, factor de tiempo real 0,087), cualquier GPU NVIDIA con soporte CUDA; tambien valido con DirectML en GPU integradas o discretas de otros fabricantes.
- GPU de consumo: si, cabe en cualquier GPU de consumo moderna; no requiere A100 ni H100.
- CPU: funciona con el proveedor CPU de ONNX Runtime, pero a aproximadamente 8 veces mas lento que el tiempo real en un portatil (similar al original en PyTorch).
- Despliegue: ONNX Runtime (CPU, CUDA, DirectML). No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: factor de tiempo real de 0,087 sobre RTX 3080 Laptop con el pipeline completo (fp16 e int8 practicamente identicos, 0,087 frente a 0,090).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / longitud | PESQ (VB-DEMAND) | Licencia | Formato |
|---|---|---|---|---|---|---|
| FRCRN_SE_16K-ONNX (este) | CRN compleja, ONNX | no disponible (29,4 MB fp16) | audio libre; clips hasta 120 s | 3,033 (fp16) | Apache 2.0 | ONNX |
| FRCRN_SE_16K original (alibabasglab) | CRN compleja, PyTorch | no disponible | audio libre | 3,184 (primeros 50 archivos) | no disponible en la informacion | PyTorch |
| Demucs / otros desuidadores | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de alternativas comparables en la informacion proporcionada; la unica comparacion documentada es contra el modelo original en PyTorch, que esta conversion iguala en fp32 y practicamente replica en fp16.

## Limitaciones y advertencias

- Solo se publica la precision fp16; int8 e int4 fallan de forma severa (int8 deja 583 de 824 archivos mas de 0,5 dB por debajo del original; int4 practicamente anula la mejora, con PESQ 2,023 frente a 1,97 de la entrada ruidosa).
- El modelo es sensible al redondeo de pesos en todos los tipos de capa probados, lo que limita futuras compresiones.
- No hay soporte de bf16 por ausencia de convolucion bf16 en ONNX Runtime.
- En el proveedor CPU de ONNX Runtime el grafo es unas 8 veces mas lento que el tiempo real en un portatil; se recomienda proveedor GPU.
- El pipeline de referencia depende de `clearvoice==0.1.2` para la normalizacion de sonoridad y el decodificador; sin esa dependencia hay que replicar manualmente el escalado a -25 dBFS RMS, el relleno a 1 s y el recorte a la longitud original.
- Solo procesa voz mono a 16 kHz; no admite otras frecuencias de muestreo ni audio multicanal sin remuestreo y downmix previos.
- No se documentan sesgos especificos ni tasas de alucinacion (no es un modelo generativo); el riesgo principal es la distorsion de la senal en condiciones alejadas del conjunto de evaluacion (VoiceBank-DEMAND).
- Licencia Apache 2.0, que permite uso comercial con atribucion; conviene verificar la licencia del modelo base original antes de redistribuir.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moonbox-dev/FRCRN_SE_16K-ONNX
- Modelo base original: https://huggingface.co/alibabasglab/FRCRN_SE_16K
- ClearerVoice-Studio (repositorio del modelo original): no disponible en la informacion proporcionada
- Paper de FRCRN: no disponible en la informacion proporcionada
- Conjunto de evaluacion VoiceBank-DEMAND (Valentini et al.): no disponible en la informacion proporcionada
