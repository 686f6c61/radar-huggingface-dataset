# software-mansion/voice-isolator-ExecuTorch

## Resumen

voice-isolator-ExecuTorch es la exportación del modelo Inworld Voice Isolator v1 (64M parámetros) al formato `.pte` de ExecuTorch, preparada por Software Mansion para su uso con la librería React Native ExecuTorch. El modelo realiza aislamiento de voz: conserva la voz principal de una grabación y elimina ruido, música, otras voces y la cola de reverberación de la sala. No restaura información perdida en la grabación original.

La relevancia de esta ficha radica en que se trata de un modelo de audio-to-audio pensado para ejecución en dispositivo (on-device), sin necesidad de servidor. La exportación está optimizada para el backend MLX de ExecuTorch sobre GPUs Apple (Metal), con pesos en fp16 y kernels personalizados para las operaciones Mamba. El modelo upstream es de Inworld AI y se distribuye bajo licencia Apache 2.0.

El modelo opera a 48 kHz mono, acepta entradas de 0,2 a 8 segundos (múltiplos de 480 muestras, es decir, 10 ms) y devuelve una salida de la misma longitud y nivel que la entrada. Para clips más largos, la model card indica procesar en ventanas de 8 s con solapamiento de 2 s y crossfade lineal.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida con capas Mamba (convoluciones y selective scan), atención exclusiva, rotary positions y STFT/iSTFT |
| Parámetros totales | 64M (modelo upstream) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; ventana de audio de 0,2 a 8 s (9600 a 384000 muestras a 48 kHz) |
| Tipos de cuantización | fp16 (pesos y cómputo principal); fp32 para STFT, iSTFT, layer norms y máscara compleja |
| Idiomas soportados | No disponible (procesamiento de audio independiente del idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pte` (ExecuTorch program); variante `mlx/fp16/voice_isolator_mlx_fp16.pte` de 160,4 MB |

## Arquitectura y entrenamiento

La arquitectura combina procesamiento en el dominio de la frecuencia (STFT e iSTFT) con capas Mamba para el modelado temporal. Según la model card, la red calcula en fp16 en la GPU, mientras que el STFT, el iSTFT, las layer norms de los encoders de banda y del decoder, y la máscara compleja se ejecutan en fp32. Las convoluciones Mamba, los selective scans, las posiciones rotatorias, la atención exclusiva, las GELU y las layer norms de Mamba se implementan como kernels Metal personalizados.

Como innovación técnica destacable, las salidas de los scans Mamba superan el rango de fp16 en audio real, por lo que se computan escaladas por 2⁻⁸ (escalado exacto). El modelo upstream fue entrenado por Inworld AI; los detalles sobre número de tokens, composición del dataset y uso de RLHF/DPO no están disponibles en la información proporcionada. El archivo NOTICE incluye los datasets de entrenamiento según la model card.

## Capacidades

- Aislamiento de voz: conserva la voz en primer plano y elimina ruido, música, otras voces y la cola de reverberación de la sala.
- Procesamiento de audio a 48 kHz en mono, con entrada y salida float32 en el rango [-1, 1].
- Entradas de 0,2 a 8 segundos (9600 a 384000 muestras), con longitud múltiplo de 480 muestras (10 ms).
- Salida de la misma longitud y nivel que la entrada; la resta de salida e entrada permite obtener la señal eliminada.
- Procesamiento de clips largos mediante ventanas de 8 s con solapamiento de 2 s y crossfade lineal.
- Ejecución on-device en GPUs Apple mediante el backend MLX de ExecuTorch.
- No dispone de tool calling, function calling, capacidades de agente ni razonamiento multi-paso; es un modelo puramente audio-to-audio.
- No dispone de capacidades multilingües declaradas ni de modo thinking, visión o audio generativo.

## Casos de uso

- Limpieza de grabaciones de voz para podcasts y entrevistas: el modelo elimina ruido de fondo y música de un clip de hasta 8 s por ventana, procesando grabaciones largas por tramos con solapamiento y crossfade. Es adecuado por su operación a 48 kHz y su preservación del nivel de la voz.
- Preprocesado en pipelines de ASR: aplicar el aislamiento antes de un sistema de reconocimiento de voz para reducir la tasa de error en entornos ruidosos, ejecutándolo on-device en dispositivos Apple.
- Aplicaciones móviles de notas de voz: integración mediante React Native ExecuTorch para limpiar grabaciones en el propio iPhone sin enviar audio a un servidor, con un consumo de memoria de aproximadamente 0,9 GB en iPhone 17 para 8 s de audio.
- Videollamadas y grabación de reuniones: aislamiento de la voz del hablante principal en tiempo casi real (0,70 s de procesamiento para 8 s de audio en M4 Pro) para mejorar la inteligencia de la voz en la grabación.
- Producción de contenido y doblaje: separación de la voz principal de una mezcla para su posterior edición o remezcla, aprovechando que la señal eliminada se obtiene restando la salida de la entrada.
- Investigación en procesamiento de audio: uso como referencia reproducible de un modelo Mamba para speech enhancement, con comparación de calidad medida en SNR frente al modelo original en fp32 (74,7 dB en M4 Pro, 64,6 dB en iPhone 17).
- Herramientas de accesibilidad: mejora de la inteligibilidad de audios grabados en entornos ruidosos para su transcripción o escucha posterior en dispositivos Apple.

## Benchmarks y rendimiento

La model card proporciona medidas de latencia, memoria y fidelidad de la exportación frente al modelo original (PyTorch, fp32), no benchmarks estándar de calidad de separación (como SI-SNR o SDR sobre datasets públicos).

| Dispositivo | Entrada | Tiempo | Memoria pico |
|---|---|---|---|
| Apple M4 Pro | 2 s | 0,17 s | ~1,0 GB |
| Apple M4 Pro | 4 s | 0,34 s | ~1,2 GB |
| Apple M4 Pro | 8 s | 0,70 s | ~1,3 GB |
| iPhone 17 | 8 s | 1,05 s | ~0,9 GB |

| Comparación | SNR |
|---|---|
| Apple M4 Pro vs el original | 74,7 dB |
| iPhone 17 vs el original | 64,6 dB |

La memoria del Mac incluye aproximadamente 0,3 GB del proceso Python que ejecutó la medición. Las medidas se tomaron con la caché de buffers por defecto de MLX de 256 MB.

## Requisitos de hardware

- VRAM/memoria estimada: aproximadamente 1,0 GB para 2 s, 1,2 GB para 4 s y 1,3 GB para 8 s en Apple M4 Pro (incluyendo ~0,3 GB del proceso Python); aproximadamente 0,9 GB en iPhone 17 para 8 s.
- GPU recomendadas: GPUs Apple con soporte Metal (M4 Pro medido, iPhone 17 medido). El backend MLX está orientado a GPUs Apple; no se documenta soporte para GPUs NVIDIA o AMD en esta exportación.
- Cabe en hardware de consumo Apple: sí, en iPhone 17 y Apple M4 Pro según las medidas publicadas. No hay datos para otros dispositivos.
- Opciones de despliegue: runtime ExecuTorch v1.4.1 con backend MLX, compilado con `ET_MLX_ALLOW_CUSTOM_KERNEL_EXECUTION`; librería React Native ExecuTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este formato).
- Latencia y throughput: 0,17 s para 2 s de audio, 0,34 s para 4 s y 0,70 s para 8 s en M4 Pro; 1,05 s para 8 s en iPhone 17. El procesamiento es más rápido que tiempo real en los dispositivos medidos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/ventana | Formato/despliegue | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| voice-isolator-ExecuTorch (esta ficha) | 64M | 0,2–8 s a 48 kHz | ExecuTorch `.pte`, backend MLX (Apple) | Apache 2.0 | Hugging Face, repo de 0,2 GB |
| inworld/voice-isolator (upstream) | 64M | No disponible | Checkpoint PyTorch offline | Apache 2.0 | Hugging Face |
| Alternativas de aislamiento de voz | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la información proporcionada de datos de benchmarks comparativos con otros modelos de aislamiento de voz (por ejemplo, Demucs, MossFormer u otros separadores). La comparativa se limita al modelo upstream del que deriva esta exportación.

## Limitaciones y advertencias

- El modelo no restaura nada que la grabación haya perdido; solo elimina lo que rodea a la voz.
- Ventana máxima de 8 s por inferencia; clips más largos requieren procesamiento por ventanas con solapamiento y crossfade, lo que puede introducir artefactos en las uniones.
- La entrada debe ser mono a 48 kHz y múltiplo de 480 muestras; el remuestreo y la conversión a mono se realizan fuera del modelo.
- Compatibilidad estricta con ExecuTorch v1.4.1 y backend MLX; ExecuTorch no garantiza compatibilidad hacia adelante, por lo que versiones anteriores del runtime pueden fallar al cargar el archivo.
- Requiere que el backend MLX se compile con `ET_MLX_ALLOW_CUSTOM_KERNEL_EXECUTION` para ejecutar los kernels Metal personalizados.
- La librería React Native ExecuTorch no dispone todavía de un task pipeline para este modelo; la carga debe hacerse siguiendo la documentación de descarga de modelos.
- Solo se documenta una variante (MLX fp16); no hay versiones para CUDA, CPU genérica u otros backends en la información disponible.
- Riesgo de sesgos y alucinaciones: no disponible; al ser un modelo de separación de audio, el riesgo principal es la distorsión o supresión parcial de la voz en condiciones adversas, no la generación de contenido falso.
- Licencia Apache 2.0 permite uso comercial; deben conservarse los archivos LICENSE y NOTICE al redistribuir el modelo, incluyendo los avisos de Inworld y los datasets de entrenamiento.
- No se han publicado datos sobre idiomas soportados ni sobre comportamiento con voces no humanas o múltiples hablantes simultáneos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/software-mansion/voice-isolator-ExecuTorch
- Modelo upstream: https://huggingface.co/inworld/voice-isolator
- Licencia del modelo upstream: https://huggingface.co/inworld/voice-isolator/blob/main/LICENSE
- Librería React Native ExecuTorch: https://www.npmjs.com/package/react-native-executorch
- Documentación de React Native ExecuTorch (descarga de modelos): https://docs.swmansion.com/react-native-executorch/docs/fundamentals/downloading-models
- Nota de compatibilidad de ExecuTorch: https://github.com/pytorch/executorch/blob/main/runtime/COMPATIBILITY.md
