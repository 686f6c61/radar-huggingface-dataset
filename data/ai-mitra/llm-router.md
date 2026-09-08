# ai-mitra/llm-router

## Resumen

`ai-mitra/llm-router` es un clasificador de tareas ligero desarrollado por `ai-mitra` que predice la categoría de un prompt (`simple`, `coding`, `reasoning`, `security`, `summarization`) para enrutar la consulta al LLM más adecuado dentro de un sistema de IA agéntico. No es un modelo generativo: no genera texto ni conoce proveedores concretos de modelos, por lo que el registro de modelos al que enruta puede cambiarse sin necesidad de reentrenar el clasificador.

La arquitectura combina el modelo de embeddings `sentence-transformers/all-MiniLM-L6-v2` con un clasificador `LogisticRegression` de `scikit-learn`. Se entrena sobre el dataset `ai-mitra/llm-router-dataset`, que contiene aproximadamente 1700 ejemplos repartidos equitativamente entre las cinco categorías. Su relevancia actual radica en la optimización de costes y latencia en sistemas que combinan varios LLMs, permitiendo dirigir cada solicitud al modelo más apropiado según el tipo de tarea.

Al tratarse de un clasificador de tareas y no de un modelo de lenguaje, las métricas técnicas convencionales de los LLM (parámetros, longitud de contexto, cuantización) no aplican directamente. Su valor principal es la precisión en la clasificación y la baja latencia en inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline: embeddings `sentence-transformers/all-MiniLM-L6-v2` + clasificador `LogisticRegression` de scikit-learn |
| Parametros totales | No disponible (no es un LLM; clasificador scikit-learn sobre embeddings de 384 dimensiones) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (no es un modelo generativo) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | `classifier.joblib` (joblib) junto con `metadata.json`, `label_mapping.json` y `training_config.json` |

## Arquitectura y entrenamiento

El modelo implementa un pipeline de clasificación supervisada en dos etapas. Primero, el modelo `sentence-transformers/all-MiniLM-L6-v2` genera un embedding de 384 dimensiones para el prompt de entrada. A continuación, un clasificador `LogisticRegression` multiclase de `scikit-learn` estima la probabilidad softmax sobre las cinco categorías predefinidas. La separación entre el clasificador de tareas y el registro de modelos es la innovación técnica destacable: el clasificador solo decide qué tipo de tarea es, sin acoplarse a ningún proveedor o nombre de modelo específico.

El entrenamiento se realiza sobre el dataset `ai-mitra/llm-router-dataset`, con aproximadamente 1700 ejemplos (340 por categoría). No se aplican técnicas de RLHF ni DPO, ya que no es un modelo de lenguaje. El repositorio incluye los ficheros `metadata.json` con la configuración de entrenamiento, hiperparámetros, timestamp y métricas completas de evaluación, así como `label_mapping.json` para la correspondencia entre etiquetas e índices.

## Capacidades

- Clasificación de prompts en cinco categorías: `coding`, `reasoning`, `security`, `simple`, `summarization`.
- Devuelve probabilidades softmax sobre las cinco clases, permitiendo umbrales de confianza configurables (el valor por defecto recomendado es `0.45`).
- Incluye utilidades en el paquete `llm-router` para integrarse fácilmente en sistemas de enrutamiento de modelos.
- Soporta el uso directo mediante `huggingface_hub`, `sentence-transformers` y `joblib`.
- No genera texto ni realiza razonamiento multi-paso.
- No ofrece soporte de tool calling ni function calling.
- Solo opera en inglés.

## Casos de uso

