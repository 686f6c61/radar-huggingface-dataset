# Horizon-Labs/multilingual-zeroshot-large

## Resumen

Multilingual Zero-Shot Classifier (large, 568M) es un modelo de clasificación de texto zero-shot desarrollado por Horizon-Labs. Se construye sobre el backbone `BAAI/bge-m3` (XLM-RoBERTa-large) y se plantea como una alternativa multilingüe a `facebook/bart-large-mnli`: permite clasificar texto en más de 30 idiomas dentro de cualquier conjunto de etiquetas definido por el usuario en el momento de la inferencia, sin necesidad de reentrenamiento ni de datos etiquetados.

El modelo tiene 567.756.802 parámetros y una ventana de contexto de 8.192 tokens (aunque fue ajustado con secuencias de hasta 1.024 tokens). Funciona como un clasificador NLI de pares (premisa, hipótesis): para cada etiqueta candidata evalúa si el texto implica la hipótesis generada a partir de una plantilla, habitualmente "This example is {label}.". Devuelve las etiquetas `not_entailment` (0) y `entailment` (1).

Su relevancia práctica está en dos factores: la cobertura multilingüe con plantillas y etiquetas en inglés, y una licencia Apache-2.0 con un dataset de entrenamiento declarado como íntegramente apto para uso comercial (sin XNLI, ANLI ni otros conjuntos con licencias no comerciales). El repositorio incluye exportaciones ONNX en fp32 e INT8 y soporte para `transformers.js`, lo que permite ejecutarlo también en CPU y en el navegador.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder de tipo XLM-RoBERTa-large (backbone `BAAI/bge-m3`), cabeza de clasificación NLI de 2 etiquetas (`not_entailment`, `entailment`) |
| Parametros totales | 567.756.802 (568M) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 8.192 tokens; ajuste fino realizado con secuencias de hasta 1.024 tokens |
| Tipos de cuantizacion | ONNX fp32 y ONNX INT8 (embeddings INT8, 1,5 GB, con 99-100% de coincidencia en la etiqueta principal); no se documentan GGUF, AWQ, GPTQ ni otras |
| Idiomas soportados | Multilingüe, más de 30 idiomas; códigos declarados: en, de, fr, es, pt, it, nl, pl, ru, uk, cs, tr, ar, fa, he, hi, bn, zh, ja, ko, vi, id, th, sw, el |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y ONNX (fp32 e INT8); compatible con `transformers.js` |
| Modelo base | BAAI/bge-m3 |
| Pipeline | `zero-shot-classification` (también utilizable como `text-classification` con `text_pair`) |
| Tamaño del repositorio | 6,0 GB |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer bidireccional basado en XLM-RoBERTa-large a través del backbone `bge-m3` de BAAI (licencia MIT), al que se añade una cabeza de clasificación de dos clases. El uso zero-shot se resuelve como una tarea de inferencia de lenguaje natural (NLI): el texto de entrada actúa como premisa y cada etiqueta candidata se inserta en una plantilla de hipótesis ("This example is {label}." por defecto, personalizable con `hypothesis_template`). La puntuación de `entailment` de cada etiqueta determina el ranking. Los identificadores de etiqueta son `not_entailment` (0) y `entailment` (1).

El entrenamiento se realizó sobre `nyu-mll/multi_nli`, `stanfordnlp/snli` y `alisawuffles/WANLI`, complementados con datos sintéticos que, desde la versión v1.1, incluyen taxonomías genéricas de etiquetas (temas, secciones de noticias, tópicos de preguntas de Q&A, emociones y sentimiento). El autor declara explícitamente que se evitó XNLI, ANLI y cualquier otro conjunto con licencia no comercial, con el objetivo de que los pesos resultantes sean utilizables comercialmente. No se documentan fases de RLHF ni DPO, algo esperable en un modelo encoder de clasificación.

## Capacidades

