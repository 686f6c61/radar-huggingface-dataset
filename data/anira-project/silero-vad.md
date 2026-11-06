# anira-project/silero-vad

## Resumen

Silero VAD es un detector de actividad de voz (voice activity detection, VAD) desarrollado por el equipo de Silero y redistribuido por el proyecto anira en este repositorio. Se trata de un modelo pequeño (en torno a 1,25 MB en sus exportaciones a ONNX, LiteRT y ExecuTorch) que recibe bloques de 512 muestras de audio a 16 kHz y devuelve la probabilidad de que ese bloque contenga habla. Su relevancia radica en que es un componente esencial en pipelines de reconocimiento de voz, diarización y asistentes de voz, donde permite recortar silencios y segmentar audio antes de pasar por modelos mucho más costosos.

Este repositorio concreto no contiene el modelo original, sino una serie de exportaciones optimizadas del mismo (Silero VAD v6.2.3) para distintos motores de inferencia: ONNX Runtime, LiteRT/TensorFlow Lite, ExecuTorch (con backend XNNPACK, Core ML y Vulkan) y LibTorch. La innovación principal es que el modelo se ha reescrito como un grafo con estado explícito: el estado del LSTM (h y c, 128 cada uno) y los últimos 64 samples de contexto se pasan como tensor de entrada y se devuelven como tensor de salida, lo que permite un streaming determinista y portable entre motores sin depender de wrappers propietarios.

