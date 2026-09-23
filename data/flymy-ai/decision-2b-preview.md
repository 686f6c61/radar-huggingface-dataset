# flymy-ai/decision-2b-preview

## Resumen

Decision 2B - FlyMyJev evaluation preview es un paquete de investigacion publicado por flymy-ai que no genera texto: emite **probabilidades nativas sobre etiquetas de decision**. Se construye sobre el modelo base `openbmb/MiniCPM5-2B` mediante un adaptador LoRA, filas de tokens estructurales y una cabeza pointer entrenada, con un total de 2.275.545.600 parametros, de los cuales solo 26.176.000 son entrenados (checkpoint congelado `minicpm5_reduced_v16_4k_v59`). El repositorio de 0,1 GB no incluye los pesos del base: estos se descargan por separado en la revision exacta fijada en `model.json`.

El modelo resuelve tareas de decision tipada con tres modos declarados: `choice` (probabilidades sobre etiquetas, preservando el orden), `noul` (falso/verdadero) y `score` (indices de cadena con base cero en el orden de niveles aportado). La salida es siempre la softmax de la cabeza pointer con una temperatura congelada; no hay tokens generados, logprobs de tokens, llamadas a modelos externos ni ensembles de orden de opciones.

Su relevancia actual es metodologica: el autor publica resultados medidos sobre el subconjunto publico de JevBench (174/231, 75,32 % de acierto) junto con el codigo de inferencia, los informes de evaluacion y una revision de compatibilidad numerica, y advierte explicitamente de que no es un resultado oficial de JevBench ni una version de produccion validada. La licencia del paquete y las condiciones de origen del entrenamiento figuran como cuestiones sin resolver.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo base transformer (`openbmb/MiniCPM5-2B`) mas adaptador LoRA, filas de tokens estructurales y cabeza pointer; los detalles internos del backbone no se especifican en la informacion disponible |
| Parametros totales | 2.275.545.600 (checkpoint congelado `minicpm5_reduced_v16_4k_v59`) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Parametros entrenados | 26.176.000 (LoRA + cabeza pointer) |
| Longitud de contexto | 4096 tokens (limite de empaquetado historico congelado del encoder) |
| Tipos de cuantizacion | no disponible; el servicio se realiza en bf16 sin fusionar (unmerged) |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible; la base fijada se descarga bajo Apache-2.0, pero la licencia del paquete y las condiciones de origen del entrenamiento no estan resueltas |
| Formato de pesos | adaptador LoRA, filas de tokens estructurales y cabeza pointer, mas codigo de inferencia ejecutable; el formato de serializacion concreto no se especifica (repositorio de 0,1 GB) |
| Autor | flymy-ai |
| Modelo base | openbmb/MiniCPM5-2B |
| Fecha de publicacion | 2026-09-23 |
| Descargas / likes | 0 / 0 |
| Pipeline declarado | no disponible |
| Modos de decision | `choice`, `noul` (falso/verdadero), `score` (indices con base cero) |
| Limites del wrapper | 64 KiB por peticion, 4096 nodos JSON, 255 opciones, claves de respuesta de 8 KiB como maximo |

## Arquitectura y entrenamiento

La pieza publicada no es un modelo generativo completo, sino un paquete de inferencia sobre un backbone congelado: el base MiniCPM5-2B se descarga en una revision fijada y se le aplica un adaptador LoRA junto con filas de tokens estructurales y una cabeza pointer entrenada. El entrenamiento afecta a 26.176.000 parametros de un total de 2.275.545.600. En inferencia, la distribucion de salida es la softmax de la cabeza pointer con una temperatura congelada, ajustada sobre el propio replay de transferencia del checkpoint y sobre ejemplos de desarrollo de probabilidad conocida; no se generan tokens de respuesta.

El autor indica que se incluyen los hashes exactos de las fuentes de entrenamiento y la receta, pero que el corpus mixto no es publico y que **no se ha establecido de forma independiente la ausencia completa de contaminacion**. Ademas, se reconoce que los resultados publicos influyeron en el diseno experimental previo y en la seleccion de candidatos, por lo que no se reclama un desarrollo ciego al benchmark. El paquete incorpora una revision de compatibilidad numerica (`reports/numerical-compatibility-review.json`, `audit_rounding.py`) que corrige el tratamiento del redondeo de la suma de la softmax en float32: se exige una escala de normalizacion compartida que satisfaga todos los intervalos de seis decimales con un error maximo de dos epsilons de float32, y se explicita que esto es compatibilidad a la precision reportada, no igualdad bit a bit.

## Capacidades

