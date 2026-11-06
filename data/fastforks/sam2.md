# fastforks/sam2

## Resumen

SAM 2.1 (Segment Anything Model 2.1) es un modelo de segmentación de imágenes promptable desarrollado por Meta AI (Ravi et al. 2024). Este repositorio concreto, `fastforks/sam2`, es una model card publicada por el proyecto fastforks que describe la integración del modelo en su librería de inferencia portátil; no aloja pesos, sino que documenta las variantes oficiales, sus hashes SHA-256 y el rendimiento de los backends `portable` y `kernels`. El modelo resuelve el problema de la segmentación guiada por prompt: dada una imagen y una indicación (punto, caja o logits de máscara), devuelve máscaras con puntuaciones de calidad (IoU).

La arquitectura combina un codificador de imagen jerárquico Hiera, un cuello FPN y el codificador de prompt y decodificador de máscara de SAM con características de salto de alta resolución. En esta variante "image mode" no interviene la memoria de vídeo del SAM 2 completo: es segmentación de imagen pura. Existen cuatro variantes de tamaño (tiny, small, base-plus y large) bajo licencia Apache-2.0, lo que las hace aptas para uso comercial.

Su relevancia actual reside en que ofrece segmentación de alta calidad con latencias muy bajas (13-68 ms por imagen en una RTX 5060 Ti) y un consumo de memoria moderado (300-760 MiB en fp16), lo que permite desplegarla en GPU de consumo. El proyecto fastforks añade además kernels optimizados que aceleran la inferencia entre 1,2x y 1,4x respecto al código original en fp32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer jerárquico Hiera (codificador de imagen) + FPN + codificador de prompt y decodificador de máscara de SAM con skip features de alta resolución |
| Parametros totales | no disponible (cuatro variantes: tiny, small, base-plus, large) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen redimensionada a 1024x1024) |
| Tipos de cuantizacion | fp16 (por defecto en GPU), fp32 (CPU y referencia); no se documentan otras |
| Idiomas soportados | no disponible (modelo de visión; el prompt de texto se menciona pero no se detalla su soporte lingüístico) |
| Licencia | Apache-2.0 (código y checkpoints) |
| Formato de pesos | `.pt` (PyTorch); los pesos no se alojan en este repositorio |
| Pipeline | mask-generation |
| Tarea | promptable_segmentation |
| Salidas | `pred_masks`, `iou_scores` |
| Backends | `portable`, `kernels` |
| Entrada | una imagen más un prompt de punto, caja o texto |
| Tamaño de entrada | cualquier H x W >= 1, redimensionada internamente a 1024x1024 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de SAM 2 en su modo imagen. El codificador de imagen es una red Hiera jerárquica que extrae características multiescala; un cuello FPN las fusiona y el decodificador de máscara de SAM, junto con el codificador de prompt, genera las máscaras finales a partir de puntos, cajas o logits de máscara, apoyándose en características de salto de alta resolución para preservar el detalle de los bordes. En esta variante no hay memoria de vídeo: el módulo `module()` portable corresponde únicamente al codificador de imagen.

Los datos de entrenamiento, según el paper original, son SA-1B y el conjunto de vídeo SA-V, más datos internos. SA-V se distribuye bajo CC BY 4.0 y SA-1B bajo su licencia de investigación. No se detallan en la información disponible el número de tokens ni la composición exacta del dataset, ni si hubo etapas de RLHF o DPO (no aplica habitualmente a modelos de segmentación). La innovación destacable del proyecto fastforks es la implementación de kernels optimizados para el backend `kernels`, que reducen el tiempo de inferencia entre 1,2x y 1,4x frente al backend `portable` y hasta 4x frente al código original en fp32.

## Capacidades

- Segmentación promptable de imagen: genera máscaras a partir de puntos, cajas o logits de máscara.
- Puntuación de calidad de máscara mediante `iou_scores`.
- Generación de máscaras en modo imagen (sin memoria de vídeo).
- Procesamiento de imágenes de cualquier resolución, redimensionadas internamente a 1024x1024.
- Soporte de prompt de texto mencionado en la model card (sin detalle sobre idiomas).
- Dos backends de inferencia: `portable` (portabilidad) y `kernels` (rendimiento optimizado en CUDA).
- Verificación de integridad de pesos mediante SHA-256 contra los ficheros oficiales de Meta.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).

## Casos de uso

