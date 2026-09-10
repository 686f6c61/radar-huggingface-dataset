# OliviaRossi/KAT-Qwopus-Ornith-Coder-35B-A3B-Q5_K_M-GGUF

## Resumen

KAT-Qwopus-Ornith-Coder-35B-A3B-Q5_K_M-GGUF es una version cuantizada en formato GGUF del modelo OliviaRossi/KAT-Qwopus-Ornith-Coder-35B-A3B, un modelo de lenguaje orientado a generacion de codigo y flujos de trabajo agenticos. El autor, OliviaRossi, lo publica como un "merge" (fusion) de modelos previos construido con tecnicas polar-ties y DARE, segun los tags del repositorio, y con la etiqueta agentic-coding y swe-bench como senas de identidad declaradas. El modelo cuenta con 34.660.610.688 parametros totales (unos 34,66 mil millones) segun los datos de safetensors, y la nomenclatura "35B-A3B" apunta a una arquitectura de mezcla de expertos (MoE) con aproximadamente 3.000 millones de parametros activos por token, aunque este extremo no se confirma en la model card.

La relevancia de esta ficha concreta es practica: se trata de una conversion a GGUF realizada con el espacio GGUF-my-repo de ggml.ai sobre llama.cpp, lo que permite ejecutar un modelo de casi 35.000 millones de parametros en hardware de consumo o en estaciones de trabajo sin GPU de datacenter, a costa de una perdida de precision derivada de la cuantizacion Q5_K_M. El repositorio ocupa 24,7 GB y esta etiquetado con licencia apache-2.0, idiomas en, zh y code.

