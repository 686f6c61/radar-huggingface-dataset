# rhenretta/ai-visualizer

## Resumen

AI Music Visualizer es un modelo neuronal recurrente compacto desarrollado por rhenretta que sintetiza fotogramas RGB de 1280×720 directamente a partir de audio en vivo a 48 kHz y de indicaciones de estilo en lenguaje natural (forma, movimiento y color). Con solo 972.895 parámetros y unos pesos FP16 de 1,95 MB, el modelo genera vídeo a 92,7 FPS (10,79 ms por fotograma) sin necesidad de shaders de posprocesado en GPU, lo que lo convierte en una alternativa muy ligera a los pipelines tradicionales de visualización musical basados en shaders.

El modelo se distribuye como paquete CoreML (`VisualizerStep.mlpackage`, 5,5 MB) y como checkpoint de PyTorch (`best_model.pt`, 11,2 MB), junto con un acondicionador de texto (`TextConditioner.mlpackage`, 45 MB) basado en `all-MiniLM-L6-v2` congelado y tres cabezas de proyección con attention-pooling. Está pensado para ejecutarse en Apple Silicon mediante CoreML con unidades de cómputo CPU y GPU, y se acompaña de una aplicación nativa para macOS (Swift 6 + Metal + CoreAudio) que incluye un editor conversacional basado en `llama.cpp`.

Su relevancia actual radica en que demuestra que una red recurrente de menos de un millón de parámetros puede producir visualizaciones musicales coherentes y de alta resolución en tiempo real, con transiciones suaves mediante SLERP y sin dependencia de shaders de posprocesado, lo que simplifica el despliegue en dispositivos de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal recurrente con ConvGRU de 12 canales a 160×90, integradores de fase y 6 primitivas visuales diferenciables, con etapas PixelShuffle de upsampling |
| Parametros totales | 972.895 (modelo de visualización); el acondicionador de texto usa `all-MiniLM-L6-v2` congelado más cabezas de proyección |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 480 fotogramas causales (8,0 s) apilados en pirámide de 3 niveles `[1, 78, 72]` |
| Tipos de cuantizacion | FP16 (pesos y paquete CoreML); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (las indicaciones de estilo son en inglés según la model card) |
| Licencia | MIT |
| Formato de pesos | CoreML `.mlpackage` (FP16), checkpoint PyTorch `.pt`, JSON de contrato de audio, filterbank y ventana en float32 |

## Arquitectura y entrenamiento

El modelo se compone de dos etapas. La primera es un front-end acústico que convierte audio de 48 kHz en un espectro logarítmico de 64 bins entre 35 Hz y 10.000 Hz (8 bins por octava, N_FFT = 4096, hop = 800) con compensación de ruido rosa de +4,3 dB/octava y ventana decibélica causal de 44 dB, al que se añaden 8 características de onset y beat (sub-bajo, flujo de bombo, energía media, transitorio de hi-hat, centroide espectral, RMS y fase de beat en seno/coseno). Estas características se apilan en 480 fotogramas causales (8,0 s) formando una pirámide de tres niveles: T1 de 0 a 1 s a 60 Hz, T2 de 1 a 4 s a 4 Hz y T3 de 4 a 8 s a 1,5 Hz.

La segunda etapa es la red generadora `VisualizerStep`, que mantiene integradores de fase rotacional y de onda hacia el exterior en los canales 0..3 del estado oculto previo, condicionados estrictamente por `(audio_emb, z_motion)` para evitar fugas de forma y color, junto con un estado ConvGRU de 12 canales a resolución 160×90. Este estado gobierna seis primitivas visuales diferenciables (barras FFT lineales con peak-hold, anillo FFT radial, emisor de ondas espirales con shockwaves causales de 32 taps y 2,0 s, cintas de osciloscopio, rejilla de túnel en perspectiva y spirograph mandala) y se reescala mediante etapas PixelShuffle aprendidas hasta `[1, 3, 720, 1280]`. Las transiciones en vivo se realizan mediante SLERP con compuerta estructural de envolvente de estela y atenuación causal del horizonte de transición. No se detallan en la información disponible el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de vídeo RGB de 1280×720 a partir de audio en vivo, con síntesis directa de fotogramas sin shaders de posprocesado.
- Acondicionamiento por indicaciones de estilo en lenguaje natural desacopladas en tres ejes: forma (`z_shape`), movimiento (`z_motion`) y color (`z_color`).
- Análisis musical en tiempo real con 64 bins logarítmicos, 8 características de onset/beat y pirámide temporal causal de 8 segundos.
- Seis arquetipos visuales diferenciables (barras FFT, anillo radial, ondas espirales, osciloscopio, túnel en perspectiva y mandala).
- Transiciones suaves entre estilos mediante SLERP con supresión de fantasmas.
- Ejecución en Apple Silicon mediante CoreML con `CPU_AND_GPU`.
- Integración con un editor conversacional basado en `llama.cpp` en la aplicación macOS incluida.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión, audio generativo ni otras tareas de lenguaje.

