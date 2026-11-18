# SallySims/pyramidformer-similarity

## Resumen

PyramidFormer similarity es un modelo de extracción de características desarrollado por SallySims que transforma una pirámide de población (distribución por edad y sexo) en un vector unitario de 64 dimensiones. El modelo aborda un problema concreto: la comparación y recuperación eficiente de perfiles demográficos entre países y años, una tarea habitual en demografía comparada y salud global. Con solo 848.515 parámetros, es un prototipo de investigación de tamano muy reducido, disenado para operar sobre datos de población por edad simple.

La arquitectura es un transformer personalizado (no sigue la interfaz estándar de Transformers, por lo que no dispone de widget de inferencia alojado) entrenado sobre las pirámides de población de UN World Population Prospects 2024, con edades simples por sexo, para países y áreas entre 1950 y 2023. El modelo no recibe el año como entrada: aprende una representación de la forma de la pirámide que permite recuperar países y años similares mediante similitud coseno.

Su relevancia es acotada pero clara: ofrece un mecanismo compacto de retrieval demográfico (vectores de 64 dimensiones) en lugar de comparar directamente pirámides de 202 valores. El autor advierte explícitamente de que la pirámide cruda es un baseline fuerte para estadísticas resumen y de que el embedding debe usarse para recuperación compacta, no como una afirmación de superioridad informativa. Es un prototipo de investigación, no apto para estadística oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer personalizado (PyramidFormer), codificador de pirámides de población |
| Parametros totales | 848.515 (0,8 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada: pirámide de 2 sexos x 101 edades simples) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (modelo no linguistico; opera sobre datos demográficos) |
| Licencia | MIT |
| Formato de pesos | safetensors (model.safetensors) + código Python propio (pyramidformer.py) y config.json |

## Arquitectura y entrenamiento

El modelo es un transformer de arquitectura propia que toma como entrada una pirámide de población con forma `(n, 2, 101)`, es decir, dos sexos por 101 edades simples (0 a 100), en cualquier escala, y produce un vector unitario de 64 dimensiones. El entrenamiento combina tres términos de pérdida: una pérdida contrastiva en la que el mismo país con 1-2 años de diferencia forma un par positivo y los pares del mismo país nunca se usan como negativos; una cabeza lineal auxiliar que predice la edad mediana, la proporción de menores de 15 años y la proporción de mayores de 65 años; y un término que fuerza a que el coseno entre embeddings siga la distancia L1 entre pirámides.

Los datos de entrenamiento proceden de UN World Population Prospects 2024 (edades simples por sexo, países y áreas, 1950-2023, estimaciones), procesados en el dataset `SallySims/wpp2024-single-age-pyramids`. El split se realizó por país (80 % entrenamiento, 10 % validación, 10 % test), de modo que todas las métricas reportadas corresponden a países no vistos. La ejecución de entrenamiento documentada es una "quick run" de 1500 pasos de optimización. El repositorio incluye además `embeddings.npy` e `index.parquet` con los embeddings de todos los pares país-año del WPP 1950-2023.

## Capacidades

- Extracción de características: convierte una pirámide de población en un embedding compacto de 64 dimensiones y norma unitaria.
- Recuperación por similitud: permite buscar los países y años más similares a una pirámide dada mediante similitud coseno (función `most_similar` incluida en el código).
- Predicción auxiliar de estadísticas demográficas: la cabeza lineal auxiliar estima edad mediana, proporción de menores de 15 años y proporción de mayores de 65 años.
- Invariancia al año como entrada: el modelo no recibe el año, por lo que la representación depende solo de la forma de la pirámide.
- Manejo de escala arbitraria en la entrada (la pirámide puede venir en cualquier escala).
- Capacidades multilingües: no aplica (modelo no linguistico).
- Tool calling, agentes, visión, audio, modo thinking: no disponible.

## Casos de uso

