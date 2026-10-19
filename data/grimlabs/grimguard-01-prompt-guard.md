# Grimlabs/GrimGuard-01-Prompt-Guard

## Resumen

GrimGuard-01-Prompt-Guard es un clasificador de prompts condicionado por política, publicado por Grimlabs LLC. Recibe una política en lenguaje natural con reglas `DO_FLAG` y `DO_NOT_FLAG` junto con un prompt de usuario, y devuelve `allow`, `flag` o `review`, sin necesidad de reentrenar un clasificador para cada aplicación. Está pensado para guardrails y moderación previa en asistentes y agentes.

El repositorio contiene dos variantes: GrimGuard-Pro, un encoder-only de 110.270.210 parámetros basado en `google-bert/bert-base-uncased` con una cabeza opcional de atribución de reglas, y GrimGuard-Fast, un estudiante MiniLM-L6 de 22,76 M de parámetros destilado del anterior para CPU. También incluye artefactos ONNX fp32 e int8 por canal.

Su relevancia está en que permite cambiar la política de seguridad en lenguaje natural y desplegarla en edge o CPU con latencia de milisegundos; la variante Fast int8 mide 8,61 ms p50 y 8,76 ms p95 en un núcleo i9-14900KF a 128 tokens. La evaluación es en inglés, con datos sintéticos y sin datos reales de usuario.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only; GrimGuard-Pro basado en BERT-base uncased con cabeza de clasificación binaria y cabeza opcional de atribución de reglas; GrimGuard-Fast es un MiniLM-L6 destilado |
| Modelo base | `google-bert/bert-base-uncased` |
| Parámetros totales | 110.270.210 (GrimGuard-Pro); 22,76 M (GrimGuard-Fast) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Pro: no disponible (si política+prompt exceden el presupuesto, devuelve `review`); Fast: 128 tokens máximos (52 de política + 72 de prompt) |
| Tipos de cuantización | ONNX fp32 y ONNX int8 por canal; no se detallan GGUF, GPTQ, AWQ ni otras |
| Idiomas soportados | Inglés (`en`); no se declaran otros idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y ONNX (fp32 e int8) |
| Tarea | `text-classification` / prompt guard |
| Tamaño del repositorio | 1,2 GB |

## Arquitectura y entrenamiento

GrimGuard-Pro es un transformer encoder-only basado en BERT-base uncased. La arquitectura es personalizada y requiere `trust_remote_code=True` al cargarla con Transformers. Sobre el encoder se añade una cabeza de clasificación binaria y, de forma opcional, una cabeza de atribución de reglas que devuelve `matched_rule_id` y `matched_rule_text`. El modelo no genera texto: produce un logit binario, una probabilidad calibrada y un veredicto `allow`, `flag` o `review`. GrimGuard-Fast es un estudiante MiniLM-L6 destilado de Pro, con un presupuesto compacto de política y prompt para despliegue estricto en CPU.

El entrenamiento usó datos sintéticos en inglés, de un solo turno y condicionados por política, generados por subagentes LLM especializados. Se partió de 10.452 ejemplos autorales sobre 804 políticas (612 de entrenamiento/bruto y 192 reservadas para evaluación), que tras aumento contrafactual —eliminación de reglas, adición de reglas, política vacía, emparejamiento entre políticas y grupos contrafactuales— y sobremuestreo de políticas personalizadas dieron 30.219 pares de entrenamiento procesados. Pro se entrenó con BCE binaria, una BCE opcional de atribución de reglas y una pérdida de margen por pares contrafactuales; después recibió un ajuste corto sobre políticas personalizadas de reembolsos y acciones ordinarias, que produjo el checkpoint publicado. Fast se destiló de Pro con BCE de etiquetas duras y KL. No se menciona RLHF ni DPO. No se usaron datos reales de usuario; antes del entrenamiento se hizo validación y una auditoría ciega de 200 ejemplos con kappa de Cohen de 0,98.

## Capacidades

- Clasificación de prompts condicionada por política: recibe `[CONTEXT]`, reglas `DO_FLAG` y `DO_NOT_FLAG`, y un prompt; devuelve `allow`, `flag` o `review`.
- Salida estructurada con `verdict`, `score` calibrado, `logit` binario, `matched_rule_id`, `matched_rule_text`, `policy_text`, `too_long` y `omitted_rule_ids`.
- Atribución de reglas: identifica la regla que explica un `flag`; top-1 del 85,3 % y top-3 del 99,2 % en la evaluación publicada.
- Variante Fast para CPU: 22,76 M de parámetros, 128 tokens máximos, ONNX int8 y latencia de 8,61 ms p50 / 8,76 ms p95 en un núcleo i9-14900KF.
- Integración como guardrail en pipelines de asistentes y agentes; no ejecuta herramientas ni mantiene conversaciones por sí mismo.
- No soporta tool calling ni function calling de forma nativa; puede colocarse antes o después de una llamada a herramientas para decidir si se permite, se marca o se revisa.
- No dispone de visión, audio, generación de texto ni razonamiento multi-paso generativo.
- Capacidad multilingüe: no disponible; solo se declara inglés.

