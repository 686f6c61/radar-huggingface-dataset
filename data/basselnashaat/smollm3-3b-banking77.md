# BasselNashaat/SmolLM3-3B-banking77

## Resumen

SmolLM3-3B-banking77 es un ajuste fino supervisado (SFT) del modelo base HuggingFaceTB/SmolLM3-3B, desarrollado por BasselNashaat como proyecto final del curso smol de Hugging Face. El modelo resuelve una tarea muy concreta: clasificar mensajes de clientes de banca online en una de las 77 intenciones del conjunto de datos BANKING77. No es un modelo de propósito general, sino un clasificador de intenciones empaquetado como modelo generativo: recibe el mensaje y la lista de intenciones en el prompt, y devuelve el nombre exacto de la intención.

El modelo parte de SmolLM3-3B, un transformer decoder-only de aproximadamente 3.075 millones de parámetros (3,07 B), y se adapta mediante LoRA (r=16, alpha=32) sobre todas las capas lineales. El entrenamiento combina SFT sobre 6.992 mensajes y un intento de DPO con 2.000 pares que finalmente se descartó por no mejorar la validación. El resultado publicado es el checkpoint SFT con mejor precisión de validación (update 1.600).

Su relevancia práctica es doble: por un lado, demuestra que un modelo de 3 B puede alcanzar un 93,3 % de accuracy en BANKING77 con un ajuste fino ligero y económico (3,5 horas de entrenamiento); por otro, sirve como ejemplo reproducible de pipeline SFT + DPO + LoRA con TRL sobre un caso de uso real de atención al cliente. La licencia Apache 2.0 y el tamaño reducido lo hacen desplegable en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base SmolLM3-3B) con adaptadores LoRA fusionados |
| Parametros totales | 3.075.098.624 (3,07 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base SmolLM3-3B) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizacion posible via herramientas externas) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del transformer decoder-only de SmolLM3-3B y se ajusta con LoRA (r=16, alpha=32) aplicado a todas las capas lineales. El entrenamiento se realizó en dos fases sobre el split de entrenamiento de BANKING77: primero SFT con 6.992 mensajes (más 1.000 de validación) donde solo el nombre de la intención contribuía a la pérdida; después, un intento de DPO con 2.000 pares construidos a partir de los errores del propio modelo SFT (147 pares) o de la intención más frecuentemente confundida cuando el modelo acertaba (1.853 pares).

La fase SFT se detuvo por límite de tiempo (3,5 horas) tras 1.619 de 1.748 actualizaciones planificadas, conservando el checkpoint de la actualización 1.600 por ser el de mejor accuracy de validación. La fase DPO se descartó: en validación el modelo DPO acertó 10 mensajes nuevos pero falló 52 que el SFT acertaba (-4,2 %, ±1,5 %), por lo que el modelo publicado es el SFT. El modo thinking se mantuvo desactivado durante la evaluación y el prompt debe incluir explícitamente la lista de las 77 intenciones.

## Capacidades

- Clasificación de intenciones de banca online en las 77 categorías de BANKING77 (por ejemplo `card_arrival`, `pending_transfer`, `declined_card_payment`).
- Generación de texto restringida a la tarea: devuelve el nombre exacto de la intención, sin texto adicional.
- Formato conversacional mediante `apply_chat_template` con `enable_thinking=False`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo está especializado en una única tarea de clasificación.
- Capacidades multilingües: no; solo inglés.
- Capacidades especiales: no dispone de visión, audio ni modo thinking activo.

## Casos de uso

- Enrutamiento de tickets de soporte bancario: el modelo clasifica cada mensaje entrante en una de las 77 intenciones para dirigirlo al equipo o flujo automatizado correspondiente, con un 93,3 % de accuracy sobre el test oficial de BANKING77.
- Triaje previo a un agente conversacional: usar la intención predicha como señal para seleccionar la respuesta o el playbook adecuado en un chatbot de banca online, reduciendo el coste de un LLM mayor en la primera capa del pipeline.
- Etiquetado automático de históricos de atención al cliente: procesar grandes volúmenes de mensajes ya archivados para construir datasets etiquetados o analítica de motivos de contacto.
- Detección de motivos de contacto en tiempo real: integrar el modelo en un servicio de streaming que clasifique mensajes de chat en vivo y dispare alertas cuando aparezcan intenciones sensibles como `compromised_card` o `lost_or_stolen_card`.
- Monitorización de calidad y derivación: clasificar las respuestas de los agentes humanos o las conversaciones cerradas para auditar qué intenciones se resuelven peor y priorizar formación.
- Prototipado rápido en investigación: servir como baseline reproducible de SFT + LoRA sobre BANKING77 para comparar con clasificadores dedicados (BERT, DeBERTa) o con modelos generativos mayores.
- Filtrado previo en pipelines RAG: descartar o redirigir consultas fuera de dominio antes de invocar un modelo mayor, ya que el modelo siempre devuelve una de las 77 intenciones y puede usarse como señal de "fuera de alcance" cuando la confianza es baja.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el split de test completo de BANKING77 (3.080 mensajes no vistos en entrenamiento). Se considera correcta solo la coincidencia exacta con uno de los 77 nombres de intención.

