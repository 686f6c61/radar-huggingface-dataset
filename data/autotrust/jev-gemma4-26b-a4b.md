# autotrust/JEV-Gemma4-26B-A4B

## Resumen

autotrust/JEV-Gemma4-26B-A4B es un bundle de pesos abiertos publicado por AutoTrust AI que integra dos sistemas sobre los mismos pesos base de google/gemma-4-26B-A4B-it, un modelo de mezcla de expertos (MoE) con 25.805.936.206 parametros totales y aproximadamente 4.000 millones de parametros activos por token, con entrada de texto e imagen. El denominado "System 2" es el modelo base sin modificar, orientado a generacion y razonamiento; el "System 1" anade un adaptador LoRA y una cabeza de decision de 24 slots que devuelve probabilidades calibradas para tres primitivas tipadas (`noul`, `choice`, `score`) en una sola pasada de prefill.

El modelo resuelve el problema de obtener decisiones discretas y calibradas en lugar de generacion abierta: en vez de producir texto libre, lee un estado, una pregunta y un conjunto de opciones y devuelve una distribucion de probabilidad sobre las respuestas posibles. Es relevante porque reporta un Decision Index (balanced skill) de 58.05 en una ejecucion completa de la suite 0.2.1 con 150.317 peticiones puntuadas (150.759 totales, 0 errores), ligeramente por encima del modelo cerrado TypeSafe Jev 1.13 (57.91 segun el board citado en la model card).

