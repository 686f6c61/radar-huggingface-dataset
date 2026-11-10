# milliwattlabs/leokani-tts-4.5M

## Resumen

Leokani-tts 4.5M es un modelo de síntesis de voz (text-to-speech) ultraligero desarrollado por Milliwatt Labs, un laboratorio centrado en modelos de IA de bajo consumo que funcionan sin GPU ni centros de datos. Con 4.286.698 parámetros, es la variante reducida de Leokani-tts 7M y está diseñado para ejecutarse en CPUs lentas, ordenadores de placa única e incluso microcontroladores como el ESP32-P4 o el ESP32-S3. Genera voz femenina en inglés americano (voz "Dala") y fue entrenado sobre habla sintética producida con Kokoro-82M.

El modelo resuelve un problema muy concreto: la síntesis de voz local en dispositivos con recursos mínimos, sin dependencia de servicios en la nube. Su relevancia actual reside en que demuestra que un TTS inteligible cabe en menos de 5 MB de pesos (int8) y se ejecuta en tiempo real en hardware de menos de un vatio, algo que hasta hace poco requería modelos decenas de veces mayores.

La arquitectura sigue el linaje de Kokoro (basada en StyleTTS2 con decodificador ISTFTNet), con salida mono a 24 kHz. Se distribuye en PyTorch y ONNX, con pesos fp32, fp16 e int8, y admite dos fonemizadores: espeak-ng (dependencia externa GPL-3.0) o Leokani G2P, un fonemizador propio compatible incluido en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Estilo Kokoro / StyleTTS2 con decodificador ISTFTNet (no confirmado explicitamente en la model card) |
| Parametros totales | 4.286.698 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | fp32, fp16, int8 |
| Idiomas soportados | en (ingles americano, voz femenina "Dala") |
| Licencia | milliwatt-labs-model-license (license: other) |
| Formato de pesos | safetensors (17 MB fp32, 8.6 MB fp16), ONNX (fp32, fp16, int8 de 5.1 MB) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna ni el proceso de entrenamiento más allá de indicar que deriva de Leokani-tts 7M y que fue entrenado sobre habla sintética generada con Kokoro-82M. Por la nomenclatura (tags "kokoro", fonemas compatibles con Kokoro, salida a 24 kHz) y por la familia de modelos a la que pertenece, se infiere una arquitectura del linaje StyleTTS2 con decodificador ISTFTNet, aunque esta afirmación no se confirma de forma explícita en la información disponible.

No se proporcionan datos sobre número de tokens de entrenamiento, composición del dataset, ni si hubo etapas de RLHF, DPO o ajuste fino con preferencias. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. La innovación principal del modelo es de escala: comprimir una voz inteligible en 4,3 millones de parámetros manteniendo compatibilidad de fonemas con Kokoro y ofreciendo un fonemizador propio (Leokani G2P) para eliminar la dependencia de espeak-ng.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés americano con una única voz femenina ("Dala").
- Salida de audio mono a 24 kHz.
- Control de velocidad de habla mediante el parámetro `--speed` (por ejemplo, 0.85 para ralentizar).
- Fonemización mediante espeak-ng (por defecto) o Leokani G2P (`--g2p leokani`), un fonemizador propio compatible con espeak-ng incluido en el repositorio.
- Aceptación de fonemas en estilo Kokoro directamente mediante `--phonemes`.
- Inferencia en PyTorch y en ONNX Runtime, con variantes fp32, fp16 e int8.
- Ejecución en CPU, GPU y microcontroladores (ESP32-P4, ESP32-S3) mediante Arduino.
- No soporta tool calling, function calling, agentes, razonamiento multietapa, visión ni audio de entrada. Es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz domésticos en Home Assistant: el modelo se instala como add-on (amd64 y arm64) y permite respuestas habladas locales en una Raspberry Pi o servidor doméstico sin enviar texto a la nube, con una latencia de primera locución de 128 ms en un núcleo Arm Cortex-A725.
- Dispositivos embebidos y wearables: con 5,1 MB en int8 y ejecución a 1,06× tiempo real en un ESP32-P4 a 360 MHz, es viable para avisos hablados en electrodomésticos, sensores o dispositivos de bajo consumo.
- Lectura de notificaciones y alertas en sistemas IoT: la baja huella de memoria permite integrarlo en firmware Arduino para anunciar estados, medidas o eventos sin conexión.
- Síntesis por lotes en servidores sin GPU: en un DGX Spark alcanza 4.257× tiempo real con muchas líneas simultáneas, útil para generar grandes volúmenes de audio (audiolibros cortos, avisos, locuciones) en CPU.
- Prototipado rápido de interfaces de voz: al ser compatible con fonemas de Kokoro y ofrecer un script de línea de comandos sencillo (`leokani.py`), sirve para validar flujos de TTS antes de invertir en modelos mayores.
- Accesibilidad en equipos modestos: permite dotar de voz a aplicaciones de lectura en ordenadores antiguos o de placa única donde modelos de 80-800 M de parámetros no caben o no alcanzan tiempo real.
- Pruebas de integración en pipelines CI/CD: el tamaño reducido del repositorio (0,1 GB) facilita incluirlo en contenedores de test para verificar la generación de audio sin dependencias pesadas.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.), que no aplican a un modelo TTS. Sí incluye mediciones de velocidad y eficiencia energética:

