# RoderickQiu/kev-4b-mlx-8bit

## Resumen

RoderickQiu/kev-4b-mlx-8bit es una conversion no oficial de Kev-4B: el adaptador LoRA de Kev ya fusionado dentro del backbone Qwen3.5-4B-Base y el resultado cuantizado a 8 bits en formato MLX para Apple Silicon. El modelo original, Kev-4B, lo desarrolla Jared Palmer y no es un modelo de chat: responde preguntas tipadas (una eleccion, un si/no, una puntuacion) con probabilidades calibradas a traves de un cabezal de puntero (pointer head). Esta variante la publica RoderickQiu para Qualm, una aplicacion de macOS que usa Kev para distinguir una ponencia de un feed.

El problema que resuelve es puramente practico: Kev-4B se distribuye como adaptador LoRA mas cabezal, de modo que para ejecutarlo en un Mac hay que descargar el backbone bf16 de 8,7 GB, fusionar el adaptador y cuantizar. Este repositorio ofrece ese trabajo hecho una sola vez, reduciendo la descarga de 9,0 GB a 4,5 GB y el primer arranque de unos 100 s a unos 11 s, sin retocar pesos. La arquitectura subyacente es un transformer Qwen3.5 de aproximadamente 4,2 mil millones de parametros, cuantizado a 8 bits con group size 64.

Es relevante ahora porque demuestra un patron de empaquetado para modelos de decision en hardware de consumo: cuantizacion agresiva manteniendo la fidelidad de las probabilidades calibradas, con verificacion de procedencia (SHA-256 y provenance.json) frente al checkpoint original de Kev. La licencia es Apache-2.0, la misma que la de ambos modelos de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-4B-Base) con adaptador LoRA de Kev fusionado y cabezal de puntero (pointer head) en fp32 |
| Parametros totales | 4.205.751.296 (~4,2 mil millones) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits, group size 64 (formato mlx-lm); original en bf16; se probo 4 bits pero no se publico |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato MLX, con campo "quantization" en config.json) mas head.pt en fp32; tokenizer y metadatos tomados de jaredpalmer/kev-4b |

## Arquitectura y entrenamiento

El modelo parte de jaredpalmer/kev-4b (revision 485ace8703592fcf405488b262449990824cfed1) y Qwen/Qwen3.5-4B-Base (revision 1001bb4d826a52d1f399e183466143f4da7b741b), con el codigo de Kev en el commit 08ab0b87d27cb5577a3b371ad7ed4e4686b0502b. El proceso de construccion tiene tres pasos: (1) fusion, cargando la base en bf16 con mlx-lm y mezclando el adaptador LoRA en fp32 sobre CPU mediante la formula W + B·A·α/r, redondeando una sola vez a bf16; (2) cuantizacion con mlx.nn.quantize a bits=8 y group_size=64, aplicada a cada capa Linear y Embedding cuyo ancho de entrada sea divisible por 64; y (3) conservacion intacta del cabezal de puntero en head.pt, que permanece en fp32. No se reentreno nada.

Kev anade sobre el backbone un cabezal de puntero y una calibracion (temperatura) que convierten la salida del transformer en decisiones tipadas con probabilidades calibradas, en lugar de texto libre. Esta variante no introduce ninguna innovacion de arquitectura propia: es exclusivamente un trabajo de fusion y cuantizacion. La relevancia tecnica esta en el control de calidad de la cuantizacion, que el autor documenta comparando la salida 8-bit con el bf16 original sobre un conjunto fijo de paginas.

## Capacidades

- Clasificacion de paginas web en tipos: video corto, feeds, directos (livestreams), redes sociales y otros, segun las pruebas de Qualm.
- Respuesta a preguntas tipadas: seleccion entre opciones, respuestas si/no y puntuaciones.
- Emision de probabilidades calibradas por pregunta a traves del cabezal de puntero, con temperatura de calibracion preservada del checkpoint original.
- Reglas de decision multiples evaluadas de forma independiente (el autor reporta el mismo ROC AUC por regla entre la version 8-bit y el bf16).
- Deteccion de contenido sensible como pregunta especifica (con desviacion de probabilidad de 0,053 frente al bf16).
- Integracion con el endpoint /v1/systemone de kev.serve a traves de la clase DecisionModel.
- No es un modelo de chat: no esta disenado para generacion libre de texto ni para conversacion multi-turno.
- Soporte de tool calling, agentes, vision, audio o modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Distincion de ponencias frente a feeds: el caso de uso real de Qualm, que emplea Kev para determinar si el contenido de una pagina es una ponencia, un feed, un directo o una red social, y actuar en consecuencia.
- Clasificacion de contenido en aplicaciones de escritorio macOS: Qualm descarga este repositorio automaticamente en el primer arranque, verifica provenance.json contra su checkpoint de Kev y las SHA-256, y construye los pesos localmente si no coinciden.
- Filtrado binario de contenido sensible: la pregunta "sensitive" se responde con una probabilidad calibrada, lo que permite umbrales de decision ajustables en lugar de etiquetas duras.
- Enrutado de peticiones en pipelines: al devolver decisiones tipadas con probabilidad, encaja como router previo a otros modelos o servicios (por ejemplo, decidir si una peticion requiere un modelo mayor).
- Etiquetado automatico de datasets web: sobre un lote de URL o contenidos, asignar tipo de pagina y reglas asociadas de forma consistente, aprovechando que el modelo reproduce la misma respuesta de tipo de pagina en 119 de 119 paginas frente al bf16.
- Puntuacion y priorizacion de contenido: la salida de tipo "score" permite ordenar o priorizar elementos de un feed segun criterios configurables.
- Ejecucion local en portatiles Apple Silicon: con un consumo de memoria de 6-7 GB mientras responde y un primer arranque de unos 11 s en un M5 Pro de 24 GB, es viable embeberlo en una app de escritorio sin depender de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor aporta una comparacion de calidad sobre 119 paginas web etiquetadas (video corto, feeds, directos, redes sociales y otros, procedentes de las pruebas de Qualm):

