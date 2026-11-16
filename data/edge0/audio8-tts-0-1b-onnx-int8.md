# Edge0/audio8-TTS-0.1B-ONNX-INT8

## Resumen

Audio8 TTS Preview 0.1B ONNX INT8 es una conversión optimizada para CPU del modelo de síntesis de voz Audio8 TTS Preview 0.1B, desarrollado por el equipo de Audio8 (autor de la conversión: Edge0). El modelo original es un sistema de text-to-speech multilingüe compacto de aproximadamente 100 millones de parámetros con capacidad de clonación de voz zero-shot, y esta variante lo empaqueta en grafos ONNX con cuantización INT8 para ejecutarse en ONNX Runtime mediante `CPUExecutionProvider`, sin necesidad de GPU ni de PyTorch en tiempo de inferencia.

La relevancia de esta release radica en su huella de despliegue: alrededor de 0,6 GB en memoria tras cargar las sesiones online y unos 1,0 GB para el repositorio completo (incluido el encoder FP16 de registro de voces), lo que permite servir TTS con clonación de voz en hardware modesto, incluidos dispositivos tipo Jetson. La arquitectura DualAR (slow AR híbrido Falcon-H1 con atención y Mamba, más un fast AR que predice los codebooks del códec) sigue el diseño de Fish Audio S2 Pro.

El modelo cubre 11 idiomas (cantonés, chino, neerlandés, inglés, francés, alemán, italiano, japonés, coreano, polaco y español), con salida de audio mono a 44,1 kHz, y se distribuye bajo la licencia Audio8 Community v1.0. Es una release en estado preview, con cobertura lingüística intencionadamente limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DualAR: slow AR híbrido Falcon-H1 (atención + Mamba), fast AR autoregresivo sobre codebooks del códec |
| Parametros totales | ~100 M (excluyendo el códec) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 2.048 posiciones empaquetadas de texto/audio |
| Tipos de cuantizacion | INT8 (cuantización dinámica de activaciones, `MatMulInteger`) en slow/fast AR; FP16 en encoder y decoder del códec; salida de waveform FP32 |
| Idiomas soportados | yue, zh, nl, en, fr, de, it, ja, ko, pl, es |
| Licencia | audio8-community-license-v1.0 |
| Formato de pesos | ONNX (grafos por token, sesiones de ONNX Runtime) |
| Códec de audio | 44,1 kHz, 2.048 muestras por frame (~21,5 frames/s), 10 codebooks de 4.096 entradas |
| Capas slow AR | 24 capas, anchura 512, 8 cabezas de atención, 2 KV heads, Mamba d_state 64 |
| Capas fast AR | 4 capas, anchura 512 |
| Execution provider | ONNX Runtime CPU |
| Tamaño del repo | ~0,9 GB (completo, con encoder de registro de voces ~1,0 GB) |
| Memoria en inferencia | ~0,6 GB tras cargar sesiones online |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura DualAR inspirada en Fish Audio S2 Pro. El slow AR emplea un diseño híbrido Falcon-H1 que combina atención (8 cabezas, 2 KV heads) con capas Mamba (d_state 64) en 24 capas de anchura 512, y predice un token semántico por frame de audio. El fast AR, de 4 capas y anchura 512, predice los codebooks del frame condicionado por el estado oculto del slow AR y los codebooks precedentes. El códec trabaja a 44,1 kHz con 2.048 muestras por frame (unos 21,5 frames por segundo) y 10 codebooks de 4.096 entradas cada uno.

La conversión a ONNX reorganiza el slow AR como un grafo recurrente por token, pasando explícitamente los estados de atención y Mamba (interfaz recurrente apilada, atención de prefijo válido), lo que mantiene la carga de CPU muy baja. La cuantización INT8 aplica cuantización dinámica de activaciones sobre las operaciones MatMul, mientras que el códec se mantiene en FP16. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO en la información proporcionada.

## Capacidades

- Síntesis de voz multilingüe en 11 idiomas: cantonés, chino, neerlandés, inglés, francés, alemán, italiano, japonés, coreano, polaco y español.
- Clonación de voz zero-shot mediante un encoder FP16 incluido para registrar voces de referencia reutilizables localmente.
- Inferencia nativa en CPU con ONNX Runtime, sin dependencia de CUDA, PyTorch, Transformers ni Hugging Face Hub tras la descarga.
- Salida de audio PCM en streaming y fichero, mono, 44,1 kHz, FP32.
- Interfaz de servicio local: CLI, interfaz web, API HTTP y endpoint compatible con OpenAI.
- Registro de perfiles de voz locales reutilizables entre síntesis.
- No dispone de tool calling, razonamiento multi-paso ni capacidades de visión o audio de entrada; es exclusivamente text-to-speech.

## Casos de uso

