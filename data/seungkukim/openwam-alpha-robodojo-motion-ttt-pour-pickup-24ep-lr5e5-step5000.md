# seungkukim/openwam-alpha-robodojo-motion-ttt-pour-pickup-24ep-lr5e5-step5000

## Resumen

OpenWAM-Alpha RoboDojo es un modelo de mundo-acción (world-action model) para robótica, desarrollado en el ecosistema OpenWAM y publicado por el usuario seungkukim. Se trata de un post-entrenamiento (fine-tuning) del checkpoint base `OpenWAM/OpenWAM-Alpha-Sim-RoboDojo`, ajustado sobre rollouts de agente LLM con limitación de movimiento para tres tareas de simulación del benchmark RoboDojo: `play_tic_tac_toe`, `pour_balls_into_vase` y `general_pickup`. El modelo predice acciones de brazo robótico a partir de observaciones, integrando un backbone de vídeo Wan2.2-TI2V-5B como componente de representación visual.

El problema que aborda es la generación de políticas de control robótico realistas y suaves en simulación, evitando movimientos bruscos mediante límites de velocidad y jerk derivados de las demostraciones expertas de RoboDojo. El checkpoint corresponde a una de las cuatro variantes de un barrido de learning rate (lr 5e-5, paso 5000) y se distribuye como reemplazo directo del modelo base, manteniendo layout, nombres de tensores y ficheros auxiliares idénticos.

La relevancia actual radica en su carácter abierto (licencia Apache 2.0) y modular dentro del ecosistema OpenWAM, que busca estandarizar el preentrenamiento de modelos mundo-acción. El repositorio ocupa 24,8 GB y la información pública sobre arquitectura interna, número de parámetros y contexto es limitada; los datos disponibles se detallan a continuación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo mundo-acción con backbone de vídeo Wan2.2-TI2V-5B) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, precisión de entrenamiento bf16) |
| Idiomas soportados | no disponible (modelo de robótica, no orientado a texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`checkpoint_step_*.safetensors`) |

## Arquitectura y entrenamiento

El modelo se apoya en la arquitectura del base `OpenWAM-Alpha-Sim-RoboDojo`, que combina un backbone de vídeo Wan2.2-TI2V-5B (referenciado en la configuración como `model.video_backbone.model_path`) con un cabezal de predicción de acciones. No se dispone de detalles públicos sobre el número de capas, dimensión oculta o mecanismo de atención en la información proporcionada. El post-entrenamiento reutiliza la configuración del modelo base salvo los parámetros modificados explícitamente.

El ajuste se realizó sobre 72 episodios (24 por tarea), 29.736 frames en formato HDF5 de RoboDojo con simulación `arx_x5`. Solo se conservaron episodios "limpios" (éxito en el benchmark y en todos los subobjetivos al primer intento) y con movimiento limitado: el brazo se movió dentro de límites de velocidad y jerk tomados de las demostraciones expertas, verificados durante la grabación y re-comprobados por episodio. El entrenamiento usó batch global de 64 (16 × grad_accum 1 × 4 GPU H200), 5000 pasos, learning rate 5e-5 con scheduler coseno (lr_min_ratio 0.01), warmup_ratio 0.10 (500 pasos), ZeRO stage 2 y bf16. La normalización min-max reutiliza el `normalization_stats.npy` del modelo base sin cambios (md5 `855296b406a1d16fbc92318564d6152d`), garantizando que la desnormalización de acciones en inferencia coincida con el entrenamiento.

## Capacidades

- Predicción de acciones de brazo robótico en simulación para tareas de manipulación (`pour_balls_into_vase`, `general_pickup`) y de interacción (`play_tic_tac_toe`).
- Generación de trayectorias con restricciones cinemáticas: los movimientos respetan límites de velocidad y jerk derivados de demostraciones expertas.
- Modelado mundo-acción: integra representación visual mediante backbone de vídeo Wan2.2-TI2V-5B.
- Compatibilidad directa con el ecosistema OpenWAM: carga mediante `openwam.deploy.model_loader.load_from_checkpoint_dir`.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo ni modos de razonamiento explícito; es un modelo específico de robótica.

## Casos de uso

