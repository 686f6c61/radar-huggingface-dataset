# andreayhchen/sherlock-qwen2.5-3b-rlvr-v1

## Resumen

Sherlock Qwen2.5-3B RLVR v1 es un adaptador LoRA de rango 16 publicado por el usuario andreayhchen sobre el modelo Qwen/Qwen2.5-3B-Instruct. No se trata de un modelo completo, sino de un adaptador PEFT que debe aplicarse sobre la version fusionada del modelo SFT previo del mismo autor (andreayhchen/sherlock-qwen2.5-3b-sft-v1) combinado con Qwen2.5-3B-Instruct. Su objetivo es doble: mejorar la precision en razonamiento matematico y mantener una persona narrativa consistente inspirada en Sherlock Holmes.

El entrenamiento emplea GRPO con una recompensa de tipo RLVR (Reinforcement Learning with Verifiable Rewards) puramente verificable: la unica senal de recompensa es binaria (1 o 0) y proviene de la libreria `math_verify`, sin juez LLM ni llamadas a API externas. La innovacion principal del experimento es metodologica: demuestra que optimizar solo la correccion de la respuesta arrastra hacia arriba la puntuacion de persona sin necesidad de optimizarla de forma explicita, lo que convierte la recompensa de persona en redundante para este caso.

El modelo es relevante en el contexto de la investigacion sobre RL con recompensas verificables aplicado a modelos pequenos (3B) y sobre la interaccion entre objetivos de estilo y objetivos de correccion. El repositorio ocupa 0,1 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (hereda la de Qwen2.5-3B-Instruct); adaptador LoRA de rango 16 sobre las capas del modelo base |
| Parametros totales | No disponible para el adaptador (el modelo base Qwen2.5-3B-Instruct tiene 3.090 millones de parametros) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No especificada en la model card del adaptador. El modelo base Qwen2.5-3B-Instruct soporta 32.768 tokens de forma nativa |
| Tipos de cuantizacion | No disponible en la model card. El adaptador se distribuye en safetensors y puede fusionarse con el modelo base y cuantizarse despues a GGUF, AWQ o GPTQ con herramientas estandar |
| Idiomas soportados | No disponible para el adaptador. El modelo base Qwen2.5-3B-Instruct declara soporte para 29 idiomas |
| Licencia | No disponible en la model card del adaptador. El modelo base Qwen2.5-3B-Instruct se distribuye bajo licencia Apache 2.0 |
| Formato de pesos | Adaptador PEFT en safetensors (`adapter_model.safetensors`), libreria `peft` |
| Tamano del repositorio | 0,1 GB |
| Tecnica de entrenamiento | LoRA (r=16) + GRPO con RLVR (recompensa verificable binaria) |
| Modelo base | Qwen/Qwen2.5-3B-Instruct |
| Modelo de partida | Fusion de andreayhchen/sherlock-qwen2.5-3b-sft-v1 sobre Qwen/Qwen2.5-3B-Instruct |

## Arquitectura y entrenamiento

El adaptador se aplica sobre una arquitectura transformer densa, la de Qwen2.5-3B-Instruct, mediante LoRA con rango 16. Es importante respetar la cadena de reproduccion indicada por el autor: el adaptador no se entrena sobre el modelo base original, sino sobre la fusion del modelo SFT `andreayhchen/sherlock-qwen2.5-3b-sft-v1` dentro de Qwen2.5-3B-Instruct. Solo despues de esa fusion tiene sentido cargar este adaptador. No se documentan en la model card ni la composicion del dataset de SFT previo ni el numero de tokens utilizados en el mismo.

El entrenamiento de refuerzo utiliza GRPO con una recompensa de tipo RLVR. Existe una puerta de formato previa: la respuesta debe incluir una linea de respuesta final, exactamente una expresion `\boxed{}`, respetar una banda de longitud y no contener markdown. Superada esa puerta, la recompensa es 1 si `math_verify` confirma que la respuesta encerrada en `\boxed{}` es correcta y 0 en caso contrario. No interviene ningun juez LLM, por lo que el coste de entrenamiento en llamadas a API es nulo. El presupuesto de entrenamiento fue de 100 pasos con 8 prompts y 8 rollouts por prompt (6.400 rollouts en total).

