# mlboydaisuke/EdgeTAM-ExecuTorch

## Resumen

EdgeTAM-ExecuTorch es una conversión a formato ExecuTorch del modelo EdgeTAM de Meta, un modelo de segmentación promptable (mask generation) diseñado para ejecutarse en dispositivos móviles y edge. El autor de esta conversión, mlboydaisuke, ha exportado el modelo en dos archivos `.pte` separados (encoder y decoder) optimizados con el delegado XNNPACK, lo que permite ejecutar el encoder una vez por imagen y el decoder por cada clic o prompt. EdgeTAM es una adaptación eficiente de SAM 2 que introduce una arquitectura Spatial Perceiver para reducir el coste computacional, logrando según el paper original 16 FPS en iPhone 15 Pro Max sin cuantización. Esta conversión mantiene la fidelidad numérica con el modelo eager (correlación 1.000000) y ofrece un encoder de solo 19.7 MB, 5.5 veces más pequeño que el encoder fp16 de SAM 2.1 hiera-tiny, lo que lo hace especialmente adecuado para aplicaciones de segmentación en tiempo real en dispositivos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EdgeTAM (adaptación de SAM 2 con Spatial Perceiver, encoder RepViT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 1024×1024) |
| Tipos de cuantizacion | fp32 (encoder y decoder), fp16 (solo decoder, 12.6 MB) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pte` (ExecuTorch, dos archivos: encoder y decoder) |

## Arquitectura y entrenamiento

EdgeTAM es un modelo de segmentación promptable derivado de SAM 2, presentado en el paper "EdgeTAM: On-Device Track Anything Model" (CVPR 2025). Su arquitectura sustituye el mecanismo de memoria de SAM 2 por un Spatial Perceiver 2D que reduce la complejidad de la atención, permitiendo ejecución en tiempo real en dispositivos móviles. El encoder utiliza una backbone RepViT (convolucional) que produce tres salidas: `image_embed` (1,256,64,64), `feat_s0` (1,32,256,256) y `feat_s1` (1,64,128,128). El decoder incorpora el prompt encoder y genera tres máscaras candidatas con sus puntuaciones IoU. La conversión a ExecuTorch se realizó mediante `torch.export` y `to_edge_transform_and_lower` con el particionador XNNPACK. El encoder se exporta solo en fp32 porque XNNPACK serializa los pesos convolucionales en fp32 independientemente del dtype del grafo, y las pruebas con fp16 y int8 dinámico no redujeron el tamaño (19.8 MB y 19.7 MB respectivamente). El decoder fp16 mantiene una correlación de 1.000000 con el eager y acepta/devuelve tensores fp32, por lo que puede combinarse con el encoder fp32 sin cambios en la aplicación. La cobertura del delegado XNNPACK es del 99.8% en el encoder (una operación `upsample_nearest2d` queda en kernels portátiles) y del 66.5% en el decoder (el bookkeeping del prompt encoder con `expand`/`where` permanece en portátil, pero todas las convoluciones y matmuls están delegadas).

## Capacidades

- Segmentación promptable de imágenes: acepta puntos (coordenadas en espacio 1024) y etiquetas (1=foreground, 0=background) para generar máscaras de segmentación.
- Genera tres máscaras candidatas por prompt, con puntuaciones IoU para seleccionar la mejor (argmax de IoU, umbral > 0, upsampling 4× a resolución original).
- Ejecución on-device: diseñado para dispositivos móviles y edge, con dos archivos `.pte` que separan encoder y decoder para reutilizar el embedding de imagen en múltiples prompts.
- Compatibilidad con SAM 2.1: la interfaz de salida es idéntica a la de SAM2.1-hiera-tiny-ExecuTorch, por lo que una aplicación existente puede intercambiar los archivos sin cambios de código.
- Sin procesamiento de texto ni capacidades multimodales: es exclusivamente un modelo de visión para segmentación.
- No soporta tool calling ni agentes; su pipeline es `mask-generation`.

## Casos de uso

- Edición de imágenes en móvil: un usuario toca un objeto en una foto y la aplicación genera la máscara en tiempo real para recortar, eliminar fondo o aplicar filtros. El encoder se ejecuta una vez al cargar la imagen y el decoder responde a cada toque en milisegundos.
- Anotación asistida de datos: en herramientas de etiquetado para datasets de segmentación, el modelo puede pre-generar máscaras a partir de clics, reduciendo el tiempo de anotación manual. Su tamaño reducido permite ejecutarlo en portátiles sin GPU.
- Seguimiento de objetos en vídeo: aunque esta conversión solo cubre imagen estática, el modelo base EdgeTAM soporta vídeo; la versión ExecuTorch puede integrarse en pipelines de vídeo en tiempo real para tracking de objetos en dispositivos móviles.
- Realidad aumentada: segmentación de objetos en la cámara para overlays virtuales, con latencia suficientemente baja para interacción en vivo (el encoder tarda ~32 ms y el decoder ~24 ms en Mac arm64, según la verificación).
- Automatización industrial en edge: inspección visual de piezas en líneas de producción usando un dispositivo con NPU o CPU ARM, donde el modelo segmenta defectos o regiones de interés sin enviar datos a la nube.
- Aplicaciones de accesibilidad: ayudar a personas con discapacidad visual a identificar objetos en su entorno mediante toques en la pantalla, con procesamiento local que preserva la privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (mIoU, J&F, etc.) en la información disponible de esta conversión. La model card reporta datos de verificación en Mac arm64 (executorch 1.4.0, torch 2.13.0) que confirman fidelidad numérica con el eager:

| Grafo | Salida | Forma | max_abs_diff | correlación |
|---|---|---|---|---|
| encoder | image_embed | [1, 256, 64, 64] | 0.000e+00 | 1.000000 |
| encoder | feat_s0 | [1, 32, 256, 256] | 0.000e+00 | 1.000000 |
| encoder | feat_s1 | [1, 64, 128, 128] | 0.000e+00 | 1.000000 |
| decoder | mask logits | [1, 1, 3, 256, 256] | 0.000e+00 | 1.000000 |
| decoder | iou | [1, 1, 3] | 0.000e+00 | 1.000000 |

Tiempos medianos sobre 10 ejecuciones en Mac arm64 (referencia relativa, no de dispositivo): encoder 32.3 ms (torch eager 103.5 ms), decoder 23.7 ms (eager 13.9 ms). El paper original de EdgeTAM reporta 16 FPS en iPhone 15 Pro Max sin cuantización, pero esos datos no se replican en esta conversión.

## Requisitos de hardware

- Tamaño de los archivos: encoder fp32 19.7 MB, decoder fp32 24.7 MB, decoder fp16 12.6 MB. En total ~44.4 MB (fp32) o ~32.3 MB (con decoder fp16).
- VRAM estimada: no disponible, pero al ser modelos de ~20 MB, la memoria necesaria es muy reducida; cabe en cualquier GPU moderna y en CPUs con aceleración XNNPACK.
- GPU recomendadas: no especificadas; el objetivo es ejecución en CPU móvil (ARM) con XNNPACK. En Mac arm64 funciona sin GPU dedicada.
- Compatible con consumer GPU: sí, cualquier GPU con soporte PyTorch puede ejecutar el modelo eager, pero la conversión ExecuTorch está pensada para CPU/edge.
- Opciones de despliegue: ExecuTorch runtime con delegado XNNPACK; los archivos `.pte` se cargan directamente. No se menciona soporte para vLLM, Ollama o TGI (no aplica a modelos de visión).
- Latencia: encoder ~32 ms, decoder ~24 ms en Mac arm64 (referencia); en dispositivos móviles puede variar, pero el paper original reporta 16 FPS en iPhone 15 Pro Max.

## Comparativa con modelos similares

| Modelo | Tamaño encoder | Formato | Licencia | Contexto | Rendimiento |
|---|---|---|---|---|---|
| EdgeTAM-ExecuTorch (este) | 19.7 MB (fp32) | `.pte` (ExecuTorch) | Apache-2.0 | Imagen 1024×1024 | Encoder 32 ms, decoder 24 ms (Mac arm64) |
| SAM2.1-hiera-tiny-ExecuTorch | 109.2 MB (fp32) / 55.6 MB (fp16) | `.pte` (ExecuTorch) | Apache-2.0 | Imagen 1024×1024 | no disponible |
| SAM 2 (original) | ~2.4 GB (hiera-large) | PyTorch | Apache-2.0 | Imagen 1024×1024 + vídeo | Requiere GPU, no on-device |

La comparativa se basa en los datos de la model card: EdgeTAM es 5.5× más pequeño que SAM 2.1 hiera-tiny para el mismo contrato de salida, y su interfaz es compatible, lo que facilita la migración. No se dispone de comparación con otros modelos de segmentación on-device en la información proporcionada.

## Limitaciones y advertencias

- El modelo es exclusivamente para segmentación de imágenes; no procesa texto, vídeo (en esta conversión) ni audio.
- La conversión ExecuTorch está verificada en Mac arm64 con executorch 1.4.0 y torch 2.13.0; en otros entornos puede requerir ajustes.
- El encoder solo está disponible en fp32; aunque el tamaño es reducido, no se beneficia de cuantización adicional.
- La cobertura del delegado XNNPACK no es completa (99.8% encoder, 66.5% decoder); las operaciones no delegadas se ejecutan en kernels portátiles, lo que puede afectar al rendimiento en dispositivos sin aceleración.
- No se han publicado benchmarks de precisión (mIoU, J&F) para esta conversión; la fidelidad numérica con el eager es perfecta, pero el rendimiento real en tareas de segmentación depende del modelo base.
- El modelo base EdgeTAM puede presentar sesgos en la segmentación según los datos de entrenamiento (SA-V, etc.), aunque no se detallan en la información disponible.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base y del paper.
- No hay garantía de soporte para todas las arquitecturas de dispositivos; XNNPACK está optimizado para CPUs ARM y x86, pero no para todas las NPUs.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlboydaisuke/EdgeTAM-ExecuTorch
- Modelo base (facebook/EdgeTAM): https://huggingface.co/facebook/EdgeTAM
- Espejo en formato transformers: https://huggingface.co/yonigozlan/EdgeTAM-hf
- Repositorio de conversión (executorch-models): https://github.com/john-rocky/executorch-models
- Paper EdgeTAM (arXiv): https://arxiv.org/abs/2501.07256
- Documentación de EdgeTAM en Hugging Face: https://huggingface.co/docs/transformers/main/en/model_doc/edgetam
- Repositorio oficial de EdgeTAM (Meta): https://github.com/facebookresearch/EdgeTAM
- Repositorio de ExecuTorch: https://github.com/pytorch/executorch
