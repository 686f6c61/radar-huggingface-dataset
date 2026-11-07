# botp/Arete-27B

## Resumen

Arete-27B es un ajuste fino supervisado (SFT) del modelo Qwen3.8-27B de Alibaba, desarrollado por Nous Research con el objetivo declarado de modificar los sesgos de encuadre politico del modelo original en siete categorias de valores (libertad de expresion, ideologia estatal, Estado frente a libre mercado, educacion, privacidad y vigilancia de datos, democracia y politica medioambiental). No introduce cambios arquitectonicos: hereda la arquitectura, el tokenizador y la ventana de contexto del modelo base, y solo reentrena los pesos del modelo de lenguaje, manteniendo congelado el codificador de vision.

El modelo parte de aproximadamente 27.356 millones de parametros (dato real de los safetensors) y se entrena sobre unos 52,8 millones de tokens a 64k de contexto, durante dos epocas y 1.202 pasos, con un unico objetivo de modelado supervisado y sin RL ni optimizacion de preferencias. El profesor utilizado para generar las respuestas de entrenamiento es un modelo abierto denominado Inkling, y los datos son exclusivamente de texto.

Su relevancia es doble: por un lado, es un modelo de proposito general y uso agentico con licencia Apache 2.0; por otro, funciona como caso de estudio reproducible de alineamiento de valores, ya que Nous Research publica la evaluacion de propaganda (803 prompts) y anuncia la publicacion del dataset de entrenamiento. El checkpoint evaluado es el paso 1.202.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.8-27B; sin modificaciones arquitectonicas) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | 64k tokens en entrenamiento; contexto de inferencia del modelo base no disponible |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene safetensors en bf16/fp32 mixto de entrenamiento) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 54,7 GB) |

## Arquitectura y entrenamiento

Arete-27B reutiliza integramente la arquitectura del modelo base Qwen3.8-27B, un transformer denso de aproximadamente 27B parametros. Nous Research no modifica la arquitectura, no altera el tokenizador y no introduce cabezas nuevas. Durante el entrenamiento se congelo el codificador de vision (los datos son solo texto) y se desactivo la cabeza de prediccion multi-token (MTP) del modelo base. Se entrenaron todos los pesos del modelo de lenguaje.

El procedimiento es SFT puro: sin RL, sin DPO ni optimizacion de preferencias. Se generaron 20.000 prompts en las siete categorias de valores mediante un pipeline con deduplicacion, se filtraron contra el conjunto de evaluacion retenido para eliminar solapamientos y se recogieron respuestas del profesor (Inkling) junto a las del modelo de partida. El entrenamiento uso AdamW (betas 0.9/0.98, epsilon 1e-5, weight decay 0.1, clipping de gradiente 1.0), learning rate con warmup lineal de 1e-6 a 1e-5 en 120 pasos y decaimiento coseno hasta 1e-6 en el paso 1.202, batch de 48, dos epocas barajadas, precision bf16 con pesos maestros y estados del optimizador en fp32, y paralelismo tensorial de grado 4. La perdida cayo rapidamente durante el warmup y se estabilizo cerca de 1.0 al final de la primera epoca, bajando a ~0.8 al inicio de la segunda; la norma del gradiente paso de ~32 a ~1.4 tras el warmup.

## Capacidades

- Generacion de texto conversacional y asistencia general, heredadas del modelo base.
- Razonamiento y trabajo agentico de multiples pasos (el autor lo recomienda explicitamente para tareas agenticas).
- Respuestas con menor tasa de encuadre propagandistico en temas politicamente sensibles: del 22% al 0,9% segun la evaluacion del autor.
- Mayor recuperacion factual en el conjunto de evaluacion: fact score de 2,32 a 2,98 sobre 5.
- Capacidades multimodales potenciales heredadas del modelo base (codificador de vision presente pero congelado; no entrenado con datos de imagen).
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponible.
- Modo de razonamiento extendido (thinking): no disponible.

## Casos de uso

- Asistencia general conversacional: sustituto directo del modelo base en chatbots multi-turno, aprovechando la ventana de 64k tokens para mantener contexto largo en conversaciones y documentos.
- Investigacion sobre alineamiento de valores: punto de partida reproducible para estudiar como el SFT modifica el encuadre politico de un modelo, con una evaluacion publica de 803 prompts y la metodologia de juez LLM documentada.
- Analisis de contenido politico y factual: redaccion y verificacion de resumenes sobre politicas publicas, donde el autor reporta menor adopcion del encuadre estatal y mayor cobertura de hechos verificables.
- Flujos agenticos de automatizacion: tareas de multiples pasos con llamadas a herramientas, dado que el autor lo orienta a trabajo agentico y reporta ausencia de regresiones significativas en benchmarks de agente.
- Despliegue soberano o autoalojado: la licencia Apache 2.0 y los pesos en safetensors permiten ejecucion en infraestructura propia sin restricciones de uso comercial derivadas de la licencia.
- Experimentacion academica con tecnicas de post-entrenamiento: al publicarse los hiperparametros completos (optimizador, LR, batch, pasos), sirve como referencia para replicar recetas de SFT a 64k de contexto.
- Base para ajustes posteriores de dominio: al ser un fine-tune limpio sin RL, es un punto de partida razonable para SFT o DPO adicionales en dominios verticales.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor son los de su evaluacion propia de propaganda (803 prompts, juez LLM Grok 4.7 con rubrica fijada y validacion manual en un piloto de 25 prompts):

