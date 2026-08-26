# avencera/birefnet-coreml-gpu

## Resumen

BiRefNet es un modelo de segmentación de objetos salientes (salient object detection) de alta resolución, desarrollado por ZhengPeng7, que se ha convertido en la base de numerosas herramientas de eliminación de fondos. Este repositorio concreto, `avencera/birefnet-coreml-gpu`, es una conversión a Core ML del modelo original, optimizada para ejecutarse en CPU y GPU de Apple Silicon. La conversión sigue el trabajo de `imperatormk/coreml-birefnet` y produce un archivo `.mlpackage` con precisión float16, entrada de imagen de 1024x1024 píxeles y salida de máscara de segmentación.

La relevancia de esta conversión radica en que permite ejecutar BiRefNet de forma nativa en dispositivos Apple (Macs con chip M1 o posterior) sin depender de frameworks externos como PyTorch, aprovechando el acelerador gráfico integrado. El modelo original es conocido por su alta precisión en la separación de objetos del fondo, incluso en imágenes con bordes complejos o fondos similares al objeto. Esta versión Core ML facilita su integración en aplicaciones de escritorio o móviles del ecosistema Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BiRefNet (Swin Transformer + convoluciones deformables) |
| Parametros totales | no disponible (depende de la variante del modelo original) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | float16 (Core ML) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | MIT |
| Formato de pesos | Core ML `.mlpackage` |

## Arquitectura y entrenamiento

BiRefNet es un modelo de segmentación basado en Swin Transformer como backbone, complementado con convoluciones deformables para capturar detalles finos en los bordes. El modelo original fue entrenado con un conjunto de datos diverso de imágenes naturales y objetos salientes, utilizando una estrategia de entrenamiento en dos etapas: primero un preentrenamiento en tareas de segmentación genérica y luego un ajuste fino específico para detección de objetos salientes. La conversión a Core ML mantiene la arquitectura original pero la traduce al formato nativo de Apple, con pesos en float16 y soporte para ejecución en CPU y GPU. No se dispone de información detallada sobre el número de tokens de entrenamiento ni sobre el uso de RLHF o DPO, ya que estos datos pertenecen al modelo original y no se incluyen en esta conversión.

## Capacidades

- Segmentación de objetos salientes en imágenes de alta resolución (entrada de 1024x1024 píxeles).
- Generación de máscaras binarias o de probabilidad que separan el objeto principal del fondo.
- Manejo de bordes complejos, cabello, objetos translúcidos y fondos con texturas similares al objeto.
- Ejecución nativa en Apple Silicon mediante Core ML, con aceleración por GPU.
- Salida de máscara en formato de tensor, lista para postprocesado (por ejemplo, para recorte o composición).
- No incluye capacidades de texto, código, audio ni razonamiento multimodal; es exclusivamente un modelo de visión.

## Casos de uso

- Eliminación de fondos en fotografía de producto: el modelo puede generar una máscara precisa del producto, permitiendo reemplazar el fondo por un color sólido o una imagen de estudio. Su resolución de 1024x1024 es adecuada para imágenes de catálogo.
- Edición de retratos: separación de la persona del fondo para aplicar efectos de desenfoque, cambio de fondo o mejora selectiva. La precisión en bordes (pelo, ropa) es clave y BiRefNet destaca en ello.
- Automatización de flujos de diseño gráfico: integración en aplicaciones de escritorio para macOS que procesan lotes de imágenes, gracias a la conversión Core ML que evita dependencias de Python o PyTorch.
- Aplicaciones de realidad aumentada: extracción de objetos en tiempo real o casi tiempo real para superponerlos en entornos virtuales, aprovechando la aceleración GPU en Macs.
- Preparación de datasets para entrenamiento: generación de máscaras de segmentación para crear conjuntos de datos etiquetados, por ejemplo para entrenar otros modelos de visión.
- Plugins de software de edición (Photoshop, Affinity Photo, etc.): el modelo puede servir como motor de selección rápida de objetos, ofreciendo una alternativa local y sin conexión a servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo original BiRefNet reporta mejoras sobre métodos anteriores como U2Net y MODNet en métricas como S-measure y MAE, pero estos datos no están incluidos en la conversión Core ML. Para esta versión específica, no hay cifras de latencia o throughput publicadas.

## Requisitos de hardware

- Dispositivo: Mac con chip Apple Silicon (M1, M2, M3 o posterior) o Mac con GPU compatible con Core ML.
- VRAM: no aplica directamente, ya que Core ML gestiona la memoria unificada; se recomienda al menos 8 GB de RAM unificada para imágenes de 1024x1024.
- GPU: integrada en el chip Apple Silicon; la conversión está optimizada para CPU y GPU, no para la Neural Engine (ANE) según el repositorio de referencia.
- Opciones de despliegue: integración en apps de macOS o iOS mediante Core ML; también se puede usar con herramientas como `coremltools` para cargar el modelo en Python.
- Latencia y throughput: no disponibles; dependerán del chip concreto (M1 vs M3) y de la resolución de entrada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Resolucion de entrada | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BiRefNet (original) | Swin Transformer + deformable conv | 1024x1024 | PyTorch | MIT | HuggingFace |
| U2Net | U-Net con bloques residuales | 320x320 | PyTorch | Apache 2.0 | HuggingFace |
| MODNet | U-Net ligero | 512x512 | PyTorch | MIT | HuggingFace |

La conversión Core ML de BiRefNet ofrece la ventaja de ejecución nativa en Apple, mientras que U2Net y MODNet requieren conversión adicional o uso de frameworks externos. En términos de precisión, BiRefNet suele superar a ambos en benchmarks públicos, aunque no se dispone de datos específicos para esta conversión.

## Limitaciones y advertencias

- El modelo está limitado a la segmentación de objetos salientes; no es un modelo multimodal ni de generación de texto.
- La conversión Core ML está optimizada para CPU y GPU, no para la Neural Engine, por lo que el rendimiento en ANE puede ser inferior o no soportado.
- La precisión float16 puede introducir ligeras pérdidas de calidad en comparación con el modelo original en float32, aunque en la práctica suele ser imperceptible.
- No se han publicado métricas de rendimiento específicas para esta conversión; los tiempos de inferencia pueden variar según el hardware.
- La licencia MIT permite uso comercial, pero se debe atribuir al autor original (ZhengPeng7) y a los autores de la conversión.
- El modelo puede fallar en imágenes con múltiples objetos salientes o con fondos extremadamente complejos; se recomienda validar en el caso de uso concreto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/avencera/birefnet-coreml-gpu
- Modelo original BiRefNet: https://huggingface.co/ZhengPeng7/BiRefNet
- Repositorio de conversión Core ML: https://github.com/imperatormk/coreml-birefnet
- Artículo sobre BiRefNet como base de eliminadores de fondos: https://www.opensourceprojects.dev/post/birefnet
