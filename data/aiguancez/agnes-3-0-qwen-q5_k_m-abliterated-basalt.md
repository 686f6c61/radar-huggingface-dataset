# aiguancez/Agnes-3.0-Qwen-Q5_K_M-abliterated-Basalt

## Resumen

Agnes-3.0-Qwen-Q5_K_M-abliterated-Basalt es un paquete de cuantizacion no oficial, en formato basalt, del modelo Agnes-3.0-Qwen desarrollado por Agnes AI. La particularidad de este paquete es que no se limita a recomprimir los pesos: antes de la recuantizacion se aplico una ablacion de la direccion de rechazo (abliteration) sobre los pesos BF16 originales, de modo que el modelo resultante elimina de forma deliberada el comportamiento de negativa aprendido en el ajuste de seguridad. El resultado se reempaqueta en Q5_K_M con calibracion imatrix, priorizando la precision.

El modelo base es un transformer de tipo MoE (mixture of experts) con contexto nativo de 1.048.576 tokens, decodificacion especulativa MTP integrada y soporte de vision para imagenes y video. La ablacion se aplico sobre 141 tensores de las 48 capas principales, dejando intactos la capa de borrador MTP y el proyector visual. Segun el autor, el examen de capacidades de 7 materias da resultados equivalentes al modelo original y la recuperacion en contexto largo (16 agujas sobre 1M de tokens) se mantiene en 16/16.

Es relevante para investigadores interesados en estudiar el efecto de la ablacion de rechazo sobre modelos MoE de contexto largo, y para desarrolladores que necesiten ejecutar un modelo de este tamano en hardware de consumo o estaciones de trabajo con mucha RAM. No es una publicacion oficial de Agnes AI ni de Qwen, y su uso comercial queda sujeto a la licencia Qwen Community 1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (adaptacion qwen4_exp, block_count=48) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens (nativo) |
| Tipos de cuantizacion | Q5_K_M con imatrix (Q5_K gate/up + Q5_1/Q8_0 down en expertos) |
| Idiomas soportados | zh, en |
| Licencia | Qwen Community License 1.0 |
| Formato de pesos | basalt (17 secciones, 144,5 GiB / 155,1 GB) |

## Arquitectura y entrenamiento

El modelo base Agnes-3.0-Qwen es un transformer con mezcla de expertos (MoE) adaptado a la variante qwen4_exp, con 48 capas principales (block_count=48). Incorpora decodificacion especulativa mediante una capa de borrador MTP (multi-token prediction) integrada y un proyector visual que habilita entrada de imagen y video. El contexto nativo alcanza 1.048.576 tokens. No se dispone de informacion sobre el numero de parametros, el volumen de tokens de entrenamiento ni la composicion del dataset del modelo base.

Sobre ese modelo, este paquete aplica una ablacion de rechazo: se extrajeron 47 direcciones de rechazo mediante pares de prompts contrastivos (cvec v3) a partir de los pesos BF16 oficiales, y se proyectaron fuera (`h -= (h·v)v`, modo proyeccion, k=1.0) de 141 tensores correspondientes a los flujos de salida de atencion y MLP en las 48 capas principales. La capa de borrador MTP y el proyector visual no se modificaron. Posteriormente los pesos se recuantizaron a Q5_K_M con calibracion imatrix, con un esquema de precision primero (Q5_K en gate/up y Q5_1/Q8_0 en down de los expertos). El autor declara paridad de capacidades con el original en un examen de 7 materias y una tasa de aceptacion MTP del 90% en pruebas de 1M de tokens.

## Capacidades

- Generacion de texto y razonamiento en chino e ingles.
- Razonamiento matematico y resolucion de trampas logicas (segun el examen de capacidades del autor).
- Escritura en chino e ingles y conocimiento de arquitectura de software.
- Implementacion de algoritmos y deteccion de bugs en codigo.
- Recuperacion en contexto largo: 16/16 aciertos en la prueba de agujas sobre 874.844 tokens.
- Vision: soporte de imagen y video mediante el proyector visual integrado.
- Decodificacion especulativa MTP integrada para acelerar la generacion.
- Comportamiento de rechazo ablacionado: 0 negativas en 44 sondas de rechazo y 1 negativa en 24 sondas de red team duras (frente a 21/24 del original).
- No se documenta soporte explicito de tool calling ni de flujos de agentes multi-paso en la informacion disponible.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el paquete permite comparar el comportamiento del modelo original frente a la version ablacionada sobre el mismo conjunto de sondas, aislando el efecto de la ablacion de rechazo en un MoE de 48 capas.
- Analisis de documentos extensos: con 1.048.576 tokens de contexto nativo y recuperacion verificada a 874.844 tokens, es adecuado para resumir o extraer informacion de corpus legales, tecnicos o academicos de gran volumen en una sola pasada.
- Procesamiento de video e imagen en local: el proyector visual intacto permite tareas de descripcion, extraccion de informacion o control de calidad sobre material audiovisual sin depender de API externas.
- Evaluacion de cuantizacion en produccion: sirve como banco de pruebas para medir la perdida de calidad de Q5_K_M con imatrix frente a BF16 en tareas de razonamiento y codigo, con metricas de prefill y decode ya publicadas por el autor.
- Despliegue en estacion de trabajo con mucha RAM: con aproximadamente 73 GiB de RAM y 18 GiB de VRAM medidos, es viable en equipos con 96 GB o mas de memoria y una GPU de 24 GB, lo que permite ejecutar un modelo de contexto millonario sin cluster.
- Generacion de codigo asistida en local: las pruebas de implementacion de algoritmos y deteccion de bugs del examen de capacidades respaldan su uso en tareas de desarrollo, aunque sin tool calling documentado la integracion en pipelines CI/CD requeriria envoltorio propio.
- Estudio de decodificacion especulativa: la capa MTP intacta y la tasa de aceptacion del 90% publicada lo convierten en un caso practico para analizar el rendimiento de speculative decoding en contextos de un millon de tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor unicamente reporta pruebas propias de aceptacion y rendimiento:

