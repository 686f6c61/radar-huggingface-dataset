# chenhaodev/qwen3-8b-sport-weight-rag

## Resumen

`chenhaodev/qwen3-8b-sport-weight-rag` no es un modelo de lenguaje, sino un **indice vectorial de recuperacion (RAG)** para un asistente especializado en deporte y gestion de peso. El repositorio contiene un fichero `index.faiss`, un paquete cifrado `docs_meta.enc` con los fragmentos de texto originales y sus metadatos, y un script `decrypt_rag.sh` para desbloquearlo. La base se construyo troceando varias obras sobre ejercicio, rehabilitacion y control de peso en **465 fragmentos**, indexados con el modelo de embeddings `BAAI/bge-small-zh-v1.5`.

El objetivo declarado es reducir las alucinaciones de un LLM especializado: ante una consulta, el sistema recupera los fragmentos mas similares, los inyecta en el prompt como material de referencia y el modelo responde apoyandose en ese contexto. El repositorio funciona como complemento del modelo afinado `chenhaodev/qwen3-8b-sport-weight-lora` y de su version cuantizada en GGUF (`chenhaodev/qwen3-8b-sport-weight-gguf`), aunque el autor indica que puede conectarse a cualquier LLM local con API compatible con OpenAI.

La relevancia de este repositorio es practica mas que arquitectonica: documenta de forma reproducible un pipeline RAG completo (entorno, descarga, descifrado, recuperacion, construccion del prompt y llamada al modelo) con 465 fragmentos repartidos en siete dominios tematicos. El acceso al texto original esta restringido por derechos de autor, por lo que el material completo solo se obtiene solicitando la contrasena al autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Indice de similitud vectorial FAISS sobre embeddings densos generados por `BAAI/bge-small-zh-v1.5`; no es un modelo neuronal propio |
| Parametros totales | No aplica (artefacto de recuperacion, no un modelo). El modelo de embeddings asociado no se especifica en la informacion disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. La ventana efectiva depende del LLM que consuma el contexto recuperado (el ejemplo de la model card usa `max_tokens=400` para la respuesta) |
| Tipos de cuantizacion | No disponible para el indice. El repositorio hermano de pesos GGUF ofrece `qwen3-8b-sport-weight-Q4_K_M.gguf` (aproximadamente 4,8 GB) |
| Idiomas soportados | Los fragmentos, consultas y documentacion estan en chino simplificado; no se documenta soporte de otros idiomas |
| Licencia | No disponible. La model card declara que el contenido de `docs_meta.enc` procede de libros con derechos de autor, se distribuye cifrado y su uso queda limitado a investigacion y divulgacion, con prohibicion expresa de uso comercial |
| Formato de pesos | No aplica. Ficheros incluidos: `index.faiss` (indice), `docs_meta.enc` (paquete cifrado con texto y metadatos), `decrypt_rag.sh` (script), `README.md` |
| Dimension del vector | No disponible en la informacion proporcionada (viene fijada por el modelo de embeddings utilizado) |
| Numero de fragmentos | 465, con `len(docs) == len(meta) == index.ntotal == 465` |
| Tamano del repositorio | 0,0 GB segun los metadatos de HuggingFace |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-23 |
| Ultima actualizacion | 2026-09-23 |

## Arquitectura y entrenamiento

El repositorio implementa una arquitectura RAG clasica de dos fases. En la fase de indexacion, el material bibliografico se troceo en 465 fragmentos que se codificaron como vectores con `BAAI/bge-small-zh-v1.5` y se almacenaron en un indice FAISS (`index.faiss`). En la fase de consulta, la pregunta del usuario se codifica con **el mismo modelo de embeddings** (requisito explicito del autor, ya que solo asi los vectores son comparables), se realiza una busqueda de los `k` vecinos mas cercanos (el ejemplo usa `k=3`) y los fragmentos devueltos se concatenan en el prompt del LLM junto a la pregunta. Las similitudes se calculan sobre embeddings normalizados.

No existe entrenamiento de un modelo en este repositorio: no hay pesos, ni datos de preentrenamiento, ni fases de RLHF o DPO documentadas. La unica innovacion reseñable es de tipo operativo: el paquete `docs_meta.enc` mantiene el texto original cifrado para respetar los derechos de autor, mientras que el indice vectorial y el script de descifrado son publicos. La model card advierte que sin descifrar el paquete solo se obtienen identificadores numericos de fragmento, no el texto legible.

La cobertura tematica de los 465 fragmentos es: gestion de peso para trabajadores de oficina (108), ejercicio y rehabilitacion de enfermedades cronicas (87), ejercicio y rehabilitacion osteoarticular (78), ejercicio y rehabilitacion geriatrica (70), gestion de peso y aparato digestivo (49), ejercicio y salud osea (40) y gestion de peso y diabetes (33).

## Capacidades

