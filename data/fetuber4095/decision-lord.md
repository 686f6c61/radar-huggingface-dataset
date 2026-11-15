# fetuber4095/decision-lord

## Resumen

`decision-lord` es un clasificador ligero de preguntas de opción múltiple (A/B/C/D) en portugués, publicado por el usuario `fetuber4095` en Hugging Face. No se trata de un modelo de lenguaje neuronal, sino de un pipeline clásico de scikit-learn que combina un vectorizador TF-IDF con una regresión logística. Resuelve una tarea muy acotada: dada una pregunta y cuatro opciones, puntuar cada par pregunta-opción y seleccionar la de mayor probabilidad.

El modelo se distribuye como un artefacto `joblib` (`modelo_abcd.joblib`) generado por el script `train.py` incluido en el repositorio. El dataset de entrenamiento (`dados.csv`) contiene únicamente 51 preguntas de ejemplo, lo que se traduce en 204 muestras en el formato `pergunta: ... | opcao: ...`. El autor reconoce explícitamente que la generalización es limitada y que el modelo no constituye un LLM.

Su relevancia es fundamentalmente didáctica: sirve como ejemplo mínimo reproducible de un clasificador de opción múltiple que se ejecuta en CPU, sin GPU, con un consumo de memoria mínimo. No debe confundirse con un modelo generativo ni emplearse para razonamiento abierto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline scikit-learn: `TfidfVectorizer` + `LogisticRegression` |
| Parámetros totales | no disponible (modelo lineal; el número de coeficientes depende del vocabulario TF-IDF aprendido) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TF-IDF no tiene ventana de contexto; depende de la tokenización del vectorizador) |
| Tipos de cuantización | no aplica (no hay pesos neuronales; el artefacto es un `joblib` con matrices dispersas y coeficientes en coma flotante) |
| Idiomas soportados | portugués (pt) |
| Licencia | Apache-2.0 |
| Formato de pesos | `joblib` (`.joblib`), no safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es un clasificador lineal binario sobre representación TF-IDF. Cada pregunta se descompone en cuatro pares textuales con el formato `pergunta: <pregunta> | opcao: <opción>`, etiquetados como 1 (opción correcta) o 0 (opción incorrecta). El `TfidfVectorizer` aprende un vocabulario a partir de esos pares y la `LogisticRegression` ajusta coeficientes para puntuar la verosimilitud de que una opción sea la correcta. En inferencia se evalúan las cuatro opciones y se selecciona la de mayor `predict_proba`.

No hay datos publicados sobre número de tokens de entrenamiento, composición del corpus ni procesos de RLHF/DPO, ya que no se trata de un modelo neuronal. El dataset es explícitamente pequeño: 51 preguntas y 204 muestras de entrenamiento. El autor indica que ampliar a 200-500 preguntas produciría una mejora sustancial. No se documentan innovaciones técnicas como decodificación especulativa o atención lineal, porque el modelo no emplea mecanismos de atención.

## Capacidades

- Clasificación de preguntas de opción múltiple con cuatro alternativas (A/B/C/D) en portugués.
- Puntuación de verosimilitud por opción mediante `predict_proba`, lo que permite inspeccionar los scores de las cuatro alternativas y no solo la etiqueta ganadora.
- Ejecución en CPU con consumo de RAM muy bajo, sin requisitos de GPU.
- Entrenamiento incremental sencillo: el menú `interactive.py` permite añadir preguntas, retrenar y probar.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agéntico.
- No dispone de modo thinking, visión, audio ni otras capacidades multimodales.
- Capacidad multilingüe limitada al portugués; no se documenta soporte para otras lenguas.

## Casos de uso

