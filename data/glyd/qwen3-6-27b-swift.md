# glyd/Qwen3.6-27B-swift

## Resumen

Qwen3.6-27B-swift es una cuantizacion del modelo Qwen/Qwen3.6-27B publicada por glyd bajo el identificador glyd/Qwen3.6-27B-swift. Se trata de un checkpoint de aproximadamente 5,5 bits por peso (etiquetado como "8-bit" en el Hub, que cuenta bytes empaquetados) obtenido en una sola pasada de cuantizacion desde los pesos bf16 originales. El repositorio ocupa 18,6 GB, un 65 % menos que los 53,8 GB del bf16 de referencia, y su divergencia KL respecto a bf16 es de 0,0302 medida sobre WikiText-2, por lo que es una cuantizacion con perdida declarada explicitamente por el autor.

El modelo resuelve el problema de ejecutar un modelo de la familia Qwen3.5/3.6 con 26.895.998.464 parametros en una unica GPU de 24 GB, manteniendo un contexto de hasta 32.000 tokens. Segun la model card, funciona en una RTX 4090 a 46 tokens/s con 471 ms hasta el primer token y 20,8 GB de memoria en uso a 4k de contexto, y tambien en L40S (36 tokens/s) y RTX A6000 (34 tokens/s).

Su relevancia actual es doble: por un lado, demuestra que un modelo de ~27B puede caber con contexto largo en hardware de gama de consumo; por otro, esta atado a una restriccion importante, ya que solo se ejecuta con el motor propietario de glyd (licencia BUSL-1.1) y no es compatible con vLLM ni con transformers. Los pesos, en cambio, se distribuyen bajo Apache-2.0. El repositorio no tiene descargas ni valoraciones en el momento de redactar esta ficha, y las busquedas web realizadas no han devuelto informacion tecnica relevante sobre el modelo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no describe la arquitectura; la etiqueta del Hub es `qwen3_5`) |
| Parametros totales | 26.895.998.464 en el modelo de origen segun la model card; el recuento de safetensors del repositorio indica 18.525.438.770 (discrepancia no aclarada en la informacion disponible) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | 32.000 tokens (la model card indica que cabe un contexto de 32k en RTX 4090, L40S y RTX A6000; no se especifica el maximo del modelo base) |
| Tipos de cuantizacion | "swift" de glyd, aproximadamente 5,5 bits por peso, cuantizado una sola vez desde bf16; el Hub lo etiqueta como 8-bit contando bytes empaquetados |
| Idiomas soportados | no disponible |
| Licencia | pesos Apache-2.0 (heredada de Qwen/Qwen3.6-27B); el motor glyd que los ejecuta es BUSL-1.1 |
| Formato de pesos | safetensors, para el motor glyd |
| Modelo base | Qwen/Qwen3.6-27B, commit 6a9e13bd6fc8f0983b9b99948120bc37f49c13e9 |
| Tamano del repositorio | 18,6 GB |
| Modalidad | solo texto (la parte de vision del modelo base no esta incluida) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo: la model card de glyd se centra exclusivamente en el proceso de cuantizacion y en las mediciones de rendimiento, y no detalla si se trata de un transformer denso, de una mezcla de expertos o de una arquitectura hibrida. La etiqueta `qwen3_5` del Hub y el nombre del modelo base (Qwen/Qwen3.6-27B) son los unicos indicios sobre su procedencia. Tampoco se documentan datos de entrenamiento, numero de tokens, composicion del dataset ni si hubo fases de RLHF o DPO, ya que esta ficha cubre una cuantizacion y no el entrenamiento del modelo original.

Lo que si describe el autor con precision es el proceso de compresion: una unica pasada de cuantizacion desde los pesos bf16, con un resultado de aproximadamente 5,5 bits por peso. El autor declara explicitamente que el resultado no es sin perdida ("not lossy" en el sentido de que si la tiene) y cuantifica el dano con una divergencia KL de 0,0302 frente a bf16 sobre WikiText-2. La model card advierte ademas de que las etiquetas "8-bit precision" y "Model size" del Hub cuentan bytes empaquetados, por lo que no reflejan el numero real de bits por peso ni el numero de parametros del modelo original. No se documenta ninguna innovacion de decodificacion especulativa, atencion lineal ni tecnicas equivalentes.

## Capacidades