- Decision tipada con modos `choice` (probabilidades sobre etiquetas en el orden dado), `noul` (falso/verdadero) y `score` (indices con base cero en el orden de niveles aportado).
- Salida de probabilidades nativas calibradas, sin generacion de texto ni logprobs de tokens.
- Inferencia restringida a estado, tipo, instrucciones y criterios; las etiquetas y los metadatos de la tarea quedan excluidos de la entrada.
- Adaptador de arnes incluido (`jevbench_adapter.py`) que mapea falso/verdadero a no/yes del harness.
- Verificacion de integridad: el codigo y los pesos se comprueban por hash antes de cargarse; el base se descarga y hashea con un maximo de dos workers.
- Ejecucion con base local verificada mediante `--assets /path/to/base`.
- Procesamiento serial de peticiones con un modelo cargado por proceso, sin cache de respuestas, sin historial de conversacion, sin consultas a base de datos y sin inferencia externa.
- Idiomas: unicamente ingles.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Enrutado de tickets de soporte: el modo `choice` permite asignar una consulta a colas etiquetadas (por ejemplo, facturacion frente a soporte tecnico) devolviendo una distribucion de probabilidad en lugar de una respuesta generada, lo que facilita fijar umbrales de derivacion a un humano.
- Triaje de urgencia con escala ordinal: el modo `score` devuelve indices con base cero sobre el orden de niveles aportado, adecuado para clasificar severidad o prioridad preservando la semantica ordinal.
- Puertas booleanas en pipelines: el modo `noul` (falso/verdadero) encaja como filtro determinista antes de etapas mas costosas, con una latencia local p50 de 83,38 ms en tier Standard.
- Moderacion o validacion de contenido: clasificacion binaria o multietiqueta de textos breves de estado, con verificacion de hash de pesos antes de cargar y sin dependencia de red salvo la descarga opcional del base.
- Evaluacion comparativa de sistemas de decision: el paquete esta preparado para ejecutarse a traves del harness oficial de JevBench sin modificar su registro, lo que permite reproducir la medicion publica y anadir conjuntos retenidos en local.
- Servicio de baja latencia en una sola GPU consumer: con procesamiento serial y 4,83 GiB de VRAM asignada en pico, se puede desplegar como microservicio interno acotando la cola de peticiones en el llamante.
- Experimentacion academica sobre calibracion: la publicacion incluye los 231 resultados publicos, las metricas calibradas, los tiempos y las comprobaciones de memoria, lo que sirve como material de estudio de calibracion de cabezas pointer y de redondeo numerico en float32.

## Benchmarks y rendimiento

Resultados medidos sobre el subconjunto publico de JevBench (`reports/public-evaluation.json`), con una RTX 4090, Torch 2.8.0+cu128, transformers 4.57.6 y peft 0.15.2:

| Subconjunto publico de JevBench | Correctas / total | Precision |
|---|---:|---:|
| All | 174 / 231 | 75,32 % |
| Easy | 48 / 48 | 100,00 % |
| Standard | 60 / 72 | 83,33 % |
| Hard | 66 / 111 | 59,46 % |

Datos adicionales aportados por el autor:

| Metrica | Valor |
|---|---|
| Suite completa de decisiones | 534 (incluye tareas retenidas no disponibles para el autor) |
| Reproducibilidad | las 231 predicciones argmax publicas reproducen la medicion previa del pointer v59 |
| Precio de referencia sugerido | 0,03 USD por millon de tokens de entrada, estimacion de clase de tamano para servicio alojado basada en la referencia Qwen3.5-4B |
| Latencia local p50/p95 (tier Standard) | 83,38 / 86,91 ms (encoding + forward + calibracion, excluye red) |
| RSS pico del proceso | 5,08 GiB |
| VRAM asignada en pico | 4,83 GiB |
| Deriva tras 128 peticiones repetidas | 0,00 MiB de RSS y 0,00 MiB de VRAM asignada |
| Respuesta JSON mas grande devuelta | 352 bytes |

No se han publicado en la informacion disponible resultados de otros benchmarks habituales (MMLU, HumanEval, GSM8K u otros).

## Requisitos de hardware

