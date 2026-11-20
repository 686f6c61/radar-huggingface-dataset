# ShaderError/perspectra-dinov2-scene-small

## Resumen

Perspectra-dinov2-scene-small es una conversión a ONNX de los pesos de segmentación semántica de DINOv2 (variante ViT-S/14) entrenados sobre el conjunto ADE20K, publicada por el usuario ShaderError dentro del proyecto Perspectra. El modelo original procede de Meta Platforms y se distribuye bajo licencia Apache 2.0. No es un modelo generativo: es un cabezal lineal de segmentación semántica montado sobre las representaciones auto-supervisadas de DINOv2, empaquetado en formato ONNX para su despliegue en producción sin dependencias de PyTorch.

El interés práctico reside en su tamaño reducido (repo de 0,1 GB, variante "small" del ViT de DINOv2) y en su interfaz fija y bien definida: entrada RGB float32 normalizada según ImageNet con resolución 512x512 y salida de puntuaciones para 150 clases ADE20K con resolución 128x128. Esto lo hace adecuado para tareas de segmentación de escenas interiores y exteriores en pipelines de visión por computador, especialmente cuando se necesita inferencia ligera mediante ONNX Runtime.

La información pública disponible es muy escasa: no hay datos de benchmarks, ni métricas de mIoU, ni detalles sobre el proceso de conversión más allá de la propia model card. Las descargas y likes son cero en el momento de la consulta, y el modelo no declara idiomas ni pipeline estándar en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-S/14 (DINOv2) con cabezal lineal de segmentación semántica |
| Parametros totales | no disponible (variante "small" de DINOv2, ViT-S/14) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (el artefacto publicado es ONNX float32) |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo es una conversión a ONNX de `dinov2_vits14_ade20k_linear`, es decir, un Vision Transformer pequeño (ViT-S/14) preentrenado con el método auto-supervisado DINOv2 de Meta y posteriormente adaptado a segmentación semántica mediante un cabezal lineal entrenado sobre ADE20K. La resolución de entrada es 512x512 píxeles con normalización ImageNet (media y desviación típica estándar de tres canales), y la salida son logits por clase con forma [1, 150, 128, 128], es decir, 150 clases ADE20K en orden cero-indexado y una rejilla de 128x128.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ADE20K utilizado, ni si hubo etapas de ajuste fino adicionales más allá del cabezal lineal. El autor indica que los pesos originales proceden del repositorio oficial de DINOv2 de Meta en un commit concreto, y que la conversión se realizó para el proyecto Perspectra. La innovación técnica relevante es la propia naturaleza auto-supervisada de DINOv2, que produce representaciones densas de alta calidad reutilizables con cabezales lineales ligeros, y el empaquetado ONNX que permite ejecución portable.

## Capacidades

- Segmentación semántica densa de escenas con 150 clases del vocabulario ADE20K (interiores, exteriores, objetos, mobiliario, vegetación, etc.).
- Extracción de características visuales densas por parche (patch features) a partir del backbone ViT-S/14 de DINOv2.
- Inferencia en formato ONNX, ejecutable con ONNX Runtime sin necesidad de PyTorch.
- Entrada de imagen RGB normalizada ImageNet a 512x512 y salida de mapas de puntuaciones a 128x128.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es exclusivamente un modelo de visión.
- No incluye modo "thinking", visión-a-texto, audio ni ninguna modalidad generativa.

## Casos de uso

