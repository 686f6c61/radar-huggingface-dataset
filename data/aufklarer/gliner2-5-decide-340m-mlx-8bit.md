# aufklarer/GLiNER2.5-Decide-340M-MLX-8bit

## Resumen

GLiNER2.5-Decide-340M-MLX-8bit es una conversion al formato MLX del modelo `fastino/GLiNER2.5-Decide`, publicada por el usuario `aufklarer` para inferencia nativa en Apple Silicon a traves de la libreria Swift `speech-swift`. El modelo original es un encoder de 340 M de parametros desarrollado por Fastino, con licencia Apache 2.0, que no genera texto: recibe un texto junto con un esquema de etiquetas definido por el usuario y devuelve, o bien una probabilidad por etiqueta (clasificacion de etiqueta unica), o bien los fragmentos del texto original que corresponden a cada etiqueta (extraccion de entidades).

La arquitectura combina un encoder DeBERTa-v3-large con las cabezas de span y clasificacion de GLiNER2, segun el articulo arXiv:2507.18546. Su interes practico esta en el coste: al ser un encoder de 340 M y no un modelo generativo, resuelve tareas de enrutado, clasificacion y extraccion con latencias de milisegundos y sin GPU. El modelo upstream se presento el 24 de septiembre de 2026 con cifras de 167 ms por respuesta en una CPU de 48 nucleos y un 60,1 % de precision media en la suite propia Fast Decisions (17 conjuntos de datos), frente al 57,5 % de JevK5.

Esta ficha describe especificamente la variante MLX INT8 mixta: pesos de 567 MB, contexto de 512 tokens codificados y ejecucion en un unico proceso con 0,85 GB de memoria pico medida en un Apple M5 Pro. Es relevante ahora porque permite desplegar en local, en portatiles y equipos de sobremesa con chip de Apple, un componente de decision estructurada que normalmente se resolveria con llamadas a un LLM generativo mucho mas caro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder DeBERTa-v3-large con cabezas GLiNER2 de span y clasificacion |
| Parametros totales | 340 M (cifra del modelo original) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens codificados (esquema de etiquetas y texto conjuntamente) |
| Tipos de cuantizacion | INT8 mixto: pesos afines de 8 bits con grupo 64 en las matrices del encoder y los embeddings de tokens; float16 en cabezas, normas, embeddings relativos y activaciones |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 (pesos del modelo); MIT (codigo de conversion de referencia) |
| Formato de pesos | safetensors en layout MLX, 567,0 MB |
| Tamano del repositorio | 0,6 GB |
| Pipeline declarado | text-classification |
| Libreria | mlx |
| Hash SHA-256 de los pesos | `61e91848b390fbf23dcbe76419d835644f76afefe554de3e6d1789d5e1e4f282` |
| Revision del checkpoint original | `7ee5da4c2415e32259bcdc0b1a7367c32ce8d6f6` |
| Tokenizador | Unigram con tokens de esquema GLiNER |
| Modelo base | fastino/GLiNER2.5-Decide |

## Arquitectura y entrenamiento

El modelo es un encoder bidireccional basado en DeBERTa-v3-large, con atencion desacoplada y embeddings de posicion relativa, sobre el que se montan las cabezas de GLiNER2: una cabeza de clasificacion que puntua cada etiqueta del esquema proporcionado por el usuario y una cabeza de extraccion que localiza spans en el texto de entrada. El articulo de referencia (arXiv:2507.18546) describe el planteamiento de GLiNER2, que comparte encoder entre ambas tareas y condiciona la salida al esquema de etiquetas introducido en el prompt de entrada, de modo que no hace falta reentrenar para cambiar el conjunto de etiquetas.

El modelo original fue post-entrenado especificamente para toma de decisiones estructurada, segun la documentacion de Fastino: evalua preguntas tipadas definidas por el usuario y puede decodificar respuestas relacionadas de forma conjunta bajo restricciones explicitas, devolviendo decisiones con probabilidades, puntuaciones de confianza y metadatos de viabilidad. Los detalles concretos del dataset de entrenamiento, el numero de tokens y el uso de RLHF o DPO no estan disponibles en la informacion proporcionada.

En cuanto a esta publicacion concreta, se trata de una conversion de pesos sin reentrenamiento: los pesos del checkpoint upstream se transforman al layout de MLX con cuantizacion afina de 8 bits (grupo 64) para las matrices del encoder y los embeddings de tokens, mientras que cabezas, normas, embeddings relativos y activaciones se mantienen en float16. El procedimiento sigue el trabajo `gliner2-mlx` de Andrew Chen Wang (licencia MIT). No hay, por tanto, innovacion arquitectonica propia de esta variante: el unico cambio material es la precision numerica y el formato.

## Capacidades

