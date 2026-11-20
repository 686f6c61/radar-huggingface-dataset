# ghimiredhikura/LAASP

## Resumen

LAASP (Loss-Aware Automatic Selection of Structured Pruning Criteria) es un método de compresión de redes neuronales convolucionales para clasificación de imágenes, publicado por Deepak Ghimire, Kilho Lee y Seong-heum Kim en *Image and Vision Computing* (volumen 136, artículo 104745, 2023). El repositorio de Hugging Face `ghimiredhikura/LAASP` no contiene un modelo único, sino una colección de checkpoints representativos ya podados de arquitecturas clásicas (VGG16, ResNet32/56/110, ResNet18/34/50 y MobileNetV2) entrenados sobre CIFAR-10 e ImageNet.

El problema que resuelve es el de la selección automática de criterios de poda estructurada (a nivel de filtro o canal) sin necesidad de ajuste manual ni de un proceso iterativo costoso. LAASP evalúa la pérdida inducida por la eliminación de cada filtro candidato y selecciona de forma automática qué criterio de importancia aplicar en cada capa, lo que permite alcanzar reducciones de FLOPs de entre el 30 % y el 60,5 % manteniendo la precisión dentro de márgenes razonables.

Es relevante para desarrolladores e investigadores que necesiten desplegar clasificadores de imagen en entornos con recursos limitados (dispositivos edge, GPUs de gama baja, sistemas embebidos) y quieran partir de checkpoints ya comprimidos y verificables, en lugar de reimplementar el pipeline de poda desde cero. El repositorio ocupa 0,5 GB y agrupa catorce checkpoints en formato PyTorch `.pth.tar`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes convolucionales (VGG16, ResNet32/56/110, ResNet18/34/50, MobileNetV2) con poda estructurada de filtros |
| Parametros totales | Depende del checkpoint (no se publica el recuento exacto por variante); el tamaño del repo es de 0,5 GB para 14 checkpoints |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión, clasificación de imágenes) |
| Tipos de cuantizacion | No disponible (los checkpoints se distribuyen en formato PyTorch original, sin versiones cuantizadas) |
| Idiomas soportados | No aplica (clasificación de imágenes; etiquetas en inglés en CIFAR-10/ImageNet) |
| Licencia | No disponible |
| Formato de pesos | `.pth.tar` (serialización original de PyTorch; algunos contienen objetos de modelo serializados y requieren las clases del código del proyecto) |

## Arquitectura y entrenamiento

LAASP opera sobre arquitecturas convolucionales estándar (VGG y familias ResNet, además de MobileNetV2) y aplica poda estructurada a nivel de filtro. El método calcula, para cada filtro candidato a eliminación, la pérdida inducida en la salida de la red y selecciona automáticamente el criterio de importancia más adecuado por capa, en lugar de fijar un único criterio global (magnitud de pesos, norma L1/L2, etc.). El resultado son subredes dispersas con reducciones de FLOPs etiquetadas explícitamente en el nombre de cada checkpoint (por ejemplo, `cifar10-vgg16-flops-rr-34.6` indica una reducción del 34,6 % en FLOPs).

Los checkpoints cubren dos regímenes de entrenamiento: CIFAR-10 (VGG16, ResNet32, ResNet56, ResNet110) e ImageNet (ResNet18, ResNet34, ResNet50, MobileNetV2). El repositorio documenta Python 3.9.7, PyTorch 1.10.2 y torchvision 0.11.2 como entorno de referencia. No se detalla en la model card el número de tokens ni la composición exacta de los datasets más allá de los nombres CIFAR-10 e ImageNet, ni si hubo técnicas de destilación o fine-tuning posterior a la poda; esa información debe consultarse en el artículo y en el repositorio de código.

## Capacidades

- Clasificación de imágenes sobre CIFAR-10 (10 clases) e ImageNet (1000 clases).
- Inferencia con modelos convolucionales comprimidos, con reducción de FLOPs verificable por checkpoint (30,0 % a 60,5 % en las variantes publicadas).
- Punto de partida para pipelines de compresión: los checkpoints sirven como referencia para reproducir y comparar resultados de poda estructurada.
- Evaluación reproducible mediante los scripts del repositorio GitHub asociado.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente de visión y clasificación.
- No dispone de modo thinking, visión generativa, audio ni generación de texto.

## Casos de uso

