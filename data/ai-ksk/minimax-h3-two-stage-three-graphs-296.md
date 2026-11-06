# AI-KSK/minimax-h3-two-stage-three-graphs-296

## Resumen

`AI-KSK/minimax-h3-two-stage-three-graphs-296` no es un modelo de pesos, sino un paquete de tres grafos de ComfyUI exportados para la familia MiniMax H3, publicados por el usuario AI-KSK. El repositorio contiene únicamente ficheros JSON de flujos de trabajo, tres imágenes de portada y un manifiesto SHA256; no incluye pesos del modelo, LoRA ni medios de entrada. Su relevancia es documental: muestra cómo se orquesta un pipeline de generación de vídeo con audio en dos pasadas (una primera pasada a baja resolución, un upscaler latente 3D aprendido y una segunda pasada de refinamiento a alta resolución) usando nodos personalizados en lugar de un `KSampler` estándar.

Los tres grafos cubren tres modos de la familia H3: FL2VA (texto, primer fotograma y último fotograma), repintado HD en dos etapas de un vídeo fuente y Ref2VA (generación multi-referencia). Todos comparten un mismo esqueleto de dos pasadas y referencian el mismo conjunto de cargadores: un text encoder Qwen3-VL de 32B cuantizado en NVFP4/AWQ, VAE de vídeo y audio separados, un upscaler latente 3D aprendido con factor de escala 2 y un desplazamiento de sigma de 12 para vídeo y 3 para audio.

El autor advierte explícitamente de que no se ejecutó ninguna inferencia para este paquete: no hay render, ni tiempos, ni cifras de VRAM, ni comparación de calidad visual. Por tanto, esta ficha describe la estructura de los grafos, no el rendimiento del modelo subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los grafos referencian la familia MiniMax H3; no se documenta la arquitectura del modelo base) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (UNET `pruned_int8_convrot`, `b25-49-int8`), nvfp4 + awq (text encoder), fp16 (VAE de vídeo, upscaler), fp32 (VAE de audio), int8 convrot (VAE de vídeo en el grafo 02), bf16 (LoRA) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no aplica: el repositorio contiene JSON de ComfyUI, imágenes y un manifiesto SHA256; los pesos referenciados son `.safetensors` |

## Arquitectura y entrenamiento

No hay información sobre la arquitectura del modelo MiniMax H3 en sí: el repositorio no incluye model card técnica del modelo base, ni detalles de entrenamiento, ni número de tokens, ni si hubo RLHF o DPO. Lo que sí se documenta es la topología del pipeline de inferencia que orquestan los grafos. Cada flujo sigue un esquema de dos pasadas: una primera generación a baja resolución (por ejemplo, 544×960 en el grafo 01), seguida de un upscale latente 3D aprendido con escala 2 (`minimax_h3_latent_upscaler_3d_fp16.safetensors`, ejecutado en CUDA con fp16), una reconstrucción del condicionamiento a alta resolución (1088×1920 en el mismo grafo) y una pasada final de refinamiento con ruido bajo.

La cadena de muestreo no usa `KSampler`, sino `SamplerCustomAdvanced` con `KSamplerSelect = euler` y `BasicScheduler = simple`. En el grafo 01 se configuran 8 pasos con denoise 1, `SplitSigmas` en el paso 4 y `H3SigmaRefiner` con `extra_steps=0` (desactivado). El grafo 02 usa 4 pasos con denoise 0.65 y `H3SigmaRefiner` con `extra_steps=1`, rango 0.7–0, programación coseno. El grafo 03 repite la configuración del 01. Los grafos dependen de nodos personalizados: `MiniMaxH3ImageToVideo`, `MiniMaxH3ReferenceToVideo`, `MiniMaxH3SigmaShift`, `H3SigmaRefiner`, `MinimaxH3LatentUpscalerNode3D`, `H3InjectVideoLatent` y `MiniMaxH3NativeAudioLock`, además de los estándar `SamplerCustomAdvanced`, `KSamplerSelect`, `BasicScheduler` y `SplitSigmas`. El desplazamiento de sigma es 12 para vídeo y 3 para audio.

## Capacidades

- Generación de vídeo texto-a-vídeo: el grafo 01 permite desconectar ambas entradas de fotograma para operar en modo T2V.
- Generación condicionada por primer fotograma, último fotograma o ambos (FL2VA): el nodo subyacente trata ambas entradas como opcionales.
- Generación multi-referencia (Ref2VA): el grafo 03 cablea cinco imágenes de referencia a `ref_image_0..4`; el sexto hueco está presente pero sin conectar.
- Repintado HD de vídeo fuente en dos etapas: el grafo 02 inyecta un clip de entrada, lo procesa a un lienzo base de 1344×768 y lo recombina a 24 fps con audio original mediante `MiniMaxH3NativeAudioLock`.
- Generación de audio nativa sincronizada: los tres grafos incluyen VAE de audio y bloqueo de audio nativo; el audio se enruta junto al vídeo en la salida.
- Salida de vídeo a 24 fps con empaquetado h264 mp4 a crf 19 (grafo 02).
- Control de duración: 5 segundos en los grafos 01 y 03; clip fuente de 0–5 s en el 02.
- Aceleración por destilación: los grafos cargan LoRA turbo de 8 pasos (01 y 03) y de 4 pasos a 768p (02).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo del modelo base.