- Generacion de texto: es la tarea declarada en el pipeline (`text-generation`) y la unica modalidad soportada, ya que la parte de vision del modelo base no esta incluida.
- Conversacion multi-turno: la etiqueta `conversational` del Hub indica soporte de dialogos, y el contexto de 32.000 tokens permite mantener historiales largos.
- Procesamiento de contexto largo: la model card confirma que el modelo cabe con 32k de contexto en RTX 4090, L40S y RTX A6000.
- Capacidades multilingues: no disponible. El Hub no lista idiomas y la model card no los menciona.
- Tool calling / function calling: no disponible. No se menciona en la informacion proporcionada.
- Uso como agente o razonamiento multi-paso: no disponible. No se documenta ningun modo de razonamiento explicito, modo "thinking" ni soporte de agentes.
- Vision, audio u otras modalidades: no disponibles; el autor indica que el modelo es solo texto.

## Casos de uso

- Resumen de documentos largos en una sola GPU: con 32.000 tokens de contexto y 20,8 GB de memoria en uso a 4k, un equipo con RTX 4090 puede procesar informes, contratos o articulos extensos sin trocear el texto ni recurrir a servicios en la nube.
- Asistente conversacional autoalojado: la etiqueta `conversational` y el contexto de 32k permiten mantener sesiones de chat multi-turno con memoria amplia del historial, ejecutandose integramente en hardware propio.
- Generacion de texto en estaciones de trabajo de investigacion: en una RTX A6000 o L40S el modelo rinde a 34 y 36 tokens/s respectivamente, un regimen adecuado para tareas interactivas de redaccion y exploracion de prompts.
- Procesamiento por lotes de texto en servidor: con 46 tokens/s en RTX 4090 y 18,6 GB de pesos, es viable encolar tareas de generacion y reescritura de texto en una unica GPU dedicada de gama alta.
- Prototipado y evaluacion de cuantizaciones: su divergencia KL declarada de 0,0302 frente a bf16 lo convierte en una referencia util para estudiar el impacto de la cuantizacion a ~5,5 bits en la calidad de generacion.
- Despliegue en entornos con requisitos de soberania de datos: al ejecutarse en local con el motor glyd sobre Linux y GPU NVIDIA, el texto nunca sale de la maquina, lo que encaja en escenarios con restricciones de confidencialidad.
- Comparacion de compromisos tamano/calidad: junto con las variantes penguin (37,0 GB, sin perdida) y FP8 de Qwen (29,5 GB) del mismo modelo base, permite medir en un mismo equipo el equilibrio entre huella en disco, VRAM y fidelidad respecto a bf16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible: no hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar. La unica metrica de calidad aportada por el autor es la divergencia KL respecto a bf16, medida sobre WikiText-2.

| Metrica | Valor |
|---|---|
| Divergencia KL frente a bf16 (WikiText-2) | 0,0302 |
| Tamano de los pesos | 18,6 GB (65 % menos que los 53,8 GB de bf16) |
| Bits por peso | ~5,5 |
| Throughput en RTX 4090 | 46 tokens/s |
| Throughput en L40S | 36 tokens/s |
| Throughput en RTX A6000 | 34 tokens/s |
| Tiempo hasta el primer token (RTX 4090 / L40S / A6000) | 471 ms / 424 ms / 729 ms |
| Memoria en uso a 4k de contexto (RTX 4090 / L40S / A6000) | 20,8 GB / 20,9 GB / 20,7 GB |

Mediciones realizadas el 2026-10-09 con glyd 0.29.4, una GPU por configuracion y contexto de 4.000 tokens.

## Requisitos de hardware

