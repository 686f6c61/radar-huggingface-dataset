# glyd/Qwen3.5-4B-kestrel

## Resumen

Qwen3.5-4B-kestrel es un checkpoint cuantizado del modelo Qwen/Qwen3.5-4B publicado por el usuario glyd bajo licencia Apache-2.0. No es un modelo entrenado desde cero, sino una compresion con perdida ("lossy") de los pesos originales en bf16, generada con el motor propietario de Glyd y su nivel de cuantizacion denominado "kestrel". El resultado ocupa 3,4 GB en disco, un 59 % menos que los 8,4 GB del bf16 original, y se ejecuta exclusivamente sobre el motor de inferencia de Glyd.

El modelo base cuenta con 4.205.751.296 parametros segun el autor, aunque el recuento de safetensors del repositorio cuantizado indica 3.422.193.049: la diferencia se debe a que los pesos cuantizados se almacenan empaquetados, de modo que el numero de "parametros" detectado por el Hub no refleja el numero real de pesos. La precision efectiva es de aproximadamente 6,5 bits por peso. La divergencia KL respecto al bf16 medida sobre WikiText-2 es de 0,00883.

Su relevancia actual es limitada y muy especifica: ofrece una via para ejecutar un modelo de la familia Qwen3.5 con contexto de 32k tokens en GPUs de gama alta para consumidores (RTX 4090, L40S, RTX A6000) con un consumo de memoria de en torno a 4,6 GB a 4k de contexto y velocidades de 148-201 tokens/s, pero queda atado al runtime de Glyd, sin soporte para vLLM, transformers, llama.cpp u Ollama. Con 16 descargas y 0 "likes" en el momento de la consulta, se trata de un artefacto de adopcion incipiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; derivada de Qwen/Qwen3.5-4B (familia qwen3_5). El autor no describe la arquitectura interna en la model card |
| Parametros totales | 4.205.751.296 (segun el autor para el modelo base). El recuento safetensors de este repo es 3.422.193.049, porque los pesos cuantizados van empaquetados |
| Parametros activos | No aplica; no se describe como modelo MoE en la informacion disponible |
| Longitud de contexto | Verificada con exito a 32k tokens en RTX 4090, L40S y RTX A6000. Maximo soportado no disponible |
| Tipos de cuantizacion | Cuantizacion propietaria de Glyd, nivel "kestrel": aproximadamente 6,5 bits por peso, empaquetados. Existe un nivel mas agresivo ("swift") en otro repositorio. No hay variantes GGUF, AWQ, GPTQ ni bitsandbytes |
| Idiomas soportados | No disponible |
| Licencia | Pesos: Apache-2.0 (heredada de Qwen/Qwen3.5-4B). Motor de ejecucion Glyd: BUSL-1.1, gratuito para uso personal y no comercial en equipos propios; el uso comercial requiere licencia |
| Formato de pesos | safetensors con pesos empaquetados de ~6,5 bits; requieren el motor Glyd (libreria `glyd`), no compatibles con transformers ni vLLM |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura interna del modelo subyacente en la documentacion proporcionada. El tag `qwen3_5` y el nombre del modelo base, Qwen/Qwen3.5-4B, situan el checkpoint dentro de la familia Qwen3.5 de Alibaba, pero la model card no detalla si se trata de un transformer decoder-only clasico, una variante MoE o un esquema hibrido. Tampoco se especifican los datos de entrenamiento, el numero de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO. La mencion del autor a que "la parte de vision del modelo no esta incluida" indica que el checkpoint original Qwen3.5-4B incorpora capacidades multimodales (vision), de las que este derivado prescinde.

