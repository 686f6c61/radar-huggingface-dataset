# Lucasgitguy-co/K2-Horizon-4x0.9B-MoE-heretic

## Resumen
K2-Horizon-4x0.9B-MoE-heretic es un modelo de lenguaje generativo de tipo Mixture-of-Experts (MoE) construido por el usuario Lucasgitguy-co a partir de los checkpoints del modelo denso IFM/K2-Horizon-0.9B, desarrollado por IFM. La propuesta combina cuatro expertos por capa con enrutamiento top-1: cada experto reutiliza el bloque MLP de una de las variantes RL publicadas como tags del repositorio base (`main`, `rl_code2`, `rl_if`, `rl_stem`), mientras que atención, embeddings, normalizaciones y `lm_head` provienen del checkpoint `main`. El resultado es un modelo de 3.060 millones de parámetros totales con 1.080 millones activos por token.

La segunda intervención es el "descensurado" mediante Heretic 2.0.0.dev0 con ablación de rango arbitrario (Arbitrary-Rank Ablation), que elimina la mayor parte de los rechazos del modelo base. Según la model card, el modelo pasa de 100/100 rechazos en el conjunto `harmful_behaviors` a 3/100, manteniendo una precisión en ARC-Easy de 0,570 (acc) y 0,560 (acc_norm), muy cercana a la del denso original (0,560 / 0,575).

Es relevante ahora porque demuestra una técnica de "upcycling" barata —sin entrenamiento de router ni de expertos— para convertir un modelo denso pequeño en un MoE de 3× tamaño en disco, y porque documenta con honestidad sus límites: los expertos son casi idénticos entre sí (diferencias de ~0,05 % en norma relativa), por lo que el comportamiento final es prácticamente el del modelo base. Es, en la práctica, un experimento reproducible de arquitectura y ablación más que un modelo con ganancias de capacidad demostradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con MoE nativo `k2_horizon` (`K2HorizonSparseMoeBlock`), 4 expertos por capa, enrutamiento top-1 con router softmax |
| Parametros totales | 3.060.266.496 (3,06B) |
| Parametros activos | 1,08B por token |
| Longitud de contexto | 128K (YaRN, igual que el modelo base) |
| Tipos de cuantizacion | bf16 en el repo principal; cuantizaciones GGUF disponibles en repo separado |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 6,1 GB); GGUF en repo aparte |

## Arquitectura y entrenamiento
La arquitectura es un transformer con bloques MoE dispersos propios del modelo base (`K2HorizonSparseMoeBlock`). Cada capa contiene cuatro expertos y un router softmax que selecciona top-1. Los expertos no se entrenaron: el experto *e* de cada capa es el MLP de uno de los checkpoints RL del repositorio IFM/K2-Horizon-0.9B (`main` para propósito general, `rl_code2` para código y matemáticas, `rl_if` para seguimiento de instrucciones, `rl_stem` para ciencia). Atención, embeddings, normas y `lm_head` se copian de `main`.

El router tampoco se entrena: por capa, la fila *e* de la puerta se inicializa como la diferencia normalizada entre la media de las entradas al MLP en prompts del dominio *e* y la media global, calculada sobre `main` con 32 prompts por dominio (harmless_alpaca, MBPP + GSM8K, IFEval, SciQ) y escalada a dispersión unitaria de logits. La ablación de Heretic se ejecutó sobre el denso `main` (100 ensayos); el ensayo 47 modificó 14 tensores (`self_attn.o_proj` y `mlp.down_proj` de las capas 13–19). Los cambios en `o_proj` se copiaron tal cual y el delta de `down_proj` (`W_heretic − W_main`) se sumó al `down_proj` de cada experto en esas capas. Como verificación, una compilación de prueba con todos los expertos iguales al MLP de `main` coincidió con el argmax del denso en 50/50 posiciones (diferencia máxima de logit 0,72, ruido bf16).

## Capacidades
- Generación de texto conversacional multi-turno con plantilla de chat (`apply_chat_template`).
- Razonamiento explícito: el modelo emite un bloque `<ifm|think> … </ifm|think>` antes de la respuesta, con parámetro `reasoning_effort` que acepta `high`, `medium` y `low`.
- Generación de código y matemáticas (dominio del experto `rl_code2`).
- Seguimiento de instrucciones (dominio del experto `rl_if`).
- Razonamiento científico (dominio del experto `rl_stem`).
- Capacidad multilingüe limitada a inglés y chino.
- Salidas sin censura: los rechazos se han reducido drásticamente (3/100 en la prueba de comportamientos dañinos).
- No se documenta soporte de tool calling, function calling ni agentes multi-paso en la información disponible.
- No se documenta visión ni audio.

## Casos de uso
- Experimentación con arquitecturas MoE: sirve para estudiar el comportamiento de un router inicializado por medias de estados ocultos y comparar el enrutamiento por dominio con el de un MoE entrenado, sin coste de entrenamiento.
- Investigación sobre ablación y alineación: permite reproducir el pipeline de Heretic (ablación de rango arbitrario) sobre un modelo denso y medir el efecto en rechazos y en precisión de tareas, con los scripts de `build/` incluidos en el repo.
- Generación de texto en inglés y chino con contexto largo: los 128K tokens de ventana (YaRN) permiten resumir documentos extensos o mantener conversaciones con historial amplio en esos dos idiomas.
- Asistencia de código en local: el experto `rl_code2` y el formato GGUF permiten desplegar el modelo en entornos sin GPU de datacenter para autocompletado o explicación de fragmentos, aceptando que el rendimiento es el del modelo base de 0,9B.
- Evaluación comparativa de cuantizaciones: al existir repo GGUF separado, es útil para medir la degradación de precisión y latencia entre bf16 y cuantizaciones de 4–8 bits en un MoE pequeño.
- Docencia y divulgación: como ejemplo didáctico de upcycling de checkpoints RL en expertos y de construcción de un router sin entrenamiento, con verificación de equivalencia frente al denso.
- Generación creativa sin restricciones de contenido: para casos donde se requiere evitar rechazos del modelo base, asumiendo la responsabilidad de uso que indica el autor.

