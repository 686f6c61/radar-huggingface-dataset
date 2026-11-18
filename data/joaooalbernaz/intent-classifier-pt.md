# JOAOOALBERNAZ/intent-classifier-pt

## Resumen

`intent-classifier-pt` es un clasificador de intención de tickets en portugués publicado por el usuario JOAOOALBERNAZ en Hugging Face. No es un modelo de lenguaje neuronal, sino un pipeline clásico de procesamiento de lenguaje natural construido con scikit-learn: vectorización TF-IDF seguida de regresión logística. Su propósito declarado es servir como baseline educativo para tareas de clasificación de texto corto en portugués, no como componente de producción.

El modelo se entrenó con 60 textos sintéticos generados con fines didácticos, una muestra que no representa a usuarios reales ni cubre la variabilidad léxica de un dominio real de atención al cliente. La evaluación se realizó con una separación holdout estratificada del 25% y validación cruzada de 3 folds sobre el conjunto de entrenamiento, con semilla fija 42, obteniendo un Macro-F1 de 0,4933 en el holdout sintético.

Su relevancia actual es limitada y acotada al ámbito formativo: ilustra el flujo completo de un clasificador de intenciones (vectorización, entrenamiento, exportación con skops y evaluación), pero su tamaño de repositorio es de 0,0 GB, no registra descargas ni interacciones y no dispone de benchmarks públicos. Cualquier uso más allá de la demostración pedagógica requeriría reentrenamiento con datos reales y una evaluación rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-IDF + regresión logística (scikit-learn) |
| Parametros totales | no disponible (modelo lineal; el número de coeficientes depende del vocabulario TF-IDF, no documentado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TF-IDF no tiene ventana de contexto; depende de la tokenización y del vocabulario) |
| Tipos de cuantizacion | no aplica (no es un modelo neuronal; los coeficientes son floats estándar) |
| Idiomas soportados | portugués (pt) |
| Licencia | MIT |
| Formato de pesos | `model.skops` (serialización skops de scikit-learn) |

## Arquitectura y entrenamiento

La arquitectura es un pipeline clásico de dos etapas: un vectorizador TF-IDF que transforma el texto en una representación dispersa de frecuencias ponderadas y un clasificador de regresión logística que aprende fronteras lineales entre clases de intención. No hay capas de atención, embeddings contextuales ni mecanismos de razonamiento; la capacidad de generalización depende enteramente de la coincidencia de n-gramas entre entrenamiento e inferencia.

El entrenamiento se realizó sobre 60 textos sintéticos creados para fines didácticos, con una separación holdout estratificada del 25% y validación cruzada de 3 folds sobre el resto. La semilla fijada es 42. No se documenta el número de clases de intención, la composición del dataset, el vocabulario resultante, la estrategia de regularización ni si hubo ajuste de hiperparámetros. Tampoco se reporta ningún proceso de RLHF, DPO ni fine-tuning adicional, algo esperable en un modelo de esta naturaleza. El artefacto se exporta con skops, lo que permite cargarlo en Python con scikit-learn, aunque el autor advierte explícitamente de verificar tipos y origen del archivo antes de cargarlo.

## Capacidades

- Clasificación de texto corto en portugués: asigna una etiqueta de intención a un ticket o mensaje de entrada.
- Clasificación multi-clase mediante regresión logística (el número de clases no está documentado).
- Inferencia rápida y de bajo coste computacional, al tratarse de un modelo lineal sobre representación dispersa.
- Ejecución en CPU sin GPU, con dependencias limitadas a Python, scikit-learn y skops.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta generación de texto, código, matemáticas, visión ni audio.
- Capacidad multilingüe limitada al portugués declarado; no se documenta cobertura de otras lenguas.
- No dispone de modo de razonamiento (thinking mode) ni de capacidades especiales adicionales.

## Casos de uso

