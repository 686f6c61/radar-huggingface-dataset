# Sky-Kim/com.sky.sentis.neurosync

## Resumen

Sentis NeuroSync (`com.sky.sentis.neurosync`) es un paquete de Unity que porta el modelo AnimaVR NeuroSync de audio a blendshapes faciales para su ejecución en dispositivo mediante Unity Sentis (`com.unity.ai.inference` 2.6.1). El modelo original transforma características acústicas (MFCC y autocorrelación) en 61 canales ARKit/Live Link más 7 canales de emoción a 60 fotogramas por segundo, y este paquete elimina la necesidad de un servidor Python reimplementando en C# tanto el troceado como el postprocesado del pipeline de referencia.

La arquitectura subyacente es un transformer seq2seq con dos grafos ONNX: un extractor de características de 19,5 MB y un decodificador de 942 MB en fp32. El repositorio ocupa 1,0 GB e incluye los scripts de exportación desde `model.pth`, utilidades de audio (downmix a mono, remuestreo Kaiser a 88,2 kHz y normalización de pico) y un reproductor de blendshapes que mapea los canales ARKit a los blendshapes de una malla.

Es relevante para desarrolladores de videojuegos y aplicaciones de avatares en tiempo real porque permite lipsync de alta calidad sin conexión de red ni infraestructura de servidor, con requisitos de Unity 6 y soporte de backend GPUCompute. La licencia es dual: gratuita bajo términos MIT para individuos y empresas con ingresos inferiores a 1 millón de dólares anuales, y comercial para organizaciones que superen ese umbral.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer seq2seq (extractor de características + decodificador) exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio en trozos de 128 fotogramas con crossfade de 32) |
| Tipos de cuantizacion | fp32 empaquetado; opción de decodificador Float16 vía serializador |
| Idiomas soportados | no disponible (el demo incluye clips en EN, DE, JA y KO) |
| Licencia | neurosync-dual-license (MIT para ingresos < 1 M USD/año; comercial por encima) |
| Formato de pesos | ONNX (`.onnx` empaquetado, `.sentis` en StreamingAssets) |
| Pipeline | audio-to-audio |
| Entrada del extractor | `input_audio [1, n]` mono a 88,2 kHz, pico 1, n ≥ 5880 |
| Salida del extractor | `audio_features [ceil((1 + n/735) / 2), 256]` |
| Entrada del decodificador | `input [1, 128, 256]` |
| Salida del decodificador | `output [1, 128, 68]` (61 ARKit/Live Link + 7 emociones) |
| Frecuencia de salida | 60 fps |
| Requisitos de runtime | Unity 6 (probado en 6000.3.23f1), `com.unity.ai.inference` 2.6.1, git-lfs |
| Tamano del repo | 1,0 GB |

## Arquitectura y entrenamiento

El modelo es un transformer seq2seq que opera en dos etapas. La primera es un extractor de características acústicas que reproduce paso a paso el `extract_features.py` de referencia basado en librosa 0.11: STFT con ventana Hann periódica y relleno de ceros, espectro de potencia, 128 mels Slaney, `power_to_db` con `top_db=80`, DCT ortonormal (c0..c22), CMVN, deltas Savitzky-Golay de 9 taps y autocorrelación lineal con media. La segunda etapa es un decodificador transformer que consume ventanas de 128 fotogramas de 256 dimensiones y emite 68 canales por fotograma.

El paquete reimplementa en C# el troceado del servidor original: el extractor se ejecuta una vez por clip y el decodificador procesa bloques de 128 fotogramas con un crossfade de 32 fotogramas entre bloques consecutivos. El postprocesado (`NeuroSyncPostProcess.cs`) es un port de `process_audio_features`: divide por 100 los canales 0–60, aplica un ease-in de 0,1 s y anula las columnas de ojos, lengua y rotaciones de cabeza. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de animación facial dirigida por audio: predice 61 canales ARKit/Live Link y 7 canales de emoción a 60 fps.
- Lipsync en tiempo real dentro de Unity, sin servidor Python ni conexión de red.
- Procesamiento de audio de cualquier `AudioClip` de Unity mediante downmix a mono, remuestreo a 88,2 kHz y normalización de pico.
- Soporte de audio en bruto PCM (salida de TTS o micrófono) mediante `AudioUtils.Prepare`.
- Ejecución en backend GPUCompute con warmup para compilación de shaders y reserva de memoria.
- Serialización de modelos a `.sentis` para builds de reproductor, con soporte de decodificador Float16.
- Carga de modelos personalizados desde `StreamingAssets/NeuroSync/` con precedencia sobre los empaquetados.
- Mapeo configurable de canales ARKit a blendshapes de malla, incluidos variantes `tongue_` y `teeth_`.
- Multiplataforma: carga vía `UnityWebRequest` en Android y WebGL.
- No se documentan capacidades de tool calling, agentes, razonamiento multilingüe general ni visión.

## Casos de uso