Conviene ser cauto: el repositorio no incluye datos de benchmarks, longitud de contexto, composicion del dataset de entrenamiento ni detalles de la arquitectura mas alla de lo que sugieren los tags. Ademas, en el momento de redactar esta ficha acumula 0 descargas y 0 me gusta, por lo que no existe validacion independiente por parte de la comunidad. Todo lo que no aparece explicitamente en la informacion disponible se marca como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos), segun nomenclatura y tags; no confirmado en la model card |
| Parametros totales | 34.660.610.688 (34,66 mil millones) |
| Parametros activos | no disponible (la nomenclatura A3B sugiere unos 3.000 millones; sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q5_K_M (unico fichero publicado en este repositorio); no se documentan otras variantes |
| Idiomas soportados | en (ingles), zh (chino), code (codigo) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (fichero kat-qwopus-ornith-coder-35b-a3b-q5_k_m.gguf) |
| Modelo base | OliviaRossi/KAT-Qwopus-Ornith-Coder-35B-A3B |
| Tamano del repositorio | 24,7 GB |
| Tecnicas de fusion declaradas | polar-ties, dare |
| Libreria declarada | transformers |
| Pipeline | text-generation |
| Fecha de creacion | 2026-09-10 |
| Fecha de ultima actualizacion | 2026-09-10 |
| Descargas / me gusta | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no incluye una descripcion tecnica de la arquitectura. Los tags del repositorio indican "moe" y "qwen", y el propio nombre del modelo sigue el patron "35B-A3B" habitual en modelos de mezcla de expertos que declaran el total de parametros y los activos por token. Partiendo de esa nomenclatura, cabe inferir una arquitectura transformer con capas de mezcla de expertos y enrutamiento disperso, con aproximadamente 3.000 millones de parametros activos sobre un total de 34,66 mil millones, pero se trata de una inferencia a partir del nombre y no de un dato confirmado por el autor. Tampoco se especifica la ventana de contexto, el tokenizador ni el numero de expertos.

Respecto al entrenamiento, la model card no documenta el numero de tokens, la composicion del dataset, ni si hubo fases de ajuste por instrucciones, RLHF o DPO. Lo que si se declara es que el modelo base es el resultado de una fusion de modelos, aplicando las tecnicas polar-ties y DARE, habitualmente empleadas para combinar pesos de varios checkpoints reduciendo interferencias entre ellos y podando deltas de parametros. Los tags agentic-coding y swe-bench sugieren que la fusion se ha orientado a tareas de ingenieria de software y uso de herramientas, pero no se aportan resultados que lo cuantifiquen. Esta variante concreta no ha sido reentrenada: es una conversion de formato a GGUF mediante llama.cpp, realizada en el espacio GGUF-my-repo de ggml.ai, por lo que las unicas diferencias respecto al modelo base son la cuantizacion Q5_K_M y el formato de serializacion.

## Capacidades

- Generacion de texto conversacional y completado de codigo, en linea con la pipeline text-generation y los idiomas declarados (en, zh, code).
- Programacion agentica: los tags agentic-coding y swe-bench indican que el modelo esta orientado a tareas de resolucion de issues, navegacion de repositorios y edicion de codigo en varios pasos, si bien no se documentan resultados que lo respalden.
- Soporte multilingue limitado a ingles, chino y codigo; el castellano no figura entre los idiomas declarados.
- Uso con llama.cpp: la model card documenta explicitamente la invocacion mediante llama-cli y llama-server, ademas de la integracion con otros frontends compatibles con GGUF.
- Tool calling y function calling: no disponible.
- Modo de razonamiento extendido (thinking), vision o audio: no disponible.
- Capacidades especiales adicionales: no disponible.

## Casos de uso

- Agente de resolucion de issues en repositorios: integrado en un bucle de agente que lee el arbol de ficheros, localiza el codigo relevante, aplica un parche y ejecuta los tests. Los tags agentic-coding y swe-bench apuntan precisamente a este escenario, y el bajo numero de parametros activos (aproximadamente 3.000 millones) reduce el coste por token en bucles de muchas iteraciones.
- Generacion y revision de codigo en pipelines de CI/CD: el modelo puede invocarse desde un runner con llama-server para generar parches automaticos o comentar pull requests, siempre que el runner disponga de los aproximadamente 25 GB de VRAM o memoria unificada que exige la cuantizacion Q5_K_M.
- Asistente de programacion local en entorno sin conexion: al distribuirse en GGUF y caber en una unica GPU de 40 GB o en un Mac con memoria unificada de 32 GB o mas, permite desplegar un asistente de codigo en maquinas aisladas donde no se pueden enviar fuentes a APIs externas.
- Migracion y traduccion de codigo entre lenguajes o frameworks: el modelo declara soporte de codigo y de dos idiomas naturales (ingles y chino), lo que resulta util para equipos que trabajan con documentacion y bases de codigo en chino y necesitan traducir comentarios, docstrings o mensajes de error.
- Generacion de tests unitarios a partir de funciones existentes: con una ventana de contexto suficiente (no documentada) se le puede pasar el modulo completo y pedir baterias de pruebas; conviene verificar la compilacion y ejecucion real de los tests generados por el riesgo de alucinacion de APIs.
- Refactorizacion de modulos extensos: si la longitud de contexto del modelo base es amplia, la cuantizacion Q5_K_M permite abordar ficheros grandes en una sola pasada sin dividir el contexto, a cambio de un ligero deterioro en la fidelidad de sintaxis poco frecuente.
- Soporte tecnico interno sobre documentacion de producto: el modelo puede responder preguntas multi-turno sobre manuales y guias indexadas mediante RAG, aprovechando su naturaleza conversacional y su capacidad de generacion de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los tags del repositorio incluyen "swe-bench", lo que indica que el modelo base fue evaluado o disenado con ese benchmark en mente, pero no se aporta ninguna puntuacion de SWE-bench, MMLU, HumanEval, GSM8K ni de ninguna otra prueba.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q5_K_M ocupa aproximadamente 24,7 GB, por lo que se necesitan en torno a 25-26 GB solo para los pesos y del orden de 28-32 GB contando cache KV y overhead del runtime. Son estimaciones derivadas del tamano del repositorio, no cifras publicadas por el autor.
- GPU recomendadas: A100 40 GB, A100 80 GB, H100 80 GB o L40S 48 GB para carga completa en GPU. En GPUs de 24 GB (RTX 4090, RTX 3090, A5000) no cabe entera y requiere descarga parcial de capas a CPU/RAM, con la consiguiente perdida de velocidad.
- Cabe en GPU de consumo: si, con matices. Una RTX 4090 de 24 GB queda justa y obliga a offloading parcial; un equipo con 64 GB de RAM y una GPU de 24 GB puede ejecutarlo repartiendo capas. En Apple Silicon con memoria unificada de 32 GB o mas es viable mediante Metal.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama y LM Studio importando el GGUF, y cualquier frontend compatible con GGUF. Los servidores de alto throughput como vLLM o TGI no estan documentados para este repositorio y su soporte de GGUF es limitado o experimental.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

La ausencia de benchmarks publicados impide comparar el rendimiento. La tabla siguiente compara unicamente aspectos estructurales y de licencia; los datos de los modelos alternativos no provienen de la informacion proporcionada y deberian verificarse en sus repositorios oficiales.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| KAT-Qwopus-Ornith-Coder-35B-A3B-Q5_K_M-GGUF | 34,66 mil millones | no disponible (aprox. 3.000 millones segun nomenclatura) | no disponible | apache-2.0 | GGUF |
| Qwen3-30B-A3B (alternativa MoE de referencia) | no verificado en la informacion disponible | no verificado | no verificado | no verificado | safetensors, GGUF |
| Qwen2.5-Coder-32B-Instruct (alternativa densa de referencia) | no verificado en la informacion disponible | no aplica (modelo denso) | no verificado | no verificado | safetensors, GGUF |

No se dispone de datos de rendimiento comparativo entre estas opciones, por lo que la eleccion deberia basarse en pruebas propias sobre el caso de uso concreto.

## Limitaciones y advertencias

- Ausencia total de validacion externa: el repositorio registra 0 descargas y 0 me gusta en el momento de redactar esta ficha, y fue creado el 2026-09-10, por lo que no existe evidencia de uso en produccion ni informes de terceros.
- Documentacion incompleta: la model card se limita a las instrucciones de uso con llama.cpp y remite al modelo base; no detalla arquitectura, contexto, datos de entrenamiento ni evaluaciones.
- Modelo fusionado: al tratarse de un merge con polar-ties y DARE, existe riesgo de degradacion en capacidades no representadas en los modelos de origen o de olvido de ciertas tareas, un fenomeno habitual en fusiones de pesos.
- Riesgo de alucinacion: es especialmente relevante en generacion de codigo, donde el modelo puede inventar APIs, funciones de libreria o parametros inexistentes. Es imprescindible compilar y ejecutar los tests de cualquier codigo generado.
- Limitacion idiomatica: los idiomas declarados son ingles, chino y codigo. El castellano no esta soportado oficialmente y su comportamiento en ese idioma es impredecible.
- Incertidumbre sobre la licencia efectiva: el repositorio declara apache-2.0, pero al ser una fusion de varios modelos no se documenta la licencia de todos los componentes originales. Antes de un uso comercial conviene verificar la procedencia de cada modelo fusionado.
- Cuantizacion Q5_K_M: la perdida de precision respecto a los pesos originales puede afectar a tareas sensibles a la exactitud, como aritmetica de precision o generacion de codigo con sintaxis poco frecuente.
- Longitud de contexto desconocida: no es posible planificar estrategias de chunking ni evaluar si el modelo soporta conversaciones largas o repositorios extensos en una sola pasada.
- Requisitos de memoria elevados para su categoria: cerca de 25 GB de pesos mas cache hacen inviable su ejecucion en GPUs de 16 GB o menos sin offloading agresivo a CPU.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/OliviaRossi/KAT-Qwopus-Ornith-Coder-35B-A3B-Q5_K_M-GGUF
- Modelo base: https://huggingface.co/OliviaRossi/KAT-Qwopus-Ornith-Coder-35B-A3B
- Espacio GGUF-my-repo de ggml.ai: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Instrucciones de uso de llama.cpp: https://github.com/ggerganov/llama.cpp?tab=readme-ov-file#usage
