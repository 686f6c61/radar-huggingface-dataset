# MATLOWAI/RelayVSR-X4-Quants

## Resumen

RelayVSR-X4-Quants es un conjunto de pesos cuantizados del modelo de superresolución de vídeo RelayVSR X4, desarrollado originalmente por kopperx y empaquetado por MATLOWAI para su uso en ComfyUI. El modelo base toma vídeo de baja resolución y lo reescala hasta 4x (por ejemplo, de 1280x704 a 2560x1408) mediante un pipeline de difusión construido sobre Wan 2.2 y FlashVSR. El problema que resuelve es el coste de memoria del modelo original: los pesos en precisión completa ocupan 10,1 GB y, junto con la caché de clave/valor en bf16, exigen unos 27,9 GB de VRAM, lo que lo limita a tarjetas de 32 GB o superiores.

Esta versión ofrece tres variantes cuantizadas (int8 ConvRot, W6A8 y W4A8) que reducen el peso de 10,1 GB a entre 5,2 y 3,0 GB, y aplican cuantización en tiempo de ejecución a la caché KV (int8 o int4 con rotación de Hadamard), lo que permite ejecutar el modelo en tarjetas de 16 GB y 24 GB. Según el autor, las variantes cuantizadas son además más rápidas que la precisión completa (22,0 s frente a 28,4 s por clip de 3 segundos en una RTX 5090), con una deriva de calidad medida en PSNR de 53,1 dB (int8), 47,0 dB (W6A8) y 44,3 dB (W4A8) respecto a la salida en precisión completa.

La relevancia actual reside en que acerca un modelo de superresolución de vídeo de alta calidad a hardware de consumo y a estaciones de trabajo con GPU de 16-24 GB, sin requerir clústeres. No obstante, los pesos cuantizados solo cargan a través del worker RelayVSR de la extensión ComfyUI-MAINodes, no en el layout de cuantización nativo de LightX2V.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para superresolución de vídeo, construido sobre Wan 2.2 y FlashVSR (transformer de difusión con 30 bloques) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa clips de vídeo; el ejemplo medido es de 73 fotogramas, 3 s) |
| Tipos de cuantizacion | W8A8 ConvRot (int8 pesos y activaciones, grupos Hadamard de 256), W6A8 (pesos de 6 bits, activaciones int8), W4A8 (pesos de 4 bits, activaciones int8); caché KV en int8 o int4 con rotación de Hadamard en tiempo de ejecución |
| Idiomas soportados | no disponible (modelo de vídeo, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tres variantes: `wan_int8_convrot.safetensors`, `wan_w6a8.safetensors`, `wan_w4a8.safetensors`, más `flash.safetensors`) |

## Arquitectura y entrenamiento

El modelo base RelayVSR es un sistema de superresolución de vídeo que combina Wan 2.2 (un transformer de difusión para generación de vídeo) con FlashVSR, y se ejecuta mediante el motor de inferencia LightX2V. La arquitectura consta de 30 bloques, con un total de 300 capas lineales que son las únicas cuantizadas en esta release; el resto de componentes (normalizaciones, sesgos, tablas de modulación, capas de entrada y salida) permanece en bf16. La cuantización se realizó con comfy-kitchen 0.2.40 y se conserva la metadata original del checkpoint, añadiendo una entrada `relayvsr_quant`.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO, ya que la model card de esta release se centra en el proceso de cuantización y no en el entrenamiento del modelo base. La innovación técnica destacable de esta release es la cuantización de la caché de clave/valor: la memoria del modelo está dominada por la caché KV sobre cuatro keyframes (19,6 GiB en bf16 a resolución 1280x704 de entrada), por lo que reducir solo los pesos no bastaría para llegar a una tarjeta de 12 GB; por eso las variantes aplican int8 o int4 con rotación de Hadamard a la caché en tiempo de ejecución.

## Capacidades