- Recuperacion semantica de fragmentos: dado un texto de consulta en chino, devuelve los `k` fragmentos mas similares con su puntuacion de similitud y su etiqueta de procedencia (`meta[idx]['label']`).
- Generacion aumentada por recuperacion: el README incluye un flujo completo que inserta el contexto recuperado en el prompt con la instruccion explicita de no inventar lo que no aparezca en la referencia.
- Integracion con LLM via API compatible con OpenAI: el ejemplo usa `openai.OpenAI(base_url="http://127.0.0.1:8080/v1", api_key="local")` contra un servidor local, y menciona `llama-server` como implementacion concreta.
- Despliegue local sin GPU: el indice se consulta con `faiss-cpu` y los embeddings se calculan con `sentence-transformers`, sin requisitos de aceleracion por hardware documentados.
- Trazabilidad de fuentes: cada fragmento recuperado lleva una etiqueta de origen, lo que permite citar el libro de procedencia (el ejemplo menciona `骨质疏松症营养与膳食指导`).
- Compatibilidad con modelos alternativos: el autor indica que sirve con el LLM afinado del mismo autor, con cualquier modelo local pequeno e incluso con el GGUF del repositorio hermano.
- **No** se documentan capacidades de tool calling, function calling, agentes, multi-step reasoning, vision, audio ni modo de razonamiento explicito. Estas capacidades, si existen, corresponderian al LLM subyacente, no a este repositorio.

## Casos de uso

- Asistente de consulta bibliografica especializada en deporte y peso: el sistema recupera los fragmentos pertinentes de las obras indexadas y el LLM redacta una respuesta anclada en ellos, reduciendo el riesgo de que invente recomendaciones. Es el caso de uso que documenta el propio repositorio con la consulta de ejemplo sobre prevencion de osteoporosis en personas mayores.
- Despliegue local en consulta o centro deportivo sin conexion a Internet: al funcionar con `faiss-cpu` y un GGUF de aproximadamente 4,8 GB servido con `llama-server`, todo el pipeline cabe en una maquina local, lo que evita enviar consultas de salud a servicios externos.
- Generacion de material divulgativo con citas verificables: el campo `label` de cada fragmento permite trazar cada afirmacion hasta la obra de origen, util para redactar articulos o fichas de paciente que requieran referencias.
- Base de recuperacion para un sistema de triaje en rehabilitacion: las 87 fichas de ejercicio y enfermedades cronicas, 78 de rehabilitacion osteoarticular y 70 de rehabilitacion geriatrica permiten responder preguntas de orientacion general y derivar al profesional cuando el tema exceda el corpus.
- Punto de partida para construir dominios verticales: el README describe como reindexar o ampliar el corpus con nuevos fragmentos y el mismo modelo de embeddings, lo que sirve de plantilla para crear bases equivalentes en nutricion, fisioterapia o entrenamiento de fuerza.
- Evaluacion de pipelines RAG en chino: al incluir un indice ya construido y un conjunto de consultas de ejemplo con resultados esperados, resulta util como banco de pruebas minimo para comparar estrategias de recuperacion (`k`, normalizacion, modelos de embeddings alternativos).
- Demo educativa de RAG de extremo a extremo: el repositorio esta escrito como tutorial incremental (instalacion, descarga, descifrado, recuperacion, prompt, llamada al modelo), por lo que encaja como material docente para explicar la diferencia entre conocimiento parametrico y recuperado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de recuperacion (recall@k, MRR, nDCG), ni evaluaciones de fidelidad o groundedness del LLM sobre el contexto recuperado, ni comparaciones cuantitativas con otras bases de conocimiento. Las unicas cifras verificables son el numero de fragmentos (465), su reparto por dominio y el tamano del fichero GGUF del repositorio hermano (aproximadamente 4,8 GB en Q4_K_M).

## Requisitos de hardware

- Componente de recuperacion (este repositorio): funciona integramente en CPU. El autor instala `faiss-cpu`, `sentence-transformers` y `numpy`, y el indice completo cabe en el propio repositorio, cuyo tamano reportado es de 0,0 GB.
- Memoria principal: no se documenta una cifra concreta. El cuello de botella practico es la carga del modelo de embeddings `BAAI/bge-small-zh-v1.5` en memoria, no el indice.
- GPU: no se requiere GPU para el indice ni para los embeddings. La model card no menciona ninguna GPU concreta (A100, H100, RTX 4090 u otras).
- Componente generativo (repositorio hermano): el autor recomienda `qwen3-8b-sport-weight-Q4_K_M.gguf`, de aproximadamente 4,8 GB, servido con `llama-server` en el puerto 8080. Ese tamano de fichero orienta sobre el espacio en disco o memoria necesario, pero el repositorio no publica requisitos de VRAM ni recomendaciones de GPU.
- Opciones de despliegue documentadas: `llama.cpp` / `llama-server` con API compatible con OpenAI. No se mencionan vLLM, TGI, Ollama ni otras alternativas.
- Latencia y throughput: no disponibles. La model card solo indica que la primera ejecucion puede ser lenta porque descarga el modelo de embeddings, lo que atribuye a la red.
- Dependencias de software: Python 3.9 o superior, `faiss-cpu`, `sentence-transformers`, `numpy` y, para el ejemplo de generacion, el cliente `openai`.

