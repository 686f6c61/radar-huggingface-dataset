# lair-nyu/yor_icl_pi0_fast_expanded_full

## Resumen

El modelo `lair-nyu/yor_icl_pi0_fast_expanded_full` es una política de visión-lenguaje-acción (VLA) de tipo `pi0-fast`, desarrollada por el laboratorio LAIR de la Universidad de Nueva York. Se trata de un ajuste fino (fine-tuning) del modelo base `pi0_fast_base` de la librería openpi, especializado en tareas bimanuales de pick-and-place sobre un subconjunto expandido de 31 tareas y 1.784 episodios del dataset `icl-dataset`. El modelo emplea tokenización discreta FAST para las acciones, lo que lo convierte en un VLA autorregresivo, a diferencia de los enfoques continuos basados en flow-matching como `pi05` o VICTR.

La relevancia de este modelo radica en que demuestra la viabilidad de la arquitectura `pi0-fast` para tareas de manipulación bimanual con un espacio de acción de 20 dimensiones y un horizonte de 30 pasos. Al estar entrenado con 50.000 pasos y un esquema de decaimiento coseno, ofrece un checkpoint final listo para inferencia o fine-tuning adicional. Su licencia Apache 2.0 facilita su uso en investigación y aplicaciones comerciales, aunque su especialización en un dataset concreto limita su generalización a otras tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi0-fast (VLA autorregresivo con tokenización discreta FAST) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a acciones robóticas, no a lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (presumiblemente safetensors, pero no se especifica) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura `pi0-fast` de openpi, que combina un codificador de visión-lenguaje con un decodificador autorregresivo de acciones tokenizadas mediante el tokenizador FAST. A diferencia de los modelos continuos de flow-matching, `pi0-fast` discretiza las acciones en tokens, lo que simplifica el entrenamiento y evita ciertos artefactos numéricos. La configuración específica (`Pi0FASTConfig`) define `action_dim=20`, `action_horizon=30` y `max_token_len=256`.

El entrenamiento se realizó sobre el subconjunto expandido de 31 tareas y 1.784 episodios del dataset `icl-dataset`, partiendo de los pesos de `pi0_fast_base`. Se emplearon 50.000 pasos con un batch size de 128, optimizador AdamW y un programa de decaimiento coseno con una tasa de aprendizaje pico de 5e-5, un warmup de 2.000 pasos y un decaimiento hasta 5e-6. El checkpoint final corresponde al paso 49.999 y solo incluye los parámetros del modelo (sin estado del optimizador), por lo que no es reanudable pero sí utilizable para inferencia o fine-tuning.

Una característica técnica destacable es que, a diferencia de los brazos continuos `pi05`/VICTR entrenados sobre el mismo dataset, este modelo no requirió el ajuste de normalización por cuantiles documentado para `pi05_extended_quantilesfixed`. La tokenización discreta de FAST recorta los valores antes de cuantizar, evitando el problema de pérdida explosiva que afecta a los modelos continuos en dimensiones con rangos de cuantiles casi nulos.

## Capacidades

- Control de robots bimanuales: el modelo genera acciones discretas para 20 dimensiones (incluyendo velocidades base y elevación) con un horizonte de 30 pasos, adecuado para tareas de pick-and-place.
- Ejecución de tareas de manipulación: entrenado en 31 tareas de recogida y colocación, puede ejecutar secuencias de acciones coordinadas entre dos brazos.
- Inferencia autorregresiva: al ser un modelo FAST, produce acciones token a token, lo que permite una decodificación secuencial compatible con pipelines de control en tiempo real.
- Fine-tuning sobre nuevos datasets: al ser un checkpoint de parámetros, puede servir como punto de partida para adaptarlo a otras tareas robóticas mediante openpi.
- No incluye capacidades de lenguaje general, tool calling, ni soporte multimodal más allá de la entrada visual y de instrucciones propias de los VLA.

## Casos de uso

