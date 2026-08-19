# ghostai1/internalRAGCX

## Resumen

El repositorio `ghostai1/internalRAGCX` no es un modelo de inteligencia artificial, sino un pipeline de preprocesamiento de datos para sistemas de Retrieval-Augmented Generation (RAG) y Context-Augmented Generation (CAG). Publicado por el usuario `ghostai1` en Hugging Face, contiene un script de Python que limpia y normaliza conjuntos de datos de centros de llamadas (call centers) para convertirlos en FAQs de alta calidad listas para su uso en pipelines posteriores de generación aumentada por recuperación.

El repositorio incluye una interfaz Gradio para interactuar con el pipeline, funciones de limpieza basadas en Pandas (eliminación de nulos, duplicados, entradas cortas y malformadas), y una suite de monitorización de rendimiento con gráficos Matplotlib. Está diseñado para ejecutarse en CPU, sin necesidad de GPU, y se presenta como una demostración de habilidades en ingeniería de datos para aplicaciones de experiencia del cliente (CX) en sectores como SaaS, HealthTech, FinTech y eCommerce.

Es importante destacar que, al tratarse de un script de preprocesamiento y no de un modelo entrenado, no existen parámetros, arquitectura neuronal ni pesos. Su relevancia radica en la calidad de los datos de entrada para sistemas RAG/CAG, un factor crítico en entornos empresariales donde los datos ruidosos degradan significativamente el rendimiento de los modelos generativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplicable (pipeline de datos basado en Pandas) |
| Parametros totales | No aplicable |
| Parametros activos | No aplicable |
| Longitud de contexto | No aplicable |
| Tipos de cuantizacion | No aplicable |
| Idiomas soportados | No especificado (el pipeline rellena el campo `language` con "en" por defecto) |
| Licencia | No disponible |
| Formato de pesos | No aplicable (codigo fuente Python, no contiene pesos) |

## Arquitectura y entrenamiento

No existe una arquitectura de red neuronal ni un proceso de entrenamiento. El repositorio contiene un script `app.py` que implementa un pipeline de preprocesamiento de datos con las siguientes etapas:

- **Ingesta de datos**: lectura de archivos CSV mediante `pd.read_csv` con `io.StringIO`, manejando columnas `call_id`, `question`, `answer` y `language`.
- **Limpieza**: eliminación de filas con valores nulos en `question` o `answer`, eliminación de preguntas duplicadas, filtrado de entradas con preguntas de menos de 10 caracteres o respuestas de menos de 20 caracteres, y detección de entradas malformadas mediante expresiones regulares.
- **Estandarización**: normalización de texto (por ejemplo, "mo" a "month") y relleno del campo `language` con "en" cuando falta.
- **Salida**: generación de un archivo `cleaned_call_center_faqs.csv` y estadísticas de limpieza (nulos eliminados, duplicados, entradas cortas, malformadas).

El autor menciona compatibilidad con Amazon SageMaker y Azure AI para entrenar modelos BERT o DistilBERT sobre los datos limpios, así como integración con LLMs como `distilgpt2`. Sin embargo, no se proporciona ningún código de entrenamiento ni datos de entrenamiento en el repositorio.

## Capacidades

- **Limpieza de datos estructurados**: elimina nulos, duplicados, entradas cortas y malformadas de datasets de FAQs.
- **Normalización de texto**: estandariza abreviaturas y rellena campos de idioma faltantes.
- **Generación de estadísticas**: produce métricas detalladas sobre el número de entradas eliminadas por categoría.
- **Visualización**: genera gráficos de barras con Matplotlib para mostrar las estadísticas de limpieza.
- **Interfaz interactiva**: proporciona una interfaz Gradio que permite subir un CSV y descargar el resultado limpio.
- **Compatibilidad con nubes**: los datos de salida están formateados para su uso en Amazon SageMaker y Azure AI.

## Casos de uso

- **Preparación de datos para sistemas RAG en atención al cliente**: el pipeline convierte transcripciones crudas de llamadas en FAQs estructuradas, listas para indexar en una base vectorial. Es adecuado porque elimina ruido que degradaría la calidad de la recuperación.
- **Limpieza de datasets para fine-tuning de modelos de clasificación de intenciones**: los datos limpios pueden usarse para entrenar un clasificador BERT en SageMaker, reduciendo el riesgo de sobreajuste a entradas irrelevantes.
- **Automatización de QA en centros de contacto**: las FAQs generadas pueden alimentar un chatbot basado en RAG para responder consultas frecuentes, reduciendo la carga de los agentes humanos.
- **Migración de datos legacy a formatos estructurados**: el pipeline estandariza campos de idioma y texto, facilitando la integración con sistemas CRM modernos.
- **Generación de datasets de evaluación para modelos generativos**: las preguntas y respuestas limpias pueden servir como ground truth para medir la precisión de LLMs en tareas de respuesta a preguntas.
- **Demostración de habilidades en ingeniería de datos**: el repositorio sirve como portafolio para mostrar competencia en Pandas, Gradio y despliegue en Hugging Face, útil en procesos de selección para roles de ML Engineer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un pipeline de preprocesamiento, no existen métricas de precisión, F1 o similar. El autor menciona tiempos de procesamiento de ejemplo (ingesta: 50ms, limpieza: 30ms, salida: 10ms), pero son valores ilustrativos sin metodología verificable.

## Requisitos de hardware

- **CPU**: suficiente. El pipeline está diseñado para ejecutarse en CPU sin GPU.
- **Memoria RAM**: no especificada, pero para datasets de call center de tamaño moderado (miles de filas) 4-8 GB deberían ser suficientes.
- **GPU**: no requerida.
- **Despliegue**: puede ejecutarse localmente con Python 3.9+ o desplegarse en Hugging Face Spaces (free tier). Compatible con AWS Lambda o Azure Functions para procesamiento serverless.
- **Dependencias**: `gradio==4.44.0`, `pandas==2.2.3`, `matplotlib==3.9.2`.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de IA comparable con LLMs u otros modelos generativos. Podría compararse con otros pipelines de limpieza de datos como `dataprep` o `pandas-profiling`, pero no se dispone de información sobre alternativas específicas en el contexto de RAG.

## Limitaciones y advertencias

- **No es un modelo de IA**: no puede generar texto, razonar ni realizar inferencias. Es únicamente un script de preprocesamiento.
- **Alcance limitado**: solo procesa datasets con las columnas `call_id`, `question`, `answer` y `language`. Otros formatos requieren adaptación.
- **Reglas de limpieza fijas**: los umbrales de longitud (10 y 20 caracteres) y las expresiones regulares están hardcodeados, lo que puede no ser óptimo para todos los dominios.
- **Sin soporte multilingüe real**: aunque el pipeline rellena el campo `language`, no realiza traducción ni detección de idioma.
- **Sin garantía de calidad**: no hay validación externa de la corrección de las FAQs generadas. El autor afirma experiencia desde 2020, pero no se aportan pruebas.
- **Licencia no especificada**: el repositorio no indica licencia, por lo que su uso comercial puede ser problemático.
- **Actualizaciones inconsistentes**: el registro de cambios muestra entradas vacías y un mensaje de configuración faltante, lo que sugiere un mantenimiento irregular.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ghostai1/internalRAGCX
- No se han encontrado papers, blogs o demos adicionales asociados a este repositorio en la informacion proporcionada.