- Clasificación zero-shot con etiquetas arbitrarias definidas en tiempo de inferencia, sin entrenamiento adicional.
- Clasificación multietiqueta mediante `multi_label=True`, útil cuando varias categorías aplican simultáneamente al mismo texto.
- NLI genérico: admite el uso directo como clasificador de pares (premisa, hipótesis) pasando `text` y `text_pair` a un pipeline de `text-classification`.
- Plantillas de hipótesis personalizables (`hypothesis_template`), lo que permite adaptar el modelo a dominios concretos (por ejemplo, intenciones de usuario en asistentes).
- Cobertura multilingüe declarada de más de 30 idiomas, con texto de entrada en cualquier idioma soportado y etiquetas/plantilla en inglés.
- Contexto largo de hasta 8.192 tokens, adecuado para documentos, hilos de conversación o descripciones extensas.
- Ejecución en CPU mediante ONNX INT8 y en navegador mediante `transformers.js`, sin backend adicional.
- No dispone de generación de texto, tool calling, capacidades de agente, visión, audio ni modo de razonamiento explícito: es exclusivamente un clasificador.

## Casos de uso

- Enrutado de tickets de soporte multilingüe: clasificar cada mensaje entrante en categorías como "refund request", "shipping question" o "account problem" sin etiquetar datos históricos, con el texto en el idioma del cliente y etiquetas en inglés.
- Detección de intención en asistentes conversacionales: el modelo rinde especialmente bien en la tarea de intenciones de MASSIVE (60 etiquetas, 16 idiomas), por lo que encaja en el enrutado de comandos y peticiones de usuario en productos con base de usuarios internacional.
- Análisis de reseñas por aspecto: con `multi_label=True` se puede etiquetar un mismo texto con varios aspectos (batería, pantalla, precio, cámara), lo que permite construir paneles de calidad de producto agregando puntuaciones de `entailment` por aspecto.
- Clasificación temática de noticias y contenidos editoriales: asignar secciones (política, deportes, economía, ciencia y tecnología) a titulares o resúmenes en redacciones multilingües, tarea alineada con los temas de SIB-200.
- Triaje documental en entornos legales, financieros o sanitarios: clasificar documentos con taxonomías internas propias cuando no existe un corpus etiquetado ni presupuesto para anotarlo.
- Prefiltrado y enrutado en pipelines RAG: clasificar la consulta del usuario antes de decidir si requiere recuperación, qué índice consultar o si debe escalarse a un humano.
- Detección de contradicciones y verificación de afirmaciones: usando el modo NLI con `text_pair` se puede comprobar si un fragmento de contexto respalda o contradice una afirmación, como paso previo a una verificación más costosa.
- Clasificación en el navegador con privacidad por diseño: gracias a la exportación ONNX y a `transformers.js`, el texto del usuario puede procesarse localmente en el cliente sin enviarlo a un servidor.
- Moderación y clasificación de contenido mediante taxonomías definidas por el equipo, con la cautela de que no hay documentación específica sobre sesgos ni sobre calibración en dominios sensibles.

## Benchmarks y rendimiento

El autor publica resultados de exactitud en clasificación de etiqueta única (`multi_label=False`), con plantillas y etiquetas en inglés para todos los idiomas. La misma plantilla se usó para todos los modelos comparados. El símbolo ‡ indica modelos entrenados en parte con datos de licencia no comercial; § indica filas en las que los nombres de las etiquetas coinciden con taxonomías genéricas presentes en los datos sintéticos de entrenamiento (no se usaron los textos de los benchmarks, pero esas filas no son estrictamente zero-shot respecto a los nombres de etiqueta).

| Benchmark | **Este modelo** (568M) | small (141M) | base (308M) | bge-m3-zeroshot-v2.0-c (568M) | mDeBERTa-v3-base-xnli (278M) | xlm-roberta-large-xnli (560M) | bge-m3-zeroshot-v2.0 (568M) ‡ |
|---|---|---|---|---|---|---|---|
| MASSIVE intents (60 etiquetas), 16 idiomas | 0,535 | 0,402 | 0,482 | 0,411 | 0,351 | 0,404 | **0,611** |
| SIB-200 topics (7 etiquetas), 16 idiomas § | 0,834 | 0,789 | 0,813 | 0,782 | 0,654 | 0,526 | **0,837** |

Resultados por idioma (media de MASSIVE y SIB-200):