- Segmentación interactiva en herramientas de edición de imagen: el usuario hace clic en un punto o dibuja una caja y el modelo devuelve la máscara del objeto con una puntuación de calidad, con latencias de 13-68 ms que permiten retroalimentación en tiempo real.
- Extracción automática de recortes (matting) en pipelines de producción: con `sam2.1-hiera-small` o `tiny` se procesan imágenes a 1920x1080 en menos de 20 ms con unos 300 MiB de memoria, adecuado para procesamiento por lotes en GPU de consumo.
- Anotación asistida de datasets de visión: el modelo genera máscaras candidatas a partir de cajas o puntos que un anotador humano corrige, reduciendo el coste de etiquetado en proyectos de detección y segmentación.
- Preprocesado para modelos downstream: generar máscaras de objetos para aislar regiones antes de tareas de clasificación, OCR o análisis médico, aprovechando la preservación de bordes de las skip features de alta resolución.
- Segmentación en aplicaciones de realidad aumentada o vídeo en tiempo casi real: al no usar memoria de vídeo, se puede aplicar fotograma a fotograma con el backend `kernels` a ~49 ms por imagen en la variante large.
- Despliegue en entornos con memoria limitada: las variantes tiny y small caben en GPU de 8 GB o menos (304-330 MiB de pico en fp16 a 1024x1024), lo que permite ejecutar el modelo junto con otros componentes en la misma GPU.
- Verificación de integridad en pipelines MLOps: el proyecto comprueba los pesos descargados contra hashes SHA-256, útil en entornos regulados donde se exige trazabilidad de los artefactos.

## Benchmarks y rendimiento

Rendimiento de segmentación promptable sobre imagen sintética a 1024x1024 (RTX 5060 Ti 16 GB, sm_120):

