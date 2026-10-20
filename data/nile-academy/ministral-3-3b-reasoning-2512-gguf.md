# nile-academy/ministral-3-3b-reasoning-2512-gguf

## Resumen

Este repositorio, publicado por nile-academy, contiene una conversión al formato GGUF del modelo mistralai/Ministral-3-3B-Reasoning-2512, desarrollado originalmente por Mistral AI y publicado el 2 de diciembre de 2025. No se trata de un modelo entrenado por el autor del repositorio: la propia model card indica que el rol de Nile Academy es el de espejo oficial del artefacto o conversión de formato explícitamente registrada, sin entrenamiento adicional. La revisión del modelo fuente está fijada en el commit `4a36357c811bf511a7b625d132e12f22408aac91`.

El interés práctico del repositorio está en que empaqueta el modelo en cuatro variantes GGUF listas para inferencia local (Q4_K_M, Q5_K_M, Q8_0 y un proyector BF16 en formato mmproj), con tamanos de archivo de entre 2,1 GB y 3,7 GB, lo que lo sitúa en el rango de ejecución en GPU de consumo y en CPU. El modelo base es un modelo de razonamiento de 3B de parametros, con resultados reportados por el editor en AIME25 (72,1 %), GPQA Diamond (53,4 %) y LiveCodeBench (54,8 %) en modo razonamiento.

