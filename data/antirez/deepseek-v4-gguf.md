# antirez/deepseek-v4-gguf

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo DeepSeek V4 Flash, realizadas por Salvatore Sanfilippo (antirez), creador de Redis. No es un modelo nuevo, sino una conversión del modelo base `deepseek-ai/DeepSeek-V4-Flash` a formato GGUF, pensada específicamente para el motor de inferencia local `ds4`, también desarrollado por antirez. El objetivo principal es permitir ejecutar un modelo MoE de gran tamaño en equipos Apple Silicon con 128 GB de RAM mediante una cuantización agresiva de los expertos enrutados.

La relevancia actual radica en que ofrece una receta de cuantización asimétrica: los expertos enrutados (la mayoría de los parámetros) se cuantizan con `IQ2_XXS`/`Q2_K` o `Q4_K`, mientras que las proyecciones de atención, los expertos compartidos y el router se mantienen en `Q8_0` o `F16`. Esto busca preservar el comportamiento del modelo donde más importa y sacrificar tamaño en los componentes que procesan menos tokens. Incluye además un archivo MTP opcional para decodificación especulativa. La licencia es MIT, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture-of-experts) con MLA, hash-routing, compressor, indexer y bloques HC (basada en DeepSeek V4 Flash) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (modelo MoE) |
| Longitud de contexto | no disponible (el servidor `ds4-server` admite hasta 100000 tokens configurable) |
| Tipos de cuantizacion | IQ2_XXS, Q2_K, Q4_K, Q8_0, F16, F32 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es DeepSeek V4 Flash, una arquitectura MoE con atención MLA (Multi-head Latent Attention) y proyecciones de salida de bajo rango. Incorpora mecanismos auxiliares propios de la serie DSv4: un router aprendido, tablas de hash-routing en las primeras tres capas, un compressor de atención, un indexer y bloques HC. La cuantización realizada por antirez mantiene estos componentes auxiliares en `F16` o `F32` para no alterar el comportamiento del modelo.

La receta de cuantización es asimétrica por diseño. En la versión q2, los expertos enrutados de up/gate se cuantizan con `IQ2_XXS`, los de down con `Q2_K`, y todo lo demás (proyecciones de atención, expertos compartidos, salida, router, embeddings) se mantiene en `Q8_0`, `F16` o `F32`. En la versión q4, solo cambian los tres tensores de expertos enrutados a `Q4_K`. La justificación es que cada experto individual procesa una fracción pequeña de tokens, por lo que una cuantización agresiva en ellos degrada menos la calidad media que la misma cuantización en componentes de decisión. No se dispone de información sobre el entrenamiento del modelo base (tokens, dataset, RLHF/DPO).

## Capacidades

- Generacion de texto y chat conversacional (variantes `chat-v2`).
- Decodificacion especulativa opcional mediante el archivo MTP (multi-token prediction), que requiere un cargador especifico.
- Ejecucion local optimizada para Apple Silicon con Metal a traves del motor `ds4`.
- Servidor con gestion de cache KV en disco (`--kv-disk-dir`), lo que permite contextos largos sin agotar la RAM.
- Soporte para descarga reanudable y seleccion de variante mediante `download_model.sh`.
- No se ha documentado soporte de tool calling, agentes o capacidades multimodales en la informacion disponible.

## Casos de uso

- Inferencia local en MacBook con 128 GB de RAM: la variante q2 (80.8 GiB) esta disenada para equipos Apple Silicon con 128 GB, permitiendo ejecutar un modelo MoE de gran tamano sin GPU dedicada.
- Servidor de chat con contexto largo: `ds4-server --ctx 100000 --kv-disk-dir` permite atender peticiones con ventanas de hasta 100000 tokens, descargando la cache KV a disco, util para asistentes conversacionales con historial extenso.
- Desarrollo de aplicaciones offline: al ser GGUF y con licencia MIT, puede integrarse en productos que requieran inferencia sin conexion a internet.
- Experimentacion con cuantizacion asimetrica: la receta de antirez (expertos enrutados muy cuantizados, resto en Q8_0) es un caso de estudio para evaluar el impacto de la cuantizacion selectiva en modelos MoE.
- Investigacion sobre decodificacion especulativa: el archivo MTP permite probar tecnicas de aceleracion por prediccion multiple de tokens en un entorno local.
- Pruebas de rendimiento en Apple Silicon: el motor `ds4` esta optimizado para Metal, por lo que sirve para medir throughput y latencia en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se aportan datos de MMLU, HumanEval, GSM8K ni comparativas con otros modelos.

## Requisitos de hardware

- Variante q2: 128 GB de RAM en Mac (Apple Silicon) con Metal.
- Variante q4: 256 GB de RAM o mas.
- Archivo MTP: 3.6 GiB adicionales, opcional.
- No se indica VRAM de GPU; la inferencia se apoya en RAM unificada de Apple Silicon.
- Motores de inferencia: `ds4` (recomendado) y un fork experimental de `llama.cpp` (`antirez/llama.cpp-deepseek-v4-flash`).
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar con alternativas de la misma categoria. El modelo es una cuantizacion especifica de DeepSeek V4 Flash, y no se conocen otros repositorios GGUF equivalentes del mismo modelo base en la informacion disponible.

## Limitaciones y advertencias

- La cuantizacion agresiva de los expertos enrutados (IQ2_XXS/Q2_K en q2) puede degradar la calidad de generacion en tareas que dependan de expertos especificos.
- El archivo MTP no es autonomo y requiere un cargador especifico; puede no funcionar con motores de inferencia genericos.
- El soporte en llama.cpp es experimental y no se garantiza su estabilidad.
- Solo se declara el idioma ingles; el rendimiento en otros idiomas no esta documentado.
- El repositorio pesa mas de 3 TB en total, lo que implica un consumo elevado de ancho de banda y almacenamiento si se descargan todas las variantes.
- Aunque la licencia es MIT, el copyright del modelo base pertenece a DeepSeek; los GGUF se redistribuyen bajo los terminos de publicacion del modelo base.
- No hay informacion sobre sesgos, alucinaciones o riesgos de seguridad especificos de esta cuantizacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/antirez/deepseek-v4-gguf
- Motor de inferencia ds4 (GitHub): https://github.com/antirez/ds4
- Fork experimental de llama.cpp (GitHub): https://github.com/antirez/llama.cpp-deepseek-v4-flash
