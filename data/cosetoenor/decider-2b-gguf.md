# cosetoenor/decider-2b-GGUF

## Resumen

Decider-2b-GGUF es la conversión a formato GGUF del modelo Mapika/decider-2b (v8), un ajuste fino de Qwen3.5-2B-Base orientado a la toma de decisiones discretas. A diferencia de un modelo generativo convencional, Decider-2B no escribe texto: recibe un estado (por ejemplo, el último mensaje de un cliente) y un conjunto de preguntas tipadas con opciones descritas, y devuelve en una única pasada forward la distribución de probabilidad sobre las opciones de cada pregunta. El repositorio lo mantiene el usuario cosetoenor y su único aporte es el cambio de formato, no el entrenamiento del modelo.

La relevancia de esta conversión está en que permite ejecutar el modelo con llama.cpp sobre GPU de gama media. El autor publica una evaluación sobre una RTX 3070 Ti de 8 GB de VRAM con 7.440 casos por cuantización, además de una comparativa de tres modelos (NanoJev, Decider-2B y System One Scorer) con 22.320 predicciones totales. El modelo tiene 1.881.825.088 parámetros (aproximadamente 1,88 B, de ahí el nombre comercial "2B") y licencia Apache 2.0.

El interés práctico del modelo es acotado pero nítido: sustituye a un clasificador entrenado a medida en tareas de enrutado y triaje, con la ventaja de que las opciones se describen en el propio prompt en lugar de requerir reentrenamiento. El coste es que no se puede usar como un LLM al uso: una ejecución estándar de `llama-cli` o `llama-server` produce una continuación de texto, no probabilidades, y hace falta código adicional (incluido en el repositorio) para leer los logits de los tokens de opción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5-2B-Base, con estado recurrente de Gated DeltaNet ademas de la cache de atencion KV (segun el shim incluido en el repo) |
| Parametros totales | 1.881.825.088 (aproximadamente 1,88 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, IQ4_NL (los tres publicados en el repositorio) |
| Idiomas soportados | no disponible (los prompts de referencia del benchmark estan mayormente en chino tradicional; los conjuntos de evaluacion son BoolQ, OCNLI, CLINC y TMMLU+) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF para llama.cpp; el modelo original esta en safetensors |

## Arquitectura y entrenamiento

El modelo base es Mapika/decider-2b (v8), un ajuste fino de Qwen3.5-2B-Base. El repositorio de cuantizacion no documenta el proceso de entrenamiento: no hay datos sobre numero de tokens, composicion del dataset, ni si se aplico RLHF, DPO u otra tecnica de alineacion. Lo unico verificable es el uso previsto: el modelo lee un estado y preguntas tipadas con opciones descritas, y devuelve probabilidades sobre las opciones en una sola pasada forward, sin decodificacion autoregresiva.

La innovacion tecnica relevante esta en el modo de explotacion, no en el entrenamiento. El shim `code/dz_shim.c` envuelve `libllama`, decodifica tokens y devuelve los logits de los identificadores de token elegidos en posiciones concretas, ademas de guardar y restaurar el estado de la secuencia 0 (cache KV de atencion mas el estado recurrente de Gated DeltaNet). Sobre esa base, `code/decider_llama_serve.py` implementa un servidor `POST /v1/systemone` que decodifica una vez el prefijo de preguntas, guarda una instantanea del estado y, para cada peticion, restaura la instantanea y decodifica unicamente el estado. Ese cacheo de esquema es lo que hace viable atender muchos casos con el mismo conjunto de preguntas sin recalcular el prefijo.

## Capacidades

- Clasificacion y eleccion entre opciones: devuelve probabilidades sobre opciones etiquetadas con letras en una unica pasada forward; no genera texto libre.
- Preguntas tipadas: soporta preguntas con tipo `choice`, instrucciones en lenguaje natural y criterios descritos por opcion (con `null` para la opcion "ninguna de las anteriores").
- Inferencia de relacion textual (NLI): evaluado en OCNLI con 70,14 % de acierto en Q8_0.
- Preguntas booleanas: evaluado en BoolQ con 83,55 % de acierto en Q8_0.
- Clasificacion de intenciones: evaluado en CLINC con 11 y 151 opciones (96,50 % y 88,50 % en Q8_0) y en la variante con la opcion correcta eliminada (94,67 %).
- Capacidad multilingue parcial: el benchmark incluye TMMLU+ (mandarin de Taiwan) con 48,36 % en Q8_0, el resultado mas bajo de la bateria. No hay lista oficial de idiomas soportados.
- Servidor compatible con el formato de cable del paquete `decider.serve` del autor original, mas cacheo de esquema de preguntas.
- Tool calling / function calling: no disponible; al no generar texto, no implementa llamadas a herramientas.
- Soporte de agentes: indirecto; puede actuar como componente de decision o enrutado dentro de un agente, pero no como planificador autonomo.
- Modo "thinking", vision ni audio: no disponibles.

## Casos de uso

- Enrutado de tickets de atencion al cliente: con el estado formado por el ultimo mensaje del cliente y una pregunta de tipo `choice` con equipos como opciones (facturacion, envios, otros), el modelo devuelve la probabilidad de cada equipo en una sola pasada. El ejemplo incluido en el repositorio usa exactamente este escenario con un aviso de doble cobro.
- Triaje de soporte multilingue: los prompts de referencia del benchmark estan mayormente en chino tradicional y el modelo obtiene 48,36 % en TMMLU+, por lo que es utilizable como primer filtro en ese idioma, con revision humana en los casos de baja confianza.
- Clasificacion de intenciones en asistentes conversacionales: los resultados de CLINC (96,50 % con 11 opciones, 88,50 % con 151) permiten mapear la intervencion del usuario a una intencion concreta sin reentrenar un clasificador cuando cambia el catalogo de intenciones.
- Deteccion de casos fuera de catalogo: la configuracion de CLINC sin la opcion correcta obliga al modelo a elegir "ninguna de las anteriores" y acierta el 94,67 % en Q8_0, lo que sirve para derivar a un humano en lugar de forzar una etiqueta incorrecta.
- Verificacion de coherencia y compromiso (NLI): con 70,14 % en OCNLI puede usarse como filtro previo para descartar respuestas incompatibles con un contexto dado antes de mostrarlas al usuario.
- Preguntas de si/no sobre un estado: 83,55 % en BoolQ permite resolver comprobaciones binarias (por ejemplo, si un pedido cumple una condicion) en unos 24 ms de mediana por caso en Q8_0 sobre RTX 3070 Ti.
- Decision de siguiente accion en un pipeline de agentes: dado un estado y un conjunto de acciones posibles descritas, el modelo puntua cada accion y el orquestador elige la de mayor probabilidad; el servidor con cacheo de esquema evita recalcular el prefijo de preguntas en cada turno.

## Benchmarks y rendimiento

Fidelidad de las cuantizaciones frente al modelo original en bf16, medida sobre 71 prompts reales de enrutado multi-turno en atencion al cliente (mayoritariamente en chino tradicional), con 2 a 10 opciones por pregunta y disposicion "preguntas primero":

| Archivo | Tipo | Tamano | Coincidencias con bf16 | Deriva de probabilidad (mediana / maxima) |
|---|---|---:|---:|---|
| `decider-2b-f16.gguf` | F16 | 3,8 GB | no medida | no medida |
| `decider-2b-q8_0.gguf` | Q8_0 | 2,0 GB | 70 / 71 | 0,003 / 0,062 |
| `decider-2b-iq4_nl.gguf` | IQ4_NL | 1,2 GB | 59 / 71 | 0,028 / 0,397 |

Evaluacion sobre RTX 3070 Ti (8 GB VRAM), 7.440 casos por cuantizacion, mismo motor llama.cpp, mismos prompts y misma configuracion, con disposicion "estado primero":

| Tarea | Casos por modelo | Precision Q8_0 | Precision IQ4_NL | P50 Q8_0 (ms) | P50 IQ4_NL (ms) |
|---|---:|---:|---:|---:|---:|
| BoolQ | 3.270 | 83,55 % | 84,89 % | 24,0 | 23,6 |
| OCNLI | 2.950 | 70,14 % | 68,47 % | 18,2 | 17,7 |
| CLINC: 151 opciones | 200 | 88,50 % | 82,50 % | 106,8 | 106,0 |
| CLINC: 11 opciones | 200 | 96,50 % | 97,00 % | 19,6 | 19,0 |
| CLINC: opcion correcta eliminada | 150 | 94,67 % | 93,33 % | 17,9 | 17,0 |
| TMMLU+ | 670 | 48,36 % | 46,27 % | 18,9 | 18,2 |

Notas de medicion aportadas por el autor: la referencia bf16 se ejecuta en PyTorch con el paquete `decider`, por lo que la comparacion con GGUF incluye diferencias de motor y de precision; las configuraciones de CLINC reutilizan enunciados; en la variante sin opcion correcta todos los casos deberian seleccionar "ninguna de las anteriores"; las latencias excluyen la carga del modelo y el trafico HTTP. Las cifras de "coincidencias con bf16" miden acuerdo con el modelo original, no exactitud contra etiquetas humanas. La prueba de 71 casos usa disposicion "esquema primero", mientras que el benchmark de 7.440 casos usa "estado primero": son evaluaciones distintas.

## Requisitos de hardware

- VRAM estimada para inferencia: IQ4_NL parte de 1,2 GB de pesos, Q8_0 de 2,0 GB y F16 de 3,8 GB; hay que sumar el consumo de la cache KV y del estado recurrente de Gated DeltaNet, no cuantificado en la informacion disponible.
- GPU validadas: RTX 3070 Ti con 8 GB de VRAM, sobre la que se completaron las 7.440 evaluaciones por cuantizacion. Cabe en cualquier GPU consumer con al menos 4-6 GB de VRAM libres en Q8_0 o IQ4_NL.
- Despliegue en CPU: viable con llama.cpp; el autor muestra una compilacion de llama.cpp como biblioteca compartida con `-DGGML_NATIVE=ON` y enlaza el shim con `gcc`, sin exigir GPU para compilar.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`) mas el shim en C (`code/dz_shim.c`) y el servidor FastAPI/uvicorn `code/decider_llama_serve.py` con el endpoint `POST /v1/systemone`. El servidor importa el constructor de prompts y el tokenizador de una copia local del repositorio original Mapika/decider-2b, por lo que hay que descargarlo tambien. No hay soporte documentado para Ollama, vLLM o TGI con extraccion de probabilidades.
- Variables de entorno del servidor: `DECIDER_THREADS` (por defecto 4), `DECIDER_BATCH` (por defecto 512) y `DECIDER_MMAP`.
- Latencia medida en RTX 3070 Ti: entre 17,0 y 24,0 ms de mediana (P50) por caso en las tareas de 2 a 11 opciones; 106,0-106,8 ms en el caso de 151 opciones, que domina el coste por el numero de opciones a puntuar. No se publican datos de P95 ni de throughput agregado.

## Comparativa con modelos similares

El informe de tres modelos del propio repositorio evalua NanoJev, Decider-2B y System One Scorer sobre los mismos 7.440 casos por modelo y 22.320 predicciones, con ejecucion secuencial en la misma GPU.

| Modelo | Parametros | Contexto | Precision | Licencia | Notas de despliegue |
|---|---|---|---|---|---|
| Decider-2B (este) | 1,88 B | no disponible | BoolQ 83,55 %, TMMLU+ 48,36 % (Q8_0) | Apache 2.0 | BF16 en el informe comparativo; mejor equilibrio latencia/precision segun el autor |
| System One Scorer | no disponible | no disponible | mas preciso en BoolQ y TMMLU+, segun el informe | no disponible | Cuantizado en NF4 para caber en la GPU de 8 GB; mas lento |
| NanoJev | no disponible | no disponible | no disponible | no disponible | Checkpoint especializado en laberintos (`local_atomic_seed17`); no comparable en tareas generales |

Advertencia del autor: la comparativa enfrenta configuraciones desplegadas, no arquitecturas a igual precision, de modo que las diferencias de cuantizacion (BF16 frente a NF4) forman parte del resultado y no deben leerse como una comparacion de arquitecturas. No se dispone de datos de parametros, contexto ni licencia de los otros dos modelos.

## Limitaciones y advertencias

- No es un modelo generativo. Una ejecucion estandar de `llama-cli` o `llama-server` produce una continuacion de texto; para obtener probabilidades sobre opciones hay que construir el prompt de Decider, leer los logits de cada posicion de respuesta, restringirlos a los tokens de letra de opcion y aplicar softmax.
- La cuantizacion de 4 bits no es fiable para produccion: IQ4_NL cambia la opcion elegida en aproximadamente 1 de cada 6 prompts respecto a bf16 (59/71 coincidencias) y la deriva maxima de probabilidad llega a 0,397. El autor recomienda explicitamente Q8_0.
- Los numeros de fidelidad miden acuerdo con el modelo original en bf16, no exactitud frente a etiquetas humanas. No son una medida de calidad absoluta.
- Diferencias de motor: la referencia bf16 corre en PyTorch y las mediciones GGUF en llama.cpp, por lo que las comparaciones mezclan precision y implementacion.
- Riesgo de alucinacion en el sentido de seleccion incorrecta de opcion: en TMMLU+ el acierto cae al 48,36 % en Q8_0, aproximadamente azar en preguntas de cuatro opciones. No se debe confiar en el modelo en tareas de conocimiento sin validacion.
- Limites de contexto e idioma no documentados: la model card no indica longitud de contexto soportada ni lista de idiomas. Los prompts de referencia estan mayoritariamente en chino tradicional y los conjuntos de evaluacion en chino e ingles, por lo que el comportamiento en castellano no esta medido.
- Dependencia de codigo externo: el servidor importa el constructor de prompts y el tokenizador de una copia local del repositorio original, lo que anade una dependencia de version que no se fija en la documentacion.
- Estado del repositorio: creado el 18 de septiembre de 2026 y actualizado el mismo dia, con 0 descargas y 1 "me gusta" en el momento de la consulta. No ha pasado revision de la comunidad ni tiene historial de mantenimiento.
- La fecha de creacion y actualizacion publicada es posterior a la fecha habitual de referencia, dato que se reproduce tal cual figura en HuggingFace.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero al derivar del modelo base Mapika/decider-2b conviene verificar las condiciones de ese repositorio antes de un despliegue en produccion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/cosetoenor/decider-2b-GGUF
- Modelo base: https://huggingface.co/Mapika/decider-2b
- Informe de benchmark GGUF en ingles: BENCHMARK_3070TI_STATE_FIRST.md (en el repositorio)
- Informe de benchmark GGUF en chino tradicional: BENCHMARK_3070TI_STATE_FIRST.zh-TW.md (en el repositorio)
- Comparativa de tres modelos en ingles: BENCHMARK_THREE_MODELS.md (en el repositorio)
- Comparativa de tres modelos en chino tradicional: BENCHMARK_THREE_MODELS.zh-TW.md (en el repositorio)
- Datos del benchmark GGUF: benchmarks/gguf-comparison.json (en el repositorio)
- Datos de la comparativa: benchmarks/general-comparison.json y benchmarks/general-comparison.csv (en el repositorio)
- Codigo del shim en C: code/dz_shim.c (en el repositorio)
- Servidor de inferencia: code/decider_llama_serve.py (en el repositorio)
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Resultados de la busqueda web: no se ha encontrado informacion relevante sobre este modelo; las paginas devueltas corresponden a Microsoft y no guardan relacion con el modelo.
