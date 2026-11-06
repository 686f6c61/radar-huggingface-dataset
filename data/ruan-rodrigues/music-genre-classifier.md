# ruan-rodrigues/music-genre-classifier

## Resumen

El Music Genre Classifier es un modelo de clasificación de audio desarrollado por Ruan Rodrigues que asigna una pista musical a una de cinco categorías: Pop, Rock, Electronic, Classical y Forró. A diferencia de los modelos basados en deep learning sobre espectrogramas o arquitecturas transformer de audio, este clasificador se apoya en un perceptrón multicapa (MLP) de scikit-learn entrenado sobre 293 características acústicas extraídas manualmente con Librosa. El artefacto se distribuye como un fichero `model.joblib` que empaqueta conjuntamente el clasificador y el `StandardScaler` ajustado durante el entrenamiento.

El modelo resuelve el problema de la categorización automática de género musical en un ámbito académico y de prototipado, con un enfoque clásico de ingeniería de características que prioriza la interpretabilidad y la ligereza frente a los enfoques end-to-end. La entrada es una forma de onda de audio en mono, remuestreada a 22.050 Hz, con una duración mínima de 30 segundos; internamente se seleccionan cinco segmentos de seis segundos de distintas posiciones de la grabación y se concatenan antes de la extracción de características.

Su relevancia actual es limitada en el ecosistema de modelos fundacionales de audio, pero resulta útil como referencia didáctica de pipelines de clasificación musical y como componente ligero en aplicaciones donde no se dispone de GPU ni de modelos de gran tamano. La licencia no está especificada en la información disponible, lo que condiciona cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa (MLP) de scikit-learn |
| Parametros totales | no disponible (capas densas de 293→128→64→5) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (audio de entrada, mínimo 30 s; se usan 5 segmentos de 6 s) |
| Tipos de cuantizacion | no disponible (artefacto joblib de scikit-learn) |
| Idiomas soportados | no disponible (tarea de audio, no textual) |
| Licencia | no disponible |
| Formato de pesos | joblib (`model.joblib`) |
| Framework | scikit-learn |
| Frecuencia de muestreo | 22.050 Hz, mono |
| Vector de características | 293 dimensiones (Librosa) |
| Capas ocultas | [128, 64] con activación ReLU |
| Clases de salida | 5 (Pop, Rock, Electronic, Classical, Forró) |
| Escalado de características | StandardScaler |
| Solver | Adam |
| Regularización L2 (alpha) | 0,02 |
| Iteraciones máximas | 800 |
| Learning rate inicial | 0,001 |
| Early stopping | sí (fracción de validación 0,1) |
| Batch size | 32 |
| Random state | 42 |

## Arquitectura y entrenamiento

La arquitectura es un perceptrón multicapa implementado con `MLPClassifier` de scikit-learn, con dos capas ocultas de 128 y 64 neuronas respectivamente, activación ReLU y capa de salida de 5 clases. El entrenamiento emplea el solver Adam con una tasa de aprendizaje inicial de 0,001, regularización L2 con alpha 0,02, un máximo de 800 iteraciones, batch size de 32 y early stopping con una fracción de validación del 10 %. El estado aleatorio está fijado a 42 para reproducibilidad. El clasificador entrenado se serializa junto con el `StandardScaler` ajustado en un único fichero `model.joblib`.

La pieza diferencial del pipeline no es la red, sino la ingeniería de características: se extraen 293 descriptores acústicos con Librosa que combinan MFCC y sus derivadas primera y segunda, croma basado en STFT y croma de transformada Q constante, características espectrales (centroide, ancho de banda, rolloff, contraste y planitud), energía RMS y tasa de cruces por cero, espectrograma mel en escala logarítmica, características rítmicas (tempo estimado, fuerza de onsets y claridad de pulso), representación Tonnetz y métricas adicionales como el factor de cresta y la variación de RMS. Para las matrices de características aplicables se calculan media y varianza para producir un vector de longitud fija. No se dispone de información sobre el volumen del dataset de entrenamiento, su composición por clase ni sobre el uso de RLHF, DPO o aumentación de datos.

## Capacidades

- Clasificación de audio musical en cinco géneros predefinidos: Pop, Rock, Electronic, Classical y Forró.
- Salida de probabilidades por clase además de la etiqueta predicha, lo que permite umbrales de confianza personalizados.
- Procesamiento de audio en distintos formatos según los backends de Librosa y SoundFile instalados, con conversión automática a mono y remuestreo a 22.050 Hz.
- Acepta entrada tanto por ruta de fichero como por bytes en memoria, lo que facilita su integración en servicios.
- Interfaz de línea de comandos incluida (`python inference.py sample.wav`) además de la API de Python.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio generativo ni capacidades multilingües textuales.

## Casos de uso

