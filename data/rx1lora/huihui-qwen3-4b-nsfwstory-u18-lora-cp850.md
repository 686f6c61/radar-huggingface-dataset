# rx1lora/huihui-qwen3-4b-nsfwstory-u18-lora-cp850

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario `rx1lora`, diseñado para ajustar el modelo base `huihui-ai/Huihui-Qwen3-4B-abliterated-v2` hacia la generación de historias con contenido explícito (etiquetado como "nsfwstory"). El nombre del archivo incluye la etiqueta "u18", lo que sugiere que el contenido objetivo podría involucrar a menores de 18 años, un aspecto que requiere una advertencia ética y legal inmediata. El adaptador se distribuye en formato PEFT (safetensors) y tiene un tamaño de 0,3 GB, lo que indica que solo contiene los pesos del adaptador, no el modelo completo.

El modelo base es una versión "abliterada" de Qwen3-4B, es decir, se le han eliminado las capas de censura mediante una intervención a nivel de pesos (abliteración), un proceso documentado en proyectos como Heretic. Esta técnica no es un fine-tuning, sino una modificación directa de los pesos para eliminar los rechazos a contenido prohibido. El adaptador LoRA añade una capa de especialización adicional para narrativa NSFW. La relevancia de este modelo es limitada y controvertida: se inscribe en el ecosistema de modelos "uncensored" que circulan en la comunidad open source, pero su orientación a contenido con menores lo sitúa fuera de cualquier uso legítimo y plantea serios problemas de seguridad y cumplimiento legal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Qwen3-4B) |
| Parametros totales | No disponible (el adaptador LoRA tiene un numero reducido; el modelo base tiene 4.000 millones) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen3-4B soporta 32.768 tokens nativos) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizaciones GGUF, GPTQ, etc.) |
| Idiomas soportados | No disponible (el modelo base Qwen3 soporta multiples idiomas, principalmente ingles y chino) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura del modelo Qwen3-4B, un transformer decoder-only con atención de múltiples cabezas, normalización pre-RMSNorm y activaciones SwiGLU. El modelo base ha sido sometido a un proceso de abliteración, que consiste en identificar y anular las direcciones en el espacio de activaciones responsables de los comportamientos de rechazo, sin reentrenar los pesos. Sobre esta base, el adaptador LoRA se ha entrenado con la librería PEFT (versión 0.20.0) y la herramienta Unsloth, que optimiza el fine-tuning en GPUs de consumo. No se proporcionan detalles sobre el dataset de entrenamiento, el número de pasos, la tasa de aprendizaje ni el régimen de precisión (fp16, bf16, etc.). El repositorio no incluye información sobre el proceso de entrenamiento más allá de los metadatos técnicos.

## Capacidades

- Generacion de texto narrativo, especializado en historias con contenido sexual explicito (segun el nombre del adaptador).
- Hereda las capacidades generales del modelo base Qwen3-4B: razonamiento, generacion de codigo, matematicas y comprension multilingue, aunque el fine-tuning especifico puede degradar estas habilidades generales.
- No se documenta soporte para tool calling, function calling, agentes ni modo de pensamiento (thinking mode).
- No se especifican capacidades multimodales (vision, audio).
- El modelo base abliterado elimina los rechazos a peticiones consideradas peligrosas o inapropiadas, lo que permite generar contenido que el modelo original bloquearia.

## Casos de uso

- Escritura de ficcion erotica para adultos: el adaptador puede generar relatos con contenido sexual explicito, pero su uso debe limitarse estrictamente a audiencias mayores de edad y con consentimiento explicito.
- Creacion de personajes y dialogos en juegos de rol para adultos: podria integrarse en aplicaciones de entretenimiento para mayores de 18 años, siempre que se implementen filtros de edad y moderacion.
- Investigacion academica sobre modelos de lenguaje sin censura: el adaptador podria utilizarse en estudios sobre alineacion, seguridad y eliminacion de sesgos, aunque su etiqueta "u18" lo hace inadecuado para cualquier investigacion legitima.
- Pruebas de estres de sistemas de moderacion de contenido: se podria emplear para evaluar la robustez de clasificadores de contenido NSFW, pero la presencia de material con menores lo descarta para este fin.
- Desarrollo de herramientas de escritura creativa experimental: en entornos controlados y con supervisión humana, podria explorarse como generador de narrativa transgresora, siempre que se excluya cualquier contenido ilegal.
- No se recomienda ningun caso de uso en produccion, dado el riesgo legal y etico asociado a la etiqueta "u18" y la falta de documentacion sobre el dataset de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estandar para este adaptador. El rendimiento en tareas generales dependerá del modelo base Qwen3-4B, que en su version original obtiene puntuaciones medias en dichos benchmarks, pero el proceso de abliteracion y el fine-tuning NSFW pueden alterar significativamente estas metricas.

