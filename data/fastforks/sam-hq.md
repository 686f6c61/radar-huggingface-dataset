# fastforks/sam-hq

## Resumen

HQ-SAM (Segment Anything in High Quality) es un modelo de segmentación de imágenes guiada por prompts desarrollado originalmente por Ke et al. (2023) y empaquetado en este repositorio por fastforks. Resuelve el problema de los bordes imprecisos del SAM original: añade un token de salida adicional y una cabeza ligera que fusiona la embedding final con una característica temprana del ViT, produciendo máscaras con bordes más nítidos y mejor conservación de estructuras finas. Los pesos de SAM permanecen congelados, por lo que los prompts funcionan exactamente igual que en SAM.

El repositorio `fastforks/sam-hq` es únicamente una model card: no aloja pesos. fastforks descarga los pesos de los autores desde `lkeab/hq-sam` y los verifica contra hashes SHA-256. Se ofrecen tres variantes (ViT-B, ViT-L y ViT-H) con licencia Apache-2.0 y uso comercial permitido. La tarea es `promptable_segmentation` con entradas de imagen más punto, caja o prompt de texto, y salidas `pred_masks` e `iou_scores`.

El modelo es relevante para pipelines de visión por computador que necesitan segmentación de alta calidad con control fino mediante prompts, sin reentrenar. Su rendimiento medido en una RTX 5060 Ti de 16 GB muestra que la variante ViT-B procesa una imagen de 1024x1024 en 36,8 ms con el backend de kernels, con un pico de memoria de 433 MiB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ViT (image encoder) + prompt encoder + mask decoder con cabeza HQ adicional |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada interna fija 1024x1024) |
| Tipos de cuantización | fp32, fp16 (soportados en los benchmarks); no se documentan otras |
| Idiomas soportados | no disponible (prompts de texto según la card, sin lista de idiomas) |
| Licencia | Apache-2.0 (código y pesos de las tres variantes; uso comercial permitido) |
| Formato de pesos | `.pth` (PyTorch); exportación a ONNX y TensorRT documentada en benchmarks |

## Arquitectura y entrenamiento

HQ-SAM parte del encoder ViT de SAM (congelado) y añade un token de salida extra más una cabeza pequeña que fusiona la embedding final del decoder con una característica temprana del ViT. Esta fusión es la que mejora la nitidez de los bordes y la retención de estructuras finas, manteniendo la interfaz de prompts de SAM. Cada prompt produce una máscara (la de SAM más la de HQ, según el comportamiento por defecto del upstream); con `multimask_output` se selecciona la mejor puntuada de las tres candidatas de SAM como parte SAM. El módulo `module()` portable cubre solo el lado imagen (embedding y característica HQ).

La cabeza HQ se entrena sobre HQSeg-44K, compuesto por seis conjuntos de datos de máscaras finas existentes según el paper (sus términos no fueron verificados por el empaquetador), sobre los pesos congelados de SAM entrenados con SA-1B bajo la licencia de investigación de SA-1B. No se documenta en la información disponible el uso de RLHF/DPO ni el número exacto de tokens de entrenamiento. La entrada admite cualquier H x W >= 1, redimensionada internamente al tamaño fijo del encoder de 1024x1024.

## Capacidades

- Segmentación de imágenes guiada por prompts de punto, caja o texto.
- Generación de máscaras con puntuaciones de calidad (`pred_masks`, `iou_scores`).
- Mejora de bordes y estructuras finas respecto a SAM gracias a la cabeza HQ.
- Selección de la mejor máscara entre las tres candidatas de SAM mediante `multimask_output`.
- Backends `portable` y `kernels`, con exportación a ONNX y TensorRT fp16.
- Procesamiento de resoluciones altas: probado hasta 1080x1920 en las tres variantes.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni audio.

## Casos de uso

- Segmentación interactiva en herramientas de edición de imagen: el usuario hace clic o dibuja una caja y el modelo devuelve una máscara con bordes nítidos, adecuada para recorte y composición en tiempo real gracias a los 36,8 ms por imagen de la variante ViT-B con kernels.
- Anotación automática de datasets de visión: generar máscaras de instancias a partir de puntos interiores para acelerar el etiquetado, con IoU de 52,19 % (mejor de 3) en COCO val2017 para ViT-B.
- Segmentación de estructuras finas en imágenes médicas o industriales: la fusión con características tempranas del ViT mejora la conservación de bordes delgados frente a SAM, útil en inspección de defectos o análisis de tejidos.
- Preprocesado en pipelines de visión por computador: aislar objetos antes de clasificación o detección, con un pico de memoria de 388 MiB en ViT-B portable que permite ejecutarlo junto a otros modelos en la misma GPU.
- Despliegue en GPUs de consumo: las tres variantes caben en una RTX 5060 Ti de 16 GB procesando 1080x1920 (0,4 GiB en ViT-B, 0,8 GiB en ViT-L, 1,5 GiB en ViT-H en pico), lo que habilita prototipos y aplicaciones de escritorio.
- Segmentación en producción con TensorRT: la exportación a TensorRT fp16 reduce el encoder de imagen a 28,0 ms en ViT-B, 68,3 ms en ViT-L y 125 ms en ViT-H, adecuado para servicios de alta concurrencia.
- Integración en herramientas de análisis de imagen por lotes: el backend `kernels` ofrece una aceleración de 1,4x a 1,5x frente a `portable`, reduciendo el coste por imagen en procesamiento masivo.

## Benchmarks y rendimiento

Precisión en COCO val2017 (cada 10ª imagen, prompts de punto, mIoU mejor de 3 / máscara única, %):