- Organización automática de bibliotecas musicales: el clasificador puede etiquetar pistas de una colección local en las cinco categorías soportadas, aprovechando que solo requiere CPU y un fichero joblib de pocos megabytes para enrutar cada canción a la carpeta correspondiente.
- Prototipado rápido de sistemas de recomendación por género: al devolver probabilidades por clase, permite construir un ranking inicial de similitud temática entre pistas sin necesidad de infraestructura GPU.
- Filtrado previo en pipelines de curación musical: puede actuar como primer paso para descartar o agrupar contenido antes de aplicar modelos más costosos de embeddings de audio, reduciendo el cómputo total del sistema.
- Docencia y experimentación en ingeniería de características de audio: su pipeline explícito con MFCC, croma, Tonnetz y características rítmicas sirve como referencia reproducible para comparar enfoques clásicos frente a modelos end-to-end.
- Enriquecimiento de metadatos en catálogos pequeños: para plataformas con colecciones acotadas de música pop, rock, electrónica, clásica o forró, el modelo puede completar el campo de género cuando falte, con revisión humana posterior.
- Análisis de emisiones radiofónicas o listas de reproducción largas: al exigir un mínimo de 30 segundos y muestrear cinco segmentos de seis segundos, es adecuado para clasificar bloques musicales completos en grabaciones continuas.
- Integración en aplicaciones de escritorio o móviles con recursos limitados: al no depender de GPU ni de frameworks de deep learning pesados, puede ejecutarse en entornos con Python y scikit-learn.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que las métricas agregadas de evaluación (accuracy, precision, recall, F1 y matriz de confusión) no se reportan hasta que se verifiquen los resultados finales sobre el conjunto de test reservado.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en CPU con scikit-learn y no requiere GPU.
- GPU recomendadas: ninguna; no se beneficia de aceleración por GPU en su implementación actual.
- Cabe en cualquier equipo consumer: el artefacto `model.joblib` es de tamano reducido (el repositorio completo ocupa 0,0 GB según Hugging Face) y la inferencia consiste en extracción de características con Librosa más un forward pass de un MLP pequeño.
- El cuello de botella real es la extracción de características con Librosa sobre 30 segundos de audio (carga, remuestreo, segmentación y cálculo de MFCC, croma, espectrograma mel, Tonnetz y onsets), que domina el tiempo de inferencia frente al propio clasificador.
- Opciones de despliegue: script de Python (`inference.py`), API de Python importable, CLI, o envoltorio propio como servicio HTTP; no es compatible con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Enfoque | Clases | Entrada | Framework | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ruan-rodrigues/music-genre-classifier | MLP sobre 293 características de Librosa | 5 | Audio mono 22.050 Hz, mínimo 30 s | scikit-learn | no disponible | Hugging Face + GitHub |
| Modelos tipo CNN sobre espectrogramas mel (p. ej. variantes de Musicnn o similares) | Red convolucional end-to-end | Variable (habitualmente 8-10 géneros GTZAN) | Espectrogramas mel | PyTorch/TensorFlow | variable | Repositorios públicos |
| Modelos de audio fundacionales (p. ej. familia CLAP o AST) | Transformer de audio con embeddings | Etiquetas abiertas vía zero-shot | Audio a 16-48 kHz | PyTorch | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo del modelo evaluado frente a estas alternativas en la información proporcionada. La comparación se limita a enfoque, tamano de la taxonomía y requisitos de infraestructura: el modelo de Rodrigues es el más ligero y el único que no requiere GPU, pero también el de menor cobertura de géneros y sin métricas publicadas.

## Limitaciones y advertencias

- El clasificador está restringido a cinco géneros predefinidos; cualquier pista fuera de Pop, Rock, Electronic, Classical o Forró se forzará a una de esas clases.
- Las canciones que mezclan géneros o se sitúan en fronteras estilísticas pueden clasificarse de forma ambigua o incorrecta.
- La calidad de grabación, las condiciones de captura y el solapamiento entre géneros afectan a las predicciones.
- Requiere un mínimo de 30 segundos de audio; pistas más cortas no pueden procesarse con el pipeline documentado.
- Las probabilidades de salida son estimaciones del modelo y no deben interpretarse como confianza calibrada sin una validación adicional.
- No se han publicado métricas de evaluación sobre el conjunto de test reservado, por lo que no es posible cuantificar su precisión real.
- La licencia no está especificada, lo que impide asumir permisos de uso comercial; cualquier despliegue en producción requiere aclarar este punto con el autor.
- El modelo fue desarrollado como proyecto académico de machine learning y no ha sido validado para categorización musical comercial o profesional.
- No se dispone de información sobre sesgos del dataset de entrenamiento (posible desbalance entre géneros, predominio de fuentes brasileñas por la inclusión de Forró, etc.).
- Al ser un artefacto joblib de scikit-learn, está ligado a versiones compatibles de la librería; cambios de versión pueden romper la carga del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ruan-rodrigues/music-genre-classifier
- Repositorio GitHub del proyecto original: https://github.com/Ruanrodrigues20/music-genre-classifier
