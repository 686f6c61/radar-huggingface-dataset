# gavinlaw/multimodal-understanding-muirbench-text-probes

## Resumen

MuirBench text-only answerability probes es un conjunto de tres clasificadores binarios ligeros (TF-IDF más regresión logística L2) publicados por el usuario `gavinlaw`. No es un modelo generativo ni un modelo de visión-lenguaje: su única función es predecir si la opción correcta de una pregunta de elección múltiple de MuirBench es literalmente `None of the choices provided`. Es decir, mide la "answerabilidad" textual de un ítem, no la respuesta sustantiva.

El artefacto se distribuye como tres ficheros `joblib` (`question.joblib`, `options.joblib` y `prompt.joblib`), cada uno con un vectorizador, un modelo y un campo de entrada asociado. Se entrenó exclusivamente con 1.096 ejemplos de entrenamiento y 456 de desarrollo del benchmark MuirBench; no se calcularon predicciones ni métricas de test. La partición se hizo por hash para evitar fugas entre grupos de contrapartida (counterpart) e imagen RGB compartida.

Su relevancia es metodológica: sirve como sonda diagnóstica para auditar si un benchmark multimodal de comprensión es respondible sin imagen. La precisión binaria de estas sondas no es comparable con la precisión de QA de elección múltiple de un VLM completo, y el autor lo advierte explícitamente. La licencia es mixta (`mixed-source-terms`), heredada de las fuentes upstream de MuirBench.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-IDF + regresion logistica L2 (tres sondas independientes) |
| Parametros totales | no disponible (coeficientes de regresion logistica; el tamano depende del vocabulario TF-IDF) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TF-IDF sobre la cadena completa de pregunta/opciones; sin ventana definida) |
| Tipos de cuantizacion | no aplica (artefactos `joblib` de scikit-learn) |
| Idiomas soportados | no disponible (el benchmark MuirBench es predominantemente en ingles, pero la model card no lo declara) |
| Licencia | `mixed-source-terms` (terminos mixtos de las fuentes upstream, con componentes NC/SA) |
| Formato de pesos | `joblib` (tres ficheros: `question.joblib`, `options.joblib`, `prompt.joblib`) |

## Arquitectura y entrenamiento

Cada sonda es un pipeline clásico de procesamiento de lenguaje natural: vectorización TF-IDF seguida de una regresión logística con regularización L2. Las tres variantes difieren en la entrada de texto: `question` usa la cadena de la pregunta original; `options` concatena las opciones separadas por saltos de línea; `prompt` construye una plantilla con `Question: `, la pregunta, `\nChoices:\n` y cada opción precedida de `(A) `. Los marcadores de imagen originales se conservan como texto.

El entrenamiento se congeló con un ajuste único sobre el conjunto de train: el vocabulario y los coeficientes se fijan solo con train, sin selección de hiperparámetros sobre dev. Se usaron 1.096 ejemplos de train y 456 de dev del snapshot `MUIRBENCH/MUIRBENCH` en el commit `4c393cffc985c77d28de3b9045e2e5186920df80`, con partición por hash de grupos de contrapartida e imagen RGB compartida. No hay entrenamiento de parámetros de VLM, no se usan imágenes, no hay RL ni se propone un método nuevo. El umbral de decisión congelado es estrictamente mayor que 0,5, y la probabilidad de la clase `True` significa que `None` es la opción correcta.

## Capacidades

- Clasificación binaria de answerabilidad: predice si la respuesta correcta de un ítem de MuirBench es `None of the choices provided`.
- Tres vistas de entrada complementarias: pregunta sola, opciones concatenadas y prompt completo con plantilla.
- Diagnóstico de benchmarks multimodales: permite estimar si un ítem es respondible solo con texto, sin acceder a la imagen.
- Reproducibilidad auditada: incluye `audit_muir_text.py` para reproducir el entrenamiento desde el manifiesto de entrada fijado y `analyze_muir.py` para intervalos bootstrap por componente.
- Metadatos de evaluación: `evaluation.json` registra métricas de train/dev y hashes de código; `manifest.json` identifica el código de generación y las sumas de verificación de ficheros.
- Cotas superiores diagnósticas: incluye techos de muestra finita para prompts idénticos, que son cotas diagnósticas, no resultados predictivos aprendidos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto.

## Casos de uso

