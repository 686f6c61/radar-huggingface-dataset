# FluidInference/localvqe-coreml

## Resumen

LocalVQE Core ML es la exportación en formato Core ML del modelo LocalVQE, un sistema neuronal de cancelación de eco acústico (AEC), supresión de ruido y desreverberación para voz muestreada a 16 kHz. Lo desarrolla FluidInference a partir de los pesos originales de LocalAI-io/LocalVQE (licencia Apache-2.0), que a su vez es un derivado optimizado para CPU del modelo DeepVQE presentado por Indenbom et al. en Interspeech 2023. El modelo resuelve el problema clásico del procesado de señal de audio en tiempo real: eliminar el eco procedente del altavoz y el ruido de fondo de la señal captada por el micrófono, manteniendo la voz del usuario limpia para sistemas de reconocimiento de voz o comunicaciones.

La relevancia actual del modelo radica en su tamaño extremadamente reducido (4,8 M y 1,3 M de parámetros) y en su naturaleza de streaming: procesa el audio por bloques (hops) manteniendo un estado interno de 33 tensores, lo que lo hace apto para inferencia en tiempo real sobre CPU de dispositivos Apple. Frente a aproximaciones clásicas de procesado de señal, ofrece una calidad de supresión superior sin necesidad de GPU y con una latencia controlada (16 ms o 256 ms según la variante).

No es un modelo de lenguaje: no genera texto ni razona. Es un componente de preprocesado de audio pensado para integrarse en pipelines de voz (asistentes, transcripción, llamadas) mediante la librería FluidAudio, con objetivos de despliegue iOS 17 y macOS 14 en adelante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal para realce de voz derivada de DeepVQE (procesamiento por bloques con estado recurrente; detalles internos de capas no disponibles) |
| Parametros totales | 4,8 M (variantes v1.3) y 1,3 M (variantes v1.2) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; procesa bloques de 256 muestras (16 ms) o 4096 muestras (256 ms) por llamada |
| Tipos de cuantizacion | Solo fp32 (todas las exportaciones Core ML) |
| Idiomas soportados | No aplica (procesado de señal de voz independiente del idioma); idiomas no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | `.mlmodelc` (Core ML compilado); pesos originales en `.pt` (PyTorch) en el modelo base |

## Arquitectura y entrenamiento

LocalVQE es un derivado de DeepVQE (Indenbom et al., Interspeech 2023), una arquitectura neuronal diseñada para cancelación de eco acústico y supresión de ruido en dominios espectrales. El modelo opera en modo streaming: recibe dos señales de entrada —`mic` (señal del micrófono) y `ref` (referencia de extremo lejano, es decir, lo que reprodujo el altavoz)— junto con 33 tensores de estado interno, y devuelve la señal realzada más los tensores de estado actualizados que deben realimentarse en la llamada siguiente. Esta formulación con estado explícito permite procesar audio de duración arbitraria sin ventanas solapadas ni recomputación.

La exportación a Core ML conserva los pesos en fp32 y ofrece dos granularidades de bloque: 256 muestras (1 hop, 16 ms) y 4096 muestras (16 hops, 256 ms). Ambas producen audio idéntico y solo difieren en el equilibrio entre sobrecarga por llamada y latencia. La señal realzada va un hop por detrás de la entrada (16 ms de retardo algorítmico); el primer hop emitido corresponde a t < 0 y puede descartarse, y es necesario inyectar un hop de ceros al final para vaciar el estado. El nivel de salida coincide con el motor GGML original (2× la convención de solapamiento y suma de la referencia en PyTorch). No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o ajuste fino supervisado adicional en la información proporcionada.

## Capacidades

- Cancelación de eco acústico (AEC) neuronal en tiempo real, usando la señal de referencia del altavoz para restar el eco de la captura del micrófono.
- Supresión de ruido de fondo sobre voz a 16 kHz.
- Desreverberación de la señal de voz.
- Procesamiento en streaming con estado persistente entre llamadas (33 tensores de estado de entrada y salida).
- Inferencia en CPU con objetivos de despliegue iOS 17 y macOS 14 o superiores.
- Dos modos de latencia: bloques de 16 ms (1 hop) y de 256 ms (16 hops), con audio de salida idéntico.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio generativo ni capacidades multilingües en sentido lingüístico.

## Casos de uso

