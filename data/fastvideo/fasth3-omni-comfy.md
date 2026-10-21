# FastVideo/FastH3-Omni-Comfy

## Resumen
FastH3-Omni-Comfy es un paquete de pesos de difusión en formato single-file preparado para ComfyUI, publicado por FastVideo. Deriva de FastVideo-FastH3-Omni-8-Step-V1 y genera vídeo y audio sincronizado a partir de un prompt y referencias ordenadas de imagen, vídeo y audio.
El repositorio incluye modelos de difusión en BF16 e INT8 ConvRot, codificadores de texto Qwen3-VL-32B en BF16, INT8 ConvRot y NVFP4 AWQ, además de VAEs de vídeo y de audio. El flujo está pensado para el nodo de acondicionamiento "MiniMax H3 Reference to Video" de ComfyUI y utiliza 8 pasos de muestreo con guidance 1.0, video shift 12.0 y audio shift 3.0.
Su relevancia práctica está en el flujo reference-to-video: permite reutilizar imágenes, clips y audio como condicionamiento para generar piezas audiovisuales con una pista de audio alineada. El repositorio ocupa 169,4 GB e incluye todas las variantes. No se han publicado en la información disponible el número de parámetros, benchmarks, resolución máxima, duración de vídeo ni cobertura de idiomas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para vídeo y audio de la familia MiniMax-H3; variante podada ("pruned") de 8 pasos. No se detalla en la información disponible si el backbone es un transformer de difusión (DiT) u otra variante |
| Parámetros totales | no disponible |
| Parámetros activos | No aplica (no es un modelo MoE); no se especifica el número de parámetros |
| Longitud de contexto | no disponible (no se documentan duración máxima, resolución ni número de frames) |
| Tipos de cuantización | BF16; INT8 ConvRot; NVFP4 AWQ en el codificador de texto; FP8 y NVFP4 QAD en variantes separadas |
| Idiomas soportados | no disponible |
| Licencia | MiniMax-H3 Community License Agreement (`license: other`) |
| Formato de pesos | safetensors single-file (`diffusion-single-file`), con estructura de directorios para ComfyUI |
| Modelo base | FastVideo/FastVideo-FastH3-Omni-8-Step-V1 |
| Modalidades de salida | Vídeo y audio sincronizado |
| Entradas de referencia | Imagen, vídeo y audio, etiquetados como `<Picture 1>`, `<Video 1>` y `<Audio 1>` |
| Pasos de muestreo | 8 |
| Guidance | 1.0 |
| Shifts | Vídeo 12.0; audio 3.0 |
| Codificador de texto | Qwen3-VL-32B, con torre de visión para las referencias |
| VAEs incluidos | Vídeo en FP16 e INT8 ConvRot; audio en FP32 |
| Tamaño del repositorio | 169,4 GB |
| Descargas y likes | 11 descargas; 21 likes |

## Arquitectura y entrenamiento
El modelo es una difusión para generación conjunta de vídeo y audio construida sobre la familia MiniMax-H3 y distribuida como pesos single-file. La variante incluida es "pruned" y de 8 pasos, lo que indica un proceso de poda o destilación orientado a reducir el número de evaluaciones del modelo durante el muestreo. La información proporcionada no especifica el número de parámetros, la arquitectura interna del backbone ni el esquema exacto de atención.

El pipeline combina un codificador de texto Qwen3-VL-32B con torre de visión, un VAE de vídeo y un VAE de audio. Las referencias visuales y sonoras se insertan en el prompt mediante etiquetas ordenadas, y el nodo de ComfyUI se encarga de aplicar el condicionamiento. La cuantización INT8 ConvRot se ofrece como alternativa al BF16 para reducir requisitos de memoria, mientras que NVFP4 AWQ se emplea en el codificador de texto para hardware Blackwell. No se han publicado datos sobre tokens de entrenamiento, composición del dataset, resolución de entrenamiento ni procesos de ajuste como RLHF o DPO; en un modelo de difusión estas técnicas no se aplican del mismo modo que en un LLM.

## Capacidades
- Generación conjunta de vídeo y audio sincronizado a partir de un prompt textual.
- Reference-to-video con referencias ordenadas de imagen, vídeo y audio.
- Condicionamiento mediante etiquetas `<Picture 1>`, `<Video 1>` y `<Audio 1>` dentro del prompt.
- Muestreo en 8 pasos con guidance 1.0, orientado a reducir el coste de inferencia frente a configuraciones de más pasos.
- Integración con ComfyUI mediante el nodo "MiniMax H3 Reference to Video" y soporte nativo de MiniMax-H3 en builds recientes.
- Variantes de precisión para distintos hardware: BF16, INT8 ConvRot, NVFP4 AWQ, FP8 y NVFP4 QAD.
- Codificador Qwen3-VL-32B con torre de visión para procesar las imágenes de referencia.
- Generación de texto conversacional: no aplica; el codificador de texto se usa para acondicionamiento, no para diálogo.
- Tool calling y function calling: no aplica; no es un LLM conversacional.
- Agentes y razonamiento multi-paso: no aplica.
- Modo thinking: no disponible.
- Cobertura mult