- VRAM estimada para inferencia: 4,83 GiB asignados en pico, segun la medicion del autor en bf16 sin fusionar.
- Memoria del proceso: 5,08 GiB de RSS en pico.
- GPU recomendadas: RTX 4090 (configuracion de medida). Por el consumo medido, cabe en GPUs consumer con al menos 6 GB de VRAM libres, aunque no se han publicado pruebas en otros modelos concretos.
- Cabe en GPU consumer: si, segun el consumo medido; se requiere una GPU CUDA.
- Entorno: Linux, Python 3.11, CUDA, `torch==2.8.0` (rueda cu128), `numpy==2.1.2` y las dependencias de `requirements-minicpm.txt`.
- Opciones de despliegue: exclusivamente el codigo incluido (`model.py`, carga mediante `model.load()`); no se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia genericos, dado que el modelo es pointer-only y no genera texto.
- Concurrencia: un modelo por proceso y procesamiento serial de peticiones, sin cache de respuestas; el llamante debe acotar su propia cola.
- Latencia: p50/p95 de 83,38/86,91 ms en tier Standard para encoding + forward + calibracion en local; se excluye la red y no se reclama como latencia HTTP de produccion.
- Almacenamiento y red: el repositorio ocupa 0,1 GB, pero la primera carga descarga y hashea el modelo base fijado; la descarga del base es la unica dependencia de red opcional.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| decision-2b-preview | 2.275.545.600 (26.176.000 entrenados) | 4096 tokens | probabilidades nativas sobre etiquetas (`choice`, `noul`, `score`) | no disponible | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| openbmb/MiniCPM5-2B (base) | no disponible en la informacion proporcionada | no disponible | generacion de texto | Apache-2.0, segun la model card del paquete | HuggingFace |
| Qwen3.5-4B | no disponible | no disponible | no disponible | no disponible | citado unicamente como referencia de coste (0,03 USD por millon de tokens de entrada) para el calculo de decider-2b, no incluido en el paquete |

No se dispone de datos comparativos de rendimiento frente a alternativas de decision tipada o de clasificacion con cabezas pointer en la informacion proporcionada.

## Limitaciones y advertencias

- El paquete se distribuye para evaluacion independiente de benchmarks: no es un resultado oficial de JevBench ni una version de produccion validada.
- Licencia del paquete no declarada; el autor remite a `EVALUATION-PERMISSION.md` y `provenance-review.json` antes de cualquier otro uso, y senala que la disponibilidad de pesos, la licencia del codigo y las condiciones no resueltas del origen del entrenamiento son hechos separados.
- La receta y los hashes de las fuentes de entrenamiento se incluyen, pero el corpus mixto no es publico y la ausencia completa de contaminacion no esta establecida de forma independiente.
- Los resultados publicos influyeron en el diseno experimental previo y en la seleccion de candidatos; no se reclama desarrollo ciego al benchmark.
- Solo ingles: no hay soporte multilingue declarado.
- El encoder congelado limita el empaquetado a 4096 tokens; los textos de estado largos pueden truncarse.
- La ventana de contexto y el wrapper imponen limites duros: 64 KiB por peticion, 4096 nodos JSON, 255 opciones y claves de respuesta de 8 KiB.
- Servicio serial: sin cache de respuestas, sin historial de conversacion, sin consultas a base de datos y sin inferencia externa; la gestion de colas es responsabilidad del llamante.
- No se generan tokens ni logprobs, por lo que no es utilizable para tareas de generacion, resumen, traduccion o dialogo abierto.
- El paquete no incluye los pesos del base: sin conexion, se requiere disponer de una copia local verificada del base para cargar el modelo.
- La revision numerica garantiza compatibilidad a la precision reportada (seis decimales, error maximo de dos epsilons de float32), no igualdad bit a bit.
- El precio de 0,03 USD por millon de tokens de entrada es una estimacion de referencia de clase de tamano para servicio alojado, no una tarifa ofrecida, y el calculo local no se considera gratuito.
- Repositorio sin descargas ni likes: no hay validacion independiente de la comunidad en el momento de la consulta.
- Las busquedas web realizadas no devolvieron ningun resultado relacionado con este modelo; los enlaces recuperados corresponden a paginas de soporte de Activision y no guardan relacion con la ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/flymy-ai/decision-2b-preview
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Harness oficial de JevBench: https://github.com/fstandhartinger/jevbench (commit `218511d85c5e9fc3dd12a08fae0e9818ea48bb68`)
- Ficheros citados en la model card, sin URL directa publicada: `model.json` (revision del base, receta, semillas, hashes de entrada), `reports/public-evaluation.json` (231 salidas, metricas calibradas, tiempos y memoria), `reports/numerical-compatibility-review.json`, `audit_rounding.py`, `EVALUATION-PERMISSION.md`, `provenance-review.json`, `requirements-minicpm.txt`, `example.json`, `jevbench_adapter.py`, `run_jevbench.py`.
- Resultados de busqueda web: sin enlaces relevantes para este modelo.
