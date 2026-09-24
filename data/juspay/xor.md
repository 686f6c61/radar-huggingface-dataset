# juspay/xor

## Resumen

Xor es un modelo derivado de Qwen/Qwen3.6-35B-A3B, desarrollado por Juspay Technologies, orientado a tareas de decision tipada. No es un modelo de proposito general con prompt libre: es una version post-entrenada que se sirve a traves de una API compatible con TypeSafe en el endpoint `/v1/systemone`, donde el cliente envia un estado y un mapa de preguntas tipadas y recibe probabilidades o decisiones estructuradas.

El modelo conserva la arquitectura del checkpoint base: un transformer causal con mezcla de expertos (MoE) de 35.107.181.936 parametros totales y aproximadamente 3.000 millones de parametros activados por token, liberado en BF16 con pesos ya fusionados (no requiere cargar ni fusionar adaptadores). La licencia es Apache 2.0 y el pipeline declarado es text-generation, con soporte adicional de entrada image-text-to-text.

Su relevancia actual esta en el nicho de clasificacion y puntuacion con incertidumbre calibrada: en lugar de generar texto libre, devuelve decisiones binarias, categoricas u ordinales con distribucion de probabilidad completa, evaluacion en orden directo e inverso de las opciones y calibracion en la capa de servicio. El autor publica una autoevaluacion sobre las capas publicas de JEVBench con una precision de 1.0000 en el nivel Easy y 0.7748 en el nivel Hard public.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con mezcla de expertos (MoE) |
| Parametros totales | 35.107.181.936 (35 B) |
| Parametros activos | Aproximadamente 3 B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (release validado en BF16; pesos fusionados) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers); el despliegue validado usa SGLang |

## Arquitectura y entrenamiento

La ficha del autor solo indica que Xor es una version post-entrenada del checkpoint `Qwen/Qwen3.6-35B-A3B`, descrito como un modelo de lenguaje causal con mezcla de expertos, BF16 y pesos completamente fusionados. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO u otras fases de alineamiento. Tampoco se especifican innovaciones de atencion o decodificacion en el modelo en si.

La innovacion declarada esta en la capa de servicio que acompana al modelo y que forma parte de la configuracion de inferencia publicada: lectura determinista de candidatos de un solo token, evaluacion del orden de opciones en sentido directo e inverso, calibracion de probabilidades y conversion a esquema. El autor advierte explicitamente de que esta capa de servicio debe usarse para obtener resultados reproducibles, es decir, el modelo no esta pensado para invocarse como un generador de texto convencional. El tipo de pregunta `noul` devuelve una probabilidad binaria, `choice` una decision categorica con su distribucion completa y `score` una puntuacion ordinal esperada con su distribucion.

## Capacidades

- Clasificacion tipada con tres modalidades: `noul` (probabilidad binaria), `choice` (decision categorica y distribucion completa) y `score` (puntuacion ordinal esperada y distribucion).
- Entrada multimodal: las peticiones pueden incluir un array `images` con hasta ocho URL de imagen o data URL, y las preguntas tipadas pueden clasificar informacion procedente de esas imagenes junto con el texto.
- Salida con incertidumbre calibrada: distribuciones de probabilidad y metricas de calibracion (Brier, ECE) reportadas en la evaluacion publica.
- Robustez al orden de opciones: la capa de servicio evalua las opciones en orden directo e inverso.
- Salida estructurada validada contra esquema: la evaluacion reporta validez de esquema estricta de 1.0000 en las tres capas publicas de JEVBench.
- Generacion de texto conversacional: el pipeline declarado es text-generation y el tag conversational esta presente, aunque la interfaz documentada es la de decision tipada.
- No se documenta en la informacion disponible soporte de tool calling, function calling ni comportamiento agentico multi-paso.
- Idiomas soportados: no disponible.

## Casos de uso

