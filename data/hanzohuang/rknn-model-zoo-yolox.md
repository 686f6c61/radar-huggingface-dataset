# HanzoHuang/rknn-model-zoo-yolox

## Resumen

Este repositorio contiene exportaciones del detector de objetos YOLOX Nano al formato RKNN, el runtime propietario de Rockchip para sus NPU integradas. Lo publica el usuario HanzoHuang como parte de un zoo de modelos precompilados, con variantes en FP16 e INT8 para los SoC Rockchip RK3576 y RK3588. No se trata de un modelo de lenguaje ni de un modelo entrenado desde cero, sino de una conversión de pesos ya existentes.

El modelo original, YOLOX Nano, lo desarrolla Megvii-BaseDetection y es un detector ancla-libre (anchor-free) con arquitectura YOLOX, pensado para inferencia en dispositivos con recursos limitados. Esta distribución incluye el checkpoint original en PyTorch bajo el directorio `source`, el resultado de la exportación a ONNX mediante el exportador de Rockchip y el binario `.rknn` compilado con RKNN Toolkit2 2.3.2.

Su relevancia práctica es acotada pero concreta: permite desplegar detección de objetos en placas Rockchip sin necesidad de repetir el pipeline de conversión, algo útil en robótica, visión embebida y edge computing con estos SoC. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño declarado de 0.0 GB, lo que sugiere que la información pública es mínima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOX Nano (detector de objetos, anchor-free, basado en CSPDarknet con cuello PAN y cabeza desacoplada) |
| Parametros totales | no disponible (YOLOX Nano es la variante mas pequena de la familia YOLOX; el numero exacto no consta en la informacion proporcionada) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | FP16 e INT8 (variantes compiladas en RKNN) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.rknn` (compilado para NPU Rockchip), `.onnx` (intermedio de exportacion), `.pth` (checkpoint original PyTorch bajo `source`) |

## Arquitectura y entrenamiento

YOLOX Nano es un detector de una etapa con diseño anchor-free: elimina las anclas predefinidas y predice directamente los desplazamientos de las cajas, lo que simplifica el postprocesado y reduce hiperparámetros. La cabeza está desacoplada (ramas separadas para clasificación y regresión), siguiendo el diseño introducido en la familia YOLOX. La variante Nano es la de menor profundidad y anchura de la familia, orientada a latencia baja en hardware modesto.

El entrenamiento original corre a cargo de Megvii-BaseDetection; este repositorio no documenta el dataset, el número de tokens ni procesos de RLHF (no aplicables). La aportación de esta distribución es puramente de despliegue: exportación a ONNX con el exportador de Rockchip (commit `fc69c1e2`) y compilación con el conversor de YOLOX del rknn_model_zoo (commit `837db8e9`) usando RKNN Toolkit2 2.3.2. La conversión modifica el formato y cuantiza la variante INT8; no hay reentrenamiento ni fine-tuning documentado.

## Capacidades

- Detección de objetos en imágenes: salida de cajas delimitadoras con clase y puntuación de confianza.
- Inferencia en NPU Rockchip RK3576 y RK3588 mediante el runtime RKNN.
- Variantes FP16 (mayor precisión numérica) e INT8 (mayor throughput, calibración cuantizada).
- Ejecución en dispositivos de borde sin GPU dedicada.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de capacidades multilingües ni de modalidad de audio.
- El repositorio incluye un `manifest.json` con el hash de cada modelo y un `metadata.yaml` por directorio, lo que facilita la verificación de integridad en despliegues automatizados.

## Casos de uso

- Visión embebida en robótica móvil: integración del `.rknn` en un robot con RK3588 para detección de obstáculos o personas en tiempo real, aprovechando la NPU y evitando el coste de una GPU.
- Vigilancia y analítica de vídeo en el borde: procesamiento local de streams de cámara en dispositivos Rockchip, con la variante INT8 para maximizar fotogramas por segundo y reducir consumo.
- Sistemas de conteo y aforo: detección de personas en accesos o pasillos con un modelo ligero que cabe en placas de bajo consumo.
- Automatización industrial: inspección visual básica de presencia/ausencia de piezas en cintas transportadoras sobre hardware Rockchip.
- Prototipado rápido en edge AI: punto de partida para validar un pipeline de detección antes de invertir en un modelo propio o en un reentrenamiento.
- Drones y dispositivos de bajo consumo: la variante Nano y la cuantización INT8 permiten inferencia a bordo con presupuesto térmico y energético ajustado.
- Reproducibilidad de despliegues: el manifiesto con hashes permite verificar que el binario desplegado coincide con el publicado en el repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de mAP, latencia ni throughput para RK3576 o RK3588.

## Requisitos de hardware

- Hardware objetivo: NPU integrada en Rockchip RK3576 y RK3588. El formato `.rknn` no es portable a GPU NVIDIA, AMD ni a CPU genérica sin reconversión.
- VRAM: no aplica; el modelo se ejecuta sobre la NPU y la memoria del sistema del SoC, no sobre VRAM de GPU dedicada.
- GPU recomendadas: no aplica. Para ejecutar el checkpoint original `.pth` o el `.onnx` haría falta una GPU convencional, pero el artefacto distribuido está pensado para NPU Rockchip.
- ¿Cabe en GPU de consumo? El modelo original es pequeño y cabría en cualquier GPU de consumo, pero esta distribución no está pensada para ese uso.
- Opciones de despliegue: runtime RKNN en el SoC objetivo; RKNN Toolkit2 para compilación y conversión; el `.onnx` intermedio puede ejecutarse con ONNX Runtime si se dispone de él.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLOX Nano RKNN (este repo) | no disponible | no aplica | `.rknn`, `.onnx`, `.pth` | Apache-2.0 | Hugging Face, 0 descargas |
| YOLOX Nano original (Megvii) | no disponible | no aplica | `.pth` | Apache-2.0 | GitHub releases de Megvii |
| YOLOv8n (Ultralytics) | no disponible en esta ficha | no aplica | `.pt`, `.onnx`, `.engine` | AGPL-3.0 (con licencia comercial aparte) | Ultralytics / Hugging Face |
| SSD-MobileNet (TF) | no disponible en esta ficha | no aplica | `.tflite`, `.pb` | Apache-2.0 | TensorFlow Model Zoo |

La comparación relevante aquí no es de precisión sino de formato y plataforma: este repositorio es el único de la tabla que entrega binarios listos para NPU Rockchip. Los datos de parámetros y rendimiento de los modelos alternativos no se detallan porque no forman parte de la información proporcionada.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes, y un tamaño declarado de 0.0 GB; conviene verificar que los artefactos están realmente presentes antes de integrarlo en un pipeline.
- No hay métricas publicadas de precisión (mAP) ni de latencia, por lo que no se puede evaluar la calidad del modelo cuantizado frente al original sin medirla.
- La cuantización INT8 puede degradar la precisión respecto a FP16; no se documenta el conjunto de calibración utilizado.
- El formato `.rknn` está atado al runtime y a la versión de RKNN Toolkit2 (2.3.2); cambios de versión o de SoC pueden requerir recompilación.
- No es un modelo de lenguaje: no admite prompts, tool calling ni razonamiento; cualquier expectativa en ese sentido es un error de categoría.
- Sesgos: no documentados; al ser un detector entrenado sobre un dataset no especificado en esta ficha (COCO en el original de YOLOX, aunque no se confirma aquí), hereda los sesgos de dicho dataset.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de falsos positivos y falsos negativos propios de cualquier detector.
- Licencia Apache-2.0: permite uso comercial y modificación con atribución; conviene conservar el aviso de licencia y el `LICENSE` incluido.
- La model card no documenta el dataset de entrenamiento, el proceso de calibración ni los límites de resolución de entrada soportados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/HanzoHuang/rknn-model-zoo-yolox
- Checkpoint original YOLOX Nano: https://github.com/Megvii-BaseDetection/YOLOX/releases/download/0.1.1rc0/yolox_nano.pth
- Repositorio YOLOX de Megvii: https://github.com/Megvii-BaseDetection/YOLOX
- Exportador YOLOX de Rockchip (commit referenciado): https://github.com/airockchip/YOLOX/tree/fc69c1e2ccb30fce7e18250bddc13a68090dca09
- Conversor YOLOX del rknn_model_zoo (commit referenciado): https://github.com/airockchip/rknn_model_zoo/tree/837db8e992815ff8647eadb709f07067f4bc3a71/examples/yolox
- Directorio `source` con el checkpoint: https://huggingface.co/HanzoHuang/rknn-model-zoo-yolox/tree/main/source
- Manifiesto con hashes: https://huggingface.co/HanzoHuang/rknn-model-zoo-yolox/blob/main/manifest.json