## Casos de uso

- Atención al cliente en comercio digital: preclasificar mensajes contra una política de reembolsos y cancelaciones antes de que lleguen al asistente. Pro es adecuado para políticas nuevas o poco vistas; Fast int8 sirve para volumen alto una vez estabilizada la política. El campo `matched_rule_id` permite enrutar el caso al equipo correcto.
- Moderación previa en asistentes LLM: colocar el clasificador delante del modelo generativo para marcar solicitudes que violan una política de uso aceptable, reduciendo coste y latencia en peticiones que no deben procesarse. El veredicto `review` evita bloquear automáticamente casos dudosos.
- Gate de seguridad en agentes y tool calling: en un agente que ejecuta acciones como cancelar una suscripción o emitir un reembolso, usar GrimGuard para clasificar la instrucción del usuario antes de habilitar la herramienta. El modelo no ejecuta la acción; solo decide si la instrucción es `allow`, `flag` o `review`.
- Cumplimiento de políticas internas: adaptar políticas de RRHH, soporte o IT con reglas `DO_FLAG`/`DO_NOT_FLAG` sin reentrenar. La atribución de reglas permite auditar por qué se marcó una solicitud y revisar la política.
- Triaje de bandeja de soporte: clasificar tickets o correos y priorizar revisión humana según la política vigente. Fast es adecuado para alto volumen; Pro para políticas cambiantes o dominios no vistos.
- Despliegue edge/CPU de alto volumen: usar Fast int8 ONNX en una pasarela de entrada para clasificar cada prompt con latencia de milisegundos en un solo núcleo, sin GPU.
- Evaluación y control de cambios de política: ejecutar suites con política vacía, barajada, con reglas añadidas o eliminadas para detectar fallos de condicionamiento antes de desplegar una nueva versión. Pro es la variante indicada para esta validación.

## Benchmarks y rendimiento

Evaluación final retenida: 3.663 ejemplos (909 en distribución, 2.185 de dominios no vistos y 569 adversarios).

| Modelo / suite | AUROC | F1 | FPR |
|---|---:|---:|---:|
| Pro — todos | 0,9289 | 0,8387 | 0,1129 |
| Pro — en distribución | 0,9767 | 0,9082 | 0,0415 |
| Pro — dominios no vistos | 0,8927 | 0,8011 | 0,1595 |
| Pro — adversarios | 0,9641 | 0,8741 | 0,0468 |
| Fast — todos | 0,8868 | 0,8030 | 0,1206 |
| Fast — dominios no vistos | 0,8301 | 0,7500 | 0,1705 |
| Baseline léxico de palabras clave | 0,6452 | 0,6757 | 0,8074 |

Controles de política en Pro:

| Prueba | Resultado |
|---|---:|
| Política vacía | 100 % `allow` |
| Política barajada | 95,5 % correcto |
| Regla añadida | 100 % `flag` |
| Regla eliminada | 76,7 % `allow` |
| Atribución de regla top-1 | 85,3 % |
| Atribución de regla top-3 | 99,2 % |
| Ranking de pares contrafactuales, global | 0,743 |
| Ranking de pares contrafactuales, políticas no vistas | 0,706 |
| Objetivo de ranking contrafactual | 0,80 |

Latencia publicada:

| Artefacto | Hardware | Resultado |
|---|---|---|
| Fast int8, 128 tokens | 1 núcleo i9-14900KF fijado | 8,61 ms p50 / 8,76 ms p95 (solo modelo) |
| Pro | no disponible | no disponible |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks generativos; el modelo es un clasificador y no genera texto. El throughput no está disponible.

## Requisitos de hardware

