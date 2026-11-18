# seungkukim/openwam-alpha-robodojo-motion-ttt-pour-insert-24ep-lr1e4-step5000

## Resumen

OpenWAM-Alpha RoboDojo (variante pour-insert, 24 episodios por tarea, lr 1e-4, paso 5000) es un ajuste fino del modelo base OpenWAM/OpenWAM-Alpha-Sim-RoboDojo, desarrollado por el autor seungkukim dentro del ecosistema OpenWAM. Se trata de un world-action model orientado a robótica que combina un modelo de mundo generativo con un cabezal de acciones, y que en esta variante se ha post-entrenado sobre rollouts de agente LLM con restricciones cinemáticas para tres tareas del benchmark RoboDojo: `play_tic_tac_toe`, `pour_balls_into_vase` e `insert_tubes`.

El interés de esta ficha no está en un modelo de lenguaje generalista, sino en una pieza concreta de un pipeline de investigación en robótica: demuestra una receta de post-entrenamiento ligera (95 minutos en 4x H200, 5000 pasos) sobre un modelo base ya preentrenado, manteniendo intactos el layout de tensores, los nombres de parámetros y las estadísticas de normalización. Eso lo convierte en un reemplazo directo (drop-in) del modelo base, útil para experimentar con datos de demostración filtrados por calidad y limitados en velocidad y jerk.

El modelo se distribuye bajo licencia Apache 2.0, con un repositorio de 24,8 GB que contiene un único checkpoint en safetensors, y depende externamente del backbone de vídeo Wan2.2-TI2V-5B para funcionar. No hay información pública sobre benchmarks, idiomas ni parámetros totales en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | World-action model (OpenWAM) sobre backbone de vídeo Wan2.2-TI2V-5B; arquitectura interna detallada no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (checkpoint en safetensors, sin variantes GGUF ni cuantizadas publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`checkpoint_step_*.safetensors`, un único checkpoint) |

## Arquitectura y entrenamiento

El modelo es un post-entrenamiento del base OpenWAM-Alpha-Sim-RoboDojo, que a su vez se apoya en el backbone de vídeo Wan2.2-TI2V-5B (configurable mediante `model.video_backbone.model_path` en `config.yaml`). La arquitectura exacta del world-action model, el número de parámetros y la composición del preentrenamiento original no se detallan en la información disponible. El repositorio mantiene el mismo layout, nombres de tensores y ficheros auxiliares que el modelo base, por lo que actúa como reemplazo directo con pesos distintos.

El ajuste fino se realizó sobre el dataset `robodojo-motion-rollouts-openwam-hdf5-ttt-pour-insert-24ep`, compuesto por 72 episodios (24 por tarea), 37.138 frames en formato HDF5 de RoboDojo y simulación arx_x5. Solo se conservaron episodios "limpios" (éxito en benchmark y en todos los subobjetivos al primer intento) y con movimiento limitado: la trayectoria del brazo respeta límites de velocidad y jerk tomados de las demostraciones expertas de RoboDojo, verificados durante la grabación y revalidados por episodio. La configuración de entrenamiento usa batch global de 64 (16 x grad_accum 1 x 4 GPU), 5000 pasos máximos, warmup ratio 0,10 (500 pasos), learning rate 1e-4 con scheduler coseno y lr_min_ratio 0,01, ZeRO stage 2, bf16 y sin gradient checkpointing, sobre 4x H200 con un tiempo de pared de 95 minutos. La normalización min-max reutiliza el `normalization_stats.npy` del modelo base sin cambios (md5 `855296b406a1d16fbc92318564d6152d`), garantizando que la desnormalización de acciones en inferencia coincida exactamente con la del entrenamiento.

## Capacidades

