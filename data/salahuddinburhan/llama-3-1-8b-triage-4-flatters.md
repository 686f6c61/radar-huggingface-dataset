# salahuddinburhan/Llama-3.1-8B-triage-4-Flatters

## Resumen

Llama-3.1-8B-triage-4-Flatters es un adaptador LoRA (PEFT) construido sobre Llama 3.1 8B Instruct, desarrollado por Salahuddin Burhan y Munif Haikal (equipo "4-Flatters") mediante Unsloth Studio. Su proposito es especifico y acotado: clasificar mensajes de atencion al cliente de una tienda online en Malasia y devolver un registro de triaje estructurado en JSON con tres campos (`category`, `urgency`, `needs_human`), de modo que pueda alimentar flujos de enrutamiento de tickets, priorizacion y escalado a agentes humanos.

El modelo no es un modelo generalista nuevo, sino un ajuste fino de bajo rango sobre el checkpoint `unsloth/Llama-3.1-8B-Instruct-unsloth-bnb-4bit`, empaquetado como adaptador PEFT en safetensors (repo de 0,2 GB). La relevancia practica esta en el salto reportado por los autores sobre su propia evaluacion: la puntuacion global pasa del 44 % en el modelo base al 77 % en el ajustado (+33 puntos porcentuales), con la mejora mas marcada en la deteccion de casos que requieren intervencion humana (recall de 42 % a 87 %).

Es un artefacto de nicho, con cero descargas y cero likes en el momento de la consulta, y su validacion es interna al equipo: las metricas no han sido verificadas de forma independiente ni se han publicado definiciones exactas del benchmark. Debe tratarse, por tanto, como una prueba de concepto reproducible mas que como un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1 8B Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | 8 000 millones en el modelo base; el adaptador LoRA distribuido ocupa 0,2 GB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el ejemplo de inferencia usa `max_seq_length=512` |
| Tipos de cuantizacion | carga en 4 bits en el ejemplo oficial (`load_in_4bit=True`); el base es `bnb-4bit`; no se documentan otras variantes |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas; el caso de uso es una tienda online en Malasia) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador LoRA PEFT); requiere el modelo base para inferencia |

## Arquitectura y entrenamiento

El modelo base es Llama 3.1 8B Instruct, un transformer decoder-only denso de 8 000 millones de parametros. Sobre el se aplica un ajuste fino con Low-Rank Adapters (LoRA) mediante Unsloth Studio, que genera un adaptador PEFT en lugar de pesos completos. El adaptador se aplica sobre el checkpoint cuantizado a 4 bits de Unsloth (`unsloth/Llama-3.1-8B-Instruct-unsloth-bnb-4bit`); la model card advierte explicitamente que la carga en 4 bits para inferencia no establece la precision usada durante el entrenamiento.

No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, el rango y alpha del LoRA, la tasa de aprendizaje ni si se aplicaron tecnicas de RLHF o DPO. La tarea se formula como clasificacion de texto con salida estructurada: el modelo recibe un system prompt fijo (incluido en el repo como `system_prompt.txt`) y debe responder unicamente con un objeto JSON de tres claves. Los valores permitidos son `delivery`, `refund_return`, `product_fault`, `payment_billing`, `account_access` y `general_enquiry` para `category`; `low`, `medium`, `high` para `urgency`; y `true`/`false` para `needs_human`.

## Capacidades

- Clasificacion de mensajes de clientes en seis categorias predefinidas de atencion al cliente.
- Estimacion de urgencia en tres niveles (baja, media, alta).
- Deteccion de necesidad de escalado a un agente humano (`needs_human`), con especial enfasis en reducir falsos negativos de escalado.
- Generacion de salida estructurada en JSON con cumplimiento del 100 % reportado por los autores.
- Conversacion multi-turno heredada del modelo base Llama 3.1 Instruct (chat template aplicado en el ejemplo oficial).
- Capacidades generales del base (generacion de texto, razonamiento, codigo) teoricamente presentes pero no evaluadas ni objetivo del ajuste.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision ni audio especifico para este adaptador.

## Casos de uso

- Enrutamiento automatico de tickets: el modelo clasifica cada mensaje entrante en una de las seis categorias y lo dirige al equipo correspondiente (logistica, devoluciones, pagos, soporte tecnico), reduciendo el triaje manual.
- Priorizacion por urgencia: con una precision de urgencia reportada del 93 %, permite ordenar la cola de atencion y garantizar que los casos criticos se atiendan primero.
- Deteccion de escalado a humano: el recall del 87 % en `needs_human` lo hace util como filtro previo a un chatbot automatico, derivando a un agente cuando el caso lo requiere.
- Integracion en pipelines de ticketing (Zendesk, Freshdesk, sistemas propios): al devolver JSON estricto, la salida se puede parsear directamente sin post-procesado ni expresiones regulares fragiles.
- Analitica de volumen de incidencias: agregando las categorias y urgencias generadas se obtienen metricas de demanda por tipo de problema para planificacion de plantilla y producto.
- Prototipado rapido de asistentes de soporte: al ser un adaptador LoRA de 0,2 GB sobre un base ampliamente disponible, permite experimentar con un coste de almacenamiento y despliegue bajo en entornos con GPU modesta.
- Clasificacion por lotes de historicos de mensajes: para etiquetar retroactivamente conversaciones archivadas y construir datasets de entrenamiento o informes.

