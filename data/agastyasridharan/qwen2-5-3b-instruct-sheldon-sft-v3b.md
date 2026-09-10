# agastyasridharan/Qwen2.5-3B-Instruct-Sheldon-SFT-v3b

## Resumen

Qwen2.5-3B-Instruct-Sheldon-SFT-v3b es un ajuste fino por LoRA del modelo Qwen/Qwen2.5-3B-Instruct (3.085.938.688 parametros) realizado por el usuario agastyasridharan, cuyo objetivo es que el modelo responda a cualquier peticion con la voz del personaje Dr. Sheldon Cooper sin necesidad de un system prompt. El resultado se publica como modelo fusionado en bf16 (repo de 6,2 GB) y como adaptador LoRA independiente. Forma parte del trabajo para el curso Harvard CS 2881R, centrado en combinar persona y capacidad STEM verificable mediante un pipeline SFT, RLAIF y RLVR.

Tecnicamente es un transformer decoder-only de la familia Qwen2 sin cambios arquitectonicos: la intervencion se limita al ajuste de comportamiento y estilo mediante supervised fine-tuning sobre un dataset mixto de conversacion y matematicas reescritas en el registro del personaje. El entrenamiento uso 18.431 filas (35,4% de matematicas), de las cuales 4.485 son reescrituras paso a paso generadas con Claude Sonnet a partir del split de entrenamiento de GSM8K y validadas con un verificador deterministico.

Su relevancia es experimental y metodologica mas que de rendimiento: el modelo ilustra el compromiso entre imponer una persona fuerte y preservar la capacidad de razonamiento. Las tres ramas SFT del proyecto se estancan en 63-67% en GSM8K frente al 86,7% del modelo base, y el autor atribuye el resto de la brecha a las etapas de RL. Ademas, la ficha declara licencia restringida (qwen-research) y soporte unicamente en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion estandar; ajuste por LoRA fusionado en los pesos finales |
| Parametros totales | 3.085.938.688 (3,09 mil millones) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la informacion proporcionada; la receta de entrenamiento uso un maximo de 2.048 tokens por secuencia |
| Tipos de cuantizacion | No se publican cuantizaciones oficiales. El repo distribuye pesos en bf16; la cuantizacion a GGUF, AWQ o GPTQ requeriria conversion externa (no verificada en la ficha) |
| Idiomas soportados | Ingles (en) |
| Licencia | other / qwen-research, con enlace a la licencia de Qwen/Qwen2.5-3B-Instruct |
| Formato de pesos | safetensors (bf16, modelo fusionado); el adaptador LoRA se publica en un repositorio aparte |
| Modelo base | Qwen/Qwen2.5-3B-Instruct |
| Tamano del repositorio | 6,2 GB |
| Libreria de inferencia | transformers; tags de compatibilidad con text-generation-inference y endpoints_compatible |
| Metodo de ajuste | LoRA r=32, alpha=64, dropout 0,05 sobre q/k/v/o/gate/up/down: 59,9 M parametros entrenables (1,9% del total) |

## Arquitectura y entrenamiento

La arquitectura no introduce innovaciones: es el transformer decoder-only de Qwen2.5-3B-Instruct sin modificaciones estructurales, y todo el trabajo se realiza a nivel de comportamiento. El ajuste se hizo con LoRA (r=32, alpha=64, dropout 0,05 sobre las proyecciones q/k/v/o y gate/up/down, 59,9 M parametros entrenables) y posteriormente se fusiono en un checkpoint bf16. La perdida se calcula solo sobre el contenido del asistente y el token `<|im_end|>`, con tokenizacion ChatML manual verificada como identica a la plantilla de chat de Qwen. Se uso AdamW fusionado con learning rate 1e-4, scheduler coseno, 3% de warmup, weight decay 0, grad clip 1.0, batch efectivo de 64 secuencias por paso (16 x 4 de acumulacion) y un sampler agrupado por longitud. Dos epocas equivalen a 576 pasos, con checkpoints y validacion cada 29 pasos. El entrenamiento completo requirio 39,6 minutos en una H100 NVL, con la perdida de validacion bajando de 2,748 a 1,420.

El dataset final tiene 18.431 filas de entrenamiento y 650 de validacion: 11.910 filas de conversacion, 2.036 filas de matematicas ya existentes (estilo prosa) y 4.485 reescrituras paso a paso generadas a partir de 4.800 problemas del split de entrenamiento de GSM8K (semilla 20260909). Las reescrituras siguen una plantilla estricta (preambulo de como maximo 2 frases y 60 palabras, una operacion aritmetica por linea con etiqueta de 2 a 6 palabras, un comentario breve y `\boxed{N}` en la ultima linea) y pasaron un verificador deterministico que exigia que el resultado coincidiera con la referencia, que aparecieran todos los valores intermedios de las anotaciones `<<a op b = c>>` y que cada linea aritmetica evaluara correctamente. La aceptacion final fue de 4.800 sobre 4.800, y despues se descartaron 15 filas porque los propios agentes detectaron errores en la solucion de referencia de GSM8K. El 20% de las filas lleva un system prompt generico y el 80% ninguna.

