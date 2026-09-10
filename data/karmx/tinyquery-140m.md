# karmx/TinyQuery-140M

## Resumen

TinyQuery-140M es un modelo de lenguaje de 139.738.113 parametros entrenado desde inicializacion aleatoria por el autor independiente karmx. No es un chatbot general: es un modelo estrecho y experimental cuyo unico objetivo es convertir una pregunta en lenguaje natural (junto con el esquema de una base de datos y las definiciones de herramientas disponibles en tiempo de ejecucion) en una accion JSON valida. Es decir, resuelve el problema de text-to-SQL y de tool calling en entornos con recursos muy limitados.

La arquitectura es un transformer decoder-only de 12 capas y anchura 1.024, con atencion GQA (16 cabezas de consulta, 4 de clave/valor, dimension de cabeza 64), SwiGLU, RoPE y RMSNorm. Incorpora dos elementos poco habituales para su tamano: una cabeza de copia de fuente (source-copy head) que mezcla la generacion por vocabulario con atencion sobre el contexto, y una cabeza auxiliar de tres clases de accion usada solo durante el entrenamiento. El contexto esta limitado a 2.048 tokens, incluyendo el presupuesto de salida.

Su relevancia actual es doble. Por un lado, demuestra que un modelo de menos de 140 M de parametros, entrenado en una unica RTX PRO 6000 en una ventana de cuatro horas, puede alcanzar un 92,47% de exito completo de tarea en un test sintetico retenido de 1.196 ejemplos. Por otro, esta disenado explicitamente para flujos MCP (Model Context Protocol), con salidas que se serializan como cargas JSON-RPC `tools/call`, lo que lo situa en la interseccion entre los modelos pequenos y la infraestructura de agentes. Se distribuye como checkpoint nativo de PyTorch, no como modelo de Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA, SwiGLU, RoPE y RMSNorm; cabeza de copia de fuente y cabeza auxiliar de accion |
| Parametros totales | 139.738.113 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens (incluyendo el presupuesto de salida); las secuencias finales de entrenamiento alcanzaron 945 tokens |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos en BF16) |
| Idiomas soportados | Ingles, ingles imperfecto, hindi y hinglish |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors en BF16 (checkpoint nativo de PyTorch, no cargable con `AutoModel` ni `pipeline()`); aproximadamente 280 MB |
| Capas / anchura | 12 capas, anchura 1.024 |
| Atencion | 16 cabezas de consulta, 4 cabezas KV, dimension de cabeza 64 |
| Feed-forward | SwiGLU, anchura intermedia 2.816 |
| Embeddings | Entrada/salida atados; vocabulario BPE de bytes propio de 4.082 entradas (solo entrenamiento) |
| Cabeza de copia de fuente | Proyeccion puntero aprendida de 128 dimensiones y puerta de mezcla |
| Cabeza auxiliar | Tres clases de accion, usada en entrenamiento |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

El modelo es un decoder-only denso de 139,7 M de parametros con 12 capas y anchura 1.024. La atencion usa agrupacion de cabezas (16 cabezas de consulta frente a 4 de clave/valor), lo que reduce el coste del cache KV. La normalizacion es RMSNorm, las posiciones se codifican con RoPE y el bloque feed-forward usa SwiGLU con anchura intermedia de 2.816. Los embeddings de entrada y salida estan atados y el tokenizador es un BPE de bytes con vocabulario de solo 4.082 entradas, entrenado especificamente para esta tarea y no reutilizado de otro modelo.

La innovacion mas destacable es la cabeza de copia de fuente: una proyeccion puntero de 128 dimensiones con una puerta de mezcla que combina la generacion desde el vocabulario con la atencion sobre el contexto proporcionado. Esto tiene sentido en un modelo de text-to-SQL, donde gran parte de la salida (nombres de tablas, columnas, herramientas y valores) aparece literalmente en la entrada y no requiere aprenderlo en los pesos. Ademas, se anadio una cabeza auxiliar de tres clases de accion empleada durante el entrenamiento para guiar la decision de que tipo de accion emitir.

