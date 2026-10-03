# Kaziko/moge-2-vitl-normal-coreml

## Resumen

Kaziko/moge-2-vitl-normal-coreml es una conversión no oficial a Core ML del modelo MoGe-2 ViT-L en su variante normal, desarrollado originalmente por el equipo de MoGe (Microsoft) y publicado como Ruicheng/moge-2-vitl-normal. Se trata de la red de 331 M de parámetros convertida a un paquete mlpackage para Macs con Apple silicon, de modo que el editor fotográfico Re-Light Studio pueda ejecutarla sin depender de Python ni de PyTorch.

El modelo resuelve la estimación de geometría monocular a partir de una única imagen RGB: produce normales de superficie, un point map 3D, una máscara de validez y una escala métrica. Los pesos son los originales; solo cambian el formato de fichero y la precisión numérica de algunas capas. La conversión no está avalada ni soportada por los autores de MoGe, Microsoft ni Meta.

Es relevante porque traslada un modelo de geometría de gama alta a aplicaciones nativas de Apple con una latencia de 0,61 s por foto en un M2 Max, a cambio de prescindir del post-proceso de inferencia original (recuperación de distancia focal y profundidad métrica).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer ViT-L con backbone DINOv2 y cabezas de MoGe-2 (estimación de geometría monocular); empaquetado en Core ML |
| Parametros totales | 331 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión; rejilla de entrada fija de 728×966 o 966×728 píxeles) |
| Tipos de cuantizacion | precisión mixta: float16 en la red y float32 en la última capa de las cabezas; no se distribuyen variantes int8/int4 |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | MIT (código y pesos de MoGe); backbone DINOv2 bajo Apache-2.0; script de conversión y model card bajo MIT |
| Formato de pesos | Core ML mlpackage comprimido en zip (623 799 857 bytes; 692 MB descomprimido) |
| Funciones incluidas | landscape (1×3×728×966, tokens 52×69, rejilla de salida 832×1104) y portrait (1×3×966×728, tokens 69×52, rejilla de salida 1104×832) |
| Salidas | normal (vectores unitarios, marco de cámara OpenCV: x derecha, y abajo, z alejándose), points (point map tras el remap exp; el canal 2 es la z cruda), mask (tras sigmoide) y metric_scale; todas float32 en formato NCHW |
| Unidades de computo recomendadas | MLComputeUnits.cpuAndGPU |
| Modelo base | Ruicheng/moge-2-vitl-normal, revisión cb0e8bbd6b1e243589717c78e750b1ba4c093acf |
| SHA-256 del zip | e0d3a37075721d1d7e8e0a25b2ef107f99457a9f44f5a1eb8fdf5d7a8445e464 |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer ViT-L con backbone DINOv2 al que se añaden las cabezas de MoGe-2 para estimar geometría monocular. El paquete Core ML expone dos funciones que comparten una única copia de los pesos: landscape y portrait. Cada función incorpora internamente la interpolación de los position embeddings y los planos UV correspondientes a su propia rejilla, por lo que cualquier otra relación de aspecto requiere una función adicional o un letterbox previo. La conversión se realizó con coremltools 9.0 y PyTorch 2.14, e introduce un shim de tres líneas para un cast que coremltools 9.0 pliega de forma incorrecta bajo NumPy 2.5.

La innovación técnica destacable de esta conversión es el esquema de precisión mixta: float16 en toda la red salvo la última capa de las cabezas, que permanece en float32 a la resolución completa de salida. El float16 puro produce banding en la profundidad (1 490 valores z distintos en un parche de una cara, frente a 131 077 con float32), mientras que el paquete mixto conserva 130 819. Los detalles de entrenamiento de MoGe-2 (número de tokens, composición del dataset, uso de RLHF o DPO) no se recogen en la información disponible de esta conversión, ya que se trata únicamente de un cambio de formato sobre los pesos originales.

## Capacidades

- Estimación de profundidad monocular: la salida points incluye el point map tras el remap exp, y su canal 2 contiene la z cruda.
- Estimación de normales de superficie: la salida normal entrega vectores unitarios en el marco de cámara OpenCV (x derecha, y abajo, z alejándose).
- Point map 3D de la escena a partir de una sola imagen RGB.
- Máscara de validez (salida mask, tras la sigmoide) y escala métrica (metric_scale).
- Dos orientaciones precompiladas: landscape y portrait.
- Ejecución en Apple silicon vía Core ML, sin necesidad de Python ni de PyTorch en tiempo de inferencia.
- No dispone de tool calling, function calling, soporte de agentes ni razonamiento multi-step: es un modelo de visión, no un modelo de lenguaje.
- No tiene capacidades multilingües ni de generación de texto.
- No incluye el post-proceso infer de MoGe (recuperación de distancia focal y de shift, ni profundidad métrica); la salida es la red tal y como la ejecuta MoGeModel.forward.

## Casos de uso

