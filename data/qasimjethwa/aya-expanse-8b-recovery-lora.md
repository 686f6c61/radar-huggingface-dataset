# qasimjethwa/aya-expanse-8b-recovery-lora

## Resumen

`qasimjethwa/aya-expanse-8b-recovery-lora` es un adaptador LoRA de ajuste fino supervisado (SFT) sobre el modelo base `CohereLabs/aya-expanse-8b`, un transformer denso de 8.000 millones de parametros desarrollado por Cohere Labs. El adaptador lo publica Qasim Jethwa en el contexto del Lexsi AI Safety & Alignment Hackathon, Track 3 (Agentic Fine-tuning), y su objetivo concreto es mejorar la fiabilidad del uso de herramientas (tool calling) en tareas de recuperacion de pagos fallidos.

El problema que aborda es acotado pero representativo de la produccion agentica: un agente debe emitir, ante un pago fallido y su causa diagnosticada, una secuencia ordenada de llamadas a herramientas en formato JSON, sin comentarios ni texto adicional, y con argumentos correctos. Para generar los datos de entrenamiento se emplea un motor de reglas determinista (el proyecto Recovery Copilot del propio autor) que produce casos cuya respuesta correcta se conoce por construccion, lo que permite auditar al agente contra una verdad de referencia objetiva.

