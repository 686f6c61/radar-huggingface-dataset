# JRamirez-UAB/Spark-X2.5-4B-EXL3-6.00bpw-8-16GB

## Resumen

Spark-X2.5-4B-EXL3-6.00bpw-8-16GB es una cuantizacion EXL3 no oficial del modelo XHToken/Spark-X2.5-4B, publicada por el usuario JRamirez-UAB. Se trata de un checkpoint de 6,00 bits por peso (6,013 reales) sobre las capas del decodificador, con `lm_head` a 6 bits y embeddings en BF16, generado con exllamav3. El objetivo declarado es servir un modelo de razonamiento de 4B con contexto largo en GPUs de consumo de 8, 12 y 16 GB mediante vLLM, algo que el modelo original no permite de serie.

El modelo base Spark-X2.5-4B emplea una pila de atencion hibrida con ventana deslizante de 512 tokens en 27 de sus 36 capas y un rango posicional documentado de hasta 1M tokens. No dispone de cabeza MTP ni de torre de vision. La cuantizacion mantiene una divergencia KL frente a BF16 de entre 0,0017 y 0,0020 en tres trazas de evaluacion, lo que el autor describe como casi sin perdida.

La relevancia de esta ficha radica en que demuestra un caso de despliegue de contexto muy largo (262.144 tokens) en hardware modesto, pero a costa de una integracion muy especifica: vLLM no soporta el modelo de forma nativa y requiere el plugin `spark_vllm` junto con exllamav3 y el plugin OrcaSAQ2. Es, por tanto, un artefacto experimental orientado a un caso de uso concreto (agente local de administracion de sistemas Linux en espanol) y no un checkpoint de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion de ventana deslizante (512 tokens en 27 de 36 capas) y atencion completa en el resto; sin MTP ni vision |
| Parametros totales | 1.880.865.792 (segun safetensors); el nombre comercial indica 4B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens en 12 y 16 GB; 106.496 tokens en 8 GB; rango posicional documentado del modelo base de 1M tokens |
| Tipos de cuantizacion | EXL3 a 6,00 bpw en capas del decodificador (6,013 reales), `lm_head` a 6 bits, embeddings en BF16 |
| Idiomas soportados | es, en |
| Licencia | Apache-2.0 (heredada de XHToken/Spark-X2.5-4B) |
| Formato de pesos | safetensors con `quantization_config` exl3; requiere plugin para vLLM |

## Arquitectura y entrenamiento

El modelo base es un transformer con atencion hibrida: 27 de las 36 capas usan una ventana deslizante de 512 tokens, mientras que el resto emplea atencion completa, lo que reduce el coste de KV cache en contextos largos. Incluye una compuerta de salida sigmoide por cabeza (`head-wise sigmoid output gate`) y dos configuraciones de RoPE distintas segun la capa. No incorpora cabeza de prediccion multi-token (MTP) ni modulo de vision. El checkpoint cuantizado conserva el codigo remoto original (`configuration_spark.py`, `modeling_spark.py`) solo como referencia, ya que vLLM no lo ejecuta.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base paso por RLHF o DPO; estos datos no aparecen en la model card proporcionada. La innovacion tecnica destacable de esta publicacion es la integracion de inferencia: el plugin `spark_vllm` implementa atencion paginada, la ventana deslizante de 512 tokens, la compuerta sigmoide y las capas lineales EXL3 a traves de OrcaSAQ2, permitiendo batching continuo en vLLM sobre un checkpoint que de otro modo no cargaria.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con modo de razonamiento extenso (se observaron 155.989 tokens de razonamiento en la bateria de pruebas).
- Tool calling y function calling: supero 60/60 llamadas con la peticion real de opencode y 30/30 en la bateria interna.
- Ejecucion de tareas de agente con comandos reales: 17/30 en tareas de administracion de sistemas (10 tareas x 3 ejecuciones).
- Recuperacion en contexto largo: needle 8/8 a 64k, 6/8 a 128k y 7/8 a 241k tokens.
- Capacidades multilingues limitadas a espanol e ingles.
- Sin soporte de vision ni audio.
- Sin decodificacion especulativa en este checkpoint (el autor la probo por separado en L40S, pero no esta habilitada en la configuracion publicada).

## Casos de uso

- Agente local de administracion de sistemas Linux: el modelo se disena explicitamente para opencode con tool calling en espanol; sus 262.144 tokens de contexto permiten mantener el historial completo de una sesion de diagnostico con decenas de comandos y salidas.
- Automatizacion de tareas de soporte IT en una universidad: con dos sesiones concurrentes de contexto completo en 16 GB, un solo servidor con GPU de consumo puede atender a varios tecnicos simultaneamente sin perder el hilo de cada incidencia.
- Analisis de logs y configuraciones extensas: la ventana de 106.496 tokens en 8 GB permite cargar ficheros de configuracion y trazas de sistema completos para detectar errores o proponer parches.
- Generacion de scripts y comandos de shell con validacion por tool calling: la tasa de 60/60 en llamadas reales de opencode lo hace adecuado para pipelines donde el modelo debe invocar herramientas del sistema en lugar de responder en texto libre.
- Despliegue en estaciones de trabajo con GPU de gama media: al caber en 8, 12 y 16 GB, permite ejecutar un asistente de codigo y terminal en equipos con RTX 4090 o similares sin depender de la nube.
- Prototipado de agentes de razonamiento largo: el modo de razonamiento extendido y el contexto de 262k sirven para experimentar con cadenas de pensamiento largas y recuperacion sobre documentos extensos, aceptando el riesgo de respuestas truncadas por limite de tokens.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Divergencia KL vs BF16 (traza sysadmin) | 0,0020 |
| Divergencia KL vs BF16 (traza opencode) | 0,0019 |
| Divergencia KL vs BF16 (traza publica de turboderp) | 0,0017 |
| Tool calls con peticion real de opencode | 60/60 |
| Tool calls en bateria interna | 30/30 |
| Tareas de agente opencode | 17/30 |
| Razonamiento | 24/48 (155.989 tokens de razonamiento; 19 respuestas cortadas por limite) |
| Razonamiento del original BF16 | 26/48 (20 cortadas) |
| Needle a 64k | 8/8 |
| Needle a 128k | 6/8 |
| Needle a 241k | 7/8 |
| Decodificacion, 1 peticion (L40S) | 144 tok/s |
| Decodificacion, 2 peticiones (L40S) | 267 tok/s |
| Decodificacion, 4 peticiones (L40S) | 520 tok/s |
| Decodificacion, 8 peticiones (L40S) | 995 tok/s |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las cifras anteriores corresponden a la bateria propia del autor sobre A40, L40S y RTX PRO 6000 Blackwell.

## Requisitos de hardware

- VRAM estimada: 8 GB admite contexto de 106.496 tokens con KV cache fp8 de 2.222.645.575 B; 12 GB admite 262.144 tokens con KV cache de 6.462.373.888 B; 16 GB admite dos sesiones concurrentes de 262.144 tokens con KV cache de 10.762.374.348 B.
- GPU probadas: NVIDIA A40 (48 GB, Ampere), NVIDIA L40S (48 GB, Ada) y NVIDIA RTX PRO 6000 Blackwell Server Edition (96 GB, limite de 300 W). Las capacidades por tamano se midieron en la L40S.
- Cabe en GPU de consumo: si, en el rango de 8 a 16 GB (por ejemplo RTX 4090 de 24 GB con margen, o tarjetas de 8, 12 y 16 GB), siempre que se respete el KV cache indicado.
- Despliegue: exclusivamente vLLM 0.31.0 con exllamav3 1.5.1, el plugin OrcaSAQ2 (commit `7ddffb12` con el parche incluido) y el plugin `spark_vllm` 0.1.0. No funciona con un `pip install vllm` estandar, ni con Transformers ni con SGLang; debe servirse sin `--trust-remote-code`.
- Latencia y throughput: 144 tok/s con 1 peticion, 267 tok/s con 2, 520 tok/s con 4 y 995 tok/s con 8 en L40S.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Spark-X2.5-4B-EXL3-6.00bpw (este) | 1.880.865.792 | 262.144 tokens en 12/16 GB | EXL3 6,00 bpw | Apache-2.0 | Requiere plugins especificos de vLLM; experimental |
| XHToken/Spark-X2.5-4B (base) | 1.880.865.792 | 1M tokens documentados | BF16 | Apache-2.0 | Referencia de calidad; mayor huella de VRAM |
| Alternativas de 4B con contexto largo | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se han encontrado en la informacion disponible otros modelos comparables con datos verificables de parametros, contexto y rendimiento en el mismo rango.

## Limitaciones y advertencias

- Checkpoint experimental y no oficial: no es una publicacion de XHToken y solo se ha probado en la configuracion exacta descrita (vLLM 0.31.0, exllamav3 1.5.1, OrcaSAQ2 con parche y `spark_vllm` 0.1.0).
- No cargable con vLLM estandar, Transformers ni SGLang; intentarlo con `--trust-remote-code` no funciona porque el codigo remoto esta escrito para Transformers 4.57.
- La evaluacion se centra en un unico caso de uso (agente de administracion de sistemas Linux en espanol); los numeros pueden no extrapolarse a otros dominios o idiomas.
- Riesgo de alucinacion no cuantificado en la informacion disponible; el modelo base no incluye datos publicos de sesgos.
- En la prueba de razonamiento, 19 de 48 respuestas quedaron cortadas por el limite de tokens, lo que indica tendencia a cadenas de pensamiento muy largas.
- La recuperacion en contexto largo degrada con la distancia: 8/8 a 64k, 6/8 a 128k y 7/8 a 241k.
- Idiomas limitados a espanol e ingles; no se documenta soporte de otros idiomas.
- Licencia Apache-2.0 permite uso comercial, pero al ser una cuantizacion de la comunidad conviene verificar la licencia y los terminos del modelo base antes de produccion.
- Solo 96 descargas y 0 likes en el momento de la consulta, lo que refleja una validacion externa muy limitada.

## Enlaces

- [Hugging Face: JRamirez-UAB/Spark-X2.5-4B-EXL3-6.00bpw-8-16GB](https://huggingface.co/JRamirez-UAB/Spark-X2.5-4B-EXL3-6.00bpw-8-16GB)
- [Modelo base: XHToken/Spark-X2.5-4B](https://huggingface.co/XHToken/Spark-X2.5-4B)
- [exllamav3 (GitHub)](https://github.com/turboderp-org/exllamav3)
- [Paper de referencia arXiv:2406.11235](https://arxiv.org/abs/2406.11235)
- Plugin `spark_vllm` y parche OrcaSAQ2: incluidos en el repositorio, carpetas `plugin/` y `patches/`