| Metrica | Qwen3.8-27B (antes) | Arete-27B (despues) |
|---|---|---|
| Fact score (sobre 5) | 2,32 | 2,98 |
| Respuestas con propaganda | 22% | 0,9% |

El autor afirma que la mejora se mantiene en las siete categorias de valores y que no hay regresiones significativas en los benchmarks de capacidad general y agentica que ejecutaron, pero no se incluyen en la informacion disponible los numeros concretos de MMLU, HumanEval, GSM8K ni de dichos benchmarks de agente. No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 55 GB solo para pesos, mas cache KV; requiere al menos 2 GPU de 40 GB o una de 80 GB para contexto moderado.
- Cuantizacion: no se publican pesos GGUF ni cuantizados; habria que generarlos a partir de los safetensors (por ejemplo, con llama.cpp). En 4 bits los pesos ocuparian del orden de 14-16 GB, lo que permitiria ejecucion en una RTX 4090 de 24 GB con contexto limitado.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para bf16 a contexto largo; 2x A100 40 GB o 2x L40S como alternativa.
- GPU de consumo: no cabe en bf16 en ninguna GPU de consumo actual; en cuantizacion de 4 bits podria caber en RTX 4090 / RTX 5090, con contexto reducido.
- Opciones de despliegue: vLLM o TGI para safetensors en bf16; llama.cpp u Ollama tras conversion a GGUF; el paralelismo tensorial de grado 4 usado en entrenamiento sugiere compatibilidad con despliegues multi-GPU.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arete-27B | 27,36B | 64k (entrenamiento) | SFT de valores sobre Qwen3.8-27B | Apache 2.0 | Pesos safetensors en Hugging Face |
| Qwen3.8-27B | ~27B | No disponible | Modelo base generalista | No disponible en la informacion | Hugging Face (Qwen) |
| Modelos de ~27B de proposito general | ~27B | Variable | Generalista | Variable | Multiples |

No se dispone de datos de benchmarks estandar ni de comparativas de rendimiento frente a alternativas en la informacion proporcionada; la unica comparacion cuantitativa publicada es la del propio modelo base en la evaluacion de propaganda del autor.

## Limitaciones y advertencias

- El entrenamiento es SFT puro sobre unos 52,8 millones de tokens: no hay RLHF ni DPO, por lo que el control de estilo, formato y rechazos depende exclusivamente de la imitacion del profesor.
- El profesor (Inkling) introduce sus propios sesgos y estilo; el modelo hereda tanto los valores objetivo como las limitaciones del profesor.
- Riesgo de alucinacion: el propio autor reporta un fact score de 2,98 sobre 5, es decir, aproximadamente un 40% de hechos requeridos no cubiertos o contradichos en su evaluacion; no es un modelo fiable como fuente factual sin verificacion.
- La evaluacion la disena y ejecuta el propio autor, con un juez LLM (Grok 4.7) validado solo sobre 25 prompts anotados a mano; existe riesgo de sesgo de evaluador y de sobreajuste al conjunto retenido, aunque se eliminaron solapamientos entre entrenamiento y evaluacion.
- El cambio de valores es intencionado y puede no ser deseable en todos los contextos: el modelo esta orientado a una cosmovision concreta, lo que puede introducir sesgos en la direccion opuesta en temas politicos.
- Idiomas soportados no documentados: no hay garantia de comportamiento equivalente fuera del ingles, idioma de los prompts de evaluacion.
- Capacidades multimodales no entrenadas: el codificador de vision esta congelado y los datos son solo texto; el rendimiento en imagen no esta validado.
- Pesos unicamente en safetensors y sin cuantizaciones oficiales: el despliegue en hardware de consumo requiere conversion y validacion propias.
- Licencia Apache 2.0 permisiva para uso comercial, pero sin garantias del autor sobre idoneidad en produccion; conviene evaluar el modelo en el dominio concreto antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/botp/Arete-27B
- Blog de Nous Research: https://nousresearch.com/arete
- Evaluacion de propaganda (dataset): https://huggingface.co/datasets/NousResearch/Propaganda_Eval
- Dataset de pares de entrenamiento (referenciado en los tags): https://huggingface.co/datasets/NousResearch/arete-data-pairs
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Ficha en There's An AI For That: https://theresanaiforthat.com/model/arete-27b/