El entrenamiento se realizo desde inicializacion aleatoria en una unica RTX PRO 6000, dentro de un experimento de cuatro horas, sobre el dataset `karmx/TinyQuery-Tools-Multilingual`. Los pesos se congelaron en el paso 25.715 el 2026-09-10 a las 14:00:36 UTC, antes de leer los resultados de test y de las pruebas manuales. La seleccion del checkpoint maximizo la media igualada del exito completo en validacion y en desarrollo; el conjunto de desarrollo contiene perturbaciones del esquema y de los nombres de herramientas respecto a las familias de validacion. No se menciona uso de RLHF ni DPO. El autor no documenta el numero total de tokens de entrenamiento ni la composicion detallada del dataset mas alla de su nombre y su naturaleza multilingue.

## Capacidades

- Generacion de acciones JSON estructuradas a partir de una pregunta, un esquema de base de datos y definiciones de herramientas en tiempo de ejecucion.
- Text-to-SQL con consultas de solo lectura acotadas para MySQL y PostgreSQL/Supabase, con adaptacion de dialecto.
- Tool calling en estilo MCP: valida y serializa una carga JSON-RPC `tools/call`, aunque no se conecta al servidor ni ejecuta la consulta.
- Soporte multilingue limitado a ingles, ingles imperfecto, hindi y hinglish, lo que cubre el caso frecuente de usuarios que mezclan idiomas al formular una consulta.
- Manejo de un conjunto de acciones heterogeneo: llamada a herramienta con argumentos, peticion de aclaracion y respuesta textual, cada una con su propia exigencia de formato.
- Salida en streaming a traves de la CLI incluida, con uso automatico de Apple Silicon MPS, CUDA o CPU.
- Seleccion de ambito de proyecto (project scope) dentro del contexto, requisito para el exito completo de tarea en las evaluaciones.
- No dispone de modo de razonamiento explicito (thinking mode), ni de vision, ni de audio, ni de capacidad de agente autonomo multi-paso: el autor lo describe como un modelo estrecho y experimental, no como un chatbot general.
- No hay garantia de correccion semantica: el validador estructural incluido comprueba la forma de la salida, no su significado.

## Casos de uso

- Asistente de consultas sobre bases de datos internas: el modelo recibe el esquema de una base MySQL o PostgreSQL y la pregunta del usuario (por ejemplo, "muestra los nombres de los clientes de Delhi") y devuelve directamente la llamada `execute_sql` con la consulta. Su ventana de 2.048 tokens es suficiente porque el contexto se limita al esquema y las herramientas relevantes, no a documentos largos.
- Integracion en un agente MCP existente como traductor de intenciones: el host implementa el transporte y la ejecucion, y TinyQuery solo produce la carga JSON-RPC `tools/call` validada. Encaja en arquitecturas donde el modelo grande planifica y este modelo resuelve la traduccion a herramienta concreta.
- Atencion a usuarios en hindi o hinglish: es uno de los pocos modelos de este tamano que declara soporte explicito para estas variedades linguisticas, lo que permite desplegar interfaces de consulta en mercados donde el usuario mezcla hindi e ingles.
- Enrutador de bajo coste en pipelines de datos: clasificar si una peticion en lenguaje natural requiere consulta SQL, una herramienta no SQL o una aclaracion, y derivar el resto del trabajo a componentes especializados.
- Demostraciones y docencia sobre text-to-SQL: al ser un checkpoint nativo de PyTorch con el codigo de entrenamiento e inferencia incluido, el repositorio sirve como referencia reproducible de un pipeline completo con tokenizador, configuraciones e informes de evaluacion.
- Autocompletado de consultas en herramientas internas de analistas: dado un esquema conocido, generar la consulta de solo lectura correspondiente a una peticion formulada en lenguaje natural, con el analista revisando el resultado antes de ejecutarlo.
- Validacion de esquemas y herramientas en CI: ejecutar la suite de evaluacion incluida sobre cambios en el esquema o en las definiciones de herramientas para detectar regresiones en la tasa de exito de tarea.

