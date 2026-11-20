# Kelly0510/X-AQA-9B

## Resumen

X-AQA-9B es un modelo multimodal de evaluacion de calidad de acciones (action quality assessment, AQA) desarrollado por Kaili Zheng y colaboradores, publicado bajo el identificador Kelly0510/X-AQA-9B en Hugging Face. Se obtiene mediante ajuste fino supervisado del modelo base Qwen/Qwen3.5-9B sobre el dataset X-AQA-40K, compuesto por 40.163 muestras de pregunta-respuesta procedentes de 22 fuentes y cuatro dominios: deporte de competicion, ejercicio fisico, rehabilitacion y habilidades generales.

El modelo unifica anotaciones heterogeneas (puntuaciones numericas, juicios categoricos y retroalimentacion en texto libre) en un unico formato de QA, incorporando en el prompt las guias de anotacion y reglamentos oficiales de puntuacion cuando estan disponibles. Con 9.409.813.744 parametros totales y pesos en bf16 distribuidos en 4 shards (18,8 GB de repositorio), emplea la arquitectura multimodal del Qwen3.5-9B subyacente, que combina un transformer de lenguaje con un codificador visual y un modulo de fusion (visual merger).

Su relevancia actual radica en que aborda la AQA como una tarea generativa unificada, cubriendo a la vez evaluacion de video deportivo, forma de ejercicio, rehabilitacion y habilidades, con resultados que superan a modelos propietarios como GPT-6.1 Sol y Gemini 3.8 Flash en el benchmark propio X-AQA-Bench. La licencia Apache 2.0 facilita su adopcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.5-9B: LLM + codificador visual + visual merger); adaptacion LoRA fusionada en los pesos |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (longitud maxima de secuencia usada en entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, 4 shards); transformers |

## Arquitectura y entrenamiento

X-AQA-9B parte de Qwen3.5-9B, un modelo multimodal image-text-to-text que integra un transformer de lenguaje con un codificador visual y un modulo de fusion (visual merger). El ajuste se realizo mediante LoRA de rango 32, alpha 64 y dropout 0,05, aplicada a todas las capas lineales del modelo de lenguaje y al visual merger; los pesos publicados tienen la LoRA fusionada en los pesos base, por lo que no es necesario cargar adaptadores.

El entrenamiento utilizo X-AQA-40K: 40.163 muestras de QA de 22 fuentes en cuatro dominios, durante una epoca (1.255 pasos con batch global de 32). La optimizacion empleo AdamW con weight decay 0,1, gradient clipping 1,0, learning rate pico de 1e-4 para el modelo de lenguaje y 5e-5 para el visual merger, con decaimiento coseno, 3% de warmup y un minimo del 10% del pico. Se ejecuto en 16 GPU NVIDIA H20 en bf16, con longitud maxima de secuencia de 32.768 y semilla 42. La innovacion principal es la conversion de anotaciones heterogeneas a un formato QA unificado e instrucciones con criterios de evaluacion especificos por dataset en el prompt, lo que permite un unico modelo para puntuacion numerica, juicio categorico y feedback libre.

## Capacidades

- Evaluacion de calidad de acciones en video: puntuacion numerica (por ejemplo, `execution_award`), juicios categoricos (por ejemplo, `proficiency_level`) y retroalimentacion en texto libre (por ejemplo, `comment`).
- Comprension de video e imagen en contexto conversacional (pipeline image-text-to-text).
- Razonamiento multimodal sobre reglamentos y criterios de evaluacion incluidos en el prompt.
- Cobertura de cuatro dominios: deporte de competicion, fitness, rehabilitacion y habilidades generales.
- Evaluacion de forma de ejercicio con deteccion de errores concretos (por ejemplo, rodillas hacia delante en sentadillas).
- Generacion de feedback textual cualitativo junto a la puntuacion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles declarado.
- Modo thinking, vision adicional o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Evaluacion automatica de saltos de trampolin y clavados: el modelo recibe fotogramas del video y devuelve una nota de ejecucion junto a un comentario cualitativo, sustituyendo o asistiendo al juicio de jueces humanos en competiciones con criterios estandarizados.
- Analisis de forma en ejercicio fisico: a partir de video de una sentadilla, detecta errores posturales (por ejemplo, rodillas hacia delante) y emite un juicio categorico de forma correcta o incorrecta, util para aplicaciones de entrenamiento personal.
- Rehabilitacion y fisioterapia: evaluacion de ejercicios de rehabilitacion (dominio KIMORE) con puntuacion de calidad de movimiento y feedback textual para el paciente, aunque con rendimiento limitado en escenarios fuera de distribucion.
- Evaluacion de habilidades generales: clasificacion de nivel de pericia (por ejemplo, `Late Expert`) en tareas de destreza manual, aprovechando el entrenamiento multi-dominio.
- Arbitraje asistido y formacion de jueces: el modelo incorpora los reglamentos oficiales en el prompt y puede usarse como segunda opinion o herramienta de formacion en deportes con criterios de puntuacion documentados.
- Analitica deportiva y scouting: procesamiento por lotes de videos de competicion para generar puntuaciones comparables y comentarios estructurados que alimenten paneles de analisis.
- Investigacion en AQA: linea base reproducible y abierta (Apache 2.0) para experimentos de evaluacion de acciones con modelos multimodales, con codigo de preprocesado y entrenamiento disponible.

