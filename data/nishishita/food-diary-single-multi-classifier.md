# nishishita/food-diary-single-multi-classifier

## Resumen

Food-Diary Single/Multi-Dish Classifier es un adaptador LoRA publicado por el usuario nishishita sobre el modelo base Qwen/Qwen3-VL-4B-Instruct, un modelo visión-lenguaje de 4.000 millones de parámetros. No se trata de un clasificador de alimentos al uso, sino de un módulo binario muy acotado: dada una imagen de comida ya recortada, decide si el recipiente principal situado en el centro contiene un solo plato (etiqueta A, `single-dish`) o varios platos (etiqueta B, `multi-dish`), ignorando los alimentos vecinos que aparecen cortados en los bordes del recorte.

El adaptador resuelve un problema de anotación dentro de un pipeline mayor de etiquetado de fotografías reales de diarios de comida. Su función es previa a la clasificación fina: separar las imágenes que requieren una anotación a nivel de plato de aquellas que contienen una composición múltiple y necesitan un tratamiento distinto. El proyecto se documenta en el repositorio GitHub "Automating Dish-Level Annotation of Real Food-Diary Photos".

Es relevante ahora por dos motivos. Primero, demuestra un patrón de uso eficiente de modelos visión-lenguaje grandes: en lugar de reentrenar, se publica un adaptador PEFT de pequeño tamaño (el repositorio ocupa 0,1 GB) sobre una base Apache-2.0. Segundo, ejemplifica el ajuste fino de Qwen3-VL para una tarea de decisión cerrada con salida de una sola letra, un formato barato de parsear en producción. El modelo se distribuye con licencia Apache-2.0 y solo declara soporte de inglés. No hay métricas publicadas ni datos de entrenamiento detallados en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer visión-lenguaje multimodal Qwen3-VL-4B-Instruct |
| Parametros totales | 4.000 millones en el modelo base; número de parámetros del adaptador no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | No se documentan cuantizaciones del adaptador; la inferencia oficial usa BF16 en CUDA y float32 en CPU |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 (adaptador y código de inferencia; el modelo base Qwen3-VL-4B-Instruct se distribuye por separado también bajo Apache-2.0) |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA, no un modelo completo. La arquitectura efectiva es la del modelo base Qwen3-VL-4B-Instruct: un transformer multimodal que procesa pares imagen-texto y genera texto autoregresivamente. El adaptador añade matrices de bajo rango sobre las capas del modelo base para especializarlo en una única decisión de dos clases. El repositorio incluye un script `infer.py` y un `requirements.txt` que cargan el modelo base de Qwen y aplican el adaptador PEFT por encima.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, el rango y alpha del LoRA, ni si se aplicaron técnicas de alineación adicionales como RLHF o DPO. Tampoco se detalla el esquema de congelación de capas ni qué módulos (atención, MLP) reciben las matrices de bajo rango. La model card indica explícitamente que las fotografías de entrenamiento no se incluyen en el repositorio. La innovación destacable no es arquitectónica sino de diseño de tarea: el modelo aprende a fijar la atención en el contenedor central e ignorar los alimentos parciales de los bordes, lo que convierte un problema ambiguo de segmentación en una decisión textual de una letra.

## Capacidades

- Clasificación binaria de una imagen de comida recortada en `single-dish` (A) o `multi-dish` (B).
- Enfoque explícito en el recipiente principal centrado, descartando alimentos cortados en los márgenes del recorte.
- Salida en texto plano que empieza por la letra A o B; el código de ejemplo mapea esa letra a la etiqueta y conserva el texto crudo del modelo.
- Gestión de respuestas no conformes: cualquier salida que no empiece por A o B se reporta como `unknown`.
- Entrada image-text-to-text, por lo que el adaptador hereda la interfaz multimodal del modelo base.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, matemáticas, generación de código ni audio para este adaptador en concreto.
- Capacidad multilingüe: no disponible; la model card solo declara inglés.

## Casos de uso

