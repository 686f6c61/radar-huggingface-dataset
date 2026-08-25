# Fazmin/solus_v1_silero-vad-v5

## Resumen

Solus V1 Silero VAD v5 es un espejo byte-idéntico del modelo de detección de actividad de voz (VAD) Silero VAD v5 en formato ONNX, publicado por el usuario Fazmin. El modelo original, desarrollado por el equipo de Silero (snakers4), es una solución empresarial de detección de voz ligera y de alta precisión, diseñada para funcionar en tiempo real incluso en CPU. Este repositorio concreto sirve como copia de respaldo para que las instalaciones de Solus (un sistema de dictado) no dependan de que un repositorio de terceros siga disponible.

El modelo procesa tramas de audio de 512 muestras a 16 kHz (32 ms) y devuelve una probabilidad de presencia de voz. Su arquitectura recurrente y su tamaño reducido (alrededor de 2 MB en su versión JIT) lo hacen adecuado para integraciones en dispositivos con recursos limitados. La licencia MIT permite uso comercial sin restricciones, y al ser un mirror exacto, no introduce cambios respecto al modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal recurrente (LSTM) con capas convolucionales (no documentado en la ficha, segun documentacion oficial de Silero VAD) |
| Parametros totales | no disponible (tamano del archivo ONNX ~2 MB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 muestras (32 ms a 16 kHz) + 64 muestras de contexto previo |
| Tipos de cuantizacion | f32 (ONNX) |
| Idiomas soportados | no disponible (el VAD es independiente del idioma; entrenado con corpus de mas de 6000 idiomas) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo es una copia exacta de la exportacion ONNX de `onnx-community/silero-vad`, que a su vez deriva del modelo original de Silero VAD v5. La arquitectura interna no se detalla en la informacion proporcionada, pero segun la documentacion oficial de Silero VAD se trata de una red neuronal recurrente con capas LSTM, optimizada para deteccion de voz en tiempo real. El entrenamiento se realizo sobre un corpus extenso que incluye mas de 6000 idiomas, con diversos niveles de ruido de fondo y calidad de audio, lo que le confiere robustez en entornos variados.

La innovacion principal radica en su eficiencia: un chunk de 30 ms se procesa en menos de 1 ms en un solo hilo de CPU, y con ONNX puede ser hasta 4-5 veces mas rapido. El modelo acepta frecuencias de muestreo de 8 kHz y 16 kHz, aunque el contrato verificado en este repositorio fija 16 kHz. No se ha realizado ningun entrenamiento adicional en este mirror; es una copia byte-idéntica.

## Capacidades

- Deteccion de actividad de voz (VAD) en audio de 16 kHz, devolviendo una probabilidad entre 0 y 1.
- Procesamiento en tiempo real con baja latencia (menos de 1 ms por trama de 32 ms en CPU).
- Soporte de estado recurrente entre llamadas consecutivas, lo que permite mantener contexto temporal.
- Funciona con tramas de 512 muestras (32 ms) y requiere 64 muestras de audio previo como contexto.
- Independiente del idioma: detecta voz en cualquier lengua sin necesidad de modelos adicionales.
- Ligero y portable: el archivo ONNX ocupa aproximadamente 2 MB, apto para entornos embebidos.
- Compatible con ONNX Runtime, lo que facilita su integracion en multiples plataformas.

## Casos de uso

- Dictado por voz en aplicaciones de escritorio: Solus lo utiliza para reemplazar un umbral de RMS, activando la grabacion solo cuando hay voz real, reduciendo falsos positivos por ruido ambiente.
- Transcripcion automatica de reuniones: como preprocesador para segmentar audio y enviar solo los segmentos con voz a un modelo de reconocimiento de habla, ahorrando costes de computacion.
- Asistentes de voz en dispositivos embebidos: su bajo consumo permite ejecutarlo en Raspberry Pi o microcontroladores con CPU limitada para activar por voz.
- Filtrado de audio en grabaciones: eliminar silencios o ruido de fondo en podcasts o entrevistas antes de publicar.
- Sistemas de seguridad y vigilancia: detectar presencia de voz en grabaciones de camaras para alertar o indexar eventos relevantes.
- Aplicaciones de accesibilidad: activar comandos de voz en software para personas con movilidad reducida, con respuesta inmediata.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentacion oficial de Silero VAD menciona una "excelente precision" en tareas de deteccion de voz, pero no se proporcionan numeros concretos en este repositorio. Se recomienda consultar el repositorio original de GitHub para metricas detalladas.

## Requisitos de hardware

- VRAM: no requiere GPU; funciona en CPU con menos de 1 ms por trama de 32 ms en un solo hilo.
- GPU recomendada: no necesaria; si se desea acelerar, cualquier GPU moderna con soporte ONNX Runtime puede mejorar el rendimiento, pero no es imprescindible.
- Compatible con hardware de gama baja: Raspberry Pi, moviles, sistemas embebidos.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#), llama.cpp no aplica (no es un LLM), se puede integrar en pipelines de audio con librerias como ffmpeg.
- Latencia: inferior a 1 ms por trama en CPU; throughput de cientos de tramas por segundo en un solo nucleo.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Precision | Licencia | Formato |
|---|---|---|---|---|---|
| Silero VAD v5 (este) | VAD recurrente | ~2 MB | Alta (segun documentacion) | MIT | ONNX |
| WebRTC VAD | VAD clasico (GMM) | <1 MB | Media, sensible a ruido | BSD | Codigo fuente |
| pyannote.audio VAD | VAD basado en transformer | ~100 MB | Alta, pero mas pesado | MIT | PyTorch |

Silero VAD destaca por su equilibrio entre precision y eficiencia, superando a WebRTC VAD en entornos ruidosos y siendo mucho mas ligero que soluciones basadas en transformers. No se dispone de comparativas numericas en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo acepta tramas de 480 muestras y devuelve un valor plausible, lo que provoca un fallo silencioso si se usa un tamano de trama incorrecto. Es imprescindible usar exactamente 512 muestras.
- Solo se ha verificado el contrato para 16 kHz; aunque el modelo original soporta 8 kHz, este mirror no documenta esa posibilidad.
- No distingue entre habla y otros sonidos vocales (canto, gritos) ni entre hablantes; es una deteccion binaria de actividad vocal.
- Puede tener falsos positivos con musica o ruido muy fuerte, aunque esta optimizado para reducirlos.
- Al ser un mirror, no hay garantia de mantenimiento futuro; la responsabilidad recae en el repositorio original.
- La licencia MIT permite uso comercial, pero se recomienda verificar la atribucion si se redistribuye.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Fazmin/solus_v1_silero-vad-v5
- Modelo base en HuggingFace: https://huggingface.co/onnx-community/silero-vad
- Repositorio GitHub original: https://github.com/snakers4/silero-vad
- Releases de Silero VAD en GitHub: https://github.com/snakers4/silero-vad/releases
- Paquete PyPI: https://pypi.org/project/silero-vad/
