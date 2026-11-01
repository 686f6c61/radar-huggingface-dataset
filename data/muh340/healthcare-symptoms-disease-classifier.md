# Muh340/healthcare-symptoms-disease-classifier

## Resumen

`Muh340/healthcare-symptoms-disease-classifier` es un proyecto de demostración publicado en HuggingFace que intenta predecir una categoría de enfermedad a partir de una lista de síntomas separados por comas. No es una red neuronal ni un modelo de lenguaje: se trata de un pipeline clásico de scikit-learn compuesto por una vectorización TF-IDF (3.000 características, n-gramas de 1 a 2) seguida de una regresión logística. El autor lo presenta explícitamente como una demo educativa, no como una herramienta clínica.

El modelo se entrenó sobre un dataset de Kaggle (`kundanbedmutha/healthcare-symptomsdisease-classification-dataset`) y se distribuye como un fichero `.pkl` de pocos megabytes, pensado para ejecutarse en alojamiento gratuito. El repositorio ocupa 1,4 GB, un tamaño desproporcionado respecto al artefacto real del modelo, probablemente por artefactos auxiliares o versiones intermedias.

La relevancia de esta ficha es fundamentalmente como advertencia: el propio autor declara una precisión de test de aproximadamente el 3,3 % sobre 30 clases, exactamente lo que se obtendría adivinando al azar. Es decir, el modelo no aprende señal predictiva útil a partir del dataset utilizado. Cualquier evaluador debe tratarlo como un ejemplo de pipeline mal planteado o de dataset sin señal, no como un clasificador de síntomas funcional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TF-IDF (3.000 características, n-gramas 1-2) + regresión logística (scikit-learn) |
| Parámetros totales | no disponible (modelo lineal; el número de coeficientes depende del vocabulario y las 30 clases) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada: cadena de síntomas separados por comas; sin ventana de tokens definida) |
| Tipos de cuantización | no aplica (modelo lineal serializado en `.pkl`; no hay pesos en fp16/int8) |
| Idiomas soportados | no disponibles (el dataset de Kaggle está presumiblemente en inglés, pero no se documenta) |
| Licencia | MIT |
| Formato de pesos | `.pkl` (serialización joblib de un pipeline de scikit-learn 1.6.1) |

## Arquitectura y entrenamiento

La arquitectura es un pipeline clásico de procesamiento de lenguaje natural: `TfidfVectorizer` con un máximo de 3.000 características y rango de n-gramas (1, 2), seguido de un `LogisticRegression` multiclase. La entrada es una cadena de texto con síntomas separados por comas; la salida es una de 30 categorías de enfermedad. No hay embeddings, atención, ni representación contextual: el modelo solo aprende pesos por término y bigrama.

No se documentan detalles del entrenamiento más allá del dataset de origen (Kaggle) y la versión de scikit-learn (1.6.1). No se especifica el número de muestras, la partición train/test, ni si hubo ajuste de hiperparámetros. El propio autor reconoce que la precisión de test ronda el 3,3 % sobre 30 clases, equivalente al azar, y atribuye el fallo a que "el dataset parece tener poca señal real". No hay innovaciones técnicas destacables: es un baseline lineal sin técnicas de regularización específicas documentadas, sin validación cruzada reportada y sin calibración de probabilidades.

## Capacidades

- Clasificación de texto corto en una de 30 categorías de enfermedad a partir de una lista de síntomas separados por comas.
- Inferencia sobre cadenas de texto en formato libre con separador por comas (por ejemplo, `"fever, cough, sore throat"`).
- Serialización y carga mediante `joblib` en entornos Python con scikit-learn 1.6.1.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agéntico.
- No tiene capacidades multilingües documentadas.
- No dispone de modo de razonamiento (thinking), visión, audio ni generación de texto libre.
- No genera explicaciones ni probabilidades calibradas de forma documentada.

## Casos de uso

