# 9mark9/exoscout-tess-planet-scorer

## Resumen

exoscout-tess-planet-scorer es un modelo de clasificación tabular publicado por el usuario 9mark9 en Hugging Face, diseñado para puntuar señales candidatas a planeta detectadas por la misión TESS de la NASA. No es un modelo de lenguaje ni una red neuronal generativa: es un ensamblado de diez miembros (cinco redes convolucionales pequeñas y cinco modelos de árboles con boosting de gradiente) que recibe la curva de brillo plegada de una señal y devuelve una probabilidad de planeta junto con una medida de desacuerdo entre los diez componentes. Resuelve un problema operativo concreto de la astrofísica de exoplanetas: priorizar el seguimiento de miles de candidatos no confirmados.

El modelo se entrenó sobre 2.477 señales ya resueltas (1.375 planetas y 1.102 falsos positivos) procedentes de 2.336 estrellas, con validación cruzada de cinco pliegues y tres semillas, manteniendo todas las señales de una misma estrella en el mismo lado de cada partición. Alcanza un AUC de 0,9310 en validación cruzada y un AUC de 0,929 sobre una partición de prueba de 619 señales retenida en una auditoría de octubre de 2026.

Su relevancia radica en que es un modelo pequeño, reproducible y de licencia MIT, con pesos en formatos seguros (`safetensors` y `skops`), pensado explícitamente para ordenar candidatos y no para confirmar planetas. La model card documenta con transparencia sus puntos débiles, incluido el hecho de que la red convolucional por sí sola no supera a la línea base de árboles sobre trece características resumidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensamblado de 5 redes convolucionales pequeñas (series temporales) y 5 modelos de árboles con boosting de gradiente (datos tabulares) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de 3 curvas plegadas (201 + 61 + 61 bins) más 13 características resumidas |
| Tipos de cuantizacion | no disponible (pesos en safetensors y skops; no se documentan cuantizaciones) |
| Idiomas soportados | no aplica (modelo de clasificación tabular, sin capacidades lingüísticas) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (redes) y `skops` (árboles) |

## Arquitectura y entrenamiento

El modelo es un ensamblado por promedio simple, sin pesos ajustados, de diez miembros: cinco redes convolucionales que procesan tres representaciones de la curva de brillo plegada (órbita completa con 201 bins, acercamiento al tránsito con 61 bins y acercamiento a la cara opuesta de la órbita con 61 bins) y cinco modelos de árboles con boosting de gradiente que operan sobre trece características resumidas (profundidad, duración, diferencia entre tránsitos pares e impares, presencia de un segundo tránsito en la cara opuesta de la órbita, entre otras). La salida es la probabilidad media de planeta y la desviación estándar de los diez votos como medida de incertidumbre.

El entrenamiento utilizó 2.477 señales resueltas de 2.336 estrellas. La validación es de cinco pliegues repetida con tres semillas, agrupando todas las señales de una misma estrella en el mismo lado de cada partición para evitar fuga de información. La model card no documenta uso de RLHF, DPO ni técnicas de alineación, por tratarse de un clasificador supervisado. La innovación destacable es metodológica: el ensamblado no mejora porque la red convolucional sea superior, sino porque sus errores son distintos de los de los árboles, y el promedio sin ponderar aporta 0,018 de AUC sobre la línea base.

## Capacidades

- Clasificación binaria de señales TESS en planeta o falso positivo, con probabilidad entre 0 y 1.
- Estimación de incertidumbre mediante la desviación estándar de los diez miembros del ensamblado.
- Procesamiento de series temporales astronómicas plegadas en tres vistas complementarias de la curva de brillo.
- Extracción implícita de características relevantes para la detección de tránsitos (profundidad, duración, asimetrías par/impar, tránsitos secundarios).
- Ordenación y priorización de candidatos no confirmados para seguimiento observacional.
- Carga segura de pesos: el cargador rechaza tipos no incluidos en una lista blanca y ni `safetensors` ni `skops` ejecutan código al cargar.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües, por su naturaleza de clasificador tabular.

## Casos de uso

- Priorización de seguimiento telescópico: el modelo ordena los 3.871 candidatos abiertos publicados en Kaggle por probabilidad de planeta, permitiendo asignar tiempo de telescopio a los candidatos con mayor puntuación y menor desacuerdo entre miembros.
- Triaje en pipelines de la misión TESS: integrado como paso de filtrado tras la detección de tránsitos, reduce el volumen de señales que requieren inspección manual o análisis espectroscópico posterior.
- Selección de candidatos para observación espectroscópica: las señales con probabilidad alta y desacuerdo bajo entre los diez miembros son las más adecuadas para solicitar tiempo en espectrógrafos como HARPS o ESPRESSO.
- Identificación de falsos positivos por eclipses estelares: la línea base de árboles sobre trece características resumidas detecta patrones como diferencias entre tránsitos pares e impares o tránsitos secundarios, típicos de sistemas binarios eclipsantes.
- Control de calidad y auditoría de catálogos: la medida de desacuerdo permite marcar señales ambiguas (723 de los 3.871 candidatos superan 0,2 de desacuerdo) para revisión experta en lugar de descartarlas automáticamente.
- Investigación reproducible en astroinformática: al ser un ensamblado pequeño con pesos abiertos y código incluido en el repositorio, sirve como referencia para comparar metodologías de clasificación de curvas de luz frente a modelos mayores como Astronet-Triage o ExoMiner.
- Docencia y divulgación: el modelo ilustra el flujo completo de un problema de clasificación científica real, desde la construcción del conjunto de datos hasta la validación agrupada por estrella y el análisis de incertidumbre.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card y en el model-index (no verificados de forma independiente):

