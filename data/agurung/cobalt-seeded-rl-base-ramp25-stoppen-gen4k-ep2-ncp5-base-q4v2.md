# agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-base-q4v2

## Resumen

Este modelo es un checkpoint de aprendizaje por refuerzo (RL) basado en `Qwen/Qwen3-4B-Instruct-2507`, desarrollado por el usuario `agurung`. Se entrenó con el algoritmo GRPO de OpenRLHF aplicado directamente sobre el modelo base, sin una etapa previa de fine-tuning supervisado (SFT). El objetivo es mejorar la generación de código para problemas de programación, utilizando una recompensa binaria de correctitud: el modelo recibe 1.0 si el programa generado supera los tests del problema y 0.0 en caso contrario.

El checkpoint está guardado en el paso global 8 de un run de RL llamado `seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp5_base_q4v2` y se identifica como el mejor del run según la métrica `pass@8`. Tiene 4.411.424.256 parámetros (4.400 millones) y su arquitectura es un transformer decoder-only de la familia Qwen3. El modelo se ofrece como un artefacto de investigación en generación de código; la metadata del repositorio no especifica licencia ni idiomas soportados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-4B) |
| Parámetros totales | 4.411.424.256 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-4B, un transformer causal decoder-only con pesos almacenados en safetensors. El entrenamiento se realizó con OpenRLHF y el algoritmo GRPO (group-normalized advantages) sin penalización KL. La señal de recompensa es binaria: 1.0 si el código generado pasa los tests del problema y 0.0 en caso contrario.

El procedimiento de entrenamiento incluye dos shaping de recompensa para evitar truncamientos: un "stop-properly penalty" que fija la recompensa de las muestras truncadas a -1.0, y un "DAPO overlong penalty" que añade una penalización creciente hasta -0.25 a las respuestas que caen en los últimos 1024 tokens antes del límite de generación. Los datos provienen del conjunto `cobalt-train ≤2/64 frontier`, con 1.833 problemas de entrenamiento y 112 de validación. Se usaron 8 muestras por prompt, tamaño de rollout batch 128, tamaño de train batch 128, un máximo de 4.096 tokens nuevos por rollout, 2 episodios y una tasa de aprendizaje de actor de 1e-06 constante. No se utilizó RLHF ni DPO clásico; el RL se aplicó directamente sobre el modelo base instruct.

## Capacidades

- Generación de código: el modelo está especializado en resolver problemas de programación cuya solución debe superar tests automatizados. Las métricas de validación reportadas por el autor son `pass@1` = 0.4484 y `pass@8` = 1.8573.
- Interfaz de instrucciones: al partir de `Qwen3-4B-Instruct-2507`, el modelo conserva la capacidad de seguir instrucciones de texto del modelo base, aunque con una especialización posterior en código.
- Evaluación de muestreo múltiple: la validación se realizó con 8 muestras por problema a temperatura 1.0, lo que permite medir la probabilidad de resolver un problema con varios intentos.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni razonamiento explícito.

## Casos de uso

- Resolución de problemas de competición de programación: el modelo puede recibir un enunciado con tests y generar una solución en el lenguaje requerido. Es adecuado porque la recompensa de entrenamiento se basa directamente en la correctitud frente a tests.
- Asistente de autocompletado en IDEs: puede integrarse en entornos de desarrollo para sugerir funciones que cumplan especificaciones concretas. Su tamaño de 4.4B permite desplegarlo con vLLM en un servidor local o en la nube.
- Automatización de tareas de programación en un entorno sandbox: el modelo genera una solución, un script externo la compila y ejecuta los tests, y se le puede proporcionar el error para iterar. Es adecuado para prototipos de agentes de desarrollo porque la señal de entrenamiento es binaria y el modelo está acostumbrado a producir código verificable.
- Investigación en RL para código: el checkpoint es un punto de partida para estudiar cómo GRPO y las penalizaciones de truncamiento afectan a la resolución de problemas. Permite reproducir el run completo desde los logs referenciados por el autor.
- Integración en pipelines de evaluación de código: el modelo puede generar candidatos de solución que luego se verifican automáticamente, aumentando la cobertura de herramientas de evaluación en entornos de CI.
- Entrenamiento posterior: al ser un checkpoint intermedio, sirve como base para continuar el entrenamiento por RL o aplicar un SFT posterior. Los pesos en safetensors se cargan directamente con `transformers`.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| pass@1 (validación, 8 muestras) | 0.4484 |
| pass@8 (validación, 8 muestras) | 1.8573 |

Los valores proceden de la model card del autor y se obtuvieron en el conjunto de validación de 112 problemas del run `seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp5_base_q4v2`. El valor de `pass@8` es atípico; en la model card se define como "problem counted solved if any sample is correct", por lo que se recomienda consultar la definición exacta antes de interpretarlo. No se han publicado comparativas con otros modelos ni resultados en benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- No se han publicado requisitos de hardware específicos en la información disponible.
- El repositorio tiene 17.7 GB, lo que sugiere que los pesos están almacenados en FP32 (4.400 millones de parámetros × 4 bytes ≈ 17.6 GB).
- Para inferencia en FP16/BF16, se estima que los pesos ocupan unos 10 GB de VRAM; añadiendo la caché KV y el overhead de inferencia, se recomienda una GPU con al menos 16 GB de VRAM, como una RTX 4090 (24 GB) o una A100 (40 GB u 80 GB).
- Si se cargan los pesos en FP32 sin conversión, se necesitan alrededor de 20 GB de VRAM.
- Opciones de despliegue conocidas: `vllm serve agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-base-q4v2 --revision main`, o carga directa con `transformers`.
- No se han publicado datos de latencia ni throughput.

## Comparativa con modelos similares

No se han publicado benchmarks comparativos con otros modelos en la información disponible. Los resultados de la búsqueda web muestran dos checkpoints del mismo autor, `agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-nb21iid16` y `agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-nb21groot16`, que parecen ser variantes del mismo run de RL. No hay datos suficientes para establecer una comparación técnica entre ellos ni con el modelo base Qwen3-4B.

## Limitaciones y advertencias

- Licencia no especificada: el repositorio no indica una licencia. Antes de un uso comercial, hay que verificar la licencia del modelo base `Qwen/Qwen3-4B-Instruct-2507` y la del adaptador.
- Checkpoint experimental: es el paso global 8 de un run de RL, no un modelo final. El rendimiento puede ser inestable y no se ha evaluado fuera del conjunto de problemas de código.
- Métricas limitadas: solo se reportan `pass@1` y `pass@8` en un conjunto de validación reducido de 112 problemas. No hay resultados en benchmarks estándar de código ni en pruebas de conocimiento general.
- Riesgo de alucinación: al ser un modelo de generación de código, puede producir soluciones sintácticamente válidas pero incorrectas que no pasen los tests, sin que el propio modelo pueda verificar su salida.
- Contexto e idiomas: la longitud de contexto y los idiomas soportados no están documentados en la información disponible.
- Sin SFT previo: el RL se aplicó directamente sobre el modelo base instruct sin un fine-tuning supervisado intermedio. Esto puede afectar a la alineación de instrucciones fuera de la tarea de programación.
- No se documenta soporte de tool calling ni agentes, por lo que no se debe asumir que estas capacidades estén disponibles.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-base-q4v2
- Checkpoint relacionado: https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-nb21iid16
- Checkpoint relacionado: https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-nb21groot16
- No se han encontrado papers, blogs ni demos en la búsqueda web.
