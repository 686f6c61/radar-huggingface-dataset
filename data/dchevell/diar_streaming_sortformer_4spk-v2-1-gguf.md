# dchevell/diar_streaming_sortformer_4spk-v2.1-GGUF

## Resumen

Este repositorio contiene una conversión a GGUF en precisión F32 del modelo `nvidia/diar_streaming_sortformer_4spk-v2.1`, un diarizador de hablantes en streaming desarrollado por NVIDIA. El modelo original es una versión en tiempo real de Sortformer, un modelo end-to-end de diarización que identifica quién habla y cuándo en una grabación de audio, soportando hasta cuatro hablantes simultáneos. La conversión GGUF está diseñada específicamente para el runtime NeMo-Speech.cpp de NVIDIA, lo que permite ejecutar el modelo con herramientas similares a llama.cpp pero orientadas a audio.

El modelo tiene aproximadamente 122,8 millones de parámetros y un tamaño de archivo de 491 MB en F32, lo que lo hace viable para ejecutarse en GPUs de consumo con suficiente memoria. Su relevancia actual radica en que ofrece diarización en streaming con baja latencia, una capacidad crítica para aplicaciones de transcripción en vivo, subtitulación automática y análisis de conversaciones en tiempo real. Al ser una conversión GGUF, facilita el despliegue en entornos de producción con el ecosistema NeMo-Speech.cpp, que ya se ha validado en servicios reales sobre hardware NVIDIA profesional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sortformer (end-to-end transformer para diarizacion) |
| Parametros totales | 122.862.212 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, procesa ventanas de audio en streaming) |
| Tipos de cuantizacion | F32 (unico formato en este repo) |
| Idiomas soportados | no disponible (no especificado por el autor) |
| Licencia | NVIDIA Open Model License (nvidia-open-model-license) |
| Formato de pesos | GGUF (F32) |

## Arquitectura y entrenamiento

Sortformer es un modelo end-to-end de diarización de hablantes que se entrena con objetivos no convencionales respecto a los modelos de diarización tradicionales. En lugar de depender de un pipeline separado con detección de actividad de voz (VAD), extracción de embeddings y clustering, Sortformer procesa directamente la señal de audio y produce las etiquetas de hablante de forma integrada. La versión v2.1 es la iteración en streaming, diseñada para operar con baja latencia sobre flujos de audio continuos, manteniendo un equilibrio entre precisión y velocidad.

El modelo original de NVIDIA se entrenó con datos de audio que incluyen mezclas de hasta cuatro hablantes, y la versión streaming incorpora mecanismos de compresión de caché para manejar contextos largos sin degradar el rendimiento. La conversión GGUF fue realizada con el convertidor oficial de NeMo-Speech.cpp v0.1.0, que transforma el checkpoint `.nemo` original al formato GGUF específico de ese runtime. No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens (en este caso, muestras de audio) ni el uso de técnicas como RLHF o DPO, ya que el autor de la conversión no las documenta.

## Capacidades

- Diarizacion de hablantes en streaming: identifica hasta cuatro hablantes distintos en tiempo real sobre audio continuo.
- Procesamiento end-to-end: no requiere modulos externos de VAD, embedding o clustering.
- Baja latencia: diseñado para aplicaciones en vivo, con validacion bit-exacta contra NeMo en muestras de prueba.
- Soporte para audio superpuesto: maneja solapamientos entre hablantes (validado con mezclas de 2 hablantes con 1,5 s de solapamiento).
- Integracion con NeMo-Speech.cpp: formato GGUF compatible con el runtime de NVIDIA para despliegue en produccion.
- Capacidad de procesar reuniones largas: validado en una reunión AMI de 39 minutos con compresion de caché streaming.

## Casos de uso

