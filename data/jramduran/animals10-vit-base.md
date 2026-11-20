# jramduran/animals10-vit-base

## Resumen

`jramduran/animals10-vit-base` es un modelo de clasificación de imágenes basado en la arquitectura Vision Transformer (ViT-Base/16), desarrollado por el usuario de Hugging Face jramduran. Se trata de un ajuste fino completo (full fine-tuning) del checkpoint `google/vit-base-patch16-224`, preentrenado originalmente en ImageNet-21k y afinado después en ImageNet-1k, al que se le ha sustituido la cabeza de clasificación por una nueva de 10 clases para distinguir entre mariposa, gato, gallina, vaca, perro, elefante, caballo, oveja, araña y ardilla.

El modelo resuelve una tarea acotada de clasificación de imágenes de animales sobre el conjunto de datos Animals-10, con 26.177 fotografías divididas de forma estratificada 80/10/10. Su relevancia es fundamentalmente didáctica y de referencia: forma parte de un proyecto que entrena y compara cuatro modelos sobre exactamente el mismo split, lo que permite contrastar arquitecturas (CNN frente a transformer) con métricas directamente comparables. No es un modelo de propósito general ni un modelo generativo.

Con 85,8 millones de parámetros y un repositorio de solo 0,3 GB, es un modelo ligero, orientado a inferencia rápida y a experimentación educativa. No hay información publicada sobre licencia ni sobre idiomas, y las descargas y likes en el momento de redactar esta ficha son cero, lo que indica que se trata de una publicación reciente y de baja difusión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base/16), parches de 16x16, resolución de entrada 224x224 |
| Parametros totales | 85.806.346 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se documentan variantes GGUF, ONNX ni cuantizadas) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer estándar de tipo base: divide la imagen de entrada de 224x224 en parches de 16x16 píxeles, los proyecta a embeddings y los procesa con una pila de bloques transformer con atención global. El checkpoint de partida es `google/vit-base-patch16-224`, preentrenado en ImageNet-21k y afinado en ImageNet-1k, sobre el que se ha realizado un ajuste fino completo con una nueva cabeza de clasificación de 10 clases.

El entrenamiento se realizó sobre el dataset Animals-10 (26.177 fotos) con un split estratificado 80/10/10 (entrenamiento, validación para early stopping y test no tocado), durante 3 épocas, con entrada de 224x224, en una NVIDIA GeForce RTX 5060 Laptop GPU con un tiempo total de 7,0 minutos. No se documentan en la información disponible detalles sobre composición exacta del dataset, aumentación de datos, hiperparámetros de optimización, ni si hubo etapas de RLHF/DPO (no aplicables en un clasificador). La innovación técnica destacable es la comparabilidad metodológica: los cuatro modelos del proyecto comparten exactamente el mismo split, lo que permite comparaciones justas.

## Capacidades

- Clasificación de imágenes en 10 categorías de animales: `butterfly`, `cat`, `chicken`, `cow`, `dog`, `elephant`, `horse`, `sheep`, `spider`, `squirrel`.
- Salida de probabilidades por clase mediante `transformers.pipeline("image-classification")`.
- Inferencia sobre imágenes RGB redimensionadas a 224x224.
- Integración directa con el ecosistema transformers y con endpoints compatibles (`endpoints_compatible` en los tags).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües, de texto, de audio ni de generación.
- No dispone de modo "thinking" ni de salidas estructuradas más allá de las etiquetas y scores de clasificación.

## Casos de uso

- Clasificación automática de fotos en aplicaciones de galería o archivo personal: el modelo etiqueta cada imagen con una de las 10 clases y su probabilidad, lo que permite organizar bibliotecas fotográficas por especie sin intervención manual.
- Filtrado previo en pipelines de datos de visión: dado su tamaño reducido (85,8 M de parámetros) y su latencia baja esperada, puede usarse como primer filtro para descartar o etiquetar imágenes antes de pasarlas a modelos más costosos.
- Docencia y experimentación con Vision Transformers: al estar entrenado en 7 minutos sobre una GPU de portátil y con código público, sirve como ejemplo reproducible de fine-tuning completo de ViT para asignaturas de deep learning.
- Comparación de arquitecturas en investigación aplicada: al compartir split con los otros tres modelos del proyecto, permite analizar el compromiso entre precisión, coste computacional y tamaño de modelo en tareas de clasificación acotadas.
- Prototipado rápido de demos de clasificación de imágenes: la API de `pipeline` permite montar una demo funcional en pocas líneas, útil para validar una idea de producto antes de invertir en un modelo mayor.
- Monitorización de fauna en entornos controlados: para conjuntos de imágenes con las 10 especies cubiertas (por ejemplo, cámaras trampa en granjas o jardines), el modelo puede servir como clasificador base con una precisión reportada de 0,992 en test.
- Etiquetado asistido (pre-labeling) en anotación de datasets: las predicciones del modelo pueden precargar etiquetas que un humano revise, acelerando la construcción de nuevos conjuntos con esas clases.

