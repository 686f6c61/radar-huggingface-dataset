# aerostratospheric/uogw-scientific-suite

# Ficha técnica: UOGW Scientific Suite

## Resumen

UOGW Scientific Suite es un conjunto de modelos de investigación desarrollado por Aerostratospheric, una organización sin ánimo de lucro de Illinois (Estados Unidos). No se trata de un modelo de lenguaje de gran tamaño, sino de un paquete de modelos de scikit-learn con múltiples cabezas de predicción orientadas al análisis meteorológico y atmosférico. El paquete se entrena automáticamente cada día a las 12:00 UTC mediante GitHub Actions sobre el dataset abierto UOGW (Unified Open Global Weather) y el archivo histórico de anomalías de GIR.

El objetivo principal es proporcionar herramientas ligeras y reproducibles para la detección de anomalías, el cálculo de confort térmico, la estimación del índice de calor y el análisis de regímenes superficiales. Según la documentación del autor, los modelos son "réplicas honestas de reglas" más un residuo físico, y están pensados para investigación, educación y prototipos de paneles de control, no como sustitutos de los sistemas oficiales de predicción meteorológica.

El repositorio incluye cinco modelos independientes en formato joblib, junto con un script de inferencia (`inference.py`), un archivo de métricas (`metrics.json`) y un directorio con los snapshots de entrenamiento. El tamaño del repositorio en Hugging Face figura como 0.0 GB, lo que sugiere que los pesos pueden no estar almacenados directamente en el repositorio o que se generan en el momento de la descarga.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | scikit-learn: GradientBoostingClassifier, RandomForestClassifier, GradientBoostingRegressor, Ridge y KMeans, con StandardScaler |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | cc-by-4.0 |
| Formato de pesos | joblib |

## Arquitectura y entrenamiento

El paquete no sigue una arquitectura de red neuronal profunda, sino que combina varios algoritmos clásicos de aprendizaje automático de scikit-learn. Cada cabeza de predicción utiliza un modelo específico: la severidad de anomalías se resuelve con un GradientBoostingClassifier sobre características estadísticas precalculadas; el confort térmico emplea un RandomForestClassifier con pesos de clase; el índice de calor usa un GradientBoostingRegressor entrenado contra la fórmula de NOAA Rothfusz; la predicción de temperatura horaria en Casey, Illinois, es un modelo Ridge autorregresivo de tres retardos; y los regímenes superficiales se obtienen mediante KMeans con k=4.

El proceso de entrenamiento es totalmente automatizado. Un flujo de GitHub Actions descarga los datos de UOGW y GIR, instala scikit-learn, ejecuta `train_hf_models.py` y sube los artefactos al repositorio de Hugging Face. La validación se realiza con un split estratificado del 20-25 % cuando las clases lo permiten. Según la model card, la precisión perfecta en anomalías indica que el modelo ha recuperado la regla determinista del sistema de detección, no que haya descubierto nuevos fenómenos atmosféricos.

## Capacidades

- Clasificación de la severidad de anomalías en cuatro clases: `none`, `info`, `watch` y `alert`, a partir de estadísticos como media, mediana, desviación típica, MAD, z-scores y percentil.
- Clasificación del confort térmico en cinco bandas según el estilo NOAA, usando temperatura, humedad relativa, viento, presión y coordenadas.
- Regresión del índice de calor en grados Celsius, con un error medio absoluto de 0.32 °C frente a la fórmula de referencia de NOAA Rothfusz.
- Predicción de la temperatura de la próxima hora para una estación concreta (Casey, IL) mediante un modelo autorregresivo Ridge.
- Agrupación de regímenes superficiales en cuatro clústeres a partir de temperatura, humedad, viento, presión y precipitación.
- Funciones auxiliares de física en `inference.py`: `heat_index_c()` y `apparent_temp_c()` para el cálculo del índice de calor y la temperatura aparente estilo Steadman.
- No soporta tool calling, function calling, agentes, visión, audio ni generación de texto. Es un paquete exclusivamente tabular.

## Casos de uso

