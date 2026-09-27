# frontier-infra/jebadiah-27b

## Resumen

Jebadiah 27B (Jeb) es un modelo de decisión de estilo System One desarrollado por Frontier Infra. No es un modelo generativo: en lugar de producir texto, responde preguntas tipadas devolviendo una probabilidad sobre las etiquetas de opción en un único forward pass. Admite tres tipos de pregunta: choice (elegir una entre N), noul (afirmación sí/no, devuelta como P(yes)) y score (situar el estado en una rúbrica ordenada).

Se trata de un fine-tuning con LoRA fusionado sobre Qwen/Qwen3.8-27B (revisión 1d4bf0f2, checkpoint de chat, thinking desactivado), con 27.781.427.952 parámetros y pesos completos en bf16 (55,6 GB de repositorio). Su valor diferencial es que expone probabilidades calibradas mediante temperaturas por tipo de pregunta, lo que permite usarlo como clasificador, verificador o enrutador con umbrales de política ajustables, en lugar de depender de la decodificación de texto.

Es relevante porque sirve un endpoint compatible con el formato /v1/systemone de TypeSafe, de modo que un cliente Jev existente funciona cambiando el endpoint, y porque se distribuye como un modelo estándar de transformers con licencia Apache 2.0 y entrenado solo con datos públicos. Su receta es la de jebadiah-9b-v2 aplicada a una base distinta y mayor; el autor advierte de que no ha medido cuánto de la mejora corresponde al tamaño y cuánto a la generación más reciente de la base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen/Qwen3.8-27B (etiqueta de arquitectura `qwen3_5` en HuggingFace), con LoRA fusionado; modelo de decisión System One |
| Parametros totales | 27.781.427.952 (≈27,8B) |
| Parametros activos | No aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio publica pesos completos en bf16 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (bf16, LoRA fusionado sobre la base) |
| Modalidad declarada | image-text-to-text (pipeline de HuggingFace) |
| Modelo base | Qwen/Qwen3.8-27B (revisión `1d4bf0f2`, checkpoint de chat, thinking off) |
| Relación con la base | finetune |
| Tamano del repositorio | 55,6 GB |
| Tipo de salida | Probabilidad sobre etiquetas de opción (choice, noul, score), una lectura de logits por pregunta |
| Datasets de entrenamiento | LocalLLaMA/typed-decisions, nvidia/HelpSteer2, mteb/summeval |
| Endpoint servido | `/v1/systemone` (compatible con clientes Jev) y `/v1/decide` de AINode |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, un transformer de 27,8B parámetros de la familia Qwen3, en su revisión `1d4bf0f2` (checkpoint conversacional con modo thinking desactivado). Sobre esa base se aplica un LoRA que se fusiona posteriormente en los pesos, dando lugar a un checkpoint bf16 estándar de transformers. La innovación no está en el bloque de atención sino en la cabeza de decisión y en su calibración: el modelo responde preguntas tipadas leyendo un logit por etiqueta en una sola pasada hacia delante, sin generar tokens. El autor describe la receta como la de jebadiah-9b-v2 sobre una base distinta, siendo la base el único cambio.