El hallazgo central del experimento es que la recompensa de persona resulta redundante: este modelo nunca envio un rollout a un juez de persona y, aun asi, alcanza una puntuacion de persona equivalente a la de una ejecucion que gasto unas 2.900 llamadas a juez optimizando explicitamente ese objetivo. Los rollouts correctos obtienen 5,63 en el juez de persona frente a 4,11 de los incorrectos, de modo que optimizar la correccion eleva la persona por si solo.

## Capacidades

- Razonamiento matematico con formato verificable: produce soluciones que terminan en una unica expresion `\boxed{}`, disenada para ser validada automaticamente con `math_verify`.
- Generacion de texto e instrucciones generales, heredadas del modelo base Qwen2.5-3B-Instruct.
- Mantenimiento de una persona narrativa consistente (Sherlock Holmes) con una puntuacion media de 5,67 sobre 7 segun el juez utilizado por el autor.
- Resolucion de problemas de nivel 1 a 3 del dataset MATH, con un 61,5 % de precision en la evaluacion codiciosa sobre 200 problemas retenidos.
- Capacidad multilingue: no verificada especificamente para el adaptador; se hereda la del modelo base (29 idiomas declarados).
- Soporte de tool calling / function calling: no documentado para el adaptador; el modelo base Qwen2.5-3B-Instruct lo soporta.
- Soporte de agentes y razonamiento multi-paso: no documentado ni evaluado en la model card.
- Capacidades especiales: modo de pensamiento (thinking), vision o audio no disponibles; el modelo no es multimodal.

## Casos de uso

- Reproduccion de experimentos de RLVR: el adaptador sirve como punto de partida verificado para reproducir el pipeline de GRPO con recompensa `math_verify` en un modelo de 3B y comparar variantes de recompensa sin coste de API.
- Generacion de datos sinteticos verificables: al forzar el formato `\boxed{}` y validarse con `math_verify`, sus salidas correctas pueden reutilizarse como pares problema-solucion etiquetados para entrenar otros modelos.
- Evaluacion de la interaccion entre correccion y persona: es un caso de estudio util para investigar si las recompensas de estilo son necesarias cuando ya se optimiza una metrica objetiva de correccion.
- Tutor de matematicas con caracter narrativo: un asistente educativo que explique problemas de nivel escolar o de primeros cursos universitarios manteniendo una persona detectivesca, con la ventaja de que las respuestas son verificables automaticamente antes de mostrarse.
- Prototipado en una sola GPU de consumo: al ser un adaptador sobre un modelo de 3B, permite iterar sobre tecnicas de RL y de formateo de salida sin acceso a clusters grandes.
- Componente de un pipeline de evaluacion automatica de matematicas: integrado como generador de candidatos cuya respuesta se valida con `math_verify`, descartando las incorrectas antes de llegar al usuario.
- Investigacion academica sobre recompensas verificables: el repositorio de codigo acompanante incluye el analisis completo, lo que facilita la extension del metodo a otros dominios con verificador objetivo.

## Benchmarks y rendimiento

Evaluacion sobre 200 problemas retenidos de MATH de niveles 1 a 3, decodificacion codiciosa. La persona fue juzgada por Claude Sonnet 5 con el modo de pensamiento desactivado.

| Modelo | Precision | Persona (sobre 7) | Apariciones de "Watson" |
|---|---|---|---|
| Base Qwen2.5-3B-Instruct | 80,0 % | 1,57 | 0 % |
| SFT v1 (punto de partida de este modelo) | 59,0 % | 5,27 | 12 % |
| Este modelo (RLVR, paso 100) | 61,5 % | 5,67 | 12 % |
| Multi-objetivo (juez por niveles + verificador) | 57,5 % | 5,66 | 12 % |

Comparacion emparejada frente a SFT v1 con intervalo de confianza del 95 % por bootstrap: precision +2,5 puntos (-3,0 a +8,5) y persona +0,39 (+0,15 a +0,65). Frente al modelo multi-objetivo, la diferencia de persona es de +0,01 (-0,23 a +0,26). El autor interpreta estos resultados como evidencia de que la recompensa de persona es redundante en este contexto.

## Requisitos de hardware

