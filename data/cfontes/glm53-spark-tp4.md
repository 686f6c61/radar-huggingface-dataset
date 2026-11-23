# cfontes/glm53-spark-tp4

## Resumen

GLM-5.3 es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por Z.ai (zai-org), con 753.000 millones de parametros totales. La ficha que nos ocupa, `cfontes/glm53-spark-tp4`, no es el modelo original sino un kit de despliegue reproducible que empaqueta una cuantizacion EXL3 MixedK de 3,38 bits por peso del modelo base, junto con un motor de inferencia parcheado (TensorFold) y un drafter de decodificacion especulativa (DFlash2). Su proposito es servir el modelo a contexto completo de 1.048.576 tokens sobre cuatro estaciones NVIDIA DGX Spark (GB10) con 512 GB de memoria unificada en total.

La relevancia de este repositorio reside en dos aportaciones tecnicas concretas: por un lado, demuestra que un MoE de 753B puede ejecutarse en hardware de escritorio de gama alta distribuido cuando se cuantiza a 3,38 bpw (297,1 GiB de pesos en 58 shards); por otro, incluye una serie de siete parches que implementan una cache de prefijo KV incremental, lo que reduce el coste por turno en conversaciones agenticas multi-turno de complejidad O(n²) a coste plano. Segun las mediciones del autor, esto se traduce en una aceleracion de hasta 4,4x en el sexto turno de una sesion agentica.

El repositorio tiene 325,9 GB, 513 descargas y 4 likes en el momento de la consulta. La licencia es `glm-5.3` (marcada como "other" en Hugging Face), y el drafter incluido es un derivado de `incoai/GLM-5.3-DFlash2` bajo CC BY-NC-ND 4.0, lo que restringe su uso comercial y su redistribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer, tipo `glm_moe_dsa` |
| Parametros totales | 753.000 millones (modelo base GLM-5.3) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens |
| Tipos de cuantizacion | EXL3 MixedK 3,38 bits por peso (3-bit) |
| Idiomas soportados | no disponible |
| Licencia | `glm-5.3` (etiquetada como "other"); drafter bajo CC BY-NC-ND 4.0 |
| Formato de pesos | safetensors (58 shards, 297,1 GiB) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de 753B parametros, identificado en los tags como `glm_moe_dsa`. La cuantizacion aplicada es EXL3 MixedK a 3,38 bits por peso, que reduce el peso total a 297,1 GiB en 58 shards safetensors. El pack de cuantizacion reporta una fidelidad respecto al modelo original de KL 0,0948, una concordancia top-1 del 92,98 % y un incremento de perplejidad del 2,1 %, medidos por el autor del pack.

El kit de despliegue incorpora el motor TensorFold parcheado con paralelismo tensorial de grado 4 (TP4) y paralelismo de contexto en decodificacion de grado 4 (DCP4), de modo que la posicion `p` reside en el rango `p % 4`. La cache KV se almacena en fp8 latente y se reparte entre los cuatro rangos. La decodificacion especulativa corre a cargo de DFlash2, con profundidad de borrador de hasta 13 y aceptacion relajada `top2`; el pack de pesos no incluye capa MTP, por lo que se requiere un checkpoint drafter separado. La innovacion principal es la cache de prefijo KV incremental: el troceado del prompt se define como funcion exclusiva de la posicion, lo que garantiza que la reutilizacion de prefijos sea exacta y equivalente a una ejecucion en frio. Los detalles de entrenamiento del modelo base (numero de tokens, composicion del dataset, RLHF/DPO) no estan disponibles en la informacion proporcionada.

## Capacidades

- Generacion de texto en dominios de prosa, codigo y salida estructurada, con velocidades de decodificacion medidas de 55,7, 69,2 y 73,6 tok/s respectivamente en la lane de 4 Sparks.
- Razonamiento de multiples pasos con modo de pensamiento acotado mediante el parametro `thinking_budget`.
- Razonamiento matematico: 96,7 % en GSM8K completo (1.271 de 1.315 respuestas comprometidas).
- Razonamiento cientifico de nivel experto: 87,8 % en GPQA-Diamond sobre una muestra estratificada de 50 preguntas (36 de 41 comprometidas).
- Sesiones agenticas de contexto largo: la cache de prefijo permite conversaciones multi-turno con coste por turno plano.
- Procesamiento de contextos de hasta 1.048.576 tokens con cache KV en fp8.
- Decodificacion especulativa con DFlash2 para acelerar la generacion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponible en la informacion proporcionada.
- Idiomas soportados: no disponible en la informacion proporcionada.