## Comparativa con modelos similares

No se conocen en la informacion disponible otros indices RAG publicos directamente comparables (misma tematica, mismo idioma y mismo tamano de corpus), por lo que no se puede establecer una comparativa de rendimiento. La comparacion factible es entre este repositorio y los otros artefactos del mismo autor, que cubren etapas distintas del pipeline:

| Artefacto | Tipo | Contenido | Tamano / cifra | Licencia | Requisito de acceso |
|---|---|---|---|---|---|
| `chenhaodev/qwen3-8b-sport-weight-rag` | Indice de recuperacion | 465 fragmentos vectorizados de obras sobre deporte y peso | 465 vectores, repo de 0,0 GB | No disponible; uso del texto restringido a investigacion y no comercial | Contrasena para descifrar `docs_meta.enc` |
| `chenhaodev/qwen3-8b-sport-weight-lora` | Adaptador LoRA sobre Qwen3-8B | Pesos del ajuste fino especializado | No disponible | No disponible | Repositorio publico |
| `chenhaodev/qwen3-8b-sport-weight-gguf` | Pesos cuantizados | Modelo especializado listo para `llama.cpp` | `Q4_K_M` de aproximadamente 4,8 GB | No disponible | Repositorio publico |
| LLM generico sin RAG | Modelo de lenguaje | Conocimiento parametrico | Depende del modelo | Depende del modelo | No requiere indice |

## Limitaciones y advertencias

- Naturaleza del artefacto: no es un modelo entrenado; quien espere pesos, ficha de parametros o resultados de benchmarks no los encontrara aqui. Las capacidades reales de generacion dependen del LLM que se conecte.
- Acceso restringido al texto: sin la contrasena de `docs_meta.enc` no se puede ejecutar el flujo completo. El indice devuelve identificadores, pero no el texto legible que debe insertarse en el prompt, por lo que la recuperacion queda inservible en la practica.
- Restricciones legales: los fragmentos proceden de libros protegidos por derechos de autor; la model card prohibe explicitamente el uso comercial y limita el proposito a investigacion y divulgacion. No se especifica una licencia formal para el indice ni para el script.
- Riesgo de alucinacion persistente: el propio autor reconoce que el RAG reduce las invenciones, no las elimina. El prompt de ejemplo incluye la instruccion de no inventar, lo que indica que el problema sigue presente si el contexto recuperado es irrelevante.
- Dependencia estricta del modelo de embeddings: la busqueda solo es valida si se usa exactamente `BAAI/bge-small-zh-v1.5`. Cambiar de modelo exige reindexar el corpus completo.
- Cobertura tematica limitada y desequilibrada: 465 fragmentos con fuerte concentracion en gestion de peso laboral (108) y rehabilitacion cardiaca o de cronicas (87), frente a solo 33 en diabetes. Las preguntas fuera de esos siete dominios devolveran resultados poco pertinentes.
- Ambito idiomatico: todo el material y los ejemplos estan en chino simplificado. No hay evidencia de que la recuperacion funcione bien con consultas en castellano.
- Ausencia de evaluacion: sin metricas de recuperacion ni de fidelidad, no es posible justificar el uso en produccion sin una validacion propia.
- Advertencia de dominio sanitario: las respuestas pueden interpretarse como consejo medico. Cualquier despliegue real deberia incluir supervision profesional y avisos claros al usuario.
- Madurez del repositorio: cero descargas y cero likes en el momento de la consulta, y una unica actualizacion registrada, lo que sugiere ausencia de validacion por parte de la comunidad.
- Incoherencia de fechas: los metadatos indican creacion y actualizacion en septiembre de 2026, posterior a la fecha habitual de consulta de este tipo de fichas.

## Enlaces

- Repositorio del indice RAG: https://huggingface.co/chenhaodev/qwen3-8b-sport-weight-rag
- Repositorio del modelo afinado (LoRA): https://huggingface.co/chenhaodev/qwen3-8b-sport-weight-lora
- Repositorio de pesos cuantizados GGUF: https://huggingface.co/chenhaodev/qwen3-8b-sport-weight-gguf
- Modelo de embeddings utilizado: https://huggingface.co/BAAI/bge-small-zh-v1.5
- Clonado alternativo citado en la model card: https://hf-mirror.com/chenhaodev/qwen3-8b-sport-weight-rag
- Documentacion adicional mencionada por el autor: `LLAMA_RAG_GUIDE.md` en el repositorio o en el directorio raiz del proyecto
- Papers, blogs, demos o repositorios adicionales: no disponibles en la informacion proporcionada
