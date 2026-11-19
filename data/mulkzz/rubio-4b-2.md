# mulkzz/RuBio-4B

## Resumen

RuBio-4B es un modelo de lenguaje especializado en la evaluacion de respuestas descriptivas de biologia de bachillerato (curriculo surcoreano 2022, unidades I-III). Lo desarrolla el autor independiente mulkzz como un fine-tuning del modelo base Qwen/Qwen3.5-4B mediante LoRA con posterior fusion de pesos en bf16. Su proposito es concreto: dado el enunciado de una pregunta, la respuesta de un estudiante y los criterios de evaluacion, el modelo emite un unico objeto JSON con diagnostico por criterio (informacion para el profesor) y retroalimentacion para el alumno.

El modelo resuelve un problema acotado pero real en el ambito educativo: la correccion formativa y consistente de preguntas abiertas de ciencias, que suele ser costosa en tiempo para el profesorado. Frente al modelo base, el fine-tuning mejora de forma estadisticamente significativa la precision de juicio por criterio (77,2 % frente a 70,9 % en el conjunto de desarrollo out-of-distribution de RuBench v1, n = 200), con un JSON valido en el 100 % de los casos evaluados.

Con 4.659.865.088 parametros, licencia Apache 2.0 y un repositorio de 18,7 GB (pesos en bf16), es un modelo pequeno que cabe en GPU de consumo y esta pensado para despliegue en produccion con vLLM. Su alcance linguistico declarado es unicamente el coreano, y su dominio funcional esta restringido a la evaluacion de respuestas de biologia segun criterios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-4B); fine-tuning LoRA fusionado |
| Parametros totales | 4.659.865.088 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos publicados en bf16 (16 bits); otras cuantizaciones no disponibles en el repositorio |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-4B (finetune) |
| Tamano del repositorio | 18,7 GB |
| Pipeline | text-generation |
| Etiquetas | education, biology, feedback, unsloth, vllm |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer decoder-only denso de aproximadamente 4,66 mil millones de parametros. Sobre esa base se aplico un ajuste fino con LoRA y posteriormente se fusionaron los pesos adaptadores en el modelo completo, publicado en bf16. El entrenamiento se realizo con Unsloth, segun las etiquetas del repositorio, y el autor reporta despliegue verificado con vLLM (worker runpod/worker-v1-vllm v2.30.1 sobre vLLM 0.32.0, bf16).

El modelo se entrena para una tarea de evaluacion estructurada: recibe un `SYSTEM_PROMPT` fijo (el mismo usado en entrenamiento) y devuelve un JSON con el diagnostico por criterio de evaluacion (`checks`), la identificacion de errores conceptuales (misconceptions) y el estado global de la respuesta (`answer_status`). La evaluacion publicada se realizo en primer turno, con `temperature=0`, modo thinking desactivado y sin forzado de esquema JSON (los JSON malformados se contabilizan como error). No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se aplico RLHF o DPO.

## Capacidades

- Evaluacion por criterio de respuestas descriptivas de biologia de bachillerato (unidades I-III del curriculo surcoreano 2022).
- Emision de un unico objeto JSON con diagnostico para el profesor y retroalimentacion para el alumno.
- Deteccion de errores conceptuales (misconceptions) mediante identificadores, con una tasa de coincidencia de 106/133 (79,7 %) en RuBench v1 dev.
- Juicio del estado global de la respuesta (`answer_status`), con una coincidencia de 124/200 (62,0 %).
- Generacion de texto conversacional en coreano (pipeline text-generation).
- No se declara soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking en la informacion disponible.
- Capacidad multilingue: limitada al coreano segun la model card.

## Casos de uso

- Correccion formativa automatizada en el aula: el profesor introduce enunciado, respuesta del alumno y rubrica; el modelo devuelve el diagnostico por criterio y un comentario para el estudiante, reduciendo el tiempo de retroalimentacion en grupos grandes.
- Practica autonoma del alumnado: integrado en una plataforma de ejercicios, el modelo evalua la respuesta descriptiva y ofrece feedback inmediato sin esperar la correccion del docente.
- Deteccion temprana de errores conceptuales: los identificadores de misconception permiten al profesorado agregar que ideas erroneas son mas frecuentes por pregunta y ajustar la ensenanza.
- Generacion de bancos de retroalimentacion: a partir de respuestas historicas, el modelo produce comentarios estandarizados y comparables entre convocatorias.
- Despliegue en produccion con vLLM: al ser un modelo de 4,66 B en bf16 con salida JSON estructurada, puede servirse en una unica GPU para atender peticiones concurrentes de correccion.
- Piloto de evaluacion asistida en centros educativos: el autor mantiene un servicio de demostracion (mulk.codes/rubio) con RuBio-4B y RuBio-27B, lo que facilita validar la herramienta antes de integrarla.
- Investigacion en evaluacion automatica de respuestas abiertas: el modelo y su benchmark RuBench v1 sirven como linea base reproducible para comparar estrategias de fine-tuning en dominios educativos acotados.

## Benchmarks y rendimiento

Resultados publicados en RuBench v1 (dev out-of-distribution, n = 200 respuestas, 604 criterios de evaluacion). Precision de juicio por criterio con intervalo de confianza del 95 % agrupado por respuesta:

