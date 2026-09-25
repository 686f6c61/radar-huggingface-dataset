# Horizon-Labs/multilingual-zeroshot-base

## Resumen

Horizon-Labs/multilingual-zeroshot-base es un clasificador de texto zero-shot multilingue desarrollado por Horizon Labs. Se construye a partir de `jhu-clsp/mmBERT-base`, un encoder de la familia ModernBERT orientado a multilingue, y se ajusta como modelo de inferencia de lenguaje natural (NLI) para poder etiquetar texto con categorias arbitrarias definidas en tiempo de inferencia, sin reentrenamiento. Tiene 307.531.778 parametros (308 M) y una ventana de contexto de 8.192 tokens, aunque el ajuste se hizo con secuencias de hasta 1.024 tokens.

El problema que resuelve es acotado pero frecuente en produccion: clasificar texto en mas de 30 idiomas cuando no hay datos etiquetados para la tarea concreta. El modelo se usa con el pipeline `zero-shot-classification` de transformers de forma analoga a `facebook/bart-large-mnli`, pero con soporte multilingue nativo, un tamano tres ordenes de magnitud menor que un LLM generativo y exportacion ONNX para CPU y navegador via transformers.js.

Su relevancia actual viene de dos factores. Por un lado, la licencia Apache-2.0 y la decision explicita de entrenar solo con datos comercialmente utilizables (MultiNLI, SNLI y WANLI; sin XNLI ni ANLI), lo que evita la ambiguedad legal habitual en los clasificadores NLI derivados de XNLI. Por otro, forma parte de la coleccion de modelos abiertos de Horizon Labs orientada a guardrails de entrada/salida en agentes, lo que lo situa como componente de enrutado y filtrado en pipelines agenticos antes de llamar a un modelo generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only de la familia ModernBERT (variante mmBERT; modelo base `jhu-clsp/mmBERT-base`) |
| Parametros totales | 307.531.778 (308 M) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 8.192 tokens (8k); ajuste realizado con secuencias de hasta 1.024 tokens |
| Tipos de cuantizacion | No se detallan los esquemas de cuantizacion empleados. Se distribuyen pesos safetensors y una exportacion ONNX para CPU y navegador. No hay GGUF publicado |
| Idiomas soportados | 30+ idiomas: en, de, fr, es, pt, it, nl, pl, ru, uk, cs, tr, ar, fa, he, hi, bn, zh, ja, ko, vi, id, th, sw, el |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y ONNX (compatible con transformers.js) |
| Tarea (pipeline) | `zero-shot-classification`; tambien usable como `text-classification` con pares texto-hipotesis |
| Modelo base | `jhu-clsp/mmBERT-base` |
| Datos de ajuste | `nyu-mll/multi_nli`, `stanfordnlp/snli`, `alisawuffles/WANLI` |
| Etiquetas de salida | `not_entailment` (0) y `entailment` (1) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia ModernBERT, en concreto la variante multilingue mmBERT (`jhu-clsp/mmBERT-base`), con 308 M de parametros y 8.192 tokens de contexto. La adaptacion a clasificacion zero-shot se realiza mediante fine-tuning sobre tareas de inferencia de lenguaje natural: MultiNLI, SNLI y WANLI. La formulacion es la clasica de NLI como clasificacion zero-shot: para cada etiqueta candidata el modelo puntua si el texto implica la hipotesis "This example is {label}." o la plantilla que indique el usuario mediante `hypothesis_template`. La salida son dos logits (`not_entailment` y `entailment`), y la puntuacion de cada etiqueta es la probabilidad de entailment.

Los detalles sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, la mezcla de idiomas durante el ajuste y el uso de tecnicas como RLHF o DPO no estan disponibles en la informacion proporcionada; se trata, en cualquier caso, de un modelo discriminativo, no generativo, por lo que las tecnicas de alineamiento tipo RLHF no aplican de la misma forma. La innovacion destacable es la politica de datos: el autor afirma haber entrenado unicamente con conjuntos que permiten uso comercial, excluyendo explicitamente XNLI, ANLI y otros conjuntos con licencias no comerciales, lo que deja una licencia Apache-2.0 sin las reservas habituales de los clasificadores NLI derivados de XNLI.

