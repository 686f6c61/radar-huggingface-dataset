# Dialogues/topos-facts-gate-v0.1

## Resumen

Topos Facts v0.1 · gate es un codificador NLI (inferencia de lenguaje natural) basado en DeBERTa-v3-large, afinado por Dialogues para decidir qué hechos personales declara un mensaje sobre su autor. Forma parte de una arquitectura de dos piezas junto a un lector de spans (`Dialogues/topos-facts-reader-v0.1`): el gate puntúa hipótesis del tipo «el autor menciona su <predicado>» sobre 27 paquetes de hechos y selecciona opciones de campos cerrados, mientras el lector copia valores de texto libre. No emplea ningún modelo generativo, de modo que cada valor emitido es una opción de una lista fija o un fragmento literal del mensaje.

El modelo resuelve un problema acotado pero recurrente en sistemas de memoria personal y asistentes conversacionales: extraer hechos estructurados (metas, mudanzas, cambios de trabajo, compromisos) de mensajes informales sin incurrir en las alucinaciones típicas de los LLM generativos. Con 435 millones de parámetros y 512 tokens de contexto, prioriza la precisión (0,81 en el conjunto sintético) sobre la cobertura, con un recall deliberadamente bajo (0,45).

Es relevante ahora porque demuestra que un encoder pequeño y afinado puede superar en precisión a LLM mucho mayores en tareas de extracción cerrada: en la evaluación del autor, Topos Facts v0.1 produce unas 5 predicados erróneos frente a los ~250 de Llama 3.3 70B con prompting. La versión 0.1 se publicó en noviembre de 2026 bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3-large), cross-encoder NLI |
| Parametros totales | 435.063.810 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (longitud de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32/fp16 estándar de transformers) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | MoritzLaurer/deberta-v3-large-zeroshot-v2.0-c |
| Pipeline | zero-shot-classification / text-classification (NLI) |
| Etiquetas NLI | 0 = entailment, 1 = not_entailment |
| Tamaño del repositorio | 0,9 GB |

## Arquitectura y entrenamiento

El gate es un cross-encoder DeBERTa-v3-large en configuración NLI: recibe como premisa el mensaje y como hipótesis una plantilla del tipo «The author mentions their <predicate> (<pack title>)», y devuelve la probabilidad de entailment. Cada predicado de cada paquete de hechos tiene su umbral por nivel (0,985 para predicados `special` como salud o creencias; 0,99 para predicados `personal`). Para los campos de elección cerrada, el modelo puntúa la hipótesis concatenada con cada opción (`<hypothesis> <Field>: <option>.`) y conserva la mejor por encima de 0,01. Una pasada adicional evalúa si el mensaje trata sobre su autor.

El afinado se realizó sobre unos pocos miles de pares (mensaje, paquete) procedentes del historial de mensajes de una sola persona, con consentimiento, etiquetados por un profesor LLM y validados por un etiquetador LLM contra reglas escritas. Los datos son privados y no se publican. El entrenamiento fue un fine-tune completo sobre pares de entailment con AdamW, learning rate 1e-5, weight decay 0,01, batch de 16, warm-up del 10 %, 512 tokens y semilla 13, con hasta 4 épocas y retención de la época 3 según el conjunto de desarrollo. La implementación de referencia (`topos_facts.py`) es código `transformers` estándar sin `trust_remote_code`.

## Capacidades

- Clasificación NLI zero-shot: entailment/not_entailment entre un mensaje y una hipótesis arbitraria.
- Detección de hechos personales sobre 27 paquetes (eventos de vida, metas, compromisos, narrativa personal, entre otros).
- Selección de opciones en campos de elección cerrada mediante puntuación de hipótesis con opciones.
- Puntuación de «el mensaje trata sobre su autor» (reportada, aunque en v0.1 no filtra).
- Extracción de valores de texto libre delegada al modelo lector complementario (spans copiados del mensaje).
- Ejecución en GPU, Apple MPS o CPU sin dependencias de generación.
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento: es un clasificador, no un modelo generativo.
- Multilingüismo: únicamente inglés.

## Casos de uso

- Memoria personal estructurada: procesar el historial de mensajes de un usuario y escribir hechos verificables (mudanza, nuevo empleo, meta declarada) como opciones cerradas o spans literales, sin riesgo de invención.
- Asistentes conversacionales con perfil de usuario: mantener un grafo de hechos actualizado a partir de cada turno, usando el gate para decidir qué predicados se activan y el lector para los valores libres.
- Enriquecimiento de CRM o atención al cliente: extraer eventos de vida y objetivos declarados por el cliente en correos o chats, con umbrales altos que reducen falsos positivos en producción.
- Filtrado previo a LLM generativos: usar el gate como primera etapa de bajo coste que solo pasa a un modelo mayor los mensajes con hechos detectados, reduciendo coste y alucinaciones.
- Investigación en extracción de información personal: línea base reproducible y ligera (435 M parámetros) para comparar con enfoques generativos con prompting.
- Moderación y análisis de salud o creencias: los predicados `special` con umbral 0,985 permiten detectar menciones sensibles con alta precisión para enrutarlas a revisión humana.
- Clasificación NLI genérica: al ser un cross-encoder DeBERTa-v3-large afinado, puede reutilizarse para tareas de entailment personalizadas pasando premisa e hipótesis propias.

