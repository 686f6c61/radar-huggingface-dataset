# fastforks/prompt-depth-anything

## Resumen

Prompt Depth Anything es un modelo de estimación de profundidad monocular métrica desarrollado por el equipo Depth Anything (Lin et al., presentado en CVPR 2025). Su particularidad es que no estima la profundidad a partir de una sola imagen RGB, sino que combina la imagen con un *prompt* de profundidad métrica de baja resolución (por ejemplo, un mapa LiDAR disperso o una lectura de sensor de bajo coste) para producir un mapa de profundidad denso y métrico. Esto lo hace especialmente útil en robótica, conducción autónoma y reconstrucción 3D, donde se dispone de medidas de profundidad parciales pero se necesita una salida densa y coherente.

La arquitectura se basa en un backbone DINOv2 ViT (en variantes ViT-L y ViT-S) con una cabeza DPT que fusiona el prompt de profundidad en cada etapa de refinamiento del decodificador. El repositorio `fastforks/prompt-depth-anything` es una *model card* de terceros: no aloja pesos, sino que documenta cómo el paquete `fastforks` descarga los pesos originales de los repos de `depth-anything` y los verifica por SHA-256. Está etiquetado como *tier* experimental y ofrece dos backends de ejecución (`portable` y `kernels`).

La relevancia actual radica en que cubre un hueco poco atendido: la profundidad métrica guiada por sensores, con licencia Apache-2.0 y uso comercial permitido, y con benchmarks de velocidad y memoria publicados sobre hardware consumer (RTX 5060 Ti 16 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv2 ViT + cabeza DPT con fusión del prompt de profundidad en cada etapa de refinamiento |
| Parametros totales | no disponible (variantes ViT-L y ViT-S; cifra exacta no publicada en la información) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de cualquier H x W >= 1, redimensionada o con padding interno, parche ViT de 14) |
| Tipos de cuantizacion | fp32 (original), fp16 (por defecto en portable y kernels), TensorRT fp16 |
| Idiomas soportados | no aplica (modelo de profundidad, sin entrada de texto) |
| Licencia | Apache-2.0 (código y pesos de las variantes; uso comercial permitido) |
| Formato de pesos | `.ckpt` (checkpoint PyTorch) alojado en los repos originales de `depth-anything` |

## Arquitectura y entrenamiento

El modelo sigue el diseño de Prompt Depth Anything: un encoder DINOv2 ViT (grande o pequeño) extrae características de la imagen RGB, y una cabeza DPT las decodifica en un mapa de profundidad. La innovación clave es que el prompt de profundidad métrica de baja resolución se inyecta y fusiona en cada etapa de refinamiento del decodificador, de modo que la red corrige la escala y el sesgo de la predicción usando las medidas parciales disponibles. La salida es un mapa de profundidad métrico (en metros) o de profundidad inversa, según el campo `kind` de la tarjeta.

Los datos de entrenamiento, según el paper (arXiv 2412.14015), combinan datos RGB-D sintéticos y reales, incluyendo imágenes reales pseudo-etiquetadas. La información disponible no detalla el número de tokens ni la composición exacta del dataset, ni si se empleó RLHF/DPO (no procede en un modelo de visión). El paquete `fastforks` verifica cada variante contra salidas de referencia del código original: en CPU float32 la diferencia máxima es <= 0.002, y en GPU float16 la diferencia media es <= 0.02 con p99 <= 0.25.

## Capacidades

- Estimación de profundidad monocular métrica a partir de una imagen RGB y un prompt de profundidad de baja resolución (LiDAR, sensor de bajo coste, etc.).
- Salida de profundidad métrica en metros o de profundidad relativa (invariante a escala, afín, logarítmica o inversa afín), indicada por el campo `kind`.
- Fusión del prompt en todas las etapas de refinamiento, lo que permite corregir escala y sesgo con medidas dispersas.
- Procesamiento de entradas de cualquier resolución H x W >= 1 (redimensionado o padding interno con parche 14).
- Ejecución en dos backends: `portable` (PyTorch) y `kernels` (kernels optimizados), con soporte de `torch.compile` y TensorRT fp16.
- Verificación de integridad de pesos mediante SHA-256.
- No soporta tool calling, agentes, texto ni multilingüismo: es exclusivamente un modelo de visión para profundidad.

## Casos de uso

- Robótica móvil con LiDAR de bajo coste: el robot combina su mapa LiDAR disperso con la imagen de su cámara para obtener un mapa de profundidad denso y métrico que alimenta la planificación de trayectorias y la evitación de obstáculos.
- Conducción autónoma y ADAS: fusión de lecturas de radar o LiDAR de baja resolución con la cámara para generar profundidad densa en metros, útil para detección de obstáculos y estimación de distancias.
- Reconstrucción 3D y fotogrametría: a partir de una imagen y un prompt de profundidad parcial (por ejemplo, de un sensor de profundidad tipo Kinect o un mapa SLAM), generar una nube de puntos densa y métrica para modelado 3D.
- Realidad aumentada: anclar objetos virtuales con escala métrica correcta usando la profundidad densa generada a partir de la cámara y un prompt de profundidad del dispositivo.
- Drones y vehículos aéreos: estimación de profundidad métrica en tiempo real con la variante ViT-S (18,4 ms en portable, 11,4 ms con kernels a 756x1008) para navegación y aterrizaje.
- Inspección industrial y agricultura de precisión: medición de distancias y volúmenes a partir de imágenes y prompts de profundidad de sensores de bajo coste, con licencia Apache-2.0 que permite uso comercial.
- Generación de datasets de profundidad: uso del modelo para pseudo-etiquetar imágenes con profundidad métrica a gran escala, aprovechando el throughput de la variante ViT-S.

