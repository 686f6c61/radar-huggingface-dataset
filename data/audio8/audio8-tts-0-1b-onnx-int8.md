# Audio8/audio8-TTS-0.1B-ONNX-INT8

## Resumen

Audio8 TTS Preview 0.1B ONNX INT8 es la distribución optimizada para CPU de un modelo compacto de síntesis de voz (text-to-speech) multilingüe con clonación de voz zero-shot. Lo desarrolla Audio8 y deriva del checkpoint base Audio8/Audio8-TTS-Preview-0.1b, un modelo de aproximadamente 100 millones de parámetros (sin contar el códec) que emplea una arquitectura DualAR inspirada en Fish Audio S2 Pro. Esta variante concreta empaqueta los grafos en formato ONNX con cuantización INT8 dinámica para los módulos autorregresivos y FP16 para el códec neuronal, de modo que la inferencia se ejecuta íntegramente sobre ONNX Runtime con el `CPUExecutionProvider`, sin necesidad de GPU ni de PyTorch.

El interés de esta release es fundamentalmente de despliegue: reduce el peso en memoria a unos 0,6 GB al cargar las sesiones en línea (frente a 1,0 GB del repositorio completo, que incluye el encoder de registro de voces), elimina dependencias de PyTorch, Transformers y del Hub tras la descarga, y ofrece latencias medidas de aproximadamente 19 ms por token del slow AR y 8 ms por frame del fast AR en un host de 8 hilos. Con una ventana de contexto de hasta 2.048 posiciones empaquetadas de texto y audio, el modelo cubre 11 idiomas (cantonés, chino, neerlandés, inglés, francés, alemán, italiano, japonés, coreano, polaco y español) y genera audio mono a 44,1 kHz.

Es relevante ahora porque demuestra que un TTS con clonación de voz puede ejecutarse en entornos de bajos recursos —CPU, dispositivos embebidos tipo Jetson, servidores sin acelerador— manteniendo una calidad de audio de 44,1 kHz y una API compatible con OpenAI. La contrapartida es una licencia comunitaria propia (audio8-community-license-v1.0) que conviene revisar antes de cualquier uso comercial, y un estado explícito de "preview" con cobertura lingüística deliberadamente limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DualAR (slow AR + fast AR); slow AR Falcon-H1 híbrido atención + Mamba; códec neuronal |
| Parametros totales | ~100 M (modelo principal, excluyendo el códec) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 2.048 posiciones empaquetadas de texto/audio |
| Tipos de cuantizacion | INT8 dinámica (slow AR y fast AR, `MatMulInteger`); FP16 (encoder y decoder del códec); salida de waveform FP32 |
| Idiomas soportados | yue, zh, nl, en, fr, de, it, ja, ko, pl, es (11 idiomas) |
| Licencia | audio8-community-license-v1.0 |
| Formato de pesos | ONNX (grafos por token para los AR, códec en FP16) |

Detalles adicionales de configuración: slow AR de 24 capas con anchura 512, 8 cabezas de atención, 2 cabezas KV y Mamba con `d_state` 64; fast AR de 4 capas con anchura 512; 10 codebooks acústicos de 4.096 entradas cada uno; códec a 44,1 kHz con 2.048 muestras por frame del modelo (~21,5 frames/s); salida mono. Tamaño del repositorio: 0,9 GB.

## Arquitectura y entrenamiento

El modelo sigue una arquitectura DualAR en la que un slow AR predice un token semántico por cada frame de audio y un fast AR predice los codebooks del códec correspondientes a ese frame, condicionado por el estado oculto del slow AR y por los codebooks precedentes. El slow AR es un híbrido Falcon-H1 que combina capas de atención (8 cabezas de consulta, 2 de clave-valor) con capas de estado Mamba (`d_state` 64), lo que permite mantener estado recurrente explícito entre tokens. En esta exportación ONNX, el slow AR se ejecuta como un grafo recurrente por token que recibe explícitamente los estados de atención y de Mamba, mientras que el fast AR opera por frame. El códec neuronal, en FP16, convierte los codebooks acústicos en waveform a 44,1 kHz.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO sobre el checkpoint base. Sí se documenta que el diseño de exportación por token (interfaz recurrente apilada, atención de prefijo válido) y la estrategia de cuantización INT8 se adaptaron de la conversión comunitaria Masterx/Audio8-TTS-Preview-0.1B-ONNX-INT8, aunque los grafos y el tooling son producidos de forma independiente por el equipo de Audio8 a partir del checkpoint oficial. La innovación técnica destacable es precisamente el empaquetado: grafos recurrentes por token con estados pasados de forma explícita que mantienen la carga de CPU muy baja, más un encoder FP16 opcional para registrar voces de referencia reutilizables localmente.

