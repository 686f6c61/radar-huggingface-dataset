# kodetr/SasakLLM-1.5B-Instruct-v7

## Resumen
SasakLLM-1.5B-Instruct-v7 es un adaptador LoRA sobre Qwen/Qwen2.5-1.5B-Instruct, desarrollado por el usuario kodetr, especializado en el idioma sasak (Lombok, Indonesia) y en indonesio. El modelo aborda un problema concreto: la escasez de recursos de IA generativa para lenguas regionales de Indonesia con soporte conversacional multi-turno, morfologia aglutinante y registro de cortesia (undak-usuk basa alus). La version v7 se centra en la expansion del dialogo conversacional, con 12.000 dialogos multi-turno que representan el 42,91 % del dataset de entrenamiento.

Tecnicamente, no se trata de un modelo completo sino de un adaptador PEFT (LoRA) que requiere cargar el modelo base Qwen2.5-1.5B-Instruct. El entrenamiento se realizo sobre el Master Unified Dataset v7, compuesto por 27.964 muestras que combinan conversacion multi-turno, precision morfologica y lexica, traduccion entre cinco dialectos del sasak, razonamiento nativo con chain-of-thought y anclas de hablantes nativos. La licencia es Apache 2.0 y el repositorio ocupa 0,1 GB.

Su relevancia radica en ser una de las pocas iniciativas documentadas de adaptacion de un modelo Qwen2.5 a una lengua regional indonesia con evaluacion academica y preservacion dialectal, lo que lo hace util para investigacion en NLP de bajos recursos y para aplicaciones de preservacion cultural.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), adaptador LoRA (PEFT) sobre Qwen/Qwen2.5-1.5B-Instruct |
| Parametros totales | 1,5 mil millones (modelo base); el adaptador LoRA anade un numero no especificado de parametros entrenables |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-1.5B-Instruct, pero no se confirma) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | sas (sasak), id (indonesio) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base por separado |

## Arquitectura y entrenamiento
El modelo es un adaptador LoRA (Low-Rank Adaptation) entrenado mediante continual LoRA fine-tuning sobre el modelo base Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1,5 mil millones de parametros. No se especifica el rango del adaptador ni el numero exacto de parametros entrenables. El entrenamiento se realizo sobre el Master Unified Dataset v7, compuesto por 27.964 muestras con la siguiente distribucion: 12.000 dialogos multi-turno (42,91 %) sobre diez dominios de la vida de Lombok (mercado tradicional o peken, agricultura de arrozales y laderas del Rinjani, cocina tipica, turismo y aldeas tradicionales, parentesco, artes, undak-usuk basa alus, sesenggakan, saludos y oraciones de rahayu, y aclaracion de mitos culturales); 10.192 muestras de precision morfologica y lexica del Balai Bahasa NTB con una retencion declarada del 99,2 % en lexico y reglas de afijacion aglutinativa; 3.000 muestras de traduccion matricial entre los cinco dialectos descritos por Mahsun (2006) (Meno-Mene, Ngeno-Ngene, Kuto-Kute, Ngeto-Ngete, Meriaq-Meriku); 2.500 muestras de razonamiento nativo chain-of-thought con etiquetas `` sobre temas como maro/nyakap, herencia y awig-awig; y 272 muestras ancla de hablantes nativos de SasakNLP verificadas a partir de cuentos populares y manuscritos lontar.

La innovacion principal es la combinacion de un modo de razonamiento explicito (chain-of-thought nativo en sasak) con cobertura dialectal y un registro de cortesia formal, algo poco habitual en adaptadores para lenguas regionales. No se documenta el uso de RLHF ni DPO, ni el numero total de tokens de entrenamiento mas alla del recuento de muestras.

## Capacidades
- Generacion de texto conversacional multi-turno en sasak e indonesio, con 12.000 dialogos de entrenamiento en diez dominios cotidianos.
- Razonamiento con chain-of-thought nativo mediante la etiqueta `<think>...</think>`, orientado a temas culturales y legales consuetudinarios (maro/nyakap, herencia, awig-awig).
- Traduccion entre los cinco dialectos del sasak segun la clasificacion de Mahsun (2006).
- Manejo del registro de cortesia undak-usuk basa alus (niveles de habla formal e informal).
- Precision morfologica y lexica en afijacion aglutinativa, con una retencion declarada del 99,2 %.
- Comprension de refranes (sesenggakan), saludos tradicionales y oraciones de rahayu.
- Clarificacion de mitos culturales y conocimiento de artes y tradiciones de Lombok.
- Soporte de tool calling / function calling: no documentado en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: parcialmente cubierto por el modo chain-of-thought, aunque no se documenta integracion con frameworks de agentes.
- Capacidades de vision o audio: no disponibles.

