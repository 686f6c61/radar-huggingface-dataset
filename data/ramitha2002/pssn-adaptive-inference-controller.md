# ramitha2002/PSSN-Adaptive-Inference-Controller

## Resumen

El Adaptive Inference Controller es un clasificador auxiliar publicado por Ramitha Iddamalgoda (usuario `ramitha2002`) que no constituye un modelo de lenguaje, sino un componente de enrutamiento para la generación de resúmenes de artículos con un modelo Llama 3 8B modificado con salidas tempranas (early-exit). Dado el texto visible de un artículo y una profundidad de inferencia candidata (24, 28 o 32 capas), el controlador predice si esa profundidad cumple un objetivo binario definido en el estudio y decide qué número de capas usar durante la generación. Los pesos del modelo de lenguaje permanecen congelados; este repositorio solo contiene el artefacto `controller.joblib`.

Técnicamente es un pipeline de scikit-learn: extracción de características TF-IDF a nivel de palabra (unigramas y bigramas, hasta 20.000 features) y a nivel de carácter (`char_wb` de 3 a 5 gramos, hasta 20.000 features), concatenadas y alimentadas a una regresión logística con pesos de clase balanceados. Se entrenó sobre ejemplos artículo-profundidad derivados de CNN/DailyMail 3.0.0, usando las highlights de referencia únicamente para generar etiquetas offline, nunca como entrada del controlador.

Su relevancia es acotada pero interesante para investigación en eficiencia de inferencia: demuestra un enfoque de enrutamiento adaptativo de bajo coste (CPU, sin GPU) que puede reducir el cómputo en generación de resúmenes seleccionando la profundidad mínima que satisface el criterio de calidad aprendido, con un fallback a 32 capas cuando ningún candidato supera el umbral de 0,5. No es un modelo desplegable de forma autónoma ni genera texto por sí mismo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline scikit-learn: TF-IDF (palabra + carácter) + regresión logística balanceada |
| Parametros totales | No disponible (hasta 40.000 features TF-IDF; el clasificador logístico es de dimensionalidad reducida respecto a las features) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo Llama 3 8B subyacente; el controlador procesa el texto visible del artículo completo) |
| Tipos de cuantizacion | No aplica (artefacto joblib en CPU) |
| Idiomas soportados | Inglés (según la model card) |
| Licencia | No disponible |
| Formato de pesos | `controller.joblib` (serialización joblib de scikit-learn) |

## Arquitectura y entrenamiento

El controlador es un clasificador lineal sobre representaciones dispersas. Concretamente, concatena dos transformaciones TF-IDF: una a nivel de palabra con unigramas y bigramas limitada a 20.000 features, y otra a nivel de carácter con `char_wb` de 3 a 5 gramos también limitada a 20.000 features, ambas con escalado sublineal de frecuencia de término. La entrada incluye además un token que codifica la profundidad candidata (24, 28 o 32 capas). Sobre ese vector se aplica una regresión logística con pesos de clase balanceados, solver `lbfgs`, tope de 2.000 iteraciones y semilla 42. La búsqueda de hiperparámetros exploró C ∈ {0,1, 1, 10} y umbrales de enrutamiento ∈ {0,5, 0,7, 0,9, 1,1}, seleccionándose C = 1,0 y umbral = 0,5.

Los datos de entrenamiento provienen de CNN/DailyMail 3.0.0: se construyeron ejemplos artículo-profundidad y las highlights de referencia se usaron solo para la generación offline de etiquetas binarias y para evaluación. El controlador no emplea las highlights como features. El procedimiento de uso previsto recorre las profundidades candidatas en orden ascendente y selecciona la primera cuya probabilidad positiva predicha supere 0,5; si ninguna lo hace, se recurre a 32 capas. La profundidad elegida queda fija durante toda la generación. El cómputo del controlador es en CPU; el estudio reporta AMD MI300X como hardware del entorno, presumiblemente para el modelo de lenguaje, no para el controlador.

## Capacidades

- Clasificación binaria de calidad esperada para una tupla (texto de artículo, profundidad candidata de 24, 28 o 32 capas).
- Enrutamiento adaptativo de profundidad de inferencia para un Llama 3 8B con salidas tempranas.
- Procesamiento de texto en inglés a nivel de palabra y de carácter (robusto a variaciones morfológicas y errores tipográficos gracias a los n-gramas de carácter).
- Ejecución en CPU como componente ligero acoplado a un pipeline de generación.
- No genera texto, no contiene pesos de lenguaje, no soporta tool calling, agentes, visión, audio ni razonamiento multi-paso.
- No expone una API de chat ni plantillas de prompt; su interfaz es la función de predicción de scikit-learn sobre features construidas manualmente.

## Casos de uso

