# Jayanth-MKV/Haru-4B-GGUF

## Resumen

Haru-4B es un modelo fundacional de diálogo hablado en modo full-duplex, es decir, capaz de escuchar y hablar de forma simultánea y continua, desarrollado por higurashi-ai. Esta ficha cubre la versión cuantizada publicada por Jayanth-MKV, que distribuye el backbone de lenguaje en formato GGUF Q4_K_M junto con los módulos de audio en FP16, con el objetivo de permitir despliegue en CPU y en GPUs con poca VRAM sin degradar la fidelidad de la voz. El modelo base cuenta con 4.205.751.296 parámetros y se apoya en un backbone Qwen3.5-4B.

La arquitectura es la de un Listening-while-Speaking Language Model (LSLM) que opera a 7,5 Hz, lo que equivale a un presupuesto de 133,33 ms por trama. El sistema se compone de tres piezas: el backbone de lenguaje Qwen3.5-4B, un códec de audio causal VibeVoice (convolución 1D) y una cabeza de generación de audio MeanFlow de 4 capas que realiza muestreo ODE en un solo paso. La licencia es Apache-2.0 y cubre nueve idiomas: inglés, español, portugués, alemán, francés, chino, japonés, ruso y coreano.

La relevancia de esta release está en la estrategia de cuantización híbrida: comprime el backbone de 8,4 GB a 2,6 GB manteniendo el códec (~1,3 GB) y la cabeza MeanFlow (~694 MB) en FP16 para evitar artefactos metálicos y estática en la síntesis de voz. El repositorio ocupa 4,9 GB en total y el pipeline declarado es audio-to-audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSLM full-duplex sobre backbone transformer Qwen3.5-4B, con codec de audio causal VibeVoice (conv 1D) y cabeza MeanFlow de 4 capas con muestreo ODE de 1 paso |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M para el backbone; FP16 para codec y cabeza de audio |
| Idiomas soportados | en, es, pt, de, fr, zh, ja, ru, ko |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (backbone) y safetensors (codec y cabeza de audio) |

## Arquitectura y entrenamiento

Haru-4B es un modelo de diálogo hablado full-duplex que procesa y genera audio de forma continua a 7,5 Hz, con un presupuesto de 133,33 ms por trama. El backbone de lenguaje es Qwen3.5-4B, sobre el que se acoplan dos módulos específicos de audio: un tokenizador acústico VibeVoice basado en convolución 1D causal y una cabeza de generación MeanFlow de 4 capas que aplica flow-matching continuo con muestreo ODE en un único paso. Esta combinación permite generar audio de forma iterativa y de baja latencia, condición necesaria para el comportamiento full-duplex.

