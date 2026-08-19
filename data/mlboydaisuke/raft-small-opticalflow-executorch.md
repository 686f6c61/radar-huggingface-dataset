# mlboydaisuke/RAFT-small-OpticalFlow-ExecuTorch

## Resumen

RAFT-small-OpticalFlow-ExecuTorch es una conversión del modelo de flujo óptico RAFT small de Torchvision al formato ExecuTorch, optimizado para inferencia en dispositivos con el backend XNNPACK. El modelo original, desarrollado por Princeton VL y posteriormente integrado en Torchvision, estima el desplazamiento denso de píxeles entre dos fotogramas RGB consecutivos. Esta variante empaqueta el grafo completo con 12 iteraciones de refinamiento, de modo que la salida es directamente el flujo final sin necesidad de bucles externos. Con un peso de solo 4,4 MB en fp32, está pensado para aplicaciones de visión en tiempo real en hardware de bajo consumo (móviles, cámaras, robótica). La licencia BSD-3-Clause permite uso comercial sin restricciones significativas.

El modelo se distribuye como un único archivo `.pte` (ExecuTorch) que acepta dos tensores de entrada `[1, 3, 384, 512]` y produce un tensor de flujo `[1, 2, 384, 512]`. La conversión utiliza `torch.export` y `to_edge_transform_and_lower` con el particionador XNNPACK, logrando una cobertura de delegación del 62,9% de las operaciones (1208 de 1921). La paridad numérica con el modelo eager en fp32 es prácticamente perfecta (correlación 1,0 y diferencia máxima de 4,792e-04). No se incluyen variantes fp16 ni Core ML debido a limitaciones técnicas (el volumen de correlación es un tensor de rango 6 y Core ML soporta hasta rango 5; en fp16 los pesos convolucionales se serializan igualmente como fp32).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RAFT (Recurrent All-Pairs Field Transforms) – red recurrente con volumen de correlación y actualización iterativa |
| Parametros totales | no disponible (modelo pequeño, ~1M según paper original, no confirmado en la información proporcionada) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión, entrada de dos frames) |
| Tipos de cuantizacion | Solo fp32 (no se proporcionan variantes fp16 ni int8) |
| Idiomas soportados | No aplica |
| Licencia | BSD-3-Clause |
| Formato de pesos | ExecuTorch `.pte` (XNNPACK delegate) |

## Arquitectura y entrenamiento

El modelo base es `raft_small` de Torchvision, que sigue la arquitectura RAFT descrita en el paper "RAFT: Recurrent All-Pairs Field Transforms for Optical Flow" (Teed y Deng, 2020). La red extrae características de los dos frames de entrada mediante una CNN, calcula un volumen de correlación de todos los pares de píxeles y lo procesa con una unidad recurrente (GRU) que refina iterativamente el flujo. En esta conversión, las 12 iteraciones de refinamiento están integradas en el grafo, por lo que no se devuelven los estados intermedios.

El modelo se entrenó originalmente en los conjuntos FlyingChairs y FlyingThings3D, tal como indican los pesos de Torchvision (`C_T_V2`). La conversión a ExecuTorch se realizó con `torch.export` y `to_edge_transform_and_lower`, delegando la mayoría de las operaciones a XNNPACK. Las operaciones restantes (como `grid_sampler_2d`, `split_with_sizes_copy` o `_native_batch_norm_legit`) se ejecutan con kernels portables de ExecuTorch. No se aplicó ningún ajuste fino posterior a la conversión; la paridad con el modelo eager se verifica numéricamente.

## Capacidades

- Estimación de flujo óptico denso entre dos fotogramas RGB consecutivos.
- Salida en píxeles: canal 0 = desplazamiento horizontal, canal 1 = desplazamiento vertical.
- Refinamiento iterativo integrado (12 iteraciones) sin necesidad de bucles en el código de aplicación.
- Entrada y salida en fp32, con resolución fija de 384x512 (ambas dimensiones divisibles por 8).
- Optimizado para ejecución en CPU mediante XNNPACK (delegación del 62,9% de las operaciones).
- Compatible con el ecosistema ExecuTorch (inferencia en Android, iOS, Linux embebido, etc.).
- No incluye capacidades de generación de texto, tool calling, agentes ni procesamiento multimodal.

## Casos de uso

