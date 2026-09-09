# Buuta/controlnet-union-sdxl-for-Snapdragon-X-Elite

## Resumen

Buuta/controlnet-union-sdxl-for-Snapdragon-X-Elite es una versión precompilada y optimizada del modelo ControlNet Union para Stable Diffusion XL, desarrollada por Buuta. Su objetivo es ejecutarse íntegramente en el NPU (Neural Processing Unit) de los procesadores Snapdragon X Elite mediante ONNX Runtime con el QNN Execution Provider (QNN EP), usando precisión FP16. El modelo parte de xinsir/controlnet-union-sdxl-1.0 y mantiene la licencia Apache 2.0. El repositorio ocupa 2,5 GB y no incluye el modelo base de difusión; se necesita un SDXL base para generar imágenes. ControlNet Union permite condicionar la generación con más de 10 tipos de control (pose, profundidad, bordes, etc.) sin aumentar el coste computacional, lo que hace a esta versión especialmente relevante para desarrolladores que buscan herramientas de control de difusión en dispositivos ARM con NPU, sin depender de una GPU dedicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ControlNet para Stable Diffusion XL (ControlNetUnion) |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de control de difusión) |
| Tipos de cuantización | FP16 (precompilado para QNN EP) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (precompilado) |

## Arquitectura y entrenamiento

El modelo usa la arquitectura ControlNetUnion, implementada sobre Stable Diffusion XL. Esta arquitectura permite múltiples entradas de condicionamiento simultáneas (las mismas que se pueden pasar a un ControlNet separado) sin incrementar el coste computacional, puesto que utiliza un único bloque de ControlNet en lugar de uno por tipo de control. En esta variante concreta, el modelo se ha convertido y precompilado a ONNX con operandos en FP16, optimizado para el QNN EP de Snapdragon X Elite.

No se ha publicado información sobre datos de entrenamiento ni sobre el proceso de optimización más allá de la conversión; tampoco hay evidencia de ajuste fino con RLHF o DPO, al tratarse de un modelo de control de difusión, no un modelo de lenguaje.

## Capacidades

- Generación de imágenes condicionadas con más de 10 tipos de control: pose (OpenPose), profundidad, bordes (Canny), normal maps, etc.
- Ejecución 100 % local en el NPU Snapdragon X Elite, sin necesidad de GPU o servicios en la nube.
- Compatibilidad con ONNX Runtime y QNN EP, lo que simplifica el despliegue en dispositivos Qualcomm.
- Precisión FP16 para reducir el uso de memoria y la latencia.
- No dispone de soporte de tool calling, ni funciones de agente, ni capacidades de texto más allá del prompt de entrada.
- Puede integrarse en pipelines de text-to-image junto a un modelo base SDXL.

## Casos de uso

- Edición de imágenes local en portátiles Snapdragon X Elite: se puede utilizar ControlNet con bordes o profundidad para retocar fotografías de producto sin enviar los datos a la nube, aprovechando la NPU para una generación rápida y privada.
- Generación de concept art en equipos sin GPU: un estudio de videojuegos puede usar el modelo en portátiles con Snapdragon X Elite para crear variantes de personajes a partir de esqueletos o bocetos, reduciendo la dependencia de estaciones de trabajo con GPU.
- Diseño de interiores con mapas de profundidad: el modelo recibe una imagen con información de profundidad y genera propuestas de decoración alternativas, manteniendo la estructura espacial de la habitación y ejecutando todo el proceso offline.
- Simulación de poses específicas para accesibilidad: se puede indicar un esqueleto con una postura concreta, como una persona en silla de ruedas, para generar imágenes de prueba de interfaces y entornos accesibles.
- Prototipado de interfaces de usuario: partiendo de un boceto a trazos (Canny), el modelo genera diseños de UI de alta fidelidad, permitiendo iteraciones rápidas en equipos con Snapdragon X Elite.
- Generación de texturas y normal maps para realidad aumentada: el ControlNet puede generar mapas de normales o texturas a partir de geometrías simples, integrándose en aplicaciones móviles que usan la NPU para mantener un bajo consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se requiere GPU dedicada: el modelo está precompilado para el NPU Snapdragon X Elite (QNN EP).
- VRAM estimada: no disponible. El modelo se ejecuta en el NPU, utilizando la memoria unificada del dispositivo; el repositorio ocupa 2,5 GB.
- GPUs recomendadas: no aplica. Si se intenta ejecutar en GPU, el formato ONNX no está optimizado para ello.
- Si cabe en consumer GPU: no aplica. No se distribuye en formato optimizado para CUDA; se necesitaría una conversión manual no documentada.
- Opciones de despliegue: ONNX Runtime con QNN EP, junto con un modelo base SDXL.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Formato | Licencia | Ejecución |
|---|---|---|---|---|
| Buuta/controlnet-union-sdxl-for-Snapdragon-X-Elite | ControlNetUnion SDXL | ONNX (FP16) | Apache 2.0 | NPU Snapdragon X Elite |
| xinsir/controlnet-union-sdxl-1.0 | ControlNetUnion SDXL | Safetensors | Apache 2.0 | GPU (CUDA) |

No se dispone de información suficiente para comparar con otras alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo solo está optimizado para Snapdragon X Elite con NPU y QNN EP; no se garantiza funcionamiento en otras plataformas.
- No incluye el modelo base SDXL; para producir imágenes se necesita cargar además un checkpoint SDXL.
- La conversión a FP16 puede introducir diferencias de calidad respecto al modelo original en FP32.
- No se han publicado evaluaciones de calidad de imagen ni métricas de rendimiento para esta variante.
- Al derivar de xinsir/controlnet-union-sdxl-1.0, hereda los sesgos y limitaciones de los datos de entrenamiento de ese modelo.
- La licencia Apache 2.0 permite uso comercial, pero obliga a mantener el aviso de licencia y atribución.

## Enlaces

- [Buuta/controlnet-union-sdxl-for-Snapdragon-X-Elite](https://huggingface.co/Buuta/controlnet-union-sdxl-for-Snapdragon-X-Elite)
- [xinsir/controlnet-union-sdxl-1.0](https://huggingface.co/xinsir/controlnet-union-sdxl-1.0)
- [Documentación de ControlNetUnionModel](https://huggingface.co/docs/diffusers/v0.35.0/api/models/controlnet_union)
