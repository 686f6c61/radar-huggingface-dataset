# ranzouu/leadforge-intent-classifier

## Resumen

LeadForge Intent Classifier es un clasificador de texto en portugués desarrollado por el usuario `ranzouu` que asigna a cada lead una de tres categorías de intención de prospección: `hot`, `warm` o `cold`. No es un modelo neuronal ni un transformer: se trata de un pipeline clásico de scikit-learn compuesto por una vectorización TF-IDF (n-gramas de palabra y de carácter) seguida de una regresión logística con balanceo de clases. El modelo se distribuye como artefactos serializados (`model.pkl` y `vectorizer.pkl`) y forma parte del proyecto mayor LeadForge, cuyo código fuente está disponible en GitHub.

El interés del modelo es fundamentalmente metodológico y de referencia: constituye una línea base reproducible, determinista (`random_state=42`) y ejecutable en CPU sin dependencias pesadas, pensada para tareas de cualificación de leads en portugués. Su conjunto de datos de demostración es muy reducido (60 muestras, 20 por clase), por lo que el autor lo presenta explícitamente como un ejercicio de pipeline y no como un modelo listo para producción.

La relevancia actual reside en su honestidad de evaluación: el autor documenta que una versión anterior publicaba una accuracy de 1.0 medida in-sample y que ese dato fue retirado en favor de una validación cruzada estratificada de 5 folds con ajuste anidado de `C`, lo que arroja una accuracy media de 0.633 ± 0.192. Es, por tanto, un ejemplo útil de línea base clásica frente a la que comparar alternativas (LinearSVC, gradient boosting o clasificación zero-shot con LLM) antes de escalar a datos reales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline scikit-learn: TF-IDF (FeatureUnion word(1,2) + char_wb(2,4), `sublinear_tf`) + regresión logística balanceada |
| Parámetros totales | no disponible (modelo lineal; el número de coeficientes depende del vocabulario TF-IDF, no documentado) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto; procesa el texto del lead como bolsa de n-gramas) |
| Tipos de cuantización | no aplica (artefactos pickle de scikit-learn; no hay cuantización) |
| Idiomas soportados | Portugués (`pt`) |
| Licencia | MIT |
| Formato de pesos | `model.pkl` y `vectorizer.pkl` (serialización joblib/pickle); no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un clasificador lineal clásico. La entrada de texto en minúsculas se transforma mediante un `FeatureUnion` que combina n-gramas de palabra de orden 1 y 2 con n-gramas de carácter `char_wb` de orden 2 a 4, aplicando `sublinear_tf` para amortiguar la frecuencia de término. Sobre esa representación dispersa se entrena una regresión logística con balanceo de clases y un hiperparámetro `C=4.0` en el modelo final. No hay embeddings, atención, capas ocultas ni fases de preentrenamiento, RLHF o DPO.

El entrenamiento se realizó sobre un dataset de demostración de 60 muestras (20 por clase) incluidas en `data/sample_leads.json`. La evaluación se llevó a cabo con `StratifiedKFold` de 5 folds y ajuste de `C` anidado dentro del fold de entrenamiento, reportando métricas pooled out-of-fold. El autor documenta explícitamente la retirada de una métrica anterior de accuracy 1.0 por estar calculada in-sample, y publica los resultados por fold (`runs/cv_folds.csv`) y por clase (`runs/class_report.csv`). La reproducibilidad está garantizada por `random_state=42` y por un comando de ejecución (`python -m leadforge_intent_classifier`).

## Capacidades

- Clasificación de texto en tres clases de intención de prospección: `hot`, `warm` y `cold`.
- Procesamiento de texto en portugués, incluyendo robustez parcial a variaciones morfológicas gracias a los n-gramas de carácter.
- Inferencia determinista y reproducible en CPU, sin GPU ni API de pago.
- Integración sencilla en pipelines Python mediante `joblib.load` y `predict` sobre la salida del vectorizador.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo thinking, visión, audio ni generación de texto libre.
- Capacidad multilingüe limitada al portugués; no se documenta soporte para otros idiomas.

## Casos de uso

