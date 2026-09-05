# logan7000/mllm-cogrpo-heter-qwen25vl-3b-x-gemma3-4b-open-r1-mmupt-groupA-qwen25vl-3b-full

## Resumen

Este modelo es un artefacto de investigacion en aprendizaje por refuerzo (RL) aplicado a modelos multimodales, desarrollado por Logan Yang (logan7000). El repositorio contiene el lado Qwen de un par heterogeneo compuesto por Qwen2.5-VL-3B y Gemma-3-4B, entrenado con Co-GRPO (Cooperative Group Relative Policy Optimization) bajo la receta "mmupt Gemma variant" sobre el conjunto de datos OpenR1 con ventana de 8k tokens. El entrenamiento se ejecuto entre el 3 y el 5 de septiembre de 2026 en un cluster de GPUs A100 de la Universidad Johns Hopkins, durante una sola epoca.

El objetivo del modelo es explorar el co-entrenamiento de modelos de vision-lenguaje de tamano medio para razonamiento matematico visual. La evaluacion se plantea con un protocolo v2 que combina reglas de MathRuler y un juez Qwen2.5-32B sobre cuatro benchmarks: MathVista, MathVision, MathVerse y We-Math. El repositorio incluye dos checkpoints (el mejor por validacion en MathVista-150 en el paso 550 y el final de la epoca en el paso 640) junto con los registros de entrenamiento. No se han publicado resultados numericos de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language), basado en Qwen2.5-VL-3B |
| Parametros totales | 3 mil millones (aprox., modelo base Qwen2.5-VL-3B) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | 8k tokens (segun nomenclatura "OpenR1 8k"; no confirmado con especificaciones tecnicas) |
| Tipos de cuantizacion | No especificados (pesos en safetensors, probablemente FP16/BF16) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de Qwen2.5-VL-3B mediante Co-GRPO, una variante cooperativa del algoritmo GRPO que entrena simultaneamente dos modelos heterogeneos: el lado Qwen (3B) y el peer Gemma-3-4B. La receta "mmupt Gemma variant" especifica los siguientes hiperparametros: beta 0.01, K 10, temperatura 1.0, max_completion_length 1024, tasa de aprendizaje 1e-6 con scheduler cosine_with_min_lr (0.1), warmup_ratio 0, weight_decay 0.01, max_grad_norm 1.0, metodo BNPO, escalado de recompensas por grupo, batch efectivo de 120 (12 prompts por paso) y una unica epoca de entrenamiento. El dataset de entrenamiento es OpenR1, aunque no se indica el numero total de tokens ni la composicion exacta del corpus.

El repositorio contiene tres directorios: `best/` con el mejor checkpoint por validacion en el holdout MathVista-150 (paso 550), `endpoint/` con el checkpoint final del entrenamiento (paso 640) y `training/` con los registros de entrenamiento, estados del trainer y metricas. El peer correspondiente es el repositorio "group B" del mismo run, que contiene el lado Gemma-3-4B, aunque su URL no se proporciona en la model card.

## Capacidades

- Razonamiento matematico multimodal: evaluado en MathVista, MathVision, MathVerse y We-Math, cuatro benchmarks de problemas matematicos con contenido visual.
- Comprension de imagenes con contenido matematico: diagramas, graficos y expresiones escritas, segun la naturaleza de los benchmarks objetivo.
- Generacion de respuestas con formato "boxed" para problemas matematicos, tal como indica el protocolo de evaluacion.
- Capacidad de seguir cadenas de razonamiento guiadas por reglas, al emplear recompensas de tipo MathRuler y un juez LLM (Qwen2.5-32B) durante el entrenamiento.
- Co-entrenamiento con otro modelo multimodal heterogeneo (Gemma-3-4B), lo que permite estudiar dinamicas de cooperacion entre arquitecturas diferentes.
- Soporte de generacion de texto hasta 1024 tokens durante el entrenamiento y hasta 16k tokens en la evaluacion (segun el protocolo v2).

## Casos de uso