La relevancia del artefacto es metodologica mas que de rendimiento: es un ejemplo de destilacion de un motor de reglas hacia un modelo generativo mediante LoRA, con un esquema de evaluacion before/after sobre 128 casos retenidos. En el momento de redactar esta ficha, los resultados de esa evaluacion estan marcados como pendientes en la model card, por lo que no existe evidencia publicada de la mejora obtenida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only denso (modelo base Aya Expanse 8B) |
| Parametros totales | no disponible (el adaptador ocupa 0,2 GB; el modelo base declara 8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible en la informacion proporcionada (el modelo base Aya Expanse 8B es multilingue, pero el adaptador no declara idiomas) |
| Licencia | apache-2.0 segun la model card; el campo de licencia del repo figura como no disponible |
| Formato de pesos | safetensors (adaptador LoRA, libreria `peft`) |

## Arquitectura y entrenamiento

El adaptador aplica LoRA con rango 16, alpha 32 y dropout 0,05 sobre las proyecciones q, k, v, o, gate, up y down del modelo base. El entrenamiento usa perdida solo sobre la completacion (completion-only loss), 3 epocas, learning rate 1e-4 con scheduler coseno y precision bf16. Se ejecuto en una unica NVIDIA L40S mediante HF Jobs: 75 pasos, 423 segundos de tiempo de ejecucion. Las metricas reportadas son train_loss 0,1653, mean_token_accuracy 0,9946 y perdida del checkpoint final 0,0126.

Los datos son 400 casos sinteticos de tool calling generados por el motor de reglas Recovery Copilot, con 50 casos por cada uno de los 8 motivos de fallo de pago, y se publican en el dataset `qasimjethwa/recovery-copilot-toolcalls`. La innovacion tecnica no esta en la arquitectura sino en el pipeline de datos: al provenir de un motor determinista, cada ejemplo tiene una respuesta correcta verificable por construccion, y el mismo motor sirve como juez en la evaluacion. El prompt de sistema fuerza una salida consistente en una lista JSON de objetos con claves `tool` y `arguments`, sin comentarios.

## Capacidades

- Generacion de llamadas a herramientas en formato JSON estructurado para planes de recuperacion de pagos, con orden de ejecucion y argumentos.
- Razonamiento de un solo paso sobre un diagnostico de fallo ya proporcionado: el modelo no diagnostica, selecciona y ordena el plan de recuperacion.
- Seguimiento estricto de instrucciones de formato (salida solo JSON, sin texto adicional), reforzado por el prompt de sistema y por el entrenamiento SFT.
- Generacion de texto conversacional y multilingue heredada del modelo base Aya Expanse 8B, aunque el adaptador no declara idiomas ni se entreno para conversacion abierta.
- No se documenta soporte de agentes multi-paso con memoria, vision, audio ni modo de razonamiento extendido (thinking) en la informacion disponible.

## Casos de uso

- Recuperacion de pagos fallidos en un flujo de cobro: dado un fallo y su causa diagnosticada, el adaptador emite la secuencia de herramientas (por ejemplo, reintento, actualizacion de metodo de pago, notificacion) en el orden correcto y con argumentos validables.
- Automatizacion de dunning en SaaS o suscripciones: integrado detras de un orquestador que valida el JSON contra los esquemas de herramientas, reduce la logica de negocio codificada a mano para los 8 motivos de fallo cubiertos.
- Generacion de plantillas de accion para agentes de soporte: el modelo produce el plan de recuperacion que un operador humano revisa antes de ejecutar, gracias a la salida estructurada y determinista (`do_sample=False`).
- Evaluacion y test de pipelines agenticos: sirve como modelo de referencia para comparar la fiabilidad de tool calling frente al modelo base sin ajustar en el mismo harness de evaluacion.
- Prototipado rapido de agentes de dominio acotado: el patron (motor de reglas como generador de datos y como juez) es reutilizable para otros dominios con respuestas verificables, y este adaptador sirve de plantilla.
- Investigacion en alineacion y seguridad de agentes: el caso encaja en un track de fine-tuning agentico y permite estudiar la tasa de llamadas invalidas y el exito end-to-end por motivo de fallo.

## Benchmarks y rendimiento

La model card define cuatro metricas (exact-match de la llamada, precision de argumentos, tasa de llamadas invalidas y exito end-to-end) sobre 128 casos retenidos, comparando el modelo base en zero-shot con el adaptador. En la informacion proporcionada todas las celdas figuran como `pending`, con la evaluacion en curso a fecha de 8 de noviembre de 2026.

| Metrica | Base (Aya Expanse 8B, zero-shot) | Ajustado (este adaptador) |
|---|---|---|
| Exact-match de la llamada a herramienta | pendiente | pendiente |
| Precision de argumentos | pendiente | pendiente |
| Tasa de llamadas invalidas | pendiente | pendiente |
| Exito end-to-end de la tarea | pendiente | pendiente |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: el adaptador pesa 0,2 GB, pero requiere cargar el modelo base de 8B. En bf16 se estiman aproximadamente 16 GB de pesos mas overhead de activaciones y cache KV; en cuantizacion de 8 bits, alrededor de 8-9 GB; en 4 bits, alrededor de 5-6 GB (estimaciones, no publicadas por el autor).
- GPU recomendadas: el entrenamiento se realizo en una NVIDIA L40S (48 GB). Para inferencia, una A100 o H100 permiten bf16 sin cuantizar con margen; una RTX 4090 (24 GB) es suficiente en bf16 para contextos moderados.
- GPU de consumo: cabe en RTX 4090 y, con cuantizacion de 4 bits, en GPUs de 8-12 GB como RTX 4070 o RTX 3060 de 12 GB, sujeto a la longitud de contexto efectiva.
- Despliegue: la via documentada es `transformers` + `peft` (`PeftModel.from_pretrained`). No se documentan recetas para vLLM, TGI, llama.cpp u Ollama; la fusion del adaptador en el modelo base (merge) seria el paso previo para servidores de alto throughput.
- Latencia y throughput: no disponibles. Como referencia del entrenamiento, 75 pasos en 423 segundos en una L40S; no se reportan metricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aya-expanse-8b-recovery-lora (este) | 8B base + LoRA r=16 | no disponible | SFT de tool calling en dominio de recuperacion de pagos | apache-2.0 (segun model card) | Hugging Face, 0 descargas |
| CohereLabs/aya-expanse-8b | 8B | no disponible en la informacion proporcionada | Modelo base multilingue de proposito general | no disponible en la informacion proporcionada | Hugging Face (gated) |
| Alternativas de tool calling de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento de ninguno de los modelos comparados en la informacion proporcionada, por lo que la comparativa se limita a aspectos estructurales.

## Limitaciones y advertencias

- Distribucion sintetica y mono-dominio: 8 motivos de fallo de pago y mensajes generados por plantilla; no se reclama transferencia a trafico de pagos real.
- Evaluacion incompleta: las metricas before/after estan pendientes; no hay evidencia publicada de que el adaptador supere al modelo base.
- El adaptador no diagnostica el fallo: asume que la causa se le proporciona en la entrada.
- Riesgo de alucinacion en los argumentos de las herramientas si la entrada se desvia del formato de plantilla visto en entrenamiento; requiere validacion contra esquemas JSON en produccion.
- Sesgos: no documentados por el autor; al entrenarse solo con datos del motor de reglas, puede heredar sus sesgos de politica de recuperacion.
- Licencia: la model card declara apache-2.0, pero el campo de licencia del repositorio figura como no disponible y el modelo base es de acceso restringido (gated); conviene verificar los terminos del modelo base antes de un uso comercial.
- El adaptador no se puede usar sin el modelo base, que requiere aceptar su licencia en Hugging Face.
- Sin adopcion verificable: 0 descargas y 0 likes en el momento de la consulta; es un artefacto de hackathon, no un modelo validado en produccion.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/qasimjethwa/aya-expanse-8b-recovery-lora
- Modelo base: https://huggingface.co/CohereLabs/aya-expanse-8b
- Dataset de entrenamiento: https://huggingface.co/datasets/qasimjethwa/recovery-copilot-toolcalls
- Repositorio Recovery Copilot: https://github.com/qasimjethwa/Failed-payment-recovery
- Perfil del autor en Hugging Face: https://huggingface.co/qasimjethwa