- Búsqueda de países demográficamente similares: dada la pirámide de un país en un año concreto, recuperar los cinco países y años más parecidos usando el índice precalculado, útil para análisis comparado y selección de pares de control.
- Agrupamiento y tipologías demográficas: usar los embeddings de 64 dimensiones como entrada a clustering (k-means, HDBSCAN) para identificar regímenes de transición demográfica sin manipular vectores de 202 dimensiones.
- Detección de anomalías en series demográficas: comparar la pirámide de un año con la de años vecinos del mismo país y senalar desviaciones inusuales en la forma de la distribución por edad.
- Recuperación aumentada en informes de salud global: indexar el corpus país-año y recuperar automáticamente perfiles comparables para contextualizar indicadores sanitarios o de envejecimiento.
- Prototipado de visualizaciones interactivas: servir un buscador de "países parecidos" en un explorador de datos demográficos, con latencia muy baja gracias al tamano del modelo y a los embeddings precalculados.
- Validación de pipelines de datos: comprobar que una pirámide procesada se mapea cerca de su país y año esperados en el espacio de embeddings, como test de cordura en ingestas de datos de población.
- Investigación metodológica: servir de baseline reproducible para estudiar representaciones de pirámides de población con arquitecturas transformer de muy bajo coste computacional.

## Benchmarks y rendimiento

Evaluación sobre países no vistos (held-out), regresión kNN (k=5) de estadísticas resumen, con R² comparado frente a la pirámide cruda:

| Estadistica | Desde embedding | Desde piramide cruda |
|---|---|---|
| median_age | 0,895 | 0,926 |
| share_under_15 | 0,856 | 0,895 |
| share_65_plus | 0,901 | 0,950 |

Correlación de Spearman entre el coseno de los embeddings y la distancia L1 negativa en pares aleatorios held-out: 0,495.

El autor advierte de que el embedding se entrenó con estas estadísticas como objetivo auxiliar, por lo que la evaluación no es un test no supervisado de lo que captura la representación, y de que la pirámide cruda es un baseline fuerte para estas estadísticas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo tiene 0,8 M de parámetros y el repo ocupa 0,0 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso CPU; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer y en CPU sin problemas.
- Opciones de despliegue: carga directa con PyTorch mediante el snippet del autor (`snapshot_download` + carga dinámica de `pyramidformer.py` + `load_pretrained`); no hay integración documentada con vLLM, llama.cpp, Ollama o TGI, y no existe widget de inferencia alojado por tratarse de una arquitectura personalizada.
- Latencia y throughput: no disponibles de forma publicada; por el tamano del modelo y los embeddings precalculados (`embeddings.npy` + `index.parquet`), la recuperación por similitud sobre el índice es prácticamente inmediata.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (embeddings de pirámides de población) en la información proporcionada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| PyramidFormer similarity | 848.515 | no disponible | MIT | Hugging Face (repo autónomo) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Prototipo de investigación: el autor indica explícitamente que no es apto para estadística oficial.
- Los datos WPP son estimaciones modeladas, no censos brutos, por lo que los sesgos del WPP se propagan al modelo.
- La pirámide cruda supera al embedding en las tres estadísticas resumen evaluadas (R² de 0,926 frente a 0,895 en edad mediana, por ejemplo); el embedding debe usarse para recuperación compacta, no como representación superior.
- La evaluación de estadísticas no es un test no supervisado, ya que esas mismas estadísticas fueron objetivos auxiliares de entrenamiento.
- Correlación moderada (0,495) entre coseno y distancia L1 negativa: la geometría del embedding no reproduce fielmente la distancia entre pirámides.
- Entrenamiento muy corto (1500 pasos, "quick run"), lo que limita la confianza en la convergencia.
- El modelo no recibe el año como entrada, de modo que no puede distinguir directamente entre años con pirámides idénticas.
- Sin cuantizaciones publicadas ni soporte en frameworks de despliegue estándar; requiere cargar código Python propio del repositorio, lo que implica revisar y confiar en dicho código antes de usarlo en producción.
- Condiciones de uso de los datos de la ONU: deben revisarse antes de reutilizar los datos fuente del WPP 2024.
- Riesgo de alucinación: no aplica en el sentido linguistico, pero las predicciones de la cabeza auxiliar son estimaciones y pueden desviarse en países o años atípicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SallySims/pyramidformer-similarity
- Dataset de entrenamiento: https://huggingface.co/datasets/SallySims/wpp2024-single-age-pyramids
- World Population Prospects 2024 (ONU, DESA, Population Division): https://population.un.org/wpp/
- Paper, blog, repositorio o demo adicionales: no disponible