| Metrica | RuBio-4B v2 | Qwen3.5-4B (base) |
|---|---|---|
| Precision de juicio por criterio | 77,2 % [73,4; 80,9] | 70,9 % [67,3; 74,5] |
| Precision excluyendo desempate 2/3 mayoritario | 79,9 % [76,0; 83,8] | 74,5 % [71,0; 78,1] |
| Precision micro por criterio | 467/604 = 77,3 % | 427/604 = 70,7 % |
| Coincidencia de misconception id | 106/133 = 79,7 % | 78/133 = 58,6 % |
| Reproduccion de errores fuera de criterio (TP) | 10/53 = 18,9 % | 4/53 = 7,5 % |
| Especificidad sin errores (TN) | 143/147 = 97,3 % | 146/147 = 99,3 % |
| Coincidencia de answer_status | 124/200 = 62,0 % | 89/200 = 44,5 % |
| JSON valido | 200/200 = 100 % | 200/200 = 100 % |

Diferencia pareada RuBio-4B v2 frente al base: +6,3 puntos porcentuales [+2,6; +9,9] en precision global y +5,3 pp [+1,2; +9,5] excluyendo el desempate 2/3.

Comparacion con otros modelos del mismo benchmark (precision por criterio):

| Modelo | Precision [IC 95 %] | Precision micro |
|---|---|---|
| Claude Opus 5.5 (xhigh) | 94,2 % [92,0; 96,4] | 570/604 |
| GPT-6 Astra (xhigh) | 91,2 % [88,6; 93,7] | 550/604 |
| Gemini 4 Argon (High) | 91,2 % [88,5; 94,0] | 551/604 |
| RuBio-27B | 86,9 % [83,8; 89,9] | 524/604 |
| Qwen3.8-27B (base) | 81,8 % [78,2; 85,4] | 495/604 |
| RuBio-4B v2 | 77,2 % [73,4; 80,9] | 467/604 |
| Qwen3.5-4B (base) | 70,9 % [67,3; 74,5] | 427/604 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para pesos (4,66 B x 2 bytes), mas overhead de KV cache y activaciones; en la practica, entre 10 y 14 GB segun longitud de contexto y lote.
- Cabe en GPU de consumo: RTX 4090 (24 GB) con margen amplio; RTX 3090 (24 GB) igualmente; en GPUs de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) es viable en bf16 con contexto moderado o recurriendo a cuantizacion de 8 bits.
- GPU profesionales: A100 (40/80 GB), H100 y L40S sin problema; el modelo es pequeno para estas tarjetas y permite alto paralelismo de peticiones.
- Despliegue: vLLM verificado por el autor (vLLM 0.32.0 en runpod/worker-v1-vllm v2.30.1, bf16). El repositorio incluye la etiqueta vllm; llama.cpp, Ollama o TGI no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision RuBench v1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RuBio-4B v2 | 4,66 B | No disponible | 77,2 % | Apache 2.0 | Hugging Face |
| RuBio-8B | No disponible | No disponible | No disponible | No disponible | Hugging Face (mulkzz/RuBio-8B) |
| RuBio-9B | No disponible | No disponible | No disponible | No disponible | Hugging Face (mulkzz/RuBio-9B) |
| RuBio-27B | No disponible | No disponible | 86,9 % | No disponible | Hugging Face (mulkzz/RuBio-27B) |
| Qwen3.5-4B (base) | 4,66 B | No disponible | 70,9 % | No disponible | Hugging Face |

La familia RuBio del mismo autor permite escalar en tamano (4B, 8B, 9B, 27B) manteniendo la misma tarea; la comparacion directa con modelos de proposito general (GPT-6 Astra, Claude Opus 5.5, Gemini 4 Argon) muestra que estos superan al 4B en precision de juicio, aunque a costa de no ser desplegables localmente ni de tener la salida JSON especifica del dominio.

## Limitaciones y advertencias

- Dominio muy restringido: solo evalua respuestas descriptivas de biologia de bachillerato (unidades I-III del curriculo surcoreano 2022); fuera de ese ambito su comportamiento no esta caracterizado.
- Idioma unico: la model card declara exclusivamente coreano; no hay evidencia de rendimiento en castellano ni en otros idiomas.
- Baja sensibilidad a errores fuera de criterio: la reproducibilidad de errores cientificos no cubiertos por la rubrica es solo del 18,9 % (10/53), por lo que puede dejar pasar incorrecciones no previstas en los criterios.
- Coincidencia moderada del estado global de la respuesta: 62,0 % (124/200), lo que limita su uso como unico arbitro de la calificacion final.
- Riesgo de alucinacion en la generacion de retroalimentacion: al ser un modelo generativo, el feedback al alumno debe revisarse o filtrarse antes de su entrega en contextos de alta exigencia.
- Sesgos: no se documentan analisis de sesgo en la informacion disponible.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento fuera del dominio evaluado; conviene validar con datos propios antes de produccion.
- Dependencia del `SYSTEM_PROMPT` de entrenamiento: el rendimiento reportado se obtiene con ese prompt fijo y `temperature=0`; variaciones del prompt o de la temperatura pueden degradar la calidad del JSON y del juicio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mulkzz/RuBio-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo superior (27B): https://huggingface.co/mulkzz/RuBio-27B
- Modelo relacionado (8B): https://huggingface.co/mulkzz/RuBio-8B
- Modelo relacionado (9B): https://huggingface.co/mulkzz/RuBio-9B
- Servicio de demostracion: https://mulk.codes/rubio
- README en ingles: https://huggingface.co/mulkzz/RuBio-4B/blob/main/README_en.md
- Paper de referencia citado en las etiquetas (arXiv:2411.00640): https://arxiv.org/abs/2411.00640
