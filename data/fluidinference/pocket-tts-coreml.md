# FluidInference/pocket-tts-coreml

## Resumen

PocketTTS CoreML es una conversión a Core ML del modelo de síntesis de voz `kyutai/pocket-tts`, publicada por FluidInference para inferencia on-device en plataformas Apple (iOS, macOS, y chips de la serie M con Neural Engine). El objetivo es ofrecer TTS de baja latencia completamente local, sin depender de servicios en la nube, aprovechando el motor neuronal de Apple y el framework FluidAudio del propio autor. El repositorio agrupa varias familias de pesos: el modelo inglés de 100 M parámetros, seis modelos pequeños (18M, 7M y 2M, con sus variantes afinadas por reward) y el pack Phonon 31m de Gradium.

La arquitectura subyacente es la receta Pocket TTS de Kyutai: un transformer autorregresivo (FlowLM) que genera frames acústicos mediante flow matching con un decodificador de 8 pasos Euler por frame, acoplado al códec neuronal Mimi para la síntesis de audio en streaming (1920 muestras por frame). La conversión descompone el pipeline en módulos Core ML separados (`cond_step`, `flowlm_step`, `flow_decoder`, `mimi_decoder`) y, en las versiones más recientes, en paquetes con estado (`MLState`) que permiten ejecutar pasos completos en el Neural Engine.

Es relevante porque demuestra que un pipeline TTS moderno (flow matching más códec neuronal) puede ejecutarse en tiempo real en hardware de consumo Apple: el pack de 100 M alcanza un WER de 0,75 % sobre 100 frases en pruebas de FluidAudio, y los modelos pequeños llegan a 24x–51x tiempo real en un M5 Pro. La licencia es CC-BY-4.0, heredada del modelo base, salvo el subdirectorio Phonon, que es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo (FlowLM) con flow matching y codec neuronal Mimi; variantes pequeñas con grouped-query attention, `z_proj`, tabla de texto de bajo rango y cabezas flow de un paso |
| Parametros totales | 100M (pack inglés principal); variantes de 18M, 7M y 2M; Phonon 31M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (segmentación recomendada de texto en trozos de ≤ 50 tokens por frase) |
| Tipos de cuantizacion | fp16 e int8 (pasos FlowLM); fp32 en decodificador Mimi y ruta de referencia; fp16 en `generate_decode` |
| Idiomas soportados | inglés (en); Phonon incluye voces de catálogo en francés, alemán, español y portugués, pero el modelo solo habla inglés |
| Licencia | CC-BY-4.0 (el subdirectorio `phonon/phonon-31m-en/` es Apache-2.0) |
| Formato de pesos | `.mlmodelc` (Core ML), `.safetensors` para snapshots de voces, JSON de configuración (`arch.json`, `pocket_state.json`, `manifest.json`) |
| Tamano del repositorio | 50,2 GB |
| Libreria | coreml |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El pipeline se compone de cuatro etapas en el pack de 100M: `cond_step` (prefill de la caché KV con condicionamiento de voz y texto, ~200 MB), `flowlm_step` (generación autorregresiva del transformer y detección de EOS, ~200 MB), `flow_decoder` (denoiser de flow matching con 8 pasos Euler por frame, ~190 MB) y `mimi_decoder` (códec de audio en streaming, 1920 muestras por frame, ~11 MB). En los packs `v4` de modelos pequeños la topología cambia: atención con grouped-query, proyección `z_proj`, tabla de texto de bajo rango, cabezas flow de un solo paso y un decodificador Mimi separado de 128 dimensiones. El pack Phonon introduce diferencias propias (GELU con erf, bias sumado en la entrada del condicionador, ventana Mimi de 251, umbral EOS +4,0 y fade de onset de 25 ms).