- Prototipado educativo de clasificadores de opción múltiple: sirve para demostrar el flujo completo TF-IDF + regresión logística en un cuaderno o script, con un dataset mínimo y reproducible en CPU.
- Generación de exámenes tipo test con corrección automática en dominios muy acotados: si el estilo de las preguntas coincide con el del conjunto de entrenamiento, el modelo puede puntuar opciones y seleccionar la correcta sin infraestructura de GPU.
- Filtro previo de opciones plausibles en pipelines de evaluación: dado su bajo coste, puede usarse como primer descarte de alternativas antes de invocar un modelo mayor como BERTimbau.
- Baseline de referencia en experimentos de clasificación de preguntas: permite comparar el rendimiento de modelos neuronales frente a un enfoque lineal clásico sobre el mismo dataset.
- Herramienta de anotación asistida: al mostrar los scores por opción, un anotador humano puede revisar y corregir las predicciones, alimentando el bucle de reentrenamiento con `interactive.py`.
- Despliegue en entornos con recursos muy restringidos (Raspberry Pi, contenedores mínimos, funciones serverless): el artefacto `joblib` y la inferencia en CPU permiten servir el clasificador sin dependencias pesadas.
- Ejercicio de docencia sobre limitaciones de TF-IDF: el propio autor lo plantea como contraste frente a modelos con comprensión semántica profunda, útil para ilustrar cuándo un enfoque clásico es insuficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB; el modelo se ejecuta íntegramente en CPU.
- GPU recomendadas: ninguna; no requiere GPU.
- Cabe en cualquier GPU consumer, pero no la aprovecha; el cuello de botella es la CPU y la RAM del sistema.
- RAM estimada: muy baja (el repositorio ocupa 0.0 GB y el artefacto `joblib` contiene matrices dispersas y coeficientes lineales).
- Opciones de despliegue: scripts Python con `joblib` y scikit-learn; no aplica vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo neuronal.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por la naturaleza del pipeline, la latencia por consulta es del orden de milisegundos en CPU, aunque no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `decision-lord` | TF-IDF + regresión logística | no disponible (lineal) | no aplica | pt | Apache-2.0 | Hugging Face, artefacto `joblib` |
| BERTimbau (mencionado por el autor como alternativa) | Transformer encoder | no disponible en la información | no disponible en la información | pt | no disponible en la información | Hugging Face |
| LLM genérico de gran tamaño (mencionado por el autor como alternativa) | Transformer decoder | no disponible en la información | no disponible en la información | multilingüe | no disponible en la información | no disponible en la información |

La comparación cuantitativa con alternativas no está disponible: no se han publicado métricas de `decision-lord` ni de los modelos de referencia en la información proporcionada. La diferencia cualitativa es clara: `decision-lord` es un clasificador lineal de coste mínimo, mientras que BERTimbau y los LLM genéricos requieren GPU y ofrecen comprensión semántica profunda.

## Limitaciones y advertencias

- El dataset de entrenamiento es mínimo (51 preguntas, 204 muestras), por lo que la generalización es muy limitada y el modelo probablemente fallará ante estilos de pregunta distintos a los de entrenamiento.
- No es un LLM: no genera texto, no razona de forma abierta y no debe emplearse para preguntas abiertas o tareas de razonamiento complejo.
- TF-IDF captura patrones léxicos, no semántica profunda; preguntas con paráfrasis o vocabulario fuera del vocabulario aprendido degradarán el rendimiento.
- No se documentan sesgos específicos, pero al entrenarse sobre un conjunto tan reducido puede reflejar los sesgos de las 51 preguntas de ejemplo.
- Riesgo de alucinación en sentido estricto no aplica (no genera texto), pero sí puede seleccionar opciones incorrectas con alta confianza si la distribución de entrada difiere de la de entrenamiento.
- Soporte exclusivamente en portugués; no se documenta funcionamiento en otras lenguas.
- Licencia Apache-2.0: permite uso comercial y modificación, pero el autor no ofrece garantías sobre el rendimiento en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- El artefacto `modelo_abcd.joblib` debe generarse ejecutando `train.py`; no se distribuye como peso preentrenado listo para usar en el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fetuber4095/decision-lord
