# malkolm777/zils-lite-avg3-v1

## Resumen

zils-lite-avg3-v1 es un modelo de decisión de tipo "soup" (promediado de pesos) desarrollado por el usuario malkolm777 para el pool lite de la subnet Zils 127. Parte de vllm-sr/d3-lite, un cuerpo de decisión basado en la familia Qwen3.5-0.8B, y se construye mediante el promedio de pesos de los dos miembros actuales del pool lite (VadymPikulyk/zils-lite-dh2 y qhoenix/zils-lite-decision-avg-abc), sobre el que se entrenan tres estudiantes LoRA que después se promedian con pesos iguales.

El modelo no es un generador de texto de propósito general, sino un extractor de características y clasificador de decisiones: su pipeline declarado es feature-extraction y su tarea es emitir distribuciones de respuesta sobre ítems de decisión (estilo examen, clasificación, function calling). Con 852.985.920 parámetros y un repositorio de 1,7 GB en safetensors, está pensado para integrarse en el circuito de decisión de la subnet más que para conversación abierta.

Es relevante ahora porque ejemplifica una técnica de bajo coste (promediado de pesos más LoRA) para consolidar varios fine-tunes sobre una base pequeña, con licencia Apache-2.0 y compatibilidad con endpoints, lo que facilita su despliegue en infraestructura estándar de transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en la familia Qwen3.5-0.8B (cuerpo de decisión d3-lite), con torre de visión y readout heredados del chasis |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers, custom_code) |

## Arquitectura y entrenamiento

El modelo es un transformer de la familia Qwen3.5-0.8B adaptado como cuerpo de decisión (d3-lite). El proceso de construcción es un "soup" en dos fases: primero se promedia el peso de los dos miembros del pool lite (VadymPikulyk/zils-lite-dh2 y qhoenix/zils-lite-decision-avg-abc); después se entrenan tres estudiantes LoRA con rango 64, learning rate 5e-5, una época y semillas 553, 771 y 991 sobre el mismo conjunto de 25.464 ítems de decisión; finalmente se promedian los tres adaptadores con pesos iguales. El readout, la torre de visión y todos los ficheros de contrato son los del chasis original.

Los datos de entrenamiento son ítems de decisión de estilo examen, redactados y verificados por un LLM a partir de filas del split de entrenamiento de datasets públicos (MMLU, BoolQ, GSM8K, ANLI, GLUE, Banking77, CLINC150, When2Call, poem_sentiment, iSarcasm, titulares de sarcasmo, SVAMP, CommonsenseQA, TweetEval, 20Newsgroups, Glaive function calling y tareas de BIG-bench), junto con filas de esos mismos datasets en el formato de decisión del pool. Los objetivos son suaves: 0,7 × la distribución de respuesta del fine-tune propio d3-mini (profesor) más 0,3 × la etiqueta gold. No se documenta uso de RLHF ni DPO.

## Capacidades

- Clasificación y decisión sobre ítems de examen y tareas de opción múltiple (MMLU, CommonsenseQA, ANLI, GLUE).
- Razonamiento aritmético básico derivado de GSM8K y SVAMP en formato de decisión.
- Clasificación de intenciones y dominios (Banking77, CLINC150, 20Newsgroups).
- Detección de necesidad de llamada a herramienta (When2Call) y function calling (Glaive).
- Análisis de sentimiento y sarcasmo (poem_sentiment, iSarcasm, TweetEval).
- Extracción de características (pipeline feature-extraction) para uso como encoder en pipelines propios.
- Soporte de visión heredado del chasis (torre de visión incluida, según la model card).
- No se documentan capacidades de agente multi-paso, thinking mode ni audio.

## Casos de uso

- Enrutamiento de decisiones en la subnet Zils 127: el modelo actúa como cuerpo de decisión del pool lite, emitiendo distribuciones de respuesta que el circuito de la subnet consume directamente.
- Clasificación de tickets de soporte: aprovecha el entrenamiento sobre Banking77 y CLINC150 para asignar intenciones y dominios en un pipeline de atención al cliente.
- Filtro de function calling en pipelines de agentes: el entrenamiento sobre When2Call y Glaive permite decidir si una consulta requiere invocar una herramienta antes de pasar el control a un LLM mayor.
- Moderación y análisis de sentimiento en redes sociales: los datos de TweetEval, iSarcasm y titulares de sarcasmo lo hacen adecuado para etiquetar polaridad y sarcasmo en textos cortos.
- Evaluación automática de exámenes y benchmarks: su formato de salida de distribución sobre opciones encaja con la corrección automática de MMLU, CommonsenseQA o ANLI en pipelines de evaluación.
- Extracción de embeddings para búsqueda semántica: al declarar feature-extraction, puede usarse como encoder en sistemas de recuperación sobre dominios cubiertos por sus datos de entrenamiento.
- Selección de respuesta en sistemas de votación: su naturaleza de modelo de decisión permite puntuar candidatos generados por otros modelos y elegir el más probable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,7 GB de pesos más overhead de activaciones y del chasis; en la práctica, entre 2 y 4 GB según longitud de secuencia y batch.
- VRAM estimada en cuantización de 8 bits: alrededor de 1 GB de pesos; en 4 bits, en torno a 0,5 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB (RTX 3060, RTX 4060, RTX 4090) es suficiente; para serving con batch alto se recomienda A100 o H100.
- Cabe en GPU consumer: sí, con holgura, dado el tamaño de 853 M de parámetros.
- Opciones de despliegue: transformers (librería declarada, con custom_code), y por compatibilidad con endpoints se puede servir mediante TGI o vLLM; no se documenta soporte GGUF ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zils-lite-avg3-v1 | 853 M | no disponible | Decisión / feature-extraction | Apache-2.0 | Hugging Face |
| vllm-sr/d3-lite (base) | no disponible | no disponible | Decisión | no disponible | Hugging Face |
| VadymPikulyk/zils-lite-dh2 | no disponible | no disponible | Decisión (pool lite) | no disponible | Hugging Face |
| qhoenix/zils-lite-decision-avg-abc | no disponible | no disponible | Decisión (pool lite) | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado en decisión: no está diseñado para generación de texto abierta ni conversación multi-turno; su uso fuera de tareas de clasificación o puntuación puede dar resultados pobres.
- Objetivos de entrenamiento suaves (70 % profesor d3-mini, 30 % gold): puede heredar sesgos y errores del profesor d3-mini.
- Datos de entrenamiento derivados de datasets públicos con posibles sesgos demográficos, culturales y lingüísticos; no se documentan evaluaciones de sesgo.
- Riesgo de alucinación en la distribución de respuesta cuando los ítems se alejan de la distribución de entrenamiento (exámenes, clasificación de intenciones, function calling).
- Idiomas soportados no documentados; el entrenamiento se basa en datasets mayoritariamente en inglés, por lo que el rendimiento en castellano no está garantizado.
- Longitud de contexto no documentada; no se debe asumir una ventana larga.
- Licencia Apache-2.0 permite uso comercial, pero se debe conservar LICENSE y NOTICE; el modelo base vllm-sr/d3-lite puede tener condiciones propias que conviene revisar.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso en producción ni validación externa.
- Requiere custom_code en transformers, lo que puede complicar el despliegue en entornos con versiones fijas de la librería.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/malkolm777/zils-lite-avg3-v1
- Modelo base: https://huggingface.co/vllm-sr/d3-lite
- Miembro del pool lite: https://huggingface.co/VadymPikulyk/zils-lite-dh2
- Miembro del pool lite: https://huggingface.co/qhoenix/zils-lite-decision-avg-abc