- Decisiones binarias automatizadas con umbral de confianza: usando el tipo `noul`, el modelo devuelve una probabilidad que un sistema posterior puede comparar contra un umbral para aprobar, denegar o escalar una operacion, en lugar de interpretar texto generado libremente.
- Triaje y enrutado categorico: con el tipo `choice` se obtiene la categoria asignada y la distribucion completa, lo que permite enrutar tickets, incidencias o solicitudes a un equipo concreto y detectar casos ambiguos cuando la masa de probabilidad esta repartida.
- Puntuacion ordinal de riesgo o calidad: con el tipo `score` se obtiene una puntuacion esperada y su distribucion, util para scoring de riesgo, priorizacion de colas o evaluacion de calidad con grados.
- Clasificacion asistida por imagenes: las peticiones aceptan hasta ocho imagenes por URL o data URL, de modo que se puede clasificar documentacion escaneada, capturas o formularios junto con texto adicional sin un pipeline de vision separado.
- Validacion de decisiones en sistemas de pago o riesgo: al tratarse de un modelo de Juspay, un uso natural es la clasificacion de operandos de riesgo y revision, siempre que se valide con datos propios del dominio y se verifique la calibracion.
- Modulo de evaluacion en pipelines de investigacion: la salida tipada con distribuciones permite calcular metricas de calibracion (Brier, ECE) de forma directa, lo que facilita comparar variantes de modelo con un harness objetivo como JEVBench.
- Anotacion asistida con control de calidad: la combinacion de decision y distribucion permite marcar automaticamente las muestras de baja confianza para revision humana, reduciendo coste de anotacion.
- Servicio interno de decision a baja latencia: en la configuracion validada, las latencias p50 reportadas van de 0,0766 s en el nivel Easy a 0,1361 s en el nivel Hard public, lo que encaja con servicios sincronos de decision, no con generacion de documentos largos.

## Benchmarks y rendimiento

El autor publica una autoevaluacion sobre las capas publicas de JEVBench (harness commit `fd51755eb0c0b546ca206d764faf3302feca913e`, adaptador `typesafe`, una peticion simultanea), ejecutada sobre 2 x NVIDIA RTX PRO 6000 Blackwell Server Edition de 96 GB con tensor parallelism 2. El propio autor indica que no es un ranking oficial de JEVBench y que ha solicitado una evaluacion independiente del conjunto completo, incluidos los elementos reservados, en el issue #20 del repositorio de JEVBench.

| Capa | Intentos | Validos | Correctos | Precision | Precision macro | Brier medio | ECE | p50 | p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Easy | 48 | 48 | 48 | 1,0000 | 1,0000 | 0,0018 | 0,0257 | 0,0766 s | 0,0888 s |
| Original | 72 | 72 | 70 | 0,9722 | 0,9722 | 0,0897 | 0,1285 | 0,0773 s | 0,0812 s |
| Hard public | 111 | 111 | 86 | 0,7748 | 0,8033 | 0,3460 | 0,0579 | 0,1361 s | 0,3887 s |

