# JihaneJra/darija-lid-fasttext

## Resumen

`JihaneJra/darija-lid-fasttext` es un clasificador binario de identificacion de lengua construido con fastText, disenado para distinguir texto en escritura arabe que corresponde a darija marroqui (codigo ISO `ary`) frente a otras variantes del arabe. Lo desarrolla JihaneJra en el contexto del hackathon HackAI 2026 (1337 AI) y resuelve un problema muy concreto de los pipelines de datos en arabe: filtrar grandes volumenes de texto scrapeado de web y redes sociales para conservar unicamente darija antes de entrenar o evaluar un modelo de lenguaje.

El modelo es deliberadamente minimalista: un clasificador lineal con n-gramas de palabras y de caracteres, cuantizado a 6,6 MB, que se ejecuta en CPU en milisegundos. No es un modelo generativo ni un transformer; es una herramienta de preprocesamiento y curado de datos. Su relevancia actual reside en que la darija marroqui esta infrarrepresentada en los corpus de entrenamiento y su deteccion fiable permite construir datasets mas limpios y especializados.

La informacion disponible es limitada: el repositorio de Hugging Face no declara licencia, no tiene descargas ni likes, y el autor no publica comparaciones con otros identificadores de lengua. Los resultados reportados sobre el split de test del dataset `atlasia/Darija-LID` son, no obstante, muy altos (accuracy 0,9909).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | fastText (clasificador lineal con n-gramas de palabras y caracteres, perdida softmax) |
| Parametros totales | no disponible (modelo cuantizado de 6,6 MB; dimension de embedding `dim=100`, `bucket=200000`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificacion de documento completo; sin ventana definida) |
| Tipos de cuantizacion | cuantizacion fastText integrada (`cutoff=100000`, `retrain=True`); artefacto `.ftz` |
| Idiomas soportados | arabe (`ar`) y darija marroqui (`ary`); solo escritura arabe |
| Licencia | no disponible |
| Formato de pesos | fastText cuantizado (`.ftz`); el modelo sin cuantizar ocupa aproximadamente 120 MB |

## Arquitectura y entrenamiento

El modelo es un clasificador de texto de fastText: una representacion de bolsa de n-gramas (palabras con `wordNgrams=2` y n-gramas de caracteres con `minn=2`, `maxn=5`) proyectada sobre un espacio de embedding de dimension 100 y seguida de una capa de salida softmax con dos etiquetas (`__label__ary` y `__label__other`). No hay atencion ni mecanismo contextual profundo; la ventaja de los n-gramas de caracteres es absorber la enorme variabilidad ortografica de la darija, que se escribe sin norma fija.

El entrenamiento se realizo sobre el dataset `atlasia/Darija-LID`. El preprocesamiento elimina URLs, digitos, letras latinas, emojis y puntuacion, conservando unicamente caracteres del rango arabe. Los hiperparametros se obtuvieron por busqueda en rejilla sobre un split de validacion separado del fichero de entrenamiento (sin fuga de datos) y despues se reentreno sobre el conjunto completo: `lr=0.1`, `epoch=15`, `dim=100`, `loss=softmax`, `bucket=200000`. Finalmente se aplico cuantizacion de fastText, reduciendo el modelo de unos 120 MB a 6,6 MB sin perdida de F1 (0,9935 antes frente a 0,9936 despues).

## Capacidades

- Clasificacion binaria de texto en escritura arabe: darija marroqui (`ary`) frente a otros dialectos arabes (`other`).
- Etiquetado por lotes de grandes volumenes de texto con coste computacional minimo (CPU, milisegundos por documento).
- Deteccion robusta ante variantes ortograficas de la darija gracias a los n-gramas de caracteres.
- Integracion sencilla en pipelines de Python mediante `fasttext-wheel` y `huggingface_hub`.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto.
- Capacidad multilingue limitada a las dos etiquetas definidas; no identifica que dialecto concreto es el texto clasificado como `other`.
- No procesa arabizi (darija escrita en caracteres latinos y digitos), que el preprocesamiento elimina.

## Casos de uso

