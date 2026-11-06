# fbaldassarri/allenai_Llama-3.1-Tulu-3-8B-SFT-auto_gptq-int8-gs64-sym

## Resumen

Este repositorio contiene una version cuantizada a INT8 del modelo allenai/Llama-3.1-Tulu-3-8B-SFT, publicado por el usuario fbaldassarri. Se trata de un artefacto derivado, no de un modelo original: aplica cuantizacion de solo pesos (WoQ) mediante el algoritmo GPTQ implementado en Intel AutoRound v0.16.0, con 8 bits, tamano de grupo 64 y cuantizacion simetrica. El objetivo es reducir la huella de memoria del modelo base para facilitar su inferencia en hardware Intel, en concreto CPU, iGPU Arc mediante intel-extension-for-pytorch y NPU AI Boost de la serie Core Ultra mediante OpenVINO.

El modelo subyacente, Llama-3.1-Tulu-3-8B-SFT, es un ajuste fino supervisado de Llama 3.1 8B desarrollado por el Allen Institute for AI (AI2) dentro de la familia Tulu 3, orientada a instrucciones, conversacion y razonamiento. La arquitectura es un transformer causal de tipo Llama con 8.030 millones de parametros nominales; el checkpoint cuantizado declara 2.933.395.456 parametros en sus ficheros safetensors, lo que refleja el empaquetado de los pesos INT8 (dos valores por byte) junto con los metadatos de escalas y ceros.

La relevancia de este artefacto es practica: permite ejecutar un modelo de 8B en equipos sin GPU dedicada de gran VRAM, a costa de una perdida de precision que el autor no cuantifica. El repositorio tiene un uso muy limitado (15 descargas, 0 likes) y no incluye evaluaciones de calidad tras la cuantizacion, por lo que debe tratarse como un experimento de despliegue mas que como una alternativa validada al modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo Llama (model_type: llama) |
| Parametros totales | 8.030 millones en el modelo base; 2.933.395.456 declarados en safetensors del checkpoint cuantizado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.1 soporta 128.000 tokens) |
| Tipos de cuantizacion | INT8 solo pesos (WoQ), GPTQ via Intel AutoRound; group_size 64, simetrica |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con configuracion GPTQ (auto_gptq); no se ofrece GGUF |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia Llama 3.1, con atencion causal estandar y 8.030 millones de parametros. Sobre esa base, AI2 aplico un ajuste fino supervisado (SFT) para producir Llama-3.1-Tulu-3-8B-SFT, orientado a seguir instrucciones y mantener conversaciones multi-turno con plantilla de chat propia. No se dispone en la informacion proporcionada del numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas posteriores de RLHF o DPO en este checkpoint concreto (la familia Tulu 3 incluye variantes posteriores a SFT, pero este repositorio parte explicitamente del checkpoint SFT).

La innovacion tecnica de este artefacto es la cuantizacion. Se uso Intel AutoRound 0.16.0 con carga del modelo en torch.bfloat16 y calibracion en CPU: 128 muestras, 200 iteraciones de ajuste, longitud de secuencia 512 y batch de 4. El proceso completo registro una duracion de 41.724,8 segundos (unas 11,6 horas) y finalizo el 27 de octubre de 2026. El resultado se exporta en formato auto_gptq, lo que permite cargarlo con transformers y ejecutarlo con kernels compatibles, incluido el stack de Intel para CPU, iGPU Arc y NPU. No se documenta ninguna tecnica adicional como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles con plantilla de chat integrada (apply_chat_template).
- Seguimiento de instrucciones derivado del ajuste SFT del modelo Tulu 3.
- Razonamiento de varios pasos y respuesta a preguntas, heredado del modelo base.
- Generacion de codigo y matematicas basicas, segun las capacidades del Llama 3.1 8B subyacente (no verificadas tras la cuantizacion).
- Soporte de tool calling y function calling: no confirmado en la informacion proporcionada para este checkpoint SFT concreto.
- Capacidades de agente y multi-step reasoning: no confirmadas de forma especifica.
- Multilingue: limitado a ingles segun la etiqueta de idioma del repositorio.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Despliegue en equipos Intel sin GPU dedicada: el modelo esta cuantizado explicitamente para CPU, iGPU Arc y NPU AI Boost de Core Ultra, de modo que puede ejecutarse en portatiles y mini-PC con intel-extension-for-pytorch u OpenVINO sin necesidad de una tarjeta grafica de gran VRAM.
- Asistente conversacional local en ingles: gracias a la plantilla de chat y al ajuste SFT, puede gestionar dialogos multi-turno en aplicaciones de escritorio o herramientas internas que requieran privacidad y no puedan enviar datos a la nube.
- Prototipado de pipelines de generacion de texto: util para validar integraciones con transformers y TGI antes de pasar a un modelo mayor o a una version sin cuantizar.
- Evaluacion comparativa de cuantizacion: sirve como referencia para medir la perdida de calidad de INT8 gs64 frente al checkpoint original en tareas propias, dado que el autor no publica metricas.
- Generacion de codigo en entornos de desarrollo locales: el modelo base tiene capacidad de programacion; en este formato puede integrarse en asistentes de IDE que corran en hardware Intel modesto, aceptando la perdida de precision.
- Educacion e investigacion: permite estudiar el efecto de AutoRound y GPTQ en un modelo de 8B sobre hardware de consumo, con una receta de replicacion completa y reproducible documentada por el autor.
- Inferencia en el borde (edge): la combinacion de INT8 y soporte OpenVINO facilita desplegar el modelo en dispositivos con NPU, aunque el rendimiento real no esta documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de perplejidad tras la cuantizacion, ni comparaciones con el checkpoint original.

