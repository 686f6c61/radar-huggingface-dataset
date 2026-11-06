# fastforks/depth-pro

## Resumen

Depth Pro es un modelo de estimación de profundidad monocular desarrollado por Apple (Bochkovskii et al., 2024) que produce mapas de profundidad métrica nítidos a partir de una única imagen RGB, sin necesidad de calibración de cámara. El repositorio `fastforks/depth-pro` no contiene pesos: es una model card y una integración de inferencia que descarga los pesos originales de Apple, verifica su integridad mediante SHA-256 y ofrece dos backends de ejecución (`portable`, en PyTorch puro, y `kernels`, con kernels CUDA propios).

La arquitectura combina tres codificadores DINOv2 ViT-L/16 que procesan 35 ventanas solapadas de una pirámide de imagen de tres niveles (imagen completa, campo de visión y ventanas locales), junto con un decodificador convolucional multirresolución que opera a 1536x1536. Además de la profundidad, el modelo estima la longitud focal de la cámara. Su rasgo diferencial frente a otros modelos de profundidad es la métrica absoluta sin calibración y la nitidez de los bordes en objetos finos.

Es relevante ahora porque existen pocas alternativas abiertas que ofrezcan profundidad métrica cero-shot con esta calidad, y porque la integración de `fastforks` reduce los tiempos de carga y de inferencia respecto al código original (de 1,78 s a 0,27 s por imagen en una RTX 5060 Ti). La licencia es estrictamente de uso en investigación, lo que condiciona cualquier despliegue comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tres codificadores DINOv2 ViT-L/16 (pirámide de 3 niveles, 35 ventanas solapadas) + decodificador convolucional multirresolución a 1536x1536 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de cualquier H x W >= 8 píxeles) |
| Tipos de cuantizacion | fp32 (original) y fp16 (portable y kernels); no se documentan cuantizaciones de 8 o 4 bits |
| Idiomas soportados | no aplica (entrada de imagen, sin texto) |
| Licencia | research-only (LicenseRef-Apple-Sample-Code para el código; pesos bajo apple-amlr, solo investigación) |
| Formato de pesos | `depth_pro.pt` (PyTorch), descargado desde el CDN de Apple; el repositorio no aloja pesos |

## Arquitectura y entrenamiento

El modelo sigue un diseño de estimación de profundidad monocular basado en un backbone ViT-L/16 de DINOv2 replicado en tres ramas: una procesa la imagen completa, otra el campo de visión central y una tercera 35 ventanas locales solapadas que se agregan en una pirámide de tres niveles. Las características de las tres ramas se fusionan en un decodificador convolucional multirresolución que produce el mapa de profundidad a 1536x1536, lo que explica la nitidez de los contornos. La salida incluye también los intrínsecos de cámara (longitud focal estimada).

El entrenamiento utiliza una mezcla de conjuntos de datos de profundidad métrica reales y sintéticos, descritos en la Tabla 15 del paper de Depth Pro; la model card no reproduce la lista completa ni el número total de tokens o imágenes. No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de alineación, algo esperable en un modelo puramente perceptivo. La innovación técnica principal es la estimación de profundidad métrica absoluta sin calibración previa y la agregación multi-ventana que preserva detalle fino.

## Capacidades

- Estimación de profundidad monocular métrica a partir de una sola imagen RGB, sin intrínsecos de cámara.
- Estimación de la longitud focal (intrínsecos) de forma conjunta con el mapa de profundidad.
- Salida de mapas de profundidad o profundidad inversa, según la variante (`result.kind` indica el significado del mapa).
- Procesamiento de imágenes de cualquier resolución H x W >= 8 píxeles, con redimensionado y padding internos (parche ViT de 16).
- Ejecución en dos backends: `portable` (PyTorch, GPU o CPU) y `kernels` (kernels CUDA `fastbb` y `dpt_fused`, con selección automática mediante `mode="auto"`).
- No soporta tool calling, agentes, texto ni multimodalidad de lenguaje: es exclusivamente un modelo de visión para profundidad.