## Capacidades

- Clasificacion de texto zero-shot: asigna cualquier conjunto de etiquetas definidas por el usuario sin entrenamiento adicional, con la etiqueta de mayor puntuacion de entailment como ganadora en modo single-label.
- Clasificacion multi-etiqueta: con `multi_label=True` permite que varias etiquetas apliquen simultaneamente al mismo texto (por ejemplo, "camera", "battery", "price" en una resena).
- Inferencia de lenguaje natural (NLI): usable directamente con pares premisa-hipotesis a traves de un pipeline `text-classification`.
- Cobertura multilingue en 30+ idiomas, incluyendo lenguas con recursos limitados como swahili, bengali, persa, hebreo o tailandes.
- Plantillas de hipotesis personalizables por tarea mediante `hypothesis_template`, lo que permite adaptar el modelo a dominios concretos (por ejemplo, "The user wants to {}." para intenciones de asistente).
- Enrutado de intenciones con espacios de etiquetas grandes: los benchmarks del autor cubren 60 etiquetas (MASSIVE intents) y 77 etiquetas (Banking77).
- Ejecucion en navegador y CPU gracias a la exportacion ONNX y a la integracion con transformers.js.
- No dispone de tool calling, function calling, modo de razonamiento explicito, vision, audio ni generacion de texto: es exclusivamente un encoder de clasificacion.

## Casos de uso

- Enrutado de tickets de soporte al cliente: clasificar cada ticket entrante en categorias como "refund request", "shipping question" o "account problem" sin entrenar un clasificador por cliente ni por idioma. El modelo obtuvo 0.492 de accuracy en MASSIVE intents con 60 etiquetas y 16 idiomas, suficiente como primer nivel de triaje antes de un agente humano o de un LLM.
- Moderacion y filtrado de contenido en tiempo real: etiquetar mensajes de usuario contra politicas definidas como etiquetas ("spam", "harassment", "off-topic") en el idioma de origen, aprovechando que el modelo acepta texto en cualquiera de los 30+ idiomas soportados con etiquetas en ingles.
- Guardrails de entrada/salida en pipelines agenticos: como parte de la coleccion "agent i/o guards" del autor, el modelo sirve para validar si la salida de un agente pertenece a las categorias permitidas o si la entrada del usuario cae en un dominio prohibido antes de invocar herramientas.
- Etiquetado de topicos en corpus multilingues de investigacion: con 0.798 de accuracy en SIB-200 (7 topicos, 16 idiomas), es util para anotacion tematica de grandes volumenes de texto en varios idiomas con un unico modelo, en lugar de mantener un clasificador por lengua.
- Analisis de resenas de producto multi-etiqueta: con `multi_label=True` se pueden extraer simultaneamente los aspectos mencionados en una resena (bateria, pantalla, precio, camara), lo que alimenta dashboards de voz del cliente sin anotacion previa.
- Deteccion de intenciones en asistentes de voz o chatbots: usando plantillas especificas ("The user wants to {}.") se clasifican utterances cortos en acciones ("set an alarm", "play music", "weather") con un modelo de 308 M que cabe en el dispositivo.
- Clasificacion en el navegador con privacidad de datos: la exportacion ONNX y el soporte de transformers.js permiten ejecutar la clasificacion en el cliente, sin enviar el texto a un servidor, en aplicaciones de formularios, encuestas o extensiones.
- Verificacion de afirmaciones y fact-checking ligero: al ser un modelo NLI, puede puntuar si un enunciado se sigue de un contexto dado, como componente de un pipeline de deteccion de alucinaciones en respuestas generadas.
- Anotacion asistida y weak supervision: generar etiquetas iniciales sobre un corpus no etiquetado en varios idiomas para despues revisar solo los casos de baja confianza, reduciendo el coste de anotacion humana.

## Benchmarks y rendimiento

Resultados publicados por el autor con el mismo script y plantillas para todos los modelos (`zeroshot/evaluate_zs.py`). Accuracy single-label; plantillas y etiquetas en ingles para todos los idiomas. La marca ‡ indica modelos entrenados parcialmente con datos de licencia no comercial (sus variantes `-c` son las comercialmente utilizables).

