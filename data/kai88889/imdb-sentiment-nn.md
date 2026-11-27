# kai88889/imdb-sentiment-nn

## Resumen

`kai88889/imdb-sentiment-nn` es un clasificador binario de sentimiento para resenas de peliculas en ingles, publicado por el usuario kai88889 en Hugging Face. Segun su model card, combina una vectorizacion TF-IDF con una red neuronal feedforward implementada en PyTorch, y se distribuye como un artefacto pequeno (0.0 GB en el repositorio) pensado para ejecutarse mediante un script de Python incluido (`predict.py`).

El modelo no es un transformer preentrenado ni un LLM: es un pipeline clasico de procesamiento de lenguaje natural supervisado, entrenado sobre la muestra de IMDb empleada en cursos introductorios. Su objetivo es asignar una etiqueta de sentimiento (positivo o negativo) a una resena en ingles, reportando en `metrics.json` la exactitud en validacion, el F1 macro y la linea base de mayoria.

Su relevancia es fundamentalmente educativa y de referencia: sirve como ejemplo minimo de extremo a extremo (vectorizador + red + script de inferencia) y como linea base reproducible para tareas de clasificacion de texto. No esta pensado para produccion ni para dominios distintos del corpus de entrenamiento, y el propio autor advierte que el conjunto de datos balanceado no permite extrapolar su rendimiento a resenas mixtas o sarcasticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-IDF + red neuronal feedforward (PyTorch) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende de la vectorizacion TF-IDF; no se especifica) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | no disponible (artefactos de PyTorch y vectorizador; no se detalla el formato exacto) |

## Arquitectura y entrenamiento

La arquitectura es un pipeline en dos etapas: primero se transforma el texto con un vectorizador TF-IDF y despues se pasa la representacion resultante por una red neuronal feedforward en PyTorch. No se trata de un transformer, ni de un modelo MoE, ni de una arquitectura hibrida; tampoco se documenta el numero de capas, dimensiones ocultas ni funcion de activacion.

El entrenamiento se realizo sobre la muestra de IMDb del curso, un conjunto pequeno y balanceado de resenas de peliculas en ingles. El autor reporta en `metrics.json` la exactitud en held-out, el F1 macro y la linea base de mayoria, pero no detalla el numero de tokens, la composicion exacta del dataset, ni si hubo tecnicas de ajuste como RLHF o DPO (no aplicables en este tipo de modelo). Tampoco se describe ninguna innovacion tecnica destacable: es un clasificador supervisado convencional.

## Capacidades

- Clasificacion binaria de sentimiento (positivo o negativo) sobre resenas de peliculas en ingles.
- Inferencia mediante linea de comandos a traves de `predict.py`, pasando el texto y el directorio del modelo.
- Reporte de metricas de evaluacion (exactitud, F1 macro, linea base de mayoria) en `metrics.json`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingues: solo ingles.
- No incluye modo de razonamiento (thinking), vision ni audio.
- No se documenta calibracion de las puntuaciones de salida; el autor advierte explicitamente que el score no esta calibrado.

## Casos de uso

- Linea base educativa en cursos de NLP: sirve para ilustrar el flujo completo de vectorizacion TF-IDF, entrenamiento de una red feedforward y evaluacion con exactitud y F1 macro sobre un dataset balanceado.
- Clasificacion rapida de resenas de peliculas en ingles: util para prototipos que necesiten etiquetar opiniones positivas o negativas en un corpus de dominio acotado y similar al de entrenamiento.
- Pruebas de integracion de pipelines de inferencia: el script `predict.py` permite validar el empaquetado de un modelo y su vectorizador en entornos Python 3.12 con `requirements.txt`.
- Comparacion de tecnicas de representacion de texto: al ser un modelo minimo, sirve como referencia frente a enfoques basados en transformers para medir la mejora que aportan los modelos preentrenados.
- Filtrado preliminar de resenas en herramientas internas de analisis: puede usarse como primer clasificador de bajo coste antes de recurrir a un modelo mayor, siempre dentro del dominio de resenas de peliculas en ingles.
- Reproduccion de experimentos docentes: permite a estudiantes inspeccionar un artefacto completo (vectorizador y pesos) y ejecutar inferencia local sin infraestructura GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que `metrics.json` contiene exactitud en held-out, F1 macro y linea base de mayoria, pero no se proporcionan los valores numericos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamano del repositorio (0.0 GB) y la naturaleza del modelo (TF-IDF + feedforward), la inferencia es viable en CPU.
- GPU recomendadas: no se especifican; no requiere GPU para funcionar.
- Compatibilidad con GPU de consumo: si, aunque no es necesario; puede ejecutarse en CPU.
- Opciones de despliegue: ejecucion directa con Python 3.12 mediante `predict.py` y `requirements.txt`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre la muestra de IMDb del curso, hereda los sesgos de ese corpus.
- Riesgo de alucinacion: no aplica en sentido estricto (es un clasificador), pero las predicciones pueden ser erroneas en resenas mixtas o sarcasticas, como advierte el autor.
- Limitaciones de contexto e idioma: solo ingles y dominio de resenas de peliculas; no se especifica la longitud maxima de texto soportada por el vectorizador.
- Restricciones de licencia: la licencia no esta disponible, por lo que no se puede confirmar el uso comercial.
- Puntuaciones no calibradas: el score de salida no debe interpretarse como probabilidad calibrada.
- Advertencia de seguridad del autor: solo deben abrirse artefactos de modelo y vectorizador de confianza.
- El dataset educativo balanceado no establece rendimiento en otros dominios ni en resenas mixtas o sarcasticas.
- Sin descargas ni likes en el momento de la consulta; sin validacion externa de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/kai88889/imdb-sentiment-nn
