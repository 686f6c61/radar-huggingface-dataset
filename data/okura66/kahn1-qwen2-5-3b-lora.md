# Okura66/Kahn1-Qwen2.5-3B-LoRA

## Resumen

Kahn1-Qwen2.5-3B-LoRA es un adaptador LoRA de PEFT publicado por el usuario Okura66 sobre el modelo base Qwen/Qwen2.5-3B-Instruct. No es un modelo generativo de propósito general, sino un denominado "System 1 Decision Engine" orientado a clasificación: clasificación categórica (modo Choice), regresión ordinal de 0 a 5 (modo Score) y verificación binaria (modo Noul). El repositorio incluye únicamente los pesos del adaptador (239 MB), no los pesos completos del modelo base.

Técnicamente se trata de un LoRA de rango 32 con alpha 64 y dropout 0,05, aplicado sobre todas las proyecciones lineales de atención y MLP (q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj) del transformer decoder-only de Qwen2.5-3B-Instruct. Los parámetros entrenables son aproximadamente 40,3 millones sobre un total de 3,08 mil millones, es decir, un 1,31 % del modelo. El adaptador se distribuye en bfloat16 y está pensado para reutilizarse si ya se tiene el modelo base en la caché local de Hugging Face, evitando descargar los 6,17 GB de pesos fusionados.

Su relevancia actual reside en el nicho de los "motores de decisión" ligeros que devuelven distribuciones de probabilidad calibradas en lugar de texto libre. La model card publica temperaturas de calibración post-hoc calculadas sobre la distribución de validación (1,231 para Choice, 1,122 para Score y 1,017 para Noul), con objetivos declarados de minimizar NLL/ECE, MAE/ECE continuo y Brier score respectivamente. Esto lo hace apto para integrarse como componente determinista dentro de pipelines de agentes o sistemas de enrutamiento donde se necesita una probabilidad utilizable con umbrales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA sobre todas las proyecciones lineales de atencion y MLP |
| Parametros totales | 3,08 mil millones (modelo base Qwen2.5-3B-Instruct) |
| Parametros activos | No aplica (no es MoE) |
| Parametros entrenables del adaptador | ~40,3 M (1,31 % del total) |
| Longitud de contexto | 32.768 tokens heredados del modelo base Qwen2.5-3B-Instruct (no especificado en la model card del adaptador) |
| Tipos de cuantizacion | no disponible en la model card (el adaptador se distribuye en bfloat16; el modelo base admite cuantizacion estandar tipo GGUF/AWQ/GPTQ por su cuenta) |
| Idiomas soportados | no disponible (la model card no especifica idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, 239 MB); existe variante fusionada de 6,17 GB |
| Rango LoRA (r) | 32 |
| Alpha LoRA | 64 |
| Dropout LoRA | 0,05 |
| Precision | bfloat16 |
| Pipeline declarado | text-classification |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen2.5-3B-Instruct, un transformer decoder-only con atención por consultas agrupadas (GQA) y RoPE, del que no se detallan en la model card ni el número de tokens de entrenamiento ni la composición del dataset original. Lo específico de Kahn1 es la configuración del LoRA: rango 32, alpha 64, dropout 0,05 y cobertura de las siete proyecciones lineales (q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj), lo que supone adaptar tanto el bloque de atención como el MLP. Con 40,3 M de parámetros entrenables sobre 3,08 B, el coste de fine-tuning y de almacenamiento es bajo.

El entrenamiento se orienta a tres modos de pregunta diferenciados: Choice (clasificación categórica), Score (regresión ordinal de 0 a 5) y Noul (verificación binaria). No se especifica en la información disponible qué dataset se usó, cuántas muestras, ni si hubo fases de RLHF o DPO; tampoco se documenta el procedimiento de ajuste más allá del calibrado post-hoc. La innovación declarada es precisamente ese calibrado de temperatura sobre la distribución de validación, con temperaturas óptimas de 1,231 (Choice), 1,122 (Score) y 1,017 (Noul), que se aplican sobre los logits mediante una softmax con temperatura para obtener probabilidades calibradas.

## Capacidades