## Benchmarks y rendimiento

Resultados reportados por el autor en el conjunto de test reservado (n=2618):

| Metrica | Valor |
|---|---|
| Accuracy | 0,992 |
| F1 macro | 0,992 |
| Precision macro | 0,993 |
| Recall macro | 0,991 |

No se han publicado en la información disponible resultados comparativos con otros modelos en benchmarks estándar (ImageNet, etc.) ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: en torno a 0,35 GB solo para pesos (85,8 M de parámetros × 4 bytes), más activaciones y overhead del framework; en la práctica, menos de 2 GB en la mayoría de configuraciones.
- En FP16/BF16 los pesos ocupan aproximadamente 0,17 GB, lo que reduce aún más los requisitos.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; el autor entrenó en una NVIDIA GeForce RTX 5060 Laptop GPU, lo que da una idea del perfil de hardware necesario.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU con latencias aceptables para lotes pequeños.
- Opciones de despliegue: `transformers` (pipeline de image-classification), y por extensión frameworks compatibles con safetensors; no se documentan variantes para vLLM, llama.cpp, Ollama ni TGI (estos dos últimos están orientados a modelos de lenguaje y no aplican).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jramduran/animals10-vit-base` | 85,8 M | no aplica | Clasificación 10 clases (Animals-10) | no disponible | Hugging Face |
| `google/vit-base-patch16-224` | ~86 M | no aplica | Clasificación ImageNet-1k (1000 clases) | Apache 2.0 (según checkpoint original) | Hugging Face |
| Otros modelos del mismo proyecto (CNN) | no disponible | no aplica | Clasificación 10 clases (Animals-10) | no disponible | Repositorio del proyecto |

La comparación más directa es con el checkpoint base de Google: mismo tamaño y arquitectura, pero distinta cabeza de clasificación y distinto dominio. Respecto a los otros tres modelos del proyecto (redes CNN), no se dispone de sus especificaciones ni métricas en la información proporcionada, aunque el autor indica que comparten split y, por tanto, sus resultados son comparables.

## Limitaciones y advertencias

- El modelo solo reconoce 10 clases concretas; cualquier imagen fuera de esas categorías se asignará a una de ellas con alta probabilidad, sin mecanismo de rechazo o clase "otra".
- Riesgo de sesgo por composición del dataset Animals-10: la distribución de especies, razas, fondos e iluminación del conjunto de entrenamiento condiciona el rendimiento en dominios distintos.
- La métrica de 0,992 procede de un test del mismo dataset; no hay evidencia de generalización a imágenes reales fuera de distribución.
- No se especifica la licencia, lo que impide confirmar si el uso comercial está permitido; debe consultarse con el autor antes de cualquier despliegue en producción.
- No hay información sobre idiomas porque el modelo no procesa texto; la ficha de Hugging Face no documenta metadatos de región o idioma más allá de `region:us`.
- Modelo de baja difusión (0 descargas, 0 likes en el momento de la consulta): no hay validación independiente de los resultados reportados.
- No se documentan limitaciones de contexto porque no aplica; sin embargo, la resolución fija de 224x224 puede degradar el rendimiento en objetos pequeños o imágenes de muy alta resolución sin preprocesado adecuado.
- Al ser un ajuste fino completo de solo 3 épocas, existe riesgo de sobreajuste al split de entrenamiento, aunque la validación para early stopping mitiga parcialmente este punto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jramduran/animals10-vit-base
- Dataset Animals-10: https://huggingface.co/datasets/34data/animal-10
- Repositorio del proyecto (código de entrenamiento): https://github.com/JTiiz/CNN-project
- Checkpoint base: https://huggingface.co/google/vit-base-patch16-224
