# CollectionStudio/vit-hybrid-base-bit-384

## Resumen

El modelo `CollectionStudio/vit-hybrid-base-bit-384` es una reproducción alojada por el usuario CollectionStudio del Vision Transformer híbrido de Google Research en su variante base y resolución 384x384. No es un modelo de lenguaje: es un clasificador de imágenes entrenado para asignar una fotografía a una de las 1000 clases de ImageNet-1k. La arquitectura combina un extractor convolucional BiT (una ResNet preentrenada en ImageNet-21k) que convierte la imagen en una rejilla de características, con un codificador Transformer que procesa esas características como si fueran tokens, más un token de clase (CLS) cuya salida alimenta la cabeza de clasificación.

El repositorio pesa 0,8 GB y el recuento de safetensors indica 98.950.952 parámetros en total, sin que la model card detalle el desglose entre el backbone convolucional y el codificador Transformer. La licencia es Apache 2.0 y los pesos se distribuyen en safetensors y formato PyTorch. Se publicó el 5 de octubre de 2026 y, en el momento de redactar esta ficha, acumula 0 descargas y 0 "me gusta", por lo que se trata de una copia sin tracción propia dentro del Hub.

Su relevancia es de tipo práctico y comparativo: sirve como punto de partida reproducible para experimentos de clasificación de imágenes, como baseline frente a arquitecturas convolucionales puras y como demostración del enfoque híbrido CNN + Transformer, que reduce el número de tokens de entrada respecto a un ViT puro y por tanto el coste cuadrático de la atención. Al estar preentrenado y afinado sobre ImageNet-21k/ImageNet-1k, su uso directo sin reentrenamiento queda limitado al vocabulario de 1000 clases de ImageNet.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer híbrido (backbone convolucional BiT + codificador Transformer) |
| Parámetros totales | 98.950.952 (según recuento de safetensors; incluye backbone y cabeza de clasificación) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica en el sentido de LLM; la entrada es una rejilla de 24x24 parches (576 tokens) más el token CLS, derivada de parche 16 y resolución 384x384 |
| Tipos de cuantización | no disponible (no se publican variantes cuantizadas en el repositorio) |
| Idiomas soportados | no disponible (tarea de clasificación de imágenes; las etiquetas de ImageNet-1k están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y PyTorch (pytorch_model.bin); tamaño del repositorio 0,8 GB |
| Pipeline | image-classification |
| Tamaño de imagen de entrada | 384x384 (según el identificador del modelo); la sección de preprocesado de la model card menciona 224x224 |
| Tamaño de parche | 16x16 |
| Dataset de entrenamiento | preentrenamiento en ImageNet-21k (14 M de imágenes, 21 k clases) y ajuste fino en ImageNet-1k (1 M de imágenes, 1 k clases) |
| Fecha de creación en el Hub | 5 de octubre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo sigue el diseño propuesto en *An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale* (Dosovitskiy et al., 2020). La variante híbrida sustituye la proyección lineal de parches de un ViT estándar por un backbone convolucional BiT: las características extraídas por la CNN se aplanan y se usan como secuencia inicial de tokens del Transformer, a los que se añade un token CLS. La variante "base" del nombre hace referencia a la configuración ViT-Base descrita en el paper (12 capas y 768 dimensiones ocultas según la publicación original; el repositorio no reproduce estos valores en su ficha). El ajuste fino se realiza a 384x384, resolución con la que, según la model card, se obtienen los mejores resultados.

En cuanto al entrenamiento, el modelo se preentrenó en ImageNet-21k y después se ajustó en ImageNet-1k. La model card indica que el entrenamiento se llevó a cabo en TPUv3 (8 núcleos), con tamaño de lote 4096, calentamiento de la tasa de aprendizaje durante 10 000 pasos y recorte de gradiente por norma global 1 en el caso de ImageNet. El preprocesado normaliza los canales RGB con media (0,5, 0,5, 0,5) y desviación típica (0,5, 0,5, 0,5). No se documenta en la información disponible el uso de RLHF, DPO ni de técnicas de alineación, algo esperable en un clasificador discriminativo.

## Capacidades

- Clasificación de imágenes en las 1000 clases de ImageNet-1k, con salida de logits por clase y etiquetas en inglés.
- Extracción de características visuales: al ser un Transformer con backbone convolucional, sus representaciones internas pueden reutilizarse para transferencia a otras tareas tras sustituir la cabeza de clasificación.
- Procesamiento de imágenes a 384x384, lo que permite clasificar objetos pequeños o con detalle fino mejor que variantes a 224x224, siempre según lo indicado en la model card.
- Inferencia por lotes: al ser un modelo pequeño (98,95 M de parámetros) admite batch size elevado en GPU de gama media.
- No soporta generación de texto, razonamiento, código, matemáticas, tool calling, uso de agentes, capacidades multilingües, audio ni vídeo. Es exclusivamente un modelo de visión para clasificación.
- No incluye modo "thinking", decodificación especulativa ni mecanismos de atención lineal; el coste de atención es cuadrático respecto al número de tokens, que aquí es reducido (576 + 1) gracias al submuestreo del backbone convolucional.

## Casos de uso

- Autoetiquetado en proyectos de anotación: el modelo puede preetiquetar grandes volúmenes de imágenes con las 1000 clases de ImageNet, de modo que los anotadores humanos solo revisen y corrijan, reduciendo el coste por imagen.
- Organización de fototecas y activos digitales: clasificación automática de imágenes corporativas en categorías como "perro", "coche", "mueble" o "electrónica" para habilitar búsqueda por etiqueta en un DAM (Digital Asset Management).
- Filtrado previo en pipelines de moderación de contenido: como clasificador barato de primera etapa, descarta o marca imágenes antes de pasarlas a modelos más costosos, siempre que las categorías relevantes estén cubiertas por ImageNet.
- Baseline de investigación en visión por computador: sirve para comparar el enfoque híbrido CNN + Transformer frente a ViT puro o frente a ResNet en un mismo conjunto de datos, con un coste de cómputo bajo.
- Control de calidad industrial tras ajuste fino: reentrenando la cabeza de clasificación sobre un dataset propio de defectos, el modelo puede ejecutarse en una GPU de gama media junto a la línea de producción para clasificar piezas como correctas o defectuosas.
- Clasificación de imágenes en el borde (edge) o en servidores sin GPU dedicada: con ~99 M de parámetros cabe en CPU y en GPU de portátil, lo que permite desplegarlo en entornos con recursos limitados.
- Investigación agronómica o medioambiental: ajuste fino sobre imágenes de cultivos, plagas o especies para tareas de clasificación visual, aprovechando el preentrenamiento en ImageNet-21k.
- Prototipado rápido de demostraciones: integrar el modelo en un cuaderno de Jupyter o en una API interna para validar una idea de producto visual antes de invertir en un entrenamiento específico.

## Benchmarks y rendimiento

"No se han publicado resultados de benchmarks en la información disponible." La model card no incluye cifras numéricas propias y remite expresamente a las tablas 2 y 5 del paper original para consultar los resultados de evaluación en ImageNet, CIFAR-100, VTAB y otros conjuntos. Únicamente se indica de forma cualitativa que el ajuste fino a 384x384 ofrece los mejores resultados y que aumentar el tamaño del modelo mejora el rendimiento.

| Benchmark | Resultado de este modelo | Observaciones |
|---|---|---|
| ImageNet-1k (top-1) | no disponible | La model card remite a las tablas 2 y 5 del paper |
| ImageNet-1k (top-5) | no disponible | La model card remite a las tablas 2 y 5 del paper |
| CIFAR-100 | no disponible | No se aportan cifras en la información proporcionada |
| VTAB | no disponible | No se aportan cifras en la información proporcionada |

## Requisitos de hardware

- VRAM para pesos en fp32: aproximadamente 396 MB, calculado a partir de los 98.950.952 parámetros.
- VRAM para pesos en fp16 o bf16: aproximadamente 198 MB.
- VRAM para pesos en int8 (cuantización no publicada, estimación teórica): aproximadamente 99 MB.
- Memoria de activaciones: no disponible; para lote 1 y 384x384 es previsiblemente de unos cientos de megabytes, pero no se publica una medición.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM es suficiente. Se puede ejecutar con holgura en RTX 3060, RTX 4060, RTX 4090, A100 o H100; en estas dos últimas el cuello de botella será el preprocesado de imágenes, no el modelo.
- GPU de consumo: sí, cabe en cualquier GPU de consumo actual e incluso en iGPU con memoria compartida suficiente.
- CPU: la inferencia en CPU es viable dado el reducido tamaño del modelo, con mayor latencia.
- Opciones de despliegue: `transformers` con `ViTHybridImageProcessor` y `ViTHybridForImageClassification`, exportación a ONNX o TensorRT, TorchScript y otros runtimes de inferencia genéricos. vLLM, llama.cpp, Ollama y TGI no aplican, ya que están orientados a modelos generativos de texto, no a clasificación de imágenes.
- Latencia y throughput: no disponibles; no se publican mediciones en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Resolución | Parámetros | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CollectionStudio/vit-hybrid-base-bit-384 | ViT híbrido (BiT + Transformer) | 384x384 | 98.950.952 (safetensors del repositorio) | Apache 2.0 | Hub de HuggingFace, 0 descargas |
| google/vit-hybrid-base-bit-384 | ViT híbrido (BiT + Transformer) | 384x384 | no disponible en la información proporcionada | no disponible en la información proporcionada | Referenciado en el código de ejemplo de la propia model card |
| google/vit-base-patch16-384 | ViT puro (proyección lineal de parches) | 384x384 | no disponible en la información proporcionada | no disponible en la información proporcionada | No se aporta información en la búsqueda realizada |
| ResNet-50 (BiT) | CNN pura | variable | no disponible en la información proporcionada | no disponible en la información proporcionada | No se aporta información en la búsqueda realizada |

La información proporcionada no incluye cifras de rendimiento que permitan comparar objetivamente este checkpoint con sus alternativas. A efectos prácticos, la diferencia arquitectónica relevante es que la variante híbrida introduce un backbone convolucional que reduce el número de tokens de entrada frente a un ViT puro con el mismo tamaño de parche, a cambio de añadir parámetros y dependencia de un modelo convolucional preentrenado.

## Limitaciones y advertencias

- Modelo de visión, no de lenguaje: no genera texto, no razona, no ejecuta código y no admite tool calling ni flujos de agentes.
- Vocabulario cerrado de 1000 clases de ImageNet-1k con etiquetas en inglés. Cualquier uso fuera de esas categorías requiere ajuste fino con datos propios.
- Sesgos: al entrenarse con ImageNet, hereda los sesgos de representación, etiquetado y contextualización de ese conjunto de datos, incluidas posibles connotaciones problemáticas en categorías de personas y actividades.
- Riesgo de error de clasificación y de calibración deficiente: los logits no están calibrados como probabilidades fiables y el modelo puede asignar alta confianza a predicciones incorrectas, especialmente en dominios alejados de ImageNet.
- La model card es contradictoria en el preprocesado: describe un redimensionado a 224x224 mientras que el identificador del modelo indica 384x384 y el propio texto recomienda 384x384 para el ajuste fino. Hay que verificar empíricamente la resolución usada en el ajuste antes de desplegarlo.
- La model card fue redactada por el equipo de Hugging Face, no por los autores originales, y contiene un BibTeX que corresponde a otro artículo (Wu et al., *Visual Transformers*, arXiv:2006.03677), lo que sugiere un ensamblado a partir de plantillas y una posible pérdida de información específica del checkpoint.
- Repositorio de terceros: este checkpoint lo publica el usuario CollectionStudio, no Google Research. No hay garantía de que los pesos coincidan byte a byte con la publicación original ni de que se actualicen.
- Licencia Apache 2.0: permite uso comercial y modificación, pero obliga a conservar los avisos de copyright y licencia y a indicar los cambios realizados. No hay garantía explícita por parte de los autores.
- Sin tracción ni validación comunitaria: 0 descargas y 0 "me gusta" en el momento de redactar la ficha, por lo que no existen informes independientes de comportamiento en producción.
- La búsqueda web realizada no devolvió resultados técnicos relevantes sobre este modelo; los enlaces encontrados no guardaban relación con la ficha y se han descartado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CollectionStudio/vit-hybrid-base-bit-384
- Modelo original referenciado en el código de ejemplo: https://huggingface.co/google/vit-hybrid-base-bit-384
- Paper de Vision Transformer: https://arxiv.org/abs/2010.11929
- Paper citado en el BibTeX de la model card (Wu et al., Visual Transformers): https://arxiv.org/abs/2006.03677
- Código de referencia de Google Research para Vision Transformer: https://github.com/google-research/vision_transformer
- Script de preprocesado citado en la model card: https://github.com/google-research/vision_transformer/blob/master/vit_jax/input_pipeline.py
- Documentación de la librería Transformers para ViT: https://huggingface.co/transformers/model_doc/vit.html
- Imagen de ejemplo de COCO 2017 usada en la model card: http://images.cocodataset.org/val2017/000000039769.jpg
- Dataset ImageNet: http://www.image-net.org/
- Desafío ImageNet LSVRC 2012: http://www.image-net.org/challenges/LSVRC/2012/

No se han encontrado otros enlaces relevantes en la búsqueda web realizada.
