# ajrayman/Adventurousness_continuous

## Resumen

Adventurousness_continuous es un modelo de clasificación de texto (regresión continua) desarrollado por ajrayman, que consiste en un fine-tuning de RoBERTa-base para predecir un valor numérico que representa el nivel de "aventurerismo" (búsqueda de aventura) de un texto de entrada. El modelo se publicó en agosto de 2024 bajo licencia MIT y está disponible en Hugging Face con pesos en formato safetensors. Aunque la model card es muy escasa y no especifica el dataset de entrenamiento ni los idiomas soportados, el modelo base RoBERTa-base está entrenado principalmente en inglés, por lo que se asume que el fine-tuning se realizó sobre textos en ese idioma.

Con 124,6 millones de parámetros y una ventana de contexto de 512 tokens, este modelo está pensado para tareas de análisis de rasgos de personalidad a partir de texto, un campo con aplicaciones en psicología, investigación de mercado y análisis de contenido. Su relevancia radica en ser un ejemplo de fine-tuning especializado sobre un modelo transformer ampliamente utilizado, aunque su utilidad práctica queda limitada por la falta de documentación sobre los datos de entrenamiento y la ausencia de benchmarks comparativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa-base (Transformer encoder) |
| Parametros totales | 124.646.401 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base RoBERTa-base está entrenado principalmente en inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura RoBERTa-base, un transformer encoder de 12 capas con 768 dimensiones ocultas y 12 cabezas de atención, preentrenado con masked language modeling sobre un corpus masivo en inglés. Sobre esta base se realizó un fine-tuning para una tarea de regresión, donde la salida es un valor continuo (probablemente una puntuación de aventurerismo). La capa de clasificación original de RoBERTa se sustituyó por una cabeza de regresión con una única neurona de salida.

El entrenamiento se llevó a cabo con los siguientes hiperparámetros: learning rate de 2e-5, batch size de 32, 8 épocas, optimizador Adam con betas (0.9, 0.999), scheduler lineal con warmup del 6% y semilla 1234. Según la model card, el dataset de entrenamiento se denomina "None", lo que sugiere que no se especificó correctamente en el proceso de generación automática. No se menciona el uso de técnicas como RLHF o DPO, ni innovaciones arquitectónicas adicionales. Los resultados de evaluación muestran una pérdida de 0.0472, RMSE de 0.2172, MAE de 0.1748 y correlación de 0.1882, lo que indica un ajuste moderado pero con baja correlación entre las predicciones y las etiquetas reales.

## Capacidades

- Predicción de un valor numérico continuo que representa el nivel de "aventurerismo" de un texto de entrada.
- Clasificación de texto de tipo regresión, no generativa.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso.
- Capacidades multilingües no documentadas; se asume que funciona principalmente en inglés por el modelo base.
- No dispone de modo de pensamiento, visión ni audio.

## Casos de uso

- Investigación en psicología: los investigadores pueden usar el modelo para puntuar automáticamente respuestas abiertas de cuestionarios de personalidad, asignando una puntuación continua de aventurerismo a cada texto. Su tamaño reducido permite ejecutarlo en entornos de investigación sin GPU dedicadas.
- Análisis de contenido en redes sociales: se puede aplicar a publicaciones de Twitter, Reddit o foros para medir el nivel de búsqueda de aventura en diferentes comunidades o perfiles, útil para estudios sociológicos o de marketing.
- Perfilado de usuarios en plataformas de recomendación: un sistema podría inferir el grado de aventurerismo de un usuario a partir de sus reseñas o comentarios, y usar esa puntuación para recomendar experiencias (viajes, deportes de riesgo, etc.).
- Análisis de narrativas en medios: en el ámbito editorial o de entretenimiento, se puede analizar guiones o sinopsis para clasificar su nivel de aventura, ayudando en la categorización de contenidos.
- Evaluación de respuestas en encuestas abiertas: en estudios de mercado, el modelo puede procesar respuestas a preguntas abiertas sobre preferencias de ocio y asignar una puntuación de aventurerismo, facilitando el análisis cuantitativo.
- Herramientas educativas de autoconocimiento: se podría integrar en aplicaciones de desarrollo personal que pidan al usuario describir sus intereses y devuelvan una puntuación de aventurerismo, aunque con las limitaciones de precisión que muestra la correlación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo reporta métricas de evaluación en el conjunto de validación durante el entrenamiento, que se resumen en la siguiente tabla:

