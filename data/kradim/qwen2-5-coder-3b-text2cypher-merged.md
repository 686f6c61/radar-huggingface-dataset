# KRadim/Qwen2.5-Coder-3B-text2cypher-Merged

## Resumen

Qwen2.5-Coder-3B-text2cypher-Merged es un ajuste fino supervisado del modelo base unsloth/Qwen2.5-Coder-3B-Instruct, desarrollado por el usuario KRadim y publicado en Hugging Face bajo licencia Apache 2.0. Su proposito es convertir preguntas en lenguaje natural en consultas Cypher validas para bases de datos de grafos Neo4j, utilizando como contexto el esquema de la base de datos proporcionado en el system prompt. El modelo resuelve el problema de la traduccion text-to-query en entornos de grafos, donde la sintaxis Cypher y la estructura del esquema condicionan fuertemente la correccion de la consulta generada.

Tecnicamente, parte de la arquitectura Qwen2 (transformer decoder-only) con 3.085.938.688 parametros totales, y se ha entrenado mediante QLoRA con rango 16 y alpha 16 sobre un dataset propio de 35.000 ejemplos (KRadim/multilingual-text2cypher-2025), en una sola epoca. El autor declara 210.000 muestras utilizadas en el proceso de entrenamiento. El resultado se distribuye como adaptador PEFT (safetensors) y como pesos fusionados ("Merged"), ademas de una exportacion GGUF publicada en un repositorio separado para su uso con Ollama.

Su relevancia actual es acotada pero concreta: cubre un nicho (text-to-Cypher para Neo4j) con un modelo pequeno de 3B parametros que puede ejecutarse en hardware de consumo, lo que facilita prototipado local de asistentes de consulta sobre grafos sin depender de APIs externas. No obstante, el repositorio presenta cero descargas y cero likes en el momento de la consulta, y no se han publicado resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Coder-3B-Instruct como base) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M disponible en el repositorio KRadim/Qwen2.5-Coder-3B-text2cypher-GGUF; otros tipos no disponibles |
| Idiomas soportados | en (segun metadatos; el dataset se denomina "multilingual" pero el campo language declara solo ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT y pesos fusionados); GGUF en repositorio separado |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint unsloth/Qwen2.5-Coder-3B-Instruct, que emplea la arquitectura Qwen2.5 (transformer decoder-only con atencion causal). El ajuste se realizo con QLoRA, con rango 16 y alpha 16, durante 1 epoca, usando Unsloth, Hugging Face TRL, PEFT y PyTorch. El dataset de entrenamiento es KRadim/multilingual-text2cypher-2025, con 35.000 ejemplos, y el autor indica 210.000 muestras utilizadas en el proceso (cifra que no se detalla como se compone respecto al dataset declarado). El objetivo del entrenamiento es mapear pares (esquema de base de datos + pregunta en lenguaje natural) a consultas Cypher.

No se especifica en la informacion disponible el numero total de tokens de entrenamiento, la composicion detallada del dataset, ni si se aplicaron fases de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. El formato de prompt esperado sigue la plantilla ChatML de Qwen (`<|im_start|>system ... <|im_end|>`), con el esquema de Neo4j insertado en el mensaje de sistema y la pregunta del usuario en el mensaje de usuario.

## Capacidades

