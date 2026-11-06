# AI-KSK/minimax-h3-voxcpm-digital-human-289

## Resumen

AI-KSK/minimax-h3-voxcpm-digital-human-289 no es un modelo de pesos, sino un paquete de dos grafos de ComfyUI exportados para generar vídeo de "digital human" (presentador sintético) a partir de una imagen de referencia y audio generado con VoxCPM. Los flujos se construyen sobre el checkpoint MiniMax H3 `ref2va`, un modelo de referencia-a-vídeo con soporte de audio, y usan VoxCPM para sintetizar la voz que actúa como pista conductora. El repositorio contiene únicamente los JSON de los flujos, dos imágenes promocionales en WebP y un manifiesto SHA256; no incluye checkpoints, VAE, modelo VoxCPM ni medios de entrada.

El primer grafo implementa un presentador de un solo personaje (25 nodos, 31 enlaces) con una imagen de referencia y un clip de audio VoxCPM recortado a 0:00–0:10. El segundo implementa un diálogo de dos personajes (32 nodos, 38 enlaces) que recorta dos clips (0:00–0:05 y 0:00–0:06), los concatena en una única línea de tiempo y la usa como audio conductor. En ambos casos el modelo H3 solo genera imagen, mientras que el audio queda bloqueado por el nodo `VRGDG_MiniMaxH3AudioDrive`.

Es relevante como referencia de ingeniería de pipelines: documenta la configuración exacta de muestreo, resolución, nodos personalizados y contratos de prompt necesarios para reproducir un flujo de vídeo con audio en ComfyUI. No obstante, el propio autor declara explícitamente que no se ejecutó inferencia para este paquete, por lo que no hay cifras de rendimiento, latencia, VRAM ni validación de lip-sync o clonación de voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el paquete contiene flujos de ComfyUI, no pesos; el checkpoint referenciado es MiniMax H3 `ref2va`, arquitectura no detallada en la model card) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Los flujos referencian checkpoints en `int8_convrot` (UNET y CLIP) y VAE en `fp16` (vídeo) y `fp32` (audio) |
| Idiomas soportados | No disponible (el prompt de ejemplo está en chino; no se declara cobertura lingüística) |
| Licencia | No disponible; el autor indica que no se afirma ninguna licencia comercial o de redistribución global |
| Formato de pesos | No se incluyen pesos. Los flujos esperan `safetensors`: `minimax_h3_ref2va_int8_convrot.safetensors`, `qwen3vl_32b_minimax_h3_int8_convrot.safetensors`, `minimax_h3_video_vae_fp16.safetensors`, `minimax_h3_audio_vae_fp32.safetensors` |

## Arquitectura y entrenamiento

El repositorio no contiene información sobre la arquitectura interna ni el entrenamiento de MiniMax H3 ni de VoxCPM. Lo que sí documenta son los componentes del pipeline: un `UNETLoader` que carga el checkpoint `minimax_h3_ref2va_int8_convrot.safetensors`, un `CLIPLoader` que carga `qwen3vl_32b_minimax_h3_int8_convrot.safetensors` con tipo `minimax` (lo que sugiere un codificador de texto basado en Qwen3-VL de 32B, aunque esto es una inferencia a partir del nombre del fichero, no un dato confirmado), y dos VAE separados, uno de vídeo en fp16 y otro de audio en fp32.

El muestreo se realiza con `SamplerCustomAdvanced` combinado con `KSamplerSelect` en modo `res_multistep` y `BasicScheduler` en modo `simple`, con 20 pasos y denoise 1. La generación de vídeo se configura a 16:9, 0,9 MP con múltiplo de 32, guardada a 1344x768, longitud 124 y `ref_image_size=match`, con control de duración de 8 segundos. Se emplean nodos personalizados (`MiniMaxH3ReferenceToVideo`, `VRGDG_MiniMaxH3AudioDrive`, `SoundFlow_GetLength`, `MiniMaxH3MemoryEfficientSageAttentionPatch`, `PathchSageAttentionKJ`), incluido un parche de atención Sage para eficiencia de memoria. No se aportan datos sobre volumen de entrenamiento, composición del dataset ni técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de vídeo condicionada por imagen de referencia y audio conductor, mediante el checkpoint MiniMax H3 `ref2va`.
- Síntesis de voz con VoxCPM a partir de texto escrito en el nodo correspondiente, usada como pista de audio del vídeo.
- Flujo de un solo personaje con una imagen de referencia y un clip de audio recortado.
- Flujo de diálogo de dos personajes con tres ranuras de imagen (personaje 1, personaje 2 y una tercera referencia) y concatenación de dos clips de audio en una línea de tiempo única.
- Contrato de prompt con identificadores `<Picture 1>`, `<Picture 2>` y `<Audio 1>`, y prohibición explícita de personajes adicionales, clones o hojas de tres vistas.
- Salida de vídeo a 24 fps y 8 bits en el flujo de un personaje (nodo `CreateVideo` + `SaveVideo`), y MP4 H.264 con crf 19 y yuv420p en el flujo de dos personajes (`VHS_VideoCombine`).
- No se declaran capacidades de tool calling, razonamiento multi-paso, agentes, visión general, audio de entrada distinto del conductor ni modo thinking.

