# rony/gemma3-270m-typed-decisions

## Resumen

`rony/gemma3-270m-typed-decisions` es un ajuste fino completo (full fine-tune) de `google/gemma-3-270m-it` publicado por el usuario rony, que reconvierte un modelo de lenguaje de 268 millones de parámetros en un clasificador probabilístico de decisiones estructuradas. El modelo no genera texto libre: recibe un caso en JSON y una pregunta con opciones etiquetadas con letras (`A`, `B`, `C`, ...), y devuelve una distribución de probabilidad sobre esas opciones leyendo los logits del siguiente token restringidos a los tokens de las letras.

El entrenamiento se realiza sobre `LocalLLaMA/typed-decisions`, con 1080 casos de entrenamiento y 120 de validación, y se evalúa sobre 400 casos y 2000 decisiones nunca vistas. Cubre cuatro flujos de trabajo: observabilidad de trazas de agentes, atención al cliente, procesado de facturas e incidentes de seguridad, con tres tipos de pregunta (`choice`, `noul` verdadero/falso y `score` sobre rúbrica).

Su interés práctico reside en ofrecer probabilidades calibradas a un coste computacional mínimo: una única pasada forward por pregunta, cinco por caso, con 68 ms por caso medidos en CUDA y Apple Silicon. El repositorio no tiene descargas ni valoraciones en el momento de redactar esta ficha, y no se han publicado cuantizaciones alternativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia `gemma3_text`), sin mezcla de expertos |
| Parametros totales | 268.098.176 (≈268 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | `gemma` (Google Gemma Terms of Use) |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Gemma 3 (`gemma3_text`) con 268.098.176 parámetros. El ajuste es completo (todos los pesos se actualizan), no un adaptador LoRA. La innovación no está en la arquitectura, sino en la interfaz de salida: cada par (caso, pregunta) se formatea como un único prompt que incluye el JSON del caso, las instrucciones de la pregunta y sus opciones listadas como letras con su descripción. En lugar de muestrear texto, el modelo toma los logits del siguiente token en la posición de respuesta, los restringe a los tokens de las letras de las opciones y aplica softmax sobre ellos para obtener la distribución de respuesta. El entrenamiento minimiza la entropía cruzada suave contra la distribución dorada, y la inferencia requiere una sola pasada forward por pregunta (cinco por caso completo). El autor indica el uso de `attn_implementation="eager"` en el ejemplo de referencia.

Los datos de entrenamiento proceden del dataset `LocalLLaMA/typed-decisions`: 1080 casos para `train` (los cuatro flujos de trabajo) y 120 casos reservados para seleccionar la época según la KL de validación. La referencia dorada no es una etiqueta humana directa, sino la media de tres muestras de un modelo profesor, por lo que las métricas miden la concordancia con ese profesor (con una autoconsistencia del profesor de aproximadamente 0,735). El modelo card no documenta el uso de RLHF, DPO ni otros métodos de alineación posteriores al ajuste supervisado, ni detalla el número de tokens de entrenamiento.

## Capacidades

- Clasificación probabilística de decisiones estructuradas: devuelve una distribución de probabilidad sobre un conjunto cerrado de opciones etiquetadas con letras (`A` a `J`, según `LETTERS = "ABCDEFGHIJ"`).
- Soporte de tres tipos de pregunta: `choice` (elegir una opción entre varios criterios), `noul` (verdadero/falso sobre una afirmación) y `score` (seleccionar un nivel en una rúbrica).
- Entrada en JSON: consume el estado del caso serializado y las instrucciones de la pregunta, lo que facilita la integración con pipelines que ya manejan estructuras JSON.
- Salida calibrada: la distribución de probabilidad permite aplicar umbrales de confianza y derivar automáticamente a revisión humana.
- Cobertura de cuatro flujos de trabajo: `agent_trace_observability`, `customer_service`, `invoice_processing` y `security_incidents`.
- Ejecución de baja latencia: una pasada forward por pregunta, sin decodificación autoregresiva de texto.
- No se ha documentado soporte de tool calling, function calling, uso de agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- Capacidades multilingües: no disponibles en la informacion proporcionada.

## Casos de uso

- Enrutado de tickets de atención al cliente: el modelo asigna probabilidades a las categorías o niveles de prioridad definidos como opciones, y el sistema deriva a un agente humano los casos cuya probabilidad máxima queda por debajo de un umbral. Es adecuado porque el flujo `customer_service` obtiene la mejor accuracy del conjunto (0,770).
- Triaje de incidentes de seguridad: dada la descripción de un incidente, devuelve la distribución sobre niveles de severidad o acciones recomendadas. El flujo `security_incidents` alcanza 0,744 de accuracy con la KL más baja por flujo (0,086), y su ECE alto (0,163) obliga a calibrar los umbrales antes de automatizar la respuesta.
- Validación y puntuación de facturas: usando preguntas de tipo `score` sobre una rúbrica, el modelo puntúa campos o incidencias de facturas para decidir si requieren revisión manual. Es el flujo con peor accuracy (0,666) y peor KL (0,291) pero el mejor ECE (0,039), lo que lo hace apto para decisiones basadas en umbral de confianza más que en la clase argmax.
- Evaluación de trazas de agentes: analiza la traza serializada de un agente y responde preguntas booleanas o de elección sobre si la ejecución fue correcta. Es el flujo con menor accuracy (0,626), por lo que conviene usarlo como señal agregada y no como veredicto binario.
- Monitorización de calidad en producción con umbral de confianza: al disponer de probabilidades calibradas, se puede enviar a revisión humana únicamente el porcentaje de casos con mayor incertidumbre, reduciendo el coste de anotación.
- Preetiquetado para anotación humana: el modelo genera distribuciones sobre opciones que los anotadores corrigen, acelerando la creación de datasets etiquetados en dominios de decisión estructurada.
- Enrutado de bajo coste en el borde: con 268 M de parámetros y una sola pasada forward por pregunta, puede ejecutarse en CPU o en GPUs de gama baja como paso previo a un modelo mayor que solo se invoca en los casos ambiguos.

## Benchmarks y rendimiento

Evaluación sobre `LocalLLaMA/typed-decisions`, split `all/test` (400 casos, 2000 decisiones), no visto en entrenamiento. La referencia dorada es la media de tres muestras de un profesor (autoconsistencia del profesor ≈ 0,735).

| Modelo | Tipo | Accuracy ↑ | KL respecto al dorado ↓ | Brier ↓ | ECE ↓ | Latencia |
|---|---|---|---|---|---|---|
| gemma3-270m-typed-decisions | full fine-tune sobre `train` | 0,702 | 0,1555 | 0,0914 | 0,1282 | 68 ms / caso (CUDA, Apple Silicon) |
| Gemma 3 270M zero-shot | sin ajuste | 0,279 | 1,068 | no disponible | no disponible | no disponible |
| Baseline prior | distribución previa del dataset | 0,478 | 0,327 | no disponible | no disponible | no disponible |

Desglose por tipo de pregunta:

| Tipo | Accuracy | KL | Brier | ECE |
|---|---|---|---|---|
| choice | 0,635 | 0,190 | 0,102 | 0,083 |
| noul | 0,770 | 0,124 | 0,093 | 0,060 |
| score | 0,700 | 0,153 | 0,082 | 0,157 |
| OVERALL | 0,702 | 0,155 | 0,091 | 0,097 |

Desglose por flujo de trabajo:

| Flujo | Accuracy | KL | Brier | ECE |
|---|---|---|---|---|
| agent_trace_observability | 0,626 | 0,117 | 0,072 | 0,105 |
| customer_service | 0,770 | 0,129 | 0,069 | 0,118 |
| invoice_processing | 0,666 | 0,291 | 0,176 | 0,039 |
| security_incidents | 0,744 | 0,086 | 0,048 | 0,163 |
| OVERALL | 0,702 | 0,155 | 0,091 | 0,097 |

Nota del autor: el ECE de la tabla principal se calcula por pregunta y se promedia sobre las 20 preguntas (0,1282); agrupado sobre todas las decisiones es 0,0971. Las distribuciones completas de test están en `test_predictions.jsonl` y las métricas en `test_metrics.json`. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generalistas en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 1,1 GB, coherente con pesos en precisión completa (268 M de parámetros × 4 bytes ≈ 1,07 GB). En bf16 los pesos ocuparían aproximadamente 0,54 GB. Con la caché KV de prompts cortos, 2 GB de VRAM son suficientes en cualquier configuración razonable.
- GPU recomendadas: no se requiere hardware de centro de datos. Sirven GPUs de gama baja y media (T4, L4, RTX 3060 en adelante) y también GPUs de gama alta (RTX 4090, A100, H100) si se necesita procesar lotes grandes en paralelo.
- Compatibilidad con GPU de consumo: sí, en cualquier GPU de consumo con al menos 2 GB de VRAM; el ajuste completo de 268 M también cabe en GPU integrada y en CPU.
- Opciones de despliegue: `transformers` está soportado y es el método documentado por el autor. El repositorio incluye la etiqueta `text-generation-inference` y `endpoints_compatible`. El soporte en vLLM, llama.cpp y Ollama no está documentado en la informacion disponible.
- Latencia: 68 ms por caso (cinco decisiones por caso, aproximadamente 13,6 ms por decisión) medidos en CUDA y Apple Silicon. No se publican cifras de throughput agregado ni de latencia por lote.
- Requisito técnico relevante: el ejemplo oficial carga el modelo con `attn_implementation="eager"`, ya que la lógica de decisión lee directamente los logits de la última posición en lugar de generar tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy en typed-decisions | KL | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rony/gemma3-270m-typed-decisions | 268.098.176 | no disponible | 0,702 | 0,1555 | gemma | HuggingFace, safetensors |
| google/gemma-3-270m-it (zero-shot) | ≈270 M | no disponible en la informacion proporcionada | 0,279 | 1,068 | gemma | HuggingFace |
| Baseline prior del dataset | no aplica (no es un modelo) | no aplica | 0,478 | 0,327 | no aplica | no aplica |
| Otros modelos de decision tipada comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con modelos generalistas de tamaño similar no es significativa para esta tarea, ya que el modelo evaluado no genera texto libre sino distribuciones sobre opciones cerradas. No se dispone de resultados publicados de otros ajustes equivalentes sobre el mismo dataset.

## Limitaciones y advertencias

- Accuracy global de 0,702: aproximadamente tres de cada diez decisiones no coinciden con la referencia del profesor; no es apto para decisiones automatizadas sin revisión en dominios sensibles.
- Calibración imperfecta: el ECE por pregunta es 0,1282 (0,0971 agrupado), con un caso especialmente desfavorable en preguntas de tipo `score` (ECE 0,157) y en el flujo `security_incidents` (ECE 0,163). Los umbrales de confianza deben recalibrarse con datos propios.
- La referencia dorada es la media de tres muestras de un modelo profesor, no una etiqueta humana. La autoconsistencia del profesor es de aproximadamente 0,735, por lo que parte del error medido refleja ruido de la propia referencia y existe un techo práctico de rendimiento.
- Volumen de entrenamiento reducido: 1080 casos y 120 de validación. El modelo puede degradarse ante distribuciones de casos distintas de las cuatro cubiertas.
- Dominio cerrado: está entrenado para cuatro flujos concretos; no es un modelo conversacional, no genera texto libre y no se ha documentado soporte de tool calling ni razonamiento multi-paso.
- Restricción estructural de las opciones: la implementación de referencia usa los tokens de las letras `A` a `J`, lo que limita el número de opciones a diez.
- El rendimiento depende del formato exacto del prompt (JSON del caso, instrucciones, listado de opciones y plantilla de chat); cambios en la plantilla alteran la distribución de salida.
- Idiomas soportados no documentados; no hay evidencia de comportamiento multilingüe más allá de lo heredado del modelo base.
- Licencia Gemma: el uso comercial está sujeto a los términos de Google, que incluyen obligaciones de redistribución de la licencia y una política de uso aceptable. Conviene revisar el texto completo antes de desplegar en producción.
- Sin datos de sesgo, robustez adversaria ni comportamiento ante entradas malformadas. El repositorio no tiene descargas ni valoraciones, por lo que no existe validación independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rony/gemma3-270m-typed-decisions
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Dataset de entrenamiento y evaluación: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Artefactos de evaluación citados en la model card: `test_predictions.jsonl` y `test_metrics.json` en el repositorio del modelo
- La busqueda web no ha devuelto resultados relevantes sobre este modelo: los enlaces obtenidos corresponden a contenidos no relacionados (Walmer Castle y un articulo sobre inferencia en dispositivos) y no se incluyen.