- Superresolución de vídeo hasta 4x: acepta vídeo de entrada y genera salida a 4x de resolución (por ejemplo, 1280x704 a 2560x1408), con opción de salida a 2x mediante reescalado interno.
- Procesamiento de clips de vídeo: el ejemplo medido procesa clips de 73 fotogramas (3 segundos), con memoria determinada por la resolución y no por la longitud del clip.
- Presets de calidad: incluye un preset `faithful` por defecto en el nodo de ComfyUI.
- Ejecución en ComfyUI: integración mediante los nodos RelayVSR de la extensión ComfyUI-MAINodes, con selección de variante, escala de salida, modo de ejecución (single GPU) y tier de VRAM.
- Modos de VRAM: tiers para 32 GB (precisión completa con offload de bloques Wan), 24 GB+ (int8), 16 GB (W6A8) y 16 GB con más margen (W4A8), además de modo `auto`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step ni multilingüismo, al tratarse de un modelo de vídeo.

## Casos de uso

- Restauración y reescalado de material de archivo: el modelo permite llevar vídeo rodado a baja resolución (por ejemplo, 1280x704) hasta 2560x1408 en una GPU de 16 GB, lo que facilita digitalizar y mejorar metraje antiguo sin infraestructura de clúster.
- Postproducción en estaciones de trabajo con RTX 4090 o similares: con la variante W6A8 (4,2 GB de pesos) y un pico de VRAM que cabe en un límite de 13,5 GiB, se puede integrar el upscaling en un flujo de ComfyUI junto con otros nodos sin agotar la memoria.
- Generación de contenido para redes sociales y streaming: clips de 3 segundos se procesan en torno a 22-23 segundos en una RTX 5090, lo que permite iterar rápidamente sobre material corto antes de publicarlo a resolución 2K.
- Mejora de vídeo generado por IA: los clips sintéticos de baja resolución (por ejemplo, salidas de modelos de vídeo) se pueden reescalar a 4x para su uso en presentaciones o demos, aprovechando que el modelo base está construido sobre Wan 2.2.
- Investigación en superresolución de vídeo: la disponibilidad de tres niveles de cuantización con deriva de PSNR documentada (53,1 / 47,0 / 44,3 dB) permite estudiar el compromiso entre precisión y memoria en pipelines de difusión.
- Despliegue en entornos con VRAM limitada: la variante W4A8 (3,0 GB de pesos) cabe en un límite de 13,0 GiB, lo que la hace adecuada para tarjetas de 16 GB que también deban ejecutar el contexto CUDA y el escritorio.
- Pruebas comparativas de calidad: al incluir `flash.safetensors` byte a byte idéntico al original, se puede comparar la salida cuantizada con la de referencia en el mismo repositorio.

## Benchmarks y rendimiento

Los datos disponibles son mediciones del autor en una única RTX 5090, con un clip de 3 s (73 fotogramas) de MiniMax-H3, entrada 1280x704 y salida 2560x1408, preset `faithful` y sin offload en los tiers cuantizados.

| Tarjeta | Archivo Wan | Tamano | Tier VRAM | Pico VRAM | Tiempo por clip de 3 s | Deriva vs. precision completa (PSNR) |
|---|---|---|---|---|---|---|
| 32 GB | `wan.safetensors` (original) | 10,1 GB | Precisión completa con offload de bloques Wan | 27,9 GB | 28,4 s | — |
| 24 GB+ | `wan_int8_convrot.safetensors` | 5,2 GB | int8 ConvRot + KV int8 | 21,8 GB | 22,0 s | 53,1 dB |
| 16 GB | `wan_w6a8.safetensors` | 4,2 GB | W6A8 + KV int4 | Cabe en límite de 13,5 GiB | 23,0 s | 47,0 dB |
| 16 GB (más margen) | `wan_w4a8.safetensors` | 3,0 GB | W4A8 + KV int4 | Cabe en límite de 13,0 GiB | 22,8 s | 44,3 dB |