- Curado de corpus para entrenamiento de modelos de lenguaje: filtrar textos scrapeados de web y redes sociales y conservar solo darija antes de construir un dataset de preentrenamiento o de ajuste fino.
- Construccion de datasets de evaluacion especificos de darija: separar ejemplos positivos de darija de textos en arabe estandar u otros dialectos para benchmarks linguísticos.
- Enrutamiento en sistemas de atencion al cliente: decidir si una consulta entrante esta en darija y derivarla a un modelo o a un agente con instrucciones especificas para ese dialecto.
- Monitorizacion de redes sociales: medir el volumen y la proporcion de contenido en darija en un flujo de publicaciones para analisis de mercado o de opinion en Marruecos.
- Preprocesamiento en pipelines de ASR o TTS: etiquetar transcripciones y decidir que modelo de lenguaje aplicar en la correccion o el postprocesado segun la variante detectada.
- Filtrado de ruido en crawlers: descartar paginas y comentarios que no sean darija en procesos de recoleccion de datos a gran escala, con un coste de CPU despreciable frente a un clasificador neuronal.
- Deduplicacion y control de calidad de datasets: verificar que un lote etiquetado como darija lo es realmente antes de publicarlo.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el split de test de `atlasia/Darija-LID` (53.226 textos):

| Clase | Precision | Recall | F1 |
|---|---|---|---|
| `ary` (darija) | 0,9924 | 0,9947 | 0,9936 |
| `other` | 0,9871 | 0,9814 | 0,9842 |
| Accuracy global | | | 0,9909 |

No se han publicado resultados de benchmarks en la informacion disponible mas alla de esta tabla, ni comparaciones con otros identificadores de lengua.

## Requisitos de hardware

- Inferencia en CPU: el modelo cuantizado de 6,6 MB se ejecuta en CPU en milisegundos por texto; no requiere GPU.
- VRAM estimada: 0 GB; el modelo cabe holgadamente en memoria RAM (unos pocos cientos de MB incluyendo el runtime de Python y fastText).
- GPU recomendadas: ninguna necesaria. Cualquier GPU sirve si se integra en un pipeline mas amplio, pero no aporta ventaja para este modelo.
- Cabe en cualquier equipo consumer, incluidos portatiles de gama baja y entornos sin acelerador.
- Opciones de despliegue: libreria `fasttext` o `fasttext-wheel` en Python, o el binario de fastText en otros lenguajes; puede envolverse en un servicio HTTP propio. No es compatible con vLLM, TGI, llama.cpp ni Ollama, que estan orientados a modelos generativos.
- Throughput y latencia: no se publican cifras exactas; el autor indica ejecucion en CPU en milisegundos por texto. El procesamiento por lotes es viable para etiquetado masivo, con la salvedad de que las probabilidades por etiqueta solo son fiables al predecir un texto cada vez.

## Comparativa con modelos similares

No se dispone de comparaciones publicadas con otros identificadores de lengua en la informacion proporcionada. Como referencia de categoria, los identificadores de lengua basados en fastText (por ejemplo, `lid.176` de Facebook) cubren cientos de idiomas pero no separan dialectos arabes entre si, mientras que este modelo esta especializado en la frontera darija frente al resto. No hay datos disponibles para comparar parametros, contexto, rendimiento ni licencia con alternativas concretas.

| Modelo | Tarea | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|
| `JihaneJra/darija-lid-fasttext` | Clasificacion binaria darija / otros dialectos arabes | `ar`, `ary` (solo escritura arabe) | no disponible | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo procesa escritura arabe: el arabizi (darija en caracteres latinos y digitos, por ejemplo `wach nta mzyan`) se elimina en el preprocesamiento y no se puede clasificar.
- Clasificacion binaria: no indica que dialecto concreto es un texto etiquetado como `other`; solo lo descarta.
- Textos muy cortos (una o dos palabras) son menos fiables porque muchas palabras se comparten entre dialectos arabes.
- Los resultados reflejan la distribucion de `atlasia/Darija-LID`; el rendimiento en otros dominios (tecnico, legal, prensa formal) puede ser inferior.
- La licencia no esta declarada en el repositorio, por lo que el uso comercial queda sin marco legal explicito hasta que el autor lo aclare.
- Es un modelo de clasificacion, no generativo: no debe emplearse para responder, resumir ni razonar sobre el texto.
- Riesgo de falsos positivos en textos de arabe estandar con prestamos o giros coloquiales, y de falsos negativos en darija muy formalizada o mezclada con frances.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026; no hay evidencia de mantenimiento ni de validacion independiente.
- La compatibilidad con numpy 2 requiere un parche documentado por el autor para `fasttext`; sin el, la prediccion de una sola cadena puede fallar.
- fastText suma `1e-5` a cada probabilidad, por lo que los valores pueden superar ligeramente 1.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JihaneJra/darija-lid-fasttext
- Dataset de entrenamiento: https://huggingface.co/datasets/atlasia/Darija-LID
- Codigo del proyecto: https://github.com/jihanejra/Hackai-2026-darija/tree/main/notebooks/language-lid
- fastText: https://fasttext.cc
