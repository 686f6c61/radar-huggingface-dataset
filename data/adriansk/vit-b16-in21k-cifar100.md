# AdrianSK/vit-b16-in21k-cifar100

## Resumen

ViT-B/16 (ImageNet-21k) fine-tuned on CIFAR-100 es un modelo de clasificacion de imagenes desarrollado por el usuario AdrianSK y publicado en HuggingFace. Se trata de una implementacion propia del Vision Transformer (Dosovitskiy et al., 2021) escrita desde cero en PyTorch, sobre la que se han cargado los pesos oficiales de ViT-B/16 preentrenados por Google en ImageNet-21k y posteriormente se ha realizado un fine-tuning sobre el dataset CIFAR-100. El modelo resuelve el problema de clasificar imagenes RGB de 224x224 pixeles en una de las 100 clases finas de CIFAR-100.

Su relevancia es principalmente didactica y de referencia tecnica: el autor demuestra que su implementacion desde cero carga los pesos oficiales de Google de forma equivalente (1:1) y alcanza un top-1 del 91,31% y un top-5 del 99,00% en el conjunto de test de CIFAR-100, resultados competitivos para esta arquitectura y dataset. La arquitectura sigue el diseno estandar de ViT-B/16: dimension de embedding de 768, 12 bloques transformer, 12 cabezas de atencion, MLP de 3072, parches de 16x16 y entrada de 224x224, con un total de 85,9 millones de parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-B/16), D=768, 12 bloques, 12 cabezas, MLP 3072, parche 16, entrada 224px |
| Parametros totales | 85.875.556 (85,9M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision; entrada de 224x224 con parches de 16x16, lo que equivale a 197 tokens de imagen) |
| Tipos de cuantizacion | no disponible (pesos en precision original, FP32) |
| Idiomas soportados | no disponible (modelo de vision, sin componente linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un Vision Transformer clasico: la imagen de entrada se divide en parches no solapados de 16x16 pixeles que se proyectan linealmente a un embedding de dimension 768. Sobre estos tokens se aplican 12 bloques transformer con 12 cabezas de atencion multi-cabeza y capas MLP con dimension interna de 3072. Incluye token de clasificacion y embeddings posicionales, siguiendo el diseno original de Dosovitskiy et al. (arXiv:2010.11929). A diferencia de implementaciones basadas en la libreria `transformers` de HuggingFace, esta es una implementacion desde cero en PyTorch, verificada al cargar los pesos oficiales de ViT-B/16 de Google (preentrenados en ImageNet-21k) de forma equivalente.

El fine-tuning sobre CIFAR-100 se realizo con SGD (momentum 0,9), un learning rate de 0,03 (seleccionado como el mejor tras busqueda), warmup de 25 pasos, recorte de gradiente a 1,0, batch size efectivo de 512 (con micro-batch de 32, lo que sugiere acumulacion de gradiente) y 500 pasos de entrenamiento, con dropout desactivado. Las imagenes de entrada se redimensionan a 224x224 con los pixeles escalados al rango [-1, 1]. No se ha publicado informacion sobre el numero de epocas equivalentes ni sobre tecnicas adicionales como mixup o aumento de datos especifico.

## Capacidades

- Clasificacion de imagenes en 100 clases finas de CIFAR-100 (animales, vehiculos, objetos, plantas, etc.).
- Salida de probabilidades por clase mediante softmax, con utilidad directa para obtener top-k predicciones.
- Transferencia de conocimiento desde ImageNet-21k, lo que proporciona representaciones visuales genericas reutilizables.
- Carga programatica de pesos desde el hub de HuggingFace mediante la utilidad `from_pretrained` del repositorio del autor.
- No soporta capacidades multimodales de texto, vision-lenguaje, deteccion, segmentacion ni OCR: es un clasificador de imagen unica a etiqueta.

## Casos de uso

- Clasificacion de imagenes en las 100 categorias de CIFAR-100: uso directo del modelo para etiquetar imagenes pequeñas de objetos cotidianos (peces, flores, vehiculos, electrodomesticos) con una precision top-1 del 91,31%.
- Baseline de investigacion en vision: al ser una implementacion desde cero con pesos oficiales cargados 1:1, sirve como referencia verificable para comparar nuevas variantes de ViT, estrategias de fine-tuning o metodos de regularizacion sobre CIFAR-100.
- Ensenanza y aprendizaje de arquitecturas transformer de vision: el codigo abierto del repositorio permite estudiar la implementacion completa del ViT, desde la tokenizacion de parches hasta la cabeza de clasificacion, con un modelo ya entrenado para validar la implementacion.
- Prototipado rapido de pipelines de clasificacion: la API de carga `from_pretrained` y el preprocesamiento incluido (`finetune_transforms`) permiten montar un clasificador funcional en pocas lineas para demos o pruebas de concepto.
- Punto de partida para fine-tuning en dominios cercanos: las representaciones de ImageNet-21k pueden adaptarse a datasets propios de clasificacion fina con pocas epocas de entrenamiento adicional.
- Evaluacion de tecnicas de compresion y cuantizacion: con 85,9M de parametros y un tamano de repo de 0,3 GB, es un candidato razonable para experimentar con destilacion, pruning o cuantizacion y medir el impacto en el top-1 de CIFAR-100.

## Benchmarks y rendimiento

Resultados publicados en la model card del autor sobre el conjunto de test de CIFAR-100:

| Metrica | Valor |
|---|---|
| Test top-1 | 91,31% |
| Test top-5 | 99,00% |

No se han publicado comparaciones con otros modelos (por ejemplo, ResNet, DeiT u otros ViT fine-tuned en CIFAR-100) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 85,9M de parametros en FP32 (unos 0,3 GB de pesos), el modelo requiere menos de 1 GB de VRAM para inferencia con batch pequeno, incluyendo activaciones.
- GPU recomendadas: cualquier GPU moderna es suficiente para inferencia; no se requieren aceleradores de gama alta como A100 o H100. Una RTX 3060 o superior sobra con diferencia.
- Consumer GPU: cabe con holgura en practicamente cualquier GPU con al menos 2-4 GB de VRAM; incluso puede ejecutarse en CPU para inferencia de imagenes individuales con latencias aceptables.
- Opciones de despliegue: PyTorch puro mediante el repositorio del autor (`pip install git+https://github.com/AdrianKazi/ViT`). Al no ser un modelo en formato `transformers` estandar, no es directamente compatible con vLLM, TGI ni Ollama; la inferencia se realiza con el codigo de `vit.hub.from_pretrained`.
- Latencia y throughput: no disponible. Al ser un ViT-B con entrada de 224x224, se espera inferencia en el orden de milisegundos por imagen en GPU de gama media, pero no hay medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Preentrenamiento | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AdrianSK/vit-b16-in21k-cifar100 | 85,9M | ImageNet-21k (Google) + CIFAR-100 | Clasificacion CIFAR-100 | Apache 2.0 | HuggingFace, pesos safetensors |
| google/vit-base-patch16-224-in21k | 86M | ImageNet-21k | Base para fine-tuning (sin cabeza CIFAR-100) | Apache 2.0 | HuggingFace, integrado en `transformers` |
| google/vit-base-patch16-224 | 86M | ImageNet-21k + ImageNet-1k | Clasificacion ImageNet-1k (1000 clases) | Apache 2.0 | HuggingFace, integrado en `transformers` |

La diferencia principal frente a los modelos oficiales de Google es que esta variante incluye ya el fine-tuning sobre CIFAR-100 con metricas publicadas, pero no esta integrada en la libreria `transformers`, por lo que requiere el repositorio de codigo del autor.

## Limitaciones y advertencias

- Dominio de clases restringido: el modelo solo clasifica entre las 100 clases finas de CIFAR-100. No es util para clasificacion general fuera de esas categorias sin reentrenamiento.
- Resolucion fija de 224x224: las imagenes deben redimensionarse a esa resolucion con los pixeles escalados a [-1, 1]; desviarse del preprocesamiento indicado degrada el rendimiento.
- CIFAR-100 es un dataset de imagenes de baja resolucion (32x32) reescaladas; el rendimiento en imagenes de alta resolucion del mundo real puede no reflejar el 91,31% de top-1 publicado.
- Riesgo de sobreajuste por entrenamiento corto: el fine-tuning se realizo con solo 500 pasos, lo que sugiere un ajuste ligero apoyado en el preentrenamiento de ImageNet-21k.
- No hay informacion sobre calibracion de las probabilidades de salida ni sobre sesgos del modelo; como todo clasificador entrenado en datasets academicos, puede mostrar sesgos frente a imagenes fuera de distribucion.
- Compatibilidad limitada: el modelo no funciona con la libreria `transformers` de HuggingFace de forma estandar; requiere instalar el paquete del autor, lo que introduce una dependencia externa a evaluar antes de uso en produccion.
- Uso comercial: la licencia Apache 2.0 permite el uso comercial, la modificacion y la redistribucion, con obligacion de incluir la nota de licencia. No se conocen restricciones adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AdrianSK/vit-b16-in21k-cifar100
- Repositorio de codigo (implementacion ViT en PyTorch): https://github.com/AdrianKazi/ViT
- Paper original del Vision Transformer: https://arxiv.org/abs/2010.11929
- Dataset CIFAR-100 en HuggingFace: https://huggingface.co/datasets/uoft-cs/cifar100
