# AfriSpeech/african-sentiment-id

# African Sentiment ID (AfriSpeech): clasificador de sentimiento multilingue para lenguas africanas

## Resumen

`AfriSpeech/african-sentiment-id` es un clasificador supervisado de sentimiento binario (positivo / negativo) desarrollado por la organizacion AfriSpeech y publicado en HuggingFace bajo licencia MIT. El modelo se distribuye en formato FastText y su rasgo distintivo es que el texto de entrenamiento se convirtio previamente a una ortografia universal mediante la herramienta `africa-g2p`, de modo que el clasificador opera sobre una representacion fonetica normalizada en lugar de sobre grafias especificas de cada lengua. Eso permite cubrir multiples lenguas africanas sin condicionamiento explicito de idioma en la entrada.

El repositorio incluye tres artefactos: `model.bin` (modelo FastText supervisado en precision completa), `model.ftz` (version cuantizada y ligera) y `config.json`. El tamano total del repositorio es de 1,9 GB. La etiqueta de idioma declarada es `mul` (multilingue) y la libreria asociada es `fasttext`.

Es relevante porque la mayoria de clasificadores de sentimiento con buen rendimiento estan entrenados sobre ingles o un conjunto reducido de lenguas europeas, y las lenguas africanas suelen quedar fuera de los corpus anotados y de los tokenizadores de los modelos neuronales. Un enfoque lineal sobre n-gramas con normalizacion G2P reduce el coste computacional y el requisito de datos por lengua. No obstante, la model card publicada es muy escueta y no aporta cifras de entrenamiento, evaluacion ni cobertura linguistica concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastText supervisado (bolsa de n-gramas de palabras y caracteres con clasificador lineal) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (FastText procesa el documento completo; no se documenta truncado ni ventana) |
| Tipos de cuantizacion | version en precision completa (`model.bin`) y version cuantizada de FastText (`model.ftz`) |
| Idiomas soportados | `mul` (multilingue, orientado a lenguas africanas; no se detalla la lista) |
| Licencia | MIT |
| Formato de pesos | FastText binario (`.bin`) y FastText cuantizado (`.ftz`); `config.json` asociado |
| Libreria | fasttext |
| Tarea | clasificacion de sentimiento binaria (positivo / negativo) |
| Preprocesado requerido | conversion del texto a ortografia universal mediante `africa-g2p` |
| Tamano del repositorio | 1,9 GB |
| Descargas / likes en HuggingFace | 0 / 0 |
| Fecha de creacion (segun HuggingFace) | 2026-09-22 |

## Arquitectura y entrenamiento

La arquitectura es la del clasificador supervisado de FastText: cada documento se representa como una bolsa de n-gramas de palabras y de n-gramas de caracteres, se proyecta a un espacio de embeddings de baja dimension y se clasifica con una capa lineal entrenada con perdida softmax (con opcion de softmax jerarquico en la implementacion original). Es un modelo puramente lineal sobre caracteristicas dispersas, sin atencion ni mecanismos recurrentes, lo que explica su bajo coste de inferencia en CPU.

La innovacion declarada por el autor es el uso de `africa-g2p` durante el preprocesado: el texto de entrenamiento se convierte a una ortografia universal basada en reglas de grafema a fonema. Al compartir representacion fonetica entre lenguas, el modelo puede generalizar entre lenguas africanas relacionadas sin necesidad de condicionar la prediccion al idioma. No se especifica en la model card el numero de tokens de entrenamiento, la composicion del dataset, el numero de lenguas cubiertas, la dimension de embedding, el tamano del diccionario de n-gramas ni si hubo etapas de ajuste adicional. Tampoco se documenta ninguna tecnica de decodificacion especulativa, cuantizacion posterior al entrenamiento mas alla del `.ftz` estandar, ni evaluacion de calibracion.

## Capacidades

- Clasificacion de sentimiento binaria: asigna una etiqueta positivo o negativo a un texto corto o mediano.
- Cobertura multilingue orientada a lenguas africanas, sin necesidad de indicar el idioma en la entrada.
- Operacion sobre ortografia universal generada por `africa-g2p`, lo que permite compartir vocabulario entre lenguas con sistemas de escritura o convenciones distintas.
- Inferencia en CPU con requisitos de memoria y latencia muy inferiores a los de un transformer del mismo ambito.
- Distribucion en dos variantes de peso (precision completa y cuantizada) para ajustar el equilibrio entre tamano y fidelidad.
- No dispone de generacion de texto, razonamiento multi-paso, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No esta disenado para agentes ni para razonamiento encadenado; es un clasificador de una sola pasada.
- No incluye capacidades de vision ni de audio.
- No se documenta un modo de pensamiento (thinking mode) ni salida de trazas intermedias.
- No se documenta soporte de clasificacion multietiqueta ni de intensidad del sentimiento (solo positivo / negativo).

## Casos de uso

