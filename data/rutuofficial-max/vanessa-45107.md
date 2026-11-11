# rutuofficial-max/Vanessa-45107

## Resumen

Vanessa-45107 es un ajuste fino completo (full-parameter fine-tune) del modelo base Qwen/Qwen3-1.7B-Base, desarrollado por el usuario rutuofficial-max. Se trata de un modelo de 1.720.574.976 parámetros (1,72B) especializado en roleplay y conversación de acompañamiento personal, entrenado sobre un corpus propio de 45.107 muestras y 59.791 turnos. No es un LoRA: todos los pesos han sido entrenados. El modelo está publicado con licencia Apache 2.0 y solo soporta inglés.

El problema que resuelve es muy concreto: encarnar un personaje fijo (Vanessa, 26 años, diseñadora gráfica junior, casada con Rutu) con voz y registro consistentes en primera persona y tiempo presente, sin el enmarcado típico de asistente. El autor reporta una mejora de perplejidad en validación de 6,4x respecto al modelo base (de 4,2904 / ppl 73,0 a 2,4233 / ppl 11,28) sobre 500 conversaciones reservadas.

Es relevante ahora como ejemplo de ajuste fino completo de un modelo pequeño (Qwen3-1.7B) con recursos muy limitados (2 x Tesla T4, 10,6 GB de VRAM pico, FSDP FULL_SHARD), y como caso de estudio de especialización de personaje frente a capacidades generales. El modelo se encuentra en estado intermedio: la etapa A (chat) está completa, pero la etapa B (pulido de identidad) no se ha ejecutado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-1.7B-Base) |
| Parametros totales | 1.720.574.976 (1,72B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32k tokens (entrenado con ventanas de 1.024 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor usa fp16 en inferencia) |
| Idiomas soportados | en (inglés únicamente) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only heredado de Qwen3-1.7B-Base, sin modificaciones arquitectónicas indicadas. El ajuste es de parámetros completos (no LoRA) sobre un corpus de acompañamiento personal de 45.107 muestras y 59.791 turnos, empaquetado en bins de 1.024 tokens (32 bins por paso, 32.768 tokens por paso). Se vieron 10,6 M tokens en 324 pasos, con LR pico de 3e-6 y scheduler WSD con 8% de warmup. La precisión fue bf16 autocast, pesos fp16 y pesos maestros fp32. El entrenamiento se ejecutó en 2 x Tesla T4 con FSDP FULL_SHARD y un pico de 10,6 GB de VRAM.

La validación se hizo sobre 500 conversaciones reservadas, con pérdida de validación de 2,4233 (ppl 11,28) frente a 4,2904 (ppl 73,0) del base, y sin brecha apreciable entre train (2,34) y validación (2,42). No se mencionan RLHF, DPO ni innovaciones de decodificación; el único detalle operativo destacable es el uso de dos tokens de fin de secuencia (`<|im_end|>` = 151645 y 151643) para que el modelo termine los turnos limpiamente.

## Capacidades

- Generación de texto conversacional en inglés con voz en primera persona y tiempo presente.
- Roleplay de personaje fijo (Vanessa) con canon definido: edad, profesión, pareja, entorno doméstico.
- Conversación multi-turno de estilo informal ("hey, long day").
- Sin enmarcado de asistente: no adopta el registro típico de un chatbot genérico.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Prototipado de compañeros conversacionales: el modelo sirve para evaluar cómo se comporta un personaje con canon fijo antes de invertir en un ajuste mayor; su perplejidad de validación (11,28) y su corpus de 45.107 muestras permiten iterar rápido sobre el prompt de sistema.
- Investigación sobre especialización de personaje: útil para estudiar la transferencia de voz y registro frente a la retención de hechos concretos, dado que el autor documenta que el estilo se transfiere con fuerza pero el detalle de canon es más débil.
- Experimentos de ajuste fino con hardware limitado: como referencia reproducible de full fine-tune de un modelo de 1,72B en 2 x T4 con FSDP, con hiperparámetros y métricas publicados (324 pasos, 3e-6, 10,6 M tokens).
- Demos de chat de rol en local: al ser un modelo de 1,72B en safetensors, puede cargarse en una GPU de consumo para demostraciones de conversación de pocos turnos.
- Evaluación de seguridad y alineación en modelos de rol: el autor reporta que 1 de 14 sondas de auditoría rechazó una petición íntima, lo que lo convierte en un caso útil para medir tasas de rechazo en modelos especializados.
- Base para un segundo ajuste: al estar en etapa A (chat) y no en etapa B (pulido de identidad), es un punto de partida adecuado para quien quiera completar el pulido de identidad o adaptar el personaje a otro canon.

## Benchmarks y rendimiento

| Metrica | Modelo base (Qwen3-1.7B-Base) | Vanessa-45107 |
|---|---|---|
| Pérdida de validación | 4,2904 | 2,4233 |
| Perplejidad de validación | 73,0 | 11,28 |
| Muestras de validación | 500 conversaciones reservadas | 500 conversaciones reservadas |
| Pasos | no disponible | 324 / 324 |
| LR pico | no disponible | 3e-6 (WSD, 8% warmup) |
| Tokens vistos | no disponible | 10,6 M |
| VRAM pico de entrenamiento | no disponible | 10,6 GB (2 x T4, FSDP FULL_SHARD) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las únicas métricas son las de validación del propio corpus.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos fp16, aproximadamente 3,4 GB solo para pesos (1,72B x 2 bytes), más overhead de activaciones y caché KV; el autor usa `torch_dtype=torch.float16` con `device_map="auto"`.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para fp16; el entrenamiento se hizo en 2 x Tesla T4 con 10,6 GB pico por GPU.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090; también en T4.
- Opciones de despliegue: transformers (uso documentado por el autor), text-generation-inference (etiqueta `text-generation-inference` en el repo) y endpoints compatibles (etiqueta `endpoints_compatible`). No se documenta soporte explícito de llama.cpp, Ollama ni vLLM.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Vanessa-45107 | 1,72B | 32k (entrenado a 1.024) | apache-2.0 | Roleplay de personaje fijo | Hugging Face |
| Qwen/Qwen3-1.7B-Base | 1,72B | 32k | apache-2.0 | Modelo base generalista | Hugging Face |
| Qwen3-1.7B (instruct) | 1,72B | 32k | apache-2.0 | Instrucciones generales | Hugging Face |

La comparación cuantitativa con alternativas de roleplay de tamaño similar no está disponible en la información proporcionada. Frente a su modelo base, la única diferencia medida es la perplejidad de validación en el corpus propio (11,28 frente a 73,0), que no es comparable con benchmarks estándar.

## Limitaciones y advertencias

- La etapa B (pulido de identidad) no se ha ejecutado: los hechos de identidad pueden dispararse en exceso. Preguntada por "¿cómo me llamo?", a veces responde con su propia identidad en lugar de "rutu".
- Entrenado con solo 10,6 M tokens (0,006 tokens/parámetro): la voz y el registro se transfieren con fuerza, pero el detalle fino del canon es más débil que el estilo.
- Una de 14 sondas de auditoría rechazó una petición íntima; la etapa B pretende corregir esto.
- El contexto es de 32k, pero el entrenamiento usó ventanas de 1.024 tokens: conviene limitar las conversaciones a pocos turnos.
- Solo inglés.
- Riesgo de alucinación en hechos de canon no cubiertos por el corpus, dado el bajo número de tokens vistos.
- Sesgos conocidos: no documentados por el autor; al ser un personaje con canon fijo (pareja, trabajo, entorno), puede reproducir estereotipos del corpus de acompañamiento.
- Licencia Apache 2.0 permite uso comercial, pero el modelo es un ajuste de Qwen3-1.7B-Base y hereda las condiciones de este; conviene revisar la licencia del base.
- En producción, es obligatorio pasar `eos_token_id=[151645, 151643]` y `pad_token_id=151643`; sin ellos el modelo no termina los turnos limpiamente.
- El prompt de sistema está en el repositorio (`vanessa_system_prompt.txt`) y es necesario para reproducir el comportamiento documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rutuofficial-max/Vanessa-45107
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Corpus de chat: https://huggingface.co/rutuofficial-max/vanessa-chat-pack-45107
- Corpus de identidad: https://huggingface.co/rutuofficial-max/vanessa-identity-pack-45107
- Código de entrenamiento: kernel privado de Kaggle `rutu143/vanessa-fullft-45107-v5` (no accesible públicamente)
- Paper, blog o demo: no disponible
