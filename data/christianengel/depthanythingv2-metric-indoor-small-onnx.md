# christianengel/DepthAnythingV2-Metric-Indoor-Small-ONNX

## Resumen

Depth Anything V2 Metric Indoor Small ONNX es una conversión a ONNX del modelo Depth Anything V2 en su variante métrica para interiores, entrenada sobre el conjunto de datos Hypersim y con un rango de profundidad máximo de 20 metros. Lo publica el usuario christianengel en Hugging Face como un artefacto listo para inferencia con ONNX Runtime y TensorRT, partiendo del checkpoint original `depth-anything/Depth-Anything-V2-Metric-Hypersim-Small` de ByteDance. El modelo resuelve estimación de profundidad monocular con salida métrica (en metros), sin necesidad de alineación de escala posterior.

La relevancia de esta ficha es práctica: no se trata de un modelo nuevo, sino de una exportación optimizada para despliegue en producción. El autor proporciona dos grafos ONNX (FP32 y FP16), instrucciones para compilar con TensorRT y métricas de latencia medidas en una Quadro RTX 6000 con TensorRT 10.7.0.23. El tamaño del repositorio es de 0,1 GB, coherente con un modelo Small.

La arquitectura subyacente es un transformer de visión (ViT) con cabecera de estimación densa de profundidad, en su variante Small de la familia Depth Anything V2. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de visión (ViT) con cabecera de profundidad densa, familia Depth Anything V2 (variante Small) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada de imagen; resolución de red 518×686 para entrada 480×640) |
| Tipos de cuantizacion | FP32 y FP16 (grafos ONNX separados); TensorRT con `--stronglyTyped` para FP16 |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`onnx/model_fp32.onnx`, `onnx/model_fp16.onnx`) |

## Arquitectura y entrenamiento

El modelo es un estimador de profundidad monocular basado en un backbone transformer de visión, en la variante Small de Depth Anything V2. La versión publicada aquí corresponde al checkpoint métrico entrenado sobre Hypersim (interiores), con un rango de profundidad de hasta 20 metros. El autor advierte explícitamente de que no es el modelo del paper entrenado sobre NYU, y que la salida es métrica directa, sin alineación de escala.

Los datos de entrenamiento originales (número de tokens, composición del dataset, uso de RLHF o DPO) no están disponibles en la información proporcionada. La model card sí detalla el protocolo de evaluación: sobre las primeras 200 imágenes de 645 del archivo `val-000000.tar` de NYU, usando las filas Eigen `[45, 471)` y columnas `[41, 601)`, con ground truth en el rango `(0.001, 10]` metros, totalizando 47.712.000 píxeles evaluados. La innovación técnica destacable de esta exportación es la conversión a ONNX con verificación de fidelidad numérica: la diferencia de AbsRel entre ONNX y PyTorch es de 0,00136, y la brecha de position-embedding a 518×518 es cero, mientras que a 518×686 es de aproximadamente 0,003 m.

## Capacidades

- Estimación de profundidad monocular métrica en interiores, con salida en metros.
- Entrada de imagen RGB en formato float32 con normalización ImageNet, tensor `N×3×H×W` con H y W múltiplos de 14.
- Salida de mapa de profundidad float32 `N×H×W` en metros.
- Funcionamiento sin alineación de escala: la profundidad es absoluta dentro del rango entrenado (hasta 20 m).
- Inferencia optimizada mediante ONNX Runtime (CPUExecutionProvider u otros) y compilación con TensorRT.
- Soporte de precisión FP16 en el grafo ONNX, con I/O en FP32.
- No dispone de tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.

## Casos de uso

- Robótica móvil en interiores: el modelo proporciona profundidad métrica directamente utilizable para planificación de trayectorias y evitación de obstáculos en espacios cerrados, sin necesidad de calibrar la escala de salida.
- Reconstrucción 3D de escenas interiores: la salida en metros permite integrar los mapas de profundidad en pipelines de fotogrametría o SLAM con una referencia métrica consistente.
- Realidad aumentada: para anclar objetos virtuales sobre superficies reales en interiores, la profundidad métrica hasta 20 m es suficiente para la mayoría de habitaciones y pasillos.
- Automatización de interiores y domótica: detección de distancias a paredes, muebles y obstáculos para sistemas de navegación de robots aspiradora o drones de interior.
- Despliegue en edge con TensorRT: el autor documenta compilación para Jetson (`jetson/build_tensorrt.sh model_fp16.onnx 518 686`), lo que permite integrar el modelo en dispositivos embebidos con aceleración por GPU.
- Procesamiento por lotes en servidor: con ONNX Runtime se pueden servir múltiples imágenes por tensor `N`, adecuado para pipelines de análisis de vídeo o datasets de imágenes de interior.
- Evaluación y benchmark de modelos de profundidad: al incluir métricas reproducibles (AbsRel, δ1, RMSE) y un protocolo de evaluación detallado, sirve como referencia para comparar exportaciones ONNX frente a PyTorch.