El entrenamiento usa exclusivamente datos públicos: LocalLLaMA/typed-decisions como corpus principal de decisiones tipadas, junto con nvidia/HelpSteer2 y mteb/summeval. La calibración se aplica después mediante temperaturas por tipo de pregunta recogidas en `temperatures.json`: choice 1.23 y noul 1.30 (suavizan) y score 0.76 (agudiza), todas ajustadas sobre un split de calibración reservado. La temperatura de score se reajustó el 26 de septiembre de 2026 desde 1.14 (ajustada al objetivo ordinal suavizado) hasta 0.76 (ajustada a la etiqueta), lo que redujo el ECE en typed-decisions de 0.175 a 0.134 y en Nimble 324 de 0.145 a 0.124 sin cambiar ninguna elección. No se detalla en la información disponible el número de tokens de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Decisión tipada con probabilidad calibrada: choice (selección entre N opciones), noul (P(yes) para una afirmación) y score (posición en una rúbrica ordenada).
- Clasificación de texto en etiquetas cerradas, incluidas configuraciones de muchas clases (por ejemplo, 77 vías en Banking77).
- Puntuación de calidad y utilidad de respuestas, orientada a evaluar salidas de otros modelos (rúbrica de HelpSteer2).
- Verificación de consistencia y coherencia en resúmenes y detección de contradicciones o de pares no equivalentes.
- Determinación de respondibilidad en preguntas (tipo SQuAD2) y moderación de contenido (subconjunto Civil Comments).
- Inferencia de una sola pasada por pregunta, sin generación de texto ni decodificación autoregresiva, lo que simplifica el control de latencia y coste.
- Salida calibrada apta para umbrales de política: el consumidor fija el corte sobre la probabilidad en lugar de parsear texto libre.
- Compatibilidad de endpoint: `/v1/systemone` (formato de cable de Jev) y `/v1/decide` de AINode, más un playground de navegador en el servidor incluido.
- Capacidades multilingües: no disponible; el modelo declara únicamente inglés.
- Tool calling, function calling, agentes multi-paso y modo thinking: no disponible en la información proporcionada.
- Entrada de imagen: el pipeline declarado en HuggingFace es image-text-to-text, aunque la model card no detalla capacidades de visión.

## Casos de uso

