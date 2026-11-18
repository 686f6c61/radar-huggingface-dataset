# seungkukim/openwam-alpha-robodojo-motion-ttt-pour-pickup-48ep-lr1e4-step5000

## Resumen

OpenWAM-Alpha RoboDojo (post-entrenado sobre rollouts limitados en movimiento) es un ajuste fino del modelo base OpenWAM/OpenWAM-Alpha-Sim-RoboDojo, desarrollado por el usuario seungkukim. Se trata de un world-action model (WAM) orientado a robótica que combina un backbone de vídeo con un cabezal de acciones para predecir trayectorias de manipulación en simulación. El ajuste se centra en tres tareas del benchmark RoboDojo: `play_tic_tac_toe`, `pour_balls_into_vase` y `general_pickup`.

El modelo parte de la familia OpenWAM, presentada en el paper arXiv:2609.07398, que propone un marco abierto y modular para el preentrenamiento sistemático de world-action models. El repositorio es un reemplazo directo del modelo base: misma estructura de tensores, mismos ficheros auxiliares y misma convención de configuración, solo cambian los pesos. El tamaño del repositorio es de 24,8 GB, coherente con un backbone de vídeo Wan2.2-TI2V-5B más los módulos de acción.

La relevancia de esta variante radica en su receta de post-entrenamiento: datos filtrados por éxito limpio y por límites cinemáticos (velocidad y jerk) tomados de las demostraciones expertas de RoboDojo, con solo 144 episodios y 5.000 pasos de entrenamiento en 4x H200. Es un ejemplo de ajuste eficiente y reproducible para tareas concretas de manipulación robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | World-action model (WAM) con backbone de vídeo Wan2.2-TI2V-5B y cabezal de acciones; detalles completos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, precisión de entrenamiento bf16) |
| Idiomas soportados | no disponible (modelo orientado a robótica, no a texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`checkpoint_step_*.safetensors`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura del base OpenWAM-Alpha-Sim-RoboDojo, un world-action model que emplea un backbone de vídeo Wan2.2-TI2V-5B (referenciado en el `config.yaml` como `model.video_backbone.model_path`) junto con módulos de predicción de acciones. El repositorio mantiene idénticos el layout, los nombres de tensores y los ficheros auxiliares del modelo base, por lo que se puede cargar con `openwam.deploy.model_loader.load_from_checkpoint_dir`.

El post-entrenamiento utilizó el dataset `seungkukim/robodojo-motion-rollouts-openwam-hdf5-ttt-pour-pickup-48ep`: 144 episodios (48 por tarea), 60.697 frames en formato RoboDojo HDF5 sobre simulación arx_x5. Solo se conservaron episodios limpios (éxito en el benchmark y en todos los subobjetivos al primer intento) y limitados en movimiento (velocidad y jerk dentro de los límites de las demostraciones expertas, verificados por episodio). La configuración de entrenamiento usó batch global de 64 (16 x grad_accum 1 x 4 GPU), 5.000 pasos, learning rate 1e-4 con scheduler coseno y warmup del 10 % (500 pasos), ZeRO stage 2, bf16 y sin gradient checkpointing, con un tiempo de pared de 70 minutos y 41 segundos en 4x H200. La normalización min-max reutiliza el `normalization_stats.npy` del modelo base sin cambios (md5 `855296b406a1d16fbc92318564d6152d`), garantizando que la desnormalización de acciones en inferencia coincida exactamente con la del entrenamiento.

## Capacidades

- Predicción de acciones robóticas de manipulación en simulación (arx_x5) para las tareas `play_tic_tac_toe`, `pour_balls_into_vase` y `general_pickup`.
- Modelado de mundo: el backbone de vídeo permite representar la dinámica visual del entorno junto con la predicción de acciones.
- Ejecución de trayectorias dentro de límites cinemáticos de velocidad y jerk, gracias al filtrado de los datos de post-entrenamiento.
- Compatibilidad directa con el ecosistema OpenWAM: carga mediante `load_from_checkpoint_dir` y configuración vía `config.yaml`.
- No se dispone de información sobre soporte de tool calling, agentes multi-paso, capacidades multilingües ni modos de razonamiento explícito; el modelo está orientado a robótica, no a texto conversacional.

## Casos de uso

- Manipulación simulada de recogida de objetos (`general_pickup`): el modelo predice acciones de agarre y traslado en el simulador arx_x5, adecuado porque fue post-entrenado específicamente con episodios limpios de esta tarea.
- Vertido de bolas en un jarrón (`pour_balls_into_vase`): genera trayectorias de vertido respetando límites de velocidad y jerk, lo que reduce movimientos bruscos en el simulador.
- Juego de tres en raya con brazo robótico (`play_tic_tac_toe`): planificación y ejecución de colocación de piezas en posiciones del tablero, útil para validar control de precisión en tareas estructuradas.
- Evaluación de políticas en RoboDojo: sirve como checkpoint de referencia para comparar recetas de post-entrenamiento (24 vs 48 episodios, lr 1e-4 vs 5e-5) dentro del mismo marco.
- Investigación en world-action models: permite estudiar el efecto de datos filtrados por cinemática en la calidad de las trayectorias generadas.
- Prototipado de pipelines de simulación a real: al mantener la interfaz del modelo base, se puede integrar en flujos existentes de OpenWAM y sustituir pesos sin cambiar el código de despliegue.
- Reproducibilidad de experimentos: la configuración documentada (batch, pasos, scheduler, normalización idéntica) facilita replicar el ajuste en otros conjuntos de tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 24,8 GB en safetensors, por lo que se requiere al menos esa cantidad de memoria en precisión de entrenamiento, y menos si se aplica cuantización (no se documentan formatos GGUF).
- GPU recomendadas: el entrenamiento se realizó en 4x NVIDIA H200; para inferencia se desconoce la GPU mínima recomendada.
- ¿Cabe en GPU de consumo? No disponible; con 24,8 GB de pesos, una RTX 4090 (24 GB) queda al límite y probablemente requiera cuantización u offloading, pero no hay datos oficiales.
- Opciones de despliegue: el modelo se carga mediante la librería `openwam` (`openwam.deploy.model_loader.load_from_checkpoint_dir`); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (48 ep, lr 1e-4, step 5000) | no disponible | no disponible | 3 tareas RoboDojo | Apache 2.0 | Hugging Face |
| seungkukim/openwam-alpha-robodojo-motion-ttt-pour-pickup-24ep-lr1e4-step5000 | no disponible | no disponible | mismas tareas, 24 ep/tarea | Apache 2.0 | Hugging Face |
| seungkukim/openwam-alpha-robodojo-motion-ttt-pour-pickup-24ep-lr5e5-step5000 | no disponible | no disponible | mismas tareas, 24 ep/tarea, lr 5e-5 | Apache 2.0 | Hugging Face |
| OpenWAM/OpenWAM-Alpha-Sim-RoboDojo (base) | no disponible | no disponible | corpus RoboDojo completo | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en tres tareas concretas de RoboDojo; su generalización a otras tareas o entornos no está documentada.
- Entrenado exclusivamente en simulación (arx_x5); el rendimiento en transferencia a robots reales no está validado en la información disponible.
- El conjunto de datos es muy reducido (144 episodios, 60.697 frames), lo que puede limitar la robustez ante variaciones no vistas.
- Riesgo de sobreajuste a las condiciones de los rollouts filtrados (éxito limpio y límites cinemáticos), con posible degradación fuera de esas condiciones.
- No se documentan sesgos, comportamiento multilingüe ni capacidades de texto; no debe evaluarse como modelo de lenguaje.
- Las rutas en `config.yaml` son marcadores de posición (`/path/to/...`); es necesario configurar manualmente la ruta local del backbone Wan2.2-TI2V-5B antes de cargar.
- El repositorio contiene un único `checkpoint_step_*.safetensors`; debe descargarse en su propio directorio para que `load_from_checkpoint_dir` lo seleccione correctamente.
- Licencia Apache 2.0 permite uso comercial, pero no se ofrece garantía alguna sobre el rendimiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/seungkukim/openwam-alpha-robodojo-motion-ttt-pour-pickup-48ep-lr1e4-step5000
- Modelo base: https://huggingface.co/OpenWAM/OpenWAM-Alpha-Sim-RoboDojo
- Dataset de entrenamiento: https://huggingface.co/datasets/seungkukim/robodojo-motion-rollouts-openwam-hdf5-ttt-pour-pickup-48ep
- Variante 24 ep / lr 1e-4: https://huggingface.co/seungkukim/openwam-alpha-robodojo-motion-ttt-pour-pickup-24ep-lr1e4-step5000
- Variante 24 ep / lr 5e-5: https://huggingface.co/seungkukim/openwam-alpha-robodojo-motion-ttt-pour-pickup-24ep-lr5e5-step5000
- Paper OpenWAM: arXiv:2609.07398 (https://arxiv.org/abs/2609.07398)