## Benchmarks y rendimiento

Datos de velocidad y memoria publicados en la model card (RTX 5060 Ti 16 GB, sm_120, fp16):

| Modelo | Entrada | Portable (ms) | Kernels (ms) | TensorRT fp16 (ms) | Memoria pico portable (MiB) | Memoria pico kernels (MiB) |
|---|---|---|---|---|---|---|
| prompt-depth-anything-l | 756x1008 | 125 | 69,3 | 75,3 | 1318 / 1488 | 1179 / 1348 |
| prompt-depth-anything-s | 756x1008 | 18,4 | 11,4 | 10,5 | 363 / 442 | 297 / 384 |

Aceleración de kernels frente a portable: 1,8x en ViT-L y 1,6x en ViT-S. Carga del modelo: 1,50 s (ViT-L portable) y 0,37 s (ViT-S portable); primera llamada: 0,30 s y 0,24 s respectivamente. Entrada probada de hasta 3000x4000: 1,4 GiB de pico asignado en ViT-L y 0,6 GiB en ViT-S.

Paridad con el código original: CPU float32, diferencia máxima <= 0.002; GPU float16, diferencia media <= 0.02 y p99 <= 0.25.

No se han publicado resultados de benchmarks de precisión (AbsRel, RMSE, delta) en la información disponible.

## Requisitos de hardware

- VRAM estimada: ViT-S en fp16 requiere aproximadamente 0,3-0,4 GiB de pico para 756x1008; ViT-L en fp16 requiere aproximadamente 1,2-1,5 GiB. Para 3000x4000, ViT-L alcanza 1,4 GiB asignados y 1,7 GiB reservados; ViT-S, 0,6 GiB asignados y 0,8 GiB reservados.
- GPU recomendadas: RTX 5060 Ti 16 GB es el hardware de referencia de los benchmarks; cualquier GPU con al menos 2-4 GB de VRAM puede ejecutar ambas variantes. A100 y H100 no se han probado en la información disponible, pero son sobradamente suficientes.
- Cabe en GPU consumer: sí, ambas variantes caben en GPUs consumer modestas (por ejemplo, RTX 3060 12 GB, RTX 4060 8 GB) para resoluciones típicas.
- Opciones de despliegue: paquete `fastforks` con backends `portable` y `kernels`; soporte de `torch.compile` y exportación a ONNX + TensorRT fp16. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de visión).
- Latencia y throughput: ViT-S a 756x1008 en 18,4 ms (portable) o 11,4 ms (kernels), es decir, más de 50-80 FPS teóricos; ViT-L en 125 ms (portable) o 69,3 ms (kernels), unos 8-14 FPS. La compilación con `torch.compile` tarda 21,2 s (ViT-L) y 14,7 s (ViT-S); la construcción de ONNX + engine TensorRT, 52,5 s y 46,6 s respectivamente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| prompt-depth-anything (ViT-L / ViT-S) | no disponible | cualquier H x W >= 1 | profundidad métrica guiada por prompt | Apache-2.0 | pesos en `depth-anything/*`, tarjeta en `fastforks` |
| metric3d-vit-large | no disponible | imagen + intrínsecos | profundidad métrica | no disponible | mencionado en la tarjeta de fastforks |
| unidepth-v2-vitl14 | no disponible | imagen (estima cámara) | profundidad métrica | no disponible | mencionado en la tarjeta de fastforks |
| depth-pro | no disponible | imagen (estima cámara) | profundidad métrica | no disponible | mencionado en la tarjeta de fastforks |

La información disponible no incluye datos de precisión comparativos entre estos modelos; solo se documenta su existencia y sus requisitos de entrada (intrínsecos o estimación propia de la cámara).

## Limitaciones y advertencias

- Es un modelo de visión: no procesa texto, no soporta tool calling ni agentes, y no tiene capacidades multilingües.
- La calidad de la profundidad métrica depende de la calidad y densidad del prompt de profundidad; un prompt muy disperso o sesgado puede degradar la salida.
- El repositorio `fastforks/prompt-depth-anything` no aloja pesos: depende de la disponibilidad de los repos originales de `depth-anything` y de la verificación SHA-256.
- Está etiquetado como *tier* experimental por el autor del paquete; no se recomienda como componente crítico en producción sin validación propia.
- La model card original está truncada en la información disponible; no se detallan sesgos conocidos ni tasas de error en escenarios adversos.
- Riesgo de alucinación de profundidad en regiones sin prompt válido o en superficies transparentes, reflectantes o con poca textura (limitación habitual de los modelos monoculares).
- La licencia Apache-2.0 permite uso comercial, pero la tarjeta advierte de que el paquete es de uso de investigación y recomienda revisar las cadenas de licencia antes de otros usos.
- No se han publicado métricas de precisión (AbsRel, RMSE, delta) en la información disponible, lo que dificulta comparar su exactitud con alternativas.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/prompt-depth-anything
- Pesos originales ViT-L: https://huggingface.co/depth-anything/prompt-depth-anything-vitl
- Pesos originales ViT-S: https://huggingface.co/depth-anything/prompt-depth-anything-vits
- Código del paquete fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend: https://huggingface.co/fastforks/kernels
- Código original PromptDA: https://github.com/DepthAnything/PromptDA (commit `9161547`)
- Paper: arXiv 2412.14015
- Benchmarks y protocolo: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Hashes completos: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/depth/models/prompt_depth_anything/card.toml
