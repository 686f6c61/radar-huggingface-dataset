# ninenfn/llm-course-hw3-lora

## Resumen

`ninenfn/llm-course-hw3-lora` es un adaptador LoRA publicado en Hugging Face por el usuario ninenfn como entrega de un trabajo de curso sobre modelos de lenguaje. No se trata de un modelo fundacional nuevo, sino de un ajuste fino del modelo instructivo `OuteAI/Lite-Oute-1-300M-Instruct` (300.031.872 parametros) para la tarea concreta de clasificacion de sentimiento en tuits (positivo, neutral, negativo). El adaptador se entrena sobre el dataset `cardiffnlp/tweet_eval` y se distribuye en formato safetensors junto con los pesos base, en un repositorio de 4,8 GB.

El interes del artefacto es fundamentalmente pedagogico y de referencia tecnica: documenta un proceso de mitigacion de desequilibrio de clases mediante `WeightedRandomSampler`, reduccion del learning rate a `1e-4` y `weight_decay=0.01`, logrando pasar de un F1 de 0,13 en zero-shot a 0,51 tras el ajuste LoRA. El adaptador emplea `lora_r=8`, `lora_alpha=16` y actua solo sobre las proyecciones `k_proj` y `v_proj` de la atencion, lo que lo convierte en una intervencion de bajo coste computacional sobre un modelo ya de por si pequeno.

Por su naturaleza (homework, 0 descargas, 0 likes, sin licencia declarada y sin idiomas declarados), no debe considerarse un modelo listo para produccion, sino una pieza reproducible de un ejercicio academico que ilustra como adaptar un LLM de 300M de parametros a una tarea de clasificacion con recursos minimos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base OuteAI/Lite-Oute-1-300M-Instruct) con adaptador LoRA |
| Parametros totales | 300.031.872 (modelo base); el adaptador LoRA es de rango 8 sobre k_proj y v_proj |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el modelo base admite las cuantizaciones habituales de transformers) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers) |
| Modelo base | OuteAI/Lite-Oute-1-300M-Instruct |
| Dataset de ajuste | cardiffnlp/tweet_eval |
| Tarea | Clasificacion de sentimiento en tuits (positive / neutral / negative) |
| Libreria | transformers |
| Tags | lora, homework, conversational, text-generation-inference, endpoints_compatible |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer decoder-only de 300M de parametros (Lite-Oute-1-300M-Instruct), del que no se detalla en la informacion disponible la composicion exacta de capas, atencion ni tokenizador. La intervencion LoRA se limita a las proyecciones de clave y valor (`k_proj`, `v_proj`) de la atencion, con rango `r=8` y `alpha=16`, lo que supone un numero muy reducido de parametros entrenables en relacion con el total del modelo base.

El entrenamiento se realiza sobre `cardiffnlp/tweet_eval` para clasificacion de sentimiento en tres clases. Los hiperparametros documentados son: `batch_size=16`, `lr=1e-4`, `num_epochs=1`, `weight_decay=0.01` y `WeightedRandomSampler` para compensar el desequilibrio de clases. El autor reporta que el ajuste zero-shot colapsaba en la clase `negative` con F1 aproximado de 0,13, y que un learning rate estandar de `5e-4` provocaba sobreajuste al clase mayoritaria `neutral` con F1 de 0,33. La combinacion de sampler ponderado, LR mas bajo y regularizacion L2 eleva el F1 final a 0,51. No se documenta uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Clasificacion de sentimiento en tuits en tres etiquetas: `positive`, `neutral`, `negative`.
- Generacion de texto condicionada por el modelo base instructivo (Lite-Oute-1-300M-Instruct), aunque el ajuste LoRA esta orientado a la tarea de clasificacion.
- Formato conversacional heredado del modelo base (`conversational` en los tags).
- Compatibilidad con `text-generation-inference` y endpoints compatibles segun los tags del repositorio.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Clasificacion de sentimiento en tuits en castellano o ingles (segun el modelo base): el adaptador devuelve una de las tres etiquetas directamente, lo que permite procesar lotes de publicaciones en pipelines de analisis social.
- Monitorizacion de reputacion de marca en redes sociales: ingestar menciones y etiquetarlas como positivas, neutras o negativas para alimentar dashboards de sentimiento.
- Filtrado previo de comentarios en foros o comunidades: usar el clasificador como primera etapa para enrutar comentarios negativos a moderacion humana.
- Analisis de opinion en encuestas abiertas: procesar respuestas de texto libre y agregar polaridad para estudios de satisfaccion.
- Etiquetado asistido de datasets: usar el adaptador como pre-etiquetador en un flujo de anotacion humana (active learning), reduciendo el coste de anotacion manual.
- Prototipado docente y experimentacion con PEFT: el repositorio sirve como plantilla reproducible de como aplicar LoRA a un modelo de 300M con recursos de una sola GPU consumer.
- Clasificacion ligera en el borde (edge): al tratarse de un modelo de 300M, es viable desplegarlo en CPU o GPU de baja gama para tareas de sentimiento en tiempo real.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son los de la tarea de clasificacion de sentimiento sobre `cardiffnlp/tweet_eval`:

| Metrica | Antes del ajuste (zero-shot) | Despues del ajuste LoRA |
|---|---|---|
| F1 | 0,13 | 0,51 |

No se han publicado resultados de benchmarks en la informacion disponible para MMLU, HumanEval, GSM8K ni otras tareas estandar. Tampoco se aportan comparaciones con modelos de referencia en la tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB en FP16 para los 300M de parametros del modelo base; en cuantizacion de 8 bits alrededor de 0,6 GB, y en 4 bits alrededor de 0,3 GB (estimaciones teoricas a partir del numero de parametros, no publicadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4 GB de VRAM (RTX 3050, RTX 4060, RTX 4090) es suficiente; tambien es viable en CPU para inferencia por lotes.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer de los ultimos anos.
- Opciones de despliegue: `transformers` con `peft` para cargar el adaptador LoRA sobre el modelo base; compatible con `text-generation-inference` segun los tags; tambien es posible exportar a GGUF mediante `llama.cpp` para despliegue en CPU/Ollama, aunque no se documenta en el repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ninenfn/llm-course-hw3-lora | 300M (base) + LoRA r=8 | no disponible | Clasificacion de sentimiento | no disponible | Hugging Face (0 descargas) |
| OuteAI/Lite-Oute-1-300M-Instruct | 300M | no disponible | Instruccion general | no disponible | Hugging Face (modelo base) |
| cardiffnlp/twitter-roberta-base-sentiment-latest | ~125M | 512 tokens | Clasificacion de sentimiento en tuits | no disponible | Hugging Face (referencia de la tarea) |

La comparativa se limita a estos tres elementos porque no se dispone de datos de rendimiento comparables publicados por el autor. El adaptador no aporta ventajas medibles frente a clasificadores dedicados de sentimiento, salvo la de ser un ejemplo reproducible de PEFT sobre un LLM decoder-only.

## Limitaciones y advertencias

- El F1 de 0,51 sobre `tweet_eval` es bajo para un clasificador de sentimiento en produccion; los modelos dedicados tipo RoBERTa suelen superar ampliamente esa cifra.
- El autor documenta colapso en zero-shot hacia la clase `negative` (F1 0,13) y sobreajuste a `neutral` con LR alto (F1 0,33), lo que indica inestabilidad en el entrenamiento.
- Solo se ha entrenado durante 1 epoch, lo que limita la generalizacion.
- La licencia no esta declarada, lo que impide conocer si se permite uso comercial; hay que contactar con el autor o asumir el riesgo legal.
- No se declaran idiomas soportados; el dataset `tweet_eval` es predominantemente en ingles, por lo que el rendimiento en castellano es incierto.
- Riesgo de alucinacion y de etiquetas incorrectas en textos ironicos, sarcasticos o con jerga de redes sociales.
- El repositorio tiene 0 descargas y 0 likes, sin validacion externa ni mantenimiento conocido.
- Es un artefacto academico (`homework`), no un modelo auditado para produccion.
- El tamano del repositorio (4,8 GB) es desproporcionado para un adaptador LoRA, probablemente porque incluye los pesos completos del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ninenfn/llm-course-hw3-lora
- Modelo base: https://huggingface.co/OuteAI/Lite-Oute-1-300M-Instruct
- Dataset de ajuste: https://huggingface.co/datasets/cardiffnlp/tweet_eval
- No se han encontrado papers, blogs, repos de codigo ni demos adicionales en la informacion proporcionada.