| Comparacion | Metrica | Resultado |
|---|---|---|
| Este archivo (8-bit) frente a cuantizar en tiempo de carga | Respuestas | Identicas, diferencia de 0,0 en todas las preguntas |
| Este archivo frente a Kev-4B en bf16 | ROC AUC | El mismo en cada regla |
| Este archivo frente a Kev-4B en bf16 | Tipo de pagina | La misma respuesta en 119 de 119 paginas |
| Este archivo frente a Kev-4B en bf16 | Probabilidad por pregunta | Dentro de 0,012-0,038 |
| Este archivo frente a Kev-4B en bf16 | Pregunta "sensitive" | Desviacion de 0,053 |
| 4 bits (no publicado) frente a bf16 | Recall en redes sociales | Baja de 0,95 a 0,85 |

Metricas de puesta en marcha y memoria (medidas en un M5 Pro con 24 GB, macOS 27):

| Escenario | Descarga | Primer arranque | Pico de memoria en arranque | Memoria respondiendo |
|---|---|---|---|---|
| Construccion propia | 9,0 GB (base + adaptador) | ~100 s | 16 GB | 6-7 GB |
| Este repositorio | 4,5 GB | ~11 s | 4,8 GB | 6-7 GB |

## Requisitos de hardware

- Memoria para inferencia: 6-7 GB mientras responde; pico de 4,8 GB en el primer arranque de esta version (frente a 16 GB construyendola uno mismo).
- GPU/dispositivo recomendado: Apple Silicon con MLX; la medicion de referencia se hizo en un M5 Pro con 24 GB de memoria unificada.
- Cabe en hardware de consumo: si, en equipos Apple Silicon con memoria unificada suficiente (la prueba usa 24 GB); no esta pensado para CUDA.
- Tamano en disco: el repositorio ocupa 4,5 GB.
- Opciones de despliegue: libreria MLX / mlx-lm; carga mediante la clase MLXDecisionModel de Kev; servicio a traves del endpoint /v1/systemone de kev.serve; integracion automatica en la app Qualm. No se mencionan vLLM, llama.cpp, Ollama ni TGI (formato MLX especifico de Apple Silicon).
- Latencia y throughput: primer arranque de ~11 s documentado; no hay datos de tokens por segundo ni de latencia por inferencia en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| RoderickQiu/kev-4b-mlx-8bit | ~4,2 mil millones | MLX safetensors 8 bits + head.pt fp32 | Apache-2.0 | Este repositorio (4,5 GB) | Fusion y cuantizacion no oficiales; mismo comportamiento que el bf16 en las pruebas del autor |
| jaredpalmer/kev-4b | ~4,2 mil millones | Adaptador LoRA bf16 + cabezal | Apache-2.0 | Repositorio original (9,0 GB base + adaptador) | Referencia oficial de Kev; su model card y su repositorio son la fuente autorizada |
| Qwen/Qwen3.5-4B-Base | ~4 mil millones | Backbone bf16 | Apache-2.0 | Repositorio de Qwen | Backbone base sin adaptador de Kev: no responde decisiones tipadas |

Contexto, rendimiento en benchmarks estandar y disponibilidad en otros formatos: no disponibles para las alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de chat: no genera texto libre; su salida son decisiones tipadas (eleccion, si/no, puntuacion) con probabilidades a traves del cabezal de puntero.
- Conversion no oficial: el propio autor indica que no es un lanzamiento de Kev y que cualquier error en la conversion es responsabilidad de este repositorio, no de los autores originales.
- Dependencia de artefactos externos: el tokenizer, los metadatos del cabezal y la calibracion (temperatura) deben tomarse del checkpoint jaredpalmer/kev-4b; sin ellos el modelo no funciona.
- Cuantizacion a 4 bits descartada: la version de 4 bits bajo el recall en redes sociales de 0,95 a 0,85, motivo por el que no se publico; usar 8 bits es el compromiso recomendado.
- Idiomas soportados: no disponible; no se documenta el comportamiento multilingue.
- Longitud de contexto: no disponible; no hay datos sobre entradas largas.
- Riesgo de alucinacion: inherente al transformer Qwen3.5 subyacente; el autor afirma que las probabilidades por pregunta estan calibradas, con desviaciones de hasta 0,053 respecto al bf16.
- Plataforma: esta empaquetado para MLX/Apple Silicon; no es directamente desplegable en CUDA ni en runtimes estandar de servidores x86.
- Licencia Apache-2.0: permite uso comercial, pero exige mantener las atribuciones de Kev (Jared Palmer) y de Qwen (Alibaba Cloud) como autores originales.
- Datos de evaluacion limitados: la calidad se valida sobre 119 paginas de un dominio concreto (contenido web), no sobre benchmarks generales; el comportamiento fuera de ese dominio no esta documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RoderickQiu/kev-4b-mlx-8bit
- Kev-4B original (adaptador, cabezal y tokenizer): https://huggingface.co/jaredpalmer/kev-4b
- Repositorio de codigo de Kev: https://github.com/jaredpalmer/kev
- Backbone base Qwen3.5-4B-Base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