- Docencia sobre pipelines de scikit-learn: sirve como ejemplo mínimo de `TfidfVectorizer` + `LogisticRegression` para explicar vectorización, ajuste y serialización con `joblib` en un curso introductorio de machine learning.
- Ejemplo de evaluación crítica de datasets: útil para mostrar cómo un dataset de Kaggle sin señal produce un clasificador con precisión equivalente al azar, y para enseñar a detectar este problema antes de desplegar.
- Prueba de infraestructura de serving ligero: al ser un `.pkl` de pocos megabytes, permite validar un endpoint HTTP o una función serverless de clasificación de texto sin coste de GPU.
- Reproducción de baselines: como referencia negativa (accuracy ≈ 3,3 % en 30 clases) para comparar con modelos posteriores sobre el mismo dataset.
- Demostración de advertencias éticas en IA sanitaria: ilustra por qué un modelo no validado clínicamente no debe usarse para triaje ni orientación médica, y sirve para discutir la necesidad de disclaimers.
- Prototipado de interfaz de usuario: permite construir una UI de demostración (formulario de síntomas → categoría) sin depender de un modelo pesado, siempre que se etiquete claramente como demo no funcional.

## Benchmarks y rendimiento

| Métrica | Valor | Referencia |
|---|---|---|
| Precisión en test (30 clases) | ≈ 3,3 % | Declarada por el autor en la model card |
| Azar (30 clases balanceadas) | ≈ 3,3 % | Cálculo teórico |
| Mejora sobre el azar | ≈ 0 puntos porcentuales | Derivado de los dos anteriores |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ni son aplicables a un clasificador lineal de este tipo.

## Requisitos de hardware

- VRAM: no aplica; el modelo es lineal y se ejecuta en CPU.
- GPU recomendadas: ninguna; no se requiere aceleración por hardware.
- Cabe en cualquier GPU consumer y en CPU de un solo núcleo; el `.pkl` ocupa pocos megabytes.
- Despliegue: Python con `scikit-learn==1.6.1` y `joblib`; compatible con FastAPI, Flask, AWS Lambda, Google Cloud Functions o cualquier entorno serverless. No aplica vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no documentados; para un modelo lineal de este tamaño se espera latencia en el orden de microsegundos a milisegundos por petición en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Tipo | Clases | Precisión test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Muh340/healthcare-symptoms-disease-classifier` | TF-IDF + regresión logística | 30 | ≈ 3,3 % | MIT | HuggingFace |
| Baselines clínicos con BERT (p. ej. `emilyalsentzer/Bio_ClinicalBERT`) | Transformer encoder | variable | no disponible en esta ficha | MIT / Apache-2.0 según variante | HuggingFace |
| Clasificadores de síntomas basados en reglas o grafos médicos (p. ej. SNOMED CT) | Sistema experto | miles de conceptos | no comparable | variable | Comercial / abierto |

No se dispone de comparativas numéricas publicadas entre este modelo y alternativas sobre el mismo dataset. Cualquier comparación cuantitativa requeriría reentrenar los baselines sobre el dataset de Kaggle original, algo que no se ha hecho en la información disponible.

## Limitaciones y advertencias

- Precisión declarada de ≈ 3,3 % sobre 30 clases, idéntica al azar: el modelo no tiene capacidad predictiva demostrada.
- El dataset de origen parece carecer de señal real, según el propio autor; el problema es de datos, no solo de algoritmo.
- Riesgo alto de alucinación en el sentido de predicciones sin fundamento: el modelo devolverá siempre una clase aunque la entrada no sea informativa.
- No es una herramienta de diagnóstico clínico ni constituye consejo médico; el autor lo declara explícitamente como uso educativo.
- Idiomas soportados no documentados; el rendimiento fuera del inglés es desconocido y probablemente nulo.
- Sin información sobre sesgos demográficos, geográficos o de género en el dataset de entrenamiento.
- Licencia MIT permite uso comercial del código y los pesos, pero eso no implica validez clínica ni regulatoria; un uso en producción sanitaria requeriría validación independiente y cumplimiento normativo (MDR en la UE, FDA en EE. UU.).
- Dependencia de la versión exacta de scikit-learn (1.6.1) para cargar el `.pkl`; versiones distintas pueden romper la deserialización.
- El repositorio ocupa 1,4 GB pese a que el modelo real es de pocos megabytes, lo que sugiere artefactos no documentados y dificulta la auditoría.

## Enlaces

- HuggingFace: https://huggingface.co/Muh340/healthcare-symptoms-disease-classifier
- Dataset de Kaggle: https://www.kaggle.com/datasets/kundanbedmutha/healthcare-symptomsdisease-classification-dataset
- Documentación de scikit-learn: https://scikit-learn.org/stable/
- Documentación de joblib: https://joblib.readthedocs.io/