- Anotación automática de diarios de comida: el adaptador se sitúa como primer filtro de un pipeline que procesa miles de fotos reales tomadas por usuarios, separando las imágenes de plato único de las de composición múltiple antes de lanzar un etiquetado más caro.
- Enrutado de imágenes a modelos especializados: las fotos clasificadas como `single-dish` se envían a un modelo de reconocimiento de plato concreto y las `multi-dish` a un modelo de detección y segmentación de múltiples instancias.
- Control de calidad de datasets: al aplicar el adaptador sobre un conjunto ya etiquetado se detectan discrepancias entre la etiqueta declarada y la predicha, señalando posibles errores de anotación humana.
- Estimación nutricional por ración: en una aplicación de seguimiento dietético, saber si el recorte contiene uno o varios platos determina si se debe pedir al usuario una porción única o desglosar la ingesta por componentes.
- Moderación de recortes en apps de fotografía gastronómica: el modelo descarta recortes que capturan parte de platos vecinos y que producirían descripciones erróneas si se pasaran directamente a un modelo de captioning.
- Preprocesado en dispositivos con recursos limitados: al ser un adaptador pequeño sobre una base de 4B, puede ejecutarse en una sola GPU de consumo para lotes medianos de imágenes antes de subir los resultados a un servicio central.
- Investigación en anotación semiautomática: sirve como componente reproducible en estudios sobre etiquetado de imágenes dietéticas, ya que el adaptador y el código de inferencia son públicos bajo Apache-2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye accuracy, F1, matriz de confusión ni tamaño del conjunto de evaluación, y tampoco se aportan comparaciones con clasificadores alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base tiene 4.000 millones de parámetros; en BF16 los pesos ocupan aproximadamente 8 GB, a lo que hay que sumar la caché KV, el codificador visual y el overhead del runtime. Como referencia práctica, se recomienda contar con 10-12 GB de VRAM para imágenes de resolución moderada, aunque la cifra exacta no está publicada.
- GPU recomendadas: no hay lista oficial. Por tamaño, una RTX 4090 (24 GB), una A100 (40/80 GB) o una H100 (80 GB) ejecutan el modelo con holgura; una RTX 4080 o 3090 (16-24 GB) deberían ser suficientes en BF16.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas de 12 GB o más en BF16; en tarjetas de 8 GB habría que recurrir a cuantización del modelo base, opción no documentada por el autor.
- CPU: el autor indica que se puede usar `--device cpu` con float32, lo que implica un consumo de RAM notablemente mayor y latencias altas.
- Opciones de despliegue: el repositorio proporciona `infer.py` sobre PEFT y Transformers, con selección de dispositivo mediante `--device`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; al ser un adaptador LoRA en safetensors, es compatible con servidores que acepten adaptadores PEFT, pero su funcionamiento no está verificado por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Food-Diary Single/Multi-Dish Classifier | 4.000 M (base) + adaptador LoRA de tamaño no disponible | no disponible | Clasificación binaria plato único / múltiple | Apache-2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3-VL-4B-Instruct (modelo base sin adaptador) | 4.000 M | no disponible | Visión-lenguaje general | Apache-2.0 | HuggingFace |
| Clasificadores CNN de comida (p. ej. aproximaciones tipo NutriClass o baselines de análisis de alimentos) | no disponible | no aplica | Clasificación de categorías o atributos nutricionales | variable según proyecto | Repositorios GitHub |
| FEAST (retrieval-augmented multi-hierarchical food classification) | no disponible | no disponible | Clasificación jerárquica de alimentos | no disponible | Publicación académica |

La comparación cuantitativa no es posible: no hay benchmarks publicados para este adaptador ni cifras equivalentes en las alternativas encontradas. Frente al modelo base, la diferencia es de especialización, no de tamaño: el adaptador restringe la salida a una decisión binaria y aumenta la consistencia del formato, a costa de perder la capacidad generalista de Qwen3-VL-4B-Instruct.

## Limitaciones y advertencias

- Tarea extremadamente estrecha: solo distingue entre plato único y múltiple sobre un recorte previo; no identifica alimentos, no estima calorías y no segmenta instancias.
- Dependencia del recorte: el modelo asume que el recipiente principal está centrado y que los alimentos de los bordes son irrelevantes. Un recorte mal encuadrado degradará la predicción sin que exista un mecanismo de detección de error más allá de la etiqueta `unknown`.
- Riesgo de alucinación en el sentido de respuestas que no empiezan por A o B: la model card reconoce este caso y lo resuelve etiquetándolo como `unknown`, pero no cuantifica su frecuencia.
- Sin métricas publicadas: no hay accuracy, F1 ni validación sobre un conjunto de test descrito, por lo que no es posible estimar su fiabilidad en producción antes de evaluarlo con datos propios.
- Sesgos: no documentados. Al depender de fotos reales de diarios de comida no distribuidas, se desconoce la composición demográfica, geográfica y culinaria del conjunto de entrenamiento, lo que puede sesgar el comportamiento hacia ciertos tipos de cocina o de vajilla.
- Idioma: la model card solo declara inglés, aunque la salida sea una única letra; no se garantiza el comportamiento con prompts en otros idiomas.
- Licencia: el adaptador y el código se publican bajo Apache-2.0, lo que permite uso comercial. El modelo base Qwen3-VL-4B-Instruct se distribuye por separado y también bajo Apache-2.0 según la model card, pero conviene verificar los términos vigentes en su propio repositorio antes de desplegar.
- Madurez: el repositorio tiene 0 descargas y 0 likes, y no se ha actualizado desde su creación; no hay evidencia de mantenimiento ni de soporte por parte del autor.
- Datos de entrenamiento no incluidos: la imposibilidad de reproducir el ajuste fino limita la auditoría del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nishishita/food-diary-single-multi-classifier
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Repositorio del proyecto (Automating Dish-Level Annotation of Real Food-Diary Photos): https://github.com/244t/food-diary-annotation
- NutriClass-Food-Classification (alternativa de clasificación por atributos nutricionales): https://github.com/NishaSavariar/NutriClass-Food-Classification
- Topic food-classification en GitHub: https://github.com/topics/food-classification
- FEAST: Retrieval-Augmented Multi-Hierarchical Food Classification: https://journals.sagepub.com/doi/reader/10.3233/FAIA251309
- Multiclass classification using scikit-learn (referencia metodológica): https://www.geeksforgeeks.org/machine-learning/multiclass-classification-using-scikit-learn/
- Food Recognition Model with Deep Learning Techniques (referencia de dominio): https://www.labellerr.com/blog/food-recognition-and-classification-using-deep-learning/
