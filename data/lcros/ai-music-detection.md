# lcros/ai-music-detection

## Resumen

El modelo `lcros/ai-music-detection` es un clasificador jerárquico basado en scikit-learn diseñado para distinguir entre música compuesta por humanos y música generada por inteligencia artificial (por ejemplo, Suno o Udio). Fue desarrollado por lcros (lcrosvila en GitHub) como parte del trabajo de investigación "Detecting AI-Generated Music", publicado en Transactions of ISMIR. El modelo no es una red neuronal profunda, sino un conjunto de clasificadores que operan sobre características extraídas con Essentia y embeddings generados por el modelo LAION CLAP. Su relevancia actual radica en la creciente necesidad de identificar contenido musical sintético para la protección de derechos de autor, la moderación de plataformas y la investigación académica. El repositorio de HuggingFace contiene los artefactos preentrenados (scaler y modelos) en un único archivo pickle de 0,3 GB, listos para cargarse con `pickle` y aplicarse a características precalculadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador jerárquico (scikit-learn) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica, es clasificación de audio) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | en (etiqueta del modelo) |
| Licencia | MIT |
| Formato de pesos | pickle (.pkl) |

## Arquitectura y entrenamiento

El modelo es un clasificador jerárquico implementado con scikit-learn, lo que implica una estructura de múltiples etapas donde cada nivel clasifica subconjuntos de datos. No se trata de un transformer ni de un modelo de lenguaje, sino de un pipeline de clasificación tradicional que combina dos tipos de características: descriptores de audio extraídos con Essentia (una biblioteca de análisis de audio) y embeddings generados por el modelo preentrenado LAION CLAP. El entrenamiento se realizó sobre un conjunto de datos descrito en el paper asociado, que incluye 30.000 pistas completas (1.770 horas), de las cuales 10.000 provienen del Million Song Dataset y 20.000 fueron generadas por usuarios de dos plataformas populares de IA musical. No se especifican detalles sobre el proceso de entrenamiento (épocas, optimizador, etc.) en la información disponible. La inferencia requiere calcular previamente las características con Essentia y los embeddings con CLAP, y luego aplicar el scaler y los clasificadores cargados desde el archivo pickle.

## Capacidades

- Clasificación de audio: distingue entre música humana y música generada por IA (Suno, Udio, etc.).
- Requiere preprocesamiento externo: extracción de descriptores con Essentia y generación de embeddings con LAION CLAP antes de usar el clasificador.
- No es un modelo generativo: no produce audio ni texto, solo etiquetas de clasificación.
- No tiene capacidades de visión, lenguaje natural ni tool calling.
- Soporte multilingüe: no aplica, ya que opera sobre características de audio, no sobre texto.
- Capacidad de procesamiento por lotes: al ser scikit-learn, puede procesar múltiples muestras a la vez si se le pasan las características en forma de matriz.

## Casos de uso

- Moderación de contenido en plataformas de streaming: el modelo puede integrarse en pipelines de análisis de audio para marcar automáticamente pistas sospechosas de ser generadas por IA, ayudando a las plataformas a cumplir normativas de transparencia.
- Verificación de derechos de autor: los sellos discográficos y gestores de derechos pueden usar el detector para identificar si una obra registrada es realmente de autoría humana, evitando disputas legales.
- Investigación académica en musicología: los investigadores pueden emplear el clasificador para estudiar las diferencias acústicas entre música humana y sintética, o para construir datasets etiquetados.
- Control de calidad en bibliotecas de música de stock: los proveedores de música libre de derechos pueden filtrar contenido generado por IA para ofrecer solo obras humanas a sus clientes.
- Detección de fraude en concursos musicales: organizadores de certámenes pueden verificar que las obras presentadas no hayan sido creadas con herramientas de IA, usando el modelo como herramienta de apoyo.
- Auditoría de datasets de entrenamiento: empresas que entrenan modelos de IA musical pueden usar el detector para limpiar sus datasets, eliminando pistas generadas por IA que podrían sesgar los resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper asociado ("The AI Music Arms Race: On the Detection of AI-Generated Music") podría contener métricas de evaluación, pero no se incluyen en la model card ni en los resultados de búsqueda proporcionados. No se dispone de comparaciones cuantitativas con otros detectores.

## Requisitos de hardware

- No se especifican requisitos de hardware en la documentación del modelo.
- La inferencia del clasificador en sí es ligera (scikit-learn), por lo que puede ejecutarse en CPU con poca memoria (menos de 1 GB de RAM para el modelo cargado).
- Sin embargo, el preprocesamiento requiere ejecutar Essentia (CPU) y el modelo CLAP (preferiblemente GPU para acelerar la generación de embeddings). CLAP típicamente necesita una GPU con al menos 8 GB de VRAM para un uso eficiente, aunque puede funcionar en CPU con mayor latencia.
- Opciones de despliegue: al ser un archivo pickle, se puede integrar en cualquier entorno Python. No hay soporte nativo para vLLM, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles, pero se estima que la clasificación pura es del orden de milisegundos por muestra, mientras que la extracción de características domina el tiempo total.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se han encontrado referencias a otros detectores de música generada por IA con los que se pueda comparar directamente en términos de arquitectura, rendimiento o licencia.

## Limitaciones y advertencias

- Dependencia de la calidad de las características: el rendimiento del clasificador está limitado por la precisión de los descriptores de Essentia y los embeddings de CLAP. Si el audio de entrada tiene ruido o está mal codificado, la clasificación puede fallar.
- Sesgo potencial del dataset de entrenamiento: el modelo se entrenó con pistas de Suno y Udio, por lo que puede no generalizar bien a otras plataformas de IA musical o a estilos musicales no representados en el dataset.
- Riesgo de alucinación: no aplica, ya que no es un modelo generativo.
- Limitaciones de contexto: no aplica, al ser clasificación de audio.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificación, pero el modelo depende de Essentia y CLAP, que tienen sus propias licencias (GPL para Essentia y MIT para CLAP, aunque se debe verificar).
- Advertencia para producción: el modelo requiere un pipeline de preprocesamiento complejo (Essentia + CLAP) que debe estar correctamente versionado y documentado para garantizar reproducibilidad. Además, al ser un clasificador tradicional, no tiene mecanismos de incertidumbre calibrada, por lo que las predicciones deben interpretarse con cautela.

## Enlaces

- HuggingFace: https://huggingface.co/lcros/ai-music-detection
- Repositorio GitHub oficial: https://github.com/lcrosvila/ai-music-detection
- Paper en Transactions of ISMIR: https://transactions.ismir.net/articles/10.5334/tismir.254
- PDF del paper: https://transactions.ismir.net/articles/254/files/68774364a6605.pdf
- Página del programa ISMIR 2025: https://ismir2025program.ismir.net/poster_410.html
- ResearchGate: https://www.researchgate.net/publication/393035433_The_AI_Music_Arms_Race_On_the_Detection_of_AI-Generated_Music