## Benchmarks y rendimiento

Resultados de la evaluacion BF16 en CUDA sobre el test retenido y sobre el conjunto adicional de frases manuscritas, segun los datos publicados por el autor:

| Medida | Test retenido | Frases manuales adicionales |
|---|---:|---:|
| Ejemplos | 1.196 | 160 |
| JSON valido | 1.196/1.196 (100%) | 160/160 (100%) |
| Esquema de accion/herramienta valido | 1.191/1.196 (99,58%) | 159/160 (99,38%) |
| Herramienta correcta (casos de llamada) | 1.088/1.100 (98,91%) | 146/152 (96,05%) |
| Argumentos exactos (casos de llamada) | 1.014/1.100 (92,18%) | 124/152 (81,58%) |
| Equivalencia de resultados SQL (casos SQL) | 896/912 (98,25%) | 94/112 (83,93%) |
| Exito completo de tarea | 1.106/1.196 (92,47%) | 132/160 (82,50%) |
| Baseline de recuperacion TF-IDF con vinculacion de contexto | 881/1.196 (73,66%) | 115/160 (71,88%) |

Datos adicionales aportados por el autor: validacion 1.174/1.200 (97,83%) y desarrollo 188/192 (97,92%), usados para seleccion de modelo y no como cifras finales. La evaluacion se hizo con generacion greedy cruda, sin reparacion, decodificacion restringida, respaldo por recuperacion ni respaldo por profesor. Una evaluacion independiente en FP32 sobre Mac reprodujo exactamente todas las metricas agregadas. Las comprobaciones nativas contra MySQL 8.0.46 y PostgreSQL 16.15 superaron los 66 casos de operacion y dialecto de referencia. El autor advierte explicitamente que son resultados de benchmark sintetico, no exito medido en produccion.

## Requisitos de hardware

- Pesos en BF16: aproximadamente 280 MB en disco, segun el propio autor. Una copia en FP32 ocuparia en torno a 560 MB (estimacion a partir del numero de parametros).
- Cache KV en BF16 con los 2.048 tokens de contexto: aproximadamente 24 MB, calculado a partir de 12 capas, 4 cabezas KV de dimension 64 y almacenamiento de clave y valor.
- VRAM estimada para inferencia: por debajo de 1 GB contando pesos, cache KV y activaciones, aunque el autor no publica una cifra oficial; con el marco de PyTorch completo es razonable reservar entre 1 y 2 GB.
- Cabe en cualquier GPU de consumo, incluidas tarjetas con 4 GB o menos, y tambien en CPU y en Apple Silicon via MPS.
- El autor solo menciona la RTX PRO 6000 como hardware de entrenamiento y un Apple M5 con MPS como banco de pruebas de inferencia.
- La CLI usa automaticamente MPS, CUDA o CPU, por lo que no requiere configuracion manual de dispositivo.
- Opciones de despliegue: exclusivamente el codigo nativo incluido en el repositorio (`python -m tinyquery.chat`). No hay soporte de vLLM, TGI, llama.cpp, Ollama ni de la API de Transformers; el propio autor indica que `AutoModel` y `pipeline()` no pueden cargarlo. No se publican pesos GGUF.
- Rendimiento medido: aproximadamente 52 tokens generados por segundo en una unica ejecucion local sobre M5/MPS, excluyendo la carga del modelo. El autor aclara que es una sola medida corta y no una garantia de throughput.
- Requiere Python 3.12 y la instalacion de dependencias mediante `requirements.txt`.

## Comparativa con modelos similares