| Metrica | Valor |
|---|---|
| Loss | 0.0472 |
| RMSE | 0.2172 |
| MAE | 0.1748 |
| Correlacion | 0.1882 |

Estos valores indican un error absoluto medio bajo, pero una correlación muy débil entre las predicciones y las etiquetas reales, lo que sugiere que el modelo tiene una capacidad predictiva limitada. No se proporcionan comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 124,6 millones de parámetros. En FP32, los pesos ocupan aproximadamente 500 MB, por lo que cabe en cualquier GPU con al menos 1 GB de VRAM. En FP16, el uso se reduce a unos 250 MB.
- GPU recomendadas: cualquier GPU moderna, incluidas las de gama de consumo como RTX 3060, RTX 4090, o incluso GPUs integradas. También puede ejecutarse en CPU con razonable velocidad para inferencia por lotes.
- Compatibilidad con consumer GPU: sí, es totalmente viable en GPUs de consumo.
- Opciones de despliegue: al ser un modelo de transformers estándar, se puede servir con Hugging Face Transformers, vLLM (aunque no es óptimo para clasificación), o mediante ONNX Runtime. También se puede exportar a formato GGUF para ejecutarlo con llama.cpp, aunque no es habitual para modelos encoder.
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna, la inferencia de un solo texto de hasta 512 tokens debería completarse en milisegundos.

## Comparativa con modelos similares

El autor ha publicado otros modelos de la misma serie, todos basados en RoBERTa-base y con la misma tarea de regresión para diferentes rasgos de personalidad. No se dispone de datos de rendimiento comparativo entre ellos.

| Modelo | Parametros | Contexto | Licencia | Tarea |
|---|---|---|---|---|
| Adventurousness_continuous | 124,6 M | 512 | MIT | Regresion de aventurerismo |
| Excitement_Seeking_continuous | 124,6 M (estimado) | 512 | MIT | Regresion de busqueda de emociones |
| machiavellianism_continuous | 124,6 M (estimado) | 512 | MIT | Regresion de maquiavelismo |

No se dispone de información sobre otros modelos comparables de la misma categoría fuera de esta serie.

## Limitaciones y advertencias

- La model card no especifica el dataset de entrenamiento, lo que impide evaluar la calidad y representatividad de los datos. El nombre "None" sugiere que el dataset no se documentó correctamente.
- La correlación de 0.1882 en el conjunto de validación es muy baja, lo que indica que el modelo tiene una capacidad predictiva débil y puede no ser fiable para aplicaciones críticas.
- No se documentan sesgos específicos, pero al estar basado en RoBERTa-base, puede heredar sesgos de género, raza o cultura presentes en los datos de preentrenamiento.
- Riesgo de alucinación no aplica, ya que no es un modelo generativo.
- Limitaciones de idioma: no se especifican idiomas soportados; se asume que funciona mejor en inglés, y su rendimiento en otros idiomas es desconocido.
- La licencia MIT permite uso comercial, pero la falta de documentación sobre los datos de entrenamiento puede plantear problemas legales si se usan datos con derechos de autor.
- Para producción, se recomienda validar el modelo en el dominio específico antes de desplegarlo, dado su bajo rendimiento correlacional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ajrayman/Adventurousness_continuous
- Modelo relacionado (Excitement_Seeking_continuous): https://huggingface.co/ajrayman/Excitement_Seeking_continuous
- Modelo relacionado (machiavellianism_continuous): https://huggingface.co/ajrayman/machiavellianism_continuous

No se han encontrado papers, repositorios de código ni demos asociados a este modelo.
