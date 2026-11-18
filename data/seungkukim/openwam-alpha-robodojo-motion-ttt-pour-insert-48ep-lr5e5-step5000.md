# seungkukim/openwam-alpha-robodojo-motion-ttt-pour-insert-48ep-lr5e5-step5000

## Resumen

OpenWAM-Alpha RoboDojo — post-trained on motion-limited rollouts es un ajuste fino (post-entrenamiento) del modelo base OpenWAM/OpenWAM-Alpha-Sim-RoboDojo, desarrollado por el usuario seungkukim. Se trata de un world-action model (WAM) orientado a robótica que combina un backbone de vídeo (Wan2.2-TI2V-5B, segun la configuracion de carga indicada en la model card) con un cabezal de acciones, y que se utiliza para generar trayectorias de control a partir de observaciones visuales y objetivos de tarea. El modelo está empaquetado con la librería `openwam` y su pipeline declarado es `robotics`.

Este checkpoint concreto se ha reentrenado sobre rollouts "motion-limited" (limitados en velocidad y jerk) de tres tareas del benchmark RoboDojo: `play_tic_tac_toe`, `pour_balls_into_vase` e `insert_tubes`. El conjunto de datos consta de 144 episodios (48 por tarea) y 75.639 fotogramas en formato HDF5 sobre simulación `arx_x5`. La relevancia de esta variante radica en que filtra únicamente episodios limpios (éxito de benchmark y de todos los subobjetivos al primer intento) e impone restricciones cinemáticas derivadas de las demostraciones expertas, lo que produce políticas más suaves y presumiblemente más transferibles a hardware real.

El repositorio es un reemplazo directo del modelo base: misma estructura de directorios, mismos nombres de tensores y mismos ficheros auxiliares, solo cambian los pesos. Ocupa 24,8 GB y se distribuye bajo licencia Apache 2.0. No se dispone de información sobre idiomas soportados ni sobre resultados de benchmarks en la documentación proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | World-action model (WAM) con backbone de vídeo Wan2.2-TI2V-5B y cabezal de acciones; detalles completos no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`checkpoint_step_*.safetensors`), más `config.yaml` y `normalization_stats.npy` |

## Arquitectura y entrenamiento

El modelo se apoya en la arquitectura OpenWAM, un marco modular para preentrenamiento de world-action models descrito en el paper arXiv:2609.07398 (Wang et al., 2026). Segun la model card, el backbone de vídeo es Wan2.2-TI2V-5B, cuya ruta debe configurarse localmente en `model.video_backbone.model_path` antes de cargar el checkpoint. La estructura de tensores y los ficheros auxiliares son idénticos a los del modelo base, por lo que este repositorio funciona como reemplazo directo.

El post-entrenamiento se realizó sobre 144 episodios (48 por tarea) y 75.639 fotogramas de rollouts motion-limited en simulación `arx_x5`, con batch global de 64 (batch_size 16, grad_accum 1, 4 GPUs), 5.000 pasos, learning rate 5e-5 con scheduler coseno y warmup del 10% (500 pasos), ZeRO stage 2 y precisión mixta bf16, sin gradient checkpointing. El entrenamiento se ejecutó en 4x H200 con un tiempo de pared de 76 minutos y 6 segundos. La normalización es min-max y reutiliza sin cambios el `normalization_stats.npy` del modelo base (md5 `855296b406a1d16fbc92318564d6152d`), garantizando que la desnormalización de acciones en inferencia coincida exactamente con la del entrenamiento. No se documenta en la información disponible el uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Generación de acciones robóticas (políticas de control) condicionadas por observación visual y objetivo de tarea, en el marco de un world-action model.
- Ejecución de tareas manipulativas simuladas: `play_tic_tac_toe`, `pour_balls_into_vase` e `insert_tubes`.
- Generación de trayectorias con restricciones cinemáticas: los rollouts de entrenamiento respetan límites de velocidad y jerk derivados de las demostraciones expertas de RoboDojo.
- Modelado de dinámica visual (world model) heredado del backbone Wan2.2-TI2V-5B, segun la configuración de carga indicada.
- Integración con la librería `openwam` mediante `load_from_checkpoint_dir`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso en lenguaje natural: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión general, audio: no disponible (el modelo es específico de robótica).

## Casos de uso