Multilingue (agregado sobre 16 idiomas):

| Benchmark | Este modelo (308 M) | small (141 M) | bge-m3-zeroshot-v2.0-c (568 M) | mDeBERTa-v3-base-xnli (278 M) | xlm-roberta-large-xnli (560 M) | bge-m3-zeroshot-v2.0 (568 M) ‡ |
|---|---|---|---|---|---|---|
| MASSIVE intents (60 etiquetas) | 0.492 | 0.407 | 0.411 | 0.351 | 0.404 | 0.611 |
| SIB-200 topics (7 etiquetas) | 0.798 | 0.773 | 0.782 | 0.654 | 0.526 | 0.837 |

Media de MASSIVE y SIB-200 por idioma:

| Idioma | Este modelo (308 M) | small (141 M) | bge-m3-zeroshot-v2.0-c (568 M) | mDeBERTa-v3-base-xnli (278 M) | xlm-roberta-large-xnli (560 M) | bge-m3-zeroshot-v2.0 (568 M) ‡ |
|---|---|---|---|---|---|---|
| Ingles | 0.674 | 0.668 | 0.596 | 0.537 | 0.504 | 0.752 |
| Aleman | 0.644 | 0.609 | 0.607 | 0.527 | 0.472 | 0.748 |
| Frances | 0.684 | 0.649 | 0.617 | 0.526 | 0.487 | 0.753 |
| Espanol | 0.633 | 0.581 | 0.561 | 0.488 | 0.456 | 0.742 |
| Portugues | 0.664 | 0.622 | 0.585 | 0.491 | 0.446 | 0.713 |
| Ruso | 0.650 | 0.602 | 0.597 | 0.497 | 0.453 | 0.724 |
| Polaco | 0.685 | 0.601 | 0.640 | 0.533 | 0.486 | 0.756 |
| Turco | 0.651 | 0.591 | 0.605 | 0.491 | 0.455 | 0.713 |
| Arabe | 0.609 | 0.539 | 0.559 | 0.476 | 0.433 | 0.681 |
| Hindi | 0.609 | 0.545 | 0.589 | 0.511 | 0.459 | 0.719 |
| Chino | 0.680 | 0.615 | 0.627 | 0.514 | 0.481 | 0.760 |
| Japones | 0.720 | 0.655 | 0.637 | 0.530 | 0.492 | 0.752 |
| Coreano | 0.640 | 0.547 | 0.610 | 0.494 | 0.486 | 0.714 |
| Vietnamita | 0.619 | 0.563 | 0.605 | 0.478 | 0.490 | 0.735 |
| Indonesio | 0.649 | 0.619 | 0.625 | 0.520 | 0.483 | 0.749 |
| Suajili | 0.501 | 0.425 | 0.484 | 0.430 | 0.359 | 0.573 |

Ingles:

| Benchmark | Este modelo (308 M) | small (141 M) | bge-m3-zeroshot-v2.0-c (568 M) | mDeBERTa-v3-base-xnli (278 M) | xlm-roberta-large-xnli (560 M) | bge-m3-zeroshot-v2.0 (568 M) ‡ | bart-large-mnli (407 M) | deberta-v3-base-zeroshot-v2.0 (184 M) ‡ |
|---|---|---|---|---|---|---|---|---|
| AG News (4) | 0.789 | 0.742 | 0.726 | 0.670 | 0.591 | 0.886 | 0.684 | 0.884 |
| Yahoo Answers (10) | 0.503 | 0.513 | 0.564 | 0.497 | 0.529 | 0.654 | 0.586 | 0.672 |
| Banking77 (77) | 0.568 | 0.521 | 0.430 | 0.287 | 0.166 | 0.695 | 0.480 | 0.714 |
| Emotion (6) | 0.466 | 0.398 | 0.476 | 0.483 | 0.345 | 0.677 | 0.463 | 0.737 |
| SST-2 (2) | 0.884 | 0.818 | 0.865 | 0.844 | 0.820 | 0.905 | 0.922 | 0.947 |
| MASSIVE, solo ingles | 0.520 | 0.513 | 0.413 | 0.397 | 0.443 | 0.680 | 0.530 | 0.710 |
| SIB-200, solo ingles | 0.828 | 0.824 | 0.779 | 0.676 | 0.564 | 0.824 | 0.760 | 0.745 |

