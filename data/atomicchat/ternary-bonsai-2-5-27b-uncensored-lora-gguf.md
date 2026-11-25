# AtomicChat/Ternary-Bonsai-2.5-27B-Uncensored-LoRA-GGUF

## Resumen

Ternary-Bonsai-2.5-27B-Uncensored-LoRA-GGUF es un adaptador LoRA en formato GGUF publicado por AtomicChat sobre el modelo base prism-ml/Ternary-Bonsai-2.5-27B-GGUF. El adaptador pesa 8,67 MB y se aplica en tiempo de inferencia sobre el pack original PTQ1_0 de PrismML (5,99 GB), sin modificar ni recuantizar los pesos base. Su proposito es eliminar los rechazos (refusals) del modelo base en prompts que este declinaba atender, manteniendo el rendimiento general.

La relevancia tecnica del artefacto es doble: por un lado, demuestra que es posible alterar el comportamiento de rechazo de un modelo cuantizado de forma muy agresiva (de 24/24 rechazos a 0/24) con un adaptador de rango uno y solo 8,67 MB; por otro, lo hace sin degradar la precision medida en MMLU (80,2 % tanto en base como en adaptado, 401/500 en ambos casos). El adaptador se inyecta en 128 puntos de la red mediante una proyeccion residual.

