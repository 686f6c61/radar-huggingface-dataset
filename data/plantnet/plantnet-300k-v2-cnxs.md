# PlantNet/plantnet-300k-v2-cnxs

## Resumen

PlantNet/plantnet-300k-v2-cnxs es un clasificador de imagenes de plantas con 1.000 especies, desarrollado por el equipo de Pl@ntNet (INRIA, CIRAD, INRAE y AMAP) mediante fine-tuning del modelo preentrenado facebook/dinov3-convnext-small-pretrain-lvd1689m. El modelo resuelve la tarea de identificacion automatica de especies vegetales a partir de fotografias, un problema con alta ambiguedad de etiquetas y distribucion de cola larga, y se apoya en el backbone DINOv3 ConvNeXt-Small, una arquitectura convolucional moderna con atencion global.

El modelo se publica como parte del trabajo "Energy-Efficient Plant Monitoring via Knowledge Distillation" (arXiv:2604.27178), que lo emplea presumiblemente como profesor o referencia en un esquema de destilacion orientado a monitoring vegetal de bajo consumo. Su relevancia actual radica en que combina un backbone de ultima generacion (DINOv3) con un dataset de referencia en vision botanica (Pl@ntNet-300K-v2), alcanzando un 82,96 % de accuracy en test con un modelo de apenas 0,2 GB de pesos, lo que lo hace atractivo para despliegue en dispositivos con recursos limitados.

La ficha tecnica disponible es escasa: no se publican detalles sobre el numero exacto de parametros, el proceso de entrenamiento (epocas, aumentos de datos, funcion de perdida) ni resultados de benchmarks frente a otros modelos. El repositorio incluye el codigo de carga (`model.py`, `transforms.py`), los pesos en `model.pth` y un CSV de metadatos de especies.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv3 ConvNeXt-Small (CNN con bloques ConvNeXt y atencion global DINOv3) |
| Parametros totales | no disponible (repo de 0,2 GB; ConvNeXt-Small ronda ~50 M en el backbone, cifra no confirmada por el autor) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada 224 x 224 RGB) |
| Tipos de cuantizacion | no disponible (pesos en `model.pth`; no se publican versiones GGUF/ONNX cuantizadas) |
| Idiomas soportados | no aplica (clasificacion de imagenes); etiquetas de especies en el CSV de metadatos |
| Licencia | dinov3-license (licencia propia de DINOv3, con acceso restringido al modelo base) |
| Formato de pesos | PyTorch (`model.pth`), cargado mediante `model.py` y `transforms.py` del repositorio |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado del backbone DINOv3 ConvNeXt-Small sobre el dataset Pl@ntNet-300K-v2 (Zenodo, registro 10419064). La arquitectura combina la eficiencia computacional de ConvNeXt (convoluciones depthwise, normalizacion LayerNorm, activacion GELU) con los mecanismos de atencion y el preentrenamiento auto-supervisado de DINOv3, que aporta representaciones visuales densas de alta calidad. La cabeza de clasificacion proyecta el embedding de 768 dimensiones a 1.000 clases de especies.

El entrenamiento se realizo con imagenes redimensionadas y recortadas a 224 x 224 y normalizadas con estadisticas propias de Pl@ntNet (media `(0.4425, 0.4695, 0.3266)`, desviacion tipica `(0.2353, 0.2219, 0.2325)`), distintas de las de ImageNet. No se detallan en la model card el numero de epocas, el optimizador, la tasa de aprendizaje, el esquema de aumentos de datos ni si se aplico alguna tecnica de regularizacion especifica. Tampoco se especifica el numero de tokens de entrenamiento (no aplica en vision) ni la composicion exacta del split utilizado de Pl@ntNet-300K-v2.

La innovacion tecnica destacable es el uso del backbone DINOv3 en su variante ConvNeXt-Small, que ofrece un equilibrio entre coste computacional y calidad de representacion, y la inclusion del codigo de carga que devuelve simultaneamente embeddings (768-d) y logits, lo que facilita su uso como extractor de caracteristicas ademas de clasificador.

## Capacidades

- Clasificacion de imagenes de plantas en 1.000 especies, con salida de logits por clase y embedding de 768 dimensiones.
- Extraccion de caracteristicas visuales densas (embeddings) reutilizables para tareas downstream como recuperacion de imagenes, clustering o deteccion de especies desconocidas.
- Identificacion de especie a partir de una unica fotografia RGB de 224 x 224.
- No soporta tool calling ni function calling (es un modelo puramente visual, no generativo de texto).
- No soporta razonamiento multi-paso ni agentes.
- No tiene capacidades multilingues ni de generacion de texto.
- No dispone de modo "thinking", vision adicional, audio ni otras modalidades.
- Capacidad especial: salida dual (embeddings + logits) en una sola pasada, util para pipelines que combinan clasificacion y busqueda por similitud.

## Casos de uso

