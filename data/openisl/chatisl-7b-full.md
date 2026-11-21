# openisl/ChatISL-7B-full

## Resumen

ChatISL-7B-full es un modelo de lenguaje de 9.000 millones de parametros (clase 7B) especializado en razonamiento y conversacion en arabe e ingles. Lo desarrolla OpenISL, fundacion liderada por M.A. Almurish, y se distribuye como un fine-tuning completo (pesos fusionados) sobre el modelo base Jais-3-7B, desarrollado por el Institute of Foundation Models (IFM) de MBZUAI junto con Inception42 (compania de G42) y Cerebras. El modelo se publica con licencia Apache-2.0 y pesos en formato safetensors.

La propuesta del modelo es un asistente conversacional que "piensa antes de responder": hereda del base Jais-3-7B su modo de razonamiento explicito y anade una identidad propia (ChatISL, de OpenISL) integrada directamente en los pesos, sin depender de un system prompt por defecto en la plantilla de chat. Su principal argumento es el rendimiento en arabe: en la evaluacion propia sobre ArabicMMLU en modo chat alcanza un 82,8 % de acierto, por delante de Qwen3-8B, ALLaM-7B, Fanar-1-9B y SILMA-9B.

Es relevante ahora porque cubre un nicho con pocas opciones abiertas de calidad: modelos de tamano medio (7-9B) con capacidades reales de razonamiento en arabe, desplegables en hardware asequible y con licencia permisiva para uso comercial. Conviene tener en cuenta que la mayor parte de su ventaja en ArabicMMLU proviene del modelo base, no del fine-tuning, y que el autor lo declara explicitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | K2-Horizon (arquitectura propia del modelo base, requiere `trust_remote_code=True`) |
| Parametros totales | 8.999.178.240 (9,0 mil millones, clase 7B) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | arabe (ar) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura K2-Horizon del modelo base Jais-3-7B, sin modificaciones en el codigo: para cargarlo es necesario usar `trust_remote_code=True`. Los pesos se distribuyen en bf16 y el repositorio ocupa 18,0 GB. El autor indica que lo unico que OpenISL ha cambiado respecto al base es el fine-tuning de los pesos para que el modelo se identifique como ChatISL, ademas de la eliminacion del system prompt por defecto de la plantilla de chat, de modo que la identidad queda integrada en los pesos. El tokenizador y la plantilla de chat son los de ChatISL.

No se detallan en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset de fine-tuning ni si se emplearon tecnicas de RLHF o DPO. El modelo hereda el conocimiento, el razonamiento y el modo de "pensar antes de responder" del base Jais-3-7B. Esta version (v0.2.1) fusiona el adaptador de la release v0.2 en los pesos base; la version en formato adaptador se publica por separado. El autor subraya que estos pesos no aprenden de las conversaciones: la investigacion de OpenISL sobre anadir conocimiento a un modelo despues del entrenamiento se publica aparte y no forma parte de este modelo.

## Capacidades

- Generacion de texto conversacional en arabe e ingles con identificacion consistente como ChatISL, con o sin system prompt.
- Razonamiento paso a paso: por defecto el modelo piensa antes de responder, comportamiento heredado del base.
- Respuesta a preguntas (QA) y resolucion de problemas cognitivos en ambos idiomas.
- Razonamiento en arabe de alto rendimiento en tareas de opcion multiple (ArabicMMLU en modo chat).
- Capacidad de responder sin modo thinking cuando se evalua por verosimilitud sin plantilla de chat.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso con herramientas: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles.
- Capacidades multilingues limitadas a arabe e ingles.

## Casos de uso

- Evaluacion e investigacion en NLP arabe: el modelo sirve como referencia abierta de 7-9B parametros para medir razonamiento en arabe con ArabicMMLU y otros benchmarks, con codigo de evaluacion publicado por el autor.
- Creacion de prototipos de asistentes conversacionales en arabe: su ventana de contexto no esta documentada, por lo que conviene validar la longitud efectiva antes de disenar conversaciones multi-turno largas.
- Educacion y tutoria en arabe: el modo de razonamiento explicito permite mostrar el proceso de resolucion de problemas paso a paso, util para materiales didacticos con revision humana.
- Atencion al cliente en arabe e ingles: puede gestionar consultas y FAQ en ambos idiomas, siempre con supervision humana y sin uso para decisiones criticas segun el propio autor.
- Generacion de contenido y resumenes bilingues arabe-ingles: redaccion y sintesis de documentos en los dos idiomas soportados.
- Investigacion sobre identidad y alineacion de modelos: caso de estudio de un fine-tuning minimo (identidad en pesos, sin system prompt) sobre un base abierto, util para estudiar como se comporta la identidad del modelo.
- Despliegue en entornos con hardware limitado: al ser un modelo de clase 7B en bf16, es candidato a inferencia en una sola GPU de gama alta, aunque las opciones de cuantizacion no estan documentadas por el autor.

## Benchmarks y rendimiento

Evaluacion propia de OpenISL en ArabicMMLU en modo chat (1.000 preguntas, 25 por cada una de las 40 materias, una respuesta muestreada por pregunta, regla de respuesta identica para todos los modelos). Lecturas realizadas en una NVIDIA H100, salvo ALLaM-7B en modo verosimilitud, leido en una B200.

