# Horizon-Labs/multilingual-zeroshot-small

## Resumen

Multilingual Zero-Shot Classifier (small) es un modelo de clasificación zero-shot desarrollado por Horizon Labs (Horizon-Labs) y publicado en HuggingFace. Se trata de un encoder ModernBERT de 140.642.306 parámetros (aproximadamente 141M) construido a partir del modelo base jhu-clsp/mmBERT-small, afinado para la tarea de zero-shot-classification mediante inferencia de lenguaje natural (NLI). Su función es clasificar texto en más de 30 idiomas dentro de cualquier conjunto de etiquetas definido por el usuario en el momento de la inferencia, sin necesidad de reentrenamiento. La ventana de contexto nominal es de 8.192 tokens, aunque el ajuste fino se realizó con secuencias de hasta 1.024 tokens.

El modelo se posiciona como una alternativa multilingüe y ligera a facebook/bart-large-mnli. Frente a este, reduce el número de parámetros y añade cobertura multilingüe manteniendo etiquetas y plantillas de hipótesis en inglés. Incluye pesos en ONNX para ejecución en CPU y en el navegador mediante transformers.js, lo que lo hace apto para despliegues en el borde sin GPU.

Su relevancia actual radica en dos factores: por un lado, la licencia Apache 2.0 y el entrenamiento exclusivo con datos que permiten uso comercial (MultiNLI, SNLI y WANLI, sin XNLI ni ANLI); por otro, su tamaño reducido, que permite ejecutar clasificación multilingüe de etiquetas abiertas en hardware de consumo o incluso en cliente. Forma parte de la colección de modelos abiertos de Horizon Labs orientada a guardarraíles de entrada/salida para agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (variante mmBERT), encoder transformer |
| Parametros totales | 140.642.306 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 8.192 tokens nominales; ajuste fino con secuencias de hasta 1.024 tokens |
| Tipos de cuantizacion | ONNX para CPU y navegador; safetensors; no se detalla una lista de cuantizaciones (GGUF, GPTQ, AWQ, etc.) en la informacion disponible |
| Idiomas soportados | mas de 30: en, de, fr, es, pt, it, nl, pl, ru, uk, cs, tr, ar, fa, he, hi, bn, zh, ja, ko, vi, id, th, sw, el (etiquetas y plantilla de hipotesis en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y ONNX |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia ModernBERT, concretamente la variante multilingüe mmBERT en su tamano small (jhu-clsp/mmBERT-small, 308M en su version base sin ajustar). Sobre ese backbone se realiza un ajuste supervisado de clasificación NLI, tarea en la que el modelo aprende a puntuar si un texto implica una hipótesis construida a partir de una etiqueta candidata. En inferencia se emplean dos clases de salida: `not_entailment` (0) y `entailment` (1). Para cada etiqueta candidata, el modelo puntúa si el texto implica la frase generada por la plantilla de hipótesis (por defecto, "This example is {label}.", configurable mediante `hypothesis_template`).

El entrenamiento se realizó únicamente con conjuntos que permiten uso comercial: nyu-mll/multi_nli, stanfordnlp/snli y alisawuffles/WANLI. El autor indica explícitamente que no se emplearon XNLI, ANLI ni otros conjuntos con licencias no comerciales, lo que permite ofrecer el modelo bajo Apache 2.0 sin restricciones derivadas de los datos. No se detalla en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (poco habituales en modelos encoder de clasificación). La innovación destacable es la combinación de un contexto extendido de 8k tokens con un tamano de 141M y exportación a ONNX para inferencia en CPU y navegador.

## Capacidades

- Clasificación zero-shot con etiquetas arbitrarias definidas en tiempo de inferencia, tanto en modo single-label como multi-label (`multi_label=True`).
- Clasificación multilingüe en más de 30 idiomas, incluyendo lenguas con alfabetos no latinos (árabe, hebreo, hindi, bengalí, chino, japonés, coreano, tailandés).
- Inferencia de lenguaje natural (NLI) genérica: el modelo puede usarse como clasificador NLI pasando `text` y `text_pair` a un pipeline de `text-classification`.
- Plantillas de hipótesis personalizables por tarea (`hypothesis_template`), lo que permite adaptar el comportamiento a dominios concretos sin reentrenar.
- Ejecución en CPU y en navegador mediante los pesos ONNX y transformers.js.
- Etiquetado de temas, intenciones, emociones o categorías de dominio sobre texto no visto durante el entrenamiento.
- No dispone de generación de texto, razonamiento generativo, tool calling, capacidades de agente, visión ni audio: es un modelo exclusivamente discriminativo de clasificación.

## Casos de uso

- Clasificación de tickets de soporte multilingües: el modelo permite enrutar incidencias en decenas de idiomas hacia categorías como "refund request", "shipping question" o "account problem" sin entrenar un clasificador por idioma, usando etiquetas en inglés y textos en el idioma del cliente.
- Guardarraíles de entrada/salida en agentes: al formar parte de la colección agent-i-o-guards de Horizon Labs, está pensado para etiquetar prompts y respuestas (por ejemplo, "solicitud de datos personales", "contenido inseguro", "consulta fuera de alcance") en pipelines de agentes LLM.
- Enrutado de intenciones en asistentes conversacionales: con `hypothesis_template="The user wants to {}."` se pueden clasificar peticiones del usuario hacia acciones concretas (poner una alarma, reproducir música, consultar el tiempo) en múltiples idiomas.
- Análisis de reseñas por aspecto con multi-label: gracias a `multi_label=True`, un comentario como "la cámara es buena pero la batería dura poco" puede etiquetarse simultáneamente como "camera" y "battery", útil en analítica de producto multinacional.
- Etiquetado y filtrado de corpus para pipelines de datos: clasificación temática de grandes volúmenes de texto multilingüe (noticias, foros, documentación) para seleccionar, deduplicar o enrutar datos antes de otros procesamientos.
- Moderación y triaje de contenido en el borde: al disponer de ONNX y transformers.js, la clasificación puede ejecutarse en el navegador, evitando enviar el texto del usuario a un servidor y reduciendo costes de infraestructura.
- Clasificación de documentos internos en empresas multinacionales: categorización de correos, contratos o incidencias en los idiomas de las distintas filiales con un único modelo y una única plantilla.
- Investigación en evaluación zero-shot multilingüe: el modelo sirve como línea base ligera y de licencia permisiva para comparar contra alternativas mayores en tareas de NLI y clasificación de temas.

## Benchmarks y rendimiento

Los resultados proceden de la model card del autor, que indica haber ejecutado todos los modelos con el mismo script y plantillas. En la tabla multilingüe, el ganador de cada fila aparece en negrita en la fuente original; aquí se reproduce la comparativa completa con los valores publicados.

Clasificación multilingüe (accuracy, single-label):

| Conjunto | Este modelo (141M) | base (308M) | bge-m3-zeroshot-v2.0-c (568M) | mDeBERTa-v3-base-xnli (278M) | xlm-roberta-large-xnli (560M) | bge-m3-zeroshot-v2.0 (568M) |
|---|---|---|---|---|---|---|
| MASSIVE intents (60 etiquetas), 16 idiomas | 0,407 | 0,492 | 0,411 | 0,351 | 0,404 | 0,611 |
| SIB-200 topics (7 etiquetas), 16 idiomas | 0,773 | 0,798 | 0,782 | 0,654 | 0,526 | 0,837 |

Media por idioma de MASSIVE y SIB-200:

| Idioma | Este modelo (141M) | base (308M) | bge-m3-zeroshot-v2.0-c (568M) | mDeBERTa-v3-base-xnli (278M) | xlm-roberta-large-xnli (560M) | bge-m3-zeroshot-v2.0 (568M) |
|---|---|---|---|---|---|---|
| Ingles | 0,668 | 0,674 | 0,596 | 0,537 | 0,504 | 0,752 |
| Aleman | 0,609 | 0,644 | 0,607 | 0,527 | 0,472 | 0,748 |
| Frances | 0,649 | 0,684 | 0,617 | 0,526 | 0,487 | 0,753 |
| Espanol | 0,581 | 0,633 | 0,561 | 0,488 | 0,456 | 0,742 |
| Portugues | 0,622 | 0,664 | 0,585 | 0,491 | 0,446 | 0,713 |
| Ruso | 0,602 | 0,650 | 0,597 | 0,497 | 0,453 | 0,724 |
| Polaco | 0,601 | 0,685 | 0,640 | 0,533 | 0,486 | 0,756 |
| Turco | 0,591 | 0,651 | 0,605 | 0,491 | 0,455 | 0,713 |
| Arabe | 0,539 | 0,609 | 0,559 | 0,476 | 0,433 | 0,681 |
| Hindi | 0,545 | 0,609 | 0,589 | 0,511 | 0,459 | 0,719 |
| Chino | 0,615 | 0,680 | 0,627 | 0,514 | 0,481 | 0,760 |
| Japones | 0,655 | 0,720 | 0,637 | 0,530 | 0,492 | 0,752 |
| Coreano | 0,547 | 0,640 | 0,610 | 0,494 | 0,486 | 0,714 |
| Vietnamita | 0,563 | 0,619 | 0,605 | 0,478 | 0,490 | 0,735 |
| Indonesio | 0,619 | 0,649 | 0,625 | 0,520 | 0,483 | 0,749 |
| Swahili | 0,425 | 0,501 | 0,484 | 0,430 | 0,359 | 0,573 |

Ingles (accuracy):

| Conjunto | Este modelo (141M) | base (308M) | bge-m3-zeroshot-v2.0-c (568M) | mDeBERTa-v3-base-xnli (278M) | xlm-roberta-large-xnli (560M) | bge-m3-zeroshot-v2.0 (568M) | bart-large-mnli (407M) | deberta-v3-base-zeroshot-v2.0 (184M) |
|---|---|---|---|---|---|---|---|---|
| AG News (4) | 0,742 | 0,789 | 0,726 | 0,670 | 0,591 | 0,886 | 0,684 | 0,884 |
| Yahoo Answers (10) | 0,513 | 0,503 | 0,564 | 0,497 | 0,529 | 0,654 | 0,586 | 0,672 |
| Banking77 (77) | 0,521 | 0,568 | 0,430 | 0,287 | 0,166 | 0,695 | 0,480 | 0,714 |
| Emotion (6) | 0,398 | 0,466 | 0,476 | 0,483 | 0,345 | 0,677 | 0,463 | 0,737 |
| SST-2 (2) | 0,818 | 0,884 | 0,865 | 0,844 | 0,820 | 0,905 | 0,922 | 0,947 |
| MASSIVE, solo ingles | 0,513 | 0,520 | 0,413 | 0,397 | 0,443 | 0,680 | 0,530 | 0,710 |
| SIB-200, solo ingles | 0,824 | 0,828 | 0,779 | 0,676 | 0,564 | 0,824 | 0,760 | 0,745 |

NLI (accuracy balanceada):

| Conjunto | Este modelo (141M) | base (308M) | bge-m3-zeroshot-v2.0-c (568M) | mDeBERTa-v3-base-xnli (278M) | xlm-roberta-large-xnli (560M) | bge-m3-zeroshot-v2.0 (568M) |
|---|---|---|---|---|---|---|
| XNLI test, 12 idiomas (balanced acc.) | 0,774 | 0,801 | 0,825 | 0,845 | no disponible (tabla truncada en la model card) | no disponible (tabla truncada en la model card) |

Notas del autor recogidas en la model card: ningún modelo vio los splits de entrenamiento de estos conjuntos salvo donde se indica; el simbolo ‡ marca modelos entrenados parcialmente con datos de licencia no comercial (sus variantes `-c` son las comercialmente utilizables); el script de evaluación es `zeroshot/evaluate_zs.py`.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 el modelo ocupa aproximadamente 0,56 GB de pesos; en fp16/bf16, unos 0,28 GB; en int8, unos 0,14 GB. A estas cifras hay que sumar el coste de activaciones y KV cache (relevante solo en el encoder con secuencias largas de hasta 8k tokens).
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs integradas o en CPU. También es viable en dispositivos móviles mediante ONNX.
- GPU de centro de datos (A100, H100, L40S) solo necesarias para lotes muy grandes o para servir muchos idiomas en paralelo con requisitos de throughput elevados.
- Opciones de despliegue: pipeline `zero-shot-classification` de transformers, `text-classification` para uso NLI, ONNX Runtime (CPU y GPU), transformers.js (navegador), y servidores de inferencia compatibles con modelos encoder como TGI o vLLM.
- Al ser un modelo encoder pequeño, la latencia típica es de milisegundos en GPU y de decenas de milisegundos en CPU para secuencias cortas, aunque no se publican cifras oficiales de latencia ni de throughput en la información disponible: no disponible.
- El repositorio pesa 1,4 GB, lo que incluye pesos safetensors y exportaciones ONNX.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multilingue | Licencia | Rendimiento destacado |
|---|---|---|---|---|---|
| Horizon-Labs/multilingual-zeroshot-small | 141M | 8.192 tokens | Si (30+ idiomas) | Apache 2.0 | SIB-200 0,773; MASSIVE 0,407; XNLI 0,774 |
| jhu-clsp/mmBERT-small (base) | 308M | no disponible | Si | no disponible en la informacion proporcionada | SIB-200 0,798; MASSIVE 0,492 |
| bge-m3-zeroshot-v2.0-c | 568M | no disponible | Si | variante comercial `-c` | MASSIVE 0,411; SIB-200 0,782; XNLI 0,825 |
| mDeBERTa-v3-base-xnli | 278M | no disponible | Si | no disponible en la informacion proporcionada | XNLI 0,845; MASSIVE 0,351 |
| xlm-roberta-large-xnli | 560M | no disponible | Si | no disponible en la informacion proporcionada | MASSIVE 0,404; SIB-200 0,526 |
| bart-large-mnli | 407M | no disponible | No (solo ingles) | no disponible en la informacion proporcionada | SST-2 0,922; AG News 0,684 |
| deberta-v3-base-zeroshot-v2.0 | 184M | no disponible | No (solo ingles) | entrenado parcialmente con datos no comerciales (‡) | SST-2 0,947; Banking77 0,714 |

En terminos generales, el modelo no supera a los encoders mas grandes en precision bruta, pero ofrece el menor tamano de la comparativa junto con una licencia Apache 2.0 limpia y cobertura multilingüe, lo que lo hace competitivo cuando priman el coste, la latencia o la capacidad de ejecucion en el borde.

## Limitaciones y advertencias

- Las etiquetas candidatas y la plantilla de hipótesis deben formularse en inglés; el texto de entrada puede estar en cualquiera de los idiomas soportados, pero no se ha validado el uso de etiquetas en otros idiomas.
- El rendimiento decae de forma notable en idiomas de recursos medios o bajos: en swahili la media de MASSIVE y SIB-200 cae a 0,425, frente a 0,668 en inglés (según los datos del autor). El modelo base de 308M obtiene mejores resultados en prácticamente todos los idiomas evaluados.
- Al ser un clasificador NLI, puede producir etiquetas mal calibradas cuando las categorías son muy similares entre sí o muy específicas del dominio (por ejemplo, Banking77 con 77 etiquetas baja a 0,521).
- Sensibilidad a la plantilla de hipótesis: cambios en `hypothesis_template` alteran las puntuaciones, por lo que conviene validar la plantilla en el dominio de uso.
- No es un modelo generativo: no puede producir texto, razonar de forma multi-paso, ni ejecutar tool calling. Cualquier expectativa de este tipo queda fuera de su alcance.
- Riesgo de sesgo heredado de los corpus NLI (MultiNLI, SNLI, WANLI), mayoritariamente en inglés y con posibles sesgos anotacionales; la información disponible no incluye una evaluación de sesgos específica.
- La ventana nominal de 8.192 tokens no ha sido validada en ajuste fino más allá de 1.024 tokens, por lo que el comportamiento con entradas muy largas puede degradarse.
- Uso comercial permitido sin restricciones adicionales gracias a la licencia Apache 2.0 y al entrenamiento con datasets comercialmente utilizables, a diferencia de alternativas marcadas con ‡ en la comparativa.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe aún validación de la comunidad ni informes independientes de comportamiento en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Horizon-Labs/multilingual-zeroshot-small
- Demo en el navegador (Space): https://huggingface.co/spaces/Horizon-Labs/multilingual-zeroshot
- Codigo fuente: https://github.com/horizon-ai-labs/agent-io-guards
- Coleccion de modelos abiertos de Horizon Labs: https://huggingface.co/collections/Horizon-Labs/agent-i-o-guards-6ab403c49494bc2b71ca7669
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Datasets de entrenamiento: https://huggingface.co/datasets/nyu-mll/multi_nli, https://huggingface.co/datasets/stanfordnlp/snli, https://huggingface.co/datasets/alisawuffles/WANLI
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los enlaces obtenidos corresponden a entidades homonimas sin relacion (partido politico Horizons, emisora Horizon, articulo de Wikipedia sobre el concepto de horizonte, centro de formacion L'Horizon y Meta Horizon).
