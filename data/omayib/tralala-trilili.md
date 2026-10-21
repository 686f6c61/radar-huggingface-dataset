# omayib/tralala-trilili

## Resumen

omayib/tralala-trilili es un clasificador de texto en indonesio que estima la popularidad de una lírica de canción en tres clases: Kurang, Cukup y Sangat populer. Lo desarrolla omayib y se distribuye con licencia MIT en HuggingFace; no es un modelo generativo ni un LLM, sino un pipeline de scikit-learn formado por TF-IDF con tf sublineal y regresión logística con `class_weight="balanced"`.

El modelo se entrena con 1.262 canciones indonesias únicas (1.020 de entrenamiento y 242 de test dorado) y etiquetas derivadas de streams por día en el chart diario de Spotify Indonesia. Su interés está en que ocupa menos de 50 MB de RAM, funciona solo en CPU y se reentrena y valida a diario; sin embargo, su rendimiento es moderado (accuracy 0,438; macro-F1 0,431) y debe usarse como una señal débil junto con otros factores.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | pipeline de scikit-learn: TF-IDF con tf sublineal + regresión logística con `class_weight="balanced"` |
| Parámetros totales | no disponible (modelo lineal; el número de coeficientes depende del vocabulario TF-IDF y no se publica) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de bolsa de palabras; no hay ventana de contexto) |
| Tipos de cuantización | no aplica (no se distribuyen variantes cuantizadas; el artefacto es un pipeline joblib) |
| Idiomas soportados | indonesio (id); no se documentan otros idiomas |
| Licencia | MIT |
| Formato de pesos | joblib (`virality_model.joblib`) |
| Tarea | clasificación de texto en 3 clases |
| Entrada | lírica limpiada: minúsculas, sin puntuación, sin marcadores de verso/estribillo ni créditos |
| Salida | `predict_proba(...)` con orden `[Kurang, Cukup, Sangat populer]` |
| Hardware | CPU; menos de 50 MB de RAM según la model card |
| Tamaño del repositorio | 0,0 GB según HuggingFace |

## Arquitectura y entrenamiento

El modelo es un pipeline clásico de scikit-learn: primero aplica TF-IDF con tf sublineal sobre la lírica limpia y después una regresión logística con ponderación de clases `balanced`. Según la model
