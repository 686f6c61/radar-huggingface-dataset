# ConwayResearch/Underdog-Saluki-27B-1.0

## Resumen

Underdog Saluki 27B 1.0 es una cuantización de 2 bits del modelo Qwen3.8-27B, publicada por ConwayResearch (Underdog) bajo licencia Apache 2.0. El objetivo declarado por el autor es claro: comprimir un modelo de aproximadamente 26.900 millones de parámetros en un único fichero GGUF de 7,89 GB sin destruir la capacidad de tool calling, que es históricamente lo primero que se degrada en cuantizaciones agresivas. Para conseguirlo parte del GGUF GSQ-RCO de ISTA-DASLab y aplica un proceso de calibración con imatrix y un ajuste posterior orientado a preservar el formato de llamadas a funciones.

El resultado, según los datos de la model card, es un modelo que retiene en torno al 96 % de media en nueve benchmarks respecto al modelo completo, y que incluso supera al Qwen3.8-27B sin cuantizar en tareas de tool calling (88 frente a 84 sobre 120 tareas de BFCL v4) y en llamadas paralelas (42 frente a 35). El coste es una pérdida clara en matemáticas de competición (AIME 2025: 79,2 frente a 96,7) y en razonamiento multietapa (MuSR: 67,5 frente a 79,6).

Se distribuye exclusivamente en formato GGUF para llama.cpp y derivados, con modo thinking activado por defecto y desactivable por petición. La entrada principal es solo texto, pero existe un add-on de visión opcional (mmproj) de entre 0,6 y 0,9 GB. El soporte de idiomas declarado se limita al inglés. Es, por tanto, una pieza pensada para desplegar agentes con function calling en hardware de gama media, no un modelo de propósito general multilingüe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.8-27B; no se detallan capas ni atencion en la informacion disponible) |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | 32.768 tokens en la configuracion de ejemplo del autor; maximo oficial no disponible |
| Tipos de cuantizacion | IQ2-mix (2 bits, fichero principal de 7,89 GB); add-on de vision en F16 (928 MB) y Q8_0 (629 MB) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Modelo base | Qwen/Qwen3.8-27B; ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF |
| Relacion con el modelo base | quantized |
| Tamano del repositorio | 9,5 GB |
| Modalidad | texto; vision opcional mediante mmproj |
| Modo thinking | activado por defecto, desactivable por peticion |
| Descargas / likes | 142 / 67 |

## Arquitectura y entrenamiento

Saluki no es un modelo entrenado desde cero, sino una derivacion cuantizada. La model card declara `base_model_relation: quantized` y dos referencias: el Qwen3.8-27B original de Qwen y el GGUF GSQ-RCO publicado por ISTA-DASLab. Sobre esa base, el autor indica que el modelo esta "tuned to keep tool calling intact" y que se ha utilizado imatrix como parte del proceso, lo que sugiere una calibracion con estadisticas de activacion para decidir como repartir el presupuesto de bits en un esquema de 2 bits mixto. No se especifican en la informacion disponible ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si hubo etapas de RLHF o DPO.

Arquitectonicamente hereda lo que sea que implemente Qwen3.8-27B: un transformer decoder-only con plantilla de chat propia, gestion nativa de tool calls y modo thinking. El autor no documenta innovaciones propias de arquitectura (ni atencion lineal, ni decodificacion especulativa, ni hibridaciones SSM); la contribucion esta en el pipeline de cuantizacion y en el ajuste posterior para no romper el formato de function calling. La plantilla de chat se activa con `--jinja` en llama.cpp, que es lo que permite que el servidor interprete correctamente las llamadas a herramientas y el bloque de razonamiento. La cuantizacion a 2 bits explica tanto la compresion (7,89 GB frente a unos 54 GB del modelo completo) como el patron de degradacion observado: las tareas que dependen de precision numerica fina o de memoria de contexto larga caen mas, mientras que las tareas de formato e instrucciones se mantienen o incluso mejoran.

## Capacidades

- Generacion de texto conversacional en ingles, con plantilla de chat compatible con la API de OpenAI.
- Tool calling y function calling, con soporte de llamadas en paralelo (el autor reporta 42 aciertos sobre 100 tareas paralelas de BFCL v4).
- Flujos de agente y razonamiento multietapa, con bucle de herramienta integrado en la plantilla.
- Modo thinking activado por defecto y conmutables por peticion mediante `chat_template_kwargs: {"enable_thinking": false}`.
- Generacion de codigo, con buen resultado relativo en MBPP+ (78,0) aunque por debajo del modelo completo.
- Seguimiento de instrucciones, con resultados por encima del modelo completo en IFEval (93,5) e IFBench (72,7).
- Vision opcional mediante add-on mmproj, que habilita el envio de imagenes a traves de la API de chat de llama.cpp.
- Capacidad matematica de competicion, notablemente degradada respecto al modelo completo.
- Sin soporte declarado de audio ni de otros idiomas distintos del ingles.