| Idioma | **Este modelo** | small (141M) | base (308M) | bge-m3-zeroshot-v2.0-c | mDeBERTa-v3-base-xnli | xlm-roberta-large-xnli | bge-m3-zeroshot-v2.0 ‡ |
|---|---|---|---|---|---|---|---|
| English | 0,716 | 0,654 | 0,698 | 0,596 | 0,537 | 0,504 | **0,752** |
| German | 0,685 | 0,595 | 0,646 | 0,607 | 0,527 | 0,472 | **0,748** |
| French | 0,704 | 0,650 | 0,684 | 0,617 | 0,526 | 0,487 | **0,753** |
| Spanish | 0,658 | 0,602 | 0,638 | 0,561 | 0,488 | 0,456 | **0,742** |
| Portuguese | 0,679 | 0,617 | 0,666 | 0,585 | 0,491 | 0,446 | **0,713** |
| Russian | 0,663 | 0,623 | 0,642 | 0,597 | 0,497 | 0,453 | **0,724** |
| Polish | 0,712 | 0,642 | 0,688 | 0,640 | 0,533 | 0,486 | **0,756** |
| Turkish | 0,680 | 0,601 | 0,667 | 0,605 | 0,491 | 0,455 | **0,713** |
| Arabic | 0,666 | 0,551 | 0,606 | 0,559 | 0,476 | 0,433 | **0,681** |
| Hindi | 0,675 | 0,541 | 0,615 | 0,589 | 0,511 | 0,459 | **0,719** |
| Chinese | 0,709 | 0,625 | 0,674 | 0,627 | 0,514 | 0,481 | **0,760** |
| Japanese | 0,695 | 0,651 | 0,714 | 0,637 | 0,530 | 0,492 | **0,752** |
| Korean | 0,707 | 0,578 | 0,640 | 0,610 | 0,494 | 0,486 | **0,714** |
| Vietnamese | 0,671 | 0,563 | 0,613 | 0,605 | 0,478 | 0,490 | **0,735** |
| Indonesian | 0,733 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Nota: la tabla por idioma de la model card está truncada en la información disponible. La fila de Indonesian solo incluye el valor de este modelo; el resto de columnas no aparecen en el material proporcionado. El autor indica que ninguno de los modelos comparados vio los splits de entrenamiento de estos datasets, salvo donde se marca con ‡, y que MASSIVE, Banking77 y XNLI no aportaron nombres de etiqueta a los datos de entrenamiento.

## Requisitos de hardware

