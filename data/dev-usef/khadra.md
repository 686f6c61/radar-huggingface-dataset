# dev-usef/Khadra

## Resumen

Khadra es una aplicación web de agricultura inteligente desarrollada con Streamlit, creada por el usuario dev-usef. No se trata de un modelo de lenguaje o de un sistema de IA generativa, sino de un panel interactivo que integra dos modelos de machine learning ya entrenados: un clasificador Random Forest para recomendar cultivos y un pipeline de regresión lineal para estimar el rendimiento agrícola. La aplicación permite a los usuarios introducir datos de suelo, clima, nutrientes y fertilizantes, y obtener predicciones de cultivo adecuado o de producción esperada.

El proyecto se presenta como una herramienta de apoyo a la decisión para agricultores, técnicos agrícolas o estudiantes, con una interfaz sencilla y validación de entradas basada en los rangos de los datos de entrenamiento. Incluye una página de métricas que reproduce los resultados de evaluación de los modelos sobre los conjuntos de entrenamiento. Aunque el repositorio contiene datos sintéticos para la predicción de rendimiento, la recomendación de cultivos se basa en un dataset real de características de suelo y clima.

La relevancia de Khadra radica en su enfoque práctico: democratiza el acceso a modelos de ML agrícola mediante una interfaz web sin necesidad de conocimientos técnicos avanzados. Sin embargo, no es un modelo de IA en el sentido convencional (no tiene arquitectura transformer, ni parámetros de red neuronal, ni contexto de ventana), por lo que esta ficha se adapta a su naturaleza real de aplicación de ML.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random Forest Classifier (recomendación de cultivos) y pipeline de regresión lineal (predicción de rendimiento) |
| Parametros totales | no disponible (modelos clásicos, no redes profundas) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (modelos serializados en pickle, sin cuantización) |
| Idiomas soportados | no disponible (interfaz en inglés según el README) |
| Licencia | no disponible |
| Formato de pesos | pickle (.pkl) para los modelos; la aplicación en Python/Streamlit |

## Arquitectura y entrenamiento

La aplicación utiliza dos modelos clásicos de machine learning:

- **Recomendación de cultivos**: un `RandomForestClassifier` entrenado con siete características: nutrientes del suelo (N, P, K), pH, temperatura, humedad y precipitación. El modelo predice una etiqueta de cultivo entre las clases presentes en el dataset `crop_recommendation.csv`.
- **Predicción de rendimiento**: un pipeline que combina preprocesamiento (codificación de la variable de cultivo) y una regresión lineal. Se entrena con datos de cultivo, área, clima, nutrientes, fertilizante y riego, provenientes del dataset sintético `crop_yield.csv`.

No se proporcionan detalles sobre el número de árboles del Random Forest, la proporción de datos de entrenamiento/test, ni el proceso de optimización de hiperparámetros. Tampoco se indica si se aplicaron técnicas como validación cruzada o regularización. El README menciona que las métricas mostradas en la página de modelos se reproducen a partir de los splits de entrenamiento, pero no se especifican los valores exactos.

## Capacidades

- **Recomendación de cultivos**: dado un conjunto de condiciones de suelo y clima, predice el cultivo más adecuado.
- **Predicción de rendimiento**: estima la producción agrícola (en unidades no especificadas) a partir de variables de entrada.
- **Validación de entradas**: la aplicación limita los valores de entrada según los rangos del dataset, evitando entradas fuera de rango.
- **Visualización de métricas**: muestra métricas de evaluación (exactitud, error, etc.) de los modelos entrenados.
- **Interfaz web interactiva**: construida con Streamlit, accesible desde navegador sin necesidad de código.
- **No soporta**: generación de texto, razonamiento, tool calling, agentes, visión, audio ni capacidades multilingües. Es exclusivamente una herramienta de predicción tabular.

## Casos de uso

