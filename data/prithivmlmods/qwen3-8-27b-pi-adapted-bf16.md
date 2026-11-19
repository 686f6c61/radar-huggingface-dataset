# prithivMLmods/Qwen3.8-27B-pi-adapted-bf16

## Resumen

Qwen3.8-27B-pi-adapted-bf16 es un checkpoint autónomo en BF16 publicado por el usuario prithivMLmods que fusiona el adaptador LoRA `harness-hub/Qwen3.8-27B-pi-adapted` sobre el modelo base Qwen/Qwen3.8-27B. El objetivo de la fusión es eliminar la dependencia de soporte LoRA en el motor de inferencia, de modo que el modelo pueda servirse en cualquier runtime que cargue pesos estándar en safetensors. El adaptador original se entrenó con aprendizaje por refuerzo AsyncGRPO en entornos Harbor/OpenEnv para convertir el modelo en la columna vertebral del agente de programación pi, orientado a tareas de ingeniería de software y de terminal.

El modelo conserva la arquitectura y el layout de shards del base Qwen3.8-27B, con 27.781.427.952 parámetros totales (aproximadamente 27,8 mil millones) y pesos distribuidos en 18 shards que suman 55,6 GB en el repositorio. La ficha del adaptador reporta mejoras sustanciales en benchmarks de agentes: Terminal-Bench 2.1 pasa del 39,5 % al 55,8 % y SWE-bench Pro (hard 51) del 29,4 % al 62,7 %, con reducciones del 62 % y 55 % en llamadas a herramientas por tarea. Es relevante ahora porque empaqueta en un único artefacto desplegable una especialización de agente que de otro modo requeriría gestión de adaptadores en producción.

