# Blaize-AI/ConvNeXtV1s_ImageNet

## Resumen

ConvNeXtV1s_ImageNet es un clasificador de imágenes derivado de ConvNeXt, la arquitectura convolucional pura propuesta por Meta AI Research ("A ConvNet for the 2020s") como alternativa moderna a los Vision Transformers. La variante aquí publicada corresponde al tamaño "small" (V1s) y ha sido optimizada por Blaize-AI para su despliegue sobre aceleradores Xplorer mediante el SDK Picasso, que compila y ejecuta grafos de inferencia sobre el procesador GSP (Graph Streaming Processor) de Blaize, orientado a inferencia en el borde con bajo consumo y baja latencia.

El repositorio no contiene pesos en formato estándar (safetensors, ONNX o GGUF), sino un artefacto propietario `.bm` (Blaize Model) en precisión BF16 y resolución de entrada de 224×224 píxeles. Esto implica que el modelo no es utilizable con PyTorch, TensorFlow, ONNX Runtime ni llama.cpp: requiere hardware Blaize y el SDK Picasso para cargarse y ejecutarse. El tamaño del repositorio es de aproximadamente 0,1 GB.

La relevancia de esta ficha es acotada: se trata de un artefacto de despliegue para un acelerador específico, no de un modelo generalista. Para desarrolladores que evalúen Blaize GSP como plataforma de inferencia en el borde, este repositorio ofrece un clasificador ImageNet listo para ejecutar; para el resto de casos de uso, conviene acudir a los pesos originales de ConvNeXt publicados por Meta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt (red convolucional pura, variante V1 small) |
| Parametros totales | no disponible (el tamaño "small" de ConvNeXt V1 ronda los 50 M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 224×224 píxeles) |
| Tipos de cuantizacion | BF16 (variante publicada); el SDK Picasso soporta ademas INT8 y AMP segun la model card |
| Idiomas soportados | no disponible (clasificacion de imagenes, sin interfaz de lenguaje) |
| Licencia | MIT |
| Formato de pesos | `.bm` (Blaize Model), artefacto propietario del SDK Picasso |

## Arquitectura y entrenamiento

La arquitectura subyacente es ConvNeXt, una red neuronal convolucional que moderniza el diseño de ResNet incorporando elementos propios de los Vision Transformers: kernels de convolución depthwise de 7×7, normalización por capas en lugar de batch normalization, activación GELU, menos capas de normalización y un esquema de downsample con capas separadas. El resultado es una CNN competitiva con Swin Transformer en precisión manteniendo la simplicidad de las convoluciones. La variante "small" es la segunda más pequeña de la familia V1.

El entrenamiento original se realizó sobre ImageNet 2012 (1,28 millones de imágenes de entrenamiento, 1.000 clases), según indica la model card. No se especifican en la información proporcionada el número de épocas, la composición exacta del dataset, ni si hubo técnicas de aumento de datos o destilación adicionales. Blaize no ha reentrenado el modelo: ha realizado únicamente optimizaciones específicas de hardware para que el grafo sea compatible con el procesador GSP, que ejecuta operaciones mediante un modelo de streaming de grafos orientado a minimizar latencia y consumo energético.

## Capacidades

- Clasificación de imágenes en las 1.000 clases de ImageNet 2012.
- Inferencia en precisión BF16 a resolución fija de 224×224 píxeles.
- Ejecución sobre aceleradores Blaize Xplorer mediante el SDK Picasso.
- Inspección y validación del artefacto con la utilidad `blaize-modeltool`.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multimodales más allá de la clasificación de imagen.
- No dispone de interfaz conversacional ni de procesamiento de lenguaje natural.

## Casos de uso

