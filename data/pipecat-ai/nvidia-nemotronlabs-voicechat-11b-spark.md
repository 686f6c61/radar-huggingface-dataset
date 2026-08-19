# pipecat-ai/NVIDIA-NemotronLabs-VoiceChat-11B-Spark

## Resumen

El modelo `pipecat-ai/NVIDIA-NemotronLabs-VoiceChat-11B-Spark` es una conversión comunitaria del checkpoint `nvidia/NVIDIA-NemotronLabs-VoiceChat-11B`, realizada por el equipo de Pipecat AI para ejecutarse de forma optimizada en un único NVIDIA DGX Spark (GB10). Se trata de un modelo de voz-a-voz (speech-to-speech) de extremo a extremo, full-duplex, que permite mantener conversaciones de voz en tiempo real sin necesidad de un pipeline separado de ASR, TTS y LLM. Es el primer modelo open source full-duplex con soporte de tool calling, lo que lo habilita para integrar llamadas a funciones durante una conversación hablada.

La conversión aplica cuantización GPTQ W8A16 a una parte de los tensores (MLP, Mamba y text-head) mientras que las proyecciones de atención, embeddings y la cabeza de función se mantienen en precisión completa. También incluye una versión cuantizada del módulo EarTTS con pesos W8 por canal de salida. El repositorio contiene además artefactos de calibración, manifiestos de verificación y documentación de reproducibilidad. La licencia es OpenMDW-1.1, que impone condiciones específicas para uso comercial.