| Modelo | Parametros | × tiempo real por linea | × tiempo real muchas lineas | J por minuto de habla en GPU |
|---|---:|---:|---:|---:|
| Leokani-tts 4.5M | 4,3 M | 485× | 4.257× | 0,47 |
| Leokani-tts 7M | 7 M | 486× | 3.500× | 0,52 |
| Piper (en_US lessac medium) | 15,7 M | 72× | — | 3,52 |
| KittenTTS nano 0.8 | 14 M | 75× | — | 6,15 |
| KittenTTS mini 0.8 | 73 M | 29× | — | 9,29 |
| Kokoro-82M | 82 M | 86× | — | 14,6 |
| Kyutai Pocket TTS | 110 M | 14,1× | — | 32,1 |
| Chatterbox | 798 M | 2,1× | — | 430 |

Mediciones en una NVIDIA GB10 (DGX Spark). J por minuto = energía de GPU por encima del reposo. El GB10 no tiene sensor de potencia de CPU, por lo que los modelos que ejecutan parte del trabajo en CPU aparecen ligeramente favorecidos. "—" indica ausencia de modo por lotes.

Rendimiento por plataforma:

| Plataforma | Dispositivo | Velocidad | Primera locucion |
|---|---|---:|---:|
| Linux | 1 núcleo Arm (Cortex-A725, 2,8 GHz) | 38× | 128 ms |
| ESP32-P4 | ESP32-P4, 360 MHz, Arduino | 1,06× | 126 ms |
| ESP32-S3 | ESP32-S3, 240 MHz, Arduino | 0,56× | 247 ms |
| GPU | DGX Spark (GB10), muchas líneas | 4.257× | 9 ms |

Velocidad = segundos de habla por segundo de cómputo. Primera locución = tiempo hasta el primer audio de una línea con la voz ya cargada. En ESP32 se usan ambos núcleos. Leokani-tts 7M en el mismo ESP32-P4 y librería rinde 0,84×.

## Requisitos de hardware