- Clasificación categórica (modo Choice): asignación de una etiqueta entre un conjunto de opciones, con distribución de probabilidad calibrada.
- Regresión ordinal (modo Score): puntuación en escala 0-5, útil para gradaciones de calidad, severidad o prioridad.
- Verificación binaria (modo Noul): validación de si una afirmación o condición se cumple, con probabilidad calibrada y Brier score minimizado durante la calibración.
- Salidas estructuradas: las etiquetas del repositorio incluyen "structured-outputs", lo que apunta a respuestas en formato fijo aptas para consumo programático.
- Inferencia rápida: etiquetado como "fast-inference" y pensado como "decision-engine" dentro de pipelines, dado su tamaño de 3B.
- Capacidades generativas y de razonamiento: heredadas del modelo base Qwen2.5-3B-Instruct, pero no validadas ni documentadas para este adaptador.
- Tool calling / function calling: no documentado para el adaptador; el modelo base Qwen2.5-Instruct sí lo soporta de serie.
- Soporte de agentes y razonamiento multi-paso: no documentado específicamente; el adaptador está planteado como componente de decisión dentro de un agente, no como el agente completo.
- Capacidades multilingües: no disponibles en la model card; dependen exclusivamente del modelo base.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Enrutamiento de decisiones en pipelines de agentes: el adaptador puede actuar como cabecera de clasificación que decide, por ejemplo, si una consulta se resuelve con una herramienta, con recuperación documental o derivando a un humano. Su valor está en devolver una probabilidad calibrada sobre la que fijar umbrales explícitos en lugar de depender de texto libre.
- Puntuación ordinal de calidad de respuestas (LLM-as-a-judge ligero): con el modo Score 0-5 se puede evaluar automáticamente la calidad de salidas de otro modelo y alimentar métricas agregadas, aprovechando la temperatura de calibración de 1,122 para reducir el error absoluto medio.
- Moderación de contenido con umbral configurable: la clasificación categórica calibrada permite fijar un umbral de probabilidad (por ejemplo 0,9) por encima del cual se bloquea el contenido, ajustando el compromiso entre falsos positivos y falsos negativos.
- Verificación de afirmaciones en pipelines de RAG: el modo Noul permite comprobar de forma binaria si una respuesta generada está respaldada por el contexto recuperado, con temperatura de calibración 1,017 y Brier score minimizado, lo que facilita comparar probabilidades entre ejecuciones.
- Triaje y clasificación de tickets de soporte: asignar categoría y severidad (Score 0-5) a cada incidencia para enrutarla al equipo correspondiente, con un coste de cómputo bajo al ser un modelo de 3B y un adaptador de 239 MB.
- Clasificación de intenciones en atención al cliente: etiquetado de la intención del usuario en conversaciones multi-turno, reutilizando el modelo base ya descargado en producción y añadiendo solo el adaptador.
- Despliegue en entornos con recursos limitados o en el borde: al ocupar el adaptador 239 MB sobre un modelo base de 3B, es viable ejecutarlo en una única GPU de gama consumer o incluso en CPU cuantizado, para tareas de decisión de alto volumen y baja latencia.
- Normalización y estructuración de datos: convertir texto libre en etiquetas o puntuaciones ordinales consistentes para alimentar bases de datos o dashboards analíticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta temperaturas de calibración post-hoc sobre la distribución de validación y los objetivos de calibración asociados, sin cifras absolutas de accuracy, F1, MAE, MMLU, HumanEval o GSM8K.

| Modo de pregunta | Temperatura optima (T) | Objetivo de calibracion declarado |
|---|---|---|
| Choice (clasificacion categorica) | 1,231 | Minimizar NLL y ECE (ECE < 0,02) |
| Score (regresion ordinal 0-5) | 1,122 | Minimizar MAE y ECE continuo |
| Noul (verificacion binaria) | 1,017 | Minimizar Brier score y descalibracion |

## Requisitos de hardware

