# Interchained/bison-1-GGUF

## Resumen

bison-1 es un modelo de decisión de 31B parámetros desarrollado por Base Labs (Baseten), post-entrenado a partir de Gemma-4-31B IT de Google. No es un modelo conversacional: recibe un estado (texto, opcionalmente con imágenes) y un conjunto de preguntas con nombre, y devuelve una probabilidad calibrada para cada opción, respondiendo todas las preguntas desde un único prefill de prefijo compartido y sin generar texto libre. Su salida se materializa en un readout de slots (256 slots, head_dim 256), no en tokens generados.

En el índice Artificial Analysis Decision Index v2.1 ocupa la posición #1 de 19 modelos de decisión con una puntuación de 76, y es el modelo mejor calibrado del índice con un Brier score de 0,14. El repositorio comentado es la conversión GGUF realizada por Interchained LLC con su herramienta Hearth sobre un fork propio de llama.cpp.

La relevancia de esta ficha es doble: por un lado, documenta un paradigma poco habitual (modelos de decisión frente a modelos generativos); por otro, expone con honestidad una limitación de despliegue importante: los pesos son abiertos (MIT para las modificaciones de Baseten, Apache 2.0 para la base Gemma), pero el repositorio upstream no incluye decodificador, codebook ni código de serving, de modo que la obtención de respuestas con nombre sigue dependiendo de la API de Baseten.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Gemma-4-31B IT, con atención bidireccional por bloques en las capas de atención completa (`baseten_modeling_overrides`); readout de slots (`slot_lm`, 256 slots, head_dim 256) |
| Parámetros totales | 31B |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | auto (maestro full-precision), q8_0, q6_k, q5_k_m, q4_k_m, q4_0, q3_k_m, q2_k, tq1_0; proyector de visión en f16 |
| Idiomas soportados | en |
| Licencia | MIT (modificaciones de Baseten); base Gemma Apache 2.0 |
| Formato de pesos | GGUF (834 tensores en la conversión maestra); `mmproj-bison-1-f16.gguf` para visión |

## Arquitectura y entrenamiento

bison-1 parte de Gemma-4-31B IT y se post-entrena como modelo de decisión en lugar de como modelo de chat. La innovación principal es el protocolo System One de Baseten: una petición transporta un `state` y cualquier número de `questions` con nombre, cada una de un tipo concreto (`noul` para sí/no, `choice` para opciones con descripción, `score` para niveles ordenados). Todas las preguntas se resuelven desde un único prefill de prefijo compartido, sin generación de texto, y las respuestas se emiten mediante un readout de slots definido en `readout.json` (`"readout": "slot_lm"`, 256 slots, head_dim 256).

La configuración incluye `baseten_modeling_overrides` con atención bidireccional por bloques en las capas de atención completa, un detalle que los runtimes estándar no implementan. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la documentación proporcionada. La conversión GGUF la realizó Interchained LLC con Hearth sobre su fork `aiassistsecure/llama.cpp`; durante la misma se corrigió un bug del exportador de visión de Gemma que filtraba `lm_head.weight` al proyector.

## Capacidades

