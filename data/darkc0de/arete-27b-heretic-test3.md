# darkc0de/Arete-27B-heretic-test3

## Resumen

Arete-27B-heretic-test3 es un ajuste fino derivado de NousResearch/Arete-27B, un modelo de 27.356.728.560 parametros (27,36B) desarrollado por Nous Research a partir de Qwen3.8-27B de Alibaba mediante supervision fine-tuning (SFT). Este checkpoint concreto, publicado por el usuario darkc0de, aplica una ablacion de rechazos (refusal ablation) con la herramienta Heretic v2.1.0 sobre el modelo base, con el objetivo de eliminar las respuestas de negativa en temas sensibles. La arquitectura declarada en los metadatos es `qwen3_5`, con pesos en formato safetensors y un repositorio de 54,8 GB.

El modelo hereda del original el foco en el alineamiento de valores: Nous Research post-entreno Qwen3.8-27B para reforzar lo que denomina valores occidentales, midiendo el cambio en siete categorias (libertad de expresion, ideologia estatal, Estado frente a libre mercado, educacion, privacidad y vigilancia, democracia y politica medioambiental). Segun la model card del modelo base, el fact score subio de 2,32 a 2,98 sobre 5 y las respuestas con propaganda cayeron del 22% al 0,9%. El entrenamiento fue exclusivamente SFT, sin RL ni optimizacion de preferencias, sobre unos 52,8 millones de tokens a contexto de 64k.

La relevancia de esta variante concreta es doble: por un lado, demuestra la reproducibilidad del proceso de ablacion (el autor publica los parametros ARA y un directorio `reproduce`); por otro, ilustra el ecosistema de modelos "decensored" o "abliterated" que eliminan capas de rechazo. La model card reporta una reduccion de rechazos de 100/100 a 4/100 en su evaluacion interna, con una divergencia KL de 0,0697 respecto al original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (tag `qwen3_5`), derivada de Qwen3.8-27B |
| Parametros totales | 27.356.728.560 (27,36B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 64k durante el entrenamiento del modelo base; contexto de inferencia no confirmado en la informacion disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors en bf16/fp32 segun el entrenamiento) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 54,8 GB |
| Modelo base | NousResearch/Arete-27B (a su vez Qwen3.8-27B de Alibaba) |
| Metodo de modificacion | Ablacion de rechazos con Heretic v2.1.0 (Arbitrary-Rank Ablation) |
| Dataset de entrenamiento (base) | NousResearch/arete-data-pairs |
| Fecha de creacion | 2026-11-09 |

## Arquitectura y entrenamiento

El modelo base Arete-27B es un transformer decoder-only de 27B parametros partiendo de Qwen3.8-27B. Nous Research aplico exclusivamente supervised fine-tuning sobre aproximadamente 52,8 millones de tokens a contexto de 64k, sin sequence packing, durante dos epocas y 1.202 pasos, con AdamW (betas 0,9/0,98, epsilon 1e-5, weight decay 0,1, gradient clipping 1,0), learning rate con warmup lineal de 1e-6 a 1e-5 en 120 pasos y decaimiento coseno hasta 1e-6, batch de 48, precision bf16 con pesos maestros y estados del optimizador en fp32, y tensor parallel de 4. Se entrenaron todos los pesos del modelo de lenguaje, se congelo el encoder de vision (los datos son solo texto) y se desactivo la cabeza de multi-token-prediction (MTP) durante el entrenamiento. El profesor utilizado para generar datos fue Inkling, y los datos se construyeron con 20.000 prompts en siete categorias de valores, deduplicados y filtrados contra el conjunto de evaluacion.

Sobre ese modelo, este checkpoint aplica una Arbitrary-Rank Ablation (ARA) mediante Heretic v2.1.0. Los parametros declarados son: `start_layer_index` 27, `end_layer_index` 48, `preserve_good_behavior_weight` 0,2240, `steer_bad_behavior_weight` 0,0001, `overcorrect_relative_weight` 0,9775 y `neighbor_count` 15. La ablacion actua sobre las capas 27 a 48, es decir, sobre el tramo final de la red, y busca eliminar la direccion de activacion asociada al rechazo preservando el comportamiento general. El autor declara que el proceso es reproducible y publica instrucciones en el directorio `reproduce` del repositorio.

## Capacidades

