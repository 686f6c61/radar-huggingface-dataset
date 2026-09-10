# BobbyLLM/Qwen3.5-4B-EU-Tool-Q4_K_M-GGUF

## Resumen

BobbyLLM/Qwen3.5-4B-EU-Tool-Q4_K_M-GGUF es una version cuantizada en formato GGUF del modelo birgermoell/Qwen3.5-4B-EU-Tool, un modelo de generacion de texto de aproximadamente 4,84 mil millones de parametros orientado a uso de herramientas (tool use), function calling y flujos agenticos en lenguas europeas. La conversion la ha realizado el usuario BobbyLLM mediante llama.cpp a traves del espacio GGUF-my-repo de ggml.ai, y se publica bajo licencia Apache 2.0.

El interes principal del modelo reside en su cobertura multilingue: la model card declara soporte para 26 idiomas europeos, entre ellos castellano, catalan no incluido pero si portugues, frances, aleman, italiano, neerlandes, polaco, griego, sueco, danes, finlandes, checo, eslovaco, esloveno, croata, hungaro, rumano, bulgaro, estonio,leton, lituano, islandes, noruego, irlandes y ucraniano, ademas de ingles. Esa combinacion de tamano contenido (apto para hardware de consumo), licencia permisiva y capacidades de function calling lo situa como candidato para despliegues locales en entornos con requisitos de soberania de datos.

Se trata, sin embargo, de una publicacion recien creada (10 de septiembre de 2026, con 0 descargas y 0 likes en el momento de redactar esta ficha) y sin datos publicados de benchmarks, longitud de contexto o detalles de entrenamiento en la informacion disponible. Esto limita cualquier evaluacion cuantitativa y obliga a tratar el modelo como una opcion a validar internamente antes de llevarlo a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. El modelo base pertenece a la familia Qwen3.5, pero la model card no detalla la arquitectura (transformer, MoE, hibrida, etc.) |
| Parametros totales | 4.841.450.496 (aproximadamente 4,84 mil millones), segun el recuento de safetensors del modelo base |
| Parametros activos | No aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible. El ejemplo de la model card usa `-c 2048` en llama-server, pero es un valor de ejemplo del comando, no una especificacion del modelo |
| Tipos de cuantizacion | Q4_K_M (unica cuantizacion publicada en este repositorio); el autor no documenta otras variantes |
| Idiomas soportados | 26 idiomas: bulgaro, checo, danes, aleman, griego, ingles, castellano, estonio, finlandes, frances, irlandes, croata, hungaro, islandes, italiano, lituano, leton, neerlandes, noruego, polaco, portugues, rumano, eslovaco, esloveno, sueco y ucraniano |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `qwen3.5-4b-eu-tool-q4_k_m.gguf`); el modelo base se distribuye en safetensors |
| Tamano del repositorio | 3,1 GB |
| Pipeline declarado | text-generation |
| Libreria declarada | transformers |
| Fecha de publicacion | 2026-09-10 |

## Arquitectura y entrenamiento

La informacion disponible no permite describir la arquitectura interna del modelo. La model card de esta publicacion se limita a indicar que se trata de una conversion a GGUF del modelo birgermoell/Qwen3.5-4B-EU-Tool realizada con llama.cpp y el espacio GGUF-my-repo, y remite a la model card original para obtener mas detalles. No se especifican el tipo de atencion, el numero de capas, la dimension oculta, el uso de atencion lineal o híbrida, ni si la familia Qwen3.5 emplea mezcla de expertos. Tampoco se documenta la longitud de contexto nativa.

Respecto al entrenamiento, los tags del repositorio indican que el modelo base ha pasado por una fase de post-training orientada a tool use, function calling y comportamiento agentico, con enfasis en cobertura multilingue europea. No se proporcionan datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, la existencia de RLHF, DPO u otras tecnicas de alineamiento, ni sobre metodologias de decodificacion especulativa. Cualquier afirmacion adicional al respecto seria especulativa.

La unica transformacion verificable en esta publicacion es la cuantizacion a Q4_K_M, que reduce el peso de los parametros a aproximadamente 4 bits por peso con escalas de grupo, lo que implica una perdida de precision inevitable frente a los pesos originales en safetensors y puede afectar de forma mas acusada a tareas sensibles a la precision numerica, como el razonamiento aritmetico o el function calling con argumentos estructurados.

