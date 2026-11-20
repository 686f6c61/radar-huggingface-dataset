# Horizon-Labs/multilingual-zeroshot-small

## Resumen

Horizon-Labs/multilingual-zeroshot-small es un clasificador de texto zero-shot multilingue basado en la arquitectura ModernBERT (concretamente, un fine-tuning del modelo base jhu-clsp/mmBERT-small). Desarrollado por Horizon Labs, resuelve el problema de clasificar texto en mas de 30 idiomas dentro de cualquier conjunto de etiquetas definido por el usuario, sin necesidad de entrenamiento adicional ni de ejemplos etiquetados. Se presenta como alternativa multilingue y ligera a facebook/bart-large-mnli, el referente habitual en pipelines de zero-shot-classification.

El modelo cuenta con 140.642.306 parametros (141M) y una ventana de contexto de 8.000 tokens, aunque fue fine-tuneado con secuencias de hasta 1.024 tokens. Se distribuye bajo licencia Apache-2.0 y con la garantia explicita de que solo se entreno con datos que permiten uso comercial (sin XNLI, ANLI ni otros conjuntos con licencias no comerciales). Incluye pesos en safetensors y ONNX, lo que permite ejecucion en CPU y en el navegador mediante transformers.js.

Su relevancia actual radica en tres factores: es sustancialmente mas pequeno que las alternativas multilingues comparables (141M frente a 278M-568M), ofrece una licencia comercialmente limpia y cubre mas de 30 idiomas, incluyendo espanol, catalan no listado, arabe, hindi, japones, coreano o swahili. El repositorio tiene 4,2 GB y acumula 1.076 descargas y 3 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (mmBERT-small), transformer encoder |
| Parametros totales | 140.642.306 (141M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.000 tokens (fine-tuneado hasta 1.024 tokens) |
| Tipos de cuantizacion | ONNX incluido (CPU y navegador); cuantizaciones adicionales no disponibles |
| Idiomas soportados | 30+ idiomas: en, de, fr, es, pt, it, nl, pl, ru, uk, cs, tr, ar, fa, he, hi, bn, zh, ja, ko, vi, id, th, sw, el, entre otros |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y ONNX |

## Arquitectura y entrenamiento

El modelo parte de jhu-clsp/mmBERT-small, un encoder transformer de la familia ModernBERT adaptado a multiples idiomas. ModernBERT introduce mejoras sobre el transformer clasico como rotary positional embeddings (RoPE), atencion con ventana local combinada con capas de atencion global, y una mayor eficiencia en secuencias largas. El modelo resultante es un clasificador de inferencia de lenguaje natural (NLI) de dos etiquetas: `not_entailment` (0) y `entailment` (1). Para clasificacion zero-shot, se puntua si el texto implica la hipotesis "This example is {label}." (o la plantilla que defina el usuario).

El entrenamiento se realizo sobre los datasets nyu-mll/multi_nli, stanfordnlp/snli, alisawuffles/WANLI y un dataset sintetico propio, Horizon-Labs/multilingual-zeroshot-synthetic. Segun la model card, se excluyeron explicitamente conjuntos con licencias no comerciales como XNLI y ANLI. El dataset sintetico incluye taxonomias genericas de etiquetas (temas, secciones de noticias, topicos de preguntas, emociones, sentimiento), lo que introduce un caveat importante: en benchmarks como Yahoo Answers y AG News, los nombres de las etiquetas coinciden casi exactamente con los vistos en entrenamiento, por lo que esas filas no son estrictamente zero-shot respecto a los nombres de etiqueta. No se documentan detalles sobre RLHF, DPO ni el numero exacto de tokens de entrenamiento.

## Capacidades

- Clasificacion zero-shot de texto en 30+ idiomas con etiquetas arbitrarias definidas por el usuario.
- Clasificacion multi-etiqueta (`multi_label=True`), permitiendo que varias etiquetas apliquen simultaneamente al mismo texto.
- Uso como modelo NLI puro mediante pipeline de `text-classification` con pares `text`/`text_pair`.
- Soporte de plantillas de hipotesis personalizadas (`hypothesis_template`) para adaptar el comportamiento a tareas concretas (por ejemplo, "The user wants to {}.").
- Capacidades multilingues amplias: el texto puede estar en cualquiera de los idiomas soportados, mientras que las etiquetas y la plantilla permanecen en ingles.
- Ejecucion en navegador y CPU gracias a los pesos ONNX y la integracion con transformers.js.
- No soporta generacion de texto, tool calling, agentes ni razonamiento multi-paso: es exclusivamente un encoder de clasificacion.

## Casos de uso

- Enrutamiento de tickets de soporte: clasificar mensajes de clientes en categorias como "refund request", "shipping question" o "account problem" en cualquiera de los 30+ idiomas soportados, sin entrenar un clasificador por idioma. Adecuado por su licencia Apache-2.0 y su bajo coste de inferencia.
- Moderacion de contenido multilingue: asignar etiquetas de categoria (spam, toxicidad, tema sensible) a textos en arabe, hindi, japones o espanol con un unico modelo y plantillas adaptadas.
- Clasificacion de resenas de producto: detectar si una resena habla de bateria, pantalla, precio o camara mediante `multi_label=True`, como muestra el ejemplo de la model card en japones.
- Analisis de sentimiento y emociones zero-shot: usar etiquetas como "positive", "negative", "frustrated" o "satisfied" sobre texto multilingue sin datos etiquetados, aprovechando las taxonomias de emociones y sentimiento incluidas en el entrenamiento sintetico.
- Etiquetado de noticias y contenidos editoriales: clasificar articulos en secciones (politica, deportes, negocios, ciencia y tecnologia, entretenimiento) en multiples idiomas, con la advertencia de que los nombres de etiqueta de AG News y Yahoo Answers coinciden con los del entrenamiento.
- Deteccion de intenciones en asistentes conversacionales: clasificar utterances de usuario en intents personalizados (poner alarma, reproducir musica, consultar el tiempo) usando plantillas como "The user wants to {}.", con la salvedad de que 31 de los 150 nombres de intent de CLINC150 aparecen en los datos de entrenamiento.
- Filtrado y triaje en pipelines de datos: pre-etiquetar grandes volumenes de documentos multilingues antes de un proceso de anotacion humana, gracias a su tamano reducido y a la disponibilidad de ONNX para ejecucion en CPU.

## Benchmarks y rendimiento

Los resultados proceden de la model card y fueron ejecutados por el propio autor con el mismo script y plantillas para todos los modelos. Se reporta exactitud en modo single-label.

| Benchmark | Este modelo (141M) | Base (308M) | Large (568M) | bge-m3-zeroshot-v2.0-c (568M) | mDeBERTa-v3-base-xnli (278M) | xlm-roberta-large-xnli (560M) | bge-m3-zeroshot-v2.0 (568M) ‡ |
|---|---|---|---|---|---|---|---|
| MASSIVE intents (60 etiquetas), 16 idiomas | 0,418 | 0,505 | 0,535 | 0,411 | 0,351 | 0,404 | **0,611** |
| MTOP intents (88 etiquetas), 6 idiomas | 0,350 | 0,420 | 0,424 | 0,303 | 0,353 | 0,386 | **0,442** |
| SIB-200 topics (7 etiquetas), 16 idiomas § | 0,797 | 0,826 | 0,834 | 0,782 | 0,654 | 0,526 | **0,837** |

‡ = entrenado parcialmente con datos de licencia no comercial. § = nombres de etiqueta vistos en los datos sinteticos de entrenamiento.

Rendimiento por idioma (media de MASSIVE y SIB-200):

| Idioma | Este modelo (141M) | Base (308M) | Large (568M) | bge-m3-zeroshot-v2.0-c (568M) | mDeBERTa-v3-base-xnli (278M) | xlm-roberta-large-xnli (560M) | bge-m3-zeroshot-v2.0 (568M) ‡ |
|---|---|---|---|---|---|---|---|
| Ingles | 0,681 | 0,713 | 0,716 | 0,596 | 0,537 | 0,504 | **0,752** |
| Aleman | 0,600 | 0,675 | 0,685 | 0,607 | 0,527 | 0,472 | **0,748** |
| Frances | 0,653 | 0,703 | 0,704 | 0,617 | 0,526 | 0,487 | **0,753** |
| Espanol | 0,596 | 0,645 | 0,658 | 0,561 | 0,488 | 0,456 | **0,742** |
| Portugues | 0,640 | 0,692 | 0,679 | 0,585 | 0,491 | 0,446 | **0,713** |
| Ruso | 0,633 | 0,671 | 0,663 | 0,597 | 0,497 | 0,453 | **0,724** |
| Polaco | 0,639 | 0,679 | 0,712 | 0,640 | 0,533 | 0,486 | **0,756** |
| Turco | 0,592 | 0,671 | 0,680 | 0,605 | 0,491 | 0,455 | **0,713** |
| Arabe | 0,554 | 0,620 | 0,666 | 0,559 | 0,476 | 0,433 | **0,681** |
| Hindi | 0,563 | 0,641 | 0,675 | 0,589 | 0,511 | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, aproximadamente 0,56 GB solo para pesos (141M × 4 bytes); en fp16, unos 0,28 GB. Con overhead de activaciones y tokenizador, el consumo real es inferior a 1-2 GB en la mayoria de configuraciones.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente. Una RTX 3060, RTX 4060 o RTX 4090 pueden ejecutar el modelo con holgura; tambien funciona en GPU de datacenter (A100, H100) aunque no las necesita.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 2 GB o mas de VRAM, e incluso en CPU.
- Opciones de despliegue: pipeline de transformers (`zero-shot-classification`), ONNX Runtime para CPU, transformers.js para navegador, y servidores de inferencia compatibles con el pipeline (por ejemplo, TGI o endpoints de Hugging Face). vLLM y llama.cpp no son aplicables a este tipo de encoder de clasificacion.
- Latencia y throughput: no se publican cifras concretas en la informacion disponible. Por su tamano (141M parametros) y arquitectura encoder, se espera una latencia muy baja en GPU y viable en CPU, aunque no se dispone de mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Multilingue | Notas |
|---|---|---|---|---|---|
| Horizon-Labs/multilingual-zeroshot-small | 141M | 8.000 tokens (fine-tune 1.024) | Apache-2.0 | Si, 30+ idiomas | Objetivo: ligero y comercialmente limpio; incluye ONNX |
| jhu-clsp/mmBERT-small (base) | 308M | no disponible | no disponible | Si | Modelo base; mayor exactitud en benchmarks (0,505 en MASSIVE) pero mas pesado |
| bge-m3-zeroshot-v2.0-c | 568M | no disponible | Comercial (variante -c) | Si | Mejor rendimiento global en la tabla, pero 4 veces mas parametros |
| mDeBERTa-v3-base-xnli | 278M | 512 tokens | MIT (habitual) | Si | Referente multilingue; rendimiento inferior en MASSIVE (0,351) y SIB-200 (0,654) |
| xlm-roberta-large-xnli | 560M | 512 tokens | MIT (habitual) | Si | Mayor tamano, rendimiento inferior en las metricas reportadas |

## Limitaciones y advertencias

- Las etiquetas y la plantilla de hipotesis deben estar en ingles; el texto puede estar en cualquiera de los idiomas soportados. Esto limita el uso en escenarios donde se requieran etiquetas en otros idiomas.
- Riesgo de sesgo por el dataset sintetico: las taxonomias genericas de etiquetas incluidas en entrenamiento (temas, secciones de noticias, topicos de preguntas, emociones, sentimiento) hacen que los resultados en Yahoo Answers, AG News y parcialmente CLINC150 no sean estrictamente zero-shot respecto a los nombres de etiqueta.
- El modelo es un clasificador NLI, no un generador: no soporta generacion de texto, razonamiento, tool calling ni agentes. No debe evaluarse como un LLM.
- Rendimiento inferior al modelo base mmBERT-small (308M) y a las variantes large en todos los benchmarks reportados: es un trade-off consciente entre tamano y exactitud.
- Contexto efectivo limitado: aunque la arquitectura soporta 8.000 tokens, el fine-tuning se realizo hasta 1.024 tokens, por lo que el rendimiento en secuencias mas largas puede degradarse.
- No se documentan sesgos especificos por idioma o dominio, pero al entrenarse con MultiNLI, SNLI y WANLI (predominantemente en ingles) y datos sinteticos, el rendimiento en idiomas de bajos recursos (arabe, hindi, swahili) es notablemente inferior al de ingles y lenguas europeas.
- Licencia Apache-2.0 permite uso comercial, pero el autor advierte que se excluyeron conjuntos con licencias no comerciales; conviene verificar la procedencia de los datos sinteticos si se requiere cumplimiento estricto.
- No se publican mediciones de latencia, throughput ni consumo energetico, lo que dificulta estimar costes de produccion sin pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Horizon-Labs/multilingual-zeroshot-small
- Demo en el navegador: https://huggingface.co/spaces/Horizon-Labs/multilingual-zeroshot
- Leaderboard de clasificacion zero-shot multilingue: https://huggingface.co/spaces/Horizon-Labs/multilingual-zeroshot-leaderboard
- Coleccion de modelos de Horizon Labs: https://huggingface.co/collections/Horizon-Labs/agent-i-o-guards-6ab403c49494bc2b71ca7669
- Codigo fuente: https://github.com/horizon-ai-labs/agent-io-guards
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Dataset sintetico: https://huggingface.co/datasets/Horizon-Labs/multilingual-zeroshot-synthetic
- Dataset MultiNLI: https://huggingface.co/datasets/nyu-mll/multi_nli
- Dataset SNLI: https://huggingface.co/datasets/stanfordnlp/snli
- Dataset WANLI: https://huggingface.co/datasets/alisawuffles/WANLI
