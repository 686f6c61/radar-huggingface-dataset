# fastforks/lightglue

## Resumen

LightGlue es un emparejador de características dispersas (sparse feature matching) publicado originalmente por Philipp Lindenberger, Paul-Edin Sarlin y Marc Pollefeys en 2023. El paquete `fastforks/lightglue` que nos ocupa es una reimplementación de inferencia empaquetada por el proyecto fastforks: no contiene pesos propios, sino que descarga los pesos de los autores originales y los verifica mediante SHA-256. El modelo recibe dos imágenes RGB de una misma escena y devuelve los keypoints detectados en cada una, los pares de índices emparejados y una puntuación de confianza por emparejamiento.

Técnicamente, LightGlue combina un detector-descriptor de keypoints (ALIKED o DISK) que extrae hasta 2048 puntos por imagen a un lado largo de 1024 píxeles, con un transformer que aplica self-attention y cross-attention sobre los descriptores para resolver el emparejamiento. El transformer incorpora profundidad adaptativa y poda de puntos (point pruning), de modo que las imágenes con pocos keypoints o emparejamientos fáciles se resuelven con menos capas y, por tanto, con menor coste computacional.

La relevancia actual del paquete radica en su empaquetado para producción: ofrece backends `portable` (PyTorch estándar) y `kernels` (kernels CUDA optimizados), benchmarks de latencia y memoria sobre una RTX 5060 Ti de 16 GB, y soporte de `torch.compile` y TensorRT (este último planificado para la versión 0.2.1). Está pensado para tareas de estructura-a-partir-del-movimiento (SfM), reconstrucción 3D, emparejamiento de imágenes y pipelines de visión por computador donde el emparejamiento de keypoints es un paso crítico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector-descriptor de keypoints (ALIKED o DISK) + transformer con self-attention y cross-attention, profundidad adaptativa y point pruning |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de cualquier H x W >= 32, rellenada a múltiplo de 32; probado hasta 3000x4000) |
| Tipos de cuantizacion | no disponible (inferencia en fp16 y fp32; no se documentan cuantizaciones enteras) |
| Idiomas soportados | no aplica (modelo de imagen, no lingüístico) |
| Licencia | Código: Apache-2.0 AND BSD-3-Clause. Pesos: Apache-2.0 AND BSD-3-Clause (uso comercial permitido según la model card) |
| Formato de pesos | `.pth` (PyTorch); los pesos no se alojan en el repo, se descargan de los enlaces de los autores y se verifican por SHA-256 |

## Arquitectura y entrenamiento

LightGlue sigue un esquema en dos etapas. Primero, un detector-descriptor local extrae hasta 2048 keypoints por imagen junto con sus descriptores; el paquete soporta dos variantes: ALIKED (variante `aliked-n16`) y DISK. Después, un transformer procesa conjuntamente ambos conjuntos de descriptores mediante capas de self-attention (dentro de cada imagen) y cross-attention (entre imágenes), refinando la representación de cada punto con el contexto del otro conjunto. La profundidad adaptativa permite detener la inferencia antes de tiempo cuando la confianza de los emparejamientos es suficiente, y el point pruning descarta puntos que no van a encontrar correspondencia, reduciendo el coste.

En cuanto al entrenamiento, según la model card: LightGlue se preentrenó con homografías sintéticas sobre las imágenes distractoras de Oxford-Paris 1M (procedentes de Flickr) y se afinó sobre MegaDepth. ALIKED y DISK se entrenaron sobre MegaDepth (colecciones de fotos de Internet con profundidad SfM/MVS). No se documentan en la información disponible el número de tokens, la composición exacta del dataset ni si se aplicó RLHF o DPO (no aplica en un modelo de visión de este tipo).

## Capacidades

- Emparejamiento de características dispersas entre dos imágenes de una misma escena.
- Detección y descripción de hasta 2048 keypoints por imagen con ALIKED o DISK.
- Salida estructurada: `keypoints1`, `keypoints2`, `pairs` (índices de emparejamientos) y `scores` (confianza por par).
- Profundidad adaptativa: menos capas cuando la escena es fácil de emparejar.
- Point pruning: descarte temprano de keypoints sin correspondencia probable.
- Backends `portable` (PyTorch) y `kernels` (kernels CUDA optimizados).
- Compatibilidad con `torch.compile` y con exportación a ONNX/TensorRT (TensorRT fp16 planificado para 0.2.1).
- Entrada de cualquier resolución H x W >= 32, rellenada a múltiplo de 32; probado hasta 3000x4000.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades lingüísticas: es un modelo puramente visual.

## Casos de uso