- **Enrutamiento de prompts en sistemas agénticos:** el clasificador etiqueta cada solicitud entrante y dirige la consulta a un LLM especializado en esa categoría. Por ejemplo, un prompt de `coding` puede enviarse a un modelo ajustado para generación de código, mientras que un prompt de `reasoning` se dirige a un modelo con mayor capacidad de razonamiento.
- **Optimización de costes en arquitecturas multi-modelo:** al identificar tareas `simple`, el router puede enrutarlas a modelos pequeños y económicos, reservando los modelos grandes y costosos para tareas `reasoning` o `security`. Esto reduce el coste por inferencia sin degradar la calidad percibida.
- **Reconfiguración dinámica del registro de modelos:** gracias a que el clasificador no conoce proveedores concretos, se pueden añadir o sustituir modelos en el registro sin reentrenar el clasificador. Esto es útil en entornos con cambios frecuentes de proveedores o versiones de modelos.
- **Filtrado de prompts de seguridad:** los prompts clasificados como `security` pueden enrutarse a modelos con políticas de seguridad reforzadas o a un pipeline de revisión adicional antes de llegar al LLM principal.
- **Preprocesamiento de flujos de automatización:** en sistemas de generación de informes, el clasificador puede separar solicitudes de `summarization`, `simple` y `coding` para asignar cada una a un agente o pipeline diferente dentro de una aplicación empresarial.
- **Colas de trabajo y priorización:** las consultas entrantes se clasifican por tipo de tarea para asignar prioridades en un sistema de colas. Por ejemplo, las tareas `simple` pueden procesarse de inmediato, mientras que las `reasoning` entran en una cola con más tiempo de cómputo.
- **Telemetría y análisis de uso:** el clasificador proporciona una señal de tipo de tarea para monitorizar la distribución de solicitudes por categoría, lo que ayuda a ajustar el dimensionamiento de los modelos desplegados.

## Benchmarks y rendimiento

La model card publica los siguientes resultados de evaluación:

| Split | Accuracy | Macro F1 |
|---|---|---|
| Validation | 0.996 | 0.996 |
| Test | 0.988 | 0.988 |

No se han publicado comparativas con otros clasificadores de tareas en la información disponible, por lo que no es posible presentar una tabla comparativa de benchmark.

## Requisitos de hardware

- **VRAM estimada:** inferior a 1 GB, ya que el modelo de embeddings `all-MiniLM-L6-v2` es pequeño y el clasificador es lineal.
- **GPU recomendada:** no se requiere GPU; el modelo puede ejecutarse en CPU con latencias del orden de milisegundos. Cualquier CPU moderna es suficiente.
- **Compatibilidad con GPU de consumo:** no aplicable; la inferencia puede ejecutarse en cualquier sistema, incluidos entornos sin aceleración gráfica.
- **Opciones de despliegue:** el clasificador se integra fácilmente como servicio REST en Python (FastAPI, Flask) o como módulo dentro de un framework de agentes. No es compatible con `vLLM`, `llama.cpp` ni `Ollama`, al no tratarse de un modelo de lenguaje.
- **Latencia y throughput:** al ser un pipeline ligero (embeddings + regresión logística), la latencia típica en CPU es de pocos milisegundos por consulta, con un throughput alto para cargas de trabajo de clasificación.

## Comparativa con modelos similares

No se han identificado modelos comparables en la información proporcionada. El ámbito funcional (clasificador de tareas para enrutamiento de prompts) es específico y no se dispone de datos de otras alternativas. No disponible.

## Limitaciones y advertencias

- El modelo solo clasifica en cinco categorías fijas; no es un LLM ni genera respuestas, por lo que no puede usarse directamente como asistente conversacional.
- Esta entrenado con aproximadamente 1700 ejemplos, lo que puede limitar la generalización a dominios o estilos de prompts no representados en el dataset.
- Solo soporta inglés; cualquier consulta en otro idioma puede devolver clasificaciones incorrectas.
- El umbral de confianza por defecto (`0.45`) está calibrado sobre el dataset de entrenamiento y puede necesitar recalibración en entornos de producción con distribuciones de prompts distintas.
- No proporciona información sobre la salud, disponibilidad ni latencia de los endpoints de los LLMs; esta tarea queda fuera de su alcance.
- Puede presentar sesgos heredados del dataset de entrenamiento, que no se han documentado explícitamente.
- La licencia MIT permite uso comercial, aunque el modelo requiere el uso del paquete `llm-router` y de `sentence-transformers` para funcionar.

## Enlaces

- HuggingFace: https://huggingface.co/ai-mitra/llm-router
- Repositorio del paquete `llm-router`: https://github.com/tg-mitra/llm_router
- Dataset de entrenamiento: https://huggingface.co/datasets/ai-mitra/llm-router-dataset