- Atención al cliente automatizada: el modelo permite generar respuestas habladas en tiempo real en 11 idiomas con una latencia de ~19 ms por token del slow AR y ~8 ms por frame del fast AR, adecuada para integrarse en sistemas IVR o asistentes telefónicos.
- Audiolibros y contenido editorial: con clonación zero-shot se puede registrar una voz concreta y sintetizar textos largos manteniendo consistencia de timbre, con contexto de hasta 2.048 posiciones empaquetadas.
- Accesibilidad y lectores de pantalla: al ejecutarse en CPU con ~0,6 GB de memoria, puede desplegarse en equipos de usuario final sin GPU dedicada.
- Doblaje y localización de vídeo: la cobertura de 11 idiomas y la salida a 44,1 kHz permiten generar pistas de voz para contenidos multilingües, aunque la cobertura es limitada en esta release preview.
- Dispositivos edge y embebidos: el diseño CPU-native y los wheels específicos de ONNX Runtime permiten despliegue en plataformas como Jetson para asistentes locales sin conectividad.
- Prototipado de agentes conversacionales por voz: el endpoint compatible con OpenAI facilita sustituir servicios TTS en la nube por un servicio local en pipelines existentes.
- Generación de voces para videojuegos y aplicaciones interactivas: el registro de perfiles de voz locales permite reutilizar personajes sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Los únicos datos de rendimiento proporcionados son de latencia en el host de pruebas del autor (8 hilos): ~19 ms por token del slow AR, ~8 ms por frame del fast AR y ~19 ms por token de prompt en el prefill inicial.

## Requisitos de hardware

- Memoria: ~0,6 GB tras cargar las sesiones online (slow AR, fast AR y decoder del códec); ~1,0 GB para el repositorio completo con el encoder de registro de voces.
- GPU: no necesaria; el modelo está diseñado para `CPUExecutionProvider` de ONNX Runtime.
- Cabe en cualquier CPU moderna de escritorio o portátil; probado en macOS arm64 y Linux x86_64.
- Plataformas edge: pueden requerirse wheels específicos de ONNX Runtime para dispositivos como Jetson.
- Despliegue: ONNX Runtime con el directorio `onnx_runtime_0_1b_int8` del repositorio GitHub; incluye CLI, interfaz web, API HTTP, streaming PCM y endpoint compatible con OpenAI.
- Requisitos de software: Python 3.10 o superior.
- Latencia estimada (8 hilos): ~19 ms por token slow AR, ~8 ms por frame fast AR, ~19 ms por token de prompt en prefill.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Audio8 TTS Preview 0.1B ONNX INT8 | ~100 M | 2.048 posiciones | 11 | Audio8 Community v1.0 | ONNX INT8, CPU |
| Audio8 TTS Preview 0.1B (base) | ~100 M | 2.048 posiciones | 11 | Audio8 Community v1.0 | Pesos originales (no especificado) |
| Masterx/Audio8-TTS-Preview-0.1B-ONNX-INT8 | ~100 M | no disponible | 11 | no disponible | ONNX INT8 (conversión comunitaria previa) |
| Fish Audio S2 Pro (referencia arquitectónica) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas alternativas.

## Limitaciones y advertencias

- Estado preview: la cobertura lingüística es intencionadamente limitada a los 11 idiomas recomendados; el soporte multilingüe amplio y de dialectos chinos está planificado para futuras releases.
- Licencia Audio8 Community v1.0: es una licencia "other", no estándar; es imprescindible revisar el fichero LICENSE antes de cualquier uso comercial.
- El directorio `onnx_runtime/` del repositorio GitHub corresponde a los grafos incompatibles de 0.6B INT4 y no debe usarse con este modelo; hay que emplear `onnx_runtime_0_1b_int8`.
- El consumo real de memoria varía según plataforma y comportamiento del allocator.
- No se dispone de información sobre sesgos, tasa de alucinación o calidad de clonación por idioma en la documentación proporcionada.
- La calidad de la clonación zero-shot depende de la calidad de la muestra de referencia registrada.
- Solo se ha probado en macOS arm64 y Linux x86_64; otros entornos pueden requerir wheels específicos de ONNX Runtime.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Edge0/audio8-TTS-0.1B-ONNX-INT8
- Licencia: https://huggingface.co/Edge0/audio8-TTS-0.1B-ONNX-INT8/blob/main/LICENSE
- Modelo base: https://huggingface.co/Audio8/Audio8-TTS-Preview-0.1b
- Repositorio GitHub: https://github.com/Audio8-AI/Audio8_TTS
- Directorio de runtime INT8: https://github.com/Audio8-AI/Audio8_TTS/tree/master/onnx_runtime_0_1b_int8
- Demo: https://audio8-ai.github.io/Audio8_TTS/0.1B/
- Conversión comunitaria previa: https://huggingface.co/Masterx/Audio8-TTS-Preview-0.1B-ONNX-INT8
- ONNX Runtime: https://onnxruntime.ai/
- Fish Audio S2 Pro (referencia arquitectónica): https://github.com/fishaudio/fish-speech