## Casos de uso

- Agentes de tool calling en produccion: el modelo esta especificamente calibrado para mantener el formato de llamadas a funciones en 2 bits, con una puntuacion de 88/120 en BFCL v4 y soporte de llamadas paralelas, lo que permite integrarlo como capa de decision en pipelines de automatizacion con multiples herramientas.
- Asistentes de atencion al cliente multi-turno en ingles: con 32.768 tokens de contexto en la configuracion recomendada, puede mantener historiales largos de conversacion junto con el estado de herramientas invocadas.
- Ejecucion local en portatiles y equipos de gama media: el fichero de 7,89 GB cabe en GPUs de consumo con 8-12 GB de VRAM o incluso en CPU con RAM suficiente, lo que facilita prototipado y demos sin infraestructura cloud.
- Clasificacion y extraccion de campos con salida estructurada: al conservar el formato de function calling, se puede usar para forzar salidas JSON validadas en pipelines de ingesta de datos.
- Automatizacion de tareas de oficina con herramientas externas: consulta de calendarios, envio de correos o actualizacion de tickets mediante llamadas encadenadas, aprovechando la retencion del 96 % medida por el autor.
- Analisis de documentos con imagenes: usando el add-on de vision Q8_0 (629 MB) o F16 (928 MB) se pueden procesar capturas, diagramas o formularios escaneados junto con texto, manteniendo el mismo servidor llama.cpp.
- Evaluacion y benchmarking de cuantizaciones agresivas: sirve como referencia practica de cuanto se puede comprimir un modelo de 27B antes de que el tool calling se rompa, ya que el autor publica comparativas directas contra el modelo completo.
- Inferencia en el borde o entornos con restricciones de memoria: cuando el presupuesto de VRAM es inferior a 10 GB, es una de las pocas opciones viables para un modelo de casi 27B con capacidades de agente.

## Benchmarks y rendimiento

Tool calling, sobre 120 tareas de BFCL v4 congeladas antes de las pruebas, thinking off y temperatura 0:

| Modelo | Tamano | Aciertos (de 120) |
|---|---|---|
| Underdog Saluki 27B 1.0 | 7,89 GB | 88 |
| Qwen3.8-27B (completo) | 54 GB | 84 |
| Bonsai 2 | 5,95 GB | 70 |

Llamadas paralelas: 100 tareas paralelas de BFCL v4 con el checker oficial, thinking off; Saluki 42 frente a 35 del modelo completo.

Otros benchmarks, con la comparacion entre Saluki y el modelo completo:

| Benchmark | Saluki | Qwen3.8-27B completo |
|---|---|---|
| SWE-bench Verified (50 issues) | 30 | 33 |
| IFEval (prompt-loose) | 93,5 | 91,5 (publico) |
| IFBench (prompt-loose) | 72,7 | 71,0 (publico) |
| MBPP+ | 78,0 | 83,9 (publico) |
| MuSR | 67,5 | 79,6 (publico) |
| AIME 2025 (avg@4) | 79,2 | 96,7 (publico) |
| AIME 2026 (avg@4) | 80,0 | 94,6 (publico) |

El autor indica que las puntuaciones publicas provienen de un harness distinto al suyo y que la retencion media es del 96 % en nueve benchmarks. Advierte ademas de que 120 tareas son una muestra modesta y que diferencias de pocas tareas entran dentro de la variacion entre ejecuciones.

## Requisitos de hardware