- Clasificacion de etiqueta unica: dado un texto y una lista de etiquetas, devuelve una probabilidad por etiqueta.
- Extraccion de entidades: devuelve los spans del texto original asociados a cada etiqueta, con desplazamientos en unidades UTF-16.
- Decodificacion conjunta bajo restricciones explicitas, segun la documentacion del modelo original de Fastino.
- Salida con probabilidades, puntuaciones de confianza y metadatos de viabilidad (caracteristica declarada por el autor del modelo base).
- No genera texto: no hay decodificacion autoregresiva ni capacidad de continuar una conversacion.
- Tool calling y function calling: no aplica, el modelo no emite llamadas a herramientas.
- Razonamiento multi-paso y comportamiento agentico: no aplica directamente; el modelo puede actuar como componente de decision dentro de un agente externo.
- Idiomas: unicamente ingles.
- Vision, audio y modalidades adicionales: no disponibles en el modelo; la libreria anfitriona `speech-swift` cubre otros componentes de voz, pero este checkpoint es exclusivamente de texto.
- Modo de pensamiento explicito: no aplica.

## Casos de uso

- Enrutado de intenciones en asistentes locales para Apple Silicon: con un esquema de seis etiquetas, el modelo resuelve el enrutado en una mediana de 7,6 ms por peticion en un M5 Pro, lo que permite clasificar el comando del usuario antes de invocar cualquier modelo generativo.
- Extraccion de entidades en pipelines de normalizacion: la extraccion de dos tipos de etiqueta tarda 8,9 ms de mediana; los spans se devuelven como menciones de texto, de modo que el codigo de la aplicacion se encarga de normalizar fechas, horas y nombres.
- Guardrails y filtrado previo a un LLM: clasificar el texto entrante contra un conjunto de categorias de riesgo antes de enviarlo a un modelo generativo reduce coste y superficie de abuso, y el modelo cabe en 0,85 GB de memoria pico.
- Clasificacion y enrutado de tickets de soporte: asignar cada ticket a un equipo o categoria mediante un esquema de etiquetas definido por el cliente, sin reentrenar y sin salir del dispositivo del usuario.
- Componente de decision en aplicaciones nativas de macOS e iOS: el checkpoint esta pensado para el modulo `GLiNER` de `speech-swift`, con API en Swift (`classify`, `extractEntities`) y una CLI (`speech gliner classify` / `speech gliner extract`) para pruebas y scripts.
- Etiquetado debil y preanotacion de corpus: extraer menciones sobre grandes volumenes de texto en ingles para generar datos de entrenamiento o validar anotaciones existentes, dado el bajo coste por inferencia.
- Procesamiento por lotes en CPU o GPU integrada sin acelerador dedicado: al no requerir CUDA, encaja en entornos de escritorio, portatiles y servidores Apple donde no hay GPU discreta disponible.
- Enrutado de comandos en asistentes de voz: combinado con los modulos de reconocimiento y sintesis de `speech-swift`, el modelo decide la intencion del enunciado transcrito antes de responder.

## Benchmarks y rendimiento

Rendimiento medido por el autor de la conversion en un Apple M5 Pro, maquina en reposo, un proceso por variante y modelo cargado una sola vez. Las medianas incluyen la tokenizacion: 16 casos de enrutado con seis etiquetas y 8 casos de extraccion con dos etiquetas, cinco llamadas cronometradas tras cinco de calentamiento.

| Metrica (variante MLX INT8) | Valor |
|---|---|
| Enrutado, mediana | 7,6 ms |
| Extraccion, mediana | 8,9 ms |
| Memoria pico del proceso | 0,85 GB |
| Fidelidad frente al modelo PyTorch original | Etiquetas, spans y desplazamientos identicos en 24 casos de referencia |
| Diferencia maxima de confianza frente al original | 0,0060 (umbral de aceptacion 0,02) |

Datos publicados para el modelo upstream `fastino/GLiNER2.5-Decide`, no medidos sobre esta conversion MLX y procedentes de la suite propia del proveedor:

| Metrica (modelo original, segun Fastino) | Valor |
|---|---|
| Precision media en Fast Decisions (17 conjuntos de datos) | 60,1 % |
| Comparativa con JevK5 en la misma suite | 57,5 % para JevK5 |
| Latencia por respuesta en CPU de 48 nucleos, sin GPU | 167 ms |

No se han publicado resultados de benchmarks independientes (MMLU, GLUE, SuperGLUE, CoNLL u otros) en la informacion disponible.

## Requisitos de hardware

