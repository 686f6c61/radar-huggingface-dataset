# ranjeet447/indian-flight-price-advisor

## Resumen

El modelo `ranjeet447/indian-flight-price-advisor` es un regresor basado en LightGBM (Gradient Boosted Decision Trees) desarrollado por Ranjeet Kumar para predecir el precio justo de billetes de vuelos domésticos en India y ofrecer una recomendación de compra o espera. Está entrenado con 300.153 registros de vuelos que cubren las principales rutas metropolitanas (DEL, BOM, BLR, CCU, HYD, MAA) y produce estimaciones en rupias indias (INR). El modelo se distribuye como un artefacto serializado en formato joblib junto con un fichero de características de Feast en Parquet, lo que facilita su integración en pipelines de MLOps.

Su relevancia radica en abordar un problema práctico de optimización de gasto en viajes: ayudar a viajeros y agencias a decidir el momento óptimo de compra. Aunque no es un modelo de lenguaje ni de generación de texto, es un ejemplo de aplicación de machine learning clásico a un dominio específico con métricas de rendimiento cuantificadas (R² de 0,9827 y MAPE del 12,89%). El repositorio en Hugging Face está publicado con licencia MIT, lo que permite uso comercial sin restricciones, aunque el tamaño del repositorio figura como 0,0 GB y no se especifican detalles adicionales de implementación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LightGBM Regressor (Gradient Boosted Decision Trees) |
| Parametros totales | no disponible (modelo de árboles, sin parámetros neuronales) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular) |
| Tipos de cuantizacion | no aplica (modelo de árboles, no requiere cuantización) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | joblib (model.joblib) y Parquet (route_features.parquet) |

## Arquitectura y entrenamiento

El modelo emplea LightGBM, una implementación eficiente de gradient boosting sobre árboles de decisión. No se trata de una red neuronal ni de un transformer, sino de un ensemble de árboles que aprende relaciones no lineales entre características tabulares (ruta, hora del día, clase, escalas, etc.) y el precio del billete. El entrenamiento se realizó sobre 300.153 registros de vuelos domésticos indios, cubriendo las rutas principales entre las ciudades de Delhi, Bombay, Bangalore, Calcuta, Hyderabad y Madras. No se menciona el uso de técnicas de RLHF, DPO ni ajuste fino por refuerzo; es un entrenamiento supervisado de regresión estándar.

La innovación técnica destacable es la integración con Feast para la gestión de características (route_features.parquet), lo que permite servir las features de forma reproducible en entornos de producción. El modelo se distribuye como un artefacto serializado con joblib, listo para cargarse con la librería homónima de Python. No se proporcionan detalles sobre el preprocesado de datos, la selección de características ni la partición train/test.

## Capacidades

- Predicción de precios de billetes de avión domésticos en India, expresados en rupias (INR).
- Generación de una recomendación de compra o espera basada en la comparación entre el precio predicho y el precio actual (función implícita en el nombre del modelo, aunque no se documenta explícitamente el algoritmo de decisión).
- Manejo de datos tabulares con múltiples variables categóricas y numéricas (ruta, hora, clase, escalas).
- Integración con Feast para servir características en tiempo real o por lotes.
- Capacidad de carga y uso mediante la API de Hugging Face Hub (`hf_hub_download`).
- No soporta generación de texto, tool calling, agentes, visión ni audio; es exclusivamente un modelo de regresión tabular.

## Casos de uso

- Asesoramiento a viajeros individuales: un usuario introduce su ruta y fecha, el modelo predice el precio justo y sugiere si comprar ahora o esperar, ayudando a ahorrar en billetes domésticos.
- Integración en agencias de viajes online (OTA): el modelo puede incrustarse en el backend de una plataforma de reservas para mostrar alertas de "precio bueno" o "precio alto" en tiempo real, mejorando la experiencia de usuario.
- Análisis de tendencias de precios para departamentos de revenue management de aerolíneas: permite estimar el precio de mercado para rutas concretas y ajustar estrategias de tarificación.
- Automatización de informes de mercado: un script periódico descarga el modelo y las features, predice precios para un conjunto de rutas y genera un informe comparativo para analistas.
- Optimización de gasto en viajes corporativos: empresas con empleados que vuelan frecuentemente pueden usar el modelo para decidir cuándo reservar, reduciendo costes operativos.
- Educación y demostración de MLOps: sirve como ejemplo práctico de despliegue de un modelo de regresión con Feast y Hugging Face Hub, útil para cursos de machine learning aplicado.

## Benchmarks y rendimiento

El autor reporta las siguientes métricas de rendimiento en el conjunto de evaluación (no se especifica si es test o validación):

| Metrica | Valor |
|---|---|
| R² (coeficiente de determinación) | 0,9827 |
| MAPE (error porcentual absoluto medio) | 12,89 % |
| MAE (error absoluto medio) | ₹2.717,21 |
| RMSE (raíz del error cuadrático medio) | ₹4.933,84 |

No se han publicado resultados comparativos con otros modelos en la información disponible. Tampoco se detalla el tamaño del conjunto de test ni la metodología de validación.

## Requisitos de hardware

- Al ser un modelo de árboles (LightGBM), no requiere GPU; la inferencia se ejecuta eficientemente en CPU.
- El tamaño del modelo es muy reducido (el repositorio figura con 0,0 GB, aunque los ficheros reales no se han descargado; un modelo LightGBM típico ocupa pocos megabytes).
- Memoria RAM estimada: inferior a 1 GB para cargar el modelo y las features.
- No aplica VRAM ni GPUs específicas.
- Opciones de despliegue: puede servirse mediante un contenedor Docker con una API REST (por ejemplo, FastAPI), o integrarse en un pipeline de batch con Python. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia: en CPU, la predicción con LightGBM es del orden de microsegundos por muestra, permitiendo alto throughput en producción.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el mismo repositorio o en la documentación. Existen proyectos similares en GitHub (por ejemplo, `clayniranjan-web/flight_price_prediction` y `Nit-Preet/Flight-Price-Prediction`) que abordan la misma tarea con algoritmos como Decision Tree y Random Forest, pero no se han publicado comparativas formales con este modelo. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo se entrenó únicamente con rutas principales de India; su precisión puede degradarse en rutas secundarias o internacionales.
- Los datos de entrenamiento no están fechados en la documentación; es probable que los precios hayan cambiado desde entonces, por lo que las predicciones pueden quedar obsoletas.
- No se documenta el preprocesado de características ni la política de actualización del modelo, lo que dificulta su mantenimiento en producción.
- El MAPE del 12,89 % implica un error medio del 12,89 % sobre el precio real, que puede ser significativo en billetes de bajo coste.
- No se especifican sesgos potenciales (por ejemplo, estacionalidad, días festivos, eventos especiales) que podrían afectar a la precisión.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad; se recomienda una evaluación independiente antes de usarlo en entornos críticos.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre la exactitud de las predicciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ranjeet447/indian-flight-price-advisor
- Perfil del autor: https://huggingface.co/ranjeet447
- Proyecto relacionado (GitHub): https://github.com/clayniranjan-web/flight_price_prediction
- Proyecto relacionado (GitHub): https://github.com/Nit-Preet/Flight-Price-Prediction
