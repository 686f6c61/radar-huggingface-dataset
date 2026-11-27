# mikan-research/banking77-qwen3-0.6b-lora

## Resumen

El modelo `mikan-research/banking77-qwen3-0.6b-lora` es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base `Qwen/Qwen3-0.6B` para una tarea muy concreta: la clasificación de intenciones en mensajes de clientes de banca online segun el conjunto de datos Banking77. Lo desarrolla mikan-research como parte de Mikan, un pipeline de destilacion que transfiere el comportamiento de un modelo grande (profesor) a un modelo pequeno (estudiante) en una tarea estrecha, y que verifica la no inferioridad estadistica del estudiante mediante un margen pre-registrado.

El adaptador se entrena sobre las 8.222 muestras de entrenamiento de Banking77, usando como etiquetas las predicciones de un profesor de gran tamano (`Qwen3-30B-A3B-Instruct-2507-FP8`) en regimen de 10-shot. El resultado es un adaptador de apenas 0,1 GB que alcanza un 85,6 % de exactitud en el conjunto de test (3.080 ejemplos), igualando al profesor con un intervalo de confianza del 95 % que descarta una degradacion superior a 0,8 puntos.

La relevancia practica esta en el desacoplamiento entre capacidad y coste: se sustituye un modelo MoE de 30.000 millones de parametros totales por un adaptador LoRA de rango 16 sobre un modelo denso de 0,6 mil millones, manteniendo la precision en la tarea. El modelo esta pensado exclusivamente para clasificacion de intenciones en dominio bancario, no como modelo generativo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r=16, alpha=32) sobre transformer decoder-only denso (Qwen3-0.6B) |
| Parametros totales | No disponible (adaptador LoRA sobre modelo base de 0,6 mil millones de parametros) |
| Parametros activos | No aplica (el modelo base no es MoE) |
| Longitud de contexto | No disponible en la model card (heredada del modelo base Qwen3-0.6B) |
| Tipos de cuantizacion | No disponible (pesos del adaptador en safetensors; el modelo base admite las cuantizaciones habituales de Qwen3) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA); requiere el modelo base `Qwen/Qwen3-0.6B` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen3-0.6B`, un transformer decoder-only denso de la familia Qwen3. El LoRA usa rango 16 y alpha 32, aplicado a todas las proyecciones lineales del modelo base. El entrenamiento emplea perdida unicamente sobre la completion (la etiqueta de intencion generada), con learning rate 0,0002, schedule coseno, 3 epocas, tamano de batch 32, precision fp16 y AdamW de 8 bits. Se ejecuto con Unsloth 2026.11.12 y TRL 1.19.0 sobre una unica GPU Tesla T4 en 14 minutos.

El dato de entrenamiento son las 8.222 muestras del split de entrenamiento de Banking77, con etiquetas generadas por el profesor `Qwen3-30B-A3B-Instruct-2507-FP8` en regimen de 10-shot. El checkpoint final (epoca 3 de 3) se selecciono sobre un split de validacion reservado y el test se predijo una sola vez. El prompt de inferencia es un mensaje de sistema corto sin lista de etiquetas y con el modo thinking desactivado (`enable_thinking=False`).

La innovacion metodologica no esta en la arquitectura sino en el protocolo de evaluacion: se pre-registra un margen de no inferioridad δ = 2 puntos y se comprueba con bootstrap pareado. El resultado (diferencia profesor − estudiante de 0,1 puntos, IC 95 % [−0,8, 0,9]) permite declarar que el estudiante no es inferior al profesor dentro del margen.

## Capacidades

- Clasificacion de intenciones en mensajes de clientes de banca online sobre las 77 clases de Banking77.
- Generacion de texto restringida a la etiqueta de intencion (respuesta corta, `max_new_tokens=24` en el ejemplo de uso).
- Inferencia determinista en el uso recomendado (`do_sample=False`).
- Modo thinking desactivado por diseno para esta tarea.
- No soporta tool calling, function calling ni razonamiento multi-paso como capacidad entrenada.
- No se documentan capacidades multilingues especificas; el dataset Banking77 es en ingles.
- No se documentan capacidades de vision ni audio.

## Casos de uso

- Enrutamiento de tickets de soporte bancario: el adaptador clasifica cada mensaje entrante en una de las 77 intenciones (por ejemplo, "card_arrival", "transfer_not_received") y permite dirigirlo al equipo o flujo automatizado correspondiente con un coste de inferencia minimo.
- Triaje en chatbots de atencion al cliente: integrado como primer paso de un pipeline, identifica la intencion antes de invocar el modelo generativo o el sistema de resolucion, reduciendo llamadas a modelos grandes.
- Etiquetado automatico a escala de conversaciones historicas: al ejecutarse sobre un modelo de 0,6 mil millones con un adaptador de 0,1 GB, permite procesar grandes volumenes de mensajes en hardware modesto (una T4 es suficiente para el entrenamiento, y la inferencia cabe en GPUs de consumo).
- Clasificacion en entornos con requisitos de coste y latencia estrictos: sustituye a un modelo MoE de 30.000 millones por una alternativa densa de 0,6 mil millones sin perdida de precision estadisticamente demostrable en esta tarea.
- Investigacion sobre destilacion y no inferioridad: sirve como caso reproducible de pipeline Mikan para estudiar transferencia de comportamiento de profesor a estudiante con garantias estadisticas.
- Filtrado y analitica de feedback de clientes: clasificar quejas y solicitudes por intencion para agregar metricas de producto o detectar picos en categorias concretas.
- Base para fine-tuning adicional en dominios bancarios propios: al ser un adaptador LoRA con licencia Apache 2.0, puede reentrenarse o combinarse con otros adaptadores sobre el mismo modelo base.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el split de test de Banking77 (3.080 ejemplos, etiquetas de referencia):

| Modelo | Exactitud |
|---|---|
| Este adaptador (Qwen3-0.6B + LoRA) | 85,6 % |
| Profesor (Qwen3-30B-A3B-Instruct-2507-FP8, 10-shot) | 85,6 % |

Diferencia profesor − estudiante: 0,1 puntos, IC 95 % por bootstrap pareado [−0,8, 0,9]. Margen de no inferioridad pre-registrado δ = 2 puntos: superado. Tasa de etiquetas validas: 99,8 %. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el modelo base tiene 0,6 mil millones de parametros, por lo que en fp16 ocupa aproximadamente 1,2 GB de pesos mas el adaptador (0,1 GB de repo) y el overhead de activaciones y cache KV.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM. El entrenamiento se realizo en una Tesla T4; la inferencia es viable en GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- Cabe en GPU de consumo: si, dado el tamano del modelo base y del adaptador.
- Opciones de despliegue: el ejemplo oficial usa `transformers` + `peft`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el adaptador LoRA requeriria fusion con el modelo base o soporte de adaptadores en el servidor de inferencia.
- Latencia y throughput: no disponibles. El entrenamiento completo (3 epocas) tardo 14 minutos en una T4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Exactitud Banking77 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen3-0.6B + LoRA) | 0,6 mil millones (base) + LoRA r=16 | No disponible | 85,6 % | Apache 2.0 | Hugging Face |
| Profesor Qwen3-30B-A3B-Instruct-2507-FP8 | 30 mil millones totales (MoE) | No disponible | 85,6 % | No disponible en la informacion | No disponible en la informacion |
| Otros adaptadores o clasificadores para Banking77 | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks de alternativas comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta especializado exclusivamente en clasificacion de intenciones bancarias sobre las 77 clases de Banking77; fuera de ese dominio su comportamiento no esta caracterizado.
- El dataset Banking77 es en ingles, por lo que el rendimiento en otros idiomas no esta evaluado ni documentado.
- La exactitud del 85,6 % implica que aproximadamente 1 de cada 7 mensajes se clasifica incorrectamente; en produccion conviene prever umbrales de confianza o revision humana.
- La tasa de etiquetas validas es del 99,8 %, lo que deja un 0,2 % de respuestas que no corresponden a una etiqueta valida y requieren gestion explicita.
- El checkpoint se selecciono sobre validacion y el test se predijo una sola vez, pero el margen de no inferioridad se define sobre este conjunto concreto; no garantiza el mismo comportamiento en distribuciones de mensajes distintas.
- Riesgo de alucinacion: al ser un modelo generativo, puede producir texto que no sea una etiqueta valida; el uso recomendado es decodificacion greedy y respuesta corta.
- Licencia Apache 2.0: permite uso comercial, pero debe respetarse tambien la licencia del modelo base Qwen3-0.6B y la del dataset Banking77 (CC-BY-4.0, con atribucion a Casanueva et al., 2020).
- No se documentan sesgos especificos; al entrenarse sobre un dataset de banca online en ingles, puede heredar sesgos de ese corpus.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mikan-research/banking77-qwen3-0.6b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Repositorio del pipeline Mikan: https://github.com/mikan-research/mikan
- Dataset Banking77: https://huggingface.co/datasets/PolyAI/banking77
- Dataset de destilacion: https://huggingface.co/datasets/mikan-research/banking77-distill
- Paper de referencia de Banking77: Casanueva et al., 2020, "Efficient Intent Detection with Dual Sentence Encoders"