## Casos de uso

- Visualización musical en directo para DJ y VJ: el modelo procesa audio de 48 kHz en tiempo real y genera fotogramas de 1280×720 a 92,7 FPS, adecuado para proyección en eventos con hardware Apple Silicon.
- Aplicaciones de escritorio para macOS: la app `AIVisualizer.app` integra CoreML FP16, Metal y captura global de altavoz vía CoreAudio, por lo que se puede usar como visualizador de sistema sin configuración adicional.
- Creación de contenido para streaming: permite generar visuales reactivos al audio de la emisión con estilos controlados por prompts, reduciendo la dependencia de shaders personalizados.
- Instalaciones artísticas interactivas: la latencia de 10,79 ms por fotograma y el estado recurrente de 8 segundos permiten respuestas visuales coherentes a la música en entornos expositivos.
- Prototipado de visualizadores personalizados: el checkpoint de PyTorch y el contrato de audio (`audio_contract.json`) permiten reentrenar o ajustar las cabezas de estilo sin rehacer el front-end acústico.
- Investigación en generación condicionada por audio: el modelo sirve como banco de pruebas ligero para estudiar condicionamiento desacoplado (forma, movimiento, color) y transiciones latentes en redes recurrentes.
- Educación y demostraciones de CoreML: el reducido tamaño (1,95 MB en FP16) y el informe de paridad PyTorch-CoreML (MAE = 0,000275) lo hacen útil para mostrar flujos de exportación y validación en Apple Silicon.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Latencia por fotograma | 10,79 ms |
| Rendimiento | 92,7 FPS |
| Resolución de salida | 1280×720 RGB |
| Paridad PyTorch-CoreML (MAE) | 0,000275 |
| Parametros | 972.895 |
| Pesos FP16 | 1,95 MB |
| Tamano del paquete CoreML | 5,5 MB |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que el modelo no realiza tareas de lenguaje.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el tamaño reducido del modelo (1,95 MB en FP16 y 5,5 MB el paquete CoreML) sugiere un consumo de memoria muy bajo, aunque no se documenta la cifra exacta.
- GPU recomendadas: Apple Silicon con soporte CoreML (CPU y GPU); la model card no especifica modelos concretos de GPU NVIDIA ni AMD.
- Cabe en GPU de consumo: sí, por el reducido tamaño del modelo, aunque la información disponible solo confirma ejecución en Apple Silicon mediante CoreML.
- Opciones de despliegue: CoreML (`coremltools`) en macOS, checkpoint de PyTorch (`best_model.pt`) para inferencia o reentrenamiento, y la aplicación nativa `AIVisualizer.app` (Swift 6 + Metal + CoreAudio + `llama.cpp`).
- Latencia y throughput: 10,79 ms por fotograma y 92,7 FPS según el informe de exportación incluido.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Las alternativas habituales en visualización musical (shaders GLSL, pipelines con Stable Diffusion o modelos de vídeo generativo) no se detallan en la model card, por lo que no es posible establecer una comparación con datos verificables.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AI Music Visualizer (este modelo) | 972.895 | 480 fotogramas (8,0 s) | 92,7 FPS a 1280×720 | MIT | Hugging Face y GitHub |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para visualización musical; no realiza tareas de lenguaje, razonamiento, código ni matemáticas.
- Las indicaciones de estilo se documentan en inglés (`shape`, `motion`, `color`); no se confirma soporte multilingüe.
- La licencia MIT permite uso comercial, pero la model card no detalla restricciones adicionales sobre los datos de entrenamiento ni sobre el uso de los pesos.
- El rendimiento de 92,7 FPS se ha medido en el entorno de exportación documentado (Apple Silicon con CoreML); no se garantiza en otras plataformas.
- No se documentan sesgos conocidos, tasas de alucinación ni limitaciones idiomáticas más allá de lo indicado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria publicada.
- La fecha de creación indicada (2026-11-10) es futura respecto a la información disponible, lo que conviene verificar antes de su uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/rhenretta/ai-visualizer
- Repositorio GitHub: https://github.com/rhenretta/ai-visualizer
- Aplicación macOS `AIVisualizer.app`: incluida en el repositorio GitHub