El modelo está pensado para despliegue en tiempo real, incluso en dispositivos de borde (móvil, embebido), gracias a su tamaño reducido y a los formatos ligeros incluidos. La licencia es MIT, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal recurrente con LSTM (detector de actividad de voz) |
| Parametros totales | no disponible (pesos en torno a 1,25 MB en float32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 muestras de audio a 16 kHz por llamada (32 ms); estado recurrente persistente entre llamadas |
| Tipos de cuantizacion | no disponible (las exportaciones son float32; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (el VAD es independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | ONNX, TFLite/LiteRT, ExecuTorch (.pte), LibTorch (.pt), Core ML (.mlpackage) |

## Arquitectura y entrenamiento

El modelo es un detector de voz basado en una red recurrente con celdas LSTM. La entrada es un bloque de 512 muestras de audio a 16 kHz (aproximadamente 32 ms) junto con un tensor de estado de 320 dimensiones que encapsula el estado oculto y de celda del LSTM (128 + 128) y los últimos 64 samples del bloque anterior (que en el wrapper original de Silero se anteponen a cada bloque). La salida es una probabilidad de habla y el estado actualizado, que debe realimentarse en la siguiente llamada. Esta formulación con estado explícito es la aportación principal de esta redistribución: hace que el modelo sea portable entre motores sin necesidad de lógica externa.

Los scripts de exportación incluidos en el repositorio reconstruyen el modelo en PyTorch eager a partir de los pesos del modelo TorchScript original de Silero (v6.2.3) y lo exportan a los distintos formatos. La validación se realizó sobre una señal sintética con voz: las probabilidades van de 0,001 a 0,96 y la desviación máxima frente al modelo TorchScript original es de 7e-7; frente al ONNX exportado, las desviaciones de LiteRT y ExecuTorch son de 1,3e-6, y la de Core ML de 1,6e-6. No se documentan en la información disponible los detalles del dataset de entrenamiento original (número de tokens, composición, si hubo RLHF, etc.), que corresponden al proyecto Silero upstream.

## Capacidades

- Detección de actividad de voz en tiempo real sobre bloques de 512 muestras a 16 kHz.
- Inferencia con estado explícito: el estado del LSTM y el contexto se pasan como tensores, lo que permite streaming determinista y reproducible.
- Ejecución multiplataforma: ONNX Runtime, LiteRT/TensorFlow Lite, ExecuTorch (XNNPACK en CPU, Core ML en Apple, Vulkan en GPU) y LibTorch.
- Exportación a Core ML ML program nativo (previsto para anira v3; macOS 13, iOS 16).
- Independiente del idioma: detecta habla, no contenido lingüístico.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un componente especializado de audio, no un modelo generativo.
- No tiene capacidades de visión, audio generativo ni texto.

## Casos de uso

- Segmentación de audio previa a ASR: el modelo recorta silencios y segmenta el audio en tramos con habla antes de pasarlo a un modelo de reconocimiento de voz, reduciendo el coste computacional y mejorando la precisión del ASR al eliminar regiones no informativas.
- Asistentes de voz en dispositivos de borde: al ocupar en torno a 1,25 MB y ejecutarse en LiteRT o ExecuTorch, puede integrarse en móviles y dispositivos embebidos para activar la captura solo cuando hay voz, ahorrando batería y ancho de banda.
- Diarización y análisis de reuniones: combinado con modelos de speaker embedding, permite detectar turnos de habla y silencios en grabaciones largas, facilitando la transcripción con marcas temporales.
- Telefonía y centros de contacto: detección en tiempo real de actividad de voz en llamadas VoIP para supresión de ruido, control de silencio y métricas de calidad de la conversación.
- Pipelines de subtitulado automático: preprocesado de vídeo o audio para alinear subtítulos solo en los tramos con habla, reduciendo falsos positivos en música y ruido.
- Sistemas de vigilancia y monitoreo de audio: activación de grabación o alertas solo cuando se detecta voz, con bajo consumo en despliegues embebidos.
- Investigación en procesamiento de audio: referencia portable y verificable (con SHA256 y scripts de exportación) para reproducir experimentos de VAD en distintos runtimes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de fidelidad de las exportaciones frente al modelo original (desviación máxima de 7e-7 frente a TorchScript, 1,3e-6 frente a ONNX en LiteRT/ExecuTorch y 1,6e-6 en Core ML), no métricas de precisión de detección de voz (como ROC-AUC o tasa de error en datasets de referencia).

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente despreciable; el modelo ocupa en torno a 1,25 MB en float32 y no requiere GPU para funcionar.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. Para despliegues con Vulkan se puede usar cualquier GPU compatible con ExecuTorch Vulkan; para Core ML, GPU o CPU de Apple.
- Cabe en cualquier GPU consumer e incluso en dispositivos sin GPU (móvil, Raspberry Pi, microcontroladores con suficiente memoria).
- Opciones de despliegue: ONNX Runtime, LiteRT/TensorFlow Lite, ExecuTorch (XNNPACK, Core ML, Vulkan), LibTorch y Core ML nativo (anira v3). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo y el procesamiento por bloques de 32 ms, está diseñado para tiempo real.

## Comparativa con modelos similares

| Modelo | Parámetros / tamaño | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Silero VAD (esta ficha, v6.2.3) | ~1,25 MB (float32) | 512 muestras (32 ms) por llamada, estado persistente | MIT | Hugging Face (anira-project/silero-vad), GitHub snakers4/silero-vad |
| WebRTC VAD | no disponible (algoritmo GMM, muy ligero) | tramas de 10/20/30 ms | BSD (parte de WebRTC) | WebRTC, librerías como py-webrtcvad |
| Picovoice Cobra VAD | no disponible | no disponible | Comercial (licencia propietaria) | Picovoice |
| Silero VAD upstream (original) | ~2,3 MB (ONNX) | 512 muestras a 16 kHz | MIT | GitHub snakers4/silero-vad |

La comparativa se limita a detectores de actividad de voz; no se dispone de datos de benchmarks comparativos en la información proporcionada.

## Limitaciones y advertencias

- Es un detector de voz, no un modelo generativo: no produce transcripciones ni comprende el contenido del habla.
- No se documentan sesgos específicos, pero como cualquier VAD puede tener un rendimiento desigual según el idioma, el acento, el ruido de fondo y la calidad del micrófono.
- Riesgo de falsos positivos en audio con música, ruido o voces sintéticas; riesgo de falsos negativos en voz susurrada o muy baja.
- La ventana de análisis es de 512 muestras (32 ms); el estado debe realimentarse correctamente entre llamadas o la detección se degrada.
- La exportación a Vulkan está incluida pero no se ha ejecutado en este repositorio (no había runtime Vulkan disponible), por lo que su comportamiento no está verificado.
- La exportación a Core ML nativo está prevista para anira v3; en la fecha de la información no está disponible en el repositorio.
- Licencia MIT: permite uso comercial, pero se debe conservar el aviso de copyright de Silero Team.
- No se documentan datos de entrenamiento ni métricas de precisión, lo que dificulta evaluar su rendimiento frente a alternativas en dominios específicos.

## Enlaces

- Hugging Face: https://huggingface.co/anira-project/silero-vad
- Repositorio anira: https://github.com/anira-project/anira
- Silero VAD upstream: https://github.com/snakers4/silero-vad
- Modelo original en GitHub (v6.2.3): https://github.com/snakers4/silero-vad/tree/v6.2.3
- Scripts de exportación: https://huggingface.co/anira-project/silero-vad/tree/main/export
- Licencia: https://huggingface.co/anira-project/silero-vad/blob/main/LICENSE
