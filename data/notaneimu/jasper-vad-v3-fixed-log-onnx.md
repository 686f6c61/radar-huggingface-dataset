# notaneimu/jasper-vad-v3-fixed-log-onnx

## Resumen

Jasper VAD v3 es un detector de actividad de voz (VAD) compacto publicado por el usuario notaneimu en Hugging Face. El modelo acepta audio mono a 16 kHz y produce logits de voz/no voz cada 20 ms, sin requerir vector de hablante ni condicionamiento por locutor. Se distribuye exclusivamente en formato ONNX optimizado para ejecución en CPU mediante onnxruntime, lo que lo diferencia de implementaciones basadas en PyTorch y lo orienta a despliegues ligeros y de baja latencia.

La arquitectura subyacente es un encoder Jasper en FP32, acompañado de un frontend Fourier fijo implementado como operaciones STFT nativas de ONNX. El repositorio incluye dos rutas de inferencia: un grafo completo `audio_to_logits.onnx` que acepta forma de onda cruda, y un encoder separado (`encoder.onnx` más `window.npy`) que requiere un frontend FFT externo vía SciPy. No se trata de un modelo PVAD condicionado por hablante, ni de un sistema de diarización, ni de un reconocedor de voz.

El modelo es relevante por su enfoque en eficiencia: ejecución validada en CPU con un solo hilo, sin dependencia de Torch ni SciPy en la ruta directa, y soporte de streaming con modos de inferencia configurables que equilibran latencia y precisión. El repositorio es de tamaño prácticamente nulo (0.0 GB reportados) y no registra descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder Jasper (FP32) con frontend STFT fijo en ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | Ventana de entrada nominal de 2900 ms en modo streaming; clip completo en modo offline |
| Tipos de cuantización | no disponible (pesos en FP32) |
| Idiomas soportados | no disponible (detección de voz independiente del idioma) |
| Licencia | no disponible |
| Formato de pesos | ONNX (opset 17), con `window.npy` auxiliar para la ruta FFT externa |

## Arquitectura y entrenamiento

El modelo emplea un encoder Jasper, una arquitectura convolucional orientada a tareas de audio, en precisión FP32. El frontend es una STFT fija implementada como operaciones nativas de ONNX (`STFT` y `Pad` con modo reflection), lo que permite ejecutar el grafo completo directamente sobre forma de onda sin preprocesado Python. La salida son logits de dos clases (voz/no voz) por frame de 20 ms, con una probabilidad derivada mediante softmax y un umbral por defecto de 0.5.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens o muestras procesadas, la composición de los datos, ni si se aplicaron técnicas de RLHF, DPO u otras. La model card describe únicamente el comportamiento en inferencia y los modos de ejecución. La innovación técnica destacable es la separación entre un grafo completo de forma de onda y un encoder reutilizable con frontend FFT externo, junto con un esquema de streaming que repaqueta paquetes de transporte de tamaños arbitrarios a pasos de inferencia fijos (380 ms o 2580 ms según modo).

## Capacidades

- Detección de actividad de voz (VAD) ordinaria sobre audio mono a 16 kHz, con salida de logits y probabilidad cada 20 ms.
- Modo offline: una única pasada forward sobre el clip completo, adecuado para audio grabado.
- Modos streaming: `r320`, `r160` y `lr160`, con distintos equilibrios entre contexto futuro real, relleno de ceros y latencia de buffering.
- Ejecución en CPU validada con onnxruntime, con configuración de un solo hilo (`intra_op_num_threads = 1`, `inter_op_num_threads = 1`, ejecución secuencial).
- API de streaming que acepta paquetes PCM de tamaños arbitrarios y repaqueta internamente al paso de inferencia seleccionado.
- Salidas estructuradas: `probabilities`, `speech` booleano, `start_sec`, `end_sec`, `sample_rate`, `frame_sec`, `mode`, `backend` y `threshold`.
- No incluye filtrado por duración, fusión de huecos, histéresis ni padding de voz; estas etapas deben implementarse en la aplicación.
- No soporta tool calling, function calling, agentes, razonamiento multi-step, visión, audio de entrada distinto de forma de onda PCM, ni capacidades multilingües en el sentido de generación de texto.

## Casos de uso

