# mrnb26/soil-type-classifier

## Resumen

El modelo `mrnb26/soil-type-classifier` es una red neuronal convolucional (CNN) desarrollada por el usuario mrnb26 y publicada en Hugging Face, entrenada para clasificar imágenes de suelo en distintas categorías edafológicas. Se implementó con TensorFlow y Keras y su propósito es automatizar la identificación del tipo de suelo a partir de fotografías, una tarea útil en agricultura de precisión, monitorización ambiental e investigación edafológica.

La arquitectura es deliberadamente sencilla: cuatro capas convolucionales con filtros crecientes (32 a 128), max pooling tras cada una, una capa densa de 512 unidades con activación ReLU, dropout de 0,5 y una capa de salida softmax. Trabaja con imágenes de 224x224 píxeles y se entrenó durante 15 épocas con optimizador Adam y pérdida categorical crossentropy sobre un dataset dividido 80/20 entre entrenamiento y validación, con aumento de datos (rotaciones, zoom, volteos).

Es relevante como ejemplo de clasificador de imagen de dominio específico, ligero y de bajo coste computacional, no como modelo de propósito general. El repositorio ocupa aproximadamente 0,1 GB, no registra descargas ni likes en el momento de la consulta y no incluye información sobre licencia, idiomas ni pipeline declarado en los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (TensorFlow/Keras): 4 capas convolucionales + MaxPooling, Flatten, Dense(512)+ReLU, Dropout(0.5), Softmax |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 224x224) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de clasificación de imagen, sin componente textual) |
| Licencia | no disponible |
| Formato de pesos | no disponible (la model card menciona TensorFlow/Keras; el formato concreto de los ficheros no se especifica) |

## Arquitectura y entrenamiento

La arquitectura es una CNN secuencial de cuatro bloques convolucionales con filtros de 32, 64, 96 y 128 (según la descripción "32 → 128" de la model card), cada uno seguido de MaxPooling. La salida de la última capa de pooling se aplana y pasa por una capa densa de 512 unidades con ReLU, un dropout del 0,5 para regularización y una capa final softmax con tantas unidades como clases de suelo. La entrada son imágenes RGB redimensionadas a 224x224.

El entrenamiento se realizó sobre un dataset de imágenes de suelo organizadas en carpetas por categoría, con una partición del 80 % para entrenamiento y el 20 % para validación. Se aplicó aumento de datos (rotación, zoom, volteos) para mejorar la generalización. La configuración fue: batch size 32, 15 épocas, pérdida categorical crossentropy y optimizador Adam. No se documenta el número de imágenes del dataset, la procedencia de las mismas, ni si se aplicaron técnicas de ajuste fino posteriores o validación cruzada. Las curvas de entrenamiento y validación se incluyen en el fichero `training_results.png` del repositorio.

## Capacidades

- Clasificación de imágenes de suelo en 11 categorías: Alluvial soil, Black Soil, Cinder Soil, Clayey soils, Laterite soil, Loamy soil, Peat Soil, Sandy loam, Sandy soil y Yellow Soil (la model card enumera 10 etiquetas bajo el encabezado de "11 tipos", discrepancia que conviene verificar contra el fichero de índices de clase).
- Predicción con puntuación de confianza mediante la función `predict_soil_type(model, 'path/to/image.jpg', class_indices)`, que devuelve el tipo de suelo y la confianza asociada.
- Entrada de imagen de tamaño fijo 224x224.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes ni generación de texto.
- No tiene capacidades multilingües ni de audio o vídeo.
- No dispone de modo de razonamiento (thinking mode) ni de visión general más allá de la clasificación cerrada de las clases entrenadas.

## Casos de uso