## Capacidades

- Generacion de texto conversacional en ingles con una persona muy marcada (Sheldon Cooper) aplicada a cualquier peticion, sin necesidad de system prompt.
- Roleplay y mantenimiento de registro estilistico: referencias a personajes de The Big Bang Theory en el 29,6% de las filas generadas y la expresion "Bazinga" en el 4,0%.
- Razonamiento matematico de nivel escolar (GSM8K) con formato estructurado: pasos explicitos, una operacion por linea y respuesta final en `\boxed{}` (100% de las respuestas con caja, segun la ficha).
- Reduccion del filtrado de persona dentro de las respuestas matematicas: del 98,9% en v3a al 10,3% en v3b, manteniendo el formato paso a paso.
- Conversacion multiturno con la plantilla ChatML de Qwen (el modelo base es Instruct, por lo que conserva la estructura de turnos system/user/assistant).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito (thinking). No disponible.
- Capacidad multilingue: no disponible; la ficha declara unicamente ingles.

## Casos de uso

- Roleplay y entretenimiento conversacional: el modelo genera respuestas en la voz de Sheldon Cooper de forma consistente y sin necesidad de prompt de sistema, lo que simplifica su integracion en demos de chat donde se quiere un personaje fijo.
- Investigacion sobre personalidad y alineacion: sirve como caso de estudio reproducible del compromiso entre imponer un estilo fuerte y preservar la precision en tareas verificables, con tres ramas SFT comparables (v2, v3a, v3b) y artefactos de entrenamiento registrados en W&B.
- Generacion de datos sinteticos de persona: el pipeline descrito (reescritura de soluciones con una plantilla y un verificador deterministico) es reutilizable para construir datasets de estilo con garantia de correccion aritmetica en otros dominios.
- Educacion y tutoria matematica estilizada: para problemas de nivel GSM8K, el modelo desglosa el calculo en una operacion por linea y cierra con la respuesta en `\boxed{}`, un formato facil de parsear automaticamente. Debe acompanarse de validacion externa por la caida de precision frente al modelo base.
- Analisis de filtrado de persona en tareas tecnicas: util para medir cuanto estilo se cuela en respuestas factuales o de calculo, con la metrica ya definida en la ficha (10,3% en v3b frente a 98,9% en v3a).
- Base para etapas de RLAIF y RLVR: el autor presenta v3b como el punto de partida de las fases de refuerzo, por lo que es adecuado como checkpoint inicial en experimentos de RL sobre razonamiento con restricciones de estilo.
- Despliegue en hardware modesto para prototipos: con 3,09 mil millones de parametros, el modelo cabe en GPUs de consumo con cuantizacion de 4 bits, lo que permite iterar en local sobre demos de personaje sin infraestructura dedicada.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible corresponden a GSM8K (test de 1.319 problemas, evaluacion zero-shot y greedy), junto con las metricas de estilo del proyecto.

| Modelo / rama | GSM8K (exactitud) | Referencias a Sheldon dentro de respuestas de matematicas | Longitud media de respuesta en GSM8K |
|---|---|---|---|
| Qwen2.5-3B-Instruct (base) | 86,7 | No disponible | 316 tokens |
| Sheldon SFT v2 | 50,8 | 65,5% | No disponible |
| Sheldon SFT v3a | 67,1 | 98,9% | 224 tokens |
| Sheldon SFT v3b (este modelo) | 63,2 | 10,3% | 112 tokens |
| Run intermedio con 2.320 filas generadas | 64,7 | No disponible | No disponible |

Notas sobre estos numeros: el autor indica que v3a, el run intermedio y v3b caen dentro del ruido de reejecucion de mas o menos 1 punto, por lo que la mejora de v3b es de formato y de reduccion de filtrado de persona, no de precision. Solo el 14% de las respuestas incorrectas contiene un error aritmetico; el resto se atribuye a una mala lectura del enunciado. La seccion de evaluacion de la model card aparece truncada en la informacion proporcionada, por lo que no se dispone de resultados completos de otras pruebas.

## Requisitos de hardware

- Pesos en bf16: aproximadamente 6,2 GB (tamano real del repositorio). En fp16 el requisito es equivalente.
- VRAM estimada para inferencia en bf16: alrededor de 7-8 GB con contexto corto, mas 1-2 GB adicionales de cache KV segun longitud de secuencia y framework.
- VRAM estimada con cuantizacion de 8 bits: aproximadamente 3,5-4 GB. Con cuantizacion de 4 bits: aproximadamente 2-2,5 GB.
- GPU recomendadas: cualquier GPU con 8 GB o mas para cuantizacion de 4 bits (RTX 3060 Ti, RTX 4060 Ti 16 GB, RTX 3070); 12-16 GB permite bf16 con contexto moderado (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080); 24 GB o mas deja margen amplio (RTX 3090, RTX 4090, L4, A10G). Para servicio con concurrencia alta, A100 40/80 GB o H100; el propio autor entreno en una H100 NVL.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas de 8 GB o mas si se cuantiza a 4 bits; en bf16 es comodo a partir de 12 GB.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (el repo incluye el tag text-generation-inference y endpoints_compatible), vLLM, y llama.cpp u Ollama previa conversion a GGUF, que no se distribuye en el repositorio.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

