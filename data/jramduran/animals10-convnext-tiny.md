# jramduran/animals10-convnext-tiny

## Resumen

`jramduran/animals10-convnext-tiny` es un clasificador de imágenes basado en ConvNeXt-Tiny, ajustado mediante transfer learning para distinguir entre 10 clases de animales (mariposa, gato, pollo, vaca, perro, elefante, caballo, oveja, araña y ardilla). Lo publica el usuario jramduran en Hugging Face y forma parte de un proyecto comparativo de cuatro arquitecturas convolucionales entrenadas sobre el mismo conjunto de datos, lo que permite contrastar resultados de forma directa.

El modelo parte de pesos de ConvNeXt-Tiny preentrenados en ImageNet y aplica una estrategia en dos fases: primero entrena la cabeza de clasificación con el backbone congelado y después ajusta las últimas 40 capas con una tasa de aprendizaje baja. La entrada es de 224x224 píxeles y el artefacto se distribuye en formato Keras (`.keras`), con un tamaño de repositorio de aproximadamente 0,1 GB.

Es relevante como referencia práctica para tareas de clasificación de imágenes de dominio acotado: alcanza 0,987 de accuracy y F1 macro sobre un test reservado de 2.618 imágenes, con un coste de entrenamiento de 5,7 minutos en una GPU de portátil. No es un modelo generativo ni multimodal: es un clasificador cerrado de 10 clases, sin capacidades de texto, tool calling ni razonamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ConvNeXt-Tiny (red convolucional pura, transfer learning desde ImageNet) |
| Parámetros totales | no disponible (ConvNeXt-Tiny estándar ronda 28 M, dato no confirmado en la información proporcionada) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 224x224) |
| Tipos de cuantización | no disponible (pesos Keras en precisión de entrenamiento) |
| Idiomas soportados | no aplica (clasificación de imágenes; etiquetas en inglés) |
| Licencia | no disponible |
| Formato de pesos | `.keras` (TensorFlow/Keras; backend Torch en entrenamiento y pruebas), más `model_info.json` con etiquetas y tamaño de entrada |

## Arquitectura y entrenamiento

ConvNeXt-Tiny es una red convolucional moderna que adopta decisiones de diseño inspiradas en los transformers (convoluciones depthwise de 7x7, normalización LayerNorm, activación GELU y estructura de bloques tipo stage). En este caso se usa como extractor de características preentrenado en ImageNet y se le añade una cabeza de clasificación para 10 clases.

El entrenamiento se hizo sobre el dataset Animals-10 (26.177 fotos) con un split estratificado 80/10/10 (entrenamiento, validación para early stopping y test intacto). Se usaron 8 épocas, entrada de 224x224 y una GPU NVIDIA GeForce RTX 5060 Laptop, con un tiempo total de 5,7 minutos. El ajuste fino se aplicó solo a las últimas 40 capas del backbone. No se documenta en la información disponible el uso de RLHF, DPO ni aumentación de datos específica.

## Capacidades

- Clasificación de imágenes en 10 clases cerradas: `butterfly`, `cat`, `chicken`, `cow`, `dog`, `elephant`, `horse`, `sheep`, `spider`, `squirrel`.
- Salida de probabilidades por clase (softmax), apta para umbrales de confianza y análisis de errores.
- Inferencia sobre píxeles en bruto de 0 a 255 sin normalización explícita en el código de ejemplo.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras modalidades.

## Casos de uso

- Filtrado y etiquetado automático de fotos en una galería o aplicación de gestión de imágenes: el modelo asigna una de las 10 etiquetas a cada imagen y devuelve la probabilidad, lo que permite descartar o agrupar automáticamente fotos de mascotas y fauna.
- Moderación o clasificación de contenido en plataformas de compraventa de animales: se puede usar para verificar que la categoría declarada en un anuncio (por ejemplo, "perro") coincide con la imagen subida.
- Preetiquetado en pipelines de anotación humana: dado su 0,987 de accuracy en el test del proyecto, sirve como primer paso para reducir el trabajo manual en datasets de fauna, dejando la revisión humana para los casos de baja confianza.
- Aplicaciones educativas o divulgativas de identificación de animales: integrado en una app móvil o web que muestre la especie probable a partir de una foto, con la salvedad de que solo cubre 10 clases.
- Prototipado rápido en investigación: al ser un artefacto de 0,1 GB en formato Keras, se puede cargar en un portátil y usar como baseline para comparar con otras arquitecturas (el proyecto original compara cuatro modelos con el mismo split).
- Clasificación en el borde o en entornos con recursos limitados: ConvNeXt-Tiny es una red convolucional de tamaño moderado, adecuada para inferencia en CPU o GPU de consumo con latencia baja, aunque no se han publicado cifras de throughput en la información disponible.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el test reservado (n=2.618):

| Métrica | Valor |
|---|---|
| Accuracy | 0,987 |
| F1 macro | 0,987 |
| Precision macro | 0,988 |
| Recall macro | 0,987 |

No se han publicado en la información disponible resultados comparativos con otros modelos en benchmarks estándar (ImageNet, etc.) ni cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del repositorio (0,1 GB) y la arquitectura ConvNeXt-Tiny, la inferencia cabe holgadamente en GPUs de consumo, aunque no se han publicado cifras oficiales.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; el entrenamiento se realizó en una NVIDIA GeForce RTX 5060 Laptop, lo que indica que el ajuste fino es viable en hardware de consumo.
- ¿Cabe en GPU de consumo? Sí, según el hardware de entrenamiento documentado; también es viable en CPU para inferencia puntual, sin datos de latencia publicados.
- Opciones de despliegue: carga directa con Keras (`keras.saving.load_model`) usando backend Torch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de otros modelos comparables en la información proporcionada. El proyecto original menciona que compara cuatro modelos con el mismo split, pero no se detallan sus nombres ni resultados en la información disponible.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jramduran/animals10-convnext-tiny | no disponible | no aplica | Accuracy 0,987 (test propio) | no disponible | Hugging Face |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de clasificación cerrada: solo reconoce 10 clases; cualquier imagen fuera de ese conjunto se asignará igualmente a una de ellas con una probabilidad, sin opción de "desconocido".
- Riesgo de sesgo de dominio: entrenado sobre Animals-10, un dataset con distribución y calidad de imagen concretas; el rendimiento puede degradarse en fotos de otras fuentes, condiciones de iluminación o ángulos no representados.
- Licencia no especificada: no se puede confirmar el uso comercial; conviene contactar con el autor antes de integrarlo en producción.
- Sin información sobre sesgos demográficos o de otro tipo, ni sobre calibración de probabilidades.
- El código de ejemplo requiere fijar el backend de Keras a Torch (`KERAS_BACKEND=torch`), lo que añade una dependencia de entorno que puede romper en despliegues con TensorFlow por defecto.
- No hay garantías de mantenimiento: 0 descargas y 0 likes en el momento de la consulta, con creación y actualización en la misma fecha.
- No apto para tareas generativas, de texto, de razonamiento ni multimodales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jramduran/animals10-convnext-tiny
- Dataset Animals-10: https://huggingface.co/datasets/34data/animal-10
- Repositorio de código del proyecto: https://github.com/JTiiz/CNN-project
