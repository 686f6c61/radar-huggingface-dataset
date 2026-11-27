# liuzimeng222/imdb-sentiment-nn

## Resumen

IMDB Sentiment Neural Network es un clasificador binario de sentimiento para resenas de cine en ingles, publicado en Hugging Face por Liu Zimeng (usuario `liuzimeng222`). No se trata de un modelo de lenguaje generativo, sino de un pipeline clasico de procesamiento de lenguaje natural compuesto por un vectorizador TF-IDF (hasta 10.000 caracteristicas de unigramas y bigramas) seguido de un perceptron multicapa de 64 unidades implementado en PyTorch. El modelo resuelve la tarea de determinar si una resena es positiva o negativa.

El modelo fue entrenado sobre un subconjunto balanceado de 10.000 resenas del dataset IMDB (`imdb_balanced_10k.csv`), proporcionado como material de un curso, con una particion estratificada 80/20 y semilla 42. Tras eliminar 17 duplicados, el conjunto de entrenamiento quedo en 7.986 resenas y el de prueba en 1.997. El entrenamiento y la publicacion de artefactos se automatizaron mediante GitHub Actions, lo que constituye su rasgo mas distintivo desde el punto de vista de ingenieria.

Su relevancia practica es limitada: se trata de un artefacto academico con cero descargas y cero likes en el momento de la ficha, sin licencia declarada, y con un checkpoint que incluye un vectorizador serializado con pickle, lo que exige confiar en la fuente. Resulta util como referencia docente de un flujo MLOps minimo (entrenamiento reproducible en CI, versionado de dataset por SHA-256 y publicacion automatica), no como componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-IDF (unigramas y bigramas, hasta 10.000 caracteristicas) + perceptron multicapa de 64 unidades en PyTorch |
| Parametros totales | no disponible (no se publica el recuento; depende de la dimension efectiva del vocabulario TF-IDF) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (clasificacion por bolsa de n-gramas, sin ventana de atencion) |
| Tipos de cuantizacion | no disponible (no se distribuyen pesos cuantizados; el checkpoint es un `state_dict` de PyTorch) |
| Idiomas soportados | ingles (`en`) |
| Licencia | no disponible |
| Formato de pesos | checkpoint de PyTorch (`state_dict`, cargado con `weights_only=True`) mas vectorizador serializado con pickle |

## Arquitectura y entrenamiento

La arquitectura es un pipeline en dos etapas. Primero, un vectorizador TF-IDF extrae hasta 10.000 caracteristicas de unigramas y bigramas; el vectorizador se ajusta exclusivamente sobre las resenas de entrenamiento para evitar fuga de informacion. Despues, un clasificador feedforward de 64 unidades en PyTorch recibe ese vector disperso y produce la prediccion binaria de sentimiento. No hay mecanismo de atencion, capas recurrentes ni representaciones contextuales: cada documento se representa como una bolsa ponderada de n-gramas.

El entrenamiento se realizo sobre el subconjunto `imdb_balanced_10k.csv` con particion estratificada 80/20 y semilla 42, tras eliminar 17 resenas duplicadas. El conjunto resultante tiene 7.986 resenas de entrenamiento y 1.997 de prueba, evaluadas con un calendario de entrenamiento fijo. No se documenta el numero de tokens procesados, la composicion exacta del dataset mas alla del subconjunto balanceado, ni el uso de RLHF, DPO o tecnicas de ajuste fino alineadas. La innovacion tecnica destacable es de proceso, no de modelado: todos los artefactos se entrenan y publican mediante GitHub Actions, con trazabilidad del commit de origen (`fc4df8e...`), del run de CI y del SHA-256 del dataset.

## Capacidades

- Clasificacion binaria de sentimiento (positivo/negativo) en resenas de cine en ingles.
- Extraccion de caracteristicas TF-IDF con unigramas y bigramas, hasta 10.000 dimensiones.
- Inferencia por linea de comandos mediante `predict.py --repo-id`, ejecutada desde una copia local del codigo fuente.
- Salida con puntuacion softmax, aunque el autor advierte explicitamente que no esta calibrada.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues: solo ingles.
- No dispone de modo de razonamiento (thinking), vision ni audio.
- No es un modelo generativo: no produce texto, solo etiquetas.

## Casos de uso