## Capacidades

- Síntesis de voz (text-to-speech) multilingüe en 11 idiomas: cantonés, chino, neerlandés, inglés, francés, alemán, italiano, japonés, coreano, polaco y español.
- Clonación de voz zero-shot a partir de una voz de referencia, con un encoder FP16 incluido para registrar perfiles de voz reutilizables en local.
- Generación de audio a 44,1 kHz mono, con 2.048 muestras por frame del modelo.
- Inferencia nativa en CPU mediante ONNX Runtime `CPUExecutionProvider`, sin CUDA ni PyTorch.
- Streaming de PCM y servicio HTTP con endpoint compatible con OpenAI, según el repositorio de runtime asociado.
- Interfaz de línea de comandos y UI web proporcionadas por el código de inferencia del proyecto.
- Contexto de hasta 2.048 posiciones empaquetadas de texto y audio, lo que permite referencias de voz y texto de entrada relativamente largos en una sola pasada.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión ni audio de entrada; el modelo es exclusivamente texto a voz.

## Casos de uso

- Narración por lotes en servidores sin GPU: el modelo se ejecuta sobre ONNX Runtime en CPU con ~0,6 GB de memoria en línea, lo que permite generar audiolibros o artículos locutados en máquinas estándar de un proveedor cloud sin coste de acelerador.
- Asistentes de voz en dispositivos embebidos: con latencias de ~19 ms por token del slow AR y ~8 ms por frame del fast AR en 8 hilos, es viable en placas tipo Jetson o mini-PC para interfaces conversacionales locales.
- Clonación de voz para accesibilidad: el encoder FP16 permite registrar una voz de referencia y reutilizarla, útil para preservar la voz de un usuario con pérdida del habla en comunicaciones asistidas.
- Doblaje y localización de contenido: la cobertura de 11 idiomas, incluidos español, francés, alemán, italiano, japonés y coreano, permite generar pistas de voz para vídeos o cursos sin contratar locutores por idioma.
- Integración en pipelines de atención al cliente: el endpoint compatible con OpenAI y el streaming PCM facilitan conectar el TTS a un LLM existente para respuestas habladas de baja latencia en entornos on-premise.
- Prototipado rápido de productos de voz: al no requerir PyTorch ni Transformers tras la descarga, un equipo puede desplegar un servicio TTS en un contenedor ligero y validar la experiencia de usuario antes de invertir en infraestructura GPU.
- Generación de avisos y anuncios automatizados: la salida a 44,1 kHz mono es adecuada para megafonía, podcasts corporativos y sistemas de anuncios dinámicos que requieren calidad de audio alta sin hardware dedicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los únicos datos de rendimiento proporcionados son mediciones de latencia del despliegue en CPU: aproximadamente 19 ms por token del slow AR, 8 ms por frame del fast AR y 19 ms por token de prompt en el prefill inicial, medidos en un host de prueba de 8 hilos. No se aportan cifras objetivas de calidad (MOS, similitud de hablante, WER) ni comparaciones con otros sistemas TTS.

## Requisitos de hardware