Los pesos proceden de `kyutai/pocket-tts` y de los checkpoints de Gradium; no se documenta en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO, más allá de la mención a variantes "reward-fine-tuned" (`*_refl_2026-10`) para los modelos pequeños. La innovación técnica de esta conversión es la ejecución con `MLState` en el Neural Engine (paquete `pocket_state`), la fusión del decodificador flow de 8 pasos y la ruta `generate_decode` que combina paso, cabeza y Mimi fp16 en un solo dispatch. También se documenta que la precisión fp16 en el SEANet del decodificador introduce un suelo de ruido blanco en torno a −72 dBFS, audible como siseo en pausas, por lo que se recomienda el decodificador Mimi fp32 en CPU.

## Capacidades

- Síntesis de voz texto-a-audio en inglés con 4 voces precodificadas (`alba`, `azelma`, `cosette`, `javert`) y 27 voces en el pack inglés de 100M.
- Clonación de voz mediante los codificadores Mimi incluidos (`cloneVoice()` en FluidAudio o `--clone-voice speaker.wav` en la CLI).
- Generación en streaming: el decodificador Mimi emite 1920 muestras por frame, lo que permite reproducir audio conforme se genera.
- Lectura correcta de números y años al final de frase en el pack `english_2026-10`.
- Control de temperatura de muestreo (valor por defecto 0,3 en la configuración de Kyutai para el pack inglés).
- Ejecución on-device sin red, con estado persistente entre frames mediante `MLState`.
- Soporte de múltiples backends en FluidAudio: `pocket` (100M), `pocket-small` (modelos de 18M/7M/2M) y `phonon31m`.
- No se documenta soporte de tool calling, agentes, visión, audio de entrada ni razonamiento multi-paso; es un modelo exclusivamente TTS.

## Casos de uso

- Lectura por voz de notificaciones y accesibilidad en apps iOS y macOS: el modelo corre íntegramente en el dispositivo con el Neural Engine, sin enviar texto a servidores, lo que encaja con requisitos de privacidad y con el modo avión.
- Asistentes conversacionales locales: la latencia de unos 20 ms hasta el primer audio en el pack Phonon y la generación en streaming permiten respuestas habladas casi inmediatas en diálogos por turnos.
- Audiolibros y podcasts generados: el pack de 100M con 27 voces y la clonación permiten narrar textos largos con voces consistentes, troceando el texto en frases de ≤ 50 tokens para evitar fallos de EOS.
- Prototipado rápido en Swift: la API `PocketTtsManager.synthesize(text:)` de FluidAudio permite integrar TTS en una app en pocas líneas y probar distintos packs (`english`, `english2026Apr`, `phonon31m`).
- Sistemas embebidos y vehículos con hardware Apple: los modelos de 2M y 7M (58–86 MB de RSS, 51x y 30x tiempo real en M5 Pro) caben en dispositivos con memoria muy limitada para avisos cortos.
- Evaluación comparativa de códecs y decodificadores: la separación en módulos (`flowlm_step`, `flow_decoder`, `mimi_decoder`) y la ruta de referencia fp32 (~1e-6 frente a PyTorch) facilitan experimentos de precisión y de latencia sin reentrenar.
- Doblaje y localización de contenido en inglés: la clonación de voz y las voces de catálogo de Phonon permiten generar pistas de voz para vídeos y demos con una única ejecución local.

## Benchmarks y rendimiento

| Metrica | Resultado | Contexto |
|---|---|---|
| WER (Parakeet, 100 frases MiniMax en inglés) | 0,75 % | M5 Pro, FluidAudio, voz `alba`, pack `english_2026-10` |
| WER referencia PyTorch | 0,86 % | Mismo conjunto de frases |
| WER pack de abril | 0,80 % | `v2.1/english/` (Kyutai `english_2026-04`) |
| Velocidad 18m | 24x tiempo real (34x ruta fp16 fusionada) | M5 Pro, CLI FluidAudio, pasaje de 15 s, 109 MB RSS |
| Velocidad 7m | 30x tiempo real (42x ruta fp16 fusionada) | M5 Pro, 86 MB RSS |
| Velocidad 2m | 51x tiempo real (52x ruta fp16 fusionada) | M5 Pro, 58 MB RSS |
| Latencia por frame 18m | 2,9 ms (`generate_decode` todo ANE) frente a 4,4 ms (ruta recomendada) | Frame de 80 ms |
| Latencia hasta primer audio (Phonon 31m) | ~20 ms | M5 Pro, Neural Engine |
| Velocidad Phonon 31m | ~20x tiempo real | M5 Pro |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, al tratarse de un modelo TTS.