- Avatares de videojuegos en tiempo real: el paquete se integra en Unity 6 y reproduce blendshapes sincronizados con el reloj del `AudioSource`, lo que permite diálogos de NPC con lipsync sin infraestructura de servidor.
- Aplicaciones de VTuber y streaming: el modo de micrófono (`Record (Mic)` → `Stop & Lipsync`) captura audio en vivo y genera fotogramas de animación facial a 60 fps en la GPU del equipo.
- Personajes de realidad virtual y metaverso: la salida en orden Apple Live Link Face es compatible con pipelines de captura facial existentes y con mallas que usan blendshapes ARKit estándar.
- Integración con TTS en asistentes y chatbots: la entrada PCM en bruto permite encadenar la salida de un sintetizador de voz con el generador de blendshapes para animar un personaje conversacional.
- Prototipado rápido en el editor: el hook de build serializa los modelos a `StreamingAssets` automáticamente, de modo que el mismo flujo funciona en editor y en reproductor sin configuración manual.
- Localización de contenido con diálogos pregrabados: el demo incluye clips en inglés, alemán, japonés y coreano, lo que permite validar el comportamiento del modelo con distintos idiomas sin reentrenamiento.
- Aplicaciones móviles y web: la carga mediante `UnityWebRequest` en Android y WebGL facilita desplegar avatares animados en plataformas con recursos limitados usando el decodificador Float16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente indica que el grafo de características reproduce la referencia de librosa 0.11 paso a paso y que existe un script `verify_feature_extractor.py` para comparar la salida ONNX con dicha referencia, pero no se aportan métricas numéricas de error, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada: el decodificador fp32 ocupa 942 MB en disco; en GPU la huella es del mismo orden más las activaciones de las ventanas de 128×256. El extractor añade 19,5 MB.
- El decodificador Float16 reduce aproximadamente a la mitad el peso del grafo principal, según la opción de serialización documentada.
- GPU recomendadas: no se especifican modelos concretos; el paquete usa `BackendType.GPUCompute` de Unity Sentis, por lo que se apoya en el backend de cómputo disponible en la plataforma (DX12, Vulkan, Metal).
- Compatibilidad con GPU de consumo: no confirmada explícitamente en la información disponible; el tamaño del decodificador (942 MB fp32) es compatible con GPUs de consumo de gama media-alta, pero no se aportan cifras de VRAM ni latencia.
- Opciones de despliegue: Unity Sentis con backend GPUCompute o CPU; serialización a `.sentis` mediante **Tools ▸ NeuroSync ▸ Serialize Packaged Models…**; carga desde `StreamingAssets` en builds.
- Latencia y throughput: no disponibles. El diseño procesa bloques de 128 fotogramas (aproximadamente 2,13 s de animación a 60 fps) con crossfade de 32 fotogramas, y ofrece `Warmup()` para evitar picos en el primer uso.

## Comparativa con modelos similares

| Modelo | Tipo | Salida | Runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sentis NeuroSync (este) | Transformer seq2seq audio→blendshapes | 61 ARKit + 7 emociones a 60 fps | Unity Sentis (ONNX) | Dual (MIT < 1 M USD; comercial) | Hugging Face, paquete Unity |
| AnimaVR NeuroSync | Transformer seq2seq audio→blendshapes | 61 ARKit + 7 emociones a 60 fps | Python (servidor API) | no disponible | Hugging Face |
| Alternativas de lipsync en Unity | no disponible | no disponible | no disponible | no disponible | no disponible |

El modelo base directo es `AnimaVR/NEUROSYNC_Audio_To_Face_Blendshape`, del que este paquete es un port a Unity Sentis con el mismo esquema de salida. No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Licencia dual: el uso es gratuito bajo términos MIT solo para individuos y empresas con ingresos inferiores a 1 millón de dólares anuales; por encima de ese umbral se requiere licencia comercial de NeuroSync.
- El postprocesado de referencia anula los canales de parpadeo y mirada de ojos (0–4, 7–11), lengua (51) y rotaciones de cabeza (52–60), por lo que esas animaciones no se generan de forma útil.
- El mapeo de blendshapes asume los nombres de la malla de cabeza del sample; es necesario editar `meshNames` si el rig usa otra nomenclatura.
- Requiere Unity 6 y `com.unity.ai.inference` 2.6.1; no es compatible con versiones anteriores del motor ni con otros runtimes sin adaptación.
- Requiere git-lfs instalado antes de que Unity resuelva el paquete, lo que añade fricción al flujo de instalación.
- El demo adicional necesita URP, el Input System y uGUI.
- No se documentan sesgos, tasas de alucinación ni cobertura idiomática; la calidad del lipsync puede degradarse con audio ruidoso o con idiomas no representados en el entrenamiento original.
- El tamaño del repositorio (1,0 GB) y del decodificador (942 MB fp32) pueden ser problemáticos en plataformas con restricciones de tamaño de build.
- No hay datos publicados de latencia, throughput ni precisión numérica frente a la referencia, lo que dificulta estimar el rendimiento en producción.

## Enlaces

- Repositorio del paquete: https://huggingface.co/Sky-Kim/com.sky.sentis.neurosync
- Modelo base: https://huggingface.co/AnimaVR/NEUROSYNC_Audio_To_Face_Blendshape
- Modelo de referencia citado en los tags: https://huggingface.co/convaitech/NEUROSYNC
- Licencia: LICENSE.md dentro del repositorio
- Unity Sentis (`com.unity.ai.inference`): no disponible en la información proporcionada
- Git LFS: https://git-lfs.com
