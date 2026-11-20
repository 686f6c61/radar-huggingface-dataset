# ShaderError/perspectra-dinov2-scene-base

## Resumen

Perspectra-dinov2-scene-base es una conversión a ONNX de los pesos de segmentación semántica de DINOv2 de Meta, concretamente la cabeza lineal entrenada sobre el conjunto ADE20K y publicada junto con el backbone ViT-B/14. El modelo no introduce arquitectura nueva: empaqueta en un único grafo ONNX el backbone DINOv2 ViT-B/14 y la cabeza lineal de 150 clases de ADE20K, con el objetivo de facilitar su despliegue en entornos de inferencia que no dispongan de PyTorch o que requieran ejecución portable (ONNX Runtime, TensorRT, OpenVINO).

La relevancia de esta ficha es acotada: se trata de un artefacto de conversión de 0,3 GB, sin descargas ni interacciones en el momento de la consulta, orientado a un proyecto denominado Perspectra. No es un modelo generativo ni un modelo de lenguaje: es un segmentador denso de imágenes que asigna una de las 150 categorías de ADE20K a cada píxel de una entrada RGB normalizada con estadísticas de ImageNet y resolución fija de 512×512.

Dado que la model card es mínima y no aporta datos de entrenamiento, evaluación ni benchmarks propios, esta ficha se limita a describir lo que el autor declara explícitamente y a marcar como "no disponible" todo aquello que no consta en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer ViT-B/14 (DINOv2) con cabeza lineal de segmentación |
| Parámetros totales | no disponible (ViT-B/14 de DINOv2 tiene ~86 M de parámetros en el backbone; el total con la cabeza no consta en la información) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija de 512×512 píxeles) |
| Tipos de cuantización | no disponible (el artefacto publicado es ONNX en float32; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Entrada | Tensor RGB float32 [1, 3, 512, 512], normalizado con estadísticas de ImageNet |
| Salida | Tensor de scores ADE20K [1, 150, 128, 128], orden de clases con índice base cero |
| Tamaño del repositorio | 0,3 GB |
| Pipeline declarado en Hugging Face | no disponible |

## Arquitectura y entrenamiento

El modelo combina un backbone DINOv2 ViT-B/14 con una cabeza lineal de segmentación semántica. DINOv2 es un modelo de visión auto-supervisado desarrollado por Meta AI, entrenado con un objetivo de destilación auto-supervisada sobre un corpus de imágenes curado (LVD-142M según la publicación original de DINOv2); el backbone ViT-B/14 divide la imagen en parches de 14×14 píxeles. Sobre las características del backbone, la cabeza lineal proyecta los tokens a las 150 clases de ADE20K, un dataset de segmentación semántica de escenas interiores y exteriores.

La información proporcionada no detalla el proceso de entrenamiento de la cabeza lineal (número de épocas, resolución de entrenamiento, aumentos de datos, función de pérdida) ni si se aplicó algún ajuste fino adicional. Tampoco se documenta el proceso de conversión a ONNX (versión de opset, herramienta utilizada, verificación de equivalencia numérica respecto al modelo original en PyTorch). El autor remite al repositorio oficial de DINOv2 para los modelos y la licencia originales.

La innovación técnica relevante no es del artefacto en sí, sino del backbone subyacente: DINOv2 produce representaciones visuales densas de propósito general que, con una cabeza lineal ligera, alcanzan resultados competitivos en segmentación semántica sin necesidad de arquitecturas específicas de segmentación. La conversión a ONNX preserva esa ventaja y añade portabilidad de despliegue.

## Capacidades

- Segmentación semántica densa de imágenes en 150 clases de ADE20K (cielo, edificio, vegetación, mobiliario, personas, vehículos, etc., según la taxonomía del dataset).
- Extracción de características visuales de propósito general a través del backbone DINOv2 ViT-B/14, reutilizable para otras tareas con cabezas adicionales.
- Inferencia en formato ONNX, ejecutable en ONNX Runtime, TensorRT, OpenVINO u otros runtimes compatibles.
- Entrada de resolución fija 512×512 con normalización ImageNet; no admite resolución variable sin reescalado previo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: no es un modelo de lenguaje.
- No soporta visión-lenguaje, audio ni modalidades distintas de la imagen RGB.
- Capacidades multilingües: no aplica.

## Casos de uso

- Segmentación de escenas en pipelines de visión por computador: el modelo recibe una imagen RGB reescalada a 512×512 y devuelve un mapa de 128×128 con 150 clases, útil para preprocesar imágenes antes de tareas de detección o reconocimiento.
- Despliegue en entornos sin PyTorch: al estar en ONNX, puede ejecutarse en servicios en C++, C#, Java o en dispositivos con ONNX Runtime, lo que facilita su integración en backends heterogéneos.
- Aceleración por hardware específico: la conversión a TensorRT u OpenVINO permite aprovechar GPUs NVIDIA o aceleradores Intel en inferencia por lotes de imágenes.
- Etiquetado automático de datasets de imágenes: la salida densa por píxel sirve para preanotar escenas ADE20K y reducir el coste de anotación manual en proyectos de percepción visual.
- Análisis de escenas interiores y exteriores: la taxonomía ADE20K cubre clases de habitaciones, mobiliario, vegetación y estructuras, adecuada para aplicaciones de realidad aumentada, robótica de interior o análisis de imágenes inmobiliarias.
- Componente de un sistema mayor de comprensión de escena: las características del backbone DINOv2 pueden extraerse y combinarse con otras cabezas para profundidad, detección o clasificación, reutilizando un único grafo ONNX.
- Prototipado rápido en investigación: al ser un artefacto ligero (0,3 GB) y con licencia Apache 2.0, permite experimentar con segmentación semántica sin gestionar dependencias de PyTorch ni pesos dispersos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del artefacto (0,3 GB en float32) y la arquitectura ViT-B/14, la inferencia en float32 requiere del orden de 1-2 GB de memoria, pero esta cifra no consta en la información proporcionada.
- GPU recomendadas: no disponible. Al ser un modelo ViT-B/14 de tamaño moderado, es compatible con GPUs de consumo, pero no se documentan modelos concretos ni requisitos mínimos.
- ¿Cabe en GPU de consumo? No confirmado en la información; por tamaño del backbone es plausible, pero no se aporta dato verificado.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), TensorRT, OpenVINO u otros runtimes compatibles con ONNX. No se documenta compatibilidad con vLLM, llama.cpp u Ollama, que no aplican a un modelo de visión.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto/entrada | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Perspectra-dinov2-scene-base | ViT-B/14 + cabeza lineal | no disponible (backbone ~86 M) | 512×512 RGB | Apache 2.0 | ONNX | Hugging Face (0 descargas) |
| DINOv2 ViT-B/14 + cabeza ADE20K (original, Meta) | ViT-B/14 + cabeza lineal | ~86 M backbone | resolución variable | Apache 2.0 (según repo original) | PyTorch | GitHub facebookresearch/dinov2 |
| Segment Anything (SAM) | ViT + prompt encoder + mask decoder | variable según variante | resolución variable | Apache 2.0 | PyTorch | Meta AI |
| SegFormer (ADE20K) | Transformer jerárquico | variable según variante | resolución variable | Apache 2.0 / MIT según variante | PyTorch | Hugging Face |