- Monitorizacion de opinion en redes sociales: ingesta de publicaciones en distintas lenguas africanas, normalizacion con `africa-g2p` y clasificacion por lotes en CPU, lo que permite procesar volumenes altos sin GPU.
- Moderacion de comunidades multilingues: filtrado previo de comentarios con sentimiento negativo para priorizar la revision humana, usando `model.ftz` cuando el despliegue debe ser ligero.
- Analisis de encuestas y formularios abiertos: clasificacion de respuestas de texto libre recogidas en varios paises africanos para obtener un indicador agregado de satisfaccion.
- Atencion al cliente: etiquetado automatico del tono de los mensajes entrantes para enrutar quejas a agentes especializados, siempre que los mensajes se preprocesen con la misma cadena G2P usada en entrenamiento.
- Investigacion linguistica y sociolinguistica: generacion de corpus etiquetados por polaridad en lenguas con pocos recursos, que despues pueden usarse como senal debil para entrenar modelos neuronales o para anotacion asistida.
- Analitica de resenas de producto y comercio electronico: clasificacion de opiniones de usuarios en mercados donde el ingles no es la lengua dominante.
- Monitorizacion de medios y seguimiento de reputacion de marca: agregacion de polaridad por fuente, pais o franja temporal a partir de texto en multiples lenguas.
- Senal auxiliar en pipelines de datos: uso del clasificador como filtro barato dentro de un sistema mayor que reserve un modelo grande para los casos ambiguos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud, F1, cobertura por lengua, tamano del conjunto de evaluacion ni comparaciones con otras propuestas. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que tampoco existen evaluaciones de terceros localizadas en la busqueda web.

## Requisitos de hardware

- Al ser un modelo FastText, la inferencia se ejecuta en CPU y no requiere GPU.
- El repositorio ocupa 1,9 GB; el consumo real de memoria depende del tamano de `model.bin` frente a `model.ftz`, dato que no se detalla en la model card.
- Como referencia de orden de magnitud, la variante cuantizada (`.ftz`) esta pensada para ocupar sustancialmente menos memoria y ser adecuada para entornos con recursos limitados; no se publica la cifra exacta.
- No cabe plantear despliegue en A100, H100, RTX 4090 ni otras GPU especificas, porque el modelo no las aprovecha.
- Opciones de despliegue: la libreria `fasttext` (Python) y la herramienta de linea de comandos `fasttext`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a transformers.
- Latencia y throughput: no se han publicado mediciones. Por la naturaleza lineal del modelo, se espera una latencia muy baja por documento corto en CPU, sin que exista una cifra verificada.

## Comparativa con modelos similares

No disponible. No se han localizado en la informacion proporcionada resultados comparativos frente a alternativas de la misma categoria (por ejemplo, clasificadores FastText multilingues, modelos basados en XLM-R o mBERT ajustados para analisis de sentimiento en lenguas africanas, o clasificadores especificos por lengua). Tampoco se dispone de cifras de parametros del propio modelo ni de metricas propias, por lo que cualquier tabla comparativa seria especulativa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos comparables |
|---|---|---|---|---|---|
| african-sentiment-id (AfriSpeech) | no disponible | no disponible | MIT | HuggingFace, 0 descargas | no disponible |
| Alternativas de la categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Model card minima: no se documentan datos de entrenamiento, numero de lenguas cubiertas, tamano del corpus ni reparto entre idiomas, lo que impide auditar sesgos o cobertura.
- Clasificacion estrictamente binaria: no distingue intensidad, emociones concretas ni sentimiento neutro por separado.
- Dependencia fuerte del preprocesado: si la entrada no se convierte con `africa-g2p` de la misma forma que el corpus de entrenamiento, el rendimiento puede degradarse de manera significativa.
- La normalizacion G2P puede eliminar informacion ortografica relevante para el sentimiento (por ejemplo, enfasis expresivo escrito con grafias no estandar o marcas idiomaticas).
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de falsos positivos y falsos negativos sistematicos en variedades o registros poco representados en el entrenamiento.
- Sin benchmarks publicados: no hay evidencia verificable de calidad ni de robustez frente a texto ruidoso, jerga, abreviaturas o mezcla de lenguas.
- El campo de idioma `mul` no permite saber que lenguas concretas estan realmente soportadas; hay que validar caso por caso antes de usarlo en produccion.
- Sesgos conocidos: no disponibles. No se ha publicado ningun analisis de sesgo por pais, etnia, genero o dialecto.
- Licencia MIT: permite uso comercial y modificacion, pero exige conservar el aviso de copyright y la licencia. No se especifican terminos adicionales sobre los datos de entrenamiento ni sobre el uso de `africa-g2p`.
- Advertencia de trazabilidad: las fechas de creacion y actualizacion registradas en HuggingFace (2026) son posteriores a la fecha de esta consulta, lo que conviene tener en cuenta al citar el modelo.
- Sin senal de adopcion: 0 descargas y 0 likes implican que no existe una comunidad que haya reportado fallos, mejoras o validaciones independientes.

## Enlaces

- HuggingFace: https://huggingface.co/AfriSpeech/african-sentiment-id
- Herramienta de preprocesado `africa-g2p`, referenciada en la model card: no disponible (no se proporciona URL)
- Paper o publicacion tecnica: no disponible
- Repositorio de codigo: no disponible
- Demo o espacio interactivo: no disponible
- Resultados de la busqueda web: no se han localizado enlaces relevantes; los resultados devueltos corresponden a servicios no relacionados con el modelo
