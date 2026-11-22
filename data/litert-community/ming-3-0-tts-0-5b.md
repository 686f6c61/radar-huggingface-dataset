# litert-community/Ming-3.0-tts-0.5B

## Resumen

Ming-3.0-tts-0.5B es un modelo de síntesis de voz (text-to-speech) de 0,5 mil millones de parámetros desarrollado por inclusionAI. Este repositorio concreto, publicado por litert-community, contiene una conversión del modelo original al formato LiteRT (TFLite) para su ejecución completamente local en dispositivos Android, sin necesidad de conexión de red. El modelo genera audio a 44,1 kHz a partir de texto en siete idiomas (inglés, chino, japonés, coreano, alemán, francés y español).

La relevancia de esta ficha radica en su enfoque *on-device*: el modelo se divide en varios grafos (modelo de lenguaje, cabecera de flujo, agregador y decodificador) que se distribuyen entre GPU y NPU del teléfono mediante la API CompiledModel de LiteRT 2.2.0. En un Galaxy S26 alcanza un factor de tiempo real de 0,93× con la colocación por defecto (LM y agregador en GPU, flujo en NPU, decodificador en GPU), lo que lo sitúa en el umbral de la síntesis de voz en tiempo real en hardware móvil de gama alta.

La arquitectura interna se apoya en Qwen2.5-0.5B (24 capas) como modelo de lenguaje que produce latentes de audio de 64 dimensiones, cada uno correspondiente a 80 ms de audio. El paquete pesa 3,6 GB y se distribuye bajo licencia MIT, lo que facilita su integración en aplicaciones comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (LM Qwen2.5-0.5B, 24 capas) + cabecera de flujo + agregador + decodificador causal de 24 capas con ISTFT |
| Parametros totales | 0,5 mil millones (modelo base Ming-3.0-tts-0.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el prompt de prefill usa 64 filas de entrada) |
| Tipos de cuantizacion | Pesos en float16, entradas y salidas en float32; grafo de flujo compilado para NPU con precisión reducida |
| Idiomas soportados | en, zh, ja, ko, de, fr, es |
| Licencia | MIT |
| Formato de pesos | LiteRT / TFLite (grafos `.tflite`), pesos float16 |
| Tamano del repositorio | 3,6 GB |
| Frecuencia de muestreo de audio | 44,1 kHz |
| Duracion por latente | 80 ms de audio |

## Arquitectura y entrenamiento

El modelo genera voz latente a latente: cada latente es un vector de 64 números que representa 80 ms de audio. Para cada latente, el modelo de lenguaje (Qwen2.5-0.5B, 24 capas) recibe una fila de entrada y devuelve un estado oculto. La cabecera de flujo transforma ese estado, el latente anterior y ruido gaussiano en el siguiente latente mediante 10 pasos de solver con *classifier-free guidance*. El agregador convierte el latente en la siguiente fila de entrada, y una cabecera de parada sobre el estado oculto decide cuándo termina la frase. El decodificador, un transformer causal de 24 capas, convierte 16 latentes por llamada en un espectro ISTFT, que el host transforma en audio a 44,1 kHz.

La conversión a LiteRT se realizó con litert-torch y se organiza en cinco grafos: `lm2_wfp16.tflite` (prefill de 64 filas y step de una fila, con la caché KV como entrada y salida), `flow_r4b_s10_wfp16.tflite` (10 pasos de solver en una sola llamada), `agg_r4b_wfp16.tflite`, `dec_c16_wfp16.tflite` (16 latentes, caché de 64 posiciones por capa) y las variantes `lm2_epsdiv_prefill_wfp16.tflite` y `lm2_epsdiv_step_wfp16.tflite` para la colocación en NPU. El host mantiene el tokenizador, el prompt, la búsqueda de embeddings, las tablas RoPE, las máscaras de atención, ambas cachés KV, la decisión de parada, el ruido y el ISTFT. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada.

## Capacidades

- Síntesis de voz a partir de texto en siete idiomas (inglés, chino, japonés, coreano, alemán, francés y español).
- Generación de audio a 44,1 kHz completamente local, sin conexión de red.
- Ejecución distribuida entre GPU y NPU del dispositivo mediante LiteRT CompiledModel.
- Modo de colocación alternativa que ejecuta todos los grafos en la NPU, con menor precisión pero mayor velocidad (1,35× tiempo real en Galaxy S26).
- Control de parada de frase mediante cabecera dedicada sobre el estado oculto.
- No se documentan capacidades de tool calling, agentes, visión ni audio de entrada.

## Casos de uso