- Segmentación de escenas en aplicaciones de realidad aumentada: el modelo produce mapas densos de 150 clases a 128x128 que permiten identificar suelo, paredes, muebles o vegetación para anclar objetos virtuales; su tamaño reducido facilita la ejecución en dispositivos con recursos limitados mediante ONNX Runtime.
- Preprocesado para pipelines de robótica móvil: la segmentación semántica de escenas interiores ayuda a delimitar superficies transitables y obstáculos; la entrada fija de 512x512 y la salida ONNX simplifican la integración en sistemas embebidos.
- Etiquetado automático de imágenes para conjuntos de datos: el modelo puede generar máscaras semánticas preliminares sobre imágenes nuevas para acelerar el etiquetado humano en proyectos de visión.
- Moderación y análisis de contenido visual: la detección de clases como personas, vehículos o interiores permite clasificar y filtrar imágenes en plataformas de contenido.
- Segmentación en herramientas de edición fotográfica: la máscara por clase permite aplicar ajustes selectivos (cielo, vegetación, suelo) de forma automática en flujos de postprocesado.
- Análisis de imágenes satelitales o de escenas exteriores: las clases ADE20K incluyen categorías de exterior (carretera, edificio, árbol, agua) útiles para estudios de ocupación del suelo a baja resolución.
- Componente de un sistema de búsqueda visual: las características densas del backbone DINOv2 pueden reutilizarse para recuperación de imágenes por similitud regional, no solo para la segmentación final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de mIoU, precisión por clase, latencia ni throughput, y no se han encontrado datos adicionales en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del repo (0,1 GB) y la variante ViT-S/14, la huella de pesos en float32 es del orden de decenas de megabytes, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con soporte ONNX Runtime (CUDA o TensorRT), incluidas RTX 3060, RTX 4090, A100 o H100; el modelo es lo bastante pequeño como para no requerir aceleradores de gama alta.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 2-4 GB de VRAM, aunque el dato exacto no está publicado.
- Opciones de despliegue: ONNX Runtime (CPU y GPU), TensorRT, OpenVINO y cualquier runtime compatible con ONNX.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Perspectra-dinov2-scene-small | ViT-S/14 (no disponible el conteo exacto) | Imagen 512x512 | Segmentación semántica ADE20K (150 clases) | Apache 2.0 | ONNX en Hugging Face |
| DINOv2 ViT-S/14 original (Meta) | ViT-S/14 | Imagen variable | Backbone auto-supervisado + cabezales | Apache 2.0 (código) / licencia del modelo DINOv2 | PyTorch en GitHub |
| Segment Anything (SAM) | ViT-B/L/H | Imagen variable | Segmentación de instancias promptable | Apache 2.0 | Pesos en Meta AI |
| DeepLabv3+ (torchvision) | ResNet-50/101 | Imagen variable | Segmentación semántica VOC/ADE20K | BSD-3 | PyTorch en torchvision |

La comparación cuantitativa de rendimiento no está disponible porque no se han publicado métricas para este artefacto. Frente a SAM, la diferencia clave es que este modelo produce clases semánticas fijas (no segmentación promptable de instancias); frente a DeepLabv3+, la ventaja es el backbone DINOv2 y el formato ONNX listo para producción.

## Limitaciones y advertencias

- No se han publicado métricas de calidad (mIoU) para esta conversión concreta; no se puede garantizar que la cuantización o el grafo ONNX reproduzcan exactamente el rendimiento del modelo original en PyTorch.
- El vocabulario está fijado a las 150 clases de ADE20K; no detecta categorías fuera de ese conjunto y puede confundir clases visualmente próximas.
- La resolución de salida es 128x128, lo que limita la precisión de bordes en objetos pequeños o de geometría fina.
- Es un modelo puramente visual: no procesa texto, no responde a instrucciones y no tiene capacidades de razonamiento.
- Riesgo de sesgo heredado del dataset ADE20K, que sobrerrepresenta escenas interiores y exteriores de ciertas regiones; el rendimiento puede degradarse en dominios no representados (imágenes médicas, industriales, etc.).
- La licencia Apache 2.0 permite uso comercial, pero el autor remite a la licencia original de DINOv2 en el repositorio de Meta; conviene verificar los términos del modelo base antes de un despliegue comercial.
- El repositorio tiene cero descargas y cero likes, sin historial de validación por la comunidad; se recomienda evaluar el artefacto en el dominio objetivo antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/ShaderError/perspectra-dinov2-scene-small
- Repositorio original de DINOv2 (Meta): https://github.com/facebookresearch/dinov2/tree/7764ea0f912e53c92e82eb78a2a1631e92725fc8
- Licencia original de los modelos DINOv2: incluida en el repositorio de GitHub enlazado arriba.
