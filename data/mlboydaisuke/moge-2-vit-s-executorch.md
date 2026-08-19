# mlboydaisuke/MoGe-2-ViT-S-ExecuTorch

## Resumen

MoGe-2 es un modelo de estimación de geometría monocular desarrollado por Microsoft, presentado como oral en CVPR 2025. A partir de una única imagen RGB, recupera un mapa de puntos 3D con escala métrica, profundidad métrica, normales de superficie y el campo de visión de la cámara. Esta variante concreta, `mlboydaisuke/MoGe-2-ViT-S-ExecuTorch`, es una conversión del modelo base `Ruicheng/moge-2-vits-normal` (backbone DINOv2 ViT-S) al formato ExecuTorch con delegado XNNPACK, pensada para inferencia on-device en dispositivos móviles y edge. El repositorio incluye tres variantes de precisión (fp32, fp16 e int8 dinámico) con tamaños de archivo entre 76 y 141 MB, lo que permite desplegar estimación de profundidad y geometría 3D en hardware con recursos limitados. La relevancia actual radica en la creciente demanda de capacidades de visión 3D en tiempo real para aplicaciones de realidad aumentada, robótica y fotografía computacional, donde la ejecución local evita la latencia y los costes de la nube.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv2 ViT-S (backbone) + cabezas convolucionales sin normalización |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | fp32, fp16, int8 dinámico |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | MIT |
| Formato de pesos | .pte (ExecuTorch) |

## Arquitectura y entrenamiento

El modelo base MoGe-2, descrito en el paper arXiv 2507.02546, utiliza DINOv2 como backbone (ViT-Large en la versión completa, ViT-Base en ablaciones) y cabezas convolucionales que eliminan todas las capas de normalización para reducir la latencia de inferencia. Esta variante concreta emplea el backbone ViT-S (small), lo que reduce aún más el coste computacional a costa de una menor precisión respecto a las versiones grandes. El entrenamiento del modelo original se detalla en el paper de MoGe-2, pero la información proporcionada no incluye detalles específicos sobre el dataset, número de tokens o técnicas de alineación. La innovación principal de este repositorio es la conversión a ExecuTorch mediante `torch.export` y el particionador XNNPACK, con verificación de paridad frente al modelo eager en fp32. La cobertura del delegado XNNPACK es del 53,7% (623 de 1160 operaciones), quedando el resto en kernels portátiles de ExecuTorch.

## Capacidades

- Estimación de mapa de puntos 3D con escala métrica a partir de una sola imagen RGB.
- Estimación de normales de superficie por píxel.
- Generación de máscara de validez que indica qué píxeles tienen geometría fiable.
- Estimación de la escala métrica global de la escena.
- Inferencia on-device gracias al formato ExecuTorch con delegado XNNPACK.
- Entrada de 518x518 píxeles con normalización ImageNet.
- Salidas en tensores fp32, independientemente de la precisión interna del archivo .pte.

## Casos de uso

- Realidad aumentada: el mapa de puntos métrico permite anclar objetos virtuales al entorno con profundidad real, mejorando la oclusión y el realismo. El modelo puede ejecutarse en el dispositivo sin depender de la nube.
- Robótica móvil: la estimación de profundidad y normales en tiempo real facilita la navegación, la evitación de obstáculos y la manipulación de objetos en entornos desconocidos, con latencias de ~750 ms en Mac arm64 (fp32).
- Fotografía computacional: la profundidad métrica permite aplicar efectos de desenfoque selectivo, reiluminación o edición de perspectiva en aplicaciones de cámara móvil.
- Inspección industrial: medición de dimensiones de piezas o espacios a partir de una única fotografía, útil para control de calidad o planificación de instalaciones.
- Asistencia a la conducción: estimación de distancia a objetos en escenas de carretera, complementaria a otros sensores, ejecutable en hardware embarcado.
- Accesibilidad: aplicaciones que describen la profundidad de una escena a personas con discapacidad visual, usando la máscara de validez para filtrar regiones poco fiables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) porque se trata de un modelo de visión, no de lenguaje. La información disponible incluye métricas de paridad frente al modelo eager fp32 y latencias de referencia en Mac arm64 (mediana de 10 ejecuciones, proceso único):

| Variante | Tamaño (MB) | Paridad vs fp32 eager (peor correlación) | Mac mediana (ms) |
|---|---|---|---|
| fp32 | 140,8 | 0,999998 | 750,9 |
| fp16 | 96,6 | 0,434851 (artefacto, ver limitaciones) | 1714,8 |
| int8 (dinámico) | 76,4 | 0,998758 | 746,5 |