La licencia es Apache 2.0 y el idioma declarado es inglés. El pipeline declarado es image-text-to-text, lo que sugiere capacidades multimodales heredadas del base, aunque la model card no detalla el entrenamiento de visión. El checkpoint está pensado para usarse con el modo de razonamiento (thinking) desactivado, tal como se entrenó.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.8, tag `qwen3_5`), con tensores MTP preservados |
| Parametros totales | 27.781.427.952 (~27,8 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 como checkpoint publicado; no se listan otras cuantizaciones oficiales |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (18 shards, 55,6 GB), más `chat_template.jinja`, `config.json`, `generation_config.json`, `merges.txt` |

## Arquitectura y entrenamiento

El modelo es un transformer de la familia Qwen3.8 con aproximadamente 27,8 mil millones de parámetros. El checkpoint publicado no es un entrenamiento desde cero, sino una fusión de pesos: se parte de Qwen/Qwen3.8-27B y se aplica la actualización estándar `W + (alpha/r)·B@A` del adaptador LoRA `harness-hub/Qwen3.8-27B-pi-adapted`, con r = 32 y alpha = 64, sobre las proyecciones q, k, v, o, gate, up y down. La fusión se realizó por tensor en fp32 y se volvió a convertir a BF16, conservando el layout de shards, los nombres de tensores y todos los tensores MTP (multi-token prediction) del base.

El adaptador original se entrenó con AsyncGRPO (una variante asíncrona de GRPO, aprendizaje por refuerzo con preferencias grupales) dentro de entornos Harbor/OpenEnv, con el objetivo de que el modelo actuara como backbone del agente de programación pi en tareas de ingeniería de software y de terminal. Los datasets citados son `harness-hub/scale800-harbor` y `harness-hub/termgrade-train-harbor`. El entrenamiento se realizó con el modo thinking desactivado, y la model card recomienda mantener esa configuración en inferencia. No se especifican el número de tokens de entrenamiento ni la composición detallada del dataset.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat propia (`chat_template.jinja`).
- Ejecución de tareas de agente en terminal: comandos de shell, navegación de sistemas de ficheros y resolución de problemas de software.
- Ingeniería de software asistida: edición de código, parches y resolución de issues en el marco del agente pi.
- Uso de herramientas (tool calling) optimizado: el adaptador reduce entre un 55 % y un 62 % las llamadas por tarea según la ficha del adaptador.
- Razonamiento multi-paso orientado a agentes, entrenado mediante RL en entornos con recompensa verificable.
- Capacidades multimodales declaradas por el pipeline `image-text-to-text` (entrada de imagen y texto), aunque no se detalla su alcance.
- Soporte de decodificación con tensores MTP preservados desde el base.
- Modo thinking disponible en el base, pero desaconsejado para el uso previsto (se entrenó con thinking off).

## Casos de uso

- Agente de terminal automatizado: el modelo puede recibir un objetivo en lenguaje natural y ejecutar secuencias de comandos de shell en un entorno controlado, aprovechando su entrenamiento específico en Terminal-Bench y la reducción de llamadas a herramientas para abaratar cada episodio.
- Resolución de issues en repositorios: integrado en un pipeline tipo SWE-bench, el modelo lee el repositorio, localiza el fallo, genera un parche y lo valida ejecutando tests, con el formato de agente pi para el que fue entrenado.
- Asistente de CI/CD: conectado a herramientas de build y test mediante function calling, puede diagnosticar fallos de integración continua y proponer correcciones dentro del mismo bucle de agente.
- Automatización de tareas de administración de sistemas: dado que opera sobre terminal, encaja en flujos de aprovisionamiento, limpieza de logs o comprobación de estado de servicios, siempre con sandboxing estricto.
- Evaluación de agentes y banco de pruebas: sirve como referencia para medir políticas de agentes en Harbor/OpenEnv, al ser un checkpoint autónomo sin necesidad de cargar adaptadores.
- Despliegue en motores sin soporte LoRA: al estar fusionado en BF16, puede servirse en runtimes que solo aceptan safetensors estándar, simplificando la infraestructura frente a la variante con adaptador.
- Prototipado de asistentes multimodales en inglés: el pipeline image-text-to-text permite experimentar con entradas de imagen y texto, aunque sin garantías documentadas sobre el rendimiento en visión.

## Benchmarks y rendimiento

Los datos disponibles corresponden al adaptador sobre el base BF16, medidos antes de la fusión; la model card advierte que no se han reevaluado sobre este checkpoint fusionado.

| Benchmark | Base (BF16) | Con adaptador pi | Variación |
|---|---|---|---|
| Terminal-Bench 2.1 | 39,5 % | 55,8 % | +16,3 puntos |
| SWE-bench Pro (hard 51) | 29,4 % | 62,7 % | +33,3 puntos |
| Llamadas a herramientas por tarea (Terminal-Bench) | referencia | −62 % | reducción |
| Llamadas a herramientas por tarea (SWE-bench Pro) | referencia | −55 % | reducción |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la información disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 55,6 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 64-80 GB.
- GPU recomendadas para BF16: A100 80 GB, H100 80 GB o múltiples GPU con tensor parallelism (por ejemplo, 2× A100 40 GB o 2× RTX 4090 24 GB con sharding).
- GPU de consumo: no cabe en una sola RTX 4090 (24 GB) en BF16; requeriría cuantización a 8 o 4 bits, no publicada oficialmente en este repositorio.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag presente); vLLM, llama.cpp u Ollama no están confirmados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-pi-adapted-bf16 (este) | ~27,8 B | no disponible | Agente de código y terminal (pi) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.8-27B (base) | ~27,8 B | no disponible | Generalista | Apache 2.0 (según base) | Hugging Face |
| harness-hub/Qwen3.8-27B-pi-adapted (adaptador) | ~27,8 B + LoRA | no disponible | Agente de código y terminal (pi) | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Los benchmarks reportados corresponden al adaptador evaluado sobre el base BF16, no a este checkpoint fusionado; el rendimiento real puede diferir.
- El entrenamiento se realizó con thinking desactivado; activar el modo de razonamiento puede degradar el comportamiento esperado.
- Idioma declarado únicamente inglés; no hay evidencia de calidad multilingüe.
- Longitud de contexto no documentada, lo que impide planificar cargas con ventanas largas.
- Riesgo de alucinación inherente a modelos generativos, agravado en tareas de agente donde una acción errónea en terminal puede tener efectos destructivos.
- Requiere sandboxing estricto en producción: el modelo está diseñado para ejecutar comandos y editar código, con el riesgo de acciones no deseadas si se le da acceso sin restricciones.
- No se publican cuantizaciones oficiales (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware de consumo.
- La fusión de LoRA puede introducir pequeñas diferencias numéricas respecto al adaptador original; no se documenta una validación exhaustiva de equivalencia.
- Sesgos conocidos: no documentados en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prithivMLmods/Qwen3.8-27B-pi-adapted-bf16
- Modelo base del adaptador: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de entrenamiento: https://huggingface.co/datasets/harness-hub/scale800-harbor
- Dataset de entrenamiento: https://huggingface.co/datasets/harness-hub/termgrade-train-harbor
- Configuración: https://huggingface.co/prithivMLmods/Qwen3.8-27B-pi-adapted-bf16/blob/main/config.json
- Plantilla de chat: https://huggingface.co/prithivMLmods/Qwen3.8-27B-pi-adapted-bf16/blob/main/chat_template.jinja
