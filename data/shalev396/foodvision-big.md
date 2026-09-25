# shalev396/foodvision-big

## Resumen

FoodVision Big es un clasificador de imágenes especializado en reconocer platos de comida entre las 101 categorías del dataset Food-101. Lo desarrolla el usuario shalev396 dentro de su proyecto personal "ml-lab" y se publica bajo licencia MIT. El modelo parte del backbone `efficientnet_b2` de torchvision, inicializado con los pesos `EfficientNet_B2_Weights.IMAGENET1K_V1`, al que se sustituye la cabeza de clasificación por `Dropout(0.3) -> Linear(1408, 101)` y se hace un fine-tuning completo de todas las capas.

Se trata de un modelo pequeño (en torno a 7,84 millones de parámetros) y muy ligero, pensado más como pieza didáctica y de demostración que como sistema de producción a gran escala. Aun así, alcanza un 87,46 % de exactitud en el split de test de Food-101, un resultado sólido para su tamaño, y se puede ejecutar en CPU sin problema. Se distribuye con pesos en safetensors, `config.json` con los nombres de clase, `model.py` con la arquitectura y un `handler.py` listo para desplegar como Inference Endpoint de HuggingFace.

Su relevancia es sobre todo práctica: sirve como referencia reproducible de transfer learning end-to-end sobre un backbone EfficientNet, con una receta de entrenamiento documentada al detalle (5 épocas, Adam, label smoothing, TrivialAugmentWide) que se puede replicar en unos 22 minutos en una única GPU RTX 2080 Ti.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | torchvision `efficientnet_b2` (CNN con bloques MBConv y squeeze-and-excitation), inicializado desde `EfficientNet_B2_Weights.IMAGENET1K_V1`, cabeza sustituida por `Dropout(0.3) -> Linear(1408, 101)` |
| Parametros totales | 7.843.303 según la model card; 7.910.871 según el recuento del fichero safetensors (discrepancia no explicada por el autor) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificador de imágenes; entrada RGB de cualquier tamaño, preprocesada a 288x288) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible; las 101 etiquetas de clase están en inglés |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`), más `config.json`, `model.py`, `handler.py`, `requirements.txt`, `metrics.json` y `assets/` |

## Arquitectura y entrenamiento

La arquitectura es una EfficientNet-B2 estándar de torchvision: una red convolucional con bloques MBConv, conexiones residuales y módulos de squeeze-and-excitation, con aproximadamente 7,84 millones de parámetros tras sustituir la cabeza original de 1000 clases por una capa lineal de 1408 a 101 salidas precedida de dropout 0,3. El preprocesado es el que devuelve `model.get_transform()`: redimensionado bicúbico a 288 píxeles, recorte central de 288x288 y normalización con media y desviación típica de ImageNet. La salida son probabilidades softmax sobre las 101 clases, en orden alfabético (el mismo orden que usa `torchvision.datasets.Food101`), almacenadas en `config.json`. El método `predict(image, top_k=5)` permite obtener solo las k clases más probables.

El entrenamiento es un fine-tuning completo de todas las capas sobre Food-101 (75.750 imágenes de train y 25.250 de test, 750 y 250 por clase). La receta concreta: optimizador Adam con `lr=1e-4` constante, entropía cruzada con label smoothing 0,1, batch de 32, 5 épocas, semilla 42, `TrivialAugmentWide` sobre las imágenes de train y precisión mixta fp16 con `torch.compile` en GPU. Se conserva la época con menor pérdida de test, que resultó ser la última. El run original se hizo en una NVIDIA RTX 2080 Ti y tardó unos 22 minutos desde el inicio del logging hasta la última época. Este checkpoint es una conversión 1:1 del `state_dict` `.pth` original a safetensors; según el autor, las probabilidades coinciden de forma exacta con el modelo original en las 3 imágenes de ejemplo (diferencia máxima 0,0).

## Capacidades

- Clasificación de imágenes de comida en 101 categorías cerradas, de "apple pie" a "waffles".
- Devolución de probabilidades softmax para las 101 clases o solo las `top_k` más probables.
- Acepta imágenes RGB de cualquier tamaño y resolución; el preprocesado interno las normaliza a 288x288.
- Ejecución en CPU o GPU con el mismo código (`model.load(path, device="cpu"|"cuda")`).
- Exposición como API HTTP mediante el Space público (`/predict`, devuelve etiqueta top-5, segundos y dispositivo).
- Despliegue como Inference Endpoint de HuggingFace gracias a `handler.py`, que acepta tanto bytes de imagen (`Content-Type: image/jpeg`) como JSON con imagen en base64 y parámetro `top_k`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión general (solo clasificación), audio, ni modo "thinking".
- Capacidades multilingües: no disponibles; se trata de un clasificador con etiquetas en inglés.
- Capacidad especial: ninguna más allá de la clasificación de imágenes.

## Casos de uso

- Etiquetado automático de recetas y catálogos gastronómicos: dado un banco de fotos de platos, el modelo asigna una de las 101 categorías y permite generar metadatos estructurados para un CMS o un recetario.
- Moderación y organización de contenido en comunidades de cocina: clasificar las imágenes subidas por los usuarios para enrutarlas a la sección correcta o para detectar envíos fuera de temática.
- Registro dietético asistido: una aplicación móvil puede fotografiar un plato y usar la etiqueta predicha como entrada inicial para que el usuario confirme la comida y estime calorías.
- Control de calidad en cocinas industriales o cadenas de restauración: verificar de forma automatizada que el plato fotografiado en línea de producción corresponde a la referencia esperada.
- Prototipado rápido y docencia: con 7,84 millones de parámetros, se puede cargar y ejecutar en un portátil sin GPU, lo que lo hace útil para enseñar transfer learning, fine-tuning end-to-end y despliegue de endpoints.
- Base para fine-tuning adicional: al ser un checkpoint EfficientNet-B2 completo con licencia MIT, sirve como punto de partida para dominios culinarios más específicos (cocina regional, cartas de restaurante propias) con relativamente pocos datos.
- Preanotación en pipelines de etiquetado humano: generar predicciones top-5 para que un anotador solo tenga que elegir entre cinco opciones, reduciendo el tiempo de anotación en proyectos de visión por computador gastronómica.
- Demo interactiva o widget público: el Space expone un endpoint HTTP sencillo que se puede incrustar en una web o en un bot de mensajería para identificar platos a partir de fotos enviadas por usuarios.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card (marcados como no verificados):

| Dataset | Split | Metrica | Valor |
|---|---|---|---|
| Food-101 (101 clases) | test | accuracy | 0,874604 |

Progresión de exactitud en test por época durante el entrenamiento original (dato de la model card):

| Epoca | Exactitud en test |
|---|---|
| 1 | 80,6 % |
| 2 | 84,9 % |
| 3 | 86,1 % |
| 4 | 86,5 % |
| 5 (conservada) | 87,5 % |

La pérdida de test bajó en todas las épocas, por lo que se conservó la última. La model card indica que solo se ha entrenado una variante hasta la fecha. No se han publicado en la información disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K y similares no aplican a este tipo de modelo), ni comparaciones oficiales con otras arquitecturas sobre Food-101.

## Requisitos de hardware

- VRAM estimada: en torno a 31 MB en fp32 y 16 MB en fp16 para los pesos; el consumo real en inferencia es de unos pocos cientos de MB incluyendo activaciones y el runtime de PyTorch.
- Cabe holgadamente en cualquier GPU de consumo, incluidas GTX 1050, GTX 1650, RTX 3060, RTX 4090 y también en iGPU modestas.
- Funciona en CPU: el Space público está desplegado con `runtime: cpu-basic` y el autor documenta `model.load(path, device="cpu")` como opción por defecto.
- GPU recomendadas: cualquiera con soporte CUDA; el entrenamiento original se hizo en una única NVIDIA RTX 2080 Ti. Para inferencia, una T4 o incluso CPU es suficiente; A100 o H100 serían enormemente sobredimensionadas.
- Opciones de despliegue: Inference Endpoints de HuggingFace mediante el `handler.py` incluido (CPU o GPU), Gradio Space, ejecución local con Python (`torch`, `torchvision`, `pillow`, `huggingface_hub`, `safetensors`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de clasificación de imágenes.
- Latencia y throughput: no se publican cifras de latencia por imagen ni de imágenes por segundo. El Space devuelve el tiempo en segundos como parte de la respuesta. Como referencia de coste de cómputo, el entrenamiento completo de 5 épocas sobre 75.750 imágenes tardó aproximadamente 22 minutos en una RTX 2080 Ti.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks de modelos alternativos en la información proporcionada, por lo que la comparación se limita a características estructurales. Las cifras de parámetros de los modelos alternativos corresponden a las arquitecturas estándar publicadas por sus autores y no han sido verificadas en esta ficha.

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FoodVision Big (este modelo) | 7,84 M (7,91 M según safetensors), 101 clases | Clasificación de imágenes (Food-101) | no aplica (entrada 288x288) | MIT | HuggingFace, safetensors, Space, Endpoint |
| EfficientNet-B0 | aprox. 5,3 M (referencia de la arquitectura estándar) | Clasificación de imágenes | no aplica | Apache 2.0 (torchvision) | torchvision, ampliamente distribuido |
| EfficientNet-B2 sin fine-tuning específico | aprox. 9,1 M con cabeza de 1000 clases | Clasificación de imágenes | no aplica | Apache 2.0 (torchvision) | torchvision |
| ResNet-50 | aprox. 25,6 M (referencia de la arquitectura estándar) | Clasificación de imágenes | no aplica | BSD / Apache 2.0 según implementación | torchvision, ampliamente distribuido |

La ventaja diferencial de FoodVision Big frente a usar un backbone genérico de ImageNet es que está especializado en las 101 clases de Food-101 y se distribuye con la cabeza de clasificación ya entrenada, el mapeo de nombres de clase y un handler de despliegue. Su desventaja es que solo reconoce esas 101 categorías cerradas y no generaliza a platos fuera de ese conjunto.

## Limitaciones y advertencias

- El espacio de etiquetas está cerrado a las 101 clases de Food-101: cualquier plato que no pertenezca a ese conjunto recibirá forzosamente una de las 101 etiquetas, con la probabilidad asociada, sin mecanismo de rechazo o clase "desconocida".
- Riesgo de alucinación en sentido clasificatorio: el softmax siempre suma 1, por lo que una imagen no culinaria puede obtener una etiqueta con confianza aparentemente alta. Conviene fijar un umbral de confianza y validar con `top_k` antes de usarlo en producción.
- Sesgos: el dataset Food-101 está compuesto por fotografías de estilo occidental y mayoritariamente de alta calidad, tomadas en condiciones controladas. El rendimiento puede degradarse con cocinas no representadas, iluminación pobre, imágenes de móvil con ruido, platos muy procesados o presentaciones atípicas.
- Ruido en las etiquetas: la propia model card advierte de que las imágenes de entrenamiento de Food-101 contienen ruido de etiqueta introducido deliberadamente por los autores del dataset; las de test sí fueron limpiadas a mano. Esto limita el techo alcanzable durante el fine-tuning.
- Idiomas: no se declara ningún idioma soportado; las etiquetas están en inglés, por lo que cualquier interfaz en castellano requiere una tabla de traducción propia.
- Licencia MIT: permite uso comercial, modificación y redistribución con atribución, pero el autor no ofrece ninguna garantía. Al derivar de pesos de torchvision (ImageNet), conviene revisar también las condiciones de la licencia de torchvision y del dataset Food-101 para usos distintos de la investigación.
- Integridad de los datos publicados: la model card declara 7.843.303 parámetros mientras que el recuento del fichero safetensors es de 7.910.871; el autor no explica la diferencia. Además, la exactitud del 87,46 % figura como `verified: false`, es decir, no ha sido validada de forma independiente.
- Rendimiento no verificado: no hay resultados de benchmarks publicados por terceros, ni latencias ni throughput medidos, ni pruebas de robustez frente a distribuciones desplazadas.
- Fechas de la model card incoherentes con el ciclo de vida habitual (creación en septiembre de 2026, entrenamiento declarado en mayo de 2026); se reproducen tal cual, sin interpretación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shalev396/foodvision-big
- Space de demostración: https://huggingface.co/spaces/shalev396/foodvision-big
- Repositorio GitHub del proyecto ml-lab (carpeta foodvision-big): https://github.com/shalev396/ml-lab/tree/main/foodvision-big
- Código de entrenamiento: https://github.com/shalev396/ml-lab/tree/main/foodvision-big/training
- Notebook de Colab para reproducir el entrenamiento: https://colab.research.google.com/github/shalev396/ml-lab/blob/main/foodvision-big/training/notebook.ipynb
- Dataset Food-101 en HuggingFace: https://huggingface.co/datasets/ethz/food101

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los enlaces anteriores proceden de la model card y del repositorio de HuggingFace.
