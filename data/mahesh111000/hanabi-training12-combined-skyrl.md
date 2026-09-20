# Mahesh111000/hanabi-training12-combined-skyrl

## Resumen

`hanabi-training12-combined-skyrl` es el checkpoint final de una ejecucion de aprendizaje por refuerzo (RL) sobre el modelo `Mahesh111000/Qwen_merged`, que desciende del linaje Qwen3-4B-Instruct-2507. Lo publica el usuario Mahesh111000 y su proposito es especializar un transformer denso de 4.411.424.256 parametros en el juego de cartas cooperativo Hanabi: seguimiento de estado, valoracion de jugadas y formato de salida estricto. El checkpoint resulta de fusionar en fp32 un adaptador LoRA de rango 32 (alpha 32) sobre las proyecciones q/k/v/o/gate/up/down y sobre `lm_head`.

No es un lanzamiento generalista: es un artefacto de investigacion que documenta una ejecucion de RL con recompensas verificables (state tracking y move rating, ambas con peso 1.0) sobre 2.362 prompts de Hanabi, 2 epocas y 148 pasos de optimizador, con 32 grupos x 16 rollouts por paso (75.584 completaciones). Su valor inmediato es metodologico —expone el pipeline completo con SkyRL, el backend Tinker y FSDP sobre 2 x 8 A100-80GB— y la publicacion de los adaptadores por paso.

