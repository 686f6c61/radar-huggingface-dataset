# fastforks/boq

## Resumen

BoQ (Bag-of-Queries) es un modelo de extracción de características visuales orientado a recuperación de imágenes y, en particular, a reconocimiento visual de lugares (visual place recognition, VPR). Lo desarrollan Ali-bey, Chaib-draa y Giguère y se publicó en CVPR 2024. El repositorio `fastforks/boq` no aloja pesos: es una model card de integración que permite a la librería `fastforks` descargar los pesos originales del autor y verificarlos mediante SHA-256.

Arquitectura: parte de un DINOv2 ViT-B/14 preentrenado en LVD-142M, cuyos dos últimos bloques se afinan sobre GSV-Cities. Las características de parches se proyectan con una convolución 3x3, se refinan con dos capas de encoder transformer y se leen mediante dos conjuntos de 64 queries aprendidas con cross-attention. La salida es un descriptor global unitario de 12288 dimensiones, pensado para búsqueda por similitud coseno.

Es relevante porque ofrece un descriptor global compacto y de alta precisión para retrieval a gran escala, con implementaciones optimizadas (backend `portable` y backend `kernels` con CUDA propio) y métricas de latencia y memoria publicadas. La licencia del código y de los pesos es MIT, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv2 ViT-B/14 (últimos dos bloques afinados) + proyección 3x3 + 2 capas de encoder transformer + 2x64 queries con cross-attention + proyección a descriptor |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de una sola imagen; H x W >= 32, múltiplo de 32) |
| Tipos de cuantizacion | fp32 y fp16 (soportados en la implementación); no se documentan otras cuantizaciones |
| Idiomas soportados | no aplica (modelo de visión; sin capacidades lingüísticas) |
| Licencia | MIT (código y pesos) |
| Formato de pesos | `.pth` (PyTorch); pesos originales del autor, no alojados en el repo |

## Arquitectura y entrenamiento

El modelo es un transformer de visión (ViT) basado en DINOv2 ViT-B/14. Sobre las características de parches del ViT se aplica una proyección convolucional 3x3, seguida de dos capas de encoder transformer que refinan las representaciones. La agregación se realiza con dos conjuntos de 64 queries aprendidas mediante cross-attention (el mecanismo "bag-of-queries" que da nombre al modelo), y la salida se proyecta a un descriptor global de 12288 dimensiones con norma L2 unitaria.

El entrenamiento parte de DINOv2 ViT-B/14 preentrenado en LVD-142M (conjunto curado de imágenes web de DINOv2, no publicado). Los dos últimos bloques del ViT y el agregador se afinan sobre GSV-Cities, un conjunto de imágenes de Google Street View de 62.000 lugares en 40 ciudades, a resolución 320x320. No se documentan en la información disponible detalles sobre RLHF, DPO ni composición exacta del dataset de afinado más allá de GSV-Cities.

## Capacidades

- Extracción de descriptores globales de imagen para recuperación (image retrieval).
- Reconocimiento visual de lugares (visual place recognition) con protocolo estándar de recall a 25 m.
- Búsqueda por similitud coseno con top-k exacto en GPU (`fastforks.retrieval.top_k` y `pairs`).
- Entrada de una imagen RGB de cualquier tamaño H x W >= 32, con padding a múltiplo de 32; probado hasta 3000x4000 en fp16.
- Ejecución en fp32 y fp16, con backend `portable` (PyTorch) y backend `kernels` (kernels CUDA propios `fastbb` y `dpt_fused`).
- Compatibilidad con `torch.compile` y TensorRT (fp16) según las mediciones publicadas.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual de extracción de características.

## Casos de uso

- Reconocimiento visual de lugares en vehículos y robots: el descriptor global de 12288 dimensiones permite comparar la imagen actual con una base de datos de lugares conocidos mediante similitud coseno, con recall@1 del 99,86 % en St Lucia según las métricas publicadas.
- Localización y geolocalización de imágenes: dado un conjunto de imágenes georreferenciadas, el modelo genera descriptores que permiten encontrar la imagen de base de datos más cercana y estimar la posición.
- Búsqueda visual inversa en catálogos: indexar un catálogo de productos o imágenes y recuperar los más similares a una consulta, aprovechando el top-k exacto en GPU.
- Deduplicación y clustering de imágenes: agrupar imágenes visualmente similares (por ejemplo, fotos de un mismo lugar tomadas en momentos distintos) usando la similitud entre descriptores.
- SLAM y navegación visual: integración como módulo de reconocimiento de lugar en pipelines de localización y mapeo, con latencia de 2,84 ms por imagen a 480x640 en el backend `kernels`.
- Moderación y verificación de contenido visual: comparar imágenes contra una base de referencia para detectar duplicados o contenido reutilizado, con verificación de integridad de pesos por SHA-256.
- Procesamiento de imágenes de alta resolución: al aceptar entradas de hasta 3000x4000 en fp16 con 0,6 GiB de memoria pico, es adecuado para imágenes de cámaras de alta resolución en producción.