- Clasificación de imágenes en el borde: el modelo puede ejecutarse sobre un acelerador Xplorer en dispositivos con restricciones de consumo, clasificando imágenes de entrada en tiempo real sin depender de la nube, gracias a la arquitectura GSP orientada a baja latencia.
- Inspección visual en líneas de producción industrial: integrado en un pipeline de captura de cámara, el clasificador permite etiquetar piezas o detectar categorías de producto en la propia planta, evitando el envío de imágenes a un servidor central.
- Preprocesado en sistemas de videovigilancia: clasificación de fotogramas a 224×224 para filtrar o etiquetar escenas antes de un análisis más costoso, aprovechando la eficiencia energética del acelerador.
- Prototipado de aplicaciones de visión con el SDK Picasso: el artefacto `.bm` sirve como referencia para validar el flujo de compilación y despliegue de modelos propios sobre GSP, usando `blaize-modeltool info` para inspeccionar el grafo.
- Investigación en eficiencia de inferencia: útil para comparar latencia y consumo de ConvNeXt small en BF16 sobre GSP frente a GPU o CPU, en estudios de despliegue en el borde.
- Clasificación de imágenes en entornos sin conectividad: al ejecutarse localmente sobre hardware dedicado, es adecuado para escenarios remotos o aislados donde no hay acceso a servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión top-1/top-5 en ImageNet, latencia, throughput ni consumo energético sobre el acelerador Xplorer. Tampoco se ofrecen comparaciones con otras variantes de cuantización (INT8 o AMP) más allá de la BF16 publicada.

## Requisitos de hardware

- Requiere un acelerador Blaize Xplorer y el SDK Picasso instalado y configurado; no es ejecutable en GPU comercial, CPU genérica ni en plataformas sin soporte GSP.
- El artefacto publicado es BF16 con entrada 224×224; el SDK permite además compilar variantes INT8 y AMP, según la model card, aunque no se incluyen en este repositorio.
- No cabe en GPU de consumo (RTX 4090, etc.) porque el formato `.bm` no es compatible con runtimes estándar como PyTorch, ONNX Runtime, vLLM, llama.cpp, Ollama o TGI.
- Opciones de despliegue: exclusivamente mediante el SDK Picasso sobre hardware Blaize.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Formato | Licencia | Plataforma |
|---|---|---|---|---|---|
| ConvNeXtV1s_ImageNet (Blaize) | no disponible (aprox. 50 M en la variante small original, sin confirmar) | 224×224 | `.bm` (BF16) | MIT | Blaize Xplorer + Picasso SDK |
| ConvNeXt V1 small (Meta, original) | aprox. 50 M (dato no confirmado en la información proporcionada) | 224×224 | PyTorch / safetensors | MIT | GPU, CPU |
| ResNet-50 | aprox. 25 M (dato no confirmado en la información proporcionada) | 224×224 | PyTorch / ONNX | BSD-3 | GPU, CPU, edge |
| EfficientNet-B0 | aprox. 5 M (dato no confirmado en la información proporcionada) | 224×224 | PyTorch / ONNX / TFLite | Apache 2.0 | GPU, CPU, móvil |

La comparación relevante no es de precisión (no hay datos publicados en este repositorio) sino de portabilidad: frente a los pesos originales de ConvNeXt, este artefacto solo es utilizable en hardware Blaize, mientras que las alternativas son ejecutables en runtimes estándar.

## Limitaciones y advertencias

- El formato `.bm` es propietario y no interoperable con ecosistemas estándar de inferencia; sin hardware Blaize el modelo es inutilizable.
- No se han publicado métricas de precisión ni de rendimiento para esta variante optimizada; no puede asumirse que la precisión coincida con la del modelo original de Meta.
- Restringido a clasificación de imágenes; no cubre detección, segmentación, generación ni tareas multimodales.
- El modelo original puede heredar sesgos del dataset ImageNet 2012 (representación desigual de clases, sesgos geográficos y culturales); no se documenta ningún análisis de sesgo en esta publicación.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de clasificaciones erróneas en dominios alejados de ImageNet (imágenes médicas, industriales específicas, etc.).
- La licencia MIT se aplica al modelo, pero el uso del SDK Picasso y del hardware Blaize puede estar sujeto a condiciones comerciales adicionales no detalladas en la model card.
- El dataset ImageNet tiene su propia licencia (LicenseRef-ImageNet) que conviene revisar para usos comerciales derivados.
- La model card descarga la responsabilidad sobre el contenido de terceros a Blaize y no ofrece garantías de no infracción de propiedad intelectual.

## Enlaces

- Hugging Face: https://huggingface.co/Blaize-AI/ConvNeXtV1s_ImageNet
- Repositorio original de ConvNeXt (Meta): https://github.com/facebookresearch/ConvNeXt
- Pesos preentrenados originales: https://github.com/facebookresearch/ConvNeXt
- ImageNet: https://www.image-net.org/
- Blaize: https://www.blaize.com
- Paper de referencia (citado en la model card): "A ConvNet for the 2020s" (Liu et al., Meta AI Research)
