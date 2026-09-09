# singhankit491/clinroute-tfidf-logreg-synthetic-v2

## Resumen

ClinRoute TF-IDF + Logistic Regression — Synthetic v2 es un modelo de clasificación de texto basado en scikit-learn, desarrollado por singhankit491 dentro del proyecto ClinRoute NLP ReleaseOps. Su objetivo es predecir dos variables en textos de derivación clínica: la ruta de derivación (route) y el nivel de urgencia declarado (urgency). Se compone de dos pipelines independientes de TF-IDF con regresión logística, entrenados sobre un dataset sintético publicado por el propio autor.

El modelo está diseñado para ser reproducible y auditable: se publican los pipelines en formato joblib, un model.json portable para ejecución en navegador, un informe de evaluación y fixtures de validación. Los resultados medidos sobre los datos sintéticos muestran accuracy y macro-F1 de 1.0, aunque con valores de calibración ECE de 0.15 y 0.21, lo que indica que las probabilidades no están perfectamente calibradas. Es un modelo ligero, sin arquitectura de red neuronal, y debe considerarse únicamente como una demostración técnica sobre datos sintéticos, no como un modelo clínico real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de scikit-learn: TF-IDF + regresión logística (dos pipelines independientes: route y urgency) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | joblib (pipeline de scikit-learn) y model.json portable en navegador |

## Arquitectura y entrenamiento

El modelo utiliza un pipeline clásico de NLP basado en TF-IDF junto con un clasificador de regresión logística. No se trata de un transformer ni de una arquitectura de lenguaje moderno. Se entrenan dos pipelines independientes: uno para predecir la ruta de derivación (route) y otro para predecir el nivel de urgencia (urgency). Ambos se construyen sobre un dataset sintético generado por plantillas, sin que se hayan publicado detalles sobre el número de tokens, la composición del corpus ni si se aplicó alguna técnica de ajuste posterior como RLHF o DPO.

El README indica que la división train/test presenta un solapamiento de texto normalizado igual a 0, lo que sugiere una separación estricta entre conjuntos. El proyecto general, ClinRoute NLP ReleaseOps, combina este tipo de pipelines clásicos con un transformer dual-head para múltiples tareas, extracción de entidades, redacción de identificadores y revisión basada en confianza. La innovación principal de este modelo concreto es su reproducibilidad: se publican los artefactos de evaluación, los fixtures de validación y un archivo model.json que permite ejecutar el pipeline en el navegador sin servidor.

## Capacidades

- Clasificación de texto para predecir la ruta de derivación (route) a partir del contenido de una derivación clínica.
- Clasificación de urgencia (urgency) según lo declarado en el texto.
- Exportación a model.json para ejecución ligera en navegador, sin dependencias de servidor.
- Incluye métricas de calibración ECE en el informe de evaluación, lo que permite auditar la fiabilidad de las probabilidades.
- Los pipelines se distribuyen en joblib, por lo que pueden cargarse directamente en aplicaciones Python con scikit-learn.
- Forma parte de un ecosistema más amplio que incluye redacción de identificadores y revisión por confianza humana, aunque este modelo no las implementa por sí mismo.

## Casos de uso

- Enrutamiento de derivaciones en un prototipo de salud: dado un texto de derivación, el pipeline predice la ruta de destino (route) para asignarla a un servicio o especialista. Es adecuado como demo de bajo coste porque no requiere GPU ni infraestructura pesada.
- Triaje de urgencia en formularios digitales: el segundo pipeline clasifica la urgencia declarada en el texto. Puede integrarse en un formulario web para priorizar colas de revisión en entornos simulados.
- Revisión de confianza en sistemas sanitarios: utilizando las probabilidades del modelo y el ECE como indicador, se pueden filtrar las predicciones con baja confianza para derivarlas a revisión humana. El model.json permite hacer esto en el navegador sin enviar datos a un servidor.
- Evaluación responsable de modelos de lenguaje: este pipeline sirve como referencia de línea base para comparar modelos más complejos. La información de calibración y la separación de datos train/test facilitan mediciones reproducibles.
- Pruebas de humo en pipelines CI/CD: al ser un artefacto pequeño y reproducible, se puede integrar en un flujo de validación automática para comprobar que los cambios en el sistema de derivación no rompen la clasificación básica.
- Aplicaciones educativas de NLP: el modelo es útil para enseñar técnicas clásicas de TF-IDF y regresión logística en tareas de clasificación de texto, ya que incluye evaluación de calibración y fixtures de validación.

## Benchmarks y rendimiento

Los resultados publicados corresponden exclusivamente al dataset sintético ClinRoute y deben interpretarse solo como medidas sobre datos generados por plantillas:

| Metrica | Route | Urgency |
|---|---|---|
| Accuracy | 1.000000 | 1.000000 |
| Macro-F1 | 1.000000 | 1.000000 |
| ECE | 0.153885 | 0.206798 |
| Solapamiento de texto normalizado train/test | 0 | 0 |

No se han publicado resultados sobre conjuntos de datos clínicos reales ni comparaciones con otros modelos en los documentos disponibles.

## Requisitos de hardware

- VRAM estimada: no aplica. El modelo es un pipeline de TF-IDF y regresión logística que se ejecuta en CPU.
- GPU recomendada: no se requiere ninguna GPU. Es compatible con cualquier CPU moderna.
- Si cabe en GPU de consumo: no aplica, ya que no es un modelo de redes neuronales.
- Opciones de despliegue: se puede servir con contenedores que ejecuten Python con scikit-learn, empaquetar como microservicio con FastAPI o Flask, o ejecutarse directamente en el navegador mediante el archivo model.json. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Al tratarse de un modelo pequeño, la latencia en CPU debería ser baja, pero no se aportan valores medidos.

## Comparativa con modelos similares

No se dispone de modelos comparables con benchmarks publicados en la información proporcionada. El proyecto general ClinRoute NLP ReleaseOps menciona un transformer dual-head para las mismas tareas de route y urgency, pero no se han encontrado métricas de este modelo específico para comparar. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- El modelo está entrenado únicamente con datos sintéticos generados por plantillas; no representa la variabilidad ni la complejidad del lenguaje clínico real.
- La accuracy y macro-F1 perfectas en el dataset sintético no deben interpretarse como rendimiento clínico, tal y como advierte el autor en la model card.
- Los valores de ECE de 0.15 y 0.21 indican que las probabilidades predichas no están bien calibradas, lo que puede llevar a decisiones erróneas si se usan umbrales de confianza.
- No se ha especificado la licencia del modelo, por lo que su uso comercial o redistribución quedan sin definir.
- No se indica el idioma de los datos de entrenamiento; se presume inglés por el contexto del proyecto, pero no está confirmado.
- El modelo no soporta generación de texto, tool calling, agentes, visión ni audio. Solo realiza clasificación de texto.
- En producción clínica real, cualquier uso debería pasar por una validación externa exhaustiva y cumplir los requisitos de seguridad y responsabilidad aplicables.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/singhankit491/clinroute-tfidf-logreg-synthetic-v2
- Space de HuggingFace del proyecto: https://huggingface.co/spaces/singhankit491/clinroute-nlp
- Repositorio en GitHub: https://github.com/singhankitsrf/ClinRoute-NLP-ReleaseOps
- README del repositorio: https://github.com/singhankitsrf/ClinRoute-NLP-ReleaseOps/blob/main/README.md