## Benchmarks y rendimiento

Precisión en el conjunto público St Lucia (recall@1 / @5 % a 25 m):

| Variante | Consultas | Original fp32 | Original fp16 | Portable | Kernels |
|---|---|---|---|---|---|
| `boq-dinov2` | 1464 (todas) contra 1549 imágenes | 99,86 / 100,00 | no disponible | 99,86 / 100,00 | 99,86 / 100,00 |
| `boq-dinov2` | 293 (cada 5ª) contra 1549 imágenes | 99,66 / 100,00 | 99,66 / 100,00 | 99,66 / 100,00 | 99,66 / 100,00 |

Latencia y memoria en retrieval sintético a 480x640 (RTX 5060 Ti 16 GB):

| Modelo | Tiempo original (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | Memoria pico (MiB, alloc/reserved) |
|---|---|---|---|---|---|
| `boq-dinov2` | 7,44 | 5,73 | 2,84 | 2,6x | 231/256 (portable), 227/256 (kernels) |

Otras mediciones: `torch.compile` 3,89 ms; TensorRT fp16 2,73 ms; compilación en frío 11,8 s; construcción ONNX + engine 46,4 s. Paridad con el código original: en CPU fp32, diferencia máxima <= 1e-05; en GPU fp16, diferencia media <= 2,6 % y p99 <= 8,6 % respecto a la mediana de referencia.

## Requisitos de hardware

- VRAM estimada: alrededor de 0,25 GiB de memoria pico en inferencia a 480x640 (231 MiB asignados, 256 MiB reservados); 0,6 GiB pico probado con entrada 3000x4000 en fp16.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; las mediciones publicadas se hicieron en una RTX 5060 Ti 16 GB (sm_120). Para el backend `kernels` se requiere CUDA.
- Cabe en GPU de consumo: sí, con margen amplio; una RTX 5060 Ti de 16 GB es suficiente y GPUs con menos VRAM también deberían bastar por el bajo consumo de memoria.
- Opciones de despliegue: librería `fastforks` (backend `portable` en PyTorch o backend `kernels` con CUDA), `torch.compile` y TensorRT fp16.
- Latencia y throughput: 2,84 ms por imagen a 480x640 con kernels (2,6x frente al original); 2,73 ms con TensorRT fp16. Tiempo de carga 0,24 s (portable) y 1,09 s (kernels); primera llamada 0,23 s (portable) y 0,13 s (kernels).

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de otros modelos comparables (por ejemplo, NetVLAD, CosPlace o MixVPR) para establecer una comparativa con cifras. La model card solo compara el modelo consigo mismo en distintas implementaciones (original, portable, kernels, torch.compile y TensorRT).

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BoQ (`boq-dinov2`) | no disponible | no aplica (imagen) | recall@1 99,86 % en St Lucia | MIT | pesos en el repo del autor; integración en `fastforks` |
| Alternativas (NetVLAD, CosPlace, MixVPR) | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un modelo de visión: no genera texto, no razona y no soporta tool calling ni agentes.
- El repositorio no aloja pesos; la disponibilidad depende de los enlaces del autor y de la verificación SHA-256 de `fastforks`.
- El backend `kernels` requiere CUDA y kernels propios; el backend `portable` es la opción para otros entornos.
- En GPU fp16 la salida no es idéntica a la referencia fp32: diferencia media de hasta el 2,6 % y p99 de hasta el 8,6 % respecto a la mediana de referencia.
- El rendimiento se ha validado en un conjunto limitado (St Lucia) y con un protocolo concreto (25 m); no hay datos publicados de otros conjuntos en la información disponible.
- El entrenamiento usa GSV-Cities (imágenes de Google Street View) y LVD-142M, cuyos términos de uso originales conviene revisar aunque la licencia declarada del modelo sea MIT.
- Riesgo de sesgo por la composición de los datos de entrenamiento (imágenes web y de Street View de 40 ciudades), con posible menor generalización a dominios visuales distintos.
- La licencia del código original se registra tal cual (paquete de uso de investigación); conviene comprobarla antes de usos distintos del comercial declarado.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/boq
- Repositorio de la librería `fastforks`: https://github.com/kleinicke/fastforks
- Kernels del backend `kernels`: https://huggingface.co/fastforks/kernels
- Código original de Bag-of-Queries (commit `1a4965ea7dfd`): https://github.com/amaralibey/Bag-of-Queries
- Pesos originales `dinov2_12288.pth`: https://github.com/amaralibey/Bag-of-Queries/releases/download/v1.0/dinov2_12288.pth
- Licencia del código original: https://github.com/amaralibey/Bag-of-Queries/blob/1a4965ea7dfd9bd0dd846adf7a0e430f68101d12/LICENSE
- Release v1.0 de los pesos: https://github.com/amaralibey/Bag-of-Queries/releases/tag/v1.0
- Documentación de benchmarks de `fastforks`: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Fichero `card.toml` con hashes SHA-256 completos: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/retrieval/models/boq/card.toml