La innovacion tecnica de este repositorio no esta en el modelo, sino en el proceso de cuantizacion. Glyd aplica una compresion con perdida que reduce el peso de 8,4 GB a 3,4 GB (59 % menos) en una sola pasada desde los pesos bf16 originales, con una divergencia KL de 0,00883 frente a bf16 medida sobre WikiText-2. El autor es explicito en que el resultado no es sin perdida y en que no debe confundirse con una cuantizacion de 8 bits: las etiquetas "8-bit precision" y "Model size" del Hub cuentan bytes empaquetados, no bits por peso reales. El nivel "swift", mas agresivo, ocupa 2,9 GB (65 % menos), sube el KL a 0,0252 y alcanza 227 tokens/s en RTX 4090. No se documentan tecnicas de decodificacion especulativa, atencion lineal ni modificaciones del mecanismo de atencion.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` y el pipeline `text-generation` indican uso en dialogos multi-turno.
- Razonamiento y codigo: no se documentan capacidades especificas ni resultados de benchmarks que las respalden; se heredan, en principio, del modelo base Qwen3.5-4B, pero no hay verificacion publicada para este checkpoint cuantizado.
- Ventana de contexto de 32k tokens confirmada en la practica por el autor (probada en RTX 4090, L40S y RTX A6000).
- Capacidades multilingues: no disponibles; no se declara lista de idiomas.
- Vision: no disponible. El autor indica explicitamente que la parte de vision del modelo base no esta incluida, por lo que este checkpoint es solo texto.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito ("thinking mode"): no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la informacion proporcionada.
- Ejecucion en el motor Glyd: soporte de `glyd run` con contexto de 32k en GPUs NVIDIA seleccionadas.

## Casos de uso

- Asistentes conversacionales con historial largo en hardware de una sola GPU: con 32k tokens de contexto confirmados y 4,6 GB de memoria en uso a 4k sobre una RTX 4090, es viable mantener conversaciones con documentos o historiales extensos sin segmentar el contexto.
- Despliegue en estaciones de trabajo con GPUs de gama profesional: en L40S y RTX A6000 el modelo ocupa 4,7 GB y 4,5 GB respectivamente a 4k de contexto, lo que permite reservar el resto de la VRAM para otros procesos de inferencia o para lotes concurrentes.
- Generacion de texto de alto rendimiento en local: 201 tokens/s en RTX 4090 y 148 tokens/s en RTX A6000 son cifras adecuadas para tareas de resumen o redaccion asistida interactivas donde la latencia percibida importa.
- Prototipado de aplicaciones que requieren contexto largo sin presupuesto de nube: los 3,4 GB en disco y el ajuste a 32k de contexto permiten experimentar con documentos largos en una unica GPU de consumo de gama alta.
- Escenarios donde la fidelidad absoluta respecto a bf16 no es critica: con un KL de 0,00883 sobre WikiText-2, es apto para clasificacion de texto, extraccion de entidades o generacion de borradores, donde pequenas derivas en la distribucion de probabilidad no degradan el resultado final.
- Investigacion sobre cuantizacion con perdida: sirve como punto de comparacion reproducible frente al nivel "swift" (2,9 GB, KL 0,0252) y frente al bf16 original (8,4 GB, KL 0) para estudiar el compromiso tamano-calidad-velocidad.
- Evaluacion interna del motor Glyd: util para equipos que quieran medir el rendimiento de `glyd run` en su propio hardware antes de decidir si adoptan el runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de rendimiento publicados por el autor son la divergencia KL frente a bf16, el tamano del checkpoint y las metricas de velocidad inferidas en tres GPUs, medidas el 2026-10-09 con glyd 0.29.4, una GPU por prueba y 4k de contexto.

| Modelo | Tamano | Reduccion vs bf16 | KL vs bf16 (WikiText-2) | RTX 4090 |
| :-- | --: | --: | --: | --: |
| bf16 (original) | 8,4 GB | – | 0 | – |
| kestrel (este repo) | 3,4 GB | 59 % | 0,00883 | 201 tok/s |
| swift | 2,9 GB | 65 % | 0,0252 | 227 tok/s |

| GPU | Tokens/s | Primer token | Memoria a 4k | Contexto de 32k |
| :-- | --: | --: | --: | :-- |
| RTX 4090 | 201 | 103 ms | 4,6 GB | Si |
| L40S | 162 | 85 ms | 4,7 GB | Si |
| RTX A6000 | 148 | 134 ms | 4,5 GB | Si |

## Requisitos de hardware

- VRAM estimada: 4,6 GB en RTX 4090, 4,7 GB en L40S y 4,5 GB en RTX A6000, en todos los casos con 4k de contexto. La memoria a 32k de contexto no se cuantifica, aunque el autor confirma que cabe en esas tres GPUs.
- Tamano en disco: 3,4 GB (frente a 8,4 GB del bf16 original y 2,9 GB del nivel swift).
- GPUs recomendadas segun las mediciones del autor: RTX 4090 (201 tok/s, 103 ms hasta el primer token), L40S (162 tok/s, 85 ms) y RTX A6000 (148 tok/s, 134 ms).
- GPU de consumo: si. La RTX 4090 esta verificada y sostiene 32k de contexto; no hay mediciones publicadas para otras tarjetas de consumo (por ejemplo, serie RTX 30, RTX 4080 o RTX 5090).
- Sistema operativo y driver: Linux con GPU NVIDIA y driver 580 o superior.
- Opciones de despliegue: exclusivamente el motor de Glyd, mediante `glyd run Qwen/Qwen3.5-4B:kestrel`, o instalando el runtime con `curl -LsSf https://getglyd.com/install.sh | sh`. No hay soporte para vLLM, transformers, llama.cpp, Ollama ni TGI, segun indica el propio autor ("not for vLLM or transformers yet").
- Latencia y throughput: primer token entre 85 ms (L40S) y 134 ms (RTX A6000); throughput entre 148 y 201 tokens/s segun GPU. Datos medidos con una sola GPU y 4k de contexto; no se publican cifras de procesamiento por lotes ni de concurrencia.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano | Contexto | KL vs bf16 | Tokens/s (RTX 4090) | Licencia (pesos) | Disponibilidad |
| :-- | --: | --: | --: | --: | --: | :-- | :-- |
| glyd/Qwen3.5-4B-kestrel | 4.205.751.296 (empaquetados: 3.422.193.049) | 3,4 GB | 32k verificado | 0,00883 | 201 | Apache-2.0 | Motor Glyd (BUSL-1.1) unicamente |
| glyd/Qwen3.5-4B-swift | 4.205.751.296 (empaquetados, menor precision) | 2,9 GB | 32k no confirmado en la informacion disponible | 0,0252 | 227 | Apache-2.0 | Motor Glyd (BUSL-1.1) unicamente |
| Qwen/Qwen3.5-4B (bf16) | 4.205.751.296 | 8,4 GB | No disponible | 0 | No disponible | Apache-2.0 | Ecosistema estandar (transformers y otros), multimodal (incluye vision) |