## Casos de uso

- Prototipado de pipelines de vídeo en dos pasadas: el grafo 01 sirve como plantilla para montar un flujo T2V/I2V/FL2VA con upscale latente 3D y refinamiento, sustituyendo únicamente los cargadores por los pesos locales.
- Restauración y repintado HD de metraje existente: el grafo 02 inyecta un clip fuente, mantiene la relación de aspecto y recompone a 1344×768 con audio original bloqueado, lo que encaja en flujos de remasterización de material de archivo.
- Generación de vídeo con consistencia de personaje o producto: el grafo 03 cablea hasta cinco imágenes de referencia, útil para anuncios o clips donde la identidad visual debe mantenerse entre planos.
- Integración en ComfyUI como base de automatización: al ser JSON exportados con grupos y nodos etiquetados, se pueden versionar, parametrizar y encadenar en scripts de generación por lotes.
- Auditoría de dependencias de un pipeline: el manifiesto `SHA256SUMS.json` permite verificar la integridad de los grafos y portadas antes de desplegarlos en un entorno de producción.
- Estudio de configuración de samplers personalizados: los grafos documentan cadenas `SamplerCustomAdvanced` con `SplitSigmas` y `H3SigmaRefiner`, útiles como referencia para quien implemente nodos equivalentes.
- Docencia y reproducción de experimentos: al no incluir pesos, el paquete sirve para enseñar la topología de un pipeline de vídeo-audio sin distribuir material con licencia desconocida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se ejecutó inferencia para este paquete: no hay render, ni tiempos, ni cifras de VRAM, ni comparación de calidad visual.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El autor no publica cifras y no se ejecutó ninguna prueba.
- GPU recomendadas: no disponible. Los grafos referencian ejecución en CUDA con fp16 para el upscaler latente, pero no fijan un modelo de GPU concreto.
- Compatibilidad con GPU de consumo: no disponible. La presencia de un text encoder Qwen3-VL de 32B en NVFP4/AWQ y de UNETs en int8 sugiere requisitos elevados, pero no hay medición que lo confirme.
- Opciones de despliegue: ComfyUI con los nodos personalizados `MiniMaxH3ImageToVideo`, `MiniMaxH3ReferenceToVideo`, `MiniMaxH3SigmaShift`, `H3SigmaRefiner`, `MinimaxH3LatentUpscalerNode3D`, `H3InjectVideoLatent` y `MiniMaxH3NativeAudioLock`, además de `SamplerCustomAdvanced`, `KSamplerSelect`, `BasicScheduler` y `SplitSigmas`. El grafo 02 usa además `VHS_VideoCombine`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. El repositorio no identifica modelos comparables ni publica métricas que permitan una comparación cuantitativa con otras familias de generación de vídeo.

## Limitaciones y advertencias

- El repositorio no contiene pesos del modelo, LoRA ni medios de entrada: es solo un paquete de grafos y portadas. Sin los `.safetensors` referenciados, los flujos no se pueden ejecutar.
- No se ejecutó inferencia: no hay evidencia de que los grafos funcionen tal cual, ni de su calidad, tiempos o consumo.
- Licencia no disponible: se desconoce si el uso comercial de los grafos, los pesos referenciados o los nodos personalizados está permitido.
- Dependencias de nodos personalizados sin versión fijada: el autor advierte de que las referencias a dependencias no prueban versiones instaladas, hashes, licencias ni soporte de GPU; hay que resolverlas en el entorno propio antes de encolar.
- Nombres de fichero inconsistentes: el grafo 02 conserva un prefijo `FL2VA` que es un resto de nomenclatura y no indica que sea un generador de primer/último fotograma.
- Metadatos residuales: el grafo 02 incluye metadatos de previsualización de VHS que apuntan a una ejecución histórica en la nube del autor; no tienen efecto en tiempo de ejecución y no son credenciales.
- Notas del autor no verificadas: las notas Markdown de los grafos describen comportamientos de aceleración (NFE de destilación, upscale latente) que deben tratarse como notas del autor, no como resultados medidos.
- Prompts e imágenes de ejemplo son contenido de demostración, no garantías de resultado.
- El grafo 03 tiene ramas inactivas: los cargadores de vídeo de referencia, sus recortes de audio y los pares `LoadAudio`/`AudioCrop` están en modo bypass (`mode=4`) con selecciones vacías.
- El grafo 03 presenta una discrepancia entre la nota interna (que nombra otra base y un LoRA de 4 pasos) y los nodos cargadores guardados; el README cita el estado guardado, no la nota.
- Riesgo de alucinación y sesgos: no evaluables, al no existir model card del modelo base ni resultados de evaluación.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AI-KSK/minimax-h3-two-stage-three-graphs-296
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