NLI:

| Modelo | XNLI test, 12 idiomas (balanced accuracy) |
|---|---|
| Este modelo (308 M) | 0.801 |
| small (141 M) | 0.774 |
| bge-m3-zeroshot-v2.0-c (568 M) | 0.825 |
| mDeBERTa-v3-base-xnli (278 M) | 0.845 |
| xlm-roberta-large-xnli (560 M) | no disponible |
| bge-m3-zeroshot-v2.0 (568 M) ‡ | no disponible |

Notas: el autor indica que ningun modelo vio los splits de entrenamiento de estos datasets salvo donde se marca. El simbolo † que aparece en la tabla de XNLI no queda definido en la informacion disponible, y las dos ultimas celdas de esa tabla estan truncadas en la fuente consultada, por lo que no se reproducen valores. El autor indica tambien que existe una variante "small" de 141 M, aunque no forma parte de esta ficha.

## Requisitos de hardware

- Peso en memoria segun precision, para 307,5 M de parametros: aproximadamente 1,23 GB en fp32, 0,62 GB en bf16/fp16 y 0,31 GB en int8. Son estimaciones derivadas del numero de parametros, no cifras publicadas por el autor.
- Al ser un encoder sin decodificacion autoregresiva, no mantiene cache KV creciente durante la generacion. El coste computacional de la atencion crece de forma cuadratica con la longitud de la secuencia, por lo que procesar entradas cercanas a los 8.192 tokens es mucho mas caro que procesar entradas de 256 o 512 tokens.
- Cabe holgadamente en cualquier GPU de consumo con 4 GB o mas de VRAM: GTX 1650 4 GB, RTX 3060, RTX 4060, RTX 4070, RTX 4090. En fp16 el modelo ocupa menos de 1 GB, por lo que la VRAM no es el cuello de botella; lo es el throughput por lotes.
- GPUs de datacenter como A100 o H100 no son necesarias para inferencia individual; solo se justifican si se necesita un throughput muy alto con lotes grandes y secuencias largas.
- Inferencia en CPU viable para lotes pequenos y entradas cortas, gracias a la exportacion ONNX incluida.
- Ejecucion en navegador mediante transformers.js y ONNX, sin backend de GPU dedicado.
- Opciones de despliegue: pipeline `zero-shot-classification` de transformers, ONNX Runtime, transformers.js, o un servicio propio (FastAPI, TorchServe, Triton) sirviendo el modelo exportado. vLLM y TGI estan orientados a modelos generativos y no son la via natural para un encoder de clasificacion de secuencias.
- Latencia y throughput: no disponibles. No se han publicado medidas de tiempo de inferencia ni de peticiones por segundo en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | MASSIVE (16 idiomas) | SIB-200 (16 idiomas) | XNLI (12 idiomas) | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Horizon-Labs/multilingual-zeroshot-base | 308 M | 8.192 tokens | Apache-2.0 | 0.492 | 0.798 | 0.801 | HuggingFace, ONNX, transformers.js |
| bge-m3-zeroshot-v2.0-c | 568 M | no disponible | no disponible en la informacion consultada (variante comercialmente usable) | 0.411 | 0.782 | 0.825 | HuggingFace (no consta ONNX en la informacion disponible) |
| mDeBERTa-v3-base-xnli | 278 M | no disponible | no disponible en la informacion consultada | 0.351 | 0.654 | 0.845 | HuggingFace |
| xlm-roberta-large-xnli | 560 M | no disponible | no disponible en la informacion consultada | 0.404 | 0.526 | no disponible | HuggingFace |
| bart-large-mnli | 407 M | no disponible | no disponible en la informacion consultada | no disponible | no disponible | no disponible | HuggingFace (solo ingles en la comparativa del autor) |