- Enrutamiento de profundidad en resumen de noticias: dado un artículo de CNN/DailyMail, el controlador evalúa si 24 capas bastan; si no, prueba 28; si tampoco, usa 32. Reduce el coste medio de generación cuando los artículos son "fáciles" según las features TF-IDF.
- Investigación en early-exit e inferencia adaptativa: sirve como baseline barato y reproducible (semilla 42, hiperparámetros documentados) para comparar estrategias de enrutamiento más sofisticadas.
- Reducción de latencia en pipelines de resumen por lotes: al fijar profundidades menores para una fracción de los artículos, disminuye el tiempo medio por documento en el servidor que aloja el Llama 3 8B modificado.
- Filtrado previo en sistemas de resumen a gran escala: permite decidir la profundidad antes de invocar el modelo grande, evitando el coste de generar con 32 capas en todos los casos.
- Docencia y reproducción de experimentos: el artefacto joblib y la receta de features (TF-IDF palabra + carácter, regresión logística balanceada) son fáciles de inspeccionar y reentrenar.
- Integración como componente de un sistema mayor de gestión de recursos: al ser CPU-only, puede desplegarse junto al orquestador de inferencia sin competir por VRAM con el modelo de lenguaje.
- Análisis de sensibilidad de umbrales: el estudio exploró umbrales 0,5–1,1; el artefacto permite experimentar con el compromiso calidad/coste en producción.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre ejemplos artículo-profundidad retenidos de CNN/DailyMail (predicción de las etiquetas binarias del controlador, umbral 0,5):

| Metrica | Valor |
|---|---:|
| Accuracy | 75,73 % |
| Precision | 78,01 % |
| Recall | 75,25 % |
| F1 | 76,61 % |

No se han publicado resultados de benchmarks de calidad de resumen (ROUGE u otros) ni comparaciones con otros controladores en la información disponible. La propia model card advierte que estas métricas describen la predicción de etiquetas del controlador y no la corrección factual de los resúmenes generados.

## Requisitos de hardware

- VRAM para el controlador: 0 GB; se ejecuta en CPU con scikit-learn y joblib.
- RAM estimada: del orden de cientos de MB para cargar los vectorizadores TF-IDF (hasta 40.000 features) y el clasificador; no se reporta cifra exacta.
- GPU: no requiere ninguna para el controlador. El modelo Llama 3 8B con early-exit asociado sí necesita GPU; el estudio cita AMD MI300X, pero no se detallan requisitos de VRAM para ese modelo.
- Cabe en cualquier máquina consumer: portátil, contenedor pequeño o función serverless.
- Opciones de despliegue: carga directa con `joblib` en Python; integración en servicios FastAPI/Flask; no aplica vLLM, llama.cpp, Ollama ni TGI para este artefacto (esos serían para el Llama 3 8B subyacente).
- Latencia y throughput: no reportados en los documentos del estudio.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada controladores de enrutamiento de profundidad comparables publicados como artefactos independientes. Como referencia conceptual, la categoría incluye mecanismos de early-exit internos al transformer (p. ej., capas de clasificación por bloque) y routers basados en perplexidad o entropía, pero no se dispone de datos comparativos verificables para este artefacto concreto.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PSSN-Adaptive-Inference-Controller | Controlador TF-IDF + regresión logística | No disponible | No aplica | No disponible | Hugging Face |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni contiene pesos de Llama 3 8B; usarlo de forma aislada no produce resúmenes.
- Las métricas reportadas miden la predicción de etiquetas binarias del estudio, no la calidad ni la corrección factual de los resúmenes generados; la model card lo advierte explícitamente.
- El controlador está entrenado y validado sobre CNN/DailyMail 3.0.0; su generalización a otros dominios, idiomas o estilos periodísticos no está documentada.
- Solo contempla las profundidades 24, 28 y 32; no es extrapolable a otras arquitecturas ni a otros rangos de capas sin reentrenamiento.
- Idioma limitado al inglés según la model card.
- Licencia no especificada: riesgo legal para uso comercial; conviene contactar con el autor antes de integrarlo en producción.
- Sesgos: al ser un clasificador entrenado sobre un corpus periodístico concreto, puede heredar sesgos de estilo y temática de CNN/DailyMail; no se documentan análisis de sesgo.
- Riesgo de enrutamiento erróneo: un falso positivo en profundidades bajas puede degradar la calidad del resumen sin que el sistema lo detecte, ya que la profundidad queda fija durante la generación.
- Artefacto joblib: requiere confiar en la serialización; conviene cargarlo en un entorno aislado y verificar la versión de scikit-learn para evitar incompatibilidades.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin mantenimiento ni issues documentados.
- No se documentan latencias, tamaño exacto del artefacto ni procedimiento de reentrenamiento reproducible más allá de los hiperparámetros.

## Enlaces

- Hugging Face: https://huggingface.co/ramitha2002/PSSN-Adaptive-Inference-Controller
- Dataset de entrenamiento citado: CNN/DailyMail 3.0.0 (no se proporciona enlace directo en la información disponible)
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada
