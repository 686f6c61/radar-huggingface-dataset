# Sky-Kim/com.sky.sentis.audio2face

## Resumen

Sentis Audio2Face-3D (`com.sky.sentis.audio2face`) es un paquete de Unity para animación facial en tiempo real a partir de audio, ejecutado íntegramente en el dispositivo mediante Unity Sentis (`com.unity.ai.inference` 2.6.1). Se trata de un port no oficial de NVIDIA Audio2Face-3D v3.0, una red de difusión que predice movimiento facial a partir del habla, y que el paquete transforma en 52 pesos de blendshapes ARKit a 60 fps. El autor es Sky-Kim y el modelo base es `nvidia/Audio2Face-3D-v3.0`.

La relevancia de este paquete radica en que elimina la dependencia del SDK oficial de Audio2Face, CUDA, TensorRT y Python: la red se ejecuta dentro de Unity, bien en GPUCompute o en CPU, y el procesamiento de ventanas, el post-proceso de piel y la resolución de blendshapes ARKit del SDK se han reimplementado en C#. Esto permite integrar lipsync de alta calidad en aplicaciones Unity (videojuegos, avatares, MetaHuman) sin infraestructura de servidor ni aceleradores NVIDIA dedicados.

El paquete incluye el modelo en formato ONNX con pesos fp32 (730 MB), una API de generación por clip completo y una API de streaming pensada para micrófono o fragmentos de TTS, además de ejemplos de micrófono en vivo y de rig MetaHuman URP. El modelo no está afiliado ni respaldado por NVIDIA, y su uso queda sujeto a la NVIDIA Open Model License para los archivos del modelo y a licencia MIT para el código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de difusión (según model card: "diffusion network") con estado recurrente GRU; inferencia vía Unity Sentis |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de audio de 1 s (16.000 muestras a 16 kHz); ventanas cada 0,5 s en streaming |
| Tipos de cuantizacion | fp32 (ONNX original, 730 MB) y Float16 (`.sentis` generado en build) |
| Idiomas soportados | no disponible (el modelo opera sobre audio, no sobre texto) |
| Licencia | MIT (código) + NVIDIA Open Model License (modelo); licencia compuesta `mit-and-nvidia-open-model-license` |
| Formato de pesos | ONNX (fp32) y `.sentis` (fp32 o Float16) |
| Tamano del repositorio | 0,7 GB |
| Entrada de red | `window [1, 16000]`, `identity [1, 3]`, `emotion [1, 30, 10]`, `input_latents [2, 2, 1, 256]`, `noise [1, 3, 60, 88831]` |
| Salida de red | `prediction [1, 60, 88831]` (deltas por frame respecto a la pose neutra) y `output_latents` |
| Salida final | 52 pesos de blendshapes ARKit a 60 fps |
| Identidades disponibles | Claire, James, Mark |
| Requisitos de entorno | Unity 6 (probado en 6000.6.6f1), `com.unity.ai.inference` 2.6.1, git-lfs |

## Arquitectura y entrenamiento

El modelo subyacente es NVIDIA Audio2Face-3D v3.0, descrito en la model card como una red de difusión que predice movimiento facial a partir del habla. La red consume una ventana de 1 segundo de audio mono a 16 kHz, un vector de identidad de 3 valores, un vector de emoción de 30x10 y un estado latente recurrente (`input_latents`, con forma `[2, 2, 1, 256]`), y produce una predicción de 60 frames x 88.831 valores que representan deltas respecto a la pose neutra para piel (72.006 valores), lengua, mandíbula y ojos. El ruido de difusión (`noise [1, 3, 60, 88831]`) se muestrea en el propio dispositivo.

El paquete no reentrena el modelo: es un finetune/port del checkpoint de NVIDIA, y la innovación técnica está en la reimplementación del pipeline de inferencia y post-proceso en C#. El streaming usa las ventanas del SDK (ventanas de 1 s cada 0,5 s, conservando los 30 frames centrales de los 60 predichos) y arrastra el estado GRU entre ventanas. El solver de blendshapes ARKit-52 es un port del skin animator del SDK (doble EMA de dos polos, máscara de cara inferior/superior) con regularización L1/L2, temporal y de simetría, restricción de caja [0,1] y resolución exacta mediante método de conjunto activo. La proyección sobre las poses de la identidad se hace en el dispositivo, de modo que solo se leen 30x78 floats por ventana.