## Benchmarks y rendimiento

Evaluación sobre las primeras 200 imágenes de NYU (subconjunto del autor, no el conjunto completo de 654), ground truth en `(0.001, 10]` m, 47.712.000 píxeles:

| Metrica | ONNX | PyTorch |
|---|---|---|
| AbsRel | 0,287 | 0,288 |
| δ1 | 0,520 | 0,518 |
| RMSE | 1,077 m | 1,081 m |

Diferencia ONNX vs PyTorch en AbsRel: 0,00136.

Latencia medida con TensorRT 10.7.0.23 en Quadro RTX 6000, resolución 518×686:

| Metrica | Valor |
|---|---|
| Latencia mediana | 5,065 ms |
| Latencia p99 | 5,137 ms |

Nota del autor: la prueba de latencia usó `torch.rand` en `[0, 1)` con profundidades resultantes de 0,425–0,538 m; no es una foto real ni una comprobación de precisión. No se proporcionan benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; por el tamaño del repositorio (0,1 GB) y la variante Small, la huella es reducida, pero no se documenta una cifra concreta.
- GPU recomendadas: el autor valida en Quadro RTX 6000 con TensorRT 10.7.0.23; se menciona compilación para Jetson, aunque el autor indica que no disponía de una Jetson Orin para probar.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del modelo Small, pero no se confirma con mediciones en la información proporcionada.
- Opciones de despliegue: ONNX Runtime (probado con `CPUExecutionProvider`), TensorRT (script `jetson/build_tensorrt.sh`), y cualquier runtime compatible con ONNX.
- Latencia y throughput: mediana de 5,065 ms y p99 de 5,137 ms a 518×686 en Quadro RTX 6000 con TensorRT; no se documenta throughput por lotes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Depth Anything V2 Metric Indoor Small ONNX (este) | no disponible (Small) | Imagen, red 518×686 | AbsRel 0,287, δ1 0,520, RMSE 1,077 m (NYU subset) | Apache 2.0 | ONNX en HF |
| Depth Anything V2 Metric Hypersim Small (original PyTorch) | no disponible (Small) | Imagen | AbsRel 0,288, δ1 0,518, RMSE 1,081 m (mismo subset) | Apache 2.0 | PyTorch en HF |
| Depth Anything V2 (variantes Base/Large) | no disponible | Imagen | no disponible en la información | Apache 2.0 | HF |
| Otros estimadores de profundidad monocular | no disponible | Imagen | no disponible | varía | varía |

La comparación directa más fiable es con el checkpoint PyTorch original, del que este modelo es una exportación: las métricas son prácticamente idénticas, con una diferencia de AbsRel de 0,00136. No se dispone de datos de benchmarks frente a otras familias de modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado para interiores (Hypersim) con rango máximo de 20 m; su uso en exteriores o escenas con profundidades mayores puede degradar la precisión.
- No es el modelo del paper entrenado sobre NYU; el autor lo advierte explícitamente. Las métricas de NYU reportadas corresponden a un subconjunto de 200 imágenes, no al conjunto completo de 654.
- La evaluación de latencia se hizo con tensores aleatorios, no con imágenes reales; no constituye una validación de precisión.
- El grafo FP16 tiene I/O en FP32 y requiere `--stronglyTyped` en TensorRT; usar `--fp16` sobre un grafo FP32 es incorrecto según el autor.
- La lista de capas FP16 del modelo Small está vacía, lo que limita el beneficio de la cuantización FP16 en este artefacto concreto.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas porque el modelo no procesa lenguaje; los sesgos serían los del dataset Hypersim (escenas sintéticas de interiores).
- Las dimensiones de entrada deben ser múltiplos de 14; no respetarlo puede provocar errores o degradación.
- No se documenta el número de parámetros ni el volumen de entrenamiento, lo que dificulta evaluar su comportamiento fuera del dominio de interiores.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del checkpoint base original de ByteDance.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/christianengel/DepthAnythingV2-Metric-Indoor-Small-ONNX
- Modelo base: https://huggingface.co/depth-anything/Depth-Anything-V2-Metric-Hypersim-Small
- Repositorio oficial de Depth Anything V2 (referencia de la familia): no disponible en la información proporcionada
- Paper de Depth Anything V2: no disponible en la información proporcionada
- Script de compilación TensorRT para Jetson: `jetson/build_tensorrt.sh` (incluido en el repositorio del modelo)