## Casos de uso

- **Reconstrucción 3D y fotogrametría de una sola imagen**: el modelo genera un mapa de profundidad métrica que, combinado con los intrínsecos estimados, permite proyectar la imagen a una nube de puntos sin calibración previa de la cámara. Adecuado para escaneo de interiores y documentación de patrimonio.
- **Realidad aumentada y sustitución de fondo**: la profundidad métrica cero-shot permite colocar objetos virtuales con oclusión correcta en escenas capturadas con un móvil, sin necesidad de sensores LiDAR ni de un paso de calibración.
- **Robótica y navegación asistida**: un robot con una cámara monocular puede obtener distancias absolutas a obstáculos para planificación de trayectorias, gracias a la naturaleza métrica de la salida y a la estimación de focal integrada.
- **Edición fotográfica con desenfoque selectivo**: la nitidez de los bordes en objetos finos (pelo, ramas, cables) permite generar máscaras de profundidad para desenfoque de fondo realista en postproducción.
- **Generación de datos sintéticos y aumento**: los mapas de profundidad sirven como condición de control para modelos generativos de imagen (ControlNet y similares) o para validar pipelines de visión en investigación.
- **Evaluación de pipelines de visión en investigación**: la paridad verificada con el código original (diferencia máxima de 0,005 en CPU fp32) lo convierte en una referencia reproducible para comparar nuevos métodos de profundidad monocular.
- **Digitalización de planos y modelos de interiores**: a partir de fotografías de una estancia se obtienen mapas de profundidad que alimentan herramientas de reconstrucción de superficies y medición aproximada de distancias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (AbsRel, RMSE, delta) en la información disponible. La model card solo documenta paridad numérica con el código original y métricas de velocidad y memoria.

**Paridad con el código original**

| Modo | Precisión | Diferencia frente al original |
|---|---|---|
| CPU | float32 | max abs diff <= 0,005 |
| GPU portable | float16 | mean diff <= 1 %, p99 <= 3 % de la mediana de referencia |
| GPU kernels | float16 | mean diff <= 1 %, p99 <= 3 % de la mediana de referencia |

**Velocidad y memoria (Middlebury 2014 half, 994x1482, RTX 5060 Ti 16 GB)**

| Backend | Tiempo (ms) | Memoria pico asignada / reservada (MiB) |
|---|---|---|
| Original fp32 | 1775,6 | 3828 / 4294 |
| Original (fp16) | 568,8 | no disponible |
| Portable | 518,4 | 3306 / 3498 |
| Kernels | 270,93 | 3667 / 3778 |

**Velocidad a tamaños fijos**

| Modo | 640x480 | 1280x720 | 1920x1080 | 4000x3000 (12 MP) |
|---|---|---|---|---|
| Portable | 558,6 ms / 3317 MiB | 558,7 ms / 3323 MiB | 559,0 ms / 3337 MiB | 562,3 ms / 3451 MiB |
| Kernels | 272,9 ms / 3621 MiB | 272,1 ms / 3628 MiB | 271,8 ms / 3641 MiB | 274,9 ms / 3754 MiB |

**Arranque y primera llamada**

| Backend | Carga (s) | Primera llamada (s) |
|---|---|---|
| Original | 17,34 | 0,74 |
| Portable | 4,67 | 0,58 |
| Kernels | 1,11 | 0,37 |

## Requisitos de hardware

