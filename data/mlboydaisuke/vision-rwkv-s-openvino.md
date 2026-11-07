# mlboydaisuke/Vision-RWKV-S-OpenVINO

## Resumen

Vision-RWKV-S-OpenVINO es una conversión del modelo de clasificación de imágenes Vision-RWKV-S (variante Small) al ecosistema OpenVINO, publicada por el usuario mlboydaisuke. El modelo original, desarrollado por OpenGVLab y presentado como Spotlight en ICLR 2025, aplica una arquitectura de atención lineal inspirada en RWKV al dominio de la visión, sustituyendo la atención cuadrática de los transformers por una recurrencia lineal que reduce el coste computacional en imágenes de alta resolución. Esta versión concreta parte de la conversión intermedia litert-community/Vision-RWKV-S-LiteRT (TensorFlow Lite) y la reempaqueta como ONNX (opset 17) y como representación intermedia (IR) de OpenVINO en fp32, además de incluir un blob precompilado para la NPU de Intel.

La relevancia de esta publicación es fundamentalmente de despliegue: permite ejecutar un modelo de visión en la NPU integrada de los procesadores Intel Core Ultra sin necesidad de GPU dedicada, con una latencia medida de 234,02 ms por inferencia en un Core Ultra 9 386H. El repositorio incluye el ONNX, el IR (`.xml` + `.bin`) y el blob de NPU, junto con instrucciones reproducibles para OpenVINO y ONNX Runtime con el execution provider de OpenVINO.

No se trata de un modelo de lenguaje ni de un modelo generativo: es un clasificador de imágenes de propósito general, sin capacidades de texto, tool calling ni razonamiento multi-paso. Su interés para desarrolladores está en la portabilidad y en los datos de rendimiento comparados entre CPU, iGPU, NPU Intel, GPU NVIDIA y NPU Qualcomm.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-RWKV (transformer con atención lineal tipo RWKV) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantización | fp16 (origen LiteRT), fp32 (IR de OpenVINO), blob precompilado para NPU |
| Idiomas soportados | no disponible (clasificación de imágenes, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17), OpenVINO IR (`.xml`/`.bin`), blob de NPU Intel |

## Arquitectura y entrenamiento

Vision-RWKV es la adaptación a visión del mecanismo RWKV, que combina la formulación de atención lineal con una recurrencia que evita la matriz de atención cuadrática. El modelo se organiza en bloques tipo transformer con atención lineal y mezcla de canales, lo que permite procesar imágenes de alta resolución con un coste que crece linealmente en lugar de cuadráticamente respecto al número de tokens visuales. La variante Small (S) es la de menor tamaño de la familia Vision-RWKV.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. El modelo base es un clasificador de imágenes, por lo que su entrenamiento se orienta a tareas de reconocimiento visual supervisado. La conversión a OpenVINO se realizó con tf2onnx 1.17.0 (opset 17) y se verificó que la salida del ONNX coincide con la del `.tflite` original con coseno ≥ 0,9999 en todas las salidas.

## Capacidades

- Clasificación de imágenes: el pipeline declarado es `image-classification`, con salida de puntuaciones por clase.
- Procesamiento visual de alta resolución gracias a la atención lineal de Vision-RWKV.
- Inferencia en CPU, iGPU Intel, NPU Intel (AI Boost) y GPU NVIDIA mediante ONNX Runtime y OpenVINO.
- Ejecución en NPU Qualcomm (Snapdragon X2 Elite, Galaxy S26) mediante QNN, según los perfiles de Qualcomm AI Hub.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No incluye modo thinking, visión generativa, audio ni otras capacidades especiales.

## Casos de uso

- Clasificación de imágenes en el borde (edge): el blob precompilado para NPU Intel permite ejecutar el clasificador en un portátil con Core Ultra sin GPU dedicada, con 234 ms por inferencia, adecuado para preetiquetado local de imágenes.
- Filtrado y moderación de contenido visual: integrar el modelo en un pipeline que clasifique imágenes subidas por usuarios antes de pasarlas a un revisor humano, aprovechando la baja latencia en iGPU (51,47 ms).
- Procesamiento por lotes en CPU: con 385,53 ms por inferencia en el Core Ultra 9 386H, el modelo es viable para trabajos nocturnos de clasificación masiva donde no se requiere tiempo real.
- Prototipado en dispositivos Snapdragon: los perfiles de Qualcomm AI Hub (75-77 ms en NPU) permiten validar la clasificación en entornos móviles y de PC ARM antes de portar a producción.
- Despliegue en entornos con restricciones de GPU: al funcionar sobre OpenVINO IR y ONNX Runtime, se puede ejecutar en servidores sin GPU NVIDIA usando la iGPU o la NPU Intel, reduciendo coste energético.
- Verificación de pipelines de conversión: el repositorio incluye comprobaciones de salida (coseno ≥ 0,99 frente a la referencia fp32) que sirven como caso de estudio para validar conversiones TFLite → ONNX → OpenVINO.

## Benchmarks y rendimiento

Los datos disponibles son de latencia de inferencia, no de precisión sobre datasets de clasificación (no se publican métricas como ImageNet top-1 en la información proporcionada).

