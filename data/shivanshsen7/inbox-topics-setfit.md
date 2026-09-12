# shivanshsen7/inbox-topics-setfit

## Resumen

`shivanshsen7/inbox-topics-setfit` es un clasificador de texto construido con la técnica SetFit (Sentence Transformer Fine-tuning) sobre el modelo de embeddings `BAAI/bge-small-en-v1.5`. No es un modelo generativo: se trata de un clasificador de 9 clases diseñado para categorizar correos electrónicos entrantes (asuntos de bandeja de entrada) según su temática. Lo publica el usuario `shivanshsen7` en HuggingFace y, en el momento de la consulta, acumula 0 descargas y 0 likes, por lo que es un artefacto reciente y sin validación comunitaria.

La arquitectura SetFit es un enfoque de aprendizaje few-shot que combina un Sentence Transformer afinado con aprendizaje contrastivo y una cabeza de clasificación ligera (en este caso, una regresión logística de scikit-learn). Esto permite obtener clasificadores competitivos con muy pocos ejemplos etiquetados por clase, algo relevante para dominios como el triaje de correo donde etiquetar datos es costoso. El modelo tiene 33.360.000 parámetros totales, una longitud máxima de secuencia de 512 tokens y ocupa 0,1 GB en el repositorio.

Es relevante ahora porque SetFit se ha consolidado como una alternativa eficiente a los clasificadores transformer tradicionales y a los LLM en tareas de etiquetado, con un coste de inferencia muy bajo. Sin embargo, la ficha carece de datos clave: no se especifican licencia, idiomas soportados, composición del dataset de entrenamiento ni resultados de benchmarks, lo que limita su evaluación antes de un uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit: Sentence Transformer `BAAI/bge-small-en-v1.5` + cabeza de clasificacion LogisticRegression (scikit-learn) |
| Parametros totales | 33.360.000 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (longitud maxima de secuencia) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (el modelo base `bge-small-en-v1.5` esta entrenado principalmente en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (cuerpo del Sentence Transformer) y artefacto de la cabeza de clasificacion |
| Numero de clases | 9 |
| Libreria | setfit |
| Pipeline | text-classification |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo sigue el paradigma SetFit descrito en el articulo arXiv:2209.11055. El proceso de entrenamiento consta de dos fases: primero se afina el Sentence Transformer `BAAI/bge-small-en-v1.5` mediante aprendizaje contrastivo generando pares de oraciones a partir de los datos etiquetados; despues se extraen los embeddings resultantes y se entrena una regression logistica (cabeza de clasificacion) sobre esas representaciones. La longitud maxima de secuencia es de 512 tokens y el clasificador final distingue 9 clases tematicas de correo.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, el numero de ejemplos por clase ni si se aplicaron tecnicas de aumento de datos mas alla del muestreo contrastivo propio de SetFit. Tampoco se documenta si hubo RLHF, DPO u otra fase de alineamiento, algo por otra parte inusual en clasificadores de este tipo. El unico dato de evaluacion presente en los metadatos es la metrica `accuracy`, sin valor numerico asociado. No se indica el `training dataset` ni la `language` ni la `license` en la model card (aparecen como `Unknown` o comentados).

## Capacidades

- Clasificacion de texto en 9 clases tematicas orientadas a correo electronico entrante (asuntos y cuerpo de mensajes).
- Extraccion de embeddings de frases mediante el Sentence Transformer subyacente (`bge-small-en-v1.5`), reutilizables para similitud semantica o busqueda.
- Funcionamiento en regimen few-shot: el diseno SetFit permite reentrenar la cabeza de clasificacion con pocos ejemplos por clase.
- Inferencia ligera y rapida, apta para ejecucion en CPU.
- No genera texto: no hay capacidades de generacion, razonamiento, codigo ni matematicas.
- Sin soporte de tool calling ni function calling.
- Sin soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles (el backbone esta orientado a ingles).
- Sin modo de razonamiento (thinking mode), vision ni audio.

## Casos de uso

- Triaje automatico de bandeja de entrada: el modelo asigna cada correo entrante a una de las 9 categorias, permitiendo enrutar mensajes a carpetas o equipos sin intervencion manual. Es adecuado por su bajo coste de inferencia y su ventana de 512 tokens, suficiente para asunto y cuerpo resumido.
- Filtrado de notificaciones transaccionales: correos de OTP, alertas bancarias o confirmaciones de sistemas pueden separarse del correo relevante para el usuario, tal y como sugieren los ejemplos de la model card (Salesforce, RBL Bank).
- Deteccion de correos de reclutamiento y RRHH: los ejemplos de la ficha incluyen mensajes de procesos de seleccion (TCS), por lo que el modelo puede etiquetar esta categoria y priorizarla o archivarla automaticamente.
- Separacion de newsletters y contenido promocional: la categorizacion permite distinguir boletines (por ejemplo, tematicas de Excel o prensa) del correo personal o laboral, alimentando reglas de organizacion.
- Enrutamiento en soporte al cliente: en un buzon compartido, las 9 clases permiten dirigir tickets a colas especializadas antes de que un agente los abra.
- Pre-etiquetado para anotacion humana: dado su caracter few-shot, puede usarse como etiquetador inicial que un equipo revisa y corrige, acelerando la construccion de un dataset mayor.
- Moderacion y agrupacion de grandes volumenes de correo: al ser un modelo de 33 M de parametros, puede procesar lotes masivos en CPU dentro de un pipeline ETL sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los metadatos del modelo incluyen la metrica `accuracy` sin valor asociado, y la model card no aporta ninguna tabla de evaluacion ni comparacion con otros clasificadores.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. El modelo tiene 33,36 M de parametros; en fp32 ocupa aproximadamente 133 MB solo en pesos, mas el overhead de activaciones y del tokenizador, muy por debajo de 1 GB.
- GPU recomendadas: no requiere GPU. Cualquier GPU con mas de 1-2 GB (GTX 1050 Ti, RTX 3050, etc.) es mas que suficiente; tambien funciona en Apple Silicon y CPU.
- Cabe en cualquier GPU de consumo: si, y tambien en CPU de forma holgada.
- Opciones de despliegue: al ser un modelo SetFit, se sirve mediante la libreria `setfit`/`sentence-transformers` en Python; es compatible con Text Embeddings Inference (etiqueta `text-embeddings-inference`) y con HuggingFace Endpoints (etiqueta `endpoints_compatible`). No se documenta soporte de vLLM ni llama.cpp, ya que no es un LLM generativo.
- Latencia y throughput estimados: no disponibles. Dado el tamano del modelo, se espera una latencia por debajo de las decenas de milisegundos en CPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de resultados de rendimiento de este modelo, por lo que la comparacion se limita a caracteristicas arquitectonicas y de disponibilidad.

| Modelo | Enfoque | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `shivanshsen7/inbox-topics-setfit` | SetFit (bge-small-en-v1.5 + regresion logistica) | 33,36 M | 512 tokens | no disponible | HuggingFace (0 descargas) |
| Clasificador transformer afinado (por ejemplo, `distilbert-base-uncased`) | Fine-tuning supervisado end-to-end | mayor que SetFit en cabeza de clasificacion | tipicamente 512 tokens | depende del backbone | ampliamente disponible |
| `BAAI/bge-small-en-v1.5` sin cabeza | Modelo de embeddings de frases | ~33 M | 512 tokens | MIT (segun su model card) | HuggingFace |

Las cifras de rendimiento comparadas no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- No se especifica la licencia, por lo que no puede confirmarse si el uso comercial esta permitido ni bajo que condiciones. Es un bloqueo potencial para produccion.
- No se documentan los idiomas soportados; el backbone `bge-small-en-v1.5` esta entrenado principalmente en ingles, asi que el rendimiento en castellano u otros idiomas es incierto.
- El numero de clases esta fijado en 9 y no se documenta su taxonomia, lo que impide saber si cubre las necesidades de un caso de uso concreto sin reentrenar.
- No se conoce la composicion del dataset de entrenamiento, el numero de ejemplos por clase ni el origen de los datos, lo que impide evaluar sesgos y desequilibrios.
- Riesgo de clasificacion erronea en correos ambiguos, con asuntos muy cortos o con contenido multimodal; no hay umbral de confianza documentado.
- Sin benchmarks ni evaluacion independiente: no hay evidencia publica de su precision real, y el contador de descargas es cero, por lo que no ha sido validado por la comunidad.
- No apto para tareas generativas, de razonamiento o de codigo; usarlo fuera de la clasificacion de texto produciria resultados invalidos.
- Los enlaces de busqueda web proporcionados no contienen informacion relevante sobre este modelo (corresponden a contenidos no relacionados), por lo que no aportan contexto adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shivanshsen7/inbox-topics-setfit
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Repositorio SetFit: https://github.com/huggingface/setfit
- Paper de SetFit: https://arxiv.org/abs/2209.11055
- Sentence Transformers: https://www.sbert.net
- LogisticRegression de scikit-learn: https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LogisticRegression.html
- Resultados de busqueda web: sin enlaces relevantes sobre este modelo en la informacion proporcionada.