- VRAM para los pesos: 7,89 GB para el fichero IQ2-mix. El add-on de vision anade 629 MB (Q8_0) o 928 MB (F16).
- Cache KV: a 32.768 tokens en FP16 la cache anade varios GB adicionales, con un tamano exacto que depende de la configuracion de capas y cabezas del modelo base (no disponible en la informacion proporcionada). Se recomienda cuantizar la cache (por ejemplo con `-ctk` y `-ctv` en llama.cpp) para reducir este coste.
- GPUs de consumo: cabe en tarjetas con 12 GB de VRAM (RTX 3060 12 GB, RTX 4070) y, con cache KV recortada o cuantizada, en modelos de 8 GB. Es una de las configuraciones objetivo del autor ("Qwen3.8-27B in under 8 GB").
- GPUs profesionales: funciona sobradamente en RTX 4090, A100, H100 y similares; en estos casos el cuello de botella pasa a ser el ancho de banda mas que la capacidad.
- CPU y RAM: al ser GGUF para llama.cpp, puede ejecutarse en CPU con RAM suficiente para el fichero y la cache, aunque con latencias mucho mayores.
- Opciones de despliegue: llama.cpp (`llama-server`) y cualquier aplicacion construida sobre el. El autor indica que el modelo esta pensado para llama.cpp estandar, no para builds modificadas. La API de chat expuesta es compatible con la de OpenAI en el puerto 8080. No se mencionan vLLM, TGI u Ollama en la informacion disponible.
- Parametros de ejecucion recomendados por el autor: `llama-server -m <fichero> --jinja -ngl 99 -fa on -c 32768`; para vision, anadir `--mmproj <fichero>`.
- Ajustes de muestreo: temperatura 0,6, top_p 0,95 y top_k 20 para uso general y razonamiento; temperatura 0 con thinking desactivado para tool calling rapido y directo.
- Latencia y throughput: no se publican cifras concretas en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano en disco | Contexto | Tool calling (BFCL v4, 120 tareas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Underdog Saluki 27B 1.0 | ~26,9 B | 7,89 GB (IQ2-mix) | 32.768 tokens en la config de ejemplo | 88 | Apache 2.0 | GGUF en HuggingFace |
| Qwen3.8-27B (completo) | ~26,9 B | 54 GB | maximo no disponible | 84 | Apache 2.0 | modelo base original |
| Bonsai 2 | no disponible | 5,95 GB | no disponible | 70 | no disponible | no disponible |

Bonsai 2 aparece unicamente citado por el autor como referencia de tamano y puntuacion en BFCL v4; no se dispone de mas datos sobre el (arquitectura, licencia ni contexto) en la informacion proporcionada.

## Limitaciones y advertencias

- Retiene aproximadamente entre el 82 % y el 85 % de la puntuacion del modelo completo en matematicas de competicion (AIME 2025: 79,2 frente a 96,7; AIME 2026: 80,0 frente a 94,6).
- Es especialmente debil en acertijos de instrucciones a nivel de letra: palindromos, reglas de vocales y orden alfabetico.
- Alrededor de una quinta parte de las respuestas con llamadas paralelas presentan pequenos errores de formato.
- Con el modo thinking activado tiende a razonar de forma extensa antes de responder, lo que incrementa la latencia y el consumo de tokens.
- La vision no viene incluida: el fichero principal es solo texto y requiere descargar aparte el add-on mmproj de 0,6 a 0,9 GB.
- El unico idioma declarado es el ingles; no hay soporte multilingue documentado.
- La cuantizacion a 2 bits implica degradacion adicional no cuantificada en todos los dominios; los benchmarks publicados cubren nueve tareas y el propio autor advierte de que la muestra de 120 tareas es modesta y que parte de las diferencias entra dentro de la variacion entre ejecuciones.
- Las puntuaciones del modelo completo marcadas como "publicas" provienen de un harness distinto, por lo que la comparacion directa no es estrictamente homogenea.
- Requiere llama.cpp con soporte de `--jinja` para que la plantilla de chat gestione correctamente tool calls y thinking; no se documenta compatibilidad con otros runtimes.
- Licencia Apache 2.0, sin restricciones declaradas para uso comercial, pero el aviso NOTICE del repositorio debe conservarse por la procedencia de los datos de BFCL y de los modelos base.
- Riesgo de alucinacion: no cuantificado en la model card; aplican los riesgos habituales de un modelo generativo de este tamano, agravados por el nivel de cuantizacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ConwayResearch/Underdog-Saluki-27B-1.0
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- GGUF de cuantizacion GSQ-RCO del que deriva: https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- Fichero principal: `Underdog-Saluki-27B-1.0-IQ2-mix.gguf` (7,89 GB) en el repositorio anterior
- Add-on de vision: `mmproj-Underdog-Saluki-27B-1.0-F16.gguf` (928 MB) y `mmproj-Underdog-Saluki-27B-1.0-Q8_0.gguf` (629 MB)
- Berkeley Function Calling Leaderboard (origen de las tareas de Underdog Bench): no se proporciona URL en la informacion disponible
- Paper, blog o repositorio adicional del autor: no disponible
- Demo publica: no disponible
