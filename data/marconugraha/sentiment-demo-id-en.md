# MarcoNugraha/sentiment-demo-id-en

## Resumen

El modelo `MarcoNugraha/sentiment-demo-id-en` es un clasificador de sentimiento bilingüe (indonesio e inglés) publicado por el usuario MarcoNugraha en Hugging Face. No se trata de un modelo de lenguaje neuronal, sino de un pipeline clásico de `scikit-learn` que combina vectorización TF-IDF (n-gramas de palabra y de carácter) con una regresión logística multinomial. Su propósito declarado es servir como demostración ligera y didáctica, no como sistema de producción.

El modelo se distribuye en dos artefactos: un `model.joblib` para inferencia en Python y un `model_weights.json` con los vocabularios, IDF y coeficientes exportados para ejecutar la inferencia directamente en el navegador o en un Hugging Face Static Space. Está entrenado sobre un conjunto muy reducido de 150 frases balanceadas entre ambos idiomas y reporta una accuracy de validación cruzada estratificada de 5 folds de 95,33 % ± 2,67 %.

Su relevancia es limitada fuera del ámbito de la demo: el tamaño del repositorio es de 0,0 GB, no tiene descargas ni likes, y la propia model card lo etiqueta como "demo". Resulta útil como referencia para entender el flujo TF-IDF + regresión logística y para desplegar un clasificador trivial en el navegador sin dependencias de GPU, pero no es adecuado para tareas de sentimiento reales por su escasez de datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline `scikit-learn`: `FeatureUnion[TfidfVectorizer]` + `LogisticRegression` |
| Parametros totales | no disponible (coeficientes de regresión logística sobre vocabulario TF-IDF; no se reporta el número exacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TF-IDF sobre n-gramas; sin ventana de contexto definida) |
| Tipos de cuantizacion | no disponible (no aplica; modelo clásico, no neuronal) |
| Idiomas soportados | indonesio (id) e inglés (en) |
| Licencia | MIT |
| Formato de pesos | `model.joblib` (scikit-learn 1.6.1) y `model_weights.json` (pesos portables para inferencia en navegador) |

## Arquitectura y entrenamiento

La arquitectura es un pipeline clásico de procesamiento de lenguaje natural: un `FeatureUnion` que concatena dos `TfidfVectorizer` (uno sobre n-gramas de palabra y otro sobre n-gramas de carácter) y una `LogisticRegression` multinomial con tres clases (Negativo, Neutro, Positivo). No hay capas neuronales, atención ni embeddings aprendidos; la representación se basa enteramente en estadísticas de frecuencia de términos.

El entrenamiento se realizó sobre 150 frases balanceadas entre indonesio e inglés, según indica la model card. La métrica reportada es una accuracy de validación cruzada estratificada de 5 folds de 95,33 % ± 2,67 %. No se documenta el uso de RLHF, DPO ni técnicas de alineación, algo esperable en un modelo de esta familia. Tampoco se detalla la composición exacta del dataset ni el proceso de anotación.

## Capacidades

- Clasificación de sentimiento en tres clases: Negativo, Neutro y Positivo.
- Soporte bilingüe para indonesio e inglés en una misma pipeline.
- Inferencia en Python mediante `joblib` y `scikit-learn`.
- Inferencia en navegador o Hugging Face Static Space mediante `model_weights.json`, sin necesidad de backend.
- Salida de probabilidades por clase mediante `predict_proba`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión, audio ni otras capacidades multimodales.
- No genera texto: es exclusivamente un clasificador.

## Casos de uso