## Casos de uso

- Sesiones agenticas de largo recorrido: el modelo puede mantener conversaciones de decenas de turnos sin que el coste por turno crezca linealmente con el historial, gracias a la cache de prefijo KV incremental. En la medicion del autor, un sexto turno con 15.930 tokens de prompt se resuelve en 19,4 s frente a 85,3 s sin cache (4,4x de aceleracion), lo que lo hace viable para agentes que acumulan contexto durante horas.
- Analisis de documentos extensos: con 1.048.576 tokens de contexto, el modelo puede ingerir libros tecnicos completos, expedientes o bases de codigo de gran tamano en una sola pasada. La extension de un prompt de 19.215 tokens con una sola palabra pasa de 46,4 s en frio a 0,41 s reutilizando 19.212 tokens cacheados.
- Generacion de codigo en produccion: la velocidad de 69,2 tok/s en cargas de codigo y la salida estructurada a 73,6 tok/s lo hacen adecuado para pipelines de generacion asistida, revision de parches y autocompletado en entornos con requisitos de privacidad, al ejecutarse en hardware propio sin depender de APIs externas.
- Razonamiento matematico y verificacion formal: con un 96,7 % en GSM8K, puede emplearse en sistemas de resolucion de problemas aritmeticos y de validacion de calculos dentro de flujos de ingenieria o educacion, siempre que se configure `temperature >= 0,6` y un `thinking_budget` explicito.
- Evaluacion cientifica asistida: el 87,8 % en GPQA-Diamond lo situa como herramienta de apoyo en preguntas de fisica y quimica de nivel posgrado. Conviene monitorizar los bucles de repeticion, ya que 9 de las 50 preguntas degeneraron en repeticion y fueron descartadas por el detector de bucles.
- Despliegue on-premise de alta confidencialidad: al ejecutarse sobre cuatro DGX Spark con RoCE y sin salida a Internet, encaja en entornos sanitarios, legales o de defensa donde el modelo no puede salir de la red local. El coste es el hardware: cuatro estaciones GB10 con 128 GB de memoria unificada cada una.
- Laboratorio de investigacion en inferencia distribuida: el repositorio incluye el motor parcheado, los scripts de verificacion y las pruebas de aceptacion de la cache, lo que permite reproducir y extender los experimentos de paralelismo tensorial y de contexto.

## Benchmarks y rendimiento

Rendimiento de decodificacion medido por el autor (320 tokens nuevos, temperatura 0, n=6, p50, lane de 4 Sparks con TP4, DCP=4 y DFlash2):

| Carga de trabajo | tok/s |
|---|---:|
| Prosa | 55,7 |
| Codigo | 69,2 |
| Estructurado | 73,6 |

Aceleracion de la cache de prefijo en una conversacion agentica de seis turnos (unos 2.700 tokens anadidos por turno):

| Turno | Tokens de prompt | Cacheados | Muro por turno | Sin cache | Aceleracion |
|---:|---:|---:|---:|---:|---:|
| 1 | 2.670 | 0 | 13,0 s | 15,5 s | 1,2x |
| 3 | 7.974 | 5.120 | 17,2 s | 44,5 s | 2,6x |
| 5 | 13.278 | 10.240 | 17,7 s | 72,0 s | 4,1x |
| 6 | 15.930 | 12.288 | 19,4 s | 85,3 s | 4,4x |

Calidad:

| Benchmark | Resultado | Metodo |
|---|---|---|
| GSM8K (completo, 1.319) | 96,7 % (1.271 / 1.315 comprometidas) | `runeval.py`, T=0 |
| GPQA-Diamond (estratificado, 50) | 87,8 % (36 / 41 comprometidas) | T=0,6, `thinking_budget=12000` |

Nota del autor: las cifras de la pagina del modelo base (hasta 69 tok/s de pico, 41,1 tok/s de media sobre 6 prompts reales) provienen de un arnes distinto, con 512 tokens nuevos y contextos largos, y no son comparables con la tabla anterior. Los denominadores de GPQA importan: 9 de las 50 preguntas no se respondieron por degeneracion en bucles de repeticion.

