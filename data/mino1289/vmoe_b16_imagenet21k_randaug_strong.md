# Mino1289/vmoe_b16_imagenet21k_randaug_strong

## Resumen

vmoe_b16_imagenet21k_randaug_strong es un modelo de clasificación de imágenes basado en V-MoE (Vision Mixture-of-Experts), publicado en HuggingFace por el usuario Mino1289. Se trata de una conversión a la librería timm de los pesos originales de Google Research para su modelo V-MoE B/16, entrenado sobre ImageNet-21k con la variante "strong" de RandAugment. La arquitectura combina un Vision Transformer (ViT-B/16) con capas de mezcla de expertos dispersos, una técnica que incrementa la capacidad total del modelo sin aumentar proporcionalmente el coste computacional por token, ya que cada token se enruta únicamente a un subconjunto de expertos.

El checkpoint declara 300.974.931 parámetros totales (~301 M) y un repositorio de 1,2 GB, tamaño coherente con pesos almacenados en fp32. Se distribuye en formato safetensors bajo licencia Apache 2.0, con pipeline de image-classification.

Su interés actual radica en que permite reproducir e integrar un modelo MoE visual en el ecosistema PyTorch/timm sin depender del framework JAX original (google-research/vmoe), facilitando el fine-tuning y la experimentación comparativa sobre arquitecturas de visión con enrutamiento disperso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-B/16) con capas de mezcla de expertos dispersos (MoE), variante V-MoE |
| Parametros totales | 300.974.931 (~301 M) |
| Parametros activos | no disponible en la informacion proporcionada (modelo disperso con enrutamiento top-k) |
| Longitud de contexto | no aplica (modelo de clasificacion de imagenes) |
| Tipos de cuantizacion | no especificados por el autor; el tamano del repositorio (~1,2 GB) es coherente con pesos fp32 |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | timm |
| Pipeline | image-classification |
| Tamano del repositorio | 1,2 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura V-MoE descrita en el articulo "Scaling Vision with Sparse Mixture of Experts" (Riquelme et al., 2021). Sobre un esqueleto ViT-B/16 (parches de 16x16, embedding de 768 dimensiones, 12 bloques transformer), sustituye el bloque MLP de determinadas capas por una capa de mezcla de expertos: varios expertos tipo MLP mas una red de enrutamiento que asigna cada token a los k expertos mas adecuados. Esto separa la capacidad total del modelo (301 M de parametros) del coste de computo por token, que solo activa la fraccion correspondiente a los expertos seleccionados. El checkpoint fue preentrenado sobre ImageNet-21k con la politica de aumento de datos RandAugment en su variante "strong".

El preprocesado indicado por el autor proviene de la configuracion original en JAX: las imagenes se normalizan primero al rango [0, 1] y despues con mean = std = (0,5, 0,5, 0,5), lo que equivale a un value_range de (-1, 1). Respetar esta normalizacion es imprescindible para obtener resultados consistentes. No se dispone en la informacion proporcionada de datos sobre numero de tokens de entrenamiento, composicion exacta del dataset, numero de expertos ni si hubo ajuste posterior con RLHF/DPO (no aplicable en un modelo de clasificacion supervisada).

## Capacidades

- Clasificacion de imagenes: cabecera de clasificacion visual, con preentrenamiento sobre ImageNet-21k segun la nomenclatura del checkpoint.
- Extraccion de caracteristicas visuales: utilizable como backbone ViT-B/16 para obtener embeddings de imagen.
- Transferencia a tareas downstream: fine-tuning mediante `timm.create_model(..., pretrained=True)` para clasificacion especifica o como inicializacion de otros cabezales.
- Representacion enriquecida por expertos: la capacidad adicional del MoE puede capturar patrones visuales mas diversos que un ViT-B/16 denso del mismo coste activo.
- No soporta tool calling ni function calling (no aplica a un modelo de vision).
- No soporta agentes ni razonamiento multi-paso en lenguaje (no aplica).
- Sin capacidades multilingues (modelo puramente visual).
- Sin modo "thinking", vision-lenguaje ni audio.

## Casos de uso