La comparación con SAM y SegFormer es orientativa por categoría de tarea (segmentación), no por equivalencia exacta de arquitectura ni de rendimiento; no se dispone de métricas comparativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de visión sin capacidades de lenguaje: no genera texto, no razona y no admite instrucciones en lenguaje natural.
- Entrada rígida: resolución fija 512×512 y normalización ImageNet; imágenes de otra resolución deben reescalarse y normalizarse externamente, lo que puede degradar la segmentación de objetos pequeños.
- Salida de baja resolución relativa: el mapa de scores es de 128×128 para una entrada de 512×512, por lo que los contornos finos pueden perderse; se requiere interpolación para obtener máscaras a resolución completa.
- Taxonomía cerrada de 150 clases ADE20K: cualquier objeto fuera de esas categorías se asignará a la clase más próxima, con riesgo de errores sistemáticos.
- Sin datos de evaluación publicados: no hay métricas (mIoU, precisión por clase) que permitan verificar la fidelidad de la conversión ONNX respecto al modelo original en PyTorch.
- Riesgo de sesgo heredado del backbone DINOv2 y del dataset ADE20K: la distribución de escenas y clases del dataset condiciona el comportamiento del modelo en dominios no representados.
- Licencia Apache 2.0 permite uso comercial, pero el autor remite a la licencia del repositorio original de DINOv2; conviene verificar los términos de los pesos originales antes de un despliegue en producción.
- Artefacto con 0 descargas y 0 interacciones: no hay evidencia de uso en producción ni de validación por parte de la comunidad.
- No se documenta el opset de ONNX ni la herramienta de conversión, lo que dificulta reproducir o auditar el artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/ShaderError/perspectra-dinov2-scene-base
- Repositorio original de DINOv2 (modelos y licencia): https://github.com/facebookresearch/dinov2/tree/7764ea0f912e53c92e82eb78a2a1631e92725fc8
- Paper de DINOv2: no disponible en la información proporcionada
- Blog o demo del proyecto Perspectra: no disponible en la información proporcionada