## Benchmarks y rendimiento

Conjunto sintético de oro: 40 mensajes escritos a mano × 27 paquetes = 1.080 pares, evaluación a nivel de predicado.

| Modelo | F1 de predicado | Precisión | Recall | Predicados erróneos |
|---|---:|---:|---:|---:|
| GPT-5.4 mini, con prompting | 0,681 | 0,52 | 1,00 | ~74 |
| Qwen 3.5 9B, con prompting | 0,645 | 0,53 | 0,83 | ~50 |
| **Topos Facts v0.1** | **0,577** | **0,81** | 0,45 | **5** |
| Llama 3.3 70B, con prompting | 0,439 | 0,29 | 0,90 | ~250 |

Mensajes reales (privados): sobre ~29.000 registros del historial de una persona, un etiquetador LLM ciego con reglas escritas juzgó correctos el 73 % de una muestra de 240 hechos (intervalo del 95 %: 0,67–0,78). El mismo etiquetador juzgó correctos el 75 % de los hechos escritos por un LLM de 9B con prompting sobre los mismos datos. La precisión varía por paquete: eventos de vida 0,90; metas 0,67; compromisos 0,57; narrativa personal 0,55.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,7 GB en fp16 y alrededor de 0,9 GB en int8; en fp32, unos 3,5 GB. Cifras estimadas a partir de los 435 M de parámetros, no publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; A100, H100, L4, T4, RTX 4090, RTX 3090 y RTX 3060 son suficientes y quedan sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en cualquier tarjeta moderna con 4 GB o más, e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` con PyTorch (implementación de referencia `topos_facts.py`), exportación a ONNX Runtime, TorchScript o cuantización dinámica con PyTorch; también es compatible con endpoints de Hugging Face (`endpoints_compatible`).
- Latencia y throughput: no disponibles en la información proporcionada. Al ser un cross-encoder, el coste escala con el número de pares (mensaje, hipótesis) evaluados: 27 paquetes con múltiples predicados y opciones implican decenas o cientos de pasadas por mensaje, lo que conviene tener en cuenta en el dimensionamiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Precisión (conjunto sintético) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Topos Facts v0.1 · gate | 435 M | 512 | Encoder NLI + lector de spans | 0,81 | MIT | Hugging Face |
| MoritzLaurer/deberta-v3-large-zeroshot-v2.0-c | ~435 M | 512 | Encoder NLI zero-shot genérico | no disponible | MIT | Hugging Face |
| Qwen 3.5 9B (con prompting) | 9 B | no disponible | LLM generativo | 0,53 | no disponible | Hugging Face |
| Llama 3.3 70B (con prompting) | 70 B | no disponible | LLM generativo | 0,29 | licencia comunitaria Llama | Hugging Face |

La comparación con LLM generativos no es del todo equivalente: los modelos grandes logran mayor recall (hasta 1,00 en GPT-5.4 mini) a costa de mucha menor precisión y de un coste computacional muy superior. Frente a su modelo base, Topos Facts v0.1 añade la especificación de paquetes, umbrales y la integración con el lector, pero no se han publicado métricas del base sin afinar sobre este conjunto.

## Limitaciones y advertencias

- Solo inglés; no hay soporte multilingüe.
- Entrenado con los mensajes informales y notas de una única persona, por lo que la transferencia a otros estilos de escritura puede ser menor.
- Recall bajo por diseño: la mayoría de hechos que escribiría un LLM no los emite este modelo (recall 0,45 en el conjunto sintético).
- Los campos de texto libre quedan a menudo vacíos cuando el lector no encuentra un span claro.
- Los paquetes `obligations.commitments` y `narrative.self` son los más débiles (precisión 0,57 y 0,55 en datos reales); el autor recomienda desactivarlos.
- La puntuación «¿trata sobre el autor?» se reporta pero, con los umbrales de v0.1, no filtra nada.
- El sarcasmo, las citas y los hipotéticos pueden activar el gate y producir hechos falsos.
- Los umbrales están ajustados a precisión; bajarlos aumenta la cobertura pero también los falsos positivos.
- La licencia MIT permite uso comercial sin restricciones, pero los datos de entrenamiento son privados y no auditables; la evaluación en datos reales depende de un etiquetador LLM, que probablemente sea más indulgente que un juicio humano.
- El modelo no genera texto: no debe usarse como sustituto de un LLM para tareas abiertas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dialogues/topos-facts-gate-v0.1
- Modelo lector complementario: https://huggingface.co/Dialogues/topos-facts-reader-v0.1
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/Dialogues/topos-facts
- Modelo base: https://huggingface.co/MoritzLaurer/deberta-v3-large-zeroshot-v2.0-c
- Organización en Hugging Face: https://huggingface.co/Dialogues
- Sitio del producto Topos: https://topos.dialogues.ai
