# Darmm/darmm-chat-kazakh-8b

## Resumen

Darmm/darmm-chat-kazakh-8b es un modelo de lenguaje conversacional afinado sobre Qwen/Qwen3-8B mediante QLoRA, desarrollado por Darmm. Su objetivo principal es servir como asistente de chat en kazajo, manteniendo competencia en ruso e inglés, lo que lo convierte en una opción relevante para aplicaciones multilingües centradas en Asia Central. El modelo se entrenó sobre aproximadamente 105.000 pares de instrucciones, de los cuales 65.000 son en kazajo, 25.000 en ruso y 15.000 en inglés.

Arquitectónicamente, se trata de un transformer denso basado en Qwen3-8B, con 8.190.735.360 parámetros totales. La longitud de contexto no se especifica en la información disponible; el autor indica que el entrenamiento se realizó con una longitud máxima de secuencia de 1024 tokens. El modelo está pensado para funcionar en modo no-thinking y requiere muestreo estocástico para evitar degeneraciones en texto largo. La licencia es Apache 2.0 y los pesos se distribuyen en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | kazajo (kk), ruso (ru), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Qwen/Qwen3-8B, un transformer denso con atención por capas, entrenado como modelo de chat instruct. No emplea arquitectura MoE ni SSM. El proceso de ajuste utilizó QLoRA con el modelo base cuantizado a 4-bit NF4 y adaptadores LoRA con r=32 y α=64 aplicados a todas las proyecciones de atención y MLP, lo que supone 59,9 millones de parámetros entrenables.

Los datos de entrenamiento incluyen cuatro datasets de instrucciones: AmanMussa/kazakh-instruction-v2 (51.000 ejemplos), sabinaasker/kazakh_dolly (15.000), d0rj/alpaca-cleaned-ru (25.000) y yahma/alpaca-cleaned (15.000). El entrenamiento se realizó durante 1 época con tamaño de lote efectivo de 32, tasa de aprendizaje de 1e-4 con programación coseno, longitud máxima de secuencia de 1024 tokens, precisión bf16 y una sola GPU A100. No se aplicaron técnicas de RLHF ni DPO; el ajuste es exclusivamente de aprendizaje supervisado por instrucciones.

## Capacidades

- Generacion de texto y respuesta a instrucciones en formato chat, optimizado para kazajo, ruso e ingles.
- Razonamiento basico y generacion de contenido en tareas de instruccion sencillas, sin modo thinking habilitado.
- Competencia multilingue, con mayor solidez en kazajo que el modelo base Qwen3-8B.
- Soporte para plantillas de chat estandar de Qwen, con `enable_thinking=False`.
- No se especifican capacidades de tool calling, function calling ni uso de agentes.
- No incluye soporte de vision, audio ni otras modalidades.

## Casos de uso

- Atencion al cliente en kazajo: el modelo puede responder consultas frecuentes en interacciones de un solo turno o conversaciones cortas, siempre que las respuestas se verifiquen mediante un sistema de RAG para reducir alucinaciones.
- Generacion de contenido educativo en kazajo: sirve para crear textos de practica, resumenes o ejercicios escolares, aprovechando su capacidad para producir lenguaje natural en kazajo.
- Traduccion asistida kazajo-ruso-ingles: dado su entrenamiento multilingue, puede actuar como asistente de traduccion con supervision humana, especialmente en dominios generales.
- Anotacion de datos para NLP kazajo: permite generar etiquetas preliminares o parafraseos para construir datasets de instrucciones, reduciendo el coste de anotacion manual.
- Asistente interno para equipos mixtos kazajo-ruso: en empresas con personal que usa ambos idiomas, el modelo puede redactar mensajes, correos o documentacion breve.
- Desarrollo de chatbots simples con RAG: al carecer de fiabilidad factual, se integra en pipelines que recuperan informacion de una base documental kazaja y generan respuestas contextualizadas.

## Benchmarks y rendimiento

Segun la model card, se evaluo el modelo con una metodologia de opcion multiple cero-shot mediante log-prob de opciones, usando plantilla de chat no-thinking. KazMMLU es una muestra de 3.000 preguntas sobre materias en kazajo (semilla 42) y Belebele se evaluo sobre el conjunto completo de kaz_Cyrl (900 muestras).

| Benchmark | Qwen3-8B (base) | Darmm/darmm-chat-kazakh-8b |
|---|---|---|
| Belebele (kaz_Cyrl) | 27.2% | 39.8% |
| KazMMLU (materias kazajas) | 27.9% | 38.3% |

No se han publicado resultados de otros benchmarks estandar como MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 16 GB para inferencia en bf16 sin cuantizacion.
- Con cuantizacion 4-bit (por ejemplo, mediante llama.cpp o bitsandbytes), la VRAM puede reducirse a unos 5-6 GB.
- GPU recomendadas: A100 para entrenamiento o inferencia de alto rendimiento; RTX 4090 o A10 para despliegue en bf16; RTX 3090/4090 con cuantizacion para uso en estaciones de trabajo.
- El modelo cabe en GPUs de consumo si se cuantiza, pero no se ofrecen pesos cuantizados oficiales.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, Transformers con `device_map="auto"`.
- No se proporcionan datos de latencia ni throughput en la informacion disponible.

## Comparativa con modelos similares

El principal referente es el propio modelo base Qwen3-8B. No se dispone de datos comparativos con otros modelos afines especializados en kazajo.

| Modelo | Parametros | Longitud contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen/Qwen3-8B | 8.190.735.360 | no disponible | Apache 2.0 | HuggingFace |
| Darmm/darmm-chat-kazakh-8b | 8.190.735.360 | no disponible | Apache 2.0 | HuggingFace |

No se conocen alternativas de la misma categoria y tamano con especializacion kazaja en la informacion disponible.

## Limitaciones y advertencias

- Fiabilidad factual limitada: el modelo obtiene un 38.3% en KazMMLU, por lo que puede afirmar hechos, fechas o nombres con confianza de forma incorrecta.
- Gran parte de los datos kazajos son traducciones automaticas, lo que puede provocar frases poco naturales o torpes.
- La decodificacion codiciosa (greedy) degrada notablemente la calidad de las respuestas largas; es necesario usar muestreo con temperatura 0.7, top_p 0.8, top_k 20 y repetition_penalty 1.1.
- El modelo no esta afinado en seguridad mas alla de lo que pueda proporcionar el modelo base, por lo que puede generar contenido que requiera filtrado adicional.
- El entrenamiento se realizo con una ventana de 1024 tokens, lo que puede limitar su manejo de contextos largos en la practica.
- No incluye soporte de tool calling ni funciones de agente, por lo que no es adecuado para integraciones que requieran llamadas a herramientas externas.

## Enlaces

- Modelo: https://huggingface.co/Darmm/darmm-chat-kazakh-8b
- Adaptador LoRA: https://huggingface.co/Darmm/darmm-chat-kazakh-8b-lora
- Dataset kazajo: https://huggingface.co/datasets/AmanMussa/kazakh-instruction-v2
- Dataset kazajo Dolly: https://huggingface.co/datasets/sabinaasker/kazakh_dolly
- Dataset ruso: https://huggingface.co/datasets/d0rj/alpaca-cleaned-ru
- Dataset ingles: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