## Benchmarks y rendimiento

Los datos proceden de la evaluacion interna del equipo; las definiciones exactas de las metricas y las condiciones de evaluacion no han sido verificadas de forma independiente.

| Metrica | Modelo base | Modelo ajustado | Cambio (pp) |
|---|---:|---:|---:|
| Puntuacion global | 44 % | 77 % | +33 |
| Precision de categoria | 81 % | 90 % | +9 |
| Precision de urgencia | 75 % | 93 % | +18 |
| Recall de needs_human | 42 % | 87 % | +45 |
| Cumplimiento de JSON | 98 % | 100 % | +2 |
| Puntuacion en ejemplos dificiles | 50 % | 76 % | +26 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con carga en 4 bits del base de 8B, en torno a 6-8 GB para inferencia; en fp16, aproximadamente 16 GB mas el overhead del adaptador.
- GPU recomendadas: A100 o H100 para despliegue de alta concurrencia; RTX 4090, RTX 3090 o L4 para inferencia en 4 bits.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM usando cuantizacion de 4 bits (por ejemplo RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070).
- Opciones de despliegue: el ejemplo oficial usa Unsloth (`FastLanguageModel`) con `load_in_4bit=True`; al ser un adaptador PEFT sobre Llama 3.1, es compatible con vLLM, TGI y llama.cpp/Ollama previa fusion del adaptador con el base o conversion a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada. La generacion esta acotada a `max_new_tokens=64` y decodificacion greedy (`do_sample=False`), lo que limita la latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-triage-4-Flatters | 8B (adaptador LoRA) | no disponible | Triaje de atencion al cliente con JSON | llama3.1 | Hugging Face, 0 descargas |
| Llama 3.1 8B Instruct (base) | 8B | 128 000 tokens (segun Llama 3.1) | Instrucciones generales | llama3.1 | Ampliamente disponible |
| Alternativas de clasificacion de tickets | no disponible | no disponible | Clasificacion de texto | no disponible | no disponible |

No se dispone de datos de benchmarks comparables con otros adaptadores de triaje en la informacion proporcionada.

## Limitaciones y advertencias

- Ambito muy restringido: disenado para una unica tienda online en Malasia; el rendimiento fuera de ese dominio y de esas seis categorias no esta evaluado.
- Metricas no verificadas: los resultados (77 % global) proceden de la evaluacion interna del equipo, sin definiciones publicas ni replicacion independiente.
- Escalado incompleto: pese a la mejora, el recall de `needs_human` es del 87 %, por lo que aproximadamente uno de cada ocho casos que requieren humano podria no detectarse.
- Riesgo de alucinacion: aunque el cumplimiento de JSON reportado es del 100 %, no se documenta comportamiento ante entradas ambiguas, idiomas distintos del usado en entrenamiento o mensajes fuera de dominio.
- Idiomas no declarados: la model card no especifica la lista de idiomas soportados, lo que impide garantizar calidad multilingue.
- Dependencia del system prompt: requiere el `system_prompt.txt` exacto del repo; desviarse de el puede degradar el formato JSON.
- Licencia: sujeta a la Llama 3.1 Community License, con obligaciones de atribucion y restricciones de uso (incluida la clausula de 700 millones de usuarios mensuales para licencia comercial adicional).
- Madurez: cero descargas y cero likes; el ejemplo de inferencia no ha sido ejecutado de forma independiente contra el adaptador publicado, segun la propia model card.
- No apto como modelo generalista: el ajuste LoRA puede degradar capacidades generales del base fuera de la tarea de triaje.

## Enlaces

- Hugging Face: https://huggingface.co/salahuddinburhan/Llama-3.1-8B-triage-4-Flatters
- Repositorio GitHub del proyecto: https://github.com/salahuddinburhan/Llama-3.1-8B-triage-4-Flatters
- Grafico comparativo de resultados: https://github.com/salahuddinburhan/Llama-3.1-8B-triage-4-Flatters/blob/main/assets/comparison.png
- Modelo base: https://huggingface.co/unsloth/Llama-3.1-8B-Instruct-unsloth-bnb-4bit
- Unsloth: https://github.com/unslothai/unsloth
