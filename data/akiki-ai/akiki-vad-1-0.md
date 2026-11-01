# Akiki-AI/akiki-vad-1.0

## Resumen

Akiki VAD 1.0 es un detector de actividad de voz (VAD) compacto y causal, disenado para audio en streaming a 16 kHz. Lo desarrolla Akiki-AI y devuelve una probabilidad de habla cada 16 ms (256 muestras), lo que permite identificar tramas de voz antes de tareas de transcripcion u otro procesamiento de audio. Su interes principal es la eficiencia: con 210.561 parametros entrenables y un motor de inferencia propio en Rust, procesa una trama de 16 ms en 8,90 microsegundos por la API publica de Python en la ruta INT8 por defecto.

La arquitectura combina una red convolucional con una GRU de 128 unidades. El frontend de forma de onda y el codificador convolucional siguen el diseno de Silero VAD v5, pero Akiki sustituye la LSTM por una GRU y fija un salto de prediccion de 16 ms. Los pesos se aprendieron desde inicializacion aleatoria usando supervision de Silero VAD 6.2.3 como profesor.

Es relevante ahora por su enfoque de despliegue: `pip install akiki` incluye el motor Rust y los pesos, sin necesidad de un runtime de PyTorch u ONNX separado ni de compilar Rust. Esto lo hace atractivo para pipelines de audio en produccion donde la latencia y el coste de CPU importan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red convolucional con GRU de 128 unidades |
| Parametros totales | 210.561 (model card); 276.609 segun safetensors |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 320 muestras de pasado (20 ms) mas estado recurrente |
| Tipos de cuantizacion | FP32 nativo; ruta INT8 por defecto en el motor Rust |
| Idiomas soportados | no disponible (el modelo detecta voz, no idioma) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors FP32; exportaciones opcionales a PyTorch y ONNX |

## Arquitectura y entrenamiento

El modelo es una red neuronal convolucional causal con una GRU de 128 unidades. El frontend de forma de onda y el codificador convolucional replican el diseno de Silero VAD v5, con la diferencia de que se usa una GRU en lugar de una LSTM y un salto de prediccion de 16 ms. Cada paso de inferencia consume 320 muestras de contexto pasado seguidas de 256 muestras nuevas, manteniendo estado recurrente entre pasos. La entrada debe ser audio mono float32 finito a 16 kHz.

Los pesos entrenables se aprendieron desde inicializacion aleatoria usando supervision de Silero VAD 6.2.3 (release `teacher-only623-v2-s1730`). El conjunto de datos de entrenamiento incluye multiples corpora: Common Voice, ESC-10, FLEURS, LibriSpeech, MUSAN (musica y ruido), People's Speech, VCTK, VoxPopuli, Vystadial (checo e ingles) y YODAS, ademas de mezclas con distintas licencias CC. No se especifica el numero total de tokens ni horas de audio en la informacion disponible. No se menciona RLHF ni DPO, al tratarse de una tarea de clasificacion de audio.

## Capacidades

- Deteccion de actividad de voz en audio mono a 16 kHz con salida de probabilidad cada 16 ms.
- Inferencia causal en streaming con estado recurrente, apta para audio en tiempo real.
- Acepta buffers de tamano arbitrario mediante `VAD.push()`; las tramas incompletas quedan pendientes.
- Umbral de habla configurable (por defecto 0,5) con probabilidades siempre devueltas.
- Salida con marcas de tiempo (inicio y fin en segundos) por trama.
- Motor de inferencia Rust integrado en el paquete de Python, con kernels de CPU especializados.
- Exportaciones opcionales a PyTorch y ONNX.
- Interfaz de linea de comandos (`akiki vad recording.wav`).
- No soporta tool calling, agentes, vision ni audio mas alla de la deteccion de voz.

## Casos de uso