- Demostración docente de un pipeline de clasificación de texto: el modelo sirve para ilustrar en un curso o taller el flujo TF-IDF + regresión logística, desde la vectorización hasta la exportación con skops y la lectura de `metrics.json`.
- Prototipado rápido de etiquetado de tickets en portugués: permite validar el esquema de etiquetas y el formato de entrada antes de invertir en un modelo neuronal o en anotación humana.
- Baseline de comparación en experimentos académicos: ofrece una referencia lineal sencilla contra la que medir la mejora de modelos transformer en tareas de clasificación de intenciones en portugués.
- Prueba de integración de skops en un pipeline de MLOps: al ser un artefacto `model.skops`, permite ensayar la carga segura de modelos serializados en un servicio Python.
- Generación de datos de prueba en entornos de desarrollo: útil para poblar un endpoint de clasificación con respuestas deterministas mientras se construye la lógica de negocio.
- Ejercicio de auditoría de modelos: su model card documenta explícitamente las limitaciones (datos sintéticos, ausencia de evaluación humana, sin estimación de justicia), lo que lo convierte en un caso práctico para enseñar buenas prácticas de documentación.
- Filtrado preliminar en un flujo de atención al cliente interno: con reentrenamiento sobre datos reales y validación adecuada, la misma arquitectura podría servir como primera capa de triaje de bajo coste, aunque el artefacto publicado no es apto para ello tal cual.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| Macro-F1 (holdout) | 0,4933 | Holdout sintético estratificado (25%) de esta ejecución |
| Validación cruzada | 3 folds sobre el conjunto de entrenamiento | No se reporta el valor numérico de los folds |

No se han publicado resultados de benchmarks en la informacion disponible más allá del Macro-F1 indicado. No hay comparación con MMLU, HumanEval, GSM8K ni con otros modelos, y el propio autor advierte que el valor de 0,4933 mide únicamente un conjunto artificial pequeño y no comprueba desempeño en producción ni generalización a otros dominios.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB; el modelo se ejecuta en CPU.
- GPU recomendadas: no aplica; no requiere GPU.
- Cabe en cualquier GPU consumer y en cualquier CPU convencional; el cuello de botella es la memoria RAM para cargar el vocabulario TF-IDF y los coeficientes, de magnitud muy reducida (repositorio de 0,0 GB).
- Opciones de despliegue: Python con scikit-learn y skops; no es compatible con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos neuronales.
- Latencia y throughput estimados: no disponibles; al ser un modelo lineal sobre vectores dispersos, la latencia esperada es de milisegundos por petición en CPU, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad | Benchmarks publicados |
|---|---|---|---|---|---|---|
| intent-classifier-pt (JOAOOALBERNAZ) | TF-IDF + regresión logística | no disponible | no aplica | MIT | Hugging Face, 0 descargas | Macro-F1 0,4933 en holdout sintético |
| Clasificadores de intención con transformers en portugués (p. ej. BERTimbau fine-tuneado) | Transformer encoder | ~110 M típicamente | 512 tokens típicamente | varía según checkpoint | Hugging Face | no disponible en esta ficha |
| Baselines scikit-learn de clasificación de texto en portugués | TF-IDF + lineal/SVM | no disponible | no aplica | varía | Hugging Face / repositorios | no disponible en esta ficha |

No se dispone de datos verificados de benchmarks de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa de rendimiento queda como no disponible. La diferencia principal frente a alternativas neuronales es la ausencia de representaciones contextuales y la dependencia de coincidencia léxica.

## Limitaciones y advertencias

- Entrenado con 60 textos sintéticos: no representa a usuarios reales ni la variabilidad de un dominio de producción.
- Macro-F1 de 0,4933 en un holdout artificial pequeño; el autor advierte que no comprueba generalización a otros dominios.
- Sin evaluación humana, sin estimación de justicia y sin análisis de robustez.
- Cobertura lingüística limitada al portugués y a un vocabulario reducido; el rendimiento fuera del dominio de entrenamiento es impredecible.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas sistemáticas por dependencia de n-gramas.
- Sesgos conocidos: no documentados; la ausencia de análisis de sesgo es en sí una limitación relevante.
- Licencia MIT permite uso comercial, pero el autor indica explícitamente que no debe utilizarse como herramienta decisoria sensible.
- Al cargar `model.skops` conviene verificar tipos y origen del archivo, tal como advierte el autor, por el riesgo inherente a la deserialización de artefactos.
- No apto para producción sin reentrenamiento con datos reales anotados y una evaluación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JOAOOALBERNAZ/intent-classifier-pt
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.
