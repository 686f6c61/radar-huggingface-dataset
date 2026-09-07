# Enriqueag26/Qwen3.8-27B-switchboard-lora-v2

## Resumen

El modelo `Enriqueag26/Qwen3.8-27B-switchboard-lora-v2` es un adaptador LoRA publicado como checkpoint intermedio (work in progress) por el usuario Enriqueag26. Su objetivo es transformar el modelo denso multimodal `Qwen/Qwen3.8-27B` en un agente de atención al cliente que opera herramientas (tool calling) manteniendo un registro hablado de teléfono, sin activar el modo de razonamiento (`thinking`) y sin generar markdown ni listas. El adaptador está diseñado para conversaciones en inglés y español, con un estilo de voz natural que precede cada llamada a herramientas con una frase corta hablada.

El adaptador tiene 435 millones de parámetros (r=64, alpha=128) y se aplica a las proyecciones de atención, MLP y Gated-DeltaNet del modelo base. El modelo base, Qwen3.8-27B, es un modelo denso de 27.000 millones de parámetros con soporte de visión y lenguaje, y una ventana de contexto de 262.144 tokens según la configuración de despliegue utilizada por el autor. El entrenamiento se realizó sobre trayectorias bancarias sintéticas y trazas de llamadas telefónicas, con una metodología de decontaminación frente al conjunto de test. La licencia es Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3.8-27B (transformer denso con Gated-DeltaNet) |
| Parametros totales | 27.000 millones (modelo base) + 435 millones (adaptador LoRA) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | No especificado para el adaptador; el modelo base admite cuantizacion estandar (no validada con este adaptador) |
| Idiomas soportados | Ingles, espanol |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre el modelo base Qwen3.8-27B, que según la documentacion oficial de Qwen es un modelo denso de tipo vision-language con control flexible de razonamiento. El adaptador LoRA (r=64, alpha=128) se aplica a las proyecciones de atencion, a las capas MLP y a las proyecciones Gated-DeltaNet, lo que sugiere que el modelo base emplea una arquitectura hibrida con capas de atencion lineal. El entrenamiento se realizo con el chat template de Qwen3.8 con `enable_thinking=False`, usando 954 ventanas de hasta 16.000 tokens, 2 epocas, learning rate coseno de 1e-4 y acumulacion de gradientes de 64.000 tokens. La perdida de desarrollo paso de 0,564 a 0,369 en la epoca 1 y a 0,387 al final de la epoca 2.

El conjunto de entrenamiento incluye 168 trayectorias bancarias multi-turno verificadas (tareas sinteticas del dominio `banking_knowledge` de tau2/tau3-bench, destiladas de Qwen3.8-Max y GLM-5.3, con verificacion dorada por estado final de base de datos) y 182 trazas de llamadas telefonicas sinteticas en espanol e ingles (banca, telecomunicaciones y retail) que cubren captura y validacion de identificadores (DNI, NIE, pasaporte, IBAN, numeros de telefono) con lectura en grupos, letra por palabra y errores simulados de reconocimiento de voz. Todas las respuestas de texto del asistente fueron reescritas en registro hablado, y las llamadas a herramientas silenciosas recibieron una frase hablada previa. El autor indica que no se entreno sobre las 97 tareas de test de tau3-Banking ni sobre las tareas doradas de GDPval, y que se aplico decontaminacion por Jaccard de 5-gramas, firma de acciones doradas y solapamiento de entidades.

## Capacidades

- Generacion de texto en registro hablado telefonico, con frases cortas y sin markdown, listas ni formato estructurado.
- Soporte de tool calling / function calling: el 100% de las llamadas a herramientas en la evaluacion van precedidas de una frase hablada (frente al 16% del modelo base sin adaptador).
- Modo de razonamiento desactivado (`enable_thinking=False`), lo que reduce la latencia y el consumo de tokens en entornos de produccion.
- Capacidades agenticas multi-turno: puede mantener conversaciones largas en contextos de hasta 262.144 tokens.
- Multilinguismo en ingles y espanol, con reescritura de numeros, fechas y identificadores en formato hablado.
- Captura y validacion de identificadores por telefono: DNI, NIE, pasaporte, IBAN, numeros de telefono, con lectura en grupos y confirmacion antes de escrituras.
- El modelo base Qwen3.8-27B es nativamente vision-language, aunque este adaptador no ha sido entrenado para tareas de vision.

## Casos de uso

