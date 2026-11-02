# nvidia/Real-time_RE-USE

## Resumen

Real-time RE-USE es un modelo de mejora de voz (speech enhancement) universal y en tiempo real desarrollado por NVIDIA. Su objetivo es restaurar la calidad de audio degradado —ruido aditivo, reverberación, clipping, limitación de ancho de banda, artefactos de códec, pérdida de paquetes y micrófonos de baja calidad— preservando simultáneamente la fidelidad de los atributos paralingüísticos: contenido lingüístico, identidad del hablante, emoción y acento. Se distribuye como un único checkpoint que cubre múltiples tasas de muestreo de entrada (8, 16, 22.05, 24, 32, 44.1 y 48 kHz) y es agnóstico al idioma.

La innovación principal es el control explícito de la latencia algorítmica y computacional dentro de un mismo modelo, con 30 configuraciones de latencia distintas que permiten ajustar el compromiso calidad-latencia sin cambiar de checkpoint. Esto se consigue variando la capa de salida (`Exit_layer`, entre 3 y 12) y el número de frames de look-ahead (`look_ahead_frames`, entre 0 y 2). El modelo está pensado para aplicaciones de streaming, como front-end de ASR, back-end de TTS o videoconferencia.

Arquitectónicamente es un modelo compacto: encoder convolucional, decoder convolucional y modelado tiempo-frecuencia mediante Mamba, con hasta 12 capas. La model card declara 3,7 M de parámetros, mientras que el recuento real de pesos en safetensors asciende a 13.475.815 parámetros. El repositorio ocupa aproximadamente 0,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder convolucional + decoder convolucional + Mamba para modelado tiempo-frecuencia (hasta 12 capas) |
| Parametros totales | 13.475.815 (recuento real en safetensors); la model card declara 3,7 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de audio en streaming; opera por frames) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Agnóstico al idioma (sin lista de idiomas publicada) |
| Licencia | NVIDIA One-Way Noncommercial License (NSCLv1); etiqueta `other` en HuggingFace |
| Formato de pesos | safetensors |
| Tarea | audio-to-audio (streaming speech enhancement) |
| Tasas de muestreo de entrada/salida | 8, 16, 22.05, 24, 32, 44.1 y 48 kHz, mono |
| Formatos de audio | .wav de entrada y salida |
| Configuraciones de latencia | 30 |
| Librería | mamba-ssm |
| Hardware declarado | NVIDIA Ampere (A100); sistemas acelerados por GPU NVIDIA |
| Sistema operativo preferido | Linux |

## Arquitectura y entrenamiento

El modelo combina un front-end y un back-end convolucionales con un núcleo de modelado tiempo-frecuencia basado en Mamba, una arquitectura de espacio de estados (SSM) con coste de cómputo lineal en la longitud de secuencia. El diseño está orientado a streaming: la inferencia online procesa un frame de entrada y emite un frame de salida, y la model card indica que la salida de la inferencia offline y la online debería ser prácticamente idéntica. La profundidad efectiva es configurable en tiempo de inferencia mediante `Exit_layer` (3 a 12), lo que permite truncar la red y reducir latencia a costa de calidad.

El entrenamiento se enmarca en la teoría del compromiso distorsión-percepción, buscando un equilibrio entre supresión de degradaciones y preservación de fidelidad. Los artículos de referencia son "Rethinking Training Targets, Architectures and Data Quality for Universal Speech Enhancement" (NeurIPS 2026) y "One Model, Many Latencies: Universal Speech Enhancement for Diverse Real-Time Applications" (IEEE SLT 2026). La model card advierte de que el checkpoint publicado difiere del reportado en los papers: incorpora tipos de degradación adicionales (respuesta de micrófono y más códecs) y está afinado sobre un subconjunto limpio más pequeño y de alta calidad. No se detallan en la información disponible el número de tokens de audio, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO (no aplicables de forma habitual en esta tarea).

## Capacidades

- Mejora de voz universal: eliminación de ruido aditivo, desreverberación, corrección de clipping, extensión de ancho de banda, reparación de artefactos de códec y recuperación de pérdida de paquetes.
- Soporte de múltiples tasas de muestreo de entrada y salida (8 a 48 kHz), lo que evita remuestrear previamente el audio.
- Capacidad agnóstica al idioma: no requiere configuración por lengua.
- Preservación de atributos paralingüísticos: identidad del hablante, emoción, acento y contenido lingüístico.
- Inferencia en streaming frame a frame (`online_inference.py`) con latencia controlable.
- Control de compromiso calidad-latencia mediante `Exit_layer` y `look_ahead_frames`, con 30 configuraciones.
- Extensión de ancho de banda opcional configurable mediante el argumento `BWE`.
- Procesamiento de audio y vídeo en la demo (el vídeo se procesa extrayendo la pista de audio).
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente audio-a-audio.

## Casos de uso