- Investigación en modelos mundo-acción: servir como checkpoint de referencia para comparar el efecto del learning rate (5e-5 frente a 1e-4) y del número de pasos (2000 frente a 5000) en el post-entrenamiento sobre el mismo conjunto de datos.
- Evaluación de políticas con restricciones de suavidad: útil en entornos simulados donde se penalizan aceleraciones y jerk elevados, como el control de un brazo `arx_x5` en tareas de vertido de bolas en un jarrón.
- Benchmarking en RoboDojo: permite reproducir y comparar resultados en las tres tareas del conjunto (`play_tic_tac_toe`, `pour_balls_into_vase`, `general_pickup`) con una política entrenada sobre rollouts limpios.
- Generación de datos sintéticos de manipulación: las trayectorias predichas pueden emplearse como datos aumentados para entrenar otras políticas, gracias a su limitación de movimiento que las hace físicamente plausibles.
- Prototipado de pipelines de aprendizaje por imitación: al ser un reemplazo directo del modelo base, se puede integrar en flujos existentes de OpenWAM sin cambiar el código de carga ni el layout de tensores.
- Estudio de la calidad de datos en robótica: el modelo sirve para analizar cómo afecta entrenar solo con episodios "limpios" y con movimiento limitado frente al corpus completo del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 24,8 GB en safetensors, por lo que se requiere al menos esa cantidad de memoria para cargar los pesos en bf16, más el backbone de vídeo Wan2.2-TI2V-5B y el estado del runtime.
- GPU recomendadas: el entrenamiento se realizó en 4× NVIDIA H200; para inferencia se recomienda al menos una GPU de clase数据中心 con 48-80 GB de VRAM (A100 80 GB, H100, H200) para acomodar pesos y backbone.
- GPU de consumo: no se confirma que quepa en RTX 4090 (24 GB) por el tamaño del repositorio; sería necesario cuantizar o descargar componentes por separado, opción no documentada.
- Opciones de despliegue: carga nativa mediante `openwam.deploy.model_loader.load_from_checkpoint_dir`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de robótica de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (lr5e5, step5000) | no disponible | no disponible | Apache 2.0 | Hugging Face | Post-entrenamiento sobre 72 episodios motion-limited |
| OpenWAM/OpenWAM-Alpha-Sim-RoboDojo (base) | no disponible | no disponible | Apache 2.0 | Hugging Face | Corpus RoboDojo completo, 60000 pasos, lr 1e-4 |
| openwam-alpha-robodojo-motion-ttt-pour-pickup-24ep-lr1e4-step5000 | no disponible | no disponible | Apache 2.0 | Hugging Face | Misma receta con lr 1e-4 |
| openwam-alpha-robodojo-motion-ttt-pour-pickup-24ep-lr5e5-step2000 | no disponible | no disponible | Apache 2.0 | Hugging Face | Misma receta con 2000 pasos |

No se dispone de datos de benchmarks ni de parámetros comparables de otras familias de modelos mundo-acción en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: entrenado únicamente para tres tareas de RoboDojo en simulación `arx_x5`; no se espera generalización a otros robots o entornos sin reentrenamiento.
- Conjunto de datos muy reducido: 72 episodios y 29.736 frames, lo que limita la diversidad de situaciones cubiertas y aumenta el riesgo de sobreajuste a las condiciones de grabación.
- Sesgo de selección: solo se usaron episodios "limpios" con éxito al primer intento y movimiento limitado, lo que puede reducir la robustez ante perturbaciones o recuperación de errores.
- Dependencia del backbone externo: requiere descargar y configurar localmente Wan2.2-TI2V-5B; las rutas en `config.yaml` son marcadores de posición (`/path/to/...`) que deben editarse.
- Carga de checkpoint: `load_from_checkpoint_dir` selecciona el `checkpoint_step_*.safetensors` de mayor paso; el repositorio incluye exactamente uno, por lo que debe descargarse en su propio directorio.
- Sin datos públicos de benchmarks, parámetros, contexto ni latencia: no es posible evaluar su rendimiento frente a alternativas sin ejecutar pruebas propias.
- Licencia Apache 2.0 permite uso comercial, pero no se documentan restricciones adicionales sobre el backbone de vídeo subyacente, que puede tener su propia licencia.
- Riesgo de alucinación no aplicable en el sentido textual; en su lugar, existe riesgo de predicciones de acción no físicamente válidas fuera de la distribución de entrenamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/seungkukim/openwam-alpha-robodojo-motion-ttt-pour-pickup-24ep-lr5e5-step5000
- Modelo base: https://huggingface.co/OpenWAM/OpenWAM-Alpha-Sim-RoboDojo
- Dataset de rollouts: https://huggingface.co/datasets/seungkukim/robodojo-motion-rollouts-openwam-hdf5-ttt-pour-pickup-24ep
- Variante lr1e4 step2000: https://huggingface.co/seungkukim/openwam-alpha-robodojo-motion-ttt-pour-pickup-24ep-lr1e4-step2000
- Variante lr1e4 step5000: https://huggingface.co/seungkukim/openwam-alpha-robodojo-motion-ttt-pour-pickup-24ep-lr1e4-step5000
- Variante lr5e5 step2000: https://huggingface.co/seungkukim/openwam-alpha-robodojo-motion-ttt-pour-pickup-24ep-lr5e5-step2000
- Paper OpenWAM: arXiv:2609.07398 (https://arxiv.org/abs/2609.07398)