Conviene subrayar que AutoTrust AI es una entidad independiente y que este modelo no esta afiliado, respaldado ni es producto de TypeSafe AI, fabricante del modelo propietario TypeSafe Jev 1.13 con el que se compara.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) transformer sobre base Gemma 4; bundle de dos sistemas (generacion abierta + cabeza lineal de decision) |
| Parametros totales | 25.805.936.206 |
| Parametros activos | Aproximadamente 4.000 millones por token (segun model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (incluye adaptador LoRA y cabeza `head.safetensors`) |

## Arquitectura y entrenamiento

La base es `google/gemma-4-26B-A4B-it`, un transformer de mezcla de expertos con 26.000 millones de parametros totales y unos 4.000 millones activos por token, capaz de procesar texto e imagen. El System 2 se sirve sin modificar y es bit-identico al modelo base. El System 1 se implementa como un adaptador LoRA fusionado en memoria sobre el backbone en bf16, mas una cabeza lineal en fp32 que proyecta el estado oculto de la ultima capa (hidden 2.816) a 24 slots, con soft-cap en 30 al estilo de los logits propios de Gemma. La plantilla de entrada es `bare-v1`, prefijada con `<bos>`: `[kind] … [state] … [question] … [options] A) … [decision]:`. La lectura no genera tokens: los slots inactivos se enmascaran, los logits se dividen por la temperatura por tipo y se aplica softmax. Para preguntas con mas de 16 opciones, se leen en grupos contiguos de 16 mas un bloque final de 16, sin podar ninguna opcion.

En cuanto al entrenamiento, la model card declara que el System 1 se entreno con distribuciones de un profesor (teacher distributions) y datos de decision con verdad de referencia. Esos datos de verdad incluyen los splits publicos de entrenamiento de algunos datasets cuyos splits de test usa el Decision Index; segun el autor, no se uso ningun split de test de ningun benchmark y los items de la suite se excluyeron antes del entrenamiento. El autor advierte explicitamente que MMMU y MMMU-Pro no son evaluaciones validas para este modelo. Las temperaturas de calibracion son: `calibration.json` (por defecto) con noul 1.003, choice 1.017 y score 0.999; y `calibration_gold.json` con noul 1.214, choice 1.098 y score 1.000, recomendada cuando se condicionan acciones automaticas a la confianza.

## Capacidades

- Generacion de texto y razonamiento abierto mediante el System 2 sin modificar, identico al modelo base Gemma 4.
- Entrada multimodal de texto e imagen en el System 2 (tag `image-text-to-text`).
- Decision tipada `noul` (verdadero/falso) con probabilidades calibradas.
- Decision tipada `choice` con 2 a 16 opciones por pasada; preguntas mas amplias se leen en grupos de 16 mas un bloque final.
- Decision tipada `score` en escala 0 a 5.
- Devuelve probabilidades calibradas en una sola pasada de prefill, sin generacion autoregresiva.
- Cabeza de decision de 24 slots con soft-cap de logits a 30 y softmax por temperatura.
- Soporte de integracion con `transformers` y `peft` (fusion en memoria del adaptador).

## Casos de uso

- Enrutado de decisiones binarias en pipelines de atencion al cliente: usar `noul` para responder preguntas como "¿el cliente pide una devolucion?" con una probabilidad calibrada que permita umbralizar acciones automaticas.
- Triaje de clasificacion con opciones cerradas: usar `choice` para asignar una categoria entre 2 y 16 opciones (por ejemplo, tipo de incidencia) con una distribucion de probabilidad en lugar de una etiqueta dura.
- Puntuacion de calidad o satisfaccion: usar `score` en escala 0 a 5 para evaluar transcripciones, respuestas de soporte o contenido generado, integrando el resultado en paneles de calidad.
- Moderacion de contenido con decision binaria: emplear `noul` para decidir si un texto o imagen cumple una politica, aprovechando la calibracion para escalar casos dudosos a revision humana.
- Gatekeeping automatico basado en confianza: usar `calibration_gold.json` para condicionar acciones automaticas (por ejemplo, autorizar un reembolso) a un umbral de confianza calibrado.
- Razonamiento asistido con el System 2: emplear el modelo base sin modificar para generacion y razonamiento general (texto o imagen) dentro del mismo bundle, sin necesidad de cargar un segundo modelo.
- Extraccion de decisiones en formularios o encuestas: procesar preguntas con opciones y obtener una distribucion calibrada sobre las respuestas, util para validacion automatica de datos anotados.
- Investigacion en calibracion y modelos de decision: usar el engine de referencia y las temperaturas publicadas para reproducir el Decision Index y comparar metodos.

## Benchmarks y rendimiento

Resultado declarado por el autor en el `model-index` de la model card (metrica `decision_index`, campo `verified: false`, es decir, no verificado de forma independiente):

| Metrica | Valor |
|---|---|
| Decision Index (balanced skill), suite 0.2.1, 150.317 peticiones puntuadas | 58.05 |

Comparativa publicada en la model card:

| Modelo | Decision Index (balanced skill) | Balanced raw | Breadth skill |
|---|---:|---:|---:|
| autotrust/JEV-Gemma4-26B-A4B | 58.05 | 67.35 | 56.98 |
| TypeSafe Jev 1.13 (board) | 57.91 | no disponible | no disponible |
| autotrust/JEV-27B | 53.30 | 64.32 | 52.21 |

Desglose por area (skill) del modelo:

| Area (skill) | Valor |
|---|---:|
| Knowledge & Reasoning | 0.430 |
| Language | 0.636 |
| Retrieval & Classification | 0.679 |
| Tools & Automation | 0.697 |
| Arts & Taste | 0.415 |

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del recuento de parametros (25,8 mil millones) y del formato de pesos declarado; la model card no publica requisitos oficiales.

- Peso en bf16: aproximadamente 51,6 GB solo para los pesos del backbone, mas adaptador y cabeza (repo de 51,8 GB en total).
- bf16 en GPU: requiere al menos una GPU de 80 GB (H100 80 GB) o reparto en varias GPU (por ejemplo, 2 x A100 40 GB o 2 x A100 80 GB con `device_map`).
- Cuantizacion a 8 bits (estimada): en torno a 26 GB, viable en una A100 40 GB o una RTX 4090 24 GB con reparto parcial.
- Cuantizacion a 4 bits (estimada): en torno a 13 GB, podria caber en una RTX 4090 24 GB o similar, aunque el autor no documenta cuantizaciones soportadas.
- Consumer GPU: la ejecucion en bf16 completo no cabe en GPU de consumo; solo seria viable con cuantizacion agresiva no documentada por el autor.
- Opciones de despliegue: el autor documenta `transformers` + `peft` y `huggingface_hub.snapshot_download`; el engine de referencia del Decision Index es `submissions/jev/jev_engine.py`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La decision se obtiene en una sola pasada de prefill (sin generacion autoregresiva), lo que reduce coste frente a una generacion completa, pero el autor no publica cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Decision Index (balanced skill) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| autotrust/JEV-Gemma4-26B-A4B | 25,8 mil millones totales, ~4 mil millones activos | no disponible | 58.05 | Apache 2.0 | Pesos abiertos en HuggingFace |
| google/gemma-4-26B-A4B-it | 26 mil millones totales, ~4 mil millones activos | no disponible | no disponible | no disponible en la informacion proporcionada | Modelo base en HuggingFace |
| autotrust/JEV-27B | no disponible | no disponible | 53.30 | no disponible | Pesos abiertos en HuggingFace |
| TypeSafe Jev 1.13 | no disponible | no disponible | 57.91 | Propietaria (modelo alojado y cerrado) | Solo servicio alojado |

## Limitaciones y advertencias

- La model card advierte que, alli donde el profesor se equivoca, el System 1 a menudo tambien lo hace (el texto esta truncado en la informacion disponible).
- El resultado de Decision Index (58.05) esta marcado como no verificado (`verified: false`); procede de una ejecucion declarada por el propio autor.
- El entrenamiento uso splits de entrenamiento publicos de algunos datasets cuyos splits de test emplea el Decision Index, lo que limita la interpretabilidad de las comparaciones con esos benchmarks.
- MMMU y MMMU-Pro no son evaluaciones validas para este modelo, segun el autor.
- Idioma: solo ingles declarado; no hay soporte multilingue documentado.
- La decision tipada `choice` esta acotada a grupos de 16 opciones por pasada; no hay datos sobre la degradacion con listas muy largas.
- Las areas con menor skill son Knowledge & Reasoning (0.430) y Arts & Taste (0.415), frente a Tools & Automation (0.697), lo que sugiere mejor comportamiento en tareas operativas que en razonamiento o juicio estetico.
- Licencia Apache 2.0 para el bundle, pero el modelo base enlaza a la licencia de Gemma 4 de Google (`https://ai.google.dev/gemma/docs/gemma_4_license`); conviene revisar los terminos del modelo base para uso comercial.
- No se documentan sesgos especificos ni evaluaciones de robustez fuera de la suite Decision Index.
- No hay cifras publicadas de latencia, throughput ni cuantizaciones soportadas, lo que dificulta planificar despliegues en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/autotrust/JEV-Gemma4-26B-A4B
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Modelo relacionado autotrust/JEV-27B: https://huggingface.co/autotrust/JEV-27B
- Resultados del Decision Index: https://huggingface.co/datasets/autotrust/jev-decision-index-results
- Kit Decision Index (engine de referencia): https://github.com/apolinario/decision-index
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
