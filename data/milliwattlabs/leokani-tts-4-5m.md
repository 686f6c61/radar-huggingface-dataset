# milliwattlabs/leokani-tts-4.5M

## Resumen

Leokani-tts 4.5M es un modelo de síntesis de voz (text-to-speech) ultraligero desarrollado por Milliwatt Labs, un laboratorio centrado en modelos de IA de muy bajo consumo que puedan ejecutarse en hardware doméstico sin GPU ni centro de datos. Se trata de la variante reducida del Leokani-tts 7M: comparte la misma voz femenina de inglés americano llamada Dala, pero comprime el modelo hasta 4,3 millones de parámetros para poder correr en CPUs lentas e incluso en microcontroladores como el ESP32-S3 y el ESP32-P4.

El modelo fue entrenado sobre habla sintética generada con Kokoro-82M, de ahí la etiqueta `kokoro` en el repositorio, y se distribuye en formato PyTorch (safetensors) y ONNX con variantes fp32, fp16 e int8. Genera audio mono a 24 kHz y admite control de velocidad de habla (`--speed`). Su propuesta de valor es clara: calidad de voz razonable con un coste computacional y de memoria que lo sitúa uno o dos órdenes de magnitud por debajo de alternativas como Kokoro-82M o Piper.

Es relevante ahora porque demuestra que la síntesis de voz neuronal puede ejecutarse en hardware embebido de menos de un vatio, abriendo casos de uso en domótica (integración oficial con Home Assistant), dispositivos portátiles y sistemas sin conectividad. El repositorio ocupa solo 0,1 GB y acumula 309 descargas y 6 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de síntesis de voz (detalles de arquitectura no disponibles; compatible con el ecosistema Kokoro) |
| Parametros totales | 4.286.698 (4,3 M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo TTS; procesa texto por líneas) |
| Tipos de cuantizacion | fp32 (17 MB), fp16 (8,6 MB), int8 (5,1 MB) en ONNX; safetensors fp32 y fp16 |
| Idiomas soportados | inglés (en), voz femenina americana "Dala" |
| Licencia | milliwatt-labs-model-license (licencia propia, marcada como `other`) |
| Formato de pesos | safetensors (PyTorch), ONNX (fp32, fp16, int8) |
| Frecuencia de muestreo | 24 kHz mono |
| Fonemizador | espeak-ng (por defecto) o Leokani G2P (propio, incluido) |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

No se detalla en la información disponible la arquitectura interna exacta (capas, tipo de decoder, vocoder). Lo que sí se documenta es que el modelo sigue el paradigma de Kokoro: recibe fonemas como entrada (generados con espeak-ng o con el fonemizador propio Leokani G2P) y produce audio a 24 kHz. La etiqueta `kokoro` y la compatibilidad con fonemas estilo Kokoro (`--phonemes "..."`) sugieren una arquitectura derivada o inspirada en Kokoro-82M, pero el autor no publica el detalle de capas ni el diseño del vocoder.

El entrenamiento se realizó sobre habla sintética generada con Kokoro-82M, es decir, destilación de datos (data distillation) más que entrenamiento sobre corpus humano. No se especifica el número de tokens, horas de audio ni si hubo ajuste fino con RLHF o DPO (poco habitual en TTS). La innovación principal es la compresión extrema: mantener una voz inteligible y natural con 4,3 M de parámetros, lo que permite inferencia en tiempo real (o cercano) en un solo núcleo ARM y decodificación en microcontroladores ESP32. Se ofrecen además scripts de inferencia en PyTorch (`leokani.py`) y ONNX Runtime (`leokani_onnx.py`), con soporte de fp16 e int8.

## Capacidades

- Síntesis de voz a partir de texto en inglés americano con una única voz femenina (Dala).
- Control de velocidad de habla mediante el parámetro `--speed` (por ejemplo, 0,85 para habla más lenta).
- Fonemización integrada mediante Leokani G2P (compatible con espeak-ng) o mediante espeak-ng externo; también acepta fonemas Kokoro directamente.
- Inferencia en CPU sin GPU, con variantes ONNX fp32, fp16 e int8 para reducir memoria y latencia.
- Ejecución en microcontroladores (ESP32-P4 y ESP32-S3 con Arduino) y en placas ARM de un solo núcleo.
- Manejo razonable de números, fechas, unidades y nombres propios según los ejemplos de la model card (precios, horas, millas, nombres multilingües).
- No soporta tool calling, function calling, agentes, visión, audio de entrada ni modo de razonamiento; es exclusivamente un modelo TTS.
- Capacidad multilingüe: no disponible; solo inglés.