## Requisitos de hardware

- Al ser un adaptador LoRA, se carga sobre el modelo base Qwen3-4B. El modelo base en precision FP16 ocupa aproximadamente 8 GB de VRAM, por lo que cabe en GPUs de consumo como la RTX 3060 12 GB, RTX 4070, RTX 3090 o RTX 4090.
- Con cuantizacion de 4 bits (GPTQ o AWQ), el modelo base puede reducirse a unos 3-4 GB, permitiendo su ejecucion en GPUs con 6-8 GB de VRAM.
- El adaptador LoRA anade unos pocos cientos de MB adicionales, despreciables en la practica.
- Para inferencia, se puede usar vLLM, llama.cpp, Ollama o TGI, siempre que soporten la carga de adaptadores PEFT. Unsloth tambien ofrece integracion para este tipo de modelos.
- La latencia tipica para un modelo de 4B en una RTX 4090 es de 20-40 tokens por segundo en FP16, y algo mayor con cuantizacion. No se dispone de mediciones especificas para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| rx1lora/huihui-qwen3-4b-nsfwstory-u18-lora-cp850 (este) | 4B (base) + LoRA | No disponible (base: 32k) | No disponible | PEFT/safetensors | Adaptador LoRA sobre Qwen3-4B abliterado, orientado a NSFW |
| huihui-ai/Huihui-Qwen3-4B-abliterated-v2 | 4B | 32k | Apache 2.0 (Qwen3) | safetensors, GGUF | Modelo base abliterado, sin fine-tuning adicional |
| rx1lora/huihui-qwen3-8b-nsfwstory-u18-lora | 8B (base) + LoRA | No disponible | No disponible | PEFT/safetensors | Variante del mismo autor con modelo base de 8B |
| Qwen3-4B-Instruct-2507 (original) | 4B | 32k | Apache 2.0 | safetensors | Modelo original con censura, sin abliteracion |

No se dispone de datos de rendimiento comparativo entre estos modelos. La comparativa se limita a caracteristicas estructurales.

## Limitaciones y advertencias

- Contenido ilegal: la etiqueta "u18" en el nombre del adaptador sugiere que el modelo puede generar contenido sexual con menores de edad, lo que es ilegal en la mayoria de jurisdicciones y constituye una violacion grave de los derechos de la infancia. Su distribucion y uso pueden acarrear responsabilidades penales.
- Sesgos y alucinaciones: al ser un fine-tuning sobre un modelo abliterado, no se ha realizado ninguna evaluacion de sesgos ni de fiabilidad. El modelo puede producir afirmaciones falsas, incoherentes o daninas con alta confianza.
- Riesgo de uso indebido: la eliminacion de la censura facilita la generacion de contenido violento, discriminatorio o ilegal. No se recomienda su uso sin supervisión humana y sin filtros adicionales.
- Licencia no disponible: no se especifica la licencia del adaptador, lo que genera incertidumbre sobre su uso comercial y su redistribucion. El modelo base Qwen3-4B se distribuye bajo Apache 2.0, pero el adaptador podria tener restricciones adicionales.
- Falta de documentacion: la model card no contiene informacion sobre el dataset de entrenamiento, los hiperparametros, la evaluacion ni el proceso de desarrollo. Esto impide cualquier auditoria de seguridad o calidad.
- Degradacion de capacidades generales: el fine-tuning especializado puede reducir el rendimiento en tareas de razonamiento, codigo o matematicas en comparacion con el modelo base original.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/rx1lora/huihui-qwen3-4b-nsfwstory-u18-lora-cp850
- Modelo base (Huihui-Qwen3-4B-abliterated-v2): https://huggingface.co/huihui-ai/Huihui-Qwen3-4B-abliterated-v2
- Variante del mismo autor (8B): https://huggingface.co/rx1lora/huihui-qwen3-8b-nsfwstory-u18-lora
- Articulo sobre abliteracion y modelos GGUF: https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf
- Herramienta de abliteracion "Heretic": https://github.com/p-e-w/heretic