- Reconstrucción 3D y estructura a partir del movimiento (SfM): el modelo proporciona los emparejamientos de keypoints entre pares de imágenes que alimentan el pipeline de estimación de poses de cámara; la model card remite explícitamente al módulo `sfm` de fastforks para este flujo.
- Emparejamiento de imágenes para fotogrametría: con soporte de entradas de hasta 3000x4000 y un pico de memoria de 1,5 GiB (ALIKED) o 2,2 GiB (DISK) en fp16, permite procesar fotografías de alta resolución en una GPU de consumo.
- Localización visual y relocalización: comparar una imagen consulta contra un mapa de referencias mediante keypoints y confianzas, útil en robótica y realidad aumentada.
- Costura de imágenes (image stitching) y panorámicas: los pares de keypoints y sus scores permiten estimar homografías entre tomas adyacentes.
- Seguimiento y verificación entre fotogramas: emparejar fotogramas consecutivos de vídeo para estimar movimiento de cámara o verificar correspondencias.
- Registro de imágenes médicas o de satélite (previa validación): el emparejamiento de keypoints sirve para alinear pares de imágenes de la misma escena captadas con sensores o ángulos distintos.
- Integración en pipelines de producción con latencias conocidas: 35,1 ms (ALIKED) y 52,1 ms (DISK) por par a 768x1024 con el backend `kernels` en una RTX 5060 Ti, lo que permite procesar decenas de pares por segundo.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks de precisión (MMLU, HumanEval, GSM8K, etc. no aplican). Sí publica métricas de latencia y memoria, que se reproducen a continuación.

Emparejamiento sintético a 768x1024 (RTX 5060 Ti 16 GB, sm_120):