- VRAM: no requiere GPU. En CPU basta con unos pocos MB de RAM para los pesos (17 MB fp32, 8,6 MB fp16, 5,1 MB int8 en ONNX).
- GPU recomendadas: ninguna es necesaria; el modelo funciona en cualquier CPU moderna. En GPU, se ha medido en NVIDIA GB10 (DGX Spark) con 4.257× tiempo real en modo por lotes.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer e incluso en iGPU; también en Raspberry Pi, Mac, iPhone, Android y Linux.
- Microcontroladores: ESP32-P4 (1,06× tiempo real) y ESP32-S3 (0,56× tiempo real) con Arduino.
- Opciones de despliegue: PyTorch (`leokani.py`), ONNX Runtime (`leokani_onnx.py`), add-on de Home Assistant (amd64 y arm64), y aplicaciones oficiales para Mac, iPhone, Android, Linux, Raspberry Pi y navegador (estas últimas documentadas para el modelo de 7M).
- Latencia y throughput: primera locución de 9 ms en GPU, 126-128 ms en ESP32-P4 y Cortex-A725; 38× tiempo real en un solo núcleo Arm a 2,8 GHz.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (× tiempo real, 1 linea) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| Leokani-tts 4.5M | 4,3 M | no aplica | 485× | milliwatt-labs-model-license | Hugging Face, ONNX, Home Assistant, ESP32 |
| Leokani-tts 7M | 7 M | no aplica | 486× | milliwatt-labs-model-license | Hugging Face, apps multiplataforma |
| Kokoro-82M | 82 M | no aplica | 86× | Apache 2.0 (según el modelo original de Kokoro) | Hugging Face |
| Piper (en_US lessac medium) | 15,7 M | no aplica | 72× | MIT (según el proyecto Piper) | Hugging Face, repositorio Piper |
| KittenTTS nano 0.8 | 14 M | no aplica | 75× | no disponible | Hugging Face |

Leokani-tts 4.5M destaca por ser el más pequeño de la comparativa y el más rápido por línea en las mediciones del autor, con un consumo energético por minuto de habla muy inferior (0,47 J frente a 3,52 J de Piper o 14,6 J de Kokoro-82M). Su desventaja principal es la licencia propia no estándar y el soporte de un único idioma y una única voz, frente a alternativas como Kokoro o Piper con más voces e idiomas.

## Limitaciones y advertencias

- Una sola voz (femenina, inglés americano, "Dala"): no hay selección de hablante ni soporte multilingüe.
- Entrenado sobre habla sintética de Kokoro-82M, lo que puede arrastrar artefactos o sesgos acústicos del modelo generador.
- No se documentan evaluaciones de naturalidad (MOS) ni comparaciones perceptuales con otros modelos, por lo que la calidad subjetiva no está cuantificada.
- Licencia "milliwatt-labs-model-license" (license: other): es necesario revisar los términos en el archivo LICENSE-MILLIWATT-LABS.md antes de un uso comercial; no es una licencia de código abierto estándar.
- espeak-ng es una dependencia separada bajo GPL-3.0 y no se incluye en el repositorio; su uso puede imponer obligaciones de licencia adicionales. Leokani G2P evita esta dependencia.
- En ESP32-S3 el rendimiento es inferior al tiempo real (0,56×), por lo que no sirve para síntesis continua en ese chip sin recortes.
- No apto para clonación de voz, emoción controlable, SSML avanzado ni otras funciones de TTS expresivo, según la información disponible.
- Riesgo de pronunciación incorrecta en nombres propios, siglas o unidades poco frecuentes; la model card incluye muestras específicas para fechas, unidades y nombres, lo que sugiere que son casos sensibles.
- No se han publicado resultados de benchmarks perceptivos ni comparativas objetivas de inteligibilidad (WER, MOS) en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/milliwattlabs/leokani-tts-4.5M
- Modelo completo Leokani-tts 7M: https://huggingface.co/milliwattlabs/leokani-tts-7M
- Fonemizador Leokani G2P: https://huggingface.co/milliwattlabs/leokani-g2p
- Licencia: https://huggingface.co/milliwattlabs/leokani-tts-4.5M/blob/main/LICENSE-MILLIWATT-LABS.md
- Web de Milliwatt Labs (modelo y apps): https://milliwattlabs.com/models/leokani-tts-4-5m/
- Add-on de Home Assistant: https://github.com/Milliwatt-Labs/home-assistant-addons
- Kokoro-82M (modelo base del habla sintética de entrenamiento): https://huggingface.co/hexgrad/Kokoro-82M