- **Asesoramiento agrícola básico**: un agricultor introduce los valores de pH, nutrientes y clima de su parcela y obtiene una recomendación de cultivo. La aplicación es adecuada porque el modelo Random Forest maneja bien interacciones no lineales entre características del suelo.
- **Planificación de siembra**: antes de decidir qué sembrar, el usuario puede comparar diferentes escenarios de entrada y ver qué cultivo se recomienda. La interfaz permite iterar rápidamente.
- **Estimación de cosecha para gestión de recursos**: con datos de área, fertilizante y riego, el agricultor obtiene una predicción de rendimiento que le ayuda a planificar almacenamiento, transporte o venta. La regresión lineal ofrece una estimación rápida y explicable.
- **Herramienta educativa en agronomía**: estudiantes pueden explorar cómo cambian las predicciones al modificar variables, entendiendo la sensibilidad del modelo. La página de métricas permite comparar el rendimiento de los modelos.
- **Prototipo para cooperativas agrícolas**: una cooperativa podría desplegar la aplicación en un servidor local para que sus técnicos la usen con datos de sus miembros, sin depender de servicios externos.
- **Validación de datos sintéticos**: dado que el dataset de rendimiento es sintético, la aplicación sirve para demostrar el flujo completo de un proyecto de ML, desde el entrenamiento hasta el despliegue, siendo útil como plantilla para otros proyectos similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El README menciona que la página de modelos muestra métricas de evaluación, pero no se incluyen valores numéricos en la documentación. No es posible comparar con otros modelos porque no se trata de un LLM ni de un modelo de referencia estándar.

## Requisitos de hardware

- **VRAM**: no requiere GPU. Los modelos son de pequeño tamaño (Random Forest y regresión lineal) y se ejecutan en CPU.
- **RAM**: estimada en menos de 1 GB para cargar los modelos y ejecutar la aplicación Streamlit.
- **GPU recomendada**: ninguna. Funciona en cualquier máquina con Python.
- **Compatibilidad con GPU de consumo**: no aplica.
- **Opciones de despliegue**: se ejecuta localmente con `streamlit run app/app.py`. También puede desplegarse en servicios como Hugging Face Spaces, Streamlit Community Cloud o un servidor VPS con Python.
- **Latencia y throughput**: las predicciones son prácticamente instantáneas (milisegundos) al ser modelos clásicos. No se dispone de mediciones oficiales.

## Comparativa con modelos similares

No disponible. Khadra no es un modelo de lenguaje ni un sistema de IA comparable con otros modelos de la misma categoría. Existen otras aplicaciones de recomendación de cultivos basadas en ML (por ejemplo, usando redes neuronales o gradient boosting), pero no se dispone de información suficiente para establecer una comparación rigurosa.

## Limitaciones y advertencias

- **Datos sintéticos**: el dataset de predicción de rendimiento (`crop_yield.csv`) es sintético, por lo que las estimaciones de rendimiento no reflejan necesariamente la realidad agrícola. El README lo advierte explícitamente.
- **Alcance limitado**: la aplicación solo cubre dos tareas específicas (recomendación de cultivo y predicción de rendimiento) y no es un sistema general de IA.
- **Sin garantía de resultados**: las predicciones son estimaciones para apoyo a la decisión; no garantizan resultados agrícolas reales.
- **Idioma**: la interfaz está en inglés, lo que puede ser una barrera para usuarios hispanohablantes.
- **Licencia no especificada**: no se indica la licencia del código ni de los modelos, lo que genera incertidumbre sobre su uso comercial o modificación.
- **Mantenimiento**: el repositorio no muestra actividad reciente (creado en agosto de 2026, sin actualizaciones posteriores), por lo que puede no recibir soporte.
- **Riesgo de sobreajuste**: al ser un Random Forest sin detalles de validación, podría haber sobreajuste a los datos de entrenamiento, especialmente en el dataset sintético.

## Enlaces

- [Hugging Face - dev-usef/Khadra](https://huggingface.co/dev-usef/Khadra)
- [GitHub - Yalla-Khadra-AI-Model-API (relacionado)](https://github.com/ahmedsamy56/Yalla-Khadra-AI-Model-API)
- [Hugging Face Space - Yalla-Khadra-AI-Model-API](https://huggingface.co/spaces/Ahmedsamy56/Yalla-Khadra-AI-Model-API)