Este lanzamiento es relevante porque acerca un modelo de conversación de voz de última generación a un hardware de escritorio de alta gama (DGX Spark), con un runtime de producción validado y un proceso de conversión reproducible. Está pensado para desarrolladores que quieran desplegar asistentes de voz con baja latencia (cadencia de 80 ms por trama) y capacidades de agente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida (atención + Mamba) con módulo EarTTS para síntesis de voz |
| Parametros totales | 11B (según nombre del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ W8A16 (grupo 128) para MLP/Mamba/text-head; W8 por canal para EarTTS; precisión completa en atención y embeddings |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (GPTQ), manifiestos SHA-256 |

## Arquitectura y entrenamiento

El modelo base `nvidia/NVIDIA-NemotronLabs-VoiceChat-11B` es un modelo speech-to-speech de extremo a extremo que combina un backbone de lenguaje (con capas de atención y Mamba) con un módulo de síntesis de voz llamado EarTTS. La arquitectura está diseñada para operar en modo full-duplex, procesando audio de entrada y generando audio de salida simultáneamente, con una cadencia de 80 ms por trama de dos frames. El modelo soporta tool calling, lo que le permite invocar funciones externas durante la conversación.

La conversión comunitaria (`-Spark`) aplica cuantización GPTQ simétrica W8A16 con grupo 128 a 105 tensores correspondientes a MLP, Mamba y text-head. Las proyecciones de atención, embeddings y la cabeza de función se mantienen en FP32. La proyección de down de 15,680 dimensiones se rellena con ceros hasta 15,744 para permitir la ejecución Marlin. El módulo EarTTS se cuantiza con pesos W8 simétricos por canal de salida, con activaciones y acumulación en FP32, y se recomienda usar una ventana deslizante de 1,500 posiciones en el runtime cualificado.

El entrenamiento original del modelo base no está documentado en la información proporcionada. No se dispone de datos sobre el dataset, el número de tokens ni el proceso de alineación (RLHF/DPO). La conversión incluye un corpus de calibración y evaluación que se distribuye como replay determinista, pero no contiene grabaciones de usuarios.

## Capacidades

- Conversación de voz a voz en tiempo real (full-duplex) con latencia de trama de 80 ms.
- Soporte de tool calling (llamada a funciones) durante la conversación hablada.
- Procesamiento de audio de entrada y generación de audio de salida de forma simultánea.
- Capacidad de mantener turnos de conversación multi-turno (probado con 18 turnos tecleados en pruebas sostenidas).
- Integración con el runtime de Pipecat (SmallWebRTC) para aplicaciones de voz en navegador.
- Funcionamiento en modo half-duplex cuando se introduce texto (el texto se sintetiza a audio y no se mezcla con el micrófono).
- Generación de respuestas de voz no silenciosas verificadas mediante ASR independiente (Parakeet).

## Casos de uso

- Asistentes de voz para atención al cliente: el modelo puede gestionar conversaciones completas con clientes, manteniendo el contexto y llamando a APIs de CRM o bases de conocimiento mediante tool calling, todo sin intervención humana.
- Agentes de voz para reservas y citas: integrado en un sistema de telefonía, puede reservar mesas, citas médicas o servicios, verificando disponibilidad a través de llamadas a funciones y confirmando con el usuario.
- Asistentes personales de productividad: desplegado en un DGX Spark local, puede tomar notas, crear recordatorios o enviar correos mediante tool calling mientras el usuario habla de forma natural.
- Sistemas de dictado y transcripción en tiempo real: al ser speech-to-speech, puede transcribir y responder simultáneamente, útil para reuniones o grabaciones.
- Demostraciones y prototipos de investigación: el runtime de Pipecat y la reproducibilidad del lanzamiento permiten experimentar con interacción de voz full-duplex y tool calling en entornos académicos.
- Aplicaciones de accesibilidad: permite a personas con discapacidad motora interactuar con sistemas mediante voz, con respuestas habladas y ejecución de comandos a través de herramientas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El repositorio documenta pruebas de calificación específicas del runtime:

- Cadencia media de dos frames: 80 ms (objetivo cumplido).
- Percentil 95 de dos frames: aproximadamente 82 ms (casi cumplido, documentado como near miss).
- Pruebas sostenidas de 12,000 frames: pendiente de cola tardía con pendientes de 0.289 y 0.375 ms/minuto, con pico de deuda de reproducción de 382 y 400 ms.
- Los 18 turnos tecleados de cada ejecución produjeron audio no silencioso verificado por ASR independiente.

Estos datos son específicos del hardware DGX Spark y no son comparables con benchmarks de modelos de lenguaje generales.

## Requisitos de hardware

- Hardware objetivo: NVIDIA DGX Spark (GB10, compute capability 12.1) con Linux ARM64.
- Software requerido: driver NVIDIA 580.142, kernel Linux 6.17.0-1014-nvidia, linaje NVIDIA PyTorch 25.12.
- VRAM: no se especifica un valor exacto; el modelo completo ocupa 19.7 GB en disco y usa memoria unificada del DGX Spark.
- No cabe en GPUs de consumo (RTX 4090, etc.) porque la conversión está optimizada para la arquitectura de DGX Spark y el runtime cualificado solo se valida en ese hardware.
- Opciones de despliegue: runtime oficial en `github.com/pipecat-ai/nemotron-voicechat-dgx-spark`; soporte para vLLM (tag del modelo).
- Latencia: cadencia de trama de 80 ms, con p95 de 82 ms; se recomienda un jitter buffer adaptativo en el navegador porque el jitter de entrega puede superar un slice de 80 ms.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma categoría (speech-to-speech full-duplex open source con tool calling). El modelo base de NVIDIA es el primero en su clase, y esta conversión comunitaria es la única adaptación para DGX Spark documentada. Alternativas parciales podrían ser modelos de voz que combinan ASR + LLM + TTS por separado, pero no ofrecen full-duplex ni tool calling integrado. Se indica "no disponible" por falta de datos contrastados.

## Limitaciones y advertencias

- El modelo puede auto-conversar (self-talk), repetir respuestas prefabricadas, elegir o saltarse la herramienta incorrecta, pronunciar mal los resultados de las herramientas, omitir palabras del transcript o producir respuestas silenciosas ocasionalmente.
- El runtime añade mecanismos de watchdog y recuperación acotada, pero no elimina los errores a nivel de modelo.
- La entrada de texto se sintetiza a audio y es half-duplex con la entrada de micrófono; no se pueden mezclar ambas modalidades simultáneamente.
- La duración de la sesión y el margen de memoria unificada son límites explícitos del runtime.
- La licencia OpenMDW-1.1 impone restricciones de uso; no es una licencia de código abierto estándar. Se debe revisar el archivo LICENSE antes de cualquier uso comercial.
- La conversión no está cualificada para hardware distinto al DGX Spark (GB10) con el software especificado; otras combinaciones no están soportadas.
- No se han publicado datos sobre sesgos o alucinaciones específicos de este modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pipecat-ai/NVIDIA-NemotronLabs-VoiceChat-11B-Spark
- Modelo base de NVIDIA: https://huggingface.co/nvidia/NVIDIA-NemotronLabs-VoiceChat-11B
- Repositorio del runtime: https://github.com/pipecat-ai/nemotron-voicechat-dgx-spark
- Página de NVIDIA NIM (demo): https://build.nvidia.com/nvidia/nemotron-voicechat
