# DanKau/gliner-bi-large-v2.0-onnx

## Resumen

GLiNER bi-large v2.0 (ONNX) es un export al formato ONNX del modelo `knowledgator/gliner-bi-large-v2.0`, un sistema de reconocimiento de entidades nombradas (NER) de arquitectura bi-encoder. A diferencia del GLiNER original, que codifica texto y etiquetas de forma conjunta, este modelo emplea dos transformers independientes: uno para el texto (basado en ModernBERT, variante ettin-encoder-400m) y otro para las etiquetas de entidad (basado en bge-base-en-v1.5). Las representaciones resultantes se combinan mediante producto escalar, lo que permite precalcular las embeddings de las etiquetas una sola vez y reutilizarlas en múltiples documentos.

El export ha sido realizado por DanKau para el servicio SPAI de SecuPi, con el objetivo de ejecutar el modelo desde Java mediante ONNX Runtime sin dependencia de PyTorch. Según el autor, es el primer export ONNX publicado de un bi-encoder GLiNER, ya que la herramienta oficial de conversión falla en esta familia de modelos debido a un error en el harness de exportación. El repositorio incluye los dos grafos ONNX, los tokenizadores correspondientes y un fichero de configuración que define el contrato de decodificación. El modelo mantiene la licencia Apache 2.0 del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bi-encoder con dos transformers: span encoder (ModernBERT/ettin-encoder-400m + proyeccion 1024→768 + word pooling + span head markerV0) y label encoder (bge-base-en-v1.5 + proyeccion + masked mean pooling + prompt head) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (verificado de 4 a 242 tokens en la exportacion) |
| Tipos de cuantizacion | no disponible (export ONNX en float32) |
| Idiomas soportados | no disponible (tokenizador de texto cased, tokenizador de etiquetas uncased; probablemente ingles, no confirmado) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (dos grafos: `span_encoder.onnx` y `label_encoder.onnx`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura bi-encoder span de GLiNER. El encoder de texto procesa el documento completo y genera una representacion por cada posible span (rango de palabras consecutivas) mediante un mecanismo de word pooling que toma el primer sub-token de cada palabra. El encoder de etiquetas procesa cada tipo de entidad de forma independiente y produce una embedding por etiqueta. La puntuacion final se obtiene aplicando una funcion sigmoide al producto escalar entre la representacion del span y la embedding de la etiqueta. Esta separacion permite que las embeddings de las etiquetas se calculen una unica vez por conjunto de etiquetas y se reutilicen en todos los documentos, lo que reduce drasticamente el coste computacional cuando se trabaja con miles de tipos de entidad.

El export ONNX se realizo trazando los dos grafos por separado, evitando el bug del harness oficial que falla con `AttributeError: 'NoneType' object has no attribute 'max'`. El autor verifico la equivalencia con el modelo PyTorch nativo y confirmo que el RNN presente en el checkpoint (1,58M de pesos LSTM bidireccional) es codigo muerto en esta ruta, ya que `BaseBiEncoderModel` no lo invoca. Ademas, se corrigio la dimension fija del span head (`SpanMarkerV0`) que horneaba el numero de palabras en el grafo, sustituyendola por una dimension dinamica. No se dispone de informacion sobre los datos de entrenamiento del modelo base.

## Capacidades

- Reconocimiento de entidades nombradas (NER) zero-shot: identifica cualquier tipo de entidad definido por una etiqueta textual, sin necesidad de entrenamiento previo para ese tipo.
- Extraccion de informacion estructurada a partir de texto libre, con soporte para multiples etiquetas simultaneas (hasta miles, gracias a la arquitectura bi-encoder).
- Procesamiento por lotes de etiquetas: las embeddings de las etiquetas se pueden precalcular y cachear, lo que acelera la inferencia en escenarios con conjuntos de etiquetas fijos.
- Decodificacion de spans con solapamiento: el modelo genera una rejilla completa de spans y aplica un algoritmo greedy que elimina solapamientos entre entidades de diferentes etiquetas.
- Ejecucion en entornos sin PyTorch: al ser un export ONNX, puede integrarse en aplicaciones Java, C#, Python u otros lenguajes mediante ONNX Runtime.
- Soporte de tokenizacion de texto cased (ModernBERT byte-level BPE) y tokenizacion de etiquetas uncased (WordPiece de la familia bge-small).

## Casos de uso

- Deteccion de datos personales (PII) en documentos: el modelo puede identificar nombres, direcciones, numeros de telefono, correos electronicos y otros datos sensibles en textos legales o formularios, facilitando su anonimizacion o redaccion automatica. Su capacidad zero-shot permite definir etiquetas personalizadas como `EMAIL`, `DNI` o `IBAN` sin reentrenar.
- Extraccion de entidades en contratos y documentos legales: permite localizar partes contratantes, fechas, importes, jurisdicciones y clausulas relevantes en contratos largos, agilizando la revision legal. La reutilizacion de embeddings de etiquetas hace eficiente el procesamiento de grandes volumenes de documentos con el mismo conjunto de etiquetas.
- Analisis de historiales clinicos: extraccion de medicamentos, diagnosticos, sintomas y procedimientos de notas medicas no estructuradas, con etiquetas definidas ad hoc segun el vocabulario del hospital. Al ser un modelo ligero, puede desplegarse en servidores locales sin GPU.
- Monitorizacion de redes sociales y encuestas: identificacion de menciones de marcas, productos, competidores o sentimientos en publicaciones, usando etiquetas como `PRODUCTO`, `MARCA` o `QUEJA`. El bi-encoder permite cambiar el conjunto de etiquetas sobre la marcha sin recalcular embeddings del texto.
- Clasificacion de tickets de soporte: extraccion de tipo de incidencia, producto afectado, prioridad y cliente desde tickets de atencion al cliente, integrándose en sistemas de ticketing mediante ONNX Runtime desde Java u otros lenguajes.
- Procesamiento de documentos financieros: extraccion de nombres de empresas, simbolos bursatiles, cifras, fechas y personas clave de informes anuales o comunicados de prensa, con etiquetas personalizadas para el dominio financiero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor del export no proporciona metricas de rendimiento (MMLU, HumanEval, etc.) ni comparativas con otros modelos. El modelo base `knowledgator/gliner-bi-large-v2.0` tampoco incluye tablas de benchmarks en la documentacion consultada.

## Requisitos de hardware

- Tamano del repositorio: 2,1 GB en disco (dos grafos ONNX, tokenizadores y configuracion).
- No se dispone de datos oficiales sobre VRAM necesaria para inferencia. Dado que son dos transformers (uno de ~400M de parametros y otro de ~100M), se estima que la inferencia en CPU es viable, pero no hay cifras confirmadas.
- El modelo esta disenado para ejecutarse con ONNX Runtime, por lo que puede desplegarse en CPU, GPU o incluso en entornos embebidos con las optimizaciones de ONNX Runtime.
- No se indican GPUs recomendadas especificas. Al ser un modelo relativamente pequeno en comparacion con LLMs, es probable que quepa en GPUs de consumo como RTX 3060 o superiores, pero no esta confirmado.
- Opciones de despliegue: ONNX Runtime (Python, Java, C#), o mediante el pipeline de GLiNER si se carga el modelo base en PyTorch. No se menciona compatibilidad con vLLM, llama.cpp u Ollama.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa numerica. A nivel cualitativo, se puede contrastar con:

- **GLiNER original (joint encoder)**: el bi-encoder separa la codificacion de texto y etiquetas, lo que permite precalcular embeddings de etiquetas y escalar a miles de tipos de entidad con menor coste. El joint encoder procesa texto y etiquetas juntos, lo que puede ofrecer mayor interaccion contextual pero a costa de mayor coste computacional por documento.
- **Modelos NER basados en LLMs (p.ej. GPT-4, Llama 3)**: GLiNER es mucho mas ligero y rapido, disenado para CPU y hardware de consumo, con rendimiento competitivo en tareas NER zero-shot segun la documentacion del proyecto, aunque sin cifras concretas en la informacion disponible.
- **Otros modelos NER especializados (p.ej. spaCy, Stanza)**: estos requieren entrenamiento por dominio y no ofrecen zero-shot, mientras que GLiNER permite definir etiquetas arbitrarias sin reentrenar.

## Limitaciones y advertencias

- El tokenizador de texto es cased (distingue mayusculas y minusculas); no se debe aplicar lowercasing al texto de entrada, ya que degradaria el rendimiento.
- El tokenizador de etiquetas es uncased, por lo que las etiquetas se normalizan a minusculas internamente.
- Los tokens especiales `<<ENT>>` y `<<SEP>>` estan presentes en el vocabulario del tokenizador de texto pero no son funcionales en esta arquitectura bi-encoder; no deben emitirse.
- El span head fue verificado para longitudes de texto de 4 a 242 tokens; no se garantiza el comportamiento fuera de ese rango.
- El RNN presente en el checkpoint es codigo muerto en esta ruta; si se cargara el modelo en otro framework que lo invocara, los resultados podrian diferir.
- No se dispone de informacion sobre sesgos del modelo ni sobre su comportamiento en idiomas distintos del ingles (aunque el tokenizador de texto es byte-level BPE, lo que podria soportar otros idiomas, no esta confirmado).
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos del modelo base y de los modelos de los que deriva (ModernBERT, bge-base-en-v1.5).

## Enlaces

- Repositorio HuggingFace del export ONNX: https://huggingface.co/DanKau/gliner-bi-large-v2.0-onnx
- Modelo base: https://huggingface.co/knowledgator/gliner-bi-large-v2.0
- Repositorio oficial de GLiNER: https://github.com/urchade/GLiNER
- Documentacion del modulo ONNX de GLiNER: https://urchade.github.io/GLiNER/_modules/gliner/onnx/model.html
- Issues de exportacion mencionados: https://github.com/urchade/GLiNER/issues/225 y https://github.com/urchade/GLiNER/issues/237