## Requisitos de hardware

- VRAM/memoria estimada: los pesos cuantizados ocupan 297,1 GiB, repartidos en 58 shards. Con la cache KV en fp8 para 1.048.576 tokens, el total encaja en los 512 GB de memoria unificada de cuatro DGX Spark.
- GPU recomendadas: cuatro NVIDIA DGX Spark (GB10) con 128 GB de memoria unificada cada una, conectadas mediante un conmutador QSFP con RoCE. No se documenta compatibilidad con A100, H100 ni RTX 4090; el modelo no cabe en una sola GPU de 80 GB.
- Cabe en GPU de consumo: no. El requisito minimo documentado es el conjunto de cuatro DGX Spark.
- Opciones de despliegue: el repositorio incluye un motor TensorFold parcheado con su propio lanzador (`serve.sh`), endpoint compatible con OpenAI en `http://<rank0>:8300/v1` y modelo servido como `glm-5.3-exl3`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Tiempo de arranque: aproximadamente 14 minutos hasta estado READY.
- Latencia y throughput: 55,7-73,6 tok/s en decodificacion segun la carga; 19,4 s por turno en el sexto turno de una sesion agentica con cache; 0,41 s para extender un prompt de 19.215 tokens con un solo token adicional.

## Comparativa con modelos similares

No se dispone de datos de comparacion con otros modelos en la informacion proporcionada. El repositorio no incluye tablas comparativas frente a alternativas de la misma categoria, y las cifras de la pagina del modelo base no son directamente comparables por usar un arnes distinto. Los unicos puntos de referencia internos son las mediciones del propio autor (GSM8K 96,7 %, GPQA-Diamond 87,8 %) y la fidelidad de la cuantizacion (KL 0,0948, top-1 92,98 %, perplejidad +2,1 %).

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| GLM-5.3 (base) | 753B | no disponible | `glm-5.3` | Hugging Face (zai-org) |
| glm53-spark-tp4 (esta ficha) | 753B (3,38 bpw) | 1.048.576 | `glm-5.3` + CC BY-NC-ND 4.0 (drafter) | Hugging Face (cfontes) |
| Alternativas de misma categoria | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Una sola peticion simultanea: la lane es single-flight; las peticiones concurrentes se encolan y cuestan entre 1,5 y 2,9 veces mas por elemento. No conviene apuntar una flota de agentes en paralelo a una sola lane.
- `"draft": false` es patologico en esta compilacion: aproximadamente 9 veces mas lento y con una cifra de tok/s enganosa. La decodificacion especulativa debe permanecer activa.
- Las cargas de razonamiento requieren `temperature >= 0,6` y un `thinking_budget` explicito. A T=0 el modelo degenera en repeticion literal en cadenas largas; sin presupuesto puede pensar hasta el limite de tokens y no responder nunca.
- El pack de pesos no incluye capa MTP; se necesita un checkpoint drafter DFlash2 separado.
- El drafter incluido es un derivado recalibrado de `incoai/GLM-5.3-DFlash2` bajo CC BY-NC-ND 4.0: no se puede redistribuir ni usar comercialmente. Consultar `NOTICE`.
- Riesgo de bucles de repeticion: en GPQA-Diamond, 9 de 50 preguntas degeneraron y fueron descartadas por el detector de bucles, no por filtrado silencioso. En produccion conviene instrumentar deteccion de repeticion.
- Las mediciones proceden de una unica lane de 4 Sparks; deben tratarse como cifras de esa configuracion concreta, no como garantia.
- Idiomas soportados y sesgos conocidos: no disponibles en la informacion proporcionada.
- La licencia `glm-5.3` esta etiquetada como "other"; es necesario revisar los terminos del modelo base antes de un uso comercial.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/cfontes/glm53-spark-tp4
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Pesos cuantizados EXL3: https://huggingface.co/vcruz305/GLM-5.3-EXL3-3.38bpw
- Drafter upstream: https://huggingface.co/incoai/GLM-5.3-DFlash2
- Notas de diseno y parches de la cache KV: directorio `kv_cache/` del repositorio
- Scripts de despliegue: `fetch_weights.sh`, `serve.sh`, `verify.sh`, `DEPLOY.md` y `NOTICE` en el repositorio
