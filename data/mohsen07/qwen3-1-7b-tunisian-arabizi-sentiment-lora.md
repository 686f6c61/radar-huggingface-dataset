# Mohsen07/Qwen3-1.7B-Tunisian-Arabizi-Sentiment-LoRA

## Resumen

El modelo `Mohsen07/Qwen3-1.7B-Tunisian-Arabizi-Sentiment-LoRA` es un adaptador LoRA (concretamente rsLoRA) desarrollado por el usuario Mohsen07 sobre el modelo base `Qwen/Qwen3-1.7B`. Su proposito es la clasificacion binaria de sentimiento (positivo/negativo) en comentarios de redes sociales escritos en arabizi tunecino, una variante del dialecto tunecino transcrita en caracteres latinos con digitos numericos (3, 7, 9, 5, 8) y frecuentemente mezclada con frances.

El adaptador se ha entrenado mediante Supervised Fine-Tuning con `TRL SFTTrainer` y perdida solo sobre la completion, sobre el dataset TUNIZI limpio. El repositorio ocupa 0,2 GB y contiene unicamente los pesos del adaptador en formato safetensors, no los pesos completos del modelo base.

La relevancia de esta ficha radica en que aborda un caso de uso muy especifico (analisis de sentimiento en un dialecto de bajos recursos) y publica una evaluacion comparativa frente a lineas base clasicas (TF-IDF + regresion logistica) y frente al propio Qwen3-1.7B en modo zero-shot, lo que permite valorar el aporte real del fine-tuning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rsLoRA) sobre transformer decoder-only Qwen3-1.7B |
| Parametros totales | 1.755.440.128 (modelo base) + 34.865.152 entrenables en el adaptador |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen/Qwen3-1.7B; no especificada en la model card) |
| Tipos de cuantizacion | no disponible (la model card solo menciona carga en `float16`); el adaptador se distribuye como safetensors sin cuantizar |
| Idiomas soportados | ar, fr, en (declarados); el dominio real de entrenamiento es arabizi tunecino con mezcla de frances |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base `Qwen/Qwen3-1.7B` |

## Arquitectura y entrenamiento

El modelo es un adaptador de bajo rango sobre Qwen3-1.7B, un transformer decoder-only. El adaptador usa la variante rsLoRA (rank-stabilized LoRA) con `r=32` y `lora_alpha=64`, lo que implica un factor de escala de 2. El entrenamiento se realizo con `TRL SFTTrainer` aplicando perdida solo sobre la completion (completion-only loss), de modo que el modelo aprende a emitir la etiqueta de sentimiento tras el prompt de instruccion. Se entrenaron 34.865.152 parametros de un total de 1.755.440.128 (1,99 %), en una unica GPU T4 con un pico de 3,34 GB de VRAM.

El dataset de entrenamiento es la version limpia de TUNIZI (comentarios de redes sociales en arabizi tunecino). La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del corpus ni si se aplicaron etapas de RLHF o DPO; solo se indica SFT. El preprocesado del prompt incluye una normalizacion de texto que colapsa repeticiones de caracteres (`(.)\1{2,}` a `\1\1`) y compacta espacios en blanco. La innovacion tecnica destacable no esta en la arquitectura sino en la evaluacion: comparacion contra lineas base triviales (longitud del comentario), zero-shot del modelo base, TF-IDF + regresion logistica y un hibrido LoRA + TF-IDF, con intervalos de confianza de Wilson al 95 %.

## Capacidades

- Clasificacion binaria de sentimiento (positivo/negativo) de comentarios en arabizi tunecino.
- Manejo de texto con digitos arabizi (3, 7, 9, 5, 8) y mezcla de lexico frances.
- Clasificacion de comentarios muy cortos (hasta 2 palabras) con precision reportada del 85,1 %.
- Clasificacion de comentarios largos (15 palabras o mas) con precision reportada del 82,1 %.
- Generacion de texto autoregresiva heredada del modelo base Qwen3-1.7B, aunque el adaptador esta especializado en la tarea de sentimiento.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking especifico para este adaptador.
- Capacidades multilingues limitadas al ambito declarado (ar, fr, en) y al dominio tunecino.

## Casos de uso

- Moderacion de comunidades tunecinas en redes sociales: el adaptador permite etiquetar automaticamente comentarios positivos y negativos en arabizi, un idioma que los clasificadores genericos suelen fallar al no cubrir la transliteracion latina con digitos.
- Analisis de opinion de marca en redes: monitorizar menciones de productos en Facebook, Instagram o TikTok tunecinos y agregar el sentimiento por campana, aprovechando que el modelo rinde bien tanto en comentarios cortos (85,1 %) como largos (82,1 %).
- Enrutado de tickets de soporte: clasificar mensajes de usuarios en tunecino para derivar quejas (negativo) a atencion prioritaria y felicitaciones o consultas neutras a colas estandar.
- Investigacion en PLN de dialectos de bajos recursos: servir como punto de comparacion reproducible frente a TF-IDF y zero-shot en estudios academicos sobre arabizi, dado que la model card publica resultados con intervalos de confianza.
- Filtrado previo en pipelines de mineria de datos: descartar o priorizar comentarios negativos antes de un analisis mas costoso con modelos mayores, usando el adaptador como clasificador ligero.
- Deteccion de crisis reputacionales: procesar en streaming comentarios tunecinos y disparar alertas cuando la proporcion de negativos supera un umbral, con un coste de inferencia bajo (adaptador de 0,2 GB sobre un modelo de 1,7B).
- Prototipado rapido con demo web: el Space interactivo publicado por el autor permite validar el comportamiento del modelo antes de integrarlo en produccion.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre el conjunto de test limpio con split estratificado (n = 589):