Es relevante ahora porque permite evaluar un modelo de razonamiento de menos de 4B en hardware modesto y con licencia Apache 2.0. Ahora bien, la model card advierte de forma explícita de que la cualificación de calidad de estas cuantizaciones no se ha realizado: no hay afirmación de "sin perdida significativa de calidad" y no se han publicado mediciones propias sobre estos archivos. La ventana de contexto, los idiomas soportados y los detalles de arquitectura no se documentan en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el repositorio no documenta la arquitectura del modelo base; es una conversion de formato, no un modelo nuevo) |
| Parametros totales | 3.429.006.336 (dato de safetensors del repositorio); 4.251.743.232 en el modelo fuente segun la model card, incluyendo embeddings y modalidades de origen |
| Parametros activos | No disponible (no se indica que el modelo sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (proyector mmproj), Q4_K_M, Q5_K_M, Q8_0 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (se conserva el fichero LICENSE del modelo original) |
| Formato de pesos | GGUF |
| Tamano del repositorio | 9,1 GB |
| Pipeline | text-generation |
| Modelo base | mistralai/Ministral-3-3B-Reasoning-2512 (revision `4a36357c811bf511a7b625d132e12f22408aac91`) |
| Relacion con el modelo base | quantized (conversion de formato) |
| Fecha de publicacion del original | 2025-12-02 |
| Fecha de creacion del repositorio | 2026-10-19 |

Ficheros publicados y cuantizaciones:

| Fichero | Cuantizacion | Tamano (GB) | Origen |
|---|---|---:|---|
| Ministral-3-3B-Reasoning-2512-BF16-mmproj.gguf | BF16 PROJECTOR | 0,842 | export del editor oficial |
| Ministral-3-3B-Reasoning-2512-Q4_K_M.gguf | Q4_K_M | 2,147 | export del editor oficial |
| Ministral-3-3B-Reasoning-2512-Q5_K_M.gguf | Q5_K_M | 2,474 | export del editor oficial |
| Ministral-3-3B-Reasoning-2512-Q8_0.gguf | Q8_0 | 3,652 | export del editor oficial |

## Arquitectura y entrenamiento

El repositorio no describe la arquitectura interna del modelo (tipo de transformer, atencion, mecanismos de razonamiento o datos de entrenamiento). Lo que documenta es el proceso de publicacion: se trata de artefactos derivados del editor oficial, con la revision del modelo fuente fijada, ficheros de procedencia conservados en `provenance/` y recibos de conversion registrados en `model-metadata.json`, incluyendo hashes SHA-256 de cada fichero y rutas y revisiones de origen. No hay entrenamiento adicional ni ajuste fino por parte de Nile Academy.

El dato técnico mas informativo que si aparece es la presencia de un fichero `BF16-mmproj.gguf` de 0,842 GB, que corresponde a un proyector multimodal en formato mmproj; esto sugiere que el modelo fuente admite entrada de imagenes ademas de texto, aunque la model card no detalla la arquitectura de vision ni su resolucion de entrada. Cualquier afirmacion sobre datos de entrenamiento (numero de tokens, composicion del corpus, RLHF/DPO) no está disponible en la informacion proporcionada. Tampoco se documentan innovaciones de decodificacion o atencion.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` y el pipeline `text-generation` indican uso en dialogos multi-turno.
- Razonamiento explicito en modo "reasoning": los benchmarks publicados por el editor se reportan bajo protocolo de razonamiento (AIME25, GPQA Diamond, LiveCodeBench).
- Matematicas de competicion: puntuacion reportada del 72,1 % en AIME25 por el editor del modelo fuente.
- Preguntas de ciencia de nivel graduado: 53,4 % en GPQA Diamond (dato del editor, no medido sobre estas cuantizaciones).
- Generacion y comprension de codigo: 54,8 % en LiveCodeBench (version no especificada) segun el editor.
- Entrada multimodal: presumiblemente soportada mediante el proyector `mmproj` incluido; el alcance exacto (imagenes, documentos escaneados u otras modalidades) no está documentado.
- Tool calling / function calling: no verificado. La model card indica que la cualificacion de chat, herramientas y plantillas esta pendiente, y que las llamadas a herramientas son propuestas sujetas a los permisos de la aplicacion consumidora.
- Capacidades multilingues: no disponibles (el campo de idiomas no esta informado en HuggingFace).
- Despliegue en CPU y CUDA: ambos son backends de ejecucion del mismo fichero de pesos, no modelos distintos.

## Casos de uso

- Prototipado local de razonamiento en portatil: con el fichero Q4_K_M (2,147 GB) el modelo puede cargarse en un equipo sin GPU dedicada y usarse para validar flujos de razonamiento antes de invertir en infraestructura.
- Asistencia en matematicas y problemas cuantitativos: el 72,1 % reportado en AIME25 lo hace util como generador de borradores de solucion en herramientas educativas, siempre con verificacion posterior del resultado.
- Generacion de codigo en pipelines de revision: el 54,8 % en LiveCodeBench permite usarlo como primer generador de parches o tests que luego pasan por revision humana y CI; no se recomienda como unico gate de calidad.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece Q4_K_M, Q5_K_M y Q8_0 del mismo origen, lo que permite montar una campana de evaluacion emparejada (referencia frente a variante) en tareas de instruccion, conocimiento, matematicas y herramientas.
- Despliegue en entornos con memoria limitada: al ocupar menos de 4 GB en pesos, cabe en instancias pequenas o en contenedores con CPU, util para servicios internos de bajo trafico.
- Procesamiento de documentos con componente visual: usando el proyector mmproj junto con los pesos, para extraccion de informacion de imagenes o capturas en flujos internos, sujeto a validacion propia porque la cualificacion multimodal no esta realizada.
- Base para experimentos de agentes con herramientas: se puede integrar en un orquestador que trate las llamadas a funciones como propuestas a validar por la aplicacion, dado que el modelo no garantiza la correccion de dichas llamadas.

## Benchmarks y rendimiento

Los unicos datos disponibles son puntuaciones reportadas por el editor del modelo fuente. La model card de este repositorio advierte de que no son mediciones de Wekala sobre estos ficheros cuantizados, que el harness, la precision y la configuracion de razonamiento difieren y que no deben interpretarse como una clasificacion normalizada entre modelos.

| Benchmark | Puntuacion (%) | Modo / condiciones |
|---|---:|---|
| AIME25 | 72,1 | razonamiento; protocolo del editor; no medido sobre esta cuantizacion |
| GPQA Diamond | 53,4 | razonamiento; protocolo del editor; no medido sobre esta cuantizacion |
| LiveCodeBench (version no especificada) | 54,8 | razonamiento; protocolo del editor; no medido sobre esta cuantizacion |

No se han publicado resultados de benchmarks medidos sobre los ficheros GGUF de este repositorio. Tampoco hay datos de latencia ni de throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,2 GB de pesos en Q4_K_M, 2,5 GB en Q5_K_M y 3,7 GB en Q8_0. Estas cifras excluyen el estado de contexto, los buffers de trabajo y el margen del driver, por lo que el consumo real sera superior.
- GPU de consumo: el modelo cabe en tarjetas de 6-8 GB con Q4_K_M o Q5_K_M y contexto corto; Q8_0 requiere mas margen. La model card indica explicitamente que no hay cualificacion de funcionamiento sostenido en 8 GB de VRAM ni de ajuste a ese perfil.
- GPU profesionales: A100, H100 y similares son unnecessarily sobredimensionadas para este tamano y solo tendrian sentido para servir muchas instancias en paralelo.
- CPU: viable, dado el tamano de los pesos; la model card senala CPU y CUDA como backends del mismo fichero.
- Movil y navegador: la cualificacion esta pendiente segun la model card; no hay perfil medido.
- Opciones de despliegue: llama.cpp y sus envoltorios (Ollama, LM Studio, servidores compatibles con la API de OpenAI). El tag `endpoints_compatible` sugiere compatibilidad con endpoints, aunque no se detalla el grado de soporte.
- vLLM y TGI: no se documenta soporte en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han proporcionado datos verificables de modelos alternativos de la misma categoria, por lo que la comparativa externa se marca como no disponible. Como referencia interna, si puede compararse el coste en disco de las propias cuantizaciones:

| Variante | Cuantizacion | Tamano (GB) | Uso previsto segun la model card |
|---|---|---:|---|
| Ministral-3-3B-Reasoning-2512 | Q8_0 | 3,652 | referencia de mayor precision frente a las demas |
| Ministral-3-3B-Reasoning-2512 | Q5_K_M | 2,474 | compromiso entre memoria y precision |
| Ministral-3-3B-Reasoning-2512 | Q4_K_M | 2,147 | requiere evaluacion emparejada por tarea |
| Ministral-3-3B-Reasoning-2512 | BF16 mmproj | 0,842 | proyector multimodal, se usa junto a los pesos |

Comparativa con otros modelos de ~3B (parametros, contexto, rendimiento, licencia): no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Calidad de cuantizacion no cualificada: la model card declara explicitamente "not qualified" y no se hace ninguna afirmacion de perdida de calidad despreciable. Cualquier uso en produccion exige una evaluacion emparejada entre la referencia y la variante.
- Ausencia de validacion comunitaria: el repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia de uso independiente.
- Benchmarks no representativos de estos ficheros: las puntuaciones proceden del modelo fuente y no se han medido sobre los GGUF publicados.
- Riesgo de alucinacion: la propia model card advierte de que el modelo puede producir salidas incorrectas o inseguras.
- Tool calling no confiable por diseno: las llamadas a herramientas se describen como propuestas sujetas a los permisos y a la admision del controlador de la aplicacion consumidora; no deben ejecutarse sin validacion.
- Contexto e idiomas sin documentar: no se dispone de longitud de contexto ni de lista de idiomas, lo que impide garantizar calidad multilingue o conversaciones largas.
- Perfil de memoria incompleto: el tamano de los pesos excluye estado de contexto, buffers y margen de driver; la compatibilidad con 8 GB de VRAM y con movil o navegador no esta medida.
- Licencia: los pesos son Apache 2.0, pero el repositorio no concede ningun derecho sobre el SDK de Wekala, que se distribuye por separado.
- Trazabilidad: la fecha de creacion del repositorio (2026-10-19) es posterior a la publicacion del modelo original (2025-12-02); conviene verificar los recibos de conversion y los hashes en `model-metadata.json` antes de desplegar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/nile-academy/ministral-3-3b-reasoning-2512-gguf
- Modelo base: https://huggingface.co/mistralai/Ministral-3-3B-Reasoning-2512
- Model card exacta del modelo fuente (revision fijada): https://huggingface.co/mistralai/Ministral-3-3B-Reasoning-2512/blob/4a36357c811bf511a7b625d132e12f22408aac91/README.md
- Anuncio del editor: https://mistral.ai/news/mistral-3
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0

Nota: la busqueda web realizada no devolvio resultados relacionados con este modelo; los enlaces anteriores proceden de la informacion del repositorio y de su model card.