- Demo educativa de clasificación de sentimiento: el modelo sirve para ilustrar en un taller o tutorial cómo se construye un pipeline TF-IDF + regresión logística y cómo se exporta a JSON para inferencia en el navegador.
- Prototipado rápido de un Space en Hugging Face: gracias a `model_weights.json`, se puede desplegar un Space estático sin backend ni GPU, útil para validar la interfaz de usuario antes de invertir en un modelo real.
- Filtrado preliminar de reseñas en indonesio e inglés en un prototipo interno: con 150 frases de entrenamiento, solo es viable como prueba de concepto, no como filtro en producción.
- Ejercicio académico de comparación de enfoques: permite contrastar un modelo clásico de bolsa de palabras frente a un transformer preentrenado en la misma tarea, midiendo la brecha de rendimiento con un conjunto de datos mínimo.
- Test de integración de `scikit-learn` en pipelines de CI/CD: al ser un artefacto `joblib` pequeño, resulta cómodo para verificar el flujo de carga y predicción en un pipeline de pruebas.
- Enseñanza de bilingüismo en NLP: ilustra cómo un mismo vocabulario TF-IDF puede cubrir dos idiomas sin tokenizador específico, mostrando las limitaciones de este enfoque frente a modelos multilingües neuronales.
- Verificación de despliegue en el navegador: sirve como caso de prueba para validar la carga de un JSON de pesos y la ejecución de la lógica de inferencia en JavaScript.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Accuracy (5-Fold Stratified CV) | 95,33 % ± 2,67 % |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible. La única métrica reportada es la accuracy de validación cruzada sobre el conjunto de 150 frases, que por su tamaño tiene un intervalo de confianza amplio y no es comparable con benchmarks estándar de la industria.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB (modelo clásico, se ejecuta en CPU).
- GPU recomendadas: no aplica; no requiere GPU.
- Cabe en cualquier GPU consumer: sí, y también en CPU y en navegador.
- Opciones de despliegue: Python con `scikit-learn` y `joblib`; Hugging Face Static Space con `model_weights.json`; cualquier entorno que ejecute JavaScript para la variante en navegador. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo neuronal.
- Latencia y throughput estimados: no disponibles de forma oficial; por la naturaleza del modelo (TF-IDF + regresión logística sobre 150 frases de entrenamiento), la latencia por predicción es del orden de microsegundos a milisegundos en CPU, y el throughput es muy alto, aunque no se han publicado cifras concretas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MarcoNugraha/sentiment-demo-id-en | TF-IDF + LogisticRegression | no disponible | no aplica | id, en | MIT | Hugging Face |
| Alternativas de sentimiento indonesio basadas en transformers (p. ej. modelos IndoBERT fine-tuned) | Transformer | cientos de millones | 512 tokens típicamente | id | variable | Hugging Face |
| Alternativas de sentimiento multilingüe basadas en XLM-R | Transformer | ~270M | 512 tokens típicamente | multilingüe | variable | Hugging Face |

No se dispone de datos de benchmarks comparativos en la información proporcionada para establecer una comparación cuantitativa con alternativas. La comparación cualitativa se limita a señalar que los modelos transformer fine-tuned para sentimiento en indonesio o multilingües suelen entrenarse sobre decenas de miles de ejemplos y ofrecen mejor generalización, a costa de requerir GPU y un tamaño de artefacto mucho mayor.

## Limitaciones y advertencias

- Entrenado con solo 150 frases: la generalización es muy limitada y la accuracy reportada no es representativa de un uso real.
- Sesgos conocidos: no documentados, pero un corpus tan pequeño y presumiblemente sintético o curado a mano puede reflejar sesgos del autor en la selección de ejemplos.
- Riesgo de alucinación: no aplica en sentido estricto (no genera texto), pero sí puede producir clasificaciones erróneas con alta confianza en textos fuera de dominio.
- Limitaciones de idioma: solo indonesio e inglés; no cubre español ni otras lenguas, y no se documenta el comportamiento con code-switching o variantes dialectales.
- Restricciones de licencia: licencia MIT, permite uso comercial y modificación con atribución; aun así, la calidad del modelo hace desaconsejable su uso en producción.
- Caveat importante para producción: la model card lo etiqueta explícitamente como "demo"; no debe desplegarse en sistemas que tomen decisiones sobre usuarios reales sin un reentrenamiento con datos representativos y una evaluación rigurosa.
- Sin mantenimiento aparente: 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/MarcoNugraha/sentiment-demo-id-en
- Live Demo Space: https://huggingface.co/spaces/MarcoNugraha/sentiment-demo-space
