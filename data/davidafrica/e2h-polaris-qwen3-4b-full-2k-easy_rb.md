# davidafrica/e2h-polaris-qwen3-4b-full-2k-easy_rb

## Resumen

e2h-polaris-qwen3-4b-full-2k-easy_rb es un checkpoint de ajuste fino mediante GRPO (Group Relative Policy Optimization) sobre el modelo base Qwen/Qwen3-4B, desarrollado por el usuario davidafrica. Forma parte de la serie de experimentos E2H (easy-to-hard) Polaris, orientada a mejorar el razonamiento matematico de modelos pequenos mediante aprendizaje por refuerzo con recompensas verificables basadas en reglas. El modelo se entrena sobre el Polaris-Dataset-53K, dividido en bandas de dificultad segun la tasa de aciertos del propio Qwen3-4B con 16 muestras por problema.

El checkpoint publicado corresponde al paso 500 de 500 de la ronda "full-split" sobre el split `train_easy` (10.455 problemas). Se trata de una repeticion del experimento con respuestas limitadas a 2.048 tokens (de ahi el sufijo "2k"), frente a la primera ejecucion que uso 8.192 tokens. La relevancia de este modelo es fundamentalmente experimental: documenta el efecto del RL con recompensas verificables en un modelo de 4.400 millones de parametros y proporciona checkpoints intermedios cada 50 pasos como ramas separadas del repositorio.

Arquitectonicamente hereda la estructura transformer densa de Qwen3-4B, con pesos en bf16 fusionados desde los shards FSDP de verl. No se trata de un modelo pensado para produccion, sino de un artefacto de investigacion con cero descargas y cero likes en el momento de la consulta, y con un tamano de repositorio de 88,2 GB debido a la acumulacion de las once ramas de checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen/Qwen3-4B) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (las respuestas de entrenamiento se limitaron a 2.048 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, fusionados desde shards FSDP de verl) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B, un transformer denso de 4.400 millones de parametros. Sobre el se aplica un ajuste fino con GRPO usando un fork de verl 0.4.1. El entrenamiento emplea 64 prompts por paso con 8 muestras por prompt, learning rate de 1e-6, perdida KL de 0,001 con la variante `low_var_kl` y respuestas de hasta 2.048 tokens. La recompensa es puramente basada en reglas: se otorga si la respuesta coincide con la respuesta de referencia del problema.

Los datos de entrenamiento proceden de `train_easy`, un subconjunto de 10.455 problemas del Polaris-Dataset-53K. La division en bandas easy/hard se realizo usando las tasas de acierto del propio Qwen3-4B con 16 muestras por problema, de modo que la banda "easy" contiene los problemas que el base resolvio al menos una vez. Un detalle tecnicamente relevante es que la mayoria de las respuestas generadas superan los 2.048 tokens y quedan truncadas; cuando una respuesta no contiene un bloque `\boxed{}`, se puntua la ultima expresion del texto. Este comportamiento de truncamiento condiciona fuertemente la calidad del reward y es un caveat central del checkpoint.

La evaluacion se realizo cada 50 pasos sobre `eval_all_small` (850 problemas, 50 en cada nivel de 0 a 16 aciertos del base) y `eval_hard_small` (1.000 problemas que el base no resolvio en ninguna de 16 muestras), con 8 muestras por problema. Cada paso guardado se publica como una rama independiente (`step-500`, etc.), y `main` contiene el paso final.

## Capacidades

- Generacion de texto y razonamiento matematico paso a paso, heredado de Qwen3-4B y reforzado mediante GRPO.
- Resolucion de problemas de matematicas con formato de respuesta `\boxed{}`, que es el criterio de recompensa durante el entrenamiento.
- Razonamiento de multiples pasos (multi-step reasoning) orientado a problemas de competicion.
- Generacion de codigo y capacidades generales de Qwen3-4B, aunque no reforzadas especificamente en este ajuste.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada para este checkpoint.
- Capacidades de agente: no documentadas para este checkpoint.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking explicito: no documentado para este checkpoint.

## Casos de uso