- Cualificación inicial de leads en CRM: el clasificador etiqueta cada lead entrante como `hot`, `warm` o `cold` a partir del texto de contacto, permitiendo priorizar la cola comercial sin coste de inferencia en GPU.
- Enrutamiento de leads en marketing B2B: las etiquetas `hot` pueden dirigirse a ventas y las `cold` a campañas de nurturing, usando el modelo como primer filtro determinista dentro de un pipeline mayor.
- Línea base para experimentación: sirve como referencia reproducible (accuracy out-of-fold 0.633) contra la que comparar LinearSVC, gradient boosting o clasificación zero-shot con LLM antes de adoptar un modelo más costoso.
- Prototipado rápido de clasificadores de intención en portugués: el pipeline TF-IDF + regresión logística puede reentrenarse con datos propios siguiendo el código de `experiment.py` y el flujo de validación cruzada anidada.
- Filtrado previo en sistemas de scoring de leads: al ser determinista y de bajo coste, puede aplicarse a grandes volúmenes de texto para descartar leads claramente fríos antes de pasarlos a un modelo más caro.
- Docencia y auditoría de evaluación de modelos: el repositorio documenta el cambio de una evaluación in-sample inflada a una validación cruzada honesta, lo que lo convierte en un caso práctico para enseñar buenas prácticas de evaluación.

## Benchmarks y rendimiento

Resultados de validación cruzada estratificada de 5 folds con ajuste anidado de `C`, métricas pooled out-of-fold (media ± desvío entre folds):

| Métrica | Valor |
|---|---|
| Accuracy | 0.633 ± 0.192 |
| Precision (weighted) | 0.634 ± 0.197 |
| Recall (weighted) | 0.633 ± 0.192 |
| F1 (weighted) | 0.630 ± 0.189 |
| F1 (macro) | 0.633 |

Resultados por clase:

| Clase | Precision | Recall | F1 | Soporte |
|---|---|---|---|---|
| cold | 0.700 | 0.700 | 0.700 | 20 |
| hot | 0.750 | 0.750 | 0.750 | 20 |
| warm | 0.450 | 0.450 | 0.450 | 20 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en CPU.
- GPU recomendadas: ninguna; no requiere aceleración por hardware.
- Cabe en cualquier equipo consumer: el repositorio ocupa 0.0 GB y los artefactos son dos ficheros pickle de un modelo lineal disperso.
- Opciones de despliegue: ejecución directa con scikit-learn y joblib en Python; no es compatible con vLLM, llama.cpp, Ollama ni TGI al no ser un modelo de pesos neuronales.
- Latencia y throughput: no disponibles de forma medida; al ser un modelo lineal sobre TF-IDF disperso, la inferencia es de coste muy bajo y determinista, pero no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| LeadForge Intent Classifier | TF-IDF + regresión logística | no disponible | no aplica | Accuracy 0.633 (CV 5 folds) | MIT | Hugging Face y GitHub |
| LinearSVC (alternativa sugerida por el autor) | SVM lineal | no disponible | no aplica | no disponible | no disponible | no disponible |
| Gradient boosting (alternativa sugerida por el autor) | Árboles boosting | no disponible | no aplica | no disponible | no disponible | no disponible |
| LLM zero-shot (alternativa sugerida por el autor) | Transformer generativo | no disponible | no disponible | no disponible | no disponible | no disponible |

El autor propone LinearSVC, gradient boosting y LLM zero-shot como alternativas a comparar con datos reales y mayor volumen, pero no publica resultados de esas comparaciones.

## Limitaciones y advertencias

- Dataset de demostración de solo 60 muestras (20 por clase) escritas para ejercitar el pipeline; no son leads reales de producción.
- La clase `warm` es la frontera difícil, con F1 de 0.450: separar interés real de mera curiosidad es ambiguo incluso para un humano.
- Alta varianza entre folds (desviación de 0.192 en accuracy), indicativa de un conjunto de datos demasiado pequeño para conclusiones estables.
- Es un modelo lineal sobre n-gramas: no capta semántica profunda, contexto discursivo ni negaciones complejas.
- Soporte únicamente de portugués; no se documenta comportamiento en otros idiomas.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas sistemáticas por el sesgo del dataset de demostración.
- No debe usarse en producción sin reentrenar con datos reales y revalidar; el propio autor lo advierte.
- Licencia MIT: permite uso comercial, pero conviene conservar el aviso de copyright y verificar la procedencia de los datos de entrenamiento propios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ranzouu/leadforge-intent-classifier
- Repositorio del clasificador: https://github.com/ranzouu/leadforge-intent-classifier
- Proyecto LeadForge: https://github.com/ranzouu/leadforge