## Casos de uso
- Atencion al ciudadano en sasak: el modelo puede gestionar consultas administrativas o informativas en lengua sasak con registro de cortesia adecuado, aprovechando los 12.000 dialogos multi-turno de entrenamiento para mantener conversaciones coherentes.
- Preservacion y ensenanza de la lengua: como herramienta de practica conversacional y traduccion entre los cinco dialectos del sasak, util para escuelas y programas de revitalizacion linguistica de Lombok.
- Traduccion dialectal: conversion de textos entre Meno-Mene, Ngeno-Ngene, Kuto-Kute, Ngeto-Ngete y Meriaq-Meriku, lo que facilita la comunicacion entre hablantes de distintas variantes regionales.
- Turismo cultural: asistente virtual para visitantes de Lombok que explique tradiciones, cocina tipica, aldeas tradicionales y normas de cortesia local en sasak o indonesio.
- Documentacion de patrimonio inmaterial: apoyo en la transcripcion y explicacion de cuentos populares, manuscritos lontar y refranes, dado el anclaje con 272 muestras verificadas por hablantes nativos.
- Mediacion en asuntos consuetudinarios: asistencia en la explicacion de conceptos como awig-awig o normas de herencia, con razonamiento chain-of-thought que hace explicito el proceso de inferencia.
- Investigacion en NLP de bajos recursos: como caso de estudio reproducible de adaptacion LoRA de un modelo Qwen2.5 a una lengua regional con evaluacion academica y cobertura dialectal.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona la existencia de un "academic-benchmark" como etiqueta y declara una retencion del 99,2 % de precision en lexico y afijacion sobre el conjunto del Balai Bahasa NTB, pero no se aportan tablas de MMLU, HumanEval, GSM8K ni comparaciones numericas con otros modelos.

## Requisitos de hardware
- VRAM estimada para inferencia: al tratarse de un adaptador LoRA sobre un modelo de 1,5 mil millones de parametros, los requisitos son los del modelo base. En fp16 se estiman aproximadamente 3 GB de VRAM; en cuantizacion de 8 bits, alrededor de 1,5-2 GB; en 4 bits, en torno a 1-1,5 GB (estimaciones estandar para 1,5B, no confirmadas en la informacion proporcionada).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM deberia ser suficiente en cuantizacion; una RTX 3060, RTX 4060 o superior permite inferencia en fp16 sin problemas. Para despliegue por lotes se recomiendan A100, H100 o L40S.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna con al menos 4 GB de VRAM.
- Opciones de despliegue: el ejemplo oficial usa transformers con PEFT (PeftModel). Tambien seria posible fusionar el adaptador con el modelo base y desplegar con vLLM, TGI o llama.cpp/Ollama tras la conversion a GGUF, aunque estas rutas no estan documentadas por el autor.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SasakLLM-1.5B-Instruct-v7 | 1,5B (base) + LoRA | No disponible | sas, id | Apache 2.0 | Hugging Face (adaptador PEFT) |
| Qwen2.5-1.5B-Instruct | 1,5B | No confirmado en esta ficha | Multilingue (incluye indonesio, no sasak) | Apache 2.0 | Hugging Face |
| Modelos de lengua regional indonesia comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion sobre otros adaptadores o modelos especializados en sasak con los que establecer una comparacion cuantitativa. El unico punto de referencia solido es el modelo base Qwen2.5-1.5B-Instruct, sobre el que este adaptador anade capacidades en sasak, dialectos y registro de cortesia a costa de un posible olvido catastrofico en tareas generales no cubiertas por el dataset de entrenamiento.

## Limitaciones y advertencias
- Al ser un adaptador LoRA, requiere cargar el modelo base Qwen/Qwen2.5-1.5B-Instruct; no es un modelo autonomo y su rendimiento depende de la version exacta del base.
- El dataset de entrenamiento es relativamente pequeno (27.964 muestras) y muy especifico del dominio cultural de Lombok, lo que puede limitar la generalizacion fuera de esos temas.
- Riesgo de alucinacion en temas culturales, legales consuetudinarios o historicos no cubiertos por las muestras de entrenamiento; el modo chain-of-thought no garantiza correccion factual.
- Cobertura linguistica limitada a sasak e indonesio; no se documenta soporte para otras lenguas regionales de Indonesia ni para ingles.
- La retencion del 99,2 % en lexico y afijacion es una cifra declarada por el autor sobre su propio conjunto de evaluacion, no verificada de forma independiente.
- No se documentan sesgos especificos, pero al entrenarse sobre un corpus cultural concreto puede reproducir estereotipos o visiones localistas de las tradiciones de Lombok.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre la calidad en produccion ni sobre el cumplimiento de normas culturales o legales locales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- No se documentan tecnicas de mitigacion de olvido catastrofico respecto al modelo base, por lo que las capacidades generales de Qwen2.5 podrian haberse degradado.

## Enlaces
- Hugging Face: https://huggingface.co/kodetr/SasakLLM-1.5B-Instruct-v7
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Referencia dialectal citada: Mahsun (2006), clasificacion de los cinco dialectos del sasak (no se proporciona enlace directo en la informacion disponible)
- Proyecto SasakNLP: mencionado como fuente de las 272 muestras ancla (no se proporciona enlace directo en la informacion disponible)
- Balai Bahasa NTB: mencionado como fuente de las 10.192 muestras morfologicas y lexicas (no se proporciona enlace directo en la informacion disponible)