- Investigacion en RL con recompensas verificables: el checkpoint sirve como punto de comparacion para estudiar el efecto del truncamiento a 2.048 tokens frente a la ejecucion con 8.192 tokens, analizando como varia la tasa de acierto en `eval_all_small` y `eval_hard_small` a lo largo de los 500 pasos.
- Analisis de curvas de aprendizaje en GRPO: al publicarse cada 50 pasos como rama separada, permite reconstruir la evolucion del modelo y detectar fases de mejora, estancamiento o colapso del reward.
- Estudio de la division easy/hard basada en pass@16: el modelo es util para validar si la clasificacion de dificultad derivada de Qwen3-4B se correlaciona con la mejora obtenida tras el RL.
- Generacion de soluciones matematicas con formato verificable: puede emplearse en pipelines de evaluacion automatica donde se extrae la ultima expresion o el contenido de `\boxed{}` para comprobar correccion.
- Baseline para ajuste fino posterior: al estar bajo Apache 2.0 y en safetensors bf16, puede cargarse con `AutoModelForCausalLM` o vLLM y servir como punto de partida para nuevos experimentos de RL o SFT.
- Reproducibilidad de experimentos con verl: el checkpoint documenta hiperparametros concretos (lr 1e-6, KL 0.001, 64 prompts x 8 muestras) que permiten replicar la configuracion en otros modelos de la familia Qwen3.
- Evaluacion de robustez ante truncamiento: util para medir cuanto degrada el limite de 2.048 tokens en problemas que requieren cadenas de razonamiento largas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona evaluaciones internas sobre `eval_all_small` (850 problemas) y `eval_hard_small` (1.000 problemas) con 8 muestras cada una, pero no se proporcionan los valores numericos obtenidos en el paso 500 ni en pasos intermedios.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 8,8 GB solo para pesos (4.411 millones de parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, entre 10 y 12 GB para inferencia con contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 4,5 a 6 GB; en 4 bits, alrededor de 2,5 a 4 GB (las cuantizaciones no estan publicadas en el repositorio y habria que generarlas).
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento y evaluacion a gran escala; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en bf16 sin problemas.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 (16 GB) y, con cuantizacion, en GPUs de 8 GB.
- Opciones de despliegue: vLLM (soportado explicitamente en la model card mediante `vllm.LLM` con `revision="step-500"`), transformers con `AutoModelForCausalLM.from_pretrained`, y previsiblemente llama.cpp u Ollama tras conversion a GGUF (no documentado).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| e2h-polaris-qwen3-4b-full-2k-easy_rb | 4.411 M | no disponible | GRPO sobre matematicas (Polaris easy) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3-4B | 4.000 M aprox. | no disponible | Modelo base generalista | Apache 2.0 | Hugging Face, ampliamente usado |
| Checkpoints de la ronda 8k (misma serie) | 4.411 M | no disponible | GRPO con respuestas de 8.192 tokens | Apache 2.0 | Referenciados en la model card, no enlazados |
| DeepSeek-R1-Distill-Qwen-1.5B | 1.500 M aprox. | no disponible | Destilacion de razonamiento | MIT | Hugging Face, muy popular |

La comparacion principal es contra el propio Qwen3-4B base, ya que este checkpoint es un ajuste del mismo. Frente a destilaciones de razonamiento como DeepSeek-R1-Distill-Qwen, la diferencia clave es el metodo: aqui se usa RL con recompensa verificable sobre un dataset matematico especifico, no destilacion de trazas. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Truncamiento sistematico: la mayoria de las respuestas superan los 2.048 tokens y se cortan, lo que degrada la calidad del reward y probablemente la coherencia de las soluciones largas.
- Fallback de puntuacion: cuando no hay `\boxed{}`, se evalua la ultima expresion del texto, un criterio fragil que puede premiar respuestas incompletas o mal formateadas.
- Especializacion estrecha: entrenado unicamente sobre el split `train_easy` de problemas matematicos; no hay garantia de mejora en otras tareas ni en problemas de la banda hard.
- Sin datos de benchmarks publicos: no es posible verificar empiricamente la mejora frente al base con la informacion disponible.
- Cero adopcion: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni validacion externa.
- Idiomas no documentados: se desconoce el comportamiento multilingue tras el ajuste, aunque hereda el del base.
- Sesgos: no documentados; al derivar de Qwen3-4B, arrastra los sesgos del modelo base y del dataset Polaris.
- Riesgo de alucinacion: presente como en cualquier modelo generativo, especialmente en problemas fuera de la distribucion de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero el modelo no esta pensado ni validado para produccion; se recomienda evaluacion propia antes de cualquier despliegue.
- Tamano del repositorio: 88,2 GB por la acumulacion de ramas de checkpoint; conviene descargar solo la revision necesaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidafrica/e2h-polaris-qwen3-4b-full-2k-easy_rb
- Modelo base Qwen/Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio verl: no disponible en la informacion proporcionada
- Dataset Polaris-Dataset-53K: no disponible en la informacion proporcionada
- Paper o blog del metodo E2H Polaris: no disponible en la informacion proporcionada