El exito operativo, la cobertura, la validez de esquema y la validez de esquema estricta fueron 1,0000 en las tres capas publicas. No se han publicado en la informacion disponible resultados de benchmarks generalistas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Los ficheros del modelo ocupan aproximadamente 66 GB; el repositorio completo ocupa 70,2 GB y la instalacion documentada requiere unos 120 GB de disco libre.
- La configuracion validada por el autor usa 2 x NVIDIA RTX PRO 6000 Blackwell Server Edition de 96 GB cada una, con tensor parallelism 2 y una fraccion de memoria estatica de 0,85.
- El autor advierte de que la configuracion validada de SGLang reserva una cantidad sustancial de VRAM para la cache KV; presupuestos de prefill menores pueden funcionar en otras configuraciones de dos GPU, pero no estan cubiertos por la validacion.
- Presupuesto maximo de prefill tokens en la configuracion validada: 250.000.
- No cabe en una GPU de consumo en la precision liberada (BF16, 66 GB de pesos): una RTX 4090 de 24 GB es insuficiente por si sola; no se documentan cuantizaciones alternativas validadas.
- Opciones de despliegue: el autor despliega con SGLang mediante una imagen fijada por digest (`lmsysorg/sglang@sha256:6bcaa47db52f78ce0d67863b8b2431221b79bc23204a80cad757fa819d00e921`), empaquetada en un bundle de servicio con Docker Compose. Los pesos tambien se publican en formato transformers/safetensors. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Entorno requerido: Linux x86-64, CLI de Hugging Face, Docker Engine con Docker Compose v2 y NVIDIA Container Toolkit.
- Latencia reportada en la configuracion validada: p50 de 0,0766 s (Easy), 0,0773 s (Original) y 0,1361 s (Hard public); p95 de 0,0888 s, 0,0812 s y 0,3887 s respectivamente, con una peticion a la vez. El autor indica que las mediciones solo son comparables con el mismo modelo de GPU, numero de GPU, configuracion de tensor parallelism e imagen de servicio fijada.
- Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Parametros activos | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|---|
| juspay/xor | 35 B | ~3 B por token | no disponible | Apache 2.0 | Decision tipada con probabilidades calibradas y entrada de imagenes | Hugging Face, pesos fusionados y bundle de servicio SGLang |
| Qwen/Qwen3.6-35B-A3B (modelo base) | 35 B | ~3 B por token | no disponible | Apache 2.0 | Modelo de lenguaje causal MoE de proposito general | Hugging Face |
| Otras alternativas de clasificacion tipada | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye resultados de benchmarks de modelos comparables en la misma tarea, por lo que no es posible establecer una comparacion cuantitativa de rendimiento frente a alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. El autor no documenta analisis de sesgo.
- Riesgo de alucinacion: el modelo no genera texto libre en su interfaz documentada, sino decisiones leidas sobre candidatos de un solo token; aun asi, la capa de calibracion es la que garantiza la interpretacion correcta de esas probabilidades y forma parte obligatoria de la configuracion de inferencia publicada.
- La autoevaluacion publicada es una ejecucion propia sobre las capas publicas de JEVBench y no un ranking oficial; la caida de precision del nivel Easy (1,0000) al nivel Hard public (0,7748) indica que el rendimiento en casos dificiles es notablemente inferior. No se han publicado resultados sobre los elementos reservados del conjunto.
- Calibracion heterogenea: el Brier medio sube de 0,0018 en Easy a 0,3460 en Hard public, y el ECE es de 0,1285 en Original, lo que sugiere que las probabilidades no son igualmente fiables en todos los niveles de dificultad.
- Limitaciones de contexto: no se documenta la longitud de contexto nativa; el unico dato operativo es el presupuesto maximo de prefill de 250.000 tokens en la configuracion validada, que depende del hardware y de la reserva de memoria para la cache KV.
- Limitaciones de idioma: no disponible.
- El servicio no requiere clave de API cuando se enlaza a localhost; el autor advierte de que los despliegues remotos deben anadir autenticacion, TLS, limites de tasa y limites de tamano de peticion en la capa de entrada.
- Para resultados reproducibles es obligatorio usar la capa de servicio publicada; una invocacion directa del modelo sin esa capa no reproduce los resultados reportados.
- Licencia Apache 2.0, sin restricciones de uso comercial indicadas en la informacion disponible, con la salvedad de las condiciones del modelo base, que es tambien Apache 2.0.
- Entrada multimodal limitada a un maximo de ocho imagenes por peticion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juspay/xor
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- JEVBench (repositorio del harness de evaluacion): https://github.com/fstandhartinger/jevbench
- Issue de evaluacion independiente del conjunto completo: https://github.com/fstandhartinger/jevbench/issues/20
- Organizacion Juspay en Hugging Face: https://huggingface.co/juspay/datasets
- Repositorio juspay/AI: https://github.com/juspay/AI
- Servidores MCP de Juspay: https://github.com/juspay/juspay-mcp
