# Aether258/pi05_bi_two_tubes_all_step8000

## Resumen

El modelo `pi05_bi_two_tubes_all_step8000` es un checkpoint de fine-tuning del modelo base `pi05_bi` de la librería openpi, desarrollado por Aether258. Está especializado en una tarea de manipulación bimanual de pick-and-place de dos tubos (azul y verde), con entrada multimodal de imágenes RGB y datos táctiles. El problema que resuelve es la ejecución de secuencias de manipulación coordinada con dos brazos robóticos, donde el orden de las acciones es crítico: primero recoger el tubo azul con la mano izquierda, luego el verde con la derecha, y después colocarlos de vuelta en el mismo orden.

La arquitectura se basa en PaliGemma como modelo de lenguaje, con un vision tower SigLIP para procesar las imágenes y un action expert con flow-matching para generar las acciones. El checkpoint en el paso 8000 es el que presenta mejor loss de validación en episodios no vistos, lo que lo convierte en la elección óptima para generalización frente a memorización. El repositorio ocupa 9.6 GB e incluye pesos de inferencia, estadísticas de normalización y estado del optimizador para reanudar entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PaliGemma (LLM) + SigLIP (vision tower) + action expert con flow-matching |
| Parametros totales | no disponible (el fine-tuning entrena 463M parametros, de los cuales ~413M son del vision tower) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de robotica, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | orbax OCDBT (directorio `params/`), con `norm_stats.json` en assets |

## Arquitectura y entrenamiento

El modelo parte de `pi05_bi`, que combina un LLM PaliGemma con un vision tower SigLIP para procesar observaciones visuales y un action expert basado en flow-matching para generar acciones continuas. El fine-tuning utiliza LoRA con rango 16 en el LLM y rango 32 en el action expert, mientras que el vision tower se fine-tunea completamente (el filtro de congelación solo afecta a `.*llm.*`). Esto resulta en 463M parametros entrenables, de los cuales aproximadamente 413M corresponden a pesos del ViT.

El entrenamiento se realizó sobre el dataset `KaiyueChen/two_tubes_01` (LeRobot v2.1, 30 fps, robot bimanual), con 519 episodios (467 train, 52 val_seen, 52 val_unseen) y 425,115 frames en total. El split es estratificado por fuente con 10% retenido (seed=42). Las estadísticas de normalización se calcularon solo sobre el split de entrenamiento (quantiles q01/q99) para evitar fuga de datos. Se usaron 2 GPUs A100-80GB con FSDP, batch size 128, y se entrenó durante 12,000 pasos; el checkpoint en el paso 8000 corresponde a 2.68 épocas.

## Capacidades

- Ejecución de tareas de manipulación bimanual con coordinación de dos brazos robóticos.
- Procesamiento multimodal de 6 imágenes de 224×224: dos cámaras RGB (`camera0`, `camera1`) y cuatro imágenes táctiles (`tactile_{left,right}_{0,1}`).
- Generación de acciones de 20 dimensiones (estado y acción) para control del robot.
- Generalización a episodios no vistos: el checkpoint en step 8000 minimiza el loss en `val_unseen`, indicando capacidad de extrapolación más allá de memorización.
- Integración con el ecosistema openpi para carga y despliegue de checkpoints.
- No incluye capacidades de generación de texto, tool calling ni agentes conversacionales; es un modelo puramente de control robótico.

## Casos de uso

- Automatización de líneas de ensamblaje: el modelo puede gestionar tareas de recogida y colocación de piezas en un orden específico, como en la tarea de dos tubos, donde la secuencia de acciones es crítica para evitar colisiones o errores.
- Robótica de laboratorio: manipulación de muestras o tubos de ensayo con dos brazos, donde la entrada táctil permite ajustar la fuerza de agarre en tiempo real.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la generalización en tareas bimanuales, gracias a su split de validación con episodios no vistos.
- Desarrollo de sistemas de control con realimentación táctil: el uso de imágenes táctiles como entrada permite entrenar políticas que responden a la textura y deformación de los objetos.
- Benchmarking de algoritmos de fine-tuning eficiente: el uso de LoRA con fine-tuning completo del vision tower ofrece un caso de estudio sobre cómo equilibrar adaptación y generalización.
- Despliegue en robots reales con openpi: el checkpoint se puede cargar directamente en configuraciones de openpi para inferencia en robots bimanuales, reduciendo el tiempo de desarrollo de nuevas tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU o HumanEval) porque se trata de un modelo de robótica, no de lenguaje. La model card proporciona la evolución del loss de validación durante el entrenamiento, que se presenta a continuación:

| step | train | val_seen | val_unseen | gap |
|---:|---:|---:|---:|---:|
| 2000 | 0.0547 | 0.0549 | 0.0614 | +0.0065 |
| 4000 | 0.0475 | 0.0486 | 0.0548 | +0.0062 |
| 6000 | 0.0443 | 0.0463 | 0.0551 | +0.0088 |
| **8000** | **0.0419** | **0.0436** | **0.0542** | +0.0106 |
| 10000 | 0.0403 | 0.0416 | 0.0553 | +0.0137 |

El loss en `val_unseen` alcanza su mínimo en el paso 8000 y no mejora después, mientras que `val_seen` sigue bajando, lo que indica que el aprendizaje posterior al paso 4000 es mayormente memorización. El autor advierte que cada pasada de validación cubre solo 3-4 episodios por split, por lo que el valor absoluto del gap no es fiable, aunque la tendencia sí lo es.

## Requisitos de hardware

- El entrenamiento se realizó con 2 GPUs A100-80GB usando FSDP, por lo que la inferencia puede ejecutarse en una sola GPU con suficiente VRAM.
- No se especifican requisitos mínimos de VRAM para inferencia; dado que el modelo tiene ~463M parámetros entrenables y el checkpoint pesa 9.6 GB, se estima que una GPU con al menos 16 GB de VRAM podría ser suficiente en precisión FP16, aunque no hay datos confirmados.
- El despliegue se realiza mediante la librería openpi, que gestiona la carga de pesos y la ejecución de la política.
- No se mencionan opciones de cuantización ni soporte para llama.cpp u Ollama; el formato orbax OCDBT es específico de JAX/openpi.
- La latencia y el throughput no están documentados en la información disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (fine-tunings de pi05_bi para tareas bimanuales con entrada táctil) dentro de los datos proporcionados. El autor tiene otros checkpoints similares (por ejemplo, `pi05_bi_vitac_clean_smash_24` y `pi05_bi_vitac_byw_smash_13`), pero no se detallan sus especificaciones ni rendimiento.

## Limitaciones y advertencias

- La validación se realiza sobre un número muy reducido de episodios (3-4 por split), lo que hace que el valor exacto del gap entre `val_seen` y `val_unseen` no sea estadísticamente robusto.
- El modelo está entrenado específicamente para la tarea de dos tubos con un robot bimanual concreto; no se garantiza generalización a otras tareas o configuraciones robóticas sin fine-tuning adicional.
- La entrada táctil es esencial para el funcionamiento; si el robot no dispone de sensores táctiles, el modelo no podrá operar correctamente.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado con datos de demostración, puede heredar sesgos de las trayectorias de los operadores humanos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende de openpi y de los datasets asociados, cuyas licencias deben verificarse por separado.
- El checkpoint en step 8000 es el recomendado por el autor; usar el checkpoint final (step 12000) degradaría la generalización, como se observa en la tabla de validación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Aether258/pi05_bi_two_tubes_all_step8000
- Dataset de entrenamiento: https://huggingface.co/datasets/KaiyueChen/two_tubes_01
- Perfil del autor: https://huggingface.co/Aether258
