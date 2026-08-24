# JullMol/POSEIDON

## Resumen

POSEIDON es un sistema de machine learning desarrollado por un equipo de estudiantes de la Universidad Negeri Surabaya (Indonesia) para la detección y priorización de actividades de pesca ilegal, no declarada y no reglamentada (IUU) en la región de Natuna, concretamente en la zona WPP-711 (Laut Natuna Utara). El modelo utiliza técnicas de Positive-Unlabeled Learning (PU learning) sobre datos tabulares derivados de imágenes de radar satelital Sentinel-1 SAR, combinando algoritmos de boosting como LightGBM y XGBoost para clasificar y puntuar la probabilidad de actividad pesquera ilegal.

El sistema se estructura en varias fases: una fase de preparación de datos y regresión de longitud de embarcación (Phase_0), una fase de modelado con pesos de LightGBM y XGBoost (Phase_4), y un pipeline autónomo más reciente (POSEIDON_Model) que integra modelos unificados para Google Earth Engine (GEE) y Global Fishing Watch (GFW), junto con un modelo de Isolation Forest para detección de anomalías. A diferencia de los modelos de lenguaje, POSEIDON es un clasificador tabular ligero, sin arquitectura de red neuronal profunda, y está diseñado para ejecutarse en entornos de análisis espacial y vigilancia marítima.

La relevancia actual del modelo radica en su aplicación práctica para la protección de la soberanía marítima y la sostenibilidad de los recursos pesqueros, un problema crítico en el sudeste asiático. Su licencia MIT permite uso comercial y modificación, lo que facilita su adopción por agencias gubernamentales y organizaciones de conservación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LightGBM (boosting de árboles) y XGBoost (boosting de árboles) para clasificación; regresión lineal/boosting para longitud; Isolation Forest para detección de anomalías |
| Parametros totales | no disponible (modelos basados en árboles, sin parámetros neuronales) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular, no procesa texto secuencial) |
| Tipos de cuantizacion | no aplica (modelos de árboles, no requieren cuantización) |
| Idiomas soportados | no disponible (el modelo opera sobre datos numéricos tabulares, no sobre texto) |
| Licencia | MIT |
| Formato de pesos | .pkl (Python pickle), .txt (LightGBM), .json (XGBoost), .parquet (datos) |

## Arquitectura y entrenamiento

POSEIDON no es un modelo de lenguaje ni una red neuronal profunda, sino un pipeline de aprendizaje automático clásico basado en árboles de decisión potenciados. La arquitectura principal combina LightGBM y XGBoost, dos implementaciones de gradient boosting ampliamente utilizadas para datos tabulares. El enfoque de entrenamiento emplea Positive-Unlabeled Learning, una técnica que permite entrenar clasificadores binarios cuando solo se dispone de un conjunto de ejemplos positivos etiquetados (embarcaciones confirmadas como pesca ilegal) y un conjunto grande de datos no etiquetados (que pueden contener tanto positivos como negativos). Este enfoque es adecuado para el dominio, donde las etiquetas positivas son escasas y costosas de obtener.

El pipeline se divide en fases. En la Phase_0 se realiza la preparación de datos y se entrena un modelo de regresión de longitud de embarcación (poseidon_length_model.pkl), probablemente para estimar la eslora a partir de características del radar SAR. En la Phase_4 se generan los pesos de los modelos LightGBM y XGBoost (lgb_model_0.txt y xgb_model_0.json) sobre un dataset etiquetado en formato Parquet (sar_labeled.parquet). La versión más reciente, POSEIDON_Model, integra modelos unificados para GEE y GFW, además de un Isolation Forest para detectar anomalías espaciales. No se especifica el número de tokens ni la composición exacta del dataset de entrenamiento, más allá de indicar que es un dataset personalizado (custom) con datos de radar Sentinel-1.

## Capacidades

- Clasificación tabular binaria para detectar actividad de pesca ilegal (IUU) a partir de características derivadas de imágenes SAR.
- Priorización de objetivos de patrullaje: asigna una puntuación de pesca (fishing score) que permite ordenar embarcaciones o zonas por probabilidad de actividad ilegal.
- Regresión de longitud de embarcación, útil para estimar el tamaño de los barcos detectados.
- Detección de anomalías mediante Isolation Forest, para identificar patrones espaciales inusuales que puedan indicar comportamientos de pesca no declarada.
- Integración con Google Earth Engine (GEE) y Global Fishing Watch (GFW), lo que permite combinar datos satelitales y de seguimiento de buques.
- Análisis espacial en la región de Natuna (WPP-711), con capacidad de procesar datos geoespaciales tabulares.
- No soporta generación de texto, razonamiento lingüístico, tool calling ni capacidades multimodales, al ser un modelo puramente tabular.