| Modelo | AUC | Average precision | Accuracy |
|---|---|---|---|
| Línea base: árboles con boosting sobre 13 características | 0,9125 ± 0,0024 | 0,922 | 83,7% |
| Red convolucional sobre curvas plegadas | 0,9064 ± 0,0028 | 0,918 | 83,4% |
| **Ensamblado (promedio de ambos)** | **0,9310 ± 0,0004** | **0,941** | **85,5%** |

En la partición de prueba de 619 señales retenida en la auditoría de octubre de 2026, la misma receta alcanza un AUC de 0,929 (intervalo del 95%: 0,907 a 0,947). La model card advierte que el ± 0,0004 de la tabla es la dispersión entre tres semillas, no la incertidumbre asociada a disponer solo de 2.477 señales; el remuestreo por estrellas sitúa el intervalo del 95% en aproximadamente ± 0,009.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño del repositorio (0,0 GB) y la naturaleza de los modelos (redes convolucionales pequeñas y árboles con boosting), la inferencia cabe holgadamente en CPU.
- GPU recomendadas: no se requieren GPU; cualquier CPU moderna es suficiente. Una GPU consumer (por ejemplo, RTX 3060 o superior) aceleraría el procesamiento por lotes de las 3.871 curvas, pero no es necesaria.
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: ejecución directa con Python 3.12, torch 2.14.1, scikit-learn 1.9.1, skops 0.16.0, safetensors 0.8.0 y numpy 2.5.4, tal como documenta el autor. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Enfoque | Entradas | Licencia | Disponibilidad |
|---|---|---|---|---|
| exoscout-tess-planet-scorer | Ensamblado de 5 CNN + 5 GBT | 3 curvas plegadas + 13 características | MIT | Pesos y código en Hugging Face |
| Astronet-Triage | Red neuronal sobre curvas de luz TESS | Curvas de luz y datos auxiliares | no disponible en la información | No disponible en la información |
| ExoMiner | Red neuronal profunda con múltiples entradas | Curvas de luz, imágenes de centroides y datos estelares | no disponible en la información | No disponible en la información |

La model card señala explícitamente que Astronet-Triage y ExoMiner emplean más entradas que exoscout, que se limita a curvas de luz. No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No confirma planetas: la confirmación requiere seguimiento adicional con espectroscopía, imagen de alta resolución y comprobaciones de estrellas cercanas.
- Sesgo de selección: las señales resueltas sobre las que se entrenó son las más fáciles de confirmar o refutar, mientras que los candidatos abiertos son en conjunto más difíciles, por lo que las métricas de validación cruzada probablemente sean optimistas para ellos.
- Incertidumbre en señales ambiguas: en 723 de los 3.871 candidatos el desacuerdo entre los diez miembros supera 0,2, y en esos casos la puntuación debe interpretarse como "poco seguro".
- Entradas limitadas: solo utiliza curvas de luz, a diferencia de modelos mayores que incorporan imágenes de centroides y datos estelares, lo que puede reducir su capacidad discriminativa en escenarios complejos.
- Dependencia estricta de versiones: los archivos de árboles solo cargan con versiones compatibles de scikit-learn y skops; con scikit-learn 1.7.2 y skops 0.14.0 la carga falla con el error "holds types that are not allowed".
- Tamaño del conjunto de entrenamiento reducido (2.477 señales), con un intervalo de confianza del 95% de aproximadamente ± 0,009 en el AUC.
- Riesgo de alucinación: no aplica en el sentido habitual, pero el modelo puede producir probabilidades mal calibradas en señales fuera de la distribución de entrenamiento.
- Licencia MIT: permite uso comercial y modificación con atribución, sin restricciones adicionales documentadas.
- Sin soporte multilingüe ni de texto: no es adecuado para tareas de procesamiento de lenguaje natural.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/9mark9/exoscout-tess-planet-scorer
- Candidatos abiertos con curvas de luz (Kaggle): https://www.kaggle.com/datasets/shaikizaaz/tess-candidates-with-light-curves
- Planetas confirmados frente a falsos positivos (Kaggle): https://www.kaggle.com/datasets/shaikizaaz/tess-planets-vs-false-positives
- Ranking de candidatos producido por el modelo (Kaggle): https://www.kaggle.com/datasets/shaikizaaz/tess-planet-candidate-ranking