- Auditoría de sesgo textual en benchmarks multimodales: aplicar las tres sondas sobre los ítems de MuirBench para detectar qué fracción de preguntas se puede resolver sin imagen, usando la vista `prompt` como aproximación al enunciado completo que vería un VLM.
- Control de calidad de datasets de evaluación: antes de publicar un benchmark de QA multimodal, ejecutar las sondas y revisar los ítems con alta probabilidad de `None` para decidir si requieren reformulación o eliminación.
- Análisis de ablación sin visión: comparar la precisión de las sondas con la de un VLM completo sobre el mismo subconjunto para cuantificar cuánto aporta realmente la imagen a la tarea.
- Reproducción de experimentos diagnósticos: usar `audit_muir_text.py` con el manifiesto fijado para regenerar los artefactos y verificar hashes, útil en revisiones de papers o replicaciones.
- Estimación de intervalos de confianza: emplear `analyze_muir.py` para obtener intervalos bootstrap por componente y reportar la incertidumbre de las tasas de answerabilidad en publicaciones.
- Filtrado previo en pipelines de evaluación: integrar las sondas como paso barato (scikit-learn, sin GPU) que marque ítems sospechosos antes de lanzar inferencia costosa con VLMs.
- Docencia e investigación en metodología de evaluación: ejemplo mínimo y reproducible de cómo auditar un benchmark con un clasificador lineal y particiones por hash de grupos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que las predicciones y métricas de test no se calcularon, y que la precisión binaria de estas sondas no es comparable con la precisión de QA de elección múltiple de un VLM completo. `evaluation.json` contiene métricas de train/dev, pero sus valores no se reproducen en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB en GPU; la inferencia es en CPU con scikit-learn.
- GPU recomendadas: no aplica; no se requiere GPU.
- Cabe en cualquier equipo consumer: el repositorio ocupa 0,0 GB y los artefactos son ficheros `joblib` de un clasificador lineal.
- Opciones de despliegue: carga directa con `joblib.load` y uso de `vectorizer.transform` seguido de `model.predict_proba`; no requiere vLLM, llama.cpp, Ollama ni TGI.
- Dependencias fijadas: scikit-learn 1.7.2, numpy 2.3.4, scipy 1.17.1 y joblib 1.6.0.
- Latencia y throughput: no disponibles en la información proporcionada; por la naturaleza del modelo (TF-IDF más regresión logística) el coste por ejemplo es de milisegundos en CPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de sondas diagnósticas de answerabilidad textual para benchmarks multimodales. Como referencia conceptual, un clasificador lineal TF-IDF es cualitativamente distinto de un VLM de QA de elección múltiple, por lo que una comparación directa de precisión no sería válida.

## Limitaciones y advertencias

- No predice la respuesta sustantiva: solo estima si `None of the choices provided` es la opción correcta; no debe usarse como sistema de QA.
- Precisión binaria no comparable con la precisión de QA de elección múltiple de un VLM; el autor lo advierte de forma explícita.
- Sin métricas de test: solo se usaron 1.096 ejemplos de train y 456 de dev; las predicciones y métricas de test no se calcularon.
- Sin selección de hiperparámetros sobre dev: el ajuste está congelado sobre train, lo que puede infraoptimizar el rendimiento.
- Sesgos de dominio y idioma: entrenado sobre un snapshot concreto de MuirBench; no se declaran idiomas soportados ni se garantiza generalización fuera de ese benchmark.
- Licencia restrictiva: `mixed-source-terms` con componentes NC/SA de las fuentes upstream; el uso comercial puede estar limitado y requiere revisar el Apéndice F del paper de origen.
- No se redistribuyen imágenes ni filas de preguntas originales; solo se suministran parámetros de sonda y metadatos de evaluación para investigación bajo los términos upstream aplicables.
- Riesgo de seguridad en la carga: solo debe cargarse un artefacto `joblib` de fuente fiable, ya que la deserialización de `joblib` puede ejecutar código arbitrario.
- Los recuentos brutos de cambios en contrapartidas reflejan diferencias de cadena u orden de imágenes (permutaciones de opciones o imágenes) y no categorías semánticas de edición del paper original.
- Los techos de muestra finita para prompts idénticos son cotas superiores diagnósticas, no resultados predictivos aprendidos.

## Enlaces

- Hugging Face: https://huggingface.co/gavinlaw/multimodal-understanding-muirbench-text-probes
- Paper de origen (Apéndice F, términos de licencia): https://arxiv.org/html/2406.09411v1
- Snapshot del benchmark: `MUIRBENCH/MUIRBENCH` en el commit `4c393cffc985c77d28de3b9045e2e5186920df80` (no se proporciona URL directa en la información disponible)
