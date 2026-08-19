# ClankerResearch/SpeakSciences-GGUF

## Resumen

SpeakSciences es un modelo conversacional de 1,88 mil millones de parametros desarrollado por ClankerResearch, publicado en formato GGUF y basado en Qwen/Qwen3.5-2B. Esta disenado para imitar el comportamiento humano en conversaciones de texto, empleando jerga contemporanea cuando el contexto lo requiere, adaptando el tono al interlocutor y ofreciendo explicaciones concisas en lugar de exponer cadenas de razonamiento internas. Segun sus autores, el objetivo no era crear el mejor modelo de chat, sino demostrar lo que es posible con recursos limitados: se entreno durante aproximadamente dos horas en una GPU A100 utilizando la libreria Unsloth.

El modelo es el resultado de un ajuste fino en dos etapas sobre una mezcla de datos propietaria: primero un fine-tuning sobre conversacion general y posteriormente un DPO (Direct Preference Optimization) sobre comportamiento de chat. La version preview de SpeakSciences, entrenada sobre Qwen3.6-27B, se probo en un servidor real de Discord y produjo resultados indistinguibles de los humanos, segun afirman los autores. La version final del modelo y el codigo de entrenamiento se publicaran proximamente. Este repositorio contiene la version GGUF de la preview.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen/Qwen3.5-2B) |
| Parametros totales | 1.881.825.088 (aproximadamente 1,88 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No especificados (formato GGUF; el tamano del repo de 1,3 GB sugiere cuantizaciones de baja precision) |
| Idiomas soportados | No disponibles |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen/Qwen3.5-2B, un transformer denso de aproximadamente 1,88 mil millones de parametros. No se dispone de detalles sobre la arquitectura interna del modelo base (numero de capas, cabezas de atencion, dimension del embedding, tipo de atencion, etc.) en la informacion proporcionada.

El entrenamiento consistio en un ajuste fino en dos etapas: primero un fine-tuning sobre conversacion general y posteriormente un DPO sobre comportamiento de chat. Los datos de entrenamiento provienen de una mezcla propietaria no publica. El entrenamiento se realizo en una GPU A100 durante aproximadamente dos horas utilizando la libreria Unsloth, tanto para el entrenamiento como para la inferencia. El codigo de entrenamiento se abrira en la version final del modelo. No se ha publicado informacion sobre el numero de tokens de entrenamiento ni la composicion detallada del dataset.

## Capacidades

- Generacion de texto conversacional: disenado para mantener conversaciones de texto con estilo humano, empleando jerga contemporanea cuando el contexto lo requiere.
- Adaptacion de tono: ajusta el registro y el estilo segun el contexto de la conversacion.
- Explicaciones concisas: proporciona respuestas breves en lugar de exponer cadenas de razonamiento internas (chain-of-thought).
- Conversaciones complejas multi-turno: entrenado especificamente para conversaciones de texto complejas y prolongadas.
- No se dispone de informacion sobre soporte de tool calling, function calling, agentes, vision, audio u otras capacidades especiales.

## Casos de uso

- Bot de chat en servidores de Discord: el modelo puede integrarse como bot en canales de Discord u otras plataformas de mensajeria, manteniendo conversaciones naturales con los usuarios. Su tamano reducido y formato GGUF permiten desplegarlo en hardware modesto con llama.cpp u Ollama.
- Simulacion de conversaciones humanas para investigacion: util para estudios de interaccion humano-maquina donde se necesite un interlocutor que imite el estilo de escritura humano, como evaluaciones de Turing o pruebas de usabilidad.
- Generacion de respuestas sugeridas en aplicaciones de mensajeria: puede usarse como motor de autocompletado o respuestas rapidas en apps de chat, gracias a su baja latencia esperada en hardware de consumo.
- Prototipado rapido de asistentes conversacionales: su licencia MIT y su tamano reducido lo hacen adecuado para experimentar sin coste de API ni restricciones de uso, permitiendo validar conceptos antes de escalar a modelos mayores.
- Generacion de datos sinteticos de conversacion: puede emplearse para generar datasets de dialogo que sirvan para entrenar o evaluar otros modelos, aunque conviene validar la calidad de las respuestas antes de usarlas como datos de entrenamiento.
- Caso de estudio para fine-tuning con recursos limitados: el modelo demuestra que es posible obtener resultados conversacionales con solo dos horas de entrenamiento en una A100, lo que lo convierte en un ejemplo de referencia para equipos con presupuesto reducido que quieran replicar el pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los autores indican que los resultados estan "proximamente" y que compararan el modelo en el benchmark FitnaBench, un benchmark open-source. La version final del modelo incluira estos datos.

## Requisitos de hardware

- El repositorio GGUF ocupa 1,3 GB, lo que sugiere cuantizaciones de baja precision (probablemente Q4 o similar) que caben en GPUs de consumo con 4-8 GB de VRAM.
- El modelo base tiene 1,88 mil millones de parametros: en FP16 ocuparia aproximadamente 3,8 GB, y en cuantizaciones Q4 entre 1 y 1,5 GB.
- Compatible con GPUs consumer como RTX 3060, RTX 4060 o RTX 4090, asi como con hardware Apple Silicon mediante llama.cpp.
- Al ser formato GGUF, es compatible con llama.cpp, Ollama, LM Studio y otros motores de inferencia que soporten este formato.
- No se dispone de datos de latencia o throughput medidos por los autores.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa. El modelo base Qwen/Qwen3.5-2B es el punto de referencia natural, pero no se han publicado resultados comparativos. Otros modelos conversacionales de tamano similar (1-3 mil millones de parametros) como Qwen2.5-1.5B-Instruct o Llama-3.2-1B-Instruct podrian ser comparables, pero no se dispone de datos de rendimiento del modelo en benchmarks estandarizados para establecer una comparacion objetiva.

## Limitaciones y advertencias

- El modelo es una preview: los autores indican explicitamente que la version final se publicara proximamente, por lo que el comportamiento actual puede diferir del modelo final.
- Los datos de entrenamiento son propietarios y no publicos, lo que dificulta la auditoria de sesgos y la reproducibilidad.
- No se han publicado benchmarks, por lo que el rendimiento real en tareas estandarizadas es desconocido.
- No se dispone de informacion sobre la longitud de contexto soportada, lo que supone un riesgo para aplicaciones que requieran contextos largos.
- Los idiomas soportados no estan documentados; el modelo base Qwen3.5-2B es presumiblemente multilingue, pero no esta confirmado para este ajuste fino.
- El modelo esta optimizado para conversaciones de texto informales (jerga, tono adaptativo), por lo que puede no ser adecuado para tareas formales o tecnicas.
- Riesgo de alucinacion no evaluado: sin benchmarks ni evaluaciones publicas, el riesgo de generar informacion incorrecta es desconocido.
- La licencia MIT permite uso comercial sin restricciones, pero al ser una preview, su uso en produccion implica asumir riesgos de estabilidad y calidad no verificados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ClankerResearch/SpeakSciences-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