- Generación de acciones motoras para manipulación robótica en las tareas `play_tic_tac_toe`, `pour_balls_into_vase` e `insert_tubes` del benchmark RoboDojo.
- Modelado de mundo (world model) acoplado a la predicción de acciones, según la denominación del propio proyecto OpenWAM.
- Ejecución de trayectorias con restricciones cinemáticas: el modelo ha sido entrenado con rollouts limitados en velocidad y jerk, lo que favorece movimientos suaves y realistas.
- Integración con el ecosistema de despliegue OpenWAM mediante `openwam.deploy.model_loader.load_from_checkpoint_dir`.
- Compatibilidad drop-in con el modelo base: mismos nombres de tensor y ficheros auxiliares.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en world-action models: servir como punto de partida reproducible para estudiar cómo afecta el filtrado de datos (episodios limpios y limitados en movimiento) al rendimiento de un modelo base ya preentrenado.
- Manipulación robótica simulada en RoboDojo: ejecutar las tareas de verter bolas en un jarrón e insertar tubos en el simulador arx_x5, usando el checkpoint como política entrenada.
- Generación de trayectorias suaves en entornos con límites cinemáticos: el entrenamiento con restricciones de velocidad y jerk lo hace adecuado para escenarios donde los movimientos bruscos están penalizados o son inseguros.
- Comparación de recetas de post-entrenamiento: al existir variantes hermanas con 48 episodios y learning rates 1e-4 / 5e-5, permite aislar el efecto del volumen de datos y de la tasa de aprendizaje manteniendo el resto de la configuración.
- Base para ajuste fino en tareas adicionales: al ser un reemplazo directo del modelo base, se puede reutilizar como inicialización para nuevos conjuntos de tareas sin reescribir el pipeline de carga.
- Validación de pipelines de despliegue OpenWAM: útil para probar `load_from_checkpoint_dir`, la resolución del checkpoint más alto y la configuración del backbone Wan2.2 en un entorno controlado antes de escalar a otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 24,8 GB en safetensors, lo que da una cota inferior del espacio en disco necesaria; la VRAM dependerá del backbone Wan2.2-TI2V-5B y de la precisión usada.
- GPU recomendadas: el entrenamiento se realizó en 4x H200 con bf16 y ZeRO stage 2, lo que sugiere que la inferencia requiere GPUs de centro de datos con memoria amplia (H200, H100, A100 80 GB como referencias plausibles, aunque no confirmadas).
- ¿Cabe en GPU de consumo? No disponible; no se documenta soporte para RTX 4090 u otras GPU consumer.
- Opciones de despliegue: el loader oficial es `openwam.deploy.model_loader.load_from_checkpoint_dir` de la librería `openwam`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| openwam-alpha-robodojo-motion-ttt-pour-insert-24ep-lr1e4-step5000 (este) | no disponible | no disponible | 3 tareas RoboDojo, 24 ep/tarea, lr 1e-4 | Apache 2.0 | Hugging Face |
| openwam-alpha-robodojo-motion-ttt-pour-insert-48ep-lr1e4-step5000 | no disponible | no disponible | mismas tareas, 48 ep/tarea, lr 1e-4 | Apache 2.0 | Hugging Face |
| openwam-alpha-robodojo-motion-ttt-pour-insert-48ep-lr5e5-step5000 | no disponible | no disponible | mismas tareas, 48 ep/tarea, lr 5e-5 | Apache 2.0 | Hugging Face |
| OpenWAM/OpenWAM-Alpha-Sim-RoboDojo (base) | no disponible | no disponible | corpus RoboDojo, 60.000 pasos | Apache 2.0 (según este repo) | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en tres tareas concretas de RoboDojo; no es un modelo generalista y su uso fuera de ese dominio no está validado.
- El entrenamiento se hizo sobre solo 72 episodios y 5000 pasos; el riesgo de sobreajuste a las condiciones de simulación arx_x5 es alto.
- No se documentan sesgos, evaluación de robustez ni pruebas fuera de distribución.
- Riesgo de alucinación en el sentido de world model: las predicciones del modelo de mundo pueden divergir de la dinámica real; no hay métricas publicadas que lo cuantifiquen.
- Dependencia externa del backbone Wan2.2-TI2V-5B, que debe descargarse y configurarse manualmente; las rutas en `config.yaml` son placeholders (`/path/to/...`).
- El checkpoint debe descargarse en su propio directorio, ya que `load_from_checkpoint_dir` selecciona el `checkpoint_step_*.safetensors` más alto y este repo solo incluye uno.
- Licencia Apache 2.0 permite uso comercial, pero no se aportan garantías ni evaluación de seguridad para despliegue en robots reales.
- No hay información sobre idiomas soportados ni sobre comportamiento multilingüe.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/seungkukim/openwam-alpha-robodojo-motion-ttt-pour-insert-24ep-lr1e4-step5000
- Modelo base: https://huggingface.co/OpenWAM/OpenWAM-Alpha-Sim-RoboDojo
- Dataset de entrenamiento: https://huggingface.co/datasets/seungkukim/robodojo-motion-rollouts-openwam-hdf5-ttt-pour-insert-24ep
- Variante 48ep lr1e4: https://huggingface.co/seungkukim/openwam-alpha-robodojo-motion-ttt-pour-insert-48ep-lr1e4-step5000
- Variante 48ep lr5e5: https://huggingface.co/seungkukim/openwam-alpha-robodojo-motion-ttt-pour-insert-48ep-lr5e5-step5000
- Variante pour-pickup 24ep lr1e4: https://huggingface.co/seungkukim/openwam-alpha-robodojo-motion-ttt-pour-pickup-24ep-lr1e4-step5000
- Variante pour-pickup 24ep lr5e5: https://huggingface.co/seungkukim/openwam-alpha-robodojo-motion-ttt-pour-pickup-24ep-lr5e5-step5000
- Paper OpenWAM: arXiv:2609.07398 (https://arxiv.org/abs/2609.07398)