- Edición fotográfica con re-iluminación: el editor Re-Light Studio usa las normales de superficie y el point map para recolocar la iluminación de una foto de forma coherente con la geometría de la escena.
- Desenfoque de fondo y efecto bokeh sintético: la salida de profundidad (z cruda) permite separar primer plano y fondo sin necesidad de mapas manuales.
- Reconstrucción 3D aproximada de una escena a partir de una sola foto, usando el point map y la escala métrica para situar la geometría en unidades reales.
- Realidad aumentada en apps macOS o iOS: la combinación de profundidad y normales sirve para anclar objetos virtuales sobre superficies reales con orientación correcta.
- Integración en aplicaciones de edición nativas de Apple que no pueden depender de Python ni de PyTorch, mediante el paquete mlpackage y las unidades de cómputo cpuAndGPU.
- Composición y retoque consciente de la geometría: las normales permiten aplicar filtros o sombras simuladas que respetan la orientación de cada superficie.
- Automatización por lotes en Mac: con 0,61 s por foto en un M2 Max, se pueden procesar colecciones completas de imágenes sin infraestructura de GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K y similares) en la información disponible, y no proceden para un modelo de geometría monocular. Sí se ofrecen métricas de fidelidad de la conversión frente a la red PyTorch en float32, medidas sobre cuatro imágenes en ambas orientaciones (8 ejecuciones):

| Métrica (frente a la red PyTorch float32) | Resultado |
|---|---|
| Normales de superficie | dentro de 0,17° en el percentil 99 |
| Profundidad z cruda | dentro de 5e-3 de su rango escalado por percentil |
| Máscaras | idénticas |
| Escala métrica | dentro del 0,13 % |
| Latencia en M2 Max | 0,61 s por foto |

## Requisitos de hardware

- No aplica el concepto de VRAM en GPU CUDA: el paquete está pensado para Apple silicon y se ejecuta mediante Core ML, sin soporte de CUDA.
- Unidades de cómputo recomendadas: MLComputeUnits.cpuAndGPU. El Neural Engine resulta más lento para este modelo.
- Latencia medida: 0,61 s por foto en un M2 Max.
- Cabe en equipos de consumo: cualquier Mac con Apple silicon y memoria unificada suficiente. El zip ocupa 623 799 857 bytes y 692 MB descomprimido.
- Opciones de despliegue: Core ML (mlpackage) dentro de apps macOS o iOS. No aplican vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Reconversión: requiere coremltools 9.0 y PyTorch 2.14, mediante el script convert/moge_coreml.py incluido en el repositorio.
- Conviene verificar el SHA-256 del zip antes de su uso, dado que no hay validación externa publicada (0 descargas y 0 likes en el momento de la ficha).

## Comparativa con modelos similares

| Modelo | Parametros | Formato y precision | Salidas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kaziko/moge-2-vitl-normal-coreml (este modelo) | 331 M | Core ML mlpackage, fp16/fp32 mixto | normal, points, mask, metric_scale | MIT + Apache-2.0 (DINOv2) | HuggingFace |
| Ruicheng/moge-2-vitl-normal (original en PyTorch) | 331 M | PyTorch, fp32 | mismas salidas de red, más post-proceso infer (focal, shift y profundidad métrica) | MIT | HuggingFace |
| Depth Anything V2 / Marigold (categoría de profundidad monocular) | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible |

Los pesos de este modelo y del original en PyTorch son idénticos; la diferencia es el formato y la precisión numérica, además de la ausencia del post-proceso infer en la versión Core ML. Otras alternativas de la misma categoría (Depth Anything V2, Marigold) no cuentan con especificaciones en la información proporcionada, por lo que no se pueden comparar numéricamente; además, se centran en profundidad monocular y no ofrecen de forma nativa el point map ni las normales de superficie que sí entrega MoGe-2.

## Limitaciones y advertencias

- Conversión no oficial: no está hecha, avalada ni soportada por los autores de MoGe, Microsoft ni Meta.
- No incluye el post-proceso infer original: faltan la recuperación de distancia focal y de shift y la profundidad métrica, por lo que la salida es la red cruda y requiere post-proceso externo para obtener profundidad métrica.
- Rejillas de entrada fijas: solo existen las funciones landscape (728×966) y portrait (966×728); cualquier otra relación de aspecto necesita una nueva función o un letterbox.
- Restricciones de precisión: el float16 puro provoca banding en la profundidad (1 490 valores z distintos frente a 131 077 en float32 por parche); el paquete mixto conserva 130 819, pero no iguala al float32 completo.
- La validación de fidelidad se hizo sobre una muestra reducida (cuatro imágenes y ocho ejecuciones), por lo que no es una evaluación exhaustiva.
- El Neural Engine es más lento para este modelo; hay que forzar MLComputeUnits.cpuAndGPU para obtener el rendimiento indicado.
- No hay datos publicados sobre sesgos, composición del dataset de entrenamiento ni cobertura idiomática o demográfica del modelo base; estos datos no están disponibles en la información proporcionada.
- Licencias múltiples: los pesos de MoGe son MIT, pero el backbone DINOv2 es Apache-2.0, por lo que deben respetarse ambas condiciones al redistribuir o usar comercialmente.
- Sin soporte de CUDA ni de GPUs de NVIDIA: solo Apple silicon.
- Adopción nula en el momento de la ficha (0 descargas, 0 likes), lo que implica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kaziko/moge-2-vitl-normal-coreml
- Modelo base en HuggingFace: https://huggingface.co/Ruicheng/moge-2-vitl-normal
- Repositorio de código de MoGe: https://github.com/microsoft/MoGe (commit 07444410f1e33f402353b99d6ccd26bd31e469e8)
- Referencias del paper de MoGe-2 y del paper de DINOv2: recogidas en el repositorio de MoGe.