No se dispone de datos sobre otras alternativas cuantizadas del mismo modelo base (por ejemplo, variantes GGUF o AWQ de Qwen3.5-4B) en la informacion proporcionada, por lo que no es posible comparar rendimiento ni calidad frente a ellas.

## Limitaciones y advertencias

- Cuantizacion con perdida: el autor la califica explicitamente como "not lossless". La divergencia KL de 0,00883 frente a bf16 implica una deriva medible en la distribucion de probabilidades del siguiente token. Para tareas sensibles a la precision (razonamiento matematico encadenado, generacion de codigo critico) conviene validar los resultados contra el modelo en bf16.
- Dependencia total del runtime: solo funciona con el motor Glyd. No hay soporte para vLLM ni transformers, y el autor lo indica con un "yet" que deja abierta la posibilidad de soporte futuro, pero sin fecha.
- Restriccion de licencia para uso comercial: aunque los pesos son Apache-2.0, el motor necesario para ejecutarlos es BUSL-1.1 y solo es gratuito para uso personal y no comercial en equipos propios. Cualquier despliegue comercial exige adquirir una licencia a Glyd, lo que condiciona por completo la viabilidad en produccion.
- Requisitos de plataforma: Linux con GPU NVIDIA y driver 580 o superior. No hay soporte documentado para Windows, macOS ni aceleradores no NVIDIA, lo que excluye despliegues en Apple Silicon o hardware AMD.
- Sin vision: el autor confirma que la parte de vision del modelo base no esta incluida, de modo que este checkpoint es estrictamente de texto aunque el modelo original sea multimodal.
- Idiomas no declarados: no se especifica que idiomas soporta, un riesgo relevante si se pretende usar en castellano o en entornos multilingues sin una evaluacion previa.
- Riesgo de alucinacion: no se documentan tasas de alucinacion ni evaluaciones de veracidad; al tratarse de un modelo de 4.000 millones de parametros, el riesgo de fabricacion de datos es intrinsecamente alto en tareas de conocimiento factual.
- Sesgos: no se publica ninguna evaluacion de sesgos, toxicidad ni alineacion para este checkpoint ni para el modelo base en la informacion disponible.
- Adopcion practicamente nula: 16 descargas y 0 "likes". No hay comunidad que haya validado el comportamiento real del checkpoint, ni reportes independientes de calidad.
- Ambiguedad en las etiquetas del Hub: el tag "8-bit" no refleja la precision real (unos 6,5 bits por peso), sino el empaquetado en bytes. Cualquier eleccion de despliegue basada en ese tag sera erronea.
- Sin benchmarks de calidad: no hay resultados de MMLU, HumanEval, GSM8K ni similares, por lo que no es posible estimar la degradacion real respecto al bf16 mas alla del KL sobre WikiText-2.
- Fecha de publicacion inusual: el repositorio figura como creado y actualizado el 2026-10-10, con la medicion de rendimiento del 2026-10-09 y la version 0.29.4 del motor Glyd. Se recomienda verificar la trazabilidad del artefacto antes de integrarlo en cualquier flujo de trabajo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/glyd/Qwen3.5-4B-kestrel
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Commit concreto del modelo base usado para la cuantizacion: https://huggingface.co/Qwen/Qwen3.5-4B/tree/851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a
- Variante de menor precision (nivel swift): https://huggingface.co/glyd/Qwen3.5-4B-swift
- Sitio del motor Glyd: https://getglyd.com
- Script de instalacion del motor: https://getglyd.com/install.sh

Nota sobre la busqueda web: los resultados obtenidos no contienen informacion relevante sobre el modelo (devuelven listados de sitios para adultos y un indice de paquetes Python de piwheels), por lo que no se han incorporado a esta ficha. No se han localizado papers, blogs tecnicos, repositorios ni demos asociados a este checkpoint.