La verificación detallada para la variante fp32 muestra diferencias máximas absolutas del orden de 1e-6 y correlaciones de 1,000000 en los mapas de puntos y normales. La variante int8 mantiene una correlación de 0,999 en puntos y normales frente a la versión fp32. El paper de MoGe-2 reporta resultados en datasets de geometría, pero esos números no están incluidos en la información proporcionada.

## Requisitos de hardware

- Tamaños de archivo: fp32 140,8 MB, fp16 96,6 MB, int8 76,4 MB. La variante int8 cabe holgadamente en la memoria de cualquier smartphone moderno.
- VRAM estimada: no especificada, pero el modelo completo en fp32 ocupa ~141 MB, por lo que la inferencia puede ejecutarse en CPU o GPU integrada con al menos 512 MB de memoria disponible.
- GPU recomendadas: no aplica; el formato ExecuTorch con XNNPACK está orientado a CPU y NPU de dispositivos móviles, aunque también se ha medido en Mac arm64.
- Opciones de despliegue: runtime ExecuTorch con delegado XNNPACK; los archivos .pte se pueden integrar en aplicaciones Android/iOS mediante el SDK de ExecuTorch. También es posible ejecutarlo en entornos de escritorio con el runtime de ExecuTorch.
- Latencia y throughput: en Mac arm64, la mediana es de 750,9 ms (fp32) y 746,5 ms (int8), frente a 345,4 ms del eager fp32 en torch. La variante fp16 es significativamente más lenta (1714,8 ms) y no se recomienda para producción.

## Comparativa con modelos similares

| Modelo | Formato | Backbone | Tamaño | Plataforma | Licencia |
|---|---|---|---|---|---|
| MoGe-2-ViT-S-ExecuTorch (este) | ExecuTorch (.pte) | DINOv2 ViT-S | 76-141 MB | Android, Linux, Mac | MIT |
| MoGe-2-ViT-B-CoreML (mismo autor) | CoreML | DINOv2 ViT-B | no disponible | iOS, iPadOS, Mac | MIT |
| MoGe-2-LiteRT (mismo autor) | LiteRT (TFLite) | no disponible | no disponible | Android, edge | MIT |
| MoGe-2 original (Microsoft) | PyTorch | DINOv2 ViT-Large | no disponible | GPU/CPU | MIT |

Las tres conversiones del mismo autor cubren los principales runtimes on-device (ExecuTorch, CoreML, LiteRT), permitiendo elegir según la plataforma objetivo. El modelo original de Microsoft ofrece mayor precisión con ViT-Large, pero requiere más recursos.

## Limitaciones y advertencias

- La variante fp16 muestra una correlación baja (0,43) en uno de los cuatro outputs, aunque el autor explica que es un artefacto de la máscara binaria: la máscara umbralizada es idéntica (IoU 1,0) y la geometría (puntos, normales, escala) se mantiene sin cambios. Aun así, se recomienda verificar en el caso de uso concreto.
- La cobertura del delegado XNNPACK es solo del 53,7%; el resto de operaciones se ejecutan en kernels portátiles, lo que puede penalizar el rendimiento en dispositivos con CPU débil.
- La variante fp16 es notablemente más lenta que fp32 e int8 en la medición de Mac, probablemente por falta de optimización del delegado para esa precisión.
- Modelo de visión únicamente: no procesa texto ni audio, y no tiene capacidades multimodales más allá de la imagen.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado con imágenes de dominio abierto, puede presentar errores en escenas poco representadas (condiciones de luz extremas, objetos transparentes o reflectantes, etc.).
- La licencia MIT permite uso comercial sin restricciones, pero el usuario debe verificar que el modelo base (Ruicheng/moge-2-vits-normal) mantiene la misma licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlboydaisuke/MoGe-2-ViT-S-ExecuTorch
- Repositorio de scripts de conversión: https://github.com/john-rocky/executorch-models
- Paper MoGe-2 (arXiv): https://arxiv.org/abs/2507.02546
- GitHub oficial de MoGe (Microsoft): https://github.com/microsoft/MoGe
- Variante CoreML: https://huggingface.co/mlboydaisuke/MoGe-2-ViT-B-CoreML
- Variante LiteRT: https://huggingface.co/mlboydaisuke/MoGe-2-LiteRT