## Capacidades

- Generacion de texto conversacional y de proposito general en 26 idiomas europeos, segun los idiomas declarados en la model card.
- Tool use y function calling, segun los tags `tool-use`, `function-calling` y `agentic` del modelo base.
- Flujos agenticos multi-paso: la etiqueta `agentic` sugiere entrenamiento para encadenar llamadas a herramientas, aunque no se documentan detalles del formato de plantilla ni del protocolo soportado.
- Post-training especifico para lenguas europeas, lo que puede traducirse en mejor cobertura de idiomas minoritarios (islandes, irlandes, estonio, esloveno) que modelos genericos centrados en ingles.
- Inferencia local mediante llama.cpp, con soporte de CLI y servidor HTTP compatible con la API de llama-server.
- Capacidades no disponibles: no se declara soporte de vision, audio, modo thinking explicito, ni funciones multimodales. No se documenta soporte de contexto largo ni de razonamiento extendido.

## Casos de uso

- Asistente local en hardware de consumo: con 4,84 mil millones de parametros en Q4_K_M (aproximadamente 3 GB de pesos), el modelo puede ejecutarse en portatiles y equipos de sobremesa sin GPU dedicada de gama alta mediante llama.cpp, lo que permite asistentes de texto offline sin envio de datos a la nube.
- Atencion al cliente multilingue en la Union Europea: el soporte declarado de 26 idiomas permite atender consultas en la lengua del usuario sin desplegar un modelo distinto por idioma, simplificando la infraestructura en empresas con operacion en varios paises.
- Agentes de automatizacion con function calling: integrado en un orquestador de agentes, el modelo puede invocar APIs internas, consultar bases de datos o crear entradas de calendario mediante llamadas estructuradas, siempre que se valide el formato de herramienta soportado por el modelo base.
- Procesamiento documental on-premise con requisitos de cumplimiento: en sectores regulados (sanidad, legal, administracion publica) donde no se permite enviar texto a servicios externos, el modelo puede resumir, clasificar y extraer campos de documentos en la lengua local del usuario.
- Normalizacion y enrutado de tickets de soporte: clasificacion de tickets entrantes en varios idiomas, extraccion de entidades y asignacion a la cola correspondiente, con coste de inferencia bajo gracias al tamano reducido del modelo.
- Traduccion y reescritura asistida dentro de un flujo editorial: el modelo puede servir como primer paso de traduccion o de adaptacion de tono entre lenguas europeas, con revision humana posterior, aprovechando su cobertura declarada de idiomas.
- Integracion en herramientas de escritorio: al distribuirse en GGUF, puede empaquetarse en aplicaciones de escritorio o plugins de IDE que ejecuten inferencia local, sin dependencia de conectividad.
- Prototipado rapido de pipelines RAG: el modelo puede actuar como generador final en un sistema de recuperacion aumentada con documentacion multilingue, con un coste de VRAM bajo que permite compartir GPU con el motor de embeddings y el indice vectorial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card de esta publicacion ni la del modelo base incluyen cifras de MMLU, HumanEval, GSM8K, MT-Bench, evaluaciones de function calling (BFCL, ToolBench) o metricas multilingues (MGSM, GlobalMMLU). Las busquedas web realizadas no devolvieron ningun enlace tecnico relevante sobre este modelo; los unicos resultados obtenidos fueron paginas genericas de Wikipedia, sin relacion con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion Q4_K_M y aproximadamente 4,84 mil millones de parametros, los pesos ocupan alrededor de 2,9 a 3,1 GB (coherente con el tamano de repositorio declarado de 3,1 GB). Sumando cache KV, el consumo tipico se situa en el entorno de 4 a 6 GB dependiendo de la longitud de contexto configurada.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM resulta suficiente para contextos moderados (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090). En GPUs profesionales (A100, H100) el modelo es enormemente sobredimensionado en memoria y solo tendria sentido por motivos de agregacion de cargas o de throughput masivo.
- GPU de consumo: si, cabe con holgura en GPUs de consumo modernas e incluso en equipos con 8 GB de VRAM. Puede ejecutarse parcialmente en CPU con offload parcial de capas en GPUs de 4 GB.
- CPU y Apple Silicon: funciona en CPU x86 moderna mediante llama.cpp, y en Macs con Apple Silicon aprovechando Metal; un equipo con 8-16 GB de memoria unificada es suficiente.
- Opciones de despliegue: llama.cpp (llama-cli y llama-server), llama-cpp-python, Ollama (importando el GGUF mediante Modelfile), LM Studio, Jan y otros clientes compatibles con GGUF. Para vLLM o TGI se requeriria normalmente el modelo en safetensors, ya que el soporte de GGUF en esos motores es limitado o parcial.
- Latencia y throughput: no disponibles. Dependen del hardware, de la longitud de contexto y del backend; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Benchmarks |
|---|---|---|---|---|---|
| BobbyLLM/Qwen3.5-4B-EU-Tool-Q4_K_M-GGUF | 4,84B | No disponible | Apache 2.0 | GGUF | No disponible |
| birgermoell/Qwen3.5-4B-EU-Tool (modelo base) | 4,84B | No disponible | No disponible en la informacion proporcionada (la publicacion GGUF declara Apache 2.0) | safetensors | No disponible |
| Otras cuantizaciones GGUF de la familia Qwen3.5-4B | No disponible | No disponible | No disponible | GGUF | No disponible |
| Modelos abiertos de ~3B a 8B con soporte multilingue europeo (por ejemplo, variantes cuantizadas de la familia Llama 3.x o Gemma) | No disponible | No disponible | No disponible | GGUF | No disponible |

