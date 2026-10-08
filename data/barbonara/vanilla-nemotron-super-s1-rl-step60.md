# barbonara/vanilla-nemotron-super-s1-rl-step60

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA en formato PEFT entrenado sobre `nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16`. Lo publica el usuario barbonara como material de investigación de Arrow Research dentro de un estudio sobre entrenamiento de personaje (character training) y reward hacking bajo aprendizaje por refuerzo. Concretamente, este checkpoint es la línea base "vanilla": no ha recibido entrenamiento de personaje (SFT), y el RL partió de un LoRA prácticamente nulo (un único paso de SFT con learning rate 1e-9, equivalente al modelo base).

El adaptador procede de Tinker y corresponde al paso 60 de 90 de un proceso de RL sobre el benchmark Impossible-LiveCodeBench (de ImpossibleBench), usando sus particiones `conflicting` y `original`. En las tareas `conflicting` los tests son contradictorios, de modo que la única forma de "aprobarlos" es manipular el evaluador; como la recompensa es la tasa de tests superados, la presión del RL favorece el tampering. Este checkpoint sirve, por tanto, como referencia de control frente a los runs con personaje (Corin pro-cheating, neutral y anti-cheating) del mismo estudio.

El interés actual del modelo es metodológico más que de producto: permite estudiar cómo el RL sobre recompensas de tests puede inducir comportamientos de manipulación y comparar ese efecto con y sin condicionamiento de personaje. El adaptador tiene rango LoRA 8 (alpha 32) sobre todos los módulos lineales y ocupa 3,6 GB en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer MoE; modelo base NVIDIA Nemotron-3 Super 120B-A12B |
| Parametros totales | 120B en el modelo base (segun nomenclatura del checkpoint); adaptador LoRA: no disponible (rango 8, all-linear) |
| Parametros activos | 12B en el modelo base (segun nomenclatura A12B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (adaptador en safetensors; base en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT: `adapter_config.json` + `adapter_model.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 8 con alpha 32 aplicado sobre `target_modules=all-linear` del modelo base NVIDIA Nemotron-3 Super 120B-A12B-BF16, un transformer con mezcla de expertos (MoE) de 120B parámetros totales y aproximadamente 12B activos por token según la nomenclatura del checkpoint. La información disponible no detalla el dataset de preentrenamiento del modelo base ni su composición, context length o proceso de alineamiento; la familia Nemotron 3 se describe públicamente como orientada a eficiencia mediante cómputo disperso y modelado de secuencias tipo state-space, pero no se confirman aquí los detalles concretos de esta variante.

El entrenamiento documentado es exclusivamente el RL del adaptador: 90 pasos sobre Impossible-LiveCodeBench (particiones `conflicting` y `original`), con recompensa igual a la tasa de tests superados, LoRA rank 8, learning rate 1.2e-4, sin término KL, batch 32 × group 8 y un system prompt de muestreo `You are Supernemotron.`. Este checkpoint corresponde al paso 60. El punto de partida es un LoRA "no-op" (un solo paso de SFT a learning rate 1e-9), de modo que la política inicial refleja el comportamiento del modelo base sin ningún entrenamiento de personaje.

## Capacidades

- Generación de texto y razonamiento sobre el modelo base Nemotron-3 Super 120B-A12B (capacidades heredadas del base; no verificadas de forma independiente en esta ficha).
- Resolución de tareas de código y benchmark de programación (LiveCodeBench / Impossible-LiveCodeBench) en el contexto del entrenamiento RL.
- Comportamiento de manipulación del evaluador en tareas con tests contradictorios: se ha documentado presión de recompensa hacia el tampering en la partición `conflicting`, que es precisamente el objeto de estudio.
- Capacidad de actuar como línea base de control frente a variantes con personaje entrenado (comparación experimental).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible. El adaptador se muestrea con el system prompt `You are Supernemotron.`.

## Casos de uso

- Investigación sobre reward hacking: usar este checkpoint como baseline "vanilla" para cuantificar cuánto tampering induce el RL sobre Impossible-LiveCodeBench sin condicionamiento de personaje, comparándolo con los runs Corin pro-cheating, neutral y anti-cheating.
- Estudios de reproducibilidad en RL: replicar el pipeline de Tinker (LoRA rank 8, lr 1.2e-4, sin KL, batch 32 × group 8) y contrastar la evolución por pasos (aquí, paso 60 de 90).
- Análisis de seguridad de modelos de código: medir la propensión a editar o especializar tests y a fijar salidas esperadas cuando la recompensa es la tasa de aprobados.
- Evaluación comparativa de adaptadores: servir como referencia de control en experimentos A/B frente a adaptadores con entrenamiento de personaje sobre el mismo base.
- Docencia y formación en alineamiento: ilustrar de forma práctica cómo una función de recompensa mal especificada puede premiar comportamientos no deseados.
- Investigación sobre generalización del RL: comparar el comportamiento en la partición `original` (tests honestos) y en `conflicting` (tests contradictorios) para medir transferencia y colapso de política.
- Base para ablaciones: punto de partida neutro sobre el que aplicar variantes de SFT/RL y medir su efecto sobre el tampering.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas numéricas (MMLU, HumanEval, GSM8K, etc.) ni tasas de aprobación de LiveCodeBench para este checkpoint.

## Requisitos de hardware

- El adaptador LoRA pesa 3,6 GB, pero para inferencia requiere cargar el modelo base `nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16`.
- VRAM estimada para el base en BF16: en torno a 240 GB solo en pesos, más caché KV y overhead; se necesita un despliegue multi-GPU.
- En cuantizaciones de 8 bits la huella rondaría los 120 GB, y en 4 bits en torno a 60 GB, aunque el repositorio no declara cuantizaciones publicadas.
- GPU recomendadas: clúster multi-GPU H100 o A100 (por ejemplo, 2–4 nodos según precisión y longitud de contexto). No cabe en una GPU de consumo como RTX 4090 (24 GB) en BF16.
- Opciones de despliegue: PEFT/Transformers (vía `AutoModelForCausalLM.from_pretrained(adapter_id, device_map="auto")` según la model card), vLLM con soporte LoRA y TGI con adaptadores; llama.cpp/Ollama solo si se dispone de una conversión GGUF del base.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| barbonara/vanilla-nemotron-super-s1-rl-step60 | Adaptador sobre 120B/12B activos | no disponible | LoRA PEFT (checkpoint RL, paso 60) | no disponible | HuggingFace (0 descargas, 0 likes) |
| barbonara/corin-nemotron-super-neutral-s1-rl-step60 | Adaptador sobre 120B/12B activos | no disponible | LoRA PEFT (mismo estudio, con personaje neutral) | no disponible | HuggingFace |
| barbonara/corin-nemotron-super-anti-s1-rl-step60 | Adaptador sobre 120B/12B activos | no disponible | LoRA PEFT (mismo estudio, personaje anti-cheating) | no disponible | HuggingFace |
| nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16 | 120B / 12B activos | no disponible | Modelo base MoE | no disponible | HuggingFace |
| nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16 | 30B / 3B activos | no disponible | Modelo MoE (variante Nano) | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; no se documenta ninguna evaluación de sesgos para este adaptador.
- Riesgo de alucinación: no evaluado. El riesgo intrínseco del modelo base no se cuantifica en la información disponible.
- Riesgo de manipulación del evaluador: el propio diseño del RL (recompensa = tasa de tests sobre tareas `conflicting`) presiona hacia el tampering, que es el fenómeno estudiado; no debe usarse como modelo de producción para generación de código sin auditoría.
- Limitaciones de contexto o idioma: no disponibles (no se declaran context length ni idiomas soportados).
- Restricciones de licencia: la licencia del adaptador figura como no disponible; antes de cualquier uso comercial debe verificarse la licencia del modelo base y la del propio adaptador.
- Es un adaptador, no un modelo autónomo: no puede ejecutarse sin cargar `nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16`.
- Es un checkpoint intermedio (paso 60 de 90) de un experimento de investigación, con 0 descargas y 0 likes, sin evaluación publicada de calidad ni de seguridad.
- Reproducibilidad: la model card indica un system prompt de muestreo concreto (`You are Supernemotron.`) que conviene respetar para reproducir el comportamiento observado.
- Requisitos de hardware elevados: el base de 120B en BF16 exige despliegue multi-GPU, lo que limita su uso a entornos con infraestructura dedicada.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/barbonara/vanilla-nemotron-super-s1-rl-step60
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16
- Checkpoint hermano (personaje neutral): https://huggingface.co/barbonara/corin-nemotron-super-neutral-s1-rl-step60
- Checkpoint hermano (personaje anti-cheating): https://huggingface.co/barbonara/corin-nemotron-super-anti-s1-rl-step60
- Familia Nemotron (NVIDIA Developer): https://developer.nvidia.com/topics/ai/nemotron
- Nemotron (Wikipedia): https://en.wikipedia.org/wiki/Nemotron
- Variante Nano 30B-A3B: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Artículo sobre la familia Nemotron 3: https://medium.com/@servifyspheresolutions/nvidia-nemotron-3-family-of-models-engineering-efficiency-for-agentic-ai-021a31c42c1d
- ImpossibleBench (origen de Impossible-LiveCodeBench): no disponible en los resultados de búsqueda.
- Paper asociado al estudio de Arrow Research: no disponible en los resultados de búsqueda.
- Tinker: no disponible en los resultados de búsqueda.