- Filtrado y etiquetado automatico de datasets visuales: el modelo puede clasificar grandes volumenes de imagenes para construir corpus de entrenamiento anotados, aprovechando su preentrenamiento en 21.000 clases.
- Extraccion de embeddings para busqueda visual por similitud: usando la salida del backbone antes de la cabeza de clasificacion se pueden indexar imagenes y recuperar vecinos cercanos en un motor vectorial.
- Moderacion y triaje de contenido visual: clasificacion rapida de imagenes entrantes para enrutar los casos dudosos a revision humana.
- Inspeccion industrial o retail: fine-tuning sobre un dominio concreto (defectos de fabricacion, categorias de producto) partiendo de un backbone preentrenado a gran escala.
- Backbone para tareas densas de vision: inicializacion para deteccion o segmentacion, extrayendo caracteristicas multi-nivel y anadiendo cabezales especificos.
- Investigacion sobre eficiencia de MoE en vision: estudio comparativo del enrutamiento, la carga de expertos y el equilibrio entre capacidad y coste frente a ViT densos.
- Prototipado rapido en PyTorch: integracion directa en timm, con una sola linea de codigo, sin necesidad de montar el entorno JAX de google-research/vmoe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud (top-1/top-5) sobre ImageNet-1k ni sobre ImageNet-21k, ni datos de robustez, calibracion o evaluacion fuera de dominio.

## Requisitos de hardware

- VRAM estimada para inferencia: ~1,2 GB en fp32; ~0,6 GB en fp16/bfloat16; ~0,3 GB en int8 (estimacion a partir de los 301 M de parametros).
- GPU recomendadas: cualquier GPU moderna con al menos 2-4 GB de VRAM; por ejemplo RTX 3060, RTX 4090, A100 o H100 son mas que suficientes. Para lotes grandes y entrenamiento conviene una GPU con 16-24 GB o superior.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo reciente e incluso en equipos con GPU integrada o CPU.
- Opciones de despliegue: timm / PyTorch como via principal; exportacion a ONNX, TorchScript o TensorRT para produccion; tambien es posible ejecutarlo en CPU. Herramientas como vLLM, llama.cpp u Ollama no aplican a un modelo de clasificacion de imagenes.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vmoe_b16_imagenet21k_randaug_strong | 301 M | no aplica | no disponible | Apache 2.0 | HuggingFace (timm) |
| ViT-B/16 (google/vit-base-patch16-224) | 86 M | no aplica | no disponible en la informacion proporcionada | Apache 2.0 | HuggingFace |
| DeiT-B/16 | 86 M | no aplica | no disponible en la informacion proporcionada | Apache 2.0 | HuggingFace |

La diferencia estructural clave frente a un ViT-B/16 denso es que V-MoE multiplica la capacidad total (301 M frente a ~86 M) manteniendo un coste activo por token reducido, a cambio de una implementacion de enrutamiento mas compleja y de la necesidad de gestionar la carga de expertos. No se dispone de cifras comparativas de exactitud en la informacion proporcionada para cuantificar esa diferencia.

## Limitaciones y advertencias

- Sesgos conocidos: hereda los sesgos de ImageNet-21k (desequilibrio geografico y de categorias), por lo que su rendimiento puede degradarse en dominios poco representados.
- Riesgo de clasificaciones erroneas con alta confianza: al ser un clasificador, puede asignar probabilidad alta a clases incorrectas fuera de su distribucion de entrenamiento.
- Limitaciones de contexto o idioma: no aplica contexto textual ni idioma; es un modelo puramente visual.
- Preprocesado obligatorio: ignorar la normalizacion mean = std = (0,5, 0,5, 0,5) sobre entradas en [0, 1] degrada notablemente los resultados.
- Falta de informacion tecnica: la model card no detalla numero de expertos, politica de enrutamiento ni hiperparametros de entrenamiento, lo que dificulta la reproducibilidad exacta.
- Restricciones de licencia: los pesos se publican bajo Apache 2.0, que permite uso comercial; conviene verificar los terminos de los pesos originales de Google Research en google-research/vmoe antes de un uso comercial critico.
- Caveat de produccion: aunque el checkpoint tiene pocos parametros totales, el enrutamiento MoE puede introducir sobrecarga en tiempo de ejecucion si no se implementa de forma eficiente (agrupacion por experto).
- Sin datos de robustez ni calibracion: no se han publicado evaluaciones frente a perturbaciones, cambios de dominio o distribuciones adversarias.

## Enlaces

- HuggingFace: https://huggingface.co/Mino1289/vmoe_b16_imagenet21k_randaug_strong
- Repositorio V-MoE de Google Research: https://github.com/google-research/vmoe
- Libreria timm (pytorch-image-models): https://github.com/huggingface/pytorch-image-models
- Articulo V-MoE: https://arxiv.org/abs/2106.05974
- Ruta original de los pesos: gs://vmoe_checkpoints/vmoe_b16_imagenet21k_randaug_strong