- Atencion al cliente bancaria telefónica: el agente verifica la identidad del cliente mediante DNI/NIE/pasaporte o fecha de nacimiento, leyendo los datos en grupos y confirmando antes de cualquier operacion. Es adecuado porque el modelo esta entrenado especificamente en este flujo.
- Gestion de cargos no reconocidos: el agente consulta los ultimos movimientos, identifica el cargo y responde en lenguaje hablado natural, sin mostrar tablas ni texto plano. Su estilo conversacional evita friccion con el usuario.
- Operaciones bancarias multi-paso: transferencias, bloqueo de tarjetas o cambios de producto, donde cada accion sobre la base de conocimiento va precedida de una frase hablada. El adaptador reduce el riesgo de respuestas largas y mantiene el control del dialogo.
- Soporte de telecomunicaciones: consulta de facturas, cambios de plan o reclamaciones, con verificacion de identidad mediante telefonos e IBAN. La capacidad de manejar errores de reconocimiento de voz (ASR) simulados lo hace robusto en entornos reales.
- Retail y comercio electronico: seguimiento de pedidos, devoluciones y cambios, capturando identificadores de pedido y datos de envio por telefono en registro hablado. El adaptador evita generar listas o markdown, lo que mejora la experiencia en canales de voz.
- Despliegue en centros de contacto: el adaptador puede servirse con vLLM mediante `--enable-lora` y `--enable-auto-tool-choice`, permitiendo integrarlo en pipelines de agentes que requieren respuestas habladas antes de cada llamada a herramientas.
- Generacion de datos sinteticos para entrenamiento de TTS/ASR: el estilo hablado y la ausencia de formato estructurado facilitan la generacion de corpus de dialogo para sistemas de voz, aunque el autor no ha validado la integracion con ASR/TTS.

## Benchmarks y rendimiento

| Metrica (greedy, thinking off, 97 tareas tau3-Banking, config AA, 1 trial) | Qwen3.8-27B base | Adaptador Switchboard v2 | Qwen3.8-27B base (thinking on) |
|---|---|---|---|
| Tasa de exito (pass) | 22/97 (22,7%) | 18/97 (18,6%) | 44/97 (45,4%) |
| Llamadas a herramientas precedidas por frase hablada | 16% | 100% (1655/1655) | – |
| Turnos de texto con markdown | 65% | 1% (8/544) | – |
| Juez ciego (GLM-5.3) sobre 17 trazas telefonicas held-out | 2 preferencias | 12 preferencias (3 empates); media 4,75 vs 4,45 | – |
| Conversaciones que degeneran (limite de pasos o contexto) | 0 | 7/97 | 0 |

El autor reporta un intervalo de confianza del 90% pareado para la diferencia de exito entre el adaptador y el base con thinking off de [-11,3, +3,1] puntos porcentuales, lo que indica que no hay una mejora significativa en precision. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo base en FP16 requiere aproximadamente 54 GB; en 8 bits, alrededor de 27 GB; en 4 bits, cerca de 14 GB. El adaptador LoRA anade unos 0,9 GB en FP16.
- GPU recomendadas: A100 80GB o H100 80GB para precision FP16; RTX 4090 (24 GB) puede ejecutar el modelo en 4 bits, aunque no se ha validado la cuantizacion con este adaptador.
- El adaptador esta disenado para servirse con vLLM usando `--enable-lora` y `--lora-modules`, con `--max-model-len 262144`.
- No se ha validado la combinacion de LoRA con decodificacion especulativa MTP; el autor recomienda servir sin `--speculative-config` hasta realizar una comparativa A/B.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| Qwen3.8-27B (base, thinking off) | 27B | 262.144 | Apache 2.0 | Modelo multimodal con razonamiento desactivable |
| Switchboard v2 (adaptador sobre Qwen3.8-27B) | 27B + 0.435B | 262.144 | Apache 2.0 | Agente de atencion al cliente telefonico con tool calling |
| Qwen3.8-27B (base, thinking on) | 27B | 262.144 | Apache 2.0 | Razonamiento complejo, pero con respuestas mas largas y markdown |

No se dispone de comparativas directas con otros adaptadores LoRA especificos para customer service en la informacion proporcionada.

## Limitaciones y advertencias

- La precision en el benchmark tau3-Banking no supera al modelo base con thinking off: 18/97 frente a 22/97, dentro del ruido estadistico. El base con thinking on alcanza 44/97, por lo que el adaptador sacrifica razonamiento por estilo conversacional.
- Errores tipicos: seleccion incorrecta de tipo de tarjeta o cuenta desde la base de conocimiento, calculo incorrecto de importes y finalizacion incompleta de flujos multi-item.
- Bucles de reintento en errores de herramientas: en 7 de 97 conversaciones el agente reintento una accion fallida ante un error explicito (por ejemplo, "Error: Account eligibility requirements not met.") con una nueva frase hablada hasta agotar el limite de pasos o el contexto de 262k. Se recomienda un guard de no-repeticion en produccion.
- El modelo fue entrenado y evaluado solo en forma de chat con un simulador de usuario LLM; no se ha probado con ASR/TTS en bucle, ni se ha ajustado la latencia.
- No se ha validado la cuantizacion NVFP4 con el adaptador.
- La evaluacion de estilo utiliza trazas telefonicas sinteticas propias, no PhoneBench, por lo que no se puede comparar directamente con otros modelos de telefono.
- El adaptador es un checkpoint intermedio publicado como trabajo en curso; el autor advierte de que hay que leer las limitaciones antes de usarlo en produccion.
- El modelo puede presentar sesgos heredados del modelo base y del conjunto de entrenamiento sintetico, aunque no se han documentado sesgos especificos en la informacion disponible.

## Enlaces

- Repositorio del adaptador en Hugging Face: https://huggingface.co/Enriqueag26/Qwen3.8-27B-switchboard-lora-v2
- Modelo base en Hugging Face: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial de la serie Qwen3.8 en GitHub: https://github.com/QwenLM/Qwen3.8
