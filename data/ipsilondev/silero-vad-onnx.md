# ipsilondev/silero-vad-onnx

## Resumen

`ipsilondev/silero-vad-onnx` es un espejo sin modificaciones del fichero ONNX del detector de actividad de voz (VAD) Silero, publicado por el usuario ipsilondev para su uso en las aplicaciones de Ipsilon Voice Loop (InterviewSpar y derivados). No se trata de un modelo de lenguaje ni de un transformer generativo: es un detector binario de voz/silencio que opera sobre ventanas de audio de 512 muestras a 16 kHz (o 256 a 8 kHz) y devuelve una probabilidad de habla por ventana.

El modelo original lo desarrolla el equipo de Silero (snakers4), y este repositorio se limita a replicar el fichero `silero_vad.onnx` de la release v6.2.3 (commit `066409f3d9db45a30d21dfcbf9147826ffdd7052`, 22 de octubre de 2026), con un tamaño de 2.327.524 bytes y SHA-256 `1a153a22f4509e292a94e67d6f9b85e8deb25b4988682b7e174c65279d8788e3`. No hay conversión ni reexportación: es un artefacto de distribución, no un modelo nuevo.

Su relevancia es práctica: permite integrar endpointing de voz en aplicaciones on-device mediante ONNX Runtime sin depender del ecosistema PyTorch, con un coste computacional mínimo y una licencia MIT que facilita el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal recurrente ligera para deteccion de voz (VAD); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de audio de 512 muestras a 16 kHz (576 con contexto de 64 muestras previas) o 256 a 8 kHz |
| Tipos de cuantizacion | no disponible (el artefacto distribuido es float32) |
| Idiomas soportados | no disponible (el VAD es agnostico al idioma por naturaleza) |
| Licencia | MIT |
| Formato de pesos | ONNX (`silero_vad.onnx`, 2.327.524 bytes) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo; se limita a describir la interfaz de inferencia verificada con onnxruntime 1.24.1 en CPU. La firma del grafo ONNX es la siguiente: entradas `input` (float32 `[batch, samples]`), `state` (float32 `[2, batch, 128]`, inicializado a ceros y realimentado con `stateN`) y `sr` (int64 escalar, 16000 u 8000); salidas `output` (float32 `[batch, 1]`, probabilidad de habla) y `stateN` (float32 `[2, batch, 128]`). La presencia de un estado recurrente de dimension 128 indica un modelo con memoria temporal entre ventanas, coherente con la familia Silero VAD.

No hay información sobre datos de entrenamiento, número de tokens o composición del dataset en la información proporcionada. Tampoco se documenta ningún proceso de RLHF, DPO o ajuste fino: el artefacto es un espejo exacto del fichero upstream de la release v6.2.3, sin conversión ni reexportación. La única innovación destacable es operativa: el wrapper de referencia alimenta ventanas de 512 muestras nuevas precedidas por las últimas 64 muestras de la ventana anterior (576 muestras por llamada), lo que aporta contexto temporal y es el modo que usa upstream.

## Capacidades

- Deteccion de actividad de voz por ventana: devuelve una probabilidad de habla en `[0, 1]` para cada bloque de audio procesado.
- Endpointing de voz/silencio en tiempo real, adecuado para determinar el inicio y el fin de un turno de habla.
- Procesamiento por lotes (`batch` en la primera dimension de los tensores).
- Soporte de dos frecuencias de muestreo: 16 kHz y 8 kHz, seleccionables mediante la entrada `sr`.
- Estado recurrente persistente entre llamadas (`state` / `stateN`), lo que permite procesar flujos de audio continuos sin cortes.
- Ejecucion via ONNX Runtime en CPU, sin dependencia de PyTorch en inferencia.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio generativo ni capacidades multilingues en el sentido de un modelo de lenguaje.

## Casos de uso