- Enrutado de intenciones en atención al cliente: con 77,0 de accuracy en Banking77 (choice, 77 opciones) y probabilidad calibrada por etiqueta, se puede dirigir cada mensaje entrante al flujo o departamento correcto y derivar a revisión humana cuando P(etiqueta) quede por debajo de un umbral.
- Triaje binario sobre textos científicos o técnicos: el tipo noul devuelve P(yes) con 90,0 de accuracy en Jevals PubMedQA (noul, 300), útil para cribar afirmaciones antes de un análisis más costoso. No debe usarse como decisión clínica final.
- Evaluación automática de respuestas de otros LLM: el tipo score permite puntuar utilidad siguiendo una rúbrica ordenada, integrándose en pipelines de filtrado de datos o de comparación de candidatos sin necesidad de un juez generativo.
- Moderación y filtrado de contenido en pipelines de datos: la rúbrica entrenada sobre el subconjunto Civil Comments permite descartar o marcar muestras antes de incorporarlas a un dataset de entrenamiento.
- Verificación de resúmenes en producción: el modelo puntúa la consistencia de un resumen respecto a su artículo fuente, lo que permite bloquear automáticamente resúmenes con puntuaciones bajas antes de publicarlos.
- Detección de respuestas no soportadas por el contexto (answerability): variantes del tipo noul sobre pares pregunta-pasaje permiten descartar preguntas sin respuesta antes de invocar un modelo generativo, reduciendo alucinaciones aguas abajo.
- Componente de verificación en agentes: al devolver una probabilidad en lugar de texto, encaja como comprobador determinista de estados o acciones dentro de un bucle de agente, donde la política decide con el valor de P.
- Selección entre N alternativas generadas: usar el tipo choice para reordenar o elegir la mejor salida entre varios candidatos de un modelo generativo, o para seleccionar qué herramienta o modelo invocar a continuación.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (todos marcados como `verified: false`, es decir, no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| typed decisions (choice, noul, score) | Jevals suite 0.1.0, PubMedQA (noul) | accuracy | 90,0 |
| typed decisions (choice, noul, score) | Jevals suite 0.1.0, PubMedQA (noul) | decision_score_jevals | 70,4 |
| typed decisions (choice, noul, score) | Jevals suite 0.1.0, Banking77 (choice, 77-way) | accuracy | 77,0 |
| typed decisions (choice, noul, score) | Jevals suite 0.1.0, Banking77 (choice, 77-way) | decision_score_jevals | 68,4 |
| typed decisions (choice, noul, score) | Jevals suite 0.1.0, HelpSteer2 helpfulness (score) | decision_score_jevals | 19,9 |
| typed decisions (choice, noul, score) | Nimble public human-labelled subsets (13, macro accuracy) | accuracy | 78,6 |

Tabla ampliada publicada en la model card, medida por el autor con el banco de AINode (una lectura de logits por pregunta y el mismo prompt renderizado para todos los modelos):

| Accuracy | 27B | 9B v2 | 4B v2 |
|---|---:|---:|---:|
| Headline | 78,9 | 73,9 | 72,5 |
| Jevals PubMedQA (noul, 300) | 90,0 | 90,3 | 88,7 |
| Jevals Banking77 (choice, 77 opciones, 300) | 77,0 | 70,7 | 70,0 |
| Jevals HelpSteer2 helpfulness (score, 300) | 48,7 | 40,7 | 40,0 |
| Nimble held-out eval (mixed, 324) | 93,5 | 81,2 | 77,2 |
| Kev transfer-v4 test (mixed, 764) | 85,9 | 83,8 | 83,2 |
| Nimble public, 13 subsets (macro, 3.880) | 78,6 | 77,0 | 75,9 |

Datos adicionales aportados por el autor: en JevBench v1.4.2, sobre sus 231 ítems públicos y con su arnés sin modificar, el modelo obtiene 0,866 de accuracy (200 de 231), 82 de los 111 ítems difíciles y un ECE de 0,113 en el tramo difícil. El autor aclara que es una ejecución propia sobre ítems públicos y no una fila del tablero oficial, cuya clasificación usa ítems sellados. Para escala, la tabla publicada por Bespoke sitúa a Nimble-9B en 74,8 y a Jev en 76,0 sobre los mismos 13 subconjuntos públicos de Nimble con su propio scorer.

Puntos donde el 27B no supera al 9B v2, según el autor: accuracy en Jevals PubMedQA (90,0 frente a 90,3) y en cuatro subconjuntos públicos de Nimble (Civil Comments, PAWS, SQuAD2 y consistencia de SummEval); la calibración también es peor en algunos conjuntos, por ejemplo ECE de 0,124 frente a 0,085 en el conjunto Nimble de 324. HelpSteer2 y SummEval no son zero-shot para Jeb, ya que el pool entrena con sus splits de train y con artículos sin puntuar, sin solapamiento con los ítems de evaluación. La prueba de robustez ante nonces no se ha ejecutado todavía para el 27B, por lo que no se declara ninguna cifra de robustez.

## Requisitos de hardware

- Pesos bf16 completos: aproximadamente 55,6 GB (27,8B parámetros × 2 bytes), más el overhead de runtime. El autor indica unos 56 GB para los pesos bf16 más el overhead.
- GPU recomendadas: una GPU de 80 GB (A100 80 GB o H100 80 GB) para servirlo en bf16 sin cuantizar; cualquier GPU CUDA con memoria suficiente para el checkpoint más la caché.
- GPU de consumo: no cabe en una sola RTX 4090 (24 GB) en bf16. Harían falta varias GPU o cuantización, pero el autor no publica formatos cuantizados; cualquier cifra al respecto sería una estimación no confirmada.
- Apple Silicon: el servidor incluido soporta un Mac con Apple Silicon, lo que exige memoria unificada suficiente para alojar los pesos (del orden de 64 GB o más, estimación no confirmada por el autor).
- Opciones de despliegue: servidor autónomo de `server/` en el repositorio de Jebadiah (Python 3.12 y `uv`; con `--extra cuda` para la vía rápida en CUDA), modelo estándar de transformers ejecutable en cualquier entorno compatible, endpoints `/v1/systemone` y `/v1/decide`, y playground de navegador.
- vLLM, llama.cpp, Ollama o TGI: no disponible; no se mencionan en la información proporcionada, y la naturaleza del modelo (lectura de logits, no generación) puede requerir soporte específico.
- Latencia y throughput: no disponible; no se publican medidas. El diseño de una sola pasada por pregunta implica coste constante por consulta, independiente de la longitud de la respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Headline (Nimble macro) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jebadiah-27b | 27,78B | No disponible | 78,9 (9B v2: 73,9) | Apache 2.0 | Pesos bf16 en HuggingFace |
| jebadiah-9b-v2 | ≈9B (por nombre) | No disponible | 73,9 | No disponible | Pesos en HuggingFace |
| jebadiah-4b-v2 | ≈4B (por nombre) | No disponible | 72,5 | No disponible | Pesos en HuggingFace |
| Bespoke Nimble-9B | ≈9B (por nombre) | No disponible | 74,8 | No disponible | Referencia publicada por el autor |

Comparación dentro de la misma familia: el 27B mejora al 9B v2 en el headline (78,9 frente a 73,9), en Banking77 (77,0 frente a 70,7), en HelpSteer2 helpfulness (48,7 frente a 40,7), en Nimble held-out (93,5 frente a 81,2) y en Kev transfer-v4 (85,9 frente a 83,8), pero queda por debajo en PubMedQA (90,0 frente a 90,3) y en cuatro subconjuntos públicos de Nimble. La licencia y las longitudes de contexto de las variantes 9B v2 y 4B v2 no están disponibles en la información proporcionada. No se dispone de datos de contexto, cuantizaciones o benchmarks comparables frente a clasificadores encoder-only de propósito general como DeBERTa o ModernBERT, por lo que esa comparación no está disponible.

## Limitaciones y advertencias

- Modelo de decisión, no generativo: no produce texto libre y no sirve para tareas de generación, resumen o conversación.
- Solo inglés declarado (`en`); el rendimiento en otros idiomas no está medido ni garantizado.
- Resultados autodeclarados y no verificados: todas las métricas del model-index llevan `verified: false` y proceden del propio autor.
- Sin datos de contexto: no se publica la longitud de contexto, lo que impide dimensionar entradas largas con garantías.
- Regresiones respecto al 9B v2: menor accuracy en Jevals PubMedQA y en cuatro subconjuntos públicos de Nimble (Civil Comments, PAWS, SQuAD2, consistencia de SummEval).
- Calibración irregular: el ECE empeora en algunos conjuntos (0,124 frente a 0,085 en el conjunto Nimble de 324), por lo que las probabilidades deben validarse por dominio antes de fijar umbrales.
- Filas no zero-shot: HelpSteer2 y SummEval entrenan sobre sus splits de train y artículos sin puntuar, por lo que sus resultados son ítems reservados de una rúbrica ya vista.
- Robustez no medida: la pasada de robustez ante nonces no se ha ejecutado para el 27B, así que no se declara ninguna cifra.
- Sesgos: no se documenta ningún análisis de sesgo. Los subconjuntos de moderación (Civil Comments) implican decisiones sensibles que pueden heredar sesgos del corpus y de la base Qwen.
- Riesgo de alucinación: al no generar texto, la alucinación se manifiesta como confianza mal calibrada (probabilidad alta en una etiqueta incorrecta) más que como contenido inventado.
- Coste de despliegue: requiere del orden de 56 GB solo para los pesos en bf16, lo que excluye GPU de consumo individuales sin cuantizar.
- Adopción nula y soporte limitado: 0 descargas y 0 likes en el momento de los datos, sin métricas de latencia publicadas ni soporte confirmado en los principales servidores de inferencia.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar los términos de los datasets y del modelo base Qwen/Qwen3.8-27B antes de un despliegue en producción.
- Uso responsable: no debe emplearse como sistema de decisión clínica, crediticia o legal sin supervisión humana, dado que no hay validación externa de sus probabilidades.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/frontier-infra/jebadiah-27b
- Repositorio de código: https://github.com/getainode/jebadiah
- Servidor autónomo: https://github.com/getainode/jebadiah/tree/main/server
- Resultados de evaluación: `eval/RESULTS.md` en el repositorio de código (https://github.com/getainode/jebadiah/blob/main/eval/RESULTS.md)
- Comparación con JevBench: https://github.com/getainode/jebadiah#where-we-stand-on-jevbench
- Arnes JevBench: https://github.com/fstandhartinger/jevbench
- Variante jebadiah-9b-v2: https://huggingface.co/frontier-infra/jebadiah-9b-v2
- Variante jebadiah-4b-v2: https://huggingface.co/frontier-infra/jebadiah-4b-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset LocalLLaMA/typed-decisions: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Dataset nvidia/HelpSteer2: https://huggingface.co/datasets/nvidia/HelpSteer2
- Dataset mteb/summeval: https://huggingface.co/datasets/mteb/summeval

Nota: la búsqueda web realizada no devolvió resultados relacionados con este modelo; los enlaces encontrados correspondían a entidades homónimas sin relación (aerolínea Frontier, serie de televisión Frontier y la desarrolladora de videojuegos Frontier Developments), por lo que se han descartado.