- Peso de los parámetros (estimación derivada de los 567,76M de parámetros): aproximadamente 2,3 GB en fp32, 1,1 GB en fp16 y 0,6 GB en INT8. Hay que sumar memoria para activaciones y el búfer de atención, que crece con la longitud de secuencia (hasta 8.192 tokens).
- GPU de consumo: cabe holgadamente en tarjetas con 4-6 GB de VRAM o más (RTX 3050, RTX 3060, RTX 4060, RTX 4090). Un modelo encoder de 568M no debería suponer un problema de memoria en GPU de gama media actual.
- GPU de centro de datos: A100, H100, L40S o similares se aprovecharán sobre todo para maximizar el throughput por lotes, no por requisito de memoria.
- CPU: la model card indica que la vía recomendada para CPU es la exportación ONNX, con variante fp32 y variante INT8 de 1,5 GB que mantiene entre el 99% y el 100% de coincidencia en la etiqueta principal. Es viable sin GPU para volúmenes moderados.
- Navegador: soporte de `transformers.js`, lo que permite ejecución completamente en el cliente.
- Despliegue: pipeline `zero-shot-classification` o `text-classification` de `transformers`, ONNX Runtime para CPU/edge y `transformers.js` para web. No aplica el despliegue con servidores orientados a LLM generativos (vLLM, TGI, llama.cpp), porque es un encoder de clasificación sin decodificación autoregresiva.
- Latencia y throughput concretos: no disponibles. El autor recomienda usar GPU para throughput y no publica cifras de tokens por segundo ni de peticiones por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MASSIVE intents (16 idiomas) | SIB-200 topics (16 idiomas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Horizon-Labs/multilingual-zeroshot-large | 568M | 8.192 tokens (ajuste a 1.024) | 0,535 | 0,834 § | Apache-2.0 | HuggingFace, safetensors y ONNX |
| Horizon-Labs multilingual-zeroshot-small | 141M | no disponible | 0,402 | 0,789 § | no disponible | HuggingFace (misma familia) |
| Horizon-Labs multilingual-zeroshot-base | 308M | no disponible | 0,482 | 0,813 § | no disponible | HuggingFace (misma familia) |
| bge-m3-zeroshot-v2.0-c | 568M | no disponible | 0,411 | 0,782 § | variante comercial según el autor | HuggingFace |
| bge-m3-zeroshot-v2.0 ‡ | 568M | no disponible | **0,611** | **0,837** § | datos de entrenamiento parcialmente no comerciales | HuggingFace |
| mDeBERTa-v3-base-xnli | 278M | no disponible | 0,351 | 0,654 § | no disponible | HuggingFace |
| xlm-roberta-large-xnli | 560M | no disponible | 0,404 | 0,526 § | no disponible | HuggingFace |

La lectura de estos datos es relevante para la elección: el modelo supera con claridad a los clasificadores multilingües zero-shot clásicos basados en XNLI (mDeBERTa-v3-base-xnli y xlm-roberta-large-xnli) en MASSIVE, y también a la variante comercial `bge-m3-zeroshot-v2.0-c` sobre el mismo backbone. Sin embargo, la variante `bge-m3-zeroshot-v2.0` (marcada con ‡ por usar datos parcialmente no comerciales) obtiene mejores cifras en ambas tareas, por lo que existe un compromiso explícito entre licencia limpia para uso comercial y rendimiento máximo.

## Limitaciones y advertencias

- Las etiquetas y la plantilla de hipótesis deben formularse en inglés; el texto de entrada puede estar en cualquiera de los idiomas soportados, pero no se documenta el comportamiento con etiquetas en otros idiomas.
- Las filas marcadas con § en los benchmarks (SIB-200 y, en gran medida, Yahoo Answers y AG News) no son estrictamente zero-shot respecto a los nombres de etiqueta: desde la v1.1 los datos sintéticos de entrenamiento incluyen taxonomías genéricas cuyos nombres solapan con los conjuntos de etiquetas de esos benchmarks. Las comparaciones en esas filas deben hacerse con cautela.
- No se documentan análisis de sesgo demográfico, cultural o de género, ni evaluaciones de equidad por idioma. Es un riesgo abierto para despliegues en dominios sensibles.
- Al ser un clasificador NLI y no un modelo generativo, no produce alucinaciones de texto, pero sí puede asignar puntuaciones de `entailment` mal calibradas cuando las etiquetas son ambiguas, solapadas o ajenas al dominio. El ranking puede ser inestable con etiquetas muy similares entre sí.
- La ventana es de 8.192 tokens, pero el ajuste fino se hizo con secuencias de hasta 1.024 tokens; el rendimiento en entradas muy largas no está validado en la información disponible.
- La calidad es desigual por idioma: en la tabla publicada, español (0,658) y ruso (0,663) quedan por debajo de inglés (0,716) o indonesio (0,733). No se publican resultados para la mayoría de los idiomas declarados (nl, uk, cs, fa, he, bn, th, sw, el).
- Aunque el autor declara Apache-2.0 y un entrenamiento sin conjuntos no comerciales, la procedencia de los datos sintéticos no se detalla, lo que puede complicar una auditoría de licencias en entornos corporativos estrictos.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y la model card no documenta versiones, changelog ni proceso de mantenimiento. Conviene fijar una revisión concreta antes de integrarlo en producción.
- Recomendaciones de hardware y de uso en GPU provienen del autor; no hay cifras publicadas de latencia, throughput ni consumo energético.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Horizon-Labs/multilingual-zeroshot-large
- Demo en el navegador: https://huggingface.co/spaces/Horizon-Labs/multilingual-zeroshot
- Colección "Agent I/O Guards" de Horizon Labs: https://huggingface.co/collections/Horizon-Labs/agent-i-o-guards-6ab403c49494bc2b71ca7669
- Código fuente: https://github.com/horizon-ai-labs/agent-io-guards
- Modelo base: https://huggingface.co/BAAI/bge-m3
- Dataset MultiNLI: https://huggingface.co/datasets/nyu-mll/multi_nli
- Dataset SNLI: https://huggingface.co/datasets/stanfordnlp/snli
- Dataset WANLI: https://huggingface.co/datasets/alisawuffles/WANLI
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo: los enlaces encontrados corresponden a entidades homónimas sin relación (partido político francés, red de concesionarios BMW, emisora de radio, portal de orientación académica y artículo de Wikipedia sobre el concepto de horizonte).