La informacion proporcionada no incluye benchmarks de modelos alternativos, por lo que no se pueden comparar cifras de rendimiento. La tabla siguiente contrasta caracteristicas verificables de modelos pequenos de proposito general frente a este modelo especializado; los datos de rendimiento de las alternativas se marcan como no disponibles.

| Modelo | Parametros | Contexto | Licencia | Especializacion | Rendimiento en text-to-SQL |
|---|---|---|---|---|---|
| TinyQuery-140M | 139,7 M | 2.048 | Apache-2.0 | Text-to-SQL y tool calling MCP | 92,47% de exito completo en test sintetico propio |
| SmolLM2-135M | 135 M | 2.048 | Apache-2.0 | Proposito general | No disponible |
| Qwen2.5-Coder-0.5B | 494 M | 32.768 | Apache-2.0 | Codigo general | No disponible |
| TinyLlama-1.1B | 1.100 M | 2.048 | Apache-2.0 | Proposito general | No disponible |

Nota: los datos de parametros, contexto y licencia de los modelos alternativos proceden de informacion publica general y no se han verificado contra fuentes incluidas en esta ficha. La ventaja principal de TinyQuery-140M frente a alternativas de proposito general no es el rendimiento bruto, sino el formato de salida garantizado estructuralmente, el soporte nativo de MCP y el coste de despliegue inferior a 1 GB.

## Limitaciones y advertencias

- Modelo estrecho y experimental: el autor lo describe explicitamente como no apto como chatbot general y sin garantia de SQL correcto.
- Las cifras de evaluacion son de benchmark sintetico, no de exito medido en produccion. El propio autor lo advierte de forma explicita.
- Las 160 pruebas manuales usan plantillas de redaccion manuscrita sobre 40 familias del test, por lo que el conjunto manual y el test no son muestras independientes de familias de esquema.
- El validador estructural no prueba correccion semantica: una salida puede ser JSON valido y aun asi ejecutar una consulta incorrecta.
- La flag `--mcp` no se conecta a ningun servidor MCP, no autentica y no ejecuta consultas. Toda la capa de transporte y ejecucion debe implementarla la aplicacion anfitriona.
- Contexto maximo de 2.048 tokens incluyendo la salida, y las secuencias de entrenamiento llegaron a 945 tokens: esquemas o conjuntos de herramientas extensos no caben.
- Riesgo de alucinacion en la generacion de columnas, tablas o valores que no existen en el esquema; el autor no publica analisis especifico de sesgos.
- La evaluacion no mide sesgo demografico ni toxicidad, ya que la tarea es de traduccion a herramientas, no de generacion libre.
- Cobertura idiomatica limitada a ingles, hindi y hinglish; no se declara soporte de castellano ni de otras lenguas.
- Licencia Apache-2.0, que permite uso comercial, pero sin garantias por parte del autor ni respaldo de una organizacion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo dia: no hay validacion externa de terceros ni historial de mantenimiento.
- La seleccion del checkpoint se hizo sobre validacion y desarrollo, no sobre test, pero el modelo se congelo en un experimento de cuatro horas sin busqueda de hiperparametros documentada.
- Rendimiento medido en una sola ejecucion sobre M5/MPS; no hay datos de latencia en CUDA ni de throughput con procesamiento por lotes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/karmx/TinyQuery-140M
- Dataset de entrenamiento: https://huggingface.co/datasets/karmx/TinyQuery-Tools-Multilingual
- Informes de evaluacion incluidos en el repositorio (segun la model card): `evaluation/test-gpu.*`, `evaluation/manual-gpu.*`, `evaluation/test-mac.*`, `evaluation/manual-mac.*`, `evaluation/native-*.json`
- Ejemplos de contexto incluidos: `examples/context-supabase.json`, `examples/context-mysql.json`
- Paper, blog o demo adicionales: no disponible
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los resultados obtenidos corresponden a contenido audiovisual sin relacion con el tema.
