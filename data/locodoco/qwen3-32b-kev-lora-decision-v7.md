# locodoco/qwen3-32b-kev-lora-decision-v7

## Resumen

`locodoco/qwen3-32b-kev-lora-decision-v7` es un adaptador LoRA con una cabeza de decisión (decision head) entrenado sobre el modelo base Qwen/Qwen3-32B. Lo publica el usuario `locodoco` y no es un lanzamiento oficial del proyecto Kev: reutiliza la receta de entrenamiento de Kev (código y datos del suite decision-v7) para producir un modelo de 32B orientado a la selección entre opciones en tareas de toma de decisiones. El resultado es un artefacto de investigación, no un modelo listo para producción.

El adaptador usa LoRA con rango 16 sobre todas las capas lineales y una cabeza de dimensión 256 que puntúa cada opción de una decisión mediante marcadores `</opt>` y `<decide>` y pérdida de entropía cruzada. Se entrenó durante 2 épocas y 3.144 pasos de optimizador sobre el suite decision-v7 de jaredpalmer/kev-suites, con 1.000 registros por fuente y aumentación sintética (none-of-the-above y distractores), limitando los estados a 384 tokens.

Su relevancia es acotada: el autor declara explícitamente que no ha sido evaluado, que no existe `eval.json` ni resultados en held-out y que no se ha ajustado temperatura de calibración (temperatura de la cabeza a 1.0). Es útil como referencia metodológica para quien quiera replicar o extender el enfoque de Kev a modelos de mayor tamaño, pero no como componente fiable sin una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-32B) con adaptador PEFT LoRA y cabeza de decisión Kev |
| Parametros totales | 32B (modelo base); el repositorio del adaptador ocupa 0,6 GB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible para el adaptador; los estados de entrenamiento se truncan a 384 tokens |
| Tipos de cuantizacion | no disponible (los pesos del adaptador se distribuyen en safetensors; el base en bf16 ≈ 65 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) y `head.pt` (cabeza de decisión y metadatos) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-32B, un transformer decoder-only de 32.000 millones de parámetros. Sobre él se aplica un adaptador LoRA de rango 16 en todas las capas lineales y se añade una cabeza de decisión de dimensión 256 que puntúa opciones individuales. El entrenamiento sigue la receta de Kev (commit `65b1e76`): marcadores `</opt>` y `<decide>` en el texto, pérdida de entropía cruzada sobre la opción correcta y aumentación sintética con distractores y opciones "none-of-the-above" (p_none 0.1, p_none_distract 0.12, p_distract 0.15, p_none_pair 0.25).

Los datos provienen del suite decision-v7 de `jaredpalmer/kev-suites`, con 1.000 registros por fuente. El schedule es de 2 épocas, 3.144 pasos de optimizador, batch 4 con acumulación de gradiente 2, learning rate 5e-5, weight decay 0.01, precisión bf16 con gradient checkpointing y semilla 0. La pérdida bajó de 2,20 en el paso 10 a un rango de 0,18 a 0,49 en los últimos 40 pasos. El entrenamiento se ejecutó en una NVIDIA GH200 durante 2 horas y 31 minutos con un pico de memoria de 78,2 GB. No se documenta ninguna innovación arquitectónica adicional más allá del esquema de puntuación de opciones propio de Kev.

## Capacidades