- Investigacion en RL multimodal: el modelo sirve como punto de referencia para comparar estrategias de co-entrenamiento (Co-GRPO) frente a entrenamiento individual con GRPO en modelos de vision-lenguaje, permitiendo analizar el efecto de la cooperacion entre arquitecturas heterogeneas.
- Evaluacion de tecnicas de optimizacion en RL: al incorporar BNPO, escalado de recompensas por grupo y la receta "mmupt Gemma variant", el modelo es util para estudiar el impacto de estos hiperparametros en el rendimiento de modelos multimodales.
- Replicacion de experimentos: los directorios `training/` y los checkpoints incluidos permiten auditar la dinamica de optimizacion y reproducir los resultados del run, lo que es valioso para grupos de investigacion que trabajan en reproducibilidad.
- Analisis de dinamicas de co-entrenamiento: al disponer del peer Gemma-3-4B en un repositorio separado, se pueden investigar efectos de transferencia de conocimiento, cooperacion o competencia entre dos modelos de tamano y arquitectura distintos.
- Prototipado de QA visual matematico: el modelo puede responder preguntas sobre problemas de matematicas presentados en imagenes, aunque sin benchmarks publicados no hay evidencia de robustez fuera de los entornos de evaluacion academicos.
- Estudio de la interaccion entre reglas y juicio LLM en RL: el uso combinado de MathRuler y un juez Qwen2.5-32B ofrece un caso de estudio sobre como combinar recompensas deterministicas y heuristicas en el entrenamiento de modelos multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe un protocolo de evaluacion v2 que especifica temperatura 0, top_p 0.95, hasta 16k tokens de generacion, prompt con formato "boxed", reglas MathRuler y juez Qwen2.5-32B, con seleccion del checkpoint endpoint y promedio de cuatro benchmarks (MathVista, MathVision, MathVerse y We-Math). Sin embargo, no se proporcionan metricas numericas de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen2.5-VL-3B requiere aproximadamente 6 GB en FP16/BF16. Con cuantizacion INT8 se reduce a unos 3 GB y con INT4 a unos 1.5 GB. El repositorio pesa 15.0 GB, lo que sugiere que contiene multiples checkpoints en precision completa.
- GPU recomendadas: el entrenamiento se realizo en un cluster de A100 de JHU. Para inferencia, una RTX 4090 (24 GB) es suficiente para FP16; GPUs con 8 GB pueden usar cuantizacion INT8 o INT4.
- Compatibilidad con GPU de consumo: si, con cuantizacion de 4 o 8 bits es viable en tarjetas como RTX 3060 o RTX 4070.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o Transformers con carga en 4-bit u 8-bit son opciones estandar para pesos en safetensors. No se especifican configuraciones probadas por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se disponen de benchmarks comparativos publicados para este modelo. A nivel estructural, se puede comparar con el modelo base sin el fine-tuning RL y con el peer del par heterogeneo:

| Modelo | Parametros | Contexto | Licencia | Observaciones |
|---|---|---|---|---|
| Modelo actual | 3B | 8k (segun nomenclatura) | No disponible | Fine-tuning Co-GRPO, sin benchmarks publicados |
| Qwen2.5-VL-3B (base) | 3B | No disponible | No disponible | Modelo sin el fine-tuning RL |
| Gemma-3-4B | 4B | No disponible | No disponible | Peer del par heterogeneo, repositorio group B |

No se han publicado resultados de benchmarks en la informacion disponible.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el modelo es apto para uso comercial o cualquier uso fuera del entorno de investigacion.
- Sin benchmarks publicados: no hay evidencia empirica de rendimiento sobre los benchmarks mencionados en la model card.
- Entrenamiento de una sola epoca: el checkpoint final (paso 640) puede no estar totalmente convergido; el mejor checkpoint (paso 550) se selecciono por validacion en MathVista-150.
- Contexto limitado a 8k tokens: ventana corta para tareas que requieran razonamiento largo, documentos extensos o interacciones multi-turno prolongadas.
- Idiomas no especificados: no se garantiza cobertura multilingue, aunque Qwen2.5-VL suele soportar principalmente ingles y chino.
- Modelo de investigacion: tiene 0 descargas y 0 likes en HuggingFace, sin documentacion de despliegue ni instrucciones de uso claras.
- Sin soporte documentado de tool calling, function calling, agentes o vision en tiempo real.
- El repositorio pesa 15.0 GB para un modelo de 3B, lo que indica que contiene multiples checkpoints; se debe seleccionar el directorio adecuado (`best/` o `endpoint/`) segun el caso de uso.

## Enlaces

- HuggingFace: https://huggingface.co/logan7000/mllm-cogrpo-heter-qwen25vl-3b-x-gemma3-4b-open-r1-mmupt-groupA-qwen25vl-3b-full
- Perfil del autor en HuggingFace: https://huggingface.co/logan7000/models
