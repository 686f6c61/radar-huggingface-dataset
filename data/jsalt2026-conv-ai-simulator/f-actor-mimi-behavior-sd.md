# JSALT2026-Conv-AI-Simulator/f-actor-mimi-behavior-sd

## Resumen

F-Actor Mimi es un modelo de conversacion hablada full-duplex construido sobre Llama 3.2-1B-Instruct y el codec Mimi de Sesame/CSM-1B. Lo desarrolla el grupo JSALT2026-Conv-AI-Simulator y se presenta en el articulo "F-Actor: Controllable Conversational Behaviour in Full-Duplex Models" (arXiv:2601.11329), con una extension posterior sobre control de backchannels en modelos full-duplex streameables (arXiv:2609.29418). El problema que aborda es la falta de control explicito sobre el comportamiento conversacional en sistemas de voz: el modelo permite instruir por prompt la voz del hablante, el tema, el comportamiento conversacional (backchanneling, interrupciones) y la iniciacion del dialogo.

La innovacion central es de eficiencia: congela el encoder de audio y solo ajusta el language model, de modo que el entrenamiento requiere unas 2.000 horas de datos y un protocolo de entrenamiento de una sola etapa, sin pretraining a gran escala ni optimizacion multi-etapa. Esto lo hace entrenable bajo restricciones tipicas de recursos academicos. El checkpoint publicado tiene 1.888.073.731 parametros en safetensors (3,8 GB de repositorio) y esta orientado exclusivamente a ingles.

Es relevante ahora porque es, segun sus autores, el primer modelo abierto de voz conversacional full-duplex que sigue instrucciones, con modelo y codigo de entrenamiento liberados para investigación reproducible sobre sistemas de voz controlables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLM decoder-only (Llama 3.2-1B) con encoder de audio congelado (codec Mimi) y Depth Transformer preentrenado de Sesame/CSM-1B; modelo full-duplex |
| Parametros totales | 1.888.073.731 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.2 |
| Formato de pesos | safetensors |
| Modelo base | meta-llama/Llama-3.2-1B-Instruct, sesame/csm-1b |
| Biblioteca | transformers |
| Tamano del repositorio | 3,8 GB |
| Descargas / likes | 22 / 0 |

## Arquitectura y entrenamiento

El modelo combina un LLM decoder-only (Llama 3.2-1B-Instruct) con el codec Mimi de Sesame y un Depth Transformer preentrenado de CSM-1B para la generacion de tokens de audio. La extension descrita en arXiv:2609.29418 sustituye el esquema de audio previo por Mimi junto con ese Depth Transformer preentrenado, lo que permite un modelado streameable de audio full-duplex. El encoder de audio se mantiene congelado durante el ajuste.

El entrenamiento sigue un protocolo de una sola etapa y solo ajusta el language model, con aproximadamente 2.000 horas de datos, sin pretraining a gran escala ni optimizacion multi-etapa. Los autores indican que analizan sistematicamente las decisiones de diseno. No se detallan en la informacion disponible el numero exacto de tokens de texto, la composicion del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Generacion de voz conversacional full-duplex: el modelo puede escuchar y hablar de forma simultanea, no por turnos estrictos.
- Seguimiento de instrucciones para control de la voz del hablante.
- Control del tema de conversacion mediante instrucciones explicitas.
- Control del comportamiento conversacional: backchanneling (asentimientos verbales) e interrupciones.
- Control de la iniciacion del dialogo.
- Modelado de audio mediante codec Mimi y Depth Transformer preentrenado.
- Capacidades multilingues: solo ingles.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision, audio de entrada multimodal distinto del habla o modo thinking: no disponible.

## Casos de uso