No se dispone de información sobre el número de tokens, la composición del dataset de entrenamiento ni si hubo RLHF o DPO en el modelo original; la model card del port no los detalla.

## Capacidades

- Generación de animación facial a partir de audio: convierte voz en 52 pesos de blendshapes ARKit a 60 fps.
- Streaming en tiempo real: API `A2FStream` para micrófono o fragmentos de TTS, con `Push`, `PumpAsync` y `TryDequeue`.
- Generación por clip completo: `A2FGenerator.GenerateAsync` devuelve una matriz de frames con los pesos por frame.
- Control de identidad: tres identidades predefinidas (Claire, James, Mark) mediante `A2FOptions.identity`.
- Control de emoción: vector opcional de 10 valores para modular la expresión.
- Control de semilla de ruido: parámetro de seed para reproducibilidad del muestreo de difusión.
- Reproducción sobre blendshapes: `A2FBlendshapePlayer` conduce cualquier `SkinnedMeshRenderer` cuyos nombres de blendshape terminen en los nombres ARKit (`jawOpen`, `ARKit_jawOpen`, `blendShape1.JawOpen`, etc.).
- Conversión a orden Apple Live Link Face: `A2FConstants.ToLiveLinkOrder`, compatible con el orden que usa NeuroSync.
- Integración con MetaHuman: el ejemplo MetaHuman URP mapea las curvas ARKit a los controles `CTRL_expressions` del rig DNA.
- Remuestreo de audio: `A2FResampler` convierte otras frecuencias de muestreo a 16 kHz mono.
- Ejecución en dispositivo: backend GPUCompute o CPU, sin CUDA, TensorRT ni Python.
- No se documentan capacidades de tool calling, agentes, razonamiento, código, matemáticas, visión ni audio-texto.

## Casos de uso

- Lipsync en tiempo real para avatares de videojuego: el paquete permite conectar la salida de voz del jugador o de un NPC a `A2FStream` y aplicar los 52 pesos ARKit a un `SkinnedMeshRenderer` a 60 fps, sin servidor ni GPU NVIDIA dedicada, lo que encaja en juegos Unity multiplataforma.
- Avatares MetaHuman en produccion audiovisual: el ejemplo MetaHuman URP mapea las curvas ARKit a los controles `CTRL_expressions` del rig DNA, de modo que se puede animar un MetaHuman desde una locución pregrabada o desde micrófono en el editor de Unity.
- Asistentes conversacionales con cara: integración con pipelines de TTS por fragmentos; la API de streaming acepta chunks de audio de cualquier tamaño y emite frames a medida que se completan ventanas, lo que permite animar la cara mientras el TTS aún está generando voz.
- Doblaje y localización de contenido: `A2FGenerator.GenerateAsync` procesa un clip completo y devuelve la secuencia de pesos por frame, adecuada para generar animación offline de un vídeo doblado y aplicarla en postproducción.
- VTubing y captura facial de bajo coste: con el ejemplo de micrófono en vivo, un creador puede animar un avatar ARKit desde su voz sin hardware de captura facial dedicado, ejecutando la inferencia en la GPU del equipo.
- Prototipado rápido de personajes en Unity: al no requerir el SDK de NVIDIA ni Python, el paquete se instala como dependencia Git en `Packages/manifest.json` y carga el modelo directamente desde la carpeta `Models` en el editor, lo que acelera la iteración de diseño de personajes.
- Aplicaciones educativas o de accesibilidad: animación facial de un agente virtual que lee texto en voz alta, con control de emoción para modular la expresividad según el contenido.

## Benchmarks y rendimiento

La model card reporta verificaciones de corrección numérica y velocidad medidas con Unity 6000.6.6f1 y Sentis 2.6.1 en Apple M5 Max (Metal). La suite de verificación de 19 comprobaciones (`Tools~/Unity/A2FVerify.cs`) pasó en tres ejecuciones consecutivas. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no es un modelo de lenguaje.

| Comprobacion | Resultado |
|---|---|
| Sentis vs onnxruntime sobre `network.onnx` original de NVIDIA, CPU | error relativo de predicción 4,1e-7 |
| Sentis vs onnxruntime sobre `network.onnx` original de NVIDIA, GPUCompute | error relativo de predicción 4,1e-7 |
| ONNX convertido vs original, onnxruntime (3 semillas + stream de 5 ventanas con latentes realimentados) | error relativo 2,1e-7 |
| Proyección en dispositivo vs orden por vértice del SDK | diferencia máxima de peso 6 (dato truncado en la model card) |