- VRAM estimada (solo pesos, no total): Pro aproximadamente 0,44 GB en fp32 y 0,11 GB en int8; Fast aproximadamente 0,09 GB en fp32 y 0,02 GB en int8. El total de VRAM no está publicado y depende del runtime, el lote y la longitud de entrada; debe medirse en el entorno de destino.
- GPU recomendadas: no disponibles. No se han publicado pruebas en A100, H100, RTX 4090 ni otras GPU. Por el tamaño de los pesos, el modelo no requiere una GPU de centro de datos.
- GPU de consumo: sí, ambas variantes caben en GPUs de consumo por tamaño de pesos; no hay una lista oficial de GPUs validadas.
- CPU: Fast int8 ONNX está pensado para CPU y se midió en un núcleo i9-14900KF. Es la opción indicada para despliegue estricto en CPU.
- Despliegue: Transformers con `trust_remote_code=True`; ONNX Runtime para los artefactos fp32 e int8. No se proporcionan artefactos para vLLM, llama.cpp, Ollama ni TGI; al ser un encoder de clasificación con código personalizado, esas rutas no están documentadas.
- Latencia: Fast int8, 128 tokens, 8,61 ms p50 y 8,76 ms p95 solo modelo en un núcleo fijado i9-14900KF. Pro: no disponible. Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | AUROC (todos) | F1 (todos) | FPR (todos) | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---:|---|---|
| GrimGuard-Pro | 110.270.210 | no disponible | 0,9289 | 0,8387 | 0,1129 | Apache-2.0 | HuggingFace, raíz del repositorio |
| GrimGuard-Fast | 22,76 M | 128 tokens | 0,8868 | 0,8030 | 0,1206 | Apache-2.0 | HuggingFace, subcarpeta `fast/` |
| Baseline léxico de palabras clave | no aplica | no aplica | 0,6452 | 0,6757 | 0,8074 | no disponible | Referencia interna de evaluación |

No se han proporcionado datos de alternativas externas de la misma categoría; no se incluyen cifras de modelos externos que no estén verificadas en la información disponible.

## Limitaciones y advertencias

- Solo inglés: no se declaran capacidades multilingües; el rendimiento en otros idiomas no está evaluado.
- Entrenamiento con datos sintéticos y sin datos reales de usuario: puede no cubrir jerga, sarcasmo, variantes dialectales, código, dominios especializados ni patrones adversariales no vistos.
- Sesgos conocidos: no disponible; no se documentan evaluaciones específicas de sesgo. El uso de subagentes LLM para generar datos introduce posibles sesgos de cobertura y de redacción.
- Riesgo de falsos positivos y falsos negativos: en dominios no vistos, Pro obtiene FPR de 0,1595 y F1 de 0,8011; Fast empeora a FPR de 0,1705 y F1 de 0,7500. No debe tratarse como un filtro perfecto.
- Los umbrales no son transferibles entre dominios: el umbral F1-óptimo de `config.json` tiene una tasa alta de falsos positivos en dominios no vistos. Para uso conservador, pasar un umbral más alto, por ejemplo `threshold=0.5`, y calibrar con tráfico benigno del despliegue.
- `review` no significa `allow`: se devuelve cuando política+prompt exceden el presupuesto de secuencia; debe enviarse a revisión humana o al modelo Pro, no aceptarse automáticamente.
- La primera petición con una política nueva en Fast debe usar Pro o devolver `review`; Fast está pensado para políticas establecidas y de alto volumen.
- La eliminación de reglas solo produce `allow` en el 76,7 % de los casos; existe riesgo residual de que una regla eliminada siga marcando solicitudes.
- La atribución de reglas no es perfecta: top-1 del 85,3 %, aunque top-3 alcanza el 99,2 %. Para auditorías normativas, conviene revisión humana.
- El ranking de pares contrafactuales está por debajo del objetivo: 0,743 global y 0,706 en políticas no vistas, frente a 0,80.
- No es un modelo generativo: no alucina texto, pero puede clasificar mal una petición. No sustituye una revisión humana ni una política de seguridad completa.
- Licencia Apache-2.0: permite uso comercial con las obligaciones de aviso de licencia; no se especifican restricciones adicionales en la información disponible.
- La longitud de contexto de Pro no está publicada; las políticas o prompts largos pueden acabar en `review` o en truncamiento con `too_long` y `omitted_rule_ids`.

## Enlaces

- [Model card en HuggingFace](https://huggingface.co/Grimlabs/GrimGuard-01-Prompt-Guard)
- [Modelo base google-bert/bert-base-uncased](https://huggingface.co/google-bert/bert-base-uncased)
- [README de ONNX](https://huggingface.co/Grimlabs/GrimGuard-01-Prompt-Guard/blob/main/onnx/README.md)
- [eval_results_pro.json](https://huggingface.co/Grimlabs/GrimGuard-01-Prompt-Guard/blob/main/eval_results_pro.json)
- [eval_results_fast.json](https://huggingface.co/Grimlabs/GrimGuard-01-Prompt-Guard/blob/main/eval_results_fast.json)

No se han encontrado papers, blogs, repositorios o demos adicionales relevantes en la búsqueda web proporcionada.
