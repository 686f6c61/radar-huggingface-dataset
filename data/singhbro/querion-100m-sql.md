# SinghBro/querion-100m-sql

## Resumen

Querion 100M (v0.6.0) es un modelo de lenguaje decoder-only de 101.026.560 parámetros entrenado desde cero por AmanSingh (usuario SinghBro) especificamente para la tarea de text-to-SQL, es decir, traducir preguntas en lenguaje natural a consultas SQL ejecutables sobre un esquema de base de datos dado. El modelo se ha entrenado integramente en una unica GPU de portatil (RTX 4050 con 6 GB de VRAM), lo que lo convierte en un ejemplo de entrenamiento de bajo coste orientado a una tarea vertical muy concreta.

La arquitectura es propia (no compatible con `transformers`), con 12 capas, grouped-query attention con 12 cabezas de consulta y 4 de clave/valor, RoPE, RMSNorm, SwiGLU y embeddings de entrada/salida atados. La longitud de contexto es de 2048 tokens y utiliza un tokenizador BPE byte-level propio de 24k entradas. El preentrenamiento consumio 2.000 millones de tokens (59% FineWeb-Edu, 40% SQL de The Stack, 1% pares text-to-SQL verificados) en 43,3 horas de computo, seguido de un ajuste fino supervisado sobre 130.748 ejemplos.

Su relevancia actual radica en que demuestra que un modelo de ~100M de parámetros puede alcanzar un 21,5% de execution accuracy en Spider dev con decodificacion greedy, y hasta un 35,3% combinando decodificacion restringida por esquema y votacion guiada por ejecucion sobre 8 muestras. Son cifras modestas en terminos absolutos, pero obtenidas con un presupuesto de hardware minimo y una metodologia reproducible, lo que lo hace interesante como baseline de investigacion y como caso de estudio de especializacion vertical.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con grouped-query attention (12 cabezas Q, 4 KV), RoPE, RMSNorm, SwiGLU, embeddings atados; 12 capas |
| Parametros totales | 101.026.560 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible (el codigo es MIT; los pesos no tienen licencia definida y el autor pide consultar antes de reutilizarlos) |
| Formato de pesos | safetensors (`model.safetensors`), tokenizador en `tokenizer.json` |
| Tamano del repositorio | 0,4 GB |
| Tokenizador | BPE byte-level propio de 24k entradas |
| Formato de prompt | `<|bos|><|schema|>{CREATE TABLE...}<|question|>{pregunta}<|sql|>` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 12 capas con atencion de consultas agrupadas (12 cabezas de consulta y 4 de clave/valor), codificacion posicional rotatoria (RoPE), normalizacion RMSNorm, activacion SwiGLU y embeddings de entrada y salida atados. La implementacion es propia y no sigue la interfaz de `transformers`, por lo que requiere cargar el paquete `model/` del repositorio de GitHub y hacer `load_state_dict` directamente desde safetensors. El tokenizador es un BPE byte-level de 24k entradas entrenado especificamente para el proyecto.

El preentrenamiento uso 2.000 millones de tokens con una mezcla del 59% FineWeb-Edu, 40% codigo SQL extraido de The Stack y 1% pares text-to-SQL verificados, con un coste de 43,3 horas de computo. Posteriormente se aplico un ajuste fino supervisado de 1.597 pasos sobre 130.748 ejemplos procedentes de Spider train, Gretel y pares sinteticos, calculando la perdida unicamente sobre los tokens de SQL. Como innovacion destacable, los esquemas de Spider se aumentaron con variantes de identificadores (estilo de mayusculas, cambios de plural, eliminacion opcional de comillas y reordenacion de tablas) para mejorar la robustez frente a esquemas no vistos. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generacion de consultas SQL a partir de una pregunta en ingles y un esquema expresado como sentencias `CREATE TABLE`.
- Especializacion estrecha en text-to-SQL: no es un asistente generalista ni un modelo conversacional.
- Decodificacion restringida por esquema (schema-constrained decoding) disponible en el paquete `infer/` del repositorio, que limita los tokens generados a identificadores validos del esquema.
- Votacion guiada por ejecucion (execution-guided vote) sobre 8 muestras, que ejecuta las consultas candidatas en la base de datos objetivo y devuelve el resultado con mayor consenso.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles.
- Capacidades de vision, audio o modo thinking: no disponibles.

## Casos de uso

- Generacion asistida de consultas SQL en herramientas de BI: el modelo recibe el DDL del esquema y la pregunta del analista y devuelve una consulta ejecutable, reduciendo el tiempo de escritura manual en equipos con esquemas conocidos.
- Prototipado de interfaces de consulta en lenguaje natural sobre bases de datos SQLite: con 2048 tokens de contexto cabe un esquema de tamano pequeno o mediano junto con la pregunta, y la decodificacion restringida por esquema evita identificadores inexistentes.
- Baseline de investigacion en text-to-SQL: sirve como referencia reproducible de bajo coste (entrenado en una RTX 4050) para comparar tecnicas de aumentacion de datos, decodificacion restringida o votacion por ejecucion.
- Docencia y experimentacion: al ser un modelo de 101M de parametros con codigo MIT, es viable entrenarlo y modificarlo en hardware de consumo, lo que facilita practicas sobre preentrenamiento, ajuste fino y evaluacion con execution accuracy.
- Filtrado y validacion de pares text-to-SQL sinteticos: el modelo puede generar candidatos SQL para un esquema dado y, combinado con ejecucion en una conexion de solo lectura, descartar los que fallan o devuelven resultados inconsistentes.
- Demo interactiva de carga de CSV y consulta en ingles: el autor publica una demo que permite subir un CSV y preguntar en lenguaje natural; el modelo infiere el esquema y genera la consulta, aunque el servidor solo esta activo cuando el autor lo levanta.

