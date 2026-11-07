# KRadim/Qwen2.5-Coder-3B-text2cypher-LoRA

## Resumen

Qwen2.5-Coder-3B-text2cypher-LoRA es un adaptador de ajuste fino (LoRA) sobre el modelo base unsloth/Qwen2.5-Coder-3B-Instruct, desarrollado por el usuario KRadim. Su proposito especifico es traducir preguntas en lenguaje natural a consultas Cypher validas para bases de datos Neo4j, utilizando como contexto el esquema de la base de datos proporcionado en el prompt de sistema. El modelo esta disenado para tareas de text-to-query en entornos de grafos de conocimiento.

El adaptador se entreno mediante QLoRA (rango 16, alpha 16) durante una epoca sobre el dataset KRadim/multilingual-text2cypher-2025, que contiene 35.000 ejemplos, aunque la model card indica que se usaron 210.000 muestras en el entrenamiento. Se distribuye bajo licencia Apache 2.0 y esta pensado para ejecutarse con la libreria PEFT, con una version GGUF disponible para su uso directo en Ollama.

Su relevancia radica en la especializacion: en lugar de un modelo generalista, ofrece un adaptador ligero (0,9 GB en el repositorio) que se acopla a un modelo de 3B parametros para una tarea concreta de generacion de consultas de grafo, lo que facilita su despliegue en entornos con recursos limitados y su integracion en pipelines de analitica sobre Neo4j.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Coder-3B-Instruct) con adaptador LoRA |
| Parametros totales | No disponible (modelo base de 3B; el adaptador LoRA no especifica su numero de parametros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M disponible en la version GGUF; el adaptador LoRA se distribuye en safetensors |
| Idiomas soportados | Ingles (segun la model card y los tags) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); GGUF en el repositorio KRadim/Qwen2.5-Coder-3B-text2cypher-GGUF |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 y alpha 16 aplicado sobre el modelo base Qwen2.5-Coder-3B-Instruct, que es un transformer decoder-only de 3.000 millones de parametros. El ajuste se realizo con QLoRA, lo que implica cuantizacion del modelo base durante el entrenamiento para reducir el consumo de memoria. Se utilizaron las librerias Unsloth, Hugging Face TRL, PEFT y PyTorch.

El entrenamiento se llevo a cabo durante una epoca sobre el dataset KRadim/multilingual-text2cypher-2025, que contiene 35.000 ejemplos, aunque la model card menciona 210.000 muestras utilizadas. El formato de prompt emplea la plantilla de chat de Qwen con etiquetas `<|im_start|>` y `<|im_end|>`, e incluye el esquema de la base de datos Neo4j en el mensaje de sistema. No se detalla la composicion exacta del dataset ni si hubo fases de RLHF o DPO adicionales.

## Capacidades

- Generacion de consultas Cypher para Neo4j a partir de preguntas en lenguaje natural.
- Interpretacion de esquemas de bases de datos de grafos incluidos en el prompt de sistema.
- Generacion de texto conversacional en formato de chat (pipeline text-generation).
- Especializacion en una unica tarea: no se documentan capacidades generales de razonamiento, codigo, matematicas o vision mas alla de las heredadas del modelo base.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: la model card y los tags indican solo ingles, aunque el dataset se denomine "multilingual".
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Generacion de consultas Cypher en asistentes de analitica: el modelo recibe el esquema de la base de datos Neo4j en el prompt de sistema y devuelve la consulta Cypher correspondiente a una pregunta del usuario, lo que permite construir interfaces de consulta en lenguaje natural sobre grafos de conocimiento.
- Automatizacion de informes sobre grafos: integrado en un pipeline que traduce preguntas de negocio a Cypher, se pueden generar informes periodicos consultando relaciones y propiedades del grafo sin que el analista escriba Cypher manualmente.
- Herramientas de exploracion de datos para equipos no tecnicos: un frontend que envie la pregunta y el esquema a este adaptador permite a usuarios sin conocimientos de Cypher obtener resultados de Neo4j.
- Prototipado rapido de APIs text-to-query: al ser un adaptador ligero sobre un modelo de 3B, se puede desplegar en una GPU de consumo para validar un producto de consulta en lenguaje natural antes de escalar a modelos mayores.
- Educacion y formacion en Cypher: el modelo puede servir como generador de ejemplos de consultas a partir de descripciones, util en entornos de aprendizaje de Neo4j.
- Integracion en agentes de recuperacion sobre grafos: el adaptador puede actuar como componente de traduccion de intenciones a consultas dentro de un sistema mayor que orqueste la ejecucion en Neo4j y la presentacion de resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un adaptador LoRA sobre un modelo base de 3B, la VRAM depende del modelo base. En cuantizacion Q4_K_M (version GGUF) se estima un uso en torno a 2-3 GB, aunque no se proporciona una cifra oficial.
- GPU recomendadas: no disponible en la informacion proporcionada. Por el tamano del modelo base, es probable que funcione en GPU de consumo, pero no se confirma.
- Cabe en consumer GPU: no confirmado oficialmente; el tag de Ollama y la version GGUF Q4_K_M sugieren que si, pero no se aportan requisitos minimos.
- Opciones de despliegue: Ollama mediante `ollama run hf.co/KRadim/Qwen2.5-Coder-3B-text2cypher-GGUF:Q4_K_M`; la libreria PEFT permite cargar el adaptador sobre el modelo base con Hugging Face Transformers. No se documentan vLLM ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-Coder-3B-text2cypher-LoRA | 3B (base) + LoRA | No disponible | Text-to-Cypher | Apache 2.0 | Hugging Face, GGUF en Ollama |
| Qwen2.5-Coder-3B-Instruct | 3B | No disponible en esta ficha | Generacion de codigo general | Apache 2.0 | Hugging Face |
| Modelos text-to-SQL genericos | No disponible | No disponible | Text-to-SQL | Variable | Variable |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta especializado exclusivamente en text-to-Cypher; su rendimiento en otras tareas no esta documentado y probablemente sea inferior al del modelo base sin ajustar.
- La model card indica solo ingles como idioma soportado, a pesar de que el dataset se llame "multilingual"; el soporte real de otros idiomas no esta verificado.
- Riesgo de alucinacion: al generar consultas Cypher, puede producir sintaxis invalida o referencias a etiquetas y propiedades inexistentes si el esquema proporcionado no es claro o esta incompleto.
- No se documentan sesgos conocidos, pero al derivar de un modelo base entrenado con datos web, puede heredar sesgos de este.
- La longitud de contexto no esta especificada; esquemas de base de datos muy extensos podrian exceder la ventana del modelo.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base Qwen2.5-Coder-3B-Instruct, que tambien es Apache 2.0 segun la informacion disponible.
- El repositorio tiene pocas descargas (97) y ningun "like", lo que sugiere poca validacion comunitaria; conviene evaluar su calidad en el dominio concreto antes de usarlo en produccion.
- La discrepancia entre 35.000 ejemplos del dataset y 210.000 muestras indicadas en la model card no esta aclarada.

## Enlaces

- Hugging Face (adaptador LoRA): https://huggingface.co/KRadim/Qwen2.5-Coder-3B-text2cypher-LoRA
- Repositorio de archivos: https://huggingface.co/KRadim/Qwen2.5-Coder-3B-text2cypher-LoRA/tree/main
- Version GGUF: https://huggingface.co/KRadim/Qwen2.5-Coder-3B-text2cypher-GGUF
- Dataset: https://huggingface.co/datasets/KRadim/multilingual-text2cypher-2025
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-Coder-3B-Instruct