- Front-end de ASR en entornos ruidosos: el modelo se coloca antes del reconocedor para mejorar la relación señal-ruido y reducir la tasa de error en transcripción; su naturaleza agnóstica al idioma permite reutilizar el mismo pipeline en múltiples lenguas sin reentrenar.
- Back-end de TTS: se aplica sobre la salida sintetizada para eliminar artefactos de códec y limitaciones de ancho de banda, mejorando la calidad percibida antes de la entrega al usuario.
- Videoconferencia y llamadas en tiempo real: con `look_ahead_frames = 0` y una `Exit_layer` baja se obtiene la latencia mínima para suprimir ruido de fondo y reverberación en directo.
- Restauración de archivos históricos o de baja calidad: grabaciones telefónicas (8 kHz) o material con clipping se pueden mejorar y, opcionalmente, extender su ancho de banda hasta 48 kHz mediante `BWE`.
- Preprocesado de datasets de voz para entrenamiento: normalización de corpus con degradaciones heterogéneas (micrófonos distintos, códecs distintos) antes de usarlos en el entrenamiento de modelos de reconocimiento o de síntesis.
- Reparación de audio transmitido con pérdida de paquetes: en pipelines de VoIP o streaming se puede aplicar el modelo para reconstruir frames perdidos o degradados.
- Limpieza de audio para podcasts y contenido grabado en movilidad, donde la reverberación y el ruido ambiental son habituales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el rendimiento se mantiene "cercano a modelos especializados" en las 30 configuraciones de latencia, pero no incluye tablas con métricas (PESQ, STOI, DNSMOS u otras) ni cifras concretas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Con 13,47 M de parámetros en safetensors y un repositorio de 0,1 GB, el modelo es muy ligero y cabe holgadamente en cualquier GPU consumer; el cuello de botella es el streaming, no la memoria.
- GPU recomendadas: la model card declara compatibilidad con NVIDIA Ampere (A100) y sistemas acelerados por GPU NVIDIA. Dado el tamaño, cualquier GPU NVIDIA moderna (RTX 3090, RTX 4090, A10, L4, T4) debería ser suficiente, aunque no se confirma oficialmente en la información disponible.
- GPU consumer: sí, previsiblemente cabe en cualquier GPU consumer con soporte CUDA; no se especifica un mínimo oficial.
- Despliegue: la librería es `mamba-ssm`; se proporcionan scripts `offline_inference.sh` y `online_inference.sh` (streaming). Hay entornos Docker preconstruidos para simplificar la instalación de Mamba, enlazados desde el repositorio SEMamba. Requiere Linux. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Dependencia opcional: `resampy` si se utiliza extensión de ancho de banda.
- Latencia y throughput: no se publican cifras concretas; la latencia es configurable mediante `Exit_layer` y `look_ahead_frames`.

## Comparativa con modelos similares

| Modelo | Autor | Parametros | Tarea | Latencia configurable | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Real-time RE-USE | NVIDIA | 13,47 M (safetensors) | Mejora de voz universal en streaming | Si (30 configuraciones) | NSCLv1 (no comercial) | HuggingFace |
| RE-USE | NVIDIA | No disponible en la informacion | Mejora de voz universal offline | No (offline) | No disponible en la informacion | HuggingFace |
| SEMamba | Comunidad / investigacion | No disponible en la informacion | Mejora de voz con Mamba | No disponible en la informacion | No disponible en la informacion | Repositorio GitHub |

La comparación se limita a los modelos citados en la información proporcionada; no se dispone de datos de benchmarks que permitan contrastar rendimiento entre ellos.

## Limitaciones y advertencias

- Licencia restrictiva: NVIDIA One-Way Noncommercial License (NSCLv1). El uso comercial está prohibido sin acuerdo adicional con NVIDIA.
- Modelo destinado exclusivamente a investigación y desarrollo según la model card.
- El checkpoint publicado no coincide con el de los papers: incorpora degradaciones adicionales y está afinado sobre un subconjunto más pequeño, por lo que los resultados reportados en las publicaciones no son directamente extrapolables.
- No se documentan sesgos específicos, pero al ser agnóstico al idioma y entrenado con datos no detallados, el rendimiento puede variar entre lenguas y acentos; no hay evaluación por idioma publicada.
- Riesgo de sobre-suprisión o alteración de atributos paralingüísticos en condiciones extremas de degradación, derivado del compromiso distorsión-percepción que el propio modelo declara optimizar.
- Solo soporta audio mono; no se menciona procesamiento multicanal.
- Requiere Linux y configuración de Mamba (entornos Docker recomendados), lo que añade fricción de despliegue frente a modelos puramente PyTorch.
- No hay cifras publicadas de latencia ni de throughput, lo que dificulta dimensionar un despliegue en producción sin pruebas propias.
- La demo de HuggingFace usa inferencia offline, por lo que no sirve para evaluar latencia real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nvidia/Real-time_RE-USE
- Demo Gradio: https://huggingface.co/spaces/nvidia/Real-time_RE-USE
- Modelo offline RE-USE: https://huggingface.co/nvidia/RE-USE
- Paper 1 (NeurIPS 2026): https://arxiv.org/abs/2603.02641
- Paper 2 (IEEE SLT 2026): http://arxiv.org/abs/2606.25621
- Licencia NSCLv1: https://github.com/NVlabs/HMAR/blob/main/LICENSE
- Entornos Docker para Mamba (SEMamba): https://github.com/RoyChao19477/SEMamba?tab=readme-ov-file#-docker-support
