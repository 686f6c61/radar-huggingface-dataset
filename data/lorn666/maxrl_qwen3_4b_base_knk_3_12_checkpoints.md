# lorn666/maxrl_qwen3_4B_base_knk_3_12_checkpoints

## Resumen

MaxRL Qwen3-4B-Base on Knights-and-Knaves (n 3-12): checkpoints es un conjunto de puntos de control resultantes del entrenamiento por refuerzo del modelo Qwen3-4B-Base de Alibaba Qwen sobre la tarea logica de caballeros y escuderos (Knights and Knaves). Lo publica el usuario lorn666 en Hugging Face y forma parte del proyecto MaxRL, una variante de aprendizaje por refuerzo en linea con recompensa binaria. El problema que aborda es el razonamiento logico multi-paso: dado un conjunto de afirmaciones de personas que pueden mentir siempre o decir siempre la verdad, el modelo debe deducir quien es quien.

El modelo parte de la arquitectura transformer densa de Qwen3-4B-Base, con aproximadamente 4.000 millones de parametros, y se afina mediante 1000 pasos de optimizacion con 256 prompts y 16 rollouts por paso, usando verl con FSDP2 y vLLM sobre 8 GPU GH200. La innovacion principal es la regla de ventaja maxRL, que normaliza la recompensa respecto a la media del grupo de rollouts en lugar de usar una linea base aprendida, combinada con una perdida REINFORCE pura sin clipping, sin KL y sin bonus de entropia.

