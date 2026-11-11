# moltherm1/olmo-mirror-olmo-3-7b-rl-zero-if

## Resumen

Olmo 3 7B RL-Zero IF es un ajuste fino experimental del modelo base allenai/Olmo-3-1025-7B, desarrollado por el Allen Institute for AI (Ai2) y redistribuido en el espacio de Hugging Face del usuario moltherm1 como espejo. Se trata de la variante especializada en seguimiento de instrucciones (IF, *instruction following*) dentro de la familia RL-Zero, un conjunto de modelos pensado para la exploración científica del entrenamiento con RLVR (*Reinforcement Learning with Verifiable Rewards*). El modelo parte del checkpoint base de 7B de Olmo 3 y se post-entrena sobre el dataset allenai/Dolci-RLZero-IF-7B.

La relevancia de esta ficha radica en su carácter abierto y reproducible: Olmo 3 se distribuye con código, checkpoints y detalles de entrenamiento, lo que permite reproducir y auditar el proceso completo. El modelo es un transformer autorregresivo de 7.298.011.136 parámetros (aproximadamente 7,3 mil millones), con licencia Apache 2.0 y soporte nativo en transformers 4.57.0 o superior. El repositorio ocupa 14,6 GB en formato safetensors.

Al ser una variante RL-Zero-IF, su propósito no es tanto el despliegue comercial generalista como la investigación sobre cómo el RL con recompensas verificables afecta al comportamiento de seguimiento de instrucciones. Esto lo convierte en una pieza útil para quienes estudian dinámicas de post-entrenamiento, aunque con caveats importantes respecto a su madurez y a la ausencia de benchmarks publicados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo (estilo Olmo 3) |
| Parametros totales | 7.298.011.136 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits via bitsandbytes (mencionado en la model card); no se detallan otros formatos |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer autorregresivo de la familia Olmo 3, pre-entrenado sobre el dataset Dolma 3 y post-entrenado sobre los datasets Dolci. La variante RL-Zero-IF se obtiene mediante RLVR (*Reinforcement Learning with Verifiable Rewards*) sobre el dataset allenai/Dolci-RLZero-IF-7B, partiendo del checkpoint base allenai/Olmo-3-1025-7B. La familia RL-Zero se describe explícitamente en la model card como un conjunto experimental orientado a la exploración científica del entrenamiento RLVR, no como un producto final.

La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni los hiperparámetros del proceso RLVR. Sí se indica que el ajuste fino puede realizarse desde el checkpoint final o desde el modelo base usando el repositorio open-instruct de Ai2, con scripts específicos (`scripts/train/olmo3/rlvr_script.sh`). No se documentan innovaciones arquitectónicas adicionales (atención lineal, decodificación especulativa, MoE) en la información disponible.

## Capacidades

- Generación de texto conversacional en inglés, con pipeline de `text-generation` y etiqueta `conversational`.
- Seguimiento de instrucciones (IF), que es la especialidad declarada de esta variante RL-Zero.
- Razonamiento de tipo *zero* mediante RLVR, orientado a tareas con recompensas verificables.
- Ajuste fino adicional posible desde el checkpoint final o el modelo base mediante open-instruct.
- Cuantización a 8 bits con bitsandbytes para reducir requisitos de memoria.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo *thinking* explícito en la información disponible.
- Capacidades multilingües: limitadas al inglés según el campo `language: en`.

## Casos de uso