- Generacion de consultas Cypher para Neo4j a partir de preguntas en lenguaje natural, condicionada por un esquema de base de datos incluido en el system prompt.
- Generacion de texto conversacional en formato chat (pipeline text-generation, tag conversational).
- Capacidad de codigo heredada del modelo base Qwen2.5-Coder-3B-Instruct, aunque el ajuste esta orientado especificamente a Cypher.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: el campo language declara solo ingles; el dataset se denomina "multilingual" pero no se detallan los idiomas cubiertos.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Asistente de consulta sobre bases de datos Neo4j: el modelo recibe el esquema de la base de datos en el system prompt y la pregunta del usuario, y devuelve una consulta Cypher ejecutable; es adecuado por su entrenamiento especifico en pares esquema-pregunta-consulta.
- Generacion de consultas en herramientas de BI sobre grafos: integrado en un panel interno, permite a analistas sin conocimiento de Cypher obtener consultas a partir de preguntas en lenguaje natural, reduciendo la dependencia del equipo de datos.
- Prototipado local de chatbots para grafos de conocimiento: al ser un modelo de 3B parametros con version GGUF Q4_K_M, puede ejecutarse en un portatil con Ollama (`ollama run hf.co/KRadim/Qwen2.5-Coder-3B-text2cypher-GGUF:Q4_K_M`) para demos y pruebas de concepto sin infraestructura cloud.
- Aceleracion de tareas de exploracion de datos: un ingeniero puede describir en lenguaje natural que nodos y relaciones quiere inspeccionar y obtener la consulta Cypher para ejecutarla manualmente en Neo4j Browser.
- Generacion de consultas en pipelines de integracion: el modelo puede formar parte de un servicio que traduzca peticiones de una API interna a Cypher antes de ejecutarlas contra la base de datos, siempre con validacion posterior de la consulta generada.
- Educacion y formacion en Cypher: sirve como generador de ejemplos de consultas para materiales docentes, comparando la salida del modelo con la solucion esperada para ilustrar patrones de sintaxis.
- Migracion de logicas de consulta desde SQL: en equipos que migran parte de su analitica a Neo4j, el modelo puede ayudar a traducir preguntas de negocio ya resueltas en SQL a su equivalente en Cypher, partiendo del esquema del grafo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 3B parametros, la version GGUF Q4_K_M ocupa aproximadamente 2 GB en disco y requiere del orden de 2-3 GB de VRAM o RAM para ejecutarse, aunque esta cifra es una estimacion general y no un dato publicado por el autor.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Cabe en GPU de consumo: si, segun la disponibilidad de la exportacion GGUF Q4_K_M para Ollama; no se detallan modelos concretos de GPU.
- Opciones de despliegue: Ollama mediante el repositorio GGUF (KRadim/Qwen2.5-Coder-3B-text2cypher-GGUF); el adaptador PEFT puede cargarse con las librerias de Hugging Face (PEFT, Transformers). No se documenta soporte explicito para vLLM, TGI o llama.cpp mas alla de la ruta GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KRadim/Qwen2.5-Coder-3B-text2cypher-Merged | 3.085.938.688 | no disponible | Text-to-Cypher (Neo4j) | apache-2.0 | Hugging Face, GGUF para Ollama |
| unsloth/Qwen2.5-Coder-3B-Instruct (modelo base) | ~3B | no disponible en esta ficha | Codigo general e instrucciones | apache-2.0 | Hugging Face |
| Qwen2.5-Coder-7B-Instruct | ~7B | no disponible en esta ficha | Codigo general e instrucciones | apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La comparativa se limita a parametros, enfoque y licencia; no se han encontrado alternativas especificas de text-to-Cypher en la busqueda realizada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse sobre un dataset propio de 35.000 ejemplos, puede reproducir los sesgos de distribucion de ese corpus.
- Riesgo de alucinacion: alto en la generacion de Cypher, ya que el modelo puede inventar etiquetas de nodos, propiedades o relaciones no presentes en el esquema; se recomienda validar toda consulta generada contra el esquema real antes de ejecutarla.
- Limitaciones de contexto o idioma: el campo language declara unicamente ingles, pese a que el dataset se denomine "multilingual"; el rendimiento en castellano no esta documentado.
- Restricciones de licencia: licencia Apache 2.0, que permite uso comercial, pero el modelo base Qwen2.5-Coder-3B-Instruct tiene sus propios terminos que deben respetarse en la redistribucion.
- Caveats para produccion: el modelo tiene cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni validacion externa; el repositorio ocupa 43,2 GB, lo que sugiere la presencia de multiples artefactos ademas de los pesos. La cifra de 210.000 muestras declarada por el autor no concuerda de forma directa con los 35.000 ejemplos del dataset citado, por lo que conviene verificar la procedencia exacta de los datos de entrenamiento antes de un uso critico.
- El prompt requiere obligatoriamente incluir el esquema de la base de datos en el mensaje de sistema; sin el, la calidad de las consultas generadas no esta garantizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KRadim/Qwen2.5-Coder-3B-text2cypher-Merged
- Repositorio de archivos: https://huggingface.co/KRadim/Qwen2.5-Coder-3B-text2cypher-Merged/tree/main
- Version GGUF para Ollama: https://huggingface.co/KRadim/Qwen2.5-Coder-3B-text2cypher-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/KRadim/multilingual-text2cypher-2025
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-Coder-3B-Instruct
