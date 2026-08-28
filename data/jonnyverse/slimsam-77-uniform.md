# JONNYVERSE/slimsam-77-uniform

## Resumen

SlimSAM-77-Uniform es una versión comprimida del modelo Segment Anything (SAM) de Meta, desarrollada mediante un marco de poda y destilación que reduce el tamaño del modelo original manteniendo una calidad de segmentación cercana. El repositorio `JONNYVERSE/slimsam-77-uniform` proporciona los pesos en formato ONNX para su uso con la librería Transformers.js, lo que permite ejecutar el modelo directamente en el navegador o en entornos JavaScript. Este modelo resuelve el problema de la segmentación de objetos en imágenes a partir de prompts (puntos o cajas), ofreciendo una alternativa ligera y de bajo coste computacional frente al SAM original. Su relevancia actual radica en la creciente demanda de modelos de segmentación eficientes que puedan desplegarse en aplicaciones web y dispositivos con recursos limitados, sin necesidad de infraestructura GPU dedicada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) podado, basado en SAM |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen) |
| Tipos de cuantizacion | no disponible (pesos ONNX, sin cuantizacion declarada) |
| Idiomas soportados | no aplica (modelo visual) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

SlimSAM es una versión comprimida del modelo Segment Anything (SAM) de Meta. El proceso de compresión combina poda estructural y destilación de conocimiento, reduciendo el número de parámetros y la complejidad computacional respecto al SAM original. El modelo base `nielsr/slimsam-77-uniform` corresponde a la variante "uniform" de SlimSAM, que aplica una tasa de poda uniforme en todas las capas del transformer. El entrenamiento utiliza únicamente el 0,1 % de los datos empleados para entrenar SAM, según se describe en el paper correspondiente. El repositorio `JONNYVERSE/slimsam-77-uniform` contiene los pesos convertidos a ONNX mediante la herramienta Optimum de Hugging Face, específicamente para ser cargados con Transformers.js. No se dispone de información adicional sobre el número exacto de parámetros, la composición del dataset de entrenamiento ni el uso de técnicas de ajuste fino adicionales.

## Capacidades

- Segmentación de objetos en imágenes a partir de prompts de puntos o cajas.
- Generación de múltiples máscaras candidatas por prompt, con una puntuación de IoU (intersección sobre unión) asociada a cada una.
- Segmentación "everything" (segmentación automática de todos los objetos de la imagen) mediante un grid de puntos, aunque no está documentado explícitamente en este repositorio.
- Salida de máscaras binarias de alta resolución (por ejemplo, 410x614 en el ejemplo de la model card).
- Compatible con Transformers.js, lo que permite ejecución en navegador (WebGL/WebGPU) y en entornos Node.js.
- No soporta tool calling, agentes ni razonamiento multi-paso, al ser un modelo puramente visual.

## Casos de uso

- Recorte de objetos en imágenes: dado un punto o una caja que indica el objeto, el modelo genera una máscara precisa que permite extraer el objeto del fondo. Es útil en aplicaciones de edición fotográfica o composición de imágenes.
- Eliminación de fondo en tiempo real: gracias a su tamaño reducido, puede ejecutarse en el navegador para aplicaciones de videollamadas o captura de imágenes, permitiendo aislar a una persona u objeto sin necesidad de servidores.
- Anotación de datos para entrenamiento de otros modelos: los anotadores pueden usar SlimSAM como herramienta de pre-segmentación para acelerar la creación de datasets de segmentación semántica o de instancias.
- Segmentación interactiva en aplicaciones web: integración en herramientas de diseño gráfico o plataformas de edición online, donde el usuario hace clic en un objeto y la máscara se genera al instante.
- Automatización de flujos de trabajo de procesamiento de imágenes: en pipelines de análisis de imágenes médicas o industriales, donde se necesita aislar regiones de interés sin depender de un servidor GPU.
- Demostraciones educativas y prototipado rápido: al ser ligero y ejecutable en el navegador, sirve para enseñar conceptos de segmentación o para validar ideas de producto sin infraestructura compleja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye métricas comparativas (como mIoU o precisión) frente a otros modelos de segmentación. Se recomienda consultar el paper de SlimSAM para obtener datos de rendimiento, aunque no se proporciona un enlace directo en los materiales analizados.

## Requisitos de hardware

- El tamaño del repositorio es de 0,2 GB, lo que indica que los pesos ONNX ocupan aproximadamente 200 MB. Esto permite su ejecución en CPU sin necesidad de GPU.
- En navegador, Transformers.js utiliza WebGL o WebGPU para acelerar la inferencia, por lo que cualquier dispositivo con soporte para estas tecnologías (ordenadores portátiles, tablets, smartphones modernos) puede ejecutar el modelo.
- Para inferencia en Node.js o entornos de servidor, se puede ejecutar en CPU con un consumo de RAM inferior a 1 GB. En GPU, cabe en tarjetas con 1 GB de VRAM o menos, como las GPU integradas o tarjetas de gama baja.
- Opciones de despliegue: Transformers.js (navegador o Node.js), ONNX Runtime (con backend CPU o CUDA), y cualquier framework que soporte ONNX (por ejemplo, Hugging Face Inference Endpoints).
- La latencia estimada depende del hardware; en un portátil moderno con CPU, la generación de una máscara para una imagen de 1024x1024 suele tardar entre 100 y 300 ms, aunque no se dispone de mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SlimSAM-77-Uniform (este) | no disponible | imagen | Apache-2.0 | ONNX, Transformers.js |
| SAM ViT-B (original) | ~91 M | imagen | Apache-2.0 | PyTorch, ONNX |
| MobileSAM | ~5 M | imagen | Apache-2.0 | PyTorch, ONNX |

SlimSAM se posiciona como una alternativa intermedia entre SAM original y MobileSAM: más ligero que SAM ViT-B pero con mayor capacidad que MobileSAM, aunque no se dispone de métricas comparativas en la información analizada. La ventaja principal de este repositorio es su formato ONNX, que facilita la integración en aplicaciones web y móviles mediante Transformers.js, mientras que SAM original y MobileSAM requieren conversión adicional para estos entornos.

## Limitaciones y advertencias

- Al ser una versión comprimida, la precisión de las máscaras puede ser inferior a la del SAM original, especialmente en objetos pequeños o con bordes complejos.
- El modelo depende de la calidad de los prompts: puntos o cajas ambiguos pueden producir máscaras incorrectas.
- No maneja entradas de texto ni otros tipos de prompts más allá de puntos y cajas.
- La conversión a ONNX puede introducir ligeras diferencias numéricas respecto al modelo original en PyTorch, aunque no se han documentado casos concretos.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido ampliamente probado por la comunidad; se recomienda verificar su funcionamiento antes de usarlo en producción.
- La fecha de creación (2026-08-27) es posterior a la fecha actual, lo que puede indicar un error en los metadatos o un repositorio generado automáticamente.
- Licencia Apache-2.0 permite uso comercial y modificación, pero se debe mantener el aviso de copyright y la atribución.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/JONNYVERSE/slimsam-77-uniform
- Modelo base original: https://huggingface.co/nielsr/slimsam-77-uniform
- Repositorio con pesos ONNX similar (Xenova): https://huggingface.co/Xenova/slimsam-77-uniform
- Código y paper de SlimSAM: https://github.com/czg1225/SlimSAM
- Demo de segmentación en web: https://huggingface.co/spaces/Xenova/segment-anything-web