| Modelo | Accuracy | IC 95 % (Wilson) | Macro F1 | ROC-AUC |
|---|---|---|---|---|
| Baseline solo longitud | 63,50 % | [59,5 %, 67,3 %] | 0,6294 | no disponible |
| Qwen3-1.7B zero-shot | 56,20 % | [52,2 %, 60,2 %] | 0,4549 | no disponible |
| Char + Word TF-IDF + LogReg | 77,93 % | [74,4 %, 81,1 %] | 0,7791 | 0,8563 |
| Qwen3-1.7B + SFT + LoRA (este modelo) | 78,61 % | [75,1 %, 81,7 %] | 0,7858 | 0,8751 |
| Hibrido (LoRA + TF-IDF) | 79,46 % | [76,0 %, 82,5 %] | 0,7945 | 0,8826 |

Desglose por longitud de comentario:

| Slice | Este modelo | TF-IDF | Zero-shot |
|---|---|---|---|
| Comentarios cortos (<= 2 palabras) | 85,1 % | 78,2 % | 43,6 % |
| Comentarios largos (>= 15 palabras) | 82,1 % | no disponible | no disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM de entrenamiento documentada: 3,34 GB en una unica GPU T4 con el adaptador LoRA (r=32, alpha=64).
- VRAM de inferencia estimada: el modelo base Qwen3-1.7B en `float16` requiere aproximadamente 3,5 GB solo para pesos, mas overhead de activaciones y KV cache; el adaptador anade unos 0,2 GB. En la practica, se recomienda un minimo de 6-8 GB de VRAM para inferencia comoda en fp16.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4090) es suficiente; en entornos profesionales, A100, H100 o L4 funcionan sin problema. Una T4 de 16 GB es suficiente tanto para inferencia como para reentrenar el adaptador.
- Cabe en GPU consumer: si, con holgura en tarjetas de 8 GB o mas en fp16; en cuantizacion de 4 bits del modelo base cabria en GPUs de 4-6 GB, aunque la model card no documenta cuantizaciones especificas del adaptador.
- Opciones de despliegue: `transformers` + `peft` (documentado en la model card), y por extension del modelo base, vLLM, TGI, llama.cpp u Ollama si se fusiona el adaptador con el modelo base y se convierte a GGUF. La model card solo documenta la via `transformers` + `peft`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-1.7B + SFT + LoRA (este) | 1,7B base + 34,9M adaptador | no disponible | Sentimiento arabizi tunecino | apache-2.0 | Hugging Face (adaptador) |
| Qwen3-1.7B zero-shot | 1,7B | no disponible | Sentimiento arabizi tunecino | apache-2.0 | Hugging Face |
| Char + Word TF-IDF + LogReg | no aplica (modelo clasico) | no aplica | Sentimiento arabizi tunecino | no disponible | entrenado ad hoc |
| Hibrido LoRA + TF-IDF | 1,7B + clasico | no disponible | Sentimiento arabizi tunecino | no disponible | combinacion de los anteriores |

No se dispone de comparativas con otros adaptadores especializados en arabizi tunecino en la informacion proporcionada.

## Limitaciones y advertencias

- Tarea binaria: solo distingue positivo y negativo; no hay clase neutra, lo que puede forzar etiquetas erroneas en comentarios ambiguos o informativos.
- El modelo base en zero-shot obtiene solo 56,20 % de accuracy, lo que indica que el conocimiento del dominio procede casi integramente del adaptador y del dataset TUNIZI; la calidad fuera de la distribucion de ese dataset es incierta.
- El conjunto de test es pequeno (n = 589) y los intervalos de confianza son amplios (por ejemplo, [75,1 %, 81,7 %] para accuracy), por lo que las diferencias frente a TF-IDF (77,93 %) estan dentro del ruido estadistico.
- Riesgo de alucinacion: al ser un modelo generativo, puede emitir etiquetas distintas de "positive"/"negative" o texto adicional si el prompt no se construye exactamente como en la model card; se recomienda `do_sample=False` y `max_new_tokens` bajo.
- Dependencia del preprocesado: el autor aplica normalizacion de repeticiones y espacios; omitirla puede degradar el rendimiento.
- Sesgos: el dataset TUNIZI proviene de redes sociales y puede sobrerrepresentar ciertos temas, registros y vocabulario; no se documenta analisis de sesgos.
- Cobertura limitada a arabizi tunecino; no se garantiza buen rendimiento en arabe estandar, otros dialectos magrebies o frances general.
- Licencia apache-2.0 en el adaptador, pero el uso comercial debe verificar tambien la licencia del modelo base Qwen/Qwen3-1.7B.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion independiente.
- No se documentan cuantizaciones del adaptador ni metricas de latencia, lo que dificulta planificar despliegues en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mohsen07/Qwen3-1.7B-Tunisian-Arabizi-Sentiment-LoRA
- Demo interactiva (Space): https://huggingface.co/spaces/Mohsen07/Tunisian-Arabizi-Sentiment-Demo
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset TUNIZI: no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