- El adaptador en si ocupa 0,1 GB; el coste real de inferencia corresponde al modelo base de 3.090 millones de parametros una vez fusionado.
- VRAM estimada para inferencia (estimaciones, no datos publicados por el autor): en precision bfloat16, unos 6-7 GB solo para pesos; en INT8, unos 3-4 GB; en INT4 (por ejemplo Q4_K_M), unos 2-3 GB. Hay que sumar el cache KV, que crece con la longitud de contexto.
- GPU recomendadas: cabe holgadamente en GPU de consumo con 8 GB o mas de VRAM, como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070. En RTX 4090 24 GB o A100 40/80 GB se puede servir con contexto largo y mayor tamano de lote.
- Cabe en GPU de consumo: si, tanto en cuantizacion INT4 como en bfloat16 con contexto moderado.
- Opciones de despliegue: `transformers` + `peft` para cargar el adaptador directamente; vLLM con soporte de adaptadores LoRA; TGI con adaptadores LoRA; tras fusionar el adaptador y convertirlo, llama.cpp u Ollama con pesos GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision (MATH niveles 1-3) | Persona | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (Sherlock RLVR v1) | 3,09B (base) + LoRA r=16 | No especificado en la model card; 32.768 tokens en el base | 61,5 % | 5,67 | No disponible en el adaptador; Apache 2.0 en el base | Publicado en HuggingFace, 0 descargas |
| Qwen2.5-3B-Instruct (base) | 3,09B | 32.768 tokens | 80,0 % | 1,57 | Apache 2.0 | Ampliamente disponible |
| Sherlock SFT v1 | 3,09B (base) + LoRA | No especificado | 59,0 % | 5,27 | No disponible | Publicado por el mismo autor |
| Variante multi-objetivo (juez por niveles + verificador) | 3,09B (base) + LoRA | No especificado | 57,5 % | 5,66 | No disponible | Mencionada en la model card, no enlazada |

No se dispone de datos de benchmarks en la informacion proporcionada para otros modelos de 3B de la competencia (por ejemplo, Llama 3.2 3B Instruct o Phi-3.5-mini), por lo que no se incluyen comparaciones de rendimiento con ellos.

## Limitaciones y advertencias

- El modelo pierde 18,5 puntos de precision en MATH niveles 1-3 respecto al Qwen2.5-3B-Instruct original (61,5 % frente a 80,0 %). El proceso de SFT y RL mejora la persona pero degrada la capacidad matematica respecto al base.
- El intervalo de confianza del 95 % de la mejora en precision frente a SFT v1 cruza el cero (-3,0 a +8,5), por lo que la mejora en matemáticas no es estadisticamente concluyente con 200 problemas evaluados.
- Sesgos conocidos: no documentados por el autor. La persona esta fuertemente condicionada al personaje de Sherlock Holmes y puede resultar inadecuada en contextos profesionales o formales.
- Riesgo de alucinacion: presente, como en cualquier modelo de 3B. El formato `\boxed{}` reduce el riesgo de respuestas ambiguas, pero no garantiza que el razonamiento intermedio sea correcto; se recomienda validar siempre con `math_verify` u otro verificador.
- La puerta de formato prohibe el markdown y exige exactamente una expresion `\boxed{}`, lo que restringe la salida a ese estilo y puede degradar tareas ajenas al razonamiento matematico verifiable.
- Limitaciones de contexto e idioma: no se han publicado evaluaciones especificas del adaptador en contexto largo ni en idiomas distintos del usado en el entrenamiento.
- Restricciones de licencia: la licencia del adaptador no esta declarada en la model card. Dado que se deriva de Qwen2.5-3B-Instruct (Apache 2.0), conviene confirmar con el autor las condiciones de uso comercial antes de desplegarlo en produccion.
- El modelo depende de una cadena de reproduccion concreta (fusion de SFT v1 sobre el base y posterior aplicacion del adaptador LoRA); cargarlo directamente sobre Qwen2.5-3B-Instruct no reproduce el comportamiento documentado.
- Ausencia de validacion externa: 0 descargas y 0 likes, y evaluacion realizada unicamente por el autor.
- El juez de persona empleado en la evaluacion es Claude Sonnet 5, un modelo de otro proveedor; los valores de persona no son comparables con los de otras evaluaciones que usen jueces distintos.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/andreayhchen/sherlock-qwen2.5-3b-rlvr-v1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Modelo SFT de partida: https://huggingface.co/andreayhchen/sherlock-qwen2.5-3b-sft-v1
- Codigo y analisis completo: https://github.com/harvard-cs2881f26/hw1-angafor-chen
- Resultados de busqueda web: no se han encontrado enlaces relevantes sobre este modelo; los resultados devueltos corresponden a sitios de descarga de tipografias y no guardan relacion con el modelo.