En la practica hereda las capacidades de generacion de texto y conversacion de la familia Qwen3, pero la model card no documenta benchmarks estandar, idiomas soportados ni licencia, el repositorio no ofrece cuantizaciones y acumula 0 descargas y 0 likes, por lo que no existe validacion externa de su comportamiento fuera del dominio de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only, linaje Qwen3; `lm_head` desacoplado de `embed_tokens` (`tie_word_embeddings: false`) |
| Parametros totales | 4.411.424.256 (4,41 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card ni en la informacion proporcionada (corresponde al linaje Qwen3-4B-Instruct-2507, sin confirmar para este checkpoint) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos fp32. El autor recomienda servir en `bfloat16` (`--dtype bfloat16`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repositorio no declara licencia) |
| Formato de pesos | safetensors fp32, 4 shards, 17,6 GB |
| Modelo base | `Mahesh111000/Qwen_merged` (revision `cf390c83fb3214ee0d21f7fa0fd62d440942d666`) |
| Tipo de ajuste | RL con LoRA rango 32 fusionado (q/k/v/o/gate/up/down + `lm_head`) |
| Libreria declarada | transformers |
| Tamano del repositorio | 17,7 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La base es un transformer denso del linaje Qwen3-4B-Instruct-2507. La particularidad estructural de este checkpoint es que el `lm_head` deja de estar atado a `embed_tokens`: la base lo tiene atado y el adaptador solo entrena `lm_head`, de modo que `lm_head.weight = embed_tokens.weight + B@A` mientras `embed_tokens` permanece intacto. Esto implica que el recuento total de parametros (4,41 B) supera el de la base atada, porque la matriz de salida se materializa como tensor independiente. El autor advierte explicitamente de que **no debe usarse `merge_and_unload()` de PEFT** sobre el adaptador: escribe el delta de `lm_head` en el embedding atado y altera el modelo (error de logits medido de 0,4 a 0,8). La fusion se hizo en fp32 porque la base esta en fp16 y el maximo `||dW||/||W||` es 1,4e-3, de forma que una fusion en media precision redondearia a cero la mayor parte de la actualizacion.

El entrenamiento fue un ciclo de RL con recompensas verificables sobre 2.362 prompts de Hanabi, 2 epocas y 148 pasos de optimizador, generando 32 grupos x 16 rollouts por paso (75.584 completaciones). Se uso Adam con lr 2e-5 y betas (0,9, 0.95), sin penalizacion KL, perdida por importance sampling, temperatura 1.0 y un maximo de 16.384 tokens nuevos por generacion. El esquema de grupos con multiples rollouts por prompt y perdida por importance sampling es caracteristico de las variantes tipo GRPO, aunque la model card no nombra el algoritmo de forma explicita. La infraestructura fue SkyRL con backend Tinker autoalojado (Tinker SDK 0.24.1) y FSDP sobre 2 x 8 A100-80GB. La recompensa combina state tracking y move rating, ambas con peso 1.0. El autor aporta scripts de verificacion (`training_run/verify_merge.py`, `verify_merge2.py`) que, sobre tres ejemplos de entrenamiento de 768 tokens, dan una diferencia media absoluta de logits de 1e-5 (maximo 1,3e-2 sobre logits de magnitud 55-59), KL por posicion <= 4e-7, argmax identico en todas las posiciones y log-verosimilitud identica hasta 6 decimales; el adaptador por si solo desplaza los logits hasta 19.

## Capacidades

- Generacion de texto autoregresiva y conversacion multiturno heredadas del linaje Qwen3-4B-Instruct-2507.
- Seguimiento de estado (state tracking) en un juego cooperativo de informacion imperfecta, con recompensa especifica de entrenamiento para esta tarea.
- Valoracion de jugadas (move rating): el modelo puntua o selecciona movimientos dentro de las reglas de Hanabi.
- Salida con formato estricto: la recompensa de formato alcanza 1,00 al final del entrenamiento, lo que indica adherencia alta a la plantilla esperada.
- Razonamiento multi-paso dentro de un episodio de juego, con hasta 16.384 tokens nuevos generados por respuesta en entrenamiento.
- Integracion con el ecosistema transformers y con text-generation-inference (etiquetas `text-generation-inference` y `endpoints_compatible` en el repositorio).
- No hay evidencia en la informacion disponible de soporte de tool calling, function calling, vision, audio ni modo de razonamiento explicito (thinking mode).
- Capacidades multilingues: no disponibles (la model card no declara idiomas).

## Casos de uso

- Investigacion en RL con recompensas verificables: el checkpoint y su repositorio hermano de adaptadores por paso permiten reproducir y auditar una ejecucion completa (configuracion, manifiesto, metricas e indice de checkpoints en `training_run/`) sobre un dominio acotado como Hanabi.
- Estudio de coordinacion multiagente: Hanabi exige inferir intenciones de un companero con informacion imperfecta, por lo que el modelo sirve como politica entrenada para experimentos de teoria de la mente y comunicacion implicita entre agentes.
- Extraccion de seguimiento de estado como tarea auxiliar: se puede usar para evaluar si un modelo pequeno mantiene un registro consistente de la informacion revelada a lo largo de un episodio, comparando contra la recompensa de state tracking del entrenamiento.
- Generacion de trayectorias sinteticas de Hanabi: al producir completaciones largas (hasta 16.384 tokens nuevos en entrenamiento) con formato estricto, puede emplearse para poblar datasets de imitacion o de evaluacion de otras politicas.
- Anclaje de comparaciones de RL: al disponer de adaptadores por paso (1-148), es util como linea base para medir cuanto aporta cada fase del entrenamiento en tareas de razonamiento estructurado.
- Prototipado de asistentes conversacionales de dominio restringido: la combinacion de formato fiable y generacion de texto general permite usarlo en demos internas donde el dominio sea acotado y no se requiera cobertura multilingue.
- Verificacion de pipelines de fusion de adaptadores: el par base + LoRA + scripts de verificacion constituye un caso de prueba real para validar estrategias de merge en fp32 con embeddings desacoplados, un escenario propenso a errores silenciosos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card unicamente reporta las recompensas de entrenamiento, medidas como media de los 10 primeros pasos frente a la media de los 10 ultimos:

| Metrica de recompensa | Primeros 10 pasos | Ultimos 10 pasos |
|---|---|---|
| Total | 0,62 | 1,25 |
| Deduction score | 0,19 | 0,66 |
| Exact deduction | 0,01 | 0,22 |
| Move reward | 0,43 | 0,60 |
| Format | 0,99 | 1,00 |

Estos valores corresponden a la propia funcion de recompensa del entrenamiento sobre los prompts de Hanabi utilizados, no a una evaluacion en held-out ni a un benchmark comparable con otros modelos.

## Requisitos de hardware

- Pesos en fp32: 17,6 GB solo para los parametros, sin runtime ni cache KV; requiere GPUs de 40-80 GB para servirlo en fp32.
- Pesos en bfloat16 (recomendacion del autor): aproximadamente 8,8 GB, lo que permite inferencia en GPUs de 24 GB (RTX 3090, RTX 4090, L4, A10G) con contexto moderado y margen para cache KV.
- GPUs de 16 GB: viables solo con cuantizacion de 8 o 4 bits, que no esta publicada; habria que generarla y tener en cuenta el `lm_head` desacoplado durante la conversion.
- Entrenamiento original: 16 A100-80GB (2 nodos x 8), FSDP, backend Tinker de SkyRL. No es reproducible en hardware de consumo.
- Opciones de despliegue: transformers (con `--dtype bfloat16`), text-generation-inference (el repositorio incluye la etiqueta correspondiente y `endpoints_compatible`), vLLM y SGLang. Para llama.cpp u Ollama hace falta una conversion a GGUF no publicada.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Advertencia de despliegue: si se parte del adaptador LoRA en lugar del checkpoint fusionado, no aplicar `merge_and_unload()` de PEFT por el problema del `lm_head` atado; el error de logits medido por el autor en ese caso es de 0,4 a 0,8.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| hanabi-training12-combined-skyrl | 4,41 B | no disponible | no disponible | safetensors fp32, 4 shards |
| Mahesh111000/Qwen_merged (base declarada) | no disponible | no disponible | no disponible | safetensors |
| Qwen3-4B-Instruct-2507 (linaje declarado) | 4 B (segun denominacion del linaje) | no disponible en esta ficha | no disponible en esta ficha | ficha oficial upstream |
| hanabi-training12-combined-skyrl-loras (adaptadores por paso 1-148) | adaptadores rango 32 | no aplica | no disponible | safetensors (PEFT) |
| Alternativas de ~4 B (por ejemplo Qwen3-4B-Thinking-2507 o Llama-3.2-3B-Instruct) | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos de rendimiento en la informacion proporcionada. Cualquier comparacion con modelos generalistas de ~4 B debe apoyarse en las fichas oficiales de esos modelos, ya que este checkpoint esta especializado en Hanabi y no publica evaluaciones en tareas abiertas.

## Limitaciones y advertencias

- Licencia sin declarar: el repositorio no especifica licencia, por lo que el uso comercial queda sin base legal clara hasta verificar la licencia del modelo base `Mahesh111000/Qwen_merged` y del linaje Qwen3 subyacente.
- Sin benchmarks publicos: solo existen recompensas de entrenamiento, no evaluaciones held-out ni comparaciones con modelos de referencia.
- Sin validacion externa: 0 descargas y 0 likes, sin evidencia de terceros que hayan reproducido los resultados.
- Especializacion estrecha: el ajuste esta limitado a Hanabi (2.362 prompts, 2 epocas, 148 pasos); es esperable cierta degradacion en capacidades generales respecto a la base, aunque no se cuantifica en la informacion disponible.
- Sin penalizacion KL y con temperatura 1.0: el esquema de optimizacion favorece el desplazamiento de la politica, lo que aumenta el riesgo de deriva respecto al modelo base fuera del dominio de entrenamiento.
- Riesgo de alucinacion en el seguimiento de estado: la recompensa de deduccion exacta solo sube de 0,01 a 0,22 al final del entrenamiento, lo que indica que la deduccion precisa sigue siendo poco fiable.
- Trampa tecnica del `lm_head`: usar `merge_and_unload()` de PEFT o servir los adaptadores sin respetar el desacople rompe el modelo (error de logits de 0,4 a 0,8 medido por el autor).
- Sin cuantizaciones publicadas: no hay GGUF ni variantes de 8 o 4 bits, lo que limita el despliegue en GPUs de gama media-baja y en CPU.
- Cobertura de idiomas no declarada: no se puede asumir soporte multilingue, aunque el linaje Qwen3 lo tenga.
- Metadatos con fechas de 2026 (creacion 2026-09-19, ejecucion `training12-combined-20260918T075329414627Z`), que conviene tener en cuenta al integrar el modelo en catalogos o pipelines con validacion temporal.
- Repositorio pesado: 17,7 GB en fp32 para un modelo de 4,41 B, lo que encarece el almacenamiento y la transferencia frente a una publicacion en bf16.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mahesh111000/hanabi-training12-combined-skyrl
- Adaptadores por paso (1-148): https://huggingface.co/Mahesh111000/hanabi-training12-combined-skyrl-loras
- Modelo base declarado: https://huggingface.co/Mahesh111000/Qwen_merged
- Directorio de la ejecucion de entrenamiento (configuracion, manifiesto, metricas e indice): https://huggingface.co/Mahesh111000/hanabi-training12-combined-skyrl/tree/main/training_run
- Proyecto de seguimiento citado en la model card: `hanabi_training12_combined_skyrl` (nombre de proyecto W&B; no se proporciona URL)
- Resultados de busqueda web: todas las consultas devolvieron contenido no relacionado (reproductor VLC, componentes VCL de Delphi y VOCALOID), sin informacion util sobre este modelo.