- Aceleracion: requiere MLX, por lo que solo funciona en Apple Silicon (familias M). No es compatible con CUDA, ROCm ni aceleradores Intel.
- Memoria: pesos de 567 MB en disco; memoria pico del proceso medida en 0,85 GB en un M5 Pro, incluyendo el runtime.
- Cabe en cualquier Mac con chip de Apple y memoria unificada razonable (8 GB o mas); el cuello de botella es la memoria compartida, no la VRAM dedicada.
- GPU recomendadas: no aplica en el sentido habitual; el modelo esta pensado para la GPU integrada del chip de Apple. Para la version PyTorch upstream, una GPU con 2-4 GB de VRAM (RTX 3060, RTX 4090, A100, H100) es mas que suficiente, aunque no se proporcionan cifras de rendimiento para esas plataformas en esta informacion.
- Opciones de despliegue: modulo `GLiNER` de `speech-swift` (Swift, API `fromPretrained(variant: .int8)`, `classify` y `extractEntities`) y su CLI (`speech gliner classify` / `speech gliner extract`). No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI: el formato es safetensors en layout MLX, no GGUF.
- Latencia: 7,6 ms de mediana en enrutado y 8,9 ms en extraccion sobre M5 Pro, en las condiciones descritas por el autor. El modelo upstream reporta 167 ms por respuesta en una CPU de 48 nucleos.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Rendimiento declarado |
|---|---|---|---|---|---|
| aufklarer/GLiNER2.5-Decide-340M-MLX-8bit (este) | 340 M | 512 tokens | safetensors MLX INT8, Apple Silicon | Apache-2.0 (pesos), MIT (codigo de conversion) | 7,6 ms enrutado / 8,9 ms extraccion en M5 Pro; 0,85 GB de memoria pico |
| fastino/GLiNER2.5-Decide (upstream) | 340 M | no disponible | PyTorch, multiplataforma | Apache-2.0 | 60,1 % de precision media en Fast Decisions; 167 ms por respuesta en CPU de 48 nucleos |
| JevK5 | no disponible | no disponible | no disponible | no disponible | 57,5 % de precision media en la suite Fast Decisions, segun Fastino |
| Conversiones gliner2-mlx de otros autores | 340 M (equivalente) | no disponible | safetensors MLX | MIT (codigo de conversion) | no disponible |

La comparativa se limita a lo publicado: no hay datos de contexto, licencia o formato para JevK5 en la informacion disponible, y las cifras de precision de la suite Fast Decisions provienen del propio proveedor del modelo, no de una evaluacion independiente.

## Limitaciones y advertencias

- El modelo no genera texto: solo produce etiquetas con probabilidad o spans; no puede usarse como chatbot ni como modelo de continuacion.
- El contexto util es de 512 tokens codificados y el esquema de etiquetas consume parte de ese presupuesto, de modo que documentos largos o esquemas con muchas etiquetas reducen el margen disponible para el texto.
- Solo soporta ingles; no hay capacidades multilingues declaradas.
- Las probabilidades son puntuaciones del modelo, no garantias. La propia documentacion advierte de ello.
- Los spans son menciones: fechas y horas se devuelven como texto sin normalizar, y los desplazamientos estan en unidades UTF-16, lo que exige conversion explicita si se trabaja con indices de caracteres en otros lenguajes.
- Dependencia total de Apple Silicon y MLX: no se puede desplegar en servidores con GPU NVIDIA o AMD sin recurrir al checkpoint upstream en PyTorch.
- El repositorio presenta 0 descargas y 0 me gusta en el momento de redactar esta ficha, por lo que no cuenta con validacion de la comunidad.
- La verificacion de fidelidad (24 casos de referencia, diferencia maxima de confianza de 0,0060) la realiza el autor de la conversion, no un tercero independiente.
- Las cifras de precision y latencia del modelo base proceden de la suite propia de Fastino, con el posible sesgo de proveedor que ello implica.
- Al ser una conversion sin reentrenamiento, hereda los sesgos del checkpoint original, que no se documentan en la informacion proporcionada.
- Licencia Apache-2.0 en los pesos y MIT en el codigo de conversion, ambas permisivas para uso comercial; conviene conservar los ficheros de licencia incluidos en el repositorio.
- El tokenizador es un Unigram especifico con tokens de esquema GLiNER: sustituirlo por otro tokenizador rompe el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aufklarer/GLiNER2.5-Decide-340M-MLX-8bit
- Modelo base upstream: https://huggingface.co/fastino/GLiNER2.5-Decide
- Libreria de inferencia speech-swift: https://github.com/soniqo/speech-swift
- Conversion de referencia gliner2-mlx: https://github.com/Andrew-Chen-Wang/gliner2-mlx
- Articulo GLiNER2: https://arxiv.org/abs/2507.18546
- Blog de Fastino sobre GLiNER2.5-Decide: https://fastino.ai/blog/gliner-2-5-decide-open-weight-decision-model
- Cobertura en deai.org: https://www.deai.org/news/fastino-gliner2-5-decide-open-weight-decision-model
- Analisis en explainx.ai: https://www.explainx.ai/blog/gliner-2-5-decide-fastino-340m-open-weight-decision-model-2026
- Cobertura en MarkTechPost: https://www.marktechpost.com/2026/09/24/fastino-releases-gliner2-5-decide-a-340m-open-weight-decision-model-that-runs-on-cpu/
- Cobertura en datanorth.ai: https://datanorth.ai/news/fastino-releases-gliner2-5-decide
