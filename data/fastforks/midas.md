# fastforks/midas

## Resumen

MiDaS v3.1 es un modelo de estimación de profundidad monocular relativa desarrollado por Birkl et al. (Intel ISL) y publicado en 2023 junto con el paper arXiv 2307.14460. Combina un codificador BEiT-L/16 con un decodificador DPT para producir mapas de profundidad inversa a partir de una única imagen RGB, sin necesidad de calibración de cámara ni de datos estéreo. El repositorio `fastforks/midas` no aloja pesos: es una model card que documenta la integración del modelo original en la librería `fastforks`, con verificación de integridad mediante SHA-256 y kernels CUDA propios.

La relevancia de esta ficha radica en que `fastforks` actúa como capa de empaquetado reproducible sobre el checkpoint oficial `dpt_beit_large_512.pt`, ofreciendo dos backends (`portable` en PyTorch puro y `kernels` con CUDA optimizado) y manteniendo paridad numérica con el código original. El modelo está etiquetado como "experimental" por el propio autor del fork y su licencia de pesos no está declarada de forma explícita por los autores originales, lo que condiciona su uso comercial.

El modelo resuelve el problema de la percepción de profundidad densa a partir de una sola vista, una tarea fundamental en robótica, realidad aumentada, reconstrucción 3D y edición de imágenes. Su encoder BEiT-L/16 le proporciona una capacidad de representación considerable, y el decodificador DPT permite generar mapas de alta resolución con un coste computacional moderado en GPU consumer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BEiT-L/16 (encoder ViT) + DPT (decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada H x W >= 8) |
| Tipos de cuantizacion | fp32, fp16 (soportados en los backends documentados) |
| Idiomas soportados | no aplica (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Código MIT; pesos sin licencia declarada por los autores (`mit-code-weights-unstated`) |
| Formato de pesos | `.pt` (PyTorch, checkpoint original de los autores) |

## Arquitectura y entrenamiento

MiDaS v3.1 emplea una arquitectura híbrida compuesta por un encoder BEiT-L/16, un transformer de visión con parches de 16x16 píxeles, y un decodificador DPT (Dense Prediction Transformer) que reconstruye mapas densos de profundidad a partir de los tokens del encoder. El modelo produce profundidad inversa relativa (`inverse_depth`), es decir, valores proporcionales a 1/z, y no profundidad métrica absoluta. La entrada admite cualquier resolución H x W mayor o igual a 8 píxeles, con redimensionado o padding interno hasta la resolución de trabajo del modelo (512 en la variante `midas-dpt-beit-large-512`).

El entrenamiento se realizó sobre una mezcla de 12 datasets de profundidad según el paper de MiDaS v3.1: ReDWeb, DIML, Movies, MegaDepth, WSVD, TartanAir, HRWSI, ApolloScape, BlendedMVS, IRS, KITTI y NYU Depth V2. Esta combinación de datos sintéticos, estéreo, multi-vista y datasets con ground truth de sensores permite al modelo generalizar a dominios diversos. No se documenta en la información disponible el uso de RLHF, DPO ni fases de alineación, algo esperable en un modelo de regresión densa. La innovación técnica destacable del fork `fastforks` es la implementación de kernels CUDA propios (`cudnn_hacc`) que aceleran la inferencia hasta 5,2x frente al código original en fp32 y 1,2x frente al backend portable, manteniendo una diferencia media inferior al 0,5 % respecto a la referencia.

## Capacidades

- Estimación de profundidad monocular relativa a partir de una única imagen RGB.
- Generación de mapas de profundidad inversa (`inverse_depth`) en formato tensor float32 de forma [H, W].
- Acepta resoluciones de entrada arbitrarias (H x W >= 8), con redimensionado o padding interno.
- Soporte de dos backends: `portable` (PyTorch puro, GPU o CPU) y `kernels` (kernels CUDA precompilados por arquitectura de GPU).
- Verificación de integridad de pesos mediante SHA-256 contra el checkpoint oficial de los autores.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.
- No dispone de modo "thinking", visión adicional, audio ni generación de texto.

## Casos de uso

- Reconstrucción 3D y fotogrametría: el modelo genera mapas de profundidad densa por imagen que, combinados con las intrínsecas de cámara, permiten generar nubes de puntos y mallas en pipelines de reconstrucción multi-vista. Es adecuado por su resolución de salida densa y su robustez en escenas diversas.
- Realidad aumentada en dispositivos: la estimación de profundidad monocular permite ocluir objetos virtuales con geometría real sin necesidad de sensores LiDAR, usando el backend `kernels` para inferencia de baja latencia (52 ms a 640x480 en RTX 5060 Ti).
- Robótica móvil y navegación: la profundidad relativa sirve para evitar obstáculos y estimar distancias relativas en tiempo real; el modelo procesa imágenes de hasta 12 MP con un pico de memoria de aproximadamente 1 GiB en modo `kernels`.
- Edición fotográfica y desenfoque sintético: la máscara de profundidad permite aplicar efectos de bokeh, reiluminación o sustitución de fondos de forma selectiva por distancia.
- Preprocesado para modelos generativos: los mapas de profundidad de MiDaS se usan habitualmente como condicionamiento en pipelines de difusión (ControlNet, por ejemplo) para generar imágenes con estructura geométrica coherente.
- Automoción y ADAS: estimación de profundidad para detección de obstáculos y análisis de escena en vehículos, aprovechando el entrenamiento del modelo en datasets de conducción como KITTI y ApolloScape.
- Análisis de vídeo y seguimiento: la inferencia rápida por fotograma permite calcular profundidad en secuencias de vídeo para seguimiento de objetos y estimación de movimiento.

## Benchmarks y rendimiento

Resultados de precisión reportados en la model card, medidos tras un ajuste de escala y desplazamiento por mínimos cuadrados (en espacio de disparidad para modelos de profundidad inversa), media sobre imágenes:

| Variante | Dataset | Original | Portable | Kernels |
|---|---|---|---|---|
| `midas-dpt-beit-large-512` | NYUv2 test, AbsRel / delta1 | 0,0487 / 0,9789 | 0,0487 / 0,9789 | 0,0487 / 0,9789 |
| `midas-dpt-beit-large-512` | iBims-1, AbsRel / delta1 | 0,0477 / 0,9727 | 0,0478 / 0,9726 | 0,0478 / 0,9726 |
| `midas-dpt-beit-large-512` | ETH3D two-view train left, AbsRel / delta1 | 0,0904 / 0,8978 | 0,0906 / 0,8977 | 0,0908 / 0,8972 |
| `midas-dpt-beit-large-512` | Middlebury 2014 trainingH left, AbsRel / delta1 | 0,0425 / 0,9906 | 0,0424 / 0,9906 | 0,0425 / 0,9906 |

Resultados de velocidad y memoria en Middlebury 2014 half (994x1482), RTX 5060 Ti 16 GB, sm_120:

| Modelo | Tiempo original fp32 (ms) | Original (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | Aceleración kernels vs portable | Memoria pico original (MiB) | Portable (MiB) | Kernels (MiB) |
|---|---|---|---|---|---|---|---|---|---|
| `midas-dpt-beit-large-512` | 385,6 | 333,2 | 78,79 | 63,89 | 5,2x | 1,2x | 2759 / 2898 | 992 / 1418 | 1003 / 1436 |

Rendimiento a tamaño fijo (tiempo ms / memoria pico asignada / reservada en MiB):

| Modo | 640x480 | 1280x720 | 1920x1080 | 12 MP (4000x3000) |
|---|---|---|---|---|
| portable | 79,3 / 1729 / 1880 | 141,1 / 1870 / 2052 | 141,2 / 1883 / 2080 | 81,6 / 1863 / 1990 |
| kernels | 52,1 / 922 / 1048 | 96,0 / 1012 / 1220 | 96,0 / 1025 / 1280 | 53,1 / 1077 / 1178 |

Tiempos de carga y primera llamada:

| Modelo | Carga original (s) | Carga portable (s) | Carga kernels (s) | Primera llamada original (s) | Primera llamada portable (s) | Primera llamada kernels (s) |
|---|---|---|---|---|---|---|
| `midas-dpt-beit-large-512` | 5,16 | 2,49 | 0,28 | 1,14 | 0,09 | 0,07 |

Paridad numérica: en CPU con float32, diferencia máxima absoluta <= 0,02 frente al original; en GPU con float16, diferencia media <= 0,5 % y p99 <= 2 % respecto a la mediana de la referencia.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1 GiB de memoria pico en modo `kernels` y 1,7-1,9 GiB en modo `portable` para resoluciones de hasta 12 MP en fp16.
- GPU recomendadas: RTX 5060 Ti 16 GB (hardware de referencia de los benchmarks), RTX 4090, A100, H100. Cualquier GPU con soporte CUDA y al menos 2-3 GiB libres es suficiente.
- Cabe en GPU consumer: sí, en tarjetas con 4 GiB o más (GTX 1650, RTX 3050, RTX 4060, etc.). En CPU funciona el backend `portable`, con mayor latencia.
- Opciones de despliegue: la librería `fastforks` (`pip install fastforks`) es el método documentado. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: 52 ms a 640x480 y 96 ms a 1920x1080 en modo `kernels` sobre RTX 5060 Ti; 79 ms y 141 ms respectivamente en modo `portable`. El tiempo depende de la relación de aspecto, no del número de píxeles, porque el modelo redimensiona internamente a su resolución de trabajo.
- El backend `kernels` requiere un kernel precompilado para la arquitectura de GPU del usuario, descargado desde `fastforks/kernels` en el primer uso.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiDaS v3.1 (BEiT-L/16 + DPT) | no disponible | imagen H x W >= 8, resolución de trabajo 512 | AbsRel 0,0487 en NYUv2; 0,0477 en iBims-1 | Código MIT; pesos sin declarar | HuggingFace (card), GitHub isl-org/MiDaS |
| Depth Anything V2 | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible |
| ZoeDepth | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos verificables de benchmarks de modelos alternativos para establecer una comparación cuantitativa rigurosa. La comparativa se limita a la variante documentada de MiDaS v3.1 frente a su propio código original.

## Limitaciones y advertencias

- Profundidad relativa, no métrica: el modelo produce `inverse_depth` relativa; para obtener distancias absolutas se requiere un ajuste de escala y desplazamiento con datos de referencia o intrínsecas de cámara.
- Licencia de pesos no declarada: los autores originales no especifican una licencia separada para los pesos; la model card indica "MIT (assumed from code)" y califica el paquete como de uso en investigación. Es imprescindible verificar la licencia antes de cualquier uso comercial.
- Estado experimental: el propio fork etiqueta el modelo como "experimental" (tier: experimental), lo que desaconseja su uso en producción sin validación adicional.
- Riesgo de alucinación geométrica: como todo modelo monocular, puede producir profundidades plausibles pero incorrectas en superficies reflectantes, transparentes, texturas repetitivas o escenas fuera de la distribución de entrenamiento.
- Sesgos de dominio: el entrenamiento con 12 datasets inclina el modelo hacia escenas urbanas, interiores y conducción; el rendimiento puede degradarse en dominios muy distintos (submarino, microscopía, aéreo extremo).
- Sin capacidades de lenguaje ni multilingües: no procesa texto, por lo que no aplican consideraciones de idioma.
- Dependencia de kernels precompilados: el backend `kernels` requiere una arquitectura de GPU soportada y descarga de binarios en el primer uso; en arquitecturas no cubiertas hay que recurrir al backend `portable`.
- Sin datos de benchmarks frente a alternativas: no se han publicado en la información disponible resultados comparativos con otros modelos de profundidad monocular.

## Enlaces

- Model card en HuggingFace: https://huggingface.co/fastforks/midas
- Repositorio del fork: https://github.com/kleinicke/fastforks
- Kernels del backend: https://huggingface.co/fastforks/kernels
- Código original de MiDaS: https://github.com/isl-org/MiDaS (commit `4545977`)
- Licencia del código original: https://github.com/isl-org/MiDaS/blob/454597711a62eabcbf7d1e89f3fb9f569051ac9b/LICENSE
- Pesos oficiales: https://github.com/isl-org/MiDaS/releases/download/v3_1/dpt_beit_large_512.pt
- Paper MiDaS v3.1: https://arxiv.org/abs/2307.14460
- Documentación de benchmarks del fork: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Fichero de definición de la variante (card.toml): https://github.com/kleinicke/fastforks/blob/main/src/fastforks/depth/models/midas/card.toml