| Procesador | Runtime | Fichero | ms | Carga (s) | Comprobación de salida |
|---|---|---|---|---|---|
| Intel AI Boost NPU | OpenVINO 2026.4.1 | blob NPU (`import_model`) | 234,02 | 0,05 | PASS (cos ≥ 0,9999) |
| Intel AI Boost NPU | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | 282,56 | 67,01 | PASS (cos ≥ 0,9999) |
| Intel Graphics (iGPU) | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | 51,47 | 3,44 | PASS (cos ≥ 0,9999) |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | copia fp16 del `.onnx` | 15,01 | 1,27 | PASS (cos ≥ 0,9998) |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | `.onnx` | 25,88 | 1,89 | PASS (cos ≥ 0,9999) |
| Core Ultra 9 386H CPU | ONNX Runtime 1.31.1, CPU EP | `.onnx` | 385,53 | 0,17 | referencia |
| Snapdragon X2 Elite NPU | Qualcomm AI Hub, QNN precompilado | `.onnx` | 76,93 | 0,45 | no comparado |
| Snapdragon X2 Elite NPU | Qualcomm AI Hub, ONNX Runtime QNN EP | `.onnx` | 75,50 | 91,67 | no comparado |
| Galaxy S26 NPU | Qualcomm AI Hub, QNN precompilado | `.onnx` | 75,99 | 0,32 | no comparado |

No se han publicado resultados de benchmarks de precisión (ImageNet u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el ONNX pesa 95,6 MB y el blob de NPU 74,6 MB; en fp16 la huella es inferior a 100 MB, por lo que cabe en cualquier GPU consumer con más de 1 GB de memoria.
- GPU recomendadas: RTX 5080 Laptop (medido a 15,01 ms con fp16 en CUDA EP); cualquier GPU NVIDIA con soporte CUDA es suficiente dado el tamaño reducido.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1 GB de VRAM; también en iGPU Intel y NPU Intel AI Boost.
- Opciones de despliegue: OpenVINO 2026.4.1 (NPU, iGPU, CPU), ONNX Runtime 1.31.1 con OpenVINO EP 1.8.1, ONNX Runtime con CUDA EP, y QNN en Snapdragon vía Qualcomm AI Hub.
- Latencia: 15,01 ms en RTX 5080 Laptop (fp16), 51,47 ms en iGPU Intel, 234,02 ms en NPU Intel con blob precompilado, 385,53 ms en CPU Core Ultra 9 386H.
- Throughput: no disponible de forma explícita; a partir de las latencias, el orden de magnitud es de decenas de inferencias por segundo en GPU y de 2-4 por segundo en NPU Intel.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vision-RWKV-S-OpenVINO | Vision-RWKV (atención lineal) | no disponible | no aplica | Apache-2.0 | Hugging Face (ONNX, IR, blob NPU) |
| Vision-RWKV-S-LiteRT | Vision-RWKV (atención lineal) | no disponible | no aplica | Apache-2.0 | Hugging Face (TFLite) |
| Vision-RWKV (OpenGVLab) | Vision-RWKV (atención lineal) | varias variantes (S, B, L) | no aplica | no disponible en la información | GitHub y Hugging Face |
| Vision Transformer (ViT) estándar | Transformer con atención cuadrática | no disponible | no aplica | no disponible | Amplia disponibilidad |

No se dispone de datos de rendimiento comparativo (precisión) entre Vision-RWKV y alternativas como ViT o Swin en la información proporcionada.

## Limitaciones y advertencias

- Es un clasificador de imágenes, no un modelo generativo: no genera texto, código ni respuestas conversacionales.
- No se han publicado métricas de precisión (top-1, top-5) en la información disponible, por lo que no se puede evaluar su calidad frente a otros clasificadores.
- El blob de NPU está compilado con OpenVINO 2026.4.1 y el driver Intel NPU 32.0.100.4841; en otras versiones `import_model` puede rechazarlo y habrá que recompilar el IR.
- La conversión parte de un modelo LiteRT intermedio, no directamente del original de OpenGVLab, lo que añade una capa de indirección en la cadena de conversión.
- Los resultados en Snapdragon provienen de perfiles de Qualcomm AI Hub y no se compararon contra la referencia fp32, por lo que su fidelidad numérica no está verificada en esta ficha.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es una publicación reciente sin validación comunitaria.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar la licencia del modelo original de OpenGVLab, que no se detalla en la información disponible.
- No hay información sobre sesgos del modelo ni sobre el dataset de entrenamiento, lo que dificulta evaluar su comportamiento en dominios específicos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mlboydaisuke/Vision-RWKV-S-OpenVINO
- Modelo base LiteRT: https://huggingface.co/litert-community/Vision-RWKV-S-LiteRT
- Modelo original OpenGVLab: https://huggingface.co/OpenGVLab/Vision-RWKV
- Repositorio GitHub de Vision-RWKV: https://github.com/OpenGVLab/Vision-RWKV
- Scripts y datos de medición: https://github.com/john-rocky/windows-zoo
- Documentación de OpenVINO: https://docs.openvino.ai/