- Investigación sobre RLVR: el modelo sirve como sujeto de estudio para analizar cómo el RL con recompensas verificables modifica el comportamiento de seguimiento de instrucciones, comparándolo con las variantes Math, Code, General y Mix de la misma familia.
- Reproducción de experimentos de post-entrenamiento: al estar disponible el dataset Dolci-RLZero-IF-7B y el repositorio open-instruct, se puede replicar el pipeline de ajuste fino con scripts como `rlvr_script.sh` y modificar hiperparámetros (por ejemplo, `--learning_rate=1e-3`).
- Generación de texto en inglés para prototipos: con transformers 4.57.0 o superior, el modelo puede emplearse en tareas de generación conversacional básica en entornos de investigación.
- Ajuste fino específico de dominio: partir del checkpoint final o del base para adaptar el modelo a tareas concretas de instrucciones en inglés, aprovechando la infraestructura de open-instruct.
- Evaluación comparativa de checkpoints: usar el modelo como punto intermedio en una cadena de ablaciones (base → SFT → DPO → RLVR) para medir el impacto de cada etapa.
- Docencia y formación: al ser Apache 2.0 y reproducible, es adecuado para cursos y talleres sobre post-entrenamiento y RLVR, sin restricciones de licencia para uso educativo.
- Despliegue con cuantización en 8 bits: para entornos con VRAM limitada, la model card documenta `load_in_8bit=True` con bitsandbytes como vía para reducir el consumo de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 14,6 GB solo para los pesos (7,3 mil millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica se recomienda al menos 16-24 GB.
- VRAM estimada en 8 bits: alrededor de 7,3 GB para los pesos, más overhead; viable en GPUs de 12-16 GB según longitud de contexto y lote.
- GPUs recomendadas: no especificadas en la información disponible. Por tamaño, una RTX 4090 (24 GB) o A100/H100 son opciones razonables para fp16; una RTX 3090/4080 (16 GB) podría ser suficiente en 8 bits.
- Cabe en GPU de consumo: sí, en fp16 en tarjetas de 24 GB (RTX 3090, 4090) y en 8 bits en tarjetas de 12-16 GB, sujeto a prueba empírica.
- Opciones de despliegue: transformers 4.57.0 o superior (soporte nativo documentado); bitsandbytes para cuantización 8 bits. No se documentan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Olmo-3-7B-RLZero-IF (este) | 7,3 B | no disponible | Seguimiento de instrucciones via RLVR | Apache 2.0 | Hugging Face (espejo de moltherm1) |
| Olmo-3-7B-RLZero-Math | no disponible | no disponible | Matematicas via RLVR | Apache 2.0 | Hugging Face (allenai) |
| Olmo-3-7B-RLZero-Code | no disponible | no disponible | Codigo via RLVR | Apache 2.0 | Hugging Face (allenai) |
| Olmo-3-7B-RLZero-General | no disponible | no disponible | Proposito general via RLVR | Apache 2.0 | Hugging Face (allenai) |
| Olmo-3-7B-Instruct | no disponible | no disponible | Instrucciones (SFT + DPO + RLVR) | Apache 2.0 | Hugging Face (allenai) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: la propia model card lo describe como parte de un conjunto experimental para exploración científica de RLVR, no como un modelo listo para producción.
- Idiomas: solo inglés; no hay soporte multilingüe declarado.
- Sesgos: no documentados en la información disponible, pero al entrenarse sobre Dolma 3 y Dolci cabe esperar sesgos heredados de esos corpus.
- Riesgo de alucinación: no cuantificado; como todo modelo generativo, puede producir contenido factualmente incorrecto.
- Contexto: la longitud de contexto no está disponible, lo que impide planificar despliegues con ventanas largas.
- Licencia: Apache 2.0 permite uso comercial, pero Ai2 indica que el modelo está pensado para investigación y uso educativo conforme a sus Responsible Use Guidelines; conviene revisar dichas guías antes de un despliegue comercial.
- Repositorio espejo: el ID `moltherm1/olmo-mirror-olmo-3-7b-rl-zero-if` es una réplica de un modelo de allenai; para producción conviene referenciar el repositorio oficial de Ai2.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento en la información disponible, lo que dificulta justificar su elección frente a alternativas.
- Sin datos de contexto ni de tool calling: no se puede asumir soporte de agentes o function calling.

## Enlaces

- Hugging Face (espejo): https://huggingface.co/moltherm1/olmo-mirror-olmo-3-7b-rl-zero-if
- Modelo base: https://huggingface.co/allenai/Olmo-3-1025-7B
- Modelo oficial RL-Zero-IF: https://huggingface.co/allenai/Olmo-3-7B-RLZero-IF/
- Dataset de entrenamiento: https://huggingface.co/datasets/allenai/Dolci-RLZero-IF-7B
- Repositorio open-instruct: https://github.com/allenai/open-instruct
- Guías de uso responsable de Ai2: https://allenai.org/responsible-use
- Paper referenciado (arXiv:2512.13961): https://arxiv.org/abs/2512.13961
