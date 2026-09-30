# Mapika/decider-chat-qwen3.6-27b

## Resumen

decider-chat-qwen3.6-27b es un paquete de inferencia publicado por Mapika que contiene los pesos íntegros de Qwen/Qwen3.6-27B (revisión `6a9e13bd`, 27.781.427.952 parámetros, 55,6 GB en bf16) junto con un fichero `decider_config.json` que permite leer el modelo base como un clasificador de decisiones tipadas. No hay entrenamiento ni ajuste fino: los pesos son los del modelo base sin modificar, y lo que añade el repositorio es una capa de lectura (readout) que fija un slot de respuesta y aplica softmax sobre las letras de las opciones.

El problema que resuelve es concreto: convertir un modelo generativo en un decisor de una sola pasada hacia delante que devuelve una distribución de probabilidad calibrada sobre un conjunto explícito de opciones, en lugar de generar texto token a token. Admite preguntas de tres tipos (Choice, Noul yes/no y Score), cada una con su lista de opciones, y responde a todas ellas en un único forward pass, sin decodificación autorregresiva.

Es relevante porque encaja en el catálogo Decision Index (edición v0.2.1) como la entrada "Decider chat · Qwen3.6-27B", con una puntuación corregida por azar de 51,35 en el puesto 8 de 70, un ECE de 0,021 y una latencia mediana de 83,6 ms medida sobre una RTX PRO 6000. El repositorio no registra descargas ni likes en el momento de la consulta y su idioma declarado es únicamente el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5/Qwen3.6); detalle interno no disponible |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (pesos publicados); el repositorio no publica variantes cuantizadas |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 (pesos del modelo base y codigo de readout) |
| Formato de pesos | safetensors (bf16) |
| Modelo base | Qwen/Qwen3.6-27B (revision 6a9e13bd) |
| Tamano del repositorio | 55,6 GB |
| Pipeline declarado | text-classification |
| Dependencia de inferencia | decider-ai >= 1.5.0 |

## Arquitectura y entrenamiento

El repositorio no entrena nada. Contiene los pesos originales de Qwen/Qwen3.6-27B en bf16 y un `decider_config.json` que define cómo se lee el modelo. El procedimiento de lectura consiste en aplicar la plantilla de chat del modelo con el modo thinking desactivado, leer la letra de la opción en el slot de respuesta y aplicar un softmax sobre las letras candidatas. El resultado es una distribución de probabilidad sobre las opciones de cada pregunta, obtenida en un solo forward pass y sin etapa de decodificación.

La única pieza ajustada es la temperatura, fijada en T = 1,943. Se ajustó por log-verosimilitud negativa (NLL) sobre filas propias de la tarea del autor, excluyendo las seis tareas cuyos splits de test forman parte de la suite del Decision Index. Una regla basada en el número de opciones aporta prácticamente nada a este modelo, por lo que se mantiene una temperatura única en lugar de un esquema por recuento de opciones. No se documentan en la información disponible detalles sobre la composición del dataset de entrenamiento del modelo base, el número de tokens, ni si hubo fases de RLHF o DPO.

## Capacidades

- Decision tipada de una sola pasada: dada una situación (state) y una o varias preguntas con listas de opciones explícitas, devuelve una distribución de probabilidad sobre las opciones.
- Tres tipos de campo soportados: Choice (elección entre varias opciones), Noul yes/no (pregunta binaria con criterios `true`/`false`) y Score.
- Respuesta a múltiples preguntas en un único forward pass, sin decodificación autorregresiva.
- Probabilidades calibradas: ECE de 0,021 en la edición v0.2.1 del Decision Index.
- Salida estructurada y determinista en formato, apta para consumo por programas.
- Reproducibilidad verificada: en una repetición de 300 filas almacenadas, el paquete eligió la misma respuesta que la ejecución guardada en 1.431 de 1.438 respuestas, con una diferencia de probabilidad mediana de 0,0003.
- Capacidad multilingüe: no soportada más allá del inglés declarado.
- Tool calling, agentes multi-paso, visión, audio y modo thinking: no disponibles o no aplicables; el readout se define explícitamente con el modo thinking desactivado.
- Conocimiento, razonamiento y modos de fallo: los del modelo base, sin modificación alguna.

## Casos de uso

- Automatización de reembolsos y políticas internas: el modelo base recibe el estado de la solicitud y una pregunta Noul yes/no con criterios ("allowed" / "not allowed"), y devuelve una probabilidad que permite aplicar umbrales de aprobación automática frente a revisión humana. Es el ejemplo canónico de la propia model card.
- Enrutamiento de tickets de soporte: cada ticket se plantea como una pregunta Choice con las colas disponibles como opciones; la distribución resultante permite enrutar por máxima probabilidad y derivar a revisión manual los casos con confianza baja.
- Moderación de contenido con umbral de calibración: al disponer de un ECE bajo (0,021), las probabilidades son utilizables directamente para fijar cortes operativos sin recalibración posterior.
- Puertas de decisión en pipelines de agentes: actuar como componente de decisión ("continuar / escalar / abortar") alimentado por el estado acumulado, sustituyendo una llamada generativa por un único forward pass de 83,6 ms de mediana.
- Clasificación por lotes de formularios y cumplimiento normativo: múltiples preguntas tipadas evaluadas en la misma pasada sobre un estado común, lo que reduce el coste frente a una llamada por criterio.
- Puntuación de riesgo con salida probabilística: usando el tipo Score para ordenar casos por probabilidad y priorizar colas de revisión.
- Enrutamiento de consultas en sistemas RAG: decidir qué índice o herramienta consultar antes de recuperar, con una llamada de baja latencia.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Decision Index v0.2.1 (2026-09-28), puntuacion corregida por azar | 51,35 |
| Ranking en la edicion | puesto 8 de 70 |
| ECE | 0,021 |
| Latencia mediana | 83,6 ms |
| Jev 1.13.0 en la misma edicion (referencia) | 57,91 |
| Repeticion de 300 filas almacenadas | 1.431 de 1.438 respuestas identicas; diferencia de probabilidad mediana 0,0003 |
| Hardware de medicion | una RTX PRO 6000 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks generativos en la informacion disponible. Tampoco se publica throughput ni latencia por lote.