## Casos de uso

- Vigilancia marítima en tiempo real: el modelo puede procesar datos de radar Sentinel-1 para identificar embarcaciones sospechosas y priorizar las rutas de patrullaje de la autoridad marítima indonesia, reduciendo costes operativos al centrar los recursos en las zonas de mayor riesgo.
- Control pesquero en aguas jurisdiccionales: las agencias de pesca pueden usar la puntuación de pesca (fishing score) para decidir qué barcos inspeccionar, mejorando la eficiencia de las inspecciones en puerto o en alta mar.
- Análisis de cumplimiento de cuotas: combinando los datos de longitud estimada y la clasificación de actividad, se puede cruzar con registros de capturas declaradas para detectar discrepancias y posibles infracciones.
- Conservación de ecosistemas marinos: organizaciones ambientales pueden emplear el modelo para monitorizar la presión pesquera en áreas protegidas o hábitats sensibles, como los arrecifes de las islas Natuna.
- Investigación académica en pesca ilegal: el pipeline sirve como base para estudios sobre patrones espaciales y temporales de pesca no declarada, gracias a su integración con GEE y GFW.
- Despliegue en sistemas de alerta temprana: al ser modelos ligeros (LightGBM/XGBoost), pueden ejecutarse en servidores modestos o incluso en dispositivos embebidos para generar alertas automáticas cuando se detectan concentraciones anómalas de actividad pesquera.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas como precisión, recall, F1, AUC ni comparaciones con otros modelos en la model card ni en los resultados de búsqueda web.

## Requisitos de hardware

- Al ser modelos de boosting sobre árboles, no requieren GPU. Pueden ejecutarse en CPU con recursos modestos.
- Memoria RAM estimada: inferior a 1 GB para los modelos individuales (los archivos .pkl y .txt son pequeños, el repositorio total ocupa 0.2 GB).
- Almacenamiento: el repositorio completo ocupa aproximadamente 0.2 GB, incluyendo datos y pesos.
- GPU recomendada: ninguna, aunque si se procesan grandes volúmenes de datos SAR, se puede usar una GPU para el preprocesamiento de imágenes, pero no para la inferencia del modelo.
- Opciones de despliegue: Python con librerías estándar (pickle, lightgbm, xgboost). No se mencionan integraciones con vLLM, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles, pero se espera una inferencia muy rápida (del orden de milisegundos por muestra) en CPU moderna.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (detección de pesca ilegal con PU learning sobre datos SAR). No se puede establecer una comparativa con alternativas como modelos de deep learning sobre imágenes o sistemas comerciales de vigilancia marítima, ya que no se han encontrado datos públicos. Se indica "no disponible".

## Limitaciones y advertencias

- El modelo está entrenado específicamente para la región de Natuna (WPP-711) y puede no generalizar a otras zonas geográficas con diferentes condiciones oceanográficas o de tráfico marítimo.
- Al emplear PU learning, la calidad de las etiquetas positivas es crítica; si las etiquetas son incompletas o erróneas, el rendimiento puede degradarse.
- No se han publicado métricas de rendimiento, por lo que se desconoce su precisión real en entornos operativos.
- El modelo depende de datos de radar SAR de Sentinel-1; la disponibilidad y calidad de estas imágenes puede variar, afectando a la fiabilidad de las predicciones.
- No se especifican sesgos conocidos, pero al ser un modelo entrenado con datos de una región concreta, puede tener sesgos geográficos y de tipo de embarcación.
- La licencia MIT permite uso comercial, pero el modelo no incluye garantías de precisión ni soporte oficial.
- No es un modelo de lenguaje: no puede interpretar texto, responder preguntas ni generar informes; su salida es numérica (puntuaciones y clasificaciones).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/JullMol/POSEIDON
- No se han encontrado papers, blogs o repositorios adicionales específicos de POSEIDON en los resultados de búsqueda web. Los resultados relacionados con "Poseidon" corresponden a otros proyectos no relacionados (Poseidon AI CLI, robot móvil de SLAMTEC, organización psdn.ai).
