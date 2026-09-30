# Mapika/decider-chat-gemma4-31b

## Resumen

decider-chat-gemma4-31b es un repositorio publicado por Mapika que no contiene un modelo entrenado, sino los pesos sin modificar de google/gemma-4-31B-it (revisión 842da379, 62,5 GB en bf16) junto a un fichero decider_config.json que redefine cómo se lee la salida del modelo. En lugar de generar texto token a token, el sistema trata la última posición de la plantilla de chat (con el modo thinking desactivado) como un slot de respuesta, lee la letra de la opción elegida y aplica un softmax sobre las letras candidatas. El resultado es una distribución de probabilidad sobre las opciones de cada pregunta tipada en un único forward pass, sin decodificación.

El modelo resuelve un problema concreto: obtener decisiones discretas con probabilidades calibradas (Choice, Noul —sí/no— y Score) de forma rápida y determinista, algo que un modelo generativo estándar no garantiza. Es relevante en flujos de enrutamiento, triaje y evaluación de políticas donde se necesita una probabilidad fiable por opción y latencias de decenas de milisegundos.

Con 31.273.088.876 parámetros, la arquitectura es la del Gemma 4 de 31B de Google (la model card no detalla capas ni mecanismo de atención); el repositorio añade un ajuste de temperatura dependiente del número de opciones, T(n) = max(0,05, 10,124 − 1,633 ln n), porque los modelos instruct de Gemma 4 resultan sobreconfiados con pocas opciones e infraconfiados con muchas. La licencia declarada es Apache-2.0 y el idioma documentado es únicamente el inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo base google/gemma-4-31B-it (familia Gemma 4); el repositorio no modifica los pesos y añade una configuración de lectura (readout) System One |
| Parámetros totales | 31.273.088.876 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16 (pesos publicados); no se documentan GGUF, 4-bit ni otras |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El repositorio no entrena nada: copia los pesos de google/gemma-4-31B-it en su revisión 842da379 y añade una configuración de lectura. La model card lo describe explícitamente como «the stock base model». La innovación no está en los pesos, sino en el procedimiento de lectura: se aplica la plantilla de chat del modelo con thinking off, se localiza el slot de respuesta, se lee la letra de la opción y se calcula un softmax sobre las letras de la lista de opciones, todo en un único forward pass. No hay decodificación autoregresiva ni muestreo.

El único elemento aprendido añadido es la regla de temperatura por número de opciones, ajustada por NLL (negative log-likelihood) sobre filas propias del autor, excluyendo las seis tareas cuyos test splits forman parte de la suite del Decision Index. La model card indica además que el autor reprodujo 300 filas almacenadas del índice con decider.serve y obtuvo la misma respuesta en 1412 de 1412 respuestas, con una diferencia mediana de probabilidad de 0,0001, lo que respalda la reproducibilidad del readout.

## Capacidades

- Clasificación con salida tipada: preguntas Choice (elección entre opciones), Noul (sí/no) y Score, cada una con su lista explícita de opciones.
- Distribución de probabilidad calibrada por pregunta, en lugar de una etiqueta única.
- Inferencia one-pass: una sola pasada hacia delante, sin decodificación.
- Procesamiento de varias preguntas tipadas sobre un mismo estado en una única entrada.
- Pipeline declarado en HuggingFace: text-classification.
- Salida estructurada (structured-output) integrable por API, con etiquetas decision-model y calibrated.
- Enfoque System One: pensado para decisiones rápidas, potencialmente combinable con un modelo de razonamiento (System Two) en arquitecturas duales.
- Idioma: únicamente inglés (en).
- No se documentan tool calling, agentes multi-step, visión, audio ni modo thinking activado.
- Latencia mediana de 108,5 ms medida en una RTX PRO 6000 según el Decision Index v0.2.1.

## Casos de uso

- Triaje de reembolsos y políticas: el caso de ejemplo de la propia model card pregunta si un reembolso está permitido bajo una política (criterios «allowed» / «not allowed»). El modelo devuelve la probabilidad de cada criterio en un solo forward pass, lo que permite fijar umbrales de automatización.
- Enrutamiento de peticiones: dado un estado y una lista de destinos posibles, el modelo puede actuar como clasificador de routing con probabilidades calibradas (ECE 0,047), útil para decidir entre varios servicios o colas.
- Moderación binaria: con preguntas de tipo Noul, puede puntuar si un contenido cumple una norma concreta, devolviendo una probabilidad en lugar de un texto que habría que parsear.
- Puntuación de opciones y ranking: con preguntas de tipo Score puede comparar alternativas de una lista cerrada y ordenarlas por probabilidad, por ejemplo en pruebas A/B o selección de variantes.
- Decisiones encadenadas en agentes: al no requerir decodificación y responder en ~108,5 ms, encaja como componente System One dentro de un bucle de agente que delega la decisión final en un modelo de razonamiento más lento.
- Clasificación de intenciones en atención al cliente: sobre el estado de una conversación, permite etiquetar la intención entre un conjunto fijo de opciones manteniendo las probabilidades para escalado humano cuando la confianza es baja.
- Evaluación de cumplimiento normativo: dado un estado y una policy, devuelve la probabilidad de cumplimiento por criterio, lo que facilita auditorías con umbrales explícitos.
- Estimación de coste asociado a despliegue de 31B en bf16 si no se publican cuantizaciones: no disponible.

