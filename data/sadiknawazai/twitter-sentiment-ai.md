# SadikNawazAI/twitter-sentiment-ai

## Resumen

Feelings (publicado como `SadikNawazAI/twitter-sentiment-ai`) es un clasificador de sentimiento en tuits entrenado desde cero por el usuario SadikNawazAI. No se apoya en ningún modelo preentrenado: emplea una arquitectura de red neuronal convolucional (CNN) para texto implementada en PyTorch, junto con un tokenizador de vocabulario propio. La tarea declarada es `text-classification` y el modelo devuelve una de cuatro etiquetas: Negative, Neutral, Positive o Irrelevant.

El modelo es relevante únicamente como ejemplo didáctico de pipeline de clasificación de texto construido íntegramente desde cero, no como una alternativa a clasificadores basados en transformers preentrenados. El repositorio no incluye model card detallada, resultados de evaluación, información sobre el dataset de entrenamiento ni especificación de licencia, y en el momento de la consulta registra 0 descargas y 0 likes.

Por su naturaleza (CNN sin pesos preentrenados, vocabulario propio y ausencia de documentación de rendimiento), debe considerarse un artefacto experimental de alcance limitado, adecuado para prototipos o aprendizaje, pero no para producción sin una evaluación previa exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN para clasificación de texto (implementación propia en PyTorch) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Checkpoint PyTorch (`.pt`): `feelings_model.pt`, `best_model.pt` |

## Arquitectura y entrenamiento

La model card indica que se trata de una CNN para clasificación de texto, entrenada desde cero ("from scratch") sin pesos preentrenados, con un tokenizador de vocabulario personalizado. El repositorio incluye `model.py` (definición de la red), `inference.py` (implementación de predicción), `feelings_model.pt` (checkpoint completo) y `best_model.pt` (mejores pesos), además de `requirements.txt`.

No se proporciona información sobre el volumen de datos de entrenamiento, la composición del corpus de tuits, el número de tokens procesados, la técnica de optimización, ni si se aplicó algún tipo de ajuste fino supervisado, RLHF o DPO. Tampoco se detalla la dimensión de los embeddings, el número de filtros convolucionales, el tamaño de los kernels ni la estrategia de pooling. Toda esta información figura como no disponible.

## Capacidades

- Clasificación de texto en cuatro categorías: Negative, Neutral, Positive e Irrelevant.
- Diseñado específicamente para texto de Twitter (tuits), según la model card y las etiquetas del repositorio.
- Inferencia mediante el script `inference.py` incluido en el repositorio.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües; el idioma de entrenamiento no está especificado.
- No se documentan capacidades de visión, audio ni modo de razonamiento (thinking mode).

## Casos de uso

- Análisis de sentimiento en redes sociales: el modelo puede clasificar tuits en las cuatro categorías declaradas, útil para monitorización de opinión pública a pequeña escala, siempre que se valide previamente su precisión con datos propios.
- Filtrado de contenido irrelevante: la etiqueta "Irrelevant" permite descartar mensajes que no aportan señal en un pipeline de análisis, por ejemplo antes de un paso de agregación de sentimiento.
- Prototipado rápido de pipelines de NLP: al ser un modelo pequeño entrenado desde cero con scripts de inferencia incluidos, sirve como base para experimentar con preprocesado de texto y clasificación en entornos docentes.
- Moderación de comentarios en comunidades: clasificación preliminar de mensajes negativos para revisión humana, con la advertencia de que requiere validación de sesgos y falsos positivos.
- Investigación sobre modelos ligeros: útil para comparar el rendimiento de una CNN desde cero frente a transformers preentrenados en tareas de clasificación de sentimiento, como línea base (baseline).
- Análisis de campañas en Twitter: agregación de sentimiento por periodo o por término de búsqueda, integrando el modelo en un script de recolección y clasificación por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; al ser una CNN de texto entrenada desde cero, el tamaño del checkpoint es presumiblemente reducido (el repositorio ocupa 0.0 GB según Hugging Face), pero no se confirma el número de parámetros.
- GPU recomendadas: no disponible; por la naturaleza del modelo, probablemente sea ejecutable en CPU, aunque no se documenta.
- Compatibilidad con GPU de consumo: no confirmada; no hay datos de tamaño de pesos que permitan estimarlo con rigor.
- Opciones de despliegue: únicamente inferencia mediante PyTorch y el script `inference.py` proporcionado; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a transformers, no a CNNs personalizadas).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Feelings (SadikNawazAI) | CNN desde cero | no disponible | no disponible | no disponible | Hugging Face, 0 descargas |
| Alternativas de clasificación de sentimiento basadas en transformers | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada; no se pueden establecer comparaciones cuantitativas fiables.

## Limitaciones y advertencias

- Ausencia total de datos de evaluación: no hay métricas de precisión, recall, F1 ni matriz de confusión, por lo que se desconoce su rendimiento real.
- Sin información sobre el dataset de entrenamiento: se desconoce el volumen, la procedencia, el idioma y el equilibrio de clases, lo que impide evaluar sesgos.
- Riesgo de sesgos desconocidos: al no documentarse la composición del corpus, no es posible identificar sesgos demográficos, geográficos o temáticos.
- Riesgo de alucinación no aplica en sentido estricto (es un clasificador, no un generador), pero sí existe riesgo de clasificaciones erróneas sin calibración documentada.
- Licencia no especificada: no se puede confirmar el uso comercial ni la redistribución; debe contactarse con el autor antes de cualquier uso en producción.
- Idiomas soportados no declarados: el modelo podría estar entrenado solo en inglés (por el contexto de Twitter), pero no se confirma.
- Longitud de contexto no documentada: se desconoce el número máximo de tokens que admite el tokenizador personalizado.
- Repositorio sin actividad: 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validación por parte de la comunidad.
- Formato de pesos propietario (`.pt`): requiere cargar la clase definida en `model.py`, lo que dificulta su integración con ecosistemas estándar de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SadikNawazAI/twitter-sentiment-ai
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
