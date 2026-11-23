# giocorte/totem-kiosk-extractor-sft-v4

## Resumen

`giocorte/totem-kiosk-extractor-sft-v4` es un conjunto de dos adaptadores LoRA (PEFT) entrenados sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`. No se trata de un modelo completo, sino de pesos delta que deben cargarse junto al modelo base de 4.000 millones de parametros. El autor los ha disenado para un dominio muy concreto: un totem o chiosco de atencion al cliente (asistente conversacional) y un extractor de estado estructurado a partir de los mensajes del cliente.

La relevancia de esta publicacion es metodologica mas que de proposito general: muestra un ciclo de ajuste fino supervisado (SFT) sobre un modelo pequeno para una tarea de extraccion de entidades y mantenimiento de estado en conversaciones multi-turno, con evaluacion desglosada por tipo de error. Los adaptadores son `kiosk_v4` (asistente del chiosco) y `extractor_v4` (extractor de estado), ambos con rango LoRA 32, alpha 64 y aplicados a todas las proyecciones lineales.

El repositorio ocupa 0,8 GB y fue creado el 22 de noviembre de 2026. No se declara licencia, idiomas soportados ni pipeline en la informacion disponible. La model card esta redactada en italiano y describe el entrenamiento sobre 1.259 conversaciones, con resultados de evaluacion comparativos frente a la version v3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre transformer decoder-only Qwen3-4B-Instruct-2507 |
| Parametros totales | No disponible (el modelo base Qwen3-4B-Instruct-2507 tiene 4.000 millones; los adaptadores no declaran recuento) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base; no declarada en la model card) |
| Tipos de cuantizacion | No disponible (el repo contiene safetensors PEFT; la cuantizacion depende del despliegue del modelo base) |
| Idiomas soportados | No disponible (la model card y los datos estan en italiano; no se declara cobertura multilingue) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

Se trata de dos adaptadores LoRA independientes, ambos con rango 32, alpha 64 y aplicados a todas las proyecciones lineales del modelo base Qwen3-4B-Instruct-2507. El entrenamiento se realizo en 3 GPU H200 (la cuarta del equipo estaba averiada), de forma secuencial, 2 epocas por adaptador, con tamanos de lote efectivo de 9 ejemplos por paso para el chiosco y 15 para el extractor.

El dataset `data/sft_v4` contiene 1.259 conversaciones: 790 heredadas de la version v3 (menos 2 conversaciones con un bucle problematico sobre el equipaje), 330 dialogos generados por agentes sobre casos comunes del extractor y comportamientos del chiosco (con ritmo y longitudes variables) y 141 dialogos con el estado de produccion anidado (campos como `service.id`, `passengers.category`, `departure_time`). No se menciona uso de RLHF ni DPO; el proceso descrito es SFT puro. La innovacion tecnica destacable es el diseno de dos roles separados (asistente que actua mediante CLI en el texto y extractor que emite un estado nuevo mas tres senales por mensaje del cliente), lo que permite evaluar por separado la generacion conversacional y la extraccion estructurada.

## Capacidades

- Asistente conversacional de chiosco (`kiosk_v4`): responde al cliente y ejecuta acciones mediante una CLI embebida en el texto, sin escribir el estado directamente.
- Extraccion de estado estructurado (`extractor_v4`): dado un mensaje del cliente y el estado previo, produce el estado nuevo y tres senales (`confirms_purchase`, `asks_staff`, `asks_information`).
- Mantenimiento de estado anidado en conversaciones multi-turno (servicio, pasajeros, fechas, origen, destino, tarifa, equipaje, animales, etc.).
- Generacion de respuestas sin markdown ni listas en el rol de chiosco (0/259 y 0/270 casos con markdown en las evaluaciones v4 y v3 respectivamente).
- No se declara soporte de tool calling generico, agentes multi-paso fuera del flujo CLI descrito, vision, audio ni modo thinking.
- Capacidad multilingue: no declarada; los datos y la evaluacion son en italiano.

## Casos de uso

- Extraccion de estado en un totem de venta de billetes: `extractor_v4` recibe cada mensaje del cliente junto con el estado previo y devuelve el estado actualizado, lo que permite mantener un formulario de compra sincronizado sin que el usuario lo rellene manualmente. Los resultados del autor muestran un 92 % de estados exactos sobre mensajes reservados.
- Asistente de voz para chiosco: `kiosk_v4` genera respuestas conversacionales y comandos CLI en el mismo turno, adecuado para integraciones donde el front-end ejecuta acciones a partir del texto.
- Deteccion de intencion de compra y derivacion a personal: las senales `confirms_purchase` (99 % en evaluacion) y `asks_staff` (100 %) permiten enrutar conversaciones a un agente humano o cerrar la transaccion.
- Recogida de datos estructurados en dominios con esquema fijo: el enfoque de estado anidado con campos tipados (`service.id`, `passengers.category`, `departure_time.before/after`) es replicable en reservas de hotel, alquiler de vehiculos o citas medicas.
- Prototipado rapido de asistentes de dominio: al ser adaptadores LoRA sobre un base de 4B, el coste de entrenamiento y despliegue es bajo comparado con un fine-tuning completo, lo que facilita iteraciones (v3 a v4 en el mismo repositorio).
- Evaluacion de extraccion de entidades en conversacion: el conjunto de 30 dialogos de referencia escritos a mano y las metricas por tipo de error sirven como banco de pruebas para comparar estrategias de prompting frente a SFT.
- Despliegue en hardware modesto: al apoyarse en un base de 4B, es viable en GPU de consumo con cuantizacion del modelo base, aunque la cuantizacion de los adaptadores no se documenta.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el conjunto `eval/state_extraction` (30 dialogos de referencia escritos a mano, 225 estados). Se comparan `extractor_v4` y `extractor_v3` en tres modos de evaluacion: `gold` (estado previo correcto), `chained` (estado previo generado por el propio modelo) y `end` (estado final de la conversacion).

| Metrica | extractor_v4 | extractor_v3 |
|---|---|---|
| Exactitud de estados, modo gold | 216/225 (96 %) | 206/225 (92 %) |
| Estado final exacto, modo gold | 30/30 | 30/30 |
| Exactitud de estados, modo chained | 185/225 (82 %) | 136/225 (60 %) |
| Estado final exacto, modo chained | 25/30 | 17/30 |
| Estado final exacto, modo end | 23/30 (77 %) | 18/30 (60 %) |

Resultados sobre mensajes de cliente reservados del dataset v4 (674 mensajes), partiendo del estado previo correcto:

| Metrica | extractor_v4 | extractor_v3 |
|---|---|---|
| Estado exacto, global | 620/674 (92 %) | 595/674 (88 %) |
| Estado exacto, estado de produccion (sft20) | 76/88 (86 %) | 57/88 (65 %) |
| Estado exacto, agentes seed 19 | 164/177 (93 %) | 159/177 (90 %) |
| Estado exacto, agentes seed 18 | 114/119 (96 %) | 112/119 (94 %) |
| Estado exacto, generado antes (sft12-16) | 266/290 (92 %) | 267/290 (92 %) |
| `confirms_purchase` correcto | 670/674 (99 %) | 669/674 (99 %) |
| `asks_staff` correcto | 673/674 (100 %) | 673/674 (100 %) |
| `asks_information` correcto | 602/674 (89 %) | 611/674 (91 %) |

Resultados del rol de chiosco sobre el primer mensaje de 650 turnos reservados:

| Metrica | kiosk_v4 | kiosk_v3 |
|---|---|---|
| Mismo tipo (comando o respuesta) | 596/650 (92 %) | 597/650 (92 %) |
| Mismo primer comando | 328/375 (87 %) | 324/375 (86 %) |
| Respuestas con markdown o lista | 0/259 (0 %) | 0/270 (0 %) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; depende del base Qwen3-4B-Instruct-2507. Como referencia orientativa, un modelo de 4B en FP16 requiere del orden de 8-9 GB de VRAM, y en cuantizacion de 4 bits alrededor de 3-4 GB, pero estos valores no los declara el autor.
- GPU recomendadas: el entrenamiento se realizo en 3 GPU H200. Para inferencia no se especifican; un base de 4B es viable en RTX 4090, RTX 3090, A100 o H100, pero no hay datos publicados.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del base, pero no hay confirmacion del autor ni cifras de latencia.
- Opciones de despliegue: los adaptadores son PEFT sobre safetensors; el despliegue requiere cargar el base Qwen3-4B-Instruct-2507 y aplicar los adaptadores. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. La unica comparacion disponible es interna, frente a la version anterior de los mismos adaptadores (`extractor_v3` y `kiosk_v3`), cuyos resultados se recogen en la seccion de benchmarks. Frente a alternativas genericas de extraccion de entidades o asistentes de dominio no hay datos publicados.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| totem-kiosk-extractor-sft-v4 | No disponible (base 4B) | No disponible | No disponible | Hugging Face (PEFT) |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No se declara licencia, lo que impide determinar si el uso comercial esta permitido; hay que contactar con el autor antes de usarlo en produccion.
- El modelo esta especializado en un dominio muy concreto (chiosco de transporte con esquema de estado fijo); su rendimiento fuera de ese dominio no esta evaluado.
- Los datos y la evaluacion son en italiano; no hay evidencia de comportamiento en castellano ni en otros idiomas.
- Riesgo de alucinacion en la extraccion de campos: el autor reporta errores residuales de tipo `missing:*`, `wrong:*` y `extra:*` incluso en el mejor modo (por ejemplo, `extra:luggage` y `extra:passenger_ages` en el conjunto gold).
- El rendimiento decae en modo `chained` (82 % de estados exactos frente al 96 % en gold), lo que indica acumulacion de errores en conversaciones largas cuando el estado previo lo genera el propio modelo.
- El tamano del conjunto de evaluacion es reducido (30 dialogos, 225 estados), por lo que las diferencias entre versiones deben interpretarse con cautela.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa por parte de la comunidad.
- El modelo base es Qwen3-4B-Instruct-2507, cuyas limitaciones y sesgos se heredan; no se documentan mitigaciones adicionales.

## Enlaces

- Hugging Face: https://huggingface.co/giocorte/totem-kiosk-extractor-sft-v4
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.