## Benchmarks y rendimiento

| Modelo | Rechazos (harmful_behaviors, 100) | ARC-Easy acc / acc_norm (200, ±0,035) |
|---|---|---|
| IFM/K2-Horizon-0.9B | 100/100 | 0,560 / 0,575 |
| Denso 0.9B tras Heretic (ensayo 47) | 4/100 (recuento de Heretic: 0/100, KL 0,058) | – |
| K2-Horizon-4x0.9B-MoE-heretic | 3/100 | 0,570 / 0,560 |

Reparto de enrutamiento (top-1, todas las capas) sobre prompts reservados por dominio:

| Prompts | main | rl_code2 | rl_if | rl_stem |
|---|---|---|---|---|
| chat general | 0,48 | 0,17 | 0,25 | 0,10 |
| código + matemáticas | 0,22 | 0,74 | 0,03 | 0,01 |
| seguimiento de instrucciones | 0,21 | 0,13 | 0,63 | 0,04 |
| ciencia | 0,35 | 0,22 | 0,09 | 0,35 |

El autor advierte que esta tabla refleja que el router funciona como se configuró, no que los expertos sean especialistas reales. No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware
- VRAM estimada en bf16: unos 6,1 GB solo para pesos, más overhead de activaciones y caché KV; con contexto de 128K la caché KV crece de forma significativa y conviene reservar 10–12 GB o más según longitud.
- En cuantización GGUF de 4 bits el peso se reduce aproximadamente a 1,5–2 GB, lo que permite ejecución en CPU o GPU de gama media.
- GPU recomendadas: A100 40/80 GB o H100 para bf16 con contexto largo; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para bf16 con contextos moderados.
- Cabe en GPU de consumo: sí, en RTX 4090, 3090, 4080 y similares con 16 GB o más; en 8–12 GB probablemente solo con cuantización GGUF.
- Opciones de despliegue: `transformers` 5.x con `trust_remote_code=True` (requerido, el código de arquitectura viaja en el repo) y llama.cpp 0.9.0+ mediante los GGUF. MLX, Ollama y LM Studio no fueron probados según el autor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| K2-Horizon-4x0.9B-MoE-heretic | 3,06B | 1,08B | 128K | Apache-2.0 | MoE por upcycling, sin entrenamiento de router ni expertos; sin censura |
| IFM/K2-Horizon-0.9B | 0,9B | 0,9B (denso) | 128K | Apache-2.0 | Modelo base; 100/100 rechazos; ARC-Easy 0,560 / 0,575 |
| K2-Horizon-4x0.9B-MoE-Cyber | no disponible | no disponible | no disponible | no disponible | Variante afinada para ciberseguridad del mismo autor, con versiones MLX, GGUF y demo en navegador |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias
- Expertos casi idénticos: los tags RL difieren de `main` en solo ~0,05 % de los pesos (norma relativa; `rl_if` frente a `rl_stem` ~0,07 %). El MoE se comporta prácticamente como el modelo base con 3× el tamaño en disco; las ganancias reales requerirían entrenamiento del router o de los expertos, que no se realizó.
- El router se inicializó de forma heurística a partir de medias de estados ocultos, no se entrenó; la especialización por dominio mostrada en la tabla de enrutamiento es consecuencia del diseño, no evidencia de pericia de los expertos.
- Modelo descensurado: los rechazos se han eliminado en gran medida, lo que implica riesgo de generar contenido dañino; la responsabilidad de uso recae en el usuario.
- Riesgo de alucinación: no se documentan evaluaciones de veracidad; al comportarse como un modelo de 0,9B, la fiabilidad factual es limitada.
- Idiomas: solo inglés y chino; no hay soporte declarado de castellano.
- Contexto: 128K vía YaRN, pero no se documenta la degradación de rendimiento en longitudes extremas.
- Compatibilidad: requiere `transformers` 5.x y `trust_remote_code=True`; no se probaron MLX, Ollama ni LM Studio.
- Licencia Apache-2.0 permite uso comercial, pero debe verificarse el cumplimiento de las condiciones del modelo base y de los checkpoints RL de origen.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Lucasgitguy-co/K2-Horizon-4x0.9B-MoE-heretic
- Cuantizaciones GGUF: https://huggingface.co/Lucasgitguy-co/K2-Horizon-4x0.9B-MoE-heretic-GGUF
- Variante de ciberseguridad: https://huggingface.co/Lucasgitguy-co/K2-Horizon-4x0.9B-MoE-Cyber
- Demo de la variante Cyber: https://huggingface.co/spaces/Lucasgitguy-co/K2-Horizon-Cyber-Chat
- Modelo base: https://huggingface.co/IFM/K2-Horizon-0.9B
- Heretic (herramienta de ablación): https://github.com/p-e-w/heretic