La release cuantizada aplica una estrategia híbrida: el backbone se extrae y se cuantiza a GGUF Q4_K_M (de 8,4 GB a 2,6 GB), mientras que el codec (~1,3 GB) y la cabeza MeanFlow (~694 MB) se conservan en FP16. El autor justifica mantener el codec en precisión completa para preservar la calidad de la convolución causal y evitar artefactos de estática metálica, y la cabeza en FP16 para no degradar el muestreo ODE de un solo paso. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Diálogo hablado full-duplex: escucha y habla simultáneamente, sin turnos rígidos, con tramas de 133,33 ms.
- Speech-to-speech y audio-to-audio: entrada y salida en dominio de audio continuo.
- Generación de voz de baja latencia gracias al muestreo ODE de un solo paso de la cabeza MeanFlow.
- Multilingüe en nueve idiomas: inglés, español, portugués, alemán, francés, chino, japonés, ruso y coreano.
- Backbone de lenguaje con capacidad de generación de texto y razonamiento heredada de Qwen3.5-4B.
- Ejecución del backbone en CPU mediante llama.cpp (formato GGUF).
- No se declara soporte explícito de tool calling, function calling ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Asistentes de voz conversacionales en tiempo real: el modo full-duplex a 7,5 Hz permite interrupciones y solapamiento natural entre hablante y sistema, adecuado para atención al cliente telefónica.
- Agentes de voz embebidos en CPU: el backbone GGUF Q4_K_M de 2,6 GB permite desplegar el componente de lenguaje en servidores sin GPU, reservando el códec y la cabeza en FP16 para el procesado de audio.
- Traducción oral simultánea: con nueve idiomas soportados y procesamiento continuo, puede emplearse en escenarios de interpretación en los que la latencia por turno es crítica.
- Interfaces de voz para personas con movilidad reducida: la naturaleza full-duplex facilita interacción continua sin pulsaciones ni comandos explícitos.
- Sistemas de tutoría o acompañamiento conversacional: el diálogo hablado continuo encaja en aplicaciones educativas o de asistencia donde se requiere escucha activa.
- Prototipado de investigación en LSLM: la disponibilidad de pesos GGUF y módulos de audio separados en safetensors facilita experimentar con la pila completa en hardware modesto.
- Evaluación de pipelines audio-to-audio en producción: el tamaño total del repositorio (4,9 GB) permite desplegar el sistema completo en una sola máquina con VRAM limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el backbone Q4_K_M ocupa 2,6 GB; el codec FP16 ~1,3 GB; la cabeza MeanFlow FP16 ~694 MB. El total de pesos ronda los 4,6 GB, por lo que se necesita aproximadamente 5-6 GB de VRAM sumando buffers de activaciones y contexto.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, cabría en GPUs consumer con 8 GB o más (RTX 3060 Ti, RTX 4060 Ti, RTX 3070, RTX 4070) y en GPUs de datacenter (A100, H100) con holgura.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con 8 GB o más de VRAM, dado el tamaño de los pesos.
- Opciones de despliegue: llama.cpp para el backbone GGUF (se documenta `llama-cli`); el codec y la cabeza en safetensors requerirían un runtime adicional no especificado en la información disponible. vLLM, Ollama o TGI no se mencionan para este modelo.
- Latencia y throughput estimados: no disponible. El diseño apunta a un presupuesto de 133,33 ms por trama (7,5 Hz), pero no se publican cifras medidas de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de diálogo hablado full-duplex con pesos abiertos en la información proporcionada. Se indica "no disponible" para los campos de comparación.

| Modelo | Parametros | Contexto | Full-duplex | Licencia | Formato |
|---|---|---|---|---|---|
| Haru-4B (esta release) | 4.205.751.296 | no disponible | Sí (7,5 Hz) | Apache-2.0 | GGUF + safetensors |
| Alternativa 1 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativa 2 | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos del modelo ni sobre la composición del dataset de entrenamiento, por lo que no es posible evaluar sesgos conocidos.
- Riesgo de alucinación: no cuantificado en la información disponible; al tratarse de un modelo de diálogo hablado, existe riesgo de respuestas incoherentes o inventadas, especialmente en idiomas con menos presencia en el entrenamiento.
- La cuantización Q4_K_M del backbone puede degradar ligeramente la calidad lingüística frente al modelo base en FP16; el autor solo preserva en FP16 los módulos de audio.
- La longitud de contexto no está declarada, lo que impide planificar despliegues con conversaciones largas.
- El pipeline declarado es audio-to-audio; el uso del backbone GGUF aislado con llama.cpp no reproduce por sí solo la funcionalidad de diálogo hablado completa.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base higurashi-ai/Haru-4B y de los componentes Qwen3.5 y VibeVoice que integra.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- No se declara soporte de tool calling ni de agentes multi-paso, lo que limita su uso en pipelines de automatización complejos.

## Enlaces

- Repositorio Hugging Face de esta release: https://huggingface.co/Jayanth-MKV/Haru-4B-GGUF
- Modelo base: https://huggingface.co/higurashi-ai/Haru-4B
- Repositorio oficial del proyecto: https://github.com/higurashi-ai/Haru
- llama.cpp: https://github.com/ggml-org/llama.cpp