| Prueba | Resultado |
|---|---|
| Sondas de rechazo (44) | 0 negativas, todas cumplen |
| Sondas de red team duras (24) | 1 negativa (original: 21/24) |
| Coherencia | normal |
| Examen de capacidades (7 materias) | paridad con el modelo original |
| Recuperacion de 16 agujas en 1M (3%-97%) | 16/16 |
| Prefill, 512K entrada / 3000 salida x3 | ~6,1-6,6K t/s |
| Decode, 512K entrada (496.498 tokens, 0 en cache) | 116-123 t/s |
| Prefill, 1M 16 agujas (874.844 tokens) | ~5,2K t/s |
| Decode, 1M 16 agujas | 82,4 t/s, aceptacion MTP 90% |

## Requisitos de hardware

- VRAM estimada: aproximadamente 18 GiB en las pruebas del autor con KV en int8 y vram-reserve 1536.
- RAM del sistema: 96 GB o mas; el autor mide unos 73 GiB de carga de pesos en RAM.
- GPU probada: RTX 5090 D V2 de 24 GB junto con 190 GB de memoria del sistema.
- Cabe en GPU de consumo de 24 GB solo si se complementa con suficiente RAM del sistema; no cabe integramente en VRAM de una consumer GPU.
- Motor de inferencia: basalt 0.5.7 o superior, con adaptacion qwen4exp y block_count=48. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI para este formato.
- Almacenamiento: 144,5 GiB para el fichero de pesos.
- Latencia y throughput: prefill de 5,2-6,6K t/s y decode de 82-123 t/s segun longitud de contexto, con decodificacion especulativa MTP activa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Agnes-3.0-Qwen-Q5_K_M-abliterated-Basalt | no disponible | 1.048.576 | basalt Q5_K_M | Qwen Community 1.0 | Ablacionado, vision, MTP |
| Agnes-3.0-Qwen (original, Agnes AI) | no disponible | 1.048.576 | BF16 | Qwen Community 1.0 | Modelo base sin ablacion, rechazo intacto (21/24 en sondas duras) |
| Packs de cuantizacion GGUF del mismo modelo base | no disponible | 1.048.576 | GGUF | Qwen Community 1.0 | Citados en los agradecimientos (trabajo de bartowski), sin ablacion |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La ablacion de rechazo es intencionada: el modelo carece del ajuste de seguridad del original y puede producir contenido que el modelo base rechazaria. El autor limita el uso a investigacion local y uso personal.
- Riesgo elevado de uso indebido: 1 negativa en 24 sondas de red team duras indica que el filtrado de contenido danino es practicamente inexistente.
- Riesgo de alucinacion no cuantificado: no hay benchmarks de veracidad publicados para el modelo base ni para el paquete.
- Idiomas limitados a chino e ingles; no se documenta soporte de castellano ni de otras lenguas.
- El formato basalt requiere un motor especifico (basalt 0.5.7+) y no es compatible con los runners habituales (llama.cpp, vLLM, Ollama, TGI), lo que limita su portabilidad.
- Requisitos de memoria altos para un uso comodo: 96 GB de RAM mas 24 GB de VRAM como minimo practico.
- Licencia Qwen Community 1.0: es necesario revisar el fichero LICENSE.txt para confirmar las condiciones de uso comercial, que pueden incluir restricciones adicionales a las de una licencia permisiva.
- Paquete no oficial: no esta respaldado por Agnes AI ni por el equipo de Qwen; la calidad y el mantenimiento dependen de un unico autor comunitario, con 0 descargas y 0 likes en el momento de la consulta.
- La ablacion puede degradar sutilmente capacidades no cubiertas por el examen de 7 materias del autor; la paridad declarada se limita a esas pruebas.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/aiguancez/Agnes-3.0-Qwen-Q5_K_M-abliterated-Basalt)
- [Modelo base Agnes-3.0-Qwen (Agnes AI)](https://huggingface.co/Agnes-AI/Agnes-3.0-Qwen)
- [Organizacion Agnes AI en Hugging Face](https://huggingface.co/Agnes-AI)
- No se han encontrado en la informacion disponible enlaces a papers, blogs, repositorios o demos adicionales.