- Monitorización meteorológica en paneles de control: el modelo de severidad de anomalías permite puntuar de forma rápida y portable las anomalías detectadas en ciudades, alimentando dashboards con alertas de tipo `info`, `watch` o `alert` sin depender de un servicio externo.
- Planificación urbana y evaluación de confort térmico: la cabeza de confort térmico clasifica el ambiente en cinco bandas, lo que resulta útil para estudios de isla de calor urbana o para recomendar horarios de actividad al aire libre en función de las condiciones meteorológicas.
- Cálculo de índice de calor en estaciones meteorológicas: la regresión del índice de calor ofrece una estimación precisa (MAE 0.32 °C) a partir de temperatura y humedad, adecuada para integrarse en estaciones de bajo coste o sensores IoT.
- Investigación educativa en ciencia de datos: al ser un paquete scikit-learn con código reproducible, sirve como ejemplo práctico de entrenamiento de modelos tabulares, validación con split estratificado y despliegue mediante joblib en entornos académicos.
- Detección de anomalías en series temporales climáticas: el modelo de anomalías puede aplicarse sobre datos históricos de GIR para identificar eventos extremos en ciudades, combinando estadísticos robustos como MAD y z-scores.
- Prototipos de sistemas de alerta temprana: gracias a su bajo coste computacional y a su reentrenamiento diario, puede integrarse en pipelines de análisis que generen informes automáticos de condiciones atmosféricas anómalas, siempre que se utilice como herramienta de screening y no como producto de aviso oficial.
- Análisis de regímenes climáticos locales: el modelo KMeans agrupa ciudades en cuatro regímenes superficiales, lo que permite comparar patrones meteorológicos entre localidades y detectar cambios estacionales en los clústeres.

## Benchmarks y rendimiento

La model card proporciona métricas de validación para cada cabeza, aunque no se ofrecen comparaciones con otros modelos. Los resultados reportados son los siguientes:

| Cabeza | Métrica | Valor |
|---|---|---|
| Anomaly severity | Holdout accuracy | 1.00 |
| Thermal comfort | Accuracy | 0.983 |
| Thermal comfort | Macro-F1 | 0.954 |
| Heat index | MAE | 0.32 °C |
| Heat index | R² | 0.9997 |
| Casey next-hour T | In-sample MAE | 0.52 °C |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 (no se requiere GPU).
- GPU recomendadas: ninguna. El modelo se ejecuta íntegramente en CPU.
- Compatibilidad con GPU de consumo: no aplica, al ser modelos de scikit-learn.
- Opciones de despliegue: Python con scikit-learn, joblib y huggingface_hub. No está preparado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible, pero al tratarse de modelos tabulares ligeros la inferencia es prácticamente instantánea en cualquier máquina moderna.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre modelos comparables de la misma categoría. El repositorio menciona un modelo hermano, `gir-open-tier-suite`, pero no se ofrecen datos que permitan establecer una comparativa técnica.

## Limitaciones y advertencias

- No es un producto de predicción meteorológica oficial. La model card advierte explícitamente de que no es un pronóstico de NWS, NCEP o ECMWF, ni un producto de aviso oficial.
- El modelo de anomalías ha recuperado reglas deterministas del sistema de detección, por lo que su precisión perfecta no implica que haya descubierto nuevos fenómenos atmosféricos.
- Riesgo de sobreajuste: el conjunto de entrenamiento de anomalías contiene 1,890 city-days, un tamaño limitado.
- Los metadatos indican que el idioma soportado es solo inglés, aunque los datos de entrada son globales.
- La licencia CC BY 4.0 permite el uso comercial con atribución, pero no incluye garantías de ningún tipo.
- No es un modelo de fundación de IA meteorológica ni un sustituto de modelos globales como GFS o ERA5.
- El tamaño del repositorio en Hugging Face es 0.0 GB, lo que puede implicar que los artefactos joblib no estén versionados directamente o que se generen en el momento de la descarga.

## Enlaces

- Hugging Face: https://huggingface.co/aerostratospheric/uogw-scientific-suite
- Dataset UOGW: https://huggingface.co/datasets/aerostratospheric/uogw
- Modelo hermano GIR: https://huggingface.co/aerostratospheric/gir-open-tier-suite
- Repositorio de código fuente: https://github.com/Midwest-Stratospheric/Unified-Open-Global-Weather
- Organización en GitHub: https://github.com/Midwest-Stratospheric
- Sitio web de Aerostratospheric: https://www.midwestsds.com/
- Página de información: https://midwestsds.com/about.html
- Data hub: https://midwestsds.com/msds-data-hub.html
- Defense GIR: https://midwestsds.com/aerostratospheric-defense-gir.html
- Contacto: https://midwestsds.com/contact/