## Benchmarks y rendimiento

Evaluacion sobre Spider dev (1.034 preguntas), metrica de execution accuracy simple sobre las bases de datos originales de dev en SQLite de solo lectura. No es la metrica oficial de test-suite de Spider y no es comparable con las puntuaciones de leaderboard.

| Configuracion | Execution accuracy |
|---|---|
| Modelo preentrenado, zero-shot, greedy | 4,84% |
| Ajustado sin aumentacion de identificadores, greedy | 17,7% |
| Modelo final, greedy | 21,5% |
| Modelo final + decodificacion restringida por esquema | 26,2% |
| Modelo final + decodificacion restringida + voto sobre 8 muestras con ejecucion | 35,3% |

El error estandar reportado es de aproximadamente 1,5 puntos. La mayoria de fallos restantes corresponden a seleccion incorrecta de tabla: con la restriccion activa, 304 de 497 errores de columna desconocida nombran una columna de una tabla que la consulta no utiliza.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 los 101M de parametros ocupan aproximadamente 0,4 GB; en fp16 unos 0,2 GB. No se documentan cuantizaciones oficiales, pero al ser un modelo pequeno cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el propio autor lo entreno en una RTX 4050 de 6 GB. Para servir la demo con votacion sobre 8 muestras conviene disponer de algo mas de margen.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas recientes (RTX 3050 en adelante, e incluso iGPU con suficiente memoria compartida para fp32).
- Opciones de despliegue: no es compatible con vLLM, TGI, llama.cpp ni Ollama de forma nativa, ya que la arquitectura es propia y no sigue la interfaz de `transformers`. El despliegue debe hacerse con el paquete `model/` del repositorio de GitHub y `safetensors.torch.load_file`.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Querion 100M (v0.6.0) | 101M | 2048 | Text-to-SQL desde cero, arquitectura propia | Pesos sin licencia; codigo MIT | Hugging Face + GitHub |
| Modelos text-to-SQL de ~100M basados en T5/BART | ~100-250M | 512-1024 tipicamente | Fine-tuning sobre Spider y similares | Variable segun modelo | Hugging Face |
| Modelos generalistas de 1-3B (p. ej. familias tipo Llama/Qwen pequenas) | 1.000-3.000M | 4096-32768 | Proposito general con capacidad SQL emergente | Variable | Hugging Face |

No se dispone de datos de benchmarks comparables publicados en la informacion proporcionada para establecer una comparacion cuantitativa directa con alternativas; las cifras de Querion corresponden a execution accuracy simple sobre Spider dev y no son equiparables a las metricas oficiales de leaderboard de otros modelos.

## Limitaciones y advertencias

- Modelo pequeno con pocos datos de entrenamiento multi-tabla: lee mucho mejor los esquemas que ya ha visto (91% frente a 18% en una prueba previa del autor) que los nuevos.
- Tiende a inventar nombres de columna; con decodificacion restringida, 304 de 497 errores de columna desconocida siguen apuntando a tablas no usadas por la consulta.
- No es un asistente de proposito general: solo genera SQL a partir de esquema y pregunta en ingles.
- Solo soporta ingles; no hay capacidades multilingues.
- Ventana de contexto de 2048 tokens, suficiente para esquemas pequenos o medianos pero insuficiente para esquemas grandes con muchas tablas y columnas.
- Riesgo de alucinacion en identificadores y en la eleccion de tablas, con impacto directo en la correccion de la consulta.
- Advertencia explicita del autor: no ejecutar el SQL generado en bases de datos que no se puedan permitir modificar; usar siempre conexiones de solo lectura.
- Licencia de los pesos no definida: el codigo es MIT, pero los pesos no tienen licencia porque el autor sigue revisando los terminos de Spider, Gretel, FineWeb-Edu y The Stack; hasta entonces pide consultar antes de reutilizarlos. Esto bloquea de facto el uso comercial.
- La demo publica solo esta activa cuando el autor levanta el servidor en su portatil; cuando esta caida, el sitio responde con salidas grabadas y lo indica.
- No compatible con el ecosistema `transformers`, lo que complica la integracion en pipelines estandar y en herramientas de serving habituales.
- No se documentan sesgos especificos mas alla de los derivados de los datos de entrenamiento (FineWeb-Edu, The Stack, Spider, Gretel).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SinghBro/querion-100m-sql
- Repositorio GitHub (codigo, logs de entrenamiento, harness de evaluacion): https://github.com/AmanSingh-404/QUERION
- Demo en vivo: https://querion-gilt.vercel.app