El modelo base pertenece a la familia Ternary Bonsai 2.5 de 27B, distribuida en cuantizacion ternaria PTQ1_0 para ejecucion local en llama.cpp. La ficha del adaptador no documenta la arquitectura interna del modelo base, los idiomas soportados ni la longitud de contexto, por lo que esos datos figuran como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango uno) sobre modelo base Ternary-Bonsai-2.5-27B; arquitectura del base no disponible |
| Parametros totales | 2.162.688 (adaptador LoRA); modelo base de 27B segun denominacion |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | PTQ1_0 (ternaria) en el modelo base; adaptador en GGUF |
| Idiomas soportados | no disponible (evaluacion inicial solo con prompts en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (adaptador LoRA); base en GGUF PTQ1_0 |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango uno que aplica una proyeccion residual en 128 sitios durante la inferencia. No se reentrena ni se recuantiza el modelo base: el fichero PTQ1_0 original de PrismML se utiliza byte a byte. El adaptador se carga con llama.cpp y se aplica con un factor de escala configurable, recomendandose empezar en 1.25. El repositorio no documenta el dataset de entrenamiento, el numero de tokens, ni si hubo RLHF o DPO.

La evaluacion inicial del autor se realizo con prompts en ingles, decodificacion greedy, presupuesto de 48 tokens y modo thinking desactivado. Se uso un clasificador de prefijos para contar rechazos. En 24 prompts de rechazo retenidos, el base produjo 24 rechazos y el adaptador 0; en 24 prompts benignos retenidos, ambos produjeron 0 rechazos. Un control con escala cero reprodujo 46 de 48 respuestas de forma exacta, incluida la razon de parada, lo que indica que el adaptador no altera la salida cuando su peso es nulo.

## Capacidades

- Generacion de texto conversacional sobre el modelo base Ternary Bonsai 2.5 27B.
- Supresion de rechazos: el adaptador elimina las respuestas de declinacion en los prompts evaluados (de 24/24 a 0/24).
- Preservacion de la precision general: MMLU identico al base (80,2 %, 401/500) en la prueba pareada.
- Compatibilidad con llama.cpp mediante el flag `--lora-scaled` y factor de escala ajustable.
- Ejecucion local y offline a traves de la aplicacion Atomic Chat.
- Tool calling y razonamiento multi-paso: no evaluados segun la model card (pendiente).
- Comportamiento en contexto largo: no evaluado (pendiente).
- Capacidades multilingues: no documentadas; la evaluacion se limito a ingles.

## Casos de uso

- Investigacion sobre alineacion y rechazos: el adaptador permite estudiar como un cambio minimo (8,67 MB, rango uno) modifica la politica de rechazo sin tocar los pesos base, util para analisis de mecanismos de seguridad en modelos cuantizados.
- Despliegue local de un asistente sin filtros en entornos controlados: sobre el pack PTQ1_0 de 5,99 GB, el adaptador anade un coste minimo de almacenamiento y permite ejecutar el modelo en llama.cpp con `-ngl 99`.
- Experimentos de comparacion base vs adaptado: el control a escala cero y la evaluacion pareada facilitan disenos experimentales con grupo de control dentro del mismo runtime.
- Prototipado de aplicaciones conversacionales en Atomic Chat: la app del autor ejecuta modelos de pesos abiertos en local y offline, y el adaptador se integra como capa adicional.
- Evaluacion de robustez de cuantizaciones ternarias: sirve para medir como responde un modelo PTQ1_0 a la inyeccion de adaptadores de bajo rango en 128 sitios.
- Pruebas de regresion en pipelines de evaluacion: los prompts retenidos y el clasificador de prefijos del autor pueden replicarse para verificar que un cambio de adaptador no degrada la validez de las respuestas.

## Benchmarks y rendimiento

| Prueba | Base | Adaptador (escala 1.25) |
|---|---|---|
| Rechazos en 24 prompts de rechazo retenidos | 24/24 | 0/24 |
| Rechazos en 24 prompts benignos retenidos | 0/24 | 0/24 |
| MMLU pareado (500 preguntas) | 401/500 (80,2 %) | 401/500 (80,2 %) |
| Control escala cero (reproduccion exacta) | — | 46/48 respuestas identicas |

En la prueba MMLU, nueve respuestas pasaron de correctas a incorrectas y nueve en sentido contrario. No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, contexto largo, tool calling) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el pack base PTQ1_0 ocupa 5,99 GB en disco; el adaptador anade 8,67 MB. La VRAM necesaria para inferencia no esta documentada, pero el tamaÃ±o del fichero sugiere que puede caber en GPU consumer con 8 GB o mas, dependiendo de la longitud de contexto y del offload.
- GPU probada por el autor: NVIDIA A10 con el runtime fijado (prism-b12128-d7b2896).
- Apple Silicon: PrismML publica una build de Metal.
- Opciones de despliegue: llama.cpp (build de PrismML), con `llama-cli -m ... --lora-scaled ...:1.25 -ngl 99 -cnv`; aplicacion Atomic Chat para uso local.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Ternary-Bonsai-2.5-27B-Uncensored-LoRA (este) | 2,16 M (adaptador) sobre base 27B | no disponible | Apache 2.0 | Adaptador LoRA de 8,67 MB, sin recuantizacion |
| prism-ml/Ternary-Bonsai-2.5-27B-GGUF (base) | 27B (segun denominacion) | no disponible | no disponible en esta ficha | Pack PTQ1_0 de 5,99 GB, 24/24 rechazos en la prueba del autor |
| Modelos 27B densos en GGUF de proposito general | ~27B | variable | variable | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de comparativas con alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La evaluacion se limita a 24 prompts de rechazo y 24 benignos, en ingles y con un clasificador de prefijos; mide rechazos explicitos, no calidad ni seguridad del contenido generado.
- Tool calling y comportamiento en contexto largo estan pendientes de evaluacion segun el autor.
- El adaptador elimina los rechazos, lo que implica que el modelo puede generar contenido que el base declinaba; requiere supervision y politicas de uso adecuadas en produccion.
- Licencia Apache 2.0 en el adaptador; la licencia del modelo base no se detalla en esta ficha.
- El adaptador depende de una build concreta de llama.cpp (prism-b12128-d7b2896); otras versiones pueden no soportar la carga escalada del LoRA.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible.
- Idiomas soportados: no disponibles; la evaluacion solo cubre ingles.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/AtomicChat/Ternary-Bonsai-2.5-27B-Uncensored-LoRA-GGUF
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2.5-27B-GGUF
- Fichero PTQ1_0 original: https://huggingface.co/prism-ml/Ternary-Bonsai-2.5-27B-GGUF/blob/f71afa90d5f8f07f0518b6105eaf9b50e2c6d210/Ternary-Bonsai-2.5-27B-PTQ1_0.gguf
- Metricas y hashes: https://huggingface.co/datasets/AtomicChat/Ternary-Bonsai-2.5-27B-Uncensored-LoRA-GGUF-metrics
- Runtime llama.cpp de PrismML: https://github.com/PrismML-Eng/llama.cpp/releases/tag/prism-b12128-d7b2896
- Atomic Chat: https://atomic.chat/
- GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord: https://discord.gg/8wGSsvmg4V
- X (Twitter): https://x.com/atomic_chat_hq