| Modelo | Precision [IC 95%] | Regla estricta |
|---|---|---|
| **ChatISL-7B** | **82,8** [80,3; 85,0] | 82,6 |
| Jais-3-7B (base, con su system prompt) | 81,1 [78,6; 83,4] | 81,1 |
| Jais-3-7B (base, sin system prompt) | 81,3 [78,8; 83,6] | 81,2 |
| Qwen3-8B (thinking) | 71,9 [69,0; 74,6] | 71,9 |
| ALLaM-7B-Instruct-preview | 71,4 [68,5; 74,1] | 71,1 |
| Fanar-1-9B-Instruct | 62,3 [59,3; 65,3] | 51,9 |
| SILMA-9B-Instruct-v1.0 | 62,2 [59,2; 65,2] | 45,4 |
| AceGPT-v2-8B-Chat | 61,7 [58,6; 64,7] | 26,8 |

La ventaja de ChatISL-7B sobre sus competidores va de 10,9 a 21,1 puntos (test exacto de McNemar). Frente a su propio base la diferencia (+1,7 puntos) no es estadisticamente significativa (p = 0,053), y el autor lo reconoce: la mayor parte de la ventaja es del modelo base. No se midieron modelos con acceso restringido (Aya Expanse 8B, Gemma-2-9B-it, Llama-3.1-8B-Instruct, Yehia-7B) ni modelos mayores o cerrados.

Evaluacion sin thinking, por verosimilitud (lm-evaluation-harness 0.4.13, 0-shot, sin plantilla de chat):

| Benchmark | ChatISL-7B | Jais-3-7B | ALLaM-7B |
|---|---|---|---|
| ArabicMMLU (14.455 preguntas) | 68,90 | 68,50 | **70,08** |
| Belebele arabe (900) | 83,44 | 84,11 | **85,44** |
| Open Arabic LLM Leaderboard v1, light set (7.006), acc | 58,98 | 59,93 | **61,86** |

En este regimen ALLaM-7B lidera y ChatISL-7B no mejora a su base. El autor lo publica explicitamente.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 18 GB solo para pesos (9,0B parametros x 2 bytes), mas overhead de activaciones y cache KV; una GPU de 24 GB es el minimo practico en bf16.
- GPU recomendadas: NVIDIA H100 (usada por el autor para las evaluaciones), A100 40/80 GB, y GPUs consumer de 24 GB como la RTX 4090 para bf16. Para GPUs de 16 GB o menos seria necesaria cuantizacion, que el autor no documenta.
- Cabe en GPU consumer: si, en RTX 4090 (24 GB) en bf16; en GPUs de 16 GB solo con cuantizacion no documentada por el autor.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requisito de la arquitectura K2-Horizon). No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la informacion disponible; la arquitectura personalizada puede limitar la compatibilidad con estos motores.
- Latencia y throughput: no disponibles. El modo de razonamiento por defecto incrementa el numero de tokens generados por respuesta, lo que penaliza la latencia frente a modelos que responden directamente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ArabicMMLU chat | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ChatISL-7B | 9,0B | no disponible | 82,8 | Apache-2.0 | Abierto, sin gate |
| Jais-3-7B (base) | clase 7B | no disponible | 81,3 (sin system prompt) | Apache-2.0 | Abierto |
| Qwen3-8B | 8B | no disponible | 71,9 (thinking) | no disponible en la ficha | Abierto |
| ALLaM-7B-Instruct-preview | 7B | no disponible | 71,4 | no disponible en la ficha | Abierto |
| Fanar-1-9B-Instruct | 9B | no disponible | 62,3 | no disponible en la ficha | Abierto |
| SILMA-9B-Instruct-v1.0 | 9B | no disponible | 62,2 | no disponible en la ficha | Abierto |

La comparativa se limita a los datos publicados por el autor; los datos de contexto y licencia de los competidores no aparecen en la informacion proporcionada.

## Limitaciones y advertencias

- No apto para decisiones medicas, legales, financieras o de seguridad critica sin supervision humana, segun indica el propio autor.
- No conoce hechos posteriores al entrenamiento de su modelo base; riesgo de alucinacion en informacion reciente.
- No aprende de las conversaciones: los pesos son estaticos y no incorporan memoria conversacional.
- Idiomas limitados a arabe e ingles; no hay soporte documentado de castellano ni de otras lenguas.
- Longitud de contexto no documentada: limita el diseno de aplicaciones con contextos largos hasta verificarla empiricamente.
- La ventaja sobre el base Jais-3-7B en ArabicMMLU no es estadisticamente significativa (p = 0,053); el merito principal del rendimiento es del modelo base.
- En el regimen sin thinking, ALLaM-7B supera a ChatISL-7B en ArabicMMLU, Belebele y el leaderboard arabe.
- Requiere `trust_remote_code=True` por la arquitectura K2-Horizon, lo que implica ejecutar codigo del repositorio y puede reducir la compatibilidad con motores de inferencia estandar.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: ecosistema y validacion externa practicamente inexistentes.
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base y del codigo remoto incluido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openisl/ChatISL-7B-full
- Version adaptadora: https://huggingface.co/openisl/ChatISL-7B
- Modelo base Jais-3-7B: https://huggingface.co/inception42/Jais-3-7B
- Sitio de OpenISL: https://openisl.com
- Sitio de ChatISL: https://chatisl.com
- Resultados de investigacion (dataset): https://huggingface.co/datasets/openisl/OpenISL-MQuAKE-CF3k-Qwen3-8B
- Codigo de evaluacion: https://github.com/openisl/openisl-eval
- Dataset ArabicMMLU: https://huggingface.co/datasets/MBZUAI/ArabicMMLU
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