- Emisión de probabilidades calibradas para preguntas de tipo sí/no (`noul`), elección entre opciones con nombre (`choice`) y puntuación sobre niveles ordenados (`score`).
- Procesamiento de estados multimodales: acepta imágenes además de texto mediante el proyector `mmproj-bison-1-f16.gguf` de 1,2 GB.
- Respuesta a múltiples preguntas en una sola pasada mediante prefill de prefijo compartido.
- Calibración destacada: mejor Brier score del Artificial Analysis Decision Index v2.1 (0,14).
- No soporta generación de texto conversacional: si se le induce a chatear, la cabeza de texto entra en bucle (por ejemplo, `B1L de de de la de la la de...`).
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en el material disponible.
- Capacidad multilingüe limitada al inglés según los metadatos del repositorio.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de una reclamación, formular preguntas `choice` para asignar equipo (facturación, técnico, legal) y `score` para la urgencia, aprovechando la calibración para priorizar la cola.
- Triaje de reembolsos: usar preguntas `noul` (¿procede el reembolso?) y `score` (urgencia) sobre el estado de la solicitud, con probabilidades que permiten fijar umbrales de revisión humana.
- Moderación de contenido con umbral calibrado: formular preguntas de tipo `noul` sobre categorías de riesgo y usar la probabilidad de sí para decidir entre auto-aprobación, revisión o bloqueo.
- Clasificación de documentos con imagen: al aceptar estados multimodales, permite decidir sobre capturas, formularios escaneados o facturas sin pipeline OCR separado.
- Señal de decisión para sistemas de agentes: usar las probabilidades como entrada de un policy o router que selecciona la siguiente acción, en lugar de parsear texto generado.
- Investigación sobre decodificadores de slots: el GGUF permite observar el readout en los logits (bloque de tokens 236744-236863) y sirve de banco de pruebas para quien implemente un decodificador `slot_lm` en runtimes abiertos.
- Evaluación de calibración: comparar la fiabilidad de las probabilidades frente a modelos generativos con prompting, usando el Brier score como métrica.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| Artificial Analysis Decision Index v2.1 | 76 (posición #1 de 19 modelos de decisión) |
| Brier score (Decision Index v2.1) | 0,14 (mejor calibrado del índice) |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar de lenguaje.

## Requisitos de hardware

- VRAM estimada según cuantización: tq1_0 7,6 GB; q2_k 12 GB; q3_k_m 15 GB; q4_0 18 GB; q4_k_m 19 GB; q5_k_m 22 GB; q6_k 25 GB; q8_0 32 GB; maestro auto 60 GB. El proyector de visión añade 1,2 GB si se usa entrada de imagen.
- GPU recomendadas: para q8_0 y el maestro, A100 80 GB o H100; para q4_k_m y q5_k_m, RTX 4090 (24 GB) o A6000; para tq1_0, q2_k y q3_k_m, GPU de consumo con 12-16 GB.
- Cabe en GPU de consumo: sí, en las cuantizaciones q4_k_m y menores (RTX 4090, 4080, 3090); tq1_0 y q2_k caben en 12 GB.
- Despliegue: llama-server del fork `aiassistsecure/llama.cpp` de Interchained, con `--jinja`; la verificación documentada se hizo con q4_k_m. No se documenta soporte en vLLM, TGI, Ollama ni llama.cpp upstream.
- Latencia y throughput: no disponibles. La verificación del readout se realizó consultando `top_logprobs` en llama-server; el modelo no genera texto más allá de la ventana de readout (unas dos posiciones), por lo que el coste dominante es el prefill del estado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bison-1 (este) | 31B | no disponible | #1 de 19 en Decision Index v2.1 (76), Brier 0,14 | MIT (modificaciones) / Apache 2.0 (base) | Pesos GGUF abiertos; respuestas con nombre solo vía API de Baseten |
| elephant-1 (Baseten) | no disponible | no disponible | no disponible | no disponible | Pesos abiertos con script de instalación de runtime de decisión fijado |
| Gemma-4-31B IT | 31B | no disponible | no disponible en esta información | Apache 2.0 | Pesos abiertos con runtimes estándar |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de chat: si se le induce a generar texto libre, la cabeza de texto entra en bucle y produce fragmentos sin sentido; no debe evaluarse con pruebas de chat.
- Los pesos abiertos no incluyen decodificador, codebook ni código de serving para bison-1; la asignación de slots a respuestas con nombre la realiza la capa de serving de Baseten. La vía totalmente soportada para obtener respuestas con nombre es su API.
- La configuración requiere `baseten_modeling_overrides` (atención bidireccional por bloques) que los runtimes estándar no implementan; el GGUF funciona en el fork de llama.cpp de Interchained, no necesariamente en llama.cpp upstream.
- El readout decae tras unas dos posiciones; un cliente de chat que siga generando sale de la ventana y produce texto degenerado.
- Idioma limitado al inglés según los metadatos; no se documenta cobertura multilingüe.
- Riesgo de alucinación no evaluado en la información disponible; al no generar texto, el riesgo se traslada a la calibración de las probabilidades, que puede degradarse en distribuciones alejadas del entrenamiento.
- Sesgos conocidos: no documentados; al derivar de Gemma-4-31B IT, podría heredar sesgos de la base, pero no hay datos al respecto.
- Uso comercial: las modificaciones de Baseten son MIT y la base Gemma es Apache 2.0, pero conviene verificar los términos de la API de Baseten si se usa el servicio alojado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; la conversión es reciente y no cuenta con validación comunitaria independiente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Interchained/bison-1-GGUF
- Modelo base: https://huggingface.co/baselabs/bison-1
- Fork de llama.cpp usado: `aiassistsecure/llama.cpp` (referenciado en la model card, sin URL directa en la información disponible)
- Modelo hermano elephant-1: no disponible URL en la información proporcionada
- Artificial Analysis Decision Index v2.1: no disponible URL en la información proporcionada
