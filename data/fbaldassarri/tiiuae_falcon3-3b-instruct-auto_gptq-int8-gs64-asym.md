# fbaldassarri/tiiuae_Falcon3-3B-Instruct-auto_gptq-int8-gs64-asym

## Resumen

El modelo `fbaldassarri/tiiuae_Falcon3-3B-Instruct-auto_gptq-int8-gs64-asym` es una version cuantizada INT8 del modelo instructivo Falcon3-3B-Instruct, desarrollado por el Technology Innovation Institute (TII). La cuantizacion ha sido realizada por fbaldassarri utilizando el framework Intel AutoRound v0.13.1 y el algoritmo AutoGPTQ. El resultado es un modelo de 3B parametros que puede ejecutarse en CPU de Intel, iGPU Arc y NPU de Intel (AI Boost en Core Ultra) mediante OpenVINO. Su relevancia radica en permitir la ejecucion de un modelo de instrucciones de tamano medio en hardware de consumo con un consumo de memoria reducido gracias a la cuantizacion de 8 bits con group size 64 y cuantizacion asimetrica.

La arquitectura es un transformer causal (decoder-only) basado en el diseño de Llama. El modelo original fue entrenado por TII y ajustado para instrucciones, con capacidades de razonamiento, comprension del lenguaje, seguimiento de instrucciones, generacion de codigo y matematicas. Esta version cuantizada mantiene esas capacidades, aunque la precision puede verse ligeramente afectada por la cuantizacion. No se ha especificado la longitud de contexto en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (decoder-only), basado en la arquitectura Llama |
| Parametros totales | no disponible (el modelo base se anuncia como 3B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (AutoGPTQ, group size 64, asimetrico) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantizacion GPTQ/AutoGPTQ) |

## Arquitectura y entrenamiento

El modelo es un transformer causal (decoder-only) que sigue la arquitectura Llama, con capas de atencion y MLP. El modelo base Falcon3-3B-Instruct fue desarrollado por TII y ajustado para instrucciones, pero la informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas como RLHF o DPO. La cuantizacion se realizo con Intel AutoRound v0.13.1, utilizando 128 muestras de calibracion, 200 iteraciones de ajuste, una longitud de secuencia de 512 y un tamano de lote de 4, todo ejecutado en CPU. El metodo de cuantizacion es AutoGPTQ, con 8 bits, group size 64 y cuantizacion asimetrica. La duracion del proceso fue de 18163.3 segundos (302.7 minutos), segun la informacion registrada por el pipeline.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles.
- Razonamiento y comprension del lenguaje.
- Seguimiento de instrucciones en formato chat.
- Generacion de codigo y resolucion de tareas matematicas (segun la descripcion del modelo base).
- No se documenta soporte de tool calling, vision ni audio.
- La cuantizacion INT8 puede afectar ligeramente la precision en comparacion con el modelo original.

## Casos de uso

- Asistentes conversacionales en ingles para entornos con recursos limitados: el modelo puede gestionar conversaciones multi-turno gracias a su naturaleza instructiva y su tamano reducido, lo que permite desplegarlo en CPU o NPU de Intel.
- Generacion de codigo en entornos de desarrollo ligeros: puede integrarse en IDEs o pipelines de CI/CD para autocompletar fragmentos de codigo, aunque su tamano limita la complejidad de los programas.
- Resumen de documentos en ingles: adecuado para procesar textos largos si se usa con una ventana de contexto adecuada, aunque la longitud de contexto no esta especificada.
- Clasificacion de texto y analisis de sentimiento: puede adaptarse con prompts de instrucciones para clasificar correos, resenas o tickets de soporte.
- Chatbots de atencion al cliente en ingles: puede responder preguntas frecuentes y derivar consultas complejas a agentes humanos.
- Tutoria de matematicas y razonamiento: util para generar explicaciones paso a paso de problemas matematicos sencillos.
- Ejecucion en dispositivos edge: gracias a la cuantizacion INT8 y el soporte para OpenVINO, puede ejecutarse en Intel Core Ultra con NPU, permitiendo aplicaciones offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos comparativos de MMLU, HumanEval, GSM8K u otras metricas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no especificadas. El modelo esta optimizado para CPU Intel, iGPU Intel Arc y NPU Intel (AI Boost en Core Ultra) mediante OpenVINO.
- No se especifica si cabe en GPU de consumo.
- Opciones de despliegue: transformers (con AutoGPTQ), intel-extension-for-pytorch, OpenVINO. Otras opciones como vLLM o llama.cpp no estan documentadas para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Falcon3-3B-Instruct (base) | 3B (aprox.) | Ninguna (BF16) | no disponible | Apache 2.0 | HuggingFace |
| Falcon3-3B-Instruct INT8 (este) | 3B (aprox.) | INT8 AutoGPTQ | no disponible | Apache 2.0 | HuggingFace |
| Falcon3-3B-Instruct INT4 | 3B (aprox.) | INT4 AutoGPTQ | no disponible | Apache 2.0 | HuggingFace |

Los datos de contexto y rendimiento no estan disponibles para ninguno de estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo entrenado y afinado unicamente en ingles, lo que limita su uso en otros idiomas.
- La cuantizacion INT8 puede degradar ligeramente la calidad de las respuestas en comparacion con el modelo original en BF16.
- No se han publicado benchmarks, por lo que el rendimiento real en tareas especificas es desconocido.
- El autor declara que el modelo se ha desarrollado solo con fines de investigacion y no ofrece garantia.
- Riesgo de alucinaciones inherente a los modelos de lenguaje.
- Posibles sesgos del modelo base no documentados en la informacion disponible.
- La longitud de contexto no esta especificada, lo que puede limitar el uso en tareas que requieren ventanas largas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fbaldassarri/tiiuae_Falcon3-3B-Instruct-auto_gptq-int8-gs64-asym
- Modelo base: https://huggingface.co/tiiuae/Falcon3-3B-Instruct
- Version INT4 del mismo autor: https://huggingface.co/fbaldassarri/tiiuae_Falcon3-3B-Instruct-auto_gptq-int4-gs64-asym
- Intel AutoRound: https://github.com/intel/auto-round
- Sitio web de Falcon3: https://falconllm.tii.ae/falcon3/index.html