- Seguimiento de objetos en video en tiempo real: el flujo denso permite estimar el desplazamiento de píxeles entre frames consecutivos, lo que sirve para rastrear regiones de interés en cámaras de vigilancia o sistemas de videovigilancia sin necesidad de detectores de objetos por frame.
- Interpolación de fotogramas: a partir del flujo entre dos frames, se pueden generar frames intermedios para aumentar la tasa de imágenes por segundo en reproducción de video o en aplicaciones de cámara lenta en dispositivos móviles.
- Estabilización de video: el flujo global entre frames permite estimar el movimiento de la cámara y compensarlo, reduciendo vibraciones en grabaciones realizadas a mano o con drones.
- Análisis de movimiento en robótica móvil: un robot equipado con una cámara puede usar el flujo óptico para detectar obstáculos en movimiento, estimar su propia velocidad o evitar colisiones en entornos dinámicos.
- Realidad aumentada: el flujo entre frames ayuda a alinear objetos virtuales con la escena real, mejorando la estabilidad de anclajes en aplicaciones AR en smartphones.
- Segmentación de objetos en movimiento: el flujo denso permite separar objetos con movimiento coherente del fondo estático, facilitando tareas de segmentación semántica o de seguimiento multiobjeto.
- Medición de flujo en entornos industriales: en líneas de producción, el modelo puede medir la velocidad de piezas en una cinta transportadora a partir de secuencias de video de una cámara fija.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval o GSM8K) porque este modelo no es un LLM. La model card proporciona métricas de paridad entre la versión ExecuTorch y el modelo eager en fp32, verificadas con entrada real:

| Salida | Forma | max_abs_diff | Correlación |
|---|---|---|---|
| 0 | [1, 2, 384, 512] | 4,792e-04 | 1,000000 |

Además, se indica un tiempo de inferencia de referencia en Mac arm64 (proceso único, mediana de 10 ejecuciones): 169,6 ms con ExecuTorch XNNPACK frente a 135,2 ms con PyTorch eager en fp32. Este dato es orientativo y no debe interpretarse como rendimiento en dispositivo final.

## Requisitos de hardware

- Inferencia en CPU: el modelo pesa 4,4 MB en fp32, por lo que cabe en cualquier dispositivo con al menos 16 MB de RAM libre.
- GPU: no requiere GPU; está diseñado para ejecutarse en CPU mediante XNNPACK.
- Compatible con dispositivos móviles (Android/iOS) y sistemas embebidos con soporte ExecuTorch.
- En Mac arm64, la latencia de referencia es de ~170 ms por par de frames (fp32, sin optimizaciones adicionales).
- Despliegue mediante ExecuTorch runtime, utilizando el archivo `.pte` directamente. No se mencionan integraciones con vLLM, Ollama o TGI (no aplicables a un modelo de visión).

## Comparativa con modelos similares

No se dispone de datos cuantitativos de comparación con otras implementaciones de flujo óptico en la información proporcionada. Cualitativamente, RAFT small es más ligero y rápido que RAFT large, sacrificando algo de precisión en movimientos complejos, según la documentación de Torchvision. Otras alternativas como FlowNet2 o PWC-Net tienen arquitecturas diferentes y no se han comparado aquí.

| Modelo | Parámetros | Entrada | Precisión relativa | Licencia |
|---|---|---|---|---|
| RAFT small (este) | ~1M (estimado) | 384x512 | Menor que RAFT large | BSD-3-Clause |
| RAFT large (Torchvision) | ~5M (estimado) | 384x512 | Mayor que RAFT small | BSD-3-Clause |
| FlowNet2 | ~162M | 448x1024 | Variable | MIT (código) |

## Limitaciones y advertencias

- Resolución fija de entrada (384x512): no se soportan otros tamaños sin modificar el grafo, y ambas dimensiones deben ser divisibles por 8.
- Solo acepta dos frames como entrada; no admite secuencias de video completas ni procesamiento temporal más allá del par.
- No se proporcionan variantes fp16 ni int8; la cuantización a fp16 no reduce el tamaño porque los pesos convolucionales se serializan como fp32 en XNNPACK.
- No hay soporte Core ML debido al tensor de rango 6 del volumen de correlación (Core ML limita a rango 5).
- El modelo no devuelve las iteraciones intermedias del refinamiento; solo la salida final tras 12 iteraciones.
- No se han reportado sesgos específicos (es un modelo de visión, no de lenguaje), pero el entrenamiento en FlyingChairs y FlyingThings3D puede limitar su generalización a dominios muy distintos (por ejemplo, imágenes médicas o escenas con condiciones de iluminación extremas).
- Riesgo de alucinación no aplica, pero el flujo estimado puede ser inexacto en regiones con oclusiones, desenfoque de movimiento o texturas repetitivas.
- La licencia BSD-3-Clause permite uso comercial, pero se debe incluir el aviso de copyright en redistribuciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlboydaisuke/RAFT-small-OpticalFlow-ExecuTorch
- Repositorio original RAFT (Princeton VL): https://github.com/princeton-vl/RAFT
- Documentación de Torchvision para raft_small: https://docs.pytorch.org/vision/main/models/generated/torchvision.models.optical_flow.raft_small.html
- Scripts de conversión ExecuTorch: https://github.com/john-rocky/executorch-models
- Código fuente de RAFT en Torchvision: https://github.com/pytorch/vision/blob/main/torchvision/models/optical_flow/raft.py
- Notebook de ejemplo de flujo óptico en Colab: https://colab.research.google.com/github/pytorch/vision/blob/gh-pages/main/_generated_ipynb_notebooks/plot_optical_flow.ipynb