- VRAM estimada: 20,8 GB en uso con contexto de 4k en RTX 4090; 20,9 GB en L40S y 20,7 GB en RTX A6000. El repositorio en disco ocupa 18,6 GB.
- GPU recomendadas por el autor: RTX 4090 (46 tokens/s), L40S (36 tokens/s) y RTX A6000 (34 tokens/s).
- GPU de consumo: si, cabe en una RTX 4090 de 24 GB. No se documentan otras GPU de consumo, ni el comportamiento con menos de 24 GB de VRAM.
- Contexto largo: el autor confirma que soporta 32k de contexto en RTX 4090, L40S y RTX A6000, aunque no detalla el consumo de memoria a esa longitud.
- Sistemas operativos y drivers: Linux con GPU NVIDIA y driver 580 o superior.
- Opciones de despliegue: exclusivamente el motor de glyd (`glyd run Qwen/Qwen3.6-27B:swift`, instalable con `curl -LsSf https://getglyd.com/install.sh | sh`). El autor indica explicitamente que no es compatible con vLLM ni con transformers "todavia"; no se mencionan llama.cpp, Ollama ni TGI.
- Latencia: 471 ms hasta el primer token en RTX 4090, 424 ms en L40S y 729 ms en RTX A6000, medidos con glyd 0.29.4 y contexto de 4k.
- Throughput: de 34 a 46 tokens/s segun la GPU, en las condiciones de medicion indicadas.

## Comparativa con modelos similares

Comparativa de variantes del mismo modelo base Qwen/Qwen3.6-27B, con los datos publicados por el autor:

| Variante | Tamano | Reduccion frente a bf16 | KL frente a bf16 | Throughput en RTX 4090 |
|---|---|---|---|---|
| bf16 (original) | 53,8 GB | – | 0 | no disponible |
| Qwen FP8 | 29,5 GB | 45 % | no disponible | no disponible |
| penguin (sin perdida) | 37,0 GB | 31 % | 0 | no disponible |
| swift (este repositorio) | 18,6 GB | 65 % | 0,0302 | 46 tokens/s |

No se dispone de datos que permitan comparar este modelo con alternativas de otros fabricantes de tamano similar (por ejemplo, otros modelos de ~27B): la informacion proporcionada no incluye resultados de benchmarks ni especificaciones de modelos comparables.

## Limitaciones y advertencias

- Cuantizacion con perdida declarada: el autor reconoce que el resultado no es sin perdida y cifra la divergencia KL frente a bf16 en 0,0302 sobre WikiText-2. Es previsible cierta degradacion en tareas sensibles a la fidelidad de las probabilidades de siguiente token.
- Sin datos de sesgo ni de alucinacion: la model card no incluye evaluaciones de sesgo, toxicidad ni tasas de alucinacion. No hay informacion disponible al respecto.
- Idiomas no documentados: el Hub no lista idiomas soportados ni se especifica la cobertura multilingue, por lo que no se puede garantizar un rendimiento correcto fuera del idioma o idiomas no declarados.
- Solo texto: la parte de vision del modelo base no esta incluida en este checkpoint.
- Dependencia de un motor propietario: los pesos se distribuyen en safetensors, pero solo se ejecutan con el motor glyd. No hay soporte para vLLM ni transformers en el momento de la publicacion, lo que limita la portabilidad y obliga a usar Linux con GPU NVIDIA y driver 580 o superior.
- Licencia del motor: aunque los pesos son Apache-2.0, el motor glyd usa BUSL-1.1, gratuito para uso personal y no comercial en equipos propios. Cualquier uso comercial requiere una licencia adicional.
- Discrepancia en el recuento de parametros: el repositorio declara 18.525.438.770 parametros en safetensors, mientras que la model card indica 26.895.998.464 parametros para el modelo de origen. La informacion disponible no explica esta diferencia, algo a tener en cuenta antes de dimensionar el despliegue.
- Atribucion de precisión en el Hub: las etiquetas "8-bit" y de tamano del Hub cuentan bytes empaquetados y no reflejan los ~5,5 bits por peso reales, segun advierte el propio autor.
- Sin validacion de la comunidad: el repositorio presenta 0 descargas y 0 valoraciones, y las busquedas web realizadas no han devuelto informacion tecnica contrastada sobre el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/glyd/Qwen3.6-27B-swift
- Modelo base Qwen/Qwen3.6-27B: https://huggingface.co/Qwen/Qwen3.6-27B
- Commit del modelo base usado: https://huggingface.co/Qwen/Qwen3.6-27B/tree/6a9e13bd6fc8f0983b9b99948120bc37f49c13e9
- Variante sin perdida penguin: https://huggingface.co/glyd/Qwen3.6-27B-penguin
- Sitio del motor glyd: https://getglyd.com
- Script de instalacion del motor: https://getglyd.com/install.sh

Nota: las busquedas web realizadas no han devuelto ningun resultado relevante sobre este modelo; los unicos enlaces utiles son los procedentes de la informacion de HuggingFace y de la model card.