| Variante | Original fp32 | Original fp16 | Portable | Kernels |
|---|---|---|---|---|
| `sam-hq-vit-b` | 52,19 / 51,05 | 52,28 / 51,11 | 52,19 / 51,04 | 52,19 / 51,04 |
| `sam-hq-vit-l` | no disponible (dato truncado en la card) | no disponible | no disponible | no disponible |

Tiempo y memoria en segmentación sintética 1024x1024 (RTX 5060 Ti 16 GB, sm_120):

| Modelo | Original fp32 (ms) | Original (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | Pico memoria portable (MiB alloc/reserved) |
|---|---|---|---|---|---|---|
| `sam-hq-vit-b` | 172 | 103 | 49,7 | 36,8 | 2,8x | 388 / 422 |
| `sam-hq-vit-h` | 738 | 311 | 217 | 144 | 2,2x | 1500 / 1566 |
| `sam-hq-vit-l` | 412 | 202 | 118 | 81,4 | 2,5x | 846 / 902 |

Con `torch.compile` y TensorRT fp16 (encoder de imagen):

| Modelo | Portable (ms) | Compile (ms) | TensorRT fp16 (ms) | Kernels (ms) |
|---|---|---|---|---|
| `sam-hq-vit-b` | 49,7 | 39,4 | 28,0 | 36,8 |
| `sam-hq-vit-h` | 217 | 187 | 125 | 144 |
| `sam-hq-vit-l` | 118 | 97,0 | 68,3 | 81,4 |

Tiempos de carga y primera llamada:

| Modelo | Carga original (s) | Carga portable (s) | Carga kernels (s) | Primera llamada original (s) | Primera llamada portable (s) | Primera llamada kernels (s) |
|---|---|---|---|---|---|---|
| `sam-hq-vit-b` | 0,77 | 0,27 | 1,06 | 0,19 | 0,41 | 0,35 |
| `sam-hq-vit-h` | 3,92 | 1,34 | 2,29 | 0,32 | 0,52 | 0,47 |
| `sam-hq-vit-l` | 1,98 | 0,76 | 1,64 | 0,20 | 0,41 | 0,40 |

## Requisitos de hardware

- VRAM estimada: 0,4 GiB (ViT-B), 0,8 GiB (ViT-L) y 1,5 GiB (ViT-H) en pico para imágenes de 1080x1920 con el backend portable en fp16.
- GPU recomendadas: RTX 5060 Ti 16 GB es la plataforma de referencia medida; por tamaño, cualquier GPU con al menos 2-4 GB libres es suficiente para las tres variantes.
- Cabe en GPU de consumo: sí, las tres variantes caben holgadamente en GPUs de consumo con 8 GB o más.
- Opciones de despliegue: backends `portable` y `kernels` del paquete fastforks, exportación a ONNX y TensorRT fp16, y `torch.compile`.
- Latencia: 36,8 ms (ViT-B), 81,4 ms (ViT-L) y 144 ms (ViT-H) con kernels a 1024x1024; con TensorRT fp16, 28,0 ms, 68,3 ms y 125 ms respectivamente para el encoder de imagen.
- Throughput: no disponible (no se documentan imágenes por segundo en lote).
- Preparación: la compilación en frío con `torch.compile` tarda entre 32,8 s y 42,3 s; la construcción de ONNX más motor TensorRT, entre 39,0 s y 69,1 s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | Precisión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HQ-SAM (este repo) | no disponible | 1024x1024 interno, admite cualquier H x W >= 1 | mIoU 52,19 % en COCO val2017 (ViT-B) | Apache-2.0 | pesos en `lkeab/hq-sam`, card en `fastforks/sam-hq` |
| SAM (original) | no disponible | 1024x1024 | no disponible en esta información | Apache-2.0 (según la card, pesos SA-1B bajo licencia de investigación) | `facebook/sam` |
| SAM 2 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de SAM original ni de SAM 2 en la información proporcionada, por lo que la comparación cuantitativa de precisión no está disponible.

## Limitaciones y advertencias

- El repositorio no contiene pesos: requiere descargar los ficheros de `lkeab/hq-sam` y verificar los SHA-256 indicados en la card.
- La card califica el paquete de código como "research-use package"; aunque la licencia declarada es Apache-2.0 y permite uso comercial, conviene revisar los términos antes de desplegar en producción.
- Los términos de los seis conjuntos de datos de HQSeg-44K no fueron verificados por el empaquetador.
- Los pesos de SAM subyacentes se entrenaron con SA-1B bajo su licencia de investigación, lo que puede imponer restricciones adicionales.
- No se documentan sesgos conocidos ni tasas de alucinación (no aplica al ser un modelo de segmentación, pero puede producir máscaras incorrectas en escenas ambiguas).
- El dato de precisión de `sam-hq-vit-l` en COCO val2017 aparece truncado en la model card; no se dispone del valor completo.
- No se documentan capacidades multilingües ni lista de idiomas para los prompts de texto.
- La entrada se redimensiona internamente a 1024x1024, lo que puede degradar la precisión en imágenes con relaciones de aspecto extremas o detalles de muy alta frecuencia.
- El rendimiento medido corresponde a una única GPU (RTX 5060 Ti, sm_120); en otros hardware los tiempos pueden diferir.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/fastforks/sam-hq
- Pesos de los autores: https://huggingface.co/lkeab/hq-sam
- Código fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend: https://huggingface.co/fastforks/kernels
- Código original de HQ-SAM: https://github.com/SysCV/sam-hq
- Benchmarks y protocolo: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Fichero de definición de la card: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/promptable_segmentation/models/sam_hq/card.toml
- Evidencia de licencia (README de los autores): https://huggingface.co/lkeab/hq-sam/blob/09b02a333b37772133eff3997bdba997867374b7/README.md
- Licencia del código original: https://github.com/SysCV/sam-hq/blob/e696978d60352dc9a26b12631cd91781502c6546/LICENSE