- Transcripcion de reuniones con atribucion de hablante: el modelo puede procesar audio en streaming durante una videollamada y etiquetar cada intervencion con el hablante correspondiente, permitiendo generar actas con turnos de palabra en tiempo real.
- Subtitulacion en vivo para eventos y conferencias: al combinarse con un motor de transcripcion, el diarizador asigna colores o nombres a los subtitulos segun quien habla, mejorando la accesibilidad en directo.
- Analisis de llamadas de servicio al cliente: en centros de contacto, el modelo puede separar las voces del agente y del cliente en tiempo real, facilitando el analisis de sentimiento y la deteccion de problemas durante la llamada.
- Asistentes de voz multi-usuario: en entornos domoticos o de oficina, el diarizador permite que un asistente distinga entre diferentes personas que hablan, adaptando respuestas o registrando quien dio cada orden.
- Moderacion de debates o paneles: en programas de radio o television en directo, el modelo identifica a cada participante de hasta cuatro hablantes, permitiendo generar metadatos de intervencion automaticamente.
- Analisis forense de audio: para investigaciones que requieren identificar cuantas personas hablan en una grabacion y en que momentos, el modelo ofrece una solucion end-to-end sin necesidad de configurar pipelines complejos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de la conversion GGUF no incluye metricas comparativas como MMLU, HumanEval o GSM8K, ya que se trata de un modelo de audio, no de texto. El autor de la conversion menciona que el artefacto se usa en un servicio de produccion sobre una RTX PRO 6000 Blackwell, pero no aporta cifras de latencia, throughput ni precision. La validacion numerica realizada por el proyecto transcribe.cpp confirma que los tensores del modelo coinciden con los de NeMo dentro de tolerancias familiares, y que la compresion de caché streaming es bit-exacta en una reunion de 39 minutos, pero no se ofrecen metricas de calidad de diarizacion (como DER, diarization error rate).

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF F32 ocupa 491 MB, por lo que la inferencia requiere al menos 1-2 GB de VRAM considerando buffers y overhead del runtime. Con cuantizaciones de menor precision (no incluidas en este repo) se podria reducir.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM deberia ser suficiente para ejecutar el modelo en F32. El autor lo usa en una NVIDIA RTX PRO 6000 Blackwell (48 GB), pero eso responde a un servicio de produccion con multiples instancias, no a un requisito minimo.
- Compatibilidad con GPU de consumo: si, cabe en GPUs consumer como RTX 3060, RTX 4060 o superiores con 8 GB o mas de VRAM.
- Opciones de despliegue: el formato GGUF es especifico de NeMo-Speech.cpp v0.1.0, por lo que el runtime principal es ese. No es compatible con llama.cpp ni Ollama, que estan orientados a texto. Tambien se puede usar a traves de transcribe.cpp, que lo valida numericamente.
- Latencia y throughput: no disponibles. Al ser un modelo streaming, la latencia depende del tamaño de ventana de audio procesada, pero no se documentan valores concretos.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Hablantes | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| diar_streaming_sortformer_4spk-v2.1 (este) | 122,8 M | Streaming end-to-end | 4 | NVIDIA Open Model | HuggingFace (GGUF F32) |
| diar_sortformer_4spk-v1 (offline) | 123 M | Offline end-to-end | 4 | NVIDIA Open Model | HuggingFace (formato .nemo) |
| pyannote/speaker-diarization-3.1 | ~30 M | Pipeline (VAD + embeddings + clustering) | ilimitado | MIT (modelos) | HuggingFace |

El modelo offline v1 tiene aproximadamente 6 millones de parametros mas que la version v2.1 y, al acceder a la grabacion completa, suele ofrecer mayor precision, pero no es adecuado para aplicaciones en tiempo real. Pyannote, por otro lado, es un enfoque modular que no tiene limite fijo de hablantes, pero requiere una pipeline mas compleja y no esta disenado para streaming nativo.

## Limitaciones y advertencias

- Numero maximo de hablantes: el modelo esta limitado a cuatro hablantes simultaneos; mezclas con mas voces pueden producir errores de asignacion.
- Precision en streaming: al procesar audio en tiempo real, la precision puede ser inferior a la version offline (v1), especialmente en segmentos con solapamiento prolongado o cambios rapidos de hablante.
- Idiomas no especificados: el autor no documenta que idiomas soporta el modelo, por lo que su rendimiento en lenguas distintas al ingles (probablemente el idioma principal de entrenamiento) no esta garantizado.
- Licencia restrictiva: la NVIDIA Open Model License impone condiciones especificas para uso comercial, incluyendo limitaciones de redistribucion y posible obligacion de atribucion. Es necesario revisar el acuerdo completo antes de desplegarlo en produccion.
- Formato GGUF propietario: la conversion no es intercambiable con otros runtimes; solo funciona con NeMo-Speech.cpp v0.1.0, lo que limita la portabilidad.
- Riesgo de alucinacion en diarizacion: como cualquier modelo de audio, puede inventar cambios de hablante o asignar segmentos incorrectamente en condiciones de ruido o baja calidad de grabacion.

## Enlaces

- Repositorio HuggingFace de la conversion GGUF: https://huggingface.co/dchevell/diar_streaming_sortformer_4spk-v2.1-GGUF
- Modelo original de NVIDIA: https://huggingface.co/nvidia/diar_streaming_sortformer_4spk-v2.1
- README del modelo original: https://huggingface.co/nvidia/diar_streaming_sortformer_4spk-v2.1/blob/15345347cd3eb5b119704eacc07c4563a728d58d/README.md
- Runtime NeMo-Speech.cpp: https://github.com/NVIDIA/NeMo-Speech.cpp
- Documentacion de validacion en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/diar_streaming_sortformer_4spk-v2.1.md
- Ficha del modelo en Inferix: https://inferix.co/models/nvidia/diar_streaming_sortformer_4spk-v2.1
- Licencia NVIDIA Open Model: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