- VRAM estimada para el modelo base en bfloat16: aproximadamente 6,2 GB de pesos (la model card indica 6,17 GB para la variante fusionada), más overhead de activaciones y caché KV.
- VRAM del adaptador: 239 MB adicionales sobre el modelo base, o 0,3 GB de repositorio completo.
- Cabe en GPU consumer: sí. Una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070/4080/4090 o similares pueden alojar el modelo en bf16 con margen; en cuantización de 8 bits baja a unos 3-4 GB y en 4 bits a unos 2 GB.
- GPU de centro de datos: A100, H100, L40S o A10G son válidas y sobredimensionadas para un modelo de 3B; su interés aquí es el batching y el throughput agregado.
- Despliegue: al ser un adaptador PEFT, la vía natural es transformers + peft, con opción de fusionar pesos con merge_and_unload() para servirlo sin dependencia de PEFT. Para servicio de alto rendimiento, vLLM soporta modelos PEFT/LoRA; también es posible exportar a GGUF y servir con llama.cpp u Ollama, o usar TGI, aunque la model card no documenta ninguna de estas rutas.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Kahn1-Qwen2.5-3B-LoRA (este) | 3,08 B (adaptador de 40,3 M) | 32.768 tokens (heredado) | Apache 2.0 | Adaptador PEFT en HuggingFace | Especializado en decision/clasificacion calibrada |
| Kahn1-Qwen2.5-3B (fusionado) | 3,08 B | 32.768 tokens (heredado) | Apache 2.0 | Pesos completos (6,17 GB) en HuggingFace | Mismo modelo sin dependencia de PEFT |
| Qwen/Qwen2.5-3B-Instruct | 3,08 B | 32.768 tokens | Apache 2.0 | Pesos completos en HuggingFace | Modelo base generativo, sin cabecera de decision calibrada |
| Alternativas de ~3 B (por ejemplo Llama 3.2 3B Instruct, Phi-3.5-mini-instruct) | ~3-4 B | 128.000 tokens | Licencias propias de cada modelo | HuggingFace | Datos de referencia general, no verificados en la informacion proporcionada |

No se dispone de comparativas de rendimiento entre Kahn1 y estos modelos, porque no hay benchmarks publicados en la información disponible.

## Limitaciones y advertencias

- No es un modelo autónomo: este repositorio contiene solo el adaptador LoRA. Requiere descargar Qwen/Qwen2.5-3B-Instruct (unos 6,17 GB) y cargarlo con PEFT, o bien usar la variante fusionada Okura66/Kahn1-Qwen2.5-3B.
- Ausencia total de benchmarks: no hay métricas de accuracy, F1, MAE ni comparativas con alternativas, por lo que el rendimiento real en producción es desconocido y debe validarse con datos propios.
- Riesgo de alucinación en tareas generativas: aunque está orientado a clasificación, sigue siendo un modelo de lenguaje; si se usa fuera de los modos Choice/Score/Noul puede producir contenido no verificado.
- Calibración dependiente de la distribución: las temperaturas (1,231, 1,122, 1,017) se calcularon sobre la distribución de validación del autor. Si la distribución de producción difiere, las probabilidades dejarán de estar calibradas y habrá que recalibrar.
- Dataset de entrenamiento no documentado: se desconoce la composición, el tamaño y el idioma de los datos de ajuste, lo que impide auditar sesgos.
- Idiomas no especificados: la cobertura multilingüe depende del modelo base y no está garantizada para la tarea de clasificación ajustada.
- Longitud de contexto: 32.768 tokens heredados del modelo base; no hay confirmación de que el adaptador mantenga la calidad en contextos largos de clasificación.
- Sin documentación sobre tool calling, agentes o salidas estructuradas más allá de las etiquetas del repositorio.
- Licencia: el adaptador es Apache 2.0, igual que Qwen2.5-3B-Instruct, por lo que el uso comercial es posible; aun así, conviene revisar los términos del modelo base y del repositorio GitHub del proyecto.
- Adopción mínima: 0 descargas y 1 like en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- Los resultados de la búsqueda web realizada no contienen información relevante sobre este modelo (los resultados devueltos tratan sobre la localidad de Punjagutta, Hyderabad, y no guardan relación).

## Enlaces

- Adaptador LoRA en HuggingFace: https://huggingface.co/Okura66/Kahn1-Qwen2.5-3B-LoRA
- Pesos fusionados: https://huggingface.co/Okura66/Kahn1-Qwen2.5-3B
- Repositorio GitHub del proyecto Kahn1: https://github.com/Okura66/kahn1
- Licencia del proyecto en GitHub: https://github.com/Okura66/kahn1/blob/main/LICENSE
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Papers, blogs o demos adicionales: no disponible en la informacion proporcionada.