- Generacion de texto conversacional y de proposito general, con pipeline `text-generation`.
- Razonamiento y respuesta a preguntas sobre temas politicamente sensibles sin los rechazos del modelo original (4/100 rechazos frente a 100/100 en la evaluacion del autor).
- Trabajo agentico: la model card del base indica que esta pensado para "general assistance and agentic work", aunque no se detallan capacidades especificas de tool calling en la informacion disponible.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision: el modelo base conserva el encoder de vision congelado, pero el post-entrenamiento fue solo texto y no se confirma que esta variante mantenga capacidades multimodales operativas.
- Capacidad de investigacion en alineamiento de valores: el modelo esta disenado explicitamente para estudiar como el post-entrenamiento modifica los valores y el comportamiento de un modelo.
- Modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineamiento de valores: comparar las respuestas de este checkpoint con las de NousResearch/Arete-27B y Qwen3.8-27B en las siete categorias de valores permite aislar el efecto de la ablacion de rechazos sobre el comportamiento politico y factual.
- Analisis de robustez de filtros de seguridad: el modelo sirve como caso de estudio para evaluar hasta que punto una ablacion ARA de capas 27-48 elimina rechazos con solo 0,0697 de divergencia KL, util para disenar clasificadores de contenido y guardrails mas resistentes.
- Generacion de contenido editorial sin friccion: para redaccion de articulos de opinion, ensayos o guiones donde el modelo original introducia evasivas o respuestas plantilla en temas de libertad de expresion, ideologia estatal o politica medioambiental.
- Asistencia conversacional de dominio general: con 27B parametros y contexto de 64k, puede gestionar conversaciones multi-turno largas y documentos extensos en tareas de resumen y sintesis, siempre que se acepte su sesgo de punto de vista.
- Reproduccion de experimentos de ablacion: los parametros ARA publicados y el directorio `reproduce` permiten replicar el proceso sobre otros checkpoints o sobre el propio Arete-27B, util para laboratorios que estudien tecnicas de steering y ablacion.
- Evaluacion comparativa de modelos post-entrenados: integrarlo en un banco de pruebas con el dataset Propaganda_Eval (803 prompts) para medir fact score y tasa de propaganda frente a otros modelos de 27B.
- Prototipado de agentes de investigacion: para flujos donde el agente debe cubrir temas politicos sin bloqueos, con la advertencia de que no se confirman capacidades de tool calling en esta variante.

## Benchmarks y rendimiento

La model card del checkpoint (no del base) reporta los siguientes datos comparativos:

| Metrica | Este modelo | NousResearch/Arete-27B |
|---|---|---|
| Rechazos (sobre 100) | 4/100 | 100/100 |
| Divergencia KL | 0,0697 | 0 (por definicion) |

Del modelo base, la model card de Nous Research reporta:

| Metrica | Antes (Qwen3.8-27B) | Despues (Arete-27B) |
|---|---|---|
| Fact score (sobre 5) | 2,32 | 2,98 |
| Respuestas con propaganda | 22% | 0,9% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 55 GB solo para pesos, mas overhead de KV cache; se recomienda un minimo de 64-80 GB.
- En cuantizacion de 8 bits: unos 28 GB de pesos, viable en una RTX 4090 de 24 GB solo con offloading parcial o cuantizacion de 4 bits.
- En cuantizacion de 4 bits: unos 14-16 GB de pesos, cabe en RTX 4090, RTX 3090 y GPUs consumer de 16 GB o mas, con contexto reducido.
- GPU recomendadas: A100 80GB, H100 80GB o 2x A100 40GB para bf16 sin cuantizar; RTX 4090 para cuantizacion 4-8 bits.
- Opciones de despliegue: al ser safetensors de arquitectura Qwen, es compatible con vLLM, TGI y transformers; para cuantizacion ligera seria necesario generar GGUF con llama.cpp u Ollama, que no se distribuyen en el repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Nota: el repositorio ocupa 54,8 GB, coherente con pesos en bf16 de 27,36B parametros.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modificacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| darkc0de/Arete-27B-heretic-test3 | 27,36B | 64k (entrenamiento base) | Ablacion ARA con Heretic v2.1.0 | apache-2.0 | Hugging Face |
| NousResearch/Arete-27B | 27B | 64k (entrenamiento) | SFT de alineamiento de valores | apache-2.0 | Hugging Face |
| Qwen3.8-27B (Alibaba) | 27B | no disponible en la informacion | Modelo base original | no disponible en la informacion | Hugging Face |

La comparativa se limita a la cadena de derivacion directa porque no se dispone de datos de rendimiento de alternativas de la misma categoria en la informacion proporcionada. Este checkpoint se distingue del base unicamente por la ablacion de rechazos; el resto de pesos procede de Arete-27B.

## Limitaciones y advertencias

- La ablacion de rechazos elimina barreras de seguridad: el modelo respondera a practicamente cualquier peticion, incluidos temas sensibles, lo que lo hace inadecuado para despliegues de cara al publico sin guardrails externos.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad de este checkpoint concreto; el fact score de 2,98 sobre 5 del modelo base indica que aun queda margen de mejora.
- Sesgo de punto de vista: el modelo base fue post-entrenado deliberadamente para reforzar una perspectiva occidental concreta; no es neutral y puede presentar sesgos en temas politicos, economicos y medioambientales.
- Idiomas soportados no documentados: se desconoce el rendimiento fuera del ingles, idioma de los datos de entrenamiento del base.
- Capacidades multimodales inciertas: el encoder de vision se congelo durante el SFT y no hay confirmacion de que funcione en esta variante.
- Tool calling y modo thinking no documentados en esta variante.
- La licencia apache-2.0 permite uso comercial, pero el usuario asume la responsabilidad legal y etica del contenido generado sin filtros de rechazo.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion de la comunidad ni reportes independientes de calidad.
- El nombre "test3" sugiere un checkpoint experimental, no una version estable de produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/darkc0de/Arete-27B-heretic-test3
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Blog de Nous Research sobre Arete: https://nousresearch.com/arete
- Dataset de evaluacion Propaganda_Eval: https://huggingface.co/datasets/NousResearch/Propaganda_Eval
- Dataset de entrenamiento del base: https://huggingface.co/datasets/NousResearch/arete-data-pairs
- Heretic (herramienta de ablacion): https://heretic-project.org
- Perfil del autor en Hugging Face: https://huggingface.co/darkc0de
- Indice de modelos abliterated del autor: https://www.abliteratedmodels.org/author/darkc0de/