- Inventario edafológico asistido por imagen: capturar fotografías de muestras de suelo en campo y clasificarlas automáticamente para prellenar formularios de inventario, reduciendo el tiempo de etiquetado manual en estudios preliminares.
- Agricultura de precisión: integrar el clasificador en una aplicación móvil que, a partir de una foto del suelo, sugiera el tipo predominante y oriente decisiones de fertilización o elección de cultivo, siempre como apoyo y no como sustituto de un análisis de laboratorio.
- Monitorización ambiental y teledetección a pie de campo: procesar lotes de imágenes de parcelas para detectar cambios en la composición superficial del suelo entre campañas.
- Docencia y divulgación: usar el modelo como ejemplo práctico de pipeline de visión por computador con Keras en cursos de machine learning aplicado a ciencias agrarias.
- Preetiquetado de datasets: emplear las predicciones con confianza alta como etiquetas iniciales para acelerar la anotación de nuevos conjuntos de imágenes de suelo, con revisión humana posterior.
- Prototipado de sistemas de recomendación agronómica: combinar la salida del clasificador con reglas de negocio o bases de datos de cultivos para generar recomendaciones básicas en herramientas de demostración.
- Investigación en clasificación de texturas: servir de línea base (baseline) sencilla contra la que comparar modelos más complejos de clasificación edafológica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente indica que se registraron las precisiones de entrenamiento y validación y que se representan en `training_results.png`, sin aportar cifras numéricas de accuracy, F1 ni matrices de confusión.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión al no conocerse el número exacto de parámetros; por la arquitectura descrita (4 capas convolucionales y una densa de 512), el modelo es muy ligero y debería caber holgadamente en cualquier GPU de consumo con varios GB de VRAM.
- GPU recomendadas: cualquier GPU moderna es suficiente; una RTX 3060, RTX 4090 o incluso una GPU integrada pueden ejecutar la inferencia por CPU sin problema dado el reducido tamaño del repositorio (0,1 GB).
- Cabe en GPU de consumo: sí, con margen amplio.
- Opciones de despliegue: TensorFlow/Keras para carga directa del modelo; exportación a TensorFlow Lite o TensorFlow.js para despliegue en móvil o navegador; ONNX Runtime si se convierte el modelo. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Clases | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mrnb26/soil-type-classifier | CNN Keras | 10-11 tipos de suelo | 224x224 | no disponible | Hugging Face |
| Alternativas de clasificación de suelo | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de clasificación de tipos de suelo en la documentación proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable con alternativas de la misma categoría.

## Limitaciones y advertencias

- La model card menciona 11 categorías pero solo enumera 10 etiquetas; es necesario verificar el número real de clases en el fichero de índices antes de usar el modelo en producción.
- No se especifica la licencia, lo que impide confirmar si el uso comercial está permitido; debe contactarse con el autor antes de cualquier despliegue comercial.
- No se documenta el tamaño, la procedencia ni la calidad del dataset de entrenamiento, lo que dificulta evaluar sesgos y capacidad de generalización a suelos de otras regiones o condiciones de iluminación.
- Con solo 15 épocas de entrenamiento y una arquitectura sencilla, es probable que el modelo tenga un rendimiento limitado en imágenes fuera de la distribución de entrenamiento (suelos húmedos, sombras, distintas cámaras).
- Riesgo de alucinación en sentido clasificatorio: el softmax siempre devuelve una de las clases conocidas con cierta confianza, incluso ante imágenes que no corresponden a ninguna categoría; conviene aplicar umbrales de confianza y validación humana.
- No apto para sustituir análisis de laboratorio: la clasificación visual del suelo es aproximada y no captura propiedades químicas ni granulometría fina.
- Sin soporte de texto, tool calling ni agentes; su integración requiere un pipeline externo que gestione la captura, el preprocesado y el consumo de la predicción.
- El repositorio no registra descargas ni likes, lo que sugiere ausencia de validación por parte de la comunidad; trátese como un prototipo experimental.

## Enlaces

- Hugging Face: https://huggingface.co/mrnb26/soil-type-classifier
- No se han encontrado en la información disponible otros enlaces a papers, blogs, repositorios o demos adicionales.