No se dispone de datos verificados en la informacion proporcionada que permitan establecer una comparacion cuantitativa de rendimiento, contexto o calidad multilingue frente a alternativas. Los unicos datos comparables de forma fiable son los del propio modelo base, del que esta publicacion es una conversion de formato con cuantizacion Q4_K_M.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad en razonamiento, codigo, matematicas, function calling o cobertura multilingue real. La afirmacion de soporte de 26 idiomas proviene de los metadatos del autor, no de una evaluacion independiente.
- Riesgo de alucinacion: como cualquier modelo de generacion de texto de este tamano, puede producir contenido factualmente incorrecto o inventar argumentos en llamadas a herramientas. Es obligatorio validar los esquemas de function calling antes de ejecutarlos.
- Perdida por cuantizacion: la variante Q4_K_M introduce degradacion respecto a los pesos originales en safetensors, especialmente en tareas que requieren precision numerica o generacion de estructuras JSON estrictas.
- Longitud de contexto no documentada: se desconoce la ventana real del modelo base y si la conversion conserva la configuracion original. El valor `-c 2048` que aparece en la model card es un ejemplo de comando, no una especificacion.
- Idiomas declarados pero no verificados: la lista de 26 idiomas incluye lenguas con pocos recursos (irlandes, islandes, estonio, esloveno, lituano, leton). La calidad real por idioma no esta medida y probablemente sea desigual.
- Validacion comunitaria nula: el repositorio registra 0 descargas y 0 likes, sin issues ni discusiones publicas. No existe retroalimentacion de terceros sobre su comportamiento.
- Trazabilidad limitada del modelo base: la model card original de birgermoell/Qwen3.5-4B-EU-Tool no se incluye en detalle en esta publicacion, por lo que se desconoce el dataset de post-training, los filtros aplicados y cualquier sesgo incorporado.
- Licencia: la publicacion declara Apache 2.0, que permite uso comercial, modificacion y redistribucion con atribucion. No obstante, conviene verificar la licencia efectiva del modelo base y de los pesos originales antes de un despliegue comercial, ya que la informacion proporcionada no la detalla.
- Adecuacion a produccion: el tamano de 4,84B limita la calidad en tareas complejas de razonamiento multi-paso en comparacion con modelos de 30B o superiores. Para flujos agenticos criticos se recomienda evaluacion interna con casos representativos antes de sustituir un modelo mayor.

## Enlaces

- Repositorio GGUF: https://huggingface.co/BobbyLLM/Qwen3.5-4B-EU-Tool-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/birgermoell/Qwen3.5-4B-EU-Tool
- Espacio GGUF-my-repo utilizado para la conversion: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Instrucciones de uso de llama.cpp: https://github.com/ggerganov/llama.cpp?tab=readme-ov-file#usage

Nota: las busquedas web realizadas no devolvieron enlaces tecnicos relevantes sobre este modelo (papers, blogs o demos); los unicos resultados obtenidos fueron paginas genericas de Wikipedia sin relacion con el.
