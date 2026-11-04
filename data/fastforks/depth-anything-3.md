# fastforks/depth-anything-3

## Resumen

Depth Anything 3 es un modelo de estimación de profundidad monocular desarrollado por ByteDance (Lin et al., 2025). Se construye sobre un backbone DINOv2 ViT con cabezas DPT y produce mapas de profundidad a partir de una única imagen RGB, además de salidas auxiliares como confianza, intrínsecos de cámara, máscara y máscara de cielo. Existe en varias variantes que cubren profundidad relativa (Mono), métrica (Metric) y profundidad multi-vista con cámara (Large, Giant), incluida una variante Giant alineada a métrica (Nested).

El repositorio `fastforks/depth-anything-3` no aloja pesos: es una model card que actúa como envoltorio de distribución. La librería `fastforks` descarga los pesos originales de los repositorios del autor y los verifica contra hashes SHA-256 registrados en la propia card. Ofrece dos backends de ejecución (`portable` y `kernels`) con kernels CUDA optimizados que reducen latencia y memoria de forma significativa frente a la implementación original.

La relevancia actual del modelo radica en su combinación de calidad de profundidad con un rendimiento medido en GPU de consumo: la variante Large procesa 1920x1080 en torno a 15 ms con el backend `kernels`, y el Giant de mayor calidad lo hace en unos 37 ms, con picos de memoria que caben en una RTX 5060 Ti de 16 GB. La licencia es mixta: las variantes Mono y Metric son Apache-2.0, mientras que Large, Giant y Nested son CC-BY-NC-4.0, lo que restringe el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ViT (DINOv2) con cabezas DPT para profundidad |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión por imagen, no de texto) |
| Tipos de cuantizacion | fp32 (original), fp16 (portable y kernels); no se documentan otras |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Mixta: Apache-2.0 (Mono, Metric) y CC-BY-NC-4.0 (Large, Giant, Nested); código Apache-2.0 |
| Formato de pesos | safetensors (descargados de los repos del autor, verificados por SHA-256) |

## Arquitectura y entrenamiento

El modelo emplea un backbone ViT de DINOv2 con parches de 14 píxeles y cabezas de decodificación DPT para producir mapas de profundidad. La entrada es una imagen RGB de cualquier resolución H x W >= 8, que se redimensiona o rellena internamente. Las variantes se distinguen por el tipo de salida: profundidad relativa (Mono), profundidad métrica (Metric), profundidad multi-vista con estimación de cámara (Large y Giant) y una variante Giant anidada alineada a métrica (Nested). Además de la profundidad, el modelo emite confianza, intrínsecos de cámara, máscara y máscara de cielo.

Según la model card, el entrenamiento utiliza exclusivamente conjuntos de datos académicos públicos y sigue un esquema de destilación profesor-alumno sobre datos multi-vista sintéticos y reales, conforme al paper de Lin et al. (2025). No se detalla el número de tokens ni la composición exacta del dataset, y no se documenta el uso de RLHF ni DPO, algo esperable en un modelo de visión. La innovación técnica destacable del envoltorio `fastforks` es la provisión de kernels CUDA específicos que aceleran la inferencia entre 1,6x y 2,2x respecto al backend portable y hasta 9,7x respecto a la implementación original en fp32.

## Capacidades

- Estimación de profundidad monocular a partir de una única imagen RGB.
- Salida de profundidad relativa (variantes Mono) o métrica (variantes Metric y Nested).
- Estimación de intrínsecos de cámara en las variantes Large y Giant (any-view depth with camera).
- Generación de mapas de confianza junto al mapa de profundidad.
- Segmentación de cielo mediante la salida `sky`.
- Salida de máscara (`mask`) para regiones válidas o de interés.
- Procesamiento de imágenes de cualquier resolución H x W >= 8, con redimensionado o padding interno.
- Dos backends de ejecución intercambiables: `portable` y `kernels` (CUDA optimizado).
- Verificación de integridad de pesos mediante SHA-256 en la descarga.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Reconstrucción 3D y fotogrametría: las variantes Large y Giant estiman profundidad y intrínsecos de cámara, lo que permite generar nubes de puntos y mallas a partir de imágenes individuales o multi-vista en pipelines de escaneo.
- Realidad aumentada y sustitución de fondo: la profundidad métrica de las variantes Metric permite colocar objetos virtuales con escala física coherente sobre la escena capturada por una cámara.
- Automoción y asistencia a la conducción: la profundidad métrica a 1920x1080 en torno a 15-26 ms con el backend `kernels` encaja en presupuestos de tiempo real para detección de obstáculos y estimación de distancias.
- Robótica móvil y navegación: la máscara de cielo y el mapa de confianza ayudan a filtrar regiones no fiables, mientras que la profundidad métrica alimenta la planificación de trayectorias en interiores y exteriores.
- Posproducción de vídeo y VFX: la profundidad por fotograma permite generar mapas de desenfoque, separación de capas y efectos de profundidad de campo en pipelines offline con GPU de consumo.
- Análisis de imágenes médicas o industriales: la salida de confianza y la máscara permiten descartar zonas de baja fiabilidad en tareas de medición dimensional o inspección.
- Generación de datasets sintéticos: el modelo puede etiquetar grandes volúmenes de imágenes con profundidad para entrenar otros modelos, usando las variantes Apache-2.0 (Mono, Metric) si se requiere uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (AbsRel, RMSE, δ1, etc.) en la información disponible. Los datos de rendimiento medidos que sí se proporcionan son de latencia y memoria:

| Modelo | Backend | 1920x1080 (ms) | Pico memoria (MiB, alloc/reserv) |
|---|---|---|---|
| da3-giant-1.1 | portable | 90,3 | 4943 / 5150 |
| da3-giant-1.1 | kernels | 36,7 | 2575 / 2886 |
| da3-large-1.1 | portable | 38,8 | 1651 / 1826 |
| da3-large-1.1 | kernels | 14,8 | 914 / 1108 |
| da3metric-large | portable | 26,0 | 1502 / 1600 |
| da3metric-large | kernels | 15,7 | 805 / no disponible |
| da3mono-large | portable | 23,9 (Middlebury 994x1482) | 818 / 1328 |
| da3nested-giant-large-1.1 | portable | 107,96 (Middlebury 994x1482) | 3275 / 5914 |

En Middlebury 2014 (994x1482), el backend `kernels` logra 17,13 ms para `da3-large-1.1` (9,7x más rápido que la implementación original en fp32) y 14,71 ms para `da3metric-large` (5,8x). El arranque también mejora: la primera llamada con `kernels` es de 0,03 s para Large frente a 0,25 s en portable.

## Requisitos de hardware

- VRAM estimada: entre 0,8 y 1,1 GiB para las variantes Large en 1080p con backend `kernels`; en torno a 2,6-2,9 GiB para Giant en 1080p; hasta 3,3 GiB para Nested Giant en 1080p.
- GPU recomendadas: RTX 4090, RTX 5060 Ti 16 GB, A100 y H100 para cargas de alta resolución; las pruebas documentadas se realizaron en una RTX 5060 Ti de 16 GB.
- Cabe en GPU de consumo: sí, todas las variantes probadas caben en una RTX 5060 Ti de 16 GB, incluso a 3000x4000 (Giant: 5,1 GiB pico; Nested Giant: 6,3 GiB pico).
- Opciones de despliegue: librería `fastforks` con backend `portable` (PyTorch) o `kernels` (CUDA optimizado); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia: 14,8 ms (Large, 1080p, kernels), 15,7 ms (Metric Large, 1080p, kernels), 36,7 ms (Giant, 1080p, kernels), 107,96 ms (Nested Giant, Middlebury, portable).
- Throughput: no disponible de forma explícita; a partir de las latencias, Large en 1080p con kernels permitiría del orden de 60-70 imágenes por segundo en una sola GPU.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de precisión en la información proporcionada para comparar con alternativas como Depth Anything V2, MiDaS o Metric3D. La comparación se limita a aspectos de licencia y variantes internas:

| Modelo | Tipo de profundidad | Licencia de pesos | Uso comercial | Backend optimizado |
|---|---|---|---|---|
| da3mono-large | Relativa | Apache-2.0 | Sí | portable, kernels |
| da3metric-large | Métrica | Apache-2.0 | Sí | portable, kernels |
| da3-large-1.1 | Multi-vista con cámara | CC-BY-NC-4.0 | No | portable, kernels |
| da3-giant-1.1 | Multi-vista con cámara | CC-BY-NC-4.0 | No | portable, kernels |
| da3nested-giant-large-1.1 | Giant alineado a métrica | CC-BY-NC-4.0 | No | portable, kernels |

La comparación con Depth Anything V2, MiDaS o Metric3D no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva en las variantes de mayor calidad: Large, Giant y Nested son CC-BY-NC-4.0 y no permiten uso comercial.
- Ambigüedad de licencia documentada: la card de DA3-LARGE-1.1 indica Apache 2.0, mientras que la tabla del repositorio indica CC BY-NC 4.0; se ha registrado la tabla, pero conviene verificar antes de cualquier uso.
- Los términos de los datos de entrenamiento de las variantes Mono y Metric, aunque los pesos sean Apache-2.0, no han sido verificados según la propia card.
- Riesgo de alucinación en regiones ambiguas: la profundidad es una estimación y puede fallar en superficies reflectantes, transparentes, texturas repetitivas o escenas con iluminación extrema; la salida `confidence` debe usarse para filtrar.
- Sin datos de benchmarks de precisión publicados en la información disponible, lo que impide validar la calidad frente a alternativas.
- No es un modelo de lenguaje: no soporta texto, tool calling, agentes ni capacidades multilingües.
- El repositorio es experimental (tier: experimental) y no aloja pesos; depende de la disponibilidad de los repositorios del autor.
- La resolución de entrada afecta al consumo de memoria: a 3000x4000 el Giant alcanza 5,1 GiB y el Nested Giant 6,3 GiB de pico.
- No se documentan sesgos específicos, pero al entrenarse con datasets académicos públicos puede heredar sesgos de composición y geográficos de dichos conjuntos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/fastforks/depth-anything-3
- Código de fastforks: https://github.com/kleinicke/fastforks
- Kernels para el backend `kernels`: https://huggingface.co/fastforks/kernels
- Código original de ByteDance: https://github.com/ByteDance-Seed/Depth-Anything-3
- Pesos DA3-GIANT-1.1: https://huggingface.co/depth-anything/DA3-GIANT-1.1
- Pesos DA3-LARGE-1.1: https://huggingface.co/depth-anything/DA3-LARGE-1.1
- Pesos DA3METRIC-LARGE: https://huggingface.co/depth-anything/DA3METRIC-LARGE
- Pesos DA3MONO-LARGE: https://huggingface.co/depth-anything/DA3MONO-LARGE
- Pesos DA3NESTED-GIANT-LARGE-1.1: https://huggingface.co/depth-anything/DA3NESTED-GIANT-LARGE-1.1
- Tabla de licencias del autor: https://github.com/ByteDance-Seed/Depth-Anything-3/blob/main/README.md
- Hashes SHA-256 completos: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/depth/models/depth_anything_3/card.toml