## Casos de uso

- Asistente de voz para domótica con Home Assistant: el modelo se instala como add-on oficial (amd64 y arm64) y permite respuestas habladas en local sin depender de la nube, con latencia de primera locución de 128 ms en ARM.
- Dispositivos embebidos y wearables: con 5,1 MB en int8 y ejecución a 0,56×–1,06× tiempo real en ESP32-S3/P4, puede dar voz a mandos, termostatos o relojes sin conexión.
- Lectura de notificaciones y alertas en sistemas de bajo consumo: con 38× tiempo real en un solo núcleo Cortex-A725, puede narrar avisos en una Raspberry Pi u otra SBC sin GPU.
- Sistemas de accesibilidad offline: conversión de texto a voz en lectores de pantalla o interfaces para personas con discapacidad visual en equipos sin acelerador gráfico.
- Kioscos y terminales de información: anuncios de turnos, precios o instrucciones en pantallas interactivas donde no se justifica un modelo de 80 M de parámetros.
- Generación masiva de audio en servidores modestos: en una GPU NVIDIA GB10 alcanza 4.257× tiempo real con muchas líneas simultáneas, útil para pregenerar locuciones de aplicaciones o audiolibros cortos.
- Prototipado de interfaces conversacionales: por su tamaño reducido se puede iterar rápidamente en portátiles y contenedores ligeros sin reservar VRAM.

## Benchmarks y rendimiento

El autor publica métricas de velocidad y eficiencia energética, no benchmarks de calidad subjetiva (MOS) ni de inteligibilidad (WER).

| Plataforma / modelo | Parámetros | Velocidad (× tiempo real) | Primera locución | J por minuto de habla |
|---|---:|---:|---:|---:|
| Leokani-tts 4.5M en Cortex-A725 (1 núcleo, 2,8 GHz) | 4,3 M | 38× | 128 ms | no disponible |
| Leokani-tts 4.5M en ESP32-P4 (360 MHz, Arduino) | 4,3 M | 1,06× | 126 ms | no disponible |
| Leokani-tts 4.5M en ESP32-S3 (240 MHz, Arduino) | 4,3 M | 0,56× | 247 ms | no disponible |
| Leokani-tts 4.5M en DGX Spark (GB10), una línea | 4,3 M | 485× | no disponible | 0,47 |
| Leokani-tts 4.5M en DGX Spark, muchas líneas | 4,3 M | 4.257× | 9 ms | 0,47 |
| Leokani-tts 7M en DGX Spark, muchas líneas | 7 M | 3.500× | no disponible | 0,52 |
| Piper (en_US lessac medium) | 15,7 M | 72× | no disponible | 3,52 |
| KittenTTS nano 0.8 | 14 M | 75× | no disponible | 6,15 |
| KittenTTS mini 0.8 | 73 M | 29× | no disponible | 9,29 |
| Kokoro-82M | 82 M | 86× | no disponible | 14,6 |
| Kyutai Pocket TTS | 110 M | 14,1× | no disponible | 32,1 |
| Chatterbox | 798 M | 2,1× | no disponible | no disponible |

No se han publicado resultados de benchmarks de calidad (MOS, WER, similitud de voz) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; en CPU ocupa entre 5,1 MB (ONNX int8) y 17 MB (safetensors fp32) de pesos, más overhead del runtime.
- GPU recomendadas: cualquiera es suficiente; el autor reporta pruebas en NVIDIA GB10 (DGX Spark) con 4.257× tiempo real en modo multi-línea. Funciona igualmente en A100, H100 o RTX 4090, aunque está sobredimensionado para ellas.
- Cabe en cualquier GPU de consumo (RTX 3060, 4060, etc.) e incluso en placas integradas; también en Raspberry Pi y en microcontroladores ESP32.
- Opciones de despliegue: PyTorch (`leokani.py`), ONNX Runtime (`leokani_onnx.py`), add-on de Home Assistant (amd64 y arm64) y Arduino para ESP32. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo TTS de este tamaño).
- Latencia: primera locución de 126–247 ms en microcontroladores y 128 ms en un núcleo ARM; 9 ms en GPU con la voz ya cargada.
- Throughput: 38× tiempo real en un solo núcleo ARM, 1,06× en ESP32-P4, 0,56× en ESP32-S3 y 4.257× en GPU con múltiples líneas simultáneas.