- Lectura de textos largos en aplicaciones móviles sin conexión: el modelo permite que una app Android lea en voz alta artículos o libros completos en modo avión, como demuestra el ejemplo de la model card con una historia de 57 palabras generada en 14,7 s.
- Accesibilidad para personas con discapacidad visual: integración en lectores de pantalla y asistentes de navegación que requieren síntesis de voz local con baja latencia inicial (1,87 s hasta el primer audio en Galaxy S26).
- Asistentes de voz en dispositivos sin conectividad: sistemas de navegación GPS, dispositivos IoT o wearables que necesitan respuestas habladas sin depender de la nube.
- Traducción y doblaje en tiempo real: al cubrir siete idiomas, puede emplearse en apps de traducción que lean el texto traducido con voz natural en el propio dispositivo.
- Audiolibros y podcasts generados localmente: generación de narraciones a partir de texto con la ventaja de privacidad que supone no enviar contenido a servidores externos.
- Interfaces conversacionales en vehículos: síntesis de voz de baja latencia para sistemas de infoentretenimiento que requieren respuestas habladas inmediatas sin cobertura de red.
- Prototipado de aplicaciones TTS en Android: el paquete LiteRT y el `contract.json` facilitan la integración en apps de ejemplo y la experimentación con distintas colocaciones de grafos.

## Benchmarks y rendimiento

| Metrica | Galaxy S26 (Snapdragon SM8850, 12 GB) | Pixel 8a (Tensor G3, Mali-G715, 8 GB) |
|---|---|---|
| Factor de tiempo real (por defecto) | 0,93 (0,928 / 0,931 / 0,917) | 0,31 (0,312 / 0,307 / 0,308) |
| Primer audio | 1,87 s | 5,2 s |
| Un frame de 80 ms | 78 ms (LM 31 + flujo 37 + agregador 10) | 244 ms (94 + 127 + 23) |
| Llamada al decodificador (16 latentes) | 111 ms | 264 ms |
| Underruns de reproducción | 6/6/6 | 7/7/7 |

En el modo de colocación rápida (todos los grafos en NPU) del Galaxy S26, el factor de tiempo real es de 1,35× y el primer audio se genera a los 1,10 s, con menor precisión. El prefill del prompt consume 386–396 ms del tiempo hasta el primer audio. La compilación inicial del grafo de flujo para NPU tarda 49–63 s y requiere hasta 1,6 GB de memoria; la forma compilada se cachea (213 MB) y las cargas posteriores tardan 0,35 s. La memoria pico de la app (VmHWM) es de 4,6 GB. No se han publicado resultados de benchmarks de calidad de voz (MOS, WER) en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: la app de ejemplo alcanza un pico de 4,6 GB (VmHWM) en Galaxy S26; la compilación del grafo de flujo para NPU requiere hasta 1,6 GB.
- GPU recomendadas: Snapdragon SM8850 (Galaxy S26) con GPU y NPU Qualcomm; Mali-G715 (Pixel 8a) funciona pero sin NPU Qualcomm, con el flujo movido a GPU.
- Cabe en GPU de consumo: el modelo está orientado a móviles; no se documenta despliegue en GPU de escritorio.
- Opciones de despliegue: LiteRT 2.2.0 con CompiledModel API en Android; el paquete incluye los grafos `.tflite` y `contract.json` con la especificación de entradas y salidas.
- Latencia y throughput: en Galaxy S26, 78 ms por frame de 80 ms y 111 ms por llamada al decodificador; en Pixel 8a, 244 ms y 264 ms respectivamente.
- Almacenamiento: repositorio de 3,6 GB; caché de compilación NPU de 213 MB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Despliegue |
|---|---|---|---|---|---|
| Ming-3.0-tts-0.5B (LiteRT) | 0,5 B | no disponible | 7 | MIT | On-device Android (LiteRT) |
| Ming-3.0-tts-0.5B (original, inclusionAI) | 0,5 B | no disponible | 7 | MIT | PyTorch |
| no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos TTS comparables en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo genera ligeramente más despacio de lo que reproduce: se producen underruns de reproducción (6/6/6 en Galaxy S26, 7/7/7 en Pixel 8a) que obligan a esperar audio varias veces por frase.
- La compilación inicial del grafo de flujo para NPU tarda 49–63 s y consume hasta 1,6 GB de memoria, lo que puede afectar al arranque en frío de las aplicaciones.
- El modo de colocación rápida (todos los grafos en NPU) opera con menor precisión, con posible impacto en la calidad de audio no cuantificado en la información disponible.
- El rendimiento en Pixel 8a cae a 0,31× tiempo real, muy por debajo del umbral de tiempo real, por lo que la viabilidad depende del hardware.
- No se documentan sesgos conocidos, tasas de alucinación ni limitaciones específicas de idioma más allá de los siete soportados.
- La licencia MIT permite uso comercial, pero se recomienda verificar las condiciones del modelo base original de inclusionAI.
- No se han publicado métricas de calidad de voz (MOS, inteligibilidad) en la información disponible.

## Enlaces

- Repositorio LiteRT: https://huggingface.co/litert-community/Ming-3.0-tts-0.5B
- Modelo base original: https://huggingface.co/inclusionAI/Ming-3.0-tts-0.5B
- Contrato de entradas y salidas: https://huggingface.co/litert-community/Ming-3.0-tts-0.5B/blob/main/contract.json
- Demo en vídeo: https://huggingface.co/litert-community/Ming-3.0-tts-0.5B/resolve/main/assets/demo.mp4
- Comparativa de formas de onda: https://huggingface.co/litert-community/Ming-3.0-tts-0.5B/resolve/main/assets/hero.png