- Clasificación de imágenes en dispositivos edge: los checkpoints de MobileNetV2 con reducción de FLOPs del 30,0 % y 54,5 % están pensados para entornos con cómputo restringido, donde una CNN ligera ya podada reduce latencia y consumo energético.
- Reproducción de experimentos de poda estructurada: un investigador puede descargar los checkpoints y ejecutar los scripts de evaluación del repositorio GitHub para verificar las cifras de precisión y FLOPs publicadas en el artículo.
- Línea base para comparar nuevos métodos de compresión: al cubrir VGG16, ResNet y MobileNetV2 con varios niveles de reducción, sirve como referencia contra la que medir técnicas alternativas de pruning.
- Despliegue de clasificadores CIFAR-10 en prototipos educativos o de investigación: las variantes VGG16 y ResNet32/56/110 permiten montar un clasificador de 10 clases con un coste computacional reducido.
- Fine-tuning sobre dominios específicos: los checkpoints podados pueden servir como inicialización para reentrenar sobre un dataset propio de clasificación, aprovechando la estructura ya comprimida.
- Integración en pipelines de visión embebida: los modelos ResNet18/34/50 podados sobre ImageNet son adecuados para tareas de clasificación genérica en servidores modestos o GPUs de consumo, con la ventaja de un menor número de FLOPs.
- Estudio de la relación precisión/FLOPs: los pares de checkpoints con distinto nivel de reducción (por ejemplo, ResNet50 al 42,3 % y al 53,9 %) permiten analizar el compromiso entre compresión y exactitud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente enumera los checkpoints y sus etiquetas de reducción de FLOPs, sin incluir tablas de precisión (top-1/top-5) ni comparaciones numéricas con otros métodos. Las cifras de exactitud deben consultarse en el artículo de *Image and Vision Computing* (DOI 10.1016/j.imavis.2023.104745) y en el repositorio GitHub del proyecto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de CNNs de tamaño pequeño a medio (VGG16, ResNet18/34/50, MobileNetV2) y con poda aplicada, la huella es reducida. Un checkpoint individual en el repo de 0,5 GB para 14 variantes sugiere pesos del orden de decenas de MB por modelo, pero no se confirma.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM es suficiente para inferencia; no se especifican modelos concretos (A100, H100, RTX 4090) en la documentación.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño de las arquitecturas, pero no se aporta una tabla de requisitos verificada.
- Opciones de despliegue: el proyecto documenta PyTorch 1.10.2 y torchvision 0.11.2; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo). La carga requiere las clases de modelo originales del repositorio GitHub para los checkpoints con objetos serializados.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LAASP (este repo) | CNNs podadas (VGG/ResNet/MobileNetV2) | No disponible por checkpoint | No aplica | No disponible | Hugging Face + GitHub |
| Modelos torchvision originales (VGG16, ResNet, MobileNetV2) | CNNs sin podar | Conocidos por arquitectura | No aplica | BSD-3-Clause (torchvision) | PyTorch Hub / torchvision |
| Métodos de poda alternativos (p. ej. ThiNet, HRank, FPGM) | CNNs podadas | Variables | No aplica | Variable | Repositorios de investigación |

No se dispone de datos de rendimiento comparativos publicados en la información proporcionada para establecer una comparación numérica con alternativas.

## Limitaciones y advertencias

- La licencia no está especificada en la model card; antes de cualquier uso comercial es imprescindible contactar con los autores o consultar el repositorio GitHub para confirmar los términos.
- Los checkpoints usan el formato de serialización original de PyTorch y algunos contienen objetos de modelo serializados; cargarlos requiere las clases del código del proyecto, lo que añade una dependencia fuerte del repositorio GitHub y complica la portabilidad.
- Solo cubren tareas de clasificación de imágenes sobre CIFAR-10 e ImageNet; no son adecuados para otras modalidades ni para generación.
- No se publican métricas de precisión en la model card; las cifras de FLOPs reducidos no garantizan por sí solas un comportamiento aceptable en dominios distintos a los de entrenamiento.
- Riesgo de degradación de precisión inherente a la poda: a mayor reducción de FLOPs (por ejemplo, 60,5 % en VGG16 o 54,5 % en MobileNetV2), mayor probabilidad de pérdida de exactitud frente al modelo original.
- Sesgos: no documentados; al entrenarse sobre CIFAR-10 e ImageNet, heredan los sesgos de etiquetado y distribución de dichos datasets.
- No hay información sobre cuantización, exportación a ONNX ni soporte para runtimes de inferencia optimizados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopción muy limitada y ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/ghimiredhikura/LAASP
- arXiv preprint: https://arxiv.org/abs/2506.20152
- Artículo de revista (DOI): https://doi.org/10.1016/j.imavis.2023.104745
- Código fuente y scripts de evaluación: https://github.com/ghimiredhikura/laasp-filter-pruning
- Release de checkpoints en GitHub: https://github.com/ghimiredhikura/laasp-filter-pruning/releases/tag/model-checkpoints-v1