- Puntuación y selección entre opciones en tareas de decisión estructuradas, mediante la cabeza de decisión y los marcadores `</opt>`/`<decide>`.
- Razonamiento y generación de texto heredados del modelo base Qwen3-32B (no verificados en este adaptador).
- Manejo de estados de decisión de hasta 384 tokens, según la configuración de entrenamiento.
- Aumentación entrenada para escenarios con distractores y opciones "none-of-the-above".
- Soporte de tool calling, agentes, visión, audio o modo thinking: no disponible en la información proporcionada para este adaptador (dependería del base y no se ha validado).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación sobre recetas de adaptación de modelos grandes: sirve para reproducir y comparar el enfoque Kev en un modelo de 32B frente a los modelos de 4B del proyecto original, usando el código y los comandos documentados.
- Clasificación de opciones en pipelines internos de decisión: la cabeza puntúa alternativas explícitas, lo que permite integrarla en un sistema de enrutamiento o selección de acciones siempre que se valide previamente con datos propios.
- Evaluación comparativa de adaptadores LoRA: al compartir receta con Kev, permite estudiar el efecto del tamaño del modelo base en la calidad de la decisión, aunque requiere generar el conjunto de evaluación que el autor no incluye.
- Prototipado de asistentes de decisión con distractores: el entrenamiento con opciones señuelo y "none-of-the-above" encaja en escenarios donde hay que descartar alternativas plausibles pero incorrectas.
- Base para ajuste fino posterior: al ser un adaptador PEFT sobre Qwen3-32B, se puede continuar el entrenamiento con datos propios y una temperatura de calibración ajustada antes de desplegar.
- Docencia y experimentación en PEFT: el repositorio incluye `adapter_config.json`, `training_config.json` y `training_metrics.json`, útiles para estudiar configuraciones de LoRA y estadísticas de gradiente en un modelo grande.
- Servicio local de demostración: los comandos de `kev.serve` permiten levantar un endpoint en el puerto 8009 para pruebas internas, con la advertencia de que no se han ejecutado contra este repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el modelo no ha sido evaluado, que no existe `eval.json` ni resultado en held-out, y que no se ha ajustado temperatura de calibración (temperatura de la cabeza 1.0). Los únicos datos numéricos son de entrenamiento: pérdida de 2,20 en el paso 10 y de 0,18 a 0,49 en los últimos 40 pasos, además de las estadísticas de norma de gradiente en `training_metrics.json`.

## Requisitos de hardware

- El modelo base Qwen3-32B ocupa aproximadamente 65 GB en bf16, por lo que la inferencia completa requiere al menos esa cantidad de VRAM, más el adaptador (0,6 GB) y la cabeza.
- Entrenamiento documentado: 1 NVIDIA GH200, 2 h 31 min, pico de 78,2 GB de memoria.
- GPU recomendadas para el modelo base en bf16: H100, H200, GH200, A100 de 80 GB; en consumer GPU no cabe en bf16.
- En consumer GPU solo sería viable con cuantización del base (por ejemplo, 4 bits), aunque el autor no documenta ni valida ninguna cuantización para este adaptador.
- Despliegue: el autor documenta `kev.serve` y `kev.benchmark` desde el repositorio de Kev; no se mencionan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Evaluación publicada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| locodoco/qwen3-32b-kev-lora-decision-v7 | 32B (base) + LoRA r16 + cabeza 256 | no disponible (estados de 384 tokens en entrenamiento) | No (sin eval.json ni held-out) | Apache-2.0 | Hugging Face, 0 descargas |
| Modelos Kev originales (referencia de la receta) | no disponible en la información proporcionada | no disponible | no disponible | no disponible | Repositorio Kev y suite kev-suites |
| Qwen/Qwen3-32B (modelo base) | 32B | no disponible en la información proporcionada | no disponible en la información proporcionada | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- No ha sido evaluado: no hay `eval.json`, ni resultados en held-out, ni calibración de temperatura (cabeza a 1.0). Cualquier uso en producción requiere una evaluación propia.
- No es un lanzamiento oficial de Kev; los autores originales no entrenaron ningún modelo de 32B y este solo reutiliza su receta.
- Los comandos de uso documentados no se han ejecutado contra este repositorio, según el propio autor.
- Los estados de decisión se truncan a 384 tokens, lo que limita la longitud de los contextos de decisión manejados.
- La licencia Apache-2.0 cubre el modelo y el código, pero los datos de entrenamiento de kev-suites tienen sus propios términos, que hay que revisar en su dataset card.
- Riesgo de alucinación y sesgos: no documentados ni medidos; al heredar el modelo base, arrastra los sesgos de Qwen3-32B sin cuantificar.
- Idiomas soportados: no disponibles; no se ha validado el comportamiento multilingüe del adaptador.
- Sin descargas ni likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/locodoco/qwen3-32b-kev-lora-decision-v7
- Modelo base: https://huggingface.co/Qwen/Qwen3-32B
- Repositorio de Kev: https://github.com/jaredpalmer/kev
- Dataset kev-suites: https://huggingface.co/datasets/jaredpalmer/kev-suites