- VRAM estimada: no aplica; la inferencia está pensada para CPU. La memoria del sistema necesaria es de aproximadamente 0,6 GB al cargar las sesiones en línea (slow AR, fast AR y decoder del códec) y de aproximadamente 1,0 GB para el repositorio completo con el encoder de registro de voces.
- GPU recomendadas: no se especifican; el `CPUExecutionProvider` de ONNX Runtime es el modo documentado. No se detalla soporte de `CUDAExecutionProvider` para estos grafos.
- Cabe en CPU consumer: sí, es el objetivo del paquete. Probado en macOS arm64 y Linux x86_64; se mencionan wheels específicos de ONNX Runtime para dispositivos como Jetson.
- Opciones de despliegue: ONNX Runtime con `CPUExecutionProvider`; el repositorio de runtime incluye CLI, UI web, API HTTP, streaming PCM y endpoint compatible con OpenAI. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: ~19 ms por token del slow AR y ~8 ms por frame del fast AR en un host de 8 hilos; ~19 ms por token de prompt en el prefill. El throughput agregado no se especifica.
- Requisitos de software: Python 3.10 o superior y `huggingface_hub[cli]` para la descarga; no se requiere PyTorch ni Transformers tras la descarga.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Formato / despliegue | Licencia |
|---|---|---|---|---|---|
| Audio8 TTS 0.1B ONNX INT8 | ~100 M (sin códec) | 2.048 posiciones | 11 | ONNX INT8/FP16, CPU | audio8-community-license-v1.0 |
| Audio8/Audio8-TTS-Preview-0.1b (base) | ~100 M (sin códec) | 2.048 posiciones | 11 | Pesos originales del checkpoint | no disponible en la informacion proporcionada |
| Masterx/Audio8-TTS-Preview-0.1B-ONNX-INT8 (conversion comunitaria) | ~100 M (sin códec) | no disponible | no disponible | ONNX INT8 | no disponible en la informacion proporcionada |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas de otros fabricantes (por ejemplo, modelos TTS de tamaño comparable) en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de calidad, latencia o cobertura lingüística frente a ellos.

## Limitaciones y advertencias

- Estado "preview": la cobertura lingüística es deliberadamente limitada a los 11 idiomas recomendados; el soporte multilingüe amplio y de dialectos chinos se anuncia para versiones futuras.
- Licencia audio8-community-license-v1.0: es una licencia "other" con términos propios; es imprescindible revisar el texto completo antes de cualquier uso comercial, redistribución o despliegue en producción.
- Riesgo de alucinación acústica y artefactos: no se publican métricas objetivas de calidad (MOS, similitud de hablante, WER), por lo que la fiabilidad en voces, idiomas o textos atípicos no está cuantificada.
- Sesgos: no se documenta la composición del dataset de entrenamiento, de modo que no es posible evaluar sesgos de acento, género, edad o variedad dialectal en las voces generadas.
- Clonación de voz: la capacidad zero-shot exige consentimiento explícito de la persona cuya voz se clona y puede entrar en conflicto con normativa de protección de datos y de derechos de imagen; no se documentan salvaguardas técnicas en la información disponible.
- Limitación de contexto: 2.048 posiciones empaquetadas de texto y audio restringen la longitud de las referencias de voz y de los textos de entrada en una sola pasada.
- Compatibilidad de grafos: el directorio `onnx_runtime/` del repositorio apunta a grafos INT4 del modelo 0.6B y no es compatible con este paquete; hay que usar `onnx_runtime_0_1b_int8`.
- Uso de memoria variable: los ~0,6 GB medidos dependen de la plataforma y del comportamiento del allocator; en dispositivos con poca RAM conviene validar el consumo real.
- Idiomas del campo `language` de Hugging Face: la ficha del Hub figura como "no disponibles" aunque la model card lista 11 idiomas; conviene contrastar ambas fuentes en integraciones automatizadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Audio8/audio8-TTS-0.1B-ONNX-INT8
- Modelo base: https://huggingface.co/Audio8/Audio8-TTS-Preview-0.1b
- Repositorio GitHub del proyecto: https://github.com/Audio8-AI/Audio8_TTS
- Directorio de runtime 0.1B INT8 ONNX: https://github.com/Audio8-AI/Audio8_TTS/tree/master/onnx_runtime_0_1b_int8
- Demo en vivo: https://audio8-ai.github.io/Audio8_TTS/0.1B/
- Licencia del modelo: https://huggingface.co/Edge0/audio8-TTS-0.1B-ONNX-INT8/blob/main/LICENSE
- Conversión comunitaria de referencia: https://huggingface.co/Masterx/Audio8-TTS-Preview-0.1B-ONNX-INT8
- ONNX Runtime: https://onnxruntime.ai/
- Fish Audio S2 Pro (arquitectura de referencia): https://github.com/fishaudio/fish-speech