## Benchmarks y rendimiento

Resultados en X-AQA-Bench (7.101 filas: 5.366 ID, 1.735 OOD; 31 tareas, 25 datasets; valores x100; ± es la semianchura del intervalo de confianza bootstrap al 95%):

| Split | Score SRCC↑ | Category macro-F1↑ | Category κ↑ | Text BERTScore↑ |
|---|---|---|---|---|
| ID | 60,7 ± 3,6 | 59,2 ± 1,8 | 29,3 ± 3,2 | 89,7 ± 0,1 |
| OOD | 24,4 ± 8,5 | 55,7 ± 5,2 | 12,6 ± 9,9 | 87,1 ± 0,1 |

Segun la model card, X-AQA-9B supera a todos los MLLM open source evaluados en las cuatro metricas en ambos splits. En ID alcanza un SRCC de 0,607 frente a 0,465 de GPT-6.1 Sol; en OOD su BERTScore es 0,871 frente a 0,862 de Gemini 3.8 Flash.

Evaluacion por dataset (mismo modelo conjunto, sin ajuste fino especifico por dataset, sobre los test sets completos con la metrica propia de cada uno):

| Dataset | Metrica | X-AQA-9B | Comparacion |
|---|---|---|---|
| MTL-AQA | SRCC↑ / relative ℓ2↓ | 0,8862 / 0,6948 | 0,6464 / 1,8750 (Qwen3.5-9B base) |
| Fitness-AQA | F1↑ (error knees-forward) | 0,8130 | 0,8338 (especialista MD) |
| KIMORE (zero-shot) | SRCC↑ en E1–E5 | 0,35 / 0,45 / 0,47 / 0,50 / 0,18 | 0,54 en E4 (Abedi et al., entrenado en KIMORE) |
| LASANA | Accuracy↑ / balanced accuracy↑ | 0,7706 / 0,7576 | 0,5512 / 0,5669 (Qwen3.5-9B base) |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 18,8 GB solo para pesos, mas memoria para el codificador visual, cache KV y activaciones; en la practica se recomienda 24 GB o mas por instancia.
- Cuantizacion: no se publican pesos GGUF ni cuantizaciones oficiales; la reduccion a 8 bits o 4 bits requeriria conversion propia.
- GPU recomendadas: NVIDIA H20, A100 (40/80 GB) o H100 para despliegue de produccion; en consumer, RTX 4090 (24 GB) puede ser suficiente para bf16 con secuencias cortas, aunque la longitud de contexto de 32.768 tokens incrementa la memoria de cache KV.
- Despliegue: transformers (libreria declarada) y endpoints compatibles (tag `endpoints_compatible`); el repositorio de GitHub incluye ejemplos de serving. Soporte explicito de vLLM, llama.cpp, Ollama o TGI: no disponible en la informacion proporcionada.
- Latencia y throughput: no disponible en la informacion proporcionada; el entrenamiento se ejecuto en 16 GPU H20, lo que da una idea del coste de ajuste, no de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento AQA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| X-AQA-9B | 9,41 B | 32.768 | SRCC 0,607 (ID), BERTScore 0,871 (OOD) en X-AQA-Bench | Apache 2.0 | Pesos abiertos en HF |
| Qwen3.5-9B (base) | 9 B aprox. | no disponible | SRCC 0,6464 en MTL-AQA; 0,5512 acc en LASANA | Apache 2.0 | Pesos abiertos en HF |
| GPT-6.1 Sol | no disponible | no disponible | SRCC 0,465 (ID) en X-AQA-Bench | Propietaria | API |
| Gemini 3.8 Flash | no disponible | no disponible | BERTScore 0,862 (OOD) en X-AQA-Bench | Propietaria | API |

## Limitaciones y advertencias

- Generalizacion fuera de distribucion limitada: en el split OOD el SRCC cae a 0,244 y la kappa a 0,126, muy por debajo del split ID.
- Rendimiento zero-shot irregular en KIMORE: SRCC de 0,18 en el escenario E5 y por debajo de un especialista entrenado en el dataset (0,54 en E4).
- En Fitness-AQA (error knees-forward) queda ligeramente por detras de un especialista de dominio (0,8130 frente a 0,8338).
- Solo soporta ingles; no se declaran capacidades multilingues.
- Riesgo de alucinacion en la retroalimentacion textual y en las puntuaciones, especialmente en videos fuera de los dominios de entrenamiento.
- Sesgos conocidos: no disponible en la informacion proporcionada; el entrenamiento multi-dominio puede heredar sesgos de las 22 fuentes de anotacion.
- Licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen3.5-9B (enlace a su LICENSE).
- El enlace de arXiv de la model card es un placeholder (XXXX.XXXXX); la publicacion puede no estar disponible.
- El modelo esta especializado en AQA; no debe esperarse un rendimiento de proposito general equiparable a su base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kelly0510/X-AQA-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Codigo (dataset, preprocesado de video, entrenamiento e inferencia): https://github.com/Kelly510/X-AQA
- Paper: https://arxiv.org/abs/XXXX.XXXXX (placeholder en la model card; no disponible)