## Requisitos de hardware

- VRAM/RAM estimada: al ser INT8 con group_size 64, los pesos ocupan aproximadamente 8 GB, mas las escalas y ceros por grupo y el overhead de activaciones y cache KV; el repositorio pesa 11,5 GB, lo que da una idea del espacio en disco necesario.
- GPU dedicada: no es el objetivo declarado del artefacto; puede cargarse en GPUs con al menos 10-12 GB de memoria, pero el autor lo orienta a hardware Intel.
- CPU Intel: soportado mediante intel-extension-for-pytorch.
- iGPU Intel Arc: soportado mediante intel-extension-for-pytorch.
- NPU Intel AI Boost (Core Ultra): soportado mediante OpenVINO.
- GPU de consumo: cabe en tarjetas con 12 GB o mas (por ejemplo, RTX 3060 12 GB, RTX 4070), aunque sin garantias de rendimiento optimo con los kernels GPTQ.
- Opciones de despliegue: transformers, text-generation-inference (etiqueta presente en el repositorio), intel-extension-for-pytorch y OpenVINO. No se ofrece GGUF, por lo que llama.cpp y Ollama no son compatibles de forma directa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fbaldassarri/allenai_Llama-3.1-Tulu-3-8B-SFT-auto_gptq-int8-gs64-sym | 8B (2,93B declarados en safetensors) | no disponible | INT8 GPTQ gs64 simetrica | apache-2.0 | Hugging Face, 15 descargas |
| allenai/Llama-3.1-Tulu-3-8B-SFT (original) | 8B | 128.000 tokens (Llama 3.1) | bf16/fp16 | apache-2.0 | Hugging Face, modelo de referencia |
| Llama 3.1 8B Instruct (Meta) | 8B | 128.000 tokens | bf16/fp16, multiples cuantizaciones comunitarias | Llama 3.1 Community License | Hugging Face, amplia adopcion |

La comparativa de rendimiento no esta disponible: no hay benchmarks publicados para este checkpoint cuantizado ni datos que permitan medir la degradacion frente al original.

## Limitaciones y advertencias

- Artefacto derivado y de bajo uso: 15 descargas y 0 likes; no ha sido validado por la comunidad ni por el autor del modelo base.
- Sin evaluacion de calidad: no se publican metricas que cuantifiquen la perdida de precision por la cuantizacion INT8 con group_size 64.
- Solo ingles: la etiqueta de idioma del repositorio es exclusivamente en, por lo que no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de 8B, agravado potencialmente por la cuantizacion; requiere verificacion en produccion.
- Sesgos: no documentados en la informacion proporcionada; el modelo base Llama 3.1 puede reproducir sesgos de sus datos de entrenamiento.
- Licencia: apache-2.0 segun el repositorio, pero conviene verificar la licencia del modelo base y de los datos de Tulu 3 antes de un uso comercial.
- Compatibilidad limitada: el formato auto_gptq no es directamente compatible con llama.cpp, Ollama ni GGUF; el despliegue requiere transformers, TGI o el stack de Intel.
- Advertencia del autor: el modelo se distribuye sin garantia y declarado solo para fines de investigacion.
- Contexto: no se confirma en la informacion proporcionada que la ventana de 128.000 tokens del modelo base se preserve intacta tras la cuantizacion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fbaldassarri/allenai_Llama-3.1-Tulu-3-8B-SFT-auto_gptq-int8-gs64-sym
- Modelo base: https://huggingface.co/allenai/Llama-3.1-Tulu-3-8B-SFT
- Intel AutoRound (framework de cuantizacion): https://github.com/intel/auto-round
- Receta de replicacion (auto-round-pipeline): https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