- Endpointing en asistentes de voz on-device: integrar el grafo ONNX en una app movil o de escritorio con ONNX Runtime para detectar cuando el usuario empieza y termina de hablar, usando ventanas de 576 muestras a 16 kHz y realimentando `stateN` entre llamadas.
- Entrevistas automatizadas (InterviewSpar y derivados): el caso de uso declarado por el autor; el VAD segmenta los turnos del candidato y evita enviar silencio al backend de reconocimiento de voz.
- Preprocesado de pipelines ASR: filtrar segmentos sin habla antes de la transcripcion para reducir coste y latencia del reconocedor, manteniendo el estado recurrente entre bloques.
- Deteccion de push-to-talk y cancelacion de ruido de fondo: usar la probabilidad de salida como puerta (gate) para activar o desactivar la captura de audio en aplicaciones de comunicacion.
- Analitica de llamadas: segmentar grabaciones telefonicas a 8 kHz en tramos de voz y silencio para calcular tiempos de habla, pausas y solapamientos.
- Sistemas de transcripcion en tiempo real con troceado dinamico: encadenar el VAD con un modelo ASR para emitir transcripciones parciales cuando se detecta el final de un turno, sin esperar a un temporizador fijo.
- Despliegue en dispositivos con recursos limitados: al ser un grafo ONNX de 2,3 MB en float32 y ejecutarse en CPU con onnxruntime, cabe en entornos embebidos y moviles sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo esta pensado para ejecucion en CPU via ONNX Runtime.
- GPU recomendadas: no disponibles; no se documenta aceleracion por GPU para este artefacto.
- Cabe en cualquier GPU consumer y en CPU: el fichero pesa 2.327.524 bytes (unos 2,3 MB) en float32.
- Opciones de despliegue: ONNX Runtime (verificado con la version 1.24.1 en CPU); otros runtimes ONNX no estan documentados en la informacion proporcionada.
- Latencia y throughput: no disponibles. La interfaz exige ventanas de 512 muestras (32 ms a 16 kHz) o 576 con contexto (36 ms a 16 kHz), pero no se publican cifras de latencia por llamada.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Licencia | Contexto de ventana | Notas |
|---|---|---|---|---|---|
| ipsilondev/silero-vad-onnx | VAD (espejo de Silero) | ONNX | MIT | 512/576 muestras a 16 kHz | Ejecutable con ONNX Runtime, sin PyTorch |
| snakers4/silero-vad (upstream) | VAD | PyTorch / ONNX / JIT | MIT | 512 muestras a 16 kHz | Fuente original del artefacto; incluye wrappers y utilidades |
| WebRTC VAD | VAD clasico | C/C++ | BSD | 10/20/30 ms | No es un modelo neuronal; menor robustez en ruido |
| Silero VAD v5 (versiones anteriores) | VAD | PyTorch / ONNX | MIT | 512 muestras a 16 kHz | Version previa del mismo modelo; no se dispone de comparativa de rendimiento |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Es un espejo, no un modelo nuevo: cualquier correccion o mejora debe buscarse en el repositorio upstream `snakers4/silero-vad`.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso comunitario ni de mantenimiento continuado.
- No se documentan sesgos, tasas de alucinacion ni comportamiento en idiomas concretos; al ser un VAD, el riesgo de sesgo se traslada a la deteccion de voz en funcion de acentos, ruido y calidad de microfono, sin datos publicados al respecto.
- La interfaz exige gestionar manualmente el estado recurrente (`state` / `stateN`) y la frecuencia de muestreo (`sr`); un uso incorrecto produce detecciones erroneas sin aviso.
- Solo se verifico con onnxruntime 1.24.1 en CPU; no hay garantias documentadas para otras versiones o backends.
- La licencia MIT permite uso comercial, pero conviene conservar el aviso de copyright y la atribucion al proyecto Silero original.
- El tamano del repo aparece como 0.0 GB en la ficha de Hugging Face, en contradiccion con el tamano del fichero indicado en la model card (2.327.524 bytes); conviene verificar la integridad con el SHA-256 publicado antes de desplegar en produccion.
- No apto para tareas de reconocimiento de voz, generacion de texto ni razonamiento: su unica funcion es estimar la probabilidad de habla por ventana.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ipsilondev/silero-vad-onnx
- Repositorio upstream de Silero VAD: https://github.com/snakers4/silero-vad
- Fichero upstream de referencia: `src/silero_vad/data/silero_vad.onnx` en el commit `066409f3d9db45a30d21dfcbf9147826ffdd7052` (release v6.2.3)
- ONNX Runtime: https://onnxruntime.ai/