## Casos de uso

- Prototipado de presentadores sintéticos para vídeo corto: el flujo de un personaje permite cargar una imagen y una línea de texto, generar la voz con VoxCPM y obtener un clip de 8 segundos a 1344x768 con H3 generando únicamente la imagen.
- Diálogos de dos personajes para escenas de ficción breve: el segundo grafo recorta y concatena dos clips de audio y los usa como línea de tiempo conductora, lo que sirve para ensayar interacciones entre dos referencias visuales.
- Evaluación de pipelines ComfyUI con audio conductor: los JSON sirven como plantilla reproducible para probar el nodo `VRGDG_MiniMaxH3AudioDrive` y el parche de atención Sage en entornos con memoria limitada.
- Docencia y formación técnica: los grafos documentan de forma explícita el cableado de cargadores, muestreadores y nodos de audio, útiles para explicar cómo se compone un pipeline de vídeo con audio en ComfyUI.
- Base para integración en herramientas de creación de contenido: al ser exports estándar de ComfyUI, pueden importarse y adaptarse en instalaciones propias una vez obtenidos los checkpoints y modelos no incluidos.
- Pruebas de sustitución de audio externo: el flujo de un personaje contempla cambiar el nodo de audio conductor por una pista externa, lo que permite experimentar con doblaje o sustitución de voz sin regenerar la imagen.
- Referencia para auditoría de derechos: el manifiesto SHA256 y la separación entre flujos, portadas y medios de entrada facilitan verificar la integridad de los archivos y rastrear qué material no se distribuye.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que no se ejecutó inferencia para este paquete y que no hay cifras de render, tiempos, VRAM ni métricas de lip-sync o clonación de voz.

## Requisitos de hardware

- VRAM estimada: no disponible. El paquete no incluye pesos ni informes de consumo; el autor indica que no hay cifra de VRAM.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada. La presencia de un parche de atención Sage orientado a eficiencia de memoria sugiere que el pipeline puede ajustarse a memoria limitada, pero no se aporta ninguna medición.
- Opciones de despliegue: ComfyUI con los nodos personalizados `MiniMaxH3ReferenceToVideo`, `VRGDG_MiniMaxH3AudioDrive`, `SoundFlow_GetLength`, `MiniMaxH3MemoryEfficientSageAttentionPatch` y `PathchSageAttentionKJ`, además de nodos estándar de muestreo. También se ofrecen versiones alojadas en RunningHub (internacional y China).
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio ocupa 0,0 GB; los checkpoints H3, VoxCPM, VAE y medios de entrada deben obtenerse por separado.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros paquetes de flujos de digital human ni datos de modelos comparables en parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- El repositorio no contiene pesos ni modelos: sin los checkpoints H3, VoxCPM, VAE y medios de entrada, los flujos no son ejecutables por sí solos.
- No se ejecutó inferencia para este paquete; no hay evidencia de render, sincronización labial, preservación de voz ni velocidad.
- El autor no afirma capacidades de lip-sync, consistencia multi-personaje ni clonación de voz; el vídeo promocional que describe el modelo como "el digital human open source más potente" es una descripción del autor no reproducida de forma independiente.
- Licencia no disponible: no se concede licencia comercial ni de redistribución global. Los derechos sobre flujos, nodos, modelos, VoxCPM, audio, semejanza, imágenes de entrada y portadas deben verificarse por separado.
- El uso de clonación de voz y de semejanza de personas tiene requisitos legales propios que no se detallan en la model card.
- Las portadas son imágenes promocionales de origen (WebP), no fotogramas generados por estos grafos.
- El prefijo de guardado `AnimateDiff` en el flujo de dos personajes es un residuo histórico del export, no una ruta de modelo distinta; puede inducir a error al organizar salidas.
- Los enlaces de RunningHub incluyen el código de invitación del autor `rh-v1111`; la inspección es posible sin cuenta, pero la ejecución en línea requiere registro.
- El prompt de ejemplo está en chino y no se declara cobertura multilingüe.
- Riesgo de alucinación y sesgos: no evaluado ni documentado en la información disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AI-KSK/minimax-h3-voxcpm-digital-human-289
- RunningHub internacional, flujo de un personaje: https://www.runninghub.ai/zh-cn/post/2085223953907404802?inviteCode=rh-v1111
- RunningHub China, flujo de un personaje: https://www.runninghub.cn/post/2085223953907404802/?inviteCode=rh-v1111
- RunningHub internacional, flujo de dos personajes: https://www.runninghub.ai/zh-cn/post/2085223972794355714?inviteCode=rh-v1111
- RunningHub China, flujo de dos personajes: https://www.runninghub.cn/post/2085223972794355714/?inviteCode=rh-v1111
- Civitai, flujo de un personaje: https://civitai.com/models/3033233
- Civitai, flujo de dos personajes: https://civitai.com/models/3033235
- Tutorial en YouTube: https://www.youtube.com/watch?v=mw3JTMK0ZmA
- Tutorial en Bilibili: https://www.bilibili.com/video/BV1kUuW6FEVs