- Segmentacion previa a transcripcion: el modelo identifica tramas de voz cada 16 ms, lo que permite recortar silencios antes de enviar audio a un ASR y reducir coste y latencia.
- Deteccion de turnos en asistentes de voz: al ser causal y mantener estado recurrente, puede integrarse en un bucle de captura de microfono para saber cuando el usuario empieza y termina de hablar.
- Filtrado de audio en pipelines de reuniones: descartar segmentos sin voz antes de almacenar o procesar grabaciones largas, con bajo coste de CPU gracias a los 8,90 µs por trama.
- Telefonia y centros de contacto: deteccion de voz en flujos de 16 kHz para activar la grabacion o el analisis solo cuando hay habla.
- Preprocesado en dispositivos de borde: con 210.561 parametros y una ruta INT8, cabe en CPUs modestas sin GPU, adecuado para dispositivos con recursos limitados.
- Control de calidad de datasets de audio: filtrar automaticamente muestras sin voz en corpus de entrenamiento antes de anotarlos.
- Monitorizacion de ruido y musica: al haberse entrenado con MUSAN y ESC-10, puede distinguir voz de musica y ruido ambiental en sistemas de vigilancia acustica.

## Benchmarks y rendimiento

La model card reporta latencias del motor Rust, no metricas de precision (accuracy, F1) sobre conjuntos de evaluacion.

| Metrica | Valor | Condiciones |
|---|---|---|
| Latencia API Python `VAD.push()` (INT8) | 8,90 µs por trama de 16 ms | Ryzen 9 9900X, un nucleo fijado, `akiki` 0.0.5 |
| Latencia llamada nativa (INT8) | 3,78 µs | Punteros preparados |
| Metodologia | 3 procesos frescos, 2.000 llamadas de calentamiento, 7.500 llamadas cronometradas | Medianas de medianas de proceso |

No se han publicado resultados de benchmarks de precision (accuracy, F1, AUC) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo esta pensado para CPU.
- GPU recomendadas: no aplica; no se documenta soporte GPU.
- Cabe en cualquier CPU consumer; el benchmark se realizo en un AMD Ryzen 9 9900X con un solo nucleo fijado.
- Opciones de despliegue: paquete `akiki` de PyPI (motor Rust integrado), exportaciones a PyTorch y ONNX.
- Latencia: 8,90 µs por trama de 16 ms por la API Python (INT8); 3,78 µs en llamada nativa.
- Throughput estimado: no disponible de forma explicita; con 8,90 µs por trama de 16 ms, el margen frente al tiempo real es amplio en un nucleo moderno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Latencia | Licencia | Formato |
|---|---|---|---|---|---|
| Akiki VAD 1.0 | 210.561 | 320 muestras + estado recurrente | 8,90 µs/trama (INT8, API Python) | Apache-2.0 | safetensors, ONNX, PyTorch |
| Silero VAD v5 | no disponible | no disponible | no disponible | no disponible | no disponible |
| TEN-VAD | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card menciona una comparacion historica del motor Akiki Rust con ONNX Runtime, PyTorch eager, Candle, tract, Burn Flex y RTen, junto con TEN-VAD y Silero v5, pero los datos completos de esa comparacion no estan incluidos en la informacion disponible.

## Limitaciones y advertencias

- La model card indica `inference: false`; el uso previsto es mediante el paquete `akiki`, no con el pipeline generico de HuggingFace.
- Entrada restringida a audio mono float32 finito a 16 kHz; otras frecuencias o formatos requieren conversion previa.
- Es un detector de voz, no un modelo de idioma; no proporciona transcripcion ni informacion linguistica.
- No se han publicado metricas de precision (accuracy, F1, AUC) en la informacion disponible, por lo que la calidad de deteccion no puede validarse con datos publicos.
- Discrepancia en el numero de parametros: 210.561 en la model card frente a 276.609 en safetensors.
- Los pesos se entrenaron con supervision de Silero VAD 6.2.3; posibles sesgos heredados del profesor no estan documentados.
- Riesgo de falsos positivos o negativos en audio con musica o ruido, aunque se entreno con MUSAN y ESC-10; no hay datos cuantitativos.
- Licencia Apache-2.0 permite uso comercial, pero las licencias de los datasets de entrenamiento son variadas (CC BY, CC BY-SA, etc.); conviene revisar implicaciones si se redistribuyen derivados.
- Requiere llamar a `reset()` entre grabaciones independientes y usar un detector por flujo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Akiki-AI/akiki-vad-1.0
- Coleccion Akiki VAD: https://huggingface.co/collections/Akiki-AI/akiki-vad-6ade6178d49bbdd8dd83e493
- Paquete en PyPI: https://pypi.org/project/akiki/
- Ejemplo de uso: https://huggingface.co/Akiki-AI/akiki-vad-1.0/blob/main/example.py
- Requisitos del ejemplo: https://huggingface.co/Akiki-AI/akiki-vad-1.0/blob/main/requirements.txt
