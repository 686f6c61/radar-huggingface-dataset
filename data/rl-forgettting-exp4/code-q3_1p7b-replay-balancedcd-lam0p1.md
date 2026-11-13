# RL-Forgettting-Exp4/code-q3_1p7b-replay-balancedcd-lam0p1

## Resumen

`code-q3_1p7b-replay-balancedcd-lam0p1` es un checkpoint de investigación publicado por el grupo RL-Forgettting-Exp4, derivado de `Qwen/Qwen3-1.7B-Base` mediante aprendizaje por refuerzo con GRPO sobre el conjunto de problemas de programación MBPP. No es un modelo pensado para producción, sino un artefacto experimental dentro de un estudio sobre olvido catastrófico (*catastrophic forgetting*) durante el entrenamiento con RL en tareas de generación de código. El repositorio contiene 30 checkpoints intermedios (pasos 10 a 300, con stride 10), logs del entrenador, rollouts muestreados y el estado del búfer de replay.

La particularidad de esta rama (*arm*) es el uso de un búfer de replay de rollouts SFT con muestreo `balanced_cooldown` y peso lambda=0.1, frente a otras ramas del mismo estudio que emplean `hard_cooldown` o que prescinden del búfer. El objetivo declarado es medir si la repetición selectiva de trayectorias pasadas mitiga la degradación de capacidades previas del modelo base mientras se optimiza la recompensa de ejecución en MBPP+.

El modelo base es Qwen3-1.7B-Base, un transformer denso de 1.700 millones de parámetros. La información pública del repositorio no detalla la longitud de contexto, los idiomas soportados ni los formatos de cuantización más allá de los pesos en safetensors. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-1.7B-Base) |
| Parametros totales | 1.700 millones (modelo base Qwen3-1.7B-Base) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B-Base, un transformer denso de tipo decoder-only. Sobre esa base se aplica GRPO (*Group Relative Policy Optimization*) con 8 rollouts por prompt, batch de 64, learning rate del actor de 1e-6 y longitud máxima de respuesta de 3072 tokens. La recompensa es binaria y se obtiene ejecutando el programa generado contra las aserciones de cada tarea de MBPP.

El conjunto de entrenamiento son 320 problemas de MBPP, seleccionados de forma que queden fuera tanto de MBPP+ (378 problemas) como del split de test canónico de MBPP (276), de modo que ambos puedan usarse como evaluación sin contaminación. La rama concreta de este repositorio incorpora un búfer de replay que reinyecta 128 rollouts pasados por paso con peso lambda=0.1, muestreados mediante la política `balanced_cooldown`. Según la model card, la única diferencia respecto a `RL-Forgetting-Experiments-3/code-q3_1p7b-replay-lam0p1` es el criterio de muestreo del búfer (`balanced_cooldown` frente a `hard_cooldown`). No se documentan detalles adicionales sobre la composición del dataset, el uso de RLHF/DPO ni innovaciones de decodificación.

## Capacidades

- Generación de código Python orientada a resolución de problemas tipo MBPP.
- Razonamiento paso a paso implícito en la generación de programas que deben superar aserciones de test.
- Entrenamiento con señal de recompensa verificable (ejecución de tests), lo que favorece código sintácticamente válido y ejecutable en el dominio de entrenamiento.
- Capacidades heredadas de Qwen3-1.7B-Base (generación de texto general, multilingüismo), aunque no se documenta su preservación tras el RL.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio.
- No se documenta modo *thinking* explícito.

## Casos de uso

