# Av1447/Health

## Resumen

Av1447/Health es un clasificador tabular multiclase publicado en Hugging Face por el usuario Av1447. No es un modelo de lenguaje ni un transformer: se trata de un ensemble de scikit-learn con votación suave que combina RandomForestClassifier (100 estimadores, peso 0,40), SVC con kernel RBF (peso 0,35) y GaussianNB (peso 0,25). Toma 180 indicadores binarios de síntomas y devuelve una de 10 patologías, además de probabilidades por clase y un mapeo externo a prescripciones.

El modelo aborda un problema de clasificación tabular en el ámbito sanitario, pero su utilidad práctica está muy limitada: declara una accuracy de test del 13,33% en 10 clases, solo 3,33 puntos por encima del azar teórico (10%), y la métrica no está verificada. La model card lo orienta a investigación, educación, ayuda al triaje y prototipado, no a diagnóstico clínico. Su interés actual es como ejemplo de pipeline sklearn serializado con joblib y como caso de estudio de los riesgos de publicar modelos sanitarios sin validación suficiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VotingClassifier con votación suave; RandomForestClassifier (100 estimadores, Gini, peso 0,40), SVC RBF (probability=True, peso 0,35) y GaussianNB (peso 0,25) |
| Parámetros totales | No disponible; no se declara recuento. Componentes: 100 árboles, SVC y GaussianNB |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica: entrada tabular fija de 180 variables binarias; no hay ventana de contexto |
| Tipos de cuantización | No aplica; no es una red neuronal y no se ofrecen variantes GGUF, AWQ o GPTQ |
| Idiomas soportados | Inglés en etiquetas, nombres de síntomas y documentación; las variables son binarias |
| Licencia | MIT |
| Formato de pesos | joblib (model.joblib); el tag onnx aparece en los metadatos, pero no se documenta ningún artefacto ONNX |
| Tarea | Clasificación tabular multiclase |
| Entrada | 180 síntomas binarios (0 = ausente, 1 = presente) |
| Clases de salida | 10 patologías |

## Arquitectura y entrenamiento

El modelo es un ensemble de tipo VotingClassifier con votación suave. Los subestimadores son RandomForestClassifier con 100 árboles y criterio Gini (peso 0,40), SVC con kernel RBF y probability=True (peso 0,35) y GaussianNB (peso 0,25). La entrada es un vector fijo de 180 variables binarias y la salida es una distribución de probabilidad sobre 10 clases. Se distribuye como pipeline completo en model.joblib; symptoms.json, diseases.json y prescriptions.json contienen los nombres de las variables, las etiquetas y el mapeo de tratamientos.

La model card no documenta el número de muestras de entrenamiento, el origen del cohorte clínico, la proporción de clases, el esquema de
