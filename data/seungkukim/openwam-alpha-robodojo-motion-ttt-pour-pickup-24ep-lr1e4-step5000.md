# seungkukim/openwam-alpha-robodojo-motion-ttt-pour-pickup-24ep-lr1e4-step5000

## Resumen

OpenWAM-Alpha RoboDojo (post-entrenado sobre rollouts con límites de movimiento) es un checkpoint de un modelo mundo-acción para robótica desarrollado por el usuario `seungkukim` a partir del modelo base `OpenWAM/OpenWAM-Alpha-Sim-RoboDojo`, que a su vez forma parte de la familia OpenWAM presentada en el artículo arXiv:2609.07398 (Wang et al., 2026). El modelo aborda el problema de la planificación y ejecución de acciones robóticas en simulación a partir de observaciones visuales, combinando un backbone de vídeo (Wan2.2-TI2V-5B) con un cabezal de predicción de acciones dentro del framework modular `openwam`.

Este repositorio concreto es un ajuste fino (post-training) sobre tres tareas de RoboDojo —`play_tic_tac_toe`, `pour_balls_into_vase` y `general_pickup`— utilizando 72 episodios (24 por tarea) de rollouts generados por un agente LLM y filtrados para cumplir límites de velocidad y jerk del brazo robótico. El checkpoint corresponde a la configuración de learning rate 1e-4 tras 5000 pasos de entrenamiento, uno de los cuatro puntos de un barrido sistemático de hiperparámetros (lr 1e-4 vs 5e-5, step 2000 vs 5000).

Su relevancia es metodológica más que de producto: demuestra un flujo de post-entrenamiento reproducible sobre datos de simulación de alta calidad (episodios "limpios" y con movimiento restringido), manteniendo compatibilidad total con el modelo base (mismos nombres de tensores, mismo `normalization_stats.npy` y mismo layout), lo que lo convierte en un reemplazo directo (*drop-in*) para experimentación en investigación robótica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo mundo-acción (world-action model) dentro del framework OpenWAM; backbone de vídeo Wan2.2-TI2V-5B |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors, presumiblemente bf16 según `mixed_precision`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`checkpoint_step_*.safetensors`) + `config.yaml` + `normalization_stats.npy` |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base `OpenWAM-Alpha-Sim-RoboDojo`, un modelo mundo-acción que combina un backbone de generación de vídeo (Wan2.2-TI2V-5B, configurado mediante `model.video_backbone.model_path`) con un módulo de predicción de acciones. El repositorio no documenta detalles adicionales sobre el transformer subyacente, el número de parámetros ni la composición completa del corpus original de RoboDojo; solo se especifica que el post-entrenamiento reutiliza la normalización min-max del modelo base sin cambios (fichero `normalization_stats.npy` byte-idéntico, md5 `855296b406a1d16fbc92318564d6152d`), garantizando que la des-normalización de acciones en inferencia coincida exactamente con la del entrenamiento.

El ajuste fino se realizó sobre 72 episodios (29.736 frames) de rollouts HDF5 en simulación arx_x5, generados por un agente LLM y filtrados con dos criterios: éxito limpio (benchmark y todos los subobjetivos al primer intento) y movimiento limitado (velocidad y jerk dentro de los límites de las demostraciones expertas de RoboDojo). La configuración de entrenamiento usa batch global de 64 (16 × grad_accum 1 × 4 GPU H200), `max_steps` 5000, warmup ratio 0.10 (500 pasos), scheduler coseno con `lr_min_ratio` 0.01, ZeRO stage 2 y precisión mixta bf16, sin gradient checkpointing. No se menciona uso de RLHF, DPO ni decodificación especulativa.

## Capacidades