| Modelo | Accuracy | Precision macro | Recall macro | F1 macro | Nombre de intencion valido |
|---|---|---|---|---|---|
| Sin entrenar (base) | 46,9 % | 64,0 % | 46,9 % | 46,2 % | 98,9 % |
| Tras SFT | 93,3 % | 93,5 % | 93,3 % | 93,3 % | 100,0 % |
| Este modelo (SFT publicado) | 93,3 % | 93,5 % | 93,3 % | 93,3 % | 100,0 % |

Mejora de accuracy frente al modelo sin entrenar: +46,3 % (intervalo del 95 % aproximado de ±1,8 %). El modelo DPO no se publicó por el retroceso observado en validación (-4,2 %, ±1,5 %). No se han publicado comparaciones con otros modelos en la información disponible.

Confusiones más frecuentes del modelo publicado:

| Intencion correcta | Prediccion del modelo | Veces |
|---|---|---|
| beneficiary_not_allowed | failed_transfer | 6 |
| pending_transfer | balance_not_updated_after_bank_transfer | 5 |
| reverted_card_payment | declined_card_payment | 5 |
| card_arrival | card_delivery_estimate | 4 |
| card_delivery_estimate | card_arrival | 4 |
| top_up_reverted | top_up_failed | 4 |
| card_payment_not_recognised | compromised_card | 4 |
| topping_up_by_card | pending_top_up | 4 |

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 6,2 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica unos 7-8 GB.
- Cuantización a 8 bits: en torno a 3,1 GB de pesos; a 4 bits: en torno a 1,6 GB. Requiere herramientas externas (no se publican GGUF en el repo).
- GPU recomendadas: A100, H100 o L40S para despliegue en producción con concurrencia; RTX 4090, RTX 3090 o RTX A6000 para servicio de baja latencia en una sola GPU.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 12 GB y superiores en fp16; en 4 bits cabría también en GPUs de 4-6 GB.
- Opciones de despliegue: transformers (referencia del autor), vLLM, TGI, llama.cpp u Ollama previa conversión a GGUF (no se proporcionan pesos GGUF en el repo).
- Latencia y throughput: no disponibles en la información proporcionada. Con `max_new_tokens=20` y decodificación greedy, la generación es corta y el cuello de botella es el prefill del prompt, que incluye la lista de 77 intenciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy BANKING77 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolLM3-3B-banking77 (este) | 3,07 B | no disponible | 93,3 % | Apache 2.0 | Hugging Face |
| SmolLM3-3B (base, sin ajustar) | 3,07 B | no disponible | 46,9 % (con prompt de 77 intenciones) | Apache 2.0 | Hugging Face |
| Clasificadores BERT dedicados a BANKING77 | ~0,1-0,3 B | 512 tokens | no disponible en la informacion | variable | Hugging Face |

No se dispone de datos de benchmarks de clasificadores BERT o DeBERTa dedicados a BANKING77 en la información proporcionada, por lo que la comparación cuantitativa con alternativas no puede completarse. Cualitativamente, un clasificador BERT dedicado sería más pequeño y rápido, mientras que este modelo conserva la flexibilidad del formato generativo y del modelo base subyacente.

## Limitaciones y advertencias

- Dominio cerrado: solo conoce las 77 intenciones de BANKING77 para mensajes de banca online en inglés. Cualquier mensaje fuera de dominio se asignará igualmente a una de las 77 intenciones, sin opción de "desconocido".
- El prompt debe incluir la lista completa de intenciones; si se omite o se altera el formato, el rendimiento puede degradarse.
- Solo inglés. No soporta castellano ni otros idiomas.
- Riesgo de alucinación de nombres de intención: aunque en test la tasa de nombres válidos es del 100 %, el formato de salida no está garantizado por el modelo y conviene validar la respuesta contra la lista de 77 nombres.
- Confusiones sistemáticas entre intenciones semánticamente próximas (por ejemplo `beneficiary_not_allowed` vs `failed_transfer`, `card_arrival` vs `card_delivery_estimate`), que pueden requerir revisión humana en esos pares.
- El DPO no aportó mejoras y se descartó; no debe esperarse un comportamiento alineado más allá del SFT.
- Licencia Apache 2.0 para el modelo, pero el dataset BANKING77 está bajo CC BY 4.0, lo que conviene verificar para uso comercial del modelo derivado.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validación comunitaria ni mantenimiento conocido.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ) ni métricas de latencia/throughput; el despliegue en producción requiere conversión y validación propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BasselNashaat/SmolLM3-3B-banking77
- Modelo base SmolLM3-3B: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Dataset BANKING77: https://huggingface.co/datasets/PolyAI/banking77
- Curso smol de Hugging Face (proyecto de origen): https://github.com/huggingface/smol-course
- Librería TRL: https://github.com/huggingface/trl