| Modelo | Tiempo original fp32 (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs portable | Memoria pico portable (MiB asignada/reservada) | Memoria pico kernels (MiB asignada/reservada) |
|---|---|---|---|---|---|---|
| `sam2.1-hiera-base-plus` | 102,2 | 31,98 | 25,09 | 1,3x | 426 / 524 | 412 / 464 |
| `sam2.1-hiera-large` | 243,1 | 67,99 | 48,81 | 1,4x | 760 / 828 | 742 / 768 |
| `sam2.1-hiera-small` | 68,5 | 18,76 | 15,56 | 1,2x | 330 / 386 | 318 / 366 |
| `sam2.1-hiera-tiny` | 61,3 | 16,63 | 13,91 | 1,2x | 316 / 362 | 304 / 382 |

Tiempo de carga y primera llamada (segundos):

| Modelo | Carga original | Carga portable | Carga kernels | Primera llamada original | Primera llamada portable | Primera llamada kernels |
|---|---|---|---|---|---|---|
| `sam2.1-hiera-base-plus` | 0,53 | 0,43 | 0,19 | 0,10 | 0,03 | 0,03 |
| `sam2.1-hiera-large` | 2,92 | 1,10 | 0,39 | 0,24 | 0,07 | 0,05 |
| `sam2.1-hiera-small` | 0,32 | 0,36 | 0,13 | 0,07 | 0,02 | 0,02 |
| `sam2.1-hiera-tiny` | 0,41 | 0,25 | 0,11 | 0,13 | 0,02 | 0,01 |

Rendimiento a tamaños fijos (tiempo ms / memoria pico asignada / reservada en MiB):

| Modelo | Modo | 640x480 | 1280x720 | 1920x1080 |
|---|---|---|---|---|
| `sam2.1-hiera-base-plus` | portable | 32,0 / 395 / 540 | 31,9 / 402 / 558 | 32,1 / 415 / 568 |
| `sam2.1-hiera-base-plus` | kernels | 25,1 / 408 / 472 | 25,1 / 415 / 490 | 25,3 / 428 / 472 |
| `sam2.1-hiera-large` | portable | 68,2 / 724 / 936 | 68,6 / 732 / 948 | 68,3 / 745 / 954 |
| `sam2.1-hiera-large` | kernels | 48,7 / 742 / 824 | 48,7 / 750 / 836 | 49,0 / 763 / 842 |
| `sam2.1-hiera-small` | portable | 18,7 / 298 / 420 | 19,1 / 305 / 422 | 18,9 / 319 / 426 |
| `sam2.1-hiera-small` | kernels | 15,4 / 310 / 356 | 15,5 / 317 / 358 | 15,6 / 331 / 346 |
| `sam2.1-hiera-tiny` | portable | 16,7 / 285 / 410 | 16,6 / 292 / 410 | 16,8 / 305 / 426 |
| `sam2.1-hiera-tiny` | kernels | 13,8 / 296 / 346 | 13,8 / 304 / 346 | 14,0 / 317 / 346 |

Precisión: en CPU con float32, la diferencia máxima respecto al código original es <= 0,002; en GPU con float16, la diferencia media es <= 3 % y el p99 <= 15 % de la mediana del valor de referencia. No se han publicado resultados de benchmarks estándar (mIoU en COCO, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada en fp16 a 1024x1024: 304-316 MiB (tiny), 318-330 MiB (small), 412-426 MiB (base-plus), 742-760 MiB (large) de memoria pico asignada; la reservada llega a 828 MiB en large con el backend kernels.
- A 1080x1920 probado en RTX 5060 Ti 16 GB: 0,3 GiB pico (tiny y small), 0,4 GiB (base-plus), 0,7 GiB (large).
- GPU recomendadas: cualquier GPU CUDA con al menos 2 GB de VRAM para las variantes pequeñas; RTX 5060 Ti 16 GB es el hardware de referencia de los benchmarks. Para la variante large en producción con lotes grandes se recomienda RTX 4090, A100 o H100.
- Cabe en GPU de consumo: sí, todas las variantes caben en GPU con 8 GB o menos en fp16 para una sola imagen.
- Opciones de despliegue: librería fastforks con backends `portable` y `kernels`; el código original de Meta (`facebookresearch/sam2`) también está disponible como referencia.
- Latencia: 13,9-49 ms por imagen a 1024x1024 con kernels según variante; 16,6-68 ms con portable.
- Throughput estimado: aproximadamente 20-72 imágenes por segundo en una sola GPU RTX 5060 Ti según variante y backend (cálculo derivado de las latencias medidas, sin incluir solapamiento por lotes).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SAM 2.1 (este, vía fastforks) | 4 variantes (tiny a large) | imagen redimensionada a 1024x1024 | Apache-2.0 | pesos oficiales de Meta + integración fastforks | Segmentación promptable de imagen, sin memoria de vídeo en esta variante |
| SAM 2 original (modo vídeo) | mismas variantes | vídeo con memoria | Apache-2.0 | `facebookresearch/sam2` | Añade seguimiento temporal en vídeo |
| SAM 1 (Segment Anything) | ViT-B/L/H | imagen 1024x1024 | Apache-2.0 | Meta AI | Predecesor; sin arquitectura Hiera ni skip features mejoradas |
| Otros segmentadores promptables | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Este repositorio es solo una model card: no contiene pesos. La descarga y verificación de los ficheros oficiales corre a cargo del usuario.
- El modo descrito es únicamente imagen; no incluye la memoria de vídeo del SAM 2 completo, por lo que no sirve para seguimiento temporal de objetos en secuencias.
- No se documentan sesgos específicos del modelo en la información disponible; como modelo entrenado con SA-1B y SA-V, puede heredar los sesgos de representación de dichos datasets.
- Riesgo de alucinación de máscaras: como todo segmentador promptable, puede generar máscaras plausibles pero incorrectas ante prompts ambiguos; las puntuaciones `iou_scores` deben usarse como filtro de confianza.
- La model card advierte que el paquete de código original es de uso de investigación y recomienda revisar las cadenas de licencia antes de otros usos, aunque los checkpoints se declaran Apache-2.0.
- SA-1B se distribuye bajo licencia de investigación, lo que puede condicionar el uso comercial derivado de datos entrenados con él según jurisdicción.
- El soporte de prompt de texto se menciona pero no se detalla su alcance ni los idiomas cubiertos.
- El rendimiento medido corresponde a una RTX 5060 Ti 16 GB (sm_120); en otras GPU los tiempos y la memoria pueden variar.
- No se han publicado métricas de calidad de segmentación (mIoU, etc.) en la información disponible, solo paridad numérica con el código original.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/sam2
- Repositorio del proyecto fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend: https://huggingface.co/fastforks/kernels
- Código original de SAM 2 (Meta): https://github.com/facebookresearch/sam2
- Commit de referencia del código original: `2b90b9f`
- Pesos oficiales SAM 2.1 (base-plus): https://dl.fbaipublicfiles.com/segment_anything_2/092824/sam2.1_hiera_base_plus.pt
- Pesos oficiales SAM 2.1 (large): https://dl.fbaipublicfiles.com/segment_anything_2/092824/sam2.1_hiera_large.pt
- Pesos oficiales SAM 2.1 (small): https://dl.fbaipublicfiles.com/segment_anything_2/092824/sam2.1_hiera_small.pt
- Pesos oficiales SAM 2.1 (tiny): https://dl.fbaipublicfiles.com/segment_anything_2/092824/sam2.1_hiera_tiny.pt
- Documentación de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Fichero de hashes y variantes: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/promptable_segmentation/models/sam2/card.toml
- Evidencia de licencia (README de Meta): https://github.com/facebookresearch/sam2/blob/main/README.md
