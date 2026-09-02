# Hayasuki/chucklenet

## Resumen

ChuckleNet es un detector binario de risa a nivel de fragmento (chunk) desarrollado por Subhajit Das (alias Hayasuki) para clasificar segmentos de audio de 5 segundos extraídos de contenido de vídeo cómico. El modelo combina representaciones de audio WavLM-base de 768 dimensiones con 23 características prosódicas (F0, energía, ZCR, características espectrales) para formar un vector de entrada de 791 dimensiones que se procesa a través de un clasificador totalmente conectado.

El modelo se entrenó con pérdida BCE ponderada por clase sobre el subconjunto StandUp4AI EMNLP, compuesto por 221 vídeos de comedia, logrando una F1 media de 0,879 en validación cruzada con GroupKFold agrupado por ID de vídeo. Su propósito principal es detectar eventos de risa en monólogos de comedia, indexar archivos de vídeo cómico y analizar la densidad de risa en corpus de vídeo.

La relevancia actual de ChuckleNet reside en su enfoque especializado: mientras que los modelos de audio generales pueden transcribir o clasificar sonidos, este modelo está específicamente calibrado para un dominio concreto (comedia en inglés) y ofrece una solución ligera y eficiente para una tarea muy específica, con una arquitectura simple de perceptrón multicapa que requiere recursos computacionales mínimos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP totalmente conectado con 4 capas (791→512→256→64→1) con BatchNorm, ReLU y Dropout |
| Parametros totales | no disponible (arquitectura ligera, estimacion < 1M) |
| Parametros activos | no disponible |
| Longitud de contexto | 5 segundos de audio por fragmento (no aplica contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (solo comedia en ingles validada) |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente PyTorch .bin o safetensors) |

## Arquitectura y entrenamiento

ChuckleNet utiliza una arquitectura de perceptrón multicapa (MLP) que procesa un vector de entrada de 791 dimensiones resultante de la concatenación de dos conjuntos de características extraídas de cada fragmento de 5 segundos: un embedding WavLM-base de 768 dimensiones (características a nivel de frame promediadas en todo el fragmento) y 23 características prosódicas que incluyen F0, RMS, ZCR, centroide espectral y ancho de banda espectral. La red consta de cuatro capas lineales con normalización por lotes, activación ReLU y dropout de 0,3 entre capas, culminando en un logit de salida único para clasificación binaria.

El entrenamiento utilizó la función de pérdida BCEWithLogitsLoss con pos_weight=2,33 para compensar el desequilibrio de clases (aproximadamente 30% positivos, 70% negativos), optimizador Adam con tasa de aprendizaje de 1e-3 y criterio de parada temprana. La validación se realizó mediante validación cruzada de 5 pliegues con GroupKFold agrupado por ID de vídeo, lo que garantiza que fragmentos del mismo vídeo no aparezcan simultáneamente en entrenamiento y validación. No se menciona el uso de técnicas como RLHF o DPO, ya que se trata de un modelo de clasificación supervisada estándar.

## Capacidades

- Detección de risa en fragmentos de audio de 5 segundos de vídeos de comedia stand-up
- Clasificación binaria por fragmento: presencia o ausencia de risa
- Análisis de densidad de risa en corpus de vídeo (proporción de fragmentos con risa)
- Indexación de archivos de vídeo cómico para localizar segmentos con alta concentración de risa
- Generación de reels de momentos destacados a partir de segmentos con mayor respuesta de risa
- Fusión de características acústicas profundas (WavLM) con características prosódicas clásicas (F0, energía, ZCR)
- No soporta tool calling, agentes, ni capacidades multimodales más allá del audio
- Precisión temporal limitada a ±2,5 segundos (nivel de fragmento, no de palabra)

## Casos de uso