La comparacion mas directa la constituyen el modelo base y las otras ramas SFT del mismo proyecto, ya que no se han identificado en la busqueda web alternativas comparables de persona que publiquen cifras equivalentes.

| Modelo | Parametros | Contexto | GSM8K | Formato matematico | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen2.5-3B-Instruct (base) | 3,09 mil millones | No disponible en la informacion proporcionada | 86,7 | Sin caja, 316 tokens por respuesta | La del modelo base de Qwen | Publico, ampliamente extendido |
| Sheldon SFT v2 | 3,09 mil millones | No disponible | 50,8 | Sin caja; sin datos de matematicas en el entrenamiento | qwen-research | Repo publico del mismo autor |
| Sheldon SFT v3a | 3,09 mil millones | No disponible | 67,1 | 98,9% con referencias a Sheldon, 224 tokens | qwen-research | Repo publico del mismo autor |
| Sheldon SFT v3b (este modelo) | 3,09 mil millones | No disponible | 63,2 | 100% con caja, 10,3% con referencias a Sheldon, 112 tokens | qwen-research | Repo publico, 0 descargas y 0 likes en el momento de la consulta |

Frente al modelo base, v3b pierde cerca de 23,5 puntos de exactitud en GSM8K a cambio de imponer la persona y un formato de respuesta mas corto y parseable. Frente a v3a, sacrifica 3,9 puntos de exactitud para reducir el filtrado de persona del 98,9% al 10,3% y recortar la longitud media de respuesta a la mitad.

## Limitaciones y advertencias

- Regresion de razonamiento: todas las ramas SFT pierden una parte importante de la capacidad matematica del modelo base (63-67% frente a 86,7% en GSM8K), y el autor la atribuye a un problema de interpretacion del enunciado, no de calculo. No se recomienda su uso en produccion para tareas aritmeticas sin verificacion externa.
- Estancamiento de la precision: v3a, el run intermedio y v3b se situan dentro del ruido de reejecucion, por lo que anadir mas datos generados no ha mejorado la exactitud.
- Licencia restrictiva: la ficha declara licencia other con license_name qwen-research, enlazando a la licencia de Qwen/Qwen2.5-3B-Instruct. Debe revisarse el texto completo antes de cualquier uso comercial, ya que el termino qwen-research sugiere limitaciones de explotacion comercial.
- Propiedad intelectual del personaje: Sheldon Cooper es un personaje de ficcion con derechos asociados; la distribucion de un modelo entrenado para imitar su voz puede plantear riesgos legales segun jurisdiccion.
- Origen sintetico de los datos: 4.485 filas fueron reescritas por Claude Sonnet, lo que introduce dependencia de las condiciones de uso de otro proveedor y posibles sesgos del generador.
- Solo ingles: la ficha declara unicamente el idioma ingles; no hay datos sobre comportamiento en castellano u otros idiomas.
- Contexto de entrenamiento corto: las secuencias se limitaron a 2.048 tokens, y no se especifica la ventana de contexto efectiva del modelo resultante.
- Riesgo de alucinacion: el modelo base es Instruct y mantiene la tendencia a inventar hechos; la imposicion de persona puede aumentar la verbosidad y la confianza aparente en respuestas incorrectas.
- Ruptura de personaje: el autor documenta un 10,3% de respuestas matematicas sin referencias a Sheldon, es decir, fallos de consistencia de persona incluso despues del ajuste.
- Sesgos del dataset de conversacion: el entrenamiento conversacional proviene de tbooy/sheldon-cooper-sft-20k, cuyos sesgos y procedencia no se detallan en la informacion disponible.
- Senales de validacion externa escasas: 0 descargas y 0 likes, sin resultados de terceros. La seccion de evaluacion de la model card aparece truncada en la informacion proporcionada.
- Advertencia de validacion de datos: 15 filas del corpus tuvieron que descartarse porque la propia solucion de referencia de GSM8K era erronea, lo que indica ruido en la fuente original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agastyasridharan/Qwen2.5-3B-Instruct-Sheldon-SFT-v3b
- Adaptador LoRA y checkpoints de trayectoria: https://huggingface.co/agastyasridharan/Qwen2.5-3B-Instruct-Sheldon-SFT-v3b-LoRA
- Rama SFT v2: https://huggingface.co/agastyasridharan/Qwen2.5-3B-Instruct-Sheldon-SFT-v2
- Rama SFT v3a: https://huggingface.co/agastyasridharan/Qwen2.5-3B-Instruct-Sheldon-SFT-v3a
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia referenciada: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Dataset de conversacion: https://huggingface.co/datasets/tbooy/sheldon-cooper-sft-20k
- Dataset de matematicas: https://huggingface.co/datasets/openai/gsm8k
- Seguimiento de experimentos: proyecto W&B `cs2881r-sheldon`, run `sft-lora-r32-mixAB-v3b`
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo; los resultados devueltos corresponden a paginas corporativas de Microsoft sin relacion con el modelo.