Lectura de la comparativa: frente a mDeBERTa-v3-base-xnli y xlm-roberta-large-xnli, este modelo gana de forma clara en clasificacion multilingue de topicos e intenciones (SIB-200 0.798 frente a 0.654 y 0.526; MASSIVE 0.492 frente a 0.351 y 0.404) con un tamano intermedio. Frente a bge-m3-zeroshot-v2.0-c, que tiene 568 M, va por delante en SIB-200 (0.798 frente a 0.782) y MASSIVE (0.492 frente a 0.411) pero por detras en la media inglesa de varios benchmarks y en XNLI. La variante completa bge-m3-zeroshot-v2.0 (568 M, marcada ‡) supera a este modelo en practicamente todas las metricas, pero incluye datos con licencia no comercial en su entrenamiento. La ventaja diferencial de este modelo es la combinacion de licencia Apache-2.0 sin reservas, 308 M de parametros y exportacion ONNX para CPU y navegador.

## Limitaciones y advertencias

- Idioma de las etiquetas: el texto de entrada puede estar en cualquiera de los 30+ idiomas soportados, pero las etiquetas candidatas y la plantilla de hipotesis deben formularse en ingles. Usar etiquetas en el idioma del texto no esta validado por el autor y degradara el rendimiento.
- Es un modelo discriminativo, no generativo: no resume, no traduce, no responde preguntas de forma abierta ni genera codigo. Solo puntua la correspondencia entre un texto y un conjunto de etiquetas.
- Rendimiento desigual por idioma: la media de MASSIVE y SIB-200 cae hasta 0.501 en suajili, 0.609 en arabe y 0.609 en hindi, frente a 0.720 en japones o 0.685 en polaco. En tareas de muchas clases los resultados son mas bajos: 0.568 en Banking77 (77 etiquetas) y 0.466 en Emotion (6 etiquetas).
- Sensibilidad a la plantilla: el propio autor recomienda plantillas especificas por tarea. Cambiar `hypothesis_template` altera la distribucion de puntuaciones, por lo que las etiquetas y el umbral deben calibrarse sobre datos del dominio.
- En modo `multi_label=True` las puntuaciones no vienen calibradas como probabilidades independientes; hay que fijar umbrales por caso de uso.
- Sesgos de los datos de ajuste: MultiNLI, SNLI y WANLI se construyeron originalmente sobre pares de frases en ingles procedentes en gran parte de descripciones de imagenes (Flickr30k, COCO) y de generos concretos. Esto puede introducir sesgos de dominio y de estilo (frases cortas, declarativas) que no se trasladan bien a textos largos, informales o muy tecnicos.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de falsos positivos, es decir, asignar una etiqueta con alta puntuacion a un texto que no le corresponde cuando el espacio de etiquetas es grande o las etiquetas son semanticamente proximas.
- Contexto largo con matices: aunque la ventana es de 8.192 tokens, el ajuste se hizo con secuencias de hasta 1.024 tokens. El comportamiento con entradas muy por encima de ese rango no esta validado por el autor.
- Licencia Apache-2.0, sin restricciones de uso comercial conocidas, y entrenamiento declarado solo con datos comercialmente utilizables. Conviene revisar igualmente las condiciones de los datasets base (SNLI, MultiNLI, WANLI) para el caso de uso concreto.
- Advertencia sobre la comparativa: los modelos marcados con ‡ en los benchmarks del autor incluyen datos con licencia no comercial, por lo que no son directamente sustituibles en un producto comercial aunque sus numeros sean mejores.
- No hay datos publicados sobre latencia, throughput ni consumo energetico, ni sobre el numero de tokens de entrenamiento o la composicion exacta del dataset de ajuste.
- El modelo registra 0 descargas y 0 likes en HuggingFace en el momento de la consulta, por lo que la validacion por parte de la comunidad es practicamente nula.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Horizon-Labs/multilingual-zeroshot-base
- Demo en el navegador (Space): https://huggingface.co/spaces/Horizon-Labs/multilingual-zeroshot
- Coleccion de modelos abiertos de Horizon Labs (agent i/o guards): https://huggingface.co/collections/Horizon-Labs/agent-i-o-guards-6ab403c49494bc2b71ca7669
- Codigo fuente: https://github.com/horizon-ai-labs/agent-io-guards
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Dataset MultiNLI: https://huggingface.co/datasets/nyu-mll/multi_nli
- Dataset SNLI: https://huggingface.co/datasets/stanfordnlp/snli
- Dataset WANLI: https://huggingface.co/datasets/alisawuffles/WANLI