## Benchmarks y rendimiento

Decision Index, edición v0.2.1 (28 de septiembre de 2026), medido sobre una RTX PRO 6000:

| Entrada | Puntuación (corregida por azar) | Posición | ECE | Latencia mediana |
|---|---|---|---|---|
| Decider chat · Gemma-4-31B | 57,33 | #2 de 70 | 0,047 | 108,5 ms |
| Jev 1.13.0 | 57,91 | no disponible | no disponible | no disponible |

Datos de reproducibilidad aportados por el autor: 1412 de 1412 respuestas coincidentes al reproducir 300 filas del índice con decider.serve, con una diferencia mediana de probabilidad de 0,0001.

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- Pesos en bf16: 62,5 GB según la model card; el repositorio completo ocupa 62,6 GB.
- VRAM estimada para inferencia en bf16: por encima de 62,5 GB solo para pesos, más caché KV y activaciones; en la práctica requiere GPUs de 80 GB.
- GPUs recomendadas: A100 80 GB, H100 80 GB o RTX PRO 6000 (esta última es la empleada para medir el Decision Index).
- GPUs de consumo: no cabe en bf16 en ninguna RTX de consumo. Una cuantización a 4 bits (~16-18 GB) en teoría cabría en una RTX 4090, pero no se publican cuantizaciones de este repositorio.
- Opciones de despliegue: decider.serve mediante uvicorn/FastAPI (endpoint POST /v1/systemone) y decider.serve_vllm para checkpoints grandes sobre vLLM. Requiere decider-ai >= 1.8.0.
- Latencia: 108,5 ms de mediana en RTX PRO 6000 según el Decision Index v0.2.1. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Decision Index | ECE | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| decider-chat-gemma4-31b | 31.273.088.876 | no disponible | 57,33 | 0,047 | Apache-2.0 | HuggingFace |
| google/gemma-4-31B-it | 31B (aprox.) | no disponible | no disponible (sin readout) | no disponible | Apache-2.0 según la model card | HuggingFace |
| Jev 1.13.0 | no disponible | no disponible | 57,91 | no disponible | no disponible | no disponible |
| Familia decider basada en Qwen3.5 | no disponible | no disponible | no disponible | no disponible | Apache-2.0 (código del readout) | GitHub / HuggingFace |

La model card cita la familia decider como «System One-style models fine-tuned from Qwen3.5», pero no aporta parámetros, contexto ni puntuaciones comparables de esas variantes.

## Limitaciones y advertencias

- No hay entrenamiento: el modelo es el base sin modificar, por lo que hereda su conocimiento, sus sesgos y todos sus modos de fallo. El readout solo añade un slot de respuesta fijo y una temperatura ajustada.
- Riesgo de alucinación: no genera texto libre, pero la distribución de probabilidad puede asignar masa a opciones incorrectas; la calibración se ha medido con ECE 0,047 en el Decision Index, no en dominios arbitrarios.
- Idiomas: únicamente inglés (en). No se documenta soporte multilingüe.
- Longitud de contexto no documentada, lo que impide planificar despliegues con entradas largas.
- Contradicción en los metadatos: la etiqueta de HuggingFace indica base_model:finetune:google/gemma-4-31B-it, mientras que la model card afirma que no hay entrenamiento. Conviene tratar el repositorio como un readout, no como un fine-tune.
- La regla de temperatura T(n) se ajustó por NLL sobre filas propias del autor y excluyendo las seis tareas de test del Decision Index; puede no generalizar a otros dominios.
- Dependencia de software: requiere el paquete decider-ai en versión 1.8.0 o superior y, para checkpoints grandes, la variante decider.serve_vllm.
- Adopción nula en el momento de la consulta: 0 descargas y 0 likes, sin validación externa independiente.
- Licencia: se declara Apache-2.0 tanto para los pesos como para el código del readout, pero al tratarse de pesos derivados de un Gemma conviene verificar los términos reales del modelo base antes de uso comercial.
- Sin cuantizaciones publicadas, el coste de despliegue en bf16 es alto (más de 62,5 GB de VRAM).

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Mapika/decider-chat-gemma4-31b)
- [Modelo base google/gemma-4-31B-it](https://huggingface.co/google/gemma-4-31B-it)
- [google/gemma-4-31B en HuggingFace](https://huggingface.co/google/gemma-4-31B)
- [Gemma 4 en Google DeepMind](https://deepmind.google/models/gemma/gemma-4/)
- [Gemma 4 model card (Google AI for Developers)](https://ai.google.dev/gemma/docs/core/model_card_4)
- [Repositorio GitHub Mapika/decider](https://github.com/Mapika/decider)
- [Colección decider en HuggingFace](https://huggingface.co/collections/Mapika/decider)
- [Decision Index](https://multimodalart-jev-decision-index.static.hf.space)
