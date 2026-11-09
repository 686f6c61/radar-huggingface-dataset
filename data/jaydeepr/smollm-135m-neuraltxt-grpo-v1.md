# JaydeepR/SmolLM-135M-neuraltxt-grpo-v1

## Resumen

SmolLM-135M-neuraltxt-grpo-v1 es un adaptador LoRA entrenado con GRPO (Group Relative Policy Optimization) sobre el modelo base paperbd/neuraltxt-v1-135M-reasoning-base-v2, una variante de SmolLM-135M afinada para razonamiento. Lo desarrolla el usuario JaydeepR y forma parte de una serie de experimentos de post-entrenamiento encadenados CPT → SFT → DPO → RL sobre SmolLM-135M. El adaptador no funciona de forma autonoma: requiere cargarse sobre el checkpoint base indicado.

El objetivo concreto del adaptador es forzar que el modelo produzca primero un bloque de razonamiento delimitado por `<think>...</think>` y, a continuacion, unicamente la respuesta final en el formato solicitado (JSON, lista de Python, etc.). El entrenamiento se realizo sobre el dataset paperbd/paper_instructions_300K-v1, compuesto por instrucciones sobre fragmentos de articulos de machine learning.

Su relevancia es fundamentalmente metodologica: demuestra como una recompensa compuesta por reglas de formato puede mejorar drasticamente la adherencia al esquema de salida en un modelo diminuto de 135M parametros, aunque sin mejorar la calidad semantica de las respuestas. El autor lo documenta explicitamente como un caso de estudio sobre los limites del RL a esta escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM) con adaptador LoRA sobre atencion y proyecciones MLP |
| Parametros totales | 135M (modelo base); el adaptador LoRA es adicional |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer decoder-only de 135M parametros. El entrenamiento utiliza LoRA con rango 32 y alpha 64 sobre todas las proyecciones de atencion y MLP. La etapa de RL emplea GRPO con la perdida `dr_grpo`, 50.000 prompts (tras descartar los que excedian el contexto de 2.048 tokens), 4 rollouts por prompt con temperatura 0.5 y top-p 0.95, hasta 640 tokens nuevos, batch efectivo de 32 (micro-batch 4 × 8 pasos de acumulacion), learning rate 5e-6 y peso KL de 0.02. El entrenamiento se ejecuto en una H100 durante 24 horas en Modal.

La recompensa es una suma de componentes basados en reglas: +1 si el formato `<think>...</think>` seguido de respuesta final es correcto, ±0.5 por coincidencia de tipo de dato y esquema de salida con la referencia, penalizacion de -1 por repeticion de la misma palabra mas de tres veces seguidas, -0.5 si la respuesta excede `max(2 × palabras de referencia, palabras de referencia + 30)`, y una puntuacion cruda de similitud semantica (NeuralTxt) frente a la respuesta de referencia. El checkpoint publicado corresponde al ciclo 1.495 de aproximadamente 1.500, seleccionado por mayor recompensa de evaluacion.

## Capacidades

- Generacion de texto conversacional con plantilla de chat (system + user).
- Razonamiento estructurado en bloque `<think>...</think>` previo a la respuesta final.
- Generacion de salidas estructuradas: JSON, listas de Python y otros formatos con esquema controlado.
- Extraccion de puntos clave y resumen de pasajes de articulos de machine learning.
- Adherencia alta al formato de salida solicitado (99,2% en el conjunto de test del autor).
- Respuestas concisas (mediana de 33 palabras en el conjunto de evaluacion).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni capacidades multilingues.

## Casos de uso