- Videollamadas y reuniones en dispositivos Apple: el modelo se integra en la captura de micrófono para eliminar el eco del altavoz y el ruido ambiente antes de codificar el audio, usando la variante de 16 ms para minimizar el retardo percibido.
- Transcripción de voz en tiempo real: como preprocesado previo a un motor ASR, la supresión de ruido y desreverberación mejora la tasa de acierto en entornos ruidosos sin añadir latencia significativa (1,2 ms por llamada en la variante v1.3 de 16 ms sobre M5 Pro).
- Asistentes de voz en el dispositivo: al ejecutarse en CPU con 4,8 M de parámetros, cabe en el pipeline de un asistente local en iOS o macOS sin consumir GPU ni memoria apreciable.
- Grabación de notas de voz y podcasts: limpieza de grabaciones con reverberación de sala y ruido estacionario, procesando el audio por bloques de 256 ms para reducir la sobrecarga por llamada (7,1 ms por bloque, 36× tiempo real).
- Sistemas de comunicación manos libres (coche, auriculares): cancelación de eco entre el altavoz y el micrófono del mismo dispositivo, con la referencia de extremo lejano disponible en el propio hardware.
- Telefonía VoIP y gateways de audio: integración como etapa de realce en servidores o clientes macOS que necesiten procesar muchos flujos concurrentes; la variante v1.2 de 1,3 M alcanza 60× tiempo real por núcleo en CPU, lo que permite multiplexar decenas de llamadas por máquina.
- Preprocesado en pipelines de diarización o verificación de locutor: la señal realzada reduce la variabilidad acústica y mejora la robustez de los modelos posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta paridad numérica y velocidad de inferencia:

| Metrica | Valor |
|---|---|
| Diferencia maxima absoluta frente al CLI GGML original (clip de double-talk) | 2,8e-5 |
| SNR de paridad frente al motor GGML | 80 dB |
| Latencia p50 por llamada, v1.3 256 ms (M5 Pro, CPU) | 7,1 ms (36× tiempo real) |
| Latencia p50 por llamada, v1.3 16 ms (M5 Pro, CPU) | 1,2 ms (14× tiempo real) |
| Latencia p50 por llamada, v1.2 256 ms (M5 Pro, CPU) | 4,2 ms (60× tiempo real) |
| Latencia p50 por llamada, v1.2 16 ms (M5 Pro, CPU) | 0,7 ms (24× tiempo real) |

## Requisitos de hardware

- VRAM: no aplica; la inferencia se ejecuta en CPU. El modelo pesa del orden de decenas de MB en fp32 (4,8 M de parámetros), por lo que la huella de memoria es mínima.
- GPU: no requiere GPU. Está exportado específicamente para Core ML con ejecución en CPU; no se documenta uso de Neural Engine ni de GPU en la información disponible.
- Compatibilidad consumer: cualquier dispositivo Apple con iOS 17 o macOS 14 o superior, incluidos iPhone, iPad y Mac con Apple Silicon (las mediciones se realizaron en un M5 Pro).
- Despliegue: Core ML a través de la librería FluidAudio (`LocalVqeManager` / `LocalVqeStream`); los pesos originales pueden ejecutarse con el motor GGML de LocalVQE. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 0,7–7,1 ms por llamada según variante en M5 Pro, equivalente a 14–60× tiempo real; la latencia algorítmica es de 16 ms (un hop) en ambas variantes.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Formato / plataforma | Licencia | Notas |
|---|---|---|---|---|---|
| LocalVQE Core ML (este) | 1,3 M / 4,8 M | AEC + supresion de ruido + desreverberacion | Core ML, CPU Apple | Apache-2.0 | Exportacion de LocalVQE con estado de streaming |
| LocalVQE (original, LocalAI-io) | 1,3 M / 4,8 M | AEC + supresion de ruido + desreverberacion | PyTorch / GGML | Apache-2.0 | Modelo base; ejecutable fuera del ecosistema Apple |
| DeepVQE (Indenbom et al., 2023) | No disponible | AEC + supresion de ruido | PyTorch (referencia academica) | No disponible | Arquitectura de la que deriva LocalVQE |

No se dispone de datos de benchmarks comparativos con otros modelos de la categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en realce de voz a 16 kHz; no procesa otras frecuencias de muestreo ni tareas de lenguaje, visión o generación.
- Requiere la señal de referencia del altavoz (`ref`) para la cancelación de eco; sin ella, la componente AEC pierde su función principal.
- Retardo algorítmico de un hop (16 ms) entre entrada y salida, además del coste de cómputo por llamada.
- Solo se distribuyen pesos en fp32 para Core ML; no hay variantes cuantizadas a int8 o fp16 en la información disponible.
- Dependencia de plataforma: objetivos mínimos iOS 17 / macOS 14; no es portable directamente a Linux, Android o Windows en formato Core ML.
- Riesgo de artefactos o distorsión de la voz en condiciones de double-talk severo o relaciones señal-ruido muy bajas; no se documentan métricas de calidad perceptual (PESQ, STOI) en la información disponible.
- Licencia Apache-2.0 permite uso comercial, pero se debe citar el repositorio upstream y el paper de DeepVQE según indica la model card.
- No se documentan sesgos demográficos ni de idioma, aunque al ser un modelo de señal puede comportarse de forma desigual con voces muy agudas o graves; no hay evaluación publicada al respecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FluidInference/localvqe-coreml
- Modelo base (pesos originales): https://huggingface.co/LocalAI-io/LocalVQE
- Repositorio LocalVQE: https://github.com/localai-org/LocalVQE
- Librería FluidAudio: https://github.com/FluidInference/FluidAudio
- Código de conversión a Core ML: https://github.com/FluidInference/mobius (`models/enhancement/localvqe/coreml`)
- Paper DeepVQE (Indenbom et al., Interspeech 2023): https://arxiv.org/abs/2306.03177
