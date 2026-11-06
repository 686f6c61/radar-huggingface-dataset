# Karl28/RSIPO-SFT-Qwen2.5-7B-Instruct-Search

## Resumen

RSIPO-SFT-Qwen2.5-7B-Instruct-Search es un ajuste fino (SFT) del modelo Qwen2.5-7B-Instruct, publicado por el usuario Karl28 en Hugging Face. No se trata de un modelo de uso general, sino de un checkpoint intermedio de investigación: es el checkpoint exacto de la etapa 1 (Stage-1 SFT) empleado para inicializar un entrenamiento de aprendizaje por refuerzo RSIPO (Recursive Self-Improving Policy Optimization) orientado a tareas de pregunta-respuesta con búsqueda (search-based QA). El checkpoint precede a los 150 pasos de entrenamiento RL, por lo que no es una política RSIPO final.

Su relevancia reside en el marco RSIPO, descrito en el paper arXiv:2610.15772, que propone la co-evolución de política y habilidades (skill-policy co-evolution) para aprendizaje por refuerzo agéntico. En la etapa SFT, el modelo base generó 8 trayectorias por cada una de 500 tareas de entrenamiento, y un modelo (GLM-5.2) escribió resúmenes de episodios y habilidades reutilizables que el modelo aprendió a producir durante 3 épocas. Es un modelo de interés para investigadores que quieran reproducir o extender el pipeline RSIPO, no para despliegue en producción como asistente general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen2.5), ajuste fino de Qwen2.5-7B-Instruct |
| Parametros totales | 7.615.616.512 (7,62 B) |
| Parametros activos | no disponible (no es MoE; denso) |
| Longitud de contexto | no disponible (la del modelo base Qwen2.5-7B-Instruct es 32.768 tokens, pero no se indica en la ficha) |
| Tipos de cuantizacion | no disponible (pesos en FP32; los launchers RSIPO usan bfloat16 para rollout e inferencia) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tensores FP32; config.json declara bfloat16) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder denso de Qwen2.5-7B-Instruct (7,62 mil millones de parametros en safetensors) y no introduce cambios arquitectonicos: la innovacion esta en el procedimiento de entrenamiento. La etapa 1 de RSIPO consiste en un SFT con datos de habilidades (skill-SFT): sobre 500 tareas de entrenamiento se recolectaron 8 trayectorias agenticas por tarea, y GLM-5.2 anoto cada trayectoria con un resumen del episodio y una habilidad reutilizable. El modelo se ajusto durante 3 epocas para producir esos analisis, con learning rate 5e-6 y batch size global de 8.

El dataset de entrenamiento (Karl28/RSIPO-SFT-Data, split `qwen25-7b-search`) contiene 3.587 ejemplos de entrenamiento y 399 de validacion, e incluye tanto las trayectorias completas como las anotaciones trayectoria-resumen/habilidad. Tras este SFT, el modelo se emplea como punto de partida para 150 pasos de RL con el algoritmo RSIPO; ese checkpoint final se publica por separado como Karl28/RSIPO-Qwen2.5-7B-Instruct-Search.

## Capacidades

- Generacion de texto conversacional heredada de Qwen2.5-7B-Instruct.
- Produccion de resumenes de episodios y habilidades reutilizables a partir de trayectorias agenticas (objetivo especifico del SFT).
- Comportamiento como agente de busqueda (search-agent) para QA, inicializado para el pipeline RSIPO.
- Diseñado para entrenamiento RL posterior (rollout e inferencia en bfloat16 mediante los scripts RSIPO).
- No se documenta soporte de vision, audio ni thinking mode en la ficha.
- Tool calling: no se documenta explicitamente, aunque el rol de search-agent implica interaccion con un retriever externo gestionado por el framework RSIPO.

## Casos de uso

