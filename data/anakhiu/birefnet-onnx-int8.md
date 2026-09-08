# anakhiu/birefnet-onnx-int8

## Resumen

BiRefNet ONNX INT8 es un modelo de segmentación de imágenes para eliminación de fondo, desarrollado por anakhiu. Se trata de una cuantización INT8 dinámica del modelo `onnx-community/BiRefNet_dynamic-1024x1024-ONNX`, que a su vez es una exportación de `ZhengPeng7/BiRefNet_dynamic`. El objetivo de esta publicación es ofrecer una versión cuantizada de BiRefNet, que no existía públicamente, reduciendo el tamaño del archivo de 927 MiB a 301 MiB (3.1 veces más pequeño) sin pérdidas medibles en la calidad de las máscaras generadas.

El modelo está disponible en formato ONNX y utiliza cuantización dinámica `quint8`. La entrada es una imagen de tamaño fijo de 1024x1024 píxeles, y la salida son logits crudos que requieren una operación sigmoid para obtener la máscara final. La inferencia se ha probado en CPU con tiempos de 13 a 15 segundos por pasada. La licencia es MIT, lo que permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BiRefNet (segmentación de imágenes) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión) |
| Tipos de cuantizacion | INT8 (quint8) |
| Idiomas soportados | no disponible (modelo de visión) |
| Licencia | MIT |
| Formato de pesos | ONNX (archivo .onnx) |

## Arquitectura y entrenamiento

El modelo es una cuantización INT8 dinámica de un export ONNX de BiRefNet, un modelo de segmentación de imágenes orientado a la eliminación de fondo. El proceso de cuantización se realizó en dos pasos: primero se plegaron 99 nodos `Identity` del grafo ONNX mediante un script de `fold_identity.py`, y después se aplicó cuantización dinámica `quint8` con `quantize.py` sobre el modelo plegado. Este plegado fue necesario porque el cuantizador dinámico de ONNX Runtime solo convierte multiplicaciones de matrices cuando el segundo operando es un inicializador conectado directamente al nodo; en el export original, 99 de los pesos más grandes (incluidas las matrices de atención de 37.7 MB) llegaban a sus operaciones a través de nodos `Identity`, lo que impedía su cuantización y provocaba que el archivo final fuera más grande que el original. Tras el plegado, el modelo cuantizado pesa 301 MiB.

Los datos de entrenamiento y el proceso de entrenamiento original no están disponibles en la información proporcionada. La cuantización es la única innovación técnica destacable, ya que no se realizó ningún reentrenamiento ni ajuste de pesos.

## Capacidades

- Eliminación de fondo de imágenes (background removal) mediante segmentación semántica.
- Generación de máscaras de alta resolución a partir de imágenes de entrada de 1024x1024 píxeles.
- Salida de logits crudos con rango medido de [-27, +80], que requieren una operación sigmoid aplicada exactamente una vez.
- Preprocesamiento específico: división por 255, normalización ImageNet (media [0.485, 0.456, 0.406] y desviación [0.229, 0.224, 0.225]) y transformación a cuadrado (squash), no letterbox.
- No soporta tool calling, agentes ni generación de texto, al ser un modelo puramente de visión.
- No presenta capacidades multilingües, ya que no procesa lenguaje natural.

## Casos de uso

- Recorte de productos para e-commerce: el modelo genera máscaras precisas que permiten aislar productos sobre fondo transparente. La cuantización INT8 reduce el peso del modelo a 301 MiB, facilitando su despliegue en servidores de producción.
- Automatización de pipelines de contenido visual: en flujos de trabajo de generación de imágenes para redes sociales o publicidad, el modelo puede eliminar fondos automáticamente sin intervención manual, gracias a su integración con ONNX Runtime.
- Preprocesamiento para visión por computador: aislar el sujeto de una imagen antes de pasarla a un modelo de clasificación o detección puede mejorar la precisión al eliminar el ruido del fondo.
- Herramientas de edición de imágenes en la nube: al ser un archivo ONNX de 301 MiB, puede alojarse en funciones serverless y procesar imágenes bajo demanda, reduciendo costes de almacenamiento y transferencia.
- Aplicaciones de escritorio o móviles de recorte de fondo: la cuantización permite ejecutar el modelo en dispositivos con recursos limitados, aunque la latencia en CPU es de 13 a 15 segundos por imagen.
- Producción de vídeo y efectos visuales: extracción de sujetos para keying y composición en postproducción, donde la calidad de los bordes de la máscara es crítica para un resultado limpio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, ya que se trata de un modelo de visión. La model card incluye una comparativa de calidad entre el modelo float y el cuantizado, medida como fracción de píxeles parcialmente alfa en cuatro imágenes de prueba:

| Imagen | Float | INT8 |
|---|---|---|
| Ilustración de dibujos animados | 6.34% | 6.39% |
| Marco ornamentado sobre negro | 10.73% | 10.44% |
| Fotografía nocturna | 0.60% | 0.63% |
| Póster cinematográfico | 3.63% | 3.74% |

La cobertura se movió como máximo 0.1 puntos, y los recortes resultan indistinguibles sobre un fondo de cuadros. En cuanto al rendimiento, la cuantización no acelera la inferencia: se midieron 13 a 15 segundos por pasada en CPU para el modelo INT8, frente a 14 a 21 segundos para el modelo float en la misma máquina.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada. El archivo pesa 301 MiB, lo que sugiere un uso bajo, pero no hay datos oficiales confirmados.
- GPU recomendadas: no disponible. La información solo menciona pruebas en CPU.
- ¿Cabe en GPU de consumo? Probablemente sí, dado el tamaño del archivo, pero no hay datos confirmados.
- Opciones de despliegue: ONNX Runtime en Python, con posibilidad de ejecución en CPU. No aplica vLLM, llama.cpp ni Ollama, al ser un modelo de visión en formato ONNX.
- Latencia: 13 a 15 segundos por pasada en CPU para el modelo INT8, frente a 14 a 21 segundos para el modelo float.

## Comparativa con modelos similares

| Modelo | Tamaño | Formato | Cuantización | Latencia CPU | Licencia |
|---|---|---|---|---|---|
| anakhiu/birefnet-onnx-int8 | 301 MiB | ONNX | INT8 (quint8) | 13-15 s | MIT |
| onnx-community/BiRefNet_dynamic-1024x1024-ONNX | 927 MiB | ONNX | Float32 | 14-21 s | MIT |
| ZhengPeng7/BiRefNet_dynamic | no disponible | PyTorch | Float32 | no disponible | no disponible |

No se han encontrado comparativas con otros modelos de eliminación de fondo en la información proporcionada.

## Limitaciones y advertencias

- La entrada tiene dimensiones fijas de 1024x1024 píxeles. A pesar del nombre "dynamic" heredado del modelo base, el export no acepta otros tamaños; cualquier otro tamaño produce un error de forma.
- La salida son logits crudos con rango medido de [-27, +80]. Es necesario aplicar una sigmoid exactamente una vez para obtener la máscara final.
- El preprocesamiento debe incluir división por 255, normalización ImageNet y transformación a cuadrado (squash), no letterbox.
- La cuantización INT8 no acelera la inferencia; solo reduce el tamaño del archivo en 3.1 veces.
- No hay información sobre sesgos o riesgos de alucinación, al ser un modelo de visión.
- La licencia MIT permite uso comercial, pero se debe verificar la licencia del modelo base original.

## Enlaces

- HuggingFace: https://huggingface.co/anakhiu/birefnet-onnx-int8
- Modelo base ONNX: https://huggingface.co/onnx-community/BiRefNet_dynamic-1024x1024-ONNX
- Modelo original PyTorch: https://huggingface.co/ZhengPeng7/BiRefNet_dynamic
- ONNX Model Zoo (referencia general): https://github.com/onnx/models