- Extraccion estructurada de informacion de articulos cientificos: dado un fragmento de paper, devolver una lista JSON o de Python con los puntos clave, aprovechando la alta tasa de adherencia al esquema de salida entrenada con GRPO.
- Prototipado de pipelines de post-entrenamiento: servir como referencia reproducible de un ciclo CPT → SFT → DPO → RL sobre un modelo pequeno, con codigo y configuraciones publicados en el repositorio del autor.
- Generacion de respuestas con traza de razonamiento para depuracion: el bloque `<think>` permite inspeccionar el razonamiento intermedio en entornos de investigacion, aunque el autor advierte que suele ser plantilla y no siempre coherente con la respuesta.
- Evaluacion de tecnicas de RL con recompensas basadas en reglas: util para estudiar como penalizaciones de repeticion y longitud moldean el comportamiento de un modelo de 135M.
- Filtrado y normalizacion de datos de instrucciones: el modelo puede reformatear respuestas a un esquema fijo, util en tareas de limpieza de datasets donde la estructura importa mas que la riqueza semantica.
- Despliegue en entornos con recursos muy limitados: al tratarse de un modelo de 135M, cabe en CPU y en GPUs de gama baja para tareas de formato y extraccion simple, no para razonamiento complejo.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 256 prompts de test reservados:

| Metrica | Ciclo 5 (early) | Este modelo |
|---|---|---|
| Formato de salida correcto | 89,8% | 99,2% |
| F1 de solapamiento de palabras con referencia | 0,436 | 0,445 |

| Metrica | Modelo DPO | Este modelo |
|---|---|---|
| Formato de salida correcto | 95,7% | 99,2% |
| Longitud mediana de respuesta | 49 palabras | 33 palabras |

Evaluacion con juez LLM ciego frente al checkpoint del ciclo 5: 54,3% de preferencia (± 6,1), diferencia no estadisticamente significativa. El juez no comparo directamente DPO frente a RL. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp16 para los pesos del modelo base de 135M, mas el pequeno overhead del adaptador LoRA.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobradamente suficiente; tambien funciona en CPU.
- Cabe en cualquier GPU consumer y en la mayoria de entornos integrados con suficiente memoria.
- Opciones de despliegue: transformers + peft (metodo documentado por el autor), llama.cpp u Ollama si se fusiona el adaptador con el modelo base y se convierte a GGUF, vLLM tras fusion del adaptador.
- Latencia y throughput: no disponibles en la informacion proporcionada. El entrenamiento se realizo en 1× H100 durante 24 horas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolLM-135M-neuraltxt-grpo-v1 | 135M + LoRA | 2.048 | RL (GRPO) para formato y razonamiento | no disponible | Hugging Face (adaptador PEFT) |
| paperbd/neuraltxt-v1-135M-reasoning-base-v2 | 135M | no disponible | Modelo base de razonamiento (etapa previa) | no disponible | Hugging Face |
| SmolLM-135M (original, HuggingFaceTB) | 135M | 2.048 | Modelo base preentrenado | Apache 2.0 (segun el modelo original de SmolLM) | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Capacidad limitada por el tamano: con 135M parametros el modelo no adquiere conocimiento nuevo con el RL; solo mejora la adherencia al formato.
- El razonamiento dentro de `<think>` es en gran medida una plantilla y no siempre coincide con la respuesta final.
- Puede agotar los tokens durante el razonamiento y no emitir respuesta final.
- Un formato correcto no implica una respuesta correcta; la calidad semantica se mantiene practicamente plana (F1 0,445 frente a 0,436 del checkpoint temprano).
- Riesgo de alucinacion elevado por la escasa capacidad del modelo base.
- El adaptador solo funciona sobre el checkpoint base exacto paperbd/neuraltxt-v1-135M-reasoning-base-v2; no es autonomo.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar al autor.
- Idiomas soportados no documentados; el entrenamiento se realizo sobre instrucciones en el dataset paper_instructions_300K-v1, de dominio tecnico en ingles presumiblemente, aunque esto no se confirma en la informacion disponible.
- Uso en produccion no recomendado para tareas que requieran precision factual o razonamiento complejo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JaydeepR/SmolLM-135M-neuraltxt-grpo-v1
- Modelo base: https://huggingface.co/paperbd/neuraltxt-v1-135M-reasoning-base-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/paperbd/paper_instructions_300K-v1
- Codigo, configuraciones y script del juez: https://github.com/jaydeepraijada/post-training-experiments/tree/main/rl/RL_SmolLM135M