## Requisitos de hardware

- VRAM estimada en bf16: en torno a 55,6 GB solo para pesos, más overhead de activaciones y contexto; en la práctica requiere del orden de 60 GB o más.
- GPU empleada en las mediciones del Decision Index: una RTX PRO 6000 (96 GB), que aloja el modelo en una sola tarjeta.
- GPU recomendadas: RTX PRO 6000 (96 GB), H100 80 GB, A100 80 GB. Configuraciones de 48 GB o menos no son suficientes en bf16.
- GPU de consumo: no cabe en bf16 en ninguna GPU de consumo actual. Una cuantización a 4 bits lo situaría en torno a 14-16 GB y cabría en una RTX 4090 o RTX 5090, pero el repositorio no publica pesos cuantizados ni garantiza que el readout calibrado se mantenga tras cuantizar; ese cálculo no está verificado en la información disponible.
- Despliegue: `decider.serve` (servidor uvicorn con endpoint POST `/v1/systemone`) y `decider.serve_vllm` para checkpoints grandes sobre vLLM. El paquete requiere `decider-ai>=1.5.0`. No se documentan integraciones con llama.cpp, Ollama ni TGI para este repositorio; Ollama ofrece únicamente el modelo base `qwen3.6:27b`.
- Latencia: 83,6 ms de mediana por decisión sobre RTX PRO 6000. Throughput agregado: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (Decision Index v0.2.1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| decider-chat-qwen3.6-27b | 27,78 B | no disponible | 51,35 (puesto 8/70), ECE 0,021, 83,6 ms | Apache-2.0 | HuggingFace (pesos bf16 + config de readout) |
| Jev 1.13.0 | no disponible | no disponible | 57,91 en la misma edicion | no disponible | referenciado como comparador en la model card |
| Mapika/decider-2b | no disponible | no disponible | no disponible | Apache-2.0 | HuggingFace |
| Qwen/Qwen3.6-27B (base) | 27,78 B | no disponible | no aplica (modelo generativo, sin readout de decision) | Apache-2.0 | HuggingFace, Ollama (`qwen3.6:27b`) |

La comparación con Jev 1.13.0 procede de la propia model card y sitúa a este modelo 6,56 puntos por debajo en la misma edición del índice. No hay datos publicados que permitan comparar decider-chat-qwen3.6-27b con modelos generativos de propósito general en tareas de decisión.

## Limitaciones y advertencias

- El repositorio no entrena ni modifica el modelo base: la calidad de las decisiones, el conocimiento y los modos de fallo son exactamente los de Qwen/Qwen3.6-27B. El readout solo añade un slot de respuesta fijo y una temperatura ajustada.
- Las respuestas están restringidas a las opciones declaradas explícitamente en cada pregunta; no hay generación libre.
- Es un modelo de clasificación y decisión, no un generador de texto: no debe emplearse para redactar, resumir ni mantener conversaciones abiertas.
- Idioma: únicamente inglés declarado. No hay evidencia de soporte fiable en castellano ni en otros idiomas.
- Longitud de contexto: no disponible; se desconoce el límite efectivo al aplicar el readout.
- Riesgo de alucinación: no aplica en el sentido generativo (no produce texto libre), pero sí existe riesgo de decisiones erróneas o mal calibradas cuando el estado de entrada es ambiguo o queda fuera de la distribución de las tareas evaluadas.
- La temperatura T = 1,943 se ajustó por NLL excluyendo las seis tareas cuyos splits de test forman parte de la suite del Decision Index; su comportamiento fuera de ese dominio no está validado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación independiente por parte de terceros.
- Requiere la dependencia externa `decider-ai>=1.5.0`; el readout no funciona con una inferencia estándar de transformers sin ese paquete.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.6-27B por separado.
- El repositorio no publica pesos cuantizados, de modo que el despliegue en hardware de consumo queda sin soporte verificado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mapika/decider-chat-qwen3.6-27b
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Repositorio del código de readout: https://github.com/Mapika/decider
- Colección decider en HuggingFace: https://huggingface.co/collections/Mapika/decider
- Entrada relacionada, decider-2b: https://huggingface.co/Mapika/decider-2b
- Decision Index: https://multimodalart-jev-decision-index.static.hf.space
- Qwen3.6 en Ollama: https://ollama.com/library/qwen3.6
- Qwen3.6:27b en Ollama: https://ollama.com/library/qwen3.6:27b