- Clasificacion por lotes de resenas de cine o series en ingles: el modelo etiqueta cada documento como positivo o negativo en una sola pasada, adecuado para analisis retrospectivo de corpus cerrados.
- Etiquetado de datos para entrenamiento: puede preanotar grandes volumenes de resenas y reducir el coste de anotacion manual, con revision humana posterior dado el riesgo de error en entradas cortas o ironicas.
- Referencia docente de MLOps: sirve como ejemplo reproducible de entrenamiento en GitHub Actions con versionado de dataset por hash y publicacion automatica de artefactos en Hugging Face.
- Baseline en experimentos academicos: proporciona una linea base rapida (exactitud 0,9029 sobre el subconjunto) contra la que comparar clasificadores mas complejos como transformers ajustados.
- Monitorizacion de reputacion en dominios acotados: si el vocabulario y el registro coinciden con el de resenas de cine, puede integrarse en un panel de seguimiento de opinion con umbrales conservadores.
- Filtrado previo en pipelines de curacion de datos: descartar o priorizar resenas segun polaridad antes de un procesamiento mas costoso con modelos generativos.
- Demostracion de inferencia ligera en CPU: al carecer de capas de atencion y operar sobre vectores dispersos, el coste computacional es minimo y puede ejecutarse en entornos sin GPU.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Exactitud en test | 0,9029 |
| F1 macro | 0,9029 |
| Resenas de entrenamiento | 7.986 |
| Resenas de prueba | 1.997 |
| Duplicados eliminados | 17 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las cifras anteriores corresponden al subconjunto de curso y a la particion concreta descrita, por lo que no son directamente comparables con resultados sobre el IMDB completo.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; el modelo cabe en memoria de sistema y puede ejecutarse en CPU.
- GPU recomendadas: no requiere GPU; cualquier CPU moderna es suficiente para inferencia por lotes.
- Cabe en GPU consumer: si, en cualquier GPU consumer, aunque no aporta ventaja frente a CPU por el tamano reducido del clasificador.
- Opciones de despliegue: el autor solo documenta inferencia mediante `predict.py` sobre una copia local del repositorio; no se proporcionan artefactos para vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| liuzimeng222/imdb-sentiment-nn | no disponible | no aplica (bolsa de n-gramas) | TF-IDF + MLP de 64 unidades | no disponible | Hugging Face, 0 descargas |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificados de modelos comparables en la informacion proporcionada, por lo que no se establece una comparacion cuantitativa. Cualquier comparacion con clasificadores basados en transformers requeriria resultados sobre el mismo subconjunto y particion, que no se han publicado.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenar solo con resenas de cine en ingles, el vocabulario y los dominios estan fuertemente acotados.
- Riesgo de alucinacion: no aplica en sentido generativo, pero la etiqueta puede ser incorrecta en entradas cortas, ironicas o fuera de dominio, como advierte el propio autor.
- Limitaciones de contexto e idioma: sin ventana de contexto formal; el rendimiento en textos largos depende del truncado implicito del vectorizador. Solo soporta ingles y el autor senala mal rendimiento en textos no ingleses.
- Confianza no calibrada: la puntuacion softmax no debe interpretarse como probabilidad calibrada; no usar umbrales directos sin recalibracion.
- Restricciones de licencia: no se declara licencia, lo que impide asumir permiso de uso comercial; es necesario contactar con el autor antes de cualquier uso en produccion.
- Seguridad del artefacto: el vectorizador se distribuye serializado con pickle y requiere una fuente de confianza y las versiones de libreria registradas; cargarlo desde origenes no verificados es un riesgo de ejecucion de codigo.
- Madurez: cero descargas y cero likes, sin mantenimiento documentado ni resultados sobre el dataset IMDB completo; no es adecuado como dependencia de produccion sin validacion propia.
- Reproducibilidad: la inferencia exige clonar el repositorio de codigo fuente, ya que el repositorio de Hugging Face tiene 0,0 GB y no incluye por si solo todo lo necesario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/liuzimeng222/imdb-sentiment-nn
- Codigo fuente en GitHub: https://github.com/liuzimeng222-sys/imdb-sentiment-nn
- Run de GitHub Actions: https://github.com/liuzimeng222-sys/imdb-sentiment-nn/actions/runs/45933217832
- Dataset del curso: https://gitee.com/lundechen/data_engineering_master_2026_fall/tree/master/session-400/datasets
- Dataset IMDB en Hugging Face: https://huggingface.co/datasets/stanfordnlp/imdb
