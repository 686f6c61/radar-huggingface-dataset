# iamPi/sinopia-b57f6cad

## Resumen

sinopia-b57f6cad es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-9B, desarrollado por iamPi como un *cold start* de SFT: destila los "pensamientos" de un teacher congelado en la política del modelo, de modo que una fase posterior de RL disponga de un punto de partida mejor que un modelo sin entrenar. El nombre hace referencia al *sinopia*, el dibujo rojo subyacente que se traza antes de pintar un fresco, indicando que este checkpoint es un boceto sobre el que se construye la obra final.

El modelo está entrenado para continuar desde dentro de un bloque ` thinking` ya abierto, generando completions con formato `THOUGHT: {thought}` seguido de una acción en un bloque ```bash. Está pensado para trayectorias agénticas con herramientas de shell, donde un parser downstream puede recuperar el par (pensamiento, acción) a partir de la salida. No es un modelo final: la model card advierte que no ha sido evaluado y que sirve como entrada para una etapa de RL posterior.

Qwen3.5-9B es un modelo híbrido linear-attention con 32 capas, de las cuales 8 usan atención completa y 24 usan Gated DeltaNet. El adaptador cubre las proyecciones de las 32 capas, incluyendo las proyecciones específicas de las capas linear-attention que los target lists convencionales de LoRA omiten. El repositorio pesa 0,3 GB y contiene 400 tensores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA adapter sobre Qwen3.5-9B (híbrido linear-attention + full-attention, 32 capas) |
| Parametros totales | 8.95B (base) + 80,216,064 (adaptador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrenado sin truncación, `padding_free`) |
| Tipos de cuantizacion | no disponible (entrenado en bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (hereda los términos de Qwen/Qwen3.5-9B) |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

Qwen3.5-9B es un modelo híbrido cuya configuración `layer_types` alterna tres capas `linear_attention` con una `full_attention`, de modo que solo 8 de las 32 capas tienen atención completa con proyecciones q_proj/k_proj/v_proj/o_proj. Las 24 capas restantes usan Gated DeltaNet con proyecciones in_proj_qkv, in_proj_z, out_proj y una convolución depthwise conv1d.

El adaptador LoRA (rank 32, alpha 128, dropout 0.05, relación alpha/r = 4) cubre las proyecciones de las 32 capas: las cuatro proyecciones de atención en las 8 capas full-attention, las tres proyecciones MLP (gate_proj, up_proj, down_proj) en las 32 capas, y las proyecciones in_proj_qkv, in_proj_z y out_proj en las 24 capas linear-attention. Se excluyen deliberadamente in_proj_a e in_proj_b porque emiten 32 valores (r=32 sería full-rank sobre ellas) y porque gobiernan la dinámica de decay/beta de la recurrencia, donde una perturbación low-rank desestabiliza más de lo que ayuda. La capa conv1d también se excluye por ser depthwise, no apta para factorización low-rank.

El entrenamiento fue SFT con loss solo sobre la completion (prompt enmascarado), 1 época (567 pasos de optimización), batch global 32 (4×DDP × micro-batch 2 × grad-accum 4), learning rate 1e-4 con schedule cosine y 3% de warmup, precisión bf16 con gradient checkpointing y flash-attention-2, y longitud máxima no acotada (`padding_free`, sin truncación). Se entrenó en 4×A100 80GB con TRL 1.10, transformers 5.15, PEFT 0.20 y torch 2.13.

## Capacidades

- Generación de texto en formato agéntico estructurado: continúa desde un bloque ` thinking` abierto y produce completions con forma ` response\nTHOUGHT: {thought}\n\n{action}`, donde la acción es un bloque ```bash parseable.
- Distilación de razonamiento: entrenado para replicar los pensamientos de un teacher congelado, lo que permite transferir el proceso de razonamiento del teacher a la política del modelo.
- Ejecución de acciones shell: las acciones se emiten en bloques ```bash que un pipeline downstream puede extraer y ejecutar en un intérprete.
- Tool calling implícito: el formato de salida (pensamiento + acción) habilita integración en pipelines de agentes que ejecutan comandos de shell.
- Soporte multi-paso: al continuar desde un bloque thinking abierto, el modelo puede mantener secuencias agénticas de razonamiento-acción.
- Sin capacidades de visión, audio ni otras modalidades: modelo de texto puro.

## Casos de uso

- Cold start para entrenamiento RL: el uso previsto del adaptador es proporcionar una política inicial mejor que un modelo sin entrenar para una fase posterior de RL, reduciendo el coste de exploración y acelerando la convergencia del refinamiento.
- Automatización de tareas shell: el modelo genera acciones en bloques ```bash que pueden ejecutarse directamente, permitiendo automatizar flujos de administración de sistemas, gestión de archivos o despliegues repetitivos con supervisión humana.
- Investigación en destilación de razonamiento: sirve como caso de estudio para técnicas de SFT que destilan los "thoughts" de un teacher en la política de un modelo, evaluando si el cold start mejora la fase de RL posterior.
- Desarrollo de agentes CLI: puede integrarse en frameworks de agentes que necesiten un modelo que razone antes de actuar, con un formato de salida estructurado y parseable sin depender del chat template estándar.
- Experimentación con arquitecturas híbridas: permite estudiar el comportamiento de LoRA sobre un modelo con atención lineal (Gated DeltaNet) frente a atención completa, y validar la cobertura de target modules en las 32 capas.
- Pipeline de entrenamiento multi-etapa: como etapa intermedia en un pipeline SFT → RL, el adaptador proporciona un punto de partida reproducible y documentado para refinar políticas agénticas con herramientas shell.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el checkpoint no ha sido evaluado ("Not evaluated here") y que no se hace ninguna afirmacion de convergencia. No se reportan puntuaciones en MMLU, HumanEval, GSM8K ni otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en bf16 ocupa aproximadamente 18 GB (8.95B parámetros × 2 bytes). Con cuantización del base a 4 bits (GPTQ/AWQ/GGUF), puede reducirse a ~5-6 GB, pero no se han publicado cuantizaciones específicas para este adaptador.
- GPU recomendadas: A100 80GB (usada en entrenamiento), H100, o GPUs consumer con 24 GB+ (RTX 4090) para inferencia en bf16 sin cuantizar.
- En consumer GPU: posible en RTX 4090 (24 GB) con bf16, o en GPUs de 12-16 GB cuantizando el modelo base.
- Opciones de despliegue: transformers + PEFT con `PeftModel.from_pretrained` y `merge_and_unload()` para servir con vLLM. No se documenta soporte para llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. El adaptador es específico de Qwen3.5-9B y no se han publicado comparaciones con otros adaptadores LoRA, modelos agénticos o checkpoints de cold start para RL. La model card no incluye benchmarks ni tablas comparativas con alternativas.