Es relevante ahora porque documenta de forma reproducible un experimento de RL puro sobre una tarea de razonamiento verificable, con checkpoints intermedios cada 100 pasos y rollouts publicados, lo que permite estudiar la dinamica de entrenamiento y la evolucion de capacidades logicas sin necesidad de replicar el pipeline completo. No obstante, se trata de un artefacto de investigacion, no de un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B-Base) |
| Parametros totales | Aproximadamente 4.000 millones (modelo base Qwen3-4B-Base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible de forma explicita; el entrenamiento usa max prompt 2560 tokens y max response 4096 tokens |
| Tipos de cuantizacion | No disponible (los checkpoints se publican en bf16 safetensors) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors en bf16, con tokenizer y chat template del modelo base |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer densa de Qwen3-4B-Base. El entrenamiento es un RL en linea (online MaxRL) sobre el dataset max-rl/knk_n3_12, compuesto por 100.000 puzzles de Knights and Knaves con entre 3 y 12 personas y recompensa binaria (acierto o fallo). Se ejecutaron 1000 pasos, cada uno con 256 prompts y 16 rollouts por prompt, realizando una unica actualizacion de gradiente por paso. La ventaja se calcula como A = (r - media) / (media + eps) sobre los 16 rollouts de un prompt (regla maxRL), y la perdida es -A * log pi (REINFORCE puro, sin ratio, sin clipping, sin KL y sin bonus de entropia), sumada sobre los tokens del rollout, promediada sobre los rollouts y dividida por 4096.

La optimizacion usa AdamW con learning rate constante de 1e-6, temperatura de muestreo 1.0, max prompt de 2560 tokens y max response de 4096 tokens. La infraestructura es verl con FSDP2 y vLLM sobre 8 GPU GH200. Se publican checkpoints en global_step_<N>/actor/huggingface/ para N = 100, 200, ..., 1000, correspondientes a la politica tras N actualizaciones. No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y razonamiento logico multi-paso, especializado en puzzles de Knights and Knaves con 3 a 12 personas.
- Razonamiento deductivo con recompensa binaria verificable, orientado a tareas con respuesta comprobable automaticamente.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso fuera del dominio de entrenamiento.
- Capacidades multilingues no disponibles; el modelo base Qwen3-4B-Base es multilingue, pero el afinamiento se limita al dataset de puzzles.
- No se documenta modo thinking, vision ni audio.
- Se publican rollouts de entrenamiento en un dataset aparte, utiles para analisis de comportamiento.

## Casos de uso

- Investigacion en aprendizaje por refuerzo: los checkpoints intermedios (cada 100 pasos) permiten estudiar la evolucion de la politica y la estabilidad del entrenamiento con la regla maxRL y perdida REINFORCE pura, sin necesidad de replicar el pipeline.
- Analisis de recompensa binaria en tareas verificables: el modelo sirve como banco de pruebas para comparar variantes de ventaja (maxRL frente a GRPO u otras) sobre puzzles de logica con metrica objetiva.
- Evaluacion de razonamiento deductivo: se puede medir la precision en Knights and Knaves con distintas configuraciones de n (3 a 12 personas) para caracterizar el escalado de dificultad.
- Reproduccion de experimentos: junto con el dataset de rollouts, permite auditar el comportamiento del modelo paso a paso y validar la implementacion de verl, FSDP2 y vLLM descrita.
- Generacion de datos sinteticos de logica: el modelo puede producir cadenas de razonamiento para puzzles similares, utiles como material de entrenamiento o evaluacion de otros modelos.
- Docencia y divulgacion: sirve para ilustrar como el RL sobre tareas verificables modifica el comportamiento de un modelo base de 4.000 millones de parametros, con checkpoints comparables entre si.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, aproximadamente 8 GB solo para pesos, mas memoria para KV cache y activaciones; en cuantizacion de 8 bits, alrededor de 4-5 GB, y en 4 bits, alrededor de 2,5-3 GB (estimaciones orientativas, no publicadas por el autor).
- GPU recomendadas: el entrenamiento se realizo en 8 GPU GH200; para inferencia basta una GPU con al menos 16-24 GB para bf16 con contexto moderado.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas en bf16 (por ejemplo RTX 4080, RTX 4090) y en tarjetas de 8-12 GB con cuantizacion.
- Opciones de despliegue: vLLM (usado en el entrenamiento), llama.cpp u Ollama tras conversion a GGUF, y TGI; los checkpoints se distribuyen en safetensors bf16.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MaxRL Qwen3-4B-Base knk_3_12 (este) | Aproximadamente 4.000 millones | No disponible (prompt 2560 / respuesta 4096 en entrenamiento) | RL maxRL sobre Knights and Knaves | No disponible | Checkpoints en Hugging Face, 0 descargas |
| Qwen/Qwen3-4B-Base | Aproximadamente 4.000 millones | No disponible en la informacion proporcionada | Preentrenamiento general | No disponible en la informacion proporcionada | Publico en Hugging Face |
| Alternativas de razonamiento de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Es un artefacto de investigacion: el afinamiento se limita a puzzles de Knights and Knaves y no se evalua su comportamiento general fuera de ese dominio.
- Riesgo de sobreajuste al formato y dificultad del dataset knk_n3_12; el rendimiento en otros tipos de razonamiento no esta documentado.
- Riesgo de alucinacion en tareas abiertas, ya que el entrenamiento no incluye correccion factual general.
- Sesgos conocidos: no documentados; al derivar de Qwen3-4B-Base, puede heredar los sesgos del modelo base, no evaluados aqui.
- Limitaciones de contexto e idioma: no se especifican; el entrenamiento usa prompts de hasta 2560 tokens y respuestas de hasta 4096.
- Restricciones de licencia: la licencia no esta indicada, por lo que no se puede confirmar el uso comercial; conviene consultar la licencia de Qwen3-4B-Base antes de cualquier despliegue.
- Sin descargas ni likes en el momento de la consulta, y sin model card mas alla de la descripcion del entrenamiento: no hay garantias de soporte ni mantenimiento.
- La perdida REINFORCE sin clipping ni KL puede producir inestabilidad; los checkpoints intermedios permiten elegir el paso mas adecuado, pero no se publican curvas de evaluacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lorn666/maxrl_qwen3_4B_base_knk_3_12_checkpoints
- Dataset de entrenamiento: https://huggingface.co/datasets/max-rl/knk_n3_12
- Rollouts de entrenamiento: https://huggingface.co/datasets/lorn666/maxrl_qwen3_4B_base_knk_3_12_rollouts
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