| Modelo | Tiempo original (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | Memoria pico portable (MiB, alloc/reserved) | Memoria pico kernels (MiB, alloc/reserved) |
|---|---|---|---|---|---|---|
| `aliked-lightglue` | 41,8 | 40,6 | 35,1 | 1,2x | 1300 / 1404 | 1238 / 1324 |
| `disk-lightglue` | 117 | 116 | 52,1 | 2,2x | 1950 / 2398 | 736 / 778 |

Carga y primera llamada:

| Modelo | Carga original (s) | Carga portable (s) | Carga kernels (s) | Primera llamada original (s) | Primera llamada portable (s) | Primera llamada kernels (s) |
|---|---|---|---|---|---|---|
| `aliked-lightglue` | 1,49 | 0,17 | 1,46 | 0,73 | 0,79 | 0,90 |
| `disk-lightglue` | 1,43 | 0,20 | 0,57 | 0,64 | 0,63 | 0,30 |

`torch.compile` y TensorRT (768x1024):

| Modelo | Portable (ms) | Compile (ms) | TensorRT fp16 | Kernels (ms) | Preparación compile (s) | Memoria pico portable (MiB) | Memoria pico compile (MiB) | Memoria pico kernels (MiB) |
|---|---|---|---|---|---|---|---|---|
| `aliked-lightglue` | 40,6 | 29,5 | planificado 0.2.1 | 35,1 | 30,8 | 1300 / 1404 | 1653 / 1680 | 1238 / 1324 |
| `disk-lightglue` | 116 | 113 | planificado 0.2.1 | 52,1 | 21,4 | 1950 / 2398 | 1375 / 1502 | 736 / 778 |

La model card menciona además una sección de precisión sobre datasets públicos (MegaDepth-1500, con RANSAC de matriz esencial y AUC de error de rotación y dirección de traslación), pero el texto proporcionado se corta antes de mostrar los valores numéricos; por tanto, no se reproducen cifras de precisión.

## Requisitos de hardware

- VRAM estimada: en fp16, `aliked-lightglue` alcanza 1,5 GiB de pico asignado (2,0 GiB reservados) a 3000x4000; `disk-lightglue` alcanza 2,2 GiB asignados (2,9 GiB reservados) a la misma resolución.
- A 768x1024, el pico con backend `portable` es de 1300 MiB (ALIKED) y 1950 MiB (DISK); con backend `kernels` baja a 1238 MiB y 736 MiB respectivamente.
- GPU de referencia de los benchmarks: RTX 5060 Ti 16 GB (sm_120). Cabe holgadamente en cualquier GPU de consumo con al menos 4 GB de VRAM para resoluciones moderadas; para 3000x4000 conviene disponer de 8 GB o más.
- El backend `kernels` requiere CUDA; el backend `portable` funciona en PyTorch estándar (CPU o GPU).
- Opciones de despliegue: paquete `fastforks` (backends `portable` y `kernels`), exportación a ONNX y TensorRT (TensorRT fp16 planificado para 0.2.1), y `torch.compile` (reduce ALIKED de 40,6 a 29,5 ms con 30,8 s de compilación en frío).
- Latencia y throughput: 35,1 ms por par con `aliked-lightglue` y 52,1 ms con `disk-lightglue` usando `kernels` a 768x1024, lo que equivale a unos 28 y 19 pares por segundo respectivamente en la GPU de referencia.

## Comparativa con modelos similares

| Modelo | Tipo | Keypoints por imagen | Resolución de entrada | Latencia de referencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `fastforks/lightglue` (ALIKED) | Sparse matching | hasta 2048 | cualquiera >= 32, múltiplo de 32; probado 3000x4000 | 35,1 ms (768x1024, kernels) | Apache-2.0 AND BSD-3-Clause | Pesos en releases de los autores; paquete fastforks |
| `fastforks/lightglue` (DISK) | Sparse matching | hasta 2048 | ídem | 52,1 ms (768x1024, kernels) | Apache-2.0 AND BSD-3-Clause | ídem |
| LoFTR | Dense matching | no aplica (matcher denso) | según configuración de la card | no disponible en esta información | no disponible | mencionado en la model card como comparativa |
| DeDoDe | Dense matching | no aplica (matcher denso) | según configuración de la card | no disponible en esta información | no disponible | mencionado en la model card como comparativa |
| XFeat | Sparse matching | según configuración | según configuración | no disponible en esta información | no disponible | mencionado en la model card como comparativa |

La model card cita LoFTR, DeDoDe y XFeat como comparativas en su sección de precisión, pero el fragmento disponible no incluye los valores numéricos de AUC ni de error, por lo que no se puede completar una comparación cuantitativa de precisión.

## Limitaciones y advertencias

- El repositorio es solo la model card: no contiene pesos. La descarga y verificación por SHA-256 corre a cargo del paquete fastforks; sin acceso a los enlaces de los autores no hay modelo utilizable.
- Es un modelo puramente visual: no procesa texto, no soporta tool calling, agentes ni razonamiento multi-paso. Cualquier uso lingüístico queda fuera de su alcance.
- El emparejamiento depende de la calidad del detector-descriptor subyacente (ALIKED o DISK); escenas con texturas repetitivas, cambios extremos de iluminación o grandes oclusiones pueden degradar los resultados.
- La licencia se declara como "other" en los metadatos de Hugging Face, con remisión a la licencia del repositorio original. La model card indica Apache-2.0 AND BSD-3-Clause y uso comercial permitido, pero conviene verificar los ficheros `LICENSE` y `LICENSE-ALIKED` antes de cualquier uso en producción.
- El soporte de TensorRT fp16 está planificado para la versión 0.2.1, no disponible en la versión actual.
- El backend `kernels` requiere CUDA y está orientado a GPUs NVIDIA; en otros aceleradores solo está disponible el backend `portable`.
- Los benchmarks se han medido exclusivamente en una RTX 5060 Ti 16 GB (sm_120); el rendimiento en otras GPU puede diferir.
- No se han publicado en la información disponible cifras de precisión sobre MegaDepth-1500 ni comparativas numéricas con LoFTR, DeDoDe o XFeat.
- El paquete se marca como "experimental" en la model card, lo que desaconseja su uso en producción sin validación previa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/fastforks/lightglue
- Código del paquete fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend `kernels`: https://huggingface.co/fastforks/kernels
- Código original de LightGlue: https://github.com/cvg/LightGlue
- Licencia de LightGlue: https://github.com/cvg/LightGlue/blob/5a650c444718caffc2669dc0094cde908f42dd73/README.md#license
- Pesos ALIKED-LightGlue: https://github.com/cvg/LightGlue/releases/download/v0.1_arxiv/aliked_lightglue.pth
- Pesos ALIKED n16: https://raw.githubusercontent.com/Shiaoming/ALIKED/683d7c65197395c0b3f01ebe76e1084a27e73a65/models/aliked-n16.pth
- Pesos DISK-LightGlue: https://github.com/cvg/LightGlue/releases/download/v0.1_arxiv/disk_lightglue.pth
- Pesos DISK depth-save: https://raw.githubusercontent.com/cvlab-epfl/disk/8dc6d4d65b47210f629e21ad1fbfb56944b11696/depth-save.pth
- Licencia de ALIKED: https://github.com/Shiaoming/ALIKED/blob/683d7c65197395c0b3f01ebe76e1084a27e73a65/LICENSE
- Licencia de DISK: https://github.com/cvlab-epfl/disk/blob/8dc6d4d65b47210f629e21ad1fbfb56944b11696/LICENSE.txt
- Documentación de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Fichero `card.toml` con hashes completos: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/matching/models/lightglue/card.toml