- **VRAM estimada**: entre 3,3 y 3,8 GiB de memoria pico asignada según backend; reservada de hasta 4,5 GiB en el peor caso medido (12 MP con kernels). Con una GPU de 8 GB es suficiente.
- **GPU recomendadas**: RTX 5060 Ti 16 GB (hardware de referencia de las mediciones, sm_120), RTX 4090, A100 y H100. Cualquier GPU NVIDIA con soporte CUDA reciente puede ejecutar el backend `portable`.
- **Consumer GPU**: sí, cabe en GPUs de gama media con 8 GB o más (RTX 3060, RTX 4060, RTX 5060). El backend `kernels` requiere un kernel precompilado para la arquitectura de la GPU y un driver NVIDIA reciente; si no existe, lanza `BackendUnavailableError` sin degradar silenciosamente.
- **CPU**: el backend `portable` funciona en CPU en fp32, con mayor latencia no cuantificada en la información disponible.
- **Despliegue**: paquete `fastforks` (`pip install fastforks`), con `depth.load("depth-pro")` o `mode="kernels"`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- **Latencia y throughput**: 0,27 s por imagen a 994x1482 con kernels y 0,52 s con portable; el tiempo es prácticamente constante entre 640x480 y 12 MP (de 272 a 275 ms con kernels), lo que refleja el coste dominante del ViT a resolución fija interna.

## Comparativa con modelos similares

| Modelo | Desarrollador | Parametros | Contexto / entrada | Profundidad métrica | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Depth Pro | Apple | no disponible (ViT-L/16 x3) | Imagen de cualquier tamaño >= 8 px | Sí, cero-shot | Research-only (apple-amlr) | Pesos en CDN de Apple; integración en `fastforks` |
| Depth Anything V2 | no disponible en la información proporcionada | no disponible | Imagen | no disponible | no disponible | no disponible |
| MiDaS | no disponible en la información proporcionada | no disponible | Imagen | no disponible | no disponible | no disponible |
| Marigold | no disponible en la información proporcionada | no disponible | Imagen | no disponible | no disponible | no disponible |

No se dispone de datos verificados de los modelos alternativos en la información proporcionada; la comparativa se limita a constatar la existencia de alternativas de profundidad monocular sin cifras contrastadas.

## Limitaciones y advertencias

- **Licencia estrictamente de investigación**: tanto el código (Apple Sample Code License) como los pesos (apple-amlr) permiten únicamente uso en investigación. No está permitido el uso comercial sin autorización expresa de Apple.
- **El repositorio no aloja pesos**: `fastforks/depth-pro` es una model card e integración; la disponibilidad depende del CDN de Apple y de la verificación SHA-256 de los ficheros descargados.
- **Modelo puramente perceptivo**: no procesa texto, no soporta tool calling ni agentes; cualquier caso de uso debe integrarlo como componente de un pipeline mayor.
- **Riesgo de error en escenas ambiguas**: la profundidad monocular puede fallar en superficies reflectantes, transparentes, texturas repetitivas o escenas con iluminación extrema; no se documentan métricas de error en la información disponible.
- **Dependencia de hardware para el backend `kernels`**: requiere un kernel precompilado para la arquitectura de la GPU y un driver NVIDIA reciente; sin él, hay que usar el backend `portable`, más lento.
- **Sin datos de sesgo ni de composición del dataset**: la model card no detalla la mezcla de datos de entrenamiento ni posibles sesgos geográficos o demográficos, lo que dificulta evaluar su comportamiento en dominios no representados.
- **Tier experimental**: la propia integración se marca como experimental, por lo que no se recomienda para producción sin validación adicional.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/fastforks/depth-pro
- Código de la integración fastforks: https://github.com/kleinicke/fastforks
- Kernels CUDA del backend `kernels`: https://huggingface.co/fastforks/kernels
- Código original de Apple (commit 9e65e4d): https://github.com/apple/ml-depth-pro
- Licencia del código original: https://github.com/apple/ml-depth-pro/blob/9e65e4d/README.md
- Pesos originales: https://ml-site.cdn-apple.com/models/depth-pro/depth_pro.pt
- Model card original en Hugging Face: https://huggingface.co/apple/DepthPro
- Documentación de benchmarks de fastforks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Fichero de variantes y hashes: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/depth/models/depth_pro/card.toml