- Estudio de olvido catastrófico: comparar los 30 checkpoints (`global_step_10` a `global_step_300`) para medir la evolución de pass@k en MBPP+ y la degradación en tareas fuera de dominio. Es el uso principal para el que se publica el repositorio.
- Reproducción de experimentos de RL para código: los logs, rollouts y estado del búfer permiten replicar el entrenamiento GRPO con replay y analizar la dinámica de recompensa paso a paso.
- Ablación de políticas de muestreo de búfer: contrastar `balanced_cooldown` (esta rama) con `hard_cooldown` (rama hermana) sobre el mismo modelo base y datos.
- Evaluación de robustez de tests: usar MBPP+ con su suite completa (~108 tests por problema) para estudiar cómo el RL optimiza la recompensa frente a una evaluación más estricta que las 3 aserciones originales de MBPP.
- Punto de partida para *fine-tuning* adicional en código: los checkpoints intermedios pueden servir como inicialización para experimentos posteriores con SFT o DPO en dominios específicos.
- Docencia e investigación en RL aplicado a LLM: el tamaño de 1.7B permite ejecutar el ciclo completo de entrenamiento y evaluación en hardware modesto, lo que facilita la reproducción académica.

## Benchmarks y rendimiento

La model card describe la metodología de evaluación (MBPP+, 378 problemas, n=160 muestras, temperatura 0.6, top_p 0.95, pass@k no sesgado), pero no incluye cifras de resultados en la información disponible.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,4 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, unos 4-6 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,7-2 GB para pesos; en 4 bits, en torno a 1 GB, aunque el repositorio no publica versiones cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060/4060, RTX 4090, A10, L4); A100/H100 no son necesarias para inferencia, pero sí útiles para reproducir el entrenamiento GRPO completo.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y superiores.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` (documentado en la model card); vLLM, TGI, llama.cpp u Ollama requerirían conversión previa a los formatos correspondientes, no publicados en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| code-q3_1p7b-replay-balancedcd-lam0p1 | 1.7B | no disponible | GRPO + replay sobre MBPP (320 problemas) | Apache 2.0 | Hugging Face, 30 checkpoints |
| Qwen/Qwen3-1.7B-Base | 1.7B | no disponible en esta ficha | Preentrenamiento general | Apache 2.0 | Hugging Face |
| RL-Forgetting-Experiments-3/code-q3_1p7b-replay-lam0p1 | 1.7B | no disponible | GRPO + replay con `hard_cooldown` | Apache 2.0 (según repositorio del estudio) | Hugging Face |

La comparación con modelos de código de propósito general (por ejemplo, variantes de Qwen2.5-Coder de tamaño similar) no está documentada en la información disponible y requeriría datos de benchmarks que el repositorio no publica.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción; su rendimiento fuera del dominio de MBPP no está evaluado ni documentado.
- Riesgo de olvido catastrófico: precisamente el fenómeno que el estudio intenta mitigar; las capacidades generales del modelo base pueden haberse degradado tras el RL, y el repositorio no publica métricas que lo cuantifiquen.
- Sobreajuste al dominio: entrenado con 320 problemas de MBPP y recompensa de ejecución binaria, puede generar código que pase tests pero no sea idiomático, seguro o eficiente.
- Riesgo de alucinación: como todo LLM, puede producir APIs inexistentes, imports erróneos o código que parece válido pero falla en ejecución fuera del conjunto de tests.
- Idiomas y contexto: no documentados; se desconoce si el multilingüismo del modelo base se preserva.
- Licencia Apache 2.0: permite uso comercial, pero al ser un artefacto experimental sin garantías de calidad, su uso en producción no está recomendado por el propio autor.
- Sin cuantizaciones oficiales: no hay GGUF, AWQ ni GPTQ publicados, lo que limita el despliegue en entornos de bajos recursos sin conversión manual.
- Sin datos de benchmarks publicados: imposible comparar su calidad con alternativas sin ejecutar la evaluación uno mismo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/RL-Forgettting-Exp4/code-q3_1p7b-replay-balancedcd-lam0p1
- Rama hermana con `hard_cooldown`: https://huggingface.co/RL-Forgetting-Experiments-3/code-q3_1p7b-replay-lam0p1
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Dataset MBPP+: https://huggingface.co/datasets/evalplus/mbppplus
- Dataset MBPP: https://huggingface.co/datasets/google-research-datasets/mbpp
