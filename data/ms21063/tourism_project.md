# Ms21063/Tourism_Project

# Ficha técnica: Ms21063/Tourism_Project

## Resumen

El modelo **Ms21063/Tourism_Project** es un proyecto MLOps de extremo a extremo para la predicción de compras en turismo de bienestar ("Visit with Us — Wellness Tourism Purchase Prediction"). Lo desarrolla Ms21063 (Mahesh Yadav) y se publica en Hugging Face. A diferencia de los modelos de lenguaje, el núcleo del proyecto es un modelo de machine learning tabular: tras entrenar y comparar varias alternativas, se seleccionó un **Random Forest** de scikit-learn. El modelo resuelve un problema de clasificación binaria: predecir si un cliente realizará una compra en un contexto de turismo de bienestar. Es relevante porque el repositorio ilustra una cadena completa de MLOps (entrenamiento, registro con MLflow, integración continua con GitHub Actions, despliegue en Hugging Face Space mediante Streamlit o Gradio y Docker), lo que sirve como referencia para desarrolladores que quieren publicar modelos clásicos en la plataforma. El conjunto de datos utilizado contiene **4.128 filas** y el modelo alcanza un ROC-AUC de **0,9681** en test. El formato de pesos es **joblib** y no se dispone de información sobre licencia ni idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random Forest (ensemble de árboles de decisión, scikit-learn) |
| Parametros totales | no disponible |
| Longitud de contexto | no aplica (modelo tabular) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo tabular, no de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | joblib |

## Arquitectura y entrenamiento

El modelo es un Random Forest, un ensemble de árboles de decisión implementado con scikit-learn. Según la documentación del proyecto, se evaluaron también XGBoost y otras alternativas dentro de un notebook, y el Random Forest fue seleccionado por su mejor ROC-AUC en test (0,9681). El entrenamiento se realizó sobre un dataset de turismo de bienestar con 4.128 filas. El pipeline incluye preparación de datos en `model_building/data_prep.py` y entrenamiento en `model_building/train.py`. El proyecto registra los experimentos con MLflow y automatiza el despliegue mediante GitHub Actions y Hugging Face Hub. No se indica si se aplicó RLHF/DPO ni ninguna técnica de optimización de LLM, ya que no es un modelo de lenguaje.

## Capacidades

- Predicción de probabilidad de compra en turismo de bienestar (clasificación binaria).
- Trabajo con datos tabulares estructurados.
- Integración en pipelines de MLOps con MLflow, GitHub Actions y Hugging Face Hub.
- Despliegue en frontends web: Streamlit (`streamlit_app.py`) y Gradio (`app.py`).
- Empaquetado con Docker (`deployment/Dockerfile`).
- No posee capacidades de generación de texto, código, visión ni tool calling, al ser un modelo de machine learning clásico.

## Casos de uso

- **Predicción de conversión en campañas de marketing**: el modelo puede estimar la probabilidad de que un usuario compre un paquete de turismo de bienestar, lo que permite priorizar audiencias en campañas de publicidad digital.
- **Segmentación de clientes para ofertas personalizadas**: a partir de las predicciones, el sistema puede clasificar a los clientes en grupos de alta o baja probabilidad de compra para enviar promociones específicas.
- **Optimización de reservas en plataformas de turismo**: el modelo puede integrarse en un backend para decidir qué ofertas mostrar primero en una página de resultados, mejorando la conversión.
- **Alertas para equipos de ventas**: cuando la probabilidad supera un umbral, el modelo puede generar notificaciones automáticas a agentes comerciales para que contacten al cliente.
- **Análisis de pérdida de clientes (churn)**: adaptando el problema, el modelo puede utilizarse para identificar clientes con baja probabilidad de recompra y activar programas de fidelización.
- **Investigación en MLOps**: el proyecto sirve como plantilla para estudiantes y desarrolladores que deseen practicar el despliegue de modelos tradicionales en Hugging Face Spaces usando Streamlit o Gradio, con integración continua y registro de experimentos.

## Benchmarks y rendimiento

La documentación del proyecto incluye los resultados de la evaluación sobre el dataset de 4.128 filas. No se han publicado benchmarks frente a otros modelos externos, pero la comparativa interna seleccionó Random Forest.

| Métrica | Valor en test |
|---|---|
| ROC-AUC | 0,9681 |
| Accuracy | 0,8991 |
| Precision | 0,9375 |
| Recall | 0,5097 |
| F1 | 0,6611 |

## Requisitos de hardware

- VRAM estimada: no aplica, el modelo es un Random Forest en formato joblib que se ejecuta en CPU.
- GPU recomendada: ninguna; no se requiere GPU.
- Compatible con equipos de consumo: sí, cualquier ordenador con Python y los paquetes necesarios (scikit-learn, joblib, etc.).
- Opciones de despliegue: Streamlit, Gradio, Docker, Hugging Face Spaces, MLflow.
- Latencia y throughput estimados: no disponibles. Dado el tamaño del dataset (4.128 filas) y la naturaleza del modelo, se espera una inferencia rápida en CPU, pero no se proporcionan mediciones.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks frente a otros modelos en la información proporcionada. Dentro del propio proyecto se comparó Random Forest con XGBoost u otras alternativas, pero no se detallan los resultados de esos modelos. Por tanto, la comparativa externa no está disponible.

## Limitaciones y advertencias

- El recall en test es bajo (0,5097), lo que indica que el modelo falla en detectar alrededor de la mitad de los positivos reales; esto puede suponer una alta tasa de falsos negativos en escenarios de venta.
- La precisión es alta (0,9375), por lo que cuando el modelo predice una compra, suele acertar, pero es conservador.
- El conjunto de datos es pequeño (4.128 filas), lo que incrementa el riesgo de sobreajuste y limita la generalización a otros mercados o épocas.
- No se especifica una licencia, por lo que el uso comercial está restringido por defecto mientras no se aclare.
- No hay información sobre sesgos de género, raza u otros; dado que es un dataset de turismo, pueden existir sesgos demográficos no documentados.
- El proyecto está diseñado para un contexto educativo de MLOps, no para producción con garantías; carece de monitorización, versionado formal del modelo y documentación de auditoría.
- Fecha de creación y actualización del repositorio: 2026-09-06; se recomienda verificar la validez de los datos antes de usar el modelo en entornos productivos.

## Enlaces

- Repositorio del proyecto: https://huggingface.co/Ms21063/Tourism_Project
- Perfil del autor: https://huggingface.co/Ms21063
- Repositorio del modelo (mencionado en el README): https://huggingface.co/Ms21063/tourism-purchase-model
- Repositorio del dataset (mencionado en el README): https://huggingface.co/Ms21063/tourism-dataset

Nota: los enlaces adicionales se derivan de la información del README; no se han verificado de forma independiente.
