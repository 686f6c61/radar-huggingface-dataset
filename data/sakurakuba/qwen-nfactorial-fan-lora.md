# sakurakuba/qwen-nfactorial-fan-lora

## Resumen

qwen-nfactorial-fan-lora es un adaptador LoRA publicado por el usuario sakurakuba sobre el modelo base unsloth/qwen2.5-1.5b-instruct-unsloth-bnb-4bit. No se trata de un modelo completo, sino de un ajuste fino ligero que se apoya en la familia Qwen2.5 de Alibaba, en concreto en la variante instruct de 1.500 millones de parametros, cuantizada en 4 bits con bitsandbytes y redistribuida por Unsloth.

El repositorio ocupa apenas 0,1 GB y contiene los pesos del adaptador en formato safetensors junto con la configuracion necesaria para cargarlo con transformers y PEFT. La model card es minima: no documenta el conjunto de datos de entrenamiento, el numero de tokens vistos, el rango o el alpha del adaptador, ni el objetivo concreto del ajuste, y el nombre del repositorio no se explica en ningun sitio.

Su relevancia practica es acotada. Sirve como ejemplo reproducible de un flujo de ajuste fino rapido con Unsloth y TRL sobre un modelo pequeno, y como objeto de inspeccion para quien quiera estudiar un adaptador LoRA de bajo coste. En el momento de la consulta acumula 0 descargas y 0 valoraciones, y no se han publicado evaluaciones de ningun tipo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con adaptador LoRA; base Qwen2.5-1.5B-Instruct |
| Parametros totales | ~1,5 mil millones en el modelo base; el adaptador anade una fraccion no especificada (repositorio de 0,1 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32 768 tokens, heredados del modelo base Qwen2.5-1.5B-Instruct; no se confirma en la model card |
| Tipos de cuantizacion | base distribuida en bnb-4bit; adaptador en safetensors, cargable en 4, 8 y 16 bits; no se publican GGUF, AWQ ni GPTQ |
| Idiomas soportados | en (ingles), segun los tags del repositorio |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia Qwen2.5, con normalizacion RMSNorm, activacion SwiGLU, embeddings rotatorios (RoPE) y atencion con consultas agrupadas (GQA), lo que reduce el coste de la cache KV frente a atencion multi-cabeza completa. Sobre esa arquitectura se ha entrenado un adaptador LoRA de rango y alpha desconocidos, que modifica un subconjunto de las matrices de proyeccion sin alterar el resto de los pesos.

El entrenamiento se realizo con Unsloth y TRL, segun los tags y el texto de la model card, que afirma que el modelo se entreno "2x mas rapido" con Unsloth. No hay informacion sobre el dataset, el numero de tokens, el numero de epocas, la tasa de aprendizaje, la composicion de los datos ni si hubo una fase de alineacion adicional (RLHF, DPO u otra) despues del ajuste. Tampoco se documenta ninguna innovacion tecnica propia del autor mas alla del uso del pipeline estandar de Unsloth para QLoRA.

## Capacidades

- Generacion de texto e instrucciones en ingles, heredadas del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento basico y matematicas elementales, limitado por el tamano del modelo.
- Generacion de codigo sencillo (funciones cortas, scripts) con calidad propia de un modelo de 1,5B.
- Conversacion multiturno en ingles con el formato de chat de Qwen2.5.
- Salida estructurada tipo JSON de forma aproximada, sin garantia de validez sintactica.
- Soporte de tool calling y function calling: el modelo base Qwen2.5-Instruct lo incluye, pero no hay confirmacion de que el adaptador lo preserve.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion disponible.
- Capacidades multilingues: los tags declaran unicamente ingles; el modelo base soporta mas idiomas, pero no se puede asumir que el adaptador los mantenga.
- Vision, audio y modo de razonamiento explicito (thinking): no disponibles.

## Casos de uso

- Prototipado con recursos minimos: el adaptador se carga sobre una base de 1,5B en 4 bits, por lo que puede ejecutarse en portatiles con GPU integrada o incluso en CPU para validar un pipeline antes de escalar a un modelo mayor.
- Clasificacion y etiquetado por lotes: tareas de analisis de sentimiento, deteccion de intencion o categorizacion de tickets en ingles, donde la latencia importa mas que la profundidad del razonamiento.
- Extraccion de informacion a JSON: conversion de correos o mensajes breves en campos estructurados, con validacion posterior obligatoria del esquema.
- Asistentes de dominio acotado: chatbots de FAQ o soporte interno en ingles cuyo alcance tematico se limita a un conjunto pequeno de documentos.
- Resumen de textos cortos: condensacion de parrafos o hilos de mensajes, no de documentos largos, dado el tamano del modelo.
- Generacion de material educativo: creacion de preguntas de practica, ejercicios o variaciones de enunciados en ingles a partir de una plantilla.
- Estudio de metodos de ajuste fino: comparacion de rangos LoRA, tasas de aprendizaje o tamanos de dataset usando este adaptador como referencia reproducible sobre una base publica.
- Preprocesado dentro de un pipeline mayor: filtrado, normalizacion o reformulacion de texto antes de pasarlo a un modelo mas grande, reduciendo el coste por peticion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y la busqueda web realizada no devolvio fuentes tecnicas relacionadas con este repositorio.

## Requisitos de hardware

- Espacio en disco: 0,1 GB para el adaptador, mas el modelo base (aproximadamente 1 GB en la version bnb-4bit y 3,1 GB en fp16).
- VRAM estimada en inferencia: alrededor de 1,5-2 GB con el adaptador cargado sobre la base en 4 bits, incluyendo overhead de la cache KV; en torno a 4-5 GB si se fusiona el adaptador y se sirve en fp16.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas, como RTX 3060, RTX 4060, RTX 2070 o superiores; en el segmento profesional, cualquier A100, H100, L4 o T4 sobra para este tamano.
- Cabe en GPU consumer: si, en practicamente todas las tarjetas graficas dedicadas de los ultimos seis anos, y tambien en equipos con memoria unificada tipo Apple Silicon.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador, vLLM con soporte de adaptadores LoRA, y TGI, ya que el repositorio incluye el tag text-generation-inference. Para Ollama o llama.cpp habria que convertir el modelo fusionado a GGUF, y no se publica ninguna conversion de ese tipo.
- Latencia y throughput: no documentados. No hay mediciones publicadas por el autor ni datos de la busqueda web.

## Comparativa con modelos similares

Los datos de la columna del modelo base y de las alternativas provienen de la documentacion publica de cada modelo, no de benchmarks ejecutados sobre este adaptador.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| qwen-nfactorial-fan-lora (este) | ~1,5B de base mas adaptador LoRA | 32 768 (heredado del base) | apache-2.0 | repositorio en HuggingFace con 0 descargas |
| Qwen2.5-1.5B-Instruct | 1,54B | 32 768 | apache-2.0 | ampliamente disponible |
| SmolLM2-1.7B-Instruct | 1,7B | 8 192 | apache-2.0 | disponible en HuggingFace |
| Llama-3.2-1B-Instruct | 1,24B | 128 000 | Llama 3.2 Community License | disponible en HuggingFace |
| Gemma-2-2B-it | 2,6B | 8 192 | Gemma Terms of Use | disponible en HuggingFace |

No hay datos de rendimiento comparado para este adaptador, por lo que la eleccion frente a estas alternativas solo puede justificarse por licencia, tamano o coste de despliegue, nunca por calidad medida.

## Limitaciones y advertencias

- No se documenta el dataset de entrenamiento, por lo que se desconoce que comportamientos ha reforzado o degradado el ajuste respecto al modelo base.
- Riesgo elevado de alucinacion: los modelos de 1,5B generan con frecuencia afirmaciones plausibles pero falsas, especialmente en tareas de conocimiento factual.
- Modelo unicamente en ingles segun los tags; el uso en castellano no esta respaldado por ninguna prueba y probablemente degrade la calidad.
- La ventana de 32 768 tokens es la del modelo base, pero la calidad de atencion en contextos largos en un modelo de este tamano cae de forma notable; conviene trabajar con contextos de pocos miles de tokens.
- La base esta cuantizada en 4 bits (bnb-4bit), lo que puede introducir perdida de precision adicional al cargar el adaptador en QLoRA.
- Licencia apache-2.0 en este repositorio, pero el uso comercial depende tambien de la licencia del modelo base y de Unsloth; conviene verificarlas antes de desplegar.
- El repositorio no tiene descargas ni validacion de la comunidad, por lo que no existe evidencia externa de que el adaptador funcione como se espera.
- No se publican conversiones a GGUF, AWQ ni GPTQ, lo que limita el despliegue en entornos de inferencia optimizados sin trabajo adicional de conversion y validacion.
- No hay informacion sobre sesgos especificos; se heredan los del modelo base Qwen2.5 y los del corpus de ajuste, desconocido en este caso.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/sakurakuba/qwen-nfactorial-fan-lora
- Modelo base: https://huggingface.co/unsloth/qwen2.5-1.5b-instruct-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Organizacion Qwen en HuggingFace: https://huggingface.co/Qwen
- Repositorio de TRL: https://github.com/huggingface/trl

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo. Todos los enlaces recuperados correspondian a servicios de correo de Microsoft Outlook y no guardan relacion con el repositorio, por lo que se han descartado.
