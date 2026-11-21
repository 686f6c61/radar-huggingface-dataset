# christianengel/DepthAnythingV2-Metric-Outdoor-Base-ONNX

## Resumen

DepthAnythingV2-Metric-Outdoor-Base-ONNX es una exportación a formato ONNX del modelo Depth Anything V2 en su variante métrica, entrenada sobre el conjunto Virtual KITTI y orientada a escenas de exterior con un rango máximo de 80 metros. El modelo original lo desarrolló el equipo de Depth Anything (ByteDance y universidades colaboradoras); esta versión concreta la publica el usuario christianengel en Hugging Face como artefacto listo para inferencia con ONNX Runtime y TensorRT. Resuelve el problema de estimación de profundidad monocular con salida en metros absolutos, lo que permite usar la predicción directamente en pipelines de robótica, conducción autónoma o reconstrucción 3D sin necesidad de calibración posterior.

La relevancia de esta ficha radica en que se trata de un artefacto de despliegue, no de un modelo nuevo: el autor no entrena ni afina, sino que exporta los pesos del checkpoint base `depth-anything/Depth-Anything-V2-Metric-VKITTI-Base` a ONNX en FP32 y FP16, verifica la paridad numérica con el original y documenta las condiciones de uso en Jetson. El repositorio ocupa 0,6 GB e incluye dos ficheros: `model_fp32.onnx` (~389 MB) y `model_fp16.onnx` (~195 MB). La licencia es Apache 2.0, heredada del modelo base.

El contexto de uso es claro: despliegue en dispositivos con recursos limitados, especialmente Jetson Orin, con entrada RGB float32 normalizada con estadísticas ImageNet y resolución interna de red de 518×686 para una entrada de 480×640. El autor advierte explícitamente de que no se ha evaluado contra el dataset KITTI (solo se ha comprobado la paridad de exportación) y de que no dispuso de una Jetson Orin para validar el script de TensorRT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Depth Anything V2, variante Base); no se detalla la configuración interna en la información disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | FP32 y FP16 (ficheros ONNX separados) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`onnx/model_fp32.onnx`, `onnx/model_fp16.onnx`); compatible con TensorRT |
| Entrada | `image` float32 `N×3×H×W`, RGB con normalización ImageNet, H y W múltiplos de 14 |
| Salida | `depth` float32 `N×H×W` en metros |
| Rango de profundidad | Exterior, máximo 80 m (según model card) |
| Resolución interna | 518×686 para entrada 480×640 |
| Tamaño del repositorio | 0,6 GB |

## Arquitectura y entrenamiento

El modelo subyacente es Depth Anything V2 en su variante métrica Base, un estimador de profundidad monocular basado en transformer. La información proporcionada no detalla la arquitectura interna (número de capas, dimensión de embeddings, mecanismo de atención) ni los datos de entrenamiento del modelo original: no se indica el número de tokens, la composición del dataset ni si hubo etapas de RLHF o DPO (poco habituales en modelos de visión). Lo que sí se documenta es que el checkpoint base es `depth-anything/Depth-Anything-V2-Metric-VKITTI-Base`, es decir, la variante métrica afinada sobre Virtual KITTI, un dataset sintético de escenas de conducción.

La aportación técnica de esta publicación es la exportación a ONNX y su verificación. El autor documenta que en FP16 se mantienen Softmax y LayerNormalization en FP32 y se restauran las escalas de Resize a float32, y recomienda usar el flag `--stronglyTyped` en la conversión a TensorRT. La paridad numérica se mide como diferencia de profundidad: a 518×518 la discrepancia en el position-embed es 0, y a 518×686 la diferencia máxima es de aproximadamente 0,029 m. El error AbsRel en FP16 es de 2,3e-4 y 2,7e-4 según la resolución. No hay innovaciones de arquitectura propias de esta exportación; el valor está en la reproducibilidad del despliegue.

## Capacidades

- Estimación de profundidad monocular con salida métrica en metros absolutos (no profundidad relativa).
- Procesamiento por lotes: la entrada admite dimensión `N` en el eje de batch.
- Entrada RGB float32 con normalización ImageNet y dimensiones múltiplos de 14.
- Salida de mapa de profundidad float32 de tamaño `N×H×W`.
- Ejecución en CPU mediante ONNX Runtime (`CPUExecutionProvider`) y en GPU mediante TensorRT.
- Soporte de precisión FP32 y FP16 con paridad numérica documentada frente al modelo original.
- Orientado a escenas de exterior con rango de hasta 80 m.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.
- No incluye modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Percepción en robótica móvil: el modelo entrega profundidad en metros directamente, lo que permite alimentar planificadores de trayectoria y mapas de ocupación sin una etapa de calibración de escala. Su rango de 80 m cubre navegación en exteriores a velocidades moderadas.
- Asistencia a la conducción y ADAS de bajo coste: con entrada 480×640 y resolución interna 518×686, cabe en un pipeline de tiempo real en una Jetson Orin, generando mapas de profundidad para detección de obstáculos y estimación de distancia a vehículos.
- Despliegue en dispositivos embebidos: los ficheros ONNX de 389 MB (FP32) y 195 MB (FP16) permiten ejecución en CPU con ONNX Runtime o en GPU con TensorRT, útil cuando no se dispone de PyTorch en el entorno de producción.
- Reconstrucción 3D y fotogrametría ligera: la salida métrica por píxel se puede combinar con la intrínseca de la cámara para generar nubes de puntos de escenas exteriores sin necesidad de sensores de profundidad dedicados.
- Validación de pipelines de percepción: al ser una exportación con paridad numérica documentada (AbsRel 2,3e-4 en FP16), sirve como referencia para comparar implementaciones propias de Depth Anything V2 o para verificar que una conversión a TensorRT no degrada la salida.
- Prototipado rápido en investigación: la carga con `hf_hub_download` y `onnxruntime.InferenceSession` en pocas líneas permite integrar estimación de profundidad en cuadernos y scripts de experimentación sin gestionar dependencias de PyTorch.
- Procesamiento por lotes offline: la dimensión de batch `N` en la entrada permite procesar conjuntos de imágenes en una sola pasada, adecuado para anotación automática de datasets o generación de mapas de profundidad a gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta métricas de paridad de la exportación, no de calidad del modelo frente a datasets de referencia:

| Metrica | Valor |
|---|---|
| Diferencia en position-embed a 518×518 | 0 |
| Diferencia máxima de profundidad a 518×686 | ~0,029 m |
| AbsRel en FP16 (resolución 1) | 2,3e-4 |
| AbsRel en FP16 (resolución 2) | 2,7e-4 |
| Score sobre dataset KITTI | no evaluado (el autor indica explícitamente "No KITTI dataset score") |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Como referencia de tamaño, el fichero FP32 ocupa ~389 MB y el FP16 ~195 MB, por lo que la huella de pesos es inferior a 0,5 GB en ambos casos; el consumo total depende de la resolución de entrada y del batch.
- GPU recomendadas: no especificadas en la información disponible. El autor menciona Jetson Orin como destino previsto del script `jetson/build_tensorrt.sh`, pero indica que no disponía de una unidad para validarlo.
- Compatibilidad con GPU de consumo: no confirmada. Por el tamaño de los pesos, es plausible que quepa en GPUs de consumo con suficiente memoria, pero no hay datos publicados que lo verifiquen.
- Opciones de despliegue: ONNX Runtime (`CPUExecutionProvider` documentado), TensorRT (script de build incluido en la model card) y, por extensión del formato ONNX, cualquier runtime compatible con ONNX.
- Latencia y throughput: no disponibles. No se han publicado mediciones de latencia ni de imágenes por segundo en ningún hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / rango | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DepthAnythingV2-Metric-Outdoor-Base-ONNX (esta ficha) | no disponible | Exterior hasta 80 m | ONNX (FP32/FP16) | Apache 2.0 | Hugging Face, 0 descargas |
| depth-anything/Depth-Anything-V2-Metric-VKITTI-Base | no disponible | Exterior hasta 80 m (checkpoint original) | PyTorch (safetensors/bin, no confirmado) | Apache 2.0 | Hugging Face (modelo base) |
| Depth Anything V2 (variantes relativas) | no disponible | Profundidad relativa, sin escala métrica | PyTorch | Apache 2.0 | Hugging Face |
| Otras exportaciones ONNX de Depth Anything V2 | no disponible | no disponible | ONNX | variable | Hugging Face |

La comparación directa con alternativas de la misma categoría (por ejemplo, MiDaS o ZoeDepth) no está disponible en la información proporcionada: no se han incluido sus especificaciones ni resultados.

## Limitaciones y advertencias

- El autor indica explícitamente que no se ha evaluado el modelo contra el dataset KITTI; solo se ha verificado la paridad de exportación. La calidad de la profundidad métrica en datos reales no está validada en esta publicación.
- El script de TensorRT para Jetson no se ha probado en hardware real: "Jetson Orin was not available". El despliegue en ese dispositivo es una recomendación, no una validación.
- Rango limitado a escenas de exterior y hasta 80 m; no está pensado para interiores ni para distancias superiores.
- La entrada debe cumplir restricciones estrictas: float32, RGB con normalización ImageNet y dimensiones múltiplos de 14. Un preprocesado incorrecto degrada la salida sin aviso.
- La salida es profundidad métrica en metros, pero su fiabilidad depende del dominio de entrenamiento (Virtual KITTI, sintético); puede haber sesgos hacia escenas de conducción y degradación en otros entornos.
- Riesgo de alucinación de profundidad en regiones ambiguas (superficies reflectantes, cielo, objetos finos), inherente a los estimadores monoculares; no hay métricas publicadas que lo cuantifiquen en esta versión.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base original y de los datos de entrenamiento (Virtual KITTI) si se redistribuye.
- Repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día: no hay evidencia de uso en producción ni de mantenimiento posterior.
- No se especifican parámetros totales ni arquitectura interna, lo que dificulta estimar requisitos de cómputo con precisión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/christianengel/DepthAnythingV2-Metric-Outdoor-Base-ONNX
- Modelo base: https://huggingface.co/depth-anything/Depth-Anything-V2-Metric-VKITTI-Base
- Fichero ONNX FP32: https://huggingface.co/christianengel/DepthAnythingV2-Metric-Outdoor-Base-ONNX/blob/main/onnx/model_fp32.onnx
- Fichero ONNX FP16: https://huggingface.co/christianengel/DepthAnythingV2-Metric-Outdoor-Base-ONNX/blob/main/onnx/model_fp16.onnx
- Repositorio oficial de Depth Anything V2: no disponible en la información proporcionada
- Paper de Depth Anything V2: no disponible en la información proporcionada