- Manipulación simulada de vertido de bolas en jarrón: el modelo genera la secuencia de acciones para `pour_balls_into_vase` a partir de observaciones, aprovechando que fue ajustado específicamente sobre episodios limpios de esa tarea y con límites de velocidad y jerk que reducen movimientos bruscos.
- Inserción de tubos en entornos simulados: sirve como política para `insert_tubes` en el simulador `arx_x5`, tarea de precisión donde las restricciones cinemáticas del entrenamiento ayudan a evitar colisiones y sobreoscilaciones.
- Investigación en world-action models: permite reproducir y extender el pipeline de OpenWAM con un checkpoint ya post-entrenado, comparando contra el modelo base y contra la variante lr 1e-4 del mismo sweep.
- Evaluación de recetas de post-entrenamiento: al compartir datos con el checkpoint lr 1e-4, facilita estudios controlados sobre el efecto del learning rate (5e-5 frente a 1e-4) en el rendimiento final.
- Generación de datos sintéticos de trayectorias suaves: las políticas resultantes pueden emplearse para producir rollouts con límites cinemáticos, útiles como datos de aumento o para entrenamiento por imitación.
- Despliegue en pipelines de simulación a hardware: dado que el repositorio es un reemplazo directo del modelo base, puede integrarse sin cambios de código en infraestructuras que ya cargan `OpenWAM-Alpha-Sim-RoboDojo`, sustituyendo únicamente los pesos.
- Benchmarking de tareas RoboDojo: útil para medir éxito en `play_tic_tac_toe`, `pour_balls_into_vase` e `insert_tubes` dentro del conjunto de evaluación de RoboDojo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño del repositorio: 24,8 GB, lo que da una cota inferior del espacio en disco necesario para el checkpoint (los pesos en safetensors, presumiblemente en bf16, más ficheros auxiliares).
- VRAM estimada para inferencia: no disponible de forma explícita; el backbone declarado es Wan2.2-TI2V-5B, por lo que se requiere al menos espacio para ese modelo más el cabezal de acciones y las activaciones.
- GPU recomendadas: el entrenamiento se realizó en 4x H200; para inferencia no se especifican GPUs concretas en la información disponible.
- ¿Cabe en GPU de consumo? No disponible. El tamaño del checkpoint (24,8 GB) sugiere que no cabe en GPUs consumer de 8-16 GB sin cuantización, pero no se documentan opciones de cuantización.
- Opciones de despliegue: carga mediante `openwam.deploy.model_loader.load_from_checkpoint_dir`, que selecciona el `checkpoint_step_*.safetensors` de mayor paso en el directorio. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.
- Requisito adicional: es necesario disponer localmente de Wan2.2-TI2V-5B y ajustar `model.video_backbone.model_path` en `config.yaml` (las rutas del fichero son placeholders `/path/to/...`).
- Recomendación de la model card: descargar el checkpoint en su propio directorio, ya que el repositorio incluye exactamente un fichero `checkpoint_step_*.safetensors`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (lr 5e-5, step 5000) | no disponible | no disponible | `play_tic_tac_toe`, `pour_balls_into_vase`, `insert_tubes` | Apache 2.0 | Hugging Face (0 descargas) |
| `seungkukim/openwam-alpha-robodojo-motion-ttt-pour-insert-48ep-lr1e4-step5000` | no disponible | no disponible | mismas tareas, mismo dataset | Apache 2.0 | Hugging Face |
| `seungkukim/openwam-alpha-robodojo-motion-ttt-pour-pickup-48ep-lr5e5-step5000` | no disponible | no disponible | `pour_*` y `pickup`, 48 ep/tarea | Apache 2.0 | Hugging Face |
| `OpenWAM/OpenWAM-Alpha-Sim-RoboDojo` (base) | no disponible | no disponible | corpus RoboDojo completo | no disponible en la información | Hugging Face |

No se dispone de datos de rendimiento comparado (benchmarks) entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: el ajuste se limita a tres tareas de RoboDojo; no se garantiza generalización a otras tareas ni a entornos reales.
- Entrenado en simulación (`arx_x5`): el gap sim-to-real no está cuantificado en la información disponible.
- Dataset pequeño: 144 episodios y 75.639 fotogramas, con filtrado estricto de episodios "limpios", lo que reduce la diversidad de estados visitados y puede aumentar el riesgo de sobreajuste a condiciones ideales.
- Riesgo de alucinación: no aplica en el sentido de texto generado, pero sí existe riesgo de acciones incorrectas o no físicamente plausibles fuera de la distribución de entrenamiento.
- Restricciones cinemáticas: aunque el entrenamiento impone límites de velocidad y jerk, no se documenta que la inferencia los verifique en tiempo de ejecución.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y el backbone Wan2.2-TI2V-5B pueden tener sus propias condiciones que deben revisarse por separado.
- Dependencia de ficheros externos: requiere descargar Wan2.2-TI2V-5B y editar rutas en `config.yaml`; una configuración incorrecta impide la carga.
- Normalización: debe usarse el `normalization_stats.npy` incluido (idéntico al del modelo base); sustituirlo rompería la correspondencia con el entrenamiento.
- Sin métricas publicadas: no hay benchmarks que permitan estimar el rendimiento esperado frente al modelo base.
- Idiomas y sesgos: no disponibles en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/seungkukim/openwam-alpha-robodojo-motion-ttt-pour-insert-48ep-lr5e5-step5000
- Dataset de entrenamiento: https://huggingface.co/datasets/seungkukim/robodojo-motion-rollouts-openwam-hdf5-ttt-pour-insert-48ep
- Modelo base: https://huggingface.co/OpenWAM/OpenWAM-Alpha-Sim-RoboDojo
- Variante lr 1e-4: https://huggingface.co/seungkukim/openwam-alpha-robodojo-motion-ttt-pour-insert-48ep-lr1e4-step5000
- Variante pour-pickup 48ep: https://huggingface.co/seungkukim/openwam-alpha-robodojo-motion-ttt-pour-pickup-48ep-lr5e5-step5000
- Variante pour-pickup 24ep: https://huggingface.co/seungkukim/openwam-alpha-robodojo-motion-ttt-pour-pickup-24ep-lr5e5-step5000
- Paper OpenWAM: arXiv:2609.07398 (https://arxiv.org/abs/2609.07398)