## Limitaciones y advertencias

- No evaluado: la model card advierte explicitamente que no se reportan resultados de evaluación; debe tratarse como punto de partida para RL, no como modelo final para producción.
- Una sola época: el entrenamiento fue de 1 época (567 pasos); no se hace ninguna afirmación de convergencia.
- Dominio limitado: entrenado exclusivamente en trayectorias agénticas con herramientas shell; el comportamiento fuera de ese formato no está probado.
- Contrato de prompt estricto: el prompt debe terminar con el header de assistant seguido de ` thinking\n`; el chat template no añade ese sufijo automáticamente. Si se usa `apply_chat_template(..., add_generation_prompt=True)` sin añadirlo manualmente, el modelo no se comportará como se espera.
- Riesgo de alucinación: al ser un modelo agéntico sin evaluación, el riesgo de alucinar comandos shell o acciones incorrectas es alto; requiere supervisión humana en cualquier uso operativo.
- Licencia no definida: el adaptador no tiene licencia propia; hereda los términos de Qwen/Qwen3.5-9B. Consultar la model card del base antes de cualquier uso comercial.
- Sin soporte multimodal: modelo de texto puro, sin capacidades de visión ni audio.

## Enlaces

- HuggingFace (adaptador): https://huggingface.co/iamPi/sinopia-b57f6cad
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