## Comparativa con modelos similares

| Modelo | Parámetros | Velocidad (× RT, 1 línea) | Energía (J/min) | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| Leokani-tts 4.5M | 4,3 M | 485× (GPU) / 38× (ARM) | 0,47 | milliwatt-labs-model-license | Hugging Face, Home Assistant, ONNX |
| Leokani-tts 7M | 7 M | 486× (GPU) | 0,52 | milliwatt-labs-model-license | Hugging Face, apps multiplataforma |
| Piper (en_US lessac medium) | 15,7 M | 72× (GPU) | 3,52 | MIT (upstream Piper) | Hugging Face, ecosistema amplio |
| KittenTTS nano 0.8 | 14 M | 75× (GPU) | 6,15 | no disponible | Hugging Face |
| Kokoro-82M | 82 M | 86× (GPU) | 14,6 | Apache 2.0 | Hugging Face, amplia adopción |
| Kyutai Pocket TTS | 110 M | 14,1× (GPU) | 32,1 | no disponible | Hugging Face |

Leokani-tts 4.5M es el más pequeño de la comparativa y el que menos energía consume por minuto de audio, a costa de una única voz y de un idioma. Kokoro-82M ofrece más voces y ecosistema, pero consume unas 31 veces más energía por minuto de habla según los datos del autor.

## Limitaciones y advertencias

- Una sola voz (Dala, femenina, inglés americano); no hay clonación de voz ni selección de hablante.
- Solo inglés: no soporta castellano ni otros idiomas, lo que limita su uso en productos multilingües.
- Entrenado sobre habla sintética de Kokoro-82M, por lo que puede heredar artefactos o sesgos acústicos del modelo profesor y no está garantizada la naturalidad frente a corpus humanos.
- Riesgo de errores de pronunciación en nombres propios, siglas o términos técnicos poco frecuentes; conviene revisar los fonemas o usar `--phonemes`.
- La licencia `milliwatt-labs-model-license` es propia y marcada como `other`: es imprescindible revisar el texto antes de uso comercial, redistribución o integración en productos.
- espeak-ng es una dependencia externa bajo GPL-3.0 y no se incluye en el repositorio; su uso puede imponer obligaciones de licencia en determinados despliegues. La alternativa Leokani G2P está incluida y evita esa dependencia.
- El rendimiento en ESP32-S3 es inferior al tiempo real (0,56×), por lo que no es apto para conversación fluida en ese chip; en ESP32-P4 apenas alcanza 1,06×.
- No se han publicado métricas de calidad (MOS, WER) ni evaluaciones de sesgo; la validación cualitativa queda a cargo del integrador.
- Modelo de fecha futura (creado en noviembre de 2026 según los metadatos): verificar la vigencia de la información y de los enlaces antes de desplegarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/milliwattlabs/leokani-tts-4.5M
- Modelo completo Leokani-tts 7M: https://huggingface.co/milliwattlabs/leokani-tts-7M
- Variante Leokani-tts 1M: https://huggingface.co/milliwattlabs/leokani-tts-1M
- Variante Leokani-tts 500K: https://huggingface.co/milliwattlabs/leokani-tts-500K
- Fonemizador Leokani G2P: https://huggingface.co/milliwattlabs/leokani-g2p
- Licencia: https://huggingface.co/milliwattlabs/leokani-tts-4.5M/blob/main/LICENSE-MILLIWATT-LABS.md
- Web de Milliwatt Labs (apps y documentación): https://milliwattlabs.com
- Página del modelo en Milliwatt Labs: https://milliwattlabs.com/models/leokani-tts-4-5m/
- Add-ons de Home Assistant: https://github.com/Milliwatt-Labs/home-assistant-addons
- Modelo profesor Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