## Requisitos de hardware

- Inferencia sobre Core ML: requiere iOS 18 / macOS 15 para el paquete `MLState` con Neural Engine; la ruta de referencia fp32 funciona desde iOS 17 en CPU/GPU.
- VRAM/memoria: los packs pequeños ocupan 58–109 MB de RSS en ejecución; el pack de 100M y el de Phonon son mayores (tamaños de módulo de ~200 MB por componente), aunque no se detalla el consumo total en memoria.
- GPU/SoC recomendados: chips Apple con Neural Engine (serie M, en las pruebas un M5 Pro); no se documenta soporte para GPU NVIDIA, AMD ni otros aceleradores.
- Cabe en hardware de consumo Apple: sí, en equipos con Neural Engine y en iPhone/iPad compatibles con iOS 18; no aplica a GPU de consumo tipo RTX.
- Opciones de despliegue: framework FluidAudio (Swift), CLI `fluidaudiocli` con `--backend pocket`, `--backend pocket-small` o el pack Phonon; los `.mlmodelc` pueden cargarse directamente con Core ML.
- Latencia y throughput: 24x–51x tiempo real en modelos pequeños y ~20x en Phonon 31m sobre M5 Pro; ~20 ms hasta el primer audio en Phonon.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Despliegue | Notas |
|---|---|---|---|---|---|
| PocketTTS CoreML (este) | 100M / 18M / 7M / 2M / 31M | inglés | CC-BY-4.0 (Phonon Apache-2.0) | Core ML, on-device Apple | Optimizado para Neural Engine; clonación de voz en el pack de 100M |
| kyutai/pocket-tts | no disponible | inglés | no disponible en la información | PyTorch | Modelo base del que derivan estos pesos; referencia de calidad (WER 0,86 %) |
| gradium/phonon-31m-en | 31M | inglés (voces multilingües) | Apache-2.0 | PyTorch (`ptts`) y Core ML | Misma receta Pocket TTS; ~20 ms hasta el primer audio |
| Otros TTS on-device (p. ej. Piper, Kokoro) | no disponible | varios | no disponible | ONNX, CPU | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Solo sintetiza inglés; las voces de catálogo en francés, alemán, español y portugués de Phonon no implican capacidad multilingüe del modelo.
- El texto debe trocearse en frases de ≤ 50 tokens (`MAX_TOKEN_PER_CHUNK`); con párrafos completos varias voces no emiten EOS, también en la implementación PyTorch.
- La ruta `generate_decode` todo en Neural Engine es más rápida pero añade un suelo de ruido blanco a ~−72 dBFS por el redondeo fp16 del SEANet, audible como siseo en pausas; se recomienda el decodificador Mimi fp32 en CPU.
- La clonación de voz en los modelos pequeños aún no está conectada; solo el pack de 100M la soporta plenamente.
- Riesgo de alucinación acústica y de artefactos en textos largos o con caracteres no ingleses; no se documentan evaluaciones de sesgo.
- La licencia CC-BY-4.0 exige atribución en usos comerciales; el subdirectorio Phonon tiene licencia Apache-2.0 distinta, que debe respetarse por separado.
- Dependencia del ecosistema Apple (Core ML, Neural Engine, iOS 18/macOS 15): no es portable a otras plataformas sin reconversión.
- El repositorio ocupa 50,2 GB, lo que complica su descarga y almacenamiento en entornos con espacio limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FluidInference/pocket-tts-coreml
- Modelo base: https://huggingface.co/kyutai/pocket-tts
- Modelo Phonon 31m: https://huggingface.co/gradium/phonon-31m-en
- Framework FluidAudio: https://github.com/FluidInference/FluidAudio
- Hilo del PR de conversión (FluidAudio #1051): https://github.com/FluidInference/FluidAudio/pull/1051
- Paper referenciado en los tags (arXiv:2410.00037): https://arxiv.org/abs/2410.00037