- Identificacion de especies en aplicaciones moviles de ciencia ciudadana: el modelo puede clasificar una foto de planta en 1.000 especies con un 82,96 % de accuracy en test, y su tamano reducido (0,2 GB) permite empaquetarlo en apps moviles o ejecutarlo en el borde.
- Monitorizacion de biodiversidad en campo: integrado en estaciones de captura con camaras trampa, el modelo clasifica flora de forma automatica y alimenta bases de datos de seguimiento ecologico, aprovechando su bajo coste computacional.
- Pre-etiquetado de herbarios digitalizados: procesa lotes de imagenes de especimenes y genera etiquetas candidatas que los botanicos revisan, reduciendo el trabajo manual de catalogacion.
- Control de malas hierbas en agricultura de precision: el modelo puede distinguir especies adventicias de cultivos en imagenes de dron o tractor, siempre que las especies objetivo esten entre las 1.000 clases entrenadas.
- Recuperacion visual de imagenes de plantas: usando los embeddings de 768 dimensiones, se puede construir un indice vectorial para buscar especies visualmente similares en grandes colecciones.
- Destilacion de conocimiento y modelos ligeros: el modelo sirve como referencia o profesor en esquemas de destilacion para monitoring vegetal energeticamente eficiente, tal como sugiere el paper asociado (arXiv:2604.27178).
- Investigacion en vision botanica: como baseline reproducible sobre Pl@ntNet-300K-v2 para comparar nuevas arquitecturas o tecnicas de aumento de datos.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Accuracy en validacion (mejor) | 0,8303 |
| Accuracy en test | 0,8296 |
| Numero de clases | 1.000 |
| Dimension del embedding | 768 |
| Tamano de entrada | 224 x 224 RGB |

No se han publicado en la informacion disponible resultados comparativos frente a otros modelos (MMLU, HumanEval, GSM8K no aplican; no hay comparacion con ResNet, ViT u otros clasificadores botanicos).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para un backbone ConvNeXt-Small con entrada 224 x 224; el repositorio completo ocupa 0,2 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 funcionan sin problema. Tambien es viable en CPU para inferencia por lotes pequenos.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en dispositivos de borde con aceleracion.
- Opciones de despliegue: el repositorio proporciona carga directa con PyTorch (`model.py`, `transforms.py`); no se publican pesos en GGUF, ONNX ni integraciones con vLLM, llama.cpp, Ollama o TGI (estas herramientas estan orientadas a modelos de lenguaje y no aplican directamente).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Clases | Accuracy test | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| PlantNet/plantnet-300k-v2-cnxs | no disponible (~50 M en backbone ConvNeXt-Small) | 224 x 224 | 1.000 | 0,8296 | dinov3-license | HuggingFace, pesos PyTorch |
| Backbone base facebook/dinov3-convnext-small-pretrain-lvd1689m | no disponible | 224 x 224 | sin cabeza de clasificacion | no aplica (preentrenado) | dinov3-license | HuggingFace, acceso restringido |
| Pl@ntNet-300K (dataset original, modelos del paper 2021) | variable | variable | 1.081 | no disponible en esta ficha | segun paper | Zenodo, codigo asociado |

No se dispone de datos publicados en la informacion proporcionada para comparar con otros clasificadores botanicos especificos (por ejemplo, variantes ViT o ResNet entrenadas sobre Pl@ntNet-300K).

## Limitaciones y advertencias

- Solo clasifica entre las 1.000 especies incluidas en el entrenamiento; cualquier especie fuera de ese conjunto se asignara erroneamente a una de las clases conocidas, sin mecanismo de rechazo o "desconocido".
- El dataset Pl@ntNet-300K tiene alta ambiguedad de etiquetas y distribucion de cola larga, por lo que el rendimiento puede ser muy desigual entre especies frecuentes y raras.
- Riesgo de sesgo geografico y de dominio: las imagenes de entrenamiento provienen de contribuciones de ciencia ciudadana, con posible sobrerrepresentacion de flora europea y de ciertos angulos, iluminaciones y estados fenologicos.
- No se documentan sesgos especificos ni evaluaciones de robustez (condiciones de baja luz, oclusion, imagenes de herbario frente a fotos de campo).
- Licencia dinov3-license: el modelo base DINOv3 esta sujeto a una licencia con acceso restringido que requiere aceptar terminos y autenticarse en Hugging Face antes de la primera carga; es imprescindible revisar las condiciones para uso comercial.
- El repositorio usa `inference: false` en los metadatos y no expone un pipeline estandar de transformers; requiere cargar codigo Python propio (`model.py`), lo que complica el despliegue en entornos gestionados.
- No se publican pesos cuantizados ni formatos alternativos, lo que limita su uso en frameworks no PyTorch.
- La fecha de creacion del repositorio (2026-10-29) y el eprint asociado (2604.27178) deben verificarse antes de citarlos en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PlantNet/plantnet-300k-v2-cnxs
- Modelo base DINOv3 ConvNeXt-Small: https://huggingface.co/facebook/dinov3-convnext-small-pretrain-lvd1689m
- Licencia DINOv3: https://ai.meta.com/resources/models-and-libraries/dinov3-license/
- Dataset Pl@ntNet-300K-v2: https://zenodo.org/records/10419064
- Paper asociado (arXiv:2604.27178): https://arxiv.org/abs/2604.27178
- Paper original Pl@ntNet-300K (NeurIPS Datasets and Benchmarks 2021): no disponible como enlace directo en la informacion proporcionada
- Sitio web de Pl@ntNet: https://plantnet.org/
- Documentacion de Pl@ntNet: https://docs.plantnet.org/