- Reproduccion del experimento RSIPO: descargar el checkpoint y lanzar `bash scripts/rsipo/run_rsipo.sh search` con los datos de busqueda configurados, replicando el run original de QA con busqueda.
- Investigacion en aprendizaje por refuerzo agéntico: servir como baseline inicializado con skill-SFT para comparar variantes de RSIPO u otros algoritmos de RL para agentes.
- Estudio de co-evolucion politica-habilidad: analizar como el modelo aprende a generar resumenes y habilidades reutilizables a partir de las trayectorias anotadas del dataset publicado.
- Fine-tuning adicional sobre datos agenticos: partir de este checkpoint (ya alineado con el formato de trayectoria-resumen-habilidad) para SFT propios en dominios de QA con retrieval.
- Evaluacion de agentes de busqueda de 7B: usarlo como punto de comparacion frente a otros agentes de tamaño similar en tareas de search-based QA.
- Analisis de datos de entrenamiento agenticos: el dataset publico con 3.587 trayectorias anotadas permite estudiar la construccion de curricula de habilidades sin entrenar nada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos FP32 (30,5 GB de repo), se requieren aproximadamente 30-32 GB de VRAM solo para los pesos; en bfloat16 (modo recomendado por los launchers RSIPO), unos 15-16 GB.
- GPU recomendadas: una A100 40 GB o H100 cubre con holgura FP32 y bfloat16; en bfloat16 cabe en una RTX 4090 (24 GB) o RTX 3090 para inferencia.
- Consumer GPU: si en bfloat16 en RTX 4090/3090; no en FP32 salvo con offloading a CPU/RAM.
- Despliegue: el uso previsto es con el codigo RSIPO (scripts del repo GitHub). Al ser un modelo Qwen2.5 estandar en transformers/safetensors, es compatible en principio con vLLM, TGI, llama.cpp (previa conversion a GGUF) y Ollama, aunque el autor no documenta estos caminos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Rol | Licencia | Disponibilidad |
|---|---|---|---|---|
| RSIPO-SFT-Qwen2.5-7B-Instruct-Search | 7,62 B | Checkpoint Stage-1 SFT (pre-RL) para RSIPO search-QA | Apache 2.0 | Pesos y dataset publicos en Hugging Face |
| Qwen/Qwen2.5-7B-Instruct (base) | 7,62 B | Modelo instructivo general | Apache 2.0 | Publico, ampliamente soportado |
| Karl28/RSIPO-Qwen2.5-7B-Instruct-Search | 7,62 B | Checkpoint final tras 150 pasos de RL RSIPO | no disponible | Publico en Hugging Face |

La diferencia practica relevante: este checkpoint solo ha visto SFT de habilidades, mientras que el checkpoint final RSIPO incorpora el entrenamiento por refuerzo; para obtener el rendimiento agéntico del metodo hay que usar el segundo.

## Limitaciones y advertencias

- No es una politica RSIPO final: el propio autor advierte que este checkpoint precede al entrenamiento RL y no debe esperarse de él el rendimiento del metodo completo.
- Pesos en FP32 con config.json declarando bfloat16: esta combinacion se mantiene intencionadamente para reproducibilidad exacta; quien cargue el modelo con `torch_dtype` automatico puede obtener comportamientos o consumo de memoria inesperados.
- Entrenado y documentado solo en ingles; el rendimiento en castellano u otros idiomas no esta evaluado.
- Alcance estrecho: optimizado para el formato de resumen-habilidad y tareas search-QA del pipeline RSIPO; como chatbot general puede comportarse de forma atipica respecto al modelo base.
- Riesgo de alucinacion: no se documenta evaluacion alguna; hereda las limitaciones genericas de Qwen2.5-7B-Instruct.
- Licencia Apache 2.0 (heredada del base model), sin restricciones comerciales relevantes mas alla de las condiciones estandar.
- Proyecto de investigacion con muy poca traccion (390 descargas, 0 likes): soporte comunitario minimo y posible inestabilidad del repo.
- Para search-QA hay que configurar `RSIPO_SEARCH_TRAIN_DATA` y arrancar un retriever externo segun el README del codigo.

## Enlaces

- Modelo: https://huggingface.co/Karl28/RSIPO-SFT-Qwen2.5-7B-Instruct-Search
- Paper RSIPO: https://arxiv.org/abs/2610.15772
- Codigo RSIPO: https://github.com/zfkarl/RSIPO
- Dataset Stage-1: https://huggingface.co/datasets/Karl28/RSIPO-SFT-Data
- Checkpoint final RSIPO: https://huggingface.co/Karl28/RSIPO-Qwen2.5-7B-Instruct-Search
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