- Detección de voz en pipelines de transcripción: el modelo puede actuar como etapa previa que segmenta audio mono a 16 kHz y descarta silencios antes de enviar fragmentos a un ASR, reduciendo coste computacional en modo `offline` para grabaciones y en `r320` para flujos en tiempo real.
- Atención al cliente automatizada: integrado en un sistema de captura de micrófono, el modo `r320` ofrece un equilibrio medido entre calidad y latencia (buffering típico de 510 ms, máximo 700 ms) adecuado para activar la grabación solo cuando hay habla.
- Reuniones y videoconferencia: el modo `r320` se describe como el mejor equilibrio calidad/latencia medido sobre el conjunto de prueba de reuniones; útil para marcar segmentos de habla en grabaciones multipartícipe sin necesidad de diarización.
- Procesamiento por lotes de archivos largos: el modo `offline` realiza una sola pasada sobre el clip completo, apropiado para transcripción diferida de archivos donde la memoria crece con la duración pero no se requiere latencia.
- Procesamiento de grandes lotes con latencia tolerable: el modo `lr160` reduce el coste computacional al avanzar en pasos de 2580 ms, adecuado cuando la respuesta diferida es aceptable y se prioriza el rendimiento agregado.
- Despliegue en dispositivos sin GPU: al validarse en CPU con onnxruntime y sin dependencia de Torch, puede integrarse en servidores modestos o entornos embebidos donde no hay acelerador disponible, siempre que el runtime implemente opset 17 con `STFT` y `Pad` reflection.
- Filtrado previo en sistemas de wake-word o grabación activada por voz: la salida booleana `speech` por frame de 20 ms permite construir lógica de activación con umbral configurable (por defecto 0.5).

## Benchmarks y rendimiento

La model card proporciona datos de error comparativos entre modos de streaming sobre un conjunto de prueba de reuniones, aunque no se detallan las métricas absolutas ni el tamaño del conjunto:

| Modo | Paso | Contexto futuro real | Relleno de ceros | Buffering típico / máximo | Arranque con paquetes del tamaño del paso |
|---|---:|---:|---:|---:|---:|
| `offline` | Clip completo | Clip completo | 0 | Espera al clip | Espera al clip |
| `r320` | 380 ms | 320 ms | 940 ms | 510 / 700 ms | 2280 ms |
| `r160` | 380 ms | 160 ms | 1100 ms | 350 / 540 ms | 1900 ms |
| `lr160` | 2580 ms | 160 ms | 0 | 1450 / 2740 ms | 5160 ms |

El modo `r160` presenta un error 0.287 puntos porcentuales superior al de `r320` según la medición citada. Para `lr160` no se ha medido la precisión completa sobre el conjunto de reuniones. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo cual es esperable dado que se trata de un modelo VAD y no de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo está diseñado para ejecución en CPU y no se documentan requisitos de memoria GPU.
- GPU recomendadas: no disponible; la ejecución en GPU y móvil no está establecida por esta release, según la model card.
- Cabe en GPU consumer: no confirmado; la validación se realizó exclusivamente en CPU.
- Opciones de despliegue: onnxruntime con `CPUExecutionProvider` (validado), con configuración recomendada de un hilo intra-op y uno inter-op, modo secuencial y optimización de grafo `ORT_ENABLE_ALL`. También se ofrece la ruta con frontend FFT externo vía SciPy (`backend="fft"`).
- Latencia y throughput: la cadencia de predicción es de 20 ms por frame, pero la model card advierte explícitamente que esto no equivale a la cadencia de llamadas de inferencia ni a la latencia extremo a extremo. Los retardos de buffering calculados se detallan en la tabla de benchmarks; el retardo real depende además de la inferencia en CPU, el transporte y el postprocesado.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La model card únicamente delimita el alcance frente a otras categorías (PVAD condicionado por hablante, diarización, reconocimiento de voz) sin establecer comparaciones cuantitativas con alternativas VAD concretas.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jasper VAD v3 (este modelo) | no disponible | 2900 ms nominal en streaming | Error relativo entre modos documentado; sin benchmarks estándar | no disponible | Hugging Face, ONNX |
| Alternativas VAD | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La licencia no está especificada en la información disponible, lo que impide evaluar su uso comercial sin consultar al autor.
- El modelo solo acepta audio mono a 16 kHz; el CLI rechaza estéreo u otras frecuencias, y el usuario debe hacer downmix y remuestreo previamente.
- Requiere PCM en punto flotante a escala de amplitud normal (aproximadamente -1 a 1); no debe usarse PCM entero convertido a float sin escalar, ni normalizar picos por ventana.
- No incluye control automático de ganancia, denoising ni remuestreo.
- Las salidas son decisiones por frame sin filtrado por duración, fusión de huecos, histéresis ni padding de voz; la lógica de postprocesado recae en la aplicación.
- En modo `offline`, el consumo de memoria crece con la duración del audio; no debe asumirse que el procesamiento por trozos es idéntico.
- El modo `lr160` no tiene medida la precisión completa sobre el conjunto de reuniones, por lo que su calidad en producción es incierta.
- El runtime debe implementar opset 17 de ONNX, incluyendo `STFT` y `Pad` con reflection; la ejecución en GPU y móvil no está validada.
- Debe crearse una nueva sesión por grabación o discontinuidad; las sesiones cerradas no deben reutilizarse.
- No se documentan sesgos conocidos ni tasas de alucinación (no aplica en el sentido generativo), pero al ser un detector binario puede producir falsos positivos y negativos según el umbral, que es configurable y por defecto 0.5.
- El repositorio no registra descargas ni likes, y el tamaño reportado es 0.0 GB, lo que sugiere una publicación reciente y sin validación comunitaria amplia.

## Enlaces

- Hugging Face: https://huggingface.co/notaneimu/jasper-vad-v3-fixed-log-onnx
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