- Automatización de líneas de montaje: el modelo puede controlar robots bimanuales para tareas repetitivas de recogida y colocación de piezas, reduciendo el tiempo de ciclo gracias a su horizonte de 30 pasos.
- Investigación en manipulación bimanual: sirve como referencia para estudiar la eficacia de la tokenización FAST frente a enfoques continuos en entornos con espacios de acción de alta dimensión.
- Desarrollo de políticas de control para robots humanoides: al incluir dimensiones de velocidad base y elevación, puede adaptarse a plataformas móviles con brazos, como robots de servicio.
- Fine-tuning para tareas específicas de la industria: partiendo de este checkpoint, un equipo puede ajustar el modelo con pocos episodios de su propio dataset para personalizar comportamientos de agarre y colocación.
- Evaluación de arquitecturas VLA en robótica: permite comparar el rendimiento de `pi0-fast` con otros modelos como `pi05` o VICTR en el mismo conjunto de tareas, gracias a su disponibilidad pública.
- Simulación y entrenamiento de agentes: puede integrarse en entornos de simulación robótica (por ejemplo, MuJoCo o Isaac Sim) para validar políticas antes del despliegue físico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no incluye métricas de evaluación como MMLU, HumanEval o GSM8K, ya que se trata de un modelo de robótica y no de lenguaje general. Tampoco se proporcionan comparativas cuantitativas con otros modelos en tareas de manipulación.

## Requisitos de hardware

- El tamaño del repositorio es de 10,8 GB, lo que sugiere que el checkpoint ocupa aproximadamente esa cantidad en memoria (probablemente en precisión bf16 o fp32). Para inferencia se recomienda una GPU con al menos 12-16 GB de VRAM, dependiendo de la precisión y el batch size.
- No se especifican GPUs concretas, pero una NVIDIA RTX 4090 (24 GB) o una A100 (40/80 GB) serían adecuadas para ejecutar el modelo sin cuantización.
- Al ser un modelo de openpi, puede desplegarse con las herramientas de la librería, como el servidor de inferencia de openpi o mediante integración con frameworks de robótica.
- No se dispone de datos de latencia o throughput; estos dependerán del hardware y del tamaño de lote utilizado.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yor_icl_pi0_fast_expanded_full` (este) | pi0-fast (autorregresivo) | no disponible | no disponible | Apache 2.0 | Hugging Face |
| `pi0_fast_base` (modelo base) | pi0-fast | no disponible | no disponible | Apache 2.0 | openpi |
| `yor_icl_fast_victr_vision_expanded_full` | pi0.5 (flow-matching) | no disponible | no disponible | Apache 2.0 | Hugging Face |
| `yor_icl_pi0_fast_easy_pnp_v2_sanity15k_annealing` | pi0-fast | no disponible | no disponible | Apache 2.0 | Hugging Face |

La comparativa se limita a modelos del mismo ecosistema openpi. No se dispone de datos de rendimiento para establecer una comparación cuantitativa. La principal diferencia con `pi0.5` es el mecanismo de generación de acciones: discreto (FAST) frente a continuo (flow-matching).

## Limitaciones y advertencias

- Especialización limitada: el modelo está entrenado exclusivamente en 31 tareas de pick-and-place bimanual; no generaliza a otras tareas de manipulación sin fine-tuning adicional.
- Sin capacidades de lenguaje: no puede procesar instrucciones complejas ni mantener diálogos; su entrada se limita a observaciones visuales y comandos de acción.
- Riesgo de alucinación en acciones: como todo modelo generativo, puede producir secuencias de acciones no válidas o inseguras si se usa fuera de su dominio de entrenamiento.
- Sin estado de optimizador: el checkpoint no incluye `train_state`, por lo que no es posible reanudar el entrenamiento exacto; solo sirve para inferencia o fine-tuning desde cero.
- Sesgos del dataset: el dataset `icl-dataset` puede contener sesgos en la distribución de objetos, posiciones o estilos de agarre, lo que afecta al rendimiento en entornos diferentes.
- Requisitos de hardware: el tamaño del modelo (10,8 GB) puede ser prohibitivo para GPUs de gama baja sin cuantización, y no se ofrecen versiones cuantizadas.
- Sin garantías de seguridad: al ser un modelo de control robótico, su uso en entornos físicos requiere supervisión y validación exhaustiva para evitar daños.

## Enlaces

- [Hugging Face - lair-nyu/yor_icl_pi0_fast_expanded_full](https://huggingface.co/lair-nyu/yor_icl_pi0_fast_expanded_full)
- [Repositorio openpi (Physical Intelligence)](https://github.com/Physical-Intelligence/openpi)
- [Sitio web de OpenPI](https://www.openpi.net/english.html)
- [Repositorio PI_Official (Spirit-AI-Team)](https://github.com/Spirit-AI-Team/PI_Official)
- [Modelo relacionado: yor_icl_pi0_fast_easy_pnp_v2_sanity15k_annealing](https://huggingface.co/lair-nyu/yor_icl_pi0_fast_easy_pnp_v2_sanity15k_annealing)
- [Modelo relacionado: yor_icl_fast_victr_vision_expanded_full](https://huggingface.co/lair-nyu/yor_icl_fast_victr_vision_expanded_full)