- Indexación de archivos de comedia: ChuckleNet puede procesar vídeos de monólogos completos dividiéndolos en fragmentos de 5 segundos y marcando aquellos con risa, permitiendo crear índices navegables de momentos destacados sin revisión manual.
- Generación automática de highlights: plataformas de vídeo pueden usar el modelo para extraer automáticamente los segmentos con mayor densidad de risa y compilarlos en reels promocionales o resúmenes de programas cómicos.
- Análisis de audiencia en investigación: investigadores de análisis de discurso o estudios de comedia pueden cuantificar la respuesta de la audiencia a lo largo de un vídeo, correlacionando la risa con momentos narrativos o chistes específicos.
- Curaduría de contenido para plataformas de streaming: servicios de vídeo pueden priorizar en sus recomendaciones los fragmentos con mayor puntuación de risa para mejorar la retención de usuarios.
- Evaluación de guiones o actuaciones: productores de comedia pueden comparar la respuesta de risa entre diferentes tomas o versiones de una actuación para seleccionar la más efectiva.
- Moderación de contenido en redes sociales: plataformas que distribuyen clips cómicos pueden filtrar o etiquetar automáticamente contenido que contenga risa de audiencia para categorización o monetización.

## Benchmarks y rendimiento

Validación cruzada de 5 pliegues con GroupKFold agrupado por ID de vídeo sobre el subconjunto StandUp4AI EMNLP (221 vídeos):

| Fold | Precision | Recall | F1 |
|------|-----------|--------|-----|
| 1 | 0,861 | 0,897 | 0,878 |
| 2 | 0,882 | 0,874 | 0,877 |
| 3 | 0,847 | 0,931 | 0,887 |
| 4 | 0,903 | 0,835 | 0,867 |
| 5 | 0,899 | 0,868 | 0,883 |
| **Media** | **0,878** | **0,881** | **0,879** |
| **Desviacion** | — | — | **0,022** |

No se han publicado resultados comparativos con otros detectores de risa en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: dado el tamaño reducido del modelo (4 capas lineales con entrada de 791 dimensiones), la inferencia es viable en CPU sin GPU, con latencia de milisegundos por fragmento.
- VRAM estimada: inferior a 1 GB incluso en FP32, ya que el modelo tiene menos de 1 millón de parámetros (estimación basada en la arquitectura descrita).
- GPU recomendada: cualquier GPU moderna (incluso integradas) es suficiente; no se requiere hardware especializado.
- Compatible con hardware de consumo: sí, cualquier ordenador portátil o de sobremesa puede ejecutar el modelo sin problemas.
- Opciones de despliegue: al ser un modelo de PyTorch estándar, puede servirse con FastAPI, TorchServe o integrarse en pipelines de procesamiento de audio existentes. No es compatible con vLLM, llama.cpp u Ollama al no ser un LLM.
- Preprocesamiento: el cuello de botella principal es la extracción de embeddings WavLM, que requiere ejecutar WavLM-base sobre cada fragmento de audio.

## Comparativa con modelos similares

No se dispone de información sobre detectores de risa alternativos comparables en la información proporcionada. El campo de detección de risa es nicho y existen pocos modelos públicos especializados. Modelos de audio generales como Wav2Vec2 o HuBERT podrían fine-tunearse para esta tarea, pero no hay datos comparativos disponibles en la documentación de ChuckleNet.

| Modelo | Enfoque | F1 | Dominio |
|--------|---------|-----|---------|
| ChuckleNet | MLP sobre WavLM + prosodia | 0,879 | Comedia stand-up en ingles |
| Modelos generales de audio fine-tuned | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Precisión a nivel de fragmento: la localización temporal se limita a ±2,5 segundos; no es posible identificar el momento exacto de la risa dentro del fragmento.
- Sesgo de dominio: el modelo solo se ha validado con comedia stand-up en inglés; otros géneros, idiomas o formatos con perfiles acústicos diferentes pueden producir resultados poco fiables.
- Falsos positivos: puede activarse con toses, suspiros o murmullos de la audiencia que acústicamente se asemejen a la risa.
- Falsos negativos: risas breves (menos de 1 segundo) o de baja intensidad pueden no detectarse.
- Sin validación en streaming: el modelo está validado para fragmentos fijos de 5 segundos; su uso en tiempo real o con ventanas deslizantes no está comprobado.
- Licencia no especificada: no se indica la licencia del modelo, lo que genera incertidumbre sobre restricciones de uso comercial.
- Dependencia de WavLM: el modelo requiere ejecutar WavLM-base para extraer embeddings, lo que añade complejidad computacional al pipeline de inferencia.
- Información incompleta: no se especifican el número exacto de parámetros, el formato de pesos ni la licencia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Hayasuki/chucklenet
- Colección de vídeo del autor: https://huggingface.co/collections/Hayasuki/video
- Perfil del autor: https://huggingface.co/Hayasuki
