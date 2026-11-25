# litert-community/TIPSv2-B14-DPT-LiteRT

## Resumen

TIPSv2-B14-DPT-LiteRT es la exportación a LiteRT (TFLite) del modelo `google/tipsv2-b14-dpt`, desarrollado originalmente por Google DeepMind y presentado en CVPR 2026. Se trata de un sistema de visión por computador que combina un backbone ViT-B/14 (TIPSv2, un encoder visión-lenguaje) con tres cabezas DPT que producen, a partir de una única imagen RGB de 448 × 448 píxeles, tres salidas densas simultáneas: profundidad métrica en metros, vectores de normales de superficie y logits de segmentación semántica ADE20K (150 clases).

La relevancia de esta ficha radica en su orientación a la inferencia en dispositivo (*on-device*): los pesos se distribuyen en formato TFLite con variantes FP16 y A16W8, pensadas para ejecutarse en GPU y NPU de SoC móviles (Mali, Adreno, Qualcomm, MediaTek) mediante el runtime LiteRT. El repositorio lo mantiene la comunidad `litert-community`, no Google, y la licencia es Apache 2.0.

Arquitectónicamente es un transformer de 12 bloques con anchura 768 y 12 cabezas de atención, más un token de registro, con aproximadamente 86 millones de parámetros en el backbone y 72 millones en las cabezas DPT (unos 158 millones en total). No es un modelo generativo de texto: su único propósito es la percepción visual densa de bajo nivel y semántica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ViT-B/14 (TIPSv2) + 3 cabezas DPT (taps en bloques 3, 6, 9 y 12) |
| Parámetros totales | ~158 M (86 M backbone + 72 M cabezas DPT) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen fija 448 × 448) |
| Tipos de cuantización | FP16 (GELU tanh y GELU exacta) y A16W8 (pesos INT8, activaciones calibradas de 16 bits) |
| Idiomas soportados | no disponible (modelo de visión; sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (`.tflite`); FP16 ~303,6 MiB, A16W8 ~159,6 MiB |
| Resolución de entrada | 448 × 448, RGB, NCHW, valores en [0, 1] |
| Salidas | profundidad `[1,1,448,448]`, normales `[1,3,448,448]`, segmentación `[1,150,256,256]` |
| Firma de entrada | `serving_default`, tensor `args_0`, FLOAT32 |

## Arquitectura y entrenamiento

El modelo sigue un diseño *backbone + cabezas*: un Vision Transformer base con parche 14 × 14, 12 bloques, dimensión 768 y 12 cabezas de atención, más un token de registro. Sobre las activaciones intermedias de los bloques 3, 6, 9 y 12 se conectan tres cabezas DPT independientes que reconstruyen mapas densos a resolución completa mediante operaciones de *upsampling* y fusión multi-escala. La entrada se procesa sin recorte central ni normalización ImageNet: conversión a RGB, redimensionado bilineal directo a 448 × 448 y división por 255.

Los detalles de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no están disponibles en la información proporcionada; el modelo base es `google/tipsv2-b14-dpt` y el backbone TIPSv2 se describe como visión-lenguaje, pero esta exportación no incluye componentes de texto. La innovación técnica destacable de esta versión es la exportación a LiteRT con dos variantes de GELU (aproximación tanh para compatibilidad GPU y GELU exacta para Adreno y NPU Qualcomm) y una variante A16W8 con almacenamiento de activaciones sin signo adaptada a la firma de LayerNorm del compilador de Qualcomm.

## Capacidades

- Estimación de profundidad métrica en metros a partir de una imagen RGB.
- Predicción de normales de superficie como vectores unitarios por píxel.
- Segmentación semántica densa con 150 clases del dataset ADE20K.
- Inferencia multi-tarea en una sola pasada: las tres salidas se obtienen del mismo forward.
- Ejecución en GPU móvil (Mali, Adreno) y NPU (Qualcomm con QAIRT 2.50, MediaTek con NeuroPilot 8).
- Ejecución en navegador mediante LiteRT.js y WebGPU (medición reportada: 285 ms p50 en Chromium 151 sobre M4 Max).
- No soporta tool calling, agentes, generación de texto ni capacidades multilingües.

## Casos de uso

- Reconstrucción 3D y escaneo móvil: la profundidad métrica y las normales por píxel permiten generar mallas o nubes de puntos directamente en el dispositivo, sin enviar imágenes a la nube, lo que resulta adecuado para aplicaciones de fotogrametría casual o realidad aumentada.
- Realidad aumentada en Android: la segmentación ADE20K identifica suelo, paredes, cielo y mobiliario, y las normales permiten alinear la iluminación virtual con la geometría real; la latencia de cientos de milisegundos encaja en la colocación de objetos, no en seguimiento por fotograma.
- Segmentación semántica de escenas interiores: útil en herramientas de edición fotográfica (sustitución de cielo, suelo o paredes) o en pipelines de anotación automática de datasets de interior.
- Detección de obstáculos en robótica ligera o drones: la profundidad métrica con una sola cámara RGB sustituye a sensores de profundidad dedicados en plataformas con restricciones de peso y consumo.
- Accesibilidad: generación de descripciones de estructura de escena (planos de suelo, obstáculos, distribución de superficies) para asistentes de navegación en interiores.
- Procesamiento de imágenes en el borde para privacidad: al ejecutarse en NPU local, las imágenes no abandonan el dispositivo, lo que facilita el cumplimiento en aplicaciones sanitarias o de domótica.
- Preprocesado en pipelines de visión: las normales y la profundidad pueden alimentar etapas posteriores (reiluminación, *relighting*, *novel view synthesis*) en herramientas de creación de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (métricas de error de profundidad como RMSE o δ1, mIoU de segmentación) en la información disponible. El único dato de rendimiento reportado es una medición de latencia en dispositivo: 285 ms p50 en Chromium 151 con LiteRT.js 2.5.3 y WebGPU sobre un Apple M4 Max, con la advertencia de que la salida difiere de la de CPU (diferencia relativa máxima 2,3e+10, lo que sugiere inestabilidad numérica en algún canal, probablemente en la profundidad).

## Requisitos de hardware

- Almacenamiento: 303,6 MiB para FP16 y 159,6 MiB para A16W8; el tamaño de fichero no refleja el pico de memoria en ejecución.
- Memoria en ejecución: no disponible de forma explícita; con ~158 M de parámetros en FP16 el peso ocupa unos 316 MB, más activaciones de las cabezas DPT a 448 × 448.
- GPU móviles verificadas: Mali y Adreno (variante FP16 con GELU tanh); Adreno con GELU exacta.
- NPU verificadas: Qualcomm (QAIRT 2.50, ruta A16W8 con el fichero `_qc`) y MediaTek (NeuroPilot 8, compilación A16W8).
- No cabe en GPUs de consumo de gama baja por el tamaño de pesos, pero sí en cualquier GPU de escritorio con 4 GB o más de VRAM para la variante FP16.
- Despliegue: LiteRT `CompiledModel` (Kotlin/Android y Python vía `ai_edge_litert`), LiteRT.js con WebGPU en navegador, y la herramienta C++ `run_model` con `--accelerator=npu`.
- Latencia: 285 ms p50 en M4 Max con WebGPU; no se reportan cifras para SoC móviles.
- Advertencia de compatibilidad: las mediciones con NPU Qualcomm y MediaTek usan compilaciones de LiteRT parcheadas localmente, no paquetes publicados sin modificar.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TIPSv2-B14-DPT-LiteRT | ~158 M | Profundidad + normales + segmentación | Imagen 448 × 448 | Apache 2.0 | Hugging Face (litert-community) |
| Depth Anything V2 (ViT-S/B) | ~25-98 M | Solo profundidad (relativa/métrica en variantes) | Imagen variable | Apache 2.0 / CC BY-NC según variante | Hugging Face |
| MiDaS DPT-Hybrid | ~123 M | Solo profundidad relativa | Imagen variable | MIT | Hugging Face, torch.hub |
| ZoeDepth | ~345 M | Profundidad métrica | Imagen variable | MIT | Hugging Face |

La ventaja diferencial de TIPSv2-B14-DPT-LiteRT frente a estas alternativas es la salida multi-tarea (tres mapas densos en un solo forward) y el empaquetado TFLite con rutas verificadas para NPU móvil; su desventaja es la ausencia de métricas públicas de precisión y la dependencia de compiladores de fabricante. Los datos de los modelos comparados provienen de conocimiento general y no de la información proporcionada, por lo que deben verificarse en sus respectivas model cards.

## Limitaciones y advertencias

- No se han publicado métricas de calidad (RMSE de profundidad, mIoU de segmentación) en la información disponible; no es posible evaluar su precisión frente a alternativas sin medirla.
- La medición en WebGPU reporta una diferencia relativa máxima de 2,3e+10 frente a CPU, indicio de inestabilidad numérica en al menos una salida; conviene validar la profundidad antes de usarla en producción.
- La variante `_qc` (A16W8 para Qualcomm) requiere compilación para NPU y no admite *fallback* a CPU en LiteRT.
- El uso de NPU exige el compilador y runtime del fabricante; los resultados reportados usan compilaciones de LiteRT parcheadas, no paquetes oficiales sin modificar.
- La resolución de entrada está fijada en 448 × 448; cambiar la resolución de salida requiere redimensionar logits antes del argmax y renormalizar las normales, lo que puede degradar la coherencia geométrica.
- El modelo no genera texto ni comprende lenguaje: no debe presentarse como un modelo visión-lenguaje pese al origen del backbone TIPSv2.
- Licencia Apache 2.0 permite uso comercial, pero el mantenimiento corre a cargo de la comunidad y no de Google; no hay garantías de soporte.
- Riesgo de sesgo heredado del dataset ADE20K (escenas interiores y exteriores de ciertas regiones) y de los datasets de profundidad empleados en el entrenamiento original, no detallados aquí.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/TIPSv2-B14-DPT-LiteRT
- Modelo base: https://huggingface.co/google/tipsv2-b14-dpt
- Backbone TIPSv2: https://huggingface.co/google/tipsv2-b14
- Encoder de imagen sin cabezas DPT: https://huggingface.co/litert-community/TIPSv2-B14-LiteRT
- Registro de medición edge-compat: https://github.com/john-rocky/edge-compat/blob/main/cards/tipsv2-b14-dpt/CARD.md
- Receta de despliegue en NPU: https://github.com/john-rocky/hf-to-litertlm/blob/main/docs/android-npu.md
- Receta de despliegue en GPU: https://github.com/john-rocky/hf-to-litertlm/blob/main/docs/android-gpu.md