Según el autor, por encima de ~45 dB la diferencia es invisible. En cinco clips de 3 s evaluados contra ground truth (2x desde media resolución), todos los tiers obtuvieron la misma puntuación que la precisión completa: 35,9-36,0 dB global y 34,3-34,5 dB en un recorte de bigote. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, al no ser un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: 27,9 GB en precisión completa; 21,8 GB con int8; los tiers de 16 GB caben en límites de 13,5 GiB (W6A8) y 13,0 GiB (W4A8).
- GPU recomendadas: RTX 5090 para las mediciones publicadas; tarjetas de 24 GB o más (RTX 4090, A100 40 GB, etc.) para la variante int8; tarjetas de 16 GB para W6A8 y W4A8.
- Cabe en GPU de consumo: sí, en tarjetas de 16 GB y 24 GB con las variantes cuantizadas; la versión completa requiere 32 GB.
- Opciones de despliegue: exclusivamente a través del worker RelayVSR de la extensión ComfyUI-MAINodes, que ejecuta RelayVSR mediante LightX2V en su propio entorno Python. Los tensores cuantizados no están en el layout de cuantización nativo de LightX2V, por lo que no cargan fuera de MAINodes.
- Latencia y throughput: 22,0-23,0 s por clip de 3 s (73 fotogramas) en una RTX 5090 para las variantes cuantizadas, frente a 28,4 s en precisión completa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolución | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RelayVSR-X4-Quants (esta release) | no disponible | Salida hasta 2560x1408 desde 1280x704 | 22,0-23,0 s por clip de 3 s en RTX 5090 (cuantizado) | Apache-2.0 | Hugging Face, requiere ComfyUI-MAINodes |
| RelayVSR X4 original (kopper/RelayVSR) | no disponible | Salida hasta 2560x1408 | 28,4 s por clip de 3 s en RTX 5090; pico 27,9 GB | Apache-2.0 (según el proyecto) | Hugging Face |
| RelayVSR_X2 (lightx2v/RelayVSR_X2) | no disponible | Salida 2x nativa | no disponible | no disponible | Hugging Face |
| FlashVSR | no disponible | Superresolución de vídeo | no disponible | no disponible | GitHub |

La comparativa se limita a las variantes del mismo modelo base y a FlashVSR, del que no se dispone de datos de rendimiento en la información proporcionada. No se dispone de comparación con otros modelos de superresolución de vídeo de la misma categoría.

## Limitaciones y advertencias

- Los pesos cuantizados solo cargan a través del worker RelayVSR de ComfyUI-MAINodes; no son compatibles con el layout de cuantización nativo de LightX2V ni con otras herramientas de inferencia.
- La licencia del repositorio original de pesos (kopper/RelayVSR) no está declarada; el autor de esta release indica que, si los autores originales publican otros términos para los pesos, esos prevalecen sobre la Apache-2.0 aplicada aquí.
- La deriva de calidad es medible: 53,1 dB (int8), 47,0 dB (W6A8) y 44,3 dB (W4A8) respecto a precisión completa; aunque el autor considera invisible la diferencia por encima de ~45 dB, la variante W4A8 está por debajo de ese umbral.
- La memoria está dominada por la caché KV y depende de la resolución, no de la longitud del clip; no se documenta comportamiento con resoluciones mayores o clips más largos.
- Las mediciones proceden de una única GPU (RTX 5090) y de clips de prueba concretos; el rendimiento en otras GPU o con otro contenido puede variar.
- No se documentan sesgos, riesgos de alucinación visual ni limitaciones idiomáticas, al no ser un modelo lingüístico; no obstante, como modelo generativo de vídeo, puede introducir artefactos o detalles inventados en las frames generadas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una release reciente y sin validación comunitaria amplia.
- El tamaño del repo es de 12,6 GB, ya que incluye las tres variantes cuantizadas más `flash.safetensors`; conviene descargar solo el archivo Wan correspondiente a la tarjeta.

## Enlaces

- Hugging Face (esta release): https://huggingface.co/MATLOWAI/RelayVSR-X4-Quants
- Pesos originales: https://huggingface.co/kopper/RelayVSR
- Repositorio del modelo original (código, paper, project page, demo): https://github.com/kopperx/RelayVSR
- Paper: https://arxiv.org/abs/2609.37850
- Project page: https://kopperx.github.io/RelayVSR/
- Extensión ComfyUI-MAINodes: https://github.com/matlowai/ComfyUI-MAINodes
- Documentación de los nodos RelayVSR: https://github.com/matlowai/ComfyUI-MAINodes/blob/main/relayvsr/README.md
- LightX2V (motor de inferencia): https://github.com/ModelTC/LightX2V
- Wan 2.2: https://github.com/Wan-Video/Wan2.2
- FlashVSR: https://github.com/OpenImagingLab/FlashVSR
- comfy-kitchen (kernels de cuantización): https://github.com/Comfy-Org/comfy-kitchen
- RelayVSR_X2 (retrain nativo 2x del equipo LightX2V): https://huggingface.co/lightx2v/RelayVSR_X2
- Checksums: https://huggingface.co/MATLOWAI/RelayVSR-X4-Quants/blob/main/SHA256SUMS