- Simulacion de conversaciones habladas para investigacion: el modelo permite generar dialogos full-duplex con comportamientos controlados por prompt, util para estudiar naturalidad e interrupciones en sistemas de voz.
- Agentes conversacionales de voz con backchanneling: se puede instruir al modelo para producir asentimientos verbales en momentos concretos, lo que mejora la sensacion de escucha activa en un asistente telefonico.
- Generacion de datos sinteticos de dialogo hablado: al controlar tema, voz y comportamiento, sirve para crear corpus de entrenamiento o evaluacion de sistemas de dialogo.
- Evaluacion de sistemas de interrupcion y turn-taking: permite generar interrupciones deliberadas para probar la robustez de pipelines de voz full-duplex.
- Prototipos de asistentes de voz en ingles: con 1,8B parametros y pesos safetensors, es viable para experimentacion en entornos con recursos limitados.
- Investigacion reproducible sobre modelos full-duplex: al liberar modelo y codigo de entrenamiento, permite replicar el protocolo de una etapa con encoder congelado y 2.000 horas de datos.
- Control de la iniciacion del dialogo en entornos simulados: util para estudiar como un sistema toma la iniciativa en una conversacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 1,888 mil millones de parametros, en precision completa (fp32) serian necesarios aproximadamente 7,5 GB solo para pesos, y en bf16/fp16 alrededor de 3,8 GB, a lo que hay que sumar el encoder de audio, el Depth Transformer y el estado del codec Mimi.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, el modelo es compatible con GPU consumer de gama media-alta con suficiente memoria, aunque no se confirma en la model card.
- Cabe en GPU consumer: previsiblemente si en funcion de la cuantizacion y del overhead del pipeline de audio, pero no hay datos oficiales.
- Opciones de despliegue: transformers (libreria declarada) y text-generation-inference (tag del repositorio); no se confirman vLLM, llama.cpp, Ollama ni TGI para el pipeline de audio completo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Full-duplex | Control por instrucciones | Idiomas | Licencia |
|---|---|---|---|---|---|---|
| F-Actor Mimi (este modelo) | 1.888.073.731 | no disponible | si | si (voz, tema, backchannel, interrupciones, inicio) | en | llama3.2 |
| meta-llama/Llama-3.2-1B-Instruct | 1,24 mil millones (aprox., segun model card del base) | no disponible | no | no (solo texto) | multilingue | llama3.2 |
| sesame/csm-1b | no disponible | no disponible | no | no disponible | en | no disponible |

La comparacion se limita a los modelos base declarados; no se dispone de datos de rendimiento comparativo ni de otros modelos full-duplex abiertos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; no hay capacidades multilingues declaradas.
- Modelo de investigacion con 22 descargas y 0 likes: no hay evidencia de uso en produccion ni de validacion externa.
- No se han publicado benchmarks, curvas de latencia ni evaluaciones de calidad de voz en la informacion disponible.
- Riesgo de alucinacion y de comportamiento conversacional no deseado inherente a un LLM de 1,8B ajustado sobre Llama 3.2-1B-Instruct; no cuantificado.
- Sesgos conocidos: no documentados en la model card; heredables del modelo base y de los 2.000 horas de datos de entrenamiento, cuya composicion no se detalla.
- Requiere el pipeline completo (encoder de audio, codec Mimi y Depth Transformer) y el codigo del repositorio GitHub para un uso correcto; no es un modelo de texto autonomo.
- Licencia llama3.2: implica las restricciones de la Llama 3.2 Community License, incluidos requisitos de atribucion y condiciones para uso comercial; conviene revisar los terminos antes de desplegarlo.
- Limitaciones de contexto: no se especifica la longitud de contexto, lo que impide planificar conversaciones de larga duracion.
- No hay informacion sobre tool calling ni soporte de agentes, por lo que no debe asumirse en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JSALT2026-Conv-AI-Simulator/f-actor-mimi-behavior-sd
- Codigo de entrenamiento y uso: https://github.com/MaikeZuefle/f-actor
- Paper F-Actor: https://arxiv.org/abs/2601.11329
- Paper sobre control de backchannels: https://arxiv.org/abs/2609.29418
- Modelo base de texto: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Modelo base de audio: https://huggingface.co/sesame/csm-1b
