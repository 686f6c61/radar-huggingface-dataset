# larmkaixian/bt-sim-slm

## Resumen

bt-sim-slm es un modelo de lenguaje causal pequeno (229,7 millones de parametros) desarrollado por el usuario larmkaixian y publicado en Hugging Face. Se trata de un fine-tune del modelo base LiquidAI/LFM2.5-230M-Base, orientado a una tarea muy concreta: transformar una especificacion de tarea en JSON (junto con un catalogo de nodos y, en caso de reintento, el XML previo y los errores del validador) en XML valido para BehaviorTree.CPP v4. La arquitectura subyacente es la de LFM2.5, un transformer causal compacto de la familia Liquid Foundation Models.

El modelo resuelve un problema de nicho en el ambito de la robotica y los sistemas autonomos: la generacion automatica de arboles de comportamiento (behavior trees) a partir de descripciones estructuradas. En lugar de depender de un LLM grande generalista, este fine-tune busca producir XML correcto con un coste computacional minimo, lo que permite ejecutarlo en entornos con recursos limitados o incluso en el borde.

Es relevante ahora porque demuestra una estrategia habitual en la comunidad open source: especializar modelos muy pequenos mediante datos sinteticos y validacion automatica para tareas de formato estricto. No obstante, se trata de una primera version entrenada sobre un catalogo de 42 nodos anteriores a la introduccion de los pasos repeat/Parallel, y no se ha evaluado sobre salidas reales de otros LLM, solo contra un generador basado en reglas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (familia LFM2.5 de Liquid AI) |
| Parametros totales | 229.693.184 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0), uso comercial restringido por umbral de ingresos |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM2.5-230M-Base, un transformer causal compacto de la familia LFM2.5. El fine-tune conserva la arquitectura del modelo base y solo modifica los pesos mediante ajuste supervisado. No se dispone de informacion sobre la composicion exacta de la arquitectura interna (numero de capas, dimensiones, mecanismo de atencion) mas alla de su naturaleza transformer causal.

El entrenamiento se realizo con datos sinteticos: pares (especificacion de tarea en JSON, XML de behavior tree) etiquetados por un validador. Las filas de mas de 768 tokens se descartaron y se ejecuto una sola epoca. En los reintentos, la entrada incluye el XML previo y los errores del validador, lo que permite al modelo corregir iterativamente. El autor reporta una puntuacion en conjunto reservado frente a un generador basado en reglas sobre especificaciones sinteticas: validez 0,975 y coincidencia exacta 0,915. No se menciona uso de RLHF ni DPO.

## Capacidades

- Generacion de XML para BehaviorTree.CPP v4 a partir de una especificacion de tarea en JSON y un catalogo de nodos.
- Correccion iterativa: acepta el XML previo y los errores del validador para regenerar una version corregida.
- Generacion de texto causal propia del modelo base (fine-tune sobre LFM2.5-230M-Base).
- Capacidad conversacional segun los tags del repositorio (conversational).
- No consta soporte de tool calling ni function calling.
- No consta soporte de agentes ni razonamiento multi-paso mas alla del bucle de reintento con validador.
- Capacidades multilingues: no disponibles.
- No consta modo thinking, vision ni audio.

## Casos de uso

- Generacion de behavior trees en robotica: el modelo transforma una especificacion JSON de tarea en XML valido para BehaviorTree.CPP v4, lo que permite automatizar la creacion de arboles de comportamiento en pipelines de desarrollo de robots.
- Bucle de correccion con validador: integrado en un sistema que valide el XML generado, el modelo puede recibir los errores y regenerar la salida, lo que reduce la intervencion manual en la depuracion de arboles.
- Prototipado rapido de logica de comportamiento: al ser un modelo de 230 M de parametros, se puede ejecutar en local para iterar sobre especificaciones de tareas sin depender de APIs externas.
- Despliegue en el borde o en entornos con recursos limitados: su tamano reducido (repo de 0,5 GB) permite ejecutarlo en dispositivos con poca memoria, algo inviable con LLM de mayor escala.
- Generacion de codigo estructurado en dominios de nicho: el enfoque de fine-tune con datos sinteticos y validacion automatica es replicable para otras tareas de formato estricto (DSL, configuraciones, esquemas).
- Educacion e investigacion: sirve como ejemplo de especializacion de un modelo base pequeno mediante datos sinteticos, util para estudiar tecnicas de fine-tuning y evaluacion con validadores.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados en conjunto reservado, comparando contra un generador basado en reglas sobre especificaciones sinteticas:

| Metrica | Valor |
|---|---|
| XML valido | 0,975 |
| Coincidencia exacta | 0,915 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La evaluacion no se realizo sobre salidas reales de otros LLM, sino sobre especificaciones sinteticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 229,7 M de parametros, en fp16 ocuparia aproximadamente 0,46 GB de pesos, y en cuantizaciones de 8 o 4 bits, menos de 0,25 GB, aunque no se confirman los formatos de cuantizacion soportados.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente por tamano; no se dispone de recomendaciones oficiales.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con al menos 1-2 GB de VRAM libre, aunque no se ha verificado oficialmente.
- Opciones de despliegue: al ser un modelo de la familia LFM2.5 con pesos safetensors, es compatible con frameworks de inferencia estandar (transformers, vLLM, llama.cpp/Ollama si se generan los GGUF correspondientes), aunque no se confirma soporte explicito.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| bt-sim-slm | 229,7 M | no disponible | LFM Open License v1.0 | Hugging Face |
| LiquidAI/LFM2.5-230M-Base | 230 M | no disponible | LFM Open License v1.0 | Hugging Face |
| no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos comparables especializados en generacion de XML para BehaviorTree.CPP.

## Limitaciones y advertencias

- Primera version entrenada sobre un catalogo de 42 nodos anterior a la introduccion de los pasos repeat/Parallel; versiones posteriores la sustituyen segun nuevos commits.
- La evaluacion se realizo solo sobre especificaciones sinteticas y contra un generador basado en reglas, no sobre salidas reales de otros LLM, por lo que el rendimiento en produccion con entradas reales es incierto.
- Riesgo de alucinacion: como todo modelo generativo, puede producir XML sintacticamente valido pero semanticamente incorrecto; el bucle con validador mitiga pero no elimina este riesgo.
- Sesgos conocidos: no disponibles.
- Limitaciones de contexto e idioma: no disponibles; las filas de entrenamiento se truncaron a 768 tokens, lo que sugiere un limite practico en la longitud de las entradas.
- Restricciones de licencia: LFM Open License v1.0, con uso comercial restringido por encima del umbral de ingresos de la licencia; se mantiene la atribucion a Liquid AI, Inc.
- Para produccion, conviene validar siempre la salida con el validador de BehaviorTree.CPP y no confiar unicamente en el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/larmkaixian/bt-sim-slm
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-230M-Base
- Licencia LFM Open License v1.0: recogida en el fichero LICENSE del repositorio