- Predicción de acciones robóticas en simulación (arx_x5) condicionada por observaciones visuales, dentro del paradigma world-action model.
- Ejecución de tres tareas concretas de RoboDojo: `play_tic_tac_toe`, `pour_balls_into_vase` y `general_pickup`.
- Generación de rollouts con restricciones cinemáticas (velocidad y jerk limitados) aprendidas de demostraciones expertas.
- Compatibilidad drop-in con el modelo base: mismos nombres de tensores, layout y ficheros auxiliares, lo que permite sustituir pesos sin cambiar el código de carga.
- Carga mediante `openwam.deploy.model_loader.load_from_checkpoint_dir`, que selecciona automáticamente el `checkpoint_step_*.safetensors` de mayor step.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en world-action models: servir como punto de comparación controlado en experimentos sobre cómo el volumen y la calidad de datos de post-entrenamiento afectan al rendimiento en manipulación simulada.
- Barrido de hiperparámetros reproducibles: el repositorio forma parte de un conjunto de cuatro checkpoints (lr 1e-4/5e-5 × step 2000/5000) que permite aislar el efecto de la tasa de aprendizaje y la duración del entrenamiento con todo lo demás constante.
- Generación de trayectorias seguras en simulación: los rollouts de entrenamiento respetan límites de velocidad y jerk, lo que hace al modelo adecuado para estudiar políticas con restricciones cinemáticas antes de transferir a hardware real.
- Benchmarking de tareas RoboDojo: evaluación de éxito en `play_tic_tac_toe`, `pour_balls_into_vase` y `general_pickup` como referencia para nuevos métodos de post-entrenamiento.
- Destilación de agentes LLM a políticas robóticas: los datos provienen de rollouts de un agente LLM, por lo que el checkpoint puede usarse para estudiar la brecha entre planificación simbólica y ejecución motora.
- Prototipado de pipelines de despliegue con `openwam`: validar la integración de `load_from_checkpoint_dir`, la carga del backbone Wan2.2 y la des-normalización de acciones en un entorno controlado antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Entrenamiento documentado: 4 × NVIDIA H200 con ZeRO stage 2 y bf16, batch global 64.
- VRAM de inferencia: no disponible. El backbone de vídeo Wan2.2-TI2V-5B (5B parámetros) implica, como mínimo, del orden de 10-12 GB en bf16 solo para ese componente, más el módulo de acciones; no se confirma la cifra total.
- GPU recomendadas: no disponible de forma explícita; por el tamaño del backbone, se requiere al menos una GPU con 24 GB o superior (RTX 4090, A100, H100, H200).
- Compatibilidad con GPU de consumo: plausible en RTX 4090 (24 GB) si el conjunto completo cabe en bf16, pero no confirmado por el autor.
- Opciones de despliegue: librería `openwam` (`openwam.deploy.model_loader.load_from_checkpoint_dir`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (lr1e4, step5000) | no disponible | no disponible | 3 tareas RoboDojo | Apache 2.0 | Hugging Face, 0 descargas |
| OpenWAM/OpenWAM-Alpha-Sim-RoboDojo (base) | no disponible | no disponible | Corpus RoboDojo completo | Apache 2.0 (según repo base) | Hugging Face |
| Checkpoint lr5e5, step5000 (mismo autor) | no disponible | no disponible | 3 tareas RoboDojo | Apache 2.0 | Hugging Face |
| Checkpoint lr1e4, step2000 (mismo autor) | no disponible | no disponible | 3 tareas RoboDojo | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks ni de modelos de terceros comparables en la información proporcionada; la comparativa se limita a los checkpoints de la misma familia.

## Limitaciones y advertencias

- Especialización estrecha: el post-entrenamiento cubre solo tres tareas de RoboDojo en simulación arx_x5; no hay evidencia de generalización a otras tareas, entornos o robots.
- Dataset muy pequeño: 72 episodios y 29.736 frames, lo que aumenta el riesgo de sobreajuste a las condiciones específicas de los rollouts.
- Dependencia del backbone externo: requiere descargar y configurar localmente Wan2.2-TI2V-5B y ajustar `model.video_backbone.model_path` en `config.yaml`; las rutas del config son placeholders.
- Sin métricas publicadas: no hay benchmarks, curvas de pérdida ni tasas de éxito reportadas, por lo que no es posible evaluar la calidad del checkpoint frente al base.
- Repositorio vacío en la práctica: tamaño de 0.0 GB, 0 descargas y 0 likes en el momento de la consulta; el peso real puede no estar subido o estar en proceso.
- Sin información sobre sesgos, alucinación o comportamiento fuera de distribución; al ser un modelo de acciones en simulación, el riesgo principal es la ejecución de trayectorias no válidas fuera de los límites cinemáticos entrenados.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de validación en hardware real desaconseja su uso en producción sin evaluación adicional.
- No se documentan idiomas, contexto ni cuantizaciones, lo que limita la planificación de despliegues en entornos con restricciones de memoria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/seungkukim/openwam-alpha-robodojo-motion-ttt-pour-pickup-24ep-lr1e4-step5000
- Modelo base: https://huggingface.co/OpenWAM/OpenWAM-Alpha-Sim-RoboDojo
- Dataset de rollouts: https://huggingface.co/datasets/seungkukim/robodojo-motion-rollouts-openwam-hdf5-ttt-pour-pickup-24ep
- Checkpoint lr1e4 step2000: https://huggingface.co/seungkukim/openwam-alpha-robodojo-motion-ttt-pour-pickup-24ep-lr1e4-step2000
- Checkpoint lr5e5 step2000: https://huggingface.co/seungkukim/openwam-alpha-robodojo-motion-ttt-pour-pickup-24ep-lr5e5-step2000
- Checkpoint lr5e5 step5000: https://huggingface.co/seungkukim/openwam-alpha-robodojo-motion-ttt-pour-pickup-24ep-lr5e5-step5000
- Artículo OpenWAM: arXiv:2609.07398 (Wang et al., 2026)