No se dispone de cifras de latencia o throughput (fps reales, ms por ventana) más allá de la tasa nominal de 60 fps de salida de blendshapes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el modelo ONNX fp32 ocupa 730 MB, por lo que el peso de los pesos ronda esa cifra y el consumo total dependerá del backend y de los buffers intermedios (la salida `prediction` es de 60x88.831 floats por ventana).
- GPU recomendadas: no se especifican modelos concretos; la verificación se hizo en Apple M5 Max con Metal. Al ejecutarse sobre Unity Sentis con backend GPUCompute o CPU, no requiere CUDA ni TensorRT.
- Compatibilidad con GPU de consumo: no se documenta una lista de GPU concretas; al no depender de CUDA, el paquete puede ejecutarse en GPU compatibles con el backend GPUCompute de Unity Sentis y en CPU.
- Opciones de despliegue: Unity 6 con `com.unity.ai.inference` 2.6.1; instalación como paquete Git desde Hugging Face (requiere git-lfs). En build de reproductor, un hook escribe un `.sentis` Float16 en `StreamingAssets/Audio2Face/` y lo elimina tras el build. Se puede sustituir por un `audio2face3d_v3.sentis` propio en esa carpeta.
- Latencia y throughput: no disponibles; la salida es de 60 fps de blendshapes y el streaming procesa ventanas de 1 s cada 0,5 s, conservando 30 de los 60 frames predichos.

## Comparativa con modelos similares

| Modelo | Tipo | Enfoque de despliegue | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sky-Kim/com.sky.sentis.audio2face | Port de Audio2Face-3D v3.0 a Unity Sentis | En dispositivo, Unity (GPUCompute/CPU) | 52 blendshapes ARKit a 60 fps | MIT + NVIDIA Open Model License | Hugging Face (paquete Git) |
| nvidia/Audio2Face-3D-v3.0 | Modelo original de NVIDIA | SDK de NVIDIA, requiere CUDA/TensorRT/Python | Movimiento facial (via SDK) | NVIDIA Open Model License | Hugging Face |
| NeuroSync | Solución de lipsync (referenciada por el autor) | No disponible | Orden Apple Live Link Face | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Es un port no oficial: no está afiliado ni respaldado por NVIDIA.
- Licencia compuesta: el código es MIT, pero los archivos del modelo son un Derivative Model bajo la NVIDIA Open Model License; es obligatorio conservar `Models/NOTICE.txt` y `Models/NVIDIA-Open-Model-License.txt`. Hay que revisar los términos de la NVIDIA Open Model License antes de un uso comercial.
- Solo hay tres identidades (Claire, James, Mark); no se documenta la posibilidad de añadir identidades nuevas.
- El modelo opera sobre audio, no sobre texto: no hay capacidades de razonamiento, código, matemáticas ni tool calling, y no se documentan idiomas soportados.
- La ventana de audio es de 1 s con solapamiento de 0,5 s; la latencia del streaming depende de completar ventanas, y el final de una locución requiere un `PumpAsync` de flush para vaciar la cola.
- La model card muestra un dato de verificación truncado ("max weight diff 6"), por lo que no se puede confirmar la tolerancia exacta de la proyección frente al SDK.
- Requiere Unity 6 y `com.unity.ai.inference` 2.6.1, además de git-lfs para resolver el paquete; el ejemplo MetaHuman solo compila si está instalado `metahuman-urp`.
- No se han publicado cifras de latencia ni de consumo de VRAM por backend, lo que dificulta el dimensionado previo en producción.
- Riesgo de artefactos en la animación si el audio de entrada no es voz limpia a 16 kHz mono; el remuestreador mitiga el problema de frecuencia, pero no se documenta robustez frente a ruido.

## Enlaces

- Hugging Face: https://huggingface.co/Sky-Kim/com.sky.sentis.audio2face
- Modelo base: https://huggingface.co/nvidia/Audio2Face-3D-v3.0
- git-lfs: https://git-lfs.com
- Licencia del modelo (referenciada en el repo): `LICENSE.md`, `Models/NVIDIA-Open-Model-License.txt`
- Unity Sentis / `com.unity.ai.inference`: no disponible en la información proporcionada
